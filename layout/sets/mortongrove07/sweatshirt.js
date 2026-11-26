// The IAS hoodie as simulated cloth (round 3, Jade: "Frame it so Truth falls in the folds -- because the sweatshirt is a
// soft material, it can move as she's holding it and turning it."). The cloth is a Jolt Physics soft body
// (sweatshirt_jolt.js); pattern, pleat and choreography are sweatshirt_sim.js; this file
// turns a simulated state into meshes in the engine's look system (every mode works: line, flat, depth, label, lit,
// form, contour, light), and optionally a textured print for the standalone test renders.
//
//   import { sweatshirt } from './sweatshirt.js';
//   root.add(sweatshirt({ state, anchors: GARMENT, t: shot.clothT, colliders: lapColliders(HER, SHIRT.f) }));
//
// state 'unfolding' (t defaults to 0) / 'turned' (t defaults to 1) / anything in between with an explicit t. 'folded'
// returns null (the folded stack stays the set's own prop). Deterministic: the same anchors and t give the same cloth.
// The returned group carries userData.cloth = { t, hands: { L, R, holdL, holdR }, seal: { centre, truth, beauty }, ... }
// so a shot can aim at the seal or put the hands where the cloth is held.
//
// THE SEAL. In the engine's modes the print is a plain blue filled disc (the painter paints a plain disc; the real seal
// is composited at comp time, see HANDOFF). With opts.printMap (a THREE.Texture of work/ias/ias_print_tex.png, built by
// sweatshirt_print.py; gitignored because it shows Truth legibly) the disc carries the real print: label mode shows it,
// and the `printMaterial` is used by the standalone renders (sweatshirt_test.mjs). Never commit a render in which Truth
// can be read.
import * as THREE from 'three';
import { mk, tag } from '../../engine/core.js';
import initJolt from '../../vendor/jolt-physics/jolt-physics.wasm-compat.js';
import { simulate } from './sweatshirt_jolt.js';
import { faces, BODY, PRINT, TRUTH, PLEAT, SLEEVE, HOOD, STRING, THICK, makePattern, colOf } from './sweatshirt_sim.js';

export const LOOKS = {
  fleece: { grey: 0.95, col: 0xf4f2ec, recvShadowLine: true },
  inside: { grey: 0.9, col: 0xe6e3dc, recvShadowLine: true },
  rib: { grey: 0.9, col: 0xe8e6e0, recvShadowLine: true },
  print: { grey: 0.38, col: 0x2f62a8 },
  string: { grey: 0.85, col: 0xdedcd6 },
};

const cache = new Map();
let PATTERN = null;
const Jolt = await initJolt();   // Jolt Physics (WASM), once per page

// rough colliders for her seated lap and shins (capsules), from where she sits and the way she faces; pass to sweatshirt()
export function lapColliders(her, f, { hipY = 0.53, thigh = 0.42 } = {}) {
  const lat = [-f[2], 0, f[0]], P = (b, ...ks) => ks.reduce((s, [v, k]) => s.map((c, i) => c + v[i] * k), b), out = [];
  for (const s of [-1, 1]) { const hip = P([her.at[0], hipY, her.at[1]], [lat, s * 0.09]), knee = P(hip, [f, thigh]);
    out.push({ type: 'capsule', a: hip, b: knee, r: 0.075 }, { type: 'capsule', a: knee, b: P(knee, [[0, 1, 0], -0.45], [f, 0.05]), r: 0.05 }); }
  out.push({ type: 'plane', y: 0 });
  // not a collider: her chest, where her posed hands' palms face from (build.js: graspArms toward [her x, 1.0, her z]);
  // the sim builds her hands round the grips from it (sweatshirt_jolt.js HAND)
  out.push({ type: 'chest', at: [her.at[0], 1.0, her.at[1]] });
  return out;
}

// run (or fetch from the cache) the simulation for anchors + t
export function clothState({ anchors, t, colliders = [], sim = {} }) {
  const key = JSON.stringify([anchors.unfolding, anchors.turned, t, colliders, sim]);
  if (cache.has(key)) return cache.get(key);
  PATTERN = PATTERN || makePattern();
  const s = simulate(Jolt, t, { start: anchors.unfolding, end: anchors.turned, colliders, pattern: PATTERN, ...sim });
  cache.set(key, s); return s;
}

export function sweatshirt({ state = 'unfolding', anchors, t, colliders = [], sim = {}, printMap = null, labels = true } = {}) {
  if (state === 'folded') return null;
  const tt = t ?? (state === 'turned' ? 1 : 0);
  const s = clothState({ anchors, t: tt, colliders, sim });
  const g = clothMeshes(s, { printMap, labels });
  g.userData.cloth.state = state;
  return g;
}

// ------------------------------------------------------------------------------------------------ meshes
export function clothMeshes(s, { printMap = null, labels = true, smooth: smoothIters = 2 } = {}) {
  const { pat } = s, x = smoothSurface(pat, s.x, s.held, smoothIters), { F, B, N } = faces(pat, x);
  const g = new THREE.Group(); g.name = 'IAS hoodie (cloth)';
  const L = (m, name) => (labels ? tag(m, name, true) : m);
  const isRib = (i) => { const p = pat.P[i]; return (p.piece === 'body' && p.u[1] < BODY.rib) || p.cuff; };
  // triangles by part
  const parts = { body: [], bodyRib: [], sleeve: [], cuff: [], hood: [] };
  for (const [a, b, c, piece] of pat.tris) {
    if (piece === 'body') ((isRib(a) && isRib(b) && isRib(c)) ? parts.bodyRib : parts.body).push([a, b, c]);
    else if (piece === 'hood') parts.hood.push([a, b, c]);
    else ((isRib(a) && isRib(b) && isRib(c)) ? parts.cuff : parts.sleeve).push([a, b, c]); }
  const sheet = (S, tris) => { const pos = new Float32Array(tris.length * 9); let k = 0;
    for (const tr of tris) for (const v of tr) { pos[k++] = S[3 * v]; pos[k++] = S[3 * v + 1]; pos[k++] = S[3 * v + 2]; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.computeVertexNormals(); return geo; };
  // smooth shading: indexed geometry over all particles
  const smooth = (S, tris, flip = false) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(S), 3));
    const idx = []; for (const [a, b, c] of tris) flip ? idx.push(a, c, b) : idx.push(a, b, c); geo.setIndex(idx);
    const nrm = new Float32Array(N.length); for (let i = 0; i < N.length; i++) nrm[i] = flip ? -N[i] : N[i]; geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); return geo; };
  void sheet;
  const add = (geo, look, name) => { const m = mk(geo, look); m.userData.cloth = true; g.add(L(m, name)); return m; };
  add(smooth(F, parts.body), LOOKS.fleece, 'IAS hoodie (white fleece): front');
  add(smooth(B, parts.body, true), LOOKS.fleece, 'IAS hoodie: back');
  add(smooth(F, parts.bodyRib), LOOKS.rib, 'hoodie waistband (ribbed)'); add(smooth(B, parts.bodyRib, true), LOOKS.rib, 'hoodie waistband (ribbed)');
  add(smooth(F, parts.sleeve), LOOKS.fleece, 'hoodie sleeve'); add(smooth(B, parts.sleeve, true), LOOKS.fleece, 'hoodie sleeve');
  add(smooth(F, parts.cuff), LOOKS.rib, 'hoodie cuff (ribbed)'); add(smooth(B, parts.cuff, true), LOOKS.rib, 'hoodie cuff (ribbed)');
  add(smooth(F, parts.hood), LOOKS.fleece, 'hoodie hood'); add(smooth(B, parts.hood, true), LOOKS.inside, 'hoodie hood');
  // the rim: the cloth's thickness along every open edge (side seams below the sleeves, hem, cuffs, hood edges)
  { const cnt = new Map(), key = (a, b) => (a < b ? a + ',' + b : b + ',' + a);
    for (const [a, b, c, piece] of pat.tris) if (piece !== 'string') for (const [p, q] of [[a, b], [b, c], [c, a]]) { const k = key(p, q); cnt.set(k, (cnt.get(k) || 0) + 1); }
    const pos = [];
    for (const [k, n] of cnt) { if (n !== 1) continue; const [a, b] = k.split(',').map(Number);
      for (const v of [[F, a], [F, b], [B, b], [F, a], [B, b], [B, a]]) pos.push(v[0][3 * v[1]], v[0][3 * v[1] + 1], v[0][3 * v[1] + 2]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    add(geo, LOOKS.fleece, 'IAS hoodie (white fleece): edges'); }
  // the print and the pocket: fine grids in pattern space, laid onto the cloth by bilinear interpolation of the front face
  const onFront = (u, v, lift) => bodyPoint(pat, F, N, u, v, lift);
  { const n = 64, R = PRINT.R, pos = [], uv = [], idx = [], id = [];
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const a = i / n, b = j / n, u = PRINT.c[0] + (2 * a - 1) * R, v = PRINT.c[1] + (2 * b - 1) * R;
      const inside = (2 * a - 1) ** 2 + (2 * b - 1) ** 2 <= 1.0001 + 2 / n; const p = inside ? onFront(u, v, 0.0012) : null;
      id.push(p ? pos.length / 3 : -1); if (p) { pos.push(...p); uv.push(a, b); } }
    const at = (i, j) => id[j * (n + 1) + i];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const q = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]; if (q.some((k) => k < 0)) continue;
      // keep only cells whose centre is inside the disc (the outline is then cut by the alpha of the texture)
      const cu = (i + 0.5) / n * 2 - 1, cv = (j + 0.5) / n * 2 - 1; if (cu * cu + cv * cv > 1) continue;
      idx.push(q[0], q[1], q[2], q[0], q[2], q[3]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const m = add(geo, printMap ? { ...LOOKS.print, map: printMap } : LOOKS.print, 'IAS seal (blue filled-disc print; Truth in the pleat)');
    m.userData.print = true;
    if (printMap) m.userData.printMaterial = new THREE.MeshLambertMaterial({ map: printMap, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }); }
  { // kangaroo pocket: a trapezoid patch over the lower front, curved hand openings at its sides
    const y0 = BODY.rib + 0.01, y1 = 0.30, wb = 0.36, wt = 0.27, n = 24, pos = [], idx = [];
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const b = j / n, y = y0 + (y1 - y0) * b, half = wt / 2 + (wb - wt) / 2 * (1 - b);
      // the hand openings: the patch's side edges slant in toward the top over its upper 70%
      const open = b > 0.3 ? (b - 0.3) / 0.7 * 0.05 : 0, x = (i / n * 2 - 1) * (half - open);
      pos.push(...onFront(x, y, 0.0025)); }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i; idx.push(a, a + 1, a + n + 2, a, a + n + 2, a + n + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, LOOKS.fleece, 'hoodie kangaroo pocket'); }
  // drawstrings: tubes along the chains
  for (const sd of [-1, 1]) { if (pat.str[sd].length < 2) continue; const pts = pat.str[sd].map((k) => new THREE.Vector3(x[3 * k], x[3 * k + 1], x[3 * k + 2]));
    const curve = new THREE.CatmullRomCurve3(pts); const geo = new THREE.TubeGeometry(curve, 40, 0.0035, 6, false);
    add(geo, LOOKS.string, 'hoodie drawstring'); }
  // where things are, for shots and sidecars
  const c = onFront(PRINT.c[0], PRINT.c[1], 0), tr = onFront((TRUTH.x0 + TRUTH.x1) / 2, (TRUTH.y0 + TRUTH.y1) / 2, 0), be = onFront(PRINT.c[0] + 0.5 * PRINT.R, PRINT.c[1], 0);
  const c1 = onFront(PRINT.c[0], PRINT.c[1], 0.1), nrm = [0, 1, 2].map((k) => (c1[k] - c[k]) / 0.1);
  g.userData.cloth = { t: s.t, hands: s.hands, held: s.held.map((k) => [x[3 * k], x[3 * k + 1], x[3 * k + 2]]),
    seal: { centre: c, normal: nrm, truth: tr, beauty: be, r: PRINT.R }, pleat: { m1: PLEAT.m1, m3: PLEAT.m3 },
    note: 'Truth (pattern x ' + TRUTH.x0.toFixed(3) + '..' + TRUTH.x1.toFixed(3) + ' m from the seal centre) lies inside a pressed knife pleat, folded under between cloth layers' };
  return g;
}

// display smoothing: a light Laplacian pass over the simulated surface (each vertex toward the mean of its mesh
// neighbours, held vertices fixed) to take out the solver's one-cell crinkles so the fleece reads as thick cloth.
// The Truth check renders this smoothed surface, so it checks what is shown.
export function smoothSurface(pat, x0, held = [], iters = 2, lam = 0.45) {
  const n = pat.P.length, nb = Array.from({ length: n }, () => new Set()), fixed = new Set(held);
  for (const [a, b, c] of pat.tris) { nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  let x = Float64Array.from(x0);
  for (let it = 0; it < iters; it++) { const y = Float64Array.from(x);
    for (let i = 0; i < n; i++) { if (fixed.has(i) || !nb[i].size) continue; const m = [0, 0, 0];
      for (const j of nb[i]) for (let k = 0; k < 3; k++) m[k] += x[3 * j + k] / nb[i].size;
      for (let k = 0; k < 3; k++) y[3 * i + k] = x[3 * i + k] + lam * (m[k] - x[3 * i + k]); }
    x = y; }
  return x;
}

// a point on the front face at pattern (u, v), lifted along the normal (bilinear on the body grid)
export function bodyPoint(pat, F, N, u, v, lift = 0) {
  const B0 = BODY, dx = B0.w / (B0.nx - 1), dy = B0.h / (B0.ny - 1);
  const fi = colOf(u), fj = Math.min(Math.max(v / dy, 0), B0.ny - 1.0001), i = Math.floor(fi), j = Math.floor(fj), a = fi - i, b = fj - j;
  const ids = [pat.bid[j][i], pat.bid[j][i + 1], pat.bid[j + 1][i + 1], pat.bid[j + 1][i]];
  const wts = [(1 - a) * (1 - b), a * (1 - b), a * b, (1 - a) * b], p = [0, 0, 0], nn = [0, 0, 0]; let ws = 0;
  ids.forEach((k, q) => { if (k < 0) return; ws += wts[q]; for (let c = 0; c < 3; c++) { p[c] += F[3 * k + c] * wts[q]; nn[c] += N[3 * k + c] * wts[q]; } });
  const l = Math.hypot(...nn) || 1; return [0, 1, 2].map((c) => p[c] / ws + nn[c] / l * lift);
}
export { THICK, SLEEVE, HOOD, STRING };

// THE FOLDED STACK'S SEAL (MG1, MG1_end): the same pressed knife pleat as the cloth, so Truth's strip is folded under from
// the first frame. In the seal's own plane (x right as one faces the print, y up, z out of the cloth): Beauty's side
// (x >= PLEAT.m3) on top, its folded edge a soft roll beside the joined hands; the wearer's-right part of the disc
// (x <= PLEAT.m1) shifted 2 x depth toward it, one layer lower; Truth's strip [m1, m3] not drawn (under the fold).
// `cut` (m below the centre, or null) = the folded-up waistband's edge, as in build.js sealGroup.
export function foldedSeal(R, cut, { seal = 0x2f62a8, cloth = 0xf4f2ec } = {}) {
  const g = new THREE.Group(), k = R / PRINT.R, m1 = PLEAT.m1 * k, m3 = PLEAT.m3 * k, d = PLEAT.d * k;
  const BLUE = { grey: 0.38, col: seal }, REV = { grey: 0.95, col: cloth }, SL = 'IAS seal (blue filled-disc print; Truth folded under in the pleat)';
  const clip = (poly, f) => { const out = []; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a); if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } } return out; };
  const circle = Array.from({ length: 72 }, (_, i) => [R * Math.cos((i / 72) * Math.PI * 2), R * Math.sin((i / 72) * Math.PI * 2)]);
  const below = (p) => (cut == null ? 1 : p[1] + cut);
  const piece = (poly, dx, z, look, label) => { if (poly.length < 3) return; const sh = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x + dx, y)));
    const m = mk(new THREE.ShapeGeometry(sh), look); m.position.z = z; m.userData.double = true; g.add(tag(m, label, true)); };
  piece(clip(clip(circle, (p) => p[0] - m3), below), 0, 0.0016, BLUE, SL);              // Beauty's side, on top
  piece(clip(clip(circle, (p) => m1 - p[0]), below), 2 * d, 0, BLUE, SL);               // the wearer's-right side, under
  { const top = Math.sqrt(Math.max(0, R * R - m3 * m3)), y0 = cut == null ? -top : Math.max(-top, -cut);   // the fold's roll
    const m = mk(new THREE.PlaneGeometry(0.007 * k, top - y0), BLUE); m.position.set(m3 + 0.0035 * k, (top + y0) / 2, 0.0024); m.userData.double = true;
    g.add(tag(m, 'seal: the pleat\'s fold (Truth folded under)', true)); }
  { const x = R * 0.22, y0 = Math.max(-R * 0.595, cut == null ? -1 : -cut), y1 = R * 0.355;   // Beauty only (placeholder figure)
    if (y1 > y0) { const m = mk(new THREE.PlaneGeometry(R * 0.2, y1 - y0), REV); m.position.set(x, (y0 + y1) / 2, 0.003); m.userData.double = true; g.add(tag(m, 'seal: BEAUTY (right)', true)); }
    const h = mk(new THREE.CircleGeometry(R * 0.09, 16), REV); h.position.set(x, R * 0.45, 0.003); h.userData.double = true; g.add(tag(h, 'seal: BEAUTY (right)', true)); }
  return g;
}
