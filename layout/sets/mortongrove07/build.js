// Build one mortongrove07 shot: the main floor of 5748 Capri Lane as Jade drew it (from layout.js; compass axes, x east,
// z south): the living room (floral couch against the front wall beside the window, red rug, egg-carton plant table under
// the west window), the piano / mirror / dining / entry part behind it, the vault with its ridge parallel to the street;
// her seated, first love handing her the FOLDED IAS hoodie (shot.hoodie 'folded') or her lifting it as it UNFOLDS ('unfolding'); the real
// afternoon sun (SCENE) through the front, west and dining windows.
//   shot.beamMask (the twins beam_<id>): flat mode = the sun shafts white on black (sets/_beam.js applyBeamMask)
import * as THREE from 'three';
import { mk, box, cyl, quad, slab, tag, V, rad, textTexture } from '../../engine/core.js';
import { CAST } from '../_cast.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, beamMesh, beamWire, beamSidecar, applyBeamMask } from '../_beam.js';
import { wall, hexa, kitchenChair, r3, hideLabels } from '../basement90/kit.js';
import { YEAR, FILM, HOUSE, SCENE, SUN, SUN_DIR, APERTURES, BEAM, sunMargin, sunMargins, sunCos, ROOM, JOG, VAULT, ceilY, DROP, ceilAt, PICTURE, WIN_W, WIN_D, FRONT_DOOR, SLIDER,
  KITCHEN, STAIR, COUCH, END_TABLE_E, END_TABLE_W, RUG, COFFEE_TABLE, LOVESEAT, ARMCHAIR, PLANTS, PRINT, MIRROR, PIANO, BENCH, FLOOR_LAMP, CLOSET, DINING,
  HER, HIM, SHIRT, GRIP, SEAL, FOLD, FSEAL, TURN, GARMENT, LIGHTS } from './layout.js';

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
// `flat` = under the dining part's flat 8-ft ceiling (DROP); `y0` = the bottom edge (a soffit hangs from y0 up to the vault)
function vwall({ axis, at, a0, a1, t, out, holes = [], look, label, flat = false, y0 = 0 }) {
  const top = (a) => (flat ? DROP.y : axis === 'x' ? ceilY(a) : ceilY(at)) + VAULT.t;
  const pts = [[a0, y0], [a1, y0], [a1, top(a1)]]; if (!flat && axis === 'x' && VAULT.z > Math.min(a0, a1) && VAULT.z < Math.max(a0, a1)) pts.push([VAULT.z, top(VAULT.z)]); pts.push([a0, top(a0)]);
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
  // round 3: the vault (ridge at z -3.6, 3.6 m) over the living room and the piano / mirror side; the dining part under a
  // flat 8-ft ceiling (DROP) with two soffits where the vault rises from it (facing east to the piano, south to the couch)
  vault(x0 - T, x1 + T, zJ, z1 + T, CEIL, g); vault(DROP.x1, x1 + T, z0 - Ti, zJ, CEIL, g);
  g.add(tag(box(DROP.x1 - xW + T, VAULT.t, zJ - z0 + Ti, CEIL, [(xW - T + DROP.x1) / 2, DROP.y + VAULT.t / 2, (zJ + z0 - Ti) / 2]), DROP.label));
  g.add(vwall({ axis: 'x', at: DROP.x1, a0: z0 - Ti, a1: zJ, t: 0.08, out: -1, y0: DROP.y, look: PLASTER, label: 'soffit: the dining ceiling drops to 8 ft (facing the piano)' }));
  g.add(vwall({ axis: 'z', at: zJ, a0: x0, a1: DROP.x1, t: 0.08, out: -1, y0: DROP.y, look: PLASTER, label: 'soffit: the dining ceiling drops to 8 ft (facing the living room)' }));
  // walls
  const P = PICTURE, Ww = WIN_W, Wd = WIN_D, D = FRONT_DOOR, S = SLIDER, St = STAIR;
  g.add(vwall({ axis: 'z', at: z1, a0: x0 - T, a1: x1 + T, t: T, out: 1, holes: [{ a0: P.x0, a1: P.x1, y0: P.sill, y1: P.head }], look: PLASTER, label: 'front wall (south, Capri Lane)' }));
  g.add(vwall({ axis: 'x', at: x0, a0: zJ, a1: z1, t: T, out: -1, holes: [{ a0: Ww.z0, a1: Ww.z1, y0: Ww.sill, y1: Ww.head }], look: PLASTER, label: 'west wall of the living room (egg-carton window)' }));
  g.add(vwall({ axis: 'z', at: zJ, a0: xW - T, a1: x0, t: T, out: 1, holes: [{ a0: D.x0, a1: D.x1, y0: 0, y1: D.h }], look: PLASTER, flat: true, label: 'entry wall (front door, faces the street)' }));
  g.add(vwall({ axis: 'x', at: xW, a0: z0 - Ti, a1: zJ, t: T, out: -1, holes: [{ a0: Wd.z0, a1: Wd.z1, y0: Wd.sill, y1: Wd.head }], look: PLASTER, flat: true, label: 'west wall (dining window; under the flat dining ceiling)' }));
  g.add(vwall({ axis: 'z', at: z0, a0: xW - T, a1: x1 + T, t: Ti, out: -1, holes: [{ a0: S.x0, a1: S.x1, y0: 0, y1: S.h }], look: PLASTER, label: 'north wall (sliding door to the kitchen)' }));
  g.add(vwall({ axis: 'x', at: x1, a0: z0 - Ti, a1: z1 + T, t: Ti, out: 1, holes: [{ a0: St.z0, a1: St.z1, y0: 0, y1: ROOM.h - 0.06 }], look: PLASTER, label: 'east wall (the full gable: mirror, piano; split-level wing beyond)' }));
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

// A GRAND PIANO WITH A REAL GRAND'S OUTLINE (round 3, Jade: "the correct shape of an actual grand piano"), modelled on a
// Steinway B (211 x 148 cm). Plan coordinates (u, v): u across from the bass side (the straight SPINE, u = 0) to the
// treble side (u = W); v from the front of the keyboard (v = 0) back to the tail (v = L). The rim: the straight spine;
// the front (keyboard) edge; a short straight treble side; the BENTSIDE, first concave (curving in toward the spine),
// then convex round the TAIL, which meets the spine at a rounded corner. Two cubic Beziers, tangent-continuous.
export function grandOutline(W, L) {
  const bz = (p0, p1, p2, p3, n) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, s = 1 - t;
    return [0, 1].map((k) => s * s * s * p0[k] + 3 * s * s * t * p1[k] + 3 * s * t * t * p2[k] + t * t * t * p3[k]); });
  const kx = W / 1.48, ky = L / 2.11, P = (u, v) => [u * kx, v * ky];
  const pts = [P(0, 0), P(1.48, 0), P(1.48, 0.40)];                                                   // front edge, treble straight
  pts.push(...bz(P(1.48, 0.40), P(1.48, 0.98), P(1.02, 1.18), P(0.82, 1.47), 16));                      // bentside, concave
  pts.push(...bz(P(0.82, 1.47), P(0.62, 1.77), P(0.50, 2.11), P(0.16, 2.11), 14));                      // tail, convex
  pts.push(P(0.06, 2.095), P(0.01, 2.06), P(0, 2.00));                                                  // rounded tail-spine corner
  return pts;                                                                                         // closes back to (0, 0) along the spine
}
// world: spine at x = spineX, u runs WEST (-x); keyboard front at z = kbZ, v runs SOUTH (+z). The case (rim) from the
// fallboard line (v = kbDepth) back, between caseY0 and caseY1; the lid closed on it with its front flap folded back and
// the music desk up; in front of the fallboard the keys between two cheek blocks; three legs; the lyre with three pedals.
function piano() {
  const g = new THREE.Group(); const P = PIANO, W = P.W, L = P.L, kd = P.kbDepth;
  const toW = ([u, v]) => [P.spineX - u, P.kbZ + v];
  const extrude = (pts, y0, y1, look, label) => { const sh = new THREE.Shape(); pts.forEach((p, i) => { const [x, z] = toW(p); i ? sh.lineTo(x, -z) : sh.moveTo(x, -z); });
    const m = mk(new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false, curveSegments: 1 }), look); m.rotation.x = -Math.PI / 2; m.position.y = y0; return g.add(tag(m, label)), m; };
  const out = grandOutline(W, L);
  const rim = out.map(([u, v]) => [u, Math.max(v, kd)]);                                               // the case behind the fallboard
  extrude(rim, P.caseY0, P.caseY1, EBONY, P.label + ' (rim)');
  // the lid (closed), a touch proud of the rim; its front flap folded back on top of it (hinged at v = kd + 0.33)
  const lidOut = out.map(([u, v]) => [u, Math.max(v, kd + 0.33)]);
  extrude(lidOut, P.caseY1, P.caseY1 + 0.025, { grey: 0.16, col: 0x1c1c22 }, 'piano lid (closed)');
  extrude([[0.02, kd + 0.33], [W - 0.02, kd + 0.33], [W - 0.02, kd + 0.60], [0.02, kd + 0.60]], P.caseY1 + 0.025, P.caseY1 + 0.045, { grey: 0.18, col: 0x202026 }, 'piano lid: front flap folded back');
  // music desk, up, leaning back, standing on the front of the case
  { const [x, z] = toW([W / 2, kd + 0.16]); g.add(tag(box(W * 0.62, 0.32, 0.025, EBONY, [x, P.caseY1 + 0.19, z], [-14, 0, 0]), 'piano music desk')); }
  // keybed and keys (v 0..kd) between the two cheek blocks (the bass and treble arms)
  const cheek = 0.075; { const [x, z] = toW([W / 2, kd / 2]);
    g.add(tag(box(W, 0.07, kd, EBONY, [x, 0.655, z]), 'piano keybed / key slip'));
    g.add(tag(box(W - 2 * cheek, 0.025, kd - 0.06, { grey: 0.92, col: 0xf2eee2 }, [x, 0.705, z - 0.03]), 'piano keys'));
    g.add(tag(box(W - 2 * cheek, 0.012, kd * 0.5 - 0.06, { grey: 0.1, col: 0x101010 }, [x, 0.722, z + 0.02]), 'piano keys (sharps)'));
    g.add(tag(box(W - 2 * cheek, P.caseY1 - 0.73, 0.03, EBONY, [x, (P.caseY1 + 0.73) / 2, P.kbZ + kd - 0.015]), 'piano fallboard / nameboard')); }
  for (const u of [cheek / 2, W - cheek / 2]) { const [x, z] = toW([u, kd / 2]); g.add(tag(box(cheek, 0.17, kd, EBONY, [x, 0.705, z]), 'piano cheek block')); }
  // three legs: two under the keyboard's ends, one under the tail; tapered, on casters
  for (const [u, v] of [[0.14, 0.24], [W - 0.14, 0.24], [0.42, L - 0.30]]) { const [x, z] = toW([u, v]);
    g.add(tag(cyl(0.06, 0.04, P.caseY0 - 0.05, EBONY, [x, (P.caseY0 + 0.05) / 2, z], null, 14), 'piano leg'));
    g.add(tag(cyl(0.03, 0.03, 0.05, { grey: 0.6, col: 0xb09040 }, [x, 0.025, z], null, 10), 'piano caster')); }
  // the lyre: two posts from the case bottom to a pedal box, three pedals pointing toward the bench (north, -v)
  { const v = kd + 0.30, [x, z] = toW([W * 0.5, v]);
    for (const s of [-1, 1]) g.add(tag(box(0.035, P.caseY0 - 0.12, 0.035, EBONY, [x + s * 0.09, (P.caseY0 + 0.12) / 2, z]), 'piano lyre'));
    g.add(tag(box(0.30, 0.09, 0.10, EBONY, [x, 0.075, z]), 'piano lyre (pedal box)'));
    for (const s of [-1, 0, 1]) g.add(tag(box(0.035, 0.012, 0.11, { grey: 0.65, col: 0xc0a050 }, [x + s * 0.07, 0.07, z - 0.10]), 'piano pedal'));
    g.add(tag(cyl(0.012, 0.012, 0.12, EBONY, [x, 0.06, z + 0.05], [0, 0, 0], 8), 'piano lyre brace')); }
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
  // the framed picture over the couch (round 3: 4x larger, 1.4 x 1.0 m; its subject is not known: a plain panel in a frame)
  g.add(tag(box(PRINT.w, PRINT.h, 0.035, { grey: 0.3, col: 0x4a3e30 }, [PRINT.x, PRINT.y, PRINT.z]), 'framed picture (frame)'));
  g.add(tag(box(PRINT.w - 0.12, PRINT.h - 0.12, 0.01, { grey: 0.55, col: 0x8a8270 }, [PRINT.x, PRINT.y, PRINT.z - 0.02]), 'framed picture (subject unknown)'));
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

// The IAS seal as a group in its own plane: x = right as one faces the print, y = up, z = out of the cloth. `cut` (m below
// the centre, or null) = a fold line: everything below it is hidden under the cloth (the disc, ring and figures clipped).
function sealGroup(R, cut, S) {
  const g = new THREE.Group(), BLUE = { grey: 0.38, col: S.seal }, REV = { grey: 0.95, col: S.color }, SL = 'IAS seal (blue filled-disc chest print)';
  const c = cut == null || cut >= R ? null : cut;
  const discShape = (r) => { const sh = new THREE.Shape(); if (c == null) { sh.absarc(0, 0, r, 0, Math.PI * 2, false); return sh; }
    const t0 = Math.asin(Math.max(-1, Math.min(1, -c / r))); sh.absarc(0, 0, r, t0, Math.PI - t0, false); sh.closePath(); return sh; };
  const add = (geom, look, z, label) => { const m = mk(geom, look); m.position.z = z; m.userData.double = true; g.add(tag(m, label, true)); return m; };
  add(new THREE.ShapeGeometry(discShape(R), 56), BLUE, 0, SL);
  // thin white ring inside the edge (an arc if clipped)
  { const r0 = R * 0.86, r1 = R * 0.89, rm = (r0 + r1) / 2; let ts = 0, tl = Math.PI * 2;
    if (c != null && c < rm) { const t0 = Math.asin(-c / rm); ts = t0; tl = Math.PI - 2 * t0; }
    add(new THREE.RingGeometry(r0, r1, 56, 1, ts, tl), REV, 0.0012, SL); }
  // two standing figures (placeholders: bars and heads), TRUTH left, BEAUTY right; clipped at the cut
  for (const s of [-1, 1]) { const x = s * R * 0.22, lab = s < 0 ? 'seal: TRUTH (left)' : 'seal: BEAUTY (right)';
    let y0 = -R * 0.12 - R * 0.475, y1 = -R * 0.12 + R * 0.475; if (c != null) y0 = Math.max(y0, -c);
    if (y1 > y0) { const m = add(new THREE.PlaneGeometry(R * 0.2, y1 - y0), REV, 0.0012, lab); m.position.set(x, (y0 + y1) / 2, 0.0012); }
    const hy = R * 0.45; if (c == null || hy > -c) { const m = add(new THREE.CircleGeometry(R * 0.09, 16), REV, 0.0012, lab); m.position.set(x, hy, 0.0012); } }
  // label mode only: the words, so the guide reads which way up and which side is which
  { const tex = textTexture([{ text: 'TRUTH   BEAUTY', font: 'bold 50px DejaVu Sans, sans-serif' }], { w: 1024, h: 160, fg: '#ffffff', bg: 'rgba(0,0,0,0)' });
    const m = mk(new THREE.PlaneGeometry(R * 1.6, R * 0.26), { grey: 0.95, map: tex, only: ['label'] }); m.position.set(0, R * 0.3, 0.003); m.userData.double = true; g.add(tag(m, 'seal lettering (label mode)', true)); }
  return g;
}
const orientSeal = (g, right, up, out, at) => { const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(right), V(up), V(out)));
  g.quaternion.copy(q); g.position.copy(V(at)); return g; };

// FOLDED (MG1): the stack between his hands and hers, the front on top with the neckline at her end, the seal upright for
// the camera behind him; the waistband end folded up over the front from his end, its ribbed edge across the seal.
function hoodieFolded() {
  const g = new THREE.Group(); const S = FOLD;
  const WHITE = { grey: 0.95, col: S.color, recvShadowLine: true }, RIB = { grey: 0.9, col: 0xe8e6e0, recvShadowLine: true }, STR = { grey: 0.85, col: 0xe2dfd8 };
  const basis = new THREE.Matrix4().makeBasis(V(S.u), V(S.n), V(S.w)).premultiply(new THREE.Matrix4());
  // makeBasis needs a right-handed frame: u x n should = w; if not, flip the local x
  const hand = V(S.u).cross(V(S.n)).dot(V(S.w)) > 0 ? 1 : -1;
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(S.u).multiplyScalar(hand), V(S.n), V(S.w))); void basis;
  const pc = V(S.c); const L = (x, y, z) => pc.clone().add(V(x * hand, y, z).applyQuaternion(q));   // x along u (his left), y up (n), z toward her (w)
  const put = (m, p, label) => { m.position.copy(p); m.quaternion.copy(q); g.add(tag(m, label)); return m; };
  const T = S.thick, A = S.along, W = S.across, BODY = 'IAS hoodie (white, folded)';
  put(box(W, T * 0.55, A, WHITE), L(0, -T * 0.2, 0), BODY);                                  // the folded layers underneath
  put(box(W - 0.012, T * 0.4, A - 0.01, WHITE), L(0, T * 0.25, 0), BODY);                    // the front (top layer)
  // the flap: the waistband end folded up over the front from HIS end (z = -A/2), 0.15 m long, a little proud of the front
  const fl = S.flap, fz = -A / 2 + fl / 2;
  put(box(W - 0.004, 0.014, fl - 0.03, WHITE), L(0, T / 2 + 0.007, fz - 0.015), 'hoodie: lower body folded up over the front (plain back panel)');
  put(box(W - 0.004, 0.016, 0.035, RIB), L(0, T / 2 + 0.008, -A / 2 + fl - 0.0175), 'hoodie waistband (ribbed), its edge across the seal');
  put(box(W, T + 0.016, 0.02, WHITE), L(0, 0.004, -A / 2 - 0.006), 'hoodie: the fold (his end)');
  // the neckline at her end: the hood folded under, its rim a half ring on the top edge
  { const tor = mk(new THREE.TorusGeometry(0.07, 0.013, 8, 24, Math.PI), WHITE);
    tor.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)));
    tor.position.copy(L(0, T / 2 + 0.004, A / 2 - 0.005)); g.add(tag(tor, 'hoodie neckline (hood folded under)')); }
  // two flat drawstrings from the neckline lying across the top toward him (over the upper rim of the seal)
  for (const s of [-1, 1]) put(box(0.01, 0.003, 0.13, STR), L(s * 0.045, T / 2 + 0.004, A / 2 - 0.09), 'hoodie drawstring');
  // the seal on the front, upright for the camera (its top toward her), clipped by the flap's edge
  const right = V(S.u).multiplyScalar(-1), up = V(S.w), out = V(S.n);
  g.add(orientSeal(sealGroup(S.sealR, S.sealCut, S), right, up, out, S.sealC));
  return g;
}

// UNFOLDING (MG2): she has lifted it by the shoulder seams; the front's upper part hangs from her hands, the seal upright
// on it, facing him; below the remaining fold line the lower part swings down and out toward him, half open.
function hoodieUnfolding() {
  const g = new THREE.Group(); const S = SHIRT, t = S.thick, WHITE = { grey: 0.95, col: S.color, recvShadowLine: true }, RIB = { grey: 0.9, col: 0xe8e6e0, recvShadowLine: true };
  const POCK = { grey: 0.92, col: 0xeeebe4, recvShadowLine: true }, STR = { grey: 0.85, col: 0xe2dfd8 };
  const P = (p, ...terms) => terms.reduce((s, [v, k]) => s.map((c, i) => c + v[i] * k), p.slice());
  const r = S.r, n = S.n, hw = S.chest / 2;
  const nb = (() => { const c = [S.b[1] * r[2] - S.b[2] * r[1], S.b[2] * r[0] - S.b[0] * r[2], S.b[0] * r[1] - S.b[1] * r[0]]; const l = Math.hypot(...c); return c.map((v) => v / l); })();
  const nUp = nb.map((v) => v * Math.sign(nb[1] || 1));                       // the upper face of the swinging part (its back panel)
  const slabAB = (a, b, w0, w1, m, look, label, off = 0, th = t) => { const q = (c, w, s) => P(c, [r, s * w], [m, off]);
    const quad4 = [q(a, w0, -1), q(a, w0, 1), q(b, w1, 1), q(b, w1, -1)];
    g.add(tag(hexa(quad4.map((p) => P(p, [m, th / 2])), quad4.map((p) => P(p, [m, -th / 2])), look), label)); };
  slabAB(S.T, S.K, hw, hw, n, WHITE, 'IAS hoodie (white, unfolding): the front, hanging from her hands');
  const hem0 = P(S.K, [S.b, S.lower - 0.06]);
  slabAB(S.K, hem0, hw, hw, nUp, WHITE, 'hoodie: lower part still folded, swinging down (back panel up)'); slabAB(hem0, S.H, hw, hw, nUp, RIB, 'hoodie waistband (ribbed)');
  // the kangaroo pocket is on the swinging part's UNDERSIDE (the front), facing down and away from the camera
  { const a0 = P(S.K, [S.b, 0.04]); slabAB(a0, hem0, S.pocket.wTop / 2, S.pocket.wBot / 2, nUp, POCK, 'hoodie kangaroo pocket (underside)', -(t / 2 + 0.003), 0.004); }
  // the fold itself: a soft roll along the fold line
  { const roll = mk(new THREE.CylinderGeometry(0.012, 0.012, S.chest, 12), WHITE); roll.quaternion.setFromUnitVectors(V(0, 1, 0), V(r)); roll.position.copy(V(S.K)); g.add(tag(roll, 'hoodie: the fold')); }
  // sleeves: hanging from the shoulder corners beside the front, a little behind it, cuffs at the bottom
  for (const s of [-1, 1]) { const sh0 = P(S.T, [r, s * (hw + S.sleeve.w0 / 2 - 0.02)], [S.a, -0.04]), end = P(sh0, [S.a, -S.sleeve.len * 0.75], [r, s * 0.03]);
    const c0 = P(sh0, [n, -0.015]), c1 = P(end, [n, -0.015]); const half0 = S.sleeve.w0 / 2, half1 = S.sleeve.w1 / 2;
    const near = [P(c0, [r, -half0]), P(c0, [r, half0]), P(c1, [r, half1]), P(c1, [r, -half1])].map((p) => P(p, [n, t / 2])), far = near.map((p) => P(p, [n, -t]));
    g.add(tag(hexa(near, far, WHITE), 'hoodie sleeve'));
    const cuffEnd = P(c1, [S.a, -0.07]); const nearC = [P(c1, [r, -half1]), P(c1, [r, half1]), P(cuffEnd, [r, half1]), P(cuffEnd, [r, -half1])], farC = nearC.map((p) => P(p, [n, -t]));
    g.add(tag(hexa(nearC, farC, RIB), 'hoodie cuff')); }
  // the hood hanging down BEHIND the front (between the hoodie and her), its folded top just above the neckline; the neck rim
  { const H = S.hood; slabAB(P(S.T, [S.a, H.up]), P(S.T, [S.a, -H.down]), H.w / 2 * 0.8, H.w / 2, n, WHITE, 'hoodie hood (hanging behind)', -(t + 0.02), 0.03);
    const tor = mk(new THREE.TorusGeometry(0.065, 0.014, 8, 24, Math.PI), WHITE); const basis = new THREE.Matrix4().makeBasis(V(r), V(S.a), V(n));
    tor.quaternion.setFromRotationMatrix(basis); tor.rotateZ(Math.PI); tor.position.copy(V(P(S.T, [S.a, 0.0], [n, t / 2 + 0.006]))); g.add(tag(tor, 'hoodie hood rim (neck opening)')); }
  // two flat drawstrings hanging from the neck opening down over the chest, either side of the print's top
  for (const s of [-1, 1]) { const a0 = P(S.T, [S.a, -0.06], [r, s * S.string.dx]), b0 = P(a0, [S.a, -S.string.len], [r, s * 0.008]);
    slabAB(a0, b0, 0.005, 0.005, n, STR, 'hoodie drawstring', t / 2 + 0.008, 0.004); }
  // the seal, upright, its bottom sliver round the fold line
  g.add(orientSeal(sealGroup(S.sealR, S.sealCut, S), r, S.a, n, comb3(S.c, n, t / 2 + 0.002)));
  return g;
}
const comb3 = (p, v, k) => p.map((c, i) => c + v[i] * k);

// TURNED (MG2_end): no garment geometry here (the cloth module draws it). LABEL MODE ONLY: an outline of where the hoodie
// hangs (the front's 0.58 x 0.69 m rectangle from the collar, its seal circle), so the guide shows the anchor.
function garmentOutline(G) {
  const g = new THREE.Group(), LOOK = { grey: 1, col: 0x2f62a8, emit: 0x2f62a8, flatEmit: 1, only: ['label'] }, hw = SHIRT.chest / 2, len = TURN.length;
  const P = (dr, da) => comb3(comb3(G.origin, G.right, dr), G.up, da);
  const c = [P(-hw, 0), P(hw, 0), P(hw, -len), P(-hw, -len)];
  for (let i = 0; i < 4; i++) g.add(tag(slab(V(c[i]), V(c[(i + 1) % 4]), 0.008, 0.008, V(G.out), LOOK), 'hoodie (cloth module): outline of the front, turned toward her', true));
  const ring = mk(new THREE.RingGeometry(TURN.sealR - 0.006, TURN.sealR, 40), LOOK); ring.userData.double = true;
  ring.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(G.right), V(G.up), V(G.out))); ring.position.copy(V(TURN.seal.centre));
  g.add(tag(ring, 'hoodie (cloth module): the seal, facing her', true));
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

export const NAMED = { shirt: SHIRT.c, seal: SEAL.centre, collar: SHIRT.T, ...GRIP,
  stack: FOLD.c, fseal: FSEAL.centre, neck: FOLD.neck, fHisL: FOLD.grip.hisL, fHisR: FOLD.grip.hisR, fHerL: FOLD.grip.herL, fHerR: FOLD.grip.herR,
  tcollar: TURN.T, tseal: TURN.seal.centre, tHerL: TURN.grip.herL, tHerR: TURN.grip.herR };
delete NAMED.r;
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const state = shot.hoodie || 'unfolding';
  root.add(room()); root.add(couch()); root.add(furniture());
  // ---- GARMENT HOOK (round 3). The cloth-simulated hoodie is a separate module, layout/sets/mortongrove07/sweatshirt.js
  // (the cloth agent's; not written here). Its anchor per state is GARMENT[state] in layout.js: `origin` = collar centre,
  // `right` / `up` / `out` = the garment's frame (right as one faces the FRONT, up the front, out of the front), `grips` =
  // the hand points to pin the cloth to (FOLD.grip / GRIP / TURN.grip; the figures' hands are posed onto these same points
  // in shots.js). To swap it in, replace the placeholder line below with something like:
  //   import { sweatshirt } from './sweatshirt.js';   (top of file)
  //   root.add(sweatshirt({ state, anchor: GARMENT[state], t: shot.clothT ?? 1, seal: { r: SHIRT.sealR, down: SHIRT.sealDown } }));
  // States: 'folded' (MG1, MG1_end: he hands it over), 'unfolding' (MG2: lifted by the shoulders, front toward him),
  // 'turned' (MG2_end: she has turned it round so the front faces her; hands TURN.grip, 0.50 m apart at y 1.14).
  const G = GARMENT[state] || GARMENT.unfolding;
  root.add(state === 'folded' ? hoodieFolded() : state === 'turned' ? garmentOutline(G) : hoodieUnfolding());   // placeholder props until sweatshirt.js lands
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

  const lights = [{ name: 'sun', kind: LIGHTS.sun.kind, pos: sunFrom, aim: V(state === 'folded' ? FOLD.c : SHIRT.c), color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true },
    { name: 'sky', kind: LIGHTS.sky.kind, pos: winC.clone().add(V(0, 0, 1)), aim: V(HER.at[0], 1.0, HER.at[1]), color: '#dfe6f0', on: true }];
  const W = PICTURE, Pq = (x, y) => V(x, y, W.z), Ww = WIN_W, Wq = (z, y) => V(Ww.x, y, z);
  const panes = { front_window: [Pq(W.x1, W.head), Pq(W.x0, W.head), Pq(W.x0, W.sill), Pq(W.x1, W.sill)],   // TL,TR,BR,BL seen from inside (looking south)
    west_window: [Wq(Ww.z1, Ww.head), Wq(Ww.z0, Ww.head), Wq(Ww.z0, Ww.sill), Wq(Ww.z1, Ww.sill)] };          // seen from inside (looking west)
  const FS = state === 'folded', TS = state === 'turned', SL_ = FS ? FSEAL : TS ? TURN.seal : SEAL, SN = G.out;
  const sc = V(SL_.centre), sr = V(G.right), sa = V(G.up), R = SHIRT.sealR;
  panes.seal_square = [sc.clone().addScaledVector(sr, -R).addScaledVector(sa, R), sc.clone().addScaledVector(sr, R).addScaledVector(sa, R), sc.clone().addScaledVector(sr, R).addScaledVector(sa, -R), sc.clone().addScaledVector(sr, -R).addScaledVector(sa, -R)];

  const anchor = V(fix(shot.beamAnchor || (state === 'turned' ? 'tseal' : 'shirt')));
  const extraOut = (c, P) => {
    const pt = (p) => ({ world: r3(V(p)), px: P(V(p)) });
    const toCam = c.position.clone().sub(sc).normalize();
    const seal = { label: 'IAS seal (Truth, Beauty)', what: 'Institute for Advanced Study seal printed in BLUE on a WHITE HOODIE, CHEST-SIZED (diameter ' + (2 * R).toFixed(2) + ' m on a ' + SHIRT.chest + ' m front, about 40% of its width, centred on the chest below the drawstrings; Jade 2026-11-25, NOT the whole front; on the FOLDED stack it spans about 60% of the folded width): a SOLID filled blue disc with the design in white reverse: two standing classical women hand in hand before a leafy tree, TRUTH (left, raising a hand mirror) and BEAUTY (right, pleated gown); INSTITUTE FOR ADVANCED STUDY round the rim, FOUNDED 1930 at the bottom (see cast/first_love/fl_H_ias_hoodie_v2.jpg)',
      radius_m: R, centre: pt(SL_.centre), top: pt(SL_.top), bottom: pt(SL_.bottom), truth_side: pt(SL_.truth), beauty_side: pt(SL_.beauty),
      hidden_by_fold: TS ? { share_of_height: null, how: 'cloth module (sweatshirt.js): Jade wants Truth to fall in the folds as she turns it' } : FS ? { share_of_height: FOLD.sealHidden, how: 'the lower body folded up over the front from his end: its ribbed waistband edge lies across the seal\'s lower part' } : { share_of_height: SHIRT.sealHidden, how: 'the bottom sliver curves round the remaining fold line; the rest is revealed' },
      corner_order: 'panes.seal_square = TL, TR, BR, BL as one faces the front (a painted seal maps straight on)',
      facing: TS ? 'toward HER (she has turned it round to look at it); the camera behind him sees its back' : FS ? 'up, on top of the folded stack between them; upright for him and the camera behind him (its top toward her)' : 'out of the hanging front of the hoodie she has just lifted: toward him and the camera behind him; upright',
      normal_to_camera_deg: +(Math.acos(Math.max(-1, Math.min(1, V(SN).dot(toCam)))) * 180 / Math.PI).toFixed(0),
      reads_upright_on_screen: (() => { const a = P(V(SL_.bottom)), b = P(V(SL_.top)); return a && b ? b[1] < a[1] : null; })(),
      sun_on_front: { cos_incidence: sunCos(SN), note: 'negative = the sun is BEHIND the print; positive = it can fall on it (subject to the shafts and shadows)' } };
    const he = figs.firstLove27?.userData.P, she = figs.jade27?.userData.P;
    return {
      time: FILM.time, plan_time: FILM.time, section: FILM.section, position: shot.position || null,
      film: { ...FILM, year: YEAR, place: 'Morton Grove, IL: the house she commuted from to Northwestern (Evanston); he had transferred from Harvard to Princeton' },
      house: { ...HOUSE, ceiling: { kind: 'vaulted (cathedral), Jade', ridge: VAULT.ridge + ' at z ' + VAULT.z + ' (Jade r3: highest over the middle of the great room, about 3.6 m)', plate_m: ROOM.h, peak_m: VAULT.peak, pitch: VAULT.pitch + ' (about 3.9 in 12)', east_wall: 'the full gable (mirror, piano): its top shows the roof angle', dining: 'flat 8-ft ceiling over the dining part (x < ' + DROP.x1 + ', north of the jog), READING of Jade\'s "the dining room is the short side" (flagged)' },
        axes: 'x = east, z = south, y up; origin = inner SW corner of the living room', great_room_m: { x: [JOG.xW, ROOM.x1], z: [ROOM.z0, ROOM.z1], jog_z: JOG.z },
        orientation: 'Jade\'s drawing: TOP = SOUTH (street), RIGHT = WEST, LEFT = EAST, BOTTOM = NORTH (reasoned: the front door in the jog faces the top; the couch and window share the top wall as Jade described the front wall)',
        couch: 'against the FRONT (south) wall, its west end just short of the front window (Jade, and the drawing)' },
      hoodie: { colour: 'white', kind: 'pullover hoodie: hood (hanging behind the neckline), two flat drawstrings, kangaroo pouch pocket, ribbed cuffs and waistband', state: TS ? 'TURNED: she holds it by the shoulder seams, a little further out and higher, and has turned it round so the front (the seal) faces her; the garment is the cloth module (sweatshirt.js)' : FS ? 'FOLDED: a stack ' + FOLD.across + ' x ' + FOLD.along + ' m, front up, neckline at her end; the waistband end folded up over the front from his end, hiding the lower part of the seal; he hands it over, both hold it' : 'UNFOLDING: she has lifted it by the shoulder seams; the front hangs from her hands toward him, the seal revealed; the lower part, still folded, swings down and out (half open)',
        chest_m: SHIRT.chest, length_m: 0.69,
        collar: pt(G.origin), seal, grips: Object.fromEntries(Object.entries(G.grips).map(([k, v]) => [k, pt(v)])),
        anchor: { state, origin: r3(V(G.origin)), right: G.right.map((v) => +v.toFixed(4)), up: G.up.map((v) => +v.toFixed(4)), out: G.out.map((v) => +v.toFixed(4)), note: 'GARMENT[state] in layout.js: the hook for the cloth module sweatshirt.js' },
        note: TS ? 'her two hands close on the shoulder seams, 0.50 m apart, the front toward her' : FS ? 'each hand closes on a side edge of the stack, thumb on top, fingers under: his two near his end, hers near hers' : 'her two hands close on the shoulder seams (thumbs behind, fingers over the top); sleeves hang beside the front; the pocket is on the swinging part\'s underside' },
      first_love: { who: 'first love (a real person: never named, never face-on)', face_shown: false,
        facing_camera_deg: he ? +(Math.acos(Math.max(-1, Math.min(1, he.headFwd.dot(c.position.clone().sub(he.head).normalize())))) * 180 / Math.PI).toFixed(0) : null,
        hair: 'dark brown, straight: centre part, crisp top half over a grown-out buzzed lower part (cast sheets v3)', feet: 'Birkenstock-type cork sandals (Naot), bare feet', forearms: 'sleeves pushed up: FOREARM HAIR CLEARLY VISIBLE',
        hands: 'same absolute size as hers (18.3 cm); feet 24.8 cm (cast kind adultFirstLove)' },
      jade: { cast: 'jade27 (kind adultJade27) standing in for Jade at about 24; no closer age in the cast table' },
      sun: { scene: SCENE, elevation_deg: SUN.altitude, azimuth_deg: SUN.azimuth, travel_dir: SUN_DIR.map((v) => +v.toFixed(4)), note: 'computed for Morton Grove (NOAA equations); date and time are a STAGING CHOICE (sweep.mjs)',
        in_sun_margin_m: { her_eyes: she ? sunMargins(she.eyes.toArray()) : null, her_head: she ? sunMargins(she.head.toArray()) : null, seal: sunMargins(SL_.centre), his_head: he ? sunMargins(he.head.toArray()) : null },
        seal_front_cos: sunCos(SN) },
      beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid: solids[0], anchor, P, cam: c, extra: { sun_altitude_deg: SUN.altitude, sun_azimuth_deg: SUN.azimuth, solids: Object.keys(APERTURES).filter((k) => APERTURES[k]), note: 'solid[0] = the front window (the others: west, dining), each narrowed by its wall reveal for this sun; eaves not modelled (a low sun passes under them)' } }),
      points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'chin', 'handL', 'handR', 'hip', 'shoulderC', 'kneeL', 'kneeR'].map((k) => [k, r3(f.userData.P[k])]))])),
    };
  };
  return { set: 'mortongrove07', scene, root, cam, rig, near: shot.near ?? 0.05, far: shot.far ?? 20, figs, book: null, panes, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor,
    litBg: 0x202020, flatBg: shot.beamMask ? 0x000000 : 0xe0ddd4, extra: extraOut };
}
