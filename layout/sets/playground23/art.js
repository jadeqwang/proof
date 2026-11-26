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
//   bodyArt()      the play shuttle's body + nose skin (r5, to Jade's photo): white, black belly, windscreen band, chin
import { artFromCanvas, repeatArt } from '../_art.js';
import { SHUTTLE } from './layout.js';

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
// ---- the play shuttle body + nose skin (r5, to Jade's photo): u along x (bodyU), v round the section (0 / 1 the
// bottom centre, 0.25 the +z side, 0.5 the top; painted symmetric about the top so either side reads the same).
// White padded vinyl, a black belly band, a black wrap-round windscreen band of four slanted panes on the nose, a black
// chin, faint panel seams. No text, no flag, no logo.
export const bodyU = (x) => (x - SHUTTLE.x0) / (SHUTTLE.x1 + SHUTTLE.nose - SHUTTLE.x0);
export const bodyArt = () => once('shuttleBody', () => {
  const W = 2048, H = 512, [c, g] = cv(W, H), uN = bodyU(SHUTTLE.x1), U = (t) => W * (uN + (1 - uN) * t);
  g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(60,60,70,0.35)'; g.lineWidth = 3;
  for (let x = SHUTTLE.x0 + 0.5; x < SHUTTLE.x1 + 0.2; x += 0.5) { const u = bodyU(x) * W; g.beginPath(); g.moveTo(u, H * 0.1); g.lineTo(u, H * 0.9); g.stroke(); }
  g.fillStyle = '#18181c'; g.fillRect(0, 0, W, H * 0.09); g.fillRect(0, H * 0.91, W, H * 0.09);            // belly band
  // the chin: black under the nose tip, rising toward the tip
  g.beginPath(); g.moveTo(U(0.62), 0); g.lineTo(W, 0); g.lineTo(W, H * 0.3); g.lineTo(U(0.8), H * 0.2); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(U(0.62), H); g.lineTo(W, H); g.lineTo(W, H * 0.7); g.lineTo(U(0.8), H * 0.8); g.closePath(); g.fill();
  // the windscreen band: over the top of the nose, from side to side, its ends slanted back
  const u0 = U(0.2), u1 = U(0.52), v0 = H * 0.3, v1 = H * 0.7, sl = (u1 - u0) * 0.35;
  g.beginPath(); g.moveTo(u0 + sl, v0); g.lineTo(u1, v0 + 0.04 * H); g.lineTo(u1, v1 - 0.04 * H); g.lineTo(u0 + sl, v1); g.lineTo(u0, H * 0.5); g.closePath(); g.fill();
  g.strokeStyle = '#f2f2ee'; g.lineWidth = 9;   // the pane frames: slanted white bars across the band
  for (const v of [0.4, 0.6]) { g.beginPath(); g.moveTo(u0 - 10, H * v); g.lineTo(u1 + 10, H * (v + (v < 0.5 ? -0.03 : 0.03))); g.stroke(); }
  g.beginPath(); g.moveTo(u0 + (u1 - u0) * 0.45, v0); g.lineTo(u0 + (u1 - u0) * 0.6, v1); g.stroke();
  return artFromCanvas(c, { edgeMax: 0.4 });
});

// ---- Dad's hair in 2023 (r5, Jade: "a bit more salt-and-pepper now and white at the temples"; otherwise as his photo:
// full, swept up and back, side part, short sides). One canonical skin mapped round his head (build.js dadHair) as a
// cap: u = azimuth round the head's up axis (0.5 = straight ahead, 0.25 / 0.75 = his sides), v = 1 at the crown down to
// 0 at 135 deg from it. Near-black overall with fine, short, scattered grey and white single-strand flecks (no streaks),
// a little greyer low on the sides and back; white only at the temples and sideburns, above and in front of the ears.
// r5 fix (lead): the first mapping clamped everything above the brow to one texture row, so the flecks were stretched
// into bright radiating stripes; now the whole cap has its own texture area. No edge map (flecks stay out of line).
export const dadHairArt = () => once('dadHair6', () => {
  const W = 2048, H = 1024, [c, g] = cv(W, H), R = rng(67);
  g.fillStyle = '#1e1b19'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90000; i++) {
    const u = R(), v = R(), a = Math.abs(u - 0.5) * 360;               // deg from the front
    const side = Math.min(1, Math.max(0, (a - 40) / 60)), low = Math.min(1, Math.max(0, (0.6 - v) / 0.4));
    if (R() > 0.07 + 0.09 * side * low) continue;
    const L = 120 + Math.floor(R() * 110); g.fillStyle = `rgb(${L},${L},${L - 3})`;
    g.fillRect(u * W, (1 - v) * H, 1 + R() * 1.5, 1 + R() * 1.5);
  }
  // the temples / sideburns: white, in front of and above each ear (azimuth ~56 deg, ~60-95 deg below the crown)
  for (const sd of [-1, 1]) { const ux = (0.5 + sd * 0.145) * W, vy = (1 - 0.47) * H, gr = g.createRadialGradient(ux, vy, 4, ux, vy, W * 0.1);
    gr.addColorStop(0, 'rgba(240,238,232,1)'); gr.addColorStop(0.6, 'rgba(222,220,214,0.85)'); gr.addColorStop(1, 'rgba(200,198,192,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(ux, vy, W * 0.085, H * 0.24, 0, 0, 2 * Math.PI); g.fill(); }
  const e = document.createElement('canvas'); e.width = 8; e.height = 8; const eg = e.getContext('2d'); eg.fillStyle = '#ffffff'; eg.fillRect(0, 0, 8, 8);
  return artFromCanvas(c, { edgeCanvas: e });
});

// ---- Jade's sleeve patch (r5 fix, lead: the patch painted into the jacket chart mapped as a heart on the bent arm): one
// canonical decal, a small round blank patch with a black ring, laid on the sleeve by build.js sleevePatch (transparent
// outside the circle, so it conforms as a circle)
export const sleevePatchArt = () => once('sleevePatch', () => {
  const S = 256, [c, g] = cv(S, S);
  g.fillStyle = '#141416'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.48, 0, 2 * Math.PI); g.fill();
  g.fillStyle = '#f2f0ea'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.38, 0, 2 * Math.PI); g.fill();
  return artFromCanvas(c, { edgeMax: 0.5 });
});

// ---- the two kids' water bottles in Dad's backpack side pockets (r5, Jade): ONE canonical decal each, wrapped round
// the bottle (u round, v up). No logo, no character, no lettering.
// pixelBottleArt(): black and green with a blocky pixel-block pattern (Jade's "Minecraft" bottle: only the colours and a
//   pixel-block texture; no trademarked logo or character).
// catBottleArt(): pink with one generic cartoon cat face (round head, two triangle ears, dot eyes, whiskers).
export const pixelBottleArt = () => once('pixelBottle', () => {
  const W = 512, H = 512, [c, g] = cv(W, H), R = rng(1709), n = 16, s = W / n;
  const greens = ['#1f7a2a', '#2f9a35', '#4cb648', '#176020', '#5fcf4f', '#2a8a30'];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const blackBand = j < 4 || j >= n - 2;
    g.fillStyle = blackBand ? (R() < 0.25 ? '#2a2a2a' : '#121212') : greens[Math.floor(R() * greens.length)]; g.fillRect(i * s, j * s, s, s); }
  return artFromCanvas(c, { edgeMax: 0.3 });
});
export const catBottleArt = () => once('catBottle', () => {
  const W = 512, H = 512, [c, g] = cv(W, H);
  g.fillStyle = '#f49ac2'; g.fillRect(0, 0, W, H);
  const cx = W * 0.5, cy = H * 0.55, r = W * 0.15;   // one cat face on the front (u 0.5)
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - r * 0.95, cy - r * 0.35); g.lineTo(cx - r * 0.7, cy - r * 1.35); g.lineTo(cx - r * 0.2, cy - r * 0.85); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(cx + r * 0.95, cy - r * 0.35); g.lineTo(cx + r * 0.7, cy - r * 1.35); g.lineTo(cx + r * 0.2, cy - r * 0.85); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(cx, cy, r, r * 0.85, 0, 0, 2 * Math.PI); g.fill();
  g.fillStyle = '#2a1a22'; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * r * 0.38, cy - r * 0.1, r * 0.1, 0, 2 * Math.PI); g.fill(); }
  g.fillStyle = '#e8507a'; g.beginPath(); g.moveTo(cx - r * 0.1, cy + r * 0.18); g.lineTo(cx + r * 0.1, cy + r * 0.18); g.lineTo(cx, cy + r * 0.3); g.closePath(); g.fill();
  g.strokeStyle = '#2a1a22'; g.lineWidth = 4; for (const s of [-1, 1]) for (const d of [-0.12, 0.08]) { g.beginPath(); g.moveTo(cx + s * r * 0.3, cy + r * (0.28 + d)); g.lineTo(cx + s * r * 1.15, cy + r * (0.22 + d * 2)); g.stroke(); }
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H * 0.08);   // a white band at the top (under the lid)
  return artFromCanvas(c, { edgeMax: 0.3 });
});

// ---- Jade in 2023 (r5, Jade: "you can have me wearing the rare earth outfit": her chaosmonkey-video outfit, canon in
// inputs/refs_chaosmonkey/CANON.md "Jade (v3)" and jade/jade_A_turnaround_v3.jpg). ONE canonical chart for her torso
// and trouser garments (build.js jadeOutfit maps it): u = angle round her torso axis (0.5 = her front, 0.75 her left,
// 0 / 1 her back), v = height along the torso axis from 0.6 m below the hip joint (0) to 0.75 m above it (1).
// A cropped white racer jacket ending above the navel, worn open over a black mock-neck top (the front strip); bare
// midriff; one orange band across the chest and round each upper arm at the same height; a small pale-blue dot on her
// left chest; on the back a large pale-blue circle (BLANK: the turnaround shows no lettering on it); on her left sleeve
// a small round blank patch with a black ring; wide navy cargo trousers, black waistband, orange straps hanging on the
// outer and front thighs. hs = her shoulder height above the hip joint along the axis (m).
export const JADE_CHART = { h0: -0.6, h1: 0.75 };
export const jadeOutfitArt = (hs) => once('jadeOutfit2' + hs.toFixed(3), () => {
  const W = 2048, H = 1024, [c, g] = cv(W, H), V = (h) => (1 - (h - JADE_CHART.h0) / (JADE_CHART.h1 - JADE_CHART.h0)) * H, U = (a) => (0.5 + a / (2 * Math.PI)) * W;
  const rect = (a0, a1, h0, h1, col) => { g.fillStyle = col; g.fillRect(U(a0), V(h1), U(a1) - U(a0), V(h0) - V(h1)); };
  const hem = 0.2, top = 0.17, belt = 0.1;   // jacket hem, the black top's hem, the trousers' waistband top (m above the hip joint)
  rect(-Math.PI, Math.PI, JADE_CHART.h0, JADE_CHART.h1, '#f2f0ea');                       // jacket white
  rect(-Math.PI, Math.PI, JADE_CHART.h0, belt, '#232a52');                                 // navy trousers
  rect(-Math.PI, Math.PI, belt - 0.035, belt, '#141416');                                  // black waistband
  rect(-Math.PI, Math.PI, belt, hem, '#e3b692');                                           // bare midriff
  rect(-0.42, 0.42, top, hs, '#151517');                                                   // the black mock-neck top (jacket open)
  rect(-0.42, 0.42, belt, top, '#e3b692');
  // orange straps on the trousers: front thighs (a ~ +-0.35) and outer thighs (a ~ +-1.55), from the belt to the knee
  for (const a of [-1.55, -0.35, 0.35, 1.55]) rect(a - 0.07, a + 0.07, belt - 0.55, belt - 0.02, '#e8792c');
  for (const a of [-1.55, -0.35, 0.35, 1.55]) rect(a - 0.09, a + 0.09, belt - 0.2, belt - 0.17, '#141416');   // the black buckles
  // the orange band across the chest and round both arms, the same height; broken by the open front
  const bh = hs - 0.13; rect(-Math.PI, -0.42, bh - 0.018, bh + 0.018, '#e8792c'); rect(0.42, Math.PI, bh - 0.018, bh + 0.018, '#e8792c');
  // the small pale-blue dot on her left chest (her left = +a)
  g.fillStyle = '#8fb0dc'; g.beginPath(); g.ellipse(U(0.62), V(bh + 0.07), 0.025 / 0.14 * W / (2 * Math.PI), 0.025 / (JADE_CHART.h1 - JADE_CHART.h0) * H, 0, 0, 2 * Math.PI); g.fill();
  // the large pale-blue circle on the back (centred a = pi: both chart edges), radius 0.085 m, centre above the band
  for (const ux of [0, W]) { g.beginPath(); g.ellipse(ux, V(bh + 0.06), 0.085 / 0.13 * W / (2 * Math.PI), 0.085 / (JADE_CHART.h1 - JADE_CHART.h0) * H, 0, 0, 2 * Math.PI); g.fill(); }
  // (the sleeve patch is its own decal now: sleevePatchArt)
  return artFromCanvas(c, { edgeMax: 0.4 });
});
