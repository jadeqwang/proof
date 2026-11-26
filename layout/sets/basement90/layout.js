// BASEMENT, DECATUR, 1990 — single source of truth for numbers (metres, y up, slab at y = 0).
// Unfinished basement under the kitchen. THE BEAM: the blue glow of the CRT screen.
// Plan from Jade's diagram (inputs/diagram_basement.png, 2026-11-26): the desk stands FREE in the middle of the room,
// Dad on its front side facing the back wall; "empty space" behind and left of it; a post just beyond the desk's
// back-right corner; an old wringer washer to the right; two watermelons on the floor front-right; the stair along the
// front wall from the left wall to about half the width.
//   x: -2.9 = left (outer) wall, the stair's top ... +1.8 = right wall
//   z: -2.1 = back wall (hopper window) ... +2.1 = front wall (the stair runs along it, z 1.3 .. 2.1, x -2.9 .. -0.37)
// The "front" camera direction looks toward -z: Dad's back, the screen beyond him.
import { HOUSE, legOf } from './house.js';
export { HOUSE };

export const ROOM = { ...HOUSE.basement, wallT: 0.2,
  joist: { d: 0.19, w: 0.04, spacing: 0.406 },          // 2x8 joists at 16 in, running along z, under the kitchen floor
  hopper: { x: -0.95, y0: 1.72, y1: 2.06, w: 0.8 },     // small hopper window high in the back wall; night outside
  column: { x: -0.09, z: -1.13, r: 0.045 },             // steel lally column ("post"): just beyond the desk's back-right corner; the main beam runs along x over it
  // CEILING LIGHT (Jade 2026-11-25 round 2: the basement had more ambient light from a ceiling light). Type (Jade
  // 2026-11-26 round 3): a bare bulb in a porcelain pull-chain holder. Modelled as a bare 60-75 W incandescent bulb in a
  // white porcelain pull-chain lampholder on a junction box nailed under a joist. ON.
  // Sits under a joist in front of Dad (moved with the desk group, 2026-11-26), so it lights both figures from
  // front-above; it is now also the stair light (15 cm short of the stairwell opening).
  bulb: { x: 0.33 + -1.624, z: -0.45 + 1.05, box: 0.05, holder: 0.06, r: 0.03 },
};

// THE DESK GROUP (2026-11-26, Jade's diagram): desk, computer, chair, both figures, the ceiling bulb and the B cameras
// moved together by this offset from where they stood when the desk was against the back wall (old desk x 0..1.4,
// z -2.08..-1.38). Every number below and in shots.js is old-position + GROUP, so the blocking and framings carry over.
export const GROUP = { dx: -1.624, dz: 1.05 };
const gx = (x) => +(x + GROUP.dx).toFixed(4), gz = (z) => +(z + GROUP.dz).toFixed(4);
export const gp = (p) => (p.length === 2 ? [gx(p[0]), gz(p[1])] : [gx(p[0]), p[1], gz(p[2])]);   // old [x, z] / [x, y, z] -> new
// the desk: a plain table-desk standing free mid-room (x -1.624 .. -0.224, z -0.48 .. 0.22), the screen facing +z, Dad
// on its front side. Drawer pedestal on the right, two legs on the left (kneehole open toward -x). A modesty panel
// closes the back (the side toward the empty space).
export const DESK = { x0: gx(0.0), x1: gx(1.4), z0: gz(-2.08), z1: gz(-1.38), top: 0.74, t: 0.03, pedestalX0: gx(0.98), leg: 0.05, modesty: { y0: 0.3 } };

// the computer: horizontal desktop case, 14 in CRT on top, keyboard in front. Centred on Dad.
export const PC = { x: gx(0.6),
  case: { w: 0.42, h: 0.15, d: 0.40, zBack: gz(-2.03) },
  monitor: { w: 0.36, h: 0.33, d: 0.40, foot: 0.03 },
  screen: { w: 0.27, h: 0.20 },
  keyboard: { w: 0.46, h: 0.03, d: 0.17, z: gz(-1.49), tilt: 6 },   // tilt: deg about x, the front (Dad's side) edge down
  printer: { x: gx(1.18), z: gz(-1.78), w: 0.38, h: 0.12, d: 0.3 },   // dot-matrix, fanfold paper feeding up from behind
};
// (hold pass 2026-11-26) the tipped keyboard rests on its lowest edge: centre height KB_Y; KB_TOP(dx, dz) = a point on
// its top face (dx along x from its centre, dz toward Dad), KB_UP = the top face's normal (for fingertip taps, grasp tipOn)
const KBT = PC.keyboard.tilt * Math.PI / 180;
export const KB_Y = DESK.top + PC.keyboard.h / 2 * Math.cos(KBT) + PC.keyboard.d / 2 * Math.sin(KBT);
export const KB_UP = [0, Math.cos(KBT), Math.sin(KBT)];
export const KB_TOP = (dx, dz) => [PC.x + dx, KB_Y + PC.keyboard.h / 2 * Math.cos(KBT) - dz * Math.sin(KBT), PC.keyboard.z + PC.keyboard.h / 2 * Math.sin(KBT) + dz * Math.cos(KBT)];
// 5.25 in floppy disks (r4): a flat stack of n in paper sleeves on the desk's left, the top disk out of its sleeve
export const FLOPPY = { x: gx(0.17), z: gz(-1.83), yaw: -12, n: 11, sleeve: 0.14, sleeveT: 0.0018, jacket: 0.133, jacketT: 0.0013 };
const scrY = DESK.top + PC.case.h + PC.monitor.foot + PC.monitor.h / 2;
const scrZ = PC.case.zBack + PC.monitor.d + 0.002;
// the glass: centre, size, outward normal. Corner order TL, TR, BR, BL as read by someone facing the screen.
export const SCREEN = { c: [PC.x, scrY, scrZ], w: PC.screen.w, h: PC.screen.h, n: [0, 0, 1] };
export const screenPoint = (u, v, lift = 0) => [SCREEN.c[0] + (u - 0.5) * SCREEN.w, SCREEN.c[1] + (0.5 - v) * SCREEN.h, SCREEN.c[2] + lift];   // u right, v down, as read
export const screenCorners = () => [screenPoint(0, 0), screenPoint(1, 0), screenPoint(1, 1), screenPoint(0, 1)];
// THE SCREEN (r4, 2026-11-26, Jade: "make something of a code block, it would have been dark blue text on grey, and he
// was renaming a variable. it was DOS era"): one canonical 80 x 25 DOS text screen (build.js dosScreen(), drawn in code),
// dark blue text on light grey, the same in every shot that sees the glass. The program is C (ASSUMED, flag: Turbo C era,
// could as well be BASIC): Dad has renamed `total` to `sum`; one `total` is left, on row 10: THE WORD she points at.
// The text area fills the glass less a black overscan border; cell (col, row) centre in glass u, v (0..1, as read):
export const DOS = { cols: 80, rows: 25, u0: 0.035, u1: 0.965, v0: 0.04, v1: 0.96, wordRow: 10, wordCol: 18, word: 'total', was: 'total', now: 'sum' };
export const dosCell = (col, row) => [DOS.u0 + (col + 0.5) * (DOS.u1 - DOS.u0) / DOS.cols, DOS.v0 + (row + 0.5) * (DOS.v1 - DOS.v0) / DOS.rows];
export const TEXT = { lines: DOS.rows, top: DOS.v0, pitch: (DOS.v1 - DOS.v0) / DOS.rows, left: DOS.u0 };
// WORD: u0..u1 = the word's extent, v = its baseline (the gold underline sits on it); the word's body is one pitch above v
export const WORD = { u0: dosCell(DOS.wordCol, 0)[0] - 0.5 * (DOS.u1 - DOS.u0) / DOS.cols, u1: dosCell(DOS.wordCol + DOS.word.length - 1, 0)[0] + 0.5 * (DOS.u1 - DOS.u0) / DOS.cols,
  v: DOS.v0 + (DOS.wordRow + 1) * TEXT.pitch };
export const WORD_P = screenPoint((WORD.u0 + WORD.u1) / 2, dosCell(0, DOS.wordRow)[1]);   // centre of the word on the glass
// where her index fingertip touches the glass (r4): just under the word's letters, centred on it, so the word stays
// readable above the finger and the gold underline (on WORD.v) runs under the fingertip. Her head looks HERE.
export const WORD_TIP = screenPoint((WORD.u0 + WORD.u1) / 2, WORD.v + 0.35 * TEXT.pitch, 0.006);   // 6 mm off the glass = the fingertip's centre (pad on the glass)

// the swivel chair (r4, 2026-11-26, Jade on B1: "both feet should have their weight on the wheely part of the chair. please
// look up detailed models of actual chairs"): a plain c. 1990 secretarial / task chair, modelled from current and
// period references (see NOTES.md, r4): 26 in (66 cm) five-star base in black glass-filled nylon, each leg a tapered
// rounded beam rising to the hub, a 50 mm hooded twin-wheel caster under each leg tip, a black telescoping shroud over
// the gas cylinder, a steel tilt plate under the seat with a tension knob and a height lever, a fabric seat with a
// waterfall front, a separate fabric backrest on a steel back bar (J-bar), no arms. Colours ASSUMED (flag): black base
// and casters, charcoal blue-grey tweed upholstery.
// Spoke angles are WORLD angles in the floor plane, from +x toward +z; the base does not turn with the seat. Spokes 0
// and 1 (144 and 216 deg) are the two on Dad's left (back-left, front-left): her feet.
export const CHAIR = { at: gp([0.6, -1.12]), seatYaw: 180, spoke0: 144,
  spokeR: 0.33,                                 // hub centre -> caster stem (26 in base: 0.33 m)
  hub: { r: 0.036, y0: 0.06, y1: 0.135 },
  leg: { r0: 0.03, r1: 0.335, w0: 0.066, w1: 0.048, top0: 0.122, top1: 0.088, bot0: 0.07, bot1: 0.066 },   // tapered beam: width / top / bottom at the hub end (r0) and at the tip (r1)
  caster: { wheel: 0.025, w: 0.011, gap: 0.016, trail: 0.022, stemY: 0.066 },   // 50 mm twin wheels, 2.2 cm trail
  spokeTop: 0.10, spokeW: 0.05, caster0: 0.028,  // (legacy names, sidecar only)
  seatTop: 0.45, seat: { w: 0.46, d: 0.44, t: 0.075 }, back: { w: 0.4, y0: 0.62, y1: 0.9, t: 0.06, z: -0.255 },
  look: { base: { grey: 0.2, col: 0x1d1d20 }, caster: { grey: 0.16, col: 0x141416 }, chrome: { grey: 0.72, col: 0xb9bdc2 }, steel: { grey: 0.26, col: 0x2b2b2e },
    fabric: { grey: 0.4, col: 0x4e5664 }, shell: { grey: 0.18, col: 0x1a1a1c } } };
export const spokeAngle = (k, spoke0 = CHAIR.spoke0) => spoke0 + 72 * k;
// top of a leg at radius r from the hub centre (the legs rise toward the hub)
export const legTop = (r) => { const L = CHAIR.leg, t = Math.min(1, Math.max(0, (r - L.r0) / (L.r1 - L.r0))); return L.top0 + (L.top1 - L.top0) * t; };
export const legWidth = (r) => { const L = CHAIR.leg, t = Math.min(1, Math.max(0, (r - L.r0) / (L.r1 - L.r0))); return L.w0 + (L.w1 - L.w0) * t; };
export const spokePoint = (k, r = CHAIR.spokeR, at = CHAIR.at, spoke0 = CHAIR.spoke0) => { const a = spokeAngle(k, spoke0) * Math.PI / 180; return [at[0] + r * Math.cos(a), legTop(r), at[1] + r * Math.sin(a)]; };
// where her socked feet put their weight (r4): the middle of each sole (between the heel and the ball) square on the top
// of a leg, 0.21 m out from the hub, spoke 1 (front-left) and spoke 0 (back-left)
export const FEET = { r: 0.21, front: spokePoint(1, 0.21), back: spokePoint(0, 0.21) };

// Jade's diagram draws nothing else: the steel shelf, the boxes, the water heater and the modern washer are gone
// (2026-11-26; flagged). "oldfashioned washer (50's tech), no dryer": ASSUMED a 1950s round-tub wringer washer on legs
// (white enamel tub, agitator, a power wringer with two rollers on a post at the tub's back; alternative: a 1950s
// enamel top-loader box). "2 watermelons, 20+ lbs": two whole oblong melons on the floor, front-right, long axis along z.
export const PROPS = {
  washer: { x: 0.52, z: -0.62, r: 0.3, tubY0: 0.36, tubY1: 0.92, leg: 0.03, wringer: { y: 1.17, len: 0.42, r: 0.035 } },
  melons: [{ x: 0.66, z: 0.86, len: 0.43, d: 0.25, yaw: 8 }, { x: 0.74, z: 1.33, len: 0.41, d: 0.24, yaw: -14 }],
};

// ---------------------------------------------------------------- THE BEAM
// An area source: the lit phosphor rectangle. It radiates into the half-space in front of the glass (+z); the useful
// volume is a frustum from the screen rectangle that spreads by halfAngle and has faded out by `range`.
// The desk top cuts it: nothing under the desk and nothing on the floor close to the desk is lit (see deskTerminator).
// r4: the screen is light grey with dark blue text, so the glow is a cool CRT white (9300 K phosphor), not saturated blue
export const BEAM = { name: 'CRT screen glow', color: 0x9db4f0, source: SCREEN, axis: [0, -0.08, 1], halfAngleDeg: 62, range: 2.6,
  falloff: 'inverse-square from an area source: full on faces 0.4-0.6 m away, about 1/10 at 1.5 m' };
// far rectangle of the lit frustum (TL, TR, BR, BL as seen from the screen looking out)
export function beamFar() { const t = Math.tan(BEAM.halfAngleDeg * Math.PI / 180) * BEAM.range, [cx, cy, cz] = SCREEN.c, hw = SCREEN.w / 2 + t, hh = SCREEN.h / 2 + t, dy = BEAM.axis[1] * BEAM.range, z = cz + BEAM.range;
  return [[cx + hw, cy + hh + dy, z], [cx - hw, cy + hh + dy, z], [cx - hw, cy - hh + dy, z], [cx + hw, cy - hh + dy, z]]; }
// Where the desk's front edge cuts the light on the floor (or on a plane at height y): z beyond `full` sees the whole
// screen; between `umbra` and `full` only part of it (penumbra); nearer than `umbra` none of it.
export function deskTerminator(y = 0) { const ez = DESK.z1, ey = DESK.top, top = SCREEN.c[1] + SCREEN.h / 2, bot = SCREEN.c[1] - SCREEN.h / 2, sz = SCREEN.c[2];
  const hit = (sy) => ez + (ey - y) * (ez - sz) / (sy - ey);
  return { umbra: +hit(top).toFixed(3), full: +hit(bot).toFixed(3) }; }

// bulb centre: under the joist (bottom at h - joist depth), below its junction box and lampholder
export const BULB_P = [ROOM.bulb.x, ROOM.h - ROOM.joist.d - ROOM.bulb.box - ROOM.bulb.holder - ROOM.bulb.r, ROOM.bulb.z];
export const LIGHTS = {
  screen: { kind: 'CRT screen (blue, area source); the BEAM (the light that matters)', pos: [SCREEN.c[0], SCREEN.c[1], SCREEN.c[2] + 0.02], aim: [SCREEN.c[0], SCREEN.c[1] - 0.2, SCREEN.c[2] + 2.5], color: BEAM.color },
  ceiling: { kind: 'bare incandescent bulb in a porcelain pull-chain lampholder under a joist (Jade, 2026-11-26), warm, ON: the room ambient', pos: BULB_P, color: 0xffd9a0 },
  dark: { kind: 'ambient: warm bounce off the block walls and joists from the ceiling bulb', color: 0x6a5a48 },
};

// recurring figure geometry: Jade standing on the two spokes at Dad's left. r4: each foot's weight point (0.3 of the
// foot length ahead of the ankle, between the heel and the ball) sits square on the top of its leg at FEET; the sole is
// 3 mm (the sock) above that top. Her feet point the way she faces (yaw, deg), so each foot crosses its leg.
export function jadeOnSpokes(yaw = 166) { const g = legOf('jade7'), FL = 0.155 * g.H, a = yaw * Math.PI / 180, fd = [Math.sin(a), 0, Math.cos(a)];
  const ankleAt = (c) => [c[0] - fd[0] * 0.3 * FL, c[1] + g.ankleH + 0.003, c[2] - fd[2] * 0.3 * FL];
  const front = ankleAt(FEET.front), back = ankleAt(FEET.back);
  const pelvis = [(front[0] + back[0]) / 2 - 0.02, 0, (front[2] + back[2]) / 2 + 0.02];
  const span = Math.hypot(front[0] - back[0], front[2] - back[2]) / 2;
  const drop = Math.sqrt(Math.max(g.reach * g.reach * 0.97 - span * span - 0.02 * 0.02, 0.01));
  pelvis[1] = Math.max(front[1], back[1]) + drop;
  return { pelvis, ankles: { front, back }, FL, g }; }
