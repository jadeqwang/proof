// KITCHEN 1990 camera table. Section names are from "Proof — Music Video Plan.md", Structure. The OUTRO shots' times
// (K5-K10) are from analysis/v3/song_map.md (authoritative; the plan's rows below still carry the v2 times): band cuts
// 4:05.0 mid-line 1; "This is how we fit in" 4:09.05-4:12.25; "She turns around" 4:12.95, "I let it go" 4:15.46-4:17.4;
// "And I can think again" 4:19.3-4:23.4; pad swell 4:23.26, coda hit 4:24.54. Labels only: no camera moved for this.
//   2:21-2:26  "Good catch!" and the question: "...Then the kitchen, parents talking fast over her head. Her tapping
//              stops for one beat. She understood the question."                                   (light: 'night')
//   2:26-2:36  Interlude, thinned: "Dad's answer, the only words she ever writes: it was correct."  (light: 'night')
//   4:05-4:14  Outro 1 and 2: "The thumbs arrive on a child's cheeks and make the smile. Mother's face, drawn with
//              care, is just as still."                                                             (light: 'day')
//   4:14-4:19  "She turns around, I let it go": "Mother turns. In passing glass her own face at rest. The smile goes."
//   4:19-4:24  "And I can think again": "Her eyes return to a mote in the window light."
// position: 'outside' = frontal, level, locked off on her face; 'inside' = along her eye-line, close.
// Extra fields: light 'night'|'day', chairs { key: [x, z, yaw] | null }, paper, pencil, mirror, hide [labels], time, position.
// (Until the integration pass the engine mis-built left hands, so directed hands here were RIGHT hands; that limit is gone.)
import { TABLE, SEAT, CHAIRS, OUTRO, PAPER, MOTE, GLASS, reflect, WINDOW } from './layout.js';
import { seatHip } from '../basement90/house.js';

const TY = TABLE.h + 0.025;
// ---------------------------------------------------------------- night: the question
const jadeAtTable = (o = {}) => ({ at: [CHAIRS.jade[0], CHAIRS.jade[1] + 0.06], legs: 'seat', legOpts: { seatH: seatHip('jade7', SEAT), footFwd: 0.16 }, yaw: 0, spine: { bend: 6 }, head: { look: [-0.68, 0.9, 0.5] },
  R: { to: [-0.82, TY, 0.06], hand: 'relax', palm: 'down', fingers: [0.15, 0, 1] }, L: { to: [-0.58, TY, 0.04], hand: 'relax', palm: 'down' }, ...o });
// the parents stand behind her, either side, facing each other across the top of her head
const dadTalk = (o = {}) => ({ at: [-1.28, -0.8], legs: 'stand', yaw: 68, spine: { bend: 3 }, head: { look: 'mama90:eyes' }, R: { to: [-1.0, 1.22, -0.62], hand: 'palmUp', palm: 'up', fingers: [1, 0.1, 0.2] }, L: 'side', ...o });
const mamaTalk = (o = {}) => ({ at: [-0.12, -0.8], legs: 'stand', yaw: -68, spine: { bend: 3 }, head: { look: 'dad:eyes' }, R: { to: [-0.3, 1.12, -0.55], hand: 'relax', palm: 'in', fingers: [-1, 0.3, 0.2] }, L: 'side', ...o });
const NIGHT = { jade7: jadeAtTable(), dad: dadTalk(), mama90: mamaTalk() };
// she writes: right hand holds the pencil on the paper, left hand steadies the sheet, head down
const WRITE = { jade7: jadeAtTable({ spine: { bend: 16 }, head: { look: 'paper', pitchK: 0.8 }, R: { to: 'paper', off: [-0.035, 0.035, -0.02], hand: 'pinch', palm: 'down', fingers: [0.3, -0.3, 1] }, L: { to: 'paper', off: [0.13, 0.02, 0.0], hand: 'flat', palm: 'down' } }),
  dad: dadTalk({ head: { look: 'paper' }, R: 'side' }), mama90: mamaTalk({ head: { look: 'dad:eyes' }, R: 'side' }) };
// ---------------------------------------------------------------- day: outro
const CH = OUTRO.child, MC = OUTRO.motherChair;
const child = (o = {}) => ({ at: CH, legs: 'stand', yaw: 180, head: { look: 'mama90:eyes' }, L: 'side', R: 'side', ...o });
// Mother sits in the pulled-out chair, knees apart, the child standing between them; thumbs on the child's cheeks
const hipM = seatHip('mama90', SEAT);
const mamaThumbs = (o = {}) => ({ at: [MC[0], MC[1] + 0.04], legs: 'seat', legOpts: { seatH: hipM, ankleL: [0.26, -hipM + 0.05, 0.4], ankleR: [0.26, -hipM + 0.05, 0.4] }, yaw: 0, spine: { bend: 20 }, head: { look: 'jade7:eyes' },
  R: { to: 'jade7:mouth', off: [-0.075, -0.035, -0.035], hand: 'relax', palm: [1, 0, 0.2], fingers: [0.1, 0.55, 0.8], thumb: [0.8, 0.5, 0.2] },
  L: { to: 'jade7:mouth', off: [0.075, -0.035, -0.035], hand: 'relax', palm: [-1, 0, 0.2], fingers: [-0.1, 0.55, 0.8], thumb: [-0.8, 0.5, 0.2] }, ...o });   // mirror of R (left hands honour directions since the engine fix)
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
  // ---------------------------------------------------------------- 2:21-2:26 the question
  { id: 'K1_question', lens: 28, pos: [-0.7, 1.0, 2.0], aim: ['jade7:eyes', 0.5, 0.66], light: 'night', figs: NIGHT, focus: ['jade7'], time: '2:23-2:24.5 the question', position: 'outside',
    header: 'the question 2:23 OUTSIDE: frontal on her at the table; parents talk over her head', intent: 'Frontal, level, locked off, across the table: Jade small in the lamp’s cone, fingers tapping; Dad and Mama standing behind her either side, talking to each other across the top of her head, their faces above the shade’s cut-off (out of the light).' },
  { id: 'K2_taps', lens: 40, orbit: { at: [-0.7, TY, 0.05], rel: 'jade7', az: 180, el: 62, dist: 0.62 }, aim: [[-0.7, TY, 0.06], 0.5, 0.5], hideParts: { jade7: ['head'] }, light: 'night', figs: NIGHT, time: '2:24.5-2:25.5 the question', position: 'inside', near: 0.05, far: 4,
    header: 'the question 2:24.5 INSIDE: her fingers tapping on the table; they stop for one beat', intent: 'Her eye-line down onto her own hands on the table top (her head hidden for the POV): the tapping, then one beat of stillness.' },
  { id: 'K3_understood', lens: 50, pos: [-0.7, 1.0, 1.35], aim: ['jade7:eyes', 0.5, 0.42], light: 'night', figs: NIGHT, focus: ['jade7'], time: '2:25.5-2:26 the question', position: 'outside',
    header: 'the question 2:25.5 OUTSIDE: close, frontal: she understood the question', intent: 'Same axis as K1, closer: her face, level, locked off; the parents are torsos and hands at the frame edges. Nothing moves except that the hands have stopped.' },
  // ---------------------------------------------------------------- 2:26-2:36 interlude, thinned
  { id: 'K4_writes', lens: 45, orbit: { at: PAPER.c, rel: 'jade7', az: 180, el: 66, dist: 0.5 }, aim: [PAPER.c, 0.5, 0.5], hideParts: { jade7: ['head'] }, light: 'night', figs: WRITE, paper: true, pencil: 'jade7', time: '2:26-2:30 Interlude, thinned', position: 'inside', near: 0.05, far: 4,
    header: 'Interlude 2:26 INSIDE: she writes Dad’s answer on paper: it was correct', intent: 'Her eye-line onto the sheet (her head hidden for the POV): right hand with the pencil, left hand steadying the paper. The only words she ever writes. Paper quad in the sidecar (panes.paper) for the lettering.' },
  // ---------------------------------------------------------------- 4:05.0-4:13.0 outro 1 and 2 (v3)
  { id: 'K5_thumbs', lens: 35, orbit: { at: 'jade7:eyes', rel: 'jade7', az: 0, el: 0, dist: 0.5 }, aim: ['jade7:eyes', 0.5, 0.4], hideParts: { mama90: ['head'] }, light: 'day', figs: THUMBS, focus: ['jade7'], time: '4:05.0-4:09.0 Outro 1 (v3)', position: 'outside', near: 0.05, far: 5,
    header: 'Outro 4:05.0 OUTSIDE: adult thumbs arrive on the child’s cheeks and make the smile', intent: 'Frontal, level, locked off on the child’s face from where Mother’s face is (Mother’s head hidden): two adult hands come in from the bottom corners, thumbs on the cheeks, and push them into a smile.' },
  { id: 'K6_mother', lens: 40, orbit: { at: 'mama90:eyes', rel: 'mama90', az: 0, el: 0, dist: 0.46 }, aim: ['mama90:eyes', 0.5, 0.4], hideParts: { jade7: ['head'] }, light: 'day', figs: THUMBS, focus: ['mama90'], time: '4:09.0-4:13.0 Outro 2 (v3)', position: 'inside', near: 0.05, far: 5,
    header: 'Outro 4:09.0 INSIDE: Mother’s face, close and just as still; window behind her', intent: 'Along the child’s eye-line (the child’s head hidden): Mother’s face close, drawn with care, as still as the child’s; her arms come toward the lens; the window and its light behind her.' },
  // ---------------------------------------------------------------- 4:13.0-4:19.3 "She turns around, I let it go" (v3)
  { id: 'K7_turns', lens: 28, pos: [-1.0, 1.2, 1.25], aim: ['jade7:eyes', 0.42, 0.45], light: 'day', figs: { jade7: child({ head: { look: [MC[0], 1.1, MC[1]] } }), mama90: mamaAway([1.0, 0.85]) }, time: '4:13.0-4:15.5 "She turns around" (v3)', position: 'outside (wide)',
    header: '"She turns around" 4:13.0: Mother has turned and walks to the hall; the child stays; glass at right', intent: 'Wide from the table side: the child stands where she was, facing the empty chair in the sun shaft; Mother, back to us, walks toward the hall doorway past the china cabinet. The smile is still on the child’s face for one more beat.' },
  { id: 'K8_glass', lens: 40, pos: [0.2, 1.2, -0.05], aim: [eyeRefl, 0.24, 0.45], mirror: true, light: 'day', time: '4:15.5-4:19.3 "I let it go" (v3)', position: 'inside',
    figs: { jade7: child({ yaw: 138, head: { look: eyeRefl } }), mama90: mamaAway([1.0, 0.72]) },
    header: '"I let it go" 4:15.5 INSIDE: in the cabinet glass her own face at rest, as Mother passes', intent: 'Over the child’s shoulder into the china cabinet’s glass (true reflection): frame right, the back of her head; in the glass her own face, at rest; between them in the glass, Mother’s back passing toward the hall. The smile goes.' },
  // ---------------------------------------------------------------- 4:19.3-4:23.3 "And I can think again" (v3)
  { id: 'K9_mote_out', lens: 50, pos: [0.5, 1.12, -1.0], aim: ['jade7:eyes', 0.5, 0.42], light: 'day', figs: { jade7: child({ head: { look: 'mote' } }) }, focus: ['jade7'], time: '4:19.3-4:21.3 "And I can think again" (v3)', position: 'outside',
    header: '"And I can think again" 4:19.3 OUTSIDE: her face, eyes back on a mote; not sung on screen', intent: 'Frontal, level, locked off from the window side, over the empty chair: her face at rest, eyes tracking one mote in the shaft just in front of her.' },
  { id: 'K10_mote_in', lens: 35, orbit: { at: 'jade7:head', rel: 'jade7', az: 150, el: 10, dist: 0.62 }, aim: [MOTE, 0.4, 0.42], light: 'day', figs: { jade7: child({ head: { look: 'mote' } }) }, time: '4:21.3-4:23.3 "And I can think again" (v3)', position: 'inside', near: 0.05, subject: MOTE,
    header: '"And I can think again" 4:21.3 INSIDE: the mote in the window light', intent: 'Along her eye-line, past her ear: the sun shaft slanting down from the window over the sink, one mote in it (anchor marked), the empty chair below. Shallow; drifts as her attention drifts.' },
];

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
