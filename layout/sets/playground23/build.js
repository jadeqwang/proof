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
import { HALL, SHUTTLE, HATCHES, STEP, PEOPLE, HANDS_MEET, SPOT, SPOT_DIR, MOTE, FIXTURES, LIGHTS, STRUCT, PLANETS, rad } from './layout.js';
import { floorArt, FLOOR_M, muralArt, planetArt, sweaterArt, SWEATER_M, chestArt, dressArt, DRESS_M, shuttleArt } from './art.js';
import { injectBodies, BODIES_NOTE } from './bodies.js';

// ---------------------------------------------------------------- cast (set-local; the shared table is not edited)
// The girl (4) and the boy (7): Jade's own heights (moongazing character bible): 1.09 m and 1.32 m. Their designs are
// the canonical sheets OUTSIDE this public repo (referenced by absolute path in NOTES.md, never copied here).
// The boy: a young-looking 7-year-old who happens to be very tall (99th percentile), head ~20% larger than typical.
addCast({
  girl: { name: 'the girl (4)', h: 1.09, kind: 'child4', skin: 0xf0c8a8, hair: 0x6a4228, top: 0xf4b8c0, legs: 0xf0c8a8, sock: 0xf4f2ee, hairStyle: 'pigtails', sleeves: 'short', dress: true },
  boy: { name: 'the boy (7)', h: 1.32, kind: 'boy7', skin: 0xecc4a2, hair: 0x18120e, top: 0x1f4a9a, legs: 0x1c2444, sock: 0x7a4a28, hairStyle: 'short', sleeves: 'long' },
}, { boy7: { ...PROP.child7, head: 0.192, hand: 0.104 } });   // a 7-year-old's proportions scaled to 1.32 m, the head ~20% bigger (5.2 heads tall)
// Dad in 2023 (about 67): the shared `dad` key with a per-shot costume (hair near-black, as his reference photo; Jade)
export const DAD23 = { hair: 0x17130f, top: 0x7a8ea6, legs: 0x9a8a6a, sock: 0x3a2e26 };   // shirt and trousers colours: GUESSES (flagged)

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

// ---------------------------------------------------------------- the play shuttle
const H = SHUTTLE;
const hatchAng = (h) => [Math.asin((h.y0 - H.y) / H.r), Math.asin((h.y1 - H.y) / H.r)];
function hullGeo(r, withUV) {   // the fuselage tube (radius r), with the two hatch holes cut on the +z side
  const xs = new Set(), ts = new Set(); for (let i = 0; i <= 48; i++) xs.add(+(H.x0 + (H.x1 - H.x0) * i / 48).toFixed(5));
  for (let i = 0; i <= 72; i++) ts.add(+(-Math.PI + 2 * Math.PI * i / 72).toFixed(5));
  for (const h of Object.values(HATCHES)) { xs.add(h.x0); xs.add(h.x1); const [a, b] = hatchAng(h); ts.add(+a.toFixed(5)); ts.add(+b.toFixed(5)); }
  const X = [...xs].sort((a, b) => a - b), T = [...ts].sort((a, b) => a - b);
  const pos = [], uv = [], idx = [], P = (x, t) => [x, H.y + r * Math.sin(t), H.z + r * Math.cos(t)];
  for (const x of X) for (const t of T) { pos.push(...P(x, t)); uv.push((x - H.x0) / (H.x1 - H.x0), (t + Math.PI) / (2 * Math.PI)); }
  const n = T.length, inHole = (x, t) => Object.values(HATCHES).some((h) => { const [a, b] = hatchAng(h); return x > h.x0 && x < h.x1 && t > a && t < b; });
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < n - 1; j++) { if (inHole((X[i] + X[i + 1]) / 2, (T[j] + T[j + 1]) / 2)) continue; const a = i * n + j, b = a + n; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (withUV) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function shuttle(g) {
  const sg = new THREE.Group(); g.add(sg);
  const WHITE = { grey: 0.85, col: 0xf2f2ee }, TRIM = PAD(0xe8642a), INNER = { grey: 0.7, col: 0xdad8d0 };
  { const m = mk(hullGeo(H.r, true), artLook(shuttleArt(), { grey: 0.85, col: 0xf2f2ee })); m.userData.double = true; sg.add(tag(m, 'play shuttle hull (padded vinyl, white, black belly)')); }
  { const m = mk(hullGeo(H.r - H.wall, false), INNER); m.userData.double = true; sg.add(tag(m, 'play shuttle hull (inside)')); }
  // hatch jambs: the wall thickness round each opening, and an orange padded trim ring
  for (const [name, h] of Object.entries(HATCHES)) { const [a, b] = hatchAng(h), ring = [];
    for (let k = 0; k <= 10; k++) ring.push([h.x0, a + (b - a) * k / 10]); for (let k = 0; k <= 6; k++) ring.push([h.x0 + (h.x1 - h.x0) * k / 6, b]);
    for (let k = 10; k >= 0; k--) ring.push([h.x1, a + (b - a) * k / 10]); for (let k = 6; k >= 0; k--) ring.push([h.x0 + (h.x1 - h.x0) * k / 6, a]);
    const at = ([x, t], r) => V(x, H.y + r * Math.sin(t), H.z + r * Math.cos(t));
    for (let k = 0; k < ring.length - 1; k++) { if (ring[k][0] === ring[k + 1][0] && ring[k][1] === ring[k + 1][1]) continue;
      sg.add(tag(limb(at(ring[k], H.r + 0.02), at(ring[k + 1], H.r + 0.02), 0.035, TRIM), `${name} hatch (padded trim)`));
      const q = [at(ring[k], H.r), at(ring[k + 1], H.r), at(ring[k + 1], H.r - H.wall), at(ring[k], H.r - H.wall)];
      const geo = new THREE.BufferGeometry().setFromPoints([q[0], q[1], q[2], q[0], q[2], q[3]]); geo.computeVertexNormals(); const m = mk(geo, INNER); m.userData.double = true; sg.add(tag(m, `${name} hatch (jamb)`)); } }
  // cabin deck (the sill level), tail bulkhead, nose cone (an ogive: white, black tip), cockpit windows
  { const hw = Math.sqrt(H.r ** 2 - (H.deck - H.y) ** 2) - 0.07; sg.add(tag(box(H.x1 - H.x0 - 0.1, 0.06, 2 * hw, PAD(0x2a6ad8), [(H.x0 + H.x1) / 2, H.deck - 0.03, H.z]), 'cabin deck (padded)')); }
  { const m = mk(new THREE.CircleGeometry(H.r, 48), WHITE); m.rotation.y = -Math.PI / 2; m.position.set(H.x0, H.y, H.z); m.userData.double = true; sg.add(tag(m, 'play shuttle tail bulkhead')); }
  { const prof = []; for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push(new THREE.Vector2(H.r * Math.sqrt(Math.max(0, 1 - t * t)) + 0.0001, t * H.nose)); }
    const m = mk(new THREE.LatheGeometry(prof, 48), WHITE); m.rotation.z = -Math.PI / 2; m.position.set(H.x1, H.y, H.z); sg.add(tag(m, 'play shuttle nose (padded)'));
    const tip = ball(0.2, BLACK, [H.x1 + H.nose - 0.12, H.y, H.z], [0.9, 1, 1]); sg.add(tag(tip, 'play shuttle nose tip (black)'));
    for (const s of [-1, 1]) { const w = box(0.2, 0.12, 0.02, { grey: 0.15, col: 0x1a2a4a }, [H.x1 + 0.18, H.y + 0.38, H.z + s * 0.26]); w.rotation.set(0, s * 0.5, s * 0.35); sg.add(tag(w, 'cockpit window (dark)')); } }
  // portholes above the hatches
  for (const x of [-1.35, 1.15]) { const t = Math.asin(0.3 / H.r); const m = mk(new THREE.CircleGeometry(0.11, 32), { grey: 0.2, col: 0x1a2a4a }); m.position.set(x, H.y + H.r * Math.sin(t) + 0.004, H.z + H.r * Math.cos(t) + 0.004); m.lookAt(m.position.clone().add(V(0, Math.sin(t), Math.cos(t)))); sg.add(tag(m, 'porthole (dark)')); }
  // tail fin and delta wings (padded slabs), black cradle
  { const f = H.fin, s = new THREE.Shape(); s.moveTo(f.x0, H.y + H.r - 0.05); s.lineTo(f.x1, H.y + H.r - 0.05); s.lineTo(f.x0 + 0.25, f.top); s.lineTo(f.x0, f.top); s.closePath();
    const m = mk(new THREE.ExtrudeGeometry(s, { depth: f.t, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), WHITE); m.position.z = H.z - f.t / 2; sg.add(tag(m, 'play shuttle tail fin (padded)'));
    const st = box(0.06, 0.4, f.t + 0.08, PAD(0xe8642a), [f.x0 + 0.2, f.top - 0.35, H.z]); st.rotation.z = -0.25; sg.add(tag(st, 'tail fin stripe (orange)')); }
  for (const sgn of [-1, 1]) { const w = H.wing, s = new THREE.Shape(); s.moveTo(w.x0, 0); s.lineTo(w.x1, 0); s.lineTo(w.x0 + 0.1, sgn * w.span); s.lineTo(w.x0, sgn * w.span); s.closePath();
    const m = mk(new THREE.ExtrudeGeometry(s, { depth: w.t, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), WHITE); m.rotation.x = Math.PI / 2; m.position.set(0, w.y + w.t / 2, H.z); sg.add(tag(m, 'play shuttle wing (padded)')); }
  sg.add(tag(box(H.x1 - H.x0 - 0.4, H.y - H.r, 0.7, BLACK, [(H.x0 + H.x1) / 2, (H.y - H.r) / 2, H.z]), 'shuttle cradle (black)'));
  // the padded steps
  for (const h of Object.values(HATCHES)) sg.add(tag(box(h.x1 - h.x0, STEP.h, STEP.z1 - STEP.z0, PAD(0x2a6ad8), [(h.x0 + h.x1) / 2, STEP.h / 2, (STEP.z0 + STEP.z1) / 2]), 'padded step (blue)'));
  return sg;
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
// ENGINE WORKAROUND (reported, not fixed here: engine/humanMesh.js is not this set's): a figure in a dress loses her bare
// legs (the body's leg faces are hidden under the trouser garment, which a dress then skips). The girl is built a second
// time in the same pose without the dress, and that build's trouser legs, coloured as her skin, are moved onto her.
function girlLegs(fig, spec, extra) {
  addCast({ girlLegs: { ...CAST.girl, name: 'the girl (legs helper)', dress: false, legs: CAST.girl.skin } });
  const { figs: t } = stage({ girlLegs: { ...spec } }, null, extra); const h = t.girlLegs; if (!h) return;
  const take = []; h.traverse((o) => { if (o.isMesh && o.userData.garment && /leg[LR]$/.test(o.userData.idGroup || '')) take.push(o); });
  fig.updateMatrixWorld(true);
  for (const o of take) { o.updateMatrixWorld(true); const m = o.clone(); new THREE.Matrix4().copy(fig.matrixWorld).invert().multiply(o.matrixWorld).decompose(m.position, m.quaternion, m.scale);
    { const cut = (spec.floor || 0) + 0.42 * CAST.girl.h, g = m.geometry.clone(), P = g.attributes.position, I = g.index, keep = [], v = new THREE.Vector3();   // only below the skirt (the waistband poked through it)
      const wy = (i) => v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld).y;
      if (I) { for (let t = 0; t < I.count; t += 3) { const a = I.getX(t), b = I.getX(t + 1), c = I.getX(t + 2); if (Math.max(wy(a), wy(b), wy(c)) < cut) keep.push(a, b, c); } g.setIndex(keep); m.geometry = g; } }
    m.userData = { ...o.userData, who: 'girl', idGroup: String(o.userData.idGroup).replace('girlLegs', 'girl'), label: 'the girl (bare legs)' }; fig.add(m); }
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

export const NAMED = { mote: MOTE.hero, moteExit: MOTE.exit, moteAfter: MOTE.after, spot: SPOT.at,
  meetJade: HANDS_MEET.jade_girl, meetDad: HANDS_MEET.dad_boy,
  frontJambL: [HATCHES.front.x0 + 0.01, 0.9, -0.765], rearJambR: [HATCHES.rear.x1 - 0.01, 0.95, -0.78], frontHatch: [(HATCHES.front.x0 + HATCHES.front.x1) / 2, 0.75, -0.95], rearHatch: [(HATCHES.rear.x0 + HATCHES.rear.x1) / 2, 0.75, -0.95] };
const fix = (p) => (typeof p === 'string' && NAMED[p] ? NAMED[p].slice() : p);

export function build(shot, { makeCam }) {
  injectBodies();
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  const world = new THREE.Group(); root.add(world); hall(world); structure(world); planets(world); spotFixture(world); const sg = shuttle(world);
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
  const costumed = Object.fromEntries(Object.entries(figSpecs).map(([k, v]) => [k, k === 'dad' ? { ...v, costume: { ...DAD23, ...(v.costume || {}) } } : v]));
  const { figs } = stage(costumed, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  if (figs.girl) girlLegs(figs.girl, figSpecs.girl, extra);
  dressPrints(figs); if (figs.dad) glasses(figs.dad);
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
    bodies: BODIES_NOTE,
  });
  return { set: 'playground23', scene, root, cam, rig, near: shot.near ?? 0.1, far: shot.far ?? 30, figs, book: null, panes: {}, lights,
    header: shot.header || '', shadowLine: false, shadowPolys: null, subject: anchor, litBg: 0x0a0a12, flatBg: shot.beamMask ? 0x000000 : 0x6a6a6a, extra: extraOut };
}
