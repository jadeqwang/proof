// SHANGHAI 1986 — single source of truth for numbers (metres, y up, floor at y = 0).
// One upstairs room of a lilong house: the family's bed, wardrobe, chest of drawers and square table all in one room.
//   x: -1.8 = LEFT wall (the one window; afternoon sun)  ...  +1.8 = RIGHT wall (the door to the landing)
//   z: -2.2 = BACK wall (the bed along it)               ...  +2.2 = FRONT wall (behind the main cameras)
// The main camera direction looks toward -z: window frame-left, door frame-right, so the beam crosses the frame
// from upper left to lower right (the film's diagonal).
export const ROOM = { x0: -1.8, x1: 1.8, z0: -2.2, z1: 2.2, h: 2.9, wallT: 0.24 };

// the window: a two-leaf wooden casement in the left wall, three panes per leaf
export const WINDOW = { x: -1.8, z: 0.3, w: 1.0, sill: 0.95, h: 1.15, frame: 0.05, mullion: 0.025 };
// the door: in the right wall, opposite the window, opening outward onto the landing
export const DOOR = { x: 1.8, z: -0.2, w: 0.8, h: 2.0, openDeg: 100 };

// ---------------------------------------------------------------- THE BEAM
// Afternoon sun through the window, visible as a shaft in humid air. Parallel light.
//   elev: degrees above the horizon; az: degrees the travel direction swings from +x toward -z.
export const SUN = { elev: 40, az: 12, color: 0xfff1d0 };
const E = SUN.elev * Math.PI / 180, A = SUN.az * Math.PI / 180;
export const SUN_DIR = [Math.cos(E) * Math.cos(A), -Math.sin(E), -Math.cos(E) * Math.sin(A)];   // unit travel direction
// the opening the light comes through (inner face of the wall), corners TL, TR, BR, BL as seen from inside looking -x
// (looking at the left wall from inside, +z is on the left)
const W = WINDOW;
export const BEAM_SOURCE = [
  [W.x, W.sill + W.h, W.z + W.w / 2], [W.x, W.sill + W.h, W.z - W.w / 2], [W.x, W.sill, W.z - W.w / 2], [W.x, W.sill, W.z + W.w / 2],
];
// where a ray from point p lands on the horizontal plane at height y
export const sunLand = (p, y = 0) => { const t = (p[1] - y) / -SUN_DIR[1]; return [p[0] + SUN_DIR[0] * t, y, p[2] + SUN_DIR[2] * t]; };
// footprint of the beam on the plane y (default: the floor), same corner order as BEAM_SOURCE
export const beamFootprint = (y = 0) => BEAM_SOURCE.map((p) => sunLand(p, y));
// the lit volume: the prism between BEAM_SOURCE and beamFootprint(0). A point is in the beam when, pushed back along
// -SUN_DIR to the wall plane, it falls inside the window opening.
export const inBeam = (p) => { const t = (p[0] - W.x) / SUN_DIR[0]; const y = p[1] - SUN_DIR[1] * t, z = p[2] - SUN_DIR[2] * t;
  return t >= 0 && p[1] >= 0 && y >= W.sill && y <= W.sill + W.h && z >= W.z - W.w / 2 && z <= W.z + W.w / 2; };
export const BEAM = { kind: 'sun through the window, a shaft in humid air (parallel light)', source: BEAM_SOURCE, dir: SUN_DIR,
  lands_on: 'the floorboards in the middle of the room', footprint_floor: beamFootprint(0) };
// With these numbers the pool on the floor is a parallelogram about 1.37 m long (x -0.67 .. +0.70) by 1.0 m wide,
// z -0.44 .. +0.56 at its window end and z -0.73 .. +0.27 at its far end. Where she sits (x = -0.2) the shaft is
// 0.76 m tall, so a seated three-year-old (head top 0.62) is wholly inside it; a standing adult's head never is.

// ---------------------------------------------------------------- places (floor positions [x, z])
export const PLACES = {
  // verse line 1 ("uncle explains atoms"): the uncle on a stool, turned toward the child with his back three-quarters to the main camera, hands low in the shaft; the child stands
  uncleStool: [-0.17, 0.35], uncleYaw: -140, uncleHands: [-0.5, 0.56, -0.05], jadeStand: [-0.62, -0.42],   // uncleHands = where his fingertips meet
  // a week later: she sits in the pool of light, facing the main camera, the drift round her
  jadeSit: [-0.2, -0.36], focus: [-0.2, 0.0, 0.06],   // the clear patch of floor in front of her where the pieces are laid out
  drift: { at: [-0.2, -0.08], sx: 0.36, sz: 0.3, n: 170, seed: 1986 },
  mother: [1.72, -0.2],                               // in the doorway
  aunt: [1.22, -0.78], uncleLaugh: [1.18, 0.5], grandma: [0.95, -0.9],   // the laughing adults, all outside the shaft
};
// one sheet of rough tissue (草纸), torn in halves again and again
export const TISSUE = { sheet: 0.19, t: 0.0012 };

// ---------------------------------------------------------------- furniture
export const BED = { x0: -0.55, x1: 1.35, z0: -2.15, z1: -0.8, h: 0.5, frame: 0.06, postH: 1.85 };          // double bed with a mosquito-net frame
export const WARDROBE = { x0: 1.25, x1: 1.78, z0: 0.72, z1: 1.82, h: 1.85 };                                   // 大橱, mirror door
export const CHEST = { x0: -1.78, x1: -1.33, z0: -2.1, z1: -1.15, h: 1.0 };                                    // 五斗橱: radio, thermoses, clock
export const TABLE = { cx: -1.3, cz: 1.58, w: 0.85, h: 0.78 };                                                 // square table (八仙桌) with stools
export const BAMBOO_CHAIR = { at: [0.72, 1.62], yaw: -150 };
export const BULB = { x: 0.2, z: 0.3, drop: 0.6 };                                                             // bare bulb, off
export const CALENDAR = { x: 0.45, y: 1.62, w: 0.36, h: 0.52 };                                                // on the back wall over the bed

export const LIGHTS = {
  sun: { kind: BEAM.kind, color: SUN.color, dir: SUN_DIR },
  sky: { kind: 'soft skylight through the same window', color: 0xcfd8e0 },
  amb: { kind: 'room bounce', color: 0x8a8478 },
};
