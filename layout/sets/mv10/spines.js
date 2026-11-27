// mv10: fixed book spines (2026-11-26, background art fixed in the set), drawn in code (never by an image model).
//   The titles JADE NAMED (HANDOFF 2026-11-25: Fundamental Neuroscience, Principles of Neural Science, Nonlinear Dynamics
//   and Chaos, the Feynman Lectures, The Dragons of Eden, A Short History of Nearly Everything) and the other textbooks of
//   cube 3,3 (Theoretical Neuroscience, Spikes, Molecular Biology of the Cell) carry their title and author as spine
//   lettering. Every OTHER book in layout.js BOOKS is our placeholder: since Jade's r4 answer (art_books, 2026-11-26:
//   "Leave the rest blank") its spine is BLANK: its colour only, no lettering, no bars, no mark.
// 2026-11-27 (Jade: "for all the textbooks, can you image search for them and match their spines to the real
//   textbooks? we're not reproducing the textbooks, just showing what it looks like"): each lettered spine below is a
//   LIKENESS of the real edition's spine design (edition, sources and what was seen vs inferred: NOTES.md 2026-11-27):
//   its colours, colour bands, lettering colour, font class (serif / sans / script, condensed or not), the order and
//   orientation of title / author / edition / publisher, and the publisher mark's POSITION, drawn as a plain generic
//   shape (circle, triangle, box), never the real logo. No cover art, no logos, no barcodes, no ISBNs. Fonts are the
//   system's URW base-35 / Liberation fonts (P052 ~ Palatino, C059 ~ Century, Z003 ~ chancery script, Nimbus / Liberation
//   Sans Narrow), the nearest free class to each real face, not the real typefaces.
// spineArt(book, col) -> ArtTex (sets/_art.js) for a plane on the book's front (spine) face; spineSpec(book) -> the spec
//   (box: the cover colour build.js gives the book's box).
//   Drawn on a "flat" canvas L (spine length, x = 0 at the HEAD) x T (thickness), then rotated so lettering that runs
//   along the spine reads top to bottom (US convention); lettering ACROSS the spine (stacked author names, "Fourth
//   Edition", the publisher's name) is drawn upright as on the real books. Books lying flat get the unrotated canvas.
// The edge guide (line / contour) gets the lettering and marks only: grey on white, colour bands as a faint tint.
import { artFromCanvas } from '../_art.js';

const PX = 2600;   // pixels per metre along the spine
const hex = (c) => '#' + c.toString(16).padStart(6, '0');
const cache = new Map();
const SERIF = '"P052", "Palatino Linotype", "DejaVu Serif", serif', CENTURY = '"C059", "Century Schoolbook", "DejaVu Serif", serif';
const SANS = '"Nimbus Sans", "Liberation Sans", "DejaVu Sans", sans-serif', NARROW = '"Nimbus Sans Narrow", "Liberation Sans Narrow", "DejaVu Sans Condensed", sans-serif';
const SCRIPT = '"Z003", "URW Chancery L", cursive', ROMAN = '"Nimbus Roman", "Liberation Serif", serif';

// ---- drawing helpers (flat canvas: x along the spine from the head, y across) --------------------------------------
// fit `s` into a box (len along x, hgt across), shrinking the cap height first, then condensing (sx >= cond), centred
function fit(g, s, len, hgt, font, weight, { cond = 1, track = 0, style = '' } = {}) {
  let size = Math.max(4, hgt); const f = (z) => `${style} ${weight} ${z}px ${font}`;
  const w = (z) => { g.font = f(z); return g.measureText(s).width + track * z * (s.length - 1); };
  let sx = Math.min(1, len / w(size));
  if (sx < cond) { sx = cond; while (size > 4 && w(size) * cond > len) size -= 0.5; }
  g.font = f(size); return { size, sx };
}
// text ALONG the spine: from x0 to x1 (align 'start' | 'center' | 'end'), centred across at yc, cap height ~hgt
function along(g, s, x0, x1, yc, hgt, font, weight, color, o = {}) {
  const { size, sx } = fit(g, s, x1 - x0, hgt, font, weight, o), track = (o.track || 0) * size;
  const w = (g.measureText(s).width + track * (s.length - 1)) * sx;
  const xs = o.align === 'end' ? x1 - w : o.align === 'center' ? (x0 + x1 - w) / 2 : x0;
  g.save(); g.translate(xs, yc); g.scale(sx, 1); g.fillStyle = color; g.textBaseline = 'middle'; g.textAlign = 'left';
  if (!track && !o.colors) g.fillText(s, 0, size * 0.04);
  else { let x = 0; for (let i = 0; i < s.length; i++) { g.fillStyle = (o.colors && o.colors[i]) || color; g.fillText(s[i], x, size * 0.04); x += g.measureText(s[i]).width + track; } }
  g.restore(); return w;
}
// small caps ALONG: capitals at hgt, lower-case letters as capitals at hgt * k
function smallCaps(g, s, x0, x1, yc, hgt, font, weight, color, k = 0.78) {
  const parts = [...s].map((ch) => ({ ch: ch.toUpperCase(), big: ch === ch.toUpperCase() }));
  const meas = (z) => parts.reduce((a, p) => { g.font = `${weight} ${p.big ? z : z * k}px ${font}`; return a + g.measureText(p.ch).width; }, 0);
  let z = hgt; while (z > 4 && meas(z) > x1 - x0) z -= 0.5;
  let x = (x0 + x1 - meas(z)) / 2; g.fillStyle = color; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  for (const p of parts) { g.font = `${weight} ${p.big ? z : z * k}px ${font}`; g.fillText(p.ch, x, yc + z * 0.36); x += g.measureText(p.ch).width; }
}
// lines ACROSS the spine (upright on the standing book), stacked down the spine from xTop, each line hgt tall
function across(g, T, lines, xTop, hgt, font, weight, color, { gap = 0.25, maxW = 0.8, cond = 0.7 } = {}) {
  let x = xTop; const z = Math.min(...lines.map((s) => fit(g, s, T * maxW, hgt, font, weight, { cond }).size));   // one size for the stack
  for (const s of lines) { const xc = x + hgt * 0.5; g.save(); g.translate(xc, T / 2); g.rotate(-Math.PI / 2);
    const size = z; g.font = `${weight} ${z}px ${font}`; const sx = Math.min(1, (T * maxW) / g.measureText(s).width);
    g.scale(sx, 1); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, size * 0.04); g.restore();
    x += hgt * (1 + gap); }
  return x;
}
const rule = (g, x, T, w, color, span = 0.7) => { g.fillStyle = color; g.fillRect(x - w / 2, T * (1 - span) / 2, w, T * span); };
// plain generic publisher marks (position only, never the real logo)
function markCircle(g, xc, T, r, color, lw = 0.08) { g.strokeStyle = color; g.lineWidth = r * lw * 2; g.beginPath(); g.arc(xc, T / 2, r, 0, 2 * Math.PI); g.stroke(); }
function markTriangle(g, xc, T, r, color) { g.fillStyle = color; g.beginPath(); g.moveTo(xc + r * 0.8, T / 2 + r * 0.95); g.lineTo(xc - r * 0.9, T / 2); g.lineTo(xc + r * 0.8, T / 2 - r * 0.95); g.closePath(); g.fill(); }
function markBox(g, xc, T, r, color) { g.strokeStyle = color; g.lineWidth = r * 0.16; g.strokeRect(xc - r, T / 2 - r, 2 * r, 2 * r); }

// ---- the spines -------------------------------------------------------------------------------------------------
// Each: box = the cover colour (the book's box), bg = the spine ground, draw(g, L, T, P) with P = the palette in use
// (P.c(role, hex) returns the colour, or the edge-guide grey / white).
const SPEC = [
  { re: /Feynman Lectures/,          // the classic Addison-Wesley red cloth hardcover (1963-65, reprinted into the 1980s)
    box: 0xae3322, bg: 0xae3322,
    draw(g, L, T, P, b) {
      const cream = P.ink('#efe4c8'), gold = P.ink('#d8a83c'), vol = (b.t.match(/Vol\.\s*([IV]+)/) || [])[1] || 'I';
      across(g, T, ['FEYNMAN', 'LEIGHTON', 'SANDS'], L * 0.025, L * 0.026, NARROW, '400', cream, { gap: 0.35, maxW: 0.78 });
      along(g, 'The Feynman', L * 0.16, L * 0.33, T * 0.5, T * 0.56, SCRIPT, '400', gold, { cond: 0.8 });
      along(g, 'LECTURES ON PHYSICS', L * 0.355, L * 0.70, T * 0.5, T * 0.62, NARROW, '400', cream, { cond: 0.75, track: 0.06 });
      rule(g, L * 0.73, T, L * 0.004, gold, 0.8);
      across(g, T, ['VOLUME', vol], L * 0.75, L * 0.022, NARROW, '400', gold, { gap: 0.3, maxW: 0.7 });
      markTriangle(g, L * 0.875, T, T * 0.16, cream);
      across(g, T, ['ADDISON', 'WESLEY'], L * 0.905, L * 0.017, NARROW, '700', cream, { gap: 0.2, maxW: 0.72 });
    } },
  { re: /Principles of Neural Science/,   // 4th ed., McGraw-Hill 2000: blue-black, blue hippocampus mottle, cream serif
    box: 0x1d2338, bg: 0x1d2338,
    draw(g, L, T, P, b) {
      const cream = P.ink('#ece6d6'), blob = P.tex('#34467e');
      g.save(); g.globalAlpha = 0.35; g.fillStyle = blob;   // the cover's blue tissue image, as a fine mottle (no copy of it)
      for (let i = 0; i < 160; i++) { const r = h01(b.t + i), r2 = h01(b.t + 'y' + i), r3 = h01(b.t + 'r' + i);
        g.beginPath(); g.ellipse(L * r, T * r2, T * (0.06 + 0.22 * r3), T * (0.03 + 0.1 * r3), r * 9, 0, 2 * Math.PI); g.fill(); }
      g.restore();
      across(g, T, ['Kandel', 'Schwartz', 'Jessell'], L * 0.025, L * 0.028, SERIF, '400', cream, { gap: 0.18, maxW: 0.8 });
      along(g, 'PRINCIPLES OF', L * 0.19, L * 0.72, T * 0.31, T * 0.33, SERIF, '400', cream, { cond: 0.72, align: 'start' });
      along(g, 'NEURAL SCIENCE', L * 0.19, L * 0.72, T * 0.69, T * 0.33, SERIF, '400', cream, { cond: 0.72, align: 'start' });
      across(g, T, ['Fourth', 'Edition'], L * 0.77, L * 0.026, SERIF, '400', cream, { gap: 0.15, maxW: 0.75 });
      markCircle(g, L * 0.925, T, T * 0.15, cream);
    } },
  { re: /Fundamental Neuroscience/,       // 3rd ed., Academic Press / Elsevier 2008: the cover's indigo title band, white serif
    box: 0x2b2768, bg: 0x2b2768,
    draw(g, L, T, P) {
      const white = P.ink('#f4f2ee'), yellow = P.ink('#efcf4a');
      along(g, 'Fundamental Neuroscience', L * 0.05, L * 0.6, T * 0.5, T * 0.5, CENTURY, '400', white, { cond: 0.8 });
      along(g, 'Third Edition', L * 0.62, L * 0.75, T * 0.5, T * 0.3, CENTURY, '400', yellow, { cond: 0.85 });
      along(g, 'Squire · Berg · Bloom · du Lac · Ghosh · Spitzer', L * 0.77, L * 0.9, T * 0.5, T * 0.2, CENTURY, '400', white, { cond: 0.7 });
      markCircle(g, L * 0.95, T, T * 0.14, white);
    } },
  { re: /Theoretical Neuroscience/,       // MIT Press paperback 2005: black, gold serif caps title, white authors
    box: 0x0d0d0d, bg: 0x0d0d0d,
    draw(g, L, T, P) {
      const gold = P.ink('#ddb94a'), white = P.ink('#efefea');
      along(g, 'THEORETICAL NEUROSCIENCE', L * 0.05, L * 0.62, T * 0.5, T * 0.46, SERIF, '400', gold, { cond: 0.72 });
      along(g, 'Dayan and Abbott', L * 0.66, L * 0.88, T * 0.5, T * 0.42, SERIF, '400', white, { cond: 0.8 });
      markBox(g, L * 0.94, T, T * 0.17, white);
    } },
  { re: /Nonlinear Dynamics and Chaos/,   // Westview (Perseus) paperback: pale yellow, red head band, navy serif small caps
    box: 0xefe4a2, bg: 0xefe4a2,
    draw(g, L, T, P) {
      const navy = P.ink('#1e2150'), red = P.band('#c62a2c'), redInk = P.ink('#c62a2c');
      g.fillStyle = red; g.fillRect(0, 0, L * 0.055, T);
      smallCaps(g, 'STROGATZ', L * 0.075, L * 0.22, T * 0.5, T * 0.42, SERIF, '400', navy);
      smallCaps(g, 'Nonlinear Dynamics', L * 0.26, L * 0.76, T * 0.3, T * 0.4, SERIF, '400', navy, 0.74);
      smallCaps(g, 'and Chaos', L * 0.26, L * 0.5, T * 0.72, T * 0.4, SERIF, '400', navy, 0.74);
      rule(g, L * 0.835, T, L * 0.003, redInk, 0.55);
      markCircle(g, L * 0.875, T, T * 0.18, navy);
      across(g, T, ['Westview'], L * 0.915, L * 0.022, SERIF, '400', navy, { maxW: 0.82 });
    } },
  { re: /Spikes/,                          // MIT Press paperback 1999: black, white spaced sans caps, the green "I"
    box: 0x050505, bg: 0x050505,
    draw(g, L, T, P) {
      const white = P.ink('#f2f2f2'), green = P.ink('#3fdc3a');
      along(g, 'SPIKES', L * 0.06, L * 0.32, T * 0.5, T * 0.5, SANS, '700', white, { track: 0.5, colors: [null, null, green] });
      along(g, 'EXPLORING THE NEURAL CODE', L * 0.36, L * 0.6, T * 0.5, T * 0.2, SANS, '400', white, { track: 0.18, cond: 0.8 });
      along(g, 'Rieke · Warland · de Ruyter van Steveninck · Bialek', L * 0.64, L * 0.88, T * 0.5, T * 0.26, SANS, '400', white, { cond: 0.7 });
      markBox(g, L * 0.94, T, T * 0.17, white);
    } },
  { re: /Molecular Biology of the Cell/,  // 5th ed., Garland Science 2008: crimson, pale pink condensed sans, gold edition
    box: 0xd22a45, bg: 0xd22a45,
    draw(g, L, T, P) {
      const pink = P.ink('#f6d2d4'), gold = P.ink('#f2c440');
      along(g, 'Molecular Biology of', L * 0.035, L * 0.3, T * 0.24, T * 0.24, NARROW, '400', pink, { cond: 0.8 });
      along(g, 'THE CELL', L * 0.035, L * 0.5, T * 0.62, T * 0.56, NARROW, '400', pink, { cond: 0.7 });
      across(g, T, ['BRUCE ALBERTS', 'ALEXANDER JOHNSON', 'JULIAN LEWIS', 'MARTIN RAFF', 'KEITH ROBERTS', 'PETER WALTER'], L * 0.55, L * 0.016, NARROW, '400', pink, { gap: 0.55, maxW: 0.82 });
      markCircle(g, L * 0.845, T, T * 0.14, pink);
      across(g, T, ['Garland Science'], L * 0.875, L * 0.016, NARROW, '400', pink, { maxW: 0.75 });
      across(g, T, ['Fifth Edition'], L * 0.925, L * 0.024, SANS, '700', gold, { maxW: 0.85 });
    } },
  { re: /Dragons of Eden/,                 // Ballantine mass-market (the red 1980s-2000s cover): red, yellow condensed serif
    box: 0xe2221c, bg: 0xe2221c,
    draw(g, L, T, P) {
      const yellow = P.ink('#ffd21c'), white = P.ink('#fbf3e6');
      markCircle(g, L * 0.05, T, T * 0.2, white);
      along(g, 'THE DRAGONS OF EDEN', L * 0.11, L * 0.66, T * 0.5, T * 0.66, ROMAN, '400', yellow, { cond: 0.55 });
      along(g, 'CARL SAGAN', L * 0.7, L * 0.92, T * 0.5, T * 0.5, ROMAN, '400', yellow, { cond: 0.6 });
    } },
  { re: /Short History of Nearly Everything/,   // Broadway Books trade paperback 2004: blue-violet, white spaced serif
    box: 0x2c2c68, bg: 0x2c2c68,
    draw(g, L, T, P) {
      const white = P.ink('#f3f1ea'), yellow = P.ink('#f0c43a');
      along(g, 'BILL BRYSON', L * 0.05, L * 0.4, T * 0.5, T * 0.44, SERIF, '400', white, { track: 0.22 });
      along(g, '*', L * 0.45, L * 0.47, T * 0.42, T * 0.4, SERIF, '700', yellow);
      along(g, 'A Short History of Nearly Everything', L * 0.48, L * 0.88, T * 0.5, T * 0.32, SERIF, '400', white, { cond: 0.8 });
      markBox(g, L * 0.94, T, T * 0.15, white);
    } },
];
function h01(s) { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; }
export const spineSpec = (b) => SPEC.find((s) => s.re.test(b.t || '')) || null;
export const NAMED = new RegExp(SPEC.map((s) => s.re.source).join('|'));

// palettes: colour, and the edge guide (lettering and marks grey, bands a faint tint, the ground and textures white)
const COLOUR = { ink: (c) => c, band: (c) => c, tex: (c) => c, bg: (c) => c };
const EDGE = { ink: () => '#6e6e6e', band: () => '#e4e4e4', tex: () => '#ffffff', bg: () => '#ffffff' };

export function spineArt(b, col) {
  const key = b.t + '|' + col; if (cache.has(key)) return cache.get(key);
  const L = Math.round(b.h * PX), T = Math.max(14, Math.round(b.w * PX));   // spine length (along the text) x thickness
  const S = spineSpec(b);
  const paint = (P) => { const c = document.createElement('canvas'); c.width = L; c.height = T; const g = c.getContext('2d');
    g.fillStyle = P.bg(hex(S ? S.bg : col)); g.fillRect(0, 0, L, T);
    if (S) S.draw(g, L, T, P, b);
    // every other book: a BLANK spine, plain colour, no title, no bars, no mark (Jade r4, art_books: "Leave the rest blank")
    if (P === COLOUR) { g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(0, 0, L * 0.012, T); g.fillRect(L * 0.988, 0, L * 0.012, T); }   // edge wear at head and foot
    return c; };
  const flatC = paint(COLOUR), eC = paint(EDGE);
  const rot = (src) => { const c = document.createElement('canvas'); c.width = T; c.height = L; const q = c.getContext('2d');
    q.translate(T, 0); q.rotate(Math.PI / 2); q.drawImage(src, 0, 0); return c; };   // text runs top -> bottom on a standing spine
  const a = artFromCanvas(rot(flatC), { edgeCanvas: rot(eC) }); a.flat = artFromCanvas(flatC, { edgeCanvas: eC });
  cache.set(key, a); return a;
}
