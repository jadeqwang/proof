// Build one mv10 shot: bookshelf room + yard (from layout.js), figures, light rig per mode, the three shelf shadows.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, tag, V, rad } from '../../engine/core.js';
import { stage, solveCamera, hideParts, hull } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, polyMesh, applyBeamMask } from '../_beam.js';
import { CAST } from '../_cast.js';
import { ROOM, SLIDER, HALL, SHELF, LAMPS, lampPos, shadowOnShelf, SOFA, RUG, SIDE_TABLE, PICTURES, YARD, PATIO, TREE, DRINKS, POI, poiCentre,
  PATH, MARKS, DUSK, duskFloorY, duskShaftAt, LIGHTS, FOOTPRINTS } from './layout.js';

// ---------------------------------------------------------------- cast (set-local, additive: engine/mannequin.js is not edited)
// Guests are costume and posture only: their eyes, nose and mouth are removed after the figure is built.
const GUEST = (name, h, top, legs, hairStyle, sleeves = 'long', extra = {}) => ({ name, h, kind: 'adult', skin: 0xd9b499, hair: 0x2a211c, top, legs, hairStyle, sleeves, guest: true, ...extra });
const NEW_CAST = {
  // `jade27` and `firstLove27` come from ../_cast.js (one table for every set)
  A1: GUEST('guest A1 (face undrawn)', 1.78, 0x7a8a5a, 0x3a3a44, 'short'), A2: GUEST('guest A2 (face undrawn)', 1.62, 0xc9b25a, 0x5a4a3a, 'bob', 'short'),
  A3: GUEST('guest A3 (face undrawn)', 1.86, 0x8a3a3a, 0x30343c, 'short'), S1: GUEST('guest S1, on the sofa (face undrawn)', 1.68, 0x5a7a9a, 0x2c2c34, 'bun'),
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

const PLASTER = { grey: 0.82, col: 0xcfc6b4 }, FLOORW = { grey: 0.6, col: 0x8a6a48 }, WHITE = { grey: 0.92, col: 0xe8e4da };
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// a wall in a plane x = const, with rectangular holes: one extruded shape, so line mode draws no seams.
// spans z zA..zB, height h, thickness t from x = xOuter - t to xOuter. holes: [{ z0, z1, y0, y1 }]
function wallX(xOuter, t, zA, zB, h, holes, look, label) {
  const sh = new THREE.Shape(); sh.moveTo(zA, 0); sh.lineTo(zB, 0); sh.lineTo(zB, h); sh.lineTo(zA, h); sh.lineTo(zA, 0);
  for (const o of holes) { const p = new THREE.Path(); const y0 = o.y0 + 1e-3; p.moveTo(o.z0, y0); p.lineTo(o.z0, o.y1); p.lineTo(o.z1, o.y1); p.lineTo(o.z1, y0); p.lineTo(o.z0, y0); sh.holes.push(p); }
  const m = mk(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), look);
  m.matrixAutoUpdate = false; m.matrix.set(0, 0, -1, xOuter, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);   // shape (sx, sy, sz) -> world (xOuter - sz, sy, sx)
  return tag(m, label);
}

// ---------------------------------------------------------------- the bookshelf room
function room(shot) {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h, wallT: T } = ROOM;
  g.add(tag(box(x1 - x0, 0.04, z1 - z0, FLOORW, [(x0 + x1) / 2, -0.02, (z0 + z1) / 2]), 'room floor (oak)'));
  g.add(tag(box(x1 - x0 + 2 * T, 0.06, z1 - z0 + 2 * T, { ...PLASTER, noCast: true }, [(x0 + x1) / 2, h + 0.03, (z0 + z1) / 2]), 'ceiling'));
  g.add(tag(box(x1 - x0 + 2 * T, h, T, PLASTER, [(x0 + x1) / 2, h / 2, z0 - T / 2]), 'back wall (behind the shelf)'));
  g.add(tag(box(x1 - x0 + 2 * T, h, T, PLASTER, [(x0 + x1) / 2, h / 2, z1 + T / 2]), 'front wall'));
  g.add(wallX(x0, T, z0, z1, h, [{ z0: HALL.z0, z1: HALL.z1, y0: 0, y1: HALL.h }], PLASTER, 'left wall (hall doorway)'));
  g.add(tag(box(1.2, 0.04, HALL.z1 - HALL.z0 + 1, FLOORW, [x0 - 0.7, -0.02, (HALL.z0 + HALL.z1) / 2]), 'hall floor'));
  g.add(tag(box(0.06, h, 3, { ...PLASTER, grey: 0.7 }, [x0 - 1.3, h / 2, (HALL.z0 + HALL.z1) / 2]), 'hall wall'));
  // the right wall is the house's west wall: it runs the whole length of the yard, with the slider in it
  g.add(wallX(x1 + T, T, YARD.z0, YARD.z1, YARD.houseH, [{ z0: SLIDER.z0, z1: SLIDER.z1, y0: 0, y1: SLIDER.h }], PLASTER, 'house wall (sliding door to the yard)'));
  g.add(tag(box(YARD.eave + T + 0.3, 0.08, YARD.z1 - YARD.z0, { grey: 0.5, col: 0x5a4a3c, noCast: true }, [x1 + T + YARD.eave / 2 - 0.15, YARD.houseH + 0.04, (YARD.z0 + YARD.z1) / 2]), 'roof eave'));
  // slider frame: head, sill, two jambs, the meeting stile; the two glass leaves are stacked over z0..zMid (slid open)
  { const S = SLIDER, FR = { grey: 0.3, col: 0x4a4a48 }, xm = x1 + T / 2, f = S.frame;
    g.add(tag(box(T + 0.02, f, S.z1 - S.z0, FR, [xm, S.h - f / 2, (S.z0 + S.z1) / 2]), 'slider frame'));
    g.add(tag(box(T + 0.02, 0.02, S.z1 - S.z0, FR, [xm, 0.01, (S.z0 + S.z1) / 2]), 'slider frame'));
    for (const z of [S.z0 + f / 2, S.z1 - f / 2]) g.add(tag(box(T + 0.02, S.h, f, FR, [xm, S.h / 2, z]), 'slider frame'));
    g.add(tag(box(0.07, S.h, f, FR, [xm, S.h / 2, S.zMid]), 'slider frame (stile of the open leaf)'));
    g.add(tag(box(0.07, f, S.zMid - S.z0, FR, [xm, 1.0, (S.z0 + S.zMid) / 2]), 'slider frame')); }
  const P = (x, y, z) => V(x, y, z), S = SLIDER, xg = x1 + T / 2;
  const panes = {   // TL, TR, BR, BL as seen from inside the room (looking +x: frame-right = +z)
    slider_fixed_glass: [P(xg, S.h, S.z0), P(xg, S.h, S.zMid), P(xg, 0, S.zMid), P(xg, 0, S.z0)],
    slider_opening: [P(xg, S.h, S.zMid), P(xg, S.h, S.z1), P(xg, 0, S.z1), P(xg, 0, S.zMid)],
  };
  g.add(tag(quad(panes.slider_fixed_glass, { glass: true, col: 0x9ab0c0, opacity: 0.14, noCast: true }), 'slider glass'));
  // sofa against the left wall, side table at its shelf end, rug, two framed pictures on the front wall
  { const F = { grey: 0.55, col: 0x6a7a6a }, s = SOFA, cx = (s.x0 + s.x1) / 2, cz = (s.z0 + s.z1) / 2, L = s.z1 - s.z0;
    g.add(tag(box(s.x1 - s.x0, s.seat - 0.1, L, F, [cx, (s.seat - 0.1) / 2 + 0.1, cz]), 'sofa'));
    g.add(tag(box(0.2, s.back, L, F, [s.x0 + 0.1, s.back / 2, cz]), 'sofa'));
    for (const z of [s.z0 + 0.09, s.z1 - 0.09]) g.add(tag(box(s.x1 - s.x0, 0.6, 0.18, F, [cx, 0.3, z]), 'sofa'));
    g.add(tag(box(RUG.x1 - RUG.x0, RUG.t, RUG.z1 - RUG.z0, { grey: 0.7, col: 0x9a6a5a }, [(RUG.x0 + RUG.x1) / 2, RUG.t / 2, (RUG.z0 + RUG.z1) / 2]), 'rug'));
    const t = SIDE_TABLE; g.add(tag(cyl(t.w / 2, t.w / 2, 0.03, { grey: 0.4, col: 0x5a4632 }, [t.at[0], t.h, t.at[1]]), 'side table')); g.add(tag(cyl(0.03, 0.03, t.h, { grey: 0.4, col: 0x5a4632 }, [t.at[0], t.h / 2, t.at[1]]), 'side table'));
    for (const [x, y, w, hh] of PICTURES) g.add(tag(box(w, hh, 0.03, { grey: 0.45, col: 0x3a3a3a }, [x, y, z1 - 0.015]), 'framed picture')); }
  return { g, panes };
}

// ---------------------------------------------------------------- the shelf: two different bookcases, books as boxes
function shelf() {
  const g = new THREE.Group(); const Sz = SHELF.spineZ, D = SHELF.depth;
  const unit = (U, name) => { const L = { grey: U.grey, col: U.col }, lab = `bookcase, ${name} half`;
    const add = (m) => g.add(tag(m, lab));
    add(box(U.x1 - U.x0, U.h, 0.012, L, [(U.x0 + U.x1) / 2, U.h / 2, 0.006]));                 // back panel
    add(box(U.x1 - U.x0, U.kick, D - 0.03, L, [(U.x0 + U.x1) / 2, U.kick / 2, (D - 0.03) / 2]));  // kickboard
    const n = Math.round((U.x1 - U.x0) / U.bay), bw = (U.x1 - U.x0) / n; const ups = [];
    for (let k = 0; k <= n; k++) { const x = U.x0 + k * bw; ups.push(x); add(box(0.02, U.h, D, L, [Math.min(Math.max(x, U.x0 + 0.01), U.x1 - 0.01), U.h / 2, D / 2])); }
    return { bw, n, add, L }; };
  // TRUTH: six even shelves of reference sets
  { const U = SHELF.truth, { bw, n, add } = unit(U, 'TRUTH'), R = rng(1988), pitch = (U.h - U.kick) / U.shelves;
    const lab = 'TRUTH half: reference sets, uniform runs';
    for (let s = 0; s <= U.shelves; s++) add(box(U.x1 - U.x0, U.board, SHELF.depth, { grey: U.grey, col: U.col }, [(U.x0 + U.x1) / 2, U.kick + s * pitch - (s === U.shelves ? U.board / 2 : -U.board / 2), SHELF.depth / 2]));
    for (let s = 0; s < U.shelves; s++) { const y0 = U.kick + s * pitch + U.board;
      for (let b = 0; b < n; b++) { let x = U.x0 + b * bw + 0.014; const xe = U.x0 + (b + 1) * bw - 0.014;
        while (x < xe - 0.03) {
          const sf = s === U.sf.shelf && x >= U.sf.x0 - 0.01 && x < U.sf.x1;
          if (sf) { const t = 0.018 + R() * 0.012, hh = 0.172 + R() * 0.014; if (x + t > xe) break;
            g.add(tag(box(t - 0.001, hh, 0.11, { grey: 0.55 + R() * 0.4, col: [0xe0b030, 0x3a7ad0, 0xd0503a, 0x40a080, 0xb060c0][Math.floor(R() * 5)] }, [x + t / 2, y0 + hh / 2, Sz - 0.055 - R() * 0.004]), 'science-fiction paperbacks (shelved with truth)')); x += t; continue; }
          // a set: same height, same thickness, same cloth
          const t = 0.04 + R() * 0.022, hh = 0.255 + R() * 0.04, cnt = 5 + Math.floor(R() * 9), gr = 0.25 + R() * 0.3, col = [0x5a1f1f, 0x1f3a2a, 0x22304a, 0x4a3a22, 0x2a2a2a][Math.floor(R() * 5)];
          for (let k = 0; k < cnt && x + t <= xe && !(s === U.sf.shelf && x >= U.sf.x0 - 0.01 && x < U.sf.x1); k++) { g.add(tag(box(t - 0.0015, hh, 0.22, { grey: gr, col }, [x + t / 2, y0 + hh / 2, Sz - 0.11]), lab)); x += t; }
          if (x + 0.04 > xe) break;
        } } } }
  // BEAUTY: five uneven shelves, everything different
  { const U = SHELF.beauty, { bw, n, add } = unit(U, 'BEAUTY'), R = rng(2010); const lab = 'BEAUTY half: novels and art books, every height';
    let y = U.kick; const ys = [];
    for (let s = 0; s <= U.clear.length; s++) { add(box(U.x1 - U.x0, U.board, SHELF.depth, { grey: U.grey, col: U.col }, [(U.x0 + U.x1) / 2, y + U.board / 2, SHELF.depth / 2])); ys.push(y + U.board); y += U.board + (U.clear[s] || 0) + 0.014; }
    for (let s = 0; s < U.clear.length; s++) { const y0 = ys[s], clear = U.clear[s] + 0.014;
      for (let b = 0; b < n; b++) { let x = U.x0 + b * bw + 0.014; const xe = U.x0 + (b + 1) * bw - 0.014;
        while (x < xe - 0.02) { const r = R(); const look = () => ({ grey: 0.3 + R() * 0.6, col: [0xc8553a, 0xe0c060, 0x3a6a8a, 0x7a9a5a, 0xd8d0c0, 0x8a4a7a, 0x2a2a30, 0xe08a3a][Math.floor(R() * 8)] });
          if (r < 0.07 && xe - x > 0.2) { // an object in a gap
            const w = 0.1 + R() * 0.08; if (R() < 0.5) g.add(tag(ball(w / 2, { grey: 0.75, col: 0x7ab0b0 }, [x + w / 2 + 0.02, y0 + w * 0.6, Sz - 0.1], [1, 1.2, 1]), 'vase')); else g.add(tag(box(w, w * 1.3, 0.02, { grey: 0.4, col: 0x3a3a3a }, [x + w / 2 + 0.02, y0 + w * 0.65, Sz - 0.06], [-8, 0, 0]), 'small frame')); x += w + 0.05; continue; }
          if (r < 0.16 && xe - x > 0.3) { // a flat stack
            const w = 0.2 + R() * 0.08; let yy = y0; const k = 2 + Math.floor(R() * 4);
            for (let i = 0; i < k && yy - y0 < clear - 0.06; i++) { const t = 0.018 + R() * 0.03; g.add(tag(box(w - R() * 0.03, t - 0.001, 0.2, look(), [x + w / 2, yy + t / 2, Sz - 0.1 - R() * 0.006]), lab)); yy += t; } x += w + 0.008; continue; }
          const t = 0.012 + R() * 0.034, hh = Math.min(clear - 0.025, 0.165 + R() * (s === 0 ? 0.24 : 0.14)); if (x + t > xe) break;
          const lean = r > 0.93 && xe - x > 0.12;
          const m = box(t - 0.001, hh, 0.14 + R() * 0.07, look(), [x + t / 2 + (lean ? hh * 0.09 : 0), y0 + hh / 2 - (lean ? 0.002 : 0), Sz - 0.09 - R() * 0.008]);
          const dz = m.geometry.parameters.depth; m.position.z = Sz - dz / 2 - R() * 0.008; if (lean) { m.rotation.z = rad(-10); x += hh * 0.19; }
          g.add(tag(m, lab)); x += t; } } } }
  return g;
}

function lamps(on) {
  const g = new THREE.Group();
  LAMPS.x.forEach((x, i) => { const lab = `paper floor lamp ${i + 1}`, D = { grey: 0.2, col: 0x2a2a2a, noCast: true };
    g.add(tag(cyl(LAMPS.baseR, LAMPS.baseR, 0.02, D, [x, 0.01, LAMPS.z]), lab));
    g.add(tag(cyl(LAMPS.poleR, LAMPS.poleR, LAMPS.bulbY - LAMPS.shadeH / 2, D, [x, (LAMPS.bulbY - LAMPS.shadeH / 2) / 2, LAMPS.z], null, 10), lab));
    g.add(tag(cyl(LAMPS.shadeR, LAMPS.shadeR, LAMPS.shadeH, on ? { grey: 0.97, col: 0xfff0d8, emit: LAMPS.color, emitI: 1.3, flatEmit: 0.98 } : { grey: 0.85, col: 0xd8d0c0, noCast: true }, [x, LAMPS.bulbY, LAMPS.z]), lab)); });
  return g;
}

// ---------------------------------------------------------------- the yard
function yard(shot) {
  const g = new THREE.Group(); const Y = YARD, cz = (Y.z0 + Y.z1) / 2, Lz = Y.z1 - Y.z0;
  g.add(tag(box(Y.x1 - Y.x0 + 6, 0.04, Lz + 6, { grey: 0.5, col: 0x4a6a3a }, [(Y.x0 + Y.x1) / 2 + 3, -0.021, cz]), 'lawn'));
  g.add(tag(box(PATIO.x1 - PATIO.x0, PATIO.t, PATIO.z1 - PATIO.z0, { grey: 0.74, col: 0x9a968c }, [(PATIO.x0 + PATIO.x1) / 2, PATIO.t / 2 - 0.02, (PATIO.z0 + PATIO.z1) / 2]), 'patio slab'));
  const FE = { grey: 0.42, col: 0x7a5238 };
  g.add(tag(box(0.04, Y.fenceH, Lz, FE, [Y.x1, Y.fenceH / 2, cz]), 'west fence (the sun sets behind it)'));
  for (const z of [Y.z0, Y.z1]) g.add(tag(box(Y.x1 - Y.x0, Y.fenceH, 0.04, FE, [(Y.x0 + Y.x1) / 2, Y.fenceH / 2, z]), 'side fence'));
  for (let z = Y.z0 + 1.2; z < Y.z1; z += 2.4) g.add(tag(box(0.1, Y.fenceH + 0.08, 0.1, FE, [Y.x1 - 0.06, (Y.fenceH + 0.08) / 2, z]), 'fence post'));
  // lemon tree
  { const T = TREE, [tx, tz] = T.at, BARK = { grey: 0.35, col: 0x5a4a3a }, LEAF = { grey: 0.4, col: 0x3a5a2a };
    g.add(tag(cyl(T.trunkR * 0.8, T.trunkR, T.trunkH, BARK, [tx, T.trunkH / 2, tz], null, 12), 'lemon tree'));
    g.add(tag(cyl(0.04, 0.06, 0.9, BARK, [tx + 0.25, T.trunkH + 0.25, tz + 0.1], [10, 0, -38], 8), 'lemon tree'));
    g.add(tag(cyl(0.04, 0.06, 0.9, BARK, [tx - 0.25, T.trunkH + 0.25, tz - 0.05], [-8, 0, 38], 8), 'lemon tree'));
    g.add(tag(ball(T.canopyR, LEAF, [tx, T.canopyY, tz], [1, T.canopyK, 1]), 'lemon tree canopy'));
    g.add(tag(ball(T.canopyR * 0.6, LEAF, [tx + 0.75, T.canopyY + 0.45, tz + 0.4], [1, 0.8, 1]), 'lemon tree canopy'));
    g.add(tag(ball(T.canopyR * 0.55, LEAF, [tx - 0.7, T.canopyY + 0.35, tz - 0.5], [1, 0.8, 1]), 'lemon tree canopy'));
    // lemons hang just under the canopy's lower surface, most on the house side where she stands
    const R = rng(7), LEM = { grey: 0.95, col: 0xf2d21c };
    for (let k = 0; k < T.lemons; k++) { const a = Math.PI * (0.55 + 1.25 * (k / T.lemons)) + R() * 0.25, rho = 0.55 + R() * 0.78;
      const x = tx + Math.cos(a) * rho, z = tz + Math.sin(a) * rho, ys = T.canopyY - T.canopyK * Math.sqrt(T.canopyR ** 2 - rho ** 2), y = ys - T.lemonR - 0.1 - R() * 0.4;
      g.add(tag(ball(T.lemonR, LEM, [x, y, z], [1, 1.22, 1]), 'lemons (pomelo-sized)'));
      g.add(tag(cyl(0.006, 0.006, ys - y, { grey: 0.3, col: 0x3a4a2a, noCast: true }, [x, (ys + y) / 2 + T.lemonR * 0.6, z], null, 5), 'lemon tree')); } }
  // lemonade table
  { const d = DRINKS, cx = (d.x0 + d.x1) / 2, czz = (d.z0 + d.z1) / 2, W = { grey: 0.85, col: 0xd8d4c8 };
    g.add(tag(box(d.x1 - d.x0, 0.03, d.z1 - d.z0, W, [cx, d.h - 0.015, czz]), 'lemonade table'));
    for (const x of [d.x0 + 0.05, d.x1 - 0.05]) for (const z of [d.z0 + 0.05, d.z1 - 0.05]) g.add(tag(box(0.04, d.h - 0.03, 0.04, W, [x, (d.h - 0.03) / 2, z]), 'lemonade table'));
    g.add(tag(cyl(0.075, 0.065, 0.24, { grey: 0.93, col: 0xf0e070 }, [cx - 0.2, d.h + 0.12, czz]), 'lemonade pitcher'));
    for (let k = 0; k < 6; k++) g.add(tag(cyl(0.035, 0.028, 0.1, { grey: 0.9, col: 0xf0e8a0 }, [cx + 0.05 + (k % 3) * 0.12, d.h + 0.05, czz - 0.1 + Math.floor(k / 3) * 0.16], null, 12), 'cups'));
    g.add(tag(ball(0.13, { grey: 0.8, col: 0xd0c8b0 }, [cx - 0.45, d.h + 0.05, czz + 0.05], [1, 0.45, 1]), 'bowl of lemons'));
    for (let k = 0; k < 3; k++) g.add(tag(ball(TREE.lemonR, { grey: 0.95, col: 0xf2d21c }, [cx - 0.5 + k * 0.07, d.h + 0.13 + (k % 2) * 0.05, czz + 0.02 + k * 0.03], [1, 1.2, 1]), 'lemons (pomelo-sized)')); }
  // fire poi: the two circles (trails) and the two flames at their current place
  if (shot.light?.poi !== false) { const FIRE = { grey: 0.97, col: 0xffb040, emit: 0xff7a20, emitI: 1.6, flatEmit: 0.97 };
    [1, -1].forEach((s, i) => { const c = poiCentre(s); const t = mk(new THREE.TorusGeometry(POI.r, 0.012, 6, 48), { ...FIRE, emitI: 0.8 });
      t.position.set(...c); t.rotation.y = rad(POI.yaw + 90); g.add(tag(t, 'fire poi (circle swept by the flame)'));
      const a = rad(shot.poiPhase ?? 40) + i * Math.PI * 0.8, f = rad(POI.yaw), fx = Math.sin(f), fz = Math.cos(f);
      const hp = [c[0] + Math.cos(a) * POI.r * fx, c[1] + Math.sin(a) * POI.r, c[2] + Math.cos(a) * POI.r * fz];
      g.add(tag(ball(POI.headR * 2.2, FIRE, hp, [1, 1.5, 1]), 'fire poi flame'));
      const teth = cyl(0.004, 0.004, POI.r, { grey: 0.2, col: 0x222222, noCast: true }, [(c[0] + hp[0]) / 2, (c[1] + hp[1]) / 2, (c[2] + hp[2]) / 2], null, 5);
      teth.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), V(hp).sub(V(c)).normalize()); g.add(tag(teth, 'poi tether')); }); }
  return g;
}

// her path across the room, drawn on the floor (label and flat only; the gold line itself is the compositor's)
function pathRibbon() {
  const g = new THREE.Group(); const y = 0.05, L = { grey: 0.98, col: 0xd9a520, emit: 0xd9a520, flatEmit: 0.99, only: ['label', 'flat', 'lit'] };
  for (let i = 0; i + 1 < PATH.length; i++) { const a = V(PATH[i][0], y, PATH[i][1]), b = V(PATH[i + 1][0], y, PATH[i + 1][1]), d = b.clone().sub(a);
    const m = box(0.05, 0.006, d.length() + 0.05, L, a.clone().addScaledVector(d, 0.5).toArray()); m.rotation.y = Math.atan2(d.x, d.z); g.add(tag(m, 'her path across the room (gold line)')); }
  return g;
}

// ---------------------------------------------------------------- the three shadows on the spines
// Each lamp is a point. For each lamp, every mesh of the caster is projected through the lamp onto the spine plane,
// the convex hull of each part is filled into a 4 mm grid, the grid is clipped to the bookcases, and its boundary
// becomes one thin ribbon mesh: the outline of that lamp's shadow, drawn in line and label modes.
// (flat and lit show the same shadows from the real shadow maps of the three spot lights.)
function shelfShadows(fig, cam, fill = false) {   // fill: also the filled shadows, black, in front of the spines (the beam mask)
  const res = 0.004, X0 = SHELF.truth.x0, X1 = SHELF.beauty.x1, Y0 = 0, Y1 = SHELF.truth.h, nx = Math.ceil((X1 - X0) / res), ny = Math.ceil((Y1 - Y0) / res), zs = SHELF.spineZ;
  fig.updateMatrixWorld(true); const P = fig.userData.P; const g = new THREE.Group(); const info = [];
  const topAt = (x) => (x < SHELF.seam ? SHELF.truth.h : SHELF.beauty.h), kickAt = (x) => (x < SHELF.seam ? SHELF.truth.kick : SHELF.beauty.kick);
  for (let i = 0; i < 3; i++) {
    const Lp = V(lampPos(i)); const grid = new Uint8Array(nx * ny); const v = new THREE.Vector3();
    fig.traverse((o) => { if (!o.isMesh || !o.visible || o.userData.baseVisible === false) return; const pos = o.geometry.attributes.position; const pts = [];
      for (let k = 0; k < pos.count; k++) { v.fromBufferAttribute(pos, k).applyMatrix4(o.matrixWorld); if (v.z > Lp.z - 0.05 || v.z < zs) continue;
        const t = (zs - Lp.z) / (v.z - Lp.z); pts.push([Lp.x + (v.x - Lp.x) * t, Lp.y + (v.y - Lp.y) * t]); }
      if (pts.length < 3) return; const h = hull(pts); let ymin = 1e9, ymax = -1e9; for (const p of h) { ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]); }
      for (let j = Math.max(0, Math.floor((ymin - Y0) / res)); j < Math.min(ny, Math.ceil((ymax - Y0) / res)); j++) { const y = Y0 + (j + 0.5) * res; let a = 1e9, b = -1e9;
        for (let k = 0; k < h.length; k++) { const p = h[k], q = h[(k + 1) % h.length]; if ((p[1] - y) * (q[1] - y) > 0 || p[1] === q[1]) continue; const x = p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]); a = Math.min(a, x); b = Math.max(b, x); }
        if (b < a) continue; for (let c = Math.max(0, Math.round((a - X0) / res)); c < Math.min(nx, Math.round((b - X0) / res)); c++) grid[j * nx + c] = 1; } });
    // clip to the bookcases (above the kickboard, below each unit's top)
    for (let j = 0; j < ny; j++) for (let c = 0; c < nx; c++) { if (!grid[j * nx + c]) continue; const x = X0 + (c + 0.5) * res, y = Y0 + (j + 0.5) * res; if (y > topAt(x) || y < kickAt(x)) grid[j * nx + c] = 0; }
    const filled = (c, j) => c >= 0 && j >= 0 && c < nx && j < ny && grid[j * nx + c] === 1;
    const posA = []; let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9, area = 0; const z = zs + 0.018 + i * 0.0015;
    for (let j = 0; j < ny; j++) { let run = -1;
      for (let c = 0; c <= nx; c++) { let edge = false;
        if (c < nx && grid[j * nx + c]) { area++; const x = X0 + c * res, y = Y0 + j * res; bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y);
          for (let dj = -2; dj <= 2 && !edge; dj++) for (let dc = -2; dc <= 2; dc++) if (!filled(c + dc, j + dj)) { edge = true; break; } }
        if (edge && run < 0) run = c;
        if (!edge && run >= 0) { const xa = X0 + run * res, xb = X0 + c * res, ya = Y0 + j * res, yb = ya + res; posA.push(xa, ya, z, xb, ya, z, xb, yb, z, xa, ya, z, xb, yb, z, xa, yb, z); run = -1; } } }
    if (fill) { const posF = [], zf = SHELF.depth + 0.012; for (let j = 0; j < ny; j++) { let run = -1; for (let c = 0; c <= nx; c++) { const on = c < nx && grid[j * nx + c] === 1; if (on && run < 0) run = c;
        if (!on && run >= 0) { const xa = X0 + run * res, xb = X0 + c * res, ya = Y0 + j * res, yb = ya + res; posF.push(xa, ya, zf, xb, ya, zf, xb, yb, zf, xa, ya, zf, xb, yb, zf, xa, yb, zf); run = -1; } } }
      const gf = new THREE.BufferGeometry(); gf.setAttribute('position', new THREE.Float32BufferAttribute(posF, 3)); gf.computeVertexNormals();
      const mf = mk(gf, { grey: 0, col: 0x000000, noCast: true, noRecv: true }); mf.castShadow = false; mf.userData.double = true; g.add(tag(mf, `shadow ${i + 1} of Jade (mask fill)`)); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(posA, 3)); geo.computeVertexNormals();
    const m = mk(geo, { grey: 0.12, col: 0x101010, only: ['line', 'label'], noCast: true, noRecv: true }); m.castShadow = false; m.userData.double = true;
    g.add(tag(m, `shadow ${i + 1} of Jade (lamp ${i + 1})`));
    const hs = shadowOnShelf(i, P.head.toArray());
    info.push({ lamp: i + 1, lamp_world: lampPos(i), head_shadow_world: [+hs[0].toFixed(3), +hs[1].toFixed(3), zs], bbox_world: { x0: +bx0.toFixed(3), x1: +bx1.toFixed(3), y0: +by0.toFixed(3), y1: +by1.toFixed(3) },
      width_m: +(bx1 - bx0).toFixed(3), height_m: +(by1 - by0).toFixed(3), area_m2: +(area * res * res).toFixed(3) });
  }
  return { g, info };
}

// ---------------------------------------------------------------- build
export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const lt = { lamps: true, dusk: true, poi: true, ...(shot.light || {}) };
  const { g: roomG, panes } = room(shot); root.add(roomG); root.add(shelf()); root.add(lamps(lt.lamps)); root.add(yard({ ...shot, light: lt }));
  if (shot.path) root.add(pathRibbon());
  const extra = (t) => { if (t === 'poiL') return V(poiCentre(1)); if (t === 'poiR') return V(poiCentre(-1)); if (t.startsWith('lamp')) return V(lampPos(+t.slice(4) - 1)); if (t.startsWith('mark:')) { const m = MARKS[t.slice(5)]; return V(m[0], 1.5, m[1]); } return null; };
  const { figs } = stage(shot.figs, null, extra);
  for (const [who, f] of Object.entries(figs)) { root.add(f);
    if (CAST[who].guest) f.traverse((o) => { if (!o.isMesh) return; const L = o.userData.look, ty = o.geometry.type;   // faces left as paper: no eyes, nose, mouth
      if (ty === 'ConeGeometry' || L.col === 0x8a3b34 || (ty === 'SphereGeometry' && L.grey === 0.05)) { o.visible = false; o.userData.baseVisible = false; } }); }
  if (shot.hide) { root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) { o.visible = false; o.userData.baseVisible = false; } });
    for (const f of Object.values(figs)) if (shot.hide.includes(f.name)) f.traverse((o) => { if (o.isMesh) { o.visible = false; o.userData.baseVisible = false; } }); }
  hideParts(shot.hideParts, figs);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  const cam = makeCam(shot);
  let shadows = null;
  if ((shot.shadows || shot.beamMask) && figs.jade27 && lt.lamps) { shadows = shelfShadows(figs.jade27, cam, !!shot.beamMask); root.add(shadows.g); }
  if (shot.solo) root.traverse((o) => { if (o.isMesh && !shot.solo.includes(o.userData.who)) { o.visible = false; o.userData.baseVisible = false; } });   // the hard stop: her alone on paper

  const poiP = V(LIGHTS.poi.pos), duskDir = V(DUSK.dir), hex = (c) => '#' + c.toString(16).padStart(6, '0');
  const lightList = [
    ...[0, 1, 2].map((i) => ({ name: `lamp${i + 1}`, kind: LIGHTS.lamp1.kind, pos: V(lampPos(i)), aim: V(0, 1.0, SHELF.spineZ), color: hex(LAMPS.color), on: !!lt.lamps })),
    { name: 'dusk', kind: LIGHTS.dusk.kind + '; pos is a point 14 m up the beam', pos: V(5, 1.4, 2.5).addScaledVector(duskDir, -14), aim: V(5, 1.4, 2.5), color: hex(DUSK.color), on: !!lt.dusk },
    { name: 'poi', kind: LIGHTS.poi.kind, pos: poiP, color: hex(LIGHTS.poi.color), on: !!lt.poi },
  ];
  const rig = (mode) => {
    const Ls = []; if (mode === 'none' || mode === 'mask' || shot.beamMask) return Ls; const white = mode !== 'lit';
    if (lt.lamps) for (let i = 0; i < 3; i++) { const s = new THREE.SpotLight(white ? 0xffffff : LAMPS.color, white ? (lt.lampI ?? 1.0) : (lt.lampLit ?? 3.2), 0, rad(56), 0.35, 0);
      s.position.set(...lampPos(i)); s.target.position.set(0, 1.0, SHELF.spineZ); s.castShadow = true; s.shadow.camera.near = 0.25; s.shadow.camera.far = 9; s.shadow.radius = 1.5; Ls.push(s);
      if (!white) { const p = new THREE.PointLight(LAMPS.color, 0.6, 5, 1.4); p.position.set(...lampPos(i)); Ls.push(p); } }
    if (lt.dusk) { const d = new THREE.DirectionalLight(white ? 0xffffff : DUSK.color, white ? 0.9 : (lt.duskLit ?? 3.0)); const c = V(4.5, 1.2, 2.5);
      d.position.copy(c).addScaledVector(duskDir, -16); d.target.position.copy(c); d.castShadow = true; const sc = d.shadow.camera; sc.left = -9.5; sc.right = 9.5; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 32; d.shadow.radius = 1.5; Ls.push(d); }
    if (lt.poi) { const p = new THREE.PointLight(white ? 0xffffff : LIGHTS.poi.color, white ? 2.2 : (lt.poiLit ?? 14), 8, 1.3); p.position.copy(poiP); Ls.push(p); }
    Ls.push(new THREE.AmbientLight(white ? 0xffffff : LIGHTS.sky.color, white ? (lt.amb ?? 1.25) : (lt.litAmb ?? 1.3)));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, lt.fill ?? 0.6); d.position.set(-1, 3, 2.5); Ls.push(d); }
    return Ls;
  };
  const extraOut = (c, P) => {
    const out = { layout_set: 'mv10', space: shot.space || 'room', time: shot.time || null, section: shot.section || null,
      light_state: { lamps: !!lt.lamps, dusk: !!lt.dusk, poi: !!lt.poi }, amplitude_pct: shot.amp ?? 100,
      dusk: { travel_dir_world: DUSK.dir.map((x) => +x.toFixed(4)), elevation_deg: DUSK.elevationDeg, lit_above_y_at: { house_wall: +duskFloorY(YARD.x0).toFixed(2), tree: +duskFloorY(TREE.at[0]).toFixed(2) }, shaft_in_room: { at_slider: duskShaftAt(3), at_x0: duskShaftAt(0), at_left_wall: duskShaftAt(-3) } },
      footprints_world: FOOTPRINTS,
      shelf: { spine_plane_z: SHELF.spineZ, seam_x: SHELF.seam, seam_px: [P(V(SHELF.seam, 0, SHELF.spineZ)), P(V(SHELF.seam, SHELF.truth.h, SHELF.spineZ))],
        truth_half_px: [[SHELF.truth.x0, SHELF.truth.h], [SHELF.truth.x1, SHELF.truth.h], [SHELF.truth.x1, 0], [SHELF.truth.x0, 0]].map(([x, y]) => P(V(x, y, SHELF.spineZ))),
        beauty_half_px: [[SHELF.beauty.x0, SHELF.beauty.h], [SHELF.beauty.x1, SHELF.beauty.h], [SHELF.beauty.x1, 0], [SHELF.beauty.x0, 0]].map(([x, y]) => P(V(x, y, SHELF.spineZ))) },
      lemon_tree_px: P(V(TREE.at[0], TREE.canopyY, TREE.at[1])), poi_px: P(poiP) };
    if (shadows) out.three_shadows = { receiver: 'bookcase spine plane', note: 'three point lamps at one height and one distance from the spines: same magnification, shifted copies. Outline ribbons in line/label; real shadow maps in flat/lit.',
      shadows: shadows.info.map((s) => ({ ...s, head_shadow_px: P(V(s.head_shadow_world)), bbox_px: [P(V(s.bbox_world.x0, s.bbox_world.y1, SHELF.spineZ)), P(V(s.bbox_world.x1, s.bbox_world.y0, SHELF.spineZ))] })) };
    if (shot.path) out.path = { note: 'her route across the room and out to the tree, one line; floor points', world: PATH.map(([x, z]) => [x, 0, z]), px: PATH.map(([x, z]) => P(V(x, 0.02, z))), marks: Object.fromEntries(Object.entries(MARKS).map(([k, [x, z]]) => [k, P(V(x, 0.02, z))])) };
    return out;
  };
  // the mask twin (beam_<id>): white = what this shot's lights light, as declared in layout.js, everything else black.
  //   lamps: three omni lamps fill the room, so their mask is the SURFACE they are staged on: the bookcase fronts (FOOTPRINTS.
  //          lamps_on_shelf) minus Jade's three computed shadows; people in front of the shelf occlude it
  //   dusk:  the shaft through the slider as a volume (the opening above the fence shadow, swept along DUSK.dir to the
  //          floor / left wall / front wall). The dusk light in the YARD (everything above duskFloorY) is not masked.
  //   poi:   an omni source too: its ground footprint (FOOTPRINTS.poi_ground, clamped to the yard) and the flames + circles
  if (shot.beamMask) { const solids = [], WH = { grey: 1 }, want = (k) => lt[k] && (!shot.beamOnly || shot.beamOnly === k);   // beamOnly: one light's mask (twins beam_<id>__lamps / __dusk / __poi)
    if (want('dusk')) { const yb = duskFloorY(SLIDER.x); solids.push(beamSolid({ aperture: [[SLIDER.x, SLIDER.h, SLIDER.z0], [SLIDER.x, SLIDER.h, SLIDER.z1], [SLIDER.x, yb, SLIDER.z1], [SLIDER.x, yb, SLIDER.z0]], dir: DUSK.dir, sink: 0.015,
      clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, { n: [-1, 0, 0], d: -ROOM.x0 }, { n: [0, 0, 1], d: ROOM.z1 }] })); }
    if (want('lamps')) { const g = new THREE.Group(); for (const U of [SHELF.truth, SHELF.beauty]) g.add(quad([[U.x0, U.h], [U.x1, U.h], [U.x1, U.kick], [U.x0, U.kick]].map(([x, y]) => V(x, y, SHELF.depth + 0.004)), WH)); solids.push(g); }
    if (want('poi')) { const F = FOOTPRINTS.poi_ground, cl = (v, a, b) => Math.min(b, Math.max(a, v));
      solids.push(polyMesh(Array.from({ length: 72 }, (_, k) => V(cl(F.centre[0] + F.radius * Math.cos(k * Math.PI / 36), YARD.x0, YARD.x1), 0.03, cl(F.centre[2] + F.radius * Math.sin(k * Math.PI / 36), YARD.z0, YARD.z1))), WH, [0, 1, 0], 0)); }
    applyBeamMask(root, solids, { label: 'lit (mask)', cam, surfaceOnly: !!shot.beamSurf });
    if (want('poi')) root.traverse((o) => { if (o.isMesh && /^fire poi/.test(o.userData.label || '')) o.userData.look = { grey: 1, emit: 0xffffff, flatEmit: 1 }; });
    if (!want('lamps')) root.traverse((o) => { if (o.isMesh && /mask fill/.test(o.userData.label || '')) o.visible = false; }); }
  const subj = shot.subject ? V(shot.subject) : (figs.jade27 ? figs.jade27.userData.P.head.clone() : V(0, 1.4, 1.4));
  return { set: 'mv10', scene, root, cam, rig, near: shot.near ?? 0.3, far: shot.far ?? 14, figs, book: null, panes, lights: lightList,
    header: shot.header || '', shadowLine: false, shadowPolys: null, subject: subj, litBg: lt.dusk ? 0x3a3550 : 0x0a0c16, flatBg: shot.beamMask ? 0x000000 : undefined, extra: extraOut };
}
