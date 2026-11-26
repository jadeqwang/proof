// Opt-in "real" torso for buildFigure (2026-11-26, closet02 round 3: Jade asked for realistic torsos so the guides do
// not confuse the image models). Enabled per figure with  torso: 'real', sex: 'f' | 'm'  in the figure spec; without
// it buildFigure builds the old swept capsule exactly as before (no other set changes).
//
// The same spine frame as the default torso (pelvis frame at the bottom, chest frame at the top), but a clothed
// body's cross-sections instead of one superellipse: separate front and back depths per height, a narrower waist,
// hips (wider for her), a ribcage, a bust under a sweater (her: the cloth tents from the bust down instead of
// following the underside) or a flat pectoral shelf (him), shoulder blades and a shallow spine groove at the back.
// Measurements behind the rows (half sizes, fractions of height H), slim adults:
//   her (1.63): hips ~92 cm, waist ~68, under-bust ~72, bust ~86, chest breadth at the armpits ~29 cm
//   him (1.78, lean): chest ~94, waist ~80, chest breadth ~34 cm (with the lats)
// t: 0 at the hip joints, 1 at the shoulder line (waist ~0.35, under-bust ~0.55, bust / nipple line ~0.66, armpit ~0.8).
import * as THREE from 'three';
import { gridGeo, keyed } from './anatomy.js';

const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
const angd = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
const FRONT = Math.PI / 2, BACK = -Math.PI / 2;

// rows [t, halfWidth, frontDepth, backDepth, superellipse exponent]
const ROWS = {
  f: [[0, 0.104, 0.056, 0.066, 0.82], [0.15, 0.098, 0.060, 0.058, 0.82], [0.35, 0.078, 0.058, 0.046, 0.8], [0.55, 0.083, 0.062, 0.060, 0.76],
    [0.68, 0.088, 0.062, 0.066, 0.74], [0.8, 0.091, 0.058, 0.068, 0.72], [0.92, 0.091, 0.054, 0.064, 0.72], [1, 0.080, 0.044, 0.052, 0.75]],
  m: [[0, 0.094, 0.056, 0.062, 0.8], [0.15, 0.089, 0.058, 0.054, 0.8], [0.35, 0.083, 0.060, 0.050, 0.78], [0.55, 0.089, 0.066, 0.062, 0.74],
    [0.70, 0.096, 0.068, 0.070, 0.7], [0.82, 0.100, 0.064, 0.072, 0.68], [0.92, 0.100, 0.058, 0.068, 0.7], [1, 0.088, 0.046, 0.054, 0.75]],
};
// bumps: radial displacement (fraction of H) = amp * exp(-(dt/st)^2 - (dv/sv)^2); st is [below, above] the centre
const BUMPS = {
  f: [
    { t: 0.66, st: [0.13, 0.08], v: FRONT + 0.42, sv: 0.36, amp: 0.030 }, { t: 0.66, st: [0.13, 0.08], v: FRONT - 0.42, sv: 0.36, amp: 0.030 },   // bust, sweater tenting below
    { t: 0.62, st: [0.10, 0.06], v: FRONT, sv: 0.30, amp: 0.010 },                                          // the cloth bridging between
    { t: 0.78, st: [0.09, 0.09], v: BACK + 0.62, sv: 0.32, amp: 0.008 }, { t: 0.78, st: [0.09, 0.09], v: BACK - 0.62, sv: 0.32, amp: 0.008 },   // shoulder blades
    { t: 0.08, st: [0.10, 0.12], v: BACK, sv: 0.7, amp: 0.010 },                                             // the seat (top of the buttocks)
  ],
  m: [
    { t: 0.73, st: [0.05, 0.12], v: FRONT + 0.48, sv: 0.46, amp: 0.010 }, { t: 0.73, st: [0.05, 0.12], v: FRONT - 0.48, sv: 0.46, amp: 0.010 },   // pectoral shelf
    { t: 0.79, st: [0.10, 0.09], v: BACK + 0.64, sv: 0.34, amp: 0.011 }, { t: 0.79, st: [0.10, 0.09], v: BACK - 0.64, sv: 0.34, amp: 0.011 },   // shoulder blades
    { t: 0.72, st: [0.14, 0.10], v: 0, sv: 0.30, amp: 0.006 }, { t: 0.72, st: [0.14, 0.10], v: Math.PI, sv: 0.30, amp: 0.006 },          // lats under the arms
    { t: 0.06, st: [0.10, 0.10], v: BACK, sv: 0.7, amp: 0.008 },
  ],
};
const TOP = 1.07;   // top of the surface in t (1 = the shoulder line)
const GROOVE = { t0: 0.25, t1: 0.92, sv: 0.11, amp: -0.0045 };   // the spine's groove down the back

// frame(t) -> { o, x, z } as in buildFigure; kw / kd scale widths / depths (H for a standard adult)
export function realTorso(frame, { sex = 'f', H, kw = H, kd = H, nu = 34, nv = 44, e1 = 0.5 } = {}) {
  const rows = ROWS[sex], bumps = BUMPS[sex]; if (!rows) throw new Error("torso: 'real' needs sex 'f' or 'm'");
  const disp = (t, v) => {
    let d = 0;
    for (const b of bumps) { const dt = t - b.t, st = dt < 0 ? b.st[0] : b.st[1], dv = angd(v, b.v); d += b.amp * Math.exp(-((dt / st) ** 2) - (dv / b.sv) ** 2); }
    const g = THREE.MathUtils.smoothstep(t, GROOVE.t0, GROOVE.t0 + 0.12) * (1 - THREE.MathUtils.smoothstep(t, GROOVE.t1 - 0.1, GROOVE.t1));
    d += GROOVE.amp * g * Math.exp(-((angd(v, BACK) / GROOVE.sv) ** 2));
    return d * H;
  };
  const at = (t, v, c) => {
    const [hw0, hf, hb, e2] = keyed(rows, t), hw = hw0 * kw, hd = (hb + (hf - hb) * THREE.MathUtils.smoothstep(Math.sin(v), -0.55, 0.55)) * kd;
    const X = spow(Math.cos(v), e2), Z = spow(Math.sin(v), e2), F = frame(t);
    const lx = c * hw * X, lz = c * hd * Z, r = Math.hypot(lx, lz), d = c * disp(t, v);
    const k = r > 1e-9 ? (r + d) / r : 1;
    return F.o.clone().addScaledVector(F.x, lx * k).addScaledVector(F.z, lz * k);
  };
  // the surface runs a little past the shoulder line (t to TOP) so its rounded top fills up under the clavicles
  const geo = gridGeo((u, v) => { const Y = spow(Math.sin(u), e1), c = spow(Math.cos(u), e1); return at((Y + 1) / 2 * TOP, v, c); }, nu, nv);
  // profile for sweptPoint (clavicles, armpit folds): half width and the front depth
  const prof = rows.map((r) => [r[0], r[1] * kw, r[2] * kd]);
  return { geo, prof };
}
// pelvis ellipsoid radii (fractions of H) for the real torso: her hips wider than the default ball
export const REAL_PELVIS = { f: [0.106, 0.074, 0.074], m: [0.096, 0.072, 0.07] };
