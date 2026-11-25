# CAST: one table for every "Proof" set

Source of truth: `layout/sets/_cast.js` (shared entries) and `layout/engine/mannequin.js` `CAST` (the four engine
entries). Every set imports `_cast.js`; none registers a recurring person itself. Heights are metres, standing.

| key | who | height | proportions | used in | was |
|---|---|---|---|---|---|
| `jade3` | little Jade, 3 | 0.95 | `child3` | shanghai86 | shanghai86 local `jade3` |
| `littleJade` | little Jade, 5 | 1.08 | `child5` (engine) | attic88, attic88_day, wall88 | engine, unchanged |
| `jade7` | little Jade, 7 | 1.22 | `child7` | office91, basement90, kitchen90 | two local `jade7` (same height, different proportions and costume) |
| `jade10` | little Jade, about 10 | 1.38 | `child10` | market93 | market93 local `jade10` |
| `jade19` | Jade, about 19 | 1.63 | adult | closet02 | closet02 local `jade19` |
| `jade27` | Jade, 27 | 1.65 | adult | mv10, mortongrove07 (standing in for about 24) | mv10 local `jade27` |
| `jade` | Jade, adult | 1.65 | adult (engine) | playground23 (and bed26 / car26) | engine, unchanged |
| `mama` | Mama, 1988, restaurant apron (`noApron: true` drops it) | 1.60 | adult (engine) | attic88, attic88_day, market93 | engine, unchanged |
| `mama86` | Mama, Shanghai 1986: blue-grey short-sleeved top, bob | 1.60 | adult | shanghai86 | local `mother` |
| `mama90` | Mama, Decatur 1990: no apron, sleeves pushed, bun | 1.60 | adult | kitchen90 (basement90's house.js) | local `mama90` |
| `mama91` | Mama, school office 1991: long sleeves, bob | 1.60 | adult | office91 | local `mom` |
| `dad` | Dad | **1.72** | adult | office91, basement90, kitchen90 | 1.72 in office91, 1.75 in basement90/kitchen90 |
| `firstLove19` | first love at 19 | 1.78 | adultFirstLove (hands, feet = Jade's) | closet02 | closet02 local `firstLove` |
| `firstLove27` | first love at 27 (never face-on) | 1.78 | adultFirstLove (hands, feet = Jade's) | mv10, mortongrove07 | mv10 local `firstLove` |
| `daughter` | the daughter | 1.02 | `child4` (engine) | bed26 / car26 | engine, unchanged |

Rules
- One person, one height. Mama's three variants are built from the engine's `mama` (`mamaAs()` in `_cast.js`), so her
  height exists once; the two first-love keys share `FIRST_LOVE_H`.
- A costume change that is not a different year goes on the figure spec, not in the table:
  `figs: { jade7: { ..., costume: { sock: 0xe6b996, sleeves: 'short' } } }` (engine `spec.costume`: colours, sleeves,
  hair style; never height or proportions). basement90 uses it for her bare feet (`BAREFOOT` in `house.js`).
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
