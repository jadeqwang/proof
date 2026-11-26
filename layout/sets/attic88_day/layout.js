// ATTIC 1988, DAY ("Proof": Attic, Netherlands, winter 1988). Single source of truth for this set's numbers
// (metres, y up, floor at y = 0).
//
// The ROOM IS attic88: shell, window, stair door and the v4 fixed furniture are imported from ../attic88 and never
// repeated here, so the two sets cannot drift apart. What this file adds is the daylight rig:
//   SUN / BEAM      low winter sun through the four panes: the single beam of the scene
//   FROST / FERN    frost on the four panes, and the fern she traces
//   READING         the reading spot at the sill
//   KEYS            the paper piano keyboard on the floorboards, in the beam
//   MOTE            the one mote she follows
// Axes (as attic88): x -3.5 = stair-door gable ... +3.5 = WINDOW gable; z -2.8 = back eaves (mats) ... +2.8 = front
// eaves. A camera looking toward -z has the window gable frame-right.
import { ROOM, roofY, WINDOW, DOOR, STAIRWELL, PROPS } from '../attic88/layout.js';
import { MATS4, PILLOW4, STACK4, STACK_H } from '../attic88/v4.js';
export { ROOM, roofY, WINDOW, DOOR, STAIRWELL, PROPS, MATS4, PILLOW4, STACK4, STACK_H };

const rad = (d) => (d * Math.PI) / 180;

// ---------------------------------------------------------------- the sun
// ASSUMPTION (the plan leaves it open): the window gable faces due SOUTH, so +x = south, +z = west, -z = east.
// Mid January, late morning (about 10:40 solar time, 11:20 on the clock): sun azimuth 160 deg (20 deg east of south),
// altitude 16 deg. At 52 N the sun never gets above about 15-20 deg in January, which is what makes the beam long.
// The light therefore travels north and a little west: -x, +z, and down.
export const SUN = { azimuth_compass: 160, altitude: 16, off_normal: 20, date: 'mid January', solar_time: '10:40',
  color: 0xfff1d6, sky: 0xdfe8f2 };
const ce = Math.cos(rad(SUN.altitude)), se = Math.sin(rad(SUN.altitude));
// unit direction the light TRAVELS (from the sun into the room)
export const SUN_DIR = [-ce * Math.cos(rad(SUN.off_normal)), -se, ce * Math.sin(rad(SUN.off_normal))];

// ---------------------------------------------------------------- the beam
// Aperture = the four panes at the inner face of the gable (x = WINDOW.x), less what the 0.12 m wall's jamb and head
// shade at this sun angle, less the mullion cross. Four parallel shafts, 3 cm apart: read as one beam.
const WALL_T = 0.12;
const jamb = { dz: (WALL_T / -SUN_DIR[0]) * SUN_DIR[2], dy: (WALL_T / -SUN_DIR[0]) * -SUN_DIR[1] };   // shift of the outer opening's shadow at the inner face
const W = WINDOW, zA = W.z - W.w / 2 + jamb.dz, zB = W.z + W.w / 2, y0 = W.sill, y1 = W.sill + W.h - jamb.dy, ym = W.sill + W.h / 2, m = W.mullion / 2;
const rect = (za, zb, ya, yb) => [[W.x, yb, za], [W.x, yb, zb], [W.x, ya, zb], [W.x, ya, za]];   // TL, TR, BR, BL seen from inside (left = -z)
export const BEAM = {
  name: 'sun', kind: 'low winter sun through the four-pane window',
  dir: SUN_DIR,
  // names as the engine's panes: seen from inside, L = -z, R = +z
  apertures: { window_TL: rect(zA, W.z - m, ym + m, y1), window_TR: rect(W.z + m, zB, ym + m, y1), window_BL: rect(zA, W.z - m, y0, ym - m), window_BR: rect(W.z + m, zB, y0, ym - m) },
  whole: rect(zA, zB, y0, y1),                      // the outline of the four together (used for the single mask volume)
  centre: [W.x, (y0 + y1) / 2, (zA + zB) / 2],
  // receiving planes (keep n.p <= d)
  clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, { name: 'door gable', n: [-1, 0, 0], d: -ROOM.x0 },
    { name: 'front knee wall', n: [0, 0, 1], d: ROOM.z1 }, { name: 'back knee wall', n: [0, 0, -1], d: -ROOM.z0 }],
};
// centre line of the beam: point at parameter t (metres along the light from the window)
export const beamAxis = (t) => BEAM.centre.map((c, i) => c + SUN_DIR[i] * t);
// where the centre line meets the floor, and the beam's cross-section at a given x (z range, top and bottom height)
export const AXIS_FLOOR_T = BEAM.centre[1] / -SUN_DIR[1];
export const beamAt = (x) => { const t = (W.x - x) / -SUN_DIR[0]; return { z0: zA + t * SUN_DIR[2], z1: zB + t * SUN_DIR[2], top: y1 + t * SUN_DIR[1], bottom: Math.max(0, y0 + t * SUN_DIR[1]) }; };

// ---------------------------------------------------------------- frost
// Frost on all four panes, thickest in the lower corners; the FERN is the one she traces (1:36.0, -2sm) and the one that
// grows into a neuron (3:43.0): on the lower pane nearest the reading spot. The fern itself is a renderer layer; the
// set gives its root, tip and pane.
export const FROST = { x: W.x - 0.012, cover: 0.55 };   // fraction of each pane's height the frost reaches in its corner
export const FERN = { pane: 'window_BR', root: [W.x - 0.012, W.sill + 0.03, zB - 0.03], tip: [W.x - 0.012, W.sill + 0.27, W.z + 0.12], branches: 5 };

// ---------------------------------------------------------------- the reading spot at the sill
// She kneels on a folded cushion at the window and uses the sill board as a desk; the textbook stack (attic88 v4,
// STACK4) is at her right hand.
// r4b (Jade: "no one is kneeling ... both people are standing"): she now STANDS at the sill to trace the fern, so the
// cushion she reads on lies pushed aside behind her left (was at [3.13, -0.74], under where she now stands).
export const READING = { cushion: { at: [2.80, -1.12], w: 0.42, d: 0.46, t: 0.06 }, book: { at: [3.415, W.sill - 0.035, -1.02], w: 0.13, d: 0.19, t: 0.018, yaw: 6 },
  kneel: [3.13, -0.70] };

// ---------------------------------------------------------------- the paper keyboard, in the beam
// Two taped A4 sheets with two octaves printed (0.594 x 0.21). It lies in the tail of the beam where the light is
// already below her chest: she sits behind it facing up the beam (toward the window), so her hands and knees are in
// the light and her face is above it.
export const SEAT = { at: [0.46, 0.55], yaw: 130 };                       // little Jade's pelvis and facing (0 = +z, 90 = +x)
const f = [Math.sin(rad(SEAT.yaw)), Math.cos(rad(SEAT.yaw))];             // her facing in plan (x, z)
export const KEYS = { at: [SEAT.at[0] + 0.40 * f[0], SEAT.at[1] + 0.40 * f[1]], yaw: SEAT.yaw + 180, w: 0.594, d: 0.21,
  // r4 (Jade): the printed keyboard is an exact canvas texture (keyboard.js): C3..C6, 22 whites x 23.5 mm = 0.517 m on the
  // 0.594 m paper (38.5 mm margins left and right), keys 150 mm on the 210 mm depth (30 mm margins), black keys 13.7 x 95 mm.
  // (r3: 21 whites C..B drawn as ink boxes; before that 14 keys filling the paper.)
  kb: { whites: 22, white: [0.0235, 0.150], black: [0.0137, 0.095] } };
// world corners of the printout, as the player reads it: TL (far left = lowest note, far edge), TR, BR, BL
export const keysCorners = () => { const a = rad(KEYS.yaw), ux = [Math.cos(a), -Math.sin(a)], uz = [Math.sin(a), Math.cos(a)];   // local x, local z in plan
  const P = (lx, lz) => [KEYS.at[0] + ux[0] * lx + uz[0] * lz, 0.002, KEYS.at[1] + ux[1] * lx + uz[1] * lz];
  return [P(-KEYS.w / 2, -KEYS.d / 2), P(KEYS.w / 2, -KEYS.d / 2), P(KEYS.w / 2, KEYS.d / 2), P(-KEYS.w / 2, KEYS.d / 2)]; };

// ---------------------------------------------------------------- the mote
// One seeded particle field for the set (the renderer draws it); the hero mote is fixed here so it is the same mote
// in every shot. It floats 9 cm inside the beam's east (-z) face, drifts out through that face, crosses the dark,
// and comes back in where she is already looking.
export const MOTE = { seed: 1988, count: 600, hero: [1.30, 0.50, -0.27], exit: [1.27, 0.52, -0.39], dark: [1.20, 0.53, -0.45], reenter: [1.12, 0.47, -0.24] };

// ---------------------------------------------------------------- light list
export const LIGHTS = {
  sun: { kind: 'low winter sun through the window (parallel)', dir: SUN_DIR, color: SUN.color },
  sky: { kind: 'cold skylight through the same window (ambient fill)', color: SUN.sky },
  // off by day: the neon sign, the stairwell bulb, the bare bulb, the kitchen light through the floorboards
};
