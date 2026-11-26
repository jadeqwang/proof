// bodytest shots: hands (grip / point / relax / pinch) close, arm poses, the whole cast line-up (front and back).
import '../_cast.js';
const HANDS = { L: { to: 'self:shoulderL', off: [0.05, -0.15, 0.4], hand: 'grip', palm: 'in', fingers: 'fwd' }, R: { to: 'self:shoulderR', off: [-0.05, -0.1, 0.42], hand: 'point', palm: 'down' } };
const HANDS2 = { L: { to: 'self:chest', off: [0.12, -0.1, 0.22], hand: 'pinch', palm: 'down', fingers: 'fwd' }, R: { to: 'self:chest', off: [-0.12, -0.12, 0.25], hand: 'relax', palm: 'up' } };
const CASTF = ['mama', 'dad', 'jade27', 'jade19', 'jade10', 'jade7', 'littleJade', 'jade3', 'firstLove27', 'firstLove19'];
export const SHOTS = [
  ...[['fl_sheet_back', 180], ['fl_sheet_q3l', 140], ['fl_sheet_q3r', 220]].map(([id, az]) => ({ id, lens: 50, orbit: { at: 'firstLove27:head', rel: 'firstLove27', az, el: 3, dist: 0.8, off: [0, -0.08, 0] }, figs: { firstLove27: { at: [0, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side' } }, header: 'first love: compare with cast/first_love/fl_B_backhead_neck_v7' })),
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
