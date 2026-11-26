// Set-local helpers shared by basement90 and kitchen90 (kept out of layout/engine on purpose).
import * as THREE from 'three';
import { mk, box, cyl, ball, limb, slab, tag, V, rad } from '../../engine/core.js';
import { CAST, girthK } from '../../engine/mannequin.js';

// a straight wall with rectangular holes, one mesh (no seams in line mode).
//   axis 'z': the wall lies in the plane z = at and runs along x from a0 to a1
//   axis 'x': the wall lies in the plane x = at and runs along z from a0 to a1
//   out: +1 / -1 = the side the thickness goes to (away from the room); holes: [{ a0, a1, y0, y1 }]
export function wall({ axis, at, a0, a1, y0 = 0, y1, t = 0.15, out = 1, holes = [], look, label }) {
  const sh = new THREE.Shape(); sh.moveTo(a0, y0); sh.lineTo(a1, y0); sh.lineTo(a1, y1); sh.lineTo(a0, y1); sh.lineTo(a0, y0);
  for (const h of holes) { const p = new THREE.Path(), e = h.y0 <= y0 ? y0 + 1e-3 : h.y0; p.moveTo(h.a0, e); p.lineTo(h.a0, h.y1); p.lineTo(h.a1, h.y1); p.lineTo(h.a1, e); p.lineTo(h.a0, e); sh.holes.push(p); }
  const m = mk(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), look);
  if (axis === 'z') m.position.z = out > 0 ? at : at - t;
  else { m.rotation.y = -Math.PI / 2; m.position.x = out > 0 ? at + t : at; }   // shape x -> world z, extrusion -> world -x
  return tag(m, label);
}
// a closed box-like solid from two quads (near 4 corners, far 4 corners, same winding)
export function hexa(n, f, look) {
  const p = [...n, ...f].flatMap((v) => (Array.isArray(v) ? v : v.toArray()));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setIndex([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0]); g.computeVertexNormals();
  const m = mk(g, look); m.userData.double = true; return m;
}
// a thin polyline (for label-mode guides: beam footprints, shaft edges)
export function polyline(pts, r, look, closed = false) {
  const g = new THREE.Group(); const P = pts.map((p) => V(p));
  for (let i = 0; i < P.length - (closed ? 0 : 1); i++) g.add(limb(P[i], P[(i + 1) % P.length], r, look));
  return g;
}
// a simple four-legged kitchen chair. at [x, z], yaw deg (0 = the sitter faces +z)
export function kitchenChair(at, yaw, look, o = {}) {
  const g = new THREE.Group(); g.position.set(at[0], 0, at[1]); g.rotation.y = rad(yaw);
  const sw = o.w ?? 0.42, sd = o.d ?? 0.42, sh = o.seatTop ?? 0.45, bh = o.backTop ?? 0.88, lg = 0.035;
  g.add(box(sw, 0.03, sd, look, [0, sh - 0.015, 0]));
  for (const sx of [-1, 1]) { g.add(box(lg, sh - 0.03, lg, look, [sx * (sw / 2 - lg / 2), (sh - 0.03) / 2, sd / 2 - lg / 2]));
    g.add(box(lg, bh, lg, look, [sx * (sw / 2 - lg / 2), bh / 2, -sd / 2 + lg / 2])); }
  g.add(box(sw - lg, 0.09, 0.02, look, [0, bh - 0.06, -sd / 2 + lg / 2])); g.add(box(sw - lg, 0.05, 0.02, look, [0, bh - 0.22, -sd / 2 + lg / 2]));
  return g;
}
// five-spoke swivel task chair. spec: { at [x, z], seatYaw deg (0 = sitter faces +z), spoke0 deg (world angle of spoke 0) }
export function swivelChair(C, spec = {}) {
  const at = spec.at || C.at, seatYaw = spec.seatYaw ?? C.seatYaw, spoke0 = spec.spoke0 ?? C.spoke0;
  const g = new THREE.Group(); const MET = { grey: 0.22, col: 0x1c1c20 }, FAB = { grey: 0.36, col: 0x4a3f38 };
  const hub = V(at[0], C.spokeTop - 0.02, at[1]);
  g.add(tag(cyl(0.045, 0.05, 0.07, MET, [hub.x, C.spokeTop - 0.005, hub.z]), 'chair hub'));
  for (let k = 0; k < 5; k++) { const a = rad(spoke0 + 72 * k), d = V(Math.cos(a), 0, Math.sin(a));
    const tip = hub.clone().addScaledVector(d, C.spokeR); tip.y = C.spokeTop - 0.03;
    g.add(tag(slab(hub.clone().setY(C.spokeTop - 0.0175), tip.clone().setY(C.spokeTop - 0.0175 - 0.012), C.spokeW, 0.035, V(-d.z, 0, d.x), MET), 'chair spokes (five)'));
    g.add(tag(ball(C.caster, MET, [tip.x, C.caster, tip.z]), 'casters')); }
  g.add(tag(cyl(0.025, 0.025, C.seatTop - C.seat.t - C.spokeTop, MET, [hub.x, (C.seatTop - C.seat.t + C.spokeTop) / 2, hub.z], null, 12), 'gas column'));
  const top = new THREE.Group(); top.position.set(at[0], 0, at[1]); top.rotation.y = rad(seatYaw);
  top.add(box(C.seat.w, C.seat.t, C.seat.d, FAB, [0, C.seatTop - C.seat.t / 2, 0]));
  top.add(slab(V(0, C.seatTop - C.seat.t, -C.seat.d / 2 + 0.03), V(0, (C.back.y0 + C.back.y1) / 2, C.back.z - 0.035), 0.05, 0.015, V(1, 0, 0), MET));
  top.add(box(C.back.w, C.back.y1 - C.back.y0, C.back.t, FAB, [0, (C.back.y0 + C.back.y1) / 2, C.back.z]));
  g.add(tag(top, 'swivel chair'));
  return g;
}
// world offset -> a figure's body-local frame (x = its left, z = its front) for legOpts.ankleL / ankleR.
// Returns the override for that side (the engine mirrors x for the right leg).
export function ankleLocal(world, pelvis, yawDeg, side) { const a = rad(yawDeg), dx = world[0] - pelvis[0], dy = world[1] - pelvis[1], dz = world[2] - pelvis[2];
  const lx = dx * Math.cos(a) - dz * Math.sin(a), lz = dx * Math.sin(a) + dz * Math.cos(a); return [side === 'L' ? lx : -lx, dy, lz]; }
// sidecar helpers
export const r3 = (v) => (Array.isArray(v) ? v : v.toArray()).map((x) => +x.toFixed(4));
export const mirrorMatrix = (n, d) => new THREE.Matrix4().set(1 - 2 * n.x * n.x, -2 * n.x * n.y, -2 * n.x * n.z, 2 * d * n.x, -2 * n.y * n.x, 1 - 2 * n.y * n.y, -2 * n.y * n.z, 2 * d * n.y, -2 * n.z * n.x, -2 * n.z * n.y, 1 - 2 * n.z * n.z, 2 * d * n.z, 0, 0, 0, 1);
export function pointInQuad(p, q) { let s = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4]; const c = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); if (c !== 0) { if (s === 0) s = Math.sign(c); else if (Math.sign(c) !== s) return false; } } return true; }
// hide meshes by label (plan views lift the ceiling off)
export function hideLabels(root, labels) { if (!labels) return; root.traverse((o) => { if (o.isMesh && labels.some((l) => (o.userData.label || '').startsWith(l))) { o.visible = false; o.userData.baseVisible = false; } }); }

// ---- footwear, set-local (the engine has only a sock colour, `costume.sock`, on its foot mesh; no shoes, no cuffs).
// footwear(fig, { cuff: { h, look }, slipper: { look, sole, wall, collar, open } }) -> a Group in world space, built from
// the figure's own foot mesh (idGroup ...footL / footR) and its knee / ankle points, so it follows every pose.
//   cuff: a sock tube from the ankle up the shin (h metres), 2 mm proud of the leg, so the sock's top edge draws a
//         line over the trouser hem; slipper: a shell offset from the foot surface (wall m, sole m under the sole),
//         cut at `collar` m above its own bottom; open: true = a backless scuff (the heel shows the sock).
// the foot mesh pushed out by d (and dz more under the sole), in world space; also returns per-vertex height / forward
function shell(foot, d, dz, info) {
  const fig = foot.parent, P = fig.userData.P, n = foot.userData.idGroup.slice(-1), heel = P['heel' + n], toe = P['toe' + n], A = P['ankle' + n];
  const fd = toe.clone().sub(heel); fd.y = 0; fd.normalize();
  const bottom = Math.min(heel.y, toe.y), axA = heel.clone().setY(bottom + 0.3 * (A.y - bottom)), axB = toe.clone().setY(axA.y), seg = axB.clone().sub(axA), L2 = seg.lengthSq();
  const src = foot.geometry, pos = src.attributes.position, N = pos.count, np = new Float32Array(N * 3), v = new THREE.Vector3();
  const hgt = new Float32Array(N), fwd = new Float32Array(N);
  for (let i = 0; i < N; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(foot.matrixWorld);
    const t = Math.max(0, Math.min(1, v.clone().sub(axA).dot(seg) / L2)), dv = v.clone().sub(axA.clone().addScaledVector(seg, t)), dl = dv.length() || 1;
    v.addScaledVector(dv, d / dl); if (dv.y < 0) v.y -= dz * Math.min(1, -dv.y / dl * 1.5);
    np.set([v.x, v.y, v.z], i * 3); hgt[i] = v.y - (bottom - dz); fwd[i] = v.clone().sub(heel).dot(fd); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(np, 3)); g.setIndex(Array.from(src.index.array)); g.computeVertexNormals();
  if (info) Object.assign(info, { hgt, fwd, FL: toe.clone().sub(heel).dot(fd), np });
  return g;
}
// a plain slip-on house slipper fitted to the engine's foot mesh: a flat sole (footprint traced from the foot, `margin`
// wider, `sole` thick) and, from `open` x the length to the toe, a vamp arching over the foot (`wall` off its top).
// open: 0 = closed heel; ~0.4 = a backless scuff (the sock heel shows).
function slipper(foot, S) {
  const fig = foot.parent, P = fig.userData.P, n = foot.userData.idGroup.slice(-1), heel = P['heel' + n], toe = P['toe' + n];
  const fd = toe.clone().sub(heel); fd.y = 0; fd.normalize(); const w = new THREE.Vector3(-fd.z, 0, fd.x), bottom = Math.min(heel.y, toe.y);
  const pos = foot.geometry.attributes.position, v = new THREE.Vector3(), pts = [];
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(foot.matrixWorld); pts.push([v.clone().sub(heel).dot(fd), v.clone().sub(heel).dot(w), v.y - bottom]); }
  const s0 = Math.min(...pts.map((p) => p[0])) - S.margin * 0.6, s1 = Math.max(...pts.map((p) => p[0])) + S.margin * 1.8, NB = 24;
  const bins = Array.from({ length: NB + 1 }, () => ({ lo: Infinity, hi: -Infinity, top: 0 }));
  for (const [x, y, z] of pts) { if (z > (S.maxH ?? 0.09)) continue; const k = Math.round((x - s0) / (s1 - s0) * NB), B = bins[k]; B.lo = Math.min(B.lo, y); B.hi = Math.max(B.hi, y); B.top = Math.max(B.top, z); }
  { const full = bins.map((B, k) => (B.lo < Infinity ? k : -1)).filter((k) => k >= 0);   // empty bins: interpolate between filled neighbours
    for (let k = 0; k <= NB; k++) if (bins[k].lo === Infinity) { const a = Math.max(...full.filter((j) => j < k), full[0]), b = Math.min(...full.filter((j) => j > k), full[full.length - 1]), t = b === a ? 0 : (k - a) / (b - a);
      bins[k] = { lo: bins[a].lo + (bins[b].lo - bins[a].lo) * t, hi: bins[a].hi + (bins[b].hi - bins[a].hi) * t, top: 0 }; } }
  const at = (k, lat, h) => heel.clone().addScaledVector(fd, s0 + (s1 - s0) * k / NB).addScaledVector(w, lat).setY(bottom + h);
  const soleTop = S.sole - 0.004, verts = [], idx = [], push = (p) => (verts.push(p.x, p.y, p.z), verts.length / 3 - 1);
  // sole: a rounded slab (rows across the footprint, top and bottom, edges closed)
  const half = (k) => { const B = bins[k], e = k === 0 || k === NB ? 0.35 : 1; return [(B.lo + B.hi) / 2, ((B.hi - B.lo) / 2 + S.margin) * e]; };
  const T = [], Bo = [];
  for (let k = 0; k <= NB; k++) { const [c, hw] = half(k); T.push([push(at(k, c - hw, soleTop)), push(at(k, c + hw, soleTop))]); Bo.push([push(at(k, c - hw, -0.004)), push(at(k, c + hw, -0.004))]); }
  for (let k = 0; k < NB; k++) { const q = (a, b, c, d) => idx.push(a, b, c, a, c, d);
    q(T[k][0], T[k][1], T[k + 1][1], T[k + 1][0]); q(Bo[k][0], Bo[k + 1][0], Bo[k + 1][1], Bo[k][1]);
    q(Bo[k][0], T[k][0], T[k + 1][0], Bo[k + 1][0]); q(Bo[k][1], Bo[k + 1][1], T[k + 1][1], T[k][1]); }
  const q = (a, b, c, d) => idx.push(a, b, c, a, c, d); q(Bo[0][0], Bo[0][1], T[0][1], T[0][0]); q(Bo[NB][0], T[NB][0], T[NB][1], Bo[NB][1]);
  // vamp: half-elliptical arches over the foot from k0 to the toe
  const k0 = Math.round(S.open * NB), NA = 12, rows = [];
  // each arch point: a ray from outside toward the foot's axis, hit on the engine's foot surface, pushed out by `wall`
  // (the engine foot is a few long-tapered pieces, so its vertices say little about its surface between them)
  const rc = new THREE.Raycaster(), axisH = soleTop + 0.004;   // just above the sole: inside the foot all the way to the toe
  let kEnd = NB;
  for (let k = k0; k <= NB; k++) { const [c, hw] = half(k), r = [], ax = at(k, c, axisH); let miss = 0;
    for (let j = 0; j <= NA; j++) { const th = Math.PI * j / NA, dir = w.clone().multiplyScalar(-Math.cos(th)).add(new THREE.Vector3(0, Math.sin(th), 0)).normalize();
      rc.set(ax.clone().addScaledVector(dir, 0.25), dir.clone().negate()); rc.far = 0.25; const hit = rc.intersectObject(foot, false)[0];
      if (!hit) { miss++; continue; } const p = hit.point.clone().addScaledVector(dir, S.wall);
      if (p.y < bottom + soleTop) p.y = bottom + soleTop; r.push(push(p)); }
    if (miss) { kEnd = k; break; } rows.push(r); }
  // the toe: close the last arch onto a point at the sole's front edge
  { const tipK = Math.min(NB, kEnd + 1), tip = push(at(tipK, half(tipK)[0], soleTop + 0.004)); rows.push(Array(NA + 1).fill(tip)); }
  for (let k = 0; k < rows.length - 1; k++) for (let j = 0; j < NA; j++) q(rows[k][j], rows[k + 1][j], rows[k + 1][j + 1], rows[k][j + 1]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = mk(g, S.look); m.userData.double = true; return m;
}
export function footwear(fig, o = {}) {
  const P = fig.userData.P, out = new THREE.Group(); fig.updateMatrixWorld(true);
  for (const n of ['L', 'R']) {
    const A = P['ankle' + n], K = P['knee' + n], heel = P['heel' + n], toe = P['toe' + n];
    let leg = null, foot = null;
    fig.traverse((m) => { const g = m.userData?.idGroup; if (!m.isMesh || !g) return; if (g.endsWith(':leg' + n)) leg = m; if (g.endsWith(':foot' + n)) foot = m; });
    if (o.cuff && leg) {   // the sock: a shell over the engine's foot (so its colour and flat grey are ours) + a cuff tube up the shin
      // leg radius from the engine's own numbers (mannequin.js legs: rA = 0.019 H kg at the ankle, 0.036 H kg at the calf,
      // the calf point 70% of the way up the shin), read-only
      const c = CAST[fig.name], H = c.h, kg = girthK(c.kind), sd = K.clone().sub(A).normalize(), tC = 0.7 * K.distanceTo(A);
      const r0 = 0.019 * H * kg, h = o.cuff.h, rTop = r0 + (0.036 - 0.019) * H * kg * Math.min(1, h / tC), e = o.cuff.proud ?? 0.003, grp = `${fig.name}:sock${n}`;
      const cg = new THREE.CylinderGeometry(rTop + e, r0 + e, h, 24, 1, true), m = mk(cg, o.cuff.look); m.userData.double = true; m.userData.idGroup = grp;
      m.position.copy(A).addScaledVector(sd, h / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sd);
      out.add(tag(m, `${fig.name}: sock`));
      const cap = mk(new THREE.SphereGeometry(r0 + e, 24, 12), o.cuff.look); cap.position.copy(A); cap.userData.idGroup = grp; out.add(tag(cap, `${fig.name}: sock`));
      if (foot) { const sk = mk(shell(foot, 0.002, 0), o.cuff.look); sk.userData.idGroup = grp; out.add(tag(sk, `${fig.name}: sock`)); }
    }
    if (o.slipper && foot) out.add(tag(slipper(foot, o.slipper), `${fig.name}: slipper`));
  }
  return out;
}
