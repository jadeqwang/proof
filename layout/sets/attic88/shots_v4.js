// ATTIC 1988, v4 camera table (SETS team, preview_v4). Every camera stands in the one fixed set (v4.js + layout.js);
// bodies are the jointed v4 mannequins (engine/body.js). Ids: v4_<SHOT>. The textbooks are 'stack' before D9 and
// 'fallen' from D9 c on. LAP_* cameras are the v3 vocabulary (engine/lap.js), same lens / distance as bed26.
import { lapPose, lapCameras, lapFrame } from '../../engine/lap.js';
import { LAP4, LJ_LIE, MAMA_LIE, STACK4, STACK_H, BOOK_REST4, FALL_DIR } from './v4.js';

const M = 'mama', C = 'littleJade', DOOR_AJAR = 0.06;
const CFG = { mother: M, child: C, base: LAP4.base, yaw: LAP4.yaw, floor: LAP4.floor, Hm: 1.60, Hc: 1.08 };
const F = lapFrame(LAP4.base, LAP4.yaw), CAM = lapCameras(M, C);
const T36 = 36 * Math.PI / 180, PAGE_DOWN = [F.f[0] * Math.sin(T36), -Math.cos(T36), F.f[1] * Math.sin(T36)], PAGE_TOP = [F.f[0] * Math.cos(T36), Math.sin(T36), F.f[1] * Math.cos(T36)];
const AHEAD = F.at3(0.1, 0.62, 2.2);
const yawOf = (dx, dz) => +(Math.atan2(dx, dz) * 180 / Math.PI).toFixed(1);
const QS = [{ who: 'mama', mode: 'folded' }, { who: 'littleJade', mode: 'aside' }];   // storytime: quilt bunched below her pillow
const B = (books, more = {}) => ({ v3: true, v4: true, hooks: 'hung', quilts: QS, textbooks4: books, light: { neon: 'red', door: DOOR_AJAR }, ...more });
const lap = (o = {}) => { const p = lapPose(CFG, o); p.figs[M].noApron = true; return { figs: p.figs, book: p.book }; };
const lapShot = (name, id, books, o, more = {}) => ({ id: 'v4_' + id, ...B(books), ...CAM[name], ...lap(o), ...more, light: { neon: 'red', door: DOOR_AJAR, ...(more.light || {}) } });
const ST = 'stack', FA = 'fallen';

// little Jade sitting up at the pillow end, legs under the quilt toward the door (A3, A4)
const ljSitUp = (o = {}) => ({ at: [2.28, 0.06 + 0.087, -0.95], legs: 'long', yaw: -90, spine: { bend: 4 }, head: { look: [-3.4, 1.2, 0.0] },
  L: 'side', R: 'side', ...o });
const bookOnChest = { state: 'closed', at: [2.44, 0.205, -0.95], normal: [0, 1, 0], top: [1, 0, 0] };
const ljAwakeHug = { ...LJ_LIE, head: { look: [2.2, 2.6, -0.9] }, L: { to: [2.42, 0.25, -0.86], hand: 'relax', palm: 'down', fingers: [0.2, 0, -1] }, R: { to: [2.48, 0.25, -1.04], hand: 'relax', palm: 'down', fingers: [0.2, 0, 1] } };
const A1CAM = { lens: 32, pos: [-1.7, 1.38, 0.95], aim: [[3.5, 0.85, -0.8], 0.83, 0.4] };
const D9CAM = { lens: 28, pos: [0.25, 0.95, 1.25], aim: [[STACK4.at[0], 0.8, STACK4.at[1]], 0.57, 0.5] };
const mamaSeat = (o = {}) => ({ at: [LAP4.base[0], LAP4.floor + 0.128, LAP4.base[1]], legs: 'lapV', yaw: LAP4.yaw, noApron: true, ...o });
const fallYaw = yawOf(FALL_DIR[0], FALL_DIR[1]);   // facing the D9 camera
// views for the set bible (orthographic)
const HIDE_ROOF = ['sloped ceiling (roof boards)', 'rafters', 'purlin', 'ridge beam', 'collar ties', 'bare bulb (off)'];
const plan = (id, books, header) => ({ id, ...B(books), ortho: { w: 10.2 }, lens: 'ortho', pos: [0, 9, 0], up: [0, 0, -1], target: [0, 0, 0], near: 1, far: 14, hide: HIDE_ROOF, header,
  figs: { littleJade: LJ_LIE, mama: MAMA_LIE }, quilts: [{ who: 'littleJade', mode: 'pull', upTo: 0.8 }, { who: 'mama', mode: 'pull', upTo: 0.8 }], book: { state: 'closed', ...BOOK_REST4 }, light: { neon: 'red', door: 0.5 } });
const sleepers = { figs: { littleJade: { ...LJ_LIE, head: { turn: -25 } }, mama: MAMA_LIE }, quilts: [{ who: 'littleJade', mode: 'pull', upTo: 0.85 }, { who: 'mama', mode: 'pull', upTo: 0.8 }], book: { state: 'closed', ...BOOK_REST4 } };

// B1: Mama sits down on the foot half of the mat, legs tucked to her right, not yet looking; little Jade kneels at her
// left knee and puts her right hand on Mama's left forearm (which rests on Mama's left thigh). The camera is on Mama's
// left-front so her shoulder, upper arm, elbow and forearm read as one arm from her own shoulder.
const LJ_B1 = F.at(0.34, 0.47), LJ_B1_YAW = yawOf(-0.15 * F.l[0] - 1.0 * F.f[0], -0.15 * F.l[1] - 1.0 * F.f[1]);
const B1 = { id: 'v4_B1', ...B(ST), lens: 32, sync: 'lip', singers: [C], focus: [C], serves: ['B1'],
  header: "B1 over Mama's left shoulder: little Jade's hand on Mama's forearm; shoulder, upper arm, elbow in frame",
  intent: "Mama has just sat down cross-legged on the foot half of the mat, the closed book in her right hand, eyes still on it. Little Jade kneels in front of her left knee, facing her (and us), and lays her right hand on Mama's left forearm. Seen from behind Mama's left shoulder: her shoulder, upper arm and elbow are in the foreground at frame right and the forearm runs from that elbow forward across her knee to the child's hand. Mama turns to her on the last word.",
  figs: { mama: { at: [LAP4.base[0], LAP4.floor + 0.12, LAP4.base[1]], legs: 'cross', yaw: LAP4.yaw, noApron: true, spine: { bend: 12, twist: -8 }, head: { look: 'book:cover', tilt: -4 },
      L: { to: F.at3(0.32, 0.2, 0.3), hand: 'relax', palm: 'down', fingers: 'fwd', elbow: 'out' }, R: { to: 'book:R', hand: 'grip', palm: 'in' } },
    littleJade: { at: [LJ_B1[0], LJ_B1[1]], floor: LAP4.floor, legs: 'kneel', yaw: LJ_B1_YAW - 14, spine: { bend: 10 }, head: { look: F.at3(0.24, 1.0, -0.25) },
      R: { to: 'mama:forearmL', off: [0, 0.035, 0], hand: 'relax', palm: 'down' }, L: 'side' } },
  book: { state: 'closed', on: 'mama', anchor: 'lap', off: [-0.12, 0.08, 0.04], tilt: 10 },
  contacts: [['littleJade:handR', 'mama:forearmL', 5]],
  orbit: { at: 'mama:shoulderL', relBody: M, az: 174, el: 30, dist: 1.0 }, aim: [{ mid: ['littleJade:eyes', 'littleJade:handR'] }, 0.43, 0.5] };

export const SHOTS = [
  // ---------------------------------------------------------------- set bible views (orthographic)
  plan('v4_PLAN', ST, 'attic88 v4 plan (roof removed): before D9, textbooks stacked'),
  plan('v4_PLAN_fallen', FA, 'attic88 v4 plan: after D9, textbooks where they fell'),
  { ...plan('v4_ELEV_window', FA, 'elevation: the window gable seen from inside (looking east, +x)'), pos: [-3.3, 1.4, 0], up: [0, 1, 0], target: [3.6, 1.4, 0], ortho: { w: 6.2 }, hide: [] },
  { ...plan('v4_ELEV_door', FA, 'elevation: the door gable seen from inside (looking west, -x)'), pos: [3.3, 1.4, 0], up: [0, 1, 0], target: [-3.6, 1.4, 0], ortho: { w: 6.2 }, hide: [], light: { neon: 'red', door: 0.85 } },
  { ...plan('v4_ELEV_back', FA, 'section: the back slope and the mats (looking north, -z)'), pos: [0, 1.4, 2.7], up: [0, 1, 0], target: [0, 1.4, -3], ortho: { w: 7.4 }, hide: [] },

  // ---------------------------------------------------------------- A
  { id: 'v4_A1', ...B(ST), ...A1CAM, hooks: 'empty', header: 'A1 wide from the door end: one lit opening, little Jade awake on her mat (books stacked)', serves: ['A1'],
    intent: 'Wide from the door end. The window is the one lit opening, the blade sign a red wedge in it. Little Jade lies awake on her mat, head on the pillow under the window, the storybook on her chest; the textbook stack beside her pillow.',
    figs: { littleJade: ljAwakeHug }, book: bookOnChest, quilts: [{ who: 'littleJade', mode: 'pull', upTo: 0.62 }, { who: 'mama', mode: 'folded' }], light: { neon: 'red', door: 0, floor: false, amb: 0.15, neonAim: [2.2, 0.2, -0.9] } },
  { id: 'v4_A2', ...B(ST), lens: 28, pos: [1.75, 0.4, 0.15], aim: [[2.62, 0.22, -0.95], 0.6, 0.58], hooks: 'empty', header: 'A2 low across the boards: little Jade awake, hugging the book', serves: ['A2'],
    intent: 'Low across the floorboards, drifting left; ends on little Jade awake on her back, the book hugged on her chest, the window and the stack above and right of her pillow.',
    move: { end_pos: [0.95, 0.4, 0.15], end_target_note: 'same heading, 0.8 m left' },
    figs: { littleJade: ljAwakeHug }, book: bookOnChest, quilts: [{ who: 'littleJade', mode: 'pull', upTo: 0.62 }, { who: 'mama', mode: 'folded' }], light: { neon: 'red', door: 0, floor: true, neonAim: [2.2, 0.2, -0.9] } },
  { id: 'v4_A3a', ...B(ST), lens: 24, pos: [3.2, 0.86, -0.98], aim: [[-3.5, 1.0, 0.0], 0.44, 0.36], hooks: 'empty', header: 'A3a over little Jade (sitting up) to the stair door: Mama in the warm slot, apron on; hook rail empty', serves: ['A3'],
    intent: 'From behind little Jade, who has sat up at her pillow end and turned to the door: across the dark attic the stair door is a tall warm slot with Mama in it wiping her hands on her apron; the empty hook rail right of the door. The window is behind the camera (red light on her back and the near boards).',
    figs: { mama: { at: [-3.25, -0.05], legs: 'stand', yaw: 96, spine: { bend: 6 }, head: { look: [2.3, 0.5, -0.95] }, L: { to: 'self:waist', off: [0.15, -0.06, 0.06], hand: 'relax', palm: 'in' }, R: { to: 'self:waist', off: [0.14, -0.1, -0.04], hand: 'pinch', palm: 'in' } },
      littleJade: ljSitUp() },
    book: { state: 'closed', at: [1.95, 0.065, -0.8], normal: [0, 1, 0], top: [1, 0, 0.2] }, quilts: [{ who: 'littleJade', mode: 'sitting' }, { who: 'mama', mode: 'folded' }], light: { neon: 'red', door: 0.85, floor: true, neonAim: [2.2, 0.3, -0.9] } },
  { id: 'v4_A3b', ...B(ST), lens: 40, pos: [-2.05, 1.3, -1.65], aim: ['mama:head', 0.36, 0.33], hooks: 'hung', header: 'A3b Mama at the hooks: apron onto hook 2, towel on hook 3; she glances back', serves: ['A3'],
    intent: 'Closer, from inside the room: Mama (apron now off) hangs it by its neck loop on the rail right of the door, the towel already on the next hook; she looks back over her shoulder toward the mats. The open door a warm slot at frame left.',
    figs: { mama: { at: [-3.08, -0.5], legs: 'stand', yaw: -112, noApron: true, spine: { bend: 3 }, head: { look: [2.3, 0.6, -0.95] }, R: { to: 'hook:1', off: [0.02, -0.03, 0], hand: 'pinch', fingers: [-1, 0.3, 0], palm: 'down' }, L: { to: 'hook:1', off: [0.03, -0.42, 0.1], hand: 'relax', fingers: [-0.6, -0.6, 0], palm: [0, 0, -1] } },
      littleJade: ljSitUp() },
    book: { state: 'closed', at: [1.95, 0.065, -0.8], normal: [0, 1, 0], top: [1, 0, 0.2] }, quilts: [{ who: 'littleJade', mode: 'sitting' }, { who: 'mama', mode: 'folded' }], light: { neon: 'red', door: 0.85, floor: true, neonAim: [2.2, 0.3, -0.9] } },
  { id: 'v4_A4', ...B(ST), lens: 35, pos: [0.95, 0.82, -1.25], aim: [{ mid: ['littleJade:eyes', 'book:cover'] }, 0.42, 0.45], header: "A4 Mama kneels at frame right and takes the book little Jade holds up", serves: ['A4'], sync: 'none', focus: [C],
    intent: "Little Jade sits up at her pillow end, face to us, and holds the book up with both hands; Mama, kneeling at frame right (her shoulder and upper arm in frame, head out of the top or turned away), takes it with both hands. Window and stack behind little Jade at frame right, no apron on Mama.",
    figs: { littleJade: ljSitUp({ head: { look: 'mama:eyes' }, L: { to: 'book:L', hand: 'grip', palm: 'in' }, R: { to: 'book:R', hand: 'grip', palm: 'in' } }),
      mama: { at: [1.93, -0.5], floor: 0.0, legs: 'kneel', yaw: 135, noApron: true, spine: { bend: 30 }, head: { look: 'littleJade:eyes' }, L: { to: 'book:T', off: [0.05, 0, 0], hand: 'grip', palm: 'down' }, R: { to: 'book:B', off: [0.05, 0, 0], hand: 'grip', palm: 'up' } } },
    book: { state: 'closed', at: [2.12, 0.38, -0.88], normal: [-1, 0.6, 0], top: [0.5, 1, 0] }, quilts: [{ who: 'littleJade', mode: 'sitting' }, { who: 'mama', mode: 'folded' }], light: { neon: 'red', door: DOOR_AJAR, neonAim: [2.1, 0.5, -0.9] } },

  // ---------------------------------------------------------------- B, C
  B1,
  lapShot('LAP_front', 'B2', ST, { mother: { head: { look: 'book:GT', tilt: -6 } }, child: { head: { look: AHEAD } } }, { sync: 'lip', singers: [M], serves: ['B2', 'J4 (left half: use v4_J4L)'],
    intent: "LAP_front: little Jade in Mama's lap, both facing us, the book open in front; Mama starts the story. Neon from frame right over Mama's left shoulder; the textbook stack (upright) at frame right behind them." }),
  lapShot('LAP_ots', 'B2_ots', ST, {}, { serves: ['B2 (over the shoulder, start of the push)'], intent: "Over Mama's left shoulder onto the spread; page quads in the sidecar." }),
  lapShot('LAP_hands', 'C2', ST, { child: { L: { to: 'card:0:base', off: [-0.02, -0.02, 0], hand: 'fist', palm: 'down' }, R: { to: 'card:0:base', off: [0.02, -0.02, 0], hand: 'fist', palm: 'down' } } },
    { light: { neonCone: 15 }, cards: [{ on: 'G', h: 0.14, lift: 0.04, who: 'littleJade' }], header: 'C2 the hand-shadow monkey, cast by the blade sign', serves: ['C2'],
      intent: "Little Jade's two hands held flat 4 cm over the left page; the neon throws the monkey across the gutter." }),
  lapShot('LAP_34', 'C3', ST, { mother: { head: { look: `${C}:eyes`, tilt: -6 }, R: { to: `${C}:handL`, off: [0, 0.03, 0], hand: 'point', palm: 'down' } }, child: { head: { look: `${M}:eyes` }, L: { to: 'book:LT', off: [0, 0.03, 0.0], hand: 'flat', palm: 'fwd' } } },
    { sync: 'lip', singers: [M], serves: ['C3'], intent: 'Three-quarter from the light side: Mama laughs through the line and lowers the small hands with one finger; little Jade looks up at her.' }),
  lapShot('LAP_profile', 'C5a', ST, { mother: { spine: { bend: 30 }, head: { look: 'book:Rmid', pitchK: 0.8, tilt: 0 } }, child: { head: { look: 'book:Rmid' } } }, { serves: ['C5a'],
    intent: 'Profile two-shot, contre-jour: the window and the blade behind them; Mama leans over the child\'s shoulder and blows across the page past her ear.' }),

  // ---------------------------------------------------------------- D
  { id: 'v4_D2d', ...B(ST), lens: 32, orbit: { at: { mid: ['mama:eyes', 'littleJade:eyes'] }, relBody: M, az: 18, el: 6, dist: 2.7 }, aim: [{ mid: ['mama:eyes', 'littleJade:eyes'] }, 0.5, 0.45], header: 'D2d little Jade bows four ways beside the stack; Mama on the mat with the open book', serves: ['D2d'],
    intent: 'Mama sits on the mat with the book open on her lap; little Jade, on the boards beside the textbook stack, bows deeply like the monkey on the page.',
    figs: { mama: mamaSeat({ head: { look: 'littleJade:head', nod: -4 }, L: { to: 'book:LO', hand: 'grip', palm: 'in' }, R: { to: 'book:RO', hand: 'grip', palm: 'in' } }),
      littleJade: { at: F.at(0.95, 0.72), legs: 'stand', yaw: LAP4.yaw - 120, spine: { bend: 58 }, head: { nod: 10 }, L: 'side', R: 'side' } },
    book: { state: 'open', on: 'mama', anchor: 'lap', off: [0, 0.06, 0.12], tilt: 30, v: 6 } },
  lapShot('LAP_front', 'D3', ST, { mother: { head: { look: `${C}:eyes`, tilt: -4 } }, child: { head: { look: `${M}:eyes` } } },
    { lens: 32, orbit: { at: { mid: [`${M}:eyes`, `${C}:eyes`] }, relBody: M, az: -50, el: 6, dist: 2.25 }, aim: [{ mid: [`${M}:eyes`, `${C}:eyes`] }, 0.38, 0.42], header: 'D3 lap two-shot from Mama\'s right: the window and the blade wedge behind them', serves: ['D3'],
      intent: "No cradle, no lullaby, no song: wide enough that mouths are small. From Mama's right-front: the pair in the lap, the window with the blade wedge behind them at frame right, the stack beside it." }),
  { id: 'v4_D9a', ...B(ST), ...D9CAM, header: 'D9 a on the stack in front of the window: the look-out pose; Mama laughing on the mat', serves: ['D9'],
    intent: "Wide, low. Little Jade stands on the wobbly textbook stack beside her pillow, silhouetted against the window and the blade: one leg up, hand shading her eyes. Mama, on the mat with the book, laughs.",
    figs: { mama: mamaSeat({ spine: { bend: -4 }, head: { look: 'littleJade:head', nod: -8, tilt: 6 }, L: { to: 'self:mouth', off: [0.04, -0.05, 0.08], hand: 'relax', palm: 'back' }, R: { to: 'book:RO', hand: 'grip', palm: 'in' } }),
      littleJade: { at: STACK4.at, floor: STACK_H, legs: 'oneLegUp', legOpts: { upLeg: 'L' }, yaw: fallYaw + 10, spine: { bend: 4 }, head: { look: [-1.5, 1.3, 2.5] },
        R: { to: 'self:forehead', off: [0, 0.045, 0.03], hand: 'flat', palm: 'down', fingers: 'left' }, L: { to: 'self:shoulderL', off: [0.2, -0.08, 0.1], hand: 'relax', palm: 'down' } } },
    book: { state: 'open', on: 'mama', anchor: 'hip', off: [-0.08, 0.1, 0.3], tilt: 14, v: 6 } },
  { id: 'v4_D9b', ...B('topple'), ...D9CAM, header: 'D9 b the stack goes toward us; she tips back; Mama lunges', serves: ['D9'],
    intent: 'Same camera. The stack kicks out toward us; little Jade tips backward off it, arms flung up; Mama is up on her knees on the mat, lunging, both arms out.',
    figs: { mama: { at: [2.5, -0.66], floor: 0.0, legs: 'kneel', yaw: 95, noApron: true, spine: { bend: 30 }, head: { look: 'littleJade:head' }, L: { to: 'littleJade:chest', off: [0.12, -0.08, -0.1], hand: 'palmUp', palm: 'up' }, R: { to: 'littleJade:chest', off: [-0.1, -0.1, -0.12], hand: 'palmUp', palm: 'up' } },
      littleJade: { at: [STACK4.at[0] + 0.06, STACK_H + 0.4, STACK4.at[1] - 0.18], legs: 'kick', legOpts: { ankleL: [0.1, -0.36, 0.3], ankleR: [0.1, -0.44, 0.08] }, yaw: fallYaw, pitch: -38, roll: 8, spine: { bend: 8 }, head: { look: [-1.5, 2.2, 2.5] },
        R: { to: 'self:shoulderR', off: [-0.1, 0.3, 0.1], hand: 'flat', palm: 'fwd' }, L: { to: 'self:shoulderL', off: [0.14, 0.28, 0.12], hand: 'flat', palm: 'fwd' } } },
    book: { state: 'open', at: [1.5, 0.068, -0.75], normal: [0, 1, 0], top: [0.3, 0, -1], v: 4 } },
  { id: 'v4_D9c', ...B(FA), ...D9CAM, header: 'D9 c caught: Mama on her knees has her under the arms; the books where they fell', serves: ['D9'],
    intent: 'Same camera. Mama, on her knees on the mat by the pillow, has her under the arms, little Jade leaning back into her, legs out on the boards; the nine textbooks lie where they fell, fanned toward us. These positions are fixed for every later attic shot.',
    figs: { mama: { at: [2.5, -0.92], floor: 0.06, legs: 'kneel', yaw: fallYaw, noApron: true, spine: { bend: 18 }, head: { look: 'littleJade:head' }, L: { to: 'littleJade:chest', off: [0.1, 0.0, 0.06], hand: 'grip', palm: 'in' }, R: { to: 'littleJade:chest', off: [-0.1, 0.0, 0.06], hand: 'grip', palm: 'in' } },
      littleJade: { at: [2.5 + FALL_DIR[0] * 0.3, 0.2, -0.92 + FALL_DIR[1] * 0.3], legs: 'long', yaw: fallYaw, pitch: -30, spine: { bend: 6 }, head: { look: [-1.5, 1.0, 2.5] }, L: { to: 'self:shoulderL', off: [0.16, 0.05, 0.14], hand: 'relax', palm: 'down' }, R: { to: 'self:shoulderR', off: [-0.16, 0.05, 0.14], hand: 'relax', palm: 'down' } } },
    book: { state: 'open', at: [1.5, 0.068, -0.75], normal: [0, 1, 0], top: [0.3, 0, -1], v: 4 } },

  // ---------------------------------------------------------------- E (books fallen from here on)
  lapShot('LAP_front', 'E1', FA, { mother: { head: { look: `${C}:nose`, tilt: -6 }, R: { to: `${C}:nose`, off: [0, 0, 0.02], hand: 'point', fingers: `to:${C}:nose`, palm: 'down' } }, child: { head: { look: `${M}:eyes` } } },
    { sync: 'lip', singers: [M], serves: ['E1'], intent: "Back in the lap after the fall. Mama's finger comes round and taps her nose on 'you'." }),
  lapShot('LAP_front', 'E3', FA, { mother: { head: { look: `${C}:headTop`, tilt: -6 }, L: { to: 'book:LOB', hand: 'palmUp', palm: 'up', elbow: 'down' }, R: { to: 'book:ROB', hand: 'palmUp', palm: 'up', elbow: 'down' } },
    child: { spine: { bend: -6, twist: 8 }, head: { look: AHEAD, nod: -8 }, R: { to: 'self:earR', off: [-0.07, 0.05, 0.02], hand: 'two', fingers: 'up', palm: 'in', elbow: 'out' }, L: { to: 'self:shoulderL', off: [0.16, 0.0, 0.2], hand: 'flat', palm: 'fwd', fingers: 'up' } } },
    { sync: 'lip', singers: [C], serves: ['E3'], intent: "LAP_front. On 'a spell I'd remember well' she casts: sword-hand (two fingers) drawn back past her right ear, left palm pushed out, chin up. Mama holds the book and laughs above her." }),
  lapShot('LAP_child_cu', 'E5', FA, { mother: { spine: { bend: 22, side: 10 }, head: { look: `${C}:earR`, tilt: -10 } }, child: { head: { look: AHEAD, turn: -10 } } },
    { sync: 'none', serves: ['E5'], intent: "The whisper: Mama leans in from behind at frame right, mouth at little Jade's ear; she holds still, eyes sliding sideways, shoulders up." }),
  lapShot('LAP_front', 'E6', FA, { mother: { head: { look: `${C}:eyes`, tilt: -4 } }, child: { spine: { twist: 28 }, head: { look: `${M}:eyes` } } },
    { serves: ['E6 (keep the v3 take unless the set check fails)'], intent: "She twists round to give Mama the sideways look; Mama hides a laugh." }),
  lapShot('LAP_child_cu', 'F3b', FA, { mother: { head: { look: `${C}:headTop`, tilt: -6 } }, child: { head: { look: F.at3(0.05, 0.75, 2.2) }, R: { to: 'self:mouth', off: [F.f[0] * 0.1 + F.l[0] * -0.06, -0.07, F.f[1] * 0.1 + F.l[1] * -0.06], hand: 'palmUp', palm: 'up', fingers: [F.f[0] + F.l[0] * 0.6, 0.1, F.f[1] + F.l[1] * 0.6] } } },
    { lens: 50, orbit: { at: `${C}:eyes`, relBody: M, az: 8, el: 13, dist: 1.0 }, aim: [`${C}:eyes`, 0.6, 0.38], header: 'F3b match cut in: little Jade blows across her open palm (face 0.6/0.38)', sync: 'lip', singers: [C], serves: ['F3 (last 12 frames)'],
      intent: 'Matches car26 v4_F3a: face at 0.6/0.38, slight high angle; she blows across her flat palm, hairs fly toward frame left.' }),

  // ---------------------------------------------------------------- G
  lapShot('LAP_front', 'G1', FA, { mother: { head: { look: `${C}:headTop`, tilt: -6 } }, child: { head: { look: `${M}:eyes` }, R: { to: 'self:forehead', off: [0, 0.02, 0.03], hand: 'flat', palm: 'back', fingers: 'left' } } },
    { sync: 'lip', singers: [C], serves: ['G1'], intent: 'LAP_front: she touches her own forehead (the band of gold), looks from the page to Mama and waits. The fallen books at frame right on the boards.' }),
  lapShot('LAP_hands', 'G3', FA, { child: { L: { to: 'lift:page:L:0.5:0.4:0.03', hand: 'flat', palm: PAGE_DOWN, fingers: PAGE_TOP } } },
    { light: { neonCone: 15 }, shadow: { casters: ['littleJade.handL'] }, header: 'G3 her flat hand protects the monkey; its shadow beside it', serves: ['G3'],
      intent: "Little Jade's flat left hand 3 cm over the left page, five fingers; its shadow beside it on the painted band." }),
  lapShot('LAP_front', 'G4', FA, { mother: { head: { look: 'fallen:5', nod: 4, tilt: -6 }, L: { to: 'book:LOB', hand: 'palmUp', palm: 'up', elbow: 'down' }, R: { to: `${C}:shoulderR`, off: [-0.03, 0.18, 0.12], hand: 'point', fingers: 'up', palm: 'fwd' } },
    child: { head: { look: 'fallen:5' } } },
    { lens: 32, orbit: { at: { mid: [`${M}:eyes`, `${C}:eyes`] }, relBody: M, az: -28, el: 14, dist: 2.25 }, aim: [{ mid: [`${M}:eyes`, `${C}:eyes`] }, 0.36, 0.36], sync: 'lip', singers: [M], focus: [M, C], header: 'G4 lap two-shot with the fallen textbooks in frame (lower right)', serves: ['G4'],
      intent: "Mama looks at the pile of fallen books, then at the child, one eyebrow up, a finger lifted: 听话. Little Jade follows her look to the books and back. The nine books lie on the boards at frame right exactly where they fell in D9." }),
  lapShot('LAP_child_cu', 'G5', FA, { mother: { head: { look: `${C}:headTop`, tilt: -6 } }, child: { head: { look: F.at3(0.9, 0.5, 1.2), nod: 6 } } },
    { sync: 'lip', singers: [C], serves: ['G5'], intent: "LAP_child_cu: eyes off to the side and slightly down (the gears turning), then back to Mama, a small nod, then 'Yes'." }),

  // ---------------------------------------------------------------- J4, L
  lapShot('LAP_front', 'J4L', FA, { mother: { head: { look: 'book:GT', tilt: -6 } }, child: { head: { look: AHEAD } } }, { sync: 'lip', singers: [M, C], serves: ['J4 (left half)'],
    intent: 'Identical to bed26 v4_J4R in lens, distance and framing: the 1988 pair in the lap, red from frame right.' }),
  { id: 'v4_L2b', ...B(FA), lens: 40, pos: [0.47, 1.64, -0.57], target: [2.35, 0.24, -1.25], header: 'L2b Mama pulls the quilt up over sleeping little Jade (matches bed26 v4_L2)', serves: ['L2 (attic half)'],
    intent: 'Matched to bed26 v4_L2: same lens, height and distance, from the foot of the bed/mat. Little Jade asleep, head on the pillow under the window at upper right; Mama kneels at frame left (between the mats) and draws the quilt up to her chin.',
    figs: { littleJade: { ...LJ_LIE, head: { turn: -25 } }, mama: { at: [2.05, -1.42], floor: 0.06, legs: 'kneel', yaw: 8, noApron: true, spine: { bend: 34 }, head: { look: 'littleJade:head' },
      L: { to: [2.33, 0.3, -1.02], hand: 'grip', palm: 'down', fingers: [0, 0, 1], elbow: 'down' }, R: { to: [2.15, 0.3, -1.06], hand: 'grip', palm: 'down', fingers: [0, 0, 1], elbow: 'down' } } },
    book: { state: 'closed', ...BOOK_REST4 }, quilts: [{ who: 'littleJade', mode: 'pull', upTo: 0.7 }, { who: 'mama', mode: 'folded' }], light: { neon: 'red', door: 0, floor: false, neonAim: [2.3, 0.25, -0.95] } },
  { id: 'v4_L3', ...B(FA), ...A1CAM, header: 'L3 the A1 wide again: both asleep, apron and towel on the hooks, the fallen books on the boards; neon on', serves: ['L3'], ...sleepers,
    intent: 'Identical camera to v4_A1. Both asleep under their quilts; the textbooks where they fell; apron and towel on the hooks. Neon on; v4_L3_off is the end state.', light: { neon: 'red', door: 0, floor: false, amb: 0.15, neonAim: [2.2, 0.2, -0.9] } },
  { id: 'v4_L3_off', ...B(FA), ...A1CAM, header: 'L3 end state: neon off (237.840)', serves: ['L3'], ...sleepers, intent: 'v4_L3 with the neon off.', light: { neon: 'off', door: 0, floor: false, amb: 0.15, neonAim: [2.2, 0.2, -0.9] } },
];
// debug: a top-down ortho view of any staged shot (not delivered)
const dbgTop = (s, c, w = 2.4) => ({ ...s, id: s.id.replace('v4_', 'v4dbg_') + '_top', ortho: { w }, lens: 'ortho', pos: [c[0], 6, c[1]], up: [0, 0, -1], target: [c[0], 0, c[1]], orbit: undefined, aim: undefined, near: 1, far: 10, hide: HIDE_ROOF });
SHOTS.push(dbgTop(B1, LAP4.base));
// master-plate views: the empty room (no people), for the painted master plates media/kf/v4/_sets/
SHOTS.push(
  { id: 'v4_MASTER_window', ...B(ST), lens: 24, pos: [-0.6, 1.3, 1.4], target: [2.4, 0.55, -1.0], hooks: 'empty', figs: {}, book: { state: 'closed', ...BOOK_REST4 }, quilts: [{ who: 'littleJade', mode: 'flat' }, { who: 'mama', mode: 'folded' }],
    header: 'MASTER: the empty attic toward the window gable (books stacked)', intent: 'Empty room for the master plate: window and blade wedge, both mats, pillows, quilts, the textbook stack, the TV.', light: { neon: 'red', door: 0, floor: true, amb: 0.3, neonAim: [2.0, 0.2, -0.9] } },
  { id: 'v4_MASTER_fallen', ...B(FA), lens: 24, pos: [-0.6, 1.3, 1.4], target: [2.4, 0.55, -1.0], figs: {}, book: { state: 'closed', ...BOOK_REST4 }, quilts: [{ who: 'littleJade', mode: 'flat' }, { who: 'mama', mode: 'folded' }],
    header: 'MASTER: the same, after D9 (books fallen)', intent: 'As v4_MASTER_window with the textbooks where they fell.', light: { neon: 'red', door: 0, floor: true, amb: 0.3, neonAim: [2.0, 0.2, -0.9] } },
  { id: 'v4_MASTER_door', ...B(ST), lens: 24, pos: [2.9, 1.25, -0.4], target: [-3.5, 1.0, -0.4], hooks: 'hung', figs: {}, book: { state: 'closed', ...BOOK_REST4 }, quilts: [{ who: 'littleJade', mode: 'flat' }, { who: 'mama', mode: 'folded' }],
    header: 'MASTER: the empty attic toward the door gable (hooks with apron and towel)', intent: 'Empty room toward the stair door: door ajar (a warm slot), the hook rail with apron and towel, boxes, sacks, the mat feet.', light: { neon: 'red', door: 0.25, floor: true, amb: 0.3, neonAim: [1.0, 0.3, -0.6] } },
);
