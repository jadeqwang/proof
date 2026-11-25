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

## Files

```
render.mjs serve.mjs index.html   CLI, static server, page
engine/core.js        mesh helpers; every mesh carries userData.look {grey, col, emit, only, hide, glass, label}
engine/mannequin.js   CAST (heights, colours), hand shapes (HANDS), leg presets, buildFigure()
engine/book.js        the storybook (21 x 28 cm closed): closed or open, anchors for hands, page corners
engine/stage.js       two-pass staging (hands reach book/other figures), placeBook, headAt, solveCamera (orbit + aim),
                      hideParts (POV inserts), analytic shadow projection onto the spread
engine/aim.js         target that puts a world point at a screen position (u, v)
engine/render.js      the five modes, mirror compositing
engine/main.js        page API: renderShot(id, mode), sidecar(id)
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
