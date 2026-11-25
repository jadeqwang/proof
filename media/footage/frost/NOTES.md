# Frost on a window pane, as an engraved plate

A 2:20 clip (140.0 s, 1920x1080, 24 fps, 3360 frames) for the second half of "Proof": frost ferns grow across a
window pane, drawn as a 19th-century physics plate ("FORMS OF WATER. / PLATE XIV.", "Fig. 31.—Frost-figures on a
window-pane, formed during a night of hard frost."). The growth is a real simulation; the drawing is code. No image
model was used.

## Files

| Path | What |
|---|---|
| `sim.py` | the simulation (GPU, torch) |
| `render.py` | the engraved renderer, any frame in any order |
| `state/frost.npz` (23 MB) | the simulation's saved fields: everything the renderer needs |
| `state/frost_sim.log` | the run's log |
| `out/frost_master_prores422hq.mov` | master, ProRes 422 HQ, 10-bit 4:2:2, bt709 |
| `out/frost_preview.mp4` | H.264 preview (CRF 18) |
| `stills/frost_t028s.png` ... `frost_t140s_last.png` | stills at 28, 63, 98 and 140 s |
| `fonts/` | IM FELL English (roman, italic, small caps), OFL, from Google Fonts |
| `work/` | test runs and look iterations; can be deleted |

## Method

**Simulation** (`sim.py`): Kobayashi's 1993 phase-field model of dendritic solidification, explicit finite differences
on a 3520x1760 grid (2 cells per output pixel of the pane), 100,000 steps, about 3 minutes on the RTX 3090.

- phase field phi (0 glass, 1 ice) and a temperature field T; six-fold anisotropic interface energy
  eps = eps_bar (1 + delta cos 6(theta - theta0)), delta 0.05; latent heat K 1.7; noise 0.04 at the interface
  (this is what makes the side branches); dx 0.03, dt 1e-4, tau 3e-4, eps_bar 0.01, alpha 0.9, gamma 10.
- each nucleus is its own grain with its own crystal orientation theta0; the orientation spreads into the ice as it
  grows (grain-id field, max-pooled into newly solid cells), so neighbouring ferns point different ways.
- nucleation: 11 sites along the bottom edge (earliest), 5 up each side (staggered later the higher they are), 4
  along the top (late), both bottom corners at once, and three straight scratches seeded as dense rows of nuclei
  aligned with the scratch (they grow into long double-sided feathers). Start times are spread through the run.
- the glass is warmer in the middle of the pane (a noisy ellipse, +0.45), and that warmth decays over the night,
  with a slow uniform cooling on top. So the middle frosts last, and the clearing is not a clean oval.
- recorded: `arr`, the step (interpolated to sub-check accuracy) at which each cell first reached phi >= 0.5.
  Also the grain map, the final phi and T, and the coverage curve.

**Render** (`render.py`): at time t the ice is the cells with arr <= S(t), with a soft one-cell edge. Drawn at 2x
and area-averaged down.

- S(t), the pacing: the renderer reads the coverage curve out of `arr` and picks S so that coverage follows an eased
  curve: bare glass for the first 2 s, 1% at 14 s, 5% at 28 s, 24% at 70 s, 44% at 105 s, 60% at 140 s, still
  rising at the end (end rate about 0.8 of the average rate). `--c_end` sets the coverage at the last frame. The sim
  ran well past this (to 75% covered, by which point the side branches coarsen into slabs), so a longer clip can use
  the same state.
- glass: horizontal engraved ruling (a line screen whose line width carries the tone, with a slight hand wobble),
  dark toward the sash and light in the middle of the pane, where lyrics go.
- ice: paper white; an ink outline along the ice edge (from the signed distance of the smoothed mask); relief
  hatching on the shadow side (light from the upper left, from the gradient of a blurred copy of the mask), with a
  crossing second hatch where the shadow is deepest; and stipple that appears dot by dot in older ice.
- the paper (cream, toned margins, foxing, grain), the double rule, the header and caption are built once and are
  identical in every frame. Every random field is seeded and fixed, so nothing flickers; the only thing that changes
  from frame to frame is where the ice is.

## Re-render

```
cd /home/jade/Documents/proof/media/footage/frost
PY=/home/jade/Documents/halys-video/.venv/bin/python   # numpy, scipy, torch+CUDA, cv2, PIL. The repo's own .venv has
                                                       # a torch too new for this machine's driver (no CUDA).
# master (ProRes 422 HQ), about 20 min on 16 cores:
$PY render.py --mov out/frost_master_prores422hq.mov --dur 140 --fps 24 --size 1920x1080
# preview:
ffmpeg -i out/frost_master_prores422hq.mov -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -tune grain -movflags +faststart out/frost_preview.mp4
# stills (u = 0..1 through the clip):
$PY render.py --still 0.2 0.45 0.7 1.0 --out stills/frost.png
# PNG sequence instead of the .mov:
$PY render.py --frames out/png
# another length, frame rate or resolution: --dur 120 --fps 30 --size 3840x2160 (the layout scales; the sim is
#   2x the 1080 pane, so at 4K it is 1:1 and the ice edges are upsampled from the arrival map: still smooth).
# more or less frost at the end: --c_end 0.5 .. 0.7
```

Re-running the simulation (same seed reproduces closely, though GPU float order makes it not bit-identical):

```
$PY sim.py --w 3520 --h 1760 --steps 100000 --snap 10000 --out state/frost.npz
```

Knobs: `--K` (latent heat: higher is thinner, lacier ice that covers less), `--delta` (anisotropy), `--noise` (side
branching), `--warm` and `--warm_tau` (how long the centre stays clear), `--cool`, `--seed` (a different pane). The
seed layout and the scratches are in `seeds_layout()`. Layout and words of the plate are constants at the top of
`render.py` (`PANE`, `CAPTION`, `SUBCAP`, `HEADER`).
