# market93: produce aisle, Marketplace on Oakton, Skokie, 1993

## 2026-11-26: round-4 set fixes (Jade's r3 review: M2, M3, M4 hands; M4b child's arm; new M4c)

Jade: M2 "the hands look so weird! ... image search for what it should look like when 2 hands are holding artichokes";
M3 "hands look super weird and unrealistic"; M4 "three.js hand model is messed up, hands don't move that way"; M4b
"mom's hand is correct but kid Jade's arm is incorrectly proportioned ... a version of this shot at 2:14.2-2:15.2 ...
have mom pick her up and yoink her out of the way and gesture to old lady to pass". M1, M5, M6: Good.

### Grip specs from reference photos

Sources (looked at for modelling only; never copied into the repo, never sent to an image model): pixel-shot.com stock
previews i-2404949-0 (man, two hands cradling one artichoke at the waist, front view), i-2404930-0 and i-2404931-0
(woman, the same hold, stem hanging), i-2404945-0 (two artichokes in two hands), i-1739791-0 / i-1739793-0 (hands
pulling a halved artichoke apart: thumbs on the cut face, fingers on the bracts); parenting / clinical-hold pages for
the lift and the forearm grip (romper.com "how to properly pick up your toddler", bambiweb.org "Within Arm's Reach",
CDC "How to hold your child during vaccination", Minnesota Dept of Health comfort-hold sheets). Search: Claude Code
WebSearch.

- **Two-hand cradle (M1, M2, M3, M4, M4c).** The artichoke sits in a bowl made by both palms, NOT held from the sides with
  the fingers over the crown. Palms up under the lower flank, each about 50 deg round from the base toward its own side;
  the little-finger edges 3-4 cm apart (touching or overlapping in the adult photos) under the base, the cut stem hanging
  between them. Fingers point forward (away from her) under the base and a little across toward the other hand, slightly
  spread over the bracts (~10 deg), curled to follow the globe (MCP ~35, PIP ~42, DIP ~24): the fingertips come up the far
  flank to about a third of its height. Thumbs lie along the outer flanks toward the equator, pointing forward/up, never over
  the crown. Wrists supinated (palm up), neutral to a little extended; forearms enter from below at ~30-45 deg to each other,
  elbows soft at her sides. From her own eyes (M2/M3) only the two thumbs and the outer edges of the hands show at the sides
  of the globe, the fingertips peeking round the far rim; from the front (M1) the curled fingers of both hands cover the
  lower front of the globe and meet under it.
- **One-hand clutch (M4b, left hand).** Palm under the base and the near-lower flank (30 deg round from the base), fingers
  spread up the far flank, thumb up the near flank, the artichoke pressed against her stomach.
- **Adult hand on a child's forearm (M4, M4b).** Palm on top of the forearm (tilted toward the child), four fingers over
  the top and round the far side, thumb round the near side under it, at mid-forearm (clear of the wrist). The wrist is
  straight: the hand continues the line of the adult's forearm, which comes in nearly level and square to the child's
  forearm (adult bent at the waist, elbow dropped); the hand never hangs off the wrist at 90 deg (the r3 M4 guide's fault).
- **One-arm lift of a 10-year-old (M4c).** The arm goes round the child's back and under the far armpit, the hand spread on
  the front of her ribs (the torso is gripped, not the arms: pulling by the arms is the nursemaid's-elbow injury the
  clinical pages warn about); the child is clamped against the adult's hip, lifted a hand's breadth, feet dangling; the
  adult leans away from the load (spine side ~8 deg) on a wide stance.
- **"Go ahead" gesture (M4c).** Arm low and forward toward the person, elbow soft, palm up and open, fingers extended along
  the way they should go; eyes on the person.

The grips are written as world palm-centre targets, palm normals and finger directions (`cradle()` / `artFrame()` in
shots.js) so they carry over when the engine's grasp module and rigged body meshes land; nothing in layout/engine/ was
edited. The current mannequin hands show the intent but stay blocky: the hands are where repaint quality depends on the
body meshes.

### Per shot

- **M1, M2, M3 (and M4, M4c): the cradle.** `jadeStudy` hands were `palm: 'in'` on the sides, fingers 'fwd': from her
  eyes the fingers reached over the crown and the r3 painting drew palms facing her. Now `cradle(ART_HELD, 'L'|'R')`.
  M1 changed visibly in the guide (the hands now meet under the artichoke); Jade passed M1's painting, so it need not be
  repainted unless the lead wants the guide and painting to match.
- **M2 / M3 numerals re-synced** to the regenerated `artichoke_plate_count.json` (not regenerated here; clip 0 = 2:09.2):
  1 2:09.55-2:10.07, 2 2:10.19-2:10.68, 3 2:10.80-2:11.25, 4 2:11.37-2:11.79, 5 2:11.91-2:12.29 (straddles the M2/M3 cut at
  2:12.2), 6 2:12.41-2:12.77, 7 2:12.89-2:13.22, 8 2:13.34-2:13.65. So M2 carries 1-4 plus arm 5 drawing; M3 finishes 5 and
  writes 6, 7 and 8. **The count now completes (8 of 8) before the hand at 2:14.2** (Jade's plate note "finish at 8"); the
  plan's "the count is one short when the hand takes her forearm" no longer holds (flagged for the lead).
- **M4 (the grab)**: Mama bent at the waist (bend 24), elbow dropped (`elbowAt`), palm tilted toward the girl, grip at
  mid-forearm: wrist straight. Now an ALTERNATE (its slot goes to M4c, below).
- **M4b (pull)**: the child's arm. Cause was staging, not the body: the pulled right arm was folded ~90 deg with the forearm
  pointing at the lens, so the upper arm disappeared in M1's camera and the painter stretched one long forearm. Now drawn
  out sideways toward Mama across the picture plane (elbow soft, `elbowAt`), upper arm / elbow / forearm each at true
  length; Mama stepped back to (-0.22, 0.72) to make room; Mama's hand unchanged. The artichoke now sits in her LEFT hand
  against her stomach (`art` frame `PULL_ART`; it used to float where both hands held it). The engine's child upper arms are
  still 35-45 % too thick (work/arm_engine_notes.md): body-mesh item, not staging.
- **M4c (NEW, 2:14.2-2:15.2, M1's camera)**: blocking `LIFT`. Mama at the girl's right, turned to face the grandmother
  (back three-quarters to camera), right arm round the girl's back, hand on the front of her left ribs; the girl lifted
  10 cm (`floor: 0.10`), feet dangling, artichoke cradled at her stomach, eyes on it; Mama's left arm out low toward the
  grandmother, palm up, "go ahead"; Mama looks at her. Facing Mama toward the camera was tried and rejected: the
  grandmother is straight behind her (beyond head + eye turn), and the girl hid her. Mama's head is cut at the top edge
  (as in M4b). The feet are below the frame edge: the lift reads from the arm round her and the intent text.
- **build.js**: `shot.art` may now be a frame `{ at, axis, left }` (held somewhere other than ART_HELD); `art:L/R` use it.

### Lead's decision (later the same day; supersedes the M4b and M4c lines above)

- **M4c (2:14.2-2:15.2)** keeps the LIFT blocking; camera = M1 / r3-M4b's camera line, dollied back into the cross aisle and
  moved over the aisle (pos [0.86, 1.30, 3.05], 32 mm, aimed lower) so her dangling feet (10 cm up), Mama's open-palm
  gesture (left arm now out wider) and the grandmother are all in frame. Header marks the lift "(Jade, 2026-11-26)".
- **M4b (2:15.2-2:16.1) = THE LANDING** (blocking `LAND`): set down at the island's edge facing the produce, artichoke in her
  left hand at her stomach, her right arm hanging; Mama (at her right, facing her and the island) holds that forearm with
  her LEFT hand from the side: hand level, thumb up toward the elbow, palm on the forearm, fingers round the far side,
  wrist straight. The grandmother's cart has moved up (`GRANDMA_START`, nose level with the pallet's end) into the 0.6 m lane.
  Camera = the grab framing (50 mm, 0.92 m from the forearm), from over the island in front of her, az 75 and el 40 (31
  put the melons over the hands). The cart shows as a frame behind the forearm; Mama's body fills frame left. The grab
  framing looks down, so the cart cannot read more than that without breaking the rhyme.
- **M4b_pull**: the r3 mid-pull (PULL, M1's camera, arm fix above) kept as an alternate. M4 stays an alternate.
- **Plan row 2:06.3-2:16.1 reworded** (count reaches 8 by 2:13.65; M2 = 1-4, M3 = 5-8; then the lift, then the landing).

## 2026-11-25 night, keyframes r3 (Jade's r2 review: M4 hands, M4b mid-pull)

- **M4 hands.** Mama's grip (`mamaGrab`, also used by M4b) had its `hold.axis` pointing to the girl's elbow (`:0.1`), which
  wrapped the four fingers round the FAR side of the forearm: from M4's camera (in front of her) only a block-like back of
  the hand showed, and the r2 painting invented a stacked double hand. Axis now toward the wrist (`:0.95`): the palm is on
  top, the thumb round the far side and the four fingers curl down the NEAR side, each finger readable in form/contour.
  The camera is unchanged. (M5/`mamaLead` keeps its own axis; M5 is footage now anyway.)
- **M4b restaged mid-pull** (Jade: "mid-action shot of pulling her out of the way from blocking the aisle"). New poses
  `jadePulled` / `mamaPull` (blocking `PULL`): Mama stepped back to (-0.08, 0.66), yaw 100, stride, leaning back, right hand
  wrapped round the girl's right forearm; the girl tipped toward her (spine side 10, twist -14), right foot stepping out,
  right hand dragged off the artichoke (hanging loose), the artichoke held against her stomach in her LEFT hand, eyes still
  on it. The camera is now pinned by `pos`/`target` to M1's exact camera (from the M1 sidecar), since an orbit on her eyes
  would follow her lean. Mama's head is cut by the top edge at the eyes (as before). The grandmother and cart unchanged.
- **M5, M6** are replaced in the cut by the artichoke growth footage (1:22-2:08 of `artichoke_growth_preview.mp4`, shared
  with kitchen K2-K4); their cameras stay as alternates.
- Re-rendered the whole set (all modes, beam masks, painter guides).

## 2026-11-25 (artichoke from Jade's ref) (supersedes the artichoke lines below)

Jade gave `inputs/ref_artichoke.png` (a watermarked web photo, gitignored; looked at only, never copied, never sent to a
model) as THE market artichoke. What was taken from it, as geometry only: a globe head seen from straight above, round in
plan; broad, thick, cupped bracts that wrap the head and overlap like roof tiles; the outer ones wider and opening outward
(lobes round the rim), the inner ones tighter toward a closed apex with a small pit; every tip broad, with a V-notch in
the middle, a small point in the notch and ragged little teeth on the shoulders (the torn look); about 30 bracts visible.

- **One bract layout for the mesh and PLATE XVIII.** `artichoke_spec.mjs` (plain JS, no three) generates all 32 bracts:
  lattice point, tip frame, width, length, shell, flare, notch, point, teeth, thickness, and `bractPoint()` (the surface).
  `node layout/sets/market93/artichoke_spec.mjs` writes `artichoke_bracts.json`, which
  `media/footage/spirals/plants.py` reads (and re-checks `bractPoint` against the JSON's `check` samples). Same bracts,
  same indices, same hand, same shapes in both. Re-run the spec script after any change to it, then the plate.
- **Lattice.** Bract n: azimuth n x 137.5078 deg; plan radius sin(theta_n) = 0.038 (n + 0.55) up to theta 1.2 rad, then
  even steps down the flank (n = 31 at theta ~2.0). The old log lattice (73 bracts) and an equal-area lattice were tried:
  seen from above, the foreshortened flank makes the eye read 8 and 13. This one reads 5 and 8 from apex to rim.
- **Counts, measured on `REF_artichoke_top` (sidecar anchors, Delaunay neighbours, bracts n >= 5 facing the camera):**
  index differences 5: 17, 8: 16, 3: 6, 13: 2. Walking outward on screen, the 8-arms turn clockwise (+40 deg), the
  5-arms anticlockwise (-131 deg): the plate's hand. Bract n is on arm n % 8 (and n % 5), as before.
- **Bracts.** Each hangs down from its tip along the meridian on a shell a little outside the bracts above it, so outer
  bracts cover inner bases. Convex across (margins tucked), tips standing out more toward the rim (flare 0.02-0.30 head
  radii), 2.5-1.4 mm thick (front, back and rim faces, so the line render outlines each one). Tip outline: rounded
  shoulders, V-notch, a point in it, 2-3 ragged teeth a side. The tips reach 0.35 spacings past the lattice point toward
  the apex, so the innermost meet over it (a small pit stays, as in the photo).
- **Size.** R = 0.045 m: 11.5 cm across the open outer bracts, about 9.5 cm across the closed body, 9 cm tall plus a
  2.6 cm cut stem (pale cut face). In her hands (M1-M4b) it sits as before (`art:L` / `art:R` unchanged).
- **Sidecar.** `artichoke.bracts` lists the 32 bracts (was 73) with `arm8`, `arm5`, `arm13`, `px`, `faces_camera`, `w`;
  the point is the count's anchor (on the exposed part, just below the lattice point), the same point the plate uses.
- **The plate's count, by bract.** PLATE XVIII Fig. 1 now draws these same bracts (media/footage/spirals/NOTES.md, same
  date). Its run writes `artichoke_plate_count.json` (do not edit); every sidecar carries it as `artichoke.plate_count`:
  per family and numeral the arm, its bracts, `numeral_bract` (the plate writes the numeral past it) with its `px` here,
  and `last_facing_bract` (the outermost bract of that arm facing this camera). Bracts carry `plate_numeral8` /
  `plate_numeral5`. 8-family numeral bracts: 1 n27, 2 n30, 3 n25, 4 n28, 5 n31, 6 n26, 7 n29, 8 n24.
  Facing the camera (8 family): M2 / M3 / M7 / M9 1 3 6 8 (2 4 5 7 are on bracts round the far side: put those numerals on
  `last_facing_bract`, n22 n20 n23 n21, or at the rim where the arm leaves view); M6 1 2 3 7 8; M4 1 2 7 8.
- **New reference views:** `REF_artichoke_top` (ortho, straight down the axis, frame up = the plate's up, so each bract sits
  where it sits on the plate) and `REF_artichoke_34` (85 mm, 3/4 from above). The artichoke stands upright on the heap's
  spot (`art: 'upright'`), the heaps hidden.

Render: `node layout/render.mjs --set market93` (from the repo root). Output in `media/layout/market93/`,
contact sheets `media/layout/market93/_sheet_{label,line,lit}.jpg`.

Files: `layout.js` (every number, the light list, the beam, the blocking marks), `build.js` (geometry, cart, rig,
sidecar extras), `phyllo.js` (artichoke and romanesco), `shots.js` (cameras).

## Axes

Aisle along z. Gondola shelving at x < -0.9, produce islands at x > +0.9. Back wall z = -9, front of store z = +9.
She faces +z and is led away toward +z. A camera on her face looks toward -z: islands frame right, gondola frame left.

## Assumptions (the plan leaves these open)

- **Store.** 13.8 x 18 m department, 3.35 m drop ceiling, 1.8 m aisle. Islands 1.6 x 3.6 m, rim 0.80, ridge 1.12.
  Layout follows the Devon Market references, not a record of the real store.
- **Awnings only on the second island row.** The island she stands at is open, so the ceiling tubes reach the produce.
- **Tubes.** Chain-hung bare two-tube 4 ft strips at 2.9 m, rows every 2.4 m, strips every 1.5 m.
- **The beam is one strip** (row x = 0.6, centre z = 0.4), as a downward prism: 24 deg across the tubes, 14 deg past
  their ends. Footprint 2.7 x 2.7 m on the floor (`beamRect(y)` in layout.js). The other rows are drawn but are not beam.
- **Why the grandmother is unlit.** The two strips behind the key one in the same row have dead tubes. She waits under them.
- **Why she cannot pass.** A pallet of cartons on the gondola side leaves 0.49 m between it and Jade; the cart is 0.56 m.
- **Jade is about 10, 1.38 m.** She has lifted the artichoke out of its bin and holds it in both hands, turned 20 deg
  toward the island. For the walk-away shots it is back on its heap, at the aisle edge of the bin.
- **Mama** is further up the aisle at the gondola until the grab, then at Jade's right side; her right hand takes
  Jade's right forearm. She leads her away toward the front of the store by the same forearm.
- **Walk-away.** Jade and Mama are out of the beam by then. The grandmother overtakes on the gondola side.
- **The count is 8.** The artichoke has 8 arms one way and 5 the other. "One short" = 7 numerals.
- **Romanesco**: 13 and 8 arms; each floret carries its own 5 and 3.
- **Cast.** `jade10` and `grandma` are registered from `layout.js` (`CAST93`) at load; `engine/mannequin.js` is not edited.
  If another set adds a 10-year-old Jade to the engine under the same key, that entry wins.

## Phyllotaxis

Element n sits at azimuth n x 137.5078 deg and polar angle theta_n from the tip, tan(theta_n / 2) = tan(theta0 / 2) exp(lnG n),
lnG = 2 pi / (sqrt(5) a b) for the arm pair (a, b). Element n is on arm n % a. Each sidecar lists every bract / floret with
its arm indices, pixel position and whether it faces the camera (`artichoke.bracts`, `romanesco.florets`).

## Sidecar extras

`beam` (source, footprint corners in px at floor and bed height, who is inside), `artichoke`, `romanesco`.
The beam volume is also a mesh in the scene (`only: ['beam']`), invisible in the five existing modes.

## Known limits

- M4 (tight forearm framing): only the cart and a sliver of the grandmother show under Mama's arm. Any camera close on
  the forearm has Jade's body or Mama between it and the grandmother. M4b (M1's camera, with the hand) is where she reads.
- Inside shots M2, M3, M6 to M9 do not contain the grandmother.
- The `lit` preview uses one round spot that circumscribes the rectangular footprint; trust `BEAM`, not the preview edge.
- (Superseded 2026-11-25) The artichoke was a rosette of flat scales on a sphere: right spiral counts, generic silhouette.
- No floor tile lines, no signage text, no checkouts. Bins other than the hero island's aisle side are single lumps.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. No pose here was changed. `M4` / `M4b`: Mama's (right) hand is on the forearm; Jade's left hand now cups the artichoke properly. `M5` (Mama leads with her LEFT hand): her arm reaches Jade's forearm, but the contact is too small in frame to judge.
- **Cast.** `jade10` comes from `../_cast.js` (was registered here); Mama is the engine's `mama` with `noApron`; `grandma` stays local.
- **The grab framing (M4 = attic88_day AD_grab).** One framing for the film's forearm grabs: 50 mm, camera 0.92 m from the midpoint of the grabbed forearm, 31 deg above it, 30 deg round to the child's right, that point at (0.5, 0.52) of the frame, the adult's forearm entering on a diagonal from an upper corner.
  Matched here: lens (was 50 already), distance (was 0.8), elevation (was level), the 30 deg, the frame position (was (0.55, 0.5)).
  Not matched: the side. From behind her (the attic's side) her own shoulders and head cover the forearm at every elevation tried (31, 55, 62, 76, 86 deg), so the camera stays in FRONT of her and Mama's hand enters from frame LEFT (frame right in the attic). Flop one of the two in the edit if the rhyme should be literal.
  Lost: the cart and the grandmother are no longer in M4's background (the camera looks down). `M4b` is untouched and still shows them.
- **Time.** `M9` is labelled 4:28.4-4:30.8 (bar 2 of the coda groove in `analysis/v3/song_map.md`). Label only.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set market93 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/market93_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (the prism under the key strip, BEAM.src to beamRect on the floor), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: PLAN, PLAN_B, WIDE, M5, M6 show the prism. Saturated: `M2`, `M3`, `M8`, `M8b` are white over the whole frame in both twins and `M4`, `M7`, `M9` nearly (close shots of things inside the beam); `M1`, `M4b` are white in `beam_` (the lens is inside or against the prism) and useful in `__surf`.

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- Verse 2a 2:06.3-2:16.1: M1 2:06.3-2:09.2, M2 -2:12.2, M3 -2:14.2, M4 (grab) 2:14.2-2:15.2, M4b 2:15.2-2:16.1.
- Interlude (now one thinned interlude, 2:25.2-2:34.5): after kitchen90 K4 (2:25.2-2:27.6), M5 2:27.6-2:29.0 (walked away,
  looking back), M6 2:29.0-2:30.0 (her eye-line; the count resumes from 8 on the artichoke plate, intercut), then the
  romanesco plate (PLATE XVIII) 2:30.0-2:34.5 per the plan. **M7, M8, M8b** served v3's full interlude half (2:36-2:45),
  which -2sm does not have; the plan gives their content to the plates, so they are kept as alternates, not in the cut
  (renders kept; M9 reuses M7's camera). M7's intent no longer says "bass returns" (there is no bass there in -2sm).
- M9 coda bar 2: 4:16.8-4:19.2.

## 2026-11-26: hold pass
- The artichoke: the two-hand cradle (`cradle`) now sits 4 mm further out (r 0.058) with the thumbs flatter (opp 0.1), so
  the thumbs no longer dig into the globe. The arms carry `grasp: 'cradle', object: 'THE ARTICHOKE'`. One hand (M4b,
  M4b_pull) is now `CRADLE_ONE`: the palm level under the base (`under`: a world-down palm, shifted 0.3 toward the fingers),
  fingers curled up the far flank, thumb on the near flank. The globe leans on her stomach: one hand alone does not
  hold it in Rapier. PULL_D 0.1545 / LAND_D 0.151 put it 1 cm nearer her than before. The window is narrow: the mesh
  body's belly is 7-11 mm in front of the mannequin's.
- M4c: LIFT_D 0.16 (was 0.14), so the globe clears the mesh body's shirt. Mama's lifting hand now lies on the girl's
  front-left ribs (45 deg round, y 1.09). It used to be under the armpit, wedged between her ribs and her own upper arm.
  It is checked as `object: 'figure:jade10:torso'`.
- The cart: the handle bar has its own label (`the grandmother's cart: handle bar`). The uprights are 9 mm shorter (they
  ran 10 mm into the bar). The grandmother's hands are `cartGrip`, a power hold round the bar (r 0.014), thumb toward the
  other hand. The cart stands on its wheels (bottoms at y = 0).
- Forearm grabs: per-pose radii `GRAB_R` (M4 0.033, pull 0.041 at k 0.65, landing 0.038, lead 0.037), checked as
  `object: FOREARM` ('figure:jade10:armR').
- M4b: Jade's right forearm now reaches forward to LAND_RH (it used to hang), and Mama's palm (LAND_PALM) is on top
  of it. With the forearm hanging, a level grip was out of the wrist's range: the wrist rule turned the hand 54 deg
  off the forearm.
