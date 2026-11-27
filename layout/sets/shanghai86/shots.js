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
// French doors onto the continuous balcony; the room is 10.5 m. Winter-morning sun (21 Dec 1986, 09:30, CHEATED lower (round-3 decisions; was 08:30 honest, moved
// from Jade's 09:30 so her face is lit) from the SE (34.6 deg east of the facade normal), 17 deg high, slants in
// north-west across the couch group: her face and hands, the table, the steam and the uncle's hands are lit.
import { PLACES, DOOR, TABLE } from './layout.js';
import { HINGE_Y } from './joinery.js';
import { graspArms } from '../../engine/grasp.js';
const HINGE_MID = HINGE_Y(DOOR.h - 0.01)[1];

const deg = (r) => r * 180 / Math.PI;
const yawTo = (from, to) => deg(Math.atan2(to[0] - from[0], to[1] - from[1]));   // yaw 0 faces +z (the windows), 90 faces +x
const [JX, JZ] = PLACES.jadeSit, JY = PLACES.jadeYaw * Math.PI / 180, FWD = [Math.sin(JY), Math.cos(JY)], LEFT = [Math.cos(JY), -Math.sin(JY)];
const H = PLACES.uncleHands, F = PLACES.focus;
// ---------------------------------------------------------------- poses
// state A: the uncle on the front edge of the couch's north seat, west of her; his left hand cupped palm-up in the light with
// the small thing in it, his right thumb and index pinching it from above (two hands that read apart from above)
const UYAW = yawTo(PLACES.uncleSeat, [H[0], H[2]]), UF = [Math.sin(UYAW * Math.PI / 180), Math.cos(UYAW * Math.PI / 180)], ULF = [Math.cos(UYAW * Math.PI / 180), -Math.sin(UYAW * Math.PI / 180)];   // ULF: his left (r5 wrists)
const BALL = [H[0], H[1] + 0.0197, H[2]];   // hold pass: the ball's centre on the palm skin (build.js ballAt; was 0.024, 3 mm over the palm)
// r3 (Jade: "watch face should be visible"; the face sits on the back of the wrist, opposite the palm): the hands are
// swapped so the WATCH hand is the one palm-DOWN: his RIGHT hand cups palm-up, his LEFT (wristwatch) pinches from above,
// so its back of the wrist and the watch face turn up toward her
const uncleShape = (o = {}) => ({ costume: { sock: 0xb8bcc0 }, at: PLACES.uncleSeat, legs: 'seat', legOpts: { seatH: 0.42 }, yaw: UYAW, spine: { bend: 40 }, head: { look: BALL },
  R: { to: H, hand: { shape: 'cup', spread: 10, curl: { index: [20, 22, 10], middle: [24, 26, 12], ring: [28, 30, 14], little: [32, 34, 16] } }, palm: 'up', fingers: [UF[0] + 0.25 * ULF[0], 0.05, UF[1] + 0.25 * ULF[1]] },   // r5 wrists (engine-body): fingers 0.25 to his left (was radial +8 deg past the range; now flex 37, radial 14)
  L: { tip: { finger: 'index', at: [BALL[0], BALL[1] + 0.013, BALL[2]] }, hand: { shape: 'pinch', spread: 14, curl: { middle: [40, 50, 25], ring: [55, 65, 32], little: [70, 80, 40] } }, palm: 'down', fingers: [UF[0] - 0.25 * ULF[0], -0.35, UF[1] - 0.25 * ULF[1]] }, ...o });   // r5 wrists: fingers 0.25 to his right (was ulnar +13 deg past; now flex 24, ulnar 26, pronation 66)
// hold pass (2026-11-26): the small thing lies IN his cupped right palm (build.js places it from the solved palm) and his
// left index pad rests on its top; both hands are checked against it (engine/main.js holdsFor: `grasp` / `object`)
const UNCLE_LH = 0.108 * 1.70, BALL_R = 0.012;
const uncleHold = (o = {}) => { const U = uncleShape(o);
  return { ...U, R: { ...U.R, grasp: 'palmUnder', object: 'something small' },
    L: { ...U.L, tip: { finger: 'index', at: [BALL[0], BALL[1] + BALL_R + 0.045 * UNCLE_LH - 0.0012, BALL[2]] }, grasp: 'tipOn', object: 'something small' } }; };
// she sits CROSS-LEGGED at her spot (round 2 answers: cross-legged in BOTH scenes), watching his hands across the table
// corner; his hands are held low (8 cm over the table top) so she looks a little down into them
const jadeWatch = (o = {}) => ({ at: PLACES.jadeStand, legs: 'cross', yaw: yawTo(PLACES.jadeStand, [H[0], H[2]]), spine: { bend: 8 }, head: { look: BALL }, L: 'lap', R: 'lap', ...o });
// state B: she sits CROSS-LEGGED (Jade, decision page) facing the table and the windows (south), working on the table's
// north-west corner
const C = [JX + FWD[0] * 0.36, JZ + FWD[1] * 0.36];   // in front of her, over the table's north edge
const HOLD_Y = 0.45;   // cross-legged her eyes are ~0.52 m up, only 10 cm over the table top: the sheet is held low and nearly flat so her face shows
const hold = (dz) => ({ L: { to: [C[0] + LEFT[0] * dz, HOLD_Y, C[1] + LEFT[1] * dz], hand: 'pinch', palm: 'in', fingers: 'fwd' }, R: { to: [C[0] - LEFT[0] * dz, HOLD_Y, C[1] - LEFT[1] * dz], hand: 'pinch', palm: 'in', fingers: 'fwd' } });
// hold pass (2026-11-26): her right index pad rests on a piece lying on the table's north edge (the gen-8 piece there, or in
// the after shots the half she put down at PD), the table carrying it (engine/grasp.js tipOn; checked with `object`). The old
// palm target (F - 0.09) was 4 cm beyond a three-year-old's reach: the arm fell short and the fingertips sank 6 mm into
// the table edge. Her spine leans 40 deg (was 30) so the fingertip reaches 8 mm inside the table edge (it lands 1.2 cm short of
// LAY_TIP, the pad behind the tip)
const LAY_TIP = [F[0] - 0.05, TABLE.h + 0.0031, F[2] - 0.11];   // y: the paper's top + 2.5 mm (the slanted pad sits under the tip centre)
// r6b (Jade, REF_beam: "little Jade's wrists are in kinda unnatural positions"): the after-pose reached for the table
// 0.4 m away (left arm fully straight, past its reach; right index on the piece, both wrists flexed ~60 deg) with a
// 40 deg lean. Look-only reference photos (small children sitting on the floor with something small in their hands):
// hands low in the lap or close in front of the chest, elbows bent and down, wrists near straight. LAP: both hands rest
// palm-down on her crossed legs, fingers along the forearm (forward, a little outward); lean 15 deg.
const LAP = { L: { to: 'lap', hand: 'relax', palm: [0, -1, 0], fingers: [FWD[0] + 0.3 * LEFT[0], -0.2, FWD[1] + 0.3 * LEFT[1]] },
  R: { to: 'lap', hand: 'relax', palm: [0, -1, 0], fingers: [FWD[0] - 0.3 * LEFT[0], -0.2, FWD[1] - 0.3 * LEFT[1]] } };
const lay = { L: { to: [F[0] + 0.1, 0.445, F[2] - 0.06], hand: 'relax', palm: 'down', fingers: 'fwd' },
  // r5 wrists (engine-body): the fingers point forward AND in toward her left (0.6 LEFT) and less steeply down (-0.3): was
  // straight forward at -0.6, flexion +4 / ulnar +14 deg past the range; now flex 52, radial 0, pronation 36 deg
  R: { ...graspArms('tipOn', { centre: LAY_TIP, at: LAY_TIP, up: [0, 1, 0], axis: [FWD[0] + 0.5 * LEFT[0], 0, FWD[1] + 0.5 * LEFT[1]], fingers: [FWD[0] + 0.5 * LEFT[0], -0.6, FWD[1] + 0.5 * LEFT[1]], palm: [-0.6 * (FWD[0] + 0.5 * LEFT[0]), -1, -0.6 * (FWD[1] + 0.5 * LEFT[1])], label: '草纸' }, { Lh: 0.112 * 0.95, side: 'R' }).R } };
const jadeSit = (n = 8, o = {}) => ({ at: PLACES.jadeSit, legs: 'cross', yaw: PLACES.jadeYaw, spine: { bend: n <= 2 ? 14 : 15 }, head: { look: n <= 2 ? [C[0], 0.5, C[1] + 0.06] : 'focus' }, ...(n === 1 ? hold(0.1) : n === 2 ? hold(0.15) : LAP), ...o });   // r6b: after-pose = LAP (was lay, bend 40)
// ---------------------------------------------------------------- r3: tiny pieces (Jade's r2 review)
// She tears ONE TINY piece in half again and again (tiny ~1-3 cm, the tiniest ~5 mm), thumbs on top, index fingers under,
// the two pinches side by side a finger's width apart. One piece, followed through the shots (build.js paperProps):
//   P0 = generation 6 of a sheet (~2 x 3 cm). V1c / V1d_1: P0 mid-rip. V1d_2: its halves (gen 7, ~1.5 x 2 cm): the right
//   hand puts its half down on the table (PD), the left still holds its half up. V1d_4: that kept half ripped again
//   (gen 8, ~1 cm), the put-down half lying at PD. V1d_8: a gen-10 bit (~5 x 7 mm) between her fingertips, as small as
//   she can go. V1h: a little heap of the tiniest bits on the clear patch, the big stack nearby.
const P0 = { gen: 6, seed: 606 };
const PD = [F[0] - 0.05, F[2] - 0.118];   // where her right hand puts its half down (inside the table's north-west corner; hold pass: was F + (-0.07, 0.02), out of her reach, now 12 mm inside the north edge, under her right fingertip in the after shots)
const pinchArm = (at, side, o = {}) => ({ tip: { finger: 'index', at }, hand: { shape: 'pinch', spread: 4, curl: { middle: [30, 40, 20], ring: [40, 50, 25], little: [50, 60, 30] } }, palm: 'in', fingers: [FWD[0], -0.25, FWD[1]], ...o });
// hold pass (2026-11-26): the pinches are checked against the piece they hold (`grasp` / `object`, engine/main.js holdsFor);
// build.js paperProps lays the piece in the plane between the thumb and index pads (was: a fixed tilt, which ran the paper
// through the pads, so nothing held it)
const pinchPair = (d, y, gap, PYo) => { const c = [JX + FWD[0] * d, JZ + FWD[1] * d], T = { grasp: 'pinch', object: '草纸: the tiny pieces' };
  // r5 wrists (engine-body): each hand's fingers turn 0.3 in toward the other hand and rise (y 0.5): straight forward and
  // down (-0.25) put both wrists 23 deg (V1c: 49 deg) past ulnar deviation; now V1d: flex 2, radial 9; V1c: ext 16, ulnar 18
  const PI = 0.3, PY = PYo ?? 0.5;
  return { L: pinchArm([c[0] + LEFT[0] * gap / 2, y, c[1] + LEFT[1] * gap / 2], 'L', { ...T, fingers: [FWD[0] - LEFT[0] * PI, PY, FWD[1] - LEFT[1] * PI] }),
    R: pinchArm([c[0] - LEFT[0] * gap / 2, y, c[1] - LEFT[1] * gap / 2], 'R', { ...T, fingers: [FWD[0] + LEFT[0] * PI, PY, FWD[1] + LEFT[1] * PI] }) }; };
const RIP_C = [JX + FWD[0] * 0.36, 0.47, JZ + FWD[1] * 0.36];   // the hands' meeting point for the POV rips (just off the table's north edge)
// r6b: the rips were held at arm's length (0.36 m out, 0.47 m up: elbows 10 deg, arms locked straight). Now close in
// front of her chest over her crossed legs, elbows bent ~75 deg and down, wrists near straight (ext 16, radial 11 deg) (reference photos, NOTES r6); RIP_C stays the
// POV cameras' orbit centre (camera positions unchanged), they aim at RIP_H.
const RIP_H = [JX + FWD[0] * 0.26, 0.32, JZ + FWD[1] * 0.26];   // low, over her crossed legs
// her gaze passes through the pinches to a point just beyond them (the eyes ~18 cm from the hands would converge 16 deg,
// read as crossed in a guide; check_bodies MIN_LOOK 25 cm)
const RIP_LOOK = [JX + FWD[0] * 0.37, 0.21, JZ + FWD[1] * 0.37];
const ripSit = (gap, o = {}) => ({ at: PLACES.jadeSit, legs: 'cross', yaw: PLACES.jadeYaw, spine: { bend: 8 }, head: { look: RIP_LOOK }, ...pinchPair(0.26, 0.32, gap), ...o });
// r6c (Jade on V1d_2: "the wrist is weird"): the right arm reached ~0.4 m nearly straight (elbow 5 deg, past its reach 1.08),
// the upper arm raised 134 deg, the wrist flexed 51 / radial 16 deg. Decision (Jade via the lead): MOVE HER, not PD (PD and
// the laid half stay put for V1d_4 on). In V1d_2 only, she has shuffled 10 cm forward and 2 cm to her left (V1D2_D) up to
// the table corner, sitting more upright (lean 16, was 26). Look-only reference photos (toddlers at a table at chest-chin
// height putting small things down, scratchpad refs/): close in to the table, elbow bent and low, the hand hooked over the
// edge, wrist near straight. Right hand: soft, nearly flat fingers coming over the table's north edge toward the corner (fingers
// FWD + 0.9 LEFT, a little up: the curled index lands on the half), elbow bent ~72 deg below the table top (elbowAt);
// scanned ~300 variants with clipcheck (scratchpad scan*.txt). The table top (0.42) is at her chin when she sits
// cross-legged, so the upper arm is raised to about shoulder height (no support possible: PD is 12 mm from the edge).
// Left hand (the kept half): the same close-in pinch, carried with her. Gaze: at the put-down spot (her eyes are only
// ~12 cm from it, so the look point lies 30 cm out along the same line, as RIP_LOOK does).
const V1D2_D = [FWD[0] * 0.10 + LEFT[0] * 0.02, FWD[1] * 0.10 + LEFT[1] * 0.02];
const V1D2_AT = [JX + V1D2_D[0], JZ + V1D2_D[1]];
const shiftTip = (a, d) => ({ ...a, tip: { ...a.tip, at: [a.tip.at[0] + d[0], a.tip.at[1], a.tip.at[2] + d[1]] } });
const V1D2_RF = [FWD[0] + 0.9 * LEFT[0], 0.3, FWD[1] + 0.9 * LEFT[1]];
// the index curls down a little more than the other fingers, so its pad is the lowest point (a 'relax' hand put the curled
// middle/ring 5-6 mm into the table top)
const V1D2_RH = { shape: 'flat', spread: 3, curl: { index: [20, 25, 15], middle: [10, 12, 6], ring: [12, 14, 7], little: [14, 16, 8] } };
const V1D2_C = [RIP_C[0] + V1D2_D[0], RIP_C[1], RIP_C[2] + V1D2_D[1]], V1D2_H = [RIP_H[0] + V1D2_D[0], RIP_H[1], RIP_H[2] + V1D2_D[1]];
// gaze: from her eyes (measured in this pose: V1D2_EYE) toward the put-down spot (LAY_TIP, her index pad on the half), 30 cm out
// and 6 cm lower (~11 deg down: onto her hand on the table edge). Exactly on the line, the head pitches up enough that the
// held half (laid from her left pinch) cuts 80 mm through her left hand in clipcheck; 6 cm lower it is the usual 7.9 mm
const V1D2_EYE = [-1.664, 0.414, -3.634];
const V1D2_LOOK = (() => { const d = [LAY_TIP[0] - V1D2_EYE[0], LAY_TIP[1] - V1D2_EYE[1], LAY_TIP[2] - V1D2_EYE[2]], n = Math.hypot(...d); return d.map((v, i) => V1D2_EYE[i] + v / n * 0.3 - (i === 1 ? 0.06 : 0)); })();
const V1D2_JADE = ripSit(0.016, { at: V1D2_AT,
  L: shiftTip({ ...pinchPair(0.26, 0.32, 0.016).L, fingers: [FWD[0] - LEFT[0] * 0.3, 0.8, FWD[1] - LEFT[1] * 0.3] }, V1D2_D),
  R: { ...graspArms('tipOn', { centre: LAY_TIP, at: LAY_TIP, up: [0, 1, 0], hand: V1D2_RH, palm: [0, -1, 0], fingers: V1D2_RF, label: '草纸' }, { Lh: 0.112 * 0.95, side: 'R' }).R, object: '草纸: the tiny pieces',
    elbowAt: [LAY_TIP[0] - 0.17 * V1D2_RF[0] - 0.05 * LEFT[0], 0.36, LAY_TIP[2] - 0.17 * V1D2_RF[2] - 0.05 * LEFT[1]] },
  spine: { bend: 16 }, head: { look: V1D2_LOOK } });
// r6b had (before r6c): at PLACES.jadeSit, R: lay.R (fingers FWD + 0.5 LEFT, -0.6), spine bend 26, look RIP_LOOK
const HEAP = [F[0] + 0.03, F[2] + 0.05];
const AFTER = { laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }], bits: { at: HEAP, r: 0.03, gens: { 9: 4, 10: 10, 11: 22 } } };
const V1H_MID = [HEAP[0], 0.43, HEAP[1] + 0.15];
// the hall doorway (r3, Jade: the relatives were NOT in the room: "it was a surprise to them, they're just poking their
// heads in through the hallway"): they stand in the hall just past the threshold beside Mother, leaning in to look
const DOORWAY_HEADS = [1.55, 1.3, -6.15];
const M = PLACES.mother;
// r6 (Jade, V1e: "is her hand clipping through a door?"): YES, it was. Clip check on the r5 pose: hand 22.5 mm into the
// north wall's jamb, 12.4 mm into the jamb lining, the wrist/forearm 20.5 mm through the folded-back door leaves (they
// stand in the hall against the jamb, x 0.27-0.37), 12.9 mm into the room-side architrave; her slippers 9 mm into the
// raised teak threshold. Re-staged (scanned ~150 variants with clipcheck): she stands 6 cm further into the doorway, ON
// the threshold (floor 0.018), her right palm flat on the west jamb's lining (face x 0.270) at about head-minus-a-hand
// height, fingers up and leaning back toward the hall (palm 9 deg off flat, 0.8 mm contact), the elbow down beside the
// jamb in the doorway (so the forearm stays clear of the folded leaves). Every wrist angle in range.
// r6b (Jade, REF_beam: "mom's wrist ... kinda unnatural"): the palm pressed flat with the fingers straight up bent the
// wrist back and pushed the elbow out. Re-posed from look-only reference photos (women in doorways, a hand on the frame at
// chest-shoulder height, elbow down by the body, wrist nearly straight; NOTES r6). A right palm on the WEST jamb only sits
// neutral (thumb up) when the forearm points toward the hall, so: she stands on the threshold 13 cm nearer the jamb, the
// hand at shoulder height (palm centre y 1.18) on the lining, fingers up and back toward the hall, softly bent, the elbow
// down and in front of her hip (elbowAt), the forearm rising along the frame. Left arm hanging, fingers in a soft curl.
// clipcheck: palm contact -0.5 mm, no clips; every joint in range.
const MAT = [M[0] - 0.13, M[1] + 0.12];
const SOFT_FLAT = { shape: 'flat', spread: 3, curl: { index: [8, 10, 5], middle: [10, 12, 6], ring: [12, 14, 7], little: [14, 16, 8] } };
const mother = (o = {}) => ({ at: MAT, floor: 0.018, legs: 'stand', yaw: -50, spine: { bend: 3 }, head: { look: 'jade3:head' },
  R: { to: [DOOR.x0 + 0.047, 1.18, DOOR.z - 0.07], hand: SOFT_FLAT, palm: [-1, 0, 0], fingers: [0, 0.6, -0.8], elbowAt: [DOOR.x0 + 0.2, 0.9, DOOR.z + 0.12] }, L: { to: 'side', hand: 'relax' }, costume: { sock: 0x8a8478 }, ...o });   // r6a had: at M + (0, 0.06), hand flat at y 1.27, fingers [-0.079, 0.851, -0.52], elbowAt [x0 + 0.2, 0.87, z]; r5: fingers into the room, elbow out (clipped the jamb and the door leaves)
// r4 (Jade, r3 review of V1f): "the adults should be peeking to look at where she currently sits, not just vaguely in the
// room ... wearing socks inside slippers ... maybe the camera position should be over the shoulder shot of mom looking at
// toddler into the room and we see the backs of their heads". They stay in the hall / on the threshold (r3: not in the
// room). The west bookcase run ends 0.07 m from the west jamb, so only from the doorway's middle can anyone see her
// spot (-1.77, -3.89) past the bookcase's end (corner (0.18, -5.72)): every adult stands east of that sight line (each
// one's clearance is in NOTES), body turned to her and head looking at her head ('jade3:head'), leaning to peek.
// Positions are set out from the V1f camera (V1F_CAM) along its line to her: Mother nearest the camera, right of the
// line; the uncle beyond Mother's right shoulder, peering over; the grandmother stooping on the threshold left of the
// line; the aunt at the left, leaning in. Mother has stepped back into the hall from her V1e spot (flag).
const V1F_CAM = [2.9, 1.72, -7.05];
const MV1F = [2.16, -6.81], GM = [1.97, -6.12], AU = [2.39, -6.12], UL = [1.58, -6.76];
const JH = 'jade3:head';
const SOCKS = { mama86: 0x8a8478, grandma: 0x4a3e36, aunt: 0xb8a89a, uncle: 0xb8bcc0 };   // winter cotton socks (my choice; uncle: pale grey nylon, costume audit)
const sock = (who) => ({ costume: { sock: SOCKS[who] } });
const motherPeek = { at: MV1F, legs: 'stand', yaw: yawTo(MV1F, PLACES.jadeSit), spine: { bend: 6 }, head: { look: JH }, L: { to: 'side', hand: 'relax' }, R: { to: 'side', hand: 'relax' }, ...sock('mama86') };   // r6b: soft hanging hands (were splayed)
const grandma = { at: GM, legs: 'stand', yaw: yawTo(GM, PLACES.jadeSit), spine: { bend: 24, side: -6 }, head: { look: JH }, L: 'side', R: { to: 'self:mouth', off: [-0.05, -0.06, 0.04], hand: 'relax', palm: 'back' }, ...sock('grandma') };
const aunt = { at: AU, legs: 'stand', yaw: yawTo(AU, PLACES.jadeSit), spine: { bend: 14, side: 12 }, head: { look: JH }, R: { to: 'self:mouth', off: [-0.07, -0.04, 0.02], hand: 'relax', palm: 'back' }, L: 'side', ...sock('aunt') };
const uncleLaugh = { at: UL, legs: 'stand', yaw: yawTo(UL, PLACES.jadeSit), spine: { bend: 10, side: 10 }, head: { look: JH }, L: 'side', R: 'side', ...sock('uncle') };
const ALONE = (n, o) => ({ jade3: jadeSit(n, o), mama86: mother() });
const CROWD = (n, o) => ({ jade3: jadeSit(n, o), mama86: motherPeek, aunt, uncle: uncleLaugh, grandma });   // r4: the V1f staging
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
    intent: 'The whole joined room: glazed French doors along the whole south wall onto the balcony, the cheated 09:30 sun slanting in from the left across the room in bands (the piers between the bays throw the dark stripes), the child lit at the couch group, Mother in the wide hall doorway in shadow. Not a shot.' },
  { id: 'REF_doors', lens: 24, pos: [2.25, 1.35, -4.6], aim: [[1.3, 1.0, 0.3], 0.5, 0.5], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE: the south side: glazed French doors all along onto the continuous balcony; latches; white-painted iron railings (round-3 decisions)',
    intent: 'From the hall doorway looking south: four bays of steel French doors (two latched pairs per bay: cremone rod, lever handle, barrel bolts) along the whole wall, the balcony and its parapet beyond, the white wicker chair on the balcony, the cheated 09:30 sun coming in from the left. Not a shot.' },
  { id: 'REF_latch', lens: 28, pos: [1.9, 1.25, -2.0], aim: [[0.75, 0.95, 0.35], 0.5, 0.5], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE (round 2): a door latch close up (cremone bolt with lever handle; barrel bolts on the fixed leaf); the white railing beyond the glass',
    intent: 'Close on the meeting stiles of one pair of balcony doors. Not a shot.' },
  { id: 'REF_balcony', lens: 24, pos: [-0.55, 1.45, -1.5], aim: [[-2.55, 0.75, 0.95], 0.5, 0.5], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE (round-3 decisions): the balcony\'s west end: white wicker chair there, white-painted iron railings',
    intent: 'From inside, near the couch group, looking south-west out through bay 1: the white wicker chair at the west end of the balcony, the white-painted iron railing (handrail, square balusters, posts, on a low curb) along the front and returning at the end. Not a shot.' },
  { id: 'REF_beam', lens: 22, pos: [1.45, 1.35, -0.25], aim: [[-1.2, 0.5, -3.6], 0.5, 0.6], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE: from the doors, along the light', intent: 'The light from beside the doors: the couch group, the table and the child in it, Mother in the doorway beyond it. Not a shot.' },

  // r4 references (Jade's r3 review: real hinges on the hall doors, books vs shelving, the armchairs)
  { id: 'REF_hinges', lens: 28, pos: [1.25, 1.35, -6.0], aim: [[0.3, 1.1, -6.75], 0.5, 0.5], tissue: 8, figs: {},
    header: 'REFERENCE (r4): the west pair of hall doors folded back into the hall on brass butt hinges (jamb hinges + fold hinges), architraves',
    intent: 'From the doorway looking north-west into the hall: leaf A on the west jamb (three loose-pin butt hinges: five knuckles, ball-tipped pin, plates, screws), leaf B folded flat back against it on three more at the far edge, its lever handle and flush bolts. Not a shot.' },
  { id: 'REF_hinge_close', lens: 50, pos: [0.54, 1.18, -6.08], aim: [[0.28, HINGE_MID, -6.27], 0.5, 0.5], tissue: 8, figs: {},
    header: 'REFERENCE (r4): one jamb hinge close up (100 x 75 mm brass butt hinge, five knuckles, ball-tipped pin, three screws per plate)', intent: 'Not a shot.' },
  { id: 'REF_shelves', lens: 35, pos: [-1.35, 1.3, -3.2], aim: [[-1.35, 1.15, -6.1], 0.5, 0.5], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE (r4): the west bookcases, square on: plinth, panelled cupboards, ledge, glazed doors, shelf boards, books (individual spines)',
    intent: 'Elevation of the west bookcase run behind her spot, with the L armchair in front of it. Not a shot.' },
  { id: 'REF_armchairs', lens: 28, pos: [-0.2, 1.25, -2.1], aim: [[-1.75, 0.5, -3.6], 0.5, 0.5], tissue: 8, figs: ALONE(8),
    header: 'REFERENCE (r4): the couch group: three upholstered armchairs (tapered legs, rolled arms, loose cushions, crocheted covers), couch, table',
    intent: 'The couch group from the south-east: the L armchair north of the couch (behind her), the across armchair, the opposite armchair, the side table. Not a shot.' },
  // r6c (V1d_2 wrist): a third-person view of V1d_2's pose for Jade to judge the arm and wrist (not for painting)
  { id: 'REF_V1d_2_side', lens: 35, pos: [-1.9, 0.56, -2.0], target: [-1.7, 0.36, -3.66], figs: { jade3: V1D2_JADE, mama86: mother() },
    paper: { held: { L: { half: [P0.gen, P0.seed, 0], tilt: 25 } }, laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }] },
    header: 'REFERENCE (r6c): V1d_2 from her front-right at table height: both arms, the table corner, PD',
    intent: 'Third-person check of V1d_2: her right hand setting its half down flat at the table corner, her left hand holding its half close in. Not a shot.' },

  // ---------------------------------------------------------------- verse 1, 0:29.7-0:58.6
  { id: 'V1a', t: [29.74, 31.58], lens: 50, state: 'A', orbit: { at: 'jade3:eyes', az: yawTo(PLACES.jadeStand, [H[0], H[2]]) + 70, el: 4, dist: 1.3 }, aim: ['jade3:eyes', 0.4, 0.42], focus: ['jade3'],
    figs: { jade3: jadeWatch(), uncle: uncleHold() },
    header: '0:29.7 OUTSIDE "Three years old, uncle explains atoms" (header 1. Shanghai, 1986)',
    intent: 'Outside: frontal, level, locked off on her face, lit by the cheated 09:30 sun from the balcony doors behind the camera. She sits cross-legged at the table\'s north-west corner (as she will a week later), eyes on the uncle\'s hands; round-3 decisions (Jade: "the end of the couch"): he sits ON the couch, perched on its north end seat (the end nearest her), west of her, leaning in, his hands held out low beside her face in the last of the light; camera from her east-north-east; his head is out of frame, only his knees, arms and hands come in. He is west of her, so he cannot shade her face; the light only just reaches her face (its top edge crosses her head between brow and crown).' },
  { id: 'V1b', t: [31.58, 34.52], lens: 40, state: 'A', orbit: { at: 'ball', az: yawTo([BALL[0], BALL[2]], PLACES.jadeStand), el: 22, dist: 0.62 }, aim: ['ball', 0.5, 0.66], edgeNT: 0.12, ...INSIDE,
    figs: { jade3: jadeWatch(), uncle: uncleHold() },
    header: '0:31.6 INSIDE the uncle\'s hands shaping something small; his face is not in frame; his WATCH FACE visible',
    intent: 'Inside: her eye-line onto his two hands in the light: r3: the RIGHT hand cupped palm-up holding something small, the LEFT hand (wristwatch) pinching it from above with thumb and index, palm down, so the back of his left wrist and the round watch face turn up toward her (Jade: "watch face should be visible"). Forearms and knees, no face.' },
  //r6b: V1c (outside, across the table) keeps the piece held UP over the table edge (intent), but close to her chest: elbows ~64 deg, wrists ext 15 / dev 3; gaze through the piece to 46 cm (not crossed)
  { id: 'V1c', t: [34.52, 37.85], lens: 55, orbit: { at: 'jade3:eyes', az: PLACES.jadeYaw, el: 5, dist: 1.9 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'],
    figs: { jade3: { ...jadeSit(1), spine: { bend: 8 }, head: { look: [JX + FWD[0] * 0.46, 0.44, JZ + FWD[1] * 0.46] }, ...pinchPair(0.28, 0.47, 0.016, 0.9) }, mama86: mother() },
    paper: { rip: { ...P0, open: 12, tilt: 35 } },
    header: '0:34.5 OUTSIDE "A week later my mother finds me": a TINY piece, mid-rip',
    intent: 'Outside: frontal, level, locked off, across the coffee table from the window side. She sits cross-legged at the table\'s corner in the cheated 09:30 light, holding up a TINY piece of 草纸 (~2 x 3 cm) between the fingertips of both hands, in the middle of ripping it in half again (r3, Jade); the big stack and the torn bits on the table, the stray bit in her hair; the north wall and the hall doors behind her.' },
  { id: 'V1d_1', t: [37.85, 41.43], lens: 35, orbit: { at: RIP_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 50, dist: 0.4 }, aim: [RIP_H, 0.5, 0.62], ...INSIDE,
    figs: { jade3: ripSit(0.016), mama86: mother() }, paper: { rip: { ...P0, open: 5, tilt: 25 } },
    header: '0:37.9 INSIDE "sat in a snow drift of paper": a tiny piece, ripping it (gold dot x1)', intent: 'Inside (POV): her eye-line onto her own hands just off the table\'s north-west corner: a tiny piece (~2 x 3 cm) pinched between both thumbs and index fingers, the tear just starting between them. The table corner, its edges and the big stack beyond.' },
  // r6c: she has moved 10 cm forward / 2 cm left in this shot (V1D2_D), so her POV camera moves with her (same az / el / dist / lens)
  { id: 'V1d_2', t: [41.43, 43.34], lens: 35, orbit: { at: V1D2_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 50, dist: 0.4 }, aim: [V1D2_H, 0.5, 0.62], ...INSIDE,
    figs: { jade3: V1D2_JADE, mama86: mother() },   // r6b: the kept half's hand close in, fingers more upright (ulnar was +7 past)   // r5 wrists: leans 26 deg (ripSit 18) so the turned-in right hand still reaches PD; hold pass: her right index pad holds its half down on the table at PD (lay.R; build.js lays the half from the fingertip)
    paper: { held: { L: { half: [P0.gen, P0.seed, 0], tilt: 25 } }, laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }] },   // hold pass: the right half lies at PD under her right index pad (as in V1d_4 on), not laid from the fingertip
    header: '0:41.4 INSIDE "ripped to shreds": the two halves; she puts one down (gold dots x2)', intent: 'Same camera. The tiny piece torn in two (~1.5 x 2 cm each): her left hand still holds its half up, her right hand is setting its half down flat on the table corner.' },
  { id: 'V1d_4', t: [43.34, 45.43], lens: 35, orbit: { at: RIP_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 50, dist: 0.4 }, aim: [RIP_H, 0.5, 0.62], ...INSIDE,
    figs: { jade3: ripSit(0.013), mama86: mother() },
    paper: { rip: { from: [P0.gen, P0.seed, 0], open: 10, tilt: 25 }, laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }] },
    header: '0:43.3 INSIDE "Ever tinier": the kept half ripped in half again (gold dots x4)', intent: 'Same camera. The half she kept (~1.5 x 2 cm) pinched between both hands, ripped in half again (two ~1 cm bits, mid-rip); the other half lies flat where she put it down on the table corner. The table is a plain rectangle: its corner and two edges clear in frame.' },
  { id: 'V1d_8', t: [45.43, 48.14], lens: 50, orbit: { at: RIP_C, az: yawTo([RIP_C[0], RIP_C[2]], [JX, JZ]), el: 46, dist: 0.26 }, aim: [RIP_H, 0.5, 0.55], ...INSIDE,
    figs: { jade3: ripSit(0.009), mama86: mother() },
    paper: { rip: { gen: 11, seed: 1111, open: 14, tilt: 30, edge: 0.0015 }, laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }], bits: { at: [PD[0] + 0.05, PD[1] + 0.02], r: 0.02, gens: { 8: 2, 9: 3, 10: 3 } } },
    move: { kind: 'pan', to: 'V1d_8_end', note: 'POV: hold on her fingertips tearing the ~5 mm bit, then pan up and left across the room to Mother in the hall doorway (V1d_8_end is the end frame).' },
    header: '0:45.4 INSIDE "repeating what uncle said": POV close-up, the tiniest piece (start of the pan)', intent: 'Inside (POV, close): her two fingertip pinches, nearly touching, tearing a bit of 草纸 about 5 x 7 mm in half: as small as humanly possible. Behind, out of focus, the table corner and the put-down half.' },
  { id: 'V1d_8_end', t: [45.43, 48.14], lens: 35, pos: [JX + FWD[0] * 0.05, 0.56, JZ + FWD[1] * 0.1], aim: [[PLACES.mother[0], 1.05, PLACES.mother[1]], 0.5, 0.45], ...INSIDE,
    // hold pass (2026-11-26): her hands are out of this frame; twisted 35 deg toward Mother, the tearing pinches could not close
    // (nothing between them, wrists past range), so they come down into her lap. The table keeps V1d_8's pieces (was the
    // generation-8 layout)
    figs: { jade3: { ...ripSit(0.009), ...LAP, head: { look: [PLACES.mother[0], 1.4, PLACES.mother[1]] }, spine: { bend: 6, twist: 35 } }, mama86: mother() },   // r5 wrists: L palm down on her lap, fingers 15 deg off world +z (was 'lap': pronation +6 deg)
    paper: { laid: [{ half: [P0.gen, P0.seed, 1], at: PD, yaw: 20 }], bits: { at: [PD[0] + 0.05, PD[1] + 0.02], r: 0.02, gens: { 8: 2, 9: 3, 10: 3 } } },
    header: '0:47.5 INSIDE the end of the V1d_8 pan: across the room to Mother in the hall doorway', intent: 'Inside (POV, the end of the pan): from her eyes, low (cross-legged on the floor), across the room to Mother standing in the wide hall doorway, a hand on the jamb, out of the sun.' },
  { id: 'V1e', t: [48.14, 50.52], lens: 32, pos: [-0.5, 0.8, -0.25], aim: ['jade3:eyes', 0.3, 0.58], figs: ALONE(8), paper: AFTER, clip: { touch: [['mama86.handR', 'hall French doors (frame)']] },
    header: '0:48.1 "What on earth are you doing?": Mother in the doorway, beyond the reach of the beam',
    intent: 'Low, from the doors, looking into the room: the child frame left in the light, still looking down at the pieces; the light falls on the table and the floor in front of her and stops on the boards; Mother stands in the wide doorway frame right, out of the light. Mother\'s face is drawn.' },
  { id: 'V1f', t: [50.52, 53.93], lens: 30, pos: V1F_CAM, aim: ['jade3:head', 0.5, 0.6], figs: CROWD(8), paper: AFTER,
    header: '0:50.5 "The adults howl with laughter": over Mother\'s shoulder from the hall, the backs of their heads, looking in at her',
    intent: 'r4 (Jade): over-the-shoulder from the hall, just behind Mother (frame right, the back of her head and her left shoulder): the grown-ups crowd the wide doorway, NOT in the room, all turned to where the child sits and peeking past the end of the bookcase at her: the grandmother stooping on the threshold, a hand at her mouth, the aunt at the left leaning in, a hand at her mouth, the uncle beyond Mother\'s right shoulder peering over. We see the backs of their heads. Beyond them, down across the long room, the child small in the sun at the couch group, absorbed in her paper. Everyone in socks inside cotton-padded slippers. The folded-back hall doors on their brass hinges at the right edge.' },
  { id: 'V1g', t: [53.93, 55.15], lens: 85, orbit: { at: 'jade3:eyes', az: PLACES.jadeYaw, el: 0, dist: 1.6 }, aim: ['jade3:eyes', 0.5, 0.42], focus: ['jade3'],
    figs: ALONE(8, { head: { look: [JX + 1.2, 1.15, JZ + 0.7] } }), paper: AFTER,   // r3: a ~70 deg turn toward the doorway (frame right), the eyes do the rest
    header: '0:53.9 OUTSIDE "What\'s so funny?": her face, closer', intent: 'Outside: frontal, level, locked off, closer than V1c and shorter. Her eyes have come up off the paper toward the laughing adults at the hall doorway (behind her, to her left: frame right); nothing else moves in her face.' },
  { id: 'V1h', t: [55.15, 58.55], lens: 28, orbit: { at: V1H_MID, az: yawTo([V1H_MID[0], V1H_MID[2]], [JX, JZ]), el: 50, dist: 0.64 }, aim: [V1H_MID, 0.5, 0.5], ...INSIDE, steam: 'soft',   // round-3: the steam was reading as a stick in a mug in the top-down guides
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
