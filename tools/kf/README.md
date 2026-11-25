# tools/kf/comp.py: the still-frame compositor

Step 3 of the keyframe pipeline (`docs/KEYFRAMES.md` section 2). A generated still ("a painting on cream paper", full
bleed) goes onto the film's ONE sheet of paper as ink; inside the set's beam mask the wash is lifted back to bare
paper and only line is kept; outside it the shadow is evened; motes, gold pencil, toner labels and the header are
drawn in code. Built on `tools/ink` (Paper, `key_paper`, `ink_T`, `rough_mask`, `fbm`, `grain`, `rng`).

```
PY=/home/jade/Documents/halys-video/.venv/bin/python          # run from the repo root
$PY -m tools.kf.comp spec.json                                # writes spec["out"], prints time and measurements
$PY -m tools.kf.comp spec.json --out x.png --size 3840x2160   # (also runs as a script: $PY tools/kf/comp.py spec.json)
$PY -m tools.kf.comp_tests                                    # rebuilds everything in media/keyframes/_comp_test/
```
```python
from tools.kf.comp import compose, blank, save, run
img = compose(spec)          # float32 sRGB HxWx3. A spec with no `src` is a blank-register frame (= blank(spec))
path, info = run(spec)       # compose + save; info holds ground, shadow values, lit fraction
```

All coordinates and sizes in a spec are **1920x1080 authoring pixels**, whatever the output size. Paths are relative to
the repo root. Everything is seeded: the same spec gives the same file, byte for byte. A 1080p still takes 1-2 s, a
4K one about 12 s.

## Worked example

`media/keyframes/_comp_test/AD_wide_example.json` -> `AD_wide_example.jpg`:

```json
{
 "src": "media/keyframes/_looktest/ad_wide_v1_codex.jpg",
 "out": "media/keyframes/_comp_test/AD_wide_example.jpg",
 "paper": {"variant": "new", "seed": 7},
 "beam": {"mask": "media/layout/attic88_day/beam_AD_wide_flat.png", "lift": 1.0, "line_keep": 0.6, "feather": 5,
          "rough": 1.0, "fill_holes": true,
          "protect": [[[420,600],[520,555],[618,590],[630,700],[612,790],[700,850],[850,880],[800,995],[680,1020],
                       [600,1045],[400,1045],[325,990],[370,860],[400,740]]]},
 "shadow": {"tint": "attic", "floor": 0.40, "auto_level": 0.45, "retint": 0.6},
 "motes": {"seed": 11, "n": 70, "region": "beam", "size": [1.6, 5.0], "hero": [756, 683]},
 "gold": [{"type": "ring", "at": [756, 683], "r": 30},
          {"type": "dots", "path": [[808, 653], [1046, 487]], "gap": 15},
          {"type": "text", "at": [1500, 800], "text": "88 ?", "size": 40},
          {"type": "underline", "from": [1494, 812], "to": [1640, 808]},
          {"type": "ticks", "at": [1500, 900], "n": 7, "size": 26}],
 "toner": [{"text": "ANXIOUS", "at": [250, 300], "size": 40, "rot": -3, "gen": 3}],
 "header": {"text": "Attic, 1988", "at": [96, 84], "size": 30}
}
```

What happens, in order: the sheet (seed 7) is built; the still is resized and keyed to ink density against its own
"paper" colour (found in the brightest part of the beam); density is split into wash and line; outside the mask the
wash is levelled to the scene's shadow value and turned toward the attic tint; inside the mask the wash is removed and
line kept at 60 %, except inside the `protect` polygon (the girl and her keys, kept as painted); a rim of pigment is
added along the wet edge; then motes, gold, header, toner.

## Spec

| Key | Meaning |
|---|---|
| `src` | The generated still (any size; 16:9 or close). Omit for a blank-register frame. |
| `out` | Output path: `.jpg` (quality 95, 4:4:4) or `.png`. |
| `size` | `[w, h]`, default `[1920, 1080]`. `[3840, 2160]` works; the 4K sheet is the 1080p sheet enlarged plus native fine grain, so the paper is the same picture at both sizes. |
| `paper` | `{variant: 'new', seed: 7}`. Leave it alone: one sheet for the whole film. |
| `seed` | Seed for the edge wobble, granulation and marks of this frame (default: the paper seed). |
| `ground` | `[r, g, b]` source paper colour, if the estimate is wrong (`info['ground']` prints what was used). |
| `key` | `{lo: 0.02, hi: 0.07, gain: 1.0, granulate: 0.12}`. Density below `lo` is the source's own paper grain and is dropped; `granulate` settles the painted wash into OUR paper. |

### `beam`

| Key | Default | Meaning |
|---|---|---|
| `mask` | | 1920x1080 mask from the set, white = lit (alpha is used only if it carries anything). |
| `lift` | 1.0 | How much of the wash inside the mask is removed. |
| `line_keep` | 0.6 | Strength of the ink line left in the light. |
| `feather` | 5 | px over which wash gives way to paper (about 3 px of visible fall). |
| `rough` | 1.0 | Edge irregularity: 0 = ruler, 1 = slight wander and scallops, 2+ = loose. |
| `rim`, `rim_px` | 0.40, 2.4 | Extra pigment just outside the edge, as a fraction of the local wash, and its width. 0 = none. |
| `protect` | | Polygon or list of polygons where nothing is lifted (things painted in full colour in the light). |
| `keep_dark` | `'auto'` | Areas much darker than the shadow wash are painted things (hair, trousers, black keys) and are not lifted. `'auto'` = 1.5x to 2.1x the shadow's density; `[a, b]` sets it in density (-ln) units; `null` turns it off (do that when the shadow itself is near-black: wall, closet, basement). |
| `keep_colour` | `[0.22, 0.45]` | Areas whose hue differs from the shadow wash (an orange band) are local colour and are not lifted. `null` = off. |
| `line_px` | 4 | Marks thinner than about twice this count as line; wider ones as wash. |
| `line_floor` | `[0.05, 0.16]` | Line fainter than this (density) is the model's paper grain and is dropped. Lower it to keep the faintest pencil (frost ferns). |
| `fill_holes`, `add`, `cut` | | Repair the mask: fill its holes (the 3D mannequin's unlit side), add or cut polygons. |

The wash/line split is a grey-scale opening of the density, not a blur, so the steps between washes are removed
exactly and lifting leaves no ghost of the model's own beam edge.

### `shadow` (optional; applies outside the mask)

| Key | Meaning |
|---|---|
| `tint` | `[r, g, b]` (the colour the wash shows on white at density 1) or a name: `attic shanghai office wall market basement kitchen closet mtnview playground ink`. Values live in `TINTS` in comp.py (a `tools/kf/scenes.py` with a `TINTS` dict overrides them). |
| `strength` | Density of an even wash added over everything outside the mask (0.3 = pale, 0.7 = deep). |
| `floor` | Minimum shadow value: where the model left the paper bare or thin outside the mask, wash is added up to this. |
| `auto_level` | Target value, or `{target, limit: [0.5, 2.2]}`: the painted wash is scaled so its median outside the mask hits the target. This is what makes shots of one scene match. |
| `retint` | 0..1: turn the painted wash toward `tint` without changing its value (models paint the "blue-grey" differently). |
| `even` | 0..1: flatten slow unevenness of the painted wash. |
| `granulate` | 0.35: how much the added wash settles into the paper. |

"Value" here is the share of the paper's light a wash takes away: 0 = bare paper, 1 = black. `run` prints
`shadow_value_src` (as painted) and `shadow_value` (after).

### `motes`

`{seed, n: 60, region: 'beam' | polygon, size: [1.6, 5.0], hero: [x, y] | null, hero_size: 8.5, hero_clear: 46,
centre: 0.8}`. Gold-ochre flecks laid as pigment (multiplied, so never brighter than paper), only where the mask is
lit and nothing dark is painted, denser toward the middle of the beam (`centre` = how strongly). Sizes are diameters,
long-tailed; one in five is elongated; those over 3 px get a darker heart. The hero is larger and crisper and keeps
`hero_clear` px around it free. Positions are sampled in authoring space, so 1080p and 4K get the same motes.

### `gold` (a list; gold pencil, on top of light and shadow)

| Mark | Keys |
|---|---|
| `ring` | `at`, `r`; optional `gap` (deg left open, default 12-26), `start` (deg), `cw`. Not quite round, not quite closed. |
| `dots` | `path` (polyline), `gap` (default 14); optional `size`. Stops where the path stops. |
| `line` | `path` (2+ points; 3+ are joined as a smooth curve). |
| `underline` | `from`, `to`. |
| `text` | `at` (left end of the baseline; `align: 'center'` centres on `at`), `text`, `size` (digit height). Characters: `0-9 ? . : - = + /` and space, built from stroke paths. Anything else raises. |
| `ticks` | `at` (foot of the first tick), `n`, `size` (height); every fifth strikes through (`tally: false` for plain ticks). |

All take optional `width` (2.6), `pressure` (1.0) and `seed`. The line is opaque pigment that only takes on the high
points of the sheet, so it is grainy and breaks where the paper is low or the hand was light.

### `toner` (a list; the only black in the frame)

`{text, at: [x, y] (centre), size (font px; cap height is about 0.72 of it), rot (deg), gen: 1..5, seed}`. Capitals in
Liberation Sans Bold. Each generation is one pass through a copier: skew, stray toner, blur, noise riding on the
toner, drop-outs, and a threshold that fattens the letter. Generation 1 is a clean print, 3 is ragged, 5 is heavy,
chewed and peppered but still legible. The label is rendered at 4x authoring resolution, so it is the same at any
output size.

### `header`

`{text, at: [x, y] (left end of the baseline), size: 30, density: 0.70}`. Latin Modern Roman, laid as ink: it sinks
under nothing but also cannot lighten, so over a deep shadow it is hard to read. Put it on paper or pale wash.

### Blank register: `blank(spec)` (any spec without `src`)

Bare paper plus `motes`, `gold`, `toner`, `header` as above, and optionally

`wash_band: {angle_deg: 40, through: [960, 540], width: 300, density: 0.55, tint: 'ink', reach: null, feather, rough,
rim, pool: 0.22, streak: 0.06, granulate: 0.35, seed}`: wash on both sides of a band of bare paper that runs up to the
right at `angle_deg`. `reach` (px) stops the wash that far from the band with a second wet edge, for the frames where
the wash is still gathering. With a band, `motes.region: 'beam'` means the band; without one it means the whole frame.

- 0:00 pad frame: `_comp_test/pad_0000.json`
- final frame (bare paper, one gold dotted line that stops): `_comp_test/final_frame.json`

## Limits

- **Keying a full-bleed painting** works well when part of the lit area is really left as bare "paper": the ground is
  the median of the 84th-97th percentile of brightness inside the beam. A still with no bare paper at all needs `ground`. Hue is kept (density
  is per channel). The model's own paper grain and fibres come along as faint texture in the shadow; in the light
  they are removed.
- **The mask and the painting must agree.** The mask is the 3D set; the model moves things (in the look tests the
  window sits some tens of px off, so the lit shape cuts across the painted frame). Wherever the model painted light outside
  the mask it is washed over (`floor`); wherever it painted shadow inside, it is lifted. That is the design, but a
  figure that does not sit where the mannequin sat gets the mannequin's shadow shape on her back: use `fill_holes`
  and `protect` round the figure, or regenerate closer to the layout.
- **Lifting**: flat washes lift cleanly, with no halo. Large painted things in the light are a judgement call:
  `keep_dark` and `keep_colour` catch hair, black keys and saturated colour, but mid-dark things (navy trousers) come
  out blotchy unless they are inside a `protect` polygon. Marks wider than about 8 px are treated as wash, so a fat
  brush line in the light thins to its edges. Hatching and wood grain inside the light stay as faint line.
- `protect` keeps everything inside the polygon as painted, including any wash the model put round the figure: draw
  it tight.
- Stills smaller than the output (codex is 1672 px wide) are enlarged; at 4K their line is soft.
- The header is ink and the motes are pigment; neither shows on a deep shadow. Gold and toner do.
