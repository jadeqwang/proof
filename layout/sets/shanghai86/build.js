// Build one shanghai86 shot: room (from layout.js) + furniture + figures + tissue + the sun rig for each render mode.
import { THREE, mk, box, cyl, ball, quad, tag, V, rad, addCast, CHILD_PROP, wall, beamMeshes, undraw, resolvePts, fixLeftHands, rng, chair, stool, tableRect } from './common.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { CAST } from '../../engine/mannequin.js';
import { aim } from '../../engine/aim.js';
import { beamSolid, applyBeamMask } from '../_beam.js';
import { ROOM, WINDOW, DOOR, SUN, SUN_DIR, BEAM, BEAM_SOURCE, beamFootprint, inBeam, PLACES, TISSUE, BED, WARDROBE, CHEST, TABLE, BAMBOO_CHAIR, BULB, CALENDAR, LIGHTS } from './layout.js';

// set-local extras only (heights in metres); little Jade (3) = `jade3` and Mama = `mama86` come from ../_cast.js. Faces the film leaves as paper are flagged `undrawn`.
addCast({
  uncle: { name: 'uncle (face undrawn)', h: 1.70, kind: 'adult', skin: 0xd2a07a, hair: 0x15110f, top: 0xe8e4d8, legs: 0x4a5560, hairStyle: 'short', sleeves: 'short', undrawn: true },
  aunt: { name: 'aunt (face undrawn)', h: 1.58, kind: 'adult', skin: 0xd8a27c, hair: 0x15110f, top: 0x9a6a5a, legs: 0x3a3632, hairStyle: 'bun', sleeves: 'short', undrawn: true },
  grandma: { name: 'grandmother (face undrawn)', h: 1.50, kind: 'adult', skin: 0xcf9c78, hair: 0x6a6a6a, top: 0x4a4f5a, legs: 0x2e2e30, hairStyle: 'bun', sleeves: 'long', undrawn: true },
}, CHILD_PROP);

const PLASTER = { grey: 0.74, col: 0xb9b3a0 }, FLOOR = { grey: 0.56, col: 0x7a5234, recvShadowLine: true }, WOOD = { grey: 0.42, col: 0x5a3a26 }, WOOD_L = { grey: 0.55, col: 0x8a6a44 };
const CLOTH = (g, c) => ({ grey: g, col: c });

function room() {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h, wallT: t } = ROOM; const W = WINDOW, D = DOOR;
  g.add(tag(box(x1 - x0 + 2 * t, 0.04, z1 - z0 + 2 * t, FLOOR, [0, -0.02, (z0 + z1) / 2]), 'floorboards'));
  g.add(tag(box(x1 - x0 + 2 * t, 0.04, z1 - z0 + 2 * t, { grey: 0.8, col: 0xc9c3b0 }, [0, h + 0.02, (z0 + z1) / 2]), 'ceiling'));
  g.add(wall({ axis: 'x', at: x0, a0: z0 - t, a1: z1 + t, h, t, out: -1, look: PLASTER, label: 'left wall (window)', holes: [{ a0: W.z - W.w / 2, a1: W.z + W.w / 2, y0: W.sill, y1: W.sill + W.h }] }));
  g.add(wall({ axis: 'x', at: x1, a0: z0 - t, a1: z1 + t, h, t, out: 1, look: PLASTER, label: 'right wall (door)', holes: [{ a0: D.z - D.w / 2, a1: D.z + D.w / 2, y0: 0, y1: D.h }] }));
  g.add(wall({ axis: 'z', at: z0, a0: x0, a1: x1, h, t, out: -1, look: PLASTER, label: 'back wall' }));
  g.add(wall({ axis: 'z', at: z1, a0: x0, a1: x1, h, t, out: 1, look: PLASTER, label: 'front wall' }));
  // window: frame in the reveal, a centre stile (two leaves) and two glazing bars per leaf, an inner sill board
  { const FR = { grey: 0.5, col: 0x5c4630 }, xm = W.x - t / 2, y0 = W.sill, y1 = W.sill + W.h, za = W.z - W.w / 2, zb = W.z + W.w / 2, f = W.frame;
    const parts = [box(t * 0.5, f, W.w, FR, [xm, y0 + f / 2, W.z]), box(t * 0.5, f, W.w, FR, [xm, y1 - f / 2, W.z]), box(t * 0.5, W.h, f, FR, [xm, (y0 + y1) / 2, za + f / 2]), box(t * 0.5, W.h, f, FR, [xm, (y0 + y1) / 2, zb - f / 2]),
      box(0.04, W.h, f, FR, [xm, (y0 + y1) / 2, W.z])];
    for (const k of [1, 2]) parts.push(box(0.03, W.mullion, W.w - 2 * f, FR, [xm, y0 + (W.h * k) / 3, W.z]));
    parts.push(box(0.14, 0.03, W.w + 0.12, FR, [W.x + 0.05, y0 - 0.015, W.z]));
    parts.forEach((m) => g.add(tag(m, 'casement window')));
    // a cotton curtain pushed to the camera side of the window, on a wire
    g.add(tag(box(0.05, W.h + 0.3, 0.2, CLOTH(0.82, 0xd8cfb8), [W.x + 0.05, y0 + W.h / 2 + 0.05, zb + 0.16]), 'curtain (pushed aside)'));
    g.add(tag(cyl(0.004, 0.004, W.w + 0.6, { grey: 0.2, col: 0x333333 }, [W.x + 0.05, y1 + 0.2, W.z], [90, 0, 0], 6), 'curtain (pushed aside)'));
    // the bright sky outside (an emitter: white in flat, glows in lit; casts no shadow)
    g.add(tag(box(0.05, 5, 7, { grey: 1, col: 0xf4f0e4, emit: 0xf8f2e2, emitI: 1.0, flatEmit: 0.97, noCast: true, noRecv: true }, [W.x - t - 1.6, 2.2, W.z]), 'sky outside (hazy)'));
  }
  // door: frame, leaf swung out over the landing, the dim landing beyond
  { const FR = { grey: 0.45, col: 0x55402c }, x = D.x + t / 2;
    g.add(tag(box(t + 0.04, 0.06, D.w + 0.12, FR, [x, D.h + 0.03, D.z]), 'door'));
    for (const s of [-1, 1]) g.add(tag(box(t + 0.04, D.h, 0.06, FR, [x, D.h / 2, D.z + s * (D.w / 2 + 0.03)]), 'door'));
    const leaf = new THREE.Group(); leaf.position.set(D.x + t, 0, D.z - D.w / 2); leaf.rotation.y = rad(-(D.openDeg - 90));
    leaf.add(box(D.w - 0.02, D.h - 0.02, 0.04, { grey: 0.4, col: 0x4c3826 }, [(D.w - 0.02) / 2, D.h / 2, 0])); g.add(tag(leaf, 'door'));
    g.add(tag(box(1.4, 0.04, 2.4, { grey: 0.4, col: 0x4a3a2a }, [D.x + t + 0.7, -0.02, D.z]), 'landing'));
    g.add(tag(box(0.05, ROOM.h, 2.4, { grey: 0.3, col: 0x3a342c }, [D.x + t + 1.4, ROOM.h / 2, D.z]), 'landing wall (dim)'));
  }
  const y0 = W.sill, y1 = W.sill + W.h, za = W.z - W.w / 2, zb = W.z + W.w / 2;
  const panes = { window: [V(W.x, y1, zb), V(W.x, y1, za), V(W.x, y0, za), V(W.x, y0, zb)] };   // TL, TR, BR, BL from inside
  return { g, panes };
}

function furniture(shot) {
  const g = new THREE.Group();
  // double bed along the back wall: frame, mattress, straw mat, folded quilts, two pillows, mosquito-net frame
  { const B = BED, cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2, w = B.x1 - B.x0, d = B.z1 - B.z0, grp = new THREE.Group();
    grp.add(box(w, 0.22, d, WOOD, [cx, B.h - 0.21, cz]));
    for (const sx of [B.x0 + 0.03, B.x1 - 0.03]) for (const sz of [B.z0 + 0.03, B.z1 - 0.03]) grp.add(box(0.05, B.postH, 0.05, WOOD, [sx, B.postH / 2, sz]));
    for (const sz of [B.z0 + 0.03, B.z1 - 0.03]) grp.add(box(w, 0.03, 0.03, WOOD, [cx, B.postH - 0.015, sz]));
    for (const sx of [B.x0 + 0.03, B.x1 - 0.03]) grp.add(box(0.03, 0.03, d, WOOD, [sx, B.postH - 0.015, cz]));
    grp.add(box(0.04, 0.5, d - 0.06, WOOD, [B.x1 - 0.03, B.h + 0.22, cz]));                                   // headboard at the door end
    g.add(tag(grp, 'bed (mosquito-net frame)'));
    g.add(tag(box(w - 0.08, 0.1, d - 0.08, CLOTH(0.78, 0xb9ad8c), [cx, B.h - 0.05, cz]), 'bed: mattress and straw mat'));
    for (let k = 0; k < 3; k++) g.add(tag(box(0.5, 0.11, 0.62, CLOTH(0.66 + k * 0.06, [0x8a5a5a, 0x5a7a8a, 0xa08a50][k]), [B.x0 + 0.34, B.h + 0.055 + k * 0.11, B.z0 + 0.4]), 'folded quilts'));
    for (const dz of [0.3, 0.92]) g.add(tag(box(0.3, 0.1, 0.5, CLOTH(0.9, 0xe4dccb), [B.x1 - 0.26, B.h + 0.05, B.z0 + dz + 0.06]), 'pillows'));
    g.add(tag(box(0.1, 1.1, 0.1, CLOTH(0.86, 0xdcd6c6), [B.x0 + 0.04, B.postH - 0.6, B.z1 - 0.05]), 'mosquito net (tied back)'));
  }
  { const Wd = WARDROBE, cx = (Wd.x0 + Wd.x1) / 2, cz = (Wd.z0 + Wd.z1) / 2, grp = new THREE.Group();
    grp.add(box(Wd.x1 - Wd.x0, Wd.h - 0.1, Wd.z1 - Wd.z0, WOOD, [cx, 0.1 + (Wd.h - 0.1) / 2, cz]));
    grp.add(box(0.012, 1.25, 0.42, { grey: 0.86, col: 0xaab4b8 }, [Wd.x0 - 0.006, 1.02, cz - 0.24]));
    grp.add(box(0.012, 1.5, 0.012, WOOD_L, [Wd.x0 - 0.006, 0.95, cz + 0.02]));
    g.add(tag(grp, 'wardrobe with mirror door')); }
  { const C = CHEST, cx = (C.x0 + C.x1) / 2, cz = (C.z0 + C.z1) / 2, d = C.z1 - C.z0, grp = new THREE.Group();
    grp.add(box(C.x1 - C.x0, C.h - 0.08, d, WOOD, [cx, 0.08 + (C.h - 0.08) / 2, cz]));
    for (let k = 0; k < 5; k++) grp.add(box(0.012, 0.15, d - 0.08, WOOD_L, [C.x1 + 0.006, 0.19 + k * 0.17, cz]));
    g.add(tag(grp, 'chest of drawers'));
    g.add(tag(box(0.16, 0.2, 0.34, { grey: 0.35, col: 0x4a3a2c }, [cx, C.h + 0.1, cz - 0.2]), 'radio'));
    for (const dz of [0.14, 0.27]) { const th = new THREE.Group(); th.add(cyl(0.055, 0.06, 0.3, { grey: 0.6, col: [0xb03a2a, 0x3a7a5a][dz > 0.2 ? 1 : 0] }, [cx, C.h + 0.15, cz + dz])); th.add(cyl(0.03, 0.045, 0.06, { grey: 0.8, col: 0xc8c8c8 }, [cx, C.h + 0.33, cz + dz])); g.add(tag(th, 'thermos flasks')); }
    g.add(tag(cyl(0.06, 0.06, 0.04, { grey: 0.85, col: 0xd8d0b8 }, [cx + 0.05, C.h + 0.075, cz + 0.4], [0, 0, 90]), 'alarm clock')); }
  // square table against the left wall, front corner; stools; enamel mugs
  { const T = TABLE; g.add(tableRect(T.cx, T.cz, T.w, T.w, T.h, { look: WOOD, label: 'square table' }));
    g.add(stool(T.cx + 0.6, T.cz + 0.3, { label: 'stools' })); g.add(stool(T.cx + 0.1, T.cz - 0.6, { yaw: 12, label: 'stools' }));
    for (const [dx, dz] of [[0.1, -0.15], [-0.12, 0.1]]) g.add(tag(cyl(0.04, 0.036, 0.09, { grey: 0.9, col: 0xeeeee6 }, [T.cx + dx, T.h + 0.045, T.cz + dz]), 'enamel mugs'));
    g.add(tag(box(0.3, 0.012, 0.22, { grey: 0.88, col: 0xd8d4c8 }, [T.cx - 0.1, T.h + 0.006, T.cz - 0.2]), 'newspaper')); }
  g.add(chair(BAMBOO_CHAIR.at[0], BAMBOO_CHAIR.at[1], BAMBOO_CHAIR.yaw, { seat: 0.36, w: 0.4, d: 0.38, back: 0.74, look: WOOD_L, label: 'bamboo chair' }));
  // the uncle's stool: in the light for the explaining (state A); a week later it is back by the table
  if (shot.state === 'A') g.add(stool(PLACES.uncleStool[0], PLACES.uncleStool[1], { seat: 0.44, yaw: PLACES.uncleYaw, label: "uncle's stool" }));
  { const C = CALENDAR; g.add(tag(box(C.w, C.h, 0.01, { grey: 0.9, col: 0xe8dcc8 }, [C.x, C.y, ROOM.z0 + 0.006]), 'wall calendar')); }
  g.add(tag(box(0.28, 0.2, 0.012, { grey: 0.6, col: 0x6a5a48 }, [-0.25, 1.75, ROOM.z0 + 0.007]), 'framed photo'));
  g.add(tag(cyl(0.004, 0.004, BULB.drop, { grey: 0.1, col: 0x111111 }, [BULB.x, ROOM.h - BULB.drop / 2, BULB.z], null, 6), 'bare bulb (off)'));
  g.add(tag(ball(0.035, { grey: 0.85, col: 0xb8b8a8 }, [BULB.x, ROOM.h - BULB.drop - 0.03, BULB.z], [1, 1.3, 1]), 'bare bulb (off)'));
  return g;
}

// the drift: torn tissue, ever tinier, in a mound round where she sits; a clear patch in front of her (PLACES.focus)
const PAPER = { grey: 0.95, col: 0xf1e6da };
function drift() {
  const g = new THREE.Group(); const D = PLACES.drift, r = rng(D.seed), F = PLACES.focus;
  const gauss = () => (r() + r() + r() + r() - 2) / 0.58;
  for (const [dx, dz, s, hh] of [[-0.3, -0.25, 0.2, 0.05], [0.28, -0.3, 0.22, 0.06], [0.05, -0.62, 0.24, 0.05], [-0.36, 0.1, 0.16, 0.035], [0.36, 0.08, 0.17, 0.04]])
    g.add(ball(1, PAPER, [D.at[0] + dx, 0, D.at[1] + dz], [s, hh, s * 0.8]));
  const sizes = [0.1, 0.05, 0.05, 0.025, 0.025, 0.025, 0.013, 0.013, 0.013, 0.013];
  let n = 0, guard = 0;
  while (n < D.n && guard++ < 4000) {
    const x = D.at[0] + gauss() * D.sx, z = D.at[1] + gauss() * D.sz;
    if (Math.abs(x - F[0]) < 0.2 && z > F[2] - 0.11 && z < F[2] + 0.13) continue;      // the clear patch
    const s = sizes[Math.floor(r() * sizes.length)], w = s * (0.8 + r() * 0.5), h = s * (0.8 + r() * 0.5) * (r() < 0.5 ? 2 : 1);
    const m = mk(new THREE.PlaneGeometry(w, h), PAPER); m.rotation.x = -Math.PI / 2 + (r() - 0.5) * 0.5;
    const hd = new THREE.Group(); hd.position.set(x, 0.004 + r() * 0.035 * Math.exp(-((x - D.at[0]) ** 2 + (z - D.at[1]) ** 2) / 0.1), z); hd.rotation.y = r() * Math.PI; hd.add(m); g.add(hd); n++;
  }
  return tag(g, 'tissue drift');
}
// the generation she is on: n = 1, 2 held in her hands; n = 4, 8 laid on the clear patch
function pieces(n, figs) {
  const g = new THREE.Group(); const S = TISSUE.sheet, F = PLACES.focus; if (!n) return g;
  if (n <= 2 && figs.jade3) { const P = figs.jade3.userData.P, a = P.handL, b = P.handR;
    const sheet = (c, w) => { const m = box(w, S, TISSUE.t, PAPER, [c.x, c.y + 0.005, c.z + 0.035]); m.rotation.x = rad(62); return m; };   // held nearly flat, tipped up toward her eyes
    if (n === 1) g.add(sheet(a.clone().add(b).multiplyScalar(0.5), S)); else { g.add(sheet(a, S / 2)); g.add(sheet(b, S / 2)); }
  } else { const cols = n === 4 ? 2 : 4, w = n === 4 ? S / 2 : S / 4, h = S / 2, gap = 0.022;
    for (let i = 0; i < n; i++) { const c = i % cols, rr = Math.floor(i / cols);
      const m = box(w, TISSUE.t, h, PAPER, [F[0] + (c - (cols - 1) / 2) * (w + gap), 0.002, F[2] + (rr - 0.5) * (h + gap)]); m.rotation.y = rad(((i * 37) % 13) - 6); g.add(m); } }
  return tag(g, `tissue: ${n} piece${n > 1 ? 's' : ''}`);
}

const NAMES = { focus: PLACES.focus, uncleHands: PLACES.uncleHands, drift: [PLACES.drift.at[0], 0.02, PLACES.drift.at[1]],
  window: [WINDOW.x, WINDOW.sill + WINDOW.h / 2, WINDOW.z], door: [DOOR.x, 1.3, DOOR.z], pool: [-0.1, 0, -0.08] };

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const { g: roomG, panes } = room(); root.add(roomG); root.add(furniture(shot));
  const extra = (t) => (NAMES[t] ? V(NAMES[t]) : null);
  const { figs } = stage(shot.figs, null, extra);
  fixLeftHands(figs);
  for (const [who, f] of Object.entries(figs)) { if (CAST[who].undrawn) undraw(f); root.add(f); }
  if (shot.state !== 'A') root.add(drift());
  root.add(pieces(shot.tissue, figs));
  if (shot.state === 'A' && figs.uncle) { const P = figs.uncle.userData.P; root.add(tag(ball(0.014, { grey: 0.9, col: 0xe8e0d0 }, P.indexL.clone().add(P.indexR).multiplyScalar(0.5).toArray()), 'something small (he shapes it)')); }
  const foot = beamFootprint(0);
  root.add(beamMeshes(BEAM_SOURCE, foot));
  if (shot.hide) root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) { o.visible = false; o.userData.baseVisible = false; } });
  resolvePts(shot, (t, F) => (t === 'ball' && F.uncle ? F.uncle.userData.P.indexL.clone().add(F.uncle.userData.P.indexR).multiplyScalar(0.5).toArray() : NAMES[t] || null), figs);   // 'ball' = what the uncle is shaping
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  // the sun: a far spot along SUN_DIR through the window (near-parallel), plus soft sky and room bounce
  const wc = V(NAMES.window), dir = V(SUN_DIR), sunPos = wc.clone().addScaledVector(dir, -9), sunAim = wc.clone().addScaledVector(dir, 3);
  const lightList = [
    { name: 'sun_through_window', kind: LIGHTS.sun.kind, pos: wc.clone().addScaledVector(dir, -1.5), aim: V(NAMES.pool), color: '#fff1d0', on: true },
    { name: 'sky', kind: LIGHTS.sky.kind, pos: wc.clone().add(V(-0.4, 0.2, 0)), color: '#cfd8e0', on: true },
  ];
  const rig = (mode) => {
    const L = []; if (mode === 'none' || shot.beamMask) return L; const white = mode !== 'lit';
    const s = new THREE.SpotLight(white ? 0xffffff : SUN.color, mode === 'lit' ? 5.5 : mode === 'mask' ? 6 : 2.6, 0, rad(7.5), 0.04, 0);
    s.position.copy(sunPos); s.target.position.copy(sunAim); s.castShadow = true; s.shadow.camera.near = 6; s.shadow.camera.far = 16; s.shadow.radius = mode === 'lit' ? 3 : 1; L.push(s);
    if (mode === 'mask') return L;
    if (mode === 'lit') { const p = new THREE.PointLight(0xcfd8e0, 1.1, 6, 1.2); p.position.set(WINDOW.x + 0.35, WINDOW.sill + 0.7, WINDOW.z); L.push(p);
      const b = new THREE.PointLight(0xffe2b0, 0.5, 3.5, 1.4); b.position.set(-0.1, 0.25, -0.08); L.push(b);     // the lit floor bounces up
      L.push(new THREE.AmbientLight(0x8a8478, shot.light?.amb ?? 0.75)); }
    else { L.push(new THREE.AmbientLight(0xffffff, 1.5)); const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(1, 3, 2); L.push(d); }
    return L;
  };
  const extraOut = (c, P) => {
    const inB = {}; for (const [who, f] of Object.entries(figs)) { const Q = f.userData.P; inB[who] = { head: inBeam(Q.head.toArray()), eyes: inBeam(Q.eyes.toArray()), handL: inBeam(Q.handL.toArray()), handR: inBeam(Q.handR.toArray()), hip: inBeam(Q.hip.toArray()) }; }
    return { beam: { kind: BEAM.kind, travel_dir: SUN_DIR.map((v) => +v.toFixed(4)), elevation_deg: SUN.elev,
      source_world: BEAM_SOURCE, source_px: BEAM_SOURCE.map((p) => P(V(p))), footprint_floor_world: foot.map((p) => p.map((v) => +v.toFixed(3))), footprint_floor_px: foot.map((p) => P(V(p))),
      corner_order: 'window TL, TR, BR, BL as seen from inside; the footprint corners are the same rays landed on the floor',
      note: 'the lit volume is the prism between source and footprint, minus what stands in it; render the mask from these 8 points with the scene as occluder', in_beam: inB },
      state: shot.state === 'A' ? 'A: the uncle explains (no drift yet)' : 'B: a week later, the drift', tissue_pieces: shot.tissue || 0, times: shot.t || null };
  };
  // the mask twin (beam_<id>): the sun shaft (window opening swept along SUN_DIR to the floor) white, everything else black
  if (shot.beamMask) applyBeamMask(root, [beamSolid({ aperture: BEAM_SOURCE, dir: SUN_DIR, sink: 0.015,
    clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, { n: [1, 0, 0], d: ROOM.x1 }, { n: [0, 0, -1], d: -ROOM.z0 }, { n: [0, 0, 1], d: ROOM.z1 }] })], { label: 'sun shaft (mask)', cam, surfaceOnly: !!shot.beamSurf });
  return { set: 'shanghai86', scene, root, cam, rig, near: shot.near ?? 0.2, far: shot.far ?? 7, figs, book: null, panes, lights: lightList,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.beamLine !== false, shadowPolys: null, subject: V(shot.subject || NAMES.pool), litBg: 0x15130f, flatBg: shot.beamMask ? 0x000000 : undefined, extra: extraOut };
}
