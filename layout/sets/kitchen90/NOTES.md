# kitchen90 — Decatur kitchen, 1990 (the question 2:21-2:26, "it was correct" 2:26, outro 4:05-4:24)

One room, two light states (`shot.light`): `night` = pendant over the table, `day` = sun through the window over the
sink. Shares plan coordinates and cast with `basement90` (`../basement90/house.js`, helpers in `../basement90/kit.js`).

Render: `node layout/render.mjs --set kitchen90` -> `media/layout/kitchen90/` (sheets: `_sheet_<mode>.jpg`).

## Assumptions (the plan leaves these open)
- Eat-in kitchen 3.6 x 4.2 m, 2.44 m ceiling. Back wall: counter, sink, double-hung window (1.1 x 1.0 m, sill 1.07),
  stove, fridge. Left wall: door to the basement stair. Right wall: china cabinet, open doorway to the hall.
- The plan names no beam for the kitchen. Night scene: a pendant lamp over the table; the shade rim (y 1.5) is the
  cut-off, so the standing parents' heads are out of the light and her face and hands are in it.
- Outro is daytime in the same kitchen, child still about 7 (`jade7`); the plan lists place and age as open.
- The reflecting glass is the china cabinet's glazed doors (plane x = 1.4, glass y 0.86-1.84): a dark interior behind
  glass reflects in daylight, a window does not. It is 0.85 m to the child's right.
- Outro blocking: Mother sits in the right-end table chair, pulled out onto the open floor facing the room; the child
  stands between her knees facing her (and the window). Mother then walks to the hall doorway, passing behind the child.
- Sun: travels along (0.32, -0.42, 1) normalised, elevation 21.8 deg. The shaft crosses Mother's chair and the
  child's body and lands on the floor from z 0.45. Its top edge is at the child's chin (1.10 m at her position): her
  face is just above the light and looks down into it; Mother's seated face is inside it. Change `SUN` to move it.
- `MOTE` = (0.42, 1.16, -0.55): anchor for the mote she follows, inside the shaft at her eye height, 0.8 m ahead.
- Three chairs at the table (no chair on the camera side).

## The beams (for the mask)
- Night: `BEAM_NIGHT` cone from the bulb (apex y 1.6), straight down, half-angle 63.4 deg, cut off above y 1.5.
  Sidecar `beam`: apex, radius on table and floor, `heads_in_cone` per figure.
- Day: `BEAM_DAY` parallel shaft = window opening extruded along `SUN.dir` (`shaftAt(z)`, `inShaft(p)`, `sunHit(p)`).
  Sidecar `beam`: window corners, end corners, section at the child, mote px, `heads_in_shaft`.
- Lit mode shows the volume; label mode outlines shaft edges, floor patch, shade rim, and marks the mote.

## Known limits
- K8 reflection is a true mirror render (engine mirror compositing). Sidecar `mirror.reflected_faces`: both the
  child's reflected face falls inside the glass and in frame; Mother's reflection is in the glass as a passing back (her head is above the top of frame at this lens). A real cabinet would also show dishes through the glass.
- K5: Mother's hands are mitts and her left hand's orientation is not controllable (engine left-hand basis), so
  "thumbs on the cheeks" is placement only: palms at the jaw, 7 cm either side of the mouth.
- K2/K4/K5/K6 are POV inserts with the viewer's head hidden.
- No lettering on the paper; its quad is `panes.paper`.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. `K5_thumbs`: Mother's left hand is now the mirror of her right (`palm` / `fingers` / `thumb` mirrored in x). Looked at after the change: both hands are at the child's jaw, symmetric; the two thumbs meet under the mouth rather than sitting high on the cheeks (the right hand's own staging, unchanged).
- **Cast.** `jade7`, `dad`, `mama90` come from `../_cast.js` through `../basement90/house.js`; Dad is 1.72 m (was 1.75).
- **Times.** K5-K10 follow `analysis/v3/song_map.md`: K5 4:05.0-4:09.0, K6 4:09.0-4:13.0, K7 4:13.0-4:15.5, K8 4:15.5-4:19.3, K9 4:19.3-4:21.3, K10 4:21.3-4:23.3. Labels only. Note for the edit: in v3 outro line 1 starts at 4:03.5, 1.5 s BEFORE the band cuts.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set kitchen90 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/kitchen90_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (day: the window opening swept along SUN.dir; night: the pendant's cone below the shade rim, and under the table top only what falls outside it), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: both states are good in the plan, the wides, K1, K3, K5-K10. `K2_taps`, `K4_writes` are white over the whole frame (her view of the table top under the lamp). `K8_glass`: the mask is of the direct light only (no reflection in the cabinet glass).

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- The question K1-K3 2:22.2-2:25.2 (after the basement's cat beat; the interlude starts 2:25.2). K4_writes 2:25.2-2:27.6,
  the interlude's first bar: -2sm has only the thinned interlude (2:25.2-2:34.5; v3's full half 2:36-2:45 is gone), and the
  plan's merged interlude row follows the writing with the market walk-away (2:27.6-2:30.0) and the spiral plates to 2:34.5.
- Outro: K5 3:55.0 (the cliff)-3:59.1, K6 -4:03.6, K7 -4:05.5, K8 -4:08.6, K9 -4:10.7, K10 -4:12.9 (pad swell).

## r3: K1 is a tilt up, 2026-11-25 (night; Jade's r2 note)

Jade: "camera should pan up from her face and up so that it's mostly her parents and then to her mom, and then it
should look like an illustration in a science textbook where there's a caption for the image, which has 'Did she
understand or just pattern match?'"

- `K1_question` is now the tilt START: same camera position as before ([-0.7, 1.0, 2.0]), lens 60 (was 28), her eyes
  at (0.5, 0.42): her face and hands, the parents cut at the neck (Mama's chin just in the top-right corner).
- `K1_question_end` (new) = tilt END from the same position and lens: aim Mama's eyes at (0.68, 0.36): mostly the two
  parents, Mama right of centre, Dad at the left edge, the child's head at the bottom edge. A pure pan/tilt (no move,
  no zoom). The keyframe is painted as a science-textbook figure; the caption is laid on in code (no lettering in the
  paint). Page guides with the figure frame and caption band: `media/keyframes/r3/kitchen90/_guides/` (frame
  230,60-1690,881 of 1920x1080; band below it blank).
- `K1_question_wide` = the old r2 K1 camera, kept as a reference (not in the cut).
- Both K1 frames share 2:22.2-2:23.7. Re-rendered: all default modes, form/contour/light, beam masks, sidecars.
- K2_taps, K3_understood, K4_writes: Jade replaced them with the artichoke growth footage (1:22-2:08 of
  `media/footage/artichoke/out/artichoke_growth_preview.mp4`); the cameras stay for reference, not painted in r3.

## Stair door moved, 2026-11-26 (basement re-laid out from Jade's diagram; see ../basement90/NOTES.md)

`HOUSE.stairDoor` z 1.05..1.85 -> 0.5..1.25 (0.75 m): the basement stair now runs along the front wall, so the door
opens onto a landing behind the flight. Re-rendered; visibly changed: K0_plan, K0_wide_night, K8_glass (reflected door
edge behind Mama). Not modelled: the stairwell opening under this room's front-left corner (x -1.8..-0.6, z 1.3..2.1).

## 2026-11-26: r4 set fixes (Jade's r3 notes on K1)

Jade: K1_question "have mom and dad closer, and dad is whispering into mom's ear, camera pans up from her doing homework
to them talking; also stage all the kitchen counter items and cabinetry explicitly so they don't hop around between
clips"; K1_question_end "have dad whispering into her ear, also stage all the kitchen counter items explicitly".

- **The whisper (`NIGHT`, shots.js `dadWhisper` / `mamaListen`).** The parents stand close together behind her chair
  (pelvises 0.33 m apart; were 1.16 m apart, facing each other). Mama at (-0.5, -0.88), turned 18 deg toward Dad, head
  tilted a little toward him, eyes down on the child: listening. Her left hand rests on the child's chair back. Dad at
  (-0.83, -0.96) on her right (screen left), bent 14 deg, his mouth 5.8 cm from her right ear (sidecar `whisper`,
  `gap_m`), his right hand (camera side) cupped beside his mouth, his left at the small of her back. `NIGHT` is used by
  K0_wide_night, K1_question_wide, K2_taps, K3_understood, so those guides show the whisper too.
- **Homework (`HOMEWORK`, K1 only).** She writes in an open workbook, pencil in her right hand on the right-hand page
  (centred on `PAPER.c`), left hand flat on the other page, head down. Workbook (blue softcover, printed rows) and a pink
  eraser are INVENTED (Jade said only "homework"). K1_question_end aim moved from Mama's eyes at u 0.68 to 0.62, so both
  heads sit in the frame; still a pure pan/tilt from the same position and lens.
- **The kitchen, modelled explicitly (`kitchen.js`, new).** All INVENTED, a c.1990 Decatur builder kitchen (propose as a
  question): honey-oak face-frame cabinets with raised-panel doors, antique-brass wire pulls, visible hinges, dark toe
  kick; almond laminate counter with a 4 in lip; almond 4 1/4 in tile backsplash (grout lines modelled) to the uppers,
  under the window to the sill, behind the range to the hood; stainless double-bowl sink (0.84 m, under the window) with
  a single-lever chrome faucet and side spray; almond electric range (coil burners on chrome drip pans, backguard with
  clock and 4 knobs, oven window, handle, storage drawer) with an almond hood and a short cabinet above; almond
  top-freezer refrigerator (handles left, hinges right, toe grille) with a cabinet above. Base bays left to right:
  4-drawer bank, drawer-over-door, sink base (2 false fronts, 2 doors), filler. Uppers: 2 doors left of the window,
  2 over the range (was a full-height box at 0.46 m over the burners), 2 over the fridge.
- **Counter items, fixed (`ITEMS`), all INVENTED:** three brown stoneware canisters with oak lids (left corner); a
  white rice cooker; a white wire dish rack on an almond drainboard with three plates, an upturned rice bowl and two
  glasses (left of the sink); paper towels on an oak holder under the left upper cabinet; a green dish-soap bottle and a
  yellow sponge right of the sink; a red enamel kettle on the back-left burner. The window sill is empty on purpose.
  Not here: anything on the walls or fridge door (clock, calendar, phone, magnets): the background-art agent's.
- Sources: general knowledge of 1985-92 US builder kitchens (no web images used).
- `house.js` not touched.

## 2026-11-26: hold pass

Hands that hold or rest on something are now checked by `engine/holdcheck.mjs` (arm `grasp` / `object`) and pass in
both `--body mannequin` and `PROOF_BODY=mesh` (K1_question, K1_question_end, K4_writes; no other kitchen90 hand holds an
object: K2 taps on the bare table, K5/K6 thumbs on her cheeks, Mama's hand on the chair back are not holds).
- **The pencil is the held object** (shots.js `pencilArm`, `grasp: 'pinch'`, `object: 'pencil'`). Her right hand sits
  on its little-finger side, fingers toward her middle (`palm [0.55, -0.8, 0.1]`, `fingers [1.2, -0.6, 1]`), which keeps
  the wrist in range (was ulnar deviation 46 deg); the index tip is 2.4 cm over the page; middle / ring / little curled.
- **Pencil placement (build.js):** `shot.pencilFit` (shots.js `PENCIL_FIT = { el: 45, az: 310, s: -0.0015, s2: -0.007 }`)
  gives the pencil's lean (45 deg up, toward her right and a little away) and where it crosses the pinch. It was fitted
  with the Rapier check: a pencil only squeezed between two pads slides out (the engine's thumb gap saturates at ~3.6 mm
  between the pad surfaces, so a 7 mm pencil between them is 3+ mm "inside" them); in the fitted pose the index pad, the
  thumb pad and the web carry it. Its tip (capsule end) now touches the page / sheet top (was at the sheet's mid-plane).
- **Left hands (grasp `restOn`, flat, rolled 8 deg onto the little-finger side so the thumb's ball does not press through
  the sheet; `elbowAt [-0.35, 0.9, -0.12]` lifts the elbow a little out to the side so the forearm comes down onto the
  paper instead of through the table edge).** K4: on the sheet's left edge (sheet checked: rests on the table). K1: on
  the NEAR EDGE of the left page, heel of the hand and wrist on the table in front of the book (flag: was "flat on the
  other page"; the mannequin's and the rigged mesh's wrists sit 5-9 mm below the palm, so a palm in mid-page put the
  wrist into the book).
- **Workbook (build.js, INVENTED as before):** now a thin softcover opened flat: 1 mm cover, 2 mm of pages a side, no
  page tilt (was 4 + 4 mm with the pages tipped 1.7 deg, so the printed rows floated / sank), and 4 cm further from her
  (its near edge cleared her right forearm). Page top = TABLE.h + 3 mm.
- K1 spine bend 14 -> 16 (as K4). Note (not fixed, staging): at this 0.74 m table her forearms cross the table's front
  edge below the top in the NIGHT shots (a 7-year-old on a plain chair); a booster cushion or a lower chair hip would fix
  it everywhere (question for Jade?).
- **Round 2 (engine: exact thumb.gap, ball chains, support prisms).** PENCIL_GAP = 7 mm - 2 mm (the pinch now opens to
  exactly the gap: 1 mm squeeze a side). K4 left hand target raised 3 mm (palm was 5.2 mm into the sheet). K1 / K1_end:
  pencil and workbook PASS in mannequin and mesh. K4 pencil passes in mannequin, but in mesh it slides 40 cm. K4 sheet FAILs, sliding 1.2-1.4 cm, only
  because the pencil, a static support in the check, shoves it. Without the pencil as a support it holds at 0.1 cm.
  Support prisms are extruded "away from the object centroid", which for the pencil tip points into the sheet.
