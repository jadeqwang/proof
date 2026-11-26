// Page entry: index.html?set=attic88&w=1920&h=1080
//   window.shotList() -> [ids]; window.renderShot(id, mode) -> PNG data URL; window.sidecar(id) -> JSON object
import * as THREE from 'three';
import { ModeRenderer } from './render.js';
import { FIG2 } from './figure2.js';
import { drawGazeOverlay } from './gaze.js';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') || 1920), H = Number(q.get('h') || 1080), SET = q.get('set') || 'attic88';
FIG2.on = q.get('gaze') === '1'; FIG2.body = q.get('body2') === '1';   // gaze + wrists (--gaze) / mannequin body v2 (--body2); off = unchanged
const R = new ModeRenderer(W, H);
const { build, buildV3 } = await import(`../sets/${SET}/build.js`);
const { SHOTS: SHOTS_V1 } = await import(`../sets/${SET}/shots.js`);
let SHOTS = SHOTS_V1;
try { const m = await import(`../sets/${SET}/shots_v3.js`); SHOTS = SHOTS_V1.concat(m.SHOTS); } catch (e) { if (!/Failed to fetch|404|not found/i.test(String(e))) throw e; }   // v3 setups (ids prefixed v3_)
try { const m = await import(`../sets/${SET}/shots_v4.js`); SHOTS = SHOTS.concat(m.SHOTS); } catch (e) { if (!/Failed to fetch|404|not found/i.test(String(e))) throw e; }   // v4 setups (ids prefixed v4_)
import { JOINTS } from './body.js';
const SHOT = Object.fromEntries(SHOTS.map((s) => [s.id, s]));

// 35 mm still-camera convention: lens in mm across a 36 mm wide frame
export function makeCam(c) {
  if (c.ortho) { // plan / elevation views: c.ortho = { w: metres across the frame }
    const w = c.ortho.w, h = w * H / W; const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, c.near ?? 0.05, c.far ?? 200);
    cam.position.set(...c.pos); cam.up.set(...(c.up || [0, 1, 0])); cam.lookAt(new THREE.Vector3(...c.target)); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam; }
  const hfov = 2 * Math.atan(18 / c.lens), vfov = 2 * Math.atan(Math.tan(hfov / 2) * H / W);
  const cam = new THREE.PerspectiveCamera(vfov * 180 / Math.PI, W / H, c.near ?? 0.05, c.far ?? 200);
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(new THREE.Vector3(...c.target));
  if (c.roll) cam.rotateZ(c.roll * Math.PI / 180);
  cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
}
const cache = new Map();
function get(id) {
  if (cache.has(id)) return cache.get(id);
  const shot = SHOT[id]; if (!shot) throw new Error('no shot ' + id);
  const b = (shot.v3 && buildV3 ? buildV3 : build)(shot, { makeCam, W, H });
  b.scene.updateMatrixWorld(true);
  cache.clear(); cache.set(id, b); return b;
}
const px = (p, cam) => { const v = p.clone().project(cam); const z = p.clone().applyMatrix4(cam.matrixWorldInverse).z;
  return { x: +((v.x * 0.5 + 0.5) * W).toFixed(1), y: +((-v.y * 0.5 + 0.5) * H).toFixed(1), front: z < 0 }; };
const r2 = (a) => a.map((v) => +v.toFixed(4));
const SAFE = { x0: (W - H * 4 / 5) / 2, x1: (W + H * 4 / 5) / 2 };

function labelOverlay(b, canvas, shot) {
  const id = R.idPass(b); const stats = new Map();
  for (let y = 1; y < H; y += 3) for (let x = 1; x < W; x += 3) {
    const m = id.meshAt(x, y); if (!m || !m.userData.label) continue;
    const l = m.userData.label; let s = stats.get(l); if (!s) stats.set(l, (s = { n: 0, sx: 0, sy: 0, pts: [] }));
    s.n++; s.sx += x; s.sy += y; if (s.n % 7 === 1) s.pts.push([x, y]);
  }
  const g = canvas.getContext('2d');
  // the 4:5 safe area
  g.save(); g.setLineDash([12, 10]); g.strokeStyle = 'rgba(0,90,200,0.9)'; g.lineWidth = 2;
  g.strokeRect(SAFE.x0, 1, SAFE.x1 - SAFE.x0, H - 2); g.restore();
  const placed = [];
  const items = [...stats.entries()].filter(([, s]) => s.n > 12).sort((a, b) => b[1].n - a[1].n);
  g.font = '600 21px DejaVu Sans, sans-serif'; g.textBaseline = 'top';
  for (const [name, s] of items) {
    const cx = s.sx / s.n, cy = s.sy / s.n; let best = s.pts[0], bd = 1e18;
    for (const p of s.pts) { const d = (p[0] - cx) ** 2 + (p[1] - cy) ** 2; if (d < bd) { bd = d; best = p; } }
    const tw = g.measureText(name).width + 12, th = 28;
    const clampX = (x) => Math.min(Math.max(x, 4), W - tw - 4), clampY = (y) => Math.min(Math.max(y, 44), H - th - 4);
    const cands = [[10, -th - 6], [10, 8], [-tw - 10, -th - 6], [-tw - 10, 8], [10, -2 * th - 14], [-tw / 2, 16], [-tw / 2, -th - 18], [24, 2 * th], [-tw - 24, -2 * th - 10], [40, -3 * th]];
    let bx, by, ok = false;
    for (const [ox, oy] of cands) { bx = clampX(best[0] + ox); by = clampY(best[1] + oy); if (!placed.some((p) => bx < p.x + p.w && bx + tw > p.x && by < p.y + p.h && by + th > p.y)) { ok = true; break; } }
    if (!ok) { bx = clampX(best[0] + 10); by = clampY(best[1] - th - 6); for (let k = 0; k < 40; k++) { const hit = placed.find((p) => bx < p.x + p.w && bx + tw > p.x && by < p.y + p.h && by + th > p.y); if (!hit) break; by = hit.y + hit.h + 2; if (by > H - th) { by = 44; bx = clampX(bx + 80); } } }
    placed.push({ x: bx, y: by, w: tw, h: th });
    const who = s.pts.length && id.meshAt(best[0], best[1])?.userData.who;
    g.strokeStyle = who ? '#b0201a' : '#222'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(best[0], best[1]); g.lineTo(bx + 4, by + th / 2); g.stroke();
    g.fillStyle = '#000'; g.beginPath(); g.arc(best[0], best[1], 3.5, 0, 7); g.fill();
    g.fillStyle = who ? 'rgba(255,236,230,0.92)' : 'rgba(255,255,255,0.88)'; g.fillRect(bx, by, tw, th);
    g.strokeRect(bx, by, tw, th); g.fillStyle = who ? '#8a120c' : '#111'; g.fillText(name, bx + 6, by + 4);
  }
  // header
  g.font = '700 26px DejaVu Sans, sans-serif'; const head = `${shot.id}  ${shot.lens} mm  ${b.header || ''}`;
  const hw = g.measureText(head).width + 20; g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(0, 0, hw, 40); g.fillStyle = '#fff'; g.fillText(head, 10, 7);
  if (FIG2.on) drawGazeOverlay(g, b, px, W, H);
  // hand-shadow polygons, as computed (dashed)
  if (b.shadowPolys) { g.save(); g.setLineDash([6, 5]); g.strokeStyle = '#7a00b0'; g.lineWidth = 2;
    for (const poly of b.shadowPolys.px) { g.beginPath(); poly.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke(); } g.restore(); }
}

// v2: every hand that grips / holds something, the object it holds (the engine's held cylinder, or the nearest small set
// object within 3 cm of the hand) as world points for a convex hull, and the capsules of every hand touching that object.
const GRIPS = new Set(['grip', 'pinch', 'cup']);
function holdsFor(b) {
  const r4 = (v) => v.toArray().map((x) => +x.toFixed(4));
  const hands = []; for (const [who, f] of Object.entries(b.figs || {})) { const Pf = f.userData.P, spec = f.userData.spec;
    for (const n of ['L', 'R']) { const a = spec[n], h = Pf.hands?.[n]; if (!h?.capsules || !a || typeof a !== 'object') continue;
      const shape = typeof a.hand === 'string' ? a.hand : a.hand?.shape; if (!a.hold && !GRIPS.has(shape)) continue;
      hands.push({ who, n, h, a, shape, held: Pf['held' + n] }); } }
  const objs = new Map(); const cands = []; b.scene.traverse((o) => { if (!o.isMesh || o.userData.baseVisible === false) return; const L = o.userData.look; if (!L || L.glass || (L.only && !L.only.includes('flat'))) return;
    if (o.userData.who && !/held/.test(o.userData.label || '')) return; const bb = new THREE.Box3().setFromObject(o); if (bb.isEmpty() || bb.getSize(new THREE.Vector3()).length() > 1.2) return; cands.push({ o, bb }); });
  const capsD = (h, bb) => Math.min(...h.capsules.map((c) => Math.min(bb.distanceToPoint(c.a), bb.distanceToPoint(c.b)) - c.r));
  for (const H of hands) { let best = null;
    if (H.held) { H.h.group.traverse((o) => { if (o.isMesh && /held|cup/.test(o.userData.label || '') && o.geometry.type === 'CylinderGeometry') best = { o, bb: new THREE.Box3().setFromObject(o), d: 0 }; }); }
    if (!best) for (const c of cands) { if (c.o.userData.who) continue; const d = capsD(H.h, c.bb); if (d < 0.03 && (!best || d < best.d)) best = { ...c, d }; }
    if (!best) { objs.set('none:' + H.who + H.n, { label: null, hands: [H], note: 'no object within 3 cm of the hand' }); continue; }
    const k = best.o.uuid; if (!objs.has(k)) objs.set(k, { o: best.o, bb: best.bb, label: best.o.userData.label || best.o.geometry.type, hands: [] }); objs.get(k).hands.push(H); }
  const out = [];
  for (const e of objs.values()) {
    const rec = { object: e.label, note: e.note, hands: e.hands.map((H) => ({ who: H.who, arm: H.n, shape: H.shape, engine_held: !!H.held, capsules: H.h.capsules.map((c) => ({ part: c.part, a: r4(c.a), b: r4(c.b), r: +c.r.toFixed(4) })) })) };
    if (e.o) { // other hands touching the same object count as support too
      for (const [who, f] of Object.entries(b.figs || {})) for (const n of ['L', 'R']) { const h = f.userData.P.hands?.[n]; if (!h?.capsules || rec.hands.some((x) => x.who === who && x.arm === n)) continue;
        if (capsD(h, e.bb) < 0.01) rec.hands.push({ who, arm: n, shape: h.shape, touching_only: true, capsules: h.capsules.map((c) => ({ part: c.part, a: r4(c.a), b: r4(c.b), r: +c.r.toFixed(4) })) }); }
      const pos = e.o.geometry.attributes.position, step = Math.max(1, Math.floor(pos.count / 400)), pts = []; const v = new THREE.Vector3();
      e.o.updateMatrixWorld(); for (let i = 0; i < pos.count; i += step) { v.fromBufferAttribute(pos, i).applyMatrix4(e.o.matrixWorld); pts.push(r4(v)); }
      rec.hull = pts; rec.size_m = r4(e.bb.getSize(new THREE.Vector3())); }
    out.push(rec);
  }
  return out;
}

function namedPt(t, b) { const [w, part] = t.split(':'); if (w === 'book') return b.book.anchors[part].clone(); return b.figs[w].userData.P[part].clone(); }
window.shotList = () => SHOTS.map((s) => s.id);
window.renderShot = (id, mode) => {
  const b = get(id); const c = R.render(b, mode === 'label' ? 'label' : mode);
  if (mode === 'label') labelOverlay(b, c, SHOT[id]);
  return c.toDataURL('image/png');
};
window.sidecar = (id) => {
  const b = get(id), cam = b.cam, shot = SHOT[id];
  const P = (v) => { const p = px(v, cam); return [p.x, p.y]; };
  const idp = R.idPass(b);
  const visOf = (p, who) => { const m = idp.meshAt(p.x, p.y); return !!m && m.userData.who === who; };
  const out = { shot: id, set: b.set, w: W, h: H, desc: shot.desc || '',
    camera: { position: r2(cam.position.toArray()), target: shot.target, lens_mm: shot.lens, frame_width_mm: 36,
      hfov_deg: shot.ortho ? null : +(2 * Math.atan(18 / shot.lens) * 180 / Math.PI).toFixed(3), vfov_deg: shot.ortho ? null : +cam.fov.toFixed(3), ortho: shot.ortho || null, roll_deg: shot.roll || 0,
      near: cam.near, far: cam.far, matrixWorld: r2(cam.matrixWorld.elements), viewMatrix: r2(cam.matrixWorldInverse.elements), projectionMatrix: r2(cam.projectionMatrix.elements),
      note: 'three.js column-major 4x4; world units metres, y up; pixel = ((ndc.x+1)/2*w, (1-ndc.y)/2*h)' },
    safe45_px: [SAFE.x0, SAFE.x1], book: null, panes: {}, heads: {}, hands: {}, lights: [], warnings: [] };
  if (b.book) {
    const bk = b.book;
    if (bk.pages) out.book = { state: 'open', spread: bk.pages.spread.map(P), left: bk.pages.left.map(P), right: bk.pages.right.map(P), corner_order: 'TL,TR,BR,BL as the page is read',
      spread_world: bk.pages.spread.map((v) => r2(v.toArray())) };
    else out.book = { state: 'closed', cover: bk.cover.map(P), corner_order: 'TL,TR,BR,BL as the cover is read' };
  }
  const behind = (cs) => cs.map((v) => !px(v, cam).front);
  for (const [name, cs] of Object.entries(b.panes || {})) out.panes[name] = { px: cs.map(P), world: cs.map((v) => r2(v.toArray())), behind_camera: behind(cs) };
  if (out.book && b.book.pages) out.book.behind_camera = behind(b.book.pages.spread);
  for (const [who, f] of Object.entries(b.figs || {})) {
    const Pf = f.userData.P; const hp = px(Pf.head, cam);
    const inFrame = hp.front && hp.x >= 0 && hp.x <= W && hp.y >= 0 && hp.y <= H;
    out.heads[who] = { px: [hp.x, hp.y], eyes: P(Pf.eyes), mouth: P(Pf.mouth), in_frame: inFrame, visible: inFrame && (visOf(px(Pf.eyes, cam), who) || visOf(hp, who)),
      facing_camera_deg: +(Math.acos(THREE.MathUtils.clamp(Pf.headFwd.dot(cam.position.clone().sub(Pf.head).normalize()), -1, 1)) * 180 / Math.PI).toFixed(0) };
    for (const n of ['L', 'R']) { const hp2 = px(Pf['hand' + n], cam); out.hands[`${who}.${n}`] = { px: [hp2.x, hp2.y], shape: Pf.hands[n].shape, in_frame: hp2.front && hp2.x >= 0 && hp2.x <= W && hp2.y >= 0 && hp2.y <= H, visible: visOf(hp2, who) }; }
    if (shot.sync === 'lip' && (shot.singers || []).includes(who) && inFrame && (hp.x < SAFE.x0 || hp.x > SAFE.x1)) out.warnings.push(`${who}'s face is outside the 4:5 safe area`);
    // what blocks the line of sight from the camera to this face?
    if (inFrame) { const eye = Pf.eyes; const d = eye.clone().sub(cam.position); const rc = new THREE.Raycaster(cam.position, d.clone().normalize(), 0.01, d.length() - Pf.headH * 0.45);
      const hits = rc.intersectObjects(b.scene.children, true).filter((h) => h.object.visible && h.object.userData.baseVisible !== false && h.object.userData.look && !h.object.userData.look.glass && !(h.object.userData.look.only && !h.object.userData.look.only.includes('flat')));
      if (hits.length) { const o = hits[0].object; out.heads[who].blocked_by = (o.userData.who ? o.userData.who + ' ' : '') + (o.userData.label || ''); if ((shot.singers || []).includes(who) || (shot.focus || []).includes(who)) out.warnings.push(`${who}'s face is blocked by ${out.heads[who].blocked_by}`); } }
  }
  const subj = b.subject || (b.book ? b.book.at : new THREE.Vector3(0, 0.5, 0));
  for (const L of b.lights || []) {
    const p = px(L.pos, cam); const e = { name: L.name, kind: L.kind, on: L.on, color: L.color, world: r2(L.pos.toArray()), px: [p.x, p.y], in_front: p.front };
    // direction the light travels across the frame, measured at the subject
    const s0 = px(subj, cam), dir = subj.clone().sub(L.pos).normalize(); const s1 = px(subj.clone().addScaledVector(dir, 0.05), cam);
    const dx = s1.x - s0.x, dy = s1.y - s0.y, n = Math.hypot(dx, dy) || 1; e.travel_dir_px = [+(dx / n).toFixed(3), +(dy / n).toFixed(3)];
    e.toward_camera = +dir.dot(cam.position.clone().sub(subj).normalize()).toFixed(3);
    if (L.aim) e.aim_world = r2(L.aim.toArray());
    out.lights.push(e);
  }
  if (b.shadowPolys) out.hand_shadow = { light: b.shadowPolys.light, receiver: b.shadowPolys.receiver, polygons_px: b.shadowPolys.px, polygons_page_uv: b.shadowPolys.uv, bbox_page_uv: b.shadowPolys.bbox, note: b.shadowPolys.note };
  if (b.mirror) out.mirror = b.mirror.report(cam, P, idp);
  if (shot.move) out.camera_move = { ...shot.move, note: 'the shot moves from camera.position/target to these over its length; the guide shows the start' };
  if (shot.intent) out.intent = shot.intent;
  if (b.extra) Object.assign(out, b.extra(cam, P));
  if (shot.v4) {
    // every labelled object the camera sees: visible pixel count, screen box, centroid; world box of the object
    const st = new Map();
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const m = idp.meshAt(x, y); if (!m || !m.userData.label) continue;
      const key = (m.userData.who ? m.userData.who + ':' : '') + m.userData.label; let e = st.get(key); if (!e) st.set(key, (e = { n: 0, x0: 1e9, y0: 1e9, x1: -1, y1: -1, sx: 0, sy: 0, who: m.userData.who || null, label: m.userData.label }));
      e.n++; e.sx += x; e.sy += y; e.x0 = Math.min(e.x0, x); e.y0 = Math.min(e.y0, y); e.x1 = Math.max(e.x1, x); e.y1 = Math.max(e.y1, y); }
    const wb = new Map(); b.scene.traverse((o) => { if (!o.isMesh || !o.userData.label || o.userData.who || o.userData.baseVisible === false) return; const L = o.userData.look; if (L && (L.glass || (L.only && !L.only.includes('flat')))) return;
      const bb = new THREE.Box3().setFromObject(o); const k = o.userData.label; if (!wb.has(k)) wb.set(k, bb.clone()); else wb.get(k).union(bb); });
    const tot = (W / 2) * (H / 2);
    out.objects = [...st.values()].filter((e) => e.n >= 6).sort((a, c) => c.n - a.n).map((e) => ({ label: e.label, figure: e.who, frame_fraction: +(e.n / tot).toFixed(5),
      bbox_px: [e.x0, e.y0, e.x1 + 2, e.y1 + 2], centroid_px: [+(e.sx / e.n).toFixed(0), +(e.sy / e.n).toFixed(0)],
      world_box: wb.has(e.label) && !e.who ? [wb.get(e.label).min.toArray().map((v) => +v.toFixed(3)), wb.get(e.label).max.toArray().map((v) => +v.toFixed(3))] : undefined }));
    out.joints = {}; for (const [who, f] of Object.entries(b.figs || {})) { const Pf = f.userData.P; out.joints[who] = {};
      for (const j of JOINTS) if (Pf[j]) { const p = px(Pf[j], cam); out.joints[who][j] = { px: [p.x, p.y], in_frame: p.front && p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H, visible: visOf(p, who), w: Pf[j].toArray().map((v) => +v.toFixed(4)) }; } }
    for (const f of Object.values(b.figs || {})) for (const v of f.userData.report?.violations || []) out.warnings.push('joint limit: ' + v);
    if (shot.contacts) out.contacts = shot.contacts.map(([a, c2, tol = 3]) => { const pa = namedPt(a, b), pc = namedPt(c2, b); const d = pa.distanceTo(pc) * 100;
      if (d > tol) out.warnings.push(`contact ${a} -> ${c2} is ${d.toFixed(1)} cm apart (tolerance ${tol})`); return { a, b: c2, distance_cm: +d.toFixed(1), ok: d <= tol, a_px: P(pa), b_px: P(pc) }; });
    out.layout_version = 4;
  }
  if (FIG2.on) { // v2: gaze per figure (look target, head / eye split, error, pointing check) and the costume colours in use
    out.gaze = {}; out.costume = {};
    for (const [who, f] of Object.entries(b.figs || {})) { const Pf = f.userData.P; if (!Pf.gaze) continue;
      const gz = Pf.gaze; out.gaze[who] = { ...gz, eyes_px: P(Pf.gazeInfo.eyes), target_px: Pf.lookAt ? P(Pf.lookAt) : null, target_in_front: Pf.lookAt ? px(Pf.lookAt, cam).front : null };
      for (const w of gz.warnings) out.warnings.push('gaze: ' + w);
      out.costume[who] = Pf.costume;
      if (Pf.wrists) { (out.wrists ||= {})[who] = Pf.wrists;
        for (const [n, w] of Object.entries(Pf.wrists)) if (w.hand_turned_deg) out.warnings.push(`wrist: ${who} ${n} hand turned ${w.hand_turned_deg} deg toward the forearm to keep the wrist in range (was flex ${w.before.flex_deg}, radial ${w.before.radial_deg})`);
        for (const [n, w] of Object.entries(Pf.wrists)) if (w.out_of_range.length) out.warnings.push(`wrist: ${who} ${n} ${w.hold ? 'grip cannot be reached naturally' : 'beyond the wrist range'} (${w.out_of_range.join(', ')}; flex ${w.flex_deg}, radial ${w.radial_deg}, twist ${w.twist_deg}, after an elbow swivel of ${w.elbow_swivel_deg} deg)`); } }
    out.holds = holdsFor(b);   // held objects + hand capsules for engine/holdcheck.mjs (Rapier)
    // close two-person frames: figures that fill the frame, and how far apart their main (top) colours are
    const area = {}; for (let y = 1; y < H; y += 4) for (let x = 1; x < W; x += 4) { const m = idp.meshAt(x, y); const w = m?.userData.who; if (w) area[w] = (area[w] || 0) + 1; }
    const tot = (W / 4) * (H / 4), big = Object.entries(area).filter(([, n]) => n / tot > 0.04).map(([w]) => w);
    const lab = (h) => { const c = new THREE.Color(h); const f = (v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92); const r = f(c.r), gg = f(c.g), bb = f(c.b);
      const X = (0.4124 * r + 0.3576 * gg + 0.1805 * bb) / 0.9505, Y = 0.2126 * r + 0.7152 * gg + 0.0722 * bb, Z = (0.0193 * r + 0.1192 * gg + 0.9505 * bb) / 1.089;
      const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116); return [116 * t(Y) - 16, 500 * (t(X) - t(Y)), 200 * (t(Y) - t(Z))]; };
    out.figure_frame_fraction = Object.fromEntries(Object.entries(area).map(([w, n]) => [w, +(n / tot).toFixed(4)]));
    out.colour_separation = [];
    for (let i = 0; i < big.length; i++) for (let j = i + 1; j < big.length; j++) { const A = out.costume[big[i]], B = out.costume[big[j]]; if (!A || !B) continue;
      const la = lab(A.top), lb = lab(B.top), dE = Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
      const e = { a: big[i], b: big[j], top_a: A.top, top_b: B.top, deltaE_top: +dE.toFixed(1), close: dE < 20 }; out.colour_separation.push(e);
      if (e.close) out.warnings.push(`costume: ${big[i]} and ${big[j]} both fill the frame and their tops are close in colour (dE ${e.deltaE_top}: ${A.top} vs ${B.top})`); }
  }
  out.figure_report = Object.fromEntries(Object.entries(b.figs || {}).map(([w, f]) => [w, f.userData.report]));
  return out;
};
window.__ready = Promise.resolve(true);
