# Hard shots playbook

_A copy of this playbook is installed as the user-level Claude skill `hard-shots` (~/.claude/skills/hard-shots/), so other projects can use it. If you edit this file, re-sync the copy._

**What this is:** a method for making shots that AI image and video models usually get wrong, so filmmakers cut around them. Examples are hands touching or holding things, two bodies in contact, and anything partly hidden behind something else.

**Where it comes from:** one shot made on 2026-11-27, a close-up of two people's hands. She lays her hand across his, their fingers fold into a clasp, and he covers both with his other hand.

**How it's organised:** sections 1–4 and 6 apply to any hard shot. Section 5 and the hand checklist are specific to hands. This project's tools are kept in the appendix, so the main text works with any renderer and any image or video model.

## Terms

- **Guide:** a render from a 3D scene, passed to an image model as a reference image to copy. We render three versions of each guide:
  - **Form:** plain shaded clay, so the model sees the 3D shape. Each person is in their costume colours, and props are in one neutral clay tint.
  - **Contour:** black lines on white, drawn where surfaces turn away from the camera and where one object overlaps another.
  - **Lit:** a 3D render of the scene in its true colours under real lighting. It is not a painting.
- **Painter:** the image model that turns guides into a finished still.
- **Rig and pose:** a rigged human body mesh whose joints are rotated to make a pose. In our engine, a small solver (inverse kinematics) places the hand from a target position plus finger bend angles. Any rigged character in Blender or Unity works the same way.
- **Projection:** stretching a finished painting back over the 3D model from the camera it was painted from, like a slide projector, so the next render shows the painted surface.
- **Occluder:** whatever sits in front of and hides the part you care about, e.g. her hand on top of his.
- **Director:** the person making the film, who judges every result.
- **Last frame:** the final frame of an approved clip, saved as an image (e.g. `ffmpeg -sseof -0.05 -i clip.mp4 -frames:v 1 last.jpg`).
- **Contour overlay:** the contour guide recoloured red and laid over a painting, so you can see where the painting departs from the pose.

## Pipeline at a glance

1. **Build the scene:** pose rigged bodies in 3D from reference photos of the real gesture. Look at the photos; never feed them to a model.
2. **Render guides:** form, contour and lit. Also make a close-up of any small critical area: render the whole frame at double resolution, then crop that area.
3. **Paint the still:** give the painter the guides, a style reference and a prompt. For tangled or hidden parts, paint in layers (section 4).
4. **Animate:** give a video model the approved still as the start frame, and chain clips from real last frames (section 6).

Example guides from this project's repo, 3D renders only, for the clip's start frame: `cast/first_love/_prompts/v10/guide_hb/H3b_guide_{form,contour,lit}.png`, and the close-up `H3b_hold_zoom_pair.png` in the same folder.

## 1. Diagnose before you retry

- Put each bad painting next to the exact guide images it was given, zoomed in on the problem. Decide which of three things went wrong:
  - **Geometry:** the 3D pose is wrong.
  - **Readability:** the pose is right but ambiguous.
  - **The painter:** the guide is clean, but the model still got it wrong. Re-roll.
- **Most still-image failures were geometry or readability.** For a still, prompt wording almost never fixed anatomy; changing the guide did.
- **Prompts do matter for video,** because motion isn't in any guide (section 6).
- **Check the guide first when a painting shows something odd.** A spike on a thumb, a wrinkle, or a horn-shaped thumb tip each turned out to be the painter faithfully copying an artefact in our own render.

## 2. A correct guide can still be unreadable

Image models read guides coarsely, so give them unambiguous cues:
- **Show which way a hand faces:** fingernails on the backs of the fingertips, and palms slightly lighter and warmer than the backs of the hands. Without these, a palm-up hand looks like a palm-down one.
- **Give hidden parts their own shading:** a hand lying in another hand's shadow has no light-and-dark modelling, so it paints as featureless stumps.
  - Turn off shadow casting from the occluder onto that part, and light the part on its own.
  - Darken only the contact edges.
- **Draw lines only where they are real:** at actual joints and at every edge where one part overlaps another. Every extra line gets painted, so a crease where there's no joint becomes an extra finger segment.
- **Remove render artefacts at the source:** mesh folds and faceted shading usually come from an extreme joint angle. Adjust the pose, or smooth the normals in that region.
- **Enlarge small critical details:** also pass a close-up of the region. Render the frame at double resolution and crop the region out; don't enlarge a normal render.
- **Lock colours:** if the form guide colours objects by type rather than by real colour (ours renders all props blue-grey), also pass the lit render, and name the must-keep colours in the prompt.
- **Keep two people distinct:** give them different costume colours, keep each on the same side of the frame as in the references, and name both in the prompt. Otherwise the model swaps them.
- **No blank surfaces:** give every visible object one fixed, fully textured look in the model, on every visible side: furniture wood, upholstery, hardware, a watch face, a costume print. A plain surface invites the painter to invent something new there (a bookshelf painted into the plain back of an armchair), and details that change between shots are a tell-tale sign of AI.
- **Faces come from the face image, never from the guide** (round 4 of this project: every family face drifted into "a new cast", as if actors had been cast from a verbal description). Four causes stacked up: the painter took at most 5 images and silently dropped or replaced the rest, often the face sheet; the agent driving the painter rewrote the prompt in its own words; the guides drew the 3D body's generic face, which the painter copied; and long verbal face descriptions competed with the image. Rules:
  - send at most as many images as the painter takes (Codex image_gen: 5), and check its log for what it actually received;
  - send a tight crop of each visible person's face (front and three-quarter heads), not the whole character sheet, and put it in slot 1;
  - blank the face inside the head outline in the form and contour guides, keep only head, hair and outline, and give the gaze in words;
  - name each face image in the prompt, describe hair, glasses and age in words, but not the face itself;
  - make the driving agent pass the prompt and the image list verbatim;
  - never use an earlier painting as a face reference: drift compounds from shot to shot.
- **One cue that backfired:** a fine skin texture on the palm, meant to show curvature the way bricks show a wall receding. Painters read its lines as extra finger joints.

## 3. Choose the camera that shows the hard part

From a three-quarter view, only the curled fingertips of the hand underneath showed, and every painter turned them into stubs however well they were shaded. Looking straight down, the whole fingers showed and painted correctly at once.

If a body part keeps failing, find the angle where it is seen at full length before adding more cues. This is often the cheapest fix of all.

## 4. Paint in layers

This is the most reliable fix for anything hidden or tangled, once the camera is right.

1. **Paint the hidden part alone:** render it with the occluder hidden, from the final camera, and paint it. On its own, it paints correctly.
2. **Project it back:** put that painting back onto the part in 3D from the same camera, applied only to that part's mesh so nothing else picks it up. Any renderer that can project a texture from a camera can do this; three.js and Blender both can. Re-render the guides. The part now appears as finished paint, and everything else is still clean 3D.
3. **Add the next layer:** put the next occluder (her hand) back in 3D and paint again. The painter copies the painted region instead of reinventing it.
4. **Repeat** for each further layer (his covering hand).

**Caveats:**
- **One camera only:** a projection is valid only from the camera it was painted from. A new camera angle or a moving camera means starting again at step 1.
- **Errors get locked in:** a horn-shaped thumb in the first layer carried through every later layer. Before projecting a layer, put the contour overlay on it and check every digit.
- **New pose, new layer:** if a later frame needs a lower layer in a different pose, repaint that layer instead of reusing the old projection.

## 5. Gesture: direct actors, not layers

Correct anatomy is not yet a natural gesture. The director noticed that the layered stills looked "stacked". Real hands overlap at angles, fingers wrap around each other, wrists turn, and skin presses in.

- Picture how two actors would play the moment beat by beat. Find reference photos of that exact grip.
- Pose each beat as a keyframe, with a few millimetres of soft overlap at contacts rather than surfaces just touching.
- Leave the in-between motion to the video model.

## 6. Video models

- **Chain clips from real frames:** start each clip from the actual last frame of the previous approved clip, never from a separately painted keyframe. An end frame painted from an older pose forces the subject to rearrange itself mid-clip.
- **Start and end frames together produce a flat, linear glide.** The most natural motion came from a start frame alone, plus a prompt describing how a real person moves:
  - an arc, with easing as it arrives;
  - which part makes contact first;
  - the fingers settling one by one;
  - a small squeeze;
  - a slight give in whatever is pressed.
  Too much of this over-acts.
- **Name every limb by its costume and side:** for example, "his right hand, green sleeve, from the lower left". Longer prompts made the model attach the moving hand to the wrong arm, or change a sleeve.
- **The start frame sets the style.** Asking for "photorealistic" did not override a painted start frame.
- **Limbs entering from off-screen tend to pop in and pause.** "Already in motion from the first frame, sliding in from beyond the edge, never pausing" fixed it.

Example video prompt, the one that was chosen:
> From the very first frame his right hand is already in motion: it slides in from beyond the lower-left edge of the picture in one continuous movement and never stops or pauses until it lands. The two clasped hands stay holding each other. His right hand (hairy forearm, green sleeve) travels in a soft arc, slows as it arrives, and lowers onto their clasped hands: the heel of his palm lands first, then his palm settles, then his fingers relax and drape over her hand one after another, with a small gentle squeeze at the end. The clasped hands respond with a slight give. The camera is locked overhead.

## 7. How to work

- **Experiment one variable at a time:** run small groups of takes in parallel, changing one thing per group. For example: guide only; then plus zoom crops and an orientation note; then plus the lit render. The comparison shows what actually helped.
- **Review tools:**
  - the contour overlay, for accuracy;
  - a strip of frames, for a quick read of a video;
  - an HTML page with the clips side by side and a "play from the cut" button, for the final judgement at full speed.
- **Feedback loop:** the director names what feels off ("stubby", "horn", "flat motion", "over-acted"). The pipeline's job is to turn each note into a change in the scene, the camera, or the layer order.
- **When to stop:** if a part still fails after you've checked readability, tried a better camera and painted it in layers, the pose itself is probably unreadable from that angle. Restage it, or then cut around it. In this shot every failure was fixed by one of those three.

## 8. Continuity across takes and shots: the guide is the canon

The painter copies whatever the guide shows, and invents whatever it leaves out, differently in every take. Most continuity drift in round 4 of this project traced back to a gap or a placeholder in the guide, not to the painter.
- **Model everything the camera can see:** wall art, furniture, upholstery, floors, costume prints, watches. Give each one canonical texture, fully textured on every visible side. A blank wall, a plain chair back or a flat-coloured couch gets filled with something new in each take.
- **The guide's frame is the final frame:** anything outside the guide's edges gets invented. In this project the classroom cabinet, clock and posters moved between takes because the guide was framed tighter than the paintings. Render the guide at the final framing and tell the painter "match the guide's framing exactly; do not widen". Label any ref with a different framing (a face crop, an earlier painting) as "not framing".
- **Identity details come from the model, matched to the cast sheet:** glasses (frame shape, rim, colour), brow shape, hair, accessories. Crude placeholders get copied faithfully: torus-ring glasses and thick bar brows produced browline frames and heavy brows. Match the 3D shape to the painted reference side by side (front, three-quarter, profile), and follow the drawing, not the sheet's caption. If something can't be modelled to match, blank it in the guide and send a tight crop of the sheet instead (as with faces, section 2).
- **Things that change over time get one canonical version per era,** assigned by set (e.g. a parent's 1990s aviators versus their present-day frame).
- **Check what the painter actually received:** reference caps silently drop images, and a driving agent may reword the prompt. Read the log.
- **Review continuity before picking:**
  - put the same landmarks (wall art, furniture, accessory, glasses, brows) side by side across all takes, and across all shots of the same set;
  - use the contour overlay to catch a take that has re-framed the shot;
  - pick for consistency with the neighbouring shots, not only for the best single image.

## Mapping to other hard shots

| Shot | Hidden or tangled part, painted first | Camera choice | Contact cues |
|---|---|---|---|
| Hand holding a cup | The fingers wrapped around the far side of the cup (paint the hand alone, then add the cup) | Show at least two finger segments and the thumb | Fingertip pads flatten slightly against the cup; the cup sits in the hand, it doesn't float |
| Two people hugging | The arm across the far back (paint each body alone, then combine) | Over the shoulder of the person whose arms read most clearly | Fabric compresses where an arm presses in; hands spread on the back |
| Feet in a shot | Toes (or put socks on, unless bare feet are the point: image models garble toes) | Low enough to see the big toe separate from the rest | Weight shown as a flattened sole and spread toes |

## Starting in a new project

The method needs four pieces of tooling. Set them up before the first shot:
1. **A 3D scene with rigged human bodies.** Two options:
   - Reuse this project's three.js engine (`/home/jade/Documents/proof/layout/`; read `layout/engine/` and one set such as `layout/sets/fl_hands/`). It's fine to copy it.
   - Or use Blender with MakeHuman/MPFB rigs.
   Get props from CC0 libraries (Poly Haven, Kenney, Sketchfab CC0), scaled to real size.
2. **Guide renders:** form (flat shading), contour (Freestyle in Blender, or an edge pass), and lit.
3. **Camera projection** of a painting back onto chosen meshes: in Blender, the UV Project modifier from the shot camera; in three.js, a projective-texture material (see `layout/engine/paint.js`).
4. **A painter and a video model:** gpt-image via Codex (see the user's global CLAUDE.md, "Codex via tmux"), and a start-frame video model.
   Paid generation needs the user's explicit OK.

Until the 3D tooling exists, you can already start on the gesture, the reference photos and the camera plan.

## Props, liquids and things that move between keyframes

These are untested suggestions; prove them on the first shot that needs them.
- **Held objects:** layer order follows what hides what, from the back forward. Paint the hand alone (the object hidden), project it, then add the object and paint again. Fingers that wrap behind the object are the hidden part. A handle grip (teapot, mug) is a hand-alone layer first.
- **Liquids, steam and glass:** model a simple stand-in (a stream mesh, a liquid surface inside the cup) so the painter knows where they are. Paint them last, since they rarely go wrong in shape and they hide detail. Let the video model animate flow and steam rather than painting every state.
- **A new keyframe with new poses** needs its own layered paint-back. Projections don't carry over to new poses.
- **Children's hands:** proportionally shorter fingers, a fuller palm, and no visible tendons or knuckle wrinkles. Use the engine's child body proportions; don't scale an adult hand down.
- **Faces out of frame:** still name each person by costume colour and screen side in every prompt.

## Hand checklist

1. Find stock photos of the gesture, and pick the 3 poses that best fit the scene emotionally. Use them for reference only.
2. Pose them in 3D with rigged bodies, with soft contact of 1–4 mm.
3. Check the proportions against a real hand:
   - the palm (wrist crease to the middle knuckle) is a little over half the hand's length, roughly 0.55;
   - the knuckle row is no wider than the palm;
   - the thumb's three bones keep natural ratios.
4. Add the readability cues from section 2.
5. Choose a camera that shows every important finger at full length.
6. Paint in layers. Check every finger with the contour overlay before projecting each layer.
7. For motion, chain from the real last frame, use no end frame and a prompt that describes the motion, and name every limb by its costume and side.

## Appendix: this project's tools

- **3D:** a three.js layout engine with rigged MakeHuman bodies (`layout/`).
  - The hand solver and the readability marks (nails, palm tone, creases) are in `layout/engine/humanMesh.js`.
  - Camera projection is in `layout/engine/paint.js`, used through the figure option `paint`.
- **Painter:** gpt-image via the Codex CLI, run in tmux. It's on a plan rather than paid per call.
  - Give each concurrent job its own tmux session (`FL_SESSION`); jobs that share a session crash without reporting an error.
  - It takes at most 5 reference images (more fails, and Codex retries with its own subset or none), so we put extra refs side by side in one image when we need more (`tools/kf/r4lib.py` MAX_REFS, `combine`).
  - Codex rewrites the prompt unless told to pass it verbatim (`tools/kf/kf.py`, `KF_VERBATIM=1`).
  - Faces: tight crops from `tools/kf/face_crops.py`; faceless guides from `tools/kf/faceless.py`.
- **Video:** Seedance 2.0 through `tools/gen/gen.py`, which logs spend to `docs/spend_ledger.jsonl`.
  - Its extra reference images can't be combined with start/end frames or with 1080p.
  - 1080p cost about $0.37 per second as of 2026-11.
