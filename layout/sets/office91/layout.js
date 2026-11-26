// SCHOOL OFFICE, about 1991 — single source of truth for numbers (metres, y up, floor at y = 0).
// A small windowless-feeling counselling office in a US elementary school: one meeting table, drop ceiling.
//   x: -1.8 = LEFT wall (door, low bookshelf)   ...  +1.8 = RIGHT wall (window with the blinds shut, the desk)
//   z: -1.5 = BACK wall (behind little Jade)     ...  +2.0 = FRONT wall (behind the main cameras)
// The main camera direction looks toward -z, at her face across the table. Frame-left of her is bare wall: that is
// where the toner labels are composited.
export const ROOM = { x0: -1.8, x1: 1.8, z0: -1.5, z1: 2.0, h: 2.6, wallT: 0.15 };

export const TABLE = { cx: 0.0, cz: 0.0, w: 1.4, d: 0.65, h: 0.72 };          // laminate meeting table, long axis along x
const TOP = TABLE.h;

// ---------------------------------------------------------------- THE BEAM
// One working fluorescent tube (4 ft, T12) in a recessed two-lamp troffer whose other lamp is dead, behind a deep
// louvre. The louvre cuts the light off at CUT.across either side of straight down (across the tube) and CUT.along past
// each end, so the lit volume is a wedge: a line at the tube, a rectangle where it lands.
export const TUBE = { cx: -0.3, y: 2.56, cz: -0.08, len: 1.2, r: 0.019, color: 0xeef4ff };
export const CUT = { across: 22, along: 12 };
export const TROFFER = { w: 1.3, d: 0.36, lampGap: 0.14 };                    // housing aperture in the ceiling; the lit lamp is the -z one
const ta = Math.tan(CUT.across * Math.PI / 180), tl = Math.tan(CUT.along * Math.PI / 180);
// the source as a thin rectangle at the tube (TL, TR, BR, BL seen from above with -z at the top: -x,-z / +x,-z / +x,+z / -x,+z)
export const BEAM_SOURCE = [[TUBE.cx - TUBE.len / 2, TUBE.y, TUBE.cz - TUBE.r], [TUBE.cx + TUBE.len / 2, TUBE.y, TUBE.cz - TUBE.r], [TUBE.cx + TUBE.len / 2, TUBE.y, TUBE.cz + TUBE.r], [TUBE.cx - TUBE.len / 2, TUBE.y, TUBE.cz + TUBE.r]];
// footprint of the wedge on the horizontal plane y (default: the table top), same corner order
export const beamFootprint = (y = TOP) => { const hgt = TUBE.y - y, hx = TUBE.len / 2 + hgt * tl, hz = TUBE.r + hgt * ta;
  return [[TUBE.cx - hx, y, TUBE.cz - hz], [TUBE.cx + hx, y, TUBE.cz - hz], [TUBE.cx + hx, y, TUBE.cz + hz], [TUBE.cx - hx, y, TUBE.cz + hz]]; };
export const inBeam = (p) => { const hgt = TUBE.y - p[1]; return hgt > 0 && Math.abs(p[0] - TUBE.cx) <= TUBE.len / 2 + hgt * tl && Math.abs(p[2] - TUBE.cz) <= TUBE.r + hgt * ta; };
export const BEAM = { kind: 'one fluorescent tube behind a louvre, straight down', source: BEAM_SOURCE, dir: [0, -1, 0], cutoff_deg: CUT,
  lands_on: 'the yellow handout on the table', footprint_table: beamFootprint(TOP), footprint_floor: beamFootprint(0) };
// With these numbers the pool at table height is 1.98 m (x -1.29 .. +0.69) by 1.52 m (z -0.84 .. +0.68): the handout,
// her hands and face, the social worker's sweatshirt and forearms, Mom's hands. Dad sits past its +x edge and reaches in.

// ---------------------------------------------------------------- the handout
// US Letter, canary yellow, a photocopied "How do you feel today?" chart: 5 rows of labelled cartoon faces, 7 to a row,
// except row 3 (the fourth), which has only six. Every row is centred on the page, so the short row sits half a cell in
// from the others at both ends. Read from little Jade's side (she sits at -z facing +z), so reading left-to-right runs
// toward -x and the top of the page is at +z.
export const HANDOUT = { cx: -0.3, cz: -0.06, w: 0.216, h: 0.279, t: 0.0006, cols: 7, rows: 5, shortRow: 3, shortCount: 6,
  shortShift: 0.25,   // r3 (Jade): the row of six sits a quarter cell LEFT of centre as she reads (not perfectly centred)
  margin: 0.018, title: 0.035, bottom: 0.02, faceR: 0.0098, labelW: 0.02, color: 0xf2df6a };
const HG = HANDOUT;
export const cellPitch = { x: (HG.w - 2 * HG.margin) / HG.cols, z: (HG.h - HG.title - HG.bottom) / HG.rows };
export const rowCount = (r) => (r === HG.shortRow ? HG.shortCount : HG.cols);
// centre of the face in row r (0 = top), column c (0 = first as she reads); each row is centred on the page
// (the short row is shifted HG.shortShift cells toward the reading-left, which is +x)
export const cell = (r, c) => [HG.cx + ((rowCount(r) - 1) / 2 - c + (r === HG.shortRow ? HG.shortShift : 0)) * cellPitch.x, TOP + HG.t, HG.cz + HG.h / 2 - HG.title - (r + 0.5) * cellPitch.z + 0.005];
export const hasFace = (r, c) => c >= 0 && c < rowCount(r);
// the gap: where a seventh face would follow the short row's last one, at the same spacing (the row sits a quarter cell
// left of centre, so most of the missing width is at this end, the end she reads to)
// r5 (Jade: "the finger should point to the middle of the missing space; right now it's slightly off center"): GAP was
// cell(shortRow, 6), a seventh face at the short row's own spacing, which lies a quarter cell (6.4 mm) past the column of
// last faces above and below it (THANKFUL, MAD). The missing space the eye reads is the hole between ANXIOUS and that
// column's outer edge, and its middle is the column itself: GAP is now the last column's x on the short row's line.
export const GAP_SEQ = cell(HG.shortRow, HG.shortCount);   // the old point (a seventh face at the short row's spacing)
export const GAP = [cell(HG.shortRow - 1, HG.cols - 1)[0], GAP_SEQ[1], GAP_SEQ[2]];
export const ANXIOUS = cell(HG.shortRow, HG.shortCount - 1);  // the short row's last face: the face closest to the gap
// r3 (Jade 2026-11-25, reverses the r2 choice): HER finger points at the EMPTY SPACE where a seventh face would be (the
// tip on the gap's centre, a touch toward her side); the adult's finger then lands on the CLOSEST face to that space
// (ANXIOUS, its far edge) and reads its label.
// r4 (Jade, BO1/BO2: "the center/top of the fingertip should be on the spot where there isn't a dot. pretend there's an
// invisible dot in that space"): JADE_TIP is now the GAP itself, the point her index fingertip's PAD rests on (the
// centre of the invisible seventh face). shots.js places the fingertip with the engine's `tip` placement, the tip's
// centre one pad radius above the page, so the pad touches the page exactly on the gap.
export const JADE_TIP = [GAP[0], GAP[1], GAP[2]];
export const SW_TIP = [ANXIOUS[0], ANXIOUS[1], ANXIOUS[2] + 0.007];
// r3: the row of six carries some of the larger-looking faces (SCARED, EXCITED, UPSET have marks outside the circle;
// they swapped places with CALM, NERVOUS, THANKFUL). Ported by hand to tools/kf/handout.py LABELS.
export const LABELS = [
  ['HAPPY', 'SAD', 'ANGRY', 'CALM', 'SURPRISED', 'SLEEPY', 'GRUMPY'], ['PROUD', 'SHY', 'BORED', 'NERVOUS', 'LONELY', 'BRAVE', 'SORRY'],
  ['TIRED', 'SILLY', 'CONFUSED', 'JEALOUS', 'HURT', 'CURIOUS', 'THANKFUL'], ['SCARED', 'WORRIED', 'EXCITED', 'GUILTY', 'UPSET', 'ANXIOUS'],
  ['FRUSTRATED', 'HOPEFUL', 'EMBARRASSED', 'DISAPPOINTED', 'LOVED', 'SAFE', 'MAD'],
];

// ---------------------------------------------------------------- seats (floor positions [x, z]) and hand props
export const SEATS = {
  jade: [-0.3, -0.6],            // facing +z (the cameras)
  socialWorker: [0.2, 0.55],     // across the table, diagonally, facing -z: the frontal camera looks past her right shoulder
  mom: [0.42, -0.66],            // beside little Jade (her left), facing +z
  dad: [0.76, -1.04],            // r3 (Jade): STANDING behind Mom's chair (to her left), facing +z, his right hand on her left shoulder
};
export const CHAIR = { seat: 0.44, hipAdult: 0.52, hipChild: 0.53 };
export const DICT = { at: [0.5, 0.82, -0.36], w: 0.075, h: 0.105, t: 0.024, tilt: 40, color: 0xb0201a };   // tilt: deg from flat, toward her (hold pass 2026-11-26: 40, was 50: steeper than atan 0.9 it slid off her palms)   // the little red dictionary, in Mom's hands
export const DAD_PALM = [0.5, TOP + 0.014, 0.03];                                               // Dad's open palm on the table
export const CLIPBOARD = { at: [0.2, 0.16], yaw: 172 };   // hold pass 2026-11-26: 4 cm further onto the table (it overhung the near edge by 4 cm, over her forearm)

// ---------------------------------------------------------------- furniture
export const DOOR = { x: -1.8, z: 1.35, w: 0.9, h: 2.03 };                                     // left wall, front corner, closed
export const WINDOW = { x: 1.8, z: 0.0, w: 1.2, sill: 0.9, h: 1.1 };                           // right wall, mini-blinds shut: not a light source
export const CABINET = { x0: 1.34, x1: 1.78, z0: -1.46, z1: -0.82, h: 1.32 };                  // four-drawer filing cabinet, back right corner
export const SHELF = { x0: -1.78, x1: -1.48, z0: -1.3, z1: -0.1, h: 0.9 };                     // low bookshelf of games and books
export const DESK = { cx: 1.42, cz: 1.4, w: 0.7, d: 1.1, h: 0.74 };                            // the social worker's desk
export const CLOCK = { x: 0.95, y: 2.1, r: 0.15 };                                             // on the back wall, frame-right of her
// ---------------------------------------------------------------- the back wall's art (r3, Jade: "decor on the wall behind
// her: an alphabet, turkeys drawn as handprints, other elementary school children's art"). ONE wall, fixed here, seen in
// PC1 = PC4 and PC2. November/December 1991: Thanksgiving handprint turkeys still up. Kept clear: a patch frame-left of her
// face (x < -0.72, y 0.78..1.22) for the toner labels.
export const ALPHA = { x0: -1.66, x1: 1.66, y: 1.47, h: 0.15, n: 26, card: 0xf8f4e8 };
export const BOARD = { x0: -0.2, x1: 0.78, y0: 0.82, y1: 1.36, frame: 0.025 };                  // cork board right of her head (frame-right)
// children's pictures: [cx, cy, w, h, kind, image]; kind = 'turkey' (handprint turkey on construction paper) | 'drawing';
// image = layout/assets/art/office91/<image>.png (2026-11-26: fixed textures, every picture INVENTED, flagged in NOTES).
// The board holds the five pictures the r3 painting PC1_v1 showed (house and sun, a turkey, a rainbow; a stick family,
// pines and a snowman), in its arrangement; it had seven blank ones before.
export const ART = [
  [-1.38, 1.30, 0.21, 0.16, 'turkey', 'turkey_1'], [-1.12, 1.31, 0.21, 0.16, 'turkey', 'turkey_2'], [-0.86, 1.30, 0.21, 0.16, 'turkey', 'turkey_3'],   // a row of three turkeys, upper left
  [-0.06, 1.21, 0.2, 0.24, 'drawing', 'board_house'], [0.27, 1.22, 0.22, 0.17, 'turkey', 'turkey_4'], [0.6, 1.21, 0.2, 0.24, 'drawing', 'board_rainbow'],   // on the board, top row
  [0.1, 0.95, 0.28, 0.19, 'drawing', 'board_family'], [0.5, 0.95, 0.28, 0.19, 'drawing', 'board_snowman'],                                           // on the board, bottom row
  [1.05, 1.15, 0.22, 0.28, 'drawing', 'drawing_2'], [1.05, 0.86, 0.22, 0.17, 'turkey', 'turkey_6'],
];
// the corridor board's eight pictures (a later school year, about 1993-94): image names, in build order
export const HALL_ART = ['corridor_turkey_1', 'corridor_drawing_1', 'corridor_drawing_2', 'corridor_turkey_2', 'corridor_drawing_3', 'corridor_drawing_4', 'corridor_turkey_3', 'corridor_drawing_5'];
export const POSTER = null;   // r3: the poster gave way to the board

export const LIGHTS = { tube: { kind: BEAM.kind, color: TUBE.color }, amb: { kind: 'bounce off the table and carpet', color: 0x7a8088 } };

// ---------------------------------------------------------------- THE CORRIDOR OUTSIDE THE DOOR (r3, a SEPARATE TIME)
// Jade: "you need facial expressions" is said to her at about TEN, "right outside the school counselor's door". This set is
// 1991 with her at seven, so the corridor is staged as a later visit (about 1993-94) at the same door; flagged for Jade.
// The office's left wall (x = -1.8, outer face at -1.95) is the corridor's right-hand wall as you face the door.
export const HALL = { x0: -4.3, x1: -1.95, z0: -2.5, z1: 4.5, h: 2.75, tile: 0.3 };
export const HALL_LIGHT = { x: -3.0, y: 2.72, z: 0.7, w: 0.6, d: 1.2 };          // a ceiling fluorescent panel over her (diffuser, all lamps on)
export const HALL_KID = [-2.17, 0.52];        // little Jade (10): back against the wall beside the door (door's near jamb at z 0.87)
export const HALL_MOM = [-2.45, -0.08];       // Mom: in front of her and to her right, stooping, facing her
export const HALL_BOARD = { z0: -1.9, z1: -0.35, y0: 0.95, y1: 1.75 };          // a corridor bulletin board of class art on the same wall
