// SHANGHAI 1986 — single source of truth for numbers (metres, y up, floor at y = 0).
// The LIVING ROOM of the family's whole-floor flat in 协发公寓 (Xiefa Apartments / "Yafa Court"), 253 Wuyuan Rd,
// Robert Fan, 1933-34: the 3rd floor (Chinese count, 三楼), EAST flat (俞振飞's flat; Jade, 2026-11-25).
// Numbers from inputs/refs_shanghai/README.md (the 1934 plan, read at +/-0.2 m) and Jade. Where they conflict,
// JADE WINS (2026-11-25 (2) and (3)):
//   - ONE long room along the facade: the grandparents joined the living room and the dining room (beside it, both on
//     the balcony) into one space long before 1986. ~9.5 m along the windows, 6.1 m deep. A shallow soffit marks the
//     old partition line (JOIN_X).
//   - The hall French doors are a double-wide pair in the NORTH wall, opposite the six French windows. Bookshelf
//     cabinets fill the north wall on both sides of them; the TV cabinet is in the north-east corner.
//   - The couch is on the WEST wall; the armchair beside it leaves ~0.7 m to the bookshelf fronts.
//
// Axes are the BUILDING's, not the compass:
//   x: along the facade, + = building east (bearing 76.8 deg)    -2.5 = west wall (couch) ... +7.0 = east wall
//   z: + = out through the French windows (bearing 166.8 deg, SSE)   0 = window wall (inner face) ... -6.1 = north wall (doors)
// The sun is computed for the real place and time (SCENE) and turned into these axes: nothing is "swung" by hand.

// ---------------------------------------------------------------- the switches
// FLAT: 'east' (FACT, Jade). 'west' = the mirror flat: iron-railed balcony (the doors are centred, so they do not move).
export const FLAT = 'east';
// SCENE: date and time of the beam. Jade remembers neither the season nor the hour: this is a STAGING CHOICE, picked by
// sweeping Nov-Feb x 07:30-15:00 (sweep.mjs) for the honest sun that lights her face and the tea steam, lights part of
// the table, and runs toward the north doors without reaching Mother. See NOTES "2026-11-25 (2)".
export const SCENE = { date: '1986-12-21', time: '08:31', tzHours: 8, lat: 31.2138, lon: 121.4390 };
export const FACADE_BEARING = 166.8;   // compass bearing of the outward normal of the south (garden) facade
export const FLOOR_ABOVE_GARDEN = 6.6; // 三楼 = two storeys up; only matters for what the windows see

const D2R = Math.PI / 180;
// ---------------------------------------------------------------- sun position (NOAA solar calculator equations)
// returns { elev (deg, with refraction), az (deg compass, from north, clockwise) }
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

// ---------------------------------------------------------------- the room
export const MX = 1;   // kept for old imports: nothing mirrors any more (the doors are in the north wall)
export const ROOM = { x0: -2.5, x1: 7.0, z0: -6.1, z1: 0, h: 3.05, storey: 3.25, wallS: 0.28, wallP: 0.15 };
// where the old living/dining partition stood (the 1934 living room was ~5.0 m wide): a subtle soffit at the ceiling
export const JOIN = { x: 2.5, w: 0.24, drop: 0.1 };
// French windows (steel, full height) onto the one continuous balcony: the six-leaf set ("六扇落地长窗", 3.6 m) in
// the old living room, a four-leaf set in the old dining room (an ASSUMPTION: the text says both rooms opened onto the
// balcony; their width and position are guesses). Glass plane `zg` inside the wall.
const WIN_COMMON = { y0: 0.03, y1: 2.3, zg: 0.16, lites: 6, frame: 0.035, bar: 0.016 };
export const WINDOWS = [{ id: 'six French windows (old living room)', x0: -1.8, x1: 1.8, leaves: 6, ...WIN_COMMON },
  { id: 'four French windows (old dining room)', x0: 3.55, x1: 5.95, leaves: 4, ...WIN_COMMON }];
export const WINDOW = WINDOWS[0];
// balcony, one step down, now along the whole room (both rooms opened onto it); solid parapet in the east flat
export const BALCONY = { x0: ROOM.x0 - 0.25, x1: ROOM.x1 + 0.25, z0: ROOM.wallS, z1: ROOM.wallS + 1.25, floor: -0.05, parapet: 0.95, pT: 0.1, solid: FLAT === 'east', soffit: ROOM.storey - 0.05 - 0.12 };
// hall French doors (Jade): a double-wide pair in the NORTH wall opposite the six windows, glazed, transom (气窗) above
export const DOOR = { wall: 'north', z: ROOM.z0, x0: -0.8, x1: 0.8, h: 2.2, trans0: 2.28, trans1: 2.72, openDeg: 95 };
export const HALL = { x0: -2.0, x1: 2.0, z0: ROOM.z0 - ROOM.wallP - 2.3, z1: ROOM.z0 - ROOM.wallP };   // beyond the doors
// bookshelf cabinets along the north wall on both sides of the doors (Jade), glass-fronted above, doors below
export const SHELVES = { d: 0.38, h: 2.05, runs: [[ROOM.x0, DOOR.x0 - 0.07], [DOOR.x1 + 0.07, 6.02]] };
export const SHELF_FRONT = ROOM.z0 + SHELVES.d;

// ---------------------------------------------------------------- THE BEAM (honest: overhang, parapet, reveals)
// The lit aperture on the glass plane is the window opening minus the shadows of the outer reveal (the jamb on the
// sun's side and the head), the overhang and the parapet (front + the end on the sun's side). Each is a half-plane
// a*x + b*y <= c in the glass plane, so the aperture is convex. beamFor(scene) returns everything for one date/time.
function clipPoly(P, a, b, c) {   // keep a*x + b*y <= c
  const out = []; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], fp = a * p[0] + b * p[1] - c, fq = a * q[0] + b * q[1] - c;
    if (fp <= 0) out.push(p); if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); } }
  return out;
}
const inConvex = (P, x, y) => { let sgn = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; const c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); if (Math.abs(c) < 1e-9) continue; const s = Math.sign(c); if (sgn && s !== sgn) return false; sgn = s; } return true; };
const segDist = (a, b, x, y) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
const edgeDist = (P, x, y) => Math.min(...P.map((a, i) => segDist(a, P[(i + 1) % P.length], x, y)));   // to the polygon's boundary

function apertureFor(W, TX, TY, ok) {
  const B = BALCONY, outerD = ROOM.wallS - W.zg, parD = B.z1 - B.pT - W.zg, ovD = B.z1 - W.zg, PTOP = B.floor + B.parapet;
  // a ray leaving the glass at (x, y) toward the sun is, Δ metres further out, at (x - TX Δ, y + TY Δ)
  const HALF = [
    TX >= 0 ? ['outer reveal, west jamb', -1, 0, -(W.x0 + TX * outerD)] : ['outer reveal, east jamb', 1, 0, W.x1 + TX * outerD],
    ['outer reveal, head', 0, 1, W.y1 - TY * outerD],
    ['overhang (balcony above)', 0, 1, B.soffit - TY * ovD],
  ];
  if (B.solid) { HALF.push(['front parapet', 0, -1, -(PTOP - TY * parD)]);
    // the parapet's end on the sun's side (inner face x = XS): the ray reaches it after (x - XS) / TX metres and must
    // then be above its top: y + k (x - XS) >= PTOP, k = TY / TX. Where the ray meets the front first, this is inactive.
    if (Math.abs(TX) > 1e-3) { const XS = TX > 0 ? B.x0 + B.pT : B.x1 - B.pT, k = TY / TX; HALF.push([TX > 0 ? 'west parapet end' : 'east parapet end', -k, -1, -(PTOP + k * XS)]); } }
  let AP = [[W.x0, W.y0], [W.x1, W.y0], [W.x1, W.y1], [W.x0, W.y1]];
  if (ok) for (const [, a, b, c] of HALF) AP = clipPoly(AP, a, b, c); else AP = [];
  const glass = AP.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4), W.zg]);
  // carried to the inner wall face (z = 0) and trimmed by the inner reveal (the jamb away from the sun) and the floor
  let AP0 = AP.map(([x, y]) => [x + TX * W.zg, y - TY * W.zg]);
  AP0 = TX >= 0 ? clipPoly(AP0, 1, 0, W.x1) : clipPoly(AP0, -1, 0, -W.x0); AP0 = clipPoly(AP0, 0, -1, -0.002);   // 2 mm up: a clean floor cut
  // corner order as seen from INSIDE looking out (east on the left): TL (top, east), TR (top, west), on round
  let SRC = AP0.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4), 0]);
  if (SRC.length > 2) { let k = 0; SRC.forEach((p, i) => { const q = SRC[k]; if (p[1] > q[1] + 1e-6 || (Math.abs(p[1] - q[1]) < 1e-6 && p[0] > q[0])) k = i; });
    SRC = SRC.slice(k).concat(SRC.slice(0, k)); if (SRC[1][0] > SRC[0][0]) SRC = [SRC[0], ...SRC.slice(1).reverse()]; }
  return { glass, source: SRC, half: HALF.map((h) => h[0]) };
}
export function beamFor(scene) {
  const SP = scene.cheat ? { elev: scene.cheat.elev, az: FACADE_BEARING + scene.cheat.rel } : sunPosition(scene);   // cheat: a direction set by hand (not a real sun)
  const REL = SP.az - FACADE_BEARING, E = SP.elev * D2R, R = REL * D2R;   // REL > 0: sun west of the normal (afternoon)
  const SUN = { elev: SP.elev, az: SP.az, rel: +REL.toFixed(2), color: 0xfff1d0, ...scene, profile_deg: +(Math.atan(Math.tan(E) / Math.cos(R)) / D2R).toFixed(2) };
  const SUN_DIR = [Math.sin(R) * Math.cos(E), -Math.sin(E), -Math.cos(R) * Math.cos(E)];   // unit travel direction
  const ok = SUN_DIR[2] < -0.05 && SP.elev > 1;
  const TX = ok ? -SUN_DIR[0] / SUN_DIR[2] : 0, TY = ok ? SUN_DIR[1] / SUN_DIR[2] : 0;   // per metre INTO the room: metres east, metres down
  const APS = WINDOWS.map((W) => ({ id: W.id, ...apertureFor(W, TX, TY, ok) }));
  const SOURCES = APS.map((a) => a.source).filter((s) => s.length > 2);
  const BEAM_SOURCE = APS[0].source, APERTURE_GLASS = APS[0].glass;
  const sunLand = (p, y = 0) => { const t = (p[1] - y) / -SUN_DIR[1]; return [p[0] + SUN_DIR[0] * t, y, p[2] + SUN_DIR[2] * t]; };
  const beamFootprint = (y = 0) => BEAM_SOURCE.map((p) => sunLand(p, y));
  const traceBack = (p) => { const t = p[2] / SUN_DIR[2]; return { x: p[0] - SUN_DIR[0] * t, y: p[1] - SUN_DIR[1] * t, t }; };
  const inRoom = (p) => !(p[2] > 0 || p[1] < 0 || p[0] > ROOM.x1 || p[0] < ROOM.x0 || p[2] < ROOM.z0 || p[1] > ROOM.h);
  // which window's light a room point is in (-1: none); figures and furniture are not occluders here
  const beamWindow = (p) => { if (!ok || !inRoom(p)) return -1; const q = traceBack(p); if (q.t < 0) return -1; return APS.findIndex((a) => a.source.length > 2 && inConvex(a.source, q.x, q.y)); };
  const inBeam = (p) => beamWindow(p) >= 0;
  // signed margin (metres, measured in the inner wall plane) to the nearest lit aperture: > 0 inside, < 0 outside
  const beamMargin = (p) => { if (!ok) return -9; const q = traceBack(p); let best = -99;
    for (const a of APS) { if (a.source.length < 3) continue; const d = edgeDist(a.source, q.x, q.y), m = inConvex(a.source, q.x, q.y) && q.t >= 0 ? d : -d; if (m > best) best = m; }
    return +best.toFixed(3); };
  return { SUN, SUN_DIR, SUN_SLOPES: { east_per_m_in: +TX.toFixed(3), down_per_m_in: +TY.toFixed(3) }, HALF: APS[0].half.map((h) => [h]), APS, APERTURE_GLASS, BEAM_SOURCE, SOURCES, sunLand, beamFootprint, traceBack, inBeam, beamWindow, beamMargin, ok };
}
const BF = beamFor(SCENE);
if (!BF.ok) console.warn('shanghai86: no direct sun on the south facade at', SCENE.date, SCENE.time);
export const { SUN, SUN_DIR, SUN_SLOPES, APERTURE_GLASS, BEAM_SOURCE, SOURCES, APS, sunLand, beamFootprint, traceBack, inBeam, beamWindow, beamMargin } = BF;
export const beamWestMargin = beamMargin;   // old name
export const BEAM = { kind: 'low winter sun through the French windows (six + four leaves), under the balcony above and over the parapet (parallel light)',
  source: BEAM_SOURCE, dir: SUN_DIR, shading: BF.HALF.map((h) => h[0]) };

// ---------------------------------------------------------------- furniture (Jade 2026-11-25 (2), (3))
// The couch group sits at the west end, couch against the WEST wall. The armchair beside the couch (the L at its north
// end) keeps SHELF_CLEAR between its back and the bookshelf fronts: room to stand and reach the books (Jade). Couch,
// table and her spot follow it with the same armrest gap, so the couch ends up ~2.1 m from the window-wall corner.
export const SHELF_CLEAR = 0.68;
const AW = 0.66, AD = 0.68, AYAW = 12, ARM_GAP = 0.36, ARM_GAP_S = 0.55;   // south gap widened to take the side table (Jade, round 4)
const ABACK = AD / 2 * Math.cos(AYAW * D2R) + AW / 2 * Math.sin(AYAW * D2R);   // the rotated armchair's half-extent toward its back
const A_Z = SHELF_FRONT + SHELF_CLEAR + ABACK;                                     // armchair centre z
export const COUCH = { x0: ROOM.x0, x1: ROOM.x0 + 0.86, z0: A_Z + AD / 2 + ARM_GAP, z1: A_Z + AD / 2 + ARM_GAP + 1.8, seat: 0.42, back: 0.84, arm: 0.6, armW: 0.16 };
export const COUCH_TO_CORNER = +(-COUCH.z1).toFixed(2);
export const TABLE = { cx: COUCH.x1 + 0.44 + 0.275, cz: (COUCH.z0 + COUCH.z1) / 2, w: 0.55, d: 0.95, h: 0.42 };   // coffee table (茶几), centred in front of the couch
export const ARMCHAIRS = [   // small upholstered armchairs; yaw 0 faces +z (the windows), 90 faces +x
  { id: 'beside', at: [COUCH.x1 + 0.37, A_Z], yaw: AYAW, w: AW, d: AD },                         // the L: at the couch's north end, facing the windows and the table
  { id: 'across', at: [TABLE.cx + 0.275 + 0.42 + 0.34, TABLE.cz], yaw: -90, w: AW, d: AD },     // across the table from the couch
  { id: 'opposite', at: [COUCH.x1 + 0.37, COUCH.z1 + ARM_GAP_S + AD / 2], yaw: 180 - AYAW, w: AW, d: AD },   // at the couch's SOUTH end, facing the L armchair across the table (Jade, round 4)
];
// small side table in the gap between the couch's south arm and the opposite armchair (a drink for either seat)
export const SIDE_TABLE = { cx: COUCH.x1 - 0.22, cz: COUCH.z1 + 0.265, w: 0.45, d: 0.45, h: 0.55 };
// her own small wooden table and chair (Jade's revised memory, round 4): as a pair where the wicker lounger used to be,
// at the old partition line by the windows, the chair at the table facing the light
export const CHILD_TABLE = { cx: 3.0, cz: -1.3, w: 0.6, d: 0.45, h: 0.48 };
export const CHILD_CHAIR = { at: [3.0, -1.3 - 0.225 - 0.19], yaw: 0, seat: 0.27, w: 0.3, d: 0.29, back: 0.52 };
export const LOUNGER = { at: [0.7, -1.2], yaw: -20, w: 0.6, l: 1.45 };   // wicker lounge chair (藤躺椅), moved WEST along the six windows (Jade, round 4): east of the couch group, feet to the light
// TV cabinet on the EAST wall (Jade, round 3b: where the sideboard stood, toward the clock), facing west down the room
export const TV = { x0: ROOM.x1 - 0.48, x1: ROOM.x1, z0: -3.95, z1: -3.05, h: 0.72, wall: 'east' };
export const DINING_TABLE = { at: [4.6, -2.6], l: 1.9, w: 0.88, h: 0.76 };   // Jade, NOT SURE (round 4): a long rectangular table, long axis along the room, 8 chairs
export const SIDEBOARD = { x0: 6.07, x1: ROOM.x1, z0: ROOM.z0, z1: ROOM.z0 + 0.45, h: 0.9 };   // moved to the north-east corner, at the end of the bookshelves (my choice: flag)
export const RADIATOR = { wall: 'east', x: ROOM.x1 - 0.06, z0: -1.05, z1: -0.4, h: 0.62 };   // the original cast-iron radiator (cold in 1986)
export const CALENDAR = { wall: 'east', z: -4.4, y: 1.45, w: 0.36, h: 0.52 };
// west wall (Jade: calligraphy hanging scrolls; one large framed traditional painting, wall not stated: placed here, over the couch)
export const PAINTING = { wall: 'west', z: (COUCH.z0 + COUCH.z1) / 2, y: 1.72, w: 1.3, h: 0.72 };
export const SCROLLS = [-0.75, -1.3, -1.85].map((z) => ({ wall: 'west', z, top: 2.5, w: 0.42, h: 1.5 }));
export const CLOCK = { wall: 'east', z: -5.0, y: 2.25 };
export const PLANT = [-2.22, -0.22];
export const PENDANT = { x: 0, z: -3.0, drop: 0.55 };
export const PENDANT2 = { x: DINING_TABLE.at[0], z: DINING_TABLE.at[1], drop: 0.75 };

// ---------------------------------------------------------------- her spot: equidistant from the couch, the armchair beside it, the table
const rectDist = (p, cx, cz, w, d, yawDeg = 0) => { const a = -yawDeg * D2R, dx = p[0] - cx, dz = p[1] - cz;
  const lx = dx * Math.cos(a) + dz * Math.sin(a), lz = -dx * Math.sin(a) + dz * Math.cos(a);   // into the rect's frame
  const ex = Math.max(Math.abs(lx) - w / 2, 0), ez = Math.max(Math.abs(lz) - d / 2, 0); return Math.hypot(ex, ez); };
const SEATS = {
  couch: (p) => rectDist(p, (COUCH.x0 + COUCH.x1) / 2, (COUCH.z0 + COUCH.z1) / 2, COUCH.x1 - COUCH.x0, COUCH.z1 - COUCH.z0),
  armchair: (p) => { const A = ARMCHAIRS[0]; return rectDist(p, A.at[0], A.at[1], A.w, A.d, A.yaw); },
  table: (p) => rectDist(p, TABLE.cx, TABLE.cz, TABLE.w, TABLE.d),
};
function equidistant() { let best = null;   // the nearest point (smallest common gap) whose three gaps agree within 2 cm
  for (let x = COUCH.x1; x < TABLE.cx + TABLE.w / 2 + 0.6; x += 0.005) for (let z = TABLE.cz - TABLE.d / 2 - 1.2; z < TABLE.cz; z += 0.005) {
    const d = Object.values(SEATS).map((f) => f([x, z])); const s = Math.max(...d) - Math.min(...d);
    if (s < 0.02 && Math.min(...d) > 0.2 && (!best || Math.max(...d) < best.dmax)) best = { p: [+x.toFixed(3), +z.toFixed(3)], s, dmax: Math.max(...d), d }; }
  return { at: best.p, gaps: Object.fromEntries(Object.keys(SEATS).map((k, i) => [k, +best.d[i].toFixed(3)])) }; }
export const HER_SPOT = equidistant();

// ---------------------------------------------------------------- places
const [HX, HZ] = HER_SPOT.at; const ARMCHAIRS_ACROSS_X = () => ARMCHAIRS[1].at[0];
export const PLACES = {
  // state B: she sits back on her heels at the equidistant spot, facing the table and the light (south), working on
  // the table's north end
  jadeSit: HER_SPOT.at, jadeYaw: 20,
  focus: [TABLE.cx - TABLE.w / 2 + 0.14, TABLE.h + 0.003, TABLE.cz - TABLE.d / 2 + 0.13],   // the clear patch at the table's north-west corner, in front of her
  stack: [TABLE.cx - 0.12, TABLE.cz + 0.25],                                   // the stack of 草纸 she brought
  mugs: [[TABLE.cx + 0.17, TABLE.cz - 0.32], [TABLE.cx + 0.17, TABLE.cz - 0.06], [TABLE.cx + 0.19, TABLE.cz + 0.2]],   // green tea, steaming (east side of the table, beside her)
  drift: { at: [HX + 0.05, HZ + 0.12], seed: 1986 },
  // state A: the uncle sits in the 'across' armchair (just outside the light's east edge), leaning in over the table,
  // his hands low in the light; she kneels at her spot (the same place a week later), watching his hands
  uncleSeat: [ARMCHAIRS_ACROSS_X() + 0.08, TABLE.cz], uncleHands: [TABLE.cx + 0.17, 0.6, TABLE.cz - 0.2], jadeStand: HER_SPOT.at,
  // everybody else, out of the light
  mother: [0, ROOM.z0 - 0.08],                 // in the north doorway
  grandma: [ARMCHAIRS_ACROSS_X() + 0.08, TABLE.cz],   // in the 'across' armchair (state B), just outside the light
  aunt: [1.3, -2.45], uncleLaugh: [0.8, -3.35],   // in the dark between the two shafts
};
// one sheet of old-style Chinese toilet paper (草纸, coarse straw paper): Jade's size, a little over half-Letter
export const PAPER = { w: 0.16, h: 0.23, t: 0.00035, stack: 34, col: 0xd9cdb0 };
export const DRIFT_COUNTS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 14, 6: 22, 7: 36, 8: 50, 9: 40 };

export const LIGHTS = {
  sun: { kind: BEAM.kind, color: SUN.color, dir: SUN_DIR },
  sky: { kind: 'soft skylight through the same windows', color: 0xcfd8e0 },
  north: { kind: 'dim skylight through the four east windows', color: 0xc8d0d8 },
  amb: { kind: 'room bounce', color: 0x8a8478 },
};
