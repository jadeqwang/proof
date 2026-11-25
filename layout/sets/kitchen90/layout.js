// KITCHEN, DECATUR, 1990 — single source of truth for numbers (metres, y up, floor at y = 0).
// Eat-in kitchen directly above the basement (same plan coordinates as basement90; see ../basement90/house.js).
//   x: -1.8 = left wall (door to the basement stair) ... +1.8 = right wall (china cabinet with glass doors, hall doorway)
//   z: -2.1 = back wall (counter, sink, THE WINDOW) ... +2.1 = front wall
// The "front" camera direction looks toward -z: the window wall.
// TWO BEAMS, one per scene:
//   night (2:22.2-2:27.6 -2sm, the question / "it was correct"): the pendant lamp over the table, a cone straight down
//   day   (3:55.0-4:12.9 -2sm, outro): low sun through the window over the sink, a slanted shaft across the room
import { HOUSE } from '../basement90/house.js';
export { HOUSE };

export const ROOM = { ...HOUSE.kitchen, wallT: 0.12 };
export const WINDOW = { x: -0.3, z: ROOM.z0, sill: 1.07, w: 1.1, h: 1.0, frame: 0.05, depth: 0.14 };       // double-hung over the sink
export const COUNTER = { x0: -1.8, x1: 0.25, d: 0.62, h: 0.91, sink: { x: -0.3, w: 0.56, d: 0.4 }, uppers: [[-1.8, -0.93], [0.25, 1.01]], upperY0: 1.37, upperY1: 2.13, upperD: 0.32 };
export const STOVE = { x0: 0.25, x1: 1.01, d: 0.66, h: 0.91 };
export const FRIDGE = { x0: 1.04, x1: 1.78, d: 0.74, h: 1.68 };
export const STAIR_DOOR = HOUSE.stairDoor;                                  // left wall, closed
export const HALL = { x: ROOM.x1, z0: 1.1, z1: 2.0, h: 2.03 };              // open doorway in the right wall, toward the front
// china cabinet against the right wall: cupboard base, glazed upper doors. THE GLASS for the reflection shot.
export const CABINET = { x0: 1.4, x1: 1.8, z0: -0.3, z1: 0.7, baseH: 0.8, h: 1.92, glass: { y0: 0.86, y1: 1.84, z0: -0.26, z1: 0.66 }, shelves: [1.15, 1.5] };
export const GLASS = { x: CABINET.x0, n: [-1, 0, 0], ...CABINET.glass };   // plane x = 1.4, reflective face toward -x (the room)
export const glassCorners = () => [[GLASS.x, GLASS.y1, GLASS.z1], [GLASS.x, GLASS.y1, GLASS.z0], [GLASS.x, GLASS.y0, GLASS.z0], [GLASS.x, GLASS.y0, GLASS.z1]];   // TL,TR,BR,BL seen from the room
export const reflect = (p) => [2 * GLASS.x - p[0], p[1], p[2]];

export const TABLE = { c: [-0.7, 0.3], w: 1.2, d: 0.8, h: 0.74, t: 0.03 };
export const SEAT = 0.45;
// chairs: [x, z, yaw]. Night: Jade's chair on the back side facing the room, one at each end.
export const CHAIRS = { jade: [-0.7, -0.3, 0], left: [-1.5, 0.3, 90], right: [0.1, 0.3, -90] };
// Day (outro): the right-end chair is pulled out onto the open floor, facing the room: Mother sits in it, the child
// stands in front of her, with the china cabinet's glass 0.85 m to the child's right.
export const OUTRO = { motherChair: [0.55, -0.35, 0], child: [0.55, 0.26] };
export const PAPER = { c: [-0.78, TABLE.h + 0.001, 0.08], w: 0.14, h: 0.2, yaw: 8 };   // the sheet she writes "it was correct" on

// ---------------------------------------------------------------- BEAM 1 (night): pendant over the table
export const PENDANT = { x: TABLE.c[0], z: TABLE.c[1], shadeTop: 1.72, shadeBottom: 1.5, rTop: 0.06, rBottom: 0.2, bulbY: 1.6 };
const pendHalf = Math.atan(PENDANT.rBottom / (PENDANT.bulbY - PENDANT.shadeBottom)) * 180 / Math.PI;   // the shade's cut-off
export const BEAM_NIGHT = { name: 'pendant lamp over the table', color: 0xffc98a, apex: [PENDANT.x, PENDANT.bulbY, PENDANT.z], axis: [0, -1, 0], halfAngleDeg: +pendHalf.toFixed(1),
  note: 'a cone straight down from the bulb, cut off by the shade rim: everything above the rim plane (y 1.5) is unlit, so the standing parents’ heads are out of it and her hands and face are in it',
  radiusAt: (y) => (PENDANT.bulbY - y) * Math.tan(pendHalf * Math.PI / 180) };
// ---------------------------------------------------------------- BEAM 2 (day): sun through the window
// direction the light TRAVELS (unit). Elevation about 22 deg, swung 18 deg toward +x: a low sun.
const sd = [0.32, -0.42, 1], sl = Math.hypot(...sd);
export const SUN = { dir: sd.map((v) => v / sl), elevationDeg: +(Math.asin(-sd[1] / sl) * 180 / Math.PI).toFixed(1), color: 0xfff0d0 };
export const windowCorners = () => { const W = WINDOW, x0 = W.x - W.w / 2, x1 = W.x + W.w / 2; return [[x0, W.sill + W.h, W.z], [x1, W.sill + W.h, W.z], [x1, W.sill, W.z], [x0, W.sill, W.z]]; };   // TL,TR,BR,BL from inside
// follow a ray from p along the sun until it meets the floor, the front wall or the right wall
export function sunHit(p) { const d = SUN.dir, t = Math.min(p[1] / -d[1], (ROOM.z1 - p[2]) / d[2], d[0] > 0 ? (ROOM.x1 - p[0]) / d[0] : 1e9); return p.map((v, i) => v + d[i] * t); }
// the shaft's cross-section at depth z (TL,TR,BR,BL), and whether a point is inside the shaft
export function shaftAt(z) { const t = (z - WINDOW.z) / SUN.dir[2]; return windowCorners().map((p) => p.map((v, i) => v + SUN.dir[i] * t)); }
export function inShaft(p) { const q = shaftAt(p[2]); return p[0] > q[0][0] && p[0] < q[1][0] && p[1] < q[0][1] && p[1] > q[3][1]; }
export const BEAM_DAY = { name: 'sun through the window over the sink', color: SUN.color, source: 'window opening', dir: SUN.dir, elevationDeg: SUN.elevationDeg,
  note: 'a parallel shaft with the window’s section (1.1 x 1.0 m), slanting down toward the front-right; it crosses Mother’s chair and the child’s body and lands on the floor from z 0.45 forward' };
// the mote she follows (anchor for the seeded particle field): in the shaft, at her eye height, between her and the window
export const MOTE = [0.42, 1.16, -0.55];

export const LIGHTS = {
  pendant: { kind: 'tungsten pendant over the table (night scene; the only light)', pos: BEAM_NIGHT.apex, color: BEAM_NIGHT.color },
  sun: { kind: 'low sun through the window (day scene; the only direct light)', dir: SUN.dir, color: SUN.color },
};
