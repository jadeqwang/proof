// CLOSET, ABOUT 2002 camera table ("Proof", chorus 2a, 3:23.4-3:34.2, -2sm master). Rebuilt 2026-11-25 for the
// reach-in sliding-door closet of Jade's drawing: she sits inside on the folded duvet, he sits on the bedroom carpet
// in front of her with his back to the window. All cameras are in the bedroom behind or beside him, or inside with
// her: he is never shot face-on (back of head, over-the-shoulder, jaw line in near-profile from behind only).
// Set points usable as targets: hands, face, opening, beamMid, floorIn. Every film shot has twins `beam_<id>` and
// `beam_<id>__surf` (flat = beam mask). CL_elev is a reference elevation for comparing with the drawing (not in the film, no twin).
import { SEATS } from './layout.js';
import { maskTwins } from './beam.js';

// cross-legged on the duvet, leaning in a little; her hands palm-up under his, palm-down: all four together at `hands`
// round 3 (Jade, 2026-11-26): both get the engine's opt-in clothed torso (torso: 'real') so the guides read as people, and
// he mirrors her: squarely in front of her on her centre line, same cross-legged lean, the four hands at the door line
const REAL = (sex) => ({ torso: 'real', sex });
// round 4 (Jade, 2026-11-26, corrected): "taking the existing hoodie and making it cardinal red with a white seal at the
// pocket ... also she should be wearing socks". Her cast-sheet zip hoodie (worn open over a white tee), now cardinal;
// build.js adds the tee, zip edges, split pocket, hood, the seal on the pocket, folds over it and white socks. Legs follow
// her cast sheet (mid-blue bootcut jeans, white socks; work/costume_audit.md flagged the old navy / grey).
export const SWEATSHIRT = { top: 0x8c1515, legs: 0x4f6d93, sock: 0xeeece6, sleeves: 'long' };
const jade = (o = {}) => ({ ...SEATS.jade19, ...REAL('f'), costume: SWEATSHIRT, fringe: 'none', legs: 'cross', spine: { bend: 14 }, head: { look: 'firstLove19:eyes' },
  L: { to: 'hands', off: [0.085, -0.016, -0.025], hand: 'palmUp', palm: 'up', fingers: 'fwd' }, R: { to: 'hands', off: [-0.085, -0.016, -0.025], hand: 'palmUp', palm: 'up', fingers: 'fwd' }, ...o });
const him = (o = {}) => ({ ...SEATS.firstLove, ...REAL('m'), legs: 'cross', spine: { bend: 14 }, head: { look: 'jade19:eyes' },
  L: { to: 'hands', off: [-0.085, 0.016, 0.025], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: 'hands', off: [0.085, 0.016, 0.025], hand: 'relax', palm: 'down', fingers: 'fwd' }, ...o });

// the opening (round 3): she looks down, fingertips to her temples, thinking (not crying, not covering her face); he
// sits facing her, hands on his knees, and asks "How do you feel?" (3:24.8); the hands meet at 3:28 (CL_hands)
const temples = (o = {}) => jade({ spine: { bend: 12 }, head: { look: [0.55, 0.10, 0.20] },
  L: { tip: { finger: 'middle', at: 'jade19:templeL' }, hand: 'relax', fingers: 'up', palm: 'in', elbow: [0.35, -0.75, 0.55] },
  R: { tip: { finger: 'middle', at: 'jade19:templeR' }, hand: 'relax', fingers: 'up', palm: 'in', elbow: [-0.35, -0.75, 0.55] }, ...o });
const waiting = (o = {}) => him({ L: 'kneeL', R: 'kneeR', ...o });

const BASE = [
  { id: 'CL_wide', lens: 28, pos: [1.35, 2.0, 1.9], aim: ['jade19:eyes', 0.50, 0.34], position: 'wide', time: '3:23.4-3:28.0', section: 'Chorus 2a (drums alone; caption)', beamAnchor: 'face', caption: { text: "I don't want to apply to medical school.", zone: 'bottom 22 % of the frame, kept clear of her face and hands' },
    header: '3:23.4 OPENING / RHYME FRAME: the closet door half open, the same diagonal of light; she looks down, fingertips to her temples, thinking; caption low in frame',
    intent: 'The scene opens (round 3, Jade): from high in the bedroom behind first love, over his right shoulder, looking into the open half of the closet. The closed panels are a pale slab frame-left; the sun from the window behind him crosses upper right to lower left past his right shoulder into the open half and onto her face. She sits cross-legged on the folded duvet under the hanging clothes, looking down, the fingertips of both hands at her temples: thinking, not crying, her face NOT covered. He sits on the carpet squarely in front of her, mirroring her, hands on his knees: a back and the back of a head in the foreground. The futon (navy plaid blanket, black frame) at frame-right. The lower fifth of the frame is carpet and his back: room for the caption "I don\'t want to apply to medical school." The hands meet at 3:28 (CL_hands).',
    figs: { jade19: temples(), firstLove19: waiting() } },
  { id: 'CL_hands', lens: 35, orbit: { at: 'hands', rel: 'jade19', az: 180, el: 68, dist: 0.62 }, aim: ['hands', 0.5, 0.5], hideParts: { jade19: ['head'] }, position: 'inside', time: '3:28.0-3:29.4', section: 'Chorus 2a', beamAnchor: 'hands',
    header: '3:28 INSIDE: her eye-line down to the four hands in the light',
    intent: 'Her own view down (her head hidden for the POV): her two hands palm-up, his two on them, at the door line, the sun on them from the bedroom; his knees and the carpet beyond. Four hands. No field note.',
    figs: { jade19: jade({ head: { look: 'hands' } }), firstLove19: him({ head: { look: 'hands' } }) } },
  { id: 'CL_ots', lens: 50, pos: [1.05, 0.76, 1.40], aim: ['jade19:eyes', 0.56, 0.40], focus: ['jade19'], sync: 'lip', singers: ['jade19'], position: 'outside', time: '3:29.4-3:32.5', section: 'Chorus 2a ("I honestly don\'t know", sung to him)', beamAnchor: 'face',
    header: '3:29.4 OUTSIDE, over his shoulder: level on her face, in the light; "I honestly don\'t know", sung to him',
    intent: 'Over his right shoulder, low (round 4, Jade: lower, as on cast/first_love/fl_G_ots_hair_v5.png: the camera at about his ear height, looking a touch up at her, so the back of his head is seen level, not from above), locked off. Sung shot (synced). Her whole face is in the sun that comes over his shoulder; the hems of the hanging clothes just above her head, the long coats dark frame-left behind her; his shoulder and the back of his head are the dark frame-left edge. Same question as the school office; here the answer is enough.',
    figs: { jade19: jade(), firstLove19: him() } },
  { id: 'CL_chin', lens: 40, pos: [1.05, 0.84, 0.80], aim: ['firstLove19:chin', 0.40, 0.45], position: 'outside', time: '3:32.5-3:34.2', section: 'Chorus 2a', beamAnchor: 'hands',
    header: '3:32.5 the back of her hand against his chin',
    intent: 'From his right side and a little behind, in the bedroom: his jaw line in near-profile, never his face square on; she beyond him at the closet mouth, lit. Both lean in; he has brought her right hand up out of the light and rubs its BACK on his chin. The other three hands stay together in the light.',
    figs: { jade19: jade({ spine: { bend: 24 }, R: { to: 'firstLove19:chin', off: [0.0, -0.02, -0.035], hand: 'relax', palm: [0, 0, -1], fingers: [-0.3, 1, 0] } }),
      firstLove19: him({ spine: { bend: 22 }, R: { to: 'jade19:handR', off: [0.0, -0.01, -0.03], hand: 'relax', palm: [0, 0, 1], fingers: [-0.3, 1, 0] } }) } },
];
const TWINS = maskTwins(BASE, { surf: true });   // beam_<id> (volume + surfaces) and beam_<id>__surf (lit surfaces only)

// reference: the closet straight on from the bedroom, as in Jade's drawing (long lens from far = nearly flat). She is
// in the opening pose (round 3: looking down, fingertips to her temples, thinking); he is left out, as in the drawing.
const ELEV = { id: 'CL_elev', lens: 50, pos: [0.0, 1.10, 6.0], target: [0.0, 1.10, -0.3], far: 10, position: 'reference', time: null, section: 'reference elevation (not in the film)', beamAnchor: 'face', noBeamVolume: true,
  header: 'REFERENCE: front elevation, compare inputs/refs_closet.png',
  intent: 'The closet from the bedroom, square on, nearly orthographic: sliding panels over the left half; shelf with textbooks and shoeboxes, rod and clothes to two-thirds down, long coats at the left edge of the open half; Jade low right of centre on the folded duvet, looking down, fingertips to her temples (round 3: the opening pose, not head in hands); the futon at frame-right.',
  figs: { jade19: temples() } };

export const SHOTS = BASE.concat(TWINS, [ELEV]);
