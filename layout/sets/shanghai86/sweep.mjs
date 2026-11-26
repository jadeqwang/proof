// Sweep the date and time of the beam (node layout/sets/shanghai86/sweep.mjs [--all]), Nov-Feb x 07:30-15:00, and score each honest sun against
// the staging: (a) her face and the tea steam lit, (b) part of the table lit, (c) the shaft running toward the north
// doors without reaching them (the lit floor stays >= 0.6 m from the doorway: door_gap). Prints the feasible candidates, best first. The chosen SCENE goes into layout.js.
import { beamFor, SCENE, HER_SPOT, PLACES, TABLE, DOOR, ROOM, SHELF_FRONT } from './layout.js';
const [HX, HZ] = HER_SPOT.at, F = [Math.sin(PLACES.jadeYaw * Math.PI / 180), Math.cos(PLACES.jadeYaw * Math.PI / 180)];
const face = [[HX, 0.6, HZ + 0.1], [HX, 0.68, HZ + 0.11], [HX - 0.05, 0.56, HZ + 0.1], [HX + 0.05, 0.56, HZ + 0.1]];
const steam = PLACES.mugs.flatMap(([x, z]) => [0.56, 0.65, 0.75, 0.85, 0.95].map((y) => [x, y, z]));
const table = []; for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) table.push([TABLE.cx - TABLE.w / 2 + TABLE.w * i / 10, TABLE.h + 0.002, TABLE.cz - TABLE.d / 2 + TABLE.d * j / 10]);
const doors = []; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 11; j++) doors.push([DOOR.x0 + (DOOR.x1 - DOOR.x0) * i / 8, 0.01 + 2.2 * j / 11, ROOM.z0 + 0.01]);
const floor = []; for (let x = -2.45; x <= ROOM.x1 - 0.05; x += 0.05) for (let z = -0.02; z >= -6.05; z -= 0.05) floor.push([x, 0.001, z]);
const out = [];
const days = []; for (let t = Date.UTC(1986, 10, 1); t <= Date.UTC(1987, 1, 28); t += 5 * 86400000) days.push(new Date(t).toISOString().slice(0, 10));
for (const date of days) for (let m = 7 * 60 + 30; m <= 15 * 60; m += 10) {
  const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const b = beamFor({ ...SCENE, cheat: undefined, date, time }); if (!b.ok) continue;
  const fm = Math.min(...face.map(b.beamMargin)), st = steam.filter(b.inBeam).length / steam.length, tl = table.filter(b.inBeam).length / table.length;
  const lit = floor.filter((p) => b.beamWindow(p) === 0); if (!lit.length) continue;   // the six windows' pool (the one aimed at the doors)
  // how far the lit floor (any window) stays from the doorway (plan distance to the opening's segment) and from the shelf fronts
  const segD = (p) => Math.hypot(Math.max(DOOR.x0 - p[0], 0, p[0] - DOOR.x1), p[2] - ROOM.z0);
  const allLit = floor.filter(b.inBeam), doorGap = +Math.min(...allLit.map(segD)).toFixed(2), nearDoor = doorGap < 0.6;
  const reach = Math.max(...lit.map((p) => -p[2])), doorLit = doors.some(b.inBeam);
  const cx = lit.reduce((s, p) => s + p[0], 0) / lit.length, cz = lit.reduce((s, p) => s + p[2], 0) / lit.length;
  const dirAng = Math.atan2(b.SUN_DIR[0], -b.SUN_DIR[2]) * 180 / Math.PI;                 // travel, deg east of "straight in"
  const toDoor = Math.atan2(0 - cx, -(ROOM.z0 - cz)) * 180 / Math.PI;                     // pool centroid -> door centre
  const toSun = [-b.SUN_DIR[0], -b.SUN_DIR[2]], n = Math.hypot(...toSun), faceAng = Math.acos((F[0] * toSun[0] + F[1] * toSun[1]) / n) * 180 / Math.PI;
  out.push({ date, time, elev: b.SUN.elev, az: b.SUN.az, rel: b.SUN.rel, profile: b.SUN.profile_deg, face_margin: fm, steam: +st.toFixed(2), table: +tl.toFixed(2), reach: +reach.toFixed(2),
    door_lit: doorLit, door_gap: doorGap, point_err: +Math.abs(dirAng - toDoor).toFixed(1), travel_deg: +dirAng.toFixed(1), face_off_sun: +faceAng.toFixed(0),
    near_door: nearDoor, ok: fm >= 0.08 && st >= 0.8 && tl >= 0.25 && !doorLit && !nearDoor && faceAng < 55 });
  delete out.at(-1).near_door;
}
const okk = out.filter((o) => o.ok).sort((a, b) => (a.point_err - b.point_err) + 100 * (b.face_margin - a.face_margin) * 0);
console.log('her spot', HER_SPOT, 'feasible', okk.length, 'of', out.length);
console.table((process.argv.includes('--all') ? okk : okk.slice(0, 25)));
const byMonth = {}; for (const o of okk) { const k = o.date.slice(0, 7); byMonth[k] = (byMonth[k] || []); byMonth[k].push(o.time); }
for (const [k, v] of Object.entries(byMonth)) console.log(k, v.length, 'slots', v.sort()[0], '-', v.sort().at(-1));
if (process.argv.includes('--diag')) {
  console.log('closest misses (by her face margin):');
  console.table(out.slice().sort((a, b) => b.face_margin - a.face_margin).slice(0, 12).map(({ ok, ...o }) => o));
  console.log('closest misses with face lit (>= 0.08), by table lit:');
  console.table(out.filter((o) => o.face_margin >= 0.08).sort((a, b) => b.table - a.table).slice(0, 12).map(({ ok, ...o }) => o));
}
