// fl_turnaround: first love's turnaround guide (see shots.js). Plain paper floor, a soft key light from upper left,
// the five figures and Arizona-type two-strap cork sandals fitted to each posed foot (sandal.js).
import * as THREE from 'three';
import { box, tag } from '../../engine/core.js';
import { stage, solveCamera } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { sandalsFor, realFeet, footFloor, slacksHem, BED } from './sandal.js';
import { costumeLook } from '../../engine/figure2.js';
// his hair in the colour passes: the measured shade (#3f342e, cast/first_love v9 sheets); the engine gives hair no form tint
const HAIR = 0x3f342e;

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const PAPER = costumeLook({ grey: 0.9, col: 0xeadcce });
  root.add(tag(box(60, 0.02, 60, PAPER, [0, -0.01, 0]), 'floor (paper)'));
  root.add(tag(box(60, 30, 0.02, PAPER, [0, 15, -8]), 'backdrop (paper)'));
  let figs = {};
  if (shot.figs) ({ figs } = stage(shot.figs, null, () => null));
  for (const f of Object.values(figs)) { root.add(f);
    // real-size feet (see sandal.js realFeet), then standing in the sandals: the whole figure rises so the lowest sole
    // point rests on the footbed top (bare: on the floor)
    // 2026-11-27: the engine now scales every mesh foot to the cast's foot length (his = hers, 251 mm), so the set-local
    // stretch is off by default (it would double-apply its 8 % widening); shot.realFeet === true turns the old stretch back on
    const rf = shot.realFeet !== true ? footFloor(f) : realFeet(f); f.userData.realFeet = rf;
    f.position.y += (shot.sandals !== false ? BED : 0) - rf.minY;
    f.traverse((o) => { if (o.isMesh && /hair$/.test(o.userData.idGroup || '') && o.userData.look) o.userData.look = costumeLook({ ...o.userData.look, col: HAIR }); }); }
  root.updateMatrixWorld(true);
  const sandalInfo = {};
  if (shot.sandals !== false) for (const [k, f] of Object.entries(figs)) { const s = sandalsFor(f); root.add(s); sandalInfo[k] = s.userData.fit; if (shot.hem !== false) s.userData.hem = slacksHem(f); }
  if (shot.logFit) console.warn('SANDALFIT ' + JSON.stringify({ sandals: sandalInfo, feet: Object.fromEntries(Object.entries(figs).map(([k, f]) => [k, f.userData.realFeet])) }));
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  const cam = makeCam(shot);
  const rig = (mode) => {
    if (mode === 'none' || mode === 'mask') return [];
    const d = new THREE.DirectionalLight(0xffffff, 1.5); d.position.set(-4, 7, 8); d.target.position.set(0, 0.8, 0);
    d.castShadow = true; const sc = d.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 0.5; sc.far = 25;
    d.shadow.mapSize.set(4096, 4096);
    return [d, new THREE.AmbientLight(0xffffff, mode === 'lit' ? 0.65 : 1.1)];
  };
  return { set: 'fl_turnaround', scene, root, cam, rig, near: 0.2, far: 40, figs, book: null, panes: {}, lights: [], header: shot.header || '', shadowLine: false, shadowPolys: null, flatBg: 0xeadcce, sandalInfo };
}
