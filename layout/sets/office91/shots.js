// SCHOOL OFFICE (about 1991) camera table: the "groove in" handout shot (0:19.0-0:29.7), the pre-chorus (1:17.2-1:32.7) and
// the band-out (1:32.7-1:36.0). Times are -2sm master seconds (analysis/m2sm/song_map.md; retimed from v2 2026-11-25,
// cuts on the -2sm sung onsets and the measured groove / band-out hits); `t` = [start, end] of the clip a camera serves.
// The plan's two camera positions:  OUTSIDE = frontal, level, locked off on her face, with bare wall frame-left of it for
// the toner label.  INSIDE = along her eye-line, close (her head is hidden in those guides: the camera is her eyes).
import { SEATS, CHAIR, JADE_TIP, SW_TIP, DICT, DAD_PALM, HANDOUT, TABLE } from './layout.js';
import { pointAt } from './common.js';

const TOP = TABLE.h, HX = HANDOUT.cx;
// ---------------------------------------------------------------- poses
const dangle = { seatH: CHAIR.hipChild, ankleL: [0.07, -0.3, 0.25], ankleR: [0.07, -0.3, 0.25] };   // her feet do not reach the carpet
const jade = (o = {}) => ({ at: SEATS.jade, legs: 'seat', legOpts: dangle, yaw: 0, spine: { bend: 8 }, head: { look: [0.0, 0.86, 0.3] },   // eyes on the sweatshirt and the table, never the face
  L: { to: [HX + 0.17, TOP + 0.03, -0.28], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [HX - 0.17, TOP + 0.03, -0.28], hand: 'relax', palm: 'down', fingers: 'fwd' }, ...o });
const jadeRead = (o = {}) => jade({ spine: { bend: 20 }, head: { look: 'handout' }, ...o });
const jadePoint = (o = {}) => jadeRead({ R: pointAt(JADE_TIP, [0.1, -0.5, 0.86], 0.122, 'R'), head: { look: 'anxious' }, ...o });
const sw = (o = {}) => ({ at: SEATS.socialWorker, legs: 'seat', legOpts: { seatH: CHAIR.hipAdult }, yaw: 180, spine: { bend: 8 }, head: { look: 'jade7:eyes' },
  L: { to: [0.08, TOP + 0.035, 0.24], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [0.33, TOP + 0.04, 0.25], hand: 'pinch', palm: 'down', fingers: 'fwd' }, ...o });
const swPoint = () => sw({ spine: { bend: 42 }, head: { look: 'anxious' }, L: pointAt(SW_TIP, [-0.45, -0.5, -0.6], 0.178, 'L') });
const mom = (o = {}) => ({ at: SEATS.mom, legs: 'seat', legOpts: { seatH: CHAIR.hipAdult }, yaw: 0, spine: { bend: 12 }, head: { look: 'dict' },
  L: { to: DICT.at, off: [0.06, -0.03, -0.01], hand: 'grip', palm: 'up', fingers: [-0.5, 0.2, 0.8] }, R: { to: DICT.at, off: [-0.065, 0.0, -0.03], hand: 'thumbsUp', palm: 'in', fingers: [0.4, 0.3, 0.85], thumb: [0.9, 0.3, 0.2] }, ...o });
const dad = (o = {}) => ({ at: SEATS.dad, legs: 'seat', legOpts: { seatH: CHAIR.hipAdult }, yaw: -90, spine: { bend: 12 }, head: { look: 'sw:head' },
  L: { to: DAD_PALM, hand: 'palmUp', palm: 'up', fingers: [-1, 0.05, -0.15] }, R: 'lap', ...o });
const ALL = (j = jade(), s = sw()) => ({ jade7: j, sw: s, mama91: mom(), dad: dad() });
const INSIDE = { hideParts: { jade7: ['head'] } };
// the two cameras that recur
const OUTSIDE_CAM = { lens: 65, orbit: { at: 'jade7:eyes', az: -6, el: 0, dist: 2.1 }, aim: ['jade7:eyes', 0.66, 0.42], focus: ['jade7'] };
const GAP_CAM = { lens: 40, orbit: { at: 'gap', az: 180, el: 50, dist: 0.5 }, aim: ['gap', 0.5, 0.56], ...INSIDE };

export const SHOTS = [
  // ---------------------------------------------------------------- reference (not in the cut)
  { id: 'REF_plan', lens: 0, ortho: { w: 5.4 }, pos: [0, 6, 0.25], target: [0, 0, 0.25], up: [0, 0, -1], near: 3.56, far: 7, figs: ALL(), beamLine: false,
    header: 'PLAN (reference): yellow = the tube\'s lit wedge (floor footprint) and its section on the table', intent: 'Top view of the set with the ceiling cut away. Not a shot.' },
  { id: 'REF_wide', lens: 22, pos: [-1.5, 1.6, 1.8], aim: ['handout', 0.52, 0.62], figs: ALL(),
    header: 'MASTER (reference): the office from the door corner', intent: 'The whole set: the tube over the table, the four seats, bare wall behind her. Not a shot.' },

  // ---------------------------------------------------------------- groove in, 0:19.0-0:29.7
  { id: 'H1', t: [19.00, 25.63], lens: 40, orbit: { at: 'handout', az: 180, el: 62, dist: 0.52 }, aim: ['handout', 0.5, 0.5], ...INSIDE, figs: { jade7: jadeRead() },
    move: { end: 'H1b', note: 'the camera drifts from the whole sheet and settles on the gap in the short row' },
    header: '0:19.0 INSIDE groove in: the yellow handout under the tube, the whole grid (start)',
    intent: 'Inside: the yellow handout as she sees it, a grid of labelled cartoon faces, seven to a row, one centred row of six. The first colour in the film. Steeper than her true eye-line so the grid reads square; her hands rest either side.' },
  { id: 'H1b', t: [25.63, 29.74], lens: 60, orbit: { at: 'gap', az: 180, el: 62, dist: 0.36 }, aim: ['gap', 0.5, 0.5], ...INSIDE, figs: { jade7: jadeRead() },
    header: '0:25.6 INSIDE groove in: settled on the gap in the short row. Title: PROOF', intent: 'End of the H1 move: the end of the fourth row, which is one face short, and its last face (ANXIOUS). The title sits over this frame.' },

  // ---------------------------------------------------------------- pre-chorus, 1:17.2-1:32.7
  { id: 'PC1', t: [77.24, 81.50], ...OUTSIDE_CAM, figs: ALL(),
    header: '1:17.2 OUTSIDE (sung 1:18.3) "She doesn\'t talk like other children": toner label lands frame-left of her face',
    intent: 'Outside: frontal, level, locked off, from beside the social worker\'s shoulder. Her face right of centre under the tube, eyes down on the sweatshirt and the table; bare wall frame-left for the toner label.' },
  { id: 'PC2', t: [81.50, 83.27], lens: 50, orbit: { at: 'dadPalm', az: -155, el: 38, dist: 0.7 }, aim: ['dadPalm', 0.52, 0.55], figs: ALL(),
    header: '1:21.5 "(Her English comes from books)": Dad\'s open palm on the table', intent: 'The reply is a hand: Dad\'s open palm, turned up on the table at the edge of the light, seen from her side of the table. No faces.' },
  { id: 'PC3', t: [83.27, 87.37], lens: 35, orbit: { at: 'handout', az: 180, el: 47, dist: 0.46 }, aim: ['handout', 0.5, 0.5], ...INSIDE, figs: ALL(jadeRead()),
    move: { note: 'drifts down the page as her eye runs down the grid, column by column, toward the short row' },
    header: '1:23.3 INSIDE lyric-free gap: her eye runs down the grid', intent: 'Inside: her true eye-line onto the handout, close and raking; the social worker\'s forearms and clipboard beyond the top of the page, no face.' },
  { id: 'PC4', same: 'PC1', t: [87.37, 90.78], header: '1:27.4 OUTSIDE "Her face doesn\'t make much expression": the same frame, shorter',
    intent: 'Identical camera to PC1 (the film\'s rhyme); a second toner label lands in the same place.' },
  { id: 'PC5', t: [90.78, 92.68], lens: 50, orbit: { at: 'dict', az: -100, el: 32, dist: 0.72 }, aim: ['dict', 0.5, 0.5], figs: ALL(),
    header: '1:30.8 "(For our culture,": Mom\'s thumb racing through the little red dictionary', intent: 'The reply is a hand: Mom\'s thumb riffling the pages of a pocket dictionary, seen from little Jade\'s side. No faces.' },

  // ---------------------------------------------------------------- band out, 1:32.7-1:36.0
  { id: 'BO1', t: [92.68, 94.68], ...GAP_CAM, figs: ALL(jadePoint()),
    header: '1:32.7 INSIDE band out "that\'s just how it looks": she points at the last face in the row of six (gold circle round the gap beside it)',
    intent: 'Inside, the gap camera: her small index finger comes down on the last face in the row of six, where the row stops short.' },
  { id: 'BO2', t: [94.68, 96.00], ...GAP_CAM, figs: ALL(jadePoint(), swPoint()),
    header: '1:34.7 INSIDE the adult\'s finger lands on the same face and reads its label: ANXIOUS',
    intent: 'Same camera. An adult index finger arrives from across the table and lands on the face she is pointing at, the one next to the gap. Her finger has not moved. Match cut on the pointing finger follows.' },

  // ---------------------------------------------------------------- spare (not placed in the Structure table)
  { id: 'X_sw', lens: 50, orbit: { at: 'sw:chest', az: -156, el: 4, dist: 1.05 }, aim: ['sw:chest', 0.5, 0.45], ...INSIDE, figs: ALL(),
    header: 'spare INSIDE: what she looks at instead of the face: the sweatshirt print and the table', intent: 'Inside: her eye-line across the table at the social worker\'s sweatshirt, forearms and clipboard; the head is above the frame line. Unplaced spare for the pre-chorus.' },
];

for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
