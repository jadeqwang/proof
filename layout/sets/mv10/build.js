// Build one mv10 shot: 345B (living room, kitchen and dining, the core, the roof), the yard, the neighbours, figures,
// and the light rig for the shot's section (the real sun for SCENE, ceiling fixtures, fire poi). Everything from layout.js.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, tag, V, rad, slab } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, polyMesh, applyBeamMask } from '../_beam.js';
import { CAST } from '../_cast.js';
import { HOUSE, GRADE, LIVING, KITCHEN, PARTITION, OPENING, CORE_WALLS, OPENINGS, apertureOf, NEIGHBOURS, SHELF, SHELF_AT, SHELF_W, shelfWorld, EXPEDIT2, PRINTER,
  COUCH, NOGUCHI, GLASS_TABLE, COUNTERS, COUNTER_H, SINK, STOVE, DINING, CEILING_LIGHTS, PATIO, STAIRS, STRAWBERRY, MINT, HOSE, CLOTHESLINE, FENCES, LAWN,
  TREE, GRAPEFRUIT, DRINKS, POI, poiCentre, PATH, MARKS, CROSSING, SCENE, SUN, SUN_EVENTS, SECTION_KEY, SECTION_LIGHT, LIGHTS, FOOTPRINTS, sunlit, apertureLit, sunFootprints } from './layout.js';

// ---------------------------------------------------------------- cast (set-local, additive: engine/mannequin.js is not edited)
// Guests are costume and posture only: their eyes, nose and mouth are removed after the figure is built.
const GUEST = (name, h, top, legs, hairStyle, sleeves = 'long', extra = {}) => ({ name, h, kind: 'adult', skin: 0xd9b499, hair: 0x2a211c, top, legs, hairStyle, sleeves, guest: true, ...extra });
const NEW_CAST = {
  A1: GUEST('guest A1 (face undrawn)', 1.78, 0x7a8a5a, 0x3a3a44, 'short'), A2: GUEST('guest A2 (face undrawn)', 1.62, 0xc9b25a, 0x5a4a3a, 'bob', 'short'),
  A3: GUEST('guest A3 (face undrawn)', 1.86, 0x8a3a3a, 0x30343c, 'short'), S1: GUEST('guest S1, on the couch (face undrawn)', 1.68, 0x5a7a9a, 0x2c2c34, 'bun'),
  B1: GUEST('guest B1 (face undrawn)', 1.74, 0x9a9a9a, 0x44403a, 'short', 'short'), B2: GUEST('guest B2 (face undrawn)', 1.6, 0x6a4a7a, 0x2c3140, 'long'),
  E1: GUEST('guest E1 (face undrawn)', 1.82, 0x3a5a4a, 0x4a4438, 'short'),
  C1: GUEST('guest C1 (face undrawn)', 1.7, 0xb07a4a, 0x3a3a44, 'bob'), C2: GUEST('guest C2 (face undrawn)', 1.84, 0x4a6a8a, 0x5a5a50, 'short', 'short'),
  C3: GUEST('guest C3 (face undrawn)', 1.58, 0xd8c8b0, 0x3a2c2c, 'long', 'short', { dress: true }),
  W1: GUEST('guest W1 (face undrawn)', 1.76, 0x6a6a3a, 0x2c2c34, 'short'), W2: GUEST('guest W2 (face undrawn)', 1.64, 0x9a4a5a, 0x34343c, 'bun', 'short'),
  T1: GUEST('guest T1, at the lemonade (face undrawn)', 1.72, 0x5a8a8a, 0x44403a, 'bob'),
  H1: GUEST('guest H1, the hug (face undrawn)', 1.7, 0x7a5a8a, 0x30343c, 'long'), G1: GUEST('guest G1, the greeting (face undrawn)', 1.8, 0xb8b06a, 0x3a3a44, 'short', 'short'),
  poi: GUEST('poi spinner (face undrawn)', 1.75, 0x2a2a2e, 0x2a2a2e, 'bun', 'short'),
};
for (const [k, v] of Object.entries(NEW_CAST)) if (!CAST[k]) CAST[k] = v;
// first love at the housewarming (Jade, 2026-11-25): forearm hair clearly visible, so his sleeves are rolled up here
// (set-local copy; _cast.js keeps 'long'), and Naot cork sandals (Birkenstock type), modelled below as plain sandals.
if (CAST.firstLove27) CAST.firstLove27 = { ...CAST.firstLove27, sleeves: 'short' };
const FIRST_LOVE_COSTUME = { sandals: 'Birkenstock-type cork sandals made by Naot (Jade); modelled as plain cork-soled sandals with two straps', forearms: 'forearm hair clearly visible (Jade): sleeves rolled up; draw the hair in the arm-tap shots (BR1, BR2, C2a, C2b)', height_m: CAST.firstLove27?.h };
function sandals(fig) {
  const g = new THREE.Group(), P = fig.userData.P, CORK = { grey: 0.62, col: 0xb08a5a }, STRAP = { grey: 0.25, col: 0x3a2a1e };
  for (const n of ['L', 'R']) { const h = P['heel' + n], t = P['toe' + n]; if (!h || !t) continue; const a = h.clone(), b = t.clone(); a.y -= 0.004; b.y -= 0.004;
    const d = b.clone().sub(a), side = V(-d.z, 0, d.x).normalize();
    g.add(tag(slab(a.clone().addScaledVector(d, -0.03), b.clone().addScaledVector(d, 0.05), 0.1, 0.028, side, CORK), 'sandal (cork sole, Naot)'));
    for (const k of [0.42, 0.68]) { const c = a.clone().addScaledVector(d, k); const t2 = mk(new THREE.TorusGeometry(0.047, 0.009, 6, 16, Math.PI), STRAP);
      t2.position.copy(c).add(V(0, 0.012, 0)); t2.lookAt(c.clone().add(d)); g.add(tag(t2, 'sandal (strap)')); } }
  return g;
}

const PLASTER = { grey: 0.82, col: 0xcfc6b4 }, STUCCO = { grey: 0.72, col: 0xb8b0a0 }, FLOORW = { grey: 0.6, col: 0x8a6a48 }, TILE = { grey: 0.75, col: 0xbab4a8 };
const WOOD = { grey: 0.5, col: 0x8a6440 }, FENCE = { grey: 0.42, col: 0x7a5238 }, DARK = { grey: 0.12, col: 0x161616 }, GLASS = { glass: true, col: 0x9ab0c0, opacity: 0.14, noCast: true };
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// ---------------------------------------------------------------- walls
// an axis-aligned wall with rectangular holes, one extruded shape (line mode draws no seams).
//   axis 'X': runs along X at fixed Z = at;  axis 'Z': runs along Z at fixed X = at.  s0..s1 along it, y0..y1 high.
//   holes: [{ s0, s1, y0, y1 }] in the same s / y.
function wallSeg({ axis, at, s0, s1, t, y0, y1, holes = [], look, label }) {
  const sh = new THREE.Shape(); sh.moveTo(s0, y0); sh.lineTo(s1, y0); sh.lineTo(s1, y1); sh.lineTo(s0, y1); sh.lineTo(s0, y0);
  for (const o of holes) { const a = Math.max(o.s0, s0 + 1e-3), b = Math.min(o.s1, s1 - 1e-3), ya = Math.max(o.y0, y0) + 1e-3, yb = Math.min(o.y1, y1 - 1e-3); if (b <= a) continue;
    const p = new THREE.Path(); p.moveTo(a, ya); p.lineTo(a, yb); p.lineTo(b, yb); p.lineTo(b, ya); p.lineTo(a, ya); sh.holes.push(p); }
  const m = mk(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), look); m.matrixAutoUpdate = false;
  if (axis === 'X') m.matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, at - t / 2, 0, 0, 0, 1);       // shape (sx, sy, sz) -> (sx, sy, at - t/2 + sz)
  else m.matrix.set(0, 0, -1, at + t / 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);                  // shape (sx, sy, sz) -> (at + t/2 - sz, sy, sx)
  return tag(m, label);
}
const wallOf = { WNW: { axis: 'X', at: HOUSE.wallT / 2 }, ESE: { axis: 'X', at: HOUSE.Z - HOUSE.wallT / 2 }, SSW: { axis: 'Z', at: HOUSE.wallT / 2 }, NNE: { axis: 'Z', at: HOUSE.X - HOUSE.wallT / 2 } };

// ---------------------------------------------------------------- the house
function house(shot) {
  const g = new THREE.Group(), H = HOUSE, T = H.wallT, panes = {};
  // floors: oak in the living room, tile in the kitchen, oak elsewhere; ceiling (hidden in the plan view)
  g.add(tag(box(LIVING.x1 - LIVING.x0, 0.04, LIVING.z1 - LIVING.z0 + 0.15, FLOORW, [(LIVING.x0 + LIVING.x1) / 2, -0.02, (LIVING.z0 + LIVING.z1) / 2 + 0.075]), 'living room floor (oak)'));
  g.add(tag(box(KITCHEN.x1 - KITCHEN.x0, 0.04, KITCHEN.z1 - KITCHEN.z0, TILE, [(KITCHEN.x0 + KITCHEN.x1) / 2, -0.02, (KITCHEN.z0 + KITCHEN.z1) / 2]), 'kitchen floor (tile)'));
  g.add(tag(box(H.X - 4.89 - T, 0.04, H.Z - 2 * T, FLOORW, [(4.89 + H.X - T) / 2, -0.02, H.Z / 2]), 'floor (core, tea room, bedroom)'));
  g.add(tag(box(H.X, 0.06, H.Z, { ...PLASTER, noCast: true }, [H.X / 2, H.ceil + 0.03, H.Z / 2]), 'ceiling'));
  // crawl-space skirt below the floor, then the four exterior walls with their openings (from grade to the plate)
  for (const [w, o] of Object.entries(wallOf)) {
    const len = o.axis === 'X' ? H.X : H.Z, holes = OPENINGS.filter((q) => q.wall === w).map((q) => ({ s0: q.s0, s1: q.s1, y0: q.y0, y1: q.y1 }));
    g.add(wallSeg({ ...o, s0: 0, s1: len, t: T, y0: GRADE, y1: H.plate, holes, look: STUCCO, label: `exterior wall (${w})` })); }
  // gable ends above the plate (NNE and SSW), the two roof planes with eaves and rakes
  { const sh = new THREE.Shape(); sh.moveTo(0, H.plate); sh.lineTo(H.Z, H.plate); sh.lineTo(H.ridgeZ, H.ridgeY); sh.lineTo(0, H.plate);
    for (const at of [T / 2, H.X - T / 2]) { const m = mk(new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false }), STUCCO); m.matrixAutoUpdate = false;
      m.matrix.set(0, 0, -1, at + T / 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1); g.add(tag(m, 'gable end')); }
    const ROOF = { grey: 0.38, col: 0x5a5a5e }, w = H.X + 2 * H.rake, xc = H.X / 2, ye = H.plate - H.roofSlope * H.eave;
    g.add(tag(slab(V(xc, ye, -H.eave), V(xc, H.ridgeY + 0.02, H.ridgeZ), w, 0.1, V(1, 0, 0), ROOF), 'roof'));
    g.add(tag(slab(V(xc, ye, H.Z + H.eave), V(xc, H.ridgeY + 0.02, H.ridgeZ), w, 0.1, V(1, 0, 0), ROOF), 'roof')); }
  // the partition (Jade's "wall") and the core walls
  g.add(wallSeg({ axis: 'X', at: (PARTITION.z0 + PARTITION.z1) / 2, s0: PARTITION.x0, s1: PARTITION.x1 + 0.06, t: PARTITION.z1 - PARTITION.z0, y0: 0, y1: H.ceil, look: PLASTER, label: 'partition wall (living room | kitchen)' }));
  for (const w of CORE_WALLS) { const alongZ = w.a[0] === w.b[0], s0 = alongZ ? w.a[1] : w.a[0], s1 = alongZ ? w.b[1] : w.b[0];
    g.add(wallSeg({ axis: alongZ ? 'Z' : 'X', at: alongZ ? w.a[0] : w.a[1], s0: Math.min(s0, s1), s1: Math.max(s0, s1), t: H.intT, y0: 0, y1: H.ceil,
      holes: (w.doors || []).map(([d0, d1]) => ({ s0: Math.min(s0, s1) + d0, s1: Math.min(s0, s1) + d1, y0: 0, y1: 2.03 })), look: PLASTER, label: w.name })); }
  // glass in every window; the front door leaf (open 30 deg in); the French doors (both leaves open in, 90 deg)
  for (const o of OPENINGS) { const A = apertureOf(o), inset = T / 2, n = o.wall === 'WNW' ? [0, 0, 1] : o.wall === 'ESE' ? [0, 0, -1] : o.wall === 'SSW' ? [1, 0, 0] : [-1, 0, 0];
    const C = A.map((p) => V(p[0] + n[0] * inset, p[1], p[2] + n[2] * inset)); const inside = [C[1], C[0], C[3], C[2]];   // TL, TR, BR, BL from inside
    const key = o.name.replace(/[^a-z0-9]+/gi, '_').replace(/_$/, '').toLowerCase();
    panes[key] = inside;
    if (o.kind === 'window') { g.add(tag(quad(inside, GLASS), o.name + ' (glass)'));
      const F = { grey: 0.85, col: 0xe8e4da }, mid = C[0].clone().add(C[1]).multiplyScalar(0.5), sill = C[3].clone().add(C[2]).multiplyScalar(0.5);
      const along = o.wall === 'WNW' || o.wall === 'ESE' ? [o.s1 - o.s0, 0.05, T + 0.02] : [T + 0.02, 0.05, o.s1 - o.s0];
      g.add(tag(box(...along, F, [sill.x, o.y0 + 0.025, sill.z]), o.name + ' (sill)'));
      g.add(tag(box(...(o.wall === 'WNW' || o.wall === 'ESE' ? [0.04, o.y1 - o.y0, T + 0.02] : [T + 0.02, o.y1 - o.y0, 0.04]), F, [mid.x, (o.y0 + o.y1) / 2, mid.z]), o.name + ' (mullion)')); } }
  { const o = OPENINGS.find((q) => q.name === 'front door'), w = o.s1 - o.s0, hg = new THREE.Group(); hg.position.set(o.s1 - 0.02, 0, T + 0.025); hg.rotation.y = rad(o.leaf.openDeg);
    hg.add(tag(box(w - 0.02, o.y1 - 0.01, 0.045, { grey: 0.55, col: 0x6a4a36 }, [-(w - 0.02) / 2, (o.y1 - 0.01) / 2, 0]), 'front door (leaf, open)')); g.add(hg);
    // front steps down to grade (OURS: the floor is 0.6 m up)
    for (let k = 1; k <= 3; k++) g.add(tag(box(1.5, 0.04 + (3 - k + 1) * 0.15 - 0.15, 0.3, { grey: 0.7, col: 0x9a968c }, [(o.s0 + o.s1) / 2, GRADE + ((3 - k + 1) * 0.15 - 0.15 + 0.04) / 2, -0.3 * k + 0.15]), 'front steps')); }
  { const o = OPENINGS.find((q) => q.kind === 'french'), lw = (o.s1 - o.s0) / 2, z = H.Z - T - 0.02, FR = { grey: 0.88, col: 0xeeeae2 };
    [[o.s0, 1], [o.s1, -1]].forEach(([hx, s], i) => { const hg = new THREE.Group(); hg.position.set(hx, 0, z); hg.rotation.y = rad(-s * o.leaves.openDeg);
      const lab = `French door (leaf ${i + 1}, open)`, add = (m) => hg.add(tag(m, lab));
      add(box(lw, 0.06, 0.04, FR, [s * lw / 2, o.y1 - 0.03, 0])); add(box(lw, 0.12, 0.04, FR, [s * lw / 2, 0.06, 0]));
      add(box(0.05, o.y1, 0.04, FR, [s * 0.025, o.y1 / 2, 0])); add(box(0.05, o.y1, 0.04, FR, [s * (lw - 0.025), o.y1 / 2, 0]));
      for (const y of [0.62, 1.12, 1.56]) add(box(lw - 0.08, 0.025, 0.03, FR, [s * lw / 2, y, 0]));
      const gl = quad([V(s * 0.05, o.y1 - 0.06, 0), V(s * (lw - 0.05), o.y1 - 0.06, 0), V(s * (lw - 0.05), 0.12, 0), V(s * 0.05, 0.12, 0)], GLASS); hg.add(tag(gl, 'French door glass')); g.add(hg); }); }
  return { g, panes };
}

// ---------------------------------------------------------------- the Expedit 5x5 (layout.js SHELF): contents unchanged since the first build
const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
const BOOK_COLS = { art: [0xd8d0c0, 0xc8553a, 0xe0c060, 0x2a2a30, 0xe8e2d2, 0x7a9a5a, 0xb0a890], lit: [0x3a6a8a, 0xd8c8a8, 0x8a4a7a, 0xc8553a, 0x4a5a3a, 0xe0d8c8, 0x2a3a5a],
  sf: [0xe0b030, 0x3a7ad0, 0xd0503a, 0x40a080, 0xb060c0, 0x1a1a22, 0xe07a20], sci: [0x22304a, 0xe8e4da, 0x1f3a2a, 0x4a3a22, 0x5a1f1f, 0x3a5a8a, 0xd0c060] };
function bookLook(b) {
  if (/Feynman Lectures/.test(b.t)) return { grey: 0.36, col: 0x9a2a22 };
  const fam = /sf /.test(b.kind) ? 'sf' : /art|sketch/.test(b.kind) ? 'art' : /literature/.test(b.kind) ? 'lit' : 'sci', P = BOOK_COLS[fam], r = hash(b.t);
  return { grey: +(0.25 + 0.65 * hash(b.t + '#')).toFixed(3), col: P[Math.floor(r * P.length)] };
}
const bookLabel = (b, half) => (/Feynman Lectures/.test(b.t) ? 'The Feynman Lectures on Physics I-III (a matched set)' : /sf /.test(b.kind) ? 'science-fiction paperbacks (shelved with truth)'
  : /textbook/.test(b.kind) ? 'textbooks (truth)' : half === 'truth' ? 'popular science (truth)' : /art|sketch/.test(b.kind) ? 'art books (beauty)' : 'literature (beauty)');
const SHELF_WARN = [];
function placeBooks(g, list, cu, start, dir, limit, half) {
  const zs = SHELF.spineZ; let x = start, runH = 0; const run0 = start;
  for (const b of list.filter((b) => (b.lay || 'stand') === 'stand')) {
    if ((limit - (x + dir * b.w)) * dir < -1e-4 || b.h > SHELF.cube - 0.003) { SHELF_WARN.push(`${cu.key}: no room for "${b.t}"`); continue; }
    const m = box(b.w - 0.0012, b.h, b.d, bookLook(b), [x + dir * b.w / 2, cu.y0 + b.h / 2, zs - b.d / 2]); m.userData.book = b.t;
    g.add(tag(m, bookLabel(b, half))); x += dir * b.w; runH = Math.max(runH, b.h); }
  const flat = list.filter((b) => b.lay === 'flat').sort((p, q) => q.h - p.h); if (!flat.length) return;
  const pw = flat[0].h; let px, yy;
  if ((limit - x) * dir >= pw + 0.006) { px = x + dir * (pw / 2 + 0.006); yy = cu.y0; } else { px = run0 + dir * pw / 2; yy = cu.y0 + runH; }
  for (const b of flat) { if (yy + b.w > cu.y1 - 0.002) { SHELF_WARN.push(`${cu.key}: no headroom for "${b.t}" lying flat`); break; }
    const m = box(b.h - 0.002, b.w - 0.0012, b.d, bookLook(b), [px + dir * (hash(b.t) - 0.5) * 0.006, yy + b.w / 2, zs - b.d / 2]); m.userData.book = b.t;
    g.add(tag(m, bookLabel(b, half))); yy += b.w; }
}
function shelfObject(o) {
  const g = new THREE.Group(), A = (m) => g.add(m);
  const WAX = { grey: 0.93, col: 0xf2ead8 }, WICK = { grey: 0.15, col: 0x222222, noCast: true };
  switch (o.k.split(' ')[0]) {
    case 'candle': { const h = o.h || 0.12; A(cyl(0.035, 0.035, h, WAX, [0, h / 2, 0])); A(cyl(0.0025, 0.0025, 0.012, WICK, [0, h + 0.006, 0], null, 6)); break; }
    case 'ceramic': { const W = { grey: 0.96, col: 0xf6f6f2 };
      A(ball(0.055, W, [0, 0.07, 0], [1.55, 0.85, 0.8])); A(ball(0.034, W, [0.095, 0.088, 0])); A(ball(0.018, W, [0.126, 0.08, 0], [1.3, 0.8, 0.9]));
      for (const z of [-0.02, 0.02]) A(ball(0.01, W, [0.088, 0.118, z]));
      for (const [lx, lz] of [[-0.055, -0.028], [-0.055, 0.028], [0.05, -0.028], [0.05, 0.028]]) A(cyl(0.017, 0.017, 0.04, W, [lx, 0.02, lz], null, 10)); break; }
    case 'Tux': { const K = { grey: 0.1, col: 0x161616 }, Wh = { grey: 0.95, col: 0xf4f4f0 }, Y = { grey: 0.8, col: 0xf0b020 };
      A(ball(0.05, K, [0, 0.065, 0], [1, 1.3, 0.85])); A(ball(0.043, Wh, [0, 0.06, 0.018], [0.85, 1.15, 0.6])); A(ball(0.036, K, [0, 0.14, 0]));
      A(cyl(0, 0.013, 0.03, Y, [0, 0.135, 0.042], [90, 0, 0], 10)); for (const x of [-0.022, 0.022]) A(ball(0.018, Y, [x, 0.008, 0.02], [1, 0.45, 1.5])); break; }
    case 'BSD': { const R = { grey: 0.35, col: 0xc8202a }, Wh = { grey: 0.95, col: 0xf0f0f0 }, G = { grey: 0.7, col: 0xc0a040 };
      A(cyl(0.028, 0.034, 0.075, R, [0, 0.05, 0])); A(ball(0.034, R, [0, 0.115, 0])); for (const x of [-0.02, 0.02]) A(cyl(0, 0.008, 0.032, R, [x * 1.2, 0.155, 0], [0, 0, -x * 900], 8));
      for (const x of [-0.016, 0.016]) A(ball(0.016, Wh, [x, 0.01, 0.01], [1, 0.6, 1.5])); A(cyl(0.003, 0.003, 0.17, G, [0.05, 0.085, 0.01], null, 6)); A(cyl(0.012, 0.012, 0.004, G, [0.05, 0.17, 0.01], [90, 0, 0], 10)); break; }
    case 'GNU': { const B = { grey: 0.4, col: 0x6a4a2a }, H = { grey: 0.85, col: 0xd8ccb0 };
      A(ball(0.045, B, [0, 0.075, 0], [1.4, 0.9, 0.8])); for (const [lx, lz] of [[-0.04, -0.022], [-0.04, 0.022], [0.04, -0.022], [0.04, 0.022]]) A(cyl(0.008, 0.008, 0.045, B, [lx, 0.022, lz], null, 8));
      A(ball(0.03, B, [-0.07, 0.11, 0], [1.2, 1, 0.9])); A(cyl(0, 0.012, 0.035, B, [-0.08, 0.075, 0], [180, 0, 0], 8));
      for (const z of [-0.022, 0.022]) { const t = mk(new THREE.TorusGeometry(0.02, 0.005, 6, 16, Math.PI * 1.2), H); t.position.set(-0.068, 0.14, z); t.rotation.set(0, 0, rad(-20)); A(t); } break; }
    case 'Firefox': { const Bl = { grey: 0.4, col: 0x2a4a9a }, O = { grey: 0.65, col: 0xe8701a };
      A(ball(0.045, Bl, [0, 0.05, 0])); const t = mk(new THREE.TorusGeometry(0.047, 0.016, 8, 24, Math.PI * 1.5), O); t.position.set(0, 0.05, 0.012); t.rotation.set(0, 0, rad(60)); A(t);
      A(ball(0.02, O, [-0.032, 0.09, 0.02], [1.1, 0.9, 1])); break; }
    case 'PostgreSQL': { const B = { grey: 0.5, col: 0x336791 };
      A(ball(0.05, B, [0, 0.07, 0], [1.3, 1, 0.9])); A(ball(0.036, B, [0.06, 0.1, 0])); A(cyl(0.01, 0.007, 0.07, B, [0.088, 0.065, 0], null, 8));
      for (const z of [-0.035, 0.035]) A(ball(0.025, B, [0.05, 0.105, z], [0.5, 1, 0.9]));
      for (const [lx, lz] of [[-0.035, -0.025], [-0.035, 0.025], [0.035, -0.025], [0.035, 0.025]]) A(cyl(0.013, 0.013, 0.035, B, [lx, 0.017, lz], null, 10)); break; }
  }
  return g;
}
// an Expedit carcass in its own frame (x across the face, centre 0; z 0 = back, + = front), open-backed
function expeditFrame(g, W, Hh, D, N, F, Tt, L, lab) {
  const add = (m) => g.add(tag(m, lab)), pitch = (W - 2 * F - (N - 1) * Tt) / N + Tt, zc = D / 2;
  add(box(W, F, D, L, [0, F / 2, zc])); add(box(W, F, D, L, [0, Hh - F / 2, zc]));
  for (const x of [-W / 2 + F / 2, W / 2 - F / 2]) add(box(F, Hh - 2 * F, D, L, [x, Hh / 2, zc]));
  for (let r = 1; r < N; r++) add(box(W - 2 * F, Tt, D, L, [0, F + r * pitch - Tt / 2, zc]));
  for (let c = 1; c < N; c++) add(box(Tt, Hh - 2 * F, D, L, [-W / 2 + F + c * pitch - Tt / 2, Hh / 2, zc]));
  return pitch;
}
function shelf() {
  const g = new THREE.Group(), S = SHELF, L = { grey: S.grey, col: S.col };
  expeditFrame(g, S.W, S.H, S.depth, S.N, S.F, S.T, L, 'IKEA Expedit 5x5 (espresso)');
  for (const cu of S.cubes) {
    if (cu.kind === 'books') { const B = cu.books, e = 0.003, mid = (cu.x0 + cu.x1) / 2;
      if (Array.isArray(B)) placeBooks(g, B, cu, cu.x0 + e, 1, cu.x1 - e, cu.half);
      else { placeBooks(g, B.left, cu, cu.x0 + e, 1, mid, 'beauty'); placeBooks(g, B.right, cu, cu.x1 - e, -1, mid, 'truth'); } }
    else for (const o of cu.objects || []) { const m = shelfObject(o); m.position.set(cu.x0 + o.u * S.C, cu.y0, 0.23); m.scale.setScalar(o.s || 1);
      g.add(tag(m, /candle/.test(o.k) ? 'candles (unlit)' : o.k)); } }
  g.position.set(SHELF_AT.X, 0, SHELF_AT.Zback); g.rotation.y = Math.PI;   // faces WNW (-Z): its left is NNE, its right SSW
  return g;
}
// the 2x2 at the partition's open end, facing SSW, with the printer on top (Jade)
function expedit2() {
  const g = new THREE.Group(), E = EXPEDIT2, L = { grey: 0.2, col: E.col };
  const pitch = expeditFrame(g, E.W, E.H, E.D, 2, E.F, E.T, L, 'IKEA Expedit 2x2 (espresso)'), C = pitch - E.T;
  const cubeAt = (c, r) => [-E.W / 2 + E.F + c * pitch + C / 2, E.F + r * pitch];
  { const [x, y] = cubeAt(0, 0); for (let k = 0; k < 4; k++) g.add(tag(box(0.3, 0.055, 0.215, { grey: 0.95, col: 0xf4f2ea }, [x, y + 0.028 + k * 0.056, 0.2]), 'reams of printer paper')); }
  { const [x, y] = cubeAt(1, 0); g.add(tag(box(0.3, 0.2, 0.3, { grey: 0.62, col: 0xb89a70 }, [x, y + 0.1, 0.2]), 'a box of cables')); }
  { const [x, y] = cubeAt(0, 1); [0x2a4a8a, 0x8a2a2a, 0x2a2a2a, 0xd0c040].forEach((c, k) => g.add(tag(box(0.065, 0.3, 0.27, { grey: 0.4, col: c }, [x - 0.12 + k * 0.07, y + 0.15, 0.24]), 'binders'))); }
  const P = PRINTER, pr = new THREE.Group(); pr.position.set(0, E.H, E.D / 2);
  pr.add(box(P.w, P.h, P.d, { grey: 0.18, col: P.col }, [0, P.h / 2, 0])); pr.add(box(P.w - 0.06, 0.012, 0.12, { grey: 0.3, col: 0x3a3a40 }, [0, P.h * 0.45, P.d / 2 + 0.05]));
  pr.add(box(P.w - 0.1, 0.004, P.d - 0.08, { grey: 0.55, col: 0x606068 }, [0, P.h + 0.002, -0.01])); pr.add(box(0.3, 0.1, 0.004, { grey: 0.95, col: 0xf4f2ea }, [0, P.h + 0.05, -P.d / 2 + 0.03], [-15, 0, 0]));
  g.add(tag(pr, 'printer (on the 2x2, Jade)'));
  g.position.set(E.X1, 0, E.Zc); g.rotation.y = -Math.PI / 2;   // back to the partition's end face, facing SSW (-X)
  return g;
}

// ---------------------------------------------------------------- furniture
function furniture(lt) {
  const g = new THREE.Group();
  { const C = COUCH, W = { grey: 0.94, col: C.col }, add = (m) => g.add(tag(m, 'modern white couch (sectional)')), addc = (m) => g.add(tag(m, 'chaise (of the couch)')), cx = (C.x0 + C.x1) / 2;
    add(box(C.x1 - C.x0, C.seatH - 0.08, C.z1 - C.z0 - C.backD, W, [cx, 0.08 + (C.seatH - 0.08) / 2, C.z0 + C.backD + (C.z1 - C.z0 - C.backD) / 2]));
    add(box(C.x1 - C.x0, C.backH - 0.08, C.backD, W, [cx, 0.08 + (C.backH - 0.08) / 2, C.z0 + C.backD / 2]));
    add(box(C.armW, 0.58 - 0.08, C.z1 - C.z0, W, [C.x1 - C.armW / 2, 0.08 + 0.25, (C.z0 + C.z1) / 2]));
    addc(box(C.chaise.x1 - C.chaise.x0, C.seatH - 0.08, C.chaise.z1 - C.z1, W, [(C.chaise.x0 + C.chaise.x1) / 2, 0.08 + (C.seatH - 0.08) / 2, (C.z1 + C.chaise.z1) / 2]));
    for (const [x, z] of [[C.x0 + 0.05, C.z0 + 0.05], [C.x1 - 0.05, C.z0 + 0.05], [C.x1 - 0.05, C.z1 - 0.05], [C.x0 + 0.05, C.chaise.z1 - 0.05], [C.chaise.x1 - 0.05, C.chaise.z1 - 0.05]]) add(box(0.04, 0.08, 0.04, DARK, [x, 0.04, z])); }
  // Noguchi: rounded-triangle glass top (hull of three circles), two curved black supports crossing under it
  { const N = NOGUCHI, [cx, cz] = N.at, pts = [], rc = 0.17, V3 = [[-N.W / 2 + rc, -N.D / 2 + rc], [N.W / 2 - rc, -N.D / 2 + rc], [0.08, N.D / 2 - rc]];
    for (const [vx, vz] of V3) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; pts.push([vx + rc * Math.cos(a), vz + rc * Math.sin(a)]); }
    const hullPts = (() => { const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
      for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      return lo.slice(0, -1).concat(up.slice(0, -1)); })();
    const sh = new THREE.Shape(); hullPts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));   // shape y = -local z
    const top = mk(new THREE.ExtrudeGeometry(sh, { depth: N.glass, bevelEnabled: false }), { glass: true, col: 0x9ac0b8, opacity: 0.35, grey: 0.8 });
    top.rotation.x = -Math.PI / 2; top.position.set(cx, N.h - N.glass, cz); g.add(tag(top, 'Noguchi coffee table (glass top)'));
    const arch = new THREE.Shape(); arch.moveTo(-0.4, 0); arch.quadraticCurveTo(0, 0.76, 0.4, 0); arch.lineTo(0.3, 0); arch.quadraticCurveTo(0, 0.5, -0.3, 0); arch.lineTo(-0.4, 0);
    [[25, 0.12], [-35, -0.12]].forEach(([yaw, off]) => { const m = mk(new THREE.ExtrudeGeometry(arch, { depth: 0.045, bevelEnabled: false }), { grey: 0.1, col: 0x141210 });
      m.geometry.translate(0, 0, -0.0225); m.position.set(cx + off * 0.5, 0, cz + off * 0.3); m.rotation.y = rad(yaw); g.add(tag(m, 'Noguchi coffee table (curved black wood base)')); }); }
  { const G = GLASS_TABLE, [x, z] = G.at, CH = { grey: 0.7, col: 0xb8b8bc };
    g.add(tag(cyl(G.r, G.r, 0.012, { glass: true, col: 0x9ac0b8, opacity: 0.35, grey: 0.8 }, [x, G.h - 0.006, z], null, 40), 'round glass-top table'));
    g.add(tag(cyl(0.035, 0.035, G.h - 0.012, CH, [x, (G.h - 0.012) / 2, z], null, 12), 'round glass-top table')); g.add(tag(cyl(0.28, 0.3, 0.02, CH, [x, 0.01, z], null, 24), 'round glass-top table')); }
  // kitchen: counters (base cabinets + top), the sink, the stove
  for (const c of COUNTERS) { const cx = (c.x0 + c.x1) / 2, cz = (c.z0 + c.z1) / 2;
    g.add(tag(box(c.x1 - c.x0 - 0.04, COUNTER_H - 0.1 - 0.035, c.z1 - c.z0 - 0.04, { grey: 0.78, col: 0xd8d2c4 }, [cx, 0.1 + (COUNTER_H - 0.135) / 2, cz]), 'kitchen counters (base cabinets)'));
    g.add(tag(box(c.x1 - c.x0, 0.035, c.z1 - c.z0, { grey: 0.55, col: 0x8a8478 }, [cx, COUNTER_H - 0.0175, cz]), 'kitchen counters (top)'));
    g.add(tag(box(c.x1 - c.x0 - 0.1, 0.1, c.z1 - c.z0 - 0.1, DARK, [cx, 0.05, cz]), 'kitchen counters (toe kick)')); }
  g.add(tag(box(SINK.x1 - SINK.x0, 0.01, 0.42, { grey: 0.3, col: 0x6a6a70 }, [(SINK.x0 + SINK.x1) / 2, COUNTER_H + 0.002, SINK.z]), 'sink'));
  g.add(tag(cyl(0.012, 0.012, 0.3, { grey: 0.7, col: 0xb8b8bc }, [(SINK.x0 + SINK.x1) / 2, COUNTER_H + 0.15, SINK.z + 0.24], null, 10), 'sink (tap)'));
  { const S = STOVE; g.add(tag(box(0.6, 0.012, S.z1 - S.z0, DARK, [S.x, COUNTER_H + 0.006, (S.z0 + S.z1) / 2]), 'stove'));
    for (const [dx, dz] of [[-0.14, -0.18], [0.14, -0.18], [-0.14, 0.18], [0.14, 0.18]]) g.add(tag(cyl(0.09, 0.09, 0.01, { grey: 0.25, col: 0x3a3a3a }, [S.x + dx, COUNTER_H + 0.017, (S.z0 + S.z1) / 2 + dz], null, 20), 'stove')); }
  // the pale IKEA dining table, the pale benches tucked in
  { const D = DINING, P = { grey: 0.88, col: D.col }, cx = (D.x0 + D.x1) / 2, cz = (D.z0 + D.z1) / 2;
    g.add(tag(box(D.x1 - D.x0, 0.035, D.z1 - D.z0, P, [cx, D.h - 0.0175, cz]), 'pale IKEA dining table'));
    for (const x of [D.x0 + 0.06, D.x1 - 0.06]) for (const z of [D.z0 + 0.06, D.z1 - 0.06]) g.add(tag(box(0.05, D.h - 0.035, 0.05, P, [x, (D.h - 0.035) / 2, z]), 'pale IKEA dining table'));
    for (const b of D.benches) { const bx = (b.x0 + b.x1) / 2, bz = (b.z0 + b.z1) / 2;
      g.add(tag(box(b.x1 - b.x0, 0.035, b.z1 - b.z0, P, [bx, D.benchH - 0.0175, bz]), 'pale bench (tucked in)'));
      for (const x of [b.x0 + 0.05, b.x1 - 0.05]) g.add(tag(box(0.04, D.benchH - 0.035, b.z1 - b.z0 - 0.04, P, [x, (D.benchH - 0.035) / 2, bz]), 'pale bench (tucked in)')); } }
  // ceiling fixtures (glow only when on)
  for (const c of CEILING_LIGHTS) { const on = !!lt.ceiling, look = on ? { grey: 0.97, col: 0xfff0d8, emit: 0xffd6a0, emitI: 1.2, flatEmit: 0.97 } : { grey: 0.9, col: 0xeae6dc, noCast: true };
    if (c.pendant) { g.add(tag(cyl(c.r, c.r, 0.22, look, c.at, null, 28), c.name)); g.add(tag(cyl(0.004, 0.004, HOUSE.ceil - c.at[1] - 0.11, { grey: 0.2, col: 0x222222, noCast: true }, [c.at[0], (HOUSE.ceil + c.at[1] + 0.11) / 2, c.at[2]], null, 5), c.name)); }
    else g.add(tag(ball(c.r, look, [c.at[0], HOUSE.ceil, c.at[2]], [1, 0.42, 1]), c.name)); }
  return g;
}

// ---------------------------------------------------------------- the yard and the neighbours
function yard(shot, lt) {
  const g = new THREE.Group(), R = rng(11);
  g.add(tag(box(90, 0.04, 90, { grey: 0.55, col: 0x6a6a58 }, [6, GRADE - 0.045, 9]), 'ground (beyond the yard)'));
  { const L = LAWN; g.add(tag(box(L.x1 - L.x0, 0.04, L.z1 - L.z0, { grey: 0.5, col: 0x4a6a3a }, [(L.x0 + L.x1) / 2, GRADE - 0.02, (L.z0 + L.z1) / 2]), 'grass yard')); }
  g.add(tag(box(6.2, 0.04, 9.2, { grey: 0.72, col: 0x9a968c }, [2.2, GRADE - 0.018, -4.6]), 'driveway end (parking)'));
  // neighbours: prisms (shape in (X, -Z), extruded up)
  for (const b of NEIGHBOURS) { if (!b.build) continue; const sh = new THREE.Shape(); b.poly.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    const m = mk(new THREE.ExtrudeGeometry(sh, { depth: b.top - GRADE, bevelEnabled: false }), b.id === 22547 ? WOOD : { grey: 0.62, col: 0xa8a49a }); m.matrixAutoUpdate = false;
    m.matrix.set(1, 0, 0, 0, 0, 0, 1, GRADE, 0, -1, 0, 0, 0, 0, 0, 1); g.add(tag(m, b.name)); }
  // the deck ("patio") at floor level, its skirt, the landing and the stairs down to the lawn
  { const P = PATIO, DK = { grey: 0.55, col: 0x9a7a54 };
    const deck = (x0, x1, z0, z1, lab) => { g.add(tag(box(x1 - x0, 0.04, z1 - z0, DK, [(x0 + x1) / 2, P.top - 0.02, (z0 + z1) / 2]), lab));
      g.add(tag(box(x1 - x0 - 0.06, P.top - 0.04 - GRADE, z1 - z0 - 0.06, { grey: 0.35, col: 0x5a4a38 }, [(x0 + x1) / 2, (P.top - 0.04 + GRADE) / 2, (z0 + z1) / 2]), lab + ' (skirt)')); };
    deck(P.x0, P.x1, P.z0, P.z1, 'patio (deck)'); deck(STAIRS.x0, STAIRS.x1, STAIRS.landing.z0, STAIRS.landing.z1, 'stairs (landing)');
    const rise = (P.top - GRADE) / STAIRS.risers, run = 0.4;
    for (let k = 1; k < STAIRS.risers; k++) { const top = P.top - k * rise, z0 = STAIRS.z0 + (k - 1) * run;
      g.add(tag(box(STAIRS.x1 - STAIRS.x0, top - GRADE, run, DK, [(STAIRS.x0 + STAIRS.x1) / 2, (top + GRADE) / 2, z0 + run / 2]), 'stairs')); } }
  // strawberry bed (raised timber), mint barrel, hose, clothesline, fences
  { const S = STRAWBERRY, B = { grey: 0.45, col: 0x7a5a3a }, cx = (S.x0 + S.x1) / 2, cz = (S.z0 + S.z1) / 2, y = GRADE + S.h / 2;
    for (const z of [S.z0, S.z1]) g.add(tag(box(S.x1 - S.x0, S.h, 0.05, B, [cx, y, z]), 'strawberry bed'));
    for (const x of [S.x0, S.x1]) g.add(tag(box(0.05, S.h, S.z1 - S.z0, B, [x, y, cz]), 'strawberry bed'));
    g.add(tag(box(S.x1 - S.x0 - 0.06, 0.02, S.z1 - S.z0 - 0.06, { grey: 0.3, col: 0x4a3a2a }, [cx, GRADE + S.h - 0.04, cz]), 'strawberry bed'));
    for (let k = 0; k < 34; k++) { const x = S.x0 + 0.15 + R() * (S.x1 - S.x0 - 0.3), z = S.z0 + 0.15 + R() * (S.z1 - S.z0 - 0.3), fl = k % 5 === 0;
      g.add(tag(ball(fl ? 0.05 : 0.09, fl ? { grey: 0.85, col: [0xe060a0, 0xf0d040, 0xf4f0f0][k % 3] } : { grey: 0.45, col: 0x3a6a2a }, [x, GRADE + S.h + (fl ? 0.12 : 0.02), z], [1, 0.6, 1]), fl ? 'flowers' : 'strawberry plants')); } }
  { const M = MINT, [x, z] = M.at; g.add(tag(cyl(M.r, M.r * 0.9, M.h, { grey: 0.45, col: 0x7a5236 }, [x, GRADE + M.h / 2, z], null, 28), 'barrel of mint'));
    for (const y of [0.1, 0.35]) g.add(tag(cyl(M.r + 0.008, M.r + 0.008, 0.025, { grey: 0.25, col: 0x3a3a3a }, [x, GRADE + y, z], null, 28), 'barrel of mint'));
    g.add(tag(ball(M.r * 1.05, { grey: 0.5, col: 0x4a8a3a }, [x, GRADE + M.h + 0.05, z], [1, 0.5, 1]), 'mint')); }
  { const [x, z] = HOSE.at, HL = { grey: 0.45, col: 0x2a7a3a };
    for (const r of [HOSE.r, HOSE.r * 0.8, HOSE.r * 0.62]) { const t = mk(new THREE.TorusGeometry(r, 0.012, 6, 40), HL); t.rotation.x = Math.PI / 2; t.position.set(x, GRADE + 0.015, z); g.add(tag(t, 'garden hose')); } }
  { const C = CLOTHESLINE, P = { grey: 0.55, col: 0x8a8a8a };
    g.add(tag(cyl(0.004, 0.004, C.z1 - C.z0, { grey: 0.9, col: 0xe8e8e8, noCast: true }, [C.x, C.y, (C.z0 + C.z1) / 2], [90, 0, 0], 5), 'clothesline'));
    g.add(tag(cyl(0.03, 0.03, C.y + 0.1 - GRADE, P, [C.x, (C.y + 0.1 + GRADE) / 2, C.z1], null, 10), 'clothesline (T-post)'));
    g.add(tag(box(0.9, 0.04, 0.04, P, [C.x, C.y + 0.08, C.z1]), 'clothesline (T-post)'));
    g.add(tag(box(0.06, 0.06, 0.12, P, [C.x, C.y, HOUSE.Z + 0.06]), 'clothesline (bracket)')); }
  for (const f of FENCES) { const [ax, az] = f.a, [bx, bz] = f.b, alongZ = ax === bx, L = alongZ ? bz - az : bx - ax, cx = (ax + bx) / 2, cz = (az + bz) / 2;
    g.add(tag(box(alongZ ? 0.03 : L, f.h, alongZ ? L : 0.03, FENCE, [cx, GRADE + f.h / 2, cz]), f.name));
    for (let s = 0; s <= L + 1e-6; s += Math.min(2.4, L)) g.add(tag(box(0.09, f.h + 0.06, 0.09, FENCE, alongZ ? [ax, GRADE + (f.h + 0.06) / 2, az + s] : [ax + s, GRADE + (f.h + 0.06) / 2, az]), f.name + ' (post)')); }
  // the giant lemon tree
  { const T = TREE, [tx, tz] = T.at, BARK = { grey: 0.35, col: 0x5a4a3a }, LEAF = { grey: 0.4, col: 0x3a5a2a }, cy = T.canopyY;
    g.add(tag(cyl(T.trunkR * 0.8, T.trunkR, T.trunkH, BARK, [tx, GRADE + T.trunkH / 2, tz], null, 12), 'lemon tree (trunk)'));
    for (const [dx, dz, rx, rz] of [[0.4, 0.15, 12, -40], [-0.4, -0.1, -10, 40], [0.05, -0.45, -40, 5], [0.0, 0.42, 40, -3]])
      g.add(tag(cyl(0.05, 0.08, 1.4, BARK, [tx + dx, GRADE + T.trunkH + 0.45, tz + dz], [rx, 0, rz], 8), 'lemon tree (branch)'));
    g.add(tag(ball(T.canopyR, LEAF, [tx, cy, tz], [1, T.canopyK, 1]), 'lemon tree canopy'));
    for (const [dx, dy, dz, k] of [[1.0, 0.55, 0.5, 0.6], [-1.05, 0.4, -0.6, 0.58], [0.3, 0.75, -1.0, 0.55], [-0.5, 0.65, 0.9, 0.52]])
      g.add(tag(ball(T.canopyR * k, LEAF, [tx + dx, cy + dy, tz + dz], [1, 0.8, 1]), 'lemon tree canopy'));
    const RL = rng(7), LEM = { grey: 0.95, col: 0xf2d21c };
    for (let k = 0; k < T.lemons; k++) { const a = Math.PI * 2 * (k / T.lemons) + RL() * 0.3, rho = 0.7 + RL() * (T.canopyR - 0.85);
      const x = tx + Math.cos(a) * rho, z = tz + Math.sin(a) * rho, ys = cy - T.canopyR * T.canopyK * Math.sqrt(Math.max(0, 1 - (rho / T.canopyR) ** 2)), y = Math.max(ys - T.lemonR - 0.05 - RL() * 0.35, GRADE + 1.82);   // hang above head height (she reaches up to them)
      g.add(tag(ball(T.lemonR, LEM, [x, y, z], [1, 1.22, 1]), 'lemons (pomelo-sized)'));
      g.add(tag(cyl(0.006, 0.006, ys - y, { grey: 0.3, col: 0x3a4a2a, noCast: true }, [x, (ys + y) / 2 + T.lemonR * 0.6, z], null, 5), 'lemon tree')); } }
  // the neighbour's grapefruit tree over the NNE fence
  { const G = GRAPEFRUIT, BARK = { grey: 0.35, col: 0x5a4a3a }, LEAF = { grey: 0.38, col: 0x35552a };
    g.add(tag(cyl(0.1, 0.12, 2.0, BARK, [G.trunk[0], GRADE + 1.0, G.trunk[1]], null, 10), 'grapefruit tree (the neighbour’s)'));
    g.add(tag(ball(G.canopyR, LEAF, [G.at[0], G.canopyY, G.at[1]], [1, G.canopyK, 1]), 'grapefruit tree (branches over the fence)'));
    g.add(tag(ball(G.canopyR * 0.7, LEAF, [G.trunk[0] + 0.3, G.canopyY + 0.5, G.trunk[1] + 0.4], [1, 0.8, 1]), 'grapefruit tree (branches over the fence)'));
    const RG = rng(3); for (let k = 0; k < G.fruits; k++) { const a = Math.PI * 2 * k / G.fruits + RG() * 0.3, rho = 0.5 + RG() * 0.9, x = G.at[0] + Math.cos(a) * rho, z = G.at[1] + Math.sin(a) * rho;
      g.add(tag(ball(G.fruitR, { grey: 0.85, col: 0xf0b040 }, [x, G.canopyY - G.canopyR * G.canopyK * 0.7 - RG() * 0.2, z]), 'grapefruits')); } }
  // the lemonade table on the deck
  { const d = DRINKS, cx = (d.x0 + d.x1) / 2, czz = (d.z0 + d.z1) / 2, W = { grey: 0.85, col: 0xd8d4c8 }, y0 = d.y;
    g.add(tag(box(d.x1 - d.x0, 0.03, d.z1 - d.z0, W, [cx, y0 + d.h - 0.015, czz]), 'lemonade table'));
    for (const x of [d.x0 + 0.05, d.x1 - 0.05]) for (const z of [d.z0 + 0.05, d.z1 - 0.05]) g.add(tag(box(0.04, d.h - 0.03, 0.04, W, [x, y0 + (d.h - 0.03) / 2, z]), 'lemonade table'));
    g.add(tag(cyl(0.075, 0.065, 0.24, { grey: 0.93, col: 0xf0e070 }, [cx - 0.2, y0 + d.h + 0.12, czz], null, 20), 'lemonade pitcher'));
    for (let k = 0; k < 6; k++) g.add(tag(cyl(0.035, 0.028, 0.1, { grey: 0.9, col: 0xf0e8a0 }, [cx + 0.05 + (k % 3) * 0.1, y0 + d.h + 0.05, czz - 0.1 + Math.floor(k / 3) * 0.16], null, 12), 'cups'));
    g.add(tag(ball(0.13, { grey: 0.8, col: 0xd0c8b0 }, [cx + 0.2, y0 + d.h + 0.05, czz + 0.18], [1, 0.45, 1]), 'bowl of lemons'));
    for (let k = 0; k < 3; k++) g.add(tag(ball(TREE.lemonR, { grey: 0.95, col: 0xf2d21c }, [cx + 0.14 + k * 0.06, y0 + d.h + 0.13 + (k % 2) * 0.05, czz + 0.16 + k * 0.02], [1, 1.2, 1]), 'lemons (pomelo-sized)')); }
  // fire poi: the two circles (trails) and the two flames at their current place
  if (lt.poi) { const FIRE = { grey: 0.97, col: 0xffb040, emit: 0xff7a20, emitI: 1.6, flatEmit: 0.97 };
    [1, -1].forEach((s, i) => { const c = poiCentre(s); const t = mk(new THREE.TorusGeometry(POI.r, 0.012, 6, 48), { ...FIRE, emitI: 0.8 });
      t.position.set(...c); t.rotation.y = rad(POI.yaw + 90); g.add(tag(t, 'fire poi (circle swept by the flame)'));
      const a = rad(shot.poiPhase ?? 40) + i * Math.PI * 0.8, f = rad(POI.yaw), fx = Math.sin(f), fz = Math.cos(f);
      const hp = [c[0] + Math.cos(a) * POI.r * fx, c[1] + Math.sin(a) * POI.r, c[2] + Math.cos(a) * POI.r * fz];
      g.add(tag(ball(POI.headR * 2.2, FIRE, hp, [1, 1.5, 1]), 'fire poi flame'));
      const teth = cyl(0.004, 0.004, POI.r, { grey: 0.2, col: 0x222222, noCast: true }, [(c[0] + hp[0]) / 2, (c[1] + hp[1]) / 2, (c[2] + hp[2]) / 2], null, 5);
      teth.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), V(hp).sub(V(c)).normalize()); g.add(tag(teth, 'poi tether')); }); }
  return g;
}

// her path, drawn on the floor / deck / lawn (label, flat, lit; the gold line itself is the compositor's)
function pathRibbon() {
  const g = new THREE.Group(); const L = { grey: 0.98, col: 0xd9a520, emit: 0xd9a520, flatEmit: 0.99, only: ['label', 'flat', 'lit'], noCast: true };
  for (let i = 0; i + 1 < PATH.length; i++) { const a = V(PATH[i][0], PATH[i][2] + 0.03, PATH[i][1]), b = V(PATH[i + 1][0], PATH[i + 1][2] + 0.03, PATH[i + 1][1]);
    g.add(tag(slab(a, b, 0.05, 0.006, V(0, 0, 0).set(-(b.z - a.z), 0, b.x - a.x).lengthSq() > 1e-9 ? V(-(b.z - a.z), 0, b.x - a.x) : V(1, 0, 0), L), 'her path (gold line)')); }
  return g;
}

// ---------------------------------------------------------------- build
const roomOf = (o) => { const mid = (o.s0 + o.s1) / 2;
  if (o.wall === 'WNW') return mid < LIVING.x1 ? LIVING : null; if (o.wall === 'ESE') return mid < KITCHEN.x1 ? KITCHEN : null;
  if (o.wall === 'SSW') return mid < LIVING.z1 ? LIVING : KITCHEN; return null; };
export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const section = SECTION_KEY[shot.section] || 'bridge', sun = SUN[section], SL = SECTION_LIGHT[section];
  const lt = { sun: SL.sun && sun.up, ceiling: SL.ceiling, poi: SL.poi, sky: SL.sky, ...(shot.light || {}) };
  const { g: houseG, panes } = house(shot); root.add(houseG); root.add(shelf()); root.add(expedit2()); root.add(furniture(lt)); root.add(yard(shot, lt));
  if (shot.path) root.add(pathRibbon());
  const extra = (t) => { if (t === 'poiL') return V(poiCentre(1)); if (t === 'poiR') return V(poiCentre(-1)); if (t.startsWith('mark:')) { const m = MARKS[t.slice(5)]; return V(m[0], 1.5, m[1]); } return null; };
  const { figs } = stage(shot.figs, null, extra);
  // extra face anchors for the push-ins (V3_rev_*): each eye (half the 6.2 cm interpupillary distance off the eyes' midpoint)
  // and each temple (68 % of the way from the ear to the eyes, 2.2 cm up: forward of the mannequin's hair shell). headX points to the figure's own LEFT.
  for (const f of Object.values(figs)) { const P = f.userData.P; if (!P.eyes || !P.headX) continue;
    for (const [n, sg] of [['L', 1], ['R', -1]]) { P['eye' + n] = P.eyes.clone().addScaledVector(P.headX, sg * 0.031);
      P['temple' + n] = P['ear' + n].clone().lerp(P.eyes, 0.68).addScaledVector(P.headUp, 0.022).addScaledVector(P.headX, sg * 0.012); } }
  for (const [who, f] of Object.entries(figs)) { root.add(f);
    if (CAST[who].guest) f.traverse((o) => { if (!o.isMesh) return; const L = o.userData.look, ty = o.geometry.type;
      if (ty === 'ConeGeometry' || L.col === 0x8a3b34 || (ty === 'SphereGeometry' && L.grey === 0.05)) { o.visible = false; o.userData.baseVisible = false; } }); }
  if (shot.hide) { root.traverse((o) => { if (o.isMesh && shot.hide.some((h) => o.userData.label === h || (h.endsWith('*') && (o.userData.label || '').startsWith(h.slice(0, -1))))) { o.visible = false; o.userData.baseVisible = false; } });
    for (const f of Object.values(figs)) if (shot.hide.includes(f.name)) f.traverse((o) => { if (o.isMesh) { o.visible = false; o.userData.baseVisible = false; } }); }
  if (figs.firstLove27 && !(shot.hide || []).includes('firstLove27')) root.add(sandals(figs.firstLove27));
  hideParts(shot.hideParts, figs);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  const cam = makeCam(shot);
  if (shot.solo) root.traverse((o) => { if (o.isMesh && !shot.solo.includes(o.userData.who)) { o.visible = false; o.userData.baseVisible = false; } });

  const poiP = V(LIGHTS.poi.pos), sunDir = V(sun.dir), hex = (c) => '#' + c.toString(16).padStart(6, '0'), yardShot = /yard/.test(shot.space || '');
  const sc = V(...(shot.sunCentre || (yardShot ? [6, 0, 13] : shot.space === 'plan' ? [6, 0, 9] : [3, 0.8, 4]))), half = shot.sunHalf ?? (yardShot ? 13 : shot.space === 'plan' ? 16 : 8);
  const lightList = [
    { name: 'sun', kind: `the sun, ${SCENE.date} ${sun.time} ${sun.tz}: elev ${sun.elev} az ${sun.az} (pos: a point 30 m up the beam)`, pos: sc.clone().addScaledVector(sunDir, -30), aim: sc, color: hex(sun.color), on: !!lt.sun },
    ...CEILING_LIGHTS.map((c, i) => ({ name: `ceiling${i + 1}`, kind: c.name + ' (ASSUMED type and place)', pos: V(c.at[0], c.pendant ? c.at[1] - 0.1 : HOUSE.ceil - 0.06, c.at[2]), color: hex(LIGHTS.ceiling.color), on: !!lt.ceiling })),
    { name: 'poi', kind: LIGHTS.poi.kind, pos: poiP, color: hex(LIGHTS.poi.color), on: !!lt.poi },
  ];
  const rig = (mode) => {
    const Ls = []; if (mode === 'none' || mode === 'mask' || shot.beamMask) return Ls; const white = mode !== 'lit';
    if (lt.sun) { const d = new THREE.DirectionalLight(white ? 0xffffff : sun.color, white ? (lt.sunI ?? 1.5) : (lt.sunLit ?? (sun.elev > 8 ? 3.2 : 2.4)));
      d.position.copy(sc).addScaledVector(sunDir, -40); d.target.position.copy(sc); d.castShadow = true; const s = d.shadow.camera;
      s.left = -half; s.right = half; s.top = half; s.bottom = -half; s.near = 1; s.far = 95; d.shadow.radius = 1.5; d.shadow.bias = -0.0006; Ls.push(d); }
    if (lt.ceiling) for (const c of CEILING_LIGHTS) { const p = new THREE.PointLight(white ? 0xffffff : LIGHTS.ceiling.color, white ? (lt.ceilI ?? 0.9) : (lt.ceilLit ?? 2.4), 7, 1.3);
      p.position.set(c.at[0], c.pendant ? c.at[1] - 0.12 : HOUSE.ceil - 0.12, c.at[2]); p.castShadow = true; p.shadow.camera.near = 0.05; p.shadow.camera.far = 8; Ls.push(p); }
    if (lt.poi) { const p = new THREE.PointLight(white ? 0xffffff : LIGHTS.poi.color, white ? 2.2 : (lt.poiLit ?? 14), 8, 1.3); p.position.copy(poiP); p.castShadow = true; p.shadow.camera.near = 0.1; p.shadow.camera.far = 9; Ls.push(p); }
    const skyCol = lt.sky >= 0.9 ? 0xb4c2d8 : lt.sky >= 0.5 ? 0x8a84a8 : LIGHTS.sky.night;
    Ls.push(new THREE.AmbientLight(white ? 0xffffff : skyCol, white ? (lt.amb ?? (0.45 + 0.4 * lt.sky)) : (lt.litAmb ?? (lt.sky >= 0.9 ? 1.9 : lt.sky >= 0.5 ? 1.15 : 0.6))));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, lt.fill ?? 0.35); d.position.set(3, 6, -4); Ls.push(d); }
    return Ls;
  };
  const sunTests = () => { const out = {}; if (!sun.up) return { note: 'sun below the horizon' };
    const put = (k, p) => { const r = sunlit(p, sun); out[k] = r.lit ? 'sunlit' : `shaded by ${r.by}`; };
    if (figs.jade27) put('her_head', figs.jade27.userData.P.head.toArray()); if (figs.firstLove27) put('first_love_head', figs.firstLove27.userData.P.head.toArray());
    put('lemon_canopy_top', [TREE.at[0], TREE.canopyY + TREE.canopyR * TREE.canopyK * 0.95, TREE.at[1]]); put('lemon_canopy_side_toward_house', [TREE.at[0] - 0.6, TREE.canopyY, TREE.at[1] - 1.9]);
    put('expedit_top_centre', shelfWorld([0, SHELF.h, SHELF.depth + 0.01])); put('lawn_mid', [6, GRADE + 0.05, 15]); return out; };
  const extraOut = (c, P) => {
    const cubePx = (cu) => [[cu.x0, cu.y1], [cu.x1, cu.y1], [cu.x1, cu.y0], [cu.x0, cu.y0]].map(([x, y]) => P(V(...shelfWorld([x, y, SHELF.depth]))));
    const out = { layout_set: 'mv10', house: '345B View St, Mountain View (rebuilt from Jade’s drawings, 2026-11-25 (2))', space: shot.space || 'room', time: shot.time || null, section: shot.section || null,
      scene: { date: SCENE.date, clock: sun.time, tz: sun.tz, sun_elev_deg: sun.elev, sun_az_deg: sun.az, sun_up: sun.up, sunset: SUN_EVENTS.sunset, civil_dusk_end: SUN_EVENTS.civil_dusk_end, date_note: 'housewarming date unknown ("likely fall 2010", Jade): 2 Oct 2010 is OUR pick' },
      light_state: { sun: !!lt.sun, ceiling: !!lt.ceiling, poi: !!lt.poi, sky: lt.sky }, amplitude_pct: shot.amp ?? 100,
      sun_through_openings: sunFootprints(section), sun_tests: sunTests(), footprints_world: FOOTPRINTS,
      shelf: { model: SHELF.model, world: { centre_X: SHELF_AT.X, front_Z: SHELF_W.front, spines_Z: SHELF_W.spines, back_Z: SHELF_W.back, faces: 'WNW (-Z)' }, outer_m: [SHELF.W, SHELF.H, SHELF.depth], cube_m: +SHELF.cube.toFixed(4),
        seam_world_X: SHELF_W.seam, seam_px: [P(V(SHELF_W.seam, 0, SHELF_W.front)), P(V(SHELF_W.seam, SHELF.h, SHELF_W.front))],
        beauty_half: 'LEFT as you face it = NNE (art and literature)', truth_half: 'RIGHT as you face it = SSW (science fiction, textbooks, popular science)',
        cubes: SHELF.cubes.map((cu) => ({ cube: cu.key, col: cu.col, row: cu.row, kind: cu.kind, half: cu.half, px: cubePx(cu),
          contents: cu.kind === 'books' ? (Array.isArray(cu.books) ? cu.books.map((b) => b.t) : { left: cu.books.left.map((b) => b.t), right: cu.books.right.map((b) => b.t) }) : cu.objects.map((o) => o.k) })),
        warnings: SHELF_WARN.length ? [...new Set(SHELF_WARN)] : undefined },
      expedit_2x2: { world: { X: [EXPEDIT2.X0, EXPEDIT2.X1], Z: [EXPEDIT2.Zc - EXPEDIT2.W / 2, EXPEDIT2.Zc + EXPEDIT2.W / 2], faces: 'SSW (-X)' }, printer_on_top: true, px: P(V(EXPEDIT2.X0 + 0.2, EXPEDIT2.H + 0.1, EXPEDIT2.Zc)) },
      lemon_tree_px: P(V(TREE.at[0], TREE.canopyY, TREE.at[1])), poi_px: P(poiP), opening_px: P(V((OPENING.x0 + OPENING.x1) / 2, 1.0, OPENING.z)) };
    if (shot.timing) out.timing = shot.timing;
    if (shot.faceMarks && figs.jade27) { const Pj = figs.jade27.userData.P; out.face_marks = { note: 'her eye and temple, px in THIS frame (start or end key of the push-in): where the overlay begins', who: 'jade27',
      eyeL_px: P(Pj.eyeL.clone()), eyeR_px: P(Pj.eyeR.clone()), eyes_mid_px: P(Pj.eyes.clone()), templeL_px: P(Pj.templeL.clone()), templeR_px: P(Pj.templeR.clone()),
      eyeL_world: Pj.eyeL.toArray().map((v) => +v.toFixed(4)), templeL_world: Pj.templeL.toArray().map((v) => +v.toFixed(4)), head_pose: shot.figs.jade27.head }; }
    if (figs.firstLove27) out.first_love_costume = FIRST_LOVE_COSTUME;
    if (shot.crossing) { const C = CROSSING, px = (x, z, y = 0.02) => P(V(x, y, z)), cornersPx = (o) => [[o.x0, o.z0], [o.x0, o.z1], [o.x1, o.z1], [o.x1, o.z0]].map(([x, z]) => px(x, z, 0.75));
      const people = Object.entries(figs).filter(([w]) => w !== 'jade27').map(([w, f]) => { const p = f.userData.P, pel = p.hip || p.waist || p.head;
        return { who: w, label: CAST[w].name, floor_world: [+pel.x.toFixed(3), +pel.z.toFixed(3)], floor_px: px(pel.x, pel.z), head_px: P(p.head.clone()),
          clearance_to_path_m: +Math.min(...C.segments.map((g) => { const [ax, az] = g.from, [bx, bz] = g.to, dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((pel.x - ax) * dx + (pel.z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(pel.x - ax - t * dx, pel.z - az - t * dz); })).toFixed(3) }; })
        .filter((q) => q.floor_world[1] > 3 && q.floor_world[1] < 10.2);
      out.crossing = { note: 'world metres: [X (NNE), Z (ESE)] on the floor; px = this camera’s pixels (floor level). Speeds and times are INVENTED (a plausible walk).', ...C,
        points_px: C.points.map(([x, z]) => px(x, z)), stamps: C.stamps.map((q) => ({ ...q, px: px(...q.at) })), turns: C.turns.map((q) => ({ ...q, px: px(...q.at) })),
        segments: C.segments.map((g) => ({ ...g, from_px: px(...g.from), to_px: px(...g.to) })), shortest_walkable_path_px: C.shortest_walkable_path.map(([x, z]) => px(x, z)),
        obstacles: C.obstacles.map((o) => ({ ...o, corners_px_at_0_75m: cornersPx(o) })), people_near_the_route: people,
        her_now: figs.jade27 ? { floor_world: [+figs.jade27.userData.P.hip.x.toFixed(3), +figs.jade27.userData.P.hip.z.toFixed(3)], head_px: P(figs.jade27.userData.P.head.clone()), t_s: +(C.total_s / 2).toFixed(2), note: 'posed at the time midpoint of the walk' } : null }; }
    if (shot.path) out.path = { note: 'her route, one line: shelf, the opening, round the dining table, the French doors, the deck, the stairs, the lawn, the lemon tree; floor points [X, y, Z]', world: PATH.map(([x, z, y]) => [x, y, z]), px: PATH.map(([x, z, y]) => P(V(x, y + 0.02, z))) };
    return out;
  };
  // mask twins: white = what this shot's lights light, as declared in layout.js, everything else black.
  //   sun: the shafts through every living-room / kitchen opening that sees the sun (apertureLit > 0), swept along the
  //        sun to the floor and clipped by that room's box. A partly blocked window is masked whole (the flat render has
  //        the true edge). The sun in the YARD is not masked (see FOOTPRINTS.sun_yard).
  //   poi: its ground footprint (radius 4.5 m, clamped to the lawn) plus the flames and their circles.
  //   ceiling fixtures: omni, no shaft: no mask.
  if (shot.beamMask) { const solids = [], WH = { grey: 1 }, want = (k) => lt[k] && (!shot.beamOnly || shot.beamOnly === k);
    if (want('sun')) for (const o of OPENINGS) { const room = roomOf(o); if (!room) continue; const a = apertureLit(o, sun); if (!(a.frac > 0)) continue;
      solids.push(beamSolid({ aperture: apertureOf(o), dir: sun.dir, sink: 0.015, clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, { n: [-1, 0, 0], d: -room.x0 }, { n: [1, 0, 0], d: room.x1 }, { n: [0, 0, -1], d: -room.z0 + 0.15 }, { n: [0, 0, 1], d: room.z1 + 0.15 }, { n: [0, 1, 0], d: HOUSE.ceil }] })); }
    if (want('poi')) { const F = FOOTPRINTS.poi_ground, cl = (v, a, b) => Math.min(b, Math.max(a, v));
      solids.push(polyMesh(Array.from({ length: 72 }, (_, k) => V(cl(F.centre[0] + F.radius * Math.cos(k * Math.PI / 36), LAWN.x0, LAWN.x1), GRADE + 0.03, cl(F.centre[2] + F.radius * Math.sin(k * Math.PI / 36), LAWN.z0, LAWN.z1))), WH, [0, 1, 0], 0)); }
    if (shot.solo) solids.length = 0;   // HS1: the room is gone, so is its light
    applyBeamMask(root, solids, { label: 'lit (mask)', cam, surfaceOnly: !!shot.beamSurf });
    if (want('poi')) root.traverse((o) => { if (o.isMesh && /^fire poi/.test(o.userData.label || '')) o.userData.look = { grey: 1, emit: 0xffffff, flatEmit: 1 }; }); }
  const subj = shot.subject ? V(shot.subject) : (figs.jade27 ? figs.jade27.userData.P.head.clone() : V(3, 1.4, 3));
  const litBg = lt.sky >= 0.9 ? 0x9ab4d4 : lt.sky >= 0.5 ? 0x5a4a6a : 0x0a0c16;
  return { set: 'mv10', scene, root, cam, rig, near: shot.near ?? 0.12, far: shot.far ?? 60, figs, book: null, panes, lights: lightList,
    header: shot.header || '', shadowLine: false, shadowPolys: null, subject: subj, litBg, flatBg: shot.beamMask ? 0x000000 : undefined, extra: extraOut };
}
