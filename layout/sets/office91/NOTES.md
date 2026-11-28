# office91 — notes and assumptions

## 2026-11-28 (later): round 9, FE_thumbs fold re-posed from stock photos (Jade: "look up stock photos of what arms folded look like"; SUPERSEDES the fold and camera numbers in the section below)
- **References:** 16 look-only stock previews of women standing with arms crossed, front and 3/4 views (iStock search
  previews for "woman standing arms crossed" and "mother arms folded standing"; Unsplash, Pexels, Shutterstock and Adobe Stock
  refused automated access). Never sent to a model. Refs-vs-render sheet in the lead's scratchpad:
  `arms2/FE_thumbs_fold_refs_vs_render.jpg` (16 refs above; the FE_thumbs camera, front and low 3/4 renders below).
- **The common fold, matched:** forearms crossed at mid-torso and resting against the body, elbows in by the ribs,
  shoulders relaxed; the top forearm's hand rests with its fingers on the outside of the opposite upper arm just above the
  elbow; the other hand is tucked under the opposite upper arm. Her LEFT forearm is now on top, so the visible hand (her left,
  on her right upper arm) faces the FE_thumbs camera; her right hand is tucked under her left upper arm. `FOLD` in shots.js.
  Wrists in range (the engine turns her right hand 13.7 deg); clipcheck pass, check_bodies pass.
- **Turn toward the camera:** her body is now 55 deg short of square-on to her daughter (was 35), head `turn: -10`, so the
  fold reads three-quarter front in FE_thumbs; she still looks at the girl's eyes (gaze error 0).
- **Camera:** same position family (az -75, el 0, 40 mm), pulled back to dist 1.8 (was 1.5) and aim v 0.30 (was 0.36), so
  the folded arms sit clear above the bottom edge: Mama from the thighs up, the girl to mid-thigh.
- Fold views `REF_fold_*` now at dist 1.7 (the whole torso). Prompt: the fold text and crop updated (left forearm on top,
  left hand visible, right hand tucked). Before/after: media/layout/office91/_FE_thumbs_before_after.png.

## 2026-11-28: FE_thumbs restaged (Jade, r4 keyframe notes: "Wrong staging ... replace with: little jade has an unimpressed smirk, and slightly narrows one eye, and mom has arms folded")
- **The cheek-push is gone** (`momThumbs` / `CHEEK_HAND` kept in shots.js for reference, unused). Corridor at ten, right
  after "But not like that" (-2sm 18.23-19.0, unchanged).
- **Mom, arms folded** (`momFolded`, `FOLD`, `foldArm` in shots.js): upright (bend 4), at `MOM_HALL2` [-2.68, 0.06], body
  turned 35 deg short of square-on to her daughter (open to the camera), head and eyes on the girl (`turn: -20`: the eyes
  take the last 20 deg). Posed from look-only reference photos (Wikimedia Commons image search "woman arms crossed
  standing", six photos, kept in the lead's scratchpad `armsref/`, never sent to a model; compare sheet
  `armsref/fold_refs_vs_render.jpg`): forearms stacked across the body just under the bust, RIGHT forearm on top, elbows
  by the sides and a little forward, shoulders down; her right hand on the front-outer face of her left upper arm at the
  elbow, fingers curled round it; her left hand on the outside of her right upper arm, under the right forearm. Targets
  are body-frame offsets from `self:shoulderC` (the left arm is solved before the right shoulder point exists).
  Wrists: the engine's natural-wrist pass turns her left hand 6.7 deg (flex 66.7 -> in range); right in range.
  Fold checks (not shots): `REF_fold_front / _side / _top / _low`.
- **Little Jade (10)** (`kidSmirk`): back to the wall, body yaw -100 (10 deg toward Mom), head `look: 'mama91:eyes'`,
  `turn: 25` (the head stays 25 deg short of Mom, toward the camera; the eyes slide the rest, 25.7 deg, up 13 deg), tilt
  7 toward her right shoulder, nod 3. Eyes aimed at Mom's eyes (gaze error 0, check_bodies: rays meet at 0.53 m).
- **The smirk and the narrowed eye are NOT in the 3D face**: the MPFB bodies have no lid or mouth controls (no eyelid
  bones, no shape keys), and the painter takes faces from the face crop (faceless guides keep eyes, brows, glasses). So
  the prompt carries them: one corner of the mouth (her LEFT, the corner nearer the camera, the right-hand side of her
  face in the picture) pulled up, lips closed; the eye on that side slightly narrowed; unimpressed, not mean.
- **Camera changed** (it had to: the old one looked over Mom's back, so her arms could not show): FE_out's side of the
  corridor, orbit at the mid-point of the two pairs of eyes, az -75, el 0, dist 1.5, 40 mm, aim (0.5, 0.36). Mom at the
  left from the knees up (face in profile, folded arms at the middle of the left half), the girl right of centre,
  three-quarter to the lens, cut at the hips. Background is the canonical corridor: the class-art board (city street,
  handprint turkey) at the left edge, plain wall and the dark nameplate behind the girl, the counselor's door and knob
  at the right edge.
- **Checks**: clipcheck FE_thumbs pass (no body vs body, joints in range); check_bodies FE_thumbs PASS (clearance > 50 mm);
  holdcheck: nothing held. (FE_out FAILS both, pre-existing and untouched here: Mom's right hand 48 mm into the girl's
  shoulder; flag for whoever owns FE_out.)
- **Prompt** (media/keyframes/r4/office91/_prompts/_make.py `HALL["FE_thumbs"]`): new SUBJECT / crop / gaze; refs her10_face +
  mama_face (the expressions sheet and the hands sheet dropped: the sheet has no smirk and its grins would pull the
  mouth). 6 images in all, so the job routes to gpt2 (paid route: needs Jade's OK) as before; FE_thumbs.gpt2.txt in that
  folder is the OLD cheek-push text, stale.
- Before/after: media/layout/office91/_FE_thumbs_before_after.png (lit, form).

## 2026-11-27: the PC1 background locked (Jade: the grey cabinet, the wall art and the clock moved from take to take)
- **Cause.** The PC1 guide's frame showed two turkeys and half the board. The prompt named three turkeys, five board pictures,
  "two more pictures beyond the board", a wall clock and "at the far right edge, the narrow side of a grey steel filing
  cabinet". Neither the clock nor a cabinet was in the frame, so each take squeezed in what was missing in its own way. The
  "cabinet" the takes painted at the right edge was really **Mom's chair back**, the only object the guide had there. v1/v2
  were also given the r3 painting as a reference, and v3/v4 the full art sheet: they added the pilgrim drawing and a clock.
- **Framing decision: keep the camera and move the wall.** Measured against the paintings, the girl's size and place in
  PC1_v1/v2 match the guide to within about 5%. The paintings are not wider; only their wall was rearranged. Widening the
  lens would bring Mom (x 0.42, beside her) into the right edge, where the paintings show the cabinet.
  - `OUTSIDE_CAM` (PC1 = PC4): unchanged (65 mm, orbit az -6, dist 2.1) except `aim` v 0.42 -> 0.47, a tilt of under
    1 deg. Her eyes now sit where v1 has them vertically. She and her pose are unchanged.
  - The wall was re-laid to the PC1_v1 painting: each v1 landmark was mapped to the guide frame (her eyes as the anchor,
    scale 1.05) and projected back onto the wall through the PC1 camera:
    - `ART`: turkeys at x -1.12 / -0.89 / -0.655, y 1.305.
    - Board pictures: house (0.064, 1.215), turkey_4 (0.27, 1.215), rainbow (0.488, 1.215), family (0.163, 0.995),
      snowman (0.415, 0.995), resized to v1's proportions.
    - `BOARD` x -0.125..0.62, y 0.84..1.375.
    - `ALPHA` y 1.47 -> 1.49.
    - drawing_2 and turkey_6 stay at x 1.05: PC2 sees them, PC1/PC4 do not.
  - In PC1 the right part of the board runs out of frame, as in v1: the rainbow and the snowman are cut by the edge.
- **New: `FILE2`**, a low two-drawer grey steel letter file (0.38 x 0.56 x 0.74 m, x 0.12..0.50, z -1.49..-0.93)
  against the back wall between her chair and Mom's. In PC1/PC4 it shows right of her left shoulder under the board
  (82-100% across, top 76-81% down), with Mom's chair post in front of it at the very edge. It stands 2 cm behind Mom's
  chair back and clear of Dad (clipcheck reports nothing new). In PC2 it is hidden behind Mom.
  - The tall four-drawer `CABINET` stays in the back-right corner; PC2 shows it.
  - Both cabinets are now a cool grey enamel (`FILE_STEEL` 0x7e848a, with a grey formTint). The old warm STEEL rendered
    almond in the form guide.
  - ASSUMED/INVENTED: the second cabinet. It stands for what Jade liked in v1/v2.
- **Chairs** are honey oak (0xa57e52; was blue-grey 0x4a5a6a), as every PC1 painting and prompt has them. This changes
  the chair colour in every office shot.
- **The clock** stays at (0.95, 2.1), above every PC frame: PC1 v -0.64, PC2 v -0.27. The prompts now say there is no
  clock in frame.
- **Toner-label patch.** The bare wall left of her face, below the turkeys, is the only bare wall in PC1/PC4, kept on
  purpose for the toner label.
- **Prompts** (media/keyframes/r4/office91/_prompts/_make.py):
  - `WALL_PC1` names every piece in frame with its % position, the cabinet and Mom's chair post, and says no clock and no
    other art. `WALL_PC2` does the same for PC2.
  - `NO_WIDEN` ("match the layout drawing's framing exactly ... do not widen") is added to PC1, PC4 and PC2.
  - A PC1-only art sheet, `_art_backwall_pc1.png`, holds the eight in-frame pieces.
  - The captions no longer say "image 1 places them": the face crop is image 1 now. They say "the layout drawing".
  - The r3 painting ref is replaced by `pc1_r4`, a frozen copy of r4 PC1_v1 (`_ref_PC1_r4v1.jpg`), passed for the child
    and her expression only.
  - The face-crop line ("Image 1 is a face reference ONLY ...") is present.
- Contact sheet: media/layout/office91/_PC_background_sheet.png. Repaint: PC1, PC4, PC2.

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

## 2026-11-26: round-5 decisions (work/decisions/JADE_R5_DECISIONS.md; R5 brief) — office-market agent
- **Skirt:** washed-blue denim 0x7088a8 confirmed by Jade; already built (sw `legs`). Unchanged.
- **BO2 -> AD_trace is now a plain cut** (Jade: "don't match the fingers"). BO2's intent no longer asks for a finger
  match; nothing in office91 was framed to match AD_trace (the camera never depended on it), so only the text changed.
- **Her fingertip on the MIDDLE of the missing space** (Jade: "slightly off center"; lead: little Jade's finger, BO1 and
  BO2). `GAP` was cell(shortRow, 6): a seventh face at the short row's own spacing, a quarter cell (6.4 mm) past the
  column of last faces (THANKFUL above, MAD below). The hole the eye reads runs from ANXIOUS's edge to that column's outer
  edge; its middle is the column. layout.js: `GAP` = [x of the last column, the short row's line]; the old point kept as
  `GAP_SEQ`. JADE_TIP, the gaze target 'gap', the gap cameras and `handout.gap_px` all follow. The adult's finger stays
  on ANXIOUS (SW_TIP unchanged).
- **Lit pass exposure** (lead: BO2_lit blown out): the close shots inside the tube's pool (H1, H1b, PC3b, BO1, BO2)
  were 80-97 % pure white in the lit pass. `POOL = { light: { exposure: 0.27 } }` (shots.js); build.js scales the three
  tube spots, the bounce and the ambient by `shot.light.exposure` in the lit pass only.

## 2026-11-26: round-5 decisions — engine-body agent (the social worker's shoulder and back only)
- **Shoulder root cause (engine/humanMesh.js solvePose):** the upper arm's twist reference was swung from the REST
  (unrotated) arm, not the chest. Any figure yawed far from 0 got the top of the upper arm turned against the chest
  (measured with bodytest `shoulder_*` / `shdbg_*`: 173-176 deg for the social worker and for Mama turned to yaw 180;
  ~0 for figures at yaw 0, hence the parents looked fine). Linear blend skinning collapsed that half-turn into the
  shoulder-seam notch and a fin behind each armpit. Fixed: the rest bending normal is carried by the chest rotation first.
  Now 0-1 deg for every figure. Fixed for all sets (every figure not facing +z was affected, more or less).
  Before/after crops: work/r5/engine_body/ (sw_shoulder_*.png).
- **Dark blob on her back (REF_sw_back lit):** not a shadow and not the body. It was the beam's haze prism
  (common.js beamMeshes, lit only): drawn double-sided, its near face veiled her back except where her upper back reached
  into the prism. engine/render.js now draws a haze volume by its far faces only (x2 opacity). Same in shanghai86.
- The social worker's pose (SW_ELBOW etc.) is unchanged: no pose change was needed.
- **Measured (BO2.json, BO1 identical):** the slot centre projects to px (960.1, 604.8); her pad contact to (960.1, 606.7):
  1.9 px off (0.5 mm on the page; 4.05 px/mm there). The tip centre is straight over the slot (0 mm in plan); the visible
  nail end runs 4.6 mm on along the finger (20 px). Gaze target = the slot, error 0 deg. Before: the pad sat on
  cell(3, 6), 6.4 mm (about 26 px) past the column, i.e. off the middle of the hole.
- **Lit exposure result:** BO1 / BO2 / H1 / H1b / PC3b now mean luminance 0.60 / 0.56 / 0.68 / 0.74 / 0.69, 0 % pure white
  (were 0.94 / 0.91 / 0.98 / 0.98 / 0.98 with 80-97 % pure white). The remaining 3-11 % "clipped" is the canary paper's red
  channel only.
- **Clipcheck fixes (mine):** little Jade's resting hands (`jade()`) and Mom's listening hands (`momListen`, PC2) sank
  10-14 mm into the table top. They now lie open on it (`JADE_HAND`, a flat hand with a light curl) at TOP + 0.04:
  clipcheck clean for jade7 in every shot and for Mom's hands in PC2.
- **Left for others / known:** the social worker's left hand 13.8 mm into the table, her feet 14.8 mm into the carpet,
  her clip contact 4.1 mm in BO2 (engine-body owns her body this round); Mom's feet 14.2 mm into the carpet and 14 mm of
  cloth into her chair (pre-existing, soft). The 500-760 mm "into meeting table / clipboard" rows are false positives:
  those meshes are open (no inside), so the point-inside test misfires under the table.
- Hold check 25/25 pass. Re-rendered all three passes.
- Before/after crops: work/r5/engine_body/sw_shoulder_REF_before_after.png (left before, right after; front and back),
  sw_shoulder_close_back_before_lbs_dqs.png (before / fixed / a dual-quaternion test that was NOT kept),
  sw_back_blob_before_after_lit.png. The parents never had it because they face +z (yaw 0 / -6).
- Also engine-wide (affects her too): soles on the floor, seated feet flat (her toes were 15-20 mm into the carpet).
- clipcheck office91 after: the 755 mm "into the meeting table" sheet false positives are gone (clipcheck sheet band).
  Still failing, pre-existing staging (office-market's): sw L forearm 13.8 mm into the table top, sw cloth into the
  table / clipboard (34-80 mm), sw / mama91 14 mm into their chairs, FE_thumbs mama91 vs jade10.

## 2026-11-27: real-size feet / hands (engine agent)
- Dad stands 4 cm further back (SEATS dad z -1.04 -> -1.08): his 258 mm feet were 14 mm into Mom's chair. His right
  hand on her shoulder 1 cm higher (off y 0.035 -> 0.045): the fingertips (skin now out to the tip pad) were 14 mm
  into her cardigan.

## 2026-11-27: BO1 copies BO2_v3 (Jade: BO2 pick = BO2_v3; BO1 "copy sheet and hand positioning from" it)
- **Why the BO1 takes drifted.** BO1 and BO2 already shared GAP_CAM, but the r4 guides used orbit az 150 (re-render pass,
  2026-11-26), the sheet seen steeply from the side. BO1's takes followed that guide; BO2_v3 instead followed its image-4
  reference (r3 BO2_v3, painted from the r3 az-180 camera), so the pick and its own guide disagreed.
- **GAP_CAM** (BO1 = BO2) is now the camera SOLVED from BO2_v3's four sheet corners (40 mm fixed; reprojection error
  < 1 % of the frame): pos [-0.3729, 1.1002, -0.4312], target [-0.3823, 0.7206, -0.0863], roll 1.4. The model's
  circle grid then lies on BO2_v3's painted circles and the adult's finger lands on its painted finger (overlays in the
  lead's scratchpad). gap_px (938.8, 606.4).
- **Her pointing arm** (`jadePoint`, BO1/BO2 only): sleeves 'pushed' (the prompt always said so; the long cuff hid the
  whole hand from straight behind, the reason az 180 was dropped), `elbowAt` [-0.5, 0.7, -0.45] (elbow out to her right),
  fingers [0.22, -0.6, 0.77] (up the page and to the left): her forearm now lies on BO2_v3's painted forearm. No wrist
  warning for her right hand; pad on the gap (index3 tip = gap_world).
- Re-rendered BO1 and BO2: default modes + form/contour/light + beam masks. BO1 prompt (_make.py) passes BO2_v3 as image
  4 and says to copy its sheet, grid, child's hand and style, with no adult hand. Takes BO1_v5/_v6 (free Codex).
- 2026-11-27 (later): BO1 pick = BO1_v5 (picks.json). Zoom-checked v5 and v6: rows 7-7-7-6-7, pad on the missing slot,
  thumb tucked, no adult hand; v5 is closer to BO2_v3.
