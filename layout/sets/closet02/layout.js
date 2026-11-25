// CLOSET, ABOUT 2002 ("Proof": chorus 2a, 3:23.4-3:34.2, -2sm). Single source of truth (metres, y up, floor at y = 0).
// A walk-in bedroom closet with the door left ajar. Two people sit cross-legged on the floor facing each other, all
// four hands together between them; one shaft of sun from the bedroom comes through the door gap and lands on the hands.
//   x: -0.80 = the end behind Jade ... +1.20 = the end behind first love (the cameras are at this end)
//   z: -0.65 = the DOOR wall (bedroom beyond, at -z) ... +0.65 = back wall (hanging rail)
// The cameras look toward -x, so the door wall is frame-RIGHT and the light crosses from upper right to lower left.
const rad = (d) => (d * Math.PI) / 180;
export const ROOM = { x0: -0.80, x1: 1.20, z0: -0.65, z1: 0.65, h: 2.4, wall: 0.1 };
// the people: pelvis positions and facings; where the four hands meet
export const SEATS = { jade19: { at: [-0.45, 0.0], yaw: 90 }, firstLove: { at: [0.45, 0.0], yaw: -90 } };
export const HANDS = [0.0, 0.30, 0.0];

// ---------------------------------------------------------------- the door, ajar
// 0.76 m leaf in the door wall, hinged on its outer face at x = hinge, opening OUTWARD into the bedroom by `ajar`
// degrees. The latch-side jamb is at x = hinge + w. Straight-through gap = w (1 - cos ajar).
export const DOOR = { w: 0.76, h: 2.03, t: 0.035, ajar: 32, hinge: -0.702 };
DOOR.jamb = DOOR.hinge + DOOR.w;                                      // 0.058
DOOR.edge = [DOOR.hinge + DOOR.w * Math.cos(rad(DOOR.ajar)), ROOM.z0 - ROOM.wall - DOOR.w * Math.sin(rad(DOOR.ajar))];   // the leaf's free edge in plan (x, z)

// ---------------------------------------------------------------- the beam
// ASSUMPTION: afternoon sun through the bedroom window, square on to the door wall, 49 degrees high. The shaft is a
// thin vertical slab seen side-on by cameras that look along the closet, so its slope on screen follows its physical
// slope; 49 degrees is what gives the rhyme angle (40) in CL_wide, which looks down on it from the door side.
// It passes the gap between the leaf's free edge and the jamb. Its upper edge is the shadow of the bedroom window's
// head; its lower edge is the shadow of whatever stands under that window. The bedroom itself is not modelled: two
// stand-in blockers outside the door cast those two edges.
export const SUN = { altitude: 49, color: 0xffe6b8 };
export const SUN_DIR = [0, -Math.sin(rad(SUN.altitude)), Math.cos(rad(SUN.altitude))];
const t = Math.tan(rad(SUN.altitude));
const yMid = HANDS[1] + (HANDS[2] - ROOM.z0) * t;                     // height of the shaft's centre at the door wall's inner face
export const SHAFT = { x0: DOOR.edge[0], x1: DOOR.jamb, y0: yMid - 0.145, y1: yMid + 0.145 };
export const BEAM = {
  name: 'door', kind: 'afternoon sun from the bedroom through the gap of the door left ajar (parallel)',
  dir: SUN_DIR,
  aperture: [[SHAFT.x1, SHAFT.y1, ROOM.z0], [SHAFT.x0, SHAFT.y1, ROOM.z0], [SHAFT.x0, SHAFT.y0, ROOM.z0], [SHAFT.x1, SHAFT.y0, ROOM.z0]],   // TL, TR, BR, BL seen from inside
  centre: [(SHAFT.x0 + SHAFT.x1) / 2, yMid, ROOM.z0],
  clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, { name: 'back wall', n: [0, 0, 1], d: ROOM.z1 }],
};
export const beamAxis = (s) => BEAM.centre.map((c, i) => c + SUN_DIR[i] * s);
// the stand-in blockers: slabs square to the light, `back` metres outside the inner face of the door wall
export const BLOCKERS = { back: 0.75, lowerTop: SHAFT.y0 + 0.75 * t, upperBottom: SHAFT.y1 + 0.75 * t, w: 1.6 };

// ---------------------------------------------------------------- what is in the closet
export const RAIL = { y: 1.68, z: 0.42, x0: ROOM.x0, x1: ROOM.x1, garments: { from: -0.72, to: 1.12, step: 0.115, w: 0.40, drop: [0.72, 0.95, 0.80, 1.05, 0.76, 0.9] } };
export const SHELF = { y: 1.80, d: 0.42 };
export const FLOOR_THINGS = { shoes: [[-0.62, 0.50], [-0.40, 0.52], [0.86, 0.52]], box: { at: [1.02, 0.44], w: 0.3, h: 0.24, d: 0.36 } };

export const MOTE = { seed: 2002, count: 80 };   // dust in the shaft; no hero mote in this scene
export const LIGHTS = {
  door: { kind: 'afternoon sun through the door gap (parallel)', dir: SUN_DIR, color: SUN.color },
  // nothing else: the closet has no light of its own
};
