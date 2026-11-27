// AD_grab / AD_trace standing poses (r4b, 2026-11-26), as functions of the search parameters. Pure (no imports): used by
// shots.js (the page) and grab_search.mjs (node). Jade: "no one is kneeling, there's no time for that, it's an emergency
// to go-go-go get out alive. both people are standing."
// The child stands at the sill tracing the fern (right index on the pane, fernMid); Mama, standing, knees bent and bent
// forward at the hips, grabs the child's right forearm: a power grip round its middle (0.5 elbow -> wrist), hold.r = the
// sleeved forearm's radius as the fingers close on it, the palm turned `palm` deg from the top of the forearm toward the
// side she comes from (+z). Her left arm hangs (gravity) under its shoulder.
export const GRIP = (deg, r = 0.040) => ({ to: 'forearm:littleJade:R:0.5', hand: 'grip', palm: `to:forearmSide:littleJade:R:0.5:${deg}`,
  hold: { r, prop: false, centre: true, axis: 'to:forearm:littleJade:R:0.95' }, object: 'figure:littleJade:armR',
  grasp: { kind: 'forearm', of: 'littleJade:R', k: 0.5, from: 'above, her side', note: 'palm on the near top of the forearm, fingers round the far side and under, thumb round the near side' } });
// LIFT: the baked mesh soles sit ~13 mm under the engine's ankle-height floor (clipcheck: 11 mm into the floorboards); both
// figures are lifted the same, so the grip between them does not change
export const LIFT = 0.0155;
// r5 (Jade: AD_trace "reads as a thumbs-up, not a tracing finger"): the engine's `tip` option puts the INDEX FINGERTIP (not
// the palm centre) on fernMid, the finger laid 80 deg to the glass and 20 deg toward her right in it (trace_search.mjs:
// clip check pass, joints in range, wrist flex -49 / radial -7 / twist -31, the fingertip's pad 1.2 mm off the glass,
// i.e. touching it through the frost layer); index a little bent at the tip, the other three curled, thumb resting on the
// middle finger. Was: palm centre 8.5 cm short of fernMid, hand 'point' (the finger stood vertical: read as a thumbs-up).
// r6 (Jade: "maybe loosen the grip on the rest of the fist a bit"): the curled fingers 86-92/100/60 deg (the engine's
// 'point' fist) -> 58-66/66-74/36-42 (moderately curled, a loose hand), thumb relaxed (opp 0.7 mcp 30 ip 20 -> 0.55/16/12, still
// resting on the middle finger). The index and the fingertip on fernMid are unchanged. trace_preview.mjs variants a/b/c.
export const TRACE_R = { tip: { finger: 'index', at: 'fernMid', off: [0, 0, 0] }, hand: { shape: 'point', curl: { index: [6, 14, 10], middle: [58, 66, 36], ring: [62, 70, 40], little: [66, 74, 42] }, thumb: { opp: 0.55, mcp: 16, ip: 12 } }, fingers: [0.985, 0.163, 0.059], palm: [0.174, -0.925, -0.337] };
export const kidAtSill = (p) => ({ at: [p.cx, +(0.46 * 1.08 + LIFT).toFixed(4), p.cz], yaw: 90 + (p.cyaw || 0), legs: 'stand', spine: { bend: p.cbend }, head: { look: 'fernMid' },
  R: TRACE_R });
export const mamaGrab = (p) => { const hy = +(0.832 - p.drop + LIFT).toFixed(4), la = { to: 'self:shoulderL', off: [0, -0.5, 0], hand: 'relax', palm: 'in', fingers: 'down' };
  const sp = { at: [p.mx, hy, p.mz], yaw: p.yaw, legs: 'stand', spine: { bend: p.bend, twist: p.twist, side: p.side }, head: { look: 'littleJade:wristR' }, R: GRIP(p.palm, p.holdR), L: la };
  // ankles +4.5 mm: with the knees bent the soles sat 4 mm into the boards (clipcheck); the hips stay put
  if (p.drop > 0.005) { const a = -(hy - LIFT - 0.05) + 0.0045; sp.legOpts = { ankleL: [0.1, a, -0.03 + p.step], ankleR: [0.1, a, -0.03 - p.step] }; }
  return sp; };
// the solved pose (grab_search.mjs: runs 1-3, ~400 candidates; run 4, 70 candidates refined after the sole lift; the best
// with no penetration and every joint in range, and it still passes with each of cx / mx / mz / yaw / bend / drop nudged
// by 8-15 mm or 3 deg either way)
// r5: holdR 0.05 -> 0.052 with the new tracing arm (TRACE_R): clipcheck grip 7.8 mm into the sleeve, holdcheck contact 1.7 mm
export const GRAB_P = { holdR: 0.052, cx: 3.181, cz: -0.702, cbend: 9.2, cyaw: 13.8, mx: 3.03, mz: 0.039, yaw: 158.2, bend: 53.6, twist: 19.5, side: -9.1, drop: 0.106, step: -0.073, palm: 13.8 };
