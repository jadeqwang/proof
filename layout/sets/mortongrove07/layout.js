// THE MAIN FLOOR OF 5748 CAPRI LANE, MORTON GROVE, IL, ABOUT 2007 ("Proof": bridge, "Beauty on this side", -2sm 159.62 s on).
// Single source of truth (metres, y up, floor at y = 0). Grad school: she commutes from this house to Northwestern.
// First love has just given her a WHITE HOODIE with the Institute for Advanced Study seal (TRUTH left, BEAUTY right)
// printed in BLUE on the chest, a filled-disc print about 40% of the front's width (Jade, 2026-11-25, from her size
// reference; supersedes "almost the whole front"). r3 (Jade's r2 review): he hands it FOLDED (the fold hides part of
// the seal), then, on the same continuous camera, she lifts it and it UNFOLDS (see FOLD / SHIRT below). He is a real person: never named, never face-on; every camera is behind him.
//
// ROUND 2 (2026-11-25): the room is now fitted to JADE'S HAND-DRAWN FLOOR PLAN (inputs/refs_mortongrove/, private).
// One open great room: the living room at the drawing's top, the piano / dining / entry part below it, wider by a jog
// on the drawing's right where the front door is. ORIENTATION (reasoned, flagged): the drawing's TOP is SOUTH (the
// street), so its RIGHT is WEST, LEFT is EAST, BOTTOM is NORTH:
//   - the front door sits in the short jog wall that faces the drawing's top: it faces the street (south);
//   - the couch is against the top wall with the window beside it on the same wall: Jade's earlier answer "the couch
//     against the FRONT (south) wall, its end stopping just before the big picture window" (now with a small table);
//   - the kitchen behind the sliding door at the bottom = the back (north), the stairs (bottom left) go east into the
//     two-storey split-level wing; 6.3 m (great room) + about 4.5 m (wing) fills the 11.1 m footprint.
//   The alternative (the drawing's right wall = the street side, because the front door is "on the right") puts the
//   couch window on the EAST and no afternoon sun can reach her (see NOTES).
//
// Axes are the COMPASS (the house is about 1 degree off north; ignored):
//   x: + = EAST.   0 = inner face of the living room's west wall (the egg-carton window) ... 4.9 = east wall (mirror)
//   z: + = SOUTH.  0 = inner face of the south (front) wall (couch + window) ... -7.2 = north wall (sliding door, kitchen)
//   The part north of the jog (z < -2.0) reaches further west, to x = -1.4 (front door, closet, dining window).
// House frame (origin = SW corner of the footprint, x east, y north) = (x + 1.6, 0.2 - z).
const rad = (d) => (d * Math.PI) / 180, D2R = Math.PI / 180;
const add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, s) => a.map((v) => v * s);
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const comb = (p, ...terms) => terms.reduce((s, [v, k]) => add(s, mul(v, k)), p.slice());

export const YEAR = 2007;   // ASSUMPTION: grad school was about 2005-2009
export const FILM = { t: [159.62, 161.96], line: [159.62, 164.36], time: '2:39.6-2:42.0', section: 'Bridge',
  lyric: 'Beauty on this side, truth by reference', sung_here: 'Beauty on this side',
  next: 'cut to the pan across the Expedit (mv10 bridge) on "truth by reference" (161.96 s, "truth" sung); the line itself ends 164.36 s',
  map: 'analysis/m2sm/song_map.md (-2sm master, bridge line 159.62-164.36; was v3 169.4-173.5, retimed 2026-11-25)' };

export const HOUSE = { address: '5748 Capri Lane, Morton Grove, IL', built: 1955, type: 'split-level', sqft: 1296, ew: 11.1, ns: 11.6, ns_note: 'README says 11.8; the OSM corners give 11.63', front: 'south (Capri Lane)',
  lat: 42.0525, lon: -87.7709,
  plan: 'Jade\'s hand-drawn main floor (inputs/refs_mortongrove/Pasted image.png, private), drawing TOP = SOUTH (reasoned; see NOTES)',
  greatRoomInHouse: { x0: 0.2, x1: 6.5, y0: 0.2, y1: 7.4, note: 'house frame (origin SW corner of the footprint, x east, y north); the living room is x 1.6-6.5, y 0.2-2.2 of it; a 1.4 x 2.0 m entry notch at the SW corner (front door in its north side) - the county footprint shows a plain rectangle (porch roof over it? GUESS)' },
  eastWing: 'about 4.5 m wide: bedrooms half a level up, rec room half a level down (the stairs at the great room\'s NE corner)' };

// ---------------------------------------------------------------- the sun (NOAA solar calculator equations, as shanghai86)
// SCENE: Jade remembers neither the date nor the hour: a STAGING CHOICE in the academic year (Oct-Apr), picked by sweep
// (sweep.mjs) for a soft low afternoon sun through the front window that reaches her face. Kept from round 1: the new
// orientation keeps the front window west of the couch, so the same sun still works (re-checked, NOTES).
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

// ---------------------------------------------------------------- the great room (Jade's drawing, scaled: couch = 2.1 m)
// The drawing is a phone photo of a sketch (perspective, freehand): positions below are read off it at about 118 px/m
// and then made to fit real furniture sizes. Living room 4.9 m wide as before (Jade: "room and light look right").
export const ROOM = { x0: 0, x1: 4.9, z0: -7.2, z1: 0, h: 2.44, wallT: 0.2, wallInt: 0.12 };
export const JOG = { z: -2.0, xW: -1.4 };   // north of z = -2.0 the room reaches west to x = -1.4 (the drawing's right-hand step)
// THE CEILING (round 4, Jade 2026-11-26, supersedes the r2/r3 vault with its E-W ridge and the flat dining drop): "the
// ceiling on the mirror side is all high and straight and flat. the low side is the dining room side. the ceiling for
// this room is one plane" and "single ceiling tilting from high to low, high side is mirror side, the wall behind jade
// on the couch is a trapezoid". So ONE tilted plane (a shed ceiling) over the whole great room: highest along the EAST
// (mirror) wall, whose top is level, falling westward to the 8-ft plate on the WEST (dining) wall. The front (south) wall
// behind the couch and the north (kitchen) wall run across the slope: trapezoids, tall at the mirror end.
// HEIGHTS (round 5, Jade: "the ceiling needs to be steeper ... based on door height, window heights, angle, can you
// compute the rest?"), measured on inputs/refs_mortongrove/mg_streetview.png (private; arithmetic in NOTES.md):
// the front gable's pitch is 0.57 (about 7 in 12, 30 deg); the 8-ft plate (2.44 m) is confirmed by the front door
// (80 in) and the window heads; the two-storey wing's ridge is about 5.35 m above the main floor outside. The roof
// pitch carried across the whole 6.3 m room would put the ceiling at 6.0 m, above the wing's ridge (impossible in the
// photo), so the high side is capped under it: 5.10 m at the east (mirror) wall, 2.44 m at the dining wall x -1.4,
// 3.05 m at the living room's west wall (x 0). Pitch 2.66 m in 6.3 m = 0.42 (about 5 in 12, 23 deg). FLAGGED.
export const VAULT = { ridge: 'none: one tilted plane (shed), high at the east (mirror) wall, low at the west (dining) wall', high: 5.10, low: ROOM.h, xHigh: ROOM.x1, xLow: JOG.xW, t: 0.06 };
VAULT.peak = VAULT.high;
VAULT.pitch = +((VAULT.high - VAULT.low) / (VAULT.xHigh - VAULT.xLow)).toFixed(4);   // 0.4222 (about 5 in 12)
export const ceilAt = (x, _z) => VAULT.low + (x - VAULT.xLow) * VAULT.pitch;            // the ceiling plane over (x, z)

// ---------------------------------------------------------------- windows and doors (drawing; sizes GUESSED)
// FRONT window, south wall, west part (drawing: top wall, right of the couch). Narrower than round 1's 2.35 m: the drawn
// window is about 1.5 m, with the couch, a small table and the egg-carton table all along the same wall.
export const PICTURE = { x0: 0.20, x1: 1.70, sill: 0.60, head: 2.05, mullions: [0.55, 1.35], z: 0 };
// WEST windows (drawing: right wall): over the egg-carton table, and by the dining table
export const WIN_W = { x: 0, z0: -1.70, z1: -0.30, sill: 0.75, head: 2.05, mullions: [-1.0] };
export const WIN_D = { x: JOG.xW, z0: -6.10, z1: -4.60, sill: 0.80, head: 2.05, mullions: [-5.35] };
// the front door: in the short jog wall (z = -2.0), facing the street; hinged at its west end, swings in (drawing)
export const FRONT_DOOR = { z: JOG.z, x0: -1.30, x1: -0.40, h: 2.03 };
// the sliding door to the kitchen: north wall (drawing: bottom, a little left of centre) -> x 1.25-2.45; one leaf slid open
export const SLIDER = { z: ROOM.z0, x0: 1.25, x1: 2.45, h: 2.03 };
export const KITCHEN = { depth: 3.8 };   // beyond the slider (not modelled beyond a floor and far wall)
// the stairs: NE corner (drawing: bottom left), running EAST through the east wall into the split-level wing
export const STAIR = { z0: -7.2, z1: -6.35, x0: 4.15, rise: 0.18, tread: 0.26, n: 7, label: 'stairs (half a level up to the bedrooms, east wing)' };

// ---------------------------------------------------------------- the living room (drawing, top)
export const COUCH = { x0: 1.85, x1: 3.95, z1: -0.04, d: 0.9, seat: 0.44, back: 0.86, arm: 0.64, armW: 0.2, backD: 0.26, baseH: 0.22 };
COUCH.z0 = COUCH.z1 - COUCH.d;                       // front edge of the frame (-0.94); the couch faces north (-z)
COUCH.seatZ1 = COUCH.z1 - COUCH.backD;               // front face of the back cushions
export const END_TABLE_E = { x0: 4.15, x1: 4.60, z0: -0.52, z1: -0.08, h: 0.60, label: 'side table (lamp)' };   // drawing: "side table w/ lamp", couch's east end
export const END_TABLE_W = { x0: 1.32, x1: 1.72, z0: -0.50, z1: -0.10, h: 0.52, label: 'small table' };          // drawing: "table", couch's west end, under the window's corner
export const RUG = { x0: 1.85, x1: 4.15, z0: -2.15, z1: -0.94 };                                                 // drawing: red
export const COFFEE_TABLE = { x0: 2.55, x1: 3.80, z0: -1.85, z1: -1.30, h: 0.42 };                              // on the rug (shortened at its west end so he can stand there)
export const LOVESEAT = { x0: 4.10, x1: 4.88, z0: -2.15, z1: -0.95, label: 'loveseat (two cushions, facing west)' };   // drawing: the two-part block left of the rug (Jade r3: a loveseat)
export const ARMCHAIR = { at: [1.35, -1.20], yaw: 90, w: 0.78, d: 0.80, seat: 0.43, back: 0.88, arm: 0.6 };         // drawing: right of the rug, facing east
export const PLANTS = { x0: 0.10, x1: 0.68, z0: -1.75, z1: -0.30, h: 0.42, cartons: { rows: 9, cols: 2, l: 0.28, w: 0.105, h: 0.065 },
  label: 'coffee table: germinating plants in egg cartons, carefully labelled' };                                // drawing: along the west wall under the window
// framed picture over the couch (round 3, Jade: "the framed picture is 4x larger": read as 4x the AREA, 2x each side,
// 0.7 x 0.5 -> 1.4 x 1.0 m; 4x each side, 2.8 x 2.0 m, would not fit between the couch back and the 2.44 m front wall)
export const PRINT = { x: 2.9, y: 1.64, z: -0.025, w: 1.4, h: 1.0 };

// ---------------------------------------------------------------- the rest of the great room (drawing)
export const MIRROR = { x: ROOM.x1, z0: -4.90, z1: -2.10, y0: 0.95, y1: 2.90, label: 'giant mirror' };   // east wall; round 3 (Jade): hangs HIGHER (was 0.25-2.20), its top now 2.90 on the tall east wall (5.1 m, r5)
// 7-ft grand (Jade's drawing: "7' concert grand"; a 7-ft grand is strictly a semi-concert "B"-size grand, Steinway B
// 211 x 148 cm: kept at that size because the drawing says 7'). Round 3 (Jade): "the correct shape of an actual grand":
// PIANO.outline is a real grand's plan (straight spine on the bass side, a short straight treble side at the keyboard,
// the concave bentside, the convex tail); see build.js piano(). As drawn: spine along the mirror (east), bentside to the
// west, keyboard at the NORTH end with the bench there, so the pianist faces south toward the living room.
// Round 4 (Jade): "7'1\" to be exact" = 2.16 m long (keyboard front to tail); width 1.452 m = the downloaded model's
// (layout/assets/props/grand_piano, "Grand Piano" by thanhthanh, CC BY 4.0; its keyboard is the real 1.22 m).
export const PIANO = { spineX: 4.55, kbZ: -5.20, L: 2.16, W: 1.452, caseY0: 0.62, caseY1: 0.95, kbDepth: 0.26, label: '7-ft grand piano' };
export const BENCH = { x0: 3.40, x1: 4.15, z0: -5.78, z1: -5.42, h: 0.50, label: 'piano bench' };
export const FLOOR_LAMP = { at: [4.62, -6.02], h: 1.62, label: 'floor lamp (off)' };
export const CLOSET = { x0: JOG.xW, x1: -0.15, z0: -4.05, z1: -3.00, h: 2.20, label: 'coat closet' };   // drawing: by the front door; its door on the east face (GUESS)
export const DINING = { table: { c: [0.15, -5.60], w: 1.90, d: 0.95, h: 0.74 }, label: 'dining table (long, six chairs)' };

// ---------------------------------------------------------------- the people
// her (jade27 standing in for about 24): on the couch's WEST cushion (next to the window), sitting a little forward,
// turned toward him, holding the unfolded hoodie up against herself by its shoulders. him (firstLove27): standing at
// the west end of the coffee table, in front of her and a little to her left (west), leaning in.
const cushW = (COUCH.x1 - COUCH.x0 - 2 * COUCH.armW) / 3;
export const HER = { at: [COUCH.x0 + COUCH.armW + cushW / 2, COUCH.z1 - (COUCH.d - 0.36)], yaw: 196 };
export const HIM = { at: [1.95, -1.48] };
HIM.yaw = +(Math.atan2(HER.at[0] - HIM.at[0], HER.at[1] - HIM.at[1]) * 180 / Math.PI).toFixed(1);   // faces her

// ---------------------------------------------------------------- the hoodie: FOLDED (MG1), then UNFOLDING (MG2)
// Jade (r2 review, 2026-11-25 night): MG1 = he hands it to her FOLDED, the fold cutting off part of the (large) seal,
// the camera zooming in past his shoulder; MG2 = the SAME continuous camera, further in, as she takes it and it UNFOLDS
// (the seal revealed). Supersedes tonight's "held up unfolded against herself".
// A WHITE pullover hoodie (hood, two drawstrings, kangaroo pouch pocket, ribbed cuffs and waistband), the IAS seal printed
// in BLUE as a solid filled disc 0.23 m across on the chest (about 40% of the front's 0.58 m width), figures in white reverse.
const SEAL_R = 0.115, SEAL_DOWN = 0.19, WHITE_C = 0xf4f2ec, BLUE_C = 0x2f62a8;

// FOLDED: a stack 0.38 across (sides and sleeves folded behind) x 0.36 long x 0.06 thick, held between them at y 0.88,
// 0.50 m from him toward her and 0.12 m to his LEFT (the camera is over his left shoulder). The FRONT is on top with the
// NECKLINE at HER end, so the seal reads UPRIGHT for him and for the camera behind him (and she can lift it by the
// shoulders straight into MG2). The waistband end is folded UP over the front from HIS end: a 0.15 m flap (the plain
// back panel outside, the ribbed waistband its free edge) lying across the lower part of the seal, hiding about a third
// of its height. Frame: w = horizontal him -> her, tipped `tilt` deg (his end a little higher, toward the camera);
// u = his left (= camera left: TRUTH side), n = up out of the front.
export const FOLD = { across: 0.38, along: 0.36, thick: 0.06, tilt: 8, flap: 0.15, y: 0.92, fromHim: 0.52, toHisLeft: 0.12, sealR: SEAL_R, sealFromNeck: 0.16, color: WHITE_C, seal: BLUE_C };
{ const wh = norm([HER.at[0] - HIM.at[0], 0, HER.at[1] - HIM.at[1]]), t = rad(FOLD.tilt);
  FOLD.wh = wh; FOLD.w = norm([wh[0] * Math.cos(t), -Math.sin(t), wh[2] * Math.cos(t)]);
  FOLD.u = norm(cross([0, 1, 0], wh));
  let n = norm(cross(FOLD.w, FOLD.u)); if (n[1] < 0) n = mul(n, -1); FOLD.n = n;
  FOLD.c = comb([HIM.at[0], FOLD.y, HIM.at[1]], [wh, FOLD.fromHim], [FOLD.u, FOLD.toHisLeft]).map((v) => +v.toFixed(4));
  FOLD.neck = comb(FOLD.c, [FOLD.w, FOLD.along / 2]);                                   // neckline edge centre (her end)
  FOLD.top = comb(FOLD.c, [FOLD.n, FOLD.thick / 2]);
  FOLD.sealC = comb(FOLD.top, [FOLD.w, FOLD.along / 2 - FOLD.sealFromNeck], [FOLD.n, 0.002]).map((v) => +v.toFixed(4));
  FOLD.flapEdge = FOLD.along - FOLD.flap;                                                 // from the neck: where the flap's free edge lies
  FOLD.sealCut = +(FOLD.flapEdge - FOLD.sealFromNeck).toFixed(3);                         // the cut line's distance below the seal centre
  FOLD.sealHidden = +((SEAL_R - FOLD.sealCut) / (2 * SEAL_R)).toFixed(2); }               // share of the seal's height under the flap
// grips: each hand closes on the stack's side edge, thumb on top; his near his end, hers near hers
{ const r = FOLD.thick / 2, side = FOLD.across / 2 - r, inset = 0.10, C = FOLD.c, u = FOLD.u, w = FOLD.w;
  FOLD.grip = { hisL: comb(C, [u, side], [w, -inset]), hisR: comb(C, [u, -side], [w, -inset]),
    herL: comb(C, [u, -side], [w, inset]), herR: comb(C, [u, side], [w, inset]), r };
  // his hands on the near END (the fold at his end), at its two corners: thumbs on top, fingers under, forearms coming
  // straight from him (so the over-the-shoulder camera sees past his left forearm onto the seal)
  const endIn = FOLD.along / 2 - r, cornerIn = FOLD.across / 2 - 0.07;
  FOLD.grip.hisL = comb(C, [w, -endIn], [u, cornerIn]); FOLD.grip.hisR = comb(C, [w, -endIn], [u, -cornerIn]); }

// UNFOLDING: she has lifted it by the shoulder seams (the neckline end of the stack): the front's upper part hangs from
// her hands in front of her chest, facing him (and the camera), the seal upright on it; 0.27 m below the shoulder line
// the rest is still folded, the lower part swinging down and out toward him, half open (45 deg below the horizontal):
// its fold edge crosses the bottom sliver of the seal (about 15% of its height), the rest of the seal now revealed.
// Frame: f = her facing, r = the VIEWER'S RIGHT looking at the front (= her left), a = up the hanging front, n = out of it.
export const SHIRT = { chest: 0.58, upper: 0.27, lower: 0.42, top: { fwd: 0.34, y: 1.10 }, hang: { fwd: 0.38 }, flapDeg: 45,
  sleeve: { len: 0.60, w0: 0.16, w1: 0.11 }, thick: 0.012, sealR: SEAL_R, sealDown: SEAL_DOWN, color: WHITE_C, seal: BLUE_C,
  hood: { w: 0.34, up: 0.05, down: 0.30 }, string: { dx: 0.044, len: 0.21 }, pocket: { wTop: 0.32, wBot: 0.38 } };
{ const y = rad(HER.yaw), f = [Math.sin(y), 0, Math.cos(y)];
  SHIRT.f = f; SHIRT.r = [Math.cos(y), 0, -Math.sin(y)];                          // her left = the viewer's right
  const base = [HER.at[0], 0, HER.at[1]];
  SHIRT.T = comb(base, [f, SHIRT.top.fwd], [[0, 1, 0], SHIRT.top.y]);             // top centre (collar)
  const dx = SHIRT.hang.fwd - SHIRT.top.fwd, dy = Math.sqrt(SHIRT.upper ** 2 - dx ** 2);
  SHIRT.K = comb(base, [f, SHIRT.hang.fwd], [[0, 1, 0], SHIRT.top.y - dy]);       // the remaining fold line (bottom of the hanging part)
  SHIRT.a = norm(add(SHIRT.T, mul(SHIRT.K, -1)));
  let n = norm(cross(SHIRT.r, SHIRT.a)); if (dot(n, f) < 0) n = mul(n, -1); SHIRT.n = n;
  const fd = rad(SHIRT.flapDeg);
  SHIRT.b = norm(comb([0, 0, 0], [f, Math.cos(fd)], [[0, 1, 0], -Math.sin(fd)]));   // the folded part: out toward him and down
  SHIRT.H = comb(SHIRT.K, [SHIRT.b, SHIRT.lower]);                                 // its far edge (the waistband)
  SHIRT.c = comb(SHIRT.T, [SHIRT.a, -SHIRT.sealDown]).map((v) => +v.toFixed(4));   // the seal's centre
  SHIRT.sealCut = +(SHIRT.upper - SHIRT.sealDown).toFixed(3);                      // fold line below the seal centre
  SHIRT.sealHidden = +Math.max(0, (SEAL_R - SHIRT.sealCut) / (2 * SEAL_R)).toFixed(2);
}
// her two hands close on the shoulder seams (top corners): left hand at +r, right hand at -r
const sh = SHIRT.chest / 2 - 0.04;
export const GRIP = { herL: comb(SHIRT.T, [SHIRT.r, sh]), herR: comb(SHIRT.T, [SHIRT.r, -sh]), r: 0.012 };
const front = comb(SHIRT.c, [SHIRT.n, SHIRT.thick / 2 + 0.002]);
export const SEAL = { centre: front, top: comb(front, [SHIRT.a, SHIRT.sealR]), bottom: comb(front, [SHIRT.a, -SHIRT.sealR]),
  truth: comb(front, [SHIRT.r, -SHIRT.sealR * 0.45]), beauty: comb(front, [SHIRT.r, SHIRT.sealR * 0.45]) };
// the same for the folded state (on the stack's top; up = toward her = -... w points to her, so the seal's top is +w)
export const FSEAL = { centre: FOLD.sealC, top: comb(FOLD.sealC, [FOLD.w, SEAL_R]), bottom: comb(FOLD.sealC, [FOLD.w, -SEAL_R]),
  truth: comb(FOLD.sealC, [FOLD.u, SEAL_R * 0.45]), beauty: comb(FOLD.sealC, [FOLD.u, -SEAL_R * 0.45]) };

// ---------------------------------------------------------------- TURNED (round 3, Jade): she turns it round to look at it
// Jade (2026-11-26): "he hands it to me like pictured, and I turn it around in order to look at it so it faces me". After
// MG2 (lifted by the shoulders, front toward him) she turns it about the vertical so the FRONT (the seal) faces HER: held
// out a little further and a little higher by the shoulder seams, hands 0.50 m apart (a 0.58 m chest, grips 4 cm in from
// each shoulder point), her eyes on the seal. The garment itself (cloth, folds, the turn) is the cloth agent's module
// (sweatshirt.js, NOT in this file); this is only the anchor its hands and the camera need.
// Frame: f = her facing, r = the right of someone LOOKING AT THE FRONT (here: her own right = -SHIRT.r), a = up the front,
// n = out of the front (toward her = -f).
export const TURN = { chest: SHIRT.chest, length: 0.69, top: { fwd: 0.44, y: 1.14 }, lean: 10, sealDown: SEAL_DOWN, sealR: SEAL_R };
{ const f = SHIRT.f, base = [HER.at[0], 0, HER.at[1]], l = rad(TURN.lean);
  TURN.T = comb(base, [f, TURN.top.fwd], [[0, 1, 0], TURN.top.y]);
  TURN.r = mul(SHIRT.r, -1);
  TURN.a = norm(comb([0, 0, 0], [[0, 1, 0], Math.cos(l)], [f, -Math.sin(l)]));   // the front leans back toward her a little at the top
  TURN.n = norm(cross(TURN.r, TURN.a)); if (dot(TURN.n, f) > 0) TURN.n = mul(TURN.n, -1);
  const shs = TURN.chest / 2 - 0.04;
  TURN.grip = { herL: comb(TURN.T, [SHIRT.r, shs]), herR: comb(TURN.T, [SHIRT.r, -shs]) };   // her left hand on her left
  const c = comb(TURN.T, [TURN.a, -TURN.sealDown], [TURN.n, 0.008]);
  TURN.seal = { centre: c, top: comb(c, [TURN.a, SEAL_R]), bottom: comb(c, [TURN.a, -SEAL_R]), truth: comb(c, [TURN.r, -SEAL_R * 0.45]), beauty: comb(c, [TURN.r, SEAL_R * 0.45]) }; }

// HOOK FOR THE CLOTH MODULE (layout/sets/mortongrove07/sweatshirt.js, built by a separate agent): one anchor per state.
// `origin` = the collar centre (the neckline's middle, where a hoodie hangs from); `right`, `up`, `out` = the garment's
// own frame (right as one faces the FRONT, up the front, out of the front); `grips` = where the hands close (pin the cloth
// there). folded: the stack between his hands and hers (MG1, MG1_end); unfolding: lifted by her, front toward him (MG2);
// turned: front toward her (MG2_end).
export const GARMENT = {
  folded: { origin: FOLD.neck, right: mul(FOLD.u, -1), up: FOLD.w, out: FOLD.n, grips: { hisL: FOLD.grip.hisL, hisR: FOLD.grip.hisR, herL: FOLD.grip.herL, herR: FOLD.grip.herR } },
  unfolding: { origin: SHIRT.T, right: SHIRT.r, up: SHIRT.a, out: SHIRT.n, grips: { herL: GRIP.herL, herR: GRIP.herR } },
  turned: { origin: TURN.T, right: TURN.r, up: TURN.a, out: TURN.n, grips: TURN.grip },
};

// ---------------------------------------------------------------- the beams: three west/south openings
export const SUN_POS = sunPosition(SCENE);
export const SUN = { altitude: SUN_POS.elev, azimuth: SUN_POS.az, color: 0xfff0d8, ...SCENE };
export const SUN_DIR = travelDir(SUN_POS);
const T = ROOM.wallT;
// aperture on the inner plane of a south-wall window (z = W.z, outside is +z), narrowed by the reveal for this sun
function apS(W) { const d = SUN_DIR; if (d[2] > -1e-3) return null; const s = T / -d[2]; const dx = d[0] * s, dy = d[1] * s;
  const x0 = Math.max(W.x0, W.x0 + dx), x1 = Math.min(W.x1, W.x1 + dx), y0 = Math.max(W.sill, W.sill + dy), y1 = Math.min(W.head, W.head + dy);
  return x1 > x0 && y1 > y0 ? [[x1, y1, W.z], [x0, y1, W.z], [x0, y0, W.z], [x1, y0, W.z]] : null; }
// on a west-wall window (x = W.x, outside is -x)
function apW(W) { const d = SUN_DIR; if (d[0] < 1e-3) return null; const s = T / d[0]; const dz = d[2] * s, dy = d[1] * s;
  const z0 = Math.max(W.z0, W.z0 + dz), z1 = Math.min(W.z1, W.z1 + dz), y0 = Math.max(W.sill, W.sill + dy), y1 = Math.min(W.head, W.head + dy);
  return z1 > z0 && y1 > y0 ? [[W.x, y1, z0], [W.x, y1, z1], [W.x, y0, z1], [W.x, y0, z0]] : null; }
export const APERTURES = { front: apS(PICTURE), west: apW(WIN_W), dining: apW(WIN_D) };
export const APERTURE = APERTURES.front;
// is a room point in the direct sun through one window (ignoring figures and furniture)? margin in m on the window plane
function marginS(p, A) { const d = SUN_DIR; if (!A) return -9; const t = (p[2] - A[0][2]) / d[2]; if (t < 0) return -9;
  const x = p[0] - d[0] * t, y = p[1] - d[1] * t; const x1 = A[0][0], x0 = A[1][0], y1 = A[0][1], y0 = A[2][1];
  return Math.min(x - x0, x1 - x, y - y0, y1 - y); }
function marginW(p, A) { const d = SUN_DIR; if (!A) return -9; const t = (p[0] - A[0][0]) / d[0]; if (t < 0) return -9;
  const z = p[2] - d[2] * t, y = p[1] - d[1] * t; const z0 = A[0][2], z1 = A[1][2], y1 = A[0][1], y0 = A[2][1];
  return Math.min(z - z0, z1 - z, y - y0, y1 - y); }
export function sunMargins(p) { return { front: +marginS(p, APERTURES.front).toFixed(3), west: +marginW(p, APERTURES.west).toFixed(3), dining: +marginW(p, APERTURES.dining).toFixed(3) }; }
export function sunMargin(p) { return Math.max(...Object.values(sunMargins(p))); }
// does a surface with outward normal nn face the sun? (cosine of the incidence; <= 0 = the sun is behind it)
export const sunCos = (nn) => +(-dot(norm(nn), SUN_DIR)).toFixed(3);
const CLIP = [{ name: 'floor', n: [0, -1, 0], d: 0.0 }, { name: 'east wall', n: [1, 0, 0], d: ROOM.x1 }, { name: 'north wall', n: [0, 0, -1], d: -ROOM.z0 },
  { name: 'ceiling (plate height: the sun enters below the window heads and only falls, so the ceiling never meets it)', n: [0, 1, 0], d: ROOM.h }];
export const BEAM = { name: 'front + west windows', kind: 'low afternoon sun through the front window beside the couch, the west (egg-carton) window and the dining window (parallel)', dir: SUN_DIR,
  apertures: APERTURES, aperture: APERTURE, clip: CLIP };

export const LIGHTS = {
  sun: { kind: 'low soft afternoon sun through the front and west windows (the beams)', dir: SUN_DIR, color: SUN.color },
  sky: { kind: 'diffuse skylight through the front and west windows (fill)', color: 0xdfe6f0 },
};
