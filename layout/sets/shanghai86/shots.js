// SHANGHAI 1986 camera table. Verse 1 (0:29.7-0:58.6) and the first four bars of the piano break (0:58.6-1:08.3).
// Times are -2sm master seconds (analysis/m2sm/song_map.md; retimed from v2 2026-11-25, cuts on the -2sm sung onsets); `t` = [start, end] of the clip this camera serves.
// The plan's two camera positions:  OUTSIDE = frontal, level, locked off on her face.  INSIDE = along her eye-line, close
// (her head is hidden in those guides: the camera sits where her eyes are).
// Fields: id, lens (mm, 36 mm frame), pos | orbit, target | aim: [point, u, v], state ('A' the uncle explains | 'B' a week
// later, the drift; default B), tissue (which generation the gold dots count: 1, 2, 4, 8 pieces of one sheet), figs,
// hideParts, edgeNT (line-mode crease threshold, default 0.25), header, intent, move.
// Geometry (layout.js, Jade's corrections (2), (3)): x = building east, z = out of the windows (SSE). One long room
// (~9.5 m); couch group at the west end, couch on the WEST wall, its L armchair ~0.7 m from the bookshelves; hall doors
// in the NORTH wall, a 4.0 m opening centred on it (Mother, decision page). Winter-morning sun (21 Dec 1986, 09:30, Jade's
// choice) from the SE (23 deg east of the facade normal) slants in north-west; it lights the table's south half and the
// armchairs, not her face, and stops well short of the north wall (NOTES "(5)").
import { PLACES, DOOR } from './layout.js';

const deg = (r) => r * 180 / Math.PI;
const yawTo = (from, to) => deg(Math.atan2(to[0] - from[0], to[1] - from[1]));   // yaw 0 faces +z (the windows), 90 faces +x
const [JX, JZ] = PLACES.jadeSit, JY = PLACES.jadeYaw * Math.PI / 180, FWD = [Math.sin(JY), Math.cos(JY)], LEFT = [Math.cos(JY), -Math.sin(JY)];
const H = PLACES.uncleHands, F = PLACES.focus;
// ---------------------------------------------------------------- poses
// state A: the uncle on the lounger's west edge, just outside the light; his left hand cupped palm-up in the light with
// the small thing in it, his right thumb and index pinching it from above (two hands that read apart from above)
const UYAW = yawTo(PLACES.uncleSeat, [H[0], H[2]]), UF = [Math.sin(UYAW * Math.PI / 180), Math.cos(UYAW * Math.PI / 180)];
const BALL = [H[0], H[1] + 0.024, H[2]];
const uncleShape = (o = {}) => ({ at: PLACES.uncleSeat, legs: 'seat', legOpts: { seatH: 0.45 }, yaw: UYAW, spine: { bend: 24 }, head: { look: BALL },
  L: { to: H, hand: { shape: 'cup', spread: 10, curl: { index: [20, 22, 10], middle: [24, 26, 12], ring: [28, 30, 14], little: [32, 34, 16] } }, palm: 'up', fingers: [UF[0], 0.05, UF[1]] },
  R: { tip: { finger: 'index', at: [BALL[0], BALL[1] + 0.013, BALL[2]] }, hand: { shape: 'pinch', spread: 14, curl: { middle: [40, 50, 25], ring: [55, 65, 32], little: [70, 80, 40] } }, palm: 'down', fingers: [UF[0], -0.35, UF[1]] }, ...o });
// she kneels at her spot (where she will sit, cross-legged, a week later), watching his hands across the table corner. KEPT
// kneeling: Jade's "cross-legged, not kneeling" is read as the drift scene; kneeling up keeps her eyes above his hands
const jadeWatch = (o = {}) => ({ at: PLACES.jadeStand, legs: 'kneel', yaw: yawTo(PLACES.jadeStand, [H[0], H[2]]), spine: { bend: 12 }, head: { look: BALL }, L: 'lap', R: 'lap', ...o });
// state B: she sits CROSS-LEGGED (Jade, decision page) facing the table and the windows (south), working on the table's
// north-west corner
const C = [JX + FWD[0] * 0.36, JZ + FWD[1] * 0.36];   // in front of her, over the table's north edge
const HOLD_Y = 0.45;   // cross-legged her eyes are ~0.52 m up, only 10 cm over the table top: the sheet is held low and nearly flat so her face shows
const hold = (dz) => ({ L: { to: [C[0] + LEFT[0] * dz, HOLD_Y, C[1] + LEFT[1] * dz], hand: 'pinch', palm: 'in', fingers: 'fwd' }, R: { to: [C[0] - LEFT[0] * dz, HOLD_Y, C[1] - LEFT[1] * dz], hand: 'pinch', palm: 'in', fingers: 'fwd' } });
const lay = { L: { to: [F[0] + 0.1, 0.445, F[2] - 0.06], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [F[0] - 0.05, 0.46, F[2] - 0.09], hand: 'pinch', palm: 'down', fingers: 'fwd' } };
const jadeSit = (n = 8, o = {}) => ({ at: PLACES.jadeSit, legs: 'cross', yaw: PLACES.jadeYaw, spine: { bend: n <= 2 ? 14 : 30 }, head: { look: n <= 2 ? [C[0], 0.5, C[1] + 0.06] : 'focus' }, ...(n === 1 ? hold(0.1) : n === 2 ? hold(0.15) : lay), ...o });
const M = PLACES.mother;
const mother = (o = {}) => ({ at: M, legs: 'stand', yaw: yawTo(M, PLACES.jadeSit), spine: { bend: 3 }, head: { look: 'jade3:head' },
  R: { to: [DOOR.x0 + 0.02, 1.12, DOOR.z - 0.04], hand: 'relax', palm: [-1, 0, 0], fingers: 'up' }, L: 'side', ...o });   // a hand on the west jamb
const grandma = { at: PLACES.grandma, legs: 'seat', legOpts: { seatH: 0.4 }, yaw: yawTo(PLACES.grandma, PLACES.jadeSit), spine: { bend: -6 }, head: { look: 'jade3:head', nod: -12 }, L: 'lap', R: { to: 'self:mouth', off: [-0.05, -0.06, 0.04], hand: 'relax', palm: 'back' } };
const aunt = { at: PLACES.aunt, legs: 'stand', yaw: yawTo(PLACES.aunt, PLACES.jadeSit), spine: { bend: -6 }, head: { look: 'jade3:head', nod: -10 }, R: { to: 'self:mouth', off: [-0.07, -0.04, 0.02], hand: 'relax', palm: 'back' }, L: 'side' };
const uncleLaugh = { at: PLACES.uncleLaugh, legs: 'stand', yaw: yawTo(PLACES.uncleLaugh, PLACES.jadeSit), spine: { bend: -9 }, head: { nod: -16 }, L: 'side', R: 'side' };
const ALONE = (n, o) => ({ jade3: jadeSit(n, o), mama86: mother() });
const CROWD = (n, o) => ({ jade3: jadeSit(n, o), mama86: mother(), aunt, uncle: uncleLaugh, grandma });
const INSIDE = { hideParts: { jade3: ['head'] } };
// the one inside camera over the paper: from her eyes down onto her hands and the clear patch at the table's corner
const TC = [F[0] - 0.02, 0.45, F[2] - 0.03];
const TISSUE_CAM = { lens: 28, orbit: { at: TC, az: yawTo([TC[0], TC[2]], [JX, JZ]), el: 54, dist: 0.46 }, aim: [TC, 0.5, 0.55], ...INSIDE };
const ADULTS = [0.75, 1.2, -2.85];

export const SHOTS = [
  // ---------------------------------------------------------------- reference (not in the cut)
  { id: 'REF_plan', lens: 0, ortho: { w: 12.4 }, pos: [2.25, 9, -2.85], target: [2.25, 0, -2.85], up: [0, 0, -1], near: 6.14, far: 12, tissue: 8, figs: CROWD(8), beamLine: false,
    header: 'PLAN (reference): north up: hall doors + bookshelves top, windows + balcony bottom, couch left (west); yellow = sun', intent: 'Top view of the living room, state B with everyone in it. Not a shot.' },
  { id: 'REF_wide', lens: 20, pos: [6.55, 1.9, -4.95], aim: [[-1.0, 0.5, -2.6], 0.5, 0.62], tissue: 8, figs: CROWD(8),
    header: 'MASTER (reference): the long room from its east (old dining) end: windows left, hall doors + bookshelves right, couch group far end',
    intent: 'The whole joined room: both sets of French windows, the 09:30 beams slanting in from the left onto the couch group\'s table and the dining end, the child at the light\'s north edge, Mother in the wide hall doorway, the adults in the dark between the shafts. Not a shot.' },
  { id: 'REF_beam', lens: 22, pos: [1.45, 1.35, -0.25], aim: [[-1.2, 0.5, -3.6], 0.5, 0.6], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE: from the windows\' east end, along the light', intent: 'The beam from beside the windows: the table\'s south half, the armchairs and the couch\'s south end in the light, the child at its north edge, Mother in the doorway far beyond its end. Not a shot.' },

  // ---------------------------------------------------------------- verse 1, 0:29.7-0:58.6
  { id: 'V1a', t: [29.74, 31.58], lens: 65, state: 'A', orbit: { at: 'jade3:eyes', az: yawTo(PLACES.jadeStand, [H[0], H[2]]), el: 0, dist: 1.8 }, aim: ['jade3:eyes', 0.42, 0.42], focus: ['jade3'],
    figs: { jade3: jadeWatch(), uncle: uncleShape() },
    header: '0:29.7 OUTSIDE "Three years old, uncle explains atoms" (header 1. Shanghai, 1986)',
    intent: 'Outside: frontal, level, locked off on her face, lit from the windows behind the camera. She kneels up at the table corner (state A keeps the kneel: she watches, a week before she sits cross-legged), eyes down on the uncle\'s hands; he sits in the armchair across the table, his hands reaching in over the table just north of the light (09:30); he is out of frame right, only his hands in.' },
  { id: 'V1b', t: [31.58, 34.52], lens: 40, state: 'A', orbit: { at: 'ball', az: yawTo([BALL[0], BALL[2]], PLACES.jadeStand), el: 36, dist: 0.6 }, aim: ['ball', 0.5, 0.5], edgeNT: 0.12, ...INSIDE,
    figs: { jade3: jadeWatch(), uncle: uncleShape() },
    header: '0:31.6 INSIDE the uncle\'s hands shaping something small; his face is not in frame',
    intent: 'Inside: her eye-line down onto his two hands in the light: the left cupped palm-up holding something small, the right thumb and index pinching it from above, the other fingers fanned. Forearms and knees, no face.' },
  { id: 'V1c', t: [34.52, 37.85], lens: 55, tissue: 1, orbit: { at: 'jade3:eyes', az: PLACES.jadeYaw, el: 0, dist: 1.9 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'], figs: ALONE(1),
    header: '0:34.5 OUTSIDE "A week later my mother finds me": she sits in the drift, at the edge of the light',
    intent: 'Outside: frontal, level, locked off, across the coffee table from the window side. She sits cross-legged at the table\'s corner between the couch and the armchair, just north of the light (09:30: it falls on the table\'s south half), a whole sheet of 草纸 in her hands, a stray bit in her hair; the stack and the torn pieces on the table; the north wall and the hall doors dark behind her.' },
  { id: 'V1d_1', t: [37.85, 41.43], tissue: 1, ...TISSUE_CAM, figs: ALONE(1),
    header: '0:37.9 INSIDE "sat in a snow drift of paper": 1 sheet (gold dot x1)', intent: 'Inside, the tissue camera: her eye-line onto her own hands over the table corner. One whole sheet (16 x 23 cm) held low over the table (cross-legged, her eyes are only ~10 cm above its top).' },
  { id: 'V1d_2', t: [41.43, 43.34], tissue: 2, ...TISSUE_CAM, figs: ALONE(2),
    header: '0:41.4 INSIDE "ripped to shreds": 2 halves (gold dots x2)', intent: 'Same camera. The sheet torn in two (ragged edge), a half in each hand.' },
  { id: 'V1d_4', t: [43.34, 45.43], tissue: 4, ...TISSUE_CAM, figs: ALONE(4),
    header: '0:43.3 INSIDE "Ever tinier": 4 quarters laid on the table (gold dots x4)', intent: 'Same camera. Four quarters of one sheet laid out a little apart on the clear patch of table.' },
  { id: 'V1d_8', t: [45.43, 48.14], tissue: 8, ...TISSUE_CAM, figs: ALONE(8),
    header: '0:45.4 INSIDE "repeating what uncle said": 8 eighths (gold dots x8)', intent: 'Same camera. Eight eighths. Round them, the drift: sixteenths down to fingertip confetti. This is the thing drawn in full depth.' },
  { id: 'V1e', t: [48.14, 50.52], lens: 32, tissue: 8, pos: [-0.5, 0.8, -0.25], aim: ['jade3:eyes', 0.3, 0.58], figs: ALONE(8),
    header: '0:48.1 "What on earth are you doing?": Mother in the doorway, beyond the reach of the beam',
    intent: 'Low, from the windows, looking into the room: the child frame left at the edge of the light, still looking down at the pieces; the light falls on the table and the floor in front of her and stops on the boards; Mother stands in the wide doorway frame right, in the dark, far beyond the reach of the light. Mother\'s face is drawn.' },
  { id: 'V1f', t: [50.52, 53.93], lens: 20, tissue: 8, pos: [JX + FWD[0] * 0.06, 0.6, JZ + FWD[1] * 0.12], aim: [ADULTS, 0.55, 0.38], ...INSIDE,
    figs: CROWD(8, { head: { look: ADULTS } }),
    header: '0:50.5 INSIDE "The adults howl with laughter": seen from below, out of the light (one gold ?)',
    intent: 'Inside: from her eyes at table height up at the adults on the east side, out of the light: grandmother in the armchair across the table, the aunt and the uncle standing behind; faces left as paper. The windows and the light are frame right.' },
  { id: 'V1g', t: [53.93, 55.15], lens: 85, tissue: 8, orbit: { at: 'jade3:eyes', az: PLACES.jadeYaw, el: 0, dist: 1.6 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'],
    figs: ALONE(8, { head: { look: ADULTS } }),
    header: '0:53.9 OUTSIDE "What\'s so funny?": her face, closer', intent: 'Outside: frontal, level, locked off, closer than V1c and shorter. Her eyes have come up off the paper toward the laughing adults (frame right); nothing else moves in her face.' },
  { id: 'V1h', same: 'V1d_8', t: [55.15, 58.55], header: '0:55.2 INSIDE "Nobody tells me after": back to the eight pieces',
    intent: 'The tissue camera again (identical to V1d_8). Her attention goes back to the pieces; the descent starts from here.' },

  // ---------------------------------------------------------------- piano break, first four bars, 0:58.6-1:08.3
  { id: 'PB1', t: [58.55, 68.34], lens: 50, tissue: 8, pos: [F[0] - 0.04, 0.84, F[2] - 0.12], target: [F[0], 0.42, F[2]], ...INSIDE, figs: ALONE(8),
    move: { end_pos: [F[0] + 0.01, 0.462, F[2] + 0.01], end_target: [F[0] + 0.012, 0.42, F[2] + 0.012], note: 'four bars straight down into one of the eight pieces: sheet, fibre, lattice, points. Below about 5 cm the set stops and the renderer takes over.' },
    header: '0:58.6 INSIDE piano break, bars 1-4: straight down into the 草纸 (start of the move)',
    intent: 'Inside: top-down over the eight pieces on the table corner from her side (her hands at the bottom edge), then four bars of descent into one piece. The guide shows the start frame.' },
];

for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
