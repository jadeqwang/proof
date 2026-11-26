// The brick of the cavity's outer wall as ONE exact texture, drawn in code (no image model), at true brick size, so the
// guides carry the scale of everything in the cavity (r4b, Jade 2026-11-26: "please draw the brick texture into the wall
// so you can tell the distance of things").
// ASSUMED (flagged in NOTES): Dutch "Waalformaat" brick, the commonest Dutch format: 210 x 100 x 50 mm, laid in running
// (half) bond, 10 mm joints: a course every 60 mm, a stretcher every 220 mm. The wall is the same 1988 Chinese-Indonesian
// restaurant building as the attic (Netherlands; the neon sign reads CHIN. IND. SPEC. REST.). US modular (194 x 57 mm +
// 10 mm joints) would be the alternative if the wall is elsewhere: change BRICK below.
// Three textures via the shared sets/_art.js path: colour (lit), greys (flat / form) and a hand-drawn edge map (every joint
// as a dark line: line and contour guides), so every guide mode shows the same courses.
import { artFromCanvas } from '../_art.js';

export const BRICK = { format: 'Waalformaat (NL)', len: 210, h: 50, joint: 10, bond: 'running (half) bond', pxPerMm: 0.8 };
BRICK.course = BRICK.h + BRICK.joint; BRICK.pitch = BRICK.len + BRICK.joint;

// a small seeded random so the bricks' tones are the same in every shot
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const cache = new Map();
// w, h: the wall face in metres (u along +z from the closed end, v up from the floor)
export function brickArt(w, h) {
  const key = w + 'x' + h; if (cache.has(key)) return cache.get(key);
  const k = BRICK.pxPerMm, W = Math.round(w * 1000 * k), H = Math.round(h * 1000 * k), X = (mm) => mm * k;
  const mkC = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const c = mkC(), g = c.getContext('2d'), e = mkC(), eg = e.getContext('2d'), R = rng(1988);
  g.fillStyle = '#8f877c'; g.fillRect(0, 0, W, H);                    // mortar (lime-cement, grey)
  eg.fillStyle = '#ffffff'; eg.fillRect(0, 0, W, H);
  eg.strokeStyle = '#1e1e1e'; eg.lineWidth = Math.max(2, X(3));
  const courses = Math.ceil((h * 1000) / BRICK.course);
  for (let r = 0; r < courses; r++) {
    const y0mm = r * BRICK.course + BRICK.joint / 2, yTop = H - X(y0mm + BRICK.h);   // canvas y grows down; v = 0 is the floor
    const off = (r % 2) * (BRICK.pitch / 2);
    for (let x = -off; x < w * 1000; x += BRICK.pitch) {
      const x0 = Math.max(0, x + BRICK.joint / 2), x1 = Math.min(w * 1000, x + BRICK.joint / 2 + BRICK.len); if (x1 <= x0) continue;
      const t = R(), base = [112 + 26 * t, 58 + 16 * t, 44 + 10 * t];            // red-brown facing brick, each a little different
      g.fillStyle = `rgb(${base.map((v) => Math.round(v)).join(',')})`; g.fillRect(X(x0), yTop, X(x1 - x0), X(BRICK.h));
      g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(X(x0), yTop + X(BRICK.h) - X(6), X(x1 - x0), X(6));   // a darker lower arris
      eg.strokeRect(X(x0), yTop, X(x1 - x0), X(BRICK.h));
    }
  }
  const a = artFromCanvas(c, { edgeCanvas: e, src: 'code: layout/sets/wall88/brick.js (' + BRICK.format + ', ' + BRICK.len + ' x ' + BRICK.h + ' mm, ' + BRICK.joint + ' mm joints, ' + BRICK.bond + ')' });
  cache.set(key, a); return a;
}
