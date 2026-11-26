// The IAS hoodie's cloth solved by Jolt Physics soft bodies (jolt-physics 1.1.2, WASM; vendored at
// layout/vendor/jolt-physics/). The lead (2026-11-26): use an existing engine, not hand-rolled physics. The pattern, the
// pressed pleat, her hands' choreography and the Truth check stay in sweatshirt_sim.js; this file only builds the Jolt
// world and steps it.
//
// The garment is ONE Jolt soft body: every pattern triangle a face, constraints from Jolt's CreateConstraints (edges,
// shear, and DISTANCE bend: Jolt's dihedral bend is singular at the pleat's 180-degree folds). Rest lengths of the stretch
// and shear edges are reset to the flat pattern (the fleece is not stretched); the bend edges keep the PRESSED shape (the knife pleat over Truth, flat elsewhere), which is how fleece
// remembers a fold. Held points are kinematic vertices (inverse mass 0) moved to the hands every step; each hand is also a
// kinematic capsule (a fist, 4.4 cm across) the cloth collides with, so the fabric wraps the fingers and hangs from the
// grip. Her thighs are static capsules. Jolt has no cloth self-collision, so a contact projection between layers runs
// after each Jolt step (selfContact below).
//
// Deterministic: single-threaded Jolt, fixed steps, the same inputs give the same vertices.
import { makePattern, initialPositions, handsAt, gripPoint, ACT, BODY, GRIP_PTS, PINCH_Y, PLEAT, THICK, startL, endR } from './sweatshirt_sim.js';

// Fleece (lead, 2026-11-26: thick cotton sweatshirt, not tissue): strong air damping (heavy cloth that does not flutter),
// ribbing ten times stiffer in bending than the body. (Stiffer body bends were tried: Jolt's distance bends then fight
// the pressed pleat and open it.)
export const JOLT_DEFAULTS = { dt: 1 / 240, iterations: 12, preroll: 1.5, duration: 3.0, damping: 0.6, stretch: 0, shear: 1e-6,
  bendType: 'distance', bend: 2e-4, ribBend: 2e-5, hoodBend: 6e-4, stringBend: 2e-4, vertexRadius: 0.004, fist: { r: 0.022, half: 0.03 }, pinchRows: [0, 0.03, 0.06, 0.09], selfR: 0.0115, selfSkip: 0.022, selfPasses: 1, colliders: [] };

const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const lerp3 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
function nearestBody(pat, x, y) {
  let best = -1, bd = 1e9; pat.P.forEach((p, i) => { if (p.piece !== 'body') return; const d = (p.u[0] - x) ** 2 + (p.u[1] - y) ** 2; if (d < bd - 1e-12) { bd = d; best = i; } }); return best;
}
const flatLen = (pat, a, b) => { const A = pat.P[a], B = pat.P[b];
  if (A.piece === 'hood' && B.piece === 'hood') return Math.hypot(A.h[0] - B.h[0], A.h[1] - B.h[1]);
  return Math.hypot(A.u[0] - B.u[0], A.u[1] - B.u[1]); };

// simulate the action up to time t. opts: { start, end (GARMENT anchors), colliders, pattern, ...JOLT_DEFAULTS }
export function simulate(Jolt, t, opts) {
  const opt = { ...JOLT_DEFAULTS, ...opts }; const { start, end } = opt;
  const pat = opt.pattern || makePattern(); const n = pat.P.length;
  const X0 = initialPositions(pat);
  // pressed pattern -> world, in the start frame (collar centre at origin)
  const x = new Float64Array(3 * n);
  for (let i = 0; i < n; i++) { const p = add3(add3(add3(start.origin, start.right, X0[3 * i]), start.up, X0[3 * i + 1] - BODY.h), start.out, X0[3 * i + 2]);
    x[3 * i] = p[0]; x[3 * i + 1] = p[1]; x[3 * i + 2] = p[2]; }
  // grips
  const inward = (name) => nearestBody(pat, GRIP_PTS[name][0] - Math.sign(GRIP_PTS[name][0]) * 0.03, GRIP_PTS[name][1]);
  const pinchIds = []; for (const yy of opt.pinchRows.map((d) => PINCH_Y - d)) for (const xx of [PLEAT.m1 + 0.004, PLEAT.m2, PLEAT.m3 - 0.004]) pinchIds.push(nearestBody(pat, xx, yy));
  const cluster = { shoulderL: [nearestBody(pat, ...GRIP_PTS.shoulderL), inward('shoulderL')], shoulderR: [nearestBody(pat, ...GRIP_PTS.shoulderR), inward('shoulderR')], pinch: pinchIds };

  // ---- the Jolt world
  const LAYER_STATIC = 0, LAYER_MOVING = 1;
  const settings = new Jolt.JoltSettings();
  const olf = new Jolt.ObjectLayerPairFilterTable(2); olf.EnableCollision(LAYER_STATIC, LAYER_MOVING); olf.EnableCollision(LAYER_MOVING, LAYER_MOVING);
  const bpi = new Jolt.BroadPhaseLayerInterfaceTable(2, 2);
  bpi.MapObjectToBroadPhaseLayer(LAYER_STATIC, new Jolt.BroadPhaseLayer(0)); bpi.MapObjectToBroadPhaseLayer(LAYER_MOVING, new Jolt.BroadPhaseLayer(1));
  settings.mObjectLayerPairFilter = olf; settings.mBroadPhaseLayerInterface = bpi;
  settings.mObjectVsBroadPhaseLayerFilter = new Jolt.ObjectVsBroadPhaseLayerFilterTable(settings.mBroadPhaseLayerInterface, 2, settings.mObjectLayerPairFilter, 2);
  settings.mMaxWorkerThreads = 0;
  const jolt = new Jolt.JoltInterface(settings); Jolt.destroy(settings);
  const sys = jolt.GetPhysicsSystem(), bi = sys.GetBodyInterface();
  sys.SetGravity(new Jolt.Vec3(0, -9.81, 0));
  const V3 = (p) => new Jolt.Vec3(p[0], p[1], p[2]), R3 = (p) => new Jolt.RVec3(p[0], p[1], p[2]);
  const quatFromTo = (axis) => { // rotation taking +Y to `axis`
    const a = [0, 1, 0], b = axis, c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    if (d < -0.9999) return new Jolt.Quat(1, 0, 0, 0); const w = 1 + d, l = Math.hypot(c[0], c[1], c[2], w); return new Jolt.Quat(c[0] / l, c[1] / l, c[2] / l, w / l); };
  // static colliders (her lap)
  for (const c of opt.colliders) {
    if (c.type === 'capsule') { const d = [c.b[0] - c.a[0], c.b[1] - c.a[1], c.b[2] - c.a[2]], L = Math.hypot(...d);
      const shape = new Jolt.CapsuleShape(L / 2, c.r), bcs = new Jolt.BodyCreationSettings(shape, R3(lerp3(c.a, c.b, 0.5)), quatFromTo(d.map((v) => v / L)), Jolt.EMotionType_Static, LAYER_STATIC);
      bi.CreateAndAddBody(bcs, Jolt.EActivation_DontActivate); Jolt.destroy(bcs); }
    else if (c.type === 'plane') { const shape = new Jolt.BoxShape(new Jolt.Vec3(5, 0.05, 5), 0.0, null);
      const bcs = new Jolt.BodyCreationSettings(shape, R3([0, c.y - 0.05, 0]), Jolt.Quat.prototype.sIdentity(), Jolt.EMotionType_Static, LAYER_STATIC);
      bi.CreateAndAddBody(bcs, Jolt.EActivation_DontActivate); Jolt.destroy(bcs); } }
  // her two hands: kinematic capsules where the fingers close, knuckles across the pinched bundle / along the shoulder seam
  const fist = {};
  for (const h of ['L', 'R']) { const shape = new Jolt.CapsuleShape(opt.fist.half, opt.fist.r);   // r ~ the grip cylinder plus the fingers' thickness
    const bcs = new Jolt.BodyCreationSettings(shape, R3([0, -5, 0]), Jolt.Quat.prototype.sIdentity(), Jolt.EMotionType_Kinematic, LAYER_MOVING);
    fist[h] = bi.CreateAndAddBody(bcs, Jolt.EActivation_Activate); Jolt.destroy(bcs); }
  // the soft body
  const sbs = new Jolt.SoftBodySharedSettings();
  const vtx = new Jolt.SoftBodySharedSettingsVertex();
  for (let i = 0; i < n; i++) { const f = new Jolt.Float3(x[3 * i], x[3 * i + 1], x[3 * i + 2]); vtx.set_mPosition(f); vtx.set_mInvMass(1); sbs.mVertices.push_back(vtx); Jolt.destroy(f); }
  for (const [a, b, c, piece] of pat.tris) { const face = new Jolt.SoftBodySharedSettingsFace(a, b, c, piece === 'hood' ? 1 : 0); sbs.AddFace(face); Jolt.destroy(face); }
  const attr = new Jolt.SoftBodySharedSettingsVertexAttributes();
  attr.mCompliance = opt.stretch; attr.mShearCompliance = opt.shear; attr.mBendCompliance = opt.bend;
  sbs.CreateConstraints(attr, 1, opt.bendType === 'dihedral' ? Jolt.SoftBodySharedSettings_EBendType_Dihedral : Jolt.SoftBodySharedSettings_EBendType_Distance, Math.PI / 180 * 8);
  // stretch rest lengths = the flat pattern (CreateConstraints took them from the pressed geometry)
  const edges = sbs.mEdgeConstraints;
  for (let k = 0; k < edges.size(); k++) { const e = edges.at(k); if (Math.abs(e.mCompliance - opt.bend) < 1e-12) continue;   // bend edges keep the pressed shape
    const a = e.get_mVertex(0), b = e.get_mVertex(1); e.mRestLength = flatLen(pat, a, b); }
  // seams Jolt cannot see from the faces: the hood's bottom row to the neckline; the drawstrings (chains) to the neckline
  const bodyIdx = pat.P.map((p, i) => (p.piece === 'body' ? i : -1)).filter((i) => i >= 0);
  const near2 = (u) => bodyIdx.map((b) => [b, Math.hypot(pat.P[b].u[0] - u[0], pat.P[b].u[1] - u[1])]).sort((p, q) => p[1] - q[1] || p[0] - q[0]).slice(0, 2);
  const addEdge = (a, b, len, comp = 0) => { const e = new Jolt.SoftBodySharedSettingsEdge(a, b, comp); e.mRestLength = len; edges.push_back(e); Jolt.destroy(e); };
  for (const h of pat.hid[0]) for (const [b, d] of near2(pat.P[h].u)) addEdge(h, b, d);
  for (const s of [-1, 1]) { const ids = pat.str[s]; if (!ids.length) continue;
    for (let k = 0; k + 1 < ids.length; k++) addEdge(ids[k], ids[k + 1], flatLen(pat, ids[k], ids[k + 1]));
    for (let k = 0; k + 2 < ids.length; k++) addEdge(ids[k], ids[k + 2], flatLen(pat, ids[k], ids[k + 2]), opt.stringBend);
    for (const [b] of near2(pat.P[ids[0]].u)) addEdge(ids[0], b, Math.hypot(x[3 * b] - x[3 * ids[0]], x[3 * b + 1] - x[3 * ids[0] + 1], x[3 * b + 2] - x[3 * ids[0] + 2])); }
  // the hood is a softer double layer
  for (let k = 0; k < edges.size(); k++) { const e = edges.at(k); if (Math.abs(e.mCompliance - opt.bend) < 1e-12 && pat.P[e.get_mVertex(0)].piece === 'hood') e.mCompliance = opt.hoodBend; }
  // ribbing (hem band, cuffs) keeps its shape: stiffer bends where both ends are rib
  const isRib = (i) => { const p = pat.P[i]; return (p.piece === 'body' && p.u[1] < BODY.rib) || !!p.cuff; };
  for (let k = 0; k < edges.size(); k++) { const e = edges.at(k); if (Math.abs(e.mCompliance - opt.bend) < 1e-12 && isRib(e.get_mVertex(0)) && isRib(e.get_mVertex(1))) e.mCompliance = opt.ribBend; }
  sbs.Optimize();
  const sbc = new Jolt.SoftBodyCreationSettings(sbs, R3([0, 0, 0]), Jolt.Quat.prototype.sIdentity(), LAYER_MOVING);
  sbc.mNumIterations = opt.iterations; sbc.mLinearDamping = opt.damping; sbc.mVertexRadius = opt.vertexRadius; sbc.mUpdatePosition = false; sbc.mAllowSleeping = false;
  sbc.mFriction = 0.8; sbc.mFacesDoubleSided = true;
  const body = bi.CreateSoftBody(sbc); bi.AddBody(body.GetID(), Jolt.EActivation_Activate); Jolt.destroy(sbc);
  const mp = Jolt.castObject(body.GetMotionProperties(), Jolt.SoftBodyMotionProperties);
  const verts = mp.GetVertices();
  const read = () => { for (let i = 0; i < n; i++) { const p = verts.at(i).mPosition; x[3 * i] = p.GetX(); x[3 * i + 1] = p.GetY(); x[3 * i + 2] = p.GetZ(); } };

  // ---- the hands, per step (as sweatshirt_sim.handsAt): which vertices are held and where
  const hold = new Map(), grabbed = {}, grabT = {};
  const centroid = (ks) => { const c = [0, 0, 0]; ks.forEach((k) => { for (let a = 0; a < 3; a++) c[a] += x[3 * k + a] / ks.length; }); return c; };
  function pinCluster(key, ks, target, yawDeg) {
    if (!grabbed[key]) { const c = centroid(ks); grabbed[key] = { off: ks.map((k) => [x[3 * k] - c[0], x[3 * k + 1] - c[1], x[3 * k + 2] - c[2]]), yaw0: yawDeg }; }
    const G = grabbed[key], a = ((yawDeg - G.yaw0) * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    ks.forEach((k, j) => { const o = G.off[j]; hold.set(k, [target[0] + o[0] * ca + o[2] * sa, target[1] + o[1], target[2] - o[0] * sa + o[2] * ca]); });
  }
  const pinchFrom = centroid(cluster.pinch), pinchOff = cluster.pinch.map((k) => [(x[3 * k] - pinchFrom[0]) * 0.7, (x[3 * k + 1] - pinchFrom[1]) * 0.7, (x[3 * k + 2] - pinchFrom[2]) * 0.7]);
  const pinPinch = (target, yawDeg) => { const a = (yawDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    cluster.pinch.forEach((k, j) => { const o = pinchOff[j]; hold.set(k, [target[0] + o[0] * ca + o[2] * sa, target[1] + o[1], target[2] - o[0] * sa + o[2] * ca]); }); };
  const S0L = cluster.shoulderL.map((k) => [x[3 * k], x[3 * k + 1], x[3 * k + 2]]), c0L = S0L.reduce((s, p) => add3(s, p, 1 / S0L.length), [0, 0, 0]);
  const UP = [0, 1, 0]; let fists = {};
  const yawed = (A, deg) => { const a = (deg * Math.PI) / 180, R0 = A.right; return [R0[0] * Math.cos(a) + R0[2] * Math.sin(a), 0, -R0[0] * Math.sin(a) + R0[2] * Math.cos(a)]; };
  function pins(tau, pre) {
    hold.clear(); fists = {};
    if (pre !== undefined) { const f = ease(pre * 1.5), pc = lerp3(pinchFrom, gripPoint(start, 'pinch'), f), lc = lerp3(c0L, startL(start), f);
      pinPinch(pc, 0); S0L.forEach((p, j) => hold.set(cluster.shoulderL[j], add3(lc, [p[0] - c0L[0], p[1] - c0L[1], p[2] - c0L[2]])));
      fists = { R: [pc, start.right], L: [lc, start.right] }; return; }
    const h = handsAt(tau, start, end);
    pinPinch(h.pinch, h.yaw); fists.R = [h.holdL === 'pinch' ? add3(h.pinch, UP, 0.035) : h.pinch, yawed(start, h.yaw)];
    if (h.holdL === 'shoulderL') pinCluster('L:shoulderL', cluster.shoulderL, h.L, 0);
    if (h.holdR === 'shoulderL') { if (!grabT.R) grabT.R = { at: tau, from: centroid(cluster.shoulderL) };
      const G = grabT.R, p = lerp3(G.from, endR(start, end), ease((tau - G.at) / (ACT.settle - G.at))); pinCluster('R:shoulderL', cluster.shoulderL, p, 0); fists.R = [p, end.right]; }
    fists.L = h.holdL === 'pinch' ? [h.holdR === 'pinch' ? add3(h.pinch, UP, -0.035) : h.pinch, yawed(start, h.yaw)] : h.holdL ? [h.L, start.right] : null;
  }
  const kin = new Set(), vtmp = new Jolt.Vec3(0, 0, 0), zero = new Jolt.Vec3(0, 0, 0);
  function apply(dt) {
    for (const k of kin) if (!hold.has(k)) { verts.at(k).mInvMass = 1; kin.delete(k); }
    for (const [k, p] of hold) { const v = verts.at(k); v.mInvMass = 0; kin.add(k); vtmp.Set(p[0], p[1], p[2]); v.mPosition = vtmp; v.mPreviousPosition = vtmp; v.mVelocity = zero; }
    for (const h of ['L', 'R']) { const f = fists[h];
      if (!f) { bi.MoveKinematic(fist[h], R3([0, -5, 0]), Jolt.Quat.prototype.sIdentity(), dt); continue; }
      const ax = f[1], l = Math.hypot(...ax);
      bi.MoveKinematic(fist[h], R3(f[0]), quatFromTo(ax.map((v) => v / l)), dt); }
  }
  // CLOTH SELF-CONTACT. Jolt's soft bodies do not collide with themselves, and a held hoodie is all layers (the pleat,
  // the hood behind the back, sleeves against the body): after each Jolt step, vertices of different layers closer than
  // opt.selfR are pushed apart (equal and opposite, held vertices immovable), the standard position-based contact
  // projection. Pairs close in the flat pattern (the same layer, or across a seam) are skipped.
  const chart = (p) => (p.piece === 'hood' ? 1 : p.piece === 'string' ? 2 + (p.side > 0) : 0);
  const cuv = pat.P.map((p) => (p.piece === 'hood' ? p.h : p.u)), ch = pat.P.map(chart);
  const NECK_ = { a: 0.085 + 0.03, b: 0.07 + 0.03 };
  const nearNeck = pat.P.map((p) => (p.piece === 'hood' && p.j < 3) || (p.piece === 'string' && p.k < 3) || (p.piece === 'body' && (p.u[0] / NECK_.a) ** 2 + ((BODY.h - p.u[1]) / NECK_.b) ** 2 < 1));
  const SR = opt.selfR, SR2 = SR * SR, HS = 16381, head = new Int32Array(HS), next = new Int32Array(n), moved = new Uint8Array(n), x0 = new Float64Array(3 * n);
  const hashOf = (ix, iy, iz) => (((ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791)) >>> 0) % HS;
  const dtc = opt.dt;
  function selfContact() {
    head.fill(-1); moved.fill(0); x0.set(x);
    for (let i = 0; i < n; i++) { const h = hashOf(Math.floor(x[3 * i] / SR), Math.floor(x[3 * i + 1] / SR), Math.floor(x[3 * i + 2] / SR)); next[i] = head[h]; head[h] = i; }
    for (let i = 0; i < n; i++) { const cx = Math.floor(x[3 * i] / SR), cy = Math.floor(x[3 * i + 1] / SR), cz = Math.floor(x[3 * i + 2] / SR), wi = hold.has(i) ? 0 : 1;
      for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) for (let az = -1; az <= 1; az++)
        for (let j = head[hashOf(cx + ax, cy + ay, cz + az)]; j >= 0; j = next[j]) { if (j <= i) continue;
          if (ch[i] === ch[j]) { if (ch[i] !== 0 || (pat.P[i].piece !== 'body' && pat.P[i].piece === pat.P[j].piece)) continue; const du = cuv[i][0] - cuv[j][0], dv = cuv[i][1] - cuv[j][1]; if (du * du + dv * dv < opt.selfSkip * opt.selfSkip) continue; }
          else if (nearNeck[i] && nearNeck[j]) continue;
          const dx = x[3 * j] - x[3 * i], dy = x[3 * j + 1] - x[3 * i + 1], dz = x[3 * j + 2] - x[3 * i + 2], d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= SR2 || d2 < 1e-14) continue; const wj = hold.has(j) ? 0 : 1; if (!(wi + wj)) continue;
          const d = Math.sqrt(d2), c = (SR - d) / d / (wi + wj);
          x[3 * i] -= dx * c * wi; x[3 * i + 1] -= dy * c * wi; x[3 * i + 2] -= dz * c * wi; x[3 * j] += dx * c * wj; x[3 * j + 1] += dy * c * wj; x[3 * j + 2] += dz * c * wj;
          moved[i] |= wi; moved[j] |= wj; } }
    for (let i = 0; i < n; i++) if (moved[i]) { const v = verts.at(i); vtmp.Set(x[3 * i], x[3 * i + 1], x[3 * i + 2]); v.mPosition = vtmp;
      const u = v.mVelocity; vtmp.Set(u.GetX() + (x[3 * i] - x0[3 * i]) / dtc, u.GetY() + (x[3 * i + 1] - x0[3 * i + 1]) / dtc, u.GetZ() + (x[3 * i + 2] - x0[3 * i + 2]) / dtc); v.mVelocity = vtmp; }
  }
  const dt = opt.dt, steps0 = Math.round(opt.preroll / dt), steps1 = Math.round(Math.max(0, Math.min(1, t)) * opt.duration / dt);
  for (let s = 0; s < steps0; s++) { pins(0, s / steps0); apply(dt); jolt.Step(dt, 1); read(); for (let k = 0; k < opt.selfPasses; k++) selfContact(); }
  for (let s = 0; s < steps1; s++) { pins((s + 1) * dt / opt.duration); apply(dt); jolt.Step(dt, 1); read(); for (let k = 0; k < opt.selfPasses; k++) selfContact(); }
  const h = handsAt(t, start, end);
  const hands = { L: fists.L ? fists.L[0] : h.L, R: fists.R ? fists.R[0] : h.R, holdL: h.holdL, holdR: h.holdR, yaw: h.yaw,
    // what each hand closes round: the bundle of the pinched pleat (r 1.8 cm) or the rolled shoulder seam (r 1.2 cm),
    // the cylinder's axis (the capsule the cloth collided with)
    grip: Object.fromEntries(['L', 'R'].map((k) => { const held = k === 'L' ? h.holdL : h.holdR, f = fists[k];
      return [k, f && held ? { at: f[0], axis: f[1], r: held === 'pinch' ? 0.018 : 0.012, what: held } : null]; })) };
  Jolt.destroy(jolt);
  return { pat, x, t, hands, held: [...hold.keys()], cluster, engine: 'jolt-physics 1.1.2 soft body' };
}
void THICK;
