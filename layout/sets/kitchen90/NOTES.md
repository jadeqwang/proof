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

## 2026-11-26 round 4 — PROGRESS (checkpoint, written by the basement90+kitchen90 agent)
- DONE: k_fittings confirmed by Jade: honey oak and almond, as built (no change).
- IN PROGRESS (a delegated subagent): props phase 2 (kettle, rice cooker models), body-vs-body / eye checks with
  layout/sets/basement90/check_bodies.mjs --set kitchen90, re-render, holdcheck, REPAINT_LIST kitchen90 section. Its own
  dated section in this file records its measurements when done.

## 2026-11-26: round-4 decisions

Jade (k_fittings): "The Decatur kitchen: cabinets and fittings? Honey oak and almond, as built." CONFIRMED: the r4
kitchen (honey-oak face-frame cabinets, almond laminate / tile / appliances, stainless sink, chrome faucet) is no longer
an invention; no change to the fittings. The counter items are still invented (Jade did not rule on them).

**Props phase 2 (kitchen.js).** The hand-built kettle and rice cooker are now the downloaded models (`loadProps` at the
module top, `prop()`; the hand-built shapes stay as the fallback if a model fails to load):
- `kettle` ("Teapot" by 19brian16, CC BY 4.0): 0.21 x 0.24 x 0.19 m, red enamel body (props.json default), black handle
  and lid knob, on the back-left burner. Base measured from the GLB (origin = lowest vertex, the rubber foot ring at
  y 0) and set on the coil tops (coil torus centre STOVE.h + 0.012, tube r 0.005 -> STOVE.h + 0.017): no float, no sinking.
- `rice_cooker` ("Rice Cooker Lowpoly" by ononesupplies, CC BY 4.0): 0.24 x 0.26 x 0.25 m, white, switch toward the room,
  base (y 0) on the counter top (COUNTER.h = laminate top). Clears the canisters (2.9 cm) and the drainboard (4.8 cm).
- No hand holds or touches either, so no grip to re-stage. Kept hand-built (per work/props_audit.md): canisters, sink,
  faucet, cabinets, dish rack and dishes. Credits: docs/credits_tools.md (both lines now say "In kitchen90").

**Bodies and eyes** (`node layout/sets/basement90/check_bodies.mjs --set kitchen90`: three-mesh-bvh triangle pairs between
figures, figure vs set objects, per-eye vergence). Before -> after:
| shots | before | after |
|---|---|---|
| NIGHT (K0_wide_night, K1_question, K1_question_end, K1_question_wide, K2_taps, K3_understood): dad vs mama90 | 1783 intersecting pairs, deepest 119 mm (his face in her hair, his body through her hanging right arm, his left hand in her back) | 0, clearance 8 mm |
| THUMBS (K0_plan, K0_wide_day, K5_thumbs, K6_mother): jade7 vs mama90 | 1865 pairs, deepest 33 mm (fingers up the sides of her face into her hair, thumbs into the cheeks) | 0, clearance 3 mm |
| Dad's eyes (NIGHT) | 0.086 m (on her ear: cross-eyed) | 0.69 m (her hand on the chair back) |
| Jade's eyes K1 / K1_end | 0.233 m (pencil tip) | 0.311 m (the next printed row) |
| Jade + Mama eyes, THUMBS | 0.263 / 0.265 m | 0.313 / 0.316 m |
| Mama's hand vs Jade's chair rail (NIGHT) | 134 pairs, 5.9 mm | 0 (1.8 mm clear) |
| Mama's feet vs floor (THUMBS, seated) | 30 mm | 3.7 mm |
All other eye targets were already 0.5-1.6 m; every eye pair meets its target (0 mm miss). K7-K10: 0 body pairs before and after.
- **The whisper, re-staged (shots.js `DAD`, `MAMA_R`).** Dad stands behind her right shoulder (-0.79, -1.13), yaw 44, bend 18,
  leaning in over the shoulder: his mouth is 15 cm from her ear POINT, i.e. at the surface of her hair (8 mm clear); a
  closer mouth is inside her hair. His cupped right hand is gone (from behind her shoulder it went through it): it hangs.
  His left hand is at the small of her back (on it, not in it). His eyes look down past her at her hands on the chair back.
  Mama: both hands now on the child's chair back (her right hung into Dad). The cast agent's new perm may change her
  hair volume: re-run the check after it lands.
- **The thumbs, re-staged (`TH`).** Thumb tips 1 cm off the cheek toward Mama, palms toward the sides of her face, fingers
  wrapped DOWN and back under her jaw toward her neck (they were up along her face into her hair). Mama's bend 20 -> 12
  for the 0.31 m face-to-face distance. Looked at in K5 (lit): thumbs on the cheeks beside the mouth corners, face clear.
- **Jade's eyes in K1:** now on the printed row 10 cm beyond the pencil (`READ_AT`), not the pencil tip.
- Tapping hands (`TY`) 1.5 cm higher (fingertips were 15 mm into the table top).
- NOT FIXED (flags): (1) her forearms still cross the table's front edge 15 mm below the top in every NIGHT shot and K1:
  at a 0.74 m table on a 0.45 m seat a 7-year-old's elbows are 3 cm below the top. A 5 cm seat cushion was tried and
  measured: elbows +4 cm but the forearm still grazes the edge (and it is an invented prop), so it was taken out. Needs a
  higher seat (a booster / phone book / kneeling): question for Jade. (2) Feet vs floor: standing Jade 12 mm, seated Jade
  26 mm, standing Mama 16 mm, Dad 4 mm into the linoleum: the mesh feet's soles (engine / bodies, not staging).
  (3) Seated bodies rest 14-15 mm into the seat (soft tissue; within "may rest on a seat").
  (4) K4_writes: check_bodies.mjs never finishes on this shot (killed after 3-20 min, 3 tries); its figures are the old
  far-apart WRITE staging (parents 1.16 m apart), unchanged.
- Flag: the `kettle` model's base reads a little like a cordless electric kettle's ring base (a stub at the back). The
  painters should be told "stovetop kettle" (REPAINT_LIST says so).
- Re-rendered 2026-11-26 (default modes + form/contour/light + beam masks); `layout/engine/holdcheck.mjs
  media/layout/kitchen90`: all 6 holds pass (K1, K1_end, K4: pencil + workbook / sheet). Looked at: K1_question,
  K1_question_end (form crop: the whisper reads, heads clear), K0_wide_night, K5_thumbs (face clear, thumbs on the
  cheeks), K6_mother, K0_wide_day, K7-K10 (K10 has the kettle in frame, sitting on the coils).
- CHECKPOINT UPDATE: the subagent finished (see its dated section above). LEFT: K4_writes is unmeasured
  (check_bodies.mjs hangs on it, probably the ray-parity depth pass; its parents stand 1.16 m apart).

## 2026-11-26: round-5 decisions (kitchen-basement agent)

Jade (k_booster): "How does little Jade reach the kitchen table? Something else — sitting on one foot, other foot dangling".
- Age: the brief said "~3-4"; the cast and every kitchen90 shot use `jade7` (little Jade, 7, 1.22 m). Kept jade7 (flag).
- **Staged (shots.js `FOLD`, `jadeAtTable`):** she sits on her LEFT foot (side assumed, flag): legs 'kneel' (both feet
  point back), pelvis set directly at 0.618 m (was seatHip 0.517: +10 cm, the folded shin and foot under her), left ankle
  overridden to lie on the seat under her (0.518 m up, 1 cm ahead of the hip), knee pole forward-down so the shin's front
  lies on the seat (calf up, as in seiza); right leg hangs off the seat front, knee 4 cm past the edge, the shin swung back
  ~30 deg, the toes pointing down-back (about 39 deg of plantar flexion: in range). Her hip moved 4 cm forward on the seat
  (z -0.23) so the dangling calf clears the seat's front edge.
- Measured (check_bodies.mjs --parts): Jade vs table 0 pairs (clearance 0.3-0.6 mm) in K0_wide_night, K1_question, K4;
  vs chair 0 mm deep (her right thigh just touches the front edge: contact); no other body contact. The 15 mm forearms
  into the table are gone. Left hands (`restL` `lift`, `curl`): K1 1.7 cm up, fingers curled 10/13/7 deg (pads on the page:
  holdcheck contact 0 mm, pass); K4 1.6 cm up, curl 12/16/9 (1.9 mm above the sheet, 0.6 mm above the table). Tapping hands `TY` +0.04 -> +0.052.
- New set-reference shot `K0_seat_side` (from her left at seat height) shows the folded leg and the dangling foot.
- Engine request (not made): a per-leg foot direction in legOpts (footL / footR) so a dangling foot can point forward
  while the folded one points back; today both legs share the preset's foot direction.
- **The whisper (K1, HANDOFF fix 2).** Dad round to her right side (at -0.92, -0.97, yaw 62, bend 29), head turned in
  past her ear (look [0, 1.38, -0.68], 0.70 m away: eyes converge, not crossed), chin a little up (nod -10), head tipped
  away from her (tilt -20) so the mouth leads rather than his brow; Mama tips her head toward him (tilt -6 -> +12). Found
  by a scratch sweep (Dad position / yaw / bend / head, Mama tilt) measuring the gap and three-mesh-bvh overlap at each
  step. Sidecar `whisper.gap_m` 0.149 -> **0.059** (her hair over the ear is 3-4 cm thick, measured by ray from the ear
  point); dad vs mama90 **0 intersecting pairs, clearance 2.6 mm** (his cheek to her hair). Any closer and his face
  enters her hair (bend 30: 265-1231 pairs). His left hand stays at the small of her back, right hand hangs.
  check_bodies prints "deepest 94.8 mm" for dad-in-mama with 0 crossing pairs: a ray-parity artifact of her open hair
  shell (now labelled as such in the output), not an overlap.
- **Heads in frame:** K1_question_end (dad 988,304 / mama 1214,366), K1_question_wide, K0_wide_night, K3_understood: both
  heads in frame. K1_question is the tilt START, whose intent keeps the heads above the top edge: with Dad lower, Mama's
  face had entered the top edge, so its aim moved 0.42 -> 0.28 (heads at y -212 / -146, as intended; the "heads above the
  frame" the lead saw were this shot's sidecar).
- **Checks (all 16 shots, 3 passes + masks re-rendered):** check_bodies.mjs PASS on every shot (bodies 0 pairs; eyes all
  converge; K4_writes now measured: parents > 5 cm apart, Jade vs table 0.6 mm clear); clipcheck: all night / homework
  shots pass (Jade 1.2 mm into the pencil = the pinch); holdcheck 8 / 8 pass. Pre-existing, NOT fixed (not in my brief):
  Mama's thumbs wrists in the day shots (K0_plan, K0_wide_day, K5, K6) are 63 deg past extension, 85 ulnar, 32
  supination; her seated thighs 14.7 mm into the pulled-out chair (soft tissue / cloth).
- Looked at: K1_question, K1_question_end (form: the whisper reads, his mouth at her ear, his face half hidden),
  K0_seat_side, K0_wide_night.

## 2026-11-26: post-sweep brightness pass
Per-shot lit lift `shot.litLift = { key, amb }` (shot.light is 'day'/'night' here), build.js rig, lit pass only. Lit mean
before -> after: K8_glass 22.0 -> 42.2, K0_wide_night 27.6 -> 40.7, K0_plan 28.1 -> 41.9, K0_seat_side 29.5 -> 41.9,
K1_question_end 31.2 -> 40.1, K7_turns 33.4 -> 41.3. Night shots still read as night: the dark purple fill is lifted, the
pendant's cone stays the brightest thing.

## 2026-11-26: round-6 decisions (kitchen agent)
Jade (k_fold_side): "Which foot are you sitting on? Doesn't matter — go google image search for some pictures of what it
looks like when a person sits with a foot under their butt and fix it until it resembles what you see".
- Side kept: her LEFT foot under her, right leg dangling (Jade: doesn't matter).
- References found (look-only, kept in the session scratchpad, not in the repo): an iStock side-view illustration of a
  woman at a desk sitting on one folded leg (iStock 1495546683 / 1495634969, "half-crossed posture"), and theballetblog's
  "foot sitter" photo (a woman on a bentwood chair, one foot under her, the other on the floor). What they show: the
  bottom rests ON the folded foot (the foot lies sole-up under / just behind the buttock); the folded thigh lies along
  the seat, knee forward and a little out at the seat front; the hips are raised by the foot's thickness, the tucked
  side a little higher; the other leg hangs straight down off the seat front.
- What was wrong in r5: her bottom sat ~20 cm in FRONT of the foot (perched on the seat's front edge, thigh steep, the
  foot sticking out behind her on the seat like a crouch).
- Re-staged (shots.js FOLD / jadeAtTable): hip back to z -0.29 (was -0.23), y 0.625 (+11 cm over seatHip: the rigged
  mesh's folded shin and foot need that; at +8 cm they were 13-15 mm into the seat); left ankle on the seat 2 cm ahead
  of the hip joint, footL toes back (sole up), knee pole forward and out; roll -3 (tucked hip higher), spine side +1;
  right leg hangs straight down (ankleR 26 cm up, 26 cm forward of the hip), footR relaxed toes forward-down, sole 17 cm
  off the floor. Homework / writing poses lean in more (bend 16 -> 26) so the hands still reach the page with the
  wrists in range (with bend 16 the right wrist was 11-19 deg past radial deviation).
- Checks (all shots, three passes + masks): check_bodies PASS everywhere; Jade vs her chair 0 intersecting pairs
  (contact, 0.1 mm), vs table 0-0.2 mm (fingertips on the top). clipcheck: every night shot passes (Jade 1.2 mm into
  the pencil = the pinch); the day-shot FAILs are the pre-existing Mama thumbs wrists / 14.7 mm cloth into her chair
  (not this change). holdcheck 8/8 pass.
- Engine: none changed (legOpts footL / footR already existed).
- (r6 follow-up, lead: "she hunches too much; she sits on her foot to be taller") instead of leaning her in, the night
  family block moves 5 cm toward the table (shots.js DZ / JADE_CHAIR): her chair (a `chairs` override in the 8 shots
  she sits in; the day shots keep CHAIRS.jade), she, Dad, Mama and Mama's hands on the chair back, and the
  K0_seat_side camera. Seat front 4 cm under the table edge, belly ~3 cm from it (by eye; at 8 cm her torso touched
  the edge, 0.4-1.7 mm). Lean 26 -> 12 deg for homework, 18 while writing (16 put the pencil wrist 1 deg past radial
  deviation). Re-checked: check_bodies PASS on all shots (Jade vs chair/table 0 pairs); clipcheck night shots pass,
  the day FAILs are still the old Mama ones; holdcheck 8/8; no Jade wrist warnings.
- (r6 arms, Jade: "her elbow is in an unnatural position for doing homework ... the elbow rests on the table, or her
  wrist rests on the table and the elbow hangs naturally in a low energy position") references: four Pexels photos of
  children doing homework at a table (look-only, session scratchpad sitfoot/hw/). What they show: both forearms lie on
  the table, the elbows at or just past the edge, shoulders down, upper arms nearly vertical; the writing hand rests on
  its little-finger side, the pencil leaning back toward the shoulder; the other hand flat on the page holding it.
  Before: the elbows were flared up and out (the left arm's pole pointed UP and out), the forearms 2-4.5 cm above the
  table. Now (shots.js ARM): elbow poles down and a little out; both forearms on the table top (gap -0.8..+3.6 mm, by
  a scratch mesh measurement); night hands palm down-in, fingers a little raised so the tips stay out of the wood
  (they were 12 mm in); writing hand rolled onto its little-finger side (penPalm), its index tip 4 cm over the page
  (2.4 cm put the little finger 5-12 mm into the page / table), ring and little fingers less curled so the pencil
  clears them. Lean from the hips: 12 deg at rest (night; was 6), 23 writing homework (K0_seat_side, K1, K1_end),
  24 writing the sheet (K4): at 15 the writing forearm floated 1-3 cm. build.js: PENCIL_FIT az null keeps the
  hand-frame pencil lean (back over the web of the thumb); the fixed az 310 made it point away from her once the
  hand rolled. Checks: check_bodies PASS (Jade vs table: sleeve contact 0-0.8 mm, skin 0), holdcheck 8/8, no Jade
  wrist warnings.
