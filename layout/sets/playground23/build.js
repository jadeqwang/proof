// Build one playground23 shot (r4 rebuild, 2026-11-26): an indoor space-themed play centre, the soft-play shuttle, the
// girl and the boy climbing in with Jade's and Dad's hands, the accent spot's shaft and the mote. See layout.js.
//   shot.beamMask (twins beam_<id>): flat mode renders the lit volume white on black = the beam mask
//   shot.hideFigs: the plate (same camera, the figures built for the eye-line but not drawn)
import { HUMAN } from '../../engine/humanMesh.js';
import * as THREE from 'three';
import { mk, box, cyl, ball, limb, tag, V } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { CAST, PROP, addCast } from '../_cast.js';
import { artPlane, artLook, decalMesh } from '../_art.js';
import { coneSolid, beamMesh, beamWire, beamSidecar, applyBeamMask } from '../_beam.js';
import { HALL, SHUTTLE, SEATS, RAMP, STEP, ROCKET, ASTRONAUT, PEOPLE, HANDS_MEET, SPOT, SPOT_DIR, MOTE, FIXTURES, LIGHTS, STRUCT, PLANETS, rad } from './layout.js';
import { floorArt, FLOOR_M, muralArt, planetArt, sweaterArt, SWEATER_M, chestArt, dressArt, DRESS_M, bodyArt, bodyU, dadHairArt, pixelBottleArt, catBottleArt, jadeOutfitArt, JADE_CHART, sleevePatchArt } from './art.js';
import { loadProps, prop } from '../_props.js';
await loadProps(['backpack', 'kids_bottle']);

// ---------------------------------------------------------------- cast (set-local; the shared table is not edited)
// The girl (4) and the boy (7): Jade's own heights (moongazing character bible): 1.09 m and 1.32 m. Their designs are
// the canonical sheets OUTSIDE this public repo (referenced by absolute path in NOTES.md, never copied here).
// The boy: a young-looking 7-year-old who happens to be very tall (99th percentile), head ~20% larger than typical.
addCast({
  girl: { name: 'the girl (4)', h: 1.09, kind: 'child4', skin: 0xf0c8a8, hair: 0x6a4228, top: 0xf4b8c0, legs: 0xf0c8a8, sock: 0xf4f2ee, hairStyle: 'pigtails', sleeves: 'short', dress: true },
  boy: { name: 'the boy (7)', h: 1.32, kind: 'boy7', skin: 0xecc4a2, hair: 0x18120e, top: 0x1f4a9a, legs: 0x1c2444, sock: 0xdcdcd6, hairStyle: 'short', sleeves: 'long' },   // r5 (Jade): in socks (colour not given: light grey, FLAGGED)
}, { boy7: { ...PROP.child7, head: 0.192, hand: 0.104 } });   // a 7-year-old's proportions scaled to 1.32 m, the head ~20% bigger (5.2 heads tall)
// Dad in 2023 (about 67): the shared `dad` key with a per-shot costume (hair near-black, as his reference photo; Jade)
// r5 (Jade): "he's typically wearing a white polo shirt and black pants"; hair salt-and-pepper, white at the temples
// (the base colour below is the flecked mid tone; dadHair() paints the canonical salt-and-pepper skin over it). Shoes: dark
// (not described: FLAGGED). The polo collar and placket are added by poloCollar().
export const DAD23 = { body: 'dad23', hair: 0x4a4642, top: 0xf4f4f0, legs: 0x18181a, sock: 0x1c1c1e, sleeves: 'short' };

const PAD = (col) => ({ grey: 0.6, col }), BLACK = { grey: 0.1, col: 0x16161a }, NAVY = { grey: 0.18, col: 0x1a1f3a };
const NET = { glass: true, col: 0x101014, opacity: 0.55, noCast: true, grey: 0.15 }, ACRYL = { glass: true, col: 0xcfe6f4, opacity: 0.14, noCast: true };
const LED = (c) => ({ grey: 1, col: c, emit: c, flatEmit: 0.9, noCast: true });

// ---------------------------------------------------------------- the hall
function hall(g) {
  const f = mk(new THREE.PlaneGeometry(FLOOR_M, FLOOR_M), { noCast: true, ...artLook(floorArt(), { grey: 0.35, col: 0x1b1f4a }) }); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, -1.5); f.receiveShadow = true;
  g.add(tag(f, 'padded vinyl play floor (printed orbits, planets, stars)'));
  const W = HALL.x1 - HALL.x0, D = HALL.z1 - HALL.z0, Hh = HALL.deckY;
  g.add(tag(box(W, Hh, 0.2, NAVY, [0, Hh / 2, HALL.z0 - 0.1]), 'back wall (dark navy)'));
  { const m = artPlane(muralArt(), 13, 6.5, { grey: 0.4, col: 0x25124a }); m.position.set(-0.5, 0.2 + 3.25, HALL.z0 + 0.01); g.add(tag(m, 'space mural (back wall): nebula, ringed planet, rocket')); }
  for (const x of [HALL.x0 - 0.1, HALL.x1 + 0.1]) g.add(tag(box(0.2, Hh, D, NAVY, [x, Hh / 2, (HALL.z0 + HALL.z1) / 2]), 'side wall (dark navy)'));
  g.add(tag(box(W, 0.1, D, BLACK, [0, Hh + 0.05, (HALL.z0 + HALL.z1) / 2]), 'roof deck (painted black)'));
  // open-web steel joists, painted black, every 1.5 m, spanning front to back
  const J = { grey: 0.12, col: 0x1a1a1e, noCast: true };
  for (let x = HALL.x0 + 0.75; x < HALL.x1; x += HALL.joistDZ) {
    for (const y of [HALL.joistY, Hh - 0.06]) g.add(tag(box(0.08, 0.06, D, J, [x, y, (HALL.z0 + HALL.z1) / 2]), 'open-web steel joist (black)'));
    for (let z = HALL.z0 + 0.3, k = 0; z < HALL.z1 - 0.6; z += 0.6, k++) g.add(tag(limb(V(x, HALL.joistY, z), V(x, Hh - 0.06, z + 0.6), 0.012, J), 'open-web steel joist (black)'));
  }
  // round LED high-bays on pendant rods
  for (const p of FIXTURES) {
    g.add(tag(cyl(0.012, 0.012, HALL.joistY - p[1], { grey: 0.2, col: 0x2a2a2e, noCast: true }, [p[0], (HALL.joistY + p[1]) / 2, p[2]]), 'high-bay pendant rod'));
    g.add(tag(cyl(0.2, 0.24, 0.09, { grey: 0.3, col: 0x3a3c42, noCast: true }, [p[0], p[1] + 0.045, p[2]]), 'round LED high-bay (housing)'));
    g.add(tag(cyl(0.2, 0.2, 0.01, { ...LED(0xf2f6ff), only: undefined }, [p[0], p[1] - 0.005, p[2]]), 'round LED high-bay (lit lens)'));
  }
}

// ---------------------------------------------------------------- the soft-play structure (behind the shuttle)
function structure(g) {
  const S = STRUCT, cols = [0xe8642a, 0x8ac43a, 0x2a6ad8, 0xf2c23a];
  const xs = []; for (let x = S.x0; x <= S.x1 + 1e-6; x += S.bay) xs.push(x); const zs = []; for (let z = S.z1; z >= S.z0 - 1e-6; z -= S.bay * 1.2) zs.push(z);
  xs.forEach((x, i) => zs.forEach((z) => { g.add(tag(cyl(0.11, 0.11, S.roof + 0.3, PAD(cols[i % cols.length]), [x, (S.roof + 0.3) / 2, z], null, 16), 'padded post (foam over steel)')); }));
  const W = S.x1 - S.x0, D = S.z1 - S.z0, cx = (S.x0 + S.x1) / 2, cz = (S.z0 + S.z1) / 2;
  for (const y of S.levels.slice(1)) { g.add(tag(box(W, 0.1, D, { grey: 0.3, col: 0x2a2e48 }, [cx, y, cz]), 'deck (padded, dark underside)'));
    g.add(tag(box(W, 0.06, 0.06, LED(0x40e0ff), [cx, y + 0.08, S.z1 + 0.04]), 'LED strip (deck edge, cyan)')); }
  g.add(tag(box(W, 0.12, D, { grey: 0.35, col: 0x3a3e60 }, [cx, S.roof, cz]), 'structure roof canopy'));
  g.add(tag(box(W, 0.05, 0.05, LED(0xff4adf), [cx, S.roof - 0.08, S.z1 + 0.04]), 'LED strip (roof edge, magenta)'));
  // front face: black safety netting in most bays, clear acrylic panels on the middle level of three bays
  for (let i = 0; i < xs.length - 1; i++) for (let l = 0; l < S.levels.length; l++) {
    const x0 = xs[i] + 0.11, x1 = xs[i + 1] - 0.11, y0 = S.levels[l] + 0.12, y1 = (S.levels[l + 1] ?? S.roof) - 0.06;
    const acr = l === 1 && i % 2 === 1, pts = [V(x0, y1, S.z1), V(x1, y1, S.z1), V(x1, y0, S.z1), V(x0, y0, S.z1)];
    const geo = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[2], pts[0], pts[2], pts[3]]); geo.computeVertexNormals();
    const m = mk(geo, acr ? ACRYL : NET); m.userData.double = true; g.add(tag(m, acr ? 'clear acrylic panel (play structure)' : 'black safety netting'));
    if (acr) g.add(tag(box(x1 - x0, 0.03, 0.03, LED(0x40e0ff), [(x0 + x1) / 2, y1, S.z1 + 0.02]), 'LED strip (acrylic panel top)'));
  }
  // a yellow wave slide down the front from the middle level, and a blue tube slide spiralling off the top
  { const a = V(-3.4, S.levels[2], S.z1 + 0.1), b = V(-3.4, 0.25, S.z1 + 3.0), w = 1.1, n = b.clone().sub(a).normalize();
    const side = V(1, 0, 0), up = new THREE.Vector3().crossVectors(n, side).normalize();
    const pts = [a.clone().addScaledVector(side, -w / 2), a.clone().addScaledVector(side, w / 2), b.clone().addScaledVector(side, w / 2), b.clone().addScaledVector(side, -w / 2)];
    const geo = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[2], pts[0], pts[2], pts[3]]); geo.computeVertexNormals(); const m = mk(geo, PAD(0xf2c23a)); m.userData.double = true; g.add(tag(m, 'wave slide (yellow)'));
    for (const s of [-1, 1]) g.add(tag(limb(a.clone().addScaledVector(side, s * w / 2).addScaledVector(up, 0.12), b.clone().addScaledVector(side, s * w / 2).addScaledVector(up, 0.12), 0.06, PAD(0xe8642a)), 'wave slide rail (padded)'));
    g.add(tag(box(w + 0.4, 0.25, 0.8, PAD(0x2a6ad8), [-3.4, 0.125, S.z1 + 3.3]), 'slide run-out mat')); }
  { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40, ang = t * Math.PI * 1.4; pts.push(V(2.7 + 0.9 * Math.cos(ang), S.roof - t * (S.roof - 0.5), S.z1 - 1.0 + 0.9 * Math.sin(ang) + t * 1.4)); }
    const tube = mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.38, 18, false), { grey: 0.55, col: 0x2a8ad8 }); tube.userData.double = true; g.add(tag(tube, 'tube slide (blue)')); }
}

// ---------------------------------------------------------------- the play shuttle (r5: rebuilt to Jade's photo, see layout.js)
const H = SHUTTLE;
// the body's cross-section: a rounded box (flat bottom on the floor, big rounded top corners), as [dz, y] points
// sampled evenly by arc length, starting at the bottom centre and going round the +z side first
function section(half, y0, y1, n = 72) {
  const h = y1 - y0, rt = Math.min(0.24, 0.45 * h, 0.9 * half), rb = Math.min(0.05, 0.3 * h, 0.5 * half), pts = [];
  const arc = (cx, cy, r, a0, a1, k = 10) => { for (let i = 0; i <= k; i++) { const a = a0 + (a1 - a0) * i / k; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  pts.push([0, y0]); arc(half - rb, y0 + rb, rb, -Math.PI / 2, 0); arc(half - rt, y1 - rt, rt, 0, Math.PI / 2, 16);
  arc(-(half - rt), y1 - rt, rt, Math.PI / 2, Math.PI, 16); arc(-(half - rb), y0 + rb, rb, Math.PI, 1.5 * Math.PI); pts.push([0, y0]);
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const out = []; for (let i = 0; i <= n; i++) { const s = L[L.length - 1] * i / n; let j = 1; while (j < L.length - 1 && L[j] < s) j++;
    const t = (s - L[j - 1]) / ((L[j] - L[j - 1]) || 1); out.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * t, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * t]); }
  return out;
}
// the body + nose as one loft along x: constant section from x0 to x1, then the nose narrows, its chin lifts and its
// top drops to a rounded point. UV: u along x (BODY_U), v = angle round the section centre (0 bottom, 0.25 the +z
// side, 0.5 top), so the skin (art.js bodyArt) can paint the windscreen band and the black belly.
// r6: the loft starts at the cabin's front wall (cabin.x1): the closed nose cowl, its back face capped flat (the cabin's
// front wall); the open cabin behind it is cabinGeo()
function bodyGeo() {
  const st = []; const nB = 8, nN = 28, xs = H.cabin.x1;
  for (let i = 0; i <= nB; i++) st.push({ x: xs + (H.x1 - xs) * i / nB, half: H.half, y0: 0, y1: H.top });
  for (let i = 1; i <= nN; i++) { const t = i / nN, yb = 0.16 * t * t, yt = H.top - (H.top - 0.46) * Math.pow(t, 1.4), m = (yb + yt) / 2, hh = (yt - yb) / 2 * Math.sqrt(Math.max(0, 1 - Math.pow(t, 6)));
    st.push({ x: H.x1 + H.nose * t, half: Math.max(0.0005, H.half * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.5)))), y0: m - Math.max(hh, 0.0005), y1: m + Math.max(hh, 0.0005) }); }
  const N = 72, pos = [], uv = [], idx = [];
  for (const S of st) { const sec = section(S.half, S.y0, S.y1, N), cy = (S.y0 + S.y1) / 2;
    sec.forEach(([dz, y], j) => { pos.push(S.x, y, H.z + dz); let a = Math.atan2(dz, -(y - cy)) / (2 * Math.PI); if (a < 0) a += 1; if (j === N) a = 1; if (j === 0) a = 0; uv.push(bodyU(S.x), a); }); }
  for (let i = 0; i < st.length - 1; i++) for (let j = 0; j < N; j++) { const a = i * (N + 1) + j, b = a + N + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  orient(pos, idx, 0, idx.length, [0, -1, 0]);   // the first triangle is on the belly: its normal points down
  // the flat back cap (a fan round the section's centre): normal -x, into the cabin
  { const c = pos.length / 3, S = st[0]; pos.push(S.x, (S.y0 + S.y1) / 2, H.z); uv.push(bodyU(S.x), 0.3); const i0 = idx.length;
    for (let j = 0; j < N; j++) idx.push(c, j, j + 1); orient(pos, idx, i0, idx.length, [-1, 0, 0]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// flip triangles [i0, i1) if the first one's normal does not point along `out` (all of them wound alike)
function orient(pos, idx, i0, i1, out) {
  const P = (k) => V(pos[3 * k], pos[3 * k + 1], pos[3 * k + 2]), a = P(idx[i0]), b = P(idx[i0 + 1]), c = P(idx[i0 + 2]);
  const n = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)); if (n.dot(V(out)) >= 0) return;
  for (let t = i0; t < i1; t += 3) { const k = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = k; }
}
// r6 the open-topped cabin (Jade: "hollowed out ... the way it does in the photo"): ONE closed solid (so clipcheck reads
// it as a solid), the body's own outer section below the rim, a flat rim, the inner wall = the section inset by the wall
// thickness, the padded floor; from just inside the rear section to just inside the nose cowl. UVs: the outer skin as
// bodyGeo (the belly band continues), the inner walls and rim white, the floor black (bodyArt's belly band).
function cabinGeo() {
  const C = H.cabin, t = C.wall, x0 = C.x0 - 0.02, x1 = C.x1 + 0.01;
  // the section's two sides below the rim, each from the bottom centre up to the rim (interpolated exactly)
  const sides = (sec, rim) => { const up = (arr) => { const out = [arr[0]]; for (let i = 1; i < arr.length; i++) { const p = arr[i], q = arr[i - 1];
      if (p[1] <= rim) { out.push(p); continue; } const k = (rim - q[1]) / (p[1] - q[1]); out.push([q[0] + (p[0] - q[0]) * k, rim]); break; } return out; };
    return [up(sec), up(sec.slice().reverse())]; };
  const [oP, oM] = sides(section(H.half, 0, H.top, 144), C.rim), [iP, iM] = sides(section(H.half - t, C.floor, H.top - t, 144), C.rim);
  const outer = oP.slice().reverse().concat(oM.slice(1)), inner = iM.slice().reverse().concat(iP.slice(1));   // +z rim -> belly -> -z rim; -z rim -> floor -> +z rim
  const pos = [], uv = [], idx = [], cy = H.top / 2;
  const uvOuter = ([dz, y]) => { let a = Math.atan2(dz, -(y - cy)) / (2 * Math.PI); if (a < 0) a += 1; return a; };
  const uvInner = ([dz, y]) => (y < C.floor + 0.004 && Math.abs(dz) < H.half - t - 0.04 ? 0.02 : 0.3);
  const strip = (chain, vf) => { const b = pos.length / 3; for (const x of [x0, x1]) for (const p of chain) { pos.push(x, p[1], H.z + p[0]); uv.push(bodyU(x), vf(p)); }
    const m = chain.length; for (let i = 0; i < m - 1; i++) { const a0 = b + i, a1 = a0 + 1, b0 = a0 + m, b1 = b0 + 1; idx.push(a0, a1, b1, a0, b1, b0); } };
  const s0 = idx.length; strip(outer, uvOuter); strip([outer[outer.length - 1], inner[0]], () => 0.3); strip(inner, uvInner); strip([inner[inner.length - 1], outer[0]], () => 0.3);
  orient(pos, idx, s0, idx.length, [0, 0, 1]);   // the outer strip's first quad is on the +z side just under the rim: its normal points +z
  // the end caps (the U-shaped profile, triangulated)
  const poly = outer.concat(inner), tri = THREE.ShapeUtils.triangulateShape(poly.map(([z, y]) => new THREE.Vector2(z, y)), []);
  for (const [x, out] of [[x0, -1], [x1, 1]]) { const b = pos.length / 3, i0 = idx.length; for (const p of poly) { pos.push(x, p[1], H.z + p[0]); uv.push(bodyU(x), 0.3); }
    for (const f of tri) idx.push(b + f[0], b + f[1], b + f[2]); orient(pos, idx, i0, idx.length, [out, 0, 0]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// r6 a black padded bucket seat (as the photo's): a cushion and a tall back with a rounded top, one side profile in x-y
// extruded across the seat's width (bevelled: soft padded edges); faces the nose (+x)
function seatGeo(seat) {
  const S = SEATS, b = 0.02, f = H.cabin.floor + b, bx = seat.x, bt = S.t, cx1 = seat.x1, ct = S.cushionTop, top = S.top, r = bt / 2 - b, s = new THREE.Shape();
  s.moveTo(bx + b, f); s.lineTo(cx1 - b, f); s.lineTo(cx1 - b, ct - b - 0.04); s.quadraticCurveTo(cx1 - b, ct - b, cx1 - b - 0.04, ct - b); s.lineTo(bx + bt - b, ct - b);
  s.lineTo(bx + bt - b, top - b - r); s.absarc(bx + bt / 2, top - b - r, r, 0, Math.PI, false); s.lineTo(bx + b, f);
  return new THREE.ExtrudeGeometry(s, { depth: S.w - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, curveSegments: 16 });
}
// a panelled wing: a padded black wedge (top face from the body edge down to the outer edge), three white panels inset
// in black frames on its top face, running down the slope (the photo's black-and-white panelled ramp)
function wing(sg, W, name) {
  const T = [V(W.x0, W.yTop, W.zTop), V(W.x1, W.yTop, W.zTop), V(W.xOut1, W.yOut, W.zOut), V(W.xOut0, W.yOut, W.zOut)];
  const Bt = T.map((p) => V(p.x, 0, p.z)), Q = [...T, ...Bt];
  const F = [[0, 1, 2], [0, 2, 3], [4, 6, 5], [4, 7, 6], [0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2], [2, 6, 7], [2, 7, 3], [3, 7, 4], [3, 4, 0]];
  const pos = []; for (const f of F) for (const k of f) pos.push(Q[k].x, Q[k].y, Q[k].z);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
  const m = mk(geo, PAD(0x18181c)); m.userData.double = true; sg.add(tag(m, `${name} (black padded frame)`));
  const nrm = new THREE.Vector3().crossVectors(T[1].clone().sub(T[0]), T[3].clone().sub(T[0])).normalize(); if (nrm.y < 0) nrm.negate();
  const fr = 0.05, n = W.panels || 3;
  for (let k = 0; k < n; k++) { const s0 = k / n, s1 = (k + 1) / n, L = (a, b, t) => a.clone().lerp(b, t);
    const p = [L(T[0], T[1], s0), L(T[0], T[1], s1), L(T[3], T[2], s1), L(T[3], T[2], s0)];
    // inset by the frame: toward the panel's centre
    const c = p.reduce((acc, q) => acc.add(q), V(0, 0, 0)).multiplyScalar(0.25);
    const ins = p.map((q) => { const d = c.clone().sub(q); const l = d.length(); return q.clone().addScaledVector(d, Math.min(fr * 1.4, l * 0.4) / l).addScaledVector(nrm, 0.012); });
    const g2 = new THREE.BufferGeometry().setFromPoints([ins[0], ins[1], ins[2], ins[0], ins[2], ins[3]]); g2.computeVertexNormals();
    const pm = mk(g2, { grey: 0.88, col: 0xf2f2ee }); pm.userData.double = true; sg.add(tag(pm, `${name} (white padded panel ${k + 1})`)); }
}
function shuttle(g) {
  const sg = new THREE.Group(); g.add(sg);
  const WHITE = { grey: 0.88, col: 0xf2f2ee };
  // r6: the nose cowl (closed) + the open-topped cabin + two black bucket seats (solids: no `double`, outward winding)
  sg.add(tag(mk(bodyGeo(), artLook(bodyArt(), WHITE)), 'play shuttle nose cowl (closed, windscreen band)'));
  sg.add(tag(mk(cabinGeo(), artLook(bodyArt(), WHITE)), 'play shuttle cabin (open-topped padded tub: walls, rim, black padded base)'));
  SEATS.list.forEach((st, k) => { const m = mk(seatGeo(st), PAD(0x18181c)); m.position.z = H.z + st.dz - (SEATS.w - 0.04) / 2; sg.add(tag(m, `cabin seat ${k + 1} (black padded bucket seat)`)); });
  // the rear section: taller, a crawl-through arch across it (z), black slanted stripes on its rounded top
  { const R = H.rear, A = R.arch, s = new THREE.Shape(), rc = 0.3;
    s.moveTo(R.x0, 0); s.lineTo(R.x1, 0); s.lineTo(R.x1, R.top - rc); s.absarc(R.x1 - rc, R.top - rc, rc, 0, Math.PI / 2, false); s.lineTo(R.x0 + rc, R.top); s.absarc(R.x0 + rc, R.top - rc, rc, Math.PI / 2, Math.PI, false); s.lineTo(R.x0, 0);
    const h = new THREE.Path(), aw = A.w / 2; h.moveTo(A.cx - aw, 0.0); h.lineTo(A.cx + aw, 0.0); h.lineTo(A.cx + aw, A.h - aw); h.absarc(A.cx, A.h - aw, aw, 0, Math.PI, false); h.lineTo(A.cx - aw, 0.0); s.holes.push(h);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 2 * H.half - 0.06, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 24 });
    const m = mk(geo, WHITE); m.position.z = H.z - H.half + 0.03; m.userData.double = true; sg.add(tag(m, 'play shuttle rear section (crawl-through arch)'));
    for (let k = 0; k < 4; k++) { const x = R.x0 + 0.33 + k * 0.17, st = box(0.07, 0.016, 0.62, BLACK, [x, R.top + 0.035, H.z]); st.rotation.y = 0.45; sg.add(tag(st, 'rear section stripes (black)')); }
    sg.add(tag(box(R.x1 - R.x0 + 0.06, 0.07, 2 * H.half + 0.04, BLACK, [(R.x0 + R.x1) / 2, 0.035, H.z]), 'rear section base band (black)')); }
  // the camera-side wing = the ramp; the far wing lies flat on the floor
  wing(sg, RAMP, 'panelled wing ramp');
  wing(sg, { x0: RAMP.x0, x1: RAMP.x1, xOut0: RAMP.xOut0, xOut1: RAMP.xOut1, zTop: H.z - H.half, yTop: 0.1, zOut: H.z - H.half - 0.85, yOut: 0.08, panels: 3 }, 'panelled wing (far side, flat)');
  // the black padded block: the boy's step
  sg.add(tag(box(STEP.x1 - STEP.x0, STEP.h, STEP.z1 - STEP.z0, PAD(0x18181c), [(STEP.x0 + STEP.x1) / 2, STEP.h / 2, (STEP.z0 + STEP.z1) / 2]), 'black padded block (step)'));
  return sg;
}
// set dressing from the photo: a soft-play rocket (red and white bands, white nose cone, red fins) and a hanging astronaut
function rocket(g) {
  const R = ROCKET, [x, z] = R.at, n = 6;
  for (let k = 0; k < n; k++) g.add(tag(cyl(R.r, R.r, R.body / n, PAD(k % 2 ? 0xf2f2ee : 0xd8302a), [x, R.body * (k + 0.5) / n, z], null, 32), 'soft-play rocket (padded bands)'));
  g.add(tag(cyl(0.02, R.r, R.cone, PAD(0xf2f2ee), [x, R.body + R.cone / 2, z], null, 32), 'soft-play rocket nose cone'));
  g.add(tag(ball(0.07, PAD(0xd8302a), [x, R.body + R.cone, z]), 'soft-play rocket nose tip'));
  for (let k = 0; k < 3; k++) { const a = k * 2 * Math.PI / 3 + 0.5, s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.38, -0.05); s.lineTo(0.38, 0.25); s.lineTo(0, 0.7); s.closePath();
    const m = mk(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }), PAD(0xd8302a)); m.position.set(x + Math.cos(a) * R.r * 0.9, 0.05, z + Math.sin(a) * R.r * 0.9); m.rotation.y = -a; g.add(tag(m, 'soft-play rocket fin')); }
  { const m = mk(new THREE.CircleGeometry(0.15, 32), { grey: 0.25, col: 0x2a3a6a }); m.position.set(x, 1.3, z + R.r + 0.005); g.add(tag(m, 'soft-play rocket porthole')); }
}
function astronaut(g) {   // a generic hanging astronaut (white suit, dark visor, no character, no patch), drifting pose
  const A = ASTRONAUT, [x, y, z] = A.at, k = A.h / 0.9, W = { grey: 0.88, col: 0xeeeef0 }, a = new THREE.Group(); a.position.set(x, y, z); a.rotation.set(0.3, -0.6, 0.35); g.add(a);
  a.add(tag(ball(0.17 * k, W, [0, 0.12 * k, 0], [1, 1.25, 0.85]), 'hanging astronaut (suit)'));
  a.add(tag(ball(0.13 * k, W, [0, 0.42 * k, 0]), 'hanging astronaut (helmet)'));
  a.add(tag(ball(0.095 * k, { grey: 0.12, col: 0x1a2a3a }, [0, 0.42 * k, 0.06 * k], [1, 0.8, 0.7]), 'hanging astronaut (visor)'));
  a.add(tag(box(0.22 * k, 0.26 * k, 0.1 * k, W, [0, 0.16 * k, -0.15 * k]), 'hanging astronaut (life-support pack)'));
  for (const s of [-1, 1]) { a.add(tag(limb(V(s * 0.15 * k, 0.24 * k, 0), V(s * 0.34 * k, 0.36 * k, 0.05 * k), 0.05 * k, W), 'hanging astronaut (arm)'));
    a.add(tag(limb(V(s * 0.08 * k, -0.08 * k, 0), V(s * 0.16 * k, -0.42 * k, 0.12 * k), 0.06 * k, W), 'hanging astronaut (leg)')); }
  g.add(tag(cyl(0.004, 0.004, HALL.joistY - y - 0.5 * k, { grey: 0.2, col: 0x333333, noCast: true }, [x, (HALL.joistY + y + 0.5 * k) / 2, z], null, 5), 'astronaut hanging cable'));
}

// ---------------------------------------------------------------- hanging planets, the spot
function planets(g) {
  for (const p of PLANETS) { const m = mk(new THREE.SphereGeometry(p.r, 48, 32), artLook(planetArt(p.skin), { grey: 0.5, col: 0x6a3ab0 })); m.position.set(...p.at); g.add(tag(m, `hanging planet (${p.skin})`));
    g.add(tag(cyl(0.004, 0.004, HALL.joistY - p.at[1] - p.r, { grey: 0.2, col: 0x333333, noCast: true }, [p.at[0], (HALL.joistY + p.at[1] + p.r) / 2, p.at[2]], null, 5), 'planet hanging cable'));
    if (p.ring) { const r = mk(new THREE.RingGeometry(p.r * 1.3, p.r * 1.8, 64), { grey: 0.75, col: 0xf2e0b0 }); r.position.set(...p.at); r.rotation.set(-Math.PI / 2 + 0.4, 0, 0.3); r.userData.double = true; g.add(tag(r, 'hanging planet ring')); } }
}
function spotFixture(g) {
  const a = V(SPOT.at), d = V(SPOT_DIR), body = mk(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 20), BLACK);
  body.position.copy(a).addScaledVector(d, -0.16); body.quaternion.setFromUnitVectors(V(0, 1, 0), d); g.add(tag(body, 'accent spot (black can)'));
  const lens = mk(new THREE.CircleGeometry(0.085, 24), LED(0xfff1d8)); lens.position.copy(a).addScaledVector(d, 0.002); lens.lookAt(a.clone().add(d)); lens.userData.double = true; g.add(tag(lens, 'accent spot lens (lit)'));
  g.add(tag(limb(V(a.x, HALL.joistY, a.z), a.clone().addScaledVector(d, -0.16), 0.015, BLACK), 'accent spot clamp and yoke'));
}

// ---------------------------------------------------------------- prints on the children's clothes
function cylUV(mesh, centre, period) {   // cylindrical UVs round the figure's vertical axis, metres / period
  const p = mesh.geometry.attributes.position, uv = new Float32Array(p.count * 2), v = new THREE.Vector3(); mesh.updateMatrixWorld();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld); const a = Math.atan2(v.x - centre.x, v.z - centre.z); uv[2 * i] = a * 0.16 / period; uv[2 * i + 1] = v.y / period; }
  mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
function dressPrints(figs) {
  const put = (who, art, period) => { const f = figs[who]; if (!f) return; const P = f.userData.P;
    f.traverse((o) => { if (!o.isMesh || !o.userData.garment || !/(torso|skirt|band)$/.test(o.userData.idGroup || '')) return; cylUV(o, P.hip || P.pelvis || f.position, period); o.userData.look = { ...o.userData.look, art: art.art, artGrey: art.artGrey, artEdge: art.artEdge }; }); };
  put('girl', dressArt(), DRESS_M); put('boy', sweaterArt(), SWEATER_M);
  // the boy's chest motif: ONE ringed planet + ONE rocket (chestArt), conformed to his torso by raycast (as mv10)
  const f = figs.boy; if (!f) return; const P = f.userData.P; f.updateMatrixWorld(true);
  if (!P.shoulderC || !P.cx) return;
  const hitM = []; f.traverse((m) => { const gg = m.userData?.idGroup; if (m.isMesh && gg && gg.endsWith('torso')) hitM.push(m); });
  const rc = new THREE.Raycaster();
  const surf = (u, v, d) => { const o = P.shoulderC.clone().addScaledVector(P.cy, v).addScaledVector(P.cx, u).addScaledVector(P.cz, 0.3); rc.set(o, P.cz.clone().negate()); rc.far = 0.5;
    const h = rc.intersectObjects(hitM, false)[0]; if (!h) return null; const n = h.face.normal.clone().transformDirection(h.object.matrixWorld); if (n.dot(P.cz) < 0) n.negate(); return h.point.clone().addScaledVector(n, d); };
  const w = 0.2, h = 0.1, u0 = -w / 2, v0 = -0.13, c = surf(0, -0.08, 0.004);
  if (c) { const m = decalMesh(chestArt(), (s, t) => surf(u0 + s * w, v0 + t * h, 0.004) || c, { grey: 0.8, col: 0xf4f2ee }); m.userData.who = 'boy'; m.userData.idGroup = 'boy:motif'; f.add(tag(m, 'the boy: sweater motif (one ringed planet, one rocket)')); }
}
// Dad's 2023 glasses: thin rectangular semi-rimless (a top bar over each lens, clear lenses, thin temples to the ears)
function glasses(fig) {
  const P = fig.userData.P; if (!P?.eyes || !P.headX) return; const g = new THREE.Group(), K = { grey: 0.35, col: 0x4a4a50, noCast: true }, L = { glass: true, col: 0xdfe8f0, opacity: 0.12, noCast: true };
  const X = P.headX.clone().normalize(), Up = P.headUp.clone().normalize(), F = P.headFwd.clone().normalize(), c = P.eyes.clone().addScaledVector(F, 0.016);
  for (const s of [-1, 1]) { const lc = c.clone().addScaledVector(X, s * 0.032), tl = lc.clone().addScaledVector(X, -0.025).addScaledVector(Up, 0.014), tr = lc.clone().addScaledVector(X, 0.025).addScaledVector(Up, 0.014);
    g.add(limb(tl, tr, 0.0018, K)); const q = [tl, tr, tr.clone().addScaledVector(Up, -0.03), tl.clone().addScaledVector(Up, -0.03)];
    const geo = new THREE.BufferGeometry().setFromPoints([q[0], q[1], q[2], q[0], q[2], q[3]]); geo.computeVertexNormals(); const m = mk(geo, L); m.userData.double = true; g.add(m);
    const hinge = lc.clone().addScaledVector(X, s * 0.03).addScaledVector(Up, 0.012); g.add(limb(hinge, hinge.clone().addScaledVector(F, -0.095).addScaledVector(Up, -0.012), 0.0015, K)); }
  g.add(limb(c.clone().addScaledVector(X, -0.008).addScaledVector(Up, 0.012), c.clone().addScaledVector(X, 0.008).addScaledVector(Up, 0.012), 0.0015, K));
  g.traverse((o) => { if (o.isMesh) { o.userData.who = 'dad'; o.userData.idGroup = 'dad:glasses'; } }); fig.add(tag(g, 'Dad: thin rectangular semi-rimless glasses'));
}

// ---------------------------------------------------------------- Dad in 2023 (r5): hair, polo collar, backpack, bottles
// the salt-and-pepper hair: one canonical skin (art.js dadHairArt) mapped round his head
function dadHair(fig) {
  const P = fig.userData.P; if (!P?.head || !P.headFwd) return; const a = dadHairArt();
  const F = P.headFwd.clone().normalize(), U = P.headUp.clone().normalize(), X = new THREE.Vector3().crossVectors(U, F).normalize();
  fig.updateMatrixWorld(true);
  fig.traverse((o) => { if (!o.isMesh || !/hair$/.test(o.userData.idGroup || '') || o.userData.who === 'dad:glasses') return;
    const pos = o.geometry.attributes.position, uv = new Float32Array(pos.count * 2), v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); const d = v.clone().sub(P.head);
      const dn = d.clone().normalize(), th = Math.acos(THREE.MathUtils.clamp(dn.dot(U), -1, 1));   // angle from the crown
      uv[2 * i] = 0.5 + Math.atan2(d.dot(X), d.dot(F)) / (2 * Math.PI); uv[2 * i + 1] = THREE.MathUtils.clamp(1 - th / (0.75 * Math.PI), 0, 1); }
    o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); o.userData.look = { ...o.userData.look, art: a.art, artGrey: a.artGrey, artEdge: a.artEdge }; });
}
// Jade in 2023 (r5): her chaosmonkey "rare earth" outfit as ONE canonical chart (art.js jadeOutfitArt) over her top and
// trouser garments and the clothed body regions under them: u = angle round her torso axis, v = height along it
function jadeOutfit(fig) {
  const P = fig.userData.P; if (!P?.hip || !P.shoulderC) return;
  const Ax = P.shoulderC.clone().sub(P.hip), hs = Ax.length(); Ax.normalize();
  const F = P.fwd.clone().addScaledVector(Ax, -P.fwd.dot(Ax)).normalize(), L = new THREE.Vector3().crossVectors(Ax, F).normalize();   // L: her left
  const art = jadeOutfitArt(Math.round(hs * 200) / 200); fig.updateMatrixWorld(true);
  fig.traverse((o) => { if (!o.isMesh) return; const r = o.userData.bodyRegion, gid = o.userData.idGroup || '';
    const wear = o.userData.garment ? /(torso|band|legL|legR)$/.test(gid) : ['top', 'band', 'legsL', 'legsR'].includes(r); if (!wear) return;
    const pos = o.geometry.attributes.position, uv = new Float32Array(pos.count * 2), v = new THREE.Vector3();
    const w = new THREE.Vector3(), segD = (p, a, b) => { const ab = b.clone().sub(a), t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1); return [p.distanceTo(a.clone().addScaledVector(ab, t)), t * ab.length()]; };
    for (let i = 0; i < pos.count; i++) { w.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); v.copy(w).sub(P.hip);
      let h = v.dot(Ax);
      // a sleeve: its height in the chart is the shoulder height minus the distance down the arm, so the arm band sits at
      // the chest band's distance below the shoulder whatever the arm does (and a sleeve is never painted as midriff)
      if (/torso|band/.test(gid) || r === 'top' || r === 'band') for (const n of ['L', 'R']) { const S = P['shoulder' + n], E = P['elbow' + n], Hd = P['hand' + n]; if (!S || !E || !Hd) continue;
        if (Math.abs(v.dot(L)) < 0.11) continue; const [d1, t1] = segD(w, S, E), [d2, t2] = segD(w, E, Hd);
        if (Math.min(d1, d2) < 0.075) { h = Math.max(0.22, hs - (d1 <= d2 ? t1 : S.distanceTo(E) + t2)); break; } }
      uv[2 * i] = 0.5 + Math.atan2(v.dot(L), v.dot(F)) / (2 * Math.PI); uv[2 * i + 1] = (h - JADE_CHART.h0) / (JADE_CHART.h1 - JADE_CHART.h0); }
    o.geometry = o.geometry.clone(); o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    o.userData.look = { ...o.userData.look, art: art.art, artGrey: art.artGrey, artEdge: art.artEdge }; });
}
// her left sleeve patch: one decal (art.js sleevePatchArt), 8 cm across, on the outer side of her left upper arm at the
// arm band, laid onto the sleeve by raycasts along the arm's outward normal (so it reads round seen side-on)
function sleevePatch(fig) {
  const P = fig.userData.P, S = P?.shoulderL, E = P?.elbowL; if (!S || !E) return null;
  const A = E.clone().sub(S).normalize(), O = P.cx.clone().addScaledVector(A, -P.cx.dot(A)).normalize(), T = new THREE.Vector3().crossVectors(A, O).normalize();
  const C = S.clone().addScaledVector(A, 0.13), D = 0.08, hitM = [];
  fig.updateMatrixWorld(true); fig.traverse((m) => { if (m.isMesh && (m.userData.garment ? /torso$/.test(m.userData.idGroup || '') : m.userData.bodyRegion === 'top')) hitM.push(m); });
  const rc = new THREE.Raycaster();
  const surf = (s, t) => { const o = C.clone().addScaledVector(T, (s - 0.5) * D).addScaledVector(A, -(t - 0.5) * D).addScaledVector(O, 0.2); rc.set(o, O.clone().negate()); rc.far = 0.3;
    const h = rc.intersectObjects(hitM, false)[0]; if (!h) return null; return h.point.clone().addScaledVector(O, 0.003); };
  const c0 = surf(0.5, 0.5); if (!c0) return null;
  const m = decalMesh(sleevePatchArt(), (s, t) => surf(s, t) || c0, { grey: 0.85, col: 0xf2f0ea }, 64); m.userData.who = 'jade'; m.userData.idGroup = 'jade:patch';
  fig.add(tag(m, 'Jade: sleeve patch (round, blank, black ring)'));
  return { centre: c0, outward: O };
}
// r5 (Jade): the rare earth outfit's colours (the chart paints the details); r6 (Jade): "Socks": white socks, confirmed (was: sneakers, adults keeping shoes on beside the
// shuttle: FLAGGED), long black hair as built
export const JADE23 = { top: 0xf2f0ea, band: 0xf2f0ea, legs: 0x232a52, sock: 0xf0f0ec };
// the polo: a soft folded collar round the neck base, open at the front over a short placket (white, as the shirt)
function poloCollar(fig) {
  const P = fig.userData.P; if (!P?.shoulderC || !P.cx) return; const W = { grey: 0.9, col: 0xf4f4f0 };
  const X = P.cx.clone(), Y = P.cy.clone(), Z = P.cz.clone(), c0 = P.shoulderC.clone().addScaledVector(Y, 0.035).addScaledVector(Z, -0.012);
  const rx = 0.074, rz = 0.066, pts = [], n = 28, a0 = 0.35, a1 = 2 * Math.PI - 0.35;   // angle 0 = the front (open there)
  const ring = (r, y, out) => { const row = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, d = X.clone().multiplyScalar(Math.sin(a) * (rx + out)).addScaledVector(Z, Math.cos(a) * (rz + out));
    row.push(c0.clone().add(d).addScaledVector(Y, y)); } return row; };
  const rows = [ring(0, 0.03, 0.004), ring(0, 0.0, 0.016), ring(0, -0.022, 0.034)];   // the fold: up the neck, then down onto the shoulders
  const pos = []; for (let k = 0; k < rows.length - 1; k++) for (let i = 0; i < n; i++) { const A = rows[k][i], B = rows[k][i + 1], C = rows[k + 1][i + 1], D = rows[k + 1][i]; for (const q of [A, B, C, A, C, D]) pos.push(q.x, q.y, q.z); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
  const m = mk(geo, W); m.userData.double = true; m.userData.who = 'dad'; m.userData.idGroup = 'dad:collar'; fig.add(tag(m, 'Dad: white polo shirt (collar)'));
}
// the backpack (a real downloaded model, recoloured plain black; no logo) worn on both shoulders, and the two kids'
// bottles standing in its side pockets, each with its one canonical decal
function cylUVLocal(mesh) {   // u round the bottle's own y axis, v up its height
  const p = mesh.geometry.attributes.position; mesh.geometry.computeBoundingBox(); const bb = mesh.geometry.boundingBox, cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2, h = bb.max.y - bb.min.y || 1;
  const uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[2 * i] = 0.5 + Math.atan2(p.getX(i) - cx, p.getZ(i) - cz) / (2 * Math.PI); uv[2 * i + 1] = (p.getY(i) - bb.min.y) / h; }
  mesh.geometry = mesh.geometry.clone(); mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
export const PACK = { scale: 0.9, down: 0.47, back: 0.255 };   // fitted by eye + clipcheck (see NOTES)
function backpack(fig) {
  const P = fig.userData.P; if (!P?.shoulderC || !P.cx) return null;
  const bag = prop('backpack', { look: { grey: 0.1, col: 0x1c1c20 }, lookPart: { buckles: { grey: 0.2, col: 0x2e2e32 }, trims: { grey: 0.15, col: 0x26262a } }, label: 'Dad: black laptop backpack (no logo)', scale: PACK.scale });
  if (!bag) return null;
  const X = P.cx.clone().negate(), Y = P.cy.clone(), Z = P.cz.clone().negate(); bag.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  bag.position.copy(P.shoulderC).addScaledVector(P.cy, -PACK.down).addScaledVector(P.cz, -PACK.back);
  bag.traverse((o) => { if (o.isMesh) o.userData.who = 'dad:pack'; });
  fig.add(bag);
  const bottles = [['pixel', pixelBottleArt(), 1, 'kids water bottle (black and green pixel blocks)', 0x1e1e1e], ['cat', catBottleArt(), -1, 'kids water bottle (pink, cat face)', 0xf06aa8]];
  for (const [k, art, side, label, lidCol] of bottles) {
    const b = prop('kids_bottle', { label: 'Dad: ' + label, lookPart: { lid: { grey: 0.3, col: lidCol }, lid_clip: { grey: 0.3, col: lidCol } } }); if (!b) continue;
    b.traverse((o) => { if (o.isMesh && o.name === 'body') { cylUVLocal(o); o.userData.look = { grey: 0.5, col: 0xffffff, art: art.art, artGrey: art.artGrey, artEdge: art.artEdge }; } if (o.isMesh) o.userData.who = 'dad:pack'; });
    b.position.set(side * 0.155, 0.05, 0.02); b.rotation.set(0, side * 0.3, side * -0.08); bag.add(b);
    b.scale.setScalar(1 / PACK.scale);   // the bag is scaled; the bottles keep their real size
  }
  return bag;
}

export const NAMED = { mote: MOTE.hero, moteExit: MOTE.exit, moteAfter: MOTE.after, spot: SPOT.at,
  meetJade: HANDS_MEET.jade_girl, meetDad: HANDS_MEET.dad_boy,
  // r5 climb targets: the children's look points (up the ramp / along the top), the free hands on the body's top corner
  girlLook: [0.05, 0.7, -1.35], boyLook: [-0.7, 0.68, -1.5],
  girlHandOn: [0.0, 0.527, -0.95],   /* 2026-11-27 y 0.52 -> 0.527: the fingertips (skin now to the tip pad) were 7 mm into the rim */ boyHandOn: [-0.62, 0.546, -1.09] };   // palm centres ~1.5 cm over the ramp / (r6) the cabin's rim
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p);

let PATCH = null;
export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const world = new THREE.Group(); root.add(world); hall(world); structure(world); planets(world); spotFixture(world); rocket(world); astronaut(world); const sg = shuttle(world);
  // the spot's cone, ended where its axis first meets the shuttle (raycast), clipped by the floor
  world.updateMatrixWorld(true);
  const hit = new THREE.Raycaster(V(SPOT.at), V(SPOT_DIR), 0.5, 20).intersectObject(sg, true)[0], len = hit ? hit.distance : 7;
  const D = V(SPOT_DIR), endPl = { name: 'shuttle (lit patch)', n: SPOT_DIR, d: D.dot(V(SPOT.at)) + len + 0.05 };
  const cone = (sink = 0) => coneSolid({ apex: SPOT.at, axis: SPOT_DIR, halfAngleDeg: SPOT.halfAngle, start: 0.03, length: len + 1, clip: [{ name: 'floor', n: [0, -1, 0], d: 0 }, endPl], n: 40, sink });
  const whole = cone(), sunk = cone(0.01);
  root.add(tag(beamWire(whole, { grey: 1, col: 0xffe9a0, emit: 0xffe9a0, flatEmit: 1, only: ['label'] }), 'spot beam (volume edges)'));
  if (!shot.beamMask) root.add(tag(beamMesh(sunk, { glass: true, col: SPOT.color, opacity: 0.13 }), 'spot beam (dusty air)'));
  root.add(tag(ball(0.012, { grey: 1, col: 0xffd24a, emit: 0xffd24a, flatEmit: 1, only: ['label', 'lit'], noCast: true }, MOTE.hero), 'the mote'));

  const extra = (t) => (NAMED[t] ? V(NAMED[t]) : null);
  const figSpecs = shot.figs || {};
  const costumed = Object.fromEntries(Object.entries(figSpecs).map(([k, v]) => [k, k === 'dad' ? { ...v, costume: { ...DAD23, ...(v.costume || {}) } } : k === 'jade' ? { ...v, costume: { ...JADE23, ...(v.costume || {}) } } : { ...v }]));
  // r5 the clasp: stage the children first and read their SOLVED held hands (palm normal n, thumb side t: after the
  // natural-wrist pass), then aim each adult's hand at that frame: palm against the child's palm, the hold cylinder's
  // axis upright in the child's palm plane (the adult's fingers wrap forward round the child's hand, as in hand-holding)
  { const kids = stage(Object.fromEntries(['girl', 'boy'].filter((k) => figSpecs[k]).map((k) => [k, figSpecs[k]])), null, extra).figs;
    const clasp = (adult, side, kid, kidSide) => { const sp = costumed[adult], P = kids[kid]?.userData.P, a = sp?.[side]; if (!P || !a || typeof a !== 'object' || !a.hold) return;
      const h = P.hands[kidSide], up = new THREE.Vector3(0, 1, -1).normalize(), ax = up.clone().addScaledVector(h.n, -up.dot(h.n)).normalize();   // the wrap axis: in the child's palm plane, tilted so the adult's fingers point down-forward along the forearm (natural wrist)
      sp[side] = { ...a, palm: h.n.clone().negate().toArray(), hold: { ...a.hold, axis: ax.toArray() } }; };
    clasp('jade', 'L', 'girl', 'R'); clasp('dad', 'R', 'boy', 'L'); }
  const { figs } = stage(costumed, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  dressPrints(figs); if (figs.jade) { jadeOutfit(figs.jade); PATCH = sleevePatch(figs.jade); } if (figs.dad) { glasses(figs.dad); dadHair(figs.dad); poloCollar(figs.dad); backpack(figs.dad); }
  const cs = { ...shot, aim: shot.aim ? [fix(shot.aim[0]), shot.aim[1], shot.aim[2]] : undefined, target: fix(shot.target) };
  if (shot.eyeline) { const e = (shot.eyelineFrom ? V(shot.eyelineFrom) : figs[shot.eyeline.who].userData.P.eyes.clone()), to = V(fix(shot.eyeline.to)); cs.pos = e.addScaledVector(to.sub(e).normalize(), shot.eyeline.back ?? 0.12).toArray(); delete cs.orbit; }
  Object.assign(shot, solveCamera(cs, figs, null, aim));
  hideParts(shot.hideParts, figs);
  if (shot.hideFigs) for (const f of Object.values(figs)) f.visible = false;   // the plate: same camera (from Jade's eyes), nobody drawn
  const cam = makeCam(shot);

  const anchor = V(fix(shot.beamAnchor || 'mote'));
  const mkSpot = (color, I) => { const s = new THREE.SpotLight(color, I, 0, rad(SPOT.halfAngle + 0.8), 0.25, 0); s.position.set(...SPOT.at); s.target.position.copy(V(SPOT.at).addScaledVector(D, 5)); s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048); s.shadow.camera.near = 0.3; s.shadow.camera.far = 12; s.shadow.bias = -0.0004; return s; };
  const mkTop = (color, I) => { const d = new THREE.DirectionalLight(color, I); d.position.set(0.8, 9, 1.6); d.target.position.set(0, 0, -1.2); d.castShadow = true;
    const c = d.shadow.camera; c.left = -7; c.right = 7; c.top = 7; c.bottom = -7; c.near = 1; c.far = 20; c.updateProjectionMatrix(); d.shadow.mapSize.set(2048, 2048); d.shadow.bias = -0.0006; d.shadow.normalBias = 0.01; d.shadow.radius = 4; return d; };
  const L = shot.light || {};
  const rig = (mode) => {
    if (mode === 'none' || mode === 'mask' || shot.beamMask) return [];
    if (mode === 'lit') return [mkTop(LIGHTS.highbays.color, L.top ?? 2.3), mkSpot(SPOT.color, L.spot ?? 7), new THREE.HemisphereLight(0xe8eeff, 0x4a3a70, L.hemi ?? 2.0), new THREE.AmbientLight(0xb8c4e8, L.amb ?? 0.8)];
    const d = new THREE.DirectionalLight(0xffffff, 0.7); d.position.set(-2, 3, 4);
    return [mkTop(0xffffff, 1.6), mkSpot(0xffffff, 3), new THREE.AmbientLight(0xffffff, 1.3), d];
  };
  if (shot.beamMask) applyBeamMask(root, [whole], { cam, label: 'spot beam (mask)' });
  const lights = [{ name: 'spot', kind: LIGHTS.spot.kind, pos: V(SPOT.at), aim: V(SPOT.at).addScaledVector(D, len), color: '#' + SPOT.color.toString(16).padStart(6, '0'), on: true },
    { name: 'high-bays', kind: LIGHTS.highbays.kind, pos: V(0, FIXTURES[0][1], -1.5), aim: V(0, 0, -1.5), color: '#' + LIGHTS.highbays.color.toString(16).padStart(6, '0'), on: true }];
  const extraOut = (c, P) => ({
    film: { time: shot.time || null, section: shot.section || null, position: shot.position || null },
    beam: beamSidecar({ name: 'spot', kind: SPOT.kind, solid: whole, anchor, P, cam: c, extra: { half_angle_deg: SPOT.halfAngle, lands_on: hit ? hit.object.userData.label : 'nothing (floor)', lands_at: hit ? hit.point.toArray().map((v) => +v.toFixed(3)) : null } }),
    mote: { seed: MOTE.seed, count: MOTE.count, hero_world: MOTE.hero, hero_px: P(V(MOTE.hero)), path_px: [MOTE.hero, MOTE.exit, MOTE.after].map((p) => P(V(p))), note: 'hero -> exit (drifts up out of the shaft at the last hit) -> after (where the gold dotted line stops)' },
    hands_meet: Object.fromEntries(Object.entries(HANDS_MEET).map(([k, p]) => [k, { world: p, px: P(V(p)) }])),
    bodies: { girl: 'girl4 (assets/bodies)', boy: 'boy7 (assets/bodies)', dad: 'dad23 (assets/bodies)' },
    sleeve_patch: PATCH ? { world: PATCH.centre.toArray().map((x) => +x.toFixed(3)), px: P(PATCH.centre), outward: PATCH.outward.toArray().map((x) => +x.toFixed(3)) } : null,
  });
  return { set: 'playground23', scene, root, cam, rig, near: shot.near ?? 0.1, far: shot.far ?? 30, figs, book: null, panes: {}, lights,
    header: shot.header || '', shadowLine: false, shadowPolys: null, subject: anchor, litBg: 0x0a0a12, flatBg: shot.beamMask ? 0x000000 : 0x6a6a6a, extra: extraOut };
}
