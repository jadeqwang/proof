// Build one kitchen90 shot: room (from layout.js) + furniture + figures + the light rig of the scene
// (shot.light: 'night' = pendant over the table, 'day' = sun through the window). shot.mirror: true renders the china
// cabinet's glass as a true reflection (engine mirror compositing).
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, limb, tag, V, rad } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, coneSolid, splitAtTop, applyBeamMask } from '../_beam.js';
import { ROOM, WINDOW, COUNTER, STOVE, FRIDGE, STAIR_DOOR, HALL, CABINET, GLASS, glassCorners, TABLE, SEAT, CHAIRS, OUTRO, PAPER, PENDANT, BEAM_NIGHT, BEAM_DAY, SUN, windowCorners, sunHit, shaftAt, inShaft, MOTE, LIGHTS } from './layout.js';
import { kitchen } from './kitchen.js';
import { wall, hexa, polyline, kitchenChair, r3, hideLabels, mirrorMatrix, pointInQuad } from '../basement90/kit.js';

const PLASTER = { grey: 0.78, col: 0xcfc6ae }, LINO = { grey: 0.6, col: 0x9a8f78 }, WOOD = { grey: 0.5, col: 0x8a6a44 }, WOOD_D = { grey: 0.38, col: 0x5e4630 };
const WHITE = { grey: 0.9, col: 0xdcd8cc }, STEEL = { grey: 0.55, col: 0x8a8d90 }, DARK = { grey: 0.2, col: 0x222226 }, TRIM = { grey: 0.86, col: 0xd8d2c0 };

function room(shot) {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h } = ROOM, T = ROOM.wallT, day = shot.light === 'day', W = WINDOW;
  g.add(tag(box(x1 - x0 + 2 * T, 0.06, z1 - z0 + 2 * T, LINO, [0, -0.03, 0]), 'floor (linoleum)'));
  g.add(tag(box(x1 - x0 + 2 * T, 0.06, z1 - z0 + 2 * T, { grey: 0.82, col: 0xd6d0bf }, [0, h + 0.03, 0]), 'ceiling'));
  g.add(wall({ axis: 'z', at: z0, a0: x0 - T, a1: x1 + T, y1: h, t: T, out: -1, holes: [{ a0: W.x - W.w / 2, a1: W.x + W.w / 2, y0: W.sill, y1: W.sill + W.h }], look: PLASTER, label: 'back wall' }));
  g.add(wall({ axis: 'z', at: z1, a0: x0 - T, a1: x1 + T, y1: h, t: T, out: 1, look: PLASTER, label: 'front wall' }));
  const D = STAIR_DOOR;
  g.add(wall({ axis: 'x', at: x0, a0: z0, a1: z1, y1: h, t: T, out: -1, holes: [{ a0: D.z0, a1: D.z1, y0: 0, y1: D.h }], look: PLASTER, label: 'left wall' }));
  g.add(wall({ axis: 'x', at: x1, a0: z0, a1: z1, y1: h, t: T, out: 1, holes: [{ a0: HALL.z0, a1: HALL.z1, y0: 0, y1: HALL.h }], look: PLASTER, label: 'right wall' }));
  // basement stair door (closed), hall doorway (open; dim hall beyond)
  g.add(tag(box(0.04, D.h - 0.01, D.z1 - D.z0 - 0.01, TRIM, [x0 - 0.03, D.h / 2, (D.z0 + D.z1) / 2]), 'door to the basement stair')); g.add(tag(ball(0.028, STEEL, [x0 + 0.03, 0.95, D.z0 + 0.08]), 'door to the basement stair'));
  for (const z of [D.z0 - 0.03, D.z1 + 0.03]) g.add(tag(box(0.03, D.h + 0.06, 0.06, TRIM, [x0 + 0.015, (D.h + 0.06) / 2, z]), 'door to the basement stair'));
  g.add(tag(box(0.03, 0.06, D.z1 - D.z0 + 0.12, TRIM, [x0 + 0.015, D.h + 0.03, (D.z0 + D.z1) / 2]), 'door to the basement stair'));
  for (const z of [HALL.z0 - 0.03, HALL.z1 + 0.03]) g.add(tag(box(0.03, HALL.h + 0.06, 0.06, TRIM, [x1 - 0.015, (HALL.h + 0.06) / 2, z]), 'hall doorway'));
  g.add(tag(box(0.03, 0.06, HALL.z1 - HALL.z0 + 0.12, TRIM, [x1 - 0.015, HALL.h + 0.03, (HALL.z0 + HALL.z1) / 2]), 'hall doorway'));
  g.add(tag(box(1.2, 0.04, 1.6, LINO, [x1 + T + 0.6, -0.02, (HALL.z0 + HALL.z1) / 2]), 'hall')); g.add(tag(box(0.05, h, 1.6, { grey: 0.5, col: 0x6e6a5e }, [x1 + T + 1.2, h / 2, (HALL.z0 + HALL.z1) / 2]), 'hall'));
  // window: frame, meeting rail, two sashes of glass, the outside
  { const y0 = W.sill, y1 = W.sill + W.h, xa = W.x - W.w / 2, xb = W.x + W.w / 2, f = W.frame, zc = W.z - 0.05;
    for (const y of [y0 - f / 2, y1 + f / 2]) g.add(tag(box(W.w + 2 * f, f, W.depth, TRIM, [W.x, y, zc]), 'window (over the sink)'));
    for (const x of [xa - f / 2, xb + f / 2]) g.add(tag(box(f, W.h, W.depth, TRIM, [x, (y0 + y1) / 2, zc]), 'window (over the sink)'));
    g.add(tag(box(W.w, 0.035, 0.04, TRIM, [W.x, (y0 + y1) / 2, zc]), 'window (over the sink)'));
    g.add(tag(box(W.w + 0.2, 0.03, 0.12, TRIM, [W.x, y0 - 0.015, W.z + 0.05]), 'window sill'));
    g.add(tag(box(6, 5, 0.05, day ? { grey: 0.97, col: 0xfff6e0, emit: 0xfff2d8, emitI: 1.4, flatEmit: 0.98, noCast: true } : { grey: 0.12, col: 0x05070c, noCast: true }, [W.x, 1.5, W.z - 0.9]), day ? 'daylight outside' : 'night outside')); }
  return g;
}

function furniture(shot) {
  const g = new THREE.Group(); const { z0 } = ROOM, C = COUNTER, day = shot.light === 'day';
  // counter run, sink, backsplash, upper cabinets, range, refrigerator and the counter items: all fixed (kitchen.js, r4)
  g.add(kitchen());
  // china cabinet: base cupboard, carcass, shelves with dishes, glazed doors (one glass quad = the reflection pane)
  const K = CABINET, kd = K.x1 - K.x0, kc = (K.z0 + K.z1) / 2, kw = K.z1 - K.z0, G = K.glass;
  g.add(tag(box(kd, K.baseH, kw, WOOD_D, [(K.x0 + K.x1) / 2, K.baseH / 2, kc]), 'china cabinet'));
  g.add(tag(box(0.02, K.h - K.baseH, kw, WOOD_D, [K.x1 - 0.01, (K.h + K.baseH) / 2, kc]), 'china cabinet')); g.add(tag(box(kd, 0.04, kw + 0.04, WOOD_D, [(K.x0 + K.x1) / 2, K.h + 0.02, kc]), 'china cabinet'));
  for (const z of [K.z0 + 0.01, K.z1 - 0.01]) g.add(tag(box(kd, K.h - K.baseH, 0.02, WOOD_D, [(K.x0 + K.x1) / 2, (K.h + K.baseH) / 2, z]), 'china cabinet'));
  for (const y of K.shelves) { g.add(tag(box(kd - 0.06, 0.02, kw - 0.04, WOOD, [(K.x0 + K.x1) / 2 + 0.02, y, kc]), 'cabinet shelves'));
    for (let k = 0; k < 4; k++) g.add(tag(cyl(0.07, 0.04, 0.05 + (k % 2) * 0.05, WHITE, [K.x0 + 0.2, y + 0.035 + (k % 2) * 0.025, K.z0 + 0.14 + k * 0.24], null, 14), 'dishes')); }
  // door frames around the glass: stiles and rails, centre stile between the two doors
  for (const z of [G.z0 - 0.02, G.z1 + 0.02, kc]) g.add(tag(box(0.022, G.y1 - G.y0 + 0.08, 0.04, WOOD_D, [K.x0 + 0.011, (G.y0 + G.y1) / 2, z]), 'cabinet door frames'));
  for (const y of [G.y0 - 0.02, G.y1 + 0.02]) g.add(tag(box(0.022, 0.04, G.z1 - G.z0 + 0.08, WOOD_D, [K.x0 + 0.011, y, kc]), 'cabinet door frames'));
  const glass = quad(glassCorners().map((p) => V(p[0] - 0.003, p[1], p[2])), shot.mirror ? { grey: 0.25, col: 0x1c2026, noCast: true } : { glass: true, col: 0x9fb0b8, opacity: 0.14, noCast: true });
  g.add(tag(glass, 'cabinet glass (the reflection)'));
  // table, chairs
  const T = TABLE; g.add(tag(box(T.w, T.t, T.d, WOOD, [T.c[0], T.h - T.t / 2, T.c[1]]), 'kitchen table'));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(tag(box(0.05, T.h - T.t, 0.05, WOOD, [T.c[0] + sx * (T.w / 2 - 0.07), (T.h - T.t) / 2, T.c[1] + sz * (T.d / 2 - 0.07)]), 'kitchen table'));
  const chairs = { ...CHAIRS, ...(day ? { right: OUTRO.motherChair } : {}), ...(shot.chairs || {}) };
  for (const [k, c] of Object.entries(chairs)) if (c) g.add(tag(kitchenChair([c[0], c[1]], c[2], WOOD_D, { seatTop: SEAT }), k === 'jade' ? 'chair (Jade’s)' : k === 'right' && day ? 'chair (Mother’s, pulled out)' : 'chair'));
  // pendant lamp
  const P = PENDANT, on = !day;
  g.add(tag(cyl(0.004, 0.004, ROOM.h - P.shadeTop, DARK, [P.x, (ROOM.h + P.shadeTop) / 2, P.z], null, 6), 'pendant lamp'));
  const shade = mk(new THREE.CylinderGeometry(P.rTop, P.rBottom, P.shadeTop - P.shadeBottom, 24, 1, true), { grey: 0.7, col: 0xb8a070 }); shade.position.set(P.x, (P.shadeTop + P.shadeBottom) / 2, P.z); shade.userData.double = true; shade.castShadow = false; g.add(tag(shade, 'pendant lamp'));
  g.add(tag(ball(0.035, { grey: 0.9, col: 0xfff0d0, emit: on ? 0xffd9a0 : undefined, emitI: 2.5, flatEmit: 0.97 }, [P.x, P.bulbY, P.z]), on ? 'pendant bulb (the beam source)' : 'pendant bulb (off)'));
  // the paper she writes on (night scene)
  if (shot.paper) { const m = box(PAPER.w, 0.0012, PAPER.h, { grey: 0.97, col: 0xf2efe4 }, PAPER.c); m.rotation.y = rad(PAPER.yaw); g.add(tag(m, 'paper: “it was correct”')); }
  // (r4) K1: her homework (Jade), an open workbook (INVENTED: a softcover math workbook, blue cover, printed rows);
  // the right-hand page as she sits is centred on PAPER.c, where her pencil hand goes
  // (hold pass 2026-11-26) pushed 4 cm away from her (cz), so its near edge clears her forearms (the hold check found her
  // right forearm 8 mm into the page)
  // (hold pass 2026-11-26) a thin softcover workbook opened flat: 1 mm cover, 2 mm of pages a side (was 4 + 4 mm with
  // the pages tipped 1.7 deg, so the printed rows floated or sank and her wrist went into the book); page top TABLE.h + 3 mm
  if (shot.homework) { const pw = 0.2, ph = 0.27, cx = PAPER.c[0] + pw / 2, cz = PAPER.c[2] + 0.04, y = TABLE.h;
    g.add(tag(box(2 * pw + 0.012, 0.001, ph + 0.01, { grey: 0.42, col: 0x3d5f8f }, [cx, y + 0.0005, cz]), 'homework (open workbook)'));
    for (const s of [-1, 1]) { const m = box(pw, 0.002, ph, { grey: 0.96, col: 0xf4f1e6 }, [cx + s * pw / 2, y + 0.002, cz]); g.add(tag(m, 'homework (open workbook)'));
      for (let k = 0; k < 7; k++) g.add(tag(box(pw * 0.72, 0.0002, 0.004, { grey: 0.55, col: 0x8a8a8a }, [cx + s * pw / 2, y + 0.0031, cz + ph / 2 - 0.035 - k * 0.032]), 'homework (printed rows)')); }
    g.add(tag(box(0.05, 0.012, 0.022, { grey: 0.85, col: 0xe8a8a8 }, [cx + pw + 0.06, y + 0.006, cz - 0.08]), 'eraser (pink)')); }
  return g;
}
const paperCorners = () => { const a = rad(PAPER.yaw), c = Math.cos(a), s = Math.sin(a), P = (dx, dz) => V(PAPER.c[0] + dx * c + dz * s, PAPER.c[1] + 0.001, PAPER.c[2] - dx * s + dz * c);
  return [P(-PAPER.w / 2, -PAPER.h / 2), P(PAPER.w / 2, -PAPER.h / 2), P(PAPER.w / 2, PAPER.h / 2), P(-PAPER.w / 2, PAPER.h / 2)]; };   // TL,TR,BR,BL as she reads it (she sits at -z, facing +z)

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const day = shot.light === 'day';
  root.add(room(shot)); const furn = furniture(shot); root.add(furn);
  const extra = (t) => (t === 'mote' ? V(MOTE) : t === 'paper' ? V(PAPER.c) : null);
  const { figs } = stage(shot.figs, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  if (shot.pencil && figs[shot.pencil]) { // (2026-11-25) held in the pinch, resting in the web of the thumb, slanting back over the hand; tip on the paper
    const P = figs[shot.pencil].userData.P, h = P.hands.R; const pinch = P.indexR.clone().add(P.thumbR).multiplyScalar(0.5);
    const d = h.f.clone().multiplyScalar(-0.75).addScaledVector(h.t, 0.45).addScaledVector(h.n, -0.2).add(V(0, 0.55, 0)).normalize();
    // (hold pass 2026-11-26) shot.pencilFit { el, az, s, s2 } (shots.js PENCIL_FIT): the pencil leans el deg up toward
    // azimuth az (0 = +z, 270 = -x) and crosses the pinch s m along index-thumb and s2 m across, so the fingertips carry it
    // (fitted with engine/holdcheck.mjs); its tip (a 3.5 mm capsule end) touches the top of the page / sheet
    const F = shot.pencilFit; if (F) { if (F.az != null) { const e = rad(F.el), a = rad(F.az); d.set(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)); }   // (r6) az null: keep the hand-frame lean (back over the web of the thumb)
      const it = P.indexR.clone().sub(P.thumbR).normalize(), w2 = it.clone().cross(d).normalize();
      if (F.pads) { // hold pass 2: the axis runs through the middle between the two pad SURFACES (the pinch opens to the pencil's
        // gap less the squeeze), square to the thumb-index line, so both pads press it
        const ri = h.capsules.find((c) => c.part === 'index3').r, rt = h.capsules.find((c) => c.part === 'thumb2').r, D = P.indexR.distanceTo(P.thumbR);
        pinch.copy(P.thumbR).addScaledVector(it, rt + (D - ri - rt) / 2); d.addScaledVector(it, -d.dot(it)).normalize(); }
      pinch.addScaledVector(it, F.s).addScaledVector(w2, F.s2); }
    const tipY = (shot.homework ? TABLE.h + 0.003 : PAPER.c[1] + 0.0006) + 0.0035;   // shots.js PAGE_TOP / SHEET_TOP
    const tip = pinch.clone().addScaledVector(d, -(pinch.y - tipY) / Math.max(d.y, 0.2));
    root.add(tag(limb(tip, tip.clone().addScaledVector(d, 0.17), 0.0035, { grey: 0.75, col: 0xd9b23a }), 'pencil')); }
  // beam guides: label mode = outline of the lit volume / footprint; lit preview = the volume itself
  const GL = { grey: 0.1, col: 0x2040ff, only: ['label'], noCast: true };
  const wc = windowCorners(), ends = wc.map(sunHit);
  const yUp = Math.min((ROOM.z1 - WINDOW.z) * (-SUN.dir[1] / SUN.dir[2]) - WINDOW.sill, WINDOW.h);   // the part of the window whose light reaches the floor before the front wall
  if (day) { root.add(tag(hexa(wc, ends, { glass: true, col: SUN.color, opacity: 0.07, noCast: true, noRecv: true }), 'sun shaft'));
    for (let i = 0; i < 4; i++) root.add(tag(polyline([wc[i], ends[i]], 0.004, GL), 'sun shaft (edge)'));
    root.add(tag(polyline([ends[2], ends[3], sunHit([wc[3][0], wc[3][1] + yUp, wc[3][2]]), sunHit([wc[2][0], wc[2][1] + yUp, wc[2][2]])].map((p) => [p[0], 0.006, p[2]]), 0.006, GL, true), 'sun patch on the floor'));
    root.add(tag(ball(0.006, { grey: 1, col: 0xffffff, emit: 0xffffff, emitI: 2, flatEmit: 1, only: ['label', 'lit'], noCast: true }, MOTE), 'THE MOTE (anchor)')); }
  else { const ring = (y, r) => polyline(Array.from({ length: 40 }, (_, k) => [PENDANT.x + r * Math.cos(k * Math.PI / 20), y, PENDANT.z + r * Math.sin(k * Math.PI / 20)]), 0.005, GL, true);
    root.add(tag(ring(PENDANT.shadeBottom, PENDANT.rBottom), 'pendant cut-off (shade rim)'));
    const cone = mk(new THREE.ConeGeometry(BEAM_NIGHT.radiusAt(0), PENDANT.bulbY, 40, 1, true), { glass: true, col: BEAM_NIGHT.color, opacity: 0.05, noCast: true, noRecv: true }); cone.position.set(PENDANT.x, PENDANT.bulbY / 2, PENDANT.z); cone.userData.double = true; root.add(tag(cone, 'pendant cone')); }
  hideLabels(root, shot.hide);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  // lights
  const sunFrom = V(WINDOW.x, WINDOW.sill + WINDOW.h / 2, WINDOW.z).addScaledVector(V(SUN.dir), -5);
  const lights = [{ name: 'pendant', kind: LIGHTS.pendant.kind, pos: V(BEAM_NIGHT.apex), aim: V(PENDANT.x, 0, PENDANT.z), color: '#ffc98a', on: !day },
    { name: 'sun', kind: LIGHTS.sun.kind, pos: sunFrom, aim: V(WINDOW.x, WINDOW.sill + WINDOW.h / 2, WINDOW.z), color: '#fff0d0', on: day }];
  // post-sweep 2026-11-26: per-shot lit-pass lift (office91's per-shot exposure, here shot.litLift because shot.light is
  // 'day' / 'night'): `key` scales the sun / pendant, `amb` the fill. Lit pass only.
  const LK = mode0 => (mode0 === 'lit' ? { key: shot.litLift?.key ?? 1, amb: shot.litLift?.amb ?? 1 } : { key: 1, amb: 1 });
  const rig = (mode) => { const L = []; if (mode === 'none' || shot.beamMask) return L; const white = mode !== 'lit'; const X = LK(mode);
    if (day) { const d = new THREE.DirectionalLight(white ? 0xffffff : SUN.color, mode === 'lit' ? 3.2 * X.key : 2.0); d.position.copy(sunFrom); d.target.position.copy(sunFrom).add(V(SUN.dir)); d.castShadow = true;
      const c = d.shadow.camera; c.left = -3.2; c.right = 3.2; c.top = 3.2; c.bottom = -3.2; c.near = 0.5; c.far = 14; d.shadow.radius = 2; L.push(d); }
    else { const s = new THREE.SpotLight(white ? 0xffffff : BEAM_NIGHT.color, mode === 'lit' ? 9 * X.key : 2.0, 0, rad(BEAM_NIGHT.halfAngleDeg), 0.25, mode === 'lit' ? 1.3 : 0);
      s.position.set(...BEAM_NIGHT.apex); s.target.position.set(PENDANT.x, 0, PENDANT.z); s.castShadow = true; s.shadow.camera.near = 0.12; s.shadow.camera.far = 6; s.shadow.radius = mode === 'lit' ? 5 : 2; L.push(s); }
    if (mode === 'mask') return L;
    L.push(new THREE.AmbientLight(white ? 0xffffff : (day ? 0x8a94a8 : 0x141018), white ? 1.25 : (day ? 0.55 : 1.0) * X.amb));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, 0.6); d.position.set(1, 3, 2.5); L.push(d); }
    return L; };
  const W = WINDOW, ym = W.sill + W.h / 2, P3 = (x, y) => V(x, y, W.z);
  const panes = { window_upper: [P3(W.x - W.w / 2, W.sill + W.h), P3(W.x + W.w / 2, W.sill + W.h), P3(W.x + W.w / 2, ym), P3(W.x - W.w / 2, ym)], window_lower: [P3(W.x - W.w / 2, ym), P3(W.x + W.w / 2, ym), P3(W.x + W.w / 2, W.sill), P3(W.x - W.w / 2, W.sill)],
    cabinet_glass: glassCorners().map((p) => V(p)) };
  if (shot.paper) panes.paper = paperCorners();
  for (const k of ['window_upper', 'window_lower']) root.add(tag(quad(panes[k], { glass: true, col: day ? 0xfff6e0 : 0x202838, opacity: day ? 0.2 : 0.3, noCast: true }), 'window glass'));
  // mirror
  let mirror = null;
  if (shot.mirror) { const n = V(GLASS.n), d = n.dot(V(GLASS.x, 1, 0)), R = mirrorMatrix(n, d), cs = glassCorners().map((p) => V(p)); const meshes = []; furn.traverse((o) => { if (o.isMesh && o.userData.label === 'cabinet glass (the reflection)') meshes.push(o); });
    const quadPx = (cm) => cs.map((v) => { const p = v.clone().project(cm); return [(p.x + 1) / 2 * 1920, (1 - p.y) / 2 * 1080]; });
    mirror = { R, meshes, clipPlane: new THREE.Plane(n.clone().negate(), d - 0.03), quadPx,
      report: (cm, P) => { const out = { pane: 'cabinet_glass', plane: 'x = ' + GLASS.x, normal: GLASS.n, reflected_faces: {} };
        for (const [w, f] of Object.entries(figs)) { const Hr = f.userData.P.eyes.clone().applyMatrix4(R), px = P(Hr); out.reflected_faces[w] = { px, world: r3(Hr), inside_glass: pointInQuad(px, quadPx(cm)),
          faces_the_glass_deg: +(Math.acos(THREE.MathUtils.clamp(f.userData.P.headFwd.dot(V(1, 0, 0)), -1, 1)) * 180 / Math.PI).toFixed(0) }; }
        return out; } }; }
  const extraOut = (c, P) => { const pt = (p) => ({ world: r3(p), px: P(V(p)) });
    const out = { time: shot.time || null, position: shot.position || null, scene: day ? 'day (outro)' : 'night (verse 2 / interlude)',
      beam: day ? { name: BEAM_DAY.name, model: 'parallel shaft: the window opening extruded along dir until it meets floor or wall', color: '#fff0d0', dir: r3(SUN.dir), elevation_deg: SUN.elevationDeg,
          source_corners: wc.map(pt), end_corners: ends.map(pt), corner_order: 'TL,TR,BR,BL of the window seen from inside', note: BEAM_DAY.note,
          section_at_child_z: shaftAt(OUTRO.child[1]).map(pt), mote: { ...pt(MOTE), in_shaft: inShaft(MOTE) },
          heads_in_shaft: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, inShaft(f.userData.P.eyes.toArray())])) }
        : { name: BEAM_NIGHT.name, model: 'cone straight down from the bulb, cut off by the shade rim', color: '#ffc98a', apex: pt(BEAM_NIGHT.apex), axis: BEAM_NIGHT.axis, half_angle_deg: BEAM_NIGHT.halfAngleDeg,
          cutoff_plane_y: PENDANT.shadeBottom, radius_on_table_m: +BEAM_NIGHT.radiusAt(TABLE.h).toFixed(2), radius_on_floor_m: +BEAM_NIGHT.radiusAt(0).toFixed(2), note: BEAM_NIGHT.note,
          heads_in_cone: Object.fromEntries(Object.entries(figs).map(([w, f]) => { const e = f.userData.P.eyes; return [w, e.y < PENDANT.shadeBottom && Math.hypot(e.x - PENDANT.x, e.z - PENDANT.z) < BEAM_NIGHT.radiusAt(e.y)]; })) } };
    if (!day && figs.dad && figs.mama90) { const m = figs.dad.userData.P.mouth, e = figs.mama90.userData.P.earR;   // (r4) the whisper: Dad's mouth at Mama's right ear
      out.whisper = { dad_mouth: pt(m), mama_earR: pt(e), gap_m: +m.distanceTo(e).toFixed(3) }; }
    return out; };
  // the mask twin (beam_<id>): white = the lit volume of the scene's one light, everything else black.
  //   day:   the window opening swept along SUN.dir to the floor / front wall / right wall
  //   night: the pendant's cone below the shade rim, to the floor and walls; under the table top only what falls outside it
  if (shot.beamMask) { const walls = [{ n: [0, -1, 0], d: 0.015 }, { n: [-1, 0, 0], d: -ROOM.x0 }, { n: [1, 0, 0], d: ROOM.x1 }, { n: [0, 0, -1], d: -ROOM.z0 }, { n: [0, 0, 1], d: ROOM.z1 }];
    applyBeamMask(root, day ? [beamSolid({ aperture: windowCorners(), dir: SUN.dir, clip: walls })]
      : splitAtTop((clip) => coneSolid({ apex: BEAM_NIGHT.apex, axis: BEAM_NIGHT.axis, halfAngleDeg: BEAM_NIGHT.halfAngleDeg, start: PENDANT.bulbY - PENDANT.shadeBottom, length: 9, clip: [...walls, ...clip] }),
        { x0: TABLE.c[0] - TABLE.w / 2, x1: TABLE.c[0] + TABLE.w / 2, z0: TABLE.c[1] - TABLE.d / 2, z1: TABLE.c[1] + TABLE.d / 2, y: TABLE.h }), { label: day ? 'sun shaft (mask)' : 'pendant cone (mask)', cam, surfaceOnly: !!shot.beamSurf }); }
  const built = { set: 'kitchen90', scene, root, cam, rig, near: shot.near ?? 0.2, far: shot.far ?? 7, figs, book: null, panes, lights, header: shot.header || '', shadowLine: false, shadowPolys: null,
    subject: V(shot.subject || (day ? [OUTRO.child[0], 1.1, OUTRO.child[1]] : [TABLE.c[0], 0.9, TABLE.c[1] - 0.4])), flatBg: shot.beamMask ? 0x000000 : day ? 0xe8e4d8 : 0x6a6a6a, litBg: day ? 0x2a2c30 : 0x020203, extra: extraOut };
  if (mirror && !shot.beamMask) built.mirror = mirror;   // the mask is of the direct light only
  return built;
}
