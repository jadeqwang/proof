// MV10 camera table: the housewarming, Mountain View, 2010. One entry per shot the plan's Structure table places here:
//   BR*  bridge 2:45-3:03      HS1  hard stop 3:03-3:05      V3*  verse 3 3:05-3:29
//   SI1  silence 3:29-3:33     C2*  chorus 2b 3:43-3:53
// Camera meaning (plan, "Camera"): OUTSIDE = frontal, level, locked off on her face. INSIDE = along her eye-line, close.
// Fields as in attic88 (id, lens, pos | orbit, target | aim, figs, light, header, intent) plus:
//   space 'room' | 'yard', time, section, pos2 ('outside' | 'inside' | 'plan'), amp (115 = the party's over-rendering),
//   shadows (draw the three lamp shadows of Jade on the spines), path (draw her route), solo, hide, light { lamps, dusk, poi }.
import { MARKS, POI } from './layout.js';

const yawTo = (a, b) => +(Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI).toFixed(1);
const SHELF_MARK = MARKS.shelf;                       // [-0.45, 1.44]
const LENS_ROOM = [-0.45, 1.53, 4.2];                 // where the outside camera stands for the shelf shots

// ---------------------------------------------------------------- the guests (costume and posture; faces undrawn)
// They hold these places in every shot unless a shot moves one. Kept out of the three lamps' paths to her and to the
// truth half of the shelf, so that only she throws shadows there.
const A = { A1: [-2.2, 3.3], A2: [-1.7, 3.15], A3: [-1.85, 3.8] }, AC = [-1.92, 3.42];
const C = { C1: [4.2, 3.9], C2: [4.85, 4.2], C3: [4.45, 4.65] }, CC = [4.5, 4.25];
// figure-relative offset (metres to the figure's left, up, forward) -> world offset, for a figure with this yaw
const rel = (yaw, l, u, f) => { const a = yaw * Math.PI / 180; return [+(l * Math.cos(a) + f * Math.sin(a)).toFixed(3), u, +(-l * Math.sin(a) + f * Math.cos(a)).toFixed(3)]; };
// a hand held in front of the chest as if round a cup of lemonade
const cupArm = (side, yaw) => ({ to: 'self:chest', off: rel(yaw, side === 'L' ? 0.1 : -0.1, -0.08, 0.2), hand: 'grip', fingers: 'up', palm: 'in', elbow: 'down' });
const stand = (at, yaw, o = {}) => { const { cup, ...r } = o; const f = { at, yaw, legs: 'stand', L: 'side', R: 'side', ...r }; if (cup) f[cup] = cupArm(cup, yaw); return f; };
function crowd(o = {}) {
  const lookAt = o.lookAt;                            // BR3: the room turns to look at her
  const hd = (dflt) => ({ head: { look: lookAt || dflt } });
  const f = {
    A1: stand(A.A1, yawTo(A.A1, AC), { ...hd([-1.7, 1.5, 3.15]), cup: 'R' }),
    A2: stand(A.A2, yawTo(A.A2, AC), { ...hd([-2.2, 1.6, 3.3]), L: { to: 'self:waist', off: rel(yawTo(A.A2, AC), 0.17, 0.02, 0.1), hand: 'relax' } }),
    A3: stand(A.A3, yawTo(A.A3, AC), { ...hd([-1.7, 1.5, 3.15]), cup: 'L' }),
    S1: { at: [-2.42, 0.52, 2.0], yaw: 90, legs: 'seat', legOpts: { seatH: 0.52 }, spine: { bend: -6 }, ...hd([-1.8, 1.5, 3.3]), L: 'kneeL', R: 'kneeR' },
    B1: stand([1.9, 0.98], 180, { head: { look: [1.75, 1.45, 0.29] }, R: { to: [2.02, 1.42, 0.36], hand: 'pinch', fingers: 'fwd' } }),
    B2: stand([2.42, 1.3], yawTo([2.42, 1.3], [1.9, 0.98]) + 20, { head: { look: [1.9, 1.6, 0.98] }, cup: 'R' }),
    E1: stand([2.35, 1.95], 80, { head: { look: [8.8, 1.3, 4.8] }, cup: 'L' }),
    C1: stand(C.C1, yawTo(C.C1, CC), { head: { look: [4.85, 1.65, 4.2] }, cup: 'R' }),
    C2: stand(C.C2, yawTo(C.C2, CC), { head: { look: [4.2, 1.5, 3.9] }, R: { to: 'self:chest', off: rel(yawTo(C.C2, CC), -0.2, 0.02, 0.28), hand: 'palmUp', palm: 'up' } }),
    C3: stand(C.C3, yawTo(C.C3, CC), { head: { look: [4.85, 1.65, 4.2] }, cup: 'L' }),
    W1: stand([7.4, 5.9], yawTo([7.4, 5.9], POI.at), { head: { look: [8.8, 1.3, 4.8] } }),
    W2: stand([7.2, 4.4], yawTo([7.2, 4.4], POI.at), { head: { look: [8.8, 1.3, 4.8] }, cup: 'R' }),
    T1: stand([4.45, 1.5], 180, { spine: { bend: 12 }, head: { look: [4.4, 0.9, 0.75] }, R: { to: [4.4, 0.98, 0.78], hand: 'grip', palm: 'in' } }),
    H1: stand([5.5, 4.0], yawTo([5.5, 4.0], CC), { head: { look: [4.5, 1.6, 4.25] } }),
    G1: stand([3.75, 3.95], yawTo([3.75, 3.95], CC), { head: { look: [4.5, 1.6, 4.25] }, cup: 'R' }),
    poi: stand(POI.at, POI.yaw, { head: { look: [7.6, 1.2, 4.2] }, L: { to: 'poiL', hand: 'grip', elbow: 'down' }, R: { to: 'poiR', hand: 'grip', elbow: 'down' } }),
  };
  for (const k of o.drop || []) delete f[k];
  return { ...f, ...(o.set || {}) };
}

// ---------------------------------------------------------------- the principals
// at the shelf, bridge: she faces the room (and the lens); he stands at her left, back to the room, reading spines
const HE_SHELF = [0.13, 1.32];
const jadeShelf = (o = {}) => ({ at: SHELF_MARK, yaw: 6, legs: 'stand', head: { look: LENS_ROOM }, R: 'side',
  L: { to: 'firstLove27:elbowL', off: [-0.055, 0.1, 0.02], hand: 'flat', fingers: [0.85, 0.45, -0.2], palm: [0.5, -0.8, 0.2] }, ...o });
const heShelf = (o = {}) => ({ at: HE_SHELF, yaw: 180, legs: 'stand', head: { look: [0.35, 1.5, 0.29] }, L: 'side', R: { to: [0.3, 1.38, 0.4], hand: 'pinch', fingers: 'fwd' }, ...o });
// chorus 2b: they face each other; he holds a cup, her hand taps on that forearm, he looks down at it
const HE_C2 = [-0.68, 1.94];
const jadeC2 = (o = {}) => ({ at: SHELF_MARK, yaw: yawTo(SHELF_MARK, HE_C2), legs: 'stand', head: { look: 'firstLove27:eyes' }, L: 'side',
  R: { to: 'firstLove27:wristL', off: [0.0, 0.04, 0.0], hand: 'flat', fingers: 'to:firstLove27:elbowL', palm: 'down' }, ...o });
const heC2 = (o = {}) => ({ at: HE_C2, yaw: yawTo(HE_C2, SHELF_MARK), legs: 'stand', spine: { bend: 4 }, head: { look: 'jade27:handR', pitchK: 0.9 }, R: 'side',
  L: cupArm('L', yawTo(HE_C2, SHELF_MARK)), ...o });
// under the lemon tree: he came out with her and stands on the house side of her
const TREE_MARK = MARKS.tree, HE_TREE = [5.49, 1.76];
const jadeTree = (o = {}) => ({ at: TREE_MARK, yaw: yawTo(TREE_MARK, HE_TREE), legs: 'stand', head: { look: 'firstLove27:eyes' }, L: 'side', R: cupArm('R', yawTo(TREE_MARK, HE_TREE)), ...o });
const heTree = (o = {}) => ({ at: HE_TREE, yaw: yawTo(HE_TREE, TREE_MARK), legs: 'stand', head: { look: 'jade27:eyes' }, L: 'side', R: { to: 'self:chest', off: rel(yawTo(HE_TREE, TREE_MARK), -0.2, 0.0, 0.26), hand: 'palmUp', palm: 'up' }, ...o });

const BRIDGE = { lamps: true, dusk: true, poi: false }, PARTY = { lamps: true, dusk: true, poi: true }, NIGHT = { lamps: true, dusk: false, poi: true };
const bridgeFigs = (j = {}, h = {}, c = {}) => ({ ...crowd(c), jade27: jadeShelf(j), firstLove27: heShelf(h) });

export const SHOTS = [
  // ================================================================ BRIDGE 2:45-3:03 (bookshelf room)
  { id: 'BR1', lens: 35, space: 'room', time: '2:45', section: 'Bridge', pos2: 'outside', amp: 100,
    orbit: { at: 'jade27:eyes', az: 0, el: 0, dist: 2.5 }, aim: ['jade27:eyes', 0.44, 0.36], focus: ['jade27'],
    header: 'Bridge 2:45: she taps on his arm and grins, to lens; he reads spines, back to us',
    intent: 'Outside, frontal, level, locked off. She faces the room at the shelf; her hand taps on first love’s upper arm (he stands back to camera, never face-on); the grin arrives before the line. The shelf seam is just right of her.',
    figs: bridgeFigs(), light: BRIDGE },
  { id: 'BR2', lens: 50, space: 'room', time: '2:45-2:49', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 0, el: 0, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4],
    header: 'Bridge 2:45: "Do you not see what I see?" sung to lens beside the shelf (synced, delighted)',
    intent: 'Outside. Same axis as BR1, tighter: her face in the 4:5 centre, the spines soft behind, his shoulder at frame right. Synced, to lens, delighted.',
    figs: bridgeFigs(), light: BRIDGE },
  { id: 'BR3', lens: 20, space: 'room', time: '2:49-2:52', section: 'Bridge', pos2: 'inside',
    orbit: { at: 'jade27:eyes', az: -42, el: 0, dist: 0.02 }, target: [-2.05, 1.38, 3.1], hide: ['jade27'],
    header: 'Bridge 2:49: the guests’ blank stares, from her eyes (their faces are undrawn)',
    intent: 'Inside: her own view across the room. Everyone has turned to look at her; no face is drawn, so the blank stares are literal. Sofa sitter at left, the standing three by the hall doorway, the dusk shaft from the slider crossing behind them.',
    figs: bridgeFigs({}, {}, { lookAt: 'jade27:eyes' }), light: BRIDGE },
  { id: 'BR4a', lens: 24, space: 'room', time: '2:49-2:54', section: 'Bridge', pos2: 'outside', shadows: true,
    pos: [0, 1.25, 4.33], target: [0, 1.06, 0.29],
    header: 'Bridge 2:49: "Beauty on this side, truth by reference": the shelf in two halves, square on',
    intent: 'Square-on elevation of the whole wall of books with the seam on the centre line: TRUTH (dark case, uniform reference sets) frame-left, BEAUTY (pale case, every height) frame-right. She has turned to the shelf at the seam, one hand out to each half; he beside her, back to us.',
    figs: bridgeFigs({ yaw: 180, head: { look: [0.0, 1.5, 0.29] }, L: { to: [-1.05, 1.32, 1.2], hand: 'flat', palm: 'fwd', fingers: [-1, 0.2, -0.3] }, R: { to: [0.02, 1.32, 1.0], hand: 'flat', palm: 'fwd', fingers: [0.6, 0.3, -0.8] } },
      { at: [0.62, 1.3], head: { look: [0.8, 1.5, 0.29] }, R: 'side' }), light: BRIDGE },
  { id: 'BR4b', lens: 32, space: 'room', time: '2:54-2:57', section: 'Bridge', pos2: 'inside', shadows: true, hideParts: { jade27: ['head'] },
    pos: [-0.56, 1.6, 1.3], target: [-0.74, 1.58, 0.285],
    header: 'Bridge 2:54: "Science fiction shelved with truth": paperbacks among the reference sets, her eye-line',
    intent: 'Inside, close on the spines at her eye height: a run of small bright science-fiction paperbacks between the uniform reference volumes. The head of her first shadow lies across them.',
    figs: bridgeFigs({ yaw: 186, head: { look: [-0.68, 1.52, 0.29] }, L: 'side', R: 'side' }, { at: [0.62, 1.3], R: 'side' }), light: BRIDGE },
  { id: 'BR5', lens: 28, space: 'room', time: '2:57-2:59', section: 'Bridge', pos2: 'inside', shadows: true,
    pos: [-1.05, 1.55, 3.35], aim: [[-1.28, 1.25, 0.29], 0.42, 0.5], subject: [-1.32, 1.3, 0.29],
    header: 'Bridge 2:57: "From inside, I can’t tell the difference": three lamps, three matching shadows on the spines',
    intent: 'Inside, over her shoulder along her eye-line: she stands at frame right, back to us, looking at the truth half, where three lamps behind the camera throw three near-identical shadows of her, evenly stepped to the left. He has stepped away (out of frame, by the slider) so that only her shadows are on the spines.',
    figs: bridgeFigs({ yaw: 196, head: { look: [-1.32, 1.5, 0.29] }, L: 'side', R: 'side' }, { at: [2.1, 2.7], yaw: 80, head: { look: [8.8, 1.3, 4.8] }, R: 'side' }),
    light: { ...BRIDGE, amb: 0.55, lampI: 1.25, fill: 0.15 } },
  { id: 'BR6', lens: 85, space: 'room', time: '3:00-3:03', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 0, el: 0, dist: 1.75 }, aim: ['jade27:eyes', 0.5, 0.42],
    header: 'Bridge 3:00: "And I can’t give you proof", sung, held into the stop',
    intent: 'Outside, frontal, level, locked off, close. Synced; the last word rings into the hard stop. HS1 is this exact camera with the room removed.',
    figs: bridgeFigs({ yaw: 0, L: 'side' }, { at: [0.62, 1.3], R: 'side' }), light: BRIDGE },
  // ================================================================ HARD STOP 3:03-3:05
  { id: 'HS1', same: 'BR6', solo: ['jade27'], time: '3:03-3:05', section: 'Hard stop', sync: null,
    header: 'Hard stop 3:03: her face alone on bare paper (BR6’s camera, the room gone)',
    intent: 'Identical camera and pose to BR6; everything except her is removed. Bare paper with one thing left on it.' },

  // ================================================================ VERSE 3 3:05-3:29 (the party at 115%)
  { id: 'V3a', lens: 24, space: 'yard', time: '3:05-3:08', section: 'Verse 3', pos2: 'outside', amp: 115,
    pos: [2.05, 1.55, 2.86], aim: ['jade27:eyes', 0.4, 0.42], far: 16,
    header: 'Verse 3 3:05: "Housewarming, lemonade from the yard": the party at dusk through the open slider',
    intent: 'Wide from inside the room out through the open slider, into the low sun: patio, guests, the lemon tree with pomelo-sized lemons at left, the fire poi starting at right. She and first love under the tree. Sun only reaches what stands above the fence shadow: heads, lemons.',
    figs: { ...crowd(), jade27: jadeTree(), firstLove27: heTree() }, light: PARTY },
  { id: 'V3b', lens: 35, space: 'yard', time: '3:08-3:11', section: 'Verse 3', pos2: 'inside', amp: 115, hideParts: { jade27: ['head'] },
    pos: [6.22, 1.6, 1.62], target: [6.72, 2.02, 0.98],
    header: 'Verse 3 3:08: lemons the size of pomelos, along her eye-line; her hand comes up to one',
    intent: 'Inside: her view up into the tree. Oversized lemons in the last sun; her hand rises into frame toward the nearest.',
    figs: { ...crowd(), jade27: jadeTree({ yaw: yawTo(TREE_MARK, [7.0, 0.6]), head: { look: [6.75, 1.95, 0.95] }, R: { to: [6.52, 1.8, 1.24], hand: 'cup', palm: 'up', fingers: 'fwd' }, L: 'side' }), firstLove27: heTree() }, light: PARTY },
  { id: 'V3c', lens: 50, space: 'yard', time: '3:08-3:13', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: 101, el: 1, dist: 3.1 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Verse 3 3:08: "Perky American girl / I play the part": the greeting in the doorway (one pitch contour)',
    intent: 'Outside, frontal on her from the patio, past the greeting guest’s back. She stands in the open slider, the room and its lamps behind her, the low sun full on her: wave a little too big and a few frames early. The gold pitch contour is drawn over the greeting.',
    figs: { ...crowd({ set: { G1: stand([3.95, 3.25], -92, { head: { look: 'jade27:eyes' }, L: { to: [3.85, 1.92, 3.62], hand: 'flat', fingers: 'up', palm: [-1, 0, 0] } }) } }),
      jade27: { at: MARKS.greeting, yaw: 90, legs: 'stand', head: { look: 'G1:head' }, L: 'side', R: { to: [2.95, 1.86, 3.2], hand: 'flat', fingers: 'up', palm: [1, 0, 0], elbow: [0, -0.6, 1] } },
      firstLove27: stand([1.65, 2.05], -95, { head: { look: [0.2, 1.5, 2.2] } }) }, light: PARTY },
  { id: 'V3d', lens: 45, space: 'yard', time: '3:13-3:16', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: yawTo(TREE_MARK, HE_TREE) + 19, el: 3, dist: 2.05 }, aim: ['jade27:eyes', 0.58, 0.38], focus: ['jade27'],
    header: 'Verse 3 3:13: "He said I absolutely nailed it": first love says something we don’t hear (over his shoulder)',
    intent: 'Over first love’s shoulder (back of his head only) onto her, under the lemons. He is speaking; she listens at 115%, nodding a beat early. Tree and lemons behind her, fence and dusk beyond.',
    figs: { ...crowd(), jade27: jadeTree(), firstLove27: heTree() }, light: PARTY },
  { id: 'V3e', lens: 40, space: 'yard', time: '3:16-3:18', section: 'Verse 3', pos2: 'inside', amp: 115,
    pos: [6.75, 1.5, 2.35], aim: [[8.8, 1.15, 4.8], 0.55, 0.52], subject: [8.8, 1.15, 4.8],
    header: 'Verse 3 3:16: "fifteen percent above amplitude": the fire poi, the second light',
    intent: 'Inside: what she is looking at. The poi spinner against the dusk fence, two circles of fire; two guests in silhouette in front. From here on the poi is the light source.',
    figs: { ...crowd(), jade27: jadeTree({ head: { look: [8.8, 1.2, 4.8] } }), firstLove27: heTree() }, light: PARTY },
  { id: 'V3f', lens: 50, space: 'yard', time: '3:18-3:24', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: 60, el: 4, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4], focus: ['jade27'],
    header: 'Verse 3 3:21: "Hug durations": a hug on the patio, gold ticks counting it',
    intent: 'Outside on her face over the hugged guest’s shoulder (guest back to us). Her arms round the guest, chin over the shoulder, eyes to lens-side: counting. Gold ticks accumulate along the top of the embrace.',
    figs: { ...crowd({ set: { H1: stand([4.6, 2.2], -75, { spine: { bend: 6 }, head: { look: [3.4, 1.5, 1.2] },
        L: { to: 'jade27:waist', off: [-0.17, 0.12, 0.1], hand: 'flat', palm: [1, 0, 0], fingers: [0, 0, 1] }, R: { to: 'jade27:waist', off: [-0.17, 0.2, -0.08], hand: 'flat', palm: [1, 0, 0], fingers: [0, 0, -1] } }) } }),
      jade27: { at: MARKS.hug, yaw: 97, legs: 'stand', spine: { bend: 6 }, head: { look: [5.95, 1.62, 3.3] },
        L: { to: 'H1:waist', off: [0.17, 0.22, -0.06], hand: 'flat', palm: [-1, 0, 0], fingers: [0, 0, 1] }, R: { to: 'H1:waist', off: [0.17, 0.1, 0.1], hand: 'flat', palm: [-1, 0, 0], fingers: [0, 0, -1] } },
      firstLove27: stand([5.65, 1.4], 200, { head: { look: [5.0, 1.0, 0.8] } }) }, light: PARTY },
  { id: 'V3g', lens: 20, space: 'room', time: '3:24-3:27', section: 'Verse 3', pos2: 'plan', amp: 115, path: true,
    pos: [2.78, 2.34, 0.42], aim: ['jade27:head', 0.5, 0.56], subject: [0.6, 1.0, 2.75],
    header: 'Verse 3 3:24: "Room crossing velocity": high angle, she crosses the room, her route one line',
    intent: 'High from the corner above the beauty half, the whole room below: guests in their groups, three lamps along the far wall, the slider and the dusk shaft at right. She is mid-stride on the route (drawn on the floor); faint gold schematics and vectors go over this frame.',
    figs: { ...crowd({ drop: ['B1', 'B2'] }), jade27: { at: [MARKS.crossing[0], 0.83, MARKS.crossing[1]], yaw: 82, legs: 'stand', legOpts: { ankleL: [0.105, -0.775, 0.24], ankleR: [0.105, -0.775, -0.2] }, spine: { bend: 5 }, head: { look: [2.9, 1.5, 2.85] },
        L: { to: 'self:waist', off: [-0.14, -0.1, -0.22], hand: 'relax' }, R: { to: 'self:waist', off: [0.2, 0.0, 0.2], hand: 'relax' } },
      firstLove27: heShelf({ yaw: 120, head: { look: [0.6, 1.5, 2.75] }, R: 'side' }) }, light: PARTY },
  { id: 'V3h', lens: 0, ortho: { w: 11.6 }, space: 'room+yard', time: '3:24-3:29', section: 'Verse 3', pos2: 'plan', amp: 115, path: true,
    pos: [2.35, 20, 2.45], target: [2.35, 0, 2.45], up: [0, 0, -1], hide: ['ceiling', 'roof eave'], near: 0.5, far: 30,
    header: 'Verse 3 3:24: top-down plan: her path across the room as one line (shelf, rug, slider, patio, tree)',
    intent: 'Plan view, shelf wall at the top of frame, yard at right. Her whole route from the shelf mark to the lemon tree is one continuous line; the review’s gold schematics overlap this. Also the reference plan for every other mv10 shot.',
    figs: { ...crowd(), jade27: jadeTree(), firstLove27: heTree() }, light: PARTY },

  // ================================================================ SILENCE 3:29-3:33
  { id: 'SI1', lens: 85, space: 'yard', time: '3:29-3:33', section: 'Silence', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: -143, el: 0, dist: 1.45 }, aim: ['jade27:eyes', 0.5, 0.42],
    header: 'Silence 3:29: "I think he’s right. Honestly." close, hushed, back at 100%',
    intent: 'Outside, frontal, level, locked off, close: she has turned from him to the lens. Dusk is gone; the fire poi burns directly behind her and rims her. One cut from 115 to 100: lighter line, no gesture. Synced, hushed, last word unpitched.',
    figs: { ...crowd(), jade27: jadeTree({ yaw: -112, head: { look: [5.43, 1.55, 0.34] }, R: 'side' }), firstLove27: heTree({ R: 'side' }) }, light: NIGHT },

  // ================================================================ CHORUS 2b 3:43-3:53 (back at the shelf)
  { id: 'C2a', lens: 70, space: 'room', time: '3:43-3:49', section: 'Chorus 2b', pos2: 'outside', amp: 100, sync: 'anti', singers: ['jade27'], shadows: true,
    orbit: { at: 'jade27:eyes', az: yawTo(SHELF_MARK, HE_C2) + 42, el: 3, dist: 2.1 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Chorus 2b 3:43: "I open my mouth, my voice goes blind": mouth open, not moving with the vocal; eyes bright (over his shoulder)',
    intent: 'The anti-sync shot, over first love’s shoulder (back of his head, frame left). Her mouth opens and holds; she is thinking it at him. The shelf seam stands right behind her head, a half on either side. Hold it long.',
    figs: { ...crowd(), jade27: jadeC2({ head: { look: 'firstLove27:eyes', turn: 20 } }), firstLove27: heC2() }, light: NIGHT },
  { id: 'C2b', lens: 30, space: 'room', time: '3:49-3:53', section: 'Chorus 2b', pos2: 'inside', amp: 100,
    orbit: { at: 'firstLove27:wristL', az: -95, el: 48, dist: 0.95 }, aim: ['firstLove27:wristL', 0.45, 0.74], subject: [-0.75, 1.2, 1.72],
    header: 'Chorus 2b 3:49: her hand taps on his forearm; he looks down at it (from behind his shoulder)',
    intent: 'Inside, close, from above and behind his left shoulder: the back of his head tipped down, his forearm, her hand tapping on it. The percussion is her. Third of the film’s hands-on-a-forearm, the only one that is hers.',
    figs: { ...crowd(), jade27: jadeC2(), firstLove27: heC2() }, light: NIGHT },
];

// resolve copies
for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins (integration pass): every camera has a `beam_<id>` twin; `--prefix beam_ --modes flat --nojson` renders
// the lit volume white on black. Appended last, so copies made with `same` are already resolved.
import { maskTwins } from '../_beam.js';
{ const base = SHOTS.slice(), twins = maskTwins(base, { surf: true });   // beam_<id> = every light that is on in the shot, together
  // mv10 has three kinds of light, so each also gets a mask of its own: beam_<id>__lamps, beam_<id>__dusk, beam_<id>__poi
  const per = base.flatMap((s) => ['lamps', 'dusk', 'poi'].filter((k) => (s.light || {})[k] !== false).map((k) => ({ ...s, id: `beam_${s.id}__${k}`, beamMask: true, beamOnly: k, header: `beam mask for ${s.id}: ${k} only` })));
  SHOTS.push(...twins, ...per); }
