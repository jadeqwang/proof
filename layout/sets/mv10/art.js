// mv10: canonical clothing decals (2026-11-26, Jade: "the same version of clothing logo should be in each frame (not 2
// different versions of the NASA meatball logo)"). Images: layout/assets/art/logos/<name>.png (+ .txt).
//   meatball  the NASA insignia (1959 "meatball", public-domain vector), Jade's jacket, left chest, disc 8 cm (ASSUMED)
//   sr71      the SR-71 planform tee print (dark grey on black, nose to the lower left; Jade), centre chest, 24 cm (ASSUMED)
// Prints are flattened onto the garment colour for the textures; their alpha cuts the decal's outline (sets/_art.js decalMesh).
import { loadArt, artFromCanvas, repeatArt } from '../_art.js';
export const LOGOS = await loadArt({
  meatball: ['/assets/art/logos/nasa_meatball.png', { bg: '#1b1b1e' }],
  sr71: ['/assets/art/logos/sr71_print.png', { bg: '#2a2a2e' }],
});
// the meatball's disc inside its image (NASA_logo.svg viewBox 110 x 92: disc centre (50.05, 45), r 40.14)
export const MEATBALL = { disc_m: 0.08, imgW: 110, imgH: 92, cx: 50.05, cy: 45, r: 40.14 };
export const SR71 = { w: 0.24, v: -0.17 };   // print width on the tee (m), its centre below the shoulder centre (m)

// 2026-11-28 (Jade, round 7): "the living room floor here is carpet, a kind of heathered oatmeal color". ONE fixed carpet
// (drawn in code, seeded, so it is identical in every shot): a cut-pile oatmeal ground (warm beige) heathered with
// cream and darker taupe-brown, in two scales: soft tonal clusters 1.5-5 cm across (what reads at guide resolution in the
// wide shots) and single-tuft flecks 2-6 mm (the close shots). 0.5 m repeat, 1024 px (0.5 mm per px). Colours, pile type
// and scale are OURS (ASSUMED). In line / contour it is a light grey stipple of the darker tufts (its own edge map), so it
// never reads as objects or seams. build.js maps it with worldUV on the living-room floor.
export const CARPET_M = 0.5;
export const CARPET_COL = 0xc4b394;   // its mean colour (oatmeal)
let carpet = null;
export function carpetArt() {
  if (carpet) return carpet;
  let s = 20101028; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const S = 1024, PX = S / CARPET_M / 1000, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  g.fillStyle = '#c6b596'; g.fillRect(0, 0, S, S);
  const dot = (x, y, r, col, a) => { g.globalAlpha = a; g.fillStyle = col; for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { g.beginPath(); g.ellipse(x + dx, y + dy, r, r * (0.6 + 0.4 * R()), R() * 3.14, 0, 7); g.fill(); } };
  // tonal clusters (heather): light and dark, 15-50 mm across, soft
  { const B = document.createElement('canvas'); B.width = B.height = 3 * S; const b = B.getContext('2d');   // drawn 3x3 tiled, blurred, centre cropped: seamless
    for (let i = 0; i < 260; i++) { const x = R() * S, y = R() * S, r = (7.5 + R() * 17.5) * PX, e = 0.6 + 0.4 * R(), rot = R() * 3.14, col = R() < 0.5 ? '#e4d8bf' : '#9c8566', a = 0.35 + R() * 0.3;
      b.globalAlpha = a; b.fillStyle = col; for (let dx = 0; dx < 3; dx++) for (let dy = 0; dy < 3; dy++) { b.beginPath(); b.ellipse(x + dx * S, y + dy * S, r, r * e, rot, 0, 7); b.fill(); } }
    const C = document.createElement('canvas'); C.width = C.height = 3 * S; const cg = C.getContext('2d'); cg.filter = `blur(${Math.round(4 * PX)}px)`; cg.drawImage(B, 0, 0);
    g.drawImage(C, S, S, S, S, 0, 0, S, S); }
  // single-tuft flecks: cream, taupe, a few dark brown, 2-6 mm
  // the line / contour stipple (its own edge map: Sobel of a heather is noise): white, with the darker tufts as light grey
  // dots, so the carpet reads as a fine even stipple up close and a pale grey tone far off; never a line or a shape
  const E = document.createElement('canvas'); E.width = E.height = S; const e = E.getContext('2d'); e.fillStyle = '#fff'; e.fillRect(0, 0, S, S);
  for (let i = 0; i < 9000; i++) { const t = R(), x = R() * S, y = R() * S, r = (1 + R() * 2) * PX, a = 0.45 + R() * 0.4;
    dot(x, y, r, t < 0.45 ? '#ece3cf' : t < 0.9 ? '#a48d6c' : '#6e5a42', a);
    if (t >= 0.45) { e.globalAlpha = 1; e.fillStyle = t < 0.9 ? '#b4b4b4' : '#8c8c8c'; for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { e.beginPath(); e.arc(x + dx, y + dy, r * 0.8, 0, 7); e.fill(); } } }
  g.globalAlpha = 1;
  carpet = repeatArt(artFromCanvas(c, { edgeCanvas: E })); return carpet;
}
