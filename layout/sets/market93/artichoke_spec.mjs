// THE ARTICHOKE, one bract layout for both drawings of it:
//   - the market93 mesh (phyllo.js imports this module), and
//   - PLATE XVIII Fig. 1 (media/footage/spirals/plants.py reads artichoke_bracts.json, written by this file:
//     `node layout/sets/market93/artichoke_spec.mjs` from the repo root).
// So both have the same bracts, the same arm indices (bract n is on arm n % 8 and n % 5), the same handedness and the
// same shapes. plants.py re-implements bractPoint() in torch and checks it against the `check` samples in the JSON.
//
// Form from Jade's reference photo (inputs/ref_artichoke.png, a globe artichoke seen from straight above, used only as
// a visual reference): a squat closed head; broad, thick, cupped bracts that wrap it; the outer ones wider and opening
// outward, the inner ones tighter toward a closed apex with a small pit; every tip broad with rounded shoulders, a
// V-notch in the middle with a small point in it, and ragged little teeth on the shoulders (the torn look).
//
// Frame (the plate's): unit head radius, z = the axis toward the apex, x / y the plan. Bract n's lattice point: azimuth
// phi_n = n x 137.5078 deg; seen from above its plan radius grows evenly, sin(theta_n) = a (n + n0), up to theta = knee
// (1.2 rad), then theta steps on at the same rate down the flank. (An equal-area lattice on the globe was tried first: seen
// from above, the flank foreshortens the outer rows and the eye reads 8 and 13, not 5 and 8. This one reads 5 and 8 from
// the apex to the rim, as the sources count a globe head.) The tip reaches 0.35 spacings past the point toward the apex.
// On the plate (x right, y down) n + 1 is clockwise from n; on the market mesh (tip +y, phi from +x toward +z) it is
// clockwise seen from the tip. Same plant, same hand: the 8-arms wind clockwise outward, the 5-arms anticlockwise.
// Each bract hangs DOWN from its tip along the meridian (toward the stem), on a shell a little outside the bracts
// above it, so the outer bracts cover the bases of the inner ones and only the tips show, as on the real head.

export const GOLDEN = Math.PI * (3 - Math.sqrt(5));
export const SPEC = {
  N: 32, n0: 0.55, a: 0.038, knee: 1.2, stretch: 1.04, arms: [8, 5, 13],
  note: 'plan radius sin(theta_n) = a (n + n0) up to theta = knee, then theta steps on evenly; from above the contact spirals are 5 and 8',
};

// a small deterministic RNG (mulberry32), so the JSON and the mesh are the same every run
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r) => { const u = Math.max(r(), 1e-9), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function latticeDir(n) {
  const { n0, a, knee } = SPEC, nk = Math.sin(knee) / a - n0;
  const theta = n <= nk ? Math.asin(a * (n + n0)) : knee + a / Math.cos(knee) * (n - nk), phi = n * GOLDEN;
  return { theta, phi, P: [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)] };
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// every bract: where its tip is, its frame and its shape numbers (all in head radii)
export function bracts() {
  const { N } = SPEC, r = rng(1993), out = [];
  for (let n = 0; n < N; n++) {
    const { theta, phi, P } = latticeDir(n);
    const d = Math.sqrt(dist(P, latticeDir(n + 5).P) * dist(P, latticeDir(n + 8).P));   // local spacing (5- and 8-neighbours)
    const f = n / (N - 1);                                                    // 0 at the apex, 1 at the outermost
    // the tip reaches a little past the lattice point toward the apex; the innermost ones meet over it (closed apex)
    const tt = Math.max(0.02, theta - 0.35 * d), st = Math.sin(tt), ct = Math.cos(tt), sp = Math.sin(phi), cp = Math.cos(phi);
    const W = d * (1.55 + 0.35 * f) * Math.min(1, 0.85 + 1.4 * st) * (1 + 0.04 * gauss(r));   // broad; narrow at the crown
    out.push({
      n, theta, phi, theta_tip: tt,
      Nv: [st * cp, st * sp, ct], Uv: [-ct * cp, -ct * sp, st], Ev: [-sp, cp, 0],   // at the tip: outward, toward the apex, across
      d, W,
      L: Math.min(1.25, Math.max(0.42, 2.75 - tt)),                         // tip down to near the receptacle
      shell: 0.86 + 0.20 * f,                                                   // outer bracts sit outside the inner
      flare: (0.02 + 0.16 * f ** 1.2 + 0.12 * f ** 6) * (1 + 0.12 * gauss(r)),                 // inner tips hug the head (closed apex), outer ones open out
      cup: 0.10 + 0.06 * f,                                                     // convex across: the margins tuck down onto the bracts inside
      thick: 0.055,
      notch: 0.17 * (1 + 0.15 * gauss(r)), mucro: 0.11, shoulder: 0.20,          // tip outline (in widths, see edge())
      teeth: 0.04 + 0.015 * r(), tk: 2.4 + 0.8 * r(), tph: r(), twist: 0.05 * gauss(r),
    });
  }
  return out;
}

const tri = (x) => 2 * Math.abs(x - Math.floor(x) - 0.5) - 0.5;     // -0.5 .. 0.5
// the free edge: how far below the tip point (arc, head radii) the edge lies at t (-1 margin .. 0 midline .. 1 margin)
export function edge(b, t) {
  const a = Math.abs(t), W = b.W;
  return W * (b.shoulder * a * a + b.notch * Math.max(0, 1 - a / 0.55) - b.mucro * Math.max(0, 1 - a / 0.06)
    - b.teeth * tri(b.tk * a + b.tph) * smooth(0.15, 0.3, a) * (1 - smooth(0.7, 0.9, a)));
}
// half-width profile along the bract (s 0 base .. 1 tip), in units of W / 2
export const halfw = (s) => 0.55 + 0.45 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, s / 1.45))), 0.8);
// point on bract b: sp in [0, 1] from the base up to the free edge, t in [-1, 1] across; back = 1 for the inner face.
// Returns [x, y, z] in the plate frame and s (0 base .. 1 tip, for shading).
export function bractPoint(b, sp, t, back = 0) {
  const e = edge(b, t), ud = e + (1 - sp) * (b.L - e), s = 1 - ud / b.L;
  const v = t * halfw(s) * b.W / 2 + b.twist * ud;
  const dx = -ud, dy = v, dd = Math.hypot(dx, dy);
  const k = dd > 1e-9 ? Math.sin(dd) / dd : 1, c = Math.cos(dd);
  const dir = [0, 1, 2].map((i) => c * b.Nv[i] + k * (dx * b.Uv[i] + dy * b.Ev[i]));
  const tw = t * halfw(s);
  // along: the tip stands out (flare); across: convex, the margins tucked in (cup); the tip itself a little spooned
  let rad = b.shell + b.flare * s ** 3 - b.cup * b.W * tw * tw * (1 - 0.6 * s ** 4);
  if (back) rad -= b.thick * (1 - 0.45 * s);
  return { p: [rad * dir[0], rad * dir[1], rad * dir[2] * SPEC.stretch], s };
}
// the count's anchor: on the midline, on the exposed part, just below the bract's lattice point
export function anchor(b) { return bractPoint(b, anchorSp(b), 0).p; }
export function anchorSp(b) { return 1 - Math.min(0.5, (b.theta - b.theta_tip + 0.1 * b.d) / (b.L - edge(b, 0))); }

// node layout/sets/market93/artichoke_spec.mjs  ->  artichoke_bracts.json next to this file
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('artichoke_spec.mjs')) {
  const fs = await import('node:fs'), path = await import('node:path'), url = await import('node:url');
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const B = bracts();
  const check = [];
  for (const b of B) for (const [sp, t, bk] of [[0.3, -0.7, 0], [0.97, 0.05, 0], [1, 0.33, 0], [0.6, 0.9, 1]]) check.push({ n: b.n, sp, t, back: bk, ...bractPoint(b, sp, t, bk) });
  const out = { about: 'THE ARTICHOKE bract layout, shared by layout/sets/market93 (mesh) and media/footage/spirals (PLATE XVIII Fig. 1). Written by artichoke_spec.mjs; do not edit by hand.',
    spec: SPEC, golden_rad: GOLDEN, anchor: 'bractPoint(b, anchor_sp, 0)',
    bracts: B.map((b) => ({ ...b, anchor_sp: anchorSp(b), anchor: anchor(b) })), check };
  fs.writeFileSync(path.join(here, 'artichoke_bracts.json'), JSON.stringify(out, (k, v) => typeof v === 'number' ? +v.toFixed(7) : v, 1));
  console.log(`wrote ${B.length} bracts`);
}
