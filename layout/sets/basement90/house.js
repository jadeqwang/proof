// DECATUR HOUSE, 1990 — facts shared by the two sets that join: `basement90` and `kitchen90`.
// Both sets use the SAME plan coordinates (x, z in metres): the kitchen sits directly above the basement's
// x -1.8 .. 1.8 part, and the basement stair runs in a strip beside it (x -2.8 .. -1.9), behind the kitchen's left wall.
// Each set has its own floor at y = 0; the kitchen floor is HOUSE.floorToFloor above the basement slab.
//   x: - = house left ... + = house right       z: - = back wall (kitchen window / basement desk) ... + = front
import { CAST, PROP } from '../_cast.js';

export const HOUSE = {
  floorToFloor: 2.6,
  kitchen: { x0: -1.8, x1: 1.8, z0: -2.1, z1: 2.1, h: 2.44 },
  basement: { x0: -2.9, x1: 1.8, z0: -2.1, z1: 2.1, h: 2.3 },     // h = clear height to the subfloor; joists hang below it
  // the door in the kitchen's left wall that opens onto the basement stair's top landing
  stairDoor: { x: -1.8, z0: 1.05, z1: 1.85, h: 2.0 },
  // top landing (at kitchen floor level), then one straight flight down toward -z along the outer wall
  landing: { x0: -2.8, x1: -1.8, z0: 1.0, z1: 1.9 },
  stair: { x0: -2.8, x1: -1.9, zTop: 1.0, risers: 12, tread: 0.23 },
};
HOUSE.stair.rise = HOUSE.floorToFloor / HOUSE.stair.risers;

// Cast for 1990: `jade7`, `dad`, `mama90` come from ../_cast.js (one table for every set; Dad is 1.72 m there).
// The basement's barefoot summer look is a per-shot costume (BAREFOOT), not a second cast entry.
export const BAREFOOT = { top: 0xe9e2d2, sock: 0xe6b996, sleeves: 'short' };   // sock = skin: bare feet
export const WHO = { jade: 'jade7', dad: 'dad', mama: 'mama90' };

// leg geometry of a cast member (same arithmetic as buildFigure), for placing feet and seats exactly
export function legOf(who) { const c = CAST[who], pr = PROP[c.kind], L = pr.hip * c.h; return { H: c.h, L, reach: 0.94 * L, ankleH: 0.06 * L, pelvisDrop: 0.055 * c.h }; }
// hip-joint height for a figure sitting on a seat whose top is at seatTop
export const seatHip = (who, seatTop) => seatTop + legOf(who).pelvisDrop;
