// Build one market93 shot: the produce department (from layout.js) + figures + cart + the two hero vegetables + light rig.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, tag, V, rad } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { prismSolid, applyBeamMask } from '../_beam.js';
import { aim } from '../../engine/aim.js';
import { CAST, PROP } from '../_cast.js';   // jade10 (and child10 proportions) come from the shared cast table
import { STORE, AISLE, ISLAND, ISLANDS, AWNING, bedY, HERO_BINS, binZ, GONDOLA, WALLCASE, WALLSHELF, PALLET, SCALE, AISLE_SIGN,
  TUBES, fixtureZ, KEY, DEAD, BEAM, beamRect, inBeam, LIGHTS, ARTICHOKE, ROMANESCO, ART_HELD, ART_ISLAND, ROM_ISLAND, CART, CAST93, PROP_CHILD10 } from './layout.js';
import { artichoke, romanesco, place, latticeWorld } from './phyllo.js';

// set-local cast: registered on the shared tables only if nobody has added them (engine files are not edited)
for (const [k, v] of Object.entries(CAST93)) if (!CAST[k]) CAST[k] = v;   // set-local extra: the grandmother

const FLOOR = { grey: 0.66, col: 0xb9b3a2 }, CEIL = { grey: 0.8, col: 0xd8d6cc }, WALL = { grey: 0.72, col: 0xc9c2b0 };
const STEEL = { grey: 0.5, col: 0x8d9096 }, STEEL_D = { grey: 0.34, col: 0x5a5d62 }, WOOD = { grey: 0.46, col: 0x7a5a38 }, WOOD_D = { grey: 0.36, col: 0x5c4229 };
const CARD = { grey: 0.6, col: 0xa98a5c }, WHITE = { grey: 0.9, col: 0xe8e6de };
const rnd = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const lowBall = new THREE.SphereGeometry(1, 12, 8);
const blob = (r, look, at, sc = [1, 1, 1]) => { const m = mk(lowBall, look); m.position.set(...at); m.scale.set(r * sc[0], r * sc[1], r * sc[2]); return m; };

// ---------------------------------------------------------------- tube rows
function tubes(g) {
  const T = TUBES, isDead = (r, k) => DEAD.some((d) => d.row === r && d.k === k), isKey = (r, k) => KEY.row === r && KEY.k === k;
  T.rows.forEach((x, r) => { for (let k = 0; k < T.n; k++) {
    const z = fixtureZ(k), dead = isDead(r, k), key = isKey(r, k);
    const name = key ? 'KEY STRIP (the beam)' : dead ? 'dead strips (tubes out)' : 'bare fluorescent tube rows';
    const f = new THREE.Group();
    f.add(box(T.channel[0], T.channel[1], T.len + 0.04, WHITE, [x, T.y + T.channel[1] / 2 + T.tubeR, z]));
    for (const s of [-1, 1]) {
      const look = dead ? { grey: 0.45, col: 0x55585c } : { grey: 1, col: 0xffffff, emit: key ? BEAM.color : LIGHTS.rows.color, emitI: key ? 1.5 : 0.5, flatEmit: key ? 1 : 0.9, noRecv: true };
      f.add(cyl(T.tubeR, T.tubeR, T.len, look, [x + s * T.tubeGap / 2, T.y, z], [90, 0, 0], 8));
      f.add(cyl(0.004, 0.004, STORE.ceil - T.y - T.channel[1], STEEL_D, [x, (STORE.ceil + T.y + T.channel[1]) / 2 + T.tubeR, z + s * (T.len / 2 - 0.1)], null, 5));
    }
    g.add(tag(f, name));
  } });
}

// ---------------------------------------------------------------- produce islands
function heap(g, x0, x1, z0, z1, r, look, label, seed, opt = {}) {
  const R = rnd(seed), sq = opt.sq || [1, 0.92, 1], step = r * 1.95, gr = new THREE.Group();
  const nx = Math.floor((x1 - x0 - 0.02) / step), nz = Math.floor((z1 - z0 - 0.04) / step);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const x = x0 + 0.01 + r + i * step + (R() - 0.5) * r * 0.25, z = z0 + 0.02 + r + j * step + (R() - 0.5) * r * 0.25;
    gr.add(blob(r * (0.93 + R() * 0.14), look, [x, bedY(x, opt.ix0) + r * sq[1] * 0.92, z], sq));
    if (i < nx - 1 && j < nz - 1 && i >= (opt.skipFront ?? 0) && R() < (opt.top ?? 0.55) && !(opt.keep && Math.hypot(x + step / 2 - opt.keep[0], z + step / 2 - opt.keep[1]) < r * 2.2))
      gr.add(blob(r * (0.93 + R() * 0.12), look, [x + step / 2, bedY(x + step / 2, opt.ix0) + r * sq[1] * 0.92 + r * 1.45, z + step / 2], sq));
  }
  g.add(tag(gr, label));
}
function island(g, I) {
  const S = ISLAND, x0 = I.x0, x1 = x0 + S.w, z0 = I.z0, z1 = z0 + S.len, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hero = I.id === 'hero';
  const name = hero ? 'the produce island' : I.awning ? 'produce islands with awnings' : 'produce islands';
  const gr = new THREE.Group();
  gr.add(box(S.w - 2 * S.kickIn, S.kick, S.len - 2 * S.kickIn, WOOD_D, [cx, S.kick / 2, cz]));
  gr.add(box(S.w, S.rim - S.kick - 0.06, S.len, WOOD, [cx, (S.rim - 0.06 + S.kick) / 2, cz]));
  const slope = Math.atan2(S.ridge - S.rim, S.w / 2), bl = Math.hypot(S.w / 2, S.ridge - S.rim);
  for (const s of [-1, 1]) {   // the two tilted beds, the lip boards
    const bed = box(bl, 0.03, S.len - 0.02, { grey: 0.4, col: 0x3d4a3a }, [cx + s * S.w / 4, (S.rim + S.ridge) / 2 - 0.016, cz]); bed.rotation.z = -s * slope; gr.add(bed);
    gr.add(box(S.lipT, S.lip + 0.08, S.len, WOOD, [cx + s * (S.w / 2 - S.lipT / 2), S.rim + S.lip - (S.lip + 0.08) / 2, cz]));
  }
  for (const zz of [z0 + S.lipT / 2, z1 - S.lipT / 2]) { // end boards (gable shaped as a box up to the ridge)
    gr.add(box(S.w, S.rim - 0.05, S.lipT, WOOD, [cx, (S.rim - 0.05) / 2 + 0.05, zz]));
    gr.add(box(S.w * 0.5, S.ridge - S.rim + S.lip, S.lipT, WOOD, [cx, S.rim + (S.ridge - S.rim + S.lip) / 2 - 0.02, zz])); }
  gr.add(box(0.03, 0.1, S.len, WOOD, [cx, S.ridge + 0.03, cz]));    // ridge board
  const nb = Math.round(S.len / S.bin);
  for (let i = 1; i < nb; i++) for (const s of [-1, 1]) { const d = box(bl - 0.03, 0.07, 0.015, WOOD_D, [cx + s * S.w / 4, (S.rim + S.ridge) / 2 + 0.03, z0 + i * S.bin]); d.rotation.z = -s * slope; gr.add(d); }
  g.add(tag(gr, name));
  // produce
  const P = [[0.085, { grey: 0.7, col: 0xa9c48a }, 'cabbages'], [0.05, { grey: 0.25, col: 0x3b2748 }, 'eggplants', [0.8, 0.8, 1.7]], [0.06, { grey: 0.82, col: 0xe8c95a }, 'grapefruit'],
    [0.05, { grey: 0.5, col: 0x6f8a55 }, 'artichokes (heap)', [1, 1.1, 1]], [0.07, { grey: 0.72, col: 0xb6cf5e }, 'romanesco (heap)', [1, 0.95, 1]], [0.045, { grey: 0.68, col: 0xe08a2c }, 'oranges']];
  if (hero) {
    HERO_BINS.forEach((nm, i) => { const [za, zb] = binZ(i, z0), [r, look, label, sq] = P[i];
      const keep = nm === 'artichokes' ? [ART_ISLAND.at[0], ART_ISLAND.at[2]] : nm === 'romanesco' ? [ROM_ISLAND.at[0], ROM_ISLAND.at[2]] : null;
      heap(g, x0 + S.lipT + 0.005, cx - 0.03, za + 0.01, zb - 0.01, r, look, label, 11 + i * 7, { sq, ix0: x0, keep, top: keep ? 0.25 : 0.5 }); });
  }
  // everything else: one lump per bin (background), a price card per bin
  for (let i = 0; i < nb; i++) for (const s of [-1, 1]) {
    if (hero && s < 0) { g.add(tag(box(0.13, 0.09, 0.004, WHITE, [cx - 0.05, S.ridge + 0.14, z0 + (i + 0.5) * S.bin], [0, 90, -12]), 'price cards'));
      g.add(tag(cyl(0.003, 0.003, 0.12, STEEL_D, [cx - 0.05, S.ridge + 0.06, z0 + (i + 0.5) * S.bin], null, 5), 'price cards')); continue; }
    const lump = blob(1, { grey: [0.7, 0.55, 0.8, 0.45][(i + (s > 0 ? 1 : 0) + Math.round(I.z0)) & 3], col: [0xc9463a, 0x7fa650, 0xe2b53c, 0x8a5a9a][(i + (s > 0 ? 2 : 0)) & 3] },
      [cx + s * S.w * 0.27, (S.rim + S.ridge) / 2 + 0.04, z0 + (i + 0.5) * S.bin], [S.w * 0.2, 0.1, S.bin * 0.44]); lump.rotation.z = -s * slope;
    g.add(tag(lump, 'produce heaps'));
  }
  if (I.awning) { // timber posts at the corners and mid-length, a ridge pole, two striped awning planes with valances
    const A = AWNING, ag = new THREE.Group();
    for (const zz of [z0 + 0.06, cz, z1 - 0.06]) { ag.add(box(A.post, A.postH, A.post, WOOD, [cx, A.postH / 2, zz])); ag.add(box(S.w + 2 * A.over, 0.09, 0.07, WOOD, [cx, A.eave + 0.05, zz])); }
    ag.add(box(0.09, 0.09, S.len + 0.2, WOOD, [cx, A.ridge, cz]));
    for (const s of [-1, 1]) { const xe = cx + s * (S.w / 2 + A.over);
      ag.add(quad([V(cx, A.ridge + 0.05, z0 - 0.1), V(cx, A.ridge + 0.05, z1 + 0.1), V(xe, A.eave + 0.05, z1 + 0.1), V(xe, A.eave + 0.05, z0 - 0.1)], { grey: 0.62, col: 0x5f9a4a }));
      ag.add(quad([V(xe, A.eave + 0.05, z0 - 0.1), V(xe, A.eave + 0.05, z1 + 0.1), V(xe, A.eave + 0.05 - A.valance, z1 + 0.1), V(xe, A.eave + 0.05 - A.valance, z0 - 0.1)], { grey: 0.75, col: 0xb7d96a })); }
    g.add(tag(ag, 'timber posts and striped awnings'));
  }
}

// ---------------------------------------------------------------- shelving, cases, walls
function gondola(g, Rn) {
  const G = GONDOLA, cx = (Rn.x0 + Rn.x1) / 2, w = Rn.x1 - Rn.x0, len = Rn.z1 - Rn.z0, cz = (Rn.z0 + Rn.z1) / 2, gr = new THREE.Group(), st = new THREE.Group(), R = rnd(Rn.x0 * 100 + 7);
  gr.add(box(w, G.base, len, STEEL_D, [cx, G.base / 2, cz]));
  gr.add(box(0.03, G.h, len, STEEL, [cx, G.h / 2, cz]));                      // the back panel down the middle
  for (const y of G.shelves) gr.add(box(w, 0.025, len, STEEL, [cx, y, cz]));
  gr.add(box(w * 0.5, 0.03, len, STEEL, [cx, G.h, cz]));
  const nb = Math.round(len / G.bay);
  for (let i = 0; i <= nb; i++) gr.add(box(0.04, G.h, 0.03, STEEL_D, [cx, G.h / 2, Rn.z0 + i * G.bay]));
  if (Rn.detail) for (let i = 0; i < nb; i++) G.shelves.forEach((y, j) => { const top = (G.shelves[j + 1] ?? G.h) - 0.05, h = (top - y - 0.02) * (0.55 + 0.4 * R());
    for (const s of [-1, 1]) st.add(box(w / 2 - 0.05, h, G.bay - 0.08, { grey: 0.45 + 0.4 * R(), col: [0xb23a2e, 0xd9b84a, 0x3f6f9a, 0xe7e1cf][(i + j) & 3] }, [cx + s * (w / 4 + 0.005), y + 0.0125 + h / 2, Rn.z0 + (i + 0.5) * G.bay])); });
  g.add(tag(gr, 'grocery gondola shelving')); g.add(tag(st, 'shelf stock (jars, boxes)'));
}
function wallcase(g, Rn) {
  const W = WALLCASE, gr = new THREE.Group(), st = new THREE.Group();
  const len = Rn.along === 'z' ? Rn.z1 - Rn.z0 : Rn.x1 - Rn.x0, R = rnd(len * 31);
  gr.add(box(W.d, 0.4, len, WHITE, [-W.d / 2, 0.2, 0])); gr.add(box(0.06, W.h, len, WHITE, [-0.03, W.h / 2, 0]));
  gr.add(box(W.d * 0.8, W.canopy, len, WHITE, [-W.d * 0.4, W.h - W.canopy / 2, 0]));
  for (const y of W.decks) gr.add(box(W.d * 0.6, 0.02, len, STEEL, [-W.d * 0.33, y, 0]));
  const nb = Math.round(len / 1.2);
  for (let i = 0; i < nb; i++) [0.4, ...W.decks].forEach((y, j) => st.add(box(W.d * 0.5, 0.1 + 0.14 * R(), 1.1, { grey: 0.4 + 0.45 * R(), col: [0x6fa04f, 0xd65a3a, 0xe9c04a, 0x9bbf6a][(i + j) & 3] }, [-W.d * 0.34, y + 0.1, -len / 2 + (i + 0.5) * 1.2])));
  const grp = new THREE.Group(); grp.add(tag(gr, 'refrigerated wall case'), tag(st, 'wall case produce'));
  if (Rn.along === 'z') grp.position.set(Rn.x, 0, (Rn.z0 + Rn.z1) / 2); else { grp.position.set((Rn.x0 + Rn.x1) / 2, 0, Rn.z); grp.rotation.y = rad(90); }
  g.add(grp);
}
function room(shot) {
  const g = new THREE.Group(), S = STORE, w = S.x1 - S.x0, d = S.z1 - S.z0, cx = (S.x0 + S.x1) / 2;
  g.add(tag(box(w, 0.04, d, FLOOR, [cx, -0.02, 0]), 'floor (12 in vinyl tile)'));
  g.add(tag(box(w, 0.04, d, { ...CEIL, noCast: true }, [cx, S.ceil + 0.02, 0]), 'drop ceiling'));
  g.add(tag(box(0.1, S.ceil, d, WALL, [S.x0 - 0.05, S.ceil / 2, 0]), 'side wall')); g.add(tag(box(0.1, S.ceil, d, WALL, [S.x1 + 0.05, S.ceil / 2, 0]), 'side wall'));
  g.add(tag(box(w, S.ceil, 0.1, WALL, [cx, S.ceil / 2, S.z0 - 0.05]), 'back wall')); g.add(tag(box(w, S.ceil, 0.1, WALL, [cx, S.ceil / 2, S.z1 + 0.05]), 'front of store (not built)'));
  tubes(g);
  ISLANDS.forEach((I) => island(g, I));
  GONDOLA.runs.forEach((Rn) => gondola(g, Rn));
  WALLCASE.runs.forEach((Rn) => wallcase(g, Rn));
  { const W = WALLSHELF, gr = new THREE.Group(); gr.add(box(W.d, W.h, 14, STEEL, [W.x0 + W.d / 2, W.h / 2, 0]));
    for (const y of GONDOLA.shelves) gr.add(box(W.d + 0.02, 0.025, 14, STEEL_D, [W.x0 + W.d / 2, y, 0])); g.add(tag(gr, 'wall shelving')); }
  { const P = PALLET, gr = new THREE.Group(), [cw, ch, cd] = P.carton, R = rnd(5);     // the pallet of cartons that narrows the aisle
    gr.add(box(P.x1 - P.x0, P.h, P.z1 - P.z0, WOOD_D, [(P.x0 + P.x1) / 2, P.h / 2, (P.z0 + P.z1) / 2]));
    for (let l = 0; l < P.layers; l++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { if (l === P.layers - 1 && i === 1 && j === 1) continue;
      gr.add(box(cw, ch - 0.006, cd, CARD, [P.x0 + 0.02 + cw / 2 + i * (cw + 0.01) + (R() - 0.5) * 0.02, P.h + ch / 2 + l * ch, P.z0 + 0.01 + cd / 2 + j * (cd + 0.01) + (R() - 0.5) * 0.02], [0, (R() - 0.5) * 5, 0])); }
    g.add(tag(gr, 'pallet of melon cartons (narrows the aisle)')); }
  { const [x, z] = SCALE.at, gr = new THREE.Group();                                    // hanging scale
    gr.add(cyl(0.004, 0.004, STORE.ceil - SCALE.y - 0.12, STEEL_D, [x, (STORE.ceil + SCALE.y + 0.12) / 2, z], null, 5));
    gr.add(cyl(0.12, 0.12, 0.06, WHITE, [x, SCALE.y, z], [90, 0, 0], 20)); gr.add(cyl(0.16, 0.1, 0.07, STEEL, [x, SCALE.y - 0.42, z], null, 18));
    for (const a of [0, 120, 240]) gr.add(cyl(0.002, 0.002, 0.3, STEEL_D, [x + 0.07 * Math.cos(rad(a)), SCALE.y - 0.25, z + 0.07 * Math.sin(rad(a))], null, 4));
    g.add(tag(gr, 'hanging scale')); }
  { const A = AISLE_SIGN, gr = new THREE.Group(); gr.add(box(A.w, A.h, 0.03, WHITE, [A.x, A.y, A.z]));
    for (const s of [-1, 1]) gr.add(cyl(0.004, 0.004, STORE.ceil - A.y - A.h / 2, STEEL_D, [A.x + s * (A.w / 2 - 0.08), (STORE.ceil + A.y + A.h / 2) / 2, A.z], null, 5));
    g.add(tag(gr, 'hanging aisle sign')); }
  // the beam: its footprint on the floor (label mode only) and its volume (mode 'beam' only: for the mask renderer)
  { const r = beamRect(0), t = 0.02, L = { grey: 1, col: 0xffffff, emit: 0xffe070, flatEmit: 1, only: ['label'], noCast: true, noRecv: true }, gr = new THREE.Group();
    gr.add(box(r.x1 - r.x0, 0.004, t, L, [(r.x0 + r.x1) / 2, 0.004, r.z0])); gr.add(box(r.x1 - r.x0, 0.004, t, L, [(r.x0 + r.x1) / 2, 0.004, r.z1]));
    gr.add(box(t, 0.004, r.z1 - r.z0, L, [r.x0, 0.004, (r.z0 + r.z1) / 2])); gr.add(box(t, 0.004, r.z1 - r.z0, L, [r.x1, 0.004, (r.z0 + r.z1) / 2]));
    g.add(tag(gr, 'beam footprint on the floor'));
    const S2 = BEAM.src, top = [[S2.x - S2.w / 2, S2.z0], [S2.x + S2.w / 2, S2.z0], [S2.x + S2.w / 2, S2.z1], [S2.x - S2.w / 2, S2.z1]], bot = [[r.x0, r.z0], [r.x1, r.z0], [r.x1, r.z1], [r.x0, r.z1]];
    const pos = []; const P3 = (p, y) => [p[0], y, p[1]];
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; pos.push(...P3(top[i], S2.y), ...P3(bot[i], 0), ...P3(bot[j], 0), ...P3(top[i], S2.y), ...P3(bot[j], 0), ...P3(top[j], S2.y)); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    const vol = mk(geo, { grey: 1, col: 0xffffff, only: ['beam'], noCast: true, noRecv: true }); vol.userData.double = true; g.add(tag(vol, 'beam volume')); }
  return g;
}

// ---------------------------------------------------------------- the cart (local: +z = nose, origin on the floor under the basket centre)
function cart(spec) {
  const C = CART, g = new THREE.Group(), hl = C.len / 2, wr = C.wRear / 2, wn = C.wNose / 2, yb = C.bottom, yt = C.top, W = { grey: 0.58, col: 0x9aa0a8 };
  const c = { rl: V(wr, yt, -hl), rr: V(-wr, yt, -hl), nl: V(wn, yt, hl), nr: V(-wn, yt, hl), rlb: V(wr * 0.9, yb, -hl + 0.04), rrb: V(-wr * 0.9, yb, -hl + 0.04), nlb: V(wn * 0.9, yb + 0.05, hl - 0.05), nrb: V(-wn * 0.9, yb + 0.05, hl - 0.05) };
  g.add(quad([c.rl, c.nl, c.nlb, c.rlb], W), quad([c.nr, c.rr, c.rrb, c.nrb], W), quad([c.nl, c.nr, c.nrb, c.nlb], W), quad([c.rr, c.rl, c.rlb, c.rrb], W), quad([c.rlb, c.nlb, c.nrb, c.rrb], { grey: 0.5, col: 0x8a9098 }));
  for (const s of [-1, 1]) { g.add(box(0.02, 0.02, C.len + 0.1, STEEL_D, [s * wr * 0.85, 0.16, -0.02])); g.add(box(0.025, C.handleY - 0.14, 0.025, STEEL_D, [s * wr * 0.95, (C.handleY + 0.14) / 2, -hl - 0.03], [-8, 0, 0]));
    for (const zz of [-hl + 0.02, hl - 0.03]) g.add(cyl(0.055, 0.055, 0.025, { grey: 0.2, col: 0x222222 }, [s * wr * 0.85, 0.055, zz], [0, 0, 90], 12)); }
  g.add(box(C.wRear * 0.8, 0.015, C.len * 0.8, STEEL, [0, 0.2, 0]));
  g.add(cyl(0.014, 0.014, C.wRear, { grey: 0.3, col: 0xb23a2e }, [0, C.handleY, -hl - 0.09], [0, 0, 90], 10));
  g.add(box(0.3, 0.16, 0.22, { grey: 0.7, col: 0xd9c9a0 }, [0.02, yb + 0.1, -0.1], [0, 12, 0])); g.add(ball(0.09, { grey: 0.6, col: 0x9ab56a }, [-0.05, yb + 0.12, 0.2]));
  g.position.set(spec.at[0], 0, spec.at[1]); g.rotation.y = rad(spec.yaw || 0); g.updateMatrixWorld(true);
  g.userData.pt = (n) => ({ handleL: V(0.17, C.handleY + 0.012, -hl - 0.09), handleR: V(-0.17, C.handleY + 0.012, -hl - 0.09), nose: V(0, yt, hl), centre: V(0, 0.7, 0) })[n]?.applyMatrix4(g.matrixWorld);
  return tag(g, "the grandmother's cart");
}

// ---------------------------------------------------------------- build
export function build(shot, { makeCam, W = 1920, H = 1080 }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(room(shot));
  // the two hero vegetables
  const held = (shot.art ?? 'held') === 'held', AP = held ? ART_HELD : ART_ISLAND;
  const art = place(artichoke(), AP.at, AP.axis), rom = place(romanesco(), ROM_ISLAND.at, ROM_ISLAND.axis); root.add(art, rom);
  const artC = V(AP.at), artAxis = V(AP.axis).normalize(), romC = V(ROM_ISLAND.at), romAxis = V(ROM_ISLAND.axis).normalize();
  const cartG = shot.cart ? cart(shot.cart) : null; if (cartG) root.add(cartG);
  // set targets: 'art' | 'art:L' | 'art:R' | 'art:tip' | 'rom' | 'rom:tip' | 'cart:handleL|handleR|nose|centre' |
  // 'forearm:<who>:<L|R>[:k]' (k along elbow -> wrist, default 0.6)
  const extra = (t, figs) => {
    if (typeof t !== 'string') return null;
    if (t === 'art') return artC.clone();
    if (t === 'art:tip') return artC.clone().addScaledVector(artAxis, ARTICHOKE.R * ARTICHOKE.stretch);
    if (t === 'art:L' || t === 'art:R') { const l = V(ART_HELD.left); return artC.clone().addScaledVector(l, (t === 'art:L' ? 1 : -1) * (ARTICHOKE.R + 0.012)).add(V(0, -0.018, 0)); }
    if (t === 'rom') return romC.clone();
    if (t === 'rom:tip') return romC.clone().addScaledVector(romAxis, ROMANESCO.R * ROMANESCO.stretch);
    if (t.startsWith('cart:')) return cartG ? cartG.userData.pt(t.slice(5)) : null;
    if (t.startsWith('forearm:')) { const [, who, side, k] = t.split(':'); const f = figs && figs[who]; if (!f) return null; const P = f.userData.P; return P['elbow' + side].clone().lerp(P['wrist' + side], k ? +k : 0.6); }
    return null;
  };
  const { figs } = stage(shot.figs, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  if (shot.hide) root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) o.visible = false; });
  // camera: resolve this set's names to points first, then the engine's solver
  const res = (t) => { if (t && t.mid) return { mid: t.mid.map(res) }; const p = extra(t, figs); return p ? p.toArray() : t; };
  const s2 = { ...shot }; if (s2.orbit) s2.orbit = { ...s2.orbit, at: res(s2.orbit.at) }; if (s2.aim) s2.aim = [res(s2.aim[0]), s2.aim[1], s2.aim[2]];
  if (!shot.ortho) Object.assign(shot, solveCamera(s2, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  // lights
  const keyP = V(LIGHTS.key.pos), fr = beamRect(0);
  const lightList = [
    { name: 'key_strip', kind: LIGHTS.key.kind, pos: keyP, aim: V(keyP.x, 0, keyP.z), color: '#' + BEAM.color.toString(16), on: true },
    ...DEAD.map((d, i) => ({ name: 'dead_strip_' + i, kind: 'strip with dead tubes', pos: V(TUBES.rows[d.row], TUBES.y, fixtureZ(d.k)), color: '#000000', on: false })),
    { name: 'tube_rows', kind: LIGHTS.rows.kind, pos: V(TUBES.rows[3], TUBES.y, fixtureZ(KEY.k)), color: '#' + LIGHTS.rows.color.toString(16), on: true },
  ];
  const rig = (mode) => {
    const L = []; if (mode === 'none' || shot.beamMask) return L; const white = mode !== 'lit';
    // preview only: a cone that circumscribes the beam's rectangular footprint (the exact volume is the prism in layout.js BEAM)
    const half = Math.atan(Math.hypot(fr.x1 - fr.x0, fr.z1 - fr.z0) / 2 / TUBES.y);
    const s = new THREE.SpotLight(white ? 0xffffff : BEAM.color, mode === 'lit' ? 9 : mode === 'mask' ? 6 : 1.4, 0, half, 0.15, mode === 'lit' ? 1.2 : 0);
    s.position.copy(keyP).add(V(0, -0.06, 0)); s.target.position.set(keyP.x, 0, keyP.z); s.castShadow = true; s.shadow.camera.near = 0.3; s.shadow.camera.far = 6; L.push(s);
    if (mode === 'mask') return L;
    L.push(new THREE.AmbientLight(white ? 0xffffff : 0x7f8aa0, mode === 'lit' ? (shot.light?.amb ?? 0.55) : 1.75));
    if (white) { const d = new THREE.DirectionalLight(0xffffff, 1.0); d.position.set(-1.5, 4, 2.5); L.push(d); }
    return L;
  };
  const extraOut = (c, P) => {
    const vis = (o) => { const d = c.position.clone().sub(o.w).normalize(); return o.nrm.dot(d) > 0.12; };
    const lat = (g, arms, key) => latticeWorld(g, arms).map((o) => ({ n: o.n, ...Object.fromEntries(Object.entries(o.arms).map(([a, v]) => ['arm' + a, v])), px: P(o.w), faces_camera: vis(o), w: o.w.toArray().map((v) => +v.toFixed(4)) }));
    const rect = (y) => { const r = beamRect(y), cs = [V(r.x0, y, r.z0), V(r.x1, y, r.z0), V(r.x1, y, r.z1), V(r.x0, y, r.z1)]; return { y, world: r, px: cs.map(P), behind_camera: cs.map((v) => v.clone().applyMatrix4(c.matrixWorldInverse).z > 0) }; };
    return {
      beam: { source: BEAM.src, cross_half_angle_deg: BEAM.crossDeg, end_half_angle_deg: BEAM.endDeg, footprint_floor: rect(0), footprint_bed_height: rect(0.95), source_px: [P(V(BEAM.src.x, BEAM.src.y, BEAM.src.z0)), P(V(BEAM.src.x, BEAM.src.y, BEAM.src.z1))],
        in_beam: Object.fromEntries([...Object.entries(figs).map(([w, f]) => [w, inBeam(f.userData.P.chest.toArray())]), ['artichoke', inBeam(artC.toArray())], ['romanesco', inBeam(romC.toArray())]]) },
      artichoke: { state: held ? 'held' : 'on the island', centre_px: P(artC), tip_px: P(artC.clone().addScaledVector(artAxis, ARTICHOKE.R * ARTICHOKE.stretch)), centre_world: AP.at, axis: AP.axis, rule: ARTICHOKE, bracts: lat(art, ARTICHOKE.arms) },
      romanesco: { centre_px: P(romC), tip_px: P(romC.clone().addScaledVector(romAxis, ROMANESCO.R * ROMANESCO.stretch)), centre_world: ROM_ISLAND.at, axis: ROM_ISLAND.axis, rule: ROMANESCO, florets: lat(rom, ROMANESCO.arms) },
      plan_time: shot.time || null, position: shot.position || null,
    };
  };
  // the mask twin (beam_<id>): the prism under the key strip (BEAM.src -> beamRect on the floor) white, everything else black
  if (shot.beamMask) { const S = BEAM.src, r = beamRect(-0.015);
    applyBeamMask(root, [prismSolid({ from: [[S.x - S.w / 2, S.y, S.z0], [S.x + S.w / 2, S.y, S.z0], [S.x + S.w / 2, S.y, S.z1], [S.x - S.w / 2, S.y, S.z1]],
      to: [[r.x0, r.y, r.z0], [r.x1, r.y, r.z0], [r.x1, r.y, r.z1], [r.x0, r.y, r.z1]] })], { label: 'key strip prism (mask)', cam, surfaceOnly: !!shot.beamSurf }); }
  return { set: 'market93', scene, root, cam, rig, near: shot.near ?? 0.2, far: shot.far ?? 12, figs, book: null, panes: {}, lights: lightList,
    header: shot.header || '', subject: shot.subject ? V(shot.subject) : artC.clone(), litBg: 0x0a0b0e, flatBg: shot.beamMask ? 0x000000 : 0xcfcfcf, shadowLine: false, extra: extraOut };
}
