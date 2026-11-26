// Articulated mannequins at true heights. Units metres, y up.
//
// Figure spec (all fields optional except who / at):
//   who     'mama' | 'littleJade' | 'jade' | 'daughter'
//   at      [x, z] or [x, y, z]: the pelvis (mid hip joints). y defaults to floor + the leg preset's hip height.
//   floor   floor height under this figure (default 0)
//   yaw     deg; 0 faces +z, 90 faces +x
//   pitch   deg; whole-body pitch forward (90 = lying face down, -90 = on the back)
//   roll    deg; whole-body roll (90 = lying on the left side)
//   legs    'stand' | 'kneel' | 'cross' | 'long' | 'knees' | 'seat' | 'oneLegUp' | 'side' | 'kick'
//           legOpts: { ankleL / ankleR: [x,y,z] body-local override, spread, upLeg: 'L'|'R' }
//   spine   { bend: deg forward, side: deg toward own right, twist: deg toward own left }
//   head    { look: target, turn: deg toward own left, nod: deg down, tilt: deg toward own right }
//   torso   'real' (opt-in, with sex 'f' | 'm'): a clothed torso with waist, hips, bust / pectorals, shoulder blades
//           (engine/torso.js). Default: the swept capsule.
//           (FIG2.body, opt-in: every figure gets the real torso unless torso: 'capsule')
//   fringe  'none' (opt-in): no fringe plank on 'bob' / 'long' hair; a thin hairline shell over the forehead instead.
//   costume { top, legs, sock, sleeves, hairStyle, ... }: per-shot look over the CAST entry (height and kind are fixed)
//   L / R   arm: { to: target (palm centre), hand: shape name, palm: dir, fingers: dir, elbow: dir, elbowAt: point }
//           or a shortcut string: 'side' | 'lap' | 'kneeL' | 'kneeR'
// targets: [x,y,z] | '<who>:<part>' (head, nose, mouth, ear, forehead, chin, handL, ...) | 'book:<anchor>' | any key the
// set resolver knows. dirs: [x,y,z] world | 'up' 'down' 'fwd' 'back' 'left' 'right' 'in' 'out' (figure-relative) |
// 'to:<target>' (toward a target).
import * as THREE from 'three';
import { mk, limb, ball, slab, V, rad, UP, ik, basisQ, tag } from './core.js';
import { taperGeo, chainGeos, ellipsoidGeo, sweptGeo, sweptPoint, partMesh } from './anatomy.js';
import { buildHand, ageOf, tipLocal } from './hand.js';
import { realTorso, REAL_PELVIS } from './torso.js';
import { FIG2, buildFace, gazeReport, torsoType, costumeLook, hex, naturalWrist, wristAngles } from './figure2.js';
export { FIG2 } from './figure2.js';   // figure guides v2 switch (gaze, real torsos, costume colours): off = unchanged
import { HUMAN, dressFigure } from './humanMesh.js';   // rigged body meshes (PROOF_BODY=mesh): off = unchanged

let BUILD_ID = 0;   // line-mode id groups are per built figure
// limb girth factor by age: 1 for adults, rounder for small children
export function girthK(kind) { const a = Math.min(16, ageOf(kind)); return 1 + 0.17 * (16 - a) / 13; }

export const CAST = {
  mama: { name: 'Mama', h: 1.60, kind: 'adult', skin: 0xd8a27c, hair: 0x15110f, top: 0x6e3a33, legs: 0x3a3632, apron: 0xb9b2a0, hairStyle: 'bun', sleeves: 'pushed' },
  littleJade: { name: 'little Jade', h: 1.08, kind: 'child5', skin: 0xe6b996, hair: 0x14110f, top: 0xf1efe8, band: 0xe8792c, legs: 0x4b5a7a, hairStyle: 'bob', sleeves: 'long' },
  jade: { name: 'Jade', h: 1.65, kind: 'adult', skin: 0xe3b692, hair: 0x0e0d0f, top: 0xf1efe8, band: 0xe8792c, legs: 0x2c3140, hairStyle: 'long', sleeves: 'long' },
  daughter: { name: 'daughter', h: 1.02, kind: 'child4', skin: 0xe9c0a0, hair: 0x231a14, top: 0xf2a7b8, legs: 0xe9c0a0, hairStyle: 'pigtails', sleeves: 'short', dress: true },
};
export const PROP = {
  adult: { hip: 0.52, sh: 0.82, head: 0.135, shW: 0.112, hipW: 0.056, ua: 0.186, fa: 0.146, hand: 0.108, foot: 0.15, wk: 0.72, chestW: 0.19, chestD: 0.125 },
  child5: { hip: 0.46, sh: 0.785, head: 0.172, shW: 0.112, hipW: 0.052, ua: 0.172, fa: 0.138, hand: 0.11, foot: 0.155, wk: 0.8, chestW: 0.19, chestD: 0.14 },
  child4: { hip: 0.45, sh: 0.78, head: 0.182, shW: 0.112, hipW: 0.052, ua: 0.17, fa: 0.136, hand: 0.111, foot: 0.155, wk: 0.8, chestW: 0.19, chestD: 0.145 },
};
const GREY = { skin: 0.78, hair: 0.12, top: 0.62, legs: 0.42, apron: 0.72, band: 0.5, dark: 0.08 };

// ---------------------------------------------------------------- hands
// The hand shapes, the hand frame and the five-finger hand live in engine/hand.js (re-exported here for old imports).
export { HANDS, handFrame, resolveHand, buildHand } from './hand.js';

// ---------------------------------------------------------------- legs
function legPreset(name, s, D, o = {}) {
  const { thigh, shin, ankleH, H, hipW, L } = D;
  const sx = (x) => s * x;
  switch (name) {
    case 'stand': return { py: thigh + shin + ankleH, ankle: [sx(hipW + 0.008 * H), -(thigh + shin) * 0.995, 0], pole: [0, 0, 1], foot: [0, 0, 1] };
    case 'kneel': { const py = 0.17 * H; return { py, ankle: [sx(hipW * 1.15), -py + ankleH * 1.2, -0.03 * H], pole: [0, -0.35, 1], foot: [0, -0.15, -1] }; }
    case 'cross': { const py = 0.085 * H; return { py, ankle: [sx(-0.2 * L), -py + ankleH * 1.1, 0.42 * L], pole: [s, 0.25, 0.35], foot: [-s, -0.1, 0.3] }; }
    case 'side': { const py = 0.085 * H; const k = s > 0 ? 0.05 : -0.02; // both feet tucked to the figure's right
      return { py, ankle: [-0.42 * L + k * L, -py + ankleH, (s > 0 ? 0.1 : -0.12) * L], pole: [-0.3, 0.1, 1], foot: [-1, -0.1, -0.3] }; }
    case 'long': { const py = 0.08 * H; return { py, ankle: [sx(hipW + 0.02 * H), -py + ankleH + 0.02 * H, (thigh + shin) * 0.985], pole: [0, 1, 0], foot: [0, 1, 0.25] }; }
    case 'lapV': { const py = 0.08 * H; // legs out in a V, knees a little raised and splayed: room for a child between them
      return { py, ankle: [sx(0.55 * L), -py + ankleH + 0.01 * H, 0.79 * L], pole: [s * 0.7, 1, 0], foot: [s * 0.35, 1, 0.3] }; }
    case 'knees': { const py = 0.08 * H; return { py, ankle: [sx(hipW + 0.025 * H), -py + ankleH, 0.6 * (thigh + shin)], pole: [0, 1, 0.15], foot: [0, -0.05, 1] }; }
    case 'seat': { const py = o.seatH ?? 0.45; const fz = o.footFwd ?? thigh * 0.95; return { py, ankle: [sx(hipW + 0.012 * H), -py + ankleH, fz], pole: [0, 0.6, 1], foot: [0, -0.1, 1] }; }
    case 'oneLegUp': { const up = (o.upLeg || 'L') === (s > 0 ? 'L' : 'R'); const py = thigh + shin + ankleH;
      return up ? { py, ankle: [sx(hipW), -thigh * 0.62, thigh * 0.55], pole: [0, 0.3, 1], foot: [0, -0.6, 0.4] } : { py, ankle: [sx(hipW + 0.01 * H), -(thigh + shin) * 0.995, 0], pole: [0, 0, 1], foot: [0, 0, 1] }; }
    case 'kick': { return { py: 0, ankle: [sx(hipW), -thigh * 0.95, -shin * (s > 0 ? 0.85 : 0.6)], pole: [0, 0, 1], foot: [0, -1, -0.3] }; }
    case 'straight': { return { py: 0, ankle: [sx(hipW), -(thigh + shin) * 0.99, 0], pole: [0, 0, 1], foot: [0, 0.2, -1] }; }
    default: throw new Error('unknown legs ' + name);
  }
}

// ---------------------------------------------------------------- figure
export function buildFigure(spec, ctx) {
  const c0 = CAST[spec.who]; if (!c0) throw new Error('unknown figure ' + spec.who);
  const c = spec.costume ? { ...c0, ...spec.costume, h: c0.h, kind: c0.kind } : c0;   // costume: colours / sleeves / sock only, never the height
  const pr = PROP[c.kind], H = c.h;
  const g = new THREE.Group(); g.name = spec.who;
  const look = (k) => ({ grey: GREY[k] ?? 0.6, col: c[k] ?? 0x808080 });
  const LK = { skin: look('skin'), hair: look('hair'), top: look('top'), legs: look('legs'), apron: look('apron'), band: look('band'), dark: { grey: 0.05, col: 0x111111 }, sock: { grey: 0.5, col: c.sock ?? 0x6a6a70 } };
  if (FIG2.body) for (const k of ['top', 'legs', 'apron', 'band', 'sock']) LK[k] = costumeLook(LK[k]);   // v2: clothing in its real colour in form / flat
  const add = (m) => { g.add(m); return m; };

  const legLen = pr.hip * H, D = { thigh: 0.49 * legLen, shin: 0.45 * legLen, ankleH: 0.06 * legLen, H, hipW: pr.hipW * H, L: legLen };
  const torsoLen = (pr.sh - pr.hip) * H, headH = pr.head * H, neckLen = (1 - pr.sh - pr.head) * H + 0.02 * H;
  const legs = spec.legs || 'stand';
  const preL = legPreset(legs, 1, D, spec.legOpts || {}), preR = legPreset(legs, -1, D, spec.legOpts || {});
  const at = spec.at.length === 3 ? V(spec.at) : new THREE.Vector3(spec.at[0], (spec.floor || 0) + preL.py, spec.at[1]);

  const qB = new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(spec.pitch || 0), rad(spec.yaw || 0), rad(spec.roll || 0), 'YXZ'));
  const bx = new THREE.Vector3(1, 0, 0).applyQuaternion(qB), by = new THREE.Vector3(0, 1, 0).applyQuaternion(qB), bz = new THREE.Vector3(0, 0, 1).applyQuaternion(qB);
  const B = (v) => new THREE.Vector3(...v).applyQuaternion(qB);
  const sp = spec.spine || {};
  const qC = qB.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(sp.bend || 0), rad(sp.twist || 0), rad(sp.side || 0), 'XZY')));
  const cx = new THREE.Vector3(1, 0, 0).applyQuaternion(qC), cy = new THREE.Vector3(0, 1, 0).applyQuaternion(qC), cz = new THREE.Vector3(0, 0, 1).applyQuaternion(qC);
  // lower spine bends half as much: abdomen direction
  const qA = qB.clone().slerp(qC, 0.5); const ay = new THREE.Vector3(0, 1, 0).applyQuaternion(qA);
  const hip = at.clone();
  const waist = hip.clone().addScaledVector(by, torsoLen * 0.38);
  const shC = waist.clone().addScaledVector(cy, torsoLen * 0.62);
  const P = { qB, hip, waist, chest: shC.clone().addScaledVector(cy, -0.06 * H).addScaledVector(cz, 0.03 * H), shoulderC: shC, fwd: new THREE.Vector3(bz.x, 0, bz.z).normalize(), left: bx, up: by, cx, cy, cz, H, headH, who: spec.who };
  P.right = bx.clone().negate();
  g.userData.P = P; g.userData.spec = spec;

  // ---- body geometry (2026-11-25 articulated mannequin): smooth tapered limbs whose joints are shared spheres, a torso
  // of ribcage + abdomen + chest / back masses, a shoulder girdle (clavicles, trapezius, deltoids, armpit folds),
  // feet with heel and toe box. Pieces of one part are merged into one mesh and carry a line-mode id group
  // (userData.idGroup, see render.js) so line renders show silhouettes and creases, not the seams between pieces.
  const uid = 'f' + (++BUILD_ID) + ':';
  const kg = girthK(c.kind);                                    // children are rounder
  const part = (geos, lk, grp) => add(partMesh(geos, lk, uid + grp));
  const dR = pr.chestD * H * 0.5, wR = pr.chestW / pr.chestD;
  const CF = { x: cx, y: cy, z: cz };
  const SH = { L: shC.clone().addScaledVector(cx, pr.shW * H).addScaledVector(cy, -0.012 * H), R: shC.clone().addScaledVector(cx, -pr.shW * H).addScaledVector(cy, -0.012 * H) };
  // pelvis (stays children[0]: engine/body.js reads its quaternion)
  const realT = spec.torso === 'real' || (FIG2.body && spec.torso !== 'capsule');   // opt-in clothed torso (engine/torso.js); needs spec.sex 'f' | 'm'; v2: everyone
  const tt = FIG2.body ? torsoType(spec.who, c, ageOf(c.kind)) : null;
  const tSex = FIG2.body && (tt.type === 'c' || !spec.sex) ? tt.type : spec.sex;   // v2: children always 'c'; adults: the spec's sex, else from the cast key
  const pR = realT ? REAL_PELVIS[tSex] : [0.1, 0.072, 0.07]; if (!pR) throw new Error("torso: 'real' needs sex 'f' or 'm'");
  const pelvis = add(ball(1, spec.who === 'daughter' ? LK.top : LK.legs, hip.clone().addScaledVector(by, 0.02 * H).addScaledVector(bz, -0.006 * H).toArray(), [pR[0] * H, pR[1] * H, pR[2] * H])); pelvis.quaternion.copy(qB); pelvis.userData.idGroup = uid + 'pelvis';
  let torsoFrame, torsoProf;
  { const T = [];
    // one torso surface swept along the spine (pelvis frame at the bottom, chest frame at the top), widest at the armpits
    const p0 = hip.clone().addScaledVector(by, 0.01 * H), p2 = shC.clone().addScaledVector(cy, 0.004 * H), tw = 0.35;
    const pc = waist.clone().addScaledVector(p0, -((1 - tw) ** 2)).addScaledVector(p2, -tw * tw).multiplyScalar(1 / (2 * tw * (1 - tw)));
    const qT = new THREE.Quaternion(), ex = new THREE.Vector3(), ez = new THREE.Vector3();
    const kw = pr.chestW / 0.19 * H, kd = pr.chestD / 0.125 * H;
    torsoFrame = (t) => { const k = THREE.MathUtils.smoothstep(t, 0.15, 0.75); qT.copy(qB).slerp(qC, k);
      return { o: p0.clone().multiplyScalar((1 - t) ** 2).addScaledVector(pc, 2 * t * (1 - t)).addScaledVector(p2, t * t), x: ex.set(1, 0, 0).applyQuaternion(qT).clone(), z: ez.set(0, 0, 1).applyQuaternion(qT).clone() }; };
    if (realT) { const R = realTorso(torsoFrame, { sex: tSex, H, kw, kd }); torsoProf = R.prof; T.push(R.geo); }
    else {
    torsoProf = [[0, 0.084 * kw, 0.058 * kd], [0.2, 0.081 * kw, 0.056 * kd], [0.35, 0.075 * kw, 0.055 * kd], [0.62, 0.088 * kw, 0.06 * kd], [0.8, 0.095 * kw, 0.0625 * kd], [1, 0.092 * kw, 0.055 * kd]];
    T.push(sweptGeo(torsoFrame, torsoProf, { nu: 30, nv: 36 })); }
    for (const s of [1, -1]) {
      const S = SH[s > 0 ? 'L' : 'R'], out = cx.clone().multiplyScalar(s);
      T.push(FIG2.body ? taperGeo(shC.clone().addScaledVector(cy, 0.024 * H).addScaledVector(cz, -0.016 * H), S.clone().addScaledVector(cy, 0.002 * H).addScaledVector(cz, -0.006 * H).addScaledVector(out, -0.012 * H), 0.025 * H * kg, 0.015 * H * kg)   // v2: the slope from the neck runs down into the deltoid cap
        : taperGeo(shC.clone().addScaledVector(cy, 0.022 * H).addScaledVector(cz, -0.014 * H), S.clone().addScaledVector(cy, 0.01 * H).addScaledVector(cz, -0.004 * H), 0.024 * H * kg, 0.019 * H * kg));   // trapezius
      { const rc = 0.0075 * H * kg;   // clavicle: one straight bone from the sternal notch to the acromion, half buried in the chest's top edge
        T.push(taperGeo(sweptPoint(torsoFrame, torsoProf, 0.965, s > 0 ? rad(80) : Math.PI - rad(80), { inset: rc * 1.9 }), (FIG2.body ? S.clone().addScaledVector(cy, -0.006 * H).addScaledVector(cz, 0.002 * H).addScaledVector(out, -0.032 * H) : S.clone().addScaledVector(cy, 0.002 * H).addScaledVector(cz, 0.006 * H).addScaledVector(out, -0.024 * H)), rc * 0.85, rc * 0.9, { radial: 16, cap: 5 }));   // the sternal end sinks in (no bumps on the chest)
      }
    }
    part(T, LK.top, 'torso'); }
  if (c.band) { // the jacket's orange band, round the ribcage just above its lower edge
    const bc = waist.clone().addScaledVector(cy, torsoLen * 0.2), kd = pr.chestD / 0.125 * H, kw = pr.chestW / 0.19 * H;
    const bm = mk(new THREE.CylinderGeometry(1, 1, 0.035 * H, 32, 1, true), LK.band); bm.position.copy(bc); bm.quaternion.copy(qC);
    bm.scale.set(0.083 * kw * 1.04 + 0.002, 1, 0.058 * kd * 1.04 + 0.002); bm.userData.double = true; add(bm); }
  if (c.apron && !spec.noApron) add(slab(waist.clone().addScaledVector(cz, pr.chestD * H * 0.5 + 0.004).addScaledVector(cy, torsoLen * 0.12), waist.clone().addScaledVector(cz, pr.chestD * H * 0.55 + 0.004).addScaledVector(ay, -0.1 * H), 0.17 * H, 0.008, cx, LK.apron));
  if (c.dress) { // a short skirt
    const sk = mk(new THREE.CylinderGeometry(0.075 * H, 0.16 * H, 0.17 * H, 20, 1, true), LK.top); sk.userData.double = true;
    sk.position.copy(hip.clone().addScaledVector(by, -0.04 * H)); sk.quaternion.copy(qB); add(sk); }

  // legs
  const legInfo = {};
  const legLook = spec.who === 'daughter' ? LK.skin : LK.legs, footLook = spec.who === 'daughter' ? LK.skin : LK.sock;
  for (const [s, n, pre] of [[1, 'L', preL], [-1, 'R', preR]]) {
    const hj = hip.clone().addScaledVector(bx, s * D.hipW);
    const ov = spec.legOpts?.['ankle' + n];
    const anc = ov ? B([s * ov[0], ov[1], ov[2]]).add(hip) : B(pre.ankle).add(hip);
    const pv = spec.legOpts?.['pole' + n];   // v9: optional world-space pole (knee direction) override
    const pole = pv ? new THREE.Vector3(...pv) : B(pre.pole);
    const r = ik(hj, anc, D.thigh, D.shin, pole);
    const K = r.mid, A = r.end, shinDir = A.clone().sub(K).normalize();
    const front = pole.clone().addScaledVector(shinDir, -pole.dot(shinDir)); if (front.lengthSq() < 1e-6) front.copy(bz); front.normalize();
    const calf = K.clone().lerp(A, 0.3).addScaledVector(front, -0.006 * H);
    const rK = 0.034 * H * kg, rA = 0.019 * H * kg;
    part([taperGeo(hj, K, 0.058 * H * kg, rK, { radial: 18 }), taperGeo(K, calf, rK, 0.036 * H * kg, { radial: 16 }), taperGeo(calf, A, 0.036 * H * kg, rA, { radial: 16 })], legLook, 'leg' + n);
    // foot: heel, sole to the ball, toe box, instep (P.foot as before: 0.6 of the foot length along the foot)
    const fd = B(pre.foot).normalize(), FL = pr.foot * H, ah = D.ankleH;
    let w = bx.clone().addScaledVector(fd, -bx.dot(fd)), up;
    if (w.lengthSq() > 0.09) { w.normalize(); up = new THREE.Vector3().crossVectors(fd, w); }
    else { up = K.clone().sub(A); up.addScaledVector(fd, -up.dot(fd)).normalize(); w = new THREE.Vector3().crossVectors(up, fd); }
    const rH = 0.62 * ah * kg, rB = 0.42 * ah * kg, rT = 0.34 * ah * kg;
    const heel = A.clone().addScaledVector(up, -(ah - rH)).addScaledVector(fd, -(0.2 * FL - rH));
    const ballP = A.clone().addScaledVector(up, -(ah - rB)).addScaledVector(fd, 0.6 * FL);
    const toe = A.clone().addScaledVector(up, -(ah - rT)).addScaledVector(fd, 0.8 * FL - rT);
    const FF = { x: w, y: up, z: new THREE.Vector3().crossVectors(w, up) };
    part([ellipsoidGeo(heel, [rH, rH, rH * 1.1], FF), taperGeo(heel, ballP, rH * 0.78, rB, { side: w, sx: 1.5 }), taperGeo(ballP, toe, rB, rT, { side: w, sx: 1.7 }),
      taperGeo(A, ballP.clone().addScaledVector(up, rB * 0.45), rA * 0.98, rB * 0.85, { side: w, sx: 1.35 })], footLook, 'foot' + n);
    P['knee' + n] = K; P['ankle' + n] = A; P['foot' + n] = A.clone().addScaledVector(fd, pr.foot * H * 0.6); P['hip' + n] = hj;
    P['heel' + n] = heel.clone().addScaledVector(up, -rH); P['toe' + n] = toe.clone().addScaledVector(fd, rT);
    legInfo[n] = { reach: +r.reach.toFixed(2) };
  }
  P.knees = P.kneeL.clone().add(P.kneeR).multiplyScalar(0.5);
  P.lap = P.kneeL.clone().add(P.kneeR).multiplyScalar(0.5).lerp(hip, 0.45).addScaledVector(by, 0.06 * H);

  // neck + head
  const neckBase = shC.clone().addScaledVector(cy, 0.005 * H);
  const hs = spec.head || {};
  let hdir;
  if (hs.look) { const lt = ctx.resolve(hs.look, P); P.lookAt = lt; hdir = lt.clone().sub(neckBase.clone().addScaledVector(cy, neckLen + headH * 0.4)).normalize(); }
  else hdir = cz.clone();
  // clamp the turn to 80° from the chest, keep 75 % of the pitch in the skull (eyes do the rest)
  { const flat = hdir.clone().addScaledVector(cy, -hdir.dot(cy)); const pitch = Math.asin(THREE.MathUtils.clamp(hdir.dot(cy), -1, 1)) * (hs.pitchK ?? 0.62);
    let yawA = Math.atan2(flat.dot(cx), flat.dot(cz)); yawA = THREE.MathUtils.clamp(yawA + rad(hs.turn || 0), -rad(80), rad(80));
    const p2 = THREE.MathUtils.clamp(pitch - rad(hs.nod || 0), -rad(48), rad(50));
    hdir = cz.clone().multiplyScalar(Math.cos(yawA) * Math.cos(p2)).addScaledVector(cx, Math.sin(yawA) * Math.cos(p2)).addScaledVector(cy, Math.sin(p2)).normalize();
    P.headTurn = Math.round(yawA * 180 / Math.PI); }
  let hx = new THREE.Vector3().crossVectors(cy, hdir).normalize();
  let hy = new THREE.Vector3().crossVectors(hdir, hx).normalize();
  if (hs.tilt) { const qt = new THREE.Quaternion().setFromAxisAngle(hdir, rad(hs.tilt)); hx.applyQuaternion(qt); hy.applyQuaternion(qt); }
  const qH = basisQ(hx, hy, hdir);
  const neckTop = neckBase.clone().addScaledVector(cy, neckLen * 0.7).addScaledVector(hy, neckLen * 0.3);
  const head = neckTop.clone().addScaledVector(hy, headH * 0.42).addScaledVector(hdir, headH * 0.04);
  { const nk = ageOf(c.kind) >= 16 ? 1 : 1.15;   // adult* kinds (per-person hand/foot, sets/_cast.js) are adults part([taperGeo(neckBase.clone().addScaledVector(cy, -0.012 * H), neckTop.clone().addScaledVector(hy, headH * 0.1), 0.031 * H * nk, 0.027 * H * nk, { radial: 18 })], LK.skin, 'neck');
    P.neck = neckBase.clone().lerp(neckTop, 0.5); }
  const R = headH / 2;
  const HL = (x, y, z) => new THREE.Vector3(x * R, y * R, z * R).applyQuaternion(qH).add(head);
  const skull = add(ball(R, LK.skin, head.toArray(), [pr.wk, 1, 0.9])); skull.quaternion.copy(qH); skull.userData.part = 'head';
  let gazeInfo = null;
  if (FIG2.on) gazeInfo = buildFace({ add, who: spec.who, head, qH, hx, hy, hdir, R, eyeX: 0.3, eyeY: 0.08, skin: LK.skin, lookAt: P.lookAt || null, kid: ageOf(c.kind) < 13 });
  if (!FIG2.on || gazeInfo.face !== 'blank') { // v2 'blank' faces get the gaze-aimed nose wedge from buildFace instead
    const nose = mk(new THREE.ConeGeometry(R * 0.13, R * 0.34, 8), LK.skin); nose.position.copy(HL(0, -0.12, 0.9)); nose.quaternion.copy(qH.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)))); add(nose); }
  for (const s of [-1, 1]) {
    if (!FIG2.on) add(ball(R * 0.075, LK.dark, HL(s * 0.3, 0.08, 0.82).toArray()));   // v2: eyes from buildFace (or none)
    add(ball(R * 0.17, LK.skin, HL(s * pr.wk * 0.97, 0.0, 0.0).toArray(), [0.45, 1, 0.75]));
  }
  { const m = mk(new THREE.BoxGeometry(R * 0.36, R * 0.05, R * 0.05), { grey: 0.3, col: 0x8a3b34 }); m.position.copy(HL(0, -0.48, 0.78)); m.quaternion.copy(qH); add(m); }
  // hair
  { const capM = mk(new THREE.SphereGeometry(R * 1.06, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), LK.hair);
    capM.position.copy(head); capM.quaternion.copy(qH.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.8, 0, 0)))); capM.scale.set(pr.wk * 1.02, 1.05, 0.98); capM.userData.double = true; add(capM);
    const st = c.hairStyle;
    if (st === 'bun') add(ball(R * 0.42, LK.hair, HL(0, -0.15, -1.0).toArray()));
    if (st === 'bob' || st === 'long') { // a shell over the back and sides down to the jaw, open at the face; a fringe
      const sh = mk(new THREE.SphereGeometry(R * 1.1, 28, 18, Math.PI * 0.84, Math.PI * 1.32, 0, Math.PI * 0.74), LK.hair); sh.userData.double = true;
      sh.position.copy(HL(0, 0.04, -0.06)); sh.quaternion.copy(qH); sh.scale.set(pr.wk * 1.04, 1.0, 1.0); add(sh);
      if (spec.fringe === 'none') { // opt-in: no fringe plank; a soft hairline that hugs the forehead instead (reads as hair from above)
        const fr = mk(new THREE.SphereGeometry(R * 1.07, 24, 12, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.08, Math.PI * 0.26), LK.hair); fr.userData.double = true;
        fr.position.copy(head); fr.quaternion.copy(qH); fr.scale.set(pr.wk * 1.02, 1.04, 0.98); add(fr); }
      else add(slab(HL(0, 0.78, 0.55), HL(0, 0.36, 0.9), R * 1.2, R * 0.12, hx, LK.hair));
    }
    if (st === 'long') { // straight hair hanging with gravity down the back to the shoulder blades
      const a = HL(0, -0.3, -0.85), b = a.clone().add(new THREE.Vector3(0, -0.24 * H, 0)).addScaledVector(cz, -0.02);
      add(slab(a, b, R * 1.35, R * 0.22, cx, LK.hair)); }
    if (st === 'pigtails') for (const s of [-1, 1]) add(ball(R * 0.3, LK.hair, HL(s * 0.9, -0.35, -0.35).toArray(), [0.8, 1.2, 0.8]));
  }
  Object.assign(P, { head, headUp: hy, headFwd: hdir, headX: hx, nose: HL(0, -0.12, 1.1), mouth: HL(0, -0.48, 0.85), chin: HL(0, -0.95, 0.5), forehead: HL(0, 0.5, 0.85),
    eyes: HL(0, 0.08, 0.85), earL: HL(pr.wk, 0, 0), earR: HL(-pr.wk, 0, 0), headTop: HL(0, 1, 0), backOfHead: HL(0, 0.1, -1) });

  // arms
  const ua = pr.ua * H, fa = pr.fa * H, Lh = pr.hand * H;
  P.hands = {};
  for (const [n, s] of [['L', 1], ['R', -1]]) {
    let a = spec[n] || 'side'; if (typeof a === 'string') a = { to: a };
    const shoulder = shC.clone().addScaledVector(cx, s * pr.shW * H).addScaledVector(cy, -0.012 * H);
    P['shoulder' + n] = shoulder;
    const dirOf = (d) => {
      if (!d) return null; if (Array.isArray(d)) return V(d).normalize();
      if (typeof d === 'string' && d.startsWith('to:')) return null; // handled with the target
      return ({ up: UP.clone(), down: UP.clone().negate(), fwd: cz.clone(), back: cz.clone().negate(), left: cx.clone(), right: cx.clone().negate(), out: cx.clone().multiplyScalar(s), in: cx.clone().multiplyScalar(-s) })[d].clone();
    };
    let target, shape = a.hand || 'relax';
    if (a.to === 'side') { target = shoulder.clone().addScaledVector(cy, -(ua + fa + Lh * 0.25) * 0.97).addScaledVector(cz, 0.03).addScaledVector(cx, s * 0.02); a = { palm: 'in', fingers: 'down', ...a }; }
    else if (a.to === 'lap') target = P.lap.clone().addScaledVector(cx, s * 0.06 * H).addScaledVector(UP, 0.03 * H);
    else if (a.to === 'kneeL' || a.to === 'kneeR') target = P[a.to === 'kneeL' ? 'kneeL' : 'kneeR'].clone().addScaledVector(UP, 0.045 * H);
    else target = (a.to == null && a.tip) ? ctx.resolve(a.tip.at, P) : ctx.resolve(a.to, P);
    if (a.off) target.add(V(a.off));
    const resolveDir = (d) => (typeof d === 'string' && d.startsWith('to:')) ? ctx.resolve(d.slice(3), P).sub(target).normalize() : dirOf(d);
    let f = resolveDir(a.fingers), nrm = resolveDir(a.palm);
    const thumbDir = a.thumb ? resolveDir(a.thumb) : null;
    const pole = a.elbowAt ? ctx.resolve(a.elbowAt, P).sub(shoulder).normalize()   // elbowAt: a point the elbow should bend toward (pole solved from it)
      : a.elbow ? (resolveDir(a.elbow) || V(a.elbow)) : UP.clone().negate().addScaledVector(cx, s * 0.65).addScaledVector(cz, -0.3);
    const hold = a.hold ? (typeof a.hold === 'number' ? { r: a.hold } : a.hold) : null;
    // hold.axis: turn the hand about its palm normal so the held cylinder (a forearm, a rail) runs along this direction
    if (hold?.axis && nrm) { const ax = resolveDir(hold.axis); const nn = nrm.clone().normalize(); ax.addScaledVector(nn, -ax.dot(nn)).normalize();
      f = n === 'R' ? new THREE.Vector3().crossVectors(nn, ax) : new THREE.Vector3().crossVectors(ax, nn); }
    // hold.centre: `to` is the centre of the held cylinder, not the palm
    if (hold?.centre && f && nrm) { const nn = nrm.clone().addScaledVector(f, -nrm.dot(f)).normalize(); target.addScaledVector(f, -0.12 * Lh).addScaledVector(nn, -(0.064 * Lh + hold.r)); }
    let r, ff = f;
    // tip: { finger: 'thumb' | 'index' | ..., at: target, off } puts that fingertip (not the palm centre) on the point
    const tipAt = a.tip ? ctx.resolve(a.tip.at, P).add(V(a.tip.off || [0, 0, 0])) : null, tipL = a.tip ? tipLocal(shape, c.kind, a.tip.finger || 'index') : null;
    for (let it = 0; it < (tipAt ? 6 : 3); it++) {
      if (!ff) ff = target.clone().sub(shoulder).normalize(); // first guess
      if (tipAt) { let nn = nrm ? nrm.clone() : UP.clone().negate(); if (Math.abs(nn.dot(ff)) > 0.9) nn = cz.clone(); nn.addScaledVector(ff, -nn.dot(ff)).normalize();
        const tt = n === 'R' ? new THREE.Vector3().crossVectors(ff, nn) : new THREE.Vector3().crossVectors(nn, ff);
        target = tipAt.clone().addScaledVector(tt, -tipL.x * Lh).addScaledVector(ff, -(tipL.y - 0.26) * Lh).addScaledVector(nn, -tipL.z * Lh); }
      const wrist = target.clone().addScaledVector(ff, -0.26 * Lh);
      r = ik(shoulder, wrist, ua, fa, pole);
      if (!f) ff = r.end.clone().sub(r.mid).normalize();
    }
    f = ff.clone().normalize();
    if (thumbDir) { // orient the thumb side along a direction (e.g. the ring's hole facing the light)
      const t = thumbDir.clone().addScaledVector(f, -thumbDir.dot(f)).normalize();
      nrm = n === 'L' ? new THREE.Vector3().crossVectors(f, t) : new THREE.Vector3().crossVectors(t, f);
    }
    if (!nrm) { nrm = UP.clone().negate(); if (Math.abs(nrm.dot(f)) > 0.9) nrm = cz.clone(); }
    nrm.addScaledVector(f, -nrm.dot(f)).normalize();
    if (FIG2.on && a.to !== 'side') { // v2: natural wrists (engine/figure2.js naturalWrist): elbow swivel first, then the wrist
      const isHold = !!hold || ['grip', 'pinch', 'cup'].includes(typeof shape === 'string' ? shape : shape?.shape);
      // a cylinder held along hold.axis can be gripped with the hand either way round along it (thumb toward either end):
      // take the way round whose wrist is natural (the forearm turns, the grip on the object stays)
      if (hold?.axis) { const t2 = hold.centre ? target.clone().addScaledVector(f, 0.24 * Lh) : target.clone(), f2 = f.clone().negate();
        const r2 = ik(shoulder, t2.clone().addScaledVector(f2, -0.26 * Lh), ua, fa, pole);
        const badness = (rr, ff) => { const A = wristAngles(shoulder, rr.mid, rr.end, ff, nrm, n); return Math.max(0, A.flex - 60) + Math.max(0, -A.flex - 60) + Math.max(0, A.radial - 20) + Math.max(0, -A.radial - 30) + 0.25 * (Math.abs(A.flex) + Math.abs(A.radial)) + (A.twist == null ? 0 : 0.5 * Math.max(0, Math.abs(A.twist) - 80)); };
        if (r2.reach <= 1.0 && badness(r2, f2) < badness(r, f) - 10) { target = t2; f = f2; r = r2; (P.gripFlip ||= {})[n] = true; } }
      const wr = naturalWrist({ shoulder, target, f, nrm, side: n, ua, fa, Lh, pole, r, isHold, clampHand: !!hold || (!isHold && !a.tip), fixedElbow: !!(a.elbow || a.elbowAt), ik, out: cx.clone().multiplyScalar(s) });
      r = wr.r; f = wr.f; nrm = wr.nrm; (P.wrists ||= {})[n] = { ...wr.report, grip_reversed: !!P.gripFlip?.[n] }; }
    // ---- arm geometry: deltoid cap from the acromion down the humerus, upper arm and forearm as one smooth chain
    // (the elbow is their shared sphere), the distal forearm flattened like a wrist, armpit folds into the torso
    const S = shoulder, E = r.mid, Wr = r.end, u = E.clone().sub(S).normalize(), out = cx.clone().multiplyScalar(s);
    const tH = n === 'R' ? new THREE.Vector3().crossVectors(f, nrm) : new THREE.Vector3().crossVectors(nrm, f); tH.normalize();
    const foreLook = c.sleeves === 'long' ? LK.top : LK.skin, upperLook = c.sleeves === 'short' ? LK.skin : LK.top;
    const kA = FIG2.body ? 1 + 0.08 * (16 - Math.min(16, ageOf(c.kind))) / 13 : kg;   // v2: children's arms slimmer than the default roundness
    const rS = 0.0285 * H * kA, rE = 0.0205 * H * kA, rF = 0.0215 * H * kA, rW = 0.0145 * H * kA, F1 = E.clone().lerp(Wr, 0.3);
    // v2: the arm shares the torso's line id when it is the same cloth (no seam ring at the shoulder; silhouettes still
    // draw from the normals)
    const gU = FIG2.body && upperLook === LK.top ? 'torso' : upperLook === foreLook ? 'arm' + n : 'uarm' + n, gF = FIG2.body && foreLook === LK.top ? 'torso' : upperLook === foreLook ? 'arm' + n : 'farm' + n;
    // v2 deltoid: an ellipsoid along the humerus wrapping its head, its top at the acromion, its inner side sunk in the
    // torso (the old sphere-cone stood on the shoulder like a ball)
    const delt = FIG2.body ? (() => { let ox = out.clone().addScaledVector(u, -out.dot(u)); if (ox.lengthSq() < 0.01) ox = cz.clone().addScaledVector(u, -cz.dot(u)); ox.normalize();
        return ellipsoidGeo(S.clone().addScaledVector(u, 0.15 * ua).addScaledVector(cy, -0.006 * H), [0.027 * H * kA, 0.27 * ua, 0.026 * H * kA], { x: ox, y: u, z: new THREE.Vector3().crossVectors(ox, u) }, { w: 22, h: 16 }); })()
      : taperGeo(S.clone().addScaledVector(cy, 0.006 * H), S.clone().addScaledVector(u, 0.42 * ua), 0.03 * H * kg, 0.024 * H * kg, { radial: 18 });
    const upper = taperGeo(FIG2.body ? S.clone().addScaledVector(u, 0.1 * ua) : S, E, rS, upperLook === foreLook ? rE : rE * 1.1, { radial: 18 });   // a sleeve edge at the elbow: the sleeve encloses the joint (no coincident surfaces)
    const fore = [taperGeo(E, F1, rE, rF, { radial: 16 }), taperGeo(F1, Wr, rF, rW, { radial: 16, side: tH, sz: 0.72 })];
    if (c.sleeves === 'short') {
      part([delt, taperGeo(FIG2.body ? S.clone().addScaledVector(u, 0.1 * ua) : S, S.clone().lerp(E, 0.42), rS * 1.12, (rS + (rE - rS) * 0.42) * 1.14, { radial: 18 })], LK.top, FIG2.body ? 'torso' : 'sleeve' + n);
      part([upper, ...fore], LK.skin, gU);
    } else if (gU === gF) part([delt, upper, ...fore], upperLook, gU);
    else { part([delt, upper], upperLook, gU); part(fore, foreLook, gF); }
    if (c.sleeves === 'long') part([taperGeo(Wr.clone().lerp(E, 0.17), Wr.clone().lerp(E, 0.035), (rF + (rW - rF) * 0.75) * 1.1, rW * 1.12, { radial: 16, side: tH, sz: 0.8 })], LK.top, 'cuff' + n);
    // armpit folds (pectoral in front, latissimus behind), part of the upper arm's surface (so they draw no seam along
    // the arm); they only grow as the upper arm leaves the side (a hanging arm has none: they would stand off the chest)
    { const el = Math.acos(THREE.MathUtils.clamp(-u.dot(cy), -1, 1)), k = THREE.MathUtils.smoothstep(el, rad(35), rad(95));
      if (k > 0.05) { const fu = S.clone().addScaledVector(u, 0.28 * ua);
        part([taperGeo(sweptPoint(torsoFrame, torsoProf, 0.8, Math.PI / 2 - s * 1.05, { inset: 0.018 * H * kg }), fu.clone().addScaledVector(cz, 0.004 * H), 0.016 * H * kg * k, 0.018 * H * kA),
          taperGeo(sweptPoint(torsoFrame, torsoProf, 0.74, -Math.PI / 2 + s * 1.0, { inset: 0.02 * H * kg }), fu.clone().addScaledVector(cz, -0.004 * H), 0.018 * H * kg * k, 0.019 * H * kA)], LK.top, FIG2.body ? 'torso' : c.sleeves === 'short' ? 'sleeve' + n : gU); } }
    const hg = new THREE.Group(); hg.name = spec.who + '.hand' + n; add(hg);
    const hand = buildHand(n, Lh, shape, Wr, f, nrm, LK.skin, hg, { kind: c.kind, id: uid + 'hand' + n, palmGroup: foreLook === LK.skin ? uid + gF : null, hold: hold?.r });
    if (hand.held && hold.prop !== false) { const hh = hold.h ?? hold.r * 2.6, ax = hand.held.axis.clone(), ctr = hand.held.centre.clone().addScaledVector(ax, hold.off ?? hh * 0.12);
      const cm = mk(new THREE.CylinderGeometry(hold.r, hold.r * (hold.taper ?? 0.85), hh, 20), hold.look || { grey: 0.9, col: 0xf0e8d0 }); cm.position.copy(ctr); cm.quaternion.setFromUnitVectors(UP, ax); tag(cm, hold.label || 'cup (held)'); hg.add(cm);
      P['held' + n] = ctr; }
    P['elbow' + n] = E; P['wrist' + n] = Wr; P['hand' + n] = hand.palm; P['index' + n] = hand.tips.index; P['thumb' + n] = hand.tips.thumb;
    P['middle' + n] = hand.tips.middle; P['ring' + n] = hand.tips.ring; P['little' + n] = hand.tips.little; P['knuckle' + n] = hand.knuckles.middle;
    P['forearm' + n] = E.clone().lerp(Wr, 0.55); P['upperArm' + n] = S.clone().lerp(E, 0.5);
    const shapeName = typeof shape === 'string' ? shape : (shape.shape || 'relax');
    P.hands[n] = { group: hg, shape: shapeName, pose: hand.pose, f, n: nrm, t: hand.t, reach: +r.reach.toFixed(2), capsules: hand.capsules, joints: hand.joints, Lh };   // capsules / joints: world data (engine/holdcheck.mjs, mesh adapters)
  }
  if (HUMAN.on) dressFigure(g, spec, c, P, uid);   // PROOF_BODY=mesh: the solved pose drives a rigged human mesh (engine/humanMesh.js)
  g.traverse((o) => { o.userData.who = spec.who; });
  tag(g, c.name);
  g.userData.report = { legs: legInfo, arms: { L: P.hands.L.reach, R: P.hands.R.reach }, headTurn: P.headTurn, ...(P.bodyReport ? { body: P.bodyReport } : {}) };
  if (FIG2.on) { P.gaze = gazeReport(spec, P, ctx, gazeInfo, hs); P.gazeInfo = gazeInfo;
    P.costume = { top: hex(c.top), legs: hex(spec.who === 'daughter' ? c.skin : c.legs), sleeves: c.sleeves, sock: hex(c.sock ?? 0x6a6a70), apron: c.apron && !spec.noApron ? hex(c.apron) : undefined, band: c.band ? hex(c.band) : undefined,
      torso: realT ? `real ${tSex}${tt && !spec.sex ? ' (' + tt.how + ')' : ''}` : 'capsule' }; }
  return g;
}

// named points on a built figure, for targets like 'mama:nose'
export function figurePoint(P, part) {
  const p = P[part]; if (!p) throw new Error(`no part ${part} on ${P.who}`);
  return p.clone();
}
