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
import { limbWeights, limbMask } from './paint.js';

export const HUMAN = { on: false, base: '/assets/bodies/', bodies: null, handFit: true, thumbFit: true };   // handFit: the palm fitted to the solver's knuckles (fit B, 2026-11-27); thumbFit: mesh thumb joints at the mesh's own proportions along the solver's thumb (2026-11-27); false = the old hand

// who -> body id (bodies.json); anything else: adult_f / adult_m by sex (children: the nearest Jade body by height)
const BODY_OF = { jade3: 'jade03', jade4h: 'jade04h', littleJade: 'jade05', jade7: 'jade07', jade10: 'jade10', jade19: 'jade19', jade27: 'jade27', jade: 'jade40',
  mama: 'mama', mama86: 'mama', mama90: 'mama', mama91: 'mama', dad: 'dad', firstLove19: 'firstlove19', firstLove27: 'firstlove27', friend: 'friend',
  uncle: 'uncle', aunt: 'aunt', grandma: 'grandma', sw: 'sw', daughter: 'daughter', toddler: 'toddler', partner: 'partner',
  girl: 'girl4', boy: 'boy7' };   // r5: playground23's kids (make_bodies_pg23.py); Dad in 2023 = costume body 'dad23' (playground23 DAD23)
const MALE = /^(dad|firstLove|uncle|partner|friend|grandpa|man|boy)/i;
function bodyFor(who, c) {
  if (c.body) return c.body;   // a cast entry may name its body explicitly (bodytest copies)
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

// 2026-11-26: the eyeball's own centre, not the eye bone's head: the bone head sits off the ball, so irises classified round
// the bone head sat nasally and turned eyes read cross- / wall-eyed (wall88 WL_eye).
// r6 (2026-11-26, wall88 WL_eye still read cross-eyed): the MPFB eyeball is a sphere with its back cut off, so its bounding-box
// centre (used until r6) sits ~4 mm IN FRONT of the sphere's centre; turning about it slid the ball sideways in the socket.
// Now the sphere centre (x, y of the box; z = the front of the ball minus its radius, half its width) is the pivot and the
// iris axis origin. sphere = false gives the old box centre (kept for reference only).
function eyeBall(B, s, k, sphere = true) {
  const ms = B.meshes.eyes; if (!ms) return null;
  const c = (B._eyeBall ||= {}); if (!c[s]) { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let i = 0; i < ms.pos.length; i += 3) { if ((ms.pos[i] > 0) !== (s === 'l')) continue; for (let j = 0; j < 3; j++) { lo[j] = Math.min(lo[j], ms.pos[i + j]); hi[j] = Math.max(hi[j], ms.pos[i + j]); } }
    const box = new THREE.Vector3((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2);
    c[s] = { box, sphere: new THREE.Vector3(box.x, box.y, hi[2] - (hi[0] - lo[0]) / 2) }; }
  return (sphere ? c[s].sphere : c[s].box).clone().multiplyScalar(k);
}
// r6 eye drawing constants (wall88 WL_eye, measured on lit renders with the iris / sclera coded in pure colours):
//   IRIS / PUPIL: half-angles (rad) about the sphere centre. The old 0.6 / 0.27 rad about the box centre made the iris 64 % of
//     the eye opening's width (a real child's is ~45-50 %), so any sideways look jammed the turning-in eye's iris into the
//     nasal corner while the other still read centred: crossed. Now 48 %, pupil 45 % of the iris (as before).
//   KAPPA: the iris axis is turned this many degrees outward (temporal) from the ball's rest forward axis. The MPFB lid
//     opening sits slightly temporal of the ball, so at rest both irises sat 11 % of the opening nasal of centre (a slight
//     squint inward); at 8 deg they sit centred (nasal fraction 0.51-0.52) looking straight ahead.
//   TRAVEL: the MPFB eyeball is ~1.4x a real one against its lid opening (jade05: radius 16.4 mm), so a true turn about its
//     centre slides the iris ~1.4x too far across the opening (22 deg put the iris edge in the corner). The drawn turn is
//     asin(sin(turn) * TRAVEL) about the sphere centre, so the iris crosses the opening as a real eye's does. The gaze
//     report (engine/gaze.js) keeps the true eye angles; only the drawn ball turns less.
const EYE_IRIS = 0.342, EYE_PUPIL = 0.153, EYE_KAPPA = 8, EYE_TRAVEL = 0.72;
function irisAxis(s) { const a = EYE_KAPPA * Math.PI / 180; return new THREE.Vector3((s === 'l' ? 1 : -1) * Math.sin(a), 0, Math.cos(a)); }

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
  { // ...within reason: the neck stretches at most 18 % (or shrinks 15 %); beyond that the head stays short of the eyes
    const nb = C0.clone().applyMatrix4(chestRigid), L0 = hd('head').distanceTo(C0), L1 = neckTop.distanceTo(nb), Lc = THREE.MathUtils.clamp(L1, 0.85 * L0, 1.18 * L0);
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
    const e0 = eyeBall(B, s, k) || hd(n), e1 = e0.clone().applyMatrix4(M.head);
    let R = RH.clone();
    if (P.lookAt) { const d = P.lookAt.clone().sub(e1).normalize(); const e = eyeAim(d, { hx, hy, hdir: hz });
      // r6: drawn turn = asin(sin(turn) * EYE_TRAVEL), yaw and pitch (see EYE_TRAVEL)
      const yw = Math.asin(Math.sin(e.yaw) * EYE_TRAVEL), pt = Math.asin(Math.sin(e.pitch) * EYE_TRAVEL);
      const dir = hz.clone().multiplyScalar(Math.cos(yw) * Math.cos(pt)).addScaledVector(hx, Math.sin(yw) * Math.cos(pt)).addScaledVector(hy, Math.sin(pt)).normalize();
      R = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(hz, dir)).multiply(RH); }
    M[n] = rigidMatrix(e0, I3, e1, R); (P.eyeCentres ||= {})[s] = e1;
    // 2026-11-26: the ball 5 % smaller about its centre, so a turned eye's corneal bulge stays behind the lids (mv10 C2a: a
    // white patch of sclera through the outer corner of the far eye)
    M[n].multiply(new THREE.Matrix4().makeTranslation(e0.x, e0.y, e0.z).multiply(new THREE.Matrix4().makeScale(0.95, 0.95, 0.95)).multiply(new THREE.Matrix4().makeTranslation(-e0.x, -e0.y, -e0.z))); }
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
      // 2026-11-26 round 5 (engine-body): the shoulder end of the upper arm keeps the CHEST's frame: the rest bending
      // normal is carried by the chest rotation first, then swung onto the solved arm. It was swung from the rest
      // (unrotated) arm, so a figure yawed ~180 deg (office91 social worker, anyone facing -z) had the top of the upper arm
      // turned half a turn against the chest: the shoulder seam notch, the fin behind the armpit, "demented" shoulders.
      const rStart = nrmz(perp(swing(nb0.clone().applyQuaternion(qC), ua0.clone().applyQuaternion(qC), a1), a1)), rEnd = nrmz(perp(nb1, a1));
      M['upperarm_' + s] = aimMatrix(h0, ua0, nb0, U1, a1, rStart, E1.distanceTo(U1) / t0_.distanceTo(h0));
      TW['upperarm_' + s] = { axis: a1, pivot: U1, angle: signedAngle(rStart, rEnd, a1), h0, a0: ua0, len0: t0_.distanceTo(h0) }; }
    { const h0 = hd('lowerarm_' + s), t0_ = hd('hand_' + s), a1 = fa1;
      const rStart = nrmz(perp(nb1, a1)), rEnd = fromHand(a1);
      M['lowerarm_' + s] = aimMatrix(h0, fa0, nrmz(perp(nb0, fa0)), E1, a1, rStart, W1.distanceTo(E1) / t0_.distanceTo(h0));
      TW['lowerarm_' + s] = { axis: a1, pivot: E1, angle: signedAngle(rStart, rEnd, a1), h0, a0: fa0, len0: t0_.distanceTo(h0) }; }
    // hand: rigid on the solver's hand frame, scaled to the solver's hand length
    const Lh0 = tl('middle_03_' + s).distanceTo(wr0), sH = hp.Lh / Lh0;   // (the middle_03 tail is the fingertip skin: B.handLen, measured 2026-11-27, agrees to 0.1 mm)
    M['hand_' + s] = rigidMatrix(wr0, basis(t0, n0, f0), W1, basis(t1, n1, f1), sH);
    // 2026-11-27 "fit B" (Jade: "fit the palm to the fingers"): the mesh's knuckle row sits ~6.5 % farther from the wrist
    // than the solver's (engine/hand.js HAND_GEOM.mcp) and its span is wider (0.354 vs 0.299 hand lengths), so the
    // fingers (placed on the solver's knuckles below) started inside the palm skin and the palm read long. The palm is
    // instead rotated and scaled uniformly so the wrist -> knuckle-centroid line and the index -> little line meet the
    // solver's (scale = centroid distance ratio). Fingertips and the solver are untouched: grips and contacts stay.
    // Opt-out for comparison renders: render.mjs --handfit 0 (page ?handfit=0) = the old rigid hand scaled by sH.
    if (HUMAN.handFit !== false && hp.joints?.middle) {
      const kn = ['index', 'middle', 'ring', 'little'], km = ['index', 'middle', 'ring', 'pinky'];
      const c0 = new THREE.Vector3(), c1 = new THREE.Vector3();
      km.forEach((m) => c0.add(hd(`${m}_01_${s}`))); kn.forEach((f) => c1.add(hp.joints[f][0])); c0.multiplyScalar(0.25); c1.multiplyScalar(0.25);
      const fa0 = nrmz(c0.clone().sub(wr0)), fa1 = nrmz(c1.clone().sub(W1));
      const ta0 = nrmz(perp(hd(`index_01_${s}`).clone().sub(hd(`pinky_01_${s}`)), fa0)), ta1 = nrmz(perp(hp.joints.index[0].clone().sub(hp.joints.little[0]), fa1));
      const na0 = n === 'R' ? new THREE.Vector3().crossVectors(ta0, fa0) : new THREE.Vector3().crossVectors(fa0, ta0);
      const na1 = n === 'R' ? new THREE.Vector3().crossVectors(ta1, fa1) : new THREE.Vector3().crossVectors(fa1, ta1);
      M['hand_' + s] = rigidMatrix(wr0, basis(ta0, na0, fa0), W1, basis(ta1, na1, fa1), c1.distanceTo(W1) / c0.distanceTo(wr0));
    }
    // fingers: on the solver's own joints (knuckle, PIP, DIP, tip; thumb CMC, MCP, IP, tip)
    const FN = { index: 'index', middle: 'middle', ring: 'ring', little: 'pinky', thumb: 'thumb' };
    for (const [fs, fm] of Object.entries(FN)) {
      const w = hp.joints?.[fs]; if (!w) continue;
      // the solver's knuckle .. tip: fingertips land exactly where the pose solver (and the hold check) put them
      const pts = w.map((p) => p.clone());
      // 2026-11-27: the mesh's distal bone ends at the skin of the fingertip; the solver's tip point is the centre of its
      // tip capsule's end. The distal phalanx reaches on by that radius, so the skin hand is as long as the solver's
      // hand (PROP.hand x H, wrist to middle fingertip) and its capsules (was ~3.5 % short: 180 of 187 mm)
      if (spec?.[n]?.tip?.finger !== fs) { const cap = hp.capsules?.find((c) => c.part === fs + '3'); if (cap) pts[3].addScaledVector(nrmz(w[3].clone().sub(w[2])), 0.8 * cap.r); }   // 0.8: measured, adults' flat hands land on 187.0 mm. Not on a finger with a `tip` target: there the solver's tip point IS the contact (the skin touches the target, as before)
      // 2026-11-27 thumb fit: the solver's thumb (HAND_GEOM tlen 0.25 / 0.15 / 0.11) and the mesh's (0.17 / 0.20 / 0.15
      // hand lengths) are equally long CMC to tip, but jointed at different places, so the mesh metacarpal was stretched
      // x1.5 and its phalanges squashed to x0.77 / x0.72 (a stubby thumb). The mesh joints now go on the solver's thumb
      // polyline at the mesh's own proportions of its length (CMC and tip unchanged); each bone is the chord between them.
      if (fs === 'thumb' && HUMAN.thumbFit !== false) {
        const seg = [0, 1, 2].map((k) => pts[k + 1].distanceTo(pts[k])), T = seg[0] + seg[1] + seg[2];
        const lm = [0, 1, 2].map((k) => tl(`${fm}_0${k + 1}_${s}`).distanceTo(hd(`${fm}_0${k + 1}_${s}`))), Lm = lm[0] + lm[1] + lm[2];
        const at = (d) => { let k = 0; while (k < 2 && d > seg[k]) { d -= seg[k]; k++; } return pts[k].clone().lerp(pts[k + 1], Math.min(1, d / seg[k])); };
        const q1 = at(T * lm[0] / Lm), q2 = at(T * (lm[0] + lm[1]) / Lm); pts[1] = q1; pts[2] = q2; }
      let h1 = pts[0].clone();
      for (let kk = 0; kk < 3; kk++) { const bn = `${fm}_0${kk + 1}_${s}`, h0 = hd(bn), t0b = tl(bn), a0 = t0b.clone().sub(h0).normalize();
        const a1 = pts[kk + 1].clone().sub(pts[kk]); const L1 = a1.length(); a1.normalize();
        const ref0 = fs === 'thumb' ? n0 : t0, ref1 = fs === 'thumb' ? n1 : t1;
        M[bn] = aimMatrix(h0, a0, nrmz(perp(ref0, a0)), h1, a1, nrmz(perp(ref1, a1)), L1 / t0b.distanceTo(h0));
        h1 = h1.clone().addScaledVector(a1, L1); }
    }
    report[n] = { elbow_bend_deg: +(bend * 180 / Math.PI).toFixed(0), upperarm_stretch: +(E1.distanceTo(U1) / tl('upperarm_' + s).distanceTo(hd('upperarm_' + s))).toFixed(2),
      forearm_stretch: +(W1.distanceTo(E1) / hd('hand_' + s).distanceTo(hd('lowerarm_' + s))).toFixed(2), hand_scale: +sH.toFixed(2) };
  }
  // --- legs
  for (const [s, n] of [['l', 'L'], ['r', 'R']]) {
    const Hj = P['hip' + n], K = P['knee' + n], A0 = P['ankle' + n];
    const fd = nrmz(P['foot' + n].clone().sub(A0)), upF = nrmz(perp(A0.clone().sub(P['heel' + n]), fd), by);
    // 2026-11-26 round 5 (engine-body): the SOLE lands on the solver's sole plane (A - upF x solver ankle height), not the
    // mesh ankle on the solver's ankle. The MakeHuman ankle joint sits higher above the sole than the solver's ankleH
    // (0.06 leg length), so every mesh sole was ~13 mm under the floor. The mesh ankle goes to the sole plane + the mesh's
    // own (foot-scaled) ankle height; the calf takes up the few mm.
    // 2026-11-27 (Jade: first love's foot = hers, 251 mm; they shared shoes): the mesh foot is scaled to the cast's foot
    // length (P.footLen = PROP.foot x H, heel to longest toe). It was scaled to the solver's toe - heel distance along the
    // foot, which leaves out the heel's back radius (0.62 ankle heights): every mesh foot came out ~13 % short (217 mm).
    const FL1 = P['footLen' + n] ?? P['toe' + n].clone().sub(P['heel' + n]).dot(fd), FL0 = B.footLen * k, fS = THREE.MathUtils.clamp(FL1 / FL0, 0.8, 1.25);
    const ahSolver = A0.clone().sub(P['heel' + n]).dot(upF), ahMesh = hd('foot_' + s).y * fS;   // rest soles at y = 0
    const A = A0.clone().addScaledVector(upF, ahMesh - ahSolver);
    report['sole_shift_mm_' + n] = +((ahMesh - ahSolver) * 1000).toFixed(1);
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
    M['foot_' + s] = M['ball_' + s] = rigidMatrix(a0, R0, A, R1, fS);
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
function subGeo(pos, nrm, idx, triKeep, extra = []) {   // extra: [[name, array, itemSize]] per-vertex attributes carried along (hand colours / finger channels)
  const map = new Int32Array(pos.length / 3).fill(-1), P = [], N = [], I = [], X = extra.map(() => []);
  for (let f = 0; f < idx.length / 3; f++) { if (!triKeep(f)) continue;
    for (let c = 0; c < 3; c++) { const a = idx[f * 3 + c]; if (map[a] < 0) { map[a] = P.length / 3; P.push(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]); N.push(nrm[a * 3], nrm[a * 3 + 1], nrm[a * 3 + 2]);
      extra.forEach(([, arr, sz], e) => { for (let j = 0; j < sz; j++) X[e].push(arr[a * sz + j]); }); } I.push(map[a]); } }
  if (!I.length) return null;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setIndex(I);
  extra.forEach(([nm, , sz], e) => g.setAttribute(nm, new THREE.Float32BufferAttribute(X[e], sz)));
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
  // hand length on the skin: from the hand bone's head along the hand (to the middle fingertip bone) to the farthest hand vertex
  { const bs = B.meta.bones_blender_zup, h = zup(bs.hand_l.head), a = zup(bs.middle_03_l.tail).sub(h).normalize(); let m = 0;
    for (let i = 0; i < n; i++) if (dom[i] === 'handl') m = Math.max(m, (body.pos[i * 3] - h.x) * a.x + (body.pos[i * 3 + 1] - h.y) * a.y + (body.pos[i * 3 + 2] - h.z) * a.z);
    B.handLen = m; }
  // vertex parameter along its limb bone (0 at the bone's head, 1 at its tail), for sleeve / sock lengths
  const along = new Float32Array(n);
  const segOf = { ual: 'upperarm_l', uar: 'upperarm_r', fal: 'lowerarm_l', far: 'lowerarm_r', thl: 'thigh_l', thr: 'thigh_r', calfl: 'calf_l', calfr: 'calf_r' };
  for (let i = 0; i < n; i++) { const bn = segOf[dom[i]]; if (!bn) continue; const h = bones[bn].head, t = bones[bn].tail, a = t.clone().sub(h), L = a.length(); a.divideScalar(L);
    along[i] = (body.pos[i * 3] - h.x) * a.x + (body.pos[i * 3 + 1] - h.y) * a.y + (body.pos[i * 3 + 2] - h.z) * a.z; along[i] /= L; }
  const H0 = bones.thigh_l.head.clone().add(bones.thigh_r.head).multiplyScalar(0.5), C0 = bones.neck_01.head.clone();
  B.prep = { dom, along, H0, C0, bones, jg };
  return B.prep;
}

// ---------------------------------------------------------------- hand marks (2026-11-27, fl_hands H3b/H2b: "he looks like
// an amputee"): the painters could not tell which way a hand faced, where one finger ended and the next began, or that four
// stubs under her hand were fingertips. Every mesh hand (all bodies, kids included: everything is in rest-bone fractions
// and hand lengths, so it scales with the hand) now carries, from the REST bone frames (no per-shot painting; the MakeHuman
// GLBs carry no UVs or nail geometry, checked 2026-11-27):
//   nails    a nail plate on the back of each distal phalanx (fingers and thumb): the distal ~half of the segment, ~100 deg
//            of its circumference, with a curved cuticle. Its own region / mesh (cut exactly through the triangles by
//            refine, so the geometry is unchanged): its own colour (lighter, pinker) and an outline in
//            contour / line / form (an id edge).
//   creases  thin bands at the real joint creases only: palm side of the DIP and PIP joints and the finger base
//            (palmodigital crease), short knuckle wrinkles on the back of the PIP and DIP, the thumb's IP joint (palm and
//            back). Nothing in the thumb web or on the palm. Darker skin; drawn as a line in contour / form.
//   tint     vertex colours: palm and finger pads a little lighter and warmer than the back of the hand (faded out
//            toward the wrist, so the forearm skin meets the hand without a seam).
//   aFeat    per-vertex finger channels (index / ring: r, middle / little: g, thumb: b, any hand: a) for the guide passes
//            (render.js 'feat'): a line where two different fingers of one hand touch on screen, stronger occlusion and
//            overlap outlines on hands.
// The palmar direction of each finger comes from the rest pose's own bend (proximal -> distal phalanx), blended with the
// palm normal for the fingers; the thumb uses its IP joint's bend (16-20 deg at rest) alone.
export const HANDMARK = { on: true, webSmooth: 30, webMode: 'pos', webPalmKeep: 0.5, thenarSmooth: 60, nail: { u0: 0.47, u0Thumb: 0.43, cusp: 0.11, uEnd: 0.97, half: 54 }, crease: { w: 0.0021 } };
function handMarks(B) {
  if (B._hm) return B._hm;
  prep(B);
  const bs = B.meta.bones_blender_zup, hd = (n) => zup(bs[n].head), tl = (n) => zup(bs[n].tail);
  const out = { Lh: B.handLen };
  for (const [s, S] of [['l', 'L'], ['r', 'R']]) {
    const wr = hd('hand_' + s), f0 = nrmz(hd('middle_01_' + s).sub(wr)), t0 = nrmz(perp(hd('index_01_' + s).sub(hd('pinky_01_' + s)), f0));
    const n0 = S === 'R' ? new THREE.Vector3().crossVectors(t0, f0) : new THREE.Vector3().crossVectors(f0, t0);   // palm normal (out of the palm)
    const fingers = ['index', 'middle', 'ring', 'pinky', 'thumb'].map((fm, fi) => {
      const segs = [1, 2, 3].map((k) => { const h = hd(`${fm}_0${k}_${s}`), t = tl(`${fm}_0${k}_${s}`), a = t.clone().sub(h); const L = a.length(); return { h, a: a.divideScalar(L), L }; });
      const bend = nrmz(perp(segs[2].a.clone(), segs[0].a));
      // the thumb: its IP flexion alone (proximal -> distal phalanx); metacarpal -> distal also holds the CMC's abduction
      // (36 deg off: the nail came out on the thumb's side)
      const pal = fm === 'thumb' ? nrmz(perp(segs[2].a.clone(), segs[1].a)) : nrmz(bend.clone().add(n0));
      for (const g of segs) g.p = nrmz(perp(pal.clone(), g.a));
      return { fm, fi, thumb: fm === 'thumb', segs };
    });
    const tt = S === 'R' ? new THREE.Vector3().crossVectors(f0, n0) : new THREE.Vector3().crossVectors(n0, f0);   // thumb side, in the palm plane
    out[S] = { wr, f0, n0, t0: nrmz(tt), fingers };
  }
  return (B._hm = out);
}
// what a rest point on hand side S is: { kind: 'hand' | 'nail' | 'crease', f (finger), k (segment), u, cp (cos to the
// segment's palmar direction) }
function handMarkAt(B, S, p) {
  const HM = handMarks(B), H = HM[S], Lh = HM.Lh, NL = HANDMARK.nail, CW = HANDMARK.crease.w;
  let best = null, bd = Infinity; const v = new THREE.Vector3();
  for (const F of H.fingers) for (let k = 0; k < 3; k++) { const g = F.segs[k]; v.copy(p).sub(g.h); const u = v.dot(g.a) / g.L, uc = THREE.MathUtils.clamp(u, 0, 1);
    const d = v.clone().addScaledVector(g.a, -uc * g.L).length(); if (d < bd) { bd = d; best = { F, k, u }; } }
  const { F, k, u } = best, g = F.segs[k];
  const r = p.clone().sub(g.h); r.addScaledVector(g.a, -r.dot(g.a)); const rl = r.length(); const cp = rl > 1e-9 ? r.dot(g.p) / rl : 0;
  const res = { kind: 'hand', F, k, u, cp, d: bd };
  if (!HANDMARK.on) return res;
  // nail: back of the distal segment
  if (k === 2 && u < NL.uEnd && rl > 0.002 * Lh) {
    const th = Math.acos(THREE.MathUtils.clamp(-cp, -1, 1)) * 180 / Math.PI, half = NL.half * (F.thumb ? 1.08 : 1);
    if (th < half && u > (F.thumb ? NL.u0Thumb : NL.u0) + NL.cusp * (th / half) ** 2) { res.kind = 'nail'; return res; } }
  // creases at the joints: signed distance from the joint plane (normal = the two segments' mean axis), in hand lengths
  const joints = F.thumb ? [[2, 1]] : [[1, 1], [2, 1], [0, 0.4]];   // [segment whose head is the joint, ...]; [0, 0.4] = 40 % along the proximal phalanx (palmodigital crease, palm side only)
  for (const [jk, tag] of joints) {
    if (tag === 0.4 ? k !== 0 : !(k === jk || k === jk - 1)) continue;
    const S1 = F.segs[jk], J = tag === 0.4 ? S1.h.clone().addScaledVector(S1.a, 0.4 * S1.L) : S1.h, nj = tag === 0.4 ? S1.a : nrmz(S1.a.clone().add(F.segs[jk - 1].a));
    const s = p.clone().sub(J).dot(nj) / Lh;
    const ax = tag === 0.4 ? S1 : F.segs[k], rr = p.clone().sub(J); rr.addScaledVector(nj, -rr.dot(nj)); const rrl = rr.length(); const c = rrl > 1e-9 ? rr.dot(ax.p) / rrl : 0;
    const palmSide = c > -0.12 && Math.abs(s - (tag === 0.4 ? 0 : -0.0025)) < CW;   // the palm crease sits a little proximal of the joint
    const backSide = tag !== 0.4 && c < -(jk === 2 ? 0.78 : 0.72) && Math.abs(s) < CW * 0.8;   // a short wrinkle over the knuckle
    if (palmSide || backSide) { res.kind = 'crease'; return res; }
  }
  return res;
}
// per refined rest vertex: colour multiplier (palm / back) and finger channels; computed once per refined body
const PALM_MUL = [1.075, 1.035, 1.0], BACK_MUL = [0.965, 0.955, 0.95];
// palm skin texture (2026-11-27, Jade: "paint the palm of his hand with the texture of the real palm ... the way you can tell a
// brick wall is receding when there's a brick pattern"): opt-in per hand, spec.skinTex ['L' | 'R']. The pattern is
// procedural, evaluated per fragment in REST space (render.js SKINTEX: aRest / aRestN attributes carry each vertex's rest
// position and normal, so it rides on the skin exactly as a texture would and foreshortens round the curled fingers):
// the three palm creases (distal, proximal, thenar), doubled PIP and finger-base creases, fine transverse lines on the
// finger pads, ridge whorls on the fingertip pads, and a fine reticulated skin network over the palm. Palm side only.
// These are the rest-space frames it needs, per body and side.
function skinTexU(B, S) {
  const HM = handMarks(B), H = HM[S];
  const segH = [], segA = [], segP = [], segL = [];
  for (const F of H.fingers) for (const g of F.segs) { segH.push(g.h.clone()); segA.push(g.a.clone()); segP.push(g.p.clone()); segL.push(g.L); }
  return { wr: H.wr.clone(), f: H.f0.clone(), t: H.t0.clone(), n: H.n0.clone(), Lh: HM.Lh, segH, segA, segP, segL };
}
function handAttrs(B, R) {
  if (R.handAttr) return R.handAttr;
  const n = R.pos.length / 3, col = new Float32Array(n * 3).fill(1), feat = new Float32Array(n * 4), hs = new Float32Array(n), nrm = normalsOf(R.pos, R.idx);
  const HM = handMarks(B), Lh = HM.Lh, p = new THREE.Vector3(), nn = new THREE.Vector3();
  const used = new Uint8Array(n); R.tri.forEach((t, f) => { if (/^(hand|nail|crease)[LR]$/.test(t)) for (let c = 0; c < 3; c++) used[R.idx[f * 3 + c]] = 1; });
  for (let i = 0; i < n; i++) { if (!used[i]) continue;
    p.set(R.pos[i * 3], R.pos[i * 3 + 1], R.pos[i * 3 + 2]); nn.set(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]).normalize();
    const S = p.x > 0 ? 'L' : 'R', H = HM[S], m = handMarkAt(B, S, p), g = m.F.segs[m.k];
    // the palmar direction: the finger's (past its base) or the palm's
    const wf = m.k > 0 ? 1 : smooth(m.u, -0.1, 0.35), dir = nrmz(H.n0.clone().multiplyScalar(1 - wf).addScaledVector(g.p, wf));
    const q = smooth(nn.dot(dir), -0.3, 0.45), fade = smooth(p.clone().sub(H.wr).dot(H.f0) / Lh, 0.04, 0.2);
    hs[i] = fade;   // the hand's stronger form shading fades in past the wrist (no tone step where the forearm skin meets the hand)
    for (let c = 0; c < 3; c++) col[i * 3 + c] = 1 + fade * ((BACK_MUL[c] + (PALM_MUL[c] - BACK_MUL[c]) * q) - 1);
    if (HANDMARK.debugWeb && R.web) { col[i * 3 + 1] = col[i * 3 + 2] = 1 - R.web.m[i]; }
    const onFinger = m.F.thumb ? m.k > 0 : (m.k > 0 || m.u > 0.3);
    if (onFinger) feat[i * 4 + (m.F.thumb ? 2 : m.F.fi % 2)] = 1;
    feat[i * 4 + 3] = 1; }
  return (R.handAttr = { col, feat, hs });
}

// 2026-11-27 (Jade: "some weird wrinkle texture in the thumb webbing area" in lit): linear blend skinning folds the web
// skin between the thumb and the index (hand bone vs thumb_01 weights) into sharp creases and facets once the thumb
// turns. After baking, the vertices that blend hand and thumb weights (mask 4 w (1 - w), w = thumb_01 + thumb_02
// weight, hand skin only) are relaxed toward their neighbours (Taubin lambda / mu, so the web does not shrink): a few mm
// at most; the fingertips do not move. webMode 'pos' (default) moves the vertices (also clears the speckled self-overlap
// line in the web); 'normals' only shades from the relaxed surface (geometry unchanged). In fl_hands H3b/H2b 'pos' changed
// the grip of his palm-up hand on her from 1.5 to 0.2 mm skin depth (still touching; clip and hold checks pass).
function smoothThumbWeb(B, R, pos, passes = HANDMARK.webSmooth) {
  if (!R.web) { const n = R.pos.length / 3, J = B.jointNames, th = new Set(J.map((nm, i) => (/^thumb_01_/.test(nm) ? i : -1)).filter((i) => i >= 0));
    const bs = B.meta.bones_blender_zup, Lh = (prep(B), B.handLen);
    const webC = ['l', 'r'].map((s) => zup(bs['thumb_02_' + s].head).lerp(zup(bs['index_01_' + s].head), 0.5));   // the web's centre, each side
    const HM = handMarks(B), rn = normalsOf(R.pos, R.idx);
    const hb = new Set(J.map((nm, i) => (/^(hand_|thumb_|index_|middle_|ring_|pinky_)/.test(nm) ? i : -1)).filter((i) => i >= 0));
    const m = new Float32Array(n); for (let i = 0; i < n; i++) { let wt = 0, wh = 0; for (let j = 0; j < 4; j++) { const w = R.wgt[i * 4 + j], b = R.jnt[i * 4 + j]; if (th.has(b)) wt += w; if (hb.has(b)) wh += w; }
      const px = R.pos[i * 3], py = R.pos[i * 3 + 1], pz = R.pos[i * 3 + 2], C = webC[px > 0 ? 0 : 1], dd = Math.hypot(px - C.x, py - C.y, pz - C.z) / Lh;
      m[i] = wh > 0.95 ? Math.min(1, Math.max(4 * wt * (1 - wt) * 1.3, 1 - smooth(dd, 0.07, 0.17))) : 0;
      // the palm side of the web is left alone (it is what rests on things: H3b her hand on his); the back and the web's edge relax
      if (m[i]) { const n0 = HM[px > 0 ? 'L' : 'R'].n0, pal = rn[i * 3] * n0.x + rn[i * 3 + 1] * n0.y + rn[i * 3 + 2] * n0.z; m[i] *= 1 - HANDMARK.webPalmKeep * smooth(pal, 0.15, 0.6); } }
    const nb = Array.from({ length: n }, () => new Set()); for (let f = 0; f < R.idx.length; f += 3) for (let c = 0; c < 3; c++) { const a = R.idx[f + c], b = R.idx[f + (c + 1) % 3]; if (m[a] || m[b]) { nb[a].add(b); nb[b].add(a); } }
    const list = []; for (let i = 0; i < n; i++) if (m[i] > 0.02) list.push(i);
    R.web = { m, nb: nb.map((x) => [...x]), list }; }
  const { m, nb, list } = R.web, tmp = new Float32Array(list.length * 3);
  const step = (lam) => { list.forEach((i, q) => { const N = nb[i]; if (!N.length) { for (let c = 0; c < 3; c++) tmp[q * 3 + c] = pos[i * 3 + c]; return; }
      for (let c = 0; c < 3; c++) { let a = 0; for (const j of N) a += pos[j * 3 + c]; a /= N.length; tmp[q * 3 + c] = pos[i * 3 + c] + lam * m[i] * (a - pos[i * 3 + c]); } });
    list.forEach((i, q) => { for (let c = 0; c < 3; c++) pos[i * 3 + c] = tmp[q * 3 + c]; }); };
  for (let it = 0; it < passes; it++) { step(0.5); step(-0.53); }
}

// the thenar region: hand skin within ~0.15 hand lengths of the thumb's metacarpal (thumb_01 bone), both sides
function smoothThenar(B, R, pos, passes) {
  if (!R.thenar) { const n = R.pos.length / 3, J = B.jointNames, bs = B.meta.bones_blender_zup, Lh = (prep(B), B.handLen);
    const hb = new Set(J.map((nm, i) => (/^(hand_|thumb_|index_|middle_|ring_|pinky_)/.test(nm) ? i : -1)).filter((i) => i >= 0));
    const segs = ['l', 'r'].map((s) => [zup(bs['thumb_01_' + s].head), zup(bs['thumb_01_' + s].tail)]);
    const m = new Float32Array(n), p = new THREE.Vector3();
    for (let i = 0; i < n; i++) { let wh = 0; for (let j = 0; j < 4; j++) if (hb.has(R.jnt[i * 4 + j])) wh += R.wgt[i * 4 + j]; if (wh < 0.9) continue;
      p.set(R.pos[i * 3], R.pos[i * 3 + 1], R.pos[i * 3 + 2]); const [a, b] = segs[p.x > 0 ? 0 : 1], ab = b.clone().sub(a), t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
      const d = p.distanceTo(a.clone().addScaledVector(ab, t)) / Lh; m[i] = 1 - smooth(d, 0.13, 0.22); }
    const nb = Array.from({ length: n }, () => new Set()); for (let f = 0; f < R.idx.length; f += 3) for (let c = 0; c < 3; c++) { const a = R.idx[f + c], b = R.idx[f + (c + 1) % 3]; if (m[a] || m[b]) { nb[a].add(b); nb[b].add(a); } }
    const list = []; for (let i = 0; i < n; i++) if (m[i] > 0.02) list.push(i);
    R.thenar = { m, nb: nb.map((x) => [...x]), list }; }
  const { m, nb, list } = R.thenar, tmp = new Float32Array(list.length * 3);
  const step = (lam) => { list.forEach((i, q) => { const N = nb[i]; for (let c = 0; c < 3; c++) { let a = 0; for (const j of N) a += pos[j * 3 + c]; a /= Math.max(1, N.length); tmp[q * 3 + c] = pos[i * 3 + c] + lam * m[i] * (a - pos[i * 3 + c]); } });
    list.forEach((i, q) => { for (let c = 0; c < 3; c++) pos[i * 3 + c] = tmp[q * 3 + c]; }); };
  for (let it = 0; it < passes; it++) { step(0.5); step(-0.53); }
}

const clothes = (lk) => { const col = new THREE.Color(lk.col ?? 0x808080); return { ...lk, formTint: [col.r, col.g, col.b], flatCol: lk.col, costumeCol: lk.col }; };
const GREY = { skin: 0.78, hair: 0.12, top: 0.62, legs: 0.42, apron: 0.72, band: 0.5 };
// the costume's region at a rest point p with skin weights wm (Map joint index -> weight): top / legs / sock / skin /
// band / apron / hand / skinHead. Region borders are cut exactly through the triangles (refine), so hems are clean lines.
function labeller(B, c, spec, opt = {}) {
  const { jg, H0, C0, bones } = prep(B), T = C0.y - H0.y, waistY = H0.y + 0.3 * T, collarY = C0.y - 0.035 * T, h0 = B.meta.h;
  const sleeves = c.sleeves || 'long', dress = !!c.dress, legsSkin = spec.who === 'daughter';
  const bandH = 0.0175 * h0, bandY = c.band ? Math.max(H0.y + (0.38 + 0.62 * 0.2 - 0.06) * T, H0.y + 0.3 * T + bandH + 0.012 * h0) : null;   // clear of the waistline
  const apron = c.apron && !spec.noApron && !opt.noApron;
  const SEG = { ual: 'upperarm_l', uar: 'upperarm_r', fal: 'lowerarm_l', far: 'lowerarm_r', thl: 'thigh_l', thr: 'thigh_r', calfl: 'calf_l', calfr: 'calf_r' };
  const segA = {}; for (const [k, bn] of Object.entries(SEG)) { const h = bones[bn].head, a = bones[bn].tail.clone().sub(h); const L = a.length(); segA[k] = { h, a: a.divideScalar(L), L }; }
  return (p, wm) => {
    const s = {}; for (const [j, w] of wm) s[jg[j]] = (s[jg[j]] || 0) + w;
    let d = 'torso', bw = -1; for (const [g, w] of Object.entries(s)) if (w > bw) { bw = w; d = g; }
    const { x, y, z } = p; if ((d.startsWith('th') || d === 'neck') && y >= waistY && y < C0.y - 0.06 * T) d = 'torso';   // the waistline by height only (thigh / torso dominance flips along a zigzag)
    const side = d.slice(-1).toUpperCase(); let t = 0;
    if (segA[d]) { const S = segA[d]; t = ((x - S.h.x) * S.a.x + (y - S.h.y) * S.a.y + (z - S.h.z) * S.a.z) / S.L; }
    let r = 'skin';
    // the neckline: one smooth line round the neck (lower in front), the same rule for torso and neck vertices
    const collar = C0.y - 0.045 * T * THREE.MathUtils.clamp((z - C0.z) / (0.04 * h0) + 0.5, 0, 1) - 0.004 * h0;
    if (d === 'torso' || d === 'neck') r = y < waistY ? (dress ? 'top' : 'legs') : (y > collar && !opt.garment) ? (d === 'neck' ? 'skinNeck' : 'skin') : 'top';
    else if (d.startsWith('ua')) r = sleeves === 'none' ? 'skin' : sleeves === 'short' ? (t < 0.42 ? 'top' : 'skin') : 'top';
    else if (d.startsWith('fa')) r = sleeves === 'long' ? 'top' : sleeves === 'pushed' ? (t < 0.35 ? 'top' : 'skin') : 'skin';
    // 2026-11-26 round 5 (engine-body): a dress shows BARE legs below its hem (skin), unless the costume says tights
    // (c.tights: the legs colour). They were 'legs' (trouser colour, and hidden under the trouser garment the dress skips).
    // with a skirt garment the skirt alone covers the thighs (a raised thigh shows bare skin under the hem, not the dress
    // colour wrapped round it like shorts); without one the upper thigh keeps the dress colour
    else if (d.startsWith('th')) r = dress && t < 0.5 && !(B.meshes.garment_skirt && !c.tights) ? 'top' : dress && !c.tights ? 'skin' : 'legs';
    else if (d.startsWith('calf')) r = t > 0.9 ? 'sock' : dress && !c.tights ? 'skin' : 'legs';
    else if (d.startsWith('foot')) r = 'sock';
    if (d.startsWith('hand')) { const mk2 = HANDMARK.on && !opt.garment ? handMarkAt(B, side, p).kind : 'hand'; return mk2 + side; }   // hand marks: nail / crease regions (2026-11-27)
    if (bandY != null && r === 'top' && d === 'torso' && Math.abs(y - bandY) < bandH) r = 'band';
    if (apron && (d === 'torso' || d.startsWith('th')) && z > H0.z + 0.035 * h0 && Math.abs(x) < 0.062 * h0 && y < H0.y + 0.5 * T && y > H0.y - 0.16 * h0) r = 'apron';
    if (r === 'legs' || r === 'sock') { if (legsSkin) return 'skin'; return r + (side === 'L' || side === 'R' ? side : (x > 0 ? 'L' : 'R')); }
    if (r === 'skin' && d === 'head') return 'skinHead';   // head and neck skin are their own meshes: hideParts 'head' (POV shots) takes them
    return r;
  };
}
// cut the rest body along the costume's region borders: returns { pos, jnt, wgt, idx, tri (label per triangle) }
function refine(B, c, spec, part = 'body', opt = {}) {
  const key = [part, HANDMARK.on ? 'hm' : '', c.sleeves, !!c.dress, !!c.tights, c.band ? 1 : 0, c.apron && !spec.noApron ? 1 : 0, spec.who === 'daughter', JSON.stringify(opt)].join('|');
  (B.refined ||= {}); if (B.refined[key]) return B.refined[key];
  const L = labeller(B, c, spec, opt), body = B.meshes[part], n0 = body.pos.length / 3;
  const pos = [], W = [];
  for (let i = 0; i < n0; i++) { pos.push(new THREE.Vector3(body.pos[i * 3], body.pos[i * 3 + 1], body.pos[i * 3 + 2]));
    const m = new Map(); for (let j = 0; j < 4; j++) { const w = body.wgt[i * 4 + j]; if (w > 0) m.set(body.jnt[i * 4 + j], (m.get(body.jnt[i * 4 + j]) || 0) + w); } W.push(m); }
  const cls = (l) => (l && l.startsWith('skin') ? 'skin' : l);   // head / neck / body skin differ only as meshes: no cut between them
  // garments are layers (shirt over jeans): each connected piece keeps to its own half (the shirt is never trousers,
  // the jeans never the top), so overlapping layers do not stripe each other's colour
  let piece = null;
  if (opt.garment) { const par = new Int32Array(n0).map((_, i) => i), fd = (a) => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
    for (let f = 0; f < body.idx.length; f += 3) { const a = fd(body.idx[f]); for (const b of [body.idx[f + 1], body.idx[f + 2]]) par[fd(b)] = a; }
    const sum = new Map(); for (let i = 0; i < n0; i++) { const r = fd(i), e = sum.get(r) || [0, 0]; e[0] += body.pos[i * 3 + 1]; e[1]++; sum.set(r, e); }
    const { H0, C0 } = prep(B), waistY = H0.y + 0.3 * (C0.y - H0.y);
    piece = new Array(n0); for (let i = 0; i < n0; i++) { const e = sum.get(fd(i)); piece[i] = e[0] / e[1] > waistY ? 'upper' : 'lower'; } }
  const LP = (p, w, pc) => { const l = L(p, w); if (!pc) return l;
    if (pc === 'upper' && l.startsWith('legs')) return 'top';
    if (pc === 'lower' && (l === 'top' || l === 'band' || l === 'apron')) return 'legs' + (p.x > 0 ? 'L' : 'R');
    return l; };
  const pcOf = []; for (let i = 0; i < n0; i++) pcOf.push(piece ? piece[i] : null);
  const lab = pos.map((p, i) => LP(p, W[i], pcOf[i])), labC = lab.map(cls);
  const mix = (a, b, t) => { const m = new Map(); for (const [j, w] of W[a]) m.set(j, w * (1 - t)); for (const [j, w] of W[b]) m.set(j, (m.get(j) || 0) + w * t); return m; };
  const cut = new Map();
  const crossing = (a, b) => { const k = a < b ? a + ':' + b : b + ':' + a; if (cut.has(k)) return cut.get(k);
    const la = labC[a]; let lo = 0, hi = 1;
    for (let it = 0; it < 12; it++) { const t = (lo + hi) / 2; if (cls(LP(pos[a].clone().lerp(pos[b], t), mix(a, b, t), pcOf[a])) === la) lo = t; else hi = t; }
    const t = (lo + hi) / 2; pos.push(pos[a].clone().lerp(pos[b], t)); W.push(mix(a, b, t)); lab.push(null); labC.push(null); pcOf.push(pcOf[a]); cut.set(k, pos.length - 1); return pos.length - 1; };
  const idx = [], tri = [], I = Array.from(body.idx), depth = new Map(), mids = new Map();
  // a triangle that three regions meet in is split in four (midpoints, labelled) until each piece has at most two
  const mid = (a, b) => { const key = a < b ? a + ':' + b : b + ':' + a; if (mids.has(key)) return mids.get(key); pos.push(pos[a].clone().lerp(pos[b], 0.5)); W.push(mix(a, b, 0.5)); pcOf.push(pcOf[a]);
    const lv = LP(pos[pos.length - 1], W[W.length - 1], pcOf[a]); lab.push(lv); labC.push(cls(lv)); mids.set(key, pos.length - 1); return pos.length - 1; };
  const split4 = ([a, b, c], d) => { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
    for (const t of [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]]) { depth.set(I.length / 3, d); I.push(...t); } };
  for (let f = 0; f < I.length / 3; f++) {
    const v = [I[f * 3], I[f * 3 + 1], I[f * 3 + 2]], l = v.map((i) => labC[i]);
    const pick = (c) => lab[v.find((i) => labC[i] === c)];   // the specific label (skinHead / skinNeck / skin) of that class
    if (l[0] === l[1] && l[1] === l[2]) { idx.push(...v); tri.push(pick(l[0])); continue; }
    const set = new Set(l); if (set.size === 3) { if ((depth.get(f) || 0) < 3) { split4(v, (depth.get(f) || 0) + 1); continue; } idx.push(...v); tri.push(pick(l[0])); continue; }
    const o = l[0] !== l[1] && l[0] !== l[2] ? 0 : l[1] !== l[0] && l[1] !== l[2] ? 1 : 2;   // the odd corner first, winding kept
    const A = v[o], Bv = v[(o + 1) % 3], C = v[(o + 2) % 3], pab = crossing(A, Bv), pac = crossing(A, C);
    idx.push(A, pab, pac); tri.push(lab[A]); idx.push(pab, Bv, C); tri.push(lab[Bv]); idx.push(pab, C, pac); tri.push(lab[Bv]);
  }
  const n = pos.length, P = new Float32Array(n * 3), J = new Uint16Array(n * 4), Wt = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { P[i * 3] = pos[i].x; P[i * 3 + 1] = pos[i].y; P[i * 3 + 2] = pos[i].z;
    const e = [...W[i]].sort((x, y) => y[1] - x[1]).slice(0, 4), sw = e.reduce((s, x) => s + x[1], 0) || 1; e.forEach(([j, w], k) => { J[i * 4 + k] = j; Wt[i * 4 + k] = w / sw; }); }
  return (B.refined[key] = { pos: P, jnt: J, wgt: Wt, idx: new Uint32Array(idx), tri });
}

// the upper (shirt) piece of a two-piece garment: its connected pieces whose mean height is above the waist (as refine)
function upperPiece(B, G) {
  if (G._upper) return G._upper;
  const n0 = G.pos.length / 3, par = new Int32Array(n0).map((_, i) => i), fd = (a) => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  for (let f = 0; f < G.idx.length; f += 3) { const a = fd(G.idx[f]); for (const b of [G.idx[f + 1], G.idx[f + 2]]) par[fd(b)] = a; }
  const sum = new Map(); for (let i = 0; i < n0; i++) { const r = fd(i), e = sum.get(r) || [0, 0]; e[0] += G.pos[i * 3 + 1]; e[1]++; sum.set(r, e); }
  const { H0, C0 } = prep(B), waistY = H0.y + 0.3 * (C0.y - H0.y), keep = [];
  for (let i = 0; i < n0; i++) { const e = sum.get(fd(i)); if (e[0] / e[1] > waistY) keep.push(G.pos[i * 3], G.pos[i * 3 + 1], G.pos[i * 3 + 2]); }
  return (G._upper = { pos: new Float32Array(keep) });
}

// body vertices under a garment (rest pose: a garment vertex within 2.5 cm of a body vertex of the same clothed region);
// the body's triangles there are dropped so skin never pokes through the cloth
function covered(B, body, gmeshes) {
  const cell = 0.025 * B.meta.h / 1.65, key = (x, y, z) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`, grid = new Map();
  for (const G of gmeshes) for (let i = 0; i < G.pos.length / 3; i++) { const k2 = key(G.pos[i * 3], G.pos[i * 3 + 1], G.pos[i * 3 + 2]); grid.set(k2, (grid.get(k2) || 0) + 1); }
  const n = body.pos.length / 3, out = new Uint8Array(n);
  for (let i = 0; i < n; i++) { const x = body.pos[i * 3], y = body.pos[i * 3 + 1], z = body.pos[i * 3 + 2]; let hit = false;
    for (let a = -1; a <= 1 && !hit; a++) for (let b = -1; b <= 1 && !hit; b++) for (let c2 = -1; c2 <= 1 && !hit; c2++) if (grid.has(key(x + a * cell, y + b * cell, z + c2 * cell))) hit = true;
    out[i] = hit ? 1 : 0; }
  return out;
}

// The solver's neck length corrected to the body's (mesh mode only): the solver puts the eyes 0.005 H + neck + 0.46 head
// above the shoulder centre; the body has its own eye height above the neck base. The difference shortens (or
// lengthens) the solver's neck before anything is aimed at the face, so cameras, gaze and hands on the face are staged
// on the face the mesh will have, and the neck keeps its natural length.
export function neckDelta(who, c, pr) {
  const B = HUMAN.bodies?.[bodyFor(who, c)]; if (!B) return 0;
  const H = c.h, k = H / B.meta.h, lm = B.meta.landmarks_blender_zup, nb = B.meta.bones_blender_zup.neck_01.head;
  const meshUp = ((lm.eye_l[2] + lm.eye_r[2]) / 2 - nb[2]) * k;
  const neck0 = (1 - pr.sh - pr.head) * H + 0.02 * H, solverUp = 0.005 * H + neck0 + 0.46 * pr.head * H;
  return Math.max(meshUp - solverUp, -0.7 * neck0);
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
  // skin in its own warm tone in form / flat (pale cloth and bare skin always differ)
  const sc = new THREE.Color(c.skin ?? 0xe0b090), skinTint = new THREE.Color(1, 1, 1).lerp(sc, 0.55);
  const skin = look('skin', c.skin, { formTint: [skinTint.r, skinTint.g, skinTint.b], flatCol: c.skin }), hairL = look('hair', c.hair);
  const LK = { skin, skinHead: skin, skinNeck: skin, handL: skin, handR: skin, top: look('top', c.top), legsL: look('legs', c.legs), legsR: look('legs', c.legs),
    sockL: { grey: 0.5, col: c.sock ?? 0x6a6a70 }, sockR: { grey: 0.5, col: c.sock ?? 0x6a6a70 }, band: look('band', c.band), apron: look('apron', c.apron) };
  for (const r of ['top', 'legsL', 'legsR', 'sockL', 'sockR', 'band', 'apron']) LK[r] = clothes(LK[r]);
  // hand marks (2026-11-27): the hand skin carries the palm / back vertex colours and the stronger hand shading in form;
  // nails lighter and pinker (Lambert in lit: a Phong nail read blue-grey in shade); joint creases darker skin
  { const hs = HANDMARK.on ? { ...skin, vcol: true, hand: true } : skin; LK.handL = LK.handR = hs;
    const mixC = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);
    const nc = mixC(c.skin ?? 0xe0b090, 0xf0bfb0, 0.3), nt = [0, 1, 2].map((i) => Math.min(1, [skinTint.r, skinTint.g, skinTint.b][i] * [1.05, 0.985, 0.985][i] + 0.07));
    LK.nailL = LK.nailR = { grey: 0.86, col: nc.getHex(), flatCol: nc.getHex(), formTint: nt, hand: true };
    const cc = mixC(c.skin ?? 0xe0b090, 0x5a3a30, 0.2), ct = [skinTint.r * 0.74, skinTint.g * 0.7, skinTint.b * 0.7];
    LK.creaseL = LK.creaseR = { grey: 0.55, col: cc.getHex(), flatCol: cc.getHex(), formTint: ct, hand: true }; }
  const GROUP = { skin: 'skin', skinHead: 'skin', skinNeck: 'skin', handL: 'skin', handR: 'skin', nailL: 'nail', nailR: 'nail', creaseL: 'crease', creaseR: 'crease', top: 'torso', band: 'band', apron: 'torso', legsL: 'legL', legsR: 'legR', sockL: 'footL', sockR: 'footR' };   // 'torso': sets find the chest by this id (mv10 decal raycast)
  // body
  const body = refine(B, c, spec), pos = bake(body, B.jointNames, k, M, TW);
  const wsN = HANDMARK.webSmooth ? (spec.webSmooth ?? HANDMARK.webSmooth) : 0;   // spec.webSmooth: per-figure pass count (a hand whose web is in a contact)
  let nrmPos = pos; if (wsN) { nrmPos = pos.slice(); smoothThumbWeb(B, body, nrmPos, wsN); if (HANDMARK.webMode === 'pos') nrmPos = pos.set(nrmPos) || pos; }
  // 2026-11-27 (Jade: "the fleshy part of the palm near the thumb should also be smoother in the form, because the paint
  // does something weird to that artifact"): the thenar eminence and the thumb's base shade from a relaxed copy of the
  // surface (normals only: no vertex moves), so the ball of the thumb reads as one soft mound, with no facet or crease line
  if (HANDMARK.thenarSmooth) { if (nrmPos === pos) nrmPos = pos.slice(); smoothThenar(B, body, nrmPos, HANDMARK.thenarSmooth); }
  const nrm = normalsOf(nrmPos, body.idx), idx = body.idx, tr = body.tri;
  const gkey = c.sleeves === 'short' && B.meshes.garment_short ? 'garment_short' : 'garment_long';
  const garments = [[gkey, {}]]; if (c.dress && B.meshes.garment_skirt) garments.push(['garment_skirt', { skirt: true }]);
  const CLOTHED = new Set(['top', 'band', 'apron', 'legsL', 'legsR']);
  // a dress skips the trouser piece of the top garment, so only its upper piece (and the skirt) hides the body
  const cov = (body.cov ||= {})[garments.map((x) => x[0]).join('+') + (c.dress ? 'D' : '')] ||= covered(B, body, garments.filter(([gk]) => B.meshes[gk]).map(([gk, o]) => c.dress && !o.skirt ? upperPiece(B, B.meshes[gk]) : B.meshes[gk]));
  const dbg = spec.debugBody;   // bodytest only: 'nude' = the body alone, nothing hidden; 'garment' = the garments alone
  const hidden = (f) => dbg === 'nude' ? false : dbg === 'garment' ? true : CLOTHED.has(tr[f]) && cov[idx[f * 3]] && cov[idx[f * 3 + 1]] && cov[idx[f * 3 + 2]];
  for (const r of new Set(tr)) {
    const isHand = /^(hand|nail|crease)[LR]$/.test(r), ha = isHand && HANDMARK.on ? handAttrs(B, body) : null;
    const st = isHand && HANDMARK.on && spec.skinTex?.includes(r.slice(-1));   // palm skin texture on this hand
    const PT = spec.paint, ptHand = PT && isHand && (PT.hands || []).includes(r.slice(-1)), ptLimb = PT && PT.limbs && (r === 'skin' || r === 'top');   // projected paint (engine/paint.js)
    const limbX = ptLimb ? [['aLimb', (body.limbW ||= limbWeights(B.jointNames, body.jnt, body.wgt)), 4]] : [];
    const geo = subGeo(pos, nrm, idx, (f) => tr[f] === r && !hidden(f), ha ? [['color', ha.col, 3], ['aFeat', ha.feat, 4], ['aHS', ha.hs, 1], ...(st ? [['aRest', body.pos, 3], ['aRestN', (body.restN ||= normalsOf(body.pos, body.idx)), 3]] : [])] : limbX); if (!geo) continue;
    // nails / creases keep bodyRegion handL / handR (clip / hold checks see one hand); userData.handMark says which
    const m = mk(geo, LK[r] || skin); m.userData.idGroup = uid + GROUP[r]; m.userData.bodyRegion = isHand ? 'hand' + r.slice(-1) : r; if (isHand) m.userData.handMark = r.slice(0, -1);
    // spec.soloLight ['L' | 'R']: that hand is modelled by the light as if nothing lay on it (fl_hands H3b/H2b, Jade
    // 2026-11-27: his palm-up hand sat in the shadow of hers and read as a stump). It receives no cast shadows (lit /
    // flat) and, in form, only its own fingers darken it (render.js: feat alpha 0.75, occlusion from other meshes ignored).
    if (isHand && spec.soloLight?.includes(r.slice(-1))) { m.userData.soloLight = true; m.receiveShadow = false; }
    if (st) m.userData.skinTex = skinTexU(B, r.slice(-1));
    if (ptHand) m.userData.paint = { url: PT.url, all: true };
    else if (ptLimb) m.userData.paint = { url: PT.url, mask: limbMask(PT.limbs) };
    if (isHand) P.hands[r.slice(-1)].group.add(m); else g.add(m);
  }
  // garments (MakeHuman CC0 clothes, fitted to this body in Blender): the long-sleeved top + jeans, or the tee + jeans for
  // short sleeves; trimmed to the costume's sleeve / trouser length (cut exactly along the region border) and coloured;
  // a dress = the top + the skirt. The body's clothed regions share the garment's line id (no seam where skin pokes).
  const GTRIM = new Set(['skin', 'skinHead', 'skinNeck', 'handL', 'handR', 'nailL', 'nailR', 'creaseL', 'creaseR', 'sockL', 'sockR']);
  for (const [gk, o] of garments) {
    if (!B.meshes[gk] || dbg === 'nude') continue;
    const G = refine(B, c, spec, gk, { garment: true, noApron: true }), gp = bake(G, B.jointNames, k, M, TW), gn = normalsOf(gp, G.idx);
    for (const r of new Set(G.tri)) { if (!o.skirt && (GTRIM.has(r) || (c.dress && r.startsWith('legs')))) continue;   // a skirt is kept whole (its lower edge is the hem)
      const ptG = spec.paint?.limbs && r === 'top' && !o.skirt;   // projected paint on the sleeve
      const geo = subGeo(gp, gn, G.idx, (f) => G.tri[f] === r, ptG ? [['aLimb', (G.limbW ||= limbWeights(B.jointNames, G.jnt, G.wgt)), 4]] : []); if (!geo) continue;
      const m = mk(geo, o.skirt ? LK.top : LK[r] || LK.top); m.userData.idGroup = uid + (o.skirt ? 'skirt' : GROUP[r]); m.userData.garment = gk; m.userData.double = true; g.add(m);
      if (ptG) m.userData.paint = { url: spec.paint.url, mask: limbMask(spec.paint.limbs) }; }
    // the apron: the garment's front panel lifted 6 mm, its own mesh (an edge in line mode)
    if (c.apron && !spec.noApron && !o.skirt) { const A = refine(B, c, spec, gk, { garment: true }), ap = bake(A, B.jointNames, k, M, TW), an = normalsOf(ap, A.idx);
      for (let i = 0; i < ap.length; i++) ap[i] += an[i] * 0.006;
      const geo = subGeo(ap, an, A.idx, (f) => A.tri[f] === 'apron'); if (geo) { const m = mk(geo, LK.apron); m.userData.idGroup = uid + 'apron'; m.userData.double = true; g.add(m); } }
  }
  // hair (one style), brows, eyes
  const style = c.hairStyle || 'short';
  const hairKey = B.meshes.hair_fl ? 'hair_fl' : B.meshes['hair_kid' + style] ? 'hair_kid' + style : B.meshes['hair_' + style] ? 'hair_' + style : Object.keys(B.meshes).find((x) => x.startsWith('hair_') && !x.includes('__'));
  const addPart = (key, lk, grp, lift = 0) => { const ms = B.meshes[key]; if (!ms) return null; const p = bake(ms, B.jointNames, k, M, TW);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setIndex(new THREE.BufferAttribute(ms.idx, 1)); geo.computeVertexNormals();
    if (lift) { const nn = geo.getAttribute('normal').array; for (let i = 0; i < p.length; i++) p[i] += nn[i] * lift; geo.getAttribute('position').needsUpdate = true; }
    const m = mk(geo, lk); m.userData.idGroup = uid + grp; m.userData.double = true; g.add(m); return m; };
  if (hairKey) { const proxy = hairKey !== 'hair_fl';   // MakeHuman proxies sit on the scalp; the shells built from it are already off it
    const hm = [addPart(hairKey, hairL, 'hair', proxy ? 0.004 * c.h / 1.7 : 0)];   // lifted 4 mm: a thin shell on the skin z-fights into specks in line mode
    for (const x of Object.keys(B.meshes)) if (x.startsWith(hairKey + '__')) hm.push(addPart(x, hairL, 'hair'));
    // 2026-11-26: hair that hangs down the back pokes through the top when she bends forward (specks in line / form):
    // every hair vertex below the neck that is inside the top garment is moved back out through its back panel
    const tops = []; g.traverse((o) => { if (o.isMesh && o.userData.garment && /(torso|band)$/.test(o.userData.idGroup || '')) tops.push(o); });
    for (const m of hm) if (m) hairOutOfCloth(m, tops, P);
    earsUnderHair(hm.filter(Boolean), g, P, c.h); }
  if (hairKey === 'hair_kidbob') {   // the small half-ponytail tied high at the back of the crown (cast sheets): a tie and a short tail hanging down the back
    // 2026-11-26: was one flat ellipsoid at mid-height sunk in the hair shell; from behind it read as an ear disc. Now high on
    // the crown and standing off the hair, so it reads as a tied tuft.
    const Q = new THREE.Quaternion().setFromRotationMatrix(basis(P.headX, P.headUp, P.headFwd));
    const tie = mk(new THREE.SphereGeometry(P.headH * 0.055, 16, 12), hairL); tie.position.copy(P.head).addScaledVector(P.headFwd, -P.headH * 0.5).addScaledVector(P.headUp, P.headH * 0.34); tie.quaternion.copy(Q); tie.userData.idGroup = uid + 'hair'; g.add(tie);
    const tail = mk(new THREE.SphereGeometry(P.headH * 0.06, 16, 12), hairL); tail.position.copy(P.head).addScaledVector(P.headFwd, -P.headH * 0.6).addScaledVector(P.headUp, P.headH * 0.2); tail.scale.set(0.9, 2.0, 0.8);
    tail.quaternion.copy(Q).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.45)); tail.userData.idGroup = uid + 'hair'; g.add(tail); }
  // 2026-11-26 (cast/hair agent): bodies whose GLB carries their own bun (hair_bun__knot, make_bodies.py bun_knot) skip this ball
  if (style === 'bun' && !B.meshes.hair_bun__knot) { const b = mk(new THREE.SphereGeometry(P.headH * 0.21, 20, 14), hairL); b.position.copy(P.head).addScaledVector(P.headFwd, -P.headH * 0.7).addScaledVector(P.headUp, P.headH * 0.18); b.scale.set(1, 0.85, 1.0);   // 2026-11-26: higher and further out (was 0.5 back, 0.02 up, z 0.8): it read as a flat disc (ear) from behind
    b.quaternion.setFromRotationMatrix(basis(P.headX, P.headUp, P.headFwd)); b.userData.idGroup = uid + 'hair'; g.add(b); }
  const face = faceKind(spec.who), drawn = face === 'drawn' && !c.undrawn;
  if (drawn && B.meshes.brows) addPart('brows', hairL, 'brows');
  if (drawn && B.meshes.eyes) eyes(g, B, k, M, TW, uid);
  { let lo = Infinity; for (let f = 0; f < tr.length; f++) if (/^sock/.test(tr[f])) for (let c3 = 0; c3 < 3; c3++) lo = Math.min(lo, pos[idx[f * 3 + c3] * 3 + 1]); report.sole_lowest_y_m = +lo.toFixed(4); }   // world y of the lowest sole vertex (floor at the set's floor height)
  P.bodyReport = { mesh: id, scale: +k.toFixed(3), face: drawn ? 'drawn' : face, head_short_of_eyes_m: P.headMeshOffset, ...report };
  P.bodyMesh = id;
}

// Move hair vertices below the neck that sit inside the top garment out through its back (ray along -chest forward; an
// odd number of crossings = inside). Garments are open at the neck / hem / sleeves, but a ray straight back from inside the
// torso still crosses the back panel once, and hair in front of the chest crosses front and back (even: left alone).
function hairOutOfCloth(m, cloth, P) {
  if (!cloth.length || !P.cz || !P.neck) return;
  const T = []; for (const c of cloth) { const pa = c.geometry.getAttribute('position').array, ix = c.geometry.index ? c.geometry.index.array : null, n = ix ? ix.length : pa.length / 3;
    for (let f = 0; f < n; f += 3) { const a = ix ? ix[f] : f, b = ix ? ix[f + 1] : f + 1, d = ix ? ix[f + 2] : f + 2; T.push([pa[a * 3], pa[a * 3 + 1], pa[a * 3 + 2], pa[b * 3], pa[b * 3 + 1], pa[b * 3 + 2], pa[d * 3], pa[d * 3 + 1], pa[d * 3 + 2]]); } }
  const D = P.cz.clone().negate().normalize(), up = P.cy.clone().normalize(), pos = m.geometry.getAttribute('position'), a = pos.array; let moved = 0;
  const hits = (ox, oy, oz) => { let k = 0, tmin = Infinity;
    for (const t of T) { const e1x = t[3] - t[0], e1y = t[4] - t[1], e1z = t[5] - t[2], e2x = t[6] - t[0], e2y = t[7] - t[1], e2z = t[8] - t[2];
      const px = D.y * e2z - D.z * e2y, py = D.z * e2x - D.x * e2z, pz = D.x * e2y - D.y * e2x, det = e1x * px + e1y * py + e1z * pz; if (Math.abs(det) < 1e-12) continue;
      const iv = 1 / det, sx = ox - t[0], sy = oy - t[1], sz = oz - t[2], u = (sx * px + sy * py + sz * pz) * iv; if (u < 0 || u > 1) continue;
      const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, v = (D.x * qx + D.y * qy + D.z * qz) * iv; if (v < 0 || u + v > 1) continue;
      const tt = (e2x * qx + e2y * qy + e2z * qz) * iv; if (tt > 0) { k++; if (tt < tmin) tmin = tt; } }
    return { k, tmin }; };
  for (let i = 0; i < a.length; i += 3) {
    if ((a[i] - P.neck.x) * up.x + (a[i + 1] - P.neck.y) * up.y + (a[i + 2] - P.neck.z) * up.z > 0) continue;
    const h = hits(a[i], a[i + 1], a[i + 2]); if (h.k % 2 === 0) continue;
    const s = h.tmin + 0.003; a[i] += D.x * s; a[i + 1] += D.y * s; a[i + 2] += D.z * s; moved++; }
  if (moved) { pos.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox(); }
}

// 2026-11-26: hair that covers the ears was fitted over them, so a bump with an ear-shaped outline showed through it (read
// as an ear disc from behind). Per ear that the hair covers: the hair over it is put back on the sphere of the hair around
// it (distance from the head centre = the mean of the ring just outside), and the ear skin is pulled in 4 mm under it.
function earsUnderHair(hms, g, P, h) {
  if (!P.earL || !P.earR || !P.head) return;
  const R = 0.05 * h / 1.7, Hc = P.head, skin = []; g.traverse((o) => { if (o.isMesh && o.userData.bodyRegion === 'skinHead') skin.push(o); });
  for (const E of [P.earL, P.earR]) {
    const zone = [], ring = [];
    for (const m of hms) { const a = m.geometry.getAttribute('position').array;
      for (let i = 0; i < a.length; i += 3) { const d = Math.hypot(a[i] - E.x, a[i + 1] - E.y, a[i + 2] - E.z);
        if (d < R) zone.push([m, i]); else if (d < 1.5 * R) ring.push(Math.hypot(a[i] - Hc.x, a[i + 1] - Hc.y, a[i + 2] - Hc.z)); } }
    if (zone.length < 12 || ring.length < 12) continue;   // the hair does not cover this ear (short hair, a bun): leave the ear
    ring.sort((x, y) => x - y); const r0 = ring[Math.floor(ring.length / 2)];
    const touched = new Set();
    for (const [m, i] of zone) { const a = m.geometry.getAttribute('position').array, dx = a[i] - Hc.x, dy = a[i + 1] - Hc.y, dz = a[i + 2] - Hc.z, d = Math.hypot(dx, dy, dz);
      const t = Math.hypot(a[i] - E.x, a[i + 1] - E.y, a[i + 2] - E.z) / R, w = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3, k = 1 + w * (r0 / d - 1);   // feathered to the ring
      a[i] = Hc.x + dx * k; a[i + 1] = Hc.y + dy * k; a[i + 2] = Hc.z + dz * k; touched.add(m); }
    for (const m of touched) { m.geometry.getAttribute('position').needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox(); }
    for (const m of skin) { const pa = m.geometry.getAttribute('position'), a = pa.array; let n = 0;
      for (let i = 0; i < a.length; i += 3) { if (Math.hypot(a[i] - E.x, a[i + 1] - E.y, a[i + 2] - E.z) > 1.2 * R) continue;
        const dx = a[i] - Hc.x, dy = a[i + 1] - Hc.y, dz = a[i + 2] - Hc.z, d = Math.hypot(dx, dy, dz), lim = r0 - 0.004 * h / 1.7; if (d <= lim) continue;
        const k = lim / d; a[i] = Hc.x + dx * k; a[i + 1] = Hc.y + dy * k; a[i + 2] = Hc.z + dz * k; n++; }
      if (n) { pa.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox(); } }
  }
}

// eyeballs: sclera / iris / pupil by angle from each eye's iris axis (r6: rest +z turned EYE_KAPPA outward) about the sphere centre
function eyes(g, B, k, M, TW, uid) {
  const ms = B.meshes.eyes, n = ms.pos.length / 3, pos = bake(ms, B.jointNames, k, M, TW);
  const ctr = {}, ax = {}; for (const s of ['l', 'r']) { ctr[s] = eyeBall(B, s, k); ax[s] = irisAxis(s); }
  const zone = (a) => (a < EYE_PUPIL ? 'pupil' : a < EYE_IRIS ? 'iris' : 'sclera');
  const cls = new Array(n);
  for (let i = 0; i < n; i++) { const x = ms.pos[i * 3] * k, y = ms.pos[i * 3 + 1] * k, z = ms.pos[i * 3 + 2] * k; const c = x > 0 ? ctr.l : ctr.r;
    const d = new THREE.Vector3(x - c.x, y - c.y, z - c.z).normalize();
    cls[i] = zone(Math.acos(THREE.MathUtils.clamp(d.dot(ax[x > 0 ? 'l' : 'r']), -1, 1))); }
  // the iris and pupil borders cut through the triangles (round, not a triangle staircase)
  const P0 = [], W0 = []; for (let i = 0; i < n; i++) P0.push(new THREE.Vector3(ms.pos[i * 3] * k, ms.pos[i * 3 + 1] * k, ms.pos[i * 3 + 2] * k));
  const labAt = (p) => { const s2 = p.x > 0 ? 'l' : 'r', d = p.clone().sub(ctr[s2]).normalize(); return zone(Math.acos(THREE.MathUtils.clamp(d.dot(ax[s2]), -1, 1))); };
  const lab = P0.map(labAt), idx2 = [], tri = [], cut = new Map(), I = ms.idx, src = [];
  const crossing = (a, b) => { const key = a < b ? a + ':' + b : b + ':' + a; if (cut.has(key)) return cut.get(key); let lo = 0, hi = 1;
    for (let it = 0; it < 12; it++) { const t = (lo + hi) / 2; if (labAt(P0[a].clone().lerp(P0[b], t)) === lab[a]) lo = t; else hi = t; }
    P0.push(P0[a].clone().lerp(P0[b], (lo + hi) / 2)); lab.push(null); src.push(a); cut.set(key, P0.length - 1); return P0.length - 1; };
  for (let f = 0; f < I.length / 3; f++) { const v = [I[f * 3], I[f * 3 + 1], I[f * 3 + 2]], l = v.map((i) => lab[i]);
    if ((l[0] === l[1] && l[1] === l[2]) || new Set(l).size === 3) { idx2.push(...v); tri.push(l[0]); continue; }
    const o = l[0] !== l[1] && l[0] !== l[2] ? 0 : l[1] !== l[0] && l[1] !== l[2] ? 1 : 2, A = v[o], Bv = v[(o + 1) % 3], C = v[(o + 2) % 3], pab = crossing(A, Bv), pac = crossing(A, C);
    idx2.push(A, pab, pac, pab, Bv, C, pab, C, pac); tri.push(lab[A], lab[Bv], lab[Bv]); }
  const m2 = { pos: new Float32Array(P0.length * 3), jnt: new Uint16Array(P0.length * 4), wgt: new Float32Array(P0.length * 4) };
  for (let i = 0; i < P0.length; i++) { m2.pos[i * 3] = P0[i].x / k; m2.pos[i * 3 + 1] = P0[i].y / k; m2.pos[i * 3 + 2] = P0[i].z / k; const s0 = i < n ? i : src[i - n];
    for (let j = 0; j < 4; j++) { m2.jnt[i * 4 + j] = ms.jnt[s0 * 4 + j]; m2.wgt[i * 4 + j] = ms.wgt[s0 * 4 + j]; } }
  const pos2 = bake(m2, B.jointNames, k, M, TW), I2 = new Uint32Array(idx2), nrm = normalsOf(pos2, I2);
  const LOOK = { sclera: { grey: 0.96, col: 0xf3f0ea, noCast: true }, iris: { grey: 0.16, col: 0x3a2a1e, noCast: true }, pupil: { grey: 0.03, col: 0x060505, noCast: true } };
  for (const r of ['sclera', 'iris', 'pupil']) { const geo = subGeo(pos2, nrm, I2, (f) => tri[f] === r);
    if (!geo) continue; const m = mk(geo, LOOK[r]); m.userData.idGroup = uid + 'eye_' + r; m.userData.gaze = r; g.add(m); }
}

// A point on the clothed chest of a dressed figure, for decals (prints, logos): (u, v) metres along the chest frame
// (u toward the figure's left, v up from the shoulder centre), found by a ray from in front onto the top garment;
// lift metres off the cloth. null if the figure is not a mesh body or the ray misses.
export function chestPoint(fig, u, v, lift = 0.003) {
  const P = fig.userData.P; if (!P?.bodyMesh) return null;
  const hit = []; fig.traverse((m) => { if (m.isMesh && m.userData.garment && /:torso$/.test(m.userData.idGroup || '')) hit.push(m); });
  const o = P.shoulderC.clone().addScaledVector(P.cy, v).addScaledVector(P.cx, u).addScaledVector(P.cz, 0.4);
  const rc = new THREE.Raycaster(o, P.cz.clone().negate(), 0, 0.6); fig.updateMatrixWorld(true);
  // 2026-11-26: the farthest FRONT-facing hit, i.e. the chest itself, not a sleeve lying in front of it (office91 PC3a / X_sw:
  // the nearest hit put one corner of the print on her forearm, a long sliver through the sweater)
  const hs = rc.intersectObjects(hit, false).filter((x) => x.face.normal.clone().transformDirection(x.object.matrixWorld).dot(P.cz) > 0);
  const h = hs[hs.length - 1]; if (!h) return null;
  const n = h.face.normal.clone().transformDirection(h.object.matrixWorld); if (n.dot(P.cz) < 0) n.negate();
  return h.point.clone().addScaledVector(n, lift);
}
