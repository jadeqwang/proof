// Downloaded household props (2026-11-26, Jade: "the ladle is weirdly shaped as an object. for common household objects,
// are there libraries you can just download them from instead of building them from scratch?"). ONE shared loader for
// every set. The models live in layout/assets/props/<name>/<name>.glb (metres, y up, origin at the bottom centre unless
// props.json says otherwise), each with SOURCE.txt (where from, author, licence). Index: layout/assets/props/props.json.
// Sources and licences: work/props_audit.md and docs/credits_tools.md.
//
//   await loadProps(['ladle', 'lemon'])      top level of a set module (like loadArt); a missing model -> warning, prop() then
//                                            returns null so the caller can fall back to its hand-built shape
//   prop(name, { at, rot, scale, size, label, look, tex, edges, parts })  -> THREE.Group (or null)
//       at     [x, y, z] where the model's origin goes (props.json `origin`: usually the bottom centre)
//       rot    [rx, ry, rz] degrees (XYZ), or a THREE.Quaternion
//       scale  number or [sx, sy, sz] on top of the real-world size; size: { h | w | d | l: metres } fits one dimension
//       label  label-mode name (default props.json label); every mesh of the prop carries it (holdsFor: one object)
//       look   a look (engine/core.js) for EVERY mesh, replacing the model's own colours / textures (e.g. GLASSY)
//       tex    false: drop the model's textures, keep its material colours
//       edges  true: also draw the texture's edges in line / contour (default off: wood grain and labels stay out of line)
//       parts  true: each material is its own line-mode id (default: one id per prop, so line draws silhouette + creases)
//       lookMat { <glTF material name>: look fields }  per-material overrides (kettle body red); lookPart: same by mesh name
//       recolor hex: the texture's greys times this colour (a red typewriter made beige, keeping its keys and lettering)
//   props.json `defaults` (per prop) are applied first: e.g. the ladle's steel look (its own PBR metal reads black here);
//       pass look: false to get the model's own colours back
//   grip(group, name = first)  -> { centre, axis, up, r, size, label } in WORLD, for engine/grasp.js graspArms(template, obj)
//   PROPS                       the index (props.json): per prop size_m, origin, grips { name: { at, axis, up, r, size } } (model
//                               frame, metres), template (the GRASPS entry that fits), label, source
//
// How the model shows in each guide mode (engine/render.js, the look.art path that sets/_art.js uses for wall art):
//   lit    the model's base-colour texture (or its material colour)
//   flat / label   the texture's greys (or the colour's luminance as look.grey)
//   form   the form shading modulated by the texture's greys
//   line / contour  geometry edges only (edges: true adds the texture's edge map)
// Held objects (engine/main.js holdsFor): every mesh of a prop carries the same label; the nearest MESH to the hand is the
// hulled object, so props meant to be held were split in Blender into a grip part (handle, stem) and the rest.
import * as THREE from 'three';
import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';
import { tag } from '../engine/core.js';

const BASE = '/assets/props/';
export const PROPS = await (async () => { try { const r = await fetch(BASE + 'props.json'); return r.ok ? await r.json() : {}; } catch { return {}; } })();
const CACHE = new Map();
let nextGroup = 1;

const lum = (c) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
function greyTexOf(map) {
  const img = map.image; if (!img || !img.width) return map;
  const W = Math.min(img.width, 1024), H = Math.round(img.height * W / img.width);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  const im = g.getImageData(0, 0, W, H), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; d[i] = d[i + 1] = d[i + 2] = v; }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.flipY = map.flipY; t.wrapS = map.wrapS; t.wrapT = map.wrapT; t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; return t;
}
function edgeTexOf(map) {   // Sobel of the texture's luminance, dark on white (as sets/_art.js edgeCanvas, simpler)
  const img = map.image; if (!img || !img.width) return null;
  const W = Math.min(img.width, 1024), H = Math.round(img.height * W / img.width);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.filter = 'blur(1px)'; g.drawImage(img, 0, 0, W, H);
  const s = g.getImageData(0, 0, W, H).data, L = new Float32Array(W * H); for (let i = 0; i < W * H; i++) L[i] = (0.299 * s[4 * i] + 0.587 * s[4 * i + 1] + 0.114 * s[4 * i + 2]) / 255;
  const o = g.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; let e = 0;
    if (x > 0 && y > 0 && x < W - 1 && y < H - 1) { const gx = L[i + 1] - L[i - 1], gy = L[i + W] - L[i - W]; e = Math.min(1, Math.max(0, Math.hypot(gx, gy) * 4 - 0.15)) * 0.8; }
    const v = Math.round(255 * (1 - e)); o.data[4 * i] = o.data[4 * i + 1] = o.data[4 * i + 2] = v; o.data[4 * i + 3] = 255; }
  g.putImageData(o, 0, 0); const t = new THREE.CanvasTexture(c); t.flipY = map.flipY; t.wrapS = map.wrapS; t.wrapT = map.wrapT; t.colorSpace = THREE.NoColorSpace; return t;
}

// the texture's greys times a colour (cached per texture + colour)
const RECOL = new Map();
function recolored(grey, hex) {
  const k = grey.uuid + ':' + hex; if (RECOL.has(k)) return RECOL.get(k);
  const src = grey.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d');
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#' + new THREE.Color(hex).getHexString(); g.fillRect(0, 0, c.width, c.height);
  // greys are mostly mid: lift so the target colour is what a mid-light grey (0.75) becomes
  g.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c); t.flipY = grey.flipY; t.wrapS = grey.wrapS; t.wrapT = grey.wrapT; t.colorSpace = THREE.NoColorSpace; RECOL.set(k, t); return t;
}

// the look of one glTF material (cached per material: shared by every instance of the prop)
function lookOf(mat) {
  if (mat.userData.__look) return mat.userData.__look;
  const col = mat.color ? mat.color.clone() : new THREE.Color(0.6, 0.6, 0.6);
  const map = mat.map || null;
  let look;
  if (map) { map.colorSpace = THREE.NoColorSpace; map.needsUpdate = true;
    // the base-colour texture times the material colour factor (most models: white): the factor goes into the lit colour via a tint canvas only if not white
    look = { grey: lum(col), col: col.getHex(), art: map, artGrey: greyTexOf(map), artEdgeSrc: map }; }
  else look = { grey: Math.min(0.97, Math.max(0.05, lum(col))), col: col.getHex() };
  if (mat.transparent && mat.opacity < 0.5) look.glassy = true;
  return (mat.userData.__look = look);
}

export async function loadProps(names) {
  const loader = new GLTFLoader();
  await Promise.all(names.filter((n) => !CACHE.has(n)).map(async (n) => {
    try { const gl = await loader.loadAsync(`${BASE}${n}/${n}.glb`); CACHE.set(n, gl.scene); }
    catch (e) { CACHE.set(n, null); console.warn(`props: ${n} not loaded (${e.message || e}); the set falls back to its own shape`); } }));
  return names.map((n) => CACHE.get(n));
}

export function prop(name, o = {}) {
  const src = CACHE.get(name); if (!src) return null;
  const meta = PROPS[name] || {};
  o = { ...(meta.defaults || {}), ...o, lookMat: { ...(meta.defaults?.lookMat || {}), ...(o.lookMat || {}) } };
  const g = new THREE.Group(); g.name = 'prop:' + name;
  const inner = src.clone(true); g.add(inner);
  const idGroup = o.parts ? null : 'prop:' + name + ':' + nextGroup++;
  inner.traverse((m) => {
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    let L = o.look ? { grey: 0.6, col: 0x808080, ...o.look } : { ...lookOf(mats[0]) };
    if (!o.look && o.tex === false) { delete L.art; delete L.artGrey; }
    if (L.art) { L.artEdge = o.edges ? (L.artEdgeSrc.__edge ||= edgeTexOf(L.artEdgeSrc)) : null; }
    delete L.artEdgeSrc; delete L.glassy;
    if (!o.look && o.lookMat[mats[0].name]) { Object.assign(L, o.lookMat[mats[0].name]); if (!o.lookMat[mats[0].name].art) { delete L.art; delete L.artGrey; delete L.artEdge; } }
    if (o.lookPart && m.name && o.lookPart[m.name]) Object.assign(L, o.lookPart[m.name]);
    if (o.recolor != null && L.art) { L.art = recolored(L.artGrey, o.recolor); L.col = o.recolor; }
    m.userData.look = L; m.castShadow = !L.noCast && !L.emit; m.receiveShadow = !L.noRecv;
    m.material = new THREE.MeshBasicMaterial();   // the renderer swaps materials per mode from the look
    if (idGroup) m.userData.idGroup = idGroup;
    m.userData.part = m.name || m.parent?.name || '';
  });
  // size: fit one dimension (real-world size of the model unless asked)
  let k = [1, 1, 1];
  if (o.size) { const [ax, v] = Object.entries(o.size)[0]; const s = meta.size_m || new THREE.Box3().setFromObject(inner).getSize(new THREE.Vector3()).toArray();
    const cur = { w: s[0], h: s[1], d: s[2], l: Math.max(...s) }[ax]; k = [v / cur, v / cur, v / cur]; }
  if (o.scale != null) { const s = Array.isArray(o.scale) ? o.scale : [o.scale, o.scale, o.scale]; k = k.map((x, i) => x * s[i]); }
  g.scale.set(...k);
  if (o.rot) { if (o.rot.isQuaternion) g.quaternion.copy(o.rot); else g.rotation.set(...o.rot.map((d) => (d * Math.PI) / 180)); }
  if (o.at) g.position.set(...o.at);
  g.userData.prop = name; g.userData.grips = meta.grips || {};
  return tag(g, o.label || meta.label || name, true);
}

// a grip of a placed prop in world space (call after the prop is in the scene and placed): the object frame graspArms takes
export function grip(g, name) {
  const G = g.userData.grips || {}; const k = name || Object.keys(G)[0]; const s = G[k]; if (!s) return null;
  g.updateWorldMatrix(true, false); const M = g.matrixWorld, sc = new THREE.Vector3(); g.getWorldScale(sc);
  const P = (p) => new THREE.Vector3(...p).applyMatrix4(M).toArray();
  const D = (d) => new THREE.Vector3(...d).transformDirection(M).toArray();
  const kk = (sc.x + sc.y + sc.z) / 3;
  return { name: k, centre: P(s.at), at: P(s.at), axis: D(s.axis || [1, 0, 0]), up: D(s.up || [0, 1, 0]), r: s.r != null ? s.r * kk : undefined,
    size: s.size ? s.size.map((x) => x * kk) : undefined, label: g.userData.label, template: s.template };
}
