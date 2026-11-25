// Build one shanghai86 shot: the Xiefa living room (from layout.js) + dining room / hall / balcony + furniture + figures
// + the torn 草纸 + tea steam + the computed sun for each render mode.
import { THREE, mk, box, cyl, ball, quad, tag, V, rad, addCast, CHILD_PROP, wall, undraw, resolvePts, rng, chair, tableRect } from './common.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { CAST } from '../../engine/mannequin.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, beamMesh, beamWire, polyMesh, applyBeamMask } from '../_beam.js';
import { tearTree, tearOne, pieceMesh, centroid, area, PAPER_LOOK } from './paper.js';
import { FLAT, SCENE, FACADE_BEARING, FLOOR_ABOVE_GARDEN, ROOM, WINDOWS, WINDOW, JOIN, BALCONY, DOOR, HALL, SHELVES, SHELF_FRONT, SUN, SUN_DIR, SUN_SLOPES, BEAM, BEAM_SOURCE, SOURCES, APS,
  APERTURE_GLASS, inBeam, beamWindow, beamMargin, PLACES, PAPER, DRIFT_COUNTS, COUCH, COUCH_TO_CORNER, SHELF_CLEAR, TABLE, SIDE_TABLE, CHILD_TABLE, CHILD_CHAIR, beamFor, ARMCHAIRS, LOUNGER, TV, DINING_TABLE, SIDEBOARD, RADIATOR, CALENDAR,
  PAINTING, SCROLLS, PENDANT, PENDANT2, CLOCK, PLANT, HER_SPOT, LIGHTS } from './layout.js';

// set-local extras only (heights in metres); little Jade (3) = `jade3` and Mama = `mama86` come from ../_cast.js. Faces the film leaves as paper are flagged `undrawn`.
addCast({
  uncle: { name: 'uncle (face undrawn)', h: 1.70, kind: 'adult', skin: 0xd2a07a, hair: 0x15110f, top: 0xe8e4d8, legs: 0x4a5560, hairStyle: 'short', sleeves: 'long', undrawn: true },
  aunt: { name: 'aunt (face undrawn)', h: 1.58, kind: 'adult', skin: 0xd8a27c, hair: 0x15110f, top: 0x9a6a5a, legs: 0x3a3632, hairStyle: 'bun', sleeves: 'long', undrawn: true },
  grandma: { name: 'grandmother (face undrawn)', h: 1.50, kind: 'adult', skin: 0xcf9c78, hair: 0x6a6a6a, top: 0x4a4f5a, legs: 0x2e2e30, hairStyle: 'bun', sleeves: 'long', undrawn: true },
}, CHILD_PROP);

const PLASTER = { grey: 0.76, col: 0xc9c2ae }, PLASTER_RX = { ...PLASTER, recvShadowLine: true };
const FLOOR = { grey: 0.56, col: 0x8a5a34, recvShadowLine: true }, WOOD = { grey: 0.42, col: 0x5a3a26 }, WOOD_L = { grey: 0.55, col: 0x8a6a44 };
const STEEL = { grey: 0.32, col: 0x3c4a44 }, RENDER = { grey: 0.82, col: 0xe2d6b0 }, GLASS = { glass: true, col: 0x9ab0b8, opacity: 0.1, noCast: true, noRecv: true };
const CLOTH = (g, c, o = {}) => ({ grey: g, col: c, ...o }), LACE = { grey: 0.95, col: 0xf2efe6 };

// ---------------------------------------------------------------- architecture
function room() {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h, wallS, wallP } = ROOM; const D = DOOR, Bc = BALCONY, HL = HALL;
  const cx = (x0 + x1) / 2, wx = x1 - x0;
  // one floor, one ceiling: the living room and the old dining room joined into one space (the grandparents, before 1986)
  g.add(tag(box(wx + 2 * wallP, 0.04, z1 - z0 + wallP, FLOOR, [cx, -0.02, (z1 + z0 - wallP) / 2]), 'waxed wooden floor (打蜡地板)'));
  g.add(tag(box(wx + 2 * wallP, 0.2, z1 - z0 + wallS + wallP, { grey: 0.8, col: 0xd8d2c0 }, [cx, h + 0.1, (z1 + wallS + z0 - wallP) / 2]), 'ceiling'));
  // the trace of the old partition: a shallow soffit across the ceiling (subtle; a guess, see NOTES)
  g.add(tag(box(JOIN.w, JOIN.drop, z1 - z0, { grey: 0.8, col: 0xd8d2c0 }, [JOIN.x, h - JOIN.drop / 2, (z0 + z1) / 2]), 'soffit (where the old partition stood)'));
  // south (window) wall with both sets of French windows; the facade carried on beyond the room for the views out
  g.add(wall({ axis: 'z', at: 0, a0: x0 - wallP, a1: x1 + wallP, h: ROOM.storey, t: wallS, out: 1, look: PLASTER, label: 'window wall', holes: WINDOWS.map((W) => ({ a0: W.x0, a1: W.x1, y0: W.y0, y1: W.y1 })) }));
  for (const [x, s] of [[x0 - wallP, -1], [x1 + wallP, 1]]) g.add(tag(box(3.5, ROOM.storey + 3.4, wallS, RENDER, [x + s * 1.75, (ROOM.storey + 3.4) / 2 - 0.2, wallS / 2]), 'facade (roughcast)'));
  g.add(tag(box(wx + 2 * wallP, 3.3, wallS, RENDER, [cx, ROOM.storey + 1.65, wallS / 2]), 'facade (roughcast)'));
  g.add(wall({ axis: 'x', at: x0, a0: z0 - wallP, a1: 0, h, t: wallP, out: -1, look: PLASTER_RX, label: 'west wall' }));
  g.add(wall({ axis: 'x', at: x1, a0: z0 - wallP, a1: 0, h, t: wallP, out: 1, look: PLASTER_RX, label: 'east wall' }));
  g.add(wall({ axis: 'z', at: z0, a0: x0, a1: x1, h, t: wallP, out: -1, look: PLASTER, label: 'north wall', holes: [{ a0: D.x0, a1: D.x1, y0: 0, y1: D.h }, { a0: D.x0 + 0.04, a1: D.x1 - 0.04, y0: D.trans0, y1: D.trans1 }] }));
  // skirting (west, east, window-wall piers) and picture rail
  for (const [ax, at, a, b] of [['x', x0, z0, 0], ['x', x1, z0, 0]]) for (const [y, hh] of [[0.06, 0.12], [2.62, 0.03]]) g.add(tag(box(0.02, hh, b - a, WOOD, [at - Math.sign(at - cx) * 0.01, y, (a + b) / 2]), y < 1 ? 'skirting' : 'picture rail'));
  for (const [a, b] of [[x0, D.x0], [D.x1, x1]]) g.add(tag(box(b - a, 0.03, 0.02, WOOD, [(a + b) / 2, 2.62, z0 + 0.01]), 'picture rail'));
  // ---- the steel French windows (six leaves + four leaves), closed; glass plane z = zg
  for (const W of WINDOWS) { const zg = W.zg, f = W.frame, lw = (W.x1 - W.x0) / W.leaves, hh = W.y1 - W.y0, yc = (W.y0 + W.y1) / 2, wc = (W.x0 + W.x1) / 2, ww = W.x1 - W.x0, parts = [];
    parts.push(box(ww, f, 0.05, STEEL, [wc, W.y1 - f / 2, zg]), box(ww, 0.03, 0.06, STEEL, [wc, W.y0 + 0.015, zg]));
    for (let i = 0; i <= W.leaves; i++) parts.push(box(i % 2 ? 0.05 : f, hh, 0.045, STEEL, [W.x0 + i * lw, yc, zg]));            // stiles (meeting stiles doubled)
    for (let k = 1; k < W.lites; k++) parts.push(box(ww, W.bar, 0.025, STEEL, [wc, W.y0 + (hh * k) / W.lites, zg]));        // glazing bars
    for (let i = 0; i < W.leaves; i++) parts.push(box(0.012, 0.09, 0.02, { grey: 0.6, col: 0x9a8a5a }, [W.x0 + (i + (i % 2 ? 0.12 : 0.88)) * lw, 1.05, zg - 0.035]));
    parts.forEach((m) => g.add(tag(m, W.id)));
    g.add(tag(box(ww, hh, 0.004, GLASS, [wc, yc, zg]), 'glass'));
    // no curtains (Jade, round 4)
  }
  // ---- balcony along the whole room, parapet (solid in the east flat, iron railing in the west), balcony above = overhang
  { const bz = (Bc.z0 + Bc.z1) / 2, bl = Bc.z1 - Bc.z0, bw = Bc.x1 - Bc.x0, bc = (Bc.x0 + Bc.x1) / 2, pt = Bc.floor + Bc.parapet;
    g.add(tag(box(bw, 0.12, bl, RENDER, [bc, Bc.floor - 0.06, bz]), 'balcony'));
    g.add(tag(box(bw, 0.12, bl, RENDER, [bc, Bc.soffit + 0.06, bz]), 'balcony above (overhang)'));
    if (Bc.solid) {
      g.add(tag(box(bw, pt - Bc.floor, Bc.pT, RENDER, [bc, (pt + Bc.floor) / 2, Bc.z1 - Bc.pT / 2]), 'balcony parapet (solid)'));
      for (const x of [Bc.x0 + Bc.pT / 2, Bc.x1 - Bc.pT / 2]) g.add(tag(box(Bc.pT, pt - Bc.floor, bl - Bc.pT, RENDER, [x, (pt + Bc.floor) / 2, Bc.z0 + (bl - Bc.pT) / 2]), 'balcony parapet (solid)'));
      g.add(tag(box(bw, 0.95, Bc.pT, RENDER, [bc, Bc.soffit + 0.12 + 0.475, Bc.z1 - Bc.pT / 2]), 'balcony above: parapet'));
    } else {
      const IRON = { grey: 0.2, col: 0x2a2a2a }; g.add(tag(box(bw, 0.04, 0.04, IRON, [bc, pt, Bc.z1 - 0.03]), 'balcony railing (iron)'));
      for (let x = Bc.x0 + 0.06; x < Bc.x1; x += 0.12) g.add(tag(box(0.016, pt - Bc.floor, 0.016, IRON, [x, (pt + Bc.floor) / 2, Bc.z1 - 0.03]), 'balcony railing (iron)'));
    }
  }
  // ---- outside, for the views through the windows: garden 6.6 m down, Residences A and B, hazy winter sky (no shadows)
  { const OUT = (gr, c) => ({ grey: gr, col: c, noCast: true }), gy = -FLOOR_ABOVE_GARDEN;
    g.add(tag(box(120, 0.1, 60, OUT(0.5, 0x6a7058), [0, gy, 30]), 'garden (6.6 m below)'));
    for (const [hx, w] of [[11, 10], [-7, 10]]) { const top = gy + 10.5;
      g.add(tag(box(w, 10.5, 9, OUT(0.62, 0xb8ab94), [hx, gy + 5.25, 22]), hx > 0 ? 'Residence A' : 'Residence B'));
      if (hx < 0) { const r = box(w, 0.25, 6.6, OUT(0.4, 0x6a4a3a), [hx, top + 1.2, 22]); r.rotation.x = rad(25); g.add(tag(r, 'Residence B (tiled roof)')); } }
    const SKY = { grey: 1, col: 0xe8ecec, emit: 0xeef0ea, emitI: 1.0, flatEmit: 0.97, noCast: true, noRecv: true };
    g.add(tag(box(140, 70, 0.2, SKY, [0, 10, 45]), 'winter sky (hazy)'));
    for (const s of [-1, 1]) g.add(tag(box(0.2, 70, 60, SKY, [cx + s * 60, 10, 15]), 'winter sky (hazy)'));
  }
  // ---- hall French doors: a double-wide glazed pair in the north wall (Jade), transom (气窗) above, open into the hall
  { const zw = D.z - wallP / 2, FR = { grey: 0.45, col: 0x6a4a30 }, xc = (D.x0 + D.x1) / 2, wd = D.x1 - D.x0;
    g.add(tag(box(wd + 0.12, 0.06, wallP + 0.04, FR, [xc, D.h + 0.03, zw]), 'hall French doors (frame)'));
    for (const x of [D.x0 - 0.03, D.x1 + 0.03]) g.add(tag(box(0.06, D.trans1 + 0.03, wallP + 0.04, FR, [x, (D.trans1 + 0.03) / 2, zw]), 'hall French doors (frame)'));
    g.add(tag(box(wd + 0.12, 0.05, wallP + 0.04, FR, [xc, D.trans1 + 0.025, zw]), 'transom (气窗)'));
    for (let k = 1; k < 6; k++) g.add(tag(box(0.025, D.trans1 - D.trans0, 0.03, FR, [D.x0 + (wd * k) / 6, (D.trans0 + D.trans1) / 2, zw]), 'transom (气窗)'));
    g.add(tag(box(wd, D.trans1 - D.trans0, 0.004, GLASS, [xc, (D.trans0 + D.trans1) / 2, zw]), 'glass'));
    const lw = wd / 2 - 0.005;
    for (const [hx, sx] of [[D.x0, 1], [D.x1, -1]]) {   // hinge at each jamb on the hall side; a leaf runs toward the other jamb (sx)
      const leaf = new THREE.Group(); leaf.position.set(hx, 0, D.z - wallP); leaf.rotation.y = sx * rad(D.openDeg);   // swings north, into the hall
      const L = (w, hh, d, at) => leaf.add(box(w, hh, d, FR, at));
      L(0.06, D.h - 0.01, 0.035, [sx * 0.03, D.h / 2, 0]); L(0.06, D.h - 0.01, 0.035, [sx * (lw - 0.03), D.h / 2, 0]);
      L(lw, 0.07, 0.035, [sx * lw / 2, D.h - 0.04, 0]); L(lw, 0.2, 0.035, [sx * lw / 2, 0.1, 0]);
      for (let k = 1; k < 5; k++) L(lw - 0.1, 0.015, 0.02, [sx * lw / 2, 0.2 + ((D.h - 0.27) * k) / 5, 0]);
      leaf.add(box(lw - 0.1, D.h - 0.27, 0.004, GLASS, [sx * lw / 2, 0.2 + (D.h - 0.27) / 2, 0]));
      g.add(tag(leaf, 'hall French doors (open into the hall)'));
    }
    const DIM = { grey: 0.5, col: 0x8a8070 }, hcx = (HL.x0 + HL.x1) / 2, hw = HL.x1 - HL.x0, hzc = (HL.z0 + HL.z1) / 2, hzl = HL.z1 - HL.z0;
    g.add(tag(box(hw, 0.04, hzl, { grey: 0.4, col: 0x6a4a30 }, [hcx, -0.02, hzc]), 'hall floor'));
    g.add(tag(box(hw, 0.04, hzl, DIM, [hcx, h + 0.02, hzc]), 'hall ceiling'));
    g.add(tag(box(hw, h, 0.12, DIM, [hcx, h / 2, HL.z0 - 0.06]), 'hall wall'));
    for (const x of [HL.x0 - 0.06, HL.x1 + 0.06]) g.add(tag(box(0.12, h, hzl, DIM, [x, h / 2, hzc]), 'hall wall'));
    g.add(tag(box(1.8, 2.4, 0.6, { grey: 0.45, col: 0x7a5a3a }, [hcx + 0.9, 1.2, HL.z0 + 0.3]), 'hall: built-in closets (壁橱)'));
    g.add(tag(box(0.5, 0.02, 0.3, { grey: 0.4, col: 0x6a4a30 }, [0.6, 0.005, HL.z1 - 0.5]), 'hall: doormat'));
  }
  const W = WINDOWS[0], panes = { windows: [V(W.x1, W.y1, W.zg), V(W.x0, W.y1, W.zg), V(W.x0, W.y0, W.zg), V(W.x1, W.y0, W.zg)] };   // six windows: TL, TR, BR, BL from inside (east on the left)
  return { g, panes };
}

// ---------------------------------------------------------------- furniture
const UPH = CLOTH(0.6, 0x8a7a5a, { recvShadowLine: true }), UPH_C = CLOTH(0.66, 0x9a8a68, { recvShadowLine: true });
function couch() {   // against the WEST wall, facing +x
  const C = COUCH, g = new THREE.Group(), len = C.z1 - C.z0, d = C.x1 - C.x0, cz = (C.z0 + C.z1) / 2, cx = (C.x0 + C.x1) / 2, iw = len - 2 * C.armW;
  g.add(box(d - 0.04, 0.2, len - 0.04, UPH, [cx, 0.2, cz]));                                                     // base
  for (const z of [C.z0 + 0.05, C.z1 - 0.05]) for (const x of [C.x0 + 0.06, C.x1 - 0.05]) g.add(box(0.04, 0.1, 0.04, WOOD, [x, 0.05, z]));
  g.add(box(0.16, C.back - 0.1, len, UPH, [C.x0 + 0.08, 0.1 + (C.back - 0.1) / 2, cz]));                          // back frame
  for (const z of [C.z0 + C.armW / 2, C.z1 - C.armW / 2]) g.add(box(d, C.arm - 0.1, C.armW, UPH, [cx, 0.1 + (C.arm - 0.1) / 2, z]));   // arms
  for (let k = 0; k < 3; k++) { const zc = C.z0 + C.armW + (iw * (k + 0.5)) / 3;
    g.add(box(d - 0.2, 0.12, iw / 3 - 0.01, UPH_C, [C.x1 - (d - 0.2) / 2 - 0.01, C.seat - 0.06, zc]));             // seat cushions
    const bc = box(0.14, 0.38, iw / 3 - 0.02, UPH_C, [C.x0 + 0.22, C.seat + 0.2, zc]); bc.rotation.z = rad(10); g.add(bc);   // back cushions
    g.add(box(0.2, 0.004, 0.32, LACE, [C.x0 + 0.12, C.back + 0.003, zc]));                                          // crocheted antimacassars
  }
  return tag(g, 'three-seat couch (west wall)');
}
function armchair(a) {
  const g = new THREE.Group(); g.position.set(a.at[0], 0, a.at[1]); g.rotation.y = rad(a.yaw); const { w, d } = a, aw = 0.11;
  g.add(box(w - 0.02, 0.24, d - 0.02, UPH, [0, 0.2, 0]));
  g.add(box(w - 2 * aw, 0.1, d - 0.16, UPH_C, [0, 0.37, 0.06]));
  g.add(box(w, 0.86 - 0.1, 0.15, UPH, [0, 0.1 + 0.38, -d / 2 + 0.075]));
  for (const s of [-1, 1]) g.add(box(aw, 0.5, d, UPH, [s * (w / 2 - aw / 2), 0.35, 0]));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.035, 0.1, 0.035, WOOD, [sx * (w / 2 - 0.05), 0.05, sz * (d / 2 - 0.05)]));
  g.add(box(0.34, 0.004, 0.2, LACE, [0, 0.863, -d / 2 + 0.08]));
  return tag(g, `armchair (${a.id})`);
}
function lounger() {
  const Lr = LOUNGER, g = new THREE.Group(); g.position.set(Lr.at[0], 0, Lr.at[1]); g.rotation.y = rad(Lr.yaw);
  const RAT = { grey: 0.7, col: 0xc8a868 }, w = Lr.w;
  const slab = (len, at, tilt) => { const m = box(w - 0.1, 0.03, len, RAT, at); m.rotation.x = rad(tilt); g.add(m); };
  slab(0.72, [0, 0.66, -0.5], -52);   // reclined back
  slab(0.46, [0, 0.36, -0.02], -6);   // seat
  slab(0.5, [0, 0.27, 0.45], 14);     // leg rest
  for (const s of [-1, 1]) { const rail = box(0.04, 0.04, 1.35, RAT, [s * (w / 2 - 0.02), 0.5, -0.1]); rail.rotation.x = rad(-8); g.add(rail);
    for (const z of [-0.62, 0.1, 0.62]) g.add(box(0.035, z < 0 ? 0.62 : z > 0.5 ? 0.24 : 0.5, 0.035, RAT, [s * (w / 2 - 0.02), (z < 0 ? 0.62 : z > 0.5 ? 0.24 : 0.5) / 2, z])); }
  return tag(g, 'wicker lounge chair (藤躺椅)');
}
function furniture(shot) {
  const g = new THREE.Group();
  g.add(couch());
  { const T = TABLE, t = tableRect(T.cx, T.cz, T.w, T.d, T.h, { look: WOOD, topLook: { ...WOOD_L, recvShadowLine: true }, label: 'coffee table (茶几)' });
    t.add(box(T.w - 0.1, 0.02, T.d - 0.1, WOOD, [T.cx, 0.12, T.cz])); g.add(tag(t, 'coffee table (茶几)', true)); }
  for (const a of ARMCHAIRS) g.add(armchair(a));
  { const S = SIDE_TABLE; g.add(tableRect(S.cx, S.cz, S.w, S.d, S.h, { look: WOOD, topLook: { ...WOOD_L, recvShadowLine: true }, label: 'side table' }));
    const sh = box(S.w - 0.08, 0.02, S.d - 0.08, WOOD, [S.cx, 0.15, S.cz]); g.add(tag(sh, 'side table')); }
  g.add(lounger());
  // bookshelf cabinets along the north wall on both sides of the doors: glass-fronted shelves of books above, doors below
  { const S = SHELVES, z0 = ROOM.z0, zf = SHELF_FRONT, r = rng(253);
    for (const [a0, a1] of S.runs) { const n = Math.max(1, Math.round((a1 - a0) / 0.9)), uw = (a1 - a0) / n;
      for (let i = 0; i < n; i++) { const ux = a0 + uw * (i + 0.5), grp = new THREE.Group();
        grp.add(box(uw - 0.01, S.h, S.d, WOOD, [ux, S.h / 2, z0 + S.d / 2]));
        grp.add(box(uw - 0.06, 0.012, 0.01, WOOD_L, [ux, 0.86, zf + 0.005]));                                        // the line between the cupboards and the glazed shelves
        for (const yy of [1.25, 1.65]) grp.add(box(uw - 0.06, 0.02, 0.01, WOOD_L, [ux, yy, zf + 0.005]));
        grp.add(box(0.012, 0.8, 0.01, WOOD_L, [ux, 0.45, zf + 0.005]));
        for (const [y0b, y1b] of [[0.9, 1.23], [1.29, 1.63], [1.69, 2.0]]) { let x = ux - uw / 2 + 0.05;   // book spines behind the glass
          while (x < ux + uw / 2 - 0.08) { const bw = 0.025 + r() * 0.03, bh = (y1b - y0b) * (0.72 + r() * 0.25); grp.add(box(bw, bh, 0.012, { grey: 0.35 + r() * 0.3, col: [0x6a3a2a, 0x3a4a5a, 0x7a6a4a, 0x2a3a2a][Math.floor(r() * 4)] }, [x + bw / 2, y0b + bh / 2, zf + 0.008])); x += bw + 0.004; } }
        grp.add(box(uw - 0.02, S.h - 0.9, 0.004, GLASS, [ux, 0.9 + (S.h - 0.9) / 2, zf + 0.02]));
        g.add(tag(grp, 'bookshelf cabinets (north wall)')); } } }
  { const T = TV, cx = (T.x0 + T.x1) / 2, cz = (T.z0 + T.z1) / 2;   // east wall, facing west down the room
    g.add(tag(box(T.x1 - T.x0, T.h, T.z1 - T.z0, WOOD, [cx, T.h / 2, cz]), 'TV cabinet'));
    g.add(tag(box(0.34, 0.32, 0.42, { grey: 0.3, col: 0x3a3a38 }, [cx, T.h + 0.16, cz]), 'TV (14", under a cloth)'));
    g.add(tag(box(0.36, 0.006, 0.48, LACE, [cx, T.h + 0.323, cz]), 'TV (14", under a cloth)'));
    g.add(tag(box(0.005, 0.24, 0.44, LACE, [cx - 0.175, T.h + 0.21, cz]), 'TV (14", under a cloth)'));
    for (const [dz, c] of [[0.33, 0xb03a2a], [-0.33, 0x3a7a5a]]) { const th = new THREE.Group(); th.add(cyl(0.055, 0.06, 0.3, { grey: 0.6, col: c }, [cx + 0.05, T.h + 0.15, cz + dz])); th.add(cyl(0.03, 0.045, 0.06, { grey: 0.8, col: 0xc8c8c8 }, [cx + 0.05, T.h + 0.33, cz + dz])); g.add(tag(th, 'thermos flasks')); } }
  { const R = RADIATOR; for (let k = 0; k < 12; k++) g.add(tag(box(0.12, R.h, 0.035, { grey: 0.7, col: 0xb8b0a0 }, [R.x - 0.02, 0.12 + R.h / 2, R.z0 + ((R.z1 - R.z0) * (k + 0.5)) / 12]), 'radiator (cold)')); }
  { const C = CALENDAR; g.add(tag(box(0.01, C.h, C.w, { grey: 0.9, col: 0xe8dcc8 }, [ROOM.x1 - 0.006, C.y, C.z]), 'wall calendar (挂历)')); }
  // west wall: one large framed traditional Chinese painting over the couch, calligraphy hanging scrolls (挂轴) beside it
  { const Pn = PAINTING, x = ROOM.x0 + 0.02;
    g.add(tag(box(0.035, Pn.h + 0.1, Pn.w + 0.1, { grey: 0.3, col: 0x3a2a1a }, [x, Pn.y, Pn.z]), 'framed traditional Chinese painting (国画)'));
    g.add(tag(box(0.01, Pn.h, Pn.w, { grey: 0.88, col: 0xe4dcc4, recvShadowLine: true }, [x + 0.02, Pn.y, Pn.z]), 'framed traditional Chinese painting (国画)'));
    for (const S of SCROLLS) { const yc = S.top - S.h / 2, grp = new THREE.Group();
      grp.add(box(0.006, S.h, S.w, { grey: 0.9, col: 0xece4d0, recvShadowLine: true }, [ROOM.x0 + 0.006, yc, S.z]));
      for (const y of [S.top, S.top - S.h]) grp.add(cyl(0.012, 0.012, S.w + 0.06, { grey: 0.3, col: 0x3a2a1a }, [ROOM.x0 + 0.015, y, S.z], [90, 0, 0], 10));
      grp.add(cyl(0.001, 0.001, 0.25, { grey: 0.2, col: 0x222222 }, [ROOM.x0 + 0.006, S.top + 0.12, S.z], null, 4));
      g.add(tag(grp, 'calligraphy hanging scrolls (书法挂轴)')); } }
  g.add(tag(cyl(0.11, 0.11, 0.05, { grey: 0.82, col: 0xe8e4d8 }, [ROOM.x1 - 0.03, CLOCK.y, CLOCK.z], [0, 0, 90]), 'wall clock'));
  g.add(tag(cyl(0.12, 0.09, 0.22, { grey: 0.5, col: 0x8a5a3a }, [PLANT[0], 0.11, PLANT[1]]), 'potted plant'));
  g.add(tag(ball(0.2, { grey: 0.45, col: 0x4a6a3a }, [PLANT[0], 0.4, PLANT[1]], [1, 0.9, 1]), 'potted plant'));
  for (const P of [PENDANT, PENDANT2]) { g.add(tag(cyl(0.004, 0.004, P.drop, { grey: 0.1, col: 0x111111 }, [P.x, ROOM.h - P.drop / 2, P.z], null, 6), 'ceiling lights (off)'));
    g.add(tag(cyl(0.04, 0.2, 0.12, { grey: 0.88, col: 0xeeeae0 }, [P.x, ROOM.h - P.drop - 0.04, P.z], null, 20), 'ceiling lights (off)')); }
  // the old dining room's end: round table, chairs, sideboard
  { const T = DINING_TABLE, [xc, zc] = T.at; g.add(tableRect(xc, zc, T.l, T.w, T.h, { look: WOOD, topLook: WOOD_L, label: 'dining table (long, rectangular: Jade not sure)' }));
    for (const i of [-1, 0, 1]) for (const s of [-1, 1]) g.add(chair(xc + i * 0.6, zc + s * (T.w / 2 + 0.2), s > 0 ? 180 : 0, { look: WOOD, label: 'dining chairs' }));   // three a side
    for (const s of [-1, 1]) g.add(chair(xc + s * (T.l / 2 + 0.22), zc, s > 0 ? -90 : 90, { look: WOOD, label: 'dining chairs' }));                 // one at each end
  }
  { const C = CHILD_TABLE; g.add(tableRect(C.cx, C.cz, C.w, C.d, C.h, { look: WOOD_L, topLook: { ...WOOD_L, recvShadowLine: true }, top: 0.025, leg: 0.035, label: 'her small wooden table and chair' }));
    const H = CHILD_CHAIR; g.add(chair(H.at[0], H.at[1], H.yaw, { seat: H.seat, w: H.w, d: H.d, back: H.back, look: WOOD_L, label: 'her small wooden table and chair' })); }
  {
    const S = SIDEBOARD; g.add(tag(box(S.x1 - S.x0, S.h, S.z1 - S.z0, WOOD, [(S.x0 + S.x1) / 2, S.h / 2, (S.z0 + S.z1) / 2]), 'sideboard (碗橱)')); }
  return g;
}

// ---------------------------------------------------------------- the paper
const flatMap = (cx, cz, yaw, y, flip = 1) => { const c = Math.cos(yaw), s = Math.sin(yaw);   // sheet (u, v) centred on (cx, cz), turned by yaw
  return (u0, v0) => (u, v) => { const a = u - u0, b = (v - v0) * flip; return V(cx + a * c + b * s, y, cz - a * s + b * c); }; };
// the hero pieces: generation n of ONE sheet (n = 1, 2 held; 4, 8 laid out on the clear patch, a little apart)
function heroPieces(n, figs, out) {
  const g = new THREE.Group(); if (!n) return g; const depth = Math.round(Math.log2(n)); const P = tearTree(77 + depth, depth), F = PLACES.focus;
  const sc = [PAPER.w / 2, PAPER.h / 2];
  if (n <= 2 && figs.jade3) {   // held up in front of her, tipped toward her eyes; u across (world z), v away from her (world -x, rising)
    const Q = figs.jade3.userData.P, mid = Q.handL.clone().add(Q.handR).multiplyScalar(0.5), tilt = rad(28);
    const across = Q.handL.clone().sub(Q.handR).setY(0).normalize(), fwd = across.clone().cross(V(0, 1, 0)).normalize();   // her left, her forward
    P.forEach((q, i) => { const hp = n === 1 ? mid : (i === 0 ? Q.handR : Q.handL);
      const c = centroid(q), base = hp.clone().addScaledVector(fwd, 0.03);
      // held by the near (u = 0) edge: v runs across between her hands (world z), u away from her (world -x), tipped up
      const map = (u, v) => { const a = v - c[1], b = u - 0.012; return base.clone().addScaledVector(fwd, b * Math.cos(tilt)).add(V(0, b * Math.sin(tilt), 0)).addScaledVector(across, a); };
      const m = pieceMesh(q, (u, v) => map(u, v)); g.add(m); out.push({ gen: depth, world: map(c[0], c[1]).toArray() }); });
  } else {
    const spread = 0.012 + 0.004 * depth;
    P.forEach((q, i) => { const c = centroid(q), dx = c[0] - sc[0], dy = c[1] - sc[1], k = Math.hypot(dx, dy) || 1;
      const ox = (dx / k) * spread * 1.4, oy = (dy / k) * spread * 1.4, yaw = rad(((i * 37) % 11) - 5);
      // sheet u -> world -z (across the table), v -> world -x... laid with the long side along the table (world z)
      const map = (u, v) => { const a = (u - c[0]), b = (v - c[1]); const ca = Math.cos(yaw), sa = Math.sin(yaw);
        const lx = (c[0] - sc[0]) + ox + a * ca - b * sa, lz = (c[1] - sc[1]) + oy + a * sa + b * ca; return V(F[0] - lx, F[1] + 0.0004, F[2] + lz); };
      g.add(pieceMesh(q, map)); out.push({ gen: depth, world: map(c[0], c[1]).toArray() }); });
  }
  return tag(g, `草纸: generation ${n} (${n} piece${n > 1 ? 's' : ''}, the gold dots)`);
}
// the stack she brought (34 sheets, straight mill edges)
function stack() {
  const g = new THREE.Group(), S = PLACES.stack, n = 9, r = rng(34);
  for (let k = 0; k < n; k++) { const m = box(PAPER.w, (PAPER.stack * PAPER.t) / n, PAPER.h, PAPER_LOOK, [S[0] + (r() - 0.5) * 0.006, TABLE.h + ((k + 0.5) * PAPER.stack * PAPER.t) / n, S[1] + (r() - 0.5) * 0.006]); m.rotation.y = rad((r() - 0.5) * 5); g.add(m); }
  return tag(g, `草纸: the stack she brought (${PAPER.stack} sheets, 16 x 23 cm)`);
}
// the drift: torn pieces of every generation on the table and in a drift round her on the floor (and a few on the couch)
function drift(shot, figs) {
  const g = new THREE.Group(); const D = PLACES.drift, r = rng(D.seed), F = PLACES.focus, T = TABLE, C = COUCH;
  const occ = new Map(); const cell = (x, z) => `${Math.round(x / 0.03)},${Math.round(z / 0.03)}`;
  const gauss = () => (r() + r() + r() + r() - 2) / 0.58;
  const onTable = (x, z) => Math.abs(x - T.cx) < T.w / 2 - 0.02 && Math.abs(z - T.cz) < T.d / 2 - 0.02;
  const blocked = (x, z) => (Math.abs(x - F[0]) < 0.14 && Math.abs(z - F[2]) < 0.19) || PLACES.mugs.some(([mx, mz]) => Math.hypot(x - mx, z - mz) < 0.06)
    || (Math.abs(x - PLACES.stack[0]) < 0.1 && Math.abs(z - PLACES.stack[1]) < 0.13);
  const stats = { table: 0, floor: 0, couch: 0, by_gen: {} };
  for (const [gs, count] of Object.entries(DRIFT_COUNTS)) { const gen = +gs;
    for (let i = 0; i < count; i++) {
      const q = tearOne(D.seed * 1000 + gen * 97 + i * 7, gen); const c = centroid(q);
      let x, z, y, where; const roll = r();
      if (roll < (gen <= 4 ? 0.6 : 0.18)) {   // on the table (the big pieces mostly)
        let k = 0; do { x = T.cx + (r() - 0.5) * (T.w - 0.08); z = T.cz + (r() - 0.5) * (T.d - 0.08); } while (blocked(x, z) && k++ < 30); if (blocked(x, z)) continue; y = T.h + 0.0004; where = 'table';
      } else if (roll < (gen <= 4 ? 0.65 : 0.23)) { x = C.x1 - 0.08 - r() * 0.4; z = C.z0 + 0.25 + r() * (C.z1 - C.z0 - 0.5); y = C.seat + 0.001; where = 'couch'; }
      else { x = D.at[0] + gauss() * 0.34; z = D.at[1] + gauss() * 0.36; const A0 = ARMCHAIRS[0];
        if ((x < C.x1 + 0.01 && z < C.z1 + 0.01 && z > C.z0 - 0.01) || Math.hypot(x - A0.at[0], z - A0.at[1]) < 0.4 || x < ROOM.x0 + 0.02) continue;
        if (onTable(x, z) && r() < 0.5) continue; y = 0.0004; where = 'floor'; }
      const key = cell(x, z), nOcc = (occ.get(key) || 0) + 1; occ.set(key, nOcc);
      y += (nOcc - 1) * 0.0007 + (where === 'floor' ? Math.max(0, 0.012 * Math.exp(-((x - D.at[0]) ** 2 + (z - D.at[1]) ** 2) / 0.05)) * r() : 0);
      const yaw = r() * Math.PI * 2, tilt = where === 'floor' ? (r() - 0.5) * 0.25 : 0;
      const map = (u, v) => { const a = u - c[0], b = v - c[1], ca = Math.cos(yaw), sa = Math.sin(yaw), lx = a * ca - b * sa, lz = a * sa + b * ca; return V(x + lx, y + lz * tilt, z + lz); };
      g.add(pieceMesh(q, map)); stats[where]++; stats.by_gen[gen] = (stats.by_gen[gen] || 0) + 1;
    }
  }
  g.userData.stats = stats;
  return tag(g, '草纸: the drift (torn halves ... 1/512, ragged edges)');
}
// porcelain tea mugs with green tea, and the steam rising through the beam
function teaAndSteam() {
  const g = new THREE.Group(), PORC = { grey: 0.9, col: 0xf0ede4 }, steamPts = []; const r = rng(7);
  PLACES.mugs.forEach(([x, z], i) => {
    const y0 = TABLE.h; g.add(tag(cyl(0.038, 0.034, 0.095, PORC, [x, y0 + 0.0475, z]), 'mugs of green tea'));
    g.add(tag(cyl(0.032, 0.032, 0.003, { grey: 0.6, col: 0x9aa050 }, [x, y0 + 0.085, z]), 'mugs of green tea'));
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 14, Math.PI), new THREE.MeshBasicMaterial()); hd.userData.look = PORC; hd.castShadow = true; hd.receiveShadow = true;
    hd.position.set(x + 0.038, y0 + 0.05, z); hd.rotation.set(0, 0, -Math.PI / 2); g.add(tag(hd, 'mugs of green tea'));
    if (i === 0) g.add(tag(cyl(0.042, 0.042, 0.008, PORC, [x - 0.07, y0 + 0.004, z - 0.06]), 'mug lid (off)'));
    for (let w = 0; w < 2; w++) {   // two wisps per mug
      const pts = []; const ph = r() * 6.28, sx = (r() - 0.5) * 0.06, sz = (r() - 0.5) * 0.06;
      for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push(V(x + sx * t + 0.018 * Math.sin(ph + t * 7.5) * t, y0 + 0.1 + 0.42 * t, z + sz * t + 0.018 * Math.cos(ph + t * 6) * t)); }
      const curve = new THREE.CatmullRomCurve3(pts); steamPts.push(...pts.map((p) => p.toArray()));
      const tube = (look) => { const m = mk(new THREE.TubeGeometry(curve, 30, 0.0022 + 0.0012 * w, 5, false), look); m.castShadow = false; m.receiveShadow = false; return m; };
      g.add(tag(tube({ grey: 0.97, col: 0xffffff, only: ['label', 'line'], noCast: true, noRecv: true }), 'steam (green tea)'));
      g.add(tag(tube({ glass: true, col: 0xfff6e0, opacity: 0.22, noCast: true, noRecv: true }), 'steam (green tea)'));
    }
  });
  g.userData.steamPts = steamPts;
  return g;
}

const NAMES = { focus: PLACES.focus, uncleHands: PLACES.uncleHands, table: [TABLE.cx, TABLE.h, TABLE.cz], stack: [PLACES.stack[0], TABLE.h + 0.01, PLACES.stack[1]],
  mugs: [PLACES.mugs[0][0], TABLE.h + 0.2, PLACES.mugs[0][1]], window: [0, 1.2, 0], door: [0, 1.3, DOOR.z], pool: [-0.6, 0, -2.6],
  couch: [(COUCH.x0 + COUCH.x1) / 2, COUCH.seat, (COUCH.z0 + COUCH.z1) / 2], dining: [DINING_TABLE.at[0], 1.0, DINING_TABLE.at[1]] };
const solidTex = (css) => { const c = document.createElement('canvas'); c.width = c.height = 4; const g = c.getContext('2d'); g.fillStyle = css; g.fillRect(0, 0, 4, 4); return new THREE.CanvasTexture(c); };
const r3 = (v) => (v.toArray ? v.toArray() : v).map((x) => +x.toFixed(3));

export function build(shot, { makeCam }) {
  // the sun: the set's SCENE, or a per-shot override (shot.scene: { date, time } or { cheat: { elev, rel } }; the light study)
  const DEFB = { SUN, SUN_DIR, SUN_SLOPES, BEAM_SOURCE, SOURCES, APS, APERTURE_GLASS, inBeam, beamWindow, beamMargin };
  const BX = shot.scene ? beamFor({ ...SCENE, ...shot.scene }) : DEFB;
  { const { SUN, SUN_DIR, SUN_SLOPES, BEAM_SOURCE, SOURCES, APS, APERTURE_GLASS, inBeam, beamWindow, beamMargin } = BX;
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const { g: roomG, panes } = room(); root.add(roomG); root.add(furniture(shot));
  const extra = (t) => (NAMES[t] ? V(NAMES[t]) : null);
  const { figs } = stage(shot.figs, null, extra);
  for (const [who, f] of Object.entries(figs)) { if (CAST[who].undrawn) undraw(f); root.add(f); }
  const tea = teaAndSteam(); if (shot.state !== 'A') root.add(tea);   // the tea (and its steam) is a week-later detail: state A keeps the table bare
  let dr = null; const hero = [];
  if (shot.state !== 'A') { root.add(stack()); dr = drift(shot, figs); root.add(dr); root.add(heroPieces(shot.tissue ?? 8, figs, hero)); }
  const ballAt = (F) => F.uncle.userData.P.handL.clone().add(V(0, 0.024, 0));   // in his cupped left palm, under the right pinch
  if (shot.state === 'A' && figs.uncle) root.add(tag(ball(0.012, PAPER_LOOK, ballAt(figs).toArray()), 'something small (he shapes it)'));
  // the beam: the lit aperture (overhang, parapet, reveals) swept along the sun into the room, clipped by its planes
  const clip = [{ name: 'floor', n: [0, -1, 0], d: 0 }, { name: 'east wall', n: [1, 0, 0], d: ROOM.x1 }, { name: 'west wall', n: [-1, 0, 0], d: -ROOM.x0 },
    { name: 'north wall', n: [0, 0, -1], d: -ROOM.z0 }, { name: 'ceiling', n: [0, 1, 0], d: ROOM.h }];
  // one solid per window set; footprints = the FINAL faces lying on each plane (_beam.js records a cap when its plane
  // is cut, before later planes trim it)
  const solids = SOURCES.map((src) => { const so = beamSolid({ aperture: src, dir: SUN_DIR, clip });
    for (const pl of clip) { const N = V(pl.n), f = so.faces.find((F) => F.every((p) => Math.abs(N.dot(p) - pl.d) < 1e-4)); if (f) so.caps[pl.name] = f; else delete so.caps[pl.name]; }
    return so; });
  const sunks = SOURCES.map((src) => beamSolid({ aperture: src, dir: SUN_DIR, clip, sink: 0.015 }));
  const solid = solids[0] || { caps: {}, faces: [] };   // the six windows' shaft (the one aimed at the doors)
  if (!shot.beamMask) solids.forEach((so, i) => {
    root.add(tag(beamWire(so, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }, 0.006), 'sun beam (volume edges)'));
    root.add(tag(beamMesh(sunks[i], { map: solidTex('rgba(255,190,30,0.10)'), only: ['label'] }), 'sun beam (volume)'));
    root.add(tag(beamMesh(sunks[i], { glass: true, col: SUN.color, opacity: 0.08 }), 'sun beam (volume)'));
    for (const [nm, n] of [['floor', [0, 1, 0]], ['east wall', [-1, 0, 0]], ['west wall', [1, 0, 0]], ['north wall', [0, 0, 1]]]) if (so.caps[nm]) root.add(tag(polyMesh(so.caps[nm], { map: solidTex('rgba(255,160,0,0.32)'), only: ['label'], noRecv: true }, n, 0.003), `sun on the ${nm}`));
  });
  if (shot.hide) root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) { o.visible = false; o.userData.baseVisible = false; } });
  resolvePts(shot, (t, F) => (t === 'ball' && F.uncle ? ballAt(F).toArray() : NAMES[t] || null), figs);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  // the sun: one directional light whose shadow frustum holds the whole flat, so only the window's shaft is sunlit
  const C0 = V(2.25, 1.2, -3.4);   // the shadow frustum holds the long room, the hall and the balcony
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); s.target.position.copy(C0); s.position.copy(C0).addScaledVector(V(SUN_DIR), -14); s.castShadow = true;
    const c = s.shadow.camera; c.left = -6.0; c.right = 6.0; c.top = 7.0; c.bottom = -7.0; c.near = 1; c.far = 30; c.updateProjectionMatrix(); s.shadow.bias = -0.0005; s.shadow.normalBias = 0.005; s.shadow.radius = 1.2; return s; };
  const lightList = [{ name: 'sun_through_windows', kind: LIGHTS.sun.kind, pos: C0.clone().addScaledVector(V(SUN_DIR), -14), aim: C0, color: '#fff1d0', on: true },
    { name: 'sky', kind: LIGHTS.sky.kind, pos: V(0, 1.4, -0.4), color: '#cfd8e0', on: true }, { name: 'north', kind: LIGHTS.north.kind, pos: V(4.75, 1.5, -0.6), color: '#c8d0d8', on: true }];
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSun(0xffffff, 6)];
    if (mode === 'lit') { const sky = new THREE.PointLight(0xcfd8e0, 1.3, 7, 1.2); sky.position.set(0, 1.5, -0.45);
      const north = new THREE.PointLight(0xc8d0d8, 0.6, 6, 1.4); north.position.set(4.75, 1.6, -0.6);
      const bounce = new THREE.PointLight(0xffe2b0, 0.55, 3.2, 1.4); bounce.position.set(-1.0, 0.25, -3.2);
      return [mkSun(SUN.color, 6.5), sky, north, bounce, new THREE.AmbientLight(0x8a8478, shot.light?.amb ?? 0.7)]; }
    const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(-1, 3, 2);
    return [mkSun(0xffffff, 2.6), new THREE.AmbientLight(0xffffff, 1.45), d];
  };
  const extraOut = (c, P) => {
    const inB = {}; for (const [who, f] of Object.entries(figs)) { const Q = f.userData.P; inB[who] = Object.fromEntries(['head', 'eyes', 'handL', 'handR', 'hip'].map((k) => [k, { in: inBeam(Q[k].toArray()), margin_m: beamMargin(Q[k].toArray()) }])); }
    const steam = tea.userData.steamPts; const steamIn = steam.filter((p) => inBeam(p)).length;
    const fp = (nm) => solid.caps[nm] ? { world: solid.caps[nm].map(r3), px: solid.caps[nm].map((p) => P(p)) } : null;
    const foot = solid.caps.floor || [];
    return { beam: { kind: BEAM.kind, travel_dir: SUN_DIR.map((v) => +v.toFixed(4)), elevation_deg: SUN.elev,
      sun: { date: SCENE.date, time: SCENE.time + ' CST (UTC+8)', lat: SCENE.lat, lon: SCENE.lon, elevation_deg: SUN.elev, azimuth_deg: SUN.az, west_of_facade_normal_deg: SUN.rel, profile_angle_deg: SUN.profile_deg,
        facade_bearing_deg: FACADE_BEARING, flat: FLAT, per_metre_into_room: SUN_SLOPES, status: 'date and time are a staging choice (Jade remembers neither season nor hour), picked with sweep.mjs; east flat and 三楼 are facts' },
      source_world: BEAM_SOURCE, source_px: BEAM_SOURCE.map((p) => P(V(p))), aperture_glass_world: APERTURE_GLASS, shaded_by: BEAM.shading,
      sources_world: SOURCES, windows: APS.map((a, i) => ({ id: a.id, source_world: a.source, shaded_by: a.half, floor_world: solids[i]?.caps.floor ? solids[i].caps.floor.map(r3) : null, floor_px: solids[i]?.caps.floor ? solids[i].caps.floor.map((p) => P(p)) : null })),
      footprint_floor_world: foot.map(r3), footprint_floor_px: foot.map((p) => P(p)), footprint_east_wall: fp('east wall'), footprint_west_wall: fp('west wall'), footprint_north_wall: fp('north wall'),
      corner_order: 'source: the lit opening on the inner face of the window wall, a convex polygon starting top-east (TL as seen from inside), then top-west, down the west side, along the bottom; footprints: the clipped caps of the beam solid on each plane',
      note: 'the lit volume is the aperture swept along travel_dir and clipped by the room; render the mask twin beam_<id> (furniture and figures occlude it); cast shadows are in flat / lit', in_beam: inB,
      steam_points_in_beam: `${steamIn} of ${steam.length}`, mugs_in_beam: PLACES.mugs.map(([x, z]) => inBeam([x, TABLE.h + 0.1, z])), focus_in_beam: inBeam(PLACES.focus), stack_in_beam: inBeam([PLACES.stack[0], TABLE.h + 0.01, PLACES.stack[1]]),
      mother_margin_m: figs.mama86 ? Math.max(...['head', 'hip', 'handL', 'handR'].map((k) => beamMargin(figs.mama86.userData.P[k].toArray().map((v, i) => (i === 2 ? Math.max(v, ROOM.z0 + 0.01) : v))))) : null,
      floor_reach_m: foot.length ? +Math.max(...foot.map((p) => -p.z)).toFixed(2) : null, north_wall_m: -ROOM.z0, her_spot: HER_SPOT, couch_to_corner_m: COUCH_TO_CORNER, shelf_clearance_m: SHELF_CLEAR,
      door_gap_m: (() => { const pts = SOURCES.length ? solids.flatMap((so) => so.caps.floor || []) : []; let best = 9; for (let x = ROOM.x0 + 0.02; x < ROOM.x1; x += 0.025) for (let z = -0.02; z > ROOM.z0; z -= 0.025) if (inBeam([x, 0.001, z])) best = Math.min(best, Math.hypot(Math.max(DOOR.x0 - x, 0, x - DOOR.x1), z - ROOM.z0)); return +best.toFixed(2); })() },
      tissue: shot.state === 'A' ? null : { generation_pieces: shot.tissue ?? 8, gold_dot_px: hero.map((h) => P(V(h.world))), gold_dot_world: hero.map((h) => h.world.map((v) => +v.toFixed(3))),
        sheet_cm: [PAPER.w * 100, PAPER.h * 100], stack_sheets: PAPER.stack, drift: dr ? dr.userData.stats : null },
      state: shot.state === 'A' ? 'A: the uncle explains (no drift yet)' : 'B: a week later, the drift', tissue_pieces: shot.tissue || 0, times: shot.t || null,
      points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'handL', 'handR', 'hip'].map((k) => [k, r3(f.userData.P[k])]))])) };
  };
  if (shot.beamMask) applyBeamMask(root, sunks, { label: 'sun shaft (mask)', cam, surfaceOnly: !!shot.beamSurf });
  return { set: 'shanghai86', scene, root, cam, rig, near: shot.near ?? 0.05, far: shot.far ?? 60, figs, book: null, panes, lights: lightList,
    edgeNT: shot.edgeNT, header: shot.header || '', shadowLine: !shot.beamMask && shot.beamLine !== false, shadowPolys: null, subject: V(shot.subject || NAMES.pool), litBg: 0x15130f, flatBg: shot.beamMask ? 0x000000 : undefined, extra: extraOut };
  }
}
