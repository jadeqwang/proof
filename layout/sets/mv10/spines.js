// mv10: fixed book spines (2026-11-26, background art fixed in the set), drawn in code (never by an image model).
//   The titles JADE NAMED (HANDOFF 2026-11-25: Fundamental Neuroscience, Principles of Neural Science, Nonlinear Dynamics
//   and Chaos, the Feynman Lectures, The Dragons of Eden, A Short History of Nearly Everything) carry their real title and
//   author as plain spine lettering. Every OTHER book in layout.js BOOKS is our placeholder: since Jade's r4 answer
//   (art_books, 2026-11-26: "Leave the rest blank") its spine is BLANK: its colour only, no lettering, no bars, no mark.
//   (Before: fixed "greeked" lettering bars.) The placeholder titles stay in layout.js only to size the books.
// spineArt(book, look, flat) -> ArtTex (sets/_art.js) for a plane on the book's front (spine) face.
//   Standing books: lettering runs top to bottom (US convention), title large, author smaller, a small rule at the foot.
//   Books lying flat: the same spine turned 90 degrees, so it reads left to right.
// Colours: the book's own colour from build.js (bookLook: OUR picks, not the real editions), lettering light on dark
// and dark on light. The Feynman Lectures keep their red. Fonts vary by title (serif / sans), as real spines do.
import { artFromCanvas } from '../_art.js';

const PX = 2600;   // pixels per metre along the spine
const hex = (c) => '#' + c.toString(16).padStart(6, '0');
const lumOf = (c) => (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255;
const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
const cache = new Map();
export const NAMED = /Fundamental Neuroscience|Principles of Neural Science|Nonlinear Dynamics and Chaos|Feynman Lectures|Dragons of Eden|Short History of Nearly Everything/;

function fitText(g, text, maxW, maxH, family, weight) {
  let size = Math.floor(maxH); g.font = `${weight} ${size}px ${family}`;
  while (size > 6 && g.measureText(text).width > maxW) { size -= 1; g.font = `${weight} ${size}px ${family}`; }
  return size;
}
export function spineArt(b, col) {
  const key = b.t + '|' + col; if (cache.has(key)) return cache.get(key);
  const L = Math.round(b.h * PX), T = Math.max(14, Math.round(b.w * PX));   // spine length (along the text) x thickness
  // draw horizontally (text along x), then rotate into a standing-spine canvas T wide x L tall
  const flatC = document.createElement('canvas'); flatC.width = L; flatC.height = T; const g = flatC.getContext('2d');
  const dark = lumOf(col) < 0.5, ink = /Feynman Lectures/.test(b.t) ? '#e8c86a' : dark ? '#f2ede0' : '#1c1a18';
  const serif = hash(b.t + 'f') < 0.5 || /art|literature/.test(b.kind || '');
  const family = serif ? '"Liberation Serif", "DejaVu Serif", serif' : '"Liberation Sans", "DejaVu Sans", sans-serif';
  g.fillStyle = hex(col); g.fillRect(0, 0, L, T);
  // edge wear: slightly darker head and foot bands
  g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(0, 0, L * 0.02, T); g.fillRect(L * 0.98, 0, L * 0.02, T);
  const title = (b.t || '').replace(/\s*\(.*?\)\s*/g, ' ').trim(), author = (b.a || '').replace(/[()]/g, '');
  const pad = T * 0.14, x0 = L * 0.05, aW = author ? L * 0.26 : 0, tW = L * (author ? 0.6 : 0.86);
  g.fillStyle = ink; g.textBaseline = 'middle'; g.textAlign = 'left';
  if (NAMED.test(b.t)) {
    fitText(g, title.toUpperCase(), tW, (T - 2 * pad) * 0.78, family, '700'); g.fillText(title.toUpperCase(), x0, T / 2);
    if (author) { const s = fitText(g, author, aW, (T - 2 * pad) * 0.55, family, '400'); g.font = `400 ${s}px ${family}`; g.textAlign = 'right'; g.fillText(author, L * 0.93, T / 2); }
    g.fillRect(L * 0.955, T * 0.3, L * 0.006, T * 0.4);   // a publisher's mark at the foot
  }
  // every other book: a BLANK spine, plain colour, no title, no bars, no mark (Jade r4, art_books: "Leave the rest blank")
  // the edge guide: lettering only, grey on white (line / contour show the words as text, not their outlines)
  const eC = document.createElement('canvas'); eC.width = L; eC.height = T; const eg = eC.getContext('2d'); eg.fillStyle = '#fff'; eg.fillRect(0, 0, L, T);
  eg.drawImage(flatC, 0, 0); const im = eg.getImageData(0, 0, L, T), bg = [(col >> 16) & 255, (col >> 8) & 255, col & 255];
  for (let i = 0; i < im.data.length; i += 4) { const d = Math.abs(im.data[i] - bg[0]) + Math.abs(im.data[i + 1] - bg[1]) + Math.abs(im.data[i + 2] - bg[2]);
    const v = d > 90 ? 110 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; }
  eg.putImageData(im, 0, 0);
  const rot = (src) => { const c = document.createElement('canvas'); c.width = T; c.height = L; const q = c.getContext('2d');
    q.translate(T, 0); q.rotate(Math.PI / 2); q.drawImage(src, 0, 0); return c; };   // text runs top -> bottom on a standing spine
  const a = artFromCanvas(rot(flatC), { edgeCanvas: rot(eC) }); a.flat = artFromCanvas(flatC, { edgeCanvas: eC });
  cache.set(key, a); return a;
}
