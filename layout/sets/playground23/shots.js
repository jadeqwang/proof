// PLAYGROUND 2023 camera table ("Proof"): the last bar of the drum coda, and the final shot.
// Fields as attic88_day/shots.js: time, section, position ('outside' | 'inside'), eyeline { who, to, back }, beamAnchor.
// Times are -2sm master times (analysis/m2sm/song_map.md; retimed from v3 2026-11-25): coda hit 4:14.3, the groove at
// once in 2.42 s bars (4:14.3, 4:16.8, 4:19.2; last bar from 4:21.7), drums stop dead on the last hit 4:24.1, then a
// low bass note rings and fades (gone by ~4:28.0), file ends 4:28.4.
// Every shot has a twin `beam_<id>` (same camera, beamMask: true): render it in flat mode for the beam mask.
import { FAMILY } from './layout.js';

// the family at the glass: all three facing it, faces at rest. Jade's eyes are on the mote, not on her reflection.
const family = (o = {}) => ({
  jade: { at: FAMILY.jade, yaw: 188, legs: 'stand', head: { look: 'mote' }, L: 'side', R: 'side', ...(o.jade || {}) },
  partner: { at: FAMILY.partner, yaw: 176, legs: 'stand', head: { look: [-0.1, 1.6, -1.0] }, L: 'side',
    R: { to: 'toddler:hip', off: [0.02, -0.09, -0.1], hand: { shape: 'flat', curl: { all: [10, 10, 5] } }, palm: 'up', fingers: [0.6, 0, -0.8], elbow: 'down', grasp: 'palmUnder', object: 'figure:toddler:leg' }, ...(o.partner || {}) },
  toddler: { at: FAMILY.toddler, yaw: 172, legs: 'seat', legOpts: { seatH: 0.16, footFwd: 0.1 }, spine: { bend: 4 }, head: { look: [0.16, 1.3, -1.0] },
    L: { to: 'partner:shoulderR', off: [0.0, 0.02, -0.06], hand: 'relax' }, R: 'lap', ...(o.toddler || {}) },
});

const BASE = [
  { id: 'PG1', lens: 35, pos: [0.12, 2.3, 2.75], aim: [[0.2, 1.5, -1.0], 0.52, 0.36], position: 'inside', time: '4:21.7-4:24.1 (-2sm)', section: 'Drum coda, last bar (header: 4. Austin, 2023)', beamAnchor: 'mote',
    header: '4:21.7 coda, last bar: playground glass, low sun, three resting faces in reflection as silhouettes',
    intent: 'From behind and above the family: three backs at the bottom of frame, and above them in the pane their three faces at rest, reflected as silhouettes. Through the glass, in the dim room behind, the low sun from the back window makes one diagonal beam. Adult Jade’s reflected eyes are not on herself: they are on a mote in that beam.',
    figs: family() },
  { id: 'PG2', lens: 35, eyeline: { who: 'jade', to: 'mote', back: 0.16 }, aim: ['mote', 0.5, 0.5], position: 'inside', time: '4:21.7-4:28.4 (-2sm)', section: 'Drum coda last bar; 4:24.1 drums stop; final tone to ~4:28.0', beamAnchor: 'mote',
    header: '4:24.1 FINAL / RHYME FRAME: along her eye-line through the glass to the mote; the beam is the attic’s diagonal',
    intent: 'The inside position and the film’s last frame. Along her eye-line through the pane: the mote at the centre, the beam crossing from upper right to lower left at about 40 degrees, as in the attic. The partner’s and child’s reflections stand as silhouettes at frame right (her own is out of frame: this is her view). At 4:24.3 the mote drifts up and right out of the light; hold; the wash goes to bare paper and the gold dotted line starts along its path and stops (path in the sidecar).',
    figs: family() },
  { id: 'PG2_plate', lens: 35, eyeline: { who: 'jade', to: 'mote', back: 0.16 }, aim: ['mote', 0.5, 0.5], position: 'inside', time: '4:24.1-4:28.4 (-2sm)', section: 'Drums stop dead; final tone', beamAnchor: 'mote', reflections: false,
    header: '4:24.1 plate: PG2 without the reflections (the beam, the mote leaving it, then bare paper)',
    intent: 'PG2’s exact camera with the reflection layer off: the clean plate for the beam mask, the mote’s exit and the unfinished gold dotted line. Use it when the reflections are composited as their own layer.',
    figs: family() },
];
const TWINS = BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }));
export const SHOTS = BASE.concat(TWINS);
