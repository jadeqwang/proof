// mtest: the mannequin test sheet (2026-11-25 articulated mannequin). Not a film set: an empty floor with figures in
// test poses and every named hand shape built on its own, for checking joints and fingers in line and flat.
//   node layout/render.mjs --set mtest --modes line,flat,label --nojson ; sh layout/sets/mtest/sheet.sh
import * as THREE from 'three';
import { box, tag, V } from '../../engine/core.js';
import { stage, solveCamera } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { CAST, PROP } from '../_cast.js';
import { buildHand, HANDS } from '../../engine/hand.js';

export const SHAPES = Object.keys(HANDS);

// a hand on its own: wrist at w, fingers up, turned so the camera (looking -z) sees `view`
function lone(side, who, shape, w, view, look) {
  const Lh = PROP[CAST[who].kind].hand * CAST[who].h, f = new THREE.Vector3(0, 1, 0);
  const sgn = side === 'R' ? 1 : -1;   // R: t = f x n ; L: t = n x f
  const dirs = { palm: [0, 0, 1], back: [0, 0, -1], thumb: [-sgn, 0, 0], little: [sgn, 0, 0], q3: [-sgn * 0.7, 0, 0.7], q3b: [-sgn * 0.7, 0, -0.7] };
  const n = V(dirs[view]).normalize();
  const g = new THREE.Group();
  const h = buildHand(side, Lh, shape, V(w), f, n, look, g, { kind: CAST[who].kind, id: `lone:${side}:${shape}:${w.join(',')}` });
  tag(g, `${typeof shape === 'string' ? shape : shape.shape + '*'} (${side})`);
  return { g, h };
}

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(tag(box(12, 0.02, 12, { grey: 0.86, col: 0xbfbab0 }, [0, -0.01, 0]), 'floor'));
  let figs = {};
  if (shot.figs) ({ figs } = stage(shot.figs, null, () => null));
  for (const f of Object.values(figs)) root.add(f);
  if (shot.hands) {
    const { who, side, view, views, cols = 7, dx = 0.27, dy = 0.3, shapes = SHAPES, y0 = 1.0 } = shot.hands;
    const look = { grey: 0.78, col: 0xe3b692 };
    if (views) shapes.forEach((s, c) => views.forEach((v, r) => { const sd = v.side || side; root.add(lone(sd, who, s, [(c - (shapes.length - 1) / 2) * dx, y0 - r * dy, 0], v.view || v, look).g); }));   // columns = shapes, rows = views
    else shapes.forEach((s, i) => { const c = i % cols, r = Math.floor(i / cols); const w = [(c - (cols - 1) / 2) * dx, y0 - r * dy, 0];
      root.add(lone(side, who, s, w, view, look).g); });
  }
  if (shot.extra) shot.extra(root, figs);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  const cam = makeCam(shot);
  const rig = (mode) => {
    if (mode === 'none' || mode === 'mask') return [];
    const d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.copy(cam.position).add(new THREE.Vector3(-2, 3, 1)); d.target.position.set(0, 0.8, 0);
    d.castShadow = true; const sc = d.shadow.camera; sc.left = -3; sc.right = 3; sc.top = 3; sc.bottom = -3; sc.near = 0.5; sc.far = 15;
    return [d, new THREE.AmbientLight(0xffffff, mode === 'lit' ? 0.6 : 1.1)];
  };
  return { set: 'mtest', scene, root, cam, rig, near: 0.2, far: 8, figs, book: null, panes: {}, lights: [], header: shot.header || '', shadowLine: false, shadowPolys: null, flatBg: 0x9a9a9a };
}
