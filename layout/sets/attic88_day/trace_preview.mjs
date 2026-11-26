// AD_trace hand / camera preview (r5, 2026-11-26): renders variants of the AD_trace shot object (window.renderSpec) and
// measures each with the clip check (engine/clipcheck.mjs checkDump), including the fingertip's touch on the frosted
// pane, so the tracing finger is staged by measurement, not by eye.
//   node layout/sets/attic88_day/trace_preview.mjs <outdir> <variants.json>
//   variants.json: [{ name, R?: {...right-arm spec}, fig?: {...pose override}, pos?, target?, aim?, lens?, mode? }]
import fs from 'node:fs';
import { openClipPage, checkDump } from '../../engine/clipcheck.mjs';
const [out, vf] = process.argv.slice(2); const V = JSON.parse(fs.readFileSync(vf, 'utf8')); fs.mkdirSync(out, { recursive: true });
const { page, close } = await openClipPage('attic88_day');
try {
  const base = await page.evaluate(async () => { const { SHOTS } = await import('/sets/attic88_day/shots.js'); return SHOTS.find((s) => s.id === 'AD_trace'); });
  for (const v of V) {
    const s = JSON.parse(JSON.stringify(base)); s.figs.littleJade = { ...s.figs.littleJade, ...(v.fig || {}) }; if (v.R) s.figs.littleJade.R = v.R;
    for (const k of ['pos', 'target', 'aim', 'lens', 'orbit']) if (v[k] !== undefined) { s[k] = v[k]; if (k === 'target') delete s.aim; if (k === 'aim') delete s.target; }
    s.clip = { touch: [['littleJade.handR', v.pane || 'window']] };
    const url = await page.evaluate(([sh, m]) => window.renderSpec(sh, m), [s, v.mode || 'form']);
    fs.writeFileSync(`${out}/${v.name}.png`, Buffer.from(url.split(',')[1], 'base64'));
    const D = await page.evaluate((sh) => window.clipDumpSpec(sh), s);
    if (v.labels) console.log([...new Set(D.world.map((w) => w.label))].join(' | '));
    // fingertip on the glass: the figure vertex nearest the window (max x) against the glass's room-side face (min x)
    let gx = Infinity; for (const w of D.world) if (/window glass/.test(w.label)) for (let i = 0; i < w.pos.length; i += 3) gx = Math.min(gx, w.pos[i]);
    let mx = -Infinity, at = null; for (const pt of D.figs.littleJade.parts) for (let i = 0; i < pt.pos.length; i += 3) if (pt.pos[i] > mx) { mx = pt.pos[i]; at = [pt.region, pt.pos.slice(i, i + 3)]; }
    console.log(v.name, `nearest-to-glass vertex ${at?.[0]} ${JSON.stringify(at?.[1])}: ${((gx - mx) * 1000).toFixed(1)} mm from the glass (x ${gx})`);
    const r = checkDump(D); const wr = D.figs.littleJade.joints;
    console.log(v.name, r.pass ? 'PASS' : 'FAIL ' + r.fails.join('; '), JSON.stringify(r.touch), JSON.stringify(wr).slice(0, 400));
  }
} finally { await close(); }
