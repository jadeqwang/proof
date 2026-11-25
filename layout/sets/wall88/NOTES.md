# wall88: notes and assumptions

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
