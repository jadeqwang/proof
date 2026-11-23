// Build one attic88 shot: room (from layout.js) + figures + book + light rig for each render mode.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, slab, tag, V, rad, UP, textTexture, limb } from '../../engine/core.js';
import { stage, casterMeshes, projectShadow, solveCamera, hideParts, namedPoint } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { ROOM, roofY, WINDOW, SIGN, DOOR, STAIRWELL, MATS, PILLOW, PROPS, KITCHEN, LIGHTS } from './layout.js';
import { signV3, signSpec, neonSource, hooksV3, hookPoint, bookStack } from './v3.js';
import { coverBlanket, cardOverPage, handShadows } from '../../engine/props.js';
import { projectOutline, spreadUV, hull } from '../../engine/stage.js';
import { pushEnd, levelRoll } from '../../engine/lap.js';
import { buildBody } from '../../engine/body.js';
import { matsAndPillows, textbooks4, piano4, quilt4, fallenWorld } from './v4.js';

const WOOD = { grey: 0.45, col: 0x5a3f2a }, WOOD_D = { grey: 0.32, col: 0x3d2a1c }, FLOOR = { grey: 0.55, col: 0x6a4a30 };
const PLASTER = { grey: 0.7, col: 0x8a7f72 }, ROOF = { grey: 0.38, col: 0x4a3a2c };
const FABRIC = (g, c) => ({ grey: g, col: c });

function room(shot) {
  const g = new THREE.Group(); const { x0, x1, z0, z1, knee, ridge } = ROOM;
  const slopeLen = Math.hypot(z1, ridge - knee), slopeAng = Math.atan2(ridge - knee, z1);
  // floorboards along x, with gaps; cracks over the kitchen are wider and glow from below
  const B = ROOM.board; let z = z0; let i = 0;
  while (z < z1 - 0.01) {
    const w = Math.min(B.w, z1 - z), cz = z + w / 2;
    const overKitchen = cz > KITCHEN.z0 && cz < KITCHEN.z1;
    const gapW = overKitchen && i % 2 === 0 ? B.crack : B.gap;
    // boards are in random lengths along x; joints stagger
    let x = x0; let k = 0;
    while (x < x1 - 0.01) { const L = Math.min(x1 - x, 1.4 + ((i * 7 + k * 3) % 5) * 0.45); g.add(tag(box(L - 0.004, B.t, w - gapW, FLOOR, [x + L / 2, -B.t / 2, z + (w - gapW) / 2]), 'floorboards')); x += L; k++; }
    if (overKitchen && i % 2 === 0) { // the lit crack: an emissive strip under the gap, only where the kitchen is
      const s = box(KITCHEN.x1 - KITCHEN.x0, B.t * 0.9, gapW * 0.9, { grey: 0.9, col: 0xffa24a, emit: LIGHTS.floor.color, emitI: 1.6, flatEmit: 0.95, noRecv: true }, [(KITCHEN.x0 + KITCHEN.x1) / 2, -B.t / 2 - 0.0015, z + w - gapW / 2]);
      g.add(tag(s, 'light through floorboard cracks'));
    }
    z += w; i++;
  }
  g.add(box(x1 - x0 + 2, 0.01, z1 - z0 + 2, { grey: 0.05, col: 0x050302, noCast: true }, [0, -B.t - 0.03, 0])); // the void below
  // roof planes (inside faces) and knee walls
  for (const s of [-1, 1]) {
    const roofM = box(x1 - x0, 0.02, slopeLen, ROOF, [0, (knee + ridge) / 2 + 0.01, s * z1 / 2]); roofM.rotation.x = s * slopeAng; g.add(tag(roofM, 'sloped ceiling (roof boards)'));
    g.add(tag(box(x1 - x0, knee, 0.03, WOOD_D, [0, knee / 2, s * (z1 + 0.015)]), 'knee wall'));
    // rafters, every 0.6 m, under the roof boards
    const R = ROOM.rafter;
    for (let x = x0 + 0.3; x < x1 - 0.1; x += R.spacing) {
      const a = new THREE.Vector3(x, knee - 0.02, s * z1), b = new THREE.Vector3(x, ridge, 0);
      const nrm = new THREE.Vector3(0, Math.cos(slopeAng), -s * Math.sin(slopeAng)); // into the room (down-ish)
      const ra = slab(a.clone().addScaledVector(nrm, -R.d / 2), b.clone().addScaledVector(nrm, -R.d / 2), R.w, R.d, new THREE.Vector3(1, 0, 0), WOOD);
      g.add(tag(ra, 'rafters'));
    }
    // purlin at mid-slope
    const pz = s * z1 * 0.5, py = roofY(pz) - 0.17; g.add(tag(box(x1 - x0, 0.12, 0.1, WOOD_D, [0, py, pz]), 'purlin'));
  }
  // ridge beam + collar ties
  g.add(tag(box(x1 - x0, 0.18, 0.08, WOOD_D, [0, ridge - 0.09, 0]), 'ridge beam'));
  const cz = ROOM.z1 * (1 - (ROOM.collarY - knee) / (ridge - knee));
  for (let x = x0 + 0.3, k = 0; x < x1 - 0.1; x += ROOM.rafter.spacing, k++) if (k % 2 === 1) g.add(tag(box(0.05, 0.12, 2 * cz + 0.1, WOOD, [x, ROOM.collarY, 0]), 'collar ties'));
  // gable walls with openings: built from vertical strips clipped to the roof line
  const gable = (xw, holes, label) => { // one extruded shape with rectangular holes (no seams in line mode)
    const sh = new THREE.Shape(); sh.moveTo(z0, 0); sh.lineTo(z1, 0); sh.lineTo(z1, knee); sh.lineTo(0, ridge); sh.lineTo(z0, knee); sh.lineTo(z0, 0);
    for (const h of holes) { const p = new THREE.Path(); p.moveTo(h.z0, h.y0 + 1e-3); p.lineTo(h.z0, h.y1); p.lineTo(h.z1, h.y1); p.lineTo(h.z1, h.y0 + 1e-3); p.lineTo(h.z0, h.y0 + 1e-3); sh.holes.push(p); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false });
    const m = mk(geo, PLASTER); // map shape (sx, sy, sz) -> world (x = xw + 0.06 - sz, y = sy, z = sx)
    m.matrixAutoUpdate = false; m.matrix.set(0, 0, -1, xw + 0.06, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
    g.add(tag(m, label));
  };
  const W = WINDOW;
  gable(ROOM.x1 + 0.06, [{ z0: W.z - W.w / 2, z1: W.z + W.w / 2, y0: W.sill, y1: W.sill + W.h }], 'right gable wall');
  gable(ROOM.x0 - 0.06, [{ z0: DOOR.z - DOOR.w / 2, z1: DOOR.z + DOOR.w / 2, y0: 0.003, y1: DOOR.h }], 'left gable wall');
  // window frame, mullions, sill
  { const wx = W.x, y0 = W.sill, y1 = W.sill + W.h, za = W.z - W.w / 2, zb = W.z + W.w / 2, f = W.frame, FR = { grey: 0.6, col: 0x6b5b48 };
    const fr = [box(W.depth, f, W.w + 2 * f, FR, [wx, y0 - f / 2, W.z]), box(W.depth, f, W.w + 2 * f, FR, [wx, y1 + f / 2, W.z]),
      box(W.depth, W.h, f, FR, [wx, (y0 + y1) / 2, za - f / 2]), box(W.depth, W.h, f, FR, [wx, (y0 + y1) / 2, zb + f / 2]),
      box(0.05, W.mullion, W.w, FR, [wx + 0.03, (y0 + y1) / 2, W.z]), box(0.05, W.h, W.mullion, FR, [wx + 0.03, (y0 + y1) / 2, W.z]),
      box(0.2, 0.03, W.w + 0.16, FR, [wx - 0.05, y0 - f - 0.015, W.z])];
    fr.forEach((m) => g.add(tag(m, 'window')));
  }
  // stair door: frame + leaf hinged at +z side, opening outward over the stairwell (toward -x)
  { const D = DOOR, FR = { grey: 0.5, col: 0x5a4632 };
    g.add(tag(box(0.14, 0.06, D.w + 0.12, FR, [D.x, D.h + 0.03, D.z]), 'stair door'));
    g.add(tag(box(0.14, D.h, 0.06, FR, [D.x, D.h / 2, D.z - D.w / 2 - 0.03]), 'stair door'));
    g.add(tag(box(0.14, D.h, 0.06, FR, [D.x, D.h / 2, D.z + D.w / 2 + 0.03]), 'stair door'));
    const open = shot.light?.door ?? 0; const ang = rad(D.maxDeg * open);
    const leaf = new THREE.Group(); leaf.position.set(D.x - 0.07, 0, D.z + D.w / 2); leaf.rotation.y = ang; // swings out over the stairwell (-x)
    leaf.add(box(0.035, D.h - 0.01, D.w - 0.01, { grey: 0.42, col: 0x4e3b28 }, [0, (D.h - 0.01) / 2, -D.w / 2]));
    leaf.add(ball(0.025, { grey: 0.2, col: 0x8a7a50 }, [0.03, 1.0, -D.w + 0.08]));
    g.add(tag(leaf, 'stair door'));
    // the stairwell beyond: landing, steps down, lit walls
    const S = STAIRWELL, warm = { grey: 0.92, col: 0xd9a46a, emit: 0xffb468, emitI: open > 0 ? 0.9 : 0.0, flatEmit: 0.9 };
    const lx0 = -4.3, lx1 = D.x - 0.07;
    g.add(tag(box(lx1 - lx0, 0.03, S.z1 - S.z0, { grey: 0.5, col: 0x6a4a30 }, [(lx0 + lx1) / 2, -0.015, 0]), 'stair landing'));
    g.add(tag(box(0.02, 4.0, S.z1 - S.z0, warm, [S.x0, 0.4, 0]), 'stairwell (lit)'));
    for (const zz of [S.z0, S.z1]) g.add(tag(box(lx1 - S.x0, 4.0, 0.02, { ...warm, emitI: warm.emitI * 0.6 }, [(lx1 + S.x0) / 2, 0.4, zz]), 'stairwell (lit)'));
    g.add(tag(box(lx1 - S.x0, 0.02, S.z1 - S.z0, { ...warm, emitI: warm.emitI * 0.4 }, [(lx1 + S.x0) / 2, 2.45, 0]), 'stairwell (lit)'));
    for (let k = 1; k < 7; k++) g.add(tag(box(0.24, 0.03, S.z1 - S.z0 - 0.04, { grey: 0.5, col: 0x6a4a30 }, [lx0 - 0.12 - 0.22 * (k - 1), -0.19 * k, 0]), 'stairs down'));
    g.add(tag(ball(0.05, { grey: 1, col: 0xfff0d0, emit: 0xffe0a0, emitI: open > 0 ? 3 : 0.1 }, S.bulb), 'stairwell bulb'));
  }
  let signInfo = null;
  if (shot.v3) { signInfo = signV3(g, shot); hooksV3(g, shot); } else
  // the neon sign outside: bracket frame + lettering box (lettering itself only in label mode)
  { const S = SIGN, on = shot.light?.neon !== 'off'; const col = shot.light?.neon === 'blue' ? S.blue : S.red;
    const sx = S.x;
    g.add(tag(box(0.06, S.h + 0.1, 0.04, { grey: 0.25, col: 0x222222 }, [sx + 0.08, S.y, S.z - S.w / 2]), 'neon sign frame'));
    g.add(tag(box(0.06, S.h + 0.1, 0.04, { grey: 0.25, col: 0x222222 }, [sx + 0.08, S.y, S.z + S.w / 2]), 'neon sign frame'));
    g.add(tag(box(0.04, 0.04, S.w, { grey: 0.25, col: 0x222222 }, [sx + 0.08, S.y + S.h / 2 + 0.05, S.z]), 'neon sign frame'));
    g.add(tag(box(1.2, 0.05, 0.05, { grey: 0.25, col: 0x222222 }, [sx - 0.55, S.y + S.h / 2 + 0.05, S.z - 0.6]), 'neon sign bracket'));
    g.add(tag(box(1.2, 0.05, 0.05, { grey: 0.25, col: 0x222222 }, [sx - 0.55, S.y + S.h / 2 + 0.05, S.z + 0.6]), 'neon sign bracket'));
    // lettering box (glows in lit; plain box in line/flat/depth)
    g.add(tag(box(0.03, S.h * 0.8, S.w * 0.92, { grey: on ? 0.95 : 0.3, col: 0x221010, emit: on ? col : undefined, emitI: 1.6, flatEmit: on ? 0.97 : 0.35, hide: ['label'] }, [sx, S.y, S.z]), 'neon sign (lettering box)'));
    // lettering, label mode only: read from the street, so it shows mirror-reversed from inside
    const tex = textTexture([{ text: S.text[0], font: 'bold 92px DejaVu Sans, sans-serif' }, { text: S.text[1], font: 'bold 150px Droid Sans Fallback, sans-serif' }], { w: 1400, h: 520, fg: '#d0140a', bg: '#f4e8e0' });
    const zA = S.z + S.w * 0.46, zB = S.z - S.w * 0.46, yA = S.y + S.h * 0.4, yB = S.y - S.h * 0.4;
    const q = quad([V(sx - 0.02, yA, zA), V(sx - 0.02, yA, zB), V(sx - 0.02, yB, zB), V(sx - 0.02, yB, zA)], { grey: 0.9, map: tex, only: ['label'] });
    g.add(tag(q, 'neon sign: CHIN. IND. SPEC. REST. 酒家 (reversed)'));
    // street-side backdrop far beyond (dark), so the window never shows a void
    g.add(tag(box(0.1, 6, 12, { grey: 0.12, col: 0x0a0c14, noCast: true }, [sx + 6, 1, 0]), 'night outside'));
  }
  // window glass (lit only): four panes
  const panes = {}; { const W2 = WINDOW, x = W2.x - 0.01, y0 = W2.sill, y1 = W2.sill + W2.h, ym = (y0 + y1) / 2, za = W2.z - W2.w / 2, zb = W2.z + W2.w / 2;
    // as seen from inside looking +x: left = -z ... right = +z? camera looking +x has right = +z
    const P = (z, y) => V(x, y, z);
    panes.window_TL = [P(za, y1), P(W2.z, y1), P(W2.z, ym), P(za, ym)]; panes.window_TR = [P(W2.z, y1), P(zb, y1), P(zb, ym), P(W2.z, ym)];
    panes.window_BL = [P(za, ym), P(W2.z, ym), P(W2.z, y0), P(za, y0)]; panes.window_BR = [P(W2.z, ym), P(zb, ym), P(zb, y0), P(W2.z, y0)];
    for (const c of Object.values(panes)) { const m = quad(c, { glass: true, col: 0x9a9080, opacity: 0.18, noCast: true }); g.add(tag(m, 'window glass (dusty)')); }
  }
  return { g, panes, signInfo };
}

function props(shot) {
  const g = new THREE.Group();
  if (shot.v4) { matsAndPillows(g); textbooks4(g, shot.textbooks4 || 'stack'); piano4(g); } else
  for (const [who, M] of Object.entries(MATS)) {
    const cx = (M.x0 + M.x1) / 2, cz = (M.z0 + M.z1) / 2;
    g.add(tag(box(M.x1 - M.x0, M.t, M.z1 - M.z0, FABRIC(0.8, 0x9a8f78), [cx, M.t / 2, cz]), `sleeping mat (${who === 'mama' ? 'Mama' : 'little Jade'})`));
    const pil = shot.pillow?.[who] ?? {};
    const p = box(PILLOW.w, PILLOW.t, PILLOW.d, FABRIC(0.9, 0xd8d0c0), [cx + (pil.dx || 0), M.t + PILLOW.t / 2, M.z0 + 0.22 + (pil.dz || 0)]); p.rotation.y = rad(pil.yaw ?? (who === 'mama' ? 4 : -6)); p.scale.set(1, 1, 1);
    g.add(tag(p, 'pillow'));
  }
  if (shot.v4) {} else if (shot.textbooks) bookStack(g, shot.textbooks); else
  // textbooks
  { const [x, z] = PROPS.textbooks.at; let y = 0;
    for (let k = 0; k < PROPS.textbooks.n; k++) { const t = 0.022 + (k % 3) * 0.008, w = 0.19 + (k % 2) * 0.03, d = 0.26 - (k % 3) * 0.02;
      const b = box(w, t, d, FABRIC(0.3 + (k % 4) * 0.12, [0x3a5a7a, 0x7a3a2a, 0x4a6a3a, 0xa08a50][k % 4]), [x + ((k * 13) % 5 - 2) * 0.006, y + t / 2, z]); b.rotation.y = rad(((k * 37) % 21) - 10); g.add(tag(b, 'stack of textbooks')); y += t; } }
  // piano-keys printout: two A4 sheets, 2 octaves, black keys printed
  if (!shot.v4) { const { at: [x, z], yaw, w, d } = PROPS.piano; const grp = new THREE.Group(); grp.position.set(x, 0.001, z); grp.rotation.y = rad(yaw);
    grp.add(box(w, 0.0008, d, { grey: 0.98, col: 0xf0ece0, recvShadowLine: false }, [0, 0.0004, 0]));
    const n = 14, kw = w / n; for (let k = 1; k < n; k++) grp.add(box(0.0015, 0.0011, d * 0.96, { grey: 0.15, col: 0x222222 }, [-w / 2 + k * kw, 0.0006, 0]));
    const blk = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]; for (const k of blk) grp.add(box(kw * 0.6, 0.0012, d * 0.58, { grey: 0.08, col: 0x111111 }, [-w / 2 + (k + 1) * kw, 0.0007, -d * 0.21]));
    g.add(tag(grp, 'paper piano keys (printout)')); }
  // small CRT TV on a crate, switched off
  { const T = PROPS.tv, [x, z] = T.at, grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = rad(T.yaw);
    const [cw, ch, cd] = T.crate; for (const s of [-1, 1]) grp.add(box(0.02, ch, cd, WOOD, [s * (cw / 2 - 0.01), ch / 2, 0]));
    for (let k = 0; k < 3; k++) grp.add(box(cw, 0.06, 0.02, WOOD, [0, 0.05 + k * 0.1, cd / 2 - 0.01]));
    grp.add(box(cw, 0.02, cd, WOOD, [0, ch - 0.01, 0]));
    const [tw, th, td] = T.tv; grp.add(box(tw, th, td * 0.6, { grey: 0.35, col: 0x3a3a3a }, [0, ch + th / 2, -td * 0.1]));
    grp.add(box(tw * 0.6, th * 0.7, td * 0.4, { grey: 0.3, col: 0x2e2e2e }, [0, ch + th / 2, -td * 0.5]));
    grp.add(box(tw * 0.72, th * 0.68, 0.01, { grey: 0.12, col: 0x101418 }, [-tw * 0.06, ch + th / 2 + 0.01, td * 0.2 + 0.002]));
    grp.add(cyl(0.012, 0.012, 0.3, { grey: 0.2, col: 0x333333 }, [0.05, ch + th + 0.14, -td * 0.1], [0, 0, 25], 8));
    grp.add(cyl(0.012, 0.012, 0.3, { grey: 0.2, col: 0x333333 }, [-0.05, ch + th + 0.14, -td * 0.1], [0, 0, -25], 8));
    g.add(tag(grp, 'small TV (off) on a crate')); }
  for (const [x, z, w, h, d, yaw, y = 0] of PROPS.boxes) { const b = box(w, h, d, { grey: 0.6, col: 0x9a7c55 }, [x, y + h / 2, z]); b.rotation.y = rad(yaw); g.add(tag(b, 'storage boxes')); }
  for (const [x, z, yaw] of PROPS.sacks) { const s = ball(0.24, { grey: 0.72, col: 0xc9bc9a }, [x, 0.2, z], [1, 0.85, 0.75]); s.rotation.y = rad(yaw); g.add(tag(s, 'rice sacks'));
    g.add(tag(cyl(0.06, 0.1, 0.12, { grey: 0.72, col: 0xc9bc9a }, [x, 0.42, z]), 'rice sacks')); }
  { const B = PROPS.bulb; g.add(tag(cyl(0.004, 0.004, B.drop, { grey: 0.1, col: 0x111111 }, [B.x, ROOM.ridge - 0.18 - B.drop / 2, B.z], null, 6), 'bare bulb (off)'));
    g.add(tag(ball(0.035, { grey: 0.8, col: 0x9a9a8a }, [B.x, ROOM.ridge - 0.18 - B.drop - 0.03, B.z], [1, 1.3, 1]), 'bare bulb (off)')); }
  return g;
}

// blankets: { who, mode: 'legs' (over the sitter's legs) | 'flat' (on the mat) | 'folded' (at the foot) | 'tucked' }
function blanket(spec, figs) {
  const M = MATS[spec.mat || spec.who]; const BL = FABRIC(0.66, spec.who === 'mama' ? 0x7a5a6a : 0x5a7a8a);
  if (!M) return null;
  if (spec.mode === 'legs' && figs[spec.who]) {
    const P = figs[spec.who].userData.P; const a = P.hip.clone().addScaledVector(P.fwd, 0.06), b = P.ankleL.clone().add(P.ankleR).multiplyScalar(0.5).addScaledVector(P.fwd, 0.14);
    a.y = b.y = Math.max(P.kneeL.y, P.kneeR.y, P.footL.y, P.footR.y) + 0.04; const d = b.clone().sub(a);
    const m = box(0.5 * (P.H > 1.3 ? 1.3 : 1), 0.03, d.length() + 0.1, BL, a.clone().addScaledVector(d, 0.5).toArray()); m.rotation.y = Math.atan2(d.x, d.z);
    const fall = box(0.5 * (P.H > 1.3 ? 1.3 : 1), 0.02, 0.6, BL, a.clone().addScaledVector(d, 1.0).addScaledVector(P.fwd, 0.1).setY(MATS.littleJade.t + 0.02).toArray()); fall.rotation.y = m.rotation.y;
    return tag(new THREE.Group().add(m, fall), 'blanket');
  }
  const cx = (M.x0 + M.x1) / 2;
  if (spec.mode === 'pull' && figs[spec.who]) return coverBlanket(figs[spec.who].userData.P, M.t, BL, { upTo: spec.upTo ?? 0.8 }).group;   // v3
  if (spec.mode === 'aside') { const m = box(M.x1 - M.x0 - 0.12, 0.13, 0.24, BL, [cx - 0.02, M.t + 0.065, M.z0 + 0.52]); m.rotation.y = rad(-6); return tag(m, 'blanket (pushed back)'); }   // v3
  if (spec.mode === 'heap') { const m = box(M.x1 - M.x0 - 0.16, 0.12, 0.2, BL, [cx + 0.02, M.t + 0.06, M.z1 - 0.13]); m.rotation.y = rad(5); return tag(m, 'blanket (pushed to the foot)'); }   // v3
  if (spec.mode === 'cover' && figs[spec.who]) { // over a lying body, chest to feet, draped to the mat
    const P = figs[spec.who].userData.P; const a = P.chest.clone(), b = P.ankleL.clone().add(P.ankleR).multiplyScalar(0.5);
    const top = Math.max(P.chest.y, P.hip.y, P.kneeL.y, P.kneeR.y, P.footL.y) + 0.06; a.y = b.y = top; const d = b.clone().sub(a); const len = d.length() + 0.25;
    const ang = Math.atan2(d.x, d.z), mid = a.clone().addScaledVector(d, 0.5).addScaledVector(d.clone().normalize(), 0.08);
    // a soft mound: a flattened capsule along the body, its lower half sunk into the mat
    const g = new THREE.Group(); const hgt = top - M.t;
    const cap = mk(new THREE.CapsuleGeometry(0.3, Math.max(len - 0.6, 0.1), 8, 20), BL); cap.rotation.set(Math.PI / 2, 0, 0);
    const holder = new THREE.Group(); holder.position.copy(mid).setY(M.t); holder.rotation.y = ang; holder.scale.set(1, hgt / 0.3, 1); holder.add(cap); g.add(holder);
    return tag(g, 'blanket');
  }
  if (spec.mode === 'folded') return tag(box(M.x1 - M.x0 - 0.1, 0.09, 0.4, BL, [cx, M.t + 0.045, M.z1 - 0.3]), 'blanket (folded)');
  // flat: covering the lower two-thirds of the mat, slightly rumpled
  const g = new THREE.Group(); g.add(box(M.x1 - M.x0 + 0.06, 0.035, (M.z1 - M.z0) * 0.62, BL, [cx, M.t + 0.018, M.z1 - (M.z1 - M.z0) * 0.31]));
  g.add(box(M.x1 - M.x0 + 0.04, 0.06, 0.16, BL, [cx, M.t + 0.03, M.z1 - (M.z1 - M.z0) * 0.62]));
  return tag(g, 'blanket');
}

export function build(shot, ctx) { return shot.v3 ? buildV3(shot, ctx) : buildV1(shot, ctx); }
function buildV1(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const { g: roomG, panes } = room(shot); root.add(roomG); root.add(props(shot));
  const neonP = V(LIGHTS.neon.pos);
  // set targets: 'neon' (the light), 'ray:<point>:<d>' = d metres from a point toward the neon (where a hand must be
  // for its shadow to land on that point)
  const extra = (t, figs, book) => {
    if (t === 'neon') return neonP.clone();
    if (t.startsWith('ray:')) { const parts = t.split(':'); const d = Number(parts.pop()); const name = parts.slice(1).join(':');
      let p; try { p = namedPoint(name, figs, book); } catch (e) { return null; }
      return p.clone().addScaledVector(neonP.clone().sub(p).normalize(), d); }
    return null;
  };
  const { figs, book } = stage(shot.figs, shot.book, extra);
  if (shot.hide) root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) o.visible = false; });
  for (const f of Object.values(figs)) root.add(f);
  if (shot.hide) for (const f of Object.values(figs)) if (shot.hide.includes(f.name)) f.visible = false;
  if (book) root.add(book.group);
  for (const b of shot.blankets || [{ who: 'mama', mode: 'folded' }, { who: 'littleJade', mode: 'flat' }]) { const m = blanket(b, figs); if (m) root.add(m); }
  Object.assign(shot, solveCamera(shot, figs, book, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  // lights
  const neonState = shot.light?.neon ?? 'red'; const neonCol = neonState === 'blue' ? SIGN.blue : SIGN.red;
  const neonPos = V(LIGHTS.neon.pos); const neonAim = V(shot.light?.neonAim || [1.6, 0.25, -1.0]);
  const door = shot.light?.door ?? 0; const floorOn = shot.light?.floor ?? true;
  const lightList = [
    { name: 'neon', kind: 'spot (sign through window)', pos: neonPos, aim: neonAim, color: '#' + neonCol.toString(16).padStart(6, '0'), on: neonState !== 'off' },
    { name: 'stair_door', kind: 'spot (tungsten through door)', pos: V(STAIRWELL.bulb), aim: V([0.5, 0, 0]), color: '#ffb468', on: door > 0 },
    { name: 'floor_cracks', kind: 'lines of tungsten from below', pos: V([(KITCHEN.x0 + KITCHEN.x1) / 2, 0, (KITCHEN.z0 + KITCHEN.z1) / 2]), color: '#ffa24a', on: floorOn },
  ];
  const rig = (mode) => {
    const L = [];
    if (mode === 'none') return L;
    const white = mode !== 'lit';
    if (neonState !== 'off') {
      const s = new THREE.SpotLight(white ? 0xffffff : neonCol, mode === 'lit' ? (shot.light?.neonI ?? 14) : mode === 'mask' ? 6 : 2.6, 0, rad(46), mode === 'lit' ? 0.35 : 0.15, mode === 'lit' ? 1.3 : 0);
      s.position.copy(neonPos); s.target.position.copy(neonAim); s.castShadow = true; s.shadow.camera.near = 0.3; s.shadow.camera.far = 12; s.shadow.radius = mode === 'lit' ? 4 : 1; L.push(s);
      if (mode === 'lit') { const p = new THREE.PointLight(neonCol, 0.5, 4, 1.5); p.position.set(WINDOW.x - 0.3, WINDOW.sill + 0.3, WINDOW.z); L.push(p); }
    }
    if (mode === 'mask') return L;
    if (door > 0) {
      const s = new THREE.SpotLight(white ? 0xffffff : 0xffb468, mode === 'lit' ? 22 : 1.6, 0, rad(60), 0.3, mode === 'lit' ? 1.4 : 0);
      s.position.set(STAIRWELL.bulb[0] - 0.2, STAIRWELL.bulb[1], STAIRWELL.bulb[2]); s.target.position.set(0.5, 0, 0); s.castShadow = true; s.shadow.camera.near = 0.2; s.shadow.camera.far = 12; L.push(s);
    }
    if (floorOn) for (const [x, z] of [[-1.5, 0.6], [0.2, 1.2], [1.4, 0.0], [2.4, 0.9]]) {
      const p = new THREE.PointLight(white ? 0xffffff : 0xffa24a, mode === 'lit' ? 0.25 : 0.06, 1.4, 1.2); p.position.set(x, 0.35, z); L.push(p);
    }
    L.push(new THREE.AmbientLight(white ? 0xffffff : 0x2a3560, mode === 'lit' ? (shot.light?.amb ?? 0.5) : 1.7));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, 1.1); d.position.set(1, 3, 2); L.push(d); }
    return L;
  };
  // the real hand shadow: project the caster meshes from the neon onto the spread, export polygons
  let shadowPolys = null;
  if (shot.shadow && book && book.pages) {
    const meshes = shot.shadow.casters.flatMap((c) => casterMeshes(c, figs));
    const sp = projectShadow(neonPos, meshes, book);
    const toPx = (v) => { const p = v.clone().project(cam); return [+((p.x + 1) / 2 * 1920).toFixed(1), +((1 - p.y) / 2 * 1080).toFixed(1)]; };
    shadowPolys = { light: 'neon', receiver: 'storybook spread', uv: sp.uv, px: sp.world.map((poly) => poly.map(toPx)), bbox: sp.bbox,
      note: `convex hull of each caster part (${shot.shadow.casters.join(', ')}) projected from the neon (${neonPos.toArray().join(', ')}) onto the spread plane; uv 0..1 across the spread, v down` };
  }
  return { set: 'attic88', scene, root, cam, rig, near: shot.near ?? 0.3, far: shot.far ?? 8, figs, book, panes, lights: lightList,
    header: shot.header || '', shadowLine: !!shot.shadow, shadowPolys, subject: shot.subject ? V(shot.subject) : (book ? book.at : null), litBg: 0x020204 };
}

// ---------------------------------------------------------------- v3
// Differences from v1: the blade sign (its effective light point is computed per shot from what the subject can see of
// it through the window), hooks, cut-out cards for the hand-shadow monkey, push-end cameras, richer sidecar.
function buildV3(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const { g: roomG, panes, signInfo } = room(shot); root.add(roomG); root.add(props(shot));
  const S = signSpec(shot);
  let src = neonSource(S, V(shot.light?.neonAim || [2.4, 0.35, -1.55])), neonP = src.pos; let cards = [];
  const extra = (t, figs, book) => {
    if (t === 'neon') return neonP.clone();
    if (t.startsWith('hook:')) return hookPoint(+t.slice(5));
    if (t.startsWith('fallen:')) { const [px, pz] = fallenWorld(+t.slice(7)); return V(px, 0.05, pz); }   // v4: a fallen textbook
    if (t.startsWith('card:')) { const [, i, part] = t.split(':'); const c = cards[+i]; if (!c) return V(2.4, 0.5, -1.5); return (part === 'centre' ? c.centre : c.base).clone(); }
    if (t.startsWith('ray:')) { const parts = t.split(':'); const d = Number(parts.pop()); const name = parts.slice(1).join(':');
      let p; try { p = namedPoint(name, figs, book); } catch (e) { return null; }
      return p.clone().addScaledVector(neonP.clone().sub(p).normalize(), d); }
    if (t.startsWith('lift:')) { // 'lift:<book anchor>:<h>': h metres above the page (perpendicular), on the ray to the neon: its shadow lands on the anchor
      const parts = t.split(':'); const hgt = Number(parts.pop()); if (!book || !book.pages) return null;
      const p = parts[1] === 'page' ? book.pageAt(parts[2], Number(parts[3]), Number(parts[4])) : book.anchors[parts[1]].clone(); const dir = neonP.clone().sub(p).normalize();   // 'lift:page:L:<0 gutter..1 outer>:<0 bottom..1 top>:<h>'
      return p.addScaledVector(dir, hgt / Math.max(dir.dot(book.n), 0.05)); }
    return null;
  };
  const SO = shot.v4 ? { builder: buildBody } : {};
  let { figs, book } = stage(shot.figs, shot.book, extra, SO);
  const mkCards = () => (shot.cards || []).map((c) => cardOverPage(c, book, neonP));
  if (book && book.pages) { src = neonSource(S, book.at); neonP = src.pos; cards = mkCards(); ({ figs, book } = stage(shot.figs, shot.book, extra, SO)); src = neonSource(S, book.at); neonP = src.pos; cards = mkCards(); ({ figs, book } = stage(shot.figs, shot.book, extra, SO)); }
  if (shot.hide) root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) o.visible = false; });
  for (const f of Object.values(figs)) root.add(f);
  if (book) root.add(book.group);
  for (const c of cards) root.add(c.mesh);
  if (shot.v4) for (const q of shot.quilts || [{ who: 'mama', mode: 'folded' }, { who: 'littleJade', mode: 'aside' }]) root.add(quilt4(q, figs).group);
  else for (const b of shot.blankets || [{ who: 'mama', mode: 'folded' }, { who: 'littleJade', mode: 'aside' }]) { const m = blanket(b, figs); if (m) root.add(m); }
  if (shot.push) { const from = { ...shot.push.fromShot }; Object.assign(from, solveCamera(from, figs, book, aim)); const pe = pushEnd(from.pos, book, shot.lens, shot.push.fill); shot.pos = pe.pos; shot.target = pe.target; shot.pushInfo = { start_position: from.pos, start_target: from.target, start_distance_to_gutter_m: +pe.startDist.toFixed(3), end_distance_to_gutter_m: +pe.dist.toFixed(3), swing_onto_page_normal_deg: +pe.swing.toFixed(1) }; }
  else Object.assign(shot, solveCamera(shot, figs, book, aim));
  if (shot.push) shot.roll = levelRoll(shot.pos, shot.target, book, 1); else if (shot.levelBook && book) shot.roll = levelRoll(shot.pos, shot.target, book, shot.levelBook);
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  const neonState = shot.light?.neon ?? 'red'; const neonCol = neonState === 'blue' ? S.blue : S.red;
  const neonAim = V(shot.light?.neonAim || (book ? book.at.toArray() : [2.4, 0.3, -1.6]));
  const door = shot.light?.door ?? 0; const floorOn = shot.light?.floor ?? true;
  const lightList = [
    { name: 'neon', kind: 'blade sign through the window (effective point = centroid of the part of the blade the subject sees)', pos: neonP, aim: neonAim, color: '#' + neonCol.toString(16).padStart(6, '0'), on: neonState !== 'off' },
    { name: 'stair_door', kind: 'spot (tungsten through door)', pos: V(STAIRWELL.bulb), aim: V([0.5, 0, 0]), color: '#ffb468', on: door > 0 },
    { name: 'floor_cracks', kind: 'lines of tungsten from below', pos: V([(KITCHEN.x0 + KITCHEN.x1) / 2, 0, (KITCHEN.z0 + KITCHEN.z1) / 2]), color: '#ffa24a', on: floorOn },
  ];
  const rig = (mode) => {
    const L = []; if (mode === 'none') return L; const white = mode !== 'lit';
    if (neonState !== 'off') {
      const s = new THREE.SpotLight(white ? 0xffffff : neonCol, mode === 'lit' ? (shot.light?.neonI ?? 16) : mode === 'mask' ? 6 : 2.6, 0, rad(shot.light?.neonCone ?? 50), mode === 'lit' ? 0.3 : 0.15, mode === 'lit' ? 1.3 : 0);
      s.position.copy(neonP); s.target.position.copy(neonAim); s.castShadow = true; s.shadow.camera.near = 0.25; s.shadow.camera.far = 12; s.shadow.radius = mode === 'lit' ? 5 : 1; L.push(s);
      if (mode === 'lit') { // the lower lettering throws its light up through the window onto the roof boards
        const u = new THREE.SpotLight(neonCol, 9, 0, rad(50), 0.4, 1.3); u.position.set((S.x0 + S.x1) / 2, -0.2, S.z + Math.sign(neonP.z - S.z) * (S.t / 2 + 0.02)); u.target.position.set(2.2, 2.3, -1.0); u.castShadow = true; u.shadow.camera.near = 0.25; u.shadow.camera.far = 12; L.push(u);
        const p = new THREE.PointLight(neonCol, 0.5, 4, 1.5); p.position.set(WINDOW.x - 0.3, WINDOW.sill + 0.3, WINDOW.z); L.push(p);
        if (book && book.pages) { const b = new THREE.PointLight(neonCol, 0.22, 1.4, 1.5); b.position.copy(book.at).addScaledVector(book.n, 0.1); L.push(b); } }   // the lit page bounces up into the faces
    }
    if (mode === 'mask') return L;
    if (door > 0) { const s = new THREE.SpotLight(white ? 0xffffff : 0xffb468, mode === 'lit' ? 22 : 1.6, 0, rad(60), 0.3, mode === 'lit' ? 1.4 : 0);
      s.position.set(STAIRWELL.bulb[0] - 0.2, STAIRWELL.bulb[1], STAIRWELL.bulb[2]); s.target.position.set(0.5, 0, 0); s.castShadow = true; s.shadow.camera.near = 0.2; s.shadow.camera.far = 12; L.push(s); }
    if (floorOn) for (const [x, z] of [[-1.5, 0.6], [0.2, 1.2], [1.4, 0.0], [2.4, 0.9]]) { const p = new THREE.PointLight(white ? 0xffffff : 0xffa24a, mode === 'lit' ? 0.25 : 0.06, 1.4, 1.2); p.position.set(x, 0.35, z); L.push(p); }
    L.push(new THREE.AmbientLight(white ? 0xffffff : 0x2a3560, mode === 'lit' ? (shot.light?.amb ?? 0.5) : 1.7));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, 1.1); d.position.set(1, 3, 2); L.push(d); }
    return L;
  };
  const toPx = (v) => { const p = v.clone().project(cam); return [+((p.x + 1) / 2 * 1920).toFixed(1), +((1 - p.y) / 2 * 1080).toFixed(1)]; };
  const shadow = handShadows({ shot, figs, book, cards, lightPos: neonP, lightName: 'neon blade sign', toPx, srcExt: src.ext });
  const extraOut = (c, P) => {
    const out = { layout_version: 3 };
    if (signInfo) { const sees = c.position.z > S.z ? 'face_plus_z' : 'face_minus_z'; const F = (cs) => ({ px: cs.map(P), world: cs.map((v) => v.toArray().map((x) => +x.toFixed(4))), behind_camera: cs.map((v) => v.clone().applyMatrix4(c.matrixWorldInverse).z > 0) });
      out.sign = { model: 'vertical blade sign on brackets, perpendicular to the facade, lettering on both faces', ...signInfo.spec, camera_sees: sees, state: neonState,
        corner_order: 'TL,TR,BR,BL as that face is read from its own side (map the lettering straight on; it is NOT mirror-reversed)',
        faces: Object.fromEntries(Object.entries(signInfo.faces).map(([k, cs]) => [k, F(cs)])),
        letter_blocks: signInfo.blocks.filter((b) => b.face === sees).map((b) => ({ text: b.text, face: b.face, ...F(b.world) })),
        light: { effective_point_world: neonP.toArray().map((x) => +x.toFixed(3)), effective_point_px: P(neonP), visible_fraction_of_face: src.visible, visible_extent: src.ext, aimed_at_world: neonAim.toArray().map((x) => +x.toFixed(3)) } }; }
    out.hooks = { state: shot.hooks || 'empty', px: [0, 1, 2, 3].map((i) => P(hookPoint(i))), world: [0, 1, 2, 3].map((i) => hookPoint(i).toArray().map((x) => +x.toFixed(3))), note: 'hook 1 = apron, hook 2 = towel (after A3)' };
    if (shadow) out.hand_shadow = shadow.sidecar;
    if (shot.pushInfo) out.push = { ...shot.pushInfo, note: 'end of the push that starts at v3_LAP_ots: same line toward the gutter; book.spread px here is the target of the move' };
    if (shot.serves) out.serves = shot.serves;
    return out;
  };
  return { set: 'attic88', scene, root, cam, rig, near: shot.near ?? 0.3, far: shot.far ?? 9, figs, book, panes, lights: lightList,
    header: shot.header || '', shadowLine: !!shadow, shadowPolys: shadow ? shadow.polys : null, subject: shot.subject ? V(shot.subject) : (book ? book.at : null), litBg: 0x020204, extra: extraOut };
}
