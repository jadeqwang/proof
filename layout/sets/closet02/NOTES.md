# closet02: notes and assumptions

## 2026-11-26: round-3 decisions (supersedes anything below that contradicts it)

Jade's answers: `work/decisions/JADE_R3_DECISIONS.md` (Closet). The r3 review page now reads the old renders from
`media/keyframes/r3/_layout_snapshot/closet02/`.

**What changed**
- **Futon** (Jade: 6 ft closet; a futon to the right that doesn't block the entrance, usually down because they slept
  on it, and down it just barely reaches the closet; matte black frame, navy plaid blanket). `FUTON` in layout.js,
  built in build.js: a full-size bi-fold metal futon in bed mode, mattress 1.37 x 1.91 x 0.15 m on a deck at 0.30 m,
  two black tube arm frames (0.66 m) that stay up, a navy blanket over the top that hangs down the closet side and the
  far end. The closet width (6 ft, 1.80 m) was already what the set assumed.
- **He mirrors her, squarely in line** ("more directly in line to her, matching her"): his pelvis moved from x 0.33
  to her x 0.55 (z 0.38), the same cross-legged lean (spine 14 vs her 14), and the four hands meet on the shared centre
  line at the door line (`HANDS` [0.55, 0.41, -0.02]). Her hands palm-up, his palm-down on them ("He takes both of my
  hands"), each pair now 17 cm apart (was 10) so CL_hands reads as four separate hands. The light still clears his
  right shoulder (it comes from +x, ~0.35 m right of his head).
- **Realistic torsos** for both: new opt-in engine option `torso: 'real', sex: 'f' | 'm'` (`layout/engine/torso.js`,
  documented in layout/README.md): waist, hips (wider for her), bust under a sweater for her / a flat pectoral shelf
  for him, shoulder blades, spine groove, front and back depths separate. Default off: office91 BO1 re-rendered
  pixel-identical (line and flat) with the change in.
- **The opening** (Jade: looking down, not covering her face like crying, fingers to temples, thinking; caption
  "I don't want to apply to medical school."): `CL_wide` (3:23.4-3:28.0, unchanged times) is now the opening. She looks
  down at the carpet between them, middle fingertips on her temples, elbows forward and down (`temples()` in shots.js;
  `<who>:templeL/R` is a new set-local target in build.js). He sits facing her, hands on his knees (`waiting()`), and
  asks "How do you feel?" (3:24.8). The hands meet at 3:28 (CL_hands). The camera moved to [1.35, 2.0, 1.9] (high,
  well right of him: with him in line, a lower camera put his head over hers); rhyme angle re-tuned to 40.0 degrees
  (error 0). The lower fifth of the frame is his seat, the carpet and the futon: room for the caption. The shot
  carries `caption` in shots.js; the timing and type are the plan's call.
- **No fringe plank on her** (lead's note: with her head bowed the fringe slab read as binoculars / a VR headset at
  her eyes): new opt-in engine flag `fringe: 'none'` (all her specs in this set) replaces the plank with a thin hairline
  shell over the forehead. CL_wide now shows the crown of her bowed head with the fingertips at the temples; default
  off, office91 BO1 still pixel-identical.
- `CL_ots` camera moved right (x 0.74 -> 1.05) so his head no longer hides her face (the engine had warned "jade19's
  face is blocked"). `CL_elev` now shows the opening pose instead of head in hands.
- **His face** (facing-camera angle, 180 = back of head): CL_wide 149, CL_ots 156, CL_chin 139, CL_hands head out of
  frame. Never face-on.

**Assumptions / flags**
- **Futon orientation (flag):** read as back against the bedroom's right-hand wall (not built), one arm against the
  closet wall, length running out into the room; folded down, its left edge stops 3 cm past the right jamb (x 0.91).
  The other reading (back against the closet wall, to the right of the opening) would give the same footprint along
  the wall but would not explain why only the down position reaches the closet.
- The blanket is a navy colour only: the plaid is not modelled (stripes would draw as contour lines in the guides).
  Prompts must name "navy plaid blanket".
- The futon shadows the lowest 0.4 m of the light near the right jamb (floor corner only). The beam mask is the
  geometric wedge and does not cut that corner out.
- CL_wide no longer shows the four hands: the "two people, four hands" beat now starts at CL_hands (3:28). If Jade
  wants the hands in the wide too, add a second wide at 3:26.1.
- Light source still open (unanswered): kept as the sun from a bedroom window behind him.

**Repaint in r4:** all four film shots (CL_wide new pose and camera, CL_hands new hand spacing and his position,
CL_ots new camera, CL_chin his new position) plus the futon wherever it is in frame (CL_wide, CL_elev).

## 2026-11-25 (round 2 answers): rebuilt from Jade's drawing (supersedes everything below that contradicts it)

Source: `inputs/refs_closet.png` (private, gitignored): the closet seen from the bedroom. Everything below this
section about a walk-in closet, a hinged door ajar, a 12 cm gap and two people sitting along the closet is replaced.
Compare: `CL_elev` (front elevation, 50 mm from 6.3 m, nearly flat) and `work/closet02_compare.jpg` (drawing | label |
lit, gitignored because it contains the drawing).

**What changed**
- **Reach-in closet with two bypass sliding doors**, both slid LEFT (the left half covered, the right half open), as
  drawn. Was a 2.0 x 1.3 m walk-in with a hinged door ajar 32 degrees.
- **Contents from the drawing:** shelf full width (textbooks standing + one lying flat, stacked shoeboxes, mostly in
  the open half); rod below it; hanging clothes as simple slab masses along the whole rod, hems 0.86-1.04 m (about
  two-thirds of the way down; the lower third open); three long coats down the left edge of the open half to
  0.40-0.46 m; a folded duvet cover (0.58 x 0.58 x 0.09) under her; a few shoes at the back.
- **Staging:** Jade sits cross-legged ON the duvet inside the open half, right of centre (x 0.55; the drawing's
  triangle centre is 56 % across the open half), her head just under the hems. First love sits cross-legged on the
  bedroom carpet in front of her, outside the closet, a little to his left (pelvis 0.33 / 0.40 vs hers 0.55 / -0.42);
  the four hands meet at the door line (`HANDS` [0.44, 0.40, -0.02]).
- **Light (KEYFRAMES 6.2 and the round-2 note):** late-afternoon sun from the bedroom window behind him and to his
  right (34 degrees high, travelling 30 degrees off square toward -x) comes over his right shoulder into the open
  half and lights her WHOLE FACE and the four hands; his shadow falls to the left of her, on the panels. Every edge
  is crisp (parallel light): left = the slid-open panels' edge (the "door" edge of the wedge), right = the jamb,
  top = the window head (band top 1.06 m at her face, so the clothes above her are dark), bottom = floor. The rest of
  the bedroom is out of the sun (the window has jambs and a sill), so the light reads as one wedge through the open
  half. The old set lit only the hands through a 12 cm gap.
- **Cameras re-aimed, intents and -2sm timings kept:** `CL_wide` 3:23.4-3:28.0 from high in the bedroom behind him,
  over his right shoulder (rhyme 39.6 degrees, right-to-left, at her face; anchor changed from beamMid to face);
  `CL_hands` 3:28.0-3:29.4 her POV (head hidden), el 68; `CL_ots` 3:29.4-3:32.5 over his right shoulder, level on her
  lit face (sung); `CL_chin` 3:32.5-3:34.2 from his right side and behind, his face at 99 degrees from the lens (jaw
  in near-profile), her right hand's BACK on his chin, held there by his right hand (KEYFRAMES noted the old one
  touched with the fingers). First love is never face-on (CL_wide 143, CL_ots 138, CL_chin 99 degrees).
- **New reference shot `CL_elev`** (not in the film, no mask twin): the drawing's viewpoint, Jade alone at the poem's
  first beat, head in her hands.
- **Masks:** now `applyBeamMask` with `maskTwins(..., { surf: true })`: `beam_<id>` (volume + lit surfaces; CL_hands
  stands inside the light so it is surfaces only) and `beam_<id>__surf` (lit surfaces only; use it for CL_ots and
  CL_chin, where the volume fills the frame). The solid starts 0.22 m in front of the closet: his sunlit back is in
  the flat/lit renders but black in the masks; figures' cast shadows are not cut out of the masks.

**Assumptions (flag for Jade)**
- Size: a 6 ft bypass closet, opening 1.76 x 2.03 m (two 0.90 m panels), 0.61 m deep inside, 7 cm returns, 2.44 m
  ceiling. The drawing's outline is 1 : 1.13 (w : h), which 1.8 x 2.03 matches.
- Heights: shelf 1.72, rod 1.60 (drawing scaled to the opening gives ~1.63 / ~1.48; a stock closet is ~1.73 / ~1.68).
  Chosen so the hems land where she drew them.
- Her pose: the triangle read as cross-legged and hunched (poem: "sitting cross legged on our folded duvet cover");
  the duvet is UNDER her (poem), not in front of her.
- The window: not modelled; one stand-in wall far back along the light with a hole whose jambs, head and sill give the
  wedge its edges. Sun height and direction are invented to light her face and give CL_wide its 40 degrees.
- He sits outside on the carpet (poem: "in front of me, on the carpet"; the digest notes this is an inference).

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

## 2026-11-26: fixed background art and clothing decals (Jade: art and logos the same in every shot)
- The navy plaid blanket on the futon is a fixed tartan drawn in code (closet02/art.js): navy ground, forest-green
  bands, thin white and red overchecks, 0.15 m repeat (SETT INVENTED; Jade: "a navy plaid blanket"). Lit/flat/form show
  it; line/contour only faintly so the stripes do not read as folds. Prompts: "the navy plaid exactly as in the guide".
- No wall art in this set. Hanging clothes, duvet and shelf contents stay plain (proposals in work/background_art_audit.md).
