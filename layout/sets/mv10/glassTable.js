// The semicircular glass-top console at the NNE (core) wall, from Jade's three photos of the real table
// (inputs/refs_semicircletable/, 2026-11-26). Every number is in layout.js GLASS_TABLE; this file only builds it.
//
// Frame: u along the wall (world +Z), v out from the wall face (world -X), y up. World X = wallX - v, Z = zc + u.
// The top is a circular segment (chord W on the wall, sagitta D at the centre). The frame is dark oil-rubbed bronze
// round rod: a D-shaped rim (the arc under the glass edge plus a straight back rail), two front legs that are each a
// pair of bowed rods meeting at one foot (a "lens"), and the cross-brace: four lower rods from the
// two front feet and two back feet by the wall up to a knotted collar near the middle of the plan, four upper rods from the collar out to the rim and back
// rail as S-scrolls (the arcs seen through the glass from above).
import * as THREE from 'three';
import { mk, tag } from '../../engine/core.js';

export function glassTable(G) {
  const g = new THREE.Group(), L = 'semicircular glass-top console table';
  const BRONZE = { grey: 0.16, col: G.metal ?? 0x3b2c20 }, GLASS = { glass: true, col: 0x9ac0b8, opacity: 0.35, grey: 0.8 };
  const W2 = G.W / 2, D = G.D, R = (W2 * W2 + D * D) / (2 * D), c = D - R, a0 = Math.asin(W2 / R);    // circle centre at v = c (behind the wall)
  const P = (u, y, v) => new THREE.Vector3(G.wallX - v, y, G.zc + u);
  // a point on the rim arc at angle al (0 = the apex, +-a0 = the wall ends), pulled in by `inset` from the glass edge
  const r = (d) => d * Math.PI / 180;   // GLASS_TABLE angles are in degrees from the apex
  const arc = (al, inset = 0) => [(R - inset) * Math.sin(al), c + (R - inset) * Math.cos(al)];
  const tube = (pts, r, label, closed = false) => {
    const curve = new THREE.CatmullRomCurve3(pts, closed, 'centripetal');
    return g.add(tag(mk(new THREE.TubeGeometry(curve, Math.max(24, pts.length * 16), r, 10, closed), BRONZE), `${L} (${label})`)); };

  // the glass: a circular segment, flat side 5 mm off the wall
  { const sh = new THREE.Shape(), n = 48;
    for (let k = 0; k <= n; k++) { const al = -a0 + 2 * a0 * k / n, [u, v] = arc(al); k ? sh.lineTo(u, v) : sh.moveTo(u, v); }
    sh.lineTo(-W2, 0);
    // shape (x = u, y = v) extruded up: world X = wallX - 0.005 - v, Y = h - glass + z, Z = zc + u
    const top = mk(new THREE.ExtrudeGeometry(sh, { depth: G.glass, bevelEnabled: false, curveSegments: 4 }), GLASS);
    top.matrixAutoUpdate = false; top.matrix.set(0, -1, 0, G.wallX - 0.005, 0, 0, 1, G.h - G.glass, 1, 0, 0, G.zc, 0, 0, 0, 1);
    g.add(tag(top, `${L} (glass top, ${Math.round(G.glass * 1000)} mm, green edge)`)); }

  const yRim = G.h - G.glass - G.rimR, ins = G.overhang + G.rimR, vb = G.backInset;
  // the rim: the arc under the glass edge, and the straight back rail along the wall (a closed D)
  { const pts = []; const aE = Math.asin((W2 - ins) / (R - ins));
    for (let k = 0; k <= 32; k++) { const [u, v] = arc(-aE + 2 * aE * k / 32, ins); pts.push(P(u, yRim, Math.max(v, vb))); }
    tube(pts, G.rimR, 'rim, bronze rod');
    const uE = arc(aE, ins)[0];
    tube([P(-uE, yRim, vb), P(0, yRim, vb), P(uE, yRim, vb)], G.rimR, 'back rail, bronze rod'); }

  const knot = P(G.knot.u, G.knot.y, G.knot.v), feet = [];
  for (const s of [-1, 1]) {
    // front leg: two bowed rods from the rim (alA nearer the wall end, alB nearer the apex) to one foot
    const F = G.frontLeg, [fu, fv] = arc(s * r(F.foot), F.footIn), foot = P(fu, G.footR, fv); feet.push(foot);
    for (const [al, bow] of [[F.alA, F.bowA], [F.alB, F.bowB]]) {
      const [tu, tv] = arc(s * r(al), ins), top = P(tu, yRim - G.rimR, tv);
      // bow: the rod's middle is pulled toward the knot's plan position (a ")" seen from the end of the table)
      const mid = (t, k) => { const p = top.clone().lerp(foot, t); const toK = P(G.knot.u, p.y, G.knot.v).sub(p); toK.y = 0; return p.addScaledVector(toK, k); };
      tube([top, mid(0.22, bow * 0.75), mid(0.5, bow), mid(0.8, bow * 0.6), foot.clone().add(new THREE.Vector3(0, 0.01, 0))], G.rodR, 'front leg, bronze rod'); }
    // back foot: the cross-brace's back rods come down to the floor by the wall (no back leg up to the rail: none shows)
    const bf = P(s * G.backFoot.u, G.footR, G.backFoot.v); feet.push(bf);
    // cross-brace, lower: from each foot in and up to the collar, concave (splays out low, steep into the collar)
    for (const f of [foot, bf]) { const m1 = f.clone().lerp(knot, 0.45); m1.y = G.footR + (knot.y - G.footR) * 0.18;
      const m2 = f.clone().lerp(knot, 0.8); m2.y = knot.y - 0.08;
      tube([f.clone().add(new THREE.Vector3(0, 0.012, 0)), m1, m2, knot.clone().add(new THREE.Vector3(0, -0.02, 0))], G.rodR, 'cross-brace (lower), bronze rod'); }
    // cross-brace, upper: from the collar up and out to the rim arc (near the apex) and to the back rail, as S-scrolls
    { const U = G.upper, [tu, tv] = arc(s * r(U.alFront), ins), tF = P(tu, yRim - G.rimR, tv), tB = P(s * U.uBack, yRim - G.rimR, vb);
      for (const [t, sw] of [[tF, U.swingFront], [tB, U.swingBack]]) {
        const k0 = knot.clone().add(new THREE.Vector3(0, 0.02, 0));
        // rises steeply out of the collar, then sweeps out toward its end of the table: a "(" in side view
        const q1 = k0.clone().lerp(t, U.k1); q1.y = knot.y + (t.y - knot.y) * 0.35;
        const q2 = k0.clone().lerp(t, U.k2); q2.y = knot.y + (t.y - knot.y) * 0.72; q2.z += s * sw;
        const q3 = k0.clone().lerp(t, 0.82); q3.y = t.y - 0.03;
        tube([k0, q1, q2, q3, t], G.rodR, 'cross-brace (upper scroll), bronze rod'); } } }

  // the knotted collar: two rolled rings with a binding between them, around the rods where they cross
  { const ring = (dy, r) => { const m = mk(new THREE.TorusGeometry(r, G.rodR * 1.25, 8, 20), BRONZE); m.rotation.x = Math.PI / 2; m.position.copy(knot).add(new THREE.Vector3(0, dy, 0)); return m; };
    g.add(tag(ring(0.014, G.knot.r), `${L} (knotted collar)`)); g.add(tag(ring(-0.014, G.knot.r), `${L} (knotted collar)`));
    const core = mk(new THREE.CylinderGeometry(G.knot.r * 0.85, G.knot.r * 0.85, 0.05, 14), BRONZE); core.position.copy(knot); g.add(tag(core, `${L} (knotted collar)`)); }
  // feet: small flattened pads where the rods meet the floor
  for (const f of feet) { const m = mk(new THREE.SphereGeometry(G.footR * 1.6, 12, 8), BRONZE); m.scale.set(1, 0.55, 1); m.position.copy(f); g.add(tag(m, `${L} (foot)`)); }
  return g;
}
