# mortongrove07: notes and assumptions

## 2026-11-26: round-3 decisions

Jade's answers (work/decisions/JADE_R3_DECISIONS.md). r3 review page snapshot taken first
(media/keyframes/r3/_layout_snapshot/mortongrove07/, LAYOUT_SNAPSHOT in tools/kf/r3_page.py).

- **Street side: the drawing's TOP (Jade).** Confirms round 2's reading (top = south, Capri Lane); nothing moves.
- **Grand piano: a real grand's outline** (`grandOutline()` in build.js, Steinway B proportions 211 x 148 cm): straight
  spine (bass side) along the mirror, straight front, a short straight treble side (0.40 m), the bentside concave then
  convex round the tail, a rounded tail-spine corner (two tangent-continuous Beziers). Rim from the fallboard back
  (case 0.62-0.95 m), lid closed with its front flap folded back, music desk up, keys between two cheek blocks,
  fallboard, three tapered legs on casters (two under the keyboard ends, one under the tail), the lyre (two posts,
  pedal box, three brass pedals toward the bench). Checked in REF_plan: reads as a grand from above. **Size kept at 7 ft**
  (the brief suggested 1.5-1.8 m unless the plan says otherwise; Jade's drawing says "7' concert grand"). Flagged.
- **Front window 1.5 m as drawn** (unchanged).
- **Framed picture "4x larger": read as 4x the AREA** (2x each side): 0.7 x 0.5 -> **1.4 x 1.0 m**, centre 1.64 m over the
  couch (1.14-2.14). 4x each side (2.8 x 2.0 m) cannot fit between the couch back (0.86) and the 2.44 m front wall.
  Flagged. Its subject is unknown (plain panel in a dark frame).
- **Mirror hangs higher:** y 0.95-2.90 (was 0.25-2.20), same 2.8 m width; its bottom about level with the piano lid.
- **Ceiling (Jade: highest over the middle of the great room, about 3.6 m; piano side and mirror wall very tall; the
  dining room the short side):** ridge still east-west (round 2), now at **z -3.6 (the great room's N-S middle), 3.6 m**,
  pitch 0.322 (about 3.9 in 12), down to the 2.44 m plate at the front and north walls. The **east wall is the full
  gable** (mirror, piano): its top line is the roof angle. **READING (flagged): "the dining room is the short side" =
  a flat 8-ft ceiling over the dining part** (`DROP`: x < 1.6, north of the jog), with a soffit facing the piano
  (x 1.6, from 2.44 m up to the vault) and a short one at the jog line facing the living room; the west (dining) wall
  and the entry wall are flat-topped at 2.44. The alternative (no drop; the vault symmetric over the whole room, dining
  under about 2.95 m) is one question. The stair opening in the east wall is now 2.38 m tall (the vault meets the north
  wall at 2.44).
- **MG_wide moved** to show the tall east wall and the roof angle: from (2.6, 1.6, -7.0) by the piano bench, 18 mm,
  looking SSE: east wall at frame left with the mirror high on it and its top rising from the front corner to the
  ridge; the ridge line across the top; the dining soffit at top right; couch, big picture, front window, egg cartons;
  the grand in the foreground. His facing angle 141 deg (back of head).
- **Loveseat** (Jade): confirmed; label no longer a guess.
- **Sweatshirt (Jade: he hands it as pictured; she turns it round so it faces her).** NOT modelled here: the cloth
  module `sweatshirt.js` is a separate agent's. Done here: `TURN` (layout.js): after MG2 she holds it by the shoulder
  seams, hands **0.50 m apart at y 1.14**, 0.44 m in front of her hips, the front leaning 10 deg back toward her, front
  (seal) facing HER. **New shot `MG2_end`** (same camera axis, 24% along, 42 mm): her hands on `TURN.grip`, head
  looking down at the seal; label mode draws the garment's front outline and seal circle (blue; label mode only), the
  other modes show no garment. **The hook:** `GARMENT[state]` in layout.js (`folded` / `unfolding` / `turned`: collar
  `origin`, `right` / `up` / `out` frame, `grips`), a commented swap-in block in build.js `build()`, and the sidecar
  `hoodie.anchor`. The old placeholder props (folded stack, unfolding front) stay until sweatshirt.js lands.
- Face check (sidecars, his facing angle from the lens): MG1 139, MG1_end 137, MG2 134, MG2_end 132, MG_wide 141,
  REF_plan 132 (from above); REF_north has no figures. Never his face.
- Re-rendered: all modes (line, flat, depth, label, lit, form, contour, light), beam masks (`beam_MG2_end*` new),
  gallery, sheets.
- **Proposed questions for Jade:** (1) mg_dining_ceiling: the dining part under a flat 8-ft ceiling with a soffit [rec,
  as built] / the vault runs over the dining too (lower there, about 2.95 m); img MG_wide_lit.png + REF_north_lit.png.
  (2) mg_piano_size: 7-ft grand as drawn [rec] / a smaller 5'7" parlour grand; img REF_plan_form.png. (3) mg_picture:
  1.4 x 1.0 m [rec] / bigger still; img MG_wide_lit.png.

## 2026-11-25 night (r3, from Jade's r2 keyframe review): ONE continuous camera, folded -> unfolding

Jade on r2 (overrides tonight's "held up unfolded against herself"): MG1 = he hands it FOLDED, the fold cutting off part
of the (large) seal, the camera ZOOMS IN past his shoulder during the clip, never the reverse angle; MG2 = not a
close-up but the SAME continuous camera, continuing, as she takes it and it UNFOLDS.

- **Hoodie prop, two states** (`shot.hoodie` = `'folded'` | `'unfolding'`; layout.js `FOLD` / `FSEAL` and `SHIRT` /
  `SEAL`; build.js `hoodieFolded()` / `hoodieUnfolding()`, a shared `sealGroup(R, cut)` that clips the disc, ring and
  figures at a fold line).
  - FOLDED (MG1, MG1_end, MG_wide, REF_plan): a stack 0.38 x 0.36 x 0.06 m between them at y 0.92, 0.52 m from him
    toward her and 0.12 m to his left; front up, NECKLINE AT HER END (so the seal reads upright for him and the camera
    behind him, and she can lift it by the shoulders straight into MG2); the waistband end folded UP over the front from
    his end (0.15 m flap, plain back panel outside, ribbed edge), its edge across the seal: **28% of the seal's height
    hidden**. The disc is 0.23 m as before (60% of the folded width: "very large"). Grips: his hands under the near END
    at its two corners (thumbs on top; so the camera sees past his left forearm), hers on the far side edges.
  - UNFOLDING (MG2): she has lifted it by the shoulder seams (collar at fwd 0.34, y 1.10); the front hangs 0.27 m to the
    remaining fold, the seal upright on it (its bottom 15% round the fold); the lower part (0.42 m) swings out toward
    him and down at 45 deg, half open, the pocket on its underside. His hands now low at his sides.
- **Cameras: one dolly + zoom along a fixed axis** (shots.js `MOVE`): `MG1` = start, orbit round his head (relBody az
  135, el 26, dist 1.6, 35 mm), solved camera (2.565, 2.348, -2.632) aimed at (2.305, 1.181, -1.028); `MG1_end` (NEW: the
  cut point, MG1's last = MG2's first) 12% along the line, 40 mm; `MG2` 20% along, 42 mm, aim 4 cm lower (a slight tilt
  with the falling cloth). The camera stays behind his head plane: his facing angle 139 / 137 / 134 deg (back of head
  and left ear; never the face). MG2's old close insert is gone; no reverse angle anywhere. If the solved MG1 camera
  changes (staging edits), re-read it from `MG1.json` and update `MOVE`.
- **Sun unchanged** (5 Nov 2007 15:30 CST). In-shaft margins (front window): her eyes 0.47 m, the folded seal 0.19 m,
  the unfolding seal 0.27 m; the folded seal faces UP (it can take the sun: the light map shows a lit patch on the
  stack), the unfolding seal faces him (in skylight, as before).
- Re-rendered: guides, masks (`beam_MG1_end*` new), contour/form/light. Old r2-era MG2 close-insert guides overwritten.
- Keyframes r3: `media/keyframes/r3/mortongrove07/` (MG1_v2, MG1_end_v2, MG2_v2).
- **Plan-row wording (plan not edited):** bridge 2:39.6-2:42.0: "One continuous over-the-shoulder push-in from behind
  him (his hair and ear only): she sits on the floral couch by the front window; he hands her a white hoodie, FOLDED so
  the fold hides part of the big blue IAS seal (2:39.6, MG1); on the same camera, still pushing in, she takes it and it
  unfolds, the seal revealed (2:40.2-2:42.0, MG2). No reverse angle. Cut to the Expedit pan on 'truth by reference'."
- Superseded below: round 2's "UNFOLDED and held up" hoodie paragraph, its staging line and the MG1/MG2 rows of the
  camera table (MG2 is no longer a close insert).

## 2026-11-25 (round 2 answers)

Applied from Jade's decision-page round 2 and her hand-drawn floor plan (`inputs/refs_mortongrove/Pasted image.png`,
private and gitignored: described here, never copied).

**What the drawing shows** (main floor, one open great room): top wall: a window, with the couch along it (side table +
lamp at its left end, a small table at its right end, under the window's corner); a coffee table on a RED rug in front
of the couch; a two-part seat block left of the rug; an armchair right of the rug; along the right-hand wall, under a
second window, a long "coffee table w/ germinating plants in egg cartons, carefully labelled". Below that the right
wall steps OUT (the lower part of the room is wider) and the FRONT DOOR sits in that short step wall, hinged at its
outer end, swinging in. Below: a closet against the right wall; a long dining table (rounded ends) with 6 chairs by a
third window on the right wall; on the left wall a giant mirror with a 7-ft grand beside it (straight side along the
mirror, curved side toward the room, wide end at the bottom), a small box below the piano (its bench), a floor lamp
lower left; stairs bottom-left running left out of the room; a sliding door to the kitchen in the bottom wall.

**Orientation decision: the drawing's TOP is SOUTH (Capri Lane).** So right = WEST, left = EAST, bottom = NORTH.
- The front door is not on the long right wall: it is in the short step wall, which faces the TOP of the page. A front
  door faces the street, so the top is the street side (south, documented).
- The couch and window share the top wall, side by side: exactly Jade's earlier answer ("the couch against the FRONT
  (south) wall, its end stopping just before the big picture window").
- The kitchen behind the slider at the bottom = the back of the house (north); the stairs go left = EAST into the
  two-storey split-level wing. Great room 6.3 m + wing about 4.5 m = the 11.1 m E-W footprint; great room 7.2 m deep +
  kitchen about 3.8 m = the 11.6 m N-S depth. It fits.
- The front window is WEST of the couch (the drawing's window is right of the couch), as round 1 had guessed, so the
  afternoon sun still works.
- **Alternative (flagged):** read "front door on the right" as the right wall being the street side. Then top = east:
  the couch window faces east, the dining and egg-carton windows face south, the kitchen is west, and NO afternoon sun
  can reach her on the couch (it would need a morning sun through an east window, and the couch would no longer be on
  the front wall Jade described). Rejected, but one question to Jade.
- Consequence: the great room is in the WEST of the footprint (round 1 had the living room in the SE corner) and the
  split-level wing is EAST.

**Changes in the set**
- Room: one great room (`ROOM`, `JOG`): the living part x 0-4.9 / z 0 to -2.0, the wider part x -1.4 to 4.9 / z -2.0
  to -7.2. Positions read off the drawing at about 118 px/m (couch = 2.1 m), then fitted to real furniture sizes.
- Windows: FRONT window (south) narrowed to 1.5 m (x 0.20-1.70, sill 0.60, head 2.05): the drawn window is short and the
  same wall now holds the egg-carton table end, the small table, the couch and the side table. WEST window over the egg
  cartons (z -0.30 to -1.70, sill 0.75). DINING window (west wall of the wider part, z -4.60 to -6.10). "There is also
  another window": reconciled as these two right-wall windows (west), besides the front window.
- Front door in the jog wall (x -1.30 to -0.40), facing south; coat closet (x -1.4 to -0.15, z -3.0 to -4.05) with its
  door on the east face (GUESS). Sliding door to the kitchen in the north wall (x 1.25-2.45), one leaf open; kitchen
  floor, far wall and counter beyond. Stairs at the NE corner, 7 risers up, running east (the half flight DOWN to the rec
  room is not drawn and not modelled).
- **Vault: ridge now EAST-WEST, parallel to the street (Jade).** GUESS: on the house's centre line (z -5.6, over the
  dining table / piano keyboard), pitch 4 in 12: the ceiling rises from 2.44 m at the front wall to 4.31 m at the ridge
  and falls to 3.77 m at the kitchen wall. The east and west walls are now the gable ends. Alternative: ridge over the
  great room's own centre (z -3.6, peak 3.64 m). The light never meets the vault (it enters below the window heads and
  only falls).
- Living room furniture per the drawing: couch x 1.85-3.95 (was 2.80-4.80); side table + lamp (off) at its east end;
  small table at its west end under the window corner; RED rug; coffee table on it (shortened at its west end, x
  2.55-3.80, so he can stand there); the left-of-rug block read as a LOVESEAT facing west (GUESS); armchair west of the
  rug facing east; the egg-carton table along the west wall (18 cartons, sprouts, a white hand-lettered label stake in
  each). TV removed (not in the drawing). Framed print over the couch kept (invented).
- Far part: giant mirror on the east wall (2.8 x 1.95 m, rendered as a grey panel, NOT reflecting); 7-ft grand (2.13 x
  1.50 m) with its spine along the mirror, keyboard at the NORTH end, bench north of it, so the pianist faces south
  toward the living room; floor lamp NE; dining table 1.90 x 0.95 m, rounded ends as drawn, long axis E-W, six chairs (2 +
  2 + one at each end).
- **The gift is a WHITE HOODIE, UNFOLDED and held up** (Jade, 2026-11-25 late, superseding "sweatshirt" and "the
  seal almost the whole front"). Held by the shoulder seams against herself, the front toward him (and every camera
  behind him): 0.58 m front, 0.69 m long; the upper part from her collarbone (1.06 m) down to her knees, the lower part
  folding forward over them to the ribbed waistband; sleeves hanging beside it. Hoodie parts: the hood hanging BEHIND
  the neckline (between the hoodie and her; its folded top just shows above the neck), the neck opening's rim, two
  flat white drawstrings (0.21 m, 0.088 m apart), a kangaroo pouch pocket (0.32 -> 0.38 m wide) from 0.36 m below the
  shoulder line, straddling the knee fold, to the waistband. The seal: a CHEST print in BLUE (0x2f62a8), a SOLID filled
  disc 0.23 m across (40% of the front's width), centred 0.19 m below the shoulder line, the figures (placeholders:
  two white bars and heads) and a thin inner ring in white reverse, TRUTH left, BEAUTY right as one faces it; rim
  lettering INSTITUTE FOR ADVANCED STUDY / FOUNDED 1930 for the painter. Size and position measured off Jade's size
  reference (`inputs/refs_ias/`, private: a product photo of a hoodie with the print at chest size, about 40% of the
  front). The prop sheet for painters is `cast/first_love/fl_H_ias_hoodie_v2.jpg` (if it exists: see that folder's NOTES).
- Staging: she sits on the couch's west cushion (next to the window), turned 16 deg toward him, holding it up and
  looking up at him. He stands at the coffee table's west end (x 1.95, z -1.48), 0.95 m from her, leaning in a little,
  hands low and open (he has just let go). His forearms show (sleeves pushed).
- Cameras: **MG1** now over his LEFT shoulder (behind and above, 35 mm): his head and ear at frame right (133 deg from
  the lens, no face), her face, the whole chest print upright and readable (40 deg off its normal), the window top right.
  **MG2** (was her eye-line onto a folded stack) is now a close insert from just past his left side at her chest
  height: the hoodie front fills the frame with the chest print upright at centre, her hands on the shoulders, her chin and face above; his head out of frame
  (89 deg, not visible). **MG_wide** now from the dining table behind him (his head 145 deg). New **REF_north** (room
  reference toward the piano, dining and kitchen; NO figures, because that camera would face him). **REF_plan** is
  oriented as Jade drew it (south up) to compare against her drawing.

**Sun re-check (SCENE unchanged: Monday 5 Nov 2007, 15:30 CST, elevation 10.9, azimuth 237.0).** The sun still honestly
reaches her: through the front window her eyes are 0.46 m inside the shaft, her head 0.30, the seal 0.32 (the shaft
also crosses the hoodie). It comes from behind her left shoulder, so it RIMS her hair, cheek and shoulder and lights
the BACK of the hoodie; the seal's front faces him (north-west) and is in the window's skylight, not the sun
(incidence cosine -0.23). Physical, not a staging choice: from a couch on the south wall a hoodie turned toward
someone standing in front of her faces north, and no Chicago winter sun can fall on it; the only grazing sun on the
front (cosine up to 0.25) is late spring evenings through the west window (late March / April, 17:00-18:00).
`sweep.mjs` (re-run for the 1.5 m window): 74 of 511 afternoon suns between October and April put both her eyes and
the seal more than 0.1 m inside the front-window shaft; on 5 Nov the band is about 14:40-15:50 CST, so 15:30 stays.
The west (egg-carton) window throws a second shaft across the seedlings and on toward the mirror and piano; his head is
outside both shafts. The dining window lights the dining table.

**Assumptions flagged** (beyond those above): the drawing's scale (couch 2.1 m) and every size; the jog makes a 1.4 x
2.0 m entry notch at the house's SW corner, while the county footprint is a plain rectangle (perhaps under a porch
roof; the assessor says "no porch"); window sills / heads; the two-part block = a loveseat; the closet door side; the
piano's bench side; the mirror's size; the ridge position and pitch; that she holds it seated (not standing).

**Earlier answers vs the drawing:** "room and light look right" still holds (living room width kept at 4.9 m, same
sun, same side of the couch). "Big picture window": the drawing's window is short (about 1.5 m), so the window
shrank; asked. Dining table: Jade said long rectangle with more chairs; the drawing has rounded ends and 6 chairs:
built as drawn (a racetrack oval). The child's table and chair in the HANDOFF belong to **shanghai86** (balcony, wicker
lounger), not this house: nothing to apply here. The TV (invented) is gone; nothing in the drawing replaces it.

**Plan-row impacts** (plan not edited): the bridge line at 2:39.6 ("she sits on a floral couch by the windows; over
his shoulder (only his hair), he hands her a white hoodie with the IAS seal") still holds; what changed is the
moment shown: she is already holding it UNFOLDED, seal to camera, rather than a folded hand-over. The plan's summary
table ("Low sun through the picture window") still holds. If Jade wants the hand-over itself seen, it needs a beat
before this one (no time in 2.3 s).

## From Jade (authoritative)
- She sits on a FLORAL couch near some windows. Over the shoulder from behind him, only his hair (his ear is fine); he
  gives her the gift: a WHITE HOODIE (hood, drawstrings, kangaroo pocket) with the IAS seal printed in BLUE, round, two
  standing figures, TRUTH (left) and BEAUTY (right) (2026-11-25 late: hoodie, not sweatshirt). The print is a solid
  filled blue disc with the design in white reverse, chest-sized, about 40% of the front's width, as in her size
  reference (supersedes round 2's "HUGE, almost the whole front"). She holds it unfolded.
- The three-seat floral couch stands against the FRONT (south) wall, and its end stops just before the window begins:
  couch and window side by side on the same wall.
- The ceiling is VAULTED, its ridge PARALLEL TO THE STREET (round 2). There is another window (round 2). The floor plan
  drawing (round 2).
- His hair: dark brown, straight. Cork Birkenstock-type sandals (Naot); forearm hair clearly visible.

## The house (documented; inputs/refs_mortongrove/README.md, gitignored)
- 1955 split-level, 1,296 sq ft, a plain rectangle 11.1 m E-W x 11.6 m N-S (the README's 11.8 is slightly off: the OSM
  corners give 11.63), FRONT FACING SOUTH onto Capri Lane, back yard north (about 1 degree off north: ignored). Main
  level (living, dining, kitchen); bedrooms half a level up; rec room half a level down.

## Axes and frames
- x east, z south, y up; origin = the inner SW corner of the living room (the inner faces of the egg-carton-window wall
  and the front wall). House frame (origin = SW corner of the footprint, x east, y north) = (x + 1.6, 0.2 - z).

## Other assumptions (unchanged from round 1)
- **Year 2007** (grad school was about 2005-2009); `SCENE` uses 2007-11-05 15:30 CST (a staging choice; NOAA equations).
  Eaves are not modelled (a sun this low passes under them).
- **Cast**: `jade27` (kind `adultJade27`, 1.65 m) stands in for Jade at about 24; placeholder blue-grey long-sleeved
  top. `firstLove27` (kind `adultFirstLove`, 1.78 m), `costume: { sleeves: 'pushed' }`, bare feet in plain cork
  sandals (set-local geometry). Sandals indoors is an assumption.
- The floral pattern is not modelled (pale dusty rose).

## Cameras
| id | what | his face | notes |
|---|---|---|---|
| `MG1` | over his left shoulder, behind and above (35 mm), looking south-west | 133 deg: back of head and ear | her face (30 deg to lens), the whole chest print upright (40 deg off its normal), her hands on the shoulders, window top right |
| `MG2` | close insert past his left side at her chest height (35 mm) | head out of frame (89 deg, not visible) | the hoodie front fills the frame, the chest print upright at centre; her hands; her chin/face above; window backlight at frame right |
| `MG2_end` | r3: same axis, 24% along (42 mm): she has turned it round, front toward her | 132 deg | garment from the cloth module; label mode: its outline |
| `MG_wide` | r3: from by the piano bench (18 mm), looking SSE | 141 deg | the tall east wall (gable, roof angle), mirror, grand, couch, picture, window |
| `REF_north` | reference toward the piano, mirror, dining, closet, kitchen slider (18 mm) | no figures | the vault rising to its E-W ridge |
| `REF_plan` | plan, SOUTH UP as Jade drew it | from above | compare with her drawing; white outlines = the three sun shafts |

Sidecars carry `time` / `film`, `house` (orientation, ceiling), `sun` (margins per window: front / west / dining, and
`seal_front_cos`), `hoodie` (was `sweatshirt`; kind, state, collar, seal with `reads_upright_on_screen`, grips), `first_love` (face_shown
false, facing angle), `beam` (solid[0] = front window), `points_world` (now with knees). `panes`: `front_window`,
`west_window`, `seal_square` (TL, TR, BR, BL as one faces the front).

## Beam masks
- `node layout/render.mjs --set mortongrove07 --prefix beam_ --modes flat --nojson`
- `beam_<id>` = the lit volume (three solids: front, west, dining windows); `beam_<id>__surf` = lit surfaces only. MG1
  and MG2 look through the broad shaft: use `__surf`. The mask ignores facing and shadows: the seal's front is inside
  the shaft but faces away from the sun (see above).

## Open
- Questions for Jade (decision page): orientation; front window size; ridge position; she holds it seated vs stands;
  loveseat; closet door; mirror reflections wanted in renders?
- The mirror does not reflect (the engine can composite one mirror, as car26; not wired here: no current camera sees it).
- Small shadow-line acne on the couch arms in line mode; the hoodie is flat panels (folds, drape and the seal's
  lettering are for the painter); the seal figures are placeholders (white bars); the drawstrings cross the disc as
  in Jade's reference.

## History
- 2026-11-25 late: ceiling rebuilt as a vault (ridge N-S, 4/12, peak 3.26 m). Superseded by round 2 (ridge E-W).
- 2026-11-25 refit: living room 4.9 x 4.3 m in the SE of the footprint, picture window 2.35 m in the west of the south
  wall, couch east of it, folded sweatshirt handed over (MG1 over his right shoulder, MG2 her eye-line onto the folded
  stack). Superseded by round 2 (Jade's drawing; great room in the WEST of the footprint; unfolded sweatshirt).
- 2026-11-25 first pass: an invented 4.0 x 5.0 m room. Superseded.
- Retimed to the -2sm master, 2026-11-25: `FILM` (layout.js) t 159.62-161.96 ("Beauty on this side" to "truth", where
  the plan cuts to the Expedit pan), line 159.62-164.36, time 2:39.6-2:42.0; MG2 header 2:40.2. NB mv10's `BRpan_a`
  also starts at 159.62 on "Beauty on this side"; the plan starts the pan on "truth by reference" (2:42.0): one of the
  two wants settling.

## 2026-11-26: round-3 decisions (the cloth hoodie)

Jade: "Frame it so Truth falls in the folds -- because the sweatshirt is a soft material, it can move as she's holding
it and turning it." He hands it over (MG1), she turns it so the print faces her (MG2 -> MG2_end).

- **Files:** `sweatshirt.js` (meshes, API), `sweatshirt_jolt.js` (Jolt Physics soft body; jolt-physics 1.1.2 WASM vendored
  at `layout/vendor/jolt-physics/`, 3.2 MB, MIT), `sweatshirt_sim.js` (pattern, pressed pleat, choreography, Truth check),
  `sweatshirt_print.py` (print texture from `work/ias/`), `sweatshirt_test.html/.mjs` (standalone renders, `SW_*`).
- **Engine:** the lead asked for an existing engine (Jolt first). Jolt solves the cloth (edges, shear, distance bend,
  kinematic held vertices, collisions with her fists and thighs). Jolt has NO cloth self-collision, which a hoodie needs
  (pleat layers, hood behind the back, sleeves on the body), so a contact projection between layers runs after each
  Jolt step (`selfContact`). Jolt's dihedral bend blew up at the pleat's 180-degree folds; distance bend is used.
- **How Truth hides (assumption, flagged):** a vertical KNIFE PLEAT pressed through the seal from when he folded it,
  pattern x -0.059..+0.010 m from the seal centre folded under, Beauty's side on top (its fold edge runs down beside the
  two women's joined hands). Truth's face-side is between cloth layers, hidden from both sides. She holds it by a fistful
  of that pleat under the neckline the whole time (right hand, handed to the left after the turn). Jade did not say how
  it was folded; the pleat is my reading of "falls in the folds".
- **Her hands differ from the room agent's anchors** (GARMENT grips at both shoulder seams, 0.50 m apart): a hand on
  each shoulder seam pulls the chest flat and opens any fold over Truth. t 0: right hand at the pinch (centre of the
  chest, under the neckline), left on Beauty's shoulder seam, 6 cm in and 3 cm down for slack. t 1: left hand on the
  pinch, right on Beauty's shoulder, 8 cm in and 3 cm down. build.js's swap-in block writes these into NAMED (herR;
  tHerL, tHerR, tseal) so the figures' hands go where the cloth is held.
- **Choreography (t):** 0-0.14 holds it up; 0.14 left lets go; 0.14-0.52 right turns it half round by the pinch; 0.50-0.56
  left takes the pinch; 0.56-0.84 right takes Beauty's shoulder and brings it up; 0.84-1 holds it, front to her.
- **Check:** every SW render is also drawn with Truth's figure (a conservative box) painted solid red; red pixels are
  counted. Renders with Truth pixels go to gitignored `work/sweatshirt/`; only renders with none go to
  `media/layout/mortongrove07/`. The engine guides (MG2, MG2_end) carry a plain blue disc only (no texture).
- **Weak:** the one-handed phase (t 0.2-0.6) is a crumpled hang; cuffs crumple; at t 1 the print reads poorly even from
  her side (the disc gathers at the pinch). MG1/MG1_end's folded stack (the set's own prop) still shows the seal's upper
  part including Truth's silhouette: to be consistent it should show the pleat (Truth's strip folded under).
- **fal:** not used, $0.
- **Lead's fixes (same day):** air damping kept low and the body's bend stiffness unchanged (stiffer bends and heavy
  damping both opened the pleat in tests); instead a 2-pass display smoothing takes out the one-cell crinkles (the Truth
  check renders the smoothed surface); ribbing bends 10x stiffer; drawstrings dropped (STRING.n = 0); the pinch is a
  whole hand, 9 cm of the pleat (4 rows), which keeps it shut through the turn; the MG1 stack's seal is the same pleat
  (`foldedSeal`: Beauty only, Truth folded under); her hands take a power grip (engine/grasp.js) round the pinched
  bundle / the rolled shoulder seam at the cloth's own grip points, palms toward it from her side. Re-timing the turn
  shorter (one-handed hang only t 0.10-0.30) made the swing open the pleat, so the original timing stays.

## 2026-11-26: fixed background art and clothing decals (Jade: art and logos the same in every shot)
- The framed picture over the couch has a canonical image: layout/assets/art/mortongrove07/mg_picture.png (a muted
  impressionist field landscape, no strong blue, in a cream mat 0.11 m; SUBJECT INVENTED, Jade gave only the size).
- NOT YET IN THE RENDERS: build.js belongs to the cloth agent. HOOK for the lead: in build.js add
  `import { framedPictureArt } from './art.js';` and, after the two 'framed picture' lines, `g.add(framedPictureArt());`
  (checked in a scratch copy: MG_wide, MG1 lit/line/form). Then re-render and repaint MG1, MG1_end, MG2.
- The IAS seal decal is the cloth agent's (sweatshirt.js). The mirror stays a blank box (only reference views see it).

## 2026-11-26: hold pass (Jade: objects held so they are supported; correct physics; natural wrists)
Checked with `--gaze` + engine/holdcheck.mjs, mannequin and `--body mesh`. First love: no change to cameras, face or name.
- FOLDED stack (MG1, MG1_end, MG_wide, REF_plan). build.js hoodieFolded: the core is ONE box W x T x A (it was a bottom
  layer plus a front layer inset 6 mm) and the first part of the group, so the check holds the whole stack. The fold at
  his end now sits against the core's end (it was 4 mm into it). The neckline rim's centre is 16.5 mm higher (it went up
  to 12 mm into the stack). The flap, waistband and drawstrings lie on top.
- Hands (shots.js `sideBelow`): both carry it FROM BELOW (tagged twoHandsBelow). Her palms are under the long side edges
  near her end, turned 50 deg up and in onto the bottom corners, fingers along the edges. His hands take the end corners
  on his side with the heels of his hands, palms 45 deg up and in, fingers running down along his forearms. Hand =
  'cup' with curl and thumb opened flat, so the engine swivels the elbow rather than turning the hand off the stack.
  The power grips round a cylinder at each edge (`edge`, kept) curled the fingers back up through the stack. His spine
  bend is now 24 (was 18) so he reaches the stack; hers is unchanged at 14. Wrists in range except his right hand,
  radial +4 deg.
- MG2 / MG2_end (Jolt cloth): her power grips now close round an 18 mm bundle (Math.max(grip r, 18 mm): the fleece
  gathered with the 12 mm seam), with the palm square to the seam. Every finger is now 0-2 mm into the bundle; it was
  10-15 mm through the bare seam. The sidecar gains `cloth_grips` (grip cylinder + cloth vertices within 7 cm of it).
  holdcheck cannot judge this: it hulls a hanging, pinned soft body as one rigid convex object. The hands and her lap
  necessarily lie inside that hull, so its "penetrates / falls" says nothing. Still open: the cloth passes up to 13 mm
  into the fingers, because the sim's fist collider (sweatshirt_jolt.js fist r 22 mm) is thinner than the posed hand
  (about 38 mm to the backs of the fingers). Fixing it changes the drape: that is a job for the cloth agent, with a look
  review afterwards.
- Repaint: MG1, MG1_end (hands under the stack, his end corners), MG2/MG2_end (hands).

## 2026-11-26 (late): round-4 decisions (work/decisions/JADE_R4_DECISIONS.md)

- **Ceiling: ONE tilted plane (decided).** Jade: "the ceiling on the mirror side is all high and straight and flat. the
  low side is the dining room side. the ceiling for this room is one plane", then (via the lead) "single ceiling
  tilting from high to low, high side is mirror side, the wall behind jade on the couch is a trapezoid". Built as a shed
  ceiling (layout.js `VAULT`, `ceilAt(x, z)`; build.js `ceilingPlane`, `vwall`): highest along the EAST (mirror) wall,
  whose top is now level, falling west to the WEST (dining) wall. No ridge, no flat dining drop, no soffits (all removed).
  The front wall behind the couch and the north (kitchen) wall are trapezoids, tall at the east end.
  **Heights FLAGGED** (Jade gave none this round): 3.6 m at the east wall (her r3 "about 3.6 m" at the top), 2.44 m (8 ft)
  at the dining wall x -1.4, so 2.70 m at the living room's west wall (x 0); pitch 0.184 (about 2.2 in 12). The two-version
  question was dropped: decided.
- **Grand piano 7'1" = 2.16 m: a real downloaded model** (`layout/assets/props/grand_piano/`, "Grand Piano" by
  thanhthanh, Sketchfab via Objaverse, CC BY 4.0, credited; bench removed, scaled uniformly to 2.16 m, 1.452 m wide with
  the real 1.22 m keyboard; lid closed, fallboard open, three legs, lyre). Turned 180 deg: keyboard NORTH (bench side),
  spine (the player's left) along the mirror, as drawn. Ebony / ivory / brass looks per material. PIANO.L 2.16, W 1.452;
  the hand-built `piano()` stays as the fallback if the model fails to load. Checked in REF_plan (south up) and REF_north.
- **Picture: a Chinese ink-and-wash galloping horse** (Jade: "a chinese watercolor style horse mid-gallop with fully
  visible hooves"), 1.4 x 1.0 m as built. New canonical texture `layout/assets/art/mortongrove07/mg_picture.png`
  (Codex image_gen, tmux proof-mg, $0; prompt and notes in mg_picture.txt): one horse side-on, galloping left to right,
  all four hooves well clear of every edge; invented: the pose, a four-character inscription ("fine steed galloping")
  and a red seal at upper left (slightly cut by the left edge of the crop).
- **Props phase 2:** the coffee-table mug is the downloaded `mug` ("Cup" by saleviim, CC BY 4.0; credited). Nothing in
  this set is held except the hoodie, so the hold check is unchanged by the swap. The mug is not held, so its props.json
  grips (reported mirrored by the shanghai86 agent; the lead fixes them centrally) are not used here; its base is at y 0
  (measured on the glb), so it rests on the table top.

## 2026-11-26 round 4 — PROGRESS (checkpoint)
- DONE (code, scratch-rendered, looked at): ceiling = one tilted plane, 3.6 m east (mirror) -> 2.44 m west (dining),
  front and north walls trapezoids (heights FLAGGED); grand piano = downloaded 7'1" model (2.16 x 1.452 m, CC BY,
  credited); picture = Chinese ink-and-wash galloping horse, all four hooves clear (mg_picture.png, Codex proof-mg);
  mug = downloaded model (credited). Checked: REF_north, REF_plan, MG_wide (lit/form) in the scratchpad only.
- IN PROGRESS: a helper is measuring finger-vs-cloth penetration on the Jolt hoodie (MG2, MG2_end; MG1/MG1_end stack)
  and fixing the hand colliders in sweatshirt_jolt.js / sweatshirt_sim.js; Truth-pixel counts must stay 0.
- LEFT: apply any build.js/shots.js diff from the cloth fix; full three-pass re-render to media/layout/mortongrove07/
  (r3 snapshot already taken); gallery; look at every changed shot; REPAINT_LIST.
- Questions for Jade: none new (ceiling decided). Flags: ceiling heights 3.6 / 2.44 m; the inscription and seal on the
  horse picture are invented.

### checkpoint update (cloth / finger contacts, 15:00)
- Measured BEFORE (helper's `cloth_contact.mjs`; + = finger-into-cloth overlap, mm): MG2 left (shoulder) palm +14.2,
  thumb +20.5; MG2 right (pinch) index +15.3, middle +15.7, ring +14.9, little +4.6, thumb +17.1, palm +15.6; MG2_end
  left (pinch) about the same; MG2_end right (shoulder) index +14.4, middle +14.2, ring +7.9, thumb +17.1, palm +15.6.
  MG1/MG1_end (the stack, carried from below) pass holdcheck: fingers 0 mm, palm 2.3 mm.
- Root causes: the sim's fist was one solid 22 mm capsule, so the cloth wrapped round it exactly where the fingers are;
  and a pre-existing bug in sweatshirt_jolt.js: Jolt returns BodyIDs in one reused wrapper, so the left and right
  fists were the SAME body (the left hand never had a collider). Fixed (keepID copy).
- In progress (helper, sweatshirt_jolt.js / sweatshirt_sim.js, plus a new cloth_contact.mjs): sim hand = the posed
  grip template's capsules, pinned fistful of the pleat. So far fingers and palm reach <= ~2 mm in some configurations,
  but the THUMB still threads the cloth (+17 mm): engine/hand.js wrapPose puts the thumb round the far side of the grip,
  under the bundle. Proper fix is ENGINE-side (the thumb on the palm side for cloth grips): not ours to edit; flagged.
- Truth: the helper's latest test run (14:58, work in progress) shows Truth pixels at t 0.3 cam (6) / close (19),
  t 0.5 her (21), t 0.8 her (3): NOT acceptable yet; those renders were routed to gitignored work/sweatshirt/.
  Audited every SW_*.png in media/layout/mortongrove07/ against its check mask: all 0 red pixels; nothing to move.
- Left: helper to finish (Truth back to 0 everywhere), apply any build.js/shots.js diff, full re-render, look, report.

### checkpoint update (cloth helper finished: NOT fixed)
- Fingers still pass 13-20 mm into the cloth in MG2 / MG2_end (numbers above, unchanged). The helper could not reach
  <= 2 mm without the pleat opening and Truth showing: gathering the fistful into the fist cut the worst overlap to
  8.8 mm but put 4,000-11,000 Truth px on screen from t 0.5; posed-hand colliders on the shoulder grips alone got MG2 L
  to <= 0.7 mm and MG2_end R to <= 6.6 mm with t 0 / t 1 Truth-free, but dragged the t 1 drape badly (not adopted).
- Changes kept (all opt-in, default OFF, so the published drape is the committed one): sweatshirt_jolt.js posed-hand
  template + options, and the BodyID bug fix with `leftFist: false` (turning the left fist on shows Truth at t 0.3);
  sweatshirt.js lapColliders returns her chest point (not a collider); sweatshirt_test.html `window.clothSurface` and
  hand close-up views; new cloth_contact.mjs (the measurement). Notes: work/sweatshirt/contact_notes.md.
- Truth: t 0 and t 1 (MG2, MG2_end) are 0. In-between test frames (not shots) were already non-zero before this pass:
  t 0.3 cam 6 / close 19, t 0.5 her 21, t 0.8 her 3 (in gitignored work/sweatshirt/). Every SW_*.png in media/ checked: 0.
- What a real fix needs: (1) a different grasp for the pinch (the pinch is a 63 mm-tall strip of pleat; a horizontal power
  grip round an 18 mm cylinder cannot close round it without passing through): e.g. a vertical-axis pinch or a thick
  pinch, in build.js's swap-in block plus the matching sim hand; (2) ENGINE (not ours): engine/hand.js wrapPose puts the
  thumb round the far side of every grip, closing the fist's open lower side where the cloth hangs out; for cloth grips the
  thumb should go on the palm side. Owner: the attic+wall agent / lead.

### checkpoint update (done)
- Re-rendered all three passes (default modes, form/contour/light, beam_ masks) and rebuilt the gallery. Looked at
  REF_north, REF_plan, MG_wide (ceiling plane, trapezoid walls, piano, horse picture), MG1 and MG2_end (unchanged staging;
  his face not shown). Open: the finger/cloth contact (above), the rag-like mid-turn cloth, MG2/MG2_end holdcheck
  (meaningless for a soft body; cloth_contact.mjs is the real measure).

## 2026-11-26: round-5 decisions (work/decisions/JADE_R5_DECISIONS.md)

Jade: "the ceiling needs to be steeper. I just added mg_streetview.png which can give you the angle. based on door
height, window heights, angle, can you compute the rest? can you also make the piano fully black? the horse is pretty
good but should be galloping left (also give it a vermilion seal)." Plus the open fix (fingers into the hoodie) and the
dark MG_wide_lit.

### checkpoint (start)
- Started: street-view measurement (below, in progress); vermilion seal requested from Codex (tmux proof-mg, $0).

### The ceiling: measured on the street view (inputs/refs_mortongrove/mg_streetview.png, private, look-only)
Pixel coordinates in the 931 x 706 image (camera faces north; west is image-left; the great room is the one-storey part
with the picture window, the two-storey split-level wing is to its east, image-right).
- **Scale (front wall plane):** the front (storm) door spans y 514 (head) to 596 (threshold) = 82 px and x 358-395 =
  37 px. Aspect 0.45 = a 36 x 80 in door, so the image is not stretched. 80 in = 2.03 m -> 0.0248 m/px (+-4%: door
  edges +-1.5 px; it could be a 32 in door, which would mean a 12% horizontal stretch: see the pitch error).
  The picture window's head is at y 514, the same as the door head (6 ft 8 in, the usual header line); its sill is
  y 580 (0.40 m above the floor). 
- **Wall height (low side):** the front gable's siding triangle sits on the wall top at y 496 = (596 - 496) x 0.0248 =
  2.48 m above the floor; the fascia bottom is at y 506-507 = 2.22 m (the eave hangs below the plate by overhang x
  pitch). So the plate is the ordinary 8 ft: **low side 2.44 m (2.40-2.50).**
- **Roof pitch (front gable over the picture window, nearly fronto-parallel):** inner siding triangle: apex (515.8,
  455), base corners (440.8, 495) and (584.2, 496.7): rise 40.9 px over half-base 71.7 px = 0.570. Outer roof edge:
  left half 57.5/107.5 = 0.535, right half 60/95.8 = 0.626 (the halves differ by the camera's slight yaw/roll; the
  base-to-apex ratio cancels most of that). With a cos(15 deg) yaw allowance: **pitch 0.57 +- 0.04 (29.7 deg, about
  7 in 12; 6/12 = 0.50 and 8/12 = 0.67 are both outside the band).** Apex outside: y 446.7 = 3.70 m above the floor.
- **The wing's ridge:** apex of the two-storey wing's gable at y 380 = (596 - 380) x 0.0248 = **5.35 m above the main
  floor** (outside, +-0.2 m: same facade plane assumed). The one-storey roof's top edge runs up to the wing at about
  y 388 (5.16 m), i.e. the great room's roof rises toward the wing, as Jade says the ceiling does (high on the mirror =
  wing side).
- **Arithmetic:** the room is 6.3 m from the dining wall (x -1.4) to the mirror wall (x 4.9).
  - Literal (cathedral parallel to the front gable, across the whole room): 2.44 + 0.57 x 6.3 = **6.03 m (+-0.3)**.
    That is ABOVE the wing's ridge (5.35 m outside), which the photo rules out: the great room's roof would stand
    taller than the two-storey wing.
  - Built (one plane, capped under the wing): high = wing ridge 5.35 - about 0.25 m of roof and rafter = **5.10 m
    (+-0.3)** at the mirror wall; low 2.44 m at the dining wall; pitch 2.66 / 6.3 = **0.42 (5 in 12, 23 deg)**;
    3.05 m at the living room's west wall (x 0); the trapezoid wall behind the couch runs 3.05 -> 5.10 m.
  - Reading consistent with both the gable pitch and the cap: 0.57 over the living room alone (x 0 -> 4.9) gives
    2.44 -> 5.23 m, which fits under the wing; but then the 1.4 m dining jog would need a flat 2.44 m ceiling, which
    Jade rejected ("one plane"). Not built.
- **FLAGGED for Jade (decision card proposed):** high side 5.1 m (built; fits the photo) vs 6.0 m (the gable's pitch
  across the whole room) vs 5.2 m with a flat dining jog. Was 3.6 m.

### checkpoint: piano, mirror/brightness, hands (in progress)
- Ceiling built: VAULT.high 5.10 (layout.js); trapezoid walls follow ceilAt (no other change needed).
- Piano fully black: EBONY = { grey 0.05, col 0x0b0b0d } for the downloaded model's gpiano_main (case, lid, legs, lyre,
  desk), the bench (top too) and the fallback piano; keys and brass unchanged.
- MG_wide_lit brightness: lit ambient 0.75 -> 1.3, sky 0.7 -> 0.95; the mirror in the lit pass is a pale glass panel
  (0xe6ecf0, no glow: an emissive version bloomed to pure white and read as a window). Scratch measure (mean luminance
  0-255): before 49.6 (median 36), after (ambient 1.1) 68.2; final numbers after the re-render below.
- Horse: mirrored (work/art_mg/mg_picture_mirrored_noseal.png), the old calligraphy column and seal painted out with
  clean paper from the same sheet. The vermilion seal: Codex hit its image limit at 15:44 ("resets in about 42
  minutes"); retry after 16:27.
- Hands (finger/cloth): engine/hand.js wrapPose thumb.wrap 'palm' (opt-in) added. Sim: posed-hand colliders swapped in
  late. ~45 sim runs (scratch): any posed PINCH hand reshaped the fold at the top of the seal (Truth px up to 10k, or the
  seal folded away from the camera); posed SHOULDER hands with the published pinch fist keep the drape and Truth 0 at t 0
  and t 1 in all three test views. Adopted: shoulder hands posed (last 0.5 s, lifted 5 mm, thumb palm-side). Result:
  MG2 L (shoulder) worst +0.7 mm (was palm +14.2, thumb +20.5); MG2_end R (shoulder) worst +0.9 mm (was +14..+17).
  The PINCH hands (MG2 R, MG2_end L) are still +15 mm (thumb +12.6 / +20.5): NOT FIXED.

### checkpoint: re-rendered (three passes), measured
- Sim (sweatshirt_jolt.js JOLT_DEFAULTS, r5): hand 'posed' for the shoulder grips only (posedFor ['shoulderL']),
  posedLate 0.5 s, posedLift { pinch 0, shoulder 0.005 }, gripR 18 mm, approach { from 0.06, dur 0.4, back 35 },
  template HAND_CLOTH (engine/hand.js grip + thumb.wrap 'palm', jade27 Lh 0.186). New opts: handT, posedLate,
  posedLift, gripR; export handTemplateFor. build.js: the shoulder hands get hand { shape 'grip', thumb { wrap 'palm' } }.
  cloth_contact.mjs picks the template per hand; sweatshirt_test.mjs --out DIR for trial runs (kept outside the repo).
- cloth_contact.mjs --sidecar on the new media sidecars (mm, + = overlap): MG2 L (shoulder) index -9.9, palm +0.1,
  middle -8.7, ring -13.6, little -18, thumb +0.7; MG2_end R (shoulder) index -2.3, palm 0, middle -3.4, ring -4.4,
  little -18.2, thumb +0.9. Pinch hands unchanged: MG2 R index +15.3, palm +15.6, middle +15.7, ring +14.9, little +4.1,
  thumb +12.6 (was +17.1); MG2_end L +15.3 / +15.6 / +15.7 / +14.9 / +9 / thumb +20.5.
- Truth (sweatshirt_test.mjs, all 11 t x cam/close/her): t 0 and t 1 = 0 in every view; in-between frames as before
  (t 0.3 cam 6 / close 19, t 0.5 her 21) plus t 0.8 cam 7 / close 8 (was her 3): those go to work/sweatshirt/ (private).
  The tracked media SW_t080_cam.png is now the OLD drape's frame (its new version has Truth px, so it went private);
  the tracked SW_*_front / _zoomcam are older views the page no longer makes.
- What was tried for the PINCH (~50 runs, scratch): posed hook hands with lift 0-45 mm, r 16-22 mm, swapped in for the
  last 0.15-1.0 s or the whole run, approach from above or none, selfFirst. Best contact (all fingers <= +3 mm at t 0)
  came with Truth 0 at t 0 but the seal folded away from the camera (the shot's reveal lost), and at t 1 her view always
  showed Truth (245-5800 px). The fistful is a 6 cm vertical strip of pinned pleat under the neckline: a hand round it
  either crosses the strip or moves it, and the fold over Truth is decided right there. Next idea (not tried): fewer
  pinned rows (a 2-row pinch) with a thumb-and-fingers pinch from above (paperEdge-style), re-tuning the pleat's
  stiffness so it stays shut without the 9 cm of pins.
- Hold check (holdcheck.mjs media/layout/mortongrove07): MG1, MG1_end, MG_wide, REF_plan pass (fingers 0, palm 2.3 mm);
  MG2 / MG2_end are soft bodies (the hull test is meaningless; cloth_contact above is the measure).
- Clip check (clipcheck.mjs): every shot FAILs on the same pre-existing items as HEAD (checked on a git-archive copy of
  HEAD): jade27 into the floral couch 82 mm cloth / 40 mm skin (HEAD 85 / 33: she sinks into the seat cushion), mesh
  soles into the carpet 14.9 mm (HEAD 30; engine), the cork sandals 14 mm, the rug 6 mm; the cloth hoodie is an open
  sheet, so its "inside" depths (hundreds of mm) are meaningless. Nothing new from this round. Seat height not changed:
  her lap colliders shape the drape (Truth).
- Wrist warnings unchanged from HEAD (MG2 L/R, MG2_end L, his R +4 deg in MG1/MG_wide).

### done (16:35)
- Horse: layout/assets/art/mortongrove07/mg_picture.png is the r4 image mirrored (gallops LEFT in the renders, checked
  in MG_wide_lit), the old calligraphy and seal painted out, one vermilion seal (Codex, proof-mg, $0) at the upper
  right. Saved as RGB (a 256-colour palette turned the vermilion brown). Notes in mg_picture.txt.
- Final three-pass re-render of every shot after the art; MG_wide_lit mean luminance 49.6 -> 75.4 (median 36 -> 63),
  the mirror's area 45 -> 98; MG2/MG2_end lit 49 -> 64, MG1 68 -> 82, REF_north 70.5 -> 91.8.
- Question for Jade (proposed card): the ceiling's high side 5.1 m (built) vs 6.0 m vs 5.2 m with a flat dining jog.
