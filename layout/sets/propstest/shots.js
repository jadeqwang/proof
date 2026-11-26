// propstest: every downloaded prop (sets/_props.js, layout/assets/props/) alone on a grey floor, one close shot each,
// plus a line-up. Not a film set.
//   node layout/render.mjs --set propstest --modes form,line,lit,contour --nojson --out <scratch> ; sh layout/sets/propstest/sheet.sh <scratch>
const P = await (await fetch('/assets/props/props.json')).json();
export const NAMES = Object.keys(P).sort();
const one = (n) => { const s = P[n].size_m, r = Math.hypot(...s) / 2, d = r * 5.6, cy = s[1] / 2;
  return { id: 'p_' + n, lens: 50, pos: [d * 0.6, cy + d * 0.42, d * 0.68], target: [0, cy, 0], near: 0.01, only: n, header: `${n}: ${s.map((x) => x.toFixed(3)).join(' x ')} m (${P[n].source || ''})` }; };
export const SHOTS = [
  { id: 'lineup', lens: 35, pos: [0, 1.1, 4.2], target: [0, 0.15, 0], lineup: true, header: 'every prop at real size' },
  ...NAMES.map(one),
];
