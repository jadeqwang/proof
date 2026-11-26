// AD_grab camera search (r4b, 2026-11-26): a camera inside the attic that keeps BOTH the grab (Mama's hand closing on the
// tracing forearm, the finger still on the pane) and the paper keyboard (the key beat: the printout lying in the tail of
// the beam on the floor) readable. Scores each candidate on the rendered id pass (engine/main.js window.visSpec): the
// keyboard's visible pixels and whether its four corners are in frame and unblocked, the grip in frame and not hidden
// behind anything but the two bodies, the finger on the pane in frame, the faces, the grip's size.
//   node layout/sets/attic88_day/grab_camera.mjs <out.json> [n] [free | orbit]
// orbit: the shared grab framing (market93 M4): an orbit round the grabbed forearm's midpoint, aimed at it at (0.5, 0.52),
// 0.8-1.1 m, 20-50 deg above it, any side the room allows, 35-50 mm; scored as above plus Mama's forearm entering the frame
import fs from 'node:fs';
import { openClipPage } from '../../engine/clipcheck.mjs';
const W = 1920, H = 1080;
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = process.argv[2], N = +(process.argv[3] || 120), MODE = process.argv[4] || 'free'; const { page, close } = await openClipPage('attic88_day'); const all = [];
  const base = await page.evaluate(async () => { const { SHOTS } = await import('/sets/attic88_day/shots.js'); const { keysCorners } = await import('/sets/attic88_day/layout.js'); return { shot: SHOTS.find((s) => s.id === 'AD_grab'), kc: keysCorners() }; });
  const kc = base.kc, kcen = kc.reduce((a, p) => a.map((v, i) => v + p[i] / 4), [0, 0, 0]);
  const pts = { melbow: 'mama:elbowR', grip: 'mama:handR', fwrist: 'littleJade:wristR', felbow: 'littleJade:elbowR', finger: 'littleJade:indexR', mamaEyes: 'mama:eyes', kidEyes: 'littleJade:eyes', k0: kc[0], k1: kc[1], k2: kc[2], k3: kc[3] };
  const grip0 = [3.33, 0.68, -0.60];
  const inF = (p, m = 0.06) => p && p.front && p.px[0] > W * m && p.px[0] < W * (1 - m) && p.px[1] > H * m && p.px[1] < H * (1 - m);
  const okBlock = (p, whoOk) => !p.blocked_by || whoOk.some((w) => p.blocked_by.startsWith(w + ' '));
  const score = (v, cam) => { const P = v.points; let s = 0; const notes = [];
    const keysPx = v.counts['paper piano keys'] || 0; s += Math.min(keysPx, 2500) / 100;   // up to 25
    const corners = ['k0', 'k1', 'k2', 'k3'].filter((k) => inF(P[k], 0.02) && !P[k].blocked_by).length; s += corners * 4; if (corners < 4) notes.push(`keys corners ${corners}/4`);
    // the grip (Mama's palm centre) may only be hidden by Mama's own hand; the child's wrist and elbow by her own arm or Mama's hand
    for (const [k, ok] of [['grip', ['mama']], ['fwrist', ['mama', 'littleJade']], ['felbow', ['mama', 'littleJade']]]) { if (!inF(P[k], 0.08)) { s -= 30; notes.push(k + ' out'); } else if (!okBlock(P[k], ok)) { s -= 25; notes.push(k + ' blocked by ' + P[k].blocked_by); }
      else if (P[k].blocked_by && /hair|skinHead/.test(P[k].blocked_by)) { s -= 25; notes.push(k + ' behind a head'); } }
    if (!inF(P.finger, 0.04)) { s -= 15; notes.push('finger out'); } else if (!okBlock(P.finger, ['littleJade'])) { s -= 10; notes.push('finger blocked by ' + P.finger.blocked_by); }
    for (const k of ['mamaEyes', 'kidEyes']) if (inF(P[k], 0.03) && okBlock(P[k], [k === 'mamaEyes' ? 'mama' : 'littleJade']) && !/hair/.test(P[k].blocked_by || '')) s += 6;
    if (MODE === 'orbit') { if (inF(P.melbow, 0.0)) s += 3; else if (P.melbow?.front) s += 6; }   // her forearm enters from the frame edge (elbow just outside)
    const d = Math.hypot(...cam.pos.map((x, i) => x - grip0[i])); s -= Math.max(0, d - 1.3) * 20 + Math.max(0, 0.55 - d) * 40;
    return { s: +s.toFixed(2), keysPx, corners, notes, d: +d.toFixed(2) }; };
  const R = (a, b) => a + Math.random() * (b - a), L = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  try { let best = null;
    for (let i = 0; i < N; i++) { const loc = best && i > N / 2 && Math.random() < 0.6;
      const cam = loc ? { lens: best.cam.lens, pos: best.cam.pos.map((v, k) => +(v + R(-0.08, 0.08)).toFixed(3)), t: Math.min(0.7, Math.max(0.05, best.cam.t + R(-0.08, 0.08))) }
        : { lens: [24, 28, 32, 35][Math.floor(Math.random() * 4)], pos: (() => { const z = R(-1.75, -0.8); return [+R(2.5, 3.36).toFixed(3), +R(0.8, Math.min(1.9, 0.9 + 2.1 * (1 - Math.abs(z) / 2.8) - 0.2)).toFixed(3), +z.toFixed(3)]; })(), t: R(0.1, 0.6) };
      if (MODE === 'orbit') { const o = loc ? { ...best.cam.o, az: best.cam.o.az + R(-8, 8), el: Math.min(55, Math.max(15, best.cam.o.el + R(-5, 5))), dist: Math.min(1.15, Math.max(0.7, best.cam.o.dist + R(-0.06, 0.06))) }
          : { az: R(0, 360), el: R(18, 52), dist: R(0.75, 1.1) }; cam.o = o; cam.lens = loc ? best.cam.lens : [35, 40, 50][Math.floor(Math.random() * 3)];
        const a = o.az * Math.PI / 180, e = o.el * Math.PI / 180; cam.pos = [grip0[0] + Math.sin(a) * Math.cos(e) * o.dist, grip0[1] + Math.sin(e) * o.dist, grip0[2] + Math.cos(a) * Math.cos(e) * o.dist].map((v) => +v.toFixed(3));
        if (cam.pos[0] > 3.38 || cam.pos[1] > 0.9 + 2.1 * (1 - Math.abs(cam.pos[2]) / 2.8) - 0.15) { i--; continue; } }
      cam.target = MODE === 'orbit' ? grip0 : L(grip0, kcen, cam.t).map((v) => +v.toFixed(3));
      const shot = { ...base.shot, lens: cam.lens, pos: cam.pos, target: cam.target, orbit: undefined, aim: undefined };
      const v = await page.evaluate(([s, o]) => window.visSpec(s, o), [shot, { labels: ['paper piano keys'], points: pts }]); const sc = score(v, cam);
      const e = { cam, ...sc }; all.push(e); if (!best || sc.s > best.s) { best = e; console.log(i, 'best', JSON.stringify(e)); }
      if (i % 10 === 0) fs.writeFileSync(out, JSON.stringify(all.slice().sort((a, b) => b.s - a.s).slice(0, 30), null, 1)); }
  } finally { await close(); fs.writeFileSync(out, JSON.stringify(all.slice().sort((a, b) => b.s - a.s).slice(0, 30), null, 1)); }
}
