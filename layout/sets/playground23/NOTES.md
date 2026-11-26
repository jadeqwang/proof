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
