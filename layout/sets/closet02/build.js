// Build one closet02 shot: a reach-in closet with bypass sliding doors (both panels slid left, the right half open),
// the shelf, rod, clothes, coats and duvet from Jade's drawing, the bedroom floor in front, the sun from the bedroom
// window behind first love as a real shadowed directional light, the lit volume as explicit geometry, two figures.
//   shot.beamMask (the generated twins beam_<id>): flat mode renders the lit volume white on black = the beam mask
import * as THREE from 'three';
import { box, cyl, tag, V, mk } from '../../engine/core.js';
import { CAST } from '../_cast.js';   // registers the cast
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { WALL, OPEN, ROOM, DOORS, BEDROOM, SHELF, RAIL, CLOTHES, COATS, DUVET, FUTON, CEIL_LIGHT, HANDS, FACE, SUN, SUN_DIR, BEAM, beamAt, WINDOW, SUN_H, MOTE, LIGHTS, TOP_Y } from './layout.js';
import { beamSolid, beamMesh, beamWire, beamSidecar, applyBeamMask } from './beam.js';
import { plaidArt, SETT, SEAL, CARDINAL } from './art.js';
import { worldUV, artLook } from '../_art.js';

// cast: `jade19` and `firstLove19` come from ../_cast.js (one table for every set)

const V3 = THREE.Vector3;
const WALLS = { grey: 0.66, col: 0x9a9286, recvShadowLine: true }, CARPET = { grey: 0.5, col: 0x7a6a58, recvShadowLine: true };
const TRIM = { grey: 0.78, col: 0xd8d0c2 }, PANEL = { grey: 0.74, col: 0xcfc6b4, recvShadowLine: true };
const GARB = [0x4a5468, 0x8a5a4a, 0x34343a, 0xa09a88, 0x6a7a62, 0xb8a890, 0x5a4a60, 0x7a8490];

// ---- matte black rounded-square tube (Jade, round 4: "the railing should be a rounded square"): a rounded-square profile
// swept along a polyline (corners rounded by arcs); the profile's second axis is the path plane's normal `nrm`
const BLK = { grey: 0.1, col: 0x1b1b1d, formTint: [0.24, 0.24, 0.25], flatCol: 0x1b1b1d };   // dark in form too (not pale clay)
const FL_HAIR_LIT = 0x141214;   // first love's hair, lit pass only (see the figure loop below): FL_HAIR pre-compensated for the warm key
function rsProfile(a, rc, seg = 3) {   // rounded square, half-size a, corner radius rc, CCW
  const pts = [], k = a - rc;
  for (const [cx, cy, a0] of [[k, k, 0], [-k, k, 90], [-k, -k, 180], [k, -k, 270]])
    for (let i = 0; i <= seg; i++) { const t = (a0 + 90 * i / seg) * Math.PI / 180; pts.push([cx + rc * Math.cos(t), cy + rc * Math.sin(t)]); }
  return pts;
}
function roundPath(P, r, closed, seg = 8) {   // polyline P (Vector3s) with each interior corner replaced by an arc of radius r
  const out = [], n = P.length;
  for (let i = 0; i < n; i++) {
    const isEnd = !closed && (i === 0 || i === n - 1);
    if (isEnd) { out.push(P[i].clone()); continue; }
    const A = P[(i - 1 + n) % n], B = P[i], C = P[(i + 1) % n];
    const u = A.clone().sub(B).normalize(), w = C.clone().sub(B).normalize(), p0 = B.clone().addScaledVector(u, r), p1 = B.clone().addScaledVector(w, r);
    for (let j = 0; j <= seg; j++) { const t = j / seg; // quadratic Bezier through the corner (close to a circular arc)
      out.push(p0.clone().multiplyScalar((1 - t) ** 2).addScaledVector(B, 2 * (1 - t) * t).addScaledVector(p1, t * t)); }
  }
  return out;
}
function sweepTube(path, nrm, look, { a = FUTON.tube / 2, rc = FUTON.tubeR, closed = false } = {}) {
  const prof = rsProfile(a, rc), m = path.length, k = prof.length, pos = [], idx = [], N = nrm.clone().normalize();
  for (let i = 0; i < m; i++) {
    const T = (closed ? path[(i + 1) % m].clone().sub(path[(i - 1 + m) % m]) : path[Math.min(m - 1, i + 1)].clone().sub(path[Math.max(0, i - 1)])).normalize();
    const S = T.clone().cross(N).normalize();
    for (const [x, y] of prof) { const p = path[i].clone().addScaledVector(S, x).addScaledVector(N, y); pos.push(p.x, p.y, p.z); }
  }
  const rows = closed ? m : m - 1;
  for (let i = 0; i < rows; i++) for (let j = 0; j < k; j++) { const a0 = i * k + j, a1 = i * k + (j + 1) % k, b0 = ((i + 1) % m) * k + j, b1 = ((i + 1) % m) * k + (j + 1) % k; idx.push(a0, b0, b1, a0, b1, a1); }
  if (!closed) { const cap = (base, flip) => { const c = pos.length / 3; const p = path[base ? m - 1 : 0]; pos.push(p.x, p.y, p.z);
    for (let j = 0; j < k; j++) { const o = (base ? (m - 1) * k : 0); flip ? idx.push(c, o + (j + 1) % k, o + j) : idx.push(c, o + j, o + (j + 1) % k); } }; cap(false, false); cap(true, true); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const me = mk(geo, look); me.userData.double = true; return me;
}
function futon() {
  const F = FUTON, G = new THREE.Group(), r = F.tube / 2, X = new V3(1, 0, 0), Z = new V3(0, 0, 1);
  const zb = F.z0 + r, zf = F.z0 + F.armD, zfront = F.z1 - 0.04, yd = F.deck - r - 0.005;
  // the two arm frames: a rounded-rectangle loop each (floor to arm height, wall to sofa depth), with a deck bar across
  for (const x of [F.x0 + r, F.x1 - r]) {
    const loop = [new V3(x, r, zb), new V3(x, F.arm, zb), new V3(x, F.arm, zf), new V3(x, r, zf)];
    G.add(sweepTube(roundPath(loop, F.corner, true), X, BLK, { closed: true }));
    G.add(sweepTube([new V3(x, yd, zb), new V3(x, yd, zf)], X, BLK));                                       // deck bar inside the loop
  }
  // deck rails along the length (back, at the arms' front, the folded-down half's front) and its two legs with a foot bar
  for (const z of [zb + 0.02, zf - 0.02]) G.add(sweepTube([new V3(F.x0 + r, yd, z), new V3(F.x1 - r, yd, z)], Z, BLK));
  G.add(sweepTube(roundPath([new V3(F.mx0 + 0.04, 0.0 + r, zfront - 0.0), new V3(F.mx0 + 0.04, yd, zfront), new V3(F.mx1 - 0.04, yd, zfront), new V3(F.mx1 - 0.04, r, zfront)], 0.05, false), Z, BLK));
  for (const x of [F.mx0 + 0.05, (F.mx0 + F.mx1) / 2, F.mx1 - 0.05]) G.add(sweepTube([new V3(x, yd - 0.005, zf - 0.02), new V3(x, yd - 0.005, zfront)], X, BLK, { a: 0.008, rc: 0.003 }));   // slats under the down half
  for (const z of [zb + 0.30, zb + 0.55]) G.add(sweepTube([new V3(F.mx0, yd - 0.005, z), new V3(F.mx1, yd - 0.005, z)], Z, BLK, { a: 0.008, rc: 0.003 }));
  const out = new THREE.Group(); out.add(tag(G, 'futon frame (matte black metal, rounded-square tube, bed mode)'));
  const xm = (F.mx0 + F.mx1) / 2, zm = (F.z0 + F.z1) / 2;
  out.add(tag(box(F.len, F.mat, F.w, { grey: 0.78, col: 0xe6e0d4 }, [xm, F.deck + F.mat / 2, zm]), 'futon mattress'));
  // the navy plaid blanket over the top, hanging down the room side (front) and the end away from the closet
  const NAVY = { grey: 0.24, col: 0x1f2a48, recvShadowLine: true }, bt = 0.012, B = new THREE.Group(), hang = F.mat + F.drape - 0.03;
  B.add(box(F.len + 2 * bt, bt, F.w + 2 * bt, NAVY, [xm, F.top + bt / 2, zm]));                                   // over the top
  B.add(box(F.len + 2 * bt, hang, bt, NAVY, [xm, F.top - hang / 2, F.z1 + bt / 2]));                             // down the front (room side)
  B.add(box(bt, F.mat + 0.04, F.w + 2 * bt, NAVY, [F.mx1 + bt / 2, F.top - (F.mat + 0.04) / 2, zm]));            // the far end, inside the right arm
  { const P = plaidArt(); B.children.forEach((m) => { m.userData.look = { ...m.userData.look, art: P.art, artGrey: P.artGrey, artEdge: P.artEdge }; worldUV(m, SETT); }); }   // the fixed tartan (art.js)
  out.add(tag(B, 'navy plaid blanket (on the futon)'));
  return out;
}
// the bedroom ceiling light (round 4): flush-mount frosted dome on a canopy plate, its own glow in lit; no shadow caster
function ceilingLight() {
  const C = CEIL_LIGHT, G = new THREE.Group(), [x, y, z] = C.at;
  G.add(cyl(C.r + 0.015, C.r + 0.015, 0.012, { grey: 0.9, col: 0xf0ece4, noCast: true }, [x, y - 0.006, z], null, 32));
  const dome = new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); dome.scale(C.r, C.h, C.r);
  const d = mk(dome, { grey: 0.97, col: 0xfff4e0, emit: 0xffe4b8, noCast: true }); d.position.set(x, y - 0.012, z); G.add(d);
  G.add(cyl(0.012, 0.012, 0.02, { grey: 0.6, col: 0xb89a5a, noCast: true }, [x, y - 0.012 - C.h - 0.005, z], null, 12));   // finial
  G.add(tag(box(4.2, 0.03, 3.0, { grey: 0.92, col: 0xeeeae2, noCast: true }, [0.8, WALL.h + 0.015, 1.6]), 'bedroom ceiling (receives no sun)'));
  return tag(G, 'bedroom ceiling light (flush-mount frosted glass dome, on)');
}

function closet() {
  const g = new THREE.Group(); const R = ROOM, w = WALL.t, cx = (R.x0 + R.x1) / 2;
  // floors (one carpet), ceiling of the closet, its back and end walls
  g.add(tag(box(BEDROOM.x1 - BEDROOM.x0, 0.04, BEDROOM.z1 - R.z0 + 0.1, CARPET, [(BEDROOM.x0 + BEDROOM.x1) / 2, -0.02, (BEDROOM.z1 + R.z0 - 0.1) / 2]), 'carpet'));
  g.add(tag(box(R.x1 - R.x0 + 0.2, 0.04, R.z1 - R.z0 + 0.1, { grey: 0.6, col: 0x857e74 }, [cx, R.h + 0.02, (R.z0 + R.z1) / 2]), 'closet ceiling'));
  g.add(tag(box(R.x1 - R.x0 + 0.2, R.h, 0.1, WALLS, [cx, R.h / 2, R.z0 - 0.05]), 'closet back wall'));
  for (const [x, n] of [[R.x0 - 0.05, 'left'], [R.x1 + 0.05, 'right']]) g.add(tag(box(0.1, R.h, R.z1 - R.z0, WALLS, [x, R.h / 2, (R.z0 + R.z1) / 2]), `closet end wall (${n})`));
  // the bedroom wall with the opening
  const zc = -w / 2, xa = BEDROOM.x0, xb = BEDROOM.x1;
  g.add(tag(box(OPEN.x0 - xa, R.h, w, WALLS, [(xa + OPEN.x0) / 2, R.h / 2, zc]), 'bedroom wall'));
  g.add(tag(box(xb - OPEN.x1, R.h, w, WALLS, [(xb + OPEN.x1) / 2, R.h / 2, zc]), 'bedroom wall'));
  g.add(tag(box(OPEN.x1 - OPEN.x0, R.h - OPEN.h, w, WALLS, [0, (R.h + OPEN.h) / 2, zc]), 'header'));
  // casing round the opening and a baseboard on the bedroom side
  const cw = 0.065, ct = 0.015;
  g.add(tag(box(cw, OPEN.h + cw, ct, TRIM, [OPEN.x0 - cw / 2, (OPEN.h + cw) / 2, ct / 2]), 'casing'));
  g.add(tag(box(cw, OPEN.h + cw, ct, TRIM, [OPEN.x1 + cw / 2, (OPEN.h + cw) / 2, ct / 2]), 'casing'));
  g.add(tag(box(OPEN.x1 - OPEN.x0 + 2 * cw, cw, ct, TRIM, [0, OPEN.h + cw / 2, ct / 2]), 'casing'));
  g.add(tag(box(OPEN.x0 - cw - xa, 0.09, 0.012, TRIM, [(xa + OPEN.x0 - cw) / 2, 0.045, 0.006]), 'baseboard'));
  g.add(tag(box(xb - OPEN.x1 - cw, 0.09, 0.012, TRIM, [(xb + OPEN.x1 + cw) / 2, 0.045, 0.006]), 'baseboard'));
  // the two panels, both slid left (front track and rear track), and the track at the head
  for (const [z, n, dx] of [[DOORS.zFront, 'front', 0], [DOORS.zRear, 'rear', -0.015]]) {
    const x0 = OPEN.x0 + dx, P = new THREE.Group();
    P.add(box(DOORS.w, DOORS.h, DOORS.t, PANEL, [x0 + DOORS.w / 2, 0.01 + DOORS.h / 2, z]));
    if (n === 'front') P.add(box(0.02, 0.10, 0.012, { grey: 0.35, col: 0x6a6258 }, [x0 + DOORS.w - 0.06, 0.98, z + DOORS.t / 2 + 0.006]));   // finger pull
    g.add(tag(P, `sliding door (${n} panel, slid left)`));
  }
  g.add(tag(box(OPEN.x1 - OPEN.x0, 0.03, 0.10, { grey: 0.55, col: 0x8a8a86 }, [0, OPEN.h - 0.015, -0.055]), 'door track'));
  // shelf with textbooks and shoeboxes
  const sz = R.z0 + SHELF.d / 2;
  g.add(tag(box(R.x1 - R.x0, SHELF.t, SHELF.d, TRIM, [cx, SHELF.y - SHELF.t / 2, sz]), 'shelf'));
  g.add(tag(cyl(0.014, 0.014, R.x1 - R.x0, { grey: 0.5, col: 0x9a9a9a }, [cx, RAIL.y, RAIL.z], [0, 0, 90], 10), 'rod'));
  const books = [[0.18, 0.045, 0.27, 0x7a2a2a], [0.225, 0.04, 0.26, 0x2a3a6a], [0.265, 0.05, 0.28, 0x3a5a3a], [0.31, 0.035, 0.25, 0xa08a40],
    [0.345, 0.045, 0.27, 0x5a2a4a], [0.385, 0.04, 0.24, 0x2a5a6a], [-0.60, 0.05, 0.27, 0x6a3a2a], [-0.55, 0.04, 0.26, 0x2a2a5a]];
  for (const [x, t, h, c] of books) g.add(tag(box(t, h, 0.21, { grey: 0.32 + (h * 3) % 0.2, col: c }, [x, SHELF.y + h / 2, R.z0 + 0.12]), 'textbooks'));
  g.add(tag(box(0.28, 0.06, 0.22, { grey: 0.4, col: 0x6a4a3a }, [0.27, SHELF.y + 0.28 + 0.03, R.z0 + 0.12]), 'textbooks (lying flat)'));
  const shoe = { grey: 0.62, col: 0xb09a78 }, shoe2 = { grey: 0.5, col: 0x8a8070 };
  for (const [x, y, L] of [[0.62, 0, shoe], [0.62, 0.12, shoe2], [0.63, 0.24, shoe], [0.80, 0, shoe2], [0.80, 0.12, shoe], [-0.25, 0, shoe], [-0.25, 0.12, shoe2]])
    g.add(tag(box(0.32, 0.115, 0.19, L, [x, SHELF.y + y + 0.0575, R.z0 + 0.11]), 'shoeboxes'));
  // hanging clothes: simple masses (a hanger-shouldered slab each) all along the rod
  let k = 0;
  for (let x = CLOTHES.from; x <= CLOTHES.to + 1e-6; x += CLOTHES.step, k++) {
    if (x > COATS.xs[0] - 0.05 && x < COATS.xs[COATS.xs.length - 1] + 0.05) continue;   // the coats take that stretch
    const hem = CLOTHES.hem[k % CLOTHES.hem.length], top = RAIL.y - 0.05, d = top - hem, t = 0.03 + (k % 3) * 0.012, gw = CLOTHES.w - (k % 2) * 0.05;
    const G = new THREE.Group(), L = { grey: 0.3 + (k % 4) * 0.1, col: GARB[k % GARB.length] };
    G.add(box(t, d, gw, L, [x, top - d / 2, RAIL.z]));
    G.add(box(t * 0.6, 0.04, gw * 0.7, L, [x, top + 0.015, RAIL.z]));   // shoulders on the hanger
    g.add(tag(G, 'hanging clothes'));
  }
  COATS.xs.forEach((x, i) => { const top = RAIL.y - 0.05, d = top - COATS.hem[i], L = { grey: 0.22 + i * 0.08, col: [0x2a2c34, 0x5a4636, 0x3a3e46][i] };
    g.add(tag(box(COATS.t, d, COATS.w, L, [x, top - d / 2, RAIL.z]), 'long coats')); });
  // shoes on the floor at the back (mostly behind the panels), the duvet she sits on
  for (const [x, z] of [[-0.62, -0.62], [-0.42, -0.60], [-0.15, -0.63], [0.86, -0.62]]) g.add(tag(box(0.10, 0.09, 0.22, { grey: 0.25, col: 0x2a2420 }, [x, 0.045, z], [0, 6, 0]), 'shoes'));
  { const D = DUVET, L = { grey: 0.84, col: 0xe8e0d0, recvShadowLine: true };
    g.add(tag(box(D.w, D.h, D.d, L, [D.at[0], D.h / 2, D.at[1]]), 'folded duvet cover'));
    g.add(tag(box(D.w - 0.03, 0.018, 0.03, { grey: 0.7, col: 0xcfc6b6 }, [D.at[0], D.h * 0.55, D.at[1] + D.d / 2 + 0.005]), 'folded duvet cover')); }   // the fold
  // the futon in its down (bed) mode, right of the closet (Jade, round 3), turned 90 degrees in round 4 so its matte black
  // railing faces the room: length along the closet wall, back against it, an arm loop at each end (layout.js FUTON)
  g.add(futon());
  g.add(ceilingLight());
  // the window behind him (stand-in, never in frame): a wall square to the light with a hole; it gives the light its
  // top edge (above her head) and keeps the rest of the bedroom out of the sun
  { const W = WINDOW, S = new THREE.Group(), L = { grey: 0.3, col: 0x2a2622 }, u = (a, b) => [(a + b) / 2, b - a];
    S.position.set(W.at[0], 0, W.at[2]); S.rotation.y = Math.atan2(SUN_H[0], SUN_H[2]);
    const [lc, lw] = u(-W.w / 2, W.u0), [rc, rw] = u(W.u1, W.w / 2), [mc, mw] = u(W.u0, W.u1);
    S.add(box(lw, W.h, 0.03, L, [lc, W.h / 2, 0]), box(rw, W.h, 0.03, L, [rc, W.h / 2, 0]));
    S.add(box(mw, W.h - W.head, 0.03, L, [mc, (W.h + W.head) / 2, 0]), box(mw, W.sill + 1, 0.03, L, [mc, (W.sill - 1) / 2, 0]));
    g.add(tag(S, 'bedroom window (stand-in, not seen)')); }
  return g;
}

// ---- her hoodie in cardinal (Jade, 2026-11-26, corrected: "I was envisioning taking the existing hoodie and making it
// cardinal red with a white seal at the pocket instead of whatever that is. also she should be wearing socks.").
// The EXISTING hoodie is her cast sheet's (cast/jade_19, r3 closet paintings): a zip-up hoodie worn OPEN over a plain
// white T-shirt, hood down. Same cut; only the colour changes to cardinal (shots.js SWEATSHIRT). No lettering anywhere.
// The engine colours the hoodie body; this adds what it cannot: the white tee between the open fronts, the zip edges,
// the split kangaroo pocket (one half each side of the zip), the hood lying round the back of the neck, the ONE seal decal
// (art.js SEAL: crisp and undistorted) on her left chest (breast-pocket position, Jade r4), white socks over the feet, and a few soft folds where she sits
// hunched, lying over parts of the seal so it cannot be read. The seal image itself is never sheared or smeared.
// Seal: left chest, breast-pocket position (Jade, r4), 8 cm across, on the open hoodie's left front panel.
export const SWEAT = { open: 0.035, pocket: { in: 0.041, out: 0.15, h: 0.15 }, at: 0.66,
  // the seal (Jade, r4: "on breast pocket location, the normal place where school seals go"): her LEFT chest (+u), on the
  // hoodie panel, centre (u, v from the shoulder centre), 8 cm across
  seal: 0.08, sealAt: [0.085, -0.10],
  // soft folds of the hoodie front from her hunched pose, lying over the seal: [start (u, v from the seal centre), end, radius]
  folds: [[[-0.045, -0.006], [0.07, 0.012], 0.011], [[-0.035, 0.028], [0.06, 0.018], 0.008]] };
function sweatshirt(fig) {
  const out = new THREE.Group(), P = fig.userData.P; fig.updateMatrixWorld(true);
  if (!P?.bodyMesh) return out;
  const hitM = []; fig.traverse((m) => { if (m.isMesh && /:torso$/.test(m.userData.idGroup || '')) hitM.push(m); });
  const rc = new THREE.Raycaster();
  // a point on the front of the torso garment, (u toward her left, v up from the shoulder centre); the farthest
  // front-facing hit, so a forearm / sleeve in front of the belly is skipped (as engine chestPoint)
  const surf = (u, v, d) => { const o = P.shoulderC.clone().addScaledVector(P.cy, v).addScaledVector(P.cx, u).addScaledVector(P.cz, 0.5);
    rc.set(o, P.cz.clone().negate()); rc.far = 0.8;
    const hs = rc.intersectObjects(hitM, false).filter((x) => x.face.normal.clone().transformDirection(x.object.matrixWorld).dot(P.cz) > 0);
    const h = hs[hs.length - 1]; if (!h) return null;
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld); if (n.dot(P.cz) < 0) n.negate(); return h.point.clone().addScaledVector(n, d); };
  const who = (m, label, id) => { m.userData.who = 'jade19'; m.userData.idGroup = 'jade19:' + id; return tag(m, label); };
  const S = SWEAT, hipD = P.shoulderC.distanceTo(P.hip), vC = -hipD * S.at;   // pocket centre: about the navel, above the lap
  const sheet = (nu, nv, at, keep, look, label, id, uvOf) => {   // a conformed grid; at(s, t) -> point|null; keep(cell) filter
    const pos = [], uv = [], idx = [], vid = new Map();
    const vert = (i, j) => { const k = j * (nu + 1) + i; if (vid.has(k)) return vid.get(k); const p = at(i / nu, j / nv); if (!p) return -1;
      pos.push(p.x, p.y, p.z); const t = uvOf ? uvOf(i / nu, j / nv) : [i / nu, j / nv]; uv.push(t[0], t[1]); vid.set(k, pos.length / 3 - 1); return vid.get(k); };
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { if (!keep(i, j)) continue;
      const a = vert(i, j), b = vert(i + 1, j), c = vert(i + 1, j + 1), d = vert(i, j + 1); if (a < 0 || b < 0 || c < 0 || d < 0) continue; idx.push(a, b, c, a, c, d); }
    if (!idx.length) return null;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = mk(g, look); m.userData.double = true; return who(m, label, id);
  };
  const RED = { grey: 0.32, col: CARDINAL, formTint: [0.55, 0.08, 0.08], flatCol: CARDINAL, costumeCol: CARDINAL, recvShadowLine: true };
  const TEE = { grey: 0.92, col: 0xf2f0ea, formTint: [0.95, 0.94, 0.92], flatCol: 0xf2f0ea, costumeCol: 0xf2f0ea, recvShadowLine: true };
  const ZIP = { grey: 0.4, col: 0x5a2020, formTint: [0.35, 0.06, 0.06], flatCol: 0x5a2020, costumeCol: 0x5a2020 };
  const all = () => true;
  // the white tee between the open fronts, from the neckline to the hem, and the zip edge on each front
  const vTop = -0.03, vBot = -hipD * 0.9;
  { const m = sheet(2, 24, (s, t) => surf((s - 0.5) * 2 * S.open, vTop + (vBot - vTop) * t, 0.003), all, TEE, 'Jade (19): white T-shirt between the open hoodie fronts', 'tee'); if (m) out.add(m); }
  for (const sg of [1, -1]) { const m = sheet(1, 24, (s, t) => surf(sg * (S.open + 0.004 * s), vTop + (vBot - vTop) * t, 0.0045), all, ZIP, 'Jade (19): hoodie zip edge (open)', 'zip' + (sg > 0 ? 'L' : 'R')); if (m) out.add(m); }
  // the split kangaroo pocket: a panel each side of the zip, its outer edge slanting in toward the top (the hand opening)
  for (const sg of [1, -1]) { const K = S.pocket;
    const m = sheet(10, 8, (s, t) => { const uo = K.out - 0.05 * t, u = K.in + (uo - K.in) * s; return surf(sg * u, vC - K.h / 2 + K.h * t, 0.004); }, all, RED, 'Jade (19): hoodie kangaroo pocket (split)', 'pocket' + (sg > 0 ? 'L' : 'R')); if (m) out.add(m); }
  // the seal: the canonical image, undistorted, conformed to the left pocket half
  const img = SEAL.seal;
  if (img) { const W = img.canvas.width, H = img.canvas.height, dat = img.canvas.getContext('2d').getImageData(0, 0, W, H).data, n = 80;
    const alpha = (s, t) => dat[(Math.min(H - 1, Math.floor((1 - t) * H)) * W + Math.min(W - 1, Math.floor(s * W))) * 4 + 3];
    const m = sheet(n, n, (s, t) => surf(S.sealAt[0] + (s - 0.5) * S.seal, S.sealAt[1] + (t - 0.5) * S.seal, 0.006), (i, j) => alpha((i + 0.5) / n, (j + 0.5) / n) >= 128,
      { noCast: true, ...artLook(img, { grey: 0.9, col: 0xf6f4ef }) }, 'Jade (19): hoodie seal print (white, left chest, broken by folds)', 'seal');
    if (m) { m.userData.art = true; out.add(m); } }
  // soft folds of the front where she sits hunched, hands at her temples: tapered rolls half sunk in, over parts of the seal
  const roll = (pts, R, id) => { if (pts.length < 4) return;
    const curve = new THREE.CatmullRomCurve3(pts), segs = 40, rad = 8, tube = new THREE.TubeGeometry(curve, segs, R, rad, false), pa = tube.attributes.position;
    for (let i = 0; i <= segs; i++) { const c = curve.getPointAt(i / segs), tp = Math.pow(Math.sin(Math.PI * i / segs), 0.6);
      for (let j = 0; j <= rad; j++) { const q = i * (rad + 1) + j; pa.setXYZ(q, c.x + (pa.getX(q) - c.x) * tp, c.y + (pa.getY(q) - c.y) * tp, c.z + (pa.getZ(q) - c.z) * tp); } }
    tube.computeVertexNormals(); out.add(who(mk(tube, RED), 'Jade (19): hoodie fold', id)); };
  S.folds.forEach(([p0, p1, R], k) => { const pts = []; for (let i = 0; i <= 12; i++) { const f = i / 12, p = surf(S.sealAt[0] + p0[0] + (p1[0] - p0[0]) * f, S.sealAt[1] + p0[1] + (p1[1] - p0[1]) * f + 0.003 * Math.sin(f * 6), -R * 0.2); if (p) pts.push(p); }
    roll(pts, R, 'fold' + k); });
  // the hood, down: a soft roll round the back of the neck from one front edge to the other (mostly under her hair)
  { const pts = [], c = P.shoulderC.clone().addScaledVector(P.cy, 0.035);
    for (let i = 0; i <= 16; i++) { const a = -0.55 * Math.PI + 1.1 * Math.PI * i / 16 + Math.PI;   // round the back
      pts.push(c.clone().addScaledVector(P.cx, 0.085 * Math.sin(a)).addScaledVector(P.cz, 0.075 * Math.cos(a) - 0.01).addScaledVector(P.cy, -0.02 * Math.abs(Math.sin(a)))); }
    roll(pts, 0.022, 'hood'); out.children[out.children.length - 1].userData.label = 'Jade (19): hoodie hood (down)'; }
  // white socks over the whole foot (the body mesh shows toes, which painters read as bare feet)
  const SOCK = { grey: 0.92, col: 0xeeece6, formTint: [0.95, 0.95, 0.93], flatCol: 0xeeece6, costumeCol: 0xeeece6 };
  for (const sd of ['L', 'R']) { const he = P['heel' + sd], to = P['toe' + sd], an = P['ankle' + sd]; if (!he || !to || !an) continue;
    const len = he.distanceTo(to), mid = he.clone().add(to).multiplyScalar(0.5), dir = to.clone().sub(he).normalize();
    const g = new THREE.CapsuleGeometry(0.5, 1, 6, 16); g.scale(0.075, len * 0.47, 0.05);   // width x length x height (local y = length)
    const m = mk(g, SOCK); m.position.copy(mid).addScaledVector(an.clone().sub(mid).normalize(), 0.012);
    const up = an.clone().sub(mid); up.addScaledVector(dir, -up.dot(dir)).normalize();
    const X = new V3().crossVectors(dir, up).normalize(); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, dir, up));
    out.add(who(m, 'Jade (19): white sock', 'sock' + sd));
    const cuff = new THREE.CylinderGeometry(0.042, 0.045, 0.09, 16); const cm = mk(cuff, SOCK); cm.position.copy(an).addScaledVector(up, 0.0);
    cm.quaternion.setFromUnitVectors(new V3(0, 1, 0), P['knee' + sd] ? P['knee' + sd].clone().sub(an).normalize() : up); out.add(who(cm, 'Jade (19): white sock (ankle)', 'sockcuff' + sd)); }
  return out;
}

// measured, not by eye (R4D brief): the smallest gap (m) from any figure-mesh vertex to the futon (frame tube vertices
// and the mattress / blanket box); negative = a vertex inside the mattress box
function futonClear(root, figs) {
  root.updateMatrixWorld(true); const fut = [], mat = new THREE.Box3(), v = new V3();
  root.traverse((o) => { if (!o.isMesh) return; const L = o.userData.label || ''; let p = o; let lab = L; while (!lab && p.parent) { p = p.parent; lab = p.userData?.label || ''; }
    if (/futon frame/.test(lab)) { const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i++) fut.push(v.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld).clone()); }
    if (/futon mattress|navy plaid/.test(lab)) mat.union(new THREE.Box3().setFromObject(o)); });
  const out = {};
  for (const [w, f] of Object.entries(figs)) { let dmin = Infinity, inside = 0; f.updateMatrixWorld(true);
    f.traverse((o) => { if (!o.isMesh || !o.visible) return; const a = o.geometry.attributes.position; for (let i = 0; i < a.count; i += 2) { v.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld);
      if (v.x < FUTON.x0 - 0.15) continue; if (mat.containsPoint(v)) inside++;
      for (const q of fut) { const d = q.distanceToSquared(v); if (d < dmin) dmin = d; } } });
    out[w] = { min_gap_to_frame_m: +Math.sqrt(dmin).toFixed(3), verts_inside_mattress: inside }; }
  return out;
}

export const NAMED = { hands: HANDS, face: FACE, opening: [(DOORS.edge + OPEN.x1) / 2, 1.0, 0], beamMid: beamAt(HANDS, -0.35), floorIn: [0.5, 0, -0.4] };
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(closet());
  const solid = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip, length: 4 });
  const sunk = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip, length: 4, sink: 0.01 });
  if (!shot.noBeamVolume) {
    root.add(tag(beamWire(solid, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }, 0.003), 'sunlight (volume edges)'));
    root.add(tag(beamMesh(sunk, { glass: true, col: SUN.color, opacity: 0.10 }), 'sunlight (volume)'));
  }

  // '<who>:templeL' / ':templeR': the temple (between the eye and the ear, a little up), from the previous staging pass
  const temple = (t, figs) => { const m = /^(\w+):temple([LR])$/.exec(t); const f = m && figs[m[1]]; if (!f) return null; const P = f.userData.P;
    const s = m[2] === 'L' ? 1 : -1, w = P['ear' + m[2]].clone().sub(P.head), up = P.headUp.clone().normalize();
    const fwd = P.eyes.clone().sub(P.head); fwd.addScaledVector(up, -fwd.dot(up)).normalize(); const R = P.headH / 2;
    // on the skull's side, above and in front of the ear, 1 cm out (the fingertip pad rests on it)
    return P.head.clone().addScaledVector(w, 0.86).addScaledVector(up, 0.32 * R).addScaledVector(fwd, 0.5 * R).addScaledVector(w.normalize(), 0.01); };
  const { figs } = stage(shot.figs || {}, null, (t, figs) => (NAMED[t] ? V(NAMED[t]) : temple(t, figs)));
  for (const f of Object.values(figs)) { root.add(f); f.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, recvShadowLine: true }; }); }
  // 2026-11-26 post-sweep (closet-only): under the warm sun + ceiling light, FL_HAIR 0x1f1915 rendered warm chestnut in
  // lit (#4a3422 on CL_ots). The v8 sheet (fl_B_backhead_neck_v8) reads dark cool brown (~#2e2420), so his hair's LIT
  // colour here is pre-compensated for the warm key (cooler, darker). Other passes and _cast.js FL_HAIR are untouched.
  if (figs.firstLove19) figs.firstLove19.traverse((o) => { if (o.isMesh && /hair$/.test(o.userData.idGroup || '') && o.userData.look) o.userData.look = { ...o.userData.look, col: FL_HAIR_LIT }; });
  if (figs.jade19 && !shot.noSweat) root.add(sweatshirt(figs.jade19));   // round 4: her red sweatshirt's pocket, seal and folds
  const cs = { ...shot, orbit: shot.orbit ? { ...shot.orbit, at: fix(shot.orbit.at) } : undefined, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);

  const anchor = V(fix(shot.beamAnchor || 'hands'));
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); const c0 = V([0.45, 0.9, -0.2]); s.target.position.copy(c0); s.position.copy(c0).addScaledVector(V(SUN_DIR), -12); s.castShadow = true;
    const c = s.shadow.camera; c.left = -2.6; c.right = 2.6; c.top = 2.6; c.bottom = -2.6; c.near = 0.5; c.far = 25; c.updateProjectionMatrix(); s.shadow.bias = -0.0005; s.shadow.normalBias = 0.004; s.shadow.radius = 1.0; return s; };
  // the bedroom ceiling light (round 4): a soft, dim, warm fill from the dome (point light, soft wide shadows)
  const CEIL_I = { lit: shot.ceilLit ?? 6.0, flat: shot.ceilFlat ?? 2.4 };
  const mkCeil = (color, I) => { const p = new THREE.PointLight(color, I, 0, 1.2); p.position.set(...LIGHTS.ceiling.pos); p.castShadow = true;
    p.shadow.radius = 8; p.shadow.bias = -0.002; p.shadow.camera.near = 0.1; p.shadow.camera.far = 8; return p; };
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSun(0xffffff, 4)];   // shadow lines: the sun's crisp edges only
    if (mode === 'lit') return [mkSun(SUN.color, 7), mkCeil(CEIL_LIGHT.color, CEIL_I.lit), new THREE.AmbientLight(0x4a4038, 0.30)];
    const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(-1, 3, 2);
    return [mkSun(0xffffff, 4), mkCeil(0xffffff, CEIL_I.flat), new THREE.AmbientLight(0xffffff, 1.5), d];
  };
  // the mask: lit surfaces white, and the lit air as a white volume unless the camera stands in it (CL_hands) or the
  // shot is a __surf twin (lit surfaces only; figures' cast shadows are not cut out: see the flat render)
  let maskInfo = null;
  if (shot.beamMask) { root.traverse((o) => { if (o.isMesh && /sunlight \(volume/.test(o.userData.label || '')) o.visible = false; });
    maskInfo = applyBeamMask(root, [solid], { label: 'sunlight (mask)', cam, surfaceOnly: !!shot.beamSurf }); }
  const sunPos = V(FACE).addScaledVector(V(SUN_DIR), -3);
  const lights = [{ name: 'door', kind: LIGHTS.door.kind, pos: sunPos, aim: V(FACE), color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true },
    { name: 'ceiling', kind: LIGHTS.ceiling.kind, pos: V(LIGHTS.ceiling.pos), aim: V(LIGHTS.ceiling.pos).setY(0), color: '#' + CEIL_LIGHT.color.toString(16).padStart(6, '0'), on: true }];
  const r3 = (v) => v.toArray().map((x) => +x.toFixed(4));
  const extraOut = (c, P) => ({
    film: { time: shot.time || null, section: shot.section || null, position: shot.position || null },
    beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid, anchor, P, cam: c, extra: { sun_altitude_deg: SUN.altitude, sun_azimuth_deg: SUN.azimuth, opening_m: +(OPEN.x1 - DOORS.edge).toFixed(3),
      band_top_at_face_m: TOP_Y, note: 'left edge: the slid-open panels; right edge: the jamb; top edge: the bedroom window head (stand-in slab); bottom: the floor' } }),
    hands: { meet_world: HANDS, meet_px: P(V(HANDS)), each_px: Object.fromEntries(Object.entries(figs).flatMap(([w, f]) => ['L', 'R'].map((n) => [`${w}.${n}`, P(f.userData.P['hand' + n])]))) },
    motes: { seed: MOTE.seed, count: MOTE.count }, mask: maskInfo, futon_clearance: futonClear(root, figs),
    points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'chin', 'handL', 'handR', 'hip', 'shoulderC'].map((k) => [k, r3(f.userData.P[k])]))])),
  });
  return { set: 'closet02', scene, root, cam, rig, near: shot.near ?? 0.05, far: shot.far ?? 6, figs, book: null, panes: {}, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor, litBg: 0x040303, flatBg: shot.beamMask ? 0x000000 : 0x555555, extra: extraOut };
}
