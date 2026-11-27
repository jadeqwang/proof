# Hard shots playbook

Learned on 2026-11-27 while making a close-up of two people's hands: she lays her hand on his, their fingers fold into a clasp, and he covers both with his other hand. Image models are notoriously bad at this kind of shot, and filmmakers usually cut around it. This note records what made it work, so it carries over to future hand scenes and to other "impossible" AI shots: interlocked bodies, objects held in hands, feet, two people touching, anything occluded.

## The core idea

Don't sidestep the shot. Break it into steps that the models are good at, and let a 3D engine supply what they are bad at. Each step should hand the next one something it only has to copy, not invent.

The final chain was:
1. A 3D scene in three.js, with rigged human bodies posed from reference photos.
2. Guide renders: shaded form, contour lines, and a lit pass.
3. Image-model paintings, built up one layer at a time.
4. A video model given the start frame, chaining each clip from the real last frame of the one before.

## 1. Diagnose before you retry

- Before you change the prompt, put every bad painting next to the exact guide images it was given, zoomed in on the problem. Decide which of three things went wrong:
  - **Geometry:** the 3D pose itself is wrong.
  - **Readability:** the pose is right but hard to read.
  - **The painter:** the guide is clean and the model still got it wrong.
- Most failures were in the first two. Prompt wording almost never fixed anatomy; changing the guide did.
- When a painting shows something strange (a thorn on a thumb, a wrinkle in the thumb web, a horn-shaped thumb), check the guide first. In every case this week, the painter had faithfully copied an artefact that was in our own render.

## 2. A correct guide can still be unreadable

Image models read guides coarsely. Give them unambiguous cues:
- **Which way the hand faces:** fingernails on the backs of fingertips, and a slightly lighter, warmer palm side. Without them, a palm-up hand looks like a palm-down one.
- **Strong shading where forms overlap:** a hand sitting entirely in another hand's shadow has no shading to read. That is why his under-hand kept painting as stumps. Light occluded parts on their own (no cast shadow from the occluder), and darken the contact edges.
- **Lines only where they are real:** contour lines at actual joints and at every edge where one part overlaps another, and nowhere else. A fake crease gets painted as an extra finger segment.
- **No artefacts:** fix mesh folds and faceted shading at the source (pose, normals, smoothing).
- **Size on screen:** when the critical detail is small, also pass a 2x crop of that region, rendered at double resolution rather than upscaled.
- **Fixed colours:** the shaded pass tints props by class, so also pass the lit render and name any colour that must not change in the prompt.
- **Who is who:** give the two people different costume colours, keep each on the same side of the frame as in the references, and name both in the prompt. Otherwise the model swaps them.
- **What didn't work:** a surface texture on the palm, meant to act like bricks on a receding wall. It helped a little, but painters read it as extra finger segments. Drop it.

## 3. Choose the camera that shows the hard part

From a three-quarter view, only the curled fingertips of his under-hand showed. Each painter turned those into stubs, however well they were shaded. Looking straight down, the whole fingers showed and painted correctly at once. If a body part keeps failing, find the angle where it is shown at full length before adding more cues.

## 4. Paint in layers (the strongest technique)

For any part that is hidden or tangled in the final shot:
1. Render it alone, with the occluder hidden, from the final camera. Paint it. Isolated, it paints correctly.
2. Project that painting back onto the part in 3D from the same camera, like a slide projector (engine figure spec `paint`, in `layout/engine/paint.js`).
3. Add the next layer (her hand) in clean 3D on top, and paint again. The painter now copies a finished, believable region instead of reinventing it.
4. Repeat for each layer (his covering hand).

Caveats:
- A projection is only valid from the camera it was painted from.
- Layers lock errors in. A horn-shaped thumb in the first layer carried through every later stage. Before projecting a layer, overlay the guide's contour in red on the painting and check every finger.
- If a later frame needs a lower layer in a different pose, repaint that layer instead of reusing the earlier projection.

## 5. Gesture: direct actors, not layers

Correct hands are not yet a natural gesture. Picture how two actors would actually play the moment, then pose that:
- Her hand lands across his at an angle, not lined up with it.
- Their fingers fold into a mutual clasp, like a swing-dance handhold.
- His wrist turns slightly inward.
- The covering hand comes in and makes a sandwich.
- Skin presses in a few millimetres instead of stacking in flat layers.

A still frame can't carry weight and timing; a video model can.

## 6. Video models

- **Chain from real frames:** each clip starts from the last frame of the approved previous clip, never from a painted keyframe. An end frame painted from an older pose makes the hands rearrange themselves mid-clip.
- **First and last frames together produce a flat, linear glide.** The most natural motion came from a start frame with no end frame, plus a prompt that describes how a real person moves:
  - it travels in an arc and eases as it arrives;
  - the heel of the palm lands first, then the fingers drape one by one;
  - a small squeeze;
  - the hands underneath give a little.
  Too much description over-acts.
- **Name every limb by its sleeve and side.** Longer prompts made the model attach the moving hand to the wrong arm, and once it changed his sleeve into a white cuff.
- **A "photorealistic" prompt does not override a painted start frame;** the first frame sets the style.
- **Limbs entering from off-screen** pop into view and pause. Prompting "already in motion from the first frame, sliding in from beyond the edge, never pausing" fixed it.
- **Seedance 2.0:** reference images can't be combined with start/end frames or with 1080p. 1080p costs about $0.37 per second.

## 7. How we worked

- **Learn by experiment:** change one variable per group of takes and run the groups in parallel. For example: guide alone, then plus zoom crops and an orientation note, then plus the lit reference. That shows which change mattered.
- **Codex free route:** each take gets its own tmux session (`FL_SESSION`). Parallel takes that share a session crash without any error. Codex accepts at most 5 reference images, so merge pairs (form and contour side by side) when you need more.
- **Review aids:**
  - a red contour overlay on each painting for accuracy;
  - frame strips for a quick read of a video;
  - an HTML page with clips side by side and "play from the cut" buttons for the final judgement at full speed.
- **Judgement:** the director spots what is "off" (stubby, horn, flat motion, over-acted). The pipeline's job is to turn each such note into a change in the 3D scene, the camera, or the layer order.

## Hand-scene checklist

1. Search stock photos for the gesture. Pick the 3 poses that best fit the scene emotionally, and keep the photos look-only.
2. Pose each in 3D with rigged bodies. Hands are posed to the solver's joints, with soft contact of a couple of millimetres.
3. Check proportions: palm fitted to the knuckles, thumb joints placed correctly, real hand size.
4. Add the readability cues from section 2, with socks on feet unless bare feet are the point.
5. Choose the camera that shows every critical finger at full length.
6. Paint in layers, checking every finger against the contour overlay before projecting each layer.
7. For motion, chain from the real last frame, with no end frame and a motion-rich prompt that names each limb by sleeve and side.
