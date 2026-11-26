# Spirals: three phyllotaxis plates with a gold count

Three short clips (1920x1080, 24 fps) for "Proof": a globe artichoke, a Romanesco and a spiral aloe, each seen from
directly overhead and drawn as an engraved, hand-coloured plate on frost's sheet ("PHYLLOTAXIS. / PLATE XVIII.",
Figs. 1-3). A gold thread traces the spirals one arm at a time from the centre outward, and a gold
numeral is written at the end of each arm; then the counter-rotating family is counted the same way, and the clip
holds on the totals. It echoes Hold Fire's cold open (a giant gold numeral over romanesco, artichoke, sunflower and
spiral aloe) and its drop (13, 21, 34 lit on the arms of a phyllotaxis disk, `render/src/scenes/space/phyllo.js`; the
counted aloe arms of `scenes/t2/fx/spiraltrace.js`). Here the gold is the film's gold pencil, not Hold Fire's glow.

Everything is drawn by code from a phyllotaxis model, so the thread lies on the drawing's own spirals and the counts
are measured from what is drawn. No image model is in the picture (one Codex trial was made and not used, below).

| Fig. | Plant | Counted | Clip |
|---|---|---|---|
| 1 | globe artichoke, *Cynara cardunculus* var. *scolymus* 'Green Globe', closed head | bracts: 5, then 8 | 17.0 s |
| 2 | Romanesco, *Brassica oleracea* Botrytis group, head + one floret enlarged | head: 8, then 13; floret: 8, then 13 | 20.0 s |
| 3 | spiral aloe, *Aloe polyphylla*, rosette | the five leaf ranks (no second family, see below) | 13.0 s |

## 2026-11-26: round-3 decisions (Jade: "finish at 8, and if there isn't enough time, you can start at 2. it would be nice if the gold was brighter/shimmery")

- **Cut A now finishes at 8.** The 8 family is counted 1-8 inside cut A's 5.0 s (song 2:09.2-2:14.2): arms 0.35-4.45 s
  (pass_times, first arm 1.7x the last; arm 8 takes 0.31 s, the fastest), "8" written by about 4.75 s and held to the cut.
  There was time, so it starts at 1. If the edit needs a shorter slot, start cut A at about 0.95 s: "1" is already
  written and the count runs 2-8 (Jade's fallback; no re-render needed).
- **Cut B** (5.0-9.5 s, 2:30.0-2:34.5) opens on the eight settled lines; the 5 family is counted 5.55-8.25 s (arm ends
  6.09, 6.70, 7.25, 7.77, 8.25), then holds on both totals.
- **Brighter, shimmering gold** (`thread.Gold(shimmer=...)`, set by `CLIPS['artichoke']['shimmer']`; romanesco and aloe
  take the old code path: not re-rendered): bright strokes are metallic (deeper gold at the line's edges, saturated body, a specular
  streak down the centre); a glint runs along each line every 2.2 s with a little warm glow past its edge; small
  four-point twinkles flash at points along the lines (about one per 55 px, 0.55 Hz each). Settled lines and numerals
  stay bright (settle 0.6 of the bright gold, alpha 0.92; numerals dim 5 %, was 30 %): the live line still leads.
- **`layout/sets/market93/artichoke_plate_count.json` refreshed** (the HANDOFF TODO): same bracts and numerals, new
  t_start/t_end. Only that file in market93 was written. **Flag for market93:** M2/M3 numerals were timed to the old
  clip; numeral 8 now lands in cut A at 4.45 s, and arm 1-7 times all moved earlier (see the json).
- Re-render: `$PY spirals.py artichoke --plate stills/artichoke_plate16.png --data data/artichoke_arms.json --at 2.4
  4.9 7.0 9.45 --out stills/artichoke.png --movies out --jobs 12` (no NO_MARKET_COUNT: writes the market json), then
  the two ffmpeg cuts (`-t 5.0`, `-ss 5.0`). New stills `stills/artichoke_t02.40|04.90|07.00|09.45.png`, copied to
  `media/keyframes/r4/plates/PLATE_artichoke_t*.png`. The r2-timing stills (t02.80, t05.00, t07.20, t09.40) are kept
  because the r3 review page shows them; they no longer match the master. Previous data in `work/before_r4/`.
- Assumption: "shimmery" read as a subtle moving glint and twinkle, not a constant sparkle; strengths are in the
  shimmer dict if Jade wants more or less.

## 2026-11-26 (Jade's keyframe r2 review: one bright-gold line at a time; the count takes the romanesco's slot)

Jade on PLATE_artichoke: "Good. Animate each line of the spiral in bright gold, one at a time." On PLATE_romanesco:
"this is a good time to show the counting of the spirals in the artichoke" (a romanesco would need its model built
from a real romanesco photo: the romanesco clip is now an alternate). So the artichoke clip was re-timed into ONE
continuous count that the edit cuts in two. Geometry, bracts, arms and the numeral-to-bract assignment are unchanged
(checked: every numeral sits on the same arm and the same end bract as before. Only some numerals' pixel positions on
the plate moved, because the placer now places them in a different order).

- **One line at a time, in bright gold.** The live arm draws as solid bright gold (`thread.GOLD_BRIGHT` 1.00/0.80/0.18,
  no paper tooth, 4.2 px instead of 3.2). From 0.08 s after it arrives, it settles over about 0.5 s to the quieter
  gold pencil at 62%, so only one line shines at any moment. Each numeral is bright while it is written, then settles to
  70%. The two totals stay bright. Code: `Gold.add(..., bright_fn=)` in `thread.py`, and `one_at_a_time` and `last` in
  `CLIPS['artichoke']` in `spirals.py`. Romanesco and aloe are unaffected.
- **Order: the 8 family first, then the other family, 5.** That matches the market shots, which count the artichoke's
  8 arms. The numbering is kept: the 8s still start from 6 o'clock and the 5s from 12 (`start`).
- **Timing (9.5 s, 228 frames):** plate alone 0-0.6 s. 8 family, numerals 1-7 written by 4.55 s (arm 7 ends 4.55, its
  numeral by about 4.9). **Cut A ends at 5.0 s**: the count is one short when the hand takes her forearm. **Cut B starts at
  5.0 s**: arm 8 draws 5.15-5.85 and "8" is written; the 5 family runs 6.25-8.55 (arms end at 6.69, 7.21, 7.69, 8.14
  and 8.55); then the clip holds on both totals, 8.55-9.5.
  - Cut A is PLATE_artichoke in verse 2a, at 1x: clip 0 = song 2:09.2, 5.0 = 2:14.2 (M4, the grab). It is intercut with
    M2 and M3, whose numerals on the real artichoke land at the same clip times.
  - Cut B goes in the romanesco's old slot, 2:30.0-2:34.5 (4.5 s, at 1x): the count resumes after the growth footage.
- Outputs: `out/artichoke_spirals_{master_prores422hq,gold_alpha_prores4444}.mov` and `out/artichoke_spirals_preview.mp4`
  (the whole 9.5 s); `out/artichoke_spirals_cutA_verse2a_preview.mp4` (0-5.0) and
  `out/artichoke_spirals_cutB_interlude_preview.mp4` (5.0-9.5), H.264 cuts of the master;
  `data/artichoke_arms.json`; stills `stills/artichoke_t02.80.png` (a live line), `t05.00` (the cut: 7 of 8),
  `t07.20` (the 5 family) and `t09.40` (both totals). The old `artichoke_t11.00` and `t16.90` stills (17 s timing) are deleted.
  The previous data file is in `work/artichoke_arms_before_bright.json`.
- **Not written: `layout/sets/market93/artichoke_plate_count.json`.** Set agents own `layout/sets/` tonight, so this
  render ran with `NO_MARKET_COUNT=1` (a new guard in `spirals.py`). Its bract and numeral content is unchanged. Only
  its `t_start` and `t_end` are stale (the old 5-then-8 times). To refresh it, run `spirals.py artichoke --data
  data/artichoke_arms.json` without the variable.
- Re-render: `NO_MARKET_COUNT=1 $PY spirals.py artichoke --plate stills/artichoke_plate16.png --data
  data/artichoke_arms.json --at 2.8 5.0 7.2 9.4 --out stills/artichoke.png --movies out --jobs 12`, then the two ffmpeg
  cuts (`-t 5.0` and `-ss 5.0` from the master). `render_all.sh` now uses these still times and always sets NO_MARKET_COUNT=1.
- Romanesco: the clip is unchanged and is now an **alternate**. If it comes back, Jade wants its drawing built from a
  real romanesco photo.

## 2026-11-25 (artichoke from Jade's ref; supersedes the artichoke lines below where they differ)

Jade: the artichoke drawing and its spiral tracing are to follow the real artichoke, her reference photo
`inputs/ref_artichoke.png` (a watermarked web photo; gitignored, looked at only, never copied or sent to a model). Fig. 1
now draws the **same bracts as the market93 artichoke**: `plants.artichoke()` no longer generates them, it reads
`layout/sets/market93/artichoke_bracts.json` (written by `layout/sets/market93/artichoke_spec.mjs`, the one generator) and
draws its surface with `_bract_xyz()`, a torch port of the JS `bractPoint()` that is checked against the JSON's samples
on every run (an assert). So bract n is the same bract in the market shots and on the plate, on the same arms (n mod 5,
n mod 8), in the same place: the market's `REF_artichoke_top` (frame up = the plate's up) is this view, line for line.

- **Form (from the photo):** 32 broad, thick, cupped bracts hanging from their tips on overlapping shells; the outer
  ones wider and opening out into lobes round the rim; the inner ones tight over a closed apex with a small pit; every
  tip with rounded shoulders, a V-notch, a small point in the notch and 2-3 ragged teeth a side. Both faces are drawn
  (from above, the open outer bracts show their inner face). One extra element, the body under the bracts (index -1,
  never counted), closes the pit as the market mesh's core does. Plan radius 318 px per head radius (was 400; the open
  outer bracts reach 1.28).
- **Lattice:** azimuth n x 137.5078 deg; plan radius sin(theta_n) = 0.038 (n + 0.55) up to theta 1.2 rad, then even
  steps down the flank. The equal-area lattice used before reads 8 and 13 from above once the bracts are this broad (the
  flank foreshortens the outer rows); this one reads 5 and 8 from apex to rim.
- **Count (bract 5 on, as before):** 27 counted, 49 neighbour pairs, index differences 8: 19, 5: 18, 3: 6, 13: 5, 2: 1
  (76% in the families). Winding outward on screen: 5 anticlockwise (-131 deg), 8 clockwise (+44 deg), the same hand as
  before and as the market mesh (measured there on `REF_artichoke_top`: 5: 17, 8: 16; 5 -131 deg, 8 +40 deg). 5 arms of
  5-6 bracts, 8 arms of 3-4. Anchors on the drawn path: max 0.39 px.
- **The count by bract** goes to `layout/sets/market93/artichoke_plate_count.json` whenever `data/artichoke_arms.json`
  is written (`write_market_count`); the market sidecars list it as `artichoke.plate_count` (numeral, arm, bracts, the
  bract the numeral is written past, its pixel position in that shot, and the outermost bract of that arm that faces
  the camera, for numerals whose end bract is round the back) and mark the bracts `plate_numeral5` / `plate_numeral8`.
- **Timing unchanged** (17.0 s; 5 arms 1.5-7.6 s, 8 arms 8.6-14.6 s). New arm ends: the 8 family's numeral 7 lands at
  **14.059 s**, 8 at 14.6 s (the same times as before: the arm counts per family are unchanged). The plan's rows are unchanged: the count stops at 7 for the grab
  (2:14.2), resumes from 8 on the interlude's downbeat (2:25.2) and is over by about 2:29.5.
- Re-rendered: `stills/artichoke_plate16.png`, `stills/artichoke_t05.00|t11.00|t16.90.png`, `data/artichoke_arms.json`,
  `out/artichoke_spirals_{master_prores422hq,gold_alpha_prores4444}.mov`, `out/artichoke_spirals_preview.mp4`
  (`spirals.py artichoke ...` as in `render_all.sh`; the romanesco and aloe were not touched).
- The sources below still hold; the 'Green Globe' description from the Hoare photo agrees with Jade's photo. Where the
  text below says 34 bracts, an equal-area lattice or the old check numbers, read this entry.

## Files

| Path | What |
|---|---|
| `plants.py` | the three plants as 3D geometry from the phyllotaxis model (bracts, cones of cones, leaves) |
| `engine.py` | the overhead z-buffer on the GPU: splats every element's surface, keeps height, element id and surface coordinates; normals, cast shadow, ambient occlusion, occluding edges, visible centroids |
| `plate.py` | frost's sheet (paper, double rule, IM FELL header and caption, horizontal ruling) and the engraver: tone, hatching along each element, outlines, washes |
| `thread.py` | the gold thread and numerals: strokes as sparse coverage + arrival maps, so any frame renders alone |
| `spirals.py` | per-plant configuration (look, captions, layout, count timing), the arms, the checks, stills and movies |
| `render_all.sh` | renders every deliverable below |
| `out/<plant>_spirals_master_prores422hq.mov` | master, ProRes 422 HQ, 10-bit 4:2:2, bt709 (git-ignored) |
| `out/<plant>_spirals_gold_alpha_prores4444.mov` | the gold alone (thread, numerals, the clearance under each numeral) with alpha, ProRes 4444 (yuva444p12le, 16-bit alpha) (git-ignored) |
| `out/<plant>_spirals_preview.mp4` | H.264 preview of the master (CRF 18, tune grain) |
| `data/<plant>_arms.json` | every arm: its count order, family, the elements on it, their anchor points, the drawn path, the numeral and where it is, start and end times; the descent into the floret; the checks (below) |
| `stills/<plant>_plate16.png` | the plate with no gold, 16-bit (for re-timing the count in the edit over this plate) |
| `stills/<plant>_tNN.NN.png` | stills during and at the end of the count |
| `work/` | trials, contact sheets, the Codex trial (git-ignored; can be deleted) |

Fonts are read from `../frost/fonts/` (IM FELL English, OFL). The numerals are the film's gold-pencil hand
(`tools/kf/comp.py` GLYPHS, imported, not copied).

## Botany: what the drawings follow, and sources

Research was done on 2026-11-25. Photographs were only looked at, never sent to any model: they are Wikimedia Commons
files (CC BY / CC BY-SA / PD) kept outside the repo. The list is below.

**Globe artichoke.** The bracts are counted 5 and 8, not 8 and 13, because that is what the sources report for the
outer bracts of a globe head:
- Pick, "The uneaten artichoke", Princeton University Press blog, companion to *Do Plants Know Math?* (Douady,
  Golé, Dumais et al.). A flattened view of a rotated head gives "5 in one direction, 8 in the other". One French globe
  head had 223 bracts in all, counting the thin inner ones.
- The Redwood Science Project teaching guide (Humboldt) gives 5 steep and 8 shallow bract spirals.
- US plant patents PP12209 and PP12207 give about 38-50 and about 57-62 outer bracts. These were read in search
  snippets only.
- The bract tips follow UPOV TG/184/4 Rev. (artichoke test guidelines: the outer bract apex is acute, flat or
  emarginate; a mucro is present or absent; the violet runs from absent to strong). They also follow a CC BY-SA photo of 'Green Globe'
  (Richard Hoare, geograph 4056091). That photo shows broad, thick, grey-green bracts with a V-notch at the tip and a
  tiny point in it, no spine, and a faint violet-grey flush. The apex of a closed head is rounded to flat. Drawn (until 2026-11-25; now 32 bracts from Jade's photo, see the top): 34 bracts
  with notched, bluntly pointed tips, a low keel, the thickened tip flared a little, grey-green with a violet flush and
  brownish tips on the outer bracts.
- The cultivar is stated as 'Green Globe' because the bract shape is drawn from it. No source gives counts per
  cultivar. Counts rise with head size: a big head can show 8 and 13.

**Romanesco.**
- Azpeitia et al. 2021, "Cauliflower fractal forms arise from perturbations of floral gene networks", *Science*
  373:192, doi:10.1126/science.abg5999. Romanesco's spirals stand out "at all scales"; their figure counts 5 and 8 on
  an ordinary cauliflower. They give no Romanesco numbers.
- Kieffer, Fuller & Jellings 1998, *Planta* 206:34, doi:10.1007/s004250050371 (as cited by Prusinkiewicz et al. 2022,
  *J Exp Bot*, doi:10.1093/jxb/erac101). Romanesco meristems show regular Fibonacci systems.
- The figures for a whole head (8 and 13; 13 and 21) are popular and unsourced. **Confidence in 8 and 13 for the head
  is low to moderate.** For a single floret the options are 5 and 8, or 8 and 13. A top-down photo (Roger Prat, Commons, "Chou Romanesco-inflorescences
  tertiaires") shows about 8 prominent arms per cone, and three levels of cones (Ivar Leidus, Commons).
- Drawn: a head of 129 first-order florets on 8 and 13 parastichies. Each floret is a cone carrying about 60 florets
  on 5 and 8 (measured on its surface), each of those carrying 3 and 5. That makes three visible levels and 240,000 cones.
  The colour is lime, paler at the points.

**Spiral aloe.**
- Glen & Hardy 2000, *Flora of Southern Africa* 5(1,1):41-42, Aloe no. 36: stemless; rosettes 600-800 mm across;
  "leaves ± 150 in a 5-ranked spiral", 100-300 x 40-100 mm; margins cartilaginous, with white teeth.
- PlantZAfrica (Aubrey 2002, SANBI): the spiral "may be clockwise or anti-clockwise"; five ranks of 15-30 leaves;
  broad grey-green leaves with irregularly toothed margins; the tips are usually dark purplish brown and sharp.
- Durrington et al. 2021, *Quantitative Plant Biology* 2:e6, doi:10.1017/qpb.2021.2: 28 clockwise and 22
  anticlockwise in photographs, consistent with 50:50.
- (The brief's "ovate-acuminate" describes the flower bracts. The leaves are broadly triangular-ovate, narrowing to a sharp point.)
- Drawn: 150 leaves; broad triangular-ovate blades, channelled; white margin and small forward teeth; purple-brown
  tips on the older leaves; the youngest upright in the centre. The ranks wind anticlockwise outward on screen, which
  the caption says, adding that plants of either hand are found.

Photographs looked at (Commons file pages): Artichaut_Gros_vert_de_Laon_01.jpg (Bycro, CC BY-SA 4.0);
Artichoke_ready_to_cook.jpg (Keagiles, CC BY-SA 3.0); Globe_Artichoke_-_Green_Globe_-_geograph.org.uk_-_4056091.jpg
(Richard Hoare, CC BY-SA 2.0); Globe_artichoke_on_dining_table_plate_01.JPG (Paasikivi, CC BY-SA 3.0);
Chou_Romanesco-inflorescence_secondaire.jpg and Chou_Romanesco-inflorescences_tertiaires.jpg (Roger Prat, CC BY-SA
3.0); Fractal_Broccoli.jpg (Jon Sullivan, PD); Romanesco_Broccoli.jpg (Donovan Govan, CC BY-SA 3.0);
Romanesco_broccoli_(Brassica_oleracea).jpg (Ivar Leidus, CC BY-SA 4.0); Aloe_polyphylla_spiral.jpg (Just chaos, CC BY
2.0); Spiral_Aloe_from_above.JPG (Sam, CC BY-SA 4.0); Flickr_-_brewbooks_-_Aloe_polyphylla... (brewbooks, CC BY-SA
2.0); Aloe_polyphylla_(spiral_aloe),_close-up... (SaatPilot, CC BY 4.0).

## Method

**The phyllotaxis model** (`plants.py`). Element n (counted from the apex or centre outward) lies at azimuth
n x 137.5078 deg, the golden angle; for the aloe the divergence is 142.8 deg, see below. Element n lies on arm n mod F
of family F.
- Artichoke (until 2026-11-25; now the shared market93 layout, see the entry at the top): the tips lie on an equal-area (Vogel) lattice on the globe, cos(theta_n) = 1 - (n + 1.2)(1 - cos 1.95) /
  (N + 1.2). The bracts rise from the receptacle, and their tips crowd the crown at much the same size.
  A logarithmic lattice was tried first: it shrinks the crown bracts to nothing and swells the outer ones, and read as
  a cabbage. On this lattice the contact spirals change with radius: 3 and 5 at the crown, 5 and 8 over the outer
  bracts. So the count starts at the 5th bract, where 5 and 8 are the contact spirals.
- Romanesco: logarithmic lattices on cones. Children sit at slant distance s0 exp(lnG k sin alpha) on the parent cone (the
  plane's logarithmic lattice rolled onto the cone), with lnG = 2 pi / (sqrt 5 a b) as in
  `layout/sets/market93/phyllo.js`. Each child's size comes from its measured distance to its a- and b-neighbours.
  The head is a 50 deg cone; the florets are 27 deg cones on (8, 13); they carry (5, 8); those carry (3, 5) at 36 deg.
- Aloe: leaf n springs from the centre at azimuth n x 142.8 deg. Its tip radius rises as 1 - 0.93 exp(-n / 65), so mature leaves
  stop lengthening and the rosette is round. Its elevation falls from 78 deg (young) to 28 deg (old). A divergence near 2/5 of a
  turn (144 deg) is what makes five ranks. 142.8 is 1.2 deg short of it, so each rank creeps round by 5 x 142.8 - 720 =
  -6 deg a leaf, about half a turn over a rank's 30 leaves, as in the photographs. With the golden angle (137.5) the ranks
  would wind about 2.7 turns over 150 leaves, which a real plant does not do.

**The drawing** (`engine.py`, `plate.py`). Every element is a 3D surface: a scale for the artichoke, a cone for the
Romanesco, a channelled blade for the aloe. All are sampled densely and splatted into an overhead orthographic z-buffer at 2x
(height, element id, surface coordinates), on the GPU. From the buffers:
- Light from the upper left. The normals are mixed with "local relief" normals, relative to a smoothed surface, so the
  engraver models each bract or leaf more than the whole globe. There is a cast shadow, marched through the height
  buffer, and ambient occlusion for the crevices.
- Hatching in frost's line period (3.3 px), its width carrying the tone. The lines run along each bract or leaf,
  converging to the tip; on a cone they run down the flank from the point. A second hatch crosses them in deep shadow, and near a tip
  (where the long lines would merge) it takes over. Paper is left where the light is.
- Outlines on the lower side of every occluding edge, heavier where the step is high. On the Romanesco they are heavy
  round each first-order floret and light inside it, so the florets read as units. A light band is kept along each
  free margin (the bract's thickness).
- Hand colouring as transparent washes, per element, bled a little past the line and uneven: grey-green with a violet
  flush (artichoke); lime with pale points and a darker floor (Romanesco); grey-green, a white margin and purple-brown
  tips (aloe).
- The ground is frost's horizontal ruling with frost's wobble, darkened by the plant's cast shadow. The sheet
  (paper, foxing, double rule, header, caption) is frost's, with the same seed. The Romanesco's enlarged floret sits in a
  circular inset with a double rule and two leader lines to where it grows on the head. It is the same floret,
  detached and turned to be seen from its point.

**The count** (`spirals.py`, `thread.py`).
- **Anchors.** Each element has one anchor: a cone's apex, which is always on top; or a fixed point on a bract's or
  leaf's exposed part (three quarters of the way to a bract's tip, 0.8 along a leaf). The anchor is checked against the
  z-buffer; if it is hidden, the element's visible centroid is used. An arm is the chain of visible, counted elements n = k (mod F), centre outward.
  Its path is a Catmull-Rom curve through the anchors, smoothed a little along its length on the aloe and the
  artichoke, so the hand does not zigzag through every leaf. Each anchor's distance from the drawn path is in the data.
  On the aloe, an arm stops at the leaf where it reaches the rim (92% of the radius): past it, a rank only runs round
  the rim.
- **Order.** Arm 1 is the one that ends nearest 12 o'clock, then clockwise round the plant. Each arm draws from the centre
  outward, and the count gathers pace: the first arm takes 1.8-2.2x as long as the last. Its numeral is written as the
  arm arrives: the film's gold-pencil hand, stroke by stroke, beyond the arm's end, on bare ground. A soft clearance in
  paper colour knocks the ruling out under the numeral, as neuron's key letters do.
- **Holding the totals.** When a family is done its lines settle to 70% and its numerals to 60%, except the last one,
  the total, which stays at full strength. The clip holds on both totals with every line in place. On the Romanesco, after the head, the thread
  runs along the leader into the enlarged floret and counts it the same way.
- **Gold.** comp.py's gold-pencil colours (GOLD_LIGHT, GOLD_DARK). The pigment catches the paper's tooth (a fixed
  grain field), with pressure along the stroke and a slow hand wobble. A faint umber keyline lies under the gold, and
  the gold burnishes toward leaf (0.93, 0.79, 0.43) where the stroke runs across the light. There is no glow.
- **Speed.** Strokes are precomputed as sparse coverage plus arrival maps, like frost's arrival map, so a frame
  is a threshold and any frame renders alone.

## The checks (in `data/<plant>_arms.json`, `verify`)

Delaunay neighbours among the visible anchors of the counted elements. Long hull edges are dropped. The histogram of
the neighbours' index differences shows which spirals the drawing actually has. "Winding" is measured on screen, walking
outward along an arm.

| Plant, view | Counted elements | Neighbour pairs | Index differences (count) | In the counted families | Winding outward |
|---|---|---|---|---|---|
| artichoke (bract 5 on; 2026-11-25, Jade's ref) | 27 | 49 | 8: 19, 5: 18, 3: 6, 13: 5, 2: 1 | 76% | 5: anticlockwise (-131 deg); 8: clockwise (+44 deg) |
| Romanesco head | 107 | 209 | 8: 99, 13: 94, 5: 8, 21: 8 | 92% | 8: anticlockwise (-241 deg); 13: clockwise (+87 deg) |
| Romanesco floret (inset) | 50 | 87 | 8: 42, 13: 37, 5: 8 | 91% | 8: anticlockwise (-102 deg); 13: clockwise (+36 deg) |
| aloe | 150 | 129 | 5: 123, 10: 3, 58: 2, 2: 1 | 95% | 5: anticlockwise (-174 deg, about half a turn) |

- The two counted families wind opposite ways in every view, as contact parastichies must. The remainder are the next
  Fibonacci number at the rim (13 on the artichoke, 21 on the Romanesco) or the previous one at the centre (3 and 5).
- Arms: artichoke 5 arms of 5-6 bracts and 8 arms of 3-4 bracts. Romanesco head 8 arms of 13-14 florets and 13 arms of 8-9;
  floret 8 arms of 6-7 and 13 arms of 3-4. Aloe 5 arms of 25-27 leaves (to the rim).
- Every anchor lies on its drawn path: max 0.4 px on the artichoke and 0.25 px on the Romanesco. On the aloe the
  smoothing lets the path pass up to 13 px from a leaf's anchor (mean 1-2 px), always on that leaf, whose blade is
  far wider there.
- Floret, surface versus view: measured on its own surface, the floret's florets touch in 5 and 8, as built. Seen from
  above, the pointed cone (27 deg half-angle) foreshortens the radial spacing to 0.45, and the nearest neighbours in the
  drawing are 8 and 13. The inset counts what the drawing shows, which is also what a top-down photo shows (about 8
  prominent arms per cone). The aloe's neighbours across ranks differ by 38 and 43 (5k + 3), not by a Fibonacci number,
  which is why there is no second family to count.

## Timing

All three are locked-off (no camera move), so the plate is the same in every frame and the gold layer registers
with any frame of it.

| Plant | Plate alone | First family | Second family | More | Hold on the totals |
|---|---|---|---|---|---|
| artichoke, 17.0 s (408 frames) | 0-1.5 s | 5 arms, 1.5-7.6 s | 8 arms, 8.6-14.6 s | | 14.6-17.0 s |
| Romanesco, 20.0 s (480 frames) | 0-1.4 s | head 8, 1.4-5.8 s | head 13, 6.4-10.8 s | descent 11.1-12.1 s; floret 8, 12.3-14.6 s; floret 13, 15.0-17.6 s | 17.6-20.0 s |
| aloe, 13.0 s (312 frames) | 0-1.5 s | 5 ranks, 1.5-9.5 s | none | | 9.5-13.0 s |

Each arm's own start and end, and its numeral, are in the data. Arm 1 of the first family ends nearest 12 o'clock and the
count goes clockwise from there. The second family starts nearest 6 o'clock, so the two 1s are on opposite sides.
**For 2:07-2:16** ("the count is one short when the hand takes her forearm"): the artichoke's 8 family reaches 7 at the
`t_end` of count 7 in `data/artichoke_arms.json`. Hold or cut there. For 2:26-2:45 ("the count resumes ... completes
... Romanesco, spiral within spiral"), resume at count 8, then the Romanesco clip.

To re-time the count to the music, give `--timing my.json` with `{"arms": {"main:5:2": [t0, t1], ...}}` (view:family:arm
index; the data file lists every arm's key fields), or edit `CLIPS` in `spirals.py`. Then re-render. The alpha layer can also
be re-timed in the edit, but its numerals and lines are one layer.

## Re-render

```
cd /home/jade/Documents/proof/media/footage/spirals
PY=/home/jade/Documents/halys-video/.venv/bin/python     # numpy, scipy, cv2, PIL, torch + CUDA
./render_all.sh                                           # all three: masters, gold layers, previews, data, stills
$PY spirals.py artichoke --plate work/a.png               # the plate alone
$PY spirals.py romanesco --at 5 10 19.9 --out work/r.png   # stills at times (s)
$PY spirals.py aloe --data work/aloe.json                 # arms and checks only
$PY spirals.py artichoke --movies out --timing my.json    # an edit's own timing
```

Knobs: `plants.py` (counts, number of elements, shapes, divergence); `LAYOUTS`, `CONFIGS` (inks, washes, tone,
relief), `CAPTIONS`, `CLIPS` (passes, times, line and numeral sizes) in `spirals.py`; `NUM_SIZE`, `LINE_W`.

## Codex

One trial, not used. It repainted the artichoke from the code plate as a guide, in tmux session `proof-spirals`, through
`tools/kf/kf.py`'s runner (`work/codex/`). The first call failed: the reference path was relative. The trial kept the
layout almost exactly but inherited the geometry's faults of the time. Fixing the geometry did more, and kept the
registration exact. Both calls are logged in `media/genlog.jsonl` (tag `spirals`).

## Weaknesses

- **The artichoke is the least botanical of the three.** The bracts are rigid planes with a keel, so they read as
  stiff, slightly faceted scales, not fleshy ones. The crown is a little jumbled, and there are only 34 bracts. The
  photographs were the target, and the geometry went through about a dozen versions (`work/a*.png`); the equal-area
  lattice was the step that made it read as an artichoke. A repaint from this plate, registered back to it, is the
  next step if it has to be finer.
- **The artichoke's count starts at the 5th bract.** At the crown the contact spirals are 3 and 5, so the threads start
  a little out from the centre. Near the globe's sides the arms curve strongly in plan, because the sides are
  foreshortened. That is true of a globe seen from above, but it reads less like "rows" than on the Romanesco.
- **The Romanesco's counts rest on weaker sources** (8 and 13 for the head is popular and unsourced; no peer-reviewed
  count was found). The floret's 8 and 13 is the view from above (see the checks), not its surface lattice. The head's
  silhouette is a little hexagonal and lumpy, there are no wrapper leaves, and numerals crowd in places round the inset.
- **The aloe counts one family only** (5), by choice, for accuracy (see above). Its leaves are stiff pleated blades,
  more graphic than fleshy, and its thread is smoothed and wavers a little along each rank.
- **The gold is the film's gold pencil** (ochre with a burnished edge). Over the busy Romanesco the line holds but does not
  shine. Thicken `line` in `CLIPS` if the edit wants it louder.
- **The alpha layer is not only gold:** the clearance under each numeral is paper-coloured at up to 80% alpha. Over
  this plate that is the engraver's knock-out; over anything else it shows as a pale patch.
- The previews are small (1-2 MB) because the plate never moves. The ProRes masters are 300-470 MB.
- **The numerals are tight at the top and bottom of the heads**, where a head nearly fills the pane's height. The
  placer keeps numerals off the plant and apart (`place_numeral`: clearance of 0.55 of a numeral, then sideways). In a
  few places two families' numerals still sit fairly close: the Romanesco's top (8 and 7) and the artichoke's
  bottom (8 and 3). The totals stay brighter than the rest.
- The header is "PHYLLOTAXIS." rather than "THE ARRANGEMENT OF LEAVES.", because bracts are leaves but florets are not.
  The plate number (XVIII; XXI is the spectrogram plate, "THE VOICE."), the figure numbers and the header are
  invented for the film, in the series of frost
  (PLATE XIV) and neuron (PLATE IX).
