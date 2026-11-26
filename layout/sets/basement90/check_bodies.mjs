// basement90 / kitchen90 body checks (r4 decisions, 2026-11-26; Jade: "make sure her eyes are not cross-eyed in the
// three.js model, and also make sure her body doesn't clip thru her dad's body").
//   node layout/sets/basement90/check_bodies.mjs [--set basement90] [--shots B1_feet,B2_face] [--json out.json] [--parts] [--skip-deep]
// For every shot (default: every non-beam shot of the set) it builds the scene in the real page (same build as
// render.mjs, mesh bodies + gaze on), bakes every visible figure mesh to world triangles and, in Node:
//   1. BODY vs BODY: for each pair of figures, the triangle pairs that intersect (three-mesh-bvh shapecast +
//      intersectsTriangle, not hand-rolled), the deepest vertex of one body inside the other's closed skin (ray parity)
//      and the clearance (closest distance) between them. PASS = 0 intersecting triangle pairs.
//   2. EYES: per figure with a look target: each eyeball centre, the distance from the eyes to the target, each eye's
//      direction, the vergence angle between the two eye lines (and what it should be for that distance), and whether the
//      two eye lines actually meet at the target (closest approach of the two rays). Crossed = the target nearer than
//      MIN_LOOK_M (a child holding focus closer than ~25 cm reads as cross-eyed in a guide).
// three-mesh-bvh and three live in /home/jade/Documents/layout-deps (npm install three-mesh-bvh three there).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { serve, HERE } from '../../serve.mjs';
const require = createRequire(import.meta.url);
const DEPS = process.env.LAYOUT_DEPS || '/home/jade/Documents/layout-deps/node_modules';
const THREE = await import(DEPS + '/three/build/three.module.js');
const BVH = await import(DEPS + '/three-mesh-bvh/build/index.module.js');
const PW = process.env.PLAYWRIGHT_CORE || '/home/jade/Documents/1-music-shipped/moongazing/render/node_modules/playwright-core';
const { chromium } = require(PW);

const argv = process.argv.slice(2), args = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
const SET = args.set || 'basement90', MIN_LOOK_M = 0.25;
// (r5, 2026-11-26) three-mesh-bvh's closestPointToGeometry walks (nearly) every triangle pair when the two meshes are far
// apart: dad vs mama 11 cm apart took 66 s, and K4_writes (parents 1.16 m apart) never finished. The clearance search is
// now capped at CLR_MAX: beyond it the clearance is reported as "> CLR_MAX" (null clearance_mm, clearance_gt_mm set).
const CLR_MAX = Number(args['clr-max'] || 0.05);   // 0.15 still took ~1 min for two bodies 11 cm apart

const port = 9300 + (process.pid % 200), server = await serve(port);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/google/chrome/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?set=${SET}&w=1920&h=1080&gaze=1&body=mesh`);
  await page.waitForFunction(() => window.__ready !== undefined || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(async () => { try { await window.__ready; return window.__error || null; } catch (e) { return String(e); } });
  if (err) throw new Error(err);
  const all = await page.evaluate(() => window.shotList());
  const ids = args.shots ? String(args.shots).split(',') : all.filter((i) => !i.startsWith('beam_'));
  for (const id of ids) {
    const dump = await page.evaluate(async ([set, id]) => {
      const { build } = await import(`/sets/${set}/build.js`), { SHOTS } = await import(`/sets/${set}/shots.js`), { makeCam } = await import('/engine/main.js');
      const shot = JSON.parse(JSON.stringify(SHOTS.find((s) => s.id === id)));   // build() writes into the shot: work on a copy
      const b = build(shot, { makeCam, W: 1920, H: 1080 }); b.scene.updateMatrixWorld(true);
      const shown = (o) => { for (let q = o; q; q = q.parent) if (q.visible === false || q.userData.baseVisible === false) return false; return true; };
      const figs = {};
      b.scene.traverse((o) => { if (!o.isMesh || !o.userData.who || !shown(o)) return; const L = o.userData.look || {};
        if (L.only && !L.only.includes('flat')) return; if (L.glass) return;
        const g = o.geometry, pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count, out = new Float32Array(n * 3), v = new o.position.constructor();
        for (let k = 0; k < n; k++) { v.fromBufferAttribute(pos, idx ? idx.getX(k) : k).applyMatrix4(o.matrixWorld); out[3 * k] = v.x; out[3 * k + 1] = v.y; out[3 * k + 2] = v.z; }
        const f = (figs[o.userData.who] ||= { parts: [] }); f.parts.push({ label: o.userData.idGroup || o.userData.label || o.name || '', tri: Array.from(out) }); });
      // set meshes near the figures (furniture, walls): one entry per label
      const props = {}; const figBox = []; b.scene.traverse((o) => { if (o.isMesh && o.userData.who && shown(o)) { o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); figBox.push(bb); } });
      const near = (bb) => figBox.some((x) => x.intersectsBox(bb));
      b.scene.traverse((o) => { if (!o.isMesh || o.userData.who || !shown(o)) return; const L = o.userData.look || {}; if (L.only && !L.only.includes('flat')) return; if (L.glass) return;
        const lab = o.userData.label || ''; if (!lab || /beam|slab|THE WORD/.test(lab)) return; o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); if (!near(bb)) return;
        const g = o.geometry, pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count, out = []; const v = new o.position.constructor();
        for (let k = 0; k < n; k++) { v.fromBufferAttribute(pos, idx ? idx.getX(k) : k).applyMatrix4(o.matrixWorld); out.push(v.x, v.y, v.z); }
        const owner = (lab.match(/^([A-Za-z0-9_]+): /) || [])[1];   // footwear etc. ('dad: sock'): part of that figure
        if (owner && figs[owner]) figs[owner].parts.push({ label: lab, tri: out }); else (props[lab] ||= { parts: [] }).parts.push({ label: lab, tri: out }); });
      const gaze = {};
      for (const [who, f] of Object.entries(b.figs || {})) { const P = f.userData.P; if (!P) continue;
        gaze[who] = { lookAt: P.lookAt?.toArray() || null, eyes: P.eyes?.toArray() || null, eyeCentres: P.eyeCentres ? { l: P.eyeCentres.l.toArray(), r: P.eyeCentres.r.toArray() } : null,
          headFwd: P.headFwd?.toArray(), headX: P.headX?.toArray(), headUp: P.headUp?.toArray(), report: P.gaze?.eye_deg || null,
          joints: Object.fromEntries(Object.entries(P).filter(([k, v]) => v && v.isVector3).map(([k, v]) => [k, v.toArray().map((x) => +x.toFixed(3))])) }; }
      return { figs, gaze, props };
    }, [SET, id]);
    results.push(analyse(id, dump));
  }
} finally { await browser.close(); server.close(); }

function geomOf(parts, filter = () => true) {
  const arrs = parts.filter(filter).map((p) => p.tri); const n = arrs.reduce((a, t) => a + t.length, 0); const pos = new Float32Array(n); let o = 0;
  for (const t of arrs) for (let k = 0; k < t.length; k += 9) {   // drop degenerate (collapsed) triangles: hidden parts are scaled to a point
    const ax = t[k + 3] - t[k], ay = t[k + 4] - t[k + 1], az = t[k + 5] - t[k + 2], bx = t[k + 6] - t[k], by = t[k + 7] - t[k + 1], bz = t[k + 8] - t[k + 2];
    if (Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) < 1e-12) continue; for (let j = 0; j < 9; j++) pos[o + j] = t[k + j]; o += 9; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, o), 3)); g.boundsTree = new BVH.MeshBVH(g); return g;
}
function V(a) { return new THREE.Vector3(...a); }
// deepest vertex of gx inside gy (ray parity: odd hits on a ray = inside a closed surface), its distance to gy
function deepIn(gx, gy) { const pos = gx.attributes.position, ray = new THREE.Ray(), dir = new THREE.Vector3(1, 0, 0.0137).normalize(), p = new THREE.Vector3(); let worst = 0, at = null;
    gy.computeBoundingBox(); const bb = gy.boundingBox;
    for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i); if (!bb.containsPoint(p)) continue; ray.set(p, dir);
      const hits = gy.boundsTree.raycast(ray, THREE.DoubleSide); if (hits.length % 2 === 0) continue;
      const c = gy.boundsTree.closestPointToPoint(p); if (c && c.distance > worst) { worst = c.distance; at = p.toArray().map((v) => +v.toFixed(3)); } }
    return { mm: +(worst * 1000).toFixed(1), at }; }
function bodyPair(A, B) {
  const ga = geomOf(A.parts), gb = geomOf(B.parts), I = new THREE.Matrix4();
  // intersecting triangle pairs (shapecast A's BVH against B's triangles)
  let pairs = 0; const where = [];
  ga.boundsTree.bvhcast(gb.boundsTree, I, { intersectsTriangles: (ta, tb) => { if (ta.intersectsTriangle(tb)) { pairs++; if (where.length < 5) where.push(ta.a.toArray().map((v) => +v.toFixed(3))); } return false; } });
  // clearance: closest distance between the two meshes
  const t1 = {}, t2 = {}; const res = ga.boundsTree.closestPointToGeometry(gb, I, t1, t2, 0, CLR_MAX);   // (r5) capped: uncapped, two bodies far apart took minutes to hours (the K4_writes hang)
  const clearance = res ? res.distance : null; if (args.debug) console.log('closest', JSON.stringify(t1), JSON.stringify(t2));
  // deepest vertex of A inside B (and B inside A): ray parity against the other body (+x ray), capped sampling
  const deep = deepIn;
  // which parts: per part pair (label = the mesh's idGroup / label)
  const byPart = {};
  if (pairs) for (const pa of A.parts) { const g1 = geomOf([pa]); for (const pb of B.parts) { const g2 = geomOf([pb]); let n = 0;
    g1.boundsTree.bvhcast(g2.boundsTree, I, { intersectsTriangles: (x, y) => { if (x.intersectsTriangle(y)) n++; return false; } }); if (n) byPart[`${pa.label} x ${pb.label}`] = n; } }
  return { intersecting_triangle_pairs: pairs, by_part: byPart, sample_points: where, clearance_mm: clearance == null ? (pairs ? 0 : null) : +(clearance * 1000).toFixed(1), ...(clearance == null && !pairs ? { clearance_gt_mm: CLR_MAX * 1000 } : {}), deepest_A_in_B: deep(ga, gb), deepest_B_in_A: deep(gb, ga) };
}
function eyes(g) {
  if (!g.lookAt || !g.eyeCentres) return null;
  const L = V(g.eyeCentres.l), R = V(g.eyeCentres.r), T = V(g.lookAt), mid = L.clone().add(R).multiplyScalar(0.5);
  const dl = T.clone().sub(L).normalize(), dr = T.clone().sub(R).normalize();
  // clamp exactly as engine/gaze.js eyeAim does (35 yaw, 30 up, 45 down) to get what the eyeballs actually do
  const hx = V(g.headX), hy = V(g.headUp), hz = V(g.headFwd), cl = (d) => { const x = d.dot(hx), y = d.dot(hy), z = d.dot(hz); const yaw = Math.max(-35, Math.min(35, Math.atan2(x, z) * 180 / Math.PI)), pit = Math.max(-45, Math.min(30, Math.asin(Math.max(-1, Math.min(1, y))) * 180 / Math.PI));
    const a = yaw * Math.PI / 180, b = pit * Math.PI / 180; return { d: hz.clone().multiplyScalar(Math.cos(a) * Math.cos(b)).addScaledVector(hx, Math.sin(a) * Math.cos(b)).addScaledVector(hy, Math.sin(b)).normalize(), yaw: +yaw.toFixed(1), pitch: +pit.toFixed(1) }; };
  const el = cl(dl), er = cl(dr);
  // closest approach of the two actual eye rays
  const w0 = L.clone().sub(R), a = el.d.dot(el.d), b = el.d.dot(er.d), c = er.d.dot(er.d), d = el.d.dot(w0), e = er.d.dot(w0), den = a * c - b * b;
  const s = den > 1e-9 ? (b * e - c * d) / den : 0, t = den > 1e-9 ? (a * e - b * d) / den : 0;
  const pL = L.clone().addScaledVector(el.d, s), pR = R.clone().addScaledVector(er.d, t), meet = pL.clone().add(pR).multiplyScalar(0.5);
  const dist = mid.distanceTo(T), ipd = L.distanceTo(R);
  return { target: g.lookAt.map((v) => +v.toFixed(3)), distance_m: +dist.toFixed(3), ipd_mm: +(ipd * 1000).toFixed(1),
    eye_l: { yaw_left: el.yaw, pitch_up: el.pitch }, eye_r: { yaw_left: er.yaw, pitch_up: er.pitch },
    vergence_deg: +(Math.acos(Math.min(1, el.d.dot(er.d))) * 180 / Math.PI).toFixed(2), vergence_expected_deg: +(2 * Math.atan(ipd / 2 / dist) * 180 / Math.PI).toFixed(2),
    rays_meet_at_m: +mid.distanceTo(meet).toFixed(3), rays_miss_mm: +(pL.distanceTo(pR) * 1000).toFixed(1), meet_off_target_mm: +(meet.distanceTo(T) * 1000).toFixed(1),
    diverge: s < 0 || t < 0, crossed_reading: dist < MIN_LOOK_M, ok: dist >= MIN_LOOK_M && s > 0 && t > 0 && meet.distanceTo(T) < 0.02 };
}
function analyse(id, dump) {
  const out = { shot: id, bodies: {}, eyes: {} }; const who = Object.keys(dump.figs);
  for (let i = 0; i < who.length; i++) for (let j = i + 1; j < who.length; j++) out.bodies[`${who[i]} vs ${who[j]}`] = bodyPair(dump.figs[who[i]], dump.figs[who[j]]);
  for (const [w, g] of Object.entries(dump.gaze)) { const e = eyes(g); if (e) out.eyes[w] = e; }
  // each figure vs each set object near it (furniture, walls): intersecting triangle pairs and clearance
  out.furniture = {};
  for (const w of who) { const gf = geomOf(dump.figs[w].parts); for (const [lab, pr] of Object.entries(dump.props || {})) { const gp2 = geomOf(pr.parts), I = new THREE.Matrix4(); let n = 0;
    gf.boundsTree.bvhcast(gp2.boundsTree, I, { intersectsTriangles: (x, y) => { if (x.intersectsTriangle(y)) n++; return false; } });
    const c = gf.boundsTree.closestPointToGeometry(gp2, I, {}, {}, 0, CLR_MAX); out.furniture[`${w} vs ${lab}`] = { intersecting_triangle_pairs: n, clearance_mm: c ? +(c.distance * 1000).toFixed(1) : null, ...(n ? (() => { const d = deepIn(gf, gp2); return { deepest_mm: d.mm, deepest_at: d.at }; })() : { deepest_mm: 0 }) };
    if (n && args.parts) { const bp = {}; for (const pa of dump.figs[w].parts) { const g1 = geomOf([pa]); let k = 0;   // (r5) --parts: which body part meets the object, and how deep
        g1.boundsTree.bvhcast(gp2.boundsTree, I, { intersectsTriangles: (x, y) => { if (x.intersectsTriangle(y)) k++; return false; } }); if (k) bp[pa.label] = { pairs: k, deepest_mm: deepIn(g1, gp2).mm }; }
      out.furniture[`${w} vs ${lab}`].by_part = bp; } } }
  out.joints = Object.fromEntries(Object.entries(dump.gaze).map(([w, g]) => [w, g.joints]));
  if (args.joints) for (const [w, j] of Object.entries(out.joints)) console.log(w, JSON.stringify(Object.fromEntries(Object.entries(j).filter(([k]) => String(args.joints).split(',').includes(k)))));
  const bad = Object.values(out.bodies).some((r) => r.intersecting_triangle_pairs > 0) || Object.values(out.eyes).some((e) => !e.ok);
  out.pass = !bad;
  console.log(`${SET} ${id}: ${out.pass ? 'PASS' : 'FAIL'}`);
  for (const [k, r] of Object.entries(out.bodies)) { console.log(`  ${k}: ${r.intersecting_triangle_pairs} intersecting tri pairs, clearance ${r.clearance_mm ?? '>' + r.clearance_gt_mm} mm, deepest ${r.deepest_A_in_B.mm} / ${r.deepest_B_in_A.mm} mm${!r.intersecting_triangle_pairs && (r.deepest_A_in_B.mm || r.deepest_B_in_A.mm) ? ' (ray parity only, no surface crossing: an open shell such as hair; not an overlap)' : ''}${r.sample_points.length ? ' near ' + JSON.stringify(r.sample_points[0]) : ''}`);
    for (const [k2, n] of Object.entries(r.by_part || {})) console.log(`      ${k2}: ${n}`); }
  for (const [k, r] of Object.entries(out.furniture)) if (r.intersecting_triangle_pairs || (r.clearance_mm != null && r.clearance_mm < 5)) console.log(`  ${k}: ${r.intersecting_triangle_pairs} tri pairs, clearance ${r.clearance_mm} mm, deepest ${r.deepest_mm} mm${r.deepest_at ? ' at ' + JSON.stringify(r.deepest_at) : ''}${r.by_part ? ' ' + JSON.stringify(r.by_part) : ''}`);
  for (const [w, e] of Object.entries(out.eyes)) console.log(`  ${w} eyes: target ${e.distance_m} m, IPD ${e.ipd_mm} mm, L ${e.eye_l.yaw_left}/${e.eye_l.pitch_up} R ${e.eye_r.yaw_left}/${e.eye_r.pitch_up}, vergence ${e.vergence_deg} (expect ${e.vergence_expected_deg}), rays meet ${e.rays_meet_at_m} m (miss ${e.rays_miss_mm} mm, ${e.meet_off_target_mm} mm off target)${e.ok ? '' : '  <-- CHECK'}`);
  return out;
}
if (args.json) fs.writeFileSync(path.resolve(String(args.json)), JSON.stringify(results, null, 1));
if (results.some((r) => !r.pass)) process.exitCode = 1;
