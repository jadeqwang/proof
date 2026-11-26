// propstest build: the floor, a key light, and the prop(s) of the shot (sets/_props.js).
import * as THREE from 'three';
import { box, tag } from '../../engine/core.js';
import { loadProps, prop } from '../_props.js';
import { NAMES } from './shots.js';
await loadProps(NAMES);

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(tag(box(12, 0.02, 12, { grey: 0.86, col: 0xbfbab0 }, [0, -0.01, 0]), 'floor'));
  if (shot.only) { const p = prop(shot.only, { at: [0, 0, 0] }); if (p) root.add(p); }
  if (shot.lineup) { let x = -2.4, z = 0; for (const n of NAMES) { const p = prop(n, { at: [0, 0, 0] }); if (!p) continue; const s = new THREE.Box3().setFromObject(p).getSize(new THREE.Vector3());
    if (x + s.x > 2.4) { x = -2.4; z -= 0.8; } p.position.set(x + s.x / 2, 0, z); x += s.x + 0.08; root.add(p); } }
  const cam = makeCam(shot);
  const rig = (mode) => {
    if (mode === 'none' || mode === 'mask') return [];
    const d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.set(-2, 4, 3); d.target.position.set(0, 0, 0);
    d.castShadow = true; const sc = d.shadow.camera; sc.left = -3; sc.right = 3; sc.top = 3; sc.bottom = -3; sc.near = 0.5; sc.far = 15;
    return [d, new THREE.AmbientLight(0xffffff, mode === 'lit' ? 0.7 : 1.1)];
  };
  return { set: 'propstest', scene, root, cam, rig, near: shot.near || 0.05, far: 20, figs: {}, book: null, panes: {}, lights: [], header: shot.header || '', shadowLine: false, shadowPolys: null, flatBg: 0x9a9a9a };
}
