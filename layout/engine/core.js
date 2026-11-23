// Shared helpers for the layout blockouts. Units: metres, y up. Every mesh carries a "look" in userData that the
// renderer turns into the material for each mode:
//   grey  0..1   value in flat / label modes
//   col   hex    colour in the lit preview
//   emit  hex    emissive colour (lit) — emitters render near-white in flat, and glow in lit
//   emitI number emissive strength in lit (default 1)
//   only  [modes] render only in these modes (e.g. glass: ['lit'], neon lettering: ['label','lit'])
//   hide  [modes] never render in these modes
//   label string  the label-mode name of the object this mesh belongs to (set with tag())
//   noCast / noRecv  shadow flags; recvShadowLine: shadow outline drawn on this surface in line mode
import * as THREE from 'three';

THREE.ColorManagement.enabled = false;

export const V = (a, b, c) => (Array.isArray(a) ? new THREE.Vector3(...a) : a && a.isVector3 ? a.clone() : new THREE.Vector3(a || 0, b || 0, c || 0));
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
export const UP = new THREE.Vector3(0, 1, 0);

export function mk(geom, look = {}) {
  const m = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
  m.userData.look = { grey: 0.6, col: 0x808080, ...look };
  m.castShadow = !look.noCast && !look.emit;
  m.receiveShadow = !look.noRecv;
  return m;
}
export function box(w, h, d, look, at, rot) {
  const m = mk(new THREE.BoxGeometry(w, h, d), look);
  if (at) m.position.set(...at);
  if (rot) m.rotation.set(...rot.map(rad));
  return m;
}
export function cyl(r1, r2, h, look, at, rot, seg = 24) {
  const m = mk(new THREE.CylinderGeometry(r1, r2, h, seg), look);
  if (at) m.position.set(...at);
  if (rot) m.rotation.set(...rot.map(rad));
  return m;
}
export function ball(r, look, at, scale) {
  const m = mk(new THREE.SphereGeometry(r, 24, 16), look);
  if (at) m.position.set(...at);
  if (scale) m.scale.set(...scale);
  return m;
}
// a capsule between two points
export function limb(a, b, r, look) {
  const d = b.clone().sub(a), len = d.length();
  const m = mk(new THREE.CapsuleGeometry(r, Math.max(len, 1e-4), 6, 14), look);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  return m;
}
// a box spanning from a to b (its length axis), with width along `side` and thickness along the remaining axis
export function slab(a, b, width, thick, side, look) {
  const d = b.clone().sub(a), len = d.length(), y = d.clone().normalize();
  const x = side.clone().addScaledVector(y, -side.dot(y)).normalize(), z = new THREE.Vector3().crossVectors(x, y);
  const m = mk(new THREE.BoxGeometry(width, len, thick), look);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  return m;
}
// a flat quad from 4 corners (TL, TR, BR, BL), double sided
export function quad(c, look) {
  const g = new THREE.BufferGeometry();
  const p = [c[3], c[2], c[1], c[0]].flatMap((v) => v.toArray());
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  const m = mk(g, look); m.userData.double = true; return m;
}
// name everything under obj for label mode (first label wins unless force)
export function tag(obj, label, force = false) {
  obj.traverse((o) => { if (force || !o.userData.label) o.userData.label = label; });
  return obj;
}
export function group(...kids) { const g = new THREE.Group(); kids.flat().forEach((k) => k && g.add(k)); return g; }

// orthonormal frame helper: returns a quaternion whose local x,y,z map to the given world axes
export function basisQ(x, y, z) { return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); }

// two-bone IK: root, target, lengths, pole direction -> { mid, end, reach }
export function ik(root, target, l1, l2, pole) {
  const d = target.clone().sub(root); let dist = d.length(); const max = (l1 + l2) * 0.999, min = Math.abs(l1 - l2) * 1.001 + 1e-4;
  const reach = dist / (l1 + l2);
  if (dist > max) { d.multiplyScalar(max / dist); dist = max; }
  if (dist < min) { d.multiplyScalar(min / Math.max(dist, 1e-6)); dist = min; }
  const end = root.clone().add(d), n = d.clone().normalize();
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const p = pole.clone().addScaledVector(n, -pole.dot(n)); if (p.lengthSq() < 1e-8) p.set(0, -1, 0); p.normalize();
  return { mid: root.clone().addScaledVector(n, a).addScaledVector(p, h), end, reach };
}

// canvas texture with text (used for the neon lettering and the label-mode signage)
export function textTexture(lines, { w = 1024, h = 256, font = 'bold 120px sans-serif', fg = '#ff3a2a', bg = 'rgba(0,0,0,0)', mirror = false } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (mirror) { g.translate(w, 0); g.scale(-1, 1); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const L = Array.isArray(lines) ? lines : [lines];
  L.forEach((ln, i) => { g.font = ln.font || font; g.fillText(ln.text ?? ln, w / 2, (h * (i + 0.5)) / L.length); });
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
