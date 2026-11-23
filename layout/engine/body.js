// v4 jointed body mannequin (preview_v4, SETS team).
// The pose is solved by the v1/v3 solver (mannequin.js buildFigure: same spec, same targets, two-bone IK for every limb);
// this module throws its blob geometry away and builds a body that PROVES the pose is possible:
//   - a shoulder girdle (clavicle + trapezius from the neck to each shoulder, a deltoid ball) so every arm visibly
//     leaves its own shoulder; ball joints at shoulders, elbows, wrists, hips, knees, ankles
//   - five-finger hands (three phalanges each, thumb in two) from the same hand-shape table
//   - hair per v3/v4 canon, never a fringe (little Jade: half-up, two small ponytails; Mama: jaw-length perm;
//     Jade: long, centre-parted; the daughter: two braids)
//   - a joint-limit report: elbow / knee flexion, elbow bending direction (humeral rotation), shoulder extension and
//     cross-body adduction, wrist bend, arm-through-torso, hand short of its target (IK clamped). Violations go to
//     figure_report and to the sidecar warnings, so a camera can never ship a body that cannot exist.
// Extra named points: forearmL/R, upperArmL/R (mid-segment), hipL/R, neck, palmL/R (= handL/R).
import * as THREE from 'three';
import { mk, limb, ball, slab, V, rad, UP, basisQ, tag } from './core.js';
import { buildFigure, CAST, PROP, HANDS, handFrame } from './mannequin.js';

const GREY = { skin: 0.78, hair: 0.12, top: 0.62, legs: 0.42, band: 0.5, dark: 0.08, sock: 0.5, joint: 0.7 };
// limits (degrees). Children are a little more flexible.
export const LIMITS = {
  adult: { elbowFlex: 150, kneeFlex: 160, wristBend: 85, humRot: 110, shExt: 60, neckTurn: 80 },
  child: { elbowFlex: 155, kneeFlex: 165, wristBend: 90, humRot: 115, shExt: 65, neckTurn: 85 },
};
// per-age girths as a fraction of height (children are rounder)
const GIRTH = {
  adult: { ua: 0.030, fa: 0.023, th: 0.052, sh: 0.036, neck: 0.030, del: 0.036, clav: 0.026, finger: 0.046 },
  child5: { ua: 0.034, fa: 0.028, th: 0.058, sh: 0.042, neck: 0.036, del: 0.040, clav: 0.030, finger: 0.055 },
  child4: { ua: 0.035, fa: 0.029, th: 0.059, sh: 0.043, neck: 0.037, del: 0.041, clav: 0.031, finger: 0.056 },
};
const HAIR4 = { mama: 'perm', littleJade: 'halfUp', jade: 'longOpen', daughter: 'braids' };

const angle = (a, b) => Math.acos(THREE.MathUtils.clamp(a.clone().normalize().dot(b.clone().normalize()), -1, 1)) * 180 / Math.PI;
function segDist(p, a, b) { const ab = b.clone().sub(a), t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1); return p.distanceTo(a.clone().addScaledVector(ab, t)); }

// five-finger hand in the v1 hand frame (x = thumb side, y = fingers, z = palm normal), Lh = hand length
function hand5(side, Lh, shapeName, wrist, f, n, look, g, gf) {
  const sh = HANDS[shapeName] || HANDS.relax;
  const t = side === 'R' ? new THREE.Vector3().crossVectors(f, n) : new THREE.Vector3().crossVectors(n, f); t.normalize();
  const { L, Ld } = handFrame(t, f, n, Lh, wrist);   // exact for left hands too (see mannequin.js handFrame)
  const add = (m) => { g.add(m); return m; };
  add(slab(L(0, 0.0, 0), L(0, 0.5, 0), 0.4 * Lh, 0.12 * Lh, t, look));                  // palm
  const r = gf * Lh / 0.108 * 0.108;                                                     // finger radius
  // fingers: [x across the knuckles, length, curl source, fan]
  const F = [[0.15, 0.44, 'idx', 1], [0.05, 0.48, 'mitt', 0.3], [-0.05, 0.45, 'mitt', -0.3], [-0.15, 0.36, 'mitt', -1]];
  const tips = {};
  F.forEach(([x, len, src, fan], i) => {
    const [c1, c2] = (i === 1 && sh.mid) ? sh.mid : sh[src]; const c3 = c2 * 0.75; const sp = rad((sh.spread || 0) * fan + (i === 3 ? -4 : 0));
    let p = L(x, 0.5, 0); let a = 0; const segs = [0.45, 0.32, 0.23];
    [c1, c2, c3].forEach((c, k) => { a += c; const d = Ld([Math.sin(sp) * Math.cos(rad(a)), Math.cos(sp) * Math.cos(rad(a)), Math.sin(rad(a))]);
      const e = p.clone().addScaledVector(d, segs[k] * len * Lh); add(limb(p, e, r * (1 - 0.1 * k) * (i === 3 ? 0.85 : 1), look)); p = e; });
    tips[['index', 'middle', 'ring', 'little'][i]] = p;
  });
  { const base = L(0.17, 0.1, 0.03); const b = base.clone().addScaledVector(Ld(sh.thumb[0]), 0.25 * Lh); const e = b.clone().addScaledVector(Ld(sh.thumb[1]), 0.21 * Lh);
    add(limb(base, b, r * 1.25, look)); add(limb(b, e, r * 1.1, look)); tips.thumb = e; }
  return { palm: L(0, 0.26, 0), t, tips };
}

function hairCap(g, P, R, pr, look, style) {
  const head = P.head, qH = basisQ(P.headX, P.headUp, P.headFwd);
  const HL = (x, y, z) => new THREE.Vector3(x * R, y * R, z * R).applyQuaternion(qH).add(head);
  const add = (m) => { m.userData.double = true; g.add(m); return m; };
  // crown cap, open at the face, no fringe: covers the top and back down to the ears
  const cap = mk(new THREE.SphereGeometry(R * 1.07, 28, 16, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.62), look);
  cap.position.copy(head); cap.quaternion.copy(qH.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, 0, 0)))); cap.scale.set(pr.wk * 1.03, 1.04, 1.0); add(cap);
  const shell = (to, wide) => { const s = mk(new THREE.SphereGeometry(R * 1.12, 28, 18, Math.PI * 0.8, Math.PI * 1.4, 0, Math.PI * to), look);
    s.position.copy(HL(0, 0.02, -0.08)); s.quaternion.copy(qH); s.scale.set(pr.wk * wide, 1.0, 1.0); add(s); };
  if (style === 'perm') { shell(0.78, 1.18); for (const s of [-1, 1]) g.add(ball(R * 0.34, look, HL(s * 0.95, -0.55, -0.15).toArray(), [0.8, 1, 1])); }
  if (style === 'halfUp' || style === 'longOpen') {
    shell(0.74, 1.06);
    // hair falling behind the shoulders (gravity, not the head's frame)
    const len = style === 'halfUp' ? 0.12 * P.H : 0.2 * P.H;
    const a = HL(0, -0.35, -0.8), b = a.clone().add(new THREE.Vector3(0, -len, 0)).addScaledVector(P.cz, -0.02);
    g.add(slab(a, b, R * 1.4, R * 0.24, P.cx, look));
    for (const s of [-1, 1]) { const a2 = HL(s * pr.wk * 0.95, -0.2, -0.05), b2 = a2.clone().add(new THREE.Vector3(0, -len * 0.45, 0)); g.add(slab(a2, b2, R * 0.24, R * 0.16, P.cz, look)); }   // curtains beside the face
    if (style === 'halfUp') for (const s of [-1, 1]) { g.add(ball(R * 0.16, look, HL(s * 0.55, 0.62, -0.6).toArray())); g.add(slab(HL(s * 0.6, 0.6, -0.68), HL(s * 0.72, 0.25, -1.05), R * 0.22, R * 0.18, P.headX, look)); }   // two little ponytails, half up
  }
  if (style === 'braids') { shell(0.7, 1.08); for (const s of [-1, 1]) { const a = HL(s * 0.85, -0.3, -0.35), b = a.clone().add(new THREE.Vector3(0, -0.11 * P.H, 0)).addScaledVector(P.cz, 0.03); g.add(slab(a, b, R * 0.26, R * 0.22, P.cz, look)); } }
}

export function buildBody(spec0, ctx) {
  // a hanging arm ('side') gets its fingers along the arm (toward the knee), so a lying figure's hands do not bend 90 deg
  const spec = { ...spec0 }; for (const n of ['L', 'R']) if (!spec[n] || spec[n] === 'side') spec[n] = { to: 'side', fingers: `to:self:knee${n}`, palm: 'in', _side: true };
  const old = buildFigure(spec, ctx);           // pose solve (P); its blob meshes are discarded
  const P = old.userData.P, c = CAST[spec.who], pr = PROP[c.kind], H = c.h, G = GIRTH[c.kind], kid = c.kind !== 'adult';
  const lim = LIMITS[kid ? 'child' : 'adult'];
  const g = new THREE.Group(); g.name = spec.who;
  const look = (k) => ({ grey: GREY[k] ?? 0.6, col: c[k] ?? 0x808080 });
  const LK = { skin: look('skin'), hair: look('hair'), top: look('top'), legs: look('legs'), band: look('band'), dark: { grey: 0.05, col: 0x111111 }, sock: { grey: 0.5, col: 0x6a6a70 } };
  const add = (m) => { g.add(m); return m; };
  const { hip, waist, shoulderC: shC, cx, cy, cz } = P; const bx = P.left, by = P.up;
  const legLook = spec.who === 'daughter' ? LK.skin : LK.legs;
  // ---- torso: pelvis, abdomen, ribcage, girdle
  const hipW = pr.hipW * H;
  add(ball(1, spec.who === 'daughter' ? LK.top : LK.legs, hip.clone().addScaledVector(by, 0.015 * H).toArray(), [0.1 * H, 0.07 * H, 0.075 * H])).quaternion.copy(old.children[0].quaternion);
  const abd = mk(new THREE.CapsuleGeometry(pr.chestD * H * 0.46, waist.distanceTo(hip) * 0.6, 6, 16), LK.top); abd.position.copy(hip.clone().lerp(waist, 0.6)); abd.quaternion.setFromUnitVectors(UP, waist.clone().sub(hip).normalize()); abd.scale.set(pr.chestW / pr.chestD * 0.86, 1, 1);
  { const yy = waist.clone().sub(hip).normalize(); abd.quaternion.copy(basisQ(bx.clone().addScaledVector(yy, -bx.dot(yy)).normalize(), yy, new THREE.Vector3().crossVectors(bx.clone().addScaledVector(yy, -bx.dot(yy)).normalize(), yy))); } add(abd);
  const torsoLen = shC.distanceTo(waist);
  const rib = mk(new THREE.CapsuleGeometry(pr.chestD * H * 0.5, torsoLen * 0.5, 6, 18), LK.top); rib.position.copy(waist.clone().addScaledVector(cy, torsoLen * 0.42)); rib.quaternion.copy(basisQ(cx, cy, cz)); rib.scale.set(pr.chestW / pr.chestD, 1, 1); add(rib);
  if (c.band) { const bm = mk(new THREE.CylinderGeometry(1, 1, 0.035 * H, 24, 1, true), LK.band); bm.position.copy(waist.clone().addScaledVector(cy, torsoLen * 0.3)); bm.quaternion.copy(basisQ(cx, cy, cz)); bm.scale.set(pr.chestW * H * 0.5 + 0.004, 1, pr.chestD * H * 0.5 + 0.004); bm.userData.double = true; add(bm); }
  if (c.dress) { const sk = mk(new THREE.CylinderGeometry(0.075 * H, 0.16 * H, 0.17 * H, 20, 1, true), LK.top); sk.userData.double = true; sk.position.copy(hip.clone().addScaledVector(by, -0.04 * H)); sk.quaternion.copy(old.children[0].quaternion); add(sk); }
  const neckBase = shC.clone().addScaledVector(cy, 0.005 * H);
  // ---- legs
  for (const [s, n] of [[1, 'L'], [-1, 'R']]) {
    const hj = hip.clone().addScaledVector(bx, s * hipW); P['hip' + n] = hj;
    const k = P['knee' + n], a = P['ankle' + n], ft = P['foot' + n];
    add(limb(hj, k, G.th * H * 0.95, legLook)); add(ball(G.sh * H * 0.92, legLook, k.toArray())); add(limb(k, a, G.sh * H * 0.82, legLook));
    add(ball(G.sh * H * 0.62, spec.who === 'daughter' ? LK.skin : LK.sock, a.toArray()));
    const fd = ft.clone().sub(a).normalize(); add(slab(a, a.clone().addScaledVector(fd, pr.foot * H * 0.88), 0.055 * H, 0.042 * H, bx, spec.who === 'daughter' ? LK.skin : LK.sock));
  }
  // ---- arms, shoulder girdle, hands
  const report = { violations: [], joints: {} };
  const flag = (j, msg) => report.violations.push(`${c.name} ${j}: ${msg}`);
  for (const [n, s] of [['L', 1], ['R', -1]]) {
    const S = P['shoulder' + n], E = P['elbow' + n], W = P['wrist' + n], hd = P.hands[n];
    const upper = c.sleeves === 'short' ? LK.skin : LK.top, fore = c.sleeves === 'long' ? LK.top : LK.skin;
    add(limb(neckBase.clone().addScaledVector(cz, -0.01 * H), S, G.clav * H, LK.top));                        // clavicle / trapezius
    add(ball(G.del * H, LK.top, S.clone().addScaledVector(cy, 0.004 * H).toArray()));                         // deltoid
    if (c.sleeves === 'short') add(limb(S, S.clone().lerp(E, 0.4), G.ua * H * 1.15, LK.top));
    add(limb(S, E, G.ua * H, upper)); add(ball(G.ua * H * 0.86, fore, E.toArray())); add(limb(E, W, G.fa * H, fore));
    if (c.sleeves === 'long') add(limb(W.clone().lerp(E, 0.12), W, G.fa * H * 1.12, LK.top));
    add(ball(G.fa * H * 0.72, LK.skin, W.toArray()));
    // rebuild the hand group in place (stage.casterMeshes / hideParts use P.hands[n].group)
    const hg = new THREE.Group(); hg.name = spec.who + '.hand' + n; add(hg);
    const h5 = hand5(n, pr.hand * H, hd.shape, W, hd.f, hd.n, LK.skin, hg, G.finger);
    hd.group = hg; P['index' + n] = h5.tips.index; P['thumb' + n] = h5.tips.thumb;
    P['forearm' + n] = E.clone().lerp(W, 0.55); P['upperArm' + n] = S.clone().lerp(E, 0.5);
    // ---- limits
    const u = E.clone().sub(S).normalize(), f = W.clone().sub(E).normalize();
    const flex = angle(u, f); report.joints['elbow' + n] = +flex.toFixed(0);
    if (flex > lim.elbowFlex) flag('elbow' + n, `flexed ${flex.toFixed(0)} deg (max ${lim.elbowFlex})`);
    if (flex > 25) { // bending direction: compare the flexion axis with the anatomical one carried by the arm's swing
      const b = new THREE.Vector3().crossVectors(u, f).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(cy.clone().negate(), u);
      const b0 = cx.clone().negate().applyQuaternion(q); b0.addScaledVector(u, -b0.dot(u)).normalize();
      const rot = Math.atan2(new THREE.Vector3().crossVectors(b0, b).dot(u), b0.dot(b)) * 180 / Math.PI; report.joints['humeralRot' + n] = +rot.toFixed(0);
      if (Math.abs(rot) > lim.humRot) flag('elbow' + n, `bends the wrong way (humeral rotation ${rot.toFixed(0)} deg, max ${lim.humRot})`); }
    const out = cx.clone().multiplyScalar(s); const ext = -u.dot(cz), down = -u.dot(cy);
    if (ext > Math.sin(rad(lim.shExt)) && down < 0.75) flag('shoulder' + n, 'upper arm reaches behind the back');
    if (u.dot(out) < -0.85) flag('shoulder' + n, 'upper arm crosses deep over the chest');
    const wb = angle(f, hd.f); report.joints['wrist' + n] = +wb.toFixed(0); if (wb > lim.wristBend && !spec[n]._side) flag('wrist' + n, `bent ${wb.toFixed(0)} deg (max ${lim.wristBend})`);
    if (hd.reach > 1.0 && !spec[n]._side) flag('arm' + n, `cannot reach its target (reach ${hd.reach}); the hand stops short`);
    const ribA = waist.clone().addScaledVector(cy, torsoLen * 0.15), ribB = shC.clone().addScaledVector(cy, -0.03 * H), rr = pr.chestD * H * 0.42;
    for (const [nm, p] of [['elbow', E], ['forearm', E.clone().lerp(W, 0.5)]]) if (segDist(p, ribA, ribB) < rr) flag('arm' + n, `${nm} passes through the torso`);
  }
  for (const n of ['L', 'R']) { const kf = angle(P['knee' + n].clone().sub(P['hip' + n]), P['ankle' + n].clone().sub(P['knee' + n])); report.joints['knee' + n] = +kf.toFixed(0); if (kf > lim.kneeFlex) flag('knee' + n, `flexed ${kf.toFixed(0)} deg (max ${lim.kneeFlex})`); }
  if (Math.abs(P.headTurn) > lim.neckTurn) flag('neck', `turned ${P.headTurn} deg`);
  // ---- neck + head
  const R = P.headH / 2, qH = basisQ(P.headX, P.headUp, P.headFwd);
  const HL = (x, y, z) => new THREE.Vector3(x * R, y * R, z * R).applyQuaternion(qH).add(P.head);
  add(limb(neckBase, HL(0, -0.55, -0.15), G.neck * H, LK.skin)); P.neck = neckBase.clone().lerp(HL(0, -0.55, -0.15), 0.5);
  const skull = add(ball(R, LK.skin, P.head.toArray(), [pr.wk, 1, 0.9])); skull.quaternion.copy(qH); skull.userData.part = 'head';
  const jaw = add(ball(R * 0.62, LK.skin, HL(0, -0.36, 0.12).toArray(), [pr.wk * 1.05, 0.8, 0.9])); jaw.quaternion.copy(qH);
  const nose = mk(new THREE.ConeGeometry(R * 0.12, R * 0.3, 8), LK.skin); nose.position.copy(HL(0, -0.12, 0.9)); nose.quaternion.copy(qH.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)))); add(nose);
  for (const s of [-1, 1]) { add(ball(R * (kid ? 0.1 : 0.075), LK.dark, HL(s * 0.32, 0.06, 0.83).toArray())); add(ball(R * 0.17, LK.skin, HL(s * pr.wk * 0.97, 0.0, 0.0).toArray(), [0.45, 1, 0.75])); }
  { const m = mk(new THREE.BoxGeometry(R * 0.34, R * 0.05, R * 0.05), { grey: 0.3, col: 0x8a3b34 }); m.position.copy(HL(0, -0.48, 0.8)); m.quaternion.copy(qH); add(m); }
  if (spec.who === 'mama' || spec.who === 'jade') for (const s of [-1, 1]) { const ring = mk(new THREE.TorusGeometry(R * 0.2, R * 0.025, 6, 18), LK.dark); ring.position.copy(HL(s * 0.32, 0.06, 0.95)); ring.quaternion.copy(qH); ring.scale.set(1.2, 0.8, 1); add(ring); }   // glasses
  hairCap(g, P, R, pr, LK.hair, spec.hair || HAIR4[spec.who]);
  g.traverse((o) => { o.userData.who = spec.who; });
  tag(g, c.name);
  g.userData.P = P; g.userData.spec = spec;
  g.userData.report = { ...old.userData.report, joints_deg: report.joints, violations: report.violations, body: 'v4 jointed (engine/body.js)' };
  return g;
}
// skeleton points for the sidecar
export const JOINTS = ['head', 'eyes', 'mouth', 'chin', 'neck', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'handL', 'handR', 'indexL', 'indexR', 'hip', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'footL', 'footR'];
