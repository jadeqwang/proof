# kitchen90 — Decatur kitchen, 1990 (the question 2:21-2:26, "it was correct" 2:26, outro 4:05-4:24)

One room, two light states (`shot.light`): `night` = pendant over the table, `day` = sun through the window over the
sink. Shares plan coordinates and cast with `basement90` (`../basement90/house.js`, helpers in `../basement90/kit.js`).

Render: `node layout/render.mjs --set kitchen90` -> `media/layout/kitchen90/` (sheets: `_sheet_<mode>.jpg`).

## Assumptions (the plan leaves these open)
- Eat-in kitchen 3.6 x 4.2 m, 2.44 m ceiling. Back wall: counter, sink, double-hung window (1.1 x 1.0 m, sill 1.07),
  stove, fridge. Left wall: door to the basement stair. Right wall: china cabinet, open doorway to the hall.
- The plan names no beam for the kitchen. Night scene: a pendant lamp over the table; the shade rim (y 1.5) is the
  cut-off, so the standing parents' heads are out of the light and her face and hands are in it.
- Outro is daytime in the same kitchen, child still about 7 (`jade7`); the plan lists place and age as open.
- The reflecting glass is the china cabinet's glazed doors (plane x = 1.4, glass y 0.86-1.84): a dark interior behind
  glass reflects in daylight, a window does not. It is 0.85 m to the child's right.
- Outro blocking: Mother sits in the right-end table chair, pulled out onto the open floor facing the room; the child
  stands between her knees facing her (and the window). Mother then walks to the hall doorway, passing behind the child.
- Sun: travels along (0.32, -0.42, 1) normalised, elevation 21.8 deg. The shaft crosses Mother's chair and the
  child's body and lands on the floor from z 0.45. Its top edge is at the child's chin (1.10 m at her position): her
  face is just above the light and looks down into it; Mother's seated face is inside it. Change `SUN` to move it.
- `MOTE` = (0.42, 1.16, -0.55): anchor for the mote she follows, inside the shaft at her eye height, 0.8 m ahead.
- Three chairs at the table (no chair on the camera side).

## The beams (for the mask)
- Night: `BEAM_NIGHT` cone from the bulb (apex y 1.6), straight down, half-angle 63.4 deg, cut off above y 1.5.
  Sidecar `beam`: apex, radius on table and floor, `heads_in_cone` per figure.
- Day: `BEAM_DAY` parallel shaft = window opening extruded along `SUN.dir` (`shaftAt(z)`, `inShaft(p)`, `sunHit(p)`).
  Sidecar `beam`: window corners, end corners, section at the child, mote px, `heads_in_shaft`.
- Lit mode shows the volume; label mode outlines shaft edges, floor patch, shade rim, and marks the mote.

## Known limits
- K8 reflection is a true mirror render (engine mirror compositing). Sidecar `mirror.reflected_faces`: both the
  child's reflected face falls inside the glass and in frame; Mother's reflection is in the glass as a passing back (her head is above the top of frame at this lens). A real cabinet would also show dishes through the glass.
- K5: Mother's hands are mitts and her left hand's orientation is not controllable (engine left-hand basis), so
  "thumbs on the cheeks" is placement only: palms at the jaw, 7 cm either side of the mouth.
- K2/K4/K5/K6 are POV inserts with the viewer's head hidden.
- No lettering on the paper; its quad is `panes.paper`.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. `K5_thumbs`: Mother's left hand is now the mirror of her right (`palm` / `fingers` / `thumb` mirrored in x). Looked at after the change: both hands are at the child's jaw, symmetric; the two thumbs meet under the mouth rather than sitting high on the cheeks (the right hand's own staging, unchanged).
- **Cast.** `jade7`, `dad`, `mama90` come from `../_cast.js` through `../basement90/house.js`; Dad is 1.72 m (was 1.75).
- **Times.** K5-K10 follow `analysis/v3/song_map.md`: K5 4:05.0-4:09.0, K6 4:09.0-4:13.0, K7 4:13.0-4:15.5, K8 4:15.5-4:19.3, K9 4:19.3-4:21.3, K10 4:21.3-4:23.3. Labels only. Note for the edit: in v3 outro line 1 starts at 4:03.5, 1.5 s BEFORE the band cuts.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set kitchen90 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/kitchen90_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (day: the window opening swept along SUN.dir; night: the pendant's cone below the shade rim, and under the table top only what falls outside it), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: both states are good in the plan, the wides, K1, K3, K5-K10. `K2_taps`, `K4_writes` are white over the whole frame (her view of the table top under the lamp). `K8_glass`: the mask is of the direct light only (no reflection in the cabinet glass).

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- The question K1-K3 2:22.2-2:25.2 (after the basement's cat beat; the interlude starts 2:25.2). K4_writes 2:25.2-2:27.6,
  the interlude's first bar: -2sm has only the thinned interlude (2:25.2-2:34.5; v3's full half 2:36-2:45 is gone), and the
  plan's merged interlude row follows the writing with the market walk-away (2:27.6-2:30.0) and the spiral plates to 2:34.5.
- Outro: K5 3:55.0 (the cliff)-3:59.1, K6 -4:03.6, K7 -4:05.5, K8 -4:08.6, K9 -4:10.7, K10 -4:12.9 (pad swell).
