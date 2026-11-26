// Grasp templates (2026-11-26): how a hand takes an object, as data, so the object is held (fingers round it or the palm
// under its weight), not placed beside the hand. Independent of the figure's geometry: a template turns an object's
// frame into arm specs for the pose solver (buildFigure's arm API: to / palm / fingers / hand / hold / tip), and back
// (objectFromHand: where the object sits in a SOLVED hand, so props are placed from the hand, never floating). The arm
// IK then reaches the hand pose with the natural-wrist rule (engine/wrist.js). Check the result with
// engine/holdcheck.mjs (Rapier). Wired into the shots by the hold pass (2026-11-26): graspArms tags each arm with `grasp` and `object`.
//
// Object frame: { centre: [x,y,z], axis: [x,y,z] (long axis: handle, spine, sheet edge), up: [x,y,z] (away from gravity or
//   the object's top), size: [along axis, across, thickness] (m), at?: contact point }. Hand frame (engine/hand.js):
//   t = thumb side, f = fingers, n = out of the palm; palm centre P.hand<L|R>; Lh = hand length.
//
// API
//   GRASPS                                  the template table (name -> { use, hands, shape, note })
//   graspArms(name, obj, { Lh, side, toward }) -> { L?, R? } arm specs   (toward: world point the figure stands at, used to
//                                            choose which way round the hand goes so the wrist stays natural)
//   objectFromHand(name, hand, obj)          -> { centre, axis } of the object in a solved hand (hand = P.hands[n] plus
//                                            palm: P.hand<n>, Lh)
const v = (a) => [a[0], a[1], a[2]];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); };
const PALM_T = 0.064;   // palm surface to the palm centre, in hand lengths (engine/mannequin.js hold.centre)
const SQ = 0.0012;      // m the pads / palm press into what they hold (engine/hand.js SQUEEZE)

export const GRASPS = {
  power: { use: 'cylindrical power grip round a handle / bottle / rail', hands: 1, shape: 'grip', note: 'handle across the palm along the thumb side; fingers wrap it' },
  mugHandle: { use: 'mug by its handle', hands: 1, shape: 'grip', note: 'index and middle through the handle, thumb on its top, the mug body beyond the knuckles on the thumb side' },
  pinch: { use: 'small object or an edge between thumb and index pads', hands: 1, shape: 'pinch', note: 'index tip on the contact point, thumb opposite' },
  paperEdge: { use: 'a sheet held at its edge', hands: 1, shape: 'pinch', note: 'pads on both faces of the sheet, fingers square to the edge, the sheet hanging / standing from the hand' },
  palmUnder: { use: 'flat object carried on the palm (plate, book)', hands: 1, shape: 'flat', note: 'palm up under the centre of mass' },
  twoHandsBelow: { use: 'book / box / folded cloth carried in both hands from below', hands: 2, shape: 'cup', note: 'palms up under the two side edges, thumbs over the top' },
  twoHandsSides: { use: 'box / stack held at its sides', hands: 2, shape: 'flat', note: 'palms pressing in on the two side faces, fingers forward / down' },
  restOn: { use: 'a hand resting on an object that rests on furniture (a hand on a book on the table, steadying a sheet)', hands: 1, shape: 'relax', note: 'palm down on the top face; the furniture carries the object, the hand only touches it' },
  tipOn: { use: 'a fingertip on a point of an object (tapping a key, pointing at a line, pressing a button)', hands: 1, shape: 'point', note: 'the index pad on the point, the object rests on its own support' },
  shoulderSeams: { use: 'a garment held up by its shoulder seams', hands: 2, shape: 'pinch', note: 'each hand pinches one shoulder seam, the garment hangs below between them' },
};

// arm specs for a template. obj in world; opts.Lh hand length (m), opts.side 'L' | 'R' for one-hand grips
export function graspArms(name, obj, opts = {}) {
  const out = graspArms0(name, obj, opts);
  // tag every arm with the template and the object (engine/main.js holdsFor checks these hands against that object)
  for (const k of Object.keys(out)) { out[k].grasp = name; if (obj.label) out[k].object = obj.label; }
  return out;
}
function graspArms0(name, obj, opts) {
  const T = GRASPS[name]; if (!T) throw new Error('no grasp ' + name);
  const Lh = opts.Lh ?? 0.18, C = v(obj.centre), ax = norm(obj.axis || [1, 0, 0]), up = norm(obj.up || [0, 1, 0]);
  const across = norm(cross(up, ax)), [sx = 0.1, sy = 0.1, sz = 0.03] = obj.size || [];
  const at = obj.at ? v(obj.at) : C, side = opts.side || 'R';
  switch (name) {
    case 'power': { const r = obj.r ?? sy / 2; const toward = opts.toward ? norm(sub(opts.toward, at)) : across;
      // palm faces the handle from the figure's side; the cylinder's centre is the arm target (hold.centre)
      return { [side]: { to: at, hand: 'grip', palm: toward.map((x) => -x), hold: { r, prop: false, centre: true, axis: ax } } }; }
    case 'mugHandle': { const r = obj.handleR ?? 0.006;
      return { [side]: { to: at, hand: { shape: 'grip', curl: { ring: [80, 95, 60], little: [85, 95, 60] } }, palm: across.map((x) => -x), hold: { r, prop: false, centre: true, axis: up } } }; }
    case 'pinch': { const gap = Math.max(0, (obj.thick ?? 0) - SQ);
      return { [side]: { tip: { finger: 'index', at }, hand: { shape: 'pinch', thumb: { gap } }, fingers: obj.fingers || up.map((x) => -x), palm: across } }; }
    case 'paperEdge': { // the sheet's face normal points at the index pad; the thumb pad on the other face, gap = the sheet's thickness
      // (hold-fix 2026-11-26: the pinch closed pad-to-pad THROUGH the paper / clipboard). obj.thick (m), default 0.3 mm
      const nrm = norm(obj.normal || cross(ax, up)), th = obj.thick ?? 0.0003, Lr = 0.045 * Lh;   // Lr: index distal pad radius
      return { [side]: { tip: { finger: 'index', at, off: nrm.map((x) => x * (th / 2 + Lr - SQ / 2)) }, hand: { shape: 'pinch', thumb: { gap: Math.max(0, th - SQ) } }, palm: obj.palm || nrm.map((x) => -x), fingers: obj.fingers || up.map((x) => -x) } }; }
    case 'palmUnder': return { [side]: { to: add(C, up, -(sz / 2 + PALM_T * Lh - SQ)), hand: 'flat', palm: up, fingers: obj.fingers || ax } };
    case 'twoHandsBelow': { const e = sy / 2 - 0.02;
      const dn = -(sz / 2 + PALM_T * Lh - SQ);
      return { L: { to: add(add(C, across, e), up, dn), hand: 'cup', palm: up, fingers: across.map((x) => -x) },
        R: { to: add(add(C, across, -e), up, dn), hand: 'cup', palm: up, fingers: across } }; }
    case 'twoHandsSides': { const e = sy / 2 + PALM_T * Lh - SQ;
      return { L: { to: add(C, across, e), hand: 'flat', palm: across.map((x) => -x), fingers: ax }, R: { to: add(C, across, -e), hand: 'flat', palm: across, fingers: ax } }; }
    case 'restOn': { const top = add(at, up, obj.at ? 0 : sz / 2);
      return { [side]: { to: add(top, up, PALM_T * Lh - SQ), hand: obj.hand || 'relax', palm: up.map((x) => -x), fingers: obj.fingers || ax } }; }
    case 'tipOn': { const Lr = 0.045 * Lh;
      return { [side]: { tip: { finger: obj.finger || 'index', at: add(at, up, Lr - SQ) }, hand: obj.hand || 'point', palm: obj.palm || up.map((x) => -x), fingers: obj.fingers || ax } }; }
    case 'shoulderSeams': { const a = obj.seamL, b = obj.seamR; if (!a || !b) throw new Error('shoulderSeams needs obj.seamL / seamR');
      return { L: { tip: { finger: 'index', at: a }, hand: 'pinch', fingers: up.map((x) => -x), palm: across }, R: { tip: { finger: 'index', at: b }, hand: 'pinch', fingers: up.map((x) => -x), palm: across.map((x) => -x) } }; }
  }
  return {};
}

// where the object sits in a solved hand (for placing props FROM the hand). hand: { palm: [x,y,z], t, f, n (arrays or
// Vector3), Lh, tips?: { index, thumb } }
export function objectFromHand(name, hand, obj = {}) {
  const A = (p) => (Array.isArray(p) ? p : [p.x, p.y, p.z]);
  const P = A(hand.palm), t = A(hand.t), f = A(hand.f), n = A(hand.n), Lh = hand.Lh ?? 0.18;
  switch (name) {
    case 'power': case 'mugHandle': { const r = obj.r ?? 0.015; return { centre: add(add(P, f, 0.12 * Lh), n, PALM_T * Lh + r), axis: t }; }
    case 'pinch': case 'paperEdge': case 'shoulderSeams': { const a = A(hand.tips.index), b = A(hand.tips.thumb); return { centre: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], axis: t }; }
    case 'palmUnder': case 'twoHandsBelow': return { centre: add(P, n, PALM_T * Lh * 0.4 + (obj.size?.[2] ?? 0.03) / 2), axis: f };
    case 'twoHandsSides': return { centre: add(P, n, PALM_T * Lh * 0.35 + (obj.size?.[1] ?? 0.2) / 2), axis: f };
  }
  return null;
}
