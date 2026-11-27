// fl_hands: the hand-holding guide (see shots.js). A plain floor (paper colour), a soft key light from above left.
import * as THREE from 'three';
import { box, tag } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { costumeLook } from '../../engine/figure2.js';
import { aimPaint } from '../../engine/paint.js';

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(tag(box(20, 0.02, 20, costumeLook({ grey: 0.9, col: 0xeadcce }), [0, -0.01, 0]), 'floor (paper)'));
  let figs = {};
  if (shot.figs) ({ figs } = stage(shot.figs, null, () => null));
  for (const f of Object.values(figs)) root.add(f);
  if (shot.logP) { const r = (v) => v && v.toArray ? v.toArray().map((x) => +x.toFixed(3)) : null; console.warn('PFIG ' + JSON.stringify(Object.fromEntries(Object.entries(figs).map(([k, f]) => { const P = f.userData.P; return [k, Object.fromEntries(['hip', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'lap', 'shoulderL', 'shoulderR', 'chest'].map((n) => [n, r(P[n])]))]; })))); }
  if (shot.logHands) { const r = (v) => v.toArray().map((x) => +x.toFixed(4)); console.warn('HANDS ' + JSON.stringify(Object.fromEntries(Object.entries(figs).map(([k, f]) => { const P = f.userData.P;
    return [k, Object.fromEntries(['L', 'R'].map((n) => { const h = P.hands[n]; return [n, { wrist: r(P['wrist' + n]), f: r(h.f), n: r(h.n), joints: h.joints ? Object.fromEntries(Object.entries(h.joints).map(([q, w]) => [q, w.map(r)])) : null }]; }))]; })))); }
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  aimPaint(figs, cam);   // projected paint (figure spec paint): the shot camera is the projector
  const rig = (mode) => {
    if (mode === 'none' || mode === 'mask') return [];
    const d = new THREE.DirectionalLight(0xffffff, 1.4); d.position.set(-2.5, 5, 1.5); d.target.position.set(0, 0.2, 0);
    d.castShadow = true; const sc = d.shadow.camera; sc.left = -1.5; sc.right = 1.5; sc.top = 1.5; sc.bottom = -1.5; sc.near = 0.5; sc.far = 12; d.shadow.mapSize.set(4096, 4096);
    return [d, new THREE.AmbientLight(0xffffff, mode === 'lit' ? 0.7 : 1.1)];
  };
  return { set: 'fl_hands', scene, root, cam, rig, near: 0.05, far: 20, figs, book: null, panes: {}, lights: [], header: shot.header || '', shadowLine: false, shadowPolys: null, flatBg: 0xeadcce };
}
