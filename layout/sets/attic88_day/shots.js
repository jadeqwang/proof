// ATTIC 1988, DAY camera table ("Proof"). One camera per shot the plan's Structure table places in the attic.
// Fields as attic88/shots.js, plus:
//   time, section   where the shot sits in the song (plan: Structure)
//   position        'outside' (frontal, level, locked off on her face) | 'inside' (along her eye-line, close) | 'wide' | 'plate'
//   eyeline         { who, to, back }: camera on that figure's eye-line, `back` metres in front of her eyes
//   beamAnchor      the world point where the beam's on-screen diagonal is measured (sidecar beam.on_screen)
// Set points usable as targets: mote, keys, keysL, keysR, keysNear, fern, fernRoot, fernMid, window, sill, beamMid, beamEnd.
// All times are -2sm master times (analysis/m2sm/song_map.md; retimed from v3 2026-11-25): tail 2 = 3:43.0-3:55.0 (outro
// line 1 enters over it at 3:54.0); coda: pad 4:12.9, big hit 4:14.3 with the groove at once, 2.42 s bars (4:14.3,
// 4:16.8, 4:19.2, 4:21.7), last hit / drums stop 4:24.1.
// Every shot has a twin `beam_<id>` (same camera, beamMask: true): render it in flat mode for the beam mask.
import { SEAT, READING } from './layout.js';

// ---------------------------------------------------------------- recurring poses
// at the paper keyboard: cross-legged in the tail of the beam, facing up the beam; hands on the keys
const jadeKeys = (o = {}) => ({ at: SEAT.at, yaw: SEAT.yaw, legs: 'cross', spine: { bend: 38 }, head: { look: 'keys' },
  L: { to: 'keysL', hand: 'flat', palm: 'down', fingers: 'fwd' }, R: { to: 'keysR', hand: 'flat', palm: 'down', fingers: 'fwd' }, ...o });
// the same seat, sitting up: hands off the keys, face toward the outside camera, eyes on the mote
const FACE_AZ = 115;                                   // the direction her face points (orbit az: 0 = +z, 90 = +x); the mote is 15 deg to her left of it
const jadeUp = (o = {}) => ({ at: SEAT.at, yaw: SEAT.yaw, legs: 'cross', spine: { bend: 10 }, head: { look: [1.38, 0.59, 0.09] }, L: 'kneeL', R: 'kneeR', ...o });
// at the sill: kneeling on the cushion, right index finger on the frost fern
const jadeSill = (o = {}) => ({ at: READING.kneel, floor: READING.cushion.t, yaw: 90, legs: 'kneel', spine: { bend: 6 }, head: { look: 'fern' },
  R: { to: 'fern', off: [-0.085, -0.015, 0.02], hand: 'point', fingers: [1, 0.2, -0.12], palm: 'down' }, L: { to: 'sill', off: [-0.02, 0.05, -0.22], hand: 'flat', palm: 'down', fingers: 'fwd' }, ...o });

const BASE = [
  // ---------------------------------------------------------------- 0:05 taps, whisper 1
  { id: 'AD_wide', lens: 24, pos: [0.2, 1.15, 2.1], aim: ['beamMid', 0.52, 0.5], position: 'wide', time: '0:05', section: 'Taps (header: Attic, 1988)', beamAnchor: 'beamMid',
    header: '0:05 master: the attic by day, one shaft of low sun',
    intent: 'Establishing frame for the header. The window is the only opening; the sun comes through the four panes and falls as one diagonal shaft from upper right to lower left, ending on the paper keyboard where she sits. Everything else is paper.',
    figs: { littleJade: jadeKeys() } },
  { id: 'AD_keys', lens: 35, orbit: { at: 'keys', rel: 'littleJade', az: 180, el: 64, dist: 0.62 }, aim: ['keys', 0.5, 0.52], hideParts: { littleJade: ['head'] }, position: 'inside', time: '0:05-0:07 (and coda bar 3, 4:19.2-4:21.7, -2sm)', section: 'Taps', beamAnchor: 'keys',
    header: '0:05 inside: her fingers tap on the paper keyboard in the light',
    intent: 'Her own view down at her hands (her head hidden for the POV). The printout is square to her, low notes at her left; both hands on the keys, the sun raking across the paper from the top right. The taps we hear start here. Reused in the drum coda.',
    figs: { littleJade: jadeKeys() } },
  { id: 'AD_out', lens: 32, orbit: { at: 'littleJade:eyes', az: FACE_AZ, el: 0, dist: 0.8 }, aim: ['littleJade:eyes', 0.5, 0.36], focus: ['littleJade'], position: 'outside', time: '0:07-0:18.2', section: 'Taps, whisper 1 at 0:08.8', beamAnchor: 'keysNear',
    header: '0:07 OUTSIDE: frontal, level, locked off on her face; eyes on one mote',
    intent: 'The outside position. Level with her eyes, square to her face, locked off. Her face is above the light; her knees and the keyboard at the bottom of frame are in it. Her eyes are on one mote 15 degrees to her left of the lens; they keep travelling when it leaves the beam. The whisper lands on this face (toner label space either side of her head).',
    figs: { littleJade: jadeUp() } },
  { id: 'AD_mote', lens: 28, eyeline: { who: 'littleJade', to: 'mote', back: 0.14 }, aim: ['mote', 0.5, 0.5], position: 'inside', time: '0:09-0:16.7 (and coda hit + bar 1, 4:14.3-4:16.8, -2sm: the ringed mote; the diagonal for the 0:00 pad)', section: 'Taps', beamAnchor: 'mote',
    header: '0:09 INSIDE / RHYME FRAME: along her eye-line to the mote; the beam is the diagonal',
    intent: 'The inside position, and the frame the beams rhyme on. Along her eye-line: the mote at the centre of frame, the frosted window top right, the shaft crossing from upper right to lower left at 40 degrees. The mote drifts right, out through the near face of the beam, and comes back in. The gold ring and the dotted line are drawn here. The 0:00 pad paints the same diagonal band on bare paper.',
    figs: { littleJade: jadeUp() } },
  // ---------------------------------------------------------------- 0:18.2 whisper 2
  { id: 'AD_thumbs', lens: 40, orbit: { at: 'littleJade:eyes', az: FACE_AZ, el: 0, dist: 0.66 }, aim: ['littleJade:eyes', 0.5, 0.4], focus: ['littleJade'], position: 'outside', time: '0:18.2-0:19.0', section: 'Whisper 2', beamAnchor: 'keysNear',
    header: '0:18.2 OUTSIDE, closer: two adult thumbs enter toward her cheeks; cut before they touch',
    intent: 'Same axis as AD_out, pushed in. Two adult hands come in from either side of the lens, thumbs leading, and stop a hand-width short of her cheeks. The adult is behind the camera: only forearms and hands are in frame.',
    figs: { littleJade: jadeUp(),
      mama: { at: [1.36, 0.10], yaw: -65, legs: 'kneel', spine: { bend: 8 }, head: { look: 'littleJade:eyes' },
        L: { to: 'littleJade:mouth', off: [0.189, -0.01, 0.004], hand: 'thumbsUp', fingers: [-1.228, 0.1, 0.002], palm: 'down', elbow: 'down' },   // R mirrored in the camera's vertical plane (integration pass)
        R: { to: 'littleJade:mouth', off: [0.118, -0.01, -0.148], hand: 'thumbsUp', fingers: [-0.79, 0.1, 0.94], palm: 'down', elbow: 'down' } } } },
  // ---------------------------------------------------------------- 1:08.3 piano break, second four bars
  { id: 'AD_piano', lens: 40, orbit: { at: 'keys', az: 62, el: 30, dist: 0.95 }, aim: [{ mid: ['littleJade:handL', 'littleJade:handR'] }, 0.5, 0.66], position: 'inside', time: '1:08.3-1:13.2', section: 'Piano break (attic half)', beamAnchor: 'keys',
    header: '1:08.3 low on the paper keys: her fingers play the melody we hear',
    intent: 'Low and close across the printout from the window side, just outside the beam: both hands on the paper keys in the light, her face above them in shadow, looking down. Fingering comes from the note onsets (renderer layer); the keyboard quad is in the sidecar.',
    figs: { littleJade: jadeKeys() } },
  { id: 'AD_frost_look', lens: 50, pos: [0.12, 0.70, 0.92], aim: ['window', 0.7, 0.34], position: 'inside', time: '1:13.2-1:17.2', section: 'Piano break (attic half)', beamAnchor: 'beamMid',
    header: '1:13.2 over her shoulder: she looks up at the frost on the pane',
    intent: 'From behind her right shoulder along her new eye-line: her head lifts from the keys to the window. The four frosted panes are the brightest thing; the shaft comes from them toward us.',
    figs: { littleJade: jadeKeys({ spine: { bend: 20 }, head: { look: 'fern' } }) } },
  // ---------------------------------------------------------------- 1:36.0 "How do you feel?" and the band hit
  { id: 'AD_trace', lens: 50, pos: [2.98, 1.06, -0.48], aim: ['fern', 0.5, 0.55], position: 'inside', time: '1:36.0-1:37.4', section: '"How do you feel?"', beamAnchor: 'fernMid',
    header: '1:36.0 match cut on the pointing finger: five years old, tracing the frost fern',
    intent: 'Close on her right index finger on the lower pane, following the fern from its root. Framed so the fingertip sits where the pointing finger sat in the school office. She kneels on the cushion at the sill, in the full light.',
    figs: { littleJade: jadeSill() } },
  // THE GRAB framing (shared with market93 M4; see NOTES.md): 50 mm, 0.92 m from the grabbed forearm, 31 deg above it,
  // 30 deg round to the child's right, the forearm's midpoint at (0.5, 0.52), the adult forearm entering on a diagonal from
  // the upper corner. Here the camera is BEHIND her (the window wall is 0.1 m in front of her hand; her forward is az 90,
  // camera az 300), so Mama's hand enters from frame RIGHT; in the market (camera in front) it enters from frame left.
  // (Was: pos [2.72, 1.22, -0.12] aimed at the wrist: 0.90 m, 31 deg up, 33 deg round; the change is small.)
  { id: 'AD_grab', lens: 50, orbit: { at: { mid: ['littleJade:wristR', 'littleJade:elbowR'] }, az: 300, el: 31, dist: 0.92 }, aim: [{ mid: ['littleJade:wristR', 'littleJade:elbowR'] }, 0.5, 0.52], position: 'outside', time: '1:37.4', section: 'Band hits', beamAnchor: 'fernMid',
    header: '1:37.4 a hand closes on her forearm (then cut to black)',
    intent: "Mama's hand comes in from frame right and closes on the forearm of the tracing hand; the finger is still on the glass. First of the three forearm grabs. Mama kneels beside her, between the cushion and the textbook stack; only her arm needs to be in frame.",
    figs: { littleJade: jadeSill(),
      mama: { at: [3.20, 0.02], yaw: 176, legs: 'kneel', spine: { bend: 16 }, head: { look: 'littleJade:head' },
        R: { to: 'littleJade:wristR', off: [-0.06, 0.012, 0.0], hand: 'grip', palm: 'down', fingers: [0.1, -0.5, -1] }, L: 'kneeL' } } },
  // ---------------------------------------------------------------- 3:43 tail 2
  { id: 'AD_fern', lens: 50, pos: [2.74, 0.66, -0.60], target: [3.49, 0.66, -0.60], position: 'plate', time: '3:43.0-3:55.0 (-2sm; outro line 1 enters over it at 3:54.0)', section: 'Tail 2', beamAnchor: 'fernMid',
    header: '3:43 plate: the frost fern pane, square on (the fern regrows and becomes a neuron)',
    intent: 'Square on to the lower pane with the fern, from inside. No figure. The procedural fern grows from its root in the lower right corner; the pane quad and the root and tip are in the sidecar. The frame widens with the arbor in the renderer, not in the set.',
    figs: {} },
];
const TWINS = BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }));
export const SHOTS = BASE.concat(TWINS);
