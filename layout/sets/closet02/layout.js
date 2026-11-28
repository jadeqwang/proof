// CLOSET, ABOUT 2002 ("Proof": chorus 2a, 3:23.4-3:34.2, -2sm). Single source of truth (metres, y up, floor at y = 0).
// Rebuilt 2026-11-25 from Jade's drawing (inputs/refs_closet.png, private): a REACH-IN bedroom closet with two
// bypass sliding doors. Both panels are slid to the LEFT, so the left half is covered and the right half is open.
// Inside the open half: a shelf (textbooks, shoeboxes), a rod below it with clothes hanging to about two-thirds of the
// way down (the lower third is open), a few long coats down the left edge of the open half, and Jade sitting
// cross-legged on a folded duvet cover, low and right of centre. First love sits cross-legged on the bedroom carpet in
// front of her, outside the closet, his back to the bedroom and its window; the light comes over his right shoulder.
//   x: left -> right as seen from the bedroom (the drawing's viewpoint). The opening is centred on x = 0.
//   z: + = the bedroom; z = 0 is the bedroom face of the closet wall; the back wall of the closet is at z = -0.73.
// A camera in the bedroom looking into the closet (toward -z) has +x on frame-RIGHT, as in the drawing.
import { FL_HIM, holdArms } from '../_hold.js';
const rad = (d) => (d * Math.PI) / 180;

// ---------------------------------------------------------------- the closet
// ASSUMPTION: a 6 ft (1.80 m) bypass closet, two 0.90 m panels, 2.03 m (80 in) opening, 0.61 m (24 in) deep inside,
// 0.12 m wall, interior returns of 7 cm each side, 2.44 m ceiling (the interior above the 2.03 m header is hidden).
// The drawing's outline is 1 : 1.13 (w : h); 1.80 x 2.03 is 1 : 1.13.
export const WALL = { t: 0.12, h: 2.44 };
export const OPEN = { x0: -0.88, x1: 0.88, h: 2.03 };                       // the rough opening in the wall
export const ROOM = { x0: -0.95, x1: 0.95, z0: -0.73, z1: -WALL.t, h: WALL.h };   // the closet interior
// the two panels, both stacked over the left half (front track and rear track); the open half is x = DOORS.edge .. OPEN.x1
export const DOORS = { w: 0.90, h: 2.01, t: 0.032, zFront: -0.030, zRear: -0.075 };
DOORS.edge = OPEN.x0 + DOORS.w;                                            // +0.02: the free edge of the stack (nearly the centre, as drawn)

// the bedroom: only its floor and the closet wall are built (cameras look into the closet). x1 widened 2026-11-26 (r4) so
// the rotated futon stands on carpet.
export const BEDROOM = { x0: -1.8, x1: 3.4, z1: 3.2 };
// the futon (Jade, round 3, 2026-11-26): to the RIGHT of the closet, not blocking the entrance, in its down (bed) mode
// because they slept on it; matte black metal frame, navy plaid blanket.
// Round 4 (Jade, 2026-11-26: "placement is in the right spot, but rotate it 90 degrees so the matte black railing is
// visible. the railing should be a rounded square."): same spot (its left end just past the right jamb, against the
// closet wall), turned 90 degrees: its LENGTH now runs along the closet wall (x), the back of the frame is against the
// closet wall, and the two arm frames stand at the two ends (x), so the arm by the closet and the front rail face the
// bedroom and every camera. RAILING READ BOTH WAYS (flagged): each arm is a rounded-rectangle loop of tube, and the tube
// itself is a rounded-square section (1 in / 25 mm, 6 mm corner radius), matte black.
// ASSUMPTION (flagged): a full-size bi-fold metal futon, mattress 1.91 x 1.37 m (75 x 54 in), 0.15 m thick on a deck at
// 0.30 m; arms 0.66 m high spanning the sofa-mode depth (0.88 m) from the wall; the folded-down half runs on past them
// into the room on two legs and a front rail.
export const FUTON = { x0: 0.95, len: 1.91, w: 1.37, z0: 0.03, deck: 0.30, mat: 0.15, arm: 0.66, armD: 0.88, armGap: 0.05, tube: 0.025, tubeR: 0.006, corner: 0.08, drape: 0.14 };
FUTON.mx0 = FUTON.x0 + FUTON.armGap; FUTON.mx1 = FUTON.mx0 + FUTON.len;          // the mattress along x
FUTON.x1 = FUTON.mx1 + FUTON.armGap; FUTON.z1 = FUTON.z0 + FUTON.w; FUTON.top = FUTON.deck + FUTON.mat;
// the ceiling light (Jade, round 4: "there is also a ceiling light"): ASSUMED type (flagged): a 2002 US bedroom's
// flush-mount frosted-glass dome (13 in / 0.33 m across, 0.12 m deep) on a white canopy, centred over the bedroom in front
// of the closet. It is on, but dim beside the sun: a soft, warm fill. Never in frame in the film shots (all look into
// the closet, away from it); its light is in lit / light / flat.
export const CEIL_LIGHT = { at: [0.75, WALL.h, 1.85], r: 0.165, h: 0.12, color: 0xffd6a0 };

// ---------------------------------------------------------------- what is in the closet (from the drawing)
// Heights FROM THE DRAWING (Jade, 2026-11-27 late: "the closet must match my drawing"), scaled to the 2.03 m opening:
// shelf ~1.63 (textbooks and shoeboxes on it), the rod right below it ~1.48, most clothes hang to ~0.91-0.94 ("clothes
// mostly to here"), a few long coats at the LEFT end of the open half hang to ~0.37-0.40. (Was a compromise between the
// drawing and a stock closet, shelf 1.72 / rod 1.60; removed.)
export const SHELF = { y: 1.63, d: 0.30, t: 0.02 };                        // top surface y; depth from the back wall
export const RAIL = { y: 1.48, z: ROOM.z0 + 0.30, r: 0.014 };              // rod centre, 30 cm off the back wall; rod radius
// hanging clothes (2026-11-27 late): REAL garments on hangers (layout/assets/props/garment_*, CC BY 4.0, credited in
// docs/credits_tools.md), each hook resting on the rod, hanger bar across the closet (front to back), opaque, one
// canonical colour each (a 2002 student's wardrobe: muted, varied). Each entry: [x of the hook, prop, colour, scale].
// The props' hook-to-hem drop is 0.603 m (tops) / 0.692 (folded trousers) at scale 1, so with the hook on the 1.48 rod the
// tops' hems land at 0.90-0.94 (the drawing) and the trousers' at ~0.81. Garments are opaque solids pressed together
// (centres 4.5-6 cm apart; real tops are 7-13 cm thick as modelled, a little overlap reads as compressed cloth).
// OVER HER HEAD (Jade, round 8: "Fill it: clothes hang right down to, and brush, my hair"): the garments over her
// (5th field 'hair') are fitted per shot in build.js (fitToHair): each one's hem comes down onto her hair, HAIR.into into
// the hair shell (0-15 mm), never within 4 mm of the scalp, and never within 15 mm of bare skin (her forehead / face). She sits under the rod with her crown at the hems' height, so the
// clothes rest on her hair: when she lifts her head (the hold shots) they ride up with it (~2.6 cm). (Round 7 had a
// gap here, x 0.38-0.62.)
export const HAIR = { into: 0.008, minScalp: 0.004, minBare: 0.015, sMin: 0.80, sMax: 1.06 };   // sMax 1.06: a top 0.55 m long
const TOP = 'garment_tee', LS = 'garment_shirt', SW = 'garment_sweater', JK = 'garment_jacket', PT = 'garment_pants';
export const CLOTHES = {
  hookLift: 0.004,            // the hook wire's thickness: the prop origin (top of the hook) sits this far above the rod top
  items: [
    // left half, behind the slid panels (mostly hidden; seen past the panel edge in CL_elev)
    [-0.88, JK, 0x3d3a36, 1.00], [-0.82, PT, 0x2f3a55, 1.00], [-0.765, LS, 0xc9c3b4, 0.97], [-0.71, SW, 0x6b5a4a, 0.98],
    [-0.655, TOP, 0x4a5468, 0.95], [-0.60, LS, 0x7a8490, 0.97], [-0.545, PT, 0x8a7d63, 1.00], [-0.49, TOP, 0x8a5a4a, 0.96],
    [-0.435, SW, 0x5a4a60, 0.98], [-0.38, LS, 0xa09a88, 0.97], [-0.325, TOP, 0x34343a, 0.95], [-0.27, JK, 0x4b5a6e, 0.99],
    [-0.215, LS, 0xb8a890, 0.96], [-0.16, TOP, 0x6a7a62, 0.95],
    // open half, right of the coats
    [0.165, JK, 0x59573f, 1.00],    // olive canvas jacket
    [0.215, LS, 0x9fb3c8, 0.97],    // light-blue oxford shirt
    [0.265, TOP, 0x9a9a98, 0.95],   // heather-grey tee
    [0.315, SW, 0xc6b796, 0.98],    // oatmeal sweater
    [0.36, TOP, 0x2e3a52, 0.93],    // navy tee
    // over her head: hems brush her hair (fitted per shot; the scale here is the upper limit)
    [0.405, SW, 0x8c7a6b, 1.0, 'hair'],   // taupe sweater
    [0.45, TOP, 0x5f6f7a, 1.0, 'hair'],   // slate tee
    [0.495, LS, 0xe0d8c4, 1.0, 'hair'],   // cream shirt
    [0.54, TOP, 0x7a3b3b, 1.0, 'hair'],   // brick tee
    [0.59, SW, 0x4f5d4a, 1.0, 'hair'],    // sage sweater
    [0.645, LS, 0x6e2a32, 0.94],    // burgundy shirt
    [0.695, SW, 0x3e5243, 0.97],    // forest-green sweater
    [0.745, PT, 0xb0a07a, 1.00],    // khaki trousers
    [0.795, TOP, 0xd6d1c6, 0.96],   // off-white tee
    [0.84, PT, 0x3c4e6a, 1.00],     // jeans
    [0.885, JK, 0x2a2a2c, 0.98],    // black jacket
  ],
};
// the long coats at the LEFT end of the open half (drawing: tight against the panel edge, hems ~0.37-0.40). Scanned coats
// (layout/assets/props/coat_long_*), knee length (0.98 m), pressed together: thickness scaled to 0.063 m each. They must
// stay at x < 0.14 at y 0.43-0.49 (her right elbow reaches to x ~0.17 in CL_hands / CL_ots / CL_chin).
export const COATS = { items: [[-0.01, 'coat_long_b', 0x2b2d33, 1.0], [0.04, 'coat_long_a', 0x7a6248, 1.0], [0.09, 'coat_long_b', 0x3b4250, 0.99]], thick: 0.7 };
// the folded duvet cover she sits on (drawing: a low block under her, a little narrower than her knees)
export const DUVET = { at: [0.55, -0.40], w: 0.58, d: 0.58, h: 0.09 };

// ---------------------------------------------------------------- the people
// Jade: drawing's triangle centred 56 % across the open half (x ~ 0.50), seated on the duvet, head below the hems.
// First love (round 3, Jade: "more directly in line to her, matching her"): on the carpet squarely in front of her,
// on her centre line (same x), facing her, mirroring her cross-legged pose; the four hands meet at the door line,
// halfway between them. The light still clears his right shoulder (it comes from +x, 0.35 m right of his head).
export const SEATS = {
  jade19: { at: [0.50, 0.139 + DUVET.h, -0.42], yaw: 0 },                 // pelvis lifted by the duvet; 2026-11-27 x 0.55 -> 0.50: the new cross-legged knees (low, wide) were 40 mm into the right jamb wall
  firstLove: { at: [0.50, 0.48], yaw: 180 },   // 2026-11-27 (cross-legged pose from photos): 10 cm back, 2 cm left: his crossed feet reach further forward now (were 45 mm into her duvet, knees into hers)
  // was [0.52, 0.38]:   // 2026-11-26 post-sweep: x 0.55 -> 0.52 (3 cm off her centre line): with the soles fix his crossed foot was 15.8 mm into the right jamb (bedroom wall); stepping back instead put it into the casing
};
// where the hands meet. 2026-11-27 (late): THE APPROVED HOLD (layout/sets/_hold.js), carried over rigidly with HIS seat,
// so it rests on his LEFT knee as in the approved clip: her right palm centre. (Was [0.50, 0.41, -0.02], the cradle at the
// door line on the shared centre line.)
export const HOLD_DX = +(SEATS.firstLove.at[0] - FL_HIM.at[0]).toFixed(4), HOLD_DZ = +(SEATS.firstLove.at[1] - FL_HIM.at[1] + 0.03).toFixed(4);   // + 3 cm toward him: clears her right knee (shots.js)
export const HOLD_DY = 0;
export const HANDS = holdArms(HOLD_DX, HOLD_DZ, undefined, HOLD_DY).herR.to;
export const FACE = [0.50, 0.80, -0.26];   // 2026-11-27 x 0.55 -> 0.50                                     // about where her face is (for the light)

// ---------------------------------------------------------------- the light
// ASSUMPTION: late-afternoon sun through the bedroom window behind him and to his right, 34 degrees high, travelling
// 30 degrees off square (toward -x) into the closet. It passes his right shoulder and lands on her FACE and the four
// hands (KEYFRAMES 6.2: the one scene where her whole face is in the light; he opened the door, the light comes over
// his shoulder onto her). Its edges are all crisp (parallel light):
//   left   the free edge of the slid-open panels (the "door" edge of the wedge)
//   right  the right jamb of the opening
//   top    the window head in the bedroom (not modelled: the stand-in WINDOW below casts it), set to clear her head
//   bottom the floor
export const SUN = { altitude: 34, azimuth: 30, color: 0xffe2b0 };
const ca = Math.cos(rad(SUN.altitude)), sa = Math.sin(rad(SUN.altitude)), tA = Math.tan(rad(SUN.altitude));
export const SUN_DIR = [-Math.sin(rad(SUN.azimuth)) * ca, -sa, -Math.cos(rad(SUN.azimuth)) * ca];
const H = [-Math.sin(rad(SUN.azimuth)), 0, -Math.cos(rad(SUN.azimuth))];   // horizontal direction of travel
export const SUN_H = H;
// the band's top plane: passes TOP_Y over her face point and drops toward -H at the sun's slope
export const TOP_Y = 1.06;
export const topAt = (x, z) => TOP_Y - ((x - FACE[0]) * H[0] + (z - FACE[2]) * H[2]) * tA;
// the two side edges (vertical lines in plan): the panel stack's back corner and the jamb's bedroom-side corner
export const EDGES = { left: [DOORS.edge, DOORS.zRear - DOORS.t / 2], right: [OPEN.x1, 0] };
// the aperture: a vertical plane in the bedroom just in front of the closet (z = APZ), the edges projected back to it
// along the light, so the solid holds the hands and her knees (which come out past the door line)
export const APZ = 0.22;
const back = (e) => e[0] + (APZ - e[1]) * (H[0] / H[2]);                  // x where the edge's ray crosses z = APZ
const ax0 = back(EDGES.left), ax1 = back(EDGES.right);
export const BEAM = {
  name: 'door', kind: 'late-afternoon sun from the bedroom window, over his shoulder, through the open half of the sliding door (parallel)',
  dir: SUN_DIR,
  // TL, TR, BR, BL seen from the bedroom
  aperture: [[ax0, topAt(ax0, APZ), APZ], [ax1, topAt(ax1, APZ), APZ], [ax1, -0.05, APZ], [ax0, -0.05, APZ]],
  clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, { name: 'back wall', n: [0, 0, -1], d: -ROOM.z0 }],
};
BEAM.centre = [(ax0 + ax1) / 2, topAt((ax0 + ax1) / 2, APZ) / 2, APZ];
export const beamAt = (p, s) => p.map((c, i) => c + SUN_DIR[i] * s);
// the window behind him (the bedroom is not modelled): one stand-in wall square to the light, WINDOW.back metres back
// along the light from the aperture (far, so that no camera is beyond it; only the hole's projection matters), with a
// hole in it. Its head is on the band's top plane (the light's top edge,
// above her head); its jambs and sill are set so the patch of sun on the closet wall runs WINDOW.spill metres past the
// open half on each side and its lower edge lands on the carpet WINDOW.sillAt metres in front of the closet.
export const WINDOW = { back: 8.0, spill: 0.30, sillAt: 0.75, w: 7.0 };
{ const W = WINDOW, c = [(ax0 + ax1) / 2 - H[0] * W.back, 0, APZ - H[2] * W.back]; W.at = c;
  const e = [H[2], 0, -H[0]];                                               // the wall's horizontal axis (= its local +x in build.js)
  const hit = (p) => { const s = ((p[0] - c[0]) * H[0] + (p[2] - c[2]) * H[2]) / (SUN_DIR[0] * H[0] + SUN_DIR[2] * H[2]);
    const q = [p[0] - s * SUN_DIR[0], p[1] - s * SUN_DIR[1], p[2] - s * SUN_DIR[2]]; return { u: (q[0] - c[0]) * e[0] + (q[2] - c[2]) * e[2], y: q[1] }; };
  const a = hit([DOORS.edge - W.spill, 0, 0]), b = hit([OPEN.x1 + W.spill, 0, 0]);
  W.u0 = Math.min(a.u, b.u); W.u1 = Math.max(a.u, b.u);
  W.head = topAt(c[0], c[2]); W.sill = hit([(ax0 + ax1) / 2, 0, W.sillAt]).y; W.h = W.head + 3.0; }

export const MOTE = { seed: 2002, count: 80 };   // dust in the light; no hero mote in this scene
export const LIGHTS = {
  door: { kind: 'late-afternoon sun from the bedroom window behind him (parallel)', dir: SUN_DIR, color: SUN.color },
  // round 4 (Jade): the bedroom's ceiling light is on too, a soft dim fill (the closet itself has no light of its own)
  ceiling: { kind: 'bedroom ceiling light: flush-mount frosted glass dome, warm, on (soft dim fill)', pos: [CEIL_LIGHT.at[0], CEIL_LIGHT.at[1] - CEIL_LIGHT.h * 0.6, CEIL_LIGHT.at[2]], color: CEIL_LIGHT.color },
};
