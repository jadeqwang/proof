// Build one mortongrove07 shot: the main floor of 5748 Capri Lane as Jade drew it (from layout.js; compass axes, x east,
// z south): the living room (floral couch against the front wall beside the window, red rug, egg-carton plant table under
// the west window), the piano / mirror / dining / entry part behind it, the vault with its ridge parallel to the street;
// her seated holding the UNFOLDED IAS sweatshirt up against herself, first love standing and leaning in; the real
// afternoon sun (SCENE) through the front, west and dining windows.
//   shot.beamMask (the twins beam_<id>): flat mode = the sun shafts white on black (sets/_beam.js applyBeamMask)
import * as THREE from 'three';
import { mk, box, cyl, quad, slab, tag, V, rad, textTexture } from '../../engine/core.js';
import { CAST } from '../_cast.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, beamMesh, beamWire, beamSidecar, applyBeamMask } from '../_beam.js';
import { wall, hexa, kitchenChair, r3, hideLabels } from '../basement90/kit.js';
import { YEAR, FILM, HOUSE, SCENE, SUN, SUN_DIR, APERTURES, BEAM, sunMargin, sunMargins, sunCos, ROOM, JOG, VAULT, ceilY, PICTURE, WIN_W, WIN_D, FRONT_DOOR, SLIDER,
  KITCHEN, STAIR, COUCH, END_TABLE_E, END_TABLE_W, RUG, COFFEE_TABLE, LOVESEAT, ARMCHAIR, PLANTS, PRINT, MIRROR, PIANO, BENCH, FLOOR_LAMP, CLOSET, DINING,
  HER, HIM, SHIRT, GRIP, SEAL, LIGHTS } from './layout.js';

// cast: `jade27` (kind adultJade27; stands in for Jade at about 24) and `firstLove27` (kind adultFirstLove, 1.78 m), both from ../_cast.js
void CAST;

const PLASTER = { grey: 0.8, col: 0xd8d0bc, recvShadowLine: true }, CARPET = { grey: 0.55, col: 0x9a8a72, recvShadowLine: true }, TRIM = { grey: 0.88, col: 0xe8e2d2 };
const FLORAL = { grey: 0.68, col: 0xc9a39a, recvShadowLine: true }, FLORAL_D = { grey: 0.6, col: 0xb08a84, recvShadowLine: true };
const WOOD = { grey: 0.42, col: 0x7a5a3a }, WOOD_D = { grey: 0.32, col: 0x5a3e28 }, DARK = { grey: 0.15, col: 0x1e1e22 };
const CORK = { grey: 0.55, col: 0xb08a5a }, STRAP = { grey: 0.3, col: 0x5a3a24 }, EBONY = { grey: 0.12, col: 0x16161a };
const GLASS = { glass: true, col: 0xfff6e0, opacity: 0.18, noCast: true };
const OUTSIDE = { grey: 0.97, col: SUN.color, emit: SUN.color, emitI: 1.25, flatEmit: 0.97, noCast: true };

// a wall whose top follows the vault. axis 'z': in the plane z = at, along x (top = ceilY(at), flat); axis 'x': in the
// plane x = at, along z (a gable end: the top rises to the ridge at VAULT.z)
function vwall({ axis, at, a0, a1, t, out, holes = [], look, label }) {
  const top = (a) => (axis === 'x' ? ceilY(a) : ceilY(at)) + VAULT.t;
  const pts = [[a0, 0], [a1, 0], [a1, top(a1)]]; if (axis === 'x' && VAULT.z > Math.min(a0, a1) && VAULT.z < Math.max(a0, a1)) pts.push([VAULT.z, top(VAULT.z)]); pts.push([a0, top(a0)]);
  const sh = new THREE.Shape(); sh.moveTo(...pts[0]); for (const p of pts.slice(1)) sh.lineTo(...p); sh.lineTo(...pts[0]);
  for (const h of holes) { const p = new THREE.Path(), e = h.y0 <= 0 ? 1e-3 : h.y0; p.moveTo(h.a0, e); p.lineTo(h.a0, h.y1); p.lineTo(h.a1, h.y1); p.lineTo(h.a1, e); p.lineTo(h.a0, e); sh.holes.push(p); }
  const m = mk(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), look);
  if (axis === 'z') m.position.z = out > 0 ? at : at - t;
  else { m.rotation.y = -Math.PI / 2; m.position.x = out > 0 ? at + t : at; }
  return tag(m, label);
}
// the vaulted ceiling: sloping drywall planes over [xa, xb] between z0 and z1 (split at the ridge)
function vault(xa, xb, z0, z1, look, g) {
  const t = VAULT.t, cuts = [z1, ...(VAULT.z < z1 && VAULT.z > z0 ? [VAULT.z] : []), z0];
  for (let i = 0; i < cuts.length - 1; i++) { const p = cuts[i], q = cuts[i + 1];
    const quadAt = (x) => [[x, ceilY(p), p], [x, ceilY(q), q], [x, ceilY(q) + t, q], [x, ceilY(p) + t, p]];
    g.add(tag(hexa(quadAt(xa), quadAt(xb), look), 'vaulted ceiling (ridge east-west, parallel to the street)')); }
}
// a window in a wall: frame, mullions, stool, glass, and bright daylight beyond. W: south wall { x0, x1, z } or west wall { z0, z1, x }
function windowSet(g, W, side, label) {
  const F = 0.05, ym = (W.sill + W.head) / 2, hh = W.head - W.sill;
  if (side === 'south') { const zc = W.z + 0.04;
    for (const y of [W.sill - F / 2, W.head + F / 2]) g.add(tag(box(W.x1 - W.x0 + 2 * F, F, 0.12, TRIM, [(W.x0 + W.x1) / 2, y, zc]), label));
    for (const x of [W.x0 - F / 2, W.x1 + F / 2, ...W.mullions]) g.add(tag(box(F, hh, 0.12, TRIM, [x, ym, zc]), label));
    g.add(tag(box(W.x1 - W.x0 + 0.16, 0.025, 0.12, TRIM, [(W.x0 + W.x1) / 2, W.sill - 0.012, W.z - 0.05]), 'window stool'));
    g.add(tag(quad([V(W.x0, W.head, W.z + 0.06), V(W.x1, W.head, W.z + 0.06), V(W.x1, W.sill, W.z + 0.06), V(W.x0, W.sill, W.z + 0.06)], GLASS), 'window glass'));
    g.add(tag(box(9, 5, 0.05, OUTSIDE, [(W.x0 + W.x1) / 2, 1.6, W.z + 3.0]), 'daylight outside (front lawn, Capri Lane)'));
  } else { const xc = W.x - 0.04;
    for (const y of [W.sill - F / 2, W.head + F / 2]) g.add(tag(box(0.12, F, W.z1 - W.z0 + 2 * F, TRIM, [xc, y, (W.z0 + W.z1) / 2]), label));
    for (const z of [W.z0 - F / 2, W.z1 + F / 2, ...W.mullions]) g.add(tag(box(0.12, hh, F, TRIM, [xc, ym, z]), label));
    g.add(tag(box(0.12, 0.025, W.z1 - W.z0 + 0.16, TRIM, [W.x + 0.05, W.sill - 0.012, (W.z0 + W.z1) / 2]), 'window stool'));
    g.add(tag(quad([V(W.x - 0.06, W.head, W.z1), V(W.x - 0.06, W.head, W.z0), V(W.x - 0.06, W.sill, W.z0), V(W.x - 0.06, W.sill, W.z1)], GLASS), 'window glass'));
    g.add(tag(box(0.05, 5, 6, OUTSIDE, [W.x - 3.0, 1.6, (W.z0 + W.z1) / 2]), 'daylight outside (side yard)')); }
}

function room() {
  const g = new THREE.Group(); const { x0, x1, z0, z1, wallT: T, wallInt: Ti } = ROOM, xW = JOG.xW, zJ = JOG.z;
  // floor: living part + the wider part north of the jog
  g.add(tag(box(x1 - x0 + T, 0.06, z1 - zJ + T, CARPET, [(x0 + x1 + T) / 2, -0.03, (z1 + zJ + T) / 2]), 'floor (wall-to-wall carpet)'));
  g.add(tag(box(x1 - xW + 2 * T, 0.06, zJ - z0 + 2 * T, CARPET, [(xW + x1) / 2, -0.03, (zJ + z0) / 2]), 'floor (wall-to-wall carpet)'));
  const CEIL = { grey: 0.86, col: 0xe6e0d0 };
  vault(x0 - T, x1 + T, zJ, z1 + T, CEIL, g); vault(xW - T, x1 + T, z0 - Ti, zJ, CEIL, g);
  // walls
  const P = PICTURE, Ww = WIN_W, Wd = WIN_D, D = FRONT_DOOR, S = SLIDER, St = STAIR;
  g.add(vwall({ axis: 'z', at: z1, a0: x0 - T, a1: x1 + T, t: T, out: 1, holes: [{ a0: P.x0, a1: P.x1, y0: P.sill, y1: P.head }], look: PLASTER, label: 'front wall (south, Capri Lane)' }));
  g.add(vwall({ axis: 'x', at: x0, a0: zJ, a1: z1, t: T, out: -1, holes: [{ a0: Ww.z0, a1: Ww.z1, y0: Ww.sill, y1: Ww.head }], look: PLASTER, label: 'west wall of the living room (egg-carton window)' }));
  g.add(vwall({ axis: 'z', at: zJ, a0: xW - T, a1: x0, t: T, out: 1, holes: [{ a0: D.x0, a1: D.x1, y0: 0, y1: D.h }], look: PLASTER, label: 'entry wall (front door, faces the street)' }));
  g.add(vwall({ axis: 'x', at: xW, a0: z0 - Ti, a1: zJ, t: T, out: -1, holes: [{ a0: Wd.z0, a1: Wd.z1, y0: Wd.sill, y1: Wd.head }], look: PLASTER, label: 'west wall (gable end; dining window)' }));
  g.add(vwall({ axis: 'z', at: z0, a0: xW - T, a1: x1 + T, t: Ti, out: -1, holes: [{ a0: S.x0, a1: S.x1, y0: 0, y1: S.h }], look: PLASTER, label: 'north wall (sliding door to the kitchen)' }));
  g.add(vwall({ axis: 'x', at: x1, a0: z0 - Ti, a1: z1 + T, t: Ti, out: 1, holes: [{ a0: St.z0, a1: St.z1, y0: 0, y1: 2.6 }], look: PLASTER, label: 'east wall (gable end; split-level wing beyond)' }));
  // baseboards (front and east walls)
  g.add(tag(box(x1 - x0, 0.1, 0.015, TRIM, [(x0 + x1) / 2, 0.05, z1 - 0.008]), 'baseboard'));
  g.add(tag(box(0.015, 0.1, St.z1 - z1, TRIM, [x1 - 0.008, 0.05, (St.z1 + z1) / 2]), 'baseboard'));
  windowSet(g, P, 'south', 'front window'); windowSet(g, Ww, 'west', 'west window (over the egg cartons)'); windowSet(g, Wd, 'west', 'dining window');
  // drapes pulled back at the front window's ends
  for (const [x, w] of [[P.x0 - 0.10, 0.14], [P.x1 + 0.05, 0.08]]) g.add(tag(box(w, ROOM.h - 0.14, 0.06, { grey: 0.74, col: 0xd8ccb0 }, [x, (ROOM.h - 0.14) / 2 + 0.01, z1 - 0.06]), 'drapes (pulled back)'));
  g.add(tag(box(P.x1 - P.x0 + 0.4, 0.06, 0.08, WOOD_D, [(P.x0 + P.x1) / 2, ROOM.h - 0.12, z1 - 0.06]), 'drapery rod'));
  // front door (closed), knob at the east edge; a coat closet by it
  g.add(tag(box(D.x1 - D.x0 - 0.01, D.h - 0.01, 0.045, { grey: 0.7, col: 0xc8b89a }, [(D.x0 + D.x1) / 2, D.h / 2, zJ + 0.06]), 'front door (closed)'));
  g.add(tag(cyl(0.028, 0.028, 0.06, { grey: 0.6, col: 0xb89a50 }, [D.x1 - 0.07, 0.95, zJ + 0.01], [90, 0, 0], 12), 'front door (closed)'));
  { const C = CLOSET; g.add(tag(box(C.x1 - C.x0, C.h, C.z1 - C.z0, PLASTER, [(C.x0 + C.x1) / 2, C.h / 2, (C.z0 + C.z1) / 2]), C.label));
    g.add(tag(box(0.03, 2.0, C.z1 - C.z0 - 0.16, { grey: 0.78, col: 0xd0c4a8 }, [C.x1 + 0.016, 1.0, (C.z0 + C.z1) / 2]), 'coat closet door (GUESS: east face)')); }
  // sliding door to the kitchen: one leaf slid open behind the other; the kitchen beyond (floor, far wall, counter)
  { const zc = z0 - Ti / 2, w = (S.x1 - S.x0) / 2 + 0.04;
    g.add(tag(box(w, S.h, 0.035, { grey: 0.72, col: 0xc8b898 }, [S.x0 + w / 2, S.h / 2, zc + 0.03]), 'sliding door to the kitchen (one leaf open)'));
    g.add(tag(box(4.0, 0.04, KITCHEN.depth, { grey: 0.7, col: 0xc8c0b0 }, [(S.x0 + S.x1) / 2, -0.02, z0 - Ti - KITCHEN.depth / 2]), 'kitchen'));
    g.add(tag(box(4.0, 2.44, 0.05, { grey: 0.65, col: 0xc0b8a8 }, [(S.x0 + S.x1) / 2, 1.22, z0 - Ti - KITCHEN.depth]), 'kitchen'));
    g.add(tag(box(2.4, 0.9, 0.6, { grey: 0.55, col: 0x8a7a60 }, [(S.x0 + S.x1) / 2, 0.45, z0 - Ti - KITCHEN.depth + 0.33]), 'kitchen counter')); }
  // stairs at the NE corner, half a level up, running east into the wing (the half flight down: not drawn, not modelled)
  { const w = St.z1 - St.z0 - 0.04, zc = (St.z0 + St.z1) / 2;
    for (let k = 1; k <= St.n; k++) { const x = St.x0 + (k - 1) * St.tread; g.add(tag(box(St.tread, k * St.rise, w, WOOD, [x + St.tread / 2, k * St.rise / 2, zc]), St.label)); }
    const xe = St.x0 + St.n * St.tread; g.add(tag(box(1.2, St.n * St.rise, 1.2, WOOD, [xe + 0.6, St.n * St.rise / 2, zc]), St.label));
    g.add(tag(box(0.04, 0.9, 0.04, WOOD_D, [St.x0 + 0.02, 0.45, St.z1 - 0.02]), 'stair newel'));
    g.add(tag(slab(V(St.x0 + 0.02, 0.92, St.z1 - 0.02), V(xe, 0.92 + St.n * St.rise, St.z1 - 0.02), 0.05, 0.04, V(0, 0, 1), WOOD_D), 'stair rail'));
    g.add(tag(box(3.5, 4.5, 0.05, { grey: 0.6, col: 0xb8b0a0 }, [x1 + 1.8, 1.8, St.z1 + 0.05]), 'split-level wing (beyond the stairs)'));
    g.add(tag(box(3.5, 4.5, 0.05, { grey: 0.6, col: 0xb8b0a0 }, [x1 + 1.8, 1.8, St.z0 - 0.05]), 'split-level wing (beyond the stairs)')); }
  return g;
}

// three-seat sofa against the south wall, facing north (-z)
function couch() {
  const g = new THREE.Group(); const C = COUCH, cx = (C.x0 + C.x1) / 2, W = C.x1 - C.x0, zc = (C.z0 + C.z1) / 2;
  const ix0 = C.x0 + C.armW, ix1 = C.x1 - C.armW, iw = ix1 - ix0;
  g.add(box(W, C.baseH, C.d, FLORAL_D, [cx, C.baseH / 2 + 0.06, zc]));
  for (const x of [C.x0 + 0.05, C.x1 - 0.05]) for (const z of [C.z0 + 0.05, C.z1 - 0.05]) g.add(cyl(0.02, 0.016, 0.06, WOOD_D, [x, 0.03, z], null, 10));
  g.add(box(W, C.back - C.baseH - 0.06, 0.18, FLORAL_D, [cx, (C.back + C.baseH + 0.06) / 2, C.z1 - 0.09]));
  for (const s of [-1, 1]) { const ax = s < 0 ? C.x0 + C.armW / 2 : C.x1 - C.armW / 2;
    g.add(box(C.armW, C.arm - 0.08 - C.baseH, C.d, FLORAL_D, [ax, (C.arm - 0.08 + C.baseH) / 2 + 0.03, zc]));
    g.add(cyl(0.1, 0.1, C.d, FLORAL_D, [ax, C.arm - 0.1, zc], [90, 0, 0], 20)); }
  for (let k = 0; k < 3; k++) { const x = ix0 + iw * (k + 0.5) / 3;
    g.add(box(iw / 3 - 0.012, C.seat - C.baseH - 0.06, C.seatZ1 - C.z0 + 0.02, FLORAL, [x, (C.seat + C.baseH + 0.06) / 2, (C.seatZ1 + C.z0) / 2 - 0.01]));
    g.add(box(iw / 3 - 0.012, C.back - C.seat + 0.02, C.backD - 0.08, FLORAL, [x, (C.back + C.seat) / 2 + 0.01, C.z1 - 0.18 - (C.backD - 0.08) / 2], [8, 0, 0])); }
  g.add(box(0.36, 0.34, 0.12, { grey: 0.5, col: 0x8a6a5a }, [C.x1 - C.armW - 0.2, C.seat + 0.17, C.seatZ1 - 0.08], [12, 18, 0]));   // throw pillow, east end
  return tag(g, 'floral couch');
}

// an upholstered seat (armchair or loveseat) at [x, z], yaw (0 = the sitter faces +z)
function upholstered(at, yaw, w, d, o = {}) {
  const a = new THREE.Group(); a.position.set(at[0], 0, at[1]); a.rotation.y = rad(yaw); const UP = o.look || { grey: 0.5, col: 0x7a6a58 };
  a.add(box(w, (o.seat ?? 0.43) - 0.08, d, UP, [0, ((o.seat ?? 0.43) - 0.08) / 2 + 0.04, 0])); a.add(box(w, (o.back ?? 0.88) - 0.04, 0.18, UP, [0, (o.back ?? 0.88) / 2, -d / 2 + 0.09]));
  for (const s of [-1, 1]) a.add(box(0.16, (o.arm ?? 0.6) - 0.04, d, UP, [s * (w / 2 - 0.08), (o.arm ?? 0.6) / 2, 0]));
  if (o.cushions) for (let k = 0; k < o.cushions; k++) { const iw = (w - 0.32) / o.cushions; a.add(box(iw - 0.012, 0.1, d - 0.22, { ...UP, grey: (UP.grey ?? 0.5) + 0.06 }, [-(w - 0.32) / 2 + iw * (k + 0.5), (o.seat ?? 0.43) + 0.0, 0.04])); }
  return a;
}

// a grand piano: the case outline in (u, v) (u = across from the straight spine toward the treble side, v = from the
// keyboard toward the tail), extruded between caseY0 and caseY1, lid closed; three legs, keyboard, music desk, lyre
function piano() {
  const g = new THREE.Group(); const P = PIANO, W = P.W, L = P.L;
  // outline in (u, v): u from the spine (0) to the treble cheek (W); v from the keyboard end (0) to the tail (L)
  const pts = [[0, 0], [W, 0], [W, 0.45]];
  for (let i = 1; i <= 12; i++) { const t = i / 12; const u = W - (W - 0.42) * (1 - Math.cos(t * Math.PI / 2)) ** 0.9, v = 0.45 + (L - 0.6 - 0.45) * t; pts.push([u, v]); }
  for (let i = 1; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push([0.42 * Math.cos(a), L - 0.6 + 0.6 * Math.sin(a) * 1.0]); }
  pts.push([0, L - 0.1]);
  // world: spine at x = spineX, u runs WEST (-x); keyboard at z = kbZ, v runs SOUTH (+z)
  const toW = ([u, v]) => [P.spineX - u, P.kbZ + v];
  const sh = new THREE.Shape(); const w0 = toW(pts[0]); sh.moveTo(w0[0], -w0[1]); for (const p of pts.slice(1)) { const w = toW(p); sh.lineTo(w[0], -w[1]); }
  const m = mk(new THREE.ExtrudeGeometry(sh, { depth: P.caseY1 - P.caseY0, bevelEnabled: false }), EBONY);
  m.rotation.x = -Math.PI / 2; m.position.y = P.caseY0;   // shape (x, -z) -> world (x, z), extruded up
  g.add(tag(m, P.label));
  // keyboard and key slip at the north end, music desk
  g.add(tag(box(W - 0.1, 0.05, 0.16, { grey: 0.9, col: 0xf0ece0 }, [P.spineX - W / 2, 0.72, P.kbZ - 0.07]), 'piano keyboard'));
  g.add(tag(box(W, 0.12, 0.2, EBONY, [P.spineX - W / 2, 0.66, P.kbZ - 0.08]), P.label));
  g.add(tag(box(W - 0.4, 0.3, 0.03, EBONY, [P.spineX - W / 2, P.caseY1 + 0.15, P.kbZ + 0.28], [-12, 0, 0]), 'music desk'));
  for (const [u, v] of [[0.12, 0.25], [W - 0.12, 0.25], [0.3, L - 0.35]]) { const [x, z] = toW([u, v]); g.add(tag(cyl(0.05, 0.035, P.caseY0, EBONY, [x, P.caseY0 / 2, z], null, 12), 'piano leg')); }
  { const [x, z] = toW([W * 0.5, 0.35]); g.add(tag(box(0.3, 0.05, 0.12, EBONY, [x, 0.12, z]), 'piano pedal lyre')); g.add(tag(box(0.06, 0.5, 0.06, EBONY, [x, 0.37, z]), 'piano pedal lyre')); }
  return g;
}

// the egg-carton seedlings: cartons in rows along the west-wall table, each with sprouts and a hand-written label stake
function plants(g) {
  const P = PLANTS, C = P.cartons, CART = { grey: 0.78, col: 0xc8bca0 }, LEAF = { grey: 0.5, col: 0x5e8a3a }, LBL = { grey: 0.97, col: 0xffffff };
  const cx = (P.x0 + P.x1) / 2; const tbl = { x0: P.x0, x1: P.x1, z0: P.z0, z1: P.z1, h: P.h };
  table(g, tbl, P.label);
  const dz = (P.z1 - P.z0 - 0.06) / C.rows; let k = 0;
  for (let i = 0; i < C.rows; i++) for (let j = 0; j < C.cols; j++) {
    const z = P.z0 + 0.03 + dz * (i + 0.5), x = cx + (j - (C.cols - 1) / 2) * (C.l + 0.01);
    g.add(tag(box(C.l, C.h, C.w, CART, [x, P.h + C.h / 2, z]), 'egg cartons (germinating plants)'));
    for (let s = 0; s < 6; s++) { const sx = x - C.l / 2 + C.l * (s + 0.5) / 6 + ((k * 7 + s * 3) % 5 - 2) * 0.004, hgt = 0.03 + ((k + s) % 4) * 0.012;
      for (const sz of [-1, 1]) g.add(tag(cyl(0.004, 0.003, hgt, LEAF, [sx, P.h + C.h + hgt / 2, z + sz * 0.025], null, 5), 'seedlings')); }
    g.add(tag(box(0.012, 0.07, 0.03, LBL, [x - C.l / 2 + 0.02, P.h + C.h + 0.03, z], [0, 0, -10]), 'labels (carefully hand-lettered)'));
    k++; }
}
function table(g, T, label, look = WOOD) {
  const cx = (T.x0 + T.x1) / 2, cz = (T.z0 + T.z1) / 2;
  g.add(tag(box(T.x1 - T.x0, 0.04, T.z1 - T.z0, look, [cx, T.h - 0.02, cz]), label));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(tag(box(0.04, T.h - 0.04, 0.04, look, [cx + sx * ((T.x1 - T.x0) / 2 - 0.035), (T.h - 0.04) / 2, cz + sz * ((T.z1 - T.z0) / 2 - 0.035)]), label));
  return [cx, cz];
}
function lamp(g, at, y, label) {
  g.add(tag(cyl(0.07, 0.09, 0.26, { grey: 0.7, col: 0xc0b49a }, [at[0], y + 0.13, at[1]], null, 18), label));
  const sh = mk(new THREE.CylinderGeometry(0.12, 0.17, 0.24, 24, 1, true), { grey: 0.86, col: 0xeee4cc }); sh.position.set(at[0], y + 0.36, at[1]); sh.userData.double = true; g.add(tag(sh, label));
}

function furniture() {
  const g = new THREE.Group();
  g.add(tag(box(RUG.x1 - RUG.x0, 0.012, RUG.z1 - RUG.z0, { grey: 0.42, col: 0x9a2a26, recvShadowLine: true }, [(RUG.x0 + RUG.x1) / 2, 0.006, (RUG.z0 + RUG.z1) / 2]), 'red rug'));
  { const [cx, cz] = table(g, COFFEE_TABLE, 'coffee table');
    g.add(tag(box(0.22, 0.03, 0.28, { grey: 0.82, col: 0xe0d8c4 }, [cx + 0.2, COFFEE_TABLE.h + 0.015, cz], [0, -10, 0]), 'papers / a notebook'));
    g.add(tag(cyl(0.04, 0.035, 0.1, { grey: 0.85, col: 0xe8e0d0 }, [cx - 0.1, COFFEE_TABLE.h + 0.05, cz - 0.1], null, 16), 'mug'));
    g.add(tag(box(0.18, 0.025, 0.24, { grey: 0.3, col: 0x3a4a6a }, [cx + 0.45, COFFEE_TABLE.h + 0.045, cz + 0.05], [0, 14, 0]), 'textbook')); }
  { const [cx, cz] = table(g, END_TABLE_E, END_TABLE_E.label); lamp(g, [cx, cz], END_TABLE_E.h, 'table lamp (off)'); }
  table(g, END_TABLE_W, END_TABLE_W.label);
  { const L = LOVESEAT; g.add(tag(upholstered([(L.x0 + L.x1) / 2, (L.z0 + L.z1) / 2], -90, L.z1 - L.z0, L.x1 - L.x0, { cushions: 2 }), L.label)); }
  { const A = ARMCHAIR; g.add(tag(upholstered(A.at, A.yaw, A.w, A.d, { seat: A.seat, back: A.back, arm: A.arm }), 'armchair')); }
  plants(g);
  g.add(tag(box(PRINT.w, PRINT.h, 0.03, { grey: 0.4, col: 0x6a6050 }, [PRINT.x, PRINT.y, PRINT.z]), 'framed print (invented)'));
  // the far part: mirror, piano + bench, floor lamp, dining table + six chairs
  { const M = MIRROR; g.add(tag(box(0.03, M.y1 - M.y0, M.z1 - M.z0, { grey: 0.62, col: 0x9aa4a8 }, [M.x - 0.02, (M.y0 + M.y1) / 2, (M.z0 + M.z1) / 2]), 'giant mirror (not reflecting in these renders)'));
    g.add(tag(box(0.045, M.y1 - M.y0 + 0.08, M.z1 - M.z0 + 0.08, { grey: 0.4, col: 0x6a5a40 }, [M.x - 0.01, (M.y0 + M.y1) / 2, (M.z0 + M.z1) / 2]), 'giant mirror frame')); }
  g.add(piano());
  { const B = BENCH; const [cx, cz] = table(g, { ...B, h: B.h }, B.label, EBONY); g.add(tag(box(B.x1 - B.x0, 0.06, B.z1 - B.z0, { grey: 0.2, col: 0x2a2226 }, [cx, B.h + 0.03, cz]), B.label)); }
  { const F = FLOOR_LAMP; g.add(tag(cyl(0.14, 0.14, 0.03, WOOD_D, [F.at[0], 0.015, F.at[1]], null, 18), F.label)); g.add(tag(cyl(0.012, 0.012, F.h - 0.3, WOOD_D, [F.at[0], (F.h - 0.3) / 2, F.at[1]], null, 8), F.label));
    const sh = mk(new THREE.CylinderGeometry(0.16, 0.22, 0.3, 24, 1, true), { grey: 0.86, col: 0xeee4cc }); sh.position.set(F.at[0], F.h - 0.15, F.at[1]); sh.userData.double = true; g.add(tag(sh, F.label)); }
  { const t = DINING.table, [cx, cz] = t.c; const top = new THREE.Shape(), r = t.d / 2, hw = t.w / 2 - r;
    top.moveTo(-hw, -r); top.lineTo(hw, -r); top.absarc(hw, 0, r, -Math.PI / 2, Math.PI / 2, false); top.lineTo(-hw, r); top.absarc(-hw, 0, r, Math.PI / 2, 3 * Math.PI / 2, false);
    const m = mk(new THREE.ExtrudeGeometry(top, { depth: 0.04, bevelEnabled: false }), WOOD); m.rotation.x = -Math.PI / 2; m.position.set(cx, t.h - 0.04, cz); g.add(tag(m, DINING.label));
    for (const sx of [-1, 1]) g.add(tag(box(0.08, t.h - 0.04, 0.5, WOOD, [cx + sx * (hw - 0.05), (t.h - 0.04) / 2, cz]), DINING.label));
    const CH = { grey: 0.45, col: 0x7a5a3a };
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(tag(kitchenChair([cx + sx * 0.45, cz + sz * (r + 0.2)], sz > 0 ? 180 : 0, CH), 'dining chair'));
    for (const sx of [-1, 1]) g.add(tag(kitchenChair([cx + sx * (hw + r + 0.18), cz], sx > 0 ? -90 : 90, CH), 'dining chair')); }
  return g;
}

// the UNFOLDED sweatshirt held up against her: the front's upper part (seal) from the collar down to her knees, the lower
// part folding forward over them to the hem band; sleeves hanging beside it; the IAS seal almost the whole front.
function sweatshirt() {
  const g = new THREE.Group(); const S = SHIRT, t = S.thick, WHITE = { grey: 0.95, col: S.color, recvShadowLine: true }, RIB = { grey: 0.9, col: 0xe8e6e0, recvShadowLine: true };
  const P = (p, ...terms) => terms.reduce((s, [v, k]) => s.map((c, i) => c + v[i] * k), p.slice());
  const r = S.r, n = S.n, hw = S.chest / 2;
  // a flat panel between two edge points (left-right half width w0 at a, w1 at b), thickness t along n
  const panel = (a, b, w0, w1, look, label, off = 0) => { const q = (c, w, s) => P(c, [r, s * w], [n, off]);
    const near = [q(a, w0, -1), q(a, w0, 1), q(b, w1, 1), q(b, w1, -1)].map((p) => P(p, [n, t / 2])), far = [q(a, w0, -1), q(a, w0, 1), q(b, w1, 1), q(b, w1, -1)].map((p) => P(p, [n, -t / 2]));
    g.add(tag(hexa(near, far, look), label)); };
  const nb = (() => { const c = [S.b[1] * r[2] - S.b[2] * r[1], S.b[2] * r[0] - S.b[0] * r[2], S.b[0] * r[1] - S.b[1] * r[0]]; const l = Math.hypot(...c); return c.map((v) => v / l); })();
  panel(S.T, S.K, hw, hw, WHITE, 'IAS sweatshirt (white, unfolded, held up)');
  { const hem0 = P(S.K, [S.b, S.lower - 0.06]); // lower part over her knees, then the ribbed hem band
    const q = (c, s) => P(c, [r, s * hw]); const lay = (a, b, look) => { const near = [q(a, -1), q(a, 1), q(b, 1), q(b, -1)].map((p) => P(p, [nb, t / 2 * Math.sign(nb[1] || 1)])), far = [q(a, -1), q(a, 1), q(b, 1), q(b, -1)].map((p) => P(p, [nb, -t / 2 * Math.sign(nb[1] || 1)])); g.add(tag(hexa(near, far, look), 'IAS sweatshirt (white, unfolded, held up)')); };
    lay(S.K, hem0, WHITE); lay(hem0, S.H, RIB); }
  // sleeves: hanging from the shoulder corners beside the body, a little behind it, cuffs at the bottom
  for (const s of [-1, 1]) { const sh0 = P(S.T, [r, s * (hw + S.sleeve.w0 / 2 - 0.02)], [S.a, -0.04]), end = P(sh0, [S.a, -S.sleeve.len * 0.75], [r, s * 0.03]);
    const c0 = P(sh0, [n, -0.015]), c1 = P(end, [n, -0.015]); const half0 = S.sleeve.w0 / 2, half1 = S.sleeve.w1 / 2;
    const near = [P(c0, [r, -half0]), P(c0, [r, half0]), P(c1, [r, half1]), P(c1, [r, -half1])].map((p) => P(p, [n, t / 2])), far = near.map((p) => P(p, [n, -t]));
    g.add(tag(hexa(near, far, WHITE), 'sweatshirt sleeve'));
    const cuffEnd = P(c1, [S.b, 0.07]); const nearC = [P(c1, [r, -half1]), P(c1, [r, half1]), P(cuffEnd, [r, half1]), P(cuffEnd, [r, -half1])], farC = nearC.map((p) => P(p, [nb, -t]));
    g.add(tag(hexa(nearC, farC, RIB), 'sweatshirt cuff')); }
  // crew-neck collar: a ribbed half ring at the top centre, opening down
  { const tor = mk(new THREE.TorusGeometry(0.08, 0.013, 8, 24, Math.PI), RIB); const basis = new THREE.Matrix4().makeBasis(V(r), V(S.a), V(n));
    tor.quaternion.setFromRotationMatrix(basis); tor.rotateZ(Math.PI); tor.position.copy(V(P(S.T, [S.a, 0.0], [n, t / 2 + 0.004]))); g.add(tag(tor, 'sweatshirt collar (ribbed)')); }
  // the seal: a dark-blue ring (the lettering band), two standing figures inside (TRUTH left, BEAUTY right as one faces it)
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(r), V(S.a), V(n)));
  const sc = V(SEAL.centre), NAVY = { grey: 0.18, col: S.seal };
  const ring = mk(new THREE.RingGeometry(S.sealR * 0.80, S.sealR, 56), NAVY); ring.quaternion.copy(q); ring.position.copy(sc); ring.userData.double = true; g.add(tag(ring, 'IAS seal (Truth, Beauty)', true));
  const inner = mk(new THREE.RingGeometry(S.sealR * 0.74, S.sealR * 0.77, 56), NAVY); inner.quaternion.copy(q); inner.position.copy(sc); inner.userData.double = true; g.add(tag(inner, 'IAS seal (Truth, Beauty)', true));
  for (const s of [-1, 1]) { const fc = sc.clone().addScaledVector(V(r), s * S.sealR * 0.32);
    const body = mk(new THREE.PlaneGeometry(0.045, 0.17), NAVY); body.quaternion.copy(q); body.position.copy(fc.clone().addScaledVector(V(S.a), -0.02)); body.userData.double = true; g.add(tag(body, s < 0 ? 'seal: TRUTH (left)' : 'seal: BEAUTY (right)', true));
    const head = mk(new THREE.CircleGeometry(0.018, 16), NAVY); head.quaternion.copy(q); head.position.copy(fc.clone().addScaledVector(V(S.a), 0.085)); head.userData.double = true; g.add(tag(head, s < 0 ? 'seal: TRUTH (left)' : 'seal: BEAUTY (right)', true)); }
  // label mode only: the words, so the guide reads which way up and which side is which
  { const tex = textTexture([{ text: 'TRUTH      BEAUTY', font: 'bold 64px DejaVu Sans, sans-serif' }], { w: 1024, h: 160, fg: '#1c2a5a', bg: 'rgba(255,255,255,0)' });
    const R = S.sealR * 0.75, c0 = sc.clone().addScaledVector(V(n), 0.003).addScaledVector(V(S.a), -S.sealR * 0.42), hr = V(r).multiplyScalar(R), ha = V(S.a).multiplyScalar(R * 0.12);
    g.add(tag(quad([c0.clone().sub(hr).add(ha), c0.clone().add(hr).add(ha), c0.clone().add(hr).sub(ha), c0.clone().sub(hr).sub(ha)], { grey: 0.95, map: tex, only: ['label'] }), 'seal lettering (label mode)')); }
  return g;
}

// plain cork sandals (Naot-type) under his bare feet
function sandals(fig) {
  const g = new THREE.Group(); const P = fig.userData.P;
  for (const n of ['L', 'R']) { const heel = P['heel' + n].clone(), toe = P['toe' + n].clone(); const d = toe.clone().sub(heel); d.y = 0; d.normalize();
    const side = new THREE.Vector3(d.z, 0, -d.x), a = heel.clone().addScaledVector(d, -0.008), b = toe.clone().addScaledVector(d, 0.008); a.y = b.y = 0.014;
    g.add(slab(a, b, 0.095, 0.028, side, CORK));
    for (const t of [0.42, 0.68]) { const p = a.clone().lerp(b, t); p.y = 0.05; g.add(slab(p.clone().addScaledVector(side, -0.05), p.clone().addScaledVector(side, 0.05), 0.028, 0.006, d, STRAP)); } }
  return tag(g, 'cork sandals (Naot-type)');
}

export const NAMED = { shirt: SHIRT.c, seal: SEAL.centre, collar: SHIRT.T, ...GRIP };
delete NAMED.r;
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(room()); root.add(couch()); root.add(furniture()); root.add(sweatshirt());
  const solids = [], sunk = [];
  for (const A of Object.values(APERTURES)) if (A) { solids.push(beamSolid({ aperture: A, dir: BEAM.dir, clip: BEAM.clip, length: 12 })); sunk.push(beamSolid({ aperture: A, dir: BEAM.dir, clip: BEAM.clip, length: 12, sink: 0.01 })); }
  if (!shot.beamMask) {
    for (const s of solids) root.add(tag(beamWire(s, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }, 0.004), 'sun shaft (volume edges)'));
    for (const s of sunk) root.add(tag(beamMesh(s, { glass: true, col: SUN.color, opacity: 0.08 }), 'sun shaft (volume)'));
  }

  const { figs } = stage(shot.figs || {}, null, (t) => (NAMED[t] ? V(NAMED[t]) : null));
  for (const f of Object.values(figs)) { root.add(f); f.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, recvShadowLine: true }; }); }
  if (figs.firstLove27 && shot.sandals !== false) root.add(sandals(figs.firstLove27));
  const cs = { ...shot, orbit: shot.orbit ? { ...shot.orbit, at: fix(shot.orbit.at) } : undefined, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  hideLabels(root, shot.hide);
  const cam = makeCam(shot);

  const winC = V((PICTURE.x0 + PICTURE.x1) / 2, (PICTURE.sill + PICTURE.head) / 2, 0), sunFrom = winC.clone().addScaledVector(V(SUN_DIR), -10);
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); s.position.copy(sunFrom); s.target.position.copy(sunFrom).add(V(SUN_DIR)); s.castShadow = true;
    const c = s.shadow.camera; c.left = -6.5; c.right = 6.5; c.top = 6.5; c.bottom = -6.5; c.near = 0.5; c.far = 26; c.updateProjectionMatrix(); s.shadow.radius = 2.5; return s; };
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSun(0xffffff, 3)];
    if (mode === 'lit') { const sky = new THREE.DirectionalLight(0xc8d4e8, 0.7); sky.position.set(-2.0, 2.0, 3); sky.target.position.set(2.5, 0.6, -2);
      return [mkSun(SUN.color, 3.0), sky, new THREE.AmbientLight(0x9aa2b0, 0.75)]; }
    const d = new THREE.DirectionalLight(0xffffff, 0.55); d.position.set(4.0, 3.0, -3.0);
    return [mkSun(0xffffff, 2.2), new THREE.AmbientLight(0xffffff, 1.25), d];
  };
  if (shot.beamMask) applyBeamMask(root, solids, { label: 'sun shaft (mask)', cam, surfaceOnly: !!shot.beamSurf });

  const lights = [{ name: 'sun', kind: LIGHTS.sun.kind, pos: sunFrom, aim: V(SHIRT.c), color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true },
    { name: 'sky', kind: LIGHTS.sky.kind, pos: winC.clone().add(V(0, 0, 1)), aim: V(HER.at[0], 1.0, HER.at[1]), color: '#dfe6f0', on: true }];
  const W = PICTURE, Pq = (x, y) => V(x, y, W.z), Ww = WIN_W, Wq = (z, y) => V(Ww.x, y, z);
  const panes = { front_window: [Pq(W.x1, W.head), Pq(W.x0, W.head), Pq(W.x0, W.sill), Pq(W.x1, W.sill)],   // TL,TR,BR,BL seen from inside (looking south)
    west_window: [Wq(Ww.z1, Ww.head), Wq(Ww.z0, Ww.head), Wq(Ww.z0, Ww.sill), Wq(Ww.z1, Ww.sill)] };          // seen from inside (looking west)
  const sc = V(SEAL.centre), sr = V(SHIRT.r), sa = V(SHIRT.a), R = SHIRT.sealR;
  panes.seal_square = [sc.clone().addScaledVector(sr, -R).addScaledVector(sa, R), sc.clone().addScaledVector(sr, R).addScaledVector(sa, R), sc.clone().addScaledVector(sr, R).addScaledVector(sa, -R), sc.clone().addScaledVector(sr, -R).addScaledVector(sa, -R)];

  const anchor = V(fix(shot.beamAnchor || 'shirt'));
  const extraOut = (c, P) => {
    const pt = (p) => ({ world: r3(V(p)), px: P(V(p)) });
    const toCam = c.position.clone().sub(sc).normalize();
    const seal = { label: 'IAS seal (Truth, Beauty)', what: 'Institute for Advanced Study seal, DARK BLUE line print on a WHITE sweatshirt, HUGE: almost the whole front (diameter ' + (2 * R).toFixed(2) + ' m on a ' + SHIRT.chest + ' m chest): round, two standing figures labelled TRUTH (left) and BEAUTY (right)',
      radius_m: R, centre: pt(SEAL.centre), top: pt(SEAL.top), bottom: pt(SEAL.bottom), truth_side: pt(SEAL.truth), beauty_side: pt(SEAL.beauty),
      corner_order: 'panes.seal_square = TL, TR, BR, BL as one faces the front (a painted seal maps straight on)',
      facing: 'out of the front of the sweatshirt she holds up against herself: toward him and the cameras behind him; upright',
      normal_to_camera_deg: +(Math.acos(Math.max(-1, Math.min(1, V(SHIRT.n).dot(toCam)))) * 180 / Math.PI).toFixed(0),
      reads_upright_on_screen: (() => { const a = P(V(SEAL.bottom)), b = P(V(SEAL.top)); return a && b ? b[1] < a[1] : null; })(),
      sun_on_front: { cos_incidence: sunCos(SHIRT.n), note: 'negative = the sun is BEHIND the front: the seal is in the windows\' skylight; the sun lights the back of the sweatshirt and rims its edges' } };
    const he = figs.firstLove27?.userData.P, she = figs.jade27?.userData.P;
    return {
      time: FILM.time, plan_time: FILM.time, section: FILM.section, position: shot.position || null,
      film: { ...FILM, year: YEAR, place: 'Morton Grove, IL: the house she commuted from to Northwestern (Evanston); he had transferred from Harvard to Princeton' },
      house: { ...HOUSE, ceiling: { kind: 'vaulted (cathedral), Jade', ridge: VAULT.ridge + ' at z ' + VAULT.z + ' (Jade: parallel to the street; its position on the house centre line is a GUESS)', plate_m: ROOM.h, peak_m: VAULT.peak, pitch: '4 in 12' },
        axes: 'x = east, z = south, y up; origin = inner SW corner of the living room', great_room_m: { x: [JOG.xW, ROOM.x1], z: [ROOM.z0, ROOM.z1], jog_z: JOG.z },
        orientation: 'Jade\'s drawing: TOP = SOUTH (street), RIGHT = WEST, LEFT = EAST, BOTTOM = NORTH (reasoned: the front door in the jog faces the top; the couch and window share the top wall as Jade described the front wall)',
        couch: 'against the FRONT (south) wall, its west end just short of the front window (Jade, and the drawing)' },
      sweatshirt: { colour: 'white', state: 'UNFOLDED, held up against her by the shoulder seams, the front toward him (Jade: the seal is huge and only reads unfolded)', chest_m: SHIRT.chest, length_m: +(SHIRT.upper + SHIRT.lower).toFixed(2),
        collar: pt(SHIRT.T), seal, grips: Object.fromEntries(['herL', 'herR'].map((k) => [k, pt(GRIP[k])])),
        note: 'her two hands close on the shoulder seams (thumbs behind, fingers over the top); the body hangs in front of her and folds forward over her knees; sleeves hang beside it' },
      first_love: { who: 'first love (a real person: never named, never face-on)', face_shown: false,
        facing_camera_deg: he ? +(Math.acos(Math.max(-1, Math.min(1, he.headFwd.dot(c.position.clone().sub(he.head).normalize())))) * 180 / Math.PI).toFixed(0) : null,
        hair: 'dark brown, straight: centre part, crisp top half over a grown-out buzzed lower part (cast sheets v3)', feet: 'Birkenstock-type cork sandals (Naot), bare feet', forearms: 'sleeves pushed up: FOREARM HAIR CLEARLY VISIBLE',
        hands: 'same absolute size as hers (18.3 cm); feet 24.8 cm (cast kind adultFirstLove)' },
      jade: { cast: 'jade27 (kind adultJade27) standing in for Jade at about 24; no closer age in the cast table' },
      sun: { scene: SCENE, elevation_deg: SUN.altitude, azimuth_deg: SUN.azimuth, travel_dir: SUN_DIR.map((v) => +v.toFixed(4)), note: 'computed for Morton Grove (NOAA equations); date and time are a STAGING CHOICE (sweep.mjs)',
        in_sun_margin_m: { her_eyes: she ? sunMargins(she.eyes.toArray()) : null, her_head: she ? sunMargins(she.head.toArray()) : null, seal: sunMargins(SEAL.centre), his_head: he ? sunMargins(he.head.toArray()) : null },
        seal_front_cos: sunCos(SHIRT.n) },
      beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid: solids[0], anchor, P, cam: c, extra: { sun_altitude_deg: SUN.altitude, sun_azimuth_deg: SUN.azimuth, solids: Object.keys(APERTURES).filter((k) => APERTURES[k]), note: 'solid[0] = the front window (the others: west, dining), each narrowed by its wall reveal for this sun; eaves not modelled (a low sun passes under them)' } }),
      points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'chin', 'handL', 'handR', 'hip', 'shoulderC', 'kneeL', 'kneeR'].map((k) => [k, r3(f.userData.P[k])]))])),
    };
  };
  return { set: 'mortongrove07', scene, root, cam, rig, near: shot.near ?? 0.05, far: shot.far ?? 20, figs, book: null, panes, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor,
    litBg: 0x202020, flatBg: shot.beamMask ? 0x000000 : 0xe0ddd4, extra: extraOut };
}
