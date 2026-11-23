// Build one basement90 shot: room (from layout.js) + desk, computer, swivel chair + figures + the screen-light rig.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, slab, tag, V, rad } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { prismSolid, applyBeamMask } from '../_beam.js';
import { HOUSE, ROOM, DESK, PC, SCREEN, screenPoint, screenCorners, TEXT, WORD, WORD_P, CHAIR, spokePoint, FEET, PROPS, BEAM, beamFar, deskTerminator, LIGHTS } from './layout.js';
import { wall, hexa, polyline, swivelChair, r3, hideLabels } from './kit.js';

const CONC = { grey: 0.62, col: 0x77756f }, BLOCK = { grey: 0.7, col: 0x8a8880 }, WOOD = { grey: 0.5, col: 0x6b5236 }, WOOD_D = { grey: 0.36, col: 0x4a3826 };
const BEIGE = { grey: 0.8, col: 0xc9c2ad }, DARK = { grey: 0.2, col: 0x222226 }, CARD = { grey: 0.6, col: 0x9a7c55 };

function room() {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h } = ROOM, T = ROOM.wallT, K = HOUSE.kitchen, FTF = HOUSE.floorToFloor, TALL = FTF + 2.3;
  g.add(tag(box(x1 - x0 + 2 * T, 0.1, z1 - z0 + 2 * T, CONC, [(x0 + x1) / 2, -0.05, (z0 + z1) / 2]), 'concrete slab'));
  const W = ROOM.hopper;
  g.add(wall({ axis: 'z', at: z0, a0: x0 - T, a1: x1 + T, y1: TALL, t: T, out: -1, holes: [{ a0: W.x - W.w / 2, a1: W.x + W.w / 2, y0: W.y0, y1: W.y1 }], look: BLOCK, label: 'back wall (block)' }));
  g.add(wall({ axis: 'z', at: z1, a0: x0 - T, a1: x1 + T, y1: TALL, t: T, out: 1, look: BLOCK, label: 'front wall (block)' }));
  g.add(wall({ axis: 'x', at: x0, a0: z0, a1: z1, y1: TALL, t: T, out: -1, look: BLOCK, label: 'outer wall (beside the stair)' }));
  g.add(wall({ axis: 'x', at: x1, a0: z0, a1: z1, y1: TALL, t: T, out: 1, look: BLOCK, label: 'right wall (block)' }));
  // hopper window: frame, dark glass, night beyond
  g.add(tag(box(W.w + 0.08, 0.04, 0.1, WOOD_D, [W.x, W.y0 - 0.02, z0 - 0.05]), 'hopper window (night)')); g.add(tag(box(W.w + 0.08, 0.04, 0.1, WOOD_D, [W.x, W.y1 + 0.02, z0 - 0.05]), 'hopper window (night)'));
  g.add(tag(box(W.w, W.y1 - W.y0, 0.01, { grey: 0.15, col: 0x05070c, noCast: true }, [W.x, (W.y0 + W.y1) / 2, z0 - 0.12]), 'hopper window (night)'));
  // the kitchen floor above: subfloor over x K.x0..K.x1, joists along z hanging below it
  g.add(tag(box(K.x1 - K.x0, 0.04, z1 - z0, WOOD_D, [(K.x0 + K.x1) / 2, h + 0.02, (z0 + z1) / 2]), 'subfloor (kitchen floor above)'));
  const J = ROOM.joist; for (let x = K.x0 + 0.1; x < K.x1; x += J.spacing) g.add(tag(box(J.w, J.d, z1 - z0, WOOD, [x, h - J.d / 2, (z0 + z1) / 2]), 'floor joists'));
  g.add(tag(box(0.14, 0.24, z1 - z0, WOOD_D, [K.x0 + 0.07, h - 0.12, (z0 + z1) / 2]), 'beam at the stair opening'));
  // the stair strip: the kitchen wall above the opening (with the stair door), landing, open-riser flight, handrail
  const D = HOUSE.stairDoor, S = HOUSE.stair, L = HOUSE.landing;
  g.add(wall({ axis: 'x', at: K.x0, a0: z0, a1: z1, y0: h, y1: TALL, t: 0.12, out: 1, holes: [{ a0: D.z0, a1: D.z1, y0: FTF, y1: FTF + D.h }], look: { grey: 0.74, col: 0x8f8778 }, label: 'kitchen wall above (stair door)' }));
  g.add(tag(box(L.x1 - L.x0, 0.05, L.z1 - L.z0, WOOD, [(L.x0 + L.x1) / 2, FTF - 0.025, (L.z0 + L.z1) / 2]), 'stair landing (kitchen level)'));
  g.add(tag(box(x1 - x0 + 2 * T, 0.05, z1 - z0 + 2 * T, { grey: 0.3, col: 0x2a2620, noCast: true }, [(x0 + x1) / 2, TALL, (z0 + z1) / 2]), 'stairwell ceiling'));
  const sw = S.x1 - S.x0, sx = (S.x0 + S.x1) / 2, zEnd = S.zTop - (S.risers - 1) * S.tread;
  for (let k = 1; k < S.risers; k++) g.add(tag(box(sw - 0.08, 0.04, S.tread + 0.02, WOOD, [sx, FTF - k * S.rise - 0.02, S.zTop - (k - 0.5) * S.tread]), 'basement stair (open risers)'));
  for (const xs of [S.x0 + 0.02, S.x1 - 0.02]) g.add(tag(slab(V(xs, FTF - 0.13, S.zTop + 0.05), V(xs, -0.02, zEnd - 0.1), 0.24, 0.04, V(0, 0, 1).applyAxisAngle(V(1, 0, 0), 0), WOOD_D), 'stair stringers'));
  g.add(tag(slab(V(S.x1 - 0.02, FTF + 0.9, S.zTop), V(S.x1 - 0.02, 0.9 + S.rise, zEnd), 0.045, 0.045, V(1, 0, 0), WOOD), 'handrail'));
  for (const k of [0, 5, S.risers - 1]) g.add(tag(box(0.04, 0.9 + S.rise, 0.04, WOOD, [S.x1 - 0.02, FTF - k * S.rise + (0.9 - S.rise) / 2 + S.rise / 2, S.zTop - k * S.tread]), 'handrail'));
  // lally column, bare bulb (off)
  g.add(tag(cyl(ROOM.column.r, ROOM.column.r, h - 0.24, { grey: 0.4, col: 0x5a2f28 }, [ROOM.column.x, (h - 0.24) / 2, ROOM.column.z], null, 14), 'steel column'));
  g.add(tag(box(0.2, 0.24, z1 - z0, WOOD_D, [ROOM.column.x, h - 0.12, (z0 + z1) / 2]), 'main beam'));
  const B = ROOM.bulb; g.add(tag(cyl(0.004, 0.004, B.drop, DARK, [B.x, h - J.d - B.drop / 2, B.z], null, 6), 'bare bulb (off)'));
  g.add(tag(ball(0.032, { grey: 0.8, col: 0x8a8a80 }, [B.x, h - J.d - B.drop - 0.03, B.z], [1, 1.3, 1]), 'bare bulb (off)'));
  g.add(tag(cyl(0.0025, 0.0025, 0.5, DARK, [B.x + 0.03, h - J.d - B.drop - 0.3, B.z], null, 6), 'bare bulb (off)'));
  return g;
}

function screenTexture() { // label mode only: rows of code as grey bars (no invented text), THE WORD boxed, its gold underline
  const c = document.createElement('canvas'); c.width = 810; c.height = 600; const g = c.getContext('2d');
  g.fillStyle = '#16307a'; g.fillRect(0, 0, 810, 600); g.fillStyle = '#c8d8ff';
  for (let i = 0; i < TEXT.lines; i++) { const y = (TEXT.top + i * TEXT.pitch) * 600, ind = [0, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 0, 0, 1][i] * 40; let x = TEXT.left * 810 + ind;
    for (let k = 0; k < 6; k++) { const w = 40 + ((i * 7 + k * 13) % 5) * 22; if (x + w > 760) break; if (!(i === 6 && x + w > WORD.u0 * 810 - 12 && x < WORD.u1 * 810 + 12)) g.fillRect(x, y - 24, w, 16); x += w + 14; if ((i + k) % 4 === 3) break; } }
  g.fillStyle = '#ffffff'; g.fillRect(WORD.u0 * 810, (WORD.v - TEXT.pitch) * 600 + 13, (WORD.u1 - WORD.u0) * 810, 16);
  g.fillStyle = '#e8b030'; g.fillRect(WORD.u0 * 810 - 4, WORD.v * 600 - 3, (WORD.u1 - WORD.u0) * 810 + 8, 6);
  return new THREE.CanvasTexture(c);
}

function furniture(shot) {
  const g = new THREE.Group(); const D = DESK;
  // desk: top, drawer pedestal (right), two legs (left), modesty panel at the back
  g.add(tag(box(D.x1 - D.x0, D.t, D.z1 - D.z0, WOOD, [(D.x0 + D.x1) / 2, D.top - D.t / 2, (D.z0 + D.z1) / 2]), 'desk'));
  g.add(tag(box(D.x1 - D.pedestalX0 - 0.02, D.top - D.t, D.z1 - D.z0 - 0.06, WOOD_D, [(D.x1 + D.pedestalX0) / 2, (D.top - D.t) / 2, (D.z0 + D.z1) / 2]), 'desk drawers'));
  for (let k = 0; k < 3; k++) g.add(tag(box(0.12, 0.015, 0.02, DARK, [(D.x1 + D.pedestalX0) / 2, 0.16 + k * 0.2, D.z1 - 0.02]), 'desk drawers'));
  for (const z of [D.z0 + 0.04, D.z1 - 0.04]) g.add(tag(box(D.leg, D.top - D.t, D.leg, WOOD_D, [D.x0 + 0.04, (D.top - D.t) / 2, z]), 'desk legs (open side)'));
  g.add(tag(box(D.pedestalX0 - D.x0, D.top - D.t - D.modesty.y0, 0.018, WOOD_D, [(D.x0 + D.pedestalX0) / 2, (D.top - D.t + D.modesty.y0) / 2, D.z0 + 0.03]), 'desk'));
  // computer
  const C = PC.case, M = PC.monitor, x = PC.x, zc = C.zBack + C.d / 2;
  g.add(tag(box(C.w, C.h, C.d, BEIGE, [x, D.top + C.h / 2, zc]), 'computer (desktop case)'));
  g.add(tag(box(0.15, 0.012, 0.004, DARK, [x + 0.1, D.top + C.h * 0.62, C.zBack + C.d + 0.002]), 'floppy drive')); g.add(tag(box(0.15, 0.012, 0.004, DARK, [x + 0.1, D.top + C.h * 0.3, C.zBack + C.d + 0.002]), 'floppy drive'));
  g.add(tag(cyl(0.09, 0.11, M.foot, BEIGE, [x, D.top + C.h + M.foot / 2, zc], null, 16), 'CRT monitor'));
  const my = D.top + C.h + M.foot + M.h / 2;
  g.add(tag(box(M.w, M.h, M.d * 0.45, BEIGE, [x, my, C.zBack + M.d - M.d * 0.225]), 'CRT monitor'));
  g.add(tag(box(M.w * 0.72, M.h * 0.78, M.d * 0.55, BEIGE, [x, my, C.zBack + M.d * 0.275 + 0.0]), 'CRT monitor'));
  const on = shot.light?.screen !== false, sc = screenCorners().map((p) => V(p));
  g.add(tag(quad(sc, { grey: on ? 0.95 : 0.2, col: 0x101830, emit: on ? BEAM.color : undefined, emitI: 1.5, flatEmit: 0.96, hide: ['label'], noCast: true }), 'screen (the beam source)'));
  g.add(tag(quad(sc, { grey: 0.9, map: screenTexture(), only: ['label'], noCast: true }), 'screen (the beam source)'));
  g.add(tag(polyline([...screenCorners()].map((p) => [p[0], p[1], p[2] + 0.0005]), 0.0015, { grey: 0.3, col: 0x30343c, noCast: true }, true), 'screen glass edge'));
  // THE WORD: a sliver proud of the glass, in every mode (the gold underline is drawn under it by the renderer)
  { const a = screenPoint(WORD.u0, WORD.v - TEXT.pitch * 0.82, 0.0012), b = screenPoint(WORD.u1, WORD.v - TEXT.pitch * 0.12, 0.0012);
    g.add(tag(box(b[0] - a[0], a[1] - b[1], 0.0008, { grey: 1, col: 0xffffff, emit: 0xdfe8ff, emitI: 1.6, flatEmit: 1, noCast: true }, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2]]), 'THE WORD (the one he missed)')); }
  const KB = PC.keyboard; g.add(tag(box(KB.w, KB.h, KB.d, BEIGE, [x, D.top + KB.h / 2, KB.z], [6, 0, 0]), 'keyboard'));
  const PR = PC.printer; g.add(tag(box(PR.w, PR.h, PR.d, BEIGE, [PR.x, D.top + PR.h / 2, PR.z]), 'dot-matrix printer'));
  g.add(tag(box(PR.w * 0.62, 0.3, 0.004, { grey: 0.95, col: 0xe8e4d8 }, [PR.x, D.top + PR.h + 0.1, PR.z - 0.07], [-22, 0, 0]), 'fanfold paper'));
  g.add(tag(box(0.24, 0.05, 0.28, { grey: 0.95, col: 0xe8e4d8 }, [PR.x, 0.025, D.z1 + 0.25]), 'fanfold paper'));
  g.add(tag(box(0.1, 0.1, 0.14, DARK, [D.x0 + 0.18, D.top + 0.05, D.z0 + 0.22], [0, -20, 0]), 'box of floppy disks'));
  // storage
  const S = PROPS.shelf; for (const y of S.shelves) g.add(tag(box(S.d, 0.03, S.z1 - S.z0, { grey: 0.45, col: 0x55585c }, [S.x, y, (S.z0 + S.z1) / 2]), 'steel shelving'));
  for (const z of [S.z0, S.z1]) for (const dx of [-S.d / 2, S.d / 2]) g.add(tag(box(0.03, S.h, 0.03, { grey: 0.45, col: 0x55585c }, [S.x + dx, S.h / 2, z]), 'steel shelving'));
  for (const [k, y] of S.shelves.entries()) for (let j = 0; j < 3; j++) if ((k + j) % 3 !== 2) g.add(tag(box(0.3, 0.26 + ((k + j) % 2) * 0.08, 0.3, CARD, [S.x, y + 0.015 + (0.26 + ((k + j) % 2) * 0.08) / 2, S.z0 + 0.22 + j * 0.38]), 'boxes'));
  for (const [bx, bz, w, hh, d, yaw, y = 0] of PROPS.boxes) { const b = box(w, hh, d, CARD, [bx, y + hh / 2, bz]); b.rotation.y = rad(yaw); g.add(tag(b, 'boxes')); }
  const H = PROPS.heater; g.add(tag(cyl(H.r, H.r, H.h, { grey: 0.85, col: 0xb8b8b0 }, [H.x, H.h / 2 + 0.05, H.z]), 'water heater')); g.add(tag(cyl(0.04, 0.04, ROOM.h - H.h, { grey: 0.5, col: 0x70706c }, [H.x, H.h + (ROOM.h - H.h) / 2, H.z], null, 10), 'water heater'));
  const WS = PROPS.washer; g.add(tag(box(WS.w, WS.h, WS.d, { grey: 0.9, col: 0xd0d0cc }, [WS.x, WS.h / 2, WS.z]), 'washing machine')); g.add(tag(box(WS.w, 0.14, 0.08, { grey: 0.9, col: 0xd0d0cc }, [WS.x, WS.h + 0.07, WS.z + WS.d / 2 - 0.04]), 'washing machine'));
  return g;
}

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(room()); root.add(furniture(shot));
  const chairSpec = { at: CHAIR.at, seatYaw: CHAIR.seatYaw, spoke0: CHAIR.spoke0, ...(shot.chair || {}) };
  root.add(swivelChair(CHAIR, chairSpec));
  const extra = (t) => (t === 'word' ? V(WORD_P) : t === 'screen' ? V(SCREEN.c) : null);
  const { figs } = stage(shot.figs, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  // the lit volume (lit preview only) and its cut on the floor (label mode only)
  const far = beamFar(), term = deskTerminator(0), wAt = (z) => SCREEN.w / 2 + Math.tan(rad(BEAM.halfAngleDeg)) * (z - SCREEN.c[2]);
  const sc = screenCorners(); root.add(tag(hexa([sc[1], sc[0], sc[3], sc[2]], far, { glass: true, col: BEAM.color, opacity: 0.05, noCast: true, noRecv: true }), 'beam volume'));
  const G = { grey: 0.1, col: 0x2040ff, only: ['label'], noCast: true };
  const lineAt = (z) => [[Math.max(SCREEN.c[0] - wAt(z), ROOM.x0 + 0.02), 0.006, z], [Math.min(SCREEN.c[0] + wAt(z), ROOM.x1 - 0.02), 0.006, z]];
  root.add(tag(polyline(lineAt(term.umbra), 0.006, G), 'beam: desk shadow ends (penumbra starts)')); root.add(tag(polyline(lineAt(term.full), 0.006, G), 'beam: floor fully lit from here'));
  hideLabels(root, shot.hide);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  const on = shot.light?.screen !== false, Lp = V(LIGHTS.screen.pos), La = V(LIGHTS.screen.aim);
  const lights = [{ name: 'screen', kind: LIGHTS.screen.kind, pos: Lp, aim: La, color: '#' + BEAM.color.toString(16).padStart(6, '0'), on }];
  const rig = (mode) => { const L = []; if (mode === 'none' || shot.beamMask) return L; const white = mode !== 'lit';
    if (on) { const s = new THREE.SpotLight(white ? 0xffffff : BEAM.color, mode === 'lit' ? 5 : 2.0, 0, rad(BEAM.halfAngleDeg + 8), 0.45, mode === 'lit' ? 1.5 : 0);
      s.position.copy(Lp); s.target.position.copy(La); s.castShadow = true; s.shadow.camera.near = 0.03; s.shadow.camera.far = 8; s.shadow.radius = mode === 'lit' ? 6 : 2; L.push(s);
      if (mode === 'lit') { const p = new THREE.PointLight(BEAM.color, 0.35, 1.2, 1.6); p.position.copy(Lp).add(V(0, 0, 0.12)); L.push(p); } }
    if (mode === 'mask') return L;
    L.push(new THREE.AmbientLight(white ? 0xffffff : LIGHTS.dark.color, white ? 1.25 : 1.2));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, 0.7); d.position.set(1, 3, 2.5); L.push(d); }
    return L; };
  const panes = { screen: screenCorners().map((p) => V(p)) };
  const extraOut = (c, P) => { const pt = (p) => ({ world: r3(p), px: P(V(p)) }); const J = figs.jade7?.userData.P;
    const out = { time: shot.time || null, position: shot.position || null,
      beam: { name: BEAM.name, model: 'area source (the screen rectangle), radiating into +z; frustum spreading by half_angle from the rectangle, faded out at range', color: lights[0].color, on,
        source_corners: screenCorners().map(pt), corner_order: 'TL,TR,BR,BL as the screen is read', axis: BEAM.axis, half_angle_deg: BEAM.halfAngleDeg, range_m: BEAM.range, falloff: BEAM.falloff,
        far_rect: far.map(pt), light_point_world: r3(Lp),
        floor: { desk_shadow_ends_z: term.umbra, fully_lit_from_z: term.full, lines: [lineAt(term.umbra), lineAt(term.full)].map((l) => l.map(pt)), note: 'the desk top cuts the light: floor nearer the desk than desk_shadow_ends_z, and everything under the desk, is unlit' } },
      word: { centre: pt(WORD_P), underline: [pt(screenPoint(WORD.u0, WORD.v, 0.001)), pt(screenPoint(WORD.u1, WORD.v, 0.001))], note: 'gold underline goes here (renderer layer)' },
      chair: { hub: pt([chairSpec.at[0], CHAIR.spokeTop, chairSpec.at[1]]), spoke_tips: [0, 1, 2, 3, 4].map((k) => pt(spokePoint(k, CHAIR.spokeR, chairSpec.at, chairSpec.spoke0))), feet_stand_at: [pt(FEET.front), pt(FEET.back)] } };
    if (J && shot.contacts) out.contacts = shot.contacts.map(([part, target]) => { const a = J[part], b = target === 'word' ? V(WORD_P) : V(target); return { a: 'jade7:' + part, b: target, distance_cm: +(a.distanceTo(b) * 100).toFixed(1) }; });
    return out; };
  // the mask twin (beam_<id>): the screen's frustum (screen rectangle -> beamFar(), clipped by the room) white, everything
  // else black. Over the desk's width the desk top cuts it: nothing below the plane through the top of the screen and the
  // desk's front edge is lit (deskTerminator's umbra line), so the kneehole and the floor by the desk stay black.
  if (shot.beamMask && on) { const top = SCREEN.c[1] + SCREEN.h / 2, sz = SCREEN.c[2], a = DESK.z1 - sz, b = top - DESK.top;
    const roomC = [{ n: [0, -1, 0], d: 0.015 }, { n: [0, 1, 0], d: ROOM.h }, { n: [-1, 0, 0], d: -ROOM.x0 }, { n: [1, 0, 0], d: ROOM.x1 }, { n: [0, 0, 1], d: ROOM.z1 }];
    const fr = (clip) => prismSolid({ from: [sc[1], sc[0], sc[3], sc[2]], to: far, clip: [...roomC, ...clip] });
    applyBeamMask(root, [fr([{ n: [-1, 0, 0], d: -DESK.x0 }, { n: [1, 0, 0], d: DESK.x1 }, { n: [0, -a, -b], d: -a * DESK.top - b * DESK.z1 }]), fr([{ n: [1, 0, 0], d: DESK.x0 }]), fr([{ n: [-1, 0, 0], d: -DESK.x1 }])].filter((s) => s.faces.length >= 4), { label: 'screen glow (mask)', cam, surfaceOnly: !!shot.beamSurf }); }
  else if (shot.beamMask) applyBeamMask(root, [], { cam });
  return { set: 'basement90', scene, root, cam, rig, near: shot.near ?? 0.2, far: shot.far ?? 7, figs, book: null, panes, lights, header: shot.header || '', shadowLine: false, shadowPolys: null,
    subject: V(shot.subject || [0.45, 1.1, -1.15]), litBg: 0x010103, flatBg: shot.beamMask ? 0x000000 : undefined, extra: extraOut };
}
