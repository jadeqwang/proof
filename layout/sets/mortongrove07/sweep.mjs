// node layout/sets/mortongrove07/sweep.mjs   (the SCENE pick: Oct 2007 - Apr 2008, 12:00-17:00, every 10 min)
// sweep dates/times: which afternoon suns put her face and the sweatshirt in the picture-window shaft
import * as L from './layout.js';
const { sunPosition, travelDir, PICTURE, ROOM, HER, SHIRT } = L;
const face = [HER.at[0] - 0.02, 1.13, HER.at[1] - 0.2];     // rough: seated, leaning forward 14 deg
const pts = { face, shirt: SHIRT.c, herHands: SHIRT.c.map((v, i) => v + SHIRT.w[i] * 0.09) };
function margin(p, d) { const T = ROOM.wallT, W = PICTURE; if (d[2] >= -1e-3) return -9; const s = T / -d[2]; const dx = d[0] * s, dy = d[1] * s;
  const x0 = Math.max(W.x0, W.x0 + dx), x1 = Math.min(W.x1, W.x1 + dx), y0 = Math.max(W.sill, W.sill + dy), y1 = Math.min(W.head, W.head + dy);
  const t = p[2] / d[2]; const x = p[0] - d[0] * t, y = p[1] - d[1] * t; return Math.min(x - x0, x1 - x, y - y0, y1 - y); }
const dst = (Y, M, D) => { if (Y !== 2007) return false; const md = M * 100 + D; return md >= 311 && md < 1104; };   // US DST 2007: Mar 11 - Nov 4
const out = [];
for (const [M, days] of [[10, [5, 15, 25]], [11, [5, 15, 25]], [12, [5, 15, 25]], [1, [15]], [2, [5, 15, 25]], [3, [5, 15, 25]], [4, [5, 15]]]) for (const D of days) {
  const Y = M >= 10 ? 2007 : 2008; const tz = dst(2007, M, D) || (Y === 2008 && M * 100 + D >= 309) ? -5 : -6;
  for (let m = 12 * 60; m <= 17 * 60; m += 10) { const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const date = `${Y}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}`; const sp = sunPosition({ date, time, tzHours: tz, lat: 42.0525, lon: -87.7709 });
    if (sp.elev < 6) continue; const d = travelDir(sp); const mg = Object.fromEntries(Object.entries(pts).map(([k, p]) => [k, +margin(p, d).toFixed(2)]));
    out.push({ date, time, tz, elev: sp.elev, az: sp.az, ...mg, min: Math.min(...Object.values(mg)) }); } }
const good = out.filter((o) => o.min > 0.1).sort((a, b) => b.min - a.min);
console.log('good', good.length, 'of', out.length);
for (const o of good.slice(0, 25)) console.log(JSON.stringify(o));
const byMonth = {}; for (const o of good) (byMonth[o.date.slice(0, 7)] ||= []).push(o.time); for (const [k, v] of Object.entries(byMonth)) console.log(k, v[0], '...', v[v.length - 1], v.length);
