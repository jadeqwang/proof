// Finger-vs-cloth contact for the Jolt hoodie (MG2: t 0, MG2_end: t 1). Measured, not eyeballed.
//   node layout/sets/mortongrove07/cloth_contact.mjs [--shots MG2,MG2_end] [--sim '{"...":...}'] [--dir media/layout/mortongrove07] [--json out.json]
// Hands: the posed hand capsules of jade27 (phalanges, thumb, palm strips: engine/hand.js, the same the hold check uses)
// from each shot's sidecar (`holds`). Cloth: simulated afresh in sweatshirt_test.html (window.clothSurface) with the same
// anchors, lap colliders and t as build.js, smoothed as rendered; the fleece is a slab THICK thick round that mid-surface.
// depth = capsule r + THICK/2 - distance(capsule axis, mid-surface triangles): > 0 = finger and cloth overlap by that
// many mm (cloth into the finger and the finger into the cloth are the same overlap); < 0 = the gap. Per finger: the
// worst segment. The grip point the page computes must equal the sidecar's cloth_grips (else the hand pose is stale).
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { serve, HERE } from '../../serve.mjs';
import { handCapsules } from './sweatshirt_jolt.js';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE || '/home/jade/Documents/1-music-shipped/moongazing/render/node_modules/playwright-core');
const REPO = path.resolve(HERE, '..'); const argv = process.argv.slice(2), args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const SHOTS = String(args.shots || 'MG2,MG2_end').split(','), T = { MG2: 0, MG2_end: 1 };
const DIR = path.resolve(REPO, String(args.dir || 'media/layout/mortongrove07'));

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const addk = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k], len = (v) => Math.hypot(v[0], v[1], v[2]);
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
// closest point on triangle abc to p (Ericson, Real-Time Collision Detection 5.1.5)
function closestTri(p, a, b, c) {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap); if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) return addk(a, ab, d1 / (d1 - d3));
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) return addk(a, ac, d2 / (d2 - d6));
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return addk(b, sub(c, b), (d4 - d3) / ((d4 - d3) + (d5 - d6)));
  const den = 1 / (va + vb + vc); return addk(addk(a, ab, vb * den), ac, vc * den);
}
function segSeg(p1, q1, p2, q2) {   // distance between segments (Ericson 5.1.9)
  const d1 = sub(q1, p1), d2 = sub(q2, p2), r = sub(p1, p2), a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r); let s, t;
  if (a < 1e-14 && e < 1e-14) return len(r);
  if (a < 1e-14) { s = 0; t = clamp(f / e, 0, 1); } else { const c = dot(d1, r);
    if (e < 1e-14) { t = 0; s = clamp(-c / a, 0, 1); } else { const b = dot(d1, d2), den = a * e - b * b;
      s = den > 1e-14 ? clamp((b * f - c * e) / den, 0, 1) : 0; t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); } else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); } } }
  return len(sub(addk(p1, d1, s), addk(p2, d2, t)));
}
function segTri(p, q, a, b, c) {
  // crossing the triangle -> 0
  const n = cross(sub(b, a), sub(c, a)), dp = dot(sub(p, a), n), dq = dot(sub(q, a), n);
  if (dp * dq <= 0 && dp !== dq) { const x = addk(p, sub(q, p), dp / (dp - dq)), w = closestTri(x, a, b, c); if (len(sub(w, x)) < 1e-9) return 0; }
  return Math.min(len(sub(p, closestTri(p, a, b, c))), len(sub(q, closestTri(q, a, b, c))), segSeg(p, q, a, b), segSeg(p, q, b, c), segSeg(p, q, c, a));
}
const finger = (part) => (/^palm/.test(part) ? 'palm' : part.replace(/\d$/, ''));

export function contact(surf, capsules) {
  const { x, tris, thick } = surf, P = (k) => [x[3 * k], x[3 * k + 1], x[3 * k + 2]], h = thick / 2, out = {};
  for (const c of capsules) {
    const lo = c.a.map((v, i) => Math.min(v, c.b[i]) - c.r - h - 0.01), hi = c.a.map((v, i) => Math.max(v, c.b[i]) + c.r + h + 0.01); let dmin = Infinity, tri = null;
    for (const [i, j, k] of tris) { const A = P(i), B = P(j), C = P(k);
      if ([0, 1, 2].some((ax) => Math.max(A[ax], B[ax], C[ax]) < lo[ax] || Math.min(A[ax], B[ax], C[ax]) > hi[ax])) continue;
      const d = segTri(c.a, c.b, A, B, C); if (d < dmin) { dmin = d; tri = [i, j, k]; } }
    const depth = (c.r + h - dmin) * 1000, f = finger(c.part), held = new Set(surf.held || []);
    if (!out[f] || depth > out[f].depth_mm) out[f] = { depth_mm: +depth.toFixed(1), part: c.part, tri, held: tri ? tri.filter((v) => held.has(v)).length : 0, piece: tri && surf.piece ? surf.piece[tri[0]] : undefined };
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = 9500 + (process.pid % 200), server = await serve(port);
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'] });
  const res = {};
  try {
    const page = await browser.newPage({ viewport: { width: 200, height: 200 } }); page.setDefaultTimeout(600000);
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(`http://127.0.0.1:${port}/sets/mortongrove07/sweatshirt_test.html?w=200&h=200`);
    await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
    const err = await page.evaluate(() => window.__error || null); if (err) throw new Error(err);
    for (const shot of SHOTS) {
      const sc = JSON.parse(fs.readFileSync(path.join(DIR, shot + '.json'), 'utf8'));
      const surf = await page.evaluate(([t, s, it]) => window.clothSurface(t, s, it), [T[shot], args.sim || '{}', args.raw ? 0 : 2]);   // --raw: the simulated sheet before the display smoothing
      // the posed hands: the sidecar's (args.sidecar) or rebuilt from the sim's grips (HAND template, = the sidecar's to
      // 0.2 mm while the grip is where the sidecar has it); the sidecar's hands are compared either way
      const side = (sc.holds || []).flatMap((o) => o.hands).filter((hd) => hd.who === 'jade27');
      const hands = ['L', 'R'].filter((k) => surf.hands.grip?.[k]).map((k) => { const g = surf.hands.grip[k], sh = side.find((hd) => hd.arm === k);
        const caps = args.sidecar && sh ? sh.capsules : handCapsules(k, g.at, g.axis, surf.chest);
        const dev = sh ? Math.max(...sh.capsules.map((c, i) => Math.max(len(sub(c.a, caps[i].a)), len(sub(c.b, caps[i].b))))) * 1000 : null;
        return { arm: k, capsules: caps, sidecar_dev_mm: dev == null ? null : +dev.toFixed(1) }; });
      res[shot] = {}; if (args.dump) fs.writeFileSync(path.resolve(String(args.dump)) + '_' + shot + '.json', JSON.stringify({ surf, hands, cloth_grips: sc.cloth_grips }));
      for (const hd of hands) { const g = surf.hands.grip?.[hd.arm], sg = sc.cloth_grips?.[hd.arm];
        const stale = g && sg ? +(len(sub(g.at, sg.at)) * 1000).toFixed(1) : null;
        const c = contact(surf, hd.capsules), worst = Math.max(...Object.values(c).map((v) => v.depth_mm)), fingers = Object.entries(c).filter(([k]) => k !== 'palm').map(([, v]) => v.depth_mm);
        res[shot][hd.arm] = { holds: g?.what, grip_r: sg?.r, grip_moved_mm: stale, sidecar_hand_dev_mm: hd.sidecar_dev_mm, worst_finger_mm: Math.max(...fingers), min_finger_mm: Math.min(...fingers), worst_mm: worst, per: c };
        console.log(`${shot} ${hd.arm} (${g?.what}; grip ${stale} mm / hand ${hd.sidecar_dev_mm} mm from the sidecar's): ` + Object.entries(c).map(([k, v]) => `${k} ${v.depth_mm > 0 ? '+' : ''}${v.depth_mm}${v.held ? '*' + v.held : ''}${v.piece && v.piece !== 'body' ? '(' + v.piece + ')' : ''}`).join(', ')); }
    }
  } finally { await browser.close(); server.close(); }
  if (args.json) fs.writeFileSync(path.resolve(String(args.json)), JSON.stringify(res, null, 1));
}
