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
// US Letter, canary yellow, a photocopied "How do you feel today?" chart: 5 columns x 5 rows of labelled cartoon faces,
// except row 3 (the fourth), which has only four: the gap is its last cell. Read from little Jade's side (she sits at
// -z facing +z), so reading left-to-right runs toward -x and the top of the page is at +z.
export const HANDOUT = { cx: -0.3, cz: -0.06, w: 0.216, h: 0.279, t: 0.0006, cols: 5, rows: 5, shortRow: 3, shortCount: 4,
  margin: 0.018, title: 0.035, bottom: 0.02, faceR: 0.0115, color: 0xf2df6a };
const HG = HANDOUT;
export const cellPitch = { x: (HG.w - 2 * HG.margin) / HG.cols, z: (HG.h - HG.title - HG.bottom) / HG.rows };
// centre of the face in row r (0 = top), column c (0 = first as she reads)
export const cell = (r, c) => [HG.cx + ((HG.cols - 1) / 2 - c) * cellPitch.x, TOP + HG.t, HG.cz + HG.h / 2 - HG.title - (r + 0.5) * cellPitch.z + 0.005];
export const hasFace = (r, c) => !(r === HG.shortRow && c >= HG.shortCount);
export const GAP = cell(HG.shortRow, HG.shortCount);          // the empty cell
export const ANXIOUS = cell(HG.shortRow, HG.shortCount - 1);  // the nearest face, where the adult's finger lands
export const LABELS = [
  ['HAPPY', 'SAD', 'ANGRY', 'SCARED', 'SURPRISED'], ['PROUD', 'SHY', 'BORED', 'EXCITED', 'LONELY'], ['TIRED', 'SILLY', 'CONFUSED', 'JEALOUS', 'HURT'],
  ['CALM', 'WORRIED', 'GUILTY', 'ANXIOUS', null], ['FRUSTRATED', 'HOPEFUL', 'EMBARRASSED', 'DISAPPOINTED', 'LOVED'],
];

// ---------------------------------------------------------------- seats (floor positions [x, z]) and hand props
export const SEATS = {
  jade: [-0.3, -0.6],            // facing +z (the cameras)
  socialWorker: [0.2, 0.55],     // across the table, diagonally, facing -z: the frontal camera looks past her right shoulder
  mom: [0.42, -0.66],            // beside little Jade (her left), facing +z
  dad: [1.0, -0.06],             // at the table's +x end, facing -x
};
export const CHAIR = { seat: 0.44, hipAdult: 0.52, hipChild: 0.53 };
export const DICT = { at: [0.5, 0.82, -0.36], w: 0.075, h: 0.105, t: 0.024, color: 0xb0201a };   // the little red dictionary, in Mom's hands
export const DAD_PALM = [0.5, TOP + 0.014, 0.03];                                               // Dad's open palm on the table
export const CLIPBOARD = { at: [0.2, 0.2], yaw: 172 };

// ---------------------------------------------------------------- furniture
export const DOOR = { x: -1.8, z: 1.35, w: 0.9, h: 2.03 };                                     // left wall, front corner, closed
export const WINDOW = { x: 1.8, z: 0.0, w: 1.2, sill: 0.9, h: 1.1 };                           // right wall, mini-blinds shut: not a light source
export const CABINET = { x0: 1.34, x1: 1.78, z0: -1.46, z1: -0.82, h: 1.32 };                  // four-drawer filing cabinet, back right corner
export const SHELF = { x0: -1.78, x1: -1.48, z0: -1.3, z1: -0.1, h: 0.9 };                     // low bookshelf of games and books
export const DESK = { cx: 1.42, cz: 1.4, w: 0.7, d: 1.1, h: 0.74 };                            // the social worker's desk
export const CLOCK = { x: 0.95, y: 2.1, r: 0.15 };                                             // on the back wall, frame-right of her
export const POSTER = { x: 0.85, y: 1.45, w: 0.45, h: 0.6 };

export const LIGHTS = { tube: { kind: BEAM.kind, color: TUBE.color }, amb: { kind: 'bounce off the table and carpet', color: 0x7a8088 } };
