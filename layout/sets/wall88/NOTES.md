# wall88: notes and assumptions

## 2026-11-26 round 4 — PROGRESS (checkpoint)
- DONE (see the section below for numbers): brick texture (brick.js, Waalformaat, every mode); Mama's palms re-solved
  (wl_search.mjs; gaps 0.5-0.6 mm, flat to 1 deg, joints in range); file 13.5 cm off the brick, 50 cm apart, soles lifted
  15.5 mm; child moved 2.2 cm, CRACK_Y 1.161 (blade on her left eye 0.0 cm again), WL_out az -3 (a stud blocked her face);
  WL_top alternate added. clipcheck: all five shots PASS (skin 0 mm everywhere; cloth <= 4.4 mm). Rendered (3 passes)
  and looked at WL_in, WL_in line, WL_top, WL_out.
- DONE (milestone 2): final clipcheck all pass; gallery rebuilt. Flags: brick format assumed (NL Waalformaat); WL_top is a cutaway (plan says none) and not in the plan;
  engine-wide mesh soles ~13 mm under the floor.
- Question for Jade: WL_top in the cut at 1:51.0-1:52.2? (yes / no) rec: try it. Img WL_top_flat.png.
- clipcheck: `node layout/engine/clipcheck.mjs --set <set> --exclude beam_ [--shots A,B] [--json out.json]` -> one table
  per shot: body vs world (skin / cloth mm inside), body vs body, grips (gap, cloth, skin), palm touches (`clip.touch` in
  a shot: gap mm, palm angle to the wall), joints vs limits. Pass = skin <= 3 mm, cloth / cushion / floor <= 12 mm.
  Scripts: `openClipPage(set)` + `window.clipDumpSpec(shot)` + `checkDump()` for searches; `window.visSpec` /
  `window.renderSpec` (engine/main.js, additive) for camera searches and previews.

## 2026-11-26 (late): round-4 decisions (Jade's answers; SUPERSEDES everything below where they differ)

Jade: WL_in "her arm is in an impossible position, her palm can be on the brick but needs to be in a way that physically
makes sense (use a game engine or some other tool for this) / please draw the brick texture into the wall so you can
tell the distance of things"; wl_count "yes, five; a brief overhead shot would also be interesting to add, perhaps".

- **Measured, not by eye** (new engine module, `engine/clipcheck.mjs` + `engine/clipdump.js`): every vertex of every baked
  mesh body against every set mesh and every other body, with Rapier point projection on oriented trimeshes; joints
  against their limits; palm-on-wall contacts (`clip.touch` in shots.js). `node layout/engine/clipcheck.mjs --set wall88
  --exclude beam_`. The r4 staging failed it everywhere: every back 13-29 mm into the brick, every sole 12-16 mm into the
  floor, adults 45 cm apart 35-40 mm into each other at the shoulders, w3's hands 10 mm into the boards, the palms on the
  brick 11-21 mm into it, Mama's right wrist 100-130 deg past its range.
- **Mama (WL_in) re-solved** (`wl_search.mjs`: the engine's IK proposes, clipcheck measures; 60 candidates round a
  hand-reasoned seed): both palms flat on the brick the way a body pressed back against a wall puts them. Right arm out
  from her side toward the closed end, where her daughter is: palm 40 cm along the wall from her pelvis (22 cm beyond the
  shoulder), at hip height 0.82 m, fingers down and toward her daughter, elbow bent 41 deg; left palm just behind her left
  hip. Head turned back toward her daughter. Measured: palm gaps 0.6 / 0.5 mm, palm normals 0.7 / 0 deg off the wall
  normal, no skin inside anything, wrists in range (R flex -7, ulnar 29 (limit 30), twist -13; L flex -10, ulnar 15).
  A higher reach (chest height, 30+ cm beyond the shoulder) was tried: the elbow ran past its rotation limit or the
  wrist past 90 deg; the engine's IK cannot put that palm flat on the wall within the joint ranges.
- **The file**: pelvis 13.5 cm off the brick (was 10.5): backs of the clothes ~1 mm off the brick, toes ~6 mm short of
  the boards (32 cm cavity kept). **50 cm apart** (was 45): adults 45 cm apart stood 3-4 cm into each other. Studs moved
  to 50 cm centres between them (`CAVITY.stud.z`), cavity 10 cm longer (z1 2.75). w2's free hand is a fist against his
  thigh (hanging, it was in w3); w3's clasped hands 5 cm nearer her waist, elbows down; w1's praying hands 2 cm nearer,
  head 6 deg less bowed; w4's palms 7 cm nearer his hips. Palm centres 22 mm (child) / 28-30 mm (adults) off the brick.
- **Floor**: every standing body is lifted 15.5 mm (`SOLE_LIFT`): the baked mesh soles sat 12-16 mm under the floor
  (an engine-wide offset between the solver's ankle height and the mesh foot; FLAG for the engine, every set).
- **The child (WL_out, WL_eye)**: pelvis 10.7 cm off the brick (was 8.5; her back was 13 mm into it), lifted 15.5 mm;
  palms 22 mm off. Her eye moved ~2 cm toward the boards and up 1.5 cm; the blade on her face is re-measured in the sidecar
  (`blade_on_face`).
- **Brick texture** (`brick.js`): ONE running-bond texture drawn in code at true size on the brick's cavity face, in every
  guide mode (lit: colour; flat / form: greys; line / contour: a drawn edge map of every joint). ASSUMED Dutch
  Waalformaat, 210 x 50 mm faces, 10 mm joints (a course every 60 mm, a stretcher every 220 mm): the building is the
  Netherlands restaurant of the attic (the neon sign reads CHIN. IND. SPEC. REST.). FLAG: US modular (194 x 57 + 10) if
  the wall is elsewhere (`BRICK` in brick.js). The other faces of the brick box carry one mortar texel.
- **WL_top** (new, ALTERNATE, not in the plan): straight down into the cavity onto the five heads, 24 mm from 3.45 m,
  the top plate lifted off (a cutaway: the plan's wall notes say "no cutaway of the wall from outside"; FLAG), everything
  outside the cavity black. Proposed slot: the first blink of "Nowhere to go", 1:51.0-1:52.2, then WL_in, WL_in_empty.
  Beam twin `beam_WL_top`.
- Clip results after the fix (mesh bodies): all five shots pass; worst skin penetration 0 mm; cloth pressed: the child's
  shirt 4.2 mm on the brick, w2's sleeve 4.4 mm on the boards, w2/w3 sleeves 0.5 mm. Joints all in range.
- r3/r4 snapshot: the r3 page already reads `media/keyframes/r3/_layout_snapshot/wall88/`.

## 2026-11-26: round-4 set fixes (Jade's r3 review; SUPERSEDES the r3 section below where they differ)

Jade: WL_out "the image model did something picasso on her face, unlike the next shot"; WL_eye "something about
WL_eye_v1.jpg is better. she's looking in a direction that makes sense"; WL_in "make the closest one her mom, and then
next to mom, the praying lady ... there should be just barely enough space for their feet ... almost coffin-like";
WL_in_empty "there's too much space in here ... barely wide enough for a grown person's feet".

- **Cavity 32 cm** clear, board face to brick (was 46): `CAVITY.x0/x1` = -0.16 / +0.16. Adults stand pelvis 10.5 cm off
  the brick: heel ~5 cm off it, toes ~1 cm short of the boards (checked in `WL_plan`). No sole plate (it sat under the
  toes); the studs stand on the floor. Studs at 45 cm centres past the crack (0.18, 0.63 ... 2.43) so each adult stands
  in one bay, shoulder to shoulder; a stud face is 25 cm off the brick, no room for a foot in front of it.
  NOTE: Jade also said "the wall in the model looks right" (the r3 guide); the painter widened it. Narrowed anyway, per
  "barely wide enough for a grown person's feet".
- **The file, nearest first**: Mama (the engine's `mama`: 1988, restaurant apron, bun, 1.60 m) at z 0.405, then the
  praying lady (w1) at 0.855, then w2 (hand over mouth), w3 (hands clasped), w4 (palms on the brick). The r3 fifth
  worker (w5, a man praying) dropped: the bays hold five. ASSUMED Mama's pose ('shield'): right palm flat back on the
  brick toward the closed end (between the file and her daughter), left palm on the brick by her hip, head turned back
  and down toward where her daughter stands (named point `daughter`), holding her breath. Her face is drawn (family).
- **Her look (WL_out, WL_eye) = WL_eye_v1**: head near-frontal to the outside camera (77 deg left of her chest), eyes a
  further ~22 deg to picture RIGHT, at Mama's hip/hand beside her in the file (`toMama`, layout.js `FILE_LOOK`; Mama
  is not in the outside shots, a set point). Same pose in both shots. The blade now crosses her picture-right (left)
  eye in both (sidecar `blade_on_face`: left eye 0.0 cm, right eye 4.4 cm under the sheet). `CRACK_Y` 1.287 -> 1.206.
  ASSUMED the "direction that makes sense" is toward Mama/the file (v1's irises go picture right, i.e. down the cavity
  on the brick side); she is no longer looking into the crack: the light comes onto her eye from the side.
- **Cameras**: WL_out 50 mm (was 35) at 1.6 m, az -5 (inside the 32 cm cavity, beside the stud faces): the near stud
  fills the left of frame, she stands frame-right, face at one plain near-frontal angle. WL_eye 85 mm at 0.62 m, az -12
  (as v1). WL_in / WL_in_empty 35 mm (was 28), 10 cm further back (z -0.70), 7.5 cm off the boards (just clear of the stud
  faces), tilted up ~4 deg so Mama's face is in frame; rhyme 0.3 deg. The walls fill both sides, the feet are below
  frame: no floor at all is in the guide.
- **Guides rendered with `--gaze`** (engine opt-in: eyes with irises aimed at the look target; strangers stay paper).
  Re-render with: `node layout/render.mjs --set wall88 --exclude beam_ --gaze` (+ `--modes form,contour,light --nojson`;
  masks `--prefix beam_ --modes flat --nojson`).
- **WL_plan** (new, reference only, not painted, no beam twin): ortho from above, top plate hidden (`shot.hide`).
- r3 guides snapshotted to `media/keyframes/r3/_layout_snapshot/wall88/`.

Painter prompt notes (r4)
- WL_out "picasso" face: what invited it in r3: the head at 45 deg three-quarters while the prompt asked the irises to
  go the OTHER way (to the crack), the mannequin's slab fringe and dot eyes at an oblique angle, the blade cutting the
  face in two, and a small face in a wide frame. r4: ask for ONE plain angle, the face almost square to us, both irises
  turned the same way to the right of the picture (toward her mother, out of frame), the strip of bare paper across
  the right-hand eye only; give WL_eye_v1 as the face/angle reference so the two shots match.
- WL_in / WL_in_empty: say "a cavity barely wider than an adult's foot is long, about thirty centimetres; the bodies
  nearly touch the boards; no floor is visible, no floorboards"; walls close on both edges of frame; dark. Mama nearest
  (her face sheet, apron, bun), looking back and down toward us; the praying woman just past her shoulder.
- WL_out: the big plain upright at the left is a stud seen side-on, close to the lens, with the boards behind it.

## r3 restaging, 2026-11-25 night (Jade's r2 review; SUPERSEDES the seated staging below)

Jade: WL_out "almost right, but she should be standing, not seated, her back against the side wall, and she's slowly
turning to look through the light"; WL_eye the same, "scared on the inside, her heart rate is fast, but her face doesn't
fully understand how to recognize it and show it"; WL_in "blink in and out, a single file of Chinese restaurant workers,
back to the brick wall, facing the wood wall, holding their breath, looking terrified, some are praying silently, they
blink in and out of existence and it's the empty wallspace again".

- **She stands** (`STAND` in layout.js): pelvis at x 0.145 (back flat to the brick, the "side wall"), z -0.35, facing the
  boards (yaw -90), head turned 45 deg toward her left (+z, the outside camera): the keyframe is mid-turn, turning back
  toward the crack. Palms flat back on the brick beside her hips. ASSUMED: "the side wall" = the brick (the workers
  in WL_in also have their backs to the brick, so she stands in the same file).
- **The crack is higher**: `CRACK_Y` 0.767 -> 1.287 so the sheet crosses her near (left) eye at the mid-turn (sidecar
  `blade_on_face`: left eye 0.0 cm, right eye 3.3 cm under the sheet, nose 4.9, mouth 6.7). The sheet descends toward
  the brick, so as she turns toward the crack her eyes move into the higher part of the sheet: the light runs across
  her eye during the turn. Length and slope unchanged (0.7 m, 40 deg); the bulb is 1.2 m back, now 2.31 m up.
- **Cavity lengthened** to z 2.65 (was 1.45) for the file of workers; one more stud at z 1.90.
- **Workers** (`WORKERS` in layout.js, set-local cast `w1`..`w5` registered in build.js with `addCast`, faces undrawn
  as office91's social worker): five adults 1.58-1.75 m, z 0.72-2.50, backs to the brick, facing the boards, shoulder
  to shoulder. Poses: w1 (front, a woman) palms together under the bowed chin (praying); w2 a hand over mouth and nose
  (holding breath); w3 hands clasped low, head bowed; w4 palms flat back on the brick, head pressed back; w5 praying.
  Kitchen whites and aprons, one waiter's white shirt (lit-preview colours only). They stand BEYOND the light (the crack
  ends at z 0.1): "being out of the beam is safety"; a 1.35 m crack that also lit them was tried and dropped because the
  sheet then passed over the outside camera.
- **WL_in is two states**: `WL_in` (state A, the file) and `WL_in_empty` (state B, the same camera, nobody: the frame the
  Voyager pull-back starts from). Same camera: 28 mm, from the closed end at the boards side (x -0.15, z -0.60), 2 cm
  above the sheet (y 1.231: about 20 cm above her eyes; the rhyme needs the camera at the sheet), looking along the file.
  Blade 40.2 deg, upper right to lower left (rhyme error 0.2 deg); the band runs a little below-right of frame centre.
  From one end of a 46 cm cavity a single file hides itself: the guide shows the front woman in profile and only the
  stepped edges of the others; the prompt has to carry the rest of the file.
- Cameras: WL_out 35 mm, 1.6 m down the cavity, 8 deg toward the boards, her eyes at (0.6, 0.3): boards and a stud
  frame-left, she stands against the brick frame-right, cut at mid-thigh. WL_eye 85 mm at 0.62 m, 10 deg toward the
  boards: her face three-quarters (31 deg off camera), the blade across her near eye.
- Fixed on the way: the spot cone is 30 deg (was 17).
- Masks: the beam_ twins render as before (`--prefix beam_ --modes flat --nojson`); `beam_WL_in_empty` is new. In WL_eye
  the camera is 9 cm under the sheet, so its mask is a large wedge (the air of the sheet seen from below), not a band.
- r3 paintings: `media/keyframes/r3/wall88/` (picks WL_out_v1, WL_eye_v2, WL_in_v2, WL_in_empty_v2; the empty state was
  painted from the workers state so the blink is an in-place cut).

"Proof": inside the wall, 1988 (chorus 1). Very small: one cavity, one crack, one child.

## Assumptions
- **Which wall is not known.** Modelled as a generic stud cavity: 0.46 m clear between a boarded partition (horizontal
  boards on studs) and a brick outer wall, 2.2 m long, 2.0 m high. If it was the eaves void behind the attic knee wall
  the top should slope; the blade and cameras would not change.
- **The crack** is a board joint opened to 30 mm over 0.7 m, 0.77 m off the floor. **The light** is a bare ceiling bulb
  in the room beyond, so it comes down through the crack at 40 degrees (`SLOPE`, the rhyme angle) as a thin sheet,
  13 mm thick, level along the cavity.
- **She** (little Jade, 5) sits knees-up facing along the cavity, back to the closed end. The sheet passes through her
  right eye (0.0 cm miss in the sidecar, `blade_on_face`), over the bridge of her nose; it passes 2.8 cm above her
  mouth, so "her mouth opens in the light" needs either a slightly thicker blade in the renderer or a small lift of
  her chin. Not staged separately.
- No header, no gold note, no cutaway of the wall from outside.

## The beam
- `BEAM` in layout.js: point source (the bulb), aperture (what a 30 mm gap in a 20 mm board passes at 40 degrees),
  receiving planes. The crack is a real slot with a shadowed spot behind it, so flat / lit show the stripe on her face.
- **Mask**: `node layout/render.mjs --set wall88 --prefix beam_ --modes flat --nojson`.
- Rhyme: **WL_in** (inside, along her eye-line) carries it: 40.5 degrees, upper right to lower left, through frame
  centre. **WL_out and WL_eye are mirrored** (upper left to lower right, 39.9 / 39.7): the two cameras look opposite
  ways down one cavity, so only one of them can match the attic. Inside was chosen because the pull-back to the
  Voyager frame starts there. To flip, move the crack to the other wall (swap the sign of x in layout.js).
- In WL_in the camera sits 2 cm above the sheet, so the mask is a wedge under the diagonal (as in AD_mote), not a
  thin band; in WL_out it is a thin band.
- "Inside?" (dark) is WL_out with the light off: same camera, no separate shot.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- `beam.js` is now a re-export of `layout/sets/_beam.js`; `build.js` imports `../_cast.js` (the engine's `littleJade`, see `layout/CAST.md`). Renders re-made after the engine's left-hand fix; the three masks are pixel-identical to before.

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- WL_out 1:37.4-1:45.5 and 1:45.5-1:51.0, WL_eye 1:40.7-1:45.5 ("I honestly don't know"), WL_in 1:51.0-1:54.5 ("Nowhere to
  go" into the tail).

## 2026-11-26: hold pass
- w3 ('clasp'): the hands hold each other, not an object. Both hands are now 'relax' (were 'grip', which the hold check
  read as gripping something, and found nothing within 3 cm). No hold to check.
