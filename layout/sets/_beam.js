// The beam, as geometry. ONE shared file for every "Proof" set (integration pass): each set's beam.js re-exports this.
//
// A beam is the convex solid swept by an APERTURE (a planar polygon: a window pane, a crack, a door gap) along the
// light: parallel (`dir`, sunlight) or diverging from a point (`src`, a bulb). It is clipped by the room's planes
// (`clip`: [{ name, n: [x,y,z], d }], keep n.p <= d); the cut faces are the FOOTPRINTS (where the light lands on that
// plane, ignoring figures and furniture: their shadows are in the flat / lit renders, which use a real shadowed light).
//
//   beamSolid({ aperture, dir | src, length, clip, sink })  ->  { faces, caps: { <plane name>: [Vector3] }, aperture }
//   beamMesh(solid, look)     one mesh of the solid (the light-volume mask, and the translucent volume in `lit`)
//   beamWire(solid, look, r)  its edges as thin rods (label mode)
//   prismSolid({ from, to, clip })   the convex solid between two polygons with the same corner order (a wedge under a
//                             tube, a frustum in front of a screen), clipped like a beam
//   splitAtTop(make, rect)    the same solid above an open-legged table top and, below it, only outside the top's rectangle
//   coneSolid({ apex, axis, halfAngleDeg, start, length, clip, n })   a lamp cone (n-gon aperture `start` m from the apex)
//   maskTwins(BASE)           the `beam_<id>` twin of every shot (same camera, beamMask: true)
//   applyBeamMask(root, solids, { hide })   turn a built scene into the mask: everything black, the lit volumes white
//   screenDiagonal(P, a, b)   on-screen direction of travel between two world points: { from_px, to_px, angle_deg }
//                             angle_deg = degrees below the horizontal; travel 'right-to-left' or 'left-to-right'
import * as THREE from 'three';
import { mk, limb, V, tag } from '../engine/core.js';

// clip a convex solid (a list of faces, each an ordered list of Vector3) by planes [{ name, n, d }], keeping n.p <= d
export function clipFaces(faces, clip = [], sink = 0, caps = {}) {
  for (const pl of clip) {
    const N = V(pl.n), d = pl.d + sink * N.length(); const out = [], cut = [];
    for (const f of faces) {
      const r = [];
      for (let i = 0; i < f.length; i++) {
        const a = f[i], b = f[(i + 1) % f.length], da = N.dot(a) - d, db = N.dot(b) - d;
        if (da <= 0) r.push(a);
        if ((da < 0 && db > 0) || (da > 0 && db < 0)) { const p = a.clone().lerp(b, da / (da - db)); r.push(p); cut.push(p); }
      }
      if (r.length >= 3) out.push(r);
    }
    if (cut.length >= 3) {
      const c = cut.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / cut.length);
      const far = cut.find((p) => p.distanceTo(c) > 1e-6); if (far) {
        const u = far.clone().sub(c).normalize(), w = new THREE.Vector3().crossVectors(N, u).normalize();
        const sorted = cut.map((p) => [Math.atan2(p.clone().sub(c).dot(w), p.clone().sub(c).dot(u)), p]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
        const cap = sorted.filter((p, i) => p.distanceTo(sorted[(i + sorted.length - 1) % sorted.length]) > 1e-5);
        if (cap.length >= 3) { out.push(cap); if (pl.name) caps[pl.name] = cap; }
      }
    }
    faces = out;
  }
  return faces;
}

export function beamSolid({ aperture, dir, src, length = 14, clip = [], sink = 0 }) {
  const A = aperture.map((p) => V(p));
  const S = src ? V(src) : null, D = dir ? V(dir).normalize() : null;
  const B = A.map((p) => p.clone().addScaledVector(S ? p.clone().sub(S).normalize() : D, length));
  const n = A.length;
  let faces = [A.slice(), B.slice()];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push([A[i], A[j], B[j], B[i]]); }
  const caps = {}; faces = clipFaces(faces, clip, sink, caps);
  return { faces, caps, aperture: A, dir: D, src: S };
}

export function beamMesh(solid, look) {
  const pos = [];
  for (const f of solid.faces) for (let i = 1; i < f.length - 1; i++) pos.push(...f[0].toArray(), ...f[i].toArray(), ...f[i + 1].toArray());
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  const m = mk(g, { noCast: true, noRecv: true, ...look }); m.userData.double = true; m.castShadow = false; m.receiveShadow = false; return m;
}

export function beamWire(solid, look, r = 0.004) {
  const g = new THREE.Group(); const seen = new Set(); const k = (p) => p.toArray().map((v) => v.toFixed(4)).join(',');
  for (const f of solid.faces) for (let i = 0; i < f.length; i++) {
    const a = f[i], b = f[(i + 1) % f.length]; if (a.distanceTo(b) < 1e-4) continue;
    const key = [k(a), k(b)].sort().join('|'); if (seen.has(key)) continue; seen.add(key);
    const m = limb(a, b, r, { noCast: true, noRecv: true, ...look }); m.castShadow = false; g.add(m);
  }
  return g;
}

// a flat polygon (ordered world points) as a mesh, lifted `lift` along its normal `n`
export function polyMesh(pts, look, n = [0, 1, 0], lift = 0.002) {
  const N = V(n).normalize(); const pos = [];
  for (let i = 1; i < pts.length - 1; i++) for (const p of [pts[0], pts[i], pts[i + 1]]) pos.push(...p.clone().addScaledVector(N, lift).toArray());
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  const m = mk(g, { noCast: true, ...look }); m.userData.double = true; m.castShadow = false; return m;
}

export function screenDiagonal(P, a, b) {
  const pa = P(V(a)), pb = P(V(b)); const dx = pb[0] - pa[0], dy = pb[1] - pa[1];
  return { from_px: pa, to_px: pb, angle_deg: +(Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI).toFixed(1), travel: dx < 0 ? 'right-to-left' : 'left-to-right' };
}

// the shared framing the three beams rhyme on (attic, wall, closet; also Voyager and the playground): on screen the
// light travels from upper right to lower left, RHYME.angle degrees below the horizontal, through RHYME.through (u, v).
export const RHYME = { angle: 40, travel: 'right-to-left', through: [0.5, 0.5], tolerance_deg: 3 };

const r3 = (v) => v.toArray().map((x) => +x.toFixed(4));
// sidecar block for one beam. anchor = the world point where the on-screen diagonal is measured (the mote, the hands).
export function beamSidecar({ name, kind, solid, anchor, P, cam, extra = {} }) {
  const A = V(anchor); const d = solid.src ? A.clone().sub(solid.src).normalize() : solid.dir.clone();
  const diag = screenDiagonal(P, A.clone().addScaledVector(d, -0.1), A.clone().addScaledVector(d, 0.1));
  const ap = P(A);
  return { name, kind, model: solid.src ? 'diverging from a point source' : 'parallel (sunlight)',
    source_world: solid.src ? r3(solid.src) : null, direction_of_travel: solid.dir ? r3(solid.dir) : r3(d),
    aperture_world: solid.aperture.map(r3), aperture_px: solid.aperture.map((p) => P(p)),
    footprints: Object.fromEntries(Object.entries(solid.caps).map(([k, pts]) => [k, { world: pts.map(r3), px: pts.map((p) => P(p)) }])),
    anchor_world: r3(A), anchor_px: ap, on_screen: diag,
    rhyme: { wanted: RHYME, angle_error_deg: +(diag.angle_deg - RHYME.angle).toFixed(1), travel_ok: diag.travel === RHYME.travel },
    mask: 'render the twin shot beam_<id> in flat mode: the lit volume is white, everything else black (figures and furniture in front of it occlude it)',
    ...extra };
}

// ---------------------------------------------------------------- shared by every set (integration pass)
// a lamp cone as a beam solid: apex (the bulb), axis (unit, the way the light travels), half angle; the aperture is an
// n-gon `start` metres down the axis (the shade rim), the solid runs `length` metres on and is clipped like any beam
export function coneSolid({ apex, axis, halfAngleDeg, start = 0.02, length = 8, clip = [], n = 40, sink = 0 }) {
  const A = V(apex), ax = V(axis).normalize(); const u = new THREE.Vector3().crossVectors(ax, Math.abs(ax.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize(), w = new THREE.Vector3().crossVectors(ax, u);
  const r = start * Math.tan(halfAngleDeg * Math.PI / 180), c = A.clone().addScaledVector(ax, start);
  const aperture = Array.from({ length: n }, (_, k) => c.clone().addScaledVector(u, r * Math.cos(k * 2 * Math.PI / n)).addScaledVector(w, r * Math.sin(k * 2 * Math.PI / n)).toArray());
  return beamSolid({ aperture, src: A.toArray(), length, clip, sink });
}

// the mask twins: `--prefix beam_ --modes flat --nojson` renders them
// With { surf: true } each shot also gets `beam_<id>__surf` (beamSurf: true): the lit SURFACES only, without the volume.
// Use it where the camera looks through a broad volume (the plain mask is then white almost everywhere).
export const maskTwins = (BASE, { surf = false } = {}) => BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }))
  .concat(surf ? BASE.map((s) => ({ ...s, id: 'beam_' + s.id + '__surf', beamMask: true, beamSurf: true, header: 'beam mask (lit surfaces only) for ' + s.id })) : []);

// ---- the mask
// outward planes [nx, ny, nz, d] (inside: n.p <= d) of a convex solid given by its faces
export function solidPlanes(solid) {
  const all = solid.faces.flat(); const c = all.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / all.length); const out = [];
  for (const f of solid.faces) { const n = new THREE.Vector3();
    for (let i = 0; i < f.length; i++) { const a = f[i], b = f[(i + 1) % f.length]; n.x += (a.y - b.y) * (a.z + b.z); n.y += (a.z - b.z) * (a.x + b.x); n.z += (a.x - b.x) * (a.y + b.y); }   // Newell
    if (n.length() < 1e-10) continue; n.normalize(); let d = n.dot(f[0]); if (n.dot(c) > d) { n.negate(); d = -d; } out.push([n.x, n.y, n.z, d]); }
  return out;
}
const inSolid = (planes, p, eps = 0) => planes.every(([x, y, z, d]) => x * p.x + y * p.y + z * p.z <= d + eps);
// a material that paints a surface white where it lies inside any of the solids, black elsewhere (no lights, no shadows)
function insideMaterial(planeSets) {
  const flat = planeSets.flat(), start = [], count = []; let k = 0; for (const ps of planeSets) { start.push(k); count.push(ps.length); k += ps.length; }
  return new THREE.ShaderMaterial({ side: THREE.DoubleSide, clipping: true,
    defines: { NP: Math.max(flat.length, 1), NS: Math.max(planeSets.length, 1) },
    uniforms: { uPl: { value: flat.length ? flat.map((p) => new THREE.Vector4(...p)) : [new THREE.Vector4(0, 0, 0, -1)] }, uStart: { value: start.length ? start : [0] }, uCount: { value: count.length ? count : [0] }, uN: { value: planeSets.length } },
    vertexShader: `#include <common>
      #include <clipping_planes_pars_vertex>
      varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
      #include <clipping_planes_vertex>
      }`,
    fragmentShader: `#include <common>
      #include <clipping_planes_pars_fragment>
      uniform vec4 uPl[NP]; uniform int uStart[NS]; uniform int uCount[NS]; uniform int uN; varying vec3 vW;
      void main(){
      #include <clipping_planes_fragment>
        float lit = 0.;
        for (int s = 0; s < NS; s++) { if (s >= uN) break; bool inside = true;
          for (int k = 0; k < NP; k++) { if (k >= uCount[s]) break; vec4 p = uPl[uStart[s] + k]; if (dot(p.xyz, vW) > p.w + 0.004) { inside = false; break; } }
          if (inside) { lit = 1.; break; } }
        gl_FragColor = vec4(vec3(lit), 1.); }` });
}

// Turn a built scene into the beam mask (call once, after everything is in `root` and the camera exists). White means
// "this pixel is in the light":
//   - every existing surface is painted white where it lies inside a lit solid and black elsewhere (cast shadows of
//     figures and furniture are NOT cut out of it: they are in the flat / lit renders);
//   - each lit solid is added as a white volume, so from OUTSIDE the light the whole shaft reads white (lit air in
//     front of unlit surfaces), with whatever stands in front of it occluding it. When the camera stands INSIDE a
//     solid every ray starts in lit air, so the volumes are left out and the mask is the lit surfaces only.
// `solids`: beamSolid / prismSolid / coneSolid results (one light may be several convex pieces), or ready meshes
// (a lit surface drawn as itself: mv10's bookcase fronts and poi ground). `hide`: RegExp of labels that are IN the
// light, not in front of it. The set's rig must return [] and flatBg must be black for a beamMask shot.
export function applyBeamMask(root, solids, { hide = null, label = 'beam (mask)', cam = null, surfaceOnly = false } = {}) {
  const vols = solids.filter((s) => s && !s.isObject3D && s.faces.length >= 4), planeSets = vols.map(solidPlanes);
  const mat = insideMaterial(planeSets);
  root.traverse((o) => { if (!o.isMesh || !o.userData.look) return;
    o.userData.look = { ...o.userData.look, grey: 0, flatGrey: 0, emit: undefined, flatEmit: undefined, map: undefined, material: mat };
    if (hide && hide.test(o.userData.label || '')) o.visible = false; });
  const WHITE = { grey: 1, emit: 0xffffff, flatEmit: 1 };
  const camIn = surfaceOnly || (!!cam && planeSets.some((ps) => inSolid(ps, cam.position, 0.02)));
  for (const s of solids) { if (!s) continue; let m;
    if (s.isObject3D) { m = s; m.traverse((o) => { if (o.isMesh) { o.userData.look = { ...WHITE, noCast: true, noRecv: true }; o.userData.double = true; o.castShadow = false; o.visible = true; } }); }
    else { if (camIn || s.faces.length < 4) continue; m = beamMesh(s, WHITE); }
    root.add(tag(m, label)); }
  return { camera_inside: camIn, solids: vols.length };
}

// the convex solid between two polygons `from` and `to` (same number of corners, same order), e.g. a tube's louvred
// wedge (source rectangle -> footprint) or an area source's frustum (screen -> far rectangle)
export function prismSolid({ from, to, clip = [], sink = 0 }) {
  const A = from.map((p) => V(p)), B = to.map((p) => V(p)), n = A.length;
  let faces = [A.slice(), B.slice()]; for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push([A[i], A[j], B[j], B[i]]); }
  const caps = {}; faces = clipFaces(faces, clip, sink, caps);
  const c = (P) => P.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / P.length);
  return { faces, caps, aperture: A, dir: c(B).sub(c(A)).normalize(), src: null };
}

// An open-legged table (or desk) top stops light that comes from above: `make(extraClip)` builds the solid with extra
// clip planes; this returns it in pieces: everything above the top, and below the top only what lies outside the top's
// rectangle { x0, x1, z0, z1, y }. (Exact for light travelling straight down; a small error for slanted light.)
export function splitAtTop(make, { x0, x1, z0, z1, y }) {
  const below = { n: [0, 1, 0], d: y }, inX = [{ n: [-1, 0, 0], d: -x0 }, { n: [1, 0, 0], d: x1 }];
  return [make([{ n: [0, -1, 0], d: -y }]), make([below, { n: [1, 0, 0], d: x0 }]), make([below, { n: [-1, 0, 0], d: -x1 }]),
    make([below, ...inX, { n: [0, 0, 1], d: z0 }]), make([below, ...inX, { n: [0, 0, -1], d: -z1 }])].filter((s) => s.faces.length >= 4);
}
