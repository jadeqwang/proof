// PLAYGROUND 2023 camera table ("Proof"), r4 rebuild 2026-11-26: the indoor play centre, the play shuttle.
// Fields as attic88_day/shots.js: time, section, position, eyeline { who, to, back }, beamAnchor; hideFigs (the plate).
// Times are -2sm master times (analysis/m2sm/song_map.md): the coda's last bar 4:21.7, last hit 4:24.1, then the low
// bass note rings and fades (gone by ~4:28.0), file ends 4:28.4.
// HARD RULE (Jade): "the shot for the space shuttle should be from behind so we don't look closely at the kids faces".
// Every camera is behind the family; no child's face is readable in any guide.
// Every shot has a twin `beam_<id>` (same camera, beamMask: true): render it in flat mode for the beam mask.
import { PEOPLE, STEP, HANDS_MEET, PALM_GAP } from './layout.js';
import { maskTwins } from '../_beam.js';

const back = (p, dz) => [p[0], p[1], p[2] + dz];
// The hands (Jade, r4: "offering a hand"; the coordinator: "the child's hand in the adult's"): each child's free hand
// hangs a little back and out, palm turned back (pronated); the adult's hand comes from behind and takes it palm to
// palm, the adult's palm facing forward, fingers down and loosely round the child's hand. The child's other hand: the
// girl's and the boy's hang at their sides. Both children stand on the padded steps, about to climb in.
const ADULT_HAND = { shape: 'relax', curl: { all: [22, 20, 10] } };
const family = (o = {}) => ({
  girl: { at: PEOPLE.girl, floor: STEP.h + 0.016, yaw: 180, legs: 'stand', spine: { bend: 6 }, head: { look: 'frontHatch' },
    R: { to: HANDS_MEET.jade_girl, hand: 'relax', palm: [-0.5, 0, 1], fingers: [0.15, -1, 0.1], elbow: 'back' }, L: 'side', ...(o.girl || {}) },
  boy: { at: PEOPLE.boy, floor: STEP.h + 0.01, yaw: 180, legs: 'stand', spine: { bend: 4 }, head: { look: 'rearHatch' },
    R: 'side', L: { to: HANDS_MEET.dad_boy, hand: 'relax', palm: [0.5, 0, 1], fingers: [-0.15, -1, 0.1], elbow: 'back' }, ...(o.boy || {}) },
  jade: { at: PEOPLE.jade, floor: 0.012, yaw: 200, legs: 'stand', spine: { bend: 14 }, head: { look: 'girl:head' },
    L: { to: 'girl:handR', off: [0, 0, PALM_GAP.jade], hand: { shape: 'relax', curl: { all: [7, 7, 4] } }, palm: [-0.3, 0, -1], fingers: [-0.1, -1, 0], hold: true, object: 'figure:girl:hand' }, R: 'side', ...(o.jade || {}) },
  dad: { at: PEOPLE.dad, yaw: 150, legs: 'stand', spine: { bend: 14 }, head: { look: 'boy:head' },
    R: { to: 'boy:handL', off: [0, -0.02, PALM_GAP.dad], hand: { shape: 'flat', curl: { all: [13, 11, 6] } }, palm: [-0.6, 0, -1], fingers: [0.1, -1, -0.3], hold: true, object: 'figure:boy:hand' }, L: 'side', ...(o.dad || {}) },
});

const BASE = [
  { id: 'PG1', lens: 35, pos: [0.15, 2.05, 3.3], aim: [[-0.05, 1.15, -1.2], 0.5, 0.56], position: 'behind', time: '4:21.7-4:24.1 (-2sm)', section: 'Drum coda, last bar (header: 4. Austin, 2023)', beamAnchor: 'mote',
    header: '4:21.7 coda, last bar: the play shuttle; Jade and Dad each offer a hand to a child climbing in (from behind)',
    intent: 'From behind and a little above the family, deep inside the dark, space-themed play hall: the white soft-play shuttle lies across the frame, nose right, two hatches facing us. The girl (4) is stepping up into the front hatch, her right hand back in Jade’s open left hand; the boy (7, tall) is at the rear hatch, his left hand back in Dad’s open right hand. Both adults’ eyes are on their child. The accent spot’s shaft comes from high upper right toward us and lands on the shuttle’s tail; one mote hangs in it above the shuttle. No child’s face is seen.',
    figs: family() },
  { id: 'PG2', lens: 35, eyeline: { who: 'jade', to: 'mote', back: 0.16 }, aim: ['mote', 0.5, 0.5], position: 'eye-line', time: '4:21.7-4:28.4 (-2sm)', section: 'Drum coda last bar; 4:24.1 drums stop; final tone to ~4:28.0', beamAnchor: 'mote',
    header: '4:24.1 FINAL / RHYME FRAME: along Jade’s eye-line up to the mote; the spot’s shaft is the attic’s diagonal',
    intent: 'The film’s last frame. Jade, still holding the girl’s hand, looks up from her to a mote in the accent spot’s shaft above the shuttle: the camera is on her eye-line. The mote at the centre, the shaft crossing from upper right to lower left at about 40 degrees, as in the attic. Below, the top of the shuttle and the backs of the children’s heads (never their faces). At 4:24.3 the mote drifts up out of the light; hold; the wash goes to bare paper and the gold dotted line starts along its path and stops (path in the sidecar).',
    figs: family({ jade: { head: { look: 'mote' } } }) },
  { id: 'PG2_plate', lens: 35, eyeline: { who: 'jade', to: 'mote', back: 0.16 }, aim: ['mote', 0.5, 0.5], position: 'eye-line', time: '4:24.1-4:28.4 (-2sm)', section: 'Drums stop dead; final tone', beamAnchor: 'mote', hideFigs: true,
    header: '4:24.1 plate: PG2 with nobody drawn (the shaft, the mote leaving it, then bare paper)',
    intent: 'PG2’s exact camera with the figures not drawn: the clean plate for the beam mask, the mote’s exit and the unfinished gold dotted line.',
    figs: family({ jade: { head: { look: 'mote' } } }) },
];
export const SHOTS = BASE.concat(maskTwins(BASE));
