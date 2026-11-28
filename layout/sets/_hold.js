// THE APPROVED HAND HOLD (Jade, 2026-11-27 19:40): the clip media/gen/hold_FINAL_AB1_MT3.mp4 = AB_1 (her right hand lands
// across his open left hand at an angle -> their fingers fold into a clasp) + MT_3 (his right hand slides in from the lower
// left and covers both). Start keyframe cast/first_love/_prompts/v10/takes_v3/S3_H3b_1 (guide fl_hands S2_H3b, pose V3.her).
// The clasp and the covering hand came from the video model, not from a 3D frame; their 3D pose (fl_hands V6, shots
// A0_clasp / A0_end) was matched to the clip's clasp frame (t 4.9 s) and its last frame by contour overlay from the clip's
// own camera (fl_hands CAM_P), then cleared with clipcheck (grip contact 2.4 mm) and side debug views.
//
// ONE source for every use (fl_hands V6 + D sheet studies 2/3, closet02 CL_hands / CL_ots): the joint values below, in
// fl_hands world coordinates, where he sits at FL_HIM (hips, yaw 180) with the hold on his LEFT knee and she at FL_HER.
// Another set moves the whole cluster rigidly with HIS body (holdArms(dx, dz)): his arms keep exactly these targets and
// joint values (the hold stays on his left knee); only her arm root differs, and her arm IK reaches from her own seat.
// (The two sets both have him at yaw 180, so a translation is enough; a set with another yaw needs a rotation too.)
const nz = (a) => { const l = Math.hypot(...a); return a.map((x) => +(x / l).toFixed(4)); };
export const FL_HIM = { at: [0.2, 0.5], yaw: 180 }, FL_HER = { at: [-0.2, -0.5], yaw: 0 };
export const HOLD = {
  // her right hand: palm centre, finger heading (START's heading, V3.her), clasp curl; thumb along the index (V3.end)
  her: { to: [-0.125, 0.359, -0.008], fingers: [0.27, -0.15, 0.962], palm: 'down',
    hand: { shape: 'relax', spread: 3, curl: { index: [26, 40, 20], middle: [28, 44, 22], ring: [30, 46, 22], little: [32, 48, 24] }, thumb: { opp: 0, sweep: 40, abd: 0, mcp: 0, ip: 2 } } },
  // his left hand: palm up under hers, wrist pronated ~12 deg (palm normal), fingers closing round her hand, thumb lifted
  // over the back of her hand; elbow out over his thigh (fl_hands HBX.himL)
  him: { to: [-0.133, 0.247, 0.044], palm: [0.718, 0.676, 0.167], fingers: [0.35, 0.05, -1], elbow: [-0.5, -0.8, 0.1], grasp: 'palmUnder',
    hand: { shape: 'palmUp', spread: 1, curl: { index: [26, 40, 20], middle: [30, 44, 22], ring: [34, 48, 24], little: [38, 52, 26] }, thumb: { opp: 0.3, sweep: 25, abd: 45, mcp: 20, ip: 25 } } },
  // his trunk turned toward the hold so his right hand reaches it (fl_hands HB.spine)
  himSpine: { bend: 36, twist: 30, side: -12 },
  // her right hand as SOLVED (logHands of A0_clasp): the frame the covering hand is placed in
  herFrame: { palm: [-0.127, 0.359, -0.011], dors: [-0.005, 0.9996, 0.028], fingers: [0.4522, -0.0224, 0.8916], across: [0.892, 0.017, -0.452] },
  // his right (covering) hand in that frame: palm centre up / along (toward her fingertips) / across (toward her thumb);
  // fingers = fa * along + fx * across - fd * dors (toward her wrist, a little toward her little-finger side, a light drape)
  cover: { up: 0.025, along: 0.07, across: -0.01, fa: -1, fx: -0.5, fd: 0.1,
    hand: { shape: 'relax', spread: 1, curl: { index: [6, 12, 6], middle: [8, 14, 6], ring: [10, 16, 8], little: [12, 18, 8] }, thumb: { opp: 0.05 } } },
};
// arm specs for the three hands, the cluster moved rigidly by (dx, dz) in the floor plane and dy up (a set where the
// other knees are in the way lifts the whole cluster; the frame for the covering hand moves with it)
export function holdArms(dx = 0, dz = 0, h = HOLD, dy = 0) {
  const m = (p) => [+(p[0] + dx).toFixed(4), +(p[1] + dy).toFixed(4), +(p[2] + dz).toFixed(4)];
  const F = h.herFrame, d = nz(F.dors), a = nz(F.fingers), x = nz(F.across), c = h.cover;
  const cto = F.palm.map((p, i) => p + d[i] * c.up + a[i] * c.along + x[i] * c.across);
  return {
    herR: { to: m(h.her.to), hand: h.her.hand, palm: h.her.palm, fingers: nz(h.her.fingers) },
    himL: { to: m(h.him.to), hand: h.him.hand, palm: nz(h.him.palm), fingers: nz(h.him.fingers), elbow: h.him.elbow, grasp: h.him.grasp, object: 'figure:jade19' },
    himR: { to: m(cto), hand: c.hand, palm: d.map((v) => -v), fingers: nz(a.map((v, i) => v * c.fa + x[i] * c.fx - d[i] * c.fd)), object: 'figure:jade19' },
    himSpine: h.himSpine,
  };
}
