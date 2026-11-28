// shanghai86 canonical surfaces (2026-11-27, Jade: "It just has to stay consistent between shots and be fully painted or the
// image model will hallucinate a book shelf right into the plain back of an armchair").
//
// Every visible surface of the room carries ONE fixed texture, the same in every shot and on every side the camera can
// see (fronts, backs, undersides). Any look in build.js / joinery.js that carries `mat: '<key>'` is dressed here:
//   dress(root)   walks the meshes; for each look with a known `mat` it writes UVs (box-projected along each face's
//                 normal in the mesh's own frame, at the texture's REAL size, wood grain along the longer side of each
//                 face; cylinders are wrapped round their axis) and swaps in a look carrying the texture.
// The colour comes from the look itself: the texture's greys are re-centred so the mean is exactly the look's canonical
// colour (lit) and the look's canonical grey (flat / label; form modulates by it), so the values the guides were tuned
// to stay the same and only the surface gains its grain / weave / plaster.
//   line / contour: no texture edges (wood grain or weave lines would be painted as extra objects); geometry only.
//   light / depth: geometry only (as before).
// Sources (CC0, Poly Haven; layout/assets/textures/<name>/SOURCE.txt): herringbone_parquet, plastered_wall, caban (wool),
// sapele_veneer, ash_veneer. Code-drawn (canonical, here): crochet lace (沙发巾), rattan weave, knit and twill (the uncle's
// sweater and trousers), the watch dial and strap.
import * as THREE from 'three';

const BASE = '/assets/textures/';
async function loadImg(url) { const im = new Image(); im.src = url; await im.decode(); return im; }
const SRC = {};
await Promise.all(Object.entries({ parquet: 'herringbone_parquet/herringbone_parquet_diff_2k.jpg', plaster: 'plastered_wall/plastered_wall_diff_1k.jpg',
  wool: 'caban/caban_diff_1k.jpg', sapele: 'sapele_veneer/sapele_veneer_diff_2k.jpg', ash: 'ash_veneer/ash_veneer_diff_1k.jpg' }).map(async ([k, f]) => {
  try { const im = await loadImg(BASE + f), c = document.createElement('canvas'); c.width = Math.min(im.naturalWidth, 2048); c.height = Math.round(im.naturalHeight * c.width / im.naturalWidth);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); SRC[k] = c; }
  catch (e) { console.warn(`textures: ${f} not loaded (${e.message || e}); plain colours stay`); } }));

const rngOf = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
function canvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }

// ---- code-drawn canonical textures (deterministic: fixed seeds)
// crocheted lace cover (沙发巾 / 白钩针): a grid of round motifs (a ring of picots round a solid centre) joined by chain bars,
// cream thread on darker open mesh (the open holes read as shadow, the fabric under them is not seen)
SRC.lace = canvas(512, 512, (g, W) => {
  g.fillStyle = '#8f8a7e'; g.fillRect(0, 0, W, W); const n = 4, s = W / n; g.strokeStyle = '#f6f2e8'; g.fillStyle = '#f6f2e8'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const cx = (i + 0.5) * s, cy = (j + 0.5) * s;
    g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, s * 0.13, 0, 7); g.fill();                                         // solid centre
    g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, s * 0.27, 0, 7); g.stroke();                                         // ring
    for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; g.lineWidth = 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * s * 0.13, cy + Math.sin(a) * s * 0.13); g.lineTo(cx + Math.cos(a) * s * 0.27, cy + Math.sin(a) * s * 0.27); g.stroke();   // spokes
      g.beginPath(); g.arc(cx + Math.cos(a) * s * 0.33, cy + Math.sin(a) * s * 0.33, s * 0.045, 0, 7); g.stroke(); }   // picot loops
    for (const [dx, dy] of [[0.5, 0], [0, 0.5]]) { g.lineWidth = 6; g.beginPath(); g.moveTo(cx + dx * s * 0.75, cy + dy * s * 0.75); g.lineTo(cx + dx * s * 1.25, cy + dy * s * 1.25); g.stroke(); } }   // chain bars to the neighbours
});
// rattan / cane weave: over-under strands, warm cane colour (tinted per look)
SRC.rattan = canvas(256, 256, (g, W) => {
  g.fillStyle = '#5a4a30'; g.fillRect(0, 0, W, W); const n = 8, s = W / n, r = rngOf(88);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const hor = (i + j) % 2 === 0, x = i * s, y = j * s, v = 200 + Math.floor(r() * 40);
    g.fillStyle = `rgb(${v},${v - 18},${v - 60})`; if (hor) g.fillRect(x + 1, y + s * 0.12, s - 2, s * 0.76); else g.fillRect(x + s * 0.12, y + 1, s * 0.76, s - 2);
    g.fillStyle = 'rgba(0,0,0,0.12)'; if (hor) g.fillRect(x + 1, y + s * 0.7, s - 2, s * 0.18); else g.fillRect(x + s * 0.7, y + 1, s * 0.18, s - 2); }
});
// hand-knitted stockinette (columns of V stitches) with a 2x2 rib band at the bottom of the texture (v < RIB): the sweater's
// cuffs and hem (the uncle). u repeats round the arm / body; v runs 0 at the cuff / hem up to 1 m.
export const KNIT_RIB = 0.055, KNIT_V = 1.0, KNIT_U = 0.034;   // rib band height (m), texture height (m), width of one repeat (m)
SRC.knit = canvas(64, 1024, (g, W, H) => {
  g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, W, H); const ribPx = Math.round((KNIT_RIB / KNIT_V) * H), sw = W / 8, sh = sw * 0.8;
  for (let y = 0; y < H - ribPx; y += sh) for (let x = 0; x < W; x += sw) {   // V stitches
    g.strokeStyle = '#d8d8d8'; g.lineWidth = sw * 0.34; g.beginPath(); g.moveTo(x + sw * 0.12, y + sh * 0.05); g.lineTo(x + sw * 0.5, y + sh * 0.95); g.lineTo(x + sw * 0.88, y + sh * 0.05); g.stroke(); }
  for (let x = 0; x < W; x += sw) { const knit = Math.floor(x / sw) % 4 < 2; g.fillStyle = knit ? '#c8c8c8' : '#8c8c8c'; g.fillRect(x, H - ribPx, sw, ribPx);   // rib: 2 knit, 2 purl columns
    if (knit) for (let y = H - ribPx; y < H; y += sh) { g.strokeStyle = '#ececec'; g.lineWidth = sw * 0.3; g.beginPath(); g.moveTo(x + sw * 0.15, y); g.lineTo(x + sw * 0.5, y + sh * 0.9); g.lineTo(x + sw * 0.85, y); g.stroke(); } }
  g.fillStyle = '#6a6a6a'; g.fillRect(0, H - ribPx - 2, W, 3);   // the line where rib meets body
});
// worsted twill (trousers): fine 45-degree diagonal wales
SRC.twill = canvas(128, 128, (g, W) => { g.fillStyle = '#a0a0a0'; g.fillRect(0, 0, W, W); g.strokeStyle = '#c2c2c2'; g.lineWidth = 3;
  for (let k = -W; k < 2 * W; k += 8) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + W, W); g.stroke(); } });

// the uncle's padded jacket (棉袄): grey-blue cotton, quilted in horizontal channels 7 cm apart (one tile = one channel, 10 cm
// wide): a stitched seam line (short dashes) with the padding puffing up between seams (soft light-dark gradient), fine weave
export const QUILT_U = 0.1, QUILT_V = 0.07;
SRC.quilt = canvas(256, 180, (g, W, H) => { const r = rngOf(70);
  const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#6e6e6e'); grd.addColorStop(0.18, '#a6a6a6'); grd.addColorStop(0.5, '#b8b8b8'); grd.addColorStop(0.82, '#a0a0a0'); grd.addColorStop(1, '#6a6a6a');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},0.05)`; g.fillRect(r() * W, r() * H, 2, 1); }   // cotton weave
  g.strokeStyle = '#4a4a4a'; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(0, 2); g.lineTo(W, 2); g.stroke(); });
// a flat stockinette patch (the pullover at the neck)
SRC.knitflat = canvas(64, 64, (g, W) => { g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, W, W); g.strokeStyle = '#d8d8d8'; g.lineWidth = 3;
  for (let y = 0; y < W; y += 8) for (let x = 0; x < W; x += 8) { g.beginPath(); g.moveTo(x + 1, y); g.lineTo(x + 4, y + 7); g.lineTo(x + 7, y); g.stroke(); } });
// 2026-11-27 (Jade: the plain wool read as plain; one canonical upholstery fabric that reads at guide resolution): a woven
// wool UPHOLSTERY STRIPE in the rust family, the kind of striped furnishing cloth on 1980s Shanghai chairs (Ba Jin's
// living room: striped covers): per 4 cm repeat a 2 cm rust band, a 2 mm cream pinline, a 1.4 cm darker brown-rust band,
// a second pinline; the Caban wool's weave (Poly Haven, CC0) over it. Stripes run up the backs and sides, front to back
// on the seats and round the arm rolls. Its pinlines are also drawn (faintly) in line / contour, so the pattern is in
// every guide mode.
export const UPH_STRIPE = 0.04;
{ const W = 256, c = document.createElement('canvas'); c.width = W; c.height = W; const g = c.getContext('2d');
  if (SRC.wool) g.drawImage(SRC.wool, 0, 0, Math.round(SRC.wool.width * UPH_STRIPE / 0.274), Math.round(SRC.wool.height * UPH_STRIPE / 0.274), 0, 0, W, W); else { g.fillStyle = '#888'; g.fillRect(0, 0, W, W); }
  const im = g.getImageData(0, 0, W, W), d = im.data; let m = 0; for (let i = 0; i < W * W; i++) m += 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; m /= W * W;
  // round 9 (Jade: the canon card as shown: dark rust-brown 0x683826 with a CREAM pinline): drawn in its real colours (raw),
  // the wool's weave modulating each band by +-12 %: rust 0x683826, cream pinline 0xe8dcc0, darker band 0x4a2618
  const RUST = [0x68, 0x38, 0x26], CREAM = [0xe8, 0xdc, 0xc0], DARK = [0x4a, 0x26, 0x18];
  const band = (x) => (x < 128 ? RUST : x < 141 ? CREAM : x < 230 ? DARK : x < 243 ? CREAM : RUST);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / m, k = 0.88 + 0.12 * l, c = band(x);
    d[i] = Math.min(255, c[0] * k); d[i + 1] = Math.min(255, c[1] * k); d[i + 2] = Math.min(255, c[2] * k); }
  g.putImageData(im, 0, 0); SRC.uphol = c;
  SRC.upholEdge = canvas(W, W, (e) => { e.fillStyle = '#fff'; e.fillRect(0, 0, W, W); e.fillStyle = '#b8b8b8'; e.fillRect(128, 0, 13, W); e.fillRect(230, 0, 13, W); }); }
// the little girl's top (Jade, canon: LONG RED GINGHAM SLEEVES, as in the r3 V1d_2 paintings): coral-red and white gingham,
// 7 mm squares (one 14 mm repeat), in its own colours (raw)
SRC.gingham = canvas(64, 64, (g, W) => { g.fillStyle = '#f4eee4'; g.fillRect(0, 0, W, W); g.fillStyle = 'rgba(206,78,60,0.55)'; g.fillRect(0, 0, W / 2, W); g.fillRect(0, 0, W, W / 2); });
// her gathered cuffs: the gingham bunched by the elastic (soft vertical folds)
SRC.ginghamGather = canvas(256, 64, (g, W, H) => { for (let x = 0; x < W; x++) { const f = 0.75 + 0.25 * Math.cos((x / W) * Math.PI * 2 * 18); g.fillStyle = `rgb(${Math.round(240 * f)},${Math.round(160 * f)},${Math.round(145 * f)})`; g.fillRect(x, 0, 1, H); } });
// the tea cups (盖杯, as the r3 paintings drew them): white porcelain, a blue flower spray on each side, blue lines at rim and
// foot; the lid's top a red plum-blossom branch
SRC.cup = canvas(512, 256, (g, W, H) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, W, H); g.fillStyle = '#2c4a8a';
  g.fillRect(0, 10, W, 5); g.fillRect(0, H - 30, W, 4);   // rim and foot lines (v: 0 at the foot, 1 at the rim; the canvas top is the rim)
  for (const cx of [W * 0.25, W * 0.75]) { g.strokeStyle = '#2c4a8a'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 40, 190); g.quadraticCurveTo(cx - 10, 120, cx + 30, 80); g.stroke();
    for (const [dx, dy, r] of [[30, 80, 16], [-6, 118, 13], [22, 140, 10], [-30, 160, 11]]) { for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.arc(cx + dx + Math.cos(a) * r * 0.7, dy + Math.sin(a) * r * 0.7, r * 0.55, 0, 7); g.fill(); } g.fillStyle = '#f4f2ec'; g.beginPath(); g.arc(cx + dx, dy, r * 0.3, 0, 7); g.fill(); g.fillStyle = '#2c4a8a'; }
    for (const [dx, dy] of [[-22, 150], [12, 100]]) { g.beginPath(); g.ellipse(cx + dx, dy, 14, 5, -0.6, 0, 7); g.fill(); } } });
SRC.lid = canvas(256, 256, (g, W) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, W, W); g.strokeStyle = '#4a2a1e'; g.lineWidth = 5; g.beginPath(); g.moveTo(40, 200); g.quadraticCurveTo(110, 150, 200, 70); g.stroke();
  g.fillStyle = '#c4343a'; for (const [x, y] of [[90, 162], [140, 122], [185, 84], [120, 180]]) for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 7, 0, 7); g.fill(); }
  g.fillStyle = '#2c4a8a'; g.fillRect(0, 6, W, 4); });
// grandpa's newspaper archive: the edge of a tied bundle of folded broadsheets (fine horizontal sheet edges, a few darker)
SRC.newsstack = canvas(64, 128, (g, W, H) => { const r = rngOf(51); g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 2) { g.fillStyle = `rgba(90,80,60,${0.15 + r() * 0.35})`; g.fillRect(0, y, W, 1); } });
// the dining tablecloth (台布) under the glass: a woven cotton check in pale sage green and cream, 2.5 cm squares with a
// thin darker green line at each square's edge (raw colours, one canonical cloth)
SRC.tablecloth = canvas(128, 128, (g, W) => { g.fillStyle = '#ece6d2'; g.fillRect(0, 0, W, W); g.fillStyle = 'rgba(122,150,112,0.45)'; g.fillRect(0, 0, W / 2, W); g.fillRect(0, 0, W, W / 2);
  g.fillStyle = 'rgba(70,100,70,0.55)'; for (const v of [0, W / 2]) { g.fillRect(v, 0, 2, W); g.fillRect(0, v, W, 2); } });
// key -> { src, period: [u, v] metres per tile, grain: 'u' | 'v' | null (the texture axis the wood grain runs along), contrast }
export const MATS = {
  parquet: { src: 'parquet', period: [3.4, 3.4], contrast: 1.0 },          // herringbone blocks ~7 x 35 cm (1930s Shanghai flat; waxed)
  plaster: { src: 'plaster', period: [2.0, 2.0], contrast: 0.8 },          // lime plaster, distemper-painted
  wool: { src: 'wool', period: [0.27, 0.27], contrast: 3.0 },              // the suite's plain wool cloth
  sapele: { src: 'sapele', period: [0.5, 0.5], grain: 'v', contrast: 1.25 }, // varnished dark wood (cabinetry, tables, joinery)
  ash: { src: 'ash', period: [1.0, 1.0], grain: 'u', contrast: 1.3 },     // her small pale-wood table and chair
  lace: { src: 'lace', period: [0.2, 0.2], contrast: 1.0 },                // crocheted covers: 5 cm motifs
  rattan: { src: 'rattan', period: [0.08, 0.08], contrast: 1.0 },          // cane weave
  knit: { src: 'knit', period: [KNIT_U, KNIT_V], contrast: 0.3, clampV: true },
  uphol: { src: 'uphol', period: [UPH_STRIPE, UPH_STRIPE], raw: true, edge: 'upholEdge' },
  tablecloth: { src: 'tablecloth', period: [0.05, 0.05], raw: true },
  gingham: { src: 'gingham', period: [0.014, 0.014], raw: true },
  ginghamGather: { src: 'ginghamGather', period: [1, 1], raw: true },
  newsstack: { src: 'newsstack', period: [0.3, 0.075], contrast: 1.0 },
  quilt: { src: 'quilt', period: [QUILT_U, QUILT_V], contrast: 0.8 },
  knitflat: { src: 'knitflat', period: [0.03, 0.03], contrast: 0.5 },
  twill: { src: 'twill', period: [0.012, 0.012], contrast: 0.5 },
};

// the texture re-centred on a colour (lit) and on a grey (flat / form): out = target * (1 + (l / mean - 1) * contrast)
const TEX = new Map();
function texOf(key, col, grey) {
  const M = MATS[key], src = SRC[M.src]; if (!src) return null;
  const k = `${key}:${col}:${grey}`; if (TEX.has(k)) return TEX.get(k);
  const W = src.width, H = src.height, d = src.getContext('2d').getImageData(0, 0, W, H).data, L = new Float32Array(W * H); let mean = 0;
  for (let i = 0; i < W * H; i++) { L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; mean += L[i]; } mean /= W * H;
  const c = new THREE.Color(col), mkT = (fn) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), im = g.createImageData(W, H);
    for (let i = 0; i < W * H; i++) { const f = Math.max(0, 1 + (L[i] / mean - 1) * (M.contrast ?? 1)), [r, gg, b] = fn(f); im.data[i * 4] = r; im.data[i * 4 + 1] = gg; im.data[i * 4 + 2] = b; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.wrapS = THREE.RepeatWrapping; t.wrapT = M.clampV ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.colorSpace = THREE.NoColorSpace; return t; };
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
  let out;
  if (M.raw) { const t = new THREE.CanvasTexture(src); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.NoColorSpace;   // in its own colours
    out = { art: t, artGrey: mkT((f) => { const v = cl(grey * f); return [v, v, v]; }) }; }
  else out = { art: mkT((f) => [cl(c.r * f), cl(c.g * f), cl(c.b * f)]), artGrey: mkT((f) => { const v = cl(grey * f); return [v, v, v]; }) };
  if (M.edge && SRC[M.edge]) { const e = new THREE.CanvasTexture(SRC[M.edge]); e.wrapS = e.wrapT = THREE.RepeatWrapping; e.colorSpace = THREE.NoColorSpace; out.artEdge = e; }
  TEX.set(k, out); return out;
}

// deterministic per-mesh offset (so neighbouring boards do not repeat the same patch), from the mesh's world position:
// the same in every shot because the furniture does not move between shots
const hash3 = (v) => { let h = 2166136261; for (const x of [v.x, v.y, v.z]) { h ^= Math.round(x * 1000); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };

function writeUV(mesh, M) {
  let g = mesh.geometry; if (g.userData.__dressed) { g = g.clone(); mesh.geometry = g; }   // shared geometry: dress a copy
  const p = g.attributes.position, n = g.attributes.normal; if (!p || !n) return;
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(p.count * 2), 2));
  const uv = g.attributes.uv, s = mesh.scale, [pu, pv] = M.period; g.computeBoundingBox(); const bb = g.boundingBox, ext = [(bb.max.x - bb.min.x) * s.x, (bb.max.y - bb.min.y) * s.y, (bb.max.z - bb.min.z) * s.z];
  const wp = new THREE.Vector3(); mesh.getWorldPosition(wp); const off = [hash3(wp), hash3(wp.clone().multiplyScalar(1.7))];
  const cylAxis = g.type === 'CylinderGeometry' ? 1 : -1;   // three.js cylinders run along local y
  for (let i = 0; i < p.count; i++) {
    const q = [p.getX(i) * s.x, p.getY(i) * s.y, p.getZ(i) * s.z], a = [Math.abs(n.getX(i)), Math.abs(n.getY(i)), Math.abs(n.getZ(i))];
    let A, B;   // the two coordinates of the face plane: A along texture u, B along texture v
    if (cylAxis >= 0 && a[1] < 0.7) { const r = Math.hypot(q[0], q[2]) || 1e-6; A = Math.atan2(q[2], q[0]) * Math.max(r, 0.01); B = q[1];   // wrap round the axis
      if (M.grain === 'u') [A, B] = [B, A]; }
    else { const k = a[0] >= a[1] && a[0] >= a[2] ? 0 : a[1] >= a[2] ? 1 : 2, o = [0, 1, 2].filter((x) => x !== k); let [i0, i1] = o;
      if (k !== 1 && !M.grain) { i0 = o.find((x) => x !== 1); i1 = 1; }   // walls / fabric fronts: v is up
      if (M.grain) { const long = ext[o[0]] >= ext[o[1]] ? o[0] : o[1], short = long === o[0] ? o[1] : o[0];   // grain along the longer side of the face
        [i0, i1] = M.grain === 'v' ? [short, long] : [long, short]; }
      A = q[i0]; B = q[i1]; }
    uv.setXY(i, A / pu + off[0], M.clampV ? B / pv : B / pv + off[1]);
  }
  uv.needsUpdate = true; g.userData.__dressed = true;
}

// look -> textured look (cached per source look object, so meshes sharing a look share the textured look)
const LOOKS = new WeakMap();
function dressedLook(L) {
  if (LOOKS.has(L)) return LOOKS.get(L);
  const t = texOf(L.mat, L.col ?? 0x808080, L.grey ?? 0.6); const out = t ? { ...L, art: t.art, artGrey: t.artGrey, artEdge: t.artEdge || null } : L;
  LOOKS.set(L, out); return out;
}
export function dress(root) {
  root.updateMatrixWorld(true); let n = 0;
  root.traverse((m) => { if (!m.isMesh) return; const L = m.userData.look; if (!L || !L.mat || !MATS[L.mat] || L.art || L.glass) return;
    const nl = dressedLook(L); if (nl === L) return; writeUV(m, MATS[L.mat]); m.userData.look = nl; if (m.userData.mats) m.userData.mats = {}; n++; });
  return n;
}

// a garment mesh (no UVs of its own) dressed with a texture whose UVs come from a function of the WORLD vertex position
export function dressGarment(mesh, key, col, grey, uvAt) {
  const t = texOf(key, col, grey); if (!t) return false; mesh.updateMatrixWorld(true);
  const g = mesh.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), w = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { w.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld); const [u, v] = uvAt(w, i); uv[i * 2] = u; uv[i * 2 + 1] = v; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  mesh.userData.look = { ...mesh.userData.look, art: t.art, artGrey: t.artGrey, artEdge: t.artEdge || null }; if (mesh.userData.mats) mesh.userData.mats = {};
  return true;
}

// ---- the uncle's wristwatch: ONE canonical design, TAKEN FROM THE PAINTINGS (Jade, 2026-11-27: "the watch the image model
// already painted is fine ... keep THAT design"): media/keyframes/r3/shanghai86/V1b_v1.jpg (the r3 pick and the clearest
// view; r2 V1a/V1b and r3 V1a agree: a round steel watch on a brown leather strap). A plain IVORY dial, no numerals and no
// lettering, twelve tiny dark dots for the hours, two thin straight dark hands (set to 9:30, the scene's hour), a slim
// polished steel bezel; the strap worn dark-brown leather with pale edge stitching (strapCanvas)
export function watchDialCanvas() {
  return canvas(512, 512, (g, S) => {
    const c = S / 2; g.fillStyle = '#a8a8a2'; g.fillRect(0, 0, S, S);
    const grd = g.createRadialGradient(c * 0.85, c * 0.8, 10, c, c, c * 0.97); grd.addColorStop(0, '#f1ebdc'); grd.addColorStop(1, '#e2d9c4');
    g.fillStyle = grd; g.beginPath(); g.arc(c, c, c * 0.97, 0, 7); g.fill();
    g.fillStyle = '#3a342c'; for (let h = 0; h < 12; h++) { const a = (h * Math.PI) / 6; g.beginPath(); g.arc(c + Math.sin(a) * c * 0.8, c - Math.cos(a) * c * 0.8, h % 3 ? 7 : 9, 0, 7); g.fill(); }
    const hand = (a, len, wd) => { g.strokeStyle = '#1c1a18'; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(c - Math.sin(a) * c * 0.1, c + Math.cos(a) * c * 0.1); g.lineTo(c + Math.sin(a) * len, c - Math.cos(a) * len); g.stroke(); };
    hand(((9 + 30 / 60) * Math.PI) / 6, c * 0.5, 10); hand(Math.PI, c * 0.74, 7);
    g.fillStyle = '#1c1a18'; g.beginPath(); g.arc(c, c, 11, 0, 7); g.fill();
  });
}
export function strapCanvas() {
  return canvas(256, 64, (g, W, H) => { g.fillStyle = '#3e2a1c'; g.fillRect(0, 0, W, H); const r = rngOf(5);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '20,12,6' : '90,64,44'},0.25)`; g.fillRect(r() * W, r() * H, 3, 1); }   // grain
    g.strokeStyle = '#c8b48a'; g.lineWidth = 2; g.setLineDash([7, 5]); for (const y of [7, H - 7]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } });
}

// a folded broadsheet newspaper (1980s Chinese daily layout, GREEKED: grey text blocks, no readable characters), as it lies
export function newspaperCanvas() {
  return canvas(400, 580, (g, W, H) => { g.fillStyle = '#ddd6c4'; g.fillRect(0, 0, W, H); const r = rngOf(1986);
    g.fillStyle = '#8a2a22'; g.fillRect(W - 120, 18, 100, 46);                                   // the red masthead block (no lettering)
    g.fillStyle = '#3a3630'; g.fillRect(20, 24, W - 160, 10); g.fillRect(20, 44, W - 200, 6);   // headline bars
    for (let col = 0; col < 6; col++) for (let y = 84; y < H - 20; y += 9) { if (r() < 0.06) { y += 24; g.fillRect(20 + col * 62, y - 16, 50, 7); continue; }
      g.fillStyle = `rgba(58,54,48,${0.35 + r() * 0.2})`; g.fillRect(20 + col * 62, y, 50 - (r() < 0.15 ? r() * 30 : 0), 3); }
    g.fillStyle = '#9a9488'; g.fillRect(20, 300, 170, 110); });                                     // a photo block
}

// the pullover's 2x2 ribbed cuff, cream (u round the wrist: 28 rib pairs; v along it)
export function ribCanvas() { return canvas(448, 32, (g, W, H) => { for (let x = 0; x < W; x += 4) { const k = Math.floor(x / 4) % 4 < 2; g.fillStyle = k ? '#ece8dc' : '#bdb8aa'; g.fillRect(x, 0, 4, H); } }); }
// a four-hole dark grey jacket button (the cap of a cylinder: UV maps the circle)
export function buttonCanvas() { return canvas(128, 128, (g, S) => { g.fillStyle = '#2e2e30'; g.fillRect(0, 0, S, S); g.fillStyle = '#4a4a4e'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.42, 0, 7); g.fill();
  g.strokeStyle = '#2a2a2c'; g.lineWidth = 5; g.beginPath(); g.arc(S / 2, S / 2, S * 0.34, 0, 7); g.stroke(); g.fillStyle = '#141416';
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.arc(S / 2 + dx * 12, S / 2 + dy * 12, 6, 0, 7); g.fill(); } }); }
export const cupCanvas = () => SRC.cup, lidCanvas = () => SRC.lid;
// a handwritten date slip on a newspaper bundle (blue-black ink scribble: nothing legible)
export function slipCanvas() { return canvas(180, 120, (g, W, H) => { const r = rngOf(12); g.fillStyle = '#f2eedf'; g.fillRect(0, 0, W, H); g.strokeStyle = '#1e2a4a'; g.lineWidth = 3; g.lineCap = 'round';
  for (let row = 0; row < 2; row++) { let x = 18; const y = 42 + row * 40; g.beginPath(); g.moveTo(x, y); while (x < W - 30) { x += 6 + r() * 8; g.lineTo(x, y + (r() - 0.5) * 18); } g.stroke(); } }); }

// round 7 (Jade: the wall clock in the dining ref photo is "a pretty close match" for hers): an aged cream dial, large black
// serif Arabic numerals, a ring of minute dots, black spade hands; fixed at 9:30 (the scene's hour) in every shot
export function wallClockDial() { return canvas(512, 512, (g, S) => { const c = S / 2;
  g.fillStyle = '#2a1a12'; g.fillRect(0, 0, S, S); const grd = g.createRadialGradient(c, c, 20, c, c, c); grd.addColorStop(0, '#efe7d2'); grd.addColorStop(1, '#ddd2b6');
  g.fillStyle = grd; g.beginPath(); g.arc(c, c, c * 0.98, 0, 7); g.fill();
  g.fillStyle = '#141210'; for (let t = 0; t < 60; t++) { const a = t * Math.PI / 30; g.beginPath(); g.arc(c + Math.sin(a) * c * 0.9, c - Math.cos(a) * c * 0.9, t % 5 ? 3 : 5, 0, 7); g.fill(); }
  g.font = 'bold 74px "Liberation Serif", "DejaVu Serif", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let n = 1; n <= 12; n++) { const a = n * Math.PI / 6; g.fillText(String(n), c + Math.sin(a) * c * 0.72, c - Math.cos(a) * c * 0.72 + 3); }
  const spade = (a, len, w) => { g.save(); g.translate(c, c); g.rotate(a); g.fillStyle = '#141210'; g.fillRect(-w / 2, -len * 0.75, w, len * 0.95);
    g.beginPath(); g.moveTo(0, -len); g.lineTo(w * 3, -len * 0.78); g.lineTo(0, -len * 0.62); g.lineTo(-w * 3, -len * 0.78); g.closePath(); g.fill(); g.restore(); };
  spade((9.5 * Math.PI) / 6, c * 0.5, 8); spade(Math.PI, c * 0.78, 6); g.beginPath(); g.arc(c, c, 12, 0, 7); g.fill(); }); }
