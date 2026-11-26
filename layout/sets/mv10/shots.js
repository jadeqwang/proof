// MV10 camera table: the housewarming at 345B View St, Mountain View, fall 2010 (rebuilt 2026-11-25 (2) from Jade's
// drawings). One entry per shot the plan's Structure table places here:
//   BR*  bridge 2:34.5-2:52.5 (late-afternoon daylight)   HS1 hard stop 2:52.5-2:54.7   V3* verse 3 2:54.7-3:19.1 (sun going down)
//   SI1  silence 3:19.1-3:23.4 (dusk into dark, poi)     C2* chorus 2b 3:34.2-3:43.0 (back at the shelf, ceiling lights)
// All times are -2sm master times (analysis/m2sm/song_map.md, media/karaoke_v2/lyrics_timed.json full mix); the v3 shots
// were retimed 2026-11-25 with analysis/m2sm/remap.py and placed by hand on the -2sm sung onsets and measured hits.
// Each shot's `section` picks its clock time and sun from layout.js SCENE (one date, one time per section).
// World axes (layout.js): X = NNE, Z = ESE, y up, house floor 0, yard grade GRADE (-0.6). yaw 0 faces +Z (ESE, toward the
// yard), yaw 180 faces WNW (toward the front door and the couch), yaw 90 faces NNE, -90 SSW.
// RETIRED 2026-11-25 (2): BR4a (square-on halves), BR4b (sci-fi beside the Feynman set) -> the pan BRpan_a / m1 / b;
// BR5 (three lamps, three shadows) -> gone with the invented lamps (Jade: there were no paper lamps; drop the image).
// RETIRED 2026-11-25 (round 2 answers): V3g (alternate of the old shelf -> sliding-door route, which is gone). NEW: V3b_prep
// (the lemonade prep), V3_rcv_obl_k0 / _k3 (start / end keys of the new crossing), V3_rcv_obl_legs (diagnostic arrows).
// RETIRED 2026-11-25 (late): V3d ("nailed it" under the lemons) -> V3_nailed at the Expedit; V3_rev_eye_a/b (Jade chose
// the temple). V3_rcv is kept as REFERENCE ONLY (Jade chose the oblique V3_rcv_obl). New: BRpan_c (the pan's end, the seam).
import { MARKS, MARK_FLOOR, POI, AUDIENCE_AT, SHELF, SHELF_W, TREE, GRADE, PATIO, SECTION_KEY, SECTION_LIGHT, SUN, RC_MARKS, ROOM_CROSSING, PUNCHBOWL, COUNTER_H, PREP, DINING } from './layout.js';

const yawTo = (a, b) => +(Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI).toFixed(1);
const SHELF_MARK = MARKS.shelf;                       // [2.72, 3.30]: in front of the truth half, facing the room
const LENS_ROOM = [2.72, 1.53, SHELF_MARK[1] - 2.47];  // where the outside camera stands for the shelf shots (by the couch's end)
const DECK = PATIO.top, Y = (y, f) => y + f;          // a world height above a floor

// ---------------------------------------------------------------- the guests (costume and posture; faces undrawn)
// Living room: S1 and B2 on the couch (in the window's sun during the bridge), B1 by the SSW window, group A between the
// glass table and the front door, E1 in the open front door. Kitchen: C group inside the counter U, clear of her route.
// Kitchen (2026-11-25 round 2): T1 at the giant punchbowl, hand on the ladle. Deck: G1 (greeting) and H1 (hug). The poi audience (Jade, 2026-11-25 late): W1-W4 on the lawn along
// the house's ESE wall (NNE of the stairs), D1 and D2 at the deck's ESE railing; the spinner faces them (layout.js POI).
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
    T1: stand([3.93, 8.12], 90, { spine: { bend: 8 }, head: { look: [PUNCHBOWL.at[0], COUNTER_H + 0.2, PUNCHBOWL.at[1]] }, R: { to: [4.47, 1.43, 8.13], hand: 'grip', palm: 'in' }, L: cupArm('L', 90) }),
    G1: onDeck([1.75, 11.0], yawTo([1.75, 11.0], [1.21, 9.62]), { head: { look: [1.21, 1.55, 9.62] }, cup: 'R' }),
    H1: onDeck([3.3, 11.2], yawTo([3.3, 11.2], [1.75, 11.0]), { head: { look: [1.75, DECK + 1.6, 11.0] } }),
    ...Object.fromEntries([['W1', [6.4, 10.45]], ['W2', [7.05, 10.6], 'R'], ['W3', [7.75, 10.4]], ['W4', [9.0, 10.5], 'L']].map(([k, at, cup]) =>
      [k, onGrade(at, yawTo(at, POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] }, ...(cup ? { cup } : {}) })])),
    D1: onDeck([2.2, 12.62], yawTo([2.2, 12.62], POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] }, cup: 'R' }),
    D2: onDeck([2.9, 12.66], yawTo([2.9, 12.66], POI.at), { head: { look: [POI.at[0], GRADE + 1.3, POI.at[1]] } }),
    poi: onGrade(POI.at, POI.yaw, { head: { look: [AUDIENCE_AT[0], GRADE + 1.5, AUDIENCE_AT[1]] }, L: { to: 'poiL', hand: 'grip', elbow: 'down' }, R: { to: 'poiR', hand: 'grip', elbow: 'down' } }),
  };
  if (o.noPoi) delete f.poi;
  for (const k of o.drop || []) delete f[k];
  return { ...f, ...(o.set || {}) };
}

// ---------------------------------------------------------------- the principals
// At the shelf (bridge): she faces the room (and the lens) in front of the truth half; he stands at her right (frame
// left), back to the room, reading the textbooks (cube 3,3), pulling one out with his left hand. Her right hand taps
// his right elbow. (He: Naot cork sandals, forearm hair clearly visible: sidecar note `first_love_costume`.)
const HE_SHELF = [3.32, SHELF_W.front - 0.535];
// verse 3, "nailed it": he has stepped in close at her right-front to whisper (V3_nailed)
const HE_NAIL = [SHELF_MARK[0] + 0.33, SHELF_MARK[1] - 0.15];
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
// the room crossing (2026-11-25 round 2; layout.js ROOM_CROSSING): early in the party, guests still arriving. phase 0 =
// start key (S0: talking with K1 in the kitchen), 2 = the middle (S2: stopped by the shelf, turned to R1; N1 and N2 just
// in), 3 = end key (S3: at the front door again, N3 and N4 on the step). First love is not in it (OPEN: had he arrived?).
const RC = RC_MARKS;
function rcFigs(phase) {
  const f = crowd({ noPoi: true, drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'G1', 'H1', 'E1'] });
  // group A moves off the door's path to the glass console (they were between it and the front door)
  const AC2 = [4.05, 3.05]; for (const [k, at] of [['A1', [3.8, 3.25]], ['A2', [4.32, 3.42]], ['A3', [4.3, 2.78]]]) f[k] = { ...f[k], at, yaw: yawTo(at, AC2), head: { look: [AC2[0], 1.55, AC2[1]] } };
  const jy0 = yawTo(RC.kitchen, RC.K1);
  f.jade27 = phase === 0 ? { at: RC.kitchen, yaw: jy0, legs: 'stand', head: { look: 'K1:eyes' }, L: 'side', R: cupArm('R', jy0) }
    : phase === 2 ? { at: RC.stop, yaw: 2, legs: 'stand', head: { look: 'R1:eyes' }, L: 'side', R: cupArm('R', 2) }
    : { at: RC.door2, yaw: 180, legs: 'stand', head: { look: 'N3:eyes' }, L: 'side', R: { to: [3.86, 1.32, 0.42], hand: 'flat', fingers: 'up', palm: [0, 0, -1], elbow: [-1, -0.6, 0] } };
  f.K1 = stand(RC.K1, yawTo(RC.K1, RC.kitchen), { head: { look: phase === 0 ? 'jade27:eyes' : [3.55, 1.6, 6.45] }, cup: 'R' });
  f.R1 = phase === 2 ? stand(RC.R1, -105, { head: { look: 'jade27:eyes' }, R: { to: 'self:chest', off: rel(-105, -0.2, 0.0, 0.26), hand: 'palmUp', palm: 'up' } })
    : stand(RC.R1, 20, { head: { look: [SHELF_W.cube(3, 3)[0], 1.3, SHELF_W.front] } });
  if (phase === 0) { f.N1 = onGrade([4.15, -1.5], 0, { head: { look: [4.3, 1.6, 0] } }); f.N2 = onGrade([4.62, -1.78], 0, { head: { look: [4.3, 1.6, 0] } }); }
  if (phase === 2) { f.N1 = stand([3.75, 1.35], 20, { head: { look: [1.6, 1.2, 1.0] } }); f.N2 = stand([4.35, 1.55], -10, { head: { look: [2.2, 1.4, 3.5] } });
    f.N3 = onGrade([4.1, -2.4], 0, { head: { look: [4.3, 1.6, 0] } }); f.N4 = onGrade([4.7, -2.7], 0, { head: { look: [4.3, 1.6, 0] } }); }
  if (phase === 3) { f.N1 = stand([3.55, 2.55], 60, { head: { look: [4.05, 1.55, 3.05] }, cup: 'R' }); f.N2 = stand([4.05, 2.35], 30, { head: { look: [4.05, 1.55, 3.05] } });
    f.N3 = stand([4.22, 0.3], -10, { head: { look: 'jade27:eyes' }, R: { to: [4.1, 1.3, 0.62], hand: 'flat', fingers: 'up', palm: [0, 0, 1] } }); f.N4 = stand([4.35, -0.15], -5, { head: { look: 'jade27:eyes' } }); }
  return f;
}
const RC_HIDE = ['ceiling', 'roof', 'gable end', 'living room ceiling light (flush glass dome)', 'kitchen ceiling light (flush glass dome)', 'dining pendant (paper drum)', 'exterior wall (SSW)', 'living room window (SSW) (glass)', 'dining window (SSW) (glass)', 'living room window (SSW) (sill)', 'dining window (SSW) (sill)', 'living room window (SSW) (mullion)', 'dining window (SSW) (mullion)'];
const RC_CAM = { lens: 27, pos: [-2.4, 8.6, 3.7], target: [2.6, 0.3, 3.95] };
const rcShot = (id, phase, extra = {}) => ({ id, ...RC_CAM, space: 'room', time: '3:14.6-3:18.7', section: 'Verse 3', pos2: 'plan', amp: 115, crossing: true, rcKey: ROOM_CROSSING.keys[id] || extra.rcKey || null,
  hide: RC_HIDE, near: 0.5, far: 40, light: { amb: 1.0, litAmb: 1.4 }, figs: rcFigs(phase), ...extra });

// the pan across the Expedit (Jade, 2026-11-25): a lateral track, same lens, same height, level, spines filling the frame.
// Timeline: the -2sm render (media/karaoke_v2/lyrics_timed.json, FULL-MIX times; the instrumental-track times are ~0.1 s
// earlier and are in the sidecar too). "Beauty on this side" 159.62, "truth" 161.96, "Science fiction shelved with truth"
// 164.41-166.80. (The older v3 song map had 169.4 / 171.8 / 174.4-176.67.)
const TL = 'media/karaoke_v2/lyrics_timed.json (-2sm render), full-mix time (*_full); instrumental-track time = s/e';
const PAN = { lens: 35, y: 1.45, z: SHELF_W.front - 1.45 };
const panAt = (x) => ({ pos: [x, PAN.y, PAN.z], target: [x, PAN.y - 0.04, SHELF_W.front] });
const PAN_X = { a: (SHELF_W.beautyX[0] + SHELF_W.beautyX[1]) / 2, m1: SHELF_W.seam, b: SHELF_W.cube(4, 4)[0], c: SHELF_W.seam };
const PAN_FIGS = () => bridgeFigs({ at: [1.6, 3.1], yaw: 60, head: { look: [PAN_X.a, 1.4, SHELF_W.front] }, R: 'side' }, { at: [1.15, 4.3], yaw: 120, head: { look: [1.6, 1.5, 3.1] }, L: 'side' });
const panShot = (id, key, t0, t1, lyric, intent, extra = {}) => ({ id, lens: PAN.lens, ...panAt(PAN_X[key]), space: 'room', time: `${(t0 / 60 | 0)}:${(t0 % 60).toFixed(1).padStart(4, '0')}`, section: 'Bridge', pos2: 'inside',
  timing: { timeline: TL, start_s: t0, end_s: t1, lyric, v3_song_map_s: { a: [169.4, 171.8], m1: [171.8, 174.4], b: [174.4, 176.67], c: null }[key], move: 'lateral track along the Expedit face, level, same lens (35 mm) and height (1.45 m), 1.45 m from the frame front; camera X ' + PAN_X.a.toFixed(3) + ' (beauty half centre) -> ' + PAN_X.m1.toFixed(3) + ' (seam) -> ' + PAN_X.b.toFixed(3) + ' (cube 4,4) -> back to ' + PAN_X.c.toFixed(3) + ' (the seam: end frame, held)', her: 'NOT in frame (Jade, 2026-11-25 late: shelf only)' },
  header: `Bridge ${(t0 / 60 | 0)}:${(t0 % 60).toFixed(1).padStart(4, '0')}: "${lyric}" (pan across the Expedit, ${key})`, intent, figs: PAN_FIGS(), ...extra });

export const SHOTS = [
  // ================================================================ BRIDGE 2:34.5-2:52.5 (living room, late-afternoon daylight)
  { id: 'BR1', lens: 35, space: 'room', time: '2:34.5', section: 'Bridge', pos2: 'outside', amp: 100,
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 2.45 }, aim: ['jade27:eyes', 0.6, 0.36], focus: ['jade27'],
    header: 'Bridge 2:34.5: she taps on his arm and grins, to lens; he reads spines, back to us',
    intent: 'Outside, frontal, level, locked off, from the couch end. She faces the room in front of the truth half of the Expedit (the 2x2 with the printer and the opening to the kitchen at frame right); her hand taps on first love’s arm (he stands back to camera at frame left, reading the textbooks); the grin arrives before the line. Daylight from the WNW window behind the camera.',
    figs: bridgeFigs() },
  { id: 'BR2', lens: 50, space: 'room', time: '2:34.5-2:37.1', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4],
    header: 'Bridge 2:34.5: "Do you not see what I see?" sung to lens beside the shelf (synced, delighted)',
    intent: 'Outside. Same axis as BR1, tighter: her face in the 4:5 centre, the spines soft behind, his shoulder at frame left. Synced, to lens, delighted.',
    figs: bridgeFigs() },
  { id: 'BR3', lens: 20, space: 'room', time: '2:37.1-2:39.6 ("Does it matter what makes me me?")', section: 'Bridge', pos2: 'inside',
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 0.02 }, target: [2.0, 1.15, 0.6], hide: ['jade27'],
    header: 'Bridge 2:37.1: the guests’ blank stares, from her eyes (their faces are undrawn)',
    intent: 'Inside: her own view across the living room toward the front. Everyone has turned to look at her; no face is drawn, so the blank stares are literal. The couch under the WNW window in the late sun, the Noguchi table, the group by the glass table and the open front door.',
    figs: bridgeFigs({}, {}, { lookAt: 'jade27:eyes' }) },
  panShot('BRpan_a', 'a', 161.96, 163.19, 'truth by reference (start)',
    'Inside, square on to the Expedit, level: the frame full of the beauty half (art and literature, the object cubes between), the NNE end of the shelf at frame left. Start of a lateral track to frame right (SSW).',
    { move: { to: panAt(PAN_X.c), via: [{ ...panAt(PAN_X.m1), t_s: 163.19, beat: 'truth by reference: passing the seam' }, { ...panAt(PAN_X.b), t_s: 164.41, beat: 'science fiction shelved with truth: cube 4,4' }],
      arrive_s: 166.85, hold_to_s: 169.66, duration_s: +(169.66 - 161.96).toFixed(2), start_s: 161.96, end_s: 169.66, timeline: '-2sm full mix',
      note: 'starts on "truth by reference" (2:42.0), after the sweatshirt (mortongrove07) on "Beauty on this side" 2:39.6-2:42.0, per the plan; one lateral track; keys BRpan_m1 (seam, passing), BRpan_b (cube 4,4), END key BRpan_c: back to the seam on "From inside, I can\'t tell the difference" and held (Jade, 2026-11-25 late). The track reverses after b (our reading).' } }),
  panShot('BRpan_m1', 'm1', 163.19, 164.41, 'truth by reference',
    'Mid key of the track: the seam (the middle column, split art / science) on the centre line, beauty frame-left, truth frame-right.'),
  panShot('BRpan_b', 'b', 164.41, 166.8, 'Science fiction shelved with truth',
    'End key: the top-right cube (4,4) centred: the three red Feynman Lectures, a matched set, and beside them a run of small bright science-fiction paperbacks; the textbook cube (3,3) below-left, the Tux cube to the left.'),
  panShot('BRpan_c', 'c', 166.853, 169.66, 'From inside, I can’t tell the difference',
    'END frame of the track (Jade, 2026-11-25 late: "From inside, I can’t tell the difference" holds on the shelf, the pan landing on the seam): the middle column’s centre line, where art meets science, dead centre and held; beauty frame-left, truth frame-right, nobody in frame.'),
  { id: 'BR6', lens: 85, space: 'room', time: '2:49.7-2:52.5', section: 'Bridge', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: 180, el: 0, dist: 1.75 }, aim: ['jade27:eyes', 0.5, 0.42],
    header: 'Bridge 2:49.7: "And I can’t give you proof", sung, held into the stop',
    intent: 'Outside, frontal, level, locked off, close. Synced; the last word rings into the hard stop. HS1 is this exact camera with the room removed.',
    figs: bridgeFigs({ yaw: 180, R: 'side' }, { L: 'side' }) },
  // ================================================================ HARD STOP 2:52.5-2:54.7
  { id: 'HS1', same: 'BR6', solo: ['jade27'], time: '2:52.5-2:54.7', section: 'Hard stop', sync: null,
    header: 'Hard stop 2:52.5: her face alone on bare paper (BR6’s camera, the room gone)',
    intent: 'Identical camera and pose to BR6; everything except her is removed. Bare paper with one thing left on it.' },

  // ================================================================ VERSE 3 2:54.7-3:19.1 (the party at 115%; the sun going down)
  { id: 'V3a', lens: 24, space: 'yard', time: '2:54.7-2:57.0', section: 'Verse 3', pos2: 'outside', amp: 115,
    pos: [1.05, Y(1.6, DECK), 12.85], aim: ['jade27:eyes', 0.6, 0.46], far: 60,
    header: 'Verse 3 2:54.7: "Housewarming, lemonade from the yard": the party at sundown, from the deck',
    intent: 'Wide from the deck’s far corner, down the yard: the stairs and the mint barrel, the strawberry bed, the lawn, the clothesline, the fire poi starting, and the giant lemon tree by the NNE fence with pomelo-sized lemons, she and first love under it. The house’s shadow covers the whole yard; only the top of the lemon canopy still has sun.',
    figs: partyFigs(jadeTree(), heTree()) },
  // V3b RESTAGED 2026-11-25 (late): Jade: the lemonade was made BEFORE the party: she and the childhood friend picked the
  // lemons; first love, Z and the guests had not arrived. So this is the picking, in the early-afternoon sun (section
  // 'Before the party', 14:00, OUR clock): her hand up to a lemon, the friend beside her holding the bowl. No first love
  // (he stood beside her here before: the conflict), no guests, no poi. Same camera and t as before.
  // 2026-11-25 (round 2): Jade: at "housewarming, lemonade from the yard" they pick the lemons AND prepare the lemonade
  // in the kitchen (juicer, rinds, mixing), like a botanical illustration. Two shots inside V3b's old slot (177.0-179.19):
  // V3b = the picking on "from the" (177.0-178.04), V3b_prep = the prep on "yard" (178.04-179.19), chronological.
  { id: 'V3b', lens: 24, space: 'yard', time: '2:57.0-2:58.0', section: 'Before the party',
    timing: { timeline: TL, line: 'Housewarming, lemonade from the yard', start_s: 177.0, end_s: 178.043, words: '"(lemon)ade from the"', was: '177.0-179.2 (V3b alone)' }, pos2: 'inside', amp: 115, hideParts: { jade27: ['head'] },
    pos: [9.85, Y(1.52, GRADE), 17.85], target: [10.3, Y(1.98, GRADE), 18.7], bowl: [10.51, Y(1.0, GRADE), 18.8],
    header: 'Verse 3 2:57.0 (memory, before the party, 14:00): picking the lemons with the childhood friend; her hand comes up to one (then V3b_prep)',
    intent: 'Inside: her view up into the tree, early afternoon, before anyone else has come. Pomelo-sized lemons in the sun; her hand rises into frame toward the nearest; just ahead of her the childhood friend (back to us, face never drawn) looks up into the tree, holding the bowl of the first lemons (below frame here; sidecar shows it). They will make the lemonade from these.',
    figs: { jade27: jadeTree({ yaw: yawTo(TREE_MARK, TREE.at), head: { look: [10.4, Y(2.4, GRADE), 18.6] }, R: { to: [10.12, Y(1.85, GRADE), 18.35], hand: 'cup', palm: 'up', fingers: 'fwd' }, L: 'side' }),
      friend: onGrade([10.35, 18.55], 33, { head: { look: [10.9, Y(2.35, GRADE), 19.3] },
        L: { to: [10.64, Y(1.06, GRADE), 18.72], hand: 'cup', palm: 'up', fingers: 'fwd' }, R: { to: [10.38, Y(1.06, GRADE), 18.88], hand: 'cup', palm: 'up', fingers: 'fwd' } }) } },
  // the lemonade prep (2026-11-25 round 2): on the pale dining table in the 14:00 sun from the SSW dining window (OUR choice
  // of surface; Jade said "in the kitchen"). Straight down, ORTHOGRAPHIC, like the plates (artichoke, romanesco): the cut
  // lemons' segments, the ribbed juicer, the rinds, the bowl being stirred; only their hands and forearms enter. No party
  // food is out yet. Postdoc Jade at the table's NNE end presses a half on the juicer; the childhood friend (face never
  // drawn) stirs the giant punchbowl from the ESE side. The paper-drum pendant over the table is hidden (it would sit
  // between the lens and the table).
  { id: 'V3b_prep', lens: 0, ortho: { w: 1.72 }, space: 'room', time: '2:58.0-2:59.2', section: 'Before the party', pos2: 'plan', amp: 115, dressing: 'prep',
    pos: [1.0, 2.36, 7.66], target: [1.0, 0, 7.66], up: [0, 0, -1], near: 0.05, far: 5, hide: ['dining pendant (paper drum)'], light: { amb: 0.7, litAmb: 1.3 },
    subject: [1.3, DINING.h, 7.6],
    timing: { timeline: TL, line: 'Housewarming, lemonade from the yard', start_s: 178.043, end_s: 179.19, words: '"yard" (held to the line end; V3c follows at 179.2)' },
    header: 'Verse 3 2:58.0 (memory, before the party, 14:00): the lemonade prep, flat-lay from straight above (botanical plate)',
    intent: 'Inside the memory, straight down on the dining table in the early-afternoon sun from the SSW window (frame left): a cutting board with two pomelo-sized lemons cut across (ten segments, pith, seeds: the botanical cross-section), the knife; the glass reamer with a half pressed on it under her hand; a bowl of picked lemons, two still with leaves; a bowl of squeezed rinds; sugar; a water pitcher; the giant punchbowl half full, the childhood friend stirring it with a long wooden spoon. Only hands and forearms in frame: hers from the right (NNE end), his from the bottom (ESE side). Paint it like the artichoke plate: engraved line, pale ground, one gold accent at most.',
    figs: { jade27: { at: [2.22, 7.42], yaw: -90, legs: 'stand', spine: { bend: 24 }, head: { look: [PREP.reamer.at[0], 0.82, PREP.reamer.at[1]] },
        R: { to: [PREP.reamer.at[0], 0.95, PREP.reamer.at[1] - 0.01], hand: 'cup', palm: 'down', fingers: 'fwd' },
        L: { to: [PREP.reamer.at[0] + 0.02, 0.8, PREP.reamer.at[1] + 0.11], hand: 'flat', palm: 'down', fingers: 'fwd' } },
      // his right hand on the top of the long spoon (build.js punchbowl(): the handle leans from the bowl at (-0.32, 0.92, 0.23))
      friend: { at: [0.85, 8.56], yaw: 180, legs: 'stand', spine: { bend: 22 }, head: { look: [PREP.punch.at[0], 0.9, PREP.punch.at[1]] },
        R: { to: [PREP.punch.at[0] - 0.085, 1.23, 7.9], hand: 'grip', palm: 'in', fingers: 'fwd' }, L: { to: [PREP.punch.at[0] - 0.2, 1.0, 8.04], hand: 'flat', palm: 'down', fingers: 'fwd' } } } },
  { id: 'V3c', lens: 50, space: 'yard', time: '2:59.2-3:03.8', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: -12, el: -2, dist: 3.0 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Verse 3 2:59.2: "Perky American girl / I play the part": the greeting in the sliding door (one pitch contour)',
    intent: 'Outside, frontal on her from the deck, past the greeting guest’s back. She stands in the open sliding glass door, the kitchen and the dining table behind her: wave a little too big and a few frames early. The house shades the deck; she is lit by the sky and the kitchen behind. The gold pitch contour is drawn over the greeting.',
    figs: partyFigs({ at: MARKS.greeting, yaw: 0, legs: 'stand', head: { look: 'G1:head' }, L: 'side', R: { to: [0.92, 1.86, 9.86], hand: 'flat', fingers: 'up', palm: [0, 0, 1], elbow: [-1, -0.6, 0] } },
      stand([2.6, 7.0], -150, { head: { look: [1.2, 1.5, 9.4] } }),
      { set: { G1: onDeck([1.9, 10.7], yawTo([1.9, 10.7], MARKS.greeting), { head: { look: 'jade27:eyes' }, L: { to: [1.95, DECK + 1.9, 10.35], hand: 'flat', fingers: 'up', palm: [0, 0, -1] } }) } }) },
  // V3d (under the lemons, over his shoulder) RETIRED 2026-11-25 (late) -> V3_nailed: Jade: at "He said I absolutely
  // nailed it" she stands by the Expedit and first love stands close and whispers to her. Verse-3 light (18:25: no sun
  // indoors, ceiling lights on, dusk in the windows). Back of his head only. -2sm full mix 183.847-185.98.
  { id: 'V3_nailed', lens: 50, space: 'room', time: '3:03.8-3:06.0', section: 'Verse 3', pos2: 'outside', amp: 115, focus: ['jade27'],
    pos: [SHELF_MARK[0] + 0.6, 1.64, SHELF_MARK[1] - 2.02], aim: ['jade27:eyes', 0.6, 0.42],
    timing: { timeline: TL, line: 'He said I absolutely nailed it', start_s: 183.847, end_s: 185.98, instrumental_track_s: null },
    header: 'Verse 3 3:03.8: "He said I absolutely nailed it": by the Expedit, first love leans in and whispers to her (back of his head)',
    intent: 'Outside, over first love’s right shoulder (back of his head only, frame left, close to her ear). She stands by the Expedit, in front of its truth half, facing the room; he has stepped in close at her right and bends to whisper. We do not hear it; she listens at 115%, eyes to the room, the grin coming. Ceiling light, dusk in the front window behind the camera; guests at the couch and the glass table out of focus.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: { at: SHELF_MARK, yaw: 195, legs: 'stand', head: { look: [3.6, 1.5, 0.9], tilt: 6 }, L: 'side', R: cupArm('R', 195) },
      firstLove27: { at: HE_NAIL, yaw: yawTo(HE_NAIL, SHELF_MARK), legs: 'stand', spine: { bend: 15, side: -8 }, head: { look: 'jade27:earR', tilt: -10 }, L: 'side', R: 'side' } } },
  // Jade (2026-11-25): on "I nod, past hour reviewed" the camera PUSHES IN to her temple; spectrograms of her voice follow.
  // Timeline -2sm full mix: line 189.11-191.52, "nod," 189.23-189.79. MOVED 2026-11-25 (round 2): Jade: the nod is at the
  // SHELF, straight after the "nailed it" whisper (it was never under the lemon tree). She stands on her shelf mark as in
  // V3_nailed, caught mid-nod (head 14 deg down); first love has straightened and turned back to the Expedit (OUR
  // staging, so that from her left he is back / three-quarter rear only). Same lens, dolly in; _a = start
  // (medium close-up), _b = end (extreme close-up). Sidecar `face_marks` gives the eye / temple px in each frame.
  // the eye variants are RETIRED 2026-11-25 (late): Jade chose the temple
  ...['temple'].flatMap((k) => { const at = k === 'temple' ? 'jade27:templeL' : 'jade27:eyeL', az = k === 'temple' ? 62 : 32, d1 = k === 'temple' ? 0.19 : 0.13;
    const base = { lens: 50, space: 'room', section: 'Verse 3', pos2: 'inside', amp: 115, faceMarks: true, focus: ['jade27'], near: 0.03, far: 60,
      timing: { timeline: TL, line: 'I nod, past hour reviewed', line_s: [189.11, 191.52], nod_word_s: [189.231, 189.79], push_in: [189.11, 191.52], instrumental_track_s: { line: [189.122, 191.537], nod: [189.243, 189.802] } },
      figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: { at: SHELF_MARK, yaw: 195, legs: 'stand', head: { look: [3.3, 1.45, 1.2], nod: 14, turn: -8 }, L: 'side', R: cupArm('R', 195) },
        firstLove27: heShelf({ at: [3.22, 3.80], yaw: 12, head: { look: [SHELF_W.cube(2, 4)[0], 1.55, SHELF_W.front] }, L: 'side' }) } };
    const lab = k === 'temple' ? 'her left temple, three-quarter toward profile' : 'her left eye, three-quarter';
    return [
      { id: `V3_rev_${k}_a`, ...base, time: '3:09.1', orbit: { at, rel: 'jade27', az, el: 2, dist: 0.85 }, aim: [at, 0.5, 0.42],
        move: { to_shot: `V3_rev_${k}_b`, kind: 'dolly in along the same line, same 50 mm lens', start_s: 189.11, end_s: 191.52, timeline: '-2sm full mix' },
        header: `Verse 3 3:09.1: "I nod, past hour reviewed": push-in start, ${lab} (medium close-up)`,
        intent: `Start of the push-in, at the shelf right after the whisper: her head and shoulders, ${lab}, mid-nod; behind her the Expedit under the ceiling light and first love back at the spines (back of his head only).` },
      { id: `V3_rev_${k}_b`, ...base, time: '3:11.5', orbit: { at, rel: 'jade27', az, el: 2, dist: d1 }, aim: [at, 0.5, 0.5],
        header: `Verse 3 3:11.5: "...reviewed": push-in end, extreme close-up on ${lab}`,
        intent: `End of the push-in: ${lab} fills the frame; the overlay (the review, then the spectrograms of her voice) begins here.` }]; }),
  // 2026-11-25 (round 2): with the whisper (3:03.8) and the nod (3:09.1) both at the shelf, she cannot be under the tree in
  // between: V3e is now a CUTAWAY to the poi from the same place (no her, no first love), not her point of view. OPEN.
  { id: 'V3e', lens: 40, space: 'yard', time: '3:06.0-3:09.1', section: 'Verse 3', pos2: 'outside', amp: 115,
    pos: [9.55, Y(1.5, GRADE), 17.75], aim: [[POI.at[0], POI.centreY, POI.at[1]], 0.55, 0.52], subject: [POI.at[0], POI.centreY, POI.at[1]],
    header: 'Verse 3 3:06.0: "fifteen percent above amplitude": the fire poi, the second light (cutaway; she is at the shelf)',
    intent: 'Cutaway (was her point of view from under the tree; she is now at the shelf from 3:03.8 to 3:11.5). The poi spinner on the lawn, seen from behind and to the side, performing toward the audience lined along the house’s ESE wall and on the deck, two circles of fire lighting them. From here on the poi is the light source.',
    figs: crowd() },
  { id: 'V3f', lens: 50, space: 'yard', time: '3:11.6-3:12.8 ("Hug durations"; the spectrogram plate takes "pitch contours" 3:12.8-3:14.6, or intercut)', section: 'Verse 3', pos2: 'outside', amp: 115,
    orbit: { at: 'jade27:eyes', az: -30, el: 4, dist: 1.9 }, aim: ['jade27:eyes', 0.5, 0.4], focus: ['jade27'],
    header: 'Verse 3 3:11.6: "Hug durations": a hug on the deck, gold ticks counting it',
    intent: 'Outside on her face over the hugged guest’s shoulder (guest back to us). Her arms round the guest, chin over the shoulder, eyes to lens-side: counting. Gold ticks accumulate along the top of the embrace.',
    figs: partyFigs({ at: MARKS.hug, floor: DECK, yaw: 0, legs: 'stand', spine: { bend: 6 }, head: { look: [1.65, DECK + 1.62, 12.5] },
        L: { to: 'H1:waist', off: [0.06, 0.22, 0.17], hand: 'flat', palm: [0, 0, -1], fingers: [-1, 0, 0] }, R: { to: 'H1:waist', off: [-0.1, 0.1, 0.17], hand: 'flat', palm: [0, 0, -1], fingers: [1, 0, 0] } },
      onDeck([4.4, 10.6], 120, { head: { look: [7, GRADE + 1.4, 16] } }),
      { set: { H1: onDeck([2.75, 11.15], -165, { spine: { bend: 6 }, head: { look: [3.6, DECK + 1.5, 9.8] },
        L: { to: 'jade27:waist', off: [-0.1, 0.12, -0.17], hand: 'flat', palm: [0, 0, 1], fingers: [-1, 0, 0] }, R: { to: 'jade27:waist', off: [0.08, 0.2, -0.17], hand: 'flat', palm: [0, 0, 1], fingers: [1, 0, 0] } }) } }) },
  // V3g (high angle from the kitchen corner on the OLD route) RETIRED 2026-11-25 (round 2): the route it showed is gone.
  // Jade (2026-11-25): an overhead of the crossing for "Room crossing velocity" (-2sm full mix 194.59-198.72 s), overlaid with
  // diagrams, equations and her calculations. REBUILT 2026-11-25 (round 2) on Jade's sequence (layout.js ROOM_CROSSING):
  // kitchen talk -> doorbell -> front door, welcome 2 -> back toward the kitchen, stopped at the shelf by R1 -> doorbell ->
  // front door again. Motion mostly in the living room, the kitchen at frame right. Sidecar `crossing` = legs, stops,
  // real and song times, px. V3_rcv_obl (middle key, S2) is THE shot; _k0 / _k3 are its start and end keys; _legs draws
  // the legs as arrows (diagnostic, not for the painter). V3_rcv: orthographic reference, true scale.
  { id: 'V3_rcv', lens: 0, ortho: { w: 12.6 }, space: 'room', time: '3:14.6-3:18.7', section: 'Verse 3', pos2: 'plan', amp: 115, crossing: true, legs: true, rcKey: 'reference (S2, with the legs)',
    pos: [2.45, 14, 4.2], target: [2.45, 0, 4.2], up: [1, 0, 0], hide: ['ceiling', 'roof', 'gable end', 'living room ceiling light (flush glass dome)', 'kitchen ceiling light (flush glass dome)', 'dining pendant (paper drum)'], near: 0.5, far: 30,
    light: { amb: 1.05, litAmb: 1.45 },
    reference: true, header: 'REFERENCE ONLY: "Room crossing velocity", orthographic overhead with the three legs as arrows (true scale)',
    intent: 'Straight down, NNE up the frame, the front (WNW) at left, the kitchen at right. A true-scale reference for the overlay data, not a shot: the three legs (L1 kitchen -> front door, L2 back toward the kitchen, stopped at the shelf, L3 back to the door) and the four stops. She is at S2.',
    figs: rcFigs(2) },
  rcShot('V3_rcv_obl', 2, { frontDoorDeg: 0,
    header: 'Verse 3 3:14.6: "Room crossing velocity" (middle key): stopped by the shelf as R1 speaks; N1 and N2 just in the door',
    intent: 'THE shot (Jade): steep oblique from above the SSW side, walls, ceiling and roof cut away like a doll’s house, the living room filling the frame, the kitchen at frame right (the punchbowl, the fridge by the 2x2, food on the dining table). Early in the party; guests are arriving. This middle key: she was heading back to the kitchen from the front door and has stopped by the Expedit, head turned to R1, who has said something; the two guests she just welcomed stand inside the door. The whole move (sidecar `crossing`): kitchen -> door -> stop -> door, ~4.7x time-lapse inside 4.13 s, gold vectors drawn by the compositor.' }),
  rcShot('V3_rcv_obl_k0', 0, { frontDoorDeg: 0,
    header: 'Verse 3 3:14.6: "Room crossing velocity" (start key): talking with K1 in the kitchen, before the doorbell',
    intent: 'Same camera. Start: she stands just inside the kitchen by the opening, talking with K1 by the fridge; N1 and N2 are on the front walk outside (heads above the front wall). The doorbell rings at 194.85 s.' }),
  rcShot('V3_rcv_obl_k3', 3, { frontDoorDeg: 85,
    header: 'Verse 3 3:18.4: "Room crossing velocity" (end key): at the front door again (open wide), welcoming N3 and N4',
    intent: 'Same camera. End: she is back at the front door, now open wide, stepping back with a hand up in welcome; N3 is stepping in, N4 on the threshold; N1 and N2 have joined the group by the glass console; R1 is back at the spines.' }),
  rcShot('V3_rcv_obl_legs', 2, { frontDoorDeg: 0, legs: true, rcKey: 'diagnostic: the legs as arrows over the middle key',
    header: 'DIAGNOSTIC: "Room crossing velocity", the three legs as arrows (L1 gold, L2 blue, L3 magenta) and the four stops (rings)',
    intent: 'Not a shot: V3_rcv_obl with the legs drawn on the floor so the vectors read. L1 kitchen -> front door (doorbell), L2 front door -> toward the kitchen, stopped at the shelf (R1 speaks), L3 back to the front door (doorbell again). Rings: S0 kitchen, S1 door, S2 shelf stop, S3 door.' }),
  { id: 'V3h', lens: 0, ortho: { w: 27.5 }, space: 'plan', time: 'plan / overlay reference for 3:14.6-3:19.1 (was v3 3:24-3:29)', section: 'Verse 3', pos2: 'plan', amp: 115, path: true,
    pos: [6.35, 25, 9.55], target: [6.35, 0, 9.55], up: [1, 0, 0], hide: ['ceiling', 'roof', 'gable end'], near: 0.5, far: 40, light: { amb: 1.25, litAmb: 1.6 },
    header: 'Verse 3 3:14.6 (reference): top-down plan of 345B and the yard: her path as one line (shelf, opening, sliding door, deck, stairs, lemon tree)',
    intent: 'Plan view, NNE up the frame, the front (WNW) at left, the yard (ESE) at right. Her whole route from the shelf to the lemon tree is one line; the review’s gold schematics overlap this. Also the reference plan for every other mv10 shot.',
    figs: partyFigs(jadeTree(), heTree()) },

  // ================================================================ SILENCE 3:19.1-3:23.4 (dusk gone; the poi)
  { id: 'SI1', lens: 85, space: 'yard', time: '3:19.1-3:23.4', section: 'Silence', pos2: 'outside', amp: 100, sync: 'lip', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: yawTo(POI.at, TREE_MARK), el: 0, dist: 1.45 }, aim: ['jade27:eyes', 0.5, 0.42],
    header: 'Silence 3:19.5: "I think he’s right. Honestly." close, hushed, back at 100%',
    intent: 'Outside, frontal, level, locked off, close: she has turned from him to the lens. Dusk is gone; the fire poi burns directly behind her across the lawn and rims her. One cut from 115 to 100: lighter line, no gesture. Synced, hushed, last word unpitched.',
    figs: partyFigs(jadeTree({ yaw: yawTo(POI.at, TREE_MARK), head: { look: [TREE_MARK[0] + 1.45 * Math.sin(yawTo(POI.at, TREE_MARK) * Math.PI / 180), GRADE + 1.55, TREE_MARK[1] + 1.45 * Math.cos(yawTo(POI.at, TREE_MARK) * Math.PI / 180)] }, R: 'side' }), heTree({ yaw: yawTo(HE_TREE, POI.at), head: { look: [POI.at[0], POI.centreY, POI.at[1]] }, R: 'side' })) },   // he has turned to watch the fire: back to the lens (never face-on)

  // ================================================================ CHORUS 2b 3:34.2-3:43.0 (back at the shelf; night, ceiling lights)
  { id: 'C2a', lens: 70, space: 'room', time: '3:34.2-3:39.6', section: 'Chorus 2b', pos2: 'outside', amp: 100, sync: 'anti', singers: ['jade27'],
    orbit: { at: 'jade27:eyes', az: yawTo(SHELF_MARK, HE_C2) + 42, el: 3, dist: 2.1 }, aim: ['jade27:eyes', 0.56, 0.38], focus: ['jade27'],
    header: 'Chorus 2b 3:34.2: "I open my mouth, my voice goes blind": mouth open, not moving with the vocal; eyes bright (over his shoulder)',
    intent: 'The anti-sync shot, over first love’s shoulder (back of his head, frame left). Her mouth opens and holds; she is thinking it at him. Behind her the truth half of the Expedit under the ceiling light; night in the windows. Hold it long.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: jadeC2({ head: { look: 'firstLove27:eyes', turn: 20 } }), firstLove27: heC2() } },
  { id: 'C2b', lens: 30, space: 'room', time: '3:39.6-3:43.0', section: 'Chorus 2b', pos2: 'inside', amp: 100,
    orbit: { at: 'firstLove27:wristL', az: 85, el: 48, dist: 0.95 }, aim: ['firstLove27:wristL', 0.45, 0.74], subject: [SHELF_MARK[0] + 0.3, 1.2, SHELF_MARK[1] - 0.28],
    header: 'Chorus 2b 3:39.6: her hand taps on his forearm; he looks down at it (from behind his shoulder)',
    intent: 'Inside, close, from above and behind his left shoulder: the back of his head tipped down, his forearm (its hair clearly visible), her hand tapping on it. The percussion is her. Third of the film’s hands-on-a-forearm, the only one that is hers.',
    figs: { ...crowd({ drop: ['W1', 'W2', 'W3', 'W4', 'D1', 'D2', 'T1'] }), jade27: jadeC2(), firstLove27: heC2() } },
];

// resolve copies
for (const s of SHOTS) if (s.same) { const o = SHOTS.find((x) => x.id === s.same); Object.assign(s, { ...o, ...s, id: s.id }); }

// beam mask twins: every camera has a `beam_<id>` twin (every light that is on in the shot, together) and one per real
// light with a shaft or a footprint: beam_<id>__sun (shafts through the openings, while the sun is up) and
// beam_<id>__poi (verse 3 on). Ceiling fixtures are omni and have no mask. The old __lamps / __dusk twins are gone.
import { maskTwins } from '../_beam.js';
{ const base = SHOTS.filter((s) => !/_legs$/.test(s.id)), twins = maskTwins(base, { surf: true });
  const on = (s, k) => { const sec = SECTION_KEY[s.section] || 'bridge', L = SECTION_LIGHT[sec]; return k === 'sun' ? L.sun && SUN[sec].up : L[k]; };
  const per = base.flatMap((s) => ['sun', 'poi'].filter((k) => on(s, k)).map((k) => ({ ...s, id: `beam_${s.id}__${k}`, beamMask: true, beamOnly: k, header: `beam mask for ${s.id}: ${k} only` })));
  SHOTS.push(...twins, ...per); }
