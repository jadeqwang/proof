// Standalone renders of the cloth hoodie at several t (0 = lifted by the shoulders, front toward him; 1 = turned round,
// front toward her). node layout/sets/mortongrove07/sweatshirt_test.mjs [--t 0,0.25,...] [--views cam,close,her,side]
// Renders where the CPU check finds Truth visible (> 1% of her figure's sample points) from that view go to the gitignored
// work/sweatshirt/ instead of media/layout/mortongrove07/ (the repo is public; the real seal's Truth is nude).
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { serve, HERE } from '../../serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE || '/home/jade/Documents/1-music-shipped/moongazing/render/node_modules/playwright-core');
const REPO = path.resolve(HERE, '..'); const argv = process.argv.slice(2), args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const TS = String(args.t || '0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1').split(',').map(Number), VIEWS = String(args.views || 'cam,close,her').split(',');
// --out DIR (r5): every render and the log go to DIR instead (trial runs; keep DIR outside the public repo)
const PUB = args.out ? path.resolve(String(args.out)) : path.join(REPO, 'media/layout/mortongrove07'), PRIV = args.out ? path.resolve(String(args.out)) : path.join(REPO, 'work/sweatshirt');
fs.mkdirSync(PUB, { recursive: true }); fs.mkdirSync(PRIV, { recursive: true });
const TEX = path.join(REPO, 'work/ias/ias_print_tex.png');
const port = 9300 + (process.pid % 200), server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox', '--force-color-profile=srgb'] });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !/GPU stall|swiftshader|WebGL/i.test(m.text())) console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  const CHK = path.join(REPO, 'work/ias/ias_print_check.png');
  await page.route('**/__check.png', (r) => (fs.existsSync(CHK) ? r.fulfill({ path: CHK, contentType: 'image/png' }) : r.fulfill({ status: 404 })));
  await page.route('**/__print.png', (r) => (fs.existsSync(TEX) ? r.fulfill({ path: TEX, contentType: 'image/png' }) : r.fulfill({ status: 404 })));
  page.setDefaultTimeout(600000);
  await page.goto(`http://127.0.0.1:${port}/sets/mortongrove07/sweatshirt_test.html?w=1200&h=1200&sim=${encodeURIComponent(args.sim || '{}')}${args.nocol ? '&nocol=1' : ''}${args.dbg ? '&dbg=1' : ''}`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__error || null); if (err) throw new Error(err);
  for (const t of TS) for (const v of VIEWS) {
    const t0 = Date.now(); const res = await page.evaluate(([tt, vv]) => window.renderCloth(tt, vv), [t, v]);
    const name = (args.tag ? args.tag + '_' : '') + `SW_t${String(Math.round(t * 100)).padStart(3, '0')}_${v}.png`, hidden = res.vis.red === 0;   // no pixel of Truth's (conservative, box) mask may show
    const f = path.join(hidden ? PUB : PRIV, name);
    if (res.check) fs.writeFileSync(path.join(PRIV, name.replace('.png', '_check.png')), Buffer.from(res.check.split(',')[1], 'base64')); fs.writeFileSync(f, Buffer.from(res.url.split(',')[1], 'base64'));
    log.push({ t, view: v, file: path.relative(REPO, f), truth_visible: res.vis.truth, truth_pixels: res.vis.red, disc_visible: res.vis.disc, hands: res.hands });
    console.log(`t ${t} ${v}: truth px ${res.vis.red} cpu ${res.vis.truth} disc ${res.vis.disc} -> ${path.relative(REPO, f)} (${Date.now() - t0} ms)`); }
} finally { await browser.close(); server.close(); }
fs.writeFileSync(path.join(PRIV, 'SW_log.json'), JSON.stringify(log, null, 1));
