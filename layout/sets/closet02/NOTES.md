# closet02: notes and assumptions

"Proof": closet, about 2002 (chorus 2a, 3:33-3:43).

## Assumptions
- **A walk-in bedroom closet**, 2.0 x 1.3 m inside, 2.4 m high; door in a long wall, opening outward, left ajar 32
  degrees (a 12 cm straight-through gap). Rail with clothes and a shelf on the back wall. Year, house and room are guesses.
- **The light is afternoon sun from the bedroom**, square on to the door wall, 49 degrees high, passing the door gap:
  a shaft 12 cm wide and 29 cm tall that lands on the four hands. The bedroom is not modelled; two stand-in slabs
  outside the door cast the shaft's upper and lower edges (window head, furniture under the window). If the light
  should be a lamp instead, give `BEAM` a `src` point instead of `dir`.
- **Cast** (set-local, added to CAST only if absent): `jade19` 1.63 m, `firstLove` 1.80 m. First love is never
  face-on: all four cameras are at his end. CL_chin is near-profile from behind his right shoulder (jaw line).
- Her hands are palm-up under his.

## The beam
- `BEAM`, `SHAFT`, `DOOR` in layout.js. Real door gap + shadowed directional light; solids and sidecar as the other sets.
- **Mask**: `node layout/render.mjs --set closet02 --prefix beam_ --modes flat --nojson`.
- Rhyme: **CL_wide** 40.2 degrees, upper right to lower left (a true band). The 49 degree altitude was chosen so that
  this camera, which looks down on the shaft, reads 40. CL_ots 45.9, CL_chin 29.7 (not tuned).
- In CL_wide his right arm hides most of the hands; they are fully seen in CL_hands.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. `CL_hands` after the change: his two hands lie flat on her two palm-up hands, symmetric (before, both left hands were twisted). `CL_chin` uses her right hand and is unchanged.
- **Cast.** `jade19` and `firstLove19` (was `firstLove`) come from `../_cast.js`; sidecar keys changed accordingly.
- `beam.js` is now a re-export of `layout/sets/_beam.js`.

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- Chorus 2a 3:23.4-3:34.2: CL_wide 3:23.4-3:28.0 (drums alone to 3:26.1), CL_hands 3:28.0-3:29.4, CL_ots 3:29.4-3:32.5
  ("I honestly don't know" sung 3:29.45), CL_chin 3:32.5-3:34.2 (stretched to meet chorus 2b at 3:34.2).
