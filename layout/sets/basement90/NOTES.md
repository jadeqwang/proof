# basement90 — Decatur basement, 1990 (verse 2b 2:16, "Good catch!" 2:21)

Beam: the CRT screen, the only light. `layout.js` holds every number; `house.js` holds what is shared with `kitchen90`
(same plan coordinates; the kitchen is directly above x -1.8..1.8; the stair door in the kitchen's left wall opens onto
this set's top landing). `kit.js` = set-local helpers used by both sets.

Render: `node layout/render.mjs --set basement90` -> `media/layout/basement90/` (sheets: `_sheet_<mode>.jpg`).

## Assumptions (the plan leaves these open)
- Unfinished basement 4.7 x 4.2 m, 2.3 m clear, exposed joists, block walls, open-riser stair along the left wall,
  night (hopper window dark, bare bulb off).
- Desk against the back wall, screen facing the room. Horizontal desktop PC with a 14 in CRT on top, dot-matrix printer.
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
