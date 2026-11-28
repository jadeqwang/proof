// shanghai86 joinery and upholstery in real detail (r4, 2026-11-26, Jade's r3 review of V1f / V1g):
//   hallDoorLeaves  the four glazed hall-door leaves, folded back in pairs into the hall, hung on real butt hinges
//                   (knuckles, pins with ball tips, leaves, screws) at the jambs and at each fold; architraves
//   bookcases       the north-wall bookcase units: plinth, panelled cupboards below, a counter ledge, glazed doors above,
//                   shelf boards, uprights, a pale back, and books as individual spines (plain, no lettering)
//   armchair        an upholstered 1950s-80s Shanghai armchair (单人沙发): tapered legs, sprung seat, loose cushion,
//                   rolled arms, a curved back, crocheted covers on the back and arms
//   slippers        cotton-padded house slippers (棉拖鞋) on every adult's feet, over socks (heels bare of the slipper)
// Kept out of build.js so that the background-art agent's edits there and mine do not collide.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mk, box, cyl, ball, tag, V, rad } from '../../engine/core.js';
import { ROOM, DOOR, SHELVES, SHELF_FRONT, COUCH } from './layout.js';
import * as ART from './art.js';   // the background-art agent's fixed greeked spine textures (spineArt), used on every upright book
import { artPlane, artFromCanvas } from '../_art.js';
import { newspaperCanvas } from './textures.js';

const rbox = (w, h, d, r, look, at, rot) => { const m = mk(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)), look); if (at) m.position.set(...at); if (rot) m.rotation.set(...rot.map(rad)); return m; };
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- hall doors
// 1930s Shanghai apartment joinery: varnished teak-stained timber French doors, each leaf a glazed sash over a raised
// bottom panel, hung on cast-brass loose-pin butt hinges (100 x 75 mm, five knuckles, ball-tipped pin), three per leaf:
// top hinge 180 mm below the head, bottom hinge 250 mm above the floor, the middle one halfway (the usual setting out).
// Each side's pair folds: leaf A on the jamb (its hinges' knuckles on the hall side of the jamb), leaf B on A's far
// edge, folded flat back against A (knuckles at the fold, B's face 13 mm off A's: the knuckle's diameter).
const TEAK = { grey: 0.42, col: 0x6a4a30, mat: 'sapele' }, TEAK_D = { grey: 0.36, col: 0x553a24, mat: 'sapele' }, BRASS = { grey: 0.7, col: 0xa8904e }, BRASS_D = { grey: 0.55, col: 0x7a6838 };
const GLASS = { glass: true, col: 0x9ab0b8, opacity: 0.1, noCast: true, noRecv: true };
const HINGE = { h: 0.1, w: 0.035, t: 0.0028, r: 0.0065, knuckles: 5, gap: 0.0008, tip: 0.0058 };
export const HINGE_Y = (H) => { const top = H - 0.18 - HINGE.h / 2, bot = 0.25 + HINGE.h / 2; return [bot, (top + bot) / 2, top]; };

// one butt hinge, built about its pin axis (local y up, axis through the origin); plate directions u1, u2 (unit, in xz):
// each leaf plate runs from the knuckle out along u_i, lying in the plane spanned by u_i and y, its face normal n_i
function buttHinge(u1, n1, u2, n2, o1 = 0, o2 = 0) {   // o_i: each plate's offset from the axis along its n_i (it lies on the face it is mortised into)
  const g = new THREE.Group(), H = HINGE, kh = (H.h - (H.knuckles - 1) * H.gap) / H.knuckles;
  for (let k = 0; k < H.knuckles; k++) g.add(cyl(H.r, H.r, kh, BRASS, [0, -H.h / 2 + kh / 2 + k * (kh + H.gap), 0], null, 16));   // knuckles (the gaps read as rings)
  for (const s of [-1, 1]) { g.add(cyl(0.0022, 0.0022, 0.004, BRASS_D, [0, s * (H.h / 2 + 0.002), 0], null, 10)); g.add(ball(H.tip, BRASS, [0, s * (H.h / 2 + 0.004 + H.tip * 0.8), 0])); }   // pin ends with ball finials
  for (const [u, n, o] of [[V(u1), V(n1), o1], [V(u2), V(n2), o2]]) {
    const plate = box(H.w, H.h, H.t, BRASS, null); const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, V(0, 1, 0), new THREE.Vector3().crossVectors(u, V(0, 1, 0))));   // right-handed (the plate is symmetric through its thickness)
    const c = u.clone().multiplyScalar(H.r + H.w / 2 - 0.003).addScaledVector(n, o); plate.quaternion.copy(q); plate.position.copy(c); g.add(plate);
    for (const y of [-0.032, 0, 0.032]) { const sc = cyl(0.0042, 0.0042, 0.0012, BRASS_D, null, null, 12), at = c.clone().addScaledVector(u, 0.004).add(V(0, y, 0)).addScaledVector(n, H.t / 2 + 0.0006);
      sc.quaternion.setFromUnitVectors(V(0, 1, 0), n); sc.position.copy(at); g.add(sc);   // countersunk screw heads with a slot
      const sl = box(0.0075, 0.0009, 0.0009, { grey: 0.25, col: 0x3a3020 }, null); sl.quaternion.copy(q); sl.position.copy(at).addScaledVector(n, 0.0007); g.add(sl); } }
  return g;
}
// one leaf, local frame: x 0 (hinge edge) .. lw, y 0 .. H, thickness z -t/2 .. t/2
function doorLeaf(lw, H, t, { handle = false } = {}) {
  const g = new THREE.Group(), st = 0.095, top = 0.1, bot = 0.22, mid0 = 0.56, mid1 = 0.64, lites = 5;
  const L = (w, h, d, at, look = TEAK) => g.add(box(w, h, d, look, at));
  L(st, H, t, [st / 2, H / 2, 0]); L(st, H, t, [lw - st / 2, H / 2, 0]);                                // stiles
  L(lw - 2 * st, top, t, [lw / 2, H - top / 2, 0]); L(lw - 2 * st, bot, t, [lw / 2, bot / 2, 0]);     // top and bottom rails
  L(lw - 2 * st, mid1 - mid0, t, [lw / 2, (mid0 + mid1) / 2, 0]);                                    // lock (middle) rail
  // the raised bottom panel: a fielded panel thinner than the frame, with a bevelled raise on both faces
  L(lw - 2 * st, mid0 - bot, t * 0.45, [lw / 2, (bot + mid0) / 2, 0], TEAK_D);
  for (const s of [-1, 1]) g.add(rbox(lw - 2 * st - 0.07, mid0 - bot - 0.07, 0.012, 0.004, TEAK, [lw / 2, (bot + mid0) / 2, s * t * 0.26]));
  // the glazed sash: glazing bars (5 lites high, 2 wide) with putty-side beads, glass in the middle
  const gy0 = mid1, gy1 = H - top, gh = gy1 - gy0, gw = lw - 2 * st;
  for (let k = 1; k < lites; k++) L(gw, 0.02, t * 0.7, [lw / 2, gy0 + (gh * k) / lites, 0]);
  L(0.02, gh, t * 0.7, [lw / 2, gy0 + gh / 2, 0]);
  for (const s of [-1, 1]) { L(gw, 0.012, 0.008, [lw / 2, gy0 + 0.006, s * (t / 2 - 0.004)], TEAK_D); L(gw, 0.012, 0.008, [lw / 2, gy1 - 0.006, s * (t / 2 - 0.004)], TEAK_D); }   // beads
  g.add(box(gw, gh, 0.004, GLASS, [lw / 2, gy0 + gh / 2, 0]));
  if (handle) {   // the meeting leaf: a brass lever handle and keyhole escutcheon on both faces, and a flush bolt at head and foot
    for (const s of [-1, 1]) { const z = s * (t / 2 + 0.003);
      g.add(rbox(0.04, 0.17, 0.006, 0.003, BRASS, [lw - 0.05, 1.0, z]));
      const lev = cyl(0.008, 0.008, 0.11, BRASS, [lw - 0.1, 1.04, s * (t / 2 + 0.03)], [0, 0, 90], 12); g.add(lev);
      g.add(cyl(0.009, 0.009, 0.026, BRASS, [lw - 0.05, 1.04, s * (t / 2 + 0.016)], [90, 0, 0], 12));
      g.add(box(0.006, 0.014, 0.002, { grey: 0.15, col: 0x201a10 }, [lw - 0.05, 0.955, z + s * 0.0035])); }
    for (const y of [H - 0.12, 0.12]) g.add(box(0.016, 0.14, 0.004, BRASS, [lw - 0.004 + 0.0021, y, 0], [0, 90, 0])); }
  return g;
}
export function hallDoorLeaves() {
  const g = new THREE.Group(), D = DOOR, wallP = ROOM.wallP, zh = D.z - wallP, H = D.h - 0.01, t = 0.045, wd = D.x1 - D.x0, lw = wd / D.leaves - 0.012;
  const hy = HINGE_Y(H), labL = 'hall French doors (folded back into the hall)', labH = 'hall door hinges (brass butt hinges)';
  for (const [hx, sx] of [[D.x0, 1], [D.x1, -1]]) {
    // leaf A: hinge edge on the jamb at the hall face, opened 90 deg into the hall; its body lies inside the opening's line
    const ax = hx + sx * (0.02 + HINGE.r);   // knuckle axis (x), at z = zh - r: on the jamb lining's face (lining 0.02 proud of the reveal)
    const A = doorLeaf(lw, H, t); A.rotation.y = rad(90); A.position.set(ax + sx * (HINGE.r + t / 2), 0, zh - HINGE.r - 0.002);
    g.add(tag(A, labL));
    // leaf B: hinged on A's far edge, folded 180 deg flat back against A's inner face (toward the opening's centre)
    const zf = zh - HINGE.r - 0.002 - lw, bx = ax + sx * (3 * HINGE.r + 1.5 * t);
    const B = doorLeaf(lw, H, t, { handle: true }); B.rotation.y = rad(-90); B.position.set(bx, 0, zf);
    g.add(tag(B, labL));
    for (const y of hy) {
      // jamb hinge: one plate on the jamb's reveal (running south into the opening along the reveal face), one on A's hinge edge
      const h1 = buttHinge([0, 0, 1], [sx, 0, 0], [sx, 0, 0], [0, 0, 1], -HINGE.r + HINGE.t / 2, -0.002 + HINGE.t / 2); h1.position.set(ax, y, zh - HINGE.r); g.add(tag(h1, labH));
      // fold hinge at A's far edge, on A's inner face side: both plates on the north edges of A and B, facing north
      const fx = ax + sx * (HINGE.r + t + HINGE.r), o = -HINGE.r + 1.5 * HINGE.t, h2 = buttHinge([-sx, 0, 0], [0, 0, -1], [sx, 0, 0], [0, 0, -1], o, o); h2.position.set(fx, y, zf - HINGE.r + HINGE.t); g.add(tag(h2, labH));
    }
  }
  // architraves (casings) round the opening on the room face and the hall face: a flat with a bead on its inner edge
  const CAS = { grey: 0.42, col: 0x6a4a30, mat: 'sapele' }, cw = 0.065, ch = D.trans1 + 0.05;
  for (const [z, s] of [[D.z + 0.018, 1], [zh - 0.018, -1]]) {
    for (const x of [D.x0 - cw / 2 + 0.003, D.x1 + cw / 2 - 0.003]) { g.add(tag(box(cw, ch, 0.026, CAS, [x, ch / 2, z]), 'hall doorway architraves'));
      g.add(tag(cyl(0.008, 0.008, ch, CAS, [x + (x < D.cx ? cw / 2 : -cw / 2), ch / 2, z + s * 0.008], null, 10), 'hall doorway architraves'));
      g.add(tag(box(cw + 0.02, 0.16, 0.03, CAS, [x, 0.08, z + s * 0.004]), 'hall doorway architraves')); }   // plinth blocks
    g.add(tag(box(D.x1 - D.x0 + 2 * cw + 0.01, 0.08, 0.03, CAS, [D.cx, ch + 0.04, z]), 'hall doorway architraves')); }
  g.add(tag(box(D.x1 - D.x0, 0.018, wallP + 0.01, { grey: 0.4, col: 0x5a3e28, mat: 'sapele' }, [D.cx, 0.009, D.z - wallP / 2]), 'hall doorway threshold (teak)'));
  return g;
}

// ---------------------------------------------------------------- bookcases
// North wall, both runs. Each unit (~0.8-1.1 m): a plinth, a two-door panelled cupboard to 0.84 m, a counter ledge,
// then a glazed two-door bookcase to 2.0 m with three shelves of books, a cornice. Uprights and shelf edges are a paler
// polished wood than the dark carcass so shelving and books never merge; the back of the case is paler still.
const CARC = { grey: 0.38, col: 0x5a3a26, mat: 'sapele' }, EDGE = { grey: 0.55, col: 0x8a6440, mat: 'sapele' }, BACK = { grey: 0.6, col: 0x9a7c5a, mat: 'sapele' }, KNOB = BRASS;
// 1980s Chinese books: mostly paperbacks with paper spines (cream, off-white, pale green / blue / grey, ochre, a few brick
// red); some cloth-bound sets (navy, dark green, maroon, brown). 32开 ~0.185-0.205 m, 大32开 0.21, 16开 0.26, small 0.15.
const SPINES = [[0xe8dfc6, 10], [0xefe8d6, 8], [0xd8cca8, 6], [0xb9c6a8, 5], [0xa9bac8, 5], [0xc4c4b8, 4], [0xd6bf84, 4], [0xa44c3a, 3],
  [0x2c3752, 3], [0x2f4b3c, 3], [0x6c2c26, 2], [0x7a5a3c, 3], [0x8a9a7a, 2], [0xc8a890, 2]];
const SPINE_W = SPINES.reduce((a, s) => a + s[1], 0);
const pickSpine = (r) => { let x = r() * SPINE_W; for (const [c, w] of SPINES) { x -= w; if (x <= 0) return c; } return SPINES[0][0]; };
const HEIGHTS = [[0.185, 0.36], [0.203, 0.3], [0.21, 0.14], [0.26, 0.1], [0.15, 0.1]];
const pickH = (r) => { let x = r(); for (const [h, p] of HEIGHTS) { x -= p; if (x <= 0) return h + (r() - 0.5) * 0.008; } return 0.185; };
let SPINE_I = 0;
function shelfOfBooks(g, x0, x1, y, zBack, zFront, maxH, r) {
  let x = x0 + 0.01 + r() * 0.02;
  const books = [];
  while (x < x1 - 0.03) {
    if (r() < 0.07) { // a short horizontal stack of 2-4 books
      const n = 2 + Math.floor(r() * 3), bw = 0.13 + r() * 0.06; if (x + bw > x1 - 0.01) break; let yy = y;
      for (let k = 0; k < n; k++) { const th = 0.012 + r() * 0.02, dep = 0.13 + r() * 0.05, c = pickSpine(r);
        books.push(box(bw - k * 0.006, th, dep, { grey: 0.45 + 0.35 * ((c >> 8 & 255) / 255), col: c }, [x + bw / 2, yy + th / 2, zFront - dep / 2]));
        yy += th; }
      x += bw + 0.01; continue; }
    if (r() < 0.05) { x += 0.02 + r() * 0.05; continue; }   // a gap
    const set = r() < 0.18;   // a run of a cloth-bound set: same colour, same height
    const n = set ? 4 + Math.floor(r() * 6) : 1, c0 = pickSpine(r), h0 = Math.min(pickH(r), maxH - 0.02);
    for (let k = 0; k < n && x < x1 - 0.03; k++) {
      const c = set ? c0 : pickSpine(r), h = set ? h0 : Math.min(pickH(r), maxH - 0.02), th = set ? 0.024 + (k % 2) * 0.003 : 0.008 + r() * r() * 0.04, dep = 0.13 + (h - 0.15) * 0.6 + r() * 0.015;
      const look = { grey: 0.3 + 0.55 * (((c >> 16) * 0.3 + ((c >> 8) & 255) * 0.59 + (c & 255) * 0.11) / 255), col: c };
      books.push(rbox(th, h, dep, 0.0015, look, [x + th / 2, y + h / 2, zFront - dep / 2]));
      // paper spines of paperbacks get a pale title label block; cloth sets two thin bands at head and tail (no lettering)
      // the spine face: art.js's fixed greeked spine in this book's colour (no readable titles); without it, plain bands
      if (ART.spineArt) { const sp = artPlane(ART.spineArt(++SPINE_I, c), th - 0.0012, h - 0.002, look); sp.position.set(x + th / 2, y + h / 2, zFront + 0.0007); books.push(sp); }
      else if (set) for (const yy of [y + h - 0.025, y + 0.025]) books.push(box(th * 0.9, 0.004, 0.001, { grey: 0.75, col: 0xc8b070 }, [x + th / 2, yy, zFront + 0.0006]));
      x += th + 0.0008; }
    if (r() < 0.06 && x < x1 - 0.05) { const h = pickH(r), th = 0.02, dep = 0.16, lean = 14;   // one book leaning on its neighbour
      const b = rbox(th, h, dep, 0.0015, { grey: 0.6, col: pickSpine(r) }, [x + th / 2 + Math.sin(rad(lean)) * h / 2, y + Math.cos(rad(lean)) * h / 2, zFront - dep / 2], [0, 0, -lean]); books.push(b); x += th + Math.sin(rad(lean)) * h + 0.01; }
  }
  books.forEach((b) => g.add(b));
}
// the ONE canonical cabinet handle (2026-11-27 canon): a cast-brass mushroom knob, a round rose (backplate) 30 mm across on
// the door, a short neck, a domed cap 24 mm across; scale 0.8 on the glazed doors. Every bookcase door in the room has it.
function knob(at, k = 1) {
  const g = new THREE.Group(); g.position.set(...at);
  g.add(cyl(0.015 * k, 0.015 * k, 0.003, BRASS, [0, 0, 0.0015], [90, 0, 0], 20));                // rose
  g.add(cyl(0.005 * k, 0.0065 * k, 0.012 * k, BRASS_D, [0, 0, 0.003 + 0.006 * k], [90, 0, 0], 12));   // neck
  g.add(cyl(0.012 * k, 0.0105 * k, 0.007 * k, BRASS, [0, 0, 0.003 + 0.0155 * k], [90, 0, 0], 20));  // cap
  g.add(ball(0.0105 * k, BRASS, [0, 0, 0.003 + 0.019 * k], [1, 1, 0.35]));                          // its dome
  return g;
}
export function bookcases() {
  const g = new THREE.Group(), S = SHELVES, z0 = ROOM.z0, zf = SHELF_FRONT, r = rng(253); SPINE_I = 0;
  const lab = { car: 'bookcase (carcass, cupboard doors, cornice)', sh: 'bookcase shelf boards and uprights', gl: 'bookcase glazed doors', bk: 'books (spines)', back: 'bookcase back (inside)' };
  for (const [a0, a1] of S.runs) { const n = Math.max(1, Math.round((a1 - a0) / 0.9)), uw = (a1 - a0) / n;
    for (let i = 0; i < n; i++) { const ux0 = a0 + uw * i, ux1 = ux0 + uw, ux = (ux0 + ux1) / 2, side = 0.022;
      const P = (o, l) => g.add(tag(o, l));
      // carcass: two uprights (pale front edges), top, plinth, back
      for (const x of [ux0 + side / 2 + 0.002, ux1 - side / 2 - 0.002]) { P(box(side, S.h, S.d, CARC, [x, S.h / 2, z0 + S.d / 2]), lab.car); P(box(side, 1.14, 0.006, EDGE, [x, 0.87 + 0.57, zf - 0.002]), lab.sh); }
      P(box(uw - 0.004, 0.08, S.d - 0.03, TEAK_D, [ux, 0.04, z0 + (S.d - 0.03) / 2]), lab.car);   // plinth, set back
      P(box(uw + 0.004, 0.05, S.d + 0.03, CARC, [ux, S.h - 0.025, z0 + (S.d + 0.03) / 2]), lab.car); // cornice
      P(box(uw - 0.01, 0.02, S.d + 0.015, CARC, [ux, S.h - 0.06, z0 + S.d / 2]), lab.car);
      P(box(uw - 2 * side, 2.0 - 0.87, 0.012, BACK, [ux, (2.0 + 0.87) / 2, z0 + 0.006]), lab.back);
      P(box(uw - 2 * side, 0.78, 0.012, CARC, [ux, 0.08 + 0.39, z0 + 0.006]), lab.car);
      // the counter ledge between cupboard and bookcase: deeper than the case, a rounded nosing
      P(rbox(uw, 0.03, S.d + 0.025, 0.008, EDGE, [ux, 0.855, z0 + (S.d + 0.025) / 2]), lab.sh);
      // lower cupboard: two panelled doors, small brass knobs, a keyhole
      { const dw = (uw - 2 * side) / 2 - 0.004, dy0 = 0.085, dy1 = 0.835, dh = dy1 - dy0;
        for (const s of [-1, 1]) { const dx = ux + s * (dw / 2 + 0.002), zz = zf - 0.01;
          P(box(dw, dh, 0.02, CARC, [dx, dy0 + dh / 2, zz]), lab.car);
          P(rbox(dw - 0.1, dh - 0.12, 0.012, 0.004, TEAK, [dx, dy0 + dh / 2, zz + 0.014]), lab.car);   // raised panel
          P(knob([ux + s * 0.035, 0.7, zz + 0.01], 1), lab.car); }
        P(rbox(0.016, 0.03, 0.003, 0.0015, BRASS, [ux + 0.035, 0.655, zf + 0.0045]), lab.car); P(box(0.004, 0.011, 0.002, { grey: 0.12, col: 0x1a1410 }, [ux + 0.035, 0.652, zf + 0.0065]), lab.car); }   // keyhole escutcheon (brass) with its slot
      // shelf boards (pale front edges) and the books on them: deck 0.87, shelves 1.24, 1.62, top inside 1.995
      const decks = [0.87, 1.245, 1.62, 1.995];
      for (const y of decks.slice(1, 3)) { P(box(uw - 2 * side, 0.02, S.d - 0.03, CARC, [ux, y - 0.01, z0 + (S.d - 0.03) / 2]), lab.sh); P(box(uw - 2 * side, 0.022, 0.006, EDGE, [ux, y - 0.01, zf - 0.033]), lab.sh); }
      for (let k = 0; k < 3; k++) { const y = decks[k] + (k === 0 ? 0.0 : 0.0), maxH = decks[k + 1] - 0.02 - y;
        const bg = new THREE.Group(); shelfOfBooks(bg, ux0 + side + 0.004, ux1 - side - 0.004, y, z0 + 0.012, zf - 0.04, maxH, r); g.add(tag(bg, lab.bk)); }
      // glazed doors: two leaves, slim frames (stiles 0.03, rails 0.035), one glazing bar each, brass knobs at the meeting stiles
      { const gy0 = 0.875, gy1 = 1.99, gh = gy1 - gy0, dw = (uw - 2 * side) / 2 - 0.003, zz = zf - 0.012;
        for (const s of [-1, 1]) { const dx = ux + s * (dw / 2 + 0.0015);
          for (const xx of [dx - dw / 2 + 0.015, dx + dw / 2 - 0.015]) P(box(0.03, gh, 0.022, CARC, [xx, gy0 + gh / 2, zz]), lab.gl);
          for (const yy of [gy0 + 0.0175, gy1 - 0.0175, gy0 + gh * 0.5]) P(box(dw - 0.06, yy === gy0 + gh * 0.5 ? 0.016 : 0.035, 0.018, CARC, [dx, yy, zz]), lab.gl);
          P(box(dw - 0.06, gh - 0.07, 0.003, GLASS, [dx, gy0 + gh / 2, zz]), lab.gl);
          P(knob([ux + s * 0.024, 1.3, zz + 0.011], 0.8), lab.gl); } }
    } }
  return g;
}

// ---------------------------------------------------------------- armchair
// The common Shanghai upholstered armchair of the 1950s-80s (单人沙发): a boxy sprung body on four short tapered dark
// wood legs, rolled arms, a slightly reclined back with a curved top, one loose seat cushion with piping; in winter a
// crocheted white cover (沙发巾) over the back and one over each arm. Fabric: a PLAIN brown-rust wool, the same as the couch
// (round-4 decisions, Jade: sh_suite_colour "brown or rust", art_sh_upholstery "plain"; was olive green). The exact shade is
// my pick: a deep rust, redder and darker than the orange-brown floor, darker than the plaster in every mode (flat greys
// 0.30 / 0.36 vs floor 0.56 and walls 0.76).
// 2026-11-27 canon (Jade: "fully painted or the image model will hallucinate a book shelf right into the plain back of an
// armchair"): the wool is a real woven texture (textures.js `wool`: Poly Haven "Caban", re-centred on these colours), the
// legs varnished sapele, the covers one canonical crochet pattern (textures.js `lace`), and every side the camera can see
// carries upholstery detail: welt cords outline the outside back and the base on all four sides, the crocheted cover drapes
// OVER the back roll and hangs down the back as well as the front. The couch is now built by the same code (one suite).
export const FABRIC = { grey: 0.30, col: 0x683826, recvShadowLine: true, mat: 'wool' }, FABRIC_C = { grey: 0.36, col: 0x744130, recvShadowLine: true, mat: 'wool' }, PIPE = { grey: 0.26, col: 0x4e281a, mat: 'wool' };
const LACE = { grey: 0.95, col: 0xf2efe6, mat: 'lace' }, LEG = { grey: 0.3, col: 0x3e2a1c, mat: 'sapele' };
// one upholstered piece of the suite. a: { at: [x, z], yaw, w (across), d (depth), id }; o: seats (cushions), seatTop,
// backTop, armTop, aw (arm width), label. Local frame: +z is the front, x across.
function upholstered(a, o = {}) {
  const g = new THREE.Group(); g.position.set(a.at[0], 0, a.at[1]); g.rotation.y = rad(a.yaw);
  const { w, d } = a, n = o.seats || 1, aw = o.aw ?? 0.13, legH = 0.11, baseTop = (o.seatTop ?? 0.43) - 0.09, seatTop = o.seatTop ?? 0.43, backTop = o.backTop ?? 0.86, armTop = o.armTop ?? 0.62;
  const welt = (len, at, rotZ90 = true, r = 0.006) => g.add(cyl(r, r, len, PIPE, at, rotZ90 ? [0, 0, 90] : [90, 0, 0], 8));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = cyl(0.014, 0.022, legH, LEG, [sx * (w / 2 - 0.06), legH / 2, sz * (d / 2 - 0.07)], [sz * 6, 0, -sx * 6], 12); g.add(l); }
  if (n > 1) g.add(cyl(0.014, 0.022, legH, LEG, [0, legH / 2, d / 2 - 0.07], [6, 0, 0], 12), cyl(0.014, 0.022, legH, LEG, [0, legH / 2, -d / 2 + 0.07], [-6, 0, 0], 12));   // centre legs under a long couch
  g.add(rbox(w - 0.02, baseTop - legH, d - 0.04, 0.03, FABRIC, [0, (legH + baseTop) / 2, 0.0]));                  // sprung base
  welt(w - 0.06, [0, baseTop - 0.005, d / 2 - 0.022]); welt(w - 0.06, [0, baseTop - 0.005, -d / 2 + 0.022]);      // welts along the base's top edge, front and back
  welt(w - 0.06, [0, legH + 0.012, d / 2 - 0.022]); welt(w - 0.06, [0, legH + 0.012, -d / 2 + 0.022]);            // and its bottom edge
  for (const s of [-1, 1]) { welt(d - 0.1, [s * (w / 2 - 0.012), baseTop - 0.005, 0], false); welt(d - 0.1, [s * (w / 2 - 0.012), legH + 0.012, 0], false); }
  const iw = w - 2 * aw - 0.01, cw = iw / n;
  for (let k = 0; k < n; k++) { const cx = -iw / 2 + cw * (k + 0.5);
    g.add(rbox(cw - (n > 1 ? 0.008 : 0), seatTop - baseTop + 0.01, d - 0.2, 0.035, FABRIC_C, [cx, (baseTop + seatTop) / 2, 0.06]));   // loose seat cushion(s)
    for (const s of [-1, 1]) g.add(cyl(0.005, 0.005, cw - 0.05, PIPE, [cx, seatTop - 0.004 + (s > 0 ? 0 : -0.085), d / 2 - 0.045], [0, 0, 90], 8)); }   // piping, top and bottom front edges
  // back: reclined 8 deg, curved top roll; outside back panel outlined by welt cords
  { const bk = new THREE.Group(); bk.position.set(0, baseTop - 0.02, -d / 2 + 0.09); bk.rotation.x = rad(-8); const bh = backTop - baseTop;
    bk.add(rbox(w - 0.02, bh, 0.16, 0.04, FABRIC, [0, bh / 2, 0]));
    bk.add(cyl(0.085, 0.085, w - 0.03, FABRIC, [0, bh - 0.02, 0.0], [0, 0, 90], 20));
    for (let k = 0; k < n; k++) { const cx = -iw / 2 + cw * (k + 0.5);
      bk.add(rbox(cw - 0.02, bh - 0.14, 0.07, 0.03, FABRIC_C, [cx, bh / 2 + 0.02, 0.1])); }                        // back cushion(s)
    const zb = -0.083, wb = (w - 0.02) / 2 - 0.03;
    for (const s of [-1, 1]) bk.add(cyl(0.006, 0.006, bh - 0.16, PIPE, [s * wb, (bh - 0.16) / 2 + 0.03, zb], null, 8));   // outside back: vertical welts
    bk.add(cyl(0.006, 0.006, 2 * wb, PIPE, [0, 0.03, zb], [0, 0, 90], 8));                                                // bottom welt
    bk.add(cyl(0.006, 0.006, w - 0.05, PIPE, [0, bh - 0.02, -0.087], [0, 0, 90], 8));                                     // welt under the roll at the back
    // the crocheted cover(s): over the top roll (a curved shell), hanging 0.2 m down the front and 0.15 m down the back
    const cvW = n > 1 ? Math.min(0.42, cw - 0.06) : 0.42, R = 0.09;
    for (let k = 0; k < n; k++) { const cx = n > 1 ? -iw / 2 + cw * (k + 0.5) : 0;
      const shell = mk(new THREE.CylinderGeometry(R, R, cvW, 20, 1, true, 0, Math.PI), LACE); shell.rotation.z = Math.PI / 2; shell.position.set(cx, bh - 0.02, 0); bk.add(shell);   // the upper half round the roll
      bk.add(box(cvW, 0.2, 0.005, LACE, [cx, bh - 0.02 - 0.1, R + 0.004])); bk.add(box(cvW, 0.15, 0.005, LACE, [cx, bh - 0.02 - 0.075, -R - 0.002])); }
    g.add(bk); }
  // rolled arms: a straight upholstered side topped by a roll that overhangs outward, a piped scroll face at the front;
  // the outside of each arm outlined by a welt along its foot
  for (const s of [-1, 1]) { const x = s * (w / 2 - aw / 2);
    // no coplanar faces (they z-fought into combs in form / line): the arm's outside face 6 mm proud of the base, its front
    // 15 mm behind the base's front; the roll 7.5 mm ahead of the arm; the piped scroll panel 6 mm ahead of the roll's end
    g.add(rbox(aw - 0.014, armTop - legH - 0.05, d - 0.065, 0.025, FABRIC, [x + s * 0.003, (legH + armTop - 0.05) / 2, -0.0025]));
    g.add(cyl(0.06, 0.06, d - 0.06, FABRIC, [x + s * 0.008, armTop - 0.055, 0.0025], [90, 0, 0], 20));
    g.add(cyl(0.062, 0.062, 0.012, PIPE, [x + s * 0.008, armTop - 0.055, d / 2 - 0.0275], [90, 0, 0], 20));   // the scroll's piped front panel
    g.add(cyl(0.006, 0.006, d - 0.12, PIPE, [x + s * (aw / 2 - 0.005), armTop - 0.11, 0.01], [90, 0, 0], 8));   // welt under the roll, outside
    const cov = mk(new THREE.CylinderGeometry(0.064, 0.064, 0.3, 16, 1, true, Math.PI / 2 - 0.5, Math.PI + 1.0), LACE);   // arm cover draped over the roll
    cov.rotation.x = Math.PI / 2; cov.position.set(x + s * 0.008, armTop - 0.055, 0.12); g.add(cov); }
  return tag(g, o.label || `armchair (${a.id})`);
}
export function armchair(a) { return upholstered(a); }
// the three-seat couch against the WEST wall, facing +x: the same construction, cloth and covers as the armchairs
export function couch() {
  const C = COUCH;
  return upholstered({ at: [(C.x0 + C.x1) / 2, (C.z0 + C.z1) / 2], yaw: 90, w: C.z1 - C.z0, d: C.x1 - C.x0 },
    { seats: 3, seatTop: C.seat, backTop: C.back, armTop: C.arm, aw: C.armW, label: 'three-seat couch (west wall)' });
}

// ---------------------------------------------------------------- coffee table (茶几)
// 2026-11-27 canon (Jade: the old plain box table "reads as modern IKEA"; an educated Shanghai household of 1986: solid,
// good-quality furniture of the period, not the cheapest): a Shanghai-made hardwood tea / coffee table of the 1960s-80s
// as in the reference photos (NOTES "furniture / costume canon"): a dark red-brown 栗壳色 varnished top with a rounded,
// bevelled edge under a 6 mm sheet of plate glass (玻璃台板, its pale green edges showing), a moulded apron, four TURNED
// legs (a ring and a bead at the top, a long taper, a small foot), a lower shelf on stretchers, rounded edges.
// Footprint and height are the old table's exactly (0.55 x 0.95 m, glass top at 0.42 m), so the paper, the holds and
// her pose are unchanged.
export const TEA = { grey: 0.36, col: 0x5c2c1c, mat: 'sapele', recvShadowLine: true }, TEA_D = { grey: 0.32, col: 0x4c2416, mat: 'sapele' };
const GLASS_TOP = { glass: true, col: 0x9fb8b0, opacity: 0.14, noCast: true }, GLASS_EDGE = { grey: 0.62, col: 0x7f9a8c };
function turnedLeg(h, look) {   // lathe profile (r, y) from the foot up
  const P = [[0.0, 0], [0.016, 0], [0.019, 0.012], [0.015, 0.03], [0.0135, 0.05], [0.017, h * 0.55], [0.021, h - 0.085], [0.026, h - 0.07], [0.021, h - 0.06], [0.026, h - 0.05], [0.026, h], [0.0, h]];
  return mk(new THREE.LatheGeometry(P.map(([r, y]) => new THREE.Vector2(r, y)), 24), look);
}
export function coffeeTable(T) {
  const g = new THREE.Group(), gt = 0.006, topT = 0.026, ty = T.h - gt, legH = ty - topT, inset = 0.055, ap = 0.065;
  g.add(rbox(T.w, topT, T.d, 0.009, TEA, [T.cx, ty - topT / 2, T.cz]));                                          // the top: rounded, bevelled edge
  g.add(box(T.w - 0.012, gt, T.d - 0.012, GLASS_TOP, [T.cx, ty + gt / 2, T.cz]));                                // plate glass
  for (const s of [-1, 1]) { g.add(box(T.w - 0.012, gt, 0.003, GLASS_EDGE, [T.cx, ty + gt / 2, T.cz + s * (T.d / 2 - 0.0075)]));   // its green edges
    g.add(box(0.003, gt, T.d - 0.012, GLASS_EDGE, [T.cx + s * (T.w / 2 - 0.0075), ty + gt / 2, T.cz])); }
  for (const s of [-1, 1]) {                                                                                       // the apron, moulded lower edge
    g.add(rbox(T.w - 2 * inset, ap, 0.02, 0.006, TEA_D, [T.cx, ty - topT - ap / 2, T.cz + s * (T.d / 2 - inset)]));
    g.add(rbox(0.02, ap, T.d - 2 * inset, 0.006, TEA_D, [T.cx + s * (T.w / 2 - inset), ty - topT - ap / 2, T.cz]));
    g.add(cyl(0.006, 0.006, T.w - 2 * inset - 0.04, TEA, [T.cx, ty - topT - ap + 0.004, T.cz + s * (T.d / 2 - inset + 0.012)], [0, 0, 90], 10));   // bead
    g.add(cyl(0.006, 0.006, T.d - 2 * inset - 0.04, TEA, [T.cx + s * (T.w / 2 - inset + 0.012), ty - topT - ap + 0.004, T.cz], [90, 0, 0], 10)); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const L = turnedLeg(legH, TEA); L.position.set(T.cx + sx * (T.w / 2 - inset), 0, T.cz + sz * (T.d / 2 - inset)); g.add(L); }
  const sy = 0.12, sh = 0.018;                                                                                     // the lower shelf on stretchers
  for (const s of [-1, 1]) g.add(box(0.022, 0.03, T.d - 2 * inset, TEA_D, [T.cx + s * (T.w / 2 - inset), sy - sh / 2 - 0.015, T.cz]));
  g.add(rbox(T.w - 2 * inset + 0.03, sh, T.d - 2 * inset + 0.03, 0.006, TEA, [T.cx, sy - sh / 2, T.cz]));
  const t = tag(g, 'coffee table (茶几)', true);
  // on the lower shelf (an intellectual household): a folded newspaper (greeked columns, no readable text) and two journals
  const np = artFromCanvas(newspaperCanvas()), sh2 = new THREE.Group();
  const paper = box(0.2, 0.008, 0.29, { grey: 0.82, col: 0xd8d2c0 }, [T.cx - 0.04, sy + 0.004, T.cz + 0.18]); paper.rotation.y = rad(7); sh2.add(paper);
  const pf = artPlane(np, 0.2, 0.29, { grey: 0.82, col: 0xd8d2c0 }); pf.rotation.set(-Math.PI / 2, 0, rad(7)); pf.position.set(T.cx - 0.04, sy + 0.0085, T.cz + 0.18); sh2.add(pf);
  for (const [k, c, th] of [[0, 0x2f4b3c, 0.012], [1, 0xa44c3a, 0.009]]) { const b = rbox(0.185, th, 0.26, 0.002, { grey: 0.35, col: c, mat: 'wool' }, [T.cx + 0.02, sy + 0.001 + (k ? 0.012 + th / 2 : th / 2), T.cz - 0.2]); b.rotation.y = rad(k ? -9 : 4); sh2.add(b); }
  t.add(tag(sh2, 'on the coffee table shelf: a folded newspaper and two journals'));
  return t;
}

// ---------------------------------------------------------------- slippers
// Winter house slippers of 1980s Shanghai: cotton-padded mules (棉拖鞋), a corduroy / velvet upper over the toes and
// instep, open at the heel, on a thick pale layered-cloth or rubber sole; worn over socks (the sock heel shows).
export const SLIPPERS = { mama86: { upper: 0x2a2a30, sole: 0xe6e0d0 }, grandma: { upper: 0x5a2a2e, sole: 0xe0d8c4 }, aunt: { upper: 0x2c3a5a, sole: 0xe6e0d0 }, uncle: { upper: 0x4a3e34, sole: 0x3a3632 } };
export function slippers(fig, who) {
  const spec = SLIPPERS[who]; if (!spec) return null;
  const P = fig.userData.P, g = new THREE.Group(), UP = { grey: 0.25, col: spec.upper }, SOLE = { grey: 0.85, col: spec.sole };
  for (const n of ['L', 'R']) {
    const heel = P['heel' + n], toe = P['toe' + n], ank = P['ankle' + n]; if (!heel || !toe) continue;
    const fd = toe.clone().sub(heel); const len = fd.length(); fd.normalize();
    const up = ank.clone().sub(heel); up.addScaledVector(fd, -up.dot(fd)).normalize(); const side = new THREE.Vector3().crossVectors(up, fd).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, up, fd));
    const L = len + 0.025, W = 0.1, sh = 0.024, base = heel.clone().addScaledVector(up, -0.004);
    const sole = rbox(W, sh, L, 0.01, SOLE, null); sole.quaternion.copy(q); sole.position.copy(base).addScaledVector(fd, len / 2).addScaledVector(up, sh / 2); g.add(sole);
    // the upper: a padded dome over the front 60 % of the foot (toes to the instep), open behind
    const dome = mk(new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), UP); dome.scale.set(W / 2 + 0.004, 0.07, L * 0.3);
    dome.quaternion.copy(q); dome.position.copy(base).addScaledVector(fd, len * 0.68 + 0.006).addScaledVector(up, sh - 0.002); g.add(dome);
  }
  return tag(g, `${who}: socks in cotton-padded slippers (棉拖鞋)`);
}
