// Build one closet02 shot: a reach-in closet with bypass sliding doors (both panels slid left, the right half open),
// the shelf, rod, clothes, coats and duvet from Jade's drawing, the bedroom floor in front, the sun from the bedroom
// window behind first love as a real shadowed directional light, the lit volume as explicit geometry, two figures.
//   shot.beamMask (the generated twins beam_<id>): flat mode renders the lit volume white on black = the beam mask
import * as THREE from 'three';
import { box, cyl, tag, V } from '../../engine/core.js';
import { CAST } from '../_cast.js';   // registers the cast
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { WALL, OPEN, ROOM, DOORS, BEDROOM, SHELF, RAIL, CLOTHES, COATS, DUVET, HANDS, FACE, SUN, SUN_DIR, BEAM, beamAt, WINDOW, SUN_H, MOTE, LIGHTS, TOP_Y } from './layout.js';
import { beamSolid, beamMesh, beamWire, beamSidecar, applyBeamMask } from './beam.js';

// cast: `jade19` and `firstLove19` come from ../_cast.js (one table for every set)

const WALLS = { grey: 0.66, col: 0x9a9286, recvShadowLine: true }, CARPET = { grey: 0.5, col: 0x7a6a58, recvShadowLine: true };
const TRIM = { grey: 0.78, col: 0xd8d0c2 }, PANEL = { grey: 0.74, col: 0xcfc6b4, recvShadowLine: true };
const GARB = [0x4a5468, 0x8a5a4a, 0x34343a, 0xa09a88, 0x6a7a62, 0xb8a890, 0x5a4a60, 0x7a8490];

function closet() {
  const g = new THREE.Group(); const R = ROOM, w = WALL.t, cx = (R.x0 + R.x1) / 2;
  // floors (one carpet), ceiling of the closet, its back and end walls
  g.add(tag(box(BEDROOM.x1 - BEDROOM.x0, 0.04, BEDROOM.z1 - R.z0 + 0.1, CARPET, [(BEDROOM.x0 + BEDROOM.x1) / 2, -0.02, (BEDROOM.z1 + R.z0 - 0.1) / 2]), 'carpet'));
  g.add(tag(box(R.x1 - R.x0 + 0.2, 0.04, R.z1 - R.z0 + 0.1, { grey: 0.6, col: 0x857e74 }, [cx, R.h + 0.02, (R.z0 + R.z1) / 2]), 'closet ceiling'));
  g.add(tag(box(R.x1 - R.x0 + 0.2, R.h, 0.1, WALLS, [cx, R.h / 2, R.z0 - 0.05]), 'closet back wall'));
  for (const [x, n] of [[R.x0 - 0.05, 'left'], [R.x1 + 0.05, 'right']]) g.add(tag(box(0.1, R.h, R.z1 - R.z0, WALLS, [x, R.h / 2, (R.z0 + R.z1) / 2]), `closet end wall (${n})`));
  // the bedroom wall with the opening
  const zc = -w / 2, xa = BEDROOM.x0, xb = BEDROOM.x1;
  g.add(tag(box(OPEN.x0 - xa, R.h, w, WALLS, [(xa + OPEN.x0) / 2, R.h / 2, zc]), 'bedroom wall'));
  g.add(tag(box(xb - OPEN.x1, R.h, w, WALLS, [(xb + OPEN.x1) / 2, R.h / 2, zc]), 'bedroom wall'));
  g.add(tag(box(OPEN.x1 - OPEN.x0, R.h - OPEN.h, w, WALLS, [0, (R.h + OPEN.h) / 2, zc]), 'header'));
  // casing round the opening and a baseboard on the bedroom side
  const cw = 0.065, ct = 0.015;
  g.add(tag(box(cw, OPEN.h + cw, ct, TRIM, [OPEN.x0 - cw / 2, (OPEN.h + cw) / 2, ct / 2]), 'casing'));
  g.add(tag(box(cw, OPEN.h + cw, ct, TRIM, [OPEN.x1 + cw / 2, (OPEN.h + cw) / 2, ct / 2]), 'casing'));
  g.add(tag(box(OPEN.x1 - OPEN.x0 + 2 * cw, cw, ct, TRIM, [0, OPEN.h + cw / 2, ct / 2]), 'casing'));
  g.add(tag(box(OPEN.x0 - cw - xa, 0.09, 0.012, TRIM, [(xa + OPEN.x0 - cw) / 2, 0.045, 0.006]), 'baseboard'));
  g.add(tag(box(xb - OPEN.x1 - cw, 0.09, 0.012, TRIM, [(xb + OPEN.x1 + cw) / 2, 0.045, 0.006]), 'baseboard'));
  // the two panels, both slid left (front track and rear track), and the track at the head
  for (const [z, n, dx] of [[DOORS.zFront, 'front', 0], [DOORS.zRear, 'rear', -0.015]]) {
    const x0 = OPEN.x0 + dx, P = new THREE.Group();
    P.add(box(DOORS.w, DOORS.h, DOORS.t, PANEL, [x0 + DOORS.w / 2, 0.01 + DOORS.h / 2, z]));
    if (n === 'front') P.add(box(0.02, 0.10, 0.012, { grey: 0.35, col: 0x6a6258 }, [x0 + DOORS.w - 0.06, 0.98, z + DOORS.t / 2 + 0.006]));   // finger pull
    g.add(tag(P, `sliding door (${n} panel, slid left)`));
  }
  g.add(tag(box(OPEN.x1 - OPEN.x0, 0.03, 0.10, { grey: 0.55, col: 0x8a8a86 }, [0, OPEN.h - 0.015, -0.055]), 'door track'));
  // shelf with textbooks and shoeboxes
  const sz = R.z0 + SHELF.d / 2;
  g.add(tag(box(R.x1 - R.x0, SHELF.t, SHELF.d, TRIM, [cx, SHELF.y - SHELF.t / 2, sz]), 'shelf'));
  g.add(tag(cyl(0.014, 0.014, R.x1 - R.x0, { grey: 0.5, col: 0x9a9a9a }, [cx, RAIL.y, RAIL.z], [0, 0, 90], 10), 'rod'));
  const books = [[0.18, 0.045, 0.27, 0x7a2a2a], [0.225, 0.04, 0.26, 0x2a3a6a], [0.265, 0.05, 0.28, 0x3a5a3a], [0.31, 0.035, 0.25, 0xa08a40],
    [0.345, 0.045, 0.27, 0x5a2a4a], [0.385, 0.04, 0.24, 0x2a5a6a], [-0.60, 0.05, 0.27, 0x6a3a2a], [-0.55, 0.04, 0.26, 0x2a2a5a]];
  for (const [x, t, h, c] of books) g.add(tag(box(t, h, 0.21, { grey: 0.32 + (h * 3) % 0.2, col: c }, [x, SHELF.y + h / 2, R.z0 + 0.12]), 'textbooks'));
  g.add(tag(box(0.28, 0.06, 0.22, { grey: 0.4, col: 0x6a4a3a }, [0.27, SHELF.y + 0.28 + 0.03, R.z0 + 0.12]), 'textbooks (lying flat)'));
  const shoe = { grey: 0.62, col: 0xb09a78 }, shoe2 = { grey: 0.5, col: 0x8a8070 };
  for (const [x, y, L] of [[0.62, 0, shoe], [0.62, 0.12, shoe2], [0.63, 0.24, shoe], [0.80, 0, shoe2], [0.80, 0.12, shoe], [-0.25, 0, shoe], [-0.25, 0.12, shoe2]])
    g.add(tag(box(0.32, 0.115, 0.19, L, [x, SHELF.y + y + 0.0575, R.z0 + 0.11]), 'shoeboxes'));
  // hanging clothes: simple masses (a hanger-shouldered slab each) all along the rod
  let k = 0;
  for (let x = CLOTHES.from; x <= CLOTHES.to + 1e-6; x += CLOTHES.step, k++) {
    if (x > COATS.xs[0] - 0.05 && x < COATS.xs[COATS.xs.length - 1] + 0.05) continue;   // the coats take that stretch
    const hem = CLOTHES.hem[k % CLOTHES.hem.length], top = RAIL.y - 0.05, d = top - hem, t = 0.03 + (k % 3) * 0.012, gw = CLOTHES.w - (k % 2) * 0.05;
    const G = new THREE.Group(), L = { grey: 0.3 + (k % 4) * 0.1, col: GARB[k % GARB.length] };
    G.add(box(t, d, gw, L, [x, top - d / 2, RAIL.z]));
    G.add(box(t * 0.6, 0.04, gw * 0.7, L, [x, top + 0.015, RAIL.z]));   // shoulders on the hanger
    g.add(tag(G, 'hanging clothes'));
  }
  COATS.xs.forEach((x, i) => { const top = RAIL.y - 0.05, d = top - COATS.hem[i], L = { grey: 0.22 + i * 0.08, col: [0x2a2c34, 0x5a4636, 0x3a3e46][i] };
    g.add(tag(box(COATS.t, d, COATS.w, L, [x, top - d / 2, RAIL.z]), 'long coats')); });
  // shoes on the floor at the back (mostly behind the panels), the duvet she sits on
  for (const [x, z] of [[-0.62, -0.62], [-0.42, -0.60], [-0.15, -0.63], [0.86, -0.62]]) g.add(tag(box(0.10, 0.09, 0.22, { grey: 0.25, col: 0x2a2420 }, [x, 0.045, z], [0, 6, 0]), 'shoes'));
  { const D = DUVET, L = { grey: 0.84, col: 0xe8e0d0, recvShadowLine: true };
    g.add(tag(box(D.w, D.h, D.d, L, [D.at[0], D.h / 2, D.at[1]]), 'folded duvet cover'));
    g.add(tag(box(D.w - 0.03, 0.018, 0.03, { grey: 0.7, col: 0xcfc6b6 }, [D.at[0], D.h * 0.55, D.at[1] + D.d / 2 + 0.005]), 'folded duvet cover')); }   // the fold
  // the window behind him (stand-in, never in frame): a wall square to the light with a hole; it gives the light its
  // top edge (above her head) and keeps the rest of the bedroom out of the sun
  { const W = WINDOW, S = new THREE.Group(), L = { grey: 0.3, col: 0x2a2622 }, u = (a, b) => [(a + b) / 2, b - a];
    S.position.set(W.at[0], 0, W.at[2]); S.rotation.y = Math.atan2(SUN_H[0], SUN_H[2]);
    const [lc, lw] = u(-W.w / 2, W.u0), [rc, rw] = u(W.u1, W.w / 2), [mc, mw] = u(W.u0, W.u1);
    S.add(box(lw, W.h, 0.03, L, [lc, W.h / 2, 0]), box(rw, W.h, 0.03, L, [rc, W.h / 2, 0]));
    S.add(box(mw, W.h - W.head, 0.03, L, [mc, (W.h + W.head) / 2, 0]), box(mw, W.sill + 1, 0.03, L, [mc, (W.sill - 1) / 2, 0]));
    g.add(tag(S, 'bedroom window (stand-in, not seen)')); }
  return g;
}

export const NAMED = { hands: HANDS, face: FACE, opening: [(DOORS.edge + OPEN.x1) / 2, 1.0, 0], beamMid: beamAt(HANDS, -0.35), floorIn: [0.5, 0, -0.4] };
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p && p.mid ? { mid: p.mid.map(fix) } : p);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(closet());
  const solid = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip, length: 4 });
  const sunk = beamSolid({ aperture: BEAM.aperture, dir: BEAM.dir, clip: BEAM.clip, length: 4, sink: 0.01 });
  if (!shot.noBeamVolume) {
    root.add(tag(beamWire(solid, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }, 0.003), 'sunlight (volume edges)'));
    root.add(tag(beamMesh(sunk, { glass: true, col: SUN.color, opacity: 0.10 }), 'sunlight (volume)'));
  }

  const { figs } = stage(shot.figs || {}, null, (t) => (NAMED[t] ? V(NAMED[t]) : null));
  for (const f of Object.values(figs)) { root.add(f); f.traverse((o) => { if (o.isMesh && o.userData.look) o.userData.look = { ...o.userData.look, recvShadowLine: true }; }); }
  const cs = { ...shot, orbit: shot.orbit ? { ...shot.orbit, at: fix(shot.orbit.at) } : undefined, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);

  const anchor = V(fix(shot.beamAnchor || 'hands'));
  const mkSun = (color, I) => { const s = new THREE.DirectionalLight(color, I); const c0 = V([0.45, 0.9, -0.2]); s.target.position.copy(c0); s.position.copy(c0).addScaledVector(V(SUN_DIR), -12); s.castShadow = true;
    const c = s.shadow.camera; c.left = -2.6; c.right = 2.6; c.top = 2.6; c.bottom = -2.6; c.near = 0.5; c.far = 25; c.updateProjectionMatrix(); s.shadow.bias = -0.0005; s.shadow.normalBias = 0.004; s.shadow.radius = 1.0; return s; };
  const rig = (mode) => {
    if (mode === 'none' || shot.beamMask) return [];
    if (mode === 'mask') return [mkSun(0xffffff, 4)];
    if (mode === 'lit') return [mkSun(SUN.color, 7), new THREE.AmbientLight(0x4a4038, 0.45)];
    const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(-1, 3, 2);
    return [mkSun(0xffffff, 4), new THREE.AmbientLight(0xffffff, 1.5), d];
  };
  // the mask: lit surfaces white, and the lit air as a white volume unless the camera stands in it (CL_hands) or the
  // shot is a __surf twin (lit surfaces only; figures' cast shadows are not cut out: see the flat render)
  let maskInfo = null;
  if (shot.beamMask) { root.traverse((o) => { if (o.isMesh && /sunlight \(volume/.test(o.userData.label || '')) o.visible = false; });
    maskInfo = applyBeamMask(root, [solid], { label: 'sunlight (mask)', cam, surfaceOnly: !!shot.beamSurf }); }
  const sunPos = V(FACE).addScaledVector(V(SUN_DIR), -3);
  const lights = [{ name: 'door', kind: LIGHTS.door.kind, pos: sunPos, aim: V(FACE), color: '#' + SUN.color.toString(16).padStart(6, '0'), on: true }];
  const r3 = (v) => v.toArray().map((x) => +x.toFixed(4));
  const extraOut = (c, P) => ({
    film: { time: shot.time || null, section: shot.section || null, position: shot.position || null },
    beam: beamSidecar({ name: BEAM.name, kind: BEAM.kind, solid, anchor, P, cam: c, extra: { sun_altitude_deg: SUN.altitude, sun_azimuth_deg: SUN.azimuth, opening_m: +(OPEN.x1 - DOORS.edge).toFixed(3),
      band_top_at_face_m: TOP_Y, note: 'left edge: the slid-open panels; right edge: the jamb; top edge: the bedroom window head (stand-in slab); bottom: the floor' } }),
    hands: { meet_world: HANDS, meet_px: P(V(HANDS)), each_px: Object.fromEntries(Object.entries(figs).flatMap(([w, f]) => ['L', 'R'].map((n) => [`${w}.${n}`, P(f.userData.P['hand' + n])]))) },
    motes: { seed: MOTE.seed, count: MOTE.count }, mask: maskInfo,
    points_world: Object.fromEntries(Object.entries(figs).map(([w, f]) => [w, Object.fromEntries(['eyes', 'head', 'chin', 'handL', 'handR', 'hip', 'shoulderC'].map((k) => [k, r3(f.userData.P[k])]))])),
  });
  return { set: 'closet02', scene, root, cam, rig, near: shot.near ?? 0.05, far: shot.far ?? 6, figs, book: null, panes: {}, lights,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.shadowLine !== false, shadowPolys: null, subject: anchor, litBg: 0x040303, flatBg: shot.beamMask ? 0x000000 : 0x555555, extra: extraOut };
}
