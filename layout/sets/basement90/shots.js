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
import { SCREEN, screenPoint, WORD_P, CHAIR, FEET, DESK, jadeOnSpokes, gp } from './layout.js';
import { seatHip, JADE_BASEMENT, DAD_BASEMENT } from './house.js';
import { ankleLocal } from './kit.js';

// ---------------------------------------------------------------- recurring poses
const S = jadeOnSpokes(), JYAW = 166;
const mid = (a, b) => a.map((v, i) => (v + b[i]) / 2);
const KEYS = (dx) => gp([0.6 + dx, DESK.top + 0.05, -1.5]);
// Dad at the keyboard, facing the screen (-z)
const dadTyping = (o = {}) => ({ costume: DAD_BASEMENT, at: CHAIR.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop), footFwd: 0.36 }, yaw: 180, spine: { bend: 8 }, head: { look: 'screen' },
  L: { to: KEYS(-0.11), hand: 'relax', palm: 'down' }, R: { to: KEYS(0.11), hand: 'relax', palm: 'down', fingers: [0, 0, -1] }, ...o });
// Jade standing on the two spokes at Dad's left (right foot on the front spoke, left on the back one), leaning over
// the desk edge, RIGHT index finger on the glass at THE WORD, left hand on the desk
const jadePointing = (o = {}) => ({ costume: JADE_BASEMENT, at: S.pelvis, legs: 'stand', yaw: JYAW, spine: { bend: 36, twist: -8 }, head: { look: 'word', pitchK: 0.8 },
  legOpts: { ankleR: ankleLocal([FEET.front[0], FEET.front[1] + S.g.ankleH, FEET.front[2]], S.pelvis, JYAW, 'R'), ankleL: ankleLocal([FEET.back[0], FEET.back[1] + S.g.ankleH, FEET.back[2]], S.pelvis, JYAW, 'L') },
  R: { to: 'word', off: [-0.016, -0.02, 0.086], hand: 'point', fingers: 'to:word', palm: 'down' },
  L: { to: [gp([0.2, 0])[0], DESK.top + 0.02, DESK.z1 - 0.07], hand: 'flat', palm: 'down' }, ...o });
const POINT = { dad: dadTyping(), jade7: jadePointing() };
// "Good catch!": Dad has rolled back and swivelled to his left, hands still over the keys, and does a double take at
// her: she has hopped off the spokes and stands on the open floor a step to his left, in the screen light, being a
// cat: RIGHT hand in a fist (a paw, bent down at the wrist), raised to her mouth, licking her wrist, head cocked.
// (Jade, decision page 2026-11-25: NOT under the desk; hiding reads as fearful.)
const CHAIR_GC = { at: gp([0.6, -0.98]), seatYaw: 222 };
const dadDouble = (o = {}) => ({ costume: DAD_BASEMENT, at: CHAIR_GC.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop), footFwd: 0.38 }, yaw: CHAIR_GC.seatYaw, spine: { bend: 4, twist: 14 }, head: { look: 'jade7:eyes' },
  L: { to: gp([0.42, DESK.top + 0.2, -1.36]), hand: 'relax', palm: 'down' }, R: { to: KEYS(0.02), off: [0, 0.03, 0.02], hand: 'relax', palm: 'down', fingers: [0, 0, -1] }, ...o });
// her grooming pose. GROOM.at = pelvis [x, z], yaw (70: three-quarter toward Dad and the open room, her right side toward
// the open floor, i.e. toward the cameras).
// 2026-11-26 arm fix (Jade: "it really messes up kid Jade's arm"): a child's cat paw. The elbow hangs low in front of
// her right side (pole down and out, not forward), the upper arm runs down-forward from the shoulder, the forearm rises
// diagonally up and INWARD to the wrist in front of her chin, the loose fist droops forward-down from a wrist bent
// about 75 deg (was: elbow pushed forward at chest height, forearm vertical, fist sticking out level at a right angle).
// Head bowed a little less (look point 0.66 m high, was 0.72 m at 0.55 m) and spine bend 12 (was 10) so her mouth
// comes down toward the paw. The back of the wrist is 4.5 cm forward of and 2 cm below the mouth anchor (wrist centre
// 4.9 cm from it, surface gap ~3 cm, a finger-width and more): she only PRETENDS to lick (r3 rule kept).
const GROOM = { at: gp([-0.25, -0.85]), yaw: 70, wrist: null };
{ const a = GROOM.yaw * Math.PI / 180, f = [Math.sin(a), 0, Math.cos(a)], r = [-Math.cos(a), 0, Math.sin(a)];
  const nrm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  const loc = ([fw, up, rt]) => f.map((v, i) => v * fw + r[i] * rt + (i === 1 ? up : 0));   // her frame: [forward, up, right]
  GROOM.fwd = f; GROOM.right = r;
  GROOM.look = [GROOM.at[0] + f[0] * 0.5, 0.66, GROOM.at[1] + f[2] * 0.5];   // head bowed toward the paw (a fixed point, so the mouth does not move with the hand)
  GROOM.mouth = [-1.734, 0.9948, 0.2937];   // where her mouth ends up with this head (read back from the render: B5_cat sidecar contacts[0].a_world)
  GROOM.wristOff = loc([0.045, -0.02, 0]);   // wrist centre from the mouth anchor
  GROOM.wrist = GROOM.mouth.map((v, i) => v + GROOM.wristOff[i]);
  GROOM.fingers = nrm(loc([0.7, -0.65, -0.2]));   // the paw drooping forward-down (and a little inward) from the bent wrist
  { const d = -GROOM.fingers[1]; GROOM.palm = nrm(GROOM.fingers.map((v, i) => -v * d - (i === 1 ? 1 : 0))); }   // palm down-back (the back of the wrist toward her mouth)
  GROOM.palmOff = GROOM.wristOff.map((v, i) => v + GROOM.fingers[i] * 0.26 * 0.107 * 1.22);   // palm centre = wrist + 0.26 hand lengths (engine)
  GROOM.palmC = GROOM.mouth.map((v, i) => v + GROOM.palmOff[i]);
  GROOM.elbow = nrm(loc([0.3, -0.8, 0.6])); }   // elbow pole: down and out to her right side, a little forward
// a loose fist (the engine's fist curled about 15 deg less, thumb less tight)
const PAW = { shape: 'fist', curl: { index: [72, 92, 50], middle: [76, 94, 52], ring: [80, 96, 54], little: [84, 96, 54] }, thumb: { opp: 0.6, mcp: 24, ip: 16, touch: 'middle.mid' } };
const jadeGroom = (o = {}) => ({ costume: JADE_BASEMENT, at: GROOM.at, legs: 'stand', yaw: GROOM.yaw, spine: { bend: 12, side: 4 }, head: { look: GROOM.look, pitchK: 1, tilt: 20 },
  R: { to: 'self:mouth', off: GROOM.palmOff, hand: PAW, fingers: GROOM.fingers, palm: GROOM.palm, elbow: GROOM.elbow },
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
    header: 'Verse 2b 2:16.1: her socked feet on the chair spokes, blue light from the desk', intent: 'Low and close from the open floor: her two feet in white socks (no shoes) on two spokes of the five-spoke base, casters, Dad’s socks and slippers beyond. The screen light comes over the desk edge from frame left; the desk cuts it, so the foot nearer the desk is in shadow.' },
  // 2026-11-26 arm fix: was 24 mm at screenPoint(0.02, 0.3, -0.3) (behind the glass's left edge, on her side): her arm pointed straight at the lens in front of Dad's chest and the painter gave it to Dad. Now from behind the glass and 0.27 m past its right edge (Dad's side), a little high: her arm lies across her OWN chest, shoulder -> elbow -> forearm -> fingertip, under her face
  { id: 'B2_face', lens: 35, pos: screenPoint(2.0, -0.2, -0.45), aim: ['jade7:eyes', 0.6, 0.38], figs: POINT, focus: ['jade7'], time: '2:17.2-2:18.3 Verse 2b', position: 'outside', near: 0.05, far: 7,
    hide: ['CRT monitor', 'computer (desktop', 'screen (the beam', 'floppy drive', 'fanfold paper', 'dot-matrix printer', 'beam volume'],
    header: 'Verse 2b 2:17.2 OUTSIDE: from behind the screen, on her face; her own arm across her chest to the fingertip on the glass', intent: 'The camera looks out from behind the screen (0.45 m back, past the glass’s right edge on Dad’s side, a little high; monitor and computer hidden, the glass edge and the word stay as a thin frame): her blue-lit face nearly frontal, looking at her fingertip on the glass; her RIGHT arm runs from her own shoulder across her own chest to the fingertip (a 7-year-old’s small hand), clear of Dad. Dad’s face and shoulder at frame left, beside and behind her. Locked off.' },
  { id: 'B3_finger', lens: 35, orbit: { at: 'jade7:head', rel: 'jade7', az: 168, el: 50, dist: 0.55 }, aim: [WORD_P, 0.47, 0.4], figs: POINT, time: '2:18.3-2:19.8 Verse 2b ("I point to one he missed" 2:18.3)', position: 'inside', near: 0.05, far: 4,
    contacts: [['indexR', 'word']], subject: WORD_P,
    header: 'Verse 2b 2:18.3 INSIDE: POINTING FINGER (2 of 3): small finger on the glass at one word', intent: 'Along her eye-line, over her left shoulder and from above (r3: was el 34 / 0.68 m, where her head hid the hand; Jade wants the whole articulated hand): the screen fills the frame, her right index finger on the glass at one word (the gold underline goes under it). Dad’s head is frame right, out of focus. One of the film’s three pointing-finger framings.' },
  // ---------------------------------------------------------------- 2:19.8-2:22.2 "Good catch!" (band stop 2:19.8, sung 2:20.0)
  { id: 'B4_doubletake', lens: 22, pos: [-1.80, 0.95, 1.22],   // 2026-11-26: was 24 mm at gp([-0.35, 0.92, 0.45]) = [-1.97, 0.92, 1.50], now under the stair: pulled 0.3 m in along its own line, clear of the stair's room-side stringer (z 1.28), 22 mm keeps the two-shot
    aim: [{ mid: ['dad:eyes', 'jade7:eyes'] }, 0.5, 0.42], figs: GC, chair: CHAIR_GC, focus: ['dad', 'jade7'], time: '2:19.8-2:21.4 "Good catch!" (drums stop)', position: 'outside (on Dad)',
    header: '"Good catch!" 2:19.8: Dad’s double take: she is a cat, licking her wrist', intent: 'From the open floor front-left, just in front of the stair (2026-11-26: 22 mm, 0.3 m closer than before, the stair’s room-side stringer is at z 1.28): Dad has rolled back and swivelled to his left, hands still over the keys, and stares at her (three-quarter on his face). She has hopped off the spokes and stands in the open, in the screen light, in profile: right hand curled into a fist like a paw, raised to her mouth, pretending to lick her wrist (a small gap: the tongue does not touch), head cocked. Not hiding. She is 7-8, about 1.25 m.' },
  { id: 'B5_cat', lens: 40, orbit: { at: 'jade7:mouth', rel: 'jade7', az: -60, el: -3, dist: 0.95 }, aim: ['jade7:mouth', 0.45, 0.33], figs: GC, chair: CHAIR_GC, focus: ['jade7'], contacts: [['mouth', GROOM.mouth], ['wristR', GROOM.wrist], ['handR', GROOM.palmC]], time: '2:21.4-2:22.2 "Good catch!"', position: 'outside', near: 0.1, far: 4,
    header: '"Good catch!" 2:21.4 OUTSIDE: a cat grooming: fist to mouth, licking her wrist', intent: 'Close, level, from her front-right: her right forearm raised, the fist jutting forward like a paw, the back of the wrist just in front of her mouth, PRETENDING to lick it (r3, Jade: tongue tip out, NOT touching; a small gap), head bowed and cocked, eyes half closed, entirely absorbed. She stands in the open in the screen light, not hiding. The paw must read in silhouette.' },
];

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
