// Mannequin-side pieces of "figure guides v2" (2026-11-26, opt-in, OFF by default: off = every figure builds and renders
// exactly as before). The geometry-independent parts live in engine/gaze.js (gaze) and engine/wrist.js (natural wrists).
//   FIG2.on   (render.mjs --gaze, PROOF_GAZE=1): mannequin eyes that aim (buildFace), label-mode gaze line, sidecar gaze /
//             wrists / costume, natural wrists in the arm solve.
//   FIG2.body (render.mjs --body2, PROOF_BODY2=1): real torso for every figure (engine/torso.js 'f' / 'm' / 'c' child),
//             shoulder girdle (trapezius into an ellipsoid deltoid cap, arm in the torso's line group), slimmer child arms,
//             costume colours (formTint / flatCol / costumeCol: form, flat, contour + light wash), figure-vs-figure
//             outlines; body.js takes the mannequin's body. STOPPED 2026-11-26 (Jade: rigged human meshes replace the
//             mannequins); kept as built, behind its switch.
// buildFace: faceKind 'drawn' (Jade at every age, Mama, Dad): white eyeball, iris + pupil caps aimed per eye at P.lookAt
//   (the angle the head did not take, clamped EYE_YAW / EYE_PITCH), upper lid following the eye pitch, lower lid.
//   'blank' (strangers: the face stays paper): a brow ridge that drops with the gaze pitch and a nose wedge along the
//   gaze ray (CylinderGeometry, so the sets' undraw() that hides the nose cone keeps it). 'none' (first love): nothing.
import * as THREE from 'three';
import { mk, rad } from './core.js';
import { faceKind, eyeAim, gazeSplit } from './gaze.js';
export { faceKind, targetName, gazeReport, EYE_YAW, EYE_PITCH } from './gaze.js';
export { WRIST, wristAngles, naturalWrist } from './wrist.js';

// FIG2.on   = gaze (eyes on the mannequins, label gaze line, sidecar gaze) + natural wrists   (render.mjs --gaze, PROOF_GAZE=1)
// FIG2.body = mannequin body v2: real torso for all, shoulder girdle, costume colours, figure outlines (render.mjs --body2,
//             PROOF_BODY2=1). STOPPED 2026-11-26: rigged human meshes will replace the mannequins; kept behind its switch.
export const FIG2 = { on: false, body: false };

// torso body type from the cast key and kind: children 'c' (no bust, no waist), else 'f' / 'm'
const MALE = /^(dad|firstLove|uncle|partner|grandpa|man|boy)/i, FEMALE = /^(jade|littleJade|mama|daughter|aunt|grandma|sw$|woman|girl|mother)/i;
export function torsoType(who, c, age) {
  if (age < 13) return { type: 'c', how: 'child (age ' + age + ')' };
  if (c.sex === 'f' || c.sex === 'm') return { type: c.sex, how: 'cast entry' };
  if (MALE.test(who)) return { type: 'm', how: 'cast key' };
  if (FEMALE.test(who)) return { type: 'f', how: 'cast key' };
  return { type: c.hairStyle === 'short' ? 'm' : 'f', how: 'GUESSED from hairStyle ' + c.hairStyle };
}
export const hex = (c) => (c == null ? null : '#' + new THREE.Color(c).getHexString());
// clothing look extras (only called with the switch on)
export function costumeLook(lk) { const col = new THREE.Color(lk.col ?? 0x808080); return { ...lk, formTint: [col.r, col.g, col.b], flatCol: lk.col, costumeCol: lk.col }; }


// Build the face's gaze parts. F: { add, who, head, qH, hx, hy, hdir, R, eyeX, eyeY, skin, lookAt, kid, chest: {cx, cy, cz} }
// Returns the gaze info (also used for the sidecar) and, for 'blank' faces, nothing else to do: the cue is built here.
export function buildFace(F) {
  const { add, head, qH, R } = F, kind = faceKind(F.who);
  const HL = (x, y, z) => new THREE.Vector3(x * R, y * R, z * R).applyQuaternion(qH).add(head);
  const toT = (from) => (F.lookAt ? F.lookAt.clone().sub(from).normalize() : F.hdir.clone());
  const info = { face: kind, ...gazeSplit({ ...F, eyes: HL(0, F.eyeY, 0.85) }) }, mid = { pitch: info.eyePitch, dir: info.ray };
  if (kind === 'drawn') {
    const rb = R * (F.kid ? 0.17 : 0.155);            // eyeball radius
    const SCLERA = { grey: 0.96, col: 0xf3f0ea, formTint: [1, 1, 1], flatCol: 0xf6f4f0, noCast: true };
    const IRIS = { grey: 0.16, col: 0x3a2a1e, formTint: [0.30, 0.25, 0.22], flatCol: 0x3a2e26, noCast: true };
    const PUPIL = { grey: 0.03, col: 0x060505, formTint: [0.05, 0.05, 0.05], flatCol: 0x080707, noCast: true };
    const LID = { ...F.skin, noCast: true };
    for (const s of [1, -1]) {
      const Ce = HL(s * F.eyeX, F.eyeY, 0.70);
      const e = eyeAim(toT(Ce), F);
      const ball = mk(new THREE.SphereGeometry(rb, 24, 16), SCLERA); ball.position.copy(Ce); ball.quaternion.copy(qH); ball.userData.gaze = 'sclera'; add(ball);
      const thI = Math.asin(0.56), thP = Math.asin(0.25);   // iris / pupil caps (angular radius on the ball)
      const qE = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.dir);
      const iris = mk(new THREE.SphereGeometry(rb * 1.012, 24, 6, 0, Math.PI * 2, 0, thI), IRIS); iris.position.copy(Ce); iris.quaternion.copy(qE); iris.userData.gaze = 'iris'; add(iris);
      const pup = mk(new THREE.SphereGeometry(rb * 1.024, 18, 4, 0, Math.PI * 2, 0, thP), PUPIL); pup.position.copy(Ce); pup.quaternion.copy(qE); pup.userData.gaze = 'pupil'; add(pup);
      // lids: caps round the head's up (upper) and down (lower) axes; the upper lid's edge sits 20 deg above the eye's
      // pitch (covers the top of the iris), so it drops as the eye looks down
      const pe = e.pitch * 180 / Math.PI;
      const thU = rad(THREE.MathUtils.clamp(70 - pe, 38, 118)), thL = rad(THREE.MathUtils.clamp(58 + 0.35 * Math.min(pe, 0), 34, 62));
      const up = mk(new THREE.SphereGeometry(rb * 1.07, 28, 12, 0, Math.PI * 2, 0, thU), LID); up.position.copy(Ce); up.quaternion.copy(qH); up.userData.double = true; up.userData.gaze = 'lid'; add(up);
      const lo = mk(new THREE.SphereGeometry(rb * 1.05, 28, 8, 0, Math.PI * 2, Math.PI - thL, thL), LID); lo.position.copy(Ce); lo.quaternion.copy(qH); lo.userData.double = true; lo.userData.gaze = 'lid'; add(lo);
    }
  } else if (kind === 'blank') {
    // brow ridge: drops as the gaze pitches down, rises as it looks up (head-fixed otherwise)
    const by = THREE.MathUtils.clamp(0.34 + 0.32 * Math.sin(mid.pitch), 0.18, 0.5), bz = 0.9 * Math.sqrt(Math.max(0, 1 - by * by)) + 0.02;
    const brow = mk(new THREE.BoxGeometry(R * 0.95, R * 0.07, R * 0.08), { ...F.skin, noCast: true });
    brow.position.copy(HL(0, by, bz)); brow.quaternion.copy(qH.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.asin(by) * 0.9)));
    brow.userData.gaze = 'brow'; add(brow);
    // nose wedge along the gaze ray
    const nose = mk(new THREE.CylinderGeometry(0, R * 0.14, R * 0.4, 8), { ...F.skin });
    nose.position.copy(HL(0, -0.12, 0.88)).addScaledVector(mid.dir, R * 0.06); nose.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), mid.dir);
    nose.userData.gaze = 'nose'; add(nose);
  }
  return info;
}

