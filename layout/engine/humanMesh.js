// Rigged human body meshes for the layout figures (2026-11-26, opt-in: PROOF_BODY=mesh / render.mjs --body mesh).
// Off (the default) = the mannequins exactly as before; nothing here runs.
//
// The bodies are MakeHuman / MPFB2 meshes (CC0) built headless in Blender by layout/assets/bodies/make_bodies.py, one per
// person and age (bodies.json), with the MPFB "game_engine" skeleton (finger bones) plus two eye bones. This module:
//   loadBodies()            fetches every GLB + meta.json once (main.js awaits it before any shot builds)
//   dressFigure(g, spec, c, P, uid)
//                           called at the end of mannequin.js buildFigure (the one hook): poses the skeleton from the
//                           solver's joint positions (P.*) and BAKES the skinned mesh into plain static meshes (CPU linear
//                           blend skinning), so render.js, shadows, ids, raycasts and the beam mask see ordinary meshes;
//                           the mannequin's own meshes are removed (held props in the hand groups stay).
// Pose fit: every bone is aimed along its solved segment (head -> tail) and stretched along its axis to the solved
// length; twist from a reference direction per bone (spine / neck: the solver's chest frame; clavicle: chest forward;
// arms: the elbow's bending plane, the forearm turning toward the hand's frame along its length; legs: the knee / foot
// direction; hand: the solver's hand frame (fingers, palm normal, thumb side); fingers: on the solver's finger
// joints; feet: the foot frame; head: rigid on the solver's head frame, placed by the eyes). Eyes: each eye bone aimed
// with engine/gaze.js eyeAim (the same head / eye split the gaze report uses).
// Clothing = colour regions from the cast entry / spec.costume (top, legs, sock, sleeves, band, apron, dress), by bone
// weights on the rest mesh; hair = MPFB CC0 hair proxies per hairStyle (bun = close hair + a bun).
import * as THREE from 'three';
import { mk } from './core.js';
import { eyeAim, faceKind } from './gaze.js';

export const HUMAN = { on: false, base: '/assets/bodies/', bodies: null };

// who -> body id (bodies.json); anything else: adult_f / adult_m by sex (children: the nearest Jade body by height)
const BODY_OF = { jade3: 'jade03', jade4h: 'jade04h', littleJade: 'jade05', jade7: 'jade07', jade10: 'jade10', jade19: 'jade19', jade27: 'jade27', jade: 'jade40',
  mama: 'mama', mama86: 'mama', mama90: 'mama', mama91: 'mama', dad: 'dad', firstLove19: 'firstlove19', firstLove27: 'firstlove27', friend: 'friend',
  uncle: 'uncle', aunt: 'aunt', grandma: 'grandma', sw: 'sw', daughter: 'daughter', toddler: 'toddler', partner: 'partner' };
const MALE = /^(dad|firstLove|uncle|partner|friend|grandpa|man|boy)/i;
function bodyFor(who, c) {
  if (BODY_OF[who]) return BODY_OF[who];
  if (c.sex === 'm' || c.sex === 'f') return c.sex === 'm' ? 'adult_m' : 'adult_f';
  if (MALE.test(who)) return 'adult_m';
  return c.hairStyle === 'short' ? 'adult_m' : 'adult_f';   // guests / workers: the engine's own guess (figure2.js torsoType)
}

// ---------------------------------------------------------------- GLB reading (positions, normals, skin, indices)
function parseGLB(buf) {
  const dv = new DataView(buf), jl = dv.getUint32(12, true);
  const J = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
  const binOff = 20 + jl + 8;
  const CT = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array };
  const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const acc = (i) => { const a = J.accessors[i], bv = J.bufferViews[a.bufferView], T = CT[a.componentType], n = NC[a.type];
    const off = binOff + (bv.byteOffset || 0) + (a.byteOffset || 0), es = T.BYTES_PER_ELEMENT * n;
    if (bv.byteStride && bv.byteStride !== es) { const out = new T(a.count * n), src = new DataView(buf); const rd = { 5126: 'getFloat32', 5125: 'getUint32', 5123: 'getUint16', 5121: 'getUint8' }[a.componentType];
      for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) out[k * n + c] = src[rd](off + k * bv.byteStride + c * T.BYTES_PER_ELEMENT, true); return out; }
    return new T(buf.slice(off, off + a.count * es)); };
  const skin = J.skins[0], jointNames = skin.joints.map((k) => J.nodes[k].name);
  const meshes = {};
  for (const nd of J.nodes) { if (nd.mesh == null) continue; const pr = J.meshes[nd.mesh].primitives[0], at = pr.attributes;
    meshes[nd.name.split('.')[0]] = { pos: acc(at.POSITION), nrm: acc(at.NORMAL), jnt: acc(at.JOINTS_0), wgt: acc(at.WEIGHTS_0), idx: acc(pr.indices) }; }
  return { jointNames, meshes };
}

export async function loadBodies() {
  const meta = await (await fetch(HUMAN.base + 'meta.json')).json();
  const ids = Object.keys(meta);
  const out = {};
  await Promise.all(ids.map(async (id) => { const r = await fetch(HUMAN.base + id + '.glb'); if (!r.ok) return; out[id] = { ...parseGLB(await r.arrayBuffer()), meta: meta[id] }; }));
  HUMAN.bodies = out; return out;
}

// ---------------------------------------------------------------- small vector helpers
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const zup = (a) => new THREE.Vector3(a[0], a[2], -a[1]);          // Blender z-up -> glTF y-up
const perp = (v, a) => v.clone().addScaledVector(a, -v.dot(a));
const nrmz = (v, fb) => { const l = v.length(); return l > 1e-9 ? v.multiplyScalar(1 / l) : (fb ? fb.clone() : new THREE.Vector3(1, 0, 0)); };
const smooth = (x, a, b) => THREE.MathUtils.smoothstep(x, a, b);
function basis(x, y, z) { return new THREE.Matrix4().makeBasis(x, y, z); }
// rest frame (ref r0 _|_ axis a0) -> target frame (r1, a1); scale s along the axis; restH -> tgtH
function aimMatrix(restH, a0, r0, tgtH, a1, r1, s) {
  const R0 = basis(r0, a0, new THREE.Vector3().crossVectors(r0, a0)), R1 = basis(r1, a1, new THREE.Vector3().crossVectors(r1, a1));
  const R = R1.multiply(R0.clone().transpose());
  const S = new THREE.Matrix4(); const e = S.elements; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) e[j * 4 + i] = (i === j ? 1 : 0) + (s - 1) * a0.getComponent(i) * a0.getComponent(j);
  return new THREE.Matrix4().makeTranslation(tgtH.x, tgtH.y, tgtH.z).multiply(R).multiply(S).multiply(new THREE.Matrix4().makeTranslation(-restH.x, -restH.y, -restH.z));
}
function rigidMatrix(restO, R0, tgtO, R1, s = 1) {
  const R = R1.clone().multiply(R0.clone().transpose());
  return new THREE.Matrix4().makeTranslation(tgtO.x, tgtO.y, tgtO.z).multiply(R).multiply(new THREE.Matrix4().makeScale(s, s, s)).multiply(new THREE.Matrix4().makeTranslation(-restO.x, -restO.y, -restO.z));
}
const signedAngle = (a, b, axis) => Math.atan2(new THREE.Vector3().crossVectors(a, b).dot(axis), a.dot(b));

// ---------------------------------------------------------------- the rest skeleton of a body, scaled to a height
function restSkeleton(B, k) {
  const bones = {};
  for (const [n, b] of Object.entries(B.meta.bones_blender_zup)) bones[n] = { head: zup(b.head).multiplyScalar(k), tail: zup(b.tail).multiplyScalar(k), parent: b.parent };
  return bones;
}

// ---------------------------------------------------------------- pose: one matrix (and optional twist) per bone
function solvePose(B, bones, P, spec, c, k) {
  const M = {}, TW = {};   // TW[bone] = { axis, pivot, angle, h0, a0, len0 }: extra twist about the bone axis, ramped along it
  const H = c.h, hd = (n) => bones[n].head, tl = (n) => bones[n].tail;
  const { cx, cy, cz, qB } = P;
  const bx = new THREE.Vector3(1, 0, 0).applyQuaternion(qB), by = new THREE.Vector3(0, 1, 0).applyQuaternion(qB);
  const qC = new THREE.Quaternion().setFromRotationMatrix(basis(cx, cy, cz));
  const RC = basis(cx, cy, cz), RB = basis(bx, by, new THREE.Vector3(0, 0, 1).applyQuaternion(qB));
  const I3 = new THREE.Matrix4();
  // --- torso: rest hip centre H0 (mid thigh heads) .. C0 (neck base) mapped onto the solver's spine curve
  const H0 = hd('thigh_l').clone().add(hd('thigh_r')).multiplyScalar(0.5), C0 = hd('neck_01').clone();
  const p0 = P.hip.clone().addScaledVector(by, 0.01 * H), p2 = P.shoulderC.clone().addScaledVector(cy, 0.004 * H), tw = 0.35;
  const pc = P.waist.clone().addScaledVector(p0, -((1 - tw) ** 2)).addScaledVector(p2, -tw * tw).multiplyScalar(1 / (2 * tw * (1 - tw)));
  const curve = (t) => p0.clone().multiplyScalar((1 - t) ** 2).addScaledVector(pc, 2 * t * (1 - t)).addScaledVector(p2, t * t);
  const frameQ = (t) => qB.clone().slerp(qC, smooth(t, 0.15, 0.75));
  const tOf = (p) => (p.y - H0.y) / (C0.y - H0.y);
  const onSpine = (p) => { const t = tOf(p), q = frameQ(THREE.MathUtils.clamp(t, 0, 1)); const lin = H0.clone().lerp(C0, t);
    return curve(t).addScaledVector(new THREE.Vector3(0, 0, 1).applyQuaternion(q), p.z - lin.z).addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(q), p.x - lin.x); };
  for (const n of ['pelvis', 'spine_01', 'spine_02', 'spine_03']) {
    const h0 = hd(n), t0 = tl(n), a0 = t0.clone().sub(h0).normalize(), r0 = nrmz(perp(new THREE.Vector3(1, 0, 0), a0));
    const h1 = onSpine(h0), t1 = onSpine(t0), a1 = t1.clone().sub(h1), len = a1.length(); a1.normalize();
    const r1 = nrmz(perp(new THREE.Vector3(1, 0, 0).applyQuaternion(frameQ(THREE.MathUtils.clamp(tOf(h0), 0, 1))), a1));
    M[n] = aimMatrix(h0, a0, r0, h1, a1, r1, len / t0.distanceTo(h0));
  }
  M.Root = M.pelvis;
  const chestRigid = rigidMatrix(C0, I3, P.shoulderC.clone().addScaledVector(cy, 0.005 * H), RC);
  // --- head: rigid on the solver's head frame, the rest head bone's head (top of the neck) at the solver's neck top
  const hx = P.headX, hy = P.headUp, hz = P.headFwd, RH = basis(hx, hy, hz);
  // the head is placed by its eyes: the mesh's eye midpoint on the solver's eyes (P.eyes is the skin between the eyes;
  // the eyeballs' centres sit ~0.0075 H behind it), so every face target the sets use (eyes, nose, mouth, cheeks, chin)
  // keeps its place on the face; the neck stretches to meet it
  const lm = B.meta.landmarks_blender_zup, E0 = zup(lm.eye_l).add(zup(lm.eye_r)).multiplyScalar(0.5 * k);
  const headAt = P.eyes.clone().addScaledVector(hz, -0.0075 * H);
  M.head = rigidMatrix(E0, I3, headAt, RH);
  let neckTop = hd('head').clone().applyMatrix4(M.head);
  { // ...within reason: the neck stretches at most 30 % (or shrinks 15 %); beyond that the head stays short of the eyes
    const nb = C0.clone().applyMatrix4(chestRigid), L0 = hd('head').distanceTo(C0), L1 = neckTop.distanceTo(nb), Lc = THREE.MathUtils.clamp(L1, 0.85 * L0, 1.3 * L0);
    if (Math.abs(Lc - L1) > 1e-4) { const d = neckTop.clone().sub(nb).normalize(), sh = d.multiplyScalar(Lc - L1); headAt.add(sh); neckTop.add(sh); M.head = rigidMatrix(E0, I3, headAt, RH);
      // the face's named points follow the mesh face, so cameras and other figures' hands (second staging pass) find it
      P.headMeshOffset = +sh.length().toFixed(3);
      for (const k2 of ['head', 'eyes', 'nose', 'mouth', 'chin', 'forehead', 'earL', 'earR', 'headTop', 'backOfHead']) if (P[k2]) P[k2].add(sh); }
    P.headMeshOffset ??= 0; }
  { const h0 = C0, t0 = hd('head'), a0 = t0.clone().sub(h0).normalize(), r0 = nrmz(perp(new THREE.Vector3(1, 0, 0), a0));
    const h1 = h0.clone().applyMatrix4(chestRigid), a1 = neckTop.clone().sub(h1), len = a1.length(); a1.normalize();
    M.neck_01 = aimMatrix(h0, a0, r0, h1, a1, nrmz(perp(cx.clone().add(hx), a1)), len / t0.distanceTo(h0)); }
  // eyes: each eye bone turned by the gaze split (engine/gaze.js), about its own centre
  for (const s of ['l', 'r']) { const n = 'eye_' + s; if (!bones[n]) continue;
    const e0 = hd(n), e1 = e0.clone().applyMatrix4(M.head);
    let R = RH.clone();
    if (P.lookAt) { const d = P.lookAt.clone().sub(e1).normalize(); const e = eyeAim(d, { hx, hy, hdir: hz });
      R = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(hz, e.dir)).multiply(RH); }
    M[n] = rigidMatrix(e0, I3, e1, R); (P.eyeCentres ||= {})[s] = e1; }
  // --- arms
  const report = {};
  for (const [s, n, sg] of [['l', 'L', 1], ['r', 'R', -1]]) {
    // clavicle head rides with the chest; the upper arm head (the mesh's shoulder joint, below the solver's shoulder point)
    // rises toward the solver's shoulder as the arm lifts (scapular elevation)
    const S1 = P['shoulder' + n], E1 = P['elbow' + n], W1 = P['wrist' + n];
    const u1 = E1.clone().sub(S1).normalize(), el = Math.acos(THREE.MathUtils.clamp(-u1.dot(cy), -1, 1));
    const Urest = hd('upperarm_' + s).clone().applyMatrix4(chestRigid);
    const U1 = Urest.clone().lerp(S1, 0.75 * smooth(el, 0.5, 1.9));
    { const h0 = hd('clavicle_' + s), t0 = hd('upperarm_' + s), a0 = t0.clone().sub(h0).normalize(), r0 = nrmz(perp(new THREE.Vector3(0, 0, 1), a0));
      const h1 = h0.clone().applyMatrix4(chestRigid), a1 = U1.clone().sub(h1), len = a1.length(); a1.normalize();
      M['clavicle_' + s] = aimMatrix(h0, a0, r0, h1, a1, nrmz(perp(cz, a1)), len / t0.distanceTo(h0)); }
    // the elbow's bending plane, rest and solved
    const ua0 = hd('lowerarm_' + s).clone().sub(hd('upperarm_' + s)).normalize(), fa0 = hd('hand_' + s).clone().sub(hd('lowerarm_' + s)).normalize();
    const nb0 = nrmz(new THREE.Vector3().crossVectors(ua0, fa0));
    const ua1 = E1.clone().sub(U1).normalize(), fa1 = W1.clone().sub(E1).normalize();
    const bend = Math.acos(THREE.MathUtils.clamp(ua1.dot(fa1), -1, 1));
    // the hand frame (solver: f fingers, n palm normal, t thumb side) and the rest hand frame
    const hp = P.hands[n], f1 = hp.f.clone().normalize(), n1 = hp.n.clone().normalize(), t1 = n === 'R' ? new THREE.Vector3().crossVectors(f1, n1) : new THREE.Vector3().crossVectors(n1, f1);
    const wr0 = hd('hand_' + s), f0 = hd('middle_01_' + s).clone().sub(wr0).normalize();
    const t0 = nrmz(perp(hd('index_01_' + s).clone().sub(hd('pinky_01_' + s)), f0));
    const n0 = n === 'R' ? new THREE.Vector3().crossVectors(t0, f0) : new THREE.Vector3().crossVectors(f0, t0);
    // bend normal seen from the hand (rest), carried to the solved hand: the forearm's far end turns with the hand
    const cH = [nb0.dot(t0), nb0.dot(n0), nb0.dot(f0)];
    const fromHand = (a) => nrmz(perp(t1.clone().multiplyScalar(cH[0]).addScaledVector(n1, cH[1]).addScaledVector(f1, cH[2]), a));
    const swing = (v, a0, a1) => v.clone().applyQuaternion(new THREE.Quaternion().setFromUnitVectors(a0, a1));
    let nb1 = nrmz(new THREE.Vector3().crossVectors(ua1, fa1));
    { const kb = smooth(bend, 0.12, 0.4), alt = fromHand(ua1); nb1 = nrmz(nb1.multiplyScalar(kb).addScaledVector(alt, 1 - kb), alt); }
    { const h0 = hd('upperarm_' + s), t0_ = hd('lowerarm_' + s), a1 = ua1;
      const rStart = nrmz(perp(swing(nb0, ua0, a1), a1)), rEnd = nrmz(perp(nb1, a1));
      M['upperarm_' + s] = aimMatrix(h0, ua0, nb0, U1, a1, rStart, E1.distanceTo(U1) / t0_.distanceTo(h0));
      TW['upperarm_' + s] = { axis: a1, pivot: U1, angle: signedAngle(rStart, rEnd, a1), h0, a0: ua0, len0: t0_.distanceTo(h0) }; }
    { const h0 = hd('lowerarm_' + s), t0_ = hd('hand_' + s), a1 = fa1;
      const rStart = nrmz(perp(nb1, a1)), rEnd = fromHand(a1);
      M['lowerarm_' + s] = aimMatrix(h0, fa0, nrmz(perp(nb0, fa0)), E1, a1, rStart, W1.distanceTo(E1) / t0_.distanceTo(h0));
      TW['lowerarm_' + s] = { axis: a1, pivot: E1, angle: signedAngle(rStart, rEnd, a1), h0, a0: fa0, len0: t0_.distanceTo(h0) }; }
    // hand: rigid on the solver's hand frame, scaled to the solver's hand length
    const Lh0 = tl('middle_03_' + s).distanceTo(wr0), sH = hp.Lh / Lh0;
    M['hand_' + s] = rigidMatrix(wr0, basis(t0, n0, f0), W1, basis(t1, n1, f1), sH);
    // fingers: on the solver's own joints (knuckle, PIP, DIP, tip; thumb CMC, MCP, IP, tip)
    const FN = { index: 'index', middle: 'middle', ring: 'ring', little: 'pinky', thumb: 'thumb' };
    for (const [fs, fm] of Object.entries(FN)) {
      const w = hp.joints?.[fs]; if (!w) continue;
      let h1 = w[0].clone();   // the solver's knuckle: fingertips land exactly where the pose solver (and the hold check) put them
      for (let kk = 0; kk < 3; kk++) { const bn = `${fm}_0${kk + 1}_${s}`, h0 = hd(bn), t0b = tl(bn), a0 = t0b.clone().sub(h0).normalize();
        const a1 = w[kk + 1].clone().sub(w[kk]); const L1 = a1.length(); a1.normalize();
        const ref0 = fs === 'thumb' ? n0 : t0, ref1 = fs === 'thumb' ? n1 : t1;
        M[bn] = aimMatrix(h0, a0, nrmz(perp(ref0, a0)), h1, a1, nrmz(perp(ref1, a1)), L1 / t0b.distanceTo(h0));
        h1 = h1.clone().addScaledVector(a1, L1); }
    }
    report[n] = { elbow_bend_deg: +(bend * 180 / Math.PI).toFixed(0), upperarm_stretch: +(E1.distanceTo(U1) / tl('upperarm_' + s).distanceTo(hd('upperarm_' + s))).toFixed(2),
      forearm_stretch: +(W1.distanceTo(E1) / hd('hand_' + s).distanceTo(hd('lowerarm_' + s))).toFixed(2), hand_scale: +sH.toFixed(2) };
  }
  // --- legs
  for (const [s, n] of [['l', 'L'], ['r', 'R']]) {
    const Hj = P['hip' + n], K = P['knee' + n], A = P['ankle' + n];
    const fd = nrmz(P['foot' + n].clone().sub(A)), upF = nrmz(perp(A.clone().sub(P['heel' + n]), fd), by);
    const th1 = K.clone().sub(Hj).normalize(), sh1 = A.clone().sub(K).normalize();
    const bend = Math.acos(THREE.MathUtils.clamp(th1.dot(sh1), -1, 1)), kb = smooth(bend, 0.14, 0.45);
    const kneeFwd = nrmz(K.clone().sub(Hj.clone().lerp(A, 0.5)));
    const ref = (a) => { const r = nrmz(perp(kneeFwd, a)).multiplyScalar(kb).addScaledVector(nrmz(perp(fd, a)), 1 - kb); return nrmz(perp(r, a)); };
    const F0 = new THREE.Vector3(0, 0, 1);
    { const h0 = hd('thigh_' + s), t0 = tl('thigh_' + s), a0 = t0.clone().sub(h0).normalize();
      const rS = nrmz(perp(F0.clone().applyQuaternion(qB), th1)), rE = ref(th1);
      M['thigh_' + s] = aimMatrix(h0, a0, nrmz(perp(F0, a0)), Hj, th1, rS, K.distanceTo(Hj) / t0.distanceTo(h0));
      TW['thigh_' + s] = { axis: th1, pivot: Hj, angle: signedAngle(rS, rE, th1), h0, a0, len0: t0.distanceTo(h0) }; }
    { const h0 = hd('calf_' + s), t0 = tl('calf_' + s), a0 = t0.clone().sub(h0).normalize();
      M['calf_' + s] = aimMatrix(h0, a0, nrmz(perp(F0, a0)), K, sh1, ref(sh1), A.distanceTo(K) / t0.distanceTo(h0)); }
    // foot + ball: rigid on the foot frame, scaled to the solver's foot length
    const a0 = hd('foot_' + s), fwd0 = nrmz(perp(tl('ball_' + s).clone().sub(a0), new THREE.Vector3(0, 1, 0)));
    const R0 = basis(new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), fwd0), new THREE.Vector3(0, 1, 0), fwd0), R1 = basis(new THREE.Vector3().crossVectors(upF, fd), upF, fd);
    const FL1 = P['toe' + n].clone().sub(P['heel' + n]).dot(fd), FL0 = B.footLen * k;
    M['foot_' + s] = M['ball_' + s] = rigidMatrix(a0, R0, A, R1, THREE.MathUtils.clamp(FL1 / FL0, 0.8, 1.25));
  }
  return { M, TW, report };
}

// ---------------------------------------------------------------- bake a skinned mesh with the pose
function bake(mesh, jointNames, k, M, TW) {
  const n = mesh.pos.length / 3, out = new Float32Array(n * 3);
  const Ms = jointNames.map((nm) => M[nm] || null), Ts = jointNames.map((nm) => TW[nm] || null);
  const v = new THREE.Vector3(), acc = new THREE.Vector3(), tmp = new THREE.Vector3(), q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    acc.set(0, 0, 0); let ws = 0;
    for (let j = 0; j < 4; j++) { const w = mesh.wgt[i * 4 + j]; if (w <= 0) continue; const bi = mesh.jnt[i * 4 + j], m = Ms[bi]; if (!m) continue;
      v.set(mesh.pos[i * 3] * k, mesh.pos[i * 3 + 1] * k, mesh.pos[i * 3 + 2] * k);
      const t = Ts[bi]; let tt = 0; if (t && t.angle) tt = THREE.MathUtils.clamp(v.clone().sub(t.h0).dot(t.a0) / t.len0, 0, 1);
      tmp.copy(v).applyMatrix4(m);
      if (tt) { q.setFromAxisAngle(t.axis, t.angle * tt); tmp.sub(t.pivot).applyQuaternion(q).add(t.pivot); }
      acc.addScaledVector(tmp, w); ws += w; }
    if (ws > 0) acc.multiplyScalar(1 / ws); else acc.set(mesh.pos[i * 3] * k, mesh.pos[i * 3 + 1] * k, mesh.pos[i * 3 + 2] * k);
    out[i * 3] = acc.x; out[i * 3 + 1] = acc.y; out[i * 3 + 2] = acc.z;
  }
  return out;
}
// a sub-mesh of the triangles whose region is r (vertices compacted), normals from the whole surface
function subGeo(pos, nrm, idx, triKeep) {
  const map = new Int32Array(pos.length / 3).fill(-1), P = [], N = [], I = [];
  for (let f = 0; f < idx.length / 3; f++) { if (!triKeep(f)) continue;
    for (let c = 0; c < 3; c++) { const a = idx[f * 3 + c]; if (map[a] < 0) { map[a] = P.length / 3; P.push(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]); N.push(nrm[a * 3], nrm[a * 3 + 1], nrm[a * 3 + 2]); } I.push(map[a]); } }
  if (!I.length) return null;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setIndex(I);
  return g;
}
function normalsOf(pos, idx) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals(); return g.getAttribute('normal').array; }

// ---------------------------------------------------------------- per-body rest analysis (bone groups, regions), cached
function prep(B) {
  if (B.prep) return B.prep;
  const J = B.jointNames, body = B.meshes.body, n = body.pos.length / 3;
  const grp = (nm) => { if (/^(pelvis|spine_0[123]|Root)$/.test(nm)) return 'torso'; if (/^clavicle/.test(nm)) return 'torso'; if (nm === 'neck_01') return 'neck'; if (/^(head|eye_)/.test(nm)) return 'head';
    if (/^upperarm_/.test(nm)) return 'ua' + nm.slice(-1); if (/^lowerarm_/.test(nm)) return 'fa' + nm.slice(-1); if (/^(hand_|index|middle|ring|pinky|thumb)/.test(nm)) return 'hand' + nm.slice(-1);
    if (/^thigh_/.test(nm)) return 'th' + nm.slice(-1); if (/^calf_/.test(nm)) return 'calf' + nm.slice(-1); if (/^(foot_|ball_)/.test(nm)) return 'foot' + nm.slice(-1); return 'torso'; };
  const jg = J.map(grp), dom = new Array(n);
  for (let i = 0; i < n; i++) { const s = {}; for (let j = 0; j < 4; j++) { const w = body.wgt[i * 4 + j]; if (w > 0) s[jg[body.jnt[i * 4 + j]]] = (s[jg[body.jnt[i * 4 + j]]] || 0) + w; }
    let best = 'torso', bw = -1; for (const [g, w] of Object.entries(s)) if (w > bw) { bw = w; best = g; } dom[i] = best; }
  const bones = restSkeleton(B, 1);
  // foot length along the rest foot (heel to toe)
  let lo = 1e9, hi = -1e9; for (let i = 0; i < n; i++) if (dom[i] === 'footl') { const z = body.pos[i * 3 + 2]; lo = Math.min(lo, z); hi = Math.max(hi, z); }
  B.footLen = hi - lo;
  // vertex parameter along its limb bone (0 at the bone's head, 1 at its tail), for sleeve / sock lengths
  const along = new Float32Array(n);
  const segOf = { ual: 'upperarm_l', uar: 'upperarm_r', fal: 'lowerarm_l', far: 'lowerarm_r', thl: 'thigh_l', thr: 'thigh_r', calfl: 'calf_l', calfr: 'calf_r' };
  for (let i = 0; i < n; i++) { const bn = segOf[dom[i]]; if (!bn) continue; const h = bones[bn].head, t = bones[bn].tail, a = t.clone().sub(h), L = a.length(); a.divideScalar(L);
    along[i] = (body.pos[i * 3] - h.x) * a.x + (body.pos[i * 3 + 1] - h.y) * a.y + (body.pos[i * 3 + 2] - h.z) * a.z; along[i] /= L; }
  const H0 = bones.thigh_l.head.clone().add(bones.thigh_r.head).multiplyScalar(0.5), C0 = bones.neck_01.head.clone();
  B.prep = { dom, along, H0, C0, bones, jg };
  return B.prep;
}

const clothes = (lk) => { const col = new THREE.Color(lk.col ?? 0x808080); return { ...lk, formTint: [col.r, col.g, col.b], flatCol: lk.col, costumeCol: lk.col }; };
const GREY = { skin: 0.78, hair: 0.12, top: 0.62, legs: 0.42, apron: 0.72, band: 0.5 };
// the costume's region at a rest point p with skin weights wm (Map joint index -> weight): top / legs / sock / skin /
// band / apron / hand / skinHead. Region borders are cut exactly through the triangles (refine), so hems are clean lines.
function labeller(B, c, spec) {
  const { jg, H0, C0, bones } = prep(B), T = C0.y - H0.y, waistY = H0.y + 0.3 * T, collarY = C0.y - 0.035 * T, h0 = B.meta.h;
  const sleeves = c.sleeves || 'long', dress = !!c.dress, legsSkin = spec.who === 'daughter';
  const bandY = c.band ? H0.y + (0.38 + 0.62 * 0.2 - 0.06) * T : null, bandH = 0.0175 * h0;
  const apron = c.apron && !spec.noApron;
  const SEG = { ual: 'upperarm_l', uar: 'upperarm_r', fal: 'lowerarm_l', far: 'lowerarm_r', thl: 'thigh_l', thr: 'thigh_r', calfl: 'calf_l', calfr: 'calf_r' };
  const segA = {}; for (const [k, bn] of Object.entries(SEG)) { const h = bones[bn].head, a = bones[bn].tail.clone().sub(h); const L = a.length(); segA[k] = { h, a: a.divideScalar(L), L }; }
  return (p, wm) => {
    const s = {}; for (const [j, w] of wm) s[jg[j]] = (s[jg[j]] || 0) + w;
    let d = 'torso', bw = -1; for (const [g, w] of Object.entries(s)) if (w > bw) { bw = w; d = g; }
    const { x, y, z } = p, side = d.slice(-1).toUpperCase(); let t = 0;
    if (segA[d]) { const S = segA[d]; t = ((x - S.h.x) * S.a.x + (y - S.h.y) * S.a.y + (z - S.h.z) * S.a.z) / S.L; }
    let r = 'skin';
    // the neckline: one smooth line round the neck (lower in front), the same rule for torso and neck vertices
    const collar = C0.y - 0.045 * T * THREE.MathUtils.clamp((z - C0.z) / (0.04 * h0) + 0.5, 0, 1) - 0.004 * h0;
    if (d === 'torso' || d === 'neck') r = y < waistY ? (dress ? 'top' : 'legs') : y > collar ? (d === 'neck' ? 'skinNeck' : 'skin') : 'top';
    else if (d.startsWith('ua')) r = sleeves === 'none' ? 'skin' : sleeves === 'short' ? (t < 0.42 ? 'top' : 'skin') : 'top';
    else if (d.startsWith('fa')) r = sleeves === 'long' ? 'top' : sleeves === 'pushed' ? (t < 0.35 ? 'top' : 'skin') : 'skin';
    else if (d.startsWith('th')) r = dress && t < 0.5 ? 'top' : 'legs';
    else if (d.startsWith('calf')) r = t > 0.9 ? 'sock' : 'legs';
    else if (d.startsWith('foot')) r = 'sock';
    if (d.startsWith('hand')) return 'hand' + side;
    if (bandY != null && r === 'top' && d === 'torso' && Math.abs(y - bandY) < bandH) r = 'band';
    if (apron && (d === 'torso' || d.startsWith('th')) && z > H0.z + 0.035 * h0 && Math.abs(x) < 0.062 * h0 && y < H0.y + 0.5 * T && y > H0.y - 0.16 * h0) r = 'apron';
    if (r === 'legs' || r === 'sock') { if (legsSkin) return 'skin'; return r + (side === 'L' || side === 'R' ? side : (x > 0 ? 'L' : 'R')); }
    if (r === 'skin' && d === 'head') return 'skinHead';   // head and neck skin are their own meshes: hideParts 'head' (POV shots) takes them
    return r;
  };
}
// cut the rest body along the costume's region borders: returns { pos, jnt, wgt, idx, tri (label per triangle) }
function refine(B, c, spec) {
  const key = [c.sleeves, !!c.dress, c.band ? 1 : 0, c.apron && !spec.noApron ? 1 : 0, spec.who === 'daughter'].join('|');
  (B.refined ||= {}); if (B.refined[key]) return B.refined[key];
  const L = labeller(B, c, spec), body = B.meshes.body, n0 = body.pos.length / 3;
  const pos = [], W = [];
  for (let i = 0; i < n0; i++) { pos.push(new THREE.Vector3(body.pos[i * 3], body.pos[i * 3 + 1], body.pos[i * 3 + 2]));
    const m = new Map(); for (let j = 0; j < 4; j++) { const w = body.wgt[i * 4 + j]; if (w > 0) m.set(body.jnt[i * 4 + j], (m.get(body.jnt[i * 4 + j]) || 0) + w); } W.push(m); }
  const cls = (l) => (l && l.startsWith('skin') ? 'skin' : l);   // head / neck / body skin differ only as meshes: no cut between them
  const lab = pos.map((p, i) => L(p, W[i])), labC = lab.map(cls);
  const mix = (a, b, t) => { const m = new Map(); for (const [j, w] of W[a]) m.set(j, w * (1 - t)); for (const [j, w] of W[b]) m.set(j, (m.get(j) || 0) + w * t); return m; };
  const cut = new Map();
  const crossing = (a, b) => { const k = a < b ? a + ':' + b : b + ':' + a; if (cut.has(k)) return cut.get(k);
    const la = labC[a]; let lo = 0, hi = 1;
    for (let it = 0; it < 12; it++) { const t = (lo + hi) / 2; if (cls(L(pos[a].clone().lerp(pos[b], t), mix(a, b, t))) === la) lo = t; else hi = t; }
    const t = (lo + hi) / 2; pos.push(pos[a].clone().lerp(pos[b], t)); W.push(mix(a, b, t)); lab.push(null); labC.push(null); cut.set(k, pos.length - 1); return pos.length - 1; };
  const idx = [], tri = [], I = body.idx;
  for (let f = 0; f < I.length / 3; f++) {
    const v = [I[f * 3], I[f * 3 + 1], I[f * 3 + 2]], l = v.map((i) => labC[i]);
    const pick = (c) => lab[v.find((i) => labC[i] === c)];   // the specific label (skinHead / skinNeck / skin) of that class
    if (l[0] === l[1] && l[1] === l[2]) { idx.push(...v); tri.push(pick(l[0])); continue; }
    const set = new Set(l); if (set.size === 3) { idx.push(...v); tri.push(pick(l[0])); continue; }
    const o = l[0] !== l[1] && l[0] !== l[2] ? 0 : l[1] !== l[0] && l[1] !== l[2] ? 1 : 2;   // the odd corner first, winding kept
    const A = v[o], Bv = v[(o + 1) % 3], C = v[(o + 2) % 3], pab = crossing(A, Bv), pac = crossing(A, C);
    idx.push(A, pab, pac); tri.push(lab[A]); idx.push(pab, Bv, C); tri.push(lab[Bv]); idx.push(pab, C, pac); tri.push(lab[Bv]);
  }
  const n = pos.length, P = new Float32Array(n * 3), J = new Uint16Array(n * 4), Wt = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { P[i * 3] = pos[i].x; P[i * 3 + 1] = pos[i].y; P[i * 3 + 2] = pos[i].z;
    const e = [...W[i]].sort((x, y) => y[1] - x[1]).slice(0, 4), sw = e.reduce((s, x) => s + x[1], 0) || 1; e.forEach(([j, w], k) => { J[i * 4 + k] = j; Wt[i * 4 + k] = w / sw; }); }
  return (B.refined[key] = { pos: P, jnt: J, wgt: Wt, idx: new Uint32Array(idx), tri });
}

// ---------------------------------------------------------------- the hook (mannequin.js buildFigure)
export function dressFigure(g, spec, c, P, uid) {
  const id = bodyFor(spec.who, c), B = HUMAN.bodies?.[id];
  if (!B) throw new Error(`PROOF_BODY=mesh: no body "${id}" for ${spec.who} (run layout/assets/bodies/make_bodies.py)`);
  const k = c.h / B.meta.h;
  const bones = restSkeleton(B, k);
  B.footLen ?? prep(B);
  const { M, TW, report } = solvePose(B, bones, P, spec, c, k);
  // drop the mannequin's meshes (keep held props: labelled meshes in the hand groups)
  const drop = []; g.traverse((o) => { if (o.isMesh && !o.userData.label) drop.push(o); }); for (const o of drop) o.parent.remove(o);
  const look = (key, col, extra = {}) => ({ grey: GREY[key] ?? 0.6, col: col ?? 0x808080, ...extra });
  const skin = look('skin', c.skin), hairL = look('hair', c.hair);
  const LK = { skin, skinHead: skin, skinNeck: skin, handL: skin, handR: skin, top: look('top', c.top), legsL: look('legs', c.legs), legsR: look('legs', c.legs),
    sockL: { grey: 0.5, col: c.sock ?? 0x6a6a70 }, sockR: { grey: 0.5, col: c.sock ?? 0x6a6a70 }, band: look('band', c.band), apron: look('apron', c.apron) };
  for (const r of ['top', 'legsL', 'legsR', 'sockL', 'sockR', 'band', 'apron']) LK[r] = clothes(LK[r]);
  const GROUP = { skin: 'skin', skinHead: 'skin', skinNeck: 'skin', handL: 'skin', handR: 'skin', top: 'top', band: 'band', apron: 'apron', legsL: 'legL', legsR: 'legR', sockL: 'footL', sockR: 'footR' };
  // body
  const body = refine(B, c, spec), pos = bake(body, B.jointNames, k, M, TW), nrm = normalsOf(pos, body.idx), idx = body.idx, tr = body.tri;
  for (const r of new Set(tr)) {
    const geo = subGeo(pos, nrm, idx, (f) => tr[f] === r); if (!geo) continue;
    const m = mk(geo, LK[r] || skin); m.userData.idGroup = uid + GROUP[r]; m.userData.bodyRegion = r;
    if (r === 'handL' || r === 'handR') P.hands[r.slice(-1)].group.add(m); else g.add(m);
  }
  // hair (one style), brows, eyes
  const style = c.hairStyle || 'short';
  const hairKey = B.meshes['hair_kid' + style] ? 'hair_kid' + style : B.meshes['hair_' + style] ? 'hair_' + style : Object.keys(B.meshes).find((x) => x.startsWith('hair_'));
  const addPart = (key, lk, grp, lift = 0) => { const ms = B.meshes[key]; if (!ms) return null; const p = bake(ms, B.jointNames, k, M, TW);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setIndex(new THREE.BufferAttribute(ms.idx, 1)); geo.computeVertexNormals();
    if (lift) { const nn = geo.getAttribute('normal').array; for (let i = 0; i < p.length; i++) p[i] += nn[i] * lift; geo.getAttribute('position').needsUpdate = true; }
    const m = mk(geo, lk); m.userData.idGroup = uid + grp; m.userData.double = true; g.add(m); return m; };
  if (hairKey) addPart(hairKey, hairL, 'hair', 0.004 * c.h / 1.7);   // lifted 4 mm off the scalp: a thin shell on the skin z-fights into specks in line mode
  if (style === 'bun') { const b = mk(new THREE.SphereGeometry(P.headH * 0.2, 20, 14), hairL); b.position.copy(P.head).addScaledVector(P.headFwd, -P.headH * 0.5).addScaledVector(P.headUp, P.headH * 0.02); b.scale.set(1, 0.85, 0.8); b.quaternion.setFromRotationMatrix(basis(P.headX, P.headUp, P.headFwd)); b.userData.idGroup = uid + 'hair'; g.add(b); }
  const face = faceKind(spec.who), drawn = face === 'drawn' && !c.undrawn;
  if (drawn && B.meshes.brows) addPart('brows', hairL, 'brows');
  if (drawn && B.meshes.eyes) eyes(g, B, k, M, TW, uid);
  P.bodyReport = { mesh: id, scale: +k.toFixed(3), face: drawn ? 'drawn' : face, head_short_of_eyes_m: P.headMeshOffset, ...report };
  P.bodyMesh = id;
}

// eyeballs: sclera / iris / pupil by angle from each eye bone's forward axis (rest +z)
function eyes(g, B, k, M, TW, uid) {
  const ms = B.meshes.eyes, n = ms.pos.length / 3, pos = bake(ms, B.jointNames, k, M, TW);
  const ctr = {}; for (const s of ['l', 'r']) ctr[s] = zup(B.meta.bones_blender_zup['eye_' + s].head).multiplyScalar(k);
  const cls = new Array(n);
  for (let i = 0; i < n; i++) { const x = ms.pos[i * 3] * k, y = ms.pos[i * 3 + 1] * k, z = ms.pos[i * 3 + 2] * k; const c = x > 0 ? ctr.l : ctr.r;
    const d = new THREE.Vector3(x - c.x, y - c.y, z - c.z).normalize(); const a = Math.acos(THREE.MathUtils.clamp(d.z, -1, 1));
    cls[i] = a < 0.27 ? 'pupil' : a < 0.6 ? 'iris' : 'sclera'; }
  const nrm = normalsOf(pos, ms.idx);
  const LOOK = { sclera: { grey: 0.96, col: 0xf3f0ea, noCast: true }, iris: { grey: 0.16, col: 0x3a2a1e, noCast: true }, pupil: { grey: 0.03, col: 0x060505, noCast: true } };
  for (const r of ['sclera', 'iris', 'pupil']) { const geo = subGeo(pos, nrm, ms.idx, (f) => { const a = cls[ms.idx[f * 3]], b = cls[ms.idx[f * 3 + 1]], c = cls[ms.idx[f * 3 + 2]]; return (b === c ? b : a) === r; });
    if (!geo) continue; const m = mk(geo, LOOK[r]); m.userData.idGroup = uid + 'eye_' + r; m.userData.gaze = r; g.add(m); }
}
