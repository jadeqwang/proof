// MARKET 1993 camera table: one camera per shot the plan's Structure table places in the produce aisle.
//   verse 2a 2:07-2:16 (M1 outside, M2 + M3 inside, M4 the grab) / interlude thinned 2:26-2:36 (M5, M6) /
//   interlude full 2:36-2:45 (M7, M8, M8b) / drum coda 4:24.5-4:35.3 (M9, one bar: 4:28.4-4:30.8, analysis/v3/song_map.md) + two reference views (PLAN, WIDE).
// Fields as in attic88/shots.js, plus: art: 'held' | 'island' (where the hero artichoke is), cart: { at: [x, z], yaw },
// time (plan timecode), position: 'outside' | 'inside' (the plan's two camera positions).
// Set targets: 'art', 'art:tip', 'art:L', 'art:R', 'rom', 'rom:tip', 'cart:handleL|handleR|nose', 'forearm:<who>:<L|R>[:k]'.
import { JADE_STAND, GRANDMA_WAIT, GRANDMA_PASS, MAMA_AHEAD, MAMA_GRAB, WALK, LOOKBACK_AZ } from './layout.js';

// ---------------------------------------------------------------- recurring poses
// she stands at the island with the artichoke lifted in both hands, eyes on its tip: counting spirals
const jadeStudy = (o = {}) => ({ at: JADE_STAND.at, yaw: JADE_STAND.yaw, legs: 'stand', spine: { bend: 7 }, head: { look: 'art:tip' },
  L: { to: 'art:L', hand: 'cup', palm: 'in', fingers: 'fwd' }, R: { to: 'art:R', hand: 'cup', palm: 'in', fingers: 'fwd' }, ...o });
// the grandmother behind her cart, both hands on the bar, a little stooped; she waits the whole time
const grandma = (G, o = {}) => ({ at: G.at, yaw: G.cart.yaw, legs: 'stand', spine: { bend: 15 }, head: { look: 'jade10:head' },
  L: { to: 'cart:handleL', hand: 'grip', palm: 'down', fingers: 'fwd' }, R: { to: 'cart:handleR', hand: 'grip', palm: 'down', fingers: 'fwd' }, ...o });
// Mama further up the aisle at the gondola, reading a shelf (out of the beam)
const mamaAhead = { at: MAMA_AHEAD.at, yaw: MAMA_AHEAD.yaw, legs: 'stand', noApron: true, spine: { bend: 4 }, head: { look: [-0.95, 1.3, 2.9] },
  L: 'side', R: { to: [-0.92, 1.28, 2.82], hand: 'relax', palm: 'down' } };
// Mama back at her right side: her right hand comes down onto Jade's right forearm
const mamaGrab = (o = {}) => ({ at: MAMA_GRAB.at, yaw: MAMA_GRAB.yaw, legs: 'stand', noApron: true, spine: { bend: 12 }, head: { look: 'jade10:head' },
  R: { to: 'forearm:jade10:R', hand: 'grip', palm: 'down', hold: { r: 0.027, prop: false, centre: true, axis: 'to:forearm:jade10:R:0.1' } }, L: 'side', ...o });   // (2026-11-25) the fingers wrap her forearm (engine hold, no prop); was a palm target 2.2 cm above it
// walked away up the aisle (+z): Mama leads by the forearm, Jade is turned side-on and looks back at the artichoke
const jadeLed = { at: WALK.jade.at, yaw: WALK.jade.yaw, legs: 'stand', legOpts: { ankleL: [0.075, -0.63, 0.12], ankleR: [0.075, -0.63, -0.12] }, spine: { twist: 30, bend: 2 },
  head: { look: 'art', pitchK: 0.9 }, R: { to: WALK.hold, hand: 'relax', palm: 'down' }, L: 'side' };
const mamaLead = { at: WALK.mama.at, yaw: WALK.mama.yaw, legs: 'stand', noApron: true, legOpts: { ankleL: [0.09, -0.75, 0.18], ankleR: [0.09, -0.75, -0.18] }, spine: { bend: 4, twist: 8 },
  head: { turn: 0 }, L: { to: 'forearm:jade10:R', hand: 'grip', palm: 'down', hold: { r: 0.027, prop: false, centre: true, axis: 'to:forearm:jade10:R:0.1' } }, R: 'side' };
const grandmaPass = grandma(GRANDMA_PASS, { head: { nod: 6 }, legOpts: { ankleL: [0.09, -0.715, 0.13], ankleR: [0.09, -0.715, -0.13] } });

const WAIT = { figs: { jade10: jadeStudy(), grandma: grandma(GRANDMA_WAIT), mama: mamaAhead }, cart: GRANDMA_WAIT.cart, art: 'held' };
const GRAB = { figs: { jade10: jadeStudy({ head: { look: 'art:tip' } }), grandma: grandma(GRANDMA_WAIT), mama: mamaGrab() }, cart: GRANDMA_WAIT.cart, art: 'held' };
const LED = { figs: { jade10: jadeLed, mama: mamaLead, grandma: grandmaPass }, cart: GRANDMA_PASS.cart, art: 'island' };

export const SHOTS = [
  // ---------------------------------------------------------------- verse 2a, 2:07-2:16  "3. Skokie, 1993."
  { id: 'M1', lens: 40, time: '2:07-2:10 verse 2a', position: 'outside', ...WAIT,
    orbit: { at: 'jade10:eyes', az: JADE_STAND.yaw, el: 0, dist: 1.55 }, aim: ['jade10:eyes', 0.52, 0.4], focus: ['jade10'],
    header: 'verse 2a 2:07 OUTSIDE: frontal, level, locked off; the grandmother waits behind, unlit',
    intent: '3. Skokie, 1993. The one outside shot: her face, frontal and level, eyes down on the artichoke in her hands. A toner label lands frame right of her face. The grandmother and her cart are behind her in the aisle under the dead strips, in frame and unlit.' },
  { id: 'M2', lens: 50, time: '2:10-2:13 verse 2a', position: 'inside', ...WAIT,
    orbit: { at: 'jade10:eyes', az: 0, el: 0, dist: 0 }, aim: ['art', 0.5, 0.52], hideParts: { jade10: ['head'] },
    header: 'verse 2a INSIDE: along her eye-line onto the artichoke in her hands',
    intent: 'Her eye-line (head hidden for the POV): the artichoke in both hands, tip toward her. Gold numerals start landing on the spiral arms (8 arms; bract n is on arm n % 8).' },
  { id: 'M3', lens: 85, time: '2:13-2:15 verse 2a', position: 'inside', ...WAIT,
    orbit: { at: 'jade10:eyes', az: 0, el: 0, dist: 0 }, aim: ['art:tip', 0.5, 0.5], hideParts: { jade10: ['head'] },
    header: 'verse 2a INSIDE, closer: the spiral arms; the count stops one short (7 of 8)',
    intent: 'Same eye-line, tighter: the spiral fills the frame. Numerals 1 to 7 on seven arms; the eighth arm is bare when the cut comes.' },
  { id: 'M4', lens: 50, time: '2:15-2:16 verse 2a', position: 'outside', ...GRAB,
    // THE GRAB framing (shared with attic88_day AD_grab; see NOTES.md): 50 mm, 0.92 m from the grabbed forearm, 31 deg above
    // it, 30 deg round to her right, the forearm at (0.5, 0.52), the adult forearm entering on a diagonal from the upper
    // corner. Here the camera has to be in FRONT of her (her forward is az 20, camera az 350): from behind, her shoulders and
    // head cover the forearm. So Mama's hand enters from frame LEFT; in the attic (camera behind) it enters from frame right.
    // (Was: pos [0.5, 0.88, 1.4], level, forearm at (0.55, 0.5), the cart in the background.)
    orbit: { at: 'forearm:jade10:R', az: 350, el: 31, dist: 0.92 }, aim: ['forearm:jade10:R', 0.5, 0.52],
    header: 'verse 2a 2:15 THE GRAB (recurring framing, 2 of 3): a hand closes on her forearm',
    intent: "The attic grab's framing, mirrored: down onto her right forearm from 0.92 m, Mama's forearm coming in on the diagonal from frame left and closing on it, the artichoke still in her hands frame right. The cart and the grandmother are out of this frame (the camera looks down); M4b, unchanged, is where they are seen." },
  { id: 'M4b', lens: 40, time: '2:16 verse 2a (last beat)', position: 'outside', ...GRAB,
    orbit: { at: 'jade10:eyes', az: JADE_STAND.yaw, el: 0, dist: 1.55 }, aim: ['jade10:eyes', 0.52, 0.4], focus: ['jade10'],
    header: 'verse 2a 2:16 OUTSIDE again, same camera as M1: the arm is pulled and we notice the grandmother',
    intent: "M1's locked-off frame, unchanged, with Mama now at her side (frame left) and the hand on her forearm. Nothing else has moved: the grandmother and her cart are where they were in M1, and this is where the viewer sees them." },
  // ---------------------------------------------------------------- interlude, thinned, 2:26-2:36 (second half: after Dad's answer)
  { id: 'M5', lens: 35, time: '2:30-2:33 interlude (thinned)', position: 'outside', ...LED,
    orbit: { at: 'art', az: LOOKBACK_AZ + 180, el: 20, dist: 0.42 }, aim: ['jade10:eyes', 0.45, 0.36], focus: ['jade10'],
    header: 'interlude 2:30 walked away, looking back: seen from the artichoke; the grandmother gets past',
    intent: 'From just behind the artichoke on its heap (foreground, in the beam, the romanesco beside it): Mama walks her away up the aisle by the forearm; she is turned back, eyes on the artichoke, already out of the beam. The grandmother pushes her cart past on the gondola side, frame right.' },
  { id: 'M6', lens: 135, time: '2:33-2:36 interlude (thinned)', position: 'inside', ...LED,
    orbit: { at: 'jade10:eyes', az: 0, el: 0, dist: 0 }, aim: ['art', 0.5, 0.52], hideParts: { jade10: ['head'] },
    header: 'interlude INSIDE: her eye-line back down the aisle to the artichoke; the count resumes, one numeral per note',
    intent: 'Her eye-line over her shoulder as she is led away (the frame drifts with her walk): long lens, the artichoke lit on its heap among the unlit produce, receding. The count resumes.' },
  // ---------------------------------------------------------------- interlude, full, 2:36-2:45
  { id: 'M7', lens: 70, time: '2:36-2:40 interlude (full)', position: 'inside', ...LED,
    orbit: { at: 'art', az: LOOKBACK_AZ, el: 46, dist: 0.5 }, aim: ['art', 0.5, 0.5],
    header: 'interlude 2:36 INSIDE: the artichoke on its heap, close; the count completes (8)',
    intent: 'Bass returns. Close on the artichoke where she left it, seen along the line of her look: the eighth numeral lands. All eight arms carry a numeral.' },
  { id: 'M8', lens: 70, time: '2:40-2:43 interlude (full)', position: 'inside', ...LED,
    orbit: { at: 'rom', az: -14, el: 50, dist: 0.72 }, aim: ['rom', 0.5, 0.52],
    header: 'interlude 2:40 INSIDE: the romanesco, its 13 / 8 arms',
    intent: 'Her attention moves one bin along: the romanesco, cone of cones, 13 arms one way and 8 the other.' },
  { id: 'M8b', lens: 100, time: '2:43-2:45 interlude (full)', position: 'inside', ...LED,
    orbit: { at: 'rom', az: -14, el: 34, dist: 0.36 }, aim: ['rom', 0.5, 0.62],
    header: 'interlude 2:43 INSIDE, macro: spiral within spiral',
    intent: 'Push into one flank of the romanesco: each floret repeats the whole spiral (5 / 3 arms on every cone).' },
  // ---------------------------------------------------------------- drum coda, v3: hit 4:24.5, groove 4:25.9-4:35.3 (one bar)
  { id: 'M9', lens: 70, time: '4:28.4-4:30.8 drum coda (bar 2 of the groove, v3)', position: 'inside', figs: {}, art: 'island',
    orbit: { at: 'art', az: LOOKBACK_AZ, el: 46, dist: 0.5 }, aim: ['art', 0.5, 0.5],
    header: 'drum coda INSIDE: the finished count (same camera as M7, nobody in the aisle)',
    intent: 'One bar of the coda: the artichoke with all eight numerals. Identical framing to M7 so the gold layer can be reused.' },
  // ---------------------------------------------------------------- reference views (not shots)
  { id: 'PLAN', lens: 'ortho', ortho: { w: 26 }, pos: [0.7, 30, 0], target: [0.7, 0, 0], up: [1, 0, 0], hide: ['drop ceiling'], ...WAIT,
    header: 'reference: plan, blocking A (waiting). Right = +z (front of store), up = +x (islands)', intent: 'Plan of the department with the waiting blocking and the beam footprint.' },
  { id: 'PLAN_B', lens: 'ortho', ortho: { w: 9 }, pos: [0.6, 30, 1.6], target: [0.6, 0, 1.6], up: [1, 0, 0], hide: ['drop ceiling'], ...LED,
    header: 'reference: plan close, blocking B (walked away)', intent: 'Plan of the aisle around the hero island with the walk-away blocking.' },
  { id: 'WIDE', lens: 24, pos: [-0.45, 1.65, 5.6], aim: ['jade10:head', 0.55, 0.52], ...GRAB,
    header: 'reference: the aisle from the front of the store, blocking at the grab', intent: 'Establishing view down the aisle toward the back wall: islands frame left, gondola frame right, tube rows overhead, the key strip over her.' },
];

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
