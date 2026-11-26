// THE MAIN FLOOR OF 5748 CAPRI LANE, MORTON GROVE, ABOUT 2007: camera table ("Proof", bridge, "Beauty on this side", -2sm
// 159.62-161.96 s, then the cut to the Expedit pan on "truth by reference"). First love is a real person: never named,
// never face-on. Every camera is behind him (his hair, ear, back). Set points usable as targets: shirt (= seal centre),
// seal, collar, herL, herR. Every shot has a twin `beam_<id>` (flat = the sun-shaft mask).
import { HER, HIM, SHIRT, FILM } from './layout.js';
import { maskTwins } from '../_beam.js';

const neg = (a) => a.map((v) => -v);
const seatH = 0.44 + 0.055 * 1.65;   // hip-joint height on a 0.44 m cushion (same arithmetic as basement90 seatHip)
// a hand closing on the shoulder seam (the top edge): palm down onto it, fingers over the front, thumb behind
const seam = (at) => ({ to: at, hand: 'grip', palm: neg(SHIRT.a), hold: { r: 0.012, prop: false, centre: true, axis: SHIRT.r } });

// her: on the couch's west cushion (next to the front window), turned toward him, holding the UNFOLDED sweatshirt up
// against herself by the shoulder seams, its front (the seal) toward him; she looks up at him
const her = (o = {}) => ({ at: HER.at, yaw: HER.yaw, legs: 'seat', legOpts: { seatH, footFwd: 0.40 }, spine: { bend: 8 }, head: { look: 'firstLove27:eyes' }, costume: { top: 0x7d8fa8, sleeves: 'long' },
  L: seam('herL'), R: seam('herR'), ...o });
// him: standing at the west end of the coffee table, in front of her, leaning in a little; he has just let go of it
// (hands low and open); sleeves pushed up (forearms show); looks at her (away from every camera)
const him = (o = {}) => ({ at: HIM.at, yaw: HIM.yaw, legs: 'stand', spine: { bend: 14 }, head: { look: 'jade27:eyes' }, costume: { sleeves: 'pushed', sock: 0xd9ab88 },
  L: 'side', R: 'side', ...o });
const figs = (h = {}, j = {}) => ({ jade27: her(h), firstLove27: him(j) });
const T = { section: FILM.section, time: FILM.time, t: FILM.t, lyric: FILM.sung_here };
const az = (v) => +(Math.atan2(v[0], v[2]) * 180 / Math.PI).toFixed(1);

const BASE = [
  { id: 'MG1', lens: 35, ...T, position: 'outside', orbit: { at: 'firstLove27:head', relBody: 'firstLove27', az: 128, el: 30, dist: 1.05 }, aim: [{ mid: ['jade27:eyes', 'seal'] }, 0.58, 0.47], focus: ['jade27'],
    header: '2:39.6 "Beauty on this side": over his shoulder, she holds the IAS sweatshirt up, the seal to us',
    intent: 'Over first love’s left shoulder, from behind and a little above: the back of his head and his dark brown straight hair soft in the foreground at frame right (his ear shows; never his face). She sits on the floral couch against the front wall and holds the white sweatshirt he has just given her UNFOLDED up against herself by its shoulders, looking up at him over the collar: the dark-blue IAS seal, almost the whole front, faces us, TRUTH on the left, BEAUTY on the right. The front window beside her (frame right) backlights her hair and the sweatshirt\'s edges with the low November sun. Then cut to the Expedit pan on "truth by reference".',
    figs: figs() },
  { id: 'MG2', lens: 35, ...T, position: 'outside', orbit: { at: 'seal', az: az(SHIRT.n) - 36, el: 15, dist: 1.0 }, aim: [{ mid: ['seal', 'jade27:chin'] }, 0.5, 0.5],
    header: '2:40.2 INSERT: past his left arm: the seal held up, her hands on the shoulders',
    intent: 'Close, from just past his left side at her chest height (his head above frame): the white sweatshirt held up, the dark-blue IAS seal filling the frame upright, TRUTH left, BEAUTY right; her two hands on the shoulder seams at the top corners, her chin and smile just above the collar at the top of frame. The sun from the window behind her rims her hair and the sweatshirt\'s left edge; the seal itself is in the soft skylight.',
    figs: figs() },
  { id: 'MG_wide', lens: 20, ...T, position: 'reference', pos: [2.6, 2.15, -5.3], aim: ['shirt', 0.5, 0.62],
    header: 'WIDE (reference): from the dining table, behind him, looking south to the front wall: couch, window, egg-carton table',
    intent: 'The living room as the two shots see it: the floral couch against the front (south) wall, the front window beside it throwing the low November-afternoon sun across her and onto the rug; the west window over the egg-carton seedlings and the front door\'s jog at frame right; the loveseat and the piano at frame left. He stands back to camera; she holds the sweatshirt up. Not a shot.',
    figs: figs() },
  { id: 'REF_north', lens: 18, ...T, position: 'reference', pos: [4.3, 1.75, -0.6], target: [0.6, 1.1, -5.6],
    header: 'WIDE (reference): from the couch\'s east end, looking north-west: piano, mirror, front door, closet, dining table, kitchen slider',
    intent: 'The rest of the great room as Jade drew it, for checking: the 7-ft grand along the giant mirror (east wall, frame right), the dining table with six chairs by the dining window, the front door in the jog and the coat closet, the sliding door to the kitchen and the stairs in the far corner, the vault rising toward its east-west ridge. No figures (this camera would face him). Not a shot.',
    figs: {} },
  { id: 'REF_plan', lens: 0, ...T, position: 'reference', ortho: { w: 15.0 }, pos: [1.75, 9, -3.55], target: [1.75, 0, -3.55], up: [0, 0, 1], near: 6.62, far: 10.5, hide: ['vaulted ceiling', 'daylight outside'],
    header: 'PLAN as Jade drew it: SOUTH (Capri Lane) UP, west right; white outlines = the 15:30 sun through the three windows',
    intent: 'Top view of the main floor, oriented like Jade\'s hand-drawn plan (street at the top), to compare against it. Not a shot.', figs: figs() },
];
// with { surf: true } each shot also gets beam_<id>__surf: the lit surfaces only (MG1 and MG2 look through the broad shaft)
export const SHOTS = BASE.concat(maskTwins(BASE, { surf: true }));
