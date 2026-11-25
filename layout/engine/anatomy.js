// Smooth body geometry for the articulated mannequins (2026-11-25). Every helper returns a BufferGeometry already in
// WORLD coordinates (position + analytic or smoothed normals, no uv), so the pieces of one body part can be merged
// into one mesh (mergeGeos) and every mesh keeps an identity transform.
//   taperGeo     a "sphere-cone": sphere r1 at a, sphere r2 at b, joined by the tangent cone. Two of them meeting at a
//                joint with the same radius there join without a seam or a pinch at any bend (the joint is the sphere).
//                Optional elliptical cross-section (sx along `side`, sz along the third axis).
//   ellipsoidGeo an ellipsoid with axes along a given basis
//   palmGeo      the palm: a tapered rounded slab (superellipsoid), in the hand frame
//   mergeGeos    concatenates geometries (position, normal, index)
//   partMesh     merged mesh with a look and a line-mode id group (render.js draws no id edges inside one group)
import * as THREE from 'three';
import { mk } from './core.js';

// orthonormal frame with y along a->b and x as close as possible to `side`
export function axisFrame(a, b, side) {
  const y = b.clone().sub(a); const len = y.length(); if (len > 1e-9) y.divideScalar(len); else y.set(0, 1, 0);
  let x = side ? side.clone() : new THREE.Vector3(1, 0, 0); x.addScaledVector(y, -x.dot(y));
  if (x.lengthSq() < 1e-6) { x = Math.abs(y.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1); x.addScaledVector(y, -x.dot(y)); }
  x.normalize(); const z = new THREE.Vector3().crossVectors(x, y);
  return { x, y, z, len };
}

// profile [[rho, y, nrho, ny], ...] revolved about local y, cross-section scaled (sx, sz), placed in frame F at origin o
function revolve(prof, F, o, sx, sz, radial) {
  const nr = prof.length, pos = new Float32Array(nr * radial * 3), nor = new Float32Array(nr * radial * 3);
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < nr; i++) {
    const [rho, y, nrho, ny] = prof[i];
    for (let j = 0; j < radial; j++) {
      const th = (j / radial) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      const lx = sx * rho * c, lz = sz * rho * s;
      let nx = nrho * c / sx, nz = nrho * s / sz, nyy = ny; const l = Math.hypot(nx, nyy, nz) || 1; nx /= l; nyy /= l; nz /= l;
      p.copy(o).addScaledVector(F.x, lx).addScaledVector(F.y, y).addScaledVector(F.z, lz);
      n.set(0, 0, 0).addScaledVector(F.x, nx).addScaledVector(F.y, nyy).addScaledVector(F.z, nz);
      pos[k] = p.x; pos[k + 1] = p.y; pos[k + 2] = p.z; nor[k] = n.x; nor[k + 1] = n.y; nor[k + 2] = n.z; k += 3;
    }
  }
  const idx = [];
  for (let i = 0; i < nr - 1; i++) for (let j = 0; j < radial; j++) {
    const a = i * radial + j, b = i * radial + (j + 1) % radial, c = (i + 1) * radial + j, d = (i + 1) * radial + (j + 1) % radial;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setIndex(idx);
  return g;
}

export function taperGeo(a, b, r1, r2, { side = null, sx = 1, sz = 1, radial = 14, cap = 5 } = {}) {
  const F = axisFrame(a, b, side), L = F.len;
  if (L <= Math.abs(r1 - r2) + 1e-6) { // one sphere swallows the other
    const big = r1 >= r2 ? a : b, r = Math.max(r1, r2);
    return ellipsoidGeo(big, [r * sx, r, r * sz], F, { w: radial, h: Math.max(6, cap * 2) });
  }
  const phi = Math.asin((r1 - r2) / L), prof = [];
  for (let i = 0; i <= cap; i++) { const t = -Math.PI / 2 + (phi + Math.PI / 2) * i / cap; prof.push([r1 * Math.cos(t), r1 * Math.sin(t), Math.cos(t), Math.sin(t)]); }
  for (let i = 0; i <= cap; i++) { const t = phi + (Math.PI / 2 - phi) * i / cap; prof.push([r2 * Math.cos(t), L + r2 * Math.sin(t), Math.cos(t), Math.sin(t)]); }
  return revolve(prof, F, a, sx, sz, radial);
}

// a chain of tapers through points[i] with radii[i]: one smooth limb (joints are the shared spheres)
export function chainGeos(points, radii, opts = {}) {
  const out = []; for (let i = 0; i < points.length - 1; i++) out.push(taperGeo(points[i], points[i + 1], radii[i], radii[i + 1], opts));
  return out;
}

// ellipsoid at c with radii [rx, ry, rz] along the basis F {x, y, z}
export function ellipsoidGeo(c, radii, F, { w = 18, h = 12 } = {}) {
  const g = new THREE.SphereGeometry(1, w, h); g.deleteAttribute('uv');
  const m = new THREE.Matrix4().makeBasis(F.x.clone().multiplyScalar(radii[0]), F.y.clone().multiplyScalar(radii[1]), F.z.clone().multiplyScalar(radii[2]));
  m.setPosition(c); g.applyMatrix4(m);
  return g;
}

// a closed surface from a point function at(u, v), u in [-pi/2, pi/2] (pole to pole), v around. Poles are single
// vertices and rings wrap, so the smoothed normals have no seam; the winding is fixed to face outward (a mirrored
// frame, e.g. a left hand, would otherwise turn it inside out: the line pass and lit passes use gl_FrontFacing)
export function gridGeo(at, nu = 12, nv = 20) {
  const pts = [at(-Math.PI / 2, 0)];
  for (let i = 1; i < nu; i++) { const u = -Math.PI / 2 + Math.PI * i / nu; for (let j = 0; j < nv; j++) pts.push(at(u, -Math.PI + 2 * Math.PI * j / nv)); }
  pts.push(at(Math.PI / 2, 0));
  const idx = [], ring = (i, j) => 1 + (i - 1) * nv + ((j % nv) + nv) % nv, top = pts.length - 1;
  for (let j = 0; j < nv; j++) idx.push(0, ring(1, j + 1), ring(1, j));
  for (let i = 1; i < nu - 1; i++) for (let j = 0; j < nv; j++) { const a = ring(i, j), b = ring(i, j + 1), c = ring(i + 1, j), d = ring(i + 1, j + 1); idx.push(a, b, c, b, d, c); }
  for (let j = 0; j < nv; j++) idx.push(top, ring(nu - 1, j), ring(nu - 1, j + 1));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3)); g.setIndex(idx);
  g.computeVertexNormals();
  // outward test on a middle ring: normals against the ring's own centre
  const mid = Math.max(1, Math.floor(nu / 2)), c = new THREE.Vector3(); for (let j = 0; j < nv; j++) c.add(pts[ring(mid, j)]); c.multiplyScalar(1 / nv);
  const nrm = g.attributes.normal; let dot = 0; for (let j = 0; j < nv; j++) { const k = ring(mid, j); dot += (pts[k].x - c.x) * nrm.getX(k) + (pts[k].y - c.y) * nrm.getY(k) + (pts[k].z - c.z) * nrm.getZ(k); }
  if (dot < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  return g;
}
const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
const smooth = (t) => t * t * (3 - 2 * t);
// piecewise smooth interpolation of keyed rows [t, a, b, ...] at t
export function keyed(rows, t) {
  if (t <= rows[0][0]) return rows[0].slice(1); const n = rows.length; if (t >= rows[n - 1][0]) return rows[n - 1].slice(1);
  let i = 0; while (t > rows[i + 1][0]) i++; const k = smooth((t - rows[i][0]) / (rows[i + 1][0] - rows[i][0]));
  return rows[i].slice(1).map((v, j) => v + (rows[i + 1][j + 1] - v) * k);
}

// palm as a tapered rounded slab in the hand frame (x thumb side, y fingers, z palm normal), units of hand length,
// mapped to world by L(x, y, z). spec: y0, y1 (wrist end, knuckle end), w0, w1 (half widths), t0, t1 (half thickness),
// xc (centre line), slant (knuckle line drop toward the little finger)
export function palmGeo(L, s, { nu = 12, nv = 20 } = {}) {
  const e1 = s.e1 ?? 0.45, e2 = s.e2 ?? 0.5;
  return gridGeo((u, v) => {
    const X = spow(Math.cos(u), e1) * spow(Math.cos(v), e2), Y = spow(Math.sin(u), e1), Z = spow(Math.cos(u), e1) * spow(Math.sin(v), e2);
    const t = (Y + 1) / 2, sm = smooth(t);
    const hw = s.w0 + (s.w1 - s.w0) * Math.min(1, sm * 1.25), ht = s.t0 + (s.t1 - s.t0) * sm;
    return L((s.xc ?? 0) + X * hw, s.y0 + (s.y1 - s.y0) * t + (s.slant ?? 0) * X * t * t, Z * ht);
  }, nu, nv);
}

// a body swept along a curved spine: frame(t) -> { o, x, z } (t 0 bottom .. 1 top), prof: rows [t, halfWidth, halfDepth]
// (cross-section a superellipse with exponent e2, ends rounded with e1). One smooth surface: no crease where a
// chest block would meet an abdomen, and it bends with the spine.
// a point on that surface at height t (0..1), angle v round the cross-section (0 = +x, pi/2 = +z), pushed `inset` inward
export function sweptPoint(frame, prof, t, v, { e1 = 0.4, e2 = 0.75, inset = 0 } = {}) {
  const Y = 2 * t - 1, su = Math.sign(Y) * Math.pow(Math.abs(Y), 1 / e1), c = Math.pow(Math.max(0, 1 - su * su), e1 / 2);
  const [hw, hd] = keyed(prof, t), F = frame(t), X = spow(Math.cos(v), e2), Z = spow(Math.sin(v), e2);
  const p = F.o.clone().addScaledVector(F.x, c * hw * X).addScaledVector(F.z, c * hd * Z);
  if (inset) { const d = p.clone().sub(F.o); const l = d.length(); if (l > 1e-9) p.addScaledVector(d, -inset / l); }
  return p;
}
export function sweptGeo(frame, prof, { e1 = 0.4, e2 = 0.75, nu = 22, nv = 28 } = {}) {
  return gridGeo((u, v) => {
    const Y = spow(Math.sin(u), e1), c = spow(Math.cos(u), e1), t = (Y + 1) / 2;
    const [hw, hd] = keyed(prof, t), F = frame(t);
    return F.o.clone().addScaledVector(F.x, c * hw * spow(Math.cos(v), e2)).addScaledVector(F.z, c * hd * spow(Math.sin(v), e2));
  }, nu, nv);
}

export function mergeGeos(geos) {
  let nv = 0, ni = 0; for (const g of geos) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  let ov = 0, oi = 0;
  for (const g of geos) {
    const p = g.attributes.position, n = g.attributes.normal, c = p.count;
    for (let i = 0; i < c; i++) { pos[(ov + i) * 3] = p.getX(i); pos[(ov + i) * 3 + 1] = p.getY(i); pos[(ov + i) * 3 + 2] = p.getZ(i);
      nor[(ov + i) * 3] = n.getX(i); nor[(ov + i) * 3 + 1] = n.getY(i); nor[(ov + i) * 3 + 2] = n.getZ(i); }
    if (g.index) { const I = g.index; for (let i = 0; i < I.count; i++) idx[oi + i] = I.getX(i) + ov; oi += I.count; }
    else { for (let i = 0; i < c; i++) idx[oi + i] = ov + i; oi += c; }
    ov += c; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere(); out.computeBoundingBox();
  return out;
}

// one mesh from pieces; `group` = line-mode id group (string): pieces of one group draw no id edge between them
export function partMesh(geos, look, group) {
  const m = mk(mergeGeos([].concat(geos)), look);
  if (group) m.userData.idGroup = group;
  return m;
}
