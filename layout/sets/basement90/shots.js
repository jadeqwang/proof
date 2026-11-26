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
import { SCREEN, screenPoint, WORD_P, CHAIR, FEET, DESK, jadeOnSpokes } from './layout.js';
import { seatHip, JADE_BASEMENT, DAD_BASEMENT } from './house.js';
import { ankleLocal } from './kit.js';

// ---------------------------------------------------------------- recurring poses
const S = jadeOnSpokes(), JYAW = 166;
const mid = (a, b) => a.map((v, i) => (v + b[i]) / 2);
const KEYS = (dx) => [0.6 + dx, DESK.top + 0.05, -1.5];
// Dad at the keyboard, facing the screen (-z)
const dadTyping = (o = {}) => ({ costume: DAD_BASEMENT, at: CHAIR.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop), footFwd: 0.36 }, yaw: 180, spine: { bend: 8 }, head: { look: 'screen' },
  L: { to: KEYS(-0.11), hand: 'relax', palm: 'down' }, R: { to: KEYS(0.11), hand: 'relax', palm: 'down', fingers: [0, 0, -1] }, ...o });
// Jade standing on the two spokes at Dad's left (right foot on the front spoke, left on the back one), leaning over
// the desk edge, RIGHT index finger on the glass at THE WORD, left hand on the desk
const jadePointing = (o = {}) => ({ costume: JADE_BASEMENT, at: S.pelvis, legs: 'stand', yaw: JYAW, spine: { bend: 36, twist: -8 }, head: { look: 'word', pitchK: 0.8 },
  legOpts: { ankleR: ankleLocal([FEET.front[0], FEET.front[1] + S.g.ankleH, FEET.front[2]], S.pelvis, JYAW, 'R'), ankleL: ankleLocal([FEET.back[0], FEET.back[1] + S.g.ankleH, FEET.back[2]], S.pelvis, JYAW, 'L') },
  R: { to: 'word', off: [-0.016, -0.02, 0.086], hand: 'point', fingers: 'to:word', palm: 'down' },
  L: { to: [0.2, DESK.top + 0.02, DESK.z1 - 0.07], hand: 'flat', palm: 'down' }, ...o });
const POINT = { dad: dadTyping(), jade7: jadePointing() };
// "Good catch!": Dad has rolled back and swivelled to his left, hands still over the keys, and does a double take at
// her: she has hopped off the spokes and stands on the open floor a step to his left, in the screen light, being a
// cat: RIGHT hand in a fist (a paw, bent down at the wrist), raised to her mouth, licking her wrist, head cocked.
// (Jade, decision page 2026-11-25: NOT under the desk; hiding reads as fearful.)
const CHAIR_GC = { at: [0.6, -0.98], seatYaw: 222 };
const dadDouble = (o = {}) => ({ costume: DAD_BASEMENT, at: CHAIR_GC.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop), footFwd: 0.38 }, yaw: CHAIR_GC.seatYaw, spine: { bend: 4, twist: 14 }, head: { look: 'jade7:eyes' },
  L: { to: [0.42, DESK.top + 0.2, -1.36], hand: 'relax', palm: 'down' }, R: { to: KEYS(0.02), off: [0, 0.03, 0.02], hand: 'relax', palm: 'down', fingers: [0, 0, -1] }, ...o });
// her grooming pose. GROOM.at = pelvis [x, z], yaw (70: three-quarter toward Dad and the open room, her right side toward
// the open floor, i.e. toward the cameras);
// the wrist is placed just in front of and below her mouth (`wrist`, world), the fist hangs forward-down from it
const GROOM = { at: [-0.25, -0.85], yaw: 70, wrist: null };
{ const a = GROOM.yaw * Math.PI / 180, f = [Math.sin(a), 0, Math.cos(a)], r = [-Math.cos(a), 0, Math.sin(a)];
  const comb = (...t) => t.reduce((s, [v, k]) => s.map((x, i) => x + v[i] * k), [0, 0, 0]);
  const nrm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  GROOM.fwd = f; GROOM.right = r;
  GROOM.look = [GROOM.at[0] + f[0] * 0.55, 0.72, GROOM.at[1] + f[2] * 0.55];   // head bowed about 35 deg toward the wrist (a fixed point, so the mouth does not move with the hand)
  GROOM.mouth = [GROOM.at[0] + f[0] * 0.157 + r[0] * 0.04, 1.011, GROOM.at[1] + f[2] * 0.157 + r[2] * 0.04];   // where her mouth ends up with this head (read back from the render: B5_cat sidecar contacts[0].a_world)
  GROOM.wrist = comb([GROOM.mouth, 1], [f, 0.05], [[0, 1, 0], -0.012]);   // (r3, Jade: she PRETENDS to lick, mouth near the wrist, not touching) wrist centre ~5 cm off her lips (was 2.6 cm)
  GROOM.fingers = nrm(comb([f, 0.95], [[0, 1, 0], -0.3]));          // the paw jutting forward from the wrist, drooping a little
  GROOM.palm = nrm(comb([f, -0.3], [[0, 1, 0], -0.95]));   // palm down (and a little back): the back of the wrist up, at her tongue
  GROOM.palmC = comb([GROOM.wrist, 1], [GROOM.fingers, 0.045]); }
const jadeGroom = (o = {}) => ({ costume: JADE_BASEMENT, at: GROOM.at, legs: 'stand', yaw: GROOM.yaw, spine: { bend: 10, side: 4 }, head: { look: GROOM.look, pitchK: 1, tilt: 20 },
  R: { to: GROOM.palmC, hand: 'fist', fingers: GROOM.fingers, palm: GROOM.palm, elbow: GROOM.right.map((v, i) => v * 0.35 + GROOM.fwd[i] * 0.1 + (i === 1 ? -0.93 : 0)) },
  L: 'side', ...o });
const GC = { dad: dadDouble(), jade7: jadeGroom() };

export const SHOTS = [
  // ---------------------------------------------------------------- set reference (not in the cut)
  { id: 'B0_plan', lens: 0, ortho: { w: 6.4 }, pos: [-0.55, 9, 0], target: [-0.55, 0, 0], up: [0, 0, -1], far: 12, near: 5, figs: POINT,
    hide: ['subfloor', 'floor joists', 'main beam', 'beam at the stair', 'stairwell ceiling', 'kitchen wall above', 'stair landing', 'pull chain', 'beam volume'],
    header: 'PLAN (ceiling off): back wall at top; desk, screen facing +z (down the page); stair strip at left', intent: 'Set reference: plan of the basement with the pointing blocking. Blue lines = where the desk stops cutting the screen light on the floor.' },
  { id: 'B0_wide', lens: 24, pos: [-1.35, 1.5, 1.8], aim: [SCREEN.c, 0.62, 0.52], figs: POINT, time: 'reference', position: 'reference',
    header: 'MASTER: the basement, the screen the only light; stair at left', intent: 'Set reference: the whole basement from the front-left corner. Everything outside the screen glow is paper.' },
  // ---------------------------------------------------------------- 2:16.1-2:19.8 Verse 2b ("Basement" sung 2:16.1)
  { id: 'B1_feet', lens: 45, pos: [-0.55, 0.38, -0.5], aim: [mid(FEET.front, FEET.back), 0.53, 0.62], figs: POINT, time: '2:16.1-2:17.2 Verse 2b', position: 'inside (detail)', subject: mid(FEET.front, FEET.back),
    header: 'Verse 2b 2:16.1: her socked feet on the chair spokes, blue light from the desk', intent: 'Low and close from the open floor: her two feet in white socks (no shoes) on two spokes of the five-spoke base, casters, Dad’s socks and slippers beyond. The screen light comes over the desk edge from frame left; the desk cuts it, so the foot nearer the desk is in shadow.' },
  { id: 'B2_face', lens: 24, pos: screenPoint(0.02, 0.3, -0.3), aim: ['jade7:eyes', 0.42, 0.4], figs: POINT, focus: ['jade7'], time: '2:17.2-2:18.3 Verse 2b', position: 'outside', near: 0.05, far: 7,
    hide: ['CRT monitor', 'computer (desktop', 'screen (the beam', 'floppy drive', 'fanfold paper', 'dot-matrix printer', 'beam volume'],
    header: 'Verse 2b 2:17.2 OUTSIDE: through the screen, frontal on her face; fingertip on the glass', intent: 'The camera looks out THROUGH the screen (0.3 m behind the glass; monitor and computer hidden, the glass edge and the word stay as a thin frame): frontal and level on her blue-lit face, her fingertip on the glass, Dad’s face beside her. Locked off.' },
  { id: 'B3_finger', lens: 35, orbit: { at: 'jade7:head', rel: 'jade7', az: 168, el: 50, dist: 0.55 }, aim: [WORD_P, 0.47, 0.4], figs: POINT, time: '2:18.3-2:19.8 Verse 2b ("I point to one he missed" 2:18.3)', position: 'inside', near: 0.05, far: 4,
    contacts: [['indexR', 'word']], subject: WORD_P,
    header: 'Verse 2b 2:18.3 INSIDE: POINTING FINGER (2 of 3): small finger on the glass at one word', intent: 'Along her eye-line, over her left shoulder and from above (r3: was el 34 / 0.68 m, where her head hid the hand; Jade wants the whole articulated hand): the screen fills the frame, her right index finger on the glass at one word (the gold underline goes under it). Dad’s head is frame right, out of focus. One of the film’s three pointing-finger framings.' },
  // ---------------------------------------------------------------- 2:19.8-2:22.2 "Good catch!" (band stop 2:19.8, sung 2:20.0)
  { id: 'B4_doubletake', lens: 24, pos: [-0.35, 0.92, 0.45], aim: [{ mid: ['dad:eyes', 'jade7:eyes'] }, 0.5, 0.42], figs: GC, chair: CHAIR_GC, focus: ['dad', 'jade7'], time: '2:19.8-2:21.4 "Good catch!" (drums stop)', position: 'outside (on Dad)',
    header: '"Good catch!" 2:19.8: Dad’s double take: she is a cat, licking her wrist', intent: 'From the open floor, front-left: Dad has rolled back and swivelled to his left, hands still over the keys, and stares at her (three-quarter on his face). She has hopped off the spokes and stands in the open, in the screen light, in profile: right hand curled into a fist like a paw, raised to her mouth, pretending to lick her wrist (a small gap: the tongue does not touch), head cocked. Not hiding. She is 7-8, about 1.25 m.' },
  { id: 'B5_cat', lens: 40, orbit: { at: 'jade7:mouth', rel: 'jade7', az: -60, el: -3, dist: 0.85 }, aim: ['jade7:mouth', 0.45, 0.4], figs: GC, chair: CHAIR_GC, focus: ['jade7'], contacts: [['mouth', GROOM.mouth], ['wristR', GROOM.wrist], ['handR', GROOM.palmC]], time: '2:21.4-2:22.2 "Good catch!"', position: 'outside', near: 0.1, far: 4,
    header: '"Good catch!" 2:21.4 OUTSIDE: a cat grooming: fist to mouth, licking her wrist', intent: 'Close, level, from her front-right: her right forearm raised, the fist jutting forward like a paw, the back of the wrist just in front of her mouth, PRETENDING to lick it (r3, Jade: tongue tip out, NOT touching; a small gap), head bowed and cocked, eyes half closed, entirely absorbed. She stands in the open in the screen light, not hiding. The paw must read in silhouette.' },
];

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
