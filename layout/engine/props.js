// v3 shared props: a blanket being pulled over a lying figure, and the hand-shadow monkey as a cut-out card.
import * as THREE from 'three';
import { mk, box, tag, V, basisQ } from './core.js';
import { casterMeshes, projectShadow, projectOutline, spreadUV, hull } from './stage.js';

const SIL = await (await fetch('/assets/monkey_silhouette.json')).json();

// a blanket over a lying figure from the feet up to `upTo` (0 = ankles .. 1 = shoulders). baseY = top of the mat / mattress.
// returns { group, edge: centre of the top edge (where the hands grip), across: unit vector along the edge }
export function coverBlanket(P, baseY, look, { upTo = 0.8, halfW = 0.3 } = {}) {
  const feet = P.ankleL.clone().add(P.ankleR).multiplyScalar(0.5), sh = P.shoulderC.clone();
  const a = feet.clone().lerp(sh, upTo); const top = Math.max(P.chest.y, P.hip.y, P.kneeL.y, P.kneeR.y, P.footL.y, P.footR.y) + 0.05;
  const b = feet.clone(); a.y = b.y = top; const d = b.clone().sub(a); const dir = d.clone().normalize(); const len = d.length() + 0.22;
  const ang = Math.atan2(d.x, d.z), mid = a.clone().addScaledVector(dir, len / 2);
  const g = new THREE.Group(); const hgt = top - baseY;
  const cap = mk(new THREE.CapsuleGeometry(halfW, Math.max(len - 2 * halfW, 0.05), 8, 20), look); cap.rotation.set(Math.PI / 2, 0, 0);
  const holder = new THREE.Group(); holder.position.copy(mid).setY(baseY); holder.rotation.y = ang; holder.scale.set(1, hgt / halfW, 1); holder.add(cap); g.add(holder);
  // the turned-back top edge
  const across = new THREE.Vector3(dir.z, 0, -dir.x);
  const e = box(2 * halfW * 0.92, 0.03, 0.09, look, [a.x + dir.x * 0.05, top - 0.012, a.z + dir.z * 0.05]); e.rotation.y = ang; g.add(e);
  tag(g, 'blanket (being pulled up)');
  return { group: g, edge: a.clone().setY(top), across };
}

// the hand-shadow monkey (design/characters/monkey/handshadow_silhouette.jpg traced to a polygon) as a thin card.
//   base: world point of the neck bottom (= the wrists); h: height in metres (neck bottom to crown);
//   up: world direction of the silhouette's up; normal: the card's normal; flip: profile faces -right instead of +right
// returns { mesh, outline: [Vector3] (outer contour, ordered), holes: [[Vector3]], centre }
export function monkeyCard({ base, h, up, normal, flip = false, label = 'hand-shadow monkey (cut-out card = the two hands)' }) {
  const n = V(normal).normalize(); const y = V(up); y.addScaledVector(n, -y.dot(n)).normalize(); const x = new THREE.Vector3().crossVectors(y, n).normalize(); if (flip) x.negate();
  const sh = new THREE.Shape(SIL.outer.map(([a, b]) => new THREE.Vector2(a, b)));
  for (const hole of SIL.holes) sh.holes.push(new THREE.Path(hole.map(([a, b]) => new THREE.Vector2(a, b))));
  const geo = new THREE.ShapeGeometry(sh); const m = mk(geo, { grey: 0.78, col: 0xe6b996 }); m.userData.double = true;
  const xx = flip ? x.clone().negate() : x; // geometry frame must stay right-handed: mirror through scale
  m.quaternion.copy(basisQ(xx, y, new THREE.Vector3().crossVectors(xx, y))); m.scale.set(flip ? -h : h, h, h); m.position.copy(V(base));
  const W = ([a, b]) => V(base).addScaledVector(x, a * h).addScaledVector(y, b * h);
  tag(m, label);
  return { mesh: m, outline: SIL.outer.map(W), holes: SIL.holes.map((hh) => hh.map(W)), centre: W([(SIL.bbox[0] + SIL.bbox[2]) / 2, 0.5]), x, y, n, h };
}
export const MONKEY_BBOX = SIL.bbox;

// a monkey card held parallel to the page, `lift` metres above it, placed on the ray from the page point `on` toward the
// light, so its shadow lands centred on that point. spec: { on: book anchor, h, lift, flip, who (label) }
export function cardOverPage(spec, book, lightPos) {
  const T = book.anchors[spec.on].clone(); const side = spec.on.startsWith('L') ? 'left' : spec.on.startsWith('R') ? 'right' : null;
  const n = (side ? book[side + 'Normal'] : book.n).clone().normalize(); const dir = lightPos.clone().sub(T).normalize();
  const C = T.clone().addScaledVector(dir, spec.lift / Math.max(dir.dot(n), 0.05));
  const y = book.w.clone().addScaledVector(n, -book.w.dot(n)).normalize(); const x = new THREE.Vector3().crossVectors(y, n).normalize(); if (spec.flip) x.negate();
  const h = spec.h, cx = (SIL.bbox[0] + SIL.bbox[2]) / 2;
  const base = C.clone().addScaledVector(y, -0.5 * h).addScaledVector(x, -cx * h);
  const card = monkeyCard({ base, h, up: y, normal: n, flip: !!spec.flip, label: spec.label });
  return { ...card, base, target: T, pageNormal: n, spec };
}

// The hand shadows of a shot, for the compositor: for every caster (a cut-out card or a mannequin hand / head named in
// shot.shadow.casters) the hand position, the light position and the shadow polygon on the page.
export function handShadows({ shot, figs, book, cards, lightPos, lightName, toPx, srcExt, lightSize }) {
  if (!book || !book.pages || (!(shot.shadow && shot.shadow.casters.length) && !cards.length)) return null;
  const r3 = (v) => v.toArray().map((x) => +x.toFixed(4)); const uvW = ([a, b]) => book.at.clone().addScaledVector(book.u, a * 0.412 - 0.206).addScaledVector(book.w, (1 - b) * 0.274 - 0.137);
  const items = [], polysPx = [], polysUv = [];
  const report = (name, kind, centre, uvPoly, extraPolys = []) => {
    const c = spreadUV(centre, book); const foot = centre.clone().addScaledVector(book.n, -c.height);
    const us = uvPoly.map((p) => p[0]), vs = uvPoly.map((p) => p[1]); const sc = [(Math.min(...us) + Math.max(...us)) / 2, (Math.min(...vs) + Math.max(...vs)) / 2];
    const scW = uvW(sc); const dir = lightPos.clone().sub(scW).normalize(); const elev = Math.asin(Math.max(-1, Math.min(1, dir.dot(book.n)))) * 180 / Math.PI;
    const D = lightPos.distanceTo(scW), dh = centre.distanceTo(scW);
    const it = { caster: name, kind, hand_world: r3(centre), hand_px: toPx(centre), hand_foot_on_page_uv: c.uv, hand_foot_px: toPx(foot), height_above_page_m: c.height,
      shadow_polygon_px: uvPoly.map((p) => toPx(uvW(p))), shadow_polygon_page_uv: uvPoly, shadow_centre_page_uv: sc.map((x) => +x.toFixed(4)), shadow_centre_px: toPx(scW),
      offset_on_page_m: +foot.distanceTo(scW).toFixed(3), light_elevation_above_page_deg: +elev.toFixed(1), light_distance_m: +D.toFixed(2), magnification: +(D / Math.max(D - dh, 1e-3)).toFixed(3),
      inside_spread: sc[0] >= 0 && sc[0] <= 1 && sc[1] >= 0 && sc[1] <= 1 };
    if (srcExt) { const wy = srcExt.y[1] - srcExt.y[0], wx = srcExt.x[1] - srcExt.x[0]; it.penumbra_m = { along_throw: +(dh * wy / D).toFixed(3), across: +(dh * wx * 0.5 / D).toFixed(3), note: 'soft edge width: the visible part of the blade is an extended source' }; }
    if (lightSize) it.penumbra_m = { all_round: +(dh * lightSize / Math.max(D - dh, 1e-3)).toFixed(4), note: 'LED lens ' + lightSize * 1000 + ' mm: nearly hard edge' };
    if (extraPolys.length) { it.holes_px = extraPolys.map((h) => h.map((p) => toPx(uvW(p)))); it.holes_page_uv = extraPolys; }
    items.push(it); polysPx.push(it.shadow_polygon_px); polysUv.push(uvPoly);
  };
  cards.forEach((c, i) => { const o = projectOutline(lightPos, c.outline, book); const holes = c.holes.map((h) => projectOutline(lightPos, h, book).uv); report(c.spec.who ? `${c.spec.who} (monkey card ${i})` : `monkey card ${i}`, 'cut-out card of handshadow_silhouette.jpg, parallel to the page', c.centre, o.uv, holes); });
  for (const name of (shot.shadow?.casters || [])) { const meshes = casterMeshes(name, figs); if (!meshes.length) continue; const sp = projectShadow(lightPos, meshes, book); const all = sp.uv.flat(); if (all.length < 3) continue;
    const [who, part] = name.split('.'); const P = figs[who].userData.P; const centre = part === 'head' ? P.head : P['hand' + part.slice(-1)];
    report(name, 'convex hull of the mannequin ' + (part === 'head' ? 'head' : 'hand (mitt proxy)'), centre, hull(all).map(([a, b]) => [+a.toFixed(4), +b.toFixed(4)])); }
  if (!items.length) return null;
  return { polys: { px: polysPx, uv: polysUv, light: lightName, receiver: 'storybook spread' },
    sidecar: { light: lightName, light_world: r3(lightPos), light_px: toPx(lightPos), receiver: 'storybook spread (page uv: u 0..1 left->right across both pages, v 0..1 top->bottom)', casters: items,
      polygons_px: polysPx, polygons_page_uv: polysUv,
      note: 'Paint the hand at hand_px; its shadow is shadow_polygon_px. The shadow starts offset_on_page_m away from the point of the page under the hand, on the side away from the light; the two only touch when the hand touches the page.' } };
}
