// KITCHEN 1990 camera table. Section names are from "Proof — Music Video Plan.md", Structure. The OUTRO shots' times
// (K5-K10) are -2sm master times (analysis/m2sm/song_map.md; retimed from v3 2026-11-25): band cuts (the cliff)
// 3:55.0 mid-line 1; "This is how we fit in" 3:59.1-4:02.2; "She turns around" 4:03.6, "I let it go" 4:05.5-4:07.5;
// "And I can think again" 4:08.6-4:12.7; pad swell 4:12.9, coda hit 4:14.3. Labels only: no camera moved for this.
//   2:22.2-2:25.2  "Good catch!" and the question: "...Then the kitchen, parents talking fast over her head. Her tapping
//              stops for one beat. She understood the question."                                   (light: 'night')
//   2:25.2-2:27.6  Interlude (thinned; the whole interlude in -2sm), its first bar: "Dad's answer, the only words she
//              ever writes: it was correct." Then the market (walked away) and the spiral plates to 2:34.5. (light: 'night')
//   3:55.0-4:03.6  Outro 1 and 2: "The thumbs arrive on a child's cheeks and make the smile. Mother's face, drawn with
//              care, is just as still."                                                             (light: 'day')
//   4:03.6-4:08.6  "She turns around, I let it go": "Mother turns. In passing glass her own face at rest. The smile goes."
//   4:08.6-4:12.9  "And I can think again": "Her eyes return to a mote in the window light."
// position: 'outside' = frontal, level, locked off on her face; 'inside' = along her eye-line, close.
// Extra fields: light 'night'|'day', chairs { key: [x, z, yaw] | null }, paper, pencil, mirror, hide [labels], time, position.
// (Until the integration pass the engine mis-built left hands, so directed hands here were RIGHT hands; that limit is gone.)
import { TABLE, SEAT, CHAIRS, OUTRO, PAPER, MOTE, GLASS, reflect, WINDOW } from './layout.js';
import { seatHip } from '../basement90/house.js';
import { graspArms } from '../../engine/grasp.js';

const TY = TABLE.h + 0.025;
// ---------------------------------------------------------------- night: the question
const jadeAtTable = (o = {}) => ({ at: [CHAIRS.jade[0], CHAIRS.jade[1] + 0.06], legs: 'seat', legOpts: { seatH: seatHip('jade7', SEAT), footFwd: 0.16 }, yaw: 0, spine: { bend: 6 }, head: { look: [-0.68, 0.9, 0.5] },
  R: { to: [-0.82, TY, 0.06], hand: 'relax', palm: 'down', fingers: [0.15, 0, 1] }, L: { to: [-0.58, TY, 0.04], hand: 'relax', palm: 'down' }, ...o });
// the parents stand behind her, either side, facing each other across the top of her head
const dadTalk = (o = {}) => ({ at: [-1.28, -0.8], legs: 'stand', yaw: 68, spine: { bend: 3 }, head: { look: 'mama90:eyes' }, R: { to: [-1.0, 1.22, -0.62], hand: 'palmUp', palm: 'up', fingers: [1, 0.1, 0.2] }, L: 'side', ...o });
const mamaTalk = (o = {}) => ({ at: [-0.12, -0.8], legs: 'stand', yaw: -68, spine: { bend: 3 }, head: { look: 'dad:eyes' }, R: { to: [-0.3, 1.12, -0.55], hand: 'relax', palm: 'in', fingers: [-1, 0.3, 0.2] }, L: 'side', ...o });
// (r4, 2026-11-26, Jade: "have mom and dad closer, and dad is whispering into mom's ear") the parents stand close
// together behind her chair: Mama turned a little toward Dad, listening, her eyes down on the child; Dad beside her
// (screen left), bent in, his mouth at her right ear, his right hand (camera side) cupped beside his mouth, his left at the small of her back; her left hand rests on the
// top of the child's chair back.
const dadWhisper = (o = {}) => ({ at: [-0.83, -0.96], legs: 'stand', yaw: 62, spine: { bend: 14, side: 6 }, head: { look: 'mama90:earR' },
  R: { to: 'dad:mouth', off: [0.035, -0.06, 0.06], hand: 'relax', palm: [0.5, 0, -0.6], fingers: [0.2, 1, 0.4] }, L: { to: 'mama90:shoulderC', off: [0, -0.2, -0.12], hand: 'relax', palm: [0.3, 0, 1] }, ...o });   // R = camera side (he faces +x)
const mamaListen = (o = {}) => ({ at: [-0.5, -0.88], legs: 'stand', yaw: -18, spine: { bend: 4 }, head: { look: [-0.72, 0.8, -0.1], tilt: -6 }, R: 'side', L: { to: [-0.51, 0.9, -0.5], hand: 'relax', palm: 'down' }, ...o });   // left hand on the back of the child's chair
const NIGHT = { jade7: jadeAtTable(), dad: dadWhisper(), mama90: mamaListen() };
// she writes: right hand holds the pencil on the paper, left hand steadies the sheet, head down
// (r4) K1: she is doing her homework (Jade): an open workbook, pencil in her right hand on the right-hand page, left hand
// flat on the other page, head down; the parents whisper over her head (NIGHT)
// (hold pass 2026-11-26) the pencil is what her right hand holds: the index tip a little above the page, thumb and index
// pads on either side of the pencil (thumb gap = pencil diameter 7 mm less the 1.2 mm squeeze), middle finger curled
// under it (a child's tripod); build.js lays the pencil through the pinch with its tip resting on the page. The left
// hand rests flat on the page / sheet (grasp 'restOn'), so the paper stays on the table under it. Both hands are checked
// by engine/holdcheck.mjs (arm `grasp` / `object`). PENCIL_FIT (build.js): the pencil's lean (elevation / azimuth, deg)
// and where it crosses the pinch (s along index-thumb, s2 across it, m), fitted with the Rapier check so the fingertips
// and the page carry it without slipping (a pencil only squeezed between two pads slides out in the check).
const PENCIL_FIT = { el: 45, az: 310, s: 0, s2: 0, pads: true };   // hold pass 2 (hold agent): through the pads' middle
const LH7 = 0.107 * 1.22;   // little Jade (7)'s hand length (PROP child7 hand x height)
const PENCIL_GAP = 0.007 - 0.002;   // hold pass 2: the pinch now opens to exactly this gap: 1 mm squeeze a side
const pencilArm = (top) => ({ tip: { finger: 'index', at: [PAPER.c[0] - 0.006, top + 0.024, PAPER.c[2] - 0.012] }, hand: { shape: 'pinch', thumb: { gap: PENCIL_GAP }, curl: { middle: [40, 60, 30], ring: [55, 75, 40], little: [65, 80, 45] } },
  palm: [0.55, -0.8, 0.1], fingers: [1.2, -0.6, 1], grasp: 'pinch', object: 'pencil' });   // the hand on its little-finger side, fingers toward her middle, as a child writes (the wrist in range)
const restL = (at, label, axis, elbowAt) => ({ ...graspArms('restOn', { centre: at, at, up: [0, 1, 0], axis, hand: { shape: 'flat', thumb: { opp: 0, sweep: 20, abd: -10, mcp: 0, ip: 0 } }, label }, { Lh: LH7, side: 'L' }).L,
  palm: [-0.14, -1, 0], ...(elbowAt ? { elbowAt } : {}) });   // rolled a little onto the little-finger side, so the thumb's ball does not press through the sheet
const L_FING = [-0.9, 0, 1], L_ELBOW = [-0.35, 0.9, -0.12];   // her left elbow lifted a little out to the side, so the forearm comes down onto the page, not through the table edge
export const PAGE_TOP = TABLE.h + 0.003, SHEET_TOP = PAPER.c[1] + 0.0006;   // workbook right page / the loose sheet (build.js)
// K1 (hold pass): her left hand holds the near edge of the left page, the heel of the hand and the wrist on the table in
// front of the book (the mannequin's and the rigged mesh's wrist sit lower than the palm, so a palm flat in the middle of
// the page put the wrist 5-9 mm into the book); bend 16 as in K4 (was 14)
const HOMEWORK = { ...NIGHT, jade7: jadeAtTable({ spine: { bend: 16 }, head: { look: 'paper', pitchK: 0.8 }, R: pencilArm(PAGE_TOP), L: restL([PAPER.c[0] + 0.2, PAGE_TOP, PAPER.c[2] - 0.105], 'homework (open workbook)', [-1.4, 0, 1], L_ELBOW) }) };
const WRITE = { jade7: jadeAtTable({ spine: { bend: 16 }, head: { look: 'paper', pitchK: 0.8 }, R: pencilArm(SHEET_TOP), L: restL([PAPER.c[0] + 0.075, SHEET_TOP + 0.003, PAPER.c[2] + 0.04], 'paper: “it was correct”', L_FING, L_ELBOW) }),
  dad: dadTalk({ head: { look: 'paper' }, R: 'side' }), mama90: mamaTalk({ head: { look: 'dad:eyes' }, R: 'side' }) };
// ---------------------------------------------------------------- day: outro
const CH = OUTRO.child, MC = OUTRO.motherChair;
const child = (o = {}) => ({ at: CH, legs: 'stand', yaw: 180, head: { look: 'mama90:eyes' }, L: 'side', R: 'side', ...o });
// Mother sits in the pulled-out chair, knees apart, the child standing between them; thumbs on the child's cheeks
const hipM = seatHip('mama90', SEAT);
const mamaThumbs = (o = {}) => ({ at: [MC[0], MC[1] + 0.04], legs: 'seat', legOpts: { seatH: hipM, ankleL: [0.26, -hipM + 0.05, 0.4], ankleR: [0.26, -hipM + 0.05, 0.4] }, yaw: 0, spine: { bend: 20 }, head: { look: 'jade7:eyes' },
  // (2026-11-25, articulated hands) the hands cup her face: palms against the sides of her face, fingers up toward her
  // ears, each THUMB TIP placed on a cheek beside the mouth corner (engine arm `tip`); the old palm targets put the
  // mitts' thumbs across her chin
  R: { tip: { finger: 'thumb', at: 'jade7:mouth', off: [-0.036, 0.016, 0.0] }, hand: { shape: 'relax', curl: { all: [22, 26, 12] }, thumb: { opp: 0.3, sweep: 38, abd: 26, mcp: 8, ip: 10 } }, palm: [1, 0, 0.25], fingers: [-0.12, 0.95, 0.2] },
  L: { tip: { finger: 'thumb', at: 'jade7:mouth', off: [0.036, 0.016, 0.0] }, hand: { shape: 'relax', curl: { all: [22, 26, 12] }, thumb: { opp: 0.3, sweep: 38, abd: 26, mcp: 8, ip: 10 } }, palm: [-1, 0, 0.25], fingers: [0.12, 0.95, 0.2] }, ...o });   // mirror of R (left hands honour directions since the engine fix)
const THUMBS = { jade7: child(), mama90: mamaThumbs() };
// Mother has turned and is walking to the hall doorway; she passes between the child and the front of the room
const mamaAway = (at, o = {}) => ({ at, legs: 'stand', yaw: 52, spine: { bend: 2 }, head: { look: [1.9, 1.4, 1.6] }, L: 'side', R: 'side', ...o });
const eyeRefl = reflect([CH[0], 1.1, CH[1]]);   // where her own eyes are in the glass

export const SHOTS = [
  // ---------------------------------------------------------------- set reference (not in the cut)
  { id: 'K0_plan', lens: 0, ortho: { w: 5.6 }, pos: [0, 9, 0], target: [0, 0, 0], up: [0, 0, -1], near: 5, far: 12, light: 'day', figs: THUMBS,
    hide: ['ceiling', 'pendant', 'upper cabinets', 'sun shaft'], header: 'PLAN (ceiling off), outro blocking: window wall at top; sun patch outlined; china cabinet glass at right',
    intent: 'Set reference: plan of the kitchen with the outro blocking. Mother in the pulled-out chair, the child in front of her; the cabinet glass 0.85 m to the child’s right; blue outline = sun patch on the floor.' },
  { id: 'K0_wide_night', lens: 22, pos: [1.55, 1.5, 1.9], aim: [[-0.5, 0.95, -0.4], 0.45, 0.55], light: 'night', figs: NIGHT, time: 'reference', position: 'reference',
    header: 'MASTER night: pendant over the table, the only light; parents over her head', intent: 'Set reference, night scene, from the front-right corner.' },
  { id: 'K0_wide_day', lens: 22, pos: [-1.55, 1.5, 1.9], aim: [[0.5, 0.95, -0.2], 0.52, 0.55], light: 'day', figs: THUMBS, time: 'reference', position: 'reference',
    header: 'MASTER day: sun shaft from the window; Mother’s chair, the child, the cabinet glass at right', intent: 'Set reference, outro, from the front-left corner: the window shaft crosses the chair and the child and lands on the floor.' },
  // ---------------------------------------------------------------- 2:22.2-2:25.2 the question (-2sm; "Did she understand..." sung 2:20.9-2:25.5)
  // (r3, Jade's r2 note 2026-11-25) K1 is now a TILT UP from one fixed camera: it starts on her face (K1_question) and
  // rises until the frame is mostly the parents, ending on Mama's face (K1_question_end). The end frame is painted as a
  // science-textbook figure; its caption "Did she understand or just pattern match?" is laid on in code, not painted.
  // The old locked-off frontal wide (lens 28, her eyes at v 0.66) is kept as K1_question_wide for reference.
  { id: 'K1_question', lens: 60, pos: [-0.7, 1.0, 2.0], aim: ['jade7:eyes', 0.5, 0.42], light: 'night', figs: HOMEWORK, homework: true, pencil: 'jade7', pencilFit: PENCIL_FIT, focus: ['jade7'], time: '2:22.2-2:23.7 the question (tilt START)', position: 'outside',
    header: 'the question 2:22.2 OUTSIDE, tilt START: on her face at the table; the parents’ torsos at the edges', intent: 'Start of a slow tilt up from one fixed camera across the table: Jade small in the lamp’s cone, fingers tapping; Dad and Mama standing behind her either side, only their bodies and talking hands in frame, their heads above the top edge.' },
  { id: 'K1_question_end', lens: 60, pos: [-0.7, 1.0, 2.0], aim: ['mama90:eyes', 0.62, 0.36], light: 'night', figs: HOMEWORK, homework: true, pencil: 'jade7', pencilFit: PENCIL_FIT, focus: ['mama90'], time: '2:22.2-2:23.7 the question (tilt END)', position: 'outside',
    header: 'the question 2:23.7 OUTSIDE, tilt END: mostly the parents, ending on Mama; science-textbook figure', intent: 'End of the tilt up (same camera as K1_question): the frame is mostly the two parents talking over her head, settling on Mama’s face; only the top of the child’s head at the bottom edge. Painted as a science-textbook illustration with a caption band (caption laid on in code).' },
  { id: 'K1_question_wide', lens: 28, pos: [-0.7, 1.0, 2.0], aim: ['jade7:eyes', 0.5, 0.66], light: 'night', figs: NIGHT, focus: ['jade7'], time: 'reference (r2 K1 frame)', position: 'reference',
    header: 'r2 K1 frame (superseded by the tilt): frontal on her at the table; parents talk over her head', intent: 'Frontal, level, locked off, across the table: Jade small in the lamp’s cone; Dad and Mama standing behind her either side, talking across the top of her head. Kept for reference only.' },
  { id: 'K2_taps', lens: 40, orbit: { at: [-0.7, TY, 0.05], rel: 'jade7', az: 180, el: 62, dist: 0.62 }, aim: [[-0.7, TY, 0.06], 0.5, 0.5], hideParts: { jade7: ['head'] }, light: 'night', figs: NIGHT, time: '2:23.7-2:24.7 the question', position: 'inside', near: 0.05, far: 4,
    header: 'the question 2:23.7 INSIDE: her fingers tapping on the table; they stop for one beat', intent: 'Her eye-line down onto her own hands on the table top (her head hidden for the POV): the tapping, then one beat of stillness.' },
  { id: 'K3_understood', lens: 50, pos: [-0.7, 1.0, 1.35], aim: ['jade7:eyes', 0.5, 0.42], light: 'night', figs: NIGHT, focus: ['jade7'], time: '2:24.7-2:25.2 the question', position: 'outside',
    header: 'the question 2:24.7 OUTSIDE: close, frontal: she understood the question', intent: 'Same axis as K1, closer: her face, level, locked off; the parents are torsos and hands at the frame edges. Nothing moves except that the hands have stopped.' },
  // ---------------------------------------------------------------- 2:25.2-2:27.6 interlude (thinned), first bar (-2sm)
  { id: 'K4_writes', lens: 45, orbit: { at: PAPER.c, rel: 'jade7', az: 180, el: 66, dist: 0.5 }, aim: [PAPER.c, 0.5, 0.5], hideParts: { jade7: ['head'] }, light: 'night', figs: WRITE, paper: true, pencil: 'jade7', pencilFit: PENCIL_FIT, time: '2:25.2-2:27.6 Interlude, thinned (bar 1)', position: 'inside', near: 0.05, far: 4,
    header: 'Interlude 2:25.2 INSIDE: she writes Dad’s answer on paper: it was correct', intent: 'Her eye-line onto the sheet (her head hidden for the POV): right hand with the pencil, left hand steadying the paper. The only words she ever writes. Paper quad in the sidecar (panes.paper) for the lettering.' },
  // ---------------------------------------------------------------- 3:55.0-4:03.6 outro 1 and 2 (-2sm)
  { id: 'K5_thumbs', lens: 35, orbit: { at: 'jade7:eyes', rel: 'jade7', az: 0, el: 0, dist: 0.5 }, aim: ['jade7:eyes', 0.5, 0.4], hideParts: { mama90: ['head'] }, light: 'day', figs: THUMBS, focus: ['jade7'], time: '3:55.0-3:59.1 Outro 1 (-2sm)', position: 'outside', near: 0.05, far: 5,
    header: 'Outro 3:55.0 OUTSIDE: adult thumbs arrive on the child’s cheeks and make the smile', intent: 'Frontal, level, locked off on the child’s face from where Mother’s face is (Mother’s head hidden): two adult hands come in from the bottom corners, thumbs on the cheeks, and push them into a smile.' },
  { id: 'K6_mother', lens: 40, orbit: { at: 'mama90:eyes', rel: 'mama90', az: 0, el: 0, dist: 0.46 }, aim: ['mama90:eyes', 0.5, 0.4], hideParts: { jade7: ['head'] }, light: 'day', figs: THUMBS, focus: ['mama90'], time: '3:59.1-4:03.6 Outro 2 (-2sm)', position: 'inside', near: 0.05, far: 5,
    header: 'Outro 3:59.1 INSIDE: Mother’s face, close and just as still; window behind her', intent: 'Along the child’s eye-line (the child’s head hidden): Mother’s face close, drawn with care, as still as the child’s; her arms come toward the lens; the window and its light behind her.' },
  // ---------------------------------------------------------------- 4:03.6-4:08.6 "She turns around, I let it go" (-2sm)
  { id: 'K7_turns', lens: 28, pos: [-1.0, 1.2, 1.25], aim: ['jade7:eyes', 0.42, 0.45], light: 'day', figs: { jade7: child({ head: { look: [MC[0], 1.1, MC[1]] } }), mama90: mamaAway([1.0, 0.85]) }, time: '4:03.6-4:05.5 "She turns around" (-2sm)', position: 'outside (wide)',
    header: '"She turns around" 4:03.6: Mother has turned and walks to the hall; the child stays; glass at right', intent: 'Wide from the table side: the child stands where she was, facing the empty chair in the sun shaft; Mother, back to us, walks toward the hall doorway past the china cabinet. The smile is still on the child’s face for one more beat.' },
  { id: 'K8_glass', lens: 40, pos: [0.2, 1.2, -0.05], aim: [eyeRefl, 0.24, 0.45], mirror: true, light: 'day', time: '4:05.5-4:08.6 "I let it go" (-2sm)', position: 'inside',
    figs: { jade7: child({ yaw: 138, head: { look: eyeRefl } }), mama90: mamaAway([1.0, 0.72]) },
    header: '"I let it go" 4:05.5 INSIDE: in the cabinet glass her own face at rest, as Mother passes', intent: 'Over the child’s shoulder into the china cabinet’s glass (true reflection): frame right, the back of her head; in the glass her own face, at rest; between them in the glass, Mother’s back passing toward the hall. The smile goes.' },
  // ---------------------------------------------------------------- 4:08.6-4:12.9 "And I can think again" (-2sm)
  { id: 'K9_mote_out', lens: 50, pos: [0.5, 1.12, -1.0], aim: ['jade7:eyes', 0.5, 0.42], light: 'day', figs: { jade7: child({ head: { look: 'mote' } }) }, focus: ['jade7'], time: '4:08.6-4:10.7 "And I can think again" (-2sm)', position: 'outside',
    header: '"And I can think again" 4:08.6 OUTSIDE: her face, eyes back on a mote; not sung on screen', intent: 'Frontal, level, locked off from the window side, over the empty chair: her face at rest, eyes tracking one mote in the shaft just in front of her.' },
  { id: 'K10_mote_in', lens: 35, orbit: { at: 'jade7:head', rel: 'jade7', az: 150, el: 10, dist: 0.62 }, aim: [MOTE, 0.4, 0.42], light: 'day', figs: { jade7: child({ head: { look: 'mote' } }) }, time: '4:10.7-4:12.9 "And I can think again" (-2sm)', position: 'inside', near: 0.05, subject: MOTE,
    header: '"And I can think again" 4:10.7 INSIDE: the mote in the window light', intent: 'Along her eye-line, past her ear: the sun shaft slanting down from the window over the sink, one mote in it (anchor marked), the empty chair below. Shallow; drifts as her attention drifts.' },
];

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
