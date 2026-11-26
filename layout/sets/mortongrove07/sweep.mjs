// node layout/sets/mortongrove07/sweep.mjs   (the SCENE check: Oct 2007 - Apr 2008, 12:00-17:00, every 10 min)
// Which afternoon suns put her eyes and the seal in the FRONT-window shaft (round 2: the 1.5 m window of Jade's drawing),
// and whether the seal's front could ever face the sun (it faces him, north-west: it cannot).
import * as L from './layout.js';
const { sunPosition, travelDir, PICTURE, ROOM, HER, SHIRT } = L;
const eyes = [HER.at[0] - 0.03, 1.26, HER.at[1] - 0.10];   // from the MG1 sidecar (seated, turned 16 deg toward him)
const pts = { eyes, seal: SHIRT.c, sealTop: L.SEAL.top, collar: SHIRT.T };
function margin(p, d) { const T = ROOM.wallT, W = PICTURE; if (d[2] >= -1e-3) return -9; const s = T / -d[2]; const dx = d[0] * s, dy = d[1] * s;
  const x0 = Math.max(W.x0, W.x0 + dx), x1 = Math.min(W.x1, W.x1 + dx), y0 = Math.max(W.sill, W.sill + dy), y1 = Math.min(W.head, W.head + dy);
  const t = p[2] / d[2]; const x = p[0] - d[0] * t, y = p[1] - d[1] * t; return Math.min(x - x0, x1 - x, y - y0, y1 - y); }
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const out = [];
for (const [M, days] of [[10, [5, 15, 25]], [11, [5, 15, 25]], [12, [5, 15, 25]], [1, [15]], [2, [5, 15, 25]], [3, [5, 15, 25]], [4, [5, 15]]]) for (const D of days) {
  const Y = M >= 10 ? 2007 : 2008; const md = M * 100 + D;
  const tz = (Y === 2007 && md >= 311 && md < 1104) || (Y === 2008 && md >= 309) ? -5 : -6;   // US DST 2007: to Nov 4; 2008: from Mar 9
  for (let m = 12 * 60; m <= 17 * 60; m += 10) { const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const date = `${Y}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}`; const sp = sunPosition({ date, time, tzHours: tz, lat: 42.0525, lon: -87.7709 });
    if (sp.elev < 4) continue; const d = travelDir(sp); const mg = Object.fromEntries(Object.entries(pts).map(([k, p]) => [k, +margin(p, d).toFixed(2)]));
    out.push({ date, time, tz, elev: sp.elev, az: sp.az, ...mg, sealFrontCos: +(-dot(SHIRT.n, d)).toFixed(2), min: Math.min(mg.eyes, mg.seal) }); } }
const good = out.filter((o) => o.min > 0.1).sort((a, b) => b.min - a.min);
console.log('eyes + seal both > 0.1 m inside the front-window shaft:', good.length, 'of', out.length, '| seal front ever sunlit (cos > 0):', out.filter((o) => o.sealFrontCos > 0).length);
const scene = out.find((o) => o.date === L.SCENE.date && o.time === L.SCENE.time); console.log('SCENE', JSON.stringify(scene));
for (const o of good.slice(0, 12)) console.log(JSON.stringify(o));
const byMonth = {}; for (const o of good) (byMonth[o.date] ||= []).push(o.time); for (const [k, v] of Object.entries(byMonth)) console.log(k, v[0], '...', v[v.length - 1], v.length);
