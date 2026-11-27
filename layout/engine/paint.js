// Projected paint (2026-11-27, fl_hands; Jade: "(1) just his hand, overhead shot, confirm we get a normal looking hand,
// (2) paint his normal looking hand directly into the three.js model, (3) then put her hand on top of it").
// A figure spec option:  paint: { url, hands: ['L'], limbs: { armL: 1 } }
//   url     a painting served under layout/ (e.g. /assets/paint/fl_hands/stage1.png), rendered from the SAME camera as
//           the shot it is projected in (projective texture mapping: uv = the shot camera's view-projection of each
//           fragment), so the painting lands back on the surfaces it was painted from
//   hands   the hand groups ('L' / 'R') that take the paint whole (skin, nails, creases)
//   limbs   per-vertex limb masks on the body skin and the top (sleeve): armL / armR / legL / legR weights (from the rest
//           skin weights), so e.g. only the left forearm and sleeve are painted, never the other arm crossing over
// Modes: form and lit show the painted colour on those surfaces (unlit: the painting carries its own light); contour,
// line and form draw only their outline against other things (no 3D creases / nail lines over the painting).
// Usage in a set: `await preloadPaint([url, ...])` at the top level of shots.js; build.js calls aimPaint(figs, cam).
import * as THREE from 'three';

export const PAINT_TEX = {};
export async function preloadPaint(urls) {
  const L = new THREE.TextureLoader();
  for (const u of urls) { if (u in PAINT_TEX) continue;
    try { const t = await L.loadAsync(u); t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8; PAINT_TEX[u] = t; }
    catch (e) { console.warn('paint: missing ' + u); PAINT_TEX[u] = null; } }
  return PAINT_TEX;
}
const LIMBS = ['armL', 'armR', 'legL', 'legR'];
// per-vertex limb weights (vec4 armL, armR, legL, legR) from a refined mesh's joints / weights and the body's joint names
export function limbWeights(jointNames, jnt, wgt) {
  const grp = jointNames.map((nm) => { const s = nm.slice(-2);
    if (/^(clavicle|upperarm|lowerarm|hand|thumb|index|middle|ring|pinky)_[lr]$/.test(nm)) return s === '_l' ? 0 : 1;
    if (/^(thigh|calf|foot|ball)_[lr]$/.test(nm)) return s === '_l' ? 2 : 3; return -1; });
  const n = jnt.length / 4, out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) { const w = wgt[i * 4 + j], g = grp[jnt[i * 4 + j]]; if (w > 0 && g >= 0) out[i * 4 + g] += w; }
  return out;
}
export const limbMask = (limbs = {}) => new THREE.Vector4(...LIMBS.map((k) => limbs[k] || 0));
// after the camera is made: every painted mesh gets the shot camera's view-projection
export function aimPaint(figs, cam) {
  cam.updateMatrixWorld(true); if (cam.updateProjectionMatrix) cam.updateProjectionMatrix();
  const PV = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  for (const f of Object.values(figs || {})) f.traverse((o) => { if (o.isMesh && o.userData.paint) { o.userData.paint.PV = PV.clone(); if (o.userData.mats) o.userData.mats = {}; } });
}
