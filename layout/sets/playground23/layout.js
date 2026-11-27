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

// ---------------------------------------------------------------- the play shuttle (r5: rebuilt to Jade's photo)
// Jade (r5) added inputs/catchair_shuttle.png: a real photo of the real shuttle, LOOK-ONLY (never sent to an image
// model). Read from it: a LOW white soft-play shuttle lying on the floor (no cradle, no hatches, no tail fin in view):
// a rounded white nose with a black wrap-round windscreen band and a black chin; a black padded block beside it; a
// black-and-white PANELLED wing that slopes from the body down to the floor as a ramp (white panels in black frames);
// a taller rear section with a crawl-through ARCH and black slanted stripes on its rounded top; another panelled wing
// flat on the floor beyond. Behind it in the photo: a red-and-white soft-play rocket, hanging planets, an astronaut.
// Scale from the photo (bar stools, the 4-year-old-sized arch): nose ~0.75 m, rear section ~0.95 m, ~4.3 m long.
// Pieces along x (nose to +x), the body centred on z = SHUTTLE.z, its camera-side face at z = -1.0:
export const SHUTTLE = { z: -1.55, half: 0.55, top: 0.62, x0: -1.15, x1: 0.75, nose: 1.3, tipY: 0.3,
  rear: { x0: -2.3, x1: -1.15, top: 0.95, arch: { cx: -1.72, w: 0.58, h: 0.62 } },
  // r6 (Jade: "the inside of the space shuttle should be hollowed out and have seats the way it does in the photo"):
  // read from the photo, the body between the arched rear section and the nose cowl is an OPEN-TOPPED cabin (a padded
  // tub): the outer shape and size are unchanged, the top is open between the rear section's face and the cowl, the
  // side walls are 7 cm foam with a flat rim where the rounded top corner begins, a black padded floor inside; the nose
  // cowl (windscreen band) stays closed and its back face is the cabin's front wall. The photo shows one black
  // high-backed bucket seat right behind the cowl, its back standing well above the rim, facing the nose. Built as TWO
  // black padded bucket seats one behind the other on the centre line (pilot behind the cowl, as the photo; a second
  // seat mid-cabin, which is also the one PG1 can see between the children). FLAGGED: the second seat and the tandem
  // (not side-by-side) layout are read, not seen; the photo shows one seat.
  cabin: { x0: -1.15, x1: 0.62, wall: 0.07, rim: 0.52, floor: 0.1 } };
// the cabin seats: black padded bucket seats (a cushion and a tall rounded back), facing the nose (+x); x = the back's
// rear face, x1 = the cushion's front, dz across the cabin from its axis
export const SEATS = { w: 0.42, t: 0.12, top: 0.82, cushionTop: 0.3, list: [{ x: 0.14, x1: 0.55, dz: 0 }, { x: -0.56, x1: -0.16, dz: 0 }] };
// the camera-side wing = the panelled ramp: top edge on the body side at z = -1.0 (y 0.52), outer edge on the floor
export const RAMP = { x0: -0.35, x1: 0.62, xOut0: -0.2, xOut1: 0.4, zTop: -1.0, yTop: 0.52, zOut: -0.1, yOut: 0.06, panels: 3 };
export const rampY = (z) => RAMP.yOut + (RAMP.yTop - RAMP.yOut) * (RAMP.zOut - z) / (RAMP.zOut - RAMP.zTop);   // the ramp's top surface
// the black padded block beside the body (the photo's black block): the boy's step up
export const STEP = { x0: -1.08, x1: -0.45, z0: -1.0, z1: -0.58, h: 0.32 };
// set dressing from the photo: a soft-play rocket (red and white bands) and a hanging astronaut (generic, no character)
export const ROCKET = { at: [-1.9, -3.3], r: 0.42, body: 1.9, cone: 0.75 };
export const ASTRONAUT = { at: [1.5, 2.3, -3.6], h: 0.9 };

// ---------------------------------------------------------------- the people (pelvis x, z). Seen from behind.
// Jade (r5): "You with the girl, Dad with the boy". Each child is MID-CLIMB and reaches back to a clearly held hand:
// - the girl (4, 1.09 m) is halfway up the panelled ramp on the balls of her feet, her left hand on the ramp ahead,
//   her right hand reaching back to Jade, who holds it (Jade stands on the floor behind her, to her right);
// - the boy (7, 1.32 m) has his right foot up on the black block and his right hand on the top of the body, his left
//   hand reaching back to Dad, who holds it (Dad stands behind him, to his left).
// The hold (both pairs): hand in hand, palm to palm as in a handshake; the adult's fingers wrap round the child's hand
// (engine hold: a cylinder through the child's palm centre, axis along the child's palm width), the child's fingers
// lie along the adult's palm. Measured with holdcheck (figure:<child>:hand) and clipcheck.
export const PEOPLE = { girl: [0.12, -0.66], boy: [-0.74, -0.5], jade: [0.69, -0.28], dad: [-1.24, -0.2] };
export const HANDS_MEET = { jade_girl: [0.34, 0.8, -0.57], dad_boy: [-1.03, 0.74, -0.33] };   // the children's held palms: reachable (arm reach <= 1), back, a little out and down
export const HOLD_R = { girl: 0.058, boy: 0.07 };     // the clasp: the wrapped radius round the child's hand (half its width + skin)

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
