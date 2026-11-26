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
const BRICK_X = CAVITY.x1 - 0.008;
const palmsToBrick = (z, y, dz) => ({
  L: { to: [BRICK_X, y, z + dz], hand: 'flat', palm: [1, 0, 0], fingers: 'down' },
  R: { to: [BRICK_X, y, z - dz], hand: 'flat', palm: [1, 0, 0], fingers: 'down' } });
// r4: head.look 'toMama' (layout.js FILE_LOOK: Mama beside her in the file): the head turns most of the way toward the
// outside cameras (near-frontal to them), the eyes take the rest, to picture right; the same pose in WL_out and WL_eye so the face reads at one plain angle in both.
const jadeStand = (o = {}) => ({ at: STAND.at, yaw: STAND.yaw, legs: 'stand', head: { look: 'toMama', turn: STAND.turn, nod: 2 },
  ...palmsToBrick(STAND.at[1], 0.52, 0.13), ...o });

// the workers: backs to the brick, facing the boards (-x), holding their breath (see layout.js WORKERS)
const W_X = CAVITY.x1 - 0.105;   // r4: pelvis 10.5 cm off the brick: heels ~5 cm off it, toes ~1 cm short of the boards
function worker(w) {
  const base = { at: [W_X, w.z], yaw: -90, legs: 'stand' };
  switch (w.pose) {
    case 'mouth': return { ...base, head: { nod: 8, turn: 12 }, R: { to: 'self:mouth', off: [-0.035, -0.01, 0], hand: 'flat', palm: 'back', fingers: 'left', elbow: 'down' },
      L: { to: 'side', hand: 'fist' } };
    // (hold pass 2026-11-26) the clasp holds no object: each hand curls loosely round the other ('relax', was 'grip', which
    // the hold check reads as gripping something and found nothing within 3 cm)
    case 'clasp': return { ...base, head: { nod: 22 }, L: { to: 'self:waist', off: [-0.13, 0.02, 0.0], hand: 'relax', palm: 'in', fingers: 'down' },
      R: { to: 'self:waist', off: [-0.15, 0.04, 0.0], hand: 'relax', palm: 'in', fingers: 'down' } };
    case 'pray': return { ...base, head: { nod: 26 }, L: { to: 'self:chin', off: [-0.09, -0.07, 0.012], hand: 'flat', palm: 'in', fingers: 'up' },
      R: { to: 'self:chin', off: [-0.09, -0.07, -0.012], hand: 'flat', palm: 'in', fingers: 'up' } };
    case 'flat': return { ...base, head: { nod: -8 }, ...palmsToBrick(w.z, 0.80, 0.2) };
    // r4 Mama: right palm flat back on the brick toward the closed end (between the file and her daughter), left hand
    // flat on the brick beside her hip; head turned back toward where her daughter stands (named point 'daughter')
    case 'shield': return { ...base, head: { look: 'daughter' },
      R: { to: [BRICK_X, 0.84, w.z - 0.22], hand: 'flat', palm: [1, 0, 0], fingers: 'down' },
      L: { to: [BRICK_X, 0.78, w.z + 0.15], hand: 'flat', palm: [1, 0, 0], fingers: 'down' } };
    default: throw new Error('pose ' + w.pose);
  }
}
const WORKER_FIGS = Object.fromEntries(WORKERS.map((w) => [w.key, worker(w)]));

// inside camera: down the cavity from the closed end, near the boards, 2 cm above the sheet of light. The rhyme needs
// the camera at the sheet; the sheet is at her eye where she stands against the brick, and rises toward the boards, so
// this is her eye-line moved out of the file to the boards side and lifted to the sheet there. Level, along the file.
// r4: 35 mm (was 28: the wide lens opened the cavity up and the painter widened it further), 10 cm further back,
// 7.5 cm off the boards (just clear of the studs' faces, so no stud stands across the frame), tilted up 4 deg so Mama's face (nearest, 1.1 m) stays in frame.
const IN_X = CAVITY.x0 + 0.075, IN_Y = +(bladeY(IN_X) + 0.02).toFixed(3);
const IN_CAM = { lens: 35, pos: [IN_X, IN_Y, -0.70], target: [0.06, IN_Y + 0.22, 2.6] };

const BASE = [
  { id: 'WL_out', lens: 50, orbit: { at: 'littleJade:eyes', az: -5, el: 0, dist: 1.6 }, aim: ['littleJade:eyes', 0.6, 0.3], focus: ['littleJade'], position: 'outside', time: '1:37.4-1:45.5 and 1:45.5-1:51.0', section: 'Chorus 1 ("Inside?" / "My voice goes blind")', beamAnchor: 'eye',
    header: '1:37.4 OUTSIDE: down the cavity, level, locked off; she stands, back to the brick, turning into the blade',
    intent: 'r3. The outside position, inside the wall. Down the length of the cavity: boards and the crack frame-left, brick frame-right. She stands with her back flat against the brick, palms on it, facing the boards; her head is turned toward us and slowly turns back toward the crack, and as it turns the thin sheet of light from the crack comes onto her eye. "Inside?" is this frame with the light off (dark). "My voice goes blind": her mouth opens just under the light, and closes. Inside she is scared (heart fast); her face does not know how to show it.',
    figs: { littleJade: jadeStand() } },
  { id: 'WL_eye', lens: 85, orbit: { at: 'littleJade:eyes', az: -12, el: 0, dist: 0.62 }, aim: ['littleJade:eyes', 0.5, 0.45], focus: ['littleJade'], position: 'outside', time: '1:40.7-1:45.5', section: 'Chorus 1 ("I honestly don\'t know")', beamAnchor: 'eye',
    header: '1:40.7 OUTSIDE, close: same staging; her eye turning into the blade',
    intent: 'r3. Same staging as WL_out, pushed in to her face, three-quarters, turning toward the crack. The blade crosses one eye and the bridge of the nose. She is scared inside, her heart is fast, but her face does not fully know how to recognise it or show it: still, uncertain, not a clear expression of fear.',
    figs: { littleJade: jadeStand() } },
  { id: 'WL_in', ...IN_CAM, position: 'inside', time: '1:51.0-1:54.5 (they blink in and out)', section: 'Chorus 1 ("Nowhere to go") into Tail 1', beamAnchor: 'mote', workers: true,
    header: '1:51.0 INSIDE, state A: the file of restaurant workers along the brick, holding their breath',
    intent: 'r3 (Jade): they blink in and out. A single file of Chinese restaurant workers, backs to the brick (frame-left), facing the boards (frame-right), holding their breath, terrified, some praying silently. They blink in and out of existence and then it is the empty wall space again (WL_in_empty). The blade crosses them at the waist. Faces unreached (strangers): fear and prayer are in hands, shoulders and bowed heads.',
    figs: WORKER_FIGS },
  { id: 'WL_in_empty', ...IN_CAM, position: 'inside', time: '1:51.0-1:54.5, end state; start of the 1:54.5 pull-back', section: 'Chorus 1 ("Nowhere to go") into Tail 1', beamAnchor: 'mote',
    header: '1:51.0 INSIDE, state B / RHYME FRAME: the same cavity, empty; the blade is the diagonal',
    intent: 'r3. The same camera as WL_in with nobody there: the empty wall space. The crack is a bright slit on the boards frame-right, the blade falls from it, upper right to lower left at 40 degrees. The pull-back to the Voyager frame starts here: the blade becomes the band, the mote the dot.',
    figs: {} },
];
const TWINS = BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }));
// r4: plan view (not painted): checks the 32 cm cavity, the stud bays and the feet (toes short of the boards)
const PLAN = { id: 'WL_plan', lens: 0, ortho: { w: 3.9 }, pos: [0, 6, 0.95], target: [0, 0, 0.95], up: [1, 0, 0], near: 3.5, far: 7,
  hide: ['top plate'], position: 'plan', header: 'PLAN (reference, not painted): the cavity from above, 32 cm clear; boards at the bottom, brick at the top',
  intent: 'r4 check: cavity width, stud bays, feet.', figs: { littleJade: jadeStand(), ...WORKER_FIGS } };
export const SHOTS = BASE.concat(TWINS, [PLAN]);
