// playground23: the space theme as FIXED canonical art (2026-11-26, r4). Every piece is ONE image, drawn here in code
// with a fixed seed, so it is the same in every shot and every guide mode (sets/_art.js: lit colour, flat greys, form
// modulation, line/contour edges). No lettering, no logos, no brand marks anywhere: the venue is a real business
// (an indoor play centre in Austin), and the set stays generic and unbranded.
//
//   floorArt()     the padded vinyl floor print: deep navy, orbit rings, planets, dashed "flight paths", stars
//   muralArt()     the wall mural (one image for the back wall): nebula, ringed planet, a cartoon rocket, stars
//   planetArt(k)   equirectangular skins for the hanging planets: 'violet' (the lit one), 'ringed', 'moon'
//   sweaterArt()   the boy's knit: deep azurite with small white stars; chestArt(): ONE ringed planet + ONE rocket
//   dressArt()     the girl's dress print: pink with red strawberries (green tops), repeating
//   shuttleArt()   the play shuttle's skin: white hull, black belly tiles, portholes; no text, no flag
import { artFromCanvas, repeatArt } from '../_art.js';

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
function star(g, x, y, r, col = '#ffffff', n = 5) {
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 2 * n; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  g.closePath(); g.fill();
}
function planet(g, x, y, r, c0, c1, ring = null) {
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, c0); gr.addColorStop(1, c1);
  if (ring) { g.save(); g.strokeStyle = ring; g.lineWidth = r * 0.16; g.beginPath(); g.ellipse(x, y, r * 1.75, r * 0.42, -0.35, Math.PI, 2 * Math.PI); g.stroke(); g.restore(); }
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.fill();
  if (ring) { g.save(); g.strokeStyle = ring; g.lineWidth = r * 0.16; g.beginPath(); g.ellipse(x, y, r * 1.75, r * 0.42, -0.35, 0, Math.PI); g.stroke(); g.restore(); }
}
const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());

// ---- the floor: 4096 px over FLOOR_M metres (one image, not tiled)
export const FLOOR_M = 16;
export const floorArt = () => once('floor', () => {
  const S = 2048, [c, g] = cv(S, S), R = rng(23), m = S / FLOOR_M;   // m = px per metre
  g.fillStyle = '#1b1f4a'; g.fillRect(0, 0, S, S);
  // big concentric orbit target (as the real venue floors: red/orange/white rings), centred left of the shuttle
  const ox = (8 - 4.2) * m, oy = (8 + 1.6) * m;
  for (let i = 7; i >= 0; i--) { g.fillStyle = ['#e9542f', '#f4efe6', '#e9542f', '#f4efe6', '#f08a2c', '#f4efe6', '#e9542f', '#f4efe6'][i]; g.beginPath(); g.arc(ox, oy, (0.35 + i * 0.32) * m, 0, 2 * Math.PI); g.fill(); }
  // wide orbit lines and dashed flight paths
  g.strokeStyle = 'rgba(140,170,255,0.55)'; g.lineWidth = 0.05 * m;
  for (const [cx, cy, rx, ry] of [[9, 7, 5.5, 3.2], [9, 7, 7.2, 4.6], [5, 12, 3.6, 2.2]]) { g.beginPath(); g.ellipse(cx * m, cy * m, rx * m, ry * m, 0.2, 0, 2 * Math.PI); g.stroke(); }
  g.setLineDash([0.18 * m, 0.14 * m]); g.strokeStyle = '#f4efe6'; g.lineWidth = 0.04 * m;
  g.beginPath(); g.moveTo(1 * m, 14.5 * m); g.bezierCurveTo(5 * m, 9 * m, 10 * m, 15 * m, 15 * m, 9 * m); g.stroke();
  g.beginPath(); g.moveTo(2 * m, 2 * m); g.bezierCurveTo(6 * m, 6 * m, 12 * m, 1 * m, 15.5 * m, 4.5 * m); g.stroke(); g.setLineDash([]);
  // planets on the floor
  planet(g, 12.6 * m, 12.4 * m, 0.7 * m, '#7fd0ff', '#2a5fb0');
  planet(g, 3.2 * m, 4.6 * m, 0.55 * m, '#ffd27a', '#d0702a', '#f4efe6');
  planet(g, 13.4 * m, 3.4 * m, 0.4 * m, '#c99cff', '#5a2aa0');
  planet(g, 6.8 * m, 14.6 * m, 0.32 * m, '#9ff0a0', '#2a8a4a');
  for (let i = 0; i < 260; i++) star(g, R() * S, R() * S, (0.03 + R() * 0.06) * m, R() < 0.8 ? '#ffffff' : '#ffd24a');
  return artFromCanvas(c, { edgeMax: 0.45 });
});

// ---- the mural (back wall): 2:1, nebula + ringed planet + rocket
export const muralArt = () => once('mural', () => {
  const W = 2048, H = 1024, [c, g] = cv(W, H), R = rng(88);
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#0e1236'); bg.addColorStop(0.5, '#25124a'); bg.addColorStop(1, '#0b2a4a'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  for (const [x, y, r, col] of [[600, 420, 420, 'rgba(200,60,160,0.35)'], [1400, 600, 520, 'rgba(40,160,200,0.30)'], [1000, 300, 300, 'rgba(255,140,60,0.22)']]) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  for (let i = 0; i < 520; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + R() * 0.6})`; g.beginPath(); g.arc(R() * W, R() * H, R() * 2.4 + 0.6, 0, 7); g.fill(); }
  for (let i = 0; i < 26; i++) star(g, R() * W, R() * H, 8 + R() * 14, R() < 0.7 ? '#ffffff' : '#ffd24a');
  planet(g, 1560, 330, 170, '#ffcf7a', '#c0502a', '#f2e6c8');
  planet(g, 380, 760, 110, '#8fe0ff', '#1e5aa8');
  planet(g, 980, 820, 60, '#d6b0ff', '#5a2aa0');
  // a cartoon rocket climbing to the right (white body, red fins, round blue window, orange flame); no lettering
  g.save(); g.translate(760, 430); g.rotate(0.55);
  g.fillStyle = '#ff9a2a'; g.beginPath(); g.moveTo(-34, 150); g.quadraticCurveTo(0, 260, 34, 150); g.fill();
  g.fillStyle = '#ffd24a'; g.beginPath(); g.moveTo(-20, 150); g.quadraticCurveTo(0, 215, 20, 150); g.fill();
  g.fillStyle = '#e0302a'; g.beginPath(); g.moveTo(-50, 60); g.lineTo(-95, 160); g.lineTo(-45, 140); g.fill(); g.beginPath(); g.moveTo(50, 60); g.lineTo(95, 160); g.lineTo(45, 140); g.fill();
  g.fillStyle = '#f4f2ee'; g.beginPath(); g.moveTo(0, -170); g.bezierCurveTo(70, -90, 60, 80, 50, 150); g.lineTo(-50, 150); g.bezierCurveTo(-60, 80, -70, -90, 0, -170); g.fill();
  g.fillStyle = '#e0302a'; g.beginPath(); g.moveTo(0, -170); g.bezierCurveTo(30, -140, 42, -110, 48, -90); g.lineTo(-48, -90); g.bezierCurveTo(-42, -110, -30, -140, 0, -170); g.fill();
  g.fillStyle = '#2a6ad8'; g.strokeStyle = '#9aa4b4'; g.lineWidth = 8; g.beginPath(); g.arc(0, -20, 30, 0, 7); g.fill(); g.stroke();
  g.restore();
  return artFromCanvas(c, { edgeMax: 0.6 });
});

// ---- the hanging planets (equirectangular, 2:1)
export const planetArt = (k) => once('planet_' + k, () => {
  const W = 1024, H = 512, [c, g] = cv(W, H), R = rng(k.length * 31);
  const bands = { violet: ['#3a1a7a', '#6a3ab0', '#8a5ad0', '#5a2a9a', '#b08ae8', '#4a2090'], ringed: ['#c0602a', '#e89a4a', '#f4d08a', '#d07a3a', '#f0b870'], moon: ['#b8bcc8', '#a4a8b4', '#c8ccd6'] }[k];
  const bh = H / (bands.length * 2);
  for (let i = 0; i < bands.length * 2; i++) { g.fillStyle = bands[i % bands.length]; g.fillRect(0, i * bh, W, bh + 1); }
  if (k !== 'moon') for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.05 + R() * 0.1})`; g.beginPath(); g.ellipse(R() * W, R() * H, 30 + R() * 90, 4 + R() * 10, 0, 0, 7); g.fill(); }
  else for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(70,74,86,0.35)'; g.beginPath(); g.arc(R() * W, R() * H, 6 + R() * 30, 0, 7); g.fill(); }
  if (k === 'violet') { g.fillStyle = 'rgba(255,180,240,0.55)'; g.beginPath(); g.ellipse(W * 0.62, H * 0.58, 70, 36, 0, 0, 7); g.fill(); }   // a "storm" spot
  return artFromCanvas(c, { edgeMax: 0.35 });
});

// ---- the boy's sweater: knit ground with small white stars (tiling, 0.12 m repeat); the chest motif is ONE decal
export const SWEATER_M = 0.12;
export const sweaterArt = () => once('sweater', () => {
  const S = 256, [c, g] = cv(S, S), R = rng(7);
  g.fillStyle = '#1f4a9a'; g.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 6) for (let x = 0; x < S; x += 6) { g.fillStyle = (x / 6 + y / 6) % 2 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.05)'; g.fillRect(x, y, 3, 6); }   // knit "v" texture
  for (const [x, y] of [[40, 50], [170, 30], [110, 140], [220, 190], [30, 210], [150, 240]]) star(g, x, y, 9 + R() * 3, '#f4f4f0');
  return repeatArt(artFromCanvas(c, { edgeMax: 0.25 }));
});
export const chestArt = () => once('chest', () => {   // transparent background: decalMesh drops empty cells
  const W = 512, H = 256, [c, g] = cv(W, H);
  planet(g, 150, 128, 58, '#f0d090', '#c07a3a', '#f4f2ee');                              // ONE ringed planet (left chest as worn)
  g.save(); g.translate(370, 128); g.rotate(0.5);                                       // ONE little rocket (right chest)
  g.fillStyle = '#ff9a2a'; g.beginPath(); g.moveTo(-14, 60); g.quadraticCurveTo(0, 100, 14, 60); g.fill();
  g.fillStyle = '#e0302a'; g.beginPath(); g.moveTo(-20, 20); g.lineTo(-40, 64); g.lineTo(-18, 56); g.fill(); g.beginPath(); g.moveTo(20, 20); g.lineTo(40, 64); g.lineTo(18, 56); g.fill();
  g.fillStyle = '#f4f2ee'; g.beginPath(); g.moveTo(0, -72); g.bezierCurveTo(30, -36, 26, 34, 20, 60); g.lineTo(-20, 60); g.bezierCurveTo(-26, 34, -30, -36, 0, -72); g.fill();
  g.fillStyle = '#e0302a'; g.beginPath(); g.moveTo(0, -72); g.bezierCurveTo(14, -58, 18, -46, 20, -38); g.lineTo(-20, -38); g.bezierCurveTo(-18, -46, -14, -58, 0, -72); g.fill();
  g.fillStyle = '#2a6ad8'; g.beginPath(); g.arc(0, -8, 11, 0, 7); g.fill();
  g.restore();
  return artFromCanvas(c, { edgeMax: 0.5 });
});

// ---- the girl's dress: pink with red strawberries (0.09 m repeat)
export const DRESS_M = 0.09;
export const dressArt = () => once('dress', () => {
  const S = 256, [c, g] = cv(S, S);
  g.fillStyle = '#f4b8c0'; g.fillRect(0, 0, S, S);
  const berry = (x, y, s) => { g.fillStyle = '#d8323a'; g.beginPath(); g.moveTo(x, y + 26 * s); g.bezierCurveTo(x - 22 * s, y + 8 * s, x - 18 * s, y - 14 * s, x, y - 12 * s); g.bezierCurveTo(x + 18 * s, y - 14 * s, x + 22 * s, y + 8 * s, x, y + 26 * s); g.fill();
    g.fillStyle = '#f6e27a'; for (const [dx, dy] of [[-7, 0], [6, -2], [0, 9], [-4, 16], [8, 10]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, 1.6 * s, 0, 7); g.fill(); }
    g.fillStyle = '#3a9a4a'; g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; g.ellipse(x + Math.cos(a) * 7 * s, y - 13 * s + Math.sin(a) * 4 * s, 7 * s, 2.6 * s, a, 0, 7); } g.fill(); };
  for (const [x, y] of [[64, 64], [192, 64], [0, 192], [128, 192], [256, 192]]) berry(x, y, 1.6);
  return repeatArt(artFromCanvas(c, { edgeMax: 0.3 }));
});

// ---- the play shuttle's skin (wrapped round the fuselage: u along the length, v round it; v = 0.5 is the side facing +z)
export const shuttleArt = () => once('shuttle', () => {
  const W = 2048, H = 512, [c, g] = cv(W, H);
  g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#1c1c22'; g.fillRect(0, 0, W, H * 0.18); g.fillRect(0, H * 0.82, W, H * 0.18);   // black belly tiles (underside, v ~ 0 / 1)
  g.strokeStyle = 'rgba(40,40,50,0.35)'; g.lineWidth = 3; for (let x = 128; x < W; x += 256) { g.beginPath(); g.moveTo(x, H * 0.18); g.lineTo(x, H * 0.82); g.stroke(); }   // panel seams
  g.fillStyle = '#2a6ad8'; g.fillRect(0, H * 0.62, W, 14); g.fillStyle = '#e9542f'; g.fillRect(0, H * 0.66, W, 10);   // a blue and an orange stripe low on the +z side
  return artFromCanvas(c, { edgeMax: 0.4 });
});
