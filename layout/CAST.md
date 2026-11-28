# CAST: one table for every "Proof" set

Source of truth: `layout/sets/_cast.js` (shared entries) and `layout/engine/mannequin.js` `CAST` (the four engine
entries). Every set imports `_cast.js`; none registers a recurring person itself. Heights are metres, standing.

| key | who | height | proportions | used in | was |
|---|---|---|---|---|---|
| `jade3` | little Jade, 3. **Costume canon (Jade, 2026-11-27): a coral-red and white GINGHAM top (7 mm check, one canonical texture: `shanghai86/textures.js` gingham), LONG sleeves gathered by elastic at the wrist, a plain white round collar** (as in the r3 shanghai86 V1d_2 paintings) | 0.95 | `child3` | shanghai86 (only set with her at 3; bodytest / mtest are engine test sets, unchanged) | shanghai86 local `jade3` |
| `littleJade` | little Jade, 5 | 1.08 | `child5` (engine) | attic88, attic88_day, wall88 | engine, unchanged |
| `jade7` | little Jade, 7 | 1.22 | `child7` | office91, basement90, kitchen90 | two local `jade7` (same height, different proportions and costume) |
| `jade10` | little Jade, about 10 | 1.38 | `child10` | market93 | market93 local `jade10` |
| `jade19` | Jade, about 19 | 1.63 | adult | closet02 | closet02 local `jade19` |
| `jade27` | Jade, 27 | 1.65 | adult | mv10, mortongrove07 (standing in for about 24) | mv10 local `jade27` |
| `jade` | Jade, adult | 1.65 | adult (engine) | playground23 (and bed26 / car26) | engine, unchanged |
| `mama` | Mama, 1988, restaurant apron (`noApron: true` drops it); jaw-length side-parted perm | 1.60 | adult (engine) | attic88, attic88_day, market93 | engine, unchanged |
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
| `jade27` | `jade27` (mv10, mortongrove07) | thin FULL-rim rectangular metal, small rounded corners, narrow (lens about 2:1) | 50 x 24 mm | 17 mm, one thin straight bar at the upper third | 1.6 mm round wire | dark gunmetal `#4a4d55` | yes, on pad arms | thin straight metal arms from the top outer corner, small hinge block |
| `jade19` | `jade19` (closet02) | small thin FULL-rim soft rounded-rectangle wire (rounder corners than at 27) | 48 x 25 mm | 17 mm, thin bar, a slight arch | 1.6 mm | dark gunmetal `#4f5259` | yes | thin straight arms from the upper outer corner |
| `mama` | every Mama (`mama`, `mama86`, `mama90`, `mama91`: attic88, attic88_day, wall88, market93, shanghai86, kitchen90, office91) | thin round-oval wire (softly squared oval), full rim | 46 x 33 mm | 18 mm, a thin arched bridge | 1.4 mm | pale silver `#bab6ad` | yes, visible pads on pad arms | thin straight arms from just above mid-height, small end pieces |
| `dad90` | `dad` in the Decatur years, 1990-91 (basement90, kitchen90, office91) | thin GOLD wire DOUBLE-bridge teardrop aviator: large lenses, flat top, the nasal edge slanting out as it drops, the bottom drooping onto the cheekbones | 58 x 46 mm | 16 mm lower bridge (arched) + a straight brow bar over the nose | 1.6 mm | gold `#c9a24e` | yes | arms from the top outer corner |
| `dad23` | `dad` in 2023 (playground23, via its `DAD23` costume) | thin rectangular SEMI-rimless: a dark metal rim over the top and down the sides to mid-height, the lower lens edge a thin clear bevel | 54 x 28 mm | 18 mm straight bar | 1.8 mm top rim, 0.7 mm bevel | dark gunmetal `#4a4a50`, bevel light grey | yes | straight arms from the top outer corner |

Sources: `cast/jade_27/jade27_H_heads_v1.jpg`, `cast/jade_19/jade19_H_heads_v1.jpg`, `cast/mama/mama_R_rest_heads_v1.jpg`,
`cast/dad/dad_H_heads_v5_likeness.jpg` (Decatur aviators; Jade 2026-11-27: the painted aviators have been good, keep
them). Dad 2023 has no sheet: the frame was modelled from his current photo (`inputs/family_photos/`, LOOK-ONLY: never
sent to an image model, never a prompt ref) and playground23 NOTES ("thin rectangular semi-rimless glasses").
Not glasses wearers: the children (little Jade at every age: the lj10 sheet says "no glasses"), first love, the
Shanghai relatives, the strangers. The engine's adult `jade` (playground23, Jade in 2023) has NO frame yet: no sheet
shows her at that age (flagged; she is seen from behind there).

Fit (all frames): lens centres at frame PD = lens width + bridge, centred on the eyes; the lens top 6 mm (Dad 7-8 mm)
above the eye centre, so the top rim sits just under the brow, never on it; the lens plane 12 mm in front of the cornea
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
aviators" (Dad, Decatur); "his thin rectangular semi-rimless dark gunmetal glasses (rim on top only)" (Dad, 2023).
