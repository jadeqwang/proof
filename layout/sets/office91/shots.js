// SCHOOL OFFICE (about 1991) camera table: the "groove in" handout shot (0:19.0-0:29.7), the pre-chorus (1:17.2-1:32.7) and
// the band-out (1:32.7-1:36.0). Times are -2sm master seconds (analysis/m2sm/song_map.md; retimed from v2 2026-11-25,
// cuts on the -2sm sung onsets and the measured groove / band-out hits); `t` = [start, end] of the clip a camera serves.
// The plan's two camera positions:  OUTSIDE = frontal, level, locked off on her face, with bare wall frame-left of it for
// the toner label.  INSIDE = along her eye-line, close (her head is hidden in those guides: the camera is her eyes).
import { SEATS, CHAIR, JADE_TIP, SW_TIP, DICT, DAD_PALM, HANDOUT, TABLE, HALL_KID, HALL_MOM } from './layout.js';
import { pointAt } from './common.js';

const TOP = TABLE.h, HX = HANDOUT.cx;
// ---------------------------------------------------------------- poses
const dangle = { seatH: CHAIR.hipChild, ankleL: [0.07, -0.3, 0.25], ankleR: [0.07, -0.3, 0.25] };   // her feet do not reach the carpet
const jade = (o = {}) => ({ at: SEATS.jade, legs: 'seat', legOpts: dangle, yaw: 0, spine: { bend: 8 }, head: { look: [0.0, 0.86, 0.3] },   // eyes on the sweatshirt and the table, never the face
  L: { to: [HX + 0.17, TOP + 0.03, -0.28], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [HX - 0.17, TOP + 0.03, -0.28], hand: 'relax', palm: 'down', fingers: 'fwd' }, ...o });
const jadeRead = (o = {}) => jade({ spine: { bend: 20 }, head: { look: 'handout' }, ...o });
const jadePoint = (o = {}) => jadeRead({ R: pointAt(JADE_TIP, [0.1, -0.5, 0.86], 0.122, 'R'), head: { look: 'gap' }, ...o });
const sw = (o = {}) => ({ at: SEATS.socialWorker, legs: 'seat', legOpts: { seatH: CHAIR.hipAdult }, yaw: 180, spine: { bend: 8 }, head: { look: 'jade7:eyes' },
  L: { to: [0.08, TOP + 0.035, 0.24], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [0.33, TOP + 0.04, 0.25], hand: 'pinch', palm: 'down', fingers: 'fwd' }, ...o });
const swPoint = () => sw({ spine: { bend: 42 }, head: { look: 'anxious' }, L: pointAt(SW_TIP, [-0.45, -0.5, -0.6], 0.178, 'L') });
// Mom holds the open dictionary in both hands, as you hold a paperback to read: each palm under one cover (palm toward
// the back of the book), four fingers spread along the back of that cover toward its top edge, each thumb over the page
// block on the face. Her RIGHT thumb is the riffle: its pad on the fore-edge corner of the right-hand pages, bending them
// up so they flip toward the spine. Book height axis = [0, 0.77, 0.64]; page normal = [0, 0.64, -0.77] (toward her face).
const BK_UP = [0, 0.77, 0.64], BK_N = [0, 0.64, -0.77];
const mom = (o = {}) => ({ at: SEATS.mom, legs: 'seat', legOpts: { seatH: CHAIR.hipAdult }, yaw: 0, spine: { bend: 12 }, head: { look: 'dict' },
  L: { to: DICT.at, off: [0.05, -0.062, 0.01], hand: { shape: 'relax', thumb: { opp: 0.1, sweep: 40, abd: 26, mcp: 6, ip: 8 } }, palm: BK_N, fingers: BK_UP, thumb: [-1, 0.2, -0.2] },
  R: { to: DICT.at, off: [-0.055, -0.062, 0.01], hand: { shape: 'relax', thumb: { opp: 0.1, sweep: 40, abd: 26, mcp: 6, ip: 22 } }, palm: BK_N, fingers: BK_UP, thumb: [1, 0.25, -0.25] }, ...o });
const momListen = (o = {}) => mom({ head: { look: 'sw:head' }, L: { to: [0.5, TOP + 0.02, -0.38], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: [0.32, TOP + 0.02, -0.4], hand: 'relax', palm: 'down', fingers: 'fwd' }, ...o });
// r3 (Jade): Dad STANDS behind Mom's chair (a little to her left), his RIGHT hand on her left shoulder, his LEFT hand
// open, palm up, out toward the social worker, mid-explanation ("Her English comes from books"). His watch is on that
// left wrist with its face on the BACK of the wrist (opposite the palm): turned down, out of sight; the strap's buckle
// side shows on the palm side.
const dad = (o = {}) => ({ at: SEATS.dad, legs: 'stand', yaw: -6, spine: { bend: 6 }, head: { look: 'sw:head' },
  R: { to: 'mama91:shoulderL', off: [0.0, 0.035, 0.0], hand: 'relax', palm: 'down', fingers: [-0.15, -0.3, 1] },
  L: { to: [1.0, 1.08, -0.6], hand: 'palmUp', palm: 'up', fingers: [-0.2, 0.15, 1], elbow: 'down' }, ...o });
// ---------------------------------------------------------------- r3: the corridor (age 10, a later visit)
const kid10 = (o = {}) => ({ at: HALL_KID, legs: 'stand', yaw: -90, spine: { bend: -3 }, head: { look: [-3.2, 1.22, 0.75] }, L: 'side', R: 'side', ...o });
const momHall = (o = {}) => ({ at: HALL_MOM, legs: 'stand', yaw: 40, spine: { bend: 22 }, head: { look: 'jade10:eyes' },
  R: { to: 'jade10:shoulderR', off: [-0.03, 0.03, 0], hand: 'relax', palm: 'down', fingers: [0.5, -0.3, 0.6] }, L: 'side', ...o });
// thumbs on her cheeks: Mom squarely in front of her, stooping; each palm along the side of the girl's jaw, the fingers
// back and up toward the ears, the thumbs on the cheeks beside the mouth corners, pushing up. (The girl faces -x: her
// left cheek is +z, which Mom's RIGHT hand takes.)
const CHEEK_HAND = { shape: 'flat', thumb: { opp: 0.15, sweep: 46, abd: 28, mcp: 6, ip: 12 } };
const momThumbs = () => ({ at: [HALL_KID[0] - 0.5, HALL_KID[1] - 0.03], legs: 'stand', yaw: 92, spine: { bend: 16 }, head: { look: 'jade10:eyes' },
  R: { to: 'jade10:mouth', off: [0.05, -0.012, 0.072], hand: CHEEK_HAND, palm: [0, 0, -1], fingers: [0.6, 0.75, 0], thumb: [-0.75, 0.45, -0.4] },
  L: { to: 'jade10:mouth', off: [0.05, -0.012, -0.072], hand: CHEEK_HAND, palm: [0, 0, 1], fingers: [0.6, 0.75, 0], thumb: [-0.75, 0.45, 0.4] } });
const ALL = (j = jade(), s = sw(), m = mom()) => ({ jade7: j, sw: s, mama91: m, dad: dad() });
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
  { id: 'PC2', t: [81.50, 83.27], lens: 35, orbit: { at: { mid: ['mama91:head', 'dad:head'] }, az: 24, el: -2, dist: 2.0 }, aim: [{ mid: ['mama91:head', 'dad:head'] }, 0.56, 0.4], figs: ALL(jade(), sw(), momListen()), focus: ['mama91', 'dad'], hide: ['little red dictionary'],
    header: '1:21.5 "(Her English comes from books)": Dad, standing behind Mom, explains',
    intent: 'r3 (Jade): Mom seated, Dad standing behind her with his left hand on her shoulder, mid-explanation, his right hand open toward the social worker. From the social worker\'s side of the table, past the table\'s end. The back wall\'s children\'s art (the same wall as PC1/PC4) behind them.' },
  // r3 (Jade): "it should pan down from the counselor's sweatshirt down to the sheet". One camera position at her eyes
  // (head hidden), two aims: PC3a = start (the sweatshirt print), PC3b = end (the sheet). The move is a tilt down with a
  // little pan left (the sheet is 0.5 m left of the sweatshirt).
  { id: 'PC3a', t: [83.27, 85.3], lens: 35, pos: [-0.3, 1.0564, -0.3737], aim: ['sw:chest', 0.5, 0.42], ...INSIDE, figs: ALL(jadeRead({ head: { look: 'sw:chest' } })),
    move: { end: 'PC3b', note: 'tilt down (and a little left) from the sweatshirt print to the sheet' },
    header: '1:23.3 INSIDE lyric-free gap: pan start, the social worker\'s sweatshirt', intent: 'Inside: her eye-line on the sweatshirt print, no face (the head above the frame line); the tilt down begins.' },
  { id: 'PC3b', t: [85.3, 87.37], lens: 35, pos: [-0.3, 1.0564, -0.3737], aim: ['handout', 0.5, 0.5], ...INSIDE, figs: ALL(jadeRead()),
    header: '1:25.3 INSIDE: pan end, the sheet', intent: 'Inside: her true eye-line onto the handout, close and raking; the social worker\'s forearms and clipboard beyond the top of the page, no face. Her eye then runs down the grid toward the short row.' },
  { id: 'PC4', same: 'PC1', t: [87.37, 92.68], header: '1:27.4 OUTSIDE "Her face doesn\'t make much expression": the same frame, held through "(For our culture," (PC5 dropped)',
    intent: 'Identical camera to PC1 (the film\'s rhyme); a second toner label lands in the same place.' },
  // PC5 (Mom's thumb through the red dictionary, 1:30.8) DROPPED by Jade 2026-11-26 ("so bad"); PC4 holds to 1:32.7.

  // ---------------------------------------------------------------- band out, 1:32.7-1:36.0
  { id: 'BO1', t: [92.68, 94.68], ...GAP_CAM, figs: ALL(jadePoint()),
    header: '1:32.7 INSIDE band out "that\'s just how it looks": she points at the EMPTY SPACE after the row of six (gold circle round it)',
    intent: 'r3 (Jade): inside, the gap camera: her small index finger comes down on the empty space where a seventh face would be, not on a face.' },
  { id: 'BO2', t: [94.68, 96.00], ...GAP_CAM, figs: ALL(jadePoint(), swPoint()),
    header: '1:34.7 INSIDE the adult\'s finger lands on the closest face to her empty space and reads its label: ANXIOUS',
    intent: 'r3 (Jade): same camera. Her finger stays on the empty space; an adult index finger arrives from across the table and lands on the CLOSEST face to it (the row\'s last face). Match cut on the pointing finger follows.' },

  // ---------------------------------------------------------------- r3: THE CORRIDOR, a SEPARATE TIME (about 1993-94, her at TEN)
  // Jade: "you need facial expressions" is said to her at about ten, "right outside the school counselor's door" (moved
  // out of the attic: old AD_out / AD_thumbs). Proposed times (the plan row is not edited here): FE_out over the whisper
  // "You need facial expressions" (-2sm 8.76-10.51), FE_thumbs on "But not like that" (18.23-18.94).
  { id: 'FE_out', hall: true, t: [8.76, 10.51], lens: 50, orbit: { at: 'jade10:eyes', az: -58, el: 0, dist: 1.75 }, aim: ['jade10:eyes', 0.6, 0.4], focus: ['jade10', 'mama91'], figs: { jade10: kid10(), mama91: momHall() },
    header: '0:08.8 OUTSIDE, the corridor at ten: "You need facial expressions" (whispered)', intent: 'Frontal, level, locked off on her face: ten years old, her back against the corridor wall beside the closed counselor\'s door (frame right). Mom stoops in from frame left, her right hand on her daughter\'s shoulder, saying it. Corridor light from a ceiling panel.' },
  { id: 'FE_thumbs', hall: true, t: [18.23, 19.0], lens: 40, orbit: { at: 'jade10:eyes', az: -52, el: 2, dist: 0.95 }, aim: ['jade10:eyes', 0.62, 0.42], focus: ['jade10', 'mama91'],
    figs: { jade10: kid10({ spine: { bend: -6 }, head: { look: [-3.2, 1.3, 0.62] } }), mama91: momThumbs() },
    header: '0:18.2 OUTSIDE, closer: "But not like that": Mom\'s thumbs push her cheeks into a smile', intent: 'Closer, three-quarter from the door side: Mom stoops squarely in front of her (Mom in near profile, frame left), her hands cupping her daughter\'s jaw, the thumbs pressing the cheeks up into a smile under a deepening frown; the girl pulls her head back against the wall.' },
  // ---------------------------------------------------------------- spare (not placed in the Structure table)
  { id: 'X_sw', lens: 50, orbit: { at: 'sw:chest', az: -156, el: 4, dist: 1.05 }, aim: ['sw:chest', 0.5, 0.45], ...INSIDE, figs: ALL(),
    header: 'spare INSIDE: what she looks at instead of the face: the sweatshirt print and the table', intent: 'Inside: her eye-line across the table at the social worker\'s sweatshirt, forearms and clipboard; the head is above the frame line. Unplaced spare for the pre-chorus.' },
];

for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
