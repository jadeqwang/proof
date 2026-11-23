// ATTIC 1988, v3 camera table (director's review of the first cut). Ids carry a v3_ prefix so the v1 guides stay.
// New here: the blade sign (layout.js SIGN_V3; per-shot override `sign`), `hooks` ('empty' | 'hung'), `cards` (the
// hand-shadow monkey as a cut-out card over the page), `textbooks` (the D9 stack), `push` (end of the push into the
// book), blankets 'pull' / 'heap', and the LAP storytime pose + eight setups from engine/lap.js (shared with bed26).
import { LAP, D9_STACK, stackH } from './layout.js';
import { lapPose, lapCameras, lapFrame } from '../../engine/lap.js';

const M = 'mama', C = 'littleJade', DOOR_AJAR = 0.06;
const CFG = { mother: M, child: C, base: LAP.base, yaw: LAP.yaw, floor: LAP.floor, Hm: 1.60, Hc: 1.08 };
const F = lapFrame(LAP.base, LAP.yaw), CAM = lapCameras(M, C);
// the tilted page's directions (tilt 36, ignoring the small roll): for hands held parallel to the page
const T36 = 36 * Math.PI / 180, PAGE_DOWN = [F.f[0] * Math.sin(T36), -Math.cos(T36), F.f[1] * Math.sin(T36)], PAGE_TOP = [F.f[0] * Math.cos(T36), Math.sin(T36), F.f[1] * Math.cos(T36)];
const AHEAD = F.at3(0.1, 0.62, 2.2);                       // where a face looks when it looks "out front"
const BLK = [{ who: 'mama', mode: 'folded' }, { who: 'littleJade', mode: 'aside' }];
const base = { v3: true, hooks: 'hung', blankets: BLK, light: { neon: 'red', door: DOOR_AJAR } };
const lap = (o = {}) => { const p = lapPose(CFG, o); p.figs[M].noApron = true; return { figs: p.figs, book: p.book }; };
const lapShot = (name, id, o, more = {}) => ({ id: 'v3_' + id, ...base, ...CAM[name], ...lap(o), ...more });

// lying / sleeping
const jadeAwake = { at: [2.55, 0.13, -1.72], legs: 'straight', pitch: -90, yaw: 0, spine: { bend: 6 }, head: {}, L: 'side', R: 'side' };
const jadeProp = { ...jadeAwake, spine: { bend: 44 }, head: { look: [-3.2, 1.3, -0.05] }, L: { to: [2.78, 0.1, -1.98], hand: 'flat', palm: 'down' }, R: { to: [2.32, 0.1, -1.98], hand: 'flat', palm: 'down' } };   // propped on her hands, head turned to the door
const jadeAsleep = { ...jadeAwake, head: { turn: -28 } };
const mamaAsleep = { at: [1.6, 0.14, -1.6], legs: 'straight', pitch: -90, yaw: 0, spine: { bend: 4 }, head: { turn: 30 }, L: 'side', R: 'side', noApron: true };
const bookOnPillow = { state: 'closed', at: [1.6, 0.171, -2.3], normal: [0.04, 1, 0.02], top: [0.25, 0, 1] };
const BLK_LIE = [{ who: 'littleJade', mode: 'pull', upTo: 0.72 }, { who: 'mama', mode: 'flat' }];
const A1CAM = { lens: 32, pos: [-1.7, 1.38, 0.95], aim: [[3.5, 0.8, -0.8], 0.8, 0.74] };
const PLAN = { lens: 35, pos: [1.3, 9.2, -0.38], target: [1.3, 0, -0.4], far: 14, near: 1, hide: ['sloped ceiling (roof boards)', 'rafters', 'purlin', 'ridge beam', 'collar ties', 'bare bulb (off)'] };
const OPT = {
  A: { name: 'A  in front of the far third of the window (recommended)', sign: {} },
  B: { name: "B  in front of the near (mats') third of the window", sign: { z: -0.62 } },
  C: { name: 'C  beside the window on the far side, clear of the glass', sign: { z: -1.38 } },
  D: { name: "D  beside the window on the mats' side, clear of the glass", sign: { z: -0.22 } },
  E: { name: 'E  as A but hung 0.6 m further out from the wall', sign: { x0: 4.4, x1: 5.1 } },
};
const optShots = Object.entries(OPT).flatMap(([k, o]) => [
  { id: `v3_neonopt_${k}`, v3: true, ...A1CAM, sign: o.sign, hooks: 'empty', header: `neon blade option ${o.name}`, figs: { littleJade: jadeAwake }, book: bookOnPillow, blankets: BLK_LIE, light: { neon: 'red', door: 0, floor: false, amb: 0.45, neonAim: [2.3, 0.2, -1.6] } },
  { id: `v3_neonopt_${k}_plan`, v3: true, ...PLAN, sign: o.sign, hooks: 'empty', header: `plan: where option ${k}'s light falls`, figs: { littleJade: jadeAwake }, book: bookOnPillow, blankets: BLK_LIE, light: { neon: 'red', door: 0, floor: false, amb: 0.5, neonAim: [2.3, 0.2, -1.6], neonCone: 62 } },
  { id: `v3_neonopt_${k}_mat`, v3: true, lens: 28, pos: [2.3, 0.62, -1.4], target: [3.6, 0.9, -0.85], sign: o.sign, hooks: 'empty', header: `from the mat looking out: option ${k}`, figs: {}, book: bookOnPillow, blankets: BLK_LIE, light: { neon: 'red', door: 0, floor: false, amb: 0.45, neonAim: [2.3, 0.2, -1.6] } },
]);

const STK = { at: D9_STACK.at, n: D9_STACK.n }, SH = stackH(D9_STACK.n);
const D9CAM = { lens: 28, pos: [0.0, 0.95, 1.2], aim: [[2.5, 0.8, -1.05], 0.57, 0.5] };
const mamaSeat = (o = {}) => ({ at: [LAP.base[0], LAP.floor + 0.128, LAP.base[1]], legs: 'lapV', yaw: LAP.yaw, noApron: true, ...o });

export const SHOTS = [
  // ---------------------------------------------------------------- A: the wide, the neon blade
  { id: 'v3_A1', v3: true, ...A1CAM, hooks: 'empty', header: 'one lit opening, lower right: the blade sign is a wedge of red in the window', serves: ['A1'],
    intent: 'Wide from the door end. The window is the one lit opening; in it the blade sign, seen at a steep oblique, is a foreshortened wedge of red. Little Jade lies awake on her mat.',
    figs: { littleJade: jadeAwake }, book: bookOnPillow, blankets: BLK_LIE, light: { neon: 'red', door: 0, floor: false, amb: 0.15, neonAim: [2.3, 0.2, -1.6] } },
  { id: 'v3_L3', v3: true, ...A1CAM, hooks: 'hung', header: 'the first frame again: both asleep, apron on the hook; neon on', serves: ['L3'],
    intent: 'Identical camera to v3_A1. Mama and little Jade asleep under their blankets, the apron and towel on the hook. Neon on; v3_L3_off is the end state.',
    figs: { littleJade: jadeAsleep, mama: mamaAsleep }, book: bookOnPillow, blankets: [{ who: 'littleJade', mode: 'pull', upTo: 0.85 }, { who: 'mama', mode: 'pull', upTo: 0.8 }], light: { neon: 'red', door: 0, floor: false, amb: 0.15, neonAim: [2.3, 0.2, -1.6] } },
  { id: 'v3_L3_off', v3: true, ...A1CAM, hooks: 'hung', header: 'the first frame again: neon off (237.840)', serves: ['L3'],
    intent: 'v3_L3 with the neon switched off.',
    figs: { littleJade: jadeAsleep, mama: mamaAsleep }, book: bookOnPillow, blankets: [{ who: 'littleJade', mode: 'pull', upTo: 0.85 }, { who: 'mama', mode: 'pull', upTo: 0.8 }], light: { neon: 'off', door: 0, floor: false, amb: 0.15, neonAim: [2.3, 0.2, -1.6] } },
  ...optShots,
  { id: 'v3_A2', v3: true, lens: 28, pos: [2.65, 0.42, 0.55], aim: [[2.0, 0.12, -1.6], 0.5, 0.62], hooks: 'empty', header: 'low drift left; little Jade lies AWAKE, blinking at the ceiling', serves: ['A2'],
    intent: 'Low across the floorboards as v1 A2, but little Jade is awake on her back, eyes open to the rafters.',
    move: { end_pos: [1.6, 0.42, 0.55], end_target_note: 'keep the same heading; ~1 m left over the shot' },
    figs: { littleJade: jadeAwake }, book: bookOnPillow, blankets: BLK_LIE, light: { neon: 'red', door: 0, floor: true, neonAim: [2.3, 0.2, -1.6] } },
  { id: 'v3_A3a', v3: true, lens: 24, pos: [3.36, 0.78, -2.5], aim: [[-3.5, 1.0, -0.45], 0.4, 0.33], hooks: 'empty', header: 'over little Jade (awake, head turned) to the stair door: Mama wipes her hands on her apron; hooks right of the door', serves: ['A3'],
    intent: 'From behind and over the child lying on her mat (foreground, head toward us) across the dark attic: the stair door opens a tall warm slot, Mama in it wiping her hands on her apron; the empty hook rail on the wall right of the door.',
    figs: { mama: { at: [-3.25, -0.05], legs: 'stand', yaw: 96, spine: { bend: 6 }, head: { look: [2.5, 0.3, -2.2] }, L: { to: 'self:waist', off: [0.15, -0.06, 0.06], hand: 'relax', palm: 'in' }, R: { to: 'self:waist', off: [0.14, -0.1, -0.04], hand: 'pinch', palm: 'in' } },
      littleJade: jadeProp },
    book: bookOnPillow, blankets: [{ who: 'littleJade', mode: 'pull', upTo: 0.5 }, { who: 'mama', mode: 'flat' }], light: { neon: 'red', door: 0.85, floor: true, neonAim: [2.3, 0.2, -1.6] } },
  { id: 'v3_A3b', v3: true, lens: 40, pos: [-2.15, 1.32, -2.25], aim: ['mama:head', 0.36, 0.33], hooks: 'hung', header: 'Mama at the hooks: apron off and onto the hook, towel beside it; she glances back at the child', serves: ['A3'],
    intent: 'Closer, from inside the room: Mama (no apron now) hangs the apron on the hook by the door, the towel already on the next hook, and looks back over her shoulder toward the mats. The open door is a warm slot at frame left.',
    figs: { mama: { at: [-3.08, -0.5], legs: 'stand', yaw: -112, noApron: true, spine: { bend: 3 }, head: { look: [2.5, 0.6, -2.2] }, R: { to: 'hook:1', off: [0.02, -0.03, 0], hand: 'pinch', fingers: [-1, 0.3, 0], palm: 'down' }, L: { to: 'hook:1', off: [0.03, -0.42, 0.1], hand: 'relax', fingers: [-0.6, -0.6, 0], palm: [0, 0, -1] } },
      littleJade: jadeProp },
    book: bookOnPillow, blankets: [{ who: 'littleJade', mode: 'pull', upTo: 0.5 }, { who: 'mama', mode: 'flat' }], light: { neon: 'red', door: 0.85, floor: true, neonAim: [2.3, 0.2, -1.6] } },

  // ---------------------------------------------------------------- LAP storytime: the eight setups
  lapShot('LAP_front', 'LAP_front', { mother: { head: { look: 'book:GT', tilt: -6 } }, child: { head: { look: AHEAD } } }, { sync: 'lip', singers: [M, C], serves: ['B1', 'B2', 'C3', 'D3b', 'E1', 'E3', 'E6', 'G1', 'J4 (left half)'],
    intent: 'The main singing setup: little Jade in Mama\'s lap, both facing us, the book open in front of them; the child\'s face lower centre, Mama\'s above it and a little to frame right. Neon from frame right.' }),
  lapShot('LAP_34', 'LAP_34', { mother: { head: { look: 'book:GT', tilt: -6 } }, child: { head: { look: 'book:G' } } }, { sync: 'lip', singers: [M, C], serves: ['B2', 'C3', 'E1', 'E6'],
    intent: 'Three-quarter two-shot from the window side: the page tipped toward them catches the neon; both faces in three-quarter.' }),
  lapShot('LAP_ots', 'LAP_ots', {}, { serves: ['B3 (start of the push)', 'C5b', 'D3a', 'K-style inserts'],
    intent: "Over Mama's left shoulder and past the child's head, down onto the open spread, large and readable. Start frame of the push into the book (page quads in the sidecar)." }),
  lapShot('LAP_ots_push_end', 'LAP_ots_push_end', {}, { push: { fromShot: CAM.LAP_ots, fill: 0.40 }, serves: ['B3 (end of the push)', 'C5b'],
    intent: 'Same line as v3_LAP_ots, pushed in until the spread fills the frame; the cut to the painting happens here.' }),
  lapShot('LAP_child_cu', 'LAP_child_cu', { mother: { head: { look: `${C}:headTop`, tilt: -6 } }, child: { head: { look: AHEAD } } }, { sync: 'lip', singers: [C], serves: ['G5', 'B1', 'E3', 'G1', 'F3b'],
    intent: "Close on little Jade's face, centred; Mama's chin and shoulder soft above and behind. For 'Yes' (G5)." }),
  lapShot('LAP_mother_cu', 'LAP_mother_cu', { mother: { head: { look: AHEAD, tilt: -4 } }, child: { head: { look: 'book:G' } } }, { sync: 'lip', singers: [M], serves: ['B2', 'C3', 'E1', 'G4 (Mama sings)'],
    intent: "Close on Mama; the top of little Jade's head at the bottom of frame." }),
  lapShot('LAP_profile', 'LAP_profile', { mother: { spine: { bend: 30 }, head: { look: 'book:Rmid', pitchK: 0.8, tilt: 0 } }, child: { head: { look: 'book:Rmid' } } }, { serves: ['C5'],
    intent: 'Profile two-shot, contre-jour (the window side is behind them): Mama leans over the child\'s shoulder to the page and blows across it; dust in the neon.' }),
  lapShot('LAP_hands', 'LAP_hands', {}, { serves: ['C2', 'G3', 'G4', 'J1-style inserts'],
    intent: 'Top-down onto the spread: Mama\'s hands on the outer edges, little Jade\'s on the bottom of the pages; the child\'s hair may fringe the bottom edge. Base for the hand-shadow shots.' }),

  // F3b: the 1988 half of the F3 match cut, in the lap: face at 0.6/0.38 like car26 v3_F3a, seen from a little above like it
  lapShot('LAP_child_cu', 'F3b', { mother: { head: { look: `${C}:headTop`, tilt: -6 } }, child: { head: { look: F.at3(0.05, 0.75, 2.2) }, R: { to: 'self:mouth', off: [F.f[0] * 0.1 + F.l[0] * -0.06, -0.07, F.f[1] * 0.1 + F.l[1] * -0.06], hand: 'palmUp', palm: 'up', fingers: [F.f[0] + F.l[0] * 0.6, 0.1, F.f[1] + F.l[1] * 0.6] } } },
    { lens: 50, orbit: { at: `${C}:eyes`, relBody: M, az: 8, el: 13, dist: 1.0 }, aim: [`${C}:eyes`, 0.6, 0.38], header: 'match cut in: little Jade in the lap blows across her open palm (face 0.6/0.38)', sync: 'lip', singers: [C], serves: ['F3 (last 12 frames)'],
      intent: "Matches car26 v3_F3a: same screen place for the face (0.6/0.38), same slight high angle. Little Jade, in Mama's lap, blows across her flat open palm; hairs fly toward frame left. Mama's chin and shoulder soft above." }),
  // ---------------------------------------------------------------- hand shadows from the real light (LAP_hands camera)
  lapShot('LAP_hands', 'C2', { child: { L: { to: 'card:0:base', off: [-0.02, -0.02, 0], hand: 'fist', palm: 'down' }, R: { to: 'card:0:base', off: [0.02, -0.02, 0], hand: 'fist', palm: 'down' } } },
    { light: { neon: 'red', door: DOOR_AJAR, neonCone: 15 }, cards: [{ on: 'G', h: 0.14, lift: 0.04, who: 'littleJade' }], header: 'THUMBNAIL: the hand-shadow monkey, cast by the blade sign', serves: ['C2'],
      intent: "Little Jade's two hands (the card) held flat over the left page, 4 cm up; the neon rakes in from frame left and throws the monkey across the gutter." }),
  lapShot('LAP_hands', 'G3', { child: { L: { to: 'lift:page:L:0.5:0.4:0.03', hand: 'flat', palm: PAGE_DOWN, fingers: PAGE_TOP } } },
    { light: { neon: 'red', door: DOOR_AJAR, neonCone: 15 }, shadow: { casters: ['littleJade.handL'] }, header: 'small hand flat over the picture; its shadow covers the band', serves: ['G3'],
      intent: "Little Jade's flat left hand hovers 3 cm over the left page; its shadow lies beside it on the painted band." }),
  lapShot('LAP_hands', 'G4', { childSide: 0.06, childFwd: 0.2, child: { spine: { bend: 58, side: -26 }, head: { look: 'book:RO', nod: 10 }, L: { to: 'book:LOB', hand: 'relax', palm: 'down', off: [0.02, 0.02, 0] }, R: { to: 'book:GB', hand: 'relax', palm: 'down', off: [0, 0.02, 0] } },
    mother: { spine: { bend: 6, side: -4 }, L: { to: 'ray:littleJade:head:0.17', hand: 'ring', fingers: 'up', thumb: 'to:neon' } } },
    { light: { neon: 'red', door: DOOR_AJAR, neonCone: 15 }, shadow: { casters: ['mama.handL', 'littleJade.head'] }, header: "the ring's shadow lowers onto the shadow of little Jade's head", serves: ['G4'],
      intent: "Little Jade folds forward out of the lap, her head low over the left page; its shadow falls across the right page. Mama's finger-and-thumb ring, between the window and that head, puts its small shadow on the head-shadow's brow." }),

  // ---------------------------------------------------------------- D9: the fall
  { id: 'v3_D9_a', ...base, ...D9CAM, textbooks: { ...STK, mode: 'stack' }, header: 'D9 a: on the wobbly stack of textbooks, the look-out pose; Mama laughing', serves: ['D9'],
    intent: "Wide. Little Jade has climbed a wobbly stack of textbooks on the floorboards off the foot of her mat and strikes the monkey's look-out: one leg up, hand shading her eyes. Mama, on the mat behind her with the book, laughs.",
    figs: { mama: mamaSeat({ spine: { bend: -4 }, head: { look: 'littleJade:head', nod: -8, tilt: 6 }, L: { to: 'self:mouth', off: [0.04, -0.05, 0.08], hand: 'relax', palm: 'back' }, R: { to: 'book:RO', hand: 'grip', palm: 'in' } }),
      littleJade: { at: [STK.at[0], STK.at[1]], floor: SH, legs: 'oneLegUp', legOpts: { upLeg: 'L' }, yaw: -52, spine: { bend: 4 }, head: { look: [-1.5, 1.3, 2.5] },
        R: { to: 'self:forehead', off: [0, 0.045, 0.03], hand: 'flat', palm: 'down', fingers: 'left' }, L: { to: 'self:shoulderL', off: [0.2, -0.08, 0.1], hand: 'relax', palm: 'down' } } },
    book: { state: 'open', on: 'mama', anchor: 'hip', off: [-0.08, 0.1, 0.3], tilt: 14, v: 6 } },
  { id: 'v3_D9_b', ...base, ...D9CAM, textbooks: { ...STK, mode: 'topple', dir: [-0.35, 0.94] }, header: 'D9 b: the stack goes; she tips back; Mama lunges', serves: ['D9'],
    intent: 'Same camera. The stack shoots out toward us, little Jade tips backward off it, arms flung up; Mama is already on her knees lunging, both arms out.',
    figs: { mama: { at: [2.52, -1.32], floor: 0.0, legs: 'kneel', yaw: -4, noApron: true, spine: { bend: 34 }, head: { look: 'littleJade:head' }, L: { to: 'littleJade:chest', off: [0.16, -0.06, -0.1], hand: 'palmUp', palm: 'up' }, R: { to: 'littleJade:chest', off: [-0.16, -0.06, -0.1], hand: 'palmUp', palm: 'up' } },
      littleJade: { at: [STK.at[0] + 0.03, SH + 0.47, STK.at[1] - 0.2], legs: 'kick', legOpts: { ankleL: [0.1, -0.36, 0.3], ankleR: [0.1, -0.44, 0.08] }, yaw: -52, pitch: -38, roll: 8, spine: { bend: 8 }, head: { look: [-1.5, 2.2, 2.5] },
        R: { to: 'self:shoulderR', off: [-0.16, 0.3, 0.1], hand: 'flat', palm: 'fwd' }, L: { to: 'self:shoulderL', off: [0.2, 0.26, 0.12], hand: 'flat', palm: 'fwd' } } },
    book: { state: 'open', at: [2.3, 0.068, -1.75], normal: [0, 1, 0], top: [0, 0, 1], v: 4 } },
  { id: 'v3_D9_c', ...base, ...D9CAM, textbooks: { ...STK, mode: 'scatter', dir: [-0.35, 0.94] }, header: 'D9 c: caught; books scattered across the boards', serves: ['D9'],
    intent: 'Same camera. Mama on her knees has her under the arms, little Jade leaning back into her, legs out; the textbooks lie scattered toward us.',
    figs: { mama: { at: [2.5, -1.02], floor: 0.0, legs: 'kneel', yaw: -6, noApron: true, spine: { bend: 20 }, head: { look: 'littleJade:head' }, L: { to: 'littleJade:chest', off: [0.12, 0.0, 0.07], hand: 'grip', palm: 'in' }, R: { to: 'littleJade:chest', off: [-0.12, 0.0, 0.07], hand: 'grip', palm: 'in' } },
      littleJade: { at: [2.49, 0.2, -0.62], legs: 'long', yaw: -8, pitch: -32, spine: { bend: 6 }, head: { look: [-1.5, 1.0, 2.5] }, L: { to: 'self:shoulderL', off: [0.16, 0.05, 0.14], hand: 'relax', palm: 'down' }, R: { to: 'self:shoulderR', off: [-0.16, 0.05, 0.14], hand: 'relax', palm: 'down' } } },
    book: { state: 'open', at: [2.3, 0.068, -1.75], normal: [0, 1, 0], top: [0, 0, 1], v: 4 } },

  // ---------------------------------------------------------------- L2b: the blanket (matches bed26 v3_L2)
  { id: 'v3_L2b', v3: true, hooks: 'hung', lens: 40, orbit: { at: 'littleJade:chest', az: 8, el: 32, dist: 2.4 }, aim: ['littleJade:chest', 0.6, 0.64], header: 'Mama pulls the blanket up over sleeping little Jade (matches bed26 v3_L2)', serves: ['L2 (attic half)'],
    intent: 'Matched to bed26 v3_L2: same lens, height, distance and screen direction. Little Jade asleep on her mat, head away from us; Mama kneels at frame left and draws the blanket up to her chin.',
    figs: { littleJade: jadeAsleep, mama: { at: [1.96, -1.66], floor: 0.06, legs: 'kneel', yaw: 92, noApron: true, spine: { bend: 36 }, head: { look: 'littleJade:head' },
      L: { to: [2.47, 0.3, -1.82], hand: 'grip', palm: 'down', fingers: [1, 0, 0], elbow: 'down' }, R: { to: [2.27, 0.3, -1.76], hand: 'grip', palm: 'down', fingers: [1, 0, 0], elbow: 'down' } } },
    book: { state: 'closed', at: [1.6, 0.171, -2.3], normal: [0, 1, 0], top: [0.25, 0, 1] }, blankets: [{ who: 'littleJade', mode: 'pull', upTo: 0.7 }, { who: 'mama', mode: 'flat' }], light: { neon: 'red', door: 0, floor: false, neonAim: [2.5, 0.25, -1.8] } },
];
