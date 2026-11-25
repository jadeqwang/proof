// MV10 camera table: the housewarming at 345B View St, Mountain View, fall 2010 (rebuilt 2026-11-25 (2) from Jade's
// drawings). One entry per shot the plan's Structure table places here:
//   BR*  bridge 2:45-3:03 (late-afternoon daylight)   HS1 hard stop 3:03-3:05   V3* verse 3 3:05-3:29 (the sun going down)
//   SI1  silence 3:29-3:33 (dusk into dark, poi)       C2* chorus 2b 3:43-3:53 (back at the shelf, ceiling lights)
// Each shot's `section` picks its clock time and sun from layout.js SCENE (one date, one time per section).
// World axes (layout.js): X = NNE, Z = ESE, y up, house floor 0, yard grade GRADE (-0.6). yaw 0 faces +Z (ESE, toward the
// yard), yaw 180 faces WNW (toward the front door and the couch), yaw 90 faces NNE, -90 SSW.
// RETIRED 2026-11-25 (2): BR4a (square-on halves), BR4b (sci-fi beside the Feynman set) -> the pan BRpan_a / m1 / b;
// BR5 (three lamps, three shadows) -> gone with the invented lamps (Jade: there were no paper lamps; drop the image).
import { MARKS, MARK_FLOOR, POI, SHELF, SHELF_W, TREE, GRADE, PATIO, DRINKS, SECTION_KEY, SECTION_LIGHT, SUN } from './layout.js';

const yawTo = (a, b) => +(Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI).toFixed(1);
const SHELF_MARK = MARKS.shelf;                       // [2.72, 3.62]: in front of the truth half, facing the room
const LENS_ROOM = [2.72, 1.53, 1.15];                 // where the outside camera stands for the shelf shots (by the couch's end)
const DECK = PATIO.top, Y = (y, f) => y + f;          // a world height above a floor

// ---------------------------------------------------------------- the guests (costume and posture; faces undrawn)
// Living room: S1 and B2 on the couch (in the window's sun during the bridge), B1 by the SSW window, group A between the
// glass table and the front door, E1 in the open front door. Kitchen: C group inside the counter U, clear of her route.
// Deck: T1 at the lemonade, G1 (greeting) and H1 (hug). Lawn: W1 and W2 watching the poi spinner.
const A = { A1: [3.55, 0.95], A2: [4.3, 1.05], A3: [3.95, 1.6] }, AC = [3.95, 1.2];
const C = { C1: [3.55, 6.45], C2: [3.25, 7.35], C3: [3.95, 7.25] }, CC = [3.6, 7.0];
const rel = (yaw, l, u, f) => { const a = yaw * Math.PI / 180; return [+(l * Math.cos(a) + f * Math.sin(a)).toFixed(3), u, +(-l * Math.sin(a) + f * Math.cos(a)).toFixed(3)]; };
const cupArm = (side, yaw) => ({ to: 'self:chest', off: rel(yaw, side === 'L' ? 0.1 : -0.1, -0.08, 0.2), hand: 'grip', fingers: 'fwd', palm: 'in', elbow: 'down', hold: { r: 0.034, h: 0.1, label: 'cup of lemonade' } });
const stand = (at, yaw, o = {}) => { const { cup, ...r } = o; const f = { at, yaw, legs: 'stand', L: 'side', R: 'side', ...r }; if (cup) f[cup] = cupArm(cup, yaw); return f; };
const onGrade = (at, yaw, o = {}) => stand(at, yaw, { floor: GRADE, ...o }), onDeck = (at, yaw, o = {}) => stand(at, yaw, { floor: DECK, ...o });
function crowd(o = {}) {
  const lookAt = o.lookAt, hd = (dflt) => ({ head: { look: lookAt || dflt } });
  const f = {
    A1: stand(A.A1, yawTo(A.A1, AC), { ...hd([4.3, 1.55, 1.05]), cup: 'R' }),
    A2: stand(A.A2, yawTo(A.A2, AC), { ...hd([3.55, 1.6, 0.95]), L: { to: 'self:waist', off: rel(yawTo(A.A2, AC), 0.17, 0.02, 0.1), hand: 'relax' } }),
    A3: stand(A.A3, yawTo(A.A3, AC), { ...hd([3.55, 1.55, 0.95]), cup: 'L' }),
    S1: { at: [1.45, 0.52, 0.66], yaw: 0, legs: 'seat', legOpts: { seatH: 0.52 }, spine: { bend: -6 }, ...hd([2.05, 1.2, 0.66]), L: 'kneeL', R: 'kneeR' },
    B2: { at: [2.05, 0.52, 0.66], yaw: 0, legs: 'seat', legOpts: { seatH: 0.52 }, spine: { bend: -4 }, ...hd([1.45, 1.25, 0.66]), L: 'kneeL', R: cupArm('R', 0) },
    B1: stand([0.6, 2.55], yawTo([0.6, 2.55], [1.7, 0.7]), { ...hd([1.7, 1.1, 0.66]), cup: 'R' }),
    E1: stand([4.3, 0.42], 180, { head: { look: [4.3, 1.5, -6] }, cup: 'L' }),
    C1: stand(C.C1, yawTo(C.C1, CC), { head: { look: [3.25, 1.6, 7.35] }, cup: 'R' }),
    C2: stand(C.C2, yawTo(C.C2, CC), { head: { look: [3.55, 1.6, 6.45] }, R: { to: 'self:chest', off: rel(yawTo(C.C2, CC), -0.2, 0.02, 0.28), hand: 'palmUp', palm: 'up' } }),
    C3: stand(C.C3, yawTo(C.C3, CC), { head: { look: [3.55, 1.6, 6.45] }, cup: 'L' }),
    T1: onDeck([3.0, 11.5], 0, { spine: { bend: 12 }, head: { look: [2.8, DECK + 0.8, 12.2] }, R: { to: [2.8, DECK + DRINKS.h + 0.22, 12.2], hand: 'grip', palm: 'in' } }),
    G1: onDeck([1.75, 11.0], yawTo([1.75, 11.0], [1.21, 9.62]), { head: { look: [1.21, 1.55, 9.62] }, cup: 'R' }),
    H1: onDeck([3.3, 11.2], yawTo([3.3, 11.2], [1.75, 11.0]), { head: { look: [1.75, DECK + 1.6, 11.0] } }),
    W1: onGrade([6.4, 16.4], yawTo([6.4, 16.4], POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] } }),
    W2: onGrade([6.2, 18.4], yawTo([6.2, 18.4], POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] }, cup: 'R' }),
    poi: onGrade(POI.at, POI.yaw, { head: { look: [9.9, GRADE + 1.5, 17.95] }, L: { to: 'poiL', hand: 'grip', elbow: 'down' }, R: { to: 'poiR', hand: 'grip', elbow: 'down' } }),
  };
  if (o.noPoi) delete f.poi;
  for (const k of o.drop || []) delete f[k];
  return { ...f, ...(o.set || {}) };
}

// ---------------------------------------------------------------- the principals
// At the shelf (bridge): she faces the room (and the lens) in front of the truth half; he stands at her right (frame
// left), back to the room, reading the textbooks (cube 3,3), pulling one out with his left hand. Her right hand taps
// his right elbow. (He: Naot cork sandals, forearm hair clearly visible: sidecar note `first_love_costume`.)
const HE_SHELF = [3.32, 4.0];
const CUBE33 = SHELF_W.cube(3, 3);
const jadeShelf = (o = {}) => ({ at: SHELF_MARK, yaw: 180, legs: 'stand', head: { look: LENS_ROOM }, L: 'side',
  R: { to: 'firstLove27:elbowR', off: [-0.055, 0.1, -0.02], hand: 'flat', fingers: [0.85, 0.45, 0.2], palm: [0.5, -0.8, -0.2] }, ...o });
const heShelf = (o = {}) => ({ at: HE_SHELF, yaw: 0, legs: 'stand', head: { look: [CUBE33[0], 1.3, SHELF_W.spines] }, R: 'side', L: { to: [CUBE33[0] + 0.05, 1.36, SHELF_W.front - 0.07], hand: 'pinch', fingers: 'fwd' }, ...o });
// chorus 2b: they face each other at the shelf; he holds a cup, her hand taps on that forearm, he looks down at it.
const HE_C2 = [SHELF_MARK[0] + 0.23, SHELF_MARK[1] - 0.5];
const jadeC2 = (o = {}) => ({ at: SHELF_MARK, yaw: yawTo(SHELF_MARK, HE_C2), legs: 'stand', head: { look: 'firstLove27:eyes' }, L: 'side',
  R: { to: 'firstLove27:wristL', off: [0.0, 0.04, 0.0], hand: 'flat', fingers: 'to:firstLove27:elbowL', palm: 'down' }, ...o });
const heC2 = (o = {}) => ({ at: HE_C2, yaw: yawTo(HE_C2, SHELF_MARK), legs: 'stand', spine: { bend: 4 }, head: { look: 'jade27:handR', pitchK: 0.9 }, R: 'side',
  L: cupArm('L', yawTo(HE_C2, SHELF_MARK)), ...o });
// under the lemon tree: he came out with her and stands on the house side of her
const TREE_MARK = MARKS.tree, HE_TREE = [9.25, 17.3];
const jadeTree = (o = {}) => ({ at: TREE_MARK, floor: GRADE, yaw: yawTo(TREE_MARK, HE_TREE), legs: 'stand', head: { look: 'firstLove27:eyes' }, L: 'side', R: cupArm('R', yawTo(TREE_MARK, HE_TREE)), ...o });
const heTree = (o = {}) => ({ at: HE_TREE, floor: GRADE, yaw: yawTo(HE_TREE, TREE_MARK), legs: 'stand', head: { look: 'jade27:eyes' }, L: 'side', R: { to: 'self:chest', off: rel(yawTo(HE_TREE, TREE_MARK), -0.2, 0.0, 0.26), hand: 'palmUp', palm: 'up' }, ...o });

const bridgeFigs = (j = {}, h = {}, c = {}) => ({ ...crowd({ noPoi: true, ...c }), jade27: jadeShelf(j), firstLove27: heShelf(h) });
const partyFigs = (j, h, c = {}) => ({ ...crowd(c), jade27: j, firstLove27: h });
// mid-crossing (the time midpoint of CROSSING): stepping from the opening into the dining area; he watches from the shelf
const crossingFigs = () => partyFigs({ at: [MARKS.crossing[0], 0.83, MARKS.crossing[1]], yaw: 52, legs: 'stand', legOpts: { ankleL: [0.105, -0.775, 0.24], ankleR: [0.105, -0.775, -0.2] }, spine: { bend: 5 }, head: { look: [2.5, 1.5, 7.6] },
    L: { to: 'self:waist', off: [-0.14, -0.1, -0.22], hand: 'relax' }, R: { to: 'self:waist', off: [0.2, 0.0, 0.2], hand: 'relax' } },
  heShelf({ yaw: -150, head: { look: [MARKS.crossing[0], 1.5, MARKS.crossing[1]] }, L: 'side' }));

// the pan across the Expedit (Jade, 2026-11-25): a lateral track, same lens, same height, level, spines filling the frame.
// Timeline: the -2sm render (media/karaoke_v2/lyrics_timed.json, FULL-MIX times; the instrumental-track times are ~0.1 s
// earlier and are in the sidecar too). "Beauty on this side" 159.62, "truth" 161.96, "Science fiction shelved with truth"
// 164.41-166.80. (The older v3 song map had 169.4 / 171.8 / 174.4-176.67.)
const TL = 'media/karaoke_v2/lyrics_timed.json (-2sm render), full-mix time (*_full); instrumental-track time = s/e';
const PAN = { lens: 35, y: 1.45, z: SHELF_W.front - 1.45 };
const panAt = (x) => ({ pos: [x, PAN.y, PAN.z], target: [x, PAN.y - 0.04, SHELF_W.front] });
const PAN_X = { a: (SHELF_W.beautyX[0] + SHELF_W.beautyX[1]) / 2, m1: SHELF_W.seam, b: SHELF_W.cube(4, 4)[0] };
const PAN_FIGS = () => bridgeFigs({ at: [1.6, 3.1], yaw: 60, head: { look: [PAN_X.a, 1.4, SHELF_W.front] }, R: 'side' }, { at: [1.15, 4.3], yaw: 120, head: { look: [1.6, 1.5, 3.1] }, L: 'side' });
const panShot = (id, key, t0, t1, lyric, intent, extra = {}) => ({ id, lens: PAN.lens, ...panAt(PAN_X[key]), space: 'room', time: `${(t0 / 60 | 0)}:${(t0 % 60).toFixed(1).padStart(4, '0')}`, section: 'Bridge', pos2: 'inside',
  timing: { timeline: TL, start_s: t0, end_s: t1, lyric, v3_song_map_s: { a: [169.4, 171.8], m1: [171.8, 174.4], b: [174.4, 176.67] }[key], move: 'lateral track along the Expedit face, level, same lens (35 mm) and height (1.45 m), 1.45 m from the frame front; camera X ' + PAN_X.a.toFixed(3) + ' (beauty half centre) -> ' + PAN_X.m1.toFixed(3) + ' (seam) -> ' + PAN_X.b.toFixed(3) + ' (cube 4,4)', her: 'NOT in frame (our choice): the track is her eye-line; she stands back at the couch end' },
  header: `Bridge ${(t0 / 60 | 0)}:${(t0 % 60).toFixed(1).padStart(4, '0')}: "${lyric}" (pan across the Expedit, ${key})`, intent, figs: PAN_FIGS(), ...extra });

export const SHOTS = [
  // ================================================================ BRIDGE 2:45-3:03 (living room, late-afternoon daylight)
  { id: 'BR1', lens: 35, space: 'room', time: '2:45', section: 'Bridge', pos2: 'outside', amp: 100,
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 2.45 }, aim: ['jade27:eyes', 0.6, 0.36], focus: ['jade27'],
    header: 'Bridge 2:45: she taps on his arm and grins, to lens; he reads spines, back to us',
    intent: 'Outside, frontal, level, locked off, from the couch end. She faces the room in front of the truth half of the Expedit (the 2x2 with the printer and the opening to the kitchen at frame right); her hand taps on first love’s arm (he stands back to camera at frame left, reading the textbooks); the grin arrives before the line. Daylight from the WNW window behind the camera.',
    figs: bridgeFigs() },
  { id: 'BR2', lens: 50, space: 'room', time: '2:45-2:49', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4],
    header: 'Bridge 2:45: "Do you not see what I see?" sung to lens beside the shelf (synced, delighted)',
    intent: 'Outside. Same axis as BR1, tighter: her face in the 4:5 centre, the spines soft behind, his shoulder at frame left. Synced, to lens, delighted.',
    figs: bridgeFigs() },
  { id: 'BR3', lens: 20, space: 'room', time: '2:49-2:52', section: 'Bridge', pos2: 'inside',
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 0.02 }, target: [2.0, 1.15, 0.6], hide: ['jade27'],
    header: 'Bridge 2:49: the guests’ blank stares, from her eyes (their faces are undrawn)',
    intent: 'Inside: her own view across the living room toward the front. Everyone has turned to look at her; no face is drawn, so the blank stares are literal. The couch under the WNW window in the late sun, the Noguchi table, the group by the glass table and the open front door.',
    figs: bridgeFigs({}, {}, { lookAt: 'jade27:eyes' }) },
  panShot('BRpan_a', 'a', 159.62, 161.96, 'Beauty on this side',
    'Inside, square on to the Expedit, level: the frame full of the beauty half (art and literature, the object cubes between), the NNE end of the shelf at frame left. Start of a lateral track to frame right (SSW).',
    { move: { to: panAt(PAN_X.b), via: [{ ...panAt(PAN_X.m1), t_s: 161.96, beat: 'truth by reference: the seam centred' }], duration_s: +(166.8 - 159.62).toFixed(2), start_s: 159.62, end_s: 166.8, timeline: '-2sm full mix', note: 'one lateral track; mid key BRpan_m1, end key BRpan_b' } }),
  panShot('BRpan_m1', 'm1', 161.96, 164.41, 'truth by reference',
    'Mid key of the track: the seam (the middle column, split art / science) on the centre line, beauty frame-left, truth frame-right.'),
  panShot('BRpan_b', 'b', 164.41, 166.8, 'Science fiction shelved with truth',
    'End key: the top-right cube (4,4) centred: the three red Feynman Lectures, a matched set, and beside them a run of small bright science-fiction paperbacks; the textbook cube (3,3) below-left, the Tux cube to the left.'),
  { id: 'BR6', lens: 85, space: 'room', time: '3:00-3:03', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 1.75 }, aim: ['jade27:eyes', 0.5, 0.42],
    header: 'Bridge 3:00: "And I can’t give you proof", sung, held into the stop',
    intent: 'Outside, frontal, level, locked off, close. Synced; the last word rings into the hard stop. HS1 is this exact camera with the room removed.',
    figs: bridgeFigs({ yaw: 180, R: 'side' }, { L: 'side' }) },
  // ================================================================ HARD STOP 3:03-3:05
  { id: 'HS1', same: 'BR6', solo: ['jade27'], time: '3:03-3:05', section: 'Hard stop', sync: null,
    header: 'Hard stop 3:03: her face alone on bare paper (BR6’s camera, the room gone)',
    intent: 'Identical camera and pose to BR6; everything except her is removed. Bare paper with one thing left on it.' },

  // ================================================================ VERSE 3 3:05-3:29 (the party at 115%; the sun going down)
  { id: 'V3a', lens: 24, space: 'yard', time: '3:05-3:08', section: 'Verse 3', pos2: 'outside', amp: 115,
    pos: [1.05, Y(1.6, DECK), 12.85], aim: ['jade27:eyes', 0.6, 0.46], far: 60,
    header: 'Verse 3 3:05: "Housewarming, lemonade from the yard": the party at sundown, from the deck',
    intent: 'Wide from the deck’s far corner, down the yard: the lemonade table, the stairs and the mint barrel, the strawberry bed, the lawn, the clothesline, the fire poi starting, and the giant lemon tree by the NNE fence with pomelo-sized lemons, she and first love under it. The house’s shadow covers the whole yard; only the top of the lemon canopy still has sun.',
    figs: partyFigs(jadeTree(), heTree()) },
  { id: 'V3b', lens: 28, space: 'yard', time: '3:08-3:11', section: 'Verse 3', pos2: 'inside', amp: 115, hideParts: { jade27: ['head'] },
    pos: [9.85, Y(1.52, GRADE), 17.85], target: [10.35, Y(2.3, GRADE), 18.75],
    header: 'Verse 3 3:08: lemons the size of pomelos, along her eye-line; her hand comes up to one',
    intent: 'Inside: her view up into the tree. Oversized lemons in the shade, the last sun on the canopy top above; her hand rises into frame toward the nearest.',
    figs: partyFigs(jadeTree({ yaw: yawTo(TREE_MARK, TREE.at), head: { look: [10.4, Y(2.4, GRADE), 18.6] }, R: { to: [10.12, Y(1.85, GRADE), 18.35], hand: 'cup', palm: 'up', fingers: 'fwd' }, L: 'side' }), heTree()) },
  { id: 'V3c', lens: 50, space: 'yard', time: '3:08-3:13', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: -12, el: -2, dist: 3.0 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Verse 3 3:08: "Perky American girl / I play the part": the greeting in the French doors (one pitch contour)',
    intent: 'Outside, frontal on her from the deck, past the greeting guest’s back. She stands in the open French doors, the kitchen and the dining table behind her: wave a little too big and a few frames early. The house shades the deck; she is lit by the sky and the kitchen behind. The gold pitch contour is drawn over the greeting.',
    figs: partyFigs({ at: MARKS.greeting, yaw: 0, legs: 'stand', head: { look: 'G1:head' }, L: 'side', R: { to: [0.92, 1.86, 9.86], hand: 'flat', fingers: 'up', palm: [0, 0, 1], elbow: [-1, -0.6, 0] } },
      stand([2.6, 7.0], -150, { head: { look: [1.2, 1.5, 9.4] } }),
      { set: { G1: onDeck([1.9, 10.7], yawTo([1.9, 10.7], MARKS.greeting), { head: { look: 'jade27:eyes' }, L: { to: [1.95, DECK + 1.9, 10.35], hand: 'flat', fingers: 'up', palm: [0, 0, -1] } }) } }) },
  { id: 'V3d', lens: 45, space: 'yard', time: '3:13-3:16', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: yawTo(TREE_MARK, HE_TREE) + 19, el: 3, dist: 2.05 }, aim: ['jade27:eyes', 0.58, 0.38], focus: ['jade27'],
    header: 'Verse 3 3:13: "He said I absolutely nailed it": first love says something we don’t hear (over his shoulder)',
    intent: 'Over first love’s shoulder (back of his head only) onto her, under the lemons. He is speaking; she listens at 115%, nodding a beat early. The lemon tree and the back fence behind her, in the house’s shadow.',
    figs: partyFigs(jadeTree(), heTree()) },
  // Jade (2026-11-25): on "I nod, past hour reviewed" the camera PUSHES IN to her temple or her eye; spectrograms of her
  // voice follow. Timeline -2sm full mix: line 189.11-191.52, "nod," 189.23-189.79. She is under the lemon tree, facing
  // first love (he has just told her she nailed it), caught mid-nod (head 14 deg down). Same lens, dolly in; _a = start
  // (medium close-up), _b = end (extreme close-up). Sidecar `face_marks` gives the eye / temple px in each frame.
  ...['temple', 'eye'].flatMap((k) => { const at = k === 'temple' ? 'jade27:templeL' : 'jade27:eyeL', az = k === 'temple' ? 62 : 32, d1 = k === 'temple' ? 0.19 : 0.13;
    const base = { lens: 50, space: 'yard', section: 'Verse 3', pos2: 'inside', amp: 115, faceMarks: true, focus: ['jade27'], near: 0.03, far: 60,
      timing: { timeline: TL, line: 'I nod, past hour reviewed', line_s: [189.11, 191.52], nod_word_s: [189.231, 189.79], push_in: [189.11, 191.52], instrumental_track_s: { line: [189.122, 191.537], nod: [189.243, 189.802] } },
      figs: partyFigs(jadeTree({ head: { look: 'firstLove27:eyes', nod: 14 }, R: 'side' }), heTree()) };
    const lab = k === 'temple' ? 'her left temple, three-quarter toward profile' : 'her left eye, three-quarter';
    return [
      { id: `V3_rev_${k}_a`, ...base, time: '3:09.1', orbit: { at, rel: 'jade27', az, el: 2, dist: 0.85 }, aim: [at, 0.5, 0.42],
        move: { to_shot: `V3_rev_${k}_b`, kind: 'dolly in along the same line, same 50 mm lens', start_s: 189.11, end_s: 191.52, timeline: '-2sm full mix' },
        header: `Verse 3 3:09.1: "I nod, past hour reviewed": push-in start, ${lab} (medium close-up)`,
        intent: `Start of the push-in: her head and shoulders, ${lab}, mid-nod toward first love under the lemons; the party behind (the house with lit windows, guests, the fire poi) in the dusk shade.` },
      { id: `V3_rev_${k}_b`, ...base, time: '3:11.5', orbit: { at, rel: 'jade27', az, el: 2, dist: d1 }, aim: [at, 0.5, 0.5],
        header: `Verse 3 3:11.5: "...reviewed": push-in end, extreme close-up on ${lab}`,
        intent: `End of the push-in: ${lab} fills the frame; the overlay (the review, then the spectrograms of her voice) begins here.` }]; }),
  { id: 'V3e', lens: 40, space: 'yard', time: '3:16-3:18', section: 'Verse 3', pos2: 'inside', amp: 115,
    pos: [9.55, Y(1.5, GRADE), 17.75], aim: [[POI.at[0], POI.centreY, POI.at[1]], 0.55, 0.52], subject: [POI.at[0], POI.centreY, POI.at[1]],
    header: 'Verse 3 3:16: "fifteen percent above amplitude": the fire poi, the second light',
    intent: 'Inside: what she is looking at. The poi spinner on the lawn against the SSW fence, two circles of fire; two guests in silhouette in front. From here on the poi is the light source.',
    figs: partyFigs(jadeTree({ head: { look: [POI.at[0], POI.centreY, POI.at[1]] } }), heTree()) },
  { id: 'V3f', lens: 50, space: 'yard', time: '3:18-3:24', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: -30, el: 4, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4], focus: ['jade27'],
    header: 'Verse 3 3:21: "Hug durations": a hug on the deck, gold ticks counting it',
    intent: 'Outside on her face over the hugged guest’s shoulder (guest back to us). Her arms round the guest, chin over the shoulder, eyes to lens-side: counting. Gold ticks accumulate along the top of the embrace.',
    figs: partyFigs({ at: MARKS.hug, floor: DECK, yaw: 0, legs: 'stand', spine: { bend: 6 }, head: { look: [1.65, DECK + 1.62, 12.5] },
        L: { to: 'H1:waist', off: [0.06, 0.22, 0.17], hand: 'flat', palm: [0, 0, -1], fingers: [-1, 0, 0] }, R: { to: 'H1:waist', off: [-0.1, 0.1, 0.17], hand: 'flat', palm: [0, 0, -1], fingers: [1, 0, 0] } },
      onDeck([4.4, 10.6], 120, { head: { look: [7, GRADE + 1.4, 16] } }),
      { set: { H1: onDeck([2.75, 11.15], -165, { spine: { bend: 6 }, head: { look: [3.6, DECK + 1.5, 9.8] },
        L: { to: 'jade27:waist', off: [-0.1, 0.12, -0.17], hand: 'flat', palm: [0, 0, 1], fingers: [-1, 0, 0] }, R: { to: 'jade27:waist', off: [0.08, 0.2, -0.17], hand: 'flat', palm: [0, 0, 1], fingers: [1, 0, 0] } }) } }) },
  { id: 'V3g', lens: 20, space: 'room', time: '3:24-3:27', section: 'Verse 3', pos2: 'plan', amp: 115, path: true,
    pos: [4.35, 2.3, 9.45], aim: ['jade27:head', 0.5, 0.56], subject: [MARKS.crossing[0], 1.0, MARKS.crossing[1]],
    header: 'Verse 3 3:24: "Room crossing velocity": high angle, she crosses into the dining area, her route one line',
    intent: 'High from the kitchen’s back corner (over the counter U), looking back through the dining area to the opening and the living room beyond: guests in their groups, the dining table and benches, the open French doors at left. She is mid-stride on the route (drawn on the floor); faint gold schematics and vectors go over this frame.',
    figs: crossingFigs() },
  // Jade (2026-11-25): an OVERHEAD shot of the crossing for "Room crossing velocity" (-2sm full mix 194.59-198.72 s), to be
  // overlaid with diagrams, equations and her calculations. V3_rcv is a true orthographic top-down (the engine supports
  // `ortho`); V3_rcv_obl is a steep oblique (~58 deg down) with the ceiling, roof and SSW wall cut away. Sidecar `crossing`.
  { id: 'V3_rcv', lens: 0, ortho: { w: 12.6 }, space: 'room', time: '3:14.6-3:18.7', section: 'Verse 3', pos2: 'plan', amp: 115, path: true, crossing: true,
    pos: [2.45, 14, 5.4], target: [2.45, 0, 5.4], up: [1, 0, 0], hide: ['ceiling', 'roof', 'gable end', 'living room ceiling light (flush glass dome)', 'kitchen ceiling light (flush glass dome)', 'dining pendant (paper drum)'], near: 0.5, far: 30,
    light: { amb: 1.05, litAmb: 1.45 },
    header: 'Verse 3 3:14.6: "Room crossing velocity": overhead (orthographic), shelf -> opening -> dining -> French doors',
    intent: 'Straight down, NNE up the frame, the front (WNW) at left and the French doors at right. Her whole indoor route with a margin: the Expedit 5x5, the opening by the 2x2 and its printer, round the dining table and benches, to the open French doors. She is mid-crossing (the time midpoint); guests in their places. The compositor draws gold vectors, labels and v = ds/dt from the sidecar `crossing`.',
    figs: crossingFigs() },
  { id: 'V3_rcv_obl', lens: 28, space: 'room', time: '3:14.6-3:18.7', section: 'Verse 3', pos2: 'plan', amp: 115, path: true, crossing: true,
    pos: [-2.6, 8.6, 6.2], target: [2.3, 0.3, 6.0], hide: ['ceiling', 'roof', 'gable end', 'exterior wall (SSW)', 'living room window (SSW) (glass)', 'dining window (SSW) (glass)', 'living room window (SSW) (sill)', 'dining window (SSW) (sill)', 'living room window (SSW) (mullion)', 'dining window (SSW) (mullion)'], near: 0.5, far: 40,
    light: { amb: 1.0, litAmb: 1.4 },
    header: 'Verse 3 3:14.6: "Room crossing velocity": steep oblique from above the SSW wall (cut away)',
    intent: 'The same crossing from a steep high angle over the SSW side, the wall, ceiling and roof cut away like a doll’s house: more readable figures and furniture than the plan, at the cost of foreshortening. Same sidecar `crossing`.',
    figs: crossingFigs() },
  { id: 'V3h', lens: 0, ortho: { w: 27.5 }, space: 'plan', time: '3:24-3:29', section: 'Verse 3', pos2: 'plan', amp: 115, path: true,
    pos: [6.35, 25, 9.55], target: [6.35, 0, 9.55], up: [1, 0, 0], hide: ['ceiling', 'roof', 'gable end'], near: 0.5, far: 40, light: { amb: 1.25, litAmb: 1.6 },
    header: 'Verse 3 3:24: top-down plan of 345B and the yard: her path as one line (shelf, opening, French doors, deck, stairs, lemon tree)',
    intent: 'Plan view, NNE up the frame, the front (WNW) at left, the yard (ESE) at right. Her whole route from the shelf to the lemon tree is one line; the review’s gold schematics overlap this. Also the reference plan for every other mv10 shot.',
    figs: partyFigs(jadeTree(), heTree()) },

  // ================================================================ SILENCE 3:29-3:33 (dusk gone; the poi)
  { id: 'SI1', lens: 85, space: 'yard', time: '3:29-3:33', section: 'Silence', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: yawTo(TREE_MARK, [TREE_MARK[0] + 5.9, TREE_MARK[1] + 0.65]), el: 0, dist: 1.45 }, aim: ['jade27:eyes', 0.5, 0.42],
    header: 'Silence 3:29: "I think he’s right. Honestly." close, hushed, back at 100%',
    intent: 'Outside, frontal, level, locked off, close: she has turned from him to the lens. Dusk is gone; the fire poi burns directly behind her across the lawn and rims her. One cut from 115 to 100: lighter line, no gesture. Synced, hushed, last word unpitched.',
    figs: partyFigs(jadeTree({ yaw: yawTo(TREE_MARK, [TREE_MARK[0] + 5.9, TREE_MARK[1] + 0.65]), head: { look: [TREE_MARK[0] + 1.45, GRADE + 1.55, TREE_MARK[1] + 0.16] }, R: 'side' }), heTree({ R: 'side' })) },

  // ================================================================ CHORUS 2b 3:43-3:53 (back at the shelf; night, ceiling lights)
  { id: 'C2a', lens: 70, space: 'room', time: '3:43-3:49', section: 'Chorus 2b', pos2: 'outside', amp: 100, sync: 'anti', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: yawTo(SHELF_MARK, HE_C2) + 42, el: 3, dist: 2.1 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Chorus 2b 3:43: "I open my mouth, my voice goes blind": mouth open, not moving with the vocal; eyes bright (over his shoulder)',
    intent: 'The anti-sync shot, over first love’s shoulder (back of his head, frame left). Her mouth opens and holds; she is thinking it at him. Behind her the truth half of the Expedit under the ceiling light; night in the windows. Hold it long.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'T1'] }), jade27: jadeC2({ head: { look: 'firstLove27:eyes', turn: 20 } }), firstLove27: heC2() } },
  { id: 'C2b', lens: 30, space: 'room', time: '3:49-3:53', section: 'Chorus 2b', pos2: 'inside', amp: 100,
    orbit: { at: 'firstLove27:wristL', az: 85, el: 48, dist: 0.95 }, aim: ['firstLove27:wristL', 0.45, 0.74], subject: [SHELF_MARK[0] + 0.3, 1.2, SHELF_MARK[1] - 0.28],
    header: 'Chorus 2b 3:49: her hand taps on his forearm; he looks down at it (from behind his shoulder)',
    intent: 'Inside, close, from above and behind his left shoulder: the back of his head tipped down, his forearm (its hair clearly visible), her hand tapping on it. The percussion is her. Third of the film’s hands-on-a-forearm, the only one that is hers.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'T1'] }), jade27: jadeC2(), firstLove27: heC2() } },
];

// resolve copies
for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins: every camera has a `beam_<id>` twin (every light that is on in the shot, together) and one per real
// light with a shaft or a footprint: beam_<id>__sun (shafts through the openings, while the sun is up) and
// beam_<id>__poi (verse 3 on). Ceiling fixtures are omni and have no mask. The old __lamps / __dusk twins are gone.
import { maskTwins } from '../_beam.js';
{ const base = SHOTS.slice(), twins = maskTwins(base, { surf: true });
  const on = (s, k) => { const sec = SECTION_KEY[s.section] || 'bridge', L = SECTION_LIGHT[sec]; return k === 'sun' ? L.sun && SUN[sec].up : L[k]; };
  const per = base.flatMap((s) => ['sun', 'poi'].filter((k) => on(s, k)).map((k) => ({ ...s, id: `beam_${s.id}__${k}`, beamMask: true, beamOnly: k, header: `beam mask for ${s.id}: ${k} only` })));
  SHOTS.push(...twins, ...per); }
