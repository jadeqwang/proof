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
