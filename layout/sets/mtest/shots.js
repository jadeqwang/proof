// mtest shots: poses x views for an adult (jade27, short sleeves) and a child (jade7, long sleeves); upper-body
// close-ups of Mama (pushed sleeves, apron); the cast line-up; every named hand shape (right and left, four views).
import '../_cast.js';
const A = [-0.4, -0.4], C = [0.4, 0.4];
const POSES = {
  rest: { L: 'side', R: 'side' },
  raise: { L: { to: 'self:headTop', off: [0.1, 0.32, 0.02], hand: 'flat', palm: 'in', fingers: 'up' }, R: { to: 'self:headTop', off: [-0.1, 0.32, 0.02], hand: 'flat', palm: 'in', fingers: 'up' } },
  cross: { L: { to: 'self:chest', off: [-0.11, 0.04, 0.1], hand: 'relax', palm: [0, 0, -1] }, R: { to: 'self:chest', off: [0.1, -0.03, 0.14], hand: 'relax', palm: [0, 0, -1] } },
  reach: { L: { to: 'self:shoulderL', off: [0.02, -0.02, 0.62], hand: 'palmUp', palm: 'up' }, R: { to: 'self:shoulderR', off: [-0.02, 0.1, 0.6], hand: 'point', palm: 'down' } },
};
const scale = (o, k) => JSON.parse(JSON.stringify(o), (key, v) => (key === 'off' ? v.map((x) => x * k) : v));
const pair = (pose) => ({ jade27: { at: A, legs: 'stand', yaw: 0, ...POSES[pose] }, jade7: { at: C, legs: 'stand', yaw: 0, ...scale(POSES[pose], 0.72) } });
const VIEWS = { front: 0, side: 90, q3: -35, back: 180 };
export const SHOTS = [];
for (const p of Object.keys(POSES)) for (const [v, az] of Object.entries(VIEWS)) {
  if (v === 'back' && p !== 'raise' && p !== 'cross') continue;
  SHOTS.push({ id: `${p}_${v}`, lens: 35, orbit: { at: [0, 0.95, 0], az, el: 6, dist: 4.1 }, figs: pair(p), header: `${p}, ${v}: jade27 (adult, short sleeves) and jade7 (child, long sleeves)` });
}
for (const p of Object.keys(POSES)) for (const [v, az] of [['q3', -35], ['q3r', 40]]) SHOTS.push({ id: `mama_${p}_${v}`, lens: 35, orbit: { at: 'mama:chest', az, el: 8, dist: 1.75 }, figs: { mama: { at: [0, 0], legs: 'stand', yaw: 0, ...POSES[p] } }, header: `Mama (pushed sleeves, apron) ${p}` });
SHOTS.push({ id: 'cast_front', lens: 35, pos: [0, 1.0, 6.2], target: [0, 0.8, 0], header: 'cast line-up: mama dad jade27 jade10 jade7 littleJade jade3 daughter',
  figs: Object.fromEntries(['mama', 'dad', 'jade27', 'jade10', 'jade7', 'littleJade', 'jade3', 'daughter'].map((w, i) => [w, { at: [(i - 3.5) * 0.62, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' }])) });
SHOTS.push({ id: 'cast_q3', lens: 35, pos: [-3.8, 1.2, 5.0], target: [0, 0.75, 0], header: 'cast line-up, three-quarter', figs: SHOTS[SHOTS.length - 1].figs });
// legs: sitting, kneeling, cross-legged (knees and feet)
SHOTS.push({ id: 'legs_q3', lens: 35, orbit: { at: [0, 0.5, 0], az: -40, el: 12, dist: 3.2 }, header: 'legs: seat, kneel, cross, knees',
  figs: { jade27: { at: [-0.7, -0.3], legs: 'seat', legOpts: { seatH: 0.45 }, yaw: 0, L: 'lap', R: 'kneeR' }, mama: { at: [0.3, -0.5], legs: 'kneel', yaw: 0, L: 'side', R: 'side' }, jade7: { at: [0.9, 0.5], legs: 'cross', yaw: -20, L: 'lap', R: 'lap' }, dad: { at: [-0.2, 0.9], legs: 'knees', yaw: 30, L: 'kneeL', R: 'kneeR' } } });
// hands
for (const [view, side] of [['palm', 'R'], ['back', 'R'], ['thumb', 'R'], ['q3', 'R'], ['palm', 'L'], ['q3', 'L']])
  SHOTS.push({ id: `hands_${side}_${view}`, lens: 50, pos: [0, 0.85, 2.75], target: [0, 0.85, 0], hands: { who: 'jade27', side, view, y0: 1.08, dy: 0.42 }, header: `every hand shape, adult ${side === 'R' ? 'right' : 'left'} hands, ${view} view: ` });
SHOTS.push({ id: 'hands_child_q3', lens: 50, pos: [0, 0.9, 1.75], target: [0, 0.9, 0], hands: { who: 'jade3', side: 'R', view: 'q3', y0: 1.06, dy: 0.26, dx: 0.17 }, header: 'every hand shape, 3-year-old right hands' });
// close-ups: columns = shapes, rows = palm / thumb side / three-quarter back (right hands), left hand palm view
const GROUPS = [['flat', 'relax', 'palmUp', 'cup'], ['grip', 'pinch', 'point', 'fist'], ['ring', 'switch', 'monkeyHead', 'monkeyPaw'], ['two', 'thumbsUp', { shape: 'grip', curl: { all: [30, 40, 20] }, thumb: { opp: 0.5 } }, 'relax']];   // (an override example)
GROUPS.forEach((g, i) => SHOTS.push({ id: `hclose_${i + 1}`, lens: 50, pos: [0, 0.85, 1.85], target: [0, 0.85, 0], header: 'hand shapes ' + g.map((x) => (typeof x === 'string' ? x : x.shape + '*')).join(' ') + ' (rows: palm, thumb side, 3/4 back)',
  hands: { who: 'jade27', side: 'R', shapes: g, views: ['palm', 'thumb', 'q3b'], dx: 0.3, dy: 0.24, y0: 1.0 } }));
GROUPS.forEach((g, i) => SHOTS.push({ id: `hcloseL_${i + 1}`, lens: 50, pos: [0, 0.85, 1.85], target: [0, 0.85, 0], header: 'LEFT hands ' + g.map((x) => (typeof x === 'string' ? x : x.shape + '*')).join(' ') + ' (rows: palm, thumb side, 3/4 back)',
  hands: { who: 'jade27', side: 'L', shapes: g, views: ['palm', 'thumb', 'q3b'], dx: 0.3, dy: 0.24, y0: 1.0 } }));
if (0) SHOTS.push({ id: 'hands_close', lens: 50, pos: [0, 1.0, 1.1], target: [0, 1.0, 0], hands: { who: 'jade27', side: 'R', view: 'q3', cols: 4, dx: 0.2, y0: 1.08, shapes: ['grip', 'pinch', 'point', 'ring'] }, header: 'close: grip pinch point ring' });
