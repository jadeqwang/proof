// The IAS hoodie as cloth: the pattern, its pressed (pleated) starting shape, her handling choreography, and a CPU
// visibility check for the figure of Truth. Pure JS (no three.js). The physics is Jolt's (sweatshirt_jolt.js);
// sweatshirt.js turns the result into meshes; sweatshirt_test.mjs renders it.
//
// Jade (round-3 decisions, 2026-11-26): "Frame it so Truth falls in the folds -- because the sweatshirt is a soft
// material, it can move as she's holding it and turning it." The action: he hands it to her, then she turns it round to
// look at it, so the print faces her. Truth (the nude figure, left half of the seal) must always lie inside a fold.
//
// HOW TRUTH STAYS HIDDEN: the hoodie comes to her folded (MG1); one of the fold lines he pressed into it is a vertical
// KNIFE PLEAT through the seal, just left of Truth's mirror and just right of the two women's joined hands: pattern x in
// [PLEAT.m1, PLEAT.m3] (twice the depth) is folded under, Truth's face-side sandwiched between cloth layers, so she is
// hidden from BOTH sides (from the camera behind him at t = 0, and from her once it is turned). She took it from him by
// a fistful of that pleat just under the neckline (a pinch 6 cm tall over the three layers) and never lets go of it: the
// right hand holds it until the turn is done, then hands it to the left. That, and the fleece's memory of the pressed
// fold, keeps the pleat shut. Everything else (sleeves, hood, the free shoulder, the hem) is free cloth: it swings and
// folds as she turns it. A hand on the far shoulder seam pulls the chest taut and opens the pleat, so the free hand
// takes the shoulder only with some slack (END_R).
//
// Pattern coordinates (metres): the FRONT of the body laid flat, x = the wearer's LEFT (= the viewer's right when one
// faces the print), y up, hem at y = 0. The garment is simulated as ONE double-layer sheet (front and back panels move
// together, as a held hoodie's do); the renderer offsets the two faces by +-THICK/2. Sleeves are flat tubes, the hood a
// flat double layer hanging behind the neckline, the drawstrings chains.
//
// Everything is in world coordinates: the start and end anchors (GARMENT.unfolding / GARMENT.turned in layout.js) place it.

export const BODY = { w: 0.58, h: 0.69, nx: 41, ny: 48, rib: 0.065 };
// the columns of the body grid: 1.45 cm apart, refined to 0.5 cm across the pleat (so its folds can be resolved)
BODY.xs = (() => { const out = [], band = [-0.105, 0.055];
  for (let i = 0; i < BODY.nx; i++) { const x = -BODY.w / 2 + i * BODY.w / (BODY.nx - 1); if (x < band[0] - 0.004 || x > band[1] + 0.004) out.push(x); }
  for (let x = band[0]; x <= band[1] + 1e-9; x += 0.005) out.push(+x.toFixed(4));
  return out.sort((a, b) => a - b); })();
BODY.nx = BODY.xs.length;
// fractional column index of pattern x
export function colOf(u) { const xs = BODY.xs; if (u <= xs[0]) return 0; if (u >= xs[xs.length - 1]) return xs.length - 1.0001;
  let i = 0; while (xs[i + 1] < u) i++; return i + (u - xs[i]) / (xs[i + 1] - xs[i]); }
export const NECK = { a: 0.085, b: 0.07 };                          // front neckline scoop (half width, depth)
export const SLEEVE = { root: 0.22, len: 0.58, cuffW: 0.12, deg: 52, n: 40, rib: 0.065 };
export const HOOD = { w: 0.25, h: 0.34, nx: 17, ny: 24 };
// the drawstrings: off (lead, 2026-11-26: they floated as wires); set n: 18 to bring them back
export const STRING = { len: 0.26, n: 0, x: 0.032 };
export const PRINT = { c: [0, 0.69 - 0.20], R: 0.115 };          // the filled disc: ~40% of the 0.58 m front
// Truth's figure (with her mirror) in pattern coords: from the texture measurement (sweatshirt_print.py: box 0.270-0.519
// across, 0.167-0.802 down, of the disc's square)
export const TRUTH = { x0: PRINT.c[0] + (0.270 - 0.5) * 2 * PRINT.R, x1: PRINT.c[0] + (0.519 - 0.5) * 2 * PRINT.R,
  y0: PRINT.c[1] - (0.802 - 0.5) * 2 * PRINT.R, y1: PRINT.c[1] + (0.5 - 0.167) * 2 * PRINT.R };
// the pleat: material [m1, m3] folded under (m1 just left of Truth's mirror, m3 just right of the joined hands)
export const PLEAT = { m1: TRUTH.x0 - 0.006, m3: TRUTH.x1 + 0.006 };
PLEAT.d = (PLEAT.m3 - PLEAT.m1) / 2; PLEAT.m2 = PLEAT.m1 + PLEAT.d;
// which side lies on top: 'D' = Beauty's side overlaps (its fold edge runs down beside the joined hands), so the free
// wearer's-right side hangs BEHIND the pleat instead of flopping over the seal; 'A' = the mirror
PLEAT.top = 'D';
export const THICK = 0.011;                                         // the double layer, as rendered and collided
const LAYER = 0.0125;                                               // spacing of the pleat's layers when pressed

// ------------------------------------------------------------------------------------------------ pattern -> particles
export function makePattern() {
  const P = [];            // { u: [x, y] pattern coords, piece, ... }
  const tris = [];         // [a, b, c, piece]
  const add = (u, piece, extra = {}) => { P.push({ u, piece, ...extra }); return P.length - 1; };
  const B = BODY, dx = B.w / (B.nx - 1), dy = B.h / (B.ny - 1);
  const inNeck = (x, y) => (x / NECK.a) ** 2 + ((B.h - y) / NECK.b) ** 2 < 1;
  const bid = [];
  for (let j = 0; j < B.ny; j++) { bid[j] = [];
    for (let i = 0; i < B.nx; i++) { const x = B.xs[i], y = j * dy;
      bid[j][i] = inNeck(x, y) ? -1 : add([x, y], 'body', { i, j }); } }
  const quad = (a, b, c, d, piece, flip) => {   // a b / d c
    if ([a, b, c, d].some((k) => k < 0)) { // keep a triangle if 3 corners exist
      const q = [a, b, c, d].filter((k) => k >= 0); if (q.length === 3) tris.push([...q, piece]); return; }
    if (flip) { tris.push([a, b, d, piece]); tris.push([b, c, d, piece]); } else { tris.push([a, b, c, piece]); tris.push([a, c, d, piece]); } };
  for (let j = 0; j < B.ny - 1; j++) for (let i = 0; i < B.nx - 1; i++) quad(bid[j][i], bid[j][i + 1], bid[j + 1][i + 1], bid[j + 1][i], 'body', (i + j) % 2);
  // sleeves: root = the body's side column, top 'S.root' of it; quad mesh bilinear between root edge and cuff edge
  const S = SLEEVE, m = Math.round(S.root / dy) + 1, sid = {};
  for (const s of [-1, 1]) {
    const iCol = s < 0 ? 0 : B.nx - 1, th = (S.deg * Math.PI) / 180, d = [s * Math.cos(th), -Math.sin(th)];
    const rootMid = [s * B.w / 2, B.h - (m - 1) * dy / 2], cuffC = [rootMid[0] + d[0] * S.len, rootMid[1] + d[1] * S.len];
    const perp = [-d[1] * s, d[0] * s];   // across the cuff, pointing "up" (toward the shoulder seam side)
    const ids = [];
    for (let a = 0; a <= S.n; a++) { ids[a] = [];
      for (let k = 0; k < m; k++) { const jj = B.ny - 1 - k;                      // k = 0 at the shoulder (top)
        if (a === 0) { ids[a][k] = bid[jj][iCol]; continue; }
        const f = a / S.n, root = [s * B.w / 2, jj * dy], cuff = [cuffC[0] + perp[0] * (0.5 - k / (m - 1)) * S.cuffW, cuffC[1] + perp[1] * (0.5 - k / (m - 1)) * S.cuffW];
        ids[a][k] = add([root[0] + (cuff[0] - root[0]) * f, root[1] + (cuff[1] - root[1]) * f], s < 0 ? 'sleeveR' : 'sleeveL', { a, k, cuff: (1 - f) * S.len < S.rib }); } }
    for (let a = 0; a < S.n; a++) for (let k = 0; k < m - 1; k++) quad(ids[a][k], ids[a + 1][k], ids[a + 1][k + 1], ids[a][k + 1], s < 0 ? 'sleeveR' : 'sleeveL', (a + k) % 2);
    sid[s] = ids; }
  // hood: bottom row along the neckline scoop (pattern position on the scoop), hanging DOWN behind the back
  const H = HOOD, hid = [], hx = H.w / (H.nx - 1), hy = H.h / (H.ny - 1);
  for (let j = 0; j < H.ny; j++) { hid[j] = [];
    for (let i = 0; i < H.nx; i++) { const f = i / (H.nx - 1), ang = Math.PI * (1 - f);       // round the scoop, left to right
      const nx0 = NECK.a * Math.cos(ang), ny0 = B.h - NECK.b * Math.sin(ang) * 0.95;
      hid[j][i] = add([nx0, ny0], 'hood', { i, j, h: [ (f - 0.5) * H.w, -j * hy ] }); } }
  for (let j = 0; j < H.ny - 1; j++) for (let i = 0; i < H.nx - 1; i++) quad(hid[j][i], hid[j][i + 1], hid[j + 1][i + 1], hid[j + 1][i], 'hood', (i + j) % 2);
  // drawstrings: from the scoop's front edge at x = +-STRING.x, hanging down the front
  const str = {};
  for (const s of [-1, 1]) { str[s] = [];
    const ang = Math.acos(Math.max(-1, Math.min(1, s * STRING.x / NECK.a))), y0 = B.h - NECK.b * Math.sin(ang);
    for (let k = 0; k < STRING.n; k++) str[s].push(add([s * STRING.x, y0 - k * STRING.len / (STRING.n - 1)], 'string', { k, side: s })); }
  return { P, tris, bid, sid, hid, str, dx, dy, m };
}

// ------------------------------------------------------------------------------------------------ initial geometry
// pressed state as handed over: flat in the plane z = 0 (the print toward +Z), the pleat folded under, the hood hanging
// down behind the back, the strings down the front. Positions are pattern coords (centred on the pleat's top) in metres.
function pleatMap(x) {   // pattern x -> [x', z'] of the pressed knife pleat
  const { m1, m2, m3, d } = PLEAT;
  if (PLEAT.top === 'D') {  // Beauty's side on top, its fold edge just right of the joined hands; C folded under it, then B/A one level lower
    if (x >= m3) return [x, 0];
    if (x >= m2) return [2 * m3 - x, -LAYER];
    return [x + 2 * d, -2 * LAYER]; }
  // A on top (the wearer's right), B folded under, C/D one level lower
  if (x <= m1) return [x, 0];
  if (x <= m2) return [2 * m1 - x, -LAYER];
  return [x - 2 * d, -2 * LAYER];
}
export function initialPositions(pat) {
  const n = pat.P.length, X = new Float64Array(3 * n);
  pat.P.forEach((p, k) => {
    let x = p.u[0], y = p.u[1], z = 0;
    if (p.piece === 'hood') { const [nx0, ny0] = p.u; const [px, pz] = pleatMap(nx0); x = px; y = ny0 + p.h[1] * 0.98; z = (pz < 0 ? pz : 0) - 0.03 - 0.004 * p.j; }
    else { const [px, pz] = pleatMap(x); x = px; z = pz; }
    if (p.piece === 'string') z = 0.012 + 0.0005 * p.k;
    X[3 * k] = x; X[3 * k + 1] = y; X[3 * k + 2] = z; });
  return X;
}

// ------------------------------------------------------------------------------------------------ choreography
// World space. The caller gives two anchors in the GARMENT form of layout.js: `start` (t = 0: lifted, the front toward
// him) and `end` (t = 1: turned round, the front toward her), each { origin (collar centre), right (as one faces the
// front), up, out, grips: { herL, herR } }. Her hands (t = the API's t):
//  0.00-0.10  she holds it up as she took it from him: the LEFT hand on the wearer's-left shoulder seam (Beauty's side),
//             the RIGHT hand wrapped round a fistful of the pressed pleat just under the neckline (gripPoint(start,
//             'pinch'); NOT start.grips.herR: a hand on the other shoulder seam pulls the chest taut and opens the pleat)
//  0.10       the left hand lets go of the shoulder ...
//  0.10-0.36  ... and the right hand turns the hoodie half round by the pinch (a half turn of the wrist), drawing it a
//             little up and toward her; the left hand comes straight to the pinch (on it from 0.30, below the right)
//  0.30-0.36  the left hand takes the pinch (Truth's side is now on her left) ...
//  0.36-0.58  ... and the right hand takes the wearer's-LEFT shoulder (Beauty's side, now on her right) where it hangs
//             and lifts it to just short of end.grips.herR (END_R)
//  0.58-1.00  she holds it up to look at it, both hands on it, the front toward her, the pleat still held shut.
// (Re-timed 2026-11-26 at the lead's request: the cloth hangs from one point only for t 0.10-0.30.)
export const ACT = { release: 0.14, turn: [0.14, 0.52], reach: [0.36, 0.50], handoff: [0.50, 0.56], settle: 0.80, yaw: 180 };
// the right hand's end point: end.grips.herR brought `slack` m toward the pinch and dropped `drop` m, so Beauty's half
// hangs a little loose between her hands (taut, the diagonal pull from the pinch to the shoulder opens the pleat)
export const END_R = { slack: 0.08, drop: 0.03 }, START_L = { slack: 0.06, drop: 0.03 };
const slackFrom = (A, h, S) => { const p = gripPoint(A, 'pinch'), d = [p[0] - h[0], 0, p[2] - h[2]], l = Math.hypot(d[0], d[2]) || 1;
  return [h[0] + d[0] / l * S.slack, h[1] - S.drop, h[2] + d[2] / l * S.slack]; };
export const endR = (start, end) => slackFrom(end, end.grips.herR, END_R);
// the same for the left hand at the start: start.grips.herL brought toward the pinch
export const startL = (start) => slackFrom(start, start.grips.herL, START_L);
export const SHOULDER_X = 0.25, PINCH_Y = BODY.h - NECK.b - 0.016;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const lerp3 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const GRIP_PTS = { shoulderL: [SHOULDER_X, BODY.h - 0.004], shoulderR: [-SHOULDER_X, BODY.h - 0.004] };

// a grip point of the pressed garment in an anchor's frame: 'pinch' (the pleat's fold edge under the neckline, where her
// right hand holds it), 'shoulderL' / 'shoulderR' (the seam points)
export function gripPoint(A, which) {
  const [u, v, z] = which === 'pinch' ? [PLEAT.top === 'D' ? PLEAT.m3 + 0.004 : PLEAT.m1 - 0.004, PINCH_Y, -LAYER] : [...GRIP_PTS[which], 0];
  return add3(add3(add3(A.origin, A.right, u), A.up, v - BODY.h), A.out, z);
}

// where each hand is at time t (world), and what it holds; `pinch` = where the pinch is held, `yaw` = its turn (deg)
export function handsAt(t, start, end) {
  const turn = ease((t - ACT.turn[0]) / (ACT.turn[1] - ACT.turn[0]));
  const pinch = lerp3(gripPoint(start, 'pinch'), gripPoint(end, 'pinch'), turn); pinch[1] += 0.05 * Math.sin(Math.PI * turn);
  const SL = startL(start), lap = add3(SL, [0, -0.2, 0]), RE = endR(start, end), lapR = add3(RE, [0, -0.12, 0]);
  let L, R, holdL, holdR;
  if (t < ACT.release) { L = SL.slice(); holdL = 'shoulderL'; }
  else if (t < ACT.handoff[0]) { L = lerp3(lerp3(SL, lap, ease((t - ACT.release) / 0.06)), pinch, ease((t - ACT.reach[0]) / (ACT.reach[1] - ACT.reach[0]))); holdL = null; }
  else { L = pinch.slice(); holdL = 'pinch'; }
  if (t < ACT.handoff[1]) { R = pinch.slice(); holdR = 'pinch'; }
  else { R = lerp3(lapR, RE, ease((t - ACT.handoff[1]) / (ACT.settle - ACT.handoff[1]))); holdR = 'shoulderL'; }
  return { R, L, holdR, holdL, pinch, yaw: ACT.yaw * turn };
}

// ------------------------------------------------------------------------------------------------ geometry helpers
// per-vertex normals of the sheet (area-weighted), oriented so that the body's normal points out of the FRONT panel
export function normals(pat, x) {
  const n = pat.P.length, N = new Float64Array(3 * n);
  for (const [a, b, c] of pat.tris) {
    const e1 = [x[3 * b] - x[3 * a], x[3 * b + 1] - x[3 * a + 1], x[3 * b + 2] - x[3 * a + 2]], e2 = [x[3 * c] - x[3 * a], x[3 * c + 1] - x[3 * a + 1], x[3 * c + 2] - x[3 * a + 2]];
    const f = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    // orientation from the flat pattern: the triangle's (u,v) winding
    const ua = pat.P[a].piece === 'hood' ? pat.P[a].h : pat.P[a].u, ub = pat.P[b].piece === 'hood' ? pat.P[b].h : pat.P[b].u, uc = pat.P[c].piece === 'hood' ? pat.P[c].h : pat.P[c].u;
    const s = Math.sign((ub[0] - ua[0]) * (uc[1] - ua[1]) - (ub[1] - ua[1]) * (uc[0] - ua[0])) || 1;
    for (const v of [a, b, c]) for (let k = 0; k < 3; k++) N[3 * v + k] += f[k] * s; }
  for (let i = 0; i < n; i++) { const l = Math.hypot(N[3 * i], N[3 * i + 1], N[3 * i + 2]) || 1; N[3 * i] /= l; N[3 * i + 1] /= l; N[3 * i + 2] /= l; }
  return N;
}

// the two faces of the double layer: +THICK/2 along the normal = the front panel's outside (the print), - = the back
export function faces(pat, x) {
  const N = normals(pat, x), n = pat.P.length, F = new Float64Array(3 * n), Bk = new Float64Array(3 * n);
  for (let i = 0; i < n; i++) { const h = pat.P[i].piece === 'string' ? 0 : THICK / 2;
    for (let k = 0; k < 3; k++) { F[3 * i + k] = x[3 * i + k] + N[3 * i + k] * h; Bk[3 * i + k] = x[3 * i + k] - N[3 * i + k] * h; } }
  return { N, F, B: Bk };
}

// ------------------------------------------------------------------------------------------------ Truth visibility
// Fraction of sample points on Truth's figure (and on the rest of the disc) that a camera at `eye` (local coords) can
// see: the point's front face must face the eye and no triangle of either face may lie between. Pure CPU ray casting.
export function visibility(sim, eyes, { nx = 14, ny = 26 } = {}) {
  // the mid-surface of the double layer: samples on it, occluders = every other part of it (a fold's covering layers
  // lie at least selfR ~ 1.1 cm away, so hits closer than 4 mm are the sample's own sheet)
  const { pat, x } = sim, N = normals(pat, x), F = x;
  const tris = []; for (const [a, b, c, piece] of pat.tris) { if (piece === 'string') continue; tris.push([F, a, b, c]); }
  // body-grid lookup: bilinear on the (i, j) cell
  const B0 = BODY, dx = B0.w / (B0.nx - 1), dy = B0.h / (B0.ny - 1);
  function sample(u, v) {
    const fi = colOf(u), fj = v / dy, i = Math.floor(fi), j = Math.floor(fj), a = fi - i, b = fj - j;
    const ids = [pat.bid[j][i], pat.bid[j][i + 1], pat.bid[j + 1][i + 1], pat.bid[j + 1][i]]; if (ids.some((k) => k < 0)) return null;
    const wts = [(1 - a) * (1 - b), a * (1 - b), a * b, (1 - a) * b], p = [0, 0, 0], nn = [0, 0, 0];
    ids.forEach((k, q) => { for (let c = 0; c < 3; c++) { p[c] += F[3 * k + c] * wts[q]; nn[c] += N[3 * k + c] * wts[q]; } });
    const l = Math.hypot(...nn); return { p, n: nn.map((c) => c / l) }; }
  const pts = { truth: [], disc: [] };
  for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) {
    const u = TRUTH.x0 + (TRUTH.x1 - TRUTH.x0) * (a + 0.5) / nx, v = TRUTH.y0 + (TRUTH.y1 - TRUTH.y0) * (b + 0.5) / ny; const s = sample(u, v); if (s) pts.truth.push(s); }
  for (let a = 0; a < 24; a++) for (let b = 0; b < 24; b++) {
    const u = PRINT.c[0] + PRINT.R * ((a + 0.5) / 12 - 1), v = PRINT.c[1] + PRINT.R * ((b + 0.5) / 12 - 1);
    if ((u - PRINT.c[0]) ** 2 + (v - PRINT.c[1]) ** 2 > PRINT.R ** 2) continue;
    if (u > TRUTH.x0 - 0.004 && u < TRUTH.x1 + 0.004 && v > TRUTH.y0 && v < TRUTH.y1) continue;
    const s = sample(u, v); if (s) pts.disc.push(s); }
  const hit = (o, d, maxT) => {   // Moller-Trumbore, any hit in (1e-4, maxT)
    for (const [S, a, b, c] of tris) {
      const ax = S[3 * a], ay = S[3 * a + 1], az = S[3 * a + 2];
      const e1x = S[3 * b] - ax, e1y = S[3 * b + 1] - ay, e1z = S[3 * b + 2] - az, e2x = S[3 * c] - ax, e2y = S[3 * c + 1] - ay, e2z = S[3 * c + 2] - az;
      const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x, det = e1x * px + e1y * py + e1z * pz;
      if (Math.abs(det) < 1e-12) continue; const inv = 1 / det;
      const tx = o[0] - ax, ty = o[1] - ay, tz = o[2] - az, uu = (tx * px + ty * py + tz * pz) * inv; if (uu < 0 || uu > 1) continue;
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, vv = (d[0] * qx + d[1] * qy + d[2] * qz) * inv; if (vv < 0 || uu + vv > 1) continue;
      const tt = (e2x * qx + e2y * qy + e2z * qz) * inv; if (tt > 4e-3 && tt < maxT) return true; }
    return false; };
  return eyes.map((eye) => {
    const res = {};
    for (const k of ['truth', 'disc']) { let vis = 0;
      for (const s of pts[k]) { const d = [eye[0] - s.p[0], eye[1] - s.p[1], eye[2] - s.p[2]], L = Math.hypot(...d); d[0] /= L; d[1] /= L; d[2] /= L;
        if (d[0] * s.n[0] + d[1] * s.n[1] + d[2] * s.n[2] < 0.05) continue;
        const o = s.p; if (!hit(o, d, L)) vis++; }
      res[k] = +(vis / Math.max(1, pts[k].length)).toFixed(3); }
    return res; });
}
