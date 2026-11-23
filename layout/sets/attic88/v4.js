// ATTIC 1988, v4 fixed set (SETS team, preview_v4). One source of truth for every object that does not move between
// shots; docs/SETS_V4.md is written from these numbers. Room shell, window, blade sign, stair door and hook rail are the
// v3 ones (layout.js: ROOM, WINDOW, SIGN_V3, DOOR, HOOKS) and are not repeated here.
//
// v4 changes against the v3 model (decided from the preview_v3 frames, see docs/SETS_V4.md "Decisions"):
//   - the two sleeping mats run ALONG x, pillows at the window gable (every v3 frame A1 A2 B1 L2b L3 shows this; the
//     v3 model had them along z)
//   - ONE textbook stack (the v3 model had a 7-book pile by the pillows and a separate 9-book D9 stack), standing
//     beside little Jade's pillow in front of the window's near jamb, in two states: 'stack' (every shot before D9)
//     and 'fallen' (D9 c and every later attic shot), with fixed positions for each fallen book
//   - the lap storytime place moves with the mats: Mama on the foot half of little Jade's mat, facing into the room
import * as THREE from 'three';
import { box, cyl, ball, mk, tag, V, rad } from '../../engine/core.js';
import { coverBlanket } from '../../engine/props.js';
import { ROOM, WINDOW, bookT } from './layout.js';

export const MATS4 = {
  // pillow end = x1 (window gable)
  littleJade: { x0: 1.10, x1: 2.85, z0: -1.35, z1: -0.55, t: 0.06, label: 'sleeping mat (little Jade)' },
  mama: { x0: 0.95, x1: 2.90, z0: -2.30, z1: -1.40, t: 0.06, label: 'sleeping mat (Mama)' },
};
export const PILLOW4 = { w: 0.32, d: 0.5, t: 0.11, inset: 0.2 };            // w along x, d across the mat
export const QUILT_COL = { littleJade: 0x2a3150, mama: 0xb8a888 };          // navy floral cotton quilt / beige quilt
export const STACK4 = { at: [2.92, -0.30], n: 9, yaw: 8 };                  // 9 textbooks, 0.34 m tall
export const STACK_H = (() => { let h = 0; for (let k = 0; k < STACK4.n; k++) h += bookT(k); return h; })();
// the fall goes toward the D9 camera (into the room, toward the door end): unit vectors in plan
const FALL = [-0.87, 0.49], LAT = [0.49, 0.87];
// fallen state: [k (book index, 0 = bottom), along the fall (m), lateral (m), yaw (deg), lying on (book k or -1 = floor)]
export const FALLEN4 = [[0, 0.0, 0.0, 14, -1], [1, 0.03, 0.02, -22, 0], [2, 0.26, 0.09, 33, -1], [3, 0.43, -0.16, -48, -1], [4, 0.57, 0.22, 71, -1],
  [5, 0.72, -0.05, 17, -1], [6, 0.88, 0.30, -31, -1], [7, 0.98, -0.26, 56, -1], [8, 0.36, -0.34, 98, -1]];
export const fallenWorld = (k) => { const e = FALLEN4.find((f) => f[0] === k); return [STACK4.at[0] + FALL[0] * e[1] + LAT[0] * e[2], STACK4.at[1] + FALL[1] * e[1] + LAT[1] * e[2]]; };
export const FALL_DIR = FALL;
export const LAP4 = { base: [1.62, -0.92], yaw: -18, floor: 0.06 };
export const BOOK_REST4 = { at: [2.30, 0.001, -0.40], normal: [0, 1, 0], top: [1, 0, 0.3] };   // the closed storybook on the boards beside her pillow when not in hand
export const PIANO4 = { at: [0.85, 0.30], yaw: -8, w: 0.594, d: 0.21 };
// sleeping poses on the v4 mats (pelvis; head toward +x = the pillow)
export const LJ_LIE = { at: [2.13, 0.13, -0.95], legs: 'straight', pitch: -90, yaw: -90, spine: { bend: 6 }, head: {}, L: 'side', R: 'side' };
export const MAMA_LIE = { at: [2.02, 0.14, -1.85], legs: 'straight', pitch: -90, yaw: -90, spine: { bend: 4 }, head: { turn: 28 }, L: 'side', R: 'side', noApron: true };

const COLS = [0x3a5a7a, 0x7a3a2a, 0x4a6a3a, 0xa08a50];
const bookDims = (k) => ({ t: bookT(k), w: 0.2 + (k % 2) * 0.02, d: 0.27 - (k % 3) * 0.012, look: { grey: 0.3 + (k % 4) * 0.12, col: COLS[k % 4] } });

// textbooks in a state: 'stack' | 'topple' (D9 b: mid-fall) | 'fallen'
export function textbooks4(g, state) {
  const [x, z] = STACK4.at; let y = 0; const lbl = state === 'fallen' ? 'textbooks (fallen, scattered)' : state === 'topple' ? 'stack of textbooks (toppling)' : 'stack of textbooks';
  for (let k = 0; k < STACK4.n; k++) {
    const { t, w, d, look } = bookDims(k); let b;
    if (state === 'stack') { b = box(w, t, d, look, [x + ((k * 13) % 5 - 2) * 0.012, y + t / 2, z + ((k * 7) % 5 - 2) * 0.01]); b.rotation.y = rad(STACK4.yaw + ((k * 37) % 25) - 12); }
    else if (state === 'topple') { const s = Math.max(0, k - 2), off = 0.011 * s * s; b = box(w, t, d, look, [x + FALL[0] * off, y + t / 2 + 0.004 * s * s, z + FALL[1] * off]);
      b.rotation.set(rad(FALL[1] * 3.2 * s), rad(((k * 37) % 25) - 12), rad(FALL[0] * -3.2 * s), 'YXZ'); }
    else { const e = FALLEN4.find((f) => f[0] === k), [px, pz] = fallenWorld(k); const under = e[4] >= 0 ? bookDims(e[4]).t : 0; b = box(w, t, d, look, [px, under + t / 2 + 0.001, pz]); b.rotation.y = rad(e[3]); }
    g.add(tag(b, lbl)); y += t;
  }
}

// mats, pillows, quilts (quilts built by quilt4 per shot), textbooks, piano printout. TV, boxes, sacks, bulb: v1 props.
export function matsAndPillows(g) {
  for (const [who, M] of Object.entries(MATS4)) {
    g.add(tag(box(M.x1 - M.x0, M.t, M.z1 - M.z0, { grey: 0.8, col: 0x9a8f78 }, [(M.x0 + M.x1) / 2, M.t / 2, (M.z0 + M.z1) / 2]), M.label));
    const p = box(PILLOW4.w, PILLOW4.t, PILLOW4.d, { grey: 0.9, col: 0xd8d0c0 }, [M.x1 - PILLOW4.inset, M.t + PILLOW4.t / 2, (M.z0 + M.z1) / 2]); p.rotation.y = rad(who === 'mama' ? 4 : -5);
    g.add(tag(p, `pillow (${who === 'mama' ? 'Mama' : 'little Jade'})`));
  }
}
// quilt spec: { who, mode: 'flat' | 'aside' | 'folded' | 'pull' (over a lying figure, upTo) | 'sitting' (over her legs, she sits up at the pillow end) }
export function quilt4(spec, figs) {
  const M = MATS4[spec.who]; const Q = { grey: spec.who === 'mama' ? 0.7 : 0.4, col: QUILT_COL[spec.who] }; const lbl = spec.who === 'mama' ? "quilt (Mama's, beige)" : "quilt (little Jade's, navy floral)";
  const cz = (M.z0 + M.z1) / 2, W = M.z1 - M.z0, L = M.x1 - M.x0;
  if (spec.mode === 'pull' && figs[spec.who === 'mama' ? 'mama' : 'littleJade']) { const r = coverBlanket(figs[spec.who === 'mama' ? 'mama' : 'littleJade'].userData.P, M.t, Q, { upTo: spec.upTo ?? 0.8, halfW: spec.who === 'mama' ? 0.34 : 0.3 }); tag(r.group, lbl, true); return r; }
  if (spec.mode === 'folded') return { group: tag(box(0.42, 0.09, W - 0.08, Q, [M.x0 + 0.3, M.t + 0.045, cz]), lbl) };
  if (spec.mode === 'aside') { const m = box(0.36, 0.13, W - 0.06, Q, [M.x1 - 0.62, M.t + 0.065, cz + 0.02]); m.rotation.y = rad(-6); return { group: tag(m, lbl) }; }   // bunched below the pillow
  if (spec.mode === 'sitting') { const g = new THREE.Group(); g.add(box(L * 0.62, 0.05, W + 0.06, Q, [M.x0 + L * 0.31, M.t + 0.03, cz])); g.add(box(0.2, 0.12, W + 0.04, Q, [M.x0 + L * 0.62, M.t + 0.06, cz])); return { group: tag(g, lbl) }; }
  // flat: covering the lower two-thirds of the mat (feet end = x0)
  const g = new THREE.Group(); g.add(box(L * 0.64, 0.035, W + 0.06, Q, [M.x0 + L * 0.32, M.t + 0.018, cz])); g.add(box(0.16, 0.06, W + 0.04, Q, [M.x0 + L * 0.64, M.t + 0.03, cz]));
  return { group: tag(g, lbl) };
}
export function piano4(g) {
  const { at: [x, z], yaw, w, d } = PIANO4; const grp = new THREE.Group(); grp.position.set(x, 0.001, z); grp.rotation.y = rad(yaw);
  grp.add(box(w, 0.0008, d, { grey: 0.98, col: 0xf0ece0 }, [0, 0.0004, 0]));
  const n = 14, kw = w / n; for (let k = 1; k < n; k++) grp.add(box(0.0015, 0.0011, d * 0.96, { grey: 0.15, col: 0x222222 }, [-w / 2 + k * kw, 0.0006, 0]));
  for (const k of [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]) grp.add(box(kw * 0.6, 0.0012, d * 0.58, { grey: 0.08, col: 0x111111 }, [-w / 2 + (k + 1) * kw, 0.0007, -d * 0.21]));
  g.add(tag(grp, 'paper piano keys (printout)'));
}
// the attic's object list for the set bible / checker (label -> what it is, where)
export const OBJECTS4 = [
  ['window', 'the one window, right (east) gable, 0.8 x 0.8 m, sill 0.45, 2 x 2 dusty panes', [WINDOW.x, WINDOW.sill + WINDOW.h / 2, WINDOW.z]],
  ['neon blade sign (perpendicular to the wall)', 'red blade sign outside, 0.70 x 2.6 m, 0.18-0.88 m out from the wall in front of the far third of the window; 酒 家 / CHIN. IND. SPEC. REST.', [4.15, 0.2, -1.0]],
  ['stair door', 'stair door, left (west) gable, centred, 0.76 x 1.9 m, opens outward over the stairwell', [-3.5, 0.95, 0]],
  ['hook rail', 'rail of four hooks right of the stair door (seen from the room), 1.42 m high; apron on hook 2, towel on hook 3 from A3b on', [-3.5, 1.42, -0.85]],
  ['sleeping mat (little Jade)', '0.8 x 1.75 m, along x, pillow end at the window', [1.98, 0.03, -0.95]],
  ['sleeping mat (Mama)', '0.9 x 1.95 m, along x, beside it under the low slope, pillow end at the window', [1.93, 0.03, -1.85]],
  ['pillow (little Jade)', 'at the window end of her mat', [2.65, 0.12, -0.95]],
  ['pillow (Mama)', 'at the window end of her mat', [2.7, 0.12, -1.85]],
  ["quilt (little Jade's, navy floral)", 'navy cotton quilt with a small flower print', null],
  ["quilt (Mama's, beige)", 'beige cotton quilt, folded at the foot of her mat unless she sleeps', null],
  ['stack of textbooks', '9 school textbooks, 0.34 m, beside little Jade\'s pillow in front of the near window jamb; before D9 only', [2.92, 0.17, -0.3]],
  ['textbooks (fallen, scattered)', 'the same 9 books where they fell in D9, fanned toward the room; D9 c and every later attic shot', [2.5, 0.02, -0.06]],
  ['small TV (off) on a crate', 'small CRT TV on a wooden crate under the back slope', [0.28, 0.4, -2.2]],
  ['storage boxes', 'cardboard boxes in the back-left corner and one by the front eaves', [-2.5, 0.25, -2.3]],
  ['rice sacks', 'three rice sacks by the door end, front side', [-2.7, 0.2, 2.0]],
  ['paper piano keys (printout)', 'two taped A4 sheets with two octaves printed, on the boards', [0.85, 0, 0.3]],
  ['bare bulb (off)', 'bare bulb on its cord from the ridge, never lit', [0.4, 2.2, 0]],
  ['light through floorboard cracks', 'warm kitchen light up through the board gaps over the front-left half', [0.25, 0, 0.6]],
  ['rafters', 'rafters every 0.6 m, purlins at mid-slope, ridge beam, collar ties every second pair', null],
  ['knee wall', '0.9 m knee walls under both eaves', null],
];
