# A cell of Purkinje growing, as an engraved plate

A 2:20 clip (140.0 s, 1920x1080, 24 fps, 3360 frames), the third sibling of `../frost/` (PLATE XIV) and
`../artichoke/`. A real human cerebellar Purkinje cell grows from its cell body outward, drawn as a plate in a
19th-century histology atlas in the manner of Ramón y Cajal's Golgi drawings: "STRUCTURE OF THE NERVOUS SYSTEM. /
PLATE IX.", "Fig. 12.—Cell of Purkinje from the cerebellum of man. Section in the plane of the dendritic
arborization." with the key "a, axis-cylinder; b, recurrent collateral; c, granule cells; d, a neighbouring cell of
Purkinje." Everything is drawn by code from the reconstruction. No image model was used.

For Tail 2 (3:53-4:05): the frost fern becomes a neuron's branches. The plate uses frost's sheet: the same paper,
plate rules, IM FELL type and layout, and the same horizontal line screen with the same wobble (seed and period).
At zoom 1.0 the rules and ruling lines coincide exactly with PLATE XIV, so a dissolve keeps the frame and the ruling
still while the frost gives way to the cell.

## Files

| Path | What |
|---|---|
| `build.py` | reads the SWC files, orients and resamples the cells, sets the growth schedule, adds the schematic parts |
| `render.py` | the engraved renderer, any frame in any order (camera, layout, words and inks are constants at the top) |
| `state/neuron.npz` (3 MB) | everything the renderer needs: segments with radius and growth times, spines, varicosities, somata, granule and stellate cells, labels |
| `swc/` | the three downloaded reconstructions (CNG versions, unmodified) |
| `out/neuron_master_prores422hq.mov` | master, ProRes 422 HQ, 10-bit 4:2:2, bt709 (git-ignored, about 3 GB) |
| `out/neuron_preview.mp4` | H.264 preview (CRF 18, tune grain), 161 MB: the moving ruling during the camera moves costs bits |
| `stills/neuron_t028s.png` ... `neuron_t140s_last.png` | stills at 28, 63, 98 and 140 s (frost's still times) |
| `work/` | test renders, QC and match analysis (git-ignored; can be deleted). `work/qc.py`, `work/match_best.py` |

Fonts are read from `../frost/fonts/` (IM FELL English, OFL), not copied.

## Sources and licences

- **Main cell**: `swc/Human_PC.CNG.swc`, NeuroMorpho.Org ID **307495** ("Human_PC", archive D'Angelo). Human
  cerebellar Purkinje cell, from a 92-year-old woman; biocytin fill, ex vivo slice, Neurolucida; dendrites and soma, no
  axon; 925 bifurcations, 51.7 mm of dendrite, 386 x 379 um. Masoli S., Sanchez-Ponce D., Vrieler N., et al.,
  D'Angelo E. (2024) "Human Purkinje cells outperform mouse Purkinje cells in dendritic complexity and computational
  capacity", Commun Biol 7:5, doi:10.1038/s42003-023-05689-y (PMID 38168772).
- **Neighbouring cells** (drawn pale, at the sides): `swc/v_e_purk1.CNG.swc` (ID **610**) and `swc/v_e_purk3.CNG.swc`
  (ID **612**), archive Dendritica, guinea-pig Purkinje cells filled with HRP. Rapp M., Segev I., Yarom Y. (1994)
  "Physiology, morphology and detailed passive models of guinea-pig cerebellar Purkinje cells", J Physiol
  474:101-118, doi:10.1113/jphysiol.1994.sp020006 (PMID 8014888). They are drawn at 2.06 and 2.53 px/um against the main
  cell's 1.63 (1.26x and 1.55x enlarged relative to it) so they fill the same molecular layer; their shapes are
  real, their size is not.
- **Licence**: NeuroMorpho.Org content is CC BY 4.0 (https://neuromorpho.org/useterm.jsp, read 2026-11-25). Required
  credit, if the film credits data: the two papers above, plus "NeuroMorpho.Org (RRID:SCR_002145)" and Tecuatl C.,
  Ljungquist B., Ascoli G.A. (2024) "Accelerating the continuous community sharing of digital neuromorphology data",
  FASEB Bioadv 6(7):207-221, doi:10.1096/fba.2024-00048.
- Downloads were treated as untrusted data: fetched with curl into `swc/` and `work/dl_meta/` (API metadata), parsed
  only by `build.py`'s strict numeric reader, run with `python -I`.

**What is real and what is schematic.** The main dendritic tree (every branch, its path, its thickness) is the
reconstruction, resampled at 1.6 um and lightly smoothed in radius. Not from data: the growth order and timing (a
model, below), the axon and its recurrent collateral (the reconstruction has no axon; Purkinje axons do leave the
base of the soma, descend through the granular layer, and send recurrent collaterals back to the Purkinje-cell
layer, so it is drawn to that pattern), the soma outline (a flask shape fitted to the SWC soma radius and pulled
toward the three stems), the spines and varicosities (placed at random on the thin branchlets), the granule cells,
the stellate cells, the granule-layer stipple and the transient early processes.

**Caption check.** The cell is a human Purkinje cell ("of man" is the period form). The arbor is planar and is shown
face-on, i.e. in the plane of the arborization, which is the parasagittal plane. The cell was filled with biocytin,
not Golgi-stained, so the caption does not say "after the method of Golgi"; only the drawing imitates Golgi plates.
The key letters match what is drawn: a is the axon, b the collateral, c a granule cell, d the left neighbour.

## Method

**Geometry** (`build.py`). The human cell is rotated so its distal branchlets run up toward the (unseen) pia
(`rot_extra` +12 degrees from the crown direction) and scaled to 1.63 sheet px per um, soma at (1045, 812), arbor
150-850 px high, about 770 px wide, centred near frame centre. Layers: molecular layer above the cells, a
Purkinje-cell layer at y 812, the granular layer from y 842 to the bottom of the pane.

**Growth** (`build.py`, `Tree.growth_times` and `pace`). Each node gets a time = its parent's time + segment
length / speed. Every section has its own speed (lognormal, sd 0.3). At each branch point the child with the larger
subtree continues at once and the others sprout after a random delay (exponential, mean 55 um of growth, plus 6 um),
so side branches appear behind advancing growth cones instead of the tree filling in like a wipe. The three stems
start staggered. Model time is mapped to the clip so that the grown length follows an eased curve: dendrites from
16 s (u 0.115), half the length by about 77 s, 90% by 117 s, the last tips by 130 s. The neighbours grow later and
slower (from 28 s and 39 s; the right one is still growing at the end).

**Development as drawn** (`render.py`, all closed-form in u, so any frame renders alone):
- 1-6 s: the cell body's outline is drawn on, and stipple accumulates inside it (darker to the lower right and the
  rim); it keeps darkening through the clip.
- 3-26 s: seven short processes sprout from the young cell body and are withdrawn tip first (the young Purkinje
  cell's stellate stage, before it commits to its main dendrites).
- 8-42 s: the axon grows down; 48-81 s the recurrent collateral turns back along the Purkinje-cell layer.
- every advancing tip carries a growth cone: a small swelling with 3-4 filopodia that slowly search side to side
  (Cajal described growth cones from Golgi preparations in 1890). It shrinks away over 3 s when a tip arrives. About
  230 are active at once mid-clip.
- a fresh tip is fine (35% of the final width) and fills out over 2 s; every branch then thickens slowly from 50%
  to its full radius over 34 s (late thickening).
- spines (about 23,000: short strokes with heads, on branchlets thinner than 0.62 um) sprout 7-30 s after their
  branch arrives, so the arbor goes from smooth to thorny as it matures; varicosities (about 7,700 beads) sit on the
  thin processes.
- granule cells appear between 15 s and 87 s; the granule-layer stipple appears dot by dot over the first 77 s.
- reference letters fade in once their part exists (a 42 s, b 84 s, c 63 s, d 87 s); the engraver's clearance around
  each letter knocks the ruling out.

**Rendering** (`render.py`). Strokes are drawn as anti-aliased tapered segments at 4x and area-averaged down, in
camera space, so zooming never softens a line. Minimum line 1.1 px (frost's outline is 1.15 px). Three inks over
frost's paper: frost's iron-gall black (the cell, granule cells, ruling, letters), a paler brown for the neighbouring
elements (depth), and an amber wash laid unevenly over the section (Golgi's tinted plates; hand colouring as in the
artichoke plate). The ground is frost's horizontal line screen (period 3.3 px, same wobble field), its width carrying
the tone: light over the cell, darker toward the frame and in the granular layer. A slight ink irregularity is
multiplied in. The sheet is built once at 1.6x and resampled per frame. Every random field is seeded and fixed.

**Camera** (`CAMERA` in `render.py`; u = fraction of the clip): 1.6x on the cell body for the first 10.5 s, eased
pull-out to the whole plate by 61.6 s, locked on the whole plate (identical framing to frost) from 61.6 s to 116.2 s,
then a slow push-in to 1.25x on the arbor by 140 s (the plate's header and caption leave frame entirely; at 1.08 they
were cut mid-glyph). `--camera locked` renders the whole plate throughout, exactly as frost is framed.

## Frost to neuron: the cut

Measured on frost's preview against neuron frames in the locked window (`work/match_best.py`: mean ink darkness over
the pane and the centre, and band-pass energy at 1.5, 3 and 6 px, i.e. branch scale):

- **Best: frost at 1:52 (112 s) -> neuron at 1:16 (76 s).** Frost 110 s <-> neuron 74 s and frost 115 s <-> neuron 77 s
  are the closest pairs (distance 0.021-0.023; darkness 0.29 vs 0.29, centre 0.26 vs 0.26-0.27, branch-scale
  energy within 5%). Tail 2's 12 s then plays neuron 76-88 s, all inside the locked window, while the arbor is
  still widening and about 230 growth cones are moving.
- Earlier, for more visible widening: frost 100 s -> neuron 65 s (distance 0.059).
- Frost's last frames (130-140 s) are finer and denser than the neuron ever gets in the centre; cut before 125 s.
- A dissolve works better than a hard cut: the plate frame, rules and ruling are identical, the frost's central
  clearing is where the cell grows, and only the colour warms (frost is neutral, the neuron's section has the amber
  wash). Header and caption cross-fade; if that reads as busy, dissolve over 1-2 s.

## Re-render

```
cd /home/jade/Documents/proof/media/footage/neuron
PY=/home/jade/Documents/halys-video/.venv/bin/python    # numpy, scipy, cv2, PIL (no GPU needed)
$PY -I build.py                                          # state/neuron.npz from swc/ (a few seconds)
# master, about 7 min on 14 cores (3.2 GB):
$PY -I render.py --mov out/neuron_master_prores422hq.mov
# preview:
ffmpeg -i out/neuron_master_prores422hq.mov -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -tune grain -movflags +faststart out/neuron_preview.mp4
# stills (u = 0..1 through the clip, or --at seconds):
$PY -I render.py --at 28 63 98 140 --out stills/neuron.png
# locked camera (whole plate throughout, framed exactly as frost):
$PY -I render.py --camera locked --mov out/neuron_locked_prores422hq.mov
# PNG sequence instead: --frames out/png ; other length/size: --dur 120 --fps 30 --size 3840x2160
# temporal QC (frame-to-frame change at 960x540, flags pops):
$PY -I work/qc.py move
```

Knobs: in `build.py`, `MAIN` / `NEIGH` (placement, rotation, height), `growth_times(delay_um=...)` (how far behind
the front side branches sprout), `pace(u_start, u_end, shape)` (the growth curve), the spine density (`0.55` per um)
and appearance delay. In `render.py`: `CAMERA`, `CAPTION`, `SUBCAP`, `HEADER`, `LABEL_U`, the inks, `thick` / `tipf`
(thickening and tip taper) in `_strokes`.

## QC

`work/qc.py move` rendered all 3360 frames in order at 960x540 and found no pops (no frame-to-frame change above
2.5x its local median). Change per frame is about 0.003 in the first 10 s, 0.05-0.07 in the locked window, and larger
during the camera moves (the ruling sliding under the zoom). The master was checked with ffprobe: ProRes HQ,
yuv422p10le, 24 fps, 3360 frames, 140.000 s.

## Weaknesses

- The growth order is a model, not the development of this cell (which is from a 92-year-old). Biologically the
  sequence is right in outline (cell body, transient processes withdrawn, axon first, then a planar dendritic tree
  growing outward with branch-point sprouting, spines last), but the timing is invented.
- The axon, the collateral and the granule and stellate cells are schematic, drawn to the textbook pattern.
- The neighbouring guinea-pig cells are scaled up to human size and have coarser reconstructions (longer straight
  segments), which shows as slightly angular branches; they are pale and at the edges.
- The plate is a section with ruling everywhere (no pial edge): an earlier version with a pial edge read as a
  horizon with trees on it. The granular layer at the bottom can still read a little as ground.
- During the pull-out (about 35-60 s) and the final push-in the caption slides through the bottom edge of frame, so
  for a few seconds a line of it is cut; it is moving, as in the artichoke plate's camera.
- Line widths are quantized to 1/4 px; slow thickening steps in quarter pixels, which is below what the eye can see
  in QC, but a 4K render would want `ss` raised.
