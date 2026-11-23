// BASEMENT 1990 camera table. Times and section names are from "Proof — Music Video Plan.md", Structure.
//   2:16-2:21  Verse 2b: "2. Decatur, 1990. Bare feet on chair spokes, blue light, a small finger on the glass. One
//              word underlined in gold."
//   2:21-2:26  "Good catch!": drums stop: Dad's double take. She is already a cat under the desk. (then the kitchen)
// position: 'outside' = frontal, level, locked off on her face; 'inside' = along her eye-line, close.
// Fields as in attic88/shots.js, plus: chair { at, seatYaw, spoke0 }, hide [labels], contacts, time, position.
// NOTE on hands: this table was staged when the engine mis-built LEFT hands, so every hand that has to point or lie in
// a given direction here is a RIGHT hand (that is why Jade stands on Dad's left and points with her right). The engine
// was fixed in the integration pass (mannequin.js handFrame); left hands now honour `fingers` / `palm` too.
import { SCREEN, screenPoint, WORD_P, CHAIR, FEET, DESK, jadeOnSpokes } from './layout.js';
import { seatHip, BAREFOOT } from './house.js';
import { ankleLocal } from './kit.js';

// ---------------------------------------------------------------- recurring poses
const S = jadeOnSpokes(), JYAW = 166;
const mid = (a, b) => a.map((v, i) => (v + b[i]) / 2);
const KEYS = (dx) => [0.6 + dx, DESK.top + 0.05, -1.5];
// Dad at the keyboard, facing the screen (-z)
const dadTyping = (o = {}) => ({ at: CHAIR.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop), footFwd: 0.36 }, yaw: 180, spine: { bend: 8 }, head: { look: 'screen' },
  L: { to: KEYS(-0.11), hand: 'relax', palm: 'down' }, R: { to: KEYS(0.11), hand: 'relax', palm: 'down', fingers: [0, 0, -1] }, ...o });
// Jade standing on the two spokes at Dad's left (right foot on the front spoke, left on the back one), leaning over
// the desk edge, RIGHT index finger on the glass at THE WORD, left hand on the desk
const jadePointing = (o = {}) => ({ costume: BAREFOOT, at: S.pelvis, legs: 'stand', yaw: JYAW, spine: { bend: 36, twist: -8 }, head: { look: 'word', pitchK: 0.8 },
  legOpts: { ankleR: ankleLocal([FEET.front[0], FEET.front[1] + S.g.ankleH, FEET.front[2]], S.pelvis, JYAW, 'R'), ankleL: ankleLocal([FEET.back[0], FEET.back[1] + S.g.ankleH, FEET.back[2]], S.pelvis, JYAW, 'L') },
  R: { to: 'word', off: [-0.016, -0.02, 0.086], hand: 'point', fingers: 'to:word', palm: 'down' },
  L: { to: [0.2, DESK.top + 0.02, DESK.z1 - 0.07], hand: 'flat', palm: 'down' }, ...o });
const POINT = { dad: dadTyping(), jade7: jadePointing() };
// "Good catch!": Dad has rolled back and swivelled to his left, where she was a moment ago, hands still over the keys;
// she is under the desk
const CHAIR_GC = { at: [0.6, -0.98], seatYaw: 222 };
const dadDouble = (o = {}) => ({ at: CHAIR_GC.at, legs: 'seat', legOpts: { seatH: seatHip('dad', CHAIR.seatTop), footFwd: 0.38 }, yaw: CHAIR_GC.seatYaw, spine: { bend: 4, twist: 14 }, head: { look: [-0.2, 1.1, -0.8] },
  L: { to: [0.42, DESK.top + 0.2, -1.36], hand: 'relax', palm: 'down' }, R: { to: KEYS(0.02), off: [0, 0.03, 0.02], hand: 'relax', palm: 'down', fingers: [0, 0, -1] }, ...o });
const jadeCat = (o = {}) => ({ costume: BAREFOOT, at: [0.5, -1.72], legs: 'kneel', yaw: -90, spine: { bend: 62 }, head: { look: [-0.55, 0.34, -1.68], pitchK: 1 },
  L: { to: [0.25, 0.035, -1.62], hand: 'flat', palm: 'down' }, R: { to: [0.25, 0.035, -1.82], hand: 'flat', palm: 'down', fingers: [-1, 0, 0] }, ...o });
const GC = { dad: dadDouble(), jade7: jadeCat() };

export const SHOTS = [
  // ---------------------------------------------------------------- set reference (not in the cut)
  { id: 'B0_plan', lens: 0, ortho: { w: 6.4 }, pos: [-0.55, 9, 0], target: [-0.55, 0, 0], up: [0, 0, -1], far: 12, near: 5, figs: POINT,
    hide: ['subfloor', 'floor joists', 'main beam', 'beam at the stair', 'stairwell ceiling', 'kitchen wall above', 'stair landing', 'bare bulb', 'beam volume'],
    header: 'PLAN (ceiling off): back wall at top; desk, screen facing +z (down the page); stair strip at left', intent: 'Set reference: plan of the basement with the pointing blocking. Blue lines = where the desk stops cutting the screen light on the floor.' },
  { id: 'B0_wide', lens: 24, pos: [-1.35, 1.5, 1.8], aim: [SCREEN.c, 0.62, 0.52], figs: POINT, time: 'reference', position: 'reference',
    header: 'MASTER: the basement, the screen the only light; stair at left', intent: 'Set reference: the whole basement from the front-left corner. Everything outside the screen glow is paper.' },
  // ---------------------------------------------------------------- 2:16-2:21 Verse 2b
  { id: 'B1_feet', lens: 45, pos: [-0.55, 0.38, -0.5], aim: [mid(FEET.front, FEET.back), 0.53, 0.62], figs: POINT, time: '2:16-2:17.5 Verse 2b', position: 'inside (detail)', subject: mid(FEET.front, FEET.back),
    header: 'Verse 2b 2:16: bare feet on the chair spokes, blue light from the desk', intent: 'Low and close from the open floor: two bare feet on two spokes of the five-spoke base, casters, Dad’s shoes beyond. The screen light comes over the desk edge from frame left; the desk cuts it, so the foot nearer the desk is in shadow.' },
  { id: 'B2_face', lens: 24, pos: screenPoint(0.02, 0.3, -0.3), aim: ['jade7:eyes', 0.42, 0.4], figs: POINT, focus: ['jade7'], time: '2:17.5-2:19 Verse 2b', position: 'outside', near: 0.05, far: 4,
    hide: ['CRT monitor', 'computer (desktop', 'screen (the beam', 'floppy drive', 'fanfold paper', 'dot-matrix printer', 'beam volume'],
    header: 'Verse 2b 2:17.5 OUTSIDE: through the screen, frontal on her face; fingertip on the glass', intent: 'The camera looks out THROUGH the screen (0.3 m behind the glass; monitor and computer hidden, the glass edge and the word stay as a thin frame): frontal and level on her blue-lit face, her fingertip on the glass, Dad’s face beside her. Locked off.' },
  { id: 'B3_finger', lens: 35, orbit: { at: 'jade7:head', rel: 'jade7', az: 165, el: 34, dist: 0.68 }, aim: [WORD_P, 0.47, 0.4], figs: POINT, time: '2:19-2:21 Verse 2b', position: 'inside', near: 0.05, far: 4,
    contacts: [['indexR', 'word']], subject: WORD_P,
    header: 'Verse 2b 2:19 INSIDE: POINTING FINGER (2 of 3): small finger on the glass at one word', intent: 'Along her eye-line, over her left shoulder: the screen fills the frame, her right index finger on the glass at one word (the gold underline goes under it). Dad’s head is frame right, out of focus. One of the film’s three pointing-finger framings.' },
  // ---------------------------------------------------------------- 2:21-2:26 "Good catch!"
  { id: 'B4_doubletake', lens: 24, pos: [-0.5, 0.82, -0.15], aim: ['dad:eyes', 0.64, 0.26], figs: GC, chair: CHAIR_GC, focus: ['dad'], time: '2:21-2:22.5 "Good catch!" (drums stop)', position: 'outside (on Dad)',
    header: '"Good catch!" 2:21: Dad’s double take at the empty spokes; she is already under the desk', intent: 'From the open side of the desk: Dad has swivelled to where she was standing, hands still over the keys; the two spokes are empty. Lower left, under the desk and out of the screen light: Jade, crouched like a cat.' },
  { id: 'B5_cat', lens: 32, pos: [-0.54, 0.36, -1.67], aim: ['jade7:eyes', 0.5, 0.46], figs: GC, chair: CHAIR_GC, focus: ['jade7'], time: '2:22.5-2:23 "Good catch!"', position: 'outside', near: 0.1, far: 4,
    header: '"Good catch!" 2:22.5 OUTSIDE: under the desk, a cat; frontal, floor level', intent: 'Floor level through the open side of the desk: Jade on hands and knees in the kneehole, face to lens, entirely below the light. Dad’s shins behind her. They forget I’m here if they can’t see me.' },
];

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
