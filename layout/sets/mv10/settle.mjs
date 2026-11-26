// Settle the loose things in the mv10 bowls with Rapier (r4 props phase 2, 2026-11-26 late; Jade: "objects obey physics",
// checked with an existing engine, never hand-placed). Not hand-rolled physics: @dimforge/rapier3d-compat, as holdcheck.
//   node layout/sets/mv10/settle.mjs            -> writes layout/sets/mv10/settled.js (poses in each bowl's own frame)
// Bowls: the downloaded `bowl` model (props/bowl, "Plate" by rbhbkkn.kmrjd, CC BY 4.0) as a static trimesh at each bowl's
// scale. Loose: pomelo-sized lemons = the downloaded `lemon` (Poly Haven, CC0) as a convex hull at scale LEMON_K; squeezed
// rinds = the set's own rind shell (build.js rind(): an emptied half shell, dome down) as a convex hull. Each dropped from
// above in a fixed order with fixed tilts, 4 s of 1/120 s steps, friction 0.8; the final poses are written out.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const RAPIER = require(process.env.RAPIER_DIR || '/home/jade/Documents/layout-deps/node_modules/@dimforge/rapier3d-compat');
await RAPIER.init();
const ROOT = new URL('../../', import.meta.url).pathname;

function glb(path) {
  const f = fs.readFileSync(path); let o = 12; const ch = [];
  while (o < f.length) { const cl = f.readUInt32LE(o); ch.push(f.subarray(o + 8, o + 8 + cl)); o += 8 + cl; }
  const J = JSON.parse(ch[0].toString()), B = ch[1], pos = [], idx = [];
  const acc = (i, T, n) => { const a = J.accessors[i], bv = J.bufferViews[a.bufferView], off = B.byteOffset + (bv.byteOffset || 0) + (a.byteOffset || 0);
    return new T(B.buffer.slice(off, off + a.count * n * T.BYTES_PER_ELEMENT)); };
  for (const m of J.meshes) for (const p of m.primitives) { const P = acc(p.attributes.POSITION, Float32Array, 3), base = pos.length / 3; pos.push(...P);
    if (p.indices != null) { const a = J.accessors[p.indices]; const I = acc(p.indices, a.componentType === 5125 ? Uint32Array : Uint16Array, 1); for (const i of I) idx.push(base + i); }
    else for (let i = 0; i < P.length / 3; i++) idx.push(base + i); }
  return { pos: Float32Array.from(pos), idx: Uint32Array.from(idx) };
}
const BOWL = glb(ROOT + 'assets/props/bowl/bowl.glb'), LEMON = glb(ROOT + 'assets/props/lemon/lemon.glb');
export const LEMON_K = 2.17;   // the 9.5 cm Poly Haven lemon scaled to the set's pomelo-sized lemons (21 cm long, 15 cm across: TREE.lemonR 0.085)
const sub = (P, step) => { const out = []; for (let i = 0; i < P.length / 3; i += step) out.push(P[3 * i], P[3 * i + 1], P[3 * i + 2]); return Float32Array.from(out); };
const scaled = (P, k) => P.map((v) => v * k);
// the rind shell (build.js rind(): sphere R, scale [1, 0.55, 0.82], dome down, open face up at y 0)
function rindHull(R) { const out = []; for (let i = 0; i <= 8; i++) for (let j = 0; j < 16; j++) { const th = (Math.PI / 2) * (i / 8), ph = (2 * Math.PI * j) / 16;
  out.push(R * Math.sin(th) * Math.cos(ph), -R * 0.55 * Math.cos(th), R * 0.82 * Math.sin(th) * Math.sin(ph)); } return Float32Array.from(out); }
const quat = (ax, ay, az) => { const [cx, sx, cy, sy, cz, sz] = [Math.cos(ax / 2), Math.sin(ax / 2), Math.cos(ay / 2), Math.sin(ay / 2), Math.cos(az / 2), Math.sin(az / 2)];
  return { w: cx * cy * cz + sx * sy * sz, x: sx * cy * cz - cx * sy * sz, y: cx * sy * cz + sx * cy * sz, z: cx * cy * sz - sx * sy * cz }; };

function settle(bowlW, items) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 }); world.timestep = 1 / 120;
  const k = bowlW / 0.30;   // props.json bowl size 0.30 wide
  world.createCollider(RAPIER.ColliderDesc.trimesh(scaled(BOWL.pos, k), BOWL.idx).setFriction(0.8), world.createRigidBody(RAPIER.RigidBodyDesc.fixed()));
  world.createCollider(RAPIER.ColliderDesc.cuboid(1, 0.01, 1).setTranslation(0, -0.01, 0), world.createRigidBody(RAPIER.RigidBodyDesc.fixed()));   // the counter
  const bodies = [];
  items.forEach((it, n) => { const b = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...it.drop).setRotation(quat(...it.rot)).setLinearDamping(0.5).setAngularDamping(0.8));
    world.createCollider(RAPIER.ColliderDesc.convexHull(it.hull).setDensity(900).setFriction(0.8).setRestitution(0.05), b); bodies.push(b);
    for (let s = 0; s < 120; s++) world.step(); });   // one at a time, 1 s apart
  for (let s = 0; s < 480; s++) world.step();
  return bodies.map((b, n) => { const t = b.translation(), r = b.rotation(), v = b.linvel();
    return { kind: items[n].kind, at: [t.x, t.y, t.z].map((x) => +x.toFixed(4)), quat: [r.x, r.y, r.z, r.w].map((x) => +x.toFixed(5)), speed: +Math.hypot(v.x, v.y, v.z).toFixed(4) }; });
}
const lemonHull = sub(scaled(LEMON.pos, LEMON_K), 3);
const lemons = (n, h0) => Array.from({ length: n }, (_, i) => ({ kind: 'lemon', hull: lemonHull, drop: [0.05 * Math.cos(i * 2.2), h0 + 0.2 * i, 0.05 * Math.sin(i * 2.2)], rot: [Math.PI / 2 + 0.3 * i, 0.9 * i, 0.2] }));   // the second dropped onto the first: two pomelos side by side do not fit an 18 cm bowl floor (it lodged on the rim)
const RIND_R = 0.085 * 0.75;
const OUT = {
  note: 'settled by layout/sets/mv10/settle.mjs (Rapier): poses in the bowl’s own frame (origin at its bottom centre, y up); lemons = props/lemon at LEMON_K, rinds = build.js rind() shells',
  LEMON_K,
  lemonsBowl: { w: 0.30, items: settle(0.30, lemons(2, 0.2)) },          // PREP.lemonsBowl (r 0.15): two picked lemons (pomelo-sized: three do not fit a 30 cm bowl, the third rolled out)
  friendBowl: { w: 0.36, items: settle(0.36, lemons(2, 0.2)) },          // V3a / V3b: the bowl the friend holds
  rindsBowl: { w: 0.22, rindR: RIND_R, items: settle(0.22, Array.from({ length: 4 }, (_, i) => ({ kind: 'rind', hull: rindHull(RIND_R), drop: [0.03 * Math.cos(i * 2.4), 0.12 + 0.1 * i, 0.03 * Math.sin(i * 2.4)], rot: [0.3 * Math.sin(i), i * 0.9, 0.3 * Math.cos(i * 1.7)] }))) },
};
fs.writeFileSync(new URL('./settled.js', import.meta.url), '// GENERATED by settle.mjs (Rapier); do not edit by hand\nexport const SETTLED = ' + JSON.stringify(OUT, null, 1) + ';\n');
for (const [k, v] of Object.entries(OUT)) if (v.items) console.log(k, v.items.map((i) => `${i.kind} y ${i.at[1]} r ${Math.hypot(i.at[0], i.at[2]).toFixed(3)} v ${i.speed}`).join(' | '));
