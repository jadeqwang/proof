// Hold check with Rapier (2026-11-26, opt-in data from --gaze sidecars). Not a hand-rolled physics: @dimforge/rapier3d-compat.
//   node layout/engine/holdcheck.mjs <sidecar.json | dir> [...]     -> table on stdout; --json writes <SHOT>.holdcheck.json beside each
// Needs sidecars rendered with --gaze (key `holds`: each held object as world hull points + the capsules of every hand on
// it, from engine/main.js holdsFor / engine/hand.js capsules). Rapier lives outside the repo: RAPIER_DIR, default
// /home/jade/Documents/layout-deps/node_modules/@dimforge/rapier3d-compat (npm install @dimforge/rapier3d-compat there).
// Per object: hands = fixed capsule colliders (phalanges, thumb, palm strips), the object = a dynamic convex hull
// (density 300 kg/m3, friction 0.9), gravity 9.81, 60 steps of 1/60 s. Flags:
//   adjacent     no hand collider within 2 mm of the object at t = 0 (the hand is beside the object, not on it)
//   penetrates   a finger phalanx sinks more than 3 mm into the object at t = 0 (palm / thenar: 10 mm, soft tissue)
//   falls        the object's centre moves more than 1 cm in 1 s with only the hands to hold it (a table or cart
//                under it is NOT modelled: an object resting on furniture also 'falls')
// API for a mesh adapter: checkHold({ hull: [[x,y,z]...], capsules: [{ a, b, r }...] }) -> { contact_mm, penetration_mm, drop_cm, pass, flags }
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const RAPIER = require(process.env.RAPIER_DIR || '/home/jade/Documents/layout-deps/node_modules/@dimforge/rapier3d-compat');
await RAPIER.init();
const HARD_MM = 3, SOFT_MM = 10;   // finger phalanges / soft palm and thenar

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], len = (v) => Math.hypot(...v);
function capsuleBody(world, c) {
  const d = sub(c.b, c.a), L = len(d), mid = [(c.a[0] + c.b[0]) / 2, (c.a[1] + c.b[1]) / 2, (c.a[2] + c.b[2]) / 2];
  // rotation taking +y to d
  const y = [0, 1, 0], u = L > 1e-9 ? d.map((x) => x / L) : y; const ax = [y[1] * u[2] - y[2] * u[1], y[2] * u[0] - y[0] * u[2], y[0] * u[1] - y[1] * u[0]];
  const s = len(ax), cth = u[1]; let q = { x: 0, y: 0, z: 0, w: 1 };
  if (s > 1e-9) { const ang = Math.atan2(s, cth), k = Math.sin(ang / 2) / s; q = { x: ax[0] * k, y: ax[1] * k, z: ax[2] * k, w: Math.cos(ang / 2) }; } else if (cth < 0) q = { x: 1, y: 0, z: 0, w: 0 };
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(...mid).setRotation(q));
  return world.createCollider(RAPIER.ColliderDesc.capsule(Math.max(1e-4, L / 2), c.r).setFriction(0.9), body);
}
export function checkHold({ hull, capsules }) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  const c0 = hull.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((x) => x / hull.length);
  const local = new Float32Array(hull.flatMap((p) => sub(p, c0)));
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...c0).setCcdEnabled(true));
  const desc = RAPIER.ColliderDesc.convexHull(local); if (!desc) return { pass: false, flags: ['bad hull'] };
  const obj = world.createCollider(desc.setDensity(300).setFriction(0.9), body);
  const hands = capsules.map((c) => capsuleBody(world, c));
  // contact / penetration at t = 0 (closest distance between shapes; negative = penetration). Soft parts (palm strips,
  // the thumb's thenar) may sink SOFT_MM before it counts; finger phalanges HARD_MM.
  let minD = Infinity, worst = null, pen = false;
  hands.forEach((h, i) => { const r = obj.contactCollider(h, 0.05); if (!r) return; const part = capsules[i].part || '', soft = /^palm|^thumb0/.test(part);
    if (r.distance < minD) { minD = r.distance; worst = part; } if (r.distance < -(soft ? SOFT_MM : HARD_MM) / 1000) pen = true; });
  world.timestep = 1 / 60; for (let i = 0; i < 60; i++) world.step();
  const p = body.translation(), drop = len(sub([p.x, p.y, p.z], c0));
  const flags = []; if (!(minD <= 0.002)) flags.push('adjacent'); if (pen) flags.push('penetrates'); if (drop > 0.01) flags.push('falls (hands alone)');
  world.free();
  return { contact_mm: minD === Infinity ? null : +(minD * 1000).toFixed(1), penetration_mm: minD < 0 ? +(-minD * 1000).toFixed(1) : 0, deepest_part: worst, drop_cm: +(drop * 100).toFixed(1), pass: !flags.length, flags };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2), asJson = args.includes('--json'); const files = [];
  for (const a of args.filter((x) => !x.startsWith('--'))) { if (fs.statSync(a).isDirectory()) { for (const f of fs.readdirSync(a)) if (/\.json$/.test(f) && !/holdcheck/.test(f)) files.push(path.join(a, f)); } else files.push(a); }
  console.log('| set | shot | object | hands | contact mm | penetration mm (part) | drop cm (1 s) | result |\n|---|---|---|---|---|---|---|---|');
  for (const f of files.sort()) { let sc; try { sc = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; } if (!sc.holds?.length) continue;
    const res = [];
    for (const h of sc.holds) { const who = h.hands.filter((x) => !x.touching_only).map((x) => `${x.who}.${x.arm} ${x.shape}`).join(' + ') + (h.hands.some((x) => x.touching_only) ? ' (+ touching)' : '');
      if (!h.hull) { res.push({ object: null, who, pass: false, flags: ['no object at the hand'] }); console.log(`| ${sc.set} | ${sc.shot} | (none within 3 cm) | ${who} | | | | FAIL: no object at the hand |`); continue; }
      const r = checkHold({ hull: h.hull, capsules: h.hands.flatMap((x) => x.capsules) }); res.push({ object: h.object, who, ...r });
      console.log(`| ${sc.set} | ${sc.shot} | ${h.object} | ${who} | ${r.contact_mm} | ${r.penetration_mm}${r.penetration_mm ? ' (' + r.deepest_part + ')' : ''} | ${r.drop_cm} | ${r.pass ? 'pass' : 'FAIL: ' + r.flags.join(', ')} |`); }
    if (asJson) fs.writeFileSync(f.replace(/\.json$/, '.holdcheck.json'), JSON.stringify(res, null, 1));
  }
}
