// Build one mv10 shot: 345B (living room, kitchen and dining, the core, the roof), the yard, the neighbours, figures,
// and the light rig for the shot's section (the real sun for SCENE, ceiling fixtures, fire poi). Everything from layout.js.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, tag, V, rad, slab, limb } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, polyMesh, applyBeamMask } from '../_beam.js';
import { CAST, PROP } from '../_cast.js';
import { ladleGrip, buildLadle, ladleProp, partyLadlePose } from './ladleGrip.js';
import { loadProps, prop } from '../_props.js';
import { SETTLED } from './settled.js';   // props phase 2 (2026-11-26 late): real downloaded models (work/props_audit.md)
await loadProps(['ladle', 'red_cup', 'juicer', 'pitcher', 'bowl', 'knife', 'lemon', 'cutting_board', 'half_barrel']);
import { glassTable } from './glassTable.js';
import { spineArt, spineSpec, NAMED } from './spines.js';
const bookName = (b) => (NAMED.test(b.t) ? b.t : `(blank spine, untitled ${b.lay === 'flat' ? 'book lying flat' : 'book'})`);   // r4: placeholder titles never reach the painter
import { artPlane, decalMesh } from '../_art.js';
import { LOGOS, MEATBALL as MB, SR71 } from './art.js';
import { HOUSE, GRADE, LIVING, KITCHEN, PARTITION, OPENING, CORE_WALLS, OPENINGS, apertureOf, NEIGHBOURS, SHELF, SHELF_AT, SHELF_W, shelfWorld, EXPEDIT2, PRINTER,
  COUCH, NOGUCHI, GLASS_TABLE, RAIL, COUNTERS, COUNTER_H, SINK, STOVE, DISHWASHER, FRIDGE, TRASH, WALNUT, UPPERS, OTR_MICROWAVE, PUNCHBOWL, PARTY_FOOD, PREP, PREP_JUICER, DINING, CEILING_LIGHTS, PATIO, STAIRS, STRAWBERRY, MINT, HOSE, CLOTHESLINE, FENCES, LAWN,
  TREE, GRAPEFRUIT, POI, punchLadle, AUDIENCE_AT, FLOOR_ABOVE_GRADE, poiCentre, PATH, MARKS, ROOM_CROSSING, SCENE, SUN, SUN_EVENTS, SECTION_KEY, SECTION_LIGHT, LIGHTS, FOOTPRINTS, sunlit, apertureLit, sunFootprints } from './layout.js';

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
  T1: GUEST('guest T1, at the punchbowl (face undrawn)', 1.72, 0x5a8a8a, 0x44403a, 'bob'),
  H1: GUEST('guest H1, the hug (face undrawn)', 1.7, 0x7a5a8a, 0x30343c, 'long'), G1: GUEST('guest G1, the greeting (face undrawn)', 1.8, 0xb8b06a, 0x3a3a44, 'short', 'short'),
  poi: GUEST('poi spinner (face undrawn)', 1.75, 0x2a2a2e, 0x2a2a2e, 'bun', 'short'),
  // the poi audience (Jade, 2026-11-25 late: along the side of the house by the wall, and on the deck). W1 W2 kept.
  W3: GUEST('guest W3, poi audience (face undrawn)', 1.69, 0x4a6a5a, 0x3a3a44, 'long'), W4: GUEST('guest W4, poi audience (face undrawn)', 1.81, 0x8a7a5a, 0x2c2c34, 'short', 'short'),
  D1: GUEST('guest D1, poi audience on the deck (face undrawn)', 1.63, 0xa86a5a, 0x2c3140, 'bob', 'short'), D2: GUEST('guest D2, poi audience on the deck (face undrawn)', 1.77, 0x5a5a7a, 0x44403a, 'short'),
  // the childhood friend (童友): he and Jade picked the lemons and made the lemonade before the party (Jade, 2026-11-25
  // late). Not in _cast.js (no adult figure there), so set-local. Height 1.85 (Jade, 2026-11-26: "about 6'0 or 6'1\"";
  // Ukrainian, Russian-speaking); costume is OURS (ASSUMED); face
  // undrawn like first love (back, hands). Not the charcoal hoodie: Jade says that old artwork matches Z, not him.
  friend: GUEST('childhood friend (27; face undrawn, back and hands only)', 1.85, 0x9a7a52, 0x3a3e48, 'short', 'pushed'),
  // the room crossing (Jade, 2026-11-25 round 2): the person she talks to in the kitchen (K1), the person at the shelf who
  // says something (R1), the two guests she welcomes (N1, N2) and the next two at the second doorbell (N3, N4). Jade said
  // "someone"; who they are, their looks and heights are OURS.
  K1: GUEST('guest K1, talking with her in the kitchen (face undrawn)', 1.75, 0x6a7a8a, 0x2c2c34, 'short'),
  R1: GUEST('guest R1, at the shelf: says something (face undrawn)', 1.66, 0xa0805a, 0x34343c, 'long'),
  N1: GUEST('guest N1, arriving (1st doorbell) (face undrawn)', 1.79, 0x4a4a5a, 0x3a3a44, 'short'), N2: GUEST('guest N2, arriving (1st doorbell) (face undrawn)', 1.61, 0xc08a7a, 0x2c3140, 'bob'),
  N3: GUEST('guest N3, arriving (2nd doorbell) (face undrawn)', 1.72, 0x7a9a6a, 0x44403a, 'bun'), N4: GUEST('guest N4, arriving (2nd doorbell) (face undrawn)', 1.83, 0x8a6a4a, 0x30343c, 'short'),
};
for (const [k, v] of Object.entries(NEW_CAST)) if (!CAST[k]) CAST[k] = v;
// first love at the housewarming (Jade, 2026-11-25): forearm hair clearly visible, so his sleeves are rolled up here
// (set-local copy; _cast.js keeps 'long'), and Naot cork sandals (Birkenstock type), modelled below as plain sandals.
if (CAST.firstLove27) CAST.firstLove27 = { ...CAST.firstLove27, sleeves: 'short' };
const FIRST_LOVE_COSTUME = { trousers: 'plain black slacks (dress trousers: straight leg, belt loops, a slight crease), not jeans (Jade 2026-11-26: "normal black slacks"; CAST FL_SLACKS)', sandals: 'Birkenstock-type cork sandals made by Naot (Jade); modelled as plain cork-soled sandals with two straps', forearms: 'forearm hair clearly visible (Jade): sleeves rolled up; draw the hair in the arm-tap shots (BR1, BR2, C2a, C2b)', height_m: CAST.firstLove27?.h };
function sandals(fig) {
  const g = new THREE.Group(), P = fig.userData.P, CORK = { grey: 0.62, col: 0xb08a5a }, STRAP = { grey: 0.25, col: 0x3a2a1e };
  for (const n of ['L', 'R']) { const h = P['heel' + n], t = P['toe' + n]; if (!h || !t) continue;
    // 2026-11-27: the mesh foot is now its real length (P.footLen, 251 mm), scaled about the ankle from the solver's
    // heel-toe span: the sole and straps scale with it (ks), or the toes overhang the cork and the straps cut the foot
    const ks = P['footLen' + n] ? P['footLen' + n] / h.distanceTo(t) : 1, a = h.clone(), b = t.clone(); a.y -= 0.004; b.y -= 0.004;
    const d = b.clone().sub(a), side = V(-d.z, 0, d.x).normalize();
    g.add(tag(slab(a.clone().addScaledVector(d, -0.03 - 0.2 * (ks - 1)), b.clone().addScaledVector(d, 0.05 + 0.8 * (ks - 1)), 0.1 * Math.sqrt(ks), 0.028, side, CORK), `${fig.name}: sandal (cork sole, Naot)`));
    for (const k of [0.42, 0.68]) { const c = a.clone().addScaledVector(d, k); const t2 = mk(new THREE.TorusGeometry(0.047 * ks, 0.009, 6, 16, Math.PI), STRAP);
      t2.position.copy(c).add(V(0, 0.012 * ks, 0)); t2.lookAt(c.clone().add(d)); g.add(tag(t2, `${fig.name}: sandal (strap)`)); } }
  return g;
}

// Her housewarming outfit (Jade, 2026-11-25): a thin black jacket, NASA "meatball" on the left chest, worn OVER a fitted
// black tee with an SR-71 print (planform from above, angled down-left, dark grey tone-on-tone: barely visible, a sliver
// between the open jacket fronts at most), boot-cut black yoga pants, socks, no shoes. The engine colours the torso /
// sleeves / legs / feet (shots.js JADE_HOUSEWARMING); this adds what it cannot: the tee's sliver between the jacket fronts,
// a meatball marker disc, and the boot-cut flare (a cone from the knee to a hem just off the floor, over the foot).
// ASSUMED (flagged): zip-front jacket worn unzipped, fronts nearly closed (tee sliver ~4 cm); hip-length; meatball ~8 cm;
// socks plain mid-grey; hem 1.2 cm off the floor, ~44 cm round at the hem.
export const HOUSEWARMING_COSTUME = { jacket: 'thin black zip-front jacket, worn unzipped and nearly closed over the tee (ASSUMED zip, open); a SMALL NASA meatball insignia (disc about 8 cm) on its LEFT chest, EXACTLY the decal layout/assets/art/logos/nasa_meatball.png (pass it as a reference): the real 1959 meatball, blue disc, white stars, white orbit ring, red chevron and its small white NASA lettering, the same in every shot (2026-11-26, Jade: one version of the logo; r4 decision art_meatball: WITH the white lettering, confirmed)',
  tee: 'fitted black t-shirt with an SR-71 Blackbird print: planform from above, angled down and to the left so it reads like a triangle, dark grey on black, subtle (Jade). Only a sliver shows between the jacket fronts', pants: 'boot-cut black yoga pants (fitted to the knee, flaring to the hem, which covers the heel and half the foot)',
  feet: 'at the party (indoors, the deck): socks, no shoes (Jade); colour plain mid-grey ASSUMED', before_party: 'same outfit before the party; OUTDOORS in the yard (V3a, V3b) SNEAKERS, not socks (Jade 2026-11-27): ASSUMED plain black canvas low-tops, white rubber soles and toe bumper; in the kitchen (V3b_prep) socks. NO belt (Jade): the jacket hangs over the waistband', sheet: 'cast/jade_27/j27_costume_housewarming_v1.jpg' };
// 2026-11-27 (Jade, V3a repaint: "SNEAKERS, not socks: she's outdoors"): before the party, in the yard (V3a, V3b), she
// wears sneakers. ASSUMED: plain black canvas low-tops with white rubber soles and a white toe bumper (the foot itself is
// coloured the canvas black through costume.sock). Built like the sandals: a sole slab under the heel-toe line.
function sneakers(fig) {
  const g = new THREE.Group(), P = fig.userData.P, RUB = { grey: 0.92, col: 0xf2f0ea }, CANVAS = { grey: 0.2, col: 0x1c1c1f };
  for (const n of ['L', 'R']) { const h = P['heel' + n], t = P['toe' + n]; if (!h || !t) continue;
    const ks = P['footLen' + n] ? P['footLen' + n] / h.distanceTo(t) : 1, a = h.clone(), b = t.clone(); a.y -= 0.002; b.y -= 0.002;
    const d = b.clone().sub(a), side = V(-d.z, 0, d.x).normalize();
    const A = a.clone().addScaledVector(d, -0.04 - 0.2 * (ks - 1)), B = b.clone().addScaledVector(d, 0.06 + 0.8 * (ks - 1));
    const sole = slab(A, B, 0.098 * Math.sqrt(ks), 0.03, side, RUB); sole.userData.who = 'jade27'; g.add(tag(sole, `${fig.name}: shoe (white rubber sole)`));
    // the canvas upper over the toes and the vamp (a half capsule along the foot's front half), white bumper at the toe
    const up = mk(new THREE.SphereGeometry(0.05, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), CANVAS); up.scale.set(0.95 * Math.sqrt(ks), 0.75, 1.9 * ks);
    const c = A.clone().lerp(B, 0.7); up.position.copy(c).add(V(0, 0.012, 0)); up.lookAt(c.clone().add(d).add(V(0, 0.012, 0))); up.userData.who = 'jade27'; g.add(tag(up, `${fig.name}: shoe (black canvas upper)`));
    const bump = mk(new THREE.SphereGeometry(0.03, 12, 8), RUB); bump.scale.set(1.45 * Math.sqrt(ks), 0.55, 0.8); bump.position.copy(B.clone().addScaledVector(d.clone().normalize(), -0.025)).add(V(0, 0.015, 0)); bump.lookAt(bump.position.clone().add(d)); bump.userData.who = 'jade27'; g.add(tag(bump, `${fig.name}: shoe (white toe bumper)`)); }
  return g;
}
function housewarming(fig) {
  const out = new THREE.Group(), P = fig.userData.P, H = P.H; fig.updateMatrixWorld(true);
  const BLACK_TEE = { grey: 0.3, col: 0x2a2a2e }, MEATBALL = { grey: 0.78, col: 0x0b3d91 }, PANT = { grey: 0.42, col: 0x151517, formTint: (() => { const c = new THREE.Color(0x151517); return [c.r, c.g, c.b]; })() };   // formTint: without it the form guide classed the flare as bare 'person' and drew it WHITE (fixed 2026-11-27 evening)
  const hitM = []; fig.traverse((m) => { const g = m.userData?.idGroup; if (m.isMesh && g && (g.endsWith(':torso') || g.endsWith(':pelvis'))) hitM.push(m); });
  const rc = new THREE.Raycaster();
  const surf = (u, v, d) => { const o = P.shoulderC.clone().addScaledVector(P.cy, v).addScaledVector(P.cx, u).addScaledVector(P.cz, 0.4);
    rc.set(o, P.cz.clone().negate()); rc.far = 0.6; const h = rc.intersectObjects(hitM, false)[0]; if (!h) return null;
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld); if (n.dot(P.cz) < 0) n.negate(); return h.point.clone().addScaledVector(n, d); };
  const who = (m, label) => { m.userData.who = 'jade27'; return tag(m, label); };
  // the tee between the jacket fronts: a 4 cm strip from just under the neckline to the jacket hem
  { const v0 = -0.035, v1 = -(P.shoulderC.distanceTo(P.waist) + 0.09), N = 14, w = 0.02, verts = [], idx = [];
    for (let i = 0; i <= N; i++) { const v = v0 + (v1 - v0) * i / N; for (const u of [-w, w]) { const p = surf(u, v, 0.003) || P.shoulderC.clone().addScaledVector(P.cy, v).addScaledVector(P.cx, u); verts.push(p.x, p.y, p.z); } }
    for (let i = 0; i < N; i++) { const a = 2 * i; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(idx); g.computeVertexNormals();
    // 2026-11-26: the strip shows its slice of the SR-71 print (logos/sr71_print.png; centred on the chest, SR71.w wide)
    const uvs = []; for (let i = 0; i <= N; i++) { const v = v0 + (v1 - v0) * i / N; for (const u of [-w, w]) uvs.push(0.5 + u / SR71.w, 0.5 + (v - SR71.v) / SR71.w); }
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    const m = mk(g, LOGOS.sr71 ? { ...BLACK_TEE, art: LOGOS.sr71.art, artGrey: LOGOS.sr71.artGrey, artEdge: LOGOS.sr71.artEdge } : BLACK_TEE); m.userData.double = true; m.userData.idGroup = 'jade27:tee'; out.add(who(m, 'Jade (27): tee between the jacket fronts (SR-71 print, barely visible)')); }
  // the meatball on the jacket's left chest (her own left = +cx)
  // 2026-11-26: the canonical decal (layout/assets/art/logos/nasa_meatball.png, art.js), conformed to the torso by the
  // same raycast; without the image, the old plain disc
  { const c = surf(0.085, -0.1, 0.004); if (c && LOGOS.meatball) { const M = MB, k = M.disc_m / (2 * M.r), w = M.imgW * k, h = M.imgH * k;
      const u0 = 0.085 - M.cx * k, v0 = -0.1 + (M.cy - M.imgH) * k;   // the image's bottom-left corner, so the disc centre lands at (0.085, -0.1)
      const m = decalMesh(LOGOS.meatball, (s, t) => surf(u0 + s * w, v0 + t * h, 0.004) || c, MEATBALL); m.userData.idGroup = 'jade27:meatball';
      out.add(who(m, 'Jade (27): NASA meatball (jacket, left chest)')); }
    else if (c) { const n = c.clone().sub(surf(0.085, -0.1, 0)).normalize();
    const m = mk(new THREE.CircleGeometry(0.04, 32), MEATBALL); m.position.copy(c); m.lookAt(c.clone().add(n)); m.userData.double = true; m.userData.idGroup = 'jade27:meatball';
    out.add(who(m, 'Jade (27): NASA meatball (jacket, left chest)')); } }
  // boot-cut flare: from the knee (fitted) to the hem
  for (const s of ['L', 'R']) { const K = P['knee' + s], A = P['ankle' + s], sole = Math.min(P['heel' + s].y, P['toe' + s].y);
    const sd = A.clone().sub(K).normalize(), hemY = sole + 0.012, len = K.distanceTo(A) + Math.max(0, (A.y - hemY) / Math.max(0.3, -sd.y));
    const rTop = 0.036 * H + 0.002, rHem = 0.07;
    const m = mk(new THREE.CylinderGeometry(rTop, rHem, len, 28, 1, true), PANT); m.userData.double = true; m.userData.idGroup = 'jade27:flare' + s;
    m.position.copy(K).addScaledVector(sd, len / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), sd);
    out.add(who(m, 'Jade (27): boot-cut yoga pants (flare)')); }
  return out;
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
  g.add(tag(box(LIVING.x1 - LIVING.x0, 0.04, PARTITION.zc - LIVING.z0, FLOORW, [(LIVING.x0 + LIVING.x1) / 2, -0.02, (LIVING.z0 + PARTITION.zc) / 2]), 'living room floor (oak)'));
  g.add(tag(box(KITCHEN.x1 - KITCHEN.x0, 0.04, KITCHEN.z1 - PARTITION.zc, TILE, [(KITCHEN.x0 + KITCHEN.x1) / 2, -0.02, (PARTITION.zc + KITCHEN.z1) / 2]), 'kitchen floor (tile)'));
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
  g.add(wallSeg({ axis: 'X', at: PARTITION.zc, s0: PARTITION.x0, s1: PARTITION.x1 + 0.06, t: PARTITION.t, y0: 0, y1: H.ceil, look: PLASTER, label: 'thick partition wall (living room | kitchen; Jade: built-in / chimney / closet)' }));
  for (const w of CORE_WALLS) { const alongZ = w.a[0] === w.b[0], s0 = alongZ ? w.a[1] : w.a[0], s1 = alongZ ? w.b[1] : w.b[0];
    g.add(wallSeg({ axis: alongZ ? 'Z' : 'X', at: alongZ ? w.a[0] : w.a[1], s0: Math.min(s0, s1), s1: Math.max(s0, s1), t: H.intT, y0: 0, y1: H.ceil,
      holes: (w.doors || []).map(([d0, d1]) => ({ s0: Math.min(s0, s1) + d0, s1: Math.min(s0, s1) + d1, y0: 0, y1: 2.03 })), look: PLASTER, label: w.name })); }
  // glass in every window; the front door leaf (open 30 deg in); the sliding glass door (SSW panel open behind the fixed one)
  for (const o of OPENINGS) { const A = apertureOf(o), inset = T / 2, n = o.wall === 'WNW' ? [0, 0, 1] : o.wall === 'ESE' ? [0, 0, -1] : o.wall === 'SSW' ? [1, 0, 0] : [-1, 0, 0];
    const C = A.map((p) => V(p[0] + n[0] * inset, p[1], p[2] + n[2] * inset)); const inside = [C[1], C[0], C[3], C[2]];   // TL, TR, BR, BL from inside
    const key = o.name.replace(/[^a-z0-9]+/gi, '_').replace(/_$/, '').toLowerCase();
    panes[key] = inside;
    if (o.kind === 'window') { g.add(tag(quad(inside, GLASS), o.name + ' (glass)'));
      const F = { grey: 0.85, col: 0xe8e4da }, mid = C[0].clone().add(C[1]).multiplyScalar(0.5), sill = C[3].clone().add(C[2]).multiplyScalar(0.5);
      const along = o.wall === 'WNW' || o.wall === 'ESE' ? [o.s1 - o.s0, 0.05, T + 0.02] : [T + 0.02, 0.05, o.s1 - o.s0];
      g.add(tag(box(...along, F, [sill.x, o.y0 + 0.025, sill.z]), o.name + ' (sill)'));
      g.add(tag(box(...(o.wall === 'WNW' || o.wall === 'ESE' ? [0.04, o.y1 - o.y0, T + 0.02] : [T + 0.02, o.y1 - o.y0, 0.04]), F, [mid.x, (o.y0 + o.y1) / 2, mid.z]), o.name + ' (mullion)')); } }
  { const o = OPENINGS.find((q) => q.name === 'front door'), w = o.s1 - o.s0, hg = new THREE.Group(); hg.position.set(o.s1 - 0.02, 0, T + 0.025); hg.rotation.y = rad(shot.frontDoorDeg ?? o.leaf.openDeg);   // per-shot override (the crossing keys: closed, then wide open)
    hg.add(tag(box(w - 0.02, o.y1 - 0.01, 0.045, { grey: 0.55, col: 0x6a4a36 }, [-(w - 0.02) / 2, (o.y1 - 0.01) / 2, 0]), 'front door (leaf, open)')); g.add(hg);
    // front steps down to grade (OURS): four risers, a 0.3 m landing at the door then three treads WNW
    { const n = 4, rise = FLOOR_ABOVE_GRADE / n; for (let k = 0; k < n; k++) { const top = -k * rise, h = top - GRADE;
      g.add(tag(box(1.5, h, 0.3, { grey: 0.7, col: 0x9a968c }, [(o.s0 + o.s1) / 2, GRADE + h / 2, -0.3 * k - 0.15]), 'front steps')); } } }
  // the sliding glass door (Jade, 2026-11-25 late): two panels in a white frame; the fixed panel on the outer track at
  // the NNE half, the sliding panel on the inner track, slid open behind it (OURS)
  { const o = OPENINGS.find((q) => q.kind === 'slider'), FR = { grey: 0.88, col: 0xeeeae2 }, pw = (o.s1 - o.s0) / 2 + 0.03, zo = H.Z - T * 0.35, zi = H.Z - T * 0.65;
    const panel = (x0, z, lab) => { const add = (m) => g.add(tag(m, lab));
      add(box(pw, 0.07, 0.035, FR, [x0 + pw / 2, o.y1 - 0.035, z])); add(box(pw, 0.09, 0.035, FR, [x0 + pw / 2, 0.045, z]));
      add(box(0.06, o.y1, 0.035, FR, [x0 + 0.03, o.y1 / 2, z])); add(box(0.06, o.y1, 0.035, FR, [x0 + pw - 0.03, o.y1 / 2, z]));
      add(quad([V(x0 + 0.06, o.y1 - 0.07, z), V(x0 + pw - 0.06, o.y1 - 0.07, z), V(x0 + pw - 0.06, 0.09, z), V(x0 + 0.06, 0.09, z)], GLASS)); };
    panel(o.s1 - pw, zo, 'sliding glass door (fixed panel)');
    panel(o.s1 - pw - 0.08, zi, 'sliding glass door (sliding panel, open)');
    g.add(tag(box(o.s1 - o.s0, 0.025, T, { grey: 0.6, col: 0x9a9a9a }, [(o.s0 + o.s1) / 2, 0.0125, H.Z - T / 2]), 'sliding glass door (track)'));
    g.add(tag(box(o.s1 - o.s0, 0.03, T, FR, [(o.s0 + o.s1) / 2, o.y1 + 0.015, H.Z - T / 2]), 'sliding glass door (head)')); }
  return { g, panes };
}

// ---------------------------------------------------------------- the Expedit 5x5 (layout.js SHELF): contents unchanged since the first build
const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
const BOOK_COLS = { art: [0xd8d0c0, 0xc8553a, 0xe0c060, 0x2a2a30, 0xe8e2d2, 0x7a9a5a, 0xb0a890], lit: [0x3a6a8a, 0xd8c8a8, 0x8a4a7a, 0xc8553a, 0x4a5a3a, 0xe0d8c8, 0x2a3a5a],
  sf: [0xe0b030, 0x3a7ad0, 0xd0503a, 0x40a080, 0xb060c0, 0x1a1a22, 0xe07a20], sci: [0x22304a, 0xe8e4da, 0x1f3a2a, 0x4a3a22, 0x5a1f1f, 0x3a5a8a, 0xd0c060] };
// 2026-11-27: the lettered books (spines.js SPEC: the textbooks and the two named popular books) take the REAL
// edition's cover colour (image-searched; sources in NOTES.md 2026-11-27), the Feynman set its red cloth. Every other
// book's colour is still OUR pick from BOOK_COLS (blank placeholder spines).
const lum01 = (c) => (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255;
function bookLook(b) {
  const S = spineSpec(b); if (S) return { grey: +lum01(S.box).toFixed(3), col: S.box };
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
    g.add(tag(m, bookLabel(b, half))); g.add(spinePlane(b, false, [x + dir * b.w / 2, cu.y0 + b.h / 2], half)); x += dir * b.w; runH = Math.max(runH, b.h); }
  const flat = list.filter((b) => b.lay === 'flat').sort((p, q) => q.h - p.h); if (!flat.length) return;
  const pw = flat[0].h; let px, yy;
  if ((limit - x) * dir >= pw + 0.006) { px = x + dir * (pw / 2 + 0.006); yy = cu.y0; } else { px = run0 + dir * pw / 2; yy = cu.y0 + runH; }
  for (const b of flat) { if (yy + b.w > cu.y1 - 0.002) { SHELF_WARN.push(`${cu.key}: no headroom for "${b.t}" lying flat`); break; }
    const m = box(b.h - 0.002, b.w - 0.0012, b.d, bookLook(b), [px + dir * (hash(b.t) - 0.5) * 0.006, yy + b.w / 2, zs - b.d / 2]); m.userData.book = b.t;
    g.add(tag(m, bookLabel(b, half))); g.add(spinePlane(b, true, [px + dir * (hash(b.t) - 0.5) * 0.006, yy + b.w / 2], half)); yy += b.w; }
}
// 2026-11-26: the spine lettering (spines.js: the real titles, drawn in code), a plane on the book's front face
function spinePlane(b, flat, [cx, cy], half) {
  const L = bookLook(b), a0 = spineArt(b, L.col), a = flat ? a0.flat : a0;
  const m = flat ? artPlane(a, b.h - 0.002, b.w - 0.0012, { grey: L.grey, col: L.col }) : artPlane(a, b.w - 0.0012, b.h, { grey: L.grey, col: L.col });
  m.position.set(cx, cy, SHELF.spineZ + 0.0006); m.userData.book = b.t;
  // its own label (hold pass 2026-11-26): with the book's label the hold check took this paper-thin plane for the book
  return tag(m, 'spine lettering: ' + bookLabel(b, half).replace(' (', ', ').replace(')', ''));
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

// ---------------------------------------------------------------- the kitchen (2026-11-25 round 2: Jade's fridge, dishwasher, trash can,
// upper cabinets, dark walnut doors, the giant punchbowl; party food or the lemonade prep). Numbers in layout.js.
const STEEL = { grey: 0.72, col: 0xb4b6b8 }, PITH = { grey: 0.96, col: 0xf6f1dc }, LEMON = { grey: 0.95, col: 0xf2d21c }, FLESH = { grey: 0.9, col: 0xf4dc5c };
// the friend's bowl of picked lemons (Jade, 2026-11-27 evening): a FROSTED PLEXIGLASS punch bowl, pale and milky, softly
// see-through (the lemons read through it as soft shapes). The real bowl model's shape (props/bowl) with a glass look:
// no library punch bowl was used (none checked: the bowl shape already fits the settled lemons and the hand hold).
const FROSTED_PLEXI = { grey: 0.93, col: 0xeef1ef, glass: true, opacity: 0.55, flatGrey: 0.9 };
const LEMONADE = { grey: 0.9, col: 0xf3e38a }, GLASSY = { grey: 0.9, col: 0xdde8e8 }, CERAMIC = { grey: 0.94, col: 0xf2efe6 };
// a row of cabinet doors on one face. axis 'X': doors along X on the plane z = at; 'Z': along Z on x = at. out = +1 / -1 (the
// way the face looks). skip: [[s0, s1]] spans with no door (appliances).
function doorRow(g, { axis, s0, s1, at, out, y0, y1, skip = [], w = 0.5, lab, pullLow = false }) {
  const free = []; let cur = s0;
  for (const [a, b] of skip.slice().sort((p, q) => p[0] - q[0])) { if (a > cur + 0.02) free.push([cur, a]); cur = Math.max(cur, b); }
  if (s1 > cur + 0.02) free.push([cur, s1]);
  for (const [a, b] of free) { const n = Math.max(1, Math.round((b - a) / w)), dw = (b - a) / n, t = 0.018, hh = y1 - y0;
    for (let k = 0; k < n; k++) { const c = a + dw * (k + 0.5), ww = dw - 0.006, py = pullLow ? y0 + 0.08 : y1 - 0.08, side = k % 2 ? -1 : 1, pc = c + side * (dw / 2 - 0.05);
      g.add(tag(box(...(axis === 'X' ? [ww, hh, t] : [t, hh, ww]), WALNUT, axis === 'X' ? [c, (y0 + y1) / 2, at + out * t / 2] : [at + out * t / 2, (y0 + y1) / 2, c]), lab));
      g.add(tag(box(...(axis === 'X' ? [0.012, 0.1, 0.02] : [0.02, 0.1, 0.012]), STEEL, axis === 'X' ? [pc, py, at + out * (t + 0.01)] : [at + out * (t + 0.01), py, pc]), lab + ' (pull)')); } }
}
const bowlMesh = (r, k, look) => { const m = mk(new THREE.SphereGeometry(r, 28, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), look); m.scale.set(1, k, 1); return m; };
// a pomelo-sized lemon cut across, cut face up: rind dome below, the pith ring, ten segments, the core and a few seeds.
// The botanical cross-section of V3b_prep: each segment is its own mesh, so the line render draws every membrane.
function lemonHalf(g, [x, y, z], R = TREE.lemonR, rot = 0, lab = 'lemon half (cut face up)') {
  const dome = bowlMesh(R, 1.22, LEMON); dome.position.set(x, y + 1.22 * R, z); g.add(tag(dome, lab + ' (rind)'));
  const yc = y + 1.22 * R + 0.001, flat = (geo, look, dy, l) => { const m = mk(geo, look); m.rotation.x = -Math.PI / 2; m.position.set(x, yc + dy, z); m.rotation.z = rot; g.add(tag(m, l)); return m; };
  flat(new THREE.RingGeometry(R * 0.93, R, 48), LEMON, 0, lab + ' (rind)');
  flat(new THREE.RingGeometry(R * 0.80, R * 0.93, 48), PITH, 0, lab + ' (pith)');
  const n = 10; for (let k = 0; k < n; k++) { const a0 = (k / n) * Math.PI * 2 + 0.03, al = Math.PI * 2 / n - 0.06;
    flat(new THREE.CircleGeometry(R * 0.78, 6, a0, al), { ...FLESH, grey: k % 2 ? 0.9 : 0.88 }, 0.001, lab + ' (segment)'); }
  flat(new THREE.CircleGeometry(R * 0.13, 16), PITH, 0.002, lab + ' (core)');
  const RS = rng(Math.round(x * 1000 + z * 7)); for (let k = 0; k < 4; k++) { const a = Math.PI * 2 * (k * 2 + 0.5) / n + rot, rr = R * (0.35 + 0.15 * RS());
    g.add(tag(ball(0.006, { grey: 0.85, col: 0xeee6c4 }, [x + Math.cos(a) * rr, yc + 0.003, z - Math.sin(a) * rr], [1.8, 0.6, 1]), lab + ' (seed)')); }
}
// a squeezed rind: an emptied half shell, cut side up, squashed, the white pith inside showing, a torn membrane
function rind(g, [x, y, z], R, tilt, lab = 'squeezed rinds') {
  const grp = new THREE.Group(); grp.position.set(x, y, z); if (tilt.isQuaternion) grp.quaternion.copy(tilt); else grp.rotation.set(tilt[0], tilt[1], tilt[2]);
  const out = mk(new THREE.SphereGeometry(R, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), LEMON); out.scale.set(1, 0.55, 0.82); grp.add(tag(out, lab));
  const inn = mk(new THREE.SphereGeometry(R * 0.86, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), PITH); inn.scale.set(1, 0.5, 0.8); inn.position.y = 0.004; grp.add(tag(inn, lab + ' (pith)'));
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + tilt[1]; grp.add(tag(ball(R * 0.22, { ...FLESH, grey: 0.85 }, [Math.cos(a) * R * 0.3, -R * 0.2, Math.sin(a) * R * 0.25], [1.4, 0.4, 0.7]), lab + ' (torn pulp)')); }
  g.add(grp);
}
function food(g, [shape, size, x, z, lab], y, R) {
  const bowl = /bowl/.test(lab);
  if (shape === 'round') { const r = size;
    if (bowl) { const b = bowlMesh(r, 0.55, CERAMIC); b.position.set(x, y + 0.55 * r, z); g.add(tag(b, lab)); g.add(tag(cyl(r * 0.92, r * 0.92, 0.01, { grey: 0.7, col: 0xd8a860 }, [x, y + 0.5 * r, z], null, 24), lab)); return; }
    g.add(tag(cyl(r, r * 0.92, 0.018, CERAMIC, [x, y + 0.009, z], null, 28), lab));
    if (/plates|napkins/.test(lab)) { g.add(tag(cyl(r, r, 0.05, { grey: 0.97, col: 0xfafafa }, [x, y + 0.025, z], null, 24), lab)); return; }
    const n = Math.round(r * 60); for (let k = 0; k < n; k++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r * 0.78;
      g.add(tag(ball(0.018 + R() * 0.01, { grey: 0.5 + R() * 0.4, col: [0xc85a3a, 0x6a9a4a, 0xe8d8a0, 0xa04a6a][k % 4] }, [x + Math.cos(a) * rr, y + 0.03, z + Math.sin(a) * rr], [1, 0.7, 1]), lab)); }
    return; }
  const [w, d] = size;
  // hold pass (2026-11-26): a bag stands on the counter itself (it sat 1 cm down inside its tray, which had the same label)
  if (/bag/.test(lab)) { g.add(tag(box(w * 0.9, 0.08, d * 0.9, { grey: 0.55, col: 0xc8402a }, [x, y + 0.04, z]), lab)); return; }
  g.add(tag(box(w, 0.02, d, /napkins/.test(lab) ? { grey: 0.95, col: 0xf0ece0 } : { grey: 0.6, col: 0xa07a50 }, [x, y + 0.01, z]), lab));
  if (/napkins/.test(lab)) { g.add(tag(box(w, 0.04, d, { grey: 0.95, col: 0xf0ece0 }, [x, y + 0.03, z]), lab)); return; }
  for (let i = 0; i < Math.floor(w / 0.06); i++) for (let j = 0; j < Math.floor(d / 0.06); j++)
    g.add(tag(box(0.04, 0.02, 0.04, { grey: 0.6 + 0.3 * R(), col: [0xe8c86a, 0xd8b070, 0xb07a4a][(i + j) % 3] }, [x - w / 2 + 0.03 + i * 0.06, y + 0.03, z - d / 2 + 0.03 + j * 0.06]), lab));
}
// the giant punchbowl (party: on the counter right of the stove, full, a ladle in it; prep: on the dining table, being
// mixed, a long wooden spoon). Returns the top of the spoon / ladle handle (for a hand).
const PREP_HALF_Y = 0.105 - 0.002;   // the lemon half's cut face above the counter: the reamer cone's tip (y + 0.075 + 0.03), 2 mm in
function punchbowl(g, [x, z], y, { fill = 0.8, tool = 'ladle', lab = 'giant punchbowl of lemonade' } = {}) {
  const P = PUNCHBOWL, k = P.h / P.r, yb = y + P.foot;
  g.add(tag(cyl(0.09, 0.12, P.foot, GLASSY, [x, y + P.foot / 2, z], null, 28), lab + ' (foot)'));
  const b = bowlMesh(P.r, k, GLASSY); b.position.set(x, yb + P.h, z); g.add(tag(b, lab));
  const yl = yb + P.h * fill, rl = P.r * Math.sqrt(1 - (1 - fill) ** 2);
  g.add(tag(cyl(rl, rl, 0.006, LEMONADE, [x, yl, z], null, 40), 'lemonade (in the punchbowl)'));
  const RS = rng(5); for (let i = 0; i < 6; i++) { const a = RS() * Math.PI * 2, rr = RS() * rl * 0.7;
    g.add(tag(cyl(0.035, 0.035, 0.006, { ...FLESH, grey: 0.93 }, [x + Math.cos(a) * rr, yl + 0.005, z + Math.sin(a) * rr], null, 16), 'lemon slices (floating)')); }
  if (tool === 'none') return null;   // V3b_prep: the ladle is built with the hand that holds it (ladleGrip.js)
  // r4 props phase 2: the party ladle is the REAL ladle (props/ladle via ladleGrip.js partyLadlePose; T1's fist on its grip)
  if (tool === 'ladle') { const PL = partyLadlePose(punchLadle(y, fill)), p = ladleProp(PL.q, PL.at); if (p) { g.add(p); return V(PL.grip); } }
  const lean = V(-0.35, 1, 0.25).normalize(), foot = V(x + 0.05, yl - 0.03, z - 0.04), L = tool === 'ladle' ? 0.40 : 0.42, top = foot.clone().addScaledVector(lean, L);
  const t0 = tool === 'ladle' ? punchLadle(y, fill).t0 : 0;   // the ladle's handle starts just above the lemonade (layout.js punchLadle)
  const h = cyl(tool === 'ladle' ? 0.008 : 0.011, tool === 'ladle' ? 0.008 : 0.011, L - t0, tool === 'ladle' ? STEEL : WOOD, foot.clone().addScaledVector(lean, (L + t0) / 2).toArray(), null, 8);
  h.quaternion.setFromUnitVectors(V(0, 1, 0), lean); g.add(tag(h, tool === 'ladle' ? 'ladle' : 'long wooden spoon (stirring)'));
  if (tool === 'ladle') { const c = bowlMesh(0.045, 0.8, STEEL); c.position.copy(foot).add(V(0, 0.02, 0)); g.add(tag(c, 'ladle')); }
  return top;
}
// a real bowl with its settled contents (settled.js, from settle.mjs / Rapier), bottom centre at [x, y, z]; returns the group
function settledBowl(g, [x, y, z], S, bowlLab, o = {}) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.userData.holdWhole = !!o.holdWhole;
  const b = prop('bowl', { at: [0, 0, 0], size: { w: S.w }, label: bowlLab, ...(o.look ? { look: o.look } : {}) }); if (b) grp.add(b);
  let nLeaf = o.leaves || 0;
  for (const it of S.items) { const q = new THREE.Quaternion(...it.quat);
    if (it.kind === 'lemon') { const l = prop('lemon', { at: it.at, rot: q, scale: SETTLED.LEMON_K, label: o.label || bowlLab, look: { grey: 0.9, col: 0xf2d21c } }); if (!l) continue; grp.add(l);   // lemon yellow (the scan's texture reads olive in lit)
      if (nLeaf-- > 0) { const stem = new THREE.Vector3(0, 0.0954 * SETTLED.LEMON_K, 0).applyQuaternion(q).add(V(it.at)), out = new THREE.Vector3(stem.x, 0, stem.z).normalize();
        const lf = ball(0.045, { grey: 0.4, col: 0x3a6a2a }, stem.clone().addScaledVector(out, 0.04).add(V(0, 0.004, 0)).toArray(), [1, 0.12, 0.45]); lf.rotation.y = Math.atan2(-out.z, out.x);
        grp.add(tag(lf, 'lemon leaf (still on the stem)')); } }
    else rind(grp, it.at, S.rindR, q); }
  g.add(grp); return grp;
}
function kitchen(g, dressing) {
  const R = rng(23), CT = { grey: 0.55, col: 0x8a8478 };
  // base cabinets (walnut carcass), the top, the toe kick, walnut doors on the run's front
  COUNTERS.forEach((c, i) => { const cx = (c.x0 + c.x1) / 2, cz = (c.z0 + c.z1) / 2;
    g.add(tag(box(c.x1 - c.x0 - 0.04, COUNTER_H - 0.1 - 0.035, c.z1 - c.z0 - 0.04, WALNUT, [cx, 0.1 + (COUNTER_H - 0.135) / 2, cz]), 'kitchen counters (base cabinets, dark walnut)'));
    g.add(tag(box(c.x1 - c.x0, 0.035, c.z1 - c.z0, CT, [cx, COUNTER_H - 0.0175, cz]), 'kitchen counters (top)'));
    g.add(tag(box(c.x1 - c.x0 - 0.1, 0.1, c.z1 - c.z0 - 0.1, DARK, [cx, 0.05, cz]), 'kitchen counters (toe kick)'));
    const y0 = 0.11, y1 = COUNTER_H - 0.045, lab = 'cabinet doors (dark walnut)';
    if (c.front === '+Z') doorRow(g, { axis: 'X', s0: c.x0 + 0.01, s1: COUNTERS[1].x0, at: c.z1 - 0.02, out: 1, y0, y1, lab });
    if (c.front === '-Z') doorRow(g, { axis: 'X', s0: c.x0 + 0.01, s1: c.x1, at: c.z0 + 0.02, out: -1, y0, y1, lab, w: 0.35 });
    if (c.front === '-X') doorRow(g, { axis: 'Z', s0: c.z0, s1: COUNTERS[2].z0, at: c.x0 + 0.02, out: -1, y0, y1, lab, skip: [[STOVE.z0, STOVE.z1], [DISHWASHER.z0, DISHWASHER.z1]] }); });
  // the sink and tap (unchanged)
  g.add(tag(box(SINK.x1 - SINK.x0, 0.01, 0.42, { grey: 0.3, col: 0x6a6a70 }, [(SINK.x0 + SINK.x1) / 2, COUNTER_H + 0.002, SINK.z]), 'sink'));
  g.add(tag(cyl(0.012, 0.012, 0.3, { grey: 0.7, col: 0xb8b8bc }, [(SINK.x0 + SINK.x1) / 2, COUNTER_H + 0.15, SINK.z + 0.24], null, 10), 'sink (tap)'));
  // the range: cooktop, burners, the oven door and the control panel on its front (-X)
  { const S = STOVE, zc = (S.z0 + S.z1) / 2, w = S.z1 - S.z0, fx = COUNTERS[1].x0;
    g.add(tag(box(0.6, 0.012, w, DARK, [S.x, COUNTER_H + 0.006, zc]), 'stove'));
    for (const [dx, dz] of [[-0.14, -0.18], [0.14, -0.18], [-0.14, 0.18], [0.14, 0.18]]) g.add(tag(cyl(0.09, 0.09, 0.01, { grey: 0.25, col: 0x3a3a3a }, [S.x + dx, COUNTER_H + 0.017, zc + dz], null, 20), 'stove'));
    g.add(tag(box(0.03, COUNTER_H - 0.12, w - 0.01, { grey: 0.3, col: 0x2e2e30 }, [fx - 0.005, 0.1 + (COUNTER_H - 0.12) / 2, zc]), 'stove (oven door)'));
    g.add(tag(box(0.03, 0.025, w - 0.12, STEEL, [fx - 0.03, COUNTER_H - 0.12, zc]), 'stove (oven handle)'));
    g.add(tag(box(0.6, 0.012, w, DARK, [S.x, COUNTER_H + 0.006, zc]), 'stove')); }
  // the dishwasher right of the stove (Jade): a stainless front under the counter
  { const D = DISHWASHER, zc = (D.z0 + D.z1) / 2, fx = COUNTERS[1].x0;
    g.add(tag(box(0.025, COUNTER_H - 0.13, D.z1 - D.z0 - 0.006, STEEL, [fx + 0.005, 0.1 + (COUNTER_H - 0.13) / 2, zc]), 'dishwasher (Jade)'));
    g.add(tag(box(0.03, 0.025, D.z1 - D.z0 - 0.12, { grey: 0.5, col: 0x8a8a8c }, [fx - 0.02, COUNTER_H - 0.09, zc]), 'dishwasher (handle)')); }
  // the fridge near the 2x2 (Jade): back to the partition, doors facing ESE into the kitchen
  { const F = FRIDGE, cx = (F.x0 + F.x1) / 2, W = { grey: F.grey ?? 0.6, col: F.col };
    g.add(tag(box(F.x1 - F.x0, F.h, F.z1 - F.z0 - 0.04, W, [cx, F.h / 2, (F.z0 + F.z1 - 0.04) / 2]), 'fridge (Jade: normal size, dark beige, against the partition behind the 2x2)'));
    for (const [ya, yb] of [[0.02, F.freezerY - 0.01], [F.freezerY + 0.01, F.h - 0.01]]) {
      g.add(tag(box(F.x1 - F.x0 - 0.01, yb - ya, 0.04, W, [cx, (ya + yb) / 2, F.z1 - 0.02]), 'fridge (door)'));
      g.add(tag(box(0.025, Math.min(0.5, (yb - ya) * 0.6), 0.03, STEEL, [F.x1 - 0.07, ya + (yb - ya) * (ya < 0.5 ? 0.7 : 0.35), F.z1 + 0.02]), 'fridge (handle)')); } }
  // the stainless step-lid trash can right of the sink (Jade)
  { const T = TRASH, [x, z] = T.at;
    g.add(tag(cyl(T.r, T.r * 0.95, T.h - 0.04, STEEL, [x, (T.h - 0.04) / 2, z], null, 28), 'stainless step-lid trash can (Jade)'));
    g.add(tag(ball(T.r * 1.01, STEEL, [x, T.h - 0.04, z], [1, 0.28, 1]), 'stainless step-lid trash can (lid)'));
    g.add(tag(box(0.1, 0.02, 0.07, { grey: 0.3, col: 0x333333 }, [x - T.r - 0.02, 0.03, z]), 'stainless step-lid trash can (pedal)')); }
  // the upper cabinets
  for (const U of UPPERS) { g.add(tag(box(U.x1 - U.x0, U.y1 - U.y0, U.z1 - U.z0, WALNUT, [(U.x0 + U.x1) / 2, (U.y0 + U.y1) / 2, (U.z0 + U.z1) / 2]), 'upper cabinets (dark walnut)'));
    const lab = 'upper cabinet doors (dark walnut)';
    if (U.front === '+Z') doorRow(g, { axis: 'X', s0: U.x0, s1: U.x1, at: U.z1, out: 1, y0: U.y0 + 0.01, y1: U.y1 - 0.01, lab, w: 0.4, pullLow: true });
    else doorRow(g, { axis: 'Z', s0: U.z0 + (U.z0 < 5.5 ? 0.33 : 0), s1: U.z1, at: U.x0, out: -1, y0: U.y0 + 0.01, y1: U.y1 - 0.01, lab, w: 0.4, pullLow: true }); }
  // over the stove (Jade 2026-11-26): the over-the-range microwave in the gap between the core-wall uppers, a short walnut
  // cabinet above it to the uppers' top line; its fan, vent and cooktop lights are on its underside (layout.js OTR_MICROWAVE)
  { const M = OTR_MICROWAVE, zc = (M.z0 + M.z1) / 2, w = M.z1 - M.z0, h = M.y1 - M.y0, fx = M.x0, BLK = { grey: 0.14, col: 0x1c1c1e }, L = 'over-the-range microwave';
    g.add(tag(box(M.x1 - M.x0, h, w - 0.004, STEEL, [(M.x0 + M.x1) / 2, (M.y0 + M.y1) / 2, zc]), `${L} (stainless)`));
    // the door (left of the panel, as you face it: SSW, -Z) with its dark window, the control panel on the right (+Z)
    const dz0 = M.z0 + 0.01, dz1 = M.z1 - M.panelW, dw = dz1 - dz0;
    g.add(tag(box(0.012, h - 0.05, dw, STEEL, [fx - 0.006, M.y0 + 0.02 + (h - 0.05) / 2, (dz0 + dz1) / 2]), `${L} (door)`));
    g.add(tag(box(0.004, h - 0.15, dw - 0.14, BLK, [fx - 0.014, M.y0 + 0.07 + (h - 0.15) / 2, (dz0 + dz1) / 2 - 0.03]), `${L} (door window)`));
    g.add(tag(box(0.02, h - 0.12, 0.02, STEEL, [fx - 0.022, M.y0 + 0.02 + (h - 0.05) / 2, dz1 - 0.04]), `${L} (door handle)`));
    g.add(tag(box(0.006, h - 0.05, M.panelW - 0.02, BLK, [fx - 0.003, M.y0 + 0.02 + (h - 0.05) / 2, M.z1 - M.panelW / 2 - 0.005]), `${L} (control panel)`));
    g.add(tag(box(0.008, 0.025, w - 0.03, BLK, [fx - 0.004, M.y1 - 0.0125, zc]), `${L} (top vent grille)`));
    // underside: the fan / grease-filter grille and two cooktop lights
    g.add(tag(box(0.2, 0.004, w - 0.16, { grey: 0.35, col: 0x55575a }, [M.x1 - 0.17, M.y0 - 0.002, zc]), `${L} (underside fan grille)`));
    for (const dz of [-0.28, 0.28]) g.add(tag(cyl(0.025, 0.025, 0.006, { grey: 0.85, col: 0xe8e4d8 }, [fx + 0.06, M.y0 - 0.003, zc + dz], null, 16), `${L} (cooktop light)`));
    // the walnut cabinet above it, flush with the uppers either side (their side panels are its sides)
    const C = M.cabinet;
    g.add(tag(box(C.x1 - C.x0, C.y1 - C.y0, w, WALNUT, [(C.x0 + C.x1) / 2, (C.y0 + C.y1) / 2, zc]), 'upper cabinets (dark walnut)'));
    doorRow(g, { axis: 'Z', s0: M.z0, s1: M.z1, at: C.x0, out: -1, y0: C.y0 + 0.01, y1: C.y1 - 0.01, lab: 'upper cabinet doors (dark walnut)', w: 0.38, pullLow: true }); }
  // dressing
  const yT = DINING.h;
  if (dressing === 'party') {
    punchbowl(g, PUNCHBOWL.at, COUNTER_H);
    // r4 props phase 2: each stack = n real red cups (props/red_cup, "Solo Cup", CC BY 4.0) nested 12 mm apart
    for (const [cx, cz] of PUNCHBOWL.cupsAt) { const n = PUNCHBOWL.cupsN / 2;
      for (let k = 0; k < n; k++) { const c = prop('red_cup', { at: [cx, COUNTER_H + k * 0.012, cz], rot: [0, k * 17, 0], label: 'a stack of cups' }); if (c) g.add(c); } }
    for (const f of PARTY_FOOD.table) food(g, f, yT, R);
    for (const f of PARTY_FOOD.counters) food(g, f, COUNTER_H, R);
  } else if (dressing === 'prep') {
    // the prep on the counter by the sink (Jade r3, 2026-11-26; layout.js PREP): the core-wall run's ESE end and the corner
    const P = PREP, y = COUNTER_H;
    // r4 props phase 2 (2026-11-26 late): the real downloaded models (work/props_audit.md, credits in docs/credits_tools.md):
    // cutting board, knife, juicer, the two bowls, the pitcher, the picked lemons. The cut halves and the rinds stay code
    // (cut faces / emptied shells: no model has them). Loose things in the bowls are SETTLED with Rapier (settle.mjs).
    // cutting board (Poly Haven, real size kept: 45 x 25 cm), knife, two halves cut face up ON the board
    const board = prop('cutting_board', { at: [P.board.at[0], y, P.board.at[1]], rot: [0, 90, 0] }), boardTop = y + 0.0413;
    if (board) g.add(board); else g.add(tag(box(P.board.w, 0.022, P.board.d, { grey: 0.7, col: 0xc8a070 }, [P.board.at[0], y + 0.011, P.board.at[1]]), 'cutting board'));
    P.halves.forEach(([x, z], i) => lemonHalf(g, [x, board ? boardTop : y + 0.022, z], TREE.lemonR, i * 0.4, 'lemon half (cut face up)'));
    { const kn = prop('knife', { at: [P.knife.at[0] + 0.02, y, P.knife.at[1] - 0.04], rot: [0, -80, 0] }); if (kn) g.add(kn); }   // flat on the counter, handle toward the core wall (+X)
    // the glass reamer (juicer, the real model, scaled to 18 cm across): a dish with a ribbed cone, the juice in the dish, a
    // half pressed on it (cut face down). Its rim and tip heights (PREP_JUICER) drive her two hands (shots.js prepFigs).
    { const [x, z] = P.reamer.at, J = PREP_JUICER, JG = new THREE.Group(); JG.userData.holdWhole = true;   // juicer + pressed half: one held object
      const jp = prop('juicer', { at: [x, y, z], size: { w: J.w }, look: GLASSY }); if (jp) JG.add(jp);
      const d = mk(new THREE.SphereGeometry(TREE.lemonR, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), LEMON); d.scale.set(1, 1.22, 1); d.position.set(x, y + J.halfY, z); JG.add(tag(d, 'lemon half (pressed on the juicer)'));
      g.add(JG); }
    // the bowl of picked lemons (from V3b), two still with a leaf: bowl and lemons are real models, the lemons settled in it
    { const [x, z] = P.lemonsBowl.at; settledBowl(g, [x, y, z], SETTLED.lemonsBowl, 'bowl of picked lemons', { label: 'lemons (picked, pomelo-sized)', leaves: 2 }); }
    // the rinds: the real bowl (22 cm), the code shells settled in it
    { const [x, z] = P.rindsBowl.at; settledBowl(g, [x, y, z], SETTLED.rindsBowl, 'bowl of squeezed rinds'); }
    // sugar on the counter, the water pitcher beside the sink, the punchbowl being mixed (the ladle: ladleGrip.js)
    g.add(tag(box(0.12, 0.2, 0.08, { grey: 0.92, col: 0xece8dc }, [P.sugar.at[0], y + 0.1, P.sugar.at[1]]), 'bag of sugar'));
    { const py = P.pitcher.inSink ? y - 0.17 : y, pt = prop('pitcher', { at: [P.pitcher.at[0], py, P.pitcher.at[1]], rot: [0, 0, 0], look: GLASSY, label: 'pitcher of water (by the sink)' });
      if (pt) g.add(pt); else g.add(tag(cyl(P.pitcher.r, P.pitcher.r * 0.9, 0.24, GLASSY, [P.pitcher.at[0], py + 0.12, P.pitcher.at[1]], null, 24), 'pitcher of water (by the sink)')); }
    punchbowl(g, P.punch.at, y, { fill: P.punchFill, tool: 'none', lab: 'giant punchbowl (mixing the lemonade)' });
  }
}
// the room crossing's legs as arrows on the floor (diagnostic shots only: shot.legs), and a ring at each stop
const LEG_COL = { L1: 0xd9a520, L2: 0x2aa7c9, L3: 0xc93a8a };
function legArrows() {
  const g = new THREE.Group(), y = 0.035;
  for (const L of ROOM_CROSSING.legs) { const col = LEG_COL[L.id], look = { grey: 0.98, col, emit: col, emitI: 1.0, flatEmit: 0.99, noCast: true }, o = L.drawOffset || 0;
    // drawn offset to the right of travel (L2 and L3 share a line in opposite directions, and L1's last stretch): drawing only
    const pts = L.pts.map(([x, z], i) => { const a = L.pts[Math.max(0, i - 1)], b = L.pts[Math.min(L.pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1;
      return V(x - o * dz / n, y, z + o * dx / n); });   // right of travel = (-dZ, dX)
    const end = pts[pts.length - 1], prev = pts[pts.length - 2], dir = end.clone().sub(prev).normalize(), head = 0.32;
    const body = [...pts.slice(0, -1), end.clone().addScaledVector(dir, -head * 0.9)];
    const lab = `${L.id}: ${L.what} (${L.length_m} m, ${L.dt_s} s real, ${L.slot_s[0]}-${L.slot_s[1]} s in the song)`;
    for (let i = 0; i + 1 < body.length; i++) { const a = body[i], b = body[i + 1]; g.add(tag(slab(a, b, 0.07, 0.008, V(-(b.z - a.z), 0, b.x - a.x), look), lab)); }
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-head, head * 0.42); sh.lineTo(-head, -head * 0.42); sh.lineTo(0, 0);
    const m = mk(new THREE.ExtrudeGeometry(sh, { depth: 0.01, bevelEnabled: false }), look); m.rotation.x = -Math.PI / 2;
    const hg = new THREE.Group(); hg.add(m); hg.position.copy(end); hg.rotation.y = Math.atan2(-dir.z, dir.x); g.add(hg); m.userData.label = lab; tag(m, lab); }
  for (const S of ROOM_CROSSING.stops) { const t = mk(new THREE.TorusGeometry(0.24, 0.025, 6, 40), { grey: 0.98, col: 0xf4f0e0, emit: 0xf4f0e0, emitI: 0.6, flatEmit: 0.99, noCast: true });
    t.rotation.x = Math.PI / 2; t.position.set(S.at[0], y + 0.01, S.at[1]); g.add(tag(t, `${S.id}: ${S.what} (${S.slot_s[0]}-${S.slot_s[1]} s)`)); }
  return g;
}

// ---------------------------------------------------------------- furniture
function furniture(lt, dressing) {
  const g = new THREE.Group();
  { const C = COUCH, W = { grey: 0.94, col: C.col }, add = (m) => g.add(tag(m, 'modern white couch (sectional)')), addc = (m) => g.add(tag(m, 'chaise (of the couch)')), cx = (C.x0 + C.x1) / 2;
    add(box(C.x1 - C.x0, C.seatH - 0.08, C.z1 - C.z0 - C.backD, W, [cx, 0.08 + (C.seatH - 0.08) / 2, C.z0 + C.backD + (C.z1 - C.z0 - C.backD) / 2]));
    add(box(C.x1 - C.x0, C.backH - 0.08, C.backD, W, [cx, 0.08 + (C.backH - 0.08) / 2, C.z0 + C.backD / 2]));
    add(box(C.armW, 0.58 - 0.08, C.z1 - C.z0, W, [C.x1 - C.armW / 2, 0.08 + 0.25, (C.z0 + C.z1) / 2]));
    addc(box(C.chaise.x1 - C.chaise.x0, C.seatH - 0.08, C.chaise.z1 - C.z1, W, [(C.chaise.x0 + C.chaise.x1) / 2, 0.08 + (C.seatH - 0.08) / 2, (C.z1 + C.chaise.z1) / 2]));
    for (const [x, z] of [[C.x0 + 0.05, C.z0 + 0.05], [C.x1 - 0.05, C.z0 + 0.05], [C.x1 - 0.05, C.z1 - 0.05], [C.x0 + 0.05, C.chaise.z1 - 0.05], [C.chaise.x1 - 0.05, C.chaise.z1 - 0.05]]) add(box(0.04, 0.08, 0.04, DARK, [x, 0.04, z])); }
  // Noguchi IN-50 (layout.js NOGUCHI: Herman Miller dimensions, Vitra-drawing shapes): the glass outline, and two
  // IDENTICAL curved legs (the lower one the upper turned 180 deg in its own plane) meeting at a pivot under the apex side.
  { const N = NOGUCHI, [cx, cz] = N.at, cm = 0.01;
    const outline = [...N.glassHalf, ...N.glassHalf.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
    const sx = N.W / 2 / (Math.max(...N.glassHalf.map((p) => p[0])) * cm), sy = N.D / 2 / (Math.max(...N.glassHalf.map((p) => Math.abs(p[1]))) * cm);
    const sh = new THREE.Shape(); outline.forEach(([x, y], i) => { const X = x * cm * sx, Y = -y * cm * sy; i ? sh.lineTo(X, Y) : sh.moveTo(X, Y); });   // shape y = -(toward the apex)
    const top = mk(new THREE.ExtrudeGeometry(sh, { depth: N.glass, bevelEnabled: false, curveSegments: 4 }), { glass: true, col: 0x9ac0b8, opacity: 0.35, grey: 0.8 });
    top.rotation.x = -Math.PI / 2; top.position.set(cx, N.h - N.glass, cz); g.add(tag(top, 'Noguchi coffee table (glass top, 19 mm)'));
    const ky = N.legH / Math.max(...N.legProfile.map((p) => p[1])), LEG = { grey: 0.1, col: 0x141210 }, bev = 0.006;
    const legShape = (lower) => { const q = new THREE.Shape(); N.legProfile.forEach(([x, y], i) => { const sAl = (N.pivotX - x) * cm, yy = (lower ? N.legH - y * ky : y * ky);   // ky: cm -> m, scaled to legH
      i ? q.lineTo(sAl, yy) : q.moveTo(sAl, yy); }); return q; };
    const piv = [cx + N.pivot[0] * cm, cz + N.pivot[1] * cm];
    for (const which of ['upper', 'lower']) { const e = N.ends[which], dx = cx + e[0] * cm - piv[0], dz = cz + e[1] * cm - piv[1], L = Math.hypot(dx, dz);
      const geo = new THREE.ExtrudeGeometry(legShape(which === 'lower'), { depth: N.legT - 2 * bev, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 2, curveSegments: 4 });
      geo.translate(0, 0, -(N.legT - 2 * bev) / 2);
      const m = mk(geo, LEG); m.position.set(piv[0], 0, piv[1]); m.rotation.y = Math.atan2(-dz / L, dx / L);
      g.add(tag(m, `Noguchi coffee table (${which} leg, solid wood, black)`)); }
    g.add(tag(cyl(0.008, 0.008, 0.06, DARK, [piv[0], N.legH * 0.5, piv[1]], null, 8), 'Noguchi coffee table (pivot dowel)')); }
  // the semicircular glass-top console against the NNE (core) wall, from Jade's photos (layout.js GLASS_TABLE; glassTable.js)
  g.add(glassTable(GLASS_TABLE));
  kitchen(g, dressing);
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
    deck(P.x0, P.x1, P.z0, P.z1, 'patio (deck)');
    // the stairs (Jade r3): one flight ALONG the house's ESE wall, descending NNE from the deck's NNE edge (layout.js STAIRS)
    const rise = (P.top - GRADE) / STAIRS.risers, run = STAIRS.run, SZ0 = STAIRS.z0 + 0.01, SZ1 = STAIRS.z1, szc = (SZ0 + SZ1) / 2;
    for (let k = 1; k < STAIRS.risers; k++) { const top = P.top - k * rise, x0 = STAIRS.x0 + (k - 1) * run;
      g.add(tag(box(run, top - GRADE, SZ1 - SZ0, DK, [x0 + run / 2, (top + GRADE) / 2, szc]), 'stairs (along the house wall)'));
      g.add(tag(box(0.03, 0.03, SZ1 - SZ0, { grey: 0.4, col: 0x6a5238 }, [x0 + 0.015, top - 0.015, szc]), 'stairs (tread nosing)')); }
    // the open side's stringer (the wall side is the house)
    { const a = V(STAIRS.x0, P.top - 0.12, SZ1 - 0.02), b = V(STAIRS.x1 + 0.1, GRADE, SZ1 - 0.02); g.add(tag(slab(a, b, 0.24, 0.04, V(0, 1, 0), DK), 'stairs (stringer)')); }
    // the wood railing (Jade, 2026-11-25 late): round the deck and the landing, and both sides of the stairs, sloping with them.
    // A run from a to b (world [x, yBase, z]), posts at the ends and <= 1.8 m, top and bottom rails, balusters.
    const RW = { grey: 0.5, col: 0x8a6a48 };
    const railRun = (a, b, lab) => { const A = V(...a), B = V(...b), d = B.clone().sub(A), L = Math.hypot(d.x, d.z), side = V(-d.z, 0, d.x).normalize(), nP = Math.max(1, Math.ceil(L / 1.8));
      for (let k = 0; k <= nP; k++) { const p = A.clone().addScaledVector(d, k / nP); g.add(tag(box(RAIL.post, RAIL.h + 0.05, RAIL.post, RW, [p.x, p.y + (RAIL.h + 0.05) / 2, p.z]), lab + ' (post)')); }
      for (const [yy, hh] of [[RAIL.h - RAIL.rail[1] / 2, RAIL.rail[1]], [0.1, 0.04]]) g.add(tag(slab(A.clone().add(V(0, yy, 0)), B.clone().add(V(0, yy, 0)), RAIL.rail[0], hh, side, RW), lab));
      const nB = Math.floor(L / RAIL.gap); for (let k = 1; k < nB; k++) { const p = A.clone().addScaledVector(d, k / nB); g.add(tag(box(RAIL.baluster, RAIL.h - 0.14, RAIL.baluster, RW, [p.x, p.y + 0.12 + (RAIL.h - 0.14) / 2, p.z]), lab + ' (balusters)')); } };
    const yT = P.top;
    railRun([P.x0, yT, P.z0 + 0.05], [P.x0, yT, P.z1], 'deck railing');
    railRun([P.x0, yT, P.z1], [P.x1, yT, P.z1], 'deck railing');
    railRun([P.x1, yT, P.z1], [P.x1, yT, STAIRS.z1], 'deck railing');
    railRun([STAIRS.x0, yT, STAIRS.z1], [STAIRS.x1 + 0.05, GRADE, STAIRS.z1], 'stair railing (wood)'); }
  // strawberry planter, mint barrel, hose, clothesline, fences
  // 2026-11-27 (Jade, decision A): the strawberry planter and the mint each have ONE canonical place (layout.js), real
  // the mint in the library half barrel (props/half_barrel, Poly Haven CC0; props/planter_box dropped 2026-11-27 evening) with the plants built here, so every guide
  // mode shows them in the same place and the painters stop moving them.
  // the strawberry BED (2026-11-27 evening, Jade: the before place was right): raised timber sides + soil, the plants as
  // the library-era crowns (leaves, red berries over the edges, white flowers) on a staggered grid
  { const S = STRAWBERRY, B = { grey: 0.45, col: 0x7a5a3a }, cx = (S.x0 + S.x1) / 2, cz = (S.z0 + S.z1) / 2, y = GRADE + S.h / 2, top = GRADE + S.h, RS = rng(41);
    for (const z of [S.z0, S.z1]) g.add(tag(box(S.x1 - S.x0, S.h, 0.05, B, [cx, y, z]), 'strawberry bed (timber)'));
    for (const x of [S.x0, S.x1]) g.add(tag(box(0.05, S.h, S.z1 - S.z0, B, [x, y, cz]), 'strawberry bed (timber)'));
    g.add(tag(box(S.x1 - S.x0 - 0.06, 0.02, S.z1 - S.z0 - 0.06, { grey: 0.28, col: 0x3e2e22 }, [cx, top - 0.04, cz]), 'strawberry bed (soil)'));
    const LEAF = { grey: 0.45, col: 0x3d7a2e }, BERRY = { grey: 0.5, col: 0xc8202a }, FLOWER = { grey: 0.95, col: 0xf4f2ea }, STEM = { grey: 0.4, col: 0x4a6a2a, noCast: true };
    const nx = 6, nz = 5;
    for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) { const k = ix * nz + iz;
      const px = S.x0 + 0.2 + (ix + (iz % 2 ? 0.5 : 0)) * (S.x1 - S.x0 - 0.4) / (nx - 0.5) + (RS() - 0.5) * 0.06, pz = S.z0 + 0.2 + iz * (S.z1 - S.z0 - 0.4) / (nz - 1) + (RS() - 0.5) * 0.06, py = top - 0.04;
      for (let j = 0; j < 9; j++) { const az = j * 2.4 + RS() * 0.6, el = 0.5 + RS() * 0.5, L = 0.12 + RS() * 0.06, dx = Math.cos(az) * Math.cos(el) * L, dz = Math.sin(az) * Math.cos(el) * L, dy = Math.sin(el) * L;
        const tip = V(px + dx, py + dy, pz + dz); g.add(tag(limb(V(px, py, pz), tip, 0.003, STEM), 'strawberry plants'));
        for (const o of [-0.7, 0, 0.7]) { const lf = mk(new THREE.SphereGeometry(0.03, 10, 6), LEAF); lf.scale.set(1, 0.18, 0.62); lf.position.set(tip.x + Math.cos(az + o) * 0.025, tip.y + 0.005, tip.z + Math.sin(az + o) * 0.025); lf.rotation.y = -(az + o); g.add(tag(lf, 'strawberry plants')); } }
      // berries on short runners lying out on the soil (and over the timber at the edges), a few white flowers
      for (let j = 0; j < 3; j++) { const a2 = RS() * Math.PI * 2, rr = 0.1 + RS() * 0.08; let bx = px + Math.cos(a2) * rr, bz = pz + Math.sin(a2) * rr;
        bx = Math.min(Math.max(bx, S.x0 - 0.02), S.x1 + 0.02); bz = Math.min(Math.max(bz, S.z0 - 0.02), S.z1 + 0.02);
        const edge = bx <= S.x0 + 0.03 || bx >= S.x1 - 0.03 || bz <= S.z0 + 0.03 || bz >= S.z1 - 0.03, by = edge ? top - 0.05 - RS() * 0.08 : top - 0.015;
        g.add(tag(limb(V(px, py + 0.02, pz), V(bx, by + 0.02, bz), 0.002, STEM), 'strawberry plants'));
        const br = mk(new THREE.ConeGeometry(0.016, 0.035, 10), BERRY); br.rotation.x = edge ? Math.PI : Math.PI / 2; br.position.set(bx, by, bz); g.add(tag(br, 'strawberries (red)')); }
      if (k % 3 === 1) { const f = ball(0.014, FLOWER, [px + 0.03, py + 0.13, pz - 0.02], [1, 0.4, 1]); g.add(tag(f, 'strawberry flowers (white)')); } } }
  { const M = MINT, [x, z] = M.at, RM = rng(53);
    const hb = prop('half_barrel', { at: [x, GRADE, z], rot: [0, 25, 0], label: 'half barrel (of mint)' });
    if (hb) g.add(hb); else g.add(tag(cyl(M.r, M.r * 0.9, M.h, { grey: 0.45, col: 0x7a5236 }, [x, GRADE + M.h / 2, z], null, 28), 'half barrel (of mint)'));
    g.add(tag(cyl(M.r - 0.03, M.r - 0.03, 0.02, { grey: 0.28, col: 0x3e2e22 }, [x, GRADE + M.h - 0.05, z], null, 28), 'half barrel (soil)'));
    // mint: ~40 upright square stems, 0.2-0.45 m, each with 4-5 pairs of opposite oval leaves (the mint habit), a dense mound
    const MLEAF = { grey: 0.55, col: 0x4e9a3a }, MSTEM = { grey: 0.45, col: 0x5a7a3a, noCast: true };
    for (let k = 0; k < 70; k++) { const rr = Math.sqrt(RM()) * (M.r - 0.06), a = RM() * Math.PI * 2, bx = x + Math.cos(a) * rr, bz = z + Math.sin(a) * rr, y0 = GRADE + M.h - 0.05, H = 0.16 + RM() * 0.2;
      const lean = V(Math.cos(a) * rr * 0.5, H, Math.sin(a) * rr * 0.5), tip = V(bx, y0, bz).add(lean);
      g.add(tag(limb(V(bx, y0, bz), tip, 0.003, MSTEM), 'mint'));
      for (let j = 1; j <= 5; j++) { const t = j / 5.3, c = V(bx, y0, bz).addScaledVector(lean, t), rot = j * Math.PI / 2 + a, sz2 = 0.032 * (1.15 - t * 0.4);
        for (const sg of [1, -1]) { const lf = mk(new THREE.SphereGeometry(sz2, 8, 5), MLEAF); lf.scale.set(1, 0.2, 0.6); lf.position.set(c.x + Math.cos(rot) * sg * sz2 * 0.9, c.y, c.z + Math.sin(rot) * sg * sz2 * 0.9); lf.rotation.set(0, -rot, sg * 0.35); g.add(tag(lf, 'mint')); } } } }
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
  // the giant lemon tree (2026-11-27, Jade decision A: "way, way bigger ... she can't hug the trunk all the way around,
  // and canopies the entire corner of the yard"). Trunk 0.80 m across at chest height with a root flare, forking at 1.9 m
  // into four scaffold limbs that carry the canopy; the canopy is a dome of foliage clumps (lumpy icospheres, so it reads
  // as leaves, not balls) over the whole NNE / back-fence corner; lemons hang on stalks from leafy twigs on its underside.
  { const T = TREE, [tx, tz] = T.at, [cx, cz] = T.canopyC, BARK = { grey: 0.35, col: 0x5a4a3a }, LEAF = { grey: 0.4, col: 0x3a5a2a }, LEAF2 = { grey: 0.46, col: 0x46682f };
    const RT = rng(19), taper = (A, B, r0, r1, lab) => { const d = B.clone().sub(A), m = mk(new THREE.CylinderGeometry(r1, r0, d.length(), 16), BARK);
      m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.add(tag(m, lab)); };
    const clump = (r, look, at, sq = 0.8) => { const geo = new THREE.SphereGeometry(r, 18, 12), p = geo.attributes.position;   // indexed: smooth normals after the lumps
      for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)), n = 1 + (Math.sin(v.x * 9.1 + at[0]) * Math.sin(v.y * 7.3 + at[2]) * Math.sin(v.z * 8.7)) * 0.18 + 0; p.setXYZ(i, v.x * n, v.y * n * sq, v.z * n); }
      geo.computeVertexNormals(); const m = mk(geo, look); m.position.set(...at); return m; };
    const fork = GRADE + T.trunkH;
    taper(V(tx, GRADE - 0.05, tz), V(tx, GRADE + 0.45, tz), T.flareR, T.trunkR + 0.02, 'lemon tree (trunk, root flare)');
    taper(V(tx, GRADE + 0.45, tz), V(tx, fork + 0.15, tz), T.trunkR + 0.02, T.trunkR - 0.05, 'lemon tree (trunk)');
    // four scaffold limbs from the fork out and up into the dome, each with two secondary branches to the canopy shell
    const limbs = [[205, 0.25], [140, 0.22], [290, 0.2], [40, 0.17]];   // compass bearing from +Z toward +X (deg), base radius
    for (const [bd, r0] of limbs) { const b = bd * Math.PI / 180, dir = V(Math.sin(b), 0, Math.cos(b));
      const A = V(tx, fork, tz).addScaledVector(dir, T.trunkR * 0.45), B = V(tx, GRADE + 3.9, tz).addScaledVector(dir, 2.1 + RT() * 0.5);
      taper(A, B, r0, r0 * 0.6, 'lemon tree (limb)');
      for (const s2 of [-0.5, 0.45]) { const d2 = V(Math.sin(b + s2), 0, Math.cos(b + s2)), C = B.clone().addScaledVector(d2, 1.4 + RT() * 0.6).add(V(0, 0.9 + RT() * 0.5, 0));
        taper(B, C, r0 * 0.55, r0 * 0.3, 'lemon tree (branch)'); } }
    // the canopy: the upper dome (centre canopyC, radius canopyR, from canopyBase to canopyTop), a ring of skirt clumps at
    // its rim (bottoms >= canopyBase, so the yard under it stays walkable) and an underside layer with gaps
    const Hc = T.canopyTop - T.canopyBase, R0 = T.canopyR;
    for (let i = 0; i < 110; i++) { const u = (i + 0.5) / 110, phi = i * 2.39996, el = Math.asin(u * 0.95), rr = Math.cos(el) * (R0 - 0.75), yy = T.canopyBase + 0.9 + Math.sin(el) * (Hc - 1.6);
      g.add(tag(clump(0.85 + RT() * 0.45, i % 3 ? LEAF : LEAF2, [cx + Math.cos(phi) * rr, yy, cz + Math.sin(phi) * rr]), 'lemon tree canopy')); }
    for (let i = 0; i < 34; i++) { const phi = i * 2 * Math.PI / 34 + RT() * 0.1, rr = R0 - 0.6 - RT() * 0.3, r = 0.6 + RT() * 0.25;
      g.add(tag(clump(r, i % 2 ? LEAF : LEAF2, [cx + Math.cos(phi) * rr, T.canopyBase + r * 0.8 + RT() * 0.25, cz + Math.sin(phi) * rr]), 'lemon tree canopy')); }
    for (let i = 0; i < 36; i++) { const phi = i * 2.39996, rr = Math.sqrt((i + 0.5) / 36) * (R0 - 1.2), r = 0.55 + RT() * 0.25;
      const at = [cx + Math.cos(phi) * rr, T.canopyBase + 0.35 + r * 0.6 + RT() * 0.3, cz + Math.sin(phi) * rr];
      if (Math.hypot(at[0] - tx, at[2] - tz) < 0.9) continue;   // the trunk comes up through here
      g.add(tag(clump(r, LEAF, at, 0.6), 'lemon tree canopy')); }
    // lemons (pomelo-sized), each on a stalk from a small leafy twig at the canopy's underside; one more is THE lemon she
    // reaches for in V3a (T.pick)
    const RL = rng(7), LEM = { grey: 0.95, col: 0xf2d21c }, STALK = { grey: 0.3, col: 0x3a4a2a, noCast: true };
    // a short stalk (8 cm) up to a leafy twig (a 0.24 m clump) that hangs down from the canopy's underside, so every
    // lemon is held by foliage, not by a long string
    const hang = (x, y, z, lab = 'lemons (pomelo-sized)') => { const ty = y + T.lemonR * 1.22 + 0.08;
      g.add(tag(ball(T.lemonR, LEM, [x, y, z], [1, 1.22, 1]), lab));
      g.add(tag(cyl(0.006, 0.006, 0.1, STALK, [x, ty - 0.05, z], null, 5), 'lemon tree (fruit stalk)'));
      g.add(tag(clump(0.24, LEAF2, [x + 0.04, ty + 0.12, z - 0.03], 0.7), 'lemon tree (leafy twig)'));
      if (ty + 0.3 < T.canopyBase + 0.4) g.add(tag(limb(V(x + 0.04, ty + 0.2, z - 0.03), V(x + 0.1, T.canopyBase + 0.5, z - 0.08), 0.012, BARK), 'lemon tree (twig)')); };
    for (let k = 0; k < T.lemons; k++) { const a = Math.PI * 2 * (k / T.lemons) * 3 + RL() * 0.5, rho = 1.1 + Math.sqrt(RL()) * (R0 - 1.6);
      const x = cx + Math.cos(a) * rho, z = cz + Math.sin(a) * rho;
      if (Math.hypot(x - tx, z - tz) < 0.8) continue;
      hang(x, Math.max(T.canopyBase - 0.05 - RL() * 0.35, GRADE + 1.95), z); }
    if (T.pick) hang(T.pick[0], T.pick[1], T.pick[2], 'THE lemon she reaches for (pomelo-sized)'); }
  // the neighbour's grapefruit tree over the NNE fence
  { const G = GRAPEFRUIT, BARK = { grey: 0.35, col: 0x5a4a3a }, LEAF = { grey: 0.38, col: 0x35552a };
    g.add(tag(cyl(0.1, 0.12, 2.0, BARK, [G.trunk[0], GRADE + 1.0, G.trunk[1]], null, 10), 'grapefruit tree (the neighbour’s)'));
    g.add(tag(ball(G.canopyR, LEAF, [G.at[0], G.canopyY, G.at[1]], [1, G.canopyK, 1]), 'grapefruit tree (branches over the fence)'));
    g.add(tag(ball(G.canopyR * 0.7, LEAF, [G.trunk[0] + 0.3, G.canopyY + 0.5, G.trunk[1] + 0.4], [1, 0.8, 1]), 'grapefruit tree (branches over the fence)'));
    const RG = rng(3); for (let k = 0; k < G.fruits; k++) { const a = Math.PI * 2 * k / G.fruits + RG() * 0.3, rho = 0.5 + RG() * 0.9, x = G.at[0] + Math.cos(a) * rho, z = G.at[1] + Math.sin(a) * rho;
      g.add(tag(ball(G.fruitR, { grey: 0.85, col: 0xf0b040 }, [x, G.canopyY - G.canopyR * G.canopyK * 0.7 - RG() * 0.2, z]), 'grapefruits')); } }
  // (the lemonade table on the deck: REMOVED 2026-11-25 round 2; the lemonade is in the punchbowl in the kitchen)
  // fire poi: the two circles (trails) and the two flames at their current place
  if (lt.poi) { const FIRE = { grey: 0.97, col: 0xffb040, emit: 0xff7a20, emitI: 1.6, flatEmit: 0.97 };
    [1, -1].forEach((s, i) => { const c = poiCentre(s);
      // shot.poiTrail === false: the flames only, no swept circles (SI1: the circles painted as a gold ring round her head)
      if (shot.poiTrail !== false) { const t = mk(new THREE.TorusGeometry(POI.r, 0.012, 6, 48), { ...FIRE, emitI: 0.8 });
        t.position.set(...c); t.rotation.y = rad(POI.yaw + 90); g.add(tag(t, 'fire poi (circle swept by the flame)')); }
      const { hp, d, Lt } = poiHead(shot, i);
      g.add(tag(ball(POI.headR * 2.2, FIRE, hp, [1, 1.5, 1]), 'fire poi flame'));
      // the tether: from the knob in his fist (centred on the circle's centre; the knob is the hand's held prop, shots.js
      // poiFist) to the flame's surface (hold pass 2026-11-26: it ran from the empty fist on INTO the flame)
      const t0 = 0.055, teth = cyl(0.004, 0.004, Lt - t0, { grey: 0.2, col: 0x222222, noCast: true }, V(c).addScaledVector(d, (Lt + t0) / 2).toArray(), null, 5);   // t0: clear of the knob (5 cm half length)
      teth.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); g.add(tag(teth, 'poi tether')); }); }
  return g;
}

// a poi's flame (i = 0: the spinner's left, poiCentre(1); 1: right): its centre hp, the tether's direction d from the hand
// (the circle's centre) and the tether length Lt up to the flame's surface (an ellipsoid 2.2 headR, 1.5x tall)
function poiHead(shot, i) { const c = poiCentre(i ? -1 : 1), a = rad(shot.poiPhase ?? 40) + i * Math.PI * 0.8, f = rad(POI.yaw), fx = Math.sin(f), fz = Math.cos(f);
  const hp = [c[0] + Math.cos(a) * POI.r * fx, c[1] + Math.sin(a) * POI.r, c[2] + Math.cos(a) * POI.r * fz], d = V(hp).sub(V(c)).normalize();
  const rf = POI.headR * 2.2, tS = 1 / Math.hypot(d.x / rf, d.y / (rf * 1.5), d.z / rf);
  return { c, hp, d, Lt: POI.r - tS - 0.003 }; }

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
  const dressing = shot.dressing || (section === 'prep' ? 'prep' : 'party');   // party food out from the bridge on; the prep before
  const { g: houseG, panes } = house(shot); root.add(houseG); root.add(shelf()); root.add(expedit2()); root.add(furniture(lt, dressing)); root.add(yard(shot, lt));
  if (shot.path) root.add(pathRibbon());
  if (shot.legs) root.add(legArrows());
  // V3b (before the party): the bowl the childhood friend holds, with the first picked lemons in it
  // r4 props phase 2: the real bowl (36 cm), two pomelo-sized lemons settled in it, one on the other (settled.js); bowl and lemons are ONE held
  // object (holdWhole); its bottom where the old half sphere's was (shot.bowl y - 0.06). The friend's palms: shots.js bowlHands
  if (shot.bowl) { const [bx, by, bz] = shot.bowl; settledBowl(root, [bx, by - 0.06, bz], SETTLED.friendBowl, 'frosted plexiglass punch bowl of picked lemons', { holdWhole: true, look: FROSTED_PLEXI }); }
  const extra = (t) => { if (t === 'poiL') return V(poiCentre(1)); if (t === 'poiR') return V(poiCentre(-1)); if (t.startsWith('mark:')) { const m = MARKS[t.slice(5)]; return V(m[0], 1.5, m[1]); } return null; };
  // V3b_prep (Jade r3): the friend's right hand holds the ladle in a real grip; the arm, the hand pose and the ladle are
  // solved together (ladleGrip.js) from where the ladle's bowl sits in the lemonade
  let grip = null;
  if (shot.ladle && shot.figs?.[shot.ladle.who]) { const L = PREP.ladle, who = shot.ladle.who, c = CAST[who], Lh = (PROP[c.kind] || PROP.adult).hand * c.h;
    const yl = PREP.y + PUNCHBOWL.foot + PUNCHBOWL.h * PREP.punchFill;
    grip = ladleGrip({ bowlC: [L.bowlAt[0], yl + (L.lift ?? 0), L.bowlAt[1]], L, Lh, medial: shot.ladle.medial, elbow: shot.ladle.elbow, kind: c.kind });   // r4: the real ladle's bowl centre (its rim just under the surface)
    shot.figs[who] = { ...shot.figs[who], R: grip.arm }; }
  const { figs } = stage(shot.figs, null, extra);
  if (grip) { const LB = buildLadle(root, grip); shot.ladleGrip = { note: 'the friend\u2019s right hand round the real ladle (ladleGrip.js; props/ladle, a flat 11 x 3.3 mm steel strip handle): a fist, thumb on the top face (Jade r4)', ladle_bowl_world: LB.bowlC.toArray().map((v) => +v.toFixed(3)), hook_world: LB.hook.toArray().map((v) => +v.toFixed(3)), hand_len_m: +grip.Lh.toFixed(4), curl: grip.curl, thumb: grip.thumb,
    fist_centre_world: grip.G.toArray().map((v) => +v.toFixed(3)), handle_up_dir: grip.up.toArray().map((v) => +v.toFixed(3)), thumb_tip_world: figs[shot.ladle.who].userData.P.thumbR.toArray().map((v) => +v.toFixed(3)), thumb_goal_world: grip.thumbGoalWorld.toArray().map((v) => +v.toFixed(3)), search: grip.search }; }
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
  if (figs.jade27 && figs.jade27.userData.spec.costume?.outfit === 'housewarming' && !(shot.hide || []).includes('jade27')) root.add(housewarming(figs.jade27));
  if (figs.jade27 && figs.jade27.userData.spec.costume?.shoes === 'sneakers' && !(shot.hide || []).includes('jade27')) root.add(sneakers(figs.jade27));
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
    // 2026-11-26 post-sweep (as office91 r5): per-shot exposure for the LIT pass only (`light: { exposure }` scales every lit
    // light, so the brightest source stays the brightest); other passes are unchanged
    const EX = white ? 1 : (lt.exposure ?? 1);
    if (lt.sun) { const d = new THREE.DirectionalLight(white ? 0xffffff : sun.color, white ? (lt.sunI ?? 1.5) : EX * (lt.sunLit ?? (sun.elev > 8 ? 3.2 : 2.4)));
      d.position.copy(sc).addScaledVector(sunDir, -40); d.target.position.copy(sc); d.castShadow = true; const s = d.shadow.camera;
      s.left = -half; s.right = half; s.top = half; s.bottom = -half; s.near = 1; s.far = 95; d.shadow.radius = 1.5; d.shadow.bias = -0.0006; Ls.push(d); }
    if (lt.ceiling) for (const c of CEILING_LIGHTS) { const p = new THREE.PointLight(white ? 0xffffff : LIGHTS.ceiling.color, white ? (lt.ceilI ?? 0.9) : EX * (lt.ceilLit ?? 2.4), 7, 1.3);
      p.position.set(c.at[0], c.pendant ? c.at[1] - 0.12 : HOUSE.ceil - 0.12, c.at[2]); p.castShadow = true; p.shadow.camera.near = 0.05; p.shadow.camera.far = 8; Ls.push(p); }
    if (lt.poi) { const p = new THREE.PointLight(white ? 0xffffff : LIGHTS.poi.color, white ? 2.2 : EX * (lt.poiLit ?? 14), 8, 1.3); p.position.copy(poiP); p.castShadow = true; p.shadow.camera.near = 0.1; p.shadow.camera.far = 9; Ls.push(p); }
    const skyCol = lt.sky >= 0.9 ? 0xb4c2d8 : lt.sky >= 0.5 ? 0x8a84a8 : LIGHTS.sky.night;
    Ls.push(new THREE.AmbientLight(white ? 0xffffff : skyCol, white ? (lt.amb ?? (0.45 + 0.4 * lt.sky)) : EX * (lt.litAmb ?? (lt.sky >= 0.9 ? 1.9 : lt.sky >= 0.5 ? 1.15 : 0.6))));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, lt.fill ?? 0.35); d.position.set(3, 6, -4); Ls.push(d); }
    return Ls;
  };
  const sunTests = () => { const out = {}; if (!sun.up) return { note: 'sun below the horizon' };
    const put = (k, p) => { const r = sunlit(p, sun); out[k] = r.lit ? 'sunlit' : `shaded by ${r.by}`; };
    if (figs.jade27) put('her_head', figs.jade27.userData.P.head.toArray()); if (figs.firstLove27) put('first_love_head', figs.firstLove27.userData.P.head.toArray());
    put('lemon_canopy_top', [TREE.canopyC[0], TREE.canopyTop - 0.3, TREE.canopyC[1]]); put('lemon_canopy_side_toward_house', [TREE.canopyC[0] - 3.2, TREE.canopyY, TREE.canopyC[1] - 3.6]); put('lemon_tree_trunk', [TREE.at[0], GRADE + 1.3, TREE.at[1]]); if (TREE.pick) put('lemon_she_reaches_for', TREE.pick);
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
          contents: cu.kind === 'books' ? (Array.isArray(cu.books) ? cu.books.map(bookName) : { left: cu.books.left.map(bookName), right: cu.books.right.map(bookName) }) : cu.objects.map((o) => o.k) })),
        spines_note: 'Only the lettered spines (Jade\u2019s six titles, plus the textbooks Theoretical Neuroscience, Spikes and Molecular Biology of the Cell; each a likeness of its real edition\u2019s spine, 2026-11-27) carry lettering; every other spine is BLANK and untitled (Jade r4, art_books: "Leave the rest blank"). Paint no words on them.',
        warnings: SHELF_WARN.length ? [...new Set(SHELF_WARN)] : undefined },
      expedit_2x2: { world: { X: [EXPEDIT2.X0, EXPEDIT2.X1], Z: [EXPEDIT2.Zc - EXPEDIT2.W / 2, EXPEDIT2.Zc + EXPEDIT2.W / 2], faces: 'SSW (-X)' }, printer_on_top: true, px: P(V(EXPEDIT2.X0 + 0.2, EXPEDIT2.H + 0.1, EXPEDIT2.Zc)) },
      lemon_tree_px: P(V(TREE.canopyC[0], TREE.canopyY, TREE.canopyC[1])), poi_px: P(poiP), opening_px: P(V((OPENING.x0 + OPENING.x1) / 2, 1.0, OPENING.z)) };
    if (shot.timing) out.timing = shot.timing;
    if (shot.ladleGrip) out.ladle_grip = { ...shot.ladleGrip, fist_px: P(V(shot.ladleGrip.fist_centre_world)) };
    if (shot.faceMarks && figs.jade27) { const Pj = figs.jade27.userData.P; out.face_marks = { note: 'her eye and temple, px in THIS frame (start or end key of the push-in): where the overlay begins', who: 'jade27',
      eyeL_px: P(Pj.eyeL.clone()), eyeR_px: P(Pj.eyeR.clone()), eyes_mid_px: P(Pj.eyes.clone()), templeL_px: P(Pj.templeL.clone()), templeR_px: P(Pj.templeR.clone()),
      eyeL_world: Pj.eyeL.toArray().map((v) => +v.toFixed(4)), templeL_world: Pj.templeL.toArray().map((v) => +v.toFixed(4)), head_pose: shot.figs.jade27.head }; }
    if (figs.firstLove27) out.first_love_costume = FIRST_LOVE_COSTUME;
    if (figs.jade27) out.jade_costume = figs.jade27.userData.spec.costume?.outfit === 'housewarming' ? HOUSEWARMING_COSTUME : { note: 'before the party: her CAST jade27 look kept (OPEN: same outfit as the party? shoes outside?)' };
    if (shot.crossing) { const R = ROOM_CROSSING, px = (x, z, y = 0.02) => P(V(x, y, z)), { legs, stops, ...rest } = R;
      const people = Object.entries(figs).map(([w, f]) => { const p = f.userData.P, pel = p.hip || p.waist || p.head;
        return { who: w, label: CAST[w].name, floor_world: [+pel.x.toFixed(3), +pel.z.toFixed(3)], floor_px: px(pel.x, pel.z), head_px: P(p.head.clone()) }; })
        .filter((q) => q.floor_world[1] > -3 && q.floor_world[1] < 10.2 && q.floor_world[0] < 5);
      out.crossing = { ...rest, key: shot.rcKey || null,
        items: R.items.map((o) => (o.kind === 'leg' ? { ...o, pts_px: o.pts.map(([x, z]) => px(x, z)), arrow_px: [px(...o.pts[0]), px(...o.pts[o.pts.length - 1])] } : { ...o, px: px(...o.at) })),
        people_in_the_rooms: people };
      if (shot.legs) out.crossing.arrows = { colours: Object.fromEntries(Object.entries(LEG_COL).map(([k, c]) => [k, '#' + c.toString(16).padStart(6, '0')])), note: 'legs drawn as floor arrows (y 0.035), rings at the stops: diagnostic only' }; }
    if (shot.path) out.path = { note: 'her route, one line: shelf, the opening, round the dining table, the sliding door, the deck, the stairs, the lawn, the lemon tree; floor points [X, y, Z]', world: PATH.map(([x, z, y]) => [x, y, z]), px: PATH.map(([x, z, y]) => P(V(x, y + 0.02, z))) };
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
