// Phyllotaxis geometry for the two things drawn in full depth: the artichoke and the romanesco.
// Local frame of each: origin at the centre of the body, +y = the tip. See layout.js for the rule and the numbers.
import * as THREE from 'three';
import { mk, cyl, tag } from '../../engine/core.js';
import { GOLDEN_DEG, ARTICHOKE, ROMANESCO } from './layout.js';
import { SPEC, bracts, bractPoint, anchor } from './artichoke_spec.mjs';

const GA = GOLDEN_DEG * Math.PI / 180;
// lattice point n -> { n, theta, phi, p (on the stretched body), nrm (outward), up (along the surface toward the tip), rho }
export function lattice({ N, theta0, lnG, R, stretch }) {
  const out = [];
  for (let n = 0; n < N; n++) {
    const theta = 2 * Math.atan(Math.tan(theta0 / 2) * Math.exp(lnG * n)), phi = n * GA;
    const st = Math.sin(theta), ct = Math.cos(theta), cp = Math.cos(phi), sp = Math.sin(phi);
    const p = new THREE.Vector3(R * st * cp, R * stretch * ct, R * st * sp);
    const nrm = new THREE.Vector3(st * cp, ct / stretch, st * sp).normalize();
    const up = new THREE.Vector3(-ct * cp, stretch * st, -ct * sp).normalize();
    out.push({ n, theta, phi, p, nrm, up, rho: R * st });
  }
  return out;
}
const basis = (x, y, z) => new THREE.Matrix4().makeBasis(x, y, z);
function merge(parts) { // [[geometry, Matrix4]] -> one non-indexed geometry
  let n = 0; const gs = parts.map(([g, m]) => { const c = (g.index ? g.toNonIndexed() : g.clone()); c.applyMatrix4(m); n += c.attributes.position.count; return c; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const c of gs) { pos.set(c.attributes.position.array, o); nor.set(c.attributes.normal.array, o); o += c.attributes.position.count * 3; c.dispose(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return g;
}

const ART_LOOK = { grey: 0.52, col: 0x6f8a55 }, ART_IN = { grey: 0.4, col: 0x586f48 }, STEM = { grey: 0.45, col: 0x77895a }, CUT = { grey: 0.7, col: 0xc9d39a };
// spec frame (plate: z = axis to the apex, x / y the plan) -> this group's frame (+y = the tip), in metres.
// The swap of y and z keeps the hand: n + 1 is clockwise from n seen from the tip, as on PLATE XVIII.
const toMesh = (p, R) => [R * p[0], R * p[2], R * p[1]];
const NS = 12, NT = 41;     // grid of one bract face: along (base -> edge) x across (resolves the notch, point and teeth)
function bractGeo(b, R) {
  const pos = [], idx = [], at = (f, i, j) => f * NS * NT + i * NT + j;
  for (const back of [0, 1]) for (let i = 0; i < NS; i++) { const sp = i / (NS - 1);
    for (let j = 0; j < NT; j++) pos.push(...toMesh(bractPoint(b, sp, -1 + 2 * j / (NT - 1), back).p, R)); }
  for (let i = 0; i < NS - 1; i++) for (let j = 0; j < NT - 1; j++) {
    idx.push(at(0, i, j), at(0, i + 1, j), at(0, i, j + 1), at(0, i + 1, j), at(0, i + 1, j + 1), at(0, i, j + 1));
    idx.push(at(1, i, j), at(1, i, j + 1), at(1, i + 1, j), at(1, i + 1, j), at(1, i, j + 1), at(1, i + 1, j + 1)); }
  // the rim (the bract's thickness): the free edge and both margins, front to back
  const ring = [];
  for (let i = 0; i < NS; i++) ring.push([i, 0]);
  for (let j = 1; j < NT; j++) ring.push([NS - 1, j]);
  for (let i = NS - 2; i >= 0; i--) ring.push([i, NT - 1]);
  for (let k = 0; k < ring.length - 1; k++) { const [i0, j0] = ring[k], [i1, j1] = ring[k + 1];
    idx.push(at(0, i0, j0), at(1, i0, j0), at(0, i1, j1), at(1, i0, j0), at(1, i1, j1), at(0, i1, j1)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
let artGeos = null;
// the hero artichoke (Jade's reference photo; shared bract layout with PLATE XVIII, see artichoke_spec.mjs):
// 32 broad cupped bracts with notched tips, each its own mesh (so the line render outlines every one), 8 / 5 arms
export function artichoke() {
  const A = ARTICHOKE, g = new THREE.Group(), B = bracts(), R = A.R;
  if (!artGeos) artGeos = B.map((b) => bractGeo(b, R));
  // the body under the bracts (closes the apex pit and the gaps low down)
  const core = mk(new THREE.SphereGeometry(R * 0.74, 24, 16), ART_IN); core.scale.set(1, SPEC.stretch, 1); g.add(core);
  B.forEach((b, i) => { const m = mk(artGeos[i], b.n % 2 ? ART_LOOK : { ...ART_LOOK, grey: 0.58 }); m.userData.bract = b.n; g.add(m); });
  // the short cut stem, its cut face pale
  const yb = -R * 0.86 * SPEC.stretch, sl = 0.026;
  g.add(cyl(0.0115, 0.0135, sl, STEM, [0, yb - sl / 2 + 0.004, 0], null, 14));
  g.add(cyl(0.0112, 0.0112, 0.0008, CUT, [0, yb - sl + 0.0036, 0], null, 14));
  // the lattice the sidecar lists: one point per bract, the count's anchor on its exposed part
  g.userData.lattice = B.map((b) => { const ap = anchor(b), p = new THREE.Vector3(...toMesh(ap, R));
    const nrm = new THREE.Vector3(...toMesh(b.Nv, 1)).normalize(); return { n: b.n, theta: b.theta, phi: b.phi, p, nrm, rho: R * Math.sin(b.theta) }; });
  g.userData.holdWhole = true;   // hold pass: engine/main.js holdsFor hulls all the bracts as one held object
  return tag(g, 'THE ARTICHOKE (full depth; 8 / 5 spiral arms)');
}

const ROM_LOOK = { grey: 0.74, col: 0xb6cf5e }, ROM_IN = { grey: 0.6, col: 0x9ab54c }, LEAF = { grey: 0.5, col: 0x6f9a52 };
let romGeos = null;
// one floret, local frame: apex at +y * h, base at y = 0; sub-florets on its surface by the same rule (5 / 3 arms)
function floretGeo(rb, h) {
  const S = Math.hypot(rb, h), sinB = rb / S, cosB = h / S, [a, b] = ROMANESCO.sub.arms;
  const lnG = 2 * Math.PI / (Math.sqrt(5) * a * b) * sinB, K = Math.ceil(Math.log(1 / ROMANESCO.sub.s0) / lnG);
  const unit = new THREE.ConeGeometry(1, 1, 6, 1); unit.translate(0, 0.5, 0);   // base at y 0, apex at y 1
  const parts = [[new THREE.ConeGeometry(rb, h, 10, 1), new THREE.Matrix4().makeTranslation(0, h / 2, 0)]];
  for (let k = 0; k < K; k++) {
    const s = S * ROMANESCO.sub.s0 * Math.exp(lnG * k); if (s > S * 0.97) break;
    const phi = k * GA, r2 = s * sinB, cp = Math.cos(phi), sp = Math.sin(phi);
    const p = new THREE.Vector3(r2 * cp, h - s * cosB, r2 * sp), nrm = new THREE.Vector3(cosB * cp, sinB, cosB * sp);
    const y = nrm.clone().multiplyScalar(0.8).add(new THREE.Vector3(0, 0.35, 0)).normalize();
    const x = new THREE.Vector3().crossVectors(y, new THREE.Vector3(-sp, 0, cp)).normalize(), z = new THREE.Vector3().crossVectors(x, y).normalize();
    const m = basis(x, y, z).scale(new THREE.Vector3(0.46 * r2, 0.75 * r2, 0.46 * r2)); m.setPosition(p.addScaledVector(nrm, -0.12 * r2));
    parts.push([unit, m]);
  }
  return merge(parts);
}
// the hero romanesco: 111 florets on 13 / 8 arms, each floret a cone carrying its own 5 / 3 spiral of cones
export function romanesco() {
  const A = ROMANESCO, g = new THREE.Group(), L = lattice(A);
  if (!romGeos) romGeos = L.map((b) => { const rho = Math.max(b.rho, 0.003); return floretGeo(0.3 * rho, 0.78 * rho); });
  const core = mk(new THREE.SphereGeometry(A.R * 0.93, 20, 14), ROM_IN); core.scale.set(1, A.stretch, 1); g.add(core);
  const Y = new THREE.Vector3(0, 1, 0);
  L.forEach((b, i) => {
    const y = b.nrm.clone().add(Y.clone().multiplyScalar(0.45)).normalize();
    const x = new THREE.Vector3().crossVectors(y, b.up).normalize(), z = new THREE.Vector3().crossVectors(x, y).normalize();
    const m = mk(romGeos[i], b.n % 2 ? ROM_LOOK : { ...ROM_LOOK, grey: 0.8 });
    m.position.copy(b.p).addScaledVector(y, -0.08 * b.rho); m.quaternion.setFromRotationMatrix(basis(x, y, z)); m.userData.floret = b.n; g.add(m);
  });
  // leaves cupping the base
  for (let k = 0; k < 7; k++) { const a = k * 2 * Math.PI / 7 + 0.3, r = A.R * 1.02;
    const leaf = mk(new THREE.SphereGeometry(1, 10, 8), LEAF); leaf.scale.set(0.04, 0.062, 0.008);
    leaf.position.set(r * Math.cos(a), -0.012, r * Math.sin(a)); leaf.rotation.set(0, -a + Math.PI / 2, 0); leaf.rotateX(-0.35); g.add(leaf); }
  g.add(cyl(0.02, 0.022, 0.03, LEAF, [0, -0.05, 0], null, 10));
  g.userData.lattice = L;
  return tag(g, 'THE ROMANESCO (full depth; 13 / 8 arms, spiral within spiral)');
}
// place a hero object: centre at `at`, tip along `axis`
export function place(g, at, axis) {
  g.position.set(...at); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...axis).normalize()); g.updateMatrixWorld(true); return g;
}
// world positions of the lattice points of a placed hero object, with the arm indices
export function latticeWorld(g, arms) {
  return g.userData.lattice.map((b) => ({ n: b.n, arms: Object.fromEntries(arms.map((a) => [a, b.n % a])),
    w: b.p.clone().addScaledVector(b.nrm, 0.0).applyMatrix4(g.matrixWorld), nrm: b.nrm.clone().transformDirection(g.matrixWorld) }));
}
