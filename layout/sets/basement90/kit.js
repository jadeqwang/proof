// Set-local helpers shared by basement90 and kitchen90 (kept out of layout/engine on purpose).
import * as THREE from 'three';
import { mk, box, cyl, ball, limb, slab, tag, V, rad } from '../../engine/core.js';

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
