// Build one closet02 shot: the closet, the door ajar as real geometry with a shadowed sun behind it, the shaft as
// explicit geometry, two seated figures.
//   shot.beamMask (the generated twins beam_<id>): flat mode renders the shaft white on black = the beam mask
import * as THREE from 'three';
import { box, cyl, tag, V, rad } from '../../engine/core.js';
import { CAST } from '../_cast.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { ROOM, HANDS, DOOR, SUN, SUN_DIR, SHAFT, BEAM, beamAxis, BLOCKERS, RAIL, SHELF, FLOOR_THINGS, MOTE, LIGHTS } from './layout.js';
import { beamSolid, beamMesh, beamWire, beamSidecar } from './beam.js';

// set-local cast (added only if no other set has defined them): Jade at about 19, and first love (a designed figure,
// never shot face-on: back of head and over-the-shoulder only)
// cast: `jade19` and `firstLove19` come from ../_cast.js (one table for every set)

const WALL = { grey: 0.62, col: 0x8a8378, recvShadowLine: true }, FLOOR = { grey: 0.5, col: 0x6b5a48, recvShadowLine: true }, TRIM = { grey: 0.7, col: 0xb8b0a0 };

function closet() {
  const g = new THREE.Group(); const R = ROOM, Lx = R.x1 - R.x0, Lz = R.z1 - R.z0, cx = (R.x0 + R.x1) / 2, w = R.wall;
  g.add(tag(box(Lx + 2 * w, 0.04, Lz + 2 * w, FLOOR, [cx, -0.02, 0]), 'closet floor (carpet)'));
  g.add(tag(box(Lx + 2 * w, 0.04, Lz + 2 * w, { grey: 0.55, col: 0x777068 }, [cx, R.h + 0.02, 0]), 'ceiling'));
  g.add(tag(box(Lx + 2 * w, R.h, w, WALL, [cx, R.h / 2, R.z1 + w / 2]), 'back wall'));
  g.add(tag(box(w, R.h, Lz, WALL, [R.x0 - w / 2, R.h / 2, 0]), 'end wall (behind Jade)'));
  g.add(tag(box(w, R.h, Lz, WALL, [R.x1 + w / 2, R.h / 2, 0]), 'end wall (behind first love)'));
  // the door wall with its opening (hinge .. jamb, floor .. DOOR.h)
  const zc = R.z0 - w / 2, xa = R.x0 - w, xb = R.x1 + w;
  g.add(tag(box(DOOR.hinge - xa, R.h, w, WALL, [(xa + DOOR.hinge) / 2, R.h / 2, zc]), 'door wall'));
  g.add(tag(box(xb - DOOR.jamb, R.h, w, WALL, [(xb + DOOR.jamb) / 2, R.h / 2, zc]), 'door wall'));
  g.add(tag(box(DOOR.w, R.h - DOOR.h, w, WALL, [(DOOR.hinge + DOOR.jamb) / 2, (R.h + DOOR.h) / 2, zc]), 'door wall'));
  // the leaf, hinged on the outer face, opening outward (toward -z) by DOOR.ajar
  { const leaf = new THREE.Group(); leaf.position.set(DOOR.hinge, 0, R.z0 - w); leaf.rotation.y = rad(DOOR.ajar);
    leaf.add(box(DOOR.w, DOOR.h - 0.01, DOOR.t, { grey: 0.74, col: 0xc8c0b0 }, [DOOR.w / 2, (DOOR.h - 0.01) / 2, -DOOR.t / 2]));
    leaf.add(cyl(0.012, 0.012, 0.11, { grey: 0.3, col: 0x9a8a60 }, [DOOR.w - 0.07, 0.98, 0.05], [90, 0, 0], 10));
    g.add(tag(leaf, 'closet door (ajar)')); }
  // the bedroom beyond: not modelled. A bright backdrop, and the two stand-in blockers that give the shaft its upper
  // and lower edge (the window head and the furniture under the window; see layout.js).
  const B = BLOCKERS, bz = R.z0 - B.back, bx = (SHAFT.x0 + SHAFT.x1) / 2, DARK = { grey: 0.3, col: 0x2a2622 };
  g.add(tag(box(B.w, B.lowerTop, 0.03, DARK, [bx, B.lowerTop / 2, bz]), 'bedroom beyond (stand-in: shades the lower edge of the shaft)'));
  g.add(tag(box(B.w, 3.2 - B.upperBottom, 0.03, DARK, [bx, (3.2 + B.upperBottom) / 2, bz]), 'bedroom beyond (stand-in: shades the upper edge of the shaft)'));
  g.add(tag(box(5, 4, 0.05, { grey: 0.96, col: SUN.color, emit: SUN.color, emitI: 1.1, flatEmit: 0.96, noCast: true }, [bx, 1.6, R.z0 - 3]), 'bedroom window light'));
  // rail, garments, shelf, things on the floor
  g.add(tag(cyl(0.016, 0.016, Lx, { grey: 0.5, col: 0x8a8a8a }, [cx, RAIL.y, RAIL.z], [0, 0, 90], 10), 'hanging rail'));
  const G = RAIL.garments; let k = 0;
  for (let x = G.from; x <= G.to; x += G.step, k++) { const d = G.drop[k % G.drop.length], gy = 0.3 + (k % 4) * 0.12;
    g.add(tag(box(0.035 + (k % 3) * 0.012, d, G.w - (k % 2) * 0.05, { grey: gy, col: [0x5a6478, 0x8a5a4a, 0x3a3a40, 0xa09a88][k % 4] }, [x, RAIL.y - 0.05 - d / 2, RAIL.z]), 'hanging clothes')); }
  g.add(tag(box(Lx, 0.02, SHELF.d, TRIM, [cx, SHELF.y, R.z1 - SHELF.d / 2]), 'shelf'));
  g.add(tag(box(0.4, 0.22, 0.3, { grey: 0.55, col: 0x8a7a60 }, [-0.3, SHELF.y + 0.12, R.z1 - 0.2]), 'boxes on the shelf'));
  g.add(tag(box(0.34, 0.16, 0.28, { grey: 0.45, col: 0x6a6a72 }, [0.5, SHELF.y + 0.09, R.z1 - 0.2]), 'boxes on the shelf'));
  for (const [x, z] of FLOOR_THINGS.shoes) g.add(tag(box(0.2, 0.09, 0.1, { grey: 0.25, col: 0x2a2420 }, [x, 0.045, z], [0, 8, 0]), 'shoes'));
  { const b = FLOOR_THINGS.box; g.add(tag(box(b.w, b.h, b.d, { grey: 0.58, col: 0x9a7c55 }, [b.at[0], b.h / 2, b.at[1]]), 'storage box')); }
  return g;
}

export const NAMED = { hands: HANDS, gap: BEAM.centre, beamMid: beamAxis(0.42), beamFloor: beamAxis(BEAM.centre[1] / -SUN_DIR[1]) };
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(closet());
  const solid = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip, length: 4 });
  const sunk = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip, length: 4, sink: 0.01 });
  root.add(tag(beamWire(solid, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }, 0.003), 'door shaft (volume edges)'));
  root.add(tag(beamMesh(sunk, { glass: true, col: SUN.color, opacity: 0.16 }), 'door shaft (volume)'));

  const { figs } = stage(shot.figs || {}, null, (t) => (NAMED[t] ? V(NAMED[t]) : null));
  for (const f of Object.values(figs)) { root.add(f); f.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, recvShadowLine: true }; }); }
  const cs = { ...shot, orbit: shot.orbit ? { ...shot.orbit, at: fix(shot.orbit.at) } : undefined, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);

  const anchor = V(fix(shot.beamAnchor || 'hands'));
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); s.target.position.set(0.2, 1.0, 0); s.position.set(0.2, 1.0, 0).addScaledVector(V(SUN_DIR), -6); s.castShadow = true;
    const c = s.shadow.camera; c.left = -1.6; c.right = 1.6; c.top = 1.9; c.bottom = -1.9; c.near = 0.5; c.far = 12; c.updateProjectionMatrix(); s.shadow.bias = -0.0005; s.shadow.normalBias = 0.004; s.shadow.radius = 1.2; return s; };
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSun(0xffffff, 4)];
    if (mode === 'lit') return [mkSun(SUN.color, 7), new THREE.AmbientLight(0x4a4038, 0.4)];
    const d = new THREE.DirectionalLight(0xffffff, 1.0); d.position.set(2, 3, -0.5);
    return [mkSun(0xffffff, 4), new THREE.AmbientLight(0xffffff, 1.5), d];
  };
  if (shot.beamMask) {
    root.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, grey: 0, flatGrey: 0, emit: undefined, flatEmit: undefined, map: undefined }; });
    root.add(tag(beamMesh(sunk, { grey: 1, emit: 0xffffff, flatEmit: 1 }), 'door shaft (mask)'));
  }
  const sunPos = V(BEAM.centre).addScaledVector(V(SUN_DIR), -3);
  const lights = [{ name: 'door', kind: LIGHTS.door.kind, pos: sunPos, aim: V(HANDS), color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true }];
  const r3 = (v) => v.toArray().map((x) => +x.toFixed(4));
  const extraOut = (c, P) => ({
    film: { time: shot.time || null, section: shot.section || null, position: shot.position || null },
    beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid, anchor, P, cam: c, extra: { sun_altitude_deg: SUN.altitude, door_ajar_deg: DOOR.ajar, gap_m: +(SHAFT.x1 - SHAFT.x0).toFixed(3),
      note: 'upper and lower edges of the shaft come from the unmodelled bedroom (stand-in blockers); the gap gives its width' } }),
    hands: { meet_world: HANDS, meet_px: P(V(HANDS)), each_px: Object.fromEntries(Object.entries(figs).flatMap(([w, f]) => ['L', 'R'].map((n) => [`${w}.${n}`, P(f.userData.P['hand' + n])]))) },
    motes: { seed: MOTE.seed, count: MOTE.count },
    points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'chin', 'handL', 'handR', 'hip', 'shoulderC'].map((k) => [k, r3(f.userData.P[k])]))])),
  });
  return { set: 'closet02', scene, root, cam, rig, near: shot.near ?? 0.2, far: shot.far ?? 3.5, figs, book: null, panes: {}, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor, litBg: 0x040303, flatBg: shot.beamMask ? 0x000000 : 0x555555, extra: extraOut };
}
