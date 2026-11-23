// LAP STORYTIME (v3): one pose and eight camera setups shared by attic88 (Mama + little Jade) and bed26 (Jade + the
// daughter). The mother sits with her legs out in a loose V; the child sits between them, back against her chest,
// facing the same way; the mother's arms come round the child and hold the open book in front of both.
// Everything is defined in the mother's frame (fwd = where she faces, left = her left), so the two rooms get the same
// lens, distance and framing: J4 is a split screen of the two pairs.
import { V } from './core.js';

const R = Math.PI / 180;
export function lapFrame(base, yaw) {
  const f = [Math.sin(yaw * R), Math.cos(yaw * R)], l = [Math.cos(yaw * R), -Math.sin(yaw * R)];
  return { f, l, at: (a, b) => [base[0] + l[0] * a + f[0] * b, base[1] + l[1] * a + f[1] * b],            // (left, fwd) -> [x, z]
    at3: (a, y, b) => [base[0] + l[0] * a + f[0] * b, y, base[1] + l[1] * a + f[1] * b] };
}
// { mother, child: figure keys; base: [x, z] of the mother's pelvis; yaw; floor: height of what they sit on; Hm, Hc }
export function lapPose({ mother, child, base, yaw, floor, Hm, Hc }, o = {}) {
  const F = lapFrame(base, yaw);
  const m = { at: [base[0], floor + 0.08 * Hm, base[1]], legs: 'lapV', yaw, spine: { bend: 9, side: -4 }, head: { look: 'book:G', tilt: -6 },
    // the light-side (left) hand supports the book from underneath at its lower corner, elbow low, so her forearm does not shadow the page
    L: { to: 'book:LOB', hand: 'palmUp', palm: 'up', elbow: 'down', off: [0.0, -0.02, 0.03] }, R: { to: 'book:ROB', hand: 'palmUp', palm: 'up', elbow: 'down', off: [0.0, -0.02, 0.03] }, ...(o.mother || {}) };
  const [cx, cz] = F.at(o.childSide ?? -0.07, o.childFwd ?? 0.2);
  const c = { at: [cx, floor + 0.08 * Hc + 0.012, cz], legs: 'long', yaw, spine: { bend: -3 }, head: { look: 'book:G' },
    L: { to: 'book:LB', hand: 'relax', palm: 'down', off: [0, 0.018, 0] }, R: { to: 'book:RB', hand: 'relax', palm: 'down', off: [0, 0.018, 0] }, ...(o.child || {}) };
  const book = { state: 'open', on: child, anchor: 'hip', off: [-(o.childSide ?? -0.07), 0.19, 0.26], tilt: 36, v: 4, roll: o.bookRoll ?? -7, ...(o.book || {}) };
  return { figs: { [mother]: m, [child]: c }, book, frame: F };
}
// the eight setups. m, c = figure keys.
export function lapCameras(m, c) {
  const mid = { mid: [`${m}:eyes`, `${c}:eyes`] };
  return {
    LAP_front: { lens: 40, orbit: { at: mid, relBody: m, az: 6, el: 8, dist: 1.95 }, aim: [mid, 0.5, 0.37], focus: [m, c],
      header: 'LAP front two-shot: both faces above the book' },
    LAP_34: { lens: 32, orbit: { at: mid, relBody: m, az: 40, el: 8, dist: 1.55 }, aim: [mid, 0.5, 0.37], focus: [m, c],
      header: 'LAP three-quarter two-shot from the light side' },
    LAP_ots: { lens: 35, orbit: { at: `${m}:head`, relBody: m, az: 97, el: 46, dist: 0.42 }, aim: ['book:G', 0.46, 0.54], levelBook: 0.6,
      header: "LAP over the mother's shoulder onto the spread (start of the push)" },
    LAP_ots_push_end: { lens: 35, push: { from: 'LAP_ots', fill: 0.40 }, hideParts: { [c]: ['head'], [m]: ['head'] }, near: 0.05, header: 'LAP push end: the spread fills the frame (camera has passed the child\'s head)' },
    LAP_child_cu: { lens: 85, orbit: { at: `${c}:eyes`, relBody: m, az: 6, el: 3, dist: 1.15 }, aim: [`${c}:eyes`, 0.5, 0.46], focus: [c],
      header: "LAP child close-up (mother's chin and shoulder soft above)" },
    LAP_mother_cu: { lens: 85, orbit: { at: `${m}:eyes`, relBody: m, az: 6, el: 5, dist: 1.35 }, aim: [`${m}:eyes`, 0.5, 0.36], focus: [m],
      header: "LAP mother close-up (top of the child's head at the bottom of frame)" },
    LAP_profile: { lens: 35, orbit: { at: mid, relBody: m, az: -90, el: 3, dist: 1.35 }, aim: [mid, 0.45, 0.4],
      header: 'LAP profile two-shot (mother leans to the page)' },
    LAP_hands: { lens: 50, orbit: { at: 'book:G', relBody: m, az: 180, el: 87, dist: 1.05 }, aim: ['book:G', 0.5, 0.41],
      header: 'LAP hands: top-down onto the spread, both pairs of hands' },
  };
}
// push-end camera: square on to the spread (on its normal through the gutter midpoint), at the distance where `fill`
// metres of page span the frame width. The move from the over-shoulder start swings onto this normal as it pushes in.
export function pushEnd(startPos, book, lens, fill) {
  const G = book.anchors.G.clone(); const dist = (fill / 2) / (18 / lens); const s = V(startPos).sub(G);
  const swing = Math.acos(Math.min(1, s.clone().normalize().dot(book.n))) * 180 / Math.PI;
  return { pos: G.clone().addScaledVector(book.n, dist).toArray().map((v) => +v.toFixed(4)), target: G.toArray().map((v) => +v.toFixed(4)), dist, swing, startDist: s.length() };
}

// camera roll (deg) that turns the frame so the page's top edge is up: k = 1 levels the spread fully, 0.5 half way
export function levelRoll(pos, target, book, k = 1) {
  const f = V(target).sub(V(pos)).normalize(); const up = V(0, 1, 0); const r = f.clone().cross(up).normalize(); const uc = r.clone().cross(f).normalize();
  return +(k * Math.atan2(-book.w.dot(r), book.w.dot(uc)) * 180 / Math.PI).toFixed(2);
}
