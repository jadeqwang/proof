// Canonical glasses, one frame per character (2026-11-27). Replaces the two flattened torus rings of engine/body.js.
//
// Why: the guides' glasses were placeholders (rings in the mannequin path, NOTHING in the rigged-mesh path), so painters
// invented a frame per shot (a browline / half-rim in mv10 V3_rev_temple_b, where the brow mesh read as a thick bar).
// Each frame below is read off its cast heads sheet (layout/CAST.md "Glasses" has the table and the sheet crops).
//
// Built parametrically at real size (mm), in the body's REST space (glTF y up, +z = the face's forward, +x = her left),
// fitted to that body's own face mesh, then carried by the head bone (humanMesh.dressFigure bakes it with the head):
//   - lenses centred on the eyes horizontally (frame PD = lens width + bridge), the lens TOP a set height above the eye
//     centre, so the top rim sits just under the brow (as on the sheets);
//   - the lens plane at the cornea + a real vertex distance (12 mm), then pushed forward until every rim point is >= 5 mm
//     in front of the face and brows under it (the rim reads apart from the brow in profile and three-quarter close-ups);
//     8 deg pantoscopic tilt (bottom toward the cheeks) and 6 deg face-form wrap;
//   - nose pads resting 0.8 mm off the sides of the nose bridge, on pad arms from the inner rim;
//   - end pieces and a hinge block at the outer rim; temple arms run back along the side of the head 2.5 mm off the skin,
//     over the top of the ear, and bend down behind it (under long hair they are hidden, as in life);
//   - clear lenses: glass look in lit only (a faint 6 % tint); no lens in any other mode, so the eyes always show.
// Every frame piece shares one id group (`<uid>glasses`): line / contour modes outline the frame as one object, apart from
// the face and brows. Frame colours go in flatCol / formTint, so flat, label and form show the metal's own value.
import * as THREE from 'three';
import { mk } from './core.js';

// ---------------------------------------------------------------- the canonical frames (mm, degrees)
// Measured 2026-11-27 off each heads sheet's FRONT head (pupil distance = 61 mm sets the scale; Jade: "match each frame's
// SHAPE to the painted reference images, not the captions"), the 3/4 and profile heads checked on the contact sheets.
// Sizes are the rim's CENTRE line (the sheet's outer-edge measures minus one rim thickness).
// shape: 'rrect' (a rounded rectangle: rt / rb = top / bottom corner radius mm; slant = mm the outer top corner sits
// higher than the inner; nasalCut = how far the nasal edge slants outward toward the bottom, fraction of the half-width),
// 'oval' (superellipse, n = squareness). w, h: lens; dbl: between the lenses; rim: rim tube radius; topY: lens top
// (centre line) above the eye centre; bridge: { v: height on the lens as a fraction of the half-height, arch: mm up at
// the middle }; browBar: the aviator's straight bar over the nose (mm above the top rim at a third of the way in);
// hingeV: where the end piece leaves the outer rim (fraction of the half-height); semi: semi-rimless (rim over the top
// only, the lens's thin edge below).
export const FRAMES = {
  // sheet front: lens 47 x 25 mm outer, bridge 20 mm, lens top 4.6 mm above the pupil, tight top corners, rounder bottom
  // outer corner, a straight bridge bar at mid-height of the lens top half, rim ~1.8 mm
  jade27: { name: 'thin full-rim rectangular dark gunmetal metal', sheet: 'cast/jade_27/jade27_H_heads_v1.jpg',
    shape: 'rrect', w: 45.3, h: 23.5, rt: 3, rb: 5, slant: 0.8, dbl: 21.7, rim: 0.85, temple: 0.8, topY: 4.2, bridge: { v: 0.5, arch: -0.3 }, hingeV: 0.75,
    col: 0x4a4d55, grey: 0.26 },
  // sheet front: lens 47.5 x 25 mm outer, bridge 20 mm, lens top 4.8 mm above the pupil; rounder corners all round (the
  // soft rounded rectangle), the bridge a little higher with a slight arch
  jade19: { name: 'thin full-rim soft rounded-rectangle dark gunmetal wire', sheet: 'cast/jade_19/jade19_H_heads_v1.jpg',
    shape: 'rrect', w: 45.8, h: 23.3, rt: 5, rb: 7.5, slant: 0.8, dbl: 21.7, rim: 0.8, temple: 0.8, topY: 4.4, bridge: { v: 0.6, arch: 0.8 }, hingeV: 0.7,
    col: 0x4f5259, grey: 0.28 },
  // sheet front: lens 45 x 28 mm outer (a soft wide oval, flattish top and bottom), bridge 20 mm arched up, lens top 7.4 mm
  // above the pupil, rim ~1.4 mm, pale silver
  mama: { name: 'thin round-oval pale silver wire', sheet: 'cast/mama/mama_R_rest_heads_v1.jpg',
    shape: 'oval', n: 2.6, w: 43.6, h: 26.4, dbl: 21.1, rim: 0.7, temple: 0.75, topY: 5.4, bridge: { v: 0.45, arch: 2.5 }, hingeV: 0.25,
    col: 0xbab6ad, grey: 0.72 },
  // sheet front: lens 56 x 42 mm outer, bridge 16 mm, lens top 13 mm above the pupil (just under the brows), the bottom
  // 29 mm below it on the cheekbones; flat top, near-vertical outer side, a broad round bottom deepest just nasal of
  // centre, the nasal edge slanting out as it drops; a straight brow bar soldered across the top rims; rim ~1.4 mm gold
  dad90: { name: 'thin gold wire double-bridge teardrop aviator', sheet: 'cast/dad/dad_H_heads_v5_likeness.jpg',
    shape: 'rrect', w: 54.6, h: 40.6, rt: 6, rb: 17, slant: 0, nasalCut: 0.2, drop: 0.08, dbl: 17.4, rim: 0.7, temple: 0.75, topY: 12.3, bridge: { v: 0.4, arch: 3.0 }, browBar: 1.2, hingeV: 0.8,
    col: 0xc9a24e, grey: 0.62 },
  // his current photo (look-only): a narrow rimless-bottom rectangle, ~55 x 22 mm, the grey metal rim over the top only,
  // its outer end turning down into the hinge; the lens's lower edge rising toward the nose; grey titanium colour
  dad23: { name: 'thin narrow rectangular semi-rimless grey metal (rim over the top only)', sheet: 'inputs/family_photos (look-only photo; no sheet)',
    shape: 'rrect', w: 54, h: 22, rt: 2, rb: 7, slant: 1.0, nasalCut: 0.12, dbl: 19, rim: 0.85, temple: 0.9, topY: 7, bridge: { v: 0.75, arch: 0.3 }, hingeV: 0.75, semi: true,
    col: 0x67686d, grey: 0.38, bevel: 0xa0a6ac },
};
const TILT = 8, WRAP = 6, VERTEX = 12, CLEAR = 5;   // pantoscopic tilt, face-form wrap (deg); vertex distance, face clearance (mm)
const LENS = { glass: true, only: ['lit'], col: 0x30363c, opacity: 0.08, noCast: true, noRecv: true };   // lit only: a solid in form read as grey-blue lenses; unlit glass must be dark: a pale tint glowed as grey discs on faces in dark shots (kitchen90 K6)

const zup = (a) => new THREE.Vector3(a[0], a[2], -a[1]);
const rad = (d) => d * Math.PI / 180;

// the lens outline in its own plane: u outward (temporal), v up, mm; N points counter-clockwise from the temporal side
function outline(F, N = 96) {
  const a = F.w / 2, b = F.h / 2, pts = [];
  // a rounded box with its own top / bottom corner radii (signed distance), cut along rays from the centre
  const sd = (u, v) => { const r = Math.min(v > 0 ? F.rt : F.rb, a, b), qx = Math.abs(u) - (a - r), qy = Math.abs(v) - (b - r);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r; };
  for (let i = 0; i < N; i++) { const t = (i / N) * 2 * Math.PI, c = Math.cos(t), s = Math.sin(t);
    let u, v;
    if (F.shape === 'oval') { u = a * Math.sign(c) * Math.abs(c) ** (2 / F.n); v = b * Math.sign(s) * Math.abs(s) ** (2 / F.n); }
    else { let lo = 0, hi = Math.hypot(a, b) * 1.1; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (sd(m * c, m * s) < 0) lo = m; else hi = m; } u = lo * c; v = lo * s; }
    if (F.slant && v > 0) v += F.slant * (u / a) * (v / b) * 0.5;                       // the outer top corner a little higher
    if (F.nasalCut && u < 0 && v < 0) u *= 1 - F.nasalCut * (-v / b) ** 2;               // the nasal edge slants out going down
    if (F.drop && v < 0) v *= 1 + F.drop * Math.max(0, -u / a);                           // the bottom deepest toward the nose (teardrop)
    pts.push([u, v]); }
  return pts;
}
// the inner (nasal) / outer (temporal) rim u at height v
function rimU(F, pts, v, side) { let best = null, bd = 1e9; for (const [u, vv] of pts) if (Math.sign(u) === side && Math.abs(vv - v) < bd) { bd = Math.abs(vv - v); best = u; } return best; }

// per body: a face height field (max z over 2 mm bins of |x|, y) of the body + brows, the cornea, the eye, the ears
function faceOf(B, k) {
  const key = 'k' + k.toFixed(4); (B._glassFace ||= {}); if (B._glassFace[key]) return B._glassFace[key];
  const e = zup(B.meta.landmarks_blender_zup.eye_l).multiplyScalar(k), bin = 0.002, field = new Map(), side = new Map();
  const add = (pos) => { for (let i = 0; i < pos.length; i += 3) { const x = pos[i] * k, y = pos[i + 1] * k, z = pos[i + 2] * k;
    if (Math.abs(y - e.y) > 0.08 || z < e.z - 0.16) continue;
    const kf = Math.round(Math.abs(x) / bin) + ',' + Math.round(y / bin); if (z > e.z - 0.03 && z > (field.get(kf) ?? -1e9)) field.set(kf, z);
    const ks = Math.round(y / bin) + ',' + Math.round(z / bin); if (Math.abs(x) > (side.get(ks) ?? 0)) side.set(ks, Math.abs(x)); } };
  add(B.meshes.body.pos); if (B.meshes.brows) add(B.meshes.brows.pos);
  let cornea = e.z + 0.016; if (B.meshes.eyes) { cornea = -1e9; const p = B.meshes.eyes.pos; for (let i = 0; i < p.length; i += 3) cornea = Math.max(cornea, p[i + 2] * k); }
  // ears: body vertices standing out past the skull (|x| > 0.076 m for a 61 mm eye spacing), beside / behind the eyes
  const sc = Math.abs(e.x) / 0.0305, ear = { top: -1e9, front: -1e9, back: 1e9 }; const p = B.meshes.body.pos;
  for (let i = 0; i < p.length; i += 3) { const x = Math.abs(p[i] * k), y = p[i + 1] * k, z = p[i + 2] * k;
    if (x > 0.076 * sc && Math.abs(y - e.y) < 0.07 && z < e.z - 0.03 && z > e.z - 0.14) { ear.top = Math.max(ear.top, y); ear.front = Math.max(ear.front, z); ear.back = Math.min(ear.back, z); } }
  if (ear.top < -1e8) ear.top = e.y + 0.006 * sc, ear.front = e.z - 0.06 * sc, ear.back = e.z - 0.086 * sc;
  // a sane ear (a body whose hair or skull stands out past the threshold would put it on the crown): the top 0 .. 10 mm
  // above the eye centre, the front 50 .. 70 mm and the back 75 .. 100 mm behind it
  ear.top = THREE.MathUtils.clamp(ear.top, e.y, e.y + 0.01 * sc); ear.front = THREE.MathUtils.clamp(ear.front, e.z - 0.07 * sc, e.z - 0.05 * sc); ear.back = THREE.MathUtils.clamp(ear.back, e.z - 0.1 * sc, e.z - 0.075 * sc);
  const faceZ = (x, y, r = 1) => { let m = -1e9; const ix = Math.round(Math.abs(x) / bin), iy = Math.round(y / bin);
    for (let a = -r; a <= r; a++) for (let c = -r; c <= r; c++) { const v = field.get((ix + a) + ',' + (iy + c)); if (v != null && v > m) m = v; } return m; };
  // the head's half-width at (y, z): the widest vertex in a window that grows (+-4 .. 10 mm high, +-6 .. 12 mm deep: the temple mesh is coarse) until it holds any; yFloor: only
  // vertices at or above that height (over the ear: the skull above it, not the ear itself)
  const halfW = (y, z, yFloor = -1e9) => { const iy = Math.round(y / bin), iz = Math.round(z / bin), fl = Math.round(yFloor / bin);
    for (let r = 2; r <= 5; r++) { let m = 0; for (let a = -r; a <= r; a++) { if (iy + a < fl) continue; for (let c = -r - 1; c <= r + 1; c++) m = Math.max(m, side.get((iy + a) + ',' + (iz + c)) ?? 0); } if (m > 0) return m; }
    return 0; };
  return (B._glassFace[key] = { e, cornea, ear, faceZ, halfW });
}

// Build the frame for frame id `fid` on body B (scale k), as meshes in REST space x k (metres); `Mw` (Matrix4) carries
// rest-x-k positions onto the posed head (the head bone's transform). Returns { group, report }.
export function buildGlasses(fid, B, k, Mw, uid) {
  const F = FRAMES[fid]; if (!F) throw new Error(`glasses: no frame "${fid}" (engine/glasses.js FRAMES)`);
  const mm = 0.001, { e, cornea, ear, faceZ, halfW } = faceOf(B, k), O = outline(F);
  const a = F.w / 2, b = F.h / 2, cx = F.dbl / 2 + a, cy = F.topY - b;   // lens centre (mm, from the nose midline / eye centre height)
  const tilt = Math.tan(rad(TILT)), wrap = Math.tan(rad(WRAP));
  let zp = cornea + VERTEX * mm;
  const at = (s, u, v, zoff = 0) => { const X = s * (cx + u) * mm, Y = e.y + (cy + v) * mm;
    return new THREE.Vector3(X, Y, zp + zoff - Math.max(0, Math.abs(X) - F.dbl / 2 * mm) * wrap + (Y - (e.y + cy * mm)) * tilt); };
  // push the plane forward until the rim and the lens clear the face: CLEAR mm at and above the eye centre (the brows:
  // the rim must read apart from them), 2 mm below it (the lens's nasal-lower corner sits close beside the nose, as in life)
  let need = 0; const probe = [...O, ...O.map(([u, v]) => [u * 0.5, v * 0.5]), [0, 0]];
  let worst = null; for (const [u, v] of probe) { const P = at(1, u, v), f = faceZ(P.x, P.y, 1), d = f + (P.y >= e.y ? CLEAR : 2) * mm - P.z; if (d > need) { need = d; worst = [u, v]; } }
  zp += need;
  const L = { grey: F.grey, col: F.col, flatCol: F.col, noCast: true, formTint: (() => { const c = new THREE.Color(F.col); return [c.r, c.g, c.b]; })() };
  const group = new THREE.Group(); group.name = 'glasses';
  const add = (geo, look, id) => { if (!geo.getAttribute('normal')) geo.computeVertexNormals(); geo.applyMatrix4(Mw); geo.computeBoundingSphere(); geo.computeBoundingBox();
    const m = mk(geo, look); m.userData.idGroup = uid + id; m.userData.double = true; m.userData.glasses = fid; group.add(m); return m; };
  const tube = (pts, r, closed = false, look = L, id = 'glasses') => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', 0.5), Math.max(8, pts.length * (closed ? 1 : 6)), r * mm, 8, closed), look, id);
  const rep = { frame: fid, name: F.name, lens_mm: [F.w, F.h], bridge_mm: F.dbl, rim_mm: 2 * F.rim, total_width_mm: 0, plane_ahead_of_cornea_mm: +((zp - cornea) / mm).toFixed(1), pushed_by_lens_uv_mm: worst && worst.map((x) => +x.toFixed(1)) };
  for (const s of [1, -1]) {
    const rimPts = O.map(([u, v]) => at(s, u, v));
    if (F.semi) {   // the rim over the top and down the sides to mid-height; the lens's thin polished edge all round (seen below)
      const top = [], bot = []; O.forEach(([u, v], i) => (v > -0.15 * b ? top : bot).push(i));
      const run = (idx) => { const st = idx.findIndex((i, j) => !idx.includes((i - 1 + O.length) % O.length)); return idx.slice(st).concat(idx.slice(0, st)).map((i) => rimPts[i]); };
      tube(run(top), F.rim); tube(rimPts, 0.35, true, { ...L, col: F.bevel, flatCol: F.bevel, grey: 0.55, formTint: (() => { const c = new THREE.Color(F.bevel); return [c.r, c.g, c.b]; })() });
    } else tube(rimPts, F.rim, true);
    // the lens: a fan inside the rim, 0.3 mm behind its centre line
    { const C = at(s, 0, 0, -0.3 * mm), P = [C, ...O.map(([u, v]) => at(s, u * 0.99, v * 0.99, -0.3 * mm))], pos = [], idx = [];
      for (const p of P) pos.push(p.x, p.y, p.z); for (let i = 1; i <= O.length; i++) idx.push(0, i, i === O.length ? 1 : i + 1);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); add(g, LENS, 'glassesLens'); }
    // nose pad on its pad arm: the pad 0.8 mm off the side of the nose, a little below the eye centre
    { const vIn = -0.1 * b, uIn = rimU(F, O, vIn, -1), R = at(s, uIn, vIn, -1.0 * mm);
      const px = 0.0075 * Math.abs(e.x) / 0.0305, py = e.y - 0.003, pz = faceZ(px, py, 0);
      const pad = new THREE.Vector3(s * (px + 0.0006), py, Math.min(pz + 0.0012, R.z - 0.003));
      const mid = new THREE.Vector3((pad.x + R.x) / 2 + s * 0.0005, (pad.y + R.y) / 2 + 0.001, (pad.z + R.z) / 2 + 0.002);
      tube([R, mid, pad], 0.45);
      const pg = new THREE.SphereGeometry(1, 12, 8); pg.scale(0.6 * mm, 3.6 * mm, 2.1 * mm);
      pg.applyMatrix4(new THREE.Matrix4().makeRotationY(s * rad(35))); pg.translate(pad.x, pad.y, pad.z); add(pg, { ...L, grey: 0.7, col: 0xc4c9cc, flatCol: 0xc4c9cc, formTint: [0.8, 0.82, 0.83] }, 'glasses'); }   // clear silicone pads: a light grey
    // end piece, hinge, temple arm
    const vH = F.hingeV * b, uO = rimU(F, O, vH, 1), R0 = at(s, uO, vH), H = R0.clone().add(new THREE.Vector3(s * 1.5 * mm, 0, -5 * mm));
    tube([R0, R0.clone().lerp(H, 0.5).add(new THREE.Vector3(s * 0.8 * mm, 0, 0)), H], F.rim * 1.1);
    { const hg = new THREE.BoxGeometry(2.2 * mm, 2.6 * mm, 4 * mm); hg.translate(H.x, H.y, H.z - 1.5 * mm); add(hg, L, 'glasses'); }
    const off = 2.5 * mm, clamp = (y, z, x0, skull) => Math.max(x0, halfW(y, z, skull ? ear.top + 0.003 : -1e9) + off);
    // the arm: straight back from the hinge, rising evenly to just over the ear's top, then down behind the ear; its
    // distance from the midline never shrinks before the ear (no wiggle on the coarse temple mesh)
    const yE = ear.top + 0.004, zF = ear.front + 0.004, zM = (ear.front + ear.back) / 2, zB = ear.back - 0.004;
    const arm = [H.clone().add(new THREE.Vector3(0, 0, -3 * mm))];
    for (const t of [0.2, 0.4, 0.6, 0.8]) arm.push(new THREE.Vector3(0, H.y + (yE - H.y) * t * 0.85, H.z - 3 * mm + (zF - H.z + 3 * mm) * t));
    arm.push(new THREE.Vector3(0, yE, zF), new THREE.Vector3(0, yE + 0.0005, zM), new THREE.Vector3(0, yE - 0.003, zB),
      new THREE.Vector3(0, yE - 0.018, zB - 0.007), new THREE.Vector3(0, yE - 0.034, zB - 0.012));
    let run = Math.abs(H.x);
    for (let i = 1; i < arm.length; i++) { const p = arm[i], skull = i === 5 || i === 6; let x = clamp(p.y, p.z, 0, skull);
      if (i <= 6) { x = Math.max(x, run); run = x; } p.x = s * x; }
    tube(arm, F.temple);
    rep.total_width_mm = +(2 * Math.abs(H.x) / mm + 2.6).toFixed(0);
    rep.temple_length_mm = +arm.reduce((acc, p, i) => acc + (i ? p.distanceTo(arm[i - 1]) : 0), 0) / mm | 0;
  }
  // bridge(s)
  { const v = F.bridge.v * b, uI = rimU(F, O, v, -1), A = at(1, uI, v), Bp = at(-1, uI, v), M = A.clone().lerp(Bp, 0.5).add(new THREE.Vector3(0, F.bridge.arch * mm, 1.0 * mm));
    tube([A, A.clone().lerp(M, 0.5).add(new THREE.Vector3(0, F.bridge.arch * 0.4 * mm, 0)), M, Bp.clone().lerp(M, 0.5).add(new THREE.Vector3(0, F.bridge.arch * 0.4 * mm, 0)), Bp], F.rim); }
  if (F.browBar) {   // the aviator's brow bar: straight across the bridge, soldered onto both top rims a third of the way in
    const uB = -a * 0.35; let vt = -1e9; for (const [u, v] of O) if (v > 0 && Math.abs(u - uB) < a * 0.08) vt = Math.max(vt, v);
    const A = at(1, uB, vt + F.rim * 0.6), Bp = at(-1, uB, vt + F.rim * 0.6), M = A.clone().lerp(Bp, 0.5).add(new THREE.Vector3(0, 0, 1.0 * mm));
    tube([A, A.clone().lerp(M, 0.5), M, Bp.clone().lerp(M, 0.5), Bp], F.rim); }
  // clearance report: the rim's nearest approach to the face / brows in front (mm)
  let minC = 1e9; for (const [u, v] of O) { const P = at(1, u, v), f = faceZ(P.x, P.y, 1); if (f > -1e8) minC = Math.min(minC, (P.z - f) / mm); }
  rep.rim_clear_of_face_mm = +minC.toFixed(1);
  return { group, report: rep };
}
