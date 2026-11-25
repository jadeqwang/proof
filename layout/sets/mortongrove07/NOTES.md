# mortongrove07: notes and assumptions

"Proof": bridge, "Beauty on this side" (v3 song map 169.4 s = 2:49.4 onward; the shot runs to the cut to the Expedit
pan on "truth by reference" at 171.8 s; the line ends 173.5 s). The living room of 5748 Capri Lane, Morton Grove, IL,
during grad school (she commuted from here to Northwestern in Evanston; he had transferred from Harvard to Princeton).
First love hands her a folded white sweatshirt with the Institute for Advanced Study seal in dark blue.

First love is a real person: he is never named anywhere in this set, and no camera shows his face (his hair only).

## From Jade (authoritative)
- She sits on a FLORAL couch near some windows. Over the shoulder from behind him, only his hair; he hands her the
  sweatshirt: WHITE, IAS seal in DARK BLUE, round, two standing figures, TRUTH (left) and BEAUTY (right).
- The three-seat floral couch stands against the FRONT (south) wall of the living room, and its end stops just before
  the big window begins: couch and picture window side by side on the same wall (not under it, not on a side wall).
- His hair: dark brown, relatively straight. Cork Birkenstock-type sandals (Naot) in most scenes; forearm hair clearly
  visible (both in the sidecar `first_love` block).

## The house (documented; inputs/refs_mortongrove/README.md, gitignored)
- 1955 split-level, 1,296 sq ft, a plain rectangle 11.1 m E-W x 11.6 m N-S (the README's 11.8 is slightly off: the OSM corners give 11.63), FRONT FACING SOUTH onto Capri Lane, back
  yard north (about 1 degree off north: ignored). Main level (living, dining, kitchen); bedrooms half a level up; rec
  room half a level down.
- Living room 16 x 14 ft (4.9 E-W x 4.3 N-S m) at the front: from 5837 Capri, a near-identical 1957 neighbour (GUESS
  for 5748 itself). Picture window facing the street.

## Assumptions (flagged; change freely)
- **Axes are the compass**: x east, z south, y up; origin = the living room's inner SW corner. In the house frame
  (origin = SW corner of the footprint, x east, y north) the living room is x 6.0-10.9, y 0.2-4.5: the SE corner of
  the footprint, i.e. the main-level wing is the EAST half and the two-storey (bedrooms over rec room) wing the WEST
  half. Which side the stair wing is on is unknown.
- **Which end of the couch is nearer the window**: the picture window is in the WEST part of the south wall
  (x 0.35-2.70: a big fixed light with a narrow casement each side, sill 0.50, head 2.05), the couch in the EAST part
  (x 2.80-4.80), its west arm 0.10 m from the window trim. Reason: the afternoon sun travels north-east, so from a
  window west of the couch it falls on her and the sweatshirt; with the window east of the couch the afternoon light
  would run away from the couch (it would need a morning sun). She sits on the couch's WEST cushion, next to the
  window; he stands in front of her and a little to her right (east), so he does not block the window.
- **Openings typical of the type**: an opening to the entry / stair hall in the WEST wall (z -1.0 to -2.4, 2.03 high;
  beyond it a landing, a half flight up to the bedrooms and a half flight down to the rec room, a half wall between
  them); a cased opening to the dining room in the NORTH wall (x 0.5-2.3); the front door is in the stair hall (not
  modelled). Kitchen behind the dining room (not modelled).
- **Ceiling: VAULTED (Jade, 2026-11-25).** A cathedral ceiling: two plain drywall planes rising from the east and west
  walls (plate 2.44 m = 8 ft) to a ridge running NORTH-SOUTH along the room's centre line (x 2.45), pitch 4 in 12, peak
  3.26 m; the south (picture-window) wall and the north (dining) wall are gable ends (`VAULT`, `ceilY` in layout.js;
  `vault()` / `gableWall()` in build.js). **GUESS, flag to Jade: the ridge direction.** The footprint puts the
  main-level wing in a strip about 5.5 m wide E-W running the house's full 11.6 m N-S depth (living room at the front,
  dining and kitchen behind), so its roof most plausibly spans the short E-W width with the ridge front-to-back and a
  gable facing the street over the picture window. The alternative (ridge E-W, parallel to the street) would make the
  side walls the gables and leave the front wall at 8 ft. Pitch and peak are also guesses (a low 1950s roof). The vault
  is assumed to continue over the dining room beyond (not modelled; the north gable wall stands above the cased
  opening). No exposed ridge beam, no gable/clerestory windows above the picture window (they would change the light
  Jade approved).
- **Furniture** (invented): small coffee table in front of the couch's east end, armchair on the east wall with a side
  table and lamp (off), TV on a low stand on the north wall facing the couch, rug, framed print over the couch, drapes
  pulled back at the window's two ends. The floral pattern is not modelled (pale dusty rose).
- **Year 2007** (grad school was about 2005-2009); `SCENE` uses 2007-11-05.
- **The sun (SCENE, a staging choice)**: Monday 5 November 2007, 15:30 CST, computed for 42.0525 N, 87.7709 W with the
  NOAA equations (as shanghai86): elevation 10.9 deg, azimuth 237.0 deg (WSW). Picked by `sweep.mjs` (Oct 2007 - Apr
  2008, 12:00-17:00 every 10 min: 115 of 498 suns put her face, her hands and the sweatshirt in the shaft with > 0.1 m
  to spare); 15:30 also clears her forearm's shadow off the seal. Similar light any afternoon from late October to
  February between about 15:00 and sunset minus 40 min. The aperture is the picture window narrowed by the 0.2 m wall
  reveal for this sun; eaves are not modelled (a sun this low passes under them).
- **What the sun does**: it comes from beside and behind her (from her left, out of the window next to her), so it
  RIMS her: hair, left cheek and shoulder, her hands, the sweatshirt (the seal fully in the sun), his back and right
  shoulder; it ends in patches high on the east wall. Her face toward the camera is in the window's soft skylight, not
  the direct sun. Margins (sidecar `sun.in_sun_margin_m`): her eyes 0.47 m inside the shaft, the seal 0.66.
- **Cast**: `jade27` (kind `adultJade27`, 1.65 m) stands in for Jade at about 24 (no closer age in the cast table);
  placeholder blue-grey long-sleeved top. `firstLove27` (kind `adultFirstLove`, 1.78 m, hands and feet the same
  absolute size as hers), `costume: { sleeves: 'pushed' }` so the forearms show, bare feet in plain cork sandals
  (set-local geometry). Sandals indoors is an assumption.
- **Blocking**: she sits forward on the west cushion, turned 12 deg toward him; he stands 1.0 m in front of her and
  0.42 m to her right, leaning in 26 deg, looking at her. The folded sweatshirt (0.30 x 0.34 x 0.05 m) is held at 0.88
  m, 0.53 m from him toward her and 0.16 m to his right (so the over-the-shoulder camera sees it past his arm), tipped
  10 deg toward her.
- **The four hands** use the arm `hold` API: each closes on a side edge of the stack (cylinder r = half its thickness,
  `prop: false, centre: true, axis` along the edge): thumb on top, fingers under. His two on his half, hers on her
  half. Arm reach: his 0.98 / 0.94 (the arms extend), hers 0.84 / 0.75.
- **The seal** is a dark-blue disc (r 7 cm), label `IAS seal (Truth, Beauty)`; it reads upright for HER (top toward
  him, TRUTH on her left), so it is upside down from any camera behind him; MG2 is her eye-line, where it reads
  upright. Sidecar `sweatshirt.seal` and `panes.seal_square` (TL, TR, BR, BL as she reads it) for painting it on.

## Cameras
| id | what | his face | notes |
|---|---|---|---|
| `MG1` | over his right shoulder, behind and above (35 mm, el 38), looking south | 144 deg from the lens: back of head and ear | her face (28 deg to lens), the seal and her hands; the picture window at frame right; light travels right to left |
| `MG2` | her eye-line down onto the sweatshirt (24 mm, her head hidden) | out of frame | seal upright, four hands, his bare forearms at the top; sun from her left |
| `MG_wide` | reference wide from the dining-room side (20 mm), looking south | 148 deg | couch frame left, picture window frame right |
| `REF_plan` | plan, north up | from above | front wall at the bottom, stair hall left |

Sidecars carry `time` / `film` (169.4-171.8 s, lyric, the cut), `house`, `sun` (SCENE, elevation, azimuth, margins),
`sweatshirt`, `first_love` (face_shown false, facing angle, hair, sandals, forearm hair), `beam`.

## Beam masks
- `node layout/render.mjs --set mortongrove07 --prefix beam_ --modes flat --nojson`
- `beam_<id>` = the lit volume (air + surfaces); `beam_<id>__surf` = lit surfaces only. MG1 and MG2 look through the
  broad shaft, so use `__surf` there.
- Not one of the rhyming 40-degree beams: on screen MG1 30 deg right to left, MG_wide 25.

## Drawing sheets for Jade
`inputs/refs_mortongrove/print/` (gitignored): page 1 the footprint, page 2 the living room with these guesses dashed,
check bar, four registration squares, `registration.json` (made by `make_sheets.py` there).

## Open
- His ear shows in MG1 (back three-quarter, 144 deg). Moving the camera further behind him hides the seal behind his arm.
- Which end of the couch meets the window and the stair-wing side: guesses above. Ridge direction and pitch of the vault: guess (see Assumptions). Jade 2026-11-25: room, light, date (about right) and his ear in MG1 are fine.
- Small shadow-line acne on the couch's east arm in MG1 line mode.
- The folded sweatshirt is a plain slab with a hem band; folds and sleeves are for the painter.

## History
- 2026-11-25 late: ceiling rebuilt as a vault (ridge N-S, 4/12, peak 3.26 m), from Jade's decision-page answer. Sun
  check: the light enters below the window head (2.05 m) and only falls, so it never reaches the vault; the beam
  sidecars are unchanged, MG1 and MG2 lit/line renders are pixel-identical to before (the ceiling is out of frame), the
  in-sun margins are unchanged (her eyes 0.47 m, the seal 0.66). MG_wide shows the south gable rising over the window.
  REF_plan's near plane cuts at 2.38 m, below the vault, as before.
- 2026-11-25 first pass: an invented 4.0 x 5.0 m room, couch on the back wall under two windows, side window sun.
  Superseded the same day by the refit to the real house (this file).

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- `FILM` (layout.js): t 159.62-161.96 ("Beauty on this side" to "truth", where the plan cuts to the Expedit pan), line
  159.62-164.36, time 2:39.6-2:42.0; MG2 insert header 2:40.2. NB mv10's `BRpan_a` also starts at 159.62 on "Beauty on this
  side"; the plan starts the pan on "truth by reference" (2:42.0): one of the two wants settling.
