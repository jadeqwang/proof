# Layout department notes (checkpoints)

## 2026-11-17 checkpoint 0
- Read TREATMENT, shots.yaml, brainstorm (Characters, Art direction, Section by section), PIPELINE_RECON s5,
  moongazing guanghan3d + blockouts harness (playwright-core + swiftshader Chrome, importmap three, data-URL PNGs).
- Plan: layout/engine (core, mannequin, book, renderer), layout/sets/<set>/{layout.js,build.js,shots.js},
  layout/render.mjs CLI, sheets via ImageMagick montage. $0, no generation.
- Attic orientation: ridge along x; door gable at x=-3.5 (left when looking -z), window gable at x=+3.5 (right);
  mats heads at -z under the low slope; main "front" camera looks -z from +z (foot of the mats).
- Neon sign hung 1.2 m outside the window gable, parallel to it, so light enters near-horizontal and reaches the mats.

## checkpoint 1 (attic88 first full pass)
- Engine done: engine/{core,mannequin,book,stage,aim,render,main}.js; render.mjs CLI; review.sh / sheet.sh helpers.
- Cameras: `orbit` around named points (face-relative az) + `aim` (screen placement) solved at build time; `headAt` to
  slide a figure so its head lands on a point; `ray:<point>:<d>` targets put hands on the neon ray (shadow lands on point).
- Lessons: POV inserts need the reader's head hidden (hideParts) and el >= 60 or the torso fills frame; close-ups
  must check `blocked_by` (sidecar warnings); 5-year-old arm reach is ~0.43 m -> she kneels/lies next to the book.
- Neon effective point raised to y 1.5 (sign 1.2 m outside, window 0.8x0.8) so the light reaches faces and rakes the
  page at ~22 deg; hand shadows land on the page only when hands are within ~0.1-0.2 m of it.
- G4 physics: the finger-ring's shadow is ~1/4 the size of the head-shadow (ring 4 cm vs head 19 cm, both near the
  page); it cannot encircle it. Staged so it lands on the head-shadow's brow; flagged for the compositor.

## checkpoint 2 (bed26 first pass)
- bed26 built: room 3.4 x 3.2 x 2.6, toddler bed on the right wall (mattress top 0.33), window + blind on the back wall,
  bookshelf left, nightstand. Flashlight = prop + spot (17 deg) placed by `flashlight {aimAt, from|at}`; hands grip
  it via 'flash:grip'; 'ray:' targets in this set point at the flashlight lens.
- POV inserts (I2, I4b, J1) use Jade's hidden head, el ~64.

## checkpoint 3 (all three sets rendered; docs)
- car26 built: SUV cabin with named panes, rear-view mirror angled at the child seat, streetlights from lampsAt(t).
  True reflections (F4a rear-view mirror, F6b side window) rendered by reflecting the world root and compositing
  through the glass pixels; F4a camera found by grid search so both faces land in the mirror.
- Renders: attic88 23 shots, bed26 8, car26 8, five modes each + sidecars; sheets in media/layout/_sheets/.
- Docs: layout/README.md (how-to + sidecar schema), docs/LAYOUT.md (one line per shot).
- Open: hands are mitts (shape only); G4 ring/head-shadow scale (physics); G4 hides Mama's head (lip-sync face
  off-screen in that framing); POV inserts show the reader's body edge; lit preview is a mood check only.

## checkpoint 4 (v3: re-blocking after the director's review; docs/LAYOUT_V3.md)
- v1 guides untouched (B2, A1, I1, F1 line renders re-rendered and compared: 0 px difference). v3 setups are separate
  shot tables `sets/<set>/shots_v3.js` (ids `v3_*`, flag `v3: true`), loaded after shots.js; build.js branches on `shot.v3`.
- Neon: blade sign (`SIGN_V3`), five placements compared. A blade clear of the glass is invisible from the door end;
  the one in front of the far third of the window (z -1.0) is both visible in A1 and lights the lower mats. The light
  for a shot = centroid of the blade area its subject sees through the window (`neonSource`), about 1.8 m from the page.
- Storytime place moved into that beam: lap base (2.6, -1.5), yaw -18. Turning the pair away from the window raised
  the light on the tipped page from 15 to 35 degrees; holding the window-side corner from underneath keeps Mama's
  forearm from shadowing the page.
- Lap pose + eight cameras in `engine/lap.js`, shared by attic88 and bed26 (cameras in the mother's body frame:
  `orbit.relBody`). Push end = on the spread normal, `levelRoll` squares the page; it ends inside the child's head
  (heads hidden in that guide).
- Hand shadows: cut-out card of the traced silhouette (`assets/monkey_silhouette.json`, `engine/props.js`), held
  parallel to the page; `handShadows()` writes hand / light / polygon per caster. Offsets and soft edges in LAYOUT_V3.
- Car: two child seats. A child behind the front passenger seat cannot be seen from a low centreline camera forward
  of the seatbacks; F1 / F3a / F5 sit under the headliner.
- Open: G4 ring shadow is not physical at that height; v1 L1 no longer follows from the lap blocking; E5 not staged;
  `docs/shots.yaml` A1 still says the lettering is mirror-reversed.

## 2026-11-22 integration pass over the "Proof" sets (checkpoint; details in CAST.md and each set's NOTES.md)
- Left hands: `engine/mannequin.js` `handFrame()` maps hand points with the basis vectors (t, f, n) instead of a quaternion
  (a left hand's basis is a mirror; basisQ gave a NON-UNIT quaternion, so left hands were both mis-oriented and ~15 %
  small). `engine/body.js` hand5 uses it too. `fixLeftHands` in shanghai86/office91 `common.js` is now a no-op.
  attic88 (v1/v3/v4) renders differ only at left hands and the shadows they cast (97 shots diffed, line mode).
- Cast: `sets/_cast.js` is the one table (see `layout/CAST.md`); `spec.costume` (engine) for per-shot looks.
- Beam masks: `sets/_beam.js` is the one beam file (the four set-local beam.js re-export it). New: prismSolid, coneSolid,
  splitAtTop, clipFaces, applyBeamMask (surface-in-volume shader + white volumes), maskTwins(BASE, { surf }).
  `engine/render.js`: a look may carry its own `material` for flat/label. `sets/_sheet.sh <set> [modes]` = shared sheets.

## 2026-11-25: articulated mannequin
Goal (director): much more detailed, articulated mannequins before anything goes to the image models: five fingers with
three phalanges and real knuckles, an opposable thumb (CMC, MCP, IP), a shoulder girdle so arms grow out of the torso.
- Plan: new `engine/hand.js` (hand shapes as per-joint angles + per-shot overrides, thumb-to-finger contact solver,
  five-finger geometry), new `engine/anatomy.js` (tapered limbs, merged geometry, torso/girdle/feet), `buildFigure`
  rebuilt on them with the SAME pose solve (palm-centre target, wrist = target - 0.26 Lh along the fingers, IK, anchors).
  `render.js`: meshes may share a line-mode id (`userData.idGroup`) so the phalanges / arm segments of one limb read
  as one surface (no seam rings), while shadows and hulls still see separate meshes.
- Baseline: line + flat renders of the ten sets copied before any change (scratchpad `before/`).
- Checkpoint A (engine done, first pass): `engine/anatomy.js` (taperGeo sphere-cones, sweptGeo torso along a Bezier
  spine with the frame slerped pelvis -> chest, palmGeo superellipsoid, mergeGeos, partMesh + idGroup),
  `engine/hand.js` (HANDS as joint angles, resolveHand overrides, thumb `touch` solver, buildHand, handFrame moved
  here; mannequin.js re-exports HANDS / handFrame / resolveHand / buildHand). `body.js` hand5 now calls buildHand.
  render.js: `userData.idGroup` -> shared line-mode id. Child hand lengths 0.10 -> child3 .112, child4 .111,
  child5 .11, child7 .107, child10 .106 (of height; published hand-length norms). Test set `sets/mtest/`.
- Lessons: coincident surfaces of two id groups z-fight into zigzag lines (thumb MCP, sleeve edge at the elbow):
  the outer part must enclose the joint (radius x1.1). Clavicle as a chain of tubes reads as a bead necklace: one
  straight half-buried bone is enough. Armpit folds on a hanging arm stand off the chest: scaled by arm elevation.
- Checkpoint B (sets): rendered the nine sets twice (after the hand/body pass, then after the clavicle fix); sheets
  rebuilt with `_sheet.sh`. Engine additions found necessary in the sets:
  - arm `tip: { finger, at, off }`: the engine solves the palm so a fingertip lands on a point. kitchen90 K5: the
    thumb TIPS now sit on her cheeks, palms against the sides of her face, fingers up to the temples (the old palm
    targets put the mitts' thumbs across her chin; now visible as such with real thumbs).
  - arm `hold: { r, h, label, prop, centre, axis }`: a cylinder across the palm that the fingers and thumb wrap
    (chord-per-phalanx wrap solve, thumb goal solve). mv10 `cupArm` holds a real cup (`cup of lemonade`, fingers
    'fwd', palm 'in'; was fingers 'up' round nothing: the old mitt only read as a block). market93 mamaGrab /
    mamaLead: `hold: { r: 0.027, prop: false, centre: true, axis: along her forearm }` so the hand closes ON the
    forearm (it sat under it with the fingers along it).
  - kitchen90 build: the pencil runs through the pinch (index/thumb tips), slanting back over the hand (was a fixed
    offset from the palm, made for the mitt).
  - Clavicle: sternal end sunk, acromial end tucked in (read as breast-like arcs / shoulder knobs on the children).
- attic88 (not one of the ten): v4 setups (engine/body.js) dry-rendered to scratch only: they build, new hands.
- Done (2026-11-25 15:05): the ten sets re-rendered (shots + beam masks), sheets rebuilt, `python3 layout/gallery.py`
  (10 sets, 100 shots). shanghai86 was being rebuilt by another agent while this ran (build/layout/shots/paper.js
  changing at 14:57-14:59); it was re-rendered from whatever was on disk at 15:00 and its geometry was not touched.
  Render times unchanged (0.1-0.8 s a mode). Test sheets: media/layout/_sheets/mtest_{line,flat}.jpg and
  mtest_hands_{line,flat}.jpg (`sh layout/sets/mtest/sheet.sh`).
- Still open: hands at wide-shot scale fill in as dark blobs in line mode (fingers 1-2 px wide; unavoidable at that
  size); the raised-arm armpit fold draws a small flap line; AD_keys / AD_piano are flat hands as staged (a curled
  "tapping" hand would be a staging choice: hand: { shape: 'relax' }).
