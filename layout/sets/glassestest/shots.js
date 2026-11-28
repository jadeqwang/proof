// glassestest shots: each glasses wearer's head, front / three-quarter / profile (the views of the cast heads sheets),
// lens 85, framed on the eyes. Dad twice: Decatur (1990, gold aviators) and 2023 (semi-rimless, the dad23 body).
import '../_cast.js';
const WEARERS = {
  jade27: { who: 'jade27' }, jade19: { who: 'jade19' }, mama: { who: 'mama', spec: { noApron: true } },
  dad90: { who: 'dad' }, dad23: { who: 'dad', spec: { costume: { body: 'dad23', hair: 0x4a4642, top: 0xf4f4f0, sleeves: 'short', glasses: 'dad23' } } },
};
const VIEWS = { front: 0, q3: -35, profile: -90 };
export const SHOTS = [];
for (const [id, w] of Object.entries(WEARERS)) for (const [v, az] of Object.entries(VIEWS))
  SHOTS.push({ id: `${id}_${v}`, lens: 85, orbit: { at: `${w.who}:eyes`, az, el: 2, dist: 0.62 }, header: `${id}: glasses, ${v}`,
    figs: { [w.who]: { at: [0, 0], legs: 'stand', yaw: 0, L: 'side', R: 'side', look: [0, 1.5, 3], ...(w.spec || {}) } } });
