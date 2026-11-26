// Articulated hands (2026-11-25): five fingers, each with three phalanges and real MCP / PIP / DIP joints, and a thumb
// with CMC (metacarpal swing), MCP and IP joints. Hand shapes are joint angles; a shot may override any of them.
//
// Hand frame (unchanged from the old mitt hands, so every existing pose lands the same): origin = wrist joint centre,
// x = thumb side, y = fingers, z = palm normal (out of the palm; fingers curl toward +z). Units: hand length Lh (wrist
// joint centre to the tip of the middle finger). The palm centre (the arm's `to` target, anchor handL/R) is (0, 0.26, 0).
//
// A hand shape:
//   curl   { index, middle, ring, little }: [MCP, PIP, DIP] flexion in degrees (+ = toward the palm, - = hyperextended)
//   spread degrees: fingers fan apart about the palm normal (index toward the thumb, little away), 0 = together
//   fan    optional per-finger extra abduction { index: deg, ... } (+ = toward the thumb)
//   thumb  { opp, sweep, abd, mcp, ip, touch }
//          opp   0..1 opposition: 0 = lying beside the index in the palm plane, 0.5 = half out in front (rest),
//                1 = swung in front of the palm facing the finger pads. Sets the metacarpal's sweep / abd and the plane
//                the thumb flexes in; `sweep` (deg, in the palm plane, from the finger axis toward the thumb side) and
//                `abd` (deg, palmar abduction, out of the palm plane) override the metacarpal direction it gives.
//          mcp, ip  flexion of the thumb's two hinge joints (deg; + curls the thumb across / in front of the palm)
//          touch 'index' | 'middle' | 'ring' | 'little': solve the thumb (sweep, abd, mcp, ip, starting from the
//                shape's values) so its pad meets that fingertip's pad (pinch, ring); '<finger>.mid' | '.prox': lay
//                the thumb pad on the back of that curled phalanx (grip, fist, point, two)
// Held object (any arm): hold: { r, h, label } puts a cylinder of radius r (metres) across the palm (axis = thumb
// side) and wraps the fingers and thumb round it (a cup: fingers 'fwd', palm 'in' stands it upright).
// Per-shot override (any arm): hand: { shape: 'grip', curl: { index: [10, 20, 10] }, spread: 5, thumb: { opp: 0.6 } }
//   curl may also be { all: [m, p, d] }, or a finger may be given one number (= [n, n, 0.7 n]).
import * as THREE from 'three';
import { basisQ, rad } from './core.js';
import { taperGeo, palmGeo, partMesh } from './anatomy.js';

export const FINGERS = ['index', 'middle', 'ring', 'little'];

export const HANDS = {
  flat: { curl: { index: [0, 0, 0], middle: [0, 0, 0], ring: [0, 0, 0], little: [0, 0, 0] }, spread: 1, thumb: { opp: 0, sweep: 24, abd: 4, mcp: 2, ip: 0 } },
  relax: { curl: { index: [16, 22, 10], middle: [22, 30, 14], ring: [26, 36, 16], little: [30, 40, 18] }, spread: 4, thumb: { opp: 0.45, mcp: 14, ip: 14 } },
  palmUp: { curl: { index: [6, 8, 4], middle: [9, 12, 6], ring: [12, 15, 8], little: [15, 18, 10] }, spread: 7, thumb: { opp: 0.15, sweep: 44, abd: 14, mcp: 4, ip: 4 } },
  cup: { curl: { index: [30, 28, 12], middle: [32, 30, 12], ring: [34, 32, 14], little: [36, 34, 16] }, spread: 0, thumb: { opp: 0.55, mcp: 14, ip: 10 } },
  grip: { curl: { index: [58, 88, 46], middle: [64, 92, 48], ring: [68, 94, 50], little: [72, 96, 50] }, spread: 0, thumb: { opp: 0.8, mcp: 22, ip: 20, touch: 'index.mid' } },
  pinch: { curl: { index: [36, 52, 22], middle: [52, 70, 36], ring: [60, 78, 42], little: [66, 84, 46] }, spread: 0, thumb: { opp: 0.8, mcp: 12, ip: 10, touch: 'index' } },
  point: { curl: { index: [0, 0, 0], middle: [86, 100, 60], ring: [90, 100, 60], little: [92, 100, 60] }, spread: 0, thumb: { opp: 0.7, mcp: 30, ip: 20, touch: 'middle.mid' } },
  fist: { curl: { index: [86, 100, 62], middle: [90, 100, 64], ring: [92, 100, 64], little: [94, 100, 64] }, spread: 0, thumb: { opp: 0.7, mcp: 30, ip: 20, touch: 'middle.mid' } },
  // finger ring (the shadow-play ring / OK sign): index curled round to the thumb tip, the others open
  ring: { curl: { index: [38, 78, 48], middle: [8, 10, 5], ring: [10, 12, 6], little: [12, 14, 8] }, spread: 6, thumb: { opp: 0.85, mcp: 10, ip: 10, touch: 'index' } },
  // the flashlight switch: fingers round the barrel, thumb straight along it, on the switch
  switch: { curl: { index: [78, 82, 40], middle: [82, 84, 42], ring: [84, 86, 44], little: [86, 88, 44] }, spread: 0, thumb: { opp: 0, sweep: 30, abd: 14, mcp: -4, ip: -6 } },
  // hand-shadow monkey: head in profile (index up = ear, fingers bent = brow and snout, thumb out = jaw)
  monkeyHead: { curl: { index: [-5, 0, 0], middle: [52, 68, 40], ring: [56, 72, 42], little: [58, 74, 44] }, spread: -6, thumb: { opp: 1, sweep: 6, abd: 64, mcp: 0, ip: -8 } },
  // the second hand: a raised paw / arm under the jaw
  monkeyPaw: { curl: { index: [10, 20, 10], middle: [20, 30, 15], ring: [22, 32, 16], little: [24, 34, 18] }, spread: 14, thumb: { opp: 0, sweep: 46, abd: 6, mcp: 0, ip: 0 } },
  // index + middle extended together (sword-hand, the counting hand), ring + little curled, thumb over them
  two: { curl: { index: [0, 2, 0], middle: [0, 2, 0], ring: [90, 100, 62], little: [92, 100, 62] }, spread: 1, thumb: { opp: 0.7, mcp: 30, ip: 20, touch: 'ring.mid' } },
  thumbsUp: { curl: { index: [88, 100, 62], middle: [90, 100, 64], ring: [92, 100, 64], little: [94, 100, 64] }, spread: 0, thumb: { opp: 0, sweep: 14, abd: 10, mcp: 0, ip: -6 } },
};

// geometry, units of hand length (adult); children get rounder fingers and a broader palm (handProfile)
export const HAND_GEOM = {
  mcp: { index: [0.155, 0.5, 0], middle: [0.05, 0.515, 0], ring: [-0.05, 0.5, 0], little: [-0.142, 0.462, 0] },   // knuckle joint centres
  len: { index: 0.42, middle: 0.455, ring: 0.43, little: 0.345 },          // MCP joint to fingertip centre
  seg: [0.47, 0.3, 0.23],                                                  // proximal / middle / distal share of that
  fan: { index: 1, middle: 0.3, ring: -0.35, little: -1 },                 // how each finger takes `spread`
  fan0: { index: 0, middle: 0, ring: -1, little: -4 },                     // resting fan (deg)
  rad: { index: [0.055, 0.05, 0.045, 0.04], middle: [0.057, 0.052, 0.046, 0.041], ring: [0.053, 0.048, 0.043, 0.039], little: [0.047, 0.042, 0.038, 0.035] },
  cmc: [0.125, 0.085, 0.03], tlen: [0.25, 0.15, 0.11], trad: [0.095, 0.066, 0.058, 0.05],   // thumb: CMC, segment lengths, radii
  palm: { y0: -0.035, y1: 0.55, w0: 0.15, w1: 0.215, t0: 0.078, t1: 0.06, xc: 0.006, slant: 0.045 },
};
// opposition -> thumb metacarpal direction (sweep, abd) and the direction the thumb flexes toward
const OPP = [[0, 28, 8], [0.5, 40, 40], [1, 15, 72]];
const FLEX0 = new THREE.Vector3(-1, 0.1, 0.45), FLEX1 = new THREE.Vector3(-0.55, 0.3, 0.8);

export function ageOf(kind) { const m = /child(\d+)/.exec(kind || ''); return m ? +m[1] : 18; }
export function handProfile(kind) {
  const a = Math.min(16, ageOf(kind)), k = (16 - a) / 13;   // 0 adult .. 1 at age 3
  return { fing: 1 + 0.14 * k, palmW: 1 + 0.06 * k, palmT: 1 + 0.08 * k };
}

const clone = (o) => JSON.parse(JSON.stringify(o));
// old two-segment shapes ({ mitt, idx, mid, spread, thumb: [[..],[..]] }) still resolve, approximately
function normShape(sh) {
  if (sh.curl) return sh;
  const m = sh.mitt || [25, 25], i = sh.idx || m, md = sh.mid || m;
  return { curl: { index: [i[0], i[1], i[1] * 0.75], middle: [md[0], md[1], md[1] * 0.75], ring: [m[0], m[1], m[1] * 0.75], little: [m[0], m[1], m[1] * 0.75] }, spread: sh.spread || 0, thumb: { opp: 0.5, mcp: 10, ip: 10 } };
}
// a hand spec (shape name, or { shape, curl, spread, fan, thumb }) -> full pose
export function resolveHand(h) {
  const name = !h ? 'relax' : typeof h === 'string' ? h : (h.shape || 'relax');
  const pose = clone(normShape(HANDS[name] || HANDS.relax)); pose.name = name; pose.fan = pose.fan || {};
  if (h && typeof h === 'object') {
    const asArr = (v) => (Array.isArray(v) ? v.slice() : [v, v, v * 0.7]);
    if (h.curl != null) {
      if (typeof h.curl === 'number' || Array.isArray(h.curl)) for (const f of FINGERS) pose.curl[f] = asArr(h.curl);
      else { if (h.curl.all != null) for (const f of FINGERS) pose.curl[f] = asArr(h.curl.all); for (const f of FINGERS) if (h.curl[f] != null) pose.curl[f] = asArr(h.curl[f]); }
    }
    if (h.spread != null) pose.spread = h.spread;
    if (h.fan) pose.fan = { ...pose.fan, ...h.fan };
    if (h.thumb) { pose.thumb = { ...pose.thumb, ...h.thumb }; if (h.thumb.opp != null && h.thumb.sweep == null) delete pose.thumb.sweep; if (h.thumb.opp != null && h.thumb.abd == null) delete pose.thumb.abd; }
    pose.custom = true;
  }
  return pose;
}

// ---------------------------------------------------------------- kinematics (hand units)
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
export function fingerChain(f, pose, G = HAND_GEOM) {
  const sp = rad((pose.spread || 0) * G.fan[f] + G.fan0[f] + (pose.fan?.[f] || 0));
  const d0 = new THREE.Vector3(Math.sin(sp), Math.cos(sp), 0), z = new THREE.Vector3(0, 0, 1);
  const c = pose.curl[f] || [0, 0, 0]; let a = 0; const pts = [v3(G.mcp[f])], pads = [];
  for (let k = 0; k < 3; k++) { a += rad(c[k] || 0); pts.push(pts[k].clone().addScaledVector(d0.clone().multiplyScalar(Math.cos(a)).addScaledVector(z, Math.sin(a)), G.len[f] * G.seg[k]));
    pads.push(d0.clone().multiplyScalar(-Math.sin(a)).addScaledVector(z, Math.cos(a))); }   // palmar side of each phalanx
  return { pts, pad: pads[2], pads };
}
function oppAngles(o) {
  o = THREE.MathUtils.clamp(o ?? 0.5, 0, 1); let i = 0; while (i < OPP.length - 2 && o > OPP[i + 1][0]) i++;
  const [a0, s0, b0] = OPP[i], [a1, s1, b1] = OPP[i + 1], t = (o - a0) / (a1 - a0);
  return [s0 + (s1 - s0) * t, b0 + (b1 - b0) * t];
}
export function thumbChain(th, G = HAND_GEOM) {
  const [s0, b0] = oppAngles(th.opp); const sw = rad(th.sweep ?? s0), ab = rad(th.abd ?? b0);
  const m = new THREE.Vector3(Math.sin(sw) * Math.cos(ab), Math.cos(sw) * Math.cos(ab), Math.sin(ab));
  const o = THREE.MathUtils.clamp(th.opp ?? 0.5, 0, 1);
  const c = FLEX0.clone().lerp(FLEX1, o); c.addScaledVector(m, -c.dot(m)).normalize();
  const pts = [v3(G.cmc)]; pts.push(pts[0].clone().addScaledVector(m, G.tlen[0]));
  let a = 0; for (let k = 1; k < 3; k++) { a += rad(k === 1 ? th.mcp || 0 : th.ip || 0); pts.push(pts[k].clone().addScaledVector(m.clone().multiplyScalar(Math.cos(a)).addScaledVector(c, Math.sin(a)), G.tlen[k])); }
  const pad = m.clone().multiplyScalar(-Math.sin(a)).addScaledVector(c, Math.cos(a));
  return { pts, pad };
}
// thumb pad onto a fingertip pad: small pattern search over (sweep, abd, mcp, ip) from the shape's own values
// touch: '<finger>' = pad to that fingertip's pad; '<finger>.mid' | '<finger>.prox' = the thumb pad laid on the back
// of that phalanx (a fist's thumb over the curled fingers)
function solveTouch(pose, G, fing) {
  const th = pose.thumb, [f, seg = 'tip'] = String(th.touch).split('.'); const fc = fingerChain(f, pose, G);
  const k = { prox: 0, mid: 1, tip: 2 }[seg] ?? 2;
  let goal;
  if (k === 2) goal = fc.pts[3].clone().addScaledVector(fc.pad, 0.92 * (G.rad[f][3] + G.trad[3]) * fing);
  else goal = fc.pts[k].clone().lerp(fc.pts[k + 1], 0.55).addScaledVector(fc.pads[k], -0.95 * (G.rad[f][k + 1] + G.trad[3]) * fing);
  const [s0, b0] = oppAngles(th.opp);
  let x = [th.sweep ?? s0, th.abd ?? b0, th.mcp ?? 10, th.ip ?? 10]; const x0 = x.slice();
  const lo = [-25, -10, -15, -20], hi = [80, 95, 75, 95];
  const cost = (v) => { const p = thumbChain({ ...th, sweep: v[0], abd: v[1], mcp: v[2], ip: v[3] }, G).pts[3];
    let c = p.distanceToSquared(goal) * 400; for (let k = 0; k < 4; k++) c += ((v[k] - x0[k]) / 60) ** 2 * 0.05; return c; };
  let best = cost(x);
  for (let step = 16; step >= 0.25; step /= 2) {
    let improved = true;
    while (improved) { improved = false;
      for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { const y = x.slice(); y[k] = THREE.MathUtils.clamp(y[k] + s * step, lo[k], hi[k]); const c = cost(y); if (c < best - 1e-9) { best = c; x = y; improved = true; } } }
  }
  const out = { ...th, sweep: x[0], abd: x[1], mcp: x[2], ip: x[3] };
  out.touchErr = +thumbChain(out, G).pts[3].distanceTo(goal).toFixed(4);
  return out;
}

// wrap the fingers round a cylinder held across the palm (axis along x = the thumb axis), centre (cy, cz) in the
// finger plane, radius R (hand units): each phalanx becomes a chord of the circle the finger's axis runs on
function wrapPose(pose, G, R, fing) {
  const cy = 0.38, cz = (G.palm.t1 + 0.004) + R; const out = { ...pose, curl: { ...pose.curl } };
  for (const f of FINGERS) {
    const rho = R + G.rad[f][1] * fing, B = { y: G.mcp[f][1], z: 0 }, L = G.seg.map((k) => G.len[f] * k);
    const dist = (a) => Math.hypot(B.y + L[0] * Math.cos(a) - cy, B.z + L[0] * Math.sin(a) - cz);
    let a1 = 0; for (let a = 0; a <= Math.PI * 0.75; a += 0.01) { a1 = a; if (dist(a) <= rho) break; }
    let p = { y: B.y + L[0] * Math.cos(a1), z: B.z + L[0] * Math.sin(a1) }, phi = Math.atan2(p.z - cz, p.y - cy);
    const sg = (-Math.sin(phi) * Math.cos(a1) + Math.cos(phi) * Math.sin(a1)) >= 0 ? 1 : -1;   // turn the way the finger is going
    const ang = [a1];
    for (let k = 1; k < 3; k++) { const d = 2 * Math.asin(Math.min(1, L[k] / (2 * rho))); const phi2 = phi + sg * d;
      const q = { y: cy + rho * Math.cos(phi2), z: cz + rho * Math.sin(phi2) }; ang.push(Math.atan2(q.z - p.z, q.y - p.y)); p = q; phi = phi2; }
    const deg = (x) => x * 180 / Math.PI; let c1 = deg(ang[0]), c2 = deg(ang[1] - ang[0]), c3 = deg(ang[2] - ang[1]);
    const n = (x) => ((x + 540) % 360) - 180; c2 = n(c2); c3 = n(c3);
    out.curl[f] = [THREE.MathUtils.clamp(c1, 0, 100), THREE.MathUtils.clamp(c2, 0, 110), THREE.MathUtils.clamp(c3, 0, 90)];
  }
  // the thumb round the far side, its pad on the cylinder a little past the front
  const rt = R + G.trad[2] * fing, th = 0.6;
  out.thumb = { ...pose.thumb, touch: null, goal: [0.24, cy - rt * Math.sin(th), cz + rt * Math.cos(th)] };
  out.hold = { cy, cz, R };
  return out;
}
function solveGoal(pose, G, goal) {
  const th = pose.thumb, [s0, b0] = oppAngles(th.opp); let x = [th.sweep ?? s0, th.abd ?? b0, th.mcp ?? 10, th.ip ?? 10]; const x0 = x.slice();
  const lo = [-25, -10, -15, -20], hi = [80, 95, 75, 95], g = v3(goal);
  const cost = (v) => { const p = thumbChain({ ...th, sweep: v[0], abd: v[1], mcp: v[2], ip: v[3] }, G).pts[3]; let c = p.distanceToSquared(g) * 400; for (let k = 0; k < 4; k++) c += ((v[k] - x0[k]) / 60) ** 2 * 0.05; return c; };
  let best = cost(x);
  for (let step = 16; step >= 0.25; step /= 2) { let imp = true; while (imp) { imp = false; for (let k = 0; k < 4; k++) for (const sgn of [-1, 1]) { const y = x.slice(); y[k] = THREE.MathUtils.clamp(y[k] + sgn * step, lo[k], hi[k]); const c = cost(y); if (c < best - 1e-9) { best = c; x = y; imp = true; } } } }
  return { ...th, sweep: x[0], abd: x[1], mcp: x[2], ip: x[3] };
}

// a fingertip in hand units for a hand spec (thumb contact solved): arm `tip` placement uses it
export function tipLocal(spec, kind, finger) {
  let pose = resolveHand(spec); const pf = handProfile(kind);
  if (pose.thumb.touch) pose = { ...pose, thumb: solveTouch(pose, HAND_GEOM, pf.fing) };
  return finger === 'thumb' ? thumbChain(pose.thumb, HAND_GEOM).pts[3] : fingerChain(finger, pose, HAND_GEOM).pts[3];
}

// ---------------------------------------------------------------- the hand frame (exact for left hands)
// A RIGHT hand's (t, f, n) is a rotation; a LEFT hand's is its mirror image (t = n x f, determinant -1), which no
// quaternion can represent, so points and directions are mapped with the basis vectors themselves.
// q is kept for callers that want an orientation (the proper rotation with the thumb axis flipped for a left hand).
export function handFrame(t, f, n, Lh, wrist) {
  const M = (x, y, z) => new THREE.Vector3().addScaledVector(t, x).addScaledVector(f, y).addScaledVector(n, z);
  const L = (x, y, z) => M(x * Lh, y * Lh, z * Lh).add(wrist);
  const Ld = (v) => { const u = new THREE.Vector3(...v).normalize(); return M(u.x, u.y, u.z); };
  const q = basisQ(t.clone().multiplyScalar(t.clone().cross(f).dot(n) < 0 ? -1 : 1), f, n);
  return { q, L, Ld };
}

// Build a hand into group g. side 'L' | 'R'; spec = shape name or override object; wrist = wrist joint centre (world);
// f, n = finger direction and palm normal (unit, orthogonal). opts: { kind, look, palmGroup, id (group key prefix),
// radial }. Returns { palm, t, q, tips: { index, middle, ring, little, thumb }, knuckles, pose, meshes }.
export function buildHand(side, Lh, spec, wrist, f, n, look, g, opts = {}) {
  let pose = resolveHand(spec);
  const t = side === 'R' ? new THREE.Vector3().crossVectors(f, n) : new THREE.Vector3().crossVectors(n, f); t.normalize();
  const { q, L } = handFrame(t, f, n, Lh, wrist);
  const pf = handProfile(opts.kind), G = HAND_GEOM, id = opts.id || ('hand' + side), rs = opts.radial || 12;
  if (opts.hold) { pose = wrapPose(pose, G, opts.hold / Lh, pf.fing); pose.thumb = solveGoal(pose, G, pose.thumb.goal); }
  else if (pose.thumb.touch) pose = { ...pose, thumb: solveTouch(pose, G, pf.fing) };
  const W = (p) => L(p.x, p.y, p.z);
  const out = { meshes: [], tips: {}, knuckles: {}, pose, capsules: [], joints: {} };   // capsules / joints: world data for engine/holdcheck.mjs and mesh adapters (no effect on the render)
  const add = (m) => { g.add(m); out.meshes.push(m); return m; };
  // palm (with the heel of the hand reaching back over the wrist joint)
  const P = G.palm;
  add(partMesh(palmGeo(L, { ...P, w0: P.w0 * pf.palmW, w1: P.w1 * pf.palmW, t0: P.t0 * pf.palmT, t1: P.t1 * pf.palmT }, { nu: 18, nv: 24 }), look, opts.palmGroup || id + '.palm'));
  // fingers: one mesh each (three phalanges, the joints are the shared spheres)
  for (const fn of FINGERS) {
    const { pts } = fingerChain(fn, pose, G); const r = G.rad[fn].map((x) => x * pf.fing * Lh); const w = pts.map(W);
    const geos = []; for (let k = 0; k < 3; k++) geos.push(taperGeo(w[k], w[k + 1], r[k], r[k + 1], { radial: rs, cap: 4 }));
    add(partMesh(geos, look, `${id}.${fn}`));
    for (let k = 0; k < 3; k++) out.capsules.push({ part: `${fn}${k + 1}`, a: w[k], b: w[k + 1], r: (r[k] + r[k + 1]) / 2 }); out.joints[fn] = w;
    out.capsules.push({ part: 'palm:' + fn, a: L(G.mcp[fn][0] * 0.8, 0.02, 0), b: w[0], r: P.t1 * pf.palmT * Lh * 0.9 });
    out.tips[fn] = w[3]; out.knuckles[fn] = w[0];
  }
  // thumb: metacarpal (its flesh is the thenar pad), proximal and distal phalanges
  { const { pts } = thumbChain(pose.thumb, G); const r = G.trad.map((x, k) => x * (k ? pf.fing : pf.palmT) * Lh); const w = pts.map(W);
    // the metacarpal (thenar) belongs to the palm's surface: the visible thumb starts at its MCP knuckle
    add(partMesh([taperGeo(w[0], w[1], r[0], r[1], { radial: rs, cap: 4 })], look, opts.palmGroup || id + '.palm'));
    add(partMesh([taperGeo(w[1], w[2], r[1] * 0.93, r[2], { radial: rs, cap: 4 }), taperGeo(w[2], w[3], r[2], r[3], { radial: rs, cap: 4 })], look, `${id}.thumb`));   // starts just inside the thenar's end: a clean knuckle line, no coincident surfaces
    out.tips.thumb = w[3]; out.knuckles.thumb = w[1];
    for (let k = 0; k < 3; k++) out.capsules.push({ part: `thumb${k}`, a: w[k], b: w[k + 1], r: (r[k] + r[k + 1]) / 2 }); out.joints.thumb = w; }
  out.palm = L(0, 0.26, 0); out.t = t; out.q = q;
  if (pose.hold) out.held = { centre: L(0, pose.hold.cy, pose.hold.cz), axis: t.clone(), r: pose.hold.R * Lh };
  out.indexTip = out.tips.index; out.thumbTip = out.tips.thumb;
  return out;
}
