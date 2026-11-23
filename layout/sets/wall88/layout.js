// INSIDE THE WALL, 1988 ("Proof": chorus 1). Single source of truth (metres, y up, floor at y = 0).
// A stud cavity: a narrow void between a boarded partition and the building's outer wall. Dark, except for one crack
// between two boards that lets in a blade of light from the room beyond. A five-year-old sits in it, holding still.
//   x: -0.23 = the BOARDED PARTITION (the crack is in it; the lit room is beyond it, at -x) ... +0.23 = outer wall
//   z: -0.75 = closed end (behind her) ... +1.45 = the end she came in by (behind the outside camera)
// She sits at z = -0.45 facing +z. The outside camera looks toward -z at her face; the inside camera looks toward +z
// along her eye-line, so for it the crack wall is frame-RIGHT and the blade falls from upper right to lower left.
const rad = (d) => (d * Math.PI) / 180;
export const CAVITY = { x0: -0.23, x1: 0.23, z0: -0.75, z1: 1.45, h: 2.0,
  board: { h: 0.14, t: 0.02 },                       // horizontal boards on the partition
  stud: { w: 0.045, d: 0.07, z: [-0.68, 0.18, 1.04] } };   // studs on the partition's cavity side
export const SEAT = { at: [0.0, -0.45], yaw: 0 };     // little Jade's pelvis and facing

// ---------------------------------------------------------------- the blade
// The crack: a joint between two boards that has opened to 30 mm over 0.7 m. The light is a bare ceiling bulb in the
// room beyond, 1.2 m back from the partition and high, so the light comes DOWN through the crack at SLOPE degrees and
// crosses the cavity as a thin tilted sheet. SLOPE is the shared rhyme angle (beam.js RHYME.angle).
export const SLOPE = 40;
export const CRACK = { x: CAVITY.x0, y: 0.767, z0: -0.60, z1: 0.10, gap: 0.03 };
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
// the blade is aimed through her RIGHT eye (the one nearer the crack); see NOTES.md for the measured miss
export const EYE = [-0.028, bladeY(-0.028), -0.32];

// ---------------------------------------------------------------- the mote
// One mote in the sheet, ahead of her on her eye-line. It drifts down out of the sheet ("nowhere to go").
export const MOTE = { seed: 1988, count: 120, hero: [-0.028, bladeY(-0.028), 0.12], exit: [-0.02, bladeY(-0.02) - 0.03, 0.2], gone: [0.0, bladeY(0) - 0.12, 0.3] };

export const LIGHTS = {
  blade: { kind: 'bare bulb in the room beyond, through the crack', pos: BULB, color: 0xffe2b0 },
  // nothing else: the cavity has no other light. No header and no gold in this scene.
};
