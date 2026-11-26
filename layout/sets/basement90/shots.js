// BASEMENT 1990 camera table. Times and section names are from "Proof — Music Video Plan.md", Structure (-2sm master
// times, analysis/m2sm/song_map.md; retimed from v3 2026-11-25, cuts placed on the -2sm sung onsets and the band stop).
//   2:16.1-2:19.8  Verse 2b: "2. Decatur, 1990. Bare feet on chair spokes, blue light, a small finger on the glass. One
//              word underlined in gold." (Jade 2026-11-25: NOT bare feet: she is in socks, Dad in socks and slippers, every shot.)
//   2:19.8-2:22.2  "Good catch!": drums stop (2:19.8): Dad's double take. (Jade 2026-11-25, replacing "she is already a cat under
//              the desk": she holds her RIGHT hand in a fist and pretends to lick her wrist, a cat cleaning itself; she
//              does NOT hide under the desk.) (then the kitchen)
// position: 'outside' = frontal, level, locked off on her face; 'inside' = along her eye-line, close.
// Fields as in attic88/shots.js, plus: chair { at, seatYaw, spoke0 }, hide [labels], contacts, time, position.
// NOTE on hands: this table was staged when the engine mis-built LEFT hands, so every hand that has to point or lie in
// a given direction here is a RIGHT hand (that is why Jade stands on Dad's left and points with her right). The engine
// was fixed in the integration pass (mannequin.js handFrame); left hands now honour `fingers` / `palm` too.
import { SCREEN, screenPoint, WORD_P, WORD_TIP, CHAIR, FEET, DESK, jadeOnSpokes, gp, PC, KB_TOP, KB_UP } from './layout.js';
import { graspArms } from '../../engine/grasp.js';
import { seatHip, JADE_BASEMENT, DAD_BASEMENT } from './house.js';
import { ankleLocal } from './kit.js';

// ---------------------------------------------------------------- recurring poses
const JYAW = 166, S = jadeOnSpokes(JYAW, 0.165, 0.03);
const mid = (a, b) => a.map((v, i) => (v + b[i]) / 2);
const KEYS = (dx) => gp([0.6 + dx, DESK.top + 0.05, -1.5]);
// Dad at the keyboard, facing the screen (-z)
// (hold pass 2026-11-26) his hands TYPE: each middle fingertip pad on a key of the home row (grasp 'tipOn' on the keyboard's
// tipped top face, KB_TOP / KB_UP), the other fingers loosely curled over the keys; was a relaxed palm 5 cm over the
// desk with the fingertips in the air. The keyboard rests on the desk (checked by engine/holdcheck.mjs).
const LH_DAD = 0.108 * 1.72, LH7 = 0.107 * 1.22;
const LIFT_L = 0.02, CURL_L = 12;   // hand lengths (PROP hand x height)
const DAD_SEAT_LIFT = 0.006;   // r4: his seat bones 6 mm up, onto the cushion (measured 6.5 mm into the seat's foam at 0)
const DAD_ELBOW_L = [-1.14, 0.8, -0.24], DAD_ELBOW_R = [-0.87, 0.8, -0.24];   // r4: his left elbow tucked in at his side, so she can stand beside him
const TYPE_HAND = { shape: 'relax', curl: { index: [34, 40, 20], middle: [30, 36, 18], ring: [36, 42, 22], little: [40, 46, 24] } };
const tap = (dx, side) => graspArms('tipOn', { centre: KB_TOP(dx, -0.012), at: KB_TOP(dx, -0.012), up: KB_UP, axis: [0, -KB_UP[2], -KB_UP[1]], finger: 'middle', hand: TYPE_HAND,
  fingers: [dx > 0 ? -0.15 : 0.15, -0.2, -1], label: 'keyboard' }, { Lh: LH_DAD, side })[side];
const dadTyping = (o = {}) => ({ costume: DAD_BASEMENT, at: CHAIR.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop) + DAD_SEAT_LIFT, footFwd: 0.47 }, yaw: 180, spine: { bend: 8, side: 10 }, head: { look: 'screen' },
  L: { ...tap(-0.09, 'L'), elbowAt: DAD_ELBOW_L }, R: { ...tap(0.09, 'R'), elbowAt: DAD_ELBOW_R }, ...o });
// Jade standing on the two spokes at Dad's left (right foot on the front spoke, left on the back one), leaning over
// the desk edge, RIGHT index finger on the glass at THE WORD, left hand on the desk
// r4: her head looks at WORD_TIP = her fingertip on the glass (Jade: "her eyes should be looking at the same place as her
// finger is pointing"); the fingertip itself is placed with `tip` (engine: puts the index tip, not the palm, on the point),
// the finger running along her arm's line from the shoulder. Spine twist -8 -> +10: the reaching (right) shoulder leads,
// so the straight arm runs from her right shoulder past the right side of her bowed head (Jade on B3: the arm "is not
// coming out of her shoulder at the correct angle").
const SH_R = [-1.24, 0.9, -0.21];   // r4: her right shoulder, read back from check_bodies.mjs (B3)
const JADE_ELBOW_R = SH_R.map((v, i) => v + (WORD_TIP[i] - v) * 0.5 + [0.02, -0.03, 0.01][i]);   // r4: elbow just under the shoulder-to-fingertip line, clear above his left hand
const TIP_DIR = (() => { const sh = SH_R, d = WORD_TIP.map((v, i) => v - sh[i]), l = Math.hypot(...d); return d.map((v) => v / l); })();   // shoulderR read back from the sidecar (B3 contacts)
const DESK_L = { at: [gp([0.2, 0])[0], DESK.top + LIFT_L, DESK.z1 - 0.07], hand: { shape: 'relax', curl: { all: [CURL_L, CURL_L * 1.4, CURL_L * 0.7] }, thumb: { opp: 0, sweep: 36, abd: -6, mcp: 0, ip: 0 } } };
const jadePointing = (o = {}) => ({ costume: JADE_BASEMENT, at: S.pelvis, legs: 'stand', yaw: JYAW, spine: { bend: 26, twist: 20 }, head: { look: WORD_TIP, pitchK: 0.8 },
  legOpts: { ankleR: ankleLocal(S.ankles.front, S.pelvis, JYAW, 'R'), ankleL: ankleLocal(S.ankles.back, S.pelvis, JYAW, 'L') },
  R: { tip: { finger: 'index', at: WORD_TIP }, hand: 'point', fingers: TIP_DIR, palm: 'down', elbowAt: JADE_ELBOW_R, grasp: 'tipOn', object: 'CRT monitor' },   // hold pass: the pad on the glass, checked against the monitor   // elbow low under her own chest line, not out toward Dad
  // (hold pass) the left hand rests on the desk top (grasp 'restOn'; was a flat palm 2 cm in the air): fingers a little
  // curled with their pads on the wood, the palm a few mm up so the heel of the hand / wrist clears the top, thumb level
  L: { ...graspArms('restOn', { centre: DESK_L.at, at: DESK_L.at, up: [0, 1, 0], axis: [0.3, 0, -1], hand: DESK_L.hand, label: 'desk' }, { Lh: LH7, side: 'L' }).L }, ...o });
const POINT = { dad: dadTyping(), jade7: jadePointing() };
// B2_face hides the monitor (the camera is behind the screen): nothing to check her fingertip against there; the same pose
// is checked in B0 / B1 / B3 (hold pass)
const POINT_B2 = { ...POINT, jade7: { ...POINT.jade7, R: { ...POINT.jade7.R, grasp: undefined, object: undefined } } };
// "Good catch!": Dad has rolled back and swivelled to his left, hands still over the keys, and does a double take at
// her: she has hopped off the spokes and stands on the open floor a step to his left, in the screen light, being a
// cat: RIGHT hand in a fist (a paw, bent down at the wrist), raised to her mouth, her closed lips and chin on the back
// of her wrist (r4, Jade 2026-11-26), head cocked.
// (Jade, decision page 2026-11-25: NOT under the desk; hiding reads as fearful.)
const CHAIR_GC = { at: gp([0.6, -0.98]), seatYaw: 222 };
const dadDouble = (o = {}) => ({ costume: DAD_BASEMENT, at: CHAIR_GC.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop) + DAD_SEAT_LIFT, footFwd: 0.46 }, yaw: CHAIR_GC.seatYaw, spine: { bend: 4, twist: 14 }, head: { look: 'jade7:eyes' },
  L: { to: gp([0.42, DESK.top + 0.2, -1.36]), hand: 'relax', palm: 'down' }, R: { to: KEYS(0.02), off: [0, 0.075, 0.02], hand: 'relax', palm: 'down', fingers: [0, 0, -1] }, ...o });
// her grooming pose. GROOM.at = pelvis [x, z], yaw (70: three-quarter toward Dad and the open room, her right side toward
// the open floor, i.e. toward the cameras).
// 2026-11-26 arm fix (Jade: "it really messes up kid Jade's arm"): a child's cat paw. The elbow hangs low in front of
// her right side (pole down and out, not forward), the upper arm runs down-forward from the shoulder, the forearm rises
// diagonally up and INWARD to the wrist in front of her chin, the loose fist droops forward-down from a wrist bent
// about 75 deg (was: elbow pushed forward at chest height, forearm vertical, fist sticking out level at a right angle).
// [r3 gap SUPERSEDED in r4, see below: her lips and chin now rest on the wrist; spine bend 28, look point 0.62 m.]
const GROOM = { at: gp([-0.25, -0.85]), yaw: 70, wrist: null };
{ const a = GROOM.yaw * Math.PI / 180, f = [Math.sin(a), 0, Math.cos(a)], r = [-Math.cos(a), 0, Math.sin(a)];
  const nrm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  const loc = ([fw, up, rt]) => f.map((v, i) => v * fw + r[i] * rt + (i === 1 ? up : 0));   // her frame: [forward, up, right]
  GROOM.fwd = f; GROOM.right = r;
  GROOM.look = [GROOM.at[0] + f[0] * 0.5, 0.62, GROOM.at[1] + f[2] * 0.5];   // head bowed toward the paw (a fixed point, so the mouth does not move with the hand); r4: 0.66 -> 0.62 with spine bend 12 -> 28, she hunches over the paw and puts her face on it
  GROOM.mouth = [-1.6878, 0.9162, 0.3006];   // re-render pass 2026-11-26: re-read on the MESH body (was [-1.665, 0.9521, 0.3183] on the mannequin: the wrist ended 3.6 cm above her mouth, across her eyes)
    // where her mouth ends up with this head (read back from the render: B5_cat sidecar contacts, mouth)
  // r4 (Jade, 2026-11-26, on B4 / B5: "she is pretending to lick her arm, not actually doing it ... mouth closed, tongue in.
  // lips and chin contacting wrist"; REPLACES the r3 gap): her closed lips and her chin rest on the back of her wrist.
  // The forearm rises diagonally inward across under her bowed face (direction GROOM.fore, read back from the render),
  // so its axis runs across the line from her lips to her chin; it is put through the point between them, 1 cm out
  // from the face (the mannequin's skull has no jaw: the long-sleeve cuff, r 2.2 cm, sinks about 1 cm into its smooth
  // jaw, which stands in for the soft hollow between lower lip and chin), and the wrist joint 1.5 cm on along the
  // forearm, so the contact is on the back of the wrist / sweater cuff, not on the hand. No tongue (none is modelled).
  GROOM.chin = [-1.733, 0.9168, 0.2667];   // (mesh; was [-1.7101, 0.9577, 0.2848])
    // read back (B5_cat sidecar contacts, chin)
  GROOM.fore = nrm([-0.281, 0.776, -0.565]);   // elbow -> wrist, read back (B5_cat sidecar: wristR - elbowR; iterated to convergence)
  { const mid = GROOM.mouth.map((v, i) => (v + GROOM.chin[i]) / 2), mc = nrm(GROOM.mouth.map((v, i) => v - GROOM.chin[i])), d = GROOM.fore;
    let n = nrm([d[1] * mc[2] - d[2] * mc[1], d[2] * mc[0] - d[0] * mc[2], d[0] * mc[1] - d[1] * mc[0]]);
    const head = [-1.7037, 1.0071, 0.3182];   // (mesh: the mannequin read-back moved with the mouth)   // read back (head centre)
    if (n.reduce((a, v, i) => a + v * (head[i] - mid[i]), 0) > 0) n = n.map((v) => -v);   // away from the face
    GROOM.contactP = mid.map((v, i) => v + n[i] * 0.01);
    GROOM.wrist0 = GROOM.contactP.map((v, i) => v + d[i] * 0.015); }
  GROOM.wristOff = GROOM.wrist0.map((v, i) => v - GROOM.mouth[i]);   // wrist centre from the mouth anchor
  GROOM.wrist = GROOM.mouth.map((v, i) => v + GROOM.wristOff[i]);
  GROOM.fingers = nrm(loc([0.7, -0.65, -0.2]));   // the paw drooping forward-down (and a little inward) from the bent wrist
  { const d = -GROOM.fingers[1]; GROOM.palm = nrm(GROOM.fingers.map((v, i) => -v * d - (i === 1 ? 1 : 0))); }   // palm down-back (the back of the wrist toward her mouth)
  GROOM.palmOff = GROOM.wristOff.map((v, i) => v + GROOM.fingers[i] * 0.26 * 0.107 * 1.22);   // palm centre = wrist + 0.26 hand lengths (engine)
  GROOM.palmC = GROOM.mouth.map((v, i) => v + GROOM.palmOff[i]);
  GROOM.elbow = nrm(loc([0.3, -0.8, 0.6])); }   // elbow pole: down and out to her right side, a little forward
// a loose fist (the engine's fist curled about 15 deg less, thumb less tight)
const PAW = { shape: 'fist', curl: { index: [72, 92, 50], middle: [76, 94, 52], ring: [80, 96, 54], little: [84, 96, 54] }, thumb: { opp: 0.6, mcp: 24, ip: 16, touch: 'middle.mid' } };
const jadeGroom = (o = {}) => ({ costume: JADE_BASEMENT, at: GROOM.at, legs: 'stand', yaw: GROOM.yaw, spine: { bend: 28, side: 4 }, head: { look: GROOM.look, pitchK: 1, tilt: 20 },
  R: { to: GROOM.palmC, hand: PAW, fingers: GROOM.fingers, palm: GROOM.palm, elbow: GROOM.elbow },
  L: 'side', ...o });
const GC = { dad: dadDouble(), jade7: jadeGroom() };

export const SHOTS = [
  // ---------------------------------------------------------------- set reference (not in the cut)
  { id: 'B0_plan', lens: 0, ortho: { w: 8.4 }, pos: [-0.55, 9, 0], target: [-0.55, 0, 0], up: [0, 0, -1], far: 12, near: 5, figs: POINT,
    hide: ['subfloor', 'floor joists', 'main beam', 'stairwell', 'kitchen wall above', 'stair landing', 'landing guard rail', 'pull chain', 'beam volume'],
    header: 'PLAN (ceiling off; Jade’s diagram 11-26): back wall at top; desk free mid-room, Dad on its front side; post, washer, 2 melons; stair along the front', intent: 'Set reference: plan of the basement from Jade’s diagram (2026-11-26) with the pointing blocking: the desk free in the middle, empty floor behind and left of it, the post at its back-right corner, the wringer washer right, two watermelons front-right, the stair along the front wall from the left wall (top) to x -0.37 (foot). Blue lines = where the desk stops cutting the screen light on the floor.' },
  { id: 'B0_wide', lens: 16, pos: [1.6, 1.4, 1.95], aim: [[-1.1, 0.5, -0.2], 0.5, 0.36], figs: POINT, time: 'reference', position: 'reference',
    header: 'MASTER (Jade’s diagram 2026-11-26): from the front-right corner: stair along the front wall at left, the desk free mid-room (Dad’s back, the screen), empty space behind it, post, wringer washer, 2 watermelons',
    intent: 'Set reference: the whole basement from the front-right corner, over the two watermelons: the stair along the front wall (frame left), the desk standing free in the middle with Dad and Jade at it, the empty floor behind and left of it, the lally post at the desk’s back-right corner, the 1950s wringer washer beyond. The screen and the ceiling bulb light it.' },
  // ---------------------------------------------------------------- 2:16.1-2:19.8 Verse 2b ("Basement" sung 2:16.1)
  { id: 'B1_feet', lens: 45, pos: gp([-0.55, 0.38, -0.5]), aim: [mid(FEET.front, FEET.back), 0.53, 0.62], figs: POINT, time: '2:16.1-2:17.2 Verse 2b', position: 'inside (detail)', subject: mid(FEET.front, FEET.back),
    header: 'Verse 2b 2:16.1: her socked feet standing on the chair’s five-star base, screen light from the desk', intent: 'Low and close from the open floor: her two feet in white socks (no shoes) standing with their weight on two legs of the chair’s black five-star base (r4, Jade: both feet on the wheely part), each sole square on top of a leg, toes and heel over the edges; the hub and gas column, the twin-wheel casters; Dad’s grey socks and brown slippers beyond. The c. 1990 task chair is black nylon base and casters, charcoal blue-grey tweed seat (Jade r4: as built). r4: her feet stand out on the leg tips (0.32 m from the hub), so her legs pass outside the seat, beside Dad, not through him. The screen light comes over the desk edge from frame left; the desk cuts it, so the foot nearer the desk is in shadow.' },
  // 2026-11-26 arm fix: was 24 mm at screenPoint(0.02, 0.3, -0.3) (behind the glass's left edge, on her side): her arm pointed straight at the lens in front of Dad's chest and the painter gave it to Dad. Now from behind the glass and 0.27 m past its right edge (Dad's side), a little high: her arm lies across her OWN chest, shoulder -> elbow -> forearm -> fingertip, under her face
  { id: 'B2_face', lens: 35, pos: screenPoint(2.0, -0.2, -0.45), aim: ['jade7:eyes', 0.6, 0.38], figs: POINT_B2, focus: ['jade7'], time: '2:17.2-2:18.3 Verse 2b', position: 'outside', near: 0.05, far: 7,
    hide: ['CRT monitor', 'computer (desktop', 'screen (the beam', 'floppy drive', 'fanfold paper', 'dot-matrix printer', 'beam volume'],
    header: 'Verse 2b 2:17.2 OUTSIDE: from behind the screen, on her face; her own arm across her chest to the fingertip on the glass', intent: 'The camera looks out from behind the screen (0.45 m back, past the glass’s right edge on Dad’s side, a little high; monitor and computer hidden, the glass edge stays as a thin frame): her face lit cool white by the screen (Jade r4: cool white, not blue), nearly frontal; her EYES ARE ON HER OWN FINGERTIP on the glass, 0.46 m away, both eyes converging on it (not crossed); her RIGHT arm runs from her own shoulder to the fingertip (a 7-year-old’s small hand); she stands beside Dad’s left shoulder, 2 cm clear of him (measured), he leans a little to his right to make room. Long-sleeved grey sweater. Dad’s face and shoulder at frame left, beside and behind her. Locked off.' },
  { id: 'B3_finger', lens: 35, orbit: { at: 'jade7:head', rel: 'jade7', az: 200, el: 55, dist: 0.6 }, aim: [WORD_P, 0.47, 0.4], figs: POINT, time: '2:18.3-2:19.8 Verse 2b ("I point to one he missed" 2:18.3)', position: 'inside', near: 0.05, far: 4,
    contacts: [['indexR', WORD_TIP], ['shoulderR', WORD_TIP], ['elbowR', WORD_TIP], ['wristR', WORD_TIP]], subject: WORD_P,
    header: 'Verse 2b 2:18.3 INSIDE: POINTING FINGER (2 of 3): small finger on the glass under the word he missed', intent: 'From above and behind her left shoulder (r4 decisions: az 200 / el 55 / 0.6 m; the back of her head at the bottom of the frame, her RIGHT arm rising from her shoulder up to the glass): the DOS screen, the MS-DOS QBasic editor (c. 1990) with CHAT.BAS, the real-time chat program Dad is writing with his friend on a weekend (dark blue text on light grey, 80 x 25, menu bar, window frame, Immediate window, status line: the canonical screen texture, paint it exactly), her right index fingertip on the glass just under `txt$` on line 9 (`PRINT #1, txt$`), the one he forgot to rename to `outLine$` (the gold underline goes under it). Dad’s right hand on the keyboard’s arrow keys, his head frame right. A neat stack of 5.25 in floppy disks on the desk at left. One of the film’s three pointing-finger framings.' },
  // ---------------------------------------------------------------- 2:19.8-2:22.2 "Good catch!" (band stop 2:19.8, sung 2:20.0)
  { id: 'B4_doubletake', lens: 22, pos: [-1.80, 0.95, 1.22],   // 2026-11-26: was 24 mm at gp([-0.35, 0.92, 0.45]) = [-1.97, 0.92, 1.50], now under the stair: pulled 0.3 m in along its own line, clear of the stair's room-side stringer (z 1.28), 22 mm keeps the two-shot
    aim: [{ mid: ['dad:eyes', 'jade7:eyes'] }, 0.5, 0.42], figs: GC, chair: CHAIR_GC, focus: ['dad', 'jade7'], time: '2:19.8-2:21.4 "Good catch!" (drums stop)', position: 'outside (on Dad)',
    header: '"Good catch!" 2:19.8: Dad’s double take: she is a cat, licking her wrist', intent: 'From the open floor front-left, just in front of the stair (2026-11-26: 22 mm, 0.3 m closer than before, the stair’s room-side stringer is at z 1.28): Dad has rolled back and swivelled to his left, hands still over the keys, and stares at her (three-quarter on his face). She has hopped off the spokes and stands in the open, in the screen light, in profile, hunched over her paw: right hand curled into a loose fist like a paw, her closed lips and her chin resting ON the back of her wrist (r4, Jade: mouth closed, tongue in, lips and chin touching the wrist), head cocked. Not hiding. She is 7-8, about 1.25 m.' },
  { id: 'B5_cat', lens: 40, orbit: { at: 'jade7:mouth', rel: 'jade7', az: -60, el: -3, dist: 0.95 }, aim: ['jade7:mouth', 0.45, 0.33], figs: GC, chair: CHAIR_GC, focus: ['jade7'], contacts: [['mouth', GROOM.contactP], ['chin', GROOM.contactP], ['wristR', GROOM.wrist], ['handR', GROOM.palmC], ['elbowR', GROOM.wrist]], time: '2:21.4-2:22.2 "Good catch!"', position: 'outside', near: 0.1, far: 4,
    header: '"Good catch!" 2:21.4 OUTSIDE: a cat grooming: lips and chin on the back of her wrist', intent: 'Close, level, from her front-right: her right forearm raised diagonally across in front of her, the loose fist drooping like a paw, her head bowed onto it: her CLOSED lips and her chin rest on the back of her wrist (r4, Jade 2026-11-26: mouth closed, tongue in, not visible; lips and chin contacting the wrist; replaces the r3 gap), head cocked, eyes half closed, entirely absorbed. She stands in the open in the screen light, not hiding.' },
];

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
