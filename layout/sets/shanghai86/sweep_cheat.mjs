// Round-3 cheat sweep (node layout/sets/shanghai86/sweep_cheat.mjs [time]): Jade chose 09:30 with a cheated, lower sun that
// only just reaches her face. Keeps the real azimuth of that time and lowers the elevation step by step; prints the beam
// margin (m, > 0 inside the light) at her eyes, the crown of her head and her hands, from the points the renders record.
import { beamFor, sunPosition, SCENE } from './layout.js';
const time = process.argv[2] || '09:30';
const real = sunPosition({ ...SCENE, time });
const REL = +(real.az - 166.8).toFixed(2);
const P = {   // world points from the sidecars (V1a state A, V1c/V1g state B); crown = head + 0.09 m up
  A_eyes: [-1.643, 0.536, -3.888], A_crown: [-1.723, 0.624, -3.892], A_chin: [-1.65, 0.47, -3.89],
  B_eyes: [-1.711, 0.505, -3.731], B_crown: [-1.737, 0.613, -3.804], B_chin: [-1.70, 0.44, -3.70], B_hands: [-1.68, 0.433, -3.65],
  G_eyes: [-1.679, 0.517, -3.717], G_crown: [-1.752, 0.584, -3.742],
};
console.log('real sun', time, real, 'rel to facade normal', REL);
const rows = [];
for (let e = 14; e <= real.elev + 0.01; e += 0.5) { const b = beamFor({ ...SCENE, time, cheat: { elev: e, rel: REL } });
  rows.push({ elev: e, profile: b.SUN.profile_deg, ...Object.fromEntries(Object.entries(P).map(([k, p]) => [k, b.beamMargin(p)])) }); }
console.table(rows);
