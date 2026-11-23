// ATTIC 1988 — single source of truth for numbers (metres, y up, floor at y = 0).
// The attic above a Chinese-Indonesian restaurant in the Netherlands. Gable roof with the ridge along x.
//   x: -3.5 = LEFT gable (stair door)  ...  +3.5 = RIGHT gable (the one window, neon sign outside)
//   z: -2.8 = back eaves (knee wall; the mats' pillows are here) ... +2.8 = front eaves
// The "front" camera direction looks toward -z, so the door gable is frame-left and the window gable frame-right.
export const ROOM = {
  x0: -3.5, x1: 3.5, z0: -2.8, z1: 2.8,
  knee: 0.9,          // knee-wall height
  ridge: 3.0,         // ridge height (underside of the roof boards)
  rafter: { spacing: 0.6, w: 0.07, d: 0.15 },
  collarY: 2.25,      // collar ties every second rafter pair
  board: { w: 0.14, gap: 0.006, crack: 0.013, t: 0.022 },
};
export const roofY = (z) => ROOM.knee + (ROOM.ridge - ROOM.knee) * (1 - Math.abs(z) / ROOM.z1);

// the window: low in the right gable, centred, two-by-two panes, dusty
export const WINDOW = { x: 3.5, z: -0.8, sill: 0.45, w: 0.8, h: 0.8, frame: 0.05, mullion: 0.03, depth: 0.16 };
// the neon sign: a letter frame hung on brackets 1.2 m outside the gable, parallel to it, facing the street.
// From inside it is read backwards. Lettering (invented): CHIN. IND. SPEC. REST. / 酒家
export const SIGN = { x: 3.5 + 1.2, z: -0.6, y: 1.1, w: 2.6, h: 1.25, text: ['CHIN. IND. SPEC. REST.', '酒家'],
  red: 0xff2a14, blue: 0x3f6dff };
// the stair door: centred in the left gable, opening outward over the stairwell
export const DOOR = { x: -3.5, z: 0.0, w: 0.76, h: 1.9, hingeZ: 0.38, maxDeg: 95 };
export const STAIRWELL = { x0: -5.6, z0: -0.55, z1: 0.55, bulb: [-4.15, 2.05, 0.0] };

// furniture and props (floor positions)
export const MATS = {
  mama: { x0: 1.15, x1: 2.05, z0: -2.55, z1: -0.6, t: 0.06 },
  littleJade: { x0: 2.15, x1: 2.95, z0: -2.5, z1: -0.75, t: 0.06 },
};
export const PILLOW = { w: 0.5, d: 0.32, t: 0.11 };
export const PROPS = {
  textbooks: { at: [3.22, -2.3], n: 7 },
  piano: { at: [1.85, -0.18], yaw: -8, w: 0.594, d: 0.21 },     // two A4 sheets taped, printed with 2 octaves
  tv: { at: [0.28, -2.2], yaw: 22, crate: [0.42, 0.3, 0.32], tv: [0.36, 0.32, 0.34] },
  boxes: [[-2.75, -2.3, 0.5, 0.42, 0.42, 8], [-2.2, -2.45, 0.42, 0.34, 0.36, -5], [-2.7, -2.25, 0.4, 0.3, 0.36, 12, 0.42], [-1.0, 2.35, 0.55, 0.38, 0.45, 4]],
  sacks: [[-2.85, 2.1, 0], [-2.35, 2.35, 30], [-2.95, 1.55, -20]],
  bulb: { x: 0.4, z: 0.0, drop: 0.55 },  // a bare bulb on its cord, switched off
};
// lines of warm light up through the floorboards: the kitchen is under the front-left half
export const KITCHEN = { x0: -2.4, x1: 2.9, z0: -0.45, z1: 1.7 };

// light list (positions in metres)
export const LIGHTS = {
  neon: { kind: 'neon sign through window (effective point: the part of the sign the mats see through the glass)', pos: [SIGN.x - 0.03, 1.5, -0.2], colors: { red: SIGN.red, blue: SIGN.blue } },
  floor: { kind: 'tungsten through floorboard cracks', color: 0xffa24a },
  stair: { kind: 'tungsten bulb in the stairwell, through the door', pos: STAIRWELL.bulb, color: 0xffb468 },
  night: { kind: 'ambient night', color: 0x1a2240 },
};

// ---------------------------------------------------------------- v3 (director's review)
// The neon sign is a vertical BLADE (projecting sign): mounted on brackets on the outside of the gable, perpendicular
// to the wall, lettering on both faces (read from the street, along the facade). It hangs in front of the far (-z)
// third of the attic window, so from inside it is seen at a steep oblique: a foreshortened wedge of red. (Through a
// 0.8 m window from 5 m back you only see what hangs almost straight out from the glass: a blade beside the window,
// clear of the glass, cannot be seen from the door end at all. See docs/LAYOUT_V3.md, neon options.)
//   plane z = SIGN_V3.z; x0..x1 = distance out from the wall (outer wall face at x = 3.62); y0..y1 (attic floor = 0:
//   the blade starts a storey below and its top passes the attic window, sill 0.45 .. head 1.25).
// blocks: [text, yBottom, yTop, width]: the lettering areas on each face, top to bottom.
export const SIGN_V3 = { z: -1.0, x0: 3.80, x1: 4.50, y0: -1.1, y1: 1.5, t: 0.12, red: 0xff2a14, blue: 0x3f6dff,
  blocks: [['酒', 0.93, 1.43, 0.5], ['家', 0.38, 0.88, 0.5], ['CHIN.', 0.08, 0.28, 0.6], ['IND.', -0.19, 0.01, 0.6], ['SPEC.', -0.46, -0.26, 0.6], ['REST.', -0.73, -0.53, 0.6]] };
// a rail of four hooks on the door gable, on the mats' side of the stair door (door opening z -0.38..0.38)
export const HOOKS = { x: -3.5, y: 1.42, z: [-0.64, -0.78, -0.92, -1.06] };
// the lap storytime place: Mama sits on little Jade's mat, turned a little away from the window so the page catches the neon
export const LAP = { base: [2.6, -1.5], yaw: -18, floor: 0.06 };
// D9: the stack of textbooks little Jade climbs, on the floorboards off the foot of her mat, in the neon beam
export const D9_STACK = { at: [2.5, -0.38], n: 9 };
export const bookT = (k) => 0.032 + (k % 3) * 0.006;
export const stackH = (n) => { let h = 0; for (let k = 0; k < n; k++) h += bookT(k); return h; };
