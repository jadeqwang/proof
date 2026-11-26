// Natural wrists (2026-11-26), independent of the figure's geometry: works on the solved shoulder / elbow / wrist and the
// hand frame (fingers f, palm normal nrm), so a rigged mesh can reuse it.
//
// API
//   WRIST                       ranges (deg)
//   wristAngles(S, E, Wr, f, nrm, side) -> { flex (+ toward the palm), radial (+ toward the thumb), twist (forearm about its
//                               axis vs the elbow plane, + supination, null when the elbow is nearly straight), elbowFlex }
//   naturalWrist({ shoulder, target, f, nrm, side, ua, fa, Lh, pole, r, isHold, clampHand, fixedElbow, ik, out })
//        -> { r (IK result), f, nrm, report }   elbow swivel first (+-45 deg, +-25 when the shot gives an elbow), then, for a
//                               hand holding its own prop (clampHand), the hand turned toward the forearm until in range;
//                               report.out_of_range lists what is still beyond the ranges (sidecar warning)
//   reverseCylinderGrip(...)    (mannequin.js) a cylinder held along hold.axis may be gripped either way round
import * as THREE from 'three';

// Wrist ranges (deg): flexion (toward the palm) / extension, radial (toward the thumb) / ulnar deviation, and the
// forearm's twist about its axis relative to the elbow's bending plane (0 = thumb up with the elbow bent; + = supinated).
export const WRIST = { flex: 60, ext: 60, radial: 20, ulnar: 30, sup: 85, pron: 80 };
// angles of a hand (fingers f, palm normal nrm, side 'L' | 'R') on a forearm elbow E -> wrist Wr, upper arm S -> E
export function wristAngles(S, E, Wr, f, nrm, side) {
  const a = Wr.clone().sub(E).normalize(), u = E.clone().sub(S).normalize();
  const t = side === 'R' ? new THREE.Vector3().crossVectors(f, nrm) : new THREE.Vector3().crossVectors(nrm, f); t.normalize();   // thumb side
  const ay = a.dot(f), flex = Math.atan2(-a.dot(nrm), ay) * 180 / Math.PI, radial = Math.atan2(-a.dot(t), ay) * 180 / Math.PI;
  const elbowFlex = Math.acos(THREE.MathUtils.clamp(u.dot(a), -1, 1)) * 180 / Math.PI;
  let twist = null;
  if (elbowFlex > 25) { const ref = u.clone().negate().addScaledVector(a, u.dot(a)).normalize(), tp = t.clone().addScaledVector(a, -t.dot(a)).normalize();
    // + = supination: for the right arm the thumb turns outward (away from the body = toward -cross(a, ref) ... measured with the side's sign)
    const sgn = side === 'R' ? 1 : -1; twist = sgn * Math.atan2(new THREE.Vector3().crossVectors(ref, tp).dot(a), ref.dot(tp)) * 180 / Math.PI; }
  return { flex, radial, twist, elbowFlex };
}
function excess(A) {
  const e = []; const W = WRIST;
  if (A.flex > W.flex) e.push(['flexion', A.flex - W.flex]); if (-A.flex > W.ext) e.push(['extension', -A.flex - W.ext]);
  if (A.radial > W.radial) e.push(['radial deviation', A.radial - W.radial]); if (-A.radial > W.ulnar) e.push(['ulnar deviation', -A.radial - W.ulnar]);
  if (A.twist != null) { if (A.twist > W.sup) e.push(['supination', A.twist - W.sup]); if (-A.twist > W.pron) e.push(['pronation', -A.twist - W.pron]); }
  return e;
}
// Solve the elbow swivel (rotation of the pole about the shoulder -> wrist axis) so the wrist stays in range; for a
// hand holding its own prop (clampHand) any remaining excess is taken out of the hand's angle (the prop follows the
// hand); otherwise the grip is kept and reported. Returns { r, f, nrm, report }.
export function naturalWrist({ shoulder, target, f, nrm, side, ua, fa, Lh, pole, r, isHold, clampHand, fixedElbow, ik, out }) {
  const wristOf = (ff) => target.clone().addScaledVector(ff, -0.26 * Lh);
  const cost = (rr, k) => { const A = wristAngles(shoulder, rr.mid, rr.end, f, nrm, side); const ex = excess(A);
    let c = (A.flex / 60) ** 2 + (A.radial / 25) ** 2 + (A.twist == null ? 0 : (A.twist / 85) ** 2 * 0.5) + ex.reduce((s, [, v]) => s + Math.min(v, 40) / 10, 0) + 2 * (k / 30) ** 2;   // the staging's elbow is worth keeping
    const lat = rr.mid.clone().sub(shoulder).dot(out); if (lat > 0.06) c += 3 * ((lat - 0.06) / 0.08) ** 2;   // no akimbo elbows
    const up = rr.mid.y - shoulder.y; if (up > 0.03) c += 5 * ((up - 0.03) / 0.1) ** 2;   // elbows do not ride above the shoulder
    return { c, A, ex }; };
  const before = wristAngles(shoulder, r.mid, r.end, f, nrm, side);
  let best = { r, k: 0, ...cost(r, 0) };
  if (isHold) {
    const W = wristOf(f), ax = W.clone().sub(shoulder).normalize(), lim = fixedElbow ? 25 : 45;
    for (let k = -lim; k <= lim; k += 5) { if (!k) continue; const pl = pole.clone().applyAxisAngle(ax, k * Math.PI / 180); const rr = ik(shoulder, W, ua, fa, pl); const cc = cost(rr, k); if (cc.c < best.c) best = { r: rr, k, ...cc }; }
    const base = cost(r, 0); if (best.c > base.c * 0.8) best = { r, k: 0, ...base };   // only move the elbow for a real gain
  }
  let F = f, N = nrm, rr = best.r, clamped = null;
  if (clampHand && best.ex.length) { // rotate the hand toward the forearm until it is in range (prop follows)
    const a = rr.end.clone().sub(rr.mid).normalize(), axis = new THREE.Vector3().crossVectors(f, a); const beta = Math.asin(Math.min(1, axis.length()));
    if (axis.lengthSq() > 1e-8) { axis.normalize();
      for (let s = 0.1; s <= 1.001; s += 0.1) { const q = new THREE.Quaternion().setFromAxisAngle(axis, beta * s); const f2 = f.clone().applyQuaternion(q), n2 = nrm.clone().applyQuaternion(q);
        const r2 = ik(shoulder, wristOf(f2), ua, fa, pole.clone().applyAxisAngle(wristOf(f2).sub(shoulder).normalize(), best.k * Math.PI / 180)); const A2 = wristAngles(shoulder, r2.mid, r2.end, f2, n2, side);
        if (!excess(A2).length) { F = f2; N = n2; rr = r2; clamped = +(beta * s * 180 / Math.PI).toFixed(1); break; } } }
  }
  const A = wristAngles(shoulder, rr.mid, rr.end, F, N, side), ex = excess(A);
  const rd = (v) => (v == null ? null : +v.toFixed(1));
  const report = { hold: isHold, elbow_swivel_deg: best.k, flex_deg: rd(A.flex), radial_deg: rd(A.radial), twist_deg: rd(A.twist), elbow_flex_deg: rd(A.elbowFlex),
    before: { flex_deg: rd(before.flex), radial_deg: rd(before.radial), twist_deg: rd(before.twist) }, hand_turned_deg: clamped,
    out_of_range: ex.map(([k, v]) => `${k} +${v.toFixed(0)} deg`) };
  return { r: rr, f: F, nrm: N, report };
}
