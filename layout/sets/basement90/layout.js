// BASEMENT, DECATUR, 1990 — single source of truth for numbers (metres, y up, slab at y = 0).
// Unfinished basement under the kitchen. THE BEAM: the blue glow of the CRT screen, the only light.
//   x: -2.9 = outer wall beside the stair ... +1.8 = right wall
//   z: -2.1 = back wall (the desk stands against it; the screen faces +z) ... +2.1 = front wall
// The "front" camera direction looks toward -z: Dad's back, the screen beyond him.
import { HOUSE, legOf } from './house.js';
export { HOUSE };

export const ROOM = { ...HOUSE.basement, wallT: 0.2,
  joist: { d: 0.19, w: 0.04, spacing: 0.406 },          // 2x8 joists at 16 in, running along z, under the kitchen floor
  hopper: { x: -0.95, y0: 1.72, y1: 2.06, w: 0.8 },     // small hopper window high in the back wall; night outside
  column: { x: -0.7, z: 0.35, r: 0.045 },               // steel lally column
  bulb: { x: 0.2, z: -0.3, drop: 0.25 },                // bare bulb with a pull chain, OFF
};

// the desk: a plain table-desk against the back wall. Drawer pedestal on the right, two legs on the left, so the
// kneehole is open toward -x (the cat is seen from there).
export const DESK = { x0: 0.0, x1: 1.4, z0: -2.08, z1: -1.38, top: 0.74, t: 0.03, pedestalX0: 0.98, leg: 0.05, modesty: { y0: 0.3 } };

// the computer: horizontal desktop case, 14 in CRT on top, keyboard in front. Centred on Dad.
export const PC = { x: 0.6,
  case: { w: 0.42, h: 0.15, d: 0.40, zBack: -2.03 },
  monitor: { w: 0.36, h: 0.33, d: 0.40, foot: 0.03 },
  screen: { w: 0.27, h: 0.20 },
  keyboard: { w: 0.46, h: 0.03, d: 0.17, z: -1.49 },
  printer: { x: 1.18, z: -1.78, w: 0.38, h: 0.12, d: 0.3 },   // dot-matrix, fanfold paper feeding up from behind
};
const scrY = DESK.top + PC.case.h + PC.monitor.foot + PC.monitor.h / 2;
const scrZ = PC.case.zBack + PC.monitor.d + 0.002;
// the glass: centre, size, outward normal. Corner order TL, TR, BR, BL as read by someone facing the screen.
export const SCREEN = { c: [PC.x, scrY, scrZ], w: PC.screen.w, h: PC.screen.h, n: [0, 0, 1] };
export const screenPoint = (u, v, lift = 0) => [SCREEN.c[0] + (u - 0.5) * SCREEN.w, SCREEN.c[1] + (0.5 - v) * SCREEN.h, SCREEN.c[2] + lift];   // u right, v down, as read
export const screenCorners = () => [screenPoint(0, 0), screenPoint(1, 0), screenPoint(1, 1), screenPoint(0, 1)];
// 14 lines of code on the screen; THE WORD (the one Dad missed) is on line 6, left of centre (her side): underlined in gold.
export const TEXT = { lines: 14, top: 0.08, pitch: 0.062, left: 0.07 };
export const WORD = { u0: 0.2, u1: 0.36, v: TEXT.top + 6 * TEXT.pitch };            // the underline sits on v; the word's body is one pitch above it
export const WORD_P = screenPoint((WORD.u0 + WORD.u1) / 2, WORD.v - TEXT.pitch * 0.45);   // centre of the word on the glass (the fingertip lands here)

// the swivel chair: five-spoke base. Spoke angles are WORLD angles in the floor plane, from +x toward +z; the base does
// not turn with the seat. Spokes 0 and 1 (144 and 216 deg) are the two on Dad's left (back-left, front-left): her feet.
export const CHAIR = { at: [0.6, -1.12], seatYaw: 180, spoke0: 144, spokeR: 0.33, spokeTop: 0.10, spokeW: 0.05, caster: 0.028,
  seatTop: 0.45, seat: { w: 0.42, d: 0.42, t: 0.07 }, back: { w: 0.38, y0: 0.62, y1: 0.86, t: 0.05, z: -0.235 } };
export const spokeAngle = (k, spoke0 = CHAIR.spoke0) => spoke0 + 72 * k;
export const spokePoint = (k, r = CHAIR.spokeR, at = CHAIR.at, spoke0 = CHAIR.spoke0) => { const a = spokeAngle(k, spoke0) * Math.PI / 180; return [at[0] + r * Math.cos(a), CHAIR.spokeTop, at[1] + r * Math.sin(a)]; };
// where her bare feet stand: spoke 1 (front-left) and spoke 0 (back-left), 0.29 m out from the hub
export const FEET = { r: 0.29, front: spokePoint(1, 0.29), back: spokePoint(0, 0.29) };

export const PROPS = {
  shelf: { x: 1.58, z0: 0.3, z1: 1.5, d: 0.4, h: 1.8, shelves: [0.1, 0.55, 1.0, 1.45] },   // steel shelving on the right wall
  boxes: [[0.55, 1.78, 0.5, 0.4, 0.45, 6], [0.53, 1.8, 0.42, 0.3, 0.38, -8, 0.4]],   // x, z, w, h, d, yaw, y
  heater: { x: -1.55, z: -1.7, r: 0.26, h: 1.45 },       // water heater in the back-left corner, beyond the stair foot
  washer: { x: -1.2, z: 1.72, w: 0.68, h: 0.92, d: 0.66 },
};

// ---------------------------------------------------------------- THE BEAM
// An area source: the lit phosphor rectangle. It radiates into the half-space in front of the glass (+z); the useful
// volume is a frustum from the screen rectangle that spreads by halfAngle and has faded out by `range`.
// The desk top cuts it: nothing under the desk and nothing on the floor close to the desk is lit (see deskTerminator).
export const BEAM = { name: 'CRT screen glow', color: 0x3f6dff, source: SCREEN, axis: [0, -0.08, 1], halfAngleDeg: 62, range: 2.6,
  falloff: 'inverse-square from an area source: full on faces 0.4-0.6 m away, about 1/10 at 1.5 m' };
// far rectangle of the lit frustum (TL, TR, BR, BL as seen from the screen looking out)
export function beamFar() { const t = Math.tan(BEAM.halfAngleDeg * Math.PI / 180) * BEAM.range, [cx, cy, cz] = SCREEN.c, hw = SCREEN.w / 2 + t, hh = SCREEN.h / 2 + t, dy = BEAM.axis[1] * BEAM.range, z = cz + BEAM.range;
  return [[cx + hw, cy + hh + dy, z], [cx - hw, cy + hh + dy, z], [cx - hw, cy - hh + dy, z], [cx + hw, cy - hh + dy, z]]; }
// Where the desk's front edge cuts the light on the floor (or on a plane at height y): z beyond `full` sees the whole
// screen; between `umbra` and `full` only part of it (penumbra); nearer than `umbra` none of it.
export function deskTerminator(y = 0) { const ez = DESK.z1, ey = DESK.top, top = SCREEN.c[1] + SCREEN.h / 2, bot = SCREEN.c[1] - SCREEN.h / 2, sz = SCREEN.c[2];
  const hit = (sy) => ez + (ey - y) * (ez - sz) / (sy - ey);
  return { umbra: +hit(top).toFixed(3), full: +hit(bot).toFixed(3) }; }

export const LIGHTS = {
  screen: { kind: 'CRT screen (blue, area source); the ONLY light', pos: [SCREEN.c[0], SCREEN.c[1], SCREEN.c[2] + 0.02], aim: [SCREEN.c[0], SCREEN.c[1] - 0.2, SCREEN.c[2] + 2.5], color: BEAM.color },
  dark: { kind: 'ambient: none (a trace so the lit preview is readable)', color: 0x0a0c18 },
};

// recurring figure geometry: Jade standing on the two spokes at Dad's left
export function jadeOnSpokes() { const g = legOf('jade7'); const dz = (FEET.back[2] - FEET.front[2]) / 2;
  const pelvis = [FEET.front[0] - 0.035, 0, (FEET.front[2] + FEET.back[2]) / 2 + 0.03];
  const drop = Math.sqrt(Math.max(g.reach * g.reach * 0.97 - dz * dz - 0.035 * 0.035, 0.01));
  pelvis[1] = CHAIR.spokeTop + g.ankleH + drop;
  return { pelvis, ankleLocalY: -drop, dz, g }; }
