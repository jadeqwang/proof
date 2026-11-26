// bodytest shots: hands (grip / point / relax / pinch) close, arm poses, the whole cast line-up (front and back).
import '../_cast.js';
const HANDS = { L: { to: 'self:shoulderL', off: [0.05, -0.15, 0.4], hand: 'grip', palm: 'in', fingers: 'fwd' }, R: { to: 'self:shoulderR', off: [-0.05, -0.1, 0.42], hand: 'point', palm: 'down' } };
const HANDS2 = { L: { to: 'self:chest', off: [0.12, -0.1, 0.22], hand: 'pinch', palm: 'down', fingers: 'fwd' }, R: { to: 'self:chest', off: [-0.12, -0.12, 0.25], hand: 'relax', palm: 'up' } };
const CASTF = ['mama', 'dad', 'jade27', 'jade19', 'jade10', 'jade7', 'littleJade', 'jade3', 'firstLove27', 'firstLove19'];
export const SHOTS = [
  ...[['fl_sheet_back', 180], ['fl_sheet_q3l', 140], ['fl_sheet_q3r', 220]].map(([id, az]) => ({ id, lens: 50, orbit: { at: 'firstLove27:head', rel: 'firstLove27', az, el: 3, dist: 0.8, off: [0, -0.08, 0] }, figs: { firstLove27: { at: [0, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' } }, header: 'first love: compare with cast/first_love/fl_B_backhead_neck_v8' })),
  { id: 'fl_back', lens: 50, orbit: { at: 'firstLove27:head', rel: 'firstLove27', az: 160, el: 5, dist: 0.9 }, figs: { firstLove27: { at: [0, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' } }, header: 'first love, back of the head (stepped cut)' },
  { id: 'fl_back_nod', lens: 50, orbit: { at: 'firstLove27:head', rel: 'firstLove27', az: 150, el: 15, dist: 0.9 }, figs: { firstLove27: { at: [0, 0], legs: 'stand', yaw: 0, head: { nod: 25, turn: 20 }, L: 'side', R: 'side' } }, header: 'first love, head bowed and turned' },
  { id: 'hands_a', lens: 50, orbit: { at: 'jade27:chest', az: -30, el: 10, dist: 1.3 }, figs: { jade27: { at: [0, 0], legs: 'stand', yaw: 0, head: { look: [-0.15, 1.05, 0.5] }, ...HANDS } }, header: 'grip L, point R' },
  { id: 'hands_b', lens: 50, orbit: { at: 'jade27:chest', az: 25, el: 25, dist: 1.2 }, figs: { jade27: { at: [0, 0], legs: 'stand', yaw: 0, head: { look: [0.12, 1.15, 0.3] }, ...HANDS2 } }, header: 'pinch L, relax palm-up R' },
  { id: 'kid_arms', lens: 50, orbit: { at: 'jade7:chest', az: -35, el: 8, dist: 1.3 }, figs: { jade7: { at: [0, 0], legs: 'stand', yaw: 0, head: { look: [-0.15, 1.05, 0.5] }, L: 'side', R: { to: 'self:shoulderR', off: [-0.05, 0.05, 0.3], hand: 'point', palm: 'down' } } }, header: 'child arms' },
  { id: 'cast_front', lens: 35, pos: [0, 1.0, 7.4], target: [0, 0.85, 0], header: 'cast line-up', figs: Object.fromEntries(CASTF.map((w, i) => [w, { at: [(i - 4.5) * 0.62, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' }])) },
  { id: 'cast_back', lens: 35, pos: [0, 1.0, -7.4], target: [0, 0.85, 0], header: 'cast line-up from behind', figs: Object.fromEntries(CASTF.map((w, i) => [w, { at: [(i - 4.5) * 0.62, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' }])) },
];

// 2026-11-26 cast/hair agent: Mama's jaw-length side-parted perm (cast/mama/mama_R), the bun on close pulled-back hair
// (aunt, grandmother, women guests), first love's finger-combed texture from the film's high OTS angles.
import { addCast } from '../_cast.js';
addCast({ aunt: { name: 'aunt (face undrawn)', h: 1.58, kind: 'adult', skin: 0xd8a27c, hair: 0x15110f, top: 0x9a6a5a, legs: 0x3a3632, hairStyle: 'bun', sleeves: 'long', undrawn: true },
  grandma: { name: 'grandmother (face undrawn)', h: 1.50, kind: 'adult', skin: 0xcf9c78, hair: 0x6a6a6a, top: 0x4a4f5a, legs: 0x2e2e30, hairStyle: 'bun', sleeves: 'long', undrawn: true },
  guestF: { name: 'woman guest, bun (face undrawn)', h: 1.64, kind: 'adult', sex: 'f', skin: 0xd9b499, hair: 0x2a211c, top: 0x5a7a9a, legs: 0x2c2c34, hairStyle: 'bun', sleeves: 'long', undrawn: true } });
const STAND = { legs: 'stand', yaw: 0, L: 'side', R: 'side' };
const HEAD = (who, az, el = 3, dist = 0.75) => ({ lens: 50, orbit: { at: who + ':head', rel: who, az, el, dist, off: [0, -0.05, 0] }, figs: { [who]: { at: [0, 0], ...STAND } } });
SHOTS.push(
  ...[['mama_front', 0], ['mama_q3', 35], ['mama_side', 90], ['mama_q3back', 140], ['mama_back', 180]].map(([id, az]) => ({ id, ...HEAD('mama', az), header: 'Mama: jaw-length side-parted perm (cast/mama/mama_R)' })),
  ...[['aunt_back', 180], ['aunt_side', 110]].map(([id, az]) => ({ id, ...HEAD('aunt', az), header: 'aunt: bun on close pulled-back hair' })),
  ...[['grandma_back', 180], ['grandma_side', 110]].map(([id, az]) => ({ id, ...HEAD('grandma', az), header: 'grandmother: bun on close pulled-back hair' })),
  { id: 'guestF_back', ...HEAD('guestF', 160), header: 'woman guest: bun' },
  { id: 'fl_high_closet', lens: 50, orbit: { at: 'firstLove19:head', rel: 'firstLove19', az: 165, el: 35, dist: 0.9 }, figs: { firstLove19: { at: [0, 0], legs: 'stand', yaw: 0, head: { nod: 20 }, L: 'side', R: 'side' } }, header: 'first love 19 from behind and above (closet OTS angle)' },
  { id: 'fl_mg_ots', lens: 50, orbit: { at: 'firstLove27:head', rel: 'firstLove27', az: 200, el: 12, dist: 1.0 }, figs: { firstLove27: { at: [0, 0], legs: 'stand', yaw: 0, head: { nod: 15, turn: -15 }, L: 'side', R: 'side' } }, header: 'first love 27, MG over-the-shoulder' },
);

// 2026-11-26 round 5 (engine-body): shoulder check. The social worker (sw body, office91 costume) beside Mama and the
// generic adult woman in the same two poses: hands forward at table height (as seated at the office table) and arms at
// the sides. Close front / back / top crops of each shoulder.
addCast({ sw: { name: 'social worker (face undrawn)', h: 1.65, kind: 'adult', skin: 0xe2b9a0, hair: 0x6a4a30, top: 0xb97a78, legs: 0x7088a8, hairStyle: 'bob', sleeves: 'long', undrawn: true },
  womanF: { name: 'woman (face undrawn)', h: 1.64, kind: 'adult', sex: 'f', skin: 0xd9b499, hair: 0x2a211c, top: 0xb97a78, legs: 0x2c2c34, hairStyle: 'bob', sleeves: 'long', undrawn: true } });
const TABLEARMS = { L: { to: 'self:chest', off: [0.16, -0.3, 0.42], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: 'self:chest', off: [-0.16, -0.3, 0.42], hand: 'relax', palm: 'down', fingers: 'fwd' } };
const SHW = ['sw', 'mama', 'womanF'];
for (const [pose, arms] of [['table', TABLEARMS], ['side', { L: 'side', R: 'side' }]])
  for (const [view, az, el] of [['front', 0, 8], ['back', 180, 20], ['q3', 40, 10]])
    SHOTS.push({ id: `shoulder_${pose}_${view}`, lens: 35, pos: [Math.sin(az * Math.PI / 180) * 2.6, 1.3 + el / 40, Math.cos(az * Math.PI / 180) * 2.6], target: [0, 1.25, 0], header: `shoulder check: sw / mama / woman, ${pose}, ${view}`,
      figs: Object.fromEntries(SHW.map((w, i) => [w, { at: [(i - 1) * 0.75, 0], legs: 'stand', yaw: 0, head: { look: [(i - 1) * 0.75, 1.4, 2] }, ...arms }])) });
// the social worker's office91 seated pose (shots.js sw(): yaw 180, spine bend 8, hands on the table, SW_ELBOW poles)
// replicated on three bodies 1 m apart: is the shoulder the body or the pose?
const SWP = (dx) => ({ at: [0.2 + dx, 0.55], legs: 'seat', legOpts: { seatH: 0.52 }, yaw: 180, spine: { bend: 8 }, head: { look: [0.2 + dx, 1.0, -0.6] },
  L: { to: [0.0 + dx, 0.755, 0.22], hand: 'relax', palm: 'down', fingers: [0.35, 0, -0.94], elbowAt: [-0.12 + dx, 0.55, 0.9] },
  R: { to: [0.27 + dx, 0.75, 0.17], hand: 'relax', palm: 'down', fingers: [-0.45, -0.08, -0.9], elbowAt: [0.52 + dx, 0.55, 0.9] } });
const SWPOSE = { sw: SWP(0), mama: SWP(1.0), womanF: SWP(-1.0) };
for (const [view, az, el, d] of [['front', 180, 8, 2.9], ['back', 0, 20, 2.9], ['q3', 140, 10, 2.9]])
  SHOTS.push({ id: `shoulder_swpose_${view}`, lens: 35, pos: [0.2 + Math.sin(az * Math.PI / 180) * d, 1.1 + el / 30, 0.55 + Math.cos(az * Math.PI / 180) * d], target: [0.2, 1.0, 0.55], header: `shoulder check: the sw office pose on sw / mama / woman, ${view}`, figs: SWPOSE });
for (const w of SHW) for (const [view, az, el] of [['front', 180, 8], ['back', 0, 25], ['side', 120, 10]])
  SHOTS.push({ id: `shoulder_close_${w}_${view}`, lens: 50, orbit: { at: w + ':chest', az, el, dist: 0.9 }, figs: SWPOSE, header: `shoulder check close: ${w}, sw office pose, ${view}` });
// the same pose on three copies of the sw body: clothed / the body alone / the garment alone
addCast({ swNude: { name: 'sw body alone', h: 1.65, kind: 'adult', body: 'sw', skin: 0xe2b9a0, hair: 0x6a4a30, top: 0xb97a78, legs: 0x7088a8, hairStyle: 'bob', sleeves: 'long', undrawn: true },
  swGarm: { name: 'sw garment alone', h: 1.65, kind: 'adult', body: 'sw', skin: 0xe2b9a0, hair: 0x6a4a30, top: 0xb97a78, legs: 0x7088a8, hairStyle: 'bob', sleeves: 'long', undrawn: true } });
const SWDBG = { sw: SWP(0), swNude: { ...SWP(1.0), debugBody: 'nude' }, swGarm: { ...SWP(-1.0), debugBody: 'garment' } };
for (const w of ['sw', 'swNude', 'swGarm']) for (const [view, az, el] of [['front', 180, 8], ['back', 0, 25], ['side', 120, 10]])
  SHOTS.push({ id: `shdbg_${w}_${view}`, lens: 50, orbit: { at: w + ':chest', az, el, dist: 0.9 }, figs: SWDBG, header: `shoulder debug: ${w}, sw office pose, ${view}` });
// 2026-11-26 round 5: dresses show bare legs (engine fix); the daughter (skirt garment), a woman in a dress (adult_f skirt),
// a 7-year-old in a dress (no skirt garment: the top's upper piece only) and one in tights.
addCast({ dressW: { name: 'woman in a dress', h: 1.64, kind: 'adult', sex: 'f', skin: 0xd9b499, hair: 0x2a211c, top: 0x5a7a9a, legs: 0x2c2c34, hairStyle: 'bob', sleeves: 'short', dress: true, undrawn: true },
  dress7: { name: 'girl 7 in a dress', h: 1.22, kind: 'child7', body: 'jade07', skin: 0xe9c0a0, hair: 0x231a14, top: 0xf2a7b8, legs: 0xe9c0a0, sock: 0xf4f2ee, hairStyle: 'pigtails', sleeves: 'short', dress: true },
  tights7: { name: 'girl 7 in a dress and tights', h: 1.22, kind: 'child7', body: 'jade07', skin: 0xe9c0a0, hair: 0x231a14, top: 0xf2a7b8, legs: 0x3a3a60, sock: 0x3a3a60, hairStyle: 'pigtails', sleeves: 'short', dress: true, tights: true } });
SHOTS.push({ id: 'dress_legs', lens: 35, pos: [0, 0.9, 4.2], target: [0, 0.6, 0], header: 'dresses: bare legs below the hem',
  figs: { daughter: { at: [-1.2, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' }, dressW: { at: [-0.4, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' }, dress7: { at: [0.4, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' }, tights7: { at: [1.1, 0], legs: 'seat', legOpts: { seatH: 0.33 }, yaw: -30, L: 'side', R: 'side' } } });
SHOTS.push({ id: 'dress_hem_w', lens: 50, pos: [-0.4, 0.75, 1.3], target: [-0.4, 0.75, 0], header: 'dress hem close (woman)', figs: { dressW: { at: [-0.4, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' } } },
  { id: 'dress_hem_d', lens: 50, pos: [-1.2, 0.5, 1.0], target: [-1.2, 0.45, 0], header: 'dress hem close (daughter)', figs: { daughter: { at: [-1.2, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' } } });
SHOTS.push({ id: 'dress_hem_w_nude', lens: 50, pos: [-0.4, 0.75, 1.3], target: [-0.4, 0.75, 0], header: 'dress hem (woman), body alone', figs: { dressW: { at: [-0.4, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side', debugBody: 'nude' } } },
  { id: 'dress_hem_w_garm', lens: 50, pos: [-0.4, 0.75, 1.3], target: [-0.4, 0.75, 0], header: 'dress hem (woman), garments alone', figs: { dressW: { at: [-0.4, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side', debugBody: 'garment' } } });
// r5: per-leg foot direction (legOpts footL / footR, body-local, x mirrored for R): the left foot dangling forward, the right folded back
SHOTS.push({ id: 'foot_dirs', lens: 35, pos: [2.2, 0.8, 1.2], target: [0, 0.4, 0], header: 'legOpts footL / footR', figs: { jade7: { at: [0, 0], legs: 'seat', legOpts: { seatH: 0.5, ankleL: [0.07, -0.33, 0.3], ankleR: [0.07, -0.3, -0.05], footL: [0, -0.4, 1], footR: [0, -0.5, -1] }, yaw: 0, L: 'lap', R: 'lap' } } });
