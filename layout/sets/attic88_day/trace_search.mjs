// AD_trace tracing-finger search (r5, 2026-11-26). Jade's r5 note: the AD_trace hand read as a thumbs-up. Wanted: the
// right index straight-ish with its PAD on the frost (finger laid 25-45 deg to the glass, pointing along the fern, up and
// toward its tip), the other fingers curled, the thumb relaxed alongside. Grid over the palm-centre offset from fernMid,
// the finger direction and the palm normal; each candidate is measured with the clip check (clipDumpSpec + checkDump):
// no penetration, joints in range, reach <= 1, and the figure's window-most vertex between the frost layer (x 3.476) and
// the glass (3.490). The arm uses the engine's `tip` option (the index fingertip, not the palm centre, on fernMid; `back` =
// its x offset), so the hand is not re-clamped by naturalWrist and the joints are measured instead.   node layout/sets/attic88_day/trace_search.mjs <out.json> [lean]
import fs from 'node:fs';
import { openClipPage, checkDump } from '../../engine/clipcheck.mjs';
const out = process.argv[2]; const { page, close } = await openClipPage('attic88_day'); const res = [];
const nrm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
try {
  const base = await page.evaluate(async () => { const { SHOTS } = await import('/sets/attic88_day/shots.js'); return SHOTS.find((s) => s.id === 'AD_trace'); });
  const fernDir = nrm([0, 0.24, -0.25]);
  for (const ang of [65, 70, 75, 80]) for (const up of [-20, 0, 20]) for (const back of [0, -0.003]) for (const lift of [0, 1]) {
    // finger direction: `ang` deg into the glass, its in-glass part `up` deg from vertical
    const inPlane = [0, Math.cos(up * Math.PI / 180), Math.sin(up * Math.PI / 180)];   // `up`: in-plane angle from vertical (+ = toward +z, her right; the fern runs toward -z)
    const a = ang * Math.PI / 180, d = nrm([Math.sin(a), inPlane[1] * Math.cos(a), inPlane[2] * Math.cos(a)]);
    const n = nrm([1 - d[0] * d[0], -d[0] * d[1], -d[0] * d[2]]);   // palm normal: +x with the finger direction removed (pad to the glass)
    const tip = [3.486, 0.612, -0.568]; 
    
    const R = { tip: { finger: 'index', at: 'fernMid', off: [back, 0, 0] }, hand: { shape: 'point', curl: { index: [6, 14, 10] } }, ...(lift ? { elbow: [0.3, -1, 0.5] } : {}), fingers: d.map((x) => +x.toFixed(3)), palm: n.map((x) => +x.toFixed(3)) };
    const s = JSON.parse(JSON.stringify(base)); s.figs.littleJade.R = R;
    const D = await page.evaluate((sh) => window.clipDumpSpec(sh), s);
    let gx = 3.49, mx = -Infinity, at = null; for (const pt of D.figs.littleJade.parts) for (let i = 0; i < pt.pos.length; i += 3) if (pt.pos[i] > mx) { mx = pt.pos[i]; at = pt.region; }
    // the index fingertip: the right-hand vertex furthest along the finger direction; its pad gap to the glass
    let best = -Infinity, tipV = null; for (const pt of D.figs.littleJade.parts) if (/handR|hand_r|R$/.test(pt.region)) for (let i = 0; i < pt.pos.length; i += 3) { const q = pt.pos[i] * d[0] + pt.pos[i + 1] * d[1] + pt.pos[i + 2] * d[2]; if (q > best) { best = q; tipV = pt.pos.slice(i, i + 3); } }
    // the pad: hand vertices within 15 mm of that tip; the one nearest the glass
    let padX = -Infinity; if (tipV) for (const pt of D.figs.littleJade.parts) if (/handR/.test(pt.region)) for (let i = 0; i < pt.pos.length; i += 3) if (Math.hypot(pt.pos[i] - tipV[0], pt.pos[i + 1] - tipV[1], pt.pos[i + 2] - tipV[2]) < 0.015) padX = Math.max(padX, pt.pos[i]);
    if (!res.length) console.log('regions', [...new Set(D.figs.littleJade.parts.map((p) => p.region))].join(' '));
    const r = checkDump(D); const j = D.figs.littleJade.joints.arms.R;
    const e = { ang, up, back, lift, R, tip: tipV, padGap_mm: +((3.49 - padX) * 1000).toFixed(1), pass: r.pass, fails: r.fails, tipToGlass_mm: +((gx - mx) * 1000).toFixed(1), at, reach: j.reach, wrist: j.wrist };
    e.ok = r.pass && e.tipToGlass_mm >= 0 && e.padGap_mm >= 0 && e.padGap_mm <= 3 && j.reach <= 1.0; res.push(e);
    console.log(ang, up, back, lift, e.ok ? 'OK' : '--', 'pad', e.padGap_mm, 'tip', JSON.stringify(tipV), 'nearest', e.tipToGlass_mm, j.reach, JSON.stringify(j.wrist), r.fails.join('; ').slice(0, 150));
  }
} finally { await close(); fs.writeFileSync(out, JSON.stringify(res, null, 1)); }
