# playground23: playground, Austin, 2023

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
