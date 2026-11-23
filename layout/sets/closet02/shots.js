// CLOSET, ABOUT 2002 camera table ("Proof", chorus 2a, 3:33-3:43). All cameras are at first love's end of the closet,
// behind him: he is never shot face-on (back of head and over-the-shoulder only). Fields as attic88_day/shots.js.
// Set points usable as targets: hands, gap, beamMid, beamFloor. Every shot has a twin `beam_<id>` (flat = beam mask).
import { SEATS } from './layout.js';

// cross-legged, leaning in a little; her hands palm-up under his, palm-down: all four together at `hands`
const jade = (o = {}) => ({ ...SEATS.jade19, legs: 'cross', spine: { bend: 16 }, head: { look: 'firstLove19:eyes' },
  L: { to: 'hands', off: [-0.035, -0.012, -0.05], hand: 'palmUp', palm: 'up', fingers: 'fwd' }, R: { to: 'hands', off: [-0.035, -0.012, 0.05], hand: 'palmUp', palm: 'up', fingers: 'fwd' }, ...o });
const him = (o = {}) => ({ ...SEATS.firstLove, legs: 'cross', spine: { bend: 16 }, head: { look: 'jade19:eyes' },
  L: { to: 'hands', off: [0.035, 0.012, 0.05], hand: 'relax', palm: 'down', fingers: 'fwd' }, R: { to: 'hands', off: [0.035, 0.012, -0.05], hand: 'relax', palm: 'down', fingers: 'fwd' }, ...o });

const BASE = [
  { id: 'CL_wide', lens: 20, pos: [1.15, 1.30, -0.38], aim: ['hands', 0.45, 0.72], position: 'wide', time: '3:33-3:38', section: 'Chorus 2a (drums alone)', beamAnchor: 'beamMid',
    header: '3:33 RHYME FRAME: the door ajar, the same diagonal of light; two people, four hands',
    intent: 'From high behind first love, down the length of the closet. The door gap is a bright slot frame-right; one shaft falls from it, upper right to lower left at 40 degrees, onto the four hands between them. He is a back and the back of a head, frame-left of the light; she faces us beyond it. Clothes hang frame-left, out of the light.',
    figs: { jade19: jade(), firstLove19: him() } },
  { id: 'CL_hands', lens: 35, orbit: { at: 'hands', rel: 'jade19', az: 180, el: 66, dist: 0.6 }, aim: ['hands', 0.5, 0.5], hideParts: { jade19: ['head'] }, position: 'inside', time: '3:38-3:40', section: 'Chorus 2a', beamAnchor: 'hands',
    header: '3:38 INSIDE: her eye-line down to the four hands in the light',
    intent: 'Her own view down (her head hidden for the POV): her two hands palm-up, his two on them, the shaft crossing them from the door side. In full depth: four hands. No field note.',
    figs: { jade19: jade({ head: { look: 'hands' } }), firstLove19: him({ head: { look: 'hands' } }) } },
  { id: 'CL_ots', lens: 50, pos: [1.12, 0.86, -0.42], aim: ['jade19:eyes', 0.56, 0.38], focus: ['jade19'], sync: 'lip', singers: ['jade19'], position: 'outside', time: '3:40-3:42', section: 'Chorus 2a ("I honestly don\'t know", sung to him)', beamAnchor: 'hands',
    header: '3:40 OUTSIDE, over his shoulder: level on her face; "I honestly don\'t know", sung to him',
    intent: 'Over his right shoulder, level with her eyes, locked off. Sung shot (synced). Her face is above the shaft, the hands below it in the light; his shoulder and the back of his head are the dark frame-left edge. Same question as the school office; here the answer is enough.',
    figs: { jade19: jade(), firstLove19: him() } },
  { id: 'CL_chin', lens: 40, pos: [0.48, 0.86, -0.55], aim: ['firstLove19:chin', 0.5, 0.45], position: 'outside', time: '3:42-3:43', section: 'Chorus 2a', beamAnchor: 'hands',
    header: '3:42 the back of her hand against his chin',
    intent: 'From his right side and a little behind, against the door wall: his jaw line in near-profile, never his face square on. Both lean in; her right hand comes up out of the light and rests its back against his chin. The other three hands stay together in the shaft.',
    figs: { jade19: jade({ spine: { bend: 30 }, R: { to: 'firstLove19:chin', off: [-0.035, -0.02, 0.0], hand: 'relax', palm: [-1, 0, 0], fingers: [0.25, 1, 0] } }), firstLove19: him({ spine: { bend: 26 } }) } },
];
const TWINS = BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }));
export const SHOTS = BASE.concat(TWINS);
