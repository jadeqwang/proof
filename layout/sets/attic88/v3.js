// attic88 v3 pieces: the blade sign, its effective light point, the hook rail, the climbable book stack.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, tag, V, rad, textTexture } from '../../engine/core.js';
import { WINDOW, SIGN_V3, HOOKS, bookT } from './layout.js';

export const WALL_OUT = 3.62;   // outer face of the window gable
export const signSpec = (shot) => ({ ...SIGN_V3, ...(shot.sign || {}) });

export function signV3(g, shot) {
  const S = signSpec(shot), on = shot.light?.neon !== 'off', col = shot.light?.neon === 'blue' ? S.blue : S.red;
  const xm = (S.x0 + S.x1) / 2, ym = (S.y0 + S.y1) / 2, w = S.x1 - S.x0, h = S.y1 - S.y0, DARK = { grey: 0.25, col: 0x1a1414, noCast: true };
  g.add(tag(box(w, h, S.t, { ...DARK, grey: 0.3 }, [xm, ym, S.z]), 'neon blade sign (perpendicular to the wall)'));
  for (const y of [S.y1 - 0.1, S.y0 + 0.1]) g.add(tag(box(S.x0 - WALL_OUT + 0.02, 0.04, 0.04, DARK, [(S.x0 + WALL_OUT) / 2, y, S.z]), 'sign bracket'));
  const info = { spec: { plane_z: S.z, x_from_wall: [+(S.x0 - WALL_OUT).toFixed(2), +(S.x1 - WALL_OUT).toFixed(2)], x: [S.x0, S.x1], y: [S.y0, S.y1], thickness: S.t }, faces: {}, blocks: [] };
  for (const s of [1, -1]) { // s = +1: the face toward +z (seen from the door end / A1), -1: the face toward -z (seen from the mats)
    const z = S.z + s * (S.t / 2 + 0.003), name = s > 0 ? 'face_plus_z' : 'face_minus_z';
    // corners as the face is READ from its own side: looking -z the reader's right is +x; looking +z it is -x
    const Q = (xa, xb, ya, yb, dz = 0) => (s > 0 ? [V(xa, yb, z + s * dz), V(xb, yb, z + s * dz), V(xb, ya, z + s * dz), V(xa, ya, z + s * dz)] : [V(xb, yb, z + s * dz), V(xa, yb, z + s * dz), V(xa, ya, z + s * dz), V(xb, ya, z + s * dz)]);
    info.faces[name] = Q(S.x0, S.x1, S.y0, S.y1);
    for (const [text, ya, yb, bw] of S.blocks) {
      const c = Q(xm - bw / 2, xm + bw / 2, ya, yb, 0.002);
      g.add(tag(quad(c, { grey: on ? 0.95 : 0.4, col: 0x221010, emit: on ? col : undefined, emitI: 1.5, flatEmit: on ? 0.97 : 0.45, hide: ['label'], noCast: true }), `neon lettering block: ${text}`));
      const big = text.length === 1; const tex = textTexture([{ text, font: big ? 'bold 200px Droid Sans Fallback, sans-serif' : 'bold 120px DejaVu Sans, sans-serif' }], { w: big ? 256 : 512, h: big ? 256 : 170, fg: '#d0140a', bg: '#f4e8e0' });
      g.add(tag(quad(c, { grey: 0.9, map: tex, only: ['label'], noCast: true }), `neon lettering: ${text}`));
      info.blocks.push({ text, face: name, world: c });
    }
  }
  g.add(tag(box(0.1, 8, 14, { grey: 0.12, col: 0x0a0c14, noCast: true }, [S.x1 + 6, 1, 0]), 'night outside'));
  return info;
}

// The part of the blade a point in the room can see through the window opening: centroid (the effective light point for
// shadows from there) and extent (the penumbra). The face toward the target is sampled.
export function neonSource(S, target) {
  const W = WINDOW, za = W.z - W.w / 2, zb = W.z + W.w / 2, ya = W.sill, yb = W.sill + W.h;
  const zf = S.z + Math.sign(target.z - S.z || 1) * (S.t / 2 + 0.02);
  const c = new THREE.Vector3(); let n = 0, tot = 0; const ext = { x: [1e9, -1e9], y: [1e9, -1e9] };
  for (let i = 0; i <= 24; i++) for (let j = 0; j <= 80; j++) {
    const p = new THREE.Vector3(S.x0 + (S.x1 - S.x0) * i / 24, S.y0 + (S.y1 - S.y0) * j / 80, zf); tot++;
    let ok = true; for (const xw of [W.x, WALL_OUT]) { const t = (xw - p.x) / (target.x - p.x); const y = p.y + (target.y - p.y) * t, z = p.z + (target.z - p.z) * t; if (z < za || z > zb || y < ya || y > yb) ok = false; }
    if (!ok) continue; n++; c.add(p); ext.x = [Math.min(ext.x[0], p.x), Math.max(ext.x[1], p.x)]; ext.y = [Math.min(ext.y[0], p.y), Math.max(ext.y[1], p.y)];
  }
  if (!n) return { pos: new THREE.Vector3((S.x0 + S.x1) / 2, Math.min(S.y1 - 0.3, 1.1), zf), visible: 0, ext: null };
  return { pos: c.multiplyScalar(1 / n), visible: +(n / tot).toFixed(3), ext };
}

// hook rail beside the stair door. shot.hooks: 'empty' | 'hung' (apron on hook 1, towel on hook 2)
export function hooksV3(g, shot) {
  const H = HOOKS, x = H.x, zc = (H.z[0] + H.z[H.z.length - 1]) / 2, WD = { grey: 0.5, col: 0x5a4632 };
  g.add(tag(box(0.022, 0.07, Math.abs(H.z[0] - H.z[H.z.length - 1]) + 0.14, WD, [x + 0.011, H.y, zc]), 'hook rail'));
  for (const z of H.z) { g.add(tag(box(0.06, 0.014, 0.014, { grey: 0.2, col: 0x2a2420 }, [x + 0.05, H.y - 0.005, z]), 'hooks'));
    g.add(tag(box(0.014, 0.035, 0.014, { grey: 0.2, col: 0x2a2420 }, [x + 0.075, H.y + 0.008, z]), 'hooks')); }
  if (shot.hooks === 'hung' || shot.hooks === 'towel') {
    const T = { grey: 0.86, col: 0xd8d2c0 }; const tz = H.z[2];
    g.add(tag(box(0.03, 0.46, 0.2, T, [x + 0.045, H.y - 0.25, tz]), 'towel (on the hook)')); g.add(tag(box(0.035, 0.05, 0.05, T, [x + 0.05, H.y - 0.01, tz]), 'towel (on the hook)'));
  }
  if (shot.hooks === 'hung') {
    const A = { grey: 0.72, col: 0xb9b2a0 }, az = H.z[1];
    g.add(tag(box(0.022, 0.6, 0.3, A, [x + 0.04, H.y - 0.44, az]), 'apron (on the hook)'));
    g.add(tag(box(0.02, 0.2, 0.13, A, [x + 0.04, H.y - 0.07, az]), 'apron (on the hook)'));   // bib + neck loop
    for (const s of [-1, 1]) g.add(tag(box(0.012, 0.3, 0.014, A, [x + 0.05, H.y - 0.5, az + s * 0.16], [s * 8, 0, 0]), 'apron (on the hook)'));   // strings
  }
}
export const hookPoint = (i) => V(HOOKS.x + 0.08, HOOKS.y + 0.01, HOOKS.z[i]);

// the textbooks. spec: { at: [x, z], n, mode: 'stack' | 'topple' | 'scatter', dir: [dx, dz] (fall direction) }
export function bookStack(g, spec) {
  const [x, z] = spec.at, n = spec.n, dir = spec.dir || [1, 0], mode = spec.mode || 'stack'; let y = 0;
  const COL = [0x3a5a7a, 0x7a3a2a, 0x4a6a3a, 0xa08a50];
  const scatter = [[0.34, 0.1, 25, 0], [0.52, -0.22, -40, 0], [0.2, -0.36, 80, 0], [0.74, 0.12, 12, 0], [0.5, 0.34, -65, 0], [0.92, -0.14, 50, 0]];
  for (let k = 0; k < n; k++) {
    const t = bookT(k), w = 0.2 + (k % 2) * 0.02, d = 0.27 - (k % 3) * 0.012; const look = { grey: 0.3 + (k % 4) * 0.12, col: COL[k % 4] };
    let b;
    if (mode === 'stack') { b = box(w, t, d, look, [x + ((k * 13) % 5 - 2) * 0.012, y + t / 2, z + ((k * 7) % 5 - 2) * 0.01]); b.rotation.y = rad(((k * 37) % 25) - 12); }
    else if (mode === 'topple') { const s = Math.max(0, k - 2); const off = 0.011 * s * s; b = box(w, t, d, look, [x + dir[0] * off, y + t / 2 + 0.004 * s * s, z + dir[1] * off]);
      b.rotation.set(rad(dir[1] * 3.2 * s), rad(((k * 37) % 25) - 12), rad(dir[0] * -3.2 * s), 'YXZ'); }
    else { if (k < 3) { b = box(w, t, d, look, [x + (k - 1) * 0.03, y + t / 2, z]); b.rotation.y = rad(k * 14 - 10); }
      else { const [dx, dz, yaw, tilt] = scatter[(k - 3) % scatter.length]; b = box(w, t, d, look, [x + dir[0] * dx - dir[1] * dz, t / 2 + 0.001, z + dir[1] * dx + dir[0] * dz]); b.rotation.y = rad(yaw); } }
    g.add(tag(b, mode === 'scatter' ? 'textbooks (scattered)' : mode === 'topple' ? 'stack of textbooks (toppling)' : 'stack of textbooks')); y += t;
  }
}
