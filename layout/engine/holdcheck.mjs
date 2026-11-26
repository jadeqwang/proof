// Hold check with Rapier (2026-11-26, opt-in data from --gaze sidecars). Not a hand-rolled physics: @dimforge/rapier3d-compat.
//   node layout/engine/holdcheck.mjs <sidecar.json | dir> [...]     -> table on stdout; --json writes <SHOT>.holdcheck.json beside each
// Needs sidecars rendered with --gaze (key `holds`: each held object as world hull points + the capsules of every hand on
// it, from engine/main.js holdsFor / engine/hand.js capsules). Rapier lives outside the repo: RAPIER_DIR, default
// /home/jade/Documents/layout-deps/node_modules/@dimforge/rapier3d-compat (npm install @dimforge/rapier3d-compat there).
// Per object: hands = fixed capsule colliders (phalanges, thumb, palm strips), the object = a dynamic convex hull
// (density 300 kg/m3, friction 0.9), gravity 9.81, 60 steps of 1/60 s. Flags:
//   adjacent     no hand collider within 2 mm of the object at t = 0 (the hand is beside the object, not on it)
//   penetrates   a finger phalanx sinks more than 3 mm into the object at t = 0 (palm / thenar: 10 mm, soft tissue)
//   falls        the object's centre moves more than 1 cm in 1 s with the hands AND its supports (hold-fix
//                2026-11-26: every mesh within 1 cm of the object, tables / counters / laps / arms, is a static trimesh)
//   sinks into   the object starts more than 3 mm inside a support
//   clamped      squeezed from both faces (a sheet, a pinched pencil): held by friction, no drop test (see sheetModel)
//   fixed        the object is a body part (a forearm grab): contact and penetration only, no gravity
// API for a mesh adapter: checkHold({ hull: [[x,y,z]...], capsules: [{ a, b, r }...] }) -> { contact_mm, penetration_mm, drop_cm, pass, flags }
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const RAPIER = require(process.env.RAPIER_DIR || '/home/jade/Documents/layout-deps/node_modules/@dimforge/rapier3d-compat');
await RAPIER.init();
// three's ConvexHull (same three as layout/serve.mjs) for exact hull-plane distances: Rapier's convex-polyhedron distance
// queries are off by up to 2.5 mm on long capped cylinders (a pencil) and by more on thin hulls (hold pass 2026-11-26)
const THREE_DIR = process.env.THREE_DIR || '/home/jade/Documents/merge-me-back-to-main/engine/node_modules/three';
const THREE = await import(THREE_DIR + '/build/three.module.js'), { ConvexHull } = await import(THREE_DIR + '/examples/jsm/math/ConvexHull.js');
// signed distance from a ball to a convex hull: max over the hull's face planes (exact inside and over a face; a lower
// bound near an edge or corner, where it errs on the side of contact)
function hullPlanes(pts) { const h = new ConvexHull().setFromPoints(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))); return h.faces.map((f) => [f.normal.x, f.normal.y, f.normal.z, f.constant]); }
const planeD = (P, p, r, out) => { let m = -Infinity, k = -1; P.forEach((q, i) => { const d = q[0] * p[0] + q[1] * p[1] + q[2] * p[2] - q[3]; if (d > m) { m = d; k = i; } }); if (out) out.n = P[k]; return m - r; };
const HARD_MM = 3, SOFT_MM = 10;   // finger phalanges / soft palm and thenar

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], len = (v) => Math.hypot(...v);
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function ballChain(world, c) {
  const d = sub(c.b, c.a), L = len(d), n = Math.max(2, Math.ceil(L / (c.r * 0.5)) + 1), body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed()), out = [];
  for (let q = 0; q < n; q++) { const t = q / (n - 1); out.push(world.createCollider(RAPIER.ColliderDesc.ball(c.r).setTranslation(c.a[0] + d[0] * t, c.a[1] + d[1] * t, c.a[2] + d[2] * t).setFriction(0.9), body)); }
  return out;
}
function capsuleBody(world, c) {
  const d = sub(c.b, c.a), L = len(d), mid = [(c.a[0] + c.b[0]) / 2, (c.a[1] + c.b[1]) / 2, (c.a[2] + c.b[2]) / 2];
  // rotation taking +y to d
  const y = [0, 1, 0], u = L > 1e-9 ? d.map((x) => x / L) : y; const ax = [y[1] * u[2] - y[2] * u[1], y[2] * u[0] - y[0] * u[2], y[0] * u[1] - y[1] * u[0]];
  const s = len(ax), cth = u[1]; let q = { x: 0, y: 0, z: 0, w: 1 };
  if (s > 1e-9) { const ang = Math.atan2(s, cth), k = Math.sin(ang / 2) / s; q = { x: ax[0] * k, y: ax[1] * k, z: ax[2] * k, w: Math.cos(ang / 2) }; } else if (cth < 0) q = { x: 1, y: 0, z: 0, w: 0 };
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(...mid).setRotation(q));
  return world.createCollider(RAPIER.ColliderDesc.capsule(Math.max(1e-4, L / 2), c.r).setFriction(0.9), body);
}
// hull points with (almost) no thickness (a sheet of paper) get a skin along their thinnest direction (see below)
export function thicken(hull) { const { c, v, ext } = sheetFrame(hull);
  // a sheet is simulated as a slab at least 1 mm thick: Rapier drops a small slab of 0.3 mm straight through two pads that
  // squeeze it (a 1.2 mm wide test piece: 4.7 m in 1 s), and holds the same piece at 1 mm
  if (ext >= 0.0005) return hull; const k = 0.0005 - ext;
  return hull.flatMap((p) => [p.map((x, i) => x + v[i] * k), p.map((x, i) => x - v[i] * k)]);
}
// centroid c, thinnest direction v and the half-extent along it
export function sheetFrame(hull) {
  const c = hull.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((x) => x / hull.length);
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (const p of hull) { const d = sub(p, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j]; }
  // smallest eigenvector by inverse power iteration on C + eps
  let v = [0.31, 0.53, 0.79]; const M = C.map((r, i) => r.map((x, j) => x + (i === j ? 1e-9 : 0)));
  const solve = (A, b) => { const m = A.map((r, i) => [...r, b[i]]); for (let i = 0; i < 3; i++) { let k = i; for (let r = i + 1; r < 3; r++) if (Math.abs(m[r][i]) > Math.abs(m[k][i])) k = r; [m[i], m[k]] = [m[k], m[i]];
    for (let r = 0; r < 3; r++) if (r !== i) { const f = m[r][i] / m[i][i]; for (let q = i; q < 4; q++) m[r][q] -= f * m[i][q]; } } return m.map((r, i) => r[3] / r[i]); };
  for (let it = 0; it < 30; it++) { v = solve(M, v); const l = len(v) || 1; v = v.map((x) => x / l); }
  const ext = Math.max(...hull.map((p) => Math.abs(sub(p, c)[0] * v[0] + sub(p, c)[1] * v[1] + sub(p, c)[2] * v[2])));
  return { c, v, ext };
}
// Sheets (paper, a torn piece: half-thickness under 0.5 mm) are measured analytically, not with Rapier: its convex hull of
// a thickened sheet reports points 5 mm off the plane as inside, and it cannot hold a mm-scale slab squeezed between two
// pads (an ideal 8 x 8 x 1 mm slab between two pads pressed 1.4 mm into it falls 3 m). Ball-to-sheet distance: in-plane
// distance to the sheet's outline (2D convex hull) and the distance off its plane (nominal paper 0.15 mm a side).
// CLAMPED = pressed from both faces (a ball on each side, >= 0.2 mm into the sheet, over the sheet): friction holds it,
// so the drop test is not needed.
function sheetModel(hull) {
  const { c, v, ext } = sheetFrame(hull); const a = Math.abs(v[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  let e1 = [v[1] * a[2] - v[2] * a[1], v[2] * a[0] - v[0] * a[2], v[0] * a[1] - v[1] * a[0]]; const l = len(e1); e1 = e1.map((x) => x / l);
  const e2 = [v[1] * e1[2] - v[2] * e1[1], v[2] * e1[0] - v[0] * e1[2], v[0] * e1[1] - v[1] * e1[0]];
  const P2 = hull.map((p) => { const d = sub(p, c); return [dot3(d, e1), dot3(d, e2)]; }).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cr = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]); const lo = [], up = [];
  for (const p of P2) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of P2.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const poly = [...lo.slice(0, -1), ...up.slice(0, -1)], halfT = Math.max(ext, 0.00015);
  const inside = (q) => poly.every((p, i) => cr(p, poly[(i + 1) % poly.length], q) >= 0);
  const edgeD = (q) => Math.min(...poly.map((p, i) => { const b = poly[(i + 1) % poly.length], ab = [b[0] - p[0], b[1] - p[1]], t = Math.max(0, Math.min(1, ((q[0] - p[0]) * ab[0] + (q[1] - p[1]) * ab[1]) / ((ab[0] ** 2 + ab[1] ** 2) || 1e-12))); return Math.hypot(q[0] - p[0] - ab[0] * t, q[1] - p[1] - ab[1] * t); }));
  // signed distance from a ball (centre p, radius r) to the sheet, and which side it is on (+1 / -1) when over the sheet
  return { ballD(p, r) { const d = sub(p, c), z = dot3(d, v), q = [dot3(d, e1), dot3(d, e2)]; const over = poly.length >= 3 && inside(q);
    const off = Math.max(0, Math.abs(z) - halfT), dd = over ? Math.abs(z) - halfT - r : Math.hypot(edgeD(q), off) - r; return { d: dd, side: over ? Math.sign(z) || 1 : 0 }; } };
}
// hold: { hull | tris, capsules, supports?: [{ label, pos, idx }], fixed? } (fixed: a body part, held up by its owner:
// contact and penetration only)
export function checkHold({ hull, tris, capsules, supports = [], fixed = false }) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  let body, obj, c0, hull0 = null, sheetMode = false;
  if (fixed || !hull) { if (!tris) return { pass: false, flags: ['no geometry'] };
    body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed()); obj = world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(tris.pos), new Uint32Array(tris.idx)), body); c0 = [0, 0, 0]; }
  else { hull0 = hull; sheetMode = sheetFrame(hull).ext < 0.0005; hull = thicken(hull); c0 = hull.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((x) => x / hull.length);
    const local = new Float32Array(hull.flatMap((p) => sub(p, c0)));
    body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...c0).setCcdEnabled(true));
    const desc = RAPIER.ColliderDesc.convexHull(local); if (!desc) return { pass: false, flags: ['bad hull'] };
    obj = world.createCollider(desc.setDensity(300).setFriction(0.9), body); }
  // hands as chains of balls (spacing r / 2): Rapier's capsule-vs-convex contact distance is wrong by up to 12 mm for a
  // capsule lying along a face of a thin hull or cuboid (hold pass 2026-11-26, repro: a capsule 0.5 mm over a 0.3 mm sheet
  // reads -10.8 mm); balls are exact
  const hands = capsules.map((c) => ballChain(world, c));
  // supports: static triangles of the furniture / laps / arms the object rests on
  const sup = []; if (!fixed) for (const s of supports) { if (!s.idx?.length) continue; const sb = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    // each triangle becomes a 6 mm prism extruded away from the object (a thin object tunnels through a bare trimesh;
    // per-triangle prisms keep concave supports, a bowl or a lap, exact)
    const cols = [];
    for (let t = 0; t + 2 < s.idx.length; t += 3) { const V = [0, 1, 2].map((k) => { const i = s.idx[t + k] * 3; return [s.pos[i], s.pos[i + 1], s.pos[i + 2]]; });
      const e1 = sub(V[1], V[0]), e2 = sub(V[2], V[0]); let nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; const nl = len(nn); if (nl < 1e-10) continue; nn = nn.map((x) => x / nl);
      // extrude away from the object's NEAREST surface point (the centroid rule went wrong for large or offset objects)
      const tc = [0, 1, 2].map((i) => (V[0][i] + V[1][i] + V[2][i]) / 3), pj = obj.projectPoint({ x: tc[0], y: tc[1], z: tc[2] }, false);
      const toward = pj && !pj.isInside && len(sub([pj.point.x, pj.point.y, pj.point.z], tc)) > 1e-6 ? sub([pj.point.x, pj.point.y, pj.point.z], tc) : sub(c0, tc); if (dot3(toward, nn) > 0) nn = nn.map((x) => -x);
      const pts = [...V, ...V.map((p) => p.map((x, i) => x + nn[i] * 0.006))].flat(); const d = RAPIER.ColliderDesc.convexHull(new Float32Array(pts)); if (d) cols.push(world.createCollider(d.setFriction(0.9), sb)); }
    sup.push({ label: s.label, cols }); }
  // contact / penetration at t = 0 (closest distance between shapes; negative = penetration). Soft parts (palm strips,
  // the thumb's thenar) may sink SOFT_MM before it counts; finger phalanges HARD_MM.
  let minD = Infinity, worst = null, pen = false, hardD = Infinity, softD = Infinity; const sheet = sheetMode ? sheetModel(hull0) : null, sides = new Set(); const planes = !sheet && hull0 ? hullPlanes(hull0) : null, pressN = [];
  hands.forEach((hs, i) => { let r = null;
    if (sheet) { const c = capsules[i], dd = sub(c.b, c.a), n = Math.max(2, Math.ceil(len(dd) / (c.r * 0.5)) + 1);
      for (let q = 0; q < n; q++) { const t = q / (n - 1), m = sheet.ballD(c.a.map((x, k) => x + dd[k] * t), c.r); if (m.side && m.d <= -0.0002) sides.add(m.side); if (!r || m.d < r.distance) r = { distance: m.d }; } }
    else if (planes) { const c = capsules[i], dd = sub(c.b, c.a), n = Math.max(2, Math.ceil(len(dd) / (c.r * 0.5)) + 1);
      for (let q = 0; q < n; q++) { const o = {}, m = planeD(planes, c.a.map((x, k) => x + dd[k] * (q / (n - 1))), c.r, o); if (!r || m < r.distance) r = { distance: m };
        if (m <= -0.0002 && !/^palm|^thumb0/.test(c.part || '')) pressN.push(o.n); } }
    else for (const h of hs) { const q = obj.contactCollider(h, 0.05); if (q && (!r || q.distance < r.distance)) r = q; }
    if (!r) return; const part = capsules[i].part || '', soft = /^palm|^thumb0/.test(part);
    if (soft) softD = Math.min(softD, r.distance); else if (r.distance < hardD) { hardD = r.distance; worst = part; }
    minD = Math.min(minD, r.distance); if (r.distance < -(soft ? SOFT_MM : HARD_MM) / 1000) pen = true; });
  if (!worst && softD < Infinity) worst = 'palm/thenar';
  // a trimesh support only reports the side the object is on; a hull sunk more than 3 mm into a table top fails too
  let supD = Infinity, supWorst = null;
  if (planes || sheet) { for (const s of supports) { if (fixed || !s.idx?.length) continue; for (let t = 0; t < s.pos.length; t += 3) { const p = [s.pos[t], s.pos[t + 1], s.pos[t + 2]];
      const d = sheet ? sheet.ballD(p, 0).d : planeD(planes, p, 0); if (d < supD) { supD = d; supWorst = s.label; } } }
    // vertices only: a support face crossing the object with all its corners outside is missed; also ask Rapier, and keep
    // its answer only when it is the smaller overlap (its polyhedron distances over-report)
    for (const s of sup) for (const col of s.cols) { const r = obj.contactCollider(col, 0.05); if (r && r.distance < -0.0001 && supD > 0 && r.distance > -0.003) { if (r.distance < supD) { supD = r.distance; supWorst = s.label; } } } }
  else for (const s of sup) for (const col of s.cols) { const r = obj.contactCollider(col, 0.05); if (r && r.distance < supD) { supD = r.distance; supWorst = s.label; } }
  // CLAMPED also for a solid: finger pads pressed >= 0.2 mm into opposite faces (normals more than 120 deg apart), a pinched
  // pencil; Rapier's polyhedron contacts are too inexact to carry such a squeeze in the drop test
  const opposed = pressN.some((a, i) => pressN.some((b, j) => j > i && a[0] * b[0] + a[1] * b[1] + a[2] * b[2] < -0.5));
  let drop = 0; const clamped = sides.size === 2 || opposed;
  if (!fixed && !clamped) { world.timestep = 1 / 60; for (let i = 0; i < 60; i++) world.step(); const p = body.translation(); drop = len(sub([p.x, p.y, p.z], c0)); }
  const flags = []; if (!(minD <= 0.002)) flags.push('adjacent'); if (pen) flags.push('penetrates'); if (supD < -HARD_MM / 1000) flags.push('sinks into ' + supWorst);
  if (drop > 0.01) flags.push(sup.length ? 'falls / slides' : 'falls (nothing under it)');
  world.free();
  return { contact_mm: minD === Infinity ? null : +(minD * 1000).toFixed(1), penetration_mm: hardD < 0 ? +(-hardD * 1000).toFixed(1) : 0, deepest_part: worst, soft_mm: softD < 0 ? +(-softD * 1000).toFixed(1) : 0, drop_cm: +(drop * 100).toFixed(1),
    clamped: clamped || undefined, supports: sup.map((s) => s.label), support_gap_mm: supD === Infinity ? null : +(supD * 1000).toFixed(1), fixed: fixed || undefined, pass: !flags.length, flags };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2), asJson = args.includes('--json'); const files = [];
  for (const a of args.filter((x) => !x.startsWith('--'))) { if (fs.statSync(a).isDirectory()) { for (const f of fs.readdirSync(a)) if (/\.json$/.test(f) && !/holdcheck/.test(f)) files.push(path.join(a, f)); } else files.push(a); }
  console.log('| set | shot | object | hands | contact mm | finger penetration mm (part) / palm-thenar mm | drop cm (1 s), supports | result |\n|---|---|---|---|---|---|---|---|');
  for (const f of files.sort()) { let sc; try { sc = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; } if (!sc.holds?.length) continue;
    const res = [];
    for (const h of sc.holds) { const who = h.hands.filter((x) => !x.touching_only).map((x) => `${x.who}.${x.arm} ${x.shape}`).join(' + ') + (h.hands.some((x) => x.touching_only) ? ' (+ touching)' : '');
      if (!h.hull && !h.tris) { res.push({ object: null, who, pass: false, flags: ['no object at the hand'] }); console.log(`| ${sc.set} | ${sc.shot} | (none within 3 cm) | ${who} | | | | FAIL: no object at the hand |`); continue; }
      const r = checkHold({ hull: h.hull, tris: h.tris, fixed: !!h.fixed, supports: h.supports || [], capsules: h.hands.flatMap((x) => x.capsules) }); res.push({ object: h.object, who, ...r });
      console.log(`| ${sc.set} | ${sc.shot} | ${h.object} | ${who} | ${r.contact_mm} | ${r.penetration_mm}${r.penetration_mm ? ' (' + r.deepest_part + ')' : ''} / ${r.soft_mm} | ${r.fixed ? 'fixed (body)' : r.clamped ? 'clamped (pinched from both faces)' : r.drop_cm}${r.supports?.length ? ' on ' + [...new Set(r.supports)].join(' / ') : ''} | ${r.pass ? 'pass' : 'FAIL: ' + r.flags.join(', ')} |`); }
    if (asJson) fs.writeFileSync(f.replace(/\.json$/, '.holdcheck.json'), JSON.stringify(res, null, 1));
  }
}
