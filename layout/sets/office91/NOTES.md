# office91 — notes and assumptions

## 2026-11-26: r4 set fixes (from Jade's r3 review; work/decisions/R4_SET_BRIEF.md) — newest first

- **Who did what.** Set agent (this section): the table, PC2's camera, BO1/BO2's finger, PC5 clean-up, REF_table.
  Background-art agent (not this section): every picture on the walls, the alphabet strip, the clock face, the shelf
  items (layout/assets/art/office91/, art.js, the `ART` / `HALL_ART` image names in layout.js, `picture()` /
  `wallArt()` in build.js).
- **The meeting table** (`schoolTable()` in build.js, constants `TBL`; replaces the generic `tableRect`): a US school
  activity table of about 1991 (the Virco / Krueger kind; from memory of the type, no web photos used): 1-1/8" (29 mm)
  particleboard top faced with almond woodgrain laminate (lit colour #d9caa6), corners eased to a 25 mm radius, wrapped
  in a dark brown vinyl T-mould edge band; a 75 mm steel channel apron set 45 mm in from the edge, almond enamel; four
  height-adjustable legs: 32 mm square almond upper tube with a row of adjustment holes, a collar, a 23 mm chrome
  round insert, a black nylon glide; a steel bracket across each apron corner. Footprint and top height unchanged
  (1.40 x 0.65 m, top at 0.72 m), so nothing staged on it moves. See `REF_table` (new reference view, not a shot).
  The colour follows the pale almond top the painter gave PC1 (Good). ASSUMED: almond laminate + brown edge; flag if
  Jade remembers a different table (grey laminate, wood).
- **PC2** (Jade: "the table is a very wrong shape b/c it's not on screen"): the camera rose to a standing adult's eye
  height (1.75 m; el -2 -> 10) and widened (35 -> 30 mm), parents at u 0.5 / v 0.3: the table top, its banded edge and
  its +x end corner now run across the lower third under Mom's hands, so its shape is in frame. Little Jade and the
  handout's corner sit frame-left; the social worker is out of frame.
- **BO1 / BO2: her fingertip on the gap** (Jade: "the center/top of the fingertip should be on the spot where there
  isn't a dot. pretend there's an invisible dot in that space"). `JADE_TIP` = `GAP` (the centre of the missing seventh
  face). Her right hand now uses the engine's `tip` placement (`tip: { finger: 'index', at: JADE_TIP, off: [0, 5.4 mm, 0] }`):
  the index fingertip's centre sits one child pad radius above the page, so the PAD touches the page exactly on the
  gap; checked with a marker at the gap (it sits under the top/centre of the fingertip in the BO1 camera). She looks
  at the gap (`head.look: 'gap'`; real eye aim comes with the gaze module). The adult's finger (`SW_TIP`, ANXIOUS) is
  unchanged. Repaint note: the painter must keep the fingertip over `handout.gap_px` (in BO1.json / BO2.json), not
  above it on the paper.
- **PC5** dropped (removed from shots.js by the lead); its stale guides deleted from media/layout/office91/ (the r3
  snapshot in media/keyframes/r3/_layout_snapshot/office91/ keeps them for the r3 page).
- **X_sw caption** (Jade, r3 review): "Were you afraid during the raid?" (comp handles captions; AD_trace carries it
  over).
- **FE_thumbs** shows the same textured corridor art as FE_out now that the art agent's pictures are in the model.

## r3 changes (2026-11-25/26 overnight, from Jade's r2 review) — newest first; supersedes anything below

- **Painted**: all shots in `media/keyframes/r3/office91/` (see its NOTES.md); guides re-rendered (default, beam masks,
  form/contour/light). Open for Jade: BO2's note is cut off ("this part should be paired with ..."); is the corridor at
  ten a later visit, or should the whole office be age ten (same visit)?

- **Handout.** The row of six now sits a quarter cell LEFT of centre as she reads (`HANDOUT.shortShift = 0.25`; the
  missing width is 0.25 cell at the start of the row, 0.75 at its end). The row carries some of the larger-looking faces:
  SCARED, WORRIED, EXCITED, GUILTY, UPSET, ANXIOUS (SCARED, EXCITED, UPSET have marks outside the circle; they swapped
  places with CALM, NERVOUS, THANKFUL). Ported to `tools/kf/handout.py` (LABELS, SHORT_SHIFT).
- **Her finger points at the EMPTY SPACE** (`JADE_TIP` = the gap, where a seventh face would be), not at a face: this
  reverses the earlier JADE_TIP choice. In BO2 the adult's finger lands on the CLOSEST face to that space (ANXIOUS,
  `SW_TIP`) and reads it. Jade's BO2 note ends "this part should be paired with" (cut off): open question.
- **Back wall art** (one wall, `ALPHA`, `BOARD`, `ART` in layout.js): an Aa-Zz alphabet strip at 1.40-1.55 m across the
  whole back wall, three handprint turkeys upper left, a cork board with a red scalloped border frame-right of her head
  with turkeys and crayon drawings, two more pictures beyond it. The poster is gone. A patch frame-left of her face
  (x < -0.72, y 0.78-1.22) stays bare for the toner labels. Seen in PC1 = PC4 and PC2.
- **Dad stands** behind Mom's chair in every shot (`SEATS.dad` [0.62, -1.04]); left hand on her left shoulder, palm
  down (his watch on the back of that wrist, face up), right hand open, palm up, toward the social worker. His chair is
  pushed in empty at the table's end. PC2 is now a two-shot of the parents (Mom seated, listening; Dad mid-explanation)
  from past the table's end on the social worker's side.
- **PC3 split** into `PC3a` (pan start, the sweatshirt) and `PC3b` (pan end, the sheet): one camera position at her
  eyes, a tilt down with a little pan left. `PC3` no longer exists.
- **PC5**: closer (0.55 m, from between her and Mom), Mom's hands restaged: left hand palm up under the spine, right
  hand under the right cover with the thumb over the fore-edge.
- **The corridor (a SEPARATE TIME, about 1993-94, her at TEN)**: `HALL*` in layout.js, `corridor()` in build.js:
  the corridor outside the counselor's door (this room's left wall from outside: the door, a nameplate, a board of
  class art), one ceiling panel. New shots `FE_out` ("You need facial expressions", whispered, -2sm 8.76-10.51) and
  `FE_thumbs` ("But not like that", 18.23-18.94), replacing the attic's AD_out / AD_thumbs restaging. Cast: `jade10`,
  `mama91`. This set is 1991 with her at seven, so the corridor is a later visit: ASK JADE whether the office itself
  should be age ten (the poem's cheek-pushing answers the social worker's "She doesn't make much facial expression",
  which would make it the same visit). Plan rows to change (not edited here): 0:04.9-0:18.2 (whisper 1 at 0:08.8) and
  0:18.2-0:19.0 (whisper 2).


Set for the "groove in" handout shot (0:19-0:30), the pre-chorus (1:18-1:34) and the band-out (1:34-1:37).
Numbers live in `layout.js`.

## Assumptions (the plan leaves these open)
- **Room**: a small counselling office in a US elementary school, 3.6 x 3.5 m, drop ceiling at 2.6 m. Meeting table
  1.4 x 0.65 x 0.72 m. Filing cabinet, low bookshelf, the social worker's desk, a window with the blinds shut (not a
  light source), a closed door. The back wall behind her is bare on the frame-left side.
- **Beam**: one working 4 ft tube in a recessed two-lamp troffer (the other lamp is dead), behind a louvre that cuts
  the light at 22 deg across the tube and 12 deg past its ends. The lit volume is a wedge; at table height it is
  1.98 x 1.52 m, centred on the handout. `BEAM_SOURCE`, `CUT`, `beamFootprint(y)`, `inBeam(p)` define it; each
  sidecar carries `beam`. The preview rig approximates the wedge with three spots, so its pool has rounded ends.
- **Seating**: little Jade at the long side facing the cameras; the social worker across from her but offset
  diagonally (so the frontal camera looks past her shoulder); Mom beside little Jade; Dad at the table's end. Dad sits
  outside the wedge and reaches in. Mom's face is inside it.
- **Handout**: US Letter, canary yellow, 5 rows of faces, 7 to a row, except the fourth row, which has 6. Every row
  is centred, so the short row is inset half a cell at each end. `GAP` is where a seventh face would follow at the same
  spacing, at the end she reads to; ANXIOUS is the row's last face. She points at that last face (`JADE_TIP`, its near edge) and
  the adult's finger lands on the same face (`SW_TIP`, its far edge); the gold circle still goes round the gap beside it. The other 33 labels in `LABELS` are placeholders. The sidecar's
  `handout` gives page corners and every cell centre in world and px.
- **Outside camera** (`OUTSIDE_CAM`, PC1 = PC4): level at her eye height, 6 deg off her axis, her face at u = 0.66, bare
  wall frame-left for the toner label. Her eyes are on the sweatshirt and the table.
- **Inside cameras** hide her head. H1 and H1b are steeper (62 deg) than her true eye-line (about 47 deg) so the grid
  reads square; PC3 and the gap camera (BO1 = BO2) use the true eye-line.
- Cast heights: little Jade (7) 1.22 m (her feet do not reach the floor), social worker 1.65 (face undrawn), Mom 1.60,
  Dad 1.72. Registered set-locally in `build.js`.
- `X_sw` (the sweatshirt from her eye-line) is a spare: the Structure table does not place it.

## Engine notes
- Same `common.js` helpers as shanghai86, including `fixLeftHands` (the social worker points with her left hand; without
  the correction that finger pointed at the ceiling).
- `REF_plan` and `REF_wide` are reference views, not shots.

## Not done
- The faces on the handout are plain discs with a bar for the label; the print itself is a 2D asset to map onto
  `handout.corners_px`.
- PC5: the dictionary and the thumb read as a block in two hands; the riffle is for the still, not the blockout.
- In the `lit` preview her face is in her own fringe's shadow under the top light. Mood preview only.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. `fixLeftHands` in `common.js` is now a no-op. After the change `BO2` (the social worker's left index on ANXIOUS), `PC2` (Dad's left palm up on the table) and `BO1` land where the shots say; the hands are slightly larger than in the old renders because the old correction left them short.
- **Cast.** `jade7`, `dad` and Mama = `mama91` (was `mom`) come from `../_cast.js`; `sw` stays local.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set office91 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/office91_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (the tube's louvred wedge down to the floor; under the table top only what falls outside it), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: REF_plan, REF_wide, PC2, PC5, X_sw are good. Saturated: `H1`, `H1b`, `BO1`, `BO2`, `PC3` are white over the whole frame in both twins (her view of the page: all of it is under the tube); `PC1` / `PC4` are white in `beam_` (the lens looks through the wedge) and useful in `__surf` (her and the table lit, the wall behind black).

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- (This set was on v2 times, which match v3 to ~0.1 s here.) H1 19.00-25.63 (groove 19.0), H1b -29.74 (verse 1); PC1 77.24
  (pre-chorus start; sung 78.28)-81.50, PC2 -83.27, PC3 (gap) -87.37, PC4 -90.78, PC5 -92.68 (band out), BO1 92.68-94.68
  ("looks"), BO2 94.68-96.00 ("How do you feel?").

## 2026-11-26: fixed background art and clothing decals (Jade: art and logos the same in every shot)
- Every wall picture is now a fixed image on its plane (layout/sets/office91/art.js, images in
  layout/assets/art/office91/, each with a .txt sidecar). Shows in every guide mode (sets/_art.js; render.js look.art).
- Back wall: alphabet line = alphabet_cards.png (26 cards; letters drawn in code, pictures apple..zebra from
  alphabet_icons.png); turkeys turkey_1..3 upper left; the cork board re-laid to the FIVE pictures the r3 painting
  PC1_v1 showed (board_house, turkey_4, board_rainbow / board_family, board_snowman; was 7 blank); drawing_2 and
  turkey_6 beyond the board (x 1.05); the wall clock has a code-drawn face (10:10).
- Corridor board (FE_out, FE_thumbs): corridor_turkey_1..3, corridor_drawing_1..5 (layout.js HALL_ART).
- The social worker's sweatshirt print is a decal: layout/assets/art/logos/sw_tree_print.png (Christmas tree, cracked
  print, 17 x 20 cm, chest centre). Prompts: pass it as a reference and say "exactly this print".
- INVENTED (flag): every picture's content (Jade: "an alphabet, turkeys drawn as handprints, other elementary school
  children's art"); the tree design (Jade's words were "Christmas sweatshirt with cracked print"; the cast sheet had
  geese); the sweatshirt stays the set's sage green while r3 painted dusty rose. Questions in work/background_art_audit.md.
- Painter prompts: pass the r4 guides as usual; for close shots of the wall add the images it shows as references.
- Repaint in r4: PC1, PC2, PC4 (board now 5 pictures; PC2 had drifted), FE_out, FE_thumbs, PC3a, X_sw.

## 2026-11-26: hold pass (Jade: objects held so they are supported, not adjacent, no floating; correct physics; natural wrists)
Checked with `--gaze` + engine/holdcheck.mjs, mannequin and `--body mesh`.
- Social worker's right hand (every shot with `sw`): it was a 'pinch' in the air that closed through the 6 mm clipboard.
  Now it RESTS on the clipboard (grasp.js restOn via `swRest` in shots.js): open hand, fingertips on her notes, the heel
  of the hand just off them. The mannequin's wrist sphere is fatter than its palm, so with the palm flat on the page the
  wrist went 18 mm through it; the hand pitches a little fingers-down so the wrist clears. BO2 (she leans in to point):
  her resting hand lies further up the notes (`swRest(0.25, 0.09, ...)`), with `elbowAt` out to her right. Without it her
  forearm came up through the table.
- Clipboard (build.js): the board and the clip now carry their own labels ('clipboard: the board' / 'clipboard: the
  clip'), so the check sees her hand on the notes, the notes on the board, the board on the table. layout.js CLIPBOARD
  moved 4 cm onto the table (z 0.20 -> 0.16): it hung 4 cm over the near edge, over her forearm.
- Social worker's left hand: moved to the table just left of the clipboard (x 0.08 -> -0.03). Its fingers went through
  the notes. It rests on the table, which the check does not cover (see below).
- Mom's open dictionary: now checked (arms tagged `grasp: 'twoHandsBelow'`, `object: 'little red dictionary'`). The palms
  lie ON the back of the cover (they were 2 cm behind it), under its lower half. The book leans back to DICT.tilt = 40 deg
  (layout.js, was 50; build.js reads it): at 50 deg, steeper than atan 0.9 = 42 deg, it slid down out of her palms.
- Little Jade's pointing finger (BO1/BO2): checked as tipOn on the handout. The finger now comes down at 40 deg (was 30
  deg): her thumb went 6 mm into the page. The adult finger in BO2 now uses the tipOn template (`tip` on SW_TIP), so the
  pad lands ON the ANXIOUS face. pointAt left it about 1 cm off.
- Not checked: hands resting on the table itself (Jade's hands, the social worker's left hand, Dad's hand on Mom's
  shoulder). The table is not a held object, and its laminate skin and core share one label, so they cannot be hulled.
- Repaint where visible: PC1, PC4, X_sw, PC3a/b (her right hand and the clipboard moved), BO1/BO2 (finger angles).

## 2026-11-26: round-4 decisions (R4D brief; Jade's answers in work/decisions/JADE_R4_DECISIONS.md)
- **art_sw (Jade: "Geese, dusty rose").** The social worker's print is now ONE canonical decal,
  layout/assets/art/logos/sw_geese_print.png (+ .txt): five plump white geese walking in a row on stitched grass, a
  cornflower-blue ribbon bow on each, the FOURTH turned the other way, c.1991 country-craft style. Made with Codex
  image_gen in tmux `proof-office` (free), with the cast sheet cast/strangers/social_worker/social_worker_faceC_v1.png
  as the reference, so it matches the sheet. White keyed to transparency (border and enclosed gaps). On the chest
  (art.js SW_PRINT): 25 cm wide (30 cm wrapped the outer goose round her side), nudged 2 cm (u) onto the mesh's midline.
  Sweatshirt `top` is dusty rose SW_ROSE 0xb97a78 (was sage 0x7a9a8a); r4lib names it "dusty rose".
  sw_tree_print.png (the tree proposal) is no longer used. The cast sheet text already said geese + dusty rose: unchanged.
- **Skirt (flag, my call).** sw `legs` 0x3a3e4a charcoal -> 0x7088a8 washed-blue denim, as the cast sheet's "mid-calf
  straight denim skirt in washed blue" (the r4 prompt fallback already said #8fa8c8). Legs are rarely in frame.
- **r4 prompts.** media/keyframes/r4/office91/_prompts/_make.py: the sweatshirt, the sw:chest look target, the PC1 gaze
  line and the sw_print art ref now say geese / dusty rose and point at sw_geese_print.png (was the cracked tree).
- **off_table, art_office_kids, art_office_corridor, art_alphabet:** kept as built (Jade).
- **Props phase 2.** Downloaded models replace four boxes (build.js; each falls back to its box if the model is missing):
  `typewriter` (IBM Selectric II, recoloured beige 0xc8c0a8: INVENTED colour) and `telephone` on her desk, both turned to
  face -x (she would sit at the desk facing the right wall); `tissue_box` on the filing cabinet (its own navy, was
  blue-grey); `pencil_cup` with pencils on the meeting table (19 cm to the tips; was a 10 cm blue cylinder).
  Credits: docs/credits_tools.md (already listed; marked "In office91"). Clipboard and dictionary stay hand-built (audit).
  Hold check after re-render: 21/21 pass (no prop here is held; the swapped ones are all resting).
- **X_sw in the cut (Jade via lead).** X_sw 1:35.6-1:36.0 (was an unplaced spare) carries the plates' caption "Were you
  afraid during the raid?", small and low (comp_all.py CAPTIONS, size 25 at [960, 1032]), held into attic88_day
  AD_trace. Aim 0.45 -> 0.40 so the print sits a little higher and the caption lies over the clipboard edge. BO2 shortened
  to 1:34.7-1:35.6. FLAG: BO2's intent still says "match cut on the pointing finger follows"; X_sw now sits between BO2
  and AD_trace, so that match cut is now BO2 -> X_sw -> AD_trace (the plan should say which).
- Re-rendered (three passes), all shots looked at: X_sw, PC3a, BO2, PC2, REF_wide show the changes. Hold check 21/21.
- Known, not new: two small skin-coloured slits at the sweatshirt's shoulder seams (mesh), visible in X_sw/PC3a form.
- **Bows fixed (Jade: "the bows shouldn't be messed up like that").** sw_geese_print.png v2: the AI bows were erased and one
  clean symmetric bow (two loops, knot, two notched tails) drawn in code is composited on every goose
  (tools/art/geese_bows.py; input sw_geese_print.v1.png). Geese unchanged. Re-rendered X_sw, PC3a, BO2, PC2, PC1, PC4,
  REF_wide, REF_plan (default + form/contour/light); beam masks unaffected (decal only).

## 2026-11-26 round 4 — PROGRESS (checkpoint)
Jade on X_sw: "the social worker's shoulders are weirdly misshapen".
- **Diagnosis.** The social worker had no elbow pole, so the engine's default (down, 65 % outward, a little back;
  engine/mannequin.js ~l.265) swung both elbows out wide. With the hands far forward on the table, her upper arms were
  abducted and flexed, and the mesh shoulder over-deformed. You could see it in the new REF_sw_front/side/top/back views:
  her left deltoid bulged, the front armpit crumpled, and from behind both deltoids peaked.
- **Changed (shots.js).**
  - `SW_ELBOW` poles (FINAL) L [-0.12, 0.55, 0.9], R [0.52, 0.55, 0.9]: elbows a little out and back. (Superseded first try
    [-0.06/0.46, z 0.72] crumpled her left armpit in X_sw.) Earlier comparison:
    straight down still folded the armpit, wider bulged the deltoid, and slightly out is the cleanest.
  - L hand 3 cm in toward her midline, fingers angled inward [0.35, 0, -0.94]. Its forearm was +4 deg past the
    pronation limit.
  - BO2's own R elbow pole (out to her right, to clear the table) is unchanged.
  - New reference views REF_sw_front / _side / _top / _back (not shots): the social worker alone, as staged.
- **Left (engine/body, not mine).** A small notch or pale tick at the top of each shoulder seam (the acromion) is
  still there in every pose. The pale slits were already visible in the earlier X_sw / PC3a renders. Likely cause: the
  body's skin pokes through the sweatshirt where the clavicle (grouped 'torso' in humanMesh.js prep) meets the
  upperarm group. Needs the body/engine owner.
- **Status: DONE.** Full office91 re-render (three passes) with the final poles. I looked at X_sw, PC3a, PC2, BO2,
  REF_wide and REF_sw_*: the shoulders and upper arms are smooth, with no armpit crumple and no deltoid bulge.
  Holdcheck 25/25 pass. The sw R wrist sits exactly at its pronation limit (warning "+0 deg") in 13 shots: negligible.
  The shoulder-seam tick (engine/body) remains: report sent to the lead.
