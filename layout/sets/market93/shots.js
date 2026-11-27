// MARKET 1993 camera table: one camera per shot the plan's Structure table places in the produce aisle.
//   verse 2a 2:06.3-2:16.1 (M1 outside, M2 + M3 inside, M4c the lift (r4; M4 the grab is now an alternate), M4b) / interlude 2:25.2-2:34.5 (M5, M6 at
//   2:27.6-2:30.0, after the kitchen's first bar; then the romanesco PLATE to 2:34.5) / drum coda 4:14.3-4:24.1 (M9, bar 2:
//   4:16.8-4:19.2) + two reference views (PLAN, WIDE). All times -2sm master (analysis/m2sm/song_map.md; retimed from v3
//   2026-11-25). M7, M8, M8b served v3's FULL interlude half (2:36-2:45), which the -2sm master does not have: the plan
//   now carries the completed count on the spiral plates (PLATE XVIII), so they are kept as alternates, not in the cut.
// Fields as in attic88/shots.js, plus: art: 'held' | 'island' (where the hero artichoke is), cart: { at: [x, z], yaw },
// time (plan timecode), position: 'outside' | 'inside' (the plan's two camera positions).
// Set targets: 'art', 'art:tip', 'art:L', 'art:R', 'rom', 'rom:tip', 'cart:handleL|handleR|nose', 'forearm:<who>:<L|R>[:k]'.
import { JADE_STAND, GRANDMA_WAIT, GRANDMA_PASS, MAMA_AHEAD, MAMA_GRAB, WALK, LOOKBACK_AZ, ART_HELD, CART } from './layout.js';

// ---------------------------------------------------------------- grip specs (r4, 2026-11-26; NOTES.md "Grip specs from
// reference photos"). Vectors are world; the engine takes `palm` / `fingers` as world directions and `to` as the palm centre.
const nrm = (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mix = (...t) => t.reduce((s, [v, k]) => s.map((x, i) => x + v[i] * k), [0, 0, 0]);
const r4 = (a) => a.map((x) => +x.toFixed(4));
// an artichoke frame { at, axis (base -> crown), left (the holder's left) } for a child holding it in front of her
export function artFrame(at, yaw, tiltBack = 30) {
  const y = yaw * Math.PI / 180, f = [Math.sin(y), 0, Math.cos(y)], t = tiltBack * Math.PI / 180;
  return { at: r4(at), axis: r4([-f[0] * Math.sin(t), Math.cos(t), -f[2] * Math.sin(t)]), left: r4([f[2], 0, -f[0]]) };
}
// THE CRADLE (two-hand hold, photo refs): each palm under the lower flank of the globe, `a` deg round from the base toward
// its own side (50: the palms make a bowl, the little-finger edges 3-4 cm apart under the base, the cut stem between
// them); fingers point forward under the base and a little across toward the other hand, spread over the bracts and
// curled up the far flank; the thumb lies along the near-outer flank toward the equator, NOT over the crown; the
// wrists are supinated (palm up), neutral to slightly extended. From her eyes only the thumbs and the outer edges of the
// hands show at the sides of the globe, with the forearms entering from the bottom of frame.
const CRADLE_HAND = { shape: 'cup', curl: { index: [34, 40, 22], middle: [36, 42, 24], ring: [38, 44, 24], little: [40, 46, 26] }, spread: 10, thumb: { opp: 0, sweep: 55, abd: -10, mcp: -5, ip: -5 } };   // hold pass (hold agent): thumb opened out along the flank; at opp 0.1 the thenar sat 18 mm inside the globe's hull
export function cradle(A, side, o = {}) {
  const U = nrm(A.axis), Lf = nrm(A.left), FW = nrm(crs(Lf, U)), s = side === 'L' ? 1 : -1;
  const a = (o.a ?? 50) * Math.PI / 180, r = o.r ?? 0.058;              // r: centre to palm centre (body ~0.0475 + palm 0.007)
  const d = o.under ? nrm(mix([[0, -1, 0], 1], [FW, o.under[0]], [Lf, s * o.under[1]])) : nrm(mix([U, -Math.cos(a)], [Lf, s * Math.sin(a)]));
  const palm = d.map((x) => -x);
  let fg = nrm(mix([FW, 0.9], [Lf, -s * (o.across ?? 0.15)]));
  fg = nrm(mix([fg, 1], [palm, -dt(fg, palm)]));
  return { to: r4(mix([A.at, 1], [d, r])), hand: o.hand || CRADLE_HAND, palm: r4(palm), fingers: r4(fg), grasp: 'cradle', object: 'THE ARTICHOKE' };
}

// ---------------------------------------------------------------- recurring poses
const FOREARM = 'figure:jade10:armR';   // the hold check takes her right forearm (a fixed body part) as the object
const GRAB_R = { m4: 0.033, pull: 0.041, land: 0.0355, lead: 0.037 }, GRAB_K = 0.65;
// she stands at the island with the artichoke lifted in both hands, eyes on its tip: counting spirals
// (r4) the two hands make the cradle under it (was: palms 'in' on its sides, fingers forward: from her eyes the fingers
// reached over the crown and the painter drew palms facing her)
const jadeStudy = (o = {}) => ({ at: JADE_STAND.at, yaw: JADE_STAND.yaw, legs: 'stand', spine: { bend: 7 }, head: { look: 'art:tip' },
  L: cradle(ART_HELD, 'L'), R: cradle(ART_HELD, 'R'), ...o });
// the grandmother behind her cart, both hands on the bar, a little stooped; she waits the whole time
// r6 (Jade: "cart is right, the arm is weird / unnatural"): she stood 0.21 m behind the grip, so her elbows bent 121-129 deg,
// flared out (the engine's default elbow swivel) and her wrists sat 18 deg past full pronation with 30 deg ulnar deviation.
// Now she stands GM_BACK = 0.20 m further back (0.43 m pelvis-to-grip), elbows by her sides (GM_ELBOW, the elbow pole: down,
// a little out and back; +x = her left), palms down and a little toward each other (GM_PALM: 70 deg pronation, wrists
// near neutral): elbow bend ~82 deg, forearms near level, flex -9 / ulnar 13 / twist -69 deg, all in range. GM_HOLD: hold r = grip + 8 mm (was + 4): with the tilted
// palm + 4 / + 6 mm pinched the thumb 5 / 1.7 mm into the grip, + 10 lifts off (adjacent); + 8 closes 0.9 mm off (holdcheck pass).
const GM_HOLD = 0.008, GM_BACK = 0.20, GM_ELBOW = [0.2, -1, -0.45], GM_PALM = [0.3, -0.9, 0.2];
const grandma = (G, o = {}) => ({ at: [G.at[0] - GM_BACK * Math.sin(G.cart.yaw * Math.PI / 180), G.at[1] - GM_BACK * Math.cos(G.cart.yaw * Math.PI / 180)], yaw: G.cart.yaw, legs: 'stand', spine: { bend: 15 }, head: { look: 'jade10:head' },
  L: cartGrip('L'), R: cartGrip('R'), ...o });
// (hold pass 2026-11-26) a power grip round the cart's handle bar (r5: the downloaded cart's red grip, r 18 mm): the bar across the palm, thumb toward the other
// hand, fingers over the top and round under it (was: a palm target 12 mm above the bar, fingers through it)
// r5: hold r = the grip's 18.3 mm + 4 mm: the capsule hand then closes 1 mm off the grip (holdcheck pass); at r = 18.3 the
// capsules pinched 3.5 mm in and the mesh fingers sank 13 mm into the grip (clipcheck); at +8 mm the capsules lift off (adjacent).
const cartGrip = (n) => ({ to: 'cart:bar' + n, hand: 'grip', palm: [n === 'L' ? -GM_PALM[0] : GM_PALM[0], GM_PALM[1], GM_PALM[2]], hold: { r: CART.barR + GM_HOLD, prop: false, centre: true, axis: 'to:cart:bar' + (n === 'L' ? 'R' : 'L') },
  grasp: 'power', object: 'handle bar', elbow: [n === 'L' ? GM_ELBOW[0] : -GM_ELBOW[0], GM_ELBOW[1], GM_ELBOW[2]] });
// Mama further up the aisle at the gondola, reading a shelf (out of the beam)
const mamaAhead = { at: MAMA_AHEAD.at, yaw: MAMA_AHEAD.yaw, legs: 'stand', noApron: true, spine: { bend: 4 }, head: { look: [-0.95, 1.3, 2.9] },
  L: 'side', R: { to: [-0.92, 1.28, 2.82], hand: 'relax', palm: 'down' } };
// Mama back at her right side: her right hand comes down onto Jade's right forearm
const mamaGrab = (o = {}) => ({ at: MAMA_GRAB.at, yaw: MAMA_GRAB.yaw, legs: 'stand', noApron: true, spine: { bend: 12 }, head: { look: 'jade10:head' },
  R: { to: 'forearm:jade10:R:' + GRAB_K, hand: 'grip', palm: 'down', hold: { r: GRAB_R.pull, prop: false, centre: true, axis: 'to:forearm:jade10:R:0.95' }, grasp: 'power', object: FOREARM }, L: 'side', ...o });   // (2026-11-25) the fingers wrap her forearm (engine hold, no prop); was a palm target 2.2 cm above it
// walked away up the aisle (+z): Mama leads by the forearm, Jade is turned side-on and looks back at the artichoke
const jadeLed = { at: WALK.jade.at, yaw: WALK.jade.yaw, legs: 'stand', legOpts: { ankleL: [0.075, -0.63, 0.12], ankleR: [0.075, -0.63, -0.12] }, spine: { twist: 30, bend: 2 },
  head: { look: 'art', pitchK: 0.9 }, R: { to: WALK.hold, hand: 'relax', palm: 'down' }, L: 'side' };
const mamaLead = { at: WALK.mama.at, yaw: WALK.mama.yaw, legs: 'stand', noApron: true, legOpts: { ankleL: [0.09, -0.75, 0.18], ankleR: [0.09, -0.75, -0.18] }, spine: { bend: 4, twist: 8 },
  head: { turn: 0 }, L: { to: 'forearm:jade10:R', hand: 'grip', palm: 'down', hold: { r: GRAB_R.lead, prop: false, centre: true, axis: 'to:forearm:jade10:R:0.1' }, grasp: 'power', object: FOREARM }, R: 'side' };
const grandmaPass = grandma(GRANDMA_PASS, { head: { nod: 6 }, legOpts: { ankleL: [0.09, -0.715, 0.13], ankleR: [0.09, -0.715, -0.13] } });

const WAIT = { figs: { jade10: jadeStudy(), grandma: grandma(GRANDMA_WAIT), mama: mamaAhead }, cart: GRANDMA_WAIT.cart, art: 'held' };
// (r4) M4's grab, from the forearm-grab refs: Mama bends at the waist and drops her elbow so her forearm comes in nearly
// level and square to the girl's forearm (wrist straight, the hand continuing the forearm's line, not hanging off it
// at 90 deg). Palm on top of the forearm (tilted toward the girl), the thumb round the near side (camera side) under it,
// the four fingers over the top and down the far side, the grip at mid-forearm, clear of the wrist and the artichoke.
const mamaGrabM4 = mamaGrab({ spine: { bend: 24, twist: -6 }, head: { look: 'jade10:head' },
  R: { to: 'forearm:jade10:R:0.5', hand: 'grip', palm: [0.35, -0.9, -0.25], elbowAt: [0.20, 0.98, 0.50],
    hold: { r: GRAB_R.m4, prop: false, centre: true, axis: 'to:forearm:jade10:R:0.95' }, grasp: 'power', object: FOREARM } });
const GRAB = { figs: { jade10: jadeStudy({ head: { look: 'art:tip' } }), grandma: grandma(GRANDMA_WAIT), mama: mamaGrabM4 }, cart: GRANDMA_WAIT.cart, art: 'held' };
// M4b (r3, Jade on r2: "she should be mid-action shot of pulling her out of the way from blocking the aisle"): the pull
// itself. Mama has stepped back toward the front of the store past the pallet's end, weight on her back foot, and draws
// the forearm toward her; the girl is tipped off balance toward her, right foot stepping out, the right hand dragged off
// the artichoke, which she still holds in her left hand; her eyes stay on it. The grandmother and cart wait behind.
// (r4) Jade on r3: "kid Jade's arm is incorrectly proportioned". Staging cause: the pulled right arm was folded (elbow
// bent ~90 deg, forearm pointing at the lens), so in M1's camera the upper arm vanished and the painter drew one long
// stretched forearm. Now the arm is drawn out SIDEWAYS toward Mama, across the picture plane (camera az ~30 deg, her
// right is frame left), elbow soft (~20 deg), so upper arm, elbow and forearm each read at true length. Mama's grip
// (unchanged hand, Jade: "mom's hand is correct") is at mid-forearm; the girl's own hand hangs relaxed past it, palm
// down. The artichoke is clutched one-handed against her stomach in her LEFT hand (palm under the base, fingers up the
// far flank, thumb up the near flank), not floating where her two hands held it.
const CRADLE_ONE = { under: [0.3, 0], r: 0.068, across: 0.2, hand: { shape: 'cup', curl: { all: [44, 44, 28] }, spread: 12, thumb: { opp: 0.3, mcp: 5, ip: 5 } } };
const PULL_D = 0.162, PULL_ART = artFrame([0.49 + 0.342 * PULL_D, 0.90, 0.43 + 0.94 * PULL_D], 20, 20);
const jadePulled = { at: [0.49, 0.43], yaw: 20, legs: 'stand', legOpts: { ankleR: [0.19, -0.6, 0.03], ankleL: [0.03, -0.62, -0.03] },
  spine: { bend: 6, side: 10, twist: -14 }, head: { look: 'art:tip', tilt: -6, pitchK: 0.8 },
  R: { to: [0.02, 0.90, 0.66], hand: 'relax', palm: 'down', fingers: [-0.8, -0.45, 0.4], elbowAt: [0.20, 1.00, 0.62] },
  L: cradle(PULL_ART, 'L', { ...CRADLE_ONE, under: [0.2, 0.15] }) };
const mamaPull = mamaGrab({ at: [-0.22, 0.72], yaw: 100, legOpts: { ankleL: [0.09, -0.73, 0.16], ankleR: [0.10, -0.74, -0.24] },
  spine: { bend: -4, twist: -10 }, head: { look: 'jade10:head' } });
const PULL = { figs: { jade10: jadePulled, grandma: grandma(GRANDMA_WAIT), mama: mamaPull }, cart: GRANDMA_WAIT.cart, art: PULL_ART };
// M4c (r4, Jade on r3 M4b: "have mom pick her up and yoink her out of the way and gesture to old lady to pass"): M1's
// frame, the lift. Mama has stepped in at the girl's right (frame left of her) and turned to face the grandmother (her
// back three-quarters to the camera). Her RIGHT arm goes round the girl's back and under her left armpit, the fingers
// spread round onto the front of her ribs, the girl clamped against Mama's right hip; she is lifted ~10 cm, feet
// dangling (knees soft, toes down), at the start of the swing toward the island side that clears the gondola-side
// lane. She still clutches the artichoke at her stomach in both hands (cradle), eyes on it. Mama's LEFT arm goes out
// low and forward toward the grandmother, palm up, open, fingers extended along the free lane: "go ahead"; Mama looks
// at her. (Mama facing the camera was tried: the grandmother is straight behind her and out of reach of her eyes.)
const LIFT_JADE_AT = [0.60, 0.58], LIFT_YAW = 25;
const LIFT_D = 0.16, LIFT_ART = artFrame([LIFT_JADE_AT[0] + Math.sin(LIFT_YAW * Math.PI / 180) * LIFT_D, 0.90, LIFT_JADE_AT[1] + Math.cos(LIFT_YAW * Math.PI / 180) * LIFT_D], LIFT_YAW, 25);
const jadeLifted = { at: LIFT_JADE_AT, floor: 0.10, yaw: LIFT_YAW, legs: 'stand', legOpts: { ankleL: [0.07, -0.57, -0.10], ankleR: [-0.07, -0.55, -0.05] },
  spine: { bend: 4, side: -6 }, head: { look: 'art:tip', pitchK: 0.8 }, L: cradle(LIFT_ART, 'L'), R: cradle(LIFT_ART, 'R') };
const mamaLift = { at: [0.28, 0.62], yaw: 175, legs: 'stand', noApron: true, legOpts: { ankleL: [0.14, -0.74, 0.04], ankleR: [-0.15, -0.74, -0.02] },
  spine: { bend: 4, side: -8 }, head: { look: 'grandma:head' },
  R: { to: [0.739, 1.09, 0.63], hand: { shape: 'flat', curl: { all: [10, 30, 20] }, spread: 10, thumb: { opp: 0, abd: -10, mcp: 0, ip: 0 } }, palm: [-0.94, 0, -0.34], fingers: [-0.34, 0.05, 0.94], elbowAt: [0.617, 1.04, 0.381],
    grasp: 'liftUnderArm', object: 'figure:jade10:torso' },
  L: { to: [-0.34, 1.14, 0.34], hand: { shape: 'palmUp', spread: 12 }, palm: [-0.15, 0.95, -0.25], fingers: [-0.45, -0.1, -0.88], elbowAt: [-0.12, 1.08, 0.54] } };
const LIFT = { figs: { jade10: jadeLifted, grandma: grandma(GRANDMA_WAIT), mama: mamaLift }, cart: GRANDMA_WAIT.cart, art: LIFT_ART };
// M4b (r4, lead's decision 2026-11-26): THE LANDING, after the lift. She has been set down at the island's edge, facing the
// produce, her back to the aisle; Mama, at her right, keeps a hand round her right forearm (the recurring grab, 2 of 3,
// rhymes with attic88_day AD_grab); the artichoke is in her left hand against her stomach, eyes still on it. Both of them
// are against the island, so the lane between them and the pallet is 0.6 m: the cart (0.593 m, r5) is starting past, its
// nose level with the pallet's end, the grandmother behind it. Mama uses her LEFT hand (she faces the girl and the
// island; her left is the girl's side). Her arm hangs, so the grip is from the side: Mama's hand level, thumb up toward
// the girl's elbow, palm against the forearm, fingers round the far side, mid-forearm, wrist straight in line with Mama's
// level forearm.
const LAND_JADE = { at: [0.70, 0.40], yaw: 90 }, LAND_RH = [0.93, 0.82, 0.60], LAND_PALM = [0, -0.85, -0.5];
const LAND_D = 0.157, LAND_ART = artFrame([LAND_JADE.at[0] + LAND_D, 0.90, LAND_JADE.at[1]], 90, 20);
const jadeLanded = { at: LAND_JADE.at, yaw: LAND_JADE.yaw, legs: 'stand', spine: { bend: 4, twist: 6 }, head: { look: 'art:tip', pitchK: 0.8 },   // re-render pass 2026-11-26 (mesh + gaze default): pitchK 0.8 and bend 8 -> 4 (M4b_pull 9 -> 6): her eyes were 9-10 deg past their down travel at the artichoke; GRAB_R.land 0.038 -> 0.0355 to keep Mama's grip on the moved forearm; LAND_D / PULL_D +6-8 mm: the artichoke sank into her mesh belly
  R: { to: LAND_RH, hand: 'relax', palm: [0, -0.3, -0.95], fingers: [0.9, -0.4, 0.05] }, L: cradle(LAND_ART, 'L', { ...CRADLE_ONE, r: 0.069 }) };
const mamaLand = { at: [0.64, 0.84], yaw: 150, legs: 'stand', noApron: true, spine: { bend: 18, twist: 8 }, head: { look: 'jade10:head' },
  L: { to: 'forearm:jade10:R:0.5', hand: 'grip', palm: LAND_PALM, hold: { r: GRAB_R.land, prop: false, centre: true, axis: 'to:forearm:jade10:R:0.95' }, grasp: 'power', object: FOREARM }, R: 'side' };
const GRANDMA_START = { cart: { at: [0.2, -0.05], yaw: 0 }, at: [0.2, -0.68] };   // cart nose at z = +0.37, level with the pallet's end; r5: x 0.15 -> 0.2, the middle of the 0.6 m lane (the downloaded cart is 0.593 m wide)
const LAND = { figs: { jade10: jadeLanded, grandma: grandma(GRANDMA_START, { head: { look: [0.15, 1.3, 3] } }), mama: mamaLand }, cart: GRANDMA_START.cart, art: LAND_ART };
const LED = { figs: { jade10: jadeLed, mama: mamaLead, grandma: grandmaPass }, cart: GRANDMA_PASS.cart, art: 'island' };

export const SHOTS = [
  // ---------------------------------------------------------------- verse 2a, 2:06.3-2:16.1  "3. Skokie, 1993."
  { id: 'M1', lens: 40, time: '2:06.3-2:09.2 verse 2a', position: 'outside', ...WAIT,
    orbit: { at: 'jade10:eyes', az: JADE_STAND.yaw, el: 0, dist: 1.55 }, aim: ['jade10:eyes', 0.52, 0.4], focus: ['jade10'],
    header: 'verse 2a 2:06.3 OUTSIDE: frontal, level, locked off; the grandmother waits behind, unlit',
    intent: '3. Skokie, 1993. The one outside shot: her face, frontal and level, eyes down on the artichoke in her hands. A toner label lands frame right of her face. The grandmother and her cart are behind her in the aisle under the dead strips, in frame and unlit.' },
  { id: 'M2', lens: 50, time: '2:09.2-2:12.2 verse 2a', position: 'inside', ...WAIT,
    orbit: { at: 'jade10:eyes', az: 0, el: 0, dist: 0 }, aim: ['art', 0.5, 0.52], hideParts: { jade10: ['head'] },
    header: 'verse 2a INSIDE: along her eye-line onto the artichoke in her hands',
    intent: 'Her eye-line (head hidden for the POV): the artichoke cradled in both hands, crown toward her. Gold numerals land on the spiral arms in step with the plate (artichoke_plate_count.json, clip 0 = 2:09.2): 1 at 2:09.55-2:10.07, 2 2:10.19-2:10.68, 3 2:10.80-2:11.25, 4 2:11.37-2:11.79; arm 5 starts 2:11.91 and is still drawing at the cut (8 arms; bract n is on arm n % 8).' },
  { id: 'M3', lens: 85, time: '2:12.2-2:14.2 verse 2a', position: 'inside', ...WAIT,
    orbit: { at: 'jade10:eyes', az: 0, el: 0, dist: 0 }, aim: ['art:tip', 0.5, 0.5], hideParts: { jade10: ['head'] },
    header: 'verse 2a INSIDE, closer: the spiral arms; the count reaches 8 (r4: plate re-timed, Jade "finish at 8")',
    intent: 'Same eye-line, tighter: the spiral fills the frame. Opens on 1-4 written and arm 5 drawing (its numeral done 2:12.29); 6 at 2:12.41-2:12.77, 7 2:12.89-2:13.22, 8 2:13.34-2:13.65; all eight arms numbered and held to the cut at 2:14.2 (plate json, clip 0 = 2:09.2).' },
  { id: 'M4', lens: 50, time: 'alternate (r4): was 2:14.2-2:15.2; M4c takes the slot (Jade on r3 M4b)', position: 'outside', ...GRAB,
    // THE GRAB framing (shared with attic88_day AD_grab; see NOTES.md): 50 mm, 0.92 m from the grabbed forearm, 31 deg above
    // it, 30 deg round to her right, the forearm at (0.5, 0.52), the adult forearm entering on a diagonal from the upper
    // corner. Here the camera has to be in FRONT of her (her forward is az 20, camera az 350): from behind, her shoulders and
    // head cover the forearm. So Mama's hand enters from frame LEFT; in the attic (camera behind) it enters from frame right.
    // (Was: pos [0.5, 0.88, 1.4], level, forearm at (0.55, 0.5), the cart in the background.)
    orbit: { at: 'forearm:jade10:R', az: 350, el: 31, dist: 0.92 }, aim: ['forearm:jade10:R', 0.5, 0.52],
    header: 'verse 2a 2:14.2 THE GRAB (recurring framing, 2 of 3): a hand closes on her forearm',
    intent: "The attic grab's framing, mirrored: down onto her right forearm from 0.92 m, Mama's forearm coming in on the diagonal from frame left and closing on it, the artichoke still in her hands frame right. The cart and the grandmother are out of this frame (the camera looks down); M4b, unchanged, is where they are seen." },
  // (r4, 2026-11-26) NEW: Jade's r3 note on M4b. Takes 2:14.2-2:15.2 (M4's slot; M4 becomes an alternate). M1's camera.
  // camera: M1 / r3-M4b's camera line, dollied 1 m back into the cross aisle and wider (32 mm), aimed lower, so her
  // dangling feet, Mama's gesture and the grandmother are all in frame (lead: "M4b's camera/framing", lift readable)
  { id: 'M4c', lens: 32, time: '2:14.2-2:15.2 verse 2a', position: 'outside', ...LIFT,
    pos: [0.86, 1.30, 3.05], target: [0.36, 0.74, 0.20], focus: ['jade10'],
    header: 'verse 2a 2:14.2 OUTSIDE, M1\'s camera line pulled back: Mama scoops her up under the arms and swings her out of the aisle, waving the grandmother through (Jade, 2026-11-26)',
    intent: "M1's locked-off frame, mid-swing: Mama, close behind her, has hooked her right arm across the girl's chest under both arms and lifted her off her feet (feet dangling a hand's breadth above the floor), swinging her aside toward the island; the girl still clutches the artichoke at her stomach in both hands, eyes on it. Mama looks back at the grandmother and holds her left hand out to her, palm up, open: go ahead. The grandmother and her cart wait behind, now in clear view." },
  // (r4) THE LANDING (lead's decision on Jade's r3 note): the recurring grab framing (50 mm, 0.92 m, 31 deg above the
  // forearm, 30 deg round, forearm at (0.5, 0.52)), here from over the island in front of her (she faces the produce),
  // so the lane, the pallet and the cart starting past are the background. The r3 mid-pull (PULL, M1's camera) is kept
  // as M4b_pull, an alternate.
  { id: 'M4b', lens: 50, time: '2:15.2-2:16.1 verse 2a (last beat)', position: 'outside', ...LAND,
    orbit: { at: 'forearm:jade10:R', az: 75, el: 40, dist: 0.92 }, aim: ['forearm:jade10:R', 0.5, 0.56],
    header: 'verse 2a 2:15.2 THE GRAB (recurring framing, 2 of 3): set down at the island, Mama\'s hand on her forearm; the cart starts past',
    intent: "The attic grab's framing: down onto her right forearm, Mama's forearm coming in on the diagonal and her hand closed round it (palm on top, fingers round the far side, wrist straight). She has just been set down at the island's edge, the artichoke in her left hand against her stomach, eyes still on it. Behind them, the grandmother's cart noses past the pallet into the lane she was blocking." },
  { id: 'M4b_pull', lens: 40, time: 'alternate (r3 mid-pull, M1\'s camera)', position: 'outside', ...PULL,
    pos: [1.1164, 1.2147, 2.0379], target: [0.3996, 1.1136, 0.1735], focus: ['jade10'],
    header: 'alternate: M1\'s camera, mid-pull, Mama draws her out of the aisle by the forearm',
    intent: "M1's locked-off frame, mid-action: Mama (frame left) pulls her by the forearm out of the way, the girl's right arm drawn out sideways toward her, the artichoke in her left hand, eyes still on it. The grandmother and her cart wait behind." },
  // ---------------------------------------------------------------- interlude 2:25.2-2:34.5 (-2sm; after Dad's answer, kitchen K4 2:25.2-2:27.6)
  { id: 'M5', lens: 35, time: '2:27.6-2:29.0 interlude (bar 2, -2sm)', position: 'outside', ...LED,
    orbit: { at: 'art', az: LOOKBACK_AZ + 180, el: 20, dist: 0.42 }, aim: ['jade10:eyes', 0.45, 0.36], focus: ['jade10'],
    header: 'interlude 2:27.6 walked away, looking back: seen from the artichoke; the grandmother gets past',
    intent: 'From just behind the artichoke on its heap (foreground, in the beam, the romanesco beside it): Mama walks her away up the aisle by the forearm; she is turned back, eyes on the artichoke, already out of the beam. The grandmother pushes her cart past on the gondola side, frame right.' },
  { id: 'M6', lens: 135, time: '2:29.0-2:30.0 interlude (-2sm; then the artichoke plate cut B: the 8 arms settled, the 5 family counted)', position: 'inside', ...LED,
    orbit: { at: 'jade10:eyes', az: 0, el: 0, dist: 0 }, aim: ['art', 0.5, 0.52], hideParts: { jade10: ['head'] },
    header: 'interlude 2:29.0 INSIDE: her eye-line back down the aisle to the artichoke; the count resumes, one numeral per note',
    intent: 'Her eye-line over her shoulder as she is led away (the frame drifts with her walk): long lens, the artichoke lit on its heap among the unlit produce, receding. The count resumes.' },
  // ---------------------------------------------------------------- alternates (v3's full interlude half, 2:36-2:45 v3: not in the -2sm master)
  { id: 'M7', lens: 70, time: 'alternate, not in the -2sm cut (the artichoke plate completes the count, ~2:29-2:30)', position: 'inside', ...LED,
    orbit: { at: 'art', az: LOOKBACK_AZ, el: 46, dist: 0.5 }, aim: ['art', 0.5, 0.5],
    header: 'alternate (was v3 2:36) INSIDE: the artichoke on its heap, close; the count completes (8)',
    intent: 'Close on the artichoke where she left it, seen along the line of her look: the eighth numeral lands. All eight arms carry a numeral.' },
  { id: 'M8', lens: 70, time: 'alternate, not in the -2sm cut (the romanesco plate takes 2:30.0-2:34.5)', position: 'inside', ...LED,
    orbit: { at: 'rom', az: -14, el: 50, dist: 0.72 }, aim: ['rom', 0.5, 0.52],
    header: 'alternate (was v3 2:40) INSIDE: the romanesco, its 13 / 8 arms',
    intent: 'Her attention moves one bin along: the romanesco, cone of cones, 13 arms one way and 8 the other.' },
  { id: 'M8b', lens: 100, time: 'alternate, not in the -2sm cut (the romanesco plate takes 2:30.0-2:34.5)', position: 'inside', ...LED,
    orbit: { at: 'rom', az: -14, el: 34, dist: 0.36 }, aim: ['rom', 0.5, 0.62],
    header: 'alternate (was v3 2:43) INSIDE, macro: spiral within spiral',
    intent: 'Push into one flank of the romanesco: each floret repeats the whole spiral (5 / 3 arms on every cone).' },
  // ---------------------------------------------------------------- drum coda, -2sm: hit 4:14.3, groove at once to the last hit 4:24.1 (one bar)
  { id: 'M9', lens: 70, time: '4:16.8-4:19.2 drum coda (bar 2 of 4, -2sm)', position: 'inside', figs: {}, art: 'island',
    orbit: { at: 'art', az: LOOKBACK_AZ, el: 46, dist: 0.5 }, aim: ['art', 0.5, 0.5],
    header: 'drum coda INSIDE: the finished count (same camera as M7, nobody in the aisle)',
    intent: 'One bar of the coda: the artichoke with all eight numerals. Identical framing to M7 so the gold layer can be reused.' },
  // ---------------------------------------------------------------- reference views (not shots)
  // the artichoke alone, upright, for comparing with Jade's reference photo and PLATE XVIII (2026-11-25): straight down
  // its axis, frame up = the plate's up (so the bracts sit where they sit on the plate), and a 3/4 view
  { id: 'REF_artichoke_top', lens: 'ortho', ortho: { w: 0.24 }, pos: [1.0, 1.6, 0.40], target: [1.0, 0.9, 0.40], up: [0, 0, -1], figs: {}, art: 'upright',
    hide: ['artichokes (heap)', 'romanesco (heap)'], header: 'reference: the artichoke from straight above (as Jade\'s photo and PLATE XVIII)', intent: 'Bract shapes, the closed apex and the 5 / 8 spirals.' },
  { id: 'REF_artichoke_34', lens: 85, orbit: { at: 'art', az: 200, el: 30, dist: 0.6 }, aim: ['art', 0.5, 0.5], figs: {}, art: 'upright',
    hide: ['artichokes (heap)', 'romanesco (heap)'], header: 'reference: the artichoke, 3/4 from above', intent: 'Silhouette: squat globe, cupped bracts opening outward, short cut stem.' },
  { id: 'PLAN', lens: 'ortho', ortho: { w: 26 }, pos: [0.7, 30, 0], target: [0.7, 0, 0], up: [1, 0, 0], hide: ['drop ceiling'], ...WAIT,
    header: 'reference: plan, blocking A (waiting). Right = +z (front of store), up = +x (islands)', intent: 'Plan of the department with the waiting blocking and the beam footprint.' },
  { id: 'PLAN_B', lens: 'ortho', ortho: { w: 9 }, pos: [0.6, 30, 1.6], target: [0.6, 0, 1.6], up: [1, 0, 0], hide: ['drop ceiling'], ...LED,
    header: 'reference: plan close, blocking B (walked away)', intent: 'Plan of the aisle around the hero island with the walk-away blocking.' },
  { id: 'WIDE', lens: 24, pos: [-0.45, 1.65, 5.6], aim: ['jade10:head', 0.55, 0.52], ...GRAB,
    header: 'reference: the aisle from the front of the store, blocking at the grab', intent: 'Establishing view down the aisle toward the back wall: islands frame left, gondola frame right, tube rows overhead, the key strip over her.' },
];

// post-sweep 2026-11-26 (painter guides too dark: lit mean PLAN 16.0, WIDE 24.4, M4c 28.5, PLAN_B 28.9, M6 30.8, M4b_pull
// 33.6, M1 34.4 of 255): per-shot lit-pass lift (office91's mechanism, build.js rig): `amb` = the cool fill (default 0.55),
// `key` scales the key strip with it so the beam stays the brightest thing. Lit pass only; the twins are made after this.
const LIT_LIFT = { PLAN: { amb: 2.0, key: 1.8 }, WIDE: { amb: 1.3, key: 1.4 }, M4c: { amb: 1.1, key: 1.3 }, PLAN_B: { amb: 1.1, key: 1.3 },
  M6: { amb: 1.0, key: 1.2 }, M4b_pull: { amb: 0.9, key: 1.15 }, M1: { amb: 0.9, key: 1.15 } };
for (const s of SHOTS) if (LIT_LIFT[s.id]) s.light = { ...(s.light || {}), ...LIT_LIFT[s.id] };

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
SHOTS.push(...maskTwins(SHOTS, { surf: true }));   // + beam_<id>__surf: lit surfaces only
