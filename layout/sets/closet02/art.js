// closet02: the navy plaid blanket on the futon as ONE fixed tartan (2026-11-26: painters must not re-invent it shot to
// shot). Jade (round 3): "covered in a navy plaid blanket". The SETT IS INVENTED: navy ground, forest-green bands, a thin
// white and a thin red overcheck, 0.15 m repeat (Black Watch-like, generic). Drawn in code; in line / contour the plaid
// shows only faintly (edgeMax 0.3), so its stripes do not read as folds.
import { artFromCanvas, repeatArt } from '../_art.js';
export const SETT = 0.15;   // metres per repeat
let plaid = null;
export function plaidArt() {
  if (plaid) return plaid;
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  g.fillStyle = '#1f2a48'; g.fillRect(0, 0, S, S);
  const band = (o, w, col, a = 0.55) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(o, 0, w, S); g.fillRect(0, o, S, w); g.globalAlpha = 1; };
  band(30, 70, '#1f4a33'); band(160, 26, '#1f4a33');            // forest-green bands (where they cross: darker, as woven)
  band(150, 3, '#e8e8e0', 0.8); band(194, 3, '#e8e8e0', 0.8);  // thin white overchecks
  band(64, 2, '#b02a2a', 0.85);                                 // thin red overcheck
  for (let y = 0; y < S; y += 2) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, S, 1); }   // twill texture
  plaid = repeatArt(artFromCanvas(c, { edgeMax: 0.3 })); return plaid;
}
