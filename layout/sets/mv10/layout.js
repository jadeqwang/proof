// MV10 — the housewarming at 345B View St, Mountain View, fall 2010. SINGLE SOURCE OF TRUTH (metres, y up).
// Rebuilt 2026-11-25 (2) from Jade's own drawings of the house (inputs/refs_house/interior_plan.md / .json, which
// record what was read, what was inferred, and how sure). Jade lived here; her drawing wins over our guesses.
//
// AXES = the house's own frame from inputs/refs_house/print/registration.json, turned into three.js:
//   X: + = NNE (compass bearing 26.65)   0 = the house's SSW outer wall line ... 11.915 = its NNE outer wall line
//   Z: + = ESE (compass bearing 116.65)  0 = the house's WNW outer wall line (front door) ... 9.954 = its ESE wall (yard)
//   y: up, 0 = the house's finished floor. The yard is LOWER: grade at y = GRADE (stairs go down from the patio).
//   (house frame x = world Z, house frame y = world X.)  The plan view V3h looks straight down with +X (NNE) up the
//   frame: the front (WNW) at left, the yard (ESE) at right, SSW at the bottom.
// Compass in world terms: a horizontal bearing b points along (X, Z) = (cos(b - 26.65), sin(b - 26.65)).
// So WNW (296.65) = -Z, SSW (206.65) = -X, west (270) = (-0.448, -0.894), the October sunset (~263) = (-0.55, -0.83).
// A camera looking at the Expedit looks +Z (ESE): frame-left is +X (NNE, the beauty half), frame-right is -X (SSW,
// the truth half, the 2x2 and the opening to the kitchen).

const D2R = Math.PI / 180;
export const BEARING = { X: 26.65, Z: 116.65 };
export const horiz = (bearing) => [Math.cos((bearing - BEARING.X) * D2R), Math.sin((bearing - BEARING.X) * D2R)];   // unit [X, Z]

// ---------------------------------------------------------------- SCENE: date, times, sun (computed, never swung by hand)
// Jade (2026-11-25): the housewarming was "likely fall 2010"; the party STARTED in the late afternoon while it was
// still light; the fire spinning came later, at dusk and into the dark. The exact date is unknown: Saturday
// 2 October 2010 is OUR pick inside her late-September..mid-October window (PDT, UTC-7). Each section has its own
// clock time on that date; every shot takes its section's sun. Change `date` or a time here and everything follows.
//   bridge   16:30  late-afternoon daylight, sun 25.8 deg up at az 242 (WSW). It comes in through the WNW living-room
//                   window (89 % of it sunlit; 357 View St clips the rest) over the couch onto the seats, the floor
//                   and the NNE wall by the glass table; through the open front door onto the NNE wall. It never
//                   reaches the Expedit (which faces WNW but sits 4.5 m in, out of every shaft). From ~17:00 357's
//                   shadow climbs over the window: by 17:30 no direct sun is in the living room.
//   verse3   18:25  the sun going down (4.2 deg, az 262): the whole yard is in the house's shadow (it covers the tree
//                   mark from ~17:50); only the top of the lemon canopy still has sun (until ~18:33). Sunset 18:52.
//   silence  19:20 / chorus2b 19:22  just past the end of civil dusk (19:17): no sun, a deep blue sky; ceiling lights
//                   inside, the fire poi outside.
export const SCENE = { date: '2010-10-02', tzHours: -7, tz: 'PDT', lat: 37.39095, lon: -122.07744,
  times: { prep: '14:00', bridge: '16:30', hardstop: '16:31', verse3: '18:25', silence: '19:20', chorus2b: '19:22' } };
// prep 14:00: picking the lemons before the party (Jade 2026-11-25 (late): she and the childhood friend picked them
// and made the lemonade BEFORE first love, Z and the guests arrived). The clock time is OUR pick (ASSUMED).
export const SECTION_KEY = { 'Before the party': 'prep', 'Bridge': 'bridge', 'Hard stop': 'hardstop', 'Verse 3': 'verse3', 'Silence': 'silence', 'Chorus 2b': 'chorus2b' };

// sun position (NOAA solar calculator equations; same code as shanghai86): { elev (deg, refracted), az (deg from N, cw) }
export function sunPosition({ date, time, tzHours, lat, lon }) {
  const [Y, M, Dd] = date.split('-').map(Number), [hh, mm] = time.split(':').map(Number);
  const ut = hh + mm / 60 - tzHours;
  const jd = Date.UTC(Y, M - 1, Dd, 0, 0, 0) / 86400000 + 2440587.5 + ut / 24;
  const T = (jd - 2451545) / 36525;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const Ms = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(Ms * D2R) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * Ms * D2R) * (0.019993 - 0.000101 * T) + Math.sin(3 * Ms * D2R) * 0.000289;
  const om = 125.04 - 1934.136 * T, lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * D2R);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60, eps = eps0 + 0.00256 * Math.cos(om * D2R);
  const decl = Math.asin(Math.sin(eps * D2R) * Math.sin(lam * D2R)) / D2R;
  const y = Math.tan(eps / 2 * D2R) ** 2;
  const eqt = 4 / D2R * (y * Math.sin(2 * L0 * D2R) - 2 * e * Math.sin(Ms * D2R) + 4 * e * y * Math.sin(Ms * D2R) * Math.cos(2 * L0 * D2R) - 0.5 * y * y * Math.sin(4 * L0 * D2R) - 1.25 * e * e * Math.sin(2 * Ms * D2R));
  const tst = ((hh * 60 + mm + eqt + 4 * lon - 60 * tzHours) % 1440 + 1440) % 1440;
  const ha = tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180;
  const zen = Math.acos(Math.sin(lat * D2R) * Math.sin(decl * D2R) + Math.cos(lat * D2R) * Math.cos(decl * D2R) * Math.cos(ha * D2R)) / D2R;
  const az = (Math.atan2(Math.sin(ha * D2R), Math.cos(ha * D2R) * Math.sin(lat * D2R) - Math.tan(decl * D2R) * Math.cos(lat * D2R)) / D2R + 180 + 360) % 360;
  const h0 = 90 - zen; const te = Math.tan(h0 * D2R);
  const refr = h0 > 85 ? 0 : h0 > 5 ? (58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5) / 3600 : h0 > -0.575 ? (1735 + h0 * (-518.2 + h0 * (103.4 + h0 * (-12.79 + h0 * 0.711)))) / 3600 : -20.774 / te / 3600;
  return { elev: +(h0 + refr).toFixed(2), az: +az.toFixed(2), decl: +decl.toFixed(2), solar_time_min: +tst.toFixed(1) };
}
// sunset: first minute of the day after noon with elev < -0.833 (upper limb at the horizon); civil dusk: < -6
export function sunEvents(scene = SCENE) { const f = (lim) => { for (let m = 12 * 60; m < 23 * 60; m++) { const t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const s = sunPosition({ ...scene, time: t }); if (s.elev < lim) return { time: t, az: s.az }; } return null; }; return { sunset: f(-0.833), civil_dusk_end: f(-6) }; }
// the sun for one section: travel direction (unit, world) from the sun into the scene; up = elevation > 0
export function sunFor(section) {
  const time = SCENE.times[section] || SCENE.times.bridge, SP = sunPosition({ ...SCENE, time }), [hx, hz] = horiz(SP.az), e = SP.elev * D2R;
  const toSun = [Math.cos(e) * hx, Math.sin(e), Math.cos(e) * hz];
  return { section, date: SCENE.date, time, tz: SCENE.tz, elev: SP.elev, az: SP.az, up: SP.elev > 0.3, toSun, dir: toSun.map((v) => -v),
    color: SP.elev > 8 ? 0xffe2b0 : SP.elev > 2 ? 0xffb070 : 0xff8a4a };
}
export const SUN = Object.fromEntries(Object.keys(SCENE.times).map((k) => [k, sunFor(k)]));
export const SUN_EVENTS = sunEvents();

// ---------------------------------------------------------------- the house shell (345B, single storey on a crawl space)
// Footprint 9.954 (Z) x 11.915 (X), OSM / city layer. City height field 18.33 ft = 5.6 m to the roof top above grade.
// Floor above grade, ceiling, roof form: OURS (assumed). The stairs Jade drew from the patio down to the yard say the
// floor is raised; 0.6 m (four risers) is a typical California crawl space. Roof: a gable with the ridge along the
// long (NNE-SSW) axis, as the aerial's roof reads today (two planes, a ridge NNE-SSW); 5.6 m to the ridge above grade.
// Jade (2026-11-25 late): the deck is level with the floor and the yard is "at least 3-4 steps" below it. 0.70 m =
// four 17.5 cm risers: OUR number inside her 0.6-0.75 m (ASSUMED). (Was 0.6.)
export const FLOOR_ABOVE_GRADE = 0.7;
export const GRADE = -FLOOR_ABOVE_GRADE;
export const HOUSE = { X: 11.915, Z: 9.954, wallT: 0.15, intT: 0.12, ceil: 2.44, plate: 2.64, ridgeY: 5.6 - FLOOR_ABOVE_GRADE, ridgeZ: 9.954 / 2, eave: 0.45, rake: 0.3 };
HOUSE.roofSlope = (HOUSE.ridgeY - HOUSE.plate) / (HOUSE.ridgeZ + HOUSE.eave * 0);   // rise per metre of run from the wall line
// roof height (underside of the outer surface, world y) above a point at world Z (inside the eaves)
export const roofY = (z) => HOUSE.plate + HOUSE.roofSlope * Math.min(z, HOUSE.Z - z);

// rooms (interior faces). From Jade's site plan (page 1), registered at +/-0.15 m (interior_plan.json).
const T = HOUSE.wallT;
// the partition between them (Jade: "wall"), from the core to its open end; the opening is SSW of the 2x2.
// Jade (2026-11-25 late): the wall really was THICK ("built-in, chimney, closet..."), "as thick as the 2x2 Expedit is
// deep, so the 2x2 sits almost flush with it". OUR READING (ASSUMED, flagged): the 2x2 stands at the wall's end facing
// SSW as she drew it (its 79 cm across the wall), so "flush" means the wall is about 79 cm thick: 0.78 m here, the 2x2
// 5 mm proud on each face. Both drawings agree (page 1: 0.7 m double line; page 2: a band as wide as the 2x2's long side).
// The other reading (0.39 m = the Expedit's literal depth, with the 2x2 turned to continue the wall line) is an open
// question for Jade. Centre line Z 5.0 (unchanged); solid, no chimney or closet modelled inside it.
export const PARTITION_T = 0.78;
export const PARTITION = { zc: 5.0, z0: 5.0 - PARTITION_T / 2, z1: 5.0 + PARTITION_T / 2, x0: 2.30, x1: 4.89, t: PARTITION_T };
export const LIVING = { name: 'living room', x0: T, x1: 4.89, z0: T, z1: PARTITION.z0 };
export const KITCHEN = { name: 'kitchen and dining', x0: T, x1: 4.89, z0: PARTITION.z1, z1: HOUSE.Z - T };
export const OPENING = { x0: T, x1: 1.91, z: 5.0, note: 'between the SSW wall and the 2x2 Expedit standing at the partition end' };
// the core: bathroom, hall, laundry, bath 2; tea room and bedroom on the NNE side. Walls as [X0, Z0, X1, Z1] centre
// lines (axis-aligned), thickness intT, full ceiling height; openings are [s0, s1] metres along the wall from its first end.
export const CORE_WALLS = [
  { name: 'living / core wall (NNE wall of the living room)', a: [4.95, T], b: [4.95, PARTITION.z0], doors: [[3.5, 4.3]] },   // door to the hall: Z 3.65..4.45
  { name: 'kitchen / core wall', a: [4.95, PARTITION.z1], b: [4.95, HOUSE.Z - T] },
  { name: 'bathroom / hall wall', a: [5.01, 3.6], b: [6.72, 3.6], doors: [[0.3, 1.05]] },
  { name: 'bathroom / tea room wall', a: [6.72, T], b: [6.72, 3.97] },
  { name: 'hall / tea room (jog)', a: [6.72, 3.97], b: [7.9, 3.97] },
  { name: 'hall / tea room + bedroom (jog)', a: [7.9, 3.97], b: [7.9, 5.79], doors: [[0.1, 0.85]] },
  { name: 'hall / bedroom (jog)', a: [6.58, 5.79], b: [7.9, 5.79], doors: [[0.3, 1.05]] },
  { name: 'tea room / bedroom wall', a: [7.9, 5.0], b: [HOUSE.X - T, 5.0] },
  { name: 'hall / laundry wall', a: [5.01, 5.73], b: [6.58, 5.73], doors: [[0.25, 1.0]] },
  { name: 'laundry / bath 2', a: [5.01, 7.07], b: [6.58, 7.07] },
  { name: 'laundry + bath 2 / bedroom wall', a: [6.58, 5.73], b: [6.58, HOUSE.Z - T], doors: [[1.7, 2.4]] },
];
// exterior openings (OURS unless noted: Jade drew the front door and the door to the yard; 2026-11-25 late she placed
// the two living-room windows and made the yard door a sliding glass door). wall: 'WNW' (Z = 0),
// 'ESE' (Z = HOUSE.Z), 'SSW' (X = 0), 'NNE' (X = HOUSE.X); s0..s1 along the wall (X for WNW / ESE, Z for SSW / NNE);
// y0..y1 above the floor.
export const OPENINGS = [
  { name: 'front door', wall: 'WNW', s0: 3.85, s1: 4.75, y0: 0, y1: 2.03, kind: 'door', leaf: { hinge: 4.75, openDeg: 30 }, src: 'Jade (page 1 "door"; page 2 leaf at the top right, hinged NNE, opening in)' },
  { name: 'living room window (WNW)', wall: 'WNW', s0: 0.6, s1: 2.3, y0: 0.9, y1: 2.05, kind: 'window', src: 'Jade (2026-11-25 late): a window in the front wall; size and place along it (above the couch) OURS' },
  { name: 'living room window (SSW)', wall: 'SSW', s0: 1.6, s1: 3.2, y0: 0.9, y1: 2.05, kind: 'window', src: 'Jade (2026-11-25 late, "I think"): a window along the side wall. SSW is the living room\'s only exterior side wall (NNE is the core), so it is here; size and place along it OURS. 357 View St stands 5.2 m beyond it' },
  // Jade (2026-11-25 late): a SLIDING GLASS DOOR, not French doors. 6 ft (1.83 m) two-panel slider: OUR size. Its SSW
  // panel slides open behind the fixed NNE panel (OURS), so the open half (X 0.70..1.62) is where her path goes out.
  { name: 'sliding glass door to the deck', wall: 'ESE', s0: 0.70, s1: 2.53, y0: 0, y1: 2.03, kind: 'slider', openTo: 1.62, src: 'Jade (page 2 "french doors to yard", corrected 2026-11-25 late to a sliding glass door); width 1.83 m and which panel slides are OURS' },
  { name: 'kitchen window over the sink (ESE)', wall: 'ESE', s0: 3.45, s1: 4.45, y0: 1.05, y1: 2.05, kind: 'window', src: 'ASSUMED' },
  { name: 'dining window (SSW)', wall: 'SSW', s0: 7.0, s1: 8.3, y0: 0.95, y1: 2.05, kind: 'window', src: 'ASSUMED: above the table end' },
  { name: 'tea room window (WNW)', wall: 'WNW', s0: 8.2, s1: 10.2, y0: 0.9, y1: 2.05, kind: 'window', src: 'ASSUMED' },
  { name: 'tea room window (NNE)', wall: 'NNE', s0: 1.2, s1: 2.8, y0: 0.9, y1: 2.05, kind: 'window', src: 'ASSUMED' },
  { name: 'bathroom window (WNW)', wall: 'WNW', s0: 5.6, s1: 6.3, y0: 1.3, y1: 1.95, kind: 'window', src: 'ASSUMED' },
  { name: 'bedroom window (ESE)', wall: 'ESE', s0: 8.6, s1: 10.6, y0: 0.9, y1: 2.05, kind: 'window', src: 'ASSUMED' },
  { name: 'bedroom window (NNE)', wall: 'NNE', s0: 7.2, s1: 8.8, y0: 0.9, y1: 2.05, kind: 'window', src: 'ASSUMED' },
  { name: 'bath 2 window (ESE)', wall: 'ESE', s0: 5.4, s1: 6.0, y0: 1.3, y1: 1.95, kind: 'window', src: 'ASSUMED' },
];
// an opening's aperture corners on the wall's OUTER face: TL, TR, BR, BL as seen from outside
export function apertureOf(o) { const { s0, s1, y0, y1 } = o;
  switch (o.wall) { case 'WNW': return [[s1, y1, 0], [s0, y1, 0], [s0, y0, 0], [s1, y0, 0]];
    case 'ESE': return [[s0, y1, HOUSE.Z], [s1, y1, HOUSE.Z], [s1, y0, HOUSE.Z], [s0, y0, HOUSE.Z]];
    case 'SSW': return [[0, y1, s0], [0, y1, s1], [0, y0, s1], [0, y0, s0]];
    default: return [[HOUSE.X, y1, s1], [HOUSE.X, y1, s0], [HOUSE.X, y0, s0], [HOUSE.X, y0, s1]]; } }

// ---------------------------------------------------------------- the neighbours (City of Mountain View footprints, BLDGHEIGHT ft -> m)
// Prisms from grade to 0.8 x the listed height (a flat-topped stand-in for a pitched roof: the listed height is the top).
// Present-day data (the layer was edited ~2026); 2010 may differ. Unknown heights -> 3.5 m (sheds, garages).
// The city footprint with NO height between 345A and 345B (Z -6.2..-0.5) reads as the wooden deck in the aerial: a 0.6 m platform.
export const NEIGHBOURS = [
  { id: 22545, name: '345A View St', h_listed_m: 5.59, build: true, poly: [[10.17, -19.96], [10.31, -9.37], [1.59, -9.28], [1.44, -20.93], [6.1, -20.98], [6.11, -19.86]] },
  { id: 22547, name: 'deck between 345A and 345B (no height: a platform)', h_listed_m: null, build: true, poly: [[5.27, -0.49], [5.24, -6.17], [11.39, -6.19], [11.39, -5.64], [12.62, -5.64], [12.63, -3.52], [11.47, -3.52], [11.49, -0.58]] },
  { id: 14802, name: 'outbuildings ESE-NNE (78 + 57 m2 in OSM)', h_listed_m: null, build: true, poly: [[27.16, 25.32], [27.14, 33.6], [20.58, 33.57], [20.59, 31.36], [18.8, 31.36], [18.79, 34.33], [13.25, 34.31], [13.26, 28.15], [13.04, 28.15], [13.05, 21.33], [12.19, 21.33], [12.19, 20.27], [13.09, 20.27], [13.09, 19.55], [12.21, 19.54], [12.21, 18.25], [13.13, 18.25], [13.13, 18.15], [20.41, 18.18], [20.4, 25.29]] },
  { id: 22549, name: '357 View St', h_listed_m: 6.91, build: true, poly: [[-24.16, 3.37], [-24.31, -22.4], [-14.95, -22.43], [-14.94, -21.35], [-5.3, -21.39], [-5.25, -13.09], [-14.21, -13.05], [-14.18, -7.89], [-5.26, -7.92], [-5.19, 3.34]] },
  { id: 22542, name: '315 View St', h_listed_m: 6.76, build: true, poly: [[42.32, -1.82], [42.25, 14.44], [33.33, 14.38], [33.34, 9.8], [31.67, 9.79], [31.7, 2.99], [33.18, 3.0], [33.2, -1.72], [35.79, -1.7], [35.79, -2.96], [38.17, -2.95], [38.17, -1.77]] },
  { id: 22544, name: '327 View St', h_listed_m: 4.31, build: true, poly: [[13.57, -10.3], [13.51, -18.27], [17.03, -18.29], [17.01, -20.11], [20.07, -20.13], [20.09, -18.29], [24.11, -18.31], [24.14, -14.13], [25.81, -14.13], [25.88, -3.63], [25.23, -3.62], [25.24, -1.85], [20.54, -1.83], [20.52, -3.73], [19.9, -3.73], [19.89, -4.21], [18.5, -4.2], [18.5, -3.08], [15.65, -3.07], [15.64, -4.2], [12.79, -4.19], [12.75, -10.21]] },
  { id: 22551, name: 'present-day shed at the yard SSW-ESE corner (not built)', h_listed_m: null, build: false, poly: [[0.29, 18.91], [0.27, 21.37], [-1.52, 21.35], [-1.5, 18.86]] },
  { id: 14806, name: 'present-day shed in the yard (NOT in Jade 2010 drawing; not built)', h_listed_m: null, build: false, poly: [[6.1, 20.33], [1.64, 20.43], [1.59, 18.33], [6.05, 18.22]] },
  { id: 14808, name: 'building WSW', h_listed_m: 2.87, build: true, poly: [[-20.94, 29.79], [-22.28, 28.67], [-22.43, 26.94], [-21.31, 25.6], [-19.58, 25.45], [-18.25, 26.57], [-18.1, 28.31], [-19.21, 29.64]] },
  { id: 22543, name: 'building', h_listed_m: 4.43, build: true, poly: [[31.4, -5.87], [31.4, -19.67], [42.52, -19.65], [42.52, -13.08], [41.29, -13.08], [41.3, -5.85]] },
  { id: 22548, name: 'outbuilding beyond the ESE fence', h_listed_m: null, build: true, poly: [[4.61, 27.1], [2.35, 28.23], [1.45, 26.44], [3.73, 25.31]] },
  { id: 14801, name: '344 Bush St', h_listed_m: 4.33, build: true, poly: [[24.51, 55.71], [24.37, 34.4], [29.74, 34.38], [29.73, 33.88], [30.3, 33.88], [30.31, 34.4], [34.48, 34.38], [34.59, 51.98], [35.31, 51.98], [35.34, 56.52], [28.67, 56.55], [28.67, 55.69]] },
  { id: 14803, name: 'small building NNE', h_listed_m: 3.27, build: true, poly: [[22.39, 12.84], [22.52, 6.8], [28.01, 6.93], [27.89, 12.96]] },
  { id: 22550, name: 'building SSW of the yard', h_listed_m: 2.81, build: true, poly: [[-3.09, 17.24], [-24.82, 17.38], [-24.87, 11.22], [-3.13, 11.08]] },
];
NEIGHBOURS.forEach((b) => { b.top = b.id === 22547 ? GRADE + 0.6 : GRADE + (b.h_listed_m ? 0.8 * b.h_listed_m : 3.5); });

// ---------------------------------------------------------------- the bookshelf: ONE IKEA Expedit 5x5, espresso (Jade, 2026-11-25)
// Contents and data UNCHANGED from the first build; only its place moved (SH_CX is now 0 in the shelf's own frame: see SHELF_AT).
const EX = { W: 1.85, H: 1.85, D: 0.39, F: 0.05, T: 0.016, N: 5 };
EX.C = (EX.W - 2 * EX.F - (EX.N - 1) * EX.T) / EX.N;                         // 0.3372 cube (inside)
const SH_CX = 0;   // the shelf's own frame (centre 0); its place in the room is SHELF_AT below
// BOOKS: every other cube, read as a checkerboard with the corners filled: (col + row) even -> books (13 cubes), odd ->
// objects (12 cubes). col 0 = left, row 0 = bottom. That reading is OURS (Jade said "every other cube").
// LEFT half = BEAUTY ("beauty on this side"): art and literature. RIGHT half = TRUTH ("truth by reference"; "science
// fiction shelved with truth"): science fiction, textbooks, popular science. The middle column (col 2) straddles the
// seam: its three book cubes are split, art / literature from the left wall, science from the right wall.
// Book entries: t title, a author, w thickness (spine width), h height, d depth (front-back), lay 'stand' | 'flat'.
// Real sizes where known (Kandel's Principles ~28 x 22 x 6 cm, Jade's number); others are typical for the format:
//   mass-market paperback 17.5 x 10.6 cm, trade paperback ~21 x 14, hardcover novel ~24 x 16, large art book ~31 x 25.
// Titles Jade named: Fundamental Neuroscience; Principles of Neural Science; Nonlinear Dynamics and Chaos; The Feynman
// Lectures on Physics I-III; The Dragons of Eden; A Short History of Nearly Everything. Every OTHER title is a
// plausible placeholder of ours (the kind she named), to be replaced when Jade remembers more.
const mm = (t, a, w = 0.024) => ({ t, a, w, h: 0.175, d: 0.106, lay: 'stand', kind: 'sf mass-market paperback' });
const BOOKS = {
  // ---- BEAUTY (left half): art and literature
  '0,4': [{ t: 'Hokusai', a: 'Taschen', w: 0.03, h: 0.31, d: 0.25, kind: 'art book' }, { t: 'Rothko', a: 'Taschen', w: 0.012, h: 0.23, d: 0.185, kind: 'art book (Basic Art)' },
    { t: 'Klimt', a: 'Taschen', w: 0.012, h: 0.23, d: 0.185, kind: 'art book (Basic Art)' }, { t: 'Interaction of Color', a: 'Josef Albers', w: 0.012, h: 0.225, d: 0.18, kind: 'art book' },
    { t: 'The Story of Art', a: 'E. H. Gombrich', w: 0.05, h: 0.25, d: 0.18, kind: 'art book' }, { t: 'Ways of Seeing', a: 'John Berger', w: 0.012, h: 0.2, d: 0.135, kind: 'art book' },
    { t: 'Leaves of Grass', a: 'Walt Whitman', w: 0.035, h: 0.21, d: 0.14, kind: 'literature' }, { t: 'Collected Poems', a: 'Elizabeth Bishop', w: 0.03, h: 0.235, d: 0.155, kind: 'literature' }],
  '1,3': [{ t: 'One Hundred Years of Solitude', a: 'Gabriel García Márquez', w: 0.026, h: 0.2, d: 0.13, kind: 'literature' }, { t: 'Invisible Cities', a: 'Italo Calvino', w: 0.012, h: 0.2, d: 0.13, kind: 'literature' },
    { t: 'Ficciones', a: 'Jorge Luis Borges', w: 0.014, h: 0.2, d: 0.13, kind: 'literature' }, { t: 'Pale Fire', a: 'Vladimir Nabokov', w: 0.02, h: 0.2, d: 0.13, kind: 'literature' },
    { t: 'Lolita', a: 'Vladimir Nabokov', w: 0.022, h: 0.2, d: 0.13, kind: 'literature' }, { t: 'Mrs Dalloway', a: 'Virginia Woolf', w: 0.016, h: 0.2, d: 0.13, kind: 'literature' },
    { t: 'The Remains of the Day', a: 'Kazuo Ishiguro', w: 0.02, h: 0.2, d: 0.13, kind: 'literature' }, { t: 'Kafka on the Shore', a: 'Haruki Murakami', w: 0.035, h: 0.24, d: 0.16, kind: 'literature (hardcover)' },
    { t: 'The Little Prince', a: 'Antoine de Saint-Exupéry', w: 0.012, h: 0.235, d: 0.17, kind: 'literature' }, { t: 'Middlemarch', a: 'George Eliot', w: 0.045, h: 0.2, d: 0.13, kind: 'literature' },
    { t: 'The Waves', a: 'Virginia Woolf', w: 0.016, h: 0.2, d: 0.13, kind: 'literature' }],
  '0,2': [{ t: 'Van Gogh: The Complete Paintings', a: 'Taschen', w: 0.05, h: 0.3, d: 0.25, lay: 'flat', kind: 'art book (lying flat)' },
    { t: 'Matisse', a: 'Taschen', w: 0.04, h: 0.3, d: 0.24, lay: 'flat', kind: 'art book (lying flat)' }, { t: 'Agnes Martin', a: '', w: 0.03, h: 0.29, d: 0.24, lay: 'flat', kind: 'art book (lying flat)' },
    { t: 'Sketchbook', a: '(hers)', w: 0.02, h: 0.21, d: 0.15, lay: 'flat', kind: 'sketchbook' }],
  '1,1': [{ t: 'Gardner’s Art Through the Ages', a: 'Fred S. Kleiner', w: 0.055, h: 0.29, d: 0.23, kind: 'art book' },
    { t: 'The Art Book', a: 'Phaidon', w: 0.04, h: 0.29, d: 0.25, kind: 'art book' }, { t: 'Understanding Comics', a: 'Scott McCloud', w: 0.015, h: 0.265, d: 0.18, kind: 'art book' },
    { t: 'Dream of the Red Chamber, vol. 1', a: 'Cao Xueqin', w: 0.035, h: 0.2, d: 0.13, kind: 'literature' }, { t: 'Dream of the Red Chamber, vol. 2', a: 'Cao Xueqin', w: 0.035, h: 0.2, d: 0.13, kind: 'literature' },
    { t: 'Moby-Dick', a: 'Herman Melville', w: 0.04, h: 0.2, d: 0.13, kind: 'literature' }],
  '0,0': [{ t: 'Michelangelo: The Complete Works', a: 'Taschen', w: 0.065, h: 0.32, d: 0.26, lay: 'flat', kind: 'art book (lying flat)' },
    { t: 'Leonardo da Vinci: The Graphic Work', a: 'Taschen', w: 0.06, h: 0.31, d: 0.25, lay: 'flat', kind: 'art book (lying flat)' },
    { t: 'Magnum Contact Sheets', a: '', w: 0.045, h: 0.31, d: 0.25, lay: 'flat', kind: 'art book (lying flat)' }],
  // ---- the middle column: split, art / literature from the left, science from the right (seam = its centre line)
  '2,4': { left: [{ t: 'Collected Fictions', a: 'Jorge Luis Borges', w: 0.04, h: 0.235, d: 0.155, kind: 'literature' }, { t: 'The Book of Tea', a: 'Kakuzo Okakura', w: 0.012, h: 0.2, d: 0.13, kind: 'literature' },
      { t: 'The Collected Poems', a: 'Wallace Stevens', w: 0.03, h: 0.21, d: 0.14, kind: 'literature' }],
    right: [mm('Dune', 'Frank Herbert', 0.035), mm('Foundation', 'Isaac Asimov', 0.02), mm('Neuromancer', 'William Gibson', 0.022), mm('The Left Hand of Darkness', 'Ursula K. Le Guin', 0.022)] },
  '2,2': { left: [{ t: 'Dalí', a: 'Taschen', w: 0.012, h: 0.23, d: 0.185, kind: 'art book (Basic Art)' }, { t: 'Escher: The Graphic Work', a: 'Taschen', w: 0.012, h: 0.3, d: 0.235, kind: 'art book' },
      { t: 'Calligraphy', a: '', w: 0.02, h: 0.26, d: 0.19, kind: 'art book' }],
    right: [{ t: 'Gödel, Escher, Bach', a: 'Douglas Hofstadter', w: 0.045, h: 0.235, d: 0.155, kind: 'popular science' }, { t: 'The Selfish Gene', a: 'Richard Dawkins', w: 0.025, h: 0.2, d: 0.13, kind: 'popular science' },
      { t: 'Cosmos', a: 'Carl Sagan', w: 0.025, h: 0.175, d: 0.106, kind: 'popular science (mass-market)' }] },
  '2,0': { left: [{ t: 'Phaidon Atlas of Contemporary Architecture', a: '', w: 0.05, h: 0.31, d: 0.25, kind: 'art book' }, { t: '1000 Chairs', a: 'Taschen', w: 0.035, h: 0.2, d: 0.14, kind: 'art book' },
      { t: 'Seven Japanese Tales', a: 'Jun’ichirō Tanizaki', w: 0.02, h: 0.2, d: 0.13, lay: 'flat', kind: 'literature (lying flat on the art books)' }],
    right: [{ t: 'The Man Who Mistook His Wife for a Hat', a: 'Oliver Sacks', w: 0.02, h: 0.2, d: 0.13, kind: 'popular science' }, { t: 'Phantoms in the Brain', a: 'V. S. Ramachandran', w: 0.025, h: 0.2, d: 0.13, kind: 'popular science' },
      { t: 'Chaos: Making a New Science', a: 'James Gleick', w: 0.03, h: 0.2, d: 0.13, kind: 'popular science' }, { t: 'The Blind Watchmaker', a: 'Richard Dawkins', w: 0.025, h: 0.2, d: 0.13, kind: 'popular science' }] },
  // ---- TRUTH (right half): science fiction, textbooks, popular science
  // eye height (row 4): the Feynman set, a matched run of three, with science-fiction paperbacks beside it
  '4,4': [{ t: 'The Feynman Lectures on Physics, Vol. I', a: 'Feynman, Leighton, Sands', w: 0.035, h: 0.28, d: 0.215, kind: 'textbook (matched set of three)' },
    { t: 'The Feynman Lectures on Physics, Vol. II', a: 'Feynman, Leighton, Sands', w: 0.035, h: 0.28, d: 0.215, kind: 'textbook (matched set of three)' },
    { t: 'The Feynman Lectures on Physics, Vol. III', a: 'Feynman, Leighton, Sands', w: 0.035, h: 0.28, d: 0.215, kind: 'textbook (matched set of three)' },
    mm('Ender’s Game', 'Orson Scott Card', 0.022), mm('Hyperion', 'Dan Simmons', 0.03), mm('Do Androids Dream of Electric Sheep?', 'Philip K. Dick', 0.016),
    mm('Solaris', 'Stanisław Lem', 0.018), mm('Rendezvous with Rama', 'Arthur C. Clarke', 0.02), mm('The Dispossessed', 'Ursula K. Le Guin', 0.022)],
  '3,3': [{ t: 'Principles of Neural Science (4th ed.)', a: 'Kandel, Schwartz, Jessell', w: 0.06, h: 0.28, d: 0.22, kind: 'textbook' },
    { t: 'Fundamental Neuroscience (3rd ed.)', a: 'Squire et al.', w: 0.055, h: 0.28, d: 0.22, kind: 'textbook' },
    { t: 'Theoretical Neuroscience', a: 'Dayan & Abbott', w: 0.035, h: 0.255, d: 0.205, kind: 'textbook' },
    { t: 'Nonlinear Dynamics and Chaos', a: 'Steven H. Strogatz', w: 0.03, h: 0.235, d: 0.155, kind: 'textbook' },
    { t: 'Spikes: Exploring the Neural Code', a: 'Rieke et al.', w: 0.025, h: 0.235, d: 0.155, kind: 'textbook' },
    { t: 'Molecular Biology of the Cell', a: 'Alberts et al.', w: 0.065, h: 0.28, d: 0.22, kind: 'textbook' }],
  '4,2': [{ t: 'The Dragons of Eden', a: 'Carl Sagan', w: 0.02, h: 0.175, d: 0.106, kind: 'popular science (mass-market)' },
    { t: 'A Short History of Nearly Everything', a: 'Bill Bryson', w: 0.035, h: 0.203, d: 0.133, kind: 'popular science' },
    { t: 'Surely You’re Joking, Mr. Feynman!', a: 'Richard P. Feynman', w: 0.025, h: 0.2, d: 0.13, kind: 'popular science' },
    { t: 'The Elegant Universe', a: 'Brian Greene', w: 0.03, h: 0.2, d: 0.13, kind: 'popular science' },
    { t: 'A Brief History of Time', a: 'Stephen Hawking', w: 0.018, h: 0.2, d: 0.13, kind: 'popular science' },
    { t: 'The Demon-Haunted World', a: 'Carl Sagan', w: 0.026, h: 0.2, d: 0.13, kind: 'popular science' },
    { t: 'Synaptic Self', a: 'Joseph LeDoux', w: 0.025, h: 0.235, d: 0.155, kind: 'popular science' },
    { t: 'The Quark and the Jaguar', a: 'Murray Gell-Mann', w: 0.025, h: 0.2, d: 0.13, kind: 'popular science' },
    { t: 'QED', a: 'Richard P. Feynman', w: 0.012, h: 0.2, d: 0.13, kind: 'popular science' }],
  '3,1': [mm('Stranger in a Strange Land', 'Robert A. Heinlein', 0.032), mm('The Hitchhiker’s Guide to the Galaxy', 'Douglas Adams', 0.016), mm('I, Robot', 'Isaac Asimov', 0.018),
    mm('Childhood’s End', 'Arthur C. Clarke', 0.018), mm('Ubik', 'Philip K. Dick', 0.018), mm('The Martian Chronicles', 'Ray Bradbury', 0.018), mm('Fahrenheit 451', 'Ray Bradbury', 0.016),
    mm('Snow Crash', 'Neal Stephenson', 0.03), mm('The Forever War', 'Joe Haldeman', 0.02), mm('Speaker for the Dead', 'Orson Scott Card', 0.024), mm('Dune Messiah', 'Frank Herbert', 0.02),
    mm('Children of Dune', 'Frank Herbert', 0.026), mm('Foundation and Empire', 'Isaac Asimov', 0.02)],
  '4,0': [mm('The Stars My Destination', 'Alfred Bester', 0.018), mm('A Fire Upon the Deep', 'Vernor Vinge', 0.034), mm('Diaspora', 'Greg Egan', 0.022),
    mm('Blindsight', 'Peter Watts', 0.022), mm('Cryptonomicon', 'Neal Stephenson', 0.05), mm('The Moon Is a Harsh Mistress', 'Robert A. Heinlein', 0.024),
    mm('Accelerando', 'Charles Stross', 0.026), mm('Permutation City', 'Greg Egan', 0.022), mm('Contact', 'Carl Sagan', 0.026),
    { ...mm('Dune (a second, battered copy)', 'Frank Herbert', 0.035), lay: 'flat' }, { ...mm('The Foundation Trilogy', 'Isaac Asimov', 0.04), lay: 'flat' }],
};
// OBJECTS in the twelve other cubes (Jade: candles, a ceramic polar bear, figurines of open-source mascots). One to
// three small things per cube, the back wall and the cube's sides visible round them. The candles are UNLIT (Jade).
// Which mascots, how many candles and which cube holds what are OUR picks.
// u = centre across the cube (0 left .. 1 right), s = scale (1 = the size below); sizes are set in build.js:
//   candle (pillar) r 0.035, h given; polar bear ~0.17 long, 0.11 high; mascots ~0.12-0.15 high
const OBJECTS = {
  '1,4': [{ k: 'ceramic polar bear', u: 0.5 }],
  '3,4': [{ k: 'Tux (Linux penguin) figurine', u: 0.42 }, { k: 'candle', u: 0.78, h: 0.09 }],
  '0,3': [{ k: 'candle', u: 0.35, h: 0.15 }, { k: 'candle', u: 0.62, h: 0.1 }],
  '2,3': [{ k: 'BSD daemon figurine', u: 0.5 }],
  '4,3': [{ k: 'GNU figurine', u: 0.5 }],
  '1,2': [{ k: 'Firefox fox figurine', u: 0.5 }],
  '3,2': [{ k: 'candle', u: 0.3, h: 0.16 }, { k: 'candle', u: 0.52, h: 0.11 }, { k: 'candle', u: 0.72, h: 0.07 }],
  '0,1': [{ k: 'PostgreSQL elephant (Slonik) figurine', u: 0.5 }],
  '2,1': [{ k: 'candle', u: 0.5, h: 0.18 }],
  '4,1': [{ k: 'Tux (Linux penguin) figurine', u: 0.35, s: 0.7 }, { k: 'candle', u: 0.7, h: 0.12 }],
  '1,0': [{ k: 'candle', u: 0.4, h: 0.13 }, { k: 'candle', u: 0.66, h: 0.13 }],
  '3,0': [{ k: 'Firefox fox figurine', u: 0.45, s: 0.8 }, { k: 'candle', u: 0.8, h: 0.08 }],
};
export const SHELF = (() => {
  const x0 = SH_CX - EX.W / 2, x1 = SH_CX + EX.W / 2, pitch = EX.C + EX.T;
  const cubes = [];
  for (let r = 0; r < EX.N; r++) for (let c = 0; c < EX.N; c++) {
    const cx0 = x0 + EX.F + c * pitch, cy0 = EX.F + r * pitch, key = `${c},${r}`, books = (c + r) % 2 === 0;
    cubes.push({ col: c, row: r, key, x0: cx0, x1: cx0 + EX.C, y0: cy0, y1: cy0 + EX.C, kind: books ? 'books' : 'objects',
      half: c < 2 ? 'beauty' : c > 2 ? 'truth' : 'split', books: books ? BOOKS[key] : null, objects: books ? null : OBJECTS[key] });
  }
  return {
    model: 'IKEA Expedit 5x5 (2010), espresso / black-brown', ...EX, cube: EX.C, pitch,
    cx: SH_CX, x0, x1, h: EX.H, depth: EX.D, frame: EX.F, div: EX.T,
    spineZ: EX.D - 0.015,                 // books pushed to the front: spines 1.5 cm behind the frame's front edge
    seam: SH_CX,                          // the centre line of the middle column
    col: 0x2a1d17, grey: 0.2,             // espresso
    cubes, cubeAt: (c, r) => cubes[r * EX.N + c],
    beauty: { side: 'left', cols: [0, 1], splitCol: 2, x0, x1: SH_CX, books: 'art and literature' },
    truth: { side: 'right', cols: [3, 4], splitCol: 2, x0: SH_CX, x1, books: 'science fiction, textbooks, popular science' },
  };
})();

// ---------------------------------------------------------------- where the Expedit 5x5 stands (Jade, page 2)
// Against the partition on the living-room side, back to the wall, facing WNW into the living room (toward the couch).
// Centred on the wall between its open end (the 2x2) and the core wall: Jade drew equal gaps (0.37 m each).
// SHELF above is in its own frame (x across the face, left -> right as you face it, centre 0; z 0 = its back, + toward
// you); shelfWorld() puts it in the room: facing the shelf you look ESE, so its left (beauty) is NNE (+X) and its
// right (truth) is SSW (-X), toward the 2x2 and the opening.
export const SHELF_AT = { X: 3.595, Zback: PARTITION.z0 };
export const shelfWorld = ([x, y, z]) => [SHELF_AT.X - x, y, SHELF_AT.Zback - z];
export const SHELF_W = {
  front: SHELF_AT.Zback - SHELF.depth, spines: SHELF_AT.Zback - SHELF.spineZ, back: SHELF_AT.Zback,
  X_ssw: SHELF_AT.X - SHELF.W / 2, X_nne: SHELF_AT.X + SHELF.W / 2, seam: SHELF_AT.X,
  beautyX: [SHELF_AT.X, SHELF_AT.X + SHELF.W / 2], truthX: [SHELF_AT.X - SHELF.W / 2, SHELF_AT.X],
  // world centre of a cube's opening (front plane)
  cube: (c, r) => { const cu = SHELF.cubeAt(c, r); return shelfWorld([(cu.x0 + cu.x1) / 2, (cu.y0 + cu.y1) / 2, SHELF.depth]); },
};

// the Expedit 2x2 at the partition's open end (Jade: "expedit 2x2"; "a printer sits on top of the 2x2"). Jade drew it
// across the wall's end, its 79 cm along the wall's thickness: it stands with its back to the wall's end face, facing
// SSW into the opening, centred on the wall line (so it overhangs the 15 cm wall by 32 cm each side: OUR reading).
// Contents of its four cubes: not given; ours = paper and printer things, kept plain.
export const EXPEDIT2 = { W: 0.79, H: 0.79, D: 0.39, F: 0.05, T: 0.016, X0: PARTITION.x0 - 0.39, X1: PARTITION.x0, Zc: (PARTITION.z0 + PARTITION.z1) / 2, col: 0x2a1d17,
  cubes: { '0,0': 'reams of printer paper', '1,0': 'a box of cables', '0,1': 'binders', '1,1': 'empty' } };
export const PRINTER = { w: 0.45, d: 0.36, h: 0.21, y: EXPEDIT2.H, kind: '2010 inkjet all-in-one (OUR pick of model)', col: 0x2c2c30 };

// ---------------------------------------------------------------- living room furniture (Jade, page 2; sizes real, positions by her relations)
// "modern white couch" with a "chaise": an L-sectional, back to the WNW (front) wall, the chaise at the SSW end running
// ESE along the SSW wall. Lengths: OURS from typical 2010 sectionals, kept to Jade's proportions (couch = half the room width).
export const COUCH = { kind: 'modern white sectional with chaise', x0: T, x1: 2.55, z0: T, z1: T + 0.95, chaise: { x0: T, x1: T + 0.85, z1: T + 1.65 }, seatH: 0.42, backH: 0.74, backD: 0.2, armW: 0.14, col: 0xeeeeea };
// Noguchi coffee table, IN-50 (Isamu Noguchi, Herman Miller, 1947/48). Jade (2026-11-25): her table; the first base was
// "wrong, right in spirit", so it was rebuilt from the real table (2026-11-25 late). Sources (NOTES.md has the list):
//   Herman Miller store page: 50" x 36" x 15 3/4" (127 x 91.4 x 40 cm), 3/4" (19 mm) glass, two identical solid-wood legs.
//   Herman Miller assembly sheet 113963-K: the legs pivot on a dowel; pins fix the angle between them (52 deg there).
//   Vitra factsheet (plan + elevation drawings, 1280 x 920 x 400): "two identical wooden elements", ground rounded edges.
// The glass outline, the leg profile and the plan layout are ESTIMATES measured off Vitra's scale drawings (~1.4 mm/px).
// One leg (the upper): a long bar whose top edge carries the glass, a tapering foot to the floor at its far end, and a
// short stub at the pivot end that hangs to mid-height. The lower leg is the SAME piece turned 180 deg in its own plane:
// its bottom edge on the floor, its far-end tip up to the glass, its stub rising to meet the upper stub at the pivot.
// Three points carry the glass, three touch the floor. Plan layout as Vitra's drawing (a "^": pivot under the apex side,
// the far ends toward the two front corners, ~85 deg apart); Herman Miller's sheet says 52 deg: a discrepancy, noted.
// Black legs (Jade: "curved black wooden supports" = the ebonised / black ash finish). Flat side toward the couch (WNW),
// apex toward the shelf (ESE), as she drew it. Where: (1.72, 1.98) as before.
export const NOGUCHI = { at: [1.72, 1.98], W: 1.27, D: 0.914, h: 0.40, glass: 0.019, legT: 0.04, legH: 0.381, src: 'Jade (her table); dimensions Herman Miller; shapes from Vitra drawings (estimates)',
  // glass, right half (cm; x from the centre line, y + toward the apex); mirrored for the left half
  glassHalf: [[0, 46], [9.1, 45.2], [17.7, 42.4], [26.5, 36.9], [32.9, 31.3], [40.8, 23.0], [47.9, 14.7], [54.1, 6.4], [59.2, -1.9], [62.7, -10.3], [64.0, -18.6], [62.9, -24.1], [59.9, -29.7], [54.4, -35.2], [43.4, -40.7], [33.0, -43.5], [16, -46], [0, -46]],
  // one leg's side profile (cm; x along its 80 cm length, 0 = far end, 70.7 = the pivot; y up, 0 = floor), the upper leg
  legProfile: [[7.4, 0], [10.1, 0], [11.3, 4.6], [12.4, 8.8], [13.8, 14.3], [15.9, 19.9], [18.3, 24.0], [21.0, 26.8], [23.9, 28.2], [35.1, 29.6], [53.0, 29.6], [60.6, 28.2], [64.3, 24.0], [67.4, 19.9],
    [67.4, 18.5], [74.0, 18.5], [74.0, 19.9], [76.7, 24.0], [79.4, 29.6], [80.0, 32.4], [79.4, 35.4], [78.0, 37.4], [57.9, 37.4], [40.8, 37.1], [31.7, 37.1], [21.5, 37.4], [6.4, 37.7], [2.9, 37.4],
    [1.6, 36.3], [0.2, 32.4], [0, 28.2], [0.4, 22.7], [1.4, 17.1], [2.7, 11.5], [4.3, 7.4], [5.8, 3.2]],
  legLen: 80, pivotX: 70.7,
  // plan (cm, table frame: x across, y + toward the apex): the pivot, and the far end of each leg
  pivot: [0, 26], ends: { upper: [47, -25.5], lower: [-47, -25.5] } };
// "glass top table" at the NNE wall (Jade, 2026-11-25 late): a SEMICIRCLE, flat side against the wall, ~3 ft (0.91 m) wide,
// ~1 ft (0.30 m) deep at the centre. Read as a half-ellipse (semi-axes 0.455 x 0.30), the flat side on the core wall's
// face (X 4.89), centred where she drew the D (Z 2.35). Height 0.76 m (console height), 12 mm glass, three slim
// chrome legs on a thin metal apron: OURS (ASSUMED).
export const GLASS_TABLE = { wallX: 4.89, zc: 2.35, W: 0.91, D: 0.30, h: 0.76, glass: 0.012, shape: 'half-ellipse (demilune)' };

// ---------------------------------------------------------------- kitchen and dining (Jade, page 2)
// "kitchen counters": a U along the partition, the core wall and the ESE wall (OUR depth 0.635, height 0.91).
export const COUNTERS = [
  { name: 'counter along the partition', x0: 2.82, x1: 4.89, z0: KITCHEN.z0, z1: KITCHEN.z0 + 0.635 },
  { name: 'counter along the core wall', x0: 4.89 - 0.635, x1: 4.89, z0: KITCHEN.z0 + 0.635, z1: KITCHEN.z1 },
  { name: 'counter along the ESE wall', x0: 3.30, x1: 4.89 - 0.635, z0: KITCHEN.z1 - 0.635, z1: KITCHEN.z1 },
];
export const COUNTER_H = 0.91;
export const SINK = { x0: 3.45, x1: 4.15, z: KITCHEN.z1 - 0.32 };        // under the ESE window (OURS)
export const STOVE = { x: 4.89 - 0.32, z0: 7.0, z1: 7.76 };               // on the core run (OURS); no fridge drawn, none modelled
// "pale IKEA dinner table" with "pale benches, tucked in": end-on to the SSW wall (Jade). 1.8 x 0.9 m: OURS.
export const DINING = { x0: T, x1: T + 1.8, z0: 7.2, z1: 8.1, h: 0.74, col: 0xe2cfa6,
  benches: [{ x0: 0.3, x1: 1.8, z0: 6.98, z1: 7.30 }, { x0: 0.3, x1: 1.8, z0: 8.0, z1: 8.32 }], benchH: 0.45 };

// ---------------------------------------------------------------- ceiling lights (Jade: "there were ceiling lights"; type and places OURS)
export const CEILING_LIGHTS = [
  { name: 'living room ceiling light (flush glass dome)', at: [2.55, HOUSE.ceil - 0.08, 2.55], r: 0.18 },
  { name: 'dining pendant (paper drum)', at: [1.05, 1.62, 7.65], r: 0.22, pendant: true },
  { name: 'kitchen ceiling light (flush glass dome)', at: [3.35, HOUSE.ceil - 0.08, 7.45], r: 0.16 },
];
// on / off per section: OURS (daylight bridge: off; from verse 3 on)
export const CEILING_ON = { prep: false, bridge: false, hardstop: false, verse3: true, silence: true, chorus2b: true };

// ---------------------------------------------------------------- the yard (Jade, page 1; ESE of the house)
// Registered from the 1:200 site plan (+/-0.3 m). Heights above grade are OURS.
// Jade (2026-11-25 late): the patio is a WOOD DECK level with the house floor, with wood stairs and a wood railing down to
// the yard. Railing 0.91 m (36") with 2x2 balusters at ~12 cm, posts at the corners and <= 1.8 m: OUR details.
export const PATIO = { x0: 0.93, x1: 3.88, z0: HOUSE.Z, z1: 12.97, top: 0, kind: 'wood deck level with the house floor (Jade), wood railing and wood stairs down to the yard' };
export const RAIL = { h: 0.91, post: 0.09, rail: [0.09, 0.04], baluster: 0.035, gap: 0.12 };
export const STAIRS = { x0: 3.88, x1: 5.86, landing: { z0: HOUSE.Z, z1: 11.3 }, z0: 11.3, z1: 12.9, risers: 4 };   // descending ESE to the lawn by the mint
export const STRAWBERRY = { x0: 1.03, x1: 3.89, z0: 13.07, z1: 15.06, h: 0.25, kind: 'strawberry plants and flowers, a raised timber bed' };
export const MINT = { at: [4.84, 14.2], r: 0.33, h: 0.45, kind: 'half whisky barrel of mint (drawn ~1.7 m across: real size used)' };
export const HOSE = { at: [9.57, 11.12], r: 0.26 };
export const CLOTHESLINE = { x: 8.2, z0: HOUSE.Z, z1: 19.6, y: GRADE + 1.95, kind: 'one line from a bracket on the ESE wall to a T-post by the back fence (Jade drew one line, house to fence)' };
export const FENCES = [
  { name: 'NNE wood fence', a: [13.1, 1.0], b: [13.1, 20.2], h: 1.8, src: 'Jade' },
  { name: 'ESE fence (back)', a: [-0.3, 20.2], b: [13.1, 20.2], h: 1.8, src: 'Jade' },
  { name: 'SSW fence', a: [-0.3, HOUSE.Z], b: [-0.3, 20.2], h: 1.8, src: 'ASSUMED (not drawn; the neighbour building stands 2.8 m beyond)' },
];
export const LAWN = { x0: -0.3, x1: 13.1, z0: HOUSE.Z, z1: 20.2 };
// the GIANT lemon tree by the NNE fence at the far end (Jade); lemons the size of pomelos (r 0.085; a lemon is ~0.035)
export const TREE = { at: [10.79, 19.07], trunkH: 1.75, trunkR: 0.14, canopyR: 2.3, canopyY: GRADE + 3.45, canopyK: 0.62, lemonR: 0.085, lemons: 26 };
// the neighbour's grapefruit tree; its branches spill over the NNE fence (Jade). Trunk beyond the fence: OURS.
export const GRAPEFRUIT = { trunk: [14.3, 12.85], at: [13.45, 12.85], canopyR: 1.55, canopyY: GRADE + 3.0, canopyK: 0.75, fruitR: 0.06, fruits: 14 };
// the lemonade: Jade (2026-11-25 late) made it BEFORE the party with the childhood friend, from lemons they picked off
// the tree; first love, Z and the guests had not arrived. During the party it stands on this table on the deck (OURS).
export const DRINKS = { x0: 2.55, x1: 3.45, z0: 11.9, z1: 12.5, h: 0.74, y: PATIO.top, kind: 'lemonade table on the deck (OURS); the lemonade was made before the party (Jade)' };
// the fire-poi spinner (Jade, 2026-11-25 late): in the yard, performing TOWARD the audience, who stand along the house's
// ESE wall and on the deck. Mark: the open lawn 5 m out from the wall, between the mint barrel and the clothesline,
// facing the audience's middle (AUDIENCE_AT): OUR pick. Two burning heads, each sweeping a circle beside the body.
export const AUDIENCE_AT = [5.2, 11.2];
export const POI = { at: [6.3, 15.6], floor: GRADE, yaw: +(Math.atan2(AUDIENCE_AT[0] - 6.3, AUDIENCE_AT[1] - 15.6) * 180 / Math.PI).toFixed(1), centreY: GRADE + 1.15, r: 0.72, side: 0.42, headR: 0.045 };
export const poiCentre = (s) => { const a = POI.yaw * Math.PI / 180, lx = Math.cos(a), lz = -Math.sin(a), fx = Math.sin(a), fz = Math.cos(a);
  return [POI.at[0] + s * POI.side * lx + 0.2 * fx, POI.centreY, POI.at[1] + s * POI.side * lz + 0.2 * fz]; };

// ---------------------------------------------------------------- her path (the gold line of verse 3): [X, Z, floor y]
// shelf -> through the opening -> round the dining table's NNE end -> the sliding door (greeting) -> the deck (hug)
// -> the landing and down the stairs -> across the lawn -> under the lemon tree (first love).
// the shelf mark keeps its old 0.92 m from the Expedit's front (which moved 0.32 m WNW with the thick wall)
export const MARK = { shelf: [2.72, 3.30] };
export const PATH = [[2.72, 3.30, 0], [2.0, 4.15, 0], [1.15, 5.0, 0], [1.55, 6.05, 0], [2.45, 6.75, 0], [2.55, 7.65, 0], [2.4, 8.6, 0], [1.55, 9.3, 0], [1.21, 9.95, 0],
  [1.6, 10.6, PATIO.top], [2.6, 10.85, PATIO.top], [4.0, 10.75, PATIO.top], [4.87, 11.1, PATIO.top], [4.87, 12.9, GRADE], [5.7, 13.6, GRADE], [7.2, 15.5, GRADE], [9.0, 17.2, GRADE], [9.9, 17.95, GRADE]];
export const MARKS = { shelf: MARK.shelf, crossing: [1.9, 6.4], greeting: [1.21, 9.62], hug: [2.6, 10.85], stairs: [4.87, 12.1], tree: [9.9, 17.95] };
export const MARK_FLOOR = { shelf: 0, crossing: 0, greeting: 0, hug: PATIO.top, stairs: GRADE + (PATIO.top - GRADE) / 2, tree: GRADE };

// ---------------------------------------------------------------- sun visibility (analytic, for the numbers in NOTES and the sidecars)
// March from p toward the sun; blocked by: the house (walls to the plate, the gable roof, the eaves), the neighbour
// prisms, the fences. NOT by trees or people (the flat / lit renders shadow those with real shadow maps).
const inPoly = (poly, x, z) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j];
  if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
function solidAt(x, y, z) {
  if (y < GRADE) return 'ground';
  const H = HOUSE, inX = x >= -H.rake && x <= H.X + H.rake, zz = Math.min(z, H.Z - z);
  if (inX && z >= -H.eave && z <= H.Z + H.eave) { const yr = H.plate + H.roofSlope * zz;
    if (x >= 0 && x <= H.X && z >= 0 && z <= H.Z) { if (y <= yr + 0.12 && y >= GRADE) return 'house'; }
    else if (y <= yr + 0.12 && y >= yr - 0.1) return 'house roof (eave / rake)'; }
  for (const b of NEIGHBOURS) if (b.build && y <= b.top && inPoly(b.poly, x, z)) return b.name;
  for (const f of FENCES) { const [ax, az] = f.a, [bx, bz] = f.b; if (y > GRADE + f.h) continue;
    if (ax === bx ? Math.abs(x - ax) < 0.03 && z >= Math.min(az, bz) && z <= Math.max(az, bz) : Math.abs(z - az) < 0.03 && x >= Math.min(ax, bx) && x <= Math.max(ax, bx)) return f.name; }
  return null;
}
export function sunlit(p, sun, { start = 0.03, max = 80, step = 0.025 } = {}) {
  if (!sun.up) return { lit: false, by: 'sun below the horizon' };
  // a point INSIDE the house: the ray must leave through an opening in the exterior wall it crosses (interior walls and
  // furniture are ignored here; the renders shadow those), below the ceiling; then it continues outside as usual.
  if (p[0] > 0 && p[0] < HOUSE.X && p[2] > 0 && p[2] < HOUSE.Z && p[1] >= 0 && p[1] < HOUSE.ceil) {
    const d = sun.toSun, ts = [];
    if (d[0] < 0) ts.push([-p[0] / d[0], 'SSW']); if (d[0] > 0) ts.push([(HOUSE.X - p[0]) / d[0], 'NNE']);
    if (d[2] < 0) ts.push([-p[2] / d[2], 'WNW']); if (d[2] > 0) ts.push([(HOUSE.Z - p[2]) / d[2], 'ESE']);
    const [t, wall] = ts.sort((a, b) => a[0] - b[0])[0], q = p.map((v, i) => v + d[i] * t);
    if (q[1] >= HOUSE.ceil) return { lit: false, by: 'ceiling' };
    const sAlong = wall === 'WNW' || wall === 'ESE' ? q[0] : q[2];
    const o = OPENINGS.find((o) => o.wall === wall && sAlong >= o.s0 && sAlong <= o.s1 && q[1] >= o.y0 && q[1] <= o.y1);
    if (!o) return { lit: false, by: `exterior wall (${wall})`, at: q.map((v) => +v.toFixed(2)) };
    const r = sunlit(q.map((v, i) => v + d[i] * 0.2), sun, { start, max, step }); return r.lit ? { lit: true, via: o.name } : { ...r, via: o.name };
  }
  for (let t = start; t < max; t += step) { const q = [p[0] + sun.toSun[0] * t, p[1] + sun.toSun[1] * t, p[2] + sun.toSun[2] * t];
    if (q[1] > 12) break; const s = solidAt(...q); if (s) return { lit: false, by: s, at: q.map((v) => +v.toFixed(2)) }; }
  return { lit: true };
}
// the fraction of an opening's aperture that sees the sun (7 x 5 samples, 3 cm outside the outer face)
export function apertureLit(o, sun) {
  const A = apertureOf(o), n = o.wall === 'WNW' ? [0, 0, -1] : o.wall === 'ESE' ? [0, 0, 1] : o.wall === 'SSW' ? [-1, 0, 0] : [1, 0, 0];
  if (!sun.up || n[0] * sun.toSun[0] + n[2] * sun.toSun[2] <= 0) return { frac: 0, by: sun.up ? 'the sun is behind this wall' : 'night' };
  let k = 0, N = 0; const by = {};
  for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) { const u = (i + 0.5) / 7, v = (j + 0.5) / 5;
    const p = [0, 1, 2].map((c) => A[3][c] + (A[2][c] - A[3][c]) * u + (A[0][c] - A[3][c]) * v + n[c] * 0.03);
    const r = sunlit(p, sun); N++; if (r.lit) k++; else by[r.by] = (by[r.by] || 0) + 1; }
  return { frac: +(k / N).toFixed(2), by };
}

// ---------------------------------------------------------------- LIGHTS: every source, per section
// sun: the real sun for the section's clock time (SCENE); off when below the horizon.
// sky: the daylight / dusk sky as ambient, scaled with the sun.
// ceiling: the three ceiling fixtures (CEILING_ON per section).
// poi: the fire, from verse 3 on (Jade: the fire spinning came later, at dusk and into dark).
export const SECTION_LIGHT = {
  prep: { sun: true, ceiling: false, poi: false, sky: 1.0 },
  bridge: { sun: true, ceiling: CEILING_ON.bridge, poi: false, sky: 1.0 },
  hardstop: { sun: true, ceiling: CEILING_ON.hardstop, poi: false, sky: 1.0 },
  verse3: { sun: true, ceiling: CEILING_ON.verse3, poi: true, sky: 0.55 },
  silence: { sun: false, ceiling: CEILING_ON.silence, poi: true, sky: 0.25 },
  chorus2b: { sun: false, ceiling: CEILING_ON.chorus2b, poi: true, sky: 0.25 },
};
export const LIGHTS = {
  sun: { kind: 'the sun (parallel), computed per section from SCENE', per_section: Object.fromEntries(Object.entries(SUN).map(([k, s]) => [k, { time: s.time, elev_deg: s.elev, az_deg: s.az, up: s.up, travel_dir_world: s.dir.map((v) => +v.toFixed(4)) }])) },
  ceiling: { kind: 'ceiling fixtures (omni, warm 2700 K); type and positions ASSUMED', fixtures: CEILING_LIGHTS.map((c) => ({ name: c.name, pos: c.at })), on: CEILING_ON, color: 0xffd6a0 },
  poi: { kind: 'fire poi (two moving flames; effective point between the circles)', pos: [POI.at[0], POI.centreY, POI.at[1]], color: 0xff7a20, reach: 4.5, room: 'yard', from: 'verse 3' },
  sky: { kind: 'ambient sky', color: 0x8aa0c8, night: 0x2a3050 },
};
// lit footprints (world). The sun's are computed per section (sunFootprints); the beam masks are rendered from these.
export function sunFootprints(section) {
  const sun = SUN[section]; if (!sun || !sun.up) return { section, sun: 'below the horizon', openings: [] };
  return { section, time: sun.time, elev: sun.elev, az: sun.az, openings: OPENINGS.map((o) => ({ name: o.name, ...apertureLit(o, sun) })).filter((o) => o.frac > 0 || Object.keys(o.by || {}).length) };
}
export const FOOTPRINTS = {
  sun_rooms: { note: 'sunlit shafts through each opening that sees the sun (fraction of the aperture lit, what blocks the rest); the shaft volumes are clipped by the room box and drawn in the beam masks', per_section: Object.fromEntries(['bridge', 'verse3'].map((k) => [k, sunFootprints(k)])) },
  sun_yard: { note: 'NOT masked: in the yard the sun is the shadow-mapped directional light in flat / lit; the analytic test (sunlit) gives the numbers in NOTES' },
  poi_ground: { centre: [POI.at[0], GRADE, POI.at[1]], radius: 4.5, note: 'falls off with distance; the light source of the silence and of the yard after sunset' },
  ceiling: { note: 'omni fixtures: no shaft and no mask; they fill the room they hang in' },
};

// ---------------------------------------------------------------- the room crossing, as data (V3_rcv; "Room crossing velocity")
// Timeline: the -2sm render, media/karaoke_v2/lyrics_timed.json, full mix: "Room crossing velocity" 194.59-198.72 s
// ("Room" 194.59, "crossing" 195.18, "velocity" 197.06). The older v3 song map had 203.8-207.4 (tail ~208.9). The walk: shelf -> the opening by the 2x2
// and the printer -> round the dining table's NNE end -> the sliding door = PATH[0..8]. Speeds per segment are INVENTED
// (a plausible party walk, 1.1-1.3 m/s, slowing for the opening and at the doors), for the compositor's v = ds/dt.
export const CROSSING = (() => {
  const pts = PATH.slice(0, 9).map(([x, z]) => [x, z]);
  const speeds = [1.15, 0.85, 0.9, 1.2, 1.28, 1.25, 1.1, 0.9];
  const notes = ['leaving the shelf', 'slowing for the opening (2x2 Expedit and printer at her right)', 'through the opening', 'into the dining area',
    'past the dining table’s NNE end', 'along the counter side', 'turning toward the sliding door', 'slowing at the sliding door'];
  const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  let t = 0, s = 0; const segs = [], stamps = [{ i: 0, at: pts[0], t_s: 0, s_m: 0 }];
  for (let i = 0; i + 1 < pts.length; i++) { const L = len(pts[i], pts[i + 1]), dt = L / speeds[i]; t += dt; s += L;
    segs.push({ i, from: pts[i], to: pts[i + 1], length_m: +L.toFixed(3), speed_mps: speeds[i], dt_s: +dt.toFixed(3), heading_bearing_deg: +(((Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180 / Math.PI) + BEARING.X + 360) % 360).toFixed(1), note: notes[i] });
    stamps.push({ i: i + 1, at: pts[i + 1], t_s: +t.toFixed(3), s_m: +s.toFixed(3) }); }
  // turn at each inner vertex: signed degrees, + = to her left (counter-clockwise seen from above with NNE up, ESE right)
  const turns = []; for (let i = 1; i + 1 < pts.length; i++) { const a = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]], b = [pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]];
    const ang = Math.atan2(a[1] * b[0] - a[0] * b[1], a[0] * b[0] + a[1] * b[1]) * 180 / Math.PI; turns.push({ at: pts[i], turn_deg: +ang.toFixed(1), side: ang > 0 ? 'left' : 'right' }); }
  // the shortest walkable path: a visibility graph on the obstacles inflated by her half-width + clearance (0.25 m)
  const r = 0.25, OB = [
    { name: 'Expedit 2x2 + printer', x0: EXPEDIT2.X0, x1: EXPEDIT2.X1, z0: EXPEDIT2.Zc - EXPEDIT2.W / 2, z1: EXPEDIT2.Zc + EXPEDIT2.W / 2 },
    { name: 'partition wall', x0: PARTITION.x0, x1: 4.95, z0: PARTITION.z0, z1: PARTITION.z1 },
    { name: 'Expedit 5x5', x0: SHELF_W.X_ssw, x1: SHELF_W.X_nne, z0: SHELF_W.front, z1: SHELF_W.back },
    { name: 'counter along the partition', x0: COUNTERS[0].x0, x1: COUNTERS[0].x1, z0: COUNTERS[0].z0, z1: COUNTERS[0].z1 },
    { name: 'dining table and benches', x0: DINING.x0, x1: DINING.x1, z0: DINING.benches[0].z0, z1: DINING.benches[1].z1 },
  ];
  const inf = OB.map((o) => ({ x0: o.x0 - r, x1: o.x1 + r, z0: o.z0 - r, z1: o.z1 + r })), wallX = LIVING.x0 + r;
  const segHits = (a, b) => { if (a[0] < wallX - 1e-6 || b[0] < wallX - 1e-6) return true;
    for (const o of inf) { let t0 = 0, t1 = 1; const d = [b[0] - a[0], b[1] - a[1]];
      for (const [p, q, lo, hi] of [[a[0], d[0], o.x0 + 1e-6, o.x1 - 1e-6], [a[1], d[1], o.z0 + 1e-6, o.z1 - 1e-6]]) {
        if (Math.abs(q) < 1e-12) { if (p <= lo || p >= hi) { t0 = 2; break; } continue; }
        let u0 = (lo - p) / q, u1 = (hi - p) / q; if (u0 > u1) [u0, u1] = [u1, u0]; t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); }
      if (t0 < t1) return true; } return false; };
  const A = pts[0], B = pts[pts.length - 1], nodes = [A, B, ...inf.flatMap((o) => [[o.x0, o.z0], [o.x0, o.z1], [o.x1, o.z0], [o.x1, o.z1]])].filter((p) => p[0] >= wallX - 1e-6);
  const dist = nodes.map(() => Infinity), prev = nodes.map(() => -1), done = nodes.map(() => false); dist[0] = 0;
  for (;;) { let k = -1; for (let i = 0; i < nodes.length; i++) if (!done[i] && (k < 0 || dist[i] < dist[k])) k = i; if (k < 0 || dist[k] === Infinity) break; done[k] = true; if (k === 1) break;
    for (let j = 0; j < nodes.length; j++) if (!done[j] && !segHits(nodes[k], nodes[j])) { const dd = dist[k] + len(nodes[k], nodes[j]); if (dd < dist[j]) { dist[j] = dd; prev[j] = k; } } }
  const sp = []; for (let k = 1; k >= 0; k = prev[k]) sp.unshift(nodes[k].map((v) => +v.toFixed(3)));
  return { points: pts, segments: segs, stamps, turns, total_m: +s.toFixed(3), total_s: +t.toFixed(3), mean_speed_mps: +(s / t).toFixed(3),
    straight_line_m: +len(A, B).toFixed(3), shortest_walkable_m: +dist[1].toFixed(3), shortest_walkable_path: sp, detour_ratio_vs_shortest: +(s / dist[1]).toFixed(3),
    clearance_m: r, obstacles: OB, song: { lyric: 'Room crossing velocity', timeline: 'media/karaoke_v2/lyrics_timed.json (-2sm), full mix', start_s: 194.59, end_s: 198.72, words_s: { Room: 194.59, crossing: 195.175, velocity: 197.056 }, instrumental_track_s: [194.619, 198.759], v3_song_map_s: [203.8, 207.4] },
    fit_note: `the invented walk takes ${t.toFixed(1)} s; the line lasts 4.13 s (194.59-198.72): to play the whole walk under it, run it ${(t / 4.13).toFixed(2)}x fast, or let the shot show its middle`,
    invented: 'speeds and timestamps are OURS (plausible pace), not Jade’s; the route is set by her drawing of the rooms and furniture' };
})();
