// PLAYGROUND, AUSTIN, 2023. SINGLE SOURCE OF TRUTH (metres, y up, ground at y = 0).
// The last bar of the drum coda and the final shot. Very small: glass, low sun through it, a family of three
// reflected as silhouettes, one mote.
//
// The glass is the playground's wooden clubhouse, which has a big acrylic FRONT PANE and a smaller BACK WINDOW.
// The low sun is behind the clubhouse. It comes through the back window and crosses the dim, dusty room as one
// shaft: the beam. The family stands in front, in the clubhouse's own shade, looking in through the front pane. Behind
// them the playground is in full sun, so their reflections in the front pane are silhouettes. The mote is in the beam.
// (A beam entering by the same pane you look through cannot read as a diagonal: every sight line starts inside it.
// Hence two panes: the sun's and the family's.)
//   z = 0 is the front pane. z > 0 = outside, the family. z < 0 = inside. z = -2.6 = back wall with the sun's window.
//   x: -2.2 = left wall ... +1.0 = right wall. A camera looking at the pane (toward -z) has -x frame-left.
const rad = (d) => (d * Math.PI) / 180;

export const HOUSE = { x0: -2.2, x1: 1.0, z0: -2.6, z1: 0.0, h: 2.3, wallT: 0.06, door: { z0: -2.3, z1: -1.5, h: 1.5 } };   // doorway in the LEFT wall (shade side)
export const PANE = { x0: -0.75, x1: 0.75, y0: 0.7, y1: 1.9, z: 0.0, frame: 0.06 };          // the family's pane
export const BACKWIN = { x0: 0.1, x1: 0.7, y0: 1.1, y1: 1.9, z: -2.6, frame: 0.05 };         // the sun's pane
export const BENCH = { x0: -2.15, x1: -1.2, z0: -1.3, z1: -0.95, h: 0.32 };                  // a low bench on the left wall

// ---------------------------------------------------------------- the family (pelvis x, z; all face the glass)
// ASSUMPTION: the family is adult Jade, her partner, and their child, who in 2023 is a toddler carried on the
// partner's arm, so that all three faces are at pane height.
export const FAMILY = { jade: [0.62, 0.95], partner: [-0.1, 1.02], toddler: [0.16, 1.03, 0.9] };

// ---------------------------------------------------------------- the sun and the beam
// Late afternoon, altitude 25 deg, behind the clubhouse. In plan the light travels toward the family (+z) and 24 deg
// to their left (-x). Chosen so that (1) the shaft lands on the floor and the foot of the front wall and never leaves
// through the front pane, and (2) on PG2 (the eye-line frame) it crosses the screen from upper right to lower left
// about 40 deg below the horizontal: the attic's diagonal (attic88_day RHYME).
export const SUN = { altitude: 25, off_normal: 24, color: 0xffd9a0, sky: 0xbfd0e6, time: 'about two hours before sunset' };
const ca = Math.cos(rad(SUN.altitude));
export const SUN_DIR = [-ca * Math.sin(rad(SUN.off_normal)), -Math.sin(rad(SUN.altitude)), ca * Math.cos(rad(SUN.off_normal))];   // direction of TRAVEL
const W = BACKWIN;
const rect = [[W.x1, W.y1, W.z], [W.x0, W.y1, W.z], [W.x0, W.y0, W.z], [W.x1, W.y0, W.z]];   // TL, TR, BR, BL seen from outside the back wall
export const BEAM = { name: 'sun', kind: 'low sun through the clubhouse back window', dir: SUN_DIR, aperture: rect, centre: [(W.x0 + W.x1) / 2, (W.y0 + W.y1) / 2, W.z],
  clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, { name: 'left wall', n: [-1, 0, 0], d: -HOUSE.x0 }, { name: 'front wall', n: [0, 0, 1], d: HOUSE.z1 }] };
export const beamFrom = (p, t) => p.map((c, i) => c + SUN_DIR[i] * t);

// ---------------------------------------------------------------- the mote
// One seeded field for the set; the hero mote is fixed. It hangs 2.3 m down the beam, 0.2 m under the beam's top
// face and nearer the front pane than the reflections' virtual images. It drifts up, out through the top of the light
// (4:35), and the gold dotted line continues along `after` and stops.
const hero = beamFrom([0.4, 1.7, W.z], 2.3);
export const MOTE = { seed: 2023, count: 400, hero, exit: [hero[0] + 0.05, hero[1] + 0.3, hero[2]], after: [hero[0] + 0.12, hero[1] + 0.5, hero[2]] };

// ---------------------------------------------------------------- outside
export const SWING = { x: 2.6, z: 3.6, w: 2.4, h: 2.2 };
export const LIGHTS = {
  sun: { kind: 'low sun behind the clubhouse, through its back window (parallel)', dir: SUN_DIR, color: SUN.color },
  sky: { kind: 'open sky (ambient); the clubhouse interior gets it only through the two panes and the doorway', color: SUN.sky },
};
