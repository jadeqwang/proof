# office91 — notes and assumptions

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
