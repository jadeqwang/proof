// Build one wall88 shot: the stud cavity, the crack as a real slot with a shadowed spot behind it, the blade as
// explicit geometry (thin wedge from the bulb through the crack), one child.
//   shot.beamMask (the generated twins beam_<id>): flat mode renders the blade white on black = the beam mask
import * as THREE from 'three';
import { box, ball, tag, V, rad } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { CAVITY, SEAT, STAND, CRACK, BULB, BEAM, bladeY, EYE, MOTE, LIGHTS, SLOPE, WORKERS, FILE_LOOK } from './layout.js';
import { CAST, addCast } from '../_cast.js';   // the shared cast table (this set uses the engine's littleJade)

// r3: the restaurant workers in WL_in (set-local strangers, faces undrawn). Kitchen whites, aprons, a waiter's white
// shirt; colours are lit-preview placeholders only.
const WCOL = { w1: { top: 0xe8e4da, legs: 0x2a2a2e, apron: 0xd8d2c4, hairStyle: 'bun' }, w2: { top: 0xe8e4da, legs: 0x3a3a3e, apron: 0xd8d2c4 },
  w3: { top: 0x5a6a7a, legs: 0x2a2a2e, apron: 0xd8d2c4, hairStyle: 'bob' }, w4: { top: 0xf0eee8, legs: 0x151518 }, w5: { top: 0xe8e4da, legs: 0x3a3a3e, apron: 0xd8d2c4 } };
addCast(Object.fromEntries(WORKERS.filter((w) => w.key !== 'mama').map((w) => [w.key, { name: `restaurant worker ${w.key.slice(1)} (face undrawn)`, h: w.h, kind: 'adult', skin: 0xd8a87e, hair: 0x15110f, sleeves: 'long', undrawn: true, ...WCOL[w.key] }])));
// strangers' faces are "unreached": hide the mannequin's nose cone, eye dots and mouth bar (as office91 undraw)
function undraw(fig) {
  fig.traverse((o) => { if (!o.isMesh) return; const L = o.userData.look || {}, t = o.geometry.type;
    if (t === 'ConeGeometry' || L.col === 0x8a3b34 || (L.col === 0x111111 && t === 'SphereGeometry')) { o.visible = false; o.userData.baseVisible = false; } });
}
import { beamSolid, beamMesh, beamWire, beamSidecar } from './beam.js';

const BOARD = { grey: 0.42, col: 0x4a3a2a, recvShadowLine: true }, STUD = { grey: 0.5, col: 0x6a5238, recvShadowLine: true };
const BRICK = { grey: 0.36, col: 0x4a342c, recvShadowLine: true }, FLOOR = { grey: 0.3, col: 0x2a221c, recvShadowLine: true };

function cavity() {
  const g = new THREE.Group(); const C = CAVITY, L = C.z1 - C.z0, zc = (C.z0 + C.z1) / 2, B = C.board;
  // the boarded partition: boards stacked away from the crack, which is a real slot (the light is a real light)
  const bx = C.x0 - B.t / 2; const lo = CRACK.y - CRACK.gap / 2, hi = CRACK.y + CRACK.gap / 2;
  for (let y = lo, k = 0; y > 0; y -= B.h, k++) { const h = Math.min(B.h, y); g.add(tag(box(B.t, h - 0.002, L, BOARD, [bx, y - h / 2, zc]), 'boarded partition')); }
  for (let y = hi; y < C.h; y += B.h) { const h = Math.min(B.h, C.h - y); g.add(tag(box(B.t, h - 0.002, L, BOARD, [bx, y + h / 2, zc]), 'boarded partition')); }
  g.add(tag(box(B.t, CRACK.gap, CRACK.z0 - C.z0, BOARD, [bx, CRACK.y, (C.z0 + CRACK.z0) / 2]), 'boarded partition'));
  g.add(tag(box(B.t, CRACK.gap, C.z1 - CRACK.z1, BOARD, [bx, CRACK.y, (C.z1 + CRACK.z1) / 2]), 'boarded partition'));
  // the lit room seen through the crack (emissive, casts nothing)
  g.add(tag(box(0.004, CRACK.gap + 0.03, CRACK.z1 - CRACK.z0 + 0.06, { grey: 1, col: 0xffe2b0, emit: 0xffe2b0, emitI: 1.4, flatEmit: 1, noCast: true }, [C.x0 - B.t - 0.012, CRACK.y, (CRACK.z0 + CRACK.z1) / 2]), 'the crack (lit room beyond)'));
  for (const z of C.stud.z) g.add(tag(box(C.stud.d, C.h, C.stud.w, STUD, [C.x0 + C.stud.d / 2, C.h / 2, z]), 'stud'));
  // r4: no sole plate in the cavity (it would sit under the workers' toes); the studs stand on the floor
  // the outer wall, the floor, the two ends, the top
  g.add(tag(box(0.1, C.h, L, BRICK, [C.x1 + 0.05, C.h / 2, zc]), 'outer wall (brick)'));
  for (let y = 0.075 * 4; y < C.h; y += 0.075 * 4) g.add(tag(box(0.004, 0.012, L, { grey: 0.26, col: 0x2a1c18, noCast: true }, [C.x1 - 0.001, y, zc]), 'outer wall (brick)'));
  g.add(tag(box(C.x1 - C.x0 + 0.3, 0.04, L, FLOOR, [0, -0.02, zc]), 'floor of the cavity (dust)'));
  g.add(tag(box(C.x1 - C.x0, C.h, 0.05, BOARD, [0, C.h / 2, C.z0 - 0.025]), 'closed end'));
  g.add(tag(box(C.x1 - C.x0, C.h, 0.05, BOARD, [0, C.h / 2, C.z1 + 0.025]), 'end she came in by (board pulled to)'));
  g.add(tag(box(C.x1 - C.x0 + 0.3, 0.05, L, { grey: 0.2, col: 0x1a1512 }, [0, C.h + 0.025, zc]), 'top plate'));
  return g;
}

export const NAMED = { mote: MOTE.hero, eye: EYE, crack: [CRACK.x, CRACK.y, (CRACK.z0 + CRACK.z1) / 2], bladeMid: [0, bladeY(0), -0.1],
  toMama: FILE_LOOK, daughter: [STAND.at[0] - 0.05, 0.95, STAND.at[1] + 0.03] };   // r4: her look target; where Mama looks (her daughter's eyes)
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(cavity());
  const solid = beamSolid({ aperture: BEAM.aperture, src: BEAM.src, clip: BEAM.clip, length: 4 });
  const sunk = beamSolid({ aperture: BEAM.aperture, src: BEAM.src, clip: BEAM.clip, length: 4, sink: 0.004 });
  root.add(tag(beamWire(solid, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }, 0.0015), 'blade of light (volume edges)'));
  root.add(tag(beamMesh(sunk, { glass: true, col: LIGHTS.blade.color, opacity: 0.22 }), 'blade of light (volume)'));
  root.add(tag(ball(0.006, { grey: 1, col: 0xffd24a, emit: 0xffd24a, flatEmit: 1, only: ['label', 'lit'], noCast: true }, MOTE.hero), 'the mote'));

  const { figs } = stage(shot.figs || {}, null, (t) => (NAMED[t] ? V(NAMED[t]) : null));
  for (const [who, f] of Object.entries(figs)) { if (CAST[who]?.undrawn) undraw(f); root.add(f); f.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, recvShadowLine: true }; }); }
  const cs = { ...shot, orbit: shot.orbit ? { ...shot.orbit, at: fix(shot.orbit.at) } : undefined, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  if (shot.eyeline) { const e = figs[shot.eyeline.who].userData.P.eyes.clone(), to = V(fix(shot.eyeline.to)); cs.pos = e.addScaledVector(to.sub(e).normalize(), shot.eyeline.back ?? 0.12).add(V(shot.eyeline.off || [0, 0, 0])).toArray(); delete cs.orbit; }
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  if (shot.hide) root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) o.visible = false; });   // r4: plan view
  const cam = makeCam(shot);

  const anchor = V(fix(shot.beamAnchor || 'mote'));
  const bulb = V(BULB), crackMid = V(NAMED.crack);
  // r3: the cone is wider (30 deg, was 17) so it covers the longer crack
  const mkSpot = (color, I) => { const s = new THREE.SpotLight(color, I, 0, rad(30), 0.02, 0); s.position.copy(bulb); s.target.position.copy(crackMid); s.castShadow = true;
    s.shadow.camera.near = 0.6; s.shadow.camera.far = 4; s.shadow.bias = -0.0002; s.shadow.normalBias = 0.001; s.shadow.radius = 1; return s; };
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSpot(0xffffff, 6)];
    if (mode === 'lit') return [mkSpot(LIGHTS.blade.color, 30), new THREE.AmbientLight(0x30343c, 0.25)];
    const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(0.3, 2, cam.position.z > 0 ? 3 : -3);
    return [mkSpot(0xffffff, 9), new THREE.AmbientLight(0xffffff, 1.5), d];
  };
  if (shot.beamMask) {
    root.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, grey: 0, flatGrey: 0, emit: undefined, flatEmit: undefined, map: undefined }; });
    root.add(tag(beamMesh(sunk, { grey: 1, emit: 0xffffff, flatEmit: 1 }), 'blade of light (mask)'));
  }
  const lights = [{ name: 'blade', kind: LIGHTS.blade.kind, pos: bulb, aim: crackMid, color: '#' + LIGHTS.blade.color.toString(16).padStart(6, '0'), on: true }];
  const r3 = (v) => v.toArray().map((x) => +x.toFixed(4));
  const extraOut = (c, P) => {
    const out = { film: { time: shot.time || null, section: shot.section || null, position: shot.position || null },
      beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid, anchor, P, cam: c, extra: { physical_slope_deg: SLOPE, thickness_m: +BEAM.thickness.toFixed(4),
        crack_px: BEAM.aperture.map((p) => P(V(p))), note: 'a thin planar sheet, level along the cavity: seen along the cavity it is a line at the physical slope' } }),
      mote: { seed: MOTE.seed, count: MOTE.count, hero_world: MOTE.hero, hero_px: P(V(MOTE.hero)), path_px: [MOTE.hero, MOTE.exit, MOTE.gone].map((p) => P(V(p))), note: 'hero -> exit (drops out of the sheet) -> gone' },
      points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'mouth', 'handL', 'handR', 'hip'].map((k) => [k, r3(f.userData.P[k])]))])) };
    const f = figs.littleJade; if (f) { const Pf = f.userData.P, R = Pf.headH / 2;
      const eyeR = Pf.eyes.clone().addScaledVector(Pf.headX, -0.3 * R), eyeL = Pf.eyes.clone().addScaledVector(Pf.headX, 0.3 * R);
      const above = (p) => +((p.y - bladeY(p.x)) * 100).toFixed(1);
      out.blade_on_face = { right_eye_world: r3(eyeR), right_eye_px: P(eyeR), right_eye_above_sheet_cm: above(eyeR), left_eye_world: r3(eyeL), left_eye_px: P(eyeL), left_eye_above_sheet_cm: above(eyeL),
        nose_above_sheet_cm: above(Pf.nose), mouth_above_sheet_cm: above(Pf.mouth), sheet_half_thickness_cm: +(BEAM.thickness * 50).toFixed(2), in_lit_length: eyeR.z > CRACK.z0 - 0.1 && eyeR.z < CRACK.z1 }; }
    return out;
  };
  return { set: 'wall88', scene, root, cam, rig, near: shot.near ?? 0.15, far: shot.far ?? 2.5, figs, book: null, panes: {}, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor, litBg: 0x020203, flatBg: shot.beamMask ? 0x000000 : 0x3a3a3a, extra: extraOut };
}
