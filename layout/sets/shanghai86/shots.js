// SHANGHAI 1986 camera table. Verse 1 (0:29.7-0:58.6) and the first four bars of the piano break (0:58.6-1:08.3).
// Times are -2sm master seconds (analysis/m2sm/song_map.md; retimed from v2 2026-11-25, cuts on the -2sm sung onsets); `t` = [start, end] of the clip this camera serves.
// The plan's two camera positions:  OUTSIDE = frontal, level, locked off on her face.  INSIDE = along her eye-line, close
// (her head is hidden in those guides: the camera sits where her eyes are).
// Fields: id, lens (mm, 36 mm frame), pos | orbit, target | aim: [point, u, v], state ('A' the uncle explains | 'B' a week
// later, the drift; default B), tissue (which generation the gold dots count: 1, 2, 4, 8 pieces of one sheet), figs,
// hideParts, edgeNT (line-mode crease threshold, default 0.25), header, intent, move.
// Geometry (layout.js, Jade's corrections (2), (3)): x = building east, z = out of the windows (SSE). One long room
// (~9.5 m); couch group at the west end, couch on the WEST wall, its L armchair ~0.7 m from the bookshelves; hall doors
// in the NORTH wall, a 4.0 m opening centred on it (Mother, decision page). Round 2 answers: the whole south wall is glazed
// French doors onto the continuous balcony; the room is 10.5 m. Winter-morning sun (21 Dec 1986, 08:30, honest: moved
// from Jade's 09:30 so her face is lit) from the SE (34.6 deg east of the facade normal), 17 deg high, slants in
// north-west across the couch group: her face and hands, the table, the steam and the uncle's hands are lit.
import { PLACES, DOOR, TABLE } from './layout.js';

const deg = (r) => r * 180 / Math.PI;
const yawTo = (from, to) => deg(Math.atan2(to[0] - from[0], to[1] - from[1]));   // yaw 0 faces +z (the windows), 90 faces +x
const [JX, JZ] = PLACES.jadeSit, JY = PLACES.jadeYaw * Math.PI / 180, FWD = [Math.sin(JY), Math.cos(JY)], LEFT = [Math.cos(JY), -Math.sin(JY)];
const H = PLACES.uncleHands, F = PLACES.focus;
// ---------------------------------------------------------------- poses
// state A: the uncle on the front edge of the couch's north seat, west of her; his left hand cupped palm-up in the light with
// the small thing in it, his right thumb and index pinching it from above (two hands that read apart from above)
const UYAW = yawTo(PLACES.uncleSeat, [H[0], H[2]]), UF = [Math.sin(UYAW * Math.PI / 180), Math.cos(UYAW * Math.PI / 180)];
const BALL = [H[0], H[1] + 0.024, H[2]];
// r3 (Jade: "watch face should be visible"; the face sits on the back of the wrist, opposite the palm): the hands are
// swapped so the WATCH hand is the one palm-DOWN: his RIGHT hand cups palm-up, his LEFT (wristwatch) pinches from above,
// so its back of the wrist and the watch face turn up toward her
const uncleShape = (o = {}) => ({ at: PLACES.uncleSeat, legs: 'seat', legOpts: { seatH: 0.42 }, yaw: UYAW, spine: { bend: 30 }, head: { look: BALL },
  R: { to: H, hand: { shape: 'cup', spread: 10, curl: { index: [20, 22, 10], middle: [24, 26, 12], ring: [28, 30, 14], little: [32, 34, 16] } }, palm: 'up', fingers: [UF[0], 0.05, UF[1]] },
  L: { tip: { finger: 'index', at: [BALL[0], BALL[1] + 0.013, BALL[2]] }, hand: { shape: 'pinch', spread: 14, curl: { middle: [40, 50, 25], ring: [55, 65, 32], little: [70, 80, 40] } }, palm: 'down', fingers: [UF[0], -0.35, UF[1]] }, ...o });
// she sits CROSS-LEGGED at her spot (round 2 answers: cross-legged in BOTH scenes), watching his hands across the table
// corner; his hands are held low (8 cm over the table top) so she looks a little down into them
const jadeWatch = (o = {}) => ({ at: PLACES.jadeStand, legs: 'cross', yaw: yawTo(PLACES.jadeStand, [H[0], H[2]]), spine: { bend: 8 }, head: { look: BALL }, L: 'lap', R: 'lap', ...o });
// state B: she sits CROSS-LEGGED (Jade, decision page) facing the table and the windows (south), working on the table's
// north-west corner
const C = [JX + FWD[0] * 0.36, JZ + FWD[1] * 0.36];   // in front of her, over the table's north edge
const HOLD_Y = 0.45;   // cross-legged her eyes are ~0.52 m up, only 10 cm over the table top: the sheet is held low and nearly flat so her face shows
const hold = (dz) => ({ L: { to: [C[0] + LEFT[0] * dz, HOLD_Y, C[1] + LEFT[1] * dz], hand: 'pinch', palm: 'in', fingers: 'fwd' }, R: { to: [C[0] - LEFT[0] * dz, HOLD_Y, C[1] - LEFT[1] * dz], hand: 'pinch', palm: 'in', fingers: 'fwd' } });
const lay = { L: { to: [F[0] + 0.1, 0.445, F[2] - 0.06], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [F[0] - 0.05, 0.46, F[2] - 0.09], hand: 'pinch', palm: 'down', fingers: 'fwd' } };
const jadeSit = (n = 8, o = {}) => ({ at: PLACES.jadeSit, legs: 'cross', yaw: PLACES.jadeYaw, spine: { bend: n <= 2 ? 14 : 30 }, head: { look: n <= 2 ? [C[0], 0.5, C[1] + 0.06] : 'focus' }, ...(n === 1 ? hold(0.1) : n === 2 ? hold(0.15) : lay), ...o });
// ---------------------------------------------------------------- r3: tiny pieces (Jade's r2 review)
// She tears ONE TINY piece in half again and again (tiny ~1-3 cm, the tiniest ~5 mm), thumbs on top, index fingers under,
// the two pinches side by side a finger's width apart. One piece, followed through the shots (build.js paperProps):
//   P0 = generation 6 of a sheet (~2 x 3 cm). V1c / V1d_1: P0 mid-rip. V1d_2: its halves (gen 7, ~1.5 x 2 cm): the right
//   hand puts its half down on the table (PD), the left still holds its half up. V1d_4: that kept half ripped again
//   (gen 8, ~1 cm), the put-down half lying at PD. V1d_8: a gen-10 bit (~5 x 7 mm) between her fingertips, as small as
//   she can go. V1h: a little heap of the tiniest bits on the clear patch, the big stack nearby.
const P0 = { gen: 6, seed: 606 };
const PD = [F[0] - 0.07, F[2] + 0.02];   // where her right hand puts its half down (inside the table's north-west corner)
const pinchArm = (at, side, o = {}) => ({ tip: { finger: 'index', at }, hand: { shape: 'pinch', spread: 4, curl: { middle: [30, 40, 20], ring: [40, 50, 25], little: [50, 60, 30] } }, palm: 'in', fingers: [FWD[0], -0.25, FWD[1]], ...o });
const pinchPair = (d, y, gap) => { const c = [JX + FWD[0] * d, JZ + FWD[1] * d];
  return { L: pinchArm([c[0] + LEFT[0] * gap / 2, y, c[1] + LEFT[1] * gap / 2], 'L'), R: pinchArm([c[0] - LEFT[0] * gap / 2, y, c[1] - LEFT[1] * gap / 2], 'R') }; };
const RIP_C = [JX + FWD[0] * 0.36, 0.47, JZ + FWD[1] * 0.36];   // the hands' meeting point for the POV rips (just off the table's north edge)
const ripSit = (gap, o = {}) => ({ at: PLACES.jadeSit, legs: 'cross', yaw: PLACES.jadeYaw, spine: { bend: 18 }, head: { look: RIP_C }, ...pinchPair(0.36, 0.47, gap), ...o });
const HEAP = [F[0] + 0.03, F[2] + 0.05];
const AFTER = { laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }], bits: { at: HEAP, r: 0.03, gens: { 9: 4, 10: 10, 11: 22 } } };
const V1H_MID = [HEAP[0], 0.43, HEAP[1] + 0.15];
// the hall doorway (r3, Jade: the relatives were NOT in the room: "it was a surprise to them, they're just poking their
// heads in through the hallway"): they stand in the hall just past the threshold beside Mother, leaning in to look
const DOORWAY_HEADS = [1.55, 1.3, -6.15];
const M = PLACES.mother;
const mother = (o = {}) => ({ at: M, legs: 'stand', yaw: yawTo(M, PLACES.jadeSit), spine: { bend: 3 }, head: { look: 'jade3:head' },
  R: { to: [DOOR.x0 + 0.02, 1.12, DOOR.z - 0.04], hand: 'relax', palm: [-1, 0, 0], fingers: 'up' }, L: 'side', ...o });   // a hand on the west jamb
// r3: all three in the hall, poking their heads in through the doorway (east of Mother), leaning in, laughing
const GM = [1.75, -6.36], AU = [2.3, -6.42], UL = [2.05, -6.8];
const grandma = { at: GM, legs: 'stand', yaw: yawTo(GM, PLACES.jadeSit), spine: { bend: 16, side: -8 }, head: { look: 'jade3:head', nod: -8 }, L: 'side', R: { to: 'self:mouth', off: [-0.05, -0.06, 0.04], hand: 'relax', palm: 'back' } };
const aunt = { at: AU, legs: 'stand', yaw: yawTo(AU, PLACES.jadeSit), spine: { bend: 14, side: 14 }, head: { look: 'jade3:head', nod: -6 }, R: { to: 'self:mouth', off: [-0.07, -0.04, 0.02], hand: 'relax', palm: 'back' }, L: 'side' };
const uncleLaugh = { at: UL, legs: 'stand', yaw: yawTo(UL, PLACES.jadeSit), spine: { bend: 12, side: 8 }, head: { nod: -14, look: 'jade3:head' }, L: 'side', R: 'side' };
const ALONE = (n, o) => ({ jade3: jadeSit(n, o), mama86: mother() });
const CROWD = (n, o) => ({ jade3: jadeSit(n, o), mama86: mother(), aunt, uncle: uncleLaugh, grandma });
const INSIDE = { hideParts: { jade3: ['head'] } };
// the one inside camera over the paper: from her eyes down onto her hands and the clear patch at the table's corner
const TC = [F[0] - 0.02, 0.45, F[2] - 0.03];
const TISSUE_CAM = { lens: 28, orbit: { at: TC, az: yawTo([TC[0], TC[2]], [JX, JZ]), el: 54, dist: 0.46 }, aim: [TC, 0.5, 0.55], ...INSIDE };
const ADULTS = DOORWAY_HEADS;   // r3: where the laughter comes from (the hall doorway)

export const SHOTS = [
  // ---------------------------------------------------------------- reference (not in the cut)
  { id: 'REF_plan', lens: 0, ortho: { w: 13.4 }, pos: [2.25, 9, -2.35], target: [2.25, 0, -2.35], up: [0, 0, -1], near: 6.14, far: 12, tissue: 8, figs: CROWD(8), beamLine: false,
    header: 'PLAN (reference): north up: hall doors + bookshelves top, balcony doors + balcony bottom, couch left (west); yellow = sun', intent: 'Top view of the living room, state B with everyone in it. Not a shot.' },
  { id: 'REF_wide', lens: 20, pos: [6.55, 1.9, -4.95], aim: [[-1.0, 0.5, -2.6], 0.5, 0.62], tissue: 8, figs: CROWD(8),
    header: 'MASTER (reference): the long room from its east (old dining) end: balcony doors all along the left, hall doors + bookshelves right, couch group far end',
    intent: 'The whole joined room: glazed French doors along the whole south wall onto the balcony, the 08:30 sun slanting in from the left across the room in bands (the piers between the bays throw the dark stripes), the child lit at the couch group, Mother in the wide hall doorway in shadow. Not a shot.' },
  { id: 'REF_doors', lens: 24, pos: [2.25, 1.35, -4.6], aim: [[1.3, 1.0, 0.3], 0.5, 0.5], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE (round 2): the south side: glazed French doors all along onto the continuous balcony; latches; white wicker chair outside',
    intent: 'From the hall doorway looking south: four bays of steel French doors (two latched pairs per bay: cremone rod, lever handle, barrel bolts) along the whole wall, the balcony and its parapet beyond, the white wicker chair on the balcony, the 08:30 sun coming in from the left. Not a shot.' },
  { id: 'REF_latch', lens: 28, pos: [1.9, 1.25, -2.0], aim: [[0.75, 0.95, 0.35], 0.5, 0.5], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE (round 2): a door latch close up (cremone bolt with lever handle; barrel bolts on the fixed leaf); the wicker chair beyond the glass',
    intent: 'Close on the meeting stiles of one pair of balcony doors. Not a shot.' },
  { id: 'REF_beam', lens: 22, pos: [1.45, 1.35, -0.25], aim: [[-1.2, 0.5, -3.6], 0.5, 0.6], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE: from the doors, along the light', intent: 'The light from beside the doors: the couch group, the table and the child in it, Mother in the doorway beyond it. Not a shot.' },

  // ---------------------------------------------------------------- verse 1, 0:29.7-0:58.6
  { id: 'V1a', t: [29.74, 31.58], lens: 50, state: 'A', orbit: { at: 'jade3:eyes', az: yawTo(PLACES.jadeStand, [H[0], H[2]]) - 62, el: 4, dist: 1.7 }, aim: ['jade3:eyes', 0.4, 0.42], focus: ['jade3'],
    figs: { jade3: jadeWatch(), uncle: uncleShape() },
    header: '0:29.7 OUTSIDE "Three years old, uncle explains atoms" (header 1. Shanghai, 1986)',
    intent: 'Outside: frontal, level, locked off on her face, lit by the 08:30 sun from the balcony doors behind the camera. She sits cross-legged at the table\'s north-west corner (as she will a week later), eyes on the uncle\'s hands; r3 (Jade: "seated on an armchair"): he sits in an ARMCHAIR pulled up at the table\'s north end, east of her (frame right), leaning in, his hands low in the light between them; his head is out of frame, only his arms and hands come in. The armchair stands north-east of her, so it never comes between her face and the sun.' },
  { id: 'V1b', t: [31.58, 34.52], lens: 40, state: 'A', orbit: { at: 'ball', az: yawTo([BALL[0], BALL[2]], PLACES.jadeStand), el: 22, dist: 0.62 }, aim: ['ball', 0.5, 0.66], edgeNT: 0.12, ...INSIDE,
    figs: { jade3: jadeWatch(), uncle: uncleShape() },
    header: '0:31.6 INSIDE the uncle\'s hands shaping something small; his face is not in frame; his WATCH FACE visible',
    intent: 'Inside: her eye-line onto his two hands in the light: r3: the RIGHT hand cupped palm-up holding something small, the LEFT hand (wristwatch) pinching it from above with thumb and index, palm down, so the back of his left wrist and the round watch face turn up toward her (Jade: "watch face should be visible"). Forearms and knees, no face.' },
  { id: 'V1c', t: [34.52, 37.85], lens: 55, orbit: { at: 'jade3:eyes', az: PLACES.jadeYaw, el: 5, dist: 1.9 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'],
    figs: { jade3: { ...jadeSit(1), spine: { bend: 14 }, head: { look: [JX + FWD[0] * 0.3, 0.44, JZ + FWD[1] * 0.3] }, ...pinchPair(0.3, 0.44, 0.016) }, mama86: mother() },
    paper: { rip: { ...P0, open: 12, tilt: 35 } },
    header: '0:34.5 OUTSIDE "A week later my mother finds me": a TINY piece, mid-rip',
    intent: 'Outside: frontal, level, locked off, across the coffee table from the window side. She sits cross-legged at the table\'s corner in the 08:30 light, holding up a TINY piece of 草纸 (~2 x 3 cm) between the fingertips of both hands, in the middle of ripping it in half again (r3, Jade); the big stack and the torn bits on the table, the stray bit in her hair; the north wall and the hall doors behind her.' },
  { id: 'V1d_1', t: [37.85, 41.43], lens: 35, orbit: { at: RIP_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 50, dist: 0.4 }, aim: [RIP_C, 0.5, 0.62], ...INSIDE,
    figs: { jade3: ripSit(0.016), mama86: mother() }, paper: { rip: { ...P0, open: 5, tilt: 25 } },
    header: '0:37.9 INSIDE "sat in a snow drift of paper": a tiny piece, ripping it (gold dot x1)', intent: 'Inside (POV): her eye-line onto her own hands just off the table\'s north-west corner: a tiny piece (~2 x 3 cm) pinched between both thumbs and index fingers, the tear just starting between them. The table corner, its edges and the big stack beyond.' },
  { id: 'V1d_2', t: [41.43, 43.34], lens: 35, orbit: { at: RIP_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 50, dist: 0.4 }, aim: [RIP_C, 0.5, 0.62], ...INSIDE,
    figs: { jade3: ripSit(0.016, { R: pinchArm([PD[0], TABLE.h + 0.012, PD[1]], 'R', { fingers: [FWD[0], -0.6, FWD[1]] }) }), mama86: mother() },
    paper: { held: { L: { half: [P0.gen, P0.seed, 0], tilt: 25 }, R: { half: [P0.gen, P0.seed, 1], flat: true } } },
    header: '0:41.4 INSIDE "ripped to shreds": the two halves; she puts one down (gold dots x2)', intent: 'Same camera. The tiny piece torn in two (~1.5 x 2 cm each): her left hand still holds its half up, her right hand is setting its half down flat on the table corner.' },
  { id: 'V1d_4', t: [43.34, 45.43], lens: 35, orbit: { at: RIP_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 50, dist: 0.4 }, aim: [RIP_C, 0.5, 0.62], ...INSIDE,
    figs: { jade3: ripSit(0.013), mama86: mother() },
    paper: { rip: { from: [P0.gen, P0.seed, 0], open: 10, tilt: 25 }, laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }] },
    header: '0:43.3 INSIDE "Ever tinier": the kept half ripped in half again (gold dots x4)', intent: 'Same camera. The half she kept (~1.5 x 2 cm) pinched between both hands, ripped in half again (two ~1 cm bits, mid-rip); the other half lies flat where she put it down on the table corner. The table is a plain rectangle: its corner and two edges clear in frame.' },
  { id: 'V1d_8', t: [45.43, 48.14], lens: 50, orbit: { at: RIP_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 46, dist: 0.26 }, aim: [RIP_C, 0.5, 0.55], ...INSIDE,
    figs: { jade3: ripSit(0.009), mama86: mother() },
    paper: { rip: { gen: 11, seed: 1111, open: 14, tilt: 30, edge: 0.0015 }, laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }], bits: { at: [PD[0] + 0.05, PD[1] + 0.02], r: 0.02, gens: { 8: 2, 9: 3, 10: 3 } } },
    move: { kind: 'pan', to: 'V1d_8_end', note: 'POV: hold on her fingertips tearing the ~5 mm bit, then pan up and left across the room to Mother in the hall doorway (V1d_8_end is the end frame).' },
    header: '0:45.4 INSIDE "repeating what uncle said": POV close-up, the tiniest piece (start of the pan)', intent: 'Inside (POV, close): her two fingertip pinches, nearly touching, tearing a bit of 草纸 about 5 x 7 mm in half: as small as humanly possible. Behind, out of focus, the table corner and the put-down half.' },
  { id: 'V1d_8_end', t: [45.43, 48.14], lens: 35, pos: [JX + FWD[0] * 0.05, 0.56, JZ + FWD[1] * 0.1], aim: [[PLACES.mother[0], 1.05, PLACES.mother[1]], 0.5, 0.45], ...INSIDE,
    figs: { jade3: { ...ripSit(0.009), head: { look: [PLACES.mother[0], 1.4, PLACES.mother[1]] }, spine: { bend: 6, twist: 35 } }, mama86: mother() },
    header: '0:47.5 INSIDE the end of the V1d_8 pan: across the room to Mother in the hall doorway', intent: 'Inside (POV, the end of the pan): from her eyes, low (cross-legged on the floor), across the room to Mother standing in the wide hall doorway, a hand on the jamb, out of the sun.' },
  { id: 'V1e', t: [48.14, 50.52], lens: 32, pos: [-0.5, 0.8, -0.25], aim: ['jade3:eyes', 0.3, 0.58], figs: ALONE(8), paper: AFTER,
    header: '0:48.1 "What on earth are you doing?": Mother in the doorway, beyond the reach of the beam',
    intent: 'Low, from the doors, looking into the room: the child frame left in the light, still looking down at the pieces; the light falls on the table and the floor in front of her and stops on the boards; Mother stands in the wide doorway frame right, out of the light. Mother\'s face is drawn.' },
  { id: 'V1f', t: [50.52, 53.93], lens: 40, pos: [JX + FWD[0] * 0.05, 0.56, JZ + FWD[1] * 0.1], aim: [[1.45, 1.2, -6.3], 0.5, 0.42], ...INSIDE,
    figs: CROWD(8, { head: { look: ADULTS }, spine: { bend: 6, twist: 35 } }), paper: AFTER,
    header: '0:50.5 INSIDE "The adults howl with laughter": heads poking in at the hall doorway (one gold ?)',
    intent: 'Inside: from her eyes, low, across the room to the wide hall doorway: r3 (Jade: they were NOT in the room; it was a surprise to them): Mother at the doorway\'s west end, and beside her the grandmother, the aunt and the uncle poking their heads in from the hall, leaning in, laughing; faces left as paper. Out of the sun.' },
  { id: 'V1g', t: [53.93, 55.15], lens: 85, orbit: { at: 'jade3:eyes', az: PLACES.jadeYaw, el: 0, dist: 1.6 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'],
    figs: ALONE(8, { head: { look: [JX + 1.2, 1.15, JZ + 0.7] } }), paper: AFTER,   // r3: a ~70 deg turn toward the doorway (frame right), the eyes do the rest
    header: '0:53.9 OUTSIDE "What\'s so funny?": her face, closer', intent: 'Outside: frontal, level, locked off, closer than V1c and shorter. Her eyes have come up off the paper toward the laughing adults at the hall doorway (behind her, to her left: frame right); nothing else moves in her face.' },
  { id: 'V1h', t: [55.15, 58.55], lens: 28, orbit: { at: V1H_MID, az: yawTo([V1H_MID[0], V1H_MID[2]], [JX, JZ]), el: 50, dist: 0.64 }, aim: [V1H_MID, 0.5, 0.5], ...INSIDE,
    figs: ALONE(8), paper: AFTER,
    header: '0:55.2 INSIDE "Nobody tells me after": the tiniest bits, the big stack beside them',
    intent: 'Inside (POV): back down to the table: on the clear patch, a little heap of the freshly torn bits, each a few millimetres (extra tiny), the put-down half beside them; just beyond, the LARGE stack of uncut sheets (r3, Jade). The descent starts from here.' },

  // ---------------------------------------------------------------- piano break, first four bars, 0:58.6-1:08.3
  { id: 'PB1', t: [58.55, 68.34], lens: 50, tissue: 8, pos: [F[0] - 0.04, 0.84, F[2] - 0.12], target: [F[0], 0.42, F[2]], ...INSIDE, figs: ALONE(8),
    move: { end_pos: [F[0] + 0.01, 0.462, F[2] + 0.01], end_target: [F[0] + 0.012, 0.42, F[2] + 0.012], note: 'four bars straight down into one of the eight pieces: sheet, fibre, lattice, points. Below about 5 cm the set stops and the renderer takes over.' },
    header: '0:58.6 INSIDE piano break, bars 1-4: straight down into the 草纸 (start of the move)',
    intent: 'Inside: top-down over the eight pieces on the table corner from her side (her hands at the bottom edge), then four bars of descent into one piece. The guide shows the start frame.' },
];

for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
