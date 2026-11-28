// Canonical eyebrows, one shape per character (2026-11-27). Replace the MakeHuman eyebrow001 proxy (thick, straight,
// blunt dark bars sitting low on the lid: in close shots they read as a browline glasses frame, mv10 V3_rev_temple_b).
//
// Each brow is drawn off its character's cast heads sheet (front head; pupil distance sets the scale): a centre line
// through the head (inner end), the peak and the tail, as fractions of the body's own eye spacing P (x: from the face's
// midline, y: above the eye centre), and a thickness at the head, the peak and the tail (fractions of P). Built in the
// body's REST space as a thin ribbon laid on the skin (each point found by a ray onto the face mesh, lifted 0.6 mm),
// then carried by the head bone like the glasses. Blunt, slightly rounded head; tapered, pointed tail.
// Sides: 'R' = her / his RIGHT brow (picture LEFT in a front view), 'L' = the LEFT brow; a spec without L mirrors R.
// One id group per figure (`<uid>brows`, as the old mesh): line / contour outline it; the POV head-hide (stage.js) hides it.
import * as THREE from 'three';
import { mk } from './core.js';

// measured on the sheets (mm at a 61 mm pupil distance, here / 61): see layout/CAST.md "Eyebrows"
export const BROWS = {
  // Jade 27 (cast/jade_27/jade27_H_heads_v1): fairly strong, slightly asymmetric: her RIGHT brow straight, sloping a
  // little down to the tail; her LEFT runs straight then lifts into a soft arch two-thirds out. Head ~4.6 mm, body ~4,
  // tapering to a fine tail; the brow's lower edge ~14 mm above the pupil
  jade27: { R: { pts: [[0.238, 0.268], [0.50, 0.29], [0.78, 0.235]], w: [0.075, 0.064, 0.016], peak: 0.5 },
            L: { pts: [[0.234, 0.262], [0.575, 0.335], [0.87, 0.28]], w: [0.075, 0.06, 0.014], peak: 0.55 } },
  // Jade 19 (jade19_H_heads_v1): the same brows, a touch softer and higher at the arch
  jade19: { R: { pts: [[0.23, 0.27], [0.50, 0.30], [0.85, 0.257]], w: [0.072, 0.062, 0.016], peak: 0.45 },
            L: { pts: [[0.246, 0.27], [0.52, 0.335], [0.91, 0.27]], w: [0.072, 0.058, 0.014], peak: 0.45 } },
  // Mama (mama_R_rest_heads_v1): clearly drawn, straight-ish and thinner, set higher above the eye; her LEFT lifts a
  // little more at two-thirds
  mama: { R: { pts: [[0.31, 0.30], [0.50, 0.305], [0.85, 0.24]], w: [0.06, 0.052, 0.014], peak: 0.4 },   // 2026-11-28: 1.8 mm lower (front overlay)
          L: { pts: [[0.295, 0.31], [0.64, 0.36], [0.87, 0.31]], w: [0.06, 0.05, 0.014], peak: 0.6 } },
  // Dad (dad_H_heads_v5_likeness; his photo for 2023): thick, dark and nearly straight, long, tail tapering late
  dad: { R: { pts: [[0.23, 0.325], [0.55, 0.345], [0.92, 0.30]], w: [0.115, 0.1, 0.045], peak: 0.55 } },
  // little Jade (lj03 / lj05 / lj07 / lj10 heads sheets): short, thin, softly arched, high over big eyes (mostly under
  // her fringe)
  child: { R: { pts: [[0.27, 0.37], [0.55, 0.43], [0.82, 0.37]], w: [0.05, 0.042, 0.014], peak: 0.5 } },
  // everyone else with a drawn face (no sheet): a plain natural brow
  adult: { R: { pts: [[0.25, 0.30], [0.58, 0.345], [0.87, 0.285]], w: [0.075, 0.064, 0.018], peak: 0.55 } },
};

const zup = (a) => new THREE.Vector3(a[0], a[2], -a[1]);

// per body and scale: a rest-space mesh of the face (body triangles near the eyes) to lay the brows on
function faceMesh(B, k) {
  const key = 'k' + k.toFixed(4); (B._browFace ||= {}); if (B._browFace[key]) return B._browFace[key];
  const e = zup(B.meta.landmarks_blender_zup.eye_l).multiplyScalar(k), P = B.meshes.body.pos, I = B.meshes.body.idx, pos = [];
  const near = (i) => { const y = P[i * 3 + 1] * k, z = P[i * 3 + 2] * k; return Math.abs(y - e.y) < 0.07 && z > e.z - 0.06; };
  for (let f = 0; f < I.length; f += 3) { const a = I[f], b = I[f + 1], c = I[f + 2]; if (!(near(a) && near(b) && near(c))) continue;
    for (const v of [a, b, c]) pos.push(P[v * 3] * k, P[v * 3 + 1] * k, P[v * 3 + 2] * k); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); m.updateMatrixWorld(true);
  return (B._browFace[key] = { e, mesh: m });
}

export function browSpecFor(c, kid) { return BROWS[c.brows] ? c.brows : kid ? 'child' : 'adult'; }

// Build both brows for spec id `bid` on body B (scale k); Mw carries rest-x-k space onto the posed head.
export function buildBrows(bid, B, k, Mw, look, uid) {
  const S = BROWS[bid]; const { e, mesh } = faceMesh(B, k), Pd = 2 * Math.abs(e.x), rc = new THREE.Raycaster(), out = [];
  const onSkin = (x, y) => { rc.set(new THREE.Vector3(x, y, e.z + 0.1), new THREE.Vector3(0, 0, -1)); const h = rc.intersectObject(mesh, false)[0];
    if (!h) return null; const n = h.face.normal.clone(); if (n.z < 0) n.negate(); return h.point.addScaledVector(n, 0.0006); };
  for (const side of ['R', 'L']) {
    const sp = S[side] || S.R, sx = side === 'L' ? 1 : -1;   // her left = +x in rest space
    const curve = new THREE.CatmullRomCurve3(sp.pts.map(([x, y]) => new THREE.Vector3(sx * x * Pd, e.y + y * Pd, 0)), false, 'centripetal');
    const N = 28, top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = curve.getPointAt(t), tg = curve.getTangentAt(t), nrm = new THREE.Vector3(-tg.y, tg.x, 0).normalize(); if (nrm.y < 0) nrm.negate();
      const [w0, w1, w2] = sp.w, tp = sp.peak ?? 0.5;
      let w = t < tp ? w0 + (w1 - w0) * (t / tp) : w2 + (w1 - w2) * (1 - ((t - tp) / (1 - tp)) ** 1.6);
      if (t < 0.06) w *= 0.7 + 0.3 * Math.sin((t / 0.06) * Math.PI / 2);   // a soft, slightly rounded head
      if (t > 0.97) w *= (1 - t) / 0.03;                                    // a pointed tail
      w *= Pd / 2;
      const a = onSkin(p.x + nrm.x * w, p.y + nrm.y * w), b = onSkin(p.x - nrm.x * w, p.y - nrm.y * w);
      if (a && b) { top.push(a); bot.push(b); }
    }
    if (top.length < 4) continue;
    const pos = [], idx = []; for (let i = 0; i < top.length; i++) { pos.push(top[i].x, top[i].y, top[i].z, bot[i].x, bot[i].y, bot[i].z); if (i) { const q = i * 2; idx.push(q - 2, q - 1, q, q - 1, q + 1, q); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); g.applyMatrix4(Mw);
    const m = mk(g, look); m.userData.idGroup = uid + 'brows'; m.userData.double = true; m.userData.brows = bid; out.push(m);
  }
  return out;
}
