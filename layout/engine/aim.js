// Composition helper: find the camera target (no roll) that puts world point P at screen position (u, v),
// u, v in 0..1 from the top-left, for a camera at `pos` with a `lens` (mm across a 36 mm frame) and 16:9 frame.
//   aim([x,y,z], [px,py,pz], 0.75, 0.7, 35) -> [tx, ty, tz]
export function aim(pos, P, u, v, lens, aspect = 16 / 9) {
  const tanH = 18 / lens, tanV = tanH / aspect;
  const d = norm(sub(P, pos));
  const proj = (yaw, pitch) => {
    const f = [Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw)];
    const r = norm(cross(f, [0, 1, 0])), up = cross(r, f);
    const x = dot(d, r), y = dot(d, up), z = dot(d, f);
    return [((x / z) / tanH + 1) / 2, (1 - (y / z) / tanV) / 2];
  };
  let yaw = Math.atan2(d[0], d[2]), pitch = Math.asin(d[1]);
  for (let i = 0; i < 30; i++) {
    const [a, b] = proj(yaw, pitch); const ea = a - u, eb = b - v; if (Math.abs(ea) + Math.abs(eb) < 1e-7) break;
    const h = 1e-5; const [a1, b1] = proj(yaw + h, pitch), [a2, b2] = proj(yaw, pitch + h);
    const J = [[(a1 - a) / h, (a2 - a) / h], [(b1 - b) / h, (b2 - b) / h]]; const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    yaw -= (J[1][1] * ea - J[0][1] * eb) / det; pitch -= (-J[1][0] * ea + J[0][0] * eb) / det;
  }
  const f = [Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw)];
  return pos.map((p, i) => +(p + f[i] * 2).toFixed(4));
}
const sub = (a, b) => a.map((x, i) => x - b[i]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const n = Math.hypot(...a); return a.map((x) => x / n); };
