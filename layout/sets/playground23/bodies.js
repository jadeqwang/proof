// playground23 bodies: a SET-LOCAL BRIDGE (2026-11-26, r4). The girl (4, 1.09 m), the boy (7, 1.32 m, head ~20% larger)
// and Dad in 2023 (about 67) have no bodies in layout/assets/bodies/ yet, and that folder and the engine's BODY_OF table
// belong to other agents. Their GLBs are built by this set's own copy of make_bodies.py (./bodies/, see its README)
// and swapped into HUMAN.bodies for THIS PAGE ONLY (each render page loads one set):
//   'girl' -> the engine's fallback body id 'adult_f'   (humanMesh.js bodyFor: an unknown, non-male key)
//   'boy'  -> 'adult_m'                                (bodyFor: /boy/ is in its MALE pattern)
//   'dad'  -> 'dad'                                    (the 37-year-old body replaced by the 2023 one, in this page)
// No other figure in this set uses adult_f / adult_m. When the cast agent adds girl4 / boy7 / dad23 to
// layout/assets/bodies and the engine maps the keys, delete this file and the injectBodies() call.
// If the set-local GLBs are missing, the nearest existing bodies stand in (flagged in the sidecar): the girl ->
// 'daughter' (4), the boy -> 'jade07' (7), Dad -> the 37-year-old 'dad'.
import { HUMAN } from '../../engine/humanMesh.js';

const BASE = '/sets/playground23/bodies/';
function parseGLB(buf) {   // same reader as engine/humanMesh.js (not exported there)
  const dv = new DataView(buf), jl = dv.getUint32(12, true);
  const J = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
  const binOff = 20 + jl + 8;
  const CT = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array };
  const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const acc = (i) => { const a = J.accessors[i], bv = J.bufferViews[a.bufferView], T = CT[a.componentType], n = NC[a.type];
    const off = binOff + (bv.byteOffset || 0) + (a.byteOffset || 0), es = T.BYTES_PER_ELEMENT * n;
    if (bv.byteStride && bv.byteStride !== es) { const out = new T(a.count * n), src = new DataView(buf); const rd = { 5126: 'getFloat32', 5125: 'getUint32', 5123: 'getUint16', 5121: 'getUint8' }[a.componentType];
      for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) out[k * n + c] = src[rd](off + k * bv.byteStride + c * T.BYTES_PER_ELEMENT, true); return out; }
    return new T(buf.slice(off, off + a.count * es)); };
  const skin = J.skins[0], jointNames = skin.joints.map((k) => J.nodes[k].name);
  const meshes = {};
  for (const nd of J.nodes) { if (nd.mesh == null) continue; const pr = J.meshes[nd.mesh].primitives[0], at = pr.attributes;
    meshes[nd.name.split('.')[0]] = { pos: acc(at.POSITION), nrm: acc(at.NORMAL), jnt: acc(at.JOINTS_0), wgt: acc(at.WEIGHTS_0), idx: acc(pr.indices) }; }
  return { jointNames, meshes };
}
const LOCAL = await (async () => {
  if (!HUMAN.on) return {};
  try { const r = await fetch(BASE + 'meta.json'); if (!r.ok) return {}; const meta = await r.json(); const out = {};
    await Promise.all(['girl4', 'boy7', 'dad23'].filter((id) => meta[id]).map(async (id) => { const g = await fetch(BASE + id + '.glb'); if (g.ok) out[id] = { ...parseGLB(await g.arrayBuffer()), meta: meta[id] }; }));
    return out; } catch { return {}; }
})();
export const BODIES_NOTE = {};
let done = false;
export function injectBodies() {
  if (done || !HUMAN.on || !HUMAN.bodies) return; done = true; const B = HUMAN.bodies;
  const put = (slot, id, fallback, who) => { if (LOCAL[id]) { B[slot] = LOCAL[id]; BODIES_NOTE[who] = `${id} (set-local, playground23/bodies)`; }
    else if (fallback && B[fallback]) { B[slot] = B[fallback]; BODIES_NOTE[who] = `STAND-IN: ${fallback} (set-local ${id} missing)`; } };
  put('adult_f', 'girl4', 'daughter', 'girl'); put('adult_m', 'boy7', 'jade07', 'boy'); put('dad', 'dad23', null, 'dad');
  if (!BODIES_NOTE.dad) BODIES_NOTE.dad = 'STAND-IN: dad (37) body, 2023 costume only';
}
