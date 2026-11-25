# tools/ink: paper, ink, stone and light, in code

A Python library and CLI that renders shots as frame sequences from still plates, cut-out elements, video elements
and typeset text. Everything is driven by time in seconds on the song clock, everything is seeded, and every frame
can be rendered on its own (workers render frames in any order).

```
PY=/home/jade/Documents/halys-video/.venv/bin/python        # run from the repo root
$PY -m tools.ink.run shots/H03.py --t0 52.0 --t1 58.5 --size 960x540 --out media/comp/H03.mp4 --audio
$PY -m tools.ink.run shots/H03.py --still 54.2 --size 1920x1080 --out work/H03_54.2.png
$PY -m tools.ink.qa coverage media/comp/H03.mp4 --ground paper --budget 65
$PY -m tools.ink.qa squint   media/comp/H03.mp4 --out work/H03_squint.png
```

## The model in one minute

Images are float32 numpy arrays, sRGB-encoded, 0..1. Three kinds of picture data:

| Kind | Shape | Meaning | Laid with |
|---|---|---|---|
| frame | HxWx3 | an opaque picture (the sheet with everything on it) | |
| ink | HxWx3 | **transmittance**: 1 = bare paper, <1 = ink or wash absorbing light | `frame *= T` / `lay_ink(frame, T, x, y)` |
| rgba | HxWx4 | opaque pigment (seal paste, gold, gouache, leather), straight alpha | `over(frame, rgba, x, y)` |

Ink is multiplied onto the sheet, so elements made separately sit on ONE sheet with no rectangle and no halo, and
overlapping washes darken the way ink does. A density map (HxW, 0..~1.3) becomes an ink layer with
`ink_T(density)` (carbon ink) or `ink_T(density, tint=CINNABAR)` (a coloured wash). Colours: `CINNABAR, INDIGO,
OCHRE, GOLD, MALACHITE`.

Effects that unfold in time are stored as a final picture plus an **arrival map**, so the picture at any time is
closed-form. There is no simulation state to carry from frame to frame.

Shots are authored in 1920x1080 pixels. The runner renders at that size and area-scales to `--size`, so the 540p
preview is the master, smaller.

## A shot script

```python
# shots/H03.py
from tools.ink import *
T0, T1 = 52.0, 58.5                      # default range on the song clock

def setup(ctx):                          # once, before the workers fork: build papers, key plates, precompute
    global P, BL, SP
    P = Paper(ctx.W, ctx.H, 'new', seed=4)
    BL = bloom(place(key_paper(load_image('media/plates/mountain.png')), ctx.W, ctx.H, 80, 300), seed=1)
    SP = splash((1200, 560), size=320, direction=20, seed=7, paper=P)

def render(t, ctx):                      # any t, any order -> float32 RGB, ctx.W x ctx.H
    f = P.frame(t)
    f *= BL.T(ramp(t, 52.0, 55.0, 'linear') * 1.3)
    hit = ctx.timing.hits('gong', 55.0, 58.5)
    if hit:
        SP.draw(f, t - hit[0]['t'])
    return f
```

`ctx`: `W, H, size, s` (W/1920), `t0, t1`, `timing` (a `Timing`), `seed`, `root`, `cache(key, fn, deps)` (disk cache
for slow precomputation). Instead of `render` a script may define `build(ctx)` returning an object with
`.render(t)`: see `tools/ink/shot.py` for the declarative layer list (`Shot.ink / rgba / draw / fx / scene`).

Rules for shot scripts:
- No GPU and no `cv2.setNumThreads` inside `render`. GPU work goes in `setup` through `ctx.cache` (workers are
  forked and must only see numpy).
- `render` must not depend on having rendered the previous frame.

## core.py

| Function | Meaning |
|---|---|
| `load_image(path, size=None, alpha=False)`, `load_mask(path)`, `save_image(path, img)` | file I/O, float sRGB |
| `rng(seed, *keys)` | the only source of randomness: a numpy Generator from a seed and any keys |
| `ease(u, kind)`, `ramp(t, t0, t1, kind)` | easing (`linear in out inout sine expo_out back_out settle`) |
| `smoothstep, lerp, clamp, luma, blur(img, sigma), resize(img, w, h)` | small maths |
| `value_noise(h, w, cell, seed, *keys)`, `fbm(...)`, `grain(...)` | seeded noise; halving size and cell gives the same field |
| `ink_T(density, tint=None)`, `density_of(T)` | density <-> transmittance (Beer-Lambert) |
| `lay_ink(frame, T, x, y, opacity)`, `over(frame, rgba, x, y, opacity)` | lay a layer on a frame in place, clipped |
| `place(layer, W, H, x, y)` | put a small layer on a full canvas of its empty value |
| `transform(layer, scale, angle, tx, ty, out_size)` | scale/rotate/translate with mip filtering |
| `rough_mask(mask, amount, cell, seed)` | make a hard edge irregular |
| `contact_strip(frames, cols)`, `frame_of(t)` | review sheet; the timing map's frame rule `ceil(t*24)` |

## 1. Paper (`paper.py`)

```python
p = Paper(1920, 1080, 'new', seed=3)                 # 1988: cream xuan, fibres, mottling, laid lines
p = Paper(1920, 1080, 'aged', seed=3, gutter=960)    # 2026: toned, foxed, tide lines, gutter and corners worn
p = Paper(1920, 1080, 'rubbing', seed=3)             # the inked black of a 拓片: pad dabs, pinholes, creases
p = Paper(1920, 1080, 'night', seed=3)               # a night ground: dark indigo-ink wash, fibres just visible
f = p.frame(t)                                       # a fresh copy to draw on
```
- `Paper(w, h, variant, seed, scale=1.0, gutter=None, breathe=0.0, deckle=False)`. Attributes: `rgb`, `height`
  (fibre relief, used by ink for granulation and dry brush), `wear` (0..1, where time took the picture away),
  `ground` (median colour). Any size; the texture is built once, so it never boils. `breathe` > 0 lets the fine
  grain shift over a 9 s period (a fraction of a percent). `scale=2` makes fibres twice as large (a closer sheet).
- `aged_ink(T, paper, strength=0.8)`: fade a plate where the paper is worn. Time adds white.
- `deckle_mask(h, w, seed)`: alpha of a sheet with a feathered deckle edge.
- **Keying** `key_paper(img, ground=None, lo=0.035, hi=0.13, feather=0.04, gain=1.0, neutral=1.0)` -> ink layer.
  Estimates the source paper (most common border tone, followed across vignetting), divides it out per channel
  (hue of coloured washes is kept), drops source-paper texture below `lo`, and fades to bare paper at the image
  border. `neutral` keeps grey ink grey when the source ground is strongly toned (old silk).
  `key_dark(img)` -> RGBA for light things on a dark ground (mist). `ink_to_rgba(T, colour=None)` to put ink on a
  non-paper ground. `estimate_ground(img, dark=False)` -> (colour, field).

```python
T = key_paper(load_image('media/el/monkey_v3.png'), gain=1.2)      # generated "on cream paper"
lay_ink(frame, T, 700, 380)                                        # now it is on our sheet
```
Limits: the source ground must be plain and cover most of the image border. Pale washes close to the source paper
tone (density < `lo`) are lost; lower `lo` for very pale plates. White gouache on paper cannot be keyed this way
(it is lighter than the ground): matte it and use rgba.

## 2. Multiplane camera (`camera.py`)

```python
sc = Scene(4400, 2000, paper=Paper(4400, 2000, 'new', seed=11))
sc.add(T_far, depth=4.0)                                # ink layers, canvas-sized or placed with pos=(x, y)
sc.mist(900, 1180, depth=3.2, drift=-9, seed=1)         # a band of BARE PAPER between planes, drifting 9 px/s left
sc.add(T_near, depth=1.0, occlude=True)                 # near rock hides what is behind it
cam = Camera([(0, 2200, 1000, 0.44), (4, 3300, 1250, 1.0), (9, 1100, 1150, 1.0, 'sine')])   # (t, cx, cy, zoom[, ease])
frame = sc.render(t, cam, ctx.size)
```
- `Camera(keys, ease_kind='inout')`; helpers `Camera.push_in(t0, t1, start, end)`, `Camera.pull_back(...)`,
  `Camera.travel(t0, t1, x_from, x_to, cy, zoom)` (right to left: `x_from > x_to`), `Camera.hold(cx, cy, zoom)`,
  `.shake(t_hit, amp, dur)` (a seal landing). Zoom is interpolated in log space and position follows it, so a push
  holds its target on a straight line. zoom 1.0 = one canvas px per frame px at 1920 wide.
- `Scene.add(src, depth=1.0, pos=(0, 0), kind=None, occlude=False, opacity=1.0, name=None, scale=1.0)`. `src` is an
  array or a callable `t -> array` (give `kind='ink'|'rgba'|'frame'`). Depth 1.0 is the paper plane; >1 is farther
  (moves and grows more slowly), <1 nearer. `occlude` makes an ink layer hide what is behind it (True, a 0..1
  strength, or an explicit HxW body mask).
- `Scene.mist(y0, y1, depth, drift, opacity, seed, softness, wisp)`: mist is an opacity mask of bare paper, never
  grey. It loops seamlessly as it drifts.
- `Scene.to_frame(x, y, cam.at(t), size)`: canvas point -> frame px, for overlays that must track the page.
- Resampling: mip pyramid with trilinear blending when shrinking, cubic at 1:1 and above. Fine brush lines do not
  shimmer under slow moves.

Limits: make the canvas big enough that the tightest zoom is about 1:1 (zoom above ~1.5 softens). Parallax is
affine per layer: no perspective tilt.

## 3. Ink dynamics (`ink.py`)

```python
d = wash(mask, paper.height, seed=2, density=0.3, bleed=12, edge=0.5)   # any mask -> ink soaked into xuan
st = stroke([(180, 420, 0.6), (520, 250, 1.3), (1420, 300, 0.9), (1790, 380, 0.4)], width=84, seed=4, paper=p,
            dry=0.15, dry_end=0.95)                                      # (x, y, pressure) along a spline
st.lay(frame, ramp(t, 10.0, 11.2, 'sine'))                               # drawn from first point to last
sp = splash((1010, 600), size=330, direction=24, seed=12, into=mask, into_pos=(600, 170), paper=p)
sp.draw(frame, t - t_hit)                                                # flies, lands, bleeds, resolves into the mask
bl = bloom(T_plate, seed=5, order='dark')                                # a plate painting itself
frame *= bl.T(ramp(t, 8.0, 11.5, 'linear') * 1.3)                        # ... and bl.dissolve(q) to take it back
frame *= dissolve(T, q, seed=2)                                          # any layer fading back to bare paper
frame *= hairline(W, H, t, seed=1, y=0.56, angle=-2.5, drift=(4, -9), length=0.62, draw=p)
```
- `wash(mask, paper_h, seed, density, bleed, edge, granulate, pool, feather)` -> density. Irregular fibre-led edge,
  capillary feathering, wet-edge darkening, pooling, pigment settling into the paper's valleys.
- `stroke(points, width, seed, paper, density, dry, dry_end, taper, tint, bleed, speed)` -> `InkAnim`. Pressure
  varies the width; the brush is pressed in (round head) and lifted out (point); 飞白 appears where `dry` is high,
  toward `dry_end`, at the edges of the brush and where the paper is high. `InkAnim.density(p) / .T(p, size) /
  .lay(frame, p) / .reversed()`.
- `splash(impact, size, direction, seed, into=None, into_pos, paper, density, tint, fly, resolve, remain,
  fingers, droplets, figure_density)` -> `Splash` with `.draw(frame, dt)`, `.density(dt)`, `.T(dt, size)`. Without
  `into` it is a plain 泼墨 throw. With `into` the burst gathers into the silhouette over `resolve` seconds and the
  excess dries to a pale rimmed stain (`remain`).
- `bloom(T, seed, order='dark'|'light'|'radial'|order_map, noise, soft)` -> `Bloom` with `.T(p)`, `.dissolve(q)`.
- `hairline(W, H, t, ...)` is analytic and sub-pixel exact.
- `compose(anims, size)` sums strokes into one density map; `brush_monkey(size, seed)` and
  `stock.brush_mountain(w, h, seed, paper)`, `stock.test_plate(width)` are stand-in art for tests and animatics.

Limits: the splash is a shaped arrival model (radial flood, then square-root-of-time capillary creep), not a fluid
solver: it does not react to other ink already on the sheet. A stroke that crosses itself overwrites the earlier
arrival time at the crossing.

## Timing (`timing.py`)

```python
tm = ctx.timing                                   # analysis/timing.json, or the synthetic stub if absent
tm.hits('gong', 52, 72)                           # [{'t', 'kind', 'strength', ...}]; kind is a substring match
tm.hit_times(['chop', 'cymbal'], 52, 72); tm.since_hit(t, 'gong'); tm.last_hit(t, 'gong')
tm.beat_phase(t); tm.bar_phase(t); tm.beat_index(t); tm.nearest_beat(t); tm.beats_in(t0, t1, sub=2); tm.bpm(t)
tm.word('He bowed four ways', 'four')             # (start, end); tm.words(line) -> [(word, start, end)]
tm.section('Hook'); tm.section_at(t); tm.energy(t); tm.is_stub
```
The loader accepts the halys-video schema and plain variants (lists of floats for beats, `hits` or `events`, `lines`
or `lyrics`, word key `w`/`word`/`text`). If `analysis/timing.json` is missing it writes and uses
`work/ink_demo/timing_stub.json` (synthetic, 100 BPM). When the real map lands, check that the hit `kind` names
the shots ask for exist (`{e['kind'] for e in tm.hits()}`).

## 13. QA (`qa.py`)

```
$PY -m tools.ink.qa coverage <video|frames dir|image> --ground paper|night --budget 15 [--every 0.5] [--thr 0.07] [--sheet s.jpg] [--json r.json]
$PY -m tools.ink.qa squint   <video|frames dir|image> [--width 32] [--every 0.5] --out strip.png
```
`coverage` prints the share of pixels differing from the ground per sampled frame and exits 1 if any frame is more
than ten points over the budget. The ground is estimated from each frame (most common border tone, followed across
lighting), so lit pages and night grounds work without naming the paper colour; fibres and grain are below the
threshold. `--sheet` writes each sampled frame beside its mark mask. `squint` writes the 32 px contact strip and
prints where the mark mass sits and how much of it is in one quadrant. As functions: `qa.coverage(frame, ground)`,
`qa.mark_mask`, `qa.squint`, `qa.mass_report`.

Limit: a frame whose border is mostly marks (a full-bleed hook frame) has no reliable ground; coverage then reads low.
Check those by eye on the sheet.

## 14. Runner (`run.py`)

```
$PY -m tools.ink.run SHOT.py [--t0 s --t1 s] [--size 960x540] [--out x.mp4|x.mov] [--frames DIR] [--still t]
                     [--jobs N] [--audio [wav]] [--crf 16] [--internal 1920x1080] [--fresh] [--no-keep]
```
- Frame rule: `f0 = ceil(t0*24)`, `n = ceil(t1*24) - f0`, frame k at `t = (f0+k)/24`: the timing map's rule, so a
  shot cut on anchors has the frame count `tools/edit/assemble.py` expects.
- Output: H.264 High, yuv420p, BT.709 limited, tagged, 24 fps CFR, GOP 48, timescale 12288: the same flags as
  `assemble.py`, so the file drops in as a `video` pick (`{"kind": "video", "src": "media/comp/H03.mp4"}`).
  `.mov` gives ProRes 422 HQ. `--frames DIR` writes `f_<frame24>.png`. The encoded frame count is verified.
- Workers (default 12, forked after `setup`) write PNGs to `work/ink/<shot>/<WxH>_<key>/`; an interrupted run
  resumes. The key covers the shot file, the shared shot helpers, the engine source, sizes, seed, the timing file
  and `ctx.opts`.
- `--opt key=value` (repeatable) fills `ctx.opts` (`tools/ink/opts.py`). `lyrics` is the one switch for per-shot
  lyric text (env `INK_LYRICS`, **default off**: the film's lyric layer is drawn at assembly by `tools/cut/lyrics.py`).
  Shots read it with `tools.ink.opts.lyrics_on(ctx)`. Art inscriptions (一通百通, seals, ledger, cliff) never use it.
- `--audio` muxes the song slice (`inputs/*.wav`, or the script's `AUDIO`) for review.
- As a function: `tools.ink.run.run(shot, t0, t1, size, out=..., jobs=...)` -> dict with `frames, fps, out`.

All public names are importable from `tools.ink` (`from tools.ink import *`). Section numbers follow the build brief.

## 4. Seal strike (`tools/ink/seal.py`)

| Call | Meaning |
|---|---|
| `seal(text, font, size=200, style='zhu'\|'bai', wear=0.3, seed=0, shape='square'\|'tall', colour=CINNABAR, weight=0)` -> RGBA | An impression of 1-4 characters (columns right to left). `zhu` 朱文: red characters + border; `bai` 白文: red block, characters bare. `wear` chips the rim and starves the paste. Result is `size + 2*pad` px square (pad = 12 %). |
| `strike(frame, seal_rgba, t, t_hit, pos, scale=1, angle=0, overshoot=0.14, dent=1, ink=1, lead=2, opacity=1)` | Slam, centred on `pos`: stone shadow gathers for `lead` frames, lands oversize, recoils, rests on frame 3; a dent shadow settles over ~0.4 s. After that the seal just stays. In place. |
| `echoes(frame, seal_rgba, t, [(t_hit, (x, y)), ...], decay=0.6, seed=0, first=1, jitter=2.5)` | The same seal pressed again without re-inking: impression k carries `first * decay**k` of the paste; the same starved patches grow each time. |
| `fade(seal_rgba, ink, seed=0)` -> RGBA | One depleted impression (what `echoes` uses). |
| `Luogu(hits, font, size=150, region=(x0,y0,x1,y1) \| positions=[...], chars=LUOGU, style='bai', life=None).draw(frame, t)` | 锣鼓经 syllables stamped on hits. `hits` = `Timing.hits(...)` dicts or `(t, kind_or_char)`. Default map: gong 仓, cymbal 才, small 台, clapper 扎, drum 大, chop 七 (falls back to 倉 in traditional-only fonts). `.hit_times()` for shakes. |
| `shake_args(t_hit, amp=7, dur=0.22, seed=0)` | `cam.shake(*shake_args(t_hit))`. |
| `shake_offset(t, t_hit_or_list, amp=7, dur=0.22)` -> `(dx, dy)`; `shaken(frame, dx, dy)` | The same shake for shots with no Camera. |
| `has_glyph(ch, font)`, `glyph(ch, font, px)`, `seal_mask(...)` | Font check, one glyph mask, the un-inked carved face. |

```python
NAME = seal('悟空', 'refs/fonts/chongxi-seal/崇羲篆体.otf', 230, 'zhu', wear=0.3, seed=1)     # in setup()
def render(t, ctx):
    f = BASE.copy()
    strike(f, NAME, t, T_HIT, (1640, 520))
    echoes(f, BAI, t, [(th, (1560 - 235 * k, 880)) for k, th in enumerate(CHOPS)], decay=0.66, seed=7)
    return shaken(f, *shake_offset(t, [T_HIT]))
```
Demo: `tools/ink/demos/d04_seal.py` -> `work/ink_demo/d04_seal.mp4`, stills `work/ink_demo/stills/d04_seal_*.png`.
Cost at 1920x1080, one thread: build 17 ms per seal (do it in setup), strike 5 ms resting / 12 ms on the hit frames.
Limits: the impression "scales" for 3 frames (a stylised slam, not physics); the dent is a rectangle around the
seal's bounding box; 2-character square seals do not stretch to fill the face completely; `fade` caches by array
identity, so keep the seal array alive (module global) rather than rebuilding it per frame.

## 5. Rubbing flip 拓片 (`tools/ink/rubbing.py`)

| Call | Meaning |
|---|---|
| `Rubbing(w, h, seed=0, scale=1, bare=(.87,.85,.79), ground=None)` | Builds the dabbed black ground, the bare-paper tone and the pad "tooth" once (0.6 s). |
| `.apply(frame, paper=None, is_ink=False, lo=0.10, hi=0.42, amount=1)` -> frame | The rubbing: marks become bare paper, ground becomes black. Pass `paper=Paper.rgb` (the sheet the frame was painted on) so paper texture is not read as marks; `is_ink=True` if `frame` is a transmittance layer. |
| `.mask(frame, paper, is_ink)` | Just the 0..1 mark mask. |
| `rubbing(frame, paper=None, seed=0, is_ink=False)` | One-call form; caches the `Rubbing` per (size, seed). |
| `flip_on(t, times, hold=2/24, mode='hold'\|'toggle')` -> bool | Flipped for `hold` s after each chop, or toggling on each. |

```python
RB = Rubbing(ctx.W, ctx.H, seed=4)                                   # setup()
frame = RB.apply(frame, P.rgb) if flip_on(t, CHOPS, hold=2 / 24) else frame
```
Demo: `d05_rubbing.py` -> `work/ink_demo/d05_rubbing.mp4`, still `d05_rubbing_54.82.png`. Cost: 90 ms per flipped
frame, one thread. Limits: every mark goes white whatever its colour (a cinnabar seal reads as a carved seal);
pale washes (< ~10 % density) drop out, as they would in a real rubbing; lit/night frames need `paper=` set to
their own ground or the mask is wrong.

## 6. Woodblock mis-registration, paper-cut, torn sheet (`tools/ink/woodblock.py`)

The module is `woodblock.py`, not `print.py`: a submodule called `print` shadows the builtin for anyone doing
`from tools.ink import *`.

| Call | Meaning |
|---|---|
| `separate(frame, paper, n=3, palette=None, fast=True)` -> `(blocks, names)` | Non-negative unmixing in absorbance space into ink key block, cinnabar, indigo, ochre (first n). `fast` unmixes colour at half size and solves the key block at full size. |
| `reprint(blocks, names, paper, offsets=None, angles=None, texture=1, squash=0.5, seed=0)` -> frame | Prints the blocks back with per-block offset/rotation, wood grain, starved patches, squashed rims. |
| `misregister(frame, t, beat_times, amount=4, paper=None, seed=0, n=3, split=0.4, hold=None, rot=0.12, blocks=None)` -> frame | Separate + reprint with offsets that jump on every time in `beat_times` (same beat, same offsets). `split`: share of the black key block also carried by the colour blocks, so pure ink shows red/indigo fringes. `blocks=separate(...)` for a still frame (skips the unmix). `hold`: seconds out of register after each beat. |
| `block_offsets(key, n, amount, rot, seed)`, `beat_key(t, times)` | The offsets for a beat index; the beat index. |
| `papercut(frame, n=7, axis='h'\|'v', amount=50, key=0, seed=0, under=None, shadow=0.4, offsets=None, gap=2, wobble=3)` -> frame | Knife-cut strips slid out of register (cuts fixed by `seed`, slides re-dealt by `key`), white cut edge, small shadow, `under` showing in gaps. |
| `torn(frame, seed=0, offset=(12,-8), angle=1, direction='v', pos=0.5, wander=0.1, under=None, fibre=11, shadow=0.45, paste=0.5, amount=1)` -> frame | Torn in two and re-pasted off-register: feathered white fibre edge, shadow, paste stain. |

```python
frame = misregister(frame, t, tm.beats_in(t0, t1, sub=2), amount=6, paper=P.rgb, seed=3)
frame = papercut(frame, n=8, amount=90, key=beat_key(t, tm.beats), under=BACK)
frame = torn(frame, seed=2, offset=(26, -15), angle=1.6, under=BACK)
```
Demo: `d06_print.py` -> `work/ink_demo/d06_print.mp4`, stills `d06_print_56.9.png` (mis-registration),
`_58.6.png` (paper-cut), `_61.0.png` (torn). Cost at 1920x1080, one thread: `separate` 230 ms (650 ms exact),
`misregister` about 360 ms, `papercut` 180 ms, `torn` 230 ms; the demo runs at 7 fps with 4 workers.
Limits: with n=3 ochre areas print as thin cinnabar (use n=4 when the plate has ochre); `fast` separation can
misassign single pixels on colour edges (mean error 0.25 %); the whole frame is reprinted, so use it on the page
before lighting, not on a lit room; one tear per call (call twice for three pieces); strips slide rigidly, they
do not curl.

## 7. Carved cliff text 摩崖石刻 (`tools/ink/cliff.py`)

Real typeset characters cut into a painted rock plate and lit by a moving raking light. Nothing glows: characters
read because the cuts fill with cast shadow and the wall facing the light brightens; the plate's own painting stays.

```python
from tools.ink.cliff import Cliff, rock_plate, silhouette_child, coverage
rock = rock_plate(1920, 1080, seed=4)                  # stand-in; normally load_image('plates/cliff.png')
text = ''.join(open('design/text/qianziwen.txt').read().split('\n')[:160])
c = Cliff(rock, text, 'refs/fonts/chongxi-seal/崇羲篆体.otf', size=112, region=(90, 60, 1740, 960),
          weather=0.25, moss=0.3, uncarved=silhouette_child(1920, 1080, 1180, 930, 360), seed=2)   # in setup()
frame = c.render(light=(200 - 12 * t, 9), fill=0.5)                        # per frame
frame = c.render(light=(200, 11, 0.8), fill=0.5, gold=ramp(t, 60.0, 63.0, 'sine'))   # gold happens once
scene.add(c.layer(lambda t: (200 - 12 * t, 9), fill=0.5), kind='frame', depth=1.0)   # in a multiplane Scene
```

| Call | Meaning |
|---|---|
| `rock_plate(w, h, seed, tone=0.26, direction=62, strokes=1, moss=0.25, warm=0.5, fade_top=0, paper=None)` | Procedural painted rock (grey washes, axe-cut strokes, cracks, ochre/moss) as RGB. `fade_top` fades the rock upward into bare paper (bridge). |
| `Cliff(rock, text, font, size=120, region, col_gap=0.3, row_gap=0.12, rows, cut='v'|'flat', depth=1, weather=0.15, moss, uncarved, uncarved_mode='skip'|'clip', presence=None|'auto'|map, quad, plane_size, jitter=0.03, seed)` | Precompute. Vertical columns right to left; `\n` forces a new column. `weather` (0..1 or map) = age: shallower, rounder, broken strokes. `uncarved` = mask where nothing is cut. `presence` fades the carving out (`'auto'`: where the plate has no paint). `quad` = 4 rock-space points (TL, TR, BR, BL) for a cliff plane in perspective; lay out on `plane_size`. Missing glyphs are skipped and listed in `.missing`; `.cells` lists what was carved. |
| `c.render(light, fill=0, gold=None, t=0, ambient=0.5, warmth=0.5, pool=None, fill_colour, gold_colour, gold_stagger=0.55, gold_order='rtl'|'center'|'random')` | One RGB frame. `light` = `(az, el[, intensity])` degrees or a callable of `t`; az is where the light comes FROM (0 right, 90 below, 180 left, 270 above). el 5-15 = raking (deep shadow, bright wall); 60+ = flat. `fill` = cinnabar left in the cuts (patchy, pooled in the floor). `gold` = progress 0..1 of gold running UP each column, columns staggered. `pool=(x, y, r)` or a map = a pool of light (flashlight); outside it the rock sits at `ambient`. |
| `c.layer(light, fill, gold, **kw)` | Callable `t -> frame` for `Scene.add(..., kind='frame')`; each argument may be a value or callable of t. |
| `c.gold_mask(progress)`, `c.char_box(i)`, `c.depth`, `c.cut` | Gold alpha; plane box of the i-th character (for framing); cut depth (px) and cut mask. |
| `coverage(text, font)`, `has_glyph(font, ch)`, `column_layout(...)`, `silhouette_child(...)` | Glyph coverage check; layout only; a test silhouette. |

Scale levels are just `size`: ~900 px = one character with chisel facets and a ragged lit arris; ~110 px = columns;
~30 px (with `quad`) = far texture (shadows are skipped automatically when the cuts are shallower than a pixel).

Performance at 1920x1080 (one core): build 0.3-1 s (+1.1 s for `rock_plate`); render 55-70 ms/frame, ~140 ms with
gold. A 3000 px wide scroll costs proportionally more; render once per frame and let the Scene crop it.

Limits: the stand-in `rock_plate` is busy and should be replaced by generated plates; lighting is screen-space
(perspective planes are shaded after the warp, so foreshortened cuts are slightly too shallow); the shadow march is
capped at half a character, so el < 4 deg on a one-character close-up under-shadows; `Cliff` is small seal only as
far as the font goes (7 千字文 characters are missing from Chong Xi: lines 1-160 are safe); gold on small characters
reads flatter than on large ones.

## 8. Margins (`tools/ink/margins.py`)

The verse-3 move: paper margins step in on cues while the picture drains to greys except gold.

- `Margins(paper, seed=0, rough=5.0, shadow=0.30, shadow_px=9.0, light=225.0)`: four sheets of real paper (a `Paper` of
  the frame size) with torn edges, a pale lip and a contact shadow on the picture. Build once in `setup()`.
  - `.apply(frame, t, cues, target, full=None, slide=0.125, desat=1.0, protect_hue=(28, 60), steps=None)`: the whole
    move. Each cue advances the picture rect one step from `full` (default: just outside the frame) toward
    `target=(x0, y0, x1, y1)` with an eased 3-frame slide, then holds; grey amount follows the same progress.
  - `.lay(frame, rect)`: only the sheets, at an explicit rect.
- `step_rect(t, cues, target, full, slide=0.125, kind='out', steps=None) -> (rect, progress)`.
- `desaturate(frame, amount, protect_hue=(28, 60), protect_sat=(0.30, 0.50), soft=10, paper=None)`: greys except a
  protected hue range. The key needs saturation, so cream paper is not "gold". `paper=` an RGB keeps bare paper
  the colour of the sheet instead of cement.
- `margins(frame, t, cues, paper, target, seed=0, **kw)`: one-call form (rebuilds edges each call; slow).

```python
def setup(ctx):
    global M, CUES
    M = Margins(Paper(ctx.W, ctx.H, 'new', seed=77), seed=5)
    CUES = [ctx.timing.word('be good', '听话', k)[0] for k in (1, 2, 3)]      # or beats_in(...)
def render(t, ctx):
    return M.apply(picture(t), t, CUES, target=(250, 452, 1670, 628))        # a strip ~15% of the frame
```
Speed at 1080p, one core, measured on a loaded machine: lay ~250 ms, desaturate ~185 ms. Limits: the sheets' texture does not slide
with the edge (only the edge moves; invisible in a 3-frame slide); the rect is axis-aligned.

## 9. Inscription text and subtitles (`tools/ink/text.py`)

```python
from tools.ink.text import Inscription, subtitle, subtitle_at
ins = Inscription('一竅通時\n百竅通', 'refs/fonts/guangekai/館閣楷-Regular.ttf', region=(1420, 110, 330, 640),
                  size=ctx.size, vertical=True, paper=paper, words=ctx.timing.words('一窍通时百窍通'),
                  seal='悟空', seal_font='refs/fonts/chongxi-seal/崇羲篆体.otf')              # in setup()
ins.draw(frame, t)                                   # in render(); ins.fade(frame, t, t_out, dur) to take it away
line = subtitle_at(ctx.timing, t)
if line: subtitle(frame, line, 'refs/fonts/eb-garamond/EBGaramond[wght].ttf', font_cjk='refs/fonts/lxgw-wenkai/霞鹜文楷-Regular.ttf')
```

| Call | Meaning |
|---|---|
| `Inscription(text, font, region, size, vertical=True, px=None, max_px=120, line_gap, char_gap, align, words=None, start, end, mode='stroke'|'word', ground='paper'|'night', seal=None, seal_font, seal_px, seal_delay=0.35, seal_style='zhu', paper, seed, density, bleed, latin_font, colour)` | Fits the text in the blank `region` (`\n` = line; vertical = columns right to left, CJK upright, Latin lines turned clockwise). `words` = `[(word, start, end)]` from `Timing.words()`, matched in order to the written units (each CJK character, each Latin word); otherwise units are spread over `start..end`. `stroke` writes each unit across its duration along the hand's path; `word` blooms it whole. `ground='night'` lays pale gouache instead of ink. `seal` = text or RGBA, pressed after the last word (uses `tools.ink.seal` when present). |
| `ins.draw(frame, t, opacity)`, `ins.fade(frame, t, t_out, dur)`, `ins.T(t)`, `ins.rgba(t)`, `ins.density(t)` | Lay it at song time t; the raw layers. `ins.px`, `ins.box`, `ins.missing`, `ins.t_end`. |
| `subtitle(frame, text, font, px=40, y=0.9, x=0.5, ground='auto', opacity, max_width=0.8, font_cjk, halo=0.5)` | Quiet lower third: dark ink on paper, pale on night (auto from the picture), faint halo of the ground tone, wraps to two lines, punctuation dropped, never under 22 px at 1080p. |
| `subtitle_at(timing, t, lead=0, tail=0.8, min_dur=1.0)` | The lyric line due at t, or None. |

Performance: build ~50 ms; draw + subtitle about 3 ms/frame. Limits: stroke-by-stroke is a sweep across each
glyph (top-left to bottom-right), not true stroke order; no kerning-aware justification or vertical punctuation
forms; rotated Latin in vertical columns is set word by word; a seal is placed under the last column (or beside it
if the region is full) and is not collision-checked against the painting.

## 10. Light (`tools/ink/light.py`)

Light multiplies the plate (light on a surface). Output is capped at 0.985; nothing is added as glow.

- `neon(frame, t, period=7, phase=0, source=(2150, -260), reach=1500, gain=1, ambient=0.07, tungsten=0, fade=0.10,
  shadow=None, slats=0, field=None)`: cinnabar wash cycling to cold blue, falling off from `source` (the window);
  `tungsten` adds warm fill from the bottom edge; `slats` lays soft window-bar shadows.
  `neon_colour(t, period, phase, fade) -> (rgb, k)`, `neon_field(W, H, source, reach, slats=...)` (precompute it).
- `flashlight(frame, pos, radius, t=0, ambient=0.06, gain=1, colour=TORCH, tilt=0, stretch=1, shadow=None, field=None)`:
  a torch pool (hot core, soft uneven edge, faint ring and dimple); `pos` may be a callable of t. The rest is night.
  `flashlight_field(W, H, pos, radius, tilt, stretch)` returns the intensity for sharing with `dust`.
- `cast_shadow(mask, light_pos, distance=0.4, light_size=18, t=0, size=None, offset=(0, 0)) -> S`: project a silhouette
  (array or callable t -> mask, e.g. a keyed video matte) away from the lamp at `light_pos`; it grows by
  1/(1 - distance) and its penumbra widens with distance. Pass `shadow=S` to `neon`/`flashlight` so the shadow
  removes only that lamp (the umbra keeps ambient/tungsten, never black).
- `hand_shadow(frame, mask, light_pos, distance, light_size, strength=0.86, tint=...)`: the same, multiplied straight
  onto an already-lit frame.
- `dust(frame, t, beam, n=70, seed=0, colour=TORCH, gain=1.0, drift=(4, -2.5), size=(1, 3), threshold=0.10)`: sparse
  motes visible only where `beam` (an intensity field, optionally times `1 - S`) is lit; random access in t.
- `hand_monkey(W, H, pos, scale, t=None)`: synthetic hand-shadow mask for tests.

```python
L = flashlight_field(W, H, pos, 430, tilt=-20, stretch=1.25)
S = cast_shadow(hand_mask, light_pos=(pos[0] - 120, 1250), distance=0.36, light_size=14)
f = dust(flashlight(page, pos, 430, field=L, shadow=S), t, L * (1 - S), seed=5)
```
Speed at 1080p, one core, measured on a loaded machine: neon ~80 ms, flashlight ~165 ms, dust ~10 ms.
Limits: one penumbra width per shadow (no growth along a long arm); the mask is treated as flat (no perspective);
dust is deliberately faint on bright paper, raise `gain` or `n` if it must read at 540p.

## 11. Shadow screen 皮影 and lantern 走马灯 (`tools/ink/puppet.py`)

- `Part(name, mask, dye, pivot, parent=None, attach=(0, 0), z=0, rest=0, seed=0, outline=2.2, pattern=None)`: one piece
  of hide: `mask` HxW, `pivot` its pin (own px), `attach` where the pin sits in the parent, `pattern` knife cuts.
  `leather(mask, dye, seed, outline, pattern) -> T` gives the dyed-hide transmittance (dyes: `DYE_RED`, `DYE_GREEN`,
  `DYE_OCHRE`, `DYE_BLACK`, `DYE_INDIGO`, `HIDE`).
- `Puppet(parts)`; `.render(pose, pos, scale=1, size=(W, H), swaps=None, pins=True, rods=None, soft=0) -> T`.
  A pose is `{part: degrees}` (+ swings a hanging limb forward) plus `_x`, `_y`, `_rot`, `_flip`. Overlapping
  hides multiply (darker). `swaps={'head': other_part}` swaps a part for that frame (七十二变).
- `pose_at(t, cues, poses, start=0, before=None)`: hard re-posing on cues, no in-betweens. `cue_index(t, cues)`.
- `shadow_screen(screen, layers, light_pos, radius=700, lift=0.05, ambient=0.05, lamp=LAMP, gain=1, t=0, soft=None,
  stretch=1, flicker=0)`: back-lit screen (`screen`: any HxWx3 surface, e.g. `Paper.rgb` or a window plate) with a
  lamp hot spot at `light_pos`; `layers` are puppet T layers or `(T, lift)`. Lift magnifies the shadow away from
  the lamp and softens it, so a lamp sweeping past shears the figures; outside the pool they are not there.
- `lantern(strip, t, rpm=8, size, rect=None, ground=None, ribs=8, seed=0, soft=3, flicker=1, back=0.22, direction=1)`:
  figures on a wheel inside a lit paper drum (cylinder projection, static bamboo ribs, far-side figures showing
  faintly, deterministic flame flicker). `lantern_strip(frames, gap=0.25)` joins N figure layers; make the strip
  about `pi * drum_width` wide at the drum's height or figures look squeezed. Loops every 60/rpm s.
- Demo figure: `monkey_puppet(seed)`, `monkey_heads(seed)` (monkey, plumed, hawk, fish, elder), `POSES`
  (stand, guard, strike, shade, crouch, leap), `run_cycle(n)`.

```python
pose = pose_at(t, CUES, [POSES['guard'], POSES['strike'], POSES['crouch']])
T = PUP.render(pose, pos=(800, 600), scale=1.5, size=ctx.size, swaps={'head': HEADS[cue_index(t, CUES) % 5]})
frame = shadow_screen(SCREEN, [(T, 0.05)], light_pos=(lx_of(t), 470), radius=820)
```
Speed at 1080p, one core, measured on a loaded machine: puppet render ~50 ms, shadow_screen ~120 ms; the lantern was not timed alone.
Limits: the demo monkey is a procedural stand-in (real part masks should come from cut-out art; any HxW masks work);
no automatic z-swap when a limb crosses the body; the lantern is an orthographic cylinder with a fixed slight
downward view; the unlit-screen colour is a fixed dusk blue times `ambient`.

## 12. Video elements (`video.py`) and brush-redraw rotoscope (`roto.py`)

A generated clip of ONE thing on a plain ground is **prepared once** (decode, stabilise, de-flicker, key, optional
matte) into a frame store on disk; shots then read keyed frames back, random-access and GPU-free, from any worker.
Stores live in `work/ink_clips/<name>/` (`f_00000.png` ... + `meta.json`); they are rebuilt only when the source file
or the prepare options change.

```python
from tools.ink.video import Clip, Retime
from tools.ink.roto import redraw, track_point, StaffTrail

def setup(ctx):
    global CLIP, RT, BRUSH, TRAIL
    CLIP = Clip.prepare('media/gen/monkey_staff.mp4', ground='light')        # ink figure on cream paper
    RT = Retime(t0=52.0, src0=0.4, duration=CLIP.duration)
    RT.freeze_at(54.25, 0.5).on_twos(56.0, 58.0).ramp([(58.0, 1.0), (58.6, 0.35)])
    for w in RT.check(ctx.t0, ctx.t1): print('retime:', w)                   # never silently off the end
    SC.add(CLIP.as_layer(RT, scale=1.5), kind='ink', depth=1.0, pos=(340, 190))   # in a multiplane Scene
    BRUSH = redraw(CLIP)                                                     # the same clip as brush marks
    path = ctx.cache('tip', lambda: track_point(CLIP, seed=(870, 395), mode='staff'))
    TRAIL = StaffTrail(path, width=26, scale=1.5, pos=(340, 190), paper=PAPER)

def render(t, ctx):
    f = PAPER.frame(t)
    TRAIL.lay(f, RT.src(t))                              # what the staff tip has written so far; it stays
    lay_ink(f, BRUSH.layer(t, RT, scale=1.5), 340, 190)
    return f
```

CLI: `python -m tools.ink.video prep in.mp4 [--out DIR] [--ground light|dark] [--height 720] [--start S --dur D]
[--matte sam2|birefnet] [--no-stab] [--smooth 0.5] [--lo --hi --gain] [--force]`, `python -m tools.ink.video info DIR`,
`python -m tools.ink.roto redraw work/ink_clips/<name> [--strokes 12 --spacing 26 --body .3 --dry .22 --trail .7]`.

### video.py

| Call | Meaning |
|---|---|
| `Clip.prepare(src, out=None, ground='light', height=720, start=0, dur=None, stabilise=True, smooth=0.5, matte=None, matte_box=None, lo=.04, hi=.14, gain=1, feather=.03, force=False)` | Build or reuse the store and open it. `ground='light'` gives ink layers (transmittance, hue kept); `'dark'` gives straight-alpha RGBA (mist, lit things). `smooth` is a motion-adaptive temporal filter: still areas lean on the previous frame, moving edges pass whole. `matte='sam2'` multiplies the key by a SAM 2.1 video matte prompted with the key's own bounding box (or `matte_box`). |
| `Clip(store)` | Open an existing store. Attributes `n, fps, w, h, duration, kind ('ink'|'rgba'), meta`. |
| `clip.frame(i)` / `clip.at(src_t, blend=False)` | Keyed frame by index / by source time (hard frames; `blend` mixes neighbours). Small LRU cache. |
| `clip.layer(t, retime=None, scale=1.0)` / `clip.as_layer(retime, scale)` | The layer at song time `t`; `as_layer` returns the callable for `Scene.add(..., kind=clip.kind)`. |
| `clip.density(i)` | HxW ink density (or alpha). |
| `Retime(t0, src0=0, rate=1, duration=None)` | Song time to source time. Chain: `.ramp([(t, rate), ...], ease)`, `.freeze_at(t_hit, hold, catch_up=0)` (亮相: the hit's pose holds, then resumes; `catch_up` seconds to make up the lost time), `.on_twos(ta, tb, n=2)`, `.reverse()`, `.loop(a, b, pingpong)`. `.src(t)` clamps to the clip and sets `.overrun`; `.check(t0, t1)` lists problems. |
| `decode(path, start, dur, height)` | Generator of `(src_t, RGB float)`; colour handled as in `tools/edit/assemble.py` (untagged HD = BT.709 limited). |
| `Stabiliser`, `matte_sam2(frames, box)`, `matte_birefnet(frames)` | The pieces `prepare` uses. |

What prepare does: (1) ECC affine on the high-passed ground only (subject masked out) against frame 0, undone per
frame; frames where the ground is too plain to lock keep the last estimate and are counted in `meta['stab_lost']`;
(2) per-frame ground colour plus a clip-averaged shading field, so brightness flicker and vignetting divide out;
(3) `key_paper` / `key_dark`; (4) the temporal filter; (5) a last soft knee that removes traces under 2-7% density.

Mist: a dark-ground mist clip's alpha is a bare-paper mask. Add it to a Scene as
`SC.add(mist.as_layer(rt), kind='erase', depth=1.5)` (added after `demos/d12_video.py` was written; that demo still
composites the mist by hand and is the tested path).

### roto.py

| Call | Meaning |
|---|---|
| `redraw(clip, out=None, strokes=12, spacing=26, body=0.30, density=0.92, dry=0.22, trail=0.7, width_gain=1.12, thr=0.3, seed=0)` | Redraw a prepared ink clip as brush marks; returns a new `Clip` (store `<name>_brush`). The source is only read: silhouette, medial axis (Zhang-Suen), DIS optical flow. Torso and head become one uneven wet wash; each limb and the staff is ONE tapered dry-brush stroke (`ink.stroke`) whose control points ride the flow and settle on the new medial axis, so a stroke keeps its identity and its bristles; strokes are re-seeded only when a limb is lost or two limbs cross. Fast limb ends get drier and leave a short 飞白 trail. `strokes.json` in the store lists every stroke per frame. |
| `track_point(clip, seed=None, mode='staff', thin_w=14, despike=60, smooth=0)` | `(n, 3)` rows of `(src_t, x, y)` in clip px. Modes: `'staff'` (end of a thin straight rod by line fit; survives fast spins and passing behind the body), `'extreme'` (farthest thin point from the body centre), `'flow'` (carry `seed` on optical flow), `'dark'` (densest ink near the last position), `'colour'` (needs `colour=` and `raw=` source frames). |
| `StaffTrail(path, width=16, scale=1, pos=(0,0), paper=None, seed=0, density=.8, dry=.5, t_in=None, t_out=None, chunk=700)` | The persistent stroke written by a tracked point. `.lay(frame, src_t)`, `.T(src_t, size)`, `.density(src_t, size)`, `.progress(src_t)`. Fast passes thin out and go dry. The path is cut into overlapping strokes (`chunk` px) so a spin builds up as overlapping rings. Feed it `rt.src(t)` so a freeze also stops the writing. `path` can equally be supplied keypoints. |
| `silhouette`, `thin`, `branches`, `gestures`, `resample` | The analysis pieces (mask, 1 px skeleton, traced branches, long merged gestures). |

### Performance (measured, 1280x720 stores, shared machine)

- `prepare`: about 6.5 s per source second with stabilisation (ECC is the cost), 3.2 s without. With SAM 2.1 a
  12-frame test took 8.4 s in all, model load included.
- `redraw`: about 5.5 s per source second (0.23 s per frame). `track_point`: about 40 ms per frame.
- Render: reading a keyed 720p frame is about 10 ms; `clip.layer(scale=1.5)` to 1920x1080 about 14 ms on top of
  a cached frame; `StaffTrail.lay` at 1920x1080 about 20 ms with the whole trail drawn. Demo shots at 1920x1080
  internal with `--jobs 4`: `d12_roto` 46-60 fps, `d12_video` (two Scene renders per frame for the mist) 14 fps.

### Known limits

- Tested only on synthetic stand-in clips (`demos/d12_make_src.py`): no generated footage existed yet. Real model
  output will need the key thresholds (`lo`, `hi`) and `thr` tuned per clip; look at a contact strip first.
- Stabilisation needs some texture in the ground. On the test clip the lock held on 120 of 144 frames, centre error
  0.9 px mean, 2.7 px max. A perfectly flat ground cannot be locked (and has nothing visible to drift).
- BiRefNet path is untested: the halys venv lacks `timm` and `kornia`; it raises a clear error. SAM 2.1 is tested.
- Stores are 8-bit at the working height; scaling a 720p store by more than about 1.5 looks soft. Use `height=1080`.
- Redraw: the wash and dry-brush grain are redrawn every frame, so texture shimmers at 24 fps; it is meant to be
  played on twos (`Retime.on_twos`), where it reads as hand-drawn frames. About one stroke is re-seeded every three
  frames on the test clip (limbs crossing). Thin limbs that merge with the torso are absorbed into the wash. Faces
  and interior detail are not drawn: this is a silhouette performer.
- `StaffTrail`: chunk joins can show as a change of ink load; a sharp reversal leaves a round dab. `'staff'`
  tracking assumes one straight thin rod; with two thin things in frame, mask one out or supply keypoints.
- `Retime` with `on_twos` quantises from the start of its interval, not from the song's frame grid.

## Examples (`tools/ink/examples/`)

All three are locked to the real `analysis/timing.json` and use stand-in art from `stock.py`; rendered copies are in
`work/ink_demo/`.

| Script | Song time | What it combines |
|---|---|---|
| `ex1_page_bloom_seal.py` | 40.0-48.0 | push into a sheet (Scene + Camera, mist band), plate blooms, seal strike with camera shake on the gong (42.565), rubbing flips on the three chops, woodblock mis-registration on the drum hits |
| `ex2_cliff_travel.py` | 24.0-33.0 | carved cliff as a `frame` layer in a Scene, right-to-left travel, sun climbing so the carving goes flat, uncarved stone, mist bands, lyric subtitles from the timing map |
| `ex3_birth_four_bows.py` | 57.9-64.4 | splash thrown onto the hook gong (58.673) resolving into a figure, four re-pressed seals on "He bowed four ways", name seal, shake |

Feature demos are `tools/ink/demos/dNN_*.py` (same runner). The dNN demos for seal, rubbing, print, margins and
puppets were built on the synthetic stub (`Timing.stub()`), so their times are stub times.

## Performance

Measured on this machine (24 threads, RTX 3090 idle), 12 workers, rendering at 1920x1080 and writing 960x540:

| Shot | fps |
|---|---|
| ex3 (paper, splash, seals, shake) | 29 |
| d03 (strokes, splash, bloom of a full-frame plate, dissolve, hairline) | 33 |
| d02 (multiplane: 3 ink planes, 2 mist bands, 4400x2000 canvas) | 11 |
| ex1 (Scene with blooming layer + mist, seal, rubbing, 4-block mis-registration) | 10 |
| ex2 (3400 px carved cliff relit every frame, 2 mist bands, subtitle) | 5.7 |

Per-call costs at 1080p on one core: Scene layer warp 10-25 ms, mist band 20 ms, `Bloom.T` 60 ms, stroke build
40-80 ms (setup), splash build 0.2-1 s (setup) and 5-10 ms per frame, `key_paper` 30-60 ms per megapixel, seal strike
5-12 ms, rubbing 90 ms, `misregister` 360 ms, `papercut` 180 ms, `torn` 230 ms, cliff 60-70 ms (140 with gold),
inscription + subtitle 3 ms, margins + desaturate 170-430 ms, neon 80 ms, flashlight 165 ms, shadow screen 120 ms.
The light and margin figures were taken while the machine was loaded.

- Everything runs on the CPU; the GPU is used only by the optional mattes in `video.py` preparation.
- Workers are single-threaded (OpenCV's thread pool does not survive fork), so speed scales with `--jobs`. Each
  worker holds the shot's globals copy-on-write; a 4400x2000 canvas with five layers needs about 1 GB in total.
- `setup` runs single-threaded in the parent. Put anything slow (stand-in mountains, keying a clip, rock plates)
  through `ctx.cache` so `--still` and re-runs start quickly.
- Editing any `tools/ink/*.py`, the shot file or a shared helper (`shots/_*.py`, `shots/*_lib.py`,
  `tools/stage/*.py`) invalidates that shot's frame cache. Other inputs (keyframes, clip stores, `clips.json`) do
  not: use `--fresh` after changing them.

## Known limits (whole engine)

- Stand-in art (`brush_mountain`, `brush_monkey`, `rock_plate`, the demo puppet) is there to exercise the engine. It
  reads as naive brush painting, not as the film's plates.
- No motion blur anywhere: moves are sampled at one instant per frame (the multiplane travel in ex2 is slow enough
  not to need it; a fast whip would strobe).
- Effects that re-print or re-light the whole frame (`misregister`, `rubbing`, `margins`, `light`) expect to know the
  bare sheet (`paper=`): pass the paper as the camera sees it (ex1 shows how) or paper texture is read as marks.
- The splash is not a fluid solver; strokes do not interact with wet ink already on the sheet.
- Keying needs a plain source ground. White or lighter-than-paper pigment cannot be keyed from cream paper.
- Subtitles set a mixed Chinese and English line in one font (the CJK one).
- `qa coverage` reads low on full-bleed frames whose border is mostly marks.
- Colour is display-referred sRGB throughout; light is multiplied in that space, which is a look, not photometry.

## 15. v3: static inscription (`inscription.py`) and the medium switch (`medium.py`)

Both are shared by every team from preview_v3 on (docs/REVISION_V3.md §2.4, §2.5, §4). They replace per-shot animated
Chinese inscriptions and ALL block mis-registration (`woodblock.misregister`) and 1-2 frame rubbing flickers.

### Inscription (题跋): `from tools.ink.inscription import inscription`
```python
INS = inscription(ctx, 'B5', box=(1500, 110, 300, 620), paper=P)     # setup(); key = first column of design/text/lyrics_zh_v3.txt
INS.draw(frame)                                                      # render(); static, from the first frame
```
- `box` = the blank (x, y, w, h) in 1920x1080 authoring px. Columns top to bottom, right to left, from the box's
  top-right corner; one 悟空 seal under the last column. Characters are 60 px at 1080p in every shot (do not pass
  `px`; a box that is too small shrinks the text and prints a warning).
- `text='一通百通'` overrides the file (columns split on `/`). `ground='dark'` lays pale gouache for night/stone.
  `seal=None` drops the seal. On a page canvas larger than the frame: `inscription((W, H), key, box, px=60 / zoom)`,
  then lay `INS.T` (transmittance) and `INS.seal` at `INS.seal_pos` yourself, or `INS.draw(canvas)`.
- Font: Ma Shan Zheng (OFL; simplified only). Proof: `python -m tools.ink.inscription` ->
  `work/review/comp_v3/_inscription_proof.jpg`.

### Medium switch: `from tools.ink.medium import Mediums, pick_chops, medium_at`
```python
MED = Mediums(ctx.W, ctx.H, seed=3)                                  # setup()
CHOPS = pick_chops(ctx.timing, ctx.t0, ctx.t1)                       # measured chops, <= 2 per bar, >= 8 frames apart
frame = MED.switch(frame, t, CHOPS, paper=P.rgb)                     # render(), LAST step
frame = MED.switch(frame, t, [(43.805, 'rubbing'), (44.385, 'papercut')], paper=P.rgb, hold=5)
```
- On each chop the finished frame is shown as red paper-cut 剪纸 -> stone rubbing 拓片 (its un-inked paper edge in
  frame) -> leather shadow puppet 皮影 (amber back-light), cycling in that order, for `hold` frames (default 4, never
  fewer than 3), starting on the frame that contains the chop; hard cut in and out. One registered image per medium:
  no offset doubles, nothing flickers.
- `paper` = the bare sheet as the camera sees it (`Paper.rgb`, or the same camera view of the bare paper). For frames
  that are not ink on paper (carved rock, lit rooms) pass `mask=` (HxW, 1 = mark), e.g. the Cliff's cut mask.
- Single media: `MED.papercut(frame, paper)`, `MED.rubbing(frame, paper)`, `MED.shadow(frame, paper)`;
  `medium_at(t, chops, hold)` -> name or None (to freeze motion while a switch is held: hold the pose, e.g.
  `t_pose = on_frame(chop)` while `medium_at` is not None, so the SAME pose is shown).
- Seals: a cinnabar seal becomes part of the cut sheet / a bare mark / dark hide. If a seal must stay red, draw it
  after `switch`.
- Proof: `work/review/comp_v3/_medium_switch_proof.jpg` (ink, paper-cut / rubbing, shadow).
