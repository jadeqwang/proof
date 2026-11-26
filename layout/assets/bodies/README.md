# Rigged body meshes (PROOF_BODY=mesh)

One rigged human body per person and age, used by `layout/engine/humanMesh.js` when the layout renders with
`--body mesh` (or `PROOF_BODY=mesh`). Off by default: without the switch the mannequins render exactly as before.

## Source and licence

- MakeHuman base mesh, targets, eyes, eyebrows and hair proxies from the **MakeHuman system assets** pack (CC0), via
  **MPFB2 2.0.18** (MakeHuman for Blender, from extensions.blender.org) in **Blender 4.5.17 LTS** (blender.org Linux
  tarball). Both installed outside the repo, in `~/opt/blender-4.5.17-linux-x64/` and Blender's user extension folder;
  the asset pack is unpacked in MPFB's user data (`~/.config/blender/4.5/extensions/.user/user_default/mpfb/data`).
- No network access during the build (MPFB's online access is off); no paid service.

## Rebuild

```sh
~/opt/blender-4.5.17-linux-x64/blender -b --offline-mode --python layout/assets/bodies/make_bodies.py            # all
~/opt/blender-4.5.17-linux-x64/blender -b --offline-mode --python layout/assets/bodies/make_bodies.py -- dad mama  # some
```

About 25 s a body. Writes `<id>.glb` and `meta.json` (per body: measured height, rest bones in Blender z-up, eye and
mouth landmarks, hair styles, MPFB macros).

## Settings (bodies.json)

Per body: sex, age (MakeHuman age macro: 1 yr = 0, 11 = 0.1875, 25 = 0.5, 90 = 1), exact height (the rig and meshes
are scaled so sole-to-crown is the cast height, soles at y = 0), weight and muscle macros (0.5 = average), race
weights, face, hair styles. Ages and builds come from the cast sheets' sidecars (`cast/*/*.txt`); guesses are marked
`_age` / `_build` in the file.

| id | who (layout key) | sex | age | h (m) | face | notes |
|---|---|---|---|---|---|---|
| jade03, jade04h, jade05, jade07, jade10 | jade3, jade4h, littleJade, jade7, jade10 | f | 3, 4.5, 5, 7, 10 | 0.95 - 1.38 | drawn | hair: long01 cut to length + fringe (below) |
| jade19, jade27, jade40 | jade19, jade27, jade (adult, playground23 / bed26 / car26) | f | 19, 27, 40 (guess) | 1.63, 1.65, 1.65 | drawn | |
| mama | mama, mama86, mama90, mama91 | f | 36 (sheet: mid to late thirties) | 1.60 | drawn | bun = long01 cut at the nape + a bun ball; bob = bob02 |
| dad | dad | m | 37 | 1.72 | drawn | slim, narrow shoulders (sheet) |
| firstlove19, firstlove27 | firstLove19, firstLove27 | m | 19, 27 | 1.78 | **none** | no eyes, nose or mouth: the front of the head is faired smooth (safeguard; his face is never shown) |
| friend | friend (mv10) | m | 27 | 1.73 | blank | slight build (sheet) |
| uncle, aunt, grandma, sw | shanghai86 uncle / aunt / grandma, market93 grandma, office91 social worker | m / f | 40, 38, 68, 40 (guesses) | 1.70, 1.58, 1.51, 1.65 | blank | |
| daughter, toddler, partner | bed26 / car26 daughter, playground23 toddler / partner | f, f (guess), m | 4, 1.7, 40 | 1.02, 0.82, 1.78 | blank | |
| adult_f, adult_m | every other adult (mv10 guests, wall88 workers), scaled to the cast height | f / m | 32, 35 | 1.64, 1.76 | blank | sex from the cast entry / key, else hairStyle (as figure2.js) |

Faces: `drawn` = MakeHuman eyes (eyeballs on their own bones `eye_l` / `eye_r`, aimed by `engine/gaze.js`) and
eyebrows; `blank` = strangers the film leaves undrawn: same as `none` since pass 2; `none` = first love: eyes, nose tip and mouth cut, the whole front of the face faired.
All bodies: the nipples are pressed flat (clothes cover the chest; the region colours are painted on the body).

Garments (MakeHuman CC0 clothes, fitted and rigged to each body by MPFB): `garment_long` (male_casualsuit02: a crew-neck
long-sleeved top and jeans), `garment_short` (female_casualsuit01 / male_casualsuit04: a tee and jeans), `garment_skirt`
(the lower half of female_elegantsuit01; daughter, adult_f). Each is two pieces (top, trousers); the engine trims them to
the costume (sleeve length, trouser length, dress) along exact region borders, colours them and hides the body under them.

Hair (`hairBuild` in bodies.json; `build_hair` in the script) is grown from the body's own scalp where no MakeHuman hair
fits the cast sheets, with edges cut along smooth lines (`isocut`):
- first love (`hair_fl`): a long top layer with a centre part over an even short buzz (`hair_fl__buzz`), a visible step
  (solidified rim) from the fringe tip on the forehead back above the ear and round the back at mid-ear height, the
  layer hanging straight at the back (cast/first_love/fl_B_backhead_neck_v5).
- the children (`hair_kidbob` + `__fringe`): MakeHuman long01 cut to the sheet's length (3: chin; 4.5 and 5: shoulders;
  7: shoulder blades; 10: mid-back) and a light fringe parted in the middle, its edge well above the brows; the engine
  adds the small half-ponytail high at the back.
- bun (Mama, aunt, grandmother, women guests): long01 cut at the nape; the engine adds the bun.
Strangers' faces are now as featureless as first love's (cast/strangers sheets: no mark inside the face).

Rig: MPFB `game_engine` skeleton (pelvis, spine_01-03, neck_01, head, clavicles, arms, hands with three bones per
finger and thumb, legs, feet, balls) plus `eye_l` / `eye_r` added by the script. Glb: positions, normals, 4 joint
influences, no materials, no UVs. Mesh nodes: `body`, `eyes`, `brows`, `garment_*`, `hair_<style>` and its `hair_<style>__<piece>` pieces (style names
as the engine's `hairStyle`; `kidbob` = the children's `bob`; `fl` = first love's cut).
