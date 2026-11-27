// fl_hands: 3D guides for first love's hands sheet (cast/first_love/_prompts/v10/takes/D_t3.jpg), studies 2 and 3.
// Jade 2026-11-26 (corrected): "he should have both palms up and my hand is on top". Both sit cross-legged on the
// floor, facing, close. His two hands side by side, both palm-up, cupped slightly (a cradle) over his crossed shins;
// her RIGHT hand rests palm-down on his two palms, fingers relaxed and gently curved; her LEFT hand relaxed on her lap.
// Posed from a look-only reference photo of a hand resting on an upturned palm (Unsplash EVeqqKNCzRo, kept in the
// scratchpad only): the upturned hand's fingers curl up softly, the resting hand's fingers drape and curve over it.
// Him at 19 (the sheet's forest-green sleeves, pushed up) in black slacks (Jade 2026-11-26); her (adult Jade, 19) bare
// forearms, beige trousers. Both heads are hidden in every shot (privacy-safe: no face can enter the frame).
//   node layout/render.mjs --set fl_hands --shots D2_guide,D3_guide --modes form,contour,lit --w 3072 --h 1728 --out <dir>
import '../_cast.js';
import { preloadPaint } from '../../engine/paint.js';
export const HER = { at: [0, -0.48], yaw: 0 }, HIM = { at: [0, 0.48], yaw: 180 };   // hips 0.96 m apart (their crossed knees just clear)
// her right hand's palm centre (world): over his crossed shins, in front of his lap
export const HOLD = [-0.02, 0.26, 0.04];
const add = (a, b) => a.map((x, i) => +(x + b[i]).toFixed(4));
const nz = (a) => { const l = Math.hypot(...a); return a.map((x) => +(x / l).toFixed(4)); };
const HER_COST = { top: 0xd9d2c4, legs: 0xcdb898, sleeves: 'pushed', sock: 0xe9c6a8 };
const HIS_COST = { top: 0x4b5a3d, legs: 0x1b1b1e, sleeves: 'pushed', sock: 0xd9ab88 };
// his palm centres under hers (measured with the clip check: contact, no interpenetration), side by side 7 cm apart
export const GAP = 0.066, SPLIT = 0.036, ALONG = 0.065;
export const herFig = (o = {}) => ({ ...HER, legs: 'cross', spine: { bend: 22 }, head: { look: HOLD }, costume: HER_COST,
  R: { to: HOLD, hand: { shape: 'relax', spread: 2, thumb: { opp: 0, sweep: 18, abd: 0, mcp: 4, ip: 6 } }, palm: 'down', fingers: nz([0.05, 0.1, 1]) },
  L: { to: 'lap', off: [0.06, -0.01, 0.06], hand: 'relax', palm: 'down', fingers: nz([0.35, -0.2, 1]) }, ...o });
export const himFig = (o = {}) => ({ ...HIM, legs: 'cross', spine: { bend: 16 }, head: { look: HOLD }, costume: HIS_COST,
  L: { to: add(HOLD, [-SPLIT, -GAP, ALONG]), hand: 'palmUp', palm: nz([0.25, 1, 0]), fingers: nz([0.4, 0.08, -1]), elbow: 'down', grasp: 'palmUnder', object: 'figure:jade19' },
  R: { to: add(HOLD, [SPLIT, -GAP, ALONG]), hand: 'palmUp', palm: nz([-0.25, 1, 0]), fingers: nz([-0.4, 0.08, -1]), elbow: 'down', grasp: 'palmUnder', object: 'figure:jade19' }, ...o });
const FIGS = { jade19: herFig(), firstLove19: himFig() };
const HIDE = { jade19: ['head'], firstLove19: ['head'] };
export const SHOTS = [
  // study 2: from above, him at the top of the frame, her at the bottom; the hands in the middle
  { id: 'D2_guide', lens: 50, pos: [HOLD[0], 1.55, HOLD[2] - 0.12], target: [HOLD[0], 0.2, HOLD[2] + 0.02], hideParts: HIDE, header: 'D study 2: her hand resting on his two upturned palms, from above', figs: FIGS },
  // study 3: from the side (her on the left, him on the right), at the height of the hands
  { id: 'D3_guide', lens: 50, pos: [HOLD[0] - 0.85, 0.36, HOLD[2]], target: [HOLD[0], 0.24, HOLD[2]], hideParts: HIDE, header: 'D study 3: the same, from the side', figs: FIGS },
  { id: 'D_hold_close_top', lens: 50, pos: [HOLD[0], 0.75, HOLD[2] - 0.08], target: HOLD, hideParts: HIDE, header: 'hold close, from above', figs: FIGS },
  { id: 'D_hold_close_side', lens: 50, pos: [HOLD[0] - 0.42, 0.30, HOLD[2]], target: HOLD, hideParts: HIDE, header: 'hold close, from the side', figs: FIGS },
];
// debug: the same hold with the grip tags off (the clip check then reports where the hands meet as body vs body)
{ const h = himFig(); for (const n of ['L', 'R']) { h[n] = { ...h[n] }; delete h[n].object; delete h[n].grasp; }
  SHOTS.push({ id: 'dbg_nogrip', lens: 50, pos: [HOLD[0] - 0.42, 0.42, HOLD[2]], target: HOLD, hideParts: HIDE, header: 'debug: no grip tags', figs: { jade19: herFig(), firstLove19: h } }); }
// debug: where the cross-legged knees / thighs / laps are (logged)
SHOTS.push({ id: 'dbg_layout', lens: 35, pos: [0, 2.4, 0.01], target: [0, 0, 0], logP: true, header: 'debug: layout from above', figs: { jade19: { at: [0, -0.45], yaw: 0, legs: 'cross', L: 'lap', R: 'lap' }, firstLove19: { at: [0, 0.45], yaw: 180, legs: 'cross', L: 'lap', R: 'lap' } } });

// ======================================================================================================================
// 2026-11-27: DRAWABILITY TEST, three candidate holds (Jade), each posed from a look-only reference photo (scratchpad
// handrefs/01, 02, 03; never sent to an image model). Both cross-legged on the floor, facing, hips 1.0 m apart (closer
// and their crossed feet collide); the held hands REST on the knees (supported, not in mid-air). Camera: three-quarter
// overhead close, from beside them, both torsos from the neck down (heads hidden), hands centred and large.
// Facing square on, any hip distance makes their crossed feet collide (clip check: 37-61 mm at 0.9-1.1 m); offset 0.2 m
// to each side (each faces the other's left knee) at 1.0 m they clear (dbg_legs_1_0.2). The inner knees are then her
// LEFT (0.13, -0.16) and his LEFT (-0.16, 0.13); the holds rest on those.
export const H = { her: { at: [-0.2, -0.5], yaw: 0 }, him: { at: [0.2, 0.5], yaw: 180 } };
const HCOST = { her: HER_COST, him: HIS_COST };
const hb = (who, o) => ({ ...H[who], legs: 'cross', spine: { bend: 34 }, costume: HCOST[who], head: { look: [0, 0.2, 0] }, ...o });
const P0 = { // per-hold tunables (hold points: her palm centre; his palm-up hand under it), found by clip-check sweeps
  H1: { A: [0.13, 0.318, -0.12], B: [-0.15, 0.296, 0.04], under: 0.0705, underA: 0.0765, along: 0.06 },
  H2: { at: [-0.12, 0.298, 0.05], under: 0.0745, along: 0.06, over: 0.0755 },
  H3: { at: [-0.15, 0.222, 0.1], under: 0.082, side: 0.03, along: 0.05 },
};
const HER_HAND = { shape: 'relax', spread: 2, thumb: { opp: 0, sweep: 18, abd: 0, mcp: 4, ip: 6 } };
// H1 (photo 1): both pairs of hands joined low between the knees, forearms along the thighs, wrists neutral. Each pair:
// his hand palm-up underneath, hers palm-down in it, fingers over each other; each pair rests across the two knees
// on its side (hers and his).
export function h1Figs(p = P0.H1) {
  const A = p.A, B = p.B;   // A on her left knee (her LEFT + his RIGHT), B on his left knee (her RIGHT + his LEFT)
  return {
    jade19: hb('her', { L: { to: A, hand: HER_HAND, palm: 'down', fingers: nz([0.15, 0.12, 1]) }, R: { to: B, hand: HER_HAND, palm: 'down', fingers: nz([0.15, 0.3, 1]) } }),
    firstLove19: hb('him', { L: { to: add(B, [0, -p.under, p.along]), hand: 'palmUp', palm: nz([0.2, 1, 0]), fingers: nz([0.1, 0.06, -1]), elbow: 'down', grasp: 'palmUnder', object: 'figure:jade19' },
      R: { to: add(A, [0, -(p.underA ?? p.under), p.along]), hand: 'palmUp', palm: nz([-0.2, 1, 0]), fingers: nz([-0.1, 0.06, -1]), elbow: 'down', grasp: 'palmUnder', object: 'figure:jade19' } }) };
}
// H2 (photo 2): his two hands wrapped round her one (her RIGHT), resting on his left knee: his left palm-up under it, his
// right over the back of it, fingers across, thumb on the back of her hand; her left hand relaxed on her lap
export function h2Figs(p = P0.H2) {
  const A = p.at;
  return {
    jade19: hb('her', { R: { to: A, hand: HER_HAND, palm: 'down', fingers: nz([-0.1, 0.3, 1]) }, L: { to: 'lap', off: [0.06, -0.01, 0.06], hand: 'relax', palm: 'down', fingers: nz([0.35, -0.2, 1]) } }),
    firstLove19: hb('him', { L: { to: add(A, [0, -p.under, p.along]), hand: 'palmUp', palm: nz([0.2, 1, 0]), fingers: nz([0.1, 0.06, -1]), elbow: 'down', grasp: 'power', object: 'figure:jade19' },
      R: { to: add(A, [0.02, p.over, 0.03]), hand: { shape: 'relax', thumb: { opp: 0.1 } }, palm: nz([-0.3, -1, 0]), fingers: nz([-0.8, -0.05, -0.6]), grasp: 'power', object: 'figure:jade19' } }) };
}
// H3 (photo 3): loose: his left palm up resting on his left knee, her right hand laid on it, her fingers draped and
// lightly curled over the outer side of his palm; nobody grips; the other hands relaxed on their laps
export function h3Figs(p = P0.H3) {
  const A = p.at;
  return {
    jade19: hb('her', { R: { to: add(A, [-p.side, p.under, -p.along]), hand: { shape: 'relax', spread: 3, curl: p.curl || { index: [24, 34, 16], middle: [28, 38, 18], ring: [30, 40, 18], little: [32, 42, 20] }, thumb: p.thumb || { opp: 0, sweep: 18, abd: 0, mcp: 4, ip: 6 } }, palm: p.palm || 'down', fingers: nz(p.fingers || [-0.35, 0.22, 1]) },
      L: { to: 'lap', off: [0.06, -0.01, 0.06], hand: 'relax', palm: 'down', fingers: nz([0.35, -0.2, 1]) } }),
    firstLove19: hb('him', { L: { to: A, hand: 'palmUp', palm: nz([0.15, 1, 0]), fingers: nz([-0.1, 0.06, -1]), elbow: 'down', grasp: 'palmUnder', object: 'figure:jade19' },
      R: { to: 'lap', off: [-0.06, -0.01, -0.06], hand: 'relax', palm: 'down', fingers: nz([0.1, -0.3, -1]) } }) };
}
const HHIDE = { jade19: ['head'], firstLove19: ['head'] };
// three-quarter overhead close, from beside them: the camera looks across the line between their hips (perpendicular to
// it), ~40 deg down at the hands, close enough that the hands are large; the frame top stays below their shoulders'
// tops (heads hidden as well)
const SIDE = nz([0.93, 0, -0.37]);
const beside = (hold, sgn, d = 0.82, el = 40, lens = 35) => { const c = Math.cos(el * Math.PI / 180), s = Math.sin(el * Math.PI / 180);
  return { lens, pos: [hold[0] + sgn * SIDE[0] * d * c, hold[1] + d * s, hold[2] + sgn * SIDE[2] * d * c].map((x) => +x.toFixed(3)), target: hold }; };
SHOTS.push(
  { id: 'H1_guide', ...beside([0, 0.255, -0.03], 1, 1.2, 30), hideParts: HHIDE, header: 'H1: both pairs of hands joined low between the knees', figs: h1Figs() },
  { id: 'H2_guide', ...beside([-0.1, 0.255, 0.03], -1, 1.1, 30), hideParts: HHIDE, header: 'H2: his two hands round her one, on his knee', figs: h2Figs() },
  { id: 'H3_guide', ...beside([-0.12, 0.245, 0.05], -1, 1.1, 30), hideParts: HHIDE, header: 'H3: her hand laid loosely on his upturned palm, on his knee', figs: h3Figs() });
export const HFIGS = { h1Figs, h2Figs, h3Figs, P0 };
// debug: leg clearance for cross-legged facing pairs (no hands): dz = hip distance, dx = sideways offset of each
for (const [dz, dx] of [[1.0, 0.12], [1.0, 0.2], [1.06, 0], [1.1, 0], [0.95, 0.25]])
  SHOTS.push({ id: `dbg_legs_${dz}_${dx}`, lens: 35, pos: [0, 2.4, 0.01], target: [0, 0, 0], logP: true, header: 'debug legs', figs: { jade19: { at: [-dx, -dz / 2], yaw: 0, legs: 'cross', L: 'lap', R: 'lap' }, firstLove19: { at: [dx, dz / 2], yaw: 180, legs: 'cross', L: 'lap', R: 'lap' } } });
// debug: H shots with the grip tags off (body vs body then says where hands meet)
for (const id of ['H1_guide', 'H2_guide', 'H3_guide']) { const s = SHOTS.find((x) => x.id === id), f = JSON.parse(JSON.stringify(s.figs));
  for (const w of Object.values(f)) for (const n of ['L', 'R']) if (w[n] && typeof w[n] === 'object') { delete w[n].grasp; delete w[n].object; }
  SHOTS.push({ ...s, id: 'dbgng_' + id, figs: f }); }

// ======================================================================================================================
// 2026-11-27 night: H3 -> H2 as ONE clip (Jade: "there's real potential of the clip being H3 -> H2"). The first H2/H3
// guides had him on the RIGHT (H1 and the D_t4 style ref have him on the LEFT), so the painter swapped them and gave her
// his forearm hair; and H2's covering hand pinched her wrist with its fingertips (read as taking a pulse). Now: one
// camera for both (him on the LEFT, as H1), identical bodies; H2b = H3 + his RIGHT hand laid over the back of hers.
// The hold stays on his left knee. Everything below is shared by both frames and was checked on the baked mesh
// bodies (scratch Rapier scripts beside clipcheck: hand on hand, limbs on legs; clipcheck hides hand-on-hand contact
// behind the grip tag).
// v2 (2026-11-27, Jade's review of the paintings):
// - his LEFT arm rests ON his thigh: v1's forearm sank 36 mm into the slacks (it read thin). Hold raised 2.8 cm (at y
//   0.25), elbow out over the thigh (HBX.himL.elbow), palm tilted ~35 deg toward the camera (his little-finger edge, wrist
//   to little finger, faces the lens; his hand cradles hers), thumb lying alongside the index (no longer poking up).
// - her right hand lies IN his palm, 4.5 cm toward his thumb side of v1, so his little-finger edge stays clear of it.
// - her right thumb spread in the palm plane (sweep 55, opp 0.1, abd 0): v1's thumb, adducted flat against the index (sweep 18,
//   abd 0), folded the skinned web into a jagged crease (the "thorn" on the back of her hand in form, lit and contour).
// - his right hand in H3b rests palm down on his right knee (v1: lap shortcut, hovering ~10 cm over his foot).
// - her left hand rests curled on her left knee, fully in frame (v1: fingers laid out straight toward the lens on her
//   lap, partly cut by the frame edge, read too long; hand size unchanged).
// - his trunk turned toward the hold (twist 30 to his left, side -12, bend 36) in both frames, so his right hand reaches.
export const HB = { p: { ...P0.H3, at: [-0.15, 0.25, 0.1], under: 0.068, along: 0.05, side: 0.015, fingers: [0.1, -0.05, 1], thumb: { opp: 0.1, sweep: 55, abd: 0, mcp: 4, ip: 8 }, curl: { index: [10, 24, 14], middle: [12, 26, 14], ring: [14, 28, 16], little: [16, 30, 16] } }, spine: { bend: 36, twist: 30, side: -12 } };
// her right hand as solved (the natural-wrist pass turns it from the spec), measured on the mesh bodies: palm centre, back of
// the hand (dorsal normal), fingers, and across (toward her THUMB side)
export const HER_R = { palm: [-0.165, 0.318, 0.05], dors: [0, 1, 0.03], fingers: [0.3, -0.03, 0.95], across: [0.95, 0.01, -0.3] };
// his covering hand, in her hand's frame: palm centre `up` above her palm centre (two hand half-thicknesses), `along`
// toward her knuckles (on the metacarpals, clear of the wrist), `across` toward her thumb side (so his fingers end at and
// drape over her little-finger edge); fingers toward her little-finger side, dipping `fd` (the drape)
export const COVER = { up: 0.035, along: 0.045, across: 0.035, fa: 0, fd: -0.3, hand: { shape: 'relax', spread: 1, curl: { index: [6, 12, 6], middle: [8, 14, 6], ring: [10, 16, 8], little: [12, 18, 8] }, thumb: { opp: 0.05 } } };
// HBX: overrides on h3Figs' arms (his left palm-up hand, his right hand on his knee, her left hand on her knee)
export const HBX = { himL: { elbow: [-0.5, -0.8, 0.1], fingers: [0.35, 0.05, -1], palm: [0.7, 1, 0.15], hand: { shape: 'palmUp', curl: { index: [10, 14, 6], middle: [13, 18, 8], ring: [16, 21, 10], little: [19, 24, 12] }, spread: 4, thumb: { opp: 0, sweep: 14, abd: 2, mcp: 6, ip: 6 } } }, himR: { to: [0.52, 0.281, 0.19], hand: { shape: 'relax', spread: 3, curl: { index: [14, 26, 14], middle: [16, 30, 16], ring: [18, 32, 16], little: [20, 34, 18] }, thumb: { opp: 0.3, mcp: 12, ip: 10 } }, palm: [0, -1, 0.1], fingers: [0.35, 0.1, -0.9], elbow: [0.6, -0.8, 0.2] }, herL: { to: [0.065, 0.2636, -0.223], hand: { shape: 'relax', spread: 2, curl: { index: [10, 18, 8], middle: [14, 22, 10], ring: [18, 26, 12], little: [22, 32, 14] }, thumb: { opp: 0.2, sweep: 40, abd: 2, mcp: 16, ip: 20 } }, palm: [0, -0.99, -0.15], fingers: [0.12, -0.15, 0.98], elbow: [0.35, -0.9, -0.15] } };
// v3 (2026-11-27, Jade: her left hand "strangely shaped ... the proportions of the palm are kinda off"): v2's herL was
// curled into a claw (middle finger 28+38+18 deg) with the palm 18 mm OVER the thigh, only the fingertips down, so from
// CAM_HB the back of the hand read as a long slab with stubby knuckles. Now (look-only refs: palm-down hands resting on
// a cross-legged knee / thigh) it lies on the distal thigh, toward its inner side: heel of the hand and palm on the
// trousers (-1.2 / -1.1 mm), fingers forward over the thigh with a light graded curl (index least, little most), wrist
// slightly extended (6 deg, ulnar 18), thumb relaxed and curled down beside the index (opp 0.2, sweep 40, mcp 16, ip 20;
// a flatter thumb, sweep 24-38, folds the web skin into a crease, as on her right hand). The kneecap itself is too low
// in CAM_HB's frame (the hand would be cut by the bottom edge).
// v4 (2026-11-27, Jade after the hand-mark paint test: his under-hand still read as an amputee, "his entire hand is in the
// shadow of hers"): his LEFT hand is solo-lit (engine humanMesh spec.soloLight): no cast shadow from her on it, and in form
// only its own fingers occlude it. The pose is unchanged.
export function h3bFigs() { const f = h3Figs(HB.p); f.firstLove19.spine = HB.spine; f.firstLove19.soloLight = ['L'];
  f.firstLove19.L = { ...f.firstLove19.L, ...HBX.himL, ...(HBX.himL.palm ? { palm: nz(HBX.himL.palm) } : {}), ...(HBX.himL.fingers ? { fingers: nz(HBX.himL.fingers) } : {}) };
  for (const [who, n, k] of [['firstLove19', 'R', 'himR'], ['jade19', 'L', 'herL']]) if (HBX[k]) f[who][n] = { ...HBX[k], ...(HBX[k].palm ? { palm: nz(HBX[k].palm) } : {}), ...(HBX[k].fingers ? { fingers: nz(HBX[k].fingers) } : {}) };
  return f; }
export function h2bFigs(c = COVER) {
  const f = h3bFigs(), F = HER_R, d = nz(F.dors), a = nz(F.fingers), x = nz(F.across);
  const to = F.palm.map((p, i) => p + d[i] * c.up + a[i] * c.along + x[i] * c.across);
  const fing = nz(x.map((v, i) => -v + a[i] * (c.fa || 0) + d[i] * (c.fd || 0)));
  f.firstLove19.R = { to: to.map((v) => +v.toFixed(4)), hand: c.hand || { shape: 'relax', spread: 1, thumb: { opp: 0.05 } }, palm: d.map((v) => -v), fingers: fing, ...(c.elbow ? { elbow: c.elbow } : {}), object: 'figure:jade19' };
  return f;
}
// one camera for both frames: him on the LEFT, her on the right (as H1)
// camera at azimuth `az` (deg from +x toward +z), elevation `el`, distance d from the target. From az -40 (a little
// from her side, him on the LEFT) the hands read as a stack. v2: framed 4 cm lower and 5 cm wider so her left hand on
// her knee is whole. Limitation: in H2b his covering hand and forearm sit in front of his left wrist from any camera on
// her side (the wrist is directly behind the stack); H3b shows that wrist.
const camAt = (t, az, el, d, lens) => { const a = az * Math.PI / 180, e = el * Math.PI / 180;
  return { lens, pos: [t[0] + Math.cos(a) * Math.cos(e) * d, t[1] + Math.sin(e) * d, t[2] + Math.sin(a) * Math.cos(e) * d].map((x) => +x.toFixed(3)), target: t }; };
export const CAM_HB = camAt([-0.09, 0.26, 0.01], -40, 40, 0.95, 35);
SHOTS.push(
  { id: 'H3b_guide', ...CAM_HB, hideParts: HHIDE, header: 'H3b: her hand laid loosely on his upturned palm (clip start)', figs: h3bFigs() },
  { id: 'H2b_guide', ...CAM_HB, hideParts: HHIDE, header: 'H2b: the same, his right hand laid over the back of hers (clip end)', figs: h2bFigs() });
// v5 TRIAL (2026-11-27, Jade: "paint the palm of his hand with the texture of the real palm of a hand ... like a brick
// wall receding"): the same two frames with a procedural palm skin texture on his LEFT hand (engine humanMesh spec.skinTex:
// palm creases, doubled joint creases, pad lines, fingertip whorls, fine skin network; palm side only). Separate ids so the
// accepted guides are untouched until Jade decides.
{ const tex = (f) => { f.firstLove19.skinTex = ['L']; return f; };
  SHOTS.push(
    { id: 'H3b_guide_tex', ...CAM_HB, hideParts: HHIDE, header: 'H3b + palm skin texture on his left hand (trial)', figs: tex(h3bFigs()) },
    { id: 'H2b_guide_tex', ...CAM_HB, hideParts: HHIDE, header: 'H2b + palm skin texture on his left hand (trial)', figs: tex(h2bFigs()) },
    // calibration: his left hand open, palm up, seen from straight above (no her)
    { id: 'dbg_palmtex', lens: 50, pos: [0.25, 0.62, 0.0], target: [0.25, 0.22, 0.0], header: 'debug: palm texture, open palm up',
      figs: { firstLove19: { at: [-0.25, 0.0], yaw: 90, legs: 'cross', skinTex: ['L', 'R'], L: { to: [0.25, 0.22, 0.0], hand: 'flat', palm: [0, 1, 0], fingers: [1, 0, 0] }, R: 'lap' } } }); }
// debug views of H2b / H3b round the hold: from straight above, from his left side (along the line of her forearm), and
// from the other side (her thumb side)
{ const c = HER_R.palm;
  for (const [k, figs] of [['3', h3bFigs()], ['2', h2bFigs()]]) SHOTS.push(
    { id: `dbg_hb${k}_top`, lens: 50, pos: [c[0], c[1] + 0.55, c[2] - 0.01], target: c, hideParts: HHIDE, header: 'debug top', figs },
    { id: `dbg_hb${k}_side`, lens: 50, pos: [c[0] - 0.5, c[1] + 0.04, c[2] + 0.1], target: c, hideParts: HHIDE, header: 'debug side (little-finger side)', figs },
    { id: `dbg_hb${k}_side2`, lens: 50, pos: [c[0] + 0.5, c[1] + 0.06, c[2] - 0.12], target: c, hideParts: HHIDE, header: 'debug side (thumb side)', figs }); }
// v6 TRIAL (2026-11-27, Jade: "change the camera angle to an overhead shot so that we're seeing their hands from above"):
// overhead variants of H3b/H2b (palm texture on his left hand kept); separate ids, accepted guides untouched.
{ const tex = (f) => { f.firstLove19.skinTex = ['L']; return f; };
  for (const [tag, el, az, d] of [['ov88', 88, -40, 0.95], ['ov75', 75, -40, 0.95], ['ov75s', 75, -90, 0.95], ['ov88c', 88, -40, 0.55], ['ov75c', 75, -40, 0.55]]) {
    const cam = camAt([-0.09, 0.26, 0.01], az, el, d, 35);
    SHOTS.push(
      { id: `H3b_${tag}`, ...cam, hideParts: HHIDE, header: `H3b overhead trial el ${el} az ${az}`, figs: tex(h3bFigs()) },
      { id: `H2b_${tag}`, ...cam, hideParts: HHIDE, header: `H2b overhead trial el ${el} az ${az}`, figs: tex(h2bFigs()) });
  } }

// ======================================================================================================================
// 2026-11-27 PAINT-BACK trial (Jade: "(1) just his hand, overhead shot, confirm we get a normal looking hand, (2) paint his
// normal looking hand directly into the three.js model, (3) then put her hand on top of it, repeat"). Overhead camera (the
// ov88c trial, tightened on the hold), socks on all feet (Jade: the painters mangle bare feet), no palm texture (it read
// as extra finger segments); hand marks, solo light and pose as H3b / H2b.
//   P1_his     stage 1: his hand alone (her whole figure hidden), to be painted
//   P2_H3b     stage 2: H3b with stage 1's painting projected back onto his left hand, forearm and sleeve (engine paint.js)
//   P4_H2b     stage 4: H2b with the best H3b painting projected onto his left hand + arm AND her right hand + arm; his
//              covering right hand is plain 3D
//   P0_H3b / P0_H2b: the same camera with nothing painted (comparison)
const PAINT_DIR = '/assets/paint/fl_hands/';
export const PAINT = { stage1: PAINT_DIR + 'P1_his_best.png', stage3: PAINT_DIR + 'P3_H3b_best.png' };
await preloadPaint(Object.values(PAINT));
export const CAM_P = camAt([-0.145, 0.27, 0.06], -40, 88, 0.42, 35);
const SOCKS = { jade19: 0xc9c2b6, firstLove19: 0x3a3c42 };   // her: oatmeal grey; his: charcoal
// v2 of the paint-back (Jade: "a weird horn from an artifact in the stage 1 guide form"): his left thumb (HBX.himL: sweep
// 14, abd 2, flat against the index) folded the thenar / web skin into a spike, and from overhead the thumb continued the
// hand's edge in one tapering curve (a horn). A relaxed palm-up thumb falls a little away from the index, its pad
// turned up and in, the tip lightly bent (look-only refs). PB_THUMB is used in the P* shots only; the accepted H3b / H2b
// guides keep HBX.
export const PB_THUMB = { opp: 0, sweep: 42, abd: -10, mcp: 4, ip: 10 };
function ovFigs(f) { for (const [w, c] of Object.entries(SOCKS)) if (f[w]) f[w].costume = { ...f[w].costume, sock: c }; for (const w of Object.values(f)) delete w.skinTex;
  if (f.firstLove19?.L?.hand && typeof f.firstLove19.L.hand === 'object') f.firstLove19.L = { ...f.firstLove19.L, hand: { ...f.firstLove19.L.hand, thumb: PB_THUMB } };
  return f; }
const HIS_PAINT = { url: PAINT.stage1, hands: ['L'], limbs: { armL: 1 } };
SHOTS.push(
  { id: 'P0_H3b', ...CAM_P, hideParts: HHIDE, header: 'paint-back: H3b overhead, nothing painted', figs: ovFigs(h3bFigs()) },
  { id: 'P0_H2b', ...CAM_P, hideParts: HHIDE, header: 'paint-back: H2b overhead, nothing painted', figs: ovFigs(h2bFigs()) },
  { id: 'P1_his', ...CAM_P, hideParts: { jade19: ['all'], firstLove19: ['head'] }, header: 'paint-back stage 1: his left hand alone', figs: ovFigs(h3bFigs()) },
  { id: 'P2_H3b', ...CAM_P, hideParts: HHIDE, header: 'paint-back stage 2: his painted hand, her 3D hand on top', figs: (() => { const f = ovFigs(h3bFigs()); f.firstLove19.paint = HIS_PAINT; return f; })() },
  { id: 'P4_H2b', ...CAM_P, hideParts: HHIDE, header: 'paint-back stage 4: H3b painting on both, his covering right hand 3D', figs: (() => { const f = ovFigs(h2bFigs());
    f.firstLove19.paint = { url: PAINT.stage3, hands: ['L'], limbs: { armL: 1 } }; f.jade19.paint = { url: PAINT.stage3, hands: ['R'], limbs: { armR: 1 } }; return f; })() });

// ======================================================================================================================
// 2026-11-27 v3 GESTURE (Jade, for a start + end frame video: "her hand should overlap his at an angle when it comes into
// contact"; "her fingers would overlap his fingers, and he would gently rotate his wrist inward slightly as he closes his
// hand around hers and then puts the other hand on top"; "soft things slightly depress"). Same overhead paint-back camera.
//   S_*  START (H3b contact): her right hand lands across his open palm-up hand at an angle; his hand = v2 (P1_his_3 reused)
//   E_*  END (H2): his left fingers close round the little-finger edge of her hand, his wrist a little pronated, her hand
//        as in START, his right hand over the back of hers
export const V3 = {
  her: { to: [-0.148, 0.324, -0.052], fingers: [0.27, -0.15, 0.962] },   // START: her palm centre and finger direction: her fingers laid over his fingers, crossing them at an angle
};
function v3Start(h = V3.her) { const f = ovFigs(h3bFigs()); f.jade19.R = { ...f.jade19.R, to: h.to, fingers: nz(h.fingers), ...(h.hand ? { hand: h.hand } : {}) }; return f; }
SHOTS.push(
  { id: 'S0_H3b', ...CAM_P, hideParts: HHIDE, logHands: true, header: 'v3 START: her hand lands across his at an angle (nothing painted)', figs: v3Start() },
  { id: 'S2_H3b', ...CAM_P, hideParts: HHIDE, header: 'v3 START: his painted hand (P1_his_3), her 3D hand across it', figs: (() => { const f = v3Start(); f.firstLove19.paint = HIS_PAINT; return f; })() },
  { id: 'dbg_S0b', ...CAM_P, hideParts: HHIDE, header: 'v3 START alt (other angle)', figs: v3Start({ to: [-0.056, 0.285, -0.02], fingers: [-0.811, -0.12, 0.583] }) },
  { id: 'dbg_S0_side', lens: 50, pos: [-0.6, 0.33, 0.05], target: [-0.15, 0.28, 0.07], hideParts: HHIDE, header: 'debug side', figs: v3Start() });
// END: her hand slides into his palm, keeping START's angle; his left fingers close round her little-finger edge, his
// wrist pronated ~12 deg (palm turned toward his right), soft contact (a few mm); his right hand over the back of hers
V3.end = {
  her: { to: [-0.145, 0.322, 0.085], fingers: [0.27, 0, 0.962], thumb: { opp: 0, sweep: 40, abd: 0, mcp: 0, ip: 2 } },
  him: { to: [-0.15, 0.255, 0.1], palm: [0.718, 0.676, 0.167], fingers: [0.35, 0.05, -1],
    hand: { shape: 'palmUp', spread: 1, curl: { index: [34, 48, 26], middle: [38, 52, 28], ring: [42, 56, 30], little: [46, 60, 32] }, thumb: PB_THUMB } },
};
function v3End(o = V3.end) { const f = ovFigs(h3bFigs());
  f.jade19.R = { ...f.jade19.R, to: o.her.to, fingers: nz(o.her.fingers), ...(o.her.thumb ? { hand: { ...f.jade19.R.hand, thumb: o.her.thumb } } : {}) };
  f.firstLove19.L = { ...f.firstLove19.L, to: o.him.to, palm: nz(o.him.palm), fingers: nz(o.him.fingers), hand: o.him.hand, grasp: 'palmUnder' };
  return f; }
SHOTS.push(
  { id: 'E0_H2', ...CAM_P, hideParts: HHIDE, logHands: true, header: 'v3 END: his left hand closed round hers (nothing painted, no covering hand)', figs: v3End() },
  { id: 'E1_his', ...CAM_P, hideParts: { jade19: ['all'], firstLove19: ['head'] }, header: 'v3 END stage 1: his left hand alone, closing', figs: v3End() },
  { id: 'dbg_E0_side', lens: 50, pos: [-0.6, 0.33, 0.05], target: [-0.15, 0.28, 0.07], hideParts: HHIDE, header: 'debug side', figs: v3End() },
  { id: 'dbg_E0_nohim', ...CAM_P, hideParts: { firstLove19: ['head', 'handL'], jade19: ['head'] }, header: 'debug: her hand without his left hand', figs: v3End() },
  { id: 'dbg_E0_side2', lens: 50, pos: [0.3, 0.36, 0.2], target: [-0.15, 0.28, 0.07], hideParts: HHIDE, header: 'debug side 2', figs: v3End() });
// END + his right hand over the back of hers (COVER, in her END hand frame, measured from the solved hand: logHands)
export const HER_R_END = { palm: [-0.1441, 0.322, 0.087], dors: [0, 1, 0], fingers: [0.27, 0, 0.963], across: [0.989, 0, -0.145] };
V3.cover = { ...COVER, up: 0.043 };
function v3EndCover(c = V3.cover) { const f = v3End(), F = HER_R_END, d = nz(F.dors), a = nz(F.fingers), x = nz(F.across);
  const to = F.palm.map((p, i) => p + d[i] * c.up + a[i] * c.along + x[i] * c.across);
  const fing = nz(x.map((v, i) => -v + a[i] * (c.fa || 0) + d[i] * (c.fd || 0)));
  f.firstLove19.R = { to: to.map((v) => +v.toFixed(4)), hand: c.hand, palm: d.map((v) => -v), fingers: fing, ...(c.elbow ? { elbow: c.elbow } : {}), object: 'figure:jade19' };
  return f; }
const PAINT_V3 = { E1: PAINT_DIR + 'E1_his_best.png', E3: PAINT_DIR + 'E3_H2_best.png' };
await preloadPaint(Object.values(PAINT_V3));
SHOTS.push(
  { id: 'E2_H2', ...CAM_P, hideParts: HHIDE, header: 'v3 END stage 2: his painted closing hand, her 3D hand in it', figs: (() => { const f = v3End(); f.firstLove19.paint = { url: PAINT_V3.E1, hands: ['L'], limbs: { armL: 1 } }; return f; })() },
  { id: 'dbg_E0c_side', lens: 50, pos: [0.3, 0.36, 0.2], target: [-0.15, 0.3, 0.07], hideParts: HHIDE, header: 'debug side', figs: v3EndCover() },
  { id: 'dbg_E0c_side1', lens: 50, pos: [-0.6, 0.36, 0.05], target: [-0.15, 0.3, 0.07], hideParts: HHIDE, header: 'debug side', figs: v3EndCover() },
  { id: 'E0c_H2', ...CAM_P, hideParts: HHIDE, header: 'v3 END with his covering right hand (nothing painted)', figs: v3EndCover() },
  { id: 'E4_H2', ...CAM_P, hideParts: HHIDE, header: 'v3 END stage 4: E3 painting on his L + her R, his covering R hand 3D', figs: (() => { const f = v3EndCover();
    f.firstLove19.paint = { url: PAINT_V3.E3, hands: ['L'], limbs: { armL: 1 } }; f.jade19.paint = { url: PAINT_V3.E3, hands: ['R'], limbs: { armR: 1 } }; return f; })() });

// ======================================================================================================================
// 2026-11-27 v4 (Jade: "his lower hand should fold around hers, and her hand should bend at the fingers (gesture similar
// to what's seen in lindy hop or swing dance is the mid-state). and then his other hand covers on top of both").
//   M_*  MID: the swing hand-to-hand hook: his palm-up fingers fold up, her fingers bend at the joints and hook down
//        over his; her hand at START's angle, moved as little as possible
//   N_*  END (redo): MID + his right hand over both
export const V4 = {
  her: { to: [-0.137, 0.352, -0.014], fingers: [0.27, -0.15, 0.962], curl: { index: [30, 48, 26], middle: [32, 52, 28], ring: [34, 54, 28], little: [36, 56, 30] } },
  him: { palm: [0.718, 0.676, 0.167], curl: { index: [30, 44, 24], middle: [34, 48, 26], ring: [38, 52, 28], little: [42, 56, 30] } },
  cover: { up: 0.05, along: 0.035, across: 0.035 },
};
function v4Mid(o = V4) { const f = ovFigs(h3bFigs());
  f.jade19.R = { ...f.jade19.R, to: o.her.to, fingers: nz(o.her.fingers), hand: { ...f.jade19.R.hand, curl: o.her.curl } };
  f.firstLove19.L = { ...f.firstLove19.L, palm: nz(o.him.palm), hand: { ...f.firstLove19.L.hand, curl: o.him.curl, spread: 1 } };
  return f; }
SHOTS.push(
  { id: 'M0_H', ...CAM_P, hideParts: HHIDE, logHands: true, header: 'v4 MID: swing hook (nothing painted)', figs: v4Mid() },
  { id: 'M1_his', ...CAM_P, hideParts: { jade19: ['all'], firstLove19: ['head'] }, header: 'v4 MID stage 1: his left hand alone, folding', figs: v4Mid() },
  { id: 'dbg_M0_side', lens: 50, pos: [-0.6, 0.33, 0.0], target: [-0.15, 0.29, 0.02], hideParts: HHIDE, header: 'debug side', figs: v4Mid() },
  { id: 'dbg_M0_side2', lens: 50, pos: [0.3, 0.36, 0.15], target: [-0.15, 0.29, 0.02], hideParts: HHIDE, header: 'debug side 2', figs: v4Mid() },
  { id: 'dbg_M0_under', lens: 50, pos: [-0.25, 0.1, -0.25], target: [-0.15, 0.29, 0.02], hideParts: HHIDE, header: 'debug from below-front', figs: v4Mid() });
const PAINT_V4 = { M1: PAINT_DIR + 'M1_his_best.png', M3: PAINT_DIR + 'M3_H_best.png' };
await preloadPaint(Object.values(PAINT_V4));
// his covering right hand over both joined hands (COVER-style, in her MID hand frame, measured from M0_H's solved hand)
V4.herFrame = { palm: [-0.1357, 0.3519, -0.0122], dors: [-0.004, 1, 0.029], fingers: [0.451, -0.023, 0.892], across: [0.942, 0.013, -0.334] };
function v4End(c = { ...COVER, ...V4.cover }) { const f = v4Mid(), F = V4.herFrame, d = nz(F.dors), a = nz(F.fingers), x = nz(F.across);
  const to = F.palm.map((p, i) => p + d[i] * c.up + a[i] * c.along + x[i] * c.across);
  const fing = nz(x.map((v, i) => -v + a[i] * (c.fa || 0) + d[i] * (c.fd || 0)));
  f.firstLove19.R = { to: to.map((v) => +v.toFixed(4)), hand: c.hand, palm: d.map((v) => -v), fingers: fing, object: 'figure:jade19' };
  return f; }
SHOTS.push(
  { id: 'M2_H', ...CAM_P, hideParts: HHIDE, header: 'v4 MID stage 2: his painted folding hand, her 3D hand hooked in it', figs: (() => { const f = v4Mid(); f.firstLove19.paint = { url: PAINT_V4.M1, hands: ['L'], limbs: { armL: 1 } }; return f; })() },
  { id: 'N0_H', ...CAM_P, hideParts: HHIDE, header: 'v4 END: MID + his right hand over both (nothing painted)', figs: v4End() },
  { id: 'dbg_N0_side', lens: 50, pos: [-0.1, 0.4, -0.45], target: [-0.15, 0.29, 0.02], hideParts: HHIDE, header: 'debug side 2', figs: v4End() },
  { id: 'N4_H', ...CAM_P, hideParts: HHIDE, header: 'v4 END stage 4: MID painting on both, his covering right hand 3D', figs: (() => { const f = v4End();
    f.firstLove19.paint = { url: PAINT_V4.M3, hands: ['L'], limbs: { armL: 1 } }; f.jade19.paint = { url: PAINT_V4.M3, hands: ['R'], limbs: { armR: 1 } }; return f; })() });

// ======================================================================================================================
// 2026-11-27 v5 CLASP (Jade, with a look-only reference: a mutual finger clasp, hands meeting fingers to fingers, offset,
// not palm on palm; each hand's fingers wrap the other's; "the young wrist not being bent as much"; then his other hand
// "forms a sandwich on top"). From START: her hand stays at START's heading and nearly START's place, moved a little
// toward her little-finger... toward his little-finger edge so her curled fingers wrap down round the edge of his finger
// bundle; his fingers bend up under hers, their tips against her finger bases.
export const V5 = {
  her: { to: [-0.11, 0.333, -0.021], fingers: [0.27, -0.15, 0.962], curl: { index: [36, 58, 34], middle: [38, 60, 36], ring: [40, 62, 36], little: [42, 64, 38] } },
  him: { curl: { index: [12, 20, 10], middle: [14, 22, 12], ring: [16, 24, 12], little: [18, 26, 14] } },
  cover: { up: 0.05, along: 0.02, across: 0.035 },
};
function v5Mid(o = V5) { const f = ovFigs(h3bFigs());
  f.jade19.R = { ...f.jade19.R, to: o.her.to, fingers: nz(o.her.fingers), hand: { ...f.jade19.R.hand, curl: o.her.curl } };
  f.firstLove19.L = { ...f.firstLove19.L, hand: { ...f.firstLove19.L.hand, curl: o.him.curl } };
  return f; }
SHOTS.push(
  { id: 'C0_H', ...CAM_P, hideParts: HHIDE, logHands: true, header: 'v5 MID: finger clasp (nothing painted)', figs: v5Mid() },
  { id: 'C1_his', ...CAM_P, hideParts: { jade19: ['all'], firstLove19: ['head'] }, header: 'v5 MID stage 1: his left hand alone', figs: v5Mid() },
  { id: 'dbg_C0_a', lens: 50, pos: [0.25, 0.3, 0.25], target: [-0.11, 0.29, 0.0], hideParts: HHIDE, header: 'debug side (his little-finger side)', figs: v5Mid() },
  { id: 'dbg_C0_b', lens: 50, pos: [-0.5, 0.32, -0.15], target: [-0.11, 0.29, 0.0], hideParts: HHIDE, header: 'debug side (index side)', figs: v5Mid() });
V5.herFrame = { palm: [-0.1087, 0.3329, -0.0192], dors: [0.005, 0.998, 0.055], fingers: [0.458, -0.051, 0.888], across: [0.94, 0.014, -0.341] };
function v5End(c = { ...COVER, ...V5.cover }) { const f = v5Mid(), F = V5.herFrame, d = nz(F.dors), a = nz(F.fingers), x = nz(F.across);
  const to = F.palm.map((p, i) => p + d[i] * c.up + a[i] * c.along + x[i] * c.across);
  const fing = nz(x.map((v, i) => -v + a[i] * (c.fa || 0) + d[i] * (c.fd || 0)));
  f.firstLove19.R = { to: to.map((v) => +v.toFixed(4)), hand: c.hand, palm: d.map((v) => -v), fingers: fing, object: 'figure:jade19' };
  return f; }
const PAINT_V5 = { C1: PAINT_DIR + 'C1_his_best.png', C3: PAINT_DIR + 'C3_H_best.png' };
await preloadPaint(Object.values(PAINT_V5));
SHOTS.push(
  { id: 'C2_H', ...CAM_P, hideParts: HHIDE, header: 'v5 MID stage 2: his painted hand, her 3D hand clasping it', figs: (() => { const f = v5Mid(); f.firstLove19.paint = { url: PAINT_V5.C1, hands: ['L'], limbs: { armL: 1 } }; return f; })() },
  { id: 'D0_H', ...CAM_P, hideParts: HHIDE, header: 'v5 END: clasp + his right hand on top (sandwich), nothing painted', figs: v5End() },
  { id: 'D4_H', ...CAM_P, hideParts: HHIDE, header: 'v5 END stage 4: clasp painting on both, his covering right hand 3D', figs: (() => { const f = v5End();
    f.firstLove19.paint = { url: PAINT_V5.C3, hands: ['L'], limbs: { armL: 1 } }; f.jade19.paint = { url: PAINT_V5.C3, hands: ['R'], limbs: { armR: 1 } }; return f; })() });
