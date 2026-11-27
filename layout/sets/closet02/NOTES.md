# closet02: notes and assumptions

## 2026-11-26 (late): round-4 decisions (supersedes anything below that contradicts it)

Jade's answers: `work/decisions/JADE_R4_DECISIONS.md` (Closet), plus a direction sent mid-session.

**What changed**
- **Light (cl_light: "Window sun over his shoulder (crisp wedge) — there is also a ceiling light").** The sun wedge is
  unchanged and stays the key. NEW: the bedroom ceiling light (`CEIL_LIGHT` in layout.js, `ceilingLight()` in build.js),
  ASSUMED type (flag): a 2002 flush-mount frosted-glass dome, 0.33 m across, on a white canopy at (0.75, 2.44, 1.85), on.
  It is a soft warm point light (wide soft shadows) in lit (6.0) and flat / light (2.4); the shadow-line pass (line mode)
  keeps the sun's crisp edges only. The fixture and a small ceiling plate are non-casting (the ceiling would otherwise
  block the stand-in sun). It is out of frame in every film shot; the sidecar `lights` lists it.
- **Futon (cl_futon: same spot, rotated 90 degrees, matte black railing visible, "the railing should be a rounded
  square").** Its length now runs along the closet wall (x 0.95-2.96), the back against the wall, an arm frame at each
  end; the folded-down half reaches 1.40 m into the room on legs and a front rail. Read BOTH ways (flag): each arm is a
  rounded-rectangle loop, and the tube is a rounded-square section (25 mm, 6 mm corner radius). Swept in code
  (`sweepTube`), matte black, dark in form too. BEDROOM.x1 3.4 so it stands on carpet. No licensed futon model was found
  in the props library (props_audit has none); built in code.
- **CL_ots lower (cl_cam_height).** Camera y 0.90 -> 0.76 (about his ear height), as on fl_G_ots_hair_v5.png.
- **Four hands (cl_hands_open).** Checked: CL_wide has her fingertips at her temples and his hands on his knees; the four
  hands first come together in CL_hands (3:28). Nothing changed.
- **Plaid (art_plaid): kept.**
- **Her hoodie (Jade, corrected: "taking the existing hoodie and making it cardinal red with a white seal at the pocket
  instead of whatever that is. also she should be wearing socks"; her real sweatshirt's cream STANFORD letters are left
  out on purpose: too legible).** Her cast-sheet hoodie: zip-up, worn OPEN over a white tee, hood down. Only the
  colour changes, to cardinal 0x8c1515 (`SWEATSHIRT` in shots.js). `sweatshirt()` in build.js adds: the white tee strip
  between the open fronts, zip edges, a split kangaroo pocket, the hood as a roll round the back of the neck (under her
  hair), ONE seal decal (`layout/assets/art/logos/closet_seal.png`, drawn by `seal_art.py`: three rings and a conifer, no
  letters, not the real seal), and two soft tapered fold rolls over the pocket that hide parts of it. The decal itself
  is undistorted (the first version's shear and squash read as a smear and is gone). Seal position (Jade, r4: "on breast pocket location, the normal place
  where school seals go"): her LEFT chest, 8 cm across, centre 8.5 cm left of and 10 cm below the shoulder centre, on the
  open hoodie's left front panel; two folds cross it. The kangaroo pocket is plain. Sculpted folds, not a cloth simulation.
  **Socks:** white sock shells over both feet (the body mesh showed toes, which read as bare). Jeans mid-blue, as on the sheet.
  **Cast sheet:** `cast/jade_19/*` still say a heather-grey hoodie with "No logos". Not edited (the cast agent owns cast/); the prompts override it.
- **Props phase 2:** nothing to swap (props_audit: closet02 books are canonical code spines; no held props). Hold check
  not applicable (hand-on-hand contacts only, as before). Futon clearance measured per shot in the sidecar
  (`futon_clearance`): her nearest vertex 9.3 cm and his 8.8 cm from the frame; none inside the mattress.

**Repaint in r4:** CL_wide, CL_hands (red sleeves), CL_ots, CL_chin (+ CL_elev reference). Prompt notes in
`work/r4/REPAINT_LIST.md` (closet02 section).

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

## 2026-11-26: hold pass
No hand holds or rests on an object in this set: the contacts are hand on hand (the four hands; CL_chin his hand over
hers), fingertips on her own temples, and the back of her hand on his chin. The hold check cannot test these yet: hand
meshes are never candidate objects, the fallback picks whatever part of the other figure lies within 1 cm by bounding box
(for CL_chin his own forearm, not his chin), and every hand inside that figure's box, its owner's included, is counted as
touching. Tried and reverted (shots.js unchanged); asked the hold agent for an engine option (body-part targets).

## 2026-11-26: post-sweep fixes (after the engine r5 soles fix)
- **His foot in the wall.** With the soles 2-4 mm above the floor, first love's crossed foot was 15.8 mm into the right
  jamb (bedroom wall) at floor height in all four shots. `SEATS.firstLove` x 0.55 -> 0.52 (3 cm off her centre line,
  facing and pose unchanged). Stepping him back 3.5 cm instead only moved the foot into the casing (7.3 mm). Clipcheck:
  his wall / casing contact is gone. Still flagged, pre-existing: his skin 10.3 mm into the carpet, her knee 13.4 mm
  into the bedroom wall, her hair/sleeve into the hanging clothes, and knee-to-knee overlap between them (his skin
  32.5 / cloth 46 mm into her; was 33.4 / 45.2).
- **His hair under the warm key.** FL_HAIR 0x1f1915 rendered warm chestnut in lit (#4d3623 on CL_ots). A closet-only
  lit-pass override (`FL_HAIR_LIT` 0x141214 in build.js, his hair meshes only; other passes and _cast.js unchanged)
  now reads #2f2620 on CL_ots, against the v8 sheet's ~#2e2420. CL_chin reads dark cool brown too.
- Re-rendered all three passes.

## 2026-11-26: round-6 decisions
- Hair re-render (r6 final, lead): target = the hair shade Jade asked for (measured reference), ~#3f342e (dark, slightly warm brown, a little cool grey, no red). FL_HAIR 0x2b2420 (v8 0x1f1915; ~1.37x lighter, calibrated in normal light, NOT on dim scenes). closet02 lit-only FL_HAIR_LIT 0x1a181b: CL_ots hair samples #40342d. mv10 is a dim set (C2b hair #0e0a08 -> #130e0c). No geometry change. Painter refs: the v8 sheets are darker than the target; next paint session tell the painter #3f342e (or redo the sheet as v9).
