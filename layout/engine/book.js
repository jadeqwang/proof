// The storybook: an ordinary hardcover picture book, 21 x 28 cm closed, about 1 cm thick.
// spec: { state: 'closed' | 'open', at: [x,y,z], normal: dir (book up, default world up), top: dir (toward the top
//         edge of the pages), v: deg (each page rises from the gutter, open only), lift: deg (open: whole book tipped
//         toward the reader about the gutter-perpendicular axis is given by normal anyway) }
//   closed: `at` is the centre of the bottom face (where it rests); open: `at` is the gutter midpoint on the page surface.
// book.anchor(name) -> world point for hands: L/R/T/B edge mids, LO/RO (outer edges, open), LOT LOB ROT ROB corners,
//   G (gutter mid), GT GB, Lmid Rmid (page centres), cover (closed cover centre).
// book.pages -> { left: [TL,TR,BR,BL], right: [...], spread: [...] } world corners (open), book.cover (closed)
import * as THREE from 'three';
import { mk, quad, V, rad, UP, basisQ, tag, slab } from './core.js';

export const BOOK = { w: 0.21, h: 0.28, t: 0.011, board: 0.0028, over: 0.003 };
const COVER = { grey: 0.32, col: 0x7e2b22 };   // a red cloth cover, gold title (not modelled)
const PAGE = { grey: 0.97, col: 0xeee4cc };
const EDGE = { grey: 0.85, col: 0xe6dcc4 };

export function buildBook(spec) {
  const g = new THREE.Group(); g.name = 'book';
  const n = V(spec.normal || [0, 1, 0]).normalize();
  let w = V(spec.top || [0, 0, -1]); w.addScaledVector(n, -w.dot(n)).normalize();
  const u = new THREE.Vector3().crossVectors(w, n).normalize(); // to the right when reading (w up the page, n toward reader)
  const at = V(spec.at);
  const A = {}; const book = { group: g, spec, n, u, w, at, anchors: A };
  if (spec.state === 'closed') {
    const T = BOOK.t, Wd = BOOK.w, Hh = BOOK.h;
    const c = at.clone().addScaledVector(n, T / 2);
    const body = mk(new THREE.BoxGeometry(Wd, Hh, T), COVER); body.position.copy(c); body.quaternion.copy(basisQ(u, w, n)); g.add(body);
    // the page block shows as a light band on three sides
    const pb = mk(new THREE.BoxGeometry(Wd - 0.004, Hh - 0.006, T - 2 * BOOK.board), EDGE); pb.position.copy(c).addScaledVector(u, 0.003); pb.quaternion.copy(body.quaternion); pb.scale.set(1.001, 1.001, 1.001); g.add(pb);
    const top = at.clone().addScaledVector(n, T + 0.0005);
    const C = (a, b) => top.clone().addScaledVector(u, a * Wd / 2).addScaledVector(w, b * Hh / 2);
    book.cover = [C(-1, 1), C(1, 1), C(1, -1), C(-1, -1)];
    Object.assign(A, { cover: top.clone(), L: C(-1, 0), R: C(1, 0), T: C(0, 1), B: C(0, -1), LB: C(-1, -1), RB: C(1, -1), LT: C(-1, 1), RT: C(1, 1), G: C(-1, 0) });
    tag(g, 'storybook (closed)');
    return book;
  }
  // open
  const v = rad(spec.v ?? 7), pw = BOOK.w - 0.004, ph = BOOK.h - 0.006;
  const r = u.clone().multiplyScalar(Math.cos(v)).addScaledVector(n, Math.sin(v));
  const l = u.clone().multiplyScalar(-Math.cos(v)).addScaledVector(n, Math.sin(v));
  const Gt = at.clone().addScaledVector(w, ph / 2), Gb = at.clone().addScaledVector(w, -ph / 2);
  const left = [Gt.clone().addScaledVector(l, pw), Gt.clone(), Gb.clone(), Gb.clone().addScaledVector(l, pw)];
  const right = [Gt.clone(), Gt.clone().addScaledVector(r, pw), Gb.clone().addScaledVector(r, pw), Gb.clone()];
  book.pages = { left, right, spread: [left[0], right[1], right[2], left[3]] };
  const blockT = 0.0035;
  for (const [side, dir, pg] of [['left', l, left], ['right', r, right]]) {
    const pn = new THREE.Vector3().crossVectors(dir, w); if (pn.dot(n) < 0) pn.negate(); // page normal
    const mid = at.clone().addScaledVector(dir, pw / 2);
    // page block + board beneath the page surface
    const blk = mk(new THREE.BoxGeometry(pw, ph, blockT), EDGE); blk.position.copy(mid).addScaledVector(pn, -blockT / 2 - 0.0004);
    blk.quaternion.copy(basisQ(dir.clone().multiplyScalar(side === 'right' ? 1 : -1), w, side === 'right' ? pn : pn.clone()));
    blk.quaternion.copy(basisQ(dir, w, new THREE.Vector3().crossVectors(dir, w))); g.add(blk);
    const brd = mk(new THREE.BoxGeometry(BOOK.w + BOOK.over, BOOK.h + 2 * BOOK.over, BOOK.board), COVER);
    brd.position.copy(at.clone().addScaledVector(dir, (BOOK.w + BOOK.over) / 2)).addScaledVector(pn, -blockT - BOOK.board / 2 - 0.0006);
    brd.quaternion.copy(blk.quaternion); g.add(brd);
    const pq = quad(pg, { ...PAGE, recvShadowLine: true }); pq.userData.page = side; pq.userData.label = `storybook ${side} page`; g.add(pq);
    book[side + 'Normal'] = pn;
  }
  // spine: a small rounded strip under the gutter
  { const sp = mk(new THREE.CylinderGeometry(0.008, 0.008, BOOK.h + 2 * BOOK.over, 12), COVER); sp.position.copy(at).addScaledVector(n, -blockT - 0.009); sp.quaternion.setFromUnitVectors(UP, w); g.add(sp); }
  const P = (side, a, b) => { const pg = side === 'L' ? left : right; // a: 0 gutter..1 outer; b: 0 bottom..1 top
    const dir = side === 'L' ? l : r; return Gb.clone().addScaledVector(dir, a * pw).addScaledVector(w, b * ph); };
  Object.assign(A, { G: at.clone(), GT: Gt.clone(), GB: Gb.clone(), LO: P('L', 1, 0.5), RO: P('R', 1, 0.5), LOT: P('L', 1, 1), LOB: P('L', 1, 0), ROT: P('R', 1, 1), ROB: P('R', 1, 0),
    Lmid: P('L', 0.5, 0.5), Rmid: P('R', 0.5, 0.5), LB: P('L', 0.5, 0), RB: P('R', 0.5, 0), LT: P('L', 0.5, 1), RT: P('R', 0.5, 1) });
  book.pageAt = P; // (side, a, b) -> point on a page
  tag(g, 'storybook (open)');
  return book;
}
