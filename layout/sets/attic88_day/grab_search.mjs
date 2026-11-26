// AD_grab pose search (r4b, 2026-11-26): Mama and the child both STANDING (Jade: "no one is kneeling ... it's an emergency to
// go-go-go get out alive"). The engine's IK (two-bone arms, natural-wrist elbow swivel, the forearm grip) proposes the pose;
// engine/clipcheck.mjs (Rapier, on the baked mesh bodies) measures every penetration and every joint against its limit.
// Random search round a hand-reasoned seed, then local refinement. Writes the ranked candidates to the path given.
//   node layout/sets/attic88_day/grab_search.mjs <out.json> [n]
import fs from 'node:fs';
import { openClipPage, checkDump } from '../../engine/clipcheck.mjs';

import { GRIP, kidAtSill as kid, mamaGrab as mama, GRAB_P } from './grabpose.js';
export { GRIP, kid, mama };
// run 4 (refine after the sole lift): SEED_FROM=solved starts from grabpose.js GRAB_P with spans x SPANK
const SEED0 = { holdR: 0.052, cx: 3.17, cz: -0.67, cbend: 10, cyaw: 10, mx: 3.04, mz: 0.07, yaw: 160, bend: 55, twist: 20, side: -9, drop: 0.15, step: 0.0, palm: 5 };
const SEED = process.env.SEED_FROM === 'solved' ? { ...GRAB_P } : SEED0;
const SPAN0 = { holdR: 0.008, cx: 0.05, cz: 0.05, cbend: 6, cyaw: 10, mx: 0.12, mz: 0.15, yaw: 35, bend: 15, twist: 15, side: 12, drop: 0.08, step: 0.15, palm: 30 };
const SPAN = Object.fromEntries(Object.entries(SPAN0).map(([k, v]) => [k, v * +(process.env.SPANK || 1)]));
const LIM = { holdR: [0.036, 0.058], cx: [3.0, 3.22], cbend: [0, 25], drop: [0, 0.24], bend: [15, 80], step: [-0.25, 0.3], palm: [-10, 100] };
export const shotOf = (p) => ({ id: 'search', lens: 50, pos: [2.4, 1.4, 0.5], target: [3.3, 0.6, -0.6], figs: { littleJade: kid(p), mama: mama(p) } });
export function cost(r) {
  let c = 0;
  for (const w of r.world) c += Math.max(0, w.skin_mm - w.tolerance_mm) * 3 + Math.max(0, w.cloth_mm - 12) + w.skin_mm * 0.05;
  for (const b of r.bodies) c += Math.max(0, b.skin_in_skin_mm - 2) * 4 + Math.max(0, b.into_cloth_mm - 8) * 1.5;
  for (const g of r.grips) c += Math.max(0, (g.contact_gap_mm ?? 50) - 2) * 3 + Math.max(0, g.into_cloth_mm - 10) * 2 + g.into_skin_mm * 4;
  for (const j of Object.values(r.joints)) c += j.violations.length * 40;
  // prefer a wrist near neutral and a modest bend
  const w = r.joints.mama?.arms?.R?.wrist; if (w) c += (Math.abs(w.flex || 0) + Math.abs(w.radial || 0)) * 0.1;
  // a rush, not a stoop: the bend is taken in the knees as well as the hips (a hip bend past 55 deg costs)
  const sp = r.joints.mama?.spine; if (sp) c += Math.max(0, sp.bend - 55) * 0.5 + Math.max(0, Math.abs(sp.twist) - 20) * 0.3;
  return +c.toFixed(2);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = process.argv[2], N = +(process.argv[3] || 120); const { page, close } = await openClipPage('attic88_day'); const all = [];
  const rnd = (s) => (Math.random() * 2 - 1) * s, clampP = (p) => { for (const [k, [a, b]] of Object.entries(LIM)) p[k] = Math.min(b, Math.max(a, p[k])); return p; };
  const evalP = async (p) => { const D = await page.evaluate((s) => window.clipDumpSpec(s), shotOf(p)); const r = checkDump(D); const c = cost(r); const e = { p, c, fails: r.fails, grips: r.grips, joints: { mama: r.joints.mama?.arms?.R, kid: r.joints.littleJade?.arms?.R } }; all.push(e); return e; };
  try { let best = await evalP({ ...SEED }); console.log('seed', best.c, best.fails.join('; '));
    for (let i = 0; i < N; i++) { const scale = i < N / 2 ? 1 : 0.4, base = i < N / 2 && Math.random() < 0.5 ? SEED : best.p;
      const p = clampP(Object.fromEntries(Object.entries(base).map(([k, v]) => [k, +(v + rnd(SPAN[k] * scale)).toFixed(3)])));
      const e = await evalP(p); if (e.c < best.c) { best = e; console.log(i, 'best', e.c, JSON.stringify(e.p), e.fails.join('; ')); }
      if (i % 10 === 0) fs.writeFileSync(out, JSON.stringify(all.sort((a, b) => a.c - b.c).slice(0, 40), null, 1)); }
  } finally { await close(); fs.writeFileSync(out, JSON.stringify(all.sort((a, b) => a.c - b.c).slice(0, 40), null, 1)); }
}
