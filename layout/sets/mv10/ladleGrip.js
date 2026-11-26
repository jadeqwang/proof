// The ladle and the hand that holds it (V3b_prep, Jade r3 decisions 2026-11-26: "the hand should be holding the ladle in
// a realistic way in the three.js model or image models will be confused"). SET-LOCAL: engine/ is not edited; this uses
// the engine's articulated hand (engine/hand.js: real MCP / PIP / DIP joints) with joint angles solved here for this grip.
//
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

const D2R = Math.PI / 180;
// hold pass 2026-11-26 (Rapier check, engine/holdcheck.mjs): the ported wrap put the index / middle proximal phalanges
// ~1 cm inside the steel. Tuned against the check: CLEAR = the handle's clearance off the palm surface (hand units; was
// 0.004), WRAP_PAD = extra wrap radius (hand units), and per finger the MCP closed MCP_ADD deg less and the PIP opened
// PIP_OPEN deg into the DIP, so the fist closes ROUND the handle (pads within 2 mm, nothing over 3 mm in)
const CLEAR = 0.07, WRAP_PAD = 0.0, PIP_OPEN = 6, MCP_ADD = -4;

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
function handOn(D, th, phi, psi, y0, R, fing) {
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
  const rt = R + HAND_GEOM.trad[3] * fing, Q = (s) => [d[0] * s + rt * o[0], y0 + d[1] * s + rt * o[1], cz + rt * o[2]];
  const sT = (0.22 + 0.1 * Math.sin(psi)) / Math.max(0.3, d[0]), tip = Q(sT), ip = Q(sT - 0.11);
  const thumb = solveThumb({ tip, ip }, { at: [0, y0, cz], dir: d, R });
  const ow = new THREE.Vector3().addScaledVector(t, o[0]).addScaledVector(f, o[1]).addScaledVector(n, o[2]).normalize();
  return { t, f, n, curl, thumb, cz, tip, ow };
}

// The whole grip in world terms.
//   bowlC  world centre of the ladle's bowl
//   L      PREP.ladle: { len (ladle rim to the fist's middle, m), rise (deg above level, bowl -> hand), yawDeg (world yaw
//          of the handle from the bowl up to the hand: 0 = +Z, 90 = +X), y0 (where the handle crosses the palm's centre
//          line, hand units), bowlR, handleR, hook }
//   Lh     the figure's hand length (m);  medial: world direction toward his midline;  elbow: where his elbow should be
// The hand's roll and the handle's angle across the palm are SEARCHED so that (1) the wrist is straight: the hand's finger
// axis points along the forearm (elbow -> fist) within the wrist's range, (2) the palm does not face outward (no forearm
// over-rotation), (3) the thumb's face of the handle is its TOP (faces up), (4) the thumb reaches it.
export function ladleGrip({ bowlC, L, Lh, medial, elbow, kind = 'adult' }) {
  const ya = L.yawDeg * D2R, ri = L.rise * D2R, y0 = L.y0 ?? 0.4, fing = handProfile(kind).fing, R = L.handleR / Lh;
  const up = new THREE.Vector3(Math.cos(ri) * Math.sin(ya), Math.sin(ri), Math.cos(ri) * Math.cos(ya)).normalize();   // up the handle (bowl -> hand)
  const horiz = new THREE.Vector3(up.x, 0, up.z).normalize();
  const rim = V(bowlC).add(V(0, L.bowlR * 0.55, 0)).addScaledVector(horiz, L.bowlR * 0.85);
  const G = rim.clone().addScaledVector(up, L.len);                    // the handle's centre line where it crosses the palm's centre line
  const D = up.clone().negate();                                       // along the handle toward the bowl (the thumb points this way)
  const a = G.clone().sub(V(elbow)).normalize(), med = V(medial).normalize(), UPV = new THREE.Vector3(0, 1, 0);
  let best = null;
  // sg +1: the thumb points down the handle toward the bowl (the serving grip); -1: the thumb points up it, the bowl end
  // leaving the fist on the little-finger side (the fist grip, thumb on top)
  for (const sg of [1, -1]) for (let thd = -30; thd <= 60; thd += 5) for (let phd = 0; phd < 360; phd += 10) for (const psd of [0, 30, 60]) {
    const th = thd * D2R, phi = phd * D2R, psi = psd * D2R;
    const H = handOn(D.clone().multiplyScalar(sg), th, phi, psi, y0, R, fing); H.sg = sg;
    const dev = Math.acos(THREE.MathUtils.clamp(H.f.dot(a), -1, 1)) / D2R;                  // wrist deviation (deg)
    const outward = Math.max(0, -H.n.dot(med));                                             // palm facing away from his midline
    const top = H.ow.dot(UPV);                                                              // the thumb's face points up
    const err = (H.thumb.err_tip + H.thumb.err_ip) / 0.02;
    const score = (dev / 20) ** 2 + 6 * outward ** 2 + 2 * (1 - top) + err ** 2;
    if (!best || score < best.score) best = { score, H, thd, phd, psd, dev, outward, top, sg };
  }
  const { H } = best, palm = G.clone().addScaledVector(H.f, -(y0 - 0.26) * Lh).addScaledVector(H.n, -H.cz * Lh);
  const hand = { shape: 'grip', curl: H.curl, spread: 0, thumb: H.thumb };
  const world = (x, y, z) => new THREE.Vector3().addScaledVector(H.t, x * Lh).addScaledVector(H.f, y * Lh).addScaledVector(H.n, z * Lh).add(palm.clone().addScaledVector(H.f, -0.26 * Lh));
  const wrist = palm.clone().addScaledVector(H.f, -0.26 * Lh), pole = V(elbow).sub(wrist).normalize();
  return { arm: { to: palm.toArray(), fingers: H.f.toArray(), palm: H.n.toArray(), hand, elbow: pole.toArray() }, rim, G, up, D, t: H.t, f: H.f, n: H.n, Lh,
    thumbGoalWorld: world(...H.tip), thumb: H.thumb, curl: H.curl,
    search: { thumb_points: best.sg > 0 ? 'down the handle, toward the bowl' : 'up the handle (fist grip, thumb on top)', handle_vs_thumb_axis_deg: best.thd, roll_deg: best.phd, thumb_face_deg: best.psd, wrist_dev_deg: +best.dev.toFixed(1), palm_outward: +best.outward.toFixed(2), thumb_face_up: +best.top.toFixed(2) } };
}

// The ladle itself (steel): a 9 cm hemispherical bowl holding lemonade; a round handle that leaves the bowl's rim with a
// short swan-neck bend, runs straight up through the fist, and ends past the heel of the hand in a flat tab with a hole.
// All its parts carry ONE label, 'ladle (steel)' (hold pass 2026-11-26: the hold check took the end tab as a separate support).
export function buildLadle(g, grip, L, look, liquid) {
  const add = (m, lab) => { g.add(tag(m, lab)); return m; };
  const rod = (a, b, r, lab, seg = 12) => { const dd = b.clone().sub(a), m = cyl(r, r, dd.length(), look, a.clone().add(b).multiplyScalar(0.5).toArray(), null, seg);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dd.normalize()); return add(m, lab); };
  const { rim, up, G } = grip, horiz = new THREE.Vector3(up.x, 0, up.z).normalize();
  const bowlC = rim.clone().addScaledVector(horiz, -L.bowlR * 0.85).add(V(0, -L.bowlR * 0.55, 0));
  const b = mk(new THREE.SphereGeometry(L.bowlR, 28, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), look); b.scale.set(1, 0.8, 1); b.position.copy(bowlC).add(V(0, L.bowlR * 0.55, 0));
  b.userData.double = true; add(b, 'ladle (steel)');
  if (liquid) add(cyl(L.bowlR * 0.9, L.bowlR * 0.9, 0.003, liquid, bowlC.clone().add(V(0, L.bowlR * 0.42, 0)).toArray(), null, 24), 'lemonade (in the ladle)');
  const neck1 = rim.clone().add(V(0, 0.03, 0)).addScaledVector(horiz, 0.006), hStart = neck1.clone().addScaledVector(up, 0.012);
  rod(rim, neck1, L.handleR * 0.8, 'ladle (steel)'); rod(neck1, hStart, L.handleR * 0.85, 'ladle (steel)');
  const hEnd = G.clone().addScaledVector(up, L.hook);
  const h = rod(hStart, hEnd, L.handleR, 'ladle (steel)'); h.scale.set(1, 1, 0.8);
  // the end: a flat rounded tab with a hanging hole
  const tab = mk(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 20), look); tab.position.copy(hEnd).addScaledVector(up, 0.008);
  tab.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), grip.n.clone()); add(tab, 'ladle (steel)');
  return { bowlC, hStart, hEnd };
}
