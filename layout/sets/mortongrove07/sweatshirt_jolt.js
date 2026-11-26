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
  bendType: 'distance', bend: 2e-4, ribBend: 2e-5, hoodBend: 6e-4, stringBend: 2e-4, vertexRadius: 0.004, fist: { r: 0.022, half: 0.03 }, pinchRows: [0, 0.03, 0.06, 0.09],
  // contact pass: hand 'posed' = her posed hand's capsules (HAND), each grown by THICK/2 (the rendered fleece is a slab round the
  // simulated sheet) + handPad - vertexRadius; 'fist' = the old solid capsule. pinchK = the pinch's gather [across, up]
  // (offsets from its centre scaled: 0.7 across, the 9 cm of pleat gathered up into the fist), fistLift = the fist's
  // centre above the gathered pinch's (the bundle sits in the fist and hangs out of its open side, below).
  hand: 'fist', leftFist: false, handPad: 0.002, approach: { from: 0.10, dur: 0.6, back: 35 }, fistZone: 0, pinchK: [0.7, 0.7], fistLift: 0, selfR: 0.0115, selfSkip: 0.022, selfPasses: 1, colliders: [] };

// HER POSED HAND in the sim (contact pass 2026-11-26, Jade: "make sure hands don't clip through the fabric"). The figure's
// hand on the cloth is engine/grasp.js 'power' round a cylinder r 18 mm (build.js: Math.max(grip r, 18 mm)), palm square
// to the grip axis, toward the cloth from her chest. Posed, it is the same rigid shape on every grip (the four hands of
// MG2 / MG2_end agree to 0.2 mm), so the sim collides the cloth with THAT hand instead of a solid fist: the capsules of
// engine/hand.js (phalanges, palm strips, thumb; jade27, as the sidecars' `holds` give them), in mm in the grip frame
// t = along the axis toward the thumb, n = palm direction ((grip - chest) square to the axis), q = toward the wrist (down).
// Fingers cross the top of the bundle and come down its far side; the cloth leaves the fist below, between the
// fingertips and the palm (and past the index and little fingers). Regenerate from a sidecar with
// cloth_contact.mjs --dump if the hand or the grip radius changes. Measured by cloth_contact.mjs.
export const HAND = [['index1', 28.9, -30, -22.4, 28.9, 6.6, -27.2, 9.8], ['index2', 28.9, 6.6, -27.2, 28.9, 24.8, -12.3, 8.9], ['index3', 28.9, 24.8, -12.3, 28.9, 27, 5.7, 7.9],
  ['palm:index', 23.1, -30, 67.3, 28.9, -30, -22.4, 10.1], ['middle1', 9.3, -30, -25.3, 9.3, 10, -26.9, 10.2], ['middle2', 9.3, 10, -26.9, 9.3, 27.2, -8, 9.2],
  ['middle3', 9.3, 27.2, -8, 9.3, 26, 11.5, 8.1], ['palm:middle', 7.4, -30, 67.3, 9.3, -30, -25.3, 10.1], ['ring1', -9.4, -30, -22.4, -9.5, 7.5, -27, 9.4],
  ['ring2', -9.5, 7.5, -27, -9.2, 25.2, -10.6, 8.5], ['ring3', -9.2, 25.2, -10.6, -8.8, 26.2, 7.9, 7.7], ['palm:ring', -7.5, -29.9, 67.3, -9.4, -30, -22.4, 10.1],
  ['little1', -26.6, -30, -15.3, -27.3, -1.7, -26.3, 8.3], ['little2', -27.3, -1.7, -26.3, -26.9, 16.5, -19.7, 7.5], ['little3', -26.9, 16.5, -19.7, -26, 24.3, -7.2, 6.8],
  ['palm:little', -21.3, -30, 67.3, -26.6, -30, -15.3, 10.1], ['thumb0', 23.3, -24.4, 55.1, 46.1, 7.6, 29.8, 15], ['thumb1', 46.1, 7.6, 29.8, 62.8, 24.7, 15.1, 11.6],
  ['thumb2', 62.8, 24.7, 15.1, 45.9, 36.3, 12.8, 10.1]];
// world capsules of the posed hand `side` ('L' | 'R') closed round a grip at `at`, axis `axis`, for a figure whose chest is `chest`
export function handCapsules(side, at, axis, chest) {
  const l = Math.hypot(...axis), ax = axis.map((v) => v / l), d = [at[0] - chest[0], at[1] - chest[1], at[2] - chest[2]], k = d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2];
  let n = [d[0] - ax[0] * k, d[1] - ax[1] * k, d[2] - ax[2] * k]; const ln = Math.hypot(...n); n = n.map((v) => v / ln);
  const w = [ax[1] * n[2] - ax[2] * n[1], ax[2] * n[0] - ax[0] * n[2], ax[0] * n[1] - ax[1] * n[0]], sw = w[1] < 0 ? 1 : -1, st = side === 'R' ? sw : -sw;
  const P = (a, b, c) => [0, 1, 2].map((i) => at[i] + (ax[i] * st * a + n[i] * b + w[i] * sw * c) / 1000);
  return HAND.map(([part, a0, a1, a2, b0, b1, b2, r]) => ({ part, a: P(a0, a1, a2), b: P(b0, b1, b2), r: r / 1000 }));
}

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
  const pinchIds = [];
  if (opt.pinchBlock) { // the fistful as a block: every body vertex of the pressed pleat's stack (pressed x within [x0, x1]) from y0 up to the neckline
    const B = opt.pinchBlock; pat.P.forEach((p, i) => { if (p.piece === 'body' && p.u[1] >= PINCH_Y - B.down - 1e-6 && X0[3 * i] >= B.x[0] && X0[3 * i] <= B.x[1]) pinchIds.push(i); });
    // and the hood's first rows sewn to that stretch of neckline (they go down inside the fist behind the fistful)
    if (B.hood) pat.P.forEach((p, i) => { if (p.piece === 'hood' && p.j < B.hood && X0[3 * i] >= B.x[0] && X0[3 * i] <= B.x[1]) pinchIds.push(i); }); }
  else for (const yy of opt.pinchRows.map((d) => PINCH_Y - d)) for (const xx of [PLEAT.m1 + 0.004, PLEAT.m2, PLEAT.m3 - 0.004]) pinchIds.push(nearestBody(pat, xx, yy));
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
  // the bindings return a BodyID by value in ONE reused wrapper: copy it, or every stored id is the last body created
  // (contact pass 2026-11-26: before this, fist.L and fist.R were both the right fist; the left had no collider)
  const keepID = (id) => new Jolt.BodyID(id.GetIndexAndSequenceNumber());
  const fist = {}, handB = { L: [], R: [] }, chest = opt.chest || opt.colliders.find((c) => c.type === 'chest')?.at, posed = opt.hand === 'posed' && !!chest;
  if (posed) for (const h of ['L', 'R']) for (const [, a0, a1, a2, b0, b1, b2, r] of HAND) {
    const half = Math.hypot(b0 - a0, b1 - a1, b2 - a2) / 2000, shape = new Jolt.CapsuleShape(Math.max(half, 1e-4), r / 1000 + THICK / 2 + opt.handPad - opt.vertexRadius);
    const bcs = new Jolt.BodyCreationSettings(shape, R3([0, -5, 0]), Jolt.Quat.prototype.sIdentity(), Jolt.EMotionType_Kinematic, LAYER_MOVING);
    handB[h].push(keepID(bi.CreateAndAddBody(bcs, Jolt.EActivation_Activate))); Jolt.destroy(bcs); }
  for (const h of ['L', 'R']) { const shape = new Jolt.CapsuleShape(opt.fist.half, opt.fist.r);   // r ~ the grip cylinder plus the fingers' thickness
    const bcs = new Jolt.BodyCreationSettings(shape, R3([0, -5, 0]), Jolt.Quat.prototype.sIdentity(), Jolt.EMotionType_Kinematic, LAYER_MOVING);
    fist[h] = keepID(bi.CreateAndAddBody(bcs, Jolt.EActivation_Activate)); Jolt.destroy(bcs); }
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
  const pinchFrom = centroid(cluster.pinch), [kA, kU, kO = kA] = opt.pinchK;   // gather: across (start.right), up, out (start.out)
  const pinchOff = kA === kU && kU === kO ? cluster.pinch.map((k) => [(x[3 * k] - pinchFrom[0]) * kA, (x[3 * k + 1] - pinchFrom[1]) * kA, (x[3 * k + 2] - pinchFrom[2]) * kA]) : cluster.pinch.map((k) => { const o = [x[3 * k] - pinchFrom[0], x[3 * k + 1] - pinchFrom[1], x[3 * k + 2] - pinchFrom[2]], d3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return add3(add3([0, 0, 0], start.right, d3(o, start.right) * kA), add3(start.up.map((v) => v * d3(o, start.up) * kU), start.out, d3(o, start.out) * kO)); });
  if (opt.pinchBlock?.q) { // the fistful laid into the fist: each column of the block from its top (the neckline) down to y0 spread
    // over q = [top, bottom] (m below the fist's centre: under the fingers, out of the open side); across kA, out kO
    const B = opt.pinchBlock, y0 = PINCH_Y - B.down, top = new Map(), ids = cluster.pinch;
    ids.forEach((k) => { if (pat.P[k].piece !== 'body') return; const u = pat.P[k].u; top.set(u[0], Math.max(top.get(u[0]) ?? -1, u[1])); });
    const xs = ids.map((k) => X0[3 * k]), zs = ids.map((k) => X0[3 * k + 2]), xc = B.xc ?? (Math.min(...xs) + Math.max(...xs)) / 2, zc = zs.reduce((a, b) => a + b, 0) / zs.length;
    // past the index finger (t > B.rope) the fistful runs on out of the fist as a thinner roll over the thumb's web
    ids.forEach((k, j) => { const P = pat.P[k], hood = P.piece === 'hood', u = P.u, yt = top.get(u[0]), f = hood ? (P.j + 1) / (B.hood + 1) * 0.7 : yt > y0 ? (yt - u[1]) / (yt - y0) : 0;
      const tt = (X0[3 * k] - xc) * kA, q = B.q[0] + f * (B.q[1] - B.q[0]) * (B.rope && tt > B.rope ? B.ropeK : 1);
      pinchOff[j] = add3(add3(start.right.map((v) => v * (X0[3 * k] - xc) * kA), start.up, opt.fistLift - q), start.out, hood ? B.hoodOut : (X0[3 * k + 2] - zc) * kO); }); }
  const pinchRaw = cluster.pinch.map((k) => [x[3 * k] - pinchFrom[0], x[3 * k + 1] - pinchFrom[1], x[3 * k + 2] - pinchFrom[2]]);
  const pinPinch = (target, yawDeg, f = 1) => { const a = (yawDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);   // f: 0 = as pressed, 1 = gathered
    cluster.pinch.forEach((k, j) => { const o = lerp3(pinchRaw[j], pinchOff[j], f); hold.set(k, [target[0] + o[0] * ca + o[2] * sa, target[1] + o[1], target[2] - o[0] * sa + o[2] * ca]); }); };
  const S0L = cluster.shoulderL.map((k) => [x[3 * k], x[3 * k + 1], x[3 * k + 2]]), c0L = S0L.reduce((s, p) => add3(s, p, 1 / S0L.length), [0, 0, 0]);
  const UP = [0, 1, 0]; let fists = {};
  const yawed = (A, deg) => { const a = (deg * Math.PI) / 180, R0 = A.right; return [R0[0] * Math.cos(a) + R0[2] * Math.sin(a), 0, -R0[0] * Math.sin(a) + R0[2] * Math.cos(a)]; };
  function pins(tau, pre) {
    hold.clear(); fists = {};
    if (pre !== undefined) { const f = ease(pre * 1.5), pc = lerp3(pinchFrom, gripPoint(start, 'pinch'), f), lc = lerp3(c0L, startL(start), f);
      pinPinch(pc, 0, opt.hand === 'posed' ? f : 1); S0L.forEach((p, j) => hold.set(cluster.shoulderL[j], add3(lc, [p[0] - c0L[0], p[1] - c0L[1], p[2] - c0L[2]])));
      fists = { R: [add3(pc, UP, opt.fistLift), start.right, 'pinch'], L: [lc, start.right, 'shoulderL'] }; return; }
    const h = handsAt(tau, start, end);
    pinPinch(h.pinch, h.yaw); fists.R = [add3(h.pinch, UP, h.holdL === 'pinch' ? 0.035 : opt.fistLift), yawed(start, h.yaw), 'pinch'];
    if (h.holdL === 'shoulderL') pinCluster('L:shoulderL', cluster.shoulderL, h.L, 0);
    if (h.holdR === 'shoulderL') { if (!grabT.R) grabT.R = { at: tau, from: centroid(cluster.shoulderL) };
      const G = grabT.R, p = lerp3(G.from, endR(start, end), ease((tau - G.at) / (ACT.settle - G.at))); pinCluster('R:shoulderL', cluster.shoulderL, p, 0); fists.R = [p, end.right, 'shoulderL']; }
    fists.L = h.holdL === 'pinch' ? [add3(h.pinch, UP, h.holdR === 'pinch' ? -0.035 : opt.fistLift), yawed(start, h.yaw), h.holdR === 'pinch' ? 'pinch+' : 'pinch'] : h.holdL ? [h.L, start.right, 'shoulderL'] : null;
  }
  const kin = new Set(), vtmp = new Jolt.Vec3(0, 0, 0), zero = new Jolt.Vec3(0, 0, 0);
  // posed hands arrive from above (opt.approach: `from` m higher, settling over `dur` s) each time they take hold, so the
  // fabric starts under the fingers and thumb rather than threaded through them; the left hand under the right on the
  // shared pinch (t 0.50-0.56) has no colliders (two fists cannot both close round one 18 mm bundle).
  let clock = 0; const since = {}, holding = {};
  function apply(dt) {
    clock += dt;
    for (const k of kin) if (!hold.has(k)) { verts.at(k).mInvMass = 1; kin.delete(k); }
    for (const [k, p] of hold) { const v = verts.at(k); v.mInvMass = 0; kin.add(k); vtmp.Set(p[0], p[1], p[2]); v.mPosition = vtmp; v.mPreviousPosition = vtmp; v.mVelocity = zero; }
    for (const h of ['L', 'R']) { const f = fists[h];
      const key = f ? f[2] : null, posedNow = posed && (!opt.posedFor || opt.posedFor.includes(String(key).replace(/\+$/, '')));
      if (posed && !posedNow) handB[h].forEach((b, i) => bi.MoveKinematic(b, R3([0, -5 - 0.2 * i, 0]), Jolt.Quat.prototype.sIdentity(), dt));
      if (posedNow) { if (key !== holding[h]) { holding[h] = key; since[h] = clock; }
        // each capsule arrives from `back` degrees off straight above, toward her (the thumb from `thumbBack`): the
        // fingers come down over the fistful, the palm and the thumb from her side, so the hanging fabric ends up in
        // front of the thumb that closes under the fist (engine/hand.js wraps it round the far side of the grip)
        const A = opt.approach, off = A && f ? A.from * (1 - ease((clock - since[h]) / A.dur)) : 0, offT = A && f ? A.from * (1 - ease((clock - since[h] - (A.thumbDelay || 0)) / A.dur)) : 0;
        let caps = f && !/\+$/.test(key) ? handCapsules(h, f[0], f[1], chest) : null;
        if (caps && (off > 0 || offT > 0)) { const l = Math.hypot(...f[1]), ax = f[1].map((v) => v / l), d = [f[0][0] - chest[0], 0, f[0][2] - chest[2]], k = d[0] * ax[0] + d[2] * ax[2];
          const n0 = [d[0] - ax[0] * k, 0, d[2] - ax[2] * k], ln = Math.hypot(...n0) || 1, n = n0.map((v) => v / ln);
          const dir = (deg) => { const b = deg * Math.PI / 180; return add3(UP.map((v) => v * Math.cos(b)), n, -Math.sin(b)); };
          const oH = dir(A.back || 0), oT = dir(A.thumbBack ?? A.back ?? 0);
          caps = caps.map((c) => { const th = /^thumb/.test(c.part), o = th ? oT : oH, k = th ? offT : off; return { ...c, a: add3(c.a, o, k), b: add3(c.b, o, k) }; }); }
        handB[h].forEach((b, i) => { if (!caps) { bi.MoveKinematic(b, R3([0, -5 - 0.2 * i, 0]), Jolt.Quat.prototype.sIdentity(), dt); return; }
          const c = caps[i], d = [c.b[0] - c.a[0], c.b[1] - c.a[1], c.b[2] - c.a[2]], L = Math.hypot(...d) || 1;
          bi.MoveKinematic(b, R3(lerp3(c.a, c.b, 0.5)), quatFromTo(d.map((v) => v / L)), dt); });
        bi.MoveKinematic(fist[h], R3([0, -5, 0]), Jolt.Quat.prototype.sIdentity(), dt); continue; }
      // leftFist false = the drape as published (until 2026-11-26 the BodyID bug left the left hand without a collider;
      // giving it one changes the drape (Truth px at t 0.3 cam 6 -> 11): kept off until the drape is re-tuned)
      if (!f || (h === 'L' && !opt.leftFist)) { bi.MoveKinematic(fist[h], R3([0, -5, 0]), Jolt.Quat.prototype.sIdentity(), dt); continue; }
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
  let inFist = null;
  function selfContact() {
    inFist = null; if (posed && opt.fistZone) { const cs = ['L', 'R'].map((h) => fists[h]).filter((f) => f && !/\+$/.test(f[2])).map((f) => f[0]), Z2 = opt.fistZone ** 2;
      if (cs.length) inFist = (i) => cs.some((c) => (x[3 * i] - c[0]) ** 2 + (x[3 * i + 1] - c[1]) ** 2 + (x[3 * i + 2] - c[2]) ** 2 < Z2); }
    head.fill(-1); moved.fill(0); x0.set(x);
    for (let i = 0; i < n; i++) { const h = hashOf(Math.floor(x[3 * i] / SR), Math.floor(x[3 * i + 1] / SR), Math.floor(x[3 * i + 2] / SR)); next[i] = head[h]; head[h] = i; }
    for (let i = 0; i < n; i++) { const cx = Math.floor(x[3 * i] / SR), cy = Math.floor(x[3 * i + 1] / SR), cz = Math.floor(x[3 * i + 2] / SR), wi = hold.has(i) ? 0 : 1;
      for (let ax = -1; ax <= 1; ax++) for (let ay = -1; ay <= 1; ay++) for (let az = -1; az <= 1; az++)
        for (let j = head[hashOf(cx + ax, cy + ay, cz + az)]; j >= 0; j = next[j]) { if (j <= i) continue;
          if (ch[i] === ch[j]) { if (ch[i] !== 0 || (pat.P[i].piece !== 'body' && pat.P[i].piece === pat.P[j].piece)) continue; const du = cuv[i][0] - cuv[j][0], dv = cuv[i][1] - cuv[j][1]; if (du * du + dv * dv < opt.selfSkip * opt.selfSkip) continue; }
          else if (nearNeck[i] && nearNeck[j]) continue;
          const dx = x[3 * j] - x[3 * i], dy = x[3 * j + 1] - x[3 * i + 1], dz = x[3 * j + 2] - x[3 * i + 2], d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= SR2 || d2 < 1e-14) continue; const wj = hold.has(j) ? 0 : 1; if (!(wi + wj)) continue;
          if (inFist && wi !== wj && inFist(wi ? i : j)) continue;   // fabric round a gathered fistful lies against it (else pushed into the fingers)
          const d = Math.sqrt(d2), c = (SR - d) / d / (wi + wj);
          x[3 * i] -= dx * c * wi; x[3 * i + 1] -= dy * c * wi; x[3 * i + 2] -= dz * c * wi; x[3 * j] += dx * c * wj; x[3 * j + 1] += dy * c * wj; x[3 * j + 2] += dz * c * wj;
          moved[i] |= wi; moved[j] |= wj; } }
    for (let i = 0; i < n; i++) if (moved[i]) { const v = verts.at(i); vtmp.Set(x[3 * i], x[3 * i + 1], x[3 * i + 2]); v.mPosition = vtmp;
      const u = v.mVelocity; vtmp.Set(u.GetX() + (x[3 * i] - x0[3 * i]) / dtc, u.GetY() + (x[3 * i + 1] - x0[3 * i + 1]) / dtc, u.GetZ() + (x[3 * i + 2] - x0[3 * i + 2]) / dtc); v.mVelocity = vtmp; }
  }
  const dt = opt.dt, steps0 = Math.round(opt.preroll / dt), steps1 = Math.round(Math.max(0, Math.min(1, t)) * opt.duration / dt);
  // selfFirst: the layer contact projection BEFORE each Jolt step, so Jolt's contacts with her hands have the last word
  // (after it, the projection pushed fabric lying against the fist into the fingers)
  const self = () => { for (let k = 0; k < opt.selfPasses; k++) selfContact(); };
  const step = (tau, pre) => { pins(tau, pre); if (opt.selfFirst) { read(); self(); } apply(dt); jolt.Step(dt, 1); read(); if (!opt.selfFirst) self(); };
  for (let s = 0; s < steps0; s++) step(0, s / steps0);
  for (let s = 0; s < steps1; s++) step((s + 1) * dt / opt.duration);
  const h = handsAt(t, start, end);
  const hands = { L: fists.L ? fists.L[0] : h.L, R: fists.R ? fists.R[0] : h.R, holdL: h.holdL, holdR: h.holdR, yaw: h.yaw,
    // what each hand closes round: the bundle of the pinched pleat (r 1.8 cm) or the rolled shoulder seam (r 1.2 cm),
    // the cylinder's axis (the capsule the cloth collided with)
    grip: Object.fromEntries(['L', 'R'].map((k) => { const held = k === 'L' ? h.holdL : h.holdR, f = fists[k];
      return [k, f && held ? { at: f[0], axis: f[1], r: held === 'pinch' ? 0.018 : 0.012, what: held } : null]; })) };
  if (opt.onEnd) opt.onEnd({ Jolt, bi, handB, fist, chest, fists });   // debugging hook (no effect on the result)
  Jolt.destroy(jolt);
  return { pat, x, t, hands, held: [...hold.keys()], cluster, engine: 'jolt-physics 1.1.2 soft body' };
}
void THICK;
