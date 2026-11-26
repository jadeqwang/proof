// THE MAIN FLOOR OF 5748 CAPRI LANE, MORTON GROVE, ABOUT 2007: camera table ("Proof", bridge, "Beauty on this side", -2sm
// 159.62-161.96 s, then the cut to the Expedit pan on "truth by reference"). First love is a real person: never named,
// never face-on. Every camera is behind him (his hair, ear, back). Set points usable as targets: shirt (= seal centre),
// seal, collar, herL, herR (unfolding); stack, fseal, neck, fHisL/R, fHerL/R (folded). shot.hoodie = 'folded' | 'unfolding'. Every shot has a twin `beam_<id>` (flat = the sun-shaft mask).
import { HER, HIM, SHIRT, FOLD, TURN, FILM } from './layout.js';
import { maskTwins } from '../_beam.js';

const neg = (a) => a.map((v) => -v);
const seatH = 0.44 + 0.055 * 1.65;   // hip-joint height on a 0.44 m cushion (same arithmetic as basement90 seatHip)
// a hand closing on the shoulder seam (the top edge): palm down onto it, fingers over the front, thumb behind
const seam = (at) => ({ to: at, hand: 'grip', palm: neg(SHIRT.a), hold: { r: 0.012, prop: false, centre: true, axis: SHIRT.r } });
// the same on the TURNED garment (round 3: the front now faces her; TURN.grip, 0.50 m apart at y 1.14)
const tseam = (at) => ({ to: at, hand: 'grip', palm: neg(TURN.a), hold: { r: 0.012, prop: false, centre: true, axis: TURN.r } });
// a hand closing on a side edge of the FOLDED stack: thumb on top, fingers under (cylinder r = half the thickness)
const edge = (at, palm, axis) => ({ to: at, hand: 'grip', palm, hold: { r: FOLD.grip.r, prop: false, centre: true, axis } });
// MG1 (folded hand-over): both hold the stack, his hands on the side edges at his end, hers at hers
// hold pass 2026-11-26: both now carry it FROM BELOW (checked as twoHandsBelow): each palm under one of the stack's long
// side edges, turned up and in (30 deg toward the middle) so it takes the bottom corner, fingers along the edge (forward,
// from the forearm), open and flat. His hands at his end (14 cm from the middle toward him), hers at her end (10 cm). The
// power grips round a cylinder at each edge (`edge`, kept for reference) wrapped the fingers back up through the 6 cm
// stack, and palms flat up (grasp.js twoHandsBelow) turned the forearms 35-60 deg past full supination. The stack is ONE
// object for the check: its core is one box (build.js hoodieFolded); the flap, waistband, fold, neckline and drawstrings
// lie on it.
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// an open hand flat under the stack: shape 'cup' (a supporting hand: the engine keeps it on the object and swivels the
// elbow for a natural wrist instead of turning the hand off it) with its curl and thumb opened flat (the cup's curl went up through the stack)
const UNDER = { shape: 'cup', curl: { all: [0, 0, 0] }, spread: 2, thumb: { opp: 0, sweep: 24, abd: 4, mcp: 2, ip: 0 } };
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
// slope > 0 (him): the fingers run down along the forearm instead of level along the edge; the palm then meets the edge at
// its heel only (`along` = where the heel takes it), the fingers falling away under the stack
const sideBelow = (along, ax, Lh, tilt = 45, slope = 0) => { const n = FOLD.n, t = tilt * Math.PI / 180, left = cross(n, ax), o = {};
  for (const [k, s] of [['L', 1], ['R', -1]]) {
    const K = FOLD.c.map((v, i) => v + FOLD.w[i] * along + left[i] * s * FOLD.across / 2 - n[i] * FOLD.thick / 2);   // the bottom side edge under this hand
    const fingers = norm(ax.map((v, i) => v - n[i] * slope));
    let palm = n.map((v, i) => v * Math.cos(t) - left[i] * s * Math.sin(t));                                         // up and in, onto that edge
    const pf = palm.reduce((q, v, i) => q + v * fingers[i], 0); palm = norm(palm.map((v, i) => v - fingers[i] * pf));
    const heel = slope ? 0.1 * Lh : 0;                                                                                // palm centre ahead of the heel
    o[k] = { to: K.map((v, i) => v + fingers[i] * heel - palm[i] * (0.064 * Lh - 0.0012 - (slope ? 0.0045 : 0.0025))), hand: UNDER, palm, fingers, grasp: 'twoHandsBelow', object: 'IAS hoodie (white, folded)' }; }
  return o; };
const HER_LH = 0.187, HIS_LH = 0.19;   // hand lengths (_cast.js JADE_HAND; his about 0.108 x 1.78 m)
const handover = { her: { spine: { bend: 14 }, ...sideBelow(0.16, neg(FOLD.w), HER_LH, 50) },
  him: { spine: { bend: 24 }, ...sideBelow(-0.178, FOLD.w, HIS_LH, 45, 0.5) } };
void edge;

// her: on the couch's west cushion (next to the front window), turned toward him; default = MG2: she has lifted the
// hoodie by the shoulder seams and it is unfolding, its front (the seal) toward him; she looks up at him
const her = (o = {}) => ({ at: HER.at, yaw: HER.yaw, legs: 'seat', legOpts: { seatH, footFwd: 0.40 }, spine: { bend: 8 }, head: { look: 'firstLove27:eyes' }, costume: { top: 0x7d8fa8, sleeves: 'long' },
  L: seam('herL'), R: seam('herR'), ...o });
// him: standing at the west end of the coffee table, in front of her, leaning in a little; he has just let go of it
// (hands low and open); sleeves pushed up (forearms show); looks at her (away from every camera)
const him = (o = {}) => ({ at: HIM.at, yaw: HIM.yaw, legs: 'stand', spine: { bend: 14 }, head: { look: 'jade27:eyes' }, costume: { sleeves: 'pushed', sock: 0xd9ab88 },
  L: 'side', R: 'side', ...o });
const figs = (h = {}, j = {}) => ({ jade27: her(h), firstLove27: him(j) });
const T = { section: FILM.section, time: FILM.time, t: FILM.t, lyric: FILM.sung_here };
const az = (v) => +(Math.atan2(v[0], v[2]) * 180 / Math.PI).toFixed(1);

// ONE CONTINUOUS CAMERA (Jade, r2 review): over his left shoulder, from behind and a little above; MG1 starts wider (the
// back of his head, her on the couch, him handing her the FOLDED hoodie) and pushes in past his shoulder; MG2 is the
// SAME axis continuing, further in, as she takes it and it UNFOLDS. No reverse angle. The move = a slow dolly along the
// line from MG1's camera to its aim point plus a zoom (35 -> 40 -> 42 mm) and, in MG2, a slight tilt down with the falling cloth, so the camera never passes his head's plane
// (his face stays turned fully away). MG1_end = the cut point (MG1's last frame = MG2's first): her hands now on it.
const MOVE = { from: [2.5649, 2.3477, -2.6317], to: [2.3047, 1.1811, -1.0281] };   // MG1's solved camera and aim point (see NOTES)
const along = (k) => MOVE.from.map((v, i) => +(v + (MOVE.to[i] - v) * k).toFixed(4));
const BASE = [
  { id: 'MG1', lens: 35, ...T, position: 'outside', hoodie: 'folded', orbit: { at: 'firstLove27:head', relBody: 'firstLove27', az: 135, el: 26, dist: 1.6 }, aim: [{ mid: ['jade27:eyes', 'fseal'] }, 0.5, 0.48], focus: ['jade27'],
    header: '2:39.6 "Beauty on this side": over his shoulder, he hands her the FOLDED IAS hoodie; the camera starts pushing in',
    intent: 'START of one continuous move. Over first love’s left shoulder, from behind and a little above: the back of his head and his dark brown straight hair large and soft in the foreground at frame right (his ear shows; never his face), his left shoulder and arm reaching in. She sits forward on the floral couch against the front wall, looking up at him; between them, held by both, the white hoodie FOLDED into a neat rectangle, front up: the IAS seal (a blue filled disc, figures in white reverse) upright to us, its lower part hidden under the folded-up waistband, whose ribbed edge lies across it. His hands on the stack\'s near side edges, hers closing on its far side edges. The front window beside her (frame right) backlights her hair with the low November sun. The camera pushes in past his shoulder through the shot.',
    figs: figs(handover.her, handover.him) },
  { id: 'MG1_end', lens: 40, ...T, position: 'outside', hoodie: 'folded', pos: along(0.12), target: MOVE.to.slice(), focus: ['jade27'],
    header: '2:40.2 the cut point (MG1 end = MG2 start): pushed in on the same axis, she has hold of the folded hoodie',
    intent: 'END of MG1 / START of MG2: the same camera axis, pushed in (dolly + zoom) past his left shoulder: his head and ear now cut by the right edge of frame, soft; she fills more of the frame, both her hands on the folded hoodie, his hands still on it, about to let go. The seal upright to us, its lower part still under the folded-up waistband.',
    figs: figs(handover.her, handover.him) },
  { id: 'MG2', lens: 42, ...T, position: 'outside', hoodie: 'unfolding', pos: along(0.20), target: MOVE.to.map((v, i) => +(v + [0, -0.04, 0][i]).toFixed(4)),
    header: '2:40.2-2:42.0 continuing: the same camera, further in: she lifts the hoodie by the shoulders and it UNFOLDS, the seal revealed',
    intent: 'END of the continuous move (MG2 continues MG1 on the same axis; not a close-up insert, no reverse angle). Further in past his left shoulder (only a soft edge of his hair or shoulder at frame right, or nothing): she has lifted the white hoodie by its shoulder seams, both hands at the top corners, and it is unfolding in front of her: the front hangs from her hands toward us, the blue filled-disc IAS seal upright and now almost fully revealed (only its bottom sliver round the last fold), TRUTH left, BEAUTY right, the drawstrings either side; below it the lower part still folded, swinging down and out toward us, half open. Her face above the neckline, looking up at him. The sun from the window behind her rims her hair and the hoodie\'s edges. Then cut to the Expedit pan on "truth by reference".',
    figs: figs({ L: seam('herL'), R: seam('herR') }, { L: 'side', R: 'side' }) },
  // MG2_end (round 3, Jade: "I turn it around in order to look at it so it faces me"): the same axis, a little further in;
  // she has turned the hoodie round, the front (seal) toward her, held by the shoulders; the camera sees its back and her
  // face above it, looking down at the seal. The garment is the cloth module's (sweatshirt.js); label mode shows its outline.
  { id: 'MG2_end', lens: 42, ...T, position: 'outside', hoodie: 'turned', pos: along(0.24), target: MOVE.to.map((v, i) => +(v + [0, -0.02, 0][i]).toFixed(4)),
    header: '2:41-2:42.0 end of the move: she has turned the hoodie round so the front faces her, and looks at it',
    intent: 'END of the continuous move, just before the cut to the Expedit pan: the same camera past his left shoulder. She holds the white hoodie up by its shoulder seams, hands about half a metre apart at chin height, arms a little forward, and has turned it round so the FRONT (the blue IAS seal) faces HER: we see the plain white back of the hoodie, soft folds, the hood hanging on our side, and her face just above it, looking down at the seal. Truth falls in the folds as it turns (Jade). Cloth from the cloth module.',
    figs: figs({ L: tseam('tHerL'), R: tseam('tHerR'), spine: { bend: 6 }, head: { look: 'tseal' } }, { L: 'side', R: 'side' }) },
  { id: 'MG_wide', lens: 18, ...T, position: 'reference', hoodie: 'folded', pos: [2.6, 1.6, -7.0], target: [3.64, 2.04, -2.11],
    header: 'WIDE (reference): from the dining side, behind him, looking south-east: the tall east wall and the ceiling falling away to the west, the couch, the front window',
    intent: 'The living room as the two shots see it, and the house\'s angle (Jade r3): the room\'s ceiling is ONE tilted plane (Jade r4), highest (5.1 m, r5) along the whole EAST wall, whose top is level, falling west toward the dining side; the front wall behind the couch is a trapezoid, tall at the mirror end; the giant mirror hung high on it above the 7-ft grand; the floral couch against the front (south) wall under the large framed picture (1.4 x 1.0 m), the 1.5 m front window beside it throwing the low November-afternoon sun across her and onto the rug; the loveseat left of the rug, the armchair right. He stands back to camera handing her the folded hoodie. Not a shot.',
    figs: figs(handover.her, handover.him) },
  { id: 'REF_north', lens: 18, ...T, position: 'reference', pos: [4.3, 1.75, -0.6], target: [0.6, 1.1, -5.6],
    header: 'WIDE (reference): from the couch\'s east end, looking north-west: piano, mirror, front door, closet, dining table, kitchen slider',
    intent: 'The rest of the great room as Jade drew it, for checking: the 7-ft grand along the giant mirror (east wall, frame right), the dining table with six chairs by the dining window, the front door in the jog and the coat closet, the sliding door to the kitchen and the stairs in the far corner, the one tilted ceiling plane rising from the dining (west) wall to the high mirror (east) wall, the north wall a trapezoid. No figures (this camera would face him). Not a shot.',
    figs: {} },
  { id: 'REF_plan', lens: 0, ...T, position: 'reference', ortho: { w: 15.0 }, pos: [1.75, 9, -3.55], target: [1.75, 0, -3.55], up: [0, 0, 1], near: 6.62, far: 10.5, hide: ['ceiling (one tilted plane', 'daylight outside'],
    header: 'PLAN as Jade drew it: SOUTH (Capri Lane) UP, west right; white outlines = the 15:30 sun through the three windows',
    hoodie: 'folded', intent: 'Top view of the main floor, oriented like Jade\'s hand-drawn plan (street at the top), to compare against it. Not a shot.', figs: figs(handover.her, handover.him) },
];
// with { surf: true } each shot also gets beam_<id>__surf: the lit surfaces only (MG1 and MG2 look through the broad shaft)
export const SHOTS = BASE.concat(maskTwins(BASE, { surf: true }));
