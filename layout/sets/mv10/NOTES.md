# mv10: the housewarming, 345B View St, Mountain View, fall 2010

```sh
node layout/render.mjs --set mv10 --exclude beam_                      # every shot, five modes, sidecars
node layout/render.mjs --set mv10 --prefix beam_ --modes flat --nojson # the beam-mask twins
sh layout/sets/mv10/sheet.sh label line lit flat                       # contact sheets in media/layout/_sheets/
python3 layout/gallery.py
```



## 2026-11-28: round 7 (Jade): k0 restaged; the living-room floor is carpet

- **V3_rcv_obl_k0 restaged** ("she keeps swapping with the guest: restage her so she faces the camera from the far side"):
  her S0 mark and K1's are swapped (`layout.js RC_MARKS`: kitchen (1.75, 6.25) -> (2.45, 6.62), K1 (2.45, 6.62) -> (1.75,
  6.25)). She now stands in front of the fridge on the FAR side from the camera, facing K1 and so the camera (patch and face
  toward us); K1 (tall, dark blond, mustard / khaki) stands nearer the camera with his back to it. Camera and timing kept.
  **Continuity:** K1 keeps his new spot in the middle key and k3 (he never moves; he still turns to look into the kitchen,
  back to the camera). L1 gains a waypoint (1.95, 5.85) so she walks round K1 to the opening; the crossing's real time
  and speed-up change slightly (sidecar `crossing`). The middle key and k3 are otherwise unchanged. Waypoint: OURS.
- **Living-room floor = CARPET** ("the living room floor here is carpet, a kind of heathered oatmeal color"): the oak box is
  now wall-to-wall carpet with ONE fixed texture (`art.js carpetArt`, code-drawn, seeded): oatmeal ground (mean #c4b394)
  heathered with cream and taupe-brown in soft 1.5-5 cm clusters plus 2-6 mm tuft flecks, 0.5 m repeat at real scale
  (`worldUV`). It shows in lit (colour), flat / label / form (its greys) and line / contour (a light grey stipple of the
  darker tufts; far off a pale grey tone). Colour shade, pile and fleck scale: OURS (ASSUMED). Kitchen tile and the oak in
  the core rooms unchanged. `_make.py` names it (CARPET in every shot that sees the living-room floor).

- **Bowl hold fixed (2026-11-28):** the frosted plexiglass bowl had a GLASS look, which the engine draws only in lit and
  form: in line / flat / label / contour the bowl was missing (two lemons floating over his palms), and the hold check
  (which sees what the last pass drew) hulled the lemons alone: "falls / slides" in T0_friendbowl, V3a, V3b. Now
  `FROSTED_PLEXI` is an opaque milky-white solid in every mode (the prompts still say frosted, softly see-through). V3a's
  friend bends 12 deg as in V3b (at 8 the bowl still slid 1.4 cm). Holdcheck: 308 / 308 pass; his wrists turned 23 deg
  into range by the engine, as before.

## 2026-11-27 (late evening): Jade's yard corrections (supersede the yard parts of the two sections below)

- **Strawberry:** "the strawberry planter is in the correct spot in the before": the raised timber BED is back at its
  page-1 place, size and shape (X 1.03..3.89, Z 13.07..15.06, 0.25 m high, 10 cm off the deck's ESE edge). The plants keep
  the new modelling (30 crowns of trifoliate leaves, red berries on runners, white flowers). The Poly Haven planter box is
  no longer used (still in `layout/assets/props/planter_box`; credits line marked unused). V3a keeps its downward tilt:
  the bed's far corner now shows at the bottom right (before the fix it was wholly below frame and painters invented it).
- **Mint:** "the barrel in the after looks pretty good", moved "to the little corner next to the stair railing, like in
  the crook of the elbow": the Poly Haven half barrel now sits on the lawn in the inside corner between the deck's NNE
  edge (X 3.88) and the stairs' open side (Z 11.15), 2 cm clear of both railings' posts: centre (4.275, 11.545). In V3a it
  is mostly hidden behind the deck railing at the lower left; in V3e it stands at the foot of the stairs.
- **Tree:** "the size is good but should be moved into the yard a little bit for balance": the whole tree moves by
  `TREE_SHIFT` (-0.7, -0.6): trunk (10.85, 18.5), canopy centre (10.2, 17.6), r 5.2 m (still 2.9 m past the corner).
  THE lemon (`TREE.pick`), the tree mark, HE_TREE, FRIEND_AT and V3b's camera / looks move with it.
  **Knock-on:** the poi mark moved (6.3, 15.6) -> (5.7, 14.6) so the flames stay outside the canopy's reach (5.4 m from its
  centre); V3e / V3h / SI1 see the spinner a little nearer the house.
- **The friend's bowl:** a FROSTED PLEXIGLASS punch bowl (Jade): the real bowl model's shape with a translucent milky glass
  look (`FROSTED_PLEXI` in build.js; lit 55 % opaque, form pale see-through); the two settled lemons show through it. No
  library punch bowl used. Prompts say "a frosted plexiglass punch bowl" (V3a, V3b, the T0_friendbowl ref caption).
- **V3a friend:** turned away from the lens (back three-quarter; facing = lens->lemon direction swung 50 deg to frame
  right), a step nearer the lens at her right, looking up into the tree; the bowl still shows past his right side.
- **Engine-side fix (set-local):** her boot-cut flare had no `formTint`, so the form guide drew her lower legs WHITE in
  every housewarming shot (lit was right). `PANT.formTint` set.
- **Done (late, after the restart):** full mv10 re-render finished (13 shots C2a/C2b/SI1/T0_* rendered BLACK in the 5-mode pass and were re-rendered; check `identify -format %[mean]` after big runs), sheets + gallery rebuilt; V3a v7/v8 painted, pick v7.
- **State at 19:20 (stopped for a restart):** the full re-render was stopped part-way (see HANDOFF 19:20 for exactly
  which shots and modes are current). Next: finish the re-render (5 modes, then form/contour/light, then beam twins,
  sheets, gallery), rebuild `_make.py`, paint V3a v7/v8 (free route, 5 refs), review, update picks. Sheet of this change:
  scratchpad `yard_before_after_2.jpg`.

## 2026-11-27 (evening): full re-render on the new yard; r4 repaint prompts (Jade decisions B-D)

- Every mv10 shot re-rendered (five modes + form/contour/light, beam twins) with the engine's hand fit B, hand marks,
  thenar smoothing and the corrected book sizes, and the yard model above. Sheets and `layout/gallery.py` rebuilt.
- `_make.py`: every shelf shot (BR6, C2a, V3_nailed, V3_rev_temple_a, V3_rcv_obl/_k0/_k3; BRpan_* already) now passes
  its `_lit.png` as the colour reference and names the fixed colours (Feynman set RED, Expedit espresso). V3a rewritten:
  the YARD paragraph (one strawberry planter at the deck's foot, one mint half-barrel, the giant tree in the far corner,
  nothing else), sneakers (per-shot cast override), no belt, the patch visible, lemons stacked; takes v3/v4 (v1/v2 kept).
  V3e carries the YARD paragraph too. V3b's painted takes predate the new tree (repaint if kept).
- Painted (free Codex, 2 takes each, V3a 4 more): picks in `media/keyframes/r4/mv10/picks.json`, reasons in
  `work/r4/PAINT_LOG.md`. Codex image_gen takes AT MOST 5 reference images (`_make.py` CAP5). The planter, mint barrel
  and tree held their place in all four new V3a takes and in V3e. Model follow-up: turn the V3a friend further from the
  lens (painters draw his profile from the side-on pose).

## 2026-11-27: the yard model fixed (Jade decision A) and V3a restaged (decision B, model side)

**Jade:** "the strawberry patch and mint plant are incorrectly and flexibly placed between takes, which means we should
actually fix the model ... the tree also needs to be way, way bigger. large enough she can't hug the trunk all the way
around, and canopies the entire corner of the yard. the strawberry planter is right by the patio." V3a repaint: NASA patch
visible, no belt, lemons stacked, SNEAKERS (she is outdoors).

- **Strawberry planter** (`layout.js` STRAWBERRY): ONE wooden planter box, the real model `props/planter_box` ("Planter
  Box 02", James Ray Cock, Poly Haven, CC0; 1.25 x 0.47 x 0.45 m, real size), on the lawn against the deck's ESE edge
  by the stairs, centre (3.25, 13.63), its long side running out from the deck (Z 13.0..14.25). Nine strawberry crowns
  (trifoliate leaves), red berries hanging over both long sides, a few white flowers, built in `build.js`. The old
  2.9 x 2.0 m raised bed (X 1.03..3.89, Z 13.07..15.06) is GONE. Which part of the deck edge and the orientation: **ASSUMED**.
- **Mint** (`layout.js` MINT): same place as before (4.84, 14.2), now the real half barrel `props/half_barrel` ("Wine
  Barrel 01", James Ray Cock, Poly Haven, CC0, cut at mid-height: `_pipeline/half_barrel_prep.py`; 0.66 m across, 0.39 m
  high) with ~70 upright mint stems with opposite leaf pairs (built). No mint/strawberry plant models in Poly Haven
  (the nettle model uses alpha-cut leaf cards, which the guide renderer would draw as rectangles).
- Both show in every guide mode (form, contour, light, line, flat, label, lit) in **V3a** (bottom centre: planter;
  mid-frame: barrel) and **V3e** (behind the spinner, at the deck foot). In V3h (plan) too.
- **The lemon tree** (`layout.js` TREE; species kept, Jade's lemons the size of pomelos): trunk moved into the corner,
  (11.55, 19.1) (was (10.79, 19.07)); 0.80 m across at chest height (2.5 m round; was 0.28 m), root flare 1.1 m at the
  ground, forks at 1.9 m into four scaffold limbs (r 0.17-0.25 m) and eight branches into the canopy. Canopy: a dome of
  lumpy foliage clumps centred (10.9, 18.2), radius 5.2 m (10.4 m spread; was r 2.3), from 2.35 m to 7.6 m above the
  lawn (was ~5.3 m tall); it covers the whole NNE / back-fence corner and overhangs both fences. 44 lemons hang on 8 cm
  stalks from leafy twigs under the canopy (1.95-2.3 m), plus THE lemon she reaches for in V3a (`TREE.pick`, (9.94,
  2.0 m, 17.64), **ASSUMED**). Real sizes, look-only (no web image sent anywhere): lemon trees are usually 3-6 m tall
  (up to ~9 m in ideal climates), single trunk, normally well under 0.5 m across; pomelos 5-15 m. Jade's tree is bigger
  than any ordinary lemon: her memory, her call. Sources: dimensions.com "Lemon Tree - Large", UF/IFAS HS402 (Morton
  1987: 3.1-6.1 m), evergreentrees.com.au (Eureka 3-5 m, Lisbon 3-6 m).
- Knock-ons: the canopy edge reaches ~(6.3, 15.7) toward the house; the poi mark (6.3, 15.6) is just outside it, the
  clothesline's T-post (8.2, 19.6) is under it (its line passes under the canopy at 1.95 m). Her tree mark (9.9, 17.95)
  is 2.0 m from the trunk; the V3b friend mark is 1.4 m from it (clear). The sidecar points `lemon_canopy_*`,
  `lemon_tree_trunk`, `lemon_she_reaches_for` follow.
- **V3a restaged** (`shots.js` V3A_*): she faces yaw -150 (three-quarter toward the deck-corner lens, her LEFT chest
  and the meatball decal toward it), right hand up under THE lemon (palm forward, fingers up, hand 26 cm below its
  centre, not touching), head on it. The friend at (8.85, 18.45), facing the lemon (back three-quarter / profile to
  us), the real bowl FB_D in front of him; the two settled lemons are STACKED (settled.js friendBowl: one on the other).
  Camera unchanged (deck corner, 24 mm) but tilted down (her eyes at 0.21 of the height, was 0.46) so the planter and
  the barrel are in frame; the canopy is cut by the top edge, which reads as the tree filling the corner.
- **Sneakers** (Jade): in V3a, V3b (and T0_friendbowl) her feet are black canvas (costume.sock 0x1c1c1f, shoes:
  'sneakers') with `build.js` sneakers(): white rubber sole, black upper, white toe bumper. **ASSUMED** plain black
  low-tops. V3b_prep (kitchen) and the party keep socks. No belt in the model (nothing at the waist; the painters'
  belts were invented): HOUSEWARMING_COSTUME now says so.
- Checks: clipcheck V3a: her hand in range, no contact with the lemon; the friend's palms 6.3 mm into the bowl wall,
  the same as V3b / T0_friendbowl (6.5 mm, staging unchanged: pre-existing with the new hand fit, a soft-palm contact).
- **V3b now differs from its painted takes** (bigger trunk and canopy in its upward view; sneakers below frame): repaint
  if it is kept. Sheet: scratchpad yard_before_after.jpg.

## 2026-11-25 (r2 review): V3a before the party, 10:30; V3_nailed hand up

**Jade:** V3a and V3b are BEFORE the party, early in the day: she and the childhood friend pick the (pomelo-sized)
lemons and make a punch bowl of lemonade; no guests. V3a is restaged on its old camera as the empty morning yard
(her reaching into the tree, the friend holding the bowl; V3b's staging seen wide). The "Before the party" clock moved
from 14:00 to 10:30 (**ASSUMED**, "early in the day"; sun az 132, elev 36). V3_nailed: his right hand is raised,
cupped between his mouth and her right ear (Jade: "his hand and arm could be up to imply whispering").

## 2026-11-25: her housewarming outfit (Jade)

**Jade:** thin black jacket, NASA meatball on the chest, over a fitted black tee with an SR-71 (planform from above,
angled down-left, dark grey tone-on-tone, barely visible: jacket on), boot-cut black yoga pants, socks. In every party
shot (`shots.js` JADE_HOUSEWARMING; `build.js` housewarming() adds a 4 cm tee sliver, a blue 8 cm meatball disc on her
LEFT chest and the boot-cut flare: a cone from the knee to a hem 1.2 cm off the floor, 0.07 m radius). **ASSUMED:**
zip front worn unzipped, nearly closed; hip length; socks plain mid-grey. Before the party (V3a, V3b, V3b_prep, now 10:30) she wears
the same outfit, socks outdoors (**ASSUMED**; OPEN: same outfit then? shoes in the yard?). Also socks on the lawn in
V3a / SI1 (party in the yard): shoes outside? Sheet: `cast/jade_27/j27_costume_housewarming_v1.jpg`.

## 2026-11-25 (round 2 answers): kitchen dressing, the new room crossing, the nod at the shelf, the lemonade prep

Supersedes the sections below where they differ. **Jade** = her answer; **ASSUMED** = our choice to make it buildable;
**OPEN** = a question back to her. All times are -2sm full-mix times (`media/karaoke_v2/lyrics_timed.json`).

**Kitchen (Jade: fridge, dishwasher, trash can, upper cabinets, dark walnut, punchbowl, food; wall stays 0.78 m)**
- Her U fitted everything with one change. The fridge stands at the SSW end of the partition run, back to the partition,
  right behind the 2x2 (X 2.30..3.06); that counter run now starts at X 3.10 (was 2.82, 0.28 m shorter). **ASSUMED**
  reading of "on the side near the 2x2 Expedit". Fridge: 30" top-freezer, 1.72 m, white (**ASSUMED** model and colour).
- "Right of" is read as your right hand while facing the appliance (**ASSUMED**).
  - Facing the stove (on the core run, you face NNE), right is ESE. The dishwasher (24", stainless front) is at
    Z 7.78..8.39, directly ESE of the 30" range. The punchbowl stands on the counter above the dishwasher.
  - Facing the sink (on the ESE run, you face ESE), right is SSW. The stainless step-lid trash can (~30 L) stands on the
    floor just past the end of that run, at (3.10, 9.55).
- Upper cabinets: 0.33 m deep, from 1.40 to 2.16 m. They run along the partition and the core wall, with one over the
  fridge, and none over the ESE window, which fills that run. Over the stove: an over-the-range microwave under a short
  walnut cabinet (**Jade**, 2026-11-26; see "Over the stove" below; the earlier ASSUMED stainless range hood is gone).
  **ASSUMED:** the range drawn as freestanding with an oven door.
- Every cabinet door is dark walnut (**Jade**). The base and upper carcasses are walnut too (**ASSUMED**); the worktop stays
  grey.
- GIANT punchbowl (**Jade**): 0.50 m glass bowl on a foot, 80 % full, lemon slices floating, a steel ladle, and two stacks of
  red cups (22 in all) beside it. Size, colours and slices are **ASSUMED**. T1 now stands at it, hand on the ladle.
- Food (**Jade:** appetizers spread across the dining table, snacks around the counters). Eight platters on the table, six
  snack bowls and a chip bag on the counters. **Which** foods: **ASSUMED**, generic. The party dressing shows from the
  bridge on; the prep shot has none.
- The lemonade table we had put on the deck is **REMOVED**: the lemonade is the punchbowl (**ASSUMED** from her answer;
  confirm). V3a's intent no longer names it.

**"Room crossing velocity" (V3_rcv_obl), rebuilt on Jade's sequence** (`layout.js` `RC_MARKS`, `ROOM_CROSSING`; sidecar `crossing`)
- Sequence (**Jade**):
  - S0: talking with K1 just inside the kitchen, by the fridge. Doorbell; she excuses herself.
  - L1: through the opening past the 2x2 and its printer, then across the living room to the front door.
  - S1: she welcomes N1 and N2.
  - L2: heading back toward the opening.
  - S2: R1, at the Expedit, says something; she stops and turns her head. Doorbell again.
  - L3: back to the door.
  - S3: N3 and N4.
- **ASSUMED:** the marks, the route, the speeds (1.1-1.35 m/s), the dwell times, and K1, R1 and N1-N4 as generic set-local
  guests ("someone"). Group A moved from the door's path to the glass console. First love is not in the shot (**OPEN**).
- Numbers: 11.7 m walked. L1 6.50 m (bearing 320), L2 2.63 m (bearing 153), L3 2.61 m (bearing 330). About 19.3 s in real
  time.
- **Timing (flag):** the line is 4.13 s (194.59-198.72), so the shot plays the sequence ~4.7x fast (a uniform time-lapse).
  Song times:

  | item | song time (s) | what happens |
  |---|---|---|
  | S0 | 194.59-195.02 | talking with K1; bell at 194.85 |
  | L1 | 195.02-196.09 | lands on "crossing" |
  | S1 | 196.09-196.94 | welcomes N1 and N2 |
  | L2 | 196.94-197.45 | starts on "velocity" (197.06) |
  | S2 | 197.45-197.99 | R1 speaks; second bell at 197.88 |
  | L3 | 197.99-198.40 | back to the door |
  | S3 | 198.40-198.72 | N3 and N4 |

  No other shot's time was changed. Played at 1x, it would need ~19 s.
- Shots:
  - **V3_rcv_obl** = middle key (S2). New start and end keys: **V3_rcv_obl_k0** (S0, door closed) and **V3_rcv_obl_k3**
    (S3, door open 85 deg).
  - **V3_rcv_obl_legs** = DIAGNOSTIC: L1 gold, L2 blue, L3 magenta, as floor arrows, with rings at the stops. L2 and L3 are
    drawn 0.2 m to the right of travel so they don't sit on top of each other. It has no beam twins.
  - **V3_rcv** (orthographic reference) now shows the new legs.
- The camera keeps the steep oblique from above the SSW side (27 mm). It is recentred on the living room, with the kitchen
  at frame right. The ceiling domes and the dining pendant are hidden in these shots; their light stays on.
- The front door has a per-shot angle (`frontDoorDeg`).
- The old route (shelf -> dining -> sliding door) and its `CROSSING` data are gone. **V3g** (its alternate) is RETIRED, with
  its renders in `_retired/`. `PATH` and V3h are kept as the old plan reference only.

**The nod at the shelf (Jade: straight after the whisper; never under the lemon tree)**
- **V3_rev_temple_a / _b** (189.11-191.52, unchanged) are restaged at the shelf mark, in the same stance as V3_nailed,
  mid-nod (14 deg), in verse-3 light.
- The camera still pushes into her LEFT temple; behind her are the Expedit and first love.
- **ASSUMED:** he has straightened after the whisper and turned back to the spines (at 3.22, 3.80, yaw 12). He faces
  156-161 deg away from the lens, so only the back of his head shows.
- Knock-on: V3e ("fifteen percent above amplitude", 186.03-189.06) was her point of view from under the tree. She is now at
  the shelf from 3:03.8 to 3:11.5, so V3e is a **CUTAWAY** to the poi from the same camera, with her and first love removed
  (**OPEN**).

**V3b: the picking and the lemonade prep (Jade)**
- The old slot (177.0-179.19) is split chronologically:
  - **V3b** (picking, unchanged staging) runs 177.0-178.04 ("...ade from the").
  - **V3b_prep** (new) runs 178.04-179.19 ("yard").
  - Both are before the party, at 14:00.
- V3b_prep camera: straight down, orthographic, 1.72 m wide, like the artichoke and romanesco plates.
- The surface is the dining table (**ASSUMED**). Jade said "in the kitchen"; the table is in the kitchen and dining room,
  and it is where the SSW window's 14:00 sun falls.
- On the table:
  - two pomelo-sized lemons cut across, each segment and seed modelled, so the line render draws the botanical
    cross-section;
  - a glass reamer with a half pressed under postdoc Jade's right hand (she is at the table's NNE end; only her hands
    and forearms show);
  - a bowl of picked lemons, two still with leaves;
  - a bowl of squeezed rinds;
  - sugar, a water pitcher, a knife and a board;
  - the giant punchbowl, half full, which the childhood friend stirs with a long wooden spoon (his hands from the ESE
    side; face never in frame).
- No party food is out. Everything except the juicer, rinds, mixing and lemons is **ASSUMED**.
- The paper-drum pendant is hidden in this shot (it hangs between the lens and the table).
- The window's centre mullion throws a shadow band across the table. It is real for the assumed window; drop it if
  unwanted.

**Checked by eye** (round 2): the lit, line and label renders of V3_rcv_obl, _k0, _k3 and _legs, V3b_prep and V3_rev_temple_a/_b, and
the contact sheets. Fixed along the way:
- overlapping legs (now offset);
- the rinds read as whole lemons (now hollow shells with pith);
- the ceiling domes glaring over the kitchen in the oblique;
- N3 and N4 hidden behind the WNW wall in the end key (now stepping in through the wide-open door);
- first love too prominent behind her in the temple frame (moved along the shelf).

## 2026-11-25 (late): Jade's decision-page answers applied (supersedes the section below where they differ)

Each change is marked **Jade** (her answer), **ASSUMED** (our choice to make it buildable; she has not confirmed it), or
**OPEN** (a question back to her). Existing shots keep their `time` strings; new shots use -2sm times
(`media/karaoke_v2/lyrics_timed.json`, full mix).

**The house**
- **Date:** Saturday 2 Oct 2010 stays (**Jade**: fine).
- **Partition (Jade: really THICK, "built-in, chimney, closet...", "as thick as the 2x2 Expedit is deep, so the 2x2 sits
  almost flush"):** rebuilt 0.78 m thick, centred on Z 5.0 (`PARTITION_T`, `PARTITION.zc`). **ASSUMED reading:** the 2x2
  stands at the wall's end facing SSW as she drew it, its 79 cm across the wall, so "flush" means a wall about 79 cm thick
  (the 2x2 is 5 mm proud of each face). Page 1 (0.7 m double line) and page 2 (a band as wide as the 2x2's long side)
  both agree. **OPEN:** if she meant the Expedit's literal 39 cm depth, the wall is 0.39 m and the 2x2 would have to turn
  90 deg to sit flush (extending the wall line, facing the living room or the kitchen). That is a two-line change in
  `layout.js`. The wall is modelled solid; no chimney or closet inside it.
  - Knock-on: living room now 4.46 m deep (Z 0.15..4.61), kitchen 4.41 m (Z 5.39..9.80). The Expedit 5x5 sits 0.32 m
    further WNW (front Z 4.22). The shelf mark (2.72, 3.30), first love's shelf mark and the outside lens all moved with it,
    keeping their old distances. The kitchen counter along the partition moved with the wall.
- **Living-room windows (Jade):** one in the front (WNW) wall, which already existed, AND one along the side wall. Her
  words were "I think", so the side window is her recollection, not a certainty. The SSW wall is the living room's only
  exterior side wall (NNE is the core), so the side window is the existing SSW one (Z 1.6..3.2), now credited to her.
  Both windows' sizes and positions are still **ASSUMED**.
- **Sun recheck, 16:30 bridge** (also after the floor-height change below):
  - The WNW window is 91 % sunlit (357 View St clips the rest). The front door is 100 %, the SSW window 20 %, the SSW
    dining window 71 %.
  - **New:** a small patch of sun through the unshaded part of the SSW window now lands on the floor just in front of the
    Expedit's truth end (about X 3.0-3.4, Z 3.8-4.4). It also lands on the bottom of the truth-end cubes (X 2.67-2.9,
    below 0.5 m). This happens because the shelf moved 0.32 m toward that window.
  - Her face and head at the shelf mark stay out of the sun. The shelf's upper rows and the pan's spines are not sunlit.
  - Verse 3 (18:25): no sun through any opening, as before.
- **Glass-top table (Jade):** a SEMICIRCLE, flat side against the NNE wall, 0.91 m wide, ~0.30 m deep at the centre.
  - (Superseded 2026-11-26: rebuilt from her photos as a bronze-rod console; see "Glass-top table from Jade's photos,
    2026-11-26" below. The half-ellipse, chrome apron and three chrome legs are gone.)
- **Sliding glass door (Jade; replaces the French doors):** ESE wall. **ASSUMED:** a 6 ft (1.83 m) two-panel slider at
  X 0.70..2.53; the SSW panel slides open behind the fixed NNE panel, leaving X 0.70..1.62 open. Her path and the greeting
  mark use that open half.
- **Deck (Jade):** level with the house floor (`PATIO.top` 0; was -0.05), wood, with wood stairs and a wood railing down
  to the yard.
  - The yard is "at least 3-4 steps" below the floor. `FLOOR_ABOVE_GRADE` is now 0.70 m: four 17.5 cm risers, **ASSUMED**
    inside her 0.6-0.75 m (was 0.60).
  - **ASSUMED:** railing 0.91 m, posts at most 1.8 m apart, a top and a bottom rail, balusters at about 12 cm. It runs
    round the deck's SSW and ESE edges, along the stair side and round the landing, and down the stairs' NNE side
    (sloped).
  - The front steps were rebuilt to the same four risers.
- **Noguchi coffee table, IN-50 (Jade: base wrong, right in spirit):** rebuilt from the real table.
  - Glass: a softened triangle, 127 x 91.4 cm, 40 cm high, 19 mm thick, with ground rounded edges.
  - Base: two IDENTICAL solid-wood pieces, black. Each is a long bar with a tapering foot at the far end and a short stub
    at the pivot end. The lower piece is the upper turned 180 deg in its own plane. The stubs meet at mid-height on a
    dowel. Three points carry the glass and three touch the floor.
  - **Estimates, not published numbers:** the glass outline, the leg profile (about 80 cm long, 38 cm high, 4 cm thick)
    and the plan layout were measured off Vitra's scale drawings. Plan layout: the pivot 26 cm toward the apex, the far
    ends toward the front corners.
  - **Discrepancy between the sources:** the legs sit about 85 deg apart in Vitra's plan; Herman Miller's assembly sheet
    says 52 deg. We followed Vitra's drawing.
  - Black legs follow Jade's "curved black wooden supports". Placement is unchanged: (1.72, 1.98), flat side to the
    couch, apex to the shelf.
  - Sources:
    - Herman Miller store page (50" x 36" x 15 3/4", 3/4" glass, two identical solid-wood legs):
      https://store.hermanmiller.com/living/coffee-tables-and-side-tables/noguchi-table/103688.html
    - Herman Miller assembly instructions, part no. 113963-K (pivot dowel and pins, the 52 deg angle):
      https://cdn.shopify.com/s/files/1/0435/8032/6038/files/productinstructions.pdf
    - Vitra factsheet (1280 x 920 x 400; plan and elevation drawings; "two identical wooden elements"; ground rounded
      edges): https://static.vitra.com/media/asset/191472/storage/master/download/Factsheet%2520Coffee%2520Table-EN.pdf
    - Wikipedia (history; before 1965 the glass was 7/8" and the table 15" tall): https://en.wikipedia.org/wiki/Noguchi_table
    - noguchi.org could not be reached (HTTP 402).

**The party**
- **Lemons and lemonade (Jade):** made BEFORE the party by her and the childhood friend. First love, Z and the guests had
  not arrived yet.
  - **Conflict found:** V3b ("lemons the size of pomelos", her hand up to a lemon) had first love standing beside her
    under the tree during the party.
  - **Fix:** V3b is restaged as the picking, a memory before the party. New section `Before the party` at 14:00
    (**ASSUMED** clock; sun 46 deg, az 203). The childhood friend stands just ahead of her, back to us, looking up into the
    tree and holding a bowl of picked lemons (in the sidecar, below frame). No first love, no guests, no poi. Same camera
    position, same `t`.
  - **OPEN:** Jade may prefer to keep V3b as a party moment and add the picking as a separate shot.
  - The lemonade table on the deck during the party is unchanged; it no longer implies anyone made it there.
  - V3a (the wide of the party) has no one picking or making lemonade.
  - First love under the tree at "nod" stays as before: that is during the party.
- **Childhood friend figure:** `_cast.js` has no adult childhood friend, so `friend` is set-local in `build.js`.
  - **ASSUMED:** 1.73 m, male (the poem digest calls 童友 "he"), tan top, short black hair. Face undrawn, back and hands
    only, like first love.
  - Deliberately NOT the charcoal hoodie of `cast/childhood_friend/cf_A_back_v1`: Jade says that old artwork matches Z.
  - **Z:** no figure built. Z arrives with the guests and is not singled out in any mv10 shot. If Z is wanted, the cf_A
    look could be given to one guest (for example G1, who does the greeting).
- **"He said I absolutely nailed it" (Jade):** she stands by the Expedit; first love stands close and whispers to her.
  - New shot **V3_nailed** (-2sm 183.847-185.98, verse-3 light: ceiling on, dusk in the windows). 50 mm over his right
    shoulder.
  - He stands at her right-front, bent to her right ear. Back of his head only: in the sidecar his head is 116 deg from
    facing the camera, so his jaw line shows but no features.
  - She faces the room in front of the truth half with a cup. The opening, the dining pendant and the SSW dining window
    are behind.
  - **V3d** (the same line under the lemons) is RETIRED; its renders are in `_retired/`.
  - **OPEN (continuity):** the push-in at "I nod, past hour reviewed" (189.1 s, three seconds later) is still under the
    lemon tree, facing him. Jade may want the nod at the shelf too, right after the whisper.
- **Poi audience (Jade):** the guests watch from along the side of the house by the wall, and from the deck. The spinner
  is in the yard, performing toward them.
  - W1-W4 stand on the lawn along the ESE wall, NNE of the stairs (X 6.4-9.0, Z about 10.5).
  - D1 and D2 stand at the deck's ESE railing.
  - **ASSUMED:** the spinner's mark is (6.3, 15.6), on the open lawn 5 m out, between the mint barrel and the
    clothesline. Yaw -166, facing the audience's middle `AUDIENCE_AT` (5.2, 11.2). (It was at (4.0, 17.3), facing the tree.)
  - Knock-on: SI1 now computes its axis from the poi, so the fire stays directly behind her. In V3e first love now stands
    at her right, watching too, so he is no longer between her and the moved poi; V3e sees the spinner from behind,
    playing to the deck. In V3a the deck audience fills the left foreground; acceptable, they are the audience. In SI1 the
  moved axis put first love face-on behind her; he now turns to watch the fire, back to the lens (169 deg).

**The shots**
- **Shelf pan (Jade):** shelf only (unchanged: she is not in frame). "From inside, I can't tell the difference" holds on
  the shelf. New END key **BRpan_c** at the seam (-2sm 166.853-169.66), held.
  - `BRpan_a.move` now runs a (beauty) -> m1 (seam, passing, 161.96) -> b (cube 4,4, 164.41) -> back to the seam
    (arrives 166.85, holds to 169.66).
  - **ASSUMED:** the track reverses after b to land on the seam. The alternative is to make m1 not the seam, so the seam
    is reached only once, at the end.
- **Room crossing velocity (Jade):** the steep oblique **V3_rcv_obl** is THE shot. **V3_rcv** (straight down) is kept,
  marked REFERENCE ONLY (`reference: true`, header), for true-scale overlay data.
  - Crossing numbers now: 8.28 m in 7.87 s, against a 6.82 m straight line and a 7.54 m shortest walkable path
    (1.10x). The route starts 0.32 m further WNW.
- **"I nod, past hour reviewed" (Jade):** push into the TEMPLE. **V3_rev_temple_a/b** kept; **V3_rev_eye_a/b** RETIRED
  (renders in `_retired/`).
- **IAS seal mirroring:** unchanged (Jade: keep the shelf as remembered: beauty left, truth right).

**Checked by eye** (2026-11-25 late):
- Renders: V3_nailed (flat, label, lit); V3b (label, lit); V3e and V3a (lit); V3h (label, flat); BR3 (line, lit).
- The Noguchi table and the console, through temporary close-up cameras since removed (line, flat, lit).
- The full lit contact sheet.
- Found and fixed: a scale bug that flattened the new Noguchi legs; first love blocking V3e; a guest at the V3a lens.

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

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- Already on -2sm and left alone: BRpan_a/m1/b/c, V3_nailed, V3_rev_temple_*, V3_rcv, V3_rcv_obl (remap --skip-ids V3_rcv_obl).
- Bridge: BR1 2:34.5, BR2 2:34.5-2:37.1 ("Do you not see"), BR3 2:37.1-2:39.6 (blank stares on "Does it matter..."; the plan
  then cuts to mortongrove07 on "Beauty on this side" 2:39.6), BR6 2:49.7-2:52.5, HS1 2:52.5-2:54.7.
- Verse 3: V3a 2:54.7-2:57.0 (band hit), V3b 2:57.0-2:59.2 (lemons, before the party), V3c 2:59.2-3:03.8 ("Perky American girl"),
  V3_nailed 3:03.8-3:06.0, V3e 3:06.0-3:09.1 ("fifteen percent"), V3_rev_temple 3:09.1-3:11.5, V3f 3:11.6-3:12.8 ("Hug
  durations"; the spectrogram plate takes "pitch contours"; judgment call), V3_rcv_obl 3:14.6-3:18.7. V3g is now an
  alternate to V3_rcv_obl; V3h is the plan / overlay reference for the crossing. SI1 3:19.1-3:23.4; C2a 3:34.2-3:39.6,
  C2b 3:39.6-3:43.0. Section names (so the sun and dusk per section) unchanged.
- 2026-11-25 (late): BRpan_a moved to start at 161.96 ("truth by reference"), m1 at 163.19, so the sweatshirt (mortongrove07, 2:39.6-2:42.0) is not double-booked; per the plan and Jade's earlier direction (sweatshirt right before the cut to the pan).

## Glass-top table from Jade's photos, 2026-11-26

Jade photographed the real table from three angles (`inputs/refs_semicircletable/`: "Pasted image.png" low near one
end, "(2)" from one end looking down along the curve, "(3)" from above). The placeholder (half-ellipse, chrome apron,
three chrome legs) is replaced by `glassTable.js`, driven by `layout.js` `GLASS_TABLE`. Placement unchanged: flat side
on the core wall face X 4.89, centred at Z 2.35 (X 4.56..4.89, Z 1.895..2.805); nothing collides (nearest figures,
N2 at X 4.05 and A3 at X 4.30 in the crossing phases, stay clear of the front edge at X 4.56).

- **Top:** clear glass, pale green edge, 10 mm (ASSUMED). A circular segment, not a half-ellipse: in photo 3 the arc meets
  the flat edge at a slant. Chord 0.91 m (Jade's 3 ft, the anchor), sagitta 0.33 m (ASSUMED from the photo proportions;
  Jade said ~1 ft; the photos rule out a full 0.455 m semicircle only loosely), radius 0.479 m. 0.76 m high (ASSUMED,
  console height; the photos have nothing to scale by).
- **Frame material:** dark oil-rubbed bronze / brown wrought iron ROUND ROD with a faint metallic speckle (the speckle is
  not modelled; the look is `{ grey: 0.16, col: 0x3b2c20 }`). Rim rod 16 mm, leg rods 13 mm (ASSUMED from the photos).
- **Topology (my reading; the photos are cluttered, so this is a reconstruction):**
  - Rim: a closed D, the arc rod under the glass edge plus a straight back rail along the wall (photo 1 shows the
    straight rod meeting the arc at a corner).
  - Two front legs, one toward each end of the arc: each a "lens" of two bowed rods from the rim (at 62 and 34 deg from
    the apex) that bow in toward the middle and meet at one foot under the rim (photo 2: the near pair; the far pair is
    seen edge-on as one rod).
  - A knotted collar (two rolled rings around the bundle) at 0.27 m (about a third of the height; photos 1 and 2),
    near the middle of the plan (0.15 m out from the wall).
  - Four lower rods from the collar splay out in concave curves to four feet: the two front-leg feet and two feet by
    the wall (u +-0.25). No separate back legs are visible, so none are modelled.
  - Four upper rods from the collar rise steeply and sweep out toward the two ends, two per end (to the rim arc at
    47 deg and to the back rail at u +-0.33), so from above they read as the X of arcs seen through the glass in photo 3.
  - ASSUMED: exact leg count (4 feet), attachment angles and how the rods run through the collar.
- **Compared:** test cameras at about each photo's angle, form renders side by side with the photos:
  `media/layout/mv10/T0_glasstable_compare.png` (rows: photo 2, photo 1, photo 3). Photo 2's view matches best (lens
  pair, collar, splayed feet); photos 1 and 3 are approximate angles (the real table was in a cluttered storage unit, and
  ours is against a wall). The photo-1 / photo-3 test cameras are retired; `T0_glasstable` (photo 2's angle, no figures,
  no beam twins) stays as the set reference, like basement90 B0_ / kitchen90 K0_.
- **Shots changed (need repainting next round):** V3_rcv, V3_rcv_obl (and its k0 / k3 / legs keys), V3h (plan; the
  table is tiny there). No close shot frames the table. V3c was re-rendered too and is pixel-identical (the table is
  out of view). Their beam masks were re-rendered as well.

## Over the stove: microwave in walnut cabinetry, 2026-11-26

Jade: "the stovetop fan was inside dark wood cabinetry, and there was a mounted microwave above the stove." The ASSUMED
stainless range hood is replaced (`layout.js` `OTR_MICROWAVE`, built in `build.js` kitchen()):
- An over-the-range microwave filling the gap between the core-wall uppers (Z 7.00..7.76, 0.76 m wide), 0.42 m high,
  0.40 m deep (proud of the 0.33 m uppers, as real ones are), bottom at 1.40 m (the uppers' bottom line, 0.48 m over the
  cooktop), stainless with a dark door window, the control panel on its right (ESE, +Z), a vent grille strip along its
  top, and the fan grille and two cooktop lights on its underside. Sizes ASSUMED.
- A short dark-walnut cabinet above it (1.82..2.16, 0.33 deep) with two walnut doors, flush with the uppers either side,
  whose side panels are its walnut sides: the fan reads as housed in the walnut cabinet run.
- **Alternative reading (flagged, not built):** a separate walnut-clad hood enclosure over the stove with the
  microwave mounted elsewhere.
- No mv10 film shot frames the stove; it shows only in the overviews (V3_rcv, V3_rcv_obl and keys, V3h), re-rendered
  with the table above.


## 2026-11-26: round-3 decisions

Jade's answers (verbatim in `work/decisions/JADE_R3_DECISIONS.md`, "Mountain View 2010"), applied. Supersedes anything
above that contradicts it.

1. **Room crossing timing (V3_rcv*):** Jade chose "an even time-lapse, about 4.7x". The model already plays it that way:
   `ROOM_CROSSING` real time 19.3 s in the 4.13 s line = 4.68x, uniform (`fit_note` now records her choice; the
   "stops as beats, walks ~3x" alternative is dropped). No geometry change.
2. **Who is in the kitchen / at the shelf:** K1 (she talks with, kitchen) and R1 (speaks at the shelf) stay UNNAMED
   guests. NEW: the **childhood friend** "was helping": in all three crossing keys he stands at the core-wall counter
   refilling the snack bowls (popcorn bowl, bag of chips). The task and spot are OURS.
   - Pronoun: the lead's brief says "her"; the repo (cast sheet `cast/childhood_friend/cf_A_back_v1`, build.js) has the
     friend as a young man. Kept as built. **FLAG: confirm with Jade** (one-line question below).
3. **First love during the arrivals:** "at the shelf briefly, then went to talk to an unnamed guest elsewhere". Staged:
   k0 (start, she is in the kitchen): he stands at the Expedit's beauty half, back three-quarter to the camera, looking
   along the art books (3.95, 3.86). Middle key and k3: he is by the SSW living-room window (0.85, 3.30), back to the
   camera, talking with guest B1 (moved there, 1.50, 3.30, facing him). Where, and which guest: OURS.
4. **V3b split:** unchanged (picking 2:57.0, then the making from straight above 2:58.0), as Jade chose.
   **The ladle grip (new, set-local `ladleGrip.js`; engine untouched):** the friend's right hand is the engine's
   articulated hand with joint angles solved for the ladle: the handle is a 17 mm steel rod; the solver searches the
   hand's roll about the handle, the handle's angle across the palm and which face the thumb lies on, scoring (a)
   wrist straight (finger axis along the forearm, elbow at the given point), (b) palm not turned outward (no forearm
   over-rotation), (c) the thumb on the handle's top, (d) the thumb reaching it. Result: a closed fist round the handle
   (fingers wrapped round it: MCP 77-100, PIP 38-109, DIP 61-74 deg), the thumb laid along the handle on top pointing up
   it (tip on the steel, 0.9 mm error), wrist deviation ~31 deg (inside a real wrist's range), palm facing his midline.
   The ladle stands steeply (60 deg) in the punchbowl near its nearer rim, the hand at the top end, the hanging tab
   just above the thumb; the ladle's bowl is lifted to the surface with lemonade in it. Numbers in the sidecar
   `ladle_grip`. Checked from three references (set references, not film shots, no beam twins):
   `T0_ladlegrip_a` (from the far side of the counter: the knuckles and wrapped fingers), `T0_ladlegrip_b` (over his
   right shoulder: the thumb on top), `T0_ladlegrip_top` (the V3b_prep camera zoomed to 0.42 m across: what the painter
   sees). The earlier tries are in the log: a thumb along a handle that runs square across the palm cannot lie along
   it (it stood up off the fist), and the "serving" grip with the thumb toward the bowl needs the forearm pointing down
   into the bowl (elbow high): neither read right, so the fist grip with the thumb on top was kept.
   - ASSUMED: steel ladle, 9 cm bowl, round 17 mm handle with a flat tab end; which hand (right); his left hand steadying
     the punchbowl at its rim.
5. **Where the lemonade was made: "the counter by the sink".** `PREP` moved from the dining table to the core-wall run's
   ESE end and the corner where it meets the sink run (counter top X 4.26..4.89, Z 8.2..9.8): punchbowl over the
   dishwasher, sugar, cutting board with two halves and the knife, a small bowl of rinds against the wall, the glass
   reamer in the corner, the bowl of picked lemons, the water pitcher beside the sink. Postdoc Jade (3.98, 9.02) presses
   a half on the reamer; the friend (3.84, 8.44) stirs. V3b_prep camera: straight down, orthographic, 1.72 m across,
   NNE (the core wall) up the frame, the sink at bottom right; the core-wall upper cabinets and their pulls are hidden
   (they sit between the lens and the counter); both heads hidden (hands and forearms only, as before).
   - **Window-mullion shadow:** the SSW dining-window shadow on the table no longer applies (nothing is on the table) and
     is dropped. At 10:30 (sun az 132, elev 36) the sun now comes through the KITCHEN window over the sink (ESE wall) and
     falls in a band across this counter, Jade's shadow in it. That is the computed sun, kept.
6. **Fridge:** "against the wall behind the 2x2" (where it already was) and **dark beige**: `FRIDGE.col` 0x9a8a6c (a
   dark almond / biscuit enamel; the shade is OURS), flat grey 0.6. Was white (our pick).
7. **V3e "fifteen percent above amplitude" (3:06.0-3:09.1):** the cutaway to the poi spinner stays, and Jade: "the stairs
   should be descending next to the wall of the house". **The stairs are rebuilt** (`STAIRS`): one flight ALONG the
   house's ESE wall, its inner side against the wall, descending NNE (+X) from the deck's NNE edge (X 3.88) to the lawn
   (X 4.78): four 17.5 cm risers, three 0.30 m treads, 1.20 m wide (Z 9.95..11.15), a stringer and a sloping railing on
   the open side. The old deck-level landing out to Z 11.3 and the flight descending ESE away from the house are gone.
   It stays inside the band Jade drew beside the patio (X 3.9..5.9); the tread run and width are OURS. V3e's aim moved
   (poi at 0.36 of the frame width) so the flight shows at frame right, running down the wall under the kitchen window.
   Knock-ons: her old v3 PATH (V3h reference) goes down the new flight; `MARKS.stairs` moved; V3f's extra deck guest
   moved off the stairs to (3.55, 10.45).
8. **SI1 moved indoors** (first love was never under the lemon tree). She stands just inside the open sliding glass door
   (`MARKS.silence` 1.22, 9.58), facing into the kitchen and the lens (85 mm, 1.4 m); first love beside her at frame
   right, back to the lens, watching the fire through the glass (never face-on). The lens is swung 9 deg off the
   poi-her line, so the poi's flames sit low at frame left beside her, not behind her head. Where she stands: OURS.
   - **Poi trail fixed (HANDOFF fault):** SI1 sets `poiTrail: false`: the two swept circles are not drawn in its guides,
     only the two flames, so nothing gold can be painted round her head (KEYFRAMES 6.6). Other shots keep the circles.
   - **V3a check:** V3a (2:54.7) no longer has him: since the r2 review it is the pre-party picking (her and the friend,
     no guests, no first love). The only remaining "first love under the tree" was the V3h plan reference: its figures
     now stand at the shelf (V3_nailed marks). `jadeTree` / `heTree` remain only as helpers for V3a / V3b poses.
9. **The deck:** punchbowl only, no table on the deck: already so since round 2 (the lemonade table was removed; the
   punchbowl is on the kitchen counter right of the stove). No change.

Known faults from HANDOFF, fixed in the set:
- **NASA lettering legible:** `HOUSEWARMING_COSTUME.jacket` (sidecar `jade_costume`) now says the meatball is small
  (~8 cm) and carries NO legible lettering ("paint no letters, no word NASA"). The model never had letters; the painter
  prompt reads the sidecar.
- **C2b, she holds the cup:** her hand sat on his left wrist next to his cup. Now nobody holds a cup in C2a / C2b: his
  left forearm is held out bare, her empty hand taps mid-forearm (`firstLove27:forearmL`); his right arm hangs.
  (Tried first: the cup in his right hand. It still sat mid-frame in C2b, so it was dropped.)

Shots changed (repaint in r4): V3b_prep (moved to the sink counter, new hand and ladle), V3e (stairs), SI1 (indoors,
no trail), V3_rcv_obl / _k0 / _k3 (friend and first love added; the legs diagnostic and V3_rcv reference too), C2b and
C2a (no cup), V3h (reference: principals at the shelf, new stairs, path), V3f (the extra deck guest moved; the new
stairs show at its frame edge only), V3a (the stair railing in its foreground is now the flight along the wall), V3c
(the fridge behind her is now dark beige). Also check any other shot that sees into the kitchen for the fridge colour.
Unchanged staging: BR*, HS1, V3b, V3_nailed, V3_rev_temple_*.

Questions for Jade (proposed for the decision page):
- **cf_who:** the childhood friend: a man (as the cast sheet draws him) or a woman? Options: man (as built) / woman.
  Recommendation: ask; keep as built until answered. Image: `media/layout/mv10/V3_rcv_obl_k0_lit.png`.
- **v3b_grip:** the friend's ladle grip: fist round the handle, thumb on top (as built) / the serving grip, thumb
  pointing down the handle to the bowl (elbow raised). Recommendation: as built. Image:
  `media/layout/mv10/T0_ladlegrip_b_form.png`.
- **si1_where:** SI1 inside the open sliding door with the poi beside her (as built) / at the Expedit (no poi in frame).
  Recommendation: as built. Image: `media/layout/mv10/SI1_lit.png`.

## 2026-11-26: fixed background art and clothing decals (Jade: art and logos the same in every shot)
- Expedit spines are fixed textures drawn in code (mv10/spines.js): the six titles Jade named carry their real
  lettering (Fundamental Neuroscience, Principles of Neural Science, Nonlinear Dynamics and Chaos, the Feynman
  Lectures I-III, The Dragons of Eden, A Short History of Nearly Everything); every other book in layout.js BOOKS is our
  placeholder, so its spine shows fixed unreadable bars, no words, until Jade's list arrives. Colours are ours (bookLook).
- Clothing decals (mv10/art.js): the NASA meatball = layout/assets/art/logos/nasa_meatball.png (the public-domain 1959
  insignia, with its white NASA lettering), disc 8 cm on her left chest, conformed to the torso (sets/_art.js
  decalMesh). The SR-71 tee print = layout/assets/art/logos/sr71_print.png (only the sliver between the jacket fronts).
  Prompts: pass nasa_meatball.png as a reference in every shot of Jade in the jacket ("exactly this logo, this size").
- FLAG: HOUSEWARMING_COSTUME used to say "no lettering"; it now points at the decal (the real insignia has lettering).
  One version is Jade's rule; which one is a question for her.
- Repaint in r4: every shot that sees the shelf (BRpan_a/m1/b/c, BR6, V3_nailed, V3_rev_temple_a/b, C2a, V3_rcv_obl)
  and every shot of Jade's jacket.

## 2026-11-26: hold pass (engine/holdcheck.mjs, --gaze; mannequin and PROOF_BODY=mesh)
- V3_rcv*: group A's cup arms were built for their old yaw (rcFigs re-places A1-A3); now re-aimed with cupArm(n, newYaw): no cup in a body.
- Party ladle (crowd T1, 18 shots): layout.js `punchLadle()`; the handle now starts just above the lemonade (it ran into the liquid);
  T1's right hand = graspArms('power') a third of the way up the handle (hold r 11 mm on the 8 mm handle: the thumb sank in at 8).
- HS1: only her figure is built (solo hid the rest; T1's hand on the hidden ladle was checked against nothing). Same pose as BR6.
- Snacks (V3_rcv*): the friend's right palm rests on the popcorn bowl's rim, his left flat on the bag of chips (placed by the middle
  fingertip, thumb lifted: a free hand is turned by the natural-wrist rule); he stands 5 cm nearer, bend 24 (his arms were straight).
  The bag now stands on the counter itself (it sat inside its same-label tray).
- Bowl of picked lemons (V3a / V3b): one label for bowl and lemons; the friend's two palms under the round bowl, 30 deg either side of
  its bottom, square to it, fingers forward, thumbs lifted; the bowl 5 cm further from him (a mesh body met it). Her reaching hand is
  open ('relax'): it holds nothing yet.
- Prep (V3b_prep, T0_ladlegrip_*): PREP.jadeAt 11 cm nearer the corner, bend 10 (her arms could not reach). The lemon half sits ON
  the cone's tip (was 2 cm down over it); her right palm presses it on its far shoulder (30 deg past the top, wrist raised). Juice,
  cone and handle carry the juicer's label (one object); her left palm steadies it on the rim in front of her, tipped 14 deg down
  and rolled 20 deg. Ladle: all parts labelled 'ladle (steel)'; ladleGrip.js wrap tuned against the check (CLEAR, WRAP_PAD,
  PIP_OPEN, MCP_ADD; the same fist and thumb-on-top grip, the handle 1.2 cm further from the palm).
- Poi: each fist holds a knob handle (engine held prop 'poi knob handle (held)', r 1.2 cm, 10 cm); the tether runs from 5.5 cm out to
  the flame's surface (it ran from the empty fist into the flame). The check passes on the knob only: a spun poi is held by
  tension, not statically; the tether and flame are not checked.
- V3_nailed: his whisper hand is a gesture, not a grip ('relax' with the cup's curls), a few mm off her hair.
- Her hand on his elbow (bridge) / forearm (C2): tagged grasp 'restOn' so the contact is checked.
- Book spines: the spine-lettering planes have their own label ('spine lettering: <kind>, <half>'): the check took the paper-thin plane
  for the book. His textbook pinch targets 'textbooks (truth)', 3 mm deeper.

## 2026-11-26: the childhood friend (Jade, late notes)
- Jade: "childhood friend is about 6'0 or 6'1\" Ukrainian (but Russian speaking)". Height 1.73 (ours) -> 1.85 m (build.js
  GUEST `friend`; LH(1.85) in shots.js). Re-staged for the holds: V3a / V3b spine bend 12 (the taller arms turned his
  hands 36 deg and pressed the palms 16 mm into the bowl); V3_rcv stands 3 cm nearer the snacks. Face still undrawn.
- Jade: "his arm hairs are dark blond". FLAGGED: said right after the note on the friend, so read as the friend's; but the
  only shots that feature arm hair are first love's forearm (C2a / C2b, `FIRST_LOVE_COSTUME.forearms`). Not applied to
  either (the layout does not draw hair on arms); decision-page question: whose arm hair is dark blond, the friend's or
  first love's? Recorded for the paint prompts once confirmed.

## 2026-11-26 evening (Jade): the childhood friend's arm hair is dark blond. (Settles the flag above.)

## 2026-11-26 late: round-4 decisions + props phase 2

Jade's answers (verbatim in `work/decisions/JADE_R4_DECISIONS.md`) applied. Supersedes anything above that contradicts it.

1. **v3b_grip: "Fist, thumb on top".** The hand-built ladle (round rod, hemisphere bowl, tab) is replaced by the real
   model (`props/ladle`, "Ladle" by Lightningx, CC BY 4.0). Measured on its glb (ladleGrip.js `LADLE_M`): a 6.2 cm bowl,
   2.5 cm deep; the handle a flat steel strip 11 x 3.3 mm (props.json says ~10 x 5) rising almost straight to a hook.
   ladleGrip.js re-solved: the fingers wrap the strip's half width, the thumb lies up the handle on its TOP flat face
   (the bowl's open side), and the ladle is turned so that face is the thumb's face and placed so its grip point is the
   fist's centre; the bowl sits in the lemonade (centre 6 mm under the surface). The handle's rise / yaw and the elbow were
   swept against the hold check and the engine's wrist warning: rise 80 deg (nearly upright, the bowl near level), yaw
   -50, elbow [3.90, 1.10, 8.65] (`PREP.ladle`). Hold check: **pass** (clamped; contact -2.5 mm, middle3). Remaining
   engine warning: radial deviation ~12 deg past the wrist range (the r3 grip had the same +12). Thumb face "up" is ~0
   (the handle is nearly vertical, so "on top" = the thumb lies up the handle at the top of the fist, as the references
   show). The handle is split in three meshes (lower / grip / hook, one label) so the hold check hulls only the grip.
   References: `T0_ladlegrip_a/_b/_top`.
   - Party ladle (crowd T1, every party shot that sees the punchbowl): the same real model (`partyLadlePose`, the old lean,
     top face up), T1's engine power grip r 0.010 m on the strip (0.0075-0.0095 put the thumb 3-10 mm in). **pass**.
     New reference `T0_partyladle`.
   - The friend is 1.85 m with dark blond forearm hair: in the V3a / V3b_prep intents (the layout draws no arm hair).
2. **si1_where: "At the Expedit, no poi".** SI1 restaged at the shelf: she on her shelf mark in front of the truth half
   (yaw 196), looking into the lens; 85 mm at 1.5 m, level; the Expedit behind her, the yard and poi behind the partition
   (out of frame; the trail stays off). Intent kept: close, frontal, locked off, synced, hushed, 115 -> 100 %, she has
   turned from him to us. **First love:** back three-quarter to the lens at her right (frame left), turned back to the
   spines (3.10, 3.66, yaw 14; OUR staging, as in V3_rev): in the 16:9 guide his back of head and shoulder fill the left
   edge; in the 4:5 safe area he is mostly OUT (only an edge of his shoulder / hair). Never face-on. Light: the living-room
   ceiling light (night). The r3 "inside the open sliding door" staging is retired; `MARKS.silence` is no longer used by SI1.
3. **art_books: "Leave the rest blank".** spines.js: only Jade's six titles carry lettering; every other spine is plain
   colour (no greeked bars, no publisher mark). The sidecar's shelf contents list them as "(blank spine, untitled book)"
   and `shelf.spines_note` tells the painter to paint no words. The placeholder titles stay in layout.js only to size
   the books (never in the sidecar now).
4. **art_345b: "Bare walls".** Checked: the set hangs no art anywhere in 345B (no picture, poster, calendar or clock in
   build.js); nothing to remove. The Expedit's objects are shelf objects, not hung art.
5. **art_meatball: "With the white lettering".** Already built (layout/assets/art/logos/nasa_meatball.png is the 1959
   insignia with its white NASA lettering; the decal is on her jacket in every shot). The costume text now says confirmed.

**Props phase 2** (models in `layout/assets/props/`, credits in docs/credits_tools.md; work/props_audit.md):
- Party: the ladle (above); each stack of red cups = 11 real `red_cup` models nested 12 mm apart (2 stacks).
- Prep (V3b_prep): `cutting_board` (real 45 x 25 cm, rotated along the run; the two halves now sit on its top),
  `knife` (flat on the counter, handle toward the core wall), `juicer` (18 cm across), `pitcher` (GLASSY look), two
  `bowl`s (30 cm lemons, 22 cm rinds), `lemon` at pomelo size (x 2.17: 21 cm long, 15 cm across).
- Loose things are SETTLED with Rapier, not placed by hand: `settle.mjs` (run `node layout/sets/mv10/settle.mjs`) drops
  the lemons / rinds into a trimesh of the bowl model and writes `settled.js`. Two pomelo lemons do not fit side by side
  on an 18-21 cm bowl floor (one lodged on the rim), so the second rests on the first; a third rolled out, so two per
  bowl (the prep bowl's intent said "two with leaves": both keep a leaf). Rinds: 4 (was 5).
- The pressed half on the real juicer: a pomelo half balanced on the model's 6 mm cone tip rolls off in the check, so
  the half is pushed DOWN OVER the cone (cut face 12 mm above the rim, as when juicing) and juicer + half are ONE held
  object (holdWhole). Her right palm presses near the top (prepPress 15 deg, lift 4 mm, wrist raised 22 deg, fingers
  curled 15/15/10). Her LEFT hand no longer holds the rim (the half covers it; a palm on the dish's 3 cm side put her
  wrist into it): it rests flat on the counter beside the juicer. **pass**.
- The friend's bowl (V3a / V3b): a real 36 cm `bowl` with two settled lemons, ONE held object (holdWhole). His palms
  cradle its lower wall from either side (1.5 cm up, 45 deg, 3 cm back toward him, thumbs along the index); the bowl
  0.38 m in front of him; he stands 8 cm further from the tree (the bowl reached the trunk), V3b's pose now bends 12 like
  V3a's. **pass** (V3a, V3b, `T0_friendbowl`).
- Kept hand-built (audit): punchbowl (no usable model), the cut halves and the rinds (cut faces), sugar bag, the guests'
  cups of lemonade (engine-held cylinders: swapping them is an engine change, not made), stove / fridge / etc.
- Mug grip warning from the Shanghai agent (props.json mug grips mirrored): mv10 uses no mug; I measured every grip
  I use (ladle, juicer, bowl, lemon) on the models themselves, not from props.json.
- New set references (no beam twins): `T0_partyladle`, `T0_juicer`, `T0_friendbowl`.

## 2026-11-26 round 4 — PROGRESS (checkpoint): DONE
- All of the section above is done. Full re-render into media/layout/mv10 (default modes + sidecars, form/contour/light,
  beam_ masks; no failures), contact sheets (label, line, lit, flat, form, beam), gallery rebuilt.
- Hold check on media/layout/mv10: 308 / 308 pass (the ladle, the party ladle, the friend's bowl, the juicer + half).
- Gaze: no warnings for her, first love or the friend in SI1, V3b_prep, V3a.
- Changed shots (diffed against HEAD's guides) and prompt notes: work/r4/REPAINT_LIST.md, mv10 section.
- Not committed (the lead commits).

## 2026-11-26: post-sweep fixes (after the r5 engine soles fix)
- **V3b_prep / T0_juicer / T0_ladlegrip_a/b/top (jade27 at the counter by the sink).** With soles 2-4 mm up her toes went
  39.1 mm into the ESE run's toe kick and 8.9 mm into its doors (her hip/belly cloth was also 86.7 mm into the base
  cabinet). PREP.jadeAt [4.06, 9.10] -> [4.07, 8.99] (11 cm back from the counter front); spine bend 10 -> 22 so her
  right palm still reaches the half on the juicer (reach 0.98); the cut half on the board moved [4.43, 9.02] ->
  [4.50, 8.96] (her right sleeve crossed it); her left hand flat on the counter: fingers along the forearm
  ([0.5, 0, 0.87], wrist turn 22.7 -> 14.2 deg) and 15 mm higher (the mesh palm was 17.5 mm into the top, now 0.7).
  Clipcheck: toe kick, doors, base cabinets and counter top all clear. Holds unchanged (lemon half 0/0.1 mm, ladle pass).
- **V3_rcv_obl_k3:** N3 stood with his raised hand 0.62 m into her (cloth 43.4 mm). N3 [4.22, 0.30] -> [4.22, 0.24],
  his welcoming hand [4.1, 1.3, 0.62] -> [4.12, 1.3, 0.47]: jade27 / N3 clear (his wrist violation also gone).
- **Lit brightness:** build.js rig takes `light: { exposure }` (lit pass only, scales sun / ceiling / poi / ambient
  together, as office91 r5). C2b 2.4, C2a 1.9, SI1 1.7, V3_rev_temple_a/b 1.6 (REV_EX), V3f 1.2. Means: C2b 19.5 -> 40.4,
  C2a 21.0 -> 40.2, SI1 24.4 -> 42.1, temple_a 25.3 -> 41.1, temple_b 26.2 -> 43.0, V3f 34.4 -> 40.5; 0 % white; still night.

## 2026-11-26: round-6 decisions
- Hair re-render (r6 final, lead): target = the hair shade Jade asked for (measured reference), ~#3f342e (dark, slightly warm brown, a little cool grey, no red). FL_HAIR 0x2b2420 (v8 0x1f1915; ~1.37x lighter, calibrated in normal light, NOT on dim scenes). closet02 lit-only FL_HAIR_LIT 0x1a181b: CL_ots hair samples #40342d. mv10 is a dim set (C2b hair #0e0a08 -> #130e0c). No geometry change. Painter refs: the v8 sheets are darker than the target; next paint session tell the painter #3f342e (or redo the sheet as v9).

## 2026-11-26: first love in black slacks
- Jade: "let's put first love in black pants in every scene, it feels more like him. (normal black slacks)". His legs are
  now plain black dress trousers at both ages: `FL_SLACKS` 0x1c1c1e in `../_cast.js` (firstLove19 / firstLove27), a touch
  off pure black so the folds read. Tops, socks and sandals unchanged. The engine has one trouser garment (the MakeHuman
  jeans mesh) and no slacks-vs-jeans shape option, so the guide changes colour only; painter prompts carry
  `r4lib.FL_SLACKS` ("plain black slacks (dress trousers) ... NOT jeans").
- Re-rendered (all modes + beam_ masks) and re-checked; prompts regenerated (r4 _make.py).

## 2026-11-27: real-size feet / hands (engine agent)
- The engine now scales every mesh foot to the cast length (first love 251 mm, was ~217). His sandals (build.js
  sandals()) scale with the foot: cork sole longer by the stretch (20 % behind, 80 % ahead of the solver heel / toe)
  and wider by sqrt(k); straps 0.047 x k radius (k = footLen / solver heel-toe span, ~1.15). Labels are now
  '<who>: sandal (...)' and engine/clipdump.js treats sandals as the figure's footwear (like socks / slippers), so the
  clip check no longer reports the half-ring straps (open meshes: their "inside" was spurious) or the cork sole.
- V3c: Jade 2 cm back from MARKS.greeting (her toes were 12 mm into the sliding door track); her waving hand target 2 cm back with her.

## 2026-11-27: textbook spines matched to the real editions
- Jade: "for all the textbooks, can you image search for them and match their spines to the real textbooks? (we're not
  reproducing the textbooks, just showing what it looks like)". spines.js now draws each lettered spine as a LIKENESS of
  its real edition's spine: ground colour, colour bands, lettering colour, font class, the order, orientation and
  placement of title / author / edition / publisher, and the publisher mark's position as a plain circle / triangle /
  box (never the real logo). No cover art, logos, barcodes or ISBNs. build.js bookLook() gives each of these books its
  real cover colour; layout.js has their real sizes. Unnamed placeholder books are still blank, in our colours.
- Newly lettered: Theoretical Neuroscience, Spikes, Molecular Biology of the Cell. They are textbooks in cube 3,3 and
  were blank before. Their titles now reach the painter, and the sidecar `spines_note` says so.
- The Feynman set stays RED (Jade). The red-orange cloth of the classic hardcover is 0xae3322, a little brighter and
  oranger than our old 0x9a2a22.
- Fonts: system URW base-35 / Liberation faces, chosen as the nearest free class to each real face:
  P052 ~ Palatino, C059 ~ Century, Z003 for the Feynman script, Nimbus / Liberation Sans Narrow for condensed sans,
  and Nimbus Roman condensed in code for the Sagan title. They are listed in docs/credits_tools.md.
- Edge guide: the lettering and marks are drawn grey on white, colour bands (Strogatz's red head band) as a faint tint,
  and textures (the Kandel mottle) are left out.
- New set references (not film shots): `T0_spines_33` (textbooks), `T0_spines_44` (Feynman + SF) and `T0_spines_42`
  (Sagan, Bryson). These are square-on 50 mm views, 0.95 m from the frame front, lit exposure 1.3.
- Sizes: every book still fits. The cube is 337 mm inside. Cube 3,3's run is now 222 mm (was 270), and the tallest book is
  Kandel at 292 mm (279 mm since the 2026-11-27 height check; Fundamental, 286 mm, is now the tallest), so no SHELF_WARN. Books are placed edge to edge by placeBooks(), so they cannot overlap.
- Side effect: his pinch target in BR1/BR2 (`heShelf`, x = cube centre + 5 cm) used to sit on the Fundamental /
  Theoretical boundary. With the new widths it lands mid-spine on Theoretical Neuroscience (2.2 cm thick paperback,
  top at 1.364 m vs the pinch height of 1.36 m).
- Real spine vs ours: `/tmp/claude-1000/-home-jade-Documents-proof/e8f8751e-a04d-4efb-8fc6-6214cbaf79ff/scratchpad/spines_compare.jpg` (session scratchpad; look-only refs, never committed, never sent
  to an image model).

| Book (edition) | Spine as drawn | Size h x d x w (cm) | Seen / inferred | Sources |
|---|---|---|---|---|
| Feynman Lectures on Physics I-III (Addison-Wesley red cloth hardcover, 1963-65 and reprints) | red-orange cloth #ae3322; head: FEYNMAN / LEIGHTON / SANDS stacked across, cream condensed sans; "The Feynman" gold script along; LECTURES ON PHYSICS cream condensed sans caps along; gold rule; VOLUME / I-III across in gold; foot: triangle mark + ADDISON / WESLEY across | 28.5 x 22.2 x 2.4 / 2.4 / 2.1 | SEEN (photo of the 3 spines) | abebooks.com listing 31328699370 (photo 3); cover: covers.openlibrary.org ISBN 0201021161 |
| Principles of Neural Science, 4th ed. (McGraw-Hill 2000) | blue-black #1d2338 with blue mottle #34467e; Kandel / Schwartz / Jessell stacked across at the head, cream serif; PRINCIPLES OF / NEURAL SCIENCE two lines along, light serif caps; Fourth / Edition across; round mark at the foot | 27.9 x 22.2 x 5.3 (was 29.2; see the book-heights note below) | SEEN (Amazon spine photo) | amazon.com/dp/0838577016 (image 1); Amazon dims 8.5 x 2.1 x 11.5 in; library records 29 cm; Open Library 10.9 x 9 x 2.3 in |
| Fundamental Neuroscience, 3rd ed. (Academic Press 2008) | indigo #2b2768 (the cover's title band); "Fundamental Neuroscience" white Century-class serif along; "Third Edition" yellow; Squire, Berg, Bloom, du Lac, Ghosh, Spitzer small; round mark at the foot | 28.6 x 22.9 x 5.1 | INFERRED from the cover (no spine photo found) | amazon.com/dp/0123740193; covers.openlibrary.org ISBN 9780123740199; Amazon dims 9 x 2 x 11.25 in |
| Theoretical Neuroscience (Dayan & Abbott, MIT Press pb 2005) | black; THEORETICAL NEUROSCIENCE gold serif caps along; "Dayan and Abbott" white serif; box mark at the foot | 25.4 x 19.7 x 2.2 | INFERRED from the cover | amazon.com/dp/0262541858; Amazon dims 7.76 x 0.87 x 10 in |
| Nonlinear Dynamics and Chaos (Strogatz, Westview / Perseus pb) | pale yellow #efe4a2, red head band #c62a2c; STROGATZ navy serif caps; NONLINEAR DYNAMICS / AND CHAOS navy small caps, 2 lines; foot: red rule, round mark, "Westview" | 23.4 x 15.2 x 2.5 | SEEN (spine photo) | abebooks.com listing 32276177461; amazon.com/dp/0738204536 (dims 6 x 1 x 9.2 in) |
| Spikes: Exploring the Neural Code (MIT Press pb 1999) | black; S P I K E S white wide-spaced bold sans with the I green; EXPLORING THE NEURAL CODE small spaced caps; Rieke, Warland, de Ruyter van Steveninck, Bialek; box mark | 22.9 x 17.8 x 2.0 | INFERRED from the cover | amazon.com/dp/0262681080; Amazon dims 7 x 0.8 x 9.02 in |
| Molecular Biology of the Cell, 5th ed. (Garland 2008) | crimson #d22a45; "Molecular Biology of" / THE CELL along, pale pink condensed sans (THE CELL large); six authors stacked across in small caps; round mark + "Garland Science"; "Fifth Edition" gold bold | 27.9 x 22.2 x 5.1 | SEEN (Amazon spine photo) | amazon.com/dp/0815341059 (image 5); Amazon dims 8.75 x 2 x 11 in |
| The Dragons of Eden (Ballantine mass-market, the red cover in print 1980s-2000s) | red #e2221c; round mark at the head; THE DRAGONS OF EDEN yellow condensed serif caps; CARL SAGAN yellow | 17.1 x 10.6 x 1.9 | INFERRED from the cover. The older Ballantine printings seen (cream spine, dark or teal condensed title) are a different cover | amazon.com/dp/0345346297 (dims 4.17 x 0.75 x 6.73 in); older spines: abebooks listings 32266488157, 32382686710 |
| A Short History of Nearly Everything (Broadway Books trade pb 2004) | blue-violet #2c2c68; BILL BRYSON white wide-spaced serif caps; yellow asterisk + "A Short History of Nearly Everything" white serif; box mark | 20.3 x 13.3 x 3.2 (kept) | INFERRED from the cover | amazon.com/dp/076790818X; covers.openlibrary.org ISBN 076790818X |

- Flags: for the five INFERRED spines no photo of the real spine turned up (AbeBooks seller photos, Amazon images; eBay
  and Biblio refuse scripted fetches). Their ground and lettering follow the cover, as publishers do, but the exact
  layout is a guess. For Dragons of Eden we picked the red cover, which matches the era; if Jade's copy was an older
  cream-spined printing, it is an easy swap.

## 2026-11-27: book heights checked against the Expedit cube
- Expedit interior: IKEA lists only the outside (185 x 185 x 39 cm for the 5x5); the cube opening is quoted as 13 x 13 in
  (33 x 33 cm), 15 in deep, the same as Kallax (interiorinsider.com "IKEA Expedit vs Kallax dimensions"; ikeahackers.net
  ?p=1038 "the cube openings are the same size (33cm)", and its 45 mm timber filling the outer panel's hollow agrees with
  the ~5 cm frame). IKEA's 33 x 33 cm Kallax inserts fit the cube, so the opening is at least ~33.2 cm. Ours (measured in
  the built scene, frame boxes): 33.72 x 33.72 cm, 39 cm deep, frame 5 cm, dividers 1.6 cm (still our estimate). That is
  2.2 % over the rounded 33 cm and consistent with the outside size, so the shelf is unchanged.
- Measured every book's world box (scratchpad dump.mjs). Lettered books, real height / model / ratio to the 33.72 cm cube:
  Feynman I-III 28.5 / 28.5 / 0.845; Kandel 27.9 / 27.9 / 0.827 (WAS 29.2: Amazon's 11.5 in; library records give 29 cm,
  AACR2 rounds up, Open Library 10.9 x 9 x 2.3 in, so 27.9 x 22.2 now); Fundamental 28.6 / 0.848; Theoretical 25.4 /
  0.753; Strogatz 23.4 / 0.694; Spikes 22.9 / 0.679; Alberts 27.9 / 0.827 (sellers: 27.9 x 21.6 x 4.7); Dragons 17.1 /
  0.507 (Open Library 6.9 in = 17.5, within 2.3 %); Bryson 20.3 / 0.602. All others within 0 % of the table above.
- Fillers: every placeholder trade paperback was 20 x 13 and every mass-market 17.5 x 10.6. Each now takes one real format
  by a fixed title hash (layout.js, after BOOKS): trade 20.3 x 13.2 / 19.8 x 12.9 / 20.3 x 13.5 / 21.0 x 13.8 / 20.0 x 13.3,
  mass-market 17.5 x 10.6 / 17.1 x 10.6 / 17.4 x 10.7 / 17.8 x 11.0. Thicknesses unchanged, so the runs are as wide.
- Spine textures are drawn at the book's own height (spines.js, 2600 px/m), so Kandel's shorter spine is redrawn, not
  squashed. T0_spines_33/44/42 checked in form and lit (scratchpad bookheights/). mv10 NOT re-rendered into media/layout.

## 2026-11-28: K1 restyled (r4 paint agent; Jade via lead)
V3_rcv_obl_k0 painted her and K1 swapped in four of four takes. Jade: keep her face visible, make the guest visually
different. K1 (build.js NEW_CAST) is now 1.88 m with short dark-blond hair (0xa8875a), a mustard-yellow shirt (0xc8a030)
and khaki trousers (0xb89e72); she stays in black with long black hair. Re-rendered V3_rcv_obl, _k0, _k3 (K1 is in all
three keys). Their earlier picks show the old blue-grey K1.
