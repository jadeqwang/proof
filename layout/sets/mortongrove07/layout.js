// LIVING ROOM, 5748 CAPRI LANE, MORTON GROVE, IL, ABOUT 2007 ("Proof": bridge, "Beauty on this side", v3 169.4 s on).
// Single source of truth (metres, y up, floor at y = 0). Grad school: she commutes from this house to Northwestern.
// First love hands her a folded white sweatshirt with the Institute for Advanced Study seal (TRUTH left, BEAUTY right)
// in dark blue. He is a real person: never named, never face-on; every camera is behind him.
//
// The house (inputs/refs_mortongrove/README.md, documented): a 1955 split-level, 1,296 sq ft, a plain rectangle
// 11.1 m E-W x 11.8 m N-S, FRONT FACING SOUTH onto Capri Lane, back yard north. The living room (GUESSED from the type
// and from 5837 Capri, 1957): 16 x 14 ft on the main level at the front, a picture window in the south wall.
// From Jade: the three-seat floral couch stands against the FRONT (south) wall and its end stops just before the big
// window begins: couch and window side by side on the same wall.
//
// Axes are the COMPASS (the house is about 1 degree off north; ignored):
//   x: + = EAST.   0 = inner face of the living room's west wall (entry / stair hall beyond) ... 4.9 = east wall
//   z: + = SOUTH.  0 = inner face of the south (front) wall: picture window + couch ... -4.3 = north wall (dining beyond)
// The living room sits in the SE corner of the footprint in this model (GUESS): house frame (origin = SW corner of the
// footprint, x east, y north) = (x + 6.0, 0.2 - z).
const rad = (d) => (d * Math.PI) / 180, D2R = Math.PI / 180;
const add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, s) => a.map((v) => v * s);
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const comb = (p, ...terms) => terms.reduce((s, [v, k]) => add(s, mul(v, k)), p.slice());

export const YEAR = 2007;   // ASSUMPTION: grad school was about 2005-2009
export const FILM = { t: [169.4, 171.8], line: [169.4, 173.5], time: '2:49.4-2:51.8', section: 'Bridge',
  lyric: 'Beauty on this side, truth by reference', sung_here: 'Beauty on this side',
  next: 'cut to the pan across the Expedit (mv10 bridge) on "truth by reference" (171.8 s); the line itself ends 173.5 s',
  map: 'analysis/v3/song_map.md (bridge row 169.4-173.5)' };

export const HOUSE = { address: '5748 Capri Lane, Morton Grove, IL', built: 1955, type: 'split-level', sqft: 1296, ew: 11.1, ns: 11.6, ns_note: 'README says 11.8; the OSM corners give 11.63', front: 'south (Capri Lane)',
  lat: 42.0525, lon: -87.7709, livingRoomInHouse: { x0: 6.0, x1: 10.9, y0: 0.2, y1: 4.5, note: 'GUESS: SE corner of the footprint (house frame: origin SW corner, x east, y north)' } };

// ---------------------------------------------------------------- the sun (NOAA solar calculator equations, as shanghai86)
// SCENE: Jade remembers neither the date nor the hour: a STAGING CHOICE in the academic year (Oct-Apr), picked by sweep
// (sweep.mjs) for a soft low afternoon sun through the picture window that lights her face and the sweatshirt beside it.
export const SCENE = { date: '2007-11-05', time: '15:30', tzHours: -6, tzName: 'CST', lat: 42.0525, lon: -87.7709 };
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
// direction the light TRAVELS, in these axes (x east, y up, z south), from compass azimuth and elevation
export const travelDir = ({ az, elev }) => { const a = az * D2R, e = elev * D2R; return [-Math.sin(a) * Math.cos(e), -Math.sin(e), Math.cos(a) * Math.cos(e)]; };

export const ROOM = { x0: 0, x1: 4.9, z0: -4.3, z1: 0, h: 2.44, wallT: 0.2, wallInt: 0.12 };

// ---------------------------------------------------------------- the front (south) wall: picture window + couch
// ASSUMPTION: a fixed picture window (big centre light, a narrow casement each side) in the WEST part of the south wall,
// and the couch in the EAST part (Jade: the couch's end stops just before the window). West, because the afternoon
// sun travels north-east: from a window west of the couch it falls on her; a window east of it would throw the
// afternoon light away from the couch (it would need a morning sun).
export const PICTURE = { x0: 0.35, x1: 2.70, sill: 0.50, head: 2.05, mullions: [0.85, 2.20], z: 0 };
export const COUCH = { x0: 2.80, x1: 4.80, z1: -0.04, d: 0.9, seat: 0.44, back: 0.86, arm: 0.64, armW: 0.2, backD: 0.26, baseH: 0.22 };
COUCH.z0 = COUCH.z1 - COUCH.d;                       // front edge of the frame (-0.94); the couch faces north (-z)
COUCH.seatZ1 = COUCH.z1 - COUCH.backD;               // front face of the back cushions

// ---------------------------------------------------------------- openings (typical of the type; GUESSES)
export const STAIR_OPENING = { x: 0, z0: -2.4, z1: -1.0, h: 2.03 };   // W wall: entry / stair hall (half up to bedrooms, half down to the rec room)
export const STAIR = { hallX0: -1.3, risers: 4, rise: 0.18, tread: 0.25 };   // what shows through the opening: a landing, a half flight up (north half), down (south half)
export const DINING_OPENING = { z: ROOM.z0, x0: 0.5, x1: 2.3, h: 2.1 };     // N wall: cased opening to the dining room
export const DINING = { depth: 3.4, table: { c: [1.4, -5.9], w: 1.5, d: 0.9, h: 0.74 } };

// ---------------------------------------------------------------- the rest of the room (invented, plausible)
export const COFFEE_TABLE = { x0: 4.05, x1: 4.65, z0: -1.70, z1: -1.20, h: 0.42 };   // small, in front of the couch's east end
export const ARMCHAIR = { at: [4.35, -2.8], yaw: -90, w: 0.82, d: 0.82, seat: 0.43, back: 0.88, arm: 0.6 };   // on the E wall, facing west
export const SIDE_TABLE = { x0: 4.4, x1: 4.85, z0: -2.15, z1: -1.75, h: 0.58 };      // beside the armchair, lamp (off)
export const TV = { x: 3.55, z: ROOM.z0, w: 1.1, d: 0.45, h: 0.55, set: { w: 0.62, h: 0.48, d: 0.5 } };   // N wall, facing the couch
export const RUG = { x0: 1.3, x1: 4.6, z0: -3.4, z1: -1.0 };
export const PRINT = { x: 3.8, y: 1.55, z: -0.02, w: 0.7, h: 0.5 };                   // framed print over the couch

// ---------------------------------------------------------------- the people
// her (jade27 standing in for about 24): on the couch's WEST cushion (next to the window), sitting forward, turned a
// little toward him. him (firstLove27): standing in front of her, a little to her right (east, frame left in MG1),
// leaning in, arms out. The window is on her left.
export const HER = { at: [COUCH.x0 + COUCH.armW + (COUCH.x1 - COUCH.x0 - 2 * COUCH.armW) / 6, COUCH.z1 - (COUCH.d - 0.36)], yaw: 168 };
export const HIM = { at: [HER.at[0] + 0.42, HER.at[1] - 1.02] };
HIM.yaw = +(Math.atan2(HER.at[0] - HIM.at[0], HER.at[1] - HIM.at[1]) * 180 / Math.PI).toFixed(1);   // faces her (about -22)

// ---------------------------------------------------------------- the sweatshirt (folded), between them
// A folded stack 0.30 across x 0.34 long x 0.05 thick at y 0.88, 0.53 m from him toward her and 0.16 m to his right (so
// the over-the-shoulder camera sees it past his arm), the seal on top. Frame:
//   w = horizontal direction from him to her, tipped down `tilt` degrees (his edge a little higher: it leans toward her)
//   u = his left (her right), n = up out of the seal
// The seal reads upright for HER (its top toward him; TRUTH on her left = -u, BEAUTY on her right = +u).
export const SHIRT = { across: 0.30, along: 0.34, thick: 0.05, tilt: 10, sealR: 0.07, color: 0xf4f2ec, seal: 0x1c2a5a, y: 0.88, fromHim: 0.53, toHisRight: 0.16 };
{ const wh = norm([HER.at[0] - HIM.at[0], 0, HER.at[1] - HIM.at[1]]), t = rad(SHIRT.tilt);
  SHIRT.w = norm([wh[0] * Math.cos(t), -Math.sin(t), wh[2] * Math.cos(t)]);
  SHIRT.u = norm(cross([0, 1, 0], wh));
  let n = norm(cross(SHIRT.w, SHIRT.u)); if (n[1] < 0) n = mul(n, -1); SHIRT.n = n;
  SHIRT.c = comb([HIM.at[0], SHIRT.y, HIM.at[1]], [wh, SHIRT.fromHim], [SHIRT.u, -SHIRT.toHisRight]).map((v) => +v.toFixed(4)); }
// the four grips: each hand closes on the stack's side edge (a cylinder of radius thick/2 along w), thumb on top
const r = SHIRT.thick / 2, side = SHIRT.across / 2 - r, inset = 0.09;
export const GRIP = {
  hisL: comb(SHIRT.c, [SHIRT.u, side], [SHIRT.w, -inset]), hisR: comb(SHIRT.c, [SHIRT.u, -side], [SHIRT.w, -inset]),
  herL: comb(SHIRT.c, [SHIRT.u, -side], [SHIRT.w, inset]), herR: comb(SHIRT.c, [SHIRT.u, side], [SHIRT.w, inset]),
  r,
};
const top = comb(SHIRT.c, [SHIRT.n, SHIRT.thick / 2 + 0.002]);
export const SEAL = { centre: top, top: comb(top, [SHIRT.w, -SHIRT.sealR]), bottom: comb(top, [SHIRT.w, SHIRT.sealR]),
  truth: comb(top, [SHIRT.u, -SHIRT.sealR * 0.6]), beauty: comb(top, [SHIRT.u, SHIRT.sealR * 0.6]) };

// ---------------------------------------------------------------- the beam
// the sun travels north into the room when the sun is in the southern sky: dir[2] < 0
export const SUN_POS = sunPosition(SCENE);
export const SUN = { altitude: SUN_POS.elev, azimuth: SUN_POS.az, color: 0xfff0d8, ...SCENE };
export const SUN_DIR = travelDir(SUN_POS);
// the aperture on the inner plane: the outer opening (z = +wallT) slid along the light to z = 0 and intersected
export const APERTURE = (() => { const W = PICTURE, T = ROOM.wallT, d = SUN_DIR; const s = d[2] < -1e-3 ? T / -d[2] : 0;
  const dx = d[0] * s, dy = d[1] * s; const x0 = Math.max(W.x0, W.x0 + dx), x1 = Math.min(W.x1, W.x1 + dx), y0 = Math.max(W.sill, W.sill + dy), y1 = Math.min(W.head, W.head + dy);
  return [[x1, y1, 0], [x0, y1, 0], [x0, y0, 0], [x1, y0, 0]]; })();     // TL, TR, BR, BL seen from inside looking out (south; east on the left)
// is a room point in the direct sun (ignoring figures and furniture)? margin in metres on the window plane (> 0 inside)
export function sunMargin(p) { const d = SUN_DIR; if (d[2] >= -1e-3) return -9; const t = p[2] / d[2]; if (t < 0) return -9;   // trace back to z = 0
  const x = p[0] - d[0] * t, y = p[1] - d[1] * t; const [[x1, y1], [x0]] = APERTURE, y0 = APERTURE[2][1];
  return +Math.min(x - x0, x1 - x, y - y0, y1 - y).toFixed(3); }
export const BEAM = { name: 'picture window', kind: 'low afternoon sun through the picture window beside the couch (parallel)', dir: SUN_DIR, aperture: APERTURE,
  clip: [{ name: 'floor', n: [0, -1, 0], d: 0.0 }, { name: 'west wall', n: [-1, 0, 0], d: -ROOM.x0 }, { name: 'east wall', n: [1, 0, 0], d: ROOM.x1 }, { name: 'north wall', n: [0, 0, -1], d: -ROOM.z0 }, { name: 'ceiling', n: [0, 1, 0], d: ROOM.h }] };

export const LIGHTS = {
  sun: { kind: 'low soft afternoon sun through the picture window (the beam)', dir: SUN_DIR, color: SUN.color },
  sky: { kind: 'diffuse skylight through the picture window (fill)', color: 0xdfe6f0 },
};
