// SCHOOL OFFICE (about 1991) camera table: the "groove in" handout shot (0:19.0-0:29.7), the pre-chorus (1:17.2-1:32.7) and
// the band-out (1:32.7-1:35.6) and X_sw (1:35.6-1:36.0). Times are -2sm master seconds (analysis/m2sm/song_map.md; retimed from v2 2026-11-25,
// cuts on the -2sm sung onsets and the measured groove / band-out hits); `t` = [start, end] of the clip a camera serves.
// The plan's two camera positions:  OUTSIDE = frontal, level, locked off on her face, with bare wall frame-left of it for
// the toner label.  INSIDE = along her eye-line, close (her head is hidden in those guides: the camera is her eyes).
import { SEATS, CHAIR, JADE_TIP, SW_TIP, DICT, DAD_PALM, HANDOUT, TABLE, HALL_KID, HALL_MOM } from './layout.js';
import { graspArms } from '../../engine/grasp.js';

const TOP = TABLE.h, HX = HANDOUT.cx;
// ---------------------------------------------------------------- poses
// r5 (clipcheck): her resting hands ('relax', fingers curled down) sank 10-14 mm into the table top at TOP + 0.03. Now they lie
// open on the table (a hand at rest, light curl) 1 cm higher: clipcheck clean in H1 / PC1.
const JADE_REST_Y = 0.04, JADE_HAND = { shape: 'flat', curl: { index: [4, 8, 4], middle: [5, 8, 4], ring: [6, 8, 4], little: [6, 8, 4] }, spread: 3 };
const dangle = { seatH: CHAIR.hipChild, ankleL: [0.07, -0.3, 0.25], ankleR: [0.07, -0.3, 0.25] };   // her feet do not reach the carpet
const jade = (o = {}) => ({ at: SEATS.jade, legs: 'seat', legOpts: dangle, yaw: 0, spine: { bend: 8 }, head: { look: [0.0, 0.86, 0.3] },   // eyes on the sweatshirt and the table, never the face
  L: { to: [HX + 0.17, TOP + JADE_REST_Y, -0.28], hand: JADE_HAND, palm: 'down', fingers: 'fwd' }, R: { to: [HX - 0.17, TOP + JADE_REST_Y, -0.28], hand: JADE_HAND, palm: 'down', fingers: 'fwd' }, ...o });
const jadeRead = (o = {}) => jade({ spine: { bend: 20 }, head: { look: 'handout' }, ...o });
// r4: her index fingertip's pad ON the gap (JADE_TIP): `tip` puts the fingertip centre there, raised by the child's
// distal pad radius (0.040 hand units x 1.097 child finger scale x 0.122 m hand = 5.4 mm), so the pad meets the page on
// the gap. The finger comes down at 30 deg, so the lowest point of the finger is that pad. She looks at the gap.
const JADE_PAD_R = 0.0054;
// 2026-11-27 (BO1 = BO2_v3): as BO2_v3 paints it, her forearm comes in from the lower right, elbow out to her right
// (elbowAt), the index pointing up the page and to the left (fingers was [0.1, -0.64, 0.76]), sleeves pushed up (the
// prompt always said so; with long sleeves the cuff hid the whole hand from the camera behind her).
const jadePoint = (o = {}) => jadeRead({ R: { tip: { finger: 'index', at: JADE_TIP, off: [0, JADE_PAD_R, 0] }, hand: 'point', fingers: [0.22, -0.6, 0.77], palm: [0, -1, 0], elbowAt: [-0.5, 0.7, -0.45], grasp: 'tipOn', object: 'yellow handout' }, head: { look: 'gap' }, costume: { sleeves: 'pushed' }, ...o });   // hold pass: checked as a tap on the page (tipOn); the finger comes down at 40 deg (was 30: her thumb went 6 mm into the page)
// hold pass 2026-11-26: her right hand RESTS on her clipboard (restOn), its fingertips on the notes and the heel of the hand
// just off them, as a hand lies at rest on a page; the board lies on the table and the table carries it. Was a 'pinch' in
// the air that closed through the 6 mm board. (The mannequin's wrist sphere is fatter than its palm: with the palm flat on
// the page the wrist went 18 mm through it, so the hand pitches a little fingers-down and the wrist clears.)
const SW_LH = 0.178, CLIP_TOP = TOP + 0.008;   // her hand length (as swPoint); the clipboard's paper top (build.js: 6 mm board + 2 mm notes)
const REST_HAND = { shape: 'flat', curl: { index: [4, 8, 4], middle: [5, 8, 4], ring: [6, 8, 4], little: [6, 8, 4] }, spread: 3 };   // a hand lying open on a page
const swRest = (x, z, f = [-0.45, -0.08, -0.9], lift = 0.0215) => { const a = graspArms('restOn', { centre: [x, CLIP_TOP, z], at: [x, CLIP_TOP, z], up: [0, 1, 0], axis: f, label: 'clipboard (her notes)' }, { Lh: SW_LH, side: 'R' }).R;
  a.to[1] += lift; return Object.assign(a, { hand: REST_HAND, fingers: f, palm: [f[2] * 0.12, -1, -f[0] * 0.12] }); };   // palm rolled a little onto the little-finger side
// shoulder fix (Jade on X_sw: "the social worker's shoulders are weirdly misshapen"): without a pole the engine's default
// elbow pole (down, 65 % outward, a little back) swung both elbows out wide, the upper arms abducted and flexed forward, and
// the mesh shoulder folded. Poles DOWN and BACK by her hips keep the elbows in beside her ribs, the upper arms hanging
// nearly vertical, the forearms reaching forward onto the table (L hand also 3 cm in toward her midline).
const SW_ELBOW = { L: [-0.12, 0.55, 0.9], R: [0.52, 0.55, 0.9] };   // poles out ~32 cm from her midline and back behind the chair: elbows a little out and back (in close they crumpled the armpit; the engine default, out wide, bulged the deltoid)
const sw = (o = {}) => ({ at: SEATS.socialWorker, legs: 'seat', legOpts: { seatH: CHAIR.hipAdult }, yaw: 180, spine: { bend: 8 }, head: { look: 'jade7:eyes' },
  L: { to: [0.0, TOP + 0.035, 0.22], hand: 'relax', palm: 'down', fingers: [0.35, 0, -0.94], elbowAt: SW_ELBOW.L }, R: { ...swRest(0.27, 0.17), elbowAt: SW_ELBOW.R }, ...o });   // L on the table just left of the clipboard (hold pass: was on its edge, the fingers through the notes)
const swPoint = () => sw({ spine: { bend: 42 }, head: { look: 'anxious' }, L: graspArms('tipOn', { centre: SW_TIP, at: [SW_TIP[0], SW_TIP[1] + 0.0005, SW_TIP[2]], axis: [-0.45, -0.5, -0.6], up: [0, 1, 0], palm: [0, -1, 0], label: 'yellow handout' }, { Lh: SW_LH, side: 'L' }).L, R: { ...swRest(0.25, 0.09, [-0.8, -0.08, -0.55], 0.027), elbowAt: [0.65, 0.9, 0.2] } });   // leaning in, her resting hand lies further up the notes; hold pass: her index pad lands ON the face (tipOn; pointAt put it about 1 cm off)
// Mom holds the open dictionary in both hands, as you hold a paperback to read: each palm under one cover (palm toward
// the back of the book), four fingers spread along the back of that cover toward its top edge, each thumb over the page
// block on the face. Her RIGHT thumb is the riffle: its pad on the fore-edge corner of the right-hand pages, bending them
// up so they flip toward the spine. Book height axis BK_UP; page normal BK_N (toward her face).
// hold pass 2026-11-26: checked as twoHandsBelow on the dictionary. The palms now lie ON the back of the cover (they were
// 2 cm behind it) under its lower half, and the book leans back to DICT.tilt = 40 deg (was 50) so the palms' friction holds
// it (steeper than atan 0.9 = 42 deg it slid down through her hands).
const BT = DICT.tilt * Math.PI / 180, BK_UP = [0, Math.sin(BT), Math.cos(BT)], BK_N = [0, Math.cos(BT), -Math.sin(BT)];
const BK_BACK = 0.010 + 0.064 * 0.18 - 0.0012 + 0.005, BK_LOW = 0.041;   // palm centre behind the page plane (cover back 10 mm + palm 11.5 mm - squeeze, + 5 mm: the hands roll onto the index side, which meets the cover first); below the book centre
const bkOff = (x) => [x, -BK_N[1] * BK_BACK - BK_UP[1] * BK_LOW, -BK_N[2] * BK_BACK - BK_UP[2] * BK_LOW];
const mom = (o = {}) => ({ at: SEATS.mom, legs: 'seat', legOpts: { seatH: CHAIR.hipAdult }, yaw: 0, spine: { bend: 12 }, head: { look: 'dict' },
  L: { to: DICT.at, off: bkOff(0.05), hand: { shape: 'relax', thumb: { opp: 0.1, sweep: 40, abd: 26, mcp: 6, ip: 8 } }, palm: BK_N, fingers: BK_UP, thumb: [-1, 0.2, -0.2], grasp: 'twoHandsBelow', object: 'little red dictionary' },
  R: { to: DICT.at, off: bkOff(-0.055), hand: { shape: 'relax', thumb: { opp: 0.1, sweep: 40, abd: 26, mcp: 6, ip: 22 } }, palm: BK_N, fingers: BK_UP, thumb: [1, 0.25, -0.25], grasp: 'twoHandsBelow', object: 'little red dictionary' }, ...o });
const momListen = (o = {}) => mom({ head: { look: 'sw:head' }, L: { to: [0.5, TOP + JADE_REST_Y, -0.38], hand: JADE_HAND, palm: 'down', fingers: 'fwd' }, R: { to: [0.32, TOP + JADE_REST_Y, -0.4], hand: JADE_HAND, palm: 'down', fingers: 'fwd' }, ...o });
// r3 (Jade): Dad STANDS behind Mom's chair (a little to her left), his RIGHT hand on her left shoulder, his LEFT hand
// open, palm up, out toward the social worker, mid-explanation ("Her English comes from books"). His watch is on that
// left wrist with its face on the BACK of the wrist (opposite the palm): turned down, out of sight; the strap's buckle
// side shows on the palm side.
const dad = (o = {}) => ({ at: SEATS.dad, legs: 'stand', yaw: -6, spine: { bend: 6 }, head: { look: 'sw:head' },
  R: { to: 'mama91:shoulderL', off: [0.0, 0.045, 0.0], hand: 'relax', palm: 'down', fingers: [-0.15, -0.3, 1] },
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
// 2026-11-27 (Jade: the PC1 background drifted take to take): her eyes 0.42 -> 0.47 down the frame, the frame of the PC1_v1 /
// v2 paintings Jade liked (a tilt of under 1 deg; the camera stays where it was, level, 65 mm; she does not move). The lens
// stays: widening brings Mom's chair and arm in at the right edge. The back wall's art was moved to where v1 paints it instead
// (layout.js ALPHA / BOARD / ART / FILE2), so everything the painter is told about is inside the guide.
const OUTSIDE_CAM = { lens: 65, orbit: { at: 'jade7:eyes', az: -6, el: 0, dist: 2.1 }, aim: ['jade7:eyes', 0.66, 0.47], focus: ['jade7'] };
// r5 (lead: BO2_lit was blown out white): the close shots inside the tube's pool (the handout under the tube) clipped to
// white in the lit pass (80-97 % of pixels at 255). POOL lowers the lit pass's exposure (build.js scales the tube spots,
// the bounce and the ambient) so the paper, the faces and the hands read. Other passes are unchanged.
const POOL = { light: { exposure: 0.27 } };
// 2026-11-27 (Jade: BO2 pick = BO2_v3; BO1 must "copy sheet and hand positioning from" it): the r4 guides used orbit az 150
// (the sheet seen steeply from the side), but BO2_v3 was painted from its r3 image reference and so kept the r3 view from
// straight behind her. The BO1 takes followed the az-150 guide, hence the drift. GAP_CAM is now the camera solved from
// BO2_v3 itself (its four sheet corners, 40 mm fixed: reprojection error under 1 % of the frame), so both guides match the
// picked painting. Was: orbit { at: 'gap', az: 150, el: 50, dist: 0.5 }, aim ['gap', 0.5, 0.56].
const GAP_CAM = { ...POOL, lens: 40, pos: [-0.3729, 1.1002, -0.4312], target: [-0.3823, 0.7206, -0.0863], roll: 1.4, ...INSIDE };

export const SHOTS = [
  // ---------------------------------------------------------------- reference (not in the cut)
  { id: 'REF_plan', lens: 0, ortho: { w: 5.4 }, pos: [0, 6, 0.25], target: [0, 0, 0.25], up: [0, 0, -1], near: 3.56, far: 7, figs: ALL(), beamLine: false,
    header: 'PLAN (reference): yellow = the tube\'s lit wedge (floor footprint) and its section on the table', intent: 'Top view of the set with the ceiling cut away. Not a shot.' },
  // r4: the meeting table on its own (school activity table: laminate top, T-mould edge, steel apron, adjustable legs)
  { id: 'REF_table', lens: 30, pos: [-1.35, 0.95, 0.75], target: [-0.45, 0.5, 0.0], figs: {}, header: 'TABLE (reference): the meeting table, from the door side, low',
    intent: 'The meeting table as built (r4): almond woodgrain laminate top 29 mm thick, dark brown T-mould edge band, almond steel apron, adjustable legs (square almond upper tube with holes, chrome insert, black glide). Not a shot.' },
  { id: 'REF_wide', lens: 22, pos: [-1.5, 1.6, 1.8], aim: ['handout', 0.52, 0.62], figs: ALL(),
    header: 'MASTER (reference): the office from the door corner', intent: 'The whole set: the tube over the table, the four seats, bare wall behind her. Not a shot.' },

  // ---------------------------------------------------------------- groove in, 0:19.0-0:29.7
  { id: 'H1', t: [19.00, 25.63], ...POOL, lens: 40, orbit: { at: 'handout', az: 180, el: 62, dist: 0.52 }, aim: ['handout', 0.5, 0.5], ...INSIDE, figs: { jade7: jadeRead() },
    move: { end: 'H1b', note: 'the camera drifts from the whole sheet and settles on the gap in the short row' },
    header: '0:19.0 INSIDE groove in: the yellow handout under the tube, the whole grid (start)',
    intent: 'Inside: the yellow handout as she sees it, a grid of labelled cartoon faces, seven to a row, one centred row of six. The first colour in the film. Steeper than her true eye-line so the grid reads square; her hands rest either side.' },
  { id: 'H1b', t: [25.63, 29.74], ...POOL, lens: 60, orbit: { at: 'gap', az: 180, el: 62, dist: 0.36 }, aim: ['gap', 0.5, 0.5], ...INSIDE, figs: { jade7: jadeRead() },
    header: '0:25.6 INSIDE groove in: settled on the gap in the short row. Title: PROOF', intent: 'End of the H1 move: the end of the fourth row, which is one face short, and its last face (ANXIOUS). The title sits over this frame.' },

  // ---------------------------------------------------------------- pre-chorus, 1:17.2-1:32.7
  { id: 'PC1', t: [77.24, 81.50], ...OUTSIDE_CAM, figs: ALL(),
    header: '1:17.2 OUTSIDE (sung 1:18.3) "She doesn\'t talk like other children": toner label lands frame-left of her face',
    intent: 'Outside: frontal, level, locked off, from beside the social worker\'s shoulder. Her face right of centre under the tube, eyes down on the sweatshirt and the table; bare wall frame-left for the toner label.' },
  { id: 'PC2', t: [81.50, 83.27], lens: 30, orbit: { at: { mid: ['mama91:head', 'dad:head'] }, az: 26, el: 10, dist: 2.0 }, aim: [{ mid: ['mama91:head', 'dad:head'] }, 0.5, 0.3], figs: ALL(jade(), sw(), momListen()), focus: ['mama91', 'dad'], hide: ['little red dictionary'],
    header: '1:21.5 "(Her English comes from books)": Dad, standing behind Mom, explains',
    intent: 'r3 (Jade): Mom seated, Dad standing behind her with his left hand on her shoulder, mid-explanation, his right hand open toward the social worker. From the social worker\'s side of the table, past the table\'s end. The back wall\'s children\'s art (the same wall as PC1/PC4) behind them. r4 (Jade: "the table is a very wrong shape b/c it\'s not on screen"): the camera is up at a standing adult\'s eye height (1.75 m) and wider, so the table top, its banded edge and its near corner run across the lower third: the table\'s shape is in frame.' },
  // r3 (Jade): "it should pan down from the counselor's sweatshirt down to the sheet". One camera position at her eyes
  // (head hidden), two aims: PC3a = start (the sweatshirt print), PC3b = end (the sheet). The move is a tilt down with a
  // little pan left (the sheet is 0.5 m left of the sweatshirt).
  { id: 'PC3a', t: [83.27, 85.3], lens: 35, pos: [-0.3, 1.0564, -0.3737], aim: ['sw:chest', 0.5, 0.42], ...INSIDE, figs: ALL(jadeRead({ head: { look: 'sw:chest' } })),
    move: { end: 'PC3b', note: 'tilt down (and a little left) from the sweatshirt print to the sheet' },
    header: '1:23.3 INSIDE lyric-free gap: pan start, the social worker\'s sweatshirt', intent: 'Inside: her eye-line on the sweatshirt print, no face (the head above the frame line); the tilt down begins.' },
  { id: 'PC3b', t: [85.3, 87.37], ...POOL, lens: 42, pos: [-0.3, 1.0564, -0.3737], aim: ['handout', 0.5, 0.52] /* re-render pass 2026-11-26: 35 -> 42 mm, a stray hand at the top-left corner */, ...INSIDE, figs: ALL(jadeRead()),
    header: '1:25.3 INSIDE: pan end, the sheet', intent: 'Inside: her true eye-line onto the handout, close and raking; the social worker\'s forearms and clipboard beyond the top of the page, no face. Her eye then runs down the grid toward the short row.' },
  { id: 'PC4', same: 'PC1', t: [87.37, 92.68], header: '1:27.4 OUTSIDE "Her face doesn\'t make much expression": the same frame, held through "(For our culture," (PC5 dropped)',
    intent: 'Identical camera to PC1 (the film\'s rhyme); a second toner label lands in the same place.' },
  // PC5 (Mom's thumb through the red dictionary, 1:30.8) DROPPED by Jade 2026-11-26 ("so bad"); PC4 holds to 1:32.7.

  // ---------------------------------------------------------------- band out, 1:32.7-1:36.0
  { id: 'BO1', t: [92.68, 94.68], ...GAP_CAM, figs: ALL(jadePoint()),
    header: '1:32.7 INSIDE band out "that\'s just how it looks": she points at the EMPTY SPACE after the row of six (gold circle round it)',
    intent: 'r3 (Jade): inside, the gap camera: her small index finger comes down on the empty space where a seventh face would be, not on a face. r5 (Jade): the pad on the MIDDLE of the missing slot (in line with THANKFUL above and MAD below), her eyes on it.' },
  { id: 'BO2', t: [94.68, 95.6], ...GAP_CAM, figs: ALL(jadePoint(), swPoint()),   // r4 (Jade, 2026-11-26): shortened (was -96.00) for X_sw
    header: '1:34.7-1:35.6 INSIDE the adult\'s finger lands on the closest face to her empty space and reads its label: ANXIOUS',
    intent: 'r3 (Jade): same camera. Her finger stays on the empty space; an adult index finger arrives from across the table and lands on the CLOSEST face to it (the row\'s last face). r5 (Jade): a plain cut follows (X_sw, then AD_trace); no finger match, so nothing here is framed to match AD_trace. Her fingertip pad sits on the middle of the missing slot (GAP: under THANKFUL, above MAD), and she looks at it.' },

  // ---------------------------------------------------------------- r3: THE CORRIDOR, a SEPARATE TIME (about 1993-94, her at TEN)
  // Jade: "you need facial expressions" is said to her at about ten, "right outside the school counselor's door" (moved
  // out of the attic: old AD_out / AD_thumbs). Proposed times (the plan row is not edited here): FE_out over the whisper
  // "You need facial expressions" (-2sm 8.76-10.51), FE_thumbs on "But not like that" (18.23-18.94).
  { id: 'FE_out', hall: true, t: [8.76, 10.51], lens: 50, orbit: { at: 'jade10:eyes', az: -58, el: 0, dist: 1.75 }, aim: ['jade10:eyes', 0.6, 0.4], focus: ['jade10', 'mama91'], figs: { jade10: kid10(), mama91: momHall() },
    header: '0:08.8 OUTSIDE, the corridor at ten: "You need facial expressions" (whispered)', intent: 'Frontal, level, locked off on her face: ten years old, her back against the corridor wall beside the closed counselor\'s door (frame right). Mom stoops in from frame left, her right hand on her daughter\'s shoulder, saying it. Corridor light from a ceiling panel.' },
  { id: 'FE_thumbs', hall: true, t: [18.23, 19.0], lens: 40, orbit: { at: 'jade10:eyes', az: -52, el: 2, dist: 0.95 }, aim: ['jade10:eyes', 0.62, 0.42], focus: ['jade10', 'mama91'],
    figs: { jade10: kid10({ spine: { bend: -6 }, head: { look: [-3.2, 1.3, 0.62] } }), mama91: momThumbs() },
    header: '0:18.2 OUTSIDE, closer: "But not like that": Mom\'s thumbs push her cheeks into a smile', intent: 'Closer, three-quarter from the door side: Mom stoops squarely in front of her (Mom in near profile, frame left), her hands cupping her daughter\'s jaw, the thumbs pressing the cheeks up into a smile under a deepening frown; the girl pulls her head back against the wall.' },
  // shoulder check (Jade on X_sw: "the social worker's shoulders are weirdly misshapen"): the social worker alone, as
  // staged in PC1-PC4 / X_sw, from the front, her right side, above and behind. Not shots.
  ...[['front', -165, 8], ['side', -95, 8], ['top', -160, 60], ['back', 25, 20]].map(([k, az, el]) => ({ id: 'REF_sw_' + k, lens: 35,
    orbit: { at: 'sw:chest', az, el, dist: 1.25 }, aim: ['sw:chest', 0.5, 0.5], figs: { sw: sw({ head: { look: [0.2, 0.9, -0.5] } }) },
    header: `SHOULDER CHECK (reference): the social worker alone, ${k}`, intent: 'Not a shot: her shoulders, upper arms and sleeves as staged.' })),
  // ---------------------------------------------------------------- r4 (Jade, 2026-11-26): X_sw INSERTED at 1:35.6-1:36.0,
  // after BO2 and before the cut to attic88_day AD_trace. It carries the plates' caption "Were you afraid during the raid?",
  // small and low (tools/kf/comp_all.py CAPTIONS: size 25 at px [960, 1032]), held across the cut into AD_trace. The print sits a
  // little above centre so the bottom strip (the sweatshirt's lower front, her forearms and the clipboard edge) stays calm under the caption.
  { id: 'X_sw', t: [95.6, 96.0], lens: 50, orbit: { at: 'sw:chest', az: -156, el: 4, dist: 1.05 }, aim: ['sw:chest', 0.5, 0.4], ...INSIDE, figs: ALL(),
    caption: { text: 'Were you afraid during the raid?', at_px: [960, 1032], size: 25, note: 'small and low; carried into attic88_day AD_trace' },
    header: '1:35.6 INSIDE caption "Were you afraid during the raid?": the social worker\'s sweatshirt, five geese on dusty rose',
    intent: 'Inside: her eye-line across the table at the social worker\'s dusty-rose sweatshirt with its row of five geese, forearms and clipboard; the head above the frame line. The caption is laid small and low over the bottom centre; keep that strip free of busy detail.' },
];

for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
