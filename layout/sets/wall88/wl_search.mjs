// WL_in: Mama's palms on the brick (r4b, 2026-11-26; Jade: "her palm can be on the brick but needs to be in a way that
// physically makes sense (use a game engine or some other tool for this)"). The engine's IK (two-bone arm, natural-wrist
// elbow swivel) proposes the arm; engine/clipcheck.mjs (Rapier, on the baked mesh body) measures the palm's gap to the
// brick, every penetration (brick, boards, studs, the next worker) and every joint against its limit. Random search.
//   node layout/sets/wall88/wl_search.mjs <out.json> [n]
import fs from 'node:fs';
import { openClipPage, checkDump } from '../../engine/clipcheck.mjs';
import { mamaShield, WORKER_FIGS, IN_CAM } from './shots.js';

export const shotOf = (p) => ({ id: 'search', ...IN_CAM, figs: { ...WORKER_FIGS, mama: mamaShield(p) },
  clip: { touch: [['mama.handR', 'outer wall (brick)'], ['mama.handL', 'outer wall (brick)']] } });
const SEED = { rz: -0.42, ry: 0.90, rx: 0.027, rfy: -1.2, lz: 0.16, ly: 0.82, lx: 0.027, turn: 0, side: 0 };
const SPAN = { rz: 0.12, ry: 0.1, rx: 0.006, rfy: 0.4, lz: 0.05, ly: 0.06, lx: 0.006, turn: 10, side: 6 };
// the reach toward her daughter is the point of the pose: the right palm stays 30-50 cm beyond her right shoulder along the wall
const LIM = { rz: [-0.62, -0.40] };
export function cost(r) {
  let c = 0;
  for (const w of r.world) if (w.who === 'mama') c += Math.max(0, w.skin_mm - 0.5) * 6 + Math.max(0, w.cloth_mm - 6);
  for (const b of r.bodies) if (b.a === 'mama' || b.b === 'mama') c += b.skin_in_skin_mm * 4 + Math.max(0, b.into_cloth_mm - 6) * 2;
  for (const t of r.touch) c += Math.abs((t.gap_mm ?? 50) - 0.3) * 4 + Math.max(0, (t.palm_normal_vs_toward_wall_deg ?? 90) - 10) * 0.5;
  c += (r.joints.mama?.violations.length || 0) * 40;
  for (const n of ['L', 'R']) { const w = r.joints.mama?.arms?.[n]?.wrist; if (w) c += (Math.abs(w.flex || 0) + Math.abs(w.radial || 0)) * 0.08; }
  return +c.toFixed(2);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = process.argv[2], N = +(process.argv[3] || 60); const { page, close } = await openClipPage('wall88'); const all = [];
  const rnd = (s) => (Math.random() * 2 - 1) * s;
  const evalP = async (p) => { const D = await page.evaluate((s) => window.clipDumpSpec(s), shotOf(p)); const r = checkDump(D); const e = { p, c: cost(r), fails: r.fails, touch: r.touch, arms: r.joints.mama?.arms }; all.push(e); return e; };
  try { let best = await evalP({ ...SEED }); console.log('seed', best.c, best.fails.join('; '));
    for (let i = 0; i < N; i++) { const sc = i < N / 2 ? 1 : 0.35, base = i < N / 2 && Math.random() < 0.5 ? SEED : best.p;
      const p = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, +(v + rnd(SPAN[k] * sc)).toFixed(3)])); for (const [k, [a, b]] of Object.entries(LIM)) p[k] = Math.min(b, Math.max(a, p[k]));
      const e = await evalP(p); if (e.c < best.c) { best = e; console.log(i, 'best', e.c, JSON.stringify(e.p), e.fails.join('; '), JSON.stringify(e.touch)); }
      if (i % 10 === 0) fs.writeFileSync(out, JSON.stringify(all.slice().sort((a, b) => a.c - b.c).slice(0, 30), null, 1)); }
  } finally { await close(); fs.writeFileSync(out, JSON.stringify(all.slice().sort((a, b) => a.c - b.c).slice(0, 30), null, 1)); }
}
