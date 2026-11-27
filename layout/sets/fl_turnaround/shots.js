// fl_turnaround: a 3D guide for first love's turnaround sheet (cast/first_love/_prompts/v10/takes/A_t2.jpg): the same
// five figures in the same order, so the painter draws real feet (five graduated toes) in real sandals. Faceless body
// (firstlove27.glb), never shown face-on: every view is from behind or a lost profile.
//   node layout/render.mjs --set fl_turnaround --modes form,contour,lit --nojson --w 3072 --h 1728 --out <scratch>
import { CAST, addCast } from '../_cast.js';
const FL = CAST.firstLove27;
// costume: heathered slate-blue long-sleeve tee, sleeves pushed up to below the elbow; plain black slacks (Jade
// 2026-11-26: "first love in black pants in every scene ... normal black slacks", replacing the indigo jeans of the A
// sheet); bare feet in brown two-strap cork-footbed sandals (sandal.js)
export const COSTUME = { top: 0x56667f, legs: 0x1b1b1e, sleeves: 'pushed', sock: FL.skin };
export const KEYS = ['firstLoveA', 'firstLoveB', 'firstLoveC', 'firstLoveD', 'firstLoveE'];
addCast(Object.fromEntries(KEYS.map((k, i) => [k, { ...FL, name: `first love (27), turnaround figure ${i + 1}`, body: 'firstlove27' }])));

// the five figures, left to right (yaw: 0 faces +z = toward the camera; 180 = straight back view)
const GAP = 0.68;   // centre to centre, as the sheet (~18 % of the frame width)
export const XS = KEYS.map((_, i) => (i - 2) * GAP);
const rad = (d) => d * Math.PI / 180;
// a point offset in the figure's own frame: x to his left, y up, z forward
const off = (yaw, [l, u, f]) => { const fx = Math.sin(rad(yaw)), fz = Math.cos(rad(yaw)); return [fz * l + fx * f, u, -fx * l + fz * f].map((v) => +v.toFixed(4)); };
// a hand in the front pocket of the slacks: the palm against the hip, fingers down into the pocket (seen from behind the
// elbow bends out a little and the hand disappears at the side seam, as in the sheet)
const front = (yaw, n) => ({ to: `self:hip${n}`, off: off(yaw, [(n === 'L' ? 1 : -1) * 0.065, -0.095, 0.035]), hand: 'relax', palm: 'in', fingers: 'down' });
// a hand in the back pocket: on the buttock, fingers down into the pocket, palm toward the body
const back = (yaw, n) => ({ to: `self:hip${n}`, off: off(yaw, [(n === 'L' ? 1 : -1) * 0.05, -0.06, -0.085]), hand: { shape: 'relax', spread: 0 }, palm: 'fwd', fingers: 'down' });
const FIG = [
  { yaw: 180, arms: (y) => ({ L: front(y, 'L'), R: front(y, 'R') }) },                       // 1 straight back view
  { yaw: -135, arms: (y) => ({ L: front(y, 'L'), R: front(y, 'R') }) },                      // 2 back three-quarter, turned to our left
  { yaw: 135, arms: (y) => ({ L: front(y, 'L'), R: front(y, 'R') }) },                       // 3 back three-quarter, turned to our right (the sheet's right hand reads as a back pocket; the engine hand would not go in one: front pocket)
  { yaw: 112, arms: (y) => ({ L: 'side', R: front(y, 'R') }) },                              // 4 lost profile facing right: the near arm is his RIGHT (the A prompt's 'left' does not fit the drawn sheet; matched to the sheet)
  { yaw: 140, head: { nod: 32, turn: -18 }, arms: () => ({ L: 'side', R: 'side' }) },        // 5 head bowed, to his right
];
export const FIGS = Object.fromEntries(KEYS.map((k, i) => { const F = FIG[i];
  return [k, { at: [XS[i], 0], legs: 'stand', yaw: F.yaw, costume: COSTUME, head: F.head || {}, ...F.arms(F.yaw) }]; }));

// camera: long lens, far back (nearly orthographic), a little above the hips, like the sheet
const LENS = 135, EL = 6;
const cam = (cx, ty, dist, lens = LENS, el = EL) => ({ lens, pos: [cx, +(ty + dist * Math.tan(rad(el))).toFixed(3), dist], target: [cx, ty, 0] });
export const SHOTS = [
  { id: 'A_guide', ...cam(0, 0.9, 14.2), header: 'first love turnaround guide (A sheet): five figures', logFit: true, figs: FIGS },
  // the feet close-ups: the same camera direction as A_guide (looking down ~9.6 deg at the floor), closer
  ...KEYS.map((k, i) => ({ id: `A_feet_${i + 1}`, ...cam(XS[i], 0.05, 1.75, 135, 9.6), header: `feet, figure ${i + 1}`, figs: FIGS })),
  ...KEYS.map((k, i) => ({ id: `A_barefeet_${i + 1}`, ...cam(XS[i], 0.05, 1.75, 135, 9.6), header: `bare feet (no sandals), figure ${i + 1}`, sandals: false, figs: FIGS })),
];
// toe check (feet only in frame): figure 1's feet from in front and above, bare and in the sandals
SHOTS.push({ id: 'toecheck_bare', lens: 135, pos: [XS[0], 1.0, -1.6], target: [XS[0], 0.03, -0.08], header: 'toe check, bare (feet only)', sandals: false, figs: FIGS },
  { id: 'toecheck_sandal', lens: 135, pos: [XS[0], 1.0, -1.6], target: [XS[0], 0.03, -0.08], header: 'toe check, sandals (feet only)', figs: FIGS });
