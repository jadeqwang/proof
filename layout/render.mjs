// Render the layout guides for one set.
//   node layout/render.mjs --set attic88 [--shots A1,B2 | --prefix v3_] [--exclude beam_] [--modes line,flat,depth,label,lit] [--w 1920 --h 1080] [--nojson]
//                          [--out <dir>] [--gaze] [--body2]
// Output: media/layout/<set>/<SHOT>_<mode>.png and media/layout/<set>/<SHOT>.json (sidecar); --out <dir> writes to <dir>/<set>/ instead.
// Opt-in (README "Gaze and natural wrists"): --gaze or PROOF_GAZE=1 (eyes that aim, gaze line, sidecar gaze, natural
// wrists); --body2 or PROOF_BODY2=1 (mannequin body v2: real torsos, shoulder girdle, costume colours; stopped work).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { serve, HERE } from './serve.mjs';

const require = createRequire(import.meta.url);
const PW = process.env.PLAYWRIGHT_CORE || '/home/jade/Documents/1-music-shipped/moongazing/render/node_modules/playwright-core';
const { chromium } = require(PW);
const REPO = path.resolve(HERE, '..');
const argv = process.argv.slice(2); const args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const SET = args.set || 'attic88';
const W = Number(args.w || 1920), H = Number(args.h || 1080);
const modes = String(args.modes || 'line,flat,depth,label,lit').split(',');
const BODY = String(args.body || process.env.PROOF_BODY || '');   // 'mesh': rigged human meshes (engine/humanMesh.js)
const GAZE = !!args.gaze || process.env.PROOF_GAZE === '1', BODY2 = !!args.body2 || process.env.PROOF_BODY2 === '1';
const OUT = args.out ? path.resolve(String(args.out), SET) : path.join(REPO, 'media/layout', SET); fs.mkdirSync(OUT, { recursive: true });

const port = 9100 + (process.pid % 200);
const server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
let failed = 0;
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !/GPU stall|swiftshader|WebGL/i.test(m.text())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?set=${SET}&w=${W}&h=${H}${GAZE ? '&gaze=1' : ''}${BODY2 ? '&body2=1' : ''}${BODY === 'mesh' ? '&body=mesh' : ''}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } });
  if (err) throw new Error(err);
  const all = await page.evaluate(() => window.shotList());
  let ids = args.shots ? String(args.shots).split(',') : args.prefix ? all.filter((i) => i.startsWith(String(args.prefix))) : all;
  if (args.exclude) ids = ids.filter((i) => !i.startsWith(String(args.exclude)));   // --exclude beam_ : everything but the beam-mask twins   // --prefix v3_ renders only the v3 setups
  for (const id of ids) {
    try {
      for (const m of modes) {
        const t = Date.now();
        const url = await page.evaluate(([i, mm]) => window.renderShot(i, mm), [id, m]);
        const f = path.join(OUT, `${id}_${m}.png`);
        fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
        console.log(`${SET} ${id} ${m} (${Date.now() - t} ms)`);
      }
      if (!args.nojson) {
        const sc = await page.evaluate((i) => window.sidecar(i), id);
        fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(sc, null, 1));
        if (sc.warnings?.length) console.log(`  ! ${id}: ${sc.warnings.join('; ')}`);
      }
    } catch (e) { failed++; console.error(`FAILED ${id}: ${e.message}`); }
  }
} finally { await browser.close(); server.close(); }
if (failed) { console.error(`${failed} shot(s) failed`); process.exit(1); }
