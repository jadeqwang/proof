# basement90 — Decatur basement, 1990 (verse 2b 2:16, "Good catch!" 2:21)

## 2026-11-25 night, keyframes r3 (Jade's r2 review: B3 hand, pretend lick)

- **B3_finger camera** az 165 / el 34 / 0.68 m -> az 168 / el 50 / 0.55 m (still over her left shoulder, now from above):
  at the old height the back of her head hid the whole hand except the index tip; Jade asked for the fully articulated
  hand. Now the forearm, the back of the hand, the extended index on the glass and the three curled fingers + thumb all
  show in contour/form, the word marker just right of the fingertip, Dad's head at the right edge.
- **Pretend lick (B4, B5).** `GROOM.wrist` moved from 2.6 cm to 5 cm in front of her lips (and 1 cm lower): she only
  PRETENDS to lick (Jade: tongue not touching). The paw now has a visible gap to the mouth in B4 and B5. Intents updated.
- **B2 gaze:** the head already looks at `word` (her fingertip is on it); the camera sits just behind the glass, so her
  eyes on her fingertip look almost into the lens, a little to frame left and down. No set change; the prompt now says so
  (the r2 paint had her eyes off to frame right).
- **B4 height:** jade7 is 1.22 m (`_cast.js`), within 7-8 years (~1.2-1.3 m); unchanged.
- Re-rendered the whole set (all modes, beam masks, painter guides).

## Socks, slippers, more ambient, 2026-11-25 late (supersedes "bare feet" and the CEIL/AMB values below)

Jade: "7-8 year old Jade in the basement should be wearing socks, and her dad should be wearing socks and slippers in
all those scenes." And: "the basement should have higher ambient light, in addition to the visible shadows, so the image
models can tell what's going on."

- **Costume** (`house.js`): `JADE_BASEMENT` (was `BAREFOOT`) = summer top, short sleeves, sock 0xeeeae0; `DAD_BASEMENT`
  = sock 0x74767c; both on every basement figure spec (`shots.js`). `FOOTWEAR` lists the set-local meshes per cast key.
  **ASSUMED, flag to Jade:** her socks plain white cotton crew socks; his socks mid grey; his slippers plain brown
  (0x5a4434) felt slip-on scuffs, backless (the grey sock heel shows), thin sole. Alternatives: closed-heel felt
  slippers (`slipper.open: 0`), or the cloth/plastic house slippers many Chinese households used.
- **Engine has only a sock colour** (`costume.sock` on its foot mesh), no shoes, no cuff. Built set-locally in `kit.js`
  `footwear(fig, spec)` (engine untouched; `build.js` adds it after `stage()`): a sock shell 2 mm over the engine foot
  (own colour and flat grey), a sock cuff tube 6 cm (her) / 7 cm (him) up the shin, 3 mm proud of the trouser leg
  (radius from the engine's leg arithmetic: 0.019 / 0.036 H girthK), one line-mode id group per sock so only the cuff
  top draws; the slipper = a sole traced from the foot's footprint + a vamp arching over the foot from 42 % of its
  length to the toe, fitted by raycasting onto the engine foot surface (6 mm wall), closed to a point at the toe.
- **Looked at:** B1 line: two white socks with a clean cuff line over her trouser hems on the spokes; Dad's brown scuff
  behind, the opening edge reads. A close test camera on Dad's feet (removed): scuff, open heel, sock cuff all read.
  Known: the engine's heel is a ball, so his sock heel bulges behind the scuff; a small notch at the slipper toe tip.
  B0_wide: feet tiny but present. B4 / B5: feet out of frame (no change needed).
- **Ambient** (`build.js`, lit mode): `CEIL_LIT` 3.2 -> 3.6, `AMB_LIT` 0.7 -> 1.35, new shadowless warm
  `HemisphereLight` fill 0xffe2bc / 0x4a4036 at `FILL_LIT` 1.0 (per-shot `light.fillLit`). The bulb still casts
  soft shadows; the screen spot (unchanged, 5) stays the cool key at the desk. Flat mode unchanged.
  Looked at: B0_wide every surface reads (stair, heater, joists, desk, chair); B4 two-shot, desk and joists clear;
  B3 the monitor, printer, PC and both heads read; B5 face, paw and desk; B2 the room behind them now reads.
- **B2 far 4 -> 7:** the far plane was cutting the front wall / stair (it rendered as the black lit background). B2's
  faces still clip toward white in the screen key at 0.3 m (pre-existing; the screen spot is untouched).
- Painter brief (`media/keyframes/r2/_brief_r2.md`) has the costume line. Conflicts not regenerated: lj07 sheets
  (A/B/C/H sidecars) say "bare feet" and "dark navy stirrup leggings"; Dad v5 A/B say "brown leather shoes"; the plan
  (Verse 2b row) and old B1 prompts say "bare feet".

## Ceiling light, 2026-11-25 (round 2 answers; supersedes "the only light" / "bare bulb off" below)

Jade: the B4 double-take image is too dark, she can't see what is going on; the basement had more ambient light from a
CEILING LIGHT. The screen stays the beam (the masks are unchanged and screen-only); the bulb is the room's ambient.

- **Fixture (ASSUMED type, flag to Jade):** a bare 60-75 W incandescent bulb in a white porcelain pull-chain lampholder
  on a junction box nailed under a joist, the stock unfinished-basement light of the period. Alternative if she
  remembers it differently: a two-tube 4 ft fluorescent shop light (cooler, flatter, buzzing). `ROOM.bulb` moved to the
  joist at x 0.33, z -0.45 (in front of the desk, between the desk and the open floor), bulb centre 1.97 m (`BULB_P`);
  ON in every shot. `shot.light.ceiling: false` turns it off (falls back to the old dark rig).
- **Rig:** lit = warm point light 0xffd9a0 (same colour as kitchen90's pendant bulb), `CEIL_LIT` 3.2, soft shadows, plus
  a warm bounce ambient 0x6a5a48 at `AMB_LIT` 0.7 (was a near-black trace 0x0a0c18). The screen spot is unchanged, so
  the desk, the keyboard and the faces turned to the glass still go blue against a warm room. Flat = a white point
  light at the bulb (0.8) with ambient 1.0, replacing the old directional fill. Sidecar `lights` lists both.
  Per-shot overrides: `light.ceilLit`, `light.ambLit`, `light.ceilI`.
- **Looked at** (lit): B4 now reads as a two-shot (Dad's face, her paw at her mouth, desk, joists); B0_wide shows the
  fixture and the whole room; B1 feet readable (the desk still shadows the near foot); B5 her face and paw lit warm with
  the blue screen edge; B2/B3 unchanged in feel (screen-dominated). B0_plan hides only the pull chain now (the fixture
  shows as a dot). Beam masks re-rendered, unchanged.
- **Painter note:** the keyframe B4 (round 2) was painted from the dark render; repaint from the new lit render.

Beam: the CRT screen, the only light. `layout.js` holds every number; `house.js` holds what is shared with `kitchen90`
(same plan coordinates; the kitchen is directly above x -1.8..1.8; the stair door in the kitchen's left wall opens onto
this set's top landing). `kit.js` = set-local helpers used by both sets.

Render: `node layout/render.mjs --set basement90` -> `media/layout/basement90/` (sheets: `_sheet_<mode>.jpg`).

## Assumptions (the plan leaves these open) — room layout SUPERSEDED by "Layout from Jade's diagram, 2026-11-26" at the end
- Unfinished basement 4.7 x 4.2 m, 2.3 m clear, exposed joists, block walls, night (hopper window dark). [SUPERSEDED
  2026-11-26: the stair runs along the FRONT wall; the bulb is on.]
- [SUPERSEDED 2026-11-26: the desk stands free mid-room, Dad on its front side, screen facing +z.] Horizontal desktop PC with a 14 in CRT on top, dot-matrix printer.
  Screen glass 27 x 20 cm, centre 1.085 m high.
- Desk is open on its LEFT side (two legs), drawers on the right: the cat under the desk is shot from the left.
- Jade (7, 1.22 m) stands on Dad's LEFT, on the two left spokes (one foot forward, one back), leaning over the desk
  edge and pointing with her RIGHT hand. Reason: the engine builds left hands from a left-handed basis, so a left
  hand's finger direction cannot be controlled. If she should be on his right, mirror DESK / CHAIR.spoke0 / WORD.
- THE WORD is on line 6 of 14, left of centre (`WORD`); screen text is drawn as bars, no invented code.
- "Double take": Dad has rolled back 14 cm and swivelled about 40 deg to his left, hands still over the keys.
- Cast registered from the set (`house.js`), not by editing the engine: `jade7` (1.22 m, proportions `child7`, bare
  feet), `dad` (1.75 m), `mama90` (Mama without the apron).

## The beam (for the mask)
- `BEAM` in layout.js: area source = the screen rectangle, axis +z tipped 5 deg down, half-angle 62 deg, range 2.6 m.
  `beamFar()` = far rectangle of the frustum; `deskTerminator(y)` = where the desk's front edge cuts the light.
- On the floor the desk shadow ends at z -0.97 and the floor is fully lit from z -0.63 (penumbra between). Everything
  under the desk is unlit, which is the point of the cat shot.
- Sidecar key `beam` (source corners, far rect, floor lines, all in px and world), `word` (centre + underline ends),
  `chair` (hub, spoke tips, where the feet stand), `panes.screen`. Lit mode shows the volume faintly; label mode
  draws the two floor lines in dark blue.

## Known limits
- B1: her feet are in the desk-edge penumbra; the foot nearer the desk is dark. Physics, kept.
- B2 is shot from 0.3 m BEHIND the glass with monitor and computer hidden (a camera on the glass cannot hold the
  fingertip and the face). The glass edge and the word stay in frame as a thin rectangle.
- B3: fingertip is 1.9 cm from the word centre (sidecar `contacts`).
- Hands are mitts; feet are slabs.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** The engine now builds left hands exactly, so the "right hands only" rule in `shots.js` is no longer needed; no pose was changed.
- **Cast.** `jade7`, `dad`, `mama90` come from `../_cast.js`. Dad is now 1.72 m (was 1.75): his seat and legs are computed from the cast entry and followed. Her bare feet and short sleeves are a per-shot costume (`BAREFOOT` in `house.js`, engine `spec.costume`), not a second cast entry. `jade7` uses the shared `child7` proportions (hand 0.100 of height, was 0.102): the fingertip in `B3_finger` moved by under 2 mm.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set basement90 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/basement90_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (the screen's frustum to beamFar(), clipped by the room; over the desk's width nothing below the plane through the top of the screen and the desk's front edge), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: B0_plan shows the frustum with the desk's shadow cut out; B1, B3, B4, B5 show the lit figures and floor. `B0_wide` is white over the whole frame in `beam_` (the glow's far face fills the view) and useful in `__surf`.

## "Good catch!" restaged, 2026-11-25 late (Jade's decision-page answer; supersedes the cat-under-the-desk notes above)

Jade: replace "she is already a cat under the desk" with: she holds her RIGHT hand in a fist and pretends to lick her
wrist, imitating a cat cleaning itself. She does NOT hide under the desk (that reads as fearful body language).

- **New pose** (`jadeGroom` / `GROOM` in `shots.js`): she has hopped off the spokes and stands barefoot on the open floor a
  step to Dad's left (pelvis [-0.25, -0.85]), yaw 70 (three-quarter toward Dad and the open room, her right side toward
  the cameras), in the screen light (face and paw lit; feet in the desk-edge penumbra, like B1). Right hand `fist`,
  forearm raised from an elbow low at her side, the fist jutting FORWARD from the wrist like a paw (drooping a little,
  palm down), the back of the wrist at her lips (wrist centre 2.6 cm in front of the `mouth` anchor; sidecar `contacts`
  in B5 report mouth / wristR / handR with their world positions). Head bowed about 35 deg to the paw and cocked 20 deg
  to her right; spine bent 10. Left arm at her side. The tongue is not modelled: paint it touching the wrist.
- **Dad's double take**: unchanged (rolled back 14 cm, swivelled to his left, hands still over the keys), except that his
  head now looks at her eyes instead of at the empty spokes; she stands almost exactly where he used to look.
- **B4_doubletake** (time kept, 2:21-2:22.5): camera moved to the open floor front-left (pos [-0.35, 0.92, 0.45]), a
  two-shot: Dad three-quarter (35 deg off the lens) at frame right staring at her; her at frame left, the paw at her
  mouth against the lit monitor (in the lit render she is a near-silhouette against the screen glow).
- **B5_cat** (id kept so filenames and references stay valid; time kept, 2:22.5-2:23): close, 40 mm, level from her
  front-right (60 deg off her facing, 3 deg below the mouth) so the paw reads as a silhouette in front of her chin in line
  mode. Was: floor level under the desk.
- Assumptions (flagged): standing rather than kneeling or sitting on her heels (standing in the open is the clearest
  not-hiding read); the paw juts forward and licks the back of the wrist (a kid's cat imitation), not the inside.
- Looked at: B4 and B5 in line, lit, label and the beam masks (both figures inside the glow). Debug views from four
  azimuths were used to choose B5's angle (a pure profile loses the face under the bob; a frontal view puts the paw
  over the chest).

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- B1_feet 2:16.1-2:17.2 ("Basement" sung 2:16.1, after the market's last beat), B2_face 2:17.2-2:18.3, B3_finger 2:18.3-2:19.8
  ("I point to one he missed"), B4_doubletake 2:19.8-2:21.4 (band stop 2:19.8), B5_cat 2:21.4-2:22.2; then kitchen90.

## Layout from Jade's diagram, 2026-11-26 (supersedes the room layout above: desk against the back wall, stair at left, shelf / heater)

Source: `inputs/diagram_basement.png` (plan, top = back wall). Room unchanged, 4.7 x 4.2 m (x -2.9..1.8, z -2.1..2.1).

- **Desk group moved as one** (`layout.js` `GROUP = { dx: -1.624, dz: 1.05 }`, helper `gp()`): desk, PC, printer,
  chair, both figures' poses (`KEYS`, `CHAIR`, `CHAIR_GC`, Dad's left hand, `GROOM`, her left hand), the ceiling bulb and
  the B1 camera are old position + GROUP; B2, B3, B5 are figure/screen-relative and followed by themselves. So the
  blocking, the beam (`BEAM`, `beamFar`, `deskTerminator`) and the bulb's light on the figures are unchanged relative to
  the figures. New desk x -1.624..-0.224, z -1.03..-0.33 (29-57 % of the width, 25-42 % of the depth), Dad's chair
  [-1.024, -0.07], screen centre [-1.024, 1.085, -0.578], bulb [-1.294, 1.97, 0.60] (under a joist, between Dad and
  the stair), floor desk-shadow lines z 0.08 / 0.42. Empty floor behind the desk (1.07 m to the back wall) and left of it
  (1.28 m to the left wall), as drawn ("empty space").
- **Desk depth: ASSUMED compromise, flag.** The sketch has the desk at 44-60 % of the depth and Dad at 65 %; here the
  desk is at 25-42 % and Dad at ~48 %, 0.55 m further back. Reason: B4 (and B5) are shot from the open floor in front
  and to Dad's left, which in Jade's room is where the stair is. At the sketch depth (dz 1.6, tried and rendered) the B4
  camera lands under the flight (the room-side stringer crossed Dad's face) and B5 under the treads; cameras ON the
  stair gave a wall of treads. At dz 1.05 B5 keeps its exact framing in front of the stair and B4 needs only a small move.
- **B4 camera:** was 24 mm at old [-0.35, 0.92, 0.45]; now 22 mm at [-1.80, 0.95, 1.22] (pulled ~0.3 m in along its own
  line, 6 cm short of the stair's room-side stringer at z 1.28). Same two-shot: Dad three-quarter at frame right, her
  in profile with the paw at frame left, joists above; the wringer washer now shows behind Dad at frame right.
- **Stair** (`house.js` `HOUSE.stair`, `landing`): one straight open-riser flight along the FRONT wall, z 1.3..2.1
  (0.8 m), 12 risers of 0.217, treads 0.23, top at the left wall (x -2.9), descending toward +x, foot riser at x -0.37
  (53 % across, as drawn). Two stringers, a wall rail on the front wall (ASSUMED; the room side is open so the cameras
  see under it). Top: landing at kitchen-floor level x -2.9..-1.8, z 0.45..1.3 (beside the kitchen, behind the flight),
  with a guard rail along its front edge; the top tread is entered sideways from the landing (a quarter turn, ASSUMED).
  Ceiling: subfloor + joists over the whole basement now (the old open strip at left is gone), except the stairwell
  opening over the flight up to x -0.6 (header at z 1.3, trimmer at x -0.6) for headroom.
- **Kitchen door moved** (`HOUSE.stairDoor` z 1.05..1.85 -> 0.5..1.25, 0.75 m wide) so it opens onto that landing (the
  old spot is now over the flight). kitchen90 re-rendered; visible changes only in K0_plan, K0_wide_night and
  K8_glass (the reflected door edge behind Mama shifts ~45 px, the knob is now hidden behind her); every other K shot is
  pixel-identical (K1_question_wide: a label nudged only).
- **Known inconsistency, flag:** for headroom the stairwell opening reaches under the kitchen's front-left corner
  (x -1.8..-0.6, z 1.3..2.1). kitchen90 does not model it (it is open kitchen floor there; K1's camera at z 2.0 and K7's
  at [-1.0, 1.25] stand near it). Not changed, to keep Jade's kitchen keyframes. In the basement set the opening is
  closed off above by `stairwell wall (kitchen corner above)`.
- **Post:** `ROOM.column` -> [-0.09, -1.13], just beyond the desk's back-right corner; the main beam now runs along x
  over it (perpendicular to the joists).
- **Washer, ASSUMED type, flag:** a 1950s round-tub wringer washer on four legs with casters (white enamel tub 0.6 m,
  rim at 0.92 m, agitator, motor box under, power wringer: two rubber rollers in a frame on a post at the tub's back,
  top ~1.27 m), centre [0.52, -0.62], a gap past the post. No dryer. Alternative: a 1950s enamel top-loader box.
- **Watermelons:** two whole oblong melons on the floor front-right, [0.66, 0.86] and [0.74, 1.33], 43 / 41 cm long,
  25 / 24 cm wide (about 20-25 lb each), long axis along z, dark green; stripes are left to the paint (no texture).
- **Removed (flag):** the steel shelf, its boxes, the water heater and the modern washer at front-left: the diagram draws
  nothing else. Kept: hopper window (back wall), joists, block walls, ceiling bulb.
- **B0_plan** ortho width 6.4 -> 8.4 (the whole 4.2 m depth now fits); hides the stairwell walls, landing and guard rail.
  **B0_wide** new: 16 mm from the front-right corner [1.6, 1.4, 1.95] over the melons: stair along the front wall at
  frame left, desk with Dad and Jade, the floor behind it, post, washer, hopper window.
- Headers / intents updated (B0_plan, B0_wide, B4). Sidecar warnings: none.
- **Looked at:** B0_plan beside the diagram (desk, post, washer, melons, stair all in place; desk higher on the page as
  above); B0_wide / B1-B5 in line, lit and form; the beam-mask sheet. B1: same framing, the desk leg at left. B2: the
  stair now shows behind her as a diagonal. B3: unchanged framing (fingertip 2.1 cm from the word, was 1.9). B5:
  identical framing. Known: the beam masks' volume is not occluded by the stair (B0_wide's mask runs over it).
- Renders: `media/layout/basement90/` (all modes, painter guides, beam masks), `media/layout/kitchen90/` (same),
  sheets in `media/layout/_sheets/`. The r3 review page keeps showing the pre-change guides: they were copied to
  `media/keyframes/r3/_layout_snapshot/{basement90,kitchen90}/` first and `tools/kf/r3_page.py` `LAYOUT_SNAPSHOT` points
  there (page rebuilt, 0 missing images, localStorage key unchanged).
- **Repaint:** every basement keyframe B1-B5 (the room behind them changed: stair, post, washer, no shelf / heater;
  B4's camera moved). Kitchen: K8_glass only if the reflected door edge matters.

## 2026-11-26: round-3 decisions (plan agent)

- **Ceiling light type, decided (Jade, round 3):** "a bare bulb in a porcelain pull-chain holder". The set already models
  exactly this (`build.js`: grey junction box under the joist, white porcelain lampholder, bare bulb, pull chain), so
  nothing moved and nothing was re-rendered. Only the "ASSUMED type" wording in `layout.js`/`build.js` comments and the
  `LIGHTS.ceiling.kind` string changed; the render sidecars (`media/layout/basement90/*.json`) keep the old string until
  the next render (B1-B5 are re-rendered for r4 anyway).
- Small, not changed: the bulb is an ellipsoid 60 x 78 mm (an A19 is about 60 x 110 mm, with a neck), and the chain is
  0.45 m. In B0_wide only the chain shows (top edge); the other B shots were not checked frame by frame, but the bulb sits
  above and in front of Dad, mostly out of their frames. If a shot ever frames it, make the bulb A19-shaped and the chain ~0.3 m.

## 2026-11-26: round-3 decisions: young Jade's arms (B2, B4, B5; B1 and B3 checked)

Jade: "in the basement scene, it really messes up kid Jade's arm." The r3 paintings were compared with their guides
(`media/keyframes/r3/_layout_snapshot/basement90/*_form.png`). Only `shots.js` changed: no engine, no house geometry,
so kitchen90 was not re-rendered. The engine is mid-rewrite (figure guides v2 behind `--gaze`). These renders use
the default path, which was checked pixel-identical to HEAD's engine on B5.

- **B2_face (camera).** Before: 24 mm, 0.3 m behind the glass at its left edge (her side). Her right arm pointed
  straight at the lens, in front of seated Dad's chest; the foreshortened hand was about twice the size of her face,
  and the painter attached the arm to Dad. Now: 35 mm at `screenPoint(2.0, -0.2, -0.45)`: still behind the screen
  (monitor and computer hidden, the glass edge kept as a frame), but 0.27 m past the glass's right edge on Dad's side
  and a little high. Her right arm now lies across her OWN chest: shoulder, short upper arm, elbow, forearm, and the
  fingertip on the glass under her face, a child-sized hand. Her eyes are on the word. Dad's face and shoulder are at
  frame left, beside and behind her; her shoulder still touches the edge of his torso silhouette, but the arm no longer
  crosses it. Pose unchanged (B1 and B3 share it). Rejected: cameras on her outer side (the arm still runs over Dad's
  chest and her head hides her shoulder), above, below, and showing the monitor (it hides the fingertip).
- **B5_cat / B4_doubletake (pose `GROOM` / `jadeGroom`).** Before: the elbow was pushed forward at chest height, the
  forearm vertical, the fist sticking out level at a right angle, and the upper arm 60 deg forward. Now: a child's
  cat paw. The elbow pole points down and out to her right side; the upper arm runs down and forward; the forearm
  rises diagonally up and INWARD to the wrist in front of her chin; a looser fist (`PAW`: the fist curled about 15 deg
  less) droops forward-down from a wrist bent about 75 deg. The head is bowed to a look point 0.66 m high, 0.5 m
  ahead (was 0.72 / 0.55), with spine bend 12 (was 10), so the mouth comes down toward the paw.
  The wrist is targeted from `self:mouth` (`R.to: 'self:mouth', off: GROOM.palmOff`): the wrist centre is 4.5 cm in
  front of and 2 cm below the mouth anchor (4.9 cm away). From the B5 camera that leaves a clear gap of a finger-width
  or more: she only PRETENDS to lick. `GROOM.mouth` was read back from the render (sidecar contacts: 0 cm).
  Checked from front, side, three-quarter, above and both cameras: upper arm, elbow and forearm each read.
- **B5 camera.** Same angle (az -60 from her face, el -3), pulled back 0.85 -> 0.95 m, mouth at v 0.33 (was 0.4).
  This keeps the shoulder nearest the lens less dominant and gives the lowered paw and the elbow room in the frame.
- **B4.** Camera unchanged. She is seen from behind her right shoulder. Her upper arm, elbow and paw read, but from
  this angle her forearm still projects nearly vertical (its inward slant runs away from the lens). Acceptable in a
  wide two-shot; flagged.
- **B1_feet:** no arms in frame. **B3_finger:** checked. The forearm and the articulated hand on the glass come from
  behind her own head; the r3 painting reads correctly. Unchanged.
- **Engine-side, not fixable here (see `work/arm_engine_notes.md`):** child limbs are about 35-45 % too thick (`girthK`
  1.118 on `rS` and the deltoid, plus the x1.12 short-sleeve shell). That is the "fat tube with a shoulder ball" at
  B5's close camera, still visible after the pose fix. There is also no wrist-flexion limit.
- **Flag, wardrobe:** the guides give her short sleeves (`JADE_BASEMENT.sleeves: 'short'`), but every r3 painting gave
  her a long-sleeved grey sweater. Not changed: it is a costume question for Jade. Long sleeves would also remove the
  sleeve shell and the seam ring on the upper arm.
- **Repaint in r4:** B2_face (new camera), B4_doubletake and B5_cat (new arm pose; B5 framing pulled back). B1 and B3
  need no repaint for the arms.

## 2026-11-26 afternoon: r4 set fixes (Jade's r3 review: B1 chair/feet, B2 eyes, B3 arm/floppies/screen, B4/B5 lick)

Re-rendered first (the sweater, `JADE_BASEMENT.sleeves: 'long'`, now shows in every guide), then the fixes below.
The r3 page still reads `media/keyframes/r3/_layout_snapshot/basement90/` (snapshotted earlier; not touched).
Note for whoever renders next: the default `render.mjs` modes do NOT include the painter guides; run
`--modes form,contour,light --nojson` too (the guides were stale from 10:56 until this pass).

- **Chair (B1, Jade: "look up detailed models of actual chairs").** `kit.js swivelChair()` rewritten, numbers in
  `layout.js CHAIR`: a plain c. 1990 armless secretarial / task chair. 26 in (66 cm) five-star base (spoke radius
  0.33 m), each leg a tapered rounded beam (new `loft()` helper: rounded-rectangle sections) 6.6 cm wide / top 12.2 cm
  at the hub, 4.8 cm / 8.8 cm at the tip; hub 7 cm; under each tip a socket boss, chrome swivel stem, a hood and two
  50 mm wheels trailing 2.2 cm outward; a three-step black telescoping shroud over a chrome gas piston; a steel tilt
  plate with tension knob and height lever; seat 46 x 44 cm, plastic under-shell + foam cushion with a waterfall front;
  steel J-bar to a separate curved backrest. References (modelling only, no image went to a model): current
  replacement-base listings (economy bases 24-26 in, 28 in standard, 2 in hub bore, 2 in hooded dual-wheel casters:
  walmart.com/ip/17368615490, vevor.com office-chair-base category, quill.com Duet caster) and vintage listings
  (chairish.com Steelcase swivel-tilt c. 1970s; 1stdibs Herman Miller five-star task chair). **Colours ASSUMED, flag:**
  black glass-filled nylon base and casters, charcoal blue-grey tweed upholstery (0x4e5664), black steel. Alternative:
  polished-aluminium base, brown or burgundy fabric.
- **Her feet (B1).** `FEET` now at 0.21 m from the hub (was 0.29, where the legs are narrow); `jadeOnSpokes()` puts
  each foot's weight point (0.3 foot lengths ahead of the ankle, between heel and ball) square on top of its leg
  (`legTop(r)`), sole 3 mm (the sock) above it. Both feet visibly stand on the base in B1 (checked from front, side
  and B1). The engine points feet along her body yaw, so each foot crosses its leg (heel and toes overhang).
- **Eyes (B2, B3).** Her head looks at `WORD_TIP` (layout.js), which is exactly where her index fingertip is placed
  (`R.tip: { finger: 'index', at: WORD_TIP }`; sidecar B3 contacts: 0.0 cm). The pupils still look straight ahead in
  the default engine path (dot eyes); the engine gaze switch will aim them at `P.lookAt` = this point.
- **Arm (B3, Jade: "not coming out of her shoulder at the correct angle").** The arm was a straight reach running
  directly under her bowed head, so from over her left shoulder it seemed to start at her face. Now: spine twist -8 ->
  +10 (the reaching shoulder leads), the fingertip placed by `tip`, finger along the shoulder-to-tip line, elbow toward
  `elbowAt` low under her own chest (not out toward Dad); B3 camera az 168 / el 50 / 0.55 -> az 180 / el 72 / 0.65
  (from above and behind): the arm visibly comes from her right shoulder past the right side of her head, up-left to
  the glass. B2: the elbow now sits in front of her own chest (it touches the edge of Dad's silhouette in this camera).
- **Floppies (B3).** The 10 x 10 x 14 cm "box" is gone. `FLOPPY`: a neat flat stack of 11 **5.25 in** disks (period-
  right for a 1990 home PC with two 5.25 in drive slots, as modelled; flag: 3.5 in also existed by 1990) in white paper
  sleeves 14.0 cm square, 1.8 mm each, squared up by hand; the top disk out of its sleeve: black 13.3 cm jacket, white
  label, hub ring, head slot (brown media), write-protect notch.
- **THE SCREEN (canonical, every shot that sees the glass: B0, B3, B4, B5).** `build.js dosScreen()` draws one 80 x 25
  DOS text screen in code (VGA light grey #aaaaaa, text VGA blue #0000aa; Jade: "dark blue text on grey"): title bar
  `C:\WORK\GRADES.C ... Line 10 Col 24 Insert`, key-help line, and a short **C** program (ASSUMED, flag; Turbo-C era;
  BASIC equally plausible): the class average from SCORES.DAT. Dad renamed `total` -> `sum` (declaration, initialiser,
  loop) and missed one on line 10: `avg = (float) total / n;` — THE WORD (`DOS.wordRow/wordCol`, checked at build time;
  `WORD` / `WORD_P` now come from the text grid, ~0.5 cm from the old bar layout). Cursor just after it. Lit: the glass
  glows with the texture; flat / label / form show its greys, line / contour its edges (`_art.js artFromCanvas`). Label
  mode keeps the white sliver over the word; the gold underline is still the renderer's. The content of the program
  is invented (flag). **The glow colour changed** (`BEAM.color` 0x3f6dff -> 0x9db4f0): a grey screen gives a cool
  CRT white, not saturated blue; the plan's "blue light" is now read as cool screen light (flag to Jade).
- **Lick (B4, B5; Jade: "mouth closed, tongue in. lips and chin contacting wrist"; REPLACES the r3 gap).** She hunches
  over the paw (spine bend 12 -> 28, look point 0.66 -> 0.62 m); the forearm still rises diagonally inward from a low
  elbow, the loose fist droops; the wrist is placed so the sweater cuff (r 2.2 cm) runs across the line from her lips
  to her chin, 1 cm out from the mannequin face, wrist joint 1.5 cm on (`GROOM.contactP`, `wrist0`; iterated with the
  forearm direction read back to convergence). Sidecar check: lips 0.18 cm and chin 0.18 cm from the cuff surface, the
  lips on the cuff 3.3 cm behind the wrist joint, the chin at the joint. The mannequin's mouth is a closed line; no
  tongue modelled. The smooth skull has no jaw, so the cuff sinks ~1 cm into it (stands in for the soft lip-chin
  hollow). B5 reads more "chin on paw" than "paw out front"; acceptable per Jade's contact note, flag.
- **Repaint in r4:** B1_feet (chair, feet), B2_face (arm, eyes, screen light colour), B3_finger (camera, arm, screen,
  floppies), B4_doubletake and B5_cat (lick contact, hunch, screen). B0 are references.
- **Waiting on the engine:** aimed pupils (gaze switch), slimmer child arms / natural wrist (body mesh), a real jaw and
  lips for the lick contact.

## 2026-11-26: hold pass
Every hand that touches something is now checked (`--gaze` sidecar `holds`, engine/holdcheck.mjs); all pass in mannequin and `--body mesh`.
- Dad typing (POINT: B0_plan, B0_wide, B1_feet, B2_face, B3_finger): each hand's MIDDLE fingertip pad on a home-row key
  (grasp `tipOn` on the keyboard's tipped top face, layout.js `KB_TOP` / `KB_UP`), other fingers loosely curled (shots.js
  `tap`, `TYPE_HAND`). Was a relaxed palm 5 cm over the desk with the fingers in the air.
- The keyboard (build.js): raised so its lowest edge rests on the desk (centred at half its height, the 6 deg tip sank 9 mm
  into the top), with two fold-out feet at the back merged into the same mesh (a tipped box on one edge rocked flat 9 mm in
  the check). layout.js `PC.keyboard.tilt`, `KB_Y`.
- The CRT monitor (build.js): foot, bezel and tube housing merged into ONE mesh (`mergeMeshes`), so the monitor is one rigid
  object resting on the case by its foot; looks unchanged. Her right fingertip on the glass is checked against it
  (grasp `tipOn`, object 'CRT monitor'; contact 1.9 mm = the glass stands 2 mm proud of the bezel).
- Her left hand on the desk (grasp `restOn`, object 'desk'): fingers a little curled with their pads on the wood, the palm
  2 cm up so the heel of the hand / wrist clears the top (the flat palm put the mannequin wrist 9 mm and the mesh wrist 11 mm
  into the desk), thumb level (the flat shape's thumb hung 14-28 mm into the top) (shots.js `DESK_L`, `LIFT_L`, `CURL_L`).
- B2_face hides the monitor for its camera, so her fingertip has nothing to be checked against there (`POINT_B2` drops
  the tag); the same pose passes in B0 / B1 / B3.
- B4 / B5: no hand holds or rests on anything (Dad's hands hover over the keys, the paw is at her mouth): not checked.
- **Round 2.** The screen glass edge's tubes are re-parented into the monitor's group and labelled 'CRT monitor' (parts of
  the monitor, not a support it "sinks into"). All PASS in mannequin. In mesh, the desk FAILs on "sinks into little Jade (7)":
  none of her vertices is below the desk top. The engine's support prisms are extruded away from the desk's far centroid,
  so tilted underside triangles of her forearm get prisms pointing down into the desk.

## 2026-11-26 (late): round-4 decisions (Jade: b_screen cool white, no crossed eyes, no clipping; b_program QBasic chat; b_chair / b_floppy as built; props phase 2)

- **Bodies measured, not eyeballed.** New check `layout/sets/basement90/check_bodies.mjs` (`node ... [--set kitchen90]
  [--shots ..] [--json out]`; set-local, no engine change). It builds each shot in the real page (mesh bodies + gaze), bakes
  every visible figure mesh (and its footwear) to world triangles and, with **three-mesh-bvh** (installed in
  /home/jade/Documents/layout-deps), counts intersecting triangle pairs body vs body and body vs every set object near it,
  the clearance, and the deepest vertex inside the other surface (ray parity). Eyes: each eyeball centre to the look
  target, both eye directions (clamped as engine/gaze.js), vergence, where the two eye rays meet. Last run:
  `check_bodies.json` beside it.
- **Before (r4 guides, B0-B3, the pointing pose): young Jade was INSIDE Dad.** 1125 intersecting triangle pairs; his
  torso/arm through her torso (302 pairs), her hair through his torso and hair, her right leg through his left leg; deepest
  161 mm. She also stood 28 mm into the seat (394 pairs) and 16 mm into the base; Dad's slippers were 6 mm into the casters
  (608 pairs), his seat 7 mm into the cushion; in B4/B5 his right fingers were 15 mm into the keyboard.
- **Re-staged (shots.js / layout.js):** her feet go out to the leg tips (`FEET_R` 0.21 -> 0.32 m from the hub, lateral 0.26
  m, outside the 0.46 m seat); `jadeOnSpokes(yaw, out, back)`: pelvis 0.165 m further out to Dad's left than her feet (legs
  lean in a little; her left hand on the desk takes weight), pelvis lowered (reach 0.97 -> 0.90) so both feet land;
  `SOLE_GAP` 0.003 -> 0.016 (the mesh sock bulges 13 mm below the heel-toe line). Her spine bend 36 -> 26 (more upright,
  head further from the glass), twist 10 -> 20; right elbow on the shoulder-to-fingertip line (`SH_R`, `JADE_ELBOW_R`), not
  low under her chest (it hit his left hand). Dad leans a little to his right to make room (`spine.side` 0 -> 10), both
  elbows tucked (`DAD_ELBOW_L/R`), typing fingers pointing a little inward (wrist warnings smaller: L pronation 20 -> 11
  deg over, R ulnar 46 deg -> in range; R pronation still 26 deg over), feet 11 cm further forward (`footFwd` 0.36 -> 0.47;
  B4/B5 0.38 -> 0.46) off the casters, seat bones 6 mm up (`DAD_SEAT_LIFT`). B4/B5: his hovering right hand 4.5 cm higher.
  B3 camera az 180 / el 72 / 0.65 -> az 200 / el 55 / 0.6 (from above her left shoulder; her head now at the frame
  bottom, she had moved out of the old frame).
- **After (every shot): 0 intersecting triangle pairs Jade vs Dad**; clearance 27.9 mm in B0-B3 (she stands beside his left
  upper arm), 397 mm in B4/B5. Furniture: her soles 0.3 mm on the base legs (contact), her left hand 0.2 mm on the desk;
  Dad's seat 1.2 mm (foam), no other contacts. Holdcheck: 14 / 14 pass on media/layout/basement90.
- **Eyes.** The engine aims each eyeball separately at the look target, so the eyes always converge exactly (rays meet
  0 mm off target, every shot). What read as crossed was the DISTANCE: her target (her fingertip on the glass) was 0.344 m
  from her eyes, vergence 9.5 deg. Now 0.457 m, vergence 7.2 deg (B0-B3); B4/B5 0.42 m, 7.8 deg. Dad: 0.358 m to the
  screen centre, 9.9 deg (unchanged; a close CRT; flag); B4/B5 0.605 m to her eyes. Zoomed B2 form: both of her irises
  turn the same way, parallel-looking, not crossed; Dad's too.
- **THE SCREEN (Jade: "it wasn't c, this was qbasic era, and he wasn't a professor ... a weekend project with his friend,
  a real time chat application that was two side by side wordperfect-like environments").** `build.js DOS_TEXT`: the
  MS-DOS QBasic 1.1 editor, 80 x 25: menu bar, the CHAT.BAS window (box-drawn frame, scroll bar), the 2-line Immediate
  window, status line `<Shift+F1=Help> <F6=Window> <F2=Subs> <F5=Run> <F8=Step>  00009:023`. The code (real QBasic syntax;
  content ASSUMED, flag) is the main loop of a split-screen chat over the modem: `OPEN "COM1:2400,N,8,1,RS,CS0,DS0,CD0"
  FOR RANDOM AS #1`, `INKEY$`, `PRINT #1`, `INPUT$(LOC(1), #1)`; the two panes are drawn by SUBs `DrawPanes` / `PutPane`
  (declared, off screen). I chose the IDE over the running app because the lyric ("I point to one he missed") and Jade's
  earlier "he was renaming a variable" both need source code. **The missed-rename beat survives:** he renamed `txt$` to
  `outLine$` and missed the one in `PRINT #1, txt$` (line 9, screen row 10: it would send his friend an empty line); her
  fingertip is under `txt$`. Colours stay Jade's dark blue on light grey (QBasic's Options > Display can set them; its
  DEFAULT is the reverse, grey on blue, like WordPerfect 5.1: flag). Professor / class-average / C framing removed from
  intents and notes. Readable when zoomed in the 1920 x 1080 guides (B3 lit: each line legible, `txt$_` with the cursor).
- **Chair, floppies (Jade: as built):** black base, charcoal blue-grey tweed; 5.25 in disks. Confirmed, unchanged.
- **Props phase 2:** keyboard = "Keyboard - Classic IBM Design" (matthew.leiher, CC BY 4.0), flat on the desk (its key tops
  are already a wedge, 0.088 rise per metre toward the back; the old 6 deg tipped box and its fold-out feet are gone);
  `KB_TOP` / `KB_UP` follow its key tops. Lampholder = Poly Haven "Pull Chain Light Socket" (CC0, with its own short chain;
  the long code chain is gone); bulb = Poly Haven "Lightbulb 01" (CC0), screwed in upside down, the glass keeps the lit
  emit look (`SOCKET`, `BULB_P` in layout.js). Dad's right hand now lands on the arrow-key cluster of the IBM layout (he is
  moving the cursor; fine). Kept hand-built (audit): PC case, CRT (beam source), printer, chair, washer, melons.
- **Not fixed, flag:** B4/B5 her paw wrist is still reported 91 deg beyond flexion (pre-existing, the drooping cat paw); a
  less-drooped paw (tried) lifted the fist to her eyes and broke the lips-on-wrist contact, so it is left as before.

## 2026-11-26 round 4 — PROGRESS (checkpoint)
- DONE: everything in the round-4 decisions section above: re-staged (0 body-vs-body intersections in every shot, measured
  with check_bodies.mjs), eyes converge at 0.46 m (B0-B3) / 0.42 m (B4/B5), QBasic CHAT.BAS screen, props phase 2
  (keyboard, bulb, lampholder), all three render passes + masks + gallery, holdcheck 14/14 pass, credits, REPAINT_LIST.
- LEFT: nothing for basement90 except the final re-render sweep after the cast/hair agent's body changes (re-run
  `node layout/sets/basement90/check_bodies.mjs` after it: new bodies can re-open the 28 mm gap).
- FLAGS: QBasic colours (Jade's blue-on-grey vs QBasic's default grey-on-blue); the program content is invented; Dad's eyes
  0.36 m from the CRT; Dad's wrists still over the pronation limit (L 11 deg, R 26 deg); B4/B5 paw wrist 91 deg over flexion
  (pre-existing).
- QUESTION for Jade: "QBasic screen colours?" (a) dark blue text on light grey, as you remembered [rec, built] (b) QBasic's
  default light grey on blue. Image: media/layout/basement90/B3_finger_lit.png

## 2026-11-26: round-5 decisions (kitchen-basement agent)

Jade (b_qb_colours): "QBasic default: light grey on blue".
- **The canonical screen (build.js `dosScreen`) now uses the real QBasic 1.1 default colours** (VGA text palette): edit
  windows light grey #AAAAAA text on blue #0000AA; the active window's title " CHAT.BAS " in reverse video (blue on grey);
  menu bar black on light grey with each menu's access letter in bright white; the vertical scroll bar a grey track with
  a black thumb; status line bright white on cyan #00AAAA with the line:column field in black after a separator; the text
  cursor grey. The characters, layout and THE WORD (`txt$`, row 10) are unchanged. FLAG: the bar colours (white-on-cyan
  status line, white access letters) are from memory of the real editor's screenshots; a web search did not confirm them.
  B3 intent updated. The screen GLOW stays Jade's r4 "cool white" (BEAM.color 0x9db4f0); a mostly-blue screen would
  realistically cast a bluer light: flagged as a question.
- **Dad's typing wrists (B0-B3).** Palm-flat-down hands with tucked elbows needed 91 / 106 deg of forearm pronation (limit
  80). Each hand now rolls onto its little-finger side (thumb up: L 15 deg, R 32 deg) and the right hand's fingers turn
  in (FX -0.35), as a typist's hands do (`ROLL`, `FX`, `tap()` in shots.js). Measured: L twist -91 -> -78.5, R -106.5 ->
  -77.3, flexion 39 / 54, deviation 10 / 5: all in range (no sidecar wrist warning for Dad in B0-B3).
- **The cat paw (B4/B5) is now a natural wrist.** The drooping paw was 91 deg past flexion, 115 ulnar, 57 pronation. The
  new paw (solved in a scratch search over forearm direction, roll and flexion with engine/wrist.js's wristAngles, elbow
  within 1.2 cm of the arm's reach, from the read-back face points): elbow low in front of her ribs, the forearm rising
  steeply up and in to a wrist just under her chin, the wrist bent 55-60 deg so the loose fist is palm-down, knuckles
  forward and in; the top of the bent wrist / sweater cuff faces up into her bowed face, her lips and chin on it. Head a
  little less bowed (spine 28 -> 26, look 0.8 m out at 0.70 m). Engine report: flex 59.5, radial -2.3, twist -77.4 (in
  range). Looked at B5_cat lit: reads as a cat paw at her chin.
- **check_bodies.mjs hang (K4_writes) found and fixed (set-local, not an engine issue):** three-mesh-bvh's
  `closestPointToGeometry` with no distance cap walks nearly every triangle pair when two meshes are far apart (11 cm took
  66 s; the K4 parents 1.16 m apart never finished). The clearance search is now capped (`CLR_MAX` 0.05 m, `--clr-max`);
  farther pairs print "clearance >50 mm". K4_writes now checks in 6 s. New `--parts`: per-body-part breakdown of
  furniture contacts.
- Rolling Dad's hands put his ring fingertip 7.9 mm into the keys (holdcheck): TYPE_HAND ring / little curls raised
  (ring 50/58/30, little 58/64/34); now 1.1 mm (pass).
- **Checks (all 7 shots, 3 passes + masks re-rendered):** check_bodies.mjs PASS on every shot (check_bodies.json
  rewritten); holdcheck 14 / 14 pass; no wrist out of range for anyone in the sidecars. clipcheck still FAILs every shot
  on Dad's mesh soles 14.3 mm into the concrete slab: the engine's known "mesh soles ~13 mm under the floor" (engine-body
  agent's fix list), not staging. Looked at: B3_finger (screen readable, grey on blue, cyan status line), B4_doubletake,
  B5_cat.
- QUESTION for Jade (proposed): "The screen glow on her face, now that the screen is blue?" (a) keep cool white [as built]
  (b) a light blue cast. Image: media/layout/basement90/B2_face_lit.png.
