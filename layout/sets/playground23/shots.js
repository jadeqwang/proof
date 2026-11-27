// PLAYGROUND 2023 camera table ("Proof"), r4 rebuild 2026-11-26: the indoor play centre, the play shuttle.
// Fields as attic88_day/shots.js: time, section, position, eyeline { who, to, back }, beamAnchor; hideFigs (the plate).
// Times are -2sm master times (analysis/m2sm/song_map.md): the coda's last bar 4:21.7, last hit 4:24.1, then the low
// bass note rings and fades (gone by ~4:28.0), file ends 4:28.4.
// HARD RULE (Jade): "the shot for the space shuttle should be from behind so we don't look closely at the kids faces".
// Every camera is behind the family; no child's face is readable in any guide.
// Every shot has a twin `beam_<id>` (same camera, beamMask: true): render it in flat mode for the beam mask.
import { PEOPLE, HANDS_MEET, HOLD_R } from './layout.js';
import { maskTwins } from '../_beam.js';

// r5 (Jade: "offering a hand", restage it; her photo of the real shuttle): each child is MID-CLIMB and reaches back to a
// clearly held adult hand. Hand in hand, palm to palm like a handshake: the child's hand reaches back, palm turned
// toward the adult; the adult's hand takes it with the fingers wrapped round it (engine hold: a cylinder of HOLD_R
// through the child's palm centre, along the child's palm width), the child's fingers along the adult's palm.
// Leg targets (legOpts ankle*, body-local: x out, y up, z forward of the pelvis) put the feet on the ramp / block.
const nrmz = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
const crossv = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// the children's held hands: palm normal (toward the adult) and finger direction (back, toward the adult's wrist)
export const KID_HAND = { girl: { palm: nrmz([-1, 0, 0.15]), fingers: nrmz([0.1, -0.75, 0.65]) }, boy: { palm: nrmz([1, 0, 0.15]), fingers: nrmz([-0.1, -0.9, 0.4]) } };
for (const k of Object.values(KID_HAND)) { k.width = nrmz(crossv(k.palm, k.fingers)); k.adultPalm = k.palm.map((x) => -x); }
const KID_CURL = { shape: 'relax', curl: { all: [10, 10, 6] } };
const family = (o = {}) => ({
  // the girl: halfway up the panelled ramp on the balls of her feet (left foot higher), leaning in, left hand on the
  // body's top edge, right hand back in Jade's
  girl: { at: [PEOPLE.girl[0], 0.66, PEOPLE.girl[1]], yaw: 180, legs: 'stand', legOpts: { ankleL: [0.09, -0.152, 0.10], ankleR: [0.05, -0.31, -0.18], poleL: [-0.6, 0.3, -0.7] },
    spine: { bend: 75, twist: -8 }, head: { look: 'girlLook' },
    L: { to: 'girlHandOn', hand: 'flat', palm: 'down', fingers: [0, -0.3, -1] },
    R: { to: HANDS_MEET.jade_girl, hand: KID_CURL, palm: KID_HAND.girl.palm, fingers: KID_HAND.girl.fingers, elbow: 'out' }, ...(o.girl || {}) },
  // the boy: right foot up on the black block, right hand on the top corner of the body, left hand back in Dad's
  boy: { at: [PEOPLE.boy[0], 0.574, PEOPLE.boy[1]], yaw: 180, legs: 'stand', legOpts: { ankleR: [0.06, -0.217, 0.33], ankleL: [0.06, -0.537, -0.15] },
    spine: { bend: 67, twist: 8 }, head: { look: 'boyLook' },
    R: { to: 'boyHandOn', hand: 'flat', palm: 'down', fingers: [0, -0.08, -1] },
    L: { to: HANDS_MEET.dad_boy, hand: KID_CURL, palm: KID_HAND.boy.palm, fingers: KID_HAND.boy.fingers, elbow: 'out' }, ...(o.boy || {}) },
  jade: { at: PEOPLE.jade, floor: 0.012, yaw: 196, legs: 'stand', spine: { bend: 25 }, head: { look: 'girl:head' },
    L: { to: 'girl:handR', hand: { shape: 'grip' }, palm: KID_HAND.girl.adultPalm, hold: { r: HOLD_R.girl, prop: false, centre: true, axis: KID_HAND.girl.width }, grasp: 'power', object: 'figure:girl:hand' }, R: 'side', ...(o.jade || {}) },
  dad: { at: PEOPLE.dad, yaw: 160, legs: 'stand', spine: { bend: 25 }, head: { look: 'boy:head' },
    R: { to: 'boy:handL', hand: { shape: 'grip' }, palm: KID_HAND.boy.adultPalm, hold: { r: HOLD_R.boy, prop: false, centre: true, axis: KID_HAND.boy.width }, grasp: 'power', object: 'figure:boy:hand' }, L: 'side', ...(o.dad || {}) },
});

const BASE = [
  { id: 'PG1', lens: 32, pos: [-0.1, 1.9, 4.1], aim: [[-0.25, 0.72, -1.0], 0.5, 0.6], position: 'behind', time: '4:21.7-4:24.1 (-2sm)', section: 'Drum coda, last bar (header: 4. Austin, 2023)', beamAnchor: 'mote',
    header: '4:21.7 coda, last bar: the play shuttle; each child climbs on, holding Jade’s / Dad’s hand (from behind)',
    intent: 'From behind and a little above the family, deep inside the dark, space-themed play hall: the low white soft-play shuttle lies on the floor across the frame, nose to the right (black windscreen band), a black-and-white panelled wing sloping to the floor as a ramp, a taller rear section with a crawl-through arch at the left. The girl (4) is halfway up the panelled ramp, leaning in, her right hand reaching back in Jade’s left hand; the boy (7, tall) has one foot up on the black block and one hand on the shuttle’s top, his left hand reaching back in Dad’s right hand. Both hands are clearly clasped. Dad (about 67, salt-and-pepper hair, white temples, thin rimless glasses) in a white polo and black trousers, a plain black backpack with two kids’ bottles in its side pockets. Both adults’ eyes on their child. The accent spot’s shaft comes from high upper right toward us; one mote hangs in it above the shuttle. No child’s face is seen.',
    figs: family() },
  { id: 'PG2', lens: 35, eyeline: { who: 'jade', to: 'mote', back: 0.16 }, aim: ['mote', 0.5, 0.5], position: 'eye-line', time: '4:21.7-4:28.4 (-2sm)', section: 'Drum coda last bar; 4:24.1 drums stop; final tone to ~4:28.0', beamAnchor: 'mote',
    header: '4:24.1 FINAL / RHYME FRAME: along Jade’s eye-line up to the mote; the spot’s shaft is the attic’s diagonal',
    intent: 'The film’s last frame. Jade, still holding the girl’s hand, looks up from her to a mote in the accent spot’s shaft above the shuttle: the camera is on her eye-line. The mote at the centre, the shaft crossing from upper right to lower left at about 40 degrees, as in the attic. At the left edge, the white-and-red soft-play rocket’s nose cone; the family is below the frame (no face). At 4:24.3 the mote drifts up out of the light; hold; the wash goes to bare paper and the gold dotted line starts along its path and stops (path in the sidecar).',
    figs: family({ jade: { head: { look: 'mote' } } }) },
  { id: 'PG2_plate', lens: 35, eyeline: { who: 'jade', to: 'mote', back: 0.16 }, aim: ['mote', 0.5, 0.5], position: 'eye-line', time: '4:24.1-4:28.4 (-2sm)', section: 'Drums stop dead; final tone', beamAnchor: 'mote', hideFigs: true,
    header: '4:24.1 plate: PG2 with nobody drawn (the shaft, the mote leaving it, then bare paper)',
    intent: 'PG2’s exact camera with the figures not drawn: the clean plate for the beam mask, the mote’s exit and the unfinished gold dotted line.',
    figs: family({ jade: { head: { look: 'mote' } } }) },
];
// r6 reference (not a film shot): the hollow cabin and its seats seen from front-left and above, roughly as Jade's photo
// of the real shuttle; nobody drawn (the figures are built and hidden, as the plate). For checking the build only.
const REF = [
  { id: 'REF_cabin', lens: 28, pos: [1.7, 2.5, 1.0], target: [-0.2, 0.35, -1.55], position: 'reference', hideFigs: true,
    header: 'r6 reference: the open-topped shuttle cabin and its two seats (nobody drawn)',
    intent: 'Reference only: the play shuttle from front-left and above, the open cabin between the arched rear section and the nose cowl, two black bucket seats behind the cowl.',
    figs: family() },
];
export const SHOTS = BASE.concat(maskTwins(BASE), REF);
