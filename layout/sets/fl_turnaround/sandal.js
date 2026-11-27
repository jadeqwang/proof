// Arizona-type two-strap cork-footbed sandals, fitted to a posed engine body's bare feet (fl_turnaround).
// No CC0 / CC-BY Arizona-type model was found (Poly Haven has no sandals; the Objaverse/Sketchfab candidates were a
// textureless scan on its ground plane, a child's back-strap sandal and cross-strap slides; see NOTES.md), so the
// sandal is built here from the measured foot: footbed outline = the foot's footprint plus a rim, at least a men's
// US 9 (EU 42, footbed 27 cm); two wide leather straps arched over the foot, clear of its own vertices by >= 2 mm
// (no clipping by construction), each with a buckle on the outer side; the front strap sits behind the toes, so all
// five toes show in front of it.
import * as THREE from 'three';
import { mk, tag } from '../../engine/core.js';
import { costumeLook } from '../../engine/figure2.js';

export const BED = 0.028;                 // footbed top above the floor (sole 10 mm + cork 16 mm + suede liner 2 mm)
export const FOOTBED_LEN = 0.27;          // men's US 9 / EU 42 Arizona footbed
const SOLE = costumeLook({ grey: 0.2, col: 0x2e241c }), CORK = costumeLook({ grey: 0.55, col: 0xb38a5e }),
  LINER = costumeLook({ grey: 0.45, col: 0x8f6a4a }), STRAP = costumeLook({ grey: 0.25, col: 0x4a3326 }), BUCKLE = costumeLook({ grey: 0.6, col: 0x9a948a });
const UPV = new THREE.Vector3(0, 1, 0);
const body = (o) => o.isMesh && !o.userData.garment && !/hair|eye/.test(o.userData.idGroup || '') && o.geometry?.attributes?.position;

// the foot's own frame: heel point, d (heel -> toe, flat), l (the foot's left, flat)
function frame(P, n) { const heel = P['heel' + n].clone(), toe = P['toe' + n].clone(); heel.y = toe.y = 0;
  const d = toe.clone().sub(heel).normalize(); return { heel, toe, d, l: new THREE.Vector3(d.z, 0, -d.x) }; }
const segD = (p, a, b) => { const ab = b.clone().sub(a), t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1); return a.clone().addScaledVector(ab, t).distanceTo(p); };
const mine = (P, n) => { const o = n === 'L' ? 'R' : 'L', a = frame(P, n), b = frame(P, o);
  return (q) => { const f = q.clone(); f.y = 0; const dn = segD(f, a.heel, a.toe); return dn < 0.1 && dn < segD(f, b.heel, b.toe); }; };

// FEET TO REAL SIZE (set-local; the engine is not touched). The engine's 1.78 m first-love body has 217 mm feet
// (12.2 % of height; a man's foot is ~15 %, the cast note in mortongrove07 says 248 mm). Each foot is stretched about
// its ankle to `len` heel-to-toe (along the foot x sx, across x sy), blended out between 5 and 11 cm above the sole so
// the ankle and the jeans are unchanged. Returns the lowest sole point (world y) and the measured lengths.
// the lowest sole point (world y) without changing the feet (the engine's feet are real size since 2026-11-27)
export function footFloor(fig) {
  fig.updateMatrixWorld(true); const P = fig.userData.P, v = new THREE.Vector3(), out = { minY: Infinity };
  for (const n of ['L', 'R']) { const isMine = mine(P, n), F = frame(P, n); let lo = 1e9, hi = -1e9;
    fig.traverse((o) => { if (!body(o)) return; const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y < 0.12 && isMine(v)) { out.minY = Math.min(out.minY, v.y); const u = v.clone().sub(F.heel).dot(F.d); lo = Math.min(lo, u); hi = Math.max(hi, u); } } });
    out[n] = { engine_mm: Math.round((hi - lo) * 1000) }; }
  return out;
}

export function realFeet(fig, len = 0.251, sy = 1.08) {   // 251 mm: Jade 2026-11-26, his feet identical to hers (they shared shoes)
  fig.updateMatrixWorld(true);
  const P = fig.userData.P, out = { minY: Infinity };
  for (const n of ['L', 'R']) {
    const F = frame(P, n), isMine = mine(P, n), pts = [];
    const v = new THREE.Vector3();
    fig.traverse((o) => { if (!body(o)) return; const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y < 0.12 && isMine(v)) pts.push(v.clone()); } });
    const us = pts.map((p) => p.clone().sub(F.heel).dot(F.d)), umin = Math.min(...us), umax = Math.max(...us), len0 = umax - umin;
    const ankle = P['ankle' + n].clone(); const up = ankle.clone().sub(F.heel).dot(F.d), vp = ankle.clone().sub(F.heel).dot(F.l);
    // the part ahead of the ankle pivot grows by sx, the heel moves back by sxh (35 % of the stretch): total = len
    const k = (len - len0) / ((umax - up) + 0.35 * (up - umin)), sx = 1 + k, sxh = 1 + 0.35 * k;
    const y0 = Math.min(...pts.map((p) => p.y));
    const inv = new THREE.Matrix4();
    fig.traverse((o) => { if (!body(o)) return; const p = o.geometry.attributes.position; inv.copy(o.matrixWorld).invert(); let ch = false;
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y > 0.12 || !isMine(v)) continue;
        const h = v.y - y0, w = h < 0.05 ? 1 : h > 0.11 ? 0 : 0.5 + 0.5 * Math.cos((h - 0.05) / 0.06 * Math.PI); if (w <= 0) continue;
        const r = v.clone().sub(F.heel), u = r.dot(F.d), s = r.dot(F.l), du = (u - up) * ((u > up ? sx : sxh) - 1) * w, ds = (s - vp) * (sy - 1) * w;
        v.addScaledVector(F.d, du).addScaledVector(F.l, ds); v.applyMatrix4(inv); p.setXYZ(i, v.x, v.y, v.z); ch = true; }
      if (ch) { p.needsUpdate = true; o.geometry.computeBoundingSphere(); o.geometry.computeBoundingBox(); } });
    out[n] = { before_mm: Math.round(len0 * 1000), after_mm: Math.round(len0 * 1000 + (umax - up) * (sx - 1) * 1000 + (up - umin) * (sxh - 1) * 1000) };
    out.minY = Math.min(out.minY, y0);
  }
  return out;
}

function footPoints(fig, P, n) {
  const pts = [], v = new THREE.Vector3(), isMine = mine(P, n);
  fig.updateMatrixWorld(true);
  fig.traverse((o) => { if (!body(o)) return; const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y < BED + 0.13 && isMine(v)) pts.push(v.clone()); } });
  return pts;
}
function upperHull(P) { const s = P.slice().sort((a, b) => a[0] - b[0]), h = [];
  for (const p of s) { while (h.length >= 2) { const [a, b] = [h[h.length - 2], h[h.length - 1]]; if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0) h.pop(); else break; } h.push(p); } return h; }
const interp = (h, x) => { if (x <= h[0][0]) return h[0][1]; for (let i = 1; i < h.length; i++) if (x <= h[i][0]) { const [a, b] = [h[i - 1], h[i]]; const t = (x - a[0]) / (b[0] - a[0] || 1); return a[1] + t * (b[1] - a[1]); } return h[h.length - 1][1]; };

export function sandalsFor(fig) {
  const P = fig.userData.P, g = new THREE.Group(), fit = {};
  for (const n of ['L', 'R']) {
    const { heel, d, l } = frame(P, n), out = n === 'L' ? 1 : -1;   // outer side = +l for the left foot, -l for the right
    const fp = footPoints(fig, P, n).map((p) => { const r = p.clone().sub(heel); return { u: r.dot(d), v: r.dot(l), y: p.y }; });
    const umin = Math.min(...fp.map((p) => p.u)), umax = Math.max(...fp.map((p) => p.u)), footLen = umax - umin;
    // ---- footbed outline: the footprint (vertices within 15 mm of the sole) + a 7 mm rim, at least an Arizona shape
    const L = Math.max(FOOTBED_LEN, footLen + 0.022), u0 = umin - 0.008, N = 60, rim = 0.005;
    const sole = fp.filter((p) => p.y < BED + 0.035);   // the foot's widest within 35 mm of the sole: the footbed is wider than the foot everywhere
    const rows = [];
    for (let i = 0; i <= N; i++) { const t = i / N, u = u0 + t * L, band = sole.filter((p) => Math.abs(p.u - u) < 0.006);
      rows.push({ t, u, lo: band.length > 3 ? Math.min(...band.map((p) => p.v)) - rim : null, hi: band.length > 3 ? Math.max(...band.map((p) => p.v)) + rim : null }); }
    // a clean Arizona outline (half-width: heel 3.6 cm, waist 4.0, ball 5.0, toe 4.7 cm; super-elliptic heel and toe)
    // on a straight centre line fitted through the footprint's middles, each side scaled out until it holds the footprint
    const hwAt = (t) => { const se = (x, p) => Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, Math.abs(x)), p)), 1 / p);
      return t < 0.15 ? 0.036 * se((0.15 - t) / 0.15, 2.4) : t < 0.35 ? 0.036 + (t - 0.15) / 0.2 * 0.004 : t < 0.7 ? 0.040 + (t - 0.35) / 0.35 * 0.010 : t < 0.82 ? 0.050 - (t - 0.7) / 0.12 * 0.003 : 0.047 * se((t - 0.82) / 0.18, 3.2); };
    const F = rows.filter((r) => r.lo != null), mu = F.reduce((a, r) => a + r.u, 0) / F.length, mm = F.reduce((a, r) => a + (r.lo + r.hi) / 2, 0) / F.length;
    const slope = F.reduce((a, r) => a + (r.u - mu) * ((r.lo + r.hi) / 2 - mm), 0) / F.reduce((a, r) => a + (r.u - mu) ** 2, 0);
    const midAt = (u) => mm + slope * (u - mu);
    let sA = 1, sB = 1; for (const r of F) { const hw = hwAt(r.t); if (hw > 0.004) { sA = Math.max(sA, (midAt(r.u) - r.lo) / hw); sB = Math.max(sB, (r.hi - midAt(r.u)) / hw); } }
    sA = Math.min(sA, 1.3); sB = Math.min(sB, 1.3);
    const As = rows.map((r) => [r.u, midAt(r.u) - sA * hwAt(r.t)]), Bs = rows.map((r) => [r.u, midAt(r.u) + sB * hwAt(r.t)]);
    fit[n] = { outline_scale: [+sA.toFixed(2), +sB.toFixed(2)] };
    const shape = new THREE.Shape(); shape.moveTo(As[0][0], As[0][1]);
    for (const p of As) shape.lineTo(p[0], p[1]); for (const p of Bs.slice().reverse()) shape.lineTo(p[0], p[1]); shape.closePath();
    const basis = new THREE.Matrix4().makeBasis(d, l, UPV).setPosition(heel);
    const layer = (z0, z1, look, label) => { const geo = new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false, curveSegments: 4 }); geo.translate(0, 0, z0); geo.applyMatrix4(basis); return tag(mk(geo, look), label); };
    g.add(layer(0, 0.010, SOLE, `sandal ${n}: EVA sole (dark brown)`), layer(0.010, BED - 0.002, CORK, `sandal ${n}: cork footbed`), layer(BED - 0.002, BED, LINER, `sandal ${n}: suede liner`));
    const edgeAt = (u, s) => interp(s > 0 ? Bs : As, u);
    // ---- straps: centre as a fraction of the foot (heel 0, toe tip 1), width, slant (the outer end further back)
    const straps = [{ name: 'front', t: 0.655, w: 0.028, slant: 14, ymax: 0.06 }, { name: 'rear', t: 0.47, w: 0.028, slant: 4, ymax: 0.068 }];
    Object.assign(fit[n], { foot_mm: Math.round(footLen * 1000), footbed_mm: Math.round(L * 1000) });
    // where the toes begin: the cleft between the big toe and the second toe (the most rearward low point between toe tips)
    for (const S of straps) {
      const uc = umin + S.t * footLen, tan = Math.tan(S.slant * Math.PI / 180);
      const ucAt = (v) => uc - tan * Math.max(0, v * out);
      const vlo = edgeAt(ucAt(-out * 0.04), -1) + 0.001, vhi = edgeAt(ucAt(out * 0.04), 1) - 0.001;
      const band = fp.filter((p) => Math.abs(p.u - ucAt(p.v)) < S.w / 2 + 0.004 && p.y < BED + S.ymax && p.v > vlo && p.v < vhi);
      // a taut strap: the upper convex hull of the foot's vertices under it (+3 mm), ends on the footbed edge, corners
      // rounded (Chaikin, 3 passes; then lifted again wherever the rounding came closer than 2 mm)
      const gap = 0.003, th = 0.0045;
      let prof = upperHull([[vlo, BED], [vhi, BED], ...band.map((p) => [p.v, p.y + gap])]);
      for (let it = 0; it < 3; it++) { const q = [prof[0]]; for (let i = 0; i < prof.length - 1; i++) { const [a, b] = [prof[i], prof[i + 1]]; q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); } q.push(prof[prof.length - 1]); prof = q; }
      { const K0 = 40, r = []; for (let i = 0; i <= K0; i++) { const v = vlo + (vhi - vlo) * i / K0; r.push([v, interp(prof, v)]); } prof = r; }
      { const req = prof.map(() => BED); for (const p of band) { const i = Math.round((p.v - vlo) / (vhi - vlo) * 40); for (const j of [i - 1, i, i + 1]) if (j > 0 && j < 40) req[j] = Math.max(req[j], p.y + 0.0025); }
        for (let it = 0; it < 6; it++) { prof = prof.map((p, i) => [p[0], Math.max(req[i], i === 0 || i === 40 ? p[1] : (prof[i - 1][1] + 2 * p[1] + prof[i + 1][1]) / 4)]); } }
      const K = 40, H = Math.max(...prof.map((p) => p[1])) - BED;
      const pos = [], idx = [], at = (v, y, du) => heel.clone().addScaledVector(d, ucAt(v) + du).addScaledVector(l, v).setY(y);
      for (let i = 0; i <= K; i++) { const [v, y] = prof[i], a = prof[Math.max(0, i - 1)], b = prof[Math.min(K, i + 1)];
        const tv = b[0] - a[0], ty = b[1] - a[1], nl = Math.hypot(tv, ty) || 1, nv = -ty / nl, ny = tv / nl;
        for (const [dv, dy] of [[0, 0], [nv * th, ny * th]]) for (const du of [-S.w / 2, S.w / 2]) pos.push(...at(v + dv, y + dy, du).toArray()); }
      for (let i = 0; i < K; i++) { const r0 = i * 4, r1 = r0 + 4;
        for (const [a, b] of [[0, 1], [1, 3], [3, 2], [2, 0]]) idx.push(r0 + a, r1 + a, r1 + b, r0 + a, r1 + b, r0 + b); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
      const m = mk(geo, STRAP); m.userData.double = true; g.add(tag(m, `sandal ${n}: ${S.name} strap (dark brown leather)`));
      // the buckle: on the outer side, low on the strap's slope
      const io = out > 0 ? Math.round(K * 0.84) : Math.round(K * 0.16), [bv, by] = prof[io], a = prof[io - 1], b = prof[io + 1];
      const tv = b[0] - a[0], ty = b[1] - a[1], nl = Math.hypot(tv, ty), nrm = l.clone().multiplyScalar(-ty / nl).addScaledVector(UPV, tv / nl).normalize();
      const along = l.clone().multiplyScalar(tv / nl).addScaledVector(UPV, ty / nl).normalize();
      const bk = mk(new THREE.BoxGeometry(0.02, S.w * 0.9, 0.003), BUCKLE);
      bk.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(along, new THREE.Vector3().crossVectors(nrm, along), nrm)); bk.position.copy(at(bv, by, 0)).addScaledVector(nrm, th + 0.0015);
      g.add(tag(bk, `sandal ${n}: ${S.name} strap buckle`));
      let minGap = 9; for (const p of band) minGap = Math.min(minGap, interp(prof, p.v) - p.y);
      fit[n][S.name] = { front_edge_t: +((S.t * footLen + S.w / 2) / footLen).toFixed(3), min_gap_mm: +(minGap * 1000).toFixed(1), height_above_bed_mm: Math.round(H * 1000) };
    }
    const soleMin = Math.min(...fp.map((p) => p.y));
    fit[n].sole_minus_bed_mm = +((soleMin - BED) * 1000).toFixed(1);
    // toes: vertices ahead of the front strap's front edge and low (the toes as seen in front of it)
    const fe = umin + (straps[0].t * footLen + straps[0].w / 2);
    fit[n].toe_tip_ahead_of_front_strap_mm = Math.round((umax - fe) * 1000);
  }
  g.userData.fit = fit;
  return tag(g, 'sandals (Arizona-type, two straps, cork footbed)');
}

// SLACKS HEM (set-local): the engine's trouser garment ends above the ankle; plain slacks hang to the foot. Each leg's
// lowest 12 cm of garment is stretched down so the hem rests on the rear strap in front and stops just above the
// footbed behind (a slight break). Garment vertices only; the body is untouched.
export function slacksHem(fig, { front = BED + 0.07, back = BED + 0.032, span = 0.14 } = {}) {
  const P = fig.userData.P, v = new THREE.Vector3(), inv = new THREE.Matrix4(); fig.updateMatrixWorld(true); const rep = {};
  fig.traverse((o) => { const m = /leg([LR])$/.exec(o.userData.idGroup || ''); if (!o.isMesh || !o.userData.garment || !m) return;
    const p = o.geometry.attributes.position, pts = []; for (let i = 0; i < p.count; i++) pts.push(v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).clone());
    const y0 = Math.min(...pts.map((q) => q.y)), ring = pts.filter((q) => q.y < y0 + 0.01); if (ring.length < 4) return;
    const c = ring.reduce((a, q) => a.add(q), new THREE.Vector3()).multiplyScalar(1 / ring.length), { d } = frame(P, m[1]);
    inv.copy(o.matrixWorld).invert();
    for (let i = 0; i < p.count; i++) { const q = pts[i]; const h = q.y - y0; if (h > span) continue;
      const w = q.clone().sub(c).setY(0); const f = w.length() > 1e-4 ? (w.normalize().dot(d) + 1) / 2 : 0.5, tgt = back + (front - back) * (f * f * (3 - 2 * f));
      const drop = Math.max(0, y0 - tgt), k = 1 - h / span; q.y -= drop * k; q.applyMatrix4(inv); p.setXYZ(i, q.x, q.y, q.z); }
    p.needsUpdate = true; o.geometry.computeBoundingSphere(); o.geometry.computeBoundingBox(); rep[m[1]] = { hem_was_mm: Math.round((y0 - BED) * 1000) }; });
  return rep;
}
