// Set-local helpers shared by basement90 and kitchen90 (kept out of layout/engine on purpose).
import * as THREE from 'three';
import { mk, box, cyl, ball, limb, slab, tag, V, rad } from '../../engine/core.js';
import { CAST, girthK } from '../../engine/mannequin.js';

// a straight wall with rectangular holes, one mesh (no seams in line mode).
//   axis 'z': the wall lies in the plane z = at and runs along x from a0 to a1
//   axis 'x': the wall lies in the plane x = at and runs along z from a0 to a1
//   out: +1 / -1 = the side the thickness goes to (away from the room); holes: [{ a0, a1, y0, y1 }]
export function wall({ axis, at, a0, a1, y0 = 0, y1, t = 0.15, out = 1, holes = [], look, label }) {
  const sh = new THREE.Shape(); sh.moveTo(a0, y0); sh.lineTo(a1, y0); sh.lineTo(a1, y1); sh.lineTo(a0, y1); sh.lineTo(a0, y0);
  for (const h of holes) { const p = new THREE.Path(), e = h.y0 <= y0 ? y0 + 1e-3 : h.y0; p.moveTo(h.a0, e); p.lineTo(h.a0, h.y1); p.lineTo(h.a1, h.y1); p.lineTo(h.a1, e); p.lineTo(h.a0, e); sh.holes.push(p); }
  const m = mk(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), look);
  if (axis === 'z') m.position.z = out > 0 ? at : at - t;
  else { m.rotation.y = -Math.PI / 2; m.position.x = out > 0 ? at + t : at; }   // shape x -> world z, extrusion -> world -x
  return tag(m, label);
}
// a closed box-like solid from two quads (near 4 corners, far 4 corners, same winding)
export function hexa(n, f, look) {
  const p = [...n, ...f].flatMap((v) => (Array.isArray(v) ? v : v.toArray()));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setIndex([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0]); g.computeVertexNormals();
  const m = mk(g, look); m.userData.double = true; return m;
}
// a thin polyline (for label-mode guides: beam footprints, shaft edges)
export function polyline(pts, r, look, closed = false) {
  const g = new THREE.Group(); const P = pts.map((p) => V(p));
  for (let i = 0; i < P.length - (closed ? 0 : 1); i++) g.add(limb(P[i], P[(i + 1) % P.length], r, look));
  return g;
}
// a simple four-legged kitchen chair. at [x, z], yaw deg (0 = the sitter faces +z)
export function kitchenChair(at, yaw, look, o = {}) {
  const g = new THREE.Group(); g.position.set(at[0], 0, at[1]); g.rotation.y = rad(yaw);
  const sw = o.w ?? 0.42, sd = o.d ?? 0.42, sh = o.seatTop ?? 0.45, bh = o.backTop ?? 0.88, lg = 0.035;
  g.add(box(sw, 0.03, sd, look, [0, sh - 0.015, 0]));
  for (const sx of [-1, 1]) { g.add(box(lg, sh - 0.03, lg, look, [sx * (sw / 2 - lg / 2), (sh - 0.03) / 2, sd / 2 - lg / 2]));
    g.add(box(lg, bh, lg, look, [sx * (sw / 2 - lg / 2), bh / 2, -sd / 2 + lg / 2])); }
  g.add(box(sw - lg, 0.09, 0.02, look, [0, bh - 0.06, -sd / 2 + lg / 2])); g.add(box(sw - lg, 0.05, 0.02, look, [0, bh - 0.22, -sd / 2 + lg / 2]));
  return g;
}
// a loft: a closed tube through stations { c: [x,y,z], x: side dir, y: up dir, w, h, rt (top corner radius, fraction
// of h), rb (bottom) } with a rounded-rectangle cross-section; ends capped. One mesh (no seams in line mode).
export function loft(stations, look, seg = 5) {
  const prof = (w, h, rt, rb) => { const pts = [], hw = w / 2, hh = h / 2, R1 = Math.min(rt * h, hw), R0 = Math.min(rb * h, hw);
    const arc = (cx, cy, r, a0, a1) => { for (let i = 0; i <= seg; i++) { const a = a0 + (a1 - a0) * i / seg; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
    arc(hw - R0, -hh + R0, R0, -Math.PI / 2, 0); arc(hw - R1, hh - R1, R1, 0, Math.PI / 2); arc(-hw + R1, hh - R1, R1, Math.PI / 2, Math.PI); arc(-hw + R0, -hh + R0, R0, Math.PI, Math.PI * 1.5);
    return pts; };
  const P = [], idx = [], rows = [];
  for (const st of stations) { const x = V(st.x).normalize(), y = V(st.y).normalize(), c = V(st.c), pr = prof(st.w, st.h, st.rt ?? 0.3, st.rb ?? 0.1), row = [];
    for (const [u, v] of pr) { const p = c.clone().addScaledVector(x, u).addScaledVector(y, v); row.push(P.length / 3); P.push(p.x, p.y, p.z); } rows.push(row); }
  const n = rows[0].length;
  for (let k = 0; k < rows.length - 1; k++) for (let j = 0; j < n; j++) { const a = rows[k][j], b = rows[k][(j + 1) % n], c2 = rows[k + 1][(j + 1) % n], d = rows[k + 1][j]; idx.push(a, d, c2, a, c2, b); }
  for (const [row, flip] of [[rows[0], true], [rows[rows.length - 1], false]]) { const cc = row.reduce((s, i) => s.add(V(P[i * 3], P[i * 3 + 1], P[i * 3 + 2])), V()).multiplyScalar(1 / n), ci = P.length / 3; P.push(cc.x, cc.y, cc.z);
    for (let j = 0; j < n; j++) flip ? idx.push(ci, row[(j + 1) % n], row[j]) : idx.push(ci, row[j], row[(j + 1) % n]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = mk(g, look); m.userData.double = true; return m;
}
// c. 1990 five-star swivel task chair (r4, see layout.js CHAIR). spec: { at [x, z], seatYaw deg (0 = sitter faces +z),
// spoke0 deg (world angle of spoke 0) }. Base: hub, five tapered rounded legs rising to the hub, a socket boss under each
// tip, a hooded twin-wheel caster on a swivel stem (trailing outward), a telescoping black shroud and chrome piston;
// top: steel tilt plate, tension knob, height lever, seat (plywood shell + foam, waterfall front), J-bar, backrest.
export function swivelChair(C, spec = {}) {
  const at = spec.at || C.at, seatYaw = spec.seatYaw ?? C.seatYaw, spoke0 = spec.spoke0 ?? C.spoke0, K = C.look, Lg = C.leg, H = C.hub, cs = C.caster;
  const g = new THREE.Group(), base = new THREE.Group(); base.position.set(at[0], 0, at[1]); g.add(base);
  base.add(tag(cyl(H.r, H.r * 1.15, H.y1 - H.y0, K.base, [0, (H.y0 + H.y1) / 2, 0], null, 24), 'chair base (five-star, black nylon)'));
  base.add(tag(cyl(H.r * 0.82, H.r * 0.82, 0.006, K.base, [0, H.y1 + 0.003, 0], null, 24), 'chair base (five-star, black nylon)'));
  for (let k = 0; k < 5; k++) { const a = rad(spoke0 + 72 * k), d = [Math.cos(a), 0, Math.sin(a)], sd = [-d[2], 0, d[0]];
    const st = []; for (let i = 0; i <= 6; i++) { const t = i / 6, r = Lg.r0 + (Lg.r1 - Lg.r0) * t, top = Lg.top0 + (Lg.top1 - Lg.top0) * t, bot = Lg.bot0 + (Lg.bot1 - Lg.bot0) * t;
      const end = i === 6 ? 0.85 : 1;   // a rounded nose at the tip
      st.push({ c: [d[0] * r, (top + bot) / 2, d[2] * r], x: sd, y: [0, 1, 0], w: (Lg.w0 + (Lg.w1 - Lg.w0) * t) * end, h: (top - bot) * (i === 6 ? 0.9 : 1), rt: 0.45, rb: 0.12 }); }
    base.add(tag(loft(st, K.base), 'chair base (five-star, black nylon)'));
    // the caster: socket boss under the tip, a swivel stem, a hood over two 50 mm wheels, trailing outward
    const rs = C.spokeR, sx = d[0] * rs, sz = d[2] * rs, wy = cs.wheel, tx = sx + d[0] * cs.trail, tz = sz + d[2] * cs.trail;
    base.add(tag(cyl(0.016, 0.018, 0.012, K.base, [sx, cs.stemY - 0.006, sz], null, 16), 'casters (twin-wheel, black)'));
    base.add(tag(cyl(0.006, 0.006, cs.stemY - wy - 0.02, K.chrome, [sx, (cs.stemY + wy + 0.02) / 2, sz], null, 10), 'casters (twin-wheel, black)'));
    const hood = new THREE.Group(); hood.position.set((sx + tx) / 2, wy + 0.012, (sz + tz) / 2); hood.rotation.y = -a; base.add(hood);   // local x = along the leg
    hood.add(box(cs.trail + 0.03, 0.03, cs.gap, K.caster, [0, 0, 0]));
    hood.add(cyl(0.02, 0.02, cs.gap, K.caster, [-(cs.trail + 0.03) / 2 + 0.01, 0.005, 0], [90, 0, 0], 16));
    for (const s of [-1, 1]) hood.add(cyl(wy, wy, cs.w, K.caster, [(cs.trail + 0.03) / 2 - 0.016 + 0.0, -0.012, s * (cs.gap / 2 + cs.w / 2)], [90, 0, 0], 24));
    tag(hood, 'casters (twin-wheel, black)'); }
  // gas column: a three-step telescoping black shroud, then the chrome piston into the tilt plate
  const plateY = C.seatTop - C.seat.t - 0.03;
  const sh = [[0.029, H.y1, 0.2], [0.026, 0.2, 0.26], [0.023, 0.26, 0.31]];
  for (const [r, y0, y1] of sh) base.add(tag(cyl(r, r, y1 - y0, K.shell, [0, (y0 + y1) / 2, 0], null, 20), 'gas column (shroud, piston)'));
  base.add(tag(cyl(0.014, 0.014, plateY - 0.31, K.chrome, [0, (plateY + 0.31) / 2, 0], null, 14), 'gas column (shroud, piston)'));
  // the top: turns with the seat
  const top = new THREE.Group(); top.position.set(at[0], 0, at[1]); top.rotation.y = rad(seatYaw); g.add(top);
  top.add(tag(box(0.2, 0.025, 0.22, K.steel, [0, plateY + 0.0125, 0.02]), 'seat mechanism (tilt plate)'));
  top.add(tag(cyl(0.022, 0.022, 0.03, K.shell, [0, plateY - 0.01, 0.125], [90, 0, 0], 16), 'seat mechanism (tension knob)'));
  top.add(tag(slab(V(-0.09, plateY + 0.01, 0.06), V(-0.2, plateY - 0.005, 0.1), 0.012, 0.008, V(0, 1, 0), K.steel), 'seat mechanism (height lever)'));
  top.add(tag(ball(0.012, K.shell, [-0.205, plateY - 0.006, 0.102]), 'seat mechanism (height lever)'));
  // seat: a black plastic under-shell, then the cushion as a loft from back to front (waterfall front edge dips 2 cm)
  const S = C.seat, sy0 = C.seatTop - S.t;
  top.add(tag(loft([{ c: [0, sy0 + 0.008, -S.d / 2 + 0.01], x: [1, 0, 0], y: [0, 1, 0], w: S.w - 0.02, h: 0.016, rt: 0.3, rb: 0.3 }, { c: [0, sy0 + 0.008, S.d / 2 - 0.02], x: [1, 0, 0], y: [0, 1, 0], w: S.w - 0.02, h: 0.016, rt: 0.3, rb: 0.3 }], K.shell), 'seat (fabric)'));
  { const st = [], N = 8; for (let i = 0; i <= N; i++) { const t = i / N, z = -S.d / 2 + S.d * t, front = Math.max(0, (t - 0.7) / 0.3), back = Math.max(0, (0.12 - t) / 0.12);
      const h = (S.t - 0.016) * (1 - 0.55 * front * front - 0.35 * back * back), yc = sy0 + 0.016 + h / 2 - 0.01 * front;
      st.push({ c: [0, yc, z], x: [1, 0, 0], y: [0, 1, 0], w: S.w * (1 - 0.06 * back - 0.04 * front), h, rt: 0.42, rb: 0.15 }); }
    top.add(tag(loft(st, K.fabric), 'seat (fabric)')); }
  // J-bar: steel bar from under the seat back, up behind the backrest
  const B = C.back, by = (B.y0 + B.y1) / 2;
  top.add(tag(slab(V(0, plateY + 0.01, -0.04), V(0, plateY + 0.01, -S.d / 2 - 0.03), 0.05, 0.01, V(1, 0, 0), K.steel), 'back bar (steel)'));
  top.add(tag(slab(V(0, plateY + 0.005, -S.d / 2 - 0.03), V(0, by, B.z - B.t / 2 - 0.008), 0.05, 0.01, V(1, 0, 0), K.steel), 'back bar (steel)'));
  // backrest: shell + cushion, curved a little around the sitter
  { const st = [], N = 6; for (let i = 0; i <= N; i++) { const t = i / N, y = B.y0 + (B.y1 - B.y0) * t, e = Math.sin(Math.PI * t);
      st.push({ c: [0, y, B.z + 0.01 * e], x: [1, 0, 0], y: [0, 0, 1], w: B.w * (0.92 + 0.08 * e), h: B.t * (0.55 + 0.45 * e), rt: 0.45, rb: 0.25 }); }
    top.add(tag(loft(st, K.fabric), 'backrest (fabric)')); }
  tag(g, 'swivel chair');
  return g;
}
// world offset -> a figure's body-local frame (x = its left, z = its front) for legOpts.ankleL / ankleR.
// Returns the override for that side (the engine mirrors x for the right leg).
export function ankleLocal(world, pelvis, yawDeg, side) { const a = rad(yawDeg), dx = world[0] - pelvis[0], dy = world[1] - pelvis[1], dz = world[2] - pelvis[2];
  const lx = dx * Math.cos(a) - dz * Math.sin(a), lz = dx * Math.sin(a) + dz * Math.cos(a); return [side === 'L' ? lx : -lx, dy, lz]; }
// sidecar helpers
export const r3 = (v) => (Array.isArray(v) ? v : v.toArray()).map((x) => +x.toFixed(4));
export const mirrorMatrix = (n, d) => new THREE.Matrix4().set(1 - 2 * n.x * n.x, -2 * n.x * n.y, -2 * n.x * n.z, 2 * d * n.x, -2 * n.y * n.x, 1 - 2 * n.y * n.y, -2 * n.y * n.z, 2 * d * n.y, -2 * n.z * n.x, -2 * n.z * n.y, 1 - 2 * n.z * n.z, 2 * d * n.z, 0, 0, 0, 1);
export function pointInQuad(p, q) { let s = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4]; const c = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); if (c !== 0) { if (s === 0) s = Math.sign(c); else if (Math.sign(c) !== s) return false; } } return true; }
// hide meshes by label (plan views lift the ceiling off)
export function hideLabels(root, labels) { if (!labels) return; root.traverse((o) => { if (o.isMesh && labels.some((l) => (o.userData.label || '').startsWith(l))) { o.visible = false; o.userData.baseVisible = false; } }); }

// ---- footwear, set-local (the engine has only a sock colour, `costume.sock`, on its foot mesh; no shoes, no cuffs).
// footwear(fig, { cuff: { h, look }, slipper: { look, sole, wall, collar, open } }) -> a Group in world space, built from
// the figure's own foot mesh (idGroup ...footL / footR) and its knee / ankle points, so it follows every pose.
//   cuff: a sock tube from the ankle up the shin (h metres), 2 mm proud of the leg, so the sock's top edge draws a
//         line over the trouser hem; slipper: a shell offset from the foot surface (wall m, sole m under the sole),
//         cut at `collar` m above its own bottom; open: true = a backless scuff (the heel shows the sock).
// the foot mesh pushed out by d (and dz more under the sole), in world space; also returns per-vertex height / forward
function shell(foot, d, dz, info) {
  const fig = foot.parent, P = fig.userData.P, n = foot.userData.idGroup.slice(-1), heel = P['heel' + n], toe = P['toe' + n], A = P['ankle' + n];
  const fd = toe.clone().sub(heel); fd.y = 0; fd.normalize();
  const bottom = Math.min(heel.y, toe.y), axA = heel.clone().setY(bottom + 0.3 * (A.y - bottom)), axB = toe.clone().setY(axA.y), seg = axB.clone().sub(axA), L2 = seg.lengthSq();
  const src = foot.geometry, pos = src.attributes.position, N = pos.count, np = new Float32Array(N * 3), v = new THREE.Vector3();
  const hgt = new Float32Array(N), fwd = new Float32Array(N);
  for (let i = 0; i < N; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(foot.matrixWorld);
    const t = Math.max(0, Math.min(1, v.clone().sub(axA).dot(seg) / L2)), dv = v.clone().sub(axA.clone().addScaledVector(seg, t)), dl = dv.length() || 1;
    v.addScaledVector(dv, d / dl); if (dv.y < 0) v.y -= dz * Math.min(1, -dv.y / dl * 1.5);
    np.set([v.x, v.y, v.z], i * 3); hgt[i] = v.y - (bottom - dz); fwd[i] = v.clone().sub(heel).dot(fd); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(np, 3)); g.setIndex(Array.from(src.index.array)); g.computeVertexNormals();
  if (info) Object.assign(info, { hgt, fwd, FL: toe.clone().sub(heel).dot(fd), np });
  return g;
}
// a plain slip-on house slipper fitted to the engine's foot mesh: a flat sole (footprint traced from the foot, `margin`
// wider, `sole` thick) and, from `open` x the length to the toe, a vamp arching over the foot (`wall` off its top).
// open: 0 = closed heel; ~0.4 = a backless scuff (the sock heel shows).
function slipper(foot, S) {
  const fig = foot.parent, P = fig.userData.P, n = foot.userData.idGroup.slice(-1), heel = P['heel' + n], toe = P['toe' + n];
  const fd = toe.clone().sub(heel); fd.y = 0; fd.normalize(); const w = new THREE.Vector3(-fd.z, 0, fd.x), bottom = Math.min(heel.y, toe.y);
  const pos = foot.geometry.attributes.position, v = new THREE.Vector3(), pts = [];
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(foot.matrixWorld); pts.push([v.clone().sub(heel).dot(fd), v.clone().sub(heel).dot(w), v.y - bottom]); }
  const s0 = Math.min(...pts.map((p) => p[0])) - S.margin * 0.6, s1 = Math.max(...pts.map((p) => p[0])) + S.margin * 1.8, NB = 24;
  const bins = Array.from({ length: NB + 1 }, () => ({ lo: Infinity, hi: -Infinity, top: 0 }));
  for (const [x, y, z] of pts) { if (z > (S.maxH ?? 0.09)) continue; const k = Math.round((x - s0) / (s1 - s0) * NB), B = bins[k]; B.lo = Math.min(B.lo, y); B.hi = Math.max(B.hi, y); B.top = Math.max(B.top, z); }
  { const full = bins.map((B, k) => (B.lo < Infinity ? k : -1)).filter((k) => k >= 0);   // empty bins: interpolate between filled neighbours
    for (let k = 0; k <= NB; k++) if (bins[k].lo === Infinity) { const a = Math.max(...full.filter((j) => j < k), full[0]), b = Math.min(...full.filter((j) => j > k), full[full.length - 1]), t = b === a ? 0 : (k - a) / (b - a);
      bins[k] = { lo: bins[a].lo + (bins[b].lo - bins[a].lo) * t, hi: bins[a].hi + (bins[b].hi - bins[a].hi) * t, top: 0 }; } }
  const at = (k, lat, h) => heel.clone().addScaledVector(fd, s0 + (s1 - s0) * k / NB).addScaledVector(w, lat).setY(bottom + h);
  const soleTop = S.sole - 0.004, verts = [], idx = [], push = (p) => (verts.push(p.x, p.y, p.z), verts.length / 3 - 1);
  // sole: a rounded slab (rows across the footprint, top and bottom, edges closed)
  const half = (k) => { const B = bins[k], e = k === 0 || k === NB ? 0.35 : 1; return [(B.lo + B.hi) / 2, ((B.hi - B.lo) / 2 + S.margin) * e]; };
  const T = [], Bo = [];
  for (let k = 0; k <= NB; k++) { const [c, hw] = half(k); T.push([push(at(k, c - hw, soleTop)), push(at(k, c + hw, soleTop))]); Bo.push([push(at(k, c - hw, -0.004)), push(at(k, c + hw, -0.004))]); }
  for (let k = 0; k < NB; k++) { const q = (a, b, c, d) => idx.push(a, b, c, a, c, d);
    q(T[k][0], T[k][1], T[k + 1][1], T[k + 1][0]); q(Bo[k][0], Bo[k + 1][0], Bo[k + 1][1], Bo[k][1]);
    q(Bo[k][0], T[k][0], T[k + 1][0], Bo[k + 1][0]); q(Bo[k][1], Bo[k + 1][1], T[k + 1][1], T[k][1]); }
  const q = (a, b, c, d) => idx.push(a, b, c, a, c, d); q(Bo[0][0], Bo[0][1], T[0][1], T[0][0]); q(Bo[NB][0], T[NB][0], T[NB][1], Bo[NB][1]);
  // vamp: half-elliptical arches over the foot from k0 to the toe
  const k0 = Math.round(S.open * NB), NA = 12, rows = [];
  // each arch point: a ray from outside toward the foot's axis, hit on the engine's foot surface, pushed out by `wall`
  // (the engine foot is a few long-tapered pieces, so its vertices say little about its surface between them)
  const rc = new THREE.Raycaster(), axisH = soleTop + 0.004;   // just above the sole: inside the foot all the way to the toe
  let kEnd = NB;
  for (let k = k0; k <= NB; k++) { const [c, hw] = half(k), r = [], ax = at(k, c, axisH); let miss = 0;
    for (let j = 0; j <= NA; j++) { const th = Math.PI * j / NA, dir = w.clone().multiplyScalar(-Math.cos(th)).add(new THREE.Vector3(0, Math.sin(th), 0)).normalize();
      rc.set(ax.clone().addScaledVector(dir, 0.25), dir.clone().negate()); rc.far = 0.25; const hit = rc.intersectObject(foot, false)[0];
      if (!hit) { miss++; continue; } const p = hit.point.clone().addScaledVector(dir, S.wall);
      if (p.y < bottom + soleTop) p.y = bottom + soleTop; r.push(push(p)); }
    if (miss) { kEnd = k; break; } rows.push(r); }
  // the toe: close the last arch onto a point at the sole's front edge
  { const tipK = Math.min(NB, kEnd + 1), tip = push(at(tipK, half(tipK)[0], soleTop + 0.004)); rows.push(Array(NA + 1).fill(tip)); }
  for (let k = 0; k < rows.length - 1; k++) for (let j = 0; j < NA; j++) q(rows[k][j], rows[k + 1][j], rows[k + 1][j + 1], rows[k][j + 1]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = mk(g, S.look); m.userData.double = true; return m;
}
export function footwear(fig, o = {}) {
  const P = fig.userData.P, out = new THREE.Group(); fig.updateMatrixWorld(true);
  for (const n of ['L', 'R']) {
    const A = P['ankle' + n], K = P['knee' + n], heel = P['heel' + n], toe = P['toe' + n];
    let leg = null, foot = null;
    fig.traverse((m) => { const g = m.userData?.idGroup; if (!m.isMesh || !g) return; if (g.endsWith(':leg' + n)) leg = m; if (g.endsWith(':foot' + n)) foot = m; });
    if (o.cuff && leg) {   // the sock: a shell over the engine's foot (so its colour and flat grey are ours) + a cuff tube up the shin
      // leg radius from the engine's own numbers (mannequin.js legs: rA = 0.019 H kg at the ankle, 0.036 H kg at the calf,
      // the calf point 70% of the way up the shin), read-only
      const c = CAST[fig.name], H = c.h, kg = girthK(c.kind), sd = K.clone().sub(A).normalize(), tC = 0.7 * K.distanceTo(A);
      const r0 = 0.019 * H * kg, h = o.cuff.h, rTop = r0 + (0.036 - 0.019) * H * kg * Math.min(1, h / tC), e = o.cuff.proud ?? 0.003, grp = `${fig.name}:sock${n}`;
      const cg = new THREE.CylinderGeometry(rTop + e, r0 + e, h, 24, 1, true), m = mk(cg, o.cuff.look); m.userData.double = true; m.userData.idGroup = grp;
      m.position.copy(A).addScaledVector(sd, h / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sd);
      out.add(tag(m, `${fig.name}: sock`));
      const cap = mk(new THREE.SphereGeometry(r0 + e, 24, 12), o.cuff.look); cap.position.copy(A); cap.userData.idGroup = grp; out.add(tag(cap, `${fig.name}: sock`));
      if (foot) { const sk = mk(shell(foot, 0.002, 0), o.cuff.look); sk.userData.idGroup = grp; out.add(tag(sk, `${fig.name}: sock`)); }
    }
    if (o.slipper && foot) out.add(tag(slipper(foot, o.slipper), `${fig.name}: slipper`));
  }
  return out;
}
