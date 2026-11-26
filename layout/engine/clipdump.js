// Clip dump (2026-11-26, r4 attic+wall agent): the page half of engine/clipcheck.mjs. Additive: nothing else calls it.
//   clipDump(b, shot) -> { figs: { who: { parts: [{ region, soft, pos, idx }], joints, hands, spec } }, world: [{ label, sheet, pos, idx }] }
// Figures: every mesh of every figure (the baked mesh body: skin regions, garments, hair; hidden POV heads included,
// they are still there physically), tagged by region: 'skin*' / 'hand*' (hard) or garment / hair / apron (soft: cloth
// and hair give). World: every solid set mesh whose box comes within 5 cm of a figure (label-only guides and light
// volumes left out; window glass kept, as a sheet). Joint angles per figure (joints): elbow flexion, the elbow's bending
// direction (humeral rotation, as engine/body.js), shoulder elevation and horizontal extension (arm behind the body's
// plane), the wrist report (engine/wrist.js), knee flexion, neck turn and the spine (spec). Limits: engine/body.js LIMITS
// (adult / child) plus SHOULDER below. Nothing here moves anything.
import * as THREE from 'three';
import { LIMITS } from './body.js';

// shoulder ranges (deg; adult, AAOS normal values rounded down): elevation (flexion / abduction) 170, extension (arm
// behind the body, hanging) 50, horizontal extension (an elevated arm drawn back behind the shoulder line) 35
export const SHOULDER = { elevation: 170, extension: 50, hExt: 35 };
// spine (whole trunk, deg): forward bend 90, back bend 25, side bend 35, twist 40; neck turn: LIMITS.neckTurn
export const SPINE = { bend: 90, ext: 25, side: 35, twist: 40 };

const ang = (a, b) => Math.acos(THREE.MathUtils.clamp(a.clone().normalize().dot(b.clone().normalize()), -1, 1)) * 180 / Math.PI;
const r1 = (v) => +v.toFixed(1);

export function jointReport(P, spec, kind) {
  const kid = /^child/.test(kind || ''), lim = LIMITS[kid ? 'child' : 'adult'], out = { arms: {}, legs: {}, spine: {}, neck: {}, violations: [] };
  const { cx, cy, cz } = P; const flag = (m) => out.violations.push(m);
  for (const [n, s] of [['L', 1], ['R', -1]]) {
    const S = P['shoulder' + n], E = P['elbow' + n], W = P['wrist' + n]; if (!S || !E || !W) continue;
    const u = E.clone().sub(S).normalize(), f = W.clone().sub(E).normalize(), flex = ang(u, f), side = cx.clone().multiplyScalar(s);
    const a = { elbow_flex: r1(flex) };
    if (flex > lim.elbowFlex) flag(`elbow${n} flexed ${flex.toFixed(0)} (max ${lim.elbowFlex})`);
    if (flex > 25) { const b = new THREE.Vector3().crossVectors(u, f).normalize(), q = new THREE.Quaternion().setFromUnitVectors(cy.clone().negate(), u);
      const b0 = cx.clone().negate().applyQuaternion(q); b0.addScaledVector(u, -b0.dot(u)).normalize();
      const rot = Math.atan2(new THREE.Vector3().crossVectors(b0, b).dot(u), b0.dot(b)) * 180 / Math.PI; a.humeral_rot = r1(rot);
      if (Math.abs(rot) > lim.humRot) flag(`elbow${n} bends the wrong way (humeral rotation ${rot.toFixed(0)}, max ${lim.humRot})`); }
    // shoulder: elevation = angle of the upper arm from hanging; extension = how far a low arm swings behind the trunk;
    // horizontal extension = an elevated arm (> 45 deg) drawn behind the shoulder line
    const elev = ang(u, cy.clone().negate()); a.shoulder_elev = r1(elev);
    const back = -u.dot(cz), lat = u.dot(side);
    const ext = Math.atan2(back, Math.max(1e-6, -u.dot(cy))) * 180 / Math.PI; a.shoulder_ext = r1(ext);
    if (elev < 60 && ext > SHOULDER.extension) flag(`shoulder${n} extended ${ext.toFixed(0)} behind the body (max ${SHOULDER.extension})`);
    const hExt = Math.atan2(back, Math.max(1e-6, lat)) * 180 / Math.PI; a.shoulder_hext = r1(hExt);
    if (elev >= 45 && lat > 0 && hExt > SHOULDER.hExt) flag(`shoulder${n} horizontal extension ${hExt.toFixed(0)} (max ${SHOULDER.hExt})`);
    if (elev > SHOULDER.elevation) flag(`shoulder${n} elevated ${elev.toFixed(0)} (max ${SHOULDER.elevation})`);
    if (u.dot(side) < -0.85) flag(`shoulder${n}: upper arm crosses deep over the chest`);
    const w = P.wrists?.[n]; if (w) { a.wrist = { flex: w.flex_deg, radial: w.radial_deg, twist: w.twist_deg, swivel: w.elbow_swivel_deg, out_of_range: w.out_of_range };
      for (const o of w.out_of_range || []) flag(`wrist${n} ${o}`); }
    if (P.hands?.[n]) { a.reach = P.hands[n].reach; if (P.hands[n].reach > 1.0 && spec?.[n] && spec[n] !== 'side' && spec[n]?.to !== 'side') flag(`arm${n} cannot reach its target (reach ${P.hands[n].reach})`); }
    out.arms[n] = a;
  }
  for (const n of ['L', 'R']) { const H = P['hip' + n], K = P['knee' + n], A = P['ankle' + n]; if (!H || !K || !A) continue; const kf = ang(K.clone().sub(H), A.clone().sub(K)); out.legs['knee' + n] = r1(kf); if (kf > lim.kneeFlex) flag(`knee${n} flexed ${kf.toFixed(0)}`); }
  const sp = spec?.spine || {}; out.spine = { bend: sp.bend || 0, side: sp.side || 0, twist: sp.twist || 0 };
  if ((sp.bend || 0) > SPINE.bend || -(sp.bend || 0) > SPINE.ext) flag(`spine bend ${sp.bend}`); if (Math.abs(sp.side || 0) > SPINE.side) flag(`spine side ${sp.side}`); if (Math.abs(sp.twist || 0) > SPINE.twist) flag(`spine twist ${sp.twist}`);
  out.neck = { turn: P.headTurn }; if (Math.abs(P.headTurn || 0) > lim.neckTurn) flag(`neck turned ${P.headTurn}`);
  out.legs.preset = spec?.legs || 'stand';
  return out;
}

const shownSolid = (o) => { const L = o.userData.look; if (!L) return false; if (L.only && !L.only.includes('flat')) return false; if (L.glass) return /glass|pane|window/i.test(o.userData.label || ''); return true; };
const isGlass = (o) => !!o.userData.look?.glass;
function tris(o, box) {
  const g = o.geometry, pos = g.attributes.position, idx = g.index; o.updateMatrixWorld(true);
  const v = new THREE.Vector3(), P = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); P[3 * i] = v.x; P[3 * i + 1] = v.y; P[3 * i + 2] = v.z; }
  let I = idx ? Array.from(idx.array) : Array.from({ length: pos.count }, (_, i) => i);
  if (box) { const keep = [], tb = new THREE.Box3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let t = 0; t + 2 < I.length; t += 3) { a.fromArray(P, 3 * I[t]); b.fromArray(P, 3 * I[t + 1]); c.fromArray(P, 3 * I[t + 2]); tb.setFromPoints([a, b, c]); if (tb.intersectsBox(box)) keep.push(I[t], I[t + 1], I[t + 2]); } I = keep; }
  return { pos: Array.from(P, (x) => Math.round(x * 1e5) / 1e5), idx: I };
}

export function clipDump(b, shot = {}) {
  const figs = {}, fbox = new THREE.Box3();
  for (const [who, f] of Object.entries(b.figs || {})) {
    const P = f.userData.P, spec = f.userData.spec, parts = [];
    f.traverse((o) => { if (!o.isMesh || !o.userData.look || o.userData.look.glass) return; const L = o.userData.look; if (L.only && !L.only.includes('flat')) return;
      if (/held|cup/.test(o.userData.label || '')) return;   // a held prop is the hold check's business
      const id = o.userData.idGroup || '', region = o.userData.bodyRegion || id.split(':').pop() || o.name || 'part';
      if (/^eye_/.test(region)) return;   // the eyeballs sit inside the head
      const soft = !o.userData.bodyRegion || !!o.userData.garment || /hair|apron|skirt|brows/.test(region);
      fbox.expandByObject(o); parts.push({ region, soft, ...tris(o) }); });
    const hands = {}; for (const n of ['L', 'R']) { const h = P.hands?.[n]; if (h) hands[n] = { palm: P['hand' + n]?.toArray(), normal: h.n?.toArray(), fingers: h.f?.toArray(), shape: h.shape }; }
    const pts = {}; for (const k of ['head', 'eyes', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'handL', 'handR', 'hip', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'footL', 'footR']) if (P[k]) pts[k] = P[k].toArray();
    figs[who] = { parts, hands, points: pts, joints: jointReport(P, spec, P.H < 1.3 ? 'child5' : 'adult'), spec: { legs: spec.legs || 'stand', at: spec.at, yaw: spec.yaw, spine: spec.spine,
      L: typeof spec.L === 'object' ? { object: spec.L.object } : spec.L, R: typeof spec.R === 'object' ? { object: spec.R.object } : spec.R } };
  }
  const near = fbox.clone().expandByScalar(0.05), world = [];
  if (!fbox.isEmpty()) b.scene.traverse((o) => { if (!o.isMesh || o.userData.who || !shownSolid(o) || /: (sock|shoe|slipper)/.test(o.userData.label || '')) return;   // set-made footwear is the figure's clothing let hiddenUp = false; for (let q = o; q; q = q.parent) if (q.userData?.who) hiddenUp = true; if (hiddenUp) return;
    const bb = new THREE.Box3().setFromObject(o); if (bb.isEmpty() || !bb.intersectsBox(near)) return;
    const sz = bb.getSize(new THREE.Vector3()), t = tris(o, near); if (!t.idx.length) return;
    world.push({ label: o.userData.label || o.geometry.type, sheet: isGlass(o) || Math.min(sz.x, sz.y, sz.z) < 0.003 || !!o.userData.double, ...t }); });
  return { shot: shot.id, set: b.set, clip: shot.clip || null, figs, world };
}
