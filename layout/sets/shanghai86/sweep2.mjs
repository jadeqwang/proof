// Round-2 sun sweep (node layout/sets/shanghai86/sweep2.mjs [date]): one day, minute by minute 07:30-11:00, on the
// continuous balcony doors. Scores her cross-legged face (eyes, crown, chin) and hands, the steam, the table, the uncle's
// hands (state A), the lit floor's gap to the hall doorway and Mother. Prints every 5 minutes plus the last minute that lights her.
import { beamFor, SCENE, HER_SPOT, PLACES, TABLE, DOOR, ROOM } from './layout.js';
const date = process.argv[2] || SCENE.date;
const [HX, HZ] = HER_SPOT.at;
const face = [[HX + 0.05, 0.525, HZ + 0.15], [HX + 0.03, 0.62, HZ + 0.07], [HX + 0.05, 0.46, HZ + 0.17], [HX - 0.03, 0.53, HZ + 0.12], [HX + 0.11, 0.53, HZ + 0.10]];
const hands = [[HX + 0.21, 0.446, HZ + 0.29], [HX + 0.02, 0.446, HZ + 0.36]];
const uh = PLACES.uncleHands, uncle = [[uh[0], uh[1], uh[2]], [uh[0] + 0.02, uh[1] + 0.05, uh[2] - 0.12]];
const steam = PLACES.mugs.flatMap(([x, z]) => [0.56, 0.65, 0.75, 0.85, 0.95].map((y) => [x, y, z]));
const table = []; for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) table.push([TABLE.cx - TABLE.w / 2 + TABLE.w * i / 10, TABLE.h + 0.002, TABLE.cz - TABLE.d / 2 + TABLE.d * j / 10]);
const floor = []; for (let x = ROOM.x0 + 0.05; x <= ROOM.x1 - 0.05; x += 0.05) for (let z = -0.02; z >= ROOM.z0 + 0.02; z -= 0.05) floor.push([x, 0.001, z]);
const mother = [[PLACES.mother[0], 0.05, ROOM.z0 + 0.03], [PLACES.mother[0], 0.8, ROOM.z0 + 0.03], [PLACES.mother[0], 1.5, ROOM.z0 + 0.03]];
const rows = [];
for (let m = 7 * 60 + 30; m <= 11 * 60; m++) { const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const b = beamFor({ ...SCENE, date, time }); if (!b.ok) continue;
  const lit = floor.filter(b.inBeam); const segD = (p) => Math.hypot(Math.max(DOOR.x0 - p[0], 0, p[0] - DOOR.x1), p[2] - ROOM.z0);
  rows.push({ time, elev: b.SUN.elev, az: b.SUN.az, profile: b.SUN.profile_deg, face_min: Math.min(...face.map(b.beamMargin)), hands_min: Math.min(...hands.map(b.beamMargin)),
    uncle_hands: Math.min(...uncle.map(b.beamMargin)), steam: steam.filter(b.inBeam).length + '/' + steam.length, table: +(table.filter(b.inBeam).length / table.length).toFixed(2),
    door_gap: lit.length ? +Math.min(...lit.map(segD)).toFixed(2) : null, mother_lit: mother.map(b.inBeam).map(Number).join('') }); }
console.log('her spot', HER_SPOT.at, 'date', date);
console.table(rows.filter((r, i) => i % 5 === 0));
const okk = rows.filter((r) => r.face_min >= 0.05 && r.hands_min >= 0.05); console.log('face+hands lit (>= 5 cm) from', okk[0]?.time, 'to', okk.at(-1)?.time);
