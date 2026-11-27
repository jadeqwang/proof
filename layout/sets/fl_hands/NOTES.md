# fl_hands: 3D guide for first love's hands sheet (D), studies 2 and 3

Not a film set. Reference rig for cast/first_love/_prompts/v10 (sheet D, take D_t3.jpg). Both heads hidden in every
shot (hideParts), so no face can enter the frame; his body is the faceless firstlove19 mesh anyway.

Render: node layout/render.mjs --set fl_hands --shots D2_guide,D3_guide --modes form,contour,lit --w 3072 --h 1728 --out <dir>
Checks: node layout/engine/clipcheck.mjs --set fl_hands --shots D2_guide ; holdcheck.mjs on the D2_guide sidecar.
Debug shots: dbg_her / dbg_him (each alone), dbg_nogrip (grip tags off, so the clip check reports where hands meet).

## 2026-11-26: first build
- Pose (Jade, via the lead): "a simpler pose where he takes one of her hands in 2 of his". Both cross-legged on the
  floor, facing, hips 1.04 m apart. Her RIGHT hand, palm down, flat, toward him over his crossed shins; his LEFT palm-up
  under it (fingers toward her wrist), his RIGHT palm-down over the back of it (fingers across it, curling round her
  little-finger edge, thumb tucked); her LEFT hand relaxed on her lap. Him 19: forest-green sleeves pushed up, BLACK
  SLACKS (Jade 2026-11-26). Her: bare forearms, beige trousers, a pale top with pushed sleeves (top colour a guess).
- Which hand of hers he takes (right) and which of his is underneath (left) are my choice: flag for Jade.
- Contact: the palm centres had to be stacked 4.7 cm (upper) / 5.4 cm (lower) apart, more than two hands' thickness:
  the engine's palm-centre targets sit deeper in the mesh hands than nominal. Tighter stacking put his fingers / thumb
  through her hand (up to 18 mm). As built: clip check pass (grip contact 1.8 mm into skin, within tolerance; joints
  in range); hold check pass (upper hand in contact, 2.2 mm). The LOWER hand is ~1 cm under her palm (not touching):
  the painter should close that gap. Her held fingers are straight ('flat'), a little stiff.
- No reference-photo search was run for this pose (look-only photos for posing): flagged.
- The cross-legged leg pose belongs to another agent (engine 'cross', being edited); these renders show its state on
  2026-11-26 late evening.
- The film's closet02 CL_hands uses a different hold: FOUR hands, her two palm-up, his two palm-down resting on them
  (shots.js jade()/him()); CL_chin has her right hand at his chin with his right hand over it.

## 2026-11-26 (later): Jade's correction, the CRADLE hold
- "he should have both palms up and my hand is on top": his two hands side by side, palm-up (tilted 14 deg toward
  each other), fingers toward her and angled in, a slight 'palmUp' curl; her RIGHT hand palm-down on his two palms,
  fingers gently curved ('relax', spread 2), thumb kept in the palm plane (thumb opp 0: the default thumb hung down
  between his hands); her LEFT hand relaxed on her lap. Hips 0.96 m apart (closer than v1); hands over his shins.
- Reference (look-only, scratchpad only, not in the repo): Unsplash EVeqqKNCzRo, a hand resting on an upturned palm.
- Numbers that clear (found by clip-check sweeps): his palm centres 6.6 cm under hers, 3.6 cm either side, 6.5 cm
  toward him; her fingers aimed 6 deg up (the curl brings the tips onto his palms).
- Checks: clipcheck D2_guide pass (grip contact 0.7 mm, no body-body penetration, joints in range); with the grip tags
  off (dbg_nogrip) body vs body 2.6 mm max (her fingertip pads on his palm): pass; holdcheck pass (contact 0.2 mm,
  penetration 0).
- The v1 sandwich pose is superseded (its shots.js is not kept).

## 2026-11-27: drawability test, three candidate holds (H1, H2, H3)
- Posed from look-only photos in the scratchpad (handrefs/01, 02, 03; never sent to an image model).
- Seating: cross-legged facing square on, their crossed feet collide at any hip distance from 0.9 to 1.1 m (37-61 mm,
  current engine pose); offset 0.2 m to each side at 1.0 m they clear (dbg_legs_1_0.2). So each faces slightly past
  the other's left shoulder; the inner knees are her LEFT and his LEFT, and the holds rest on those. Spine bend 34 on
  both (needed to reach). FLAG: not exactly "knee to knee".
- H1 (photo 1): two joined pairs, each his hand palm-up under hers; pair A (her left + his right) on her left knee,
  pair B (her right + his left) on his left knee. The pairs sit on the knees, so higher than the photo's "low in the
  gap between the laps" (the gap is filled by their crossed feet). FLAG.
- H2 (photo 2): on his left knee, his left palm-up under her right hand, his right over the back of it (thumb on the
  back of her hand); her left hand on her lap.
- H3 (photo 3): his left palm-up on his left knee, her right hand laid on it, fingers curled over its outer side; the
  other hands on the laps.
- Checks (current engine): clipcheck H1/H2/H3 pass (grip contacts 1.1 / 0.5 / 2.9 mm, joints in range); holdcheck
  H1 pass (2.1 mm), H2 pass (1.2 mm), H3 pass (3.2 mm palm). With the grip tags off (dbgng_*), her fingertips press
  5-6 mm into his knee in H2 / H3 (resting on it through the slacks).
- Camera: beside(), perpendicular to the line between their hips, 30 deg down, the frame top at the neck line (heads
  hidden too); the neck openings of the hidden heads just touch the top edge in places: crop a few px if needed.

## 2026-11-27 (night): H3b -> H2b, one clip from one camera (shots H3b_guide, H2b_guide)
- Renders: cast/first_love/_prompts/v10/guide_hb/{H3b,H2b}_guide_{form,contour,lit}.png (3072x1728). Same camera
  (CAM_HB: azimuth -40, elevation 38, 0.9 m, 35 mm; him on the LEFT, her on the right) and the same bodies in both;
  H2b only adds his right arm.
- The hold stays H3's spot on his left knee; his left palm-up hand is exactly H3's. Measured on the mesh bodies (scratch
  Rapier script beside clipcheck, because clipcheck hides hand-on-hand contact behind the grip tag), H3 had two faults:
  her palm hovered ~3 cm over his palm with only her strongly curled fingertips down, and those went 6 mm into his
  wrist. HB.p: her hand 4 mm lower, 2.5 cm toward his little-finger side, fingers less curled, so her palm rests on
  his curled fingers and her fingertips drape over the heel and outer edge of his palm (1-2 mm contact, ~30 skin
  vertices within 3 mm, nothing deeper).
- His right shoulder could not reach her hand (reach 1.09-1.23), so the lead's covering hand hovered short of hers or
  slid under it. Fix: his trunk turns toward the hold (spine twist 30 left, side -12, bend 36) in BOTH frames. Covering
  hand (COVER, in her solved hand frame HER_R): palm 3.6 cm above her palm centre and 4.5 cm toward her knuckles (his
  palm on her distal metacarpals, 5 cm clear of her wrist). Fingers point across her hand to her little-finger side,
  dipping 17 deg, with a light curl, and drape over her ulnar edge. Thumb lies on the back of her hand. Reach 0.76,
  elbow 82 deg and down, wrist flex 19 / radial 19 (in range).
- Checks: clipcheck H3b pass (grip 1.0 mm), H2b pass (grip 1.5 mm), joints in range. Mesh contact: his covering
  palm on her hand, min -1.4 mm, 32 vertices within 3 mm. His draped fingertips just touch his own lower hand (-2.9 mm,
  within the 3 mm tolerance). holdcheck flags both frames as "adjacent" (6 mm): it measures the procedural capsule
  hand, which sits ~5 mm off the mesh hand. The mesh check and the renders show contact.
- Debug views: dbg_hb3_* / dbg_hb2_* (top, side from her little-finger side, side from her thumb side). Contact was
  checked by eye in all of them.
- Limits: in H2b his right forearm crosses over her draped fingers, so from the shared camera her fingertips are mostly
  hidden. Her hand shows a small mesh crease line on its back (it was in H3 as well). The torsos are in frame from
  mid-chest down; no neck openings show.

## 2026-11-27 (later): H3b/H2b v2, from Jade's review of the paintings
Re-rendered over the same files in cast/first_love/_prompts/v10/guide_hb/. Everything was measured on the baked mesh
bodies with scratch Rapier scripts (hand on hand, every forearm and hand against its own legs).
- His LEFT forearm sank 36 mm into his thigh (and his hand 23 mm into his knee), so the arm read thin. Fixes: the hold
  is raised 2.8 cm (at y 0.25), his elbow goes out over the thigh, and his palm tilts ~35 deg toward the camera.
  Forearm on the thigh now -0.7 mm (20 vertices within 3 mm), hand on the knee 2.2 mm, wrist in range.
- His left palm-up hand: the thumb lies alongside the index (it poked up through the stack). His little-finger edge,
  wrist to little finger, faces CAM_HB and is continuous in H3b. Her hand moved 4.5 cm toward his thumb side, so it lies
  in his cupped palm and leaves that edge clear. It rests on the rim of his palm and on her thumb (2.6 mm), with a
  small gap under its centre (his palm is cupped).
- The "thorn" on the back of her right hand was a real mesh fold, not a contour glitch: her thumb was adducted flat
  against the index (sweep 18, abd 0) and the skinned web skin folded into a jagged crease, visible in lit too. Now the
  thumb spreads in the palm plane (opp 0.1, sweep 55, abd 0, mcp 4, ip 8): smooth in form, lit and contour.
  H1_guide uses the same thumb (HER_HAND) and shows the same spike on her hands (contour check). It is NOT changed here
  (H1 is accepted); fix it by giving HER_HAND that thumb. The D guides seen from above show no spike.
- His RIGHT hand in H3b hovered ~10 cm over his foot ('lap' shortcut). It now rests palm down on his right knee
  (-0.8 mm) and is outside the frame.
- Her LEFT hand: v1 had it on her lap with the fingers laid out straight toward the lens, cut by the frame edge, so it
  read long. It now rests curled on her left knee (-1.3 mm), fully in frame, at the same distance from the lens as the
  hold. Hand size is unchanged (18.7 cm).
- Covering hand: the same in her hand's frame. COVER is now across 0.035 (was 0.02) with a lighter curl, so his
  fingertips stay on her hand and off his own left wrist. Contact -1.4 mm, 71 vertices within 3 mm, palm 5 cm clear
  of her wrist. Wrist flex 23 / radial 18, reach 0.77.
- Camera: CAM_HB is now camAt([-0.09, 0.26, 0.01], -40, 40, 0.95, 35): framed lower and slightly wider so her left hand
  is whole; him on the left.
- NOT solved: in H2b his left wrist is hidden behind his own covering hand and forearm. From any camera on her side
  (him on the LEFT) that wrist sits directly behind the stack. I tried camera azimuths -10..-55 and elevations 22..65,
  and a lower or tucked right elbow (that puts his right wrist out of range). His left forearm shows above the
  stack and his left hand's edge and fingers below it; H3b (the clip start) shows the whole wrist.
- Checks: clipcheck H3b / H2b pass (grip 2.6 mm, joints in range). holdcheck flags "penetrates" at 3.7 mm on his
  capsule thumb2 (limit 3; the capsule hand sits ~5 mm off the mesh hand, where the mesh check reads 2.6 mm).
  D2_guide now FAILS clipcheck with legs crossing (46 mm). That shot is untouched here, so the cross-legged engine
  pose must have changed under it.

## 2026-11-27 (later still): H3b/H2b v3, her LEFT hand on her knee
Jade: the hand on her left knee is "a little bit strangely shaped ... the proportions of the palm are kinda off".
Re-rendered over cast/first_love/_prompts/v10/guide_hb/{H3b,H2b}_guide_{form,contour,lit}.png. Only HBX.herL changed;
the hold, both of his hands, her right hand and CAM_HB are unchanged (pixel diff: only her left arm, hand and the
shading on her side of the frame differ).
- Look-only refs (scratchpad restrefs/, 7 photos, never sent to a model): palm-down hands resting on a cross-legged
  knee or on a thigh. The palm lies on the leg, the wrist is near straight or a little extended, the fingers fall over
  it with a light graded curl (index least, little most) and the thumb lies relaxed beside the index.
- Mostly POSE. v2's hand was a claw: middle finger curled 28/38/18 deg (84 deg in all) with its palm 18 mm above the
  thigh, so only the fingertips touched. From CAM_HB that showed the back of the hand as a long slab ending in four
  knuckle stubs. v3: palm on the distal thigh, toward its inner side. The heel of the hand is at -1.1 mm and the palm
  centre band at -1.1 mm (Rapier on the baked mesh). The fingers rest with a graded curl (index 10/18/8 .. little
  22/32/14). Wrist: 6 deg extension, 18 deg ulnar deviation (v2: 26). The thumb curls down beside the index (opp 0.2,
  sweep 40, abd 2, mcp 16, ip 20); a flatter thumb (sweep 24-38) folds the web skin into a crease, as on her right
  hand. The forearm is 4.4 mm clear of her legs and the hand is fully in frame. The kneecap itself sits too low in
  CAM_HB's frame: a hand on it is cut by the bottom edge.
- Also ENGINE PROPORTIONS (reported, NOT changed). humanMesh.js maps the mesh hand bone rigidly with sH = Lh / mesh
  hand length, then puts each finger's first bone on the SOLVER's knuckle (engine/hand.js HAND_GEOM.mcp). In hand
  lengths, the jade19 mesh's own knuckles (index, middle, ring, little; across, along) are (0.141, 0.557), (0, 0.552),
  (-0.104, 0.522), (-0.202, 0.470). The solver's are (0.155, 0.500), (0.050, 0.515), (-0.050, 0.500), (-0.142, 0.462).
  So at 187 mm the fingers start 2.6 / 9.4 / 10.1 / 11.2 mm toward the thumb and 10.7 / 6.9 / 4.1 / 1.5 mm toward
  the wrist from where the palm skin expects them. The knuckle span (index to little centres) is 0.354 on the mesh and
  0.299 in the solver. The palm's little-finger edge sticks out past the little finger, and the palm is about 6.5 %
  too long for where the fingers begin: the knuckle-centroid fit gives scale 1.009, against 1.075 for sH.
  The thumb is worse. The solver's CMC is at along 0.085 and the mesh's thumb_01 head at 0.200, so the mesh thumb
  metacarpal is stretched x1.5 (0.25 / 0.167) and its two phalanges shrunk x0.77 / x0.72. That gives the stubby
  thumb. The fingers' segments are re-proportioned the same way: index proximal x1.42, distal x0.66.
  The same holds for every body (adult_f, adult_m, jade27 measure the same), so it affects every set.
  Proposed change (experiment in a scratch copy only): fit the hand bone onto the solver knuckle row. Rotate it so
  wrist-to-knuckle-centroid and the index-to-little line match, and scale it uniformly by the centroid distance
  ("fit B"). Fingertips and the solver are untouched, so grips and contacts do not move. The palm becomes about 6 %
  shorter and the knuckle row reads cleaner. A further option narrows the palm to the solver's span (x0.91 across), but
  it reads too slim for her large hands. The thumb would need its own fix (solver CMC / tlen vs the mesh thumb bones).
  Before/after: scratchpad resthand_compare.jpg, rows 2-3.
- Checks: clipcheck H3b / H2b pass (grip 2.6 mm, joints in range, no body vs body). The render's wrist notes are about
  the R hands (unchanged from v2).

## 2026-11-27 (later): hand marks, engine-wide (H3b/H2b "his under-hand looks like an amputee"; her R hand misread)
Jade: the guide pose is right, but its shading is too subtle for the painter. Pose NOT changed (no HBX / COVER / CAM_HB
edits). Engine change in layout/engine/humanMesh.js (HANDMARK) + render.js (feat pass), for every mesh figure, kids too:
- Nails on the back of every distal phalanx (fingers and thumb): about the distal half, ~108 deg of the circumference,
  curved cuticle. A separate region cut exactly through the triangles (geometry unchanged), lighter / pinker, with an
  outline in form, contour and line. The MakeHuman GLBs have no UVs or nail geometry, so the mask comes from the rest
  bone frames. Palmar direction per finger = rest bend + palm normal; the thumb uses its IP bend only (metacarpal ->
  distal put the nail on the thumb's side).
- Creases at the real joints only: DIP, PIP and finger-base on the palm side; short knuckle wrinkles on the back of the
  PIP / DIP; the thumb's IP. None on the palm or in the thumb web.
- Palm / finger pads a little lighter and warmer than the back (vertex colours, x1.075/1.035/1.0 vs x0.965/0.955/0.95),
  faded out toward the wrist.
- Form: hands shade with more contrast (faded in past the wrist, so there is no tone step at the wrist), deeper
  occlusion where hands overlap, and bolder outlines where a hand meets something nearer. Form, contour and line: a line
  where two fingers of one hand touch on screen (finger channels; never at a finger's base).
- Thumb web (Jade: "weird wrinkle texture" in lit): LBS folded the web skin into a crease and a speckled self-overlap
  line. After baking, the web vertices are Taubin-smoothed (10 passes). This moves the web by a few mm, engine-wide.
- Opt-out for comparisons: render.mjs --handmark 0; PROOF_HANDMARK=0 for clipcheck. Debug: --handmark web (smoothing
  mask in red, lit), --modes feat (finger channels).
- Checks: clipcheck H3b / H2b pass, grip skin 0.2 mm (was 1.5: the web smoothing; still touching), no body vs body.
  holdcheck pass both, contact -0.8 / thumb2 0.8 mm (was -1.4 / 1.4). closet02 clipcheck is unchanged by this (its FAILs,
  hanging clothes and body vs body, are pre-existing: identical with PROOF_HANDMARK=0).
- Re-rendered guide_hb/{H3b,H2b}_guide_{form,contour,lit}.png (3072x1728). New: guide_hb/{H3b,H2b}_hold_zoom_{form,contour}.png,
  a 2x close-up of the hold (rendered at 6144x3456 and cropped, not upscaled), to give the painter as an extra reference.
- What reads now: his under-hand shows pads with DIP/PIP creases (palm up), separate fingers, and the nail edge only at
  the tips (nails on the far side); her thumb nail and knuckle wrinkles show the back of her hand; her fingers are
  separated. Still: his palm is mostly hidden under hers, and in H2b his left wrist is behind the covering arm (as before).
  Sheets: scratchpad hold_handmarks_before_after.jpg, closet_CL_hands_handmarks.png.

## 2026-11-27 (v4): his LEFT hand solo-lit, thumb web relaxed further
Jade, after the 6-take paint test on the hand-mark guides: her hand now reads in every take, but his under-hand is still an
"amputee" in all six ("his entire hand is in the shadow of hers"). Also: "the weird angle in H3b_xC1 and xC2 is from the
weird shape in the contour lines" (her thumb web). Pose unchanged; hand marks kept.
- h3bFigs (so H2b too): firstLove19.soloLight = ['L'] (new engine flag, humanMesh / render.js). His left hand receives no
  cast shadow (lit / flat), so her hand and arm no longer darken it. In form, only his own fingers occlude it (other meshes
  are ignored in its occlusion), and it is shaded by an overhead WORLD-space key: lit finger tops, dark undersides, dark
  gaps between the fingers. Her hand is untouched and still in place: Jade's take-her-hand-away idea, done per mesh with no
  composite.
- Thumb web: engine smoothing now 30 Taubin passes (was 10), with the palm side of the web half held (webPalmKeep 0.5) so
  that what rests on things stays put. The fold spur at her web's apex (a short line running past the V in contour) and the
  kink in her palm edge are gone. With 30 passes and no palm hold, H3b's grip opened to a 1.5 mm gap; now it is in contact.
  Comparison renders: render.mjs --websmooth N.
- Remaining: seen from CAM_HB, her thumb lies close along her index, so the web still reads as a V notch (a narrower,
  smoother V). Opening it into a U needs a little more thumb abduction, which changes her approved hand (Jade's call).
  His palm is still mostly under hers, and his thumb is hidden.
- Checks: clipcheck H3b / H2b pass, grip skin 1.1 mm (v3 1.5), no body vs body. holdcheck pass, contact -1.1 / thumb2
  1.1 mm.
- Re-rendered guide_hb/{H3b,H2b}_guide_{form,contour,lit}.png, {H3b,H2b}_hold_zoom_{form,contour}.png and the new
  {H3b,H2b}_hold_zoom_pair.png (form | contour, 3020x1000, one ref). Sheet: scratchpad hold_sololight_before_after.jpg.

## 2026-11-27 (v5 TRIAL, not in guide_hb): palm skin texture on his LEFT hand
Jade: every round-2 take still paints his under-hand stubby. Her idea: "paint the palm of his hand with the texture of the
real palm of a hand ... the way that you can tell a brick wall is receding when there's a brick pattern". Engine feature,
opt-in per hand: figure spec skinTex ['L' | 'R'] (humanMesh skinTexU + render.js SKINTEX_GLSL). It is procedural, with no
image and nothing to license. It is evaluated per fragment in REST space (attributes aRest / aRestN), so it rides on the
skin like a texture and foreshortens round the curled fingers. Palm side only, palm and finger pads:
- Palm: the distal (heart), proximal (head) and thenar (life) creases, as curves in the rest palm frame. They are
  calibrated on a flat open-palm debug view (shot dbg_palmtex) against look-only Wikimedia Commons palm photos, kept in
  the scratchpad (palmrefs/), never committed or sent to a model. A fine reticulated skin network covers the palm.
- Fingers: the second line of the doubled PIP and finger-base creases, fine irregular transverse lines across the pads,
  and ridge whorls on the fingertip pads. Patterns finer than ~3 px fade out instead of aliasing.
- Form: tone. Lit: the Lambert diffuse colour multiplied by the same pattern. Contour / line: only the major creases (palm
  creases and joint creases), as lines.
- Trial shots H3b_guide_tex / H2b_guide_tex (= H3b/H2b + skinTex ['L']). The accepted H3b_guide / H2b_guide are
  unchanged. Pose, hand marks, solo light and checks unchanged (clipcheck _tex pass, grip 1.1 mm).
- Renders in the scratchpad only (palmtex/guide3072, palmtex/*_tex_hold_zoom_pair.png). Sheet: scratchpad
  palm_texture_trial_zoom.jpg; close-up palm_texture_trial_closeup.png.
- Read: at the zoom scale the pads read as palm-side skin (whorls, crease rings, lines bunching as the fingers curl). At
  full-guide scale (3072) the fine pattern mostly fades and the creases remain. Most of his palm is still under her hand.

## 2026-11-27 PAINT-BACK (Jade: paint his normal hand alone, project it into the model, put her hand on top)
- Engine: engine/paint.js + figure spec `paint: { url, hands: ['L'], limbs: { armL: 1 } }`. Projective texture mapping
  from the shot camera (the camera the painting was painted from): form and lit show the painted colour on that figure's
  listed hands and on the skin / sleeve selected by per-vertex limb weights. Painted pixels draw only their outline (no
  3D creases, nails or finger lines over the painting) and take no extra occlusion. The paintings are served from
  layout/assets/paint/fl_hands/. hideParts gains 'all' (the whole figure).
- Shots (separate ids; accepted guides untouched): CAM_P = the ov88c overhead tightened (camAt([-0.145,0.27,0.06], -40, 88,
  0.42, 35)); socks on both (her oatmeal 0xc9c2b6, his charcoal 0x3a3c42); no skinTex; hand marks, solo light and pose
  kept. P0_H3b / P0_H2b (nothing painted), P1_his (her hidden), P2_H3b (stage-1 painting on his L hand + arm), P4_H2b
  (the H3b painting on his L and her R hand + arm; his covering R hand in 3D).
- Guides: cast/first_love/_prompts/v10/guide_pb/; takes in takes_pb/. Stage 1 prompt P1.txt (2 Codex takes).
- Stage 1 (14:10): P1_his_1 / _2 both paint a normal, whole palm-up hand with five digits and three-segment fingers that
  fits the guide's contour almost line for line (contour overlay). Picked _2 (thumb closest to the guide), copied to
  layout/assets/paint/fl_hands/P1_his_best.png. Sheet: scratchpad paintback_stage1.jpg.
- Stage 2: P2_H3b renders his painted hand, forearm and sleeve under her clean 3D hand (guide_pb/P2_H3b_*). Stage 3
  prompt P3.txt (refs: P2 form, contour, D_t4, P2 lit, P1_his_2), 2 Codex takes.
- Stage 3 (14:25): P3_H3b_1 / _2 (refs: P2 form + contour, D_t4, P2 lit, P1_his_2). Both keep his projected hand: his
  under-hand fingers are now real fingers (pads, three segments, normal length) under her painted hand. Picked _1 (her
  thumb crisper), copied to layout/assets/paint/fl_hands/P3_H3b_best.png. Sheet: scratchpad paintback_stage2_3.jpg.
- Stage 4: P4_H2b projects P3_H3b_1 onto his L hand + arm and her R hand + arm; his covering R hand stays 3D. Prompt
  P4.txt (from H2c.txt: overhead, socks, "already painted"); refs P4 form, contour, D_t4, P3_H3b_1, P4 lit. 2 takes.
- Stage 4 (14:35): P4_H2b_1 / _2 both keep the projected under-hand and her hand and paint his covering right hand well
  (five digits, thumb on the correct side, hairy forearm from the lower left, her three fingertips peeking out). Picked
  _1. Sheet: scratchpad paintback_stage4.jpg.
- Lessons: (1) A painter draws a normal hand when the hand is alone and unoccluded in an overhead guide; the stage-1
  paintings fit the 3D contour almost line for line. (2) Projecting that painting back from the same camera turns the
  occluded hand into a "finished" region that later painters copy rather than reinvent; the stump problem disappears.
  (3) Building it up one painted layer at a time (his hand, then hers, then his covering hand) works where a single
  guide with stacked clay hands did not. (4) Socks removed the foot failures at no cost. (5) The palm texture was
  counterproductive (read as extra finger segments). Limits: the projection is only valid from the same camera (a new
  camera needs a new stage 1); unlit painted pixels sit oddly in the dark lit pass; a painted hand is no longer
  guaranteed to match the 3D contact exactly.

## 2026-11-27 PAINT-BACK v2 (Jade: "a weird horn from an artifact in the stage 1 guide form"; "the fleshy part of the palm near the thumb should also be smoother")
- Cause: his left thumb (HBX.himL thumb sweep 14, abd 2: flat along the index, tip tucked) seen from overhead continued the
  hand's radial edge in one tapering curve, with the nail outline at its end: a horn. Its base folded the web / thenar skin
  into a notch with a spike in the contour, and the thenar mound shaded in facets. It was the pose (not the thumb fit or
  the nail mask), made worse by LBS folding. Look-only refs (scratchpad palmrefs/): a relaxed palm-up thumb falls away
  from the index, pad up, with a soft thenar mound.
- Fix: PB_THUMB = { opp: 0, sweep: 42, abd: -10, mcp: 4, ip: 10 } in the P* shots only (ovFigs). The thumb falls clear of
  the index and the horn and spike are gone. abd >= 0 pushed the thumb 4-15 mm into her hand (clipcheck); -10 gives grip
  1.1 mm, pass. Engine: HANDMARK.thenarSmooth 60, Taubin smoothing of the thenar normals only (no vertex moves), so the
  ball of the thumb shades as one mound. Accepted H3b / H2b guides keep HBX.
- v1 guides / picks kept in scratchpad paintback/v1guides, P*_best_v1.png. Re-running stages 1, 3, 4.
- v2 stage 1: P1_his_3 / _4 both paint a normal relaxed thumb (no horn) and five whole digits, on the contour. Picked _3.
  Stage 3: P3_H3b_3 matches the guide; his four under-fingers are whole (pads, segments, normal length). _4 drifted
  (framing shifted, invented her left hand). Picked _3. Stage 4 running (P4_H2b_3/_4).
- v2 stage 4: P4_H2b_4 picked. His covering right hand follows the contour (five digits, thumb on the correct side), and
  the under-hand and her hand carry over from H3b. _3 drew the covering hand short and off the contour, merging with
  her fingers. Known guide flaw: in P4 her right hand sits ~12 deg differently from H3b (the natural-wrist pass), so the
  projected H3b painting leaves a faint ghost of her thumb edge on his under-hand area in form. The painters ignored it.
  Sheets: scratchpad paintback2_stage1.jpg (with thumb / thenar before-after), paintback2_stage2_3.jpg,
  paintback2_stage4.jpg. Picks: P1_his_3, P3_H3b_3, P4_H2b_4.

## 2026-11-27 v3 GESTURE (start + end frame for a video model)
Jade: "her hand should overlap his at an angle when it comes into contact"; "her fingers would overlap his fingers, and he
would gently rotate his wrist inward slightly as he closes his hand around hers and then puts the other hand on top";
"soft things slightly depress". Look-only refs in scratchpad holdrefs/ (Openverse: a hand laid across an upturned hand;
a groom's two hands round a bride's hand), never committed or sent to a model.
- START (S0_H3b / S2_H3b, CAM_P): her right hand comes down across his open hand at an angle, her fingers lying over
  his fingers (V3.her: palm [-0.148, 0.324, -0.052], fingers [0.27, -0.15, 0.962]); his hand unchanged, so the
  v2 stage-1 painting P1_his_3 is projected again. From the camera her fingers cross his at ~50-60 deg from antiparallel.
  Soft contact: clipcheck reports grip skin 3.4 mm (her fingertips pressing into his finger pads), just over the 3 mm
  hard tolerance; accepted as the soft press Jade asked for (heights 0.318-0.329 swept: 0.325 gave a 2.3 mm gap, below
  0.318 6-12 mm).
- Guides cast/first_love/_prompts/v10/guide_v3/, takes takes_v3/, prompt S3.txt. 2 Codex takes.
- START painted: S3_H3b_1 / _2 both follow the contour (her hand across his fingers at an angle, his open hand intact).
  Picked _1.
- END pose (V3.end in shots.js): her palm at [-0.145, 0.322, 0.085] (in his palm), fingers [0.27, 0, 0.962] (the START
  heading), thumb lying flat (opp 0, sweep 40). His left hand at the same place, palm normal turned 12 deg toward his
  right (pronation: [0.718, 0.676, 0.167]), fingers curled (index 34/48/26 .. little 46/60/32), thumb PB_THUMB. With her
  arm from the right crossing his hand, his curled fingers come up round the radial (index / thumb) edge of her hand,
  not her little-finger edge: that is where his fingertips reach at this crossing angle. Soft contact: grip 3.8 mm
  (his finger pads pressing into the side of her hand), body vs body 0.8 mm. Tolerance noted, not engine-changed.
  The grasp tag is 'palmUnder' ('power' made the checker treat the hand differently).
- END stage 1 (E1_his) prompt E1.txt; refs E1 form, contour, D_t4, lit, P1_his_3 (the open hand, for identity).
- END stage 1: E1_his_1 / _2 both paint a whole, closing palm-up hand on the contour (four curled fingertips, thumb). Picked _1. Projected -> E2_H2; stage 3 prompt E3.txt, 2 takes.
- END stage 3: E3_H2_1 follows the contour (three of his curled fingertips show under her thumb, her hand in his at the START angle); _2 drifted (her hand smaller and shifted). Picked _1 -> projected on his L + her R (E4_H2), his covering right hand 3D (V3.cover = COVER with up 0.043; grip 3.8 mm soft). Stage 4 prompt E5.txt, 2 takes.
- END stage 4: E5_H2_1 / _2 both paint his covering right hand with five digits from the lower left. Both drift from the
  3D contour (the covering hand sits a little lower and further left than the guide's), but read correctly. Picked _1.
- Picks: START S3_H3b_1; END E1_his_1 -> E3_H2_1 -> E5_H2_1. Sheets (scratchpad): v3_start.jpg, v3_end_stage1.jpg,
  v3_end_stage2_3.jpg, v3_end_stage4.jpg, v3_start_end_pair.jpg. The pictures being projected are in
  layout/assets/paint/fl_hands/ (S3_H3b_best, E1_his_best, E3_H2_best); v2 files untouched.
- Weak spots: her hand moves ~4 cm between START (across his fingers) and END (in his palm), so the video model must
  slide it; his fingers close round her radial (thumb) edge, not her little-finger edge (the crossing angle puts his
  fingertips there); his fourth fingertip is hidden in END; the covering hand drifted from the contour; soft contacts
  run at 3.4-3.8 mm (over clipcheck's 3 mm hard limit, deliberately).

## 2026-11-27 v4 SWING HOOK (Jade: "his lower hand should fold around hers, and her hand should bend at the fingers (gesture similar to what's seen in lindy hop or swing dance is the mid-state). and then his other hand covers on top of both")
- Look-only refs: scratchpad swingrefs/ (Openverse lindy / swing; the hands are small in all of them, so the hook was
  posed from the known lead-palm-up / follow-fingers-hooked connection and checked in side debug views).
- MID (M0_H, V4 in shots.js): her right hand at START's heading (fingers [0.27, -0.15, 0.962]), palm moved forward and up
  to [-0.137, 0.352, -0.014] (START [-0.148, 0.324, -0.052]: 4.8 cm), fingers curled 30/48/26 .. 36/56/30 so they hook
  down over his; his fingers fold up 30/44/24 .. 42/56/30, wrist pronated 12 deg (as v3 END). Side views show the
  fingers interlocked at the joints. Soft contact: grip 3.9 mm (her fingertips pressing his finger pads).
- END (N0_H): MID + his right hand over both (COVER in her MID hand frame, up 0.05, along 0.035, across 0.035). The
  grip number is dominated by the left-hand hook, so the covering hand's contact was set by eye from overhead.
- Stage 1 M1_his (prompt M1.txt), 2 takes; guides cast/.../v10/guide_v4, takes takes_v4.
- MID stage 1: M1_his_1 / _2 both whole folding hands on the contour; picked _1 (crisper finger curl). Projected -> M2_H; prompt M3.txt, 2 takes.
- MID stage 3: M3_H_1 / _2 both paint the hook (her bent fingers in his folded ones) on the contour; picked _1 (closest to the contour, joints clearest). Projected on both -> N4_H; prompt N5.txt, 2 takes.
- END stage 4: N5_H_1 / _2 both paint his covering right hand (five digits, hairy forearm from the lower left) over the
  joined hands; both sit a little smaller and lower-left than the 3D contour. Picked _2 (fingers and thumb clearest).
  Weak spot: as in the guide, his covering hand hides the hook entirely (only two of his left fingertips show); if Jade
  wants the hook visible in END, move V4.cover back toward her wrist (along < 0).
- Travel of her hand (palm centre target): START -> MID 4.8 cm (1.1 right, 2.8 up, 3.8 toward him); MID -> END 0.
- Picks: MID M1_his_1 -> M3_H_1; END N5_H_2. Sheets (scratchpad): v4_mid_stage1.jpg, v4_mid_stage2_3.jpg,
  v4_end_stage4.jpg, v4_start_mid_end_strip.jpg. v3 untouched.

## 2026-11-27 v5 CLASP (Jade: "the swing hook should actually have positioning that's a little bit like this, except the young wrist not being bent as much ... his other hand forms a sandwich on top")
- Reference (look-only, scratchpad clasp_ref/prev.jpg, never sent to a model): a mutual finger clasp seen from the side.
  The hands meet fingers to fingers, overlapping from the knuckles out, not palm on palm; the upper hand's fingers curl
  down round the lower hand's fingers; the lower hand's fingers run under them, gently curled up.
- MID (C0_H, V5): his hand = the lower hand (palm up, fingers softly curled 12/20/10 .. 18/26/14, wrist as START: no
  extra cocking); her right hand = the upper hand, at START's heading, palm [-0.11, 0.333, -0.021] (START
  [-0.148, 0.324, -0.052]: 5.0 cm, mostly toward his little-finger edge and toward him), fingers curled 36/58/34 ..
  42/64/38 down round his. The side debug view (dbg_C0_a) matches the reference. Grip 2.4 mm soft press, clipcheck pass.
- END (D0_H): + his right hand over both (V5.cover up 0.05, along 0.02, across 0.035), a sandwich; his lower fingers
  barely show (Jade: fine).
- Camera unchanged (CAM_P): the clasp reads from overhead as her curled fingers over his, so START is kept.
- Stage 1 C1_his (C1.txt). Guides guide_v5, takes takes_v5.
- v5 stage 1: C1_his_2 matches the contour (soft curl); _1 over-curled the fingers off the contour. Picked _2. Projected -> C2_H; C3.txt, 2 takes.
- 2026-11-27 v5 STOPPED (Jade approved a video clip that lands in the clasp she wanted: media/gen/hold_AB_1_*.mp4; the
  middle frame is now its last frame, media/gen/hold_refs/ab1_last.jpg). State: stage 1 picked (C1_his_2, projected);
  stage 3 painted C3_H_1 / _2, not picked (_1 drifted: her hand moved up and shrank off the contour; _2 followed the
  contour). Stage 4 (D0_H / D4_H sandwich) never painted. No new takes. Shots C*/D* and V5 left in shots.js; v4 untouched.
