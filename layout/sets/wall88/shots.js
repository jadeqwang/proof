// INSIDE THE WALL, 1988 camera table ("Proof", chorus 1, 1:38-1:55, into the tail at 1:55). Two camera positions:
// outside (frontal on her face, looking down the cavity toward -z) and inside (along her eye-line, toward +z).
// No header and no gold field note in this scene. Fields as attic88_day/shots.js.
// Set points usable as targets: mote, eye, crack, bladeMid. Every shot has a twin `beam_<id>` (flat mode = beam mask).
import { SEAT, EYE } from './layout.js';

// knees up, arms round them, back to the closed end; she is holding still. headAt puts her right eye in the blade.
const jadeStill = (o = {}) => ({ at: SEAT.at, yaw: SEAT.yaw, legs: 'knees', spine: { bend: 8 }, head: { look: [0, EYE[1], 1.0] },
  L: { to: 'self:kneeL', off: [0.0, 0.05, 0.0], hand: 'relax', palm: 'down' }, R: { to: 'self:kneeR', off: [0.0, 0.05, 0.0], hand: 'relax', palm: 'down' }, ...o });

const BASE = [
  { id: 'WL_out', lens: 35, orbit: { at: 'littleJade:eyes', az: 0, el: 0, dist: 1.0 }, aim: ['littleJade:eyes', 0.5, 0.38], focus: ['littleJade'], position: 'outside', time: '1:38-1:47 and 1:47-1:51', section: 'Chorus 1 ("Inside?" / "My voice goes blind")', beamAnchor: 'eye',
    header: '1:38 OUTSIDE: frontal, level, locked off; dark, then the blade across one eye',
    intent: 'The outside position, inside the wall. Square on her face down the length of the cavity, boards frame-left, brick frame-right. "Inside?" is this frame with the light off (dark). Then the blade: a thin sheet from the crack, upper left, across her right eye and the bridge of her nose. "My voice goes blind": her mouth opens just under the light, and closes. Nothing else moves.',
    figs: { littleJade: jadeStill() } },
  { id: 'WL_eye', lens: 85, orbit: { at: 'littleJade:eyes', az: 0, el: 0, dist: 0.62 }, aim: ['eye', 0.42, 0.45], focus: ['littleJade'], position: 'outside', time: '1:42-1:47', section: 'Chorus 1 ("I honestly don\'t know")', beamAnchor: 'eye',
    header: '1:42 OUTSIDE, close: one eye in the blade, following the mote',
    intent: 'Same axis as WL_out, pushed in to her eyes. The lit eye tracks the mote; the other is in the dark. In full depth: the mote and one eye.',
    figs: { littleJade: jadeStill() } },
  { id: 'WL_in', lens: 35, eyeline: { who: 'littleJade', to: [0, EYE[1] + 0.02, 1.0], back: 0.11 }, aim: ['mote', 0.5, 0.5], position: 'inside', time: '1:51-1:55, start of the 1:55 pull-back', section: 'Chorus 1 ("Nowhere to go") into Tail 1', beamAnchor: 'mote',
    header: '1:51 INSIDE / RHYME FRAME: along her eye-line; the blade is the diagonal, the mote in it',
    intent: 'The inside position, and the frame that rhymes with the attic beam. From her eyes along the cavity: the crack is a bright slit on the boards frame-right, the blade falls from it, upper right to lower left at 40 degrees, through the centre of frame. The mote hangs in it, then drops out of the light. The pull-back to the Voyager frame starts here: the blade becomes the band, the mote the dot.',
    figs: { littleJade: jadeStill() } },
];
const TWINS = BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }));
export const SHOTS = BASE.concat(TWINS);
