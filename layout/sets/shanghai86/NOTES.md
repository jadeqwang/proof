# shanghai86 — notes and assumptions

**Read "2026-11-26: round-3 decisions" first (just below). It overrides every older section where they differ.**

## 2026-11-26 (r4): Jade's r3 review of V1f and V1g (overrides the round-3 sections where they differ)

Files: new `joinery.js` (hall-door leaves + hinges + architraves, bookcases, armchairs, slippers); `build.js` (narrow
edits: imports, the hall-door leaves / bookcase / armchair calls, slippers after staging, jamb linings, suite colour);
`shots.js` (V1f restaged, the CROWD staging, socks, four new REF shots). The bookcases wear the background-art agent's
fixed spine textures (`art.js` `spineArt`) on every upright book; its old spine planes went with the old bookcase block.

**Hinges (V1f: "the hinges look like a messed up notebook").** Two causes, both fixed. (1) The jamb frame boxes shared
the plane of the wall's reveal; the z-fight drew a comb of pixel noise down both jambs in line/flat/lit (the painters
copied it). The jamb and head linings now sit inside the opening, 2 cm proud of the reveal. (2) Each pair of leaves was
two copies hinged at the same jamb 4.5 cm apart, glazing bars overlapping. Now each pair really folds: leaf A hangs on the
jamb and stands open 90 deg into the hall; leaf B hangs on A's far edge and folds flat back against A's inner face (13 mm
off it, the knuckle's diameter). Hinges: cast-brass loose-pin butt hinges, 100 x 75 mm, five knuckles, a ball-tipped pin,
two plates mortised into the jamb lining / the leaf edges, three slotted screws per plate; three per leaf at the usual
setting-out (top hinge 180 mm below the head, bottom 250 mm above the floor, the third halfway), six per pair. Leaves:
teak-stained, 45 mm, stiles 95 mm, a raised bottom panel, a lock rail, a glazed sash of 5 x 2 lites with beads; the
meeting leaf (B) carries a lever handle on a backplate, a keyhole and flush bolts. Architraves with a bead and plinth
blocks on both faces, a teak threshold. Brass, the leaf construction and the hinge setting-out are standard 1930s
practice, my choice (no photo of the actual doors). See REF_hinges, REF_hinge_close.

**V1f restaged: over Mother's shoulder from the hall (Jade's suggestion).** Camera (2.9, 1.72, -7.05), 30 mm, aimed at her
head. Sight lines: the west bookcase run ends at x 0.18, 0.07 m short of the west jamb, so from the hall only a point east
of the line through her spot (-1.77, -3.89) and the bookcase's corner (0.18, -5.72) can see her; every adult stands east
of it (clearance at the feet: Mother 0.81 m, uncle 0.29, grandmother 1.39, aunt 1.80). All four turn their bodies to her
and look at her head (`head.look: 'jade3:head'`; eyes follow once the gaze module is on): the grandmother stooping on the
threshold (1.97, -6.12), a hand at her mouth; the aunt at the left (2.39, -6.12), leaning in, a hand at her mouth;
Mother nearest the camera (2.16, -6.81), frame right, the back of her head and her left shoulder; the uncle beyond
Mother's right shoulder (1.58, -6.76), peering over. None is in the room (feet at z <= -6.10, the threshold line). The
child, small in the sun at the couch group, stays absorbed in her paper (she looks up in V1g).
- **Flag:** Mother has stepped back ~0.6 m into the hall and ~1.4 m east from her V1e spot at the west end of the doorway
  (her hand on the jamb). From the west end nobody can be over her shoulder AND see the child (the bookcase end is in the
  way). REF_plan / REF_wide now show this staging.

**Slippers (Jade: "socks inside slippers, not shoes indoors").** Every adult in every shanghai shot (Mother, uncle,
aunt, grandmother) wears winter cotton-padded mules (棉拖鞋) over socks, built on each figure's heel/toe/ankle points
(`joinery.js slippers`): a thick pale sole, a padded dome over the toes and instep, the heel open so the sock shows.
Uppers: Mother black corduroy, grandmother maroon velvet, aunt navy, uncle dark brown on a dark rubber sole. Socks via
`costume.sock`: Mother grey-beige, grandmother dark brown wool, aunt pale mauve, uncle pale grey nylon (costume audit).
Colours are my choice. **The painting prompts still say "black cotton cloth shoes"** (r3 `_prompts/make_prompts.py`,
Mother; `cast/strangers/uncle/uncle_v1.txt`): r4 prompts must say socks in cotton-padded slippers. The toddler's feet are
skin-coloured in the guides (the engine draws a 'daughter' with bare feet); the prompts give her thick knitted socks.

**V1g: books vs shelving, armchairs.** Bookcases rebuilt (`joinery.js bookcases`), per unit: a set-back plinth, a
two-door cupboard with raised panels, brass knobs and a keyhole to 0.84 m, a counter ledge with a rounded nosing
(0.84-0.87), then a glazed two-door case to 2.0 m (slim frames, a glazing bar, knobs), a pale back inside, two shelf boards
(1.245, 1.62) with pale front edges, pale upright edges, a cornice. Books: individual spines on three decks, 1980s sizes
(32开 0.185, 大32开 0.203-0.21, 16开 0.26, small 0.15), mostly paper spines in cream / off-white / pale green / blue / grey /
ochre / brick red, cloth-bound runs in navy / dark green / maroon / brown; horizontal stacks, gaps, a leaning book. No
shelf ornaments (the background-art agent's). Armchairs (`joinery.js armchair`): a 1950s-80s Shanghai upholstered
armchair: four tapered dark legs, a sprung base with a welt, a loose seat cushion with piping, a curved reclined back with
a cushion and a top roll, rolled arms with piped scroll fronts, crocheted covers over the back and both arm rolls.
- **Colour (my choice, flag):** the suite (couch and three armchairs) is now a muted olive-green wool (0x5c6a4e). The old
  khaki was the plaster's value in the shade: in V1g the L armchair behind her read as wall, which is why the r3 painting
  invented an armchair and moved the books. Jade has never said the colour: question below.
- In V1g the frame behind her now holds the L armchair (green back, cushion, crocheted cover) and the bookcase's cupboard
  doors and ledge; no books are in frame at her head's height.

**References added:** REF_hinges, REF_hinge_close, REF_shelves, REF_armchairs (not shots).

**Repaint in r4 (from these changes):** V1f (new camera and staging, hinges, slippers), V1g (armchair and bookcase), and,
for the suite colour / bookcases / slippers, every shot that shows them: V1a, V1b, V1c, V1d_8_end, V1e, V1h (the corner of
the L armchair, top left). PB1: not affected.

**Questions for Jade (proposed):**
- sh_suite_colour: what colour were the couch and armchairs? (a) muted olive-green wool [as built] (b) brown / rust
  (c) khaki-beige with white covers (d) not sure. Img: shanghai86/REF_armchairs_lit.png

## 2026-11-26: round-3 decisions

Jade's answers (`work/decisions/JADE_R3_DECISIONS.md`, verbatim) and what was built. Files: `layout.js`, `build.js`,
`shots.js`, `sweep.mjs`/`sweep2.mjs` (now ignore the cheat), new `sweep_cheat.mjs`. The pre-change renders are snapshotted
for the r3 review page at `media/keyframes/r3/_layout_snapshot/shanghai86/`.

### 1. The sun: 09:30, CHEATED lower (Jade: "9:30 with a cheated, lower sun (only just reaches you)")
| | elevation | azimuth | rel. to facade normal | profile angle |
|---|---|---|---|---|
| REAL sun, 1986-12-21 09:30 CST (NOAA) | 25.67 deg | 143.76 deg | 23.0 deg east | 27.4 deg |
| CHEATED sun used in the set (`SCENE.cheat`) | **21.0 deg** | 143.76 deg (kept) | 23.0 deg east | 22.6 deg |
| (round 2, for comparison: real 08:30) | 17.1 | 132.2 | 34.6 east | 20.5 |

- Only the elevation is cheated (4.7 deg lower); the azimuth is the real 09:30 one. `layout.js`: `CHEAT_ELEV`,
  `REAL_SUN`, `SCENE = { ..., time: '09:30', cheat: { elev, rel } }`; the sidecars' `beam.sun.status` says CHEATED and
  carry `real_sun_at_this_time`.
- How 21.0 was picked: `node layout/sets/shanghai86/sweep_cheat.mjs` lowers the 09:30 sun in 0.5 deg steps and prints the
  margin to the light's edge at her eyes, crown and chin. 21.0 is the highest sun at which her eyes are still lit in
  every shot of hers; 21.5 puts her eyes in shade in V1a.
- **What "only just reaches her face" looks like** (margins in m, > 0 inside the light, from the new sidecars):

  | shot | eyes | crown (head + 9 cm) | chin |
  |---|---|---|---|
  | V1a (state A) | +0.05 | -0.06 | +0.12 |
  | V1c | +0.05 | -0.02 | +0.05 |
  | V1e | +0.05 | +0.03 | +0.05 |
  | V1g | +0.08 | +0.01 | +0.08 |
  | (the real 09:30 sun, for comparison) | -0.30 to -0.39 | | |

  In V1a the top edge of the light (the balcony overhang's shadow) crosses her head between brow and crown. In state B
  the edge is at her crown, and a pier's shadow edge runs down the back of her head (V1g: a clean vertical line, face
  lit, back of the head dark). Her hands in the tearing shots are right at the edge too (V1c right hand -0.001).
- The uncle's hands (state A): ~0.13 m inside at the held object; his head and body are in shade.
- Light study (`lightstudy/`) not re-rendered: it is the round-2 comparison and its row 3 is the same kind of cheat (19 deg).

### 2. Room: as built (10.5 m along the balcony). Unchanged.

### 3. Wicker lounge chair: WEST of her small wooden table and chair, facing the TV
- `LOUNGER.at` (1.75, -1.45), yaw 111 (computed to face the TV on the east wall); its foot end ~0.3 m clear of her table's
  west edge (table x 2.7-3.3). See REF_plan, REF_wide, REF_doors.
- **Flag:** the TV is ~5.5 m away and the dining table (with its chairs) stands partly in the line of sight. Jade asked for
  this spot, so it stays; if it bothers her, the dining table could shift north.

### 4. The uncle: ON the couch, at its end nearest her (Jade's card: "The end of the couch")
- Jade chose "The end of the couch" over the separate option "The armchair, with your face in his shadow", so he sits ON
  the couch: perched on the front edge of its NORTH end seat (the end nearest her), pelvis (-2.19, -3.53), leaning in
  (spine bend 40). No chair was added for him; the r3 pulled-up 'across' armchair is gone and every armchair stands where
  the round-4 room had it, in both states (`UNCLE_CHAIR` is now null).
- He is west-south-west of her; the sun comes from the SSE, so he cannot come between her face and the light.
- His hands: low (0.49 m) on her side, just in front of her and a little east (`uncleHands` (HX+0.17, 0.49, HZ+0.13)),
  ~0.12 m inside the light. Further west they would fall into a pier's shadow, which runs just west of her at this sun.
  Arm reach is at its limit (IK reach fraction 1.0).
- **V1a camera** re-aimed: orbit about her eyes, az = her eye-line to his hands + 70 deg, 1.3 m, el 4 (from the east-north-
  east). She is three-quarter, looking at his hands beside her face; his knees, forearms, watch and hands fill frame
  left, his head out of frame. Her eyes are +0.06 m inside the light (crown at the edge). Her near cheek is on her shade
  side from this angle (the lit side faces the doors): the light reads on her far cheek, her shoulder and his hands.
- V1b (from just behind her eyes onto his hands): now from her side, his left wrist and watch face turned up to her, the
  object in his cupped right hand; the armchair and the balcony doors beyond.

### 5. Balcony: white wicker chair at the WEST END; white-painted iron railings
- `BALCONY_CHAIR.at` (-2.8, 0.95), 0.45 m from the balcony's west end, by the front railing, facing east along the
  balcony (facing is my choice). New reference camera **REF_balcony** (inside, near the couch group, looking out at it).
- `BALCONY.solid = false`, `railing: 'iron, painted white'`: flat-bar handrail at 0.95 m, a bottom rail, 16 mm square
  balusters every 0.11 m, a heavier post every ~1.5 m, on an 8 cm concrete curb, along the front and returning at both
  ends. **Proportions, curb and pattern are my guesses** (plain verticals; a 1930s railing might have had a deco motif).
- **Flag (facts):** the 1934 drawings (`inputs/refs_shanghai/README.md`) show SOLID parapets on the east unit and iron
  railings on the WEST unit. Jade's memory wins. Either the parapet was replaced, or the flat is the west one; worth a
  question (below).
- Beam: the parapet no longer trims the light; only the curb does (`apertureFor`, 'railing curb'). The balusters' shadows
  come from the lit-mode shadow maps (stripes on the balcony floor and just inside the doors); the analytic beam masks
  (`beam_*`) do not include them.

### Open issue fixed: V1h steam "a stick in a mug"
- The steam was two straight 0.42 m tubes per mug from the mug's centre. Now three thin wisps per mug, starting at
  different points of the rim, drifting sideways as they rise (0.20-0.26 m), the curl growing with height, broken into
  four fading dashes (`teaAndSteam` in build.js). In V1h (top-down POV, where any rising wisp foreshortens into a rod)
  the shot sets `steam: 'soft'`: no opaque line tubes, only the faint volume, so the guides show no sticks.

### Not fixed (engine, not mine to edit)
- V1g: her fringe stands off her forehead (a box hovering in front of the brow, also visible in V1c's light guide). It
  lives in `layout/engine/mannequin.js`.
- Note: another agent was editing `layout/engine/mannequin.js` / `torso.js` during this pass (a syntax error there broke
  all renders for ~2 minutes, then was fixed). The figures in these renders use whatever torso that engine has now.

### Repaint in r4
All the lit shots changed light (09:30 cheat, railings): V1a (uncle on the couch end + new camera), V1b (new hands, new camera
position), V1c, V1d_1/2/4/8, V1d_8_end, V1e, V1f, V1g, V1h, PB1. Reference: REF_plan, REF_wide, REF_doors, REF_latch,
REF_beam, new REF_balcony.

### Questions for Jade (proposed)
- **sh_railing_flat**: the 1934 drawings show white iron railings only on the WEST flat's balconies; the east flat had a
  solid parapet. (a) the railings were in our (east) flat anyway [rec: keep as built] (b) we were in the west flat
  (c) not sure. Img: shanghai86/REF_balcony_lit.png



## 2026-11-26 (round 3: Jade's r2 keyframe review)

Jade's notes (`media/keyframes/r3/JADE_R2_REVIEW.md`) and what was built. Files: `layout.js`, `build.js`, `paper.js`, `shots.js`.

- **V1a, uncle in an ARMCHAIR (my choice: flag).** State A only: the 'across' armchair is pulled up to the table's
  NORTH end, EAST of her, turned to face her (`UNCLE_CHAIR`, at (-0.78, -3.98), yaw -85; in state B it is back across
  the table). Why there: the 08:30 sun comes from her SSE (yaw ~35 deg), so nothing due east or north of her can come
  between her face and the sun. The couch-south-end ('opposite') armchair was 2.6 m away across the table, too far to
  show her something small. His hands now (-1.35, 0.50, -3.87), 0.42 m in front of her, 8 cm over table height, lit.
  V1a camera now 62 deg to the window side of her eye-line (was 38): she is three-quarter, lit, his knee and hands at
  frame right, his head out of frame.
- **V1b, watch face visible.** The hands are swapped: his RIGHT hand cups palm-up, his LEFT (the watch hand) pinches
  from above palm-down, so the back of the left wrist and the watch face turn up toward her. New prop `wristWatch()`
  (band round the forearm, case + face on the back of the wrist). V1b camera 0.62 m (was 0.5), the pellet lower in frame
  so the wrist and watch are in.
- **Tiny pieces (V1c, V1d_*, V1h).** New `paperProps()` (build.js) driven by `shot.paper` (`rip`, `held`, `laid`, `bits`)
  and `splitPiece()` (paper.js). One piece followed through: P0 = generation 6 (2.2 x 3.0 cm). V1c: P0 mid-rip held
  up at her chin (tilted 35 deg, V1c camera el 5 so her face clears her hands). V1d_1: P0, the tear just starting.
  V1d_2: its halves (gen 7, ~2.2 x 1.5 cm): left hand holds one up, right hand puts the other down flat at `PD`.
  V1d_4: the kept half ripped again (two ~1 cm bits, mid-rip); the put-down half lies at PD. (Reading of "takes the
  half from the clip above": the half she KEPT; flag.) V1d_8: a generation-11 bit (~7 x 8 mm, halves ~4-7 mm)
  between four fingertips, a close POV (50 mm, 0.26 m). V1h: a heap of 36 gen 9-11 bits (2-8 mm) on the clear patch.
- **Hands:** tearing pinches via `tip: index` + `pinch` (palm in, thumbs on top, index fingers under, fingers forward
  and a little down), two pinches 0.9-1.6 cm apart. Child-3 reach limits the hands to ~0.36 m in front of her (just off
  the table's north edge); further and the arms fall short.
- **POV cameras (V1d_1/2/4):** new close POV from her eyes onto her hands (35 mm, 0.40 m, el 50); the table's NW corner
  and two straight edges are in frame (Jade: "coffee table was an impossible shape").
- **V1d_8 is two cameras:** `V1d_8` (POV hands close-up, start of the pan) and new `V1d_8_end` (the pan's end: from her
  eyes, low, across the room to Mother in the hall doorway). `V1d_8.move` names the pan.
- **V1f: relatives at the hall doorway.** Grandmother (now standing), aunt and uncle stand in the hall just past the
  threshold east of Mother (GM (1.75,-6.36), AU (2.3,-6.42), UL (2.05,-6.8)), leaning in, laughing. The 'across' armchair
  is empty in state B now. V1f camera: from her eyes, low, 40 mm, onto the doorway. `ADULTS` = the doorway.
- **V1g:** she turns her head toward the laughter (frame right), now a near-profile (the doorway is behind her left
  shoulder; the head look is aimed ~40 deg left, not at the doorway itself, so her face still reads).
- **V1h:** its own POV (was `same: V1d_8`): the heap of tiny bits in the lower middle, the big stack upper right.
- **Stack:** `PAPER.stack` 34 -> 200 sheets (~7 cm; Jade: "a large stack visible nearby"). Visible in V1c, V1e, V1g, V1h.
- **V1e** (Jade: Good): camera unchanged, but the set changed visibly since r2 (no lounger, wide doorway, 08:30 bands,
  big stack): repainted with the r2 pick as a look reference.
- Renders: all modes + sidecars (`--exclude beam_`), masks, form/contour/light guides. Sidecar `tissue.paper_r3` lists
  each piece (what, generation, size in cm, world centre).

## 2026-11-25 (round 2b: brighter shade, Jade)

Jade: "the Shanghai living room ... should have higher ambient light, in addition to the visible shadows, so the image
models can tell what's going on." Lit mode only (`build.js` rig, values in `LIGHTS` in `layout.js`). Sun, staging,
cameras, flat mode and the beam masks are unchanged (the masks are still sun-only; flat/mask PNGs came out identical).

| lit-mode light | before | after |
|---|---|---|
| sun (shadowed directional) | 6.5 | 6.5 (unchanged) |
| sky point / north point / floor bounce point | 1.3 / 0.6 / 0.55 | unchanged |
| ambient `0x8a8478` | 0.7 | **1.4** (`LIGHTS.amb.I`) |
| sky fill: shadowless directional `0xdfe6ee` from the balcony doors, (1.5,1.6,4.0) -> (2.25,0.6,-3.0) | none | **0.9** (`LIGHTS.skyFill.I`) |
| walls/ceiling bounce: hemisphere `0xe6e8ea` above / `0xb09878` below | none | **0.9** (`LIGHTS.hemi.I`) |

- A per-shot `light: { fill }` multiplier scales all three fill terms (default 1); `light.amb` still overrides the ambient.
- Result: the shade side of both figures, the couch, the armchairs, the bookcases, the coffee table's apron and the
  paper bits now read (the shade was near-black). Mean frame grey, before -> after: V1a 175 -> 198, V1b 152 -> 176,
  V1c 172 -> 195, V1g 171 -> 195, REF_wide 158 -> 180, V1d_4 159 -> 184. The sun bands and
  stile/pier shadows are still crisp (fill casts no shadows), just with lighter shade between them. Sunlit pale things
  (mugs, paper, her face) were already near clipping and still are.
- Light study (`lightstudy/`, same build) re-rendered and the sheets rebuilt.

## 2026-11-25 (round 2 answers)

Jade's directions (decision page, round 2) and what was built. Files: `layout.js`, `build.js`, `shots.js`, `lightstudy/`,
new `sweep2.mjs` (a one-day, minute-by-minute sun sweep for the new geometry).

### 1. The light: moved, honestly, so she is lit (she was NOT moved)
- **Jade**: "move the angle of the light so she's lit" (at 09:30 her face was in shade).
- **New sun: 1986-12-21 08:30 CST. Honest (not a cheat).** Elevation **17.1 deg**, azimuth **132.2 deg** (34.6 deg east of
  the facade normal), profile 20.5 deg. The same day Jade chose, one hour earlier; she also liked 08:30 in the first
  light study.
- **Why 08:30 and not later.** With her cross-legged (eyes 0.53 m up, 3.9 m into the room), the light only reaches her
  face when the profile angle is about 21 deg or less. On 21 Dec, `sweep2.mjs` lights her face and hands (≥ 5 cm
  inside) from 07:42 to 08:38 only. 08:30 is the latest time with a margin; 08:40 leaves 3 cm.
- **What is lit at 08:30** (sidecars):
  - her eyes 0.25-0.34 m inside the light, her hands 0.40-0.62 m inside, in both scenes;
  - the steam: 65 of 66 samples; all three mugs, the stack, the clear patch and the hero pieces; the whole coffee table;
  - state A: the uncle's hands 0.30-0.41 m inside; his head is just outside (-0.14).
- **Mother is not lit.** Her nearest point is 0.79 m outside the light; the nearest lit floor is 0.23 m from the hall
  opening (on the boards west of it).
- **The cheat, for comparison** (light study row 3, not used): keep the 09:30 azimuth (143.8) and lower the sun from
  25.7 to 19 deg. Her face is then only ~4 cm inside, because a pier between two bays shades her at that azimuth.
  Not worth it, since the honest 08:30 does better.
- **Side effects, honest, flag to Jade:**
  - with doors along the whole wall there is no longer "a shaft" but a broad sheet of light in bands: the piers and
    stiles throw the dark stripes. One stile shadow falls across her cheek in V1a/V1c (it moves fast; a minute either
    way shifts it).
  - The laughing adults are no longer in the dark: their heads are out of the light (aunt -0.23, uncle -0.70) but
    their bodies and hands are lit, and grandmother's eyes are right at the edge (0.00).
  - V1b is backlit: she faces the sun, so she sees the shaded side of his hands, with a rim of light.

### 2. The south side: continuous balcony doors with latches (Jade: there is NO window wall)
- The six- and four-leaf French windows are gone. The whole south wall is **glazed steel French doors** onto the one
  continuous balcony (10.5 m + 0.25 m each end).
- **Layout** (`WINDOWS` in layout.js; old name kept for the beam code):
  - four bays of four leaves, each bay 2.275 m, leaves 0.57 m, head 2.3 m;
  - between them, structural piers 0.25 m at the ends and 0.30 m between bays;
  - each leaf has a 0.2 m solid kick rail with six lites above it; the doors are closed (winter).
  - **Guesses:** bay count, pier widths and leaf width. Jade said only "continuous doors".
- **Latches** (one set per pair, on the room side of the meeting stiles):
  - a cremone (espagnolette) rod running the full height, with keepers at the head and the sill;
  - a gearbox backplate with a lever handle hanging down (locked);
  - two barrel bolts (top and bottom) on the fixed leaf.
  - Reference views: `REF_doors` and `REF_latch`. The hardware type is my guess for 1930s steel doors.
- The balcony parapet stays solid (east flat). The balcony shades the parapet side, so the chair out there is in shade.

### 3. The room widened (Jade: "the side walls might be wider than pictured")
- **Widened 0.5 m at each end: 9.5 -> 10.5 m** along the facade. That is 2.1x the 1934 drawing's 5.0 m living room,
  the top of Jade's earlier "1.5 or 2x".
- Symmetric, so the north wall's centre stays at x 2.25, and the 4.0 m hall doors stay centred on it (item 6: no move).
- **What moved:** the couch group, the scrolls, the painting and her spot all moved 0.5 m west with the west wall; her
  equidistant spot is now (-1.77, -3.89), with the same gaps. The TV, sideboard, radiator, clock and calendar followed
  the east wall (+0.5). The dining table and her small table stay where they were.
- **Flag (reading):** "side walls wider" might instead mean the side walls are LONGER, i.e. the room is deeper than
  6.1 m. That would put her further from the doors and make lighting her harder still. Asked on the decision page.

### 4. White wicker chair on the balcony (Jade)
- `BALCONY_CHAIR`: a round-backed tub armchair (白藤椅), 0.62 m wide, back 0.88 m.
- It stands at (0.95, 0.95), in front of bay 2 by the parapet, turned sideways (facing east along the balcony).
- **Where along the balcony, and which way it faces, are my choice.**

### 5. The wicker lounger faces the TV (Jade)
- **The TV exists:** a 14" set under a cloth, on the TV cabinet on the EAST wall (Jade, round 3b).
- From the lounger's round-4 spot (by the west doors) the TV was ~6.5 m away, with the dining table and its chairs in
  the line of sight. So **the lounger moved to the room's east end**, at (6.05, -1.05), south of the dining table, with its
  feet toward the TV ~2.1 m away. The yaw is computed from the TV's position.
- **My choice: flag.** The alternatives (lounger back west and turned toward a far TV, or the TV moved west) are asked
  on the decision page.

### 6. Hall doorway: unchanged
- Still centred on the whole north wall at x 2.25, 4.0 m wide. The symmetric widening did not move the wall's centre.

### 7. Cross-legged in both scenes (Jade)
- **State A** (`jadeWatch`) uses `legs: 'cross'`, like state B.
- **His hands** were lowered to 0.50 m, about her eye height, so she looks at them nearly level.
- **The uncle moved, from the 'across' armchair to the front edge of the couch's north seat.** At 08:30 the sun stands
  south-east of her, and from the armchair (east of the table) his body stood between her face and the sun and
  shaded it. On the couch he is west of her.
  - His arms reach without over-reach (figure report 0.94 / 0.72).
  - His hands are in the light between them, just west of the table's north-west corner.
- **Cameras:**
  - V1a: 50 mm, 38 deg off her eye-line on the window side. Her face is lit and three-quarter to camera; his arms and
    hands come in frame left; his head is out of frame.
  - V1b: el 22, 0.5 m. The camera is ~0.1 m above her cross-legged eye height (as if she sits up tall), so the
    cupped palm reads.
- **State B is unchanged** apart from the 0.5 m shift west.

### Light study (re-rendered; sheets `media/layout/_sheets/shanghai86_lightstudy{,_flat}.jpg`)
- **Rows:**
  1. 08:30, honest (the set default);
  2. 09:30, Jade's earlier pick (her face in shade);
  3. CHEAT: the 09:30 azimuth with the sun at 19 deg;
  4. 08:00, honest;
  5. 15:00, honest.
- The EYE column is now at her cross-legged eye height (0.53).

### Renders
- All shots in five modes, plus the beam twins, the sheets and the gallery. New reference views: `REF_doors`, `REF_latch`.
  The REF_plan frame was widened to show the balcony and the chair.
- **Not fixed:**
  - the V1g fringe plank (engine, `mannequin.js`);
  - V1g's framing: her head sits frame-left with a mug filling the right third, as before this round.

### Open (ask Jade)
- 08:30 instead of 09:30 (honest), or keep 09:30 with the sun cheated lower?
- Is "side walls wider" the room's length along the balcony (built: +1.0 m) or its depth?
- The lounger at the east end by the TV: right?
- Where the wicker chair sits on the balcony.
- The uncle on the couch end in state A (he moved so he does not shade her face).

Set for verse 1 (0:30-0:59) and bars 1-4 of the piano break (0:59-1:09). Numbers live in `layout.js`.

## Assumptions (the plan leaves these open)
- **Room**: one upstairs room of a lilong house, 3.6 x 4.4 m, ceiling 2.9 m. Window in the left wall, door in the right
  wall opposite it, bed with a mosquito-net frame along the back wall, wardrobe, chest of drawers (radio, thermoses,
  clock), square table and stools in the front-left corner. Main cameras look toward -z, so the beam runs upper left
  to lower right across the frame.
- **Beam**: afternoon sun, elevation 40 deg, swung 12 deg toward the back wall, through a 1.0 x 1.15 m casement
  (sill 0.95). It lands on the floorboards mid-room as a parallelogram about 1.37 x 1.0 m. `BEAM_SOURCE`, `SUN_DIR`,
  `beamFootprint(y)` and `inBeam(p)` define the lit volume; each sidecar carries `beam` (source and footprint in world
  and px, and which heads/hands are inside it).
- **The drift is on the floor**, because the lyric is "my mother finds me sat in a snow drift of paper". She sits in
  the pool of light facing the main camera. The paper is rough tissue (草纸), one sheet 19 cm square.
- **Two states.** `state: 'A'` = the uncle explains (he sits on a stool with his back three-quarters to camera, hands
  low in the shaft, head above it; she stands watching; no drift). Default state B = a week later (the drift).
- **Doubling**: `tissue: 1 | 2 | 4 | 8` is the generation she is on; 1 and 2 are held, 4 and 8 are laid on a clear patch
  in front of her. One locked inside camera (`TISSUE_CAM`) serves all four so the gold dots can double in place.
- **Mother** stands in the doorway, where the shaft points but does not reach. **The laughing adults** (aunt, the
  uncle, grandmother on the bed edge) are by the door, all outside the shaft; Mother is the only drawn face.
- **Her face is inside the shaft** when she sits (it is 0.76 m tall there), so outside shots see a lit face.
- Cast heights: little Jade (3) 0.95 m, uncle 1.70, Mother 1.60, aunt 1.58, grandmother 1.50. Registered set-locally
  in `build.js` (the engine's `mannequin.js` is not edited).

## Engine notes
- `common.js` holds set-local helpers. `fixLeftHands` corrects an engine quirk: left hands are built from a mirror
  basis passed through a rotation-only quaternion, so they come out mis-oriented. The engine is left as it is.
- Label mode tints the lit volume and its footprint yellow. Line mode outlines the lit pool on the floor and fills the
  unlit floor pale grey (`beamLine: false` on a shot turns that off). `lit` is a mood preview only.
- `REF_plan` and `REF_wide` are reference views, not shots.

## Not done
- V1b: the mannequin's mitt hands only indicate "two hands closing on something small"; the pinch is not legible.
- PB1 gives the start frame and an end position; the descent below about 5 cm is the renderer's, not the set's.
- No mote field and no beam-mask render mode yet: the mask is to be rendered from the `beam` geometry.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. `fixLeftHands` in `common.js` is now a no-op (it was only approximate: the hand it produced was still 15-20 % short and a few degrees off). `V1b` after the change: the uncle's two hands meet round the small ball.
- **Cast.** `jade3` and Mama = `mama86` (was `mother`) come from `../_cast.js`; `uncle`, `aunt`, `grandma` stay local.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set shanghai86 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/shanghai86_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (the window opening swept along SUN_DIR to the floor), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: REF_plan / REF_wide / V1a / V1c / V1e / V1g show the shaft. Saturated: `PB1`, `V1d_1/2/4/8`, `V1h` are white over the whole frame (her point of view down into the pool of light: everything in frame is lit); `V1f` is black (the camera is in the shaft, looking at the adults outside it).

## 2026-11-25: Xiefa living room, from Jade + 1934 drawings (SUPERSEDES everything above)

The lilong bedroom (bed, mosquito net, casement, 19 cm tissue on the floor, sun "elev 40, swung 12") is gone. Sources:
`inputs/refs_shanghai/README.md` (1934 "1st, 2nd & 3rd FLOOR PLAN", elevations, plot plan) and Jade (HANDOFF.md).

### Facts (Jade)
- 协发公寓 / Xiefa Apartments ("Yafa Court"), 253 Wuyuan Rd, Robert Fan, 1933-34. **EAST flat** (the one 俞振飞 lived
  in), **三楼** counted with the ground floor as 1st. The family had the whole floor. The scene is the LIVING ROOM.
- French windows onto a balcony; French doors from the hallway (Mother's doorway); no bed.
- Three-seat cushioned couch pushed against a side wall, coffee table near it, a few armchairs, a wicker lounger.
- She sat equidistant from the couch, an armchair and the coffee table.
- 草纸 sheets ~16 x 23 cm; she brought a STACK to the table; hand-torn halves, quarters ... down to fingertip confetti
  (1/256 ~ 1.0 x 1.4 cm, 1/512 ~ 0.7 x 1.0 cm). Steaming mugs of green tea on the table.

### Staging choices (not memory) and research numbers
- **Date and time: 1986-12-15, 15:00 CST.** Jade does not remember the season; mid-December mid-afternoon is chosen
  for the long low beam. `SCENE` in `layout.js` is the only switch: sun, aperture, footprints, `inBeam`, sidecars follow.
- **Sun** (NOAA equations in `sunPosition`, 31.2138 N 121.4390 E, UTC+8; checks against `sun_table_1986.txt` to
  0.1 deg): elevation **18.97 deg**, azimuth **225.9 deg** = 59.1 deg west of the facade normal (166.8 deg); profile
  angle in section 33.8 deg. Per metre into the room the light goes 1.67 m east and drops 0.67 m.
  `SUN_DIR = [0.812, -0.325, -0.486]` in room axes.
- **Axes are the building's**: x = along the facade (+ = building east, 76.8 deg), z = out through the windows
  (166.8 deg). Floor y = 0. Window wall inner face z = 0, north wall z = -6.1.
- Room 5.0 x 6.1 m, ceiling 3.05 (storey 3.25), waxed wooden floor; 3.0 m opening (head 2.65) north into a 5.0 x 4.4 m
  dining room (round table, chairs, sideboard, north window); south wall 0.28 thick with six steel French windows,
  3.6 m wide, glass 0.16 m in, head 2.3 m, 6 lites per leaf; balcony 5.5 x 1.25 one step down with a **solid parapet**
  0.95 m (east flat), the balcony above = 1.25 m overhang (soffit 3.08). Hall French doors (pair, glazed, opening
  into the hall) in the **east wall** from 2.45 to 3.55 m back, transom 气窗 above (2.28-2.72), hall with closets.
- The opening's position along the north wall, the door leaves' swing (into the hall), the exact wall thicknesses and
  the window's glass depth are guesses; the drawing is read at +/-0.2 m.
- Outside, for the views: garden 6.6 m below (三楼), Residences A/B as boxes ~18-26 m south, hazy sky. At 15:00 the
  ray to the sun passes ~11 m above their roofs: they do not shade the window. Plane trees are not modelled (unknown).
- `FLAT = 'west'` mirrors the hall side (doors in the west wall, iron-railed balcony that cuts no light at the
  bottom, TV / far armchair / photo moved clear of the doors). The sun is never mirrored and the furniture group stays
  on the building-east side. In the west flat Mother is ~6 m west of the beam: the shaft does not point at her.

### The beam (honest)
- Lit aperture = window opening minus the shadows of the outer west jamb, the head, the overhang, the front parapet
  and the west end of the parapet, each a half-plane (`HALF` in layout.js), so it is convex. `BEAM_SOURCE` = that
  polygon carried to the inner wall face: top 2.06 m (the overhang trims 0.24 m off the 2.3 m head), west edge
  x -1.33 (the jamb hides the westmost 0.2 m), west parapet notch at the bottom-west, east edge x 1.8. Glazing bars and
  stiles are real geometry: their shadows are in flat / lit / line, not cut out of the mask (as before).
- **Where it lands**: on the floor, a quadrilateral (-0.40,0)-(1.80,0)-(2.50,-0.42)-(2.50,-2.29)-(-0.40,-0.56): it
  never comes west of x -0.4 at the glass or deeper than 2.29 m; on the east wall a parallelogram from 0.42 to 2.29 m
  in, its top falling from 1.78 to 0.52 m (the couch takes most of it; the calendar above the couch is half lit). It
  does not reach the ceiling, the west wall or the dining room.
- **Her**: face, eyes, hands, hips all in the light (eyes 0.45 m inside the beam's west edge in state B, 0.9 m in state
  A). Her face is lit because she faces WEST, into the light (31 deg off the sun).
- **The table**: south-east part lit (the focus patch, all three mugs, the eight hero pieces); the light's west edge
  crosses the table diagonally, so its north-west corner and **the stack are in shade** (honest, not moved).
- **Steam**: all 66 sampled steam points of the six wisps are inside the beam.
- **Mother**: NOT lit. The light on the east wall stops 0.16 m short of the near door jamb (at the floor) and she
  stands 1.0-1.5 m outside the beam's west edge (`mother_west_margin_m` -1.12 at her hips): the shaft slants across the
  couch toward her doorway and dies just before it. As the plan wants.
- In state A the uncle's hands are in the light (0.09 / 0.29 m inside), his head and hips are not (-0.20 / -0.49).

### Furniture and staging (my choices; flag to Jade)
- **Couch on the EAST wall** (the hall wall in the east flat), 1.8 m, 0.15-1.95 m back from the windows, 0.5 m short
  of the doors. Reason: the honest 15:00 December beam never reaches west of x -1.33 (and only within 0.5 m of the
  glass there); a couch on the west wall would put the couch, the table near it and her in shadow. With the couch on
  the east wall the light falls across the table, her, and the couch. The cost: the couch stands beside Mother's
  doorway rather than opposite it. (In the west flat the same couch is "opposite the doors".)
- Coffee table 0.55 x 0.95 x 0.42 m, 0.57 m in front of the couch. North armchair at the couch's north end facing the
  windows; west armchair across the table facing the couch (the uncle's in state A, grandmother's in state B); a third
  ("far") by the west wall. Wicker lounger (藤躺椅) by the west end of the windows, feet to the light. TV cabinet,
  photo, clock on the west wall; cold radiator by the windows; crocheted antimacassars; pendant light off.
- **Her (state B)**: sitting back on her heels between the couch and the table, facing west, working on the table top:
  clear gaps 0.27 m to the couch, 0.30 m to the table, 0.38 m to the north armchair (the "equidistant" spot).
  Mother is behind her right shoulder; the laughing adults (grandmother in the west armchair, aunt and uncle
  standing) are in front of her on the dark side, so V1g lifts her eyes toward them, not toward the door.
- **State A**: the uncle sits in the west armchair leaning in, hands low over the table in the light; she stands
  across the table facing him (face lit). The table is bare (tea and steam are state-B details).

### Paper (`paper.js`)
- One sheet 16 x 23 cm, 0.35 mm. Each tear goes across the longer side, 0.38-0.62 of the way, a little askew; a torn
  edge wanders (six random partials, 1/k^1.4) with a fibre fringe; mill edges stay straight. Pieces are quads with
  flagged edges, so a corner piece keeps two straight edges.
- Hero pieces (`tissue: 1|2|4|8` = which generation the gold dots count): one sheet torn into n pieces that fit back
  together; 1 and 2 held over the table, 4 and 8 laid a little apart on the clear patch (`PLACES.focus`). Sidecar
  `tissue.gold_dot_px` gives one point per hero piece.
- Stack of 34 sheets at the table's north end. Drift (`DRIFT_COUNTS`, ~6 sheets' worth, generations 1-9): big pieces
  mostly on the table, confetti on the floor round her (piling where dense) and a few on the couch seat.

### Cameras (re-derived)
- REF_plan (east up, windows right), REF_wide (from the dining opening, SE), REF_beam (new: from the windows' west end
  along the light). V1a (outside, behind the uncle's right shoulder; his head out of frame), V1b (her eye-line onto
  his hands), V1c / V1g (outside across the table from the west, level), V1d_1/2/4/8 + V1h (one locked tissue camera,
  her eye-line onto the table), V1e (low from the window, her frame left, Mother in the doorway frame right beyond
  the lit couch), V1f (her eyes up at the adults on the dark side), PB1 (down into the eight pieces on the table).
- Beam masks: the 33 `beam_` twins re-rendered. `beam_V1f` is black (the camera looks at the dark side);
  `beam_V1d_*`, `beam_PB1`, `beam_V1g` are white over most of the frame (camera in or looking through the light): use
  the `__surf` twins there.

### Known issues / open
- The mannequin engine was being upgraded by another agent during this rebuild (hair block on the forehead etc. is
  the engine's); re-render after it lands: `node layout/render.mjs --set shanghai86 --exclude beam_` and the beam twins.
- The held sheet (V1d_1/2) is lit from behind (honest: the sun is beyond it); real 草纸 would glow through.
- Steam is drawn as thin tubes (line/label) and faint glass (lit), not a volume.
- Ask Jade: was the couch against the hallway wall or the far wall? which way did the hall doors open? curtains?
- The `sun` light in the sidecar `lights` list is a directional light; `pos` is a point 14 m back along the rays.

## 2026-11-25 (2): Jade's corrections (OVERRIDES the section above where they differ)

### What Jade corrected (memory wins over the 1934 drawing)
1. **Hall French doors**: a double-wide glazed pair in the **NORTH wall**, opposite the balcony, centred (x -0.8..0.8,
   head 2.2, transom 2.28-2.72), opening into the hall. Mother stands there. The east wall has no doors now.
   - **Conflict with the drawings**: on the 1934 plan the ~3 m opening to the dining room is in the north wall. Jade's
     doors take that wall, so the opening (3.0 m, head 2.65) has been **moved to the EAST wall** (z -1.95..-4.95), with a
     4.4 x 4.4 m dining room beyond it (round table, chairs, sideboard, window). Whether the dining room was really
     there, or reached some other way, is open: ask Jade.
2. **Couch on the WEST wall**, 0.45 m from the window-wall corner (z -0.45..-2.25), facing east. A potted plant
   stands in that gap.
3. **Spacing as people arrange furniture**: the coffee table is 0.44 m in front of the couch, centred on it
   (0.55 x 0.95 x 0.42). The armchair beside the couch makes the usual L at the couch's north end, facing the
   windows (turned 12 deg toward the table), with 0.35 m from armrest to armrest; no seat is blocked. The "across"
   armchair faces the couch 0.42 m beyond the table. The "far" armchair sits in the north-east corner. The wicker
   lounger is at the windows' east end, 0.45 m off the east wall, feet to the light. The TV cabinet is on the north
   wall west of the doors; the radiator is on the east wall behind the lounger.
4. **Her spot** is computed (`HER_SPOT` in layout.js): the nearest point whose clear gaps to the couch, the L
   armchair and the table agree within 2 cm. It is **(-1.27, -2.205)**, with gaps of 0.37 / 0.39 / 0.39 m. She sits
   back on her heels there, facing the table and the light (yaw 20), working at the table's north-west corner.
   - With the armchair placed along the wall instead, the equidistant point was 0.9 m from everything, an odd spot.
     The L is the normal arrangement and gives the snug spot Jade describes.

### The light: date and time swept (`node layout/sets/shanghai86/sweep.mjs`)
- Jade remembers neither the season nor the hour, so both were swept: 1 Nov - 28 Feb x 08:30-15:00, every 5 days and
  10 minutes, 960 honest suns. A sun is accepted when:
  - her face is ≥ 8 cm inside the beam, and she faces ≤ 55 deg off the sun;
  - ≥ 80 % of the steam samples are in the beam;
  - ≥ 25 % of the table top is lit;
  - nothing of the north doors is lit, and the floor pool stops > 1 m short of the north wall.
  It is ranked by how well the shaft "points" at the doors (travel direction vs pool-centroid-to-door bearing).
- **Result**: 170 of 960 pass. Every one of them is a **winter MORNING**: Dec-Jan 08:30-10:30, Nov 08:30-09:40,
  Feb 08:30-09:20. No afternoon sun works: after noon the light runs east (away from the west-wall group, as the old
  15:00 staging showed), and at noon the December sun is ~35 deg high, so her eyes at 2.1 m into the room fall just
  above the beam's top.
- **Chosen: 1986-12-21 (the solstice), 10:20 CST.** Elevation **31.1 deg**, azimuth **155.2 deg** = 11.6 deg EAST of the
  facade normal, profile 31.6 deg. Per metre into the room the light drops 0.62 m and drifts 0.2 m west.
  `SUN_DIR = [-0.172, -0.517, -0.839]`. Among the passing suns, the late-morning ones point best at the doors (16.6 deg
  off); 10:30 points 4 deg better but leaves her face only 11 cm inside the beam.
- Lit aperture: the overhang no longer cuts (profile 31.6 deg); the window head does, giving a top at 2.13 m. The
  east jamb and east parapet end shade on the sun's side. The front parapet takes only the bottom 2 cm.
- **Where it lands**: a floor pool from the windows straight back to 3.46 m. Its west edge runs along x -1.8 → -2.5,
  so the couch and the floor in front of it are lit; its east edge goes from x 1.74 to 1.04. The pool reaches the west
  wall only at a sliver behind the couch. It does not touch the north wall, the doors, the ceiling or the dining room.
- **(a) Her face and the steam: yes.** Eyes 0.25-0.36 m inside the beam, depending on the shot; all 66 steam
  samples and all 3 mugs are lit.
- **(b) The table: yes, all of it,** including the focus patch, the eight hero pieces and the stack.
- **(c) Toward Mother but short of her: yes.** The light runs straight back toward the north doors and ends on the
  boards 2.6 m short of the door line. Mother is 2.4 m outside the beam at her nearest point (`mother_margin_m`
  -2.36).
- State A: the uncle's hands are in the light (0.23 / 0.25 m), his head and hips are out (-0.18 / -0.28). Her face is
  in (0.25).
- Adults out of the light (state B): grandmother on the lounger (her nearest point, the left hand, is 7 cm outside),
  the aunt by the dining opening, the uncle standing north-east. All are east of the beam's east edge.

### Staging and cameras (re-derived)
- **State A**: the uncle sits on the lounger's west edge, just east of the beam, leaning in. His left hand is cupped
  palm-up in the light with the small thing in it; his right thumb and index pinch it from above. She stands
  north-west of his hands (0.85, -1.78), facing them and the sun.
- **State B**: she kneels at `HER_SPOT` facing the table and windows. Mother is in the north doorway behind her, the
  laughing adults to her left (east), out of the light.
- **Paper**: the stack is at the table's south-west, the focus patch at its north-west corner, and the mugs along
  its east edge beside her.
- **Cameras**:
  - REF_plan: east up, doors left, windows right.
  - REF_wide: from beside the doors, looking at the windows.
  - REF_beam: from the windows' east end.
  - V1a: from the window side; she is frontal, his arms come in frame right, his head is out of frame.
  - V1b: her eye-line onto his hands; `edgeNT: 0.12`.
  - V1c / V1g: across the table from the window side; north wall and doors behind her.
  - V1d_* / V1h: the tissue camera over the table corner.
  - V1e: low, from the windows' west half. Child frame left in the light; Mother in the doorway frame right, beyond
    the end of the pool.
  - V1f: her eyes up at the adults on the east side.
  - PB1: down into the eight pieces.
- **V1b fix**: the hands were two curled mitts merging into one slab from above. Now there are two different hand
  shapes (a fanned cupped palm-up left, a pinch with splayed fingers on the right), a lower camera (el 36, 0.6 m, 40 mm)
  so his knees read as knees rather than wedges, and the per-shot line-mode crease threshold `edgeNT: 0.12` (default
  0.25; `build()` passes it to the renderer). Fingers now read separately in line mode.
  Remaining: zigzag seam lines at the sleeve edges, from the engine (not edited).
- Re-rendered with the new articulated mannequins (engine landed), all shots + the 33 beam twins; sheets and gallery
  rebuilt. `FLAT = 'west'` now only swaps the parapet for the railing (the doors are centred).

### Open (ask Jade)
- Where the dining room really was relative to the north doors (the drawing puts it north).
- Morning light is the only honest way to light this layout: does a winter morning fit the memory?
- Which way the hall doors opened; what was on the north wall beside them (TV placed there by me).

## 2026-11-25 (3): one long room, bookshelves, wall art, early-morning sun (OVERRIDES (1) and (2) where they differ)

### Why the room is ~9.5 m wide, and what I had read wrong
- **Jade**: the room was "maybe 1.5 or 2x" wider than 5.0 m. Her grandparents had joined the living room and the
  dining room into one space long before 1986.
- **The texts** say the living room and the dining room interconnect and *both* open directly onto the south balcony
  ("另一侧为客厅与餐厅相互贯通，并直接连接南向阳台。并设置六扇落地长窗", Xuhui 2026). That only works if the
  dining room lies BESIDE the living room along the facade.
- **My earlier mistake**: from the 640 px scan of the 1934 plan, I took the room NORTH of the living room for the
  dining room and read "相互贯通" as a ~3 m opening in the north wall.
  - The PSA text ("北侧则设卧室、餐厅和厨房") seemed to agree, but it describes the flat as a whole (dining room on
    the north side of the flat), not where the dining room sits relative to the living room.
  - At ~13 px/m the scan cannot settle room boundaries, and Jade's memory together with the Xuhui text outweigh my
    reading.
- **Model now**: ONE continuous room. x -2.5 (west wall) to 7.0 (east wall), 9.5 m along the windows and 6.1 m deep,
  ceiling 3.05.
  - The old 1934 living room is the west ~5 m; the old dining room the east ~4.5 m.
  - **Trace of the old partition** (my guess; Jade only said the two rooms were joined): a shallow soffit across the
    ceiling at x 2.5, 0.24 m wide and 0.10 m deep. It is deliberately subtle. No floorboard change is modelled (a flush
    strip would draw hard lines in line mode).
  - Where this puts the rest of the flat (bedroom wing, hall, service rooms) relative to the 1934 drawing is
    unresolved.
- **Windows** (French, steel, full height, on one continuous balcony 10 m long, solid parapet):
  - the six-leaf set (3.6 m) in the old living room, x -1.8..1.8, opposite the hall doors;
  - a four-leaf set (2.4 m) in the old dining room, x 3.55..5.95: an ASSUMPTION from "both open onto the balcony";
    its width and position are guesses.
  - A balcony spanning both rooms is also a guess: the research measured 5.5 m for one bay.
- **Hall doors**: double-wide, in the north wall opposite the six windows (x -0.8..0.8).

### Furniture (Jade)
- **Bookshelf cabinets** fill the north wall on both sides of the doors (x -2.5..-0.87 and 0.87..6.02), 0.38 m deep,
  2.05 m high: cupboards below, glazed shelves of books above.
- **TV cabinet** (Jade, round 3b): on the **east wall**, z -3.05..-3.95, facing west down the room, where the sideboard was (toward the clock, which is my invention). The **sideboard moved to the north-east corner** (x 6.07..7.0, against the north wall at the end of the bookshelves), beside the dining table: my choice, flag to Jade.
- **West wall**: three calligraphy hanging scrolls (书法挂轴, 0.42 x 1.5 m) between the couch and the window corner, and
  **one large framed traditional Chinese painting** (国画, 1.3 x 0.72 m) over the couch. Jade did not say which wall
  the painting hung on: **the west wall is my choice, flag to Jade.** The framed photograph is removed: no photographs
  anywhere.
- **Shelf clearance** (Jade): the L armchair's back is **0.68 m** from the bookshelf fronts (z -5.72), room to stand and
  reach the books. The couch, the table and her spot moved north with it, keeping:
  - the armrest gap 0.36 m;
  - table 0.44 m in front of the couch;
  - armchair facing the windows.
- **Result (flag to Jade)**: the couch now runs z -2.14..-3.94, **2.14 m from the window-wall corner** (it was 0.45). Her
  equidistant spot is (-1.27, -3.89), 3.9 m from the windows, with gaps 0.37 / 0.39 / 0.39 m.
- **Other armchairs**: "across" faces the couch 0.42 m beyond the table; "third" (the uncle's in state A, grandmother's
  in state B) is in front of the six windows' east half, facing the group.
- **Lounger** at the old partition line. Round dining table at the east end, sideboard in the north-east corner. Radiator, TV, calendar and clock
  on the east wall (the clock and calendar are inventions). A pendant light over each half.

### The light: swept again (`node layout/sets/shanghai86/sweep.mjs [--diag]`)
- **Grid**: 1 Nov - 28 Feb x 07:30-15:00, every 5 days and 10 minutes (1097 suns with direct light on the facade).
- **Why it is hard now**: her face is 3.8 m into the room and 0.6 m above the floor. The light only reaches that deep
  under the window head when the profile angle is ≤ ~22 deg, i.e. a low sun. A low winter sun stands far to the SE in the
  morning, so the light slants north-west and drifts 0.7 m west per metre into the room, and its far end runs on toward
  the north wall.
- **No afternoon sun works** (the light runs east, away from the west-end group). With the old acceptance test (light
  stays ≥ 0.6 m from the doorway), **no sun passes at all**:
  - **Late-December mornings around 08:30** light her face, the steam and the table, but the far end of the shaft lands
    0.1-0.3 m from the doorway, on the bookshelves just west of it.
  - **Mid-February 07:30** keeps 1.3-1.5 m off the doorway, but with a 10-deg sun: only part of the steam (67 %) and the
    table (36-53 %) are lit, and the light runs west toward the couch, not toward the doors.
- **Chosen** (1-minute sweep, 14-28 Dec, 08:22-08:40): **1986-12-21, 08:31 CST**.
  - **Sun**: elevation **17.2 deg**, azimuth **132.4 deg** = 34.4 deg EAST of the facade normal; profile 20.6 deg.
    `SUN_DIR = [-0.540, -0.296, -0.788]`. Per metre into the room: 0.38 m down, 0.69 m west.
  - **Lit aperture** (six windows): x -1.80..1.61, y 0.36..2.19 at the inner face. The front parapet now trims the
    bottom 0.36 m; the east jamb and the balcony's far east end barely matter.
- **(a) Her face: yes, but thin.** About 9 cm inside the light by the sweep's face samples; the posed figure's eyes are
  0.20-0.27 m in, depending on the shot. **The steam: 65 of 66 samples lit.**
- **(b) The table: 95 % lit**, including the patch, the hero pieces, the mugs and the stack.
- **(c) Toward Mother and short of her: yes, narrowly.** The shaft crosses the couch group and runs on to the north
  wall; the lit floor ends **0.28 m short of the doorway** (sidecar `door_gap_m`), on the boards and bookshelves just
  west of it. Mother, in the doorway, is 0.83 m outside the beam at her nearest point.
  - The plan's "where the shaft points but does not reach" survives, but only as a near miss. Any later in the morning
    and her face drops out of the light; any earlier and the light reaches the doorway.
- **The four east windows** throw a second shaft into the old dining half. It does not reach the group, Mother or the
  laughing adults, who stand in the dark between the two shafts.
- **State A**: the uncle sits in the "third" armchair just outside the shaft's east edge. His hands are in the light (a
  few cm; moved 8 cm further west after the check); his head and hips are out. She stands north-west of his hands,
  facing them and the sun (face 0.24 m inside the light).

### Cameras (re-derived)
- REF_plan: now NORTH UP (doors and shelves top, windows bottom, couch left).
- REF_wide: from the east (old dining) end along the whole room.
- REF_beam: along the shaft from the windows.
- V1a: from the window side; his head out of frame, his arms in from the right.
- V1b: unchanged pose logic; its camera follows the new hands.
- V1c / V1g: across the table from the window side, the bookshelves behind her.
- V1e: low, from the windows' west half; child frame left in the light, Mother in the dark doorway right of centre;
  the across armchair stays out of the line to Mother.
- V1f: up at the adults east of her.
- V1d_* / V1h / PB1: on the table corner.

### Open (ask Jade)
- **Does an early winter morning (about 08:30) fit her memory?** It is the only honest sun that lights her this deep in
  the room, and even then the margins are thin.
- Which wall the large painting was on (west, over the couch, is my guess).
- Whether the four east windows existed, and how long the balcony was.
- The couch now sits 2.1 m from the window corner (it follows the shelf clearance): is that right?

## 2026-11-25 (4): Jade's answers and round-4 furniture (OVERRIDES (3) where they differ)

### Confirmed by Jade
- The couch 2.14 m from the window corner: fine.
- One long balcony along the whole room: yes. The four-leaf windows in the old dining half stay.
- The large framed painting on the west wall (over the couch): right.

### Changes
- **No curtains** (Jade does not remember any): curtains and rails removed.
- **Opposite armchair**: the third armchair now stands at the couch's SOUTH end, facing the L armchair across the
  coffee table's long axis (centre (-1.27, -1.25), yaw 168, turned 12 deg toward the table). The group is now the couch
  plus two facing armchairs round the table. This is the coordinator's reading of "opposite the other armchair";
  flag if Jade meant across the table from the couch.
- **Side table** (Jade) in the gap between the couch's south arm and the opposite armchair, reachable from the
  couch-end seat and the armchair: 0.45 x 0.45 m, 0.55 m high (armrest 0.6), centre (-1.86, -1.87).
  - **Flag**: to fit it, that armrest gap is widened from 0.36 to 0.55 m. The L side keeps 0.36.
- **Dining table** (Jade, NOT SURE): a long rectangular table, 1.9 x 0.88 m, 0.76 high, centre (4.6, -2.6), long axis
  along the room, eight chairs (three a side, one at each end). Replaces the round table; the second pendant hangs
  over it.
- **Child's table and chair** (Jade's REVISED memory, which supersedes the earlier placements by the couch group and
  at the dining table): a pair where the wicker lounger stood.
  - Table 0.6 x 0.45 m, 0.48 high, centre (3.0, -1.3).
  - Chair: seat 0.27 m, at (3.0, -1.72) on the table's north side, facing the windows.
  - Both sit in the **four-window shaft** of the 08:31 sun: the table top and the chair are lit (the table centre is
    0.34 m inside the light), and the table throws its shadow north-west onto the floor toward the long room's
    middle. It is a sunny corner, but not her drift spot.
- **Wicker lounger** moved WEST along the six windows: centre (0.7, -1.2), yaw -20, feet to the windows.
  - That is between the couch group's opposite armchair (2.0 m to its west) and the old partition line, 1.9 m
    east-south-east of the coffee table.
  - It straddles the six-window shaft's east edge: its south (foot) half is in the light (9-23 cm inside), its north
    (head) half in shadow.
  - It does not shade her, the table or the steam: the rays to them pass 0.5-1.0 m above it.
- **State A, re-seated**: the third armchair left its old spot, so the uncle now sits in the "across" armchair.
  - That armchair is east of the coffee table, just outside the light's east edge.
  - He leans in with his hands low over the table's east half, in the light (~0.15 m inside); his head is ~0.6 m outside.
  - She KNEELS at her own spot (where she sits a week later), facing his hands. In (3) she stood; standing at that
    depth would put her face above the beam.
  - V1a looks along her eye-line from the table's south-east; he is out of frame right, only his hands come in.
- **Grandmother (state B)** sits in the "across" armchair, out of the light. The aunt and the uncle stand east of the
  table, out of the light.
- **Her equidistant spot is unchanged**: (-1.27, -3.89), with gaps 0.37 / 0.39 / 0.39 m to the couch, the L armchair and
  the table. None of the round-4 pieces stand between her and the sun: the ray to her face passes ~1.6 m above the
  lounger's spot. Light numbers as in (3): face, steam (65 of 66), table 95 %, Mother outside, floor light 0.28 m
  short of the doorway.

### Light study (for Jade to judge the timing by eye)
- `lightstudy/` is a sub-set: the same build with a per-shot `scene` override, so the set's `SCENE` stays at
  1986-12-21 08:31. `build()` takes `shot.scene` = { date, time } or { cheat: { elev, rel } }.
  - Render: `node layout/render.mjs --set shanghai86/lightstudy --modes lit,flat --nojson`
    (to `media/layout/shanghai86/lightstudy/`).
  - Sheets: `sh layout/sets/shanghai86/lightstudy/sheet.sh`
- **Rows (suns)**:
  1. 1986-12-21 08:31 (chosen);
  2. 1986-12-21 09:30;
  3. 1987-02-14 07:30;
  4. 1986-12-21 15:00, the honest afternoon (the light runs east and misses the group);
  5. **CHEATED**: a sun 16 deg high from azimuth 143 (24 deg east of the facade normal). The real sun stands ~25 deg high
     there; at 16 deg it lights her and the table with room to spare and still keeps off the doorway.
- **Columns (views)**: REF_wide, V1e, and her eye level looking toward the windows.
- **Sheets**: `media/layout/_sheets/shanghai86_lightstudy.jpg` (lit) and `shanghai86_lightstudy_flat.jpg`.

## 2026-11-25 (5): Jade's decision-page answers (OVERRIDES (4) where they differ)

Shot `t` times are unchanged (the retime to the -2sm master is a separate pass).

### Applied
- **Time (Jade)**: `SCENE` = **1986-12-21 09:30 CST**. She picked it from the light study ("the 8:30 and 9:30 views at
  her eye level are really nice").
  - **Sun**: elevation 25.7 deg, azimuth 143.8 deg (23.0 deg east of the facade normal), profile 27.6 deg.
    Per metre into the room the light drops 0.52 m and moves 0.43 m west.
  - **What it lights**: both floor pools end at z -4.12 (2.0 m short of the north wall).
    - The six-window pool spans x -2.5..-0.07 at its north edge. It covers:
      - the couch's south half, the side table and the "opposite" armchair;
      - the lounger;
      - the coffee table's south part (table 73 % lit; 2 of 3 mugs; the stack; NOT the clear patch / hero pieces);
      - her lap: hip +0.04 m inside.
    - **Her face and hands are NOT lit**: eyes -0.25..-0.33 m outside, hands -0.12..-0.19 m.
    - **Steam**: 10 of 66 samples lit.
    - The grandmother's hip and left hand (in the "across" armchair) are just inside.
    - **State A**: the uncle's hands are now -0.19 / -0.32 m outside (they were in at 08:31); his hip is in.
  - Jade chose this knowing the 09:30 study frames showed her in shadow at the light's edge. **Nothing has been moved
    to put her back in the light: flag to Jade.** If she wants her face lit at 09:30, her spot would have to move
    ~0.35 m south, toward the windows; it is fixed now by the couch/armchair/table equidistance.
- **Cross-legged (Jade)**: state B uses `legs: 'cross'`.
  - Her hip drops from 0.16 to 0.08 m. Her eyes are ~0.52 m up, only ~10 cm above the 0.42 m coffee-table top. That is
    honest for a 0.95 m three-year-old at a coffee table: in V1c/V1g she peeks over the table edge.
  - The held sheet (tissue 1, 2) is now held lower (y 0.45, was 0.47) and nearly flat (tilt 8 deg, was 28): at the
    old tilt it hid her face in V1c.
  - **State A keeps the kneel (my reading, flag)**: Jade's answer is about how she *sits* in the drift. A week earlier she
    kneels up to watch the uncle's hands, which are above a cross-legged child's eyes.
- **More paper, messier (Jade)**: `DRIFT_COUNTS` went from 177 to 720 pieces drawn (627 placed after the occupancy
  skips: 128 on the table, 468 on the floor, 31 on the couch). They are weighted to the small generations, with a new
  generation-10 confetti tier (~5 x 7 mm).
  - **Same spread** (the gaussian sigmas 0.34 / 0.36 m round the same centre). 40 % of floor pieces gather into six
    little heaps inside that spread.
  - Pieces now tip (±0.3 / ±0.25 rad on the floor), about half bow upward, and they rest on an edge rather than
    through the floor.
- **Stray bit in her hair (Jade)**: one generation-9 piece (~7 x 10 mm), bent to the head on the top-left front of
  the bob (her left, toward the frontal cameras).
  - It reads as a small light fleck in V1c. In V1g it is nearly edge-on (her head turns toward the adults).
  - Its position is in the sidecar: `tissue.hair_bit_world` / `hair_bit_px`.
- **Armchairs face each other across the table**: confirmed, unchanged.
- **Dining table (Jade)**: turned 90 deg, long axis now NORTH-SOUTH (`DINING_TABLE.axis = 'z'`), with 3 chairs on the
  east and west sides and one at each of the north and south ends.
  - **"Up" = north.** The plan she was shown (`REF_plan`, decision card) is drawn north-up: the hall wall and
    bookshelves are at the top, the windows at the bottom. So "up" is world -z, toward the hall wall.
  - **Shift**: the centre moves 0.4 m north, (4.6, -2.6) -> (4.6, -3.0). "A little" is my number.
  - **Clearances**: the north end chair's back is 1.3 m from the sideboard; the south chair is 1.6 m from the windows;
    the east chairs are 1.1 m from the TV cabinet; the west chairs are 0.45 m from her small table.
  - The pendant follows the table.
- **Sideboard and the invented details**: kept.
- **Hall doors (Jade)**: they open into the hall (as before). The opening is "double or triple" the old 1.6 m:
  - **Width**: built **2.5x = 4.0 m**, transom across the whole width.
  - **Centred on the north wall** as a whole: x 0.25..4.25, centre 2.25. The old pair was centred at x 0, opposite
    the six windows. Jade said "centred on that wall", and the plan she saw showed the old doors visibly left of the
    wall's centre. **Flag**: if she meant "keep them where they are, just wider", set `DOOR_CX = 0` in layout.js. The
    west shelf run would then shrink to ~0.4 m.
  - **Leaves (my choice)**: four glazed leaves of 1.0 m. A pair of 2 m leaves is not a real door. They fold back in
    pairs, each pair standing as a stack square to the wall at each jamb, in the hall.
  - The hall is widened to the opening + 0.5 m each side.
  - **Bookshelf cabinets**: the west run is now x -2.5..0.18 (3 units); the east run 4.32..6.02 (2 units), ending at
    the sideboard as before.
- **Mother**: in the doorway's west end, (0.75, -6.18), her right hand on the west jamb, looking at her daughter.
- **Uncle's hands (V1b)**: unchanged (Jade: good enough as a guide).

### Beam and Mother's doorway (rechecked)
- **Nothing reaches the doorway.** The nearest lit floor is **1.98 m** from the opening (was 0.28 m at 08:31).
  Mother is **1.74 m** outside the light at her nearest point (left hand).
- **"Where the shaft points but does not reach"** now holds for the FOUR-window (dining-end) shaft, not the six-window
  one. That shaft runs NNW and its pool ends at x 1.8..4.1, z -4.12, square in front of the 4 m doorway and 2 m short
  of it.
- The six-window shaft, the one that lights her, runs north-west toward the west bookshelves, away from the doors.
- In V1e Mother stands frame right in the dark doorway, with the lit floor and the armchair in the foreground.

### Light study
- Re-rendered on this layout. Rows relabelled: row 1 = 08:31 (round-4 pick), row 2 = 09:30 (Jade's choice, now the set
  default).
- The EYE column still sits at the old kneeling eye height (0.62 m), as Jade saw it. Her cross-legged eyes are ~0.1 m
  lower.

### Open (ask Jade)
- At 09:30 she sits just outside the light (face and hands in shadow, lap at its edge): intended?
- Doors centred on the whole north wall (x 2.25, built) or still opposite the six windows (x 0)?
- State A: kneeling up to watch, or cross-legged there too?
- Dining-table shift: 0.4 m north is a guess at "a little".

### Engine notes (not changed: outside this set)
- V1g: with her head turned up toward the adults, the bob's fringe slab stands off her forehead as a flat plank
  (`engine/mannequin.js` hair, the `slab(...)` fringe). This was already there before this round (see the committed
  V1g). It is visible in the 85 mm close-up and needs an engine fix.

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- (This set was on v2 times.) Cuts on the -2sm sung onsets: V1a 29.74, V1b 31.58, V1c 34.52 ("A week later"), V1d_1 37.85
  ("sat in"), V1d_2 41.43 ("ripped"), V1d_4 43.34 ("Ever tinier"), V1d_8 45.43 ("repeating"), V1e 48.14, V1f 50.52 ("The
  adults"), V1g 53.93 ("What's so funny?"), V1h 55.15 ("Nobody")-58.55; PB1 58.55-68.34 (break bars 1-4). The sun
  (21 Dec 09:30) is a clock time, not a song time: unchanged.

## 2026-11-26: fixed background art and clothing decals (Jade: art and logos the same in every shot)
- shanghai86/art.js: the framed painting = layout/assets/art/shanghai86/sh_painting.png (shan-shui landscape: SUBJECT
  INVENTED; Jade said "one large framed traditional Chinese artwork"); the three scrolls drawn in code with real
  public-domain texts (z -1.85 海内存知己, -1.3 宁静致远 signed 丙寅冬, -0.75 天涯若比邻: CHOICE INVENTED); the calendar
  = December 1986 grid in code + sh_calendar_photo.png (West Lake; the calendar itself is an agent invention); the clock
  face in code at 9:30. North-wall bookshelf spines: fixed greeked spine textures (no readable titles).
- Only REF_wide sees the west-wall art; the spines show in V1a, V1c, V1e, V1f, V1g, V1d_8_end.
- Not textured (questions): upholstery (paintings alternate floral / plain), lace antimacassars.

## 2026-11-26: hold pass

Every hand on an object is checked now (`--gaze` sidecar `holds`, engine/holdcheck.mjs). Set files only (shots.js, build.js).
- **Uncle (V1a, V1b).** The small thing is a faceted wad of 草纸 (icosahedron), not a sphere: a sphere rolls off any palm
  that is not dead level (Rapier has no rolling resistance). build.js `ballAt` places it from the SOLVED right palm, sunk
  0.3 mm into the palm strips (was 24 mm over the palm centre: it floated). His left (watch) hand is `uncleHold`: the
  index pad on the wad's top (`grasp: 'tipOn'`, `object: 'something small'`; was matched to his own wristwatch).
  `BALL` = H + 19.7 mm. PASS, mannequin and mesh.
- **Tearing pinches (V1c, V1d_1, V1d_4, V1d_8).** The pinches are tagged `grasp: 'pinch'`, `object: '草纸: the tiny
  pieces'`. paperProps now lays each half in the plane that runs between ITS hand's thumb and index pads (`padGrip`: the
  internal tangent of the two distal pads), so the thumb is on one face and the index on the other. Before, the fixed
  `tilt` ran the paper through the pads. Visible change: the piece stands up between the fingertips, facing her (about 20 deg
  off vertical) instead of lying at 25-35 deg; `rip.tilt` / `held.tilt` are no longer used while she holds it.
  Both pads now touch the piece (brute-force distance -0.6 to +0.1 mm). The Rapier check still fails (see "check" below).
- **V1d_2.** Her left half is laid the same way (on her own left-right axis; the right hand is away). Her right hand now
  holds its half flat on the table under the index pad (`lay.R`). build.js lays a `held.flat` piece from the index tip.
- **PD** (where the half is put down) is now F + (-0.05, -0.118), 12 mm inside the table's north edge. The old PD,
  F + (-0.07, +0.02), was 14 cm beyond her reach: her pinch ended 19 mm inside the table top.
- **State B hand (`lay`: REF_*, V1e-V1h, PB1).** Her right index pad rests on a piece lying on the table (`tipOn`,
  `object: '草纸'`): the half at PD in the after shots, the near generation-8 piece otherwise. Her spine bend goes from 30
  to 40 (FLAG: she leans 10 deg further over the table corner). At 30 the fingertip only reached the table's edge; the
  old palm target was out of reach and the fingers sank 6 mm into the table. LAY_TIP = F + (-0.05, -0.11), y = top + 3.1 mm
  (the tip lands 1.2 cm short of LAY_TIP).
- **Generation-8 pieces (heroPieces)** now lie ON the table (TABLE.h + 0.6 mm; they were 3.4 mm above it). Every centroid
  is at least 12 mm inside the north edge: two pieces overhung it by half, and fell off in the check.
- **V1d_8_end.** Her hands are out of frame. Twisted 35 deg, the tearing pinches could not close (nothing between them,
  wrists past range), so the hands go to her lap. The table shows V1d_8's pieces (it was the generation-8 layout,
  out of continuity).
- **Check.** holdcheck.mjs results for paper are not reliable yet (engine, reported to the hold agent):
  - Rapier's `contactCollider` between a capsule lying along a face and a convex hull or cuboid returns wrong distances
    (up to 12 mm off; repro scratch `skbc_d7.mjs`). Chains of balls give the right numbers.
  - A thin, ragged paper hull falls through the trimesh table top even with no hands (repro `skbc_t8.mjs`). A square
    plate, or a cuboid table, holds it.
  - The child-3 pinch leaves its pads about 0.8 mm apart (solveTouch does not close them), so a piece is squeezed only
    0.1-0.6 mm and slides 1-3 cm in 1 s.
  With a corrected checker (balls; convex slabs for supports; scratch `skbc_chk2.mjs`): V1e-V1h, V1d_2 R and V1d_1 R
  pass; the generation-8 piece on the table passes or slides 1-15 cm between shots with identical geometry (chaotic).
- **Round 2 (after the engine's ball-chain / prism / pinch changes).** padGrip's pads-overlap branch (the hold agent's) is
  kept, with one fix: the tear line and the slide (`start`, `shift`) move along `ac` (in the pad plane), not along `across`,
  which carried the halves off the plane (both pads ended on one side of the paper). By brute-force distance both pads
  now press 0.5-0.9 mm into each half. V1d_2: the right half lies at PD under her index pad (`laid`, as from V1d_4 on).
  State B / after shots, PB1, REF_*, V1a/V1b: PASS in mannequin and mesh. Tearing pinches: still FAIL in holdcheck. A
  1 mm slab 8 x 8 mm, set exactly between the overlapping pads and square to the pad axis, also falls 3 m (scratch
  `skbc_t13.mjs`). Rapier reports a point 5 mm off the plane of the thickened half as inside its hull (`skbc_t11.mjs`).
  Larger squares hit index2 / thumb1, because the child pinch converges behind the pads.

## 2026-11-26 (late evening): round-4 decisions (Jade, work/decisions/JADE_R4_DECISIONS.md)
- **sh_railing_flat**: "the railings were on our flat anyway". Kept as built (white iron railings on our, the east, flat).
- **sh_suite_colour** "brown or rust" + **art_sh_upholstery** "plain": couch and all three armchairs are now a PLAIN
  brown-rust wool (joinery.js FABRIC 0x683826 / cushions 0x744130 / piping 0x4e281a; build.js couch reads the same
  constants). Shade is MY pick (a deep rust, redder and darker than the orange-brown floor 0x8a5a34). Flat greys 0.30 /
  0.36 vs floor 0.56 and plaster 0.76, so it separates in flat; form gives furniture its own class tint; in lit the
  sunlit faces go warm orange-rust, the shaded faces brown. Checked in REF_armchairs and REF_wide (lit, flat, form).
  The armchair beside the bookcase is close in flat grey to the bookcase cupboards (0.30 vs 0.38); its white lace covers
  and outline carry it.
- **art_sh** "2 scrolls on the hallway side of the room, no scrolls on balcony side": the three scrolls at z -0.75 /
  -1.3 / -1.85 (west wall, balcony half) are gone. TWO hang on the west wall's hall (north) half, centred in the free
  plaster between the painting frame and the north bookcase end (z ~-4.43 and ~-5.03, top 2.5 m, 0.42 x 1.5 m), behind
  the 'beside' armchair. They carry the Wang Bo couplet: 海内存知己 on the right (north) as the first line, 天涯若比邻 on
  the left with the 丙寅冬 signature; 宁静致远 dropped. READING: "hallway side" = the north half of the room, the end
  with the hall doors (flag). Painting, calendar and clock did not have to move.
- **Props phase 2**: downloaded models swapped in (work/props_audit.md): the two hot-water flasks on the TV cabinet
  (`thermos`, 0.36 m, the red one as modelled, the green one recoloured 0x3a7a5a), the tea mugs (`mug` body, handle to +x,
  code tea surface and lid kept), the potted plant by the balcony doors (`potted_plant`, 0.6 m). Hand-built fallbacks stay
  in code if a model is missing. No shot holds a mug, flask or plant; holds are paper only. Credits: docs/credits_tools.md.
- Prompts (media/keyframes/r4/shanghai86/_prompts/_make.py): "three scrolls" -> two at the hall end; V1g's room note
  says plain brown-rust wool.
- Mug placement GOTCHA: props.json's `mug` grips have x mirrored. Measured from the GLB rim vertices, the body is centred
  at model x -0.015 with the handle on +x (props.json says body +0.015, handle -0.046). The set places the mug at x+0.015
  unrotated. Flagged for the props owner (mortongrove07 also uses `mug`).
- Holdcheck after the swap: 24/24 pass (paper only; no prop is held in this set).
- Looked at every changed shot. Scrolls show in REF_wide, REF_beam, REF_armchairs, V1e (top left, both readable). In V1f
  (from the hall) they hang just above the frame edge behind the bookcase end; only the roller ends peek in, so the V1f
  prompt now says no scrolls on the visible wall. Flat: the armchairs in V1c / V1e are close in grey to the bookcase
  cupboards behind them (both dark); lit (hue) and form (class tint) separate them. Prompt note in work/r4/REPAINT_LIST.md.

## 2026-11-26: round-5 decisions — engine-body agent (wrists only)
Every wrist in range now (render sidecars: 0 wrist warnings, was jade3 R / mama86 R in every shot plus the pinches and the
uncle). Each change was chosen by scanning variants of that hand's fingers / palm / elbow and reading the sidecar
`wrists[...].before` (the angles BEFORE the engine's own hand-turn clamp, so nothing is hidden by the clamp):
- mama86 R (mother(): a hand on the west jamb): palm on the jamb's reveal (turned 10 deg off it), now at shoulder height
  (1.35 m, was 1.12), fingers pointing into the room and a little up, elbow out: leaning on the door frame. Was fingers
  straight up: extension +26 / ulnar +57 deg past the range. (Elbow 'back' put the elbow 33 mm into the north wall.)
- jade3 R (`lay`, the tipOn on the piece on the table): fingers forward + 0.5 toward her left (slope -0.6 kept): was
  flexion +4 / ulnar +14 past. FLAG: her hand now angles in across the table corner. V1d_2 leans 26 deg (was ripSit's
  18) so that hand still reaches PD (hold check: adjacent 17.7 mm otherwise; now 0.5 mm, pass). Flatter fingers (-0.3)
  were tried: the middle knuckle went 6 mm into the gen-8 piece.
- jade3 L+R pinches (pinchPair, V1c / V1d_*): each hand's fingers turn 0.3 toward the other hand and rise (y 0.5); was
  ulnar +23 (V1c +49) past. The thumbs-on-top rip reads the same.
- jade3 L in V1d_8_end: an explicit lap hand (palm down, fingers 15 deg off world +z; scanned) instead of 'lap' (pronation +6).
- uncle (V1a/V1b): cupped R fingers 0.25 to his left, pinching L fingers 0.25 to his right (were radial +8 / ulnar +13).
- Mugs: props.json's mug grips are now the right way round (handle +x, body centre x -0.015). build.js's own +15 mm shift
  uses the bbox origin, not the grips, so it is unchanged and still correct. Nobody holds a mug here.

## 2026-11-26: round-6 decisions
Jade (r6, sh_jamb): "Mama's hand on the door jamb (V1e) — is her hand clipping through a door?"
- **Yes, it was.** clipcheck on the r5 pose (V1e): mama86's right hand 22.5 mm into the north wall at the west jamb,
  12.4 mm into the jamb lining, 12.9 mm into the room-side architrave; her wrist/forearm 20.5 mm through the folded-back
  hall door leaves (they stand in the hall against the jamb, x 0.27-0.37, z < -6.25, so a forearm reaching from the hall
  side crosses them); her slippers 9 mm into the raised teak threshold. In the guide the stiff sideways arm put the hand
  right on the hinge/leaf edge, which is what read as "through the door".
- **Re-staged** (shots.js mother(); ~150 variants scanned with clipcheck's checkDump via window.clipDumpSpec, script
  kept in scratch): she stands 6 cm further into the doorway, on the threshold (floor 0.018); the right palm flat on the
  west jamb's lining face (x 0.270) at y 1.27 (palm centre), fingers up and leaning back toward the hall
  ([-0.079, 0.851, -0.52]), palm 8.6 deg off flat, contact -0.8 mm (tolerance 3); the elbow down beside the jamb inside
  the doorway (elbowAt [0.45, 0.87, -6.10]) so the forearm stays clear of the leaves. Every wrist angle in range
  (the fingers-up-straight versions were 20-40 deg past pronation; fingers leaning toward the hall fixed it).
- V1e now has `clip.touch` mama86.handR on the jamb lining (pass). clipcheck: mama86 clear in every shot (the remaining
  V1e fails are jade3 into the paper drift, pre-existing). check_bodies V1e / V1d_8_end PASS; holdcheck no fails.
- Changed guides: V1e, V1d_8_end (her arm, behind the bookcase end), REF_beam. Rendered three passes.

### r6b (2026-11-26, Jade on REF_beam: "mom's wrist and little Jade's wrists are in kinda unnatural positions")
New standing rule (Jade): match everyday actions to real photos; low-energy bodies (limbs supported or hanging, shoulders
down, wrists near neutral). References: 5 doorway photos + 5 child-on-the-floor photos from Pexels, saved look-only in
the session scratchpad (shanghai_refs/; not in the repo, never sent to any model). What they show: a hand on a door
frame sits at chest-shoulder height, elbow down by the body, wrist nearly straight; small children handle small things
low in the lap or close in front of the chest, elbows bent and down.
- **Mama (mother(), every shot she is in):** the r6a palm was flat with straight fingers up, the wrist bent back, the
  elbow out. Now (MAT = PLACES.mother + (-0.13, +0.12), yaw -50, on the threshold): right hand on the west jamb lining at
  shoulder height (palm centre y 1.18), softly bent fingers (SOFT_FLAT) pointing up and back toward the hall, elbow
  down in front of her hip. (A right palm on the WEST jamb is only thumb-up-neutral when the forearm points toward the
  hall; every fingers-into-the-room variant was 20-90 deg past pronation/supination.) Left arm: { to: 'side', hand:
  'relax' } (was splayed). Contact -0.5 mm, no clips, every joint in range. motherPeek (V1f): both hands 'relax'.
- **Little Jade after-pose (jadeSit(8): REF_*, V1e, V1f, V1g, V1h, PB1):** was reaching for the table 0.4 m away (left
  arm past its reach, 1.44; wrists flexed ~60 deg; lean 40). Now LAP: both hands resting palm-down on her crossed legs,
  fingers along the forearm, lean 15. V1d_8_end uses LAP too. V1h and PB1 render pixel-identical (her hands are not in those
  frames).
- **Rips (ripSit: V1d_1, V1d_2, V1d_4, V1d_8):** were held at arm's length (0.36 m out, 0.47 up, elbows 10 deg). Now
  RIP_H 0.26 out, 0.32 up, over her crossed legs, lean 8: elbows ~73 deg, wrists ext 16 / radial 11. The POV cameras keep
  their positions (orbit at RIP_C) and aim at RIP_H; the frames now look down past the hands to the drift on the floor
  rather than at the table edge. Gaze RIP_LOOK just beyond the pinches (eyes 33 cm; at the hands themselves, 18 cm,
  check_bodies flags crossed eyes).
- **V1c:** the piece still held up over the table edge (intent) but close in: pinchPair(0.28, 0.47, PY 0.9), lean 8,
  elbows 64, wrists ext 15 / dev 3.
- **V1d_2:** the left (kept half) hand close in, fingers more upright (ulnar was +7 past). The right hand putting the half
  down at PD still cannot reach (1.08, as before r6): PD on the table is 0.4 m out; fixing it means moving PD (and the
  laid half in every after shot) or her spot. FLAGGED.
- Checks: clipcheck: no new fails (remaining: the drift under her, the held piece's pinch numbers, V1a/V1b uncle, V1d_2
  reach: all as before); check_bodies PASS V1c, V1d_1, V1d_2, V1d_8_end, V1e, REF_beam; holdcheck no fails. Rendered
  three passes. Compare sheet: scratchpad shanghai_r6b_compare.jpg.

## 2026-11-26: round-3 decisions — r6c, V1d_2 wrist (Jade: "the wrist is weird"; decision: MOVE HER, not PD)
- **Was:** at her shared spot (PLACES.jadeSit) her right index reached PD 0.42 m in front of her: arm nearly straight
  (elbow 5.2 deg, "cannot reach", reach 1.08), upper arm raised 134 deg, wrist flex 51.4 / radial 16.3. Look RIP_LOOK
  (55.8 deg off her pointing hand). Third-person view of it: scratchpad V1d_2_before_side.png.
- **Moved (V1d_2 ONLY):** `V1D2_D` = 10 cm forward + 2 cm to her left (world dx +0.053, dz +0.087): at (-1.717, -3.807),
  same yaw 20, cross-legged; lean 16 (was 26). PLACES.jadeSit is shared by every state-B shot, so it is NOT changed: the
  move is a per-shot `at` override in V1D2_JADE. PD, LAY_TIP and the laid half are unchanged (V1d_4 / V1d_8 / after
  shots identical: re-rendered sidecars have the same wrists, warnings and camera as in git).
- **Right arm:** soft, nearly flat hand (index curled a little more than the others so its pad is the lowest point),
  fingers FWD + 0.9 LEFT and 0.3 up, coming over the table's north edge toward the corner; index pad on the half at PD
  (graspArms tipOn, as before); elbowAt below/behind the hand. Now elbow 70.5, wrist flex 10.3 / radial -5.0 (ulnar 5) /
  twist -7.4; no warnings. ~300 variants scanned with clipcheck (scratchpad scan*.txt). A 'relax' hand put the curled
  fingers 5-6 mm into the table top; a 'point' hand 9-17 mm.
- **Left hand (kept half):** the same close-in pinch, carried with her by V1D2_D (elbow 83, wrist ext 23 / radial 18).
- **Gaze:** at the put-down spot / her right hand (the intent and notes give no reason to watch the held half): the look
  point lies on her eye line through LAY_TIP, 30 cm out, 6 cm lower (her eyes are only ~15 cm from PD; check_bodies
  MIN_LOOK). Exactly on the line, the head pitch re-oriented the held half (laid from the left pinch) so that it cut
  80 mm through her left hand in clipcheck; 6 cm lower it is the usual 7.9 mm. Gaze warning gone.
- **POV camera (V1d_2 only):** moves with her (orbit at RIP_C + V1D2_D, aim RIP_H + V1D2_D; same az / el / dist /
  lens 35). FLAG: V1d_1 / V1d_2 / V1d_4 were "same camera"; V1d_2's is now 10 cm further forward, as her eyes are.
- **FLAG (anatomy, not fixable by moving her):** cross-legged, her shoulders are at 0.38 m and her eyes at 0.41 m: the
  coffee-table top (0.42) is at her chin, and PD is 12 mm from the near edge, so no forearm support is possible. The
  low-energy reference pose (forearm resting on the table, elbow down) needs the hand well inside the table. The upper
  arm is therefore raised to about shoulder height (shoulder elevation ~105 deg) and the forearm runs across in front
  of her mouth in the side view. Kneeling (`legs: 'kneel'`, +8 cm) was tried: shoulders 0.46, but the left pinch went
  35-50 deg past radial and Jade's r2 answer was cross-legged in both scenes, so not used. Possible decision question:
  "V1d_2: up on her knees to put the half down?" (options: stay cross-legged as now / kneel up for this shot; my rec:
  stay, a toddler at a table that high does reach up like this).
- **Reference photos** (look-only, Pexels, scratchpad refs/: 7296791, 6623807 and 10 others): small children at a table
  at chest-chin height handle small things close to the body, hands hooked over the edge, wrist straight.
  Compare sheet: scratchpad V1d_2_compare.jpg.
- **New reference shot** `REF_V1d_2_side` (and its beam twins): V1d_2's pose from her front-right at table height
  (camera (-1.9, 0.56, -2.0)); the left hand is behind the table's corner leg from there. Not for painting.
- **Checks:** clipcheck V1d_2: armR reach fail gone; drift 24.8 -> 21.9 mm, table 1.1 mm (tol 3), held half 7.9 mm (both
  pre-existing kinds); V1d_1 / V1d_4 / V1d_8 unchanged. holdcheck: all pass (R index on the half 0.8 mm, on the table).
  check_bodies: V1d_1, V1d_2, V1d_4, V1d_8, REF_V1d_2_side PASS (hair bit 5.3 mm into the hair in REF, as in V1c / V1e).
- Rendered: all three passes for the set; only V1d_2, beam_V1d_2 and REF_V1d_2_side files kept (the other shots'
  images differed only by anti-aliasing noise on the drift and were restored from git). Needs repaint: V1d_2.

## 2026-11-27: engine cross-legged pose (engine agent)
- legs 'cross' redone engine-wide from reference photos. jade3 at her sitting spot now has her RIGHT shin in front
  (shots.js X_SIT = { front: 'R' }, jadeSit and ripSit): with the default (left in front) her crossed foot was 23 mm
  into the coffee table in V1d_2 / REF_V1d_2_side. Paper drift contact went 21.9 -> 4.4 mm.
- Pre-existing, slightly deeper: V1a / V1b jade3 vs uncle body overlap (skin 15.5 -> 23 mm). Feet are real size now.

## 2026-11-27: furniture / costume canon (Jade: "consistent between shots and fully painted")

**Read this before changing any furniture, surface or the uncle's costume.** Jade (HANDOFF "FIRST THING"): the coffee
table, armchairs, bookcase cabinet (colour, styling, handles) and the uncle's watch and outfit changed shot to shot in the
paintings; "fully painted or the image model will hallucinate a book shelf right into the plain back of an armchair".
Every visible surface now carries ONE fixed texture on every side, and every piece has one canonical look.

**The household (Jade, canon) and how it shaped the choices.** The family lives in the former French Concession; the
toddler's father is among the top physicists in China: an educated, cultured household of 1986, comfortable for its time
but in the state-allocated era, in an older Concession-era flat (original wood floors, tall steel doors, mouldings).
Solid good-quality furniture rather than the cheapest state-factory pieces, a few older inherited pieces, lots of books,
nothing lavish or Western-luxury. Hence: hardwood (not chipboard) tea table under plate glass; the upholstered suite kept
as the good 1950s-80s Shanghai 单人沙发 type in plain wool; glass-fronted bookcases full of books (kept); inherited pre-1949
pieces at the dining end (Thonet-type bentwood chairs, a dark-wood sideboard), all of which Shanghai flats of this kind
kept through the 1980s; a newspaper and journals on the tea table's shelf (the scholarly touch). Not added (proposals for
Jade, not built): a writing desk with papers by the windows, a valve radio on the sideboard.

**Great room (Jade, canon).** The house's previously subdivided parts were remodelled and joined; her grandparents made
the living and the dining area into ONE large great room, which is why it is much larger than the schematics an earlier
session found. The room as built (10.5 x 6.1 m, one floor, one ceiling, the old partition only a shallow soffit) is
correct (Jade: walls, balcony, doors and dimensions are worked out and stay). Furnished as one space with two zones: the
living zone at the west end (couch, three armchairs and the tea table round her spot, the side table, the painting and
scrolls on the west wall, bookcases along the north wall), the middle by the windows (her small table and chair, the
wicker lounger facing the TV), the dining zone at the east end (the long table with eight bentwood chairs, the sideboard
in the north-east corner, the TV cabinet on the east wall).

**Reference photos (look-only, kept in the agent scratchpad, never sent to a model).** 22 photos, mostly writers' homes in
Shanghai kept as lived in through the 1980s (Ba Jin's former residence, Ke Ling, Zhang Leping), lane-house interiors and
1970s-90s museum rooms. They show: low dark red-brown varnished tea tables ~90-110 x 45-55 cm, 40-45 cm high, under a
loose sheet of glass (often over cloth or crochet), softened edges, an open lower shelf, square, curved-sled or turned
legs; boxy upholstered armchairs (often slip-covered) with white crocheted antimacassars round the tea table, a small
round dark side table with a ring shelf; dark glass-fronted bookcases over closed cupboards standing in a row; desks
under thick glass. The tea table, side table, crochet covers and bookcases follow these.

**How it works.** `textures.js`: any look with `mat: '<key>'` gets its texture in `dress(root)` (build.js, right after
the room and furniture are built): UVs box-projected at the texture's real size (wood grain along each face's longer side,
cylinders wrapped), the texture re-centred so its mean is exactly the look's canonical colour (lit) and canonical grey
(flat / label; form is modulated by it). No texture edges in line / contour (wood grain would be drawn as objects);
geometry carries line, depth, contour and light. Garments: `dressGarment` (UVs from the figure's arm / body axes).

| piece | source / licence | canonical look | in shots |
|---|---|---|---|
| floor (living + hall) | Poly Haven "Herringbone Parquet" (Jenelle van Heerden, Sergej Majboroda), CC0 | waxed honey-brown herringbone parquet, blocks ~7 x 35 cm, colour 0x8a5a34 (grey 0.56) | every shot |
| walls, ceiling, soffit, facade | Poly Haven "Plastered Wall" (Amal Kumar), CC0 | smooth lime plaster, walls 0xc9c2ae (0.76), ceiling 0xd8d2c0 (0.8); contrast kept low (0.8) so it reads smooth, not stucco | every shot with a wall |
| couch + three armchairs (one suite) | modelled (`joinery.js upholstered`; nothing in Poly Haven / Objaverse matches the Shanghai 单人沙发: the libraries' armchairs are French bergeres, rococo or club chairs, or Ming hardwood) + Poly Haven "Caban" wool (colormass, Rico Cilliers), CC0 | PLAIN brown-rust wool 0x683826, cushions 0x744130, welts 0x4e281a; boxy, rolled arms with piped scroll fronts, welt cords along every edge on all four sides (base top and foot, outside back border, under the rolls), loose seat and back cushions (three on the couch), tapered sapele legs; the backs are the same wool with a welt border | V1a, V1b, V1c, V1e, V1f, V1g, V1h, REF_* |
| crocheted covers (沙发巾) | code-drawn (`textures.js` lace), canonical | cream thread 0xf2efe6, a grid of round flower motifs (5 cm) with picots and chain bars; over each back roll hanging 20 cm down the FRONT and 15 cm down the BACK, and over both arm rolls; also the TV cloth | same as the suite |
| coffee table 茶几 | modelled (`joinery.js coffeeTable`) to the old footprint (0.95 x 0.55 m, glass top at 0.42 m: paper, holds and her pose unchanged) + Poly Haven "Sapele Veneer" (CC0) | dark red-brown 栗壳色 varnish 0x5c2c1c (0.36), darker apron 0x4c2416; rounded bevelled top edge; 6 mm plate glass with pale green edges over the bare wood (no lace under it: the white paper bits would mix with lace); moulded apron with a bead; four TURNED legs; lower shelf on stretchers with a folded greeked newspaper and two journals | V1a-V1h, REF_*, REF_teatable, REF_teatable_low |
| bookcases | modelled (r4, `joinery.js bookcases`) + sapele texture | carcass 0x5a3a26, panels 0x6a4a30, pale shelf edges 0x8a6440, back 0x9a7c5a; ONE handle: a cast-brass mushroom knob (30 mm round rose, neck, 24 mm domed cap; 0.8 scale on the glazed doors); brass keyhole plates with a dark slot | V1a, V1c, V1e, V1f, V1g, REF_* |
| side table | Poly Haven `side_table_tall_01` (James Ray Cock), CC0, real size 0.38 x 0.76 m | round dark plant-stand table with a ring shelf (its own texture) | V1e, V1f, REF_armchairs, REF_wide |
| dining chairs (8) | superseded: see "Dining zone" below | (was bentwood) | REF_wide, V1b (far background), V1f |
| sideboard | "Cabinet" by Wandcaster, Sketchfab, CC BY 4.0, scaled to 0.93 m wide | dark wood, three drawers over two panelled doors, plinth | REF_wide, V1e (edge) |
| TV cabinet | "Old Chest Of Drawers 1" by rhcreations, Sketchfab, CC BY 4.0, scaled to 0.72 m high, recoloured 0x8a6440 | mid-brown wood, two drawers over two doors; the 14" TV on it in wood-grain vinyl under the lace cloth | REF_wide, REF_doors |
| dining table, joinery (hall doors, architraves, skirting, picture rail, frames), hall closets | modelled + sapele texture | each in its existing canonical colour | as before |
| her small table and chair | modelled + Poly Haven "Ash Veneer" (CC0) | pale wood 0x8a6a44 | REF_wide, REF_doors |
| wicker lounger, balcony chair, hall doormat | modelled + code rattan weave | cane 0xc8a868 / white 0xf2eee2 | REF_wide, REF_balcony, V1f |
| uncle's watch | modelled; the DESIGN taken from the paintings (Jade: keep the painted one): media/keyframes/r3/shanghai86/V1b_v1.jpg (the r3 pick, the clearest; r2 V1a/V1b and r3 V1a agree on round steel + brown leather) | round polished-steel case ~34 mm with a slim bezel, four lugs, crown at 3; PLAIN IVORY dial, twelve tiny dark hour dots, two thin straight dark hands at 9:30, no numerals or lettering; dark-brown leather strap 18 mm with pale edge stitching, fitted to the wrist by rays onto the skin. Worn on the SKIN of the LEFT wrist 6 mm past the sweater cuff, dial on the back of the wrist, strap across the wrist, crown toward the hand | V1a, V1b |
| uncle's outfit (as built, colours unchanged) | code-drawn knit and twill | pale cream stockinette pullover (0xe8e4d8) with 2x2 ribbed cuffs and hem (the rib sits exactly at the sleeve ends and the waist), a pale blue-grey shirt collar (two points) with a white top button at the neck, grey-blue worsted twill trousers (0x4a5560) | V1a, V1b, V1f |

**Checks (2026-11-27).** Rendered with the recipe (all modes, beam masks). holdcheck: all 14 holds pass. check_bodies:
22 of 24 pass; V1a / V1b fail on jade3 vs the uncle (body vs body; poses untouched by this pass). clipcheck: only the
known failures (jade3 into the drift pieces; aunt / grandmother slippers 9 mm into the threshold; jade3 / uncle bodies in
V1a / V1b) plus the uncle's trousers 47 mm into the couch's seat cushion in V1a / V1b: he sits on the front of the north
seat at 0.42 m and the cushion top is 0.425 m (the old box couch had its cushion top at 0.42 m, so this is the same seated
compression; a real cushion gives that much). The watch clears the skin (cloth contact 0.4-6.8 mm, within tolerance).
Contact sheets: media/layout/_sheets/canon/shanghai86_canon_{lit,form,refs}.jpg.

**Round 2 of the canon (Jade's answers, 2026-11-27; these override the table above where they differ).**
- **Upholstery:** the plain wool read as plain. Now ONE striped woven wool furnishing cloth on every upholstered surface of
  the couch and the three armchairs (seats, backs, arms, sides, cushions): per 4 cm repeat a 2 cm rust band, a 2 mm cream
  pinline, a 1.4 cm darker brown-rust band, a second pinline, the Caban weave over it (textures.js `uphol`, base 0x683826);
  stripes run up the backs and sides, front to back on the seats, round the arm rolls. Its pinlines are drawn faintly in
  line / contour too (the only texture with edges), so the pattern is in every guide mode. Period basis: the striped
  covers in Ba Jin's living room (reference sheet). Welts stay plain dark rust; the crocheted covers stay.
- **The uncle:** the GREY-BLUE PADDED JACKET of the r3 paintings is canon (colour, quilting, buttons, cuffs from
  media/keyframes/r3/shanghai86/V1b_v1.jpg): CAST top 0x7a8494, quilted in horizontal channels 7 cm apart (textures.js
  `quilt`), a centre placket with five dark grey four-hole buttons, a turn-down collar, over the cream pullover (its knit at
  the neck, its 2x2-ribbed cream cuffs 1.4 cm out of each sleeve). The shirt collar is gone. The watch sits on the wrist
  right after the left ribbed cuff; its dial shows in V1b. Known: in V1a the strap reads as a loop off the back of the
  bent hand (the wrist is flexed; the band is round the forearm axis); trimming the sleeve to put the watch above the
  wrist joint opened holes (no skin is modelled under a sleeve), so it was not done.
- **V1b camera (undecided, Jade):** both versions rendered in all modes: media/layout/shanghai86/V1b_* (22 deg, current) and
  media/layout/_v1b_el34/shanghai86/V1b_* (34 deg); side by side in media/layout/_sheets/canon/shanghai86_V1b_22_vs_34.jpg.
- **Tea cups (replace the modern mugs):** lidded porcelain tea cups (盖杯) as the r3 paintings drew them: tall, flared, foot
  ring, loop handle, a blue flower spray each side, blue rim and foot lines; the lid (domed, knob) with a red plum-blossom
  branch; the same three places, cup 1's lid beside it. Modelled (lathe) with code-drawn decoration. The `mug` prop is no
  longer loaded here.
- **Grandpa's newspaper archive (no desk):** on top of the bookcases, piles of 4-6 identical month bundles (folded
  broadsheets 0.39 x 0.27 m, 7 cm thick), each tied crosswise with RED string, the top sheet a greeked front page, a small
  handwritten date slip (scribble, nothing legible) under the string at the front (joinery.js newspaperArchive, fixed seed).
- **The table glass** stays over the bare wood.
- **Little Jade at 3 (canon everywhere):** a coral-red and white GINGHAM top, 7 mm checks (textures.js `gingham`, one scale),
  LONG sleeves gathered by elastic at the wrists (a gathered band), a plain white round collar (_cast.js jade3: sleeves
  long, top 0xe3a090; build.js jadeOutfit). She appears at 3 only in shanghai86 (bodytest / mtest are engine test sets).
  Also in layout/CAST.md and cast/little_jade_03/COSTUME_CANON.txt.
- **V1d_2 put-down spot (Jade decided: move the spot):** PD is now the table's near (north-west) corner, 2 cm in from both
  edges, slightly to her right (shots.js PD, LAY_TIP): 0.31 m ahead of her V1d_2 seat; her right elbow bends 79 deg, wrists
  in range, holds pass. The laid half lies there in V1d_2, V1d_4, V1d_8, V1d_8_end and every after shot (they all use PD).
  Her position and the cameras are unchanged.
- **Great room:** unchanged walls / doors / sizes (Jade: final).
- **Across the hall (Jade, canon):** the far hall wall now has TWO pairs of glazed French doors, each lined up with one half
  of the great-room doorway (a 12 cm partition on the doorway's centre line), the same joinery (doorLeaf: 5 x 2 lites over
  a raised panel, brass butt hinges, a brass lever and flush bolts on the meeting leaf, architraves, a transom at the same
  height), closed. LEFT (west): the NANNY'S ROOM: a single bed under a quilted blue cover with a lace pillow cover, a small
  two-door wardrobe, a small chest, a bentwood chair. RIGHT (east): the MUSIC ROOM: an upright piano against its left wall
  (the partition), keys to the east, a piano chair; the household's bookcases (the same units, glazing, brass knobs) along
  the back and east walls. Plaster, parquet and wood textured like the great room. The hall closets moved to the hall's
  east end wall (they stood where the doors now are). Before this the far hall wall was a plain box with the closets.
  New view REF_across_hall (from the great room through its doorway).
- **Checks after round 2:** full recipe re-rendered (28 views incl. REF_teatable, REF_teatable_low, REF_chair_back,
  REF_across_hall). holdcheck 14/14 pass (V1d_2's right hand on the half at the new spot: pass, wrists in range).
  check_bodies 26 pass, 2 fail (V1a / V1b: jade3 vs the uncle, body vs body, poses untouched). clipcheck: no new kinds;
  jade3's trousers now reach 28 mm into the floor-drift pieces under her (was 11 mm skin; the long-sleeved garment comes
  with the engine's other garment mesh), the uncle's trousers 47 mm into the couch cushion (seated compression), the
  slippers 9 mm into the threshold. Sheets: media/layout/_sheets/canon/shanghai86_canon_{lit,form,line,refs}.jpg,
  shanghai86_putdown_spot.jpg, shanghai86_V1b_22_vs_34.jpg.
- **Dining zone (Jade: period-check the table and chairs):** the reference photos (Zhang Leping's and lane-house dining
  rooms: media sheet in the agent scratchpad, refs 14, 15, 17) show solid dark red-brown hardwood tables, the top under
  glass laid over a cloth, and plain dark hardwood side chairs with vertical-slat backs; no bentwood chair appears in any
  of them, so the downloaded bentwood chairs are dropped (credits: moved to "not used"). Now (joinery.js diningTable,
  diningChair; modelled, as no CC0 / CC BY chair or table matched): the table keeps its size and place (1.9 x 0.88 m,
  0.76 m, long axis north-south) in the tea table's finish (dark red-brown sapele, turned legs, an apron), plate glass over a
  sage-green and cream woven check cotton cloth (2.5 cm squares, textures.js `tablecloth`) hanging 5 cm with a crocheted
  edging; eight chairs: tapered square legs, side and front stretchers, a rounded seat, a curved top rail and three
  vertical slats, seat 0.45 m. The nanny's-room chair and the piano chair are the same chair. Views: REF_dining,
  REF_dining_low.
- **Piano:** shiny black lacquer, a white crocheted lace runner along the top of the lid, a small gold nameplate on the
  fallboard with no legible text (Jade: final canon; the brand is not named).

**Round 7 (Jade, work/decisions/JADE_R7_DECISIONS.md; overrides the above where they differ).**
- **V1a watch:** "the watch sits half under the cuff": on the LEFT wrist the strap is now centred on the jacket sleeve's
  end, so the near half of strap and case is under the cuff (no pullover rib on that wrist; the right wrist keeps its
  ribbed cuff). The prompt says so and forbids a loop off the hand.
- **V1b, both cameras get test-painted:** the 34-degree camera is now its own shot `V1b_el34` (shots.js; full guides and
  sidecar in media/layout/shanghai86/V1b_el34_*), prompt `V1b_el34` beside `V1b` in _make.py / _jobs.json (same text).
  The old media/layout/_v1b_el34/ folder is gone.
- **Low stools (Jade: "footstool style low chairs ... among the wooden chairs"):** joinery.js lowStool: a 30 cm round seat at
  0.32 m on four splayed turned legs with a ring of stretchers, the dining chairs' dark red-brown wood. Three: two at the
  dining end ((5.85, -1.65), (3.5, -4.15)), one in the living end in front of the west bookcases (-0.3, -5.45) (places my
  choice).
- **Light green thermos (Jade: "often on the dining room table and the side console"):** the same downloaded 暖水瓶 model as
  the TV-cabinet pair, ONE canonical pale green (recolour 0xd8ffe2 over its greys), 0.34 m, standing on the dining
  table's glass (at the table height) and on the sideboard (its top from the model's bounds).
- **Piano (Jade: the dining-ref piano, Zhang Leping's, "is a pretty close match for mine, including the lamp"):** scaled to
  a 1.10 m console height, shiny black; the lace runner along the lid hangs ~20 cm down the front with a small red tassel at
  its middle; a brass piano lamp on top (a domed round base, a curved stem, a horizontal tubular dark-bronze shade, as in
  the photo; my proportions); the blank gold nameplate (final canon: no brand). The model's fallboard stays open (the
  photo's is closed). View REF_piano.
- **Piano bench (Jade):** a real upright-piano bench centred on the keyboard: black lacquer to match the piano, 0.52 m high,
  0.85 x 0.38 m, a lift-up lid with a seam and a brass piano hinge, an apron, four tapered square legs, a stretcher. The
  slat-back chair now stands BESIDE the bench (as for a teacher or a listener), turned toward the keys.
- **Round 8 (Jade):** the two thermoses are pale MINT / CELADON green (0xb4dcc2): a flat celadon base with the model's own
  shading at 15 % contrast (build.js celadon), replacing the multiplied recolour that read as grey sage. The piano's key
  cover is CLOSED, as in the photo (a black lacquered cover over the keys sized from the model's keys, a rounded front lip),
  the blank gold nameplate on the lip's face.
- **Wall clock (Jade: the dining-ref clock is a close match):** restyled at its existing, canon position (Jade: on the dining
  room wall; layout.js CLOCK, east wall, z -5.0, y 2.25): 34 cm round, a deep dark-lacquered wood case with a thick rounded
  rim and a small block beneath, an aged cream dial, large black serif Arabic numerals, a ring of minute dots, black spade
  hands fixed at 9:30 in every shot (textures.js wallClockDial). View REF_clock.

**Open (for Jade).**
- **Watch orientation:** Jade asked for "12 o'clock pointing toward his hand". On a real wristwatch the strap runs across
  the wrist through 12 and 6, so 12 points across the wrist (away from the body when you read it) and the crown at 3
  points toward the hand; the painted V1b_v1 watch is worn that way too. Built the real way; say if you want otherwise.
