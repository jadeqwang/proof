// The boarded partition as ONE canonical texture, drawn in code (no image model), at true size (2026-11-28, Jade round 9:
// "texture the wood panels/boards of the wall so the panel size doesn't change between shots"). Like brick.js: one
// partition-wide canvas (u along +z from the cavity's closed end, v up from the floor), mapped by world position onto every
// board face, so each board shows the same width, joints, grain, knots and nails in every shot and every guide mode
// (lit: colour; flat / form: greys; line / contour: a drawn edge map of every board edge, butt joint, knot and nail).
// The boards: rough-sawn softwood (pine / spruce), 140 mm wide (CAVITY.board.h; ~2 mm gap between boards), 20 mm thick,
// laid horizontally, face-nailed with two nails into every stud they cross; each board is made of lengths butt-jointed on
// a stud, the joints staggered from board to board. ASSUMED (flagged in NOTES): the size and the wood.
import { artFromCanvas } from '../_art.js';

export const BOARDS = { width_mm: 140, thick_mm: 20, gap_mm: 2, wood: 'rough-sawn pine, weathered grey-brown', pxPerMm: 0.6 };

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const cache = new Map();
// L, H: the partition face in metres; z0: the closed end's z; rows: [{ y0, y1 }] each board's bottom / top (m, world);
// studs: stud centre z's (m, world)
export function boardArt(L, H, z0, rows, studs) {
  const key = [L, H, z0, rows.length].join('x'); if (cache.has(key)) return cache.get(key);
  const k = BOARDS.pxPerMm, W = Math.round(L * 1000 * k), Hp = Math.round(H * 1000 * k);
  const U = (z) => (z - z0) * 1000 * k, Y = (y) => Hp - y * 1000 * k;
  const mkC = () => { const c = document.createElement('canvas'); c.width = W; c.height = Hp; return c; };
  const c = mkC(), g = c.getContext('2d'), e = mkC(), eg = e.getContext('2d'), R = rng(1988 * 7);
  g.fillStyle = '#2a2018'; g.fillRect(0, 0, W, Hp);          // the gaps between boards: dark
  eg.fillStyle = '#ffffff'; eg.fillRect(0, 0, W, Hp);
  eg.strokeStyle = '#1e1e1e'; eg.lineWidth = 2;
  const ns = studs.length;
  rows.forEach((r, i) => {
    const yT = Y(r.y1), yB = Y(r.y0), h = yB - yT;
    // butt joints: one per board on a stud, staggered (stud index 1 + (3 i mod (ns - 2)))
    const jz = studs[1 + ((3 * i) % Math.max(1, ns - 2))];
    const pieces = [[z0, jz], [jz, z0 + L]];
    for (const [a, b] of pieces) {
      const x0 = U(a) + (a === z0 ? 0 : 1), x1 = U(b) - (b === z0 + L ? 0 : 1), t = R();
      const base = [96 + 22 * t, 78 + 16 * t, 58 + 12 * t];                   // weathered pine, each length a little different
      g.fillStyle = `rgb(${base.map(Math.round).join(',')})`; g.fillRect(x0, yT, x1 - x0, h);
      // grain: long thin streaks along the board, a few slow waves
      for (let s = 0; s < 14; s++) {
        const yy = yT + h * (0.06 + 0.88 * R()), amp = h * 0.05 * R(), per = 200 + 500 * R(), dark = R() < 0.6;
        g.strokeStyle = dark ? `rgba(40,28,18,${0.18 + 0.2 * R()})` : `rgba(200,180,150,${0.10 + 0.12 * R()})`; g.lineWidth = 1 + R() * 1.6;
        g.beginPath(); for (let x = x0; x <= x1; x += 8) { const y = yy + amp * Math.sin((x + per * R() * 0.01) / per * 6.283); x === x0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      }
      // one or two knots per length
      const nk = 1 + (R() < 0.5 ? 1 : 0);
      for (let q = 0; q < nk; q++) {
        const kx = x0 + (x1 - x0) * (0.15 + 0.7 * R()), ky = yT + h * (0.3 + 0.4 * R()), kr = h * (0.07 + 0.06 * R());
        g.fillStyle = 'rgba(52,34,20,0.85)'; g.beginPath(); g.ellipse(kx, ky, kr * 1.5, kr, 0, 0, 6.283); g.fill();
        g.strokeStyle = 'rgba(52,34,20,0.35)'; g.lineWidth = 1.2; for (let rr = 1; rr <= 3; rr++) { g.beginPath(); g.ellipse(kx, ky, kr * 1.5 + rr * 5, kr + rr * 3, 0, 0, 6.283); g.stroke(); }
        eg.beginPath(); eg.ellipse(kx, ky, kr * 1.5, kr, 0, 0, 6.283); eg.stroke();
      }
      eg.strokeRect(x0, yT, x1 - x0, h);
    }
    // two nails into every stud the board crosses
    for (const z of studs) { const x = U(z); for (const f of [0.28, 0.72]) {
      g.fillStyle = '#2b2b2d'; g.beginPath(); g.arc(x, yT + h * f, 3.2, 0, 6.283); g.fill();
      eg.fillStyle = '#1e1e1e'; eg.beginPath(); eg.arc(x, yT + h * f, 2.4, 0, 6.283); eg.fill(); } }
  });
  const a = artFromCanvas(c, { edgeCanvas: e, src: `code: layout/sets/wall88/boards.js (${BOARDS.width_mm} mm boards, ${BOARDS.thick_mm} mm thick, ${BOARDS.wood})` });
  cache.set(key, a); return a;
}

// map a board box's faces by world position onto the partition texture: the cavity face (+x) and the back (-x) by (z, y);
// the top / bottom edges (+-y, seen inside the crack) and the ends by a thin strip of the same board
export function mapBoardUV(mesh, L, H, z0) {
  mesh.geometry = mesh.geometry.clone();   // box() may share one geometry between boxes of the same size: own UVs per board
  const geo = mesh.geometry, pos = geo.attributes.position, uv = geo.attributes.uv, p = mesh.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i) + p.z, y = pos.getY(i) + p.y;
    uv.setXY(i, Math.min(1, Math.max(0, (z - z0) / L)), Math.min(1, Math.max(0, y / H)));
  }
  // the edge faces (+-y: 8-15) sample just inside the board's own face so the crack's lips show its wood, not the gap
  for (let i = 8; i < 16; i++) { const yIn = pos.getY(i) > 0 ? -0.01 : 0.01; uv.setY(i, Math.min(1, Math.max(0, (pos.getY(i) + p.y + yIn) / H))); }
  uv.needsUpdate = true;
}
