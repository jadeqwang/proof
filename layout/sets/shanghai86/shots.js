// SHANGHAI 1986 camera table. Verse 1 (0:30-0:59) and the first four bars of the piano break (0:59-1:09).
// Times are seconds from analysis/v2/song_map.md; `t` = [start, end] of the clip this camera serves.
// The plan's two camera positions:  OUTSIDE = frontal, level, locked off on her face.  INSIDE = along her eye-line, close
// (her head is hidden in those guides: the camera sits where her eyes are).
// Fields: id, lens (mm, 36 mm frame), pos | orbit, target | aim: [point, u, v], state ('A' the uncle explains | 'B' a week
// later, the drift; default B), tissue (pieces of the sheet she is on: 1, 2, 4, 8), figs, hideParts, header, intent, move.
import { PLACES } from './layout.js';

const H = PLACES.uncleHands, JX = PLACES.jadeSit[0];
// ---------------------------------------------------------------- poses
// state A: the uncle on his stool facing the window, forearms on his knees, shaping something small low in the shaft
const UY = PLACES.uncleYaw * Math.PI / 180, UD = [Math.sin(UY), Math.cos(UY)], UL = [Math.cos(UY), -Math.sin(UY)];   // his facing and his left, on the floor plane
const uPalm = (k) => [H[0] - UD[0] * 0.1 + UL[0] * 0.05 * k, H[1], H[2] - UD[1] * 0.1 + UL[1] * 0.05 * k];
const UF = [UD[0], -0.15, UD[1]];
const uncleShape = (o = {}) => ({ at: PLACES.uncleStool, legs: 'seat', legOpts: { seatH: 0.52 }, yaw: PLACES.uncleYaw, spine: { bend: 30 }, head: { look: 'uncleHands' },
  L: { to: uPalm(1), hand: 'pinch', palm: 'in', fingers: UF }, R: { to: uPalm(-1), hand: 'pinch', palm: 'in', fingers: UF }, ...o });
const jadeWatch = (o = {}) => ({ at: PLACES.jadeStand, legs: 'stand', yaw: 0, head: { look: 'uncleHands' }, L: 'side', R: 'side', ...o });
// state B: she sits cross-legged in the pool of light, facing the main camera
const hold = (dx) => ({ L: { to: [JX + dx, 0.22, -0.13], hand: 'pinch', palm: 'in', fingers: 'fwd' }, R: { to: [JX - dx, 0.22, -0.13], hand: 'pinch', palm: 'in', fingers: 'fwd' } });
const lay = { L: { to: [JX + 0.12, 0.09, -0.17], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [JX - 0.06, 0.11, -0.13], hand: 'pinch', palm: 'down', fingers: 'fwd' } };
const jadeSit = (n = 8, o = {}) => ({ at: PLACES.jadeSit, legs: 'cross', yaw: 0, spine: { bend: n <= 2 ? 14 : 30 }, head: { look: n <= 2 ? [JX, 0.2, -0.1] : 'focus' }, ...(n === 1 ? hold(0.085) : n === 2 ? hold(0.15) : lay), ...o });
const mother = (o = {}) => ({ at: PLACES.mother, legs: 'stand', yaw: -90, spine: { bend: 4 }, head: { look: 'jade3:head' }, L: 'side', R: { to: [1.79, 1.22, -0.57], hand: 'relax', palm: [0, 0, -1], fingers: 'up' }, ...o });
const aunt = { at: PLACES.aunt, legs: 'stand', yaw: -70, spine: { bend: -6 }, head: { look: 'jade3:head', nod: -10 }, R: { to: 'self:mouth', off: [-0.07, -0.04, 0.02], hand: 'relax', palm: 'back' }, L: 'side' };
const uncleLaugh = { at: PLACES.uncleLaugh, legs: 'stand', yaw: -122, spine: { bend: -9 }, head: { nod: -16 }, L: 'side', R: 'side' };
const grandma = { at: PLACES.grandma, legs: 'seat', legOpts: { seatH: 0.58 }, yaw: -55, spine: { bend: 12 }, head: { look: 'jade3:head' }, L: 'lap', R: 'lap' };
const ALONE = (n, o) => ({ jade3: jadeSit(n, o), mama86: mother() });
const CROWD = (n, o) => ({ jade3: jadeSit(n, o), mama86: mother(), aunt, uncle: uncleLaugh, grandma });
const INSIDE = { hideParts: { jade3: ['head'] } };
// the one inside camera over the tissue: from her eyes down onto the clear patch in front of her
const TISSUE_CAM = { lens: 28, orbit: { at: [JX, 0.1, -0.02], az: 180, el: 66, dist: 0.41 }, aim: [[JX, 0.1, -0.02], 0.5, 0.52], ...INSIDE };

export const SHOTS = [
  // ---------------------------------------------------------------- reference (not in the cut)
  { id: 'REF_plan', lens: 0, ortho: { w: 6.6 }, pos: [0, 6, 0], target: [0, 0, 0], up: [0, 0, -1], near: 3.2, far: 7, tissue: 8, figs: CROWD(8), beamLine: false,
    header: 'PLAN (reference): window left, door right, bed at the back; yellow = the beam and its footprint', intent: 'Top view of the set, state B with everyone in it. Not a shot.' },
  { id: 'REF_wide', lens: 22, pos: [-0.3, 1.5, 2.08], aim: ['pool', 0.48, 0.7], tissue: 8, figs: CROWD(8),
    header: 'MASTER (reference): the whole room from the front wall', intent: 'The room as every verse-1 camera sees it: window left, shaft falling to the floor mid-room, the child in it, adults out of it. Not a shot.' },

  // ---------------------------------------------------------------- verse 1, 0:30-0:59
  { id: 'V1a', t: [30.18, 32.0], lens: 55, state: 'A', orbit: { at: 'jade3:eyes', az: 0, el: 0, dist: 1.9 }, aim: ['jade3:eyes', 0.4, 0.4], focus: ['jade3'],
    figs: { jade3: jadeWatch(), uncle: uncleShape() },
    header: '0:30 OUTSIDE "Three years old, uncle explains atoms" (header 1. Shanghai, 1986)',
    intent: 'Outside: frontal, level, locked off on her face. She stands in the shaft, eyes down on the uncle\'s hands; he sits frame right with his back to us, above the light, his head out of frame.' },
  { id: 'V1b', t: [32.0, 34.3], lens: 32, state: 'A', orbit: { at: 'ball', az: -159, el: 36, dist: 0.46 }, aim: ['ball', 0.5, 0.5], ...INSIDE,
    figs: { jade3: jadeWatch(), uncle: uncleShape() },
    header: '0:32 INSIDE the uncle\'s hands shaping something small; his face is not in frame',
    intent: 'Inside: her eye-line down onto his two hands in the shaft, rolling something small between finger and thumb. Forearms and knees, no face.' },
  { id: 'V1c', t: [34.3, 37.8], lens: 40, tissue: 1, orbit: { at: 'jade3:eyes', az: 0, el: 0, dist: 1.9 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'], figs: ALONE(1),
    header: '0:34 OUTSIDE "A week later my mother finds me": she sits in the drift, in the pool of light',
    intent: 'Outside: frontal, level, locked off. She sits cross-legged on the floorboards in the pool of window light, the drift of torn tissue round her, a whole sheet in her hands. Bed and back wall behind, out of the light.' },
  { id: 'V1d_1', t: [37.8, 41.3], tissue: 1, ...TISSUE_CAM, figs: ALONE(1),
    header: '0:37.8 INSIDE "sat in a snow drift of paper": 1 sheet (gold dot x1)', intent: 'Inside, the tissue camera: her eye-line onto her own hands and the clear patch of floor. One whole sheet held up in the light.' },
  { id: 'V1d_2', t: [41.3, 43.6], tissue: 2, ...TISSUE_CAM, figs: ALONE(2),
    header: '0:41.3 INSIDE "ripped to shreds": 2 halves (gold dots x2)', intent: 'Same camera. The sheet torn in two, a half in each hand.' },
  { id: 'V1d_4', t: [43.6, 44.95], tissue: 4, ...TISSUE_CAM, figs: ALONE(4),
    header: '0:43.6 INSIDE "Ever tinier": 4 quarters laid on the boards (gold dots x4)', intent: 'Same camera. Four quarters laid out on the clear patch of floor.' },
  { id: 'V1d_8', t: [44.95, 48.0], tissue: 8, ...TISSUE_CAM, figs: ALONE(8),
    header: '0:45 INSIDE "repeating what uncle said": 8 eighths (gold dots x8)', intent: 'Same camera. Eight eighths. This is the thing drawn in full depth.' },
  { id: 'V1e', t: [48.0, 50.95], lens: 26, tissue: 8, pos: [-1.2, 0.6, 0.72], aim: ['jade3:eyes', 0.3, 0.68], figs: ALONE(8),
    header: '0:48 "What on earth are you doing?": Mother in the doorway, beyond the reach of the beam',
    intent: 'Low, from the window side: the child frame left in the light, still looking down at the pieces; Mother stands in the doorway frame right, where the shaft points but does not reach. Mother\'s face is drawn.' },
  { id: 'V1f', t: [50.95, 53.25], lens: 20, tissue: 8, pos: [JX + 0.04, 0.5, -0.27], aim: [{ mid: ['aunt:head', 'uncle:head'] }, 0.5, 0.36], ...INSIDE,
    figs: CROWD(8, { head: { look: [1.3, 1.4, -0.1] } }),
    header: '0:51 INSIDE "The adults howl with laughter": seen from below, out of the light (one gold ?)',
    intent: 'Inside: from her eyes on the floor up at the adults by the door, all outside the shaft: bodies, hands, laughing postures; faces left as paper (Mother excepted). The window is behind the camera.' },
  { id: 'V1g', t: [53.25, 55.5], lens: 65, tissue: 8, orbit: { at: 'jade3:eyes', az: 0, el: 0, dist: 1.45 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'],
    figs: ALONE(8, { head: { look: [0.9, 1.0, 1.5] } }),
    header: '0:53 OUTSIDE "What\'s so funny?": her face, closer', intent: 'Outside: frontal, level, locked off, closer than V1c and shorter. Her head has turned toward the door; nothing else moves in her face.' },
  { id: 'V1h', same: 'V1d_8', t: [55.5, 59.28], header: '0:55.5 INSIDE "Nobody tells me after": back to the eight pieces',
    intent: 'The tissue camera again (identical to V1d_8). Her attention goes back to the pieces; the descent starts from here.' },

  // ---------------------------------------------------------------- piano break, first four bars, 0:59-1:09
  { id: 'PB1', t: [59.28, 68.9], lens: 50, tissue: 8, pos: [JX, 0.62, 0.02], target: [JX, 0, 0.065], ...INSIDE, figs: ALONE(8),
    move: { end_pos: [JX + 0.036, 0.04, 0.062], end_target: [JX + 0.036, 0, 0.066], note: 'four bars straight down into one of the eight pieces: sheet, fibre, lattice, points. Below about 5 cm the set stops and the renderer takes over.' },
    header: '0:59 INSIDE piano break, bars 1-4: straight down into the tissue (start of the move)',
    intent: 'Inside: top-down over the eight pieces from her side (her knees at the bottom edge), then four bars of descent into one piece. The guide shows the start frame.' },
];

for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
