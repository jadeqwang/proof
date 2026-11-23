// Set-local helpers (a copy lives in each of shanghai86/ and office91/; engine/ is shared and left untouched).
//   addCast      register set-local cast members / proportions on the engine's CAST and PROP tables at import time
//   wall         one extruded wall with rectangular openings (a single mesh: no seams in line mode)
//   beamMeshes   the lit volume + its footprint as label-only tints and a faint haze in the lit preview
//   undraw       remove eyes / nose / mouth from a mannequin (faces the film leaves as paper)
//   resolvePts   let camera orbit/aim use set-specific named points
//   pointAt      an arm spec whose index fingertip lands on a point
//   fixLeftHands correct the orientation of left hands after staging (see the note at the function)
//   chair, stool, tableRect, rng
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, tag, V, rad } from '../../engine/core.js';
import { CAST, PROP, addCast, CHILD_PROP } from '../_cast.js';
export { addCast, CHILD_PROP };

// cast: the recurring people come from ../_cast.js (one table for every set); addCast registers this set's extras only

// axis 'x': inner face on the plane x = at, spanning z a0..a1; axis 'z': inner face on z = at, spanning x a0..a1.
// out = +1 when the wall body lies on the + side of that plane. holes: [{ a0, a1, y0, y1 }]
export function wall({ axis, at, a0, a1, h, t = 0.2, out = 1, holes = [], look, label }) {
  const sh = new THREE.Shape(); sh.moveTo(a0, 0); sh.lineTo(a1, 0); sh.lineTo(a1, h); sh.lineTo(a0, h); sh.lineTo(a0, 0);
  for (const o of holes) { const y0 = Math.max(o.y0, 1e-3); const p = new THREE.Path(); p.moveTo(o.a0, y0); p.lineTo(o.a0, o.y1); p.lineTo(o.a1, o.y1); p.lineTo(o.a1, y0); p.lineTo(o.a0, y0); sh.holes.push(p); }
  const geo = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false });
  if (axis === 'x') { geo.rotateY(-Math.PI / 2); geo.translate(out > 0 ? at + t : at, 0, 0); }   // (s, y, d) -> (x = -d, z = s)
  else geo.translate(0, 0, out > 0 ? at : at - t);
  return tag(mk(geo, look), label);
}

const solidTex = (css) => { const c = document.createElement('canvas'); c.width = c.height = 4; const g = c.getContext('2d'); g.fillStyle = css; g.fillRect(0, 0, 4, 4); return new THREE.CanvasTexture(c); };
// src, dst: 4 corners each (same order): the opening the light comes through and where it lands.
export function beamMeshes(src, dst, { tint = 'rgba(255,190,30,0.10)', foot = 'rgba(255,160,0,0.30)', lit = 0xfff1d0, haze = 0.07, lift = [0, 0.004, 0] } = {}) {
  const g = new THREE.Group(); const P = [...src, ...dst].map((v) => V(v));
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P.flatMap((v) => v.toArray()), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(16).fill(0.5), 2));
  const idx = []; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; idx.push(i, j, j + 4, i, j + 4, i + 4); }
  geo.setIndex(idx); geo.computeVertexNormals();
  const vol = mk(geo, { map: solidTex(tint), only: ['label'], noCast: true, noRecv: true }); g.add(vol);
  const hz = mk(geo, { emit: lit, emitI: 1, litMap: solidTex(`rgba(255,255,255,${haze})`), only: ['lit'], noCast: true, noRecv: true }); g.add(hz);
  const fp = quad(dst.map((v) => V(v).add(V(lift))), { map: solidTex(foot), only: ['label'], noCast: true, noRecv: true }); g.add(fp);
  for (const m of [vol, hz, fp]) { m.castShadow = false; m.receiveShadow = false; m.renderOrder = 5; }
  return g;
}

export function undraw(fig) {
  fig.traverse((o) => { if (!o.isMesh) return; const L = o.userData.look || {}, t = o.geometry.type;
    if (t === 'ConeGeometry' || L.col === 0x8a3b34 || (L.col === 0x111111 && t === 'SphereGeometry')) { o.visible = false; o.userData.baseVisible = false; } });
}

// names(t, figs) -> [x,y,z] | null for set-specific point names used by cameras
export function resolvePts(shot, names, figs) {
  const fix = (t) => (typeof t === 'string' && names(t, figs)) ? names(t, figs) : (t && t.mid ? { mid: t.mid.map(fix) } : t);
  if (shot.orbit) shot.orbit = { ...shot.orbit, at: fix(shot.orbit.at) };
  if (shot.aim) shot.aim = [fix(shot.aim[0]), shot.aim[1], shot.aim[2]];
}

// arm spec: index fingertip on point p, finger direction f (world), for a hand of length Lh on side 'L' | 'R'
export function pointAt(p, f, Lh, side, more = {}) {
  const F = V(f).normalize(); let n = new THREE.Vector3(0, -1, 0); n.addScaledVector(F, -n.dot(F)).normalize();
  const t = side === 'R' ? new THREE.Vector3().crossVectors(F, n) : new THREE.Vector3().crossVectors(n, F);
  const palm = V(p).addScaledVector(F, -0.71 * Lh).addScaledVector(t, -0.15 * Lh).addScaledVector(n, -0.06 * Lh);
  return { to: palm.toArray(), hand: 'point', fingers: F.toArray(), palm: [0, -1, 0], ...more };
}

// Left hands used to be corrected here after staging (the engine built them from a mirror basis pushed through a
// rotation-only quaternion). The engine now builds them exactly (engine/mannequin.js handFrame, integration pass), so
// this is a no-op kept only so existing imports keep working. Do not re-add a correction here: it would apply twice.
export function fixLeftHands() {}

export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- furniture primitives (origin on the floor)
export function chair(x, z, yaw, { seat = 0.44, w = 0.42, d = 0.42, back = 0.86, look = { grey: 0.5, col: 0x6a5238 }, label = 'chair' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rad(yaw);
  g.add(box(w, 0.03, d, look, [0, seat - 0.015, 0]));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.03, sz < 0 ? back : seat - 0.03, 0.03, look, [sx * (w / 2 - 0.02), (sz < 0 ? back : seat - 0.03) / 2, sz * (d / 2 - 0.02)]));
  g.add(box(w - 0.04, 0.16, 0.02, look, [0, back - 0.1, -d / 2 + 0.02]));
  return tag(g, label);
}
export function stool(x, z, { seat = 0.42, w = 0.3, d = 0.3, yaw = 0, look = { grey: 0.5, col: 0x7a5a38 }, label = 'stool' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rad(yaw);
  g.add(box(w, 0.03, d, look, [0, seat - 0.015, 0]));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.03, seat - 0.03, 0.03, look, [sx * (w / 2 - 0.03), (seat - 0.03) / 2, sz * (d / 2 - 0.03)]));
  g.add(box(w - 0.06, 0.025, 0.02, look, [0, seat * 0.35, d / 2 - 0.03])); g.add(box(w - 0.06, 0.025, 0.02, look, [0, seat * 0.35, -d / 2 + 0.03]));
  return tag(g, label);
}
export function tableRect(cx, cz, w, d, h, { look = { grey: 0.55, col: 0x6e5034 }, top = 0.035, leg = 0.05, label = 'table', topLook } = {}) {
  const g = new THREE.Group();
  g.add(box(w, top, d, topLook || look, [cx, h - top / 2, cz]));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(leg, h - top, leg, look, [cx + sx * (w / 2 - leg), (h - top) / 2, cz + sz * (d / 2 - leg)]));
  for (const sz of [-1, 1]) g.add(box(w - 2 * leg, 0.07, 0.02, look, [cx, h - top - 0.035, cz + sz * (d / 2 - leg)]));
  for (const sx of [-1, 1]) g.add(box(0.02, 0.07, d - 2 * leg, look, [cx + sx * (w / 2 - leg), h - top - 0.035, cz]));
  return tag(g, label);
}
export { THREE, mk, box, cyl, ball, quad, tag, V, rad };
