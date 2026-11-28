# CAST: one table for every "Proof" set

Source of truth: `layout/sets/_cast.js` (shared entries) and `layout/engine/mannequin.js` `CAST` (the four engine
entries). Every set imports `_cast.js`; none registers a recurring person itself. Heights are metres, standing.

| key | who | height | proportions | used in | was |
|---|---|---|---|---|---|
| `jade3` | little Jade, 3. **Costume canon (Jade, 2026-11-27): a coral-red and white GINGHAM top (7 mm check, one canonical texture: `shanghai86/textures.js` gingham), LONG sleeves gathered by elastic at the wrist, a plain white round collar** (as in the r3 shanghai86 V1d_2 paintings) | 0.95 | `child3` | shanghai86 (only set with her at 3; bodytest / mtest are engine test sets, unchanged) | shanghai86 local `jade3` |
| `littleJade` | little Jade, 5 | 1.08 | `child5` (engine) | attic88, attic88_day, wall88 | engine, unchanged |
| `jade7` | little Jade, 7 | 1.22 | `child7` | office91, basement90, kitchen90 | two local `jade7` (same height, different proportions and costume) |
| `jade10` | little Jade, about 10 | 1.38 | `child10` | market93 | market93 local `jade10` |
| `jade19` | `jade19` (closet02) | thin FULL-rim soft rounded-rectangle wire: the same size as at 27, rounder corners (r 5 / 7.5 mm) | 47.5 x 25 mm outer; lens top 4.8 mm above the pupil | 20 mm, a thin bar a little higher, a slight arch | 1.6 mm | dark gunmetal `#4f5259` | yes | thin straight arms from the upper outer corner |
| `jade27` | `jade27` (mv10, mortongrove07) and adult `jade` in 2023 (playground23; Jade 2026-11-27: she wears glasses there, the nearest canon) | thin FULL-rim rectangular metal (Jade 2026-11-27: full rim): tight top corners (r 3 mm), rounder bottom corners (r 5 mm), the outer top corner a touch higher | 47 x 25 mm outer (45.3 x 23.5 rim centre line); lens top 4.6 mm above the pupil | 20 mm, one thin straight bar at mid-height of the top half | 1.7 mm round wire | dark gunmetal `#4a4d55` | yes, on pad arms | thin straight metal arms from the top outer corner, small hinge block |
| `jade` | Jade, adult | 1.65 | adult (engine) | playground23 (and bed26 / car26) | engine, unchanged |
| `mama` | every Mama (`mama`, `mama86`, `mama90`, `mama91`: attic88, attic88_day, wall88, market93, shanghai86, kitchen90, office91) | thin round-oval wire (a soft wide oval, flattish top and bottom), full rim | 45 x 28 mm outer; lens top 6 mm above the pupil (2026-11-28, Jade: "match the 3d model to the drawing": lowered 1.3 mm onto the sheet's rims in the front overlay) | 20 mm, a thin bridge arched up | 1.4 mm | pale silver `#bab6ad` | yes, visible pads on pad arms | thin straight arms from just above mid-height, small end pieces |
| `mama86` | Mama, Shanghai 1986: blue-grey short-sleeved top, perm | 1.60 | adult | shanghai86 | local `mother` |
| `mama90` | Mama, Decatur 1990: no apron, sleeves pushed, perm | 1.60 | adult | kitchen90 (basement90's house.js) | local `mama90` |
| `mama91` | Mama, school office 1991: long sleeves, perm | 1.60 | adult | office91 | local `mom` |
| `dad` | Dad | **1.72** | adult | office91, basement90, kitchen90 | 1.72 in office91, 1.75 in basement90/kitchen90 |
| `firstLove19` | first love at 19 | 1.78 | adultFirstLove (hands, feet = Jade's) | closet02 | closet02 local `firstLove` |
| `firstLove27` | first love at 27 (never face-on) | 1.78 | adultFirstLove (hands, feet = Jade's) | mv10, mortongrove07 | mv10 local `firstLove` |
| `daughter` | the daughter | 1.02 | `child4` (engine) | bed26 / car26 | engine, unchanged |

Mama's hair (Jade 2026-11-26: "The jaw-length perm throughout"): the jaw-length, side-parted perm of
`cast/mama/mama_R_rest_heads_v1` at every age and in every set (`hairStyle: 'perm'`, mesh `hair_perm`); never a bun or a
straight bob.

First love's hair colour (Jade 2026-11-26 round 5: "Darker ... match the color of gaius baltar's hair"): `FL_HAIR`
0x1f1915 in `_cast.js`, both ages: a deep, cool-to-neutral dark brown, nearly black in shadow, no red or chestnut
(`cast/first_love/fl_B_backhead_neck_v8`). The base is tuned on the render (lit pass under neutral light hue ~20, sat
0.30, like the sheet); warm lamps still warm it, so painters follow the sheet, not the guide.

First love's trousers (Jade 2026-11-26: "let's put first love in black pants in every scene, it feels more like him.
(normal black slacks)"): plain black slacks (dress trousers: straight leg, belt loops, a slight crease) at both ages and
in every set, `FL_SLACKS` 0x1c1c1e in `_cast.js` (a touch off pure black so folds read). They replace the old jeans
(dark indigo at 27, light-blue loose frayed jeans at 19). Tops, sandals and socks are unchanged. The engine has one
trouser garment (the jeans mesh), so the guide changes colour only; the painter prompts carry the "slacks" wording.

Socks in mortongrove07 (Jade 2026-11-27: "both characters wear SOCKS", which avoids toe shots and is more accurate):
`jade27` plain white cotton crew socks `0xf2efe8` (with the blue-grey top and indigo jeans), `firstLove27` plain
charcoal dress socks `0x2e2e33` (with the black slacks). No shoes indoors: his cork sandals are dropped in this set.
Set per shot (`shots.js SOCKS` -> `costume.sock`, plus a sock cuff up each shin from `basement90/kit.js footwear()`,
10 cm hers, 12 cm his); not in the cast table, because other sets dress them differently.

Rules
- One person, one height. Mama's three variants are built from the engine's `mama` (`mamaAs()` in `_cast.js`), so her
  height exists once; the two first-love keys share `FIRST_LOVE_H`.
- A costume change that is not a different year goes on the figure spec, not in the table:
  `figs: { jade7: { ..., costume: { sock: 0xe6b996, sleeves: 'short' } } }` (engine `spec.costume`: colours, sleeves,
  hair style; never height or proportions). basement90 uses it for her summer top and white socks, and Dad's grey socks (`JADE_BASEMENT` / `DAD_BASEMENT`
  in `house.js`; Jade 2026-11-25: socks, not bare feet); the sock cuffs and Dad's slippers are set-local meshes (`kit.js footwear()`).
- Set-local extras stay in their set's `build.js` and are registered with `addCast()` (exported by `_cast.js`), which
  throws if a set tries to redefine a shared key: shanghai86 `uncle` 1.70, `aunt` 1.58, `grandma` 1.50; office91 `sw`
  1.65; market93 `grandma` 1.52 (a stranger, not the Shanghai grandmother); mv10 guests `A1`..`G1`, `poi`;
  playground23 `partner` 1.78, `toddler` 0.82.
- Child proportion tables `child3`, `child7`, `child10` live in `_cast.js` (`CHILD_PROP`); `child5`, `child4`, `adult`
  in the engine.

What changed when the sets were pointed at this table (2026-11-22)
- Dad is 1.72 everywhere (basement90 and kitchen90 had 1.75). His seat and leg placement in basement90 are computed
  from the cast entry, so they followed; cameras aimed at `dad:eyes` followed.
- `jade7` uses the office91 proportions (hand 0.100 of height then; basement90 had 0.102, upper arm 0.178 vs 0.176).
  2026-11-25 (articulated mannequin): child hand lengths follow published norms: child3 0.112, child4 0.111, child5
  0.110, child7 0.107, child10 0.106 of height (adult 0.108 unchanged).
- Sidecar keys follow the cast keys: `mother` -> `mama86`, `mom` -> `mama91`, `firstLove` -> `firstLove19` /
  `firstLove27`.
- Colours are for the `lit` preview only; they are placeholders, not costume design.

## Glasses: one canonical frame per wearer (2026-11-27)

The painters drew a different frame in every shot (mv10 V3_rev_temple_b got a browline / half-rim) because the guides had
no real glasses: two flattened torus rings in the old mannequin path and nothing at all on the rigged mesh bodies. Each
wearer now has ONE frame, read off their cast heads sheet, built at real size by `layout/engine/glasses.js` (`FRAMES`)
and fitted to that body's own face. The cast entry names it (`glasses:` in `layout/sets/_cast.js`; a figure's
`spec.glasses` or `costume.glasses` overrides it, `false` = none). Where the sheet's caption and the sheet's drawing
disagree, the drawing wins (the painters copy the image).

| key (frame id) | wears it | frame (as drawn on the sheet) | lens w x h | bridge | rim | colour | nose pads | temples / hinges |
|---|---|---|---|---|---|---|---|---|
| `jade27` | `jade27` (mv10, mortongrove07) and adult `jade` in 2023 (playground23; Jade 2026-11-27: she wears glasses there, the nearest canon) | thin FULL-rim rectangular metal (Jade 2026-11-27: full rim): tight top corners (r 3 mm), rounder bottom corners (r 5 mm), the outer top corner a touch higher | 47 x 25 mm outer (45.3 x 23.5 rim centre line); lens top 4.6 mm above the pupil | 20 mm, one thin straight bar at mid-height of the top half | 1.7 mm round wire | dark gunmetal `#4a4d55` | yes, on pad arms | thin straight metal arms from the top outer corner, small hinge block |
| `jade19` | `jade19` (closet02) | thin FULL-rim soft rounded-rectangle wire: the same size as at 27, rounder corners (r 5 / 7.5 mm) | 47.5 x 25 mm outer; lens top 4.8 mm above the pupil | 20 mm, a thin bar a little higher, a slight arch | 1.6 mm | dark gunmetal `#4f5259` | yes | thin straight arms from the upper outer corner |
| `mama` | every Mama (`mama`, `mama86`, `mama90`, `mama91`: attic88, attic88_day, wall88, market93, shanghai86, kitchen90, office91) | thin round-oval wire (a soft wide oval, flattish top and bottom), full rim | 45 x 28 mm outer; lens top 6 mm above the pupil (2026-11-28, Jade: "match the 3d model to the drawing": lowered 1.3 mm onto the sheet's rims in the front overlay) | 20 mm, a thin bridge arched up | 1.4 mm | pale silver `#bab6ad` | yes, visible pads on pad arms | thin straight arms from just above mid-height, small end pieces |
| `dad90` | `dad` in the Decatur years, 1990-91 (basement90, kitchen90, office91) | thin GOLD wire DOUBLE-bridge teardrop aviator: flat top, near-vertical outer side, a broad round bottom (r 17 mm) deepest just nasal of centre, the nasal edge slanting out as it drops onto the cheekbones | 56 x 42 mm outer; lens top 13 mm above the pupil, just under the brows | 16 mm lower bridge arched up at pupil height + a straight brow bar soldered across both top rims | 1.4 mm | gold `#c9a24e` | yes | arms from the top outer corner |
| `dad23` | `dad` in 2023 (playground23, via its `DAD23` costume) | narrow rectangular SEMI-rimless (re-checked on his current photo 2026-11-27): a thin grey metal rim over the top of each lens only, its outer end turning down into the hinge; the lower lens edge rimless (a thin clear edge), rising toward the nose | 55 x 22 mm | 19 mm thin bar high on the lens | 1.7 mm top rim, 0.7 mm lens edge | grey titanium `#67686d`, lens edge light grey | yes | slightly heavier straight grey arms |

Sources: `cast/jade_27/jade27_H_heads_v1.jpg`, `cast/jade_19/jade19_H_heads_v1.jpg`, `cast/mama/mama_R_rest_heads_v1.jpg`,
`cast/dad/dad_H_heads_v5_likeness.jpg` (Decatur aviators; Jade 2026-11-27: the painted aviators have been good, keep
them). Dad 2023 has no sheet: the frame was modelled from his current photo (`inputs/family_photos/`, LOOK-ONLY: never
sent to an image model, never a prompt ref) and playground23 NOTES ("thin rectangular semi-rimless glasses").
Not glasses wearers: the children (little Jade at every age: the lj10 sheet says "no glasses"), first love, the Shanghai relatives, the strangers.

How the shapes were matched (2026-11-27, Jade: "match each frame's SHAPE to the painted reference images, not the captions"): each sheet's front head is scaled so its pupils land on the guide's pupils (61 mm apart) and laid under the guide's line pass; the frames were adjusted until the rims overlay (`media/layout/_sheets/overlay_front.jpg`), then checked in 3/4 and profile. The POV head-hide (`stage.js casterMeshes 'head'`) hides the glasses and brows with the head.

Fit (all frames): lens centres at frame PD = lens width + bridge, centred on the eyes; the lens top where the sheet has it
(4-7 mm above the pupil, Dad's aviators 13 mm), so the top rim sits under the brow, never on it; the lens plane 12 mm in front of the cornea
(Dad's aviators 14 mm, pushed out by the nose), 8 deg pantoscopic tilt, 6 deg wrap; every rim point >= 5 mm in front of
the brows and face above the eye centre (>= 2 mm below it, beside the nose); pads 1.2 mm off the nose; arms 2.5 mm off
the temples, over the ear top, bending down behind the ear (under long hair, hidden as in life). Lenses are clear
(`glass` look in lit only, a faint 8 % dark tint; not drawn in any other mode, so the eyes always show).
The whole frame shares one line id, so line and contour outline it apart from the brows. The sidecar reports the fit
per figure (`figure_report.<who>.body.glasses`). Test set: `layout/sets/glassestest` (front / three-quarter / profile of
each frame); contact sheets `media/layout/_sheets/glasses_<frame>.jpg` (sheet crop | guide passes | scene shots).

Painter prompts name the frame in the sheet's words (r4 `_make.py`): "her thin full-rim rectangular dark gunmetal metal
glasses, exactly as on her heads sheet" (Jade 27); "her small thin full-rim soft rounded-rectangle dark gunmetal wire
glasses" (Jade 19); "her thin round-oval pale silver wire-rim glasses" (Mama); "his thin gold wire double-bridge teardrop
aviators" (Dad, Decatur); "his thin rectangular semi-rimless grey metal glasses (narrow lenses, a rim over the top only)" (Dad, 2023); adult Jade in 2023 gets the Jade 27 wording.

## Eyebrows: one canonical brow per character (2026-11-27)

Jade: the 3D brows were thick, straight dark bars (the MakeHuman eyebrow001 proxy, sitting low on the lid, 3.6-13 mm above
the eye centre), unlike the painted brows (thinner, softly arched, tapered tails); in the mv10 temple close-up the painter
read the bar as a browline frame. Every drawn face now gets its brows from `layout/engine/brows.js` (`BROWS`): a ribbon laid
on the skin along a centre line (head -> peak -> tail) with a thickness at the head, the peak and the tail, measured on the
cast heads sheet's front head relative to the pupils (pupil distance P sets the scale), and carried by the head bone. Blunt
rounded head, tapered pointed tail, hair colour. Cast entry `brows:`; no entry = the plain `adult` or `child` brow;
`spec.brows: 'proxy'` brings back the old mesh.

| brow id | who | shape (sheet front head) | head / peak / tail height above the pupil | thickness head / peak / tail |
|---|---|---|---|---|
| `jade27` | `jade27`, adult `jade` | asymmetric: her RIGHT brow (picture left) straight, sloping a little down to the tail; her LEFT runs straight then lifts into a soft arch two-thirds out | R 16 / 18 / 14 mm, L 16 / 20.5 / 17 mm; head 14.5 mm, tail 47-53 mm from the midline | 4.6 / 4 / 1 mm |
| `jade19` | `jade19` | the same brows, the left arch a little softer and longer | R 16.5 / 18.5 / 15.5, L 16.5 / 20.5 / 16.5 mm | 4.4 / 3.7 / 1 mm |
| `mama` | every Mama | clearly drawn, straight-ish, thinner, set higher; her left lifts a little at two-thirds | R 18 / 18.5 / 14.5, L 18.5 / 22 / 19 mm (lowered 1.8 mm onto the sheet, 2026-11-28) | 3.7 / 3.1 / 0.9 mm |
| `dad` | `dad` (both eras) | thick, dark, nearly straight, long; the tail tapers late | 20 / 21 / 18 mm; tail 56 mm out | 7 / 6 / 2.7 mm |
| `child` | little Jade at 3, 5, 7, 10 (lj03 / lj05 / lj07 / lj10 sheets) | short, thin, softly arched, high over the big eyes (mostly under her fringe) | 0.37 / 0.43 / 0.37 P | 0.05 / 0.042 / 0.014 P |
| `adult` | everyone else with a drawn face | a plain natural brow | 0.30 / 0.345 / 0.285 P | 0.075 / 0.064 / 0.018 P |

The brows sit 10 mm or more above the glasses' top rims in every frame (overlay: `media/layout/_sheets/overlay_front.jpg`).
Before / after sheets (sheet crop | old guide | new guide): `media/layout/_sheets/brows_<character>.jpg`.
