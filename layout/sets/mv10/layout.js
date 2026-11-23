// MV10 — the housewarming, Mountain View, 2010. SINGLE SOURCE OF TRUTH (metres, y up, floor at y = 0).
// One set, two connected spaces sharing the sliding door: the BOOKSHELF ROOM and the YARD.
//   x: -3.0 = room's LEFT wall (hall doorway) ... +3.0 = room's RIGHT wall (sliding glass door) ... 11.0 = yard's far (west) fence
//   z:  0.0 = room's BACK wall (the bookshelf) ... 4.4 = room's FRONT wall (the three lamps stand along it)
// Compass: +x = WEST (the dusk sun sets beyond the yard fence), +z = SOUTH.
// The "front" camera looks toward -z at the shelf: -x is frame-left, +x (door, yard) is frame-right.

export const ROOM = { x0: -3.0, x1: 3.0, z0: 0.0, z1: 4.4, h: 2.44, wallT: 0.12 };
// sliding glass door to the yard, in the right wall: opening z 1.5 .. 3.3; the leaf nearer the shelf is fixed glass,
// the leaf nearer the front wall is slid open (the walk-through is z 2.4 .. 3.3)
export const SLIDER = { x: 3.0, z0: 1.5, z1: 3.3, h: 2.03, zMid: 2.4, frame: 0.05 };
// hall doorway in the left wall (no leaf; guests arrive through it)
export const HALL = { x: -3.0, z0: 3.3, z1: 4.2, h: 2.03 };

// ---------------------------------------------------------------- the bookshelf: wall-length, visibly two halves
// Two different bookcases pushed together. The seam is at x = 0.
//   LEFT half  = TRUTH ("truth by reference"): dark carcass, six even shelves, reference sets in uniform runs,
//                and one cluster of science-fiction paperbacks shelved among them ("science fiction shelved with truth").
//   RIGHT half = BEAUTY ("beauty on this side"): pale carcass, five uneven shelves, novels and art books of every
//                height, leaning books, flat stacks, objects in the gaps.
// spineZ is the plane of the book spines: every cast shadow on the shelf is computed on it.
export const SHELF = {
  depth: 0.30, spineZ: 0.285, seam: 0.0,
  truth: { x0: -2.8, x1: -0.02, h: 2.10, kick: 0.08, board: 0.022, shelves: 6, bay: 0.925, grey: 0.34, col: 0x3a2a1e,
    sf: { shelf: 4, x0: -0.86, x1: -0.50 } },                       // the science-fiction paperbacks, at her eye height by the seam
  beauty: { x0: 0.02, x1: 2.8, h: 1.98, kick: 0.06, board: 0.02, clear: [0.42, 0.36, 0.30, 0.30, 0.28], bay: 0.695, grey: 0.9, col: 0xe8e2d2 },
};

// ---------------------------------------------------------------- the three lamps and the three shadows
// Three identical paper floor lamps along the front wall. Same bulb height, same distance from the spines, so the
// three shadows of one person are the same size and (for a flat cut-out) exact copies, shifted sideways.
//   D = lamp z - spineZ = 3.865 ; she stands d = 1.155 in front of the spines ; magnification D / (D - d) = 1.426
//   a lamp x metres to her right throws her shadow x * d / (D - d) = 0.426 x to her left:
//   lamp offsets 0.95 / 2.05 / 3.15 m  ->  shadows 0.40 / 0.87 / 1.34 m left of her, 0.47 m apart, all on the TRUTH half.
export const LAMPS = { z: 4.15, bulbY: 1.30, x: [0.5, 1.6, 2.7], shadeR: 0.17, shadeH: 0.5, poleR: 0.012, baseR: 0.14,
  color: 0xffc98a };
export const lampPos = (i) => [LAMPS.x[i], LAMPS.bulbY, LAMPS.z];
// her mark at the shelf (pelvis x, z): on the truth half, just left of the seam
export const MARK = { shelf: [-0.45, 1.44] };
// where a point's shadow from lamp i lands on the spine plane: [x, y]
export const shadowOnShelf = (i, p) => { const L = lampPos(i), t = (SHELF.spineZ - L[2]) / (p[2] - L[2]);
  return [L[0] + (p[0] - L[0]) * t, L[1] + (p[1] - L[1]) * t]; };

// ---------------------------------------------------------------- room furniture (floor positions)
export const SOFA = { x0: -2.95, x1: -2.05, z0: 1.1, z1: 2.9, seat: 0.42, back: 0.8 };
export const RUG = { x0: -1.9, x1: 1.3, z0: 1.7, z1: 3.6, t: 0.012 };
export const SIDE_TABLE = { at: [-2.5, 0.72], w: 0.45, h: 0.5 };
export const PICTURES = [[-1.6, 1.55, 0.7, 0.5], [-0.55, 1.6, 0.4, 0.55]];   // on the front wall: [x, y centre, w, h]

// ---------------------------------------------------------------- the yard
export const YARD = { x0: 3.12, x1: 11.0, z0: -2.5, z1: 7.5, fenceH: 1.8, houseH: 2.7, eave: 0.45 };
export const PATIO = { x0: 3.12, x1: 5.6, z0: 0.2, z1: 5.0, t: 0.04 };      // concrete slab outside the slider
// the lemon tree: lemons the size of pomelos (r 0.085; a real lemon is r ~0.035)
export const TREE = { at: [7.0, 0.6], trunkH: 2.0, trunkR: 0.09, canopyR: 1.45, canopyY: 3.0, canopyK: 0.7, lemonR: 0.085, lemons: 16 };
export const DRINKS = { x0: 4.0, x1: 5.2, z0: 0.45, z1: 1.05, h: 0.74 };    // lemonade table on the patio
// the fire-poi spinner: two burning heads on 0.62 m tethers, each sweeping a circle beside the body
export const POI = { at: [8.8, 4.8], yaw: -110, centreY: 1.15, r: 0.72, side: 0.42, headR: 0.045 };
// centre of the circle swept on the spinner's left (s = +1) or right (s = -1): also where that hand is
export const poiCentre = (s) => { const a = POI.yaw * Math.PI / 180, lx = Math.cos(a), lz = -Math.sin(a), fx = Math.sin(a), fz = Math.cos(a);
  return [POI.at[0] + s * POI.side * lx + 0.2 * fx, POI.centreY, POI.at[1] + s * POI.side * lz + 0.2 * fz]; };

// ---------------------------------------------------------------- her path across the room (the gold line of verse 3)
// [x, z] on the floor, in order: shelf mark -> across the rug -> through the open slider (the greeting) ->
// the patio (the hug) -> the lemonade table -> under the lemon tree (first love).
export const PATH = [[-0.45, 1.44], [-0.2, 2.1], [0.6, 2.75], [1.8, 2.95], [2.75, 2.85], [3.6, 2.8], [4.3, 2.35], [4.9, 1.75], [5.6, 1.55], [6.3, 1.5]];
export const MARKS = { shelf: MARK.shelf, crossing: [0.6, 2.75], greeting: [2.75, 2.85], hug: [4.3, 2.35], tree: [6.3, 1.5] };

// ---------------------------------------------------------------- LIGHTS: every source, its direction, its lit footprint
// dusk sun: just above the western fence. Travel direction (unit, from the sun into the scene): mostly -x, slightly
// down (6 deg), drifting +z so the shaft that enters the slider crosses the room AWAY from the shelf.
const EL = 6 * Math.PI / 180, DRIFT = 0.2;
const dn = Math.hypot(1, Math.tan(EL), DRIFT);
export const DUSK = { elevationDeg: 6, dir: [-1 / dn, -Math.tan(EL) / dn, DRIFT / dn], slope: Math.tan(EL), drift: DRIFT, color: 0xff8a4a };
// the fence cuts the sun off below this height: at x, only things ABOVE duskFloorY(x) are in the beam
// (at the tree 1.38 m, at her mark by the tree 1.31 m, at the house wall 0.97 m: heads and lemons, not the lawn)
export const duskFloorY = (x) => YARD.fenceH - (YARD.x1 - x) * DUSK.slope;
// the shaft through the slider, as a slab crossing the room: at a given x (-3 .. 3) it spans z0..z1 and y0..y1.
// The house's own wall shades the room everywhere else.
export const duskShaftAt = (x) => { const k = SLIDER.x - x; return { z0: SLIDER.z0 + DRIFT * k, z1: SLIDER.z1 + DRIFT * k,
  y0: Math.max(0, duskFloorY(SLIDER.x) - DUSK.slope * k), y1: SLIDER.h - DUSK.slope * k }; };

export const LIGHTS = {
  lamp1: { kind: 'paper floor lamp (omni, warm)', pos: lampPos(0), color: LAMPS.color, room: 'bookshelf room' },
  lamp2: { kind: 'paper floor lamp (omni, warm)', pos: lampPos(1), color: LAMPS.color, room: 'bookshelf room' },
  lamp3: { kind: 'paper floor lamp (omni, warm)', pos: lampPos(2), color: LAMPS.color, room: 'bookshelf room' },
  dusk: { kind: 'low sun over the west fence (parallel)', dir: DUSK.dir, color: DUSK.color, room: 'yard, and one shaft through the slider' },
  poi: { kind: 'fire poi (two moving flames; effective point between the circles)', pos: [POI.at[0], POI.centreY, POI.at[1]], color: 0xff7a20, reach: 4.5, room: 'yard' },
  sky: { kind: 'ambient dusk sky', color: 0x40507a },
};
// lit footprints (world). Polygons are corner lists; the beam mask is rendered from these and from the rig in build.js.
export const FOOTPRINTS = {
  lamps_on_shelf: { surface: 'spine plane z = ' + SHELF.spineZ, rect: { x0: SHELF.truth.x0, x1: SHELF.beauty.x1, y0: 0, y1: SHELF.truth.h },
    note: 'all three lamps reach the whole shelf; the lit figure is the shelf MINUS the three shadows of whoever stands at it (see three_shadows in the sidecar)' },
  dusk_shaft_room: { note: 'slab of sun through the slider; cross-sections from duskShaftAt(x)', at_slider: duskShaftAt(3.0), at_room_centre: duskShaftAt(0), at_left_wall: duskShaftAt(-3.0),
    lands_on: 'left wall x = -3 (z 2.7 .. 4.4, y 0.34 .. 1.40) and the left end of the front wall; it never reaches the shelf wall' },
  dusk_yard: { note: 'everything above duskFloorY(x): tree canopy and lemons, heads and shoulders; lawn and patio are in the fence shadow', y_at_tree: duskFloorY(TREE.at[0]), y_at_house_wall: duskFloorY(YARD.x0) },
  poi_ground: { centre: [POI.at[0], 0, POI.at[1]], radius: 4.5, note: 'falls off with distance; the second light source of verse 3 and the only one at 3:29' },
  lamp_spill_patio: { note: 'lamp light leaving the open slider: a wedge on the patio from the mean lamp position through the two jambs',
    polygon: [[3.12, 0, SLIDER.z0], [3.12, 0, SLIDER.z1], [5.6, 0, 1.72], [5.6, 0, 0.2], [3.69, 0, 0.2]] },
};
