// MV10 camera table: the housewarming at 345B View St, Mountain View, fall 2010 (rebuilt 2026-11-25 (2) from Jade's
// drawings). One entry per shot the plan's Structure table places here:
//   BR*  bridge 2:34.5-2:52.5 (late-afternoon daylight)   HS1 hard stop 2:52.5-2:54.7   V3* verse 3 2:54.7-3:19.1 (sun going down)
//   SI1  silence 3:19.1-3:23.4 (dusk into dark, poi)     C2* chorus 2b 3:34.2-3:43.0 (back at the shelf, ceiling lights)
// All times are -2sm master times (analysis/m2sm/song_map.md, media/karaoke_v2/lyrics_timed.json full mix); the v3 shots
// were retimed 2026-11-25 with analysis/m2sm/remap.py and placed by hand on the -2sm sung onsets and measured hits.
// Each shot's `section` picks its clock time and sun from layout.js SCENE (one date, one time per section).
// World axes (layout.js): X = NNE, Z = ESE, y up, house floor 0, yard grade GRADE (-0.6). yaw 0 faces +Z (ESE, toward the
// yard), yaw 180 faces WNW (toward the front door and the couch), yaw 90 faces NNE, -90 SSW.
// RETIRED 2026-11-25 (2): BR4a (square-on halves), BR4b (sci-fi beside the Feynman set) -> the pan BRpan_a / m1 / b;
// BR5 (three lamps, three shadows) -> gone with the invented lamps (Jade: there were no paper lamps; drop the image).
// RETIRED 2026-11-25 (round 2 answers): V3g (alternate of the old shelf -> sliding-door route, which is gone). NEW: V3b_prep
// (the lemonade prep), V3_rcv_obl_k0 / _k3 (start / end keys of the new crossing), V3_rcv_obl_legs (diagnostic arrows).
// RETIRED 2026-11-25 (late): V3d ("nailed it" under the lemons) -> V3_nailed at the Expedit; V3_rev_eye_a/b (Jade chose
// the temple). V3_rcv is kept as REFERENCE ONLY (Jade chose the oblique V3_rcv_obl). New: BRpan_c (the pan's end, the seam).
import { MARKS, MARK_FLOOR, POI, AUDIENCE_AT, SHELF, SHELF_W, TREE, GRADE, PATIO, STAIRS, HOUSE, SECTION_KEY, SECTION_LIGHT, SUN, RC_MARKS, ROOM_CROSSING, PUNCHBOWL, punchLadle, COUNTER_H, PREP, DINING } from './layout.js';

import { graspArms } from '../../engine/grasp.js';

const LH = (h) => 0.108 * h;                          // hand length of an adult of height h (_cast.js PROP.adult.hand)
const yawTo = (a, b) => +(Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI).toFixed(1);
const SHELF_MARK = MARKS.shelf;                       // [2.72, 3.30]: in front of the truth half, facing the room
const LENS_ROOM = [2.72, 1.53, SHELF_MARK[1] - 2.47];  // where the outside camera stands for the shelf shots (by the couch's end)
const DECK = PATIO.top, Y = (y, f) => y + f;          // a world height above a floor

// ---------------------------------------------------------------- the guests (costume and posture; faces undrawn)
// Living room: S1 and B2 on the couch (in the window's sun during the bridge), B1 by the SSW window, group A between the
// glass table and the front door, E1 in the open front door. Kitchen: C group inside the counter U, clear of her route.
// Kitchen (2026-11-25 round 2): T1 at the giant punchbowl, hand on the ladle. Deck: G1 (greeting) and H1 (hug). The poi audience (Jade, 2026-11-25 late): W1-W4 on the lawn along
// the house's ESE wall (NNE of the stairs), D1 and D2 at the deck's ESE railing; the spinner faces them (layout.js POI).
const A = { A1: [3.55, 0.95], A2: [4.3, 1.05], A3: [3.95, 1.6] }, AC = [3.95, 1.2];
const C = { C1: [3.55, 6.45], C2: [3.25, 7.35], C3: [3.95, 7.25] }, CC = [3.6, 7.0];
const rel = (yaw, l, u, f) => { const a = yaw * Math.PI / 180; return [+(l * Math.cos(a) + f * Math.sin(a)).toFixed(3), u, +(-l * Math.sin(a) + f * Math.cos(a)).toFixed(3)]; };
const cupArm = (side, yaw) => ({ to: 'self:chest', off: rel(yaw, side === 'L' ? 0.1 : -0.1, -0.08, 0.2), hand: 'grip', fingers: 'fwd', palm: 'in', elbow: 'down', hold: { r: 0.034, h: 0.1, label: 'cup of lemonade' } });
const stand = (at, yaw, o = {}) => { const { cup, ...r } = o; const f = { at, yaw, legs: 'stand', L: 'side', R: 'side', ...r }; if (cup) f[cup] = cupArm(cup, yaw); return f; };
const onGrade = (at, yaw, o = {}) => stand(at, yaw, { floor: GRADE, ...o }), onDeck = (at, yaw, o = {}) => stand(at, yaw, { floor: DECK, ...o });
// T1's right fist round the party ladle's handle, a third of the way up from the lemonade (hold pass 2026-11-26: the hand
// sat 3 cm off the handle, palm into it; now a power grip from the template, thumb side up the handle)
const t1Ladle = () => { const P = punchLadle(), at = P.foot.map((v, i) => +(v + P.lean[i] * 0.34).toFixed(4));
  return graspArms('power', { centre: at, at, axis: P.lean, r: 0.011, label: 'ladle' }, { Lh: LH(1.72), side: 'R', toward: [3.93, 1.25, 8.12] }).R; };   // r: the 8 mm handle + 3 mm (the thumb sank in at 8)
// the poi spinner's fists: each closes round the poi's knob handle (2.4 cm thick, 10 cm long: the hand's held prop, centred
// on the circle's centre), the tether runs from it to the flame (build.js). Hold pass 2026-11-26: the empty fists closed on
// the 4 mm tether and the check found it inside the fingers.
const poiFist = (at) => ({ to: at, hand: 'grip', elbow: 'down', hold: { r: 0.012, h: 0.10, centre: true, label: 'poi knob handle (held)' } });   // 'held': engine/main.js finds the hand's own prop by it
function crowd(o = {}) {
  const lookAt = o.lookAt, hd = (dflt) => ({ head: { look: lookAt || dflt } });
  const f = {
    A1: stand(A.A1, yawTo(A.A1, AC), { ...hd([4.3, 1.55, 1.05]), cup: 'R' }),
    A2: stand(A.A2, yawTo(A.A2, AC), { ...hd([3.55, 1.6, 0.95]), L: { to: 'self:waist', off: rel(yawTo(A.A2, AC), 0.17, 0.02, 0.1), hand: 'relax' } }),
    A3: stand(A.A3, yawTo(A.A3, AC), { ...hd([3.55, 1.55, 0.95]), cup: 'L' }),
    S1: { at: [1.45, 0.52, 0.66], yaw: 0, legs: 'seat', legOpts: { seatH: 0.52 }, spine: { bend: -6 }, ...hd([2.05, 1.2, 0.66]), L: 'kneeL', R: 'kneeR' },
    B2: { at: [2.05, 0.52, 0.66], yaw: 0, legs: 'seat', legOpts: { seatH: 0.52 }, spine: { bend: -4 }, ...hd([1.45, 1.25, 0.66]), L: 'kneeL', R: cupArm('R', 0) },
    B1: stand([0.6, 2.55], yawTo([0.6, 2.55], [1.7, 0.7]), { ...hd([1.7, 1.1, 0.66]), cup: 'R' }),
    E1: stand([4.3, 0.42], 180, { head: { look: [4.3, 1.5, -6] }, cup: 'L' }),
    C1: stand(C.C1, yawTo(C.C1, CC), { head: { look: [3.25, 1.6, 7.35] }, cup: 'R' }),
    C2: stand(C.C2, yawTo(C.C2, CC), { head: { look: [3.55, 1.6, 6.45] }, R: { to: 'self:chest', off: rel(yawTo(C.C2, CC), -0.2, 0.02, 0.28), hand: 'palmUp', palm: 'up' } }),
    C3: stand(C.C3, yawTo(C.C3, CC), { head: { look: [3.55, 1.6, 6.45] }, cup: 'L' }),
    T1: stand([3.93, 8.12], 90, { spine: { bend: 8 }, head: { look: [PUNCHBOWL.at[0], COUNTER_H + 0.2, PUNCHBOWL.at[1]] }, R: t1Ladle(), L: cupArm('L', 90) }),
    G1: onDeck([1.75, 11.0], yawTo([1.75, 11.0], [1.21, 9.62]), { head: { look: [1.21, 1.55, 9.62] }, cup: 'R' }),
    H1: onDeck([3.3, 11.2], yawTo([3.3, 11.2], [1.75, 11.0]), { head: { look: [1.75, DECK + 1.6, 11.0] } }),
    ...Object.fromEntries([['W1', [6.4, 10.45]], ['W2', [7.05, 10.6], 'R'], ['W3', [7.75, 10.4]], ['W4', [9.0, 10.5], 'L']].map(([k, at, cup]) =>
      [k, onGrade(at, yawTo(at, POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] }, ...(cup ? { cup } : {}) })])),
    D1: onDeck([2.2, 12.62], yawTo([2.2, 12.62], POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] }, cup: 'R' }),
    D2: onDeck([2.9, 12.66], yawTo([2.9, 12.66], POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] } }),
    poi: onGrade(POI.at, POI.yaw, { head: { look: [AUDIENCE_AT[0], GRADE + 1.5, AUDIENCE_AT[1]] }, L: poiFist('poiL'), R: poiFist('poiR') }),
  };
  if (o.noPoi) delete f.poi;
  for (const k of o.drop || []) delete f[k];
  return { ...f, ...(o.set || {}) };
}

// ---------------------------------------------------------------- the principals
// At the shelf (bridge): she faces the room (and the lens) in front of the truth half; he stands at her right (frame
// left), back to the room, reading the textbooks (cube 3,3), pulling one out with his left hand. Her right hand taps
// his right elbow. (He: Naot cork sandals, forearm hair clearly visible: sidecar note `first_love_costume`.)
const HE_SHELF = [3.32, SHELF_W.front - 0.535];
// verse 3, "nailed it": he has stepped in close at her right-front to whisper (V3_nailed)
const HE_NAIL = [SHELF_MARK[0] + 0.33, SHELF_MARK[1] - 0.15];
const CUBE33 = SHELF_W.cube(3, 3);
const jadeShelf = (o = {}) => ({ at: SHELF_MARK, yaw: 180, legs: 'stand', head: { look: LENS_ROOM }, L: 'side',
  R: { to: 'firstLove27:elbowR', off: [-0.055, 0.1, -0.02], hand: 'flat', fingers: [0.85, 0.45, 0.2], palm: [0.5, -0.8, -0.2], grasp: 'restOn' }, ...o });   // grasp: checked as contact on his arm (hold pass)
const heShelf = (o = {}) => ({ at: HE_SHELF, yaw: 0, legs: 'stand', head: { look: [CUBE33[0], 1.3, SHELF_W.spines] }, R: 'side', L: { to: [CUBE33[0] + 0.05, 1.36, SHELF_W.front - 0.067], hand: 'pinch', fingers: 'fwd', grasp: 'pinch', object: 'textbooks (truth)' }, ...o });
// chorus 2b: they face each other at the shelf; her hand taps on his LEFT forearm, he looks down at it. r3 fault (C2b: the
// painter put the cup in HER hand, because her hand sat on his wrist next to the cup): 2026-11-26 NO cup in C2a / C2b
// (tried in his right hand: it still sat mid-frame in C2b), his left forearm held out bare, her empty hand tapping mid-forearm.
const HE_C2 = [SHELF_MARK[0] + 0.23, SHELF_MARK[1] - 0.5];
const jadeC2 = (o = {}) => ({ at: SHELF_MARK, yaw: yawTo(SHELF_MARK, HE_C2), legs: 'stand', head: { look: 'firstLove27:eyes' }, L: 'side',
  R: { to: 'firstLove27:forearmL', off: [0.0, 0.056, 0.0], hand: 'flat', fingers: 'to:firstLove27:elbowL', palm: 'down', grasp: 'restOn' }, ...o });   // grasp: checked as contact on his forearm (hold pass)
const heC2 = (o = {}) => ({ at: HE_C2, yaw: yawTo(HE_C2, SHELF_MARK), legs: 'stand', spine: { bend: 4 }, head: { look: 'jade27:handR', pitchK: 0.9 }, R: 'side',
  L: { to: 'self:chest', off: rel(yawTo(HE_C2, SHELF_MARK), 0.13, -0.13, 0.27), hand: 'relax', palm: 'down', fingers: 'fwd', elbow: 'down' }, ...o });
// under the lemon tree: he came out with her and stands on the house side of her
const TREE_MARK = MARKS.tree, HE_TREE = [9.25, 17.3];
const jadeTree = (o = {}) => ({ at: TREE_MARK, floor: GRADE, yaw: yawTo(TREE_MARK, HE_TREE), legs: 'stand', head: { look: 'firstLove27:eyes' }, L: 'side', R: cupArm('R', yawTo(TREE_MARK, HE_TREE)), ...o });
const heTree = (o = {}) => ({ at: HE_TREE, floor: GRADE, yaw: yawTo(HE_TREE, TREE_MARK), legs: 'stand', head: { look: 'jade27:eyes' }, L: 'side', R: { to: 'self:chest', off: rel(yawTo(HE_TREE, TREE_MARK), -0.2, 0.0, 0.26), hand: 'palmUp', palm: 'up' }, ...o });

// V3a / V3b: the friend's two palms under the round bowl of picked lemons (build.js shot.bowl: a half sphere r 0.16, its rim
// 0.1 above `bowl`), 30 deg either side of its bottom, each palm square to the bowl's surface there, fingers forward.
// Hold pass 2026-11-26: the cupped hands were inside the bowl's wall. Her reaching hand (up toward a lemon, not yet
// touching it) is open ('relax'), not a cup: it holds nothing yet.
// (the bowl 5 cm further from him than before: a mesh body's belly met it)
const bowlHands = (bowl, yaw) => { const a = yaw * Math.PI / 180, l = [Math.cos(a), 0, -Math.sin(a)], S = [bowl[0], bowl[1] + 0.1, bowl[2]], k = 0.16 + 0.064 * LH(1.73) - 0.0015;
  const arm = (sg) => { const d = [0.5 * sg * l[0], -0.866, 0.5 * sg * l[2]];
    return { to: S.map((v, i) => +(v + d[i] * k).toFixed(4)), hand: { shape: 'flat', curl: { all: [10, 12, 8] }, thumb: { opp: 0, sweep: 30, abd: 0, mcp: -10, ip: -10 } }, palm: d.map((x) => -x), fingers: [Math.sin(a), 0, Math.cos(a)], grasp: 'twoHandsBelow', object: 'bowl of picked lemons' }; };
  return { L: arm(1), R: arm(-1) }; };
const bridgeFigs = (j = {}, h = {}, c = {}) => ({ ...crowd({ noPoi: true, ...c }), jade27: jadeShelf(j), firstLove27: heShelf(h) });
const partyFigs = (j, h, c = {}) => ({ ...crowd(c), jade27: j, firstLove27: h });
// the room crossing (2026-11-25 round 2; layout.js ROOM_CROSSING): early in the party, guests still arriving. phase 0 =
// start key (S0: talking with K1 in the kitchen), 2 = the middle (S2: stopped by the shelf, turned to R1; N1 and N2 just
// in), 3 = end key (S3: at the front door again, N3 and N4 on the step).
// Jade r3 decisions (2026-11-26): K1 and R1 are unnamed guests; the CHILDHOOD FRIEND was helping in the kitchen (here:
// refilling the snack bowls on the core-wall counter, OUR task); FIRST LOVE "was at the shelf briefly and then went to talk
// to an unnamed guest elsewhere": k0 at the Expedit's beauty half (back three-quarter to the camera), then (middle, k3) by
// the SSW living-room window talking with guest B1, his back to the camera. Where and with whom: OURS.
const RC = RC_MARKS;
// V3b_prep (Jade r3): she presses a half on the reamer in the corner; the friend stirs with the ladle (R arm solved in build.js)
const prepPress = () => { const r = TREE.lemonR, f = [0.707, 0, 0.707], th = 30 * Math.PI / 180, C = [PREP.reamer.at[0], COUNTER_H + 0.103, PREP.reamer.at[1]];
  const at = [C[0] + f[0] * r * Math.sin(th), C[1] + 1.22 * r * Math.cos(th), C[2] + f[2] * r * Math.sin(th)];
  const nh = Math.sin(th) / r, nv = Math.cos(th) / (1.22 * r), nl = Math.hypot(nh, nv), up = [f[0] * nh / nl, nv / nl, f[2] * nh / nl];
  const fing = [f[0] * up[1], -Math.hypot(up[0], up[2]), f[2] * up[1]];
  return graspArms('restOn', { centre: C, at, axis: fing, up, label: 'lemon half (pressed on the juicer)', hand: 'flat' }, { Lh: LH(1.65), side: 'R' }).R; };
const prepFigs = () => ({ jade27: { at: PREP.jadeAt, yaw: yawTo(PREP.jadeAt, PREP.reamer.at), legs: 'stand', spine: { bend: 10 },   // hold pass: she stands 11 cm nearer (layout.js PREP.jadeAt): her arms were straight and short of the reamer
        head: { look: [PREP.reamer.at[0], COUNTER_H, PREP.reamer.at[1]] },
        // hold pass (2026-11-26): her right palm presses the half's dome on its far shoulder (30 deg past the top, the palm
        // square to the rind there, fingers over it and down, the heel and wrist raised toward her so the wrist clears the
        // rind); the half sits on the cone's tip (build.js PREP_HALF_Y). Her left palm steadies the juicer on its rim in front
        // of her (her forearm clear of the handle), fingers along the rim away from the handle and
        // tipped 14 deg down so her wrist clears the rim, rolled 20 deg (little
        // finger side up: the solved hand rolled that side into the dish) (the rim: 4.5 cm above the counter;
        // the palm 6 mm over it, the rolled hand's ring side lower)
        R: prepPress(), L: graspArms('restOn', { centre: PREP.reamer.at, at: [PREP.reamer.at[0] - 0.866 * (PREP.reamer.r - 0.006), COUNTER_H + 0.0535, PREP.reamer.at[1] - 0.5 * (PREP.reamer.r - 0.006)], axis: [-0.471, -0.243, 0.848], up: [-0.410, 0.912, 0.033], label: 'juicer (glass reamer)', hand: 'flat' }, { Lh: LH(1.65), side: 'L' }).L },
      friend: { at: PREP.friendAt, yaw: 90, legs: 'stand', spine: { bend: 6 }, head: { look: [PREP.punch.at[0], 1.0, PREP.punch.at[1]] },
        R: 'side',   // replaced in build.js by the ladle grip (shot.ladle)
        L: { to: [4.27, COUNTER_H + 0.30, 8.27], hand: 'relax', palm: 'down', fingers: [1, -0.4, 0.2] } } });   // his left hand steadies the punchbowl at its rim
function rcFigs(phase) {
  const f = crowd({ noPoi: true, drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'G1', 'H1', 'E1'] });
  // group A moves off the door's path to the glass console (they were between it and the front door)
  const AC2 = [4.05, 3.05]; for (const [k, at] of [['A1', [3.8, 3.25]], ['A2', [4.32, 3.42]], ['A3', [4.3, 2.78]]]) { const yaw = yawTo(at, AC2);
    f[k] = { ...f[k], at, yaw, head: { look: [AC2[0], 1.55, AC2[1]] } };
    // hold pass (2026-11-26): the cup arm is re-aimed for the new yaw (it kept the old yaw's offset: the cup sank into the body)
    for (const n of ['L', 'R']) if (f[k][n]?.hold) f[k][n] = cupArm(n, yaw); }
  const jy0 = yawTo(RC.kitchen, RC.K1);
  f.jade27 = phase === 0 ? { at: RC.kitchen, yaw: jy0, legs: 'stand', head: { look: 'K1:eyes' }, L: 'side', R: cupArm('R', jy0) }
    : phase === 2 ? { at: RC.stop, yaw: 2, legs: 'stand', head: { look: 'R1:eyes' }, L: 'side', R: cupArm('R', 2) }
    : { at: RC.door2, yaw: 180, legs: 'stand', head: { look: 'N3:eyes' }, L: 'side', R: { to: [3.86, 1.32, 0.42], hand: 'flat', fingers: 'up', palm: [0, 0, -1], elbow: [-1, -0.6, 0] } };
  f.K1 = stand(RC.K1, yawTo(RC.K1, RC.kitchen), { head: { look: phase === 0 ? 'jade27:eyes' : [3.55, 1.6, 6.45] }, cup: 'R' });
  f.R1 = phase === 2 ? stand(RC.R1, -105, { head: { look: 'jade27:eyes' }, R: { to: 'self:chest', off: rel(-105, -0.2, 0.0, 0.26), hand: 'palmUp', palm: 'up' } })
    : stand(RC.R1, 20, { head: { look: [SHELF_W.cube(3, 3)[0], 1.3, SHELF_W.front] } });
  // hold pass (2026-11-26): his hands REST on the snacks they hover over (both stand on the counter): right palm on the
  // popcorn bowl's rim (layout.js PARTY_FOOD, rim 0.55 r above the counter), left hand flat on the top of the bag of chips
  const rimY = COUNTER_H + 0.55 * 0.12, bagTop = COUNTER_H + 0.08;
  f.friend = stand([4.05, 6.70], 90, { spine: { bend: 24 },   // 5 cm nearer, bend 12 -> 24 (hold pass): his straight arms stopped short of the snacks
    head: { look: [4.57, 0.95, 6.55] },
    R: graspArms('restOn', { centre: [4.57, rimY, 6.40], at: [4.475, rimY, 6.42], axis: [1, 0, 0], up: [0, 1, 0], label: 'snacks (bowl of popcorn)', hand: 'flat' }, { Lh: LH(1.73), side: 'R' }).R,
    L: { ...graspArms('restOn', { centre: [4.57, bagTop, 6.78], at: [4.50, bagTop, 6.76], axis: [1, 0, 0], up: [0, 1, 0], label: 'snacks (bag of tortilla chips)', hand: 'flat' }, { Lh: LH(1.73), side: 'L' }).L,
      hand: { shape: 'flat', thumb: { opp: 0, sweep: 30, abd: -10, mcp: -10, ip: -5 } }, tip: { finger: 'middle', at: [4.60, bagTop + 0.009, 6.76] } } });   // placed by the middle fingertip: a free hand is turned by the natural-wrist rule, a tip hand is not
  const FL_AWAY = [0.85, 3.30], B1_AWAY = [1.50, 3.30];
  if (phase === 0) f.firstLove27 = stand([3.95, 3.86], 25, { head: { look: [SHELF_W.cube(1, 3)[0], 1.45, SHELF_W.front] }, L: 'side', R: 'side' });
  else { f.firstLove27 = stand(FL_AWAY, 90, { head: { look: 'B1:eyes' }, L: 'side', R: cupArm('R', 90) });
    f.B1 = stand(B1_AWAY, -90, { head: { look: 'firstLove27:eyes' }, L: 'side', R: { to: 'self:chest', off: rel(-90, -0.2, 0.0, 0.26), hand: 'palmUp', palm: 'up' } }); }
  if (phase === 0) { f.N1 = onGrade([4.15, -1.5], 0, { head: { look: [4.3, 1.6, 0] } }); f.N2 = onGrade([4.62, -1.78], 0, { head: { look: [4.3, 1.6, 0] } }); }
  if (phase === 2) { f.N1 = stand([3.75, 1.35], 20, { head: { look: [1.6, 1.2, 1.0] } }); f.N2 = stand([4.35, 1.55], -10, { head: { look: [2.2, 1.4, 3.5] } });
    f.N3 = onGrade([4.1, -2.4], 0, { head: { look: [4.3, 1.6, 0] } }); f.N4 = onGrade([4.7, -2.7], 0, { head: { look: [4.3, 1.6, 0] } }); }
  if (phase === 3) { f.N1 = stand([3.55, 2.55], 60, { head: { look: [4.05, 1.55, 3.05] }, cup: 'R' }); f.N2 = stand([4.05, 2.35], 30, { head: { look: [4.05, 1.55, 3.05] } });
    f.N3 = stand([4.22, 0.3], -10, { head: { look: 'jade27:eyes' }, R: { to: [4.1, 1.3, 0.62], hand: 'flat', fingers: 'up', palm: [0, 0, 1] } }); f.N4 = stand([4.35, -0.15], -5, { head: { look: 'jade27:eyes' } }); }
  return f;
}
const RC_HIDE = ['ceiling', 'roof', 'gable end', 'living room ceiling light (flush glass dome)', 'kitchen ceiling light (flush glass dome)', 'dining pendant (paper drum)', 'exterior wall (SSW)', 'living room window (SSW) (glass)', 'dining window (SSW) (glass)', 'living room window (SSW) (sill)', 'dining window (SSW) (sill)', 'living room window (SSW) (mullion)', 'dining window (SSW) (mullion)'];
const RC_CAM = { lens: 27, pos: [-2.4, 8.6, 3.7], target: [2.6, 0.3, 3.95] };
const rcShot = (id, phase, extra = {}) => ({ id, ...RC_CAM, space: 'room', time: '3:14.6-3:18.7', section: 'Verse 3', pos2: 'plan', amp: 115, crossing: true, rcKey: ROOM_CROSSING.keys[id] || extra.rcKey || null,
  hide: RC_HIDE, near: 0.5, far: 40, light: { amb: 1.0, litAmb: 1.4 }, figs: rcFigs(phase), ...extra });

// the pan across the Expedit (Jade, 2026-11-25): a lateral track, same lens, same height, level, spines filling the frame.
// Timeline: the -2sm render (media/karaoke_v2/lyrics_timed.json, FULL-MIX times; the instrumental-track times are ~0.1 s
// earlier and are in the sidecar too). "Beauty on this side" 159.62, "truth" 161.96, "Science fiction shelved with truth"
// 164.41-166.80. (The older v3 song map had 169.4 / 171.8 / 174.4-176.67.)
const TL = 'media/karaoke_v2/lyrics_timed.json (-2sm render), full-mix time (*_full); instrumental-track time = s/e';
const PAN = { lens: 35, y: 1.45, z: SHELF_W.front - 1.45 };
const panAt = (x) => ({ pos: [x, PAN.y, PAN.z], target: [x, PAN.y - 0.04, SHELF_W.front] });
const PAN_X = { a: (SHELF_W.beautyX[0] + SHELF_W.beautyX[1]) / 2, m1: SHELF_W.seam, b: SHELF_W.cube(4, 4)[0], c: SHELF_W.seam };
const PAN_FIGS = () => bridgeFigs({ at: [1.6, 3.1], yaw: 60, head: { look: [PAN_X.a, 1.4, SHELF_W.front] }, R: 'side' }, { at: [1.15, 4.3], yaw: 120, head: { look: [1.6, 1.5, 3.1] }, L: 'side' });
const panShot = (id, key, t0, t1, lyric, intent, extra = {}) => ({ id, lens: PAN.lens, ...panAt(PAN_X[key]), space: 'room', time: `${(t0 / 60 | 0)}:${(t0 % 60).toFixed(1).padStart(4, '0')}`, section: 'Bridge', pos2: 'inside',
  timing: { timeline: TL, start_s: t0, end_s: t1, lyric, v3_song_map_s: { a: [169.4, 171.8], m1: [171.8, 174.4], b: [174.4, 176.67], c: null }[key], move: 'lateral track along the Expedit face, level, same lens (35 mm) and height (1.45 m), 1.45 m from the frame front; camera X ' + PAN_X.a.toFixed(3) + ' (beauty half centre) -> ' + PAN_X.m1.toFixed(3) + ' (seam) -> ' + PAN_X.b.toFixed(3) + ' (cube 4,4) -> back to ' + PAN_X.c.toFixed(3) + ' (the seam: end frame, held)', her: 'NOT in frame (Jade, 2026-11-25 late: shelf only)' },
  header: `Bridge ${(t0 / 60 | 0)}:${(t0 % 60).toFixed(1).padStart(4, '0')}: "${lyric}" (pan across the Expedit, ${key})`, intent, figs: PAN_FIGS(), ...extra });

export const SHOTS = [
  // ================================================================ BRIDGE 2:34.5-2:52.5 (living room, late-afternoon daylight)
  { id: 'BR1', lens: 35, space: 'room', time: '2:34.5', section: 'Bridge', pos2: 'outside', amp: 100,
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 2.45 }, aim: ['jade27:eyes', 0.6, 0.36], focus: ['jade27'],
    header: 'Bridge 2:34.5: she taps on his arm and grins, to lens; he reads spines, back to us',
    intent: 'Outside, frontal, level, locked off, from the couch end. She faces the room in front of the truth half of the Expedit (the 2x2 with the printer and the opening to the kitchen at frame right); her hand taps on first love’s arm (he stands back to camera at frame left, reading the textbooks); the grin arrives before the line. Daylight from the WNW window behind the camera.',
    figs: bridgeFigs() },
  { id: 'BR2', lens: 50, space: 'room', time: '2:34.5-2:37.1', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4],
    header: 'Bridge 2:34.5: "Do you not see what I see?" sung to lens beside the shelf (synced, delighted)',
    intent: 'Outside. Same axis as BR1, tighter: her face in the 4:5 centre, the spines soft behind, his shoulder at frame left. Synced, to lens, delighted.',
    figs: bridgeFigs() },
  { id: 'BR3', lens: 20, space: 'room', time: '2:37.1-2:39.6 ("Does it matter what makes me me?")', section: 'Bridge', pos2: 'inside',
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 0.02 }, target: [2.0, 1.15, 0.6], hide: ['jade27'],
    header: 'Bridge 2:37.1: the guests’ blank stares, from her eyes (their faces are undrawn)',
    intent: 'Inside: her own view across the living room toward the front. Everyone has turned to look at her; no face is drawn, so the blank stares are literal. The couch under the WNW window in the late sun, the Noguchi table, the group by the glass table and the open front door.',
    figs: bridgeFigs({}, {}, { lookAt: 'jade27:eyes' }) },
  panShot('BRpan_a', 'a', 161.96, 163.19, 'truth by reference (start)',
    'Inside, square on to the Expedit, level: the frame full of the beauty half (art and literature, the object cubes between), the NNE end of the shelf at frame left. Start of a lateral track to frame right (SSW).',
    { move: { to: panAt(PAN_X.c), via: [{ ...panAt(PAN_X.m1), t_s: 163.19, beat: 'truth by reference: passing the seam' }, { ...panAt(PAN_X.b), t_s: 164.41, beat: 'science fiction shelved with truth: cube 4,4' }],
      arrive_s: 166.85, hold_to_s: 169.66, duration_s: +(169.66 - 161.96).toFixed(2), start_s: 161.96, end_s: 169.66, timeline: '-2sm full mix',
      note: 'starts on "truth by reference" (2:42.0), after the sweatshirt (mortongrove07) on "Beauty on this side" 2:39.6-2:42.0, per the plan; one lateral track; keys BRpan_m1 (seam, passing), BRpan_b (cube 4,4), END key BRpan_c: back to the seam on "From inside, I can\'t tell the difference" and held (Jade, 2026-11-25 late). The track reverses after b (our reading).' } }),
  panShot('BRpan_m1', 'm1', 163.19, 164.41, 'truth by reference',
    'Mid key of the track: the seam (the middle column, split art / science) on the centre line, beauty frame-left, truth frame-right.'),
  panShot('BRpan_b', 'b', 164.41, 166.8, 'Science fiction shelved with truth',
    'End key: the top-right cube (4,4) centred: the three red Feynman Lectures, a matched set, and beside them a run of small bright science-fiction paperbacks; the textbook cube (3,3) below-left, the Tux cube to the left.'),
  panShot('BRpan_c', 'c', 166.853, 169.66, 'From inside, I can’t tell the difference',
    'END frame of the track (Jade, 2026-11-25 late: "From inside, I can’t tell the difference" holds on the shelf, the pan landing on the seam): the middle column’s centre line, where art meets science, dead centre and held; beauty frame-left, truth frame-right, nobody in frame.'),
  { id: 'BR6', lens: 85, space: 'room', time: '2:49.7-2:52.5', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 1.75 }, aim: ['jade27:eyes', 0.5, 0.42],
    header: 'Bridge 2:49.7: "And I can’t give you proof", sung, held into the stop',
    intent: 'Outside, frontal, level, locked off, close. Synced; the last word rings into the hard stop. HS1 is this exact camera with the room removed.',
    figs: bridgeFigs({ yaw: 180, R: 'side' }, { L: 'side' }) },
  // ================================================================ HARD STOP 2:52.5-2:54.7
  { id: 'HS1', same: 'BR6', solo: ['jade27'], time: '2:52.5-2:54.7', section: 'Hard stop', sync: null,
    header: 'Hard stop 2:52.5: her face alone on bare paper (BR6’s camera, the room gone)',
    intent: 'Identical camera and pose to BR6; everything except her is removed. Bare paper with one thing left on it.',
    // hold pass (2026-11-26): only her figure is built (the others were hidden by solo anyway; T1's hand on the hidden ladle
    // was checked against nothing). Her pose is BR6's.
    figs: { jade27: jadeShelf({ yaw: 180, R: 'side' }) } },

  // ================================================================ VERSE 3 2:54.7-3:19.1 (the party at 115%; the sun going down)
  // V3a RESTAGED 2026-11-25 (r2 review, Jade): "this should be a time before the party where she and the childhood
  // friend are picking lemons and making a punch bowl of lemonade for the guests, no guests have arrived yet, it's early
  // in the day, the lemons should be pomelo shaped". Same camera (the deck's far corner, down the yard); the morning yard,
  // empty: she reaches up into the tree, the friend holds the bowl (V3b's staging, seen wide). No guests, no poi, no first love.
  { id: 'V3a', lens: 24, space: 'yard', time: '2:54.7-2:57.0', section: 'Before the party', pos2: 'outside', amp: 115,
    pos: [1.05, Y(1.6, DECK), 12.85], aim: ['jade27:eyes', 0.6, 0.46], far: 60, bowl: [10.537, Y(1.0, GRADE), 18.842],
    header: 'Verse 3 2:54.7: "Housewarming, lemonade from the yard": before the party (10:30), she and the childhood friend picking the pomelo-sized lemons, wide from the deck',
    intent: 'Wide from the deck’s far corner, down the empty morning yard: the stairs and the mint barrel, the strawberry bed, the lawn, the clothesline, and the giant lemon tree by the NNE fence with pomelo-sized lemons. She reaches up into the tree for one; the childhood friend (face never drawn) beside her holds the bowl with the first lemons in it. No guests yet, no poi, no first love.',
    figs: { jade27: jadeTree({ yaw: yawTo(TREE_MARK, TREE.at), head: { look: [10.4, Y(2.4, GRADE), 18.6] }, R: { to: [10.12, Y(1.85, GRADE), 18.35], hand: 'relax', palm: 'up', fingers: 'fwd' }, L: 'side' }),
      friend: onGrade([10.35, 18.55], 33, { head: { look: [10.9, Y(2.35, GRADE), 19.3] }, ...bowlHands([10.537, Y(1.0, GRADE), 18.842], 33) }) } },
  // V3b RESTAGED 2026-11-25 (late): Jade: the lemonade was made BEFORE the party: she and the childhood friend picked the
  // lemons; first love, Z and the guests had not arrived. So this is the picking, in the early-afternoon sun (section
  // 'Before the party', 10:30 since Jade's r2 review (was 14:00), OUR clock): her hand up to a lemon, the friend beside her holding the bowl. No first love
  // (he stood beside her here before: the conflict), no guests, no poi. Same camera and t as before.
  // 2026-11-25 (round 2): Jade: at "housewarming, lemonade from the yard" they pick the lemons AND prepare the lemonade
  // in the kitchen (juicer, rinds, mixing), like a botanical illustration. Two shots inside V3b's old slot (177.0-179.19):
  // V3b = the picking on "from the" (177.0-178.04), V3b_prep = the prep on "yard" (178.04-179.19), chronological.
  { id: 'V3b', lens: 24, space: 'yard', time: '2:57.0-2:58.0', section: 'Before the party',
    timing: { timeline: TL, line: 'Housewarming, lemonade from the yard', start_s: 177.0, end_s: 178.043, words: '"(lemon)ade from the"', was: '177.0-179.2 (V3b alone)' }, pos2: 'inside', amp: 115, hideParts: { jade27: ['head'] },
    pos: [9.85, Y(1.52, GRADE), 17.85], target: [10.3, Y(1.98, GRADE), 18.7], bowl: [10.537, Y(1.0, GRADE), 18.842],
    header: 'Verse 3 2:57.0 (memory, before the party, 10:30): picking the lemons with the childhood friend; her hand comes up to one (then V3b_prep)',
    intent: 'Inside: her view up into the tree, early afternoon, before anyone else has come. Pomelo-sized lemons in the sun; her hand rises into frame toward the nearest; just ahead of her the childhood friend (back to us, face never drawn) looks up into the tree, holding the bowl of the first lemons (below frame here; sidecar shows it). They will make the lemonade from these.',
    figs: { jade27: jadeTree({ yaw: yawTo(TREE_MARK, TREE.at), head: { look: [10.4, Y(2.4, GRADE), 18.6] }, R: { to: [10.12, Y(1.85, GRADE), 18.35], hand: 'relax', palm: 'up', fingers: 'fwd' }, L: 'side' }),
      friend: onGrade([10.35, 18.55], 33, { head: { look: [10.9, Y(2.35, GRADE), 19.3] }, ...bowlHands([10.537, Y(1.0, GRADE), 18.842], 33) }) } },
  // the lemonade prep (2026-11-25 round 2), MOVED (Jade r3 decisions 2026-11-26: "the counter by the sink"; "the making
  // from straight above at 2:58.0"; "the hand should be holding the ladle in a realistic way in the three.js model or image
  // models will be confused"). Straight down, ORTHOGRAPHIC, like the plates (artichoke, romanesco), on the counter by the
  // sink: the core-wall run's ESE end and the corner (layout.js PREP); the sink at frame right, the core wall at the top.
  // Frame: up = NNE (+X, toward the core wall), right = ESE end (+Z, the sink). The friend (face never drawn) stirs the
  // punchbowl with a steel LADLE in a real fist grip, thumb along the top of the handle (ladleGrip.js; the arm, hand pose
  // and ladle are solved together in build.js from where the ladle's bowl sits); postdoc Jade presses a half on the glass
  // reamer in the corner. The upper cabinets over this run are hidden (they sit between the lens and the counter).
  // Light: 10:30 sun (az 132, elev 36) through the kitchen window over the sink, falling across the counter.
  { id: 'V3b_prep', lens: 0, ortho: { w: 1.72 }, space: 'room', time: '2:58.0-2:59.2', section: 'Before the party', pos2: 'plan', amp: 115, dressing: 'prep',
    pos: [4.50, 2.30, 8.95], target: [4.50, 0, 8.95], up: [1, 0, 0], near: 0.05, far: 5,
    hide: ['upper cabinets (dark walnut)', 'upper cabinet doors (dark walnut)', 'upper cabinet doors (dark walnut) (pull)', 'kitchen ceiling light (flush glass dome)', 'ceiling'], light: { amb: 0.7, litAmb: 1.3 },
    subject: [4.5, COUNTER_H, 8.95], ladle: { who: 'friend', medial: [0, 0, -1], elbow: [3.96, 1.12, 8.86] }, hideParts: { jade27: ['head'], friend: ['head'] },
    timing: { timeline: TL, line: 'Housewarming, lemonade from the yard', start_s: 178.043, end_s: 179.19, words: '"yard" (held to the line end; V3c follows at 179.2)' },
    header: 'Verse 3 2:58.0 (memory, before the party, 10:30): the lemonade being made on the counter by the sink, flat-lay from straight above (botanical plate)',
    intent: 'Inside the memory, straight down on the counter by the sink, morning sun from the window over the sink falling across it. Frame right: the sink, and the water pitcher beside it. Top right: the glass reamer in the corner with a pomelo-sized half pressed on it under her hand, a bowl of picked lemons (two still with leaves), a small bowl of squeezed rinds. Middle: a cutting board with two halves cut across (ten segments, pith, seeds: the botanical cross-section), the knife. Left: the giant glass punchbowl half full of lemonade with lemon slices, the childhood friend stirring it with a steel ladle: his right hand is a closed fist round the ladle’s handle, fingers wrapped round it, his thumb lying along the top of the handle, the ladle’s bowl down in the lemonade and its hooked end rising past his thumb; his left hand rests on the counter. Only hands and forearms enter, from the bottom edge. Paint it like the artichoke plate: engraved line, pale ground, one gold accent at most.',
    figs: prepFigs() },
  { id: 'V3c', lens: 50, space: 'yard', time: '2:59.2-3:03.8', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: -12, el: -2, dist: 3.0 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Verse 3 2:59.2: "Perky American girl / I play the part": the greeting in the sliding door (one pitch contour)',
    intent: 'Outside, frontal on her from the deck, past the greeting guest’s back. She stands in the open sliding glass door, the kitchen and the dining table behind her: wave a little too big and a few frames early. The house shades the deck; she is lit by the sky and the kitchen behind. The gold pitch contour is drawn over the greeting.',
    figs: partyFigs({ at: MARKS.greeting, yaw: 0, legs: 'stand', head: { look: 'G1:head' }, L: 'side', R: { to: [0.92, 1.86, 9.86], hand: 'flat', fingers: 'up', palm: [0, 0, 1], elbow: [-1, -0.6, 0] } },
      stand([2.6, 7.0], -150, { head: { look: [1.2, 1.5, 9.4] } }),
      { set: { G1: onDeck([1.9, 10.7], yawTo([1.9, 10.7], MARKS.greeting), { head: { look: 'jade27:eyes' }, L: { to: [1.95, DECK + 1.9, 10.35], hand: 'flat', fingers: 'up', palm: [0, 0, -1] } }) } }) },
  // V3d (under the lemons, over his shoulder) RETIRED 2026-11-25 (late) -> V3_nailed: Jade: at "He said I absolutely
  // nailed it" she stands by the Expedit and first love stands close and whispers to her. Verse-3 light (18:25: no sun
  // indoors, ceiling lights on, dusk in the windows). Back of his head only. -2sm full mix 183.847-185.98.
  { id: 'V3_nailed', lens: 50, space: 'room', time: '3:03.8-3:06.0', section: 'Verse 3', pos2: 'outside', amp: 115, focus: ['jade27'],
    pos: [SHELF_MARK[0] + 0.6, 1.64, SHELF_MARK[1] - 2.02], aim: ['jade27:eyes', 0.6, 0.42],
    timing: { timeline: TL, line: 'He said I absolutely nailed it', start_s: 183.847, end_s: 185.98, instrumental_track_s: null },
    header: 'Verse 3 3:03.8: "He said I absolutely nailed it": by the Expedit, first love leans in and whispers to her (back of his head)',
    intent: 'Outside, over first love’s right shoulder (back of his head only, frame left, close to her ear). She stands by the Expedit, in front of its truth half, facing the room; he has stepped in close at her right and bends to whisper. We do not hear it; she listens at 115%, eyes to the room, the grin coming. Ceiling light, dusk in the front window behind the camera; guests at the couch and the glass table out of focus.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: { at: SHELF_MARK, yaw: 195, legs: 'stand', head: { look: [3.6, 1.5, 0.9], tilt: 6 }, L: 'side', R: cupArm('R', 195) },
      firstLove27: { at: HE_NAIL, yaw: yawTo(HE_NAIL, SHELF_MARK), legs: 'stand', spine: { bend: 15, side: -8 }, head: { look: 'jade27:earR', tilt: -10 }, L: 'side',
        // Jade (r2 review): "maybe his hand and arm could be up to imply whispering": his right hand raised, cupped between his mouth and her right ear
        // hold pass (2026-11-26): a gesture, not a grip: the hand is cupped ('relax' with the cup's curls) a few mm off her
        // hair, touching nothing, so the hold check does not take it for a hand holding her
        R: { to: 'jade27:earR', off: [0.07, -0.03, -0.035], hand: { shape: 'relax', curl: { index: [30, 28, 12], middle: [32, 30, 12], ring: [34, 32, 14], little: [36, 34, 16] } }, palm: [-0.91, 0, 0.41], fingers: 'up', elbow: 'down' } } } },
  // Jade (2026-11-25): on "I nod, past hour reviewed" the camera PUSHES IN to her temple; spectrograms of her voice follow.
  // Timeline -2sm full mix: line 189.11-191.52, "nod," 189.23-189.79. MOVED 2026-11-25 (round 2): Jade: the nod is at the
  // SHELF, straight after the "nailed it" whisper (it was never under the lemon tree). She stands on her shelf mark as in
  // V3_nailed, caught mid-nod (head 14 deg down); first love has straightened and turned back to the Expedit (OUR
  // staging, so that from her left he is back / three-quarter rear only). Same lens, dolly in; _a = start
  // (medium close-up), _b = end (extreme close-up). Sidecar `face_marks` gives the eye / temple px in each frame.
  // the eye variants are RETIRED 2026-11-25 (late): Jade chose the temple
  ...['temple'].flatMap((k) => { const at = k === 'temple' ? 'jade27:templeL' : 'jade27:eyeL', az = k === 'temple' ? 62 : 32, d1 = k === 'temple' ? 0.19 : 0.13;
    const base = { lens: 50, space: 'room', section: 'Verse 3', pos2: 'inside', amp: 115, faceMarks: true, focus: ['jade27'], near: 0.03, far: 60,
      timing: { timeline: TL, line: 'I nod, past hour reviewed', line_s: [189.11, 191.52], nod_word_s: [189.231, 189.79], push_in: [189.11, 191.52], instrumental_track_s: { line: [189.122, 191.537], nod: [189.243, 189.802] } },
      figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: { at: SHELF_MARK, yaw: 195, legs: 'stand', head: { look: [3.3, 1.45, 1.2], nod: 14, turn: -8 }, L: 'side', R: cupArm('R', 195) },
        firstLove27: heShelf({ at: [3.22, 3.80], yaw: 12, head: { look: [SHELF_W.cube(2, 4)[0], 1.55, SHELF_W.front] }, L: 'side' }) } };
    const lab = k === 'temple' ? 'her left temple, three-quarter toward profile' : 'her left eye, three-quarter';
    return [
      { id: `V3_rev_${k}_a`, ...base, time: '3:09.1', orbit: { at, rel: 'jade27', az, el: 2, dist: 0.85 }, aim: [at, 0.5, 0.42],
        move: { to_shot: `V3_rev_${k}_b`, kind: 'dolly in along the same line, same 50 mm lens', start_s: 189.11, end_s: 191.52, timeline: '-2sm full mix' },
        header: `Verse 3 3:09.1: "I nod, past hour reviewed": push-in start, ${lab} (medium close-up)`,
        intent: `Start of the push-in, at the shelf right after the whisper: her head and shoulders, ${lab}, mid-nod; behind her the Expedit under the ceiling light and first love back at the spines (back of his head only).` },
      { id: `V3_rev_${k}_b`, ...base, time: '3:11.5', orbit: { at, rel: 'jade27', az, el: 2, dist: d1 }, aim: [at, 0.5, 0.5],
        header: `Verse 3 3:11.5: "...reviewed": push-in end, extreme close-up on ${lab}`,
        intent: `End of the push-in: ${lab} fills the frame; the overlay (the review, then the spectrograms of her voice) begins here.` }]; }),
  // 2026-11-25 (round 2): with the whisper (3:03.8) and the nod (3:09.1) both at the shelf, she cannot be under the tree in
  // between: V3e is now a CUTAWAY to the poi from the same place (no her, no first love), not her point of view. OPEN.
  { id: 'V3e', lens: 40, space: 'yard', time: '3:06.0-3:09.1', section: 'Verse 3', pos2: 'outside', amp: 115,
    // Jade r3 (2026-11-26): "cut away to the poi spinner; the stairs should be descending next to the wall of the house":
    // the poi frame-left of centre so the stairs (rebuilt along the ESE wall, layout.js STAIRS) are in frame at the right
    pos: [9.55, Y(1.5, GRADE), 17.75], aim: [[POI.at[0], POI.centreY, POI.at[1]], 0.36, 0.5], subject: [POI.at[0], POI.centreY, POI.at[1]],
    header: 'Verse 3 3:06.0: "fifteen percent above amplitude": the fire poi, the second light (cutaway; she is at the shelf)',
    intent: 'Cutaway (was her point of view from under the tree; she is now at the shelf from 3:03.8 to 3:11.5). The poi spinner on the lawn, seen from behind and to the side, performing toward the audience lined along the house’s ESE wall and on the deck, two circles of fire lighting them. Behind them, frame right: the wooden stairs run DOWN ALONG THE HOUSE WALL from the deck to the lawn (a single flight against the wall, under the kitchen window, railing on its open side). From here on the poi is the light source.',
    figs: crowd() },
  { id: 'V3f', lens: 50, space: 'yard', time: '3:11.6-3:12.8 ("Hug durations"; the spectrogram plate takes "pitch contours" 3:12.8-3:14.6, or intercut)', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: -30, el: 4, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4], focus: ['jade27'],
    header: 'Verse 3 3:11.6: "Hug durations": a hug on the deck, gold ticks counting it',
    intent: 'Outside on her face over the hugged guest’s shoulder (guest back to us). Her arms round the guest, chin over the shoulder, eyes to lens-side: counting. Gold ticks accumulate along the top of the embrace.',
    figs: partyFigs({ at: MARKS.hug, floor: DECK, yaw: 0, legs: 'stand', spine: { bend: 6 }, head: { look: [1.65, DECK + 1.62, 12.5] },
        L: { to: 'H1:waist', off: [0.06, 0.22, 0.17], hand: 'flat', palm: [0, 0, -1], fingers: [-1, 0, 0] }, R: { to: 'H1:waist', off: [-0.1, 0.1, 0.17], hand: 'flat', palm: [0, 0, -1], fingers: [1, 0, 0] } },
      onDeck([3.55, 10.45], 120, { head: { look: [7, GRADE + 1.4, 16] } }),   // r3: moved off the (rebuilt) stairs
      { set: { H1: onDeck([2.75, 11.15], -165, { spine: { bend: 6 }, head: { look: [3.6, DECK + 1.5, 9.8] },
        L: { to: 'jade27:waist', off: [-0.1, 0.12, -0.17], hand: 'flat', palm: [0, 0, 1], fingers: [-1, 0, 0] }, R: { to: 'jade27:waist', off: [0.08, 0.2, -0.17], hand: 'flat', palm: [0, 0, 1], fingers: [1, 0, 0] } }) } }) },
  // V3g (high angle from the kitchen corner on the OLD route) RETIRED 2026-11-25 (round 2): the route it showed is gone.
  // Jade (2026-11-25): an overhead of the crossing for "Room crossing velocity" (-2sm full mix 194.59-198.72 s), overlaid with
  // diagrams, equations and her calculations. REBUILT 2026-11-25 (round 2) on Jade's sequence (layout.js ROOM_CROSSING):
  // kitchen talk -> doorbell -> front door, welcome 2 -> back toward the kitchen, stopped at the shelf by R1 -> doorbell ->
  // front door again. Motion mostly in the living room, the kitchen at frame right. Sidecar `crossing` = legs, stops,
  // real and song times, px. V3_rcv_obl (middle key, S2) is THE shot; _k0 / _k3 are its start and end keys; _legs draws
  // the legs as arrows (diagnostic, not for the painter). V3_rcv: orthographic reference, true scale.
  { id: 'V3_rcv', lens: 0, ortho: { w: 12.6 }, space: 'room', time: '3:14.6-3:18.7', section: 'Verse 3', pos2: 'plan', amp: 115, crossing: true, legs: true, rcKey: 'reference (S2, with the legs)',
    pos: [2.45, 14, 4.2], target: [2.45, 0, 4.2], up: [1, 0, 0], hide: ['ceiling', 'roof', 'gable end', 'living room ceiling light (flush glass dome)', 'kitchen ceiling light (flush glass dome)', 'dining pendant (paper drum)'], near: 0.5, far: 30,
    light: { amb: 1.05, litAmb: 1.45 },
    reference: true, header: 'REFERENCE ONLY: "Room crossing velocity", orthographic overhead with the three legs as arrows (true scale)',
    intent: 'Straight down, NNE up the frame, the front (WNW) at left, the kitchen at right. A true-scale reference for the overlay data, not a shot: the three legs (L1 kitchen -> front door, L2 back toward the kitchen, stopped at the shelf, L3 back to the door) and the four stops. She is at S2.',
    figs: rcFigs(2) },
  rcShot('V3_rcv_obl', 2, { frontDoorDeg: 0,
    header: 'Verse 3 3:14.6: "Room crossing velocity" (middle key): stopped by the shelf as R1 speaks; N1 and N2 just in the door',
    intent: 'THE shot (Jade): steep oblique from above the SSW side, walls, ceiling and roof cut away like a doll’s house, the living room filling the frame, the kitchen at frame right (the punchbowl, the fridge by the 2x2, food on the dining table). Early in the party; guests are arriving. This middle key: she was heading back to the kitchen from the front door and has stopped by the Expedit, head turned to R1, who has said something; the two guests she just welcomed stand inside the door. The childhood friend (face never drawn) is helping in the kitchen, refilling the snack bowls on the counter; first love, who was at the shelf a moment ago, now stands by the side window talking with a guest, his back to us. The whole move (sidecar `crossing`): kitchen -> door -> stop -> door, ~4.7x time-lapse inside 4.13 s, gold vectors drawn by the compositor.' }),
  rcShot('V3_rcv_obl_k0', 0, { frontDoorDeg: 0,
    header: 'Verse 3 3:14.6: "Room crossing velocity" (start key): talking with K1 in the kitchen, before the doorbell',
    intent: 'Same camera. Start: she stands just inside the kitchen by the opening, talking with K1 (a guest) by the dark-beige fridge; the childhood friend refills the snack bowls on the counter behind her; first love is at the Expedit for a moment, back three-quarter to us, looking along the art books; N1 and N2 are on the front walk outside (heads above the front wall). The doorbell rings at 194.85 s.' }),
  rcShot('V3_rcv_obl_k3', 3, { frontDoorDeg: 85,
    header: 'Verse 3 3:18.4: "Room crossing velocity" (end key): at the front door again (open wide), welcoming N3 and N4',
    intent: 'Same camera. End: she is back at the front door, now open wide, stepping back with a hand up in welcome; N3 is stepping in, N4 on the threshold; N1 and N2 have joined the group by the glass console; R1 is back at the spines; first love is still by the side window with the guest, his back to us; the friend is still at the snacks.' }),
  rcShot('V3_rcv_obl_legs', 2, { frontDoorDeg: 0, legs: true, rcKey: 'diagnostic: the legs as arrows over the middle key',
    header: 'DIAGNOSTIC: "Room crossing velocity", the three legs as arrows (L1 gold, L2 blue, L3 magenta) and the four stops (rings)',
    intent: 'Not a shot: V3_rcv_obl with the legs drawn on the floor so the vectors read. L1 kitchen -> front door (doorbell), L2 front door -> toward the kitchen, stopped at the shelf (R1 speaks), L3 back to the front door (doorbell again). Rings: S0 kitchen, S1 door, S2 shelf stop, S3 door.' }),
  { id: 'V3h', lens: 0, ortho: { w: 27.5 }, space: 'plan', time: 'plan / overlay reference for 3:14.6-3:19.1 (was v3 3:24-3:29)', section: 'Verse 3', pos2: 'plan', amp: 115, path: true,
    pos: [6.35, 25, 9.55], target: [6.35, 0, 9.55], up: [1, 0, 0], hide: ['ceiling', 'roof', 'gable end'], near: 0.5, far: 40, light: { amb: 1.25, litAmb: 1.6 },
    header: 'Verse 3 3:14.6 (reference): top-down plan of 345B and the yard: her path as one line (shelf, opening, sliding door, deck, stairs, lemon tree)',
    intent: 'Plan view, NNE up the frame, the front (WNW) at left, the yard (ESE) at right. Her whole route from the shelf to the lemon tree is one line; the review’s gold schematics overlap this. Also the reference plan for every other mv10 shot.',
    // r3 (Jade: first love was never under the lemon tree): the principals at the shelf (V3_nailed marks), not under the tree
    figs: partyFigs({ at: SHELF_MARK, yaw: 195, legs: 'stand', L: 'side', R: 'side' }, { at: HE_NAIL, yaw: yawTo(HE_NAIL, SHELF_MARK), legs: 'stand', L: 'side', R: 'side' }) },

  // ================================================================ SILENCE 3:19.1-3:23.4 (dusk gone; the poi)
  // MOVED INDOORS 2026-11-26 (Jade r3: "move SI1 indoors"; first love was never under the lemon tree). She stands just
  // inside the open sliding door (kitchen side), facing into the house and the lens; behind her, through the doorway and
  // over the deck railing, the fire poi on the lawn. The lens is swung 9 deg off the poi-her line so the poi sits beside
  // her, NOT behind her head, and the poi's swept circles are NOT drawn (poiTrail: false; r3 fault: they painted as a
  // gold ring round her head, against KEYFRAMES 6.6): only the two flames. First love stands at her left, just inside the
  // fixed glass panel, back to the lens, watching the fire (never face-on). Night: ceiling lights in the kitchen light her face.
  ((S) => { const az = +(yawTo(POI.at, S) - 9).toFixed(1), d = [POI.at[0] - S[0], POI.at[1] - S[1]], dl = Math.hypot(...d), u = [d[0] / dl, d[1] / dl], HE = [+(S[0] + 0.3 * u[0] - 0.42 * u[1]).toFixed(3), +(S[1] + 0.3 * u[1] + 0.42 * u[0]).toFixed(3)];
    const lens = [S[0] + 1.4 * Math.sin(az * Math.PI / 180), 1.55, S[1] + 1.4 * Math.cos(az * Math.PI / 180)];
    return { id: 'SI1', lens: 85, space: 'room', time: '3:19.1-3:23.4', section: 'Silence', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'], poiTrail: false,
      orbit: { at: 'jade27:eyes', az, el: 0, dist: 1.4 }, aim: ['jade27:eyes', 0.5, 0.42], near: 0.05,
      header: 'Silence 3:19.5: "I think he’s right. Honestly." close, hushed, back at 100% (indoors, at the open sliding door)',
      intent: 'Outside, frontal, level, locked off, close, INDOORS: she stands just inside the open sliding glass door, facing into the kitchen and the lens; she has turned from him to us. Night outside: through the doorway beside her, over the deck railing, the two flames of the fire poi on the dark lawn (flames only, off to the side of her head: no ring, no halo, nothing gold round her head). The kitchen ceiling light on her face; first love at frame edge beside her, back to the lens, watching the fire. One cut from 115 to 100: lighter line, no gesture. Synced, hushed, last word unpitched.',
      figs: { ...crowd({ drop: ['G1', 'H1'] }), jade27: { at: S, yaw: az, legs: 'stand', head: { look: lens }, L: 'side', R: 'side' },
        firstLove27: { at: HE, yaw: yawTo(HE, POI.at), legs: 'stand', head: { look: [POI.at[0], POI.centreY, POI.at[1]] }, L: 'side', R: cupArm('R', yawTo(HE, POI.at)) } } }; })(MARKS.silence),

  // ================================================================ CHORUS 2b 3:34.2-3:43.0 (back at the shelf; night, ceiling lights)
  { id: 'C2a', lens: 70, space: 'room', time: '3:34.2-3:39.6', section: 'Chorus 2b', pos2: 'outside', amp: 100, sync: 'anti', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: yawTo(SHELF_MARK, HE_C2) + 42, el: 3, dist: 2.1 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Chorus 2b 3:34.2: "I open my mouth, my voice goes blind": mouth open, not moving with the vocal; eyes bright (over his shoulder)',
    intent: 'The anti-sync shot, over first love’s shoulder (back of his head, frame left). Her mouth opens and holds; she is thinking it at him. Behind her the truth half of the Expedit under the ceiling light; night in the windows. Hold it long.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: jadeC2({ head: { look: 'firstLove27:eyes', turn: 20 } }), firstLove27: heC2() } },
  { id: 'C2b', lens: 30, space: 'room', time: '3:39.6-3:43.0', section: 'Chorus 2b', pos2: 'inside', amp: 100,
    orbit: { at: 'firstLove27:wristL', az: 85, el: 48, dist: 0.95 }, aim: ['firstLove27:wristL', 0.45, 0.74], subject: [SHELF_MARK[0] + 0.3, 1.2, SHELF_MARK[1] - 0.28],
    header: 'Chorus 2b 3:39.6: her hand taps on his forearm; he looks down at it (from behind his shoulder)',
    intent: 'Inside, close, from above and behind his left shoulder: the back of his head tipped down, his bare left forearm held out (its hair clearly visible), her empty hand tapping on it; neither of them holds a cup. The percussion is her. Third of the film’s hands-on-a-forearm, the only one that is hers.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: jadeC2(), firstLove27: heC2() } },

  // ================================================================ SET REFERENCE (not a film shot)
  // the glass console from about the angle of Jade's photo 2 (inputs/refs_semicircletable/); no figures. The photo-1 and
  // photo-3 test angles are retired; the side-by-side is media/layout/mv10/T0_glasstable_compare.png.
  { id: 'T0_glasstable', lens: 28, pos: [4.34, 1.15, 3.1], target: [4.74, 0.35, 2.25], near: 0.05, far: 20, space: 'room', section: 'Bridge', time: 'reference', position: 'reference', figs: {},
    header: 'reference: the glass console from its SSW end (photo 2)', intent: 'Set reference for the glass-top console (layout.js GLASS_TABLE), from about the angle of Jade\u2019s photo 2.' },
  // the ladle grip (Jade r3: a REALISTIC grip, zoom-checked): two set references, not film shots. _a: perspective close-up
  // from his right, above (the fist, the thumb along the top of the handle, the ladle's bowl in the lemonade); _top: the
  // V3b_prep camera zoomed to the hand (orthographic, straight down, 0.42 m across).
  { id: 'T0_ladlegrip_a', lens: 50, pos: [4.78, 1.60, 8.12], target: [4.36, 1.26, 8.56], near: 0.03, far: 8, space: 'room', section: 'Before the party', time: 'reference', position: 'reference', dressing: 'prep',
    ladle: { who: 'friend', medial: [0, 0, -1], elbow: [3.96, 1.12, 8.86] }, hide: ['upper cabinets (dark walnut)', 'upper cabinet doors (dark walnut)'], hideParts: { jade27: ['head'] }, light: { amb: 0.8, litAmb: 1.4 },
    header: 'reference: the friend\u2019s grip on the ladle (V3b_prep), close, from his right', intent: 'Set reference for the ladle grip (ladleGrip.js).', figs: prepFigs() },
  { id: 'T0_ladlegrip_b', lens: 50, pos: [3.98, 1.78, 8.92], target: [4.40, 1.24, 8.52], near: 0.03, far: 8, space: 'room', section: 'Before the party', time: 'reference', position: 'reference', dressing: 'prep',
    ladle: { who: 'friend', medial: [0, 0, -1], elbow: [3.96, 1.12, 8.86] }, hide: ['upper cabinets (dark walnut)', 'upper cabinet doors (dark walnut)'], hideParts: { jade27: ['head'] }, light: { amb: 0.8, litAmb: 1.4 },
    header: 'reference: the friend\u2019s grip on the ladle (V3b_prep), over his right shoulder', intent: 'Set reference for the ladle grip (ladleGrip.js).', figs: prepFigs() },
  { id: 'T0_ladlegrip_top', lens: 0, ortho: { w: 0.42 }, pos: [4.42, 2.30, 8.56], target: [4.42, 0, 8.56], up: [1, 0, 0], near: 0.05, far: 5, space: 'room', section: 'Before the party', time: 'reference', position: 'reference', dressing: 'prep',
    ladle: { who: 'friend', medial: [0, 0, -1], elbow: [3.96, 1.12, 8.86] }, hide: ['upper cabinets (dark walnut)', 'upper cabinet doors (dark walnut)', 'upper cabinet doors (dark walnut) (pull)', 'ceiling'], hideParts: { jade27: ['head'], friend: ['head'] }, light: { amb: 0.8, litAmb: 1.4 },
    header: 'reference: V3b_prep zoomed on the ladle hand (straight down)', intent: 'Zoom check of the top-down grip.', figs: prepFigs() },
];

// resolve copies
for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// her housewarming outfit (Jade, 2026-11-25) in every party shot: black jacket (long sleeves) over a black tee, black
// boot-cut yoga pants, socks (colour ASSUMED mid-grey). build.js housewarming() adds the tee sliver, the meatball marker
// and the flare. Also before the party (V3a, V3b, V3b_prep): ASSUMED same outfit, socks outdoors (OPEN: Jade has not answered).
export const JADE_HOUSEWARMING = { outfit: 'housewarming', top: 0x1b1b1e, legs: 0x151517, sock: 0x8c8c90, sleeves: 'long' };
for (const s of SHOTS) if (s.figs?.jade27) s.figs.jade27 = { ...s.figs.jade27, costume: JADE_HOUSEWARMING };

// beam mask twins: every camera has a `beam_<id>` twin (every light that is on in the shot, together) and one per real
// light with a shaft or a footprint: beam_<id>__sun (shafts through the openings, while the sun is up) and
// beam_<id>__poi (verse 3 on). Ceiling fixtures are omni and have no mask. The old __lamps / __dusk twins are gone.
import { maskTwins } from '../_beam.js';
{ const base = SHOTS.filter((s) => !/_legs$/.test(s.id) && !/^T0_/.test(s.id)), twins = maskTwins(base, { surf: true });
  const on = (s, k) => { const sec = SECTION_KEY[s.section] || 'bridge', L = SECTION_LIGHT[sec]; return k === 'sun' ? L.sun && SUN[sec].up : L[k]; };
  const per = base.flatMap((s) => ['sun', 'poi'].filter((k) => on(s, k)).map((k) => ({ ...s, id: `beam_${s.id}__${k}`, beamMask: true, beamOnly: k, header: `beam mask for ${s.id}: ${k} only` })));
  SHOTS.push(...twins, ...per); }
