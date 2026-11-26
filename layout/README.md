# layout/ — 3D blockouts for the room shots

Three Three.js sets with mannequins at true heights, one camera per shot, rendered headless to guide images for the
image model (same approach as moongazing's `render/scenes/guanghan3d` and `blockouts`: Chrome + SwiftShader via
playwright-core, PNG data URLs out of the page). No generation, no cost.

| set | room | shots |
|---|---|---|
| `attic88` | attic above a Chinese-Indonesian restaurant, NL, 1988, night | A1 A2 A3 A4 B1 B2 C2 C3 C5a C5b D3a D3b D9 E1 E3 E5 E6 F3b G1 G3 G4 G5 L3 |
| `bed26` | child's bedroom, Austin, 2026, dark | I1 I2 I4a I4b J1 K1 L1 L2 |
| `car26` | compact SUV at dusk on a highway | F1 F2 F3a F4a F4b F5 F6a F6b |

Output: `media/layout/<set>/<SHOT>_{line,flat,depth,label,lit}.png` (1920x1080) + `media/layout/<set>/<SHOT>.json`
(sidecar), contact sheets `media/layout/_sheets/<set>.jpg`.

## Render

```sh
node layout/render.mjs --set attic88                       # every shot, every mode, + sidecars
node layout/render.mjs --set attic88 --shots C2,G4         # some shots
node layout/render.mjs --set car26 --shots F4a --modes line,label --nojson
sh layout/sheets.sh                                        # contact sheets from the label renders
REV=/tmp/x sh layout/review.sh attic88 B2                  # 2x2 downscaled review sheet (label/line/flat/lit)
```

Needs: Three r170 at `/home/jade/Documents/merge-me-back-to-main/engine/node_modules/three` (override `THREE_DIR`),
playwright-core from moongazing (override `PLAYWRIGHT_CORE`), Chrome at `/opt/google/chrome/chrome` (`CHROME`),
ImageMagick for the sheets. A shot renders in about 0.3 s per mode.

Modes: `line` clean black lines (object ids + normal/depth discontinuities, hidden lines removed; designated cast
shadows on the page outlined and pale-filled) — the one to give the image model; `flat` greys with the shot's lights
as white lights and their shadows; `depth` linear, near white; `label` flat + names, the dashed blue 4:5 safe area,
the computed hand-shadow polygons (purple, dashed) and a header; `lit` mood preview (coloured lights, shadows, glow).

### Painter guides: `form`, `contour`, `light` (2026-11-25, opt-in)

The image models misread the dark guides (grey cast-shadow fills in `line` read as extra objects; `flat` / `lit` of
dusk, night and basement shots leave whole areas near-black). Three extra modes keep form and light apart. They are
never in the default `--modes`; render them with `--modes form,contour,light --nojson`. The painter brief
(`docs/KEYFRAME_BRIEF.md` "The guides") passes these three instead of line + flat.

- `contour` = `line` without any shadow fill or terminator (no shadow-light pass): silhouettes, creases and object
  boundaries only, black on white. Mirrors as in `line`.
- `form` = evenly lit clay, no cast shadows, no set lights: per-pixel shade from the normal (soft key from above-left
  of the camera + hemisphere sky/ground), range-checked screen-space occlusion from the depth buffer (contact
  darkening, no halos past big depth jumps), contour lines in dark grey on top. Class tints (codes, not colours):
  people near-white clay with mid-grey hair caps (`look.grey <= 0.15` on a figure), furniture beige, small props
  pale blue-grey, the room shell grey; class = the world size of the mesh's label group (largest side > 2.6 m or
  diagonal > 3.4 m = room; > 0.45 m = furniture; else prop); each label gets a small value offset so neighbours
  separate, dark materials sit a little darker. Glass-look meshes are drawn as pale translucent cyan unless their
  label says beam / shaft / volume / sunlight / steam / blade / cone / light. Emitters near-white.
- `light` = the shot's real lights only: the `flat` rig minus ambient / hemisphere lights and minus shadowless
  directional fills, on white Lambert (half-float target), banded into lit (white, irradiance > `hi` 0.42),
  weak light (0.76, > `lo` 0.05) and shade (0.5), with wide smoothsteps so falloff reads as a ramp and shadow edges
  stay crisp; the form and contours faintly underneath (+-22 %). Per-set override: `built.lightGuide = { lo, hi }`.
  Emitters white. Its darkness is NOT the mood: the prompt words carry that.

Code: `engine/render.js` `_guide()`, `_formMat()`, `_classify()`, `guideMat` (composite shader).

### Opt-in clothed torso: `torso: 'real'` (2026-11-26)

A figure spec may carry `torso: 'real', sex: 'f' | 'm'` (engine/mannequin.js, geometry in `engine/torso.js`). The
torso is then a clothed body instead of the swept capsule: separate front and back depths per height, a waist, hips
(wider for 'f', with a slightly larger pelvis), a bust under a sweater with the cloth tenting below it ('f') or a flat
pectoral shelf and lats ('m'), shoulder blades and a spine groove; the surface runs a little past the shoulder line so
the shoulders slope. Same spine frame, arms, clavicles and armpit folds. Default off: figures without the flag build
exactly as before (checked pixel-identical on office91 BO1). First used by closet02 (round 3).

Also opt-in: `fringe: 'none'` drops the fringe plank of 'bob' / 'long' hair for a thin hairline shell over the forehead
(the plank reads as a headset when the head is bowed). Default unchanged.

### Gaze, natural wrists, held objects (2026-11-26, opt-in: `--gaze` or `PROOF_GAZE=1`)

Jade: the mannequins had two fixed dots for eyes, so the guides never showed where a figure looks, which cost many
keyframe corrections. OFF by default: without the switch every render and sidecar is byte-identical to before
(checked on office91 BO1, closet02 CL_ots, attic88 v4_B1, basement90 B2_face / B3_finger, all seven modes).

```sh
node layout/render.mjs --set basement90 --shots B3_finger --gaze --out /tmp/x     # --out <dir>: write to <dir>/<set>/
node layout/engine/holdcheck.mjs /tmp/x/basement90                                # Rapier hold check over the sidecars
```

- **Eyes** (`engine/figure2.js` `buildFace`, the aim maths in `engine/gaze.js`). The head still takes only part of a
  look (`pitchK`, the 80 deg yaw clamp). The eyes take the rest: each eye aims at `P.lookAt` from its own centre,
  clamped to 35 deg yaw and 30 deg pitch of travel, with the upper lid following the eye pitch, so a figure looking
  down reads from above. They show in every mode: in `line` / `contour` the iris and pupil are drawn as circles; in
  form / flat / lit the white is light and the iris dark (`look.formTint` / `look.flatCol`). Who gets drawn eyes:
  `faceKind(who)`. That is `drawn` for jade* / littleJade / mama* / dad. It is `blank` for everyone else: the face stays
  paper, with a brow ridge that drops with the gaze and a nose wedge aimed along the gaze (a CylinderGeometry, so the
  sets' `undraw()` keeps it). It is `none` for first love: no eyes, ever.
- **Label mode**: a dotted line from between the eyes to the look target, tagged `looks at: <target>`, magenta when
  the eyes cannot reach it or a pointing check fails. When there is no target it shows a short ray and `no look target`.
- **Sidecar** `gaze.<who>` holds: `look_target {name, world}`, `head_deg` (head vs chest), `eye_deg` (eyes vs head,
  wanted vs clamped), `gaze_error_deg`, `beyond_eye_range`, `points[]` (arms with `hand: 'point'`: target and
  `look_off_deg`), `reaches[]`, `eyes_px`, `target_px`. Warnings are prefixed `gaze:`: beyond eye travel, points but
  has no look target, or looks more than 15 deg away from where it points (self-targets are skipped).
- **Natural wrists** (`engine/wrist.js`): for every arm, `wristAngles` gives flexion (+ toward the palm), radial
  deviation and forearm twist against the elbow plane. Ranges are flexion / extension 60, radial 20 / ulnar 30, and
  supination 85 / pronation 80. For grips (`hold`, or the shapes grip / pinch / cup) the elbow swivels first (+-45 deg,
  +-25 when the shot gives `elbow`). It only moves for a real gain, and never into akimbo or above the shoulder.
  - A cylinder held along `hold.axis` may be taken the other way round (thumb toward the other end) when that keeps
    the wrist natural. Example: mortongrove07 MG1, where her wrists went from about 150 deg extension to in range.
  - A hand holding its own prop, or a free hand (no `tip`), is then turned toward the forearm until it is in range.
    A grip on a set object keeps the grip and is reported instead.
  - Sidecar keys: `wrists.<who>.<L|R>` and the `wrist:` warnings.
  - New arm option (not gated): `elbowAt: point`, the elbow bends toward a point (the pole is solved from it).
- **Held objects** (`engine/grasp.js`, `engine/holdcheck.mjs`).
  - `GRASPS` is the template table: power, mugHandle, pinch, paperEdge, palmUnder, twoHandsBelow, twoHandsSides and
    shoulderSeams.
  - `graspArms(name, objFrame)` gives arm specs that hold the object (fingers round it, or the palm under its weight).
    `objectFromHand(name, solvedHand)` places a prop from the solved hand. Neither is wired into any shot yet.
  - The sidecar key `holds` has one entry per gripping hand: the object (the engine's held cylinder, or the nearest
    small set object within 3 cm) as world hull points, plus the capsules of every hand on it. The capsules are new
    data from `engine/hand.js` (`capsules`, `joints` on `P.hands[n]`); the render is unchanged.
  - `holdcheck.mjs` runs Rapier (`@dimforge/rapier3d-compat`, installed OUTSIDE the repo in
    `/home/jade/Documents/layout-deps`, override `RAPIER_DIR`). Hands are fixed capsules and the object is a dynamic
    convex hull, with 1 s of gravity.
  - Its flags are `adjacent` (no contact within 2 mm at t = 0), `penetrates` (more than 3 mm) and `falls` (more than
    1 cm). It checks the hands only: an object also resting on a table is reported as falling.
- Also built and STOPPED (rigged human meshes will replace the mannequins), behind its own switch `--body2` /
  `PROOF_BODY2=1`: a real torso for every figure (`torso.js` rows 'f', 'm' and a new 'c' for children), a shoulder
  girdle (trapezius into an ellipsoid deltoid cap, the arm in the torso's line group, slimmer child arms), costume
  colours in form / flat with a colour wash in contour / light, figure-against-figure outlines, and body.js taking the
  mannequin's body. Sidecar `costume`, `colour_separation` and `figure_frame_fraction` come with `--gaze`.
- For a mesh adapter: `engine/gaze.js` (eyeAim / gazeSplit for eye bones, gazeReport, drawGazeOverlay),
  `engine/wrist.js`, `engine/grasp.js` and `engine/holdcheck.mjs` (`checkHold({ hull, capsules })`) work on solved
  points only. Audits: `work/gaze_audit.md` and `work/costume_audit.md`.

## Files

```
render.mjs serve.mjs index.html   CLI, static server, page
engine/core.js        mesh helpers; every mesh carries userData.look {grey, col, emit, only, hide, glass, label}
engine/mannequin.js   CAST (heights, colours), hand shapes (HANDS), leg presets, buildFigure()
engine/book.js        the storybook (21 x 28 cm closed): closed or open, anchors for hands, page corners
engine/stage.js       two-pass staging (hands reach book/other figures), placeBook, headAt, solveCamera (orbit + aim),
                      hideParts (POV inserts), analytic shadow projection onto the spread
engine/aim.js         target that puts a world point at a screen position (u, v)
engine/render.js      the five modes + the three painter guides (form, contour, light), mirror compositing
engine/main.js        page API: renderShot(id, mode), sidecar(id)
engine/gaze.js engine/wrist.js engine/grasp.js engine/holdcheck.mjs engine/figure2.js   opt-in gaze / wrists / holds (above)
sets/<set>/layout.js  SINGLE SOURCE OF TRUTH: every dimension in metres + the light list
sets/<set>/build.js   room geometry from layout.js, figures, props, light rig per mode, set-specific targets
sets/<set>/shots.js   the camera table
```

## Add or change a camera

Each entry in `sets/<set>/shots.js`:

```js
{ id: 'E1', lens: 40,                                   // mm on a 36 mm-wide frame (film convention)
  orbit: { at: { mid: ['mama:eyes', 'littleJade:eyes'] }, az: 18, el: 3, dist: 1.6 },   // or pos: [x, y, z]
  aim: [{ mid: ['mama:eyes', 'littleJade:eyes'] }, 0.5, 0.44],   // put that point at (u, v) of the frame; or target: [x,y,z]
  sync: 'lip', singers: ['mama'], focus: [...],         // faces checked for the 4:5 safe area and for occlusion
  figs: { mama: {...}, littleJade: {...} }, book: {...}, light: {...}, shadow: {...}, hideParts: { mama: ['head'] },
  header: 'one line', intent: 'what the frame is for' }
```

- `orbit.az` is degrees around the vertical (0 = +z, 90 = +x); with `rel: '<who>'` it is measured from that figure's
  face direction, positive toward the figure's left. `el` is elevation, `dist` metres.
- Points: `[x,y,z]`, `'who:part'` (head, eyes, nose, mouth, chin, forehead, earL/R, handL/R, shoulderL/R, elbowL/R,
  kneeL/R, knees, lap, hip, waist, chest), `'book:anchor'` (G, GT, GB, Lmid, Rmid, LO, RO, LOT, LOB, ROT, ROB, LT, RT,
  cover, L, R, T, B), `{ mid: [a, b] }`.
- After a render, read the console: `! <shot>: <who>'s face is blocked by ...` / `... outside the 4:5 safe area`.
- POV inserts over the book: hide the reader's head (`hideParts`) and keep `el` >= 64 or her chest fills the frame.

## Add a pose

Figure spec (see the header of `engine/mannequin.js`): `at` (pelvis, [x, z] or [x, y, z]), `yaw` (0 faces +z),
`pitch` (90 = face down), `roll`, `legs` (`stand kneel cross long knees seat oneLegUp side kick straight`,
`legOpts.ankleL/R` overrides), `spine {bend, side, twist}`, `head {look, turn, nod, tilt, pitchK}`, `headAt` (slide the
figure so its head lands on a point), and per arm `L`/`R`:
`{ to: point (palm centre), off: [dx,dy,dz], hand: shape | { shape, curl, spread, thumb }, fingers: dir, palm: dir,
thumb: dir, elbow: dir, tip, hold }` or the shortcuts `'side' 'lap' 'kneeL' 'kneeR'`. Hand shapes and the hand API:
see "Hands" below (hand frame: x = thumb side, y = fingers, z = palm normal). Directions: world `[x,y,z]` or `up down fwd back left
right in out` (figure-relative) or `'to:<point>'`. Reusable poses live as small functions at the top of each
`shots.js` (`mamaRead`, `jadeSit`, `jadeKneel`, `jadeFloor`, `daughterProne`, `daughterSeat`, `jadeDrive`).

### Hands (articulated, 2026-11-25; `engine/hand.js`)

Every hand has five fingers with three phalanges each (MCP, PIP, DIP joints) and a thumb with CMC, MCP and IP joints.
The arm API is unchanged: `to` is still the palm centre, `palm` / `fingers` / `thumb` / `elbow` still orient the
hand and arm, and the anchors `handL/R` (palm centre), `wristL/R`, `elbowL/R`, `indexL/R` and `thumbL/R` (fingertip
centres) mean what they meant. New anchors: `middleL/R`, `ringL/R`, `littleL/R` (tips), `knuckleL/R` (middle MCP),
`forearmL/R`, `upperArmL/R`, `hipL/R`, `heelL/R`, `toeL/R`, `neck`, and `heldL/R` (centre of a held object).

A named shape (`hand: 'grip'`) is a table of joint angles in `HANDS`:

```js
grip: { curl: { index: [58, 88, 46], middle: [64, 92, 48], ring: [68, 94, 50], little: [72, 96, 50] },   // [MCP, PIP, DIP] deg, + toward the palm
        spread: 0,                                                    // deg the fingers fan apart (index toward the thumb)
        thumb: { opp: 0.8, mcp: 22, ip: 20, touch: 'index.mid' } }    // opposition 0..1, joint flexion, contact
```

Thumb: `opp` 0 = beside the index in the palm plane, 0.5 = half out in front (rest), 1 = in front of the palm facing
the finger pads; `sweep` / `abd` (deg) override the metacarpal direction that `opp` gives; `mcp`, `ip` flex it.
`touch: 'index'` solves the thumb so its pad meets the index pad (pinch, ring); `touch: 'middle.mid'` lays it on the
back of that curled phalanx (fist, point, two; grip uses `'index.mid'`).
Shapes: `flat relax palmUp cup grip pinch point fist ring switch monkeyHead monkeyPaw two thumbsUp`.

Per-shot override, any arm: `hand: { shape: 'grip', curl: { index: [10, 20, 10] }, spread: 5, fan: { little: -8 },
thumb: { opp: 0.6, mcp: 10 } }`. `curl` may be `{ all: [m, p, d] }` or one number per finger (= `[n, n, 0.7n]`).
The sidecar's `hands.<who>.<L|R>.shape` is the shape name.

Two arm options place a hand by what it does, not by its palm:
- `tip: { finger: 'thumb' | 'index' | ..., at: point, off }`: the engine moves the palm so that fingertip lands on the
  point (kitchen90 K5: thumb tips on the cheeks). Give `palm` and `fingers` with it.
- `hold: { r, h, label, look, taper }` (or `hold: r`): a cylinder of radius r metres held across the palm (its axis is
  the thumb side); the fingers and thumb wrap round it. With `fingers: 'fwd', palm: 'in'` it stands upright like a
  cup (mv10 `cupArm`).

Hand size: `PROP[kind].hand` of height (adult 0.108; child3 0.112, child4 0.111, child5 0.110, child7 0.107, child10
0.106). Children get rounder fingers and a broader palm (`handProfile`), and rounder limbs (`girthK`).

Body (`engine/mannequin.js` + `engine/anatomy.js`): one torso surface swept along the spine (waist to chest, bends
with `spine`), pelvis, trapezius, clavicles, deltoid caps that follow the humerus, armpit folds that appear as the arm
rises, tapered limbs whose joints are shared spheres (no pinch or gap at any bend), a flattened wrist, feet with
heel, sole and toe box. Pieces of one limb share a line-mode id (`userData.idGroup`, `engine/render.js`), so line renders
show silhouettes and real creases, not the seams between primitives. Test sheets: `sets/mtest/` (`sh layout/sets/mtest/sheet.sh`).

Set-specific targets: attic `'neon'` and `'ray:<point>:<d>'` (d metres from a point toward the neon: a hand there
throws its shadow onto that point); bedroom `'flash:grip|switch|lens|front'` and `'ray:...'` toward the flashlight.

## Sidecar schema (`<SHOT>.json`)

| key | content |
|---|---|
| `camera` | position, target, lens_mm, hfov/vfov, roll, near/far, `matrixWorld`, `viewMatrix`, `projectionMatrix` (three.js column-major), pixel convention |
| `safe45_px` | x range of the centred 4:5 area |
| `book` | `state`; open: `spread`, `left`, `right` = 4 corners each in px, order TL, TR, BR, BL **as the page is read** (so a painted page maps straight on), `spread_world`, `behind_camera`; closed: `cover` |
| `panes` | named glass quads: px + world corners (TL, TR, BR, BL as seen from inside), `behind_camera` flags. attic: `window_TL/TR/BL/BR`; bed26: `window`; car26: `windscreen`, `front_left/right`, `rear_left/right`, `quarter_left/right`, `rear_window`, `mirror` |
| `heads` | per figure: head/eyes/mouth px, `in_frame`, `visible` (id buffer), `facing_camera_deg`, `blocked_by` |
| `hands` | per hand: palm px, shape, in_frame, visible |
| `lights` | name, kind, on, colour, world, px, `travel_dir_px` (screen direction the light travels at the subject), `toward_camera` (+1 = backlight into the lens) |
| `hand_shadow` | (C2, G3, G4, I2, I4b) hull polygons of the casters projected from the light onto the spread: px and spread uv (u 0..1 left->right, v 0..1 top->bottom), bbox |
| `mirror` | (F4a, F6b) mirror pane, normal, `reflected_faces` (px of each face's reflection, inside the glass or not) |
| `flashlight` | (bed26) lens / switch / tail px, on |
| `streetlights`, `pane_backlight`, `streetlight_t` | (car26) lamp positions at the shot's t, and per pane the screen direction of the nearest lamp's light |
| `camera_move` | (A2) end of the move |
| `intent`, `desc`, `warnings`, `figure_report` | staging notes; arm/leg reach (>1 = over-reach, clamped) |

## v3 setups (director's review; see docs/LAYOUT_V3.md)

```sh
node layout/render.mjs --set attic88 --prefix v3_          # only the v3 setups (v1 files are never touched)
node layout/render.mjs --set bed26 --prefix v3_ ; node layout/render.mjs --set car26 --prefix v3_
sh layout/sheets_v3.sh                                     # v3 sheets, neon options, lap parallel, hand shadows, J4 split
```

`sets/<set>/shots_v3.js` holds the v3 camera tables (ids `v3_*`, `v3: true`); `build.js` takes the v3 path for them.

```
engine/lap.js         the lap storytime pose (lapPose) and the eight shared setups (lapCameras), pushEnd, levelRoll
engine/props.js       coverBlanket (blanket pulled over a sleeper), monkeyCard / cardOverPage, handShadows (sidecar)
assets/monkey_silhouette.json   design/characters/monkey/handshadow_silhouette.jpg traced to a polygon (unit = its height)
sets/attic88/v3.js    blade sign, neonSource (effective light point), hook rail, the D9 book stack
```

New shot fields: `sign {z, x0, x1, ...}` (override the blade), `hooks: 'empty'|'hung'`, `textbooks {at, n, mode:
'stack'|'topple'|'scatter', dir}`, `cards [{on: book anchor, h, lift, who}]`, `push {fromShot, fill}`, `levelBook: k`,
`orbit.relBody`, `orbit.off`, blankets `pull` (with `upTo`) / `aside` / `heap`, bed26 `pull {who, upTo}` and
`bedBlanket: false`, figure `noApron`, legs `lapV`. New targets: `hook:<i>`, `card:<i>:base|centre`,
`lift:<book anchor>:<h>` and `lift:page:<L|R>:<a>:<b>:<h>` (h metres above the page on the ray to the light).
New sidecar keys: `sign`, `hooks`, `push`, `seating`, `blanket`, `serves`, and a richer `hand_shadow`
(`casters[]` with hand, foot, polygon, offset, elevation, magnification, soft edge).

## "Proof" sets (2026-11): shared files

Eleven sets under `sets/` (`attic88_day wall88 closet02 shanghai86 office91 market93 basement90 kitchen90 mv10 mortongrove07
playground23`), each with its own `NOTES.md`. Shared between them:

```
sets/_cast.js    the one cast table (CAST.md); addCast() for set-local extras; spec.costume for per-shot looks
sets/_beam.js    beam geometry (beamSolid, prismSolid, coneSolid, splitAtTop) and the mask (applyBeamMask, maskTwins)
sets/_sheet.sh   sh layout/sets/_sheet.sh <set> [mode ...]  -> media/layout/_sheets/<set>_<mode>.jpg and <set>_beam.jpg
```

```sh
node layout/render.mjs --set kitchen90 --exclude beam_                        # the shots, five modes + sidecars
node layout/render.mjs --set kitchen90 --prefix beam_ --modes flat --nojson   # the beam masks (white = in the light)
```
