# mv10: the housewarming, 345B View St, Mountain View, fall 2010

```sh
node layout/render.mjs --set mv10 --exclude beam_                      # every shot, five modes, sidecars
node layout/render.mjs --set mv10 --prefix beam_ --modes flat --nojson # the beam-mask twins
sh layout/sets/mv10/sheet.sh label line lit flat                       # contact sheets in media/layout/_sheets/
python3 layout/gallery.py
```

## 2026-11-25 (2): the real 345B, from Jade's drawings (supersedes everything below it)

The set was rebuilt from Jade's own drawings of the house she lived in. The digitised plan, with what was read,
inferred and assumed, is in `inputs/refs_house/interior_plan.md` / `.json` / `.png` (gitignored). `layout.js` holds
every number; `V3h` (plan) is the reference view.

**Axes** (the house frame of `inputs/refs_house/print/registration.json`, in three.js terms):
- X = NNE (0 = the SSW outer wall line, 11.915 = NNE); Z = ESE (0 = the WNW front wall, 9.954 = the ESE wall facing the
  yard); y = up, 0 = the house floor.
- The yard is at GRADE = -0.6.
- yaw 0 faces ESE (+Z); a camera looking at the Expedit looks ESE, with beauty frame-left (NNE) and truth frame-right
  (SSW, toward the 2x2 and the opening).
- V3h: NNE up, front at left, yard at right.

**Reading the drawings** (details and every inconsistency in `interior_plan.md`):
- Page 1 (1:200 site plan) was registered on the printed 345B outline: +/-0.15 m indoors, +/-0.3 m in the yard.
- Page 2 is half the house, drawn freely and ROTATED on the 1:60 footprint page: top = WNW, bottom = ESE, left = SSW,
  right = the core. Its printed wall labels do not apply.
- Its scale is not uniform. The Expedits are drawn about one grid cell per cube (0.37-0.40 m/cell), while the rooms
  fill the page (0.476 m/cell across, about 0.95 down). So room sizes come from page 1 and the footprint, and the
  furniture is at real size, placed by Jade's relations.

**Rooms:**
- Living room 4.77 (WNW-ESE) x 4.74 m, interior.
- Kitchen and dining 4.73 x 4.74 m.
- The partition between them runs from the core to 2.30 m off the SSW wall. The 2x2 Expedit stands at its end, so the
  clear opening is 1.76 m against the SSW wall.
- Ceiling 2.44 m.
- Floor 0.6 m above grade (assumed; the stairs say it is raised).
- Gable roof with its ridge NNE-SSW, 5.6 m above grade (city height).
- The core (bathroom, hall, laundry, bath 2), tea room and bedroom are walled with doors, enough for the house to read.

**Where things are** (world X, Z):
- Expedit 5x5: on the partition's living-room face, facing WNW, X 2.67..4.52, front Z 4.535. Contents and data
  unchanged; only its place moved (`SHELF_AT`, `shelfWorld`). Seam X 3.595; the truth half is SSW (X 2.67..3.595).
- 2x2 Expedit: X 1.91..2.30, Z 4.605..5.395, facing SSW into the opening, printer on top.
- Couch: back to the WNW wall, X 0.15..2.55, with the chaise at the SSW end to Z 1.8.
- Noguchi table (IN-50, 128 x 93 cm): centre (1.72, 1.98).
- Round glass-top table: (4.39, 2.35).
- Front door: WNW wall, X 3.85..4.75, open 30 deg in. Front steps down to grade.
- Counter U: along the partition, the core wall and the ESE wall. Sink and stove are ours.
- Pale IKEA table 1.8 x 0.9: end to the SSW wall, Z 7.2..8.1, with benches tucked in both sides.
- French doors (Jade's): ESE wall, X 0.6..1.82, both leaves open in.
- Patio, read as a raised deck at floor level: X 0.93..3.88, Z 9.95..12.97.
- Stairs: a landing, then four risers down ESE to the lawn at Z 12.5, by the mint barrel (4.84, 14.2).
- Strawberry bed: X 1.03..3.89, Z 13.07..15.06.
- Clothesline at X 8.2, from the house to a T-post by the back fence.
- Hose: (9.57, 11.12).
- GIANT lemon tree: (10.79, 19.07), canopy r 2.3 m, top about 5.3 m above grade, 26 pomelo-sized lemons (r 0.085),
  all hung above 1.8 m.
- The neighbour's grapefruit: canopy at (13.45, 12.85), over the NNE wood fence (X 13.1).
- Fences: the back fence at Z 20.2; the SSW fence at X -0.3 (assumed).
- Neighbours: city footprints with their listed heights, as prisms at 0.8 x height (357, 345A, 327, the NNE and SSW
  buildings, the ESE outbuildings). Two present-day sheds in the yard are not built.
- Lemonade table on the deck; the poi spinner on the open lawn at (4.0, 17.3).

**The aerial**: Google's "345B" pin is on 345A's hip roof. The roof Google calls "345" is 345B; it matches OSM and the
city layer. The present-day wooden deck between the two houses is not in Jade's drawing; it is a platform, with no
effect on light.

**Light, honestly** (`SCENE` in `layout.js`):
- One date: Saturday 2 October 2010, PDT. The date is OUR pick inside Jade's "likely fall 2010".
- A clock time per section, with the real sun computed for each (NOAA equations) and the neighbours, roof and fences as
  occluders. `sunlit()` / `apertureLit()` give the analytic numbers; the flat / lit renders use a shadow-mapped sun.
  Sunset 18:52 at az 266; civil dusk ends 19:17.

- **Bridge 16:30** (late-afternoon daylight; Jade: the party started while it was light): sun 25.8 deg, az 242 (WSW).
  - The WNW living-room window is 89 % sunlit (357 View St clips its SSW part); the front door 100 %; the SSW
    living-room window 20 %; the SSW dining window 63 %.
  - The shaft crosses the couch's NNE end (the SSW end is in 357's shadow) and lands on the floor out to the glass
    table and the NNE wall.
  - It never reaches the Expedit or her face at the shelf: the shelf is lit by daylight from the windows, not by sun.
  - From about 17:00, 357's shadow climbs over the WNW window. By 17:30 no direct sun is in the living room.
  - The yard is sunlit in the bridge.
- **Verse 3, 18:25** (the sun going down): 4.3 deg, az 262.
  - No sun enters any window.
  - The house's shadow has covered the tree mark since 17:42; the whole lawn, the deck, the grapefruit and her head
    under the tree are in shade.
  - Only the top of the lemon canopy still catches the sun, until 18:32. That is the last light in the set.
  - Ceiling lights on, fire poi lit.
- **Silence 19:20, chorus 2b 19:22**: sun -6.8 deg, just past civil dusk. A deep-blue sky, ceiling lights inside, the
  poi outside.

**Lights:**
- `LIGHTS`: sun (per section), ceiling (three fixtures, `CEILING_ON` per section: off in the bridge, on from verse 3),
  poi (verse 3 on), sky ambient.
- The three ceiling fixtures are a flush dome in the living room, a paper-drum pendant over the dining table, and a
  flush dome in the kitchen. Jade: "there were ceiling lights"; type and place are ASSUMED.
- No floor lamps.
- `FOOTPRINTS`: the sun through each opening per section, `sun_yard` (not masked), `poi_ground`.
- Beam masks: `beam_<id>` (every light on), `beam_<id>__surf`, `beam_<id>__sun` (shafts through the living-room and
  kitchen openings that see the sun, clipped by the room box; a partly shaded window is masked whole, and the flat
  render has the true edge), and `beam_<id>__poi`. The ceiling fixtures are omni: no mask. HS1's masks are empty (the
  room is gone).

**The three lamps and the three shadows are GONE** (Jade: the paper lamps were invented by an earlier agent; drop the
image). Removed: the lamps, the shadow ribbons, `three_shadows` in the sidecars, `SHADOW_GEOM`, and the `__lamps` /
`__dusk` mask twins.

Retired shots (their old renders are in `media/layout/mv10/_retired/`):
- BR5: existed only for the shadows.
- BR4a (square-on halves) and BR4b (sci-fi beside the Feynman set): replaced by the pan below.

**New shots:**
- **BRpan_a / BRpan_m1 / BRpan_b** (Jade): a lateral track across the Expedit. 35 mm, level, 1.45 m high, 1.45 m from
  the frame front.
  - a: centred on the beauty half, "Beauty on this side", 159.62 s.
  - m1: the seam, "truth by reference", 161.96 s.
  - b: cube 4,4, the Feynman set plus the sci-fi paperbacks, "Science fiction shelved with truth", 164.41-166.80 s.
  - Times are on the -2sm timeline (`media/karaoke_v2/lyrics_timed.json`, full mix); the sidecar `timing` also gives
    the old v3 map's numbers. `BRpan_a` carries `move` (via m1 to b).
  - She is not in frame (our choice: the track is her eye-line).
- **V3_rcv** (orthographic top-down, the engine's `ortho`) and **V3_rcv_obl** (steep oblique, about 58 deg down, with
  the SSW wall, ceiling and roof cut away), for "Room crossing velocity" (-2sm 194.59-198.72 s).
  - Sidecar `crossing`: the path in metres and px, timestamps, speed per segment (INVENTED, 0.85-1.28 m/s, slow at the
    opening and the doors), turn angles, the obstacles and nearby people with px, and the shortest walkable path.
  - The walk: 8.06 m in 7.68 s (mean 1.05 m/s), against a 6.51 m straight line and a 7.33 m shortest walkable path:
    1.10x the shortest.
  - Preferred: V3_rcv for the overlay (true scale, no foreshortening); V3_rcv_obl reads people and furniture better.
- **V3_rev_temple_a/b** and **V3_rev_eye_a/b**: the push-in on "I nod, past hour reviewed" (-2sm 189.11-191.52, "nod"
  189.23-189.79).
  - She is under the lemon tree, mid-nod (head 14 deg down), facing first love. 50 mm, dolly from 0.85 m to 0.19 m
    (temple, three-quarter toward profile from her left) or 0.13 m (left eye, three-quarter).
  - Sidecar `face_marks` gives her eye and temple px in each frame.
  - New figure anchors `eyeL/R` and `templeL/R` are set in `build.js` (engine untouched).

**Staging** (`shots.js`):
- Shelf mark (2.72, 3.62), facing the room. First love at her right, reading the textbooks (cube 3,3), back to the
  room; her right hand taps his elbow.
- Chorus 2b: he faces her from (2.95, 3.12).
- Tree mark (9.9, 17.95) under the canopy's house side; he stands at (9.25, 17.3).
- Her path (`PATH`): shelf, the opening by the 2x2, round the dining table's NNE end, the French doors (greeting,
  V3c), the deck (hug, V3f), the landing, down the stairs, across the lawn, the tree.
- Guests:
  - living room: S1 and B2 on the couch, B1 by the SSW window, group A by the glass table and front door, E1 in the
    front door
  - kitchen: the C group inside the U, 0.7-1.4 m off her route
  - deck: T1 (lemonade), G1 (greeting), H1 (hug)
  - lawn: W1 and W2, watching the poi
- V3a now looks down the yard from the deck's far corner. SI1 has the poi directly behind her across the lawn. V3e is
  her view of the poi from the tree.
- First love (Jade): Naot cork sandals, modelled as plain sandals (set-local) and noted in the sidecars
  (`first_love_costume`). Forearm hair clearly visible: his sleeves are rolled up in this set (a set-local copy of the
  cast entry; `_cast.js` keeps 'long').

**Checked by eye:**
- V3h (label, flat, lit); BR1 (label, line, lit); BR3 (flat, lit); the pan keys (line); V3a; V3b; V3d; SI1; V3c;
  V3g; V3_rcv (line, flat); V3_rcv_obl (lit); the lit and beam contact sheets.

**Known issues:**
- Interiors in `lit` are dim for daylight.
- The dining pendant glares in flat / lit top-downs.
- V3b, under the canopy, is dark (honest shade) and reads mostly by the lemons.
- The mannequin's hair fringe box shows in close shots (engine).
- In C2b the forearm reads small.

## Older notes (superseded by the section above)

One set, two connected spaces sharing the sliding door: the bookshelf room and the yard. `layout.js` holds every
number; `V3h` (top-down plan) is the reference plan for the whole set.

```sh
node layout/render.mjs --set mv10                 # 19 shots, five modes, sidecars
sh layout/sets/mv10/sheet.sh label line lit flat  # contact sheets in media/layout/_sheets/
node layout/render.mjs --set mv10 --shots BR5 --modes line,flat,lit
```

Axes: x -3 (hall wall) .. +3 (slider wall) .. 11 (west fence); z 0 (shelf wall) .. 4.4 (lamp wall). +x = west.
A camera looking at the shelf has the yard frame-right.

## The three shadows (BR5; also drawn in BR4a, BR4b, C2a) [SUPERSEDED 2026-11-25: see the Expedit section at the end]

- Three identical paper floor lamps along the front wall: same bulb height (1.30 m), same distance from the spines
  (3.865 m), 1.1 m apart, all to her right. She stands 1.155 m in front of the spines.
- Same height and same distance means one magnification (1.43) for all three, so the shadows are shifted copies:
  0.40 / 0.87 / 1.34 m to her left, 0.47 m apart, all on the TRUTH half. Heads are fully separate, shoulders overlap.
- Measured from the render (sidecar `three_shadows`, BR5): all three are 1.77 m tall with head centres at the same
  height, 0.46 m apart. Their overall widths are 0.92 / 1.04 / 1.16 m: each lamp sees her body from a more oblique
  angle (19 / 37 / 49 degrees), so the far lamps' shadows are about 12% wider each. Near-identical, not identical.
  Making them exact copies would need the lamps symmetric about her, which hides the middle shadow behind her.
- `line` and `label` draw each shadow's outline as a ribbon computed by projecting her mannequin through each lamp
  onto the spine plane. `flat` and `lit` show the same shadows from real shadow maps; the two agree.
- Guests are placed outside the lamps' paths to her and to the truth half, so only she throws shadows there.

## Assumptions (the plan leaves these open)

- [SUPERSEDED 2026-11-25 by Jade's Expedit, see the end] Shelf halves: LEFT = TRUTH (dark case, uniform reference sets, one run of science-fiction paperbacks at her eye
  height next to the seam), RIGHT = BEAUTY (pale case, novels and art books of every height). This answers the plan's
  open question "should the truth side visibly be reference books, with the science fiction among them" with yes.
- Room 6.0 x 4.4 m, ceiling 2.44 m. Yard 7.9 x 10 m, fence 1.8 m, concrete patio outside the slider.
- The yard is west of the room, so the dusk sun sets behind the far fence. Sun 6 degrees up; the fence shades the
  lawn, so the sun only touches what stands above about 1.0 m (house wall) to 1.4 m (tree): heads, lemons. One shaft
  enters the slider and crosses the room away from the shelf (it lands on the hall wall), so the shelf is lit by the
  lamps alone.
- Light by section: bridge = lamps + dusk; verse 3 = lamps + dusk + fire poi; silence and chorus 2b = lamps + poi
  (dusk gone).
- The lemonade table is on the patio ("lemonade from the yard"). Lemons have r 0.085 m.
- First love in BR5 has stepped away to the slider, because anyone beside her at the shelf throws three shadows of
  their own into hers. In BR1/BR2/BR4/C2 he is at the shelf and his shadows do fall there in `flat`/`lit`; the line
  renders draw only hers.
- The silence (3:29) is staged in the yard under the lemon tree, poi directly behind her, since chorus 2b is "back at
  the shelf".
- Her route (`PATH`): shelf mark, across the rug, the open slider (greeting), patio (hug), under the tree (first love).
- Cast is registered from `build.js` at load (`jade27`, `firstLove`, sixteen guests); `engine/mannequin.js` is not
  edited. Guests have eyes, nose and mouth removed. Jade's 115% is a sidecar field (`amplitude_pct`), not geometry.
- First love is only ever seen from behind: BR1, BR2, BR4a, V3a (distant, turned to her), V3d, C2a, C2b.

## Not modelled

- Cups in hands, spine text (the titles are data in `layout.js`, not drawn), the fence boards, window treatments.
- Shadows of her on the floor in line mode (only the part on the spines is outlined).
- No beam-mask twin shots: the lit volume of the dusk shaft is given as numbers (`duskShaftAt`, `FOOTPRINTS`), and the
  lamp light on the shelf is the `flat` render.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. No pose was changed. Looked at after the change: `BR1` / `BR2` her left hand is at his elbow; `C2b` her (right) hand lies on his forearm beside the cup.
- **Cast.** `jade27` and `firstLove27` (was `firstLove`) come from `../_cast.js`; guests stay local.
- **Beam masks** (`node layout/render.mjs --set mv10 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/mv10_beam.jpg`). Per camera: `beam_<id>` (every light that is on, together), `beam_<id>__surf` (the same without the dusk volume), and one per light: `beam_<id>__lamps`, `beam_<id>__dusk`, `beam_<id>__poi`.
  lamps = the bookcase fronts (FOOTPRINTS.lamps_on_shelf) minus Jade's three computed shadows, with people in front occluding. It is a SURFACE mask: three omni lamps have no shaft.
  dusk = the shaft through the slider as a volume (the opening above the fence shadow, along DUSK.dir to the floor / left wall / front wall).
  poi = its ground footprint (radius 4.5 m, clamped to the yard) plus the flames and their circles.
  NOT masked: the dusk light in the yard (everything above `duskFloorY(x)`: heads, canopy, lemons).
  Looked at: lamps good in BR1-BR6, C2a, HS1; dusk good in BR3, V3c, V3f, V3g, V3h; poi good in SI1, V3a, V3e, V3h. Saturated: `beam_BR1`, `beam_BR4a` and their `__dusk` are white over the whole frame (the outside camera stands against the shaft and looks through it: use `__lamps` / `__surf`). `V3b` is black in every twin (her view up into the tree: only yard dusk there). A per-light mask is black wherever that light is not in frame.


## 2026-11-25: Expedit, from Jade (supersedes the shelf, the three-shadows numbers and the staging above)

Jade's memory, authoritative: ONE IKEA Expedit 5x5 in espresso, square cubes, books in every other cube; LEFT half art
and literature, RIGHT half science fiction, textbooks (Fundamental Neuroscience, Principles of Neural Science,
Nonlinear Dynamics and Chaos, the Feynman Lectures I-III) and popular science (The Dragons of Eden, A Short History of
Nearly Everything, ...). The 12 other cubes hold art objects: candles (NOT lit), a ceramic polar bear, figurines of
open-source mascots. So the lyric halves are now **LEFT = BEAUTY, RIGHT = TRUTH** (the opposite of the old guess).

**The shelf** (`layout.js` `SHELF`, built by `shelf()` in `build.js`). Self-contained: move it with `SH_CX`; cubes,
halves, seam, shadow receivers and the lamp mask all follow.
- 185 x 185 x 39 cm, outer frame 5 cm, dividers 1.6 cm, cube 33.72 cm (derivation in `layout.js`). 185 x 185 x 39 is
  IKEA's listed size; the ~5 cm frame is from a secondary source ("nearly 2 inches"); **the 1.6 cm divider is our
  estimate** (no figure found), which gives the commonly quoted ~33-34 cm cube. Open back: the wall shows through.
- Centre x = **-0.45** (spans -1.375 .. 0.475), against the back wall; rest of the wall bare; room size unchanged.
  Off-centre because of the shadows (below).
- Books stand with spines 1.5 cm behind the frame front (`spineZ` 0.375). Per-cube title lists with sizes are in
  `layout.js` (`BOOKS`, and `SHELF.cubes[].books`); every sidecar lists each cube's contents and pixel corners
  (`shelf.cubes`) for image prompts. Kandel 28 x 22 x 6 cm; the three Feynman volumes are one red cloth, a matched run;
  science fiction is mass-market (17.5 x 10.6 cm); art books are tall (to 32 cm) and in three cubes lie flat.
- Objects (`OBJECTS`): candles (pillars, unlit), the polar bear, Tux (twice, one small), the BSD daemon, GNU, the
  Firefox fox (twice), the PostgreSQL elephant. Simple primitives, 7-18 cm, set 23 cm deep in the 39 cm cube.

**Assumptions beyond Jade's facts** (all ours, to confirm):
- "Every other cube" read as a checkerboard with the corners filled: books where col + row is even (13 cubes),
  objects in the other 12.
- The middle column's three book cubes are split down the seam: art / literature from the left wall, science from the
  right wall. It reads fine in BR4a; nothing about it looked wrong, so it stays.
- Every title Jade did not name is a placeholder of ours in the right category (art: Taschen monographs, Gombrich,
  Berger, Albers ...; literature: García Márquez, Calvino, Borges, Nabokov, Woolf ...; science fiction: Dune,
  Foundation, Neuromancer, Le Guin ...; extra textbooks: Dayan & Abbott, Spikes, Alberts; more popular science).
  Editions and therefore exact sizes are guesses (Principles 4th ed., Fundamental Neuroscience 3rd ed., both 2008 or
  earlier, plausible for 2010).
- Which mascots, how many candles, and which cube holds what are our picks.
- Which cube holds which books: textbooks at 3,3; the Feynman set with science fiction beside it at eye height (4,4,
  for "science fiction shelved with truth"); popular science at 4,2 and the science halves of the middle column.

**The three shadows, re-solved** (derivation comments in `layout.js`; `SHADOW_GEOM` computes them):
- Her mark (pelvis) **x 0.55, z 1.44**: the shelf's right end, half past it. d = 1.065 m in front of the spines.
- Lamps on the front wall at **x 1.15 / 1.93 / 2.71**, z 4.15, bulbs 1.30 m: D = 3.775, M = 1.393, k = 0.393;
  0.60 / 1.38 / 2.16 m to her right, 0.78 m apart.
- Shadows step to her LEFT by 0.307 m: head shadows at **x 0.31 / 0.01 / -0.29, y 1.66**, all in the top row of cubes:
  lamp 1 on the Feynman + science-fiction cube (4,4), lamp 2 in the Tux object cube (3,4), lamp 3 on the science side
  of the split cube (2,4). **All three heads are on the TRUTH half.** Heads touch but are separate.
- **The bodies do not all fit the truth half**, which is 0.925 m wide while the three shadows together span about
  1.6 m (each ~0.9-1.05 m wide). Measured (BR5 sidecar, as if the face were one plane): shadow 1 is 79 % on the shelf,
  all of that on truth, and 21 % runs off the shelf's right end onto the bare wall (behind her from the BR5 camera).
  Shadow 2 is 100 % on the shelf, 99.5 % on truth. Shadow 3 is 100 % on the shelf, **70 % truth and 30 % across the seam
  on the art books**. BR4a, BR4b and C2a are within a few percent of this.
- Why not more on truth: three separate heads need ~0.31 m steps; at this distance that needs lamps ~0.78 m apart, and
  the 6 m room leaves no more space to her right. A smaller M needs lamps further apart than the wall allows; a
  larger M widens every shadow. With the lamps on the hall side the mirror solution fits equally, but the lamps
  would stand in the hall doorway and group A in their paths, so the lamps stayed on the slider side and the shelf
  moved 0.45 m left.
- **Object cubes are open to the wall**, so there the shadow falls on the back wall 0.375 m deeper: bigger (k 0.53, not
  0.39) and shifted. The edge jumps where it passes from spines into an object cube, and the cube's own frame shades
  part of the recess. The line ribbons are now drawn on three receivers (frame front, spines, back wall in object
  cubes and the bare wall round the shelf), so line mode shows the jump honestly. The gaps above short books are
  treated as spines (small error). Objects in the recess catch the shadow in flat / lit only.
- Lamp mask (`beam_<id>__lamps`): frame front + the spines of the 13 book cubes + the back wall of the 12 object
  cubes, minus her three shadows on each, people in front occluding. Cube sides / floors / tops are not in it.

**Staging changes** (`shots.js`):
- First love at the shelf (BR1, BR2, BR6; V3g) is at **x 0.0, z 1.32**, now on her RIGHT (frame left), reading the
  textbooks; her RIGHT hand taps his right elbow (mirrored from before). He is in the lamps' paths there, as before:
  his shadows fall on the shelf in flat / lit; line draws only hers.
- BR4a / BR4b: he stands past the shelf's left end (-1.65, 0.95) reading the art books, out of every lamp path.
  BR5: he is out on the patio (3.7, 2.9). C2: he faces her from (0.32, 1.94), 0.15 m clear of lamp 1's path to her.
- Guests: B1 / B2 no longer read spines (that wall is bare): B2 sits on the sofa beside S1, B1 stands over them;
  their lamp shadows land on the left wall. E1 stands at the slider's fixed glass looking out. Anyone in the room right
  of her throws shadows on the bare wall beside hers; B1/B2/E1 were moved for that (BR5 still has one E1 shadow at the
  far right edge of frame, on bare wall).
- Cameras: BR1 aim moved so the shelf is behind both of them (she is at u 0.6); BR4a lens 35, centred on the seam,
  lower ambient; BR4b on cube 4,4 (Feynman + paperbacks); BR5 0.9 m right of before, same over-the-left-shoulder
  composition; C2a: behind her head is the truth half, not the seam (intent text updated); V3g's corner is now the bare
  back-right corner; PATH and the crossing mark start from the new mark.
- BR4b hides her head from the camera (`hideParts`), so in flat / lit the head casts no shadow; the line ribbons now
  include it (they project every body part), so in BR4b line and flat disagree about the head. To fix it in flat the
  engine would need a "cast but don't draw" flag.

**Checked by eye** (2026-11-25): BR1 line, BR4a line + flat, BR4b line, BR5 line + flat + lit, C2a line, V3h label,
`beam_BR5__lamps`, and the flat contact sheet. Not looked at one by one: the other lit renders, the other masks,
BR2 / BR3 / BR6 / V3g beyond the sheet. Known look issues: shadows on the espresso frame and dark recesses read weakly
in flat (dark surface, physically right); the 4 mm shadow grid shows stair-steps in close shots (BR4b, C2a), as it
did before; the mannequin's hair fringe box reads oddly in C2a (engine, not this set).
