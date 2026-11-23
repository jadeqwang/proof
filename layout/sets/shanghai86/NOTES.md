# shanghai86 — notes and assumptions

Set for verse 1 (0:30-0:59) and bars 1-4 of the piano break (0:59-1:09). Numbers live in `layout.js`.

## Assumptions (the plan leaves these open)
- **Room**: one upstairs room of a lilong house, 3.6 x 4.4 m, ceiling 2.9 m. Window in the left wall, door in the right
  wall opposite it, bed with a mosquito-net frame along the back wall, wardrobe, chest of drawers (radio, thermoses,
  clock), square table and stools in the front-left corner. Main cameras look toward -z, so the beam runs upper left
  to lower right across the frame.
- **Beam**: afternoon sun, elevation 40 deg, swung 12 deg toward the back wall, through a 1.0 x 1.15 m casement
  (sill 0.95). It lands on the floorboards mid-room as a parallelogram about 1.37 x 1.0 m. `BEAM_SOURCE`, `SUN_DIR`,
  `beamFootprint(y)` and `inBeam(p)` define the lit volume; each sidecar carries `beam` (source and footprint in world
  and px, and which heads/hands are inside it).
- **The drift is on the floor**, because the lyric is "my mother finds me sat in a snow drift of paper". She sits in
  the pool of light facing the main camera. The paper is rough tissue (草纸), one sheet 19 cm square.
- **Two states.** `state: 'A'` = the uncle explains (he sits on a stool with his back three-quarters to camera, hands
  low in the shaft, head above it; she stands watching; no drift). Default state B = a week later (the drift).
- **Doubling**: `tissue: 1 | 2 | 4 | 8` is the generation she is on; 1 and 2 are held, 4 and 8 are laid on a clear patch
  in front of her. One locked inside camera (`TISSUE_CAM`) serves all four so the gold dots can double in place.
- **Mother** stands in the doorway, where the shaft points but does not reach. **The laughing adults** (aunt, the
  uncle, grandmother on the bed edge) are by the door, all outside the shaft; Mother is the only drawn face.
- **Her face is inside the shaft** when she sits (it is 0.76 m tall there), so outside shots see a lit face.
- Cast heights: little Jade (3) 0.95 m, uncle 1.70, Mother 1.60, aunt 1.58, grandmother 1.50. Registered set-locally
  in `build.js` (the engine's `mannequin.js` is not edited).

## Engine notes
- `common.js` holds set-local helpers. `fixLeftHands` corrects an engine quirk: left hands are built from a mirror
  basis passed through a rotation-only quaternion, so they come out mis-oriented. The engine is left as it is.
- Label mode tints the lit volume and its footprint yellow. Line mode outlines the lit pool on the floor and fills the
  unlit floor pale grey (`beamLine: false` on a shot turns that off). `lit` is a mood preview only.
- `REF_plan` and `REF_wide` are reference views, not shots.

## Not done
- V1b: the mannequin's mitt hands only indicate "two hands closing on something small"; the pinch is not legible.
- PB1 gives the start frame and an end position; the descent below about 5 cm is the renderer's, not the set's.
- No mote field and no beam-mask render mode yet: the mask is to be rendered from the `beam` geometry.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. `fixLeftHands` in `common.js` is now a no-op (it was only approximate: the hand it produced was still 15-20 % short and a few degrees off). `V1b` after the change: the uncle's two hands meet round the small ball.
- **Cast.** `jade3` and Mama = `mama86` (was `mother`) come from `../_cast.js`; `uncle`, `aunt`, `grandma` stay local.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set shanghai86 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/shanghai86_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (the window opening swept along SUN_DIR to the floor), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: REF_plan / REF_wide / V1a / V1c / V1e / V1g show the shaft. Saturated: `PB1`, `V1d_1/2/4/8`, `V1h` are white over the whole frame (her point of view down into the pool of light: everything in frame is lit); `V1f` is black (the camera is in the shaft, looking at the adults outside it).
