// PLAYGROUND, AUSTIN, 2023. SINGLE SOURCE OF TRUTH (metres, y up, floor at y = 0).
// r4 rebuild (2026-11-26): the playground is an indoor children's play centre in Austin (Jade: "the playground is Catch
// Air in Austin"; "most of catch air is far from windows, it's all indoor overhead lights, and it's all space themed").
// Generic and UNBRANDED: no names, signs, logos or brand marks anywhere (it is a real business).
//
// Jade (r4): "(b) would be good, and instead of looking at reflections (which is a bit boring to look at), we can have me
// and my dad offering a hand to the 2 kids getting into a play space shuttle"; "the shot for the space shuttle should
// be from behind so we don't look closely at the kids faces".
//
// The room: deep inside a big dark hall (black open-web joists, black deck), lit by round LED high-bay fixtures; padded
// vinyl floor printed with orbits and planets; a space mural on the back wall; a three-level soft-play structure
// behind; hanging planets. In front of it a soft-play SPACE SHUTTLE lies on the floor, nose to the right, with two
// hatches on the side facing the camera. The girl (4) climbs into the front hatch with Jade's hand; the boy (7) is
// about to climb into the rear hatch with Dad's hand. The cameras are behind them (no child's face is ever readable).
//
// THE BEAM (Jade's option b): a theatrical accent spot clamped high on a joist above and beyond the shuttle's nose,
// aimed down-left onto the shuttle's tail fin. In the dusty air its cone reads as a shaft; one mote hangs in it above
// the shuttle. On PG2 (Jade's eye-line, she looks up from the girl to the mote) the shaft crosses the frame from upper
// right to lower left at the attic's 40 degrees, the mote at the centre (attic88_day RHYME).
//   x: right on screen (cameras look toward -z).  z > 0: toward the cameras.  The shuttle's axis is at z = -1.45.
const rad = (d) => (d * Math.PI) / 180;

export const HALL = { x0: -8, x1: 8, z0: -9, z1: 6, joistY: 5.0, deckY: 5.8, joistDZ: 1.5 };

// ---------------------------------------------------------------- the play shuttle (soft play: foam over a frame, vinyl skin)
// Fuselage: a cylinder along x, radius R, on a low black cradle; nose cone to +x; tail fin and delta wings at the rear.
// Two hatches on the +z side (kid height): the sill is the cabin deck inside. Each has a padded step in front.
export const SHUTTLE = { y: 0.74, z: -1.45, r: 0.64, x0: -1.75, x1: 1.45, nose: 0.75, wall: 0.06, deck: 0.42,
  fin: { x0: -1.75, x1: -1.05, top: 2.2, t: 0.12 }, wing: { x0: -1.75, x1: -0.95, y: 0.3, span: 0.95, t: 0.1 } };
export const HATCHES = { front: { x0: 0.25, x1: 0.85, y0: 0.42, y1: 1.08 }, rear: { x0: -0.95, x1: -0.35, y0: 0.42, y1: 1.08 } };
export const STEP = { h: 0.22, z0: -0.92, z1: -0.5 };          // padded steps, the width of each hatch

// ---------------------------------------------------------------- the people (pelvis x, z). Seen from behind.
// The girl (4, 1.09 m) stands on the front step, about to climb in, her right hand back in Jade's hand.
// The boy (7, 1.32 m) stands on the rear step, right hand on the hatch frame, left hand back in Dad's open right hand.
// WHO HELPS WHOM was chosen for the composition (flagged): Jade is nearer the camera-right and the nose; the smaller
// child, who needs the step, is hers; Dad (67) helps the boy, who needs less lift.
export const PEOPLE = { girl: [0.55, -0.66], boy: [-0.62, -0.68], jade: [0.92, -0.25], dad: [-0.97, -0.3] };
// where the hands meet (the CHILD's palm centre): the child's hand hangs a little back and out, palm turned back; the
// adult's open hand comes from behind and takes it palm to palm (adult palm facing forward, fingers down round it)
export const HANDS_MEET = { jade_girl: [0.7, 0.78, -0.5], dad_boy: [-0.8, 0.88, -0.56] };
export const PALM_GAP = { jade: 0.057, dad: 0.079 };   // adult hand-centre offset behind the child's palm centre (z, m): tuned with holdcheck (contact, no penetration)

// ---------------------------------------------------------------- the beam: an accent spot onto the shuttle's tail fin
export const SPOT = { at: [3.25, 4.2, -2.5], halfAngle: 2.5, color: 0xfff1d8, kind: 'theatrical LED accent spot on a drop pipe from a joist, aimed at the play shuttle' };
export const MOTE_HERO = [0.1, 1.75, -1.8];
export const SPOT_DIR = (() => { const d = MOTE_HERO.map((v, i) => v - SPOT.at[i]); const l = Math.hypot(...d); return d.map((v) => v / l); })();
export const MOTE = { seed: 2023, count: 400, hero: MOTE_HERO,
  exit: [MOTE_HERO[0] + 0.06, MOTE_HERO[1] + 0.32, MOTE_HERO[2] + 0.05], after: [MOTE_HERO[0] + 0.14, MOTE_HERO[1] + 0.52, MOTE_HERO[2] + 0.08] };

// ---------------------------------------------------------------- the room's light: round LED high-bays on a 3 m grid
export const FIXTURES = (() => { const out = []; for (let x = -6; x <= 6; x += 3) for (let z = -7.5; z <= 4.5; z += 3) out.push([x, HALL.joistY - 0.35, z]); return out; })();
export const LIGHTS = {
  highbays: { kind: 'round LED high-bay fixtures (UFO type), cool white, on a 3 m grid under the joists; the room light', color: 0xf2f6ff },
  spot: { kind: SPOT.kind, color: SPOT.color },
};

// ---------------------------------------------------------------- the soft-play structure behind (three levels)
export const STRUCT = { x0: -6.0, x1: 4.5, z0: -7.6, z1: -4.0, bay: 1.5, levels: [0, 1.2, 2.4], roof: 3.6 };
// hanging planets (centre, radius, skin): the violet one hangs left of the shuttle; none is in the beam
export const PLANETS = [{ at: [-3.6, 3.4, -2.6], r: 0.6, skin: 'violet' }, { at: [2.6, 3.7, -5.0], r: 0.5, skin: 'ringed', ring: true }, { at: [-0.6, 4.0, -6.0], r: 0.35, skin: 'moon' }];
export { rad };
