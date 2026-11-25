// 草纸: old-style Chinese toilet paper, torn by a three-year-old in halves, again and again.
// A piece is a quadrilateral in SHEET coordinates (u across the 16 cm side, v along the 23 cm side), with each edge
// flagged original (straight, as cut at the mill) or torn (ragged). Tearing always goes across the longer dimension,
// a little off the middle and a little askew, as small hands do. Generation g = 1/2^g of a sheet.
//   tearTree(seed, depth)       every piece of one sheet torn `depth` times (2^depth pieces that fit back together)
//   tearOne(seed, g)            one random piece of generation g
//   outline(piece)              the ragged outline, [[u, v], ...]
//   pieceMesh(piece, map, look) a mesh; map(u, v) -> THREE.Vector3 places the sheet point in the world
import { THREE, mk, rng } from './common.js';
import { PAPER } from './layout.js';

const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
let TEAR_ID = 1;

// split one piece in two; r = rng
function split(q, r) {
  const [c0, c1, c2, c3] = q.c, e = q.e;
  const t1 = 0.5 + (r() - 0.5) * 0.24, t2 = Math.min(0.85, Math.max(0.15, t1 + (r() - 0.5) * 0.14));
  // a tear's wander: six random partials with 1/k^1.4 falloff (no regular scallops), plus a random overall lean
  const tear = { id: TEAR_ID++, amp: r(), parts: Array.from({ length: 6 }, (_, k) => ({ f: (k + 1) * (0.6 + 0.8 * r()), ph: r() * 6.283, a: (r() * 0.7 + 0.3) / (k + 1) ** 1.4 })) };
  if (dist(c0, c1) + dist(c3, c2) >= dist(c1, c2) + dist(c0, c3)) {     // tear across edges 0 and 2
    const P = lerp2(c0, c1, t1), Q = lerp2(c3, c2, t2); const T = { ...tear, A: P, B: Q };
    return [{ c: [c0, P, Q, c3], e: [e[0], T, e[2], e[3]], g: q.g + 1 }, { c: [P, c1, c2, Q], e: [e[0], e[1], e[2], T], g: q.g + 1 }];
  }
  const P = lerp2(c1, c2, t1), Q = lerp2(c0, c3, t2); const T = { ...tear, A: P, B: Q };   // across edges 1 and 3
  return [{ c: [c0, c1, P, Q], e: [e[0], e[1], T, e[3]], g: q.g + 1 }, { c: [Q, P, c2, c3], e: [T, e[1], e[2], e[3]], g: q.g + 1 }];
}
const SHEET = () => ({ c: [[0, 0], [PAPER.w, 0], [PAPER.w, PAPER.h], [0, PAPER.h]], e: [null, null, null, null], g: 0 });

export function tearTree(seed, depth) {
  const r = rng(seed); let P = [SHEET()];
  for (let d = 0; d < depth; d++) P = P.flatMap((q) => split(q, r));
  return P;
}
export function tearOne(seed, g) {
  const r = rng(seed); let q = SHEET();
  for (let d = 0; d < g; d++) q = split(q, r)[r() < 0.5 ? 0 : 1];
  return q;
}

// the ragged offset of a tear at parameter s (0..1 along its full length L), perpendicular to it
function wander(T, s, L) {
  let w = 0; for (const q of T.parts) w += q.a * Math.sin(Math.PI * q.f * s + q.ph);
  return (0.028 + 0.03 * T.amp) * L * w + 0.0006 * Math.sin(53 * s + T.parts[0].ph) * Math.min(1, L / 0.03);
}
const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

export function outline(q) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const a = q.c[i], b = q.c[(i + 1) % 4], T = q.e[i]; out.push(a);
    if (!T) continue;
    const L = dist(T.A, T.B), d = [(T.B[0] - T.A[0]) / L, (T.B[1] - T.A[1]) / L], n = [-d[1], d[0]];
    const sOf = (p) => ((p[0] - T.A[0]) * d[0] + (p[1] - T.A[1]) * d[1]) / L;
    const sa = sOf(a), sb = sOf(b), wa = wander(T, sa, L), wb = wander(T, sb, L);
    const len = dist(a, b), n0 = Math.max(4, Math.ceil(len / 0.0025));
    for (let k = 1; k < n0; k++) {
      const t = k / n0, s = sa + (sb - sa) * t, p = lerp2(a, b, t);
      const fib = (hash(T.id, Math.round(s * L / 0.0025)) - 0.5) * 0.0012;        // fibre fringe of coarse straw paper
      const w = wander(T, s, L) - (wa + (wb - wa) * t) + fib;                       // corners stay put
      out.push([p[0] + n[0] * w, p[1] + n[1] * w]);
    }
  }
  return out;
}
export const centroid = (q) => q.c.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]);
export const area = (q) => { const c = q.c; let s = 0; for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };

export const PAPER_LOOK = { grey: 0.93, col: PAPER.col };
export function pieceMesh(q, map, look = PAPER_LOOK) {
  const pts = outline(q); const sh = new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u, v)));
  const geo = new THREE.ShapeGeometry(sh); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const p = map(pos.getX(i), pos.getY(i)); pos.setXYZ(i, p.x, p.y, p.z); }
  geo.computeVertexNormals(); const m = mk(geo, look); m.userData.double = true; return m;
}
