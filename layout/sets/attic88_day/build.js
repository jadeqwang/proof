// Build one attic88_day shot: the attic88 room (same numbers, imported through layout.js) by day, with the sun as a
// real shadowed light, the beam as explicit geometry (volume, footprint, sidecar), frost, the reading spot at the
// sill and the paper keyboard in the beam.
//   shot.beamMask   (the generated twins beam_<id>): flat mode renders the lit volume white on black = the beam mask
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, slab, tag, V, rad, limb } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { matsAndPillows, textbooks4, quilt4 } from '../attic88/v4.js';
import { ROOM, roofY, WINDOW, DOOR, STAIRWELL, PROPS, SUN, SUN_DIR, BEAM, beamAxis, AXIS_FLOOR_T, FROST, FERN, READING, KEYS, keysCorners, MOTE, LIGHTS } from './layout.js';
import { addCast, CAST, PROP } from '../_cast.js';   // the shared cast table (this set uses the engine's littleJade and mama)
import { footwear } from '../basement90/kit.js';    // set-local socks (basement90's footwear(), read-only import)
import { KB, blackKeys, paperKeysMesh } from './keyboard.js';   // r4: the paper keys as one exact texture

// r3 (Jade 2026-11-25): at the paper keys she is 4.5, not 5, and in socks. No 4.5 kind in the engine or _cast.js, so a
// SET-LOCAL kind `child4h` = the mean of the engine's child4 and child5 proportions, and a set-local cast key `jade4h`
// (littleJade's look, 1.045 m: 50th-percentile girl at 4.5 is about 1.05 m; littleJade at 5 is 1.08 here). Flagged in NOTES.
{ const a = PROP.child4, b = PROP.child5, mean = Object.fromEntries(Object.keys(b).map((k) => [k, +((a[k] + b[k]) / 2).toFixed(4)]));
  addCast({ jade4h: { ...CAST.littleJade, name: 'little Jade (4.5)', h: 1.045, kind: 'child4h' } }, { child4h: mean }); }
// white cotton crew socks (cuff ~9 cm up the shin at her size), same construction as basement90 jade7
export const SOCKS = { jade4h: { cuff: { h: 0.075, look: { grey: 0.92, col: 0xeeeae0 } } }, littleJade: { cuff: { h: 0.075, look: { grey: 0.92, col: 0xeeeae0 } } } };
import { beamSolid, beamMesh, beamWire, beamSidecar } from './beam.js';

const WOOD = { grey: 0.45, col: 0x5a3f2a }, WOOD_D = { grey: 0.32, col: 0x3d2a1c }, FLOOR = { grey: 0.55, col: 0x6a4a30, recvShadowLine: true };
const PLASTER = { grey: 0.7, col: 0x8a7f72 }, ROOF = { grey: 0.38, col: 0x4a3a2c };

// ---------------------------------------------------------------- the room (attic88's shell, by day)
function room() {
  const g = new THREE.Group(); const { x0, x1, z0, z1, knee, ridge } = ROOM;
  const slopeLen = Math.hypot(z1, ridge - knee), slopeAng = Math.atan2(ridge - knee, z1);
  // floorboards along x, with gaps (the kitchen below is dark by day: no light comes up through the cracks)
  const B = ROOM.board; let z = z0; let i = 0;
  while (z < z1 - 0.01) {
    const w = Math.min(B.w, z1 - z); const gapW = B.gap;
    let x = x0; let k = 0;
    while (x < x1 - 0.01) { const L = Math.min(x1 - x, 1.4 + ((i * 7 + k * 3) % 5) * 0.45); g.add(tag(box(L - 0.004, B.t, w - gapW, FLOOR, [x + L / 2, -B.t / 2, z + (w - gapW) / 2]), 'floorboards')); x += L; k++; }
    z += w; i++;
  }
  g.add(box(x1 - x0 + 2, 0.01, z1 - z0 + 2, { grey: 0.05, col: 0x050302, noCast: true }, [0, -B.t - 0.03, 0]));
  for (const s of [-1, 1]) {
    const roofM = box(x1 - x0, 0.02, slopeLen, ROOF, [0, (knee + ridge) / 2 + 0.01, s * z1 / 2]); roofM.rotation.x = s * slopeAng; g.add(tag(roofM, 'sloped ceiling (roof boards)'));
    g.add(tag(box(x1 - x0, knee, 0.03, WOOD_D, [0, knee / 2, s * (z1 + 0.015)]), 'knee wall'));
    const R = ROOM.rafter;
    for (let x = x0 + 0.3; x < x1 - 0.1; x += R.spacing) {
      const a = new THREE.Vector3(x, knee - 0.02, s * z1), b = new THREE.Vector3(x, ridge, 0);
      const nrm = new THREE.Vector3(0, Math.cos(slopeAng), -s * Math.sin(slopeAng));
      g.add(tag(slab(a.clone().addScaledVector(nrm, -R.d / 2), b.clone().addScaledVector(nrm, -R.d / 2), R.w, R.d, new THREE.Vector3(1, 0, 0), WOOD), 'rafters'));
    }
    const pz = s * z1 * 0.5, py = roofY(pz) - 0.17; g.add(tag(box(x1 - x0, 0.12, 0.1, WOOD_D, [0, py, pz]), 'purlin'));
  }
  g.add(tag(box(x1 - x0, 0.18, 0.08, WOOD_D, [0, ridge - 0.09, 0]), 'ridge beam'));
  const cz = ROOM.z1 * (1 - (ROOM.collarY - knee) / (ridge - knee));
  for (let x = x0 + 0.3, k = 0; x < x1 - 0.1; x += ROOM.rafter.spacing, k++) if (k % 2 === 1) g.add(tag(box(0.05, 0.12, 2 * cz + 0.1, WOOD, [x, ROOM.collarY, 0]), 'collar ties'));
  const gable = (xw, holes, label) => {
    const sh = new THREE.Shape(); sh.moveTo(z0, 0); sh.lineTo(z1, 0); sh.lineTo(z1, knee); sh.lineTo(0, ridge); sh.lineTo(z0, knee); sh.lineTo(z0, 0);
    for (const h of holes) { const p = new THREE.Path(); p.moveTo(h.z0, h.y0 + 1e-3); p.lineTo(h.z0, h.y1); p.lineTo(h.z1, h.y1); p.lineTo(h.z1, h.y0 + 1e-3); p.lineTo(h.z0, h.y0 + 1e-3); sh.holes.push(p); }
    const m = mk(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false }), PLASTER);
    m.matrixAutoUpdate = false; m.matrix.set(0, 0, -1, xw + 0.06, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
    g.add(tag(m, label));
  };
  const W = WINDOW;
  gable(ROOM.x1 + 0.06, [{ z0: W.z - W.w / 2, z1: W.z + W.w / 2, y0: W.sill, y1: W.sill + W.h }], 'window gable wall');
  gable(ROOM.x0 - 0.06, [{ z0: DOOR.z - DOOR.w / 2, z1: DOOR.z + DOOR.w / 2, y0: 0.003, y1: DOOR.h }], 'stair-door gable wall');
  { const wx = W.x, y0 = W.sill, y1 = W.sill + W.h, za = W.z - W.w / 2, zb = W.z + W.w / 2, f = W.frame, FR = { grey: 0.6, col: 0x6b5b48 };
    const fr = [box(W.depth, f, W.w + 2 * f, FR, [wx, y0 - f / 2, W.z]), box(W.depth, f, W.w + 2 * f, FR, [wx, y1 + f / 2, W.z]),
      box(W.depth, W.h, f, FR, [wx, (y0 + y1) / 2, za - f / 2]), box(W.depth, W.h, f, FR, [wx, (y0 + y1) / 2, zb + f / 2]),
      box(0.05, W.mullion, W.w, FR, [wx + 0.03, (y0 + y1) / 2, W.z]), box(0.05, W.h, W.mullion, FR, [wx + 0.03, (y0 + y1) / 2, W.z]),
      box(0.2, 0.03, W.w + 0.16, FR, [wx - 0.05, y0 - f - 0.015, W.z])];
    fr.forEach((m) => g.add(tag(m, 'window (four panes)')));
  }
  { const D = DOOR, FR = { grey: 0.5, col: 0x5a4632 };   // the stair door, shut
    g.add(tag(box(0.14, 0.06, D.w + 0.12, FR, [D.x, D.h + 0.03, D.z]), 'stair door (shut)'));
    g.add(tag(box(0.14, D.h, 0.06, FR, [D.x, D.h / 2, D.z - D.w / 2 - 0.03]), 'stair door (shut)'));
    g.add(tag(box(0.14, D.h, 0.06, FR, [D.x, D.h / 2, D.z + D.w / 2 + 0.03]), 'stair door (shut)'));
    g.add(tag(box(0.035, D.h - 0.01, D.w - 0.01, { grey: 0.42, col: 0x4e3b28 }, [D.x - 0.07, (D.h - 0.01) / 2, D.z]), 'stair door (shut)'));
    g.add(tag(ball(0.025, { grey: 0.2, col: 0x8a7a50 }, [D.x - 0.04, 1.0, D.z - D.w / 2 + 0.08]), 'stair door (shut)'));
    g.add(box(1.4, 2.6, 1.4, { grey: 0.1, col: 0x0a0806, noCast: true }, [STAIRWELL.x0 + 0.6, 1.0, 0]));   // dark stairwell behind it
  }
  // the winter sky outside (emissive: bright in flat, and it never blocks the sun)
  g.add(tag(box(0.1, 9, 16, { grey: 0.97, col: SUN.sky, emit: SUN.sky, emitI: 1.1, flatEmit: 0.97, noCast: true }, [W.x + 6, 1.5, 0]), 'winter sky'));
  // the four panes (glass in `lit` only) and the frost on them
  const panes = {}; { const x = W.x - 0.01, y0 = W.sill, y1 = W.sill + W.h, ym = (y0 + y1) / 2, za = W.z - W.w / 2, zb = W.z + W.w / 2; const P = (zz, y) => V(x, y, zz);
    panes.window_TL = [P(za, y1), P(W.z, y1), P(W.z, ym), P(za, ym)]; panes.window_TR = [P(W.z, y1), P(zb, y1), P(zb, ym), P(W.z, ym)];
    panes.window_BL = [P(za, ym), P(W.z, ym), P(W.z, y0), P(za, y0)]; panes.window_BR = [P(W.z, ym), P(zb, ym), P(zb, y0), P(W.z, y0)];
    for (const c of Object.values(panes)) g.add(tag(quad(c, { glass: true, col: 0xcfd8e2, opacity: 0.16, noCast: true }), 'window glass'));
    // frost: a band rising into each pane's lower corners (thin, casts nothing: the sun goes through it)
    for (const [name, c] of Object.entries(panes)) {
      const zl = c[3].z + W.mullion / 2 + 0.004, zr = c[2].z - W.mullion / 2 - 0.004, yb = c[3].y + W.mullion / 2 + 0.004, h = (c[0].y - c[3].y) * FROST.cover; const N = 10, pos = [];
      const top = (t) => yb + h * (0.3 + 0.7 * Math.pow(Math.abs(2 * t - 1), 1.6)) * (name === FERN.pane && t > 0.5 ? 1.15 : 1);
      for (let k = 0; k < N; k++) { const t0 = k / N, t1 = (k + 1) / N, a = zl + (zr - zl) * t0, b = zl + (zr - zl) * t1;
        pos.push(FROST.x, yb, a, FROST.x, yb, b, FROST.x, top(t1), b, FROST.x, yb, a, FROST.x, top(t1), b, FROST.x, top(t0), a); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
      const m = mk(geo, { grey: 0.93, col: 0xe8eef4, noCast: true }); m.userData.double = true; g.add(tag(m, 'frost on the pane'));
    }
    // the fern: stem and side branches as a guide (label mode only; the real fern is a renderer layer)
    const r = V(FERN.root), t = V(FERN.tip), d = t.clone().sub(r), side = new THREE.Vector3().crossVectors(d, new THREE.Vector3(1, 0, 0)).normalize(); const fl = { grey: 1, col: 0xffffff, emit: 0xffffff, flatEmit: 1, only: ['label'], noCast: true };
    const fern = new THREE.Group(); fern.add(limb(r, t, 0.003, fl));
    for (let k = 1; k <= FERN.branches; k++) { const p = r.clone().addScaledVector(d, k / (FERN.branches + 1)), len = 0.07 * (1 - k / (FERN.branches + 2));
      for (const s of [-1, 1]) fern.add(limb(p, p.clone().addScaledVector(side, s * len).addScaledVector(d.clone().normalize(), len * 0.7), 0.002, fl)); }
    g.add(tag(fern, 'frost fern (guide)'));
  }
  return { g, panes };
}

// ---------------------------------------------------------------- furniture and props
function props() {
  const g = new THREE.Group();
  matsAndPillows(g); textbooks4(g, 'stack');
  for (const who of ['mama', 'littleJade']) g.add(quilt4({ who, mode: 'folded' }, {}).group);   // beds made: both quilts folded at the foot
  // the paper keyboard, in the beam. r4 (Jade: "an accurate piano"): the paper is ONE textured plane, the printed keyboard
  // drawn in code with exact geometry (keyboard.js: C3..C6, real key sizes and black-key groups, clear tape over the seam,
  // map-fold creases); line / contour get the texture's own edge map (every key edge, black keys filled). Flat, nothing raised.
  { const { at: [x, z], yaw } = KEYS; const grp = new THREE.Group(); grp.position.set(x, 0.0012, z); grp.rotation.y = rad(yaw);
    grp.add(paperKeysMesh({ recvShadowLine: true }));
    g.add(tag(grp, 'paper piano keys (printout)')); }
  // the reading spot at the sill: a folded cushion to kneel on, a book left on the sill board
  { const C = READING.cushion; const c = box(C.w, C.t, C.d, { grey: 0.74, col: 0x8a6a52 }, [C.at[0], C.t / 2, C.at[1]]); c.rotation.y = rad(-4); g.add(tag(c, 'cushion (reading spot)'));
    const Bk = READING.book; const b = box(Bk.w, Bk.t, Bk.d, { grey: 0.36, col: 0x7a3a2a }, [Bk.at[0], Bk.at[1] + Bk.t / 2, Bk.at[2]]); b.rotation.y = rad(Bk.yaw); g.add(tag(b, 'book on the sill')); }
  // attic88's other fixed props: TV on a crate, boxes, rice sacks, the bare bulb
  { const T = PROPS.tv, [x, z] = T.at, grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = rad(T.yaw);
    const [cw, ch, cd] = T.crate; for (const s of [-1, 1]) grp.add(box(0.02, ch, cd, WOOD, [s * (cw / 2 - 0.01), ch / 2, 0]));
    for (let k = 0; k < 3; k++) grp.add(box(cw, 0.06, 0.02, WOOD, [0, 0.05 + k * 0.1, cd / 2 - 0.01]));
    grp.add(box(cw, 0.02, cd, WOOD, [0, ch - 0.01, 0]));
    const [tw, th, td] = T.tv; grp.add(box(tw, th, td * 0.6, { grey: 0.35, col: 0x3a3a3a }, [0, ch + th / 2, -td * 0.1]));
    grp.add(box(tw * 0.6, th * 0.7, td * 0.4, { grey: 0.3, col: 0x2e2e2e }, [0, ch + th / 2, -td * 0.5]));
    grp.add(box(tw * 0.72, th * 0.68, 0.01, { grey: 0.12, col: 0x101418 }, [-tw * 0.06, ch + th / 2 + 0.01, td * 0.2 + 0.002]));
    g.add(tag(grp, 'small TV (off) on a crate')); }
  for (const [x, z, w, h, d, yaw, y = 0] of PROPS.boxes) { const b = box(w, h, d, { grey: 0.6, col: 0x9a7c55 }, [x, y + h / 2, z]); b.rotation.y = rad(yaw); g.add(tag(b, 'storage boxes')); }
  for (const [x, z, yaw] of PROPS.sacks) { const s = ball(0.24, { grey: 0.72, col: 0xc9bc9a }, [x, 0.2, z], [1, 0.85, 0.75]); s.rotation.y = rad(yaw); g.add(tag(s, 'rice sacks'));
    g.add(tag(cyl(0.06, 0.1, 0.12, { grey: 0.72, col: 0xc9bc9a }, [x, 0.42, z]), 'rice sacks')); }
  { const B = PROPS.bulb; g.add(tag(cyl(0.004, 0.004, B.drop, { grey: 0.1, col: 0x111111 }, [B.x, ROOM.ridge - 0.18 - B.drop / 2, B.z], null, 6), 'bare bulb (off)'));
    g.add(tag(ball(0.035, { grey: 0.8, col: 0x9a9a8a }, [B.x, ROOM.ridge - 0.18 - B.drop - 0.03, B.z], [1, 1.3, 1]), 'bare bulb (off)')); }
  return g;
}

// ---------------------------------------------------------------- named points of the set
const kc = keysCorners();
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const onKeys = (u, v, y = 0.012) => { const p = lerp3(lerp3(kc[0], kc[1], u), lerp3(kc[3], kc[2], u), v); p[1] = y; return p; };   // u 0..1 low->high notes, v 0 far edge .. 1 near edge
export const NAMED = {
  mote: MOTE.hero, moteExit: MOTE.exit, moteReenter: MOTE.reenter,
  keys: onKeys(0.5, 0.5, 0.004), keysL: onKeys(0.36, 0.72), keysR: onKeys(0.64, 0.72), keysNear: onKeys(0.5, 1.0, 0.004),
  fern: FERN.tip, fernRoot: FERN.root, fernMid: lerp3(FERN.root, FERN.tip, 0.55),
  window: BEAM.centre, sill: [WINDOW.x - 0.08, WINDOW.sill - 0.02, WINDOW.z],
  beamMid: beamAxis(AXIS_FLOOR_T * 0.62), beamEnd: beamAxis(AXIS_FLOOR_T),
};
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

// ---------------------------------------------------------------- build
export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const { g: roomG, panes } = room(); root.add(roomG); root.add(props());
  // the beam: exact solids per pane (footprints), one solid for the four together (volume / mask)
  const perPane = Object.fromEntries(Object.entries(BEAM.apertures).map(([k, a]) => [k, beamSolid({ aperture: a, dir: BEAM.dir, clip: BEAM.clip })]));
  const whole = beamSolid({ aperture: BEAM.whole, dir: BEAM.dir, clip: BEAM.clip });
  const sunk = beamSolid({ aperture: BEAM.whole, dir: BEAM.dir, clip: BEAM.clip, sink: 0.015 });
  root.add(tag(beamWire(whole, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }), 'sun beam (volume edges)'));
  root.add(tag(beamMesh(sunk, { glass: true, col: SUN.color, opacity: 0.1 }), 'sun beam (volume)'));
  root.add(tag(ball(0.012, { grey: 1, col: 0xffd24a, emit: 0xffd24a, flatEmit: 1, only: ['label', 'lit'], noCast: true }, MOTE.hero), 'the mote'));

  // r4: 'forearm:<who>:<L|R>[:k]' = the point k along elbow -> wrist (default 0.6; as market93), and
  // 'forearmDown:<who>:<L|R>[:k]' = 0.1 m from that point straight down, square to the forearm (for a palm laid on top of it)
  const extra = (t, figs) => {
    if (typeof t !== 'string') return null; if (NAMED[t]) return V(NAMED[t]);
    const m = /^forearm(Down)?:(\w+):([LR])(?::([\d.]+))?$/.exec(t); if (!m || !figs || !figs[m[2]]) return null;
    const P = figs[m[2]].userData.P, E = P['elbow' + m[3]], W = P['wrist' + m[3]]; if (!E || !W) return null;
    const p = E.clone().lerp(W, m[4] ? +m[4] : 0.6); if (!m[1]) return p;
    const a = W.clone().sub(E).normalize(), d = new THREE.Vector3(0, -1, 0); d.addScaledVector(a, -d.dot(a)).normalize(); return p.addScaledVector(d, 0.1); };
  const { figs } = stage(shot.figs || {}, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  for (const [who, fw] of Object.entries(SOCKS)) if (figs[who]) root.add(footwear(figs[who], fw));   // socks (Jade r3)
  // camera: shot.eyeline = { who, to, back } puts the camera on that figure's eye-line, `back` metres in front of the eyes
  const cs = { ...shot, orbit: shot.orbit ? { ...shot.orbit, at: fix(shot.orbit.at) } : undefined, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  if (shot.eyeline) { const e = figs[shot.eyeline.who].userData.P.eyes.clone(), to = V(fix(shot.eyeline.to)); cs.pos = e.addScaledVector(to.sub(e).normalize(), shot.eyeline.back ?? 0.12).toArray(); delete cs.orbit; }
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);

  const anchor = V(fix(shot.beamAnchor || 'mote'));
  const sunPos = V(BEAM.centre).addScaledVector(V(SUN_DIR), -9), sunAim = V(beamAxis(AXIS_FLOOR_T * 0.6));
  // the shadow frustum covers the whole room, so nothing outside the window's shaft is ever sunlit
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); s.target.position.set(0, 1.2, 0); s.position.set(0, 1.2, 0).addScaledVector(V(SUN_DIR), -12); s.castShadow = true;
    const c = s.shadow.camera; c.left = -4.2; c.right = 4.2; c.top = 3.2; c.bottom = -3.2; c.near = 1; c.far = 26; c.updateProjectionMatrix(); s.shadow.bias = -0.0006; s.shadow.normalBias = 0.006; s.shadow.radius = 1.5; return s; };
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSun(0xffffff, 6)];
    if (mode === 'lit') { const p = new THREE.PointLight(SUN.sky, 0.6, 5, 1.4); p.position.set(WINDOW.x - 0.4, WINDOW.sill + 0.5, WINDOW.z);
      return [mkSun(SUN.color, 9), p, new THREE.AmbientLight(0x6f7f95, 0.45)]; }
    const d = new THREE.DirectionalLight(0xffffff, 1.0); d.position.set(-1, 3, 2);
    return [mkSun(0xffffff, 7), new THREE.AmbientLight(0xffffff, 1.5), d];
  };
  if (shot.beamMask) {   // the mask twin: everything black, the lit volume white
    root.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, grey: 0, flatGrey: 0, emit: undefined, flatEmit: undefined, map: undefined, art: undefined }; });
    root.traverse((o) => { if (o.isMesh && /^frost/.test(o.userData.label || '')) o.visible = false; });   // frost is in the light, not in front of it
    root.add(tag(beamMesh(sunk, { grey: 1, emit: 0xffffff, flatEmit: 1 }), 'sun beam (mask)'));
  }
  const lights = [{ name: 'sun', kind: LIGHTS.sun.kind, pos: sunPos, aim: sunAim, color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true }];
  const r3 = (v) => v.toArray().map((x) => +x.toFixed(4));
  const extraOut = (c, P) => ({
    film: { time: shot.time || null, section: shot.section || null, position: shot.position || null },
    beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid: whole, anchor, P, cam: c, extra: {
      sun: { azimuth_compass_deg: SUN.azimuth_compass, altitude_deg: SUN.altitude, assumption: 'window gable faces due south; ' + SUN.date + ', ' + SUN.solar_time + ' solar time' },
      panes: Object.fromEntries(Object.entries(perPane).map(([k, s]) => [k, { aperture_px: s.aperture.map((p) => P(p)), floor_px: (s.caps.floor || []).map((p) => P(p)), floor_world: (s.caps.floor || []).map(r3) }])) } }),
    mote: { seed: MOTE.seed, count: MOTE.count, hero_world: MOTE.hero, hero_px: P(V(MOTE.hero)), path_px: [MOTE.hero, MOTE.exit, MOTE.dark, MOTE.reenter].map((p) => P(V(p))), note: 'hero -> exit (leaves the beam through its east face) -> dark -> reenter' },
    frost: { fern_pane: FERN.pane, fern_root_px: P(V(FERN.root)), fern_tip_px: P(V(FERN.tip)), fern_root_world: FERN.root, fern_tip_world: FERN.tip },
    keys: { corners_px: kc.map((p) => P(V(p))), corners_world: kc, corner_order: 'TL,TR,BR,BL as the player reads it (left = lowest note, top = far edge with the black keys)', note: 'corners of the PAPER; the printed keyboard is centred on it', keyboard: { range: KB.first + '..' + KB.last, whites: KB.whites, blacks: blackKeys().length, white_mm: KB.white, black_mm: KB.black, size_mm: KB.size, margins_mm: KB.margin, black_keys_mm_from_left: blackKeys(), tape_mm: KB.tape, folds_mm: KB.folds, texture: 'layout/sets/attic88_day/keyboard.js' } },
    wrists: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, f.userData.P.wrists || null])),
    points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'handL', 'handR', 'elbowR', 'wristR', 'shoulderR', 'hip', 'shoulderC'].filter((k) => f.userData.P[k]).map((k) => [k, r3(f.userData.P[k])]))])),
  });
  return { set: 'attic88_day', scene, root, cam, rig, near: shot.near ?? 0.3, far: shot.far ?? 9, figs, book: null, panes, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor, litBg: 0x0a0c10, flatBg: shot.beamMask ? 0x000000 : 0x9a9a9a, extra: extraOut };
}
