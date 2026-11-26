// Build one playground23 shot: the clubhouse with its pane, the family outside, their reflections, the beam inside.
// Reflections are built as VIRTUAL IMAGES: a second copy of the family mirrored in the glass plane (z -> -z), standing
// in the room behind the pane and drawn as silhouettes. So every mode shows them through the glass together with the
// beam, with no compositing. They cast and receive no light, and are removed from the beam-mask twin.
//   shot.beamMask (the generated twins beam_<id>): flat mode renders the lit volume white on black = the beam mask
import { HUMAN } from '../../engine/humanMesh.js';
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, tag, V, rad } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { CAST } from '../_cast.js';
import { HOUSE, PANE, BACKWIN, BENCH, SUN, SUN_DIR, BEAM, MOTE, SWING, LIGHTS } from './layout.js';
import { beamSolid, beamMesh, beamWire, beamSidecar } from './beam.js';

// cast, set-local and additive (engine/mannequin.js is not edited). `jade` is the engine's adult Jade.
const NEW_CAST = {
  partner: { name: 'partner', h: 1.78, kind: 'adult', skin: 0xd8b08e, hair: 0x2b2018, top: 0x4a5a6a, legs: 0x2a2a30, hairStyle: 'short', sleeves: 'short' },
  toddler: { name: 'child (toddler, carried)', h: 0.82, kind: 'child4', skin: 0xe9c0a0, hair: 0x231a14, top: 0xf2c84a, legs: 0x5a6a8a, hairStyle: 'bob', sleeves: 'short' },
};
for (const [k, v] of Object.entries(NEW_CAST)) if (!CAST[k]) CAST[k] = v;

const WOOD = { grey: 0.55, col: 0x8a6a48 }, WOOD_D = { grey: 0.4, col: 0x5a4632 };
// a wall in a plane z = const with rectangular holes, one extruded shape (no seams in line mode)
function wallZ(zFront, t, xA, xB, h, holes, look, label) {
  const sh = new THREE.Shape(); sh.moveTo(xA, 0); sh.lineTo(xB, 0); sh.lineTo(xB, h); sh.lineTo(xA, h); sh.lineTo(xA, 0);
  for (const o of holes) { const p = new THREE.Path(); p.moveTo(o.x0, o.y0); p.lineTo(o.x0, o.y1); p.lineTo(o.x1, o.y1); p.lineTo(o.x1, o.y0); p.lineTo(o.x0, o.y0); sh.holes.push(p); }
  const m = mk(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), look); m.position.z = zFront - t; return tag(m, label);
}
function house() {
  const g = new THREE.Group(); const H = HOUSE, T = H.wallT, P = PANE;
  g.add(tag(box(30, 0.04, 30, { grey: 0.5, col: 0x8a6a4a }, [0, -0.02, 4]), 'mulch'));
  g.add(tag(box(H.x1 - H.x0, 0.02, H.z1 - H.z0, { grey: 0.35, col: 0x3a4a5a }, [(H.x0 + H.x1) / 2, 0.01, (H.z0 + H.z1) / 2]), 'clubhouse floor (rubber)'));
  g.add(wallZ(H.z1 + T, T, H.x0 - T, H.x1 + T, H.h, [{ x0: P.x0, x1: P.x1, y0: P.y0, y1: P.y1 }], WOOD, 'clubhouse wall (the pane is in it)'));
  g.add(wallZ(H.z0, T, H.x0 - T, H.x1 + T, H.h, [{ x0: BACKWIN.x0, x1: BACKWIN.x1, y0: BACKWIN.y0, y1: BACKWIN.y1 }], WOOD_D, 'clubhouse back wall (the sun’s window is in it)'));
  g.add(tag(box(T, H.h, H.z1 - H.z0, WOOD_D, [H.x1 + T / 2, H.h / 2, (H.z0 + H.z1) / 2]), 'clubhouse right wall'));
  { const d = H.door, x = H.x0 - T / 2;   // left wall (shade side) with an open doorway
    g.add(tag(box(T, H.h, d.z0 - H.z0, WOOD_D, [x, H.h / 2, (H.z0 + d.z0) / 2]), 'clubhouse left wall (doorway)'));
    g.add(tag(box(T, H.h, H.z1 - d.z1, WOOD_D, [x, H.h / 2, (d.z1 + H.z1) / 2]), 'clubhouse left wall (doorway)'));
    g.add(tag(box(T, H.h - d.h, d.z1 - d.z0, WOOD_D, [x, (H.h + d.h) / 2, (d.z0 + d.z1) / 2]), 'clubhouse left wall (doorway)')); }
  g.add(tag(box(H.x1 - H.x0 + 0.5, 0.06, H.z1 - H.z0 + 0.5, { grey: 0.45, col: 0x6a3a2a }, [(H.x0 + H.x1) / 2, H.h + 0.03, (H.z0 + H.z1) / 2]), 'clubhouse roof'));
  // pane frame + glass
  { const f = P.frame, FR = { grey: 0.3, col: 0x3a5a7a }, z = 0.035, cx = (P.x0 + P.x1) / 2, cy = (P.y0 + P.y1) / 2;
    for (const y of [P.y0 - f / 2, P.y1 + f / 2]) g.add(tag(box(P.x1 - P.x0 + 2 * f, f, 0.09, FR, [cx, y, z]), 'pane frame'));
    for (const x of [P.x0 - f / 2, P.x1 + f / 2]) g.add(tag(box(f, P.y1 - P.y0, 0.09, FR, [x, cy, z]), 'pane frame')); }
  const panes = { glass: [V(PANE.x0, PANE.y1, 0), V(PANE.x1, PANE.y1, 0), V(PANE.x1, PANE.y0, 0), V(PANE.x0, PANE.y0, 0)] };
  g.add(tag(quad(panes.glass, { glass: true, col: 0xbcd0e0, opacity: 0.16, noCast: true }), 'the pane (acrylic)'));
  { const w = BACKWIN, f = w.frame, FR = { grey: 0.3, col: 0x3a5a7a }, cx = (w.x0 + w.x1) / 2, cy = (w.y0 + w.y1) / 2, z = w.z + 0.03;
    for (const y of [w.y0 - f / 2, w.y1 + f / 2]) g.add(tag(box(w.x1 - w.x0 + 2 * f, f, 0.07, FR, [cx, y, z]), 'back window frame'));
    for (const x of [w.x0 - f / 2, w.x1 + f / 2]) g.add(tag(box(f, w.y1 - w.y0, 0.07, FR, [x, cy, z]), 'back window frame'));
    panes.back_window = [V(w.x0, w.y1, w.z), V(w.x1, w.y1, w.z), V(w.x1, w.y0, w.z), V(w.x0, w.y0, w.z)];
    g.add(tag(quad(panes.back_window, { glass: true, col: 0xfff0d0, opacity: 0.3, noCast: true }), 'back window (the sun comes through it)')); }
  { const b = BENCH; g.add(tag(box(b.x1 - b.x0, 0.05, b.z1 - b.z0, WOOD, [(b.x0 + b.x1) / 2, b.h, (b.z0 + b.z1) / 2]), 'bench'));
    for (const x of [b.x0 + 0.08, b.x1 - 0.08]) g.add(tag(box(0.05, b.h, b.z1 - b.z0, WOOD, [x, b.h / 2, (b.z0 + b.z1) / 2]), 'bench')); }
  // outside, behind the family: a swing frame (only ever seen at the frame edge)
  { const s = SWING, M = { grey: 0.35, col: 0x3a6a8a };
    g.add(tag(box(s.w, 0.07, 0.07, M, [s.x, s.h, s.z]), 'swing set'));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const m = cyl(0.03, 0.03, s.h * 1.06, M, [s.x + sx * s.w / 2, s.h / 2, s.z + sz * 0.4], [sz * 20, 0, 0], 8); g.add(tag(m, 'swing set')); }
    for (const dx of [-0.5, 0.5]) { g.add(tag(box(0.42, 0.03, 0.16, { grey: 0.2, col: 0x222222 }, [s.x + dx, 0.5, s.z]), 'swing seat'));
      for (const e of [-0.2, 0.2]) g.add(tag(cyl(0.005, 0.005, s.h - 0.5, { grey: 0.3, col: 0x555555, noCast: true }, [s.x + dx + e, (s.h + 0.5) / 2, s.z], null, 5), 'swing chain')); } }
  return { g, panes };
}

export const NAMED = { mote: MOTE.hero, moteExit: MOTE.exit, moteAfter: MOTE.after, pane: BEAM.centre };
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const { g: houseG, panes } = house(); root.add(houseG);
  const whole = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip });
  // beamSolid cuts its planes in order, so an earlier plane's footprint is not yet trimmed by the later ones: trim each
  // footprint by the other planes here, so the sidecar's footprints are exactly where the light lands
  for (const [name, poly] of Object.entries(whole.caps)) { let pts = poly;
    for (const pl of BEAM.clip) { if (pl.name === name) continue; const N = V(pl.n), out = [];
      for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], dp = N.dot(p) - pl.d, dq = N.dot(q) - pl.d;
        if (dp <= 1e-9) out.push(p); if ((dp < -1e-9 && dq > 1e-9) || (dp > 1e-9 && dq < -1e-9)) out.push(p.clone().lerp(q, dp / (dp - dq))); }
      pts = out; }
    if (pts.length >= 3) whole.caps[name] = pts; else delete whole.caps[name]; }
  const sunk = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip, sink: 0.015 });
  root.add(tag(beamWire(whole, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }), 'sun beam (volume edges)'));
  root.add(tag(beamMesh(sunk, { glass: true, col: SUN.color, opacity: 0.12 }), 'sun beam (volume)'));
  root.add(tag(ball(0.012, { grey: 1, col: 0xffd24a, emit: 0xffd24a, flatEmit: 1, only: ['label', 'lit'], noCast: true }, MOTE.hero), 'the mote'));

  const extra = (t) => (NAMED[t] ? V(NAMED[t]) : null);
  const { figs } = stage(shot.figs || {}, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  // the reflections: the same family, built again, mirrored in the glass plane
  let refl = null;
  if (!shot.beamMask && shot.reflections !== false) { refl = new THREE.Group(); refl.scale.set(1, 1, -1);
    const { figs: twin } = stage(shot.figs || {}, null, extra);
    for (const [who, f] of Object.entries(twin)) { f.traverse((o) => { if (!o.isMesh) return; o.userData.who = 'reflection:' + who; o.userData.label = `reflection of ${CAST[who].name} (silhouette)`;
      o.userData.look = { grey: 0.16, col: 0x14161c, noCast: true, noRecv: true, ...(HUMAN.on ? { formTint: [0.2, 0.21, 0.24], flatCol: 0x14161c } : {}) };   /* mesh mode: the silhouette stays dark in form, not pale clay */ o.castShadow = false; o.receiveShadow = false; }); refl.add(f); }
    root.add(refl); }
  const cs = { ...shot, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  if (shot.eyeline) { const e = figs[shot.eyeline.who].userData.P.eyes.clone(), to = V(fix(shot.eyeline.to)); cs.pos = e.addScaledVector(to.sub(e).normalize(), shot.eyeline.back ?? 0.12).toArray(); delete cs.orbit; }
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);

  const anchor = V(fix(shot.beamAnchor || 'mote'));
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); s.target.position.set(-0.5, 1.2, -0.8); s.position.set(-0.5, 1.2, -0.8).addScaledVector(V(SUN_DIR), -12); s.castShadow = true;
    const c = s.shadow.camera; c.left = -5; c.right = 5; c.top = 4; c.bottom = -4; c.near = 1; c.far = 26; c.updateProjectionMatrix(); s.shadow.bias = -0.0006; s.shadow.normalBias = 0.006; s.shadow.radius = 1.5; return s; };
  const rig = (mode) => {
    if (mode === 'none' || mode === 'mask' || shot.beamMask) return [];
    if (mode === 'lit') return [mkSun(SUN.color, 8), new THREE.AmbientLight(SUN.sky, 0.9)];
    const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(-1, 3, 2);
    return [mkSun(0xffffff, 6), new THREE.AmbientLight(0xffffff, 1.5), d];
  };
  if (shot.beamMask) {
    root.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, grey: 0, flatGrey: 0, emit: undefined, flatEmit: undefined, map: undefined }; });
    root.add(tag(beamMesh(sunk, { grey: 1, emit: 0xffffff, flatEmit: 1 }), 'sun beam (mask)'));
  }
  const lights = [{ name: 'sun', kind: LIGHTS.sun.kind, pos: V(BEAM.centre).addScaledVector(V(SUN_DIR), -9), aim: V(BEAM.centre), color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true }];
  const r3 = (v) => v.toArray().map((x) => +x.toFixed(4)), mir = (v) => V(v.x, v.y, -v.z);
  const extraOut = (c, P) => ({
    film: { time: shot.time || null, section: shot.section || null, position: shot.position || null },
    beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid: whole, anchor, P, cam: c, extra: { sun: { altitude_deg: SUN.altitude, off_pane_normal_deg: SUN.off_normal, time: SUN.time } } }),
    mote: { seed: MOTE.seed, count: MOTE.count, hero_world: MOTE.hero, hero_px: P(V(MOTE.hero)), path_px: [MOTE.hero, MOTE.exit, MOTE.after].map((p) => P(V(p))), note: 'hero -> exit (leaves the beam, 4:35) -> after (where the gold dotted line stops)' },
    reflections: refl ? { model: 'virtual images: the family mirrored in the pane plane z = 0, drawn as silhouettes behind the glass', pane_px: panes.glass.map((p) => P(p)),
      faces: Object.fromEntries(Object.entries(figs).map(([w, f]) => { const Pf = f.userData.P; return [w, { eyes_world: r3(mir(Pf.eyes)), eyes_px: P(mir(Pf.eyes)), head_px: P(mir(Pf.head)) }]; })) } : null,
  });
  return { set: 'playground23', scene, root, cam, rig, near: shot.near ?? 0.3, far: shot.far ?? 8, figs, book: null, panes, lights,
    header: shot.header || '', shadowLine: false, shadowPolys: null, subject: anchor, litBg: 0xd8c8b0, flatBg: shot.beamMask ? 0x000000 : 0x9a9a9a, extra: extraOut };
}
