// MARKET 1993 — single source of truth for numbers (metres, y up, floor at y = 0).
// The produce department of Marketplace on Oakton, Skokie, 1993 (comparable store: inputs/refs_devon_market).
// One long aisle runs along z. Looking along +z (the way little Jade faces and is later walked away):
//   x < -0.9  grocery gondola shelving      x > +0.9  produce islands
//   z = -9 back wall with a refrigerated wall case                   z = +9 front of the store (checkouts, not built)
// Cameras that look at her face look toward -z: the islands are frame-RIGHT and the gondola frame-LEFT in those.
// Cameras that look the way she is led (+z) have the islands frame-left.
// Assumptions are listed in NOTES.md next to this file.

export const STORE = { x0: -6.2, x1: 7.6, z0: -9, z1: 9, ceil: 3.35 };          // drop ceiling
export const AISLE = { x0: -0.9, x1: 0.9 };                                        // the aisle she blocks: 1.8 m clear

// ---------------------------------------------------------------- produce islands
// Double-sided tilted beds on a skirted base: rim (aisle edge of the bed) 0.80, ridge 1.12 down the middle, a lip board
// at each long edge, bins `bin` long along z.
export const ISLAND = { w: 1.6, len: 3.6, rim: 0.80, ridge: 1.12, lip: 0.07, lipT: 0.03, bin: 0.6, kick: 0.1, kickIn: 0.08 };
export const ISLANDS = [
  { id: 'hero', x0: 0.9, z0: -1.7, awning: false },      // the island she stands at (open to the tubes)
  { id: 'row1_front', x0: 0.9, z0: 3.1, awning: false }, // same row, toward the front; cross aisle z 1.9 .. 3.1
  { id: 'row1_back', x0: 0.9, z0: -6.5, awning: false }, // same row, toward the back; cross aisle z -2.9 .. -1.7
  { id: 'row2_mid', x0: 3.9, z0: -1.7, awning: true },   // second row (aisle x 2.5 .. 3.9), timber posts + striped awnings
  { id: 'row2_front', x0: 3.9, z0: 3.1, awning: true },
  { id: 'row2_back', x0: 3.9, z0: -6.5, awning: true },
];
export const AWNING = { post: 0.12, postH: 2.2, eave: 2.0, ridge: 2.45, over: 0.25, valance: 0.22 };
// bed height at x for an island whose aisle edge is x0 (both slopes)
export const bedY = (x, x0 = 0.9) => { const u = Math.min(Math.abs(x - x0), Math.abs(x0 + ISLAND.w - x)) / (ISLAND.w / 2); return ISLAND.rim + (ISLAND.ridge - ISLAND.rim) * Math.min(Math.max(u, 0), 1); };
// hero island, aisle side: bins along z from z0 (index 0) to z1 (index 5)
export const HERO_BINS = ['cabbages', 'eggplants', 'grapefruit', 'artichokes', 'romanesco', 'oranges'];
export const binZ = (i, z0 = -1.7) => [z0 + i * ISLAND.bin, z0 + (i + 1) * ISLAND.bin];

// ---------------------------------------------------------------- shelving and cases
export const GONDOLA = { h: 1.8, shelves: [0.15, 0.55, 0.9, 1.22, 1.52], bay: 1.2, base: 0.15,
  runs: [{ id: 'A', x0: -1.8, x1: -0.9, z0: -7, z1: 7, detail: true }, { id: 'B', x0: -4.4, x1: -3.5, z0: -7, z1: 7, detail: false }] };
export const WALLCASE = { d: 0.7, h: 2.0, decks: [0.45, 0.85, 1.2, 1.52], canopy: 0.25,
  runs: [{ id: 'side', along: 'z', x: STORE.x1, z0: -8.2, z1: 8.2 }, { id: 'back', along: 'x', z: STORE.z0, x0: -1.0, x1: 6.8 }] };
export const WALLSHELF = { x0: STORE.x0, d: 0.45, h: 2.0 };
// a pallet of melon cartons left in the aisle on the gondola side: with her standing 0.25 m off the island, the gap
// between her and the cartons (0.49 m) is narrower than the cart (0.593 m, r5). That is why the grandmother has to wait.
export const PALLET = { x0: -0.9, x1: -0.1, z0: -0.55, z1: 0.45, h: 0.14, carton: [0.38, 0.25, 0.48], layers: 3 };
export const SCALE = { at: [1.7, -2.3], y: 1.75 };            // hanging produce scale over the cross aisle behind
export const AISLE_SIGN = { x: 0, z: 2.5, y: 2.45, w: 1.3, h: 0.32 };   // hanging aisle marker over the cross aisle ahead

// ---------------------------------------------------------------- the light: rows of bare fluorescent tubes
// Chain-hung bare two-tube strips (4 ft, T12), rows along z every 2.4 m in x, strips every 1.5 m along the row.
export const TUBES = { y: 2.9, len: 1.22, pitch: 1.5, tubeR: 0.019, tubeGap: 0.07, channel: [0.11, 0.045], z_first: -8.6, n: 12,
  rows: [-4.2, -1.8, 0.6, 3.0, 5.4] };
export const fixtureZ = (k) => TUBES.z_first + k * TUBES.pitch;                   // centre of strip k (0..n-1) in any row
// the film's beam: ONE strip, row x = 0.6 (over the island edge of the aisle), strip k = 6 (centre z = 0.4).
export const KEY = { row: 2, k: 6 };
// tubes that are out: the two strips behind the key in the same row (centres z = -1.1 and -2.6): the dark stretch
// the grandmother waits in.
export const DEAD = [{ row: 2, k: 5 }, { row: 2, k: 4 }];
// Beam volume = the downward prism under the key strip. Cut-off half-angles: across the tubes and past their ends.
export const BEAM = {
  src: { x: TUBES.rows[KEY.row], y: TUBES.y, z0: fixtureZ(KEY.k) - TUBES.len / 2, z1: fixtureZ(KEY.k) + TUBES.len / 2, w: 0.12 },
  crossDeg: 24, endDeg: 14, color: 0xf3f7ff,
};
// footprint of the beam on a horizontal plane at height y
export const beamRect = (y = 0) => { const S = BEAM.src, d = S.y - y, hx = S.w / 2 + d * Math.tan(BEAM.crossDeg * Math.PI / 180), ez = d * Math.tan(BEAM.endDeg * Math.PI / 180);
  return { x0: +(S.x - hx).toFixed(3), x1: +(S.x + hx).toFixed(3), z0: +(S.z0 - ez).toFixed(3), z1: +(S.z1 + ez).toFixed(3), y }; };
export const inBeam = (p) => { const r = beamRect(p[1]); return p[1] < BEAM.src.y && p[0] >= r.x0 && p[0] <= r.x1 && p[2] >= r.z0 && p[2] <= r.z1; };
export const LIGHTS = {
  key: { kind: 'bare two-tube fluorescent strip (the beam)', pos: [BEAM.src.x, TUBES.y, fixtureZ(KEY.k)], color: BEAM.color,
    footprint_floor: beamRect(0), footprint_bed: beamRect(0.95) },
  rows: { kind: 'the other tube rows: present and drawn, but outside the beam everything stays paper', color: 0xe9efff },
  dead: { kind: 'two strips with dead tubes, behind the key in its row', pos: DEAD.map((d) => [TUBES.rows[d.row], TUBES.y, fixtureZ(d.k)]) },
};

// ---------------------------------------------------------------- the two things in full depth
// Phyllotaxis (the romanesco; the artichoke uses the equal-area lattice of artichoke_spec.mjs): floret n sits at azimuth n * 137.5078 deg and at polar angle theta_n from the tip with
//   tan(theta_n / 2) = tan(theta0 / 2) * exp(lnG * n)
// (the conformal image of a cylinder lattice on the sphere, so the visible spiral families are the same everywhere).
// lnG = 2 pi / (sqrt(5) * a * b) makes the pair (a, b) the conspicuous one.
export const GOLDEN_DEG = 137.50776405003785;
export const ARTICHOKE = { R: 0.045, stretch: 1.04, N: 32, lattice: 'sin(theta_n) = 0.038 (n + 0.55) to theta 1.2 rad, then even steps; phi_n = n x 137.5 deg (artichoke_spec.mjs)',
  arms: [8, 5, 13], count: 8, shared: 'artichoke_spec.mjs -> artichoke_bracts.json (the same bracts as PLATE XVIII Fig. 1)',
  note: 'the film counts the 8 arms; bract n is on arm n % 8 (and n % 5 the other way); seen from the tip the 8-arms wind clockwise outward' };
export const ROMANESCO = { R: 0.075, stretch: 1.25, N: 143, theta0: 0.05, lnG: 2 * Math.PI / (Math.sqrt(5) * 8 * 13), arms: [13, 8, 21],
  sub: { arms: [5, 3], s0: 0.16 }, note: 'floret n is on arm n % 13 (and n % 8); every floret repeats the rule with 5 / 3 arms' };

// ---------------------------------------------------------------- blocking (fixed marks, so every shot agrees)
// A: she stands at the island, 0.25 m off it, turned 20 deg toward it, the artichoke lifted out of its bin.
export const JADE_STAND = { at: [0.52, 0.40], yaw: 20 };
const f = [Math.sin(JADE_STAND.yaw * Math.PI / 180), Math.cos(JADE_STAND.yaw * Math.PI / 180)];
// the artichoke in her hands: 0.30 m in front of her, 0.92 m up, its tip tipped 30 deg back toward her face
export const ART_HELD = { at: [+(JADE_STAND.at[0] + f[0] * 0.30).toFixed(3), 0.92, +(JADE_STAND.at[1] + f[1] * 0.30).toFixed(3)],
  axis: [-f[0] * 0.5, 0.866, -f[1] * 0.5], left: [f[1], 0, -f[0]] };
// B: the artichoke back on its heap (walk-away shots, the finished count), tip tipped 35 deg toward where she is led
// (at the aisle edge of its bin, so nothing on the island stands between it and her eyes as she is led away)
export const ART_ISLAND = { at: [1.0, 0.972, 0.40], axis: [-0.07, 0.819, 0.569] };
export const ROM_ISLAND = { at: [1.20, 1.105, 1.00], axis: [-0.10, 0.906, 0.41] };
// the grandmother and her cart: waiting (behind Jade, under the dead strips) and passing (once the aisle is free)
// r5: the downloaded cart's measurements (props/shopping_cart, props.json): 0.841 m long, 0.593 m wide at the rear (its widest:
// it fits the 0.60 m lane in M4b, not the 0.49 m gap), basket rim at the nose 0.63 m, the red handle grip's axis 0.962 m up at
// z -0.402, radius 18 mm, 0.36 m long; her hands on the grip 0.105 m either side of the middle. (Was hand-built: 0.9 long,
// 0.56 wide, bar at 1.02.)
export const CART = { len: 0.841, wRear: 0.593, top: 0.634, handleY: 0.9617, barZ: -0.4023, barR: 0.0183, barLen: 0.358, gripX: 0.105 };
// r5: she stands 0.23 m behind the (downloaded) cart's handle grip, as before; the grip is 0.40 m behind the cart's centre (was 0.54)
export const GRANDMA_WAIT = { cart: { at: [0.15, -1.15], yaw: 0 }, at: [0.15, -1.78] };     // cart nose at z = -0.73
export const GRANDMA_PASS = { cart: { at: [-0.4, 3.57], yaw: 0 }, at: [-0.4, 2.94] };   // overtaking on the gondola side
export const MAMA_AHEAD = { at: [-0.35, 2.9], yaw: -90 };       // at the gondola, further up the aisle (out of the beam)
export const MAMA_GRAB = { at: [0.14, 0.50], yaw: 60 };         // back at her right side, shoulder to shoulder; inside the beam
export const WALK = { jade: { at: [0.50, 4.3], yaw: 70 }, mama: { at: [0.05, 4.85], yaw: 0 }, hold: [0.30, 0.97, 4.72] };
// direction (deg, 0 = +z, 90 = +x) from the artichoke on its heap to her where she is led: cameras M5 / M7 / M9 sit on this line
export const LOOKBACK_AZ = Math.atan2(WALK.jade.at[0] - ART_ISLAND.at[0], WALK.jade.at[1] - ART_ISLAND.at[2]) * 180 / Math.PI;

// ---------------------------------------------------------------- cast added for this set (registered by build.js)
export const CAST93 = {
  grandma: { name: 'grandmother (stranger, unlit, face undrawn)', h: 1.52, kind: 'adult', skin: 0xd9b89c, hair: 0xb9b5ae, top: 0x6a6f7a, legs: 0x4a4640, hairStyle: 'bun', sleeves: 'long' },
};
// (kept for reference; the registered proportions are CHILD_PROP.child10 in ../_cast.js, identical numbers)
export const PROP_CHILD10 = { hip: 0.50, sh: 0.80, head: 0.152, shW: 0.112, hipW: 0.054, ua: 0.18, fa: 0.142, hand: 0.104, foot: 0.152, wk: 0.76, chestW: 0.19, chestD: 0.13 };
