// Gaze, independent of the figure's geometry (2026-11-26). Works on solved points only, so the mannequin (engine/mannequin.js
// via figure2.js buildFace) and a future rigged mesh (eye bones) can both use it.
//
// API
//   faceKind(who) -> 'drawn' | 'blank' | 'none'      who gets drawn eyes (Jade at every age, Mama, Dad) / paper face / first love
//   targetName(spec.head.look) -> string | null      the name a look target is reported under
//   eyeAim(dir, { hx, hy, hdir }) -> { dir, yaw, pitch, rawYaw, rawPitch }
//        the eye direction toward unit world dir in the head frame (hx = head's left, hy = up, hdir = forward), with
//        yaw / pitch clamped to EYE_YAW / EYE_PITCH (rad). For an eye bone: rotate it by (yaw about hy, pitch about hx).
//   gazeSplit({ eyes, hx, hy, hdir, lookAt }) -> { eyes, ray, eyeYaw, eyePitch, rawYaw, rawPitch, error }
//        the split between head (already turned by the pose solver: hdir) and eyes for the point between the eyes
//   gazeReport(spec, P, ctx, info, hs) -> P.gaze   { look_target, head_deg, eye_deg, gaze_error_deg, beyond_eye_range,
//        points[], reaches[], warnings[] }; needs P.cx/cy/cz (chest frame), P.headFwd, P.lookAt, P.index<L|R>, the arm specs
//   drawGazeOverlay(g2d, built, px, W, H)   label mode: dotted line eyes -> target, "looks at: <name>" tag; needs per
//        figure P.gaze and P.gazeInfo ({ eyes, ray })
import * as THREE from 'three';
import { rad } from './core.js';

export const EYE_YAW = 35, EYE_PITCH = 30;   // degrees of eye travel in the socket (beyond: the target is out of eye range)
const dg = (r) => +(r * 180 / Math.PI).toFixed(1);
const angBetween = (a, b) => Math.acos(THREE.MathUtils.clamp(a.clone().normalize().dot(b.clone().normalize()), -1, 1));

// who gets a drawn face (the plan: only the people who can read her get a face; strangers are paper; first love is a real
// person, always from behind)
export function faceKind(who) {
  if (/^firstLove/i.test(who)) return 'none';
  if (/^(jade|littleJade|mama|dad$)/i.test(who)) return 'drawn';
  return 'blank';
}
export function targetName(t) {
  if (typeof t === 'string') return t;
  if (t && t.mid) return `mid(${t.mid.join(', ')})`;
  return null;
}

// eye direction in the head frame toward d (unit, world), clamped; returns { dir, yaw, pitch, rawYaw, rawPitch }
export function eyeAim(d, F) {
  const x = d.dot(F.hx), y = d.dot(F.hy), z = d.dot(F.hdir);
  const rawYaw = Math.atan2(x, z), rawPitch = Math.asin(THREE.MathUtils.clamp(y, -1, 1));
  const yaw = THREE.MathUtils.clamp(rawYaw, -rad(EYE_YAW), rad(EYE_YAW)), pitch = THREE.MathUtils.clamp(rawPitch, -rad(EYE_PITCH), rad(EYE_PITCH));
  const dir = F.hdir.clone().multiplyScalar(Math.cos(yaw) * Math.cos(pitch)).addScaledVector(F.hx, Math.sin(yaw) * Math.cos(pitch)).addScaledVector(F.hy, Math.sin(pitch)).normalize();
  return { dir, yaw, pitch, rawYaw, rawPitch };
}

export function gazeSplit(F) {
  const d = F.lookAt ? F.lookAt.clone().sub(F.eyes).normalize() : F.hdir.clone(), m = eyeAim(d, F);
  return { eyes: F.eyes.clone(), ray: m.dir, eyeYaw: m.yaw, eyePitch: m.pitch, rawYaw: m.rawYaw, rawPitch: m.rawPitch, error: F.lookAt ? angBetween(m.dir, F.lookAt.clone().sub(F.eyes)) : 0 };
}

// After the arms are built: the gaze report (P.gaze) with the head / eye split and the pointing check.
export function gazeReport(spec, P, ctx, info, hs) {
  const { cx, cy, cz } = P;
  const hYaw = Math.atan2(P.headFwd.dot(cx), P.headFwd.dot(cz)), hPitch = Math.asin(THREE.MathUtils.clamp(P.headFwd.dot(cy), -1, 1));
  const out = { face: info.face, look_target: hs.look ? { name: targetName(hs.look), world: P.lookAt ? P.lookAt.toArray().map((v) => +v.toFixed(3)) : null } : null,
    head_deg: { yaw_left: dg(hYaw), pitch_up: dg(hPitch), note: 'head relative to the chest' },
    eye_deg: { yaw_left: dg(info.eyeYaw), pitch_up: dg(info.eyePitch), wanted_yaw: dg(info.rawYaw), wanted_pitch: dg(info.rawPitch), note: `eyes relative to the head; travel clamped to +-${EYE_YAW} yaw, +-${EYE_PITCH} pitch` },
    gaze_error_deg: dg(info.error), beyond_eye_range: info.error > rad(1), points: [], reaches: [], warnings: [] };
  const name = spec.who;
  if (out.beyond_eye_range) out.warnings.push(`${name}'s look target is ${out.gaze_error_deg} deg beyond eye travel (head ${out.head_deg.yaw_left}/${out.head_deg.pitch_up}, eyes want ${out.eye_deg.wanted_yaw}/${out.eye_deg.wanted_pitch}): turn the head or the body`);
  for (const n of ['L', 'R']) {
    const a = spec[n]; if (!a || typeof a !== 'object') continue;
    const shape = typeof a.hand === 'string' ? a.hand : a.hand?.shape;
    const fingTo = typeof a.fingers === 'string' && a.fingers.startsWith('to:') ? a.fingers.slice(3) : null;
    const tname = fingTo || (typeof a.tip?.at === 'string' ? a.tip.at : null) || (typeof a.to === 'string' ? a.to : null);
    const self = tname && (tname.startsWith('self:') || tname.startsWith(name + ':'));
    if (shape === 'point') {
      let pt = P['index' + n].clone();
      if (fingTo) { try { pt = ctx.resolve(fingTo, P); } catch (e) { /* keep the fingertip */ } }
      const e = { arm: n, target: tname, world: pt.toArray().map((v) => +v.toFixed(3)), self: !!self };
      if (!self) {
        if (!P.lookAt) { e.look_off_deg = null; out.warnings.push(`${name} points (${n}) at ${tname || 'a point'} but has no look target`); }
        else { e.look_off_deg = dg(angBetween(P.lookAt.clone().sub(info.eyes), pt.clone().sub(info.eyes)));
          if (e.look_off_deg > 15) out.warnings.push(`${name} points (${n}) at ${tname || 'a point'} but looks ${e.look_off_deg} deg away from it (at ${out.look_target?.name || 'a point'})`); }
      }
      out.points.push(e);
    } else if (tname && !self && !['side', 'lap', 'kneeL', 'kneeR'].includes(tname)) { const pt = P['hand' + n];
      out.reaches.push({ arm: n, target: tname, shape: shape || 'relax', world: pt.toArray().map((v) => +v.toFixed(3)), look_off_deg: P.lookAt ? dg(angBetween(P.lookAt.clone().sub(info.eyes), pt.clone().sub(info.eyes))) : null }); }
  }
  return out;
}

// v2: a thin dotted line from between the eyes to the look target, tagged "looks at: <name>" (label mode)
export function drawGazeOverlay(g, b, px, W, H) {
  const cam = b.cam, near = cam.near * 1.5;
  const vz = (p) => -p.clone().applyMatrix4(cam.matrixWorldInverse).z;
  for (const [who, f] of Object.entries(b.figs || {})) {
    const Pf = f.userData.P, gz = Pf.gaze, gi = Pf.gazeInfo; if (!gz || !gi) continue;
    if (!f.visible || f.userData.baseVisible === false) continue;
    let a = gi.eyes.clone(); const named = gz.look_target?.name;
    let t = Pf.lookAt ? Pf.lookAt.clone() : a.clone().addScaledVector(gi.ray, 0.35);
    if (vz(a) < near && vz(t) < near) continue;
    const clip = (p, q) => { const dp = vz(p), dq = vz(q); if (dp >= near) return p; return p.clone().lerp(q, (near - dp) / (dq - dp)); };
    const a2 = clip(a, t), t2 = clip(t, a), A = px(a2, cam), T = px(t2, cam);
    const inside = (p) => p.x > 0 && p.x < W && p.y > 0 && p.y < H; if (!inside(A) && !inside(T)) continue;   // neither end in frame: no line
    g.save(); g.setLineDash([3, 6]); g.lineWidth = 2.2; g.strokeStyle = 'rgba(255,255,255,0.85)';
    g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(T.x, T.y); g.stroke();
    const col = gz.beyond_eye_range || gz.warnings.length ? '#c0006a' : '#00806a';
    g.lineWidth = 1.4; g.strokeStyle = col; g.stroke(); g.restore();
    g.fillStyle = col; g.beginPath(); g.arc(T.x, T.y, 4, 0, 7); g.fill();
    // the eye ray actually drawn by the eyes (short, solid) when it misses the target
    if (gz.beyond_eye_range) { const R2 = px(a.clone().addScaledVector(gi.ray, Math.min(0.5, a.distanceTo(t))), cam); g.save(); g.strokeStyle = '#c0006a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(R2.x, R2.y); g.stroke(); g.restore(); }
    const txt = (Pf.lookAt ? (named ? 'looks at: ' + named : 'looks at a point') : 'no look target') + (gz.beyond_eye_range ? `  (eyes ${gz.gaze_error_deg}° short)` : '');
    g.font = '600 15px DejaVu Sans, sans-serif'; const tw = g.measureText(txt).width + 10;
    const inF = T.x > 0 && T.x < W && T.y > 0 && T.y < H; const P0 = inF ? T : { x: (A.x + T.x) / 2, y: (A.y + T.y) / 2 };
    const bx = Math.min(Math.max(P0.x + 8, 4), W - tw - 4), by = Math.min(Math.max(P0.y + 6, 44), H - 24);
    g.fillStyle = 'rgba(230,255,248,0.9)'; g.fillRect(bx, by, tw, 21); g.lineWidth = 1; g.strokeStyle = col; g.strokeRect(bx, by, tw, 21);
    g.fillStyle = '#004a3c'; g.fillText(txt, bx + 5, by + 3);
  }
}

