// Build one office91 shot: room (from layout.js) + furniture + handout + figures + hand props + the tube rig per mode.
import { THREE, mk, box, cyl, ball, quad, tag, V, rad, addCast, CHILD_PROP, wall, beamMeshes, undraw, resolvePts, fixLeftHands, chair, tableRect } from './common.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { CAST, PROP } from '../../engine/mannequin.js';
import { chestPoint } from '../../engine/humanMesh.js';
import { aim } from '../../engine/aim.js';
import { prismSolid, splitAtTop, applyBeamMask } from '../_beam.js';
import { ROOM, TABLE, TUBE, CUT, TROFFER, BEAM, BEAM_SOURCE, beamFootprint, inBeam, HANDOUT, cellPitch, cell, rowCount, GAP, ANXIOUS, LABELS, SEATS, CHAIR, DICT, DAD_PALM, CLIPBOARD, DOOR, WINDOW, CABINET, SHELF, DESK, CLOCK, ALPHA, BOARD, ART, HALL_ART, HALL, HALL_LIGHT, HALL_BOARD } from './layout.js';
import { ART_TEX, alphabetCard, clockFace, SW_PRINT, decalMesh } from './art.js';
import { artPlane } from '../_art.js';

// set-local extra only; little Jade (7) = `jade7`, Mama = `mama91` and `dad` come from ../_cast.js
addCast({
  sw: { name: 'social worker (face undrawn)', h: 1.65, kind: 'adult', skin: 0xe2b9a0, hair: 0x6a4a30, top: 0x7a9a8a, legs: 0x3a3e4a, hairStyle: 'bob', sleeves: 'long', undrawn: true },
}, CHILD_PROP);

const WALL = { grey: 0.8, col: 0xcfc9b8 }, CARPET = { grey: 0.45, col: 0x5a5f68, recvShadowLine: true }, LAM = { grey: 0.7, col: 0xb8a888, recvShadowLine: true }, STEEL = { grey: 0.6, col: 0x8a8a80 }, DARK = { grey: 0.25, col: 0x2a2a2a };
const TOP = TABLE.h;

function room() {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h, wallT: t } = ROOM;
  g.add(tag(box(x1 - x0 + 2 * t, 0.04, z1 - z0 + 2 * t, CARPET, [0, -0.02, (z0 + z1) / 2]), 'carpet'));
  // drop ceiling with the troffer's aperture cut out of it, and a shallow housing above
  { const T = TROFFER, zc = TUBE.cz + T.lampGap / 2;
    const sh = new THREE.Shape(); sh.moveTo(x0 - t, z0 - t); sh.lineTo(x1 + t, z0 - t); sh.lineTo(x1 + t, z1 + t); sh.lineTo(x0 - t, z1 + t); sh.lineTo(x0 - t, z0 - t);
    const p = new THREE.Path(); p.moveTo(TUBE.cx - T.w / 2, zc - T.d / 2); p.lineTo(TUBE.cx - T.w / 2, zc + T.d / 2); p.lineTo(TUBE.cx + T.w / 2, zc + T.d / 2); p.lineTo(TUBE.cx + T.w / 2, zc - T.d / 2); p.lineTo(TUBE.cx - T.w / 2, zc - T.d / 2); sh.holes.push(p);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }); geo.rotateX(Math.PI / 2); geo.translate(0, h + 0.03, 0);   // (x, s, d) -> (x, y = -d, z = s)
    g.add(tag(mk(geo, { grey: 0.85, col: 0xd8d6cc }), 'drop ceiling'));
    const HS = { grey: 0.7, col: 0xa8a8a0, noCast: true };
    g.add(tag(box(T.w + 0.04, 0.01, T.d + 0.04, HS, [TUBE.cx, h + 0.1, zc]), 'troffer (two lamps, one dead)'));
    for (const s of [-1, 1]) { g.add(tag(box(T.w + 0.04, 0.1, 0.01, HS, [TUBE.cx, h + 0.05, zc + s * (T.d / 2 + 0.005)]), 'troffer (two lamps, one dead)')); g.add(tag(box(0.01, 0.1, T.d, HS, [TUBE.cx + s * (T.w / 2 + 0.005), h + 0.05, zc]), 'troffer (two lamps, one dead)')); }
    g.add(tag(cyl(TUBE.r, TUBE.r, TUBE.len, { grey: 1, col: 0xffffff, emit: TUBE.color, emitI: 1.4, flatEmit: 0.98, noCast: true }, [TUBE.cx, TUBE.y, TUBE.cz], [0, 0, 90], 12), 'fluorescent tube (the one that works)'));
    g.add(tag(cyl(TUBE.r, TUBE.r, TUBE.len, { grey: 0.5, col: 0x6a6a66, noCast: true }, [TUBE.cx, TUBE.y, TUBE.cz + T.lampGap], [0, 0, 90], 12), 'dead tube')); }
  g.add(wall({ axis: 'x', at: x0, a0: z0 - t, a1: z1 + t, h: h + 0.03, t, out: -1, look: WALL, label: 'left wall' }));
  g.add(wall({ axis: 'x', at: x1, a0: z0 - t, a1: z1 + t, h: h + 0.03, t, out: 1, look: WALL, label: 'right wall' }));
  g.add(wall({ axis: 'z', at: z0, a0: x0, a1: x1, h: h + 0.03, t, out: -1, look: WALL, label: 'back wall (bare: toner labels go here)' }));
  g.add(wall({ axis: 'z', at: z1, a0: x0, a1: x1, h: h + 0.03, t, out: 1, look: WALL, label: 'front wall' }));
  // door (closed) on the left wall, with a narrow wired-glass light
  { const D = DOOR, grp = new THREE.Group(), FR = { grey: 0.5, col: 0x6a5a48 };
    grp.add(box(0.03, D.h, D.w, { grey: 0.6, col: 0x8a7458 }, [D.x + 0.015, D.h / 2, D.z]));
    grp.add(box(0.04, 0.06, D.w + 0.12, FR, [D.x + 0.02, D.h + 0.03, D.z])); for (const s of [-1, 1]) grp.add(box(0.04, D.h, 0.06, FR, [D.x + 0.02, D.h / 2, D.z + s * (D.w / 2 + 0.03)]));
    grp.add(box(0.035, 0.6, 0.12, { grey: 0.35, col: 0x3a4248 }, [D.x + 0.018, 1.45, D.z + 0.25])); grp.add(ball(0.03, STEEL, [D.x + 0.07, 1.0, D.z - D.w / 2 + 0.08]));
    g.add(tag(grp, 'door (closed)')); }
  // window on the right wall, mini-blinds shut
  { const W = WINDOW, grp = new THREE.Group(), FR = { grey: 0.55, col: 0x8a8478 };
    grp.add(box(0.03, 0.05, W.w + 0.1, FR, [W.x - 0.015, W.sill + W.h + 0.025, W.z])); grp.add(box(0.1, 0.03, W.w + 0.1, FR, [W.x - 0.05, W.sill - 0.015, W.z]));
    for (let k = 0; k < 22; k++) grp.add(box(0.012, 0.042, W.w, { grey: 0.78, col: 0xc8c4b4 }, [W.x - 0.02, W.sill + 0.025 + k * 0.05, W.z]));
    g.add(tag(grp, 'window (blinds shut)')); }
  return g;
}

// r4 (2026-11-26): the meeting table as a real US school activity table of about 1991 (the Virco / Krueger kind):
// a 1-1/8" (29 mm) particleboard top faced with almond woodgrain laminate, square corners eased to a 25 mm radius,
// wrapped in a dark brown vinyl T-mould edge band; a steel channel apron 75 mm deep, set 45 mm in from the edge, in
// almond enamel; four height-adjustable legs: a 32 mm square almond steel upper tube with a row of adjustment holes,
// a 25 mm chrome round insert below it, a black nylon glide; a steel corner bracket at each leg. The top surface stays
// at TABLE.h; its footprint stays TABLE.w x TABLE.d.
const TBL = { top: 0.029, band: 0.004, r: 0.025, apronH: 0.075, apronIn: 0.045, apronT: 0.018, leg: 0.032, legIn: 0.07, insertR: 0.0115, sleeveLow: 0.36, glideH: 0.014,
  LAMINATE: { grey: 0.8, col: 0xd9caa6, recvShadowLine: true }, BAND: { grey: 0.3, col: 0x4a3626 }, CORE: { grey: 0.62, col: 0xb09a74 },
  ENAMEL: { grey: 0.66, col: 0xc2b698 }, CHROME: { grey: 0.82, col: 0xc8ccd0 }, GLIDE: { grey: 0.12, col: 0x1c1c1c }, HOLE: { grey: 0.15, col: 0x2a2620 } };
function roundRect(w, d, r) { const s = new THREE.Shape(), x = w / 2, z = d / 2;
  s.moveTo(-x + r, -z); s.lineTo(x - r, -z); s.quadraticCurveTo(x, -z, x, -z + r); s.lineTo(x, z - r); s.quadraticCurveTo(x, z, x - r, z);
  s.lineTo(-x + r, z); s.quadraticCurveTo(-x, z, -x, z - r); s.lineTo(-x, -z + r); s.quadraticCurveTo(-x, -z, -x + r, -z); return s; }
function schoolTable(T) {
  const g = new THREE.Group(), K = TBL, y1 = T.h, y0 = T.h - K.top;
  const slabGeo = (shape, h) => { const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 6 }); geo.rotateX(Math.PI / 2); return geo; };   // shape (x, z) -> extruded down from y = 0
  // laminate face (a skin on the core), the particleboard core, and the T-mould band round the edge, 1 mm proud of the top
  const face = mk(slabGeo(roundRect(T.w - 2 * K.band, T.d - 2 * K.band, K.r), 0.0012), K.LAMINATE); face.position.set(T.cx, y1, T.cz); g.add(face);
  const core = mk(slabGeo(roundRect(T.w - 2 * K.band, T.d - 2 * K.band, K.r), K.top - 0.0012), K.CORE); core.position.set(T.cx, y1 - 0.0012, T.cz); g.add(core);
  { const ring = roundRect(T.w, T.d, K.r + K.band); ring.holes.push(roundRect(T.w - 2 * K.band, T.d - 2 * K.band, K.r));
    const b = mk(slabGeo(ring, K.top + 0.001), K.BAND); b.position.set(T.cx, y1 + 0.001, T.cz); g.add(b); }
  // apron: four steel channels under the top (a vertical web with a short return flange at the bottom)
  const ax = T.w / 2 - K.apronIn, az = T.d / 2 - K.apronIn, ay = y0 - K.apronH / 2;
  for (const s of [-1, 1]) {
    g.add(box(2 * ax, K.apronH, 0.0025, K.ENAMEL, [T.cx, ay, T.cz + s * az])); g.add(box(2 * ax, 0.0025, K.apronT, K.ENAMEL, [T.cx, y0 - K.apronH + 0.00125, T.cz + s * (az - K.apronT / 2)]));
    g.add(box(0.0025, K.apronH, 2 * az, K.ENAMEL, [T.cx + s * ax, ay, T.cz])); g.add(box(K.apronT, 0.0025, 2 * az, K.ENAMEL, [T.cx + s * (ax - K.apronT / 2), y0 - K.apronH + 0.00125, T.cz]));
  }
  // legs, inside the apron corners
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const lx = T.cx + sx * (T.w / 2 - K.legIn), lz = T.cz + sz * (T.d / 2 - K.legIn);
    g.add(box(K.leg, y0 - K.sleeveLow, K.leg, K.ENAMEL, [lx, (y0 + K.sleeveLow) / 2, lz]));                       // upper square tube
    for (let k = 0; k < 6; k++) g.add(box(0.007, 0.007, 0.0015, K.HOLE, [lx, K.sleeveLow + 0.05 + k * 0.025, lz + sz * (K.leg / 2 + 0.0004)]));   // adjustment holes (outer face)
    g.add(box(K.leg + 0.004, 0.012, K.leg + 0.004, K.ENAMEL, [lx, K.sleeveLow + 0.006, lz]));                     // collar at the sleeve's foot
    g.add(cyl(K.insertR, K.insertR, K.sleeveLow - K.glideH + 0.02, K.CHROME, [lx, (K.sleeveLow + K.glideH) / 2, lz], null, 16));   // chrome insert
    g.add(cyl(0.017, 0.019, K.glideH, K.GLIDE, [lx, K.glideH / 2, lz], null, 16));                                 // glide
    // corner bracket: a steel plate bolted across the apron corner behind the leg
    const br = box(0.11, K.apronH * 0.8, 0.003, K.ENAMEL, [lx - sx * 0.016, ay, lz - sz * 0.016]); br.rotation.y = sx * sz > 0 ? Math.PI / 4 : -Math.PI / 4; g.add(br);
  }
  return tag(g, 'meeting table');
}

function furniture() {
  const g = new THREE.Group(); const T = TABLE;
  g.add(schoolTable(T));
  const CH = { grey: 0.4, col: 0x4a5a6a };
  g.add(chair(SEATS.jade[0], SEATS.jade[1] - 0.03, 0, { look: CH, label: "little Jade's chair" }));
  g.add(chair(SEATS.socialWorker[0], SEATS.socialWorker[1] + 0.03, 180, { look: CH, label: "social worker's chair" }));
  g.add(chair(SEATS.mom[0], SEATS.mom[1] - 0.03, 0, { look: CH, label: "Mom's chair" }));
  // r3: Dad stands behind Mom; his chair is pushed in at the table's +x end, empty
  g.add(chair(TABLE.cx + TABLE.w / 2 + 0.12, TABLE.cz, -90, { look: CH, label: "empty chair (Dad stands)" }));
  { const C = CABINET, cx = (C.x0 + C.x1) / 2, cz = (C.z0 + C.z1) / 2, grp = new THREE.Group(); grp.add(box(C.x1 - C.x0, C.h, C.z1 - C.z0, STEEL, [cx, C.h / 2, cz]));
    for (let k = 0; k < 4; k++) { grp.add(box(C.x1 - C.x0 - 0.04, 0.29, 0.012, { grey: 0.66, col: 0x9a9a90 }, [cx, 0.18 + k * 0.32, C.z1 + 0.006])); grp.add(box(0.1, 0.02, 0.02, DARK, [cx, 0.27 + k * 0.32, C.z1 + 0.02])); }
    g.add(tag(grp, 'filing cabinet')); g.add(tag(box(0.24, 0.12, 0.13, { grey: 0.7, col: 0x8aa0b8 }, [cx, C.h + 0.06, cz + 0.1]), 'box of tissues')); }
  { const S = SHELF, cx = (S.x0 + S.x1) / 2, cz = (S.z0 + S.z1) / 2, d = S.z1 - S.z0, grp = new THREE.Group(), WD = { grey: 0.5, col: 0x8a6a48 };
    for (const y of [0.02, 0.45, S.h - 0.01]) grp.add(box(S.x1 - S.x0, 0.02, d, WD, [cx, y, cz])); for (const s of [-1, 1]) grp.add(box(S.x1 - S.x0, S.h, 0.02, WD, [cx, S.h / 2, cz + s * (d / 2 - 0.01)]));
    g.add(tag(grp, 'low bookshelf'));
    for (let k = 0; k < 4; k++) g.add(tag(box(0.24, 0.045, 0.36, { grey: 0.5 + k * 0.08, col: [0xb04030, 0x3a6a9a, 0xd0a030, 0x4a8a5a][k] }, [cx, 0.055 + k * 0.047, cz - 0.3]), 'board games'));
    for (let k = 0; k < 9; k++) g.add(tag(box(0.2, 0.26 - (k % 3) * 0.03, 0.03, { grey: 0.4 + (k % 4) * 0.1, col: [0x7a3a2a, 0x3a5a7a, 0x4a6a3a, 0xa08a50][k % 4] }, [cx, 0.46 + (0.26 - (k % 3) * 0.03) / 2, cz + 0.05 + k * 0.034]), 'books')); }
  { const D = DESK, grp = new THREE.Group(); grp.add(box(D.w, 0.03, D.d, { grey: 0.55, col: 0x7a6248 }, [D.cx, D.h - 0.015, D.cz]));
    for (const s of [-1, 1]) grp.add(box(D.w - 0.04, D.h - 0.03, 0.03, STEEL, [D.cx, (D.h - 0.03) / 2, D.cz + s * (D.d / 2 - 0.02)]));
    g.add(tag(grp, "social worker's desk")); g.add(tag(box(0.3, 0.12, 0.38, { grey: 0.7, col: 0xc8c0a8 }, [D.cx + 0.1, D.h + 0.06, D.cz + 0.2]), 'electric typewriter'));
    g.add(tag(box(0.2, 0.07, 0.22, { grey: 0.65, col: 0xb8b09a }, [D.cx + 0.05, D.h + 0.035, D.cz - 0.3]), 'telephone')); }
  g.add(tag(cyl(CLOCK.r, CLOCK.r, 0.04, { grey: 0.9, col: 0xe8e8e0 }, [CLOCK.x, CLOCK.y, ROOM.z0 + 0.02], [90, 0, 0]), 'wall clock'));
  { const f = mk(new THREE.CircleGeometry(CLOCK.r * 0.97, 48), { noCast: true, ...artLookOf(clockFace()) }); f.position.set(CLOCK.x, CLOCK.y, ROOM.z0 + 0.0405); g.add(tag(f, 'wall clock')); }   // 2026-11-26: fixed face
  g.add(wallArt());
  // on the table: the social worker's clipboard and pen, a pencil cup
  { const c = new THREE.Group(); c.position.set(CLIPBOARD.at[0], TOP, CLIPBOARD.at[1]); c.rotation.y = rad(CLIPBOARD.yaw);
    c.add(box(0.23, 0.006, 0.32, { grey: 0.4, col: 0x6a4a30 }, [0, 0.003, 0])); c.add(box(0.21, 0.002, 0.28, { grey: 0.95, col: 0xf0f0ea }, [0, 0.007, -0.01])); c.add(box(0.1, 0.012, 0.03, STEEL, [0, 0.012, 0.14]));
    g.add(tag(c, 'clipboard (her notes)')); }
  g.add(tag(cyl(0.035, 0.035, 0.1, { grey: 0.45, col: 0x3a5a8a }, [0.58, TOP + 0.05, 0.24]), 'pencil cup'));
  return g;
}

// ---------------------------------------------------------------- r3: children's art on the back wall, and the corridor
const PAPERS = [0xc8783a, 0xd8b048, 0x8a5a3a, 0xb04a3a, 0x5a7a4a, 0xe0c890, 0x7a8ab0];
// a handprint turkey: a child's hand traced on construction paper, fingers = feathers, thumb = head (flat shape, in a plane
// facing `n`). Drawn in a local xy plane, then placed.
function handprint(s) {
  const sh = new THREE.Shape(); sh.absarc(0, -0.1 * s, 0.26 * s, 0, Math.PI * 2, false);
  const g = new THREE.Group(); g.add(mk(new THREE.ShapeGeometry(sh, 16), { grey: 0.45, col: 0x7a4a2a }));
  [[-0.5, 0.42], [-0.18, 0.62], [0.16, 0.62], [0.46, 0.44]].forEach(([dx, h], k) => {   // four fingers fanned up = feathers
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.075 * s, h * s, 4, 8)); const m = mk(f.geometry, { grey: 0.5 + 0.06 * k, col: [0xc04a2a, 0xe0a030, 0x6a8a3a, 0xd06a2a][k] });
    m.position.set(dx * 0.5 * s, 0.25 * s + h * s * 0.45, 0.0005 * (k + 1)); m.rotation.z = -dx * 0.55; g.add(m); });
  const th = mk(new THREE.CapsuleGeometry(0.08 * s, 0.32 * s, 4, 8), { grey: 0.5, col: 0x8a5a3a }); th.position.set(-0.36 * s, -0.22 * s, 0.003); th.rotation.z = 1.1; g.add(th);   // thumb = head
  return g;
}
const artLookOf = (a) => ({ grey: 0.9, col: 0xeeeeee, art: a.art, artGrey: a.artGrey, artEdge: a.artEdge });
// 2026-11-26: a picture with a fixed image (layout/assets/art/office91) is that image on a plane; without one, the old shapes
function picture(w, h, kind, k, img) {
  if (img && ART_TEX[img]) { const m = artPlane(ART_TEX[img], w, h); const g = new THREE.Group(); g.add(m); return g; }
  const g = new THREE.Group(); const paper = kind === 'turkey' ? PAPERS[k % PAPERS.length] : 0xf4f0e6;
  g.add(mk(new THREE.PlaneGeometry(w, h), { grey: kind === 'turkey' ? 0.72 : 0.92, col: paper }));
  if (kind === 'turkey') { const t = handprint(Math.min(w, h) * 0.75); t.position.z = 0.0008; g.add(t); }
  else { // crayon drawing: a sun, a house or a person, a ground line
    const sun = mk(new THREE.CircleGeometry(h * 0.12, 16), { grey: 0.8, col: 0xe8c030 }); sun.position.set(w * 0.3, h * 0.3, 0.0008); g.add(sun);
    const ho = mk(new THREE.PlaneGeometry(w * 0.34, h * 0.3), { grey: 0.55, col: [0xb04030, 0x3a6aa0, 0x4a8a4a][k % 3] }); ho.position.set(-w * 0.12, -h * 0.12, 0.0008); g.add(ho);
    const gr = mk(new THREE.PlaneGeometry(w * 0.9, h * 0.05), { grey: 0.5, col: 0x4a8a3a }); gr.position.set(0, -h * 0.3, 0.0009); g.add(gr); }
  return g;
}
function wallArt() {
  const g = new THREE.Group(), z = ROOM.z0 + 0.003, put = (o, x, y, zz = z) => { o.position.set(x, y, zz); return o; };
  // the alphabet strip: 26 cards (an upper and lower case letter with a small picture each); the letters are the cards' print
  const A = ALPHA, cw = (A.x1 - A.x0) / A.n;
  for (let k = 0; k < A.n; k++) { const c = new THREE.Group(); c.add(alphabetCard(k, cw * 0.94, A.h));   // 2026-11-26: fixed cards (alphabet_cards.png)
    g.add(tag(put(c, A.x0 + (k + 0.5) * cw, A.y), 'alphabet strip (Aa to Zz cards)')); }
  // the cork board, with a scalloped paper border
  { const B = BOARD, w = B.x1 - B.x0, h = B.y1 - B.y0, bd = new THREE.Group();
    bd.add(box(w + 2 * B.frame, h + 2 * B.frame, 0.012, { grey: 0.55, col: 0xc04040 }, [0, 0, 0.006])); bd.add(box(w, h, 0.014, { grey: 0.62, col: 0xb89a6a }, [0, 0, 0.007]));
    g.add(tag(put(bd, (B.x0 + B.x1) / 2, (B.y0 + B.y1) / 2, ROOM.z0), 'bulletin board (cork, scalloped border)')); }
  ART.forEach(([x, y, w, h, kind, img], k) => { const onBoard = x > BOARD.x0 && x < BOARD.x1 && y > BOARD.y0 && y < BOARD.y1;
    g.add(tag(put(picture(w, h, kind, k, img), x, y, ROOM.z0 + (onBoard ? 0.016 : 0.003)), kind === 'turkey' ? 'handprint turkey (child art)' : "child's crayon drawing")); });
  return g;
}
function corridor() {
  const g = new THREE.Group(), H = HALL, cx = (H.x0 + H.x1) / 2, cz = (H.z0 + H.z1) / 2, W = { grey: 0.82, col: 0xd8d2c0 };
  g.add(tag(box(H.x1 - H.x0, 0.04, H.z1 - H.z0, { grey: 0.7, col: 0xc8c4b4, recvShadowLine: true }, [cx, -0.02, cz]), 'corridor floor (vinyl tile)'));
  g.add(tag(box(H.x1 - H.x0, 0.03, H.z1 - H.z0, { grey: 0.85, col: 0xd8d6cc }, [cx, H.h + 0.015, cz]), 'corridor ceiling'));
  g.add(tag(box(0.15, H.h, H.z1 - H.z0, W, [H.x0 - 0.075, H.h / 2, cz]), 'corridor far wall'));
  g.add(tag(box(0.012, 0.12, H.z1 - H.z0, { grey: 0.45, col: 0x6a6a60 }, [H.x1 - 0.006, 0.06, cz]), 'baseboard'));
  g.add(tag(box(0.012, 0.12, H.z1 - H.z0, { grey: 0.45, col: 0x6a6a60 }, [H.x0 + 0.006, 0.06, cz]), 'baseboard'));
  { const L = HALL_LIGHT; g.add(tag(box(L.w, 0.02, L.d, { grey: 1, col: 0xffffff, emit: 0xf4f8ff, emitI: 1.2, flatEmit: 0.98, noCast: true }, [L.x, L.y, L.z]), 'ceiling light panel (corridor)')); }
  // the counsellor's door from the corridor side: slab, frame, wired-glass light, a small nameplate
  { const D = DOOR, x = H.x1, grp = new THREE.Group(), FR = { grey: 0.5, col: 0x6a5a48 };
    grp.add(box(0.03, D.h, D.w, { grey: 0.6, col: 0x8a7458 }, [x - 0.015, D.h / 2, D.z]));
    grp.add(box(0.04, 0.06, D.w + 0.12, FR, [x - 0.02, D.h + 0.03, D.z])); for (const s of [-1, 1]) grp.add(box(0.04, D.h, 0.06, FR, [x - 0.02, D.h / 2, D.z + s * (D.w / 2 + 0.03)]));
    grp.add(box(0.035, 0.6, 0.12, { grey: 0.35, col: 0x3a4248 }, [x - 0.018, 1.45, D.z + 0.25])); grp.add(ball(0.03, STEEL, [x - 0.07, 1.0, D.z - D.w / 2 + 0.08]));
    g.add(tag(grp, "counselor's door (corridor side, closed)"));
    g.add(tag(box(0.01, 0.07, 0.25, { grey: 0.3, col: 0x2a3a4a }, [x - 0.005, 1.62, D.z - D.w / 2 - 0.22]), 'nameplate beside the door')); }
  // a corridor board of class art on the same wall, beyond her
  { const B = HALL_BOARD, w = B.z1 - B.z0, h = B.y1 - B.y0, bd = new THREE.Group();
    bd.add(box(0.012, h + 0.05, w + 0.05, { grey: 0.55, col: 0x3a5a9a }, [0, 0, 0])); bd.add(box(0.014, h, w, { grey: 0.62, col: 0xb89a6a }, [-0.002, 0, 0]));
    bd.position.set(H.x1 - 0.008, (B.y0 + B.y1) / 2, (B.z0 + B.z1) / 2); g.add(tag(bd, 'corridor bulletin board (class art)'));
    for (let k = 0; k < 8; k++) { const p = picture(0.24, 0.2, k % 3 === 0 ? 'turkey' : 'drawing', k + 3, HALL_ART[k]); p.rotation.y = -Math.PI / 2;
      p.position.set(H.x1 - 0.018, B.y0 + 0.2 + (k % 2) * 0.38, B.z0 + 0.2 + Math.floor(k / 2) * 0.37); g.add(tag(p, 'class art (corridor)')); } }
  return g;
}

// the handout: sheet, title bar, a disc per cartoon face and a bar per printed label
function handout() {
  const g = new THREE.Group(), H = HANDOUT, INK = { grey: 0.15, col: 0x222018 };
  g.add(tag(box(H.w, H.t, H.h, { grey: 0.9, col: H.color, recvShadowLine: true }, [H.cx, TOP + H.t / 2, H.cz]), 'yellow handout'));
  g.add(tag(box(H.w * 0.72, 0.0004, 0.012, INK, [H.cx, TOP + H.t + 0.0002, H.cz + H.h / 2 - 0.02]), 'handout title'));
  for (let r = 0; r < H.rows; r++) for (let c = 0; c < rowCount(r); c++) { const p = cell(r, c);
    const short = r === H.shortRow, name = short ? `handout: the short row (${H.shortCount} faces)` : 'handout: cartoon faces with labels';
    g.add(tag(cyl(H.faceR, H.faceR, 0.0005, { grey: 0.97, col: 0xf8ec9a }, [p[0], p[1] + 0.00025, p[2]], null, 20), name));
    g.add(tag(box(H.labelW, 0.0004, 0.0035, INK, [p[0], p[1] + 0.0002, p[2] - H.faceR - 0.0055]), name)); }
  return g;
}
const handoutCorners = () => { const H = HANDOUT, y = TOP + H.t; return [[H.cx + H.w / 2, y, H.cz + H.h / 2], [H.cx - H.w / 2, y, H.cz + H.h / 2], [H.cx - H.w / 2, y, H.cz - H.h / 2], [H.cx + H.w / 2, y, H.cz - H.h / 2]]; };

const NAMES = { handout: [HANDOUT.cx, TOP, HANDOUT.cz], gap: GAP, anxious: ANXIOUS, dict: DICT.at, dadPalm: DAD_PALM, tube: [TUBE.cx, TUBE.y, TUBE.cz],
  shortRow: [HANDOUT.cx, TOP, GAP[2]], wallSpace: [-0.95, 1.1, ROOM.z0], door: [HALL.x1, 1.2, DOOR.z] };

export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(room()); root.add(furniture()); root.add(handout()); root.add(corridor());
  const extra = (t) => (NAMES[t] ? V(NAMES[t]) : null);
  const { figs } = stage(shot.figs, null, extra);
  fixLeftHands(figs);
  for (const [who, f] of Object.entries(figs)) { if (CAST[who].undrawn) undraw(f); root.add(f); }
  // the sweatshirt print: the thing her eyes rest on
  if (figs.sw && SW_PRINT.tex) {   // 2026-11-26: the canonical print (logos/sw_tree_print.png, art.js), a flat decal on the chest; to move it onto a body mesh, change only place()
    const P = figs.sw.userData.P, pr = PROP.adult, H = P.H, c0 = P.chest.clone().addScaledVector(P.cz, pr.chestD * H * 0.5 - 0.018).addScaledVector(P.cy, 0.0);
    const flat = (s, t) => c0.clone().addScaledVector(P.cx, (s - 0.5) * SW_PRINT.w).addScaledVector(P.cy, (t - 0.5) * SW_PRINT.h);
    const vc = P.chest.clone().sub(P.shoulderC).dot(P.cy);   // PROOF_BODY=mesh: the print conforms to the sweatshirt (engine/humanMesh.js chestPoint)
    const m = decalMesh(SW_PRINT.tex, (s, t) => chestPoint(figs.sw, (s - 0.5) * SW_PRINT.w, vc + (t - 0.5) * SW_PRINT.h) || flat(s, t), { grey: 0.6, col: 0x7a9a8a });
    m.userData.who = 'sw'; root.add(tag(m, 'sweatshirt print (Christmas tree, cracked)')); }
  else if (figs.sw) { const P = figs.sw.userData.P, pr = PROP.adult, H = P.H; const m = box(0.2, 0.13, 0.004, { grey: 0.88, col: 0xe8e0c8 });
    m.position.copy(P.chest.clone().addScaledVector(P.cz, pr.chestD * H * 0.5 - 0.022).addScaledVector(P.cy, 0.02)); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(P.cx, P.cy, P.cz)); root.add(tag(m, 'sweatshirt print')); }
  // the little red dictionary in Mom's hands, open, pages fanning under her thumb
  if (figs.mama91) { const d = new THREE.Group(); d.position.set(...DICT.at); d.rotation.set(rad(-50), 0, 0);
    d.add(box(DICT.w * 2, 0.004, DICT.h, { grey: 0.35, col: DICT.color }, [0, -0.008, 0]));
    for (const s of [-1, 1]) d.add(box(DICT.w - 0.004, DICT.t / 2, DICT.h - 0.006, { grey: 0.92, col: 0xf0ead8 }, [s * DICT.w / 2, 0, 0]));
    for (let k = 0; k < 4; k++) { const pg = box(DICT.w - 0.006, 0.0006, DICT.h - 0.008, { grey: 0.96, col: 0xf6f0e0 }, [-(DICT.w - 0.006) / 2, 0, 0]); const hd = new THREE.Group(); hd.position.set(0, DICT.t / 4, 0); hd.rotation.z = rad(-25 - k * 28); hd.add(pg); d.add(hd); }
    root.add(tag(d, 'little red dictionary')); }
  const foot = beamFootprint(TOP), footFloor = beamFootprint(0);
  root.add(beamMeshes(BEAM_SOURCE, footFloor, { lit: 0xeef4ff, haze: 0.035, tint: 'rgba(255,190,30,0.08)', foot: 'rgba(255,160,0,0.18)' }));
  root.add(beamMeshes(BEAM_SOURCE, foot, { tint: 'rgba(255,190,30,0.0)', haze: 0, lift: [0, 0.004, 0] }));   // footprint on the table top
  if (shot.hide) root.traverse((o) => { if (o.isMesh && shot.hide.includes(o.userData.label)) { o.visible = false; o.userData.baseVisible = false; } });
  resolvePts(shot, (t) => NAMES[t] || null, figs);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  const tubeP = V(NAMES.tube);
  const lightList = [{ name: 'fluorescent_tube', kind: BEAM.kind, pos: tubeP, aim: V(NAMES.handout), color: '#eef4ff', on: true }];
  const rig = (mode) => {
    const L = []; if (mode === 'none' || shot.beamMask) return L; const white = mode !== 'lit';
    if (shot.hall) {   // the corridor: one diffused ceiling panel over her, soft; the office tube is behind the wall
      const s = new THREE.SpotLight(0xffffff, mode === 'lit' ? 3.0 : 1.4, 0, rad(62), 0.7, 0); s.position.set(HALL_LIGHT.x, HALL_LIGHT.y - 0.03, HALL_LIGHT.z); s.target.position.set(HALL_LIGHT.x + 0.5, 0, HALL_LIGHT.z);
      s.castShadow = true; s.shadow.camera.near = 0.3; s.shadow.camera.far = 5; s.shadow.radius = 8; L.push(s);
      L.push(new THREE.AmbientLight(mode === 'lit' ? 0x9aa0a8 : 0xffffff, mode === 'lit' ? 0.7 : 1.5));
      if (mode !== 'lit') { const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(-3, 3, 2); L.push(d); }
      return L; }
    // three spots along the tube, straight down, each cut at CUT.across: together a stadium close to the wedge's footprint
    for (const dx of [-0.27, 0, 0.27]) { const s = new THREE.SpotLight(white ? 0xffffff : TUBE.color, mode === 'lit' ? 2.6 : mode === 'mask' ? 6 : 1.0, 0, rad(CUT.across), 0.12, 0);
      s.position.set(TUBE.cx + dx, TUBE.y - 0.02, TUBE.cz); s.target.position.set(TUBE.cx + dx, 0, TUBE.cz); s.castShadow = true; s.shadow.camera.near = 0.3; s.shadow.camera.far = 4; s.shadow.radius = mode === 'lit' ? 5 : 1; L.push(s); }
    if (mode === 'mask') return L;
    if (mode === 'lit') { const b = new THREE.PointLight(0xfff0b0, 0.35, 2.2, 1.4); b.position.set(HANDOUT.cx, TOP + 0.15, HANDOUT.cz); L.push(b); L.push(new THREE.AmbientLight(0x7a8088, shot.light?.amb ?? 0.55)); }
    else { L.push(new THREE.AmbientLight(0xffffff, 1.5)); const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(1, 3, 2); L.push(d); }
    return L;
  };
  const extraOut = (c, P) => {
    const inB = {}; for (const [who, f] of Object.entries(figs)) { const Q = f.userData.P; inB[who] = { head: inBeam(Q.head.toArray()), eyes: inBeam(Q.eyes.toArray()), handL: inBeam(Q.handL.toArray()), handR: inBeam(Q.handR.toArray()), chest: inBeam(Q.chest.toArray()) }; }
    const cells = []; for (let r = 0; r < HANDOUT.rows; r++) for (let cc = 0; cc < rowCount(r); cc++) { const p = cell(r, cc); cells.push({ row: r, col: cc, label: LABELS[r][cc], world: p.map((v) => +v.toFixed(4)), px: P(V(p)) }); }
    return { beam: { kind: BEAM.kind, travel_dir: [0, -1, 0], cutoff_deg: CUT, source_world: BEAM_SOURCE, source_px: BEAM_SOURCE.map((p) => P(V(p))),
      footprint_table_world: foot.map((p) => p.map((v) => +v.toFixed(3))), footprint_table_px: foot.map((p) => P(V(p))), footprint_floor_world: footFloor.map((p) => p.map((v) => +v.toFixed(3))), footprint_floor_px: footFloor.map((p) => P(V(p))),
      note: 'the lit volume is the wedge between the tube (source) and footprint_floor, minus what stands in it; footprint_table is its section at the table top', in_beam: inB },
      handout: { corners_world: handoutCorners(), corners_px: handoutCorners().map((p) => P(V(p))), corner_order: 'TL, TR, BR, BL as little Jade reads the page (a flat page image maps straight on)',
        cells, row_counts: Array.from({ length: HANDOUT.rows }, (_, r) => rowCount(r)), rows_centred: true, gap_world: GAP.map((v) => +v.toFixed(4)), gap_px: P(V(GAP)), anxious_px: P(V(ANXIOUS)), cell_pitch_m: cellPitch, face_radius_m: HANDOUT.faceR },
      times: shot.t || null };
  };
  // the mask twin (beam_<id>): the tube's louvred wedge white (source rectangle -> floor footprint; under the table top
  // only what falls outside the top), everything else black
  if (shot.beamMask) applyBeamMask(root, splitAtTop((clip) => prismSolid({ from: BEAM_SOURCE, to: beamFootprint(-0.015), clip }),
    { x0: TABLE.cx - TABLE.w / 2, x1: TABLE.cx + TABLE.w / 2, z0: TABLE.cz - TABLE.d / 2, z1: TABLE.cz + TABLE.d / 2, y: TABLE.h }), { label: 'tube wedge (mask)', cam, surfaceOnly: !!shot.beamSurf });
  return { set: 'office91', scene, root, cam, rig, near: shot.near ?? 0.2, far: shot.far ?? 6, figs, book: null, panes: {}, lights: lightList,
    header: shot.header || '', shadowLine: !shot.beamMask && shot.beamLine !== false, shadowPolys: null, subject: V(shot.subject || NAMES.handout), litBg: 0x0c0d10, flatBg: shot.beamMask ? 0x000000 : undefined, extra: extraOut };
}
