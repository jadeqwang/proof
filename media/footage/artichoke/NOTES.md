# Artichoke growth: botanical plate animation

A hand-coloured botanical engraving of a globe artichoke (*Cynara cardunculus* var. *scolymus*) grows on one locked sheet
of cream laid paper, from a bare mound of earth to a seedling, a rosette, a flowering stem and bud, and ends with the bud
opening into the purple thistle flower. Made 2026-11-24 as the karaoke background, and as footage for the film later.

## Outputs

| file | what |
|---|---|
| `out/artichoke_growth_prores422hq.mov` | master: 1920x1080, 30 fps, 140.00 s (4200 frames), ProRes 422 HQ 10-bit, silent, about 4 GB (git-ignored here) |
| `out/artichoke_growth_preview.mp4` | H.264 preview from the master (crf 14, tune grain, flat I/P/B quality), about 55 MB |
| `stages/s00.png` … `s16.png` | the 17 picked growth plates, 1672x941 from the image model, each with a `.txt` sidecar (route, reference, full prompt) |
| `stages/plate.png` | the blank sheet (paper, plate mark, caption). Every frame is printed on this one sheet |
| `stages/PICKS.txt` | which candidate became each stage |
| `layers/` | the plant of each stage pulled off its paper, registered and with the earth locked (16-bit, 2560x1440), plus `*_check.jpg` |
| `timing.json` | runtime, stage order, transition lengths, camera keys. Edit this to retime |
| `prompts/` | `_style.txt`, `_layout.txt`, the anchor prompt `s12.txt`, and each stage's full prompt `sNN.full.txt` |
| `scripts/` | the pipeline, below |

Stage plan: s00 bare mound · s01 cotyledons · s02 first true leaves · s03-s08 a widening rosette of silvery, deeply lobed
leaves · s09 the full rosette · s10 the flowering stem rises with a small bud · s11 a taller stem and bigger bud ·
**s12 the anchor**: mature plant with a closed bud and a side bud · s13 the bracts loosen · s14 the first violet tuft ·
s15 florets fan out · s16 full bloom, and the side bud opens.

Timeline at the current `timing.json`: a 3 s hold on the bare mound, 16 transitions of 7.7 s each (the four flowering
ones stretched to 8.5, 9.2, 10 and 10 s), and a 7 s hold on the full bloom. The camera starts at 1.45x on the mound,
holds for the first 11 s, pulls out to the whole sheet by about 77 s as the plant fills it, holds, then pushes in slowly
to 1.08x on the flower over the last 48 s.

## Method

1. **Anchor first.** `s12` was generated with no reference (prompt `prompts/s12.full.txt` = subject + `_layout.txt` +
   `_style.txt`). It was made the middle of the chain because it fixes the composition, the scale, and the room left above
   for the flower.
2. **Chain outward, one neighbour at a time.** Each earlier stage is an edit of the stage after it ("the same plant N weeks
   EARLIER", `scripts/stages.py` BACK). Each later stage is an edit of the one before it (FWD). Two candidates were made per step,
   and the one that changed least apart from the intended growth was picked by eye. From s04 down, the reference was the
   *locked* composite of the neighbour (`work/sNN_locked.png`), so the earth could not drift further. s00 (the bare mound)
   was made directly from s12 with the plant removed (`prompts/s00.full.txt`), and `plate` from s12 with plant and earth removed.
3. **Lock the paper** (`scripts/layers.py`). The caption is phase-correlated against the plate to register each stage
   (shifts were all under 4 px at work resolution). The plant mask comes from the Lab difference to the plate. The layer is the stage divided by its own
   paper colour (a fitted quadratic surface), with paper-level values lifted to exactly 1. So the stage's own paper grain is
   thrown away, and only the plate's grain is ever seen: the background cannot flicker or wobble.
4. **Lock the earth.** In the ground band (74.5-84.5% down), a pixel keeps the stage's value only where it is plant (its red is
   absorbed at least as much as its green). Everything else comes from s00. Every frame shows the same mound and pebbles.
5. **Animate** (`scripts/animate.py`, on the GPU). For each pair of stages: RAFT optical flow in both directions (torchvision
   `raft_large`), trusted only where forward and backward flow agree. A per-pixel progress `w` sweeps out from the plant's base
   along the plant (geodesic distance through the plant mask), so growth spreads from the base to the tips. Dark engraved
   lines lead the washes slightly (`ink_lead`), so the line is drawn before the colour. Both stages are flow-warped toward each other
   and blended in optical density (log transmittance), so a half-faded stage never washes out to a pale double exposure.
   Each transition eases in and out, so the motion settles briefly at every stage. Then the frame is `plate x layer`, and the camera
   crop is area-filtered.

Image generation: all 39 calls (38 succeeded; one failed on a tmux race) went through Codex `image_gen` (plan-billed, $0) via `tools/kf/kf.py --route codex`, wrapped by
`scripts/gen_stage.py`, which adds the `media/genlog.jsonl` row (tag `artichoke`; cf routes log themselves). The paid fallback
was never needed.

## Re-render / retime

```bash
PY=/home/jade/Documents/halys-video/.venv/bin/python
cd media/footage/artichoke
$PY scripts/animate.py                       # master + preview into out/ (about 4 min on the 3090; first run adds flow prep)
$PY scripts/animate.py --preview             # preview only
$PY scripts/animate.py --frames 0,2100,4199 --stills work/stills    # spot-check frames as 16-bit PNG
$PY scripts/animate.py --timing my.json --tag alt                   # an alternative cut beside the main one
$PY scripts/qc.py out/artichoke_growth_preview.mp4 work/qc 5        # frame-to-frame change, pop detection, contact sheet
```

Retiming is done in `timing.json`. `total` fits everything to a runtime; set it to `null` to use `trans` literally. `trans` is
one number or a list of 16. `weights` stretches named gaps (`"s14-s15": 1.3`). `hold_start` and `hold_end` set the holds. `soft` is how long each
pixel takes to change, as a fraction of its transition (smaller makes a crisper drawing-on wave). The `camera` keys take `t` as a fraction of the runtime,
with `zoom` and the centre `cx`, `cy` as fractions of the sheet. To drop a stage, remove it from `stages`. Changing `fps` is fine.

To replace one stage:
`scripts/step.sh sNN <neighbour png> 2` makes two candidates in `work/`, then
`scripts/next.sh sNN <k>` picks one and rebuilds its layer. Then delete `work/cache/` entries that name it, or leave them: the cache
is invalidated by layer mtime. Re-render after that.

## Weaknesses

- **Neighbouring stages are separate drawings.** The model redraws the leaves each time. In transitions where the plant changes
  most (s08→s09, s09→s10, s10→s11, the stem shooting up), parts of the leaves dissolve rather than visibly
  extend, and the old bud fades while the new, higher one draws in. It reads as the plate being re-engraved as it grows, not as
  time-lapse growth.
- **The first minute is small.** Up to about s07 the plant is small in frame even at 1.45x. That leaves the top of frame
  quiet for lyrics, but the growth there is gentle. Zoom further in only with an upscaler: the stages are 1672 px wide, and
  1.45x already enlarges them about 1.7x.
- **The earth is the model's texture.** The locked mound (from s00) has a slightly tangled, "AI" hatching under close
  inspection.
- **The bloom is saturated.** The s16 violet is stronger than the rest of the palette. It could be regenerated with a more muted wash
  (`scripts/stages.py` FWD s16, then step/next).
- **The sheet's plate mark** shows as a thin line at the bottom edge of frame at the start and end zooms.
- **The H.264 preview** has an under-1-code-value texture refresh every 10 s keyframe (unmeasurable in the ProRes master,
  whose largest frame-to-frame ratio is 1.6, with no pops). Use the master for the edit.
- **For karaoke:** the cream paper is light, so the white Cantarell lyrics rely on their black outline. Consider a slight
  darkening or a soft band behind the lines.
