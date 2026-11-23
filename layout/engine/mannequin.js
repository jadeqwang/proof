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
//   costume { top, legs, sock, sleeves, hairStyle, ... }: per-shot look over the CAST entry (height and kind are fixed)
//   L / R   arm: { to: target (palm centre), hand: shape name, palm: dir, fingers: dir, elbow: dir }
//           or a shortcut string: 'side' | 'lap' | 'kneeL' | 'kneeR'
// targets: [x,y,z] | '<who>:<part>' (head, nose, mouth, ear, forehead, chin, handL, ...) | 'book:<anchor>' | any key the
// set resolver knows. dirs: [x,y,z] world | 'up' 'down' 'fwd' 'back' 'left' 'right' 'in' 'out' (figure-relative) |
// 'to:<target>' (toward a target).
import * as THREE from 'three';
import { mk, limb, ball, slab, V, rad, UP, ik, basisQ, tag } from './core.js';

export const CAST = {
  mama: { name: 'Mama', h: 1.60, kind: 'adult', skin: 0xd8a27c, hair: 0x15110f, top: 0x6e3a33, legs: 0x3a3632, apron: 0xb9b2a0, hairStyle: 'bun', sleeves: 'pushed' },
  littleJade: { name: 'little Jade', h: 1.08, kind: 'child5', skin: 0xe6b996, hair: 0x14110f, top: 0xf1efe8, band: 0xe8792c, legs: 0x4b5a7a, hairStyle: 'bob', sleeves: 'long' },
  jade: { name: 'Jade', h: 1.65, kind: 'adult', skin: 0xe3b692, hair: 0x0e0d0f, top: 0xf1efe8, band: 0xe8792c, legs: 0x2c3140, hairStyle: 'long', sleeves: 'long' },
  daughter: { name: 'daughter', h: 1.02, kind: 'child4', skin: 0xe9c0a0, hair: 0x231a14, top: 0xf2a7b8, legs: 0xe9c0a0, hairStyle: 'pigtails', sleeves: 'short', dress: true },
};
export const PROP = {
  adult: { hip: 0.52, sh: 0.82, head: 0.135, shW: 0.112, hipW: 0.056, ua: 0.186, fa: 0.146, hand: 0.108, foot: 0.15, wk: 0.72, chestW: 0.19, chestD: 0.125 },
  child5: { hip: 0.46, sh: 0.785, head: 0.172, shW: 0.112, hipW: 0.052, ua: 0.172, fa: 0.138, hand: 0.10, foot: 0.155, wk: 0.8, chestW: 0.19, chestD: 0.14 },
  child4: { hip: 0.45, sh: 0.78, head: 0.182, shW: 0.112, hipW: 0.052, ua: 0.17, fa: 0.136, hand: 0.10, foot: 0.155, wk: 0.8, chestW: 0.19, chestD: 0.145 },
};
const GREY = { skin: 0.78, hair: 0.12, top: 0.62, legs: 0.42, apron: 0.72, band: 0.5, dark: 0.08 };

// ---------------------------------------------------------------- hands
// local hand frame: x = thumb side, y = fingers, z = palm normal (out of the palm). Units of hand length.
export const HANDS = {
  flat: { mitt: [0, 0], idx: [0, 0], spread: 4, thumb: [[0.55, 0.83, 0.05], [0.5, 0.86, 0.05]] },
  relax: { mitt: [25, 25], idx: [20, 20], spread: 4, thumb: [[0.5, 0.75, 0.4], [0.25, 0.8, 0.55]] },
  palmUp: { mitt: [12, 10], idx: [10, 8], spread: 6, thumb: [[0.6, 0.78, 0.15], [0.5, 0.85, 0.2]] },
  cup: { mitt: [35, 35], idx: [30, 30], spread: 0, thumb: [[0.35, 0.85, 0.4], [0.15, 0.85, 0.5]] },
  grip: { mitt: [80, 75], idx: [75, 70], spread: 0, thumb: [[0.3, 0.6, 0.75], [-0.35, 0.5, 0.8]] },
  pinch: { mitt: [60, 50], idx: [35, 30], spread: 0, thumb: [[0.2, 0.75, 0.6], [-0.1, 0.7, 0.7]] },
  point: { mitt: [100, 95], idx: [0, 0], spread: 0, thumb: [[0.2, 0.6, 0.75], [-0.6, 0.3, 0.7]] },
  fist: { mitt: [100, 100], idx: [100, 100], spread: 0, thumb: [[0.2, 0.6, 0.75], [-0.6, 0.3, 0.7]] },
  ring: { mitt: [8, 6], idx: [72, 88], spread: 0, thumb: [[0.08, 0.7, 0.7], [-0.4, 0.5, 0.75]] },
  switch: { mitt: [85, 80], idx: [80, 75], spread: 0, thumb: [[0.75, 0.62, 0.2], [0.9, 0.42, 0.05]] },
  // hand-shadow monkey: head in profile (index up = ear, fingers bent = brow and snout, thumb out = jaw)
  monkeyHead: { mitt: [55, 70], idx: [-5, 0], spread: -6, thumb: [[0.05, 0.45, 0.89], [0.0, 0.2, 0.98]] },
  // the second hand: a raised paw / arm under the jaw
  monkeyPaw: { mitt: [20, 30], idx: [10, 20], spread: 14, thumb: [[0.7, 0.7, 0.1], [0.75, 0.65, 0.1]] },
  // v4: index + middle extended together (sword-hand 剑指, the rapper's counting hand), ring + little curled, thumb over them
  two: { mitt: [95, 95], mid: [0, 2], idx: [0, 2], spread: 2, thumb: [[0.1, 0.6, 0.78], [-0.5, 0.35, 0.75]] },
  thumbsUp: { mitt: [100, 100], idx: [100, 100], spread: 0, thumb: [[0.1, 0.99, 0.0], [0.05, 1, 0.0]] },
};

// Hand frame (t = thumb side, f = fingers, n = palm normal). A RIGHT hand's (t, f, n) is a rotation; a LEFT hand's is
// its mirror image (t = n x f, determinant -1), which no quaternion can represent: pushing it through basisQ() gave an
// unrelated rotation, so left hands ignored `fingers` / `palm` and the palm centre missed its target. Points and
// directions are therefore mapped with the basis vectors themselves, which is exact for both sides.
// q is kept for callers that want an orientation (the proper rotation with the thumb axis flipped for a left hand).
export function handFrame(t, f, n, Lh, wrist) {
  const M = (x, y, z) => new THREE.Vector3().addScaledVector(t, x).addScaledVector(f, y).addScaledVector(n, z);
  const L = (x, y, z) => M(x * Lh, y * Lh, z * Lh).add(wrist);
  const Ld = (v) => { const u = new THREE.Vector3(...v).normalize(); return M(u.x, u.y, u.z); };
  const q = basisQ(t.clone().multiplyScalar(t.clone().cross(f).dot(n) < 0 ? -1 : 1), f, n);
  return { q, L, Ld };
}

function buildHand(side, Lh, shapeName, wrist, f, n, look, g) {
  const sh = HANDS[shapeName] || HANDS.relax;
  const t = side === 'R' ? new THREE.Vector3().crossVectors(f, n) : new THREE.Vector3().crossVectors(n, f);
  t.normalize();
  const { q, L, Ld } = handFrame(t, f, n, Lh, wrist);
  const out = { meshes: [] };
  const add = (m) => { g.add(m); out.meshes.push(m); return m; };
  // palm
  const palm = slab(L(0, 0.02, 0), L(0, 0.52, 0), 0.42 * Lh, 0.13 * Lh, t, look); add(palm);
  // mitt (middle, ring, little): two segments curling toward the palm normal
  const mitt = (c1, c2) => {
    const a = L(-0.07, 0.48, 0); const d1 = Ld([0, Math.cos(rad(c1)), Math.sin(rad(c1))]);
    const b = a.clone().addScaledVector(d1, 0.27 * Lh); const d2 = Ld([0, Math.cos(rad(c1 + c2)), Math.sin(rad(c1 + c2))]);
    const c = b.clone().addScaledVector(d2, 0.24 * Lh);
    add(slab(a, b, 0.28 * Lh, 0.11 * Lh, t, look)); add(slab(b, c, 0.27 * Lh, 0.1 * Lh, t, look));
    out.mittTip = c;
  };
  mitt(...sh.mitt);
  // index: spread rotates about the palm normal toward the thumb side
  { const sp = rad(sh.spread || 0), [c1, c2] = sh.idx;
    const base = L(0.15, 0.48, 0);
    const dir = (c) => Ld([Math.sin(sp) * Math.cos(rad(c)), Math.cos(sp) * Math.cos(rad(c)), Math.sin(rad(c))]);
    const b = base.clone().addScaledVector(dir(c1), 0.26 * Lh), e = b.clone().addScaledVector(dir(c1 + c2), 0.23 * Lh);
    add(limb(base, b, 0.05 * Lh, look)); add(limb(b, e, 0.047 * Lh, look)); out.indexTip = e; }
  // thumb
  { const base = L(0.17, 0.1, 0.03); const b = base.clone().addScaledVector(Ld(sh.thumb[0]), 0.23 * Lh);
    const e = b.clone().addScaledVector(Ld(sh.thumb[1]), 0.2 * Lh);
    add(limb(base, b, 0.06 * Lh, look)); add(limb(b, e, 0.052 * Lh, look)); out.thumbTip = e; }
  out.palm = L(0, 0.26, 0); out.t = t; out.q = q;
  return out;
}

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
  const P = { hip, waist, chest: shC.clone().addScaledVector(cy, -0.06 * H).addScaledVector(cz, 0.03 * H), shoulderC: shC, fwd: new THREE.Vector3(bz.x, 0, bz.z).normalize(), left: bx, up: by, cx, cy, cz, H, headH, who: spec.who };
  P.right = bx.clone().negate();
  g.userData.P = P; g.userData.spec = spec;

  // pelvis + abdomen + chest
  add(ball(1, spec.who === 'daughter' ? LK.top : LK.legs, hip.clone().addScaledVector(by, 0.02 * H).toArray(), [0.105 * H, 0.075 * H, 0.08 * H])).quaternion.copy(qB);
  add(slab(hip.clone().addScaledVector(by, 0.02 * H), waist.clone().addScaledVector(ay, 0.04 * H), pr.chestW * H * 0.85, pr.chestD * H * 0.95, bx, LK.top));
  const chestM = mk(new THREE.CapsuleGeometry(pr.chestD * H * 0.5, torsoLen * 0.42, 6, 16), LK.top);
  chestM.position.copy(waist.clone().addScaledVector(cy, torsoLen * 0.34)); chestM.quaternion.copy(qC); chestM.scale.set(pr.chestW / pr.chestD, 1, 1); add(chestM);
  if (c.band) { // the jacket's orange band, round the chest
    const bm = mk(new THREE.CylinderGeometry(1, 1, 0.035 * H, 24, 1, true), LK.band); bm.position.copy(waist.clone().addScaledVector(cy, torsoLen * 0.2)); bm.quaternion.copy(qC);
    bm.scale.set(pr.chestW * H * 0.5 + 0.004, 1, pr.chestD * H * 0.5 + 0.004); bm.userData.double = true; add(bm); }
  if (c.apron && !spec.noApron) add(slab(waist.clone().addScaledVector(cz, pr.chestD * H * 0.5 + 0.004).addScaledVector(cy, torsoLen * 0.12), waist.clone().addScaledVector(cz, pr.chestD * H * 0.55 + 0.004).addScaledVector(ay, -0.1 * H), 0.17 * H, 0.008, cx, LK.apron));
  if (c.dress) { // a short skirt
    const sk = mk(new THREE.CylinderGeometry(0.075 * H, 0.16 * H, 0.17 * H, 20, 1, true), LK.top); sk.userData.double = true;
    sk.position.copy(hip.clone().addScaledVector(by, -0.04 * H)); sk.quaternion.copy(qB); add(sk); }

  // legs
  const legInfo = {};
  for (const [s, n, pre] of [[1, 'L', preL], [-1, 'R', preR]]) {
    const hj = hip.clone().addScaledVector(bx, s * D.hipW);
    const ov = spec.legOpts?.['ankle' + n];
    const anc = ov ? B([s * ov[0], ov[1], ov[2]]).add(hip) : B(pre.ankle).add(hip);
    const pv = spec.legOpts?.['pole' + n];   // v9: optional world-space pole (knee direction) override
    const r = ik(hj, anc, D.thigh, D.shin, pv ? new THREE.Vector3(...pv) : B(pre.pole));
    add(limb(hj, r.mid, 0.052 * H * (c.kind === 'adult' ? 1 : 0.95), spec.who === 'daughter' ? LK.skin : LK.legs));
    add(limb(r.mid, r.end, 0.037 * H, spec.who === 'daughter' ? LK.skin : LK.legs));
    const fd = B(pre.foot).normalize();
    add(slab(r.end, r.end.clone().addScaledVector(fd, pr.foot * H * 0.85), 0.055 * H, 0.04 * H, bx, spec.who === 'daughter' ? LK.skin : LK.sock));
    P['knee' + n] = r.mid; P['ankle' + n] = r.end; P['foot' + n] = r.end.clone().addScaledVector(fd, pr.foot * H * 0.6);
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
  add(limb(neckBase, neckTop.clone().addScaledVector(hy, headH * 0.1), 0.03 * H * (c.kind === 'adult' ? 1 : 1.15), LK.skin));
  const R = headH / 2;
  const HL = (x, y, z) => new THREE.Vector3(x * R, y * R, z * R).applyQuaternion(qH).add(head);
  const skull = add(ball(R, LK.skin, head.toArray(), [pr.wk, 1, 0.9])); skull.quaternion.copy(qH); skull.userData.part = 'head';
  const nose = mk(new THREE.ConeGeometry(R * 0.13, R * 0.34, 8), LK.skin); nose.position.copy(HL(0, -0.12, 0.9)); nose.quaternion.copy(qH.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)))); add(nose);
  for (const s of [-1, 1]) {
    add(ball(R * 0.075, LK.dark, HL(s * 0.3, 0.08, 0.82).toArray()));
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
      add(slab(HL(0, 0.78, 0.55), HL(0, 0.36, 0.9), R * 1.2, R * 0.12, hx, LK.hair));
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
    else target = ctx.resolve(a.to, P);
    if (a.off) target.add(V(a.off));
    const resolveDir = (d) => (typeof d === 'string' && d.startsWith('to:')) ? ctx.resolve(d.slice(3), P).sub(target).normalize() : dirOf(d);
    let f = resolveDir(a.fingers), nrm = resolveDir(a.palm);
    const thumbDir = a.thumb ? resolveDir(a.thumb) : null;
    const pole = a.elbow ? (resolveDir(a.elbow) || V(a.elbow)) : UP.clone().negate().addScaledVector(cx, s * 0.65).addScaledVector(cz, -0.3);
    let r, ff = f;
    for (let it = 0; it < 3; it++) {
      if (!ff) ff = target.clone().sub(shoulder).normalize(); // first guess
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
    const sleeveLook = LK.top, foreLook = c.sleeves === 'long' ? LK.top : LK.skin, upperLook = c.sleeves === 'short' ? LK.skin : LK.top;
    if (c.sleeves === 'short') add(limb(shoulder, shoulder.clone().lerp(r.mid, 0.4), 0.034 * H, sleeveLook));
    add(limb(shoulder, r.mid, 0.03 * H, upperLook));
    add(limb(r.mid, r.end, 0.024 * H, foreLook));
    if (c.sleeves === 'long') add(limb(r.end.clone().lerp(r.mid, 0.12), r.end, 0.0265 * H, LK.top));
    const hg = new THREE.Group(); hg.name = spec.who + '.hand' + n; add(hg);
    const hand = buildHand(n, Lh, shape, r.end, f, nrm, LK.skin, hg);
    P['elbow' + n] = r.mid; P['wrist' + n] = r.end; P['hand' + n] = hand.palm; P['index' + n] = hand.indexTip; P['thumb' + n] = hand.thumbTip;
    P.hands[n] = { group: hg, shape, f, n: nrm, t: hand.t, reach: +r.reach.toFixed(2) };
  }
  g.traverse((o) => { o.userData.who = spec.who; });
  tag(g, c.name);
  g.userData.report = { legs: legInfo, arms: { L: P.hands.L.reach, R: P.hands.R.reach }, headTurn: P.headTurn };
  return g;
}

// named points on a built figure, for targets like 'mama:nose'
export function figurePoint(P, part) {
  const p = P[part]; if (!p) throw new Error(`no part ${part} on ${P.who}`);
  return p.clone();
}
