# playground23: indoor play centre, Austin, 2023

The coda's last bar (4:21.7) and the final shot. REBUILT in round 4 (2026-11-26): the old outdoor clubhouse with the
acrylic pane and the reflections is gone (its notes are kept at the bottom, marked superseded).

```sh
node layout/render.mjs --set playground23 --exclude beam_
node layout/render.mjs --set playground23 --exclude beam_ --modes form,contour,light --nojson
node layout/render.mjs --set playground23 --prefix beam_ --modes flat --nojson
node layout/engine/holdcheck.mjs media/layout/playground23
node layout/engine/clipcheck.mjs --set playground23 --exclude beam_
```

## 2026-11-26: round-5 decisions (done)

Jade's answers (work/decisions/JADE_R5_DECISIONS.md, verbatim there):
- Offering a hand: she added inputs/catchair_shuttle.png (a real photo of the real play shuttle: LOOK-ONLY, never sent to
  an image model; the venue is a real business, so nothing from it is branded in the set). Rebuild the shuttle to that
  form and scale; restage the kids mid-climb, each reaching back to a clearly held adult hand.
- Pairs: Jade with the girl, Dad with the boy (as built).
- Dad 2023: about 66-67 looking (chronologically 70; looks young, Westerners guess 50s); hair a bit more salt-and-pepper,
  white at the temples; otherwise as his photo. Thin rectangular semi-rimless glasses.
- The boy in socks.
- Dad: white polo shirt, black pants, a black-ish backpack (Jade: a SwissGear; built as a GENERIC black laptop backpack,
  no readable logo: FLAGGED) with kids' water bottles in the side pockets: one black/green with a blocky pixel pattern
  (Jade said Minecraft: NO trademarked logo or characters, only the colours and a pixel-block texture as one canonical
  decal) and one pink cat bottle (a generic cat face, one canonical decal). Jade did not describe her own outfit: kept
  as built (FLAGGED).
- Venue: Catch Air (Google Maps and Street View still say Catch Air). Recorded here only; the set stays unbranded.

What was done:
- **Bodies moved** to layout/assets/bodies as NEW files: girl4.glb, boy7.glb, dad23.glb, meta_pg23.json,
  bodies_pg23.json, make_bodies_pg23.py (writes there; the shared bodies.json / meta.json / make_bodies.py / BODY_OF are
  untouched). The set's bodies/ folder is deleted; bodies.js loads /assets/bodies/meta_pg23.json and swaps the three in
  for this page. ASK engine-body: merge the three into meta.json and BODY_OF, then delete bodies.js.
- **The pale shapes beside the boy's head**: his cut stopped high at the back sides (the shared HAIRLINE table), so his
  full cheeks (cheek volume 0.9) and ears showed as pale points either side of a V of hair from behind. Fixed in the
  body: a new crop option `hairline` brings his cut down round the back and sides to the nape; cheeks 0.9 -> 0.7.
  Checked in PG1 (lit / form): none left.
- **The shuttle, rebuilt to Jade's photo** (layout.js SHUTTLE / RAMP / STEP; build.js shuttle()): a low rounded body
  (0.62 m, a rounded-box section lofted along x) narrowing into a nose with a black wrap-round windscreen band and a
  black chin (art.js bodyArt, one image), a black belly line; a panelled wing ramp in front (black padded wedge, three
  white panels in black frames) from 0.52 m at the body to the floor; a flat panelled wing beyond; a black padded block
  (0.32 m); a taller rounded rear section (0.95 m) with a crawl-through arch and black slanted stripes on top. No
  hatches, steps, cradle or fin any more. From the photo also: a red-and-white soft-play rocket and a generic hanging
  astronaut (white, dark visor, no character). READ FROM THE PHOTO, FLAGGED: which piece is nose vs. rear (I read the
  right piece as the nose, the arched piece as the rear), the scale (~0.75 / 0.95 m), no tail fin.
- **Staging** (shots.js family()): the girl halfway up the ramp on the balls of her feet (left knee up, her left hand
  on the ramp, leaning in 75 deg of spine bend), her right hand back in Jade's left; the boy with his right foot on the
  block and his right hand on the body's top corner, his left hand back in Dad's right. Both kids' held hands: palm
  medial, fingers back and down, elbow out (natural for an arm reaching back; the alternatives broke the elbow or the
  wrist). The clasp: build.js stages the kids first, reads their SOLVED hand frames, then gives each adult a hold
  cylinder through the child's palm centre (palm against the child's palm, axis in the child's palm plane tilted so the
  adult's fingers point down-forward along the forearm: natural wrist), HOLD_R girl 0.058 / boy 0.07 m (the radius at
  which the fingers touch the child's hand without entering it).
  - holdcheck (Rapier): Jade-girl contact 0.5 mm, penetration 0 / 0, pass; Dad-boy 0.4 mm, 0 / 0, pass (PG1, PG2).
  - clipcheck: PG1 / PG2 / PG2_plate pass: no body vs body; grips Jade-girl -0.7 mm, Dad-boy -2.7 mm (limit 3); joints
    in range; the boy's sole 1 mm / trouser 5.5 mm into the block (cloth, soft padding).
  - wrists: every hand inside its range after small turns (girl L 12, girl R 16, boy L 29, Dad R 16 deg toward the
    forearm; Jade's grip needs none).
- **The boy in socks**: sock 0xdcdcd6 (light grey: colour not given, FLAGGED).
- **Dad 2023**: costume DAD23 white polo (short sleeves) + black trousers + dark shoes (shoes not described: FLAGGED);
  poloCollar() a soft folded collar open at the front; dadHair(): one canonical salt-and-pepper skin
  (art.js dadHairArt: near-black, fine grey and white flecks, greyer at the sides, white temples) mapped round his head;
  the glasses (thin rectangular semi-rimless) as before. Body unchanged (age 67).
- **Backpack + bottles** (real models, CC BY, credited in docs/credits_tools.md): layout/assets/props/backpack ("Diaper
  Bags" by fabbear: a standard laptop daypack; the patch texture with the maker's logo removed by the download agent;
  recoloured flat black: GENERIC, no logo, FLAGGED that Jade's is a SwissGear) worn on both shoulders (PACK scale 0.9);
  layout/assets/props/kids_bottle ("Sport Waterbottle" by psychofisch) twice in the side pockets with one canonical
  decal each (art.js pixelBottleArt: black / green pixel blocks, no logo or character; catBottleArt: pink with a
  generic cat face). New prop folders only; props.json NOT edited (loadProps works by name): ASK engine-body to add
  them to props.json.
- **Jade's rare earth outfit** (jadeOutfit(), art.js jadeOutfitArt: ONE chart over her top and trouser garments, u round
  her torso axis, v up it; sleeves measured down the arm so the arm bands sit at the chest band's distance from the
  shoulder): cropped white jacket, bare midriff, black mock-neck front strip, orange chest and arm bands, pale-blue dot
  on the left chest, a large pale-blue circle on the back (BLANK: the turnaround shows no lettering on it, so none is
  placed; mostly hidden by her hair from behind), a blank sleeve patch with a black ring on her left upper arm, navy trousers with a black waistband and orange straps. White sneakers
  as white socks (the engine has no shoes). FLAGGED: the trousers are the body's stock slim cut, not wide cargo; the
  loose wave of her hair is not modelled; the jacket's "RARE EARTH" / "1420 MHz" lettering is not placed (not legible
  on the turnaround). Costume warning: Jade's and Dad's tops are both white (dE 2.4): true to both outfits.
- **Lead's fixes (same night):**
  - The sleeve patch read as a white HEART (the jacket chart distorted it on the bent arm). It is now its own decal
    (art.js sleevePatchArt, transparent outside the circle; build.js sleevePatch): 8 cm across, raycast onto the
    sleeve along the arm's outward normal at 13 cm below the shoulder (the arm band). Measured side-on in a temporary
    test camera along that normal: the inner disc is 450 x 461 px (aspect 0.98). In PG1 it is seen nearly edge-on (a
    thin ellipse on the arm's outer side). Sidecar key `sleeve_patch` (world, px, outward).
  - Dad's hair read as white radiating stripes: the first mapping clamped everything above the brow to one texture
    row, stretching the flecks. Now a cap mapping (u azimuth, v the angle from the crown, 0-135 deg) and a new skin
    (dadHairArt): near-black with fine 1-2 px grey / white flecks scattered over the whole cap (a little denser low on
    the sides and back), white only at the temples above and in front of the ears; no edge map (the flecks stay out of
    line / contour). Checked in a side test view and in PG1.
  - Re-rendered all three passes; holdcheck and clipcheck pass as before; PG2 rhyme -1.8 deg, mote centred.
- **Cameras**: PG1 pulled back and down (pos -0.1, 1.9, 4.1; lens 32) to show the whole shuttle, the ramp and the kids'
  feet. PG2 unchanged: rhyme angle error -1.8 deg, travel right-to-left, the mote at (960, 540); the beam now lands on
  the rear section. The rocket's nose cone enters PG2's left edge.
- Rendered all three passes (27 files) into media/layout/playground23/. gallery.py not run (the lead's sweep).

Venue (notes only): Catch Air (Jade: Google Maps and Street View still say Catch Air). The set stays unbranded.

## 2026-11-26 round 4 — PROGRESS (checkpoint)

### Jade's directions for this set (verbatim where quoted)
- "the playground is Catch Air in Austin" (an indoor children's play-centre chain).
- "most of catch air is far from windows, it's all indoor overhead lights, and it's all space themed". So: no sun, no
  window; overhead fixtures; space theme everywhere.
- Light option "(b) would be good" (a space-theme light gives the diagonal beam with the mote), "and instead of looking
  at reflections (which is a bit boring to look at), we can have me and my dad offering a hand to the 2 kids getting
  into a play space shuttle". Reflections and the pane are dropped.
- The kids: "girl, younger, age 4, boy, older, age 7, her image is in 1-music-shipped/chaosmonkey-video, and his image
  is in the original moongazing video". Written here only as "the girl" and "the boy".
  - The girl: /home/jade/Documents/1-music-shipped/chaosmonkey-video/design/characters/daughter/daughter_A_turnaround_v3.jpg
    (proportions), plus the H / C sheets in that folder. Warm brown curly hair (never black) in two Dutch braids into
    low pigtails with pink elastics; pink dress with a red strawberry print, puff sleeves; white socks; big round head;
    mixed Chinese and European. 1.09 m.
  - The boy: /home/jade/Documents/1-music-shipped/moongazing/media/chars/T/SHEET.jpg and moongazing/docs/character_bible.md
    "### T (boy, 7)". Very dark short hair, large round head, full round cheeks, no jaw angle; deep azurite knitted
    crew-neck with small white stars, one ringed planet and one rocket; navy trousers; brown lace-up boots. 1.32 m.
  - Jade on the boy: "son is 99th percentile height for his age and has a 20% larger head than typical for his age and
    height, so he looks like a younger kid who happens to be tall". Painter wording: "a young-looking 7-year-old who
    happens to be very tall, with a large round head; never a teenager or a 10-year-old".
  - The sheets are NOT copied into this public repo; referenced by absolute path only.
- "dad's hair should be like his reference photo" (inputs/family_photos/, a real photo: looked at for modelling only,
  never passed to an image model): near-black, full and thick, swept up and back from the forehead with a side part,
  a bit of lift on top, sides short and tidy, at most a faint grey at the temples. Thin rectangular semi-rimless
  glasses (the 1990 sheets have gold aviators; the photo's style is used for 2023: FLAGGED).
- "the shot for the space shuttle should be from behind so we don't look closely at the kids faces". HARD RULE: every
  camera is behind the family; no child's face is readable in any guide.

### Research (for my modelling only; no web photo goes to an image model)
- Catch Air Austin was at 13450 Research Blvd (US-183) Ste 107, "Austin Plaza 183" strip centre (TDLR project record
  EABPRJB5814410, finish-out 2015). Community Impact (2019-11-13): the Austin and Round Rock franchises were renamed
  PlayMazing on 2019-11-15; some listings now show that site closed. FLAGGED: in 2023 the Austin site may have traded as
  PlayMazing, or Jade means another / reopened Catch Air in the Austin area. The set is generic either way.
- catchair.com location hero photos (Austin, Marietta, Johns Creek; viewed, not stored in the repo): black open-web
  joist ceilings, round LED high-bays and spot cans, multi-level soft-play frames with padded coloured posts, black
  netting and clear acrylic panels edged with LED strips, printed padded floors (orbit rings, planets), hanging planet
  spheres, a white soft-play shuttle / rocket pieces, a big flame-printed slide and tube slides. Community Impact
  (2017-01-14): the Round Rock Catch Air was "outer space themed".

### What is built (done)
- layout.js / build.js / shots.js / art.js rebuilt: a dark hall (black joists and deck, navy walls, a space mural),
  round LED high-bays on a 3 m grid, a three-level soft-play structure behind (padded posts, netting, acrylic panels
  with LED strips, wave slide, tube slide), hanging planets, a padded printed floor, and in front the soft-play
  SHUTTLE (white padded vinyl hull, black belly, two kid-height hatches with orange padded trim, padded blue steps,
  tail fin, delta wings, nose cone). No text, logo or brand mark anywhere (FLAGGED: generic, unbranded).
- Canonical art, one image each, drawn in code with fixed seeds (art.js): floor print, mural, three planet skins,
  the shuttle skin, the girl's strawberry print, the boy's star knit + ONE chest motif (one ringed planet, one rocket).
- The beam (option b): a theatrical LED accent spot on a drop pipe from a joist (3.0, 4.2, -2.5), half-angle 4.5 deg,
  aimed down-left past the family's heads onto the shuttle's tail end; the mote at (0.3, 1.9, -1.7), above the shuttle.
  PG2 measures 40.4 deg right-to-left with the mote at the frame centre (sidecar beam.rhyme).
- Bodies (set-local bridge, bodies.js + bodies/): girl4 (1.09 m, 5.68 heads), boy7 (1.32 m, crown-to-chin 0.256 m =
  5.15 heads; a typical 7-year-old body is 6.2), dad23 (1.72 m, age 67, fuller face, swept-up near-black hair with a
  left part). Built by a copy of make_bodies.py in bodies/; swapped into HUMAN.bodies for this page only. ASK: the
  cast agent should add girl4 / boy7 / dad23 to layout/assets/bodies and the engine's BODY_OF; then delete bodies.js.
- Staging: the girl on the front step, her right hand back in Jade's hand; the boy on the rear step, his left hand
  back in Dad's. WHO HELPS WHOM chosen for composition (FLAGGED): Jade (camera-right, by the nose) helps the girl; Dad
  helps the boy. Hand model: the child's palm turned back, the adult's hand from behind palm-forward, fingers down
  round it. PG1 holdcheck: both pass; clipcheck: both grips pass (girl gap -2.9 mm, boy -2.9 mm).

### Done since the checkpoint (milestone 2, final for this round)
- Hands: the child's palm turned back, the adult's hand from behind, palm forward, fingers down round it. Tuned by
  measurement (PALM_GAP in layout.js). holdcheck (Rapier): Jade-girl contact 0.5 mm, 0 penetration, pass; Dad-boy
  1.6 mm, 0, pass. clipcheck: grips Jade-girl -2.9 mm into skin, Dad-boy -2.6 mm (limit 3); body vs body none; joints
  in range; PG1 / PG2 / PG2_plate pass. Only remaining world contact: Jade's sole 4.9 mm into the padded floor (soft).
  PG2_plate's holdcheck "no object" is expected (the figures are hidden in the plate). Margins are tight (2.9 of 3 mm).
- ENGINE BUG (reported, not fixed: engine/humanMesh.js): a figure in a dress has no bare legs (the body's leg faces are
  hidden under the unused trouser garment). Workaround in build.js girlLegs(): a second build of the girl without the
  dress, its trouser legs below the hem moved onto her in her skin colour. The bed26 / car26 daughter likely has it too.
- Beam: spot at (3.25, 4.2, -2.5), half-angle 2.5 deg; mote (0.1, 1.75, -1.8). PG2 39.5 deg right-to-left, mote at
  (960, 540); PG1 38.1 deg (not a rhyme frame). Lands on the shuttle hull (raycast). beam_<id>_flat masks rendered.
- Gaze: PG1 Jade -> the girl's head, Dad -> the boy's head; PG2 Jade -> the mote; error 0 deg; the kids look into the
  hatches (blank faces, never seen).
- Brightness (grey, 480x270): PG1 lit mean 89.8, p5 18, p95 187; PG2 lit 82.3 / 17 / 227; PG1 form 151.7 / 72 / 226;
  PG2 form 156.1 / 103 / 213; PG1 light 131.5 / 107 / 175. The dark joist ceiling is the p5; figures, shuttle and
  structure read in every mode.
- Zoom-checked: no child's face is readable in any guide (both seen from behind; the boy's ear shows).

### Suggested plan-row wording (the plan doc is not edited)
Last bar (4:21.7): *4. Austin, 2023.* An indoor play centre, deep inside, all space themed, under overhead lights.
Seen from behind: Jade and her dad each hold the hand of a child climbing into a soft-play space shuttle (the girl, 4;
the boy, 7). A spot's shaft crosses the dark toward us; her adult eyes leave the girl and follow a mote in it (PG2,
the attic's diagonal).

### Flags / questions
- Venue name in 2023 (PlayMazing rename, see above).
- Who helps whom (composition choice).
- The kids' faces are blank in the guides (the engine draws eyes only for Jade / Mama / Dad); they are never seen.
- The girl in socks (plausible: play floors are socks-only for kids); the boy keeps his boots (Jade's sheet) although
  most play centres are socks-only: FLAGGED.
- Dad's 2023 clothes (blue-grey shirt, khaki trousers) and Jade's (the engine's adult Jade costume) are guesses.
- No downloaded props fit (soft-play parts are custom; no parent seating in frame). None used, none credited.
- PG2 shows the shaft, the mote and the soft-play frame; the shuttle is only a sliver at the lower left (the shaft
  must pass above everyone's heads, so the mote is above eye level).
- The boy's built hair edge is a hard cap-like step (bodies/README); the girl's braids are built from the scalp (the
  shared pigtails asset is one braid and a side fringe).
- bodies.js is a bridge: girl4 / boy7 / dad23 are swapped into HUMAN.bodies (slots adult_f / adult_m / dad) for this
  page only. ASK the cast agent to add them to layout/assets/bodies and the engine's BODY_OF.


---

## SUPERSEDED (before round 4): the outdoor clubhouse

The last bar of the drum coda (4:33) and the final shot (4:35-4:39). Glass, low sun, three silhouette reflections,
one mote. Three cameras, one of them a plate.

```sh
node layout/render.mjs --set playground23        # PG1, PG2, PG2_plate + their beam_<id> mask twins
sh layout/sets/playground23/sheet.sh label line lit
```

| shot | what |
|---|---|
| `PG1` | 4:33, from behind and above the family: three backs, and in the pane their three reflected faces as silhouettes; the beam crosses the room behind the glass |
| `PG2` | 4:35, the rhyme frame: along adult Jade's eye-line through the pane to the mote, beam from upper right to lower left |
| `PG2_plate` | PG2's camera with the reflection layer off: clean plate for the beam mask, the mote's exit and the dotted line |
| `beam_*` | same cameras, `flat` mode = the beam mask (lit volume white, figures in front of it black) |

## Assumptions

- The glass is the acrylic front pane (1.5 x 1.2 m) of a wooden playground clubhouse, 3.2 x 2.6 m inside.
- **Two panes, not one.** The sun is behind the clubhouse and enters by a smaller back window; the family looks in
  through the front pane. A first version had the sun entering by the same pane the family looks through: every sight
  line then starts inside the lit volume, so the mask is the whole pane and no diagonal can be seen. With the sun's
  window on the far wall the shaft is seen from the side and reads as a band.
- This also makes the silhouettes physical: the family stands in the clubhouse's shade with the sunlit playground
  behind them.
- The family is adult Jade, her partner, and their child as a toddler carried on the partner's arm (so all three faces
  are at pane height). Jade is the engine's `jade`; `partner` and `toddler` are registered from `build.js`.
- Sun altitude 25 degrees, travelling toward the family and 24 degrees to their left. The shaft lands on the floor and
  the foot of the front wall (below the pane) and does not come out through the front pane.

## The diagonal

The attic set (`attic88_day/beam.js`, `RHYME`) fixes the shared framing: on screen the light travels from upper
RIGHT to lower LEFT, 40 degrees below the horizontal, through the centre, tolerance 3 degrees. `PG2` measures 37.7
degrees, right to left, with the mote at the exact centre (sidecar `beam.rhyme`). `PG1` is not a rhyme frame (57
degrees).

## Reflections

Built as virtual images: the family is built a second time, mirrored in the pane plane, and drawn as dark silhouettes
standing behind the glass. Every mode therefore shows reflections and beam together. They cast and receive no light
and are absent from the mask twins. Only the figures are reflected, not the playground behind them. The engine's own
mirror compositing was not used because it replaces the glass with an opaque mirror, which would hide the beam.

## The mote

`MOTE.hero` is on the beam 2.3 m from the back window, 0.2 m under the beam's top face, nearer the glass than the
reflections. `exit` leaves through the top of the light; `after` is where the gold dotted line stops. Pixel positions
are in each sidecar (`mote.path_px`).

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Times** follow `analysis/v3/song_map.md`: PG1 4:33.2-4:35.3 (last bar of the coda groove), PG2 4:33.2-4:38.4, drums stop 4:35.3, PG2_plate 4:35.3-4:38.4 (final tone gone by about 4:37.5, file ends 4:38.4). Labels only.
- `beam.js` is now a re-export of `layout/sets/_beam.js`; `build.js` takes `CAST` from `../_cast.js` (`jade` is the engine's; `partner`, `toddler` stay local). Renders re-made after the engine's left-hand fix.

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- PG1 4:21.7-4:24.1 (coda's last bar), PG2 4:21.7-4:28.4, PG2_plate 4:24.1 (last hit)-4:28.4 (the bass note rings and
  fades, gone by ~4:28.0).

## 2026-11-26: hold pass
- The partner's right hand is flat and palm up under the carried toddler's thigh (off y -0.09; was a cup at -0.06 with
  the fingers curling into the thigh): `grasp: 'palmUnder', object: 'figure:toddler:leg'`. It passes on the mesh body.
  It fails on the mannequin: the mannequin child's leg is 2-3 cm fuller there, and no single hand position touches both
  bodies. The hand is out of frame in PG1 / PG2 / PG2_plate.

## 2026-11-26: round-6 decisions

Jade: "PG1 as rebuilt: the rough shape and size is correct, but the inside of the space shuttle should be hollowed out
and have seats the way it does in the photo"; "You in socks or sneakers? Socks".
- Read from inputs/catchair_shuttle.png (look-only): the body between the arched rear section and the nose cowl is an
  open-topped tub; a black high-backed bucket seat stands right behind the cowl, its back well above the rim.
- Built (layout.js SHUTTLE.cabin, SEATS; build.js bodyGeo/cabinGeo/seatGeo): outer shape and size unchanged. The nose
  cowl is now a closed solid from x 0.62 (its flat back face = the cabin's front wall). The cabin (x -1.15..0.62) is ONE
  closed solid: the body's own outer section below a flat rim at 0.52 m, 7 cm walls, a black padded base at 0.10 m.
  Two black padded bucket seats (0.42 wide, cushion 0.30, back top 0.82) in TANDEM on the centre line facing the nose:
  one right behind the cowl (as the photo), one mid-cabin. FLAGGED: the photo shows only one seat; the second seat and
  tandem (vs side-by-side) are my reading. Tandem was chosen partly because side-by-side seats behind the cowl are
  hidden behind the girl and Jade in PG1; the mid-cabin seat shows between the boy and the girl.
- These meshes are solids (no `double`), so clipcheck now tests bodies against them (the old body was a sheet).
- Restage: the boy's right hand is flat on the rim (boyHandOn [-0.62, 0.546, -1.09], fingers level), spine bend 60 -> 67
  so he still reaches. The girl unchanged.
- New reference shot REF_cabin (nobody drawn; hideFigs) to show the cabin; not a film shot.
- Socks: Jade in white socks (JADE23 sock 0xf0f0ec), as built: confirmed.
- Checks: clipcheck PG1/PG2/PG2_plate/REF_cabin pass (girl 2.5 mm skin into the cabin's outer wall at her left hand,
  boy sleeve 3 mm cloth on the rim, boy 1/5.5 mm into the block as before). holdcheck PG1/PG2 pass (0.5 / 1.5 mm, 0/0);
  PG2_plate and REF_cabin "no object at the hand" because the figures are hidden (as before). check_bodies: eyes all
  OK; the only body-body overlaps are the two clasps and Dad vs his worn backpack (as before). Pre-existing, not fixed:
  the girl's left toes ~19 mm into the ramp's black padded frame (foam; clipcheck treats the ramp as a sheet).

## 2026-11-27: real-size feet / hands (engine agent)
- girl: ankleR y -0.31 -> -0.302 (her longer foot's toes were 8 mm into the ramp); girlHandOn y 0.52 -> 0.527 (the
  fingertips, skin now out to the tip pad, were 7 mm into the rim). Clip check: all shots pass.

## 2026-11-27: Dad's glasses are the engine's canonical frame
The set-local placeholder glasses() (a top bar per lens, quads, straight temples) is gone: `DAD23.glasses = 'dad23'`
gives him the canonical semi-rimless frame from `engine/glasses.js` (FRAMES.dad23, layout/CAST.md "Glasses"), fitted to
the dad23 body (pads on the nose, arms over the ears). His Decatur frame (gold double-bridge aviators, `dad90`) is a
separate mesh; the prompt names the 2023 one ("NOT his old gold aviators").
