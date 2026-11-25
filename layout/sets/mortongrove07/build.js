// Build one mortongrove07 shot: the living room of 5748 Capri Lane (from layout.js; compass axes, x east, z south),
// the floral couch against the front wall beside the picture window, her seated, first love standing and leaning in,
// the folded IAS sweatshirt between their four hands, the real afternoon sun (SCENE) through the picture window.
//   shot.beamMask (the twins beam_<id>): flat mode = the sun shaft white on black (sets/_beam.js applyBeamMask)
import * as THREE from 'three';
import { mk, box, cyl, quad, slab, tag, V, rad } from '../../engine/core.js';
import { CAST } from '../_cast.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, beamMesh, beamWire, beamSidecar, applyBeamMask } from '../_beam.js';
import { wall, r3 } from '../basement90/kit.js';
import { YEAR, FILM, HOUSE, SCENE, SUN, SUN_DIR, APERTURE, BEAM, sunMargin, ROOM, PICTURE, COUCH, STAIR_OPENING, STAIR, DINING_OPENING, DINING,
  COFFEE_TABLE, ARMCHAIR, SIDE_TABLE, TV, RUG, PRINT, HER, HIM, SHIRT, GRIP, SEAL, LIGHTS } from './layout.js';

// cast: `jade27` (kind adultJade27; stands in for Jade at about 24) and `firstLove27` (kind adultFirstLove, 1.78 m), both from ../_cast.js
void CAST;

const PLASTER = { grey: 0.8, col: 0xd8d0bc, recvShadowLine: true }, CARPET = { grey: 0.55, col: 0x9a8a72, recvShadowLine: true }, TRIM = { grey: 0.88, col: 0xe8e2d2 };
const FLORAL = { grey: 0.68, col: 0xc9a39a, recvShadowLine: true }, FLORAL_D = { grey: 0.6, col: 0xb08a84, recvShadowLine: true };
const WOOD = { grey: 0.42, col: 0x7a5a3a }, WOOD_D = { grey: 0.32, col: 0x5a3e28 }, DARK = { grey: 0.15, col: 0x1e1e22 };
const CORK = { grey: 0.55, col: 0xb08a5a }, STRAP = { grey: 0.3, col: 0x5a3a24 };

function room() {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h, wallT: T, wallInt: Ti } = ROOM, W = PICTURE, F = 0.05;
  g.add(tag(box(x1 - x0 + 2 * T, 0.06, z1 - z0 + 2 * T, CARPET, [(x0 + x1) / 2, -0.03, (z0 + z1) / 2]), 'floor (wall-to-wall carpet)'));
  g.add(tag(box(x1 - x0 + 2 * T, 0.06, z1 - z0 + 2 * T, { grey: 0.86, col: 0xe6e0d0 }, [(x0 + x1) / 2, h + 0.03, (z0 + z1) / 2]), 'ceiling'));
  g.add(wall({ axis: 'z', at: z1, a0: x0 - Ti, a1: x1 + T, y1: h, t: T, out: 1, holes: [{ a0: W.x0, a1: W.x1, y0: W.sill, y1: W.head }], look: PLASTER, label: 'front wall (south)' }));
  g.add(wall({ axis: 'z', at: z0, a0: x0 - Ti, a1: x1 + T, y1: h, t: Ti, out: -1, holes: [{ a0: DINING_OPENING.x0, a1: DINING_OPENING.x1, y0: 0, y1: DINING_OPENING.h }], look: PLASTER, label: 'north wall (dining room beyond)' }));
  g.add(wall({ axis: 'x', at: x0, a0: z0, a1: z1, y1: h, t: Ti, out: -1, holes: [{ a0: STAIR_OPENING.z0, a1: STAIR_OPENING.z1, y0: 0, y1: STAIR_OPENING.h }], look: PLASTER, label: 'west wall (entry / stair hall beyond)' }));
  g.add(wall({ axis: 'x', at: x1, a0: z0, a1: z1, y1: h, t: T, out: 1, look: PLASTER, label: 'east wall' }));
  // baseboards
  g.add(tag(box(x1 - x0, 0.1, 0.015, TRIM, [(x0 + x1) / 2, 0.05, z1 - 0.008]), 'baseboard'));
  g.add(tag(box(0.015, 0.1, z1 - z0, TRIM, [x1 - 0.008, 0.05, (z0 + z1) / 2]), 'baseboard'));
  // picture window: frame, two mullions (narrow casement each side of the big fixed light), sill, glass; daylight beyond
  { const zc = z1 + 0.04, ym = (W.sill + W.head) / 2, hh = W.head - W.sill;
    for (const y of [W.sill - F / 2, W.head + F / 2]) g.add(tag(box(W.x1 - W.x0 + 2 * F, F, 0.12, TRIM, [(W.x0 + W.x1) / 2, y, zc]), 'picture window'));
    for (const x of [W.x0 - F / 2, W.x1 + F / 2, ...W.mullions]) g.add(tag(box(F, hh, 0.12, TRIM, [x, ym, zc]), 'picture window'));
    g.add(tag(box(W.x1 - W.x0 + 0.16, 0.025, 0.12, TRIM, [(W.x0 + W.x1) / 2, W.sill - 0.012, z1 - 0.05]), 'window stool'));
    g.add(tag(quad([V(W.x0, W.head, z1 + 0.06), V(W.x1, W.head, z1 + 0.06), V(W.x1, W.sill, z1 + 0.06), V(W.x0, W.sill, z1 + 0.06)], { glass: true, col: 0xfff6e0, opacity: 0.18, noCast: true }), 'window glass'));
    // drapes pulled back to the window's ends (the east one stands between the window and the couch's arm)
    g.add(tag(box(0.22, h - 0.14, 0.06, { grey: 0.74, col: 0xd8ccb0 }, [W.x0 - 0.14, (h - 0.14) / 2 + 0.01, z1 - 0.06]), 'drapes (pulled back)'));
    g.add(tag(box(0.08, h - 0.14, 0.06, { grey: 0.74, col: 0xd8ccb0 }, [W.x1 + 0.05, (h - 0.14) / 2 + 0.01, z1 - 0.06]), 'drapes (pulled back)'));
    g.add(tag(box(W.x1 - W.x0 + 0.6, 0.06, 0.08, WOOD_D, [(W.x0 + W.x1) / 2, h - 0.12, z1 - 0.06]), 'drapery rod'));
    g.add(tag(box(7, 4, 0.05, { grey: 0.97, col: SUN.color, emit: SUN.color, emitI: 1.25, flatEmit: 0.97, noCast: true }, [(W.x0 + W.x1) / 2, 1.6, z1 + 2.5]), 'daylight outside (front lawn, Capri Lane)')); }
  // entry / stair hall beyond the west opening (GUESS): landing, a half flight UP (north half), a half flight DOWN (south half)
  { const S = STAIR_OPENING, P = STAIR, hx = P.hallX0, zm = (S.z0 + S.z1) / 2, wz = (S.z1 - S.z0) / 2 - 0.02;
    g.add(tag(box(-hx, 0.04, 1.8, CARPET, [hx / 2 - Ti / 2, -0.02, zm]), 'entry / stair hall'));
    for (let k = 1; k <= P.risers; k++) { const x = -Ti - 0.35 - k * P.tread;
      g.add(tag(box(P.tread, k * P.rise, wz, WOOD, [x + P.tread / 2, k * P.rise / 2, S.z0 + wz / 2 + 0.01]), 'half flight up (to the bedrooms)'));
      g.add(tag(box(P.tread, 0.04, wz, WOOD, [x + P.tread / 2, -k * P.rise, S.z1 - wz / 2 - 0.01]), 'half flight down (to the rec room)')); }
    g.add(tag(box(0.04, 0.9, 1.2, WOOD_D, [-Ti - 0.6, 0.45, zm]), 'stair railing / half wall'));
    g.add(tag(box(0.05, 3.2, 2.4, { grey: 0.6, col: 0xb8b0a0 }, [hx - Ti - 0.4, 0.6, zm]), 'entry / stair hall')); }
  // dining room beyond the north opening (GUESS): floor, far wall, table
  { const D = DINING, O = DINING_OPENING, t = D.table, zc = z0 - Ti - D.depth / 2;
    g.add(tag(box(3.2, 0.04, D.depth, CARPET, [(O.x0 + O.x1) / 2, -0.02, zc]), 'dining room'));
    g.add(tag(box(3.4, h, 0.05, { grey: 0.65, col: 0xc0b8a8 }, [(O.x0 + O.x1) / 2, h / 2, z0 - Ti - D.depth]), 'dining room'));
    g.add(tag(box(t.w, 0.04, t.d, WOOD, [t.c[0], t.h - 0.02, t.c[1]]), 'dining table'));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(tag(box(0.05, t.h - 0.04, 0.05, WOOD, [t.c[0] + sx * (t.w / 2 - 0.08), (t.h - 0.04) / 2, t.c[1] + sz * (t.d / 2 - 0.08)]), 'dining table')); }
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

function furniture() {
  const g = new THREE.Group();
  g.add(tag(box(RUG.x1 - RUG.x0, 0.012, RUG.z1 - RUG.z0, { grey: 0.48, col: 0x7a5a50, recvShadowLine: true }, [(RUG.x0 + RUG.x1) / 2, 0.006, (RUG.z0 + RUG.z1) / 2]), 'area rug'));
  const table = (T, label) => { const cx = (T.x0 + T.x1) / 2, cz = (T.z0 + T.z1) / 2;
    g.add(tag(box(T.x1 - T.x0, 0.04, T.z1 - T.z0, WOOD, [cx, T.h - 0.02, cz]), label));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(tag(box(0.04, T.h - 0.04, 0.04, WOOD, [cx + sx * ((T.x1 - T.x0) / 2 - 0.035), (T.h - 0.04) / 2, cz + sz * ((T.z1 - T.z0) / 2 - 0.035)]), label));
    return [cx, cz]; };
  { const [cx, cz] = table(COFFEE_TABLE, 'coffee table');
    g.add(tag(box(0.22, 0.03, 0.28, { grey: 0.82, col: 0xe0d8c4 }, [cx + 0.08, COFFEE_TABLE.h + 0.015, cz], [0, -10, 0]), 'papers / a notebook'));
    g.add(tag(cyl(0.04, 0.035, 0.1, { grey: 0.85, col: 0xe8e0d0 }, [cx - 0.18, COFFEE_TABLE.h + 0.05, cz - 0.1], null, 16), 'mug'));
    g.add(tag(box(0.18, 0.025, 0.24, { grey: 0.3, col: 0x3a4a6a }, [cx - 0.05, COFFEE_TABLE.h + 0.045, cz + 0.12], [0, 14, 0]), 'textbook')); }
  { const [cx, cz] = table(SIDE_TABLE, 'side table');
    g.add(tag(cyl(0.07, 0.09, 0.26, { grey: 0.7, col: 0xc0b49a }, [cx, SIDE_TABLE.h + 0.13, cz], null, 18), 'table lamp (off)'));
    const sh = mk(new THREE.CylinderGeometry(0.12, 0.17, 0.24, 24, 1, true), { grey: 0.86, col: 0xeee4cc }); sh.position.set(cx, SIDE_TABLE.h + 0.36, cz); sh.userData.double = true; g.add(tag(sh, 'table lamp (off)')); }
  { const A = ARMCHAIR, a = new THREE.Group(); a.position.set(A.at[0], 0, A.at[1]); a.rotation.y = rad(A.yaw); const UP = { grey: 0.5, col: 0x7a6a58 };
    a.add(box(A.w, A.seat - 0.08, A.d, UP, [0, (A.seat - 0.08) / 2 + 0.04, 0])); a.add(box(A.w, A.back - 0.04, 0.18, UP, [0, A.back / 2, -A.d / 2 + 0.09]));
    for (const s of [-1, 1]) a.add(box(0.16, A.arm - 0.04, A.d, UP, [s * (A.w / 2 - 0.08), A.arm / 2, 0]));
    g.add(tag(a, 'armchair')); }
  g.add(tag(box(TV.w, TV.h, TV.d, WOOD_D, [TV.x, TV.h / 2, TV.z + TV.d / 2 + 0.02]), 'TV stand'));
  g.add(tag(box(TV.set.w, TV.set.h, TV.set.d, DARK, [TV.x, TV.h + TV.set.h / 2, TV.z + TV.set.d / 2 + 0.04]), 'TV (off)'));
  g.add(tag(box(PRINT.w, PRINT.h, 0.03, { grey: 0.4, col: 0x6a6050 }, [PRINT.x, PRINT.y, PRINT.z]), 'framed print'));
  return g;
}

// the folded sweatshirt: a soft stack (two folded layers + a ribbed hem band at the near end), the seal on top
function sweatshirt() {
  const g = new THREE.Group(); const S = SHIRT;
  const basis = new THREE.Matrix4().makeBasis(V(S.u), V(S.n), V(S.w));   // local x = across (his left), y = up, z = toward her (u x n = w: a proper rotation)
  const q = new THREE.Quaternion().setFromRotationMatrix(basis);
  const pc = V(S.c); const L = (x, y, z) => pc.clone().add(V(x, y, z).applyQuaternion(q));
  const WHITE = { grey: 0.95, col: S.color, recvShadowLine: true };
  const put = (m, p) => { m.position.copy(p); m.quaternion.copy(q); g.add(m); return m; };
  put(box(S.across, S.thick * 0.55, S.along, WHITE), L(0, -S.thick * 0.2, 0));
  put(box(S.across - 0.012, S.thick * 0.42, S.along - 0.01, WHITE), L(0, S.thick * 0.28, 0));
  put(box(S.across - 0.006, S.thick * 0.5, 0.035, { grey: 0.9, col: 0xe8e6e0 }), L(0, S.thick * 0.02, S.along / 2 - 0.02));   // ribbed hem at her end
  tag(g, 'IAS sweatshirt (white, folded)');
  const seal = put(cyl(S.sealR, S.sealR, 0.003, { grey: 0.18, col: S.seal }, null, null, 40), L(0, S.thick / 2 + 0.0015, 0));
  tag(seal, 'IAS seal (Truth, Beauty)', true);
  // a thin top-mark on the seal (toward him = the seal's top as SHE reads it) so its orientation is legible in the guides
  const mark = put(box(0.008, 0.001, 0.03, { grey: 0.95, col: 0xf4f2ec, only: ['label'] }), L(0, S.thick / 2 + 0.0035, -S.sealR * 0.6)); tag(mark, 'seal top (as she reads it)', true);
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

export const NAMED = { shirt: SHIRT.c, seal: SEAL.centre, ...GRIP };
delete NAMED.r;
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(room()); root.add(couch()); root.add(furniture()); root.add(sweatshirt());
  const solid = beamSolid({ aperture: APERTURE, dir: BEAM.dir, clip: BEAM.clip, length: 9 });
  const sunk = beamSolid({ aperture: APERTURE, dir: BEAM.dir, clip: BEAM.clip, length: 9, sink: 0.01 });
  if (!shot.beamMask) {
    root.add(tag(beamWire(solid, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }, 0.004), 'sun shaft (volume edges)'));
    root.add(tag(beamMesh(sunk, { glass: true, col: SUN.color, opacity: 0.08 }), 'sun shaft (volume)'));
  }

  const { figs } = stage(shot.figs || {}, null, (t) => (NAMED[t] ? V(NAMED[t]) : null));
  for (const f of Object.values(figs)) { root.add(f); f.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, recvShadowLine: true }; }); }
  if (figs.firstLove27 && shot.sandals !== false) root.add(sandals(figs.firstLove27));
  const cs = { ...shot, orbit: shot.orbit ? { ...shot.orbit, at: fix(shot.orbit.at) } : undefined, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);

  const winC = V((PICTURE.x0 + PICTURE.x1) / 2, (PICTURE.sill + PICTURE.head) / 2, 0), sunFrom = winC.clone().addScaledVector(V(SUN_DIR), -6);
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); s.position.copy(sunFrom); s.target.position.copy(sunFrom).add(V(SUN_DIR)); s.castShadow = true;
    const c = s.shadow.camera; c.left = -4.5; c.right = 4.5; c.top = 4.5; c.bottom = -4.5; c.near = 0.5; c.far = 16; c.updateProjectionMatrix(); s.shadow.radius = 2.5; return s; };
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSun(0xffffff, 3)];
    if (mode === 'lit') { const sky = new THREE.DirectionalLight(0xc8d4e8, 0.7); sky.position.set(1.5, 2.0, 4); sky.target.position.set(2.5, 0.6, -2);
      return [mkSun(SUN.color, 3.0), sky, new THREE.AmbientLight(0x9aa2b0, 0.7)]; }
    const d = new THREE.DirectionalLight(0xffffff, 0.55); d.position.set(4.0, 3.0, -3.0);
    return [mkSun(0xffffff, 2.2), new THREE.AmbientLight(0xffffff, 1.25), d];
  };
  if (shot.beamMask) applyBeamMask(root, [solid], { label: 'sun shaft (mask)', cam, surfaceOnly: !!shot.beamSurf });

  const lights = [{ name: 'sun', kind: LIGHTS.sun.kind, pos: sunFrom, aim: V(SHIRT.c), color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true },
    { name: 'sky', kind: LIGHTS.sky.kind, pos: winC.clone().add(V(0, 0, 1)), aim: V(HER.at[0], 1.0, HER.at[1]), color: '#dfe6f0', on: true }];
  const W = PICTURE, Pq = (x, y) => V(x, y, W.z);
  const panes = { picture_window: [Pq(W.x1, W.head), Pq(W.x0, W.head), Pq(W.x0, W.sill), Pq(W.x1, W.sill)] };   // TL,TR,BR,BL seen from inside (looking south)
  const sc = V(SEAL.centre), su = V(SHIRT.u), sw = V(SHIRT.w), R = SHIRT.sealR;
  panes.seal_square = [sc.clone().addScaledVector(su, -R).addScaledVector(sw, -R), sc.clone().addScaledVector(su, R).addScaledVector(sw, -R), sc.clone().addScaledVector(su, R).addScaledVector(sw, R), sc.clone().addScaledVector(su, -R).addScaledVector(sw, R)];

  const anchor = V(fix(shot.beamAnchor || 'shirt'));
  const extraOut = (c, P) => {
    const pt = (p) => ({ world: r3(V(p)), px: P(V(p)) });
    const seal = { label: 'IAS seal (Truth, Beauty)', what: 'Institute for Advanced Study seal, DARK BLUE on a WHITE sweatshirt: round, two standing figures labelled TRUTH (left) and BEAUTY (right)',
      radius_m: SHIRT.sealR, centre: pt(SEAL.centre), top_as_she_reads_it: pt(SEAL.top), bottom: pt(SEAL.bottom), truth_side: pt(SEAL.truth), beauty_side: pt(SEAL.beauty),
      corner_order: 'panes.seal_square = TL, TR, BR, BL as she reads it (a painted seal maps straight on)',
      facing: 'up and tipped 10 degrees toward her: upright for her, upside down for a camera behind him',
      normal_to_camera_deg: +(Math.acos(Math.max(-1, Math.min(1, V(SHIRT.n).dot(c.position.clone().sub(sc).normalize())))) * 180 / Math.PI).toFixed(0) };
    const he = figs.firstLove27?.userData.P, she = figs.jade27?.userData.P;
    return {
      time: FILM.time, plan_time: FILM.time, section: FILM.section, position: shot.position || null,
      film: { ...FILM, year: YEAR, place: 'Morton Grove, IL: the house she commuted from to Northwestern (Evanston); he had transferred from Harvard to Princeton' },
      house: { ...HOUSE, axes: 'x = east, z = south, y up; origin = inner SW corner of the living room', living_room_m: [ROOM.x1 - ROOM.x0, ROOM.z1 - ROOM.z0, ROOM.h],
        couch: 'against the FRONT (south) wall, its west end just short of the picture window (Jade); which end is nearer the window is a GUESS (the west end: the afternoon sun then reaches her)' },
      sweatshirt: { colour: 'white', folded_size_m: [SHIRT.across, SHIRT.along, SHIRT.thick], centre: pt(SHIRT.c), seal,
        grips: Object.fromEntries(['hisL', 'hisR', 'herL', 'herR'].map((k) => [k, pt(GRIP[k])])),
        note: 'four hands on it: his two at the side edges on his half, hers at the side edges on her half, every thumb on top and fingers under (engine hold, cylinder r = half the thickness)' },
      first_love: { who: 'first love (a real person: never named, never face-on)', face_shown: false,
        facing_camera_deg: he ? +(Math.acos(Math.max(-1, Math.min(1, he.headFwd.dot(c.position.clone().sub(he.head).normalize())))) * 180 / Math.PI).toFixed(0) : null,
        hair: 'dark brown, relatively straight (unchanged over the years)', feet: 'Birkenstock-type cork sandals (Naot), bare feet', forearms: 'sleeves pushed up: FOREARM HAIR CLEARLY VISIBLE (paint it in the hand insert)',
        hands: 'same absolute size as hers (18.3 cm); feet 24.8 cm (cast kind adultFirstLove)' },
      jade: { cast: 'jade27 (kind adultJade27) standing in for Jade at about 24; no closer age in the cast table' },
      sun: { scene: SCENE, elevation_deg: SUN.altitude, azimuth_deg: SUN.azimuth, travel_dir: SUN_DIR.map((v) => +v.toFixed(4)), note: 'computed for Morton Grove (NOAA equations); date and time are a STAGING CHOICE (sweep.mjs)',
        in_sun_margin_m: { her_eyes: she ? sunMargin(she.eyes.toArray()) : null, seal: sunMargin(SEAL.centre), his_head: he ? sunMargin(he.head.toArray()) : null } },
      beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid, anchor, P, cam: c, extra: { sun_altitude_deg: SUN.altitude, sun_azimuth_deg: SUN.azimuth, note: 'the picture window opening, narrowed by the wall reveal for this sun, swept along the light; eaves not modelled (a low sun passes under them)' } }),
      points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'chin', 'handL', 'handR', 'hip', 'shoulderC'].map((k) => [k, r3(f.userData.P[k])]))])),
    };
  };
  return { set: 'mortongrove07', scene, root, cam, rig, near: shot.near ?? 0.05, far: shot.far ?? 14, figs, book: null, panes, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor,
    litBg: 0x202020, flatBg: shot.beamMask ? 0x000000 : 0xe0ddd4, extra: extraOut };
}
