// CLOSET, ABOUT 2002 camera table ("Proof", chorus 2a, 3:23.4-3:34.2, -2sm master). Rebuilt 2026-11-25 for the
// reach-in sliding-door closet of Jade's drawing: she sits inside on the folded duvet, he sits on the bedroom carpet
// in front of her with his back to the window. All cameras are in the bedroom behind or beside him, or inside with
// her: he is never shot face-on (back of head, over-the-shoulder, jaw line in near-profile from behind only).
// Set points usable as targets: hands, face, opening, beamMid, floorIn. Every film shot has twins `beam_<id>` and
// `beam_<id>__surf` (flat = beam mask). CL_elev is a reference elevation for comparing with the drawing (not in the film, no twin).
import { SEATS } from './layout.js';
import { maskTwins } from './beam.js';

// cross-legged on the duvet, leaning in a little; her hands palm-up under his, palm-down: all four together at `hands`
const jade = (o = {}) => ({ ...SEATS.jade19, legs: 'cross', spine: { bend: 14 }, head: { look: 'firstLove19:eyes' },
  L: { to: 'hands', off: [0.05, -0.012, -0.03], hand: 'palmUp', palm: 'up', fingers: 'fwd' }, R: { to: 'hands', off: [-0.05, -0.012, -0.03], hand: 'palmUp', palm: 'up', fingers: 'fwd' }, ...o });
const him = (o = {}) => ({ ...SEATS.firstLove, legs: 'cross', spine: { bend: 16 }, head: { look: 'jade19:eyes' },
  L: { to: 'hands', off: [-0.05, 0.012, 0.03], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: 'hands', off: [0.05, 0.012, 0.03], hand: 'relax', palm: 'down', fingers: 'fwd' }, ...o });

const BASE = [
  { id: 'CL_wide', lens: 28, pos: [0.70, 1.50, 2.00], aim: ['hands', 0.5, 0.64], position: 'wide', time: '3:23.4-3:28.0', section: 'Chorus 2a (drums alone)', beamAnchor: 'face',
    header: '3:23.4 RHYME FRAME: the closet door half open, the same diagonal of light; two people, four hands',
    intent: 'From high in the bedroom behind first love, looking into the open half of the closet. The closed panels are a pale slab frame-left; the sun from the window behind him crosses upper right to lower left past his right shoulder into the open half and onto her face and the four hands. He is a back and the back of a head in the foreground; she sits beyond him on the folded duvet under the hanging clothes, lit.',
    figs: { jade19: jade(), firstLove19: him() } },
  { id: 'CL_hands', lens: 35, orbit: { at: 'hands', rel: 'jade19', az: 180, el: 68, dist: 0.62 }, aim: ['hands', 0.5, 0.5], hideParts: { jade19: ['head'] }, position: 'inside', time: '3:28.0-3:29.4', section: 'Chorus 2a', beamAnchor: 'hands',
    header: '3:28 INSIDE: her eye-line down to the four hands in the light',
    intent: 'Her own view down (her head hidden for the POV): her two hands palm-up, his two on them, at the door line, the sun on them from the bedroom; his knees and the carpet beyond. Four hands. No field note.',
    figs: { jade19: jade({ head: { look: 'hands' } }), firstLove19: him({ head: { look: 'hands' } }) } },
  { id: 'CL_ots', lens: 50, pos: [0.74, 0.88, 1.45], aim: ['jade19:eyes', 0.56, 0.40], focus: ['jade19'], sync: 'lip', singers: ['jade19'], position: 'outside', time: '3:29.4-3:32.5', section: 'Chorus 2a ("I honestly don\'t know", sung to him)', beamAnchor: 'face',
    header: '3:29.4 OUTSIDE, over his shoulder: level on her face, in the light; "I honestly don\'t know", sung to him',
    intent: 'Over his right shoulder, level with her eyes, locked off. Sung shot (synced). Her whole face is in the sun that comes over his shoulder; the hems of the hanging clothes just above her head, the long coats dark frame-left behind her; his shoulder and the back of his head are the dark frame-left edge. Same question as the school office; here the answer is enough.',
    figs: { jade19: jade(), firstLove19: him() } },
  { id: 'CL_chin', lens: 40, pos: [1.05, 0.84, 0.80], aim: ['firstLove19:chin', 0.40, 0.45], position: 'outside', time: '3:32.5-3:34.2', section: 'Chorus 2a', beamAnchor: 'hands',
    header: '3:32.5 the back of her hand against his chin',
    intent: 'From his right side and a little behind, in the bedroom: his jaw line in near-profile, never his face square on; she beyond him at the closet mouth, lit. Both lean in; he has brought her right hand up out of the light and rubs its BACK on his chin. The other three hands stay together in the light.',
    figs: { jade19: jade({ spine: { bend: 24 }, R: { to: 'firstLove19:chin', off: [0.0, -0.02, -0.035], hand: 'relax', palm: [0, 0, -1], fingers: [-0.3, 1, 0] } }),
      firstLove19: him({ spine: { bend: 22 }, R: { to: 'jade19:handR', off: [0.0, -0.01, -0.03], hand: 'relax', palm: [0, 0, 1], fingers: [-0.3, 1, 0] } }) } },
];
const TWINS = maskTwins(BASE, { surf: true });   // beam_<id> (volume + surfaces) and beam_<id>__surf (lit surfaces only)

// reference: the closet straight on from the bedroom, as in Jade's drawing (long lens from far = nearly flat). She is
// at the poem's first beat (head in her hands, before he comes); he is left out, as in the drawing.
const ELEV = { id: 'CL_elev', lens: 50, pos: [0.0, 1.10, 6.0], target: [0.0, 1.10, -0.3], far: 10, position: 'reference', time: null, section: 'reference elevation (not in the film)', beamAnchor: 'face', noBeamVolume: true,
  header: 'REFERENCE: front elevation, compare inputs/refs_closet.png',
  intent: 'The closet from the bedroom, square on, nearly orthographic: sliding panels over the left half; shelf with textbooks and shoeboxes, rod and clothes to two-thirds down, long coats at the left edge of the open half; Jade low right of centre on the folded duvet, head in her hands.',
  figs: { jade19: { ...SEATS.jade19, legs: 'cross', spine: { bend: 38 }, head: { nod: 35 },
    L: { to: 'self:eyes', off: [0.035, -0.01, 0.07], hand: 'relax', palm: 'back', fingers: 'up', elbow: 'down' }, R: { to: 'self:eyes', off: [-0.035, -0.01, 0.07], hand: 'relax', palm: 'back', fingers: 'up', elbow: 'down' } } } };

export const SHOTS = BASE.concat(TWINS, [ELEV]);
