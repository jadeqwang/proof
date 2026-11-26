// kitchen90: the kitchen's cabinetry, appliances and counter items, modelled explicitly (r4, 2026-11-26).
// Jade (r3 review, K1): "stage all the kitchen counter items and cabinetry explicitly so they don't hop around between
// clips as image models make them up". Every piece below has ONE fixed position and colour; every shot sees the same
// things. Colours are `col` (lit mode); `grey` is the flat / label value.
//
// ALL OF THIS IS INVENTED unless marked (Jade has said nothing about this kitchen's fittings): a typical c.1990 Decatur
// builder kitchen, honey-oak face-frame cabinets with raised-panel doors, almond laminate counter, almond 4 1/4 in tile
// backsplash, almond appliances, a stainless double sink with a single-lever chrome faucet. The counter items are a
// plausible set for a Chinese family's kitchen of the time (rice cooker, canisters, dish rack...). See NOTES.md.
//
// Not here (the background-art agent's): anything on the walls (clock, calendar, phone, fridge magnets / drawings).
import * as THREE from 'three';
import { mk, box, cyl, ball, limb, tag, V } from '../../engine/core.js';
import { ROOM, WINDOW, COUNTER, STOVE, FRIDGE } from './layout.js';
import { loadProps, prop } from '../_props.js';

// props phase 2 (r4 decisions, 2026-11-26): the kettle and the rice cooker are downloaded models (layout/assets/props/,
// credits in docs/credits_tools.md); the canisters, sink, faucet, cabinets and dish rack stay hand-built (work/props_audit.md)
await loadProps(['kettle', 'rice_cooker']);

// ---------------------------------------------------------------- materials (invented, flagged)
export const KLOOK = {
  oak:     { grey: 0.6,  col: 0xbd8a4f },   // honey oak (door frames, carcass faces)
  oakPan:  { grey: 0.54, col: 0xae7a42 },   // the raised panel (a touch darker: end grain / finish build-up)
  oakGap:  { grey: 0.3,  col: 0x5a4028 },   // the face frame seen in the reveals between doors
  kick:    { grey: 0.2,  col: 0x2e2620 },   // toe kick
  brass:   { grey: 0.45, col: 0x9c7a3c },   // antique-brass wire pulls, hinges
  lam:     { grey: 0.84, col: 0xe2d6bc },   // almond laminate counter
  tile:    { grey: 0.88, col: 0xece3cf },   // almond 4 1/4 in ceramic tile
  grout:   { grey: 0.62, col: 0xa89c84 },
  almond:  { grey: 0.86, col: 0xe6dcc4 },   // appliance almond
  almondD: { grey: 0.7,  col: 0xc4b89e },   // appliance trim, gaskets
  steel:   { grey: 0.62, col: 0xa9adb1 },   // stainless sink
  chrome:  { grey: 0.78, col: 0xcfd3d6 },
  black:   { grey: 0.12, col: 0x1c1c1e },
  glassD:  { grey: 0.18, col: 0x22262a },   // oven window, clock face
};

// ---------------------------------------------------------------- the fixed layout (metres; z0 = back wall face)
const z0 = ROOM.z0;
export const KIT = {
  toe: { h: 0.1, setback: 0.075 },
  frontZ: z0 + 0.57,        // base cabinet faces (doors 19 mm proud of this)
  // base cabinets, left to right along the back wall (x0 .. x1 = COUNTER.x0 .. COUNTER.x1)
  bases: [
    { x0: -1.8,  x1: -1.35, kind: 'drawers', n: 4 },                 // drawer bank (cutlery, wraps, towels)
    { x0: -1.35, x1: -0.75, kind: 'door+drawer', hinge: 'L' },       // one drawer over one door
    { x0: -0.75, x1: 0.15,  kind: 'sink' },                          // sink base: two false fronts over two doors
    { x0: 0.15,  x1: 0.25,  kind: 'filler' },                        // filler strip beside the range
  ],
  sink: { x0: -0.72, x1: 0.12, zb: z0 + 0.08, zf: z0 + 0.56, depth: 0.19, divider: 0.04 },   // double bowl, 33 x 19 in
  // upper cabinets [x0, x1, y0, y1], depth COUNTER.upperD; doors per bay
  uppers: [
    { x0: -1.8, x1: -0.93, y0: 1.37, y1: 2.13, doors: 2, label: 'left of the window' },
    { x0: 0.31, x1: 1.01,  y0: 1.82, y1: 2.13, doors: 2, label: 'over the range' },
    { x0: 1.04, x1: 1.78,  y0: 1.8,  y1: 2.13, doors: 2, label: 'over the refrigerator' },
  ],
  hood: { x0: 0.31, x1: 1.01, y0: 1.67, y1: 1.82, d: 0.46 },
  tileTop: 1.37,            // backsplash to the underside of the uppers; under the window to the sill trim
  tile: 0.108,
};

// counter items: [x, z] centres, fixed. Every one INVENTED (flagged in NOTES.md).
export const ITEMS = {
  canisters: [[-1.72, z0 + 0.13, 0.068, 0.22], [-1.585, z0 + 0.13, 0.058, 0.19], [-1.47, z0 + 0.13, 0.049, 0.16]],   // [x, z, r, h] glazed brown stoneware, oak lids
  riceCooker: { x: -1.27, z: z0 + 0.22, r: 0.122, h: 0.26 },           // white (downloaded model, 0.24 m across, 0.26 m tall)
  dishRack: { x0: -1.08, x1: -0.76, z0: z0 + 0.12, z1: z0 + 0.5 },     // white coated wire on an almond drainboard
  paperTowel: { x: -1.18, y: 1.3, z: z0 + 0.15, w: 0.28, r: 0.06 },     // under the left upper cabinet
  soap: { x: 0.19, z: z0 + 0.1 },                                       // green dish soap bottle (no label)
  sponge: { x: 0.19, z: z0 + 0.3 },                                     // yellow sponge
  kettle: { x: STOVE.x0 + 0.2, z: z0 + 0.2, rot: 0 },                   // red enamel kettle on the back-left burner (downloaded model)
};

// ---------------------------------------------------------------- pieces
// a wire pull: bar + two posts, standing off the face (face plane z = zf, facing +z). horizontal or vertical.
function pull(x, y, zf, vertical = false, len = 0.096) {
  const g = new THREE.Group(), L = KLOOK.brass, so = 0.026;
  if (vertical) { g.add(box(0.011, len, 0.011, L, [x, y, zf + so])); for (const s of [-1, 1]) g.add(box(0.008, 0.008, so, L, [x, y + s * (len / 2 - 0.006), zf + so / 2])); }
  else { g.add(box(len, 0.011, 0.011, L, [x, y, zf + so])); for (const s of [-1, 1]) g.add(box(0.008, 0.008, so, L, [x + s * (len / 2 - 0.006), y, zf + so / 2])); }
  return g;
}
// a cabinet door or drawer front on the plane z = zf (back face), spanning x0..x1, y0..y1. raised panel unless flat.
function front(x0, x1, y0, y1, zf, { panel = true, pullAt = null, vertical = false, hinge = null } = {}) {
  const g = new THREE.Group(), t = 0.019, w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  g.add(box(w, h, t, KLOOK.oak, [cx, cy, zf + t / 2]));
  if (panel && w > 0.16 && h > 0.16) { const m = Math.min(0.065, w * 0.18);
    g.add(box(w - 2 * m, h - 2 * m, 0.006, KLOOK.oakPan, [cx, cy, zf + t + 0.003]));            // the raised field
    g.add(box(w - 2 * m + 0.02, h - 2 * m + 0.02, 0.003, KLOOK.oakGap, [cx, cy, zf + t + 0.0005])); }   // its bevel shadow line
  if (pullAt) g.add(pull(pullAt[0], pullAt[1], zf + t, vertical));
  if (hinge) for (const hy of [y0 + 0.07, y1 - 0.07]) g.add(box(0.012, 0.05, 0.012, KLOOK.brass, [hinge === 'L' ? x0 - 0.002 : x1 + 0.002, hy, zf + t - 0.004]));
  return g;
}

function baseCabinets() {
  const g = new THREE.Group(), C = COUNTER, K = KIT, zf = K.frontZ, top = C.h - 0.04, gap = 0.004;
  for (const b of K.bases) {
    const cx = (b.x0 + b.x1) / 2, w = b.x1 - b.x0;
    // carcass (oak face, seen in the reveals); the sink bay is open above the bowls' bottoms
    const cTop = b.kind === 'sink' ? 0.66 : top;
    g.add(tag(box(w, cTop - K.toe.h, zf - z0, KLOOK.oakGap, [cx, K.toe.h + (cTop - K.toe.h) / 2, z0 + (zf - z0) / 2]), 'base cabinets'));
    if (b.kind === 'sink') { for (const sx of [b.x0 + 0.01, b.x1 - 0.01]) g.add(tag(box(0.02, top - cTop, zf - z0, KLOOK.oakGap, [sx, (top + cTop) / 2, z0 + (zf - z0) / 2]), 'base cabinets'));
      g.add(tag(box(w, top - cTop, 0.02, KLOOK.oakGap, [cx, (top + cTop) / 2, zf - 0.01]), 'base cabinets')); }
    g.add(tag(box(w, K.toe.h, 0.02, KLOOK.kick, [cx, K.toe.h / 2, zf - K.toe.setback]), 'toe kick'));
    const X0 = b.x0 + 0.02, X1 = b.x1 - 0.02, Y0 = K.toe.h + 0.02, Y1 = top - 0.02;
    if (b.kind === 'filler') { g.add(tag(box(w - 0.006, top - K.toe.h, 0.019, KLOOK.oak, [cx, (top + K.toe.h) / 2, zf + 0.0095]), 'base cabinets (filler strip)')); continue; }
    if (b.kind === 'drawers') { const hs = [0.14, 0.16, 0.2, Y1 - Y0 - 0.5 - 3 * gap]; let y = Y1;
      for (const h of hs) { g.add(tag(front(X0, X1, y - h, y, zf, { panel: h > 0.18, pullAt: [cx, y - h / 2] }), 'base cabinets (drawer bank)')); y -= h + gap; } continue; }
    if (b.kind === 'door+drawer') { const dh = 0.14;
      g.add(tag(front(X0, X1, Y1 - dh, Y1, zf, { panel: false, pullAt: [cx, Y1 - dh / 2] }), 'base cabinets (drawer)'));
      g.add(tag(front(X0, X1, Y0, Y1 - dh - gap, zf, { pullAt: [b.hinge === 'L' ? X1 - 0.04 : X0 + 0.04, Y1 - dh - 0.1], vertical: true, hinge: b.hinge }), 'base cabinets (door)')); continue; }
    if (b.kind === 'sink') { const dh = 0.14, xm = cx;
      for (const [a, c] of [[X0, xm - gap / 2], [xm + gap / 2, X1]]) g.add(tag(front(a, c, Y1 - dh, Y1, zf, { panel: false }), 'sink base (false front)'));
      g.add(tag(front(X0, xm - gap / 2, Y0, Y1 - dh - gap, zf, { pullAt: [xm - 0.045, Y1 - dh - 0.1], vertical: true, hinge: 'L' }), 'sink base (door)'));
      g.add(tag(front(xm + gap / 2, X1, Y0, Y1 - dh - gap, zf, { pullAt: [xm + 0.045, Y1 - dh - 0.1], vertical: true, hinge: 'R' }), 'sink base (door)')); }
  }
  return g;
}

function counterAndSink() {
  const g = new THREE.Group(), C = COUNTER, S = KIT.sink, t = 0.04, y = C.h - t / 2, zF = z0 + C.d;
  const slabAt = (x0, x1, za, zb) => g.add(tag(box(x1 - x0, t, zb - za, KLOOK.lam, [(x0 + x1) / 2, y, (za + zb) / 2]), 'counter (almond laminate)'));
  slabAt(C.x0, S.x0, z0, zF); slabAt(S.x1, C.x1, z0, zF); slabAt(S.x0, S.x1, z0, S.zb); slabAt(S.x0, S.x1, S.zf, zF);
  g.add(tag(box(C.x1 - C.x0, 0.1, 0.012, KLOOK.lam, [(C.x0 + C.x1) / 2, C.h + 0.05, z0 + 0.006]), 'counter (almond laminate)'));   // 4 in back splash lip
  // double bowl: rim, two open bowls (bottom + walls), divider, drains
  const L = KLOOK.steel, rimY = C.h + 0.003, bw = (S.x1 - S.x0 - 0.06 - S.divider) / 2, bz0 = S.zb + 0.03, bz1 = S.zf - 0.03, by = C.h - S.depth;
  for (const [x0, x1, za, zb] of [[S.x0, S.x1, S.zb, S.zb + 0.03], [S.x0, S.x1, S.zf - 0.03, S.zf], [S.x0, S.x0 + 0.03, S.zb, S.zf], [S.x1 - 0.03, S.x1, S.zb, S.zf]]) g.add(tag(box(x1 - x0, 0.006, zb - za, L, [(x0 + x1) / 2, rimY, (za + zb) / 2]), 'sink (stainless double bowl)'));
  const xd = (S.x0 + S.x1) / 2; g.add(tag(box(S.divider, 0.006, bz1 - bz0, L, [xd, C.h, (bz0 + bz1) / 2]), 'sink (stainless double bowl)'));
  for (const bx0 of [S.x0 + 0.03, xd + S.divider / 2]) { const bx1 = bx0 + bw, bc = (bx0 + bx1) / 2, bzc = (bz0 + bz1) / 2, d = S.depth;
    g.add(tag(box(bw, 0.004, bz1 - bz0, { grey: 0.5, col: 0x8f9396 }, [bc, by, bzc]), 'sink (stainless double bowl)'));
    for (const xw of [bx0, bx1]) g.add(tag(box(0.004, d, bz1 - bz0, L, [xw, by + d / 2, bzc]), 'sink (stainless double bowl)'));
    for (const zw of [bz0, bz1]) g.add(tag(box(bw, d, 0.004, L, [bc, by + d / 2, zw]), 'sink (stainless double bowl)'));
    g.add(tag(cyl(0.045, 0.045, 0.004, { grey: 0.35, col: 0x5c6064 }, [bc, by + 0.004, bzc], null, 16), 'sink drain')); }
  // single-lever chrome faucet (Delta-style), centred on the window, on the back strip; side spray to its right
  const F = KLOOK.chrome, fx = WINDOW.x, fz = z0 + 0.045;
  g.add(tag(box(0.2, 0.012, 0.05, F, [fx, C.h + 0.006, fz]), 'faucet (chrome, single lever)'));
  g.add(tag(cyl(0.024, 0.028, 0.075, F, [fx, C.h + 0.045, fz], null, 16), 'faucet (chrome, single lever)'));
  g.add(tag(limb(V(fx, C.h + 0.065, fz), V(fx, C.h + 0.075, fz + 0.21), 0.011, F), 'faucet (chrome, single lever)'));
  g.add(tag(ball(0.022, F, [fx, C.h + 0.088, fz]), 'faucet (chrome, single lever)'));
  g.add(tag(limb(V(fx, C.h + 0.1, fz), V(fx, C.h + 0.13, fz + 0.09), 0.006, F), 'faucet (chrome, single lever)'));
  g.add(tag(cyl(0.016, 0.02, 0.07, F, [fx + 0.17, C.h + 0.035, fz], null, 12), 'faucet side spray'));
  return g;
}

function backsplash() {
  const g = new THREE.Group(), K = KIT, C = COUNTER, W = WINDOW, zt = z0 + 0.004, sill = W.sill - 0.03, wx0 = W.x - W.w / 2 - W.frame, wx1 = W.x + W.w / 2 + W.frame;
  const field = (x0, x1, y0, y1) => { g.add(tag(box(x1 - x0, y1 - y0, 0.008, KLOOK.tile, [(x0 + x1) / 2, (y0 + y1) / 2, zt]), 'backsplash (almond tile)'));
    for (let y = y0 + K.tile; y < y1 - 0.01; y += K.tile) g.add(tag(box(x1 - x0, 0.003, 0.002, KLOOK.grout, [(x0 + x1) / 2, y, zt + 0.0045]), 'backsplash (almond tile)'));
    for (let x = Math.ceil((x0 - C.x0) / K.tile) * K.tile + C.x0; x < x1 - 0.005; x += K.tile) if (x > x0 + 0.005) g.add(tag(box(0.003, y1 - y0, 0.002, KLOOK.grout, [x, (y0 + y1) / 2, zt + 0.0045]), 'backsplash (almond tile)')); };
  const yb = C.h + 0.1;   // above the laminate lip
  field(C.x0, wx0, yb, K.tileTop); field(wx0, wx1, yb, sill); field(wx1, K.hood.x1, STOVE.h + 0.18, K.hood.y0);   // left run, under the window, behind the range up to the hood
  return g;
}

function upperCabinets() {
  const g = new THREE.Group(), d = COUNTER.upperD, zf = z0 + d - 0.019, gap = 0.004;
  for (const u of KIT.uppers) { const cx = (u.x0 + u.x1) / 2, w = u.x1 - u.x0, h = u.y1 - u.y0, lab = `upper cabinets (${u.label})`;
    g.add(tag(box(w, h, d - 0.019, KLOOK.oakGap, [cx, (u.y0 + u.y1) / 2, z0 + (d - 0.019) / 2]), lab));
    g.add(tag(box(w, 0.012, d - 0.019, KLOOK.oak, [cx, u.y0 + 0.006, z0 + (d - 0.019) / 2 + 0.001]), lab));   // oak underside
    const dw = (w - 0.04 - gap) / u.doors;
    for (let k = 0; k < u.doors; k++) { const a = u.x0 + 0.02 + k * (dw + gap), b = a + dw, left = k < u.doors / 2;
      g.add(tag(front(a, b, u.y0 + 0.02, u.y1 - 0.02, zf, { pullAt: [left ? b - 0.035 : a + 0.035, u.y0 + 0.1], vertical: true, hinge: left ? 'L' : 'R' }), lab)); } }
  const H = KIT.hood; g.add(tag(box(H.x1 - H.x0, H.y1 - H.y0, H.d, KLOOK.almond, [(H.x0 + H.x1) / 2, (H.y0 + H.y1) / 2, z0 + H.d / 2]), 'upper cabinets (range hood, almond)'));
  g.add(tag(box(H.x1 - H.x0 - 0.06, 0.004, H.d - 0.08, KLOOK.almondD, [(H.x0 + H.x1) / 2, H.y0 - 0.002, z0 + H.d / 2 - 0.02]), 'upper cabinets (range hood, almond)'));   // filter
  g.add(tag(box(0.12, 0.03, 0.006, KLOOK.almondD, [H.x1 - 0.12, H.y0 + 0.05, z0 + H.d + 0.003]), 'upper cabinets (range hood, almond)'));      // switch plate
  return g;
}

function range() {
  const g = new THREE.Group(), S = STOVE, cx = (S.x0 + S.x1) / 2, w = S.x1 - S.x0 - 0.01, A = KLOOK.almond, lab = 'range (almond, electric)';
  g.add(tag(box(w, S.h - 0.02, S.d - 0.02, A, [cx, (S.h - 0.02) / 2, z0 + (S.d - 0.02) / 2]), lab));
  g.add(tag(box(w, 0.02, S.d, A, [cx, S.h - 0.01, z0 + S.d / 2]), lab));                         // cooktop
  g.add(tag(box(w, 0.17, 0.06, A, [cx, S.h + 0.085, z0 + 0.03]), lab));                           // backguard
  g.add(tag(box(0.16, 0.06, 0.004, KLOOK.glassD, [cx, S.h + 0.1, z0 + 0.062]), lab + ': clock'));
  for (const dx of [-0.29, -0.2, 0.2, 0.29]) g.add(tag(cyl(0.018, 0.018, 0.02, KLOOK.almondD, [cx + dx, S.h + 0.09, z0 + 0.07], [90, 0, 0], 14), lab + ': knobs'));
  // four coil burners on chrome drip pans (2 large front-left / back-right, 2 small)
  for (const [dx, dz, r] of [[-0.18, 0.2, 0.075], [0.18, 0.2, 0.1], [-0.18, 0.46, 0.1], [0.18, 0.46, 0.075]]) {
    g.add(tag(cyl(r + 0.03, r + 0.02, 0.008, KLOOK.chrome, [cx + dx, S.h + 0.001, z0 + dz], null, 24), lab + ': drip pans'));
    for (const rr of [r, r * 0.66, r * 0.33]) { const c = mk(new THREE.TorusGeometry(rr, 0.005, 6, 28), KLOOK.black); c.rotation.x = Math.PI / 2; c.position.set(cx + dx, S.h + 0.012, z0 + dz); g.add(tag(c, lab + ': coil burners')); } }
  // oven door: window, handle; storage drawer below
  const zf = z0 + S.d;
  g.add(tag(box(w - 0.04, 0.5, 0.025, A, [cx, 0.43, zf]), lab + ': oven door'));
  g.add(tag(box(0.44, 0.22, 0.004, KLOOK.glassD, [cx, 0.46, zf + 0.0135]), lab + ': oven window'));
  g.add(tag(limb(V(cx - 0.28, 0.65, zf + 0.04), V(cx + 0.28, 0.65, zf + 0.04), 0.011, KLOOK.chrome), lab + ': oven handle'));
  for (const s of [-1, 1]) g.add(tag(box(0.015, 0.015, 0.03, KLOOK.chrome, [cx + s * 0.26, 0.65, zf + 0.022]), lab + ': oven handle'));
  g.add(tag(box(w - 0.04, 0.13, 0.02, A, [cx, 0.09, zf]), lab + ': storage drawer'));
  g.add(tag(box(0.3, 0.012, 0.01, KLOOK.almondD, [cx, 0.13, zf + 0.014]), lab + ': storage drawer'));
  return g;
}

function refrigerator() {
  const g = new THREE.Group(), F = FRIDGE, cx = (F.x0 + F.x1) / 2, w = F.x1 - F.x0, zf = z0 + F.d, A = KLOOK.almond, lab = 'refrigerator (almond, top freezer)';
  g.add(tag(box(w, F.h - 0.1, F.d - 0.04, A, [cx, 0.1 + (F.h - 0.1) / 2, z0 + (F.d - 0.04) / 2]), lab));
  g.add(tag(box(w - 0.04, 0.1, 0.02, KLOOK.black, [cx, 0.05, zf - 0.06]), lab + ': toe grille'));
  const yS = 1.15;   // split between fresh-food and freezer doors
  g.add(tag(box(w, yS - 0.1 - 0.006, 0.05, A, [cx, 0.1 + (yS - 0.1) / 2, zf - 0.025]), lab + ': fresh-food door'));
  g.add(tag(box(w, F.h - yS - 0.006, 0.05, A, [cx, yS + (F.h - yS) / 2, zf - 0.025]), lab + ': freezer door'));
  g.add(tag(box(w, 0.006, 0.045, KLOOK.almondD, [cx, yS, zf - 0.03]), lab));
  // handles on the left (hinged on the right, against the wall)
  g.add(tag(box(0.03, 0.42, 0.03, KLOOK.almondD, [F.x0 + 0.05, 0.82, zf + 0.02]), lab + ': handles'));
  g.add(tag(box(0.03, 0.22, 0.03, KLOOK.almondD, [F.x0 + 0.05, yS + 0.16, zf + 0.02]), lab + ': handles'));
  for (const hy of [0.15, yS - 0.05, yS + 0.05, F.h - 0.05]) g.add(tag(box(0.02, 0.05, 0.02, KLOOK.almondD, [F.x1 - 0.005, hy, zf]), lab + ': hinges'));
  return g;
}

function counterItems() {
  const g = new THREE.Group(), I = ITEMS, top = COUNTER.h;
  for (const [x, z, r, h] of I.canisters) { g.add(tag(cyl(r, r, h, { grey: 0.34, col: 0x7a5236 }, [x, top + h / 2, z], null, 20), 'canisters (brown stoneware)'));
    g.add(tag(cyl(r + 0.004, r + 0.004, 0.025, KLOOK.oak, [x, top + h + 0.0125, z], null, 20), 'canisters (brown stoneware)'));
    g.add(tag(ball(0.014, KLOOK.oak, [x, top + h + 0.032, z]), 'canisters (brown stoneware)')); }
  { const R = I.riceCooker;   // "Rice Cooker Lowpoly" (CC BY), 0.24 x 0.26 x 0.25 m, origin at its base: stands on the counter top; switch toward the room
    const m = prop('rice_cooker', { at: [R.x, top, R.z] });
    if (m) g.add(m);
    else { const W = { grey: 0.92, col: 0xf1eee6 };   // fallback: the hand-built one
      g.add(tag(cyl(R.r, R.r * 0.92, R.h, W, [R.x, top + R.h / 2, R.z], null, 28), 'rice cooker (white)'));
      g.add(tag(ball(R.r * 0.98, W, [R.x, top + R.h, R.z], [1, 0.32, 1]), 'rice cooker (white)')); } }
  { const D = I.dishRack, cx = (D.x0 + D.x1) / 2, cz = (D.z0 + D.z1) / 2, w = D.x1 - D.x0, d = D.z1 - D.z0, wire = { grey: 0.95, col: 0xf4f3ee }, lab = 'dish rack (white wire, almond drainboard)';
    g.add(tag(box(w + 0.04, 0.012, d + 0.03, KLOOK.almondD, [cx, top + 0.006, cz]), lab));
    for (const x of [D.x0, D.x1]) for (const y of [0.03, 0.1]) g.add(tag(limb(V(x, top + y, D.z0), V(x, top + y, D.z1), 0.003, wire), lab));
    for (const z of [D.z0, D.z1]) for (const y of [0.03, 0.1]) g.add(tag(limb(V(D.x0, top + y, z), V(D.x1, top + y, z), 0.003, wire), lab));
    for (let k = 0; k <= 8; k++) { const z = D.z0 + (k / 8) * d; for (const x of [D.x0, D.x1]) g.add(tag(limb(V(x, top + 0.015, z), V(x, top + 0.1, z), 0.0025, wire), lab)); }
    // three dinner plates standing in the slots (faces toward +-x), a bowl upside down, two glasses
    for (let k = 0; k < 3; k++) g.add(tag(cyl(0.12, 0.12, 0.012, { grey: 0.95, col: 0xf6f4ee }, [D.x0 + 0.06 + k * 0.035, top + 0.13, cz - 0.05], [0, 0, 90], 28), 'dishes drying (white plates)'));
    g.add(tag(cyl(0.035, 0.075, 0.06, { grey: 0.95, col: 0xf6f4ee }, [D.x1 - 0.08, top + 0.045, D.z1 - 0.09], null, 20), 'dishes drying (rice bowl, upside down)'));
    for (const z of [D.z1 - 0.2, D.z1 - 0.28]) g.add(tag(cyl(0.032, 0.028, 0.11, { glass: true, col: 0xd8e4e8, opacity: 0.35, noCast: true }, [D.x1 - 0.06, top + 0.07, z], null, 16), 'dishes drying (glasses)')); }
  { const P = I.paperTowel, lab = 'paper towels (under the cabinet)';
    g.add(tag(cyl(P.r, P.r, P.w, { grey: 0.96, col: 0xf7f6f2 }, [P.x, P.y, P.z], [0, 0, 90], 24), lab));
    for (const s of [-1, 1]) g.add(tag(box(0.012, 0.085, 0.07, KLOOK.oak, [P.x + s * (P.w / 2 + 0.008), P.y + 0.025, P.z]), lab)); }
  g.add(tag(cyl(0.03, 0.033, 0.2, { grey: 0.5, col: 0x5f9e4e }, [I.soap.x, top + 0.1, I.soap.z], null, 16), 'dish soap (green bottle)'));
  g.add(tag(cyl(0.01, 0.014, 0.03, { grey: 0.9, col: 0xf0f0e8 }, [I.soap.x, top + 0.215, I.soap.z], null, 10), 'dish soap (green bottle)'));
  g.add(tag(box(0.07, 0.025, 0.1, { grey: 0.78, col: 0xe8c84a }, [I.sponge.x, top + 0.0125, I.sponge.z]), 'sponge (yellow)'));
  { const K = I.kettle, y = STOVE.h + 0.017;   // "Teapot" stovetop kettle (CC BY), 0.21 x 0.24 x 0.19 m, body red enamel (props.json defaults); its base on the coil tops (coil torus y STOVE.h + 0.012, tube r 0.005)
    const m = prop('kettle', { at: [K.x, y, K.z], rot: [0, K.rot || 0, 0] });
    if (m) g.add(m);
    else { const R = { grey: 0.36, col: 0xb23a2e };   // fallback: the hand-built one
      g.add(tag(cyl(0.075, 0.1, 0.16, R, [K.x, y + 0.08, K.z], null, 24), 'kettle (red enamel)'));
      g.add(tag(ball(0.075, R, [K.x, y + 0.16, K.z], [1, 0.35, 1]), 'kettle (red enamel)')); } }
  return g;
}

export function kitchen() {
  const g = new THREE.Group();
  for (const part of [baseCabinets(), counterAndSink(), backsplash(), upperCabinets(), range(), refrigerator(), counterItems()]) g.add(part);
  return g;
}
