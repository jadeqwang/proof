// mortongrove07 round 7 (Jade's notes on the house, 2026-11-27): the soft furnishings and tables, each with ONE canonical
// texture so every guide mode (lit colour, flat / label greys, form shading, line / contour edges) shows the same pattern.
//   UPHOLSTERY  layout/assets/art/mortongrove07/mg_upholstery.png  couch + loveseat (Jade: "larger floral patterns, with a
//               couple of LARGE FLOWERS in the middle of each cushion"; the soft pink floral of media/keyframes/r4/
//               mortongrove07/MG_wide_v1.jpg). A seamless square swatch with two large cabbage roses at its centre: every
//               cushion maps exactly one repeat across its width, centred, so each cushion shows its two big roses in the
//               middle; the frame (arms, back, base) repeats at the same physical scale.
//   RUG         layout/assets/art/mortongrove07/mg_rug.png  (Jade: "soft pink floral like the couch"), the whole rug, top down.
// Couch + loveseat are OVERSTUFFED (Jade): rounded boxes, crowned seat and back cushions, fat rolled arms.
// Tables (Jade): the coffee table and the lamp side table DUSTY DARK PINK with GLASS PANELS set into them; the table lamp
// a real size (68 cm tall, 42 cm shade).
import * as THREE from 'three';
import { RoundedBoxGeometry } from '/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mk, box, cyl, tag, rad } from '../../engine/core.js';
import { loadArt, artLook, artPlane, repeatArt } from '../_art.js';

export const ART = await loadArt({
  uph: ['/assets/art/mortongrove07/mg_upholstery.png', { edgeBlur: 2, edgeMax: 0.42 }],
  rug: ['/assets/art/mortongrove07/mg_rug.png', { edgeBlur: 2, edgeMax: 0.42 }],
  mirror: ['/assets/art/mortongrove07/mg_mirror.png', { edgeBlur: 3, edgeGain: 1.6, edgeMax: 0.55, maxPx: 1460 }],   // r7 follow-up: the mirror's canonical face (no reflection)
});
if (ART.uph) repeatArt(ART.uph);

// plain fallbacks (no image): the old dusty rose
const FLORAL = { grey: 0.68, col: 0xc9a39a, recvShadowLine: true }, FLORAL_D = { grey: 0.6, col: 0xb08a84, recvShadowLine: true };
const UPH = (dark) => (ART.uph ? artLook(ART.uph, { grey: dark ? 0.62 : 0.7, col: 0xd8b8b0, recvShadowLine: true }) : dark ? FLORAL_D : FLORAL);
export const DUSTY_PINK = { grey: 0.5, col: 0xb0707a };   // dusty dark pink lacquer (Jade); r7 follow-up: a touch lighter, toward the rug's rose border (was 0x9a5a68)
const GLASS_LIT = { glass: true, col: 0xcfe2de, opacity: 0.32, noCast: true };
const GLASS_GUIDE = { grey: 0.86, col: 0xc6dcd8, hide: ['lit'], noCast: true };   // the same panel, opaque pale green-grey, in every non-lit mode (engine glass is invisible there)
const WOOD_D = { grey: 0.32, col: 0x5a3e28 };

// UVs: one texture repeat every `period` metres on each face, centred on the mesh's own origin (so a cushion whose
// width = period shows exactly one repeat, its centre on the cushion's centre), projected along each face's normal
function centredUV(m, period, ou = 0.5, ov = 0.5) {
  const g = m.geometry, p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (ay >= ax && ay >= az) uv.setXY(i, ou + x / period, ov - z / period);
    else if (ax >= az) uv.setXY(i, ou + z * Math.sign(n.getX(i) || 1) * -1 / period, ov + y / period);
    else uv.setXY(i, ou + x * Math.sign(n.getZ(i) || 1) / period, ov + y / period); }
  uv.needsUpdate = true; return m;
}
// a rounded box, its +y face (or +z with face 'front') crowned by `crown` metres in the middle (an overstuffed cushion)
function puffy(w, h, d, r, look, { crown = 0, face = 'top', seg = 4 } = {}) {
  const geo = new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
  if (crown) { const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2), z = p.getZ(i) / (d / 2);
      if (face === 'top' && y > 0) p.setY(i, p.getY(i) + crown * y * Math.max(0, 1 - x * x) * Math.max(0, 1 - z * z));
      if (face === 'front' && z > 0) p.setZ(i, p.getZ(i) + crown * z * Math.max(0, 1 - x * x) * Math.max(0, 1 - y * y)); }
    geo.computeVertexNormals(); }
  return mk(geo, look);
}
const at = (m, p, r) => { m.position.set(...p); if (r) m.rotation.set(...r.map(rad)); return m; };

// AN OVERSTUFFED SOFA in its own frame: centred on x, the sitter faces +z, floor y 0. n seat cushions across `w`; `d` deep.
// o: seat (cushion top), back, arm (heights), armW, baseH, backD (back cushion zone depth). Returns a Group. Every
// upholstered part carries the one upholstery texture (UPH), cushions one repeat each, centred.
export function overstuffed(w, d, n, o, label) {
  const g = new THREE.Group(), { seat, back, arm, armW, baseH, backD } = o, iw = w - 2 * armW, cw = iw / n, U = UPH(false), Ud = UPH(true);
  const frameZ = -d / 2;   // back edge
  // base (the frame under the seat cushions), skirt-free, on four short turned feet
  g.add(centredUV(at(puffy(w - 0.02, baseH, d - 0.02, 0.05, Ud), [0, 0.06 + baseH / 2, 0]), cw));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(cyl(0.022, 0.016, 0.06, WOOD_D, null, null, 10), [sx * (w / 2 - 0.07), 0.03, sz * (d / 2 - 0.07)]));
  // back frame: a thick padded panel, its top edge rolled
  const bfT = 0.20; g.add(centredUV(at(puffy(w - 0.02, back - baseH - 0.06, bfT, 0.09, Ud, { crown: 0.02, face: 'top' }), [0, (back + baseH + 0.06) / 2, frameZ + bfT / 2]), cw));
  // arms: fat padded blocks with a big roll on top, overhanging outward (the inner face stays at armW from each end)
  for (const s of [-1, 1]) { const ax = s * (w / 2 - armW / 2);
    g.add(centredUV(at(puffy(armW + 0.02, arm - 0.17, d - 0.02, 0.07, Ud), [ax + s * 0.01, (arm - 0.11 + 0.06) / 2, 0.0]), cw));
    const roll = mk(new THREE.CylinderGeometry(0.125, 0.125, d - 0.02, 28), Ud); roll.rotation.x = Math.PI / 2; roll.position.set(ax + s * 0.035, arm - 0.115, 0.005);
    centredUV(roll, cw); g.add(roll);
    // the roll's front face: a puffed disc (the scroll of a rolled arm)
    const cap = mk(new THREE.SphereGeometry(0.125, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), Ud); cap.scale.set(1, 0.30, 1); cap.rotation.x = Math.PI / 2; cap.position.set(ax + s * 0.035, arm - 0.115, d / 2 - 0.005);
    centredUV(cap, cw); g.add(cap); }
  // seat cushions: thick, crowned, one floral repeat each, centred
  const sT = seat - baseH - 0.06, sD = d - backD + 0.02, sZ = d / 2 - sD / 2;
  for (let k = 0; k < n; k++) { const x = -iw / 2 + cw * (k + 0.5);
    g.add(centredUV(at(puffy(cw - 0.008, sT - 0.015, sD, 0.06, U, { crown: 0.03, face: 'top' }), [x, baseH + 0.06 + (sT - 0.015) / 2, sZ]), cw)); }
  // back cushions: plump pillows leaning back 10 deg, crowned toward the sitter, one repeat each, centred
  const bT = backD - 0.06, bH = back - seat + 0.06;   // flat front 0.09 m in front of the old cushions' line minus nothing: same place as before, the crown adds 4.5 cm in the middle
  for (let k = 0; k < n; k++) { const x = -iw / 2 + cw * (k + 0.5);
    g.add(centredUV(at(puffy(cw - 0.01, bH, bT, 0.08, U, { crown: 0.045, face: 'front' }), [x, seat + bH / 2 - 0.03, frameZ + bfT + bT / 2 - 0.04], [-10, 0, 0]), cw)); }
  return tag(g, label);
}

// the RUG: a 6 mm flat-woven (Aubusson / needlepoint) wool rug with the canonical rug image on its top face
export function rug(R) {
  const g = new THREE.Group(), w = R.x1 - R.x0, d = R.z1 - R.z0, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
  g.add(tag(box(w, 0.006, d, { grey: 0.6, col: 0xc89a9a, recvShadowLine: true }, [cx, 0.003, cz]), R.label));
  if (ART.rug) { const p = artPlane(ART.rug, w, d, { recvShadowLine: true }); p.rotation.x = -Math.PI / 2; p.position.set(cx, 0.0062, cz); p.castShadow = false; p.receiveShadow = true; g.add(tag(p, R.label)); }
  return g;
}

// a DUSTY DARK PINK table with GLASS PANELS set into it (Jade): square legs, an apron, the top a pink frame round an inset
// glass panel, and a lower shelf: a pink frame round a second glass panel. T = { x0, x1, z0, z1, h }. n = the number of
// EQUAL glass panels in the top (Jade: the long coffee table has 3), divided by 5 cm cross rails. Returns [cx, cz, panels]
// (the top panels' centres and sizes, west to east).
export function glassTable(g, T, label, n = 1) {
  const w = T.x1 - T.x0, d = T.z1 - T.z0, cx = (T.x0 + T.x1) / 2, cz = (T.z0 + T.z1) / 2, L = 0.045, rail = Math.min(0.07, w * 0.14), th = 0.032;
  const cr = 0.05, panels = [];
  const frame = (y, t, lab, k = 1) => {   // a rectangular frame of four rails (+ k - 1 cross rails), k equal openings for the glass
    g.add(tag(box(w, t, rail, DUSTY_PINK, [cx, y, T.z0 + rail / 2]), lab)); g.add(tag(box(w, t, rail, DUSTY_PINK, [cx, y, T.z1 - rail / 2]), lab));
    g.add(tag(box(rail, t, d - 2 * rail, DUSTY_PINK, [T.x0 + rail / 2, y, cz]), lab)); g.add(tag(box(rail, t, d - 2 * rail, DUSTY_PINK, [T.x1 - rail / 2, y, cz]), lab));
    const ow = (w - 2 * rail - (k - 1) * cr) / k, pd = d - 2 * rail + 0.01;   // each panel sits in a rebate, 5 mm under the rails
    for (let i = 0; i < k; i++) { const px = T.x0 + rail + ow / 2 + i * (ow + cr);
      if (i) g.add(tag(box(cr, t, d - 2 * rail, DUSTY_PINK, [px - ow / 2 - cr / 2, y, cz]), lab));
      g.add(tag(box(ow + 0.01, 0.008, pd, GLASS_LIT, [px, y + t / 2 - 0.01, cz]), lab + ': glass panel'));
      g.add(tag(box(ow + 0.01, 0.008, pd, GLASS_GUIDE, [px, y + t / 2 - 0.01, cz]), lab + ': glass panel'));
      if (k === n && y > 0.2) panels.push({ x: px, z: cz, w: ow, d: d - 2 * rail }); } };
  frame(T.h - th / 2, th, label, n);
  g.add(tag(box(w - 0.02, 0.06, 0.02, DUSTY_PINK, [cx, T.h - th - 0.03, T.z0 + 0.012]), label)); g.add(tag(box(w - 0.02, 0.06, 0.02, DUSTY_PINK, [cx, T.h - th - 0.03, T.z1 - 0.012]), label));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(tag(box(L, T.h - th, L, DUSTY_PINK, [cx + sx * (w / 2 - L / 2), (T.h - th) / 2, cz + sz * (d / 2 - L / 2)]), label));
  frame(0.12, 0.024, label + ' (lower shelf)');
  return [cx, cz, panels];
}
// the top of a glassTable's top glass panel (objects stand on it): the panel's centre T.h - 0.01, 8 mm thick
export const glassTop = (T) => T.h - 0.006;

// TABLE LAMP (Jade: "larger"; a real one is 60-75 cm with a 35-45 cm shade): 0.68 m overall. A turned ceramic urn base
// (cream glaze) on a dark wood plinth, a brass neck and harp, a pleated-look drum shade 0.42 m across at the bottom,
// 0.32 at the top, 0.28 tall, and a brass finial.
export function tableLamp(g, [x, z], y, label) {
  const CER = { grey: 0.82, col: 0xe8dcc4 }, BRASS = { grey: 0.62, col: 0xb89a50 }, SHADE = { grey: 0.9, col: 0xf0e6cc };
  g.add(tag(cyl(0.085, 0.09, 0.03, WOOD_D, [x, y + 0.015, z], null, 24), label));
  const prof = [[0.0, 0], [0.07, 0], [0.075, 0.02], [0.10, 0.09], [0.115, 0.17], [0.10, 0.25], [0.06, 0.31], [0.035, 0.33], [0.03, 0.345], [0.0, 0.345]].map(([r, h]) => new THREE.Vector2(r, h));
  const urn = mk(new THREE.LatheGeometry(prof, 32), CER); urn.position.set(x, y + 0.03, z); g.add(tag(urn, label));
  g.add(tag(cyl(0.012, 0.012, 0.13, BRASS, [x, y + 0.375 + 0.065, z], null, 12), label));            // neck to the socket (0.375 -> 0.505)
  g.add(tag(cyl(0.022, 0.02, 0.05, BRASS, [x, y + 0.53, z], null, 14), label));                       // socket
  for (const s of [-1, 1]) g.add(tag(cyl(0.004, 0.004, 0.17, BRASS, [x + s * 0.075, y + 0.565, z], [0, 0, -s * 22], 6), label));   // harp
  const sh = mk(new THREE.CylinderGeometry(0.16, 0.21, 0.28, 40, 1, true), SHADE); sh.position.set(x, y + 0.53, z); sh.userData.double = true; g.add(tag(sh, label + ': shade'));
  g.add(tag(cyl(0.012, 0.006, 0.03, BRASS, [x, y + 0.685, z], null, 10), label));                     // finial (top 0.70)
  return y + 0.70;
}

// A GLASS CHESS SET in the STARTING POSITION (Jade, r7 follow-up): all 32 pieces on their home squares, no game in
// progress; clear and frosted glass pieces on a glass board of alternating clear and frosted squares. Real size: 45 mm
// squares, a 0.38 m board (8 x 45 mm + a 10 mm frosted border all round), 10 mm thick; king 85 mm, queen 75, bishop 64,
// knight 56, rook 50, pawn 42 mm; turned (lathe) Staunton-like profiles, the knight a turned base with a carved head.
// FROSTED (the "white" side) toward the couch (south, +z), CLEAR toward the dining side; a1 at the board's south-west
// corner seen from the couch, so each side has a light (frosted) square at its right (h1 / a8). Glass is invisible in the
// engine's non-lit modes, so: frosted parts are an opaque pale white-grey everywhere; clear parts are see-through glass
// in lit plus an opaque pale aqua-grey stand-in in every other mode (as the table panels).
const FROST = { grey: 0.93, col: 0xeef1f0 };
const CLEAR_LIT = { glass: true, col: 0xd6ecee, opacity: 0.5, noCast: true }, CLEAR_GUIDE = { grey: 0.7, col: 0xa9c4c8, hide: ['lit'] };
const lathe = (prof, look) => mk(new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), 24), look);
const BASE = (r) => [[0, 0], [r, 0], [r, 0.004], [r * 0.85, 0.008], [r * 0.78, 0.012]];
const PROF = {
  P: [...BASE(0.0105), [0.0055, 0.022], [0.009, 0.025], [0.0045, 0.028], [0.0085, 0.033], [0.008, 0.038], [0.005, 0.041], [0, 0.042]],
  R: [...BASE(0.0125), [0.009, 0.032], [0.0115, 0.036], [0.0115, 0.050], [0, 0.050]],
  B: [...BASE(0.0125), [0.006, 0.034], [0.010, 0.037], [0.005, 0.040], [0.0085, 0.047], [0.008, 0.055], [0.0045, 0.060], [0.003, 0.062], [0.0035, 0.064], [0, 0.064]],
  Q: [...BASE(0.0135), [0.0065, 0.045], [0.011, 0.049], [0.006, 0.052], [0.0095, 0.066], [0.007, 0.070], [0.004, 0.072], [0.0045, 0.075], [0, 0.075]],
  K: [...BASE(0.014), [0.007, 0.050], [0.012, 0.054], [0.0065, 0.057], [0.010, 0.072], [0.008, 0.074], [0, 0.074]],
  N: [...BASE(0.0125), [0.0085, 0.022], [0, 0.022]],
};
function chessPiece(type, look, guide, facing) {
  const g = new THREE.Group(), add = (m) => { g.add(m); if (guide) { const c = m.clone(); c.material = m.material; c.userData = { ...m.userData, look: guide }; g.add(c); } };
  add(lathe(PROF[type], look));
  if (type === 'K') { add(at(box(0.004, 0.016, 0.004, look), [0, 0.082, 0])); add(at(box(0.012, 0.004, 0.004, look), [0, 0.084, 0])); }
  if (type === 'N') {   // the horse's head and neck, carved: a tapered block leaning forward, a muzzle, two ears
    add(at(box(0.016, 0.026, 0.012, look), [0, 0.034, 0.001], [-12, 0, 0])); add(at(box(0.012, 0.012, 0.022, look), [0, 0.046, 0.009], [-25, 0, 0]));
    add(at(box(0.004, 0.008, 0.004, look), [0.004, 0.055, -0.003])); add(at(box(0.004, 0.008, 0.004, look), [-0.004, 0.055, -0.003])); }
  g.rotation.y = facing; return g;
}
export function chessSet(g, [x, z], y, label = 'glass chess set (starting position)') {
  const S = 0.045, B = 8 * S + 0.02, T = 0.010, set = new THREE.Group(); set.position.set(x, y, z);
  // the board: a frosted base plate with alternating clear squares set flush on top (the dark squares of a normal board = clear)
  set.add(tag(box(B, T - 0.002, B, FROST, [0, (T - 0.002) / 2, 0]), label + ': board'));
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) { const sx = (f - 3.5) * S, sz = (3.5 - r) * S;   // file a..h = west..east, rank 1 at the couch (+z)
    const dark = (f + r) % 2 === 0;   // a1 dark
    if (dark) { set.add(tag(box(S, 0.002, S, CLEAR_LIT, [sx, T - 0.001, sz]), label + ': board')); set.add(tag(box(S, 0.002, S, CLEAR_GUIDE, [sx, T - 0.001, sz]), label + ': board')); }
    else set.add(tag(box(S, 0.002, S, FROST, [sx, T - 0.001, sz]), label + ': board')); }
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (const side of ['frosted', 'clear']) { const fr = side === 'frosted', look = fr ? FROST : CLEAR_LIT, guide = fr ? null : CLEAR_GUIDE;
    const r1 = fr ? 0 : 7, r2 = fr ? 1 : 6, facing = fr ? Math.PI : 0;   // knights face the opponent
    for (let f = 0; f < 8; f++) { for (const [r, t] of [[r1, back[f]], [r2, 'P']]) { const p = chessPiece(t, look, guide, facing);
      p.position.set((f - 3.5) * S, T, (3.5 - r) * S); p.traverse((o) => { if (o.isMesh) tag(o, label + ': ' + side + ' pieces'); }); set.add(p); } } }
  g.add(set); return set;
}
