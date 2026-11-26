# attic88_day: notes and assumptions

"Proof": Attic, Netherlands, winter 1988, by day. Derived from `../attic88` (which is not modified): the shell,
window, stair door and v4 fixed furniture are imported from `../attic88/layout.js` and `../attic88/v4.js`.


## r4 set fixes, 2026-11-26 afternoon (Jade's r3 review; supersedes anything below that contradicts it)

- **Paper keys = one exact texture** (`keyboard.js`; AD_piano: "the piano keys should be taped such that they represent
  *an accurate piano*"). The printout is ONE textured plane, drawn in code on a canvas (no image model): two A4 sheets
  landscape taped end to end (594 x 210 mm), black toner on white paper. Keyboard **C3..C6: 22 white + 15 black = 37 keys**
  (three octaves and the top C; middle C = C4 = 8th white key from the left), real size: white 23.5 x 150 mm, black
  13.7 x 95 mm printed from the far edge, groups of 2 (C# D#) and 3 (F# G# A#), no black key at E-F or B-C, real offsets
  (2.3 mm out in the C-E group; 3.4 mm out / centred in the F-B group). 517 mm keyboard centred: 38.5 mm margins at the ends,
  30 mm along the long edges (r3 had 21 whites C..B as ink boxes). The seam (x = 0) falls on the F4|G4 boundary, under F#4,
  with 19 mm clear tape over it. Map fold: creases at the seam and the quarter lines (+-148.5 mm) and once lengthwise at
  105 mm (folded packet 148.5 x 105 mm). Guides: flat / form / lit use the texture; line / contour multiply a hand-drawn
  edge map (every key edge, black keys solid black, tape edges and creases in grey) via the shared `_art.js` path, so every
  mode shows the exact layout. The mask twin blanks the texture. Sidecar `keys.keyboard`: range, sizes, margins, every
  black key's mm position from the keyboard's left edge, tape, folds. Assumption: no printed labels (no "middle C" text),
  as the painters are told "no text".
- **Answer to Jade's question** ("if you bake it into the 3d model, will that keep the image model on track?"): yes, it is
  the strongest lever we have: the guide now carries the exact key pattern in every mode, so the painter copies it rather
  than inventing it. It is not a guarantee: painters still drift on repeated patterns, so the r4 prompts should also state
  the pattern in words (37 keys C to C, black keys 2-3-2-3-2-3, none between E-F and B-C, count them) and the take must be
  checked by counting.
- **AD_grab restaged** ("the mom's hand is weird b/c the model is wrong. make it an actual grab, top-down"): Mama's right
  hand is now a power grip ROUND the child's right forearm (engine `hold`: cylinder r 2.6 cm, centre at 0.3 of elbow ->
  wrist, axis along the forearm), palm laid on the top of the forearm square to it (`forearmDown:` named point in build.js),
  fingers wrapping round the far side and under, thumb round the near side. Measured: palm centre 4.2 cm off the forearm
  axis (= 2.6 cm radius + palm thickness), so the hand is ON the arm (r3: a palm target 6 cm beside the wrist, fingers
  pointing past it). From this camera the back of Mama's hand faces the lens (the forearm's top faces the camera, dot 0.87).
  Mama kneels at her right turned toward her (at [3.20, 0.00], yaw 215, bend 10): her forearm enters from frame right and
  a little down; her head and body are out of frame. Camera unchanged (the shared grab framing).
  LIMITS (current mannequin): the mitt hand only roughly shows four wrapped fingers; a standing, bent-over Mama (arm straight
  down, the most "top-down") cannot reach without her body filling this camera, and the engine has no high kneel. When the
  body meshes land: high kneel (thighs upright) so the arm comes down steeper; the grip spec (`GRAB_R` in shots.js, with a
  `grasp` note for the grasp module) stays. Sidecar now also lists elbowR / wristR / shoulderR and the wrist report.
- **AD_trace caption**: Jade's caption "Were you afraid during the raid?" carries over from X_sw into AD_trace (comp
  handles captions; nothing in the set).
- Snapshotted the r3 guides to `media/keyframes/r3/_layout_snapshot/attic88_day/` before re-rendering.
- Shots that see the new keyboard texture: AD_wide, AD_keys, AD_piano. AD_frost_look, AD_mote, AD_trace, AD_grab, AD_fern
  do not show the paper.

## r3 changes, 2026-11-25 night (Jade's r2 review; supersedes anything below that contradicts it)

- **Paper keys** (`KEYS.kb` in layout.js, build.js): flat printed paper, keys never depress. The printed keyboard is now
  real piano size: 21 white keys (3 octaves C..B) at 23.5 x 150 mm, black keys 13.7 x 95 mm from the far edge (real
  2-3 offsets), 0.4935 m long, centred on the same two taped A4 sheets (0.594 x 0.21) with 50 mm white margins at the
  ends and 30 mm along the long edges. Was 14 keys filling the whole paper (42 mm keys). Added: one strip of clear tape
  over the seam and two map-fold creases (ink-thin, flat). Sidecar `keys.keyboard` gives the printed size and margins;
  `keys.corners_*` are still the PAPER's corners. Hands at the keys now softly curved (`KEYHAND` in shots.js), not flat.
- **Age 4.5 + socks** (AD_piano, AD_wide): no 4.5 kind exists in the engine or `_cast.js`, so build.js adds a
  SET-LOCAL kind `child4h` (the mean of the engine's child4 and child5 proportions) and a set-local cast key `jade4h`
  (littleJade's look, 1.045 m) via `addCast` (FLAG: if 4.5 recurs elsewhere, promote it to `_cast.js`). White crew socks
  (7.5 cm cuff) via basement90's `footwear()` (imported read-only from `../basement90/kit.js`), on `jade4h` and on
  `littleJade` wherever her feet are in a shot. AD_frost_look keeps `littleJade` (5, no feet in view; carried).
  OPEN for Jade: the keys scene (AD_wide 0:05, AD_piano 1:08) is now 4.5; AD_trace / AD_grab at the sill are still "five
  years old" in the intent. Same day or not?
- **AD_piano camera**: 35 mm, orbit el 28, dist 1.3 (was 40 mm, el 30, 0.95): her head (bent down, face hidden) and the
  whole paper with its margins are in frame, so the 4.5 proportions read; was cut at the shoulders.
- **AD_out, AD_thumbs RETIRED** ("you need facial expressions" is said at ~10, not at 5): moved to `RETIRED` in shots.js
  (not rendered); renders moved to `media/layout/attic88_day/_retired/`. office91 restages them at 10.
- **AD_mote KEPT** as the rhyme frame: it never depended on the line (no figure in frame, only her eye-line); it carries
  the beam diagonal for the 0:00 pad and the coda hit + bar 1. Its 0:09-0:16.7 intro slot lost its whisper: the intro
  0:07-0:18.2 now has AD_mote and the artichoke footage (AD_keys) to fill it; re-sequence in the edit.
- **AD_keys** is footage in r3 (artichoke growth 0-20 s); the camera stays (keys resized) for the coda bar 3 reuse.

## Assumptions (the plan leaves these open)
- **Window faces due south.** +x = south, +z = west. Sun: mid January, about 10:40 solar time, azimuth 160, altitude
  16 degrees, so the light travels north, a little west, and down (`SUN_DIR`). Change `SUN` in layout.js to re-aim;
  the mote and the two rhyme cameras (AD_mote, AD_wide) were tuned to this bearing and need re-tuning if it moves.
- **The neon blade sign of attic88 v3/v4 is not in this set.** At this bearing it would shade a 0.37 m wide vertical
  stripe of the window (it hangs at z = -1.0, 0.3-1.0 m out). Either the sign is not there in "Proof", or the sun has
  to come from 40 degrees or more on the west side, which puts the beam on the sleeping mats. Director's call.
- **The printout** (from Jade, 2026-11-22): regular printer paper (A4 or Letter), printed, taped together and folded like a
  map. `KEYS` at 0.594 x 0.21 m already equals two A4 sheets landscape, taped end to end; A4 is this set's guess for the
  Netherlands. Tape seam, map-fold creases and the unfolding camera are not built yet (see the plan's 0:05 row).
- **Paper keyboard is in the beam and she plays it with both hands**, sitting cross-legged in the tail of the beam
  facing up it (`SEAT`, `KEYS`). The light there is below chest height: hands, knees and paper are lit, her face is
  above the light. The keyboard was moved from attic88's position and turned to face her.
- **Reading spot**: a cushion to kneel on at the sill, the sill board as desk, a book left on it; the v4 textbook stack
  is at her right hand. The stack's top 7 cm is in the beam and notches the near corner of the footprint (visible in
  flat / lit, not in the analytic footprint).
- **Frost** on all four panes; the fern is on the lower pane nearest the reading spot (`FERN`, pane `window_BR`).
- **0:18 thumbs** staged here (same axis as the outside shot), with Mama as the adult. The plan places the 4:05 version
  in the Decatur kitchen; where the 0:18 one happens is the director's call.
- By day the kitchen light through the floorboards, the stair bulb and the bare bulb are off; the stair door is shut.

## The beam
- `BEAM` in layout.js: direction, four pane apertures (inner wall face, less jamb shading and the mullion cross), their
  outline, the receiving planes. build.js makes the solids (`beam.js`), a real shadowed directional light, and the
  sidecar block `beam` (aperture and floor footprint in px and world, on-screen diagonal, rhyme error).
- **Mask**: every shot has a twin `beam_<id>`. `node layout/render.mjs --set attic88_day --prefix beam_ --modes flat --nojson`
  gives white = lit volume, black = everything else. The volume ignores shadows cast inside the beam (her body, the
  stack); the `flat` render of the normal shot has those. Frost is hidden in the mask.
- `line` mode: floor in shadow is pale grey, sunlit floor is white with an outline.
- Rhyme (`beam.js` RHYME: 40 degrees, upper right to lower left, through frame centre): AD_mote 39.9, AD_wide 41.5.
  The outside shots (AD_out, AD_thumbs) look down the beam from just above it, so there the beam is the lit lap and
  keyboard at the bottom of frame, not a diagonal. In AD_mote the camera is just above the beam, so the mask is the
  half of the frame under the diagonal, not a band; the band reading is AD_wide.

## Not built / open
- 4:19 "Her eyes return to a mote in the window light": the plan does not say which room; no camera here. AD_out and
  AD_mote would serve if it is the attic.
- The fern is a guide (stem and branches, label mode only). The mote marker is a 24 mm ball, label / lit only.
- AD_thumbs and AD_grab are rough: mannequin hands are mitts, and in AD_grab her head is large in the foreground.
- `sheet.sh`: contact sheets into `media/layout/_sheets/attic88_day_{label,line,beam}.jpg`.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. `AD_thumbs`: Mama's left hand was re-staged as the mirror of her right in the camera's vertical plane (the old numbers had been tuned against the bug). Looked at after the change: both thumbs point at her cheeks from either side of the lens; `AD_keys` both hands lie on the keys; `AD_grab` unchanged apart from the camera.
- **Cast.** `littleJade` and `mama` are the engine's; `build.js` imports `../_cast.js` (see `layout/CAST.md`).
- **Beam.** `beam.js` is now a re-export of `layout/sets/_beam.js` (one file for every set). `sheet.sh` still works; `layout/sets/_sheet.sh <set> [modes]` is the shared copy.
- **The grab framing (AD_grab = market93 M4).** One framing for the film's forearm grabs: 50 mm, camera 0.92 m from the midpoint of the grabbed forearm, 31 deg above it, 30 deg round to the child's right, that midpoint at (0.5, 0.52) of the frame, the adult's forearm entering on a diagonal from an upper corner and closing on it.
  Matched here: lens, distance, elevation, the 30 deg, the frame position (the old camera was 0.90 m / 31 deg / 33 deg aimed at the wrist, so this shot barely moved).
  Not matched: the side. The window wall is 0.1 m in front of her hand, so the camera has to be BEHIND her and Mama's hand enters from frame RIGHT; in the market the camera has to be in front and the hand enters from frame left. The two frames are mirror images in that respect; flop one in the edit if the rhyme should be literal.
  The mask `beam_AD_grab` is now white over the whole frame (the camera looks through the shaft at the sill).
- **Times.** Tail and coda labels follow `analysis/v3/song_map.md`: `AD_fern` 3:53.0-4:05.0 (outro line 1 enters over it at 4:03.5); coda reuse of `AD_mote` = hit + bar 1 (4:24.5-4:28.4), of `AD_keys` = bar 3 (4:30.8-4:33.2). The split of the coda's bars between shots is this pass's reading of the plan's "one per bar" on the v3 grid (mote, count, keys, playground). Labels only.
- `beam_AD_thumbs` is black over the whole frame, as before this pass (her face is above the shaft and the keyboard is out of frame).

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- AD_out 0:07-0:18.2 (whisper 1 at 0:08.8); AD_thumbs 0:18.2-0:19.0 (whisper 2); AD_piano 1:08.3-1:13.2 and AD_frost_look
  1:13.2-1:17.2 (break bars 5 and 7 to the pre-chorus); AD_trace 1:36.0-1:37.4, AD_grab 1:37.4 (the band hit); AD_fern tail 2
  3:43.0-3:55.0; coda: AD_mote hit + bar 1 4:14.3-4:16.8, AD_keys bar 3 4:19.2-4:21.7 (-2sm's coda has no sparse lead-in:
  the groove starts on the hit).
