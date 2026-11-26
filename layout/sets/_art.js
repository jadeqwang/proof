// Fixed background art for the sets (2026-11-26, Jade: "for any scene where we have background art or background
// objects on the walls, we should incorporate them into the 3d model so that the image models don't invent new art
// between generations/clips"). ONE shared helper for every set.
//
// Every piece has ONE canonical image (layout/assets/art/<set>/<name>.png, with a .txt sidecar) or is drawn in code
// on a canvas (book spines: real titles as plain lettering). A piece becomes three textures:
//   art      the image in colour            -> lit mode
//   artGrey  its luminance                  -> flat / label modes (flat stays greys), and the form guide (modulated)
//   artEdge  its main edges, dark on white  -> multiplied over the line and contour guides
// The renderer (engine/render.js) only does this for meshes whose look carries `art` (opt-in per material); a set
// without art renders exactly as before.
//
//   await loadArt({ name: '/assets/art/<set>/<name>.png', ... })  -> { name: ArtTex | null }   (top level; a missing image -> null, callers fall back)
//   artFromCanvas(canvas, opts)                                    -> ArtTex             (synchronous, code-drawn)
//   artPlane(a, w, h, look?)  a w x h m plane (local +z faces out, UV 0..1 across the image), look carries the art
//   artLook(a, look?)         the look fields for any mesh with proper UVs
//   fitCover(a, w, h)         crop the texture's UVs so the image covers a w x h plane without stretching
//   decalMesh(a, place, look?, n?)  a clothing print / logo with a transparent background: an n x n grid over the image,
//                             cells where the image is transparent dropped (so every guide mode, line and id included,
//                             sees the print's real outline: no engine alpha needed). place(s, t) -> world Vector3 for
//                             s, t in 0..1 (s left -> right as the print is read, t bottom -> top): conform it to a body
//                             by raycasting the torso (mv10 housewarming()), or a flat plane. Move to the body mesh later
//                             by changing only place().
//   clockArt({ hh, mm, ss, face, numerals })   a plain wall-clock face drawn in code (fixed time), on a CircleGeometry
import * as THREE from 'three';
import { mk } from '../engine/core.js';

const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

// edge map: Sobel on the (slightly blurred) luminance, normalised to its 96th percentile, dark lines on white
function edgeCanvas(src, { edgeGain = 1, edgeMax = 0.82, edgeBlur = 0 } = {}) {   // edgeBlur (px): more for painterly images, so only their main shapes draw
  const W = src.width, H = src.height, g = src.getContext('2d');
  const blur = document.createElement('canvas'); blur.width = W; blur.height = H; const bg = blur.getContext('2d');
  bg.filter = `blur(${edgeBlur || Math.max(1, Math.round(Math.min(W, H) / 400))}px)`; bg.drawImage(src, 0, 0);
  const d = bg.getImageData(0, 0, W, H).data, L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = lum(d, i * 4) / 255;
  const M = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x;
    const gx = L[i - W + 1] + 2 * L[i + 1] + L[i + W + 1] - L[i - W - 1] - 2 * L[i - 1] - L[i + W - 1];
    const gy = L[i + W - 1] + 2 * L[i + W] + L[i + W + 1] - L[i - W - 1] - 2 * L[i - W] - L[i - W + 1];
    M[i] = Math.hypot(gx, gy); }
  const s = Array.from(M.filter((v, k) => k % 7 === 0)).sort((a, b) => a - b); const ref = Math.max(s[Math.floor(s.length * 0.96)] || 0, 0.15);
  const out = document.createElement('canvas'); out.width = W; out.height = H; const og = out.getContext('2d'); const im = og.createImageData(W, H);
  for (let i = 0; i < W * H; i++) { const e = Math.min(1, Math.max(0, (M[i] / ref) * edgeGain - 0.25) / 0.75) * edgeMax; const v = Math.round(255 * (1 - e));
    im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  og.putImageData(im, 0, 0); return out;
}
function greyCanvas(src) {
  const W = src.width, H = src.height; const out = document.createElement('canvas'); out.width = W; out.height = H; const g = out.getContext('2d');
  g.drawImage(src, 0, 0); const im = g.getImageData(0, 0, W, H);
  for (let i = 0; i < W * H * 4; i += 4) { const v = lum(im.data, i); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; }
  g.putImageData(im, 0, 0); return out;
}
const tex = (c) => { const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; return t; };

export function artFromCanvas(canvas, opts = {}) {
  const art = tex(canvas), artGrey = tex(greyCanvas(canvas)), artEdge = tex(opts.edgeCanvas || edgeCanvas(canvas, opts));
  return { art, artGrey, artEdge, canvas, aspect: canvas.width / canvas.height, w: canvas.width, h: canvas.height, src: opts.src || 'canvas' };
}
async function loadOne(url, opts) {
  const img = new Image(); img.src = url; await img.decode();
  const W = Math.min(img.naturalWidth, opts.maxPx || 1024), H = Math.round(img.naturalHeight * W / img.naturalWidth);
  const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(img, 0, 0, W, H);
  if (!opts.bg) return artFromCanvas(c, { ...opts, src: url });
  // a print with a transparent background: textures flattened onto the garment colour (opts.bg), the alpha kept for decalMesh
  const f = document.createElement('canvas'); f.width = W; f.height = H; const fg = f.getContext('2d'); fg.fillStyle = opts.bg; fg.fillRect(0, 0, W, H); fg.drawImage(c, 0, 0);
  const a = artFromCanvas(f, { ...opts, src: url }); a.canvas = c; return a;
}
export async function loadArt(spec, opts = {}) {
  const out = {}; await Promise.all(Object.entries(spec).map(async ([k, v]) => {
    const [url, o] = Array.isArray(v) ? v : [v, {}];
    try { out[k] = await loadOne(url, { ...opts, ...o }); } catch (e) { out[k] = null; console.warn(`art: ${url} not loaded (${e.message || e}); the set falls back to its plain shapes`); } }));
  return out;
}
// UV crop so an image of aspect a.aspect covers a plane of w x h without stretching (centred)
export function fitCover(a, w, h) {
  const pa = w / h, r = { repeat: [1, 1], offset: [0, 0] };
  if (a.aspect > pa) { r.repeat[0] = pa / a.aspect; r.offset[0] = (1 - r.repeat[0]) / 2; } else { r.repeat[1] = a.aspect / pa; r.offset[1] = (1 - r.repeat[1]) / 2; }
  return r;
}
export function artLook(a, look = {}) { return { grey: 0.75, col: 0xcccccc, ...look, art: a.art, artGrey: a.artGrey, artEdge: a.artEdge }; }
// plane w x h (metres), facing local +z; the image is fitted by cropping its UVs (never stretched)
export function artPlane(a, w, h, look = {}) {
  const geo = new THREE.PlaneGeometry(w, h); const f = fitCover(a, w, h); const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, f.offset[0] + uv.getX(i) * f.repeat[0], f.offset[1] + uv.getY(i) * f.repeat[1]);
  const m = mk(geo, { noCast: true, ...artLook(a, look) }); m.userData.art = true; return m;
}

// a plain wall clock face (code-drawn): arabic numerals, minute ticks, black hands and a red second hand at a fixed time
const clocks = new Map();
export function clockArt({ hh = 10, mm = 10, ss = 38, face = '#f4f2ea', bezel = '#2a2a2a', numerals = 'arabic' } = {}) {
  const key = [hh, mm, ss, face, bezel, numerals].join(); if (clocks.has(key)) return clocks.get(key);
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  g.fillStyle = bezel; g.fillRect(0, 0, S, S);
  g.fillStyle = face; g.beginPath(); g.arc(S / 2, S / 2, S * 0.46, 0, 7); g.fill();
  g.fillStyle = '#111'; g.font = 'bold 50px "Liberation Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (numerals === 'arabic') for (let n = 1; n <= 12; n++) { const a = n * Math.PI / 6; g.fillText(String(n), S / 2 + Math.sin(a) * S * 0.36, S / 2 - Math.cos(a) * S * 0.36); }
  for (let t = 0; t < 60; t++) { const a = t * Math.PI / 30, r0 = S * (t % 5 ? 0.43 : 0.405); g.lineWidth = t % 5 ? 2 : 6; g.strokeStyle = '#111'; g.beginPath();
    g.moveTo(S / 2 + Math.sin(a) * r0, S / 2 - Math.cos(a) * r0); g.lineTo(S / 2 + Math.sin(a) * S * 0.445, S / 2 - Math.cos(a) * S * 0.445); g.stroke(); }
  const hand = (a, len, wd, col) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(S / 2, S / 2); g.lineTo(S / 2 + Math.sin(a) * len, S / 2 - Math.cos(a) * len); g.stroke(); };
  hand((hh % 12 + mm / 60) * Math.PI / 6, S * 0.22, 12, '#111'); hand(mm * Math.PI / 30, S * 0.33, 8, '#111'); if (ss != null) hand(ss * Math.PI / 30, S * 0.38, 3, '#b02020');
  const a = artFromCanvas(c); clocks.set(key, a); return a;
}

// tiling art (a textile): set a mesh's UVs from its local positions (box-projected along each face's normal) so the
// texture repeats every `period` metres on every face without stretching; the art's textures must use RepeatWrapping
export function worldUV(mesh, period) {
  const g = mesh.geometry, p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, s = mesh.scale;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) * s.x, y = p.getY(i) * s.y, z = p.getZ(i) * s.z, ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (ay >= ax && ay >= az) uv.setXY(i, x / period, z / period); else if (ax >= az) uv.setXY(i, z / period, y / period); else uv.setXY(i, x / period, y / period); }
  uv.needsUpdate = true; return mesh;
}
export function repeatArt(a) { for (const t of [a.art, a.artGrey, a.artEdge]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; } return a; }

export function decalMesh(a, place, look = {}, n = 128) {
  const W = a.canvas.width, H = a.canvas.height, d = a.canvas.getContext('2d').getImageData(0, 0, W, H).data;
  const alphaAt = (s, t) => d[(Math.min(H - 1, Math.floor((1 - t) * H)) * W + Math.min(W - 1, Math.floor(s * W))) * 4 + 3];
  const pos = [], uv = [], idx = [], vid = new Map();
  const v = (i, j) => { const k = i * (n + 1) + j; if (vid.has(k)) return vid.get(k); const s = j / n, t = i / n, p = place(s, t); pos.push(p.x, p.y, p.z); uv.push(s, t); vid.set(k, pos.length / 3 - 1); return vid.get(k); };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (alphaAt((j + 0.5) / n, (i + 0.5) / n) < 128) continue;
    const a0 = v(i, j), a1 = v(i, j + 1), a2 = v(i + 1, j + 1), a3 = v(i + 1, j); idx.push(a0, a1, a2, a0, a2, a3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = mk(g, { noCast: true, ...artLook(a, look) }); m.userData.art = true; m.userData.double = true; return m;
}
