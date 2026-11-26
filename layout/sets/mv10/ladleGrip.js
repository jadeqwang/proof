// The ladle and the hand that holds it (V3b_prep, Jade r3 decisions 2026-11-26: "the hand should be holding the ladle in
// a realistic way in the three.js model or image models will be confused"). SET-LOCAL: engine/ is not edited; this uses
// the engine's articulated hand (engine/hand.js: real MCP / PIP / DIP joints) with joint angles solved here for this grip.
//
// r4 (2026-11-26 late, Jade: "Fist, thumb on top"): the hand-built ladle is replaced by the REAL model (props/ladle, a
// flat steel strip handle); the paragraph below describes the r3 solver's search, which is kept; only the fist grip with
// the thumb up the handle is searched now (LADLE_M, ladleGrip, ladleProp, partyLadlePose at the end of this file).
// The grip (the usual serving / stirring grip on a ladle): the handle lies OBLIQUELY across the palm, from the heel of the
// hand on the little-finger side to the base of the index finger, the bowl end leaving past the thumb; the four fingers
// curl round it from below; the THUMB lies along the TOP of the handle, pointing down it toward the bowl, its pad on the
// steel. The palm faces up and in (forearm half supinated), the wrist straight (the forearm runs along the hand's finger
// axis). The handle's hooked end sticks out past the heel of the hand.
//
// Hand frame (engine/hand.js): x = thumb side, y = fingers, z = out of the palm; units = hand length Lh. The handle is a
// cylinder through (0, y0, z = palm thickness + r) along d = (cos th, sin th, 0) (th = angle from the thumb axis toward
// the fingers): each finger wraps where the handle crosses its plane (the engine's wrap rule, per finger); the thumb is
// solved so its last two joints lie on the handle's top (+z) face, its tip toward the bowl.
import * as THREE from 'three';
import { HAND_GEOM, FINGERS, thumbChain, handProfile } from '../../engine/hand.js';
import { mk, cyl, tag, V } from '../../engine/core.js';
import { prop } from '../_props.js';

const D2R = Math.PI / 180;
// hold pass 2026-11-26 (Rapier check, engine/holdcheck.mjs): the ported wrap put the index / middle proximal phalanges
// ~1 cm inside the steel. Tuned against the check: CLEAR = the handle's clearance off the palm surface (hand units; was
// 0.004), WRAP_PAD = extra wrap radius (hand units), and per finger the MCP closed MCP_ADD deg less and the PIP opened
// PIP_OPEN deg into the DIP, so the fist closes ROUND the handle (pads within 2 mm, nothing over 3 mm in)
let THUMB_PRESS = 0, CLEAR = 0.07, WRAP_PAD = 0.0, PIP_OPEN = 6, MCP_ADD = -4;   // r4: PREP.ladle may override (clear, pipOpen, mcpAdd) for the real ladle's strip

// finger curls that wrap each finger round a cylinder of radius R (hand units) at (cy, cz): a port of the engine's
// (unexported) wrapPose, kept identical so the fist looks like every other engine grip
function wrapCurls(R, cy, cz, fing = 1, G = HAND_GEOM) {
  const out = {};
  for (const f of FINGERS) {
    const rho = R + G.rad[f][1] * fing, B = { y: G.mcp[f][1], z: 0 }, L = G.seg.map((k) => G.len[f] * k);
    const dist = (a) => Math.hypot(B.y + L[0] * Math.cos(a) - cy, B.z + L[0] * Math.sin(a) - cz);
    let a1 = 0; for (let a = 0; a <= Math.PI * 0.75; a += 0.01) { a1 = a; if (dist(a) <= rho) break; }
    let p = { y: B.y + L[0] * Math.cos(a1), z: B.z + L[0] * Math.sin(a1) }, phi = Math.atan2(p.z - cz, p.y - cy);
    const sg = (-Math.sin(phi) * Math.cos(a1) + Math.cos(phi) * Math.sin(a1)) >= 0 ? 1 : -1;
    const ang = [a1];
    for (let k = 1; k < 3; k++) { const d = 2 * Math.asin(Math.min(1, L[k] / (2 * rho))); const phi2 = phi + sg * d;
      const q = { y: cy + rho * Math.cos(phi2), z: cz + rho * Math.sin(phi2) }; ang.push(Math.atan2(q.z - p.z, q.y - p.y)); p = q; phi = phi2; }
    const deg = (x) => x / D2R, n = (x) => ((x + 540) % 360) - 180;
    out[f] = [THREE.MathUtils.clamp(deg(ang[0]), 0, 100), THREE.MathUtils.clamp(n(deg(ang[1] - ang[0])), 0, 110), THREE.MathUtils.clamp(n(deg(ang[2] - ang[1])), 0, 90)].map((v) => +v.toFixed(1));
  }
  return out;
}

// thumb angles (sweep, abd, mcp, ip) so the IP joint and the tip both lie on one face of the handle, the tip further
// toward the bowl: the thumb laid along the handle. Pattern search, as the engine's own thumb solver; joints kept out of
// the handle.
function solveThumb(goals, line, opp = 0.6, G = HAND_GEOM) {
  const gT = new THREE.Vector3(...goals.tip), gI = new THREE.Vector3(...goals.ip), Q0 = new THREE.Vector3(...line.at), d = new THREE.Vector3(...line.dir).normalize();
  const off = (p) => { const v = p.clone().sub(Q0); return v.addScaledVector(d, -v.dot(d)).length(); };
  let x = [20, 30, 10, 5]; const lo = [-25, -10, -25, -30], hi = [80, 95, 75, 95];
  const cost = (v) => { const ch = thumbChain({ opp, sweep: v[0], abd: v[1], mcp: v[2], ip: v[3] }, G);
    let c = ch.pts[3].distanceToSquared(gT) * 400 + ch.pts[2].distanceToSquared(gI) * 200;
    for (let k = 1; k < 4; k++) c += Math.max(0, line.R + 0.035 - off(ch.pts[k])) ** 2 * 4000;
    return c; };
  let best = cost(x);
  for (let step = 16; step >= 0.25; step /= 2) { let imp = true; while (imp) { imp = false;
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { const y = x.slice(); y[k] = THREE.MathUtils.clamp(y[k] + s * step, lo[k], hi[k]); const c = cost(y); if (c < best - 1e-9) { best = c; x = y; imp = true; } } } }
  const th = { opp, sweep: +x[0].toFixed(1), abd: +x[1].toFixed(1), mcp: +x[2].toFixed(1), ip: +x[3].toFixed(1), touch: null };
  const ch = thumbChain(th, G); th.err_tip = +ch.pts[3].distanceTo(gT).toFixed(4); th.err_ip = +ch.pts[2].distanceTo(gI).toFixed(4);
  return th;
}

// the hand on the handle for one choice of (th, phi, psi): th = handle vs the thumb axis (in the palm plane), phi = roll
// of the hand about the handle, psi = which face of the handle the thumb lies on (0 = the face away from the palm,
// + toward the thumb-web side). Returns the world frame, finger curls, thumb pose and the thumb's face direction (world).
function handOn(D, th, phi, psi, y0, R, fing, Rt = R) {
  // a reference frame round the handle: any unit u0 square to D, rotated by phi
  const ref = Math.abs(D.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u0 = ref.clone().addScaledVector(D, -ref.dot(D)).normalize(), u1 = new THREE.Vector3().crossVectors(D, u0);
  const n = u0.clone().multiplyScalar(Math.cos(phi)).addScaledVector(u1, Math.sin(phi)).normalize();
  const E = new THREE.Vector3().crossVectors(n, D);
  const t = D.clone().multiplyScalar(Math.cos(th)).addScaledVector(E, -Math.sin(th)).normalize(), f = D.clone().multiplyScalar(Math.sin(th)).addScaledVector(E, Math.cos(th)).normalize();
  const cz = HAND_GEOM.palm.t1 + CLEAR + R, tn = Math.tan(th), Re = R / Math.cos(th) + WRAP_PAD;   // the oblique handle's long semi-axis in the finger's plane (hold pass; was the mean of R and R / cos)
  const curl = {}; for (const fn of FINGERS) { const x = HAND_GEOM.mcp[fn][0]; const c = wrapCurls(Re, y0 + x * tn, cz, fing)[fn]; curl[fn] = [Math.min(100, c[0] + MCP_ADD), +(c[1] - PIP_OPEN).toFixed(1), Math.min(90, +(c[2] + PIP_OPEN).toFixed(1))]; }
  // the thumb face: o = cos(psi) z + sin(psi) (thumb-web side, square to the handle in the palm plane)
  const d = [Math.cos(th), Math.sin(th), 0], web = [Math.sin(th), -Math.cos(th), 0], o = [web[0] * Math.sin(psi), web[1] * Math.sin(psi), Math.cos(psi)];
  const rt = Rt + HAND_GEOM.trad[3] * fing - THUMB_PRESS, Q = (s) => [d[0] * s + rt * o[0], y0 + d[1] * s + rt * o[1], cz + rt * o[2]];
  const sT = (0.22 + 0.1 * Math.sin(psi)) / Math.max(0.3, d[0]), tip = Q(sT), ip = Q(sT - 0.11);
  const thumb = solveThumb({ tip, ip }, { at: [0, y0, cz], dir: d, R });
  const ow = new THREE.Vector3().addScaledVector(t, o[0]).addScaledVector(f, o[1]).addScaledVector(n, o[2]).normalize();
  return { t, f, n, curl, thumb, cz, tip, ow };
}

// ---------------------------------------------------------------- the real ladle (props phase 2, 2026-11-26 late)
// The downloaded model (layout/assets/props/ladle: "Ladle" by Lightningx, CC BY 4.0; props.json) replaces the hand-built
// one (round rod, hemisphere bowl, flat tab). Measured from its glb (model frame, metres, y up, origin at the bottom):
// a 6.2 cm bowl 2.5 cm deep at x -0.039; a FLAT STEEL STRIP handle, 11 mm wide (z) x 3.3 mm thick (x), rising almost
// straight (axis A_M) to a hook that curls toward +x above y 0.29. The handle's TOP face (the one on the bowl's open side,
// the face the thumb lies on) faces N_M. Jade (r4 decisions): "Fist, thumb on top".
export const LADLE_M = {
  grip: [0.019, 0.235, -0.0041],        // the handle's centre line where the fist's middle sits (below the hook)
  axis: [0.142, 0.990, 0],              // up the handle at the grip (bowl -> hook), from the centre line at y 0.183 / 0.250
  top: [-0.990, 0.142, 0],              // the top flat face's normal (the bowl's open side)
  bowl: [-0.039, 0.013, 0],             // the bowl's centre (half its depth)
  w: 0.0112, t: 0.0033,                 // strip width / thickness (m)
  gripY: [0.150, 0.300], gripX: 0.040,  // the straight part of the handle that the fist holds (split off for the hold check)
};
const n3 = (a) => new THREE.Vector3(...a).normalize();
// rotation taking the model's (axis, top) onto world (axisW, topW): both pairs made orthonormal first
export function frameQuat(axisW, topW) {
  const basis = (a, t) => { const A = a.clone().normalize(), T = t.clone().addScaledVector(A, -t.dot(A)).normalize(); return new THREE.Matrix4().makeBasis(A, T, new THREE.Vector3().crossVectors(A, T)); };
  const Mm = basis(n3(LADLE_M.axis), n3(LADLE_M.top)), Mw = basis(axisW, topW);
  return new THREE.Quaternion().setFromRotationMatrix(Mw.multiply(Mm.transpose()));
}
// the model's point p placed by (q, at = where the model's origin goes)
const placed = (p, q, at) => new THREE.Vector3(...p).applyQuaternion(q).add(at);

// The whole grip in world terms.
//   bowlC  world centre of the ladle's bowl (in the lemonade)
//   L      PREP.ladle: { rise (deg above level, bowl -> hand), yawDeg (world yaw of the handle from the bowl up to the
//          hand: 0 = +Z, 90 = +X), y0 (where the handle crosses the palm's centre line, hand units) }
//   Lh     the figure's hand length (m);  medial: world direction toward his midline;  elbow: where his elbow should be
// The hand's roll and the handle's angle across the palm are SEARCHED so that (1) the wrist is straight: the hand's finger
// axis points along the forearm (elbow -> fist) within the wrist's range, (2) the palm does not face outward (no forearm
// over-rotation), (3) the thumb's face of the handle is its TOP (faces up: weighted up in r4, Jade "thumb on top"),
// (4) the thumb reaches it. The fingers wrap the strip as a cylinder of its half WIDTH; the thumb lies on the flat face
// (half its THICKNESS from the centre line). The real ladle is then turned so its top face is the thumb's face and placed
// so its grip point is the fist's centre and its bowl at bowlC; the fist moves with it (three passes).
export function ladleGrip(o) {
  // r4: the handle's yaw is searched too (L.yawSearch: degrees; the bowl stays put): the wrist is the hard constraint
  const L = o.L, yaws = L.yawSearch || [L.yawDeg]; let best = null;
  for (const y of yaws) { const r = ladleGrip1({ ...o, L: { ...L, yawDeg: y } }); r.search.yaw_deg = y; if (!best || r.score < best.score) best = r; }
  return best;
}
function ladleGrip1({ bowlC, L, Lh, medial, elbow: elbow0, kind = 'adult' }) {
  const elbow = L.elbow ?? elbow0;   // r4: PREP.ladle.elbow overrides the shot's (one place for all four ladle shots)
  THUMB_PRESS = (L.thumbPress ?? 0) / Lh;
  CLEAR = L.clear ?? 0.07; PIP_OPEN = L.pipOpen ?? 6; MCP_ADD = L.mcpAdd ?? -4;
  const ya = L.yawDeg * D2R, ri = L.rise * D2R, y0 = L.y0 ?? 0.4, fing = handProfile(kind).fing, R = (LADLE_M.w / 2 + (L.wrapPad ?? 0)) / Lh, Rt = (LADLE_M.t / 2) / Lh;
  const up = new THREE.Vector3(Math.cos(ri) * Math.sin(ya), Math.sin(ri), Math.cos(ri) * Math.cos(ya)).normalize();   // up the handle (bowl -> hand)
  const B = V(bowlC), UPV = new THREE.Vector3(0, 1, 0), med = V(medial).normalize();
  const gm = new THREE.Vector3(...LADLE_M.grip).sub(new THREE.Vector3(...LADLE_M.bowl));
  let G = B.clone().addScaledVector(up, gm.length()), best = null, q = null, at = null;
  for (let pass = 0; pass < 3; pass++) {
    const D = up.clone().negate(), a = G.clone().sub(V(elbow)).normalize(); best = null;
    for (const sg of [-1]) for (let thd = -30; thd <= 60; thd += 5) for (let phd = 0; phd < 360; phd += 10) for (const psd of [0, 30, 60, 90]) {
      const th = thd * D2R, phi = phd * D2R, psi = psd * D2R;
      const H = handOn(D.clone().multiplyScalar(sg), th, phi, psi, y0, R, fing, Rt); H.sg = sg;
      const dev = Math.acos(THREE.MathUtils.clamp(H.f.dot(a), -1, 1)) / D2R;
      const outward = Math.max(0, -H.n.dot(med));
      const ow = H.ow.clone().addScaledVector(up, -H.ow.dot(up)).normalize(), top = ow.dot(UPV);
      const err = (H.thumb.err_tip + H.thumb.err_ip) / 0.02;
      const score = (dev / 20) ** 2 + 6 * outward ** 2 + (L.topW ?? 8) * (Math.sin(ri) ? (Math.cos(ri) - top) : 0) ** 2 + err ** 2;
      if (!best || score < best.score) best = { score, H, thd, phd, psd, dev, outward, top, sg, ow };
    }
    q = frameQuat(up, best.ow); at = B.clone().sub(new THREE.Vector3(...LADLE_M.bowl).applyQuaternion(q));
    G = placed(LADLE_M.grip, q, at);
  }
  const { H } = best, palm = G.clone().addScaledVector(H.f, -(y0 - 0.26) * Lh).addScaledVector(H.n, -H.cz * Lh);
  const hand = { shape: 'grip', curl: H.curl, spread: 0, thumb: H.thumb };
  const world = (x, y, z) => new THREE.Vector3().addScaledVector(H.t, x * Lh).addScaledVector(H.f, y * Lh).addScaledVector(H.n, z * Lh).add(palm.clone().addScaledVector(H.f, -0.26 * Lh));
  const wrist = palm.clone().addScaledVector(H.f, -0.26 * Lh), pole = V(elbow).sub(wrist).normalize();
  return { score: best.score, arm: { to: palm.toArray(), fingers: H.f.toArray(), palm: H.n.toArray(), hand, elbow: pole.toArray(), grasp: 'power', object: 'ladle' }, G, up, q, at, t: H.t, f: H.f, n: H.n, Lh,
    thumbGoalWorld: world(...H.tip), thumb: H.thumb, curl: H.curl,
    search: { thumb_points: 'up the handle (fist grip, thumb on top)', handle_vs_thumb_axis_deg: best.thd, roll_deg: best.phd, thumb_face_deg: best.psd, wrist_dev_deg: +best.dev.toFixed(1), palm_outward: +best.outward.toFixed(2), thumb_face_up: +best.top.toFixed(2), thumb_face_up_max: +Math.cos(ri).toFixed(2) } };
}

// split one mesh of the placed prop by triangle (model-space centroid test): the straight grip section becomes its own mesh
// (same label, same parent: engine/main.js holdsFor hulls only the mesh nearest the hand; the hull of the whole hooked
// handle would be a 4 cm wedge round a 3 mm strip)
function splitMesh(m, keep) {
  const g = m.geometry, pos = g.attributes.position, idx = g.index, nT = idx ? idx.count / 3 : pos.count / 3, A = [], Bv = [];
  const vv = (i) => [pos.getX(i), pos.getY(i), pos.getZ(i)];
  for (let t = 0; t < nT; t++) { const ii = [0, 1, 2].map((k) => (idx ? idx.getX(3 * t + k) : 3 * t + k)), P = ii.map(vv), c = [0, 1, 2].map((k) => (P[0][k] + P[1][k] + P[2][k]) / 3);
    (keep(c) ? A : Bv).push(...P.flat()); }
  const mkPart = (arr, name) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); geo.computeVertexNormals();
    const o = new THREE.Mesh(geo, m.material); o.name = name; o.userData = { ...m.userData, part: name }; o.castShadow = m.castShadow; o.receiveShadow = m.receiveShadow; return o; };
  const a = mkPart(A, m.name + ':grip'), b = mkPart(Bv, m.name + ':rest'); const par = m.parent; par.add(a); par.add(b); par.remove(m); return { grip: a, rest: b };
}
// the real ladle at (q, at) with its handle split; returns the group (null if the model did not load)
export function ladleProp(q, at, label = 'ladle') {
  const g = prop('ladle', { rot: q, at: at.toArray(), label }); if (!g) return null;
  let h = null; g.traverse((o) => { if (o.isMesh && /handle/.test(o.name) && !h) h = o; });
  // three pieces: below the fist, the grip, the hook (one 'rest' piece would have the whole ladle's box, as near the hand
  // as the grip, and holdsFor could pick it)
  if (h) { const { grip, rest } = splitMesh(h, (c) => c[1] > LADLE_M.gripY[0] && c[1] < LADLE_M.gripY[1] && c[0] < LADLE_M.gripX); grip.name = 'handle:grip';
    const pr = splitMesh(rest, (c) => c[1] <= LADLE_M.gripY[0]); pr.grip.name = 'handle:lower'; pr.rest.name = 'handle:hook'; }
  return g;
}
// V3b_prep: the ladle in the friend's fist
export function buildLadle(g, grip) {
  const p = ladleProp(grip.q, grip.at); if (p) g.add(p);
  return { bowlC: placed(LADLE_M.bowl, grip.q, grip.at), hook: placed([0.06, 0.33, -0.004], grip.q, grip.at) };
}
// The party ladle (the crowd's T1 holds it; layout.js punchLadle): the same real ladle leaning in the giant punchbowl, its
// bowl's centre just under the lemonade at the old foot, the handle up `lean` at the grip, its top face as near up as it goes.
// Returns the rotation, the model origin, and the grip point / axis in world terms (for T1's power grip in shots.js).
export function partyLadlePose(P) {
  const lean = n3(P.lean), topW = new THREE.Vector3(0, 1, 0).addScaledVector(lean, -lean.y).normalize();
  const q = frameQuat(lean, topW), B = new THREE.Vector3(P.foot[0], P.yl - 0.006, P.foot[2]), at = B.clone().sub(new THREE.Vector3(...LADLE_M.bowl).applyQuaternion(q));
  return { q, at, grip: placed(LADLE_M.grip, q, at).toArray().map((v) => +v.toFixed(4)), axis: lean.toArray(), top: topW.toArray() };
}
