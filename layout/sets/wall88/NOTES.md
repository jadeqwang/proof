# wall88: notes and assumptions

## r3 restaging, 2026-11-25 night (Jade's r2 review; SUPERSEDES the seated staging below)

Jade: WL_out "almost right, but she should be standing, not seated, her back against the side wall, and she's slowly
turning to look through the light"; WL_eye the same, "scared on the inside, her heart rate is fast, but her face doesn't
fully understand how to recognize it and show it"; WL_in "blink in and out, a single file of Chinese restaurant workers,
back to the brick wall, facing the wood wall, holding their breath, looking terrified, some are praying silently, they
blink in and out of existence and it's the empty wallspace again".

- **She stands** (`STAND` in layout.js): pelvis at x 0.145 (back flat to the brick, the "side wall"), z -0.35, facing the
  boards (yaw -90), head turned 45 deg toward her left (+z, the outside camera): the keyframe is mid-turn, turning back
  toward the crack. Palms flat back on the brick beside her hips. ASSUMED: "the side wall" = the brick (the workers
  in WL_in also have their backs to the brick, so she stands in the same file).
- **The crack is higher**: `CRACK_Y` 0.767 -> 1.287 so the sheet crosses her near (left) eye at the mid-turn (sidecar
  `blade_on_face`: left eye 0.0 cm, right eye 3.3 cm under the sheet, nose 4.9, mouth 6.7). The sheet descends toward
  the brick, so as she turns toward the crack her eyes move into the higher part of the sheet: the light runs across
  her eye during the turn. Length and slope unchanged (0.7 m, 40 deg); the bulb is 1.2 m back, now 2.31 m up.
- **Cavity lengthened** to z 2.65 (was 1.45) for the file of workers; one more stud at z 1.90.
- **Workers** (`WORKERS` in layout.js, set-local cast `w1`..`w5` registered in build.js with `addCast`, faces undrawn
  as office91's social worker): five adults 1.58-1.75 m, z 0.72-2.50, backs to the brick, facing the boards, shoulder
  to shoulder. Poses: w1 (front, a woman) palms together under the bowed chin (praying); w2 a hand over mouth and nose
  (holding breath); w3 hands clasped low, head bowed; w4 palms flat back on the brick, head pressed back; w5 praying.
  Kitchen whites and aprons, one waiter's white shirt (lit-preview colours only). They stand BEYOND the light (the crack
  ends at z 0.1): "being out of the beam is safety"; a 1.35 m crack that also lit them was tried and dropped because the
  sheet then passed over the outside camera.
- **WL_in is two states**: `WL_in` (state A, the file) and `WL_in_empty` (state B, the same camera, nobody: the frame the
  Voyager pull-back starts from). Same camera: 28 mm, from the closed end at the boards side (x -0.15, z -0.60), 2 cm
  above the sheet (y 1.231: about 20 cm above her eyes; the rhyme needs the camera at the sheet), looking along the file.
  Blade 40.2 deg, upper right to lower left (rhyme error 0.2 deg); the band runs a little below-right of frame centre.
  From one end of a 46 cm cavity a single file hides itself: the guide shows the front woman in profile and only the
  stepped edges of the others; the prompt has to carry the rest of the file.
- Cameras: WL_out 35 mm, 1.6 m down the cavity, 8 deg toward the boards, her eyes at (0.6, 0.3): boards and a stud
  frame-left, she stands against the brick frame-right, cut at mid-thigh. WL_eye 85 mm at 0.62 m, 10 deg toward the
  boards: her face three-quarters (31 deg off camera), the blade across her near eye.
- Fixed on the way: the spot cone is 30 deg (was 17).
- Masks: the beam_ twins render as before (`--prefix beam_ --modes flat --nojson`); `beam_WL_in_empty` is new. In WL_eye
  the camera is 9 cm under the sheet, so its mask is a large wedge (the air of the sheet seen from below), not a band.
- r3 paintings: `media/keyframes/r3/wall88/` (picks WL_out_v1, WL_eye_v2, WL_in_v2, WL_in_empty_v2; the empty state was
  painted from the workers state so the blink is an in-place cut).

"Proof": inside the wall, 1988 (chorus 1). Very small: one cavity, one crack, one child.

## Assumptions
- **Which wall is not known.** Modelled as a generic stud cavity: 0.46 m clear between a boarded partition (horizontal
  boards on studs) and a brick outer wall, 2.2 m long, 2.0 m high. If it was the eaves void behind the attic knee wall
  the top should slope; the blade and cameras would not change.
- **The crack** is a board joint opened to 30 mm over 0.7 m, 0.77 m off the floor. **The light** is a bare ceiling bulb
  in the room beyond, so it comes down through the crack at 40 degrees (`SLOPE`, the rhyme angle) as a thin sheet,
  13 mm thick, level along the cavity.
- **She** (little Jade, 5) sits knees-up facing along the cavity, back to the closed end. The sheet passes through her
  right eye (0.0 cm miss in the sidecar, `blade_on_face`), over the bridge of her nose; it passes 2.8 cm above her
  mouth, so "her mouth opens in the light" needs either a slightly thicker blade in the renderer or a small lift of
  her chin. Not staged separately.
- No header, no gold note, no cutaway of the wall from outside.

## The beam
- `BEAM` in layout.js: point source (the bulb), aperture (what a 30 mm gap in a 20 mm board passes at 40 degrees),
  receiving planes. The crack is a real slot with a shadowed spot behind it, so flat / lit show the stripe on her face.
- **Mask**: `node layout/render.mjs --set wall88 --prefix beam_ --modes flat --nojson`.
- Rhyme: **WL_in** (inside, along her eye-line) carries it: 40.5 degrees, upper right to lower left, through frame
  centre. **WL_out and WL_eye are mirrored** (upper left to lower right, 39.9 / 39.7): the two cameras look opposite
  ways down one cavity, so only one of them can match the attic. Inside was chosen because the pull-back to the
  Voyager frame starts there. To flip, move the crack to the other wall (swap the sign of x in layout.js).
- In WL_in the camera sits 2 cm above the sheet, so the mask is a wedge under the diagonal (as in AD_mote), not a
  thin band; in WL_out it is a thin band.
- "Inside?" (dark) is WL_out with the light off: same camera, no separate shot.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- `beam.js` is now a re-export of `layout/sets/_beam.js`; `build.js` imports `../_cast.js` (the engine's `littleJade`, see `layout/CAST.md`). Renders re-made after the engine's left-hand fix; the three masks are pixel-identical to before.

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- WL_out 1:37.4-1:45.5 and 1:45.5-1:51.0, WL_eye 1:40.7-1:45.5 ("I honestly don't know"), WL_in 1:51.0-1:54.5 ("Nowhere to
  go" into the tail).
