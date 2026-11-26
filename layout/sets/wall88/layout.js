// INSIDE THE WALL, 1988 ("Proof": chorus 1). Single source of truth (metres, y up, floor at y = 0).
// A stud cavity: a narrow void between a boarded partition and the building's outer wall. Dark, except for one crack
// between two boards that lets in a blade of light from the room beyond. A five-year-old STANDS in it, her back to the
// brick (r3, Jade 2026-11-25: standing, back against the side wall, slowly turning to look through the light).
// WL_in (r3): a single file of restaurant workers stands along the brick beside her, backs to the brick, facing the boards.
//   x: -0.16 = the BOARDED PARTITION (the crack is in it; the lit room is beyond it, at -x) ... +0.16 = outer wall
//   r4 (Jade, 2026-11-26: "barely wide enough for a grown person's feet ... almost coffin-like"): 32 cm clear between the
//   board face and the brick (was 46). An adult with back to the brick has heel ~5 cm off it and toes ~1 cm off the boards.
//   z: -0.75 = closed end (behind her) ... +2.65 = the end they came in by (r3: lengthened from 1.45 for the file of workers)
// She stands at z = -0.35, back to the brick, facing the boards (-x), head turned toward +z. The outside camera looks
// toward -z at her face; the inside camera looks toward +z along the file, so for it the crack wall is frame-RIGHT and
// the blade falls from upper right to lower left.
const rad = (d) => (d * Math.PI) / 180;
export const CAVITY = { x0: -0.16, x1: 0.16, z0: -0.75, z1: 2.65, h: 2.0,
  board: { h: 0.14, t: 0.02 },                       // horizontal boards on the partition
  // studs on the partition's cavity side. r4: 45 cm centres past the crack (was 86) so each worker stands in one bay,
  // toes between two studs (a stud's face is 25 cm off the brick: no room for a foot in front of it)
  stud: { w: 0.045, d: 0.07, z: [-0.68, 0.18, 0.63, 1.08, 1.53, 1.98, 2.43] } };
export const SEAT = { at: [0.0, -0.45], yaw: 0 };     // r2: seated knees-up (superseded, kept for reference)
// r3: standing, back flat to the brick (pelvis 8.5 cm off it), facing the boards; TURN = head turned toward her left (+z)
// r4: pelvis 8.5 cm off the brick as before (x follows the narrower cavity). LOOK (r4, Jade picked WL_eye_v1: "she's
// looking in a direction that makes sense"): the head turned toward the outside camera, one plain near-frontal angle,
// and the eyes turned past it to picture RIGHT, down the cavity along the brick toward the file (where Mama stands in
// WL_in). `turn` is now the offset from that look (deg toward her own left; negative = the head takes less of it).
export const STAND = { at: [CAVITY.x1 - 0.085, -0.35], yaw: -90, turn: -20 };
// her look target: Mama, standing next to her in the file (WL_in, first bay), at the height of Mama's hip and hand,
// which is the child's eye height. Named 'toMama' in build.js. Mama is not in the outside shots' figs: a set point.
export const FILE_LOOK = [0.10, 0.98, 0.40];

// ---------------------------------------------------------------- the blade
// The crack: a joint between two boards that has opened to 30 mm over 0.7 m. The light is a bare ceiling bulb in the
// room beyond, 1.2 m back from the partition and high, so the light comes DOWN through the crack at SLOPE degrees and
// crosses the cavity as a thin tilted sheet. SLOPE is the shared rhyme angle (beam.js RHYME.angle).
export const SLOPE = 40;
// r3: she stands, so the crack is higher (CRACK_Y: the sheet crosses her turned head at her near (left) eye, measured
// in the sidecar `blade_on_face`). Length unchanged (0.7 m): the file of workers in WL_in stands beyond the light, in
// the dark ("being out of the beam is safety"; a longer crack was tried and put the sheet over the outside camera).
export const CRACK_Y = 1.206;   // r4: 8 cm lower (the narrower cavity and her new head angle; sidecar blade_on_face)
export const CRACK = { x: CAVITY.x0, y: CRACK_Y, z0: -0.60, z1: 0.10, gap: 0.03 };
export const BULB = [CRACK.x - CAVITY.board.t - 1.2, CRACK.y + (1.2 + CAVITY.board.t) * Math.tan(rad(SLOPE)), 0.2];
// what gets through a 30 mm gap in a 20 mm board at this slope, measured at the board's inner face
const shade = CAVITY.board.t * Math.tan(rad(SLOPE));
const ya = CRACK.y - CRACK.gap / 2, yb = CRACK.y + CRACK.gap / 2 - shade;
export const BEAM = {
  name: 'blade', kind: 'a blade of light through a crack between two boards (bare bulb in the room beyond)',
  src: BULB,
  aperture: [[CRACK.x, yb, CRACK.z0], [CRACK.x, yb, CRACK.z1], [CRACK.x, ya, CRACK.z1], [CRACK.x, ya, CRACK.z0]],
  thickness: yb - ya,
  clip: [{ name: 'outer wall', n: [1, 0, 0], d: CAVITY.x1 }, { name: 'floor', n: [0, -1, 0], d: 0 },
    { name: 'closed end', n: [0, 0, -1], d: -CAVITY.z0 }, { name: 'open end', n: [0, 0, 1], d: CAVITY.z1 }],
};
// height of the sheet's mid-plane at a given x (it is level along z)
export const bladeY = (x) => (ya + yb) / 2 - (x - CRACK.x) * Math.tan(rad(SLOPE));
// a point on the sheet just in front of her face (cameras aim here); the measured miss at her eyes is in the sidecar
export const EYE = [0.03, bladeY(0.03), -0.30];

// ---------------------------------------------------------------- the mote
// One mote in the sheet, ahead of her on her eye-line. It drifts down out of the sheet ("nowhere to go").
export const MOTE = { seed: 1988, count: 120, hero: [-0.06, bladeY(-0.06), 0.15], exit: [-0.05, bladeY(-0.05) - 0.03, 0.22], gone: [-0.04, bladeY(-0.04) - 0.12, 0.3] };

// ---------------------------------------------------------------- the workers (WL_in, r3)
// A single file of restaurant workers (adult strangers, faces unreached), backs to the brick, facing the boards, holding
// their breath. They blink in and out; the last state is the empty cavity (WL_in_empty). Spaced shoulder to shoulder.
// pose: 'pray' (palms together under the chin, head bowed), 'clasp' (hands clasped low at the waist), 'mouth' (a hand
// over own mouth and nose), 'flat' (both palms flat back against the brick). Heights in metres.
// r4 (Jade): "make the closest one her mom, and then next to mom, the praying lady". Mama is the engine's `mama`
// (1988, restaurant apron, 1.60 m); 'shield' = her right palm flat back on the brick toward the closed end (between
// the file and her daughter), head turned to look back toward her daughter. One worker per stud bay (45 cm centres,
// shoulder to shoulder); the r3 fifth worker (w5, a man praying) dropped for the bays.
export const WORKERS = [
  { key: 'mama', z: 0.405, h: 1.60, pose: 'shield', sex: 'f' },
  { key: 'w1', z: 0.855, h: 1.62, pose: 'pray', sex: 'f' },
  { key: 'w2', z: 1.305, h: 1.70, pose: 'mouth', sex: 'm' },
  { key: 'w3', z: 1.755, h: 1.58, pose: 'clasp', sex: 'f' },
  { key: 'w4', z: 2.205, h: 1.70, pose: 'flat', sex: 'm' },
];

export const LIGHTS = {
  blade: { kind: 'bare bulb in the room beyond, through the crack', pos: BULB, color: 0xffe2b0 },
  // nothing else: the cavity has no other light. No header and no gold in this scene.
};
