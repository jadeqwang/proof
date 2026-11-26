# playground23 bodies (set-local bridge)

Three rigged MakeHuman bodies for playground23, built like `layout/assets/bodies` (same GLB layout and `meta.json`
schema) by a set-local copy of `make_bodies.py`. This folder is a **bridge**: once the cast agent adds girl4 / boy7 /
dad23 to `layout/assets/bodies` (bodies.json + the script additions below) and to the engine's `BODY_OF`, delete it.

| id | who | sex | age | h (m) | build | face | hair (hairStyle) | garments |
|---|---|---|---|---|---|---|---|---|
| girl4 | the girl | f | 4 | 1.09 | weight 0.55, round little kid; head-round 0.3, cheek volume 0.4 | drawn | `pigtails`: built from the scalp: close hair with a centre part + two Dutch braids into low pigtails with curly ends (`hair_pigtails`, `hair_pigtails__braids`) | long, short, skirt (dress) |
| boy7 | the boy | m | 6.75 (macro) | 1.32 | weight 0.42, muscle 0.45, slim; head-scale vert 1.15 / horiz 1.1 / depth 1.1, head-age-decr 0.6, head-round 0.5, head-fat 0.25, cheek volume 0.9, chin-bones-decr 0.5, chin-height-decr 0.4, chin-prominent-decr 0.3 | drawn | `short`: a short soft cut from the scalp, forehead clear, no fringe | long (crew top + trousers), short |
| dad23 | Dad in 2023 | m | 67 | 1.72 | weight 0.5, muscle 0.4 (fuller than `dad` at 37); head-fat 0.3 | drawn | `short`: from the scalp, swept up and back, part on his left, lift on top, short sides | long, short |

Race: girl4 and boy7 `asian_caucasian` (0.5 / 0.5 / 0), dad23 `asian`. The engine colours hair and clothes.

Measured (sole to crown; crown to chin on the face midline): girl4 1.09 m, head 0.192 m, 5.68 heads; boy7 1.32 m,
head 0.256 m, **5.15 heads** (a typical 7-year-old, jade07, is 6.20 heads; the head-scale targets alone took him from
~6.2 to ~5.1); dad23 1.72 m, head 0.236 m, 7.29 heads. The girl's crown (1.09) is about the boy's chin (1.06).

## Additions over the shared script

- race `asian_caucasian`;
- per-body `targets` (MakeHuman target name: weight, may exceed 1), loaded before baking, so the helper joints, the
  rig, the eyes and the meta landmarks follow the reshaped head;
- per-body `hairAssets` (null = no MakeHuman proxy; the hair is built from the scalp);
- `hairBuild.crop` (short cut from the scalp: side / top / lift thickness in ipd, part left / right / centre, edge
  softness) and `hairBuild.dutch` (the two braids into pigtails).

## Rebuild

```sh
~/opt/blender-4.5.17-linux-x64/blender -b --offline-mode --python layout/sets/playground23/bodies/make_bodies.py -- girl4 boy7 dad23
```

About 10 s for all three. Writes `<id>.glb` and `meta.json` here. MakeHuman / MPFB assets: CC0 (see
`layout/assets/bodies/README.md`).
