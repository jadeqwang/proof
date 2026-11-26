// Clip check with Rapier (2026-11-26, r4 attic+wall agent): does any body pass through another body, a wall, a window
// or furniture? Measured on the BAKED mesh bodies (engine/humanMesh.js), not by eye. Not a hand-rolled physics:
// @dimforge/rapier3d-compat point projection on oriented trimeshes (pseudo-normals give inside / outside).
//   node layout/engine/clipcheck.mjs --set <set> [--shots A,B | --prefix X] [--exclude beam_] [--json <file>] [--body mannequin]
// -> one table on stdout (and the full report as JSON with --json).
// For every shot (built in the same page render.mjs uses, via window.clipDump, engine/clipdump.js):
//   body vs world   every vertex of every figure mesh against every set mesh near it: depth = how far the vertex is
//                   inside the solid. Sheets (glass, single-sided quads) have no inside: a vertex counts when it is past
//                   the sheet, within its outline, on the side holding FEWER of that figure's vertices (an arm through a
//                   window pane).
//   body vs body    every vertex of A against B (skin = hard, garments / hair = soft, B's mesh as one oriented trimesh),
//                   both ways. A hand on the figure its arm grips (spec object 'figure:<who>') is a GRIP, reported apart.
//   joints          engine/clipdump.js jointReport: elbow, humeral rotation, shoulder, wrist, knee, spine, neck limits.
// Tolerances: HARD 3 mm (a skin vertex inside a solid or inside another body's skin), SOFT 12 mm (cloth / hair pressed,
// a cushion or quilt pressed: labels in SOFT_WORLD or the shot's clip.soft). A shot's `clip: { touch: [['mama.handR',
// 'outer wall (brick)'], ...], soft: [labels], ignore: [labels] }` adds contact checks (gap between that hand region and
// that set object, and how flat the palm is on it) and per-shot allowances.
// Vertex sampling: a thin body part crossing a thin world part with no vertex inside is not seen; body vertices are
// ~5-10 mm apart, so a crossing deeper than that is always caught.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { serve } from '../serve.mjs';
const require = createRequire(import.meta.url);
const RAPIER = require(process.env.RAPIER_DIR || '/home/jade/Documents/layout-deps/node_modules/@dimforge/rapier3d-compat');
await RAPIER.init();

export const HARD_MM = 3, SOFT_MM = 12, SHEET_BAND = 0.08;   // a sheet crossing is read within 8 cm of its plane
// soft or load-bearing: a cushion or quilt gives, and a seated / kneeling body's own soft tissue flattens ~1 cm on a floor
const SOFT_WORLD = /cushion|quilt|mat|pillow|futon|bed|blanket|sack|duvet|sofa seat|couch seat|floor/i;
const FLAGS = RAPIER.TriMeshFlags.ORIENTED | RAPIER.TriMeshFlags.MERGE_DUPLICATE_VERTICES;

function collider(world, pos, idx) {
  if (idx.length < 3) return null; const d = RAPIER.ColliderDesc.trimesh(new Float32Array(pos), new Uint32Array(idx), FLAGS); if (!d) return null;
  return world.createCollider(d, world.createRigidBody(RAPIER.RigidBodyDesc.fixed())); }
const bbox = (pos) => { const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]; for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], pos[i + k]); b[k + 3] = Math.max(b[k + 3], pos[i + k]); } return b; };
const inBox = (b, p, m = 0) => p[0] >= b[0] - m && p[1] >= b[1] - m && p[2] >= b[2] - m && p[0] <= b[3] + m && p[1] <= b[4] + m && p[2] <= b[5] + m;
const usedVerts = (part) => { const s = new Set(part.idx); return [...s].map((i) => [part.pos[3 * i], part.pos[3 * i + 1], part.pos[3 * i + 2]]); };

// signed depth of points in a collider: { n, max_mm, at } over the points inside (oriented trimesh)
function depthIn(col, pts, box) {
  let n = 0, max = 0, at = null; for (const p of pts) { if (box && !inBox(box, p, 0.002)) continue; const q = col.projectPoint({ x: p[0], y: p[1], z: p[2] }, false); if (!q || !q.isInside) continue;
    const d = Math.hypot(q.point.x - p[0], q.point.y - p[1], q.point.z - p[2]); n++; if (d > max) { max = d; at = p; } }
  return { n, max_mm: +(max * 1000).toFixed(1), at: at && at.map((x) => +x.toFixed(3)) };
}
// a sheet (no inside): the points past it within its outline, on the minority side
function sheetCross(sheet, pts, parts = null) {
  // plane from the sheet's area-weighted normal
  const P = sheet.pos, I = sheet.idx; let nx = 0, ny = 0, nz = 0, cx = 0, cy = 0, cz = 0, A = 0;
  for (let t = 0; t + 2 < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3; const e1 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], e2 = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], ar = Math.hypot(...n) / 2; if (n[0] * nx + n[1] * ny + n[2] * nz < 0) { n[0] *= -1; n[1] *= -1; n[2] *= -1; }
    nx += n[0]; ny += n[1]; nz += n[2]; cx += (P[a] + P[b] + P[c]) / 3 * ar; cy += (P[a + 1] + P[b + 1] + P[c + 1]) / 3 * ar; cz += (P[a + 2] + P[b + 2] + P[c + 2]) / 3 * ar; A += ar; }
  const L = Math.hypot(nx, ny, nz); if (!L || !A) return { n: 0, max_mm: 0 }; nx /= L; ny /= L; nz /= L; cx /= A; cy /= A; cz /= A;
  // planar enough?
  let dev = 0; for (let i = 0; i < P.length; i += 3) dev = Math.max(dev, Math.abs((P[i] - cx) * nx + (P[i + 1] - cy) * ny + (P[i + 2] - cz) * nz)); if (dev > 0.01) return { n: 0, max_mm: 0, note: 'not planar' };
  // outline test: point projected onto the plane lies inside one of the triangles
  const inTri = (p) => { for (let t = 0; t + 2 < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3; const v0 = [P[c] - P[a], P[c + 1] - P[a + 1], P[c + 2] - P[a + 2]], v1 = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], v2 = [p[0] - P[a], p[1] - P[a + 1], p[2] - P[a + 2]];
    const d00 = v0[0] * v0[0] + v0[1] * v0[1] + v0[2] * v0[2], d01 = v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2], d02 = v0[0] * v2[0] + v0[1] * v2[1] + v0[2] * v2[2], d11 = v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2], d12 = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const den = d00 * d11 - d01 * d01; if (!den) continue; const u = (d11 * d02 - d01 * d12) / den, v = (d00 * d12 - d01 * d02) / den; if (u >= 0 && v >= 0 && u + v <= 1) return true; } return false; };
  // r5 (engine-body): a body only goes THROUGH a sheet where one of its own edges crosses the sheet inside the outline.
  // A body merely beside a sheet's plane (thighs under a table top, a child sitting on pieces of paper lying on the floor)
  // has no such edge and is not a crossing (it was reported as up to 755 mm "into the meeting table").
  if (parts) { const sb = bbox(P); let crosses = false;
    for (const part of parts) { const Q = part.pos, J = part.idx;
      for (let t = 0; t + 2 < J.length && !crosses; t += 3) for (let e = 0; e < 3 && !crosses; e++) { const a = J[t + e] * 3, b = J[t + (e + 1) % 3] * 3;
        const pa = [Q[a], Q[a + 1], Q[a + 2]], pb = [Q[b], Q[b + 1], Q[b + 2]]; if (!inBox(sb, pa, 0.02) && !inBox(sb, pb, 0.02)) continue;
        const da = (pa[0] - cx) * nx + (pa[1] - cy) * ny + (pa[2] - cz) * nz, db = (pb[0] - cx) * nx + (pb[1] - cy) * ny + (pb[2] - cz) * nz; if (da * db >= 0) continue;
        const k = da / (da - db), x = [pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k, pa[2] + (pb[2] - pa[2]) * k]; if (inTri(x)) crosses = true; } }
    if (!crosses) return { n: 0, max_mm: 0, note: 'no edge crosses the sheet' }; }
  let pos = [], neg = [];
  // r5 (engine-body): only points within SHEET_BAND of the plane count: a sheet lying on a table (a page) flagged a child's
  // feet under the table, 46 cm below it inside its outline, as "472 mm through the paper" (kitchen90 K4_writes)
  for (const p of pts) { const d = (p[0] - cx) * nx + (p[1] - cy) * ny + (p[2] - cz) * nz; if (Math.abs(d) > SHEET_BAND) continue; const q = [p[0] - d * nx, p[1] - d * ny, p[2] - d * nz]; if (!inTri(q)) continue; (d >= 0 ? pos : neg).push([d, p]); }
  const all = pts.map((p) => (p[0] - cx) * nx + (p[1] - cy) * ny + (p[2] - cz) * nz), side = all.filter((d) => d >= 0).length >= all.length / 2 ? 1 : -1;   // the side the figure is on (all its points)
  const past = side > 0 ? neg : pos; let max = 0, at = null; for (const [d, p] of past) if (Math.abs(d) > max) { max = Math.abs(d); at = p; }
  return { n: past.length, max_mm: +(max * 1000).toFixed(1), at: at && at.map((x) => +x.toFixed(3)) };
}
// depth of points inside a body (its whole mesh as one oriented trimesh): split by what the nearest surface is: SKIN (the
// nearest point of the whole mesh is on the skin: hard) or CLOTH / HAIR (soft). The skin alone is not closed (skin under
// a garment is removed in humanMesh.js), so inside / outside is always read on the whole mesh.
function depthInBody(B, pts) {
  const h = { n: 0, max: 0, at: null }, s = { n: 0, max: 0, at: null };
  for (const p of pts) { if (!inBox(B.box, p, 0.002)) continue; const q = B.allCol.projectPoint({ x: p[0], y: p[1], z: p[2] }, false); if (!q || !q.isInside) continue;
    const d = Math.hypot(q.point.x - p[0], q.point.y - p[1], q.point.z - p[2]); let onSkin = false;
    if (B.hardCol) { const k = B.hardCol.projectPoint(q.point, false); onSkin = !!k && Math.hypot(k.point.x - q.point.x, k.point.y - q.point.y, k.point.z - q.point.z) < 5e-4; }
    const o = onSkin ? h : s; o.n++; if (d > o.max) { o.max = d; o.at = p.map((x) => +x.toFixed(3)); } }
  return { skin: { n: h.n, max_mm: +(h.max * 1000).toFixed(1), at: h.at }, cloth: { n: s.n, max_mm: +(s.max * 1000).toFixed(1), at: s.at } };
}
// smallest gap between a figure region's vertices and a set mesh (negative = inside)
function gap(col, pts) { let m = Infinity; for (const p of pts) { const q = col.projectPoint({ x: p[0], y: p[1], z: p[2] }, false); if (!q) continue; const d = Math.hypot(q.point.x - p[0], q.point.y - p[1], q.point.z - p[2]) * (q.isInside ? -1 : 1); if (d < m) m = d; } return m; }

export function checkDump(D) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 }); const clip = D.clip || {}; const soft = (l) => SOFT_WORLD.test(l) || (clip.soft || []).some((s) => l.includes(s)), ignored = (l) => (clip.ignore || []).some((s) => l.includes(s));
  const res = { shot: D.shot, world: [], bodies: [], grips: [], touch: [], joints: {}, pass: true, fails: [] };
  const W = D.world.filter((w) => !ignored(w.label)).map((w) => ({ ...w, box: bbox(w.pos), col: w.sheet ? null : collider(world, w.pos, w.idx) }));
  const F = Object.fromEntries(Object.entries(D.figs).map(([who, f]) => {
    const hardParts = f.parts.filter((p) => !p.soft), softParts = f.parts.filter((p) => p.soft);
    const merge = (ps) => { const pos = [], idx = []; for (const p of ps) { const o = pos.length / 3; pos.push(...p.pos); for (const i of p.idx) idx.push(i + o); } return { pos, idx }; };
    const hard = merge(hardParts), all = merge(f.parts);
    return [who, { ...f, hardPts: hardParts.flatMap(usedVerts), softPts: softParts.flatMap(usedVerts), handPts: { L: f.parts.filter((p) => p.region === 'handL').flatMap(usedVerts), R: f.parts.filter((p) => p.region === 'handR').flatMap(usedVerts) },
      hardCol: collider(world, hard.pos, hard.idx), allCol: collider(world, all.pos, all.idx), box: bbox(all.pos), hardBox: bbox(hard.pos) }]; }));
  // ---- body vs world
  for (const [who, f] of Object.entries(F)) for (const w of W) {
    const pts = f.hardPts.filter((p) => inBox(w.box, p, 0.002)), spts = f.softPts.filter((p) => inBox(w.box, p, 0.002)); if (!pts.length && !spts.length) continue;
    const h = w.sheet ? sheetCross(w, f.hardPts, f.parts.filter((p) => !p.soft)) : depthIn(w.col, pts), s = w.sheet ? sheetCross(w, f.softPts, f.parts.filter((p) => p.soft)) : depthIn(w.col, spts);
    if (!h.n && !s.n) continue; const tol = soft(w.label) ? SOFT_MM : HARD_MM, ok = h.max_mm <= tol && s.max_mm <= SOFT_MM;
    res.world.push({ who, object: w.label, sheet: w.sheet || undefined, skin_vertices: h.n, skin_mm: h.max_mm, skin_at: h.at, cloth_vertices: s.n, cloth_mm: s.max_mm, cloth_at: s.at, tolerance_mm: tol, pass: ok });
    if (!ok) res.fails.push(`${who} into ${w.label}: ${Math.max(h.max_mm, s.max_mm)} mm`); }
  // ---- body vs body
  const whos = Object.keys(F);
  for (const a of whos) for (const b of whos) { if (a === b) continue; const A = F[a], B = F[b];
    const gripArms = ['L', 'R'].filter((n) => String(A.spec[n]?.object || '').startsWith('figure:' + b));
    const gripPts = new Set(gripArms.flatMap((n) => A.handPts[n].map((p) => p.join(','))));
    const near = (p) => inBox(B.box, p, 0.002);
    const ptsH = A.hardPts.filter(near), ptsS = A.softPts.filter(near); if (!ptsH.length && !ptsS.length) continue;
    // and the other way round: B's hand gripping A: A's vertices at B's gripping hand (within 1 cm of its box) are grip contact
    const bGrips = ['L', 'R'].filter((n) => String(B.spec[n]?.object || '').startsWith('figure:' + a)).map((n) => bbox(B.handPts[n].flat()));
    const atBHand = (p) => bGrips.some((bx) => inBox(bx, p, 0.01));
    const body = { hard: ptsH.filter((p) => !gripPts.has(p.join(',')) && !atBHand(p)), soft: ptsS.filter((p) => !atBHand(p)) }, grip = ptsH.filter((p) => gripPts.has(p.join(',')));
    // A's skin into B's skin (hard) / A's skin or cloth into B's cloth (soft)
    const dd = B.allCol ? depthInBody(B, body.hard.concat(body.soft)) : { skin: { n: 0, max_mm: 0 }, cloth: { n: 0, max_mm: 0 } }, hh = dd.skin, hs = dd.cloth;
    if (hh.n || hs.n) { const ok = hh.max_mm <= HARD_MM && hs.max_mm <= SOFT_MM; res.bodies.push({ a, b, skin_in_skin_vertices: hh.n, skin_in_skin_mm: hh.max_mm, at: hh.at, into_cloth_vertices: hs.n, into_cloth_mm: hs.max_mm, cloth_at: hs.at, pass: ok });
      if (!ok) res.fails.push(`${a} into ${b}: skin ${hh.max_mm} mm / cloth ${hs.max_mm} mm`); }
    if (grip.length) { const gd = depthInBody(B, grip), gh = gd.skin, gs = gd.cloth, g0 = B.allCol ? gap(B.allCol, grip) : null;
      const ok = gh.max_mm <= HARD_MM && gs.max_mm <= SOFT_MM && g0 != null && g0 <= 0.003;
      res.grips.push({ hand: `${a}.${gripArms.join('')}`, on: b, contact_gap_mm: g0 == null ? null : +(g0 * 1000).toFixed(1), into_skin_mm: gh.max_mm, into_cloth_mm: gs.max_mm, pass: ok });
      if (!ok) res.fails.push(`grip ${a} on ${b}: gap ${g0 == null ? '?' : (g0 * 1000).toFixed(1)} mm, skin ${gh.max_mm}, cloth ${gs.max_mm}`); } }
  // ---- touches asked for by the shot
  for (const [hand, label] of clip.touch || []) { const [who, part] = hand.split('.'); const f = F[who]; if (!f) continue; const n = part.slice(-1), pts = f.handPts[n] || [];
    const ws = W.filter((w) => w.label.includes(label) && w.col); let g = Infinity; for (const w of ws) g = Math.min(g, gap(w.col, pts));
    // palm flatness: angle between the palm normal and the nearest wall normal (from the projection of the palm centre)
    let flat = null; const h = D.figs[who].hands[n]; if (h?.palm && ws.length) { let best = null; for (const w of ws) { const q = w.col.projectPoint({ x: h.palm[0], y: h.palm[1], z: h.palm[2] }, false); const d = Math.hypot(q.point.x - h.palm[0], q.point.y - h.palm[1], q.point.z - h.palm[2]); if (!best || d < best.d) best = { d, q }; }
      const v = [best.q.point.x - h.palm[0], best.q.point.y - h.palm[1], best.q.point.z - h.palm[2]], L = Math.hypot(...v) || 1; flat = +(Math.acos(Math.max(-1, Math.min(1, (v[0] * h.normal[0] + v[1] * h.normal[1] + v[2] * h.normal[2]) / L))) * 180 / Math.PI).toFixed(1);
      flat = { palm_normal_vs_toward_wall_deg: flat, palm_centre_to_wall_mm: +(best.d * 1000).toFixed(1) }; }
    const ok = g > -HARD_MM / 1000 && g <= 0.003; res.touch.push({ hand, on: label, gap_mm: g === Infinity ? null : +(g * 1000).toFixed(1), ...(flat || {}), pass: ok }); if (!ok) res.fails.push(`touch ${hand} on ${label}: gap ${(g * 1000).toFixed(1)} mm`); }
  for (const [who, f] of Object.entries(D.figs)) { res.joints[who] = f.joints; for (const v of f.joints.violations) res.fails.push(`${who} joint: ${v}`); }
  res.pass = !res.fails.length; world.free(); return res;
}

// a page with the set loaded (for scripts: pose / camera searches call page.evaluate(window.clipDumpSpec(shot)) and
// checkDump on the result). Returns { page, close }.
export async function openClipPage(set, body = 'mesh') {
  const PW = process.env.PLAYWRIGHT_CORE || '/home/jade/Documents/1-music-shipped/moongazing/render/node_modules/playwright-core'; const { chromium } = require(PW);
  const server = await serve(0), port = server.address().port;   // port 0: the OS picks a free one (searches run side by side)
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?set=${set}&w=1920&h=1080&gaze=1&body=${body === 'mesh' ? 'mesh' : 'mannequin'}`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return window.__error || String(e); } }); if (err) { await browser.close(); server.close(); throw new Error(err); }
  return { page, close: async () => { await browser.close(); server.close(); } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2), args = {}; for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  const out = []; const { page, close } = await openClipPage(args.set, String(args.body || process.env.PROOF_BODY || 'mesh'));
  try {
    let ids = await page.evaluate(() => window.shotList()); if (args.shots) ids = String(args.shots).split(','); else if (args.prefix) ids = ids.filter((i) => i.startsWith(String(args.prefix))); if (args.exclude) ids = ids.filter((i) => !i.startsWith(String(args.exclude)));
    console.log('| shot | figures | body vs world (worst) | body vs body (worst) | grips | touches | joints | result |\n|---|---|---|---|---|---|---|---|');
    for (const id of ids) { const D = await page.evaluate((i) => window.clipDump(i), id); if (!Object.keys(D.figs).length) continue; const r = checkDump(D); out.push(r);
      const worstW = r.world.slice().sort((a, b) => Math.max(b.skin_mm, b.cloth_mm) - Math.max(a.skin_mm, a.cloth_mm))[0], worstB = r.bodies.slice().sort((a, b) => Math.max(b.skin_in_skin_mm, b.into_cloth_mm) - Math.max(a.skin_in_skin_mm, a.into_cloth_mm))[0];
      const jv = Object.entries(r.joints).filter(([, j]) => j.violations.length).map(([w, j]) => `${w}: ${j.violations.join('; ')}`).join(' / ');
      console.log(`| ${id} | ${Object.keys(D.figs).join(', ')} | ${worstW ? `${worstW.who} in ${worstW.object}: skin ${worstW.skin_mm} / cloth ${worstW.cloth_mm} mm` : 'none'} | ${worstB ? `${worstB.a} in ${worstB.b}: skin ${worstB.skin_in_skin_mm} / cloth ${worstB.into_cloth_mm} mm` : 'none'} | ${r.grips.map((g) => `${g.hand} on ${g.on}: gap ${g.contact_gap_mm}, cloth ${g.into_cloth_mm}, skin ${g.into_skin_mm} mm`).join('; ') || '-'} | ${r.touch.map((t) => `${t.hand} on ${t.on}: gap ${t.gap_mm} mm, palm ${t.palm_normal_vs_toward_wall_deg} deg`).join('; ') || '-'} | ${jv || 'in range'} | ${r.pass ? 'pass' : 'FAIL: ' + r.fails.join('; ')} |`); }
  } finally { await close(); }
  if (args.json) fs.writeFileSync(String(args.json), JSON.stringify(out, null, 1));
}
