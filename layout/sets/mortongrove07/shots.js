// LIVING ROOM, 5748 CAPRI LANE, MORTON GROVE, ABOUT 2007: camera table ("Proof", bridge, "Beauty on this side", v3 169.4-171.8 s, then
// the cut to the Expedit pan on "truth by reference"). First love is a real person: never named, never face-on. Every
// camera is behind him (his hair only). Set points usable as targets: shirt, seal, hisL, hisR, herL, herR.
// Every shot has a twin `beam_<id>` (flat = the sun-shaft mask).
import { HER, HIM, SHIRT, GRIP, FILM } from './layout.js';
import { maskTwins } from '../_beam.js';

const neg = (a) => a.map((v) => -v);
const seatH = 0.44 + 0.055 * 1.65;   // hip-joint height on a 0.44 m cushion (same arithmetic as basement90 seatHip)
// a hand closing on the stack's side edge: thumb on top, fingers under (cylinder r = half the thickness, `to` = its centre)
const grip = (at, palm, axis) => ({ to: at, hand: 'grip', palm, hold: { r: GRIP.r, prop: false, centre: true, axis } });

// her: on the couch's west cushion (next to the picture window), sitting forward, both hands up on her end of the sweatshirt (costume: a placeholder long-sleeved top)
const her = (o = {}) => ({ at: HER.at, yaw: HER.yaw, legs: 'seat', legOpts: { seatH, footFwd: 0.42 }, spine: { bend: 14 }, head: { look: 'firstLove27:eyes' }, costume: { top: 0x7d8fa8, sleeves: 'long' },
  L: grip('herL', SHIRT.u, neg(SHIRT.w)), R: grip('herR', neg(SHIRT.u), neg(SHIRT.w)), ...o });
// him: standing in front of her, a little to her right, leaning in; sleeves pushed up (forearms show); looks at her (away from every camera)
const him = (o = {}) => ({ at: HIM.at, yaw: HIM.yaw, legs: 'stand', spine: { bend: 26 }, head: { look: 'jade27:eyes' }, costume: { sleeves: 'pushed', sock: 0xd9ab88 },
  L: grip('hisL', neg(SHIRT.u), SHIRT.w), R: grip('hisR', SHIRT.u, SHIRT.w), ...o });
const figs = (h = {}, j = {}) => ({ jade27: her(h), firstLove27: him(j) });
const T = { section: FILM.section, time: FILM.time, t: FILM.t, lyric: FILM.sung_here };

const BASE = [
  { id: 'MG1', lens: 35, ...T, position: 'outside', orbit: { at: 'firstLove27:head', relBody: 'firstLove27', az: -140, el: 38, dist: 0.9 }, aim: [{ mid: ['jade27:eyes', 'seal'] }, 0.6, 0.45], focus: ['jade27'],
    header: '2:49.4 "Beauty on this side": over his shoulder, he hands her the IAS sweatshirt',
    intent: 'Over first love’s right shoulder, from behind and above it: the back of his head and his dark brown, fairly straight hair soft in the foreground at frame left (never his face). She sits forward on the floral couch against the front wall, looking up at him; the picture window beside her at frame right, its low afternoon sun across her face and hands. Between them the folded white sweatshirt, the dark-blue IAS seal (Truth, Beauty) on top; his hands on its near edges, hers closing on its far edges. Her face and the sweatshirt in focus. Then cut to the Expedit pan on "truth by reference".',
    figs: figs() },
  { id: 'MG2', lens: 24, ...T, position: 'inside', orbit: { at: 'seal', az: +(Math.atan2(SHIRT.w[0], SHIRT.w[2]) * 180 / Math.PI).toFixed(1), el: 58, dist: 0.55 }, aim: ['seal', 0.5, 0.5], hideParts: { jade27: ['head'] },
    header: '2:50 INSERT: the sweatshirt changing hands, the seal upright (her eye-line)',
    intent: 'Her own view down onto the sweatshirt (her head hidden for the POV): the dark-blue IAS seal upright for her, TRUTH on the left, BEAUTY on the right; his two hands on the far edges with his bare forearms (forearm hair clearly visible), her two hands coming in from the bottom of frame and closing on the near edges, thumbs on top. The low sun comes in from the picture window on her left. His head is out of frame.',
    figs: figs({ head: { look: 'seal' } }, { head: { look: 'seal' } }) },
  { id: 'MG_wide', lens: 20, ...T, position: 'reference', pos: [3.3, 2.25, -4.15], aim: ['shirt', 0.5, 0.62],
    header: 'WIDE (reference): from the dining-room side behind him, toward the front wall: couch and picture window',
    intent: 'The room as the two shots see it: the floral couch against the front (south) wall at frame left, the picture window beside it at frame right throwing the low November-afternoon sun across her and onto the floor; the entry / stair hall opening at the far right, coffee table and armchair at frame left. He stands back to camera; she sits forward taking the sweatshirt. Not a shot.',
    figs: figs() },
  { id: 'REF_plan', lens: 0, ...T, position: 'reference', ortho: { w: 9.0 }, pos: [1.8, 8, -2.0], target: [1.8, 0, -2.0], up: [0, 0, -1], near: 5.62, far: 9.5,
    header: 'PLAN (reference): north up; front wall (picture window + couch) at the bottom; white outline = the sun shaft',
    intent: 'Top view of the living room. Not a shot.', figs: figs() },
];
// with { surf: true } each shot also gets beam_<id>__surf: the lit surfaces only (MG1 and MG2 look through the broad shaft)
export const SHOTS = BASE.concat(maskTwins(BASE, { surf: true }));
