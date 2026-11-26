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
import { kidAtSill, mamaGrab, GRAB_P } from './grabpose.js';   // r4b: both standing at the sill (grab_search.mjs)

// ---------------------------------------------------------------- recurring poses
// r3: fingers softly curved on the flat paper (playing posture), not flat
const KEYHAND = { shape: 'flat', curl: { all: [18, 34, 16] } };
// at the paper keyboard: cross-legged in the tail of the beam, facing up the beam; hands on the keys
const jadeKeys = (o = {}) => ({ at: SEAT.at, yaw: SEAT.yaw, legs: 'cross', spine: { bend: 38 }, head: { look: 'keys' },
  L: { to: 'keysL', hand: KEYHAND, palm: 'down', fingers: 'fwd' }, R: { to: 'keysR', hand: KEYHAND, palm: 'down', fingers: 'fwd' }, ...o });
// the same seat, sitting up: hands off the keys, face toward the outside camera, eyes on the mote
const FACE_AZ = 115;                                   // the direction her face points (orbit az: 0 = +z, 90 = +x); the mote is 15 deg to her left of it
const jadeUp = (o = {}) => ({ at: SEAT.at, yaw: SEAT.yaw, legs: 'cross', spine: { bend: 10 }, head: { look: [1.38, 0.59, 0.09] }, L: 'kneeL', R: 'kneeR', ...o });
// at the sill: kneeling on the cushion, right index finger on the frost fern
const jadeSill = (o = {}) => ({ at: READING.kneel, floor: READING.cushion.t, yaw: 90, legs: 'kneel', spine: { bend: 6 }, head: { look: 'fern' },
  R: { to: 'fern', off: [-0.085, -0.015, 0.02], hand: 'point', fingers: [1, 0.2, -0.12], palm: 'down' }, L: { to: 'sill', off: [-0.02, 0.05, -0.22], hand: 'flat', palm: 'down', fingers: 'fwd' }, ...o });

// r4b: the grab's grip (grabpose.js GRIP) replaces r4's GRAB_R (kneeling Mama, palm on top): same forearm grip at 0.5
// elbow -> wrist, now from a standing Mama, palm turned GRAB_P.palm deg toward her side, hold.r GRAB_P.holdR.
// r4b standing at the sill (Jade: "no one is kneeling"): AD_trace and AD_grab are one moment, so she stands in both.
const jadeAtSill = () => kidAtSill(GRAB_P);
const BASE = [
  // ---------------------------------------------------------------- 0:05 taps, whisper 1
  { id: 'AD_wide', lens: 24, pos: [0.2, 1.15, 2.1], aim: ['beamMid', 0.52, 0.5], position: 'wide', time: '0:05', section: 'Taps (header: Attic, 1988)', beamAnchor: 'beamMid',
    header: '0:05 master: the attic by day, one shaft of low sun',
    intent: 'Establishing frame for the header. The window is the only opening; the sun comes through the four panes and falls as one diagonal shaft from upper right to lower left, ending on the paper keyboard where she sits. Everything else is paper.',
    figs: { jade4h: jadeKeys() } },   // r3: 4.5 years old, white socks (build.js jade4h)
  { id: 'AD_keys', lens: 35, orbit: { at: 'keys', rel: 'littleJade', az: 180, el: 64, dist: 0.62 }, aim: ['keys', 0.5, 0.52], hideParts: { littleJade: ['head'] }, position: 'inside', time: '0:05-0:07 (and coda bar 3, 4:19.2-4:21.7, -2sm)', section: 'Taps', beamAnchor: 'keys',
    header: '0:05 inside: her fingers tap on the paper keyboard in the light',
    intent: 'Her own view down at her hands (her head hidden for the POV). The printout is square to her, low notes at her left; both hands on the keys, the sun raking across the paper from the top right. The taps we hear start here. Reused in the drum coda.',
    figs: { littleJade: jadeKeys() } },
  { id: 'AD_mote', lens: 28, eyeline: { who: 'littleJade', to: 'mote', back: 0.14 }, aim: ['mote', 0.5, 0.5], position: 'inside', time: '0:09-0:16.7 (and coda hit + bar 1, 4:14.3-4:16.8, -2sm: the ringed mote; the diagonal for the 0:00 pad)', section: 'Taps', beamAnchor: 'mote',
    header: '0:09 INSIDE / RHYME FRAME: along her eye-line to the mote; the beam is the diagonal',
    intent: 'The inside position, and the frame the beams rhyme on. Along her eye-line: the mote at the centre of frame, the frosted window top right, the shaft crossing from upper right to lower left at 40 degrees. The mote drifts right, out through the near face of the beam, and comes back in. The gold ring and the dotted line are drawn here. The 0:00 pad paints the same diagonal band on bare paper.',
    figs: { littleJade: jadeUp() } },
  // ---------------------------------------------------------------- 1:08.3 piano break, second four bars
  { id: 'AD_piano', lens: 35, orbit: { at: 'keys', az: 62, el: 28, dist: 1.3 }, aim: [{ mid: ['jade4h:handL', 'jade4h:handR'] }, 0.5, 0.64], position: 'inside', time: '1:08.3-1:13.2', section: 'Piano break (attic half)', beamAnchor: 'keys',
    header: '1:08.3 low on the paper keys: her fingers play the melody we hear',
    intent: 'Low and close across the printout from the window side, just outside the beam: both hands on the paper keys in the light, her face above them in shadow, looking down. Fingering comes from the note onsets (renderer layer); the keyboard quad is in the sidecar.',
    figs: { jade4h: jadeKeys() } },   // r3: 4.5 years old, white socks
  { id: 'AD_frost_look', lens: 50, pos: [0.12, 0.70, 0.92], aim: ['window', 0.7, 0.34], position: 'inside', time: '1:13.2-1:17.2', section: 'Piano break (attic half)', beamAnchor: 'beamMid',
    header: '1:13.2 over her shoulder: she looks up at the frost on the pane',
    intent: 'From behind her right shoulder along her new eye-line: her head lifts from the keys to the window. The four frosted panes are the brightest thing; the shaft comes from them toward us.',
    figs: { littleJade: jadeKeys({ spine: { bend: 20 }, head: { look: 'fern' } }) } },
  // ---------------------------------------------------------------- 1:36.0 "How do you feel?" and the band hit
  // r5 (Jade, 2026-11-26: the hand "reads as a thumbs-up, not a tracing finger"; BO2 -> AD_trace is now a PLAIN cut, so no
  // finger match): restaged by measurement (trace_search.mjs, trace_preview.mjs). Her index FINGERTIP is on fernMid (the
  // engine's `tip` option, grabpose.js TRACE_R), the finger laid almost square to the glass, the other fingers curled,
  // the thumb resting on them. The camera moved round to her right side, behind and above her right shoulder blade, so the
  // finger is seen side-on against the frosted pane with her face in profile above it, eyes on the fingertip (gaze
  // target fernMid). Was: 40 mm from straight behind her right shoulder, [3.0, 1.0, -0.3], fingertip at (0.5, 0.55): the
  // finger stood up out of the fist, end-on to the lens, and read as a thumbs-up.
  { id: 'AD_trace', lens: 35, pos: [3.05, 1.08, 0.02], aim: ['littleJade:indexR', 0.6, 0.66], position: 'inside', time: '1:36.0-1:37.4', section: '"How do you feel?"', beamAnchor: 'fernMid',
    header: '1:36.0 (plain cut from BO2) five years old, her fingertip on the frost fern',
    intent: 'Her right index fingertip on the lower pane, on the frost fern, the other fingers curled; seen from her right side so the finger reads side-on against the glass. Her face in profile above it, looking at where the finger touches. She stands at the sill, in the full light (r4b: standing, as in the grab a moment later). r5: a plain cut from BO2, not a match cut.',
    figs: { littleJade: jadeAtSill() } },
  // r4b CAMERA (grab_camera.mjs, 200 candidates scored on the id pass): from the window corner, 24 mm, low over the sill board
  // at the child's left, looking back into the room: her finger on the frosted pane frame left, Mama's hand closing on her
  // forearm, Mama's face bent over her, and on the floor beyond them the paper keyboard, whole (all four corners), in the
  // tail of the beam. Was THE GRAB framing shared with market93 M4 (50 mm, 0.92 m, 31 deg up, 30 deg round to her right):
  // with both standing, an orbit of that size round the forearm finds no frame that also holds the keyboard (it is 3 m
  // away across the room), and from her back Mama's body covers the grab. FLAG: M4 / M4b may want a matching wide.
  { id: 'AD_grab', lens: 24, pos: [3.224, 1.164, -1.805], target: [2.744, 0.62, -0.396], position: 'outside', time: '1:37.4', section: 'Band hits', beamAnchor: 'fernMid',
    header: '1:37.4 a hand closes on her forearm (then cut to black)',
    intent: "Mama's hand comes down and closes on the forearm of the tracing hand; the finger is still on the glass. First of the three forearm grabs. Both stand: Mama has rushed in and bends over her daughter's right side, knees bent, to grab her and go.",
    figs: { littleJade: jadeAtSill(),
      // r4b (Jade: "mom's arm is really unnatural and clips thru the window ... no one is kneeling ... both people are
      // standing"): Mama STANDS at the child's right, beyond the textbook stack, knees bent and bent forward at the hips (a
      // rush, not a stoop), turned toward her, and closes her right hand round the middle of the child's right forearm (the
      // forearm grip kept: palm on its near top, fingers round the far side and under, thumb round the near side). Solved
      // with the engine's IK within joint limits and checked with Rapier on the mesh bodies (grab_search.mjs,
      // engine/clipcheck.mjs): no penetration of the window, the walls, the stack or the child; numbers in NOTES.md.
      // Was (r4): kneeling, forearm through the window frame by 24.5 mm, into the stack by up to 21.5 mm.
      mama: mamaGrab(GRAB_P) } },
  // ---------------------------------------------------------------- 3:43 tail 2
  { id: 'AD_fern', lens: 50, pos: [2.74, 0.66, -0.60], target: [3.49, 0.66, -0.60], position: 'plate', time: '3:43.0-3:55.0 (-2sm; outro line 1 enters over it at 3:54.0)', section: 'Tail 2', beamAnchor: 'fernMid',
    header: '3:43 plate: the frost fern pane, square on (the fern regrows and becomes a neuron)',
    intent: 'Square on to the lower pane with the fern, from inside. No figure. The procedural fern grows from its root in the lower right corner; the pane quad and the root and tip are in the sidecar. The frame widens with the arbor in the renderer, not in the set.',
    figs: {} },
];
// RETIRED in r3 (Jade 2026-11-25): "you need facial expressions" is said to her at about 10, not at 5 in the attic, so the two
// outside whisper shots leave this set (restaged at 10 by office91 / elsewhere). Kept here for reference only: NOT rendered.
// Their old renders are in media/layout/attic88_day/_retired/.
export const RETIRED = [
  { id: 'AD_out', lens: 32, orbit: { at: 'littleJade:eyes', az: FACE_AZ, el: 0, dist: 0.8 }, aim: ['littleJade:eyes', 0.5, 0.36], focus: ['littleJade'], position: 'outside', time: '0:07-0:18.2', section: 'Taps, whisper 1 at 0:08.8', beamAnchor: 'keysNear',
    header: '0:07 OUTSIDE: frontal, level, locked off on her face; eyes on one mote',
    intent: 'The outside position. Level with her eyes, square to her face, locked off. Her face is above the light; her knees and the keyboard at the bottom of frame are in it. Her eyes are on one mote 15 degrees to her left of the lens; they keep travelling when it leaves the beam. The whisper lands on this face (toner label space either side of her head).',
    figs: { littleJade: jadeUp() } },
  // ---------------------------------------------------------------- 0:18.2 whisper 2
  { id: 'AD_thumbs', lens: 40, orbit: { at: 'littleJade:eyes', az: FACE_AZ, el: 0, dist: 0.66 }, aim: ['littleJade:eyes', 0.5, 0.4], focus: ['littleJade'], position: 'outside', time: '0:18.2-0:19.0', section: 'Whisper 2', beamAnchor: 'keysNear',
    header: '0:18.2 OUTSIDE, closer: two adult thumbs enter toward her cheeks; cut before they touch',
    intent: 'Same axis as AD_out, pushed in. Two adult hands come in from either side of the lens, thumbs leading, and stop a hand-width short of her cheeks. The adult is behind the camera: only forearms and hands are in frame.',
    figs: { littleJade: jadeUp(),
      mama: { at: [1.36, 0.10], yaw: -65, legs: 'kneel', spine: { bend: 8 }, head: { look: 'littleJade:eyes' },
        L: { to: 'littleJade:mouth', off: [0.189, -0.01, 0.004], hand: 'thumbsUp', fingers: [-1.228, 0.1, 0.002], palm: 'down', elbow: 'down' },   // R mirrored in the camera's vertical plane (integration pass)
        R: { to: 'littleJade:mouth', off: [0.118, -0.01, -0.148], hand: 'thumbsUp', fingers: [-0.79, 0.1, 0.94], palm: 'down', elbow: 'down' } } } },
];
const TWINS = BASE.map((s) => ({ ...s, id: 'beam_' + s.id, beamMask: true, header: 'beam mask for ' + s.id }));
export const SHOTS = BASE.concat(TWINS);
