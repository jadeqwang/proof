// shanghai86: the room's wall art and the book spines as FIXED textures (2026-11-26; Jade: background art goes into the
// 3D model so the painters stop inventing it between shots). Images: layout/assets/art/shanghai86/<name>.png (+ .txt).
//   painting      the one large framed traditional painting (Jade: "one large framed traditional Chinese artwork"):
//                 its SUBJECT IS INVENTED (a shan-shui landscape), Codex image sh_painting.png
//   scrolls       the three calligraphy hanging scrolls (Jade: "calligraphy scrolls on the west wall"), drawn in code
//                 with REAL public-domain texts (INVENTED choice): a couplet from Wang Bo's poem
//                 (海内存知己 / 天涯若比邻) on the outer two, 宁静致远 (Zhuge Liang, 诫子书) in the middle
//   calendar      a December 1986 wall calendar (an agent invention, kept): Codex photo + a real Dec 1986 grid in code
//   clock         a plain clock face (an agent invention, kept), drawn in code, 9:30 (the scene's time)
//   spineArt(i, col)  shared greeked spine textures for the north-wall bookshelves (no readable titles: none are known)
import { loadArt, artFromCanvas, clockArt } from '../_art.js';

export const ART_TEX = await loadArt({ painting: ['/assets/art/shanghai86/sh_painting.png', { edgeBlur: 3, edgeMax: 0.75 }], calPhoto: '/assets/art/shanghai86/sh_calendar_photo.png' });
const CJK = '"Droid Sans Fallback", "Noto Sans CJK SC", sans-serif';

// a hanging scroll 0.42 x 1.5 m: pale silk mount (wide heaven band at the top, earth band below), paper, one column of
// large characters, a small signature column and a red seal
export function scrollArt(text, sig = '') {
  const W = 420, H = 1500, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#c9c2a8'; g.fillRect(0, 0, W, H);                       // silk mount
  const px = 46, py0 = 250, py1 = H - 150; g.fillStyle = '#efe7d2'; g.fillRect(px, py0, W - 2 * px, py1 - py0);   // paper
  g.fillStyle = '#b8ae90'; g.fillRect(0, 70, W, 8); g.fillRect(0, py0 - 30, W, 6);   // the two thin bands (惊燕 style)
  const n = [...text].length, cell = Math.min((py1 - py0 - 120) / n, (W - 2 * px) * 0.78);
  g.fillStyle = '#141210'; g.font = `${Math.round(cell * 0.86)}px ${CJK}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  [...text].forEach((ch, i) => g.fillText(ch, W / 2 + (sig ? 18 : 0), py0 + 60 + cell * (i + 0.5)));
  if (sig) { g.font = `30px ${CJK}`; [...sig].forEach((ch, i) => g.fillText(ch, px + 34, py0 + 120 + n * cell * 0.55 + i * 34)); }
  g.fillStyle = '#b3241c'; g.fillRect(px + 18, py1 - 120, 34, 34); g.fillStyle = '#efe7d2'; g.font = `24px ${CJK}`; g.fillText('印', px + 35, py1 - 103);
  return artFromCanvas(c);
}
// Round-4 decisions (Jade): only TWO scrolls, on the hall half of the west wall: the Wang Bo couplet pair. Facing the west wall
// the more northerly (more negative z) one is on your right, and the first line of a couplet hangs on the right. The middle
// scroll (宁静致远) is dropped; its signature 丙寅冬 moves to the left (second) line, where a couplet is signed.
export const scrollTextFor = (i) => [['海内存知己', ''], ['天涯若比邻', '丙寅冬']][i];   // i = 0: northern (right), 1: southern (left)

// December 1986 (1 Dec = Monday), Sunday first, Sundays red; the photo above
export function calendarArt() {
  const W = 360, H = 520, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f4efe2'; g.fillRect(0, 0, W, H);
  const ph = Math.round(H * 0.62), P = ART_TEX.calPhoto;
  if (P) g.drawImage(P.art.image, 0, 0, W, ph); else { g.fillStyle = '#7a9aa0'; g.fillRect(0, 0, W, ph); }
  g.fillStyle = '#b3241c'; g.font = `bold 34px ${CJK}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('12', 16, ph + 28);
  g.font = `20px ${CJK}`; g.fillStyle = '#222'; g.fillText('一九八六年 十二月', 70, ph + 28);
  const top = ph + 56, cw = (W - 20) / 7, rh = (H - top - 8) / 6, wd = '日一二三四五六';
  g.textAlign = 'center'; g.font = `16px ${CJK}`; [...wd].forEach((d, i) => { g.fillStyle = i === 0 ? '#b3241c' : '#333'; g.fillText(d, 10 + cw * (i + 0.5), top + rh * 0.5); });
  g.font = 'bold 18px "Liberation Sans", sans-serif';
  for (let d = 1; d <= 31; d++) { const k = d + 0, col = (k) % 7, row = Math.floor(k / 7); g.fillStyle = col === 0 ? '#b3241c' : '#222'; g.fillText(String(d), 10 + cw * (col + 0.5), top + rh * (row + 1.5)); }
  return artFromCanvas(c);
}
export const clockFace = () => clockArt({ hh: 9, mm: 30, ss: null, face: '#efe9d8', bezel: '#5a3a26' });

// greeked spines for the glazed shelves: cloth colour, a paper title label with character-like marks, gilt bands
const spines = new Map();
export function spineArt(i, col) {
  const key = col + ':' + (i % 3); if (spines.has(key)) return spines.get(key);
  const W = 40, H = 300, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#' + col.toString(16).padStart(6, '0'); g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(214,184,110,0.9)'; for (const y of [12, 20, H - 22]) g.fillRect(3, y, W - 6, 3);
  const v = i % 3, ly = 34, lh = [150, 120, 170][v];
  if (v !== 1) { g.fillStyle = '#d8cfb4'; g.fillRect(10, ly, W - 20, lh); g.fillStyle = '#2a2420'; } else g.fillStyle = 'rgba(214,184,110,0.95)';
  for (let k = 0, y = ly + 10; y < ly + lh - 12; k++, y += 17) g.fillRect(15 + ((k * 7) % 3), y, W - 30 - ((k * 5) % 4), 8);   // character-sized marks, no real text
  const a = artFromCanvas(c); spines.set(key, a); return a;
}
