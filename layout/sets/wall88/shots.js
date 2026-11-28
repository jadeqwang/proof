// INSIDE THE WALL, 1988 camera table ("Proof", chorus 1, 1:37.4-1:54.5, into the tail at 1:54.5; -2sm master, retimed 2026-11-25).
// r3 (Jade's r2 review, 2026-11-25): she STANDS, her back against the side wall (the brick), facing the boards, and is
// slowly turning her head to look through the blade of light; WL_in shows the single file of restaurant workers along
// the brick (they blink in and out) and then the empty cavity (WL_in_empty, the frame the Voyager pull-back starts from).
// Two camera positions: outside (down the cavity toward -z, at her face) and inside (along the file, toward +z).
// No header and no gold field note in this scene. Fields as attic88_day/shots.js.
// Set points usable as targets: mote, eye, crack, bladeMid. Every shot has a twin `beam_<id>` (flat mode = beam mask).
import { STAND, EYE, WORKERS, CAVITY, bladeY } from './layout.js';
// r4 (2026-11-26): cavity 32 cm (coffin-like), Mama nearest in the file then the praying lady, her look = WL_eye_v1
// (head near-frontal to the outside camera, eyes to picture right toward Mama beside her: target 'toMama'), longer lenses.

// r2 pose (seated, knees up), superseded by jadeStand; kept for reference
const jadeStill = (o = {}) => ({ at: [0.0, -0.45], yaw: 0, legs: 'knees', spine: { bend: 8 }, head: { look: [0, EYE[1], 1.0] },
  L: { to: 'self:kneeL', off: [0.0, 0.05, 0.0], hand: 'relax', palm: 'down' }, R: { to: 'self:kneeR', off: [0.0, 0.05, 0.0], hand: 'relax', palm: 'down' }, ...o });

// r3: standing, back flat to the brick, facing the boards; head turned STAND.turn deg toward her left (+z, the camera),
// mid-way through turning back toward the crack. Both palms flat back against the brick beside her hips.
// r4b: the palm centre PALM_OFF off the brick face (was 8 mm: on the mesh body that put the palm 13-21 mm INTO the brick;
// clipcheck touch: palm skin on the brick, 0-1 mm)
const PALM_OFF = 0.022, BRICK_X = CAVITY.x1 - PALM_OFF;
const palmsToBrick = (z, y, dz, off = PALM_OFF) => ({
  L: { to: [CAVITY.x1 - off, y, z + dz], hand: 'flat', palm: [1, 0, 0], fingers: 'down' },
  R: { to: [CAVITY.x1 - off, y, z - dz], hand: 'flat', palm: [1, 0, 0], fingers: 'down' } });
// r4: head.look 'toMama' (layout.js FILE_LOOK: Mama beside her in the file): the head turns most of the way toward the
// outside cameras (near-frontal to them), the eyes take the rest, to picture right; the same pose in WL_out and WL_eye so the face reads at one plain angle in both.
// r4b: standing figures are lifted SOLE_LIFT: the baked mesh feet sit ~13 mm under the engine's ankle-height floor
// (engine/clipcheck.mjs measured 12-16 mm into the floor for every standing body); pelvis y given explicitly
const SOLE_LIFT = 0.0155, ADULT_HIP = 0.52, CHILD5_HIP = 0.46;
const standAt = (x, z, h, k = ADULT_HIP) => [x, +(k * h + SOLE_LIFT).toFixed(4), z];
const jadeStand = (o = {}) => ({ at: standAt(STAND.at[0], STAND.at[1], 1.08, CHILD5_HIP), yaw: STAND.yaw, legs: 'stand', head: { look: 'toMama', turn: STAND.turn, nod: 2 },
  ...palmsToBrick(STAND.at[1], 0.52, 0.13), ...o });

// the workers: backs to the brick, facing the boards (-x), holding their breath (see layout.js WORKERS)
// r4b: pelvis 13.5 cm off the brick (was 10.5): measured on the mesh bodies (clipcheck), the backs of the clothes stood
// 2-3 cm INSIDE the brick at 10.5; at 13.5 the back of the clothes is ~1 mm off the brick and the toes ~6 mm short of the boards
const W_X = CAVITY.x1 - 0.122;   // 2026-11-27: was x1 - 0.135 (1.3 cm nearer the brick for the real-size feet)
// 2026-11-27: real-size feet (engine) reached 6-10 mm into the boards: toes turned out 25 deg (the natural stance in a tight space) and the file 1.3 cm back
const SPLAY = { footL: [0.47, 0, 1], footR: [0.47, 0, 1] };
function worker(w) {
  const base = { at: standAt(W_X, w.z, w.h), yaw: -90, legs: 'stand', legOpts: SPLAY };
  switch (w.pose) {
    case 'mouth': return { ...base, head: { nod: 4, turn: 12 }, R: { to: 'self:mouth', off: [-0.028, -0.01, 0], hand: 'flat', palm: 'back', fingers: 'left', elbow: 'down' },
      L: { to: 'self:hipL', off: [-0.075, -0.07, -0.02], hand: 'fist', palm: 'in', fingers: 'down' } };   // r4b: fist against the front of his thigh (hanging at his side it stood 3.8 cm into w3)
    // (hold pass 2026-11-26) the clasp holds no object: each hand curls loosely round the other ('relax', was 'grip', which
    // the hold check reads as gripping something and found nothing within 3 cm)
    case 'clasp': return { ...base, head: { nod: 22 }, L: { to: 'self:waist', off: [-0.085, 0.0, 0.0], hand: 'relax', palm: 'in', fingers: 'down', elbow: 'down' },
      R: { to: 'self:waist', off: [-0.10, 0.02, 0.0], hand: 'relax', palm: 'in', fingers: 'down', elbow: 'down' } };   // r4b: hands 5 cm nearer her waist, elbows hanging down at her sides (were 1 cm into the boards and 3.8 cm into w2)
    // r5 (Jade's fix list: "a stray hand by Mama's ear at the stud" in WL_in): it was THIS woman (w1, second in the file):
    // from the inside camera the only part of her not hidden by Mama or the stud is a 3-4 cm slit in front of Mama's
    // throat, and her undrawn cheek, ear and the fingertips of her praying hands (palms together under the chin) filled it,
    // reading as a disembodied hand. Now: palms together lower, at her breastbone, elbows down at her sides; head pressed
    // back toward the brick (nod -14) and turned toward her right (-60, toward the closed end and the light). Measured
    // (flat-pass difference with and without her): her visible area 10.9k -> 3.2k px, the slit now shows w2's dark hair
    // beyond her; a sliver of her chin under Mama's hair and a ~10 px speck of fingertip at the stud edge remain. Clip check
    // pass (no hands in the boards, elbows clear of Mama's left arm). Was: nod 20, hands at off [-0.07, -0.07].
    case 'pray': return { ...base, head: { nod: -14, turn: -60 }, L: { to: 'self:chin', off: [-0.055, -0.16, 0.012], hand: 'flat', palm: 'in', fingers: 'up', elbow: 'down' },
      R: { to: 'self:chin', off: [-0.055, -0.16, -0.012], hand: 'flat', palm: 'in', fingers: 'up', elbow: 'down' } };
    case 'flat': return { ...base, head: { nod: -8 }, ...palmsToBrick(w.z, 0.80, 0.13, 0.030) };   // r4b: hands 7 cm nearer his hips (his elbows were in w3)
    // r4 Mama: right palm flat back on the brick toward the closed end (between the file and her daughter), left hand
    // flat on the brick beside her hip; head turned back toward where her daughter stands (named point 'daughter')
    case 'shield': return mamaShield(MAMA_P);
    default: throw new Error('pose ' + w.pose);
  }
}
// r4b (Jade: "her arm is in an impossible position, her palm can be on the brick but needs to be in a way that physically
// makes sense"; r4 had her right palm flat on the brick BEHIND her hip, 22 cm toward the closed end, fingers down, which
// needs the arm drawn back past the body). Now: both palms flat on the brick the way a body pressed back against a wall
// puts them: the right arm out from her side toward the closed end, where her daughter is (palm 40 cm along the wall from
// her pelvis, 22 cm beyond her shoulder, at hip height 0.82 m, fingers pointing down and toward her daughter, elbow
// slightly bent), the left palm just behind her left hip; her head turned back toward her daughter.
// Solved with the engine's IK and checked with Rapier on the baked mesh body (wl_search.mjs, engine/clipcheck.mjs): see
// NOTES. p: palm centre offsets from the brick face (rx, lx, m), heights (ry, ly), along the wall from her pelvis (rz, lz),
// the right fingers' rise (rfy), head turn, spine side bend.
export const MAMA_Z = 0.405;
export const mamaShield = (p) => ({ at: standAt(W_X, MAMA_Z, 1.60), yaw: -90, legs: 'stand', legOpts: SPLAY, spine: { side: p.side || 0 }, head: { look: 'daughter', turn: p.turn || 0 },
  R: { to: [+(CAVITY.x1 - p.rx).toFixed(4), p.ry, +(MAMA_Z + p.rz).toFixed(4)], hand: 'flat', palm: [1, 0, 0], fingers: [0, p.rfy, -1] },
  L: { to: [+(CAVITY.x1 - p.lx).toFixed(4), p.ly, +(MAMA_Z + p.lz).toFixed(4)], hand: 'flat', palm: [1, 0, 0], fingers: 'down' } });
// solved: wl_search.mjs run 2 (60 candidates round a hand-reasoned seed); palms 0.5-0.6 mm off the brick, flat to 1 deg, no
// penetration, every joint in range (NOTES.md)
const MAMA_P = { rz: -0.40, ry: 0.824, rx: 0.028, rfy: -1.497, lz: 0.169, ly: 0.755, lx: 0.028, turn: -0.84, side: 0.13 };
export const WORKER_FIGS = Object.fromEntries(WORKERS.map((w) => [w.key, worker(w)]));

// inside camera: down the cavity from the closed end, near the boards, 2 cm above the sheet of light. The rhyme needs
// the camera at the sheet; the sheet is at her eye where she stands against the brick, and rises toward the boards, so
// this is her eye-line moved out of the file to the boards side and lifted to the sheet there. Level, along the file.
// r4: 35 mm (was 28: the wide lens opened the cavity up and the painter widened it further), 10 cm further back,
// 7.5 cm off the boards (just clear of the studs' faces, so no stud stands across the frame), tilted up 4 deg so Mama's face (nearest, 1.1 m) stays in frame.
const IN_X = CAVITY.x0 + 0.075, IN_Y = +(bladeY(IN_X) + 0.02).toFixed(3);
export const IN_CAM = { lens: 35, pos: [IN_X, IN_Y, -0.70], target: [0.06, IN_Y + 0.22, 2.6] };

// r4b: contacts the clip check (engine/clipcheck.mjs) measures: palm skin on the brick
const CLIP_KID = { touch: [['littleJade.handL', 'outer wall (brick)'], ['littleJade.handR', 'outer wall (brick)']] };
const CLIP_FILE = { touch: [['mama.handR', 'outer wall (brick)'], ['mama.handL', 'outer wall (brick)'], ['w4.handL', 'outer wall (brick)'], ['w4.handR', 'outer wall (brick)']] };
const BASE = [
  // r4b: az -3 (was -5): she stands 2.2 cm nearer the boards and the studs moved to 50 cm centres, so at -5 the stud at z 1.155
  // stood 18 cm in front of the lens across her face
  { id: 'WL_out', lens: 50, orbit: { at: 'littleJade:eyes', az: -3, el: 0, dist: 1.6 }, aim: ['littleJade:eyes', 0.6, 0.3], focus: ['littleJade'], position: 'outside', time: '1:37.4-1:45.5 and 1:45.5-1:51.0', section: 'Chorus 1 ("Inside?" / "My voice goes blind")', beamAnchor: 'eye',
    header: '1:37.4 OUTSIDE: down the cavity, level, locked off; she stands, back to the brick, turning into the blade',
    intent: 'r3. The outside position, inside the wall. Down the length of the cavity: boards and the crack frame-left, brick frame-right. She stands with her back flat against the brick, palms on it, facing the boards; her head is turned toward us and slowly turns back toward the crack, and as it turns the thin sheet of light from the crack comes onto her eye. "Inside?" is this frame with the light off (dark). "My voice goes blind": her mouth opens just under the light, and closes. Inside she is scared (heart fast); her face does not know how to show it.',
    figs: { littleJade: jadeStand() }, clip: CLIP_KID },
  { id: 'WL_eye', lens: 85, orbit: { at: 'littleJade:eyes', az: -12, el: 0, dist: 0.62 }, aim: ['littleJade:eyes', 0.5, 0.45], focus: ['littleJade'], position: 'outside', time: '1:40.7-1:45.5', section: 'Chorus 1 ("I honestly don\'t know")', beamAnchor: 'eye',
    header: '1:40.7 OUTSIDE, close: same staging; her eye turning into the blade',
    intent: 'r3. Same staging as WL_out, pushed in to her face, three-quarters, turning toward the crack. The blade crosses one eye and the bridge of the nose. She is scared inside, her heart is fast, but her face does not fully know how to recognise it or show it: still, uncertain, not a clear expression of fear.',
    figs: { littleJade: jadeStand() }, clip: CLIP_KID },
  { id: 'WL_in', ...IN_CAM, position: 'inside', time: '1:52.2-1:54.5 (they blink in and out; r5: after WL_top 1:51.0-1:52.2)', section: 'Chorus 1 ("Nowhere to go") into Tail 1', beamAnchor: 'mote', workers: true,
    header: '1:52.2 INSIDE, state A: the file of restaurant workers along the brick, holding their breath',
    intent: 'r3 (Jade): they blink in and out. A single file of Chinese restaurant workers, backs to the brick (frame-left), facing the boards (frame-right), holding their breath, terrified, some praying silently. They blink in and out of existence and then it is the empty wall space again (WL_in_empty). The blade (from the bare bulb in the back room beyond the boards, through the crack, falling right to left) crosses Mama and the praying woman low, at the waist; the three beyond them stand in the dark. Faces unreached (strangers): fear and prayer are in hands, shoulders and bowed heads.',
    figs: WORKER_FIGS, clip: CLIP_FILE },
  { id: 'WL_in_empty', ...IN_CAM, position: 'inside', time: '1:52.2-1:54.5, end state; start of the 1:54.5 pull-back', section: 'Chorus 1 ("Nowhere to go") into Tail 1', beamAnchor: 'mote',
    header: '1:52.2 INSIDE, state B / RHYME FRAME: the same cavity, empty; the blade is the diagonal',
    intent: 'r3; light source 2026-11-28 (Jade: "the light shaft is going the wrong way, it needs to follow physics. put a light source outside of the wall"). The same camera as WL_in with nobody there: the empty wall space. The light comes from a bare bulb hanging high in the back room beyond the boards (outside the wall, behind the camera and to the right): through the crack, a bright slit on the boards frame-right, it falls DOWN and away from us, upper right to lower left at 40 degrees, and lands low on the brick (frame bottom left, about 27 cm below the crack, receding down the cavity) and on the near face of the stud beside the crack. Nothing above the crack\'s height is lit. The pull-back to the Voyager frame starts here: the blade becomes the band, the mote the dot.',
    figs: {} },
];
// post-sweep 2026-11-26 (painter guides too dark: WL_plan lit mean 14.8, WL_top 16.0 of 255): the overheads' lit pass gets a
// stronger blade and cool fill (the darkness outside the cavity stays black, as built); the blade stays the brightest thing
const TOP_LIFT = { key: 7, amb: 2.3 };
const PLAN_LIFT = { amb: 2.4, bg: 0x2a2b2f };   // WL_plan is a reference (not painted): a grey void so the plan reads; blade unchanged
// WL_top, the overhead (r4b alternate, made a REAL SHOT in r5: Jade, wl_top: "Try it at 1:51.0-1:52.2"). Straight down into
// the cavity onto the five heads in their stud bays, the brick face (its courses give the scale) along the top of frame,
// the boards along the bottom, the blade of light at the closed end, frame left. The top plate is lifted off (shot.hide):
// a cutaway, which the plan's wall notes avoided ("no cutaway of the wall from outside"); Jade chose to try it, so the plan
// wording changes (see NOTES). It opens "Nowhere to go" at 1:51.0; WL_in (the file, blinking) takes over at 1:52.2.
// The camera is 3.45 m above the floor, 24 mm, the cavity running across the frame (brick at the top: the camera is
// 2 mm toward the boards so three.js's lookAt has a defined up).
BASE.splice(BASE.findIndex((s) => s.id === 'WL_in'), 0, { id: 'WL_top', lens: 24, pos: [-0.002, 3.45, 1.20], target: [0, 0, 1.20], hide: ['top plate'], near: 0.5, far: 4.5, position: 'overhead', light: TOP_LIFT,
  time: '1:51.0-1:52.2', section: 'Chorus 1 ("Nowhere to go")', beamAnchor: 'mote', workers: true,
  header: '1:51.0 OVERHEAD: straight down into the cavity onto the five heads, holding their breath',
  intent: 'r5 (Jade: "Try it at 1:51.0-1:52.2"). From straight above, the narrow slot of the cavity runs across the frame: brick (courses of small bricks) along the top, the boards and their studs along the bottom. Five people stand in a single file, one per stud bay, backs to the brick, facing the boards, shoulders almost touching: we see the tops of their heads (Mama nearest the closed end at frame left, her bob; the praying woman next to her) and their shoulders. The thin blade of light from the crack falls across the floor at the closed end, frame left. Dark, still, holding their breath. Cut to WL_in at 1:52.2.',
  figs: WORKER_FIGS, clip: CLIP_FILE });
const TWINS = BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }));
// r4: plan view (not painted): checks the 32 cm cavity, the stud bays and the feet (toes short of the boards)
const PLAN = { id: 'WL_plan', lens: 0, ortho: { w: 3.9 }, pos: [0, 6, 0.95], target: [0, 0, 0.95], up: [1, 0, 0], near: 3.5, far: 7,
  hide: ['top plate'], light: PLAN_LIFT, position: 'plan', header: 'PLAN (reference, not painted): the cavity from above, 32 cm clear; boards at the bottom, brick at the top',
  intent: 'r4 check: cavity width, stud bays, feet.', figs: { littleJade: jadeStand(), ...WORKER_FIGS }, clip: { touch: [...CLIP_KID.touch, ...CLIP_FILE.touch] } };
// 2026-11-28 (Jade round 9: one canonical board texture): the boards seen square-on from the brick (not painted): checks the
// 140 mm boards, the butt joints on the studs, the nails, the knots and the crack, as every shot maps them
const BOARDS_REF = { id: 'WL_boards', lens: 14, pos: [0.155, 1.1, -0.1], target: [-0.16, 1.1, -0.1], position: 'reference', light: PLAN_LIFT,
  header: 'BOARDS (reference, not painted): the partition seen square-on from the brick, the crack across the middle',
  intent: 'Check: 140 mm boards, butt joints on studs, two nails per stud, knots; the same texture in every shot and mode.', figs: {} };
export const SHOTS = BASE.concat(TWINS, [PLAN, BOARDS_REF]);
