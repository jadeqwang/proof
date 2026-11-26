// LIGHT STUDY for Jade (round 2 answers: continuous balcony doors, 10.5 m room, cross-legged eye height 0.53): five suns x three views.
// Row 1 (08:30, honest) is the set default now; row 2 is Jade's earlier 09:30 pick (face in shade); row 3 the 09:30 cheat. The set's default sun
// (layout.js SCENE) is NOT changed by this file: each shot carries its own `scene`.
//   node layout/render.mjs --set shanghai86/lightstudy --modes lit,flat --nojson
//   -> media/layout/shanghai86/lightstudy/, sheet: media/layout/_sheets/shanghai86_lightstudy.jpg (sh lightstudy/sheet.sh)
import { SHOTS as BASE } from '../shots.js';
import { PLACES } from '../layout.js';

export const SUNS = [
  { k: '1', label: '1986-12-21 08:30 (round 2: honest, set default)', scene: { date: '1986-12-21', time: '08:30' } },
  { k: '2', label: '1986-12-21 09:30 (Jade\'s pick: her face in shade)', scene: { date: '1986-12-21', time: '09:30' } },
  { k: '3', label: 'CHEAT: the 09:30 azimuth (143.8), sun lowered 25.7 -> 19 deg', scene: { cheat: { elev: 19, rel: 143.76 - 166.8 } } },
  { k: '4', label: '1986-12-21 08:00 (honest)', scene: { date: '1986-12-21', time: '08:00' } },
  { k: '5', label: '1986-12-21 15:00 (honest afternoon)', scene: { date: '1986-12-21', time: '15:00' } },
];
const pick = (id) => { const s = BASE.find((x) => x.id === id); const { t, move, ...rest } = s; return rest; };
const [JX, JZ] = PLACES.jadeSit;
const VIEWS = [pick('REF_wide'), pick('V1e'),
  { id: 'EYE', lens: 24, tissue: 8, pos: [JX + 0.05, 0.53, JZ + 0.16], aim: [[JX + 0.9, 0.85, -0.2], 0.5, 0.42], figs: pick('V1c').figs, hideParts: { jade3: ['head'] },
    header: 'her eye level, toward the windows', intent: 'From her eyes (her head hidden), looking at the windows: how the light arrives at the table, the steam and her hands.' }];
export const SHOTS = SUNS.flatMap((s) => VIEWS.map((v) => ({ ...v, id: `LS${s.k}_${v.id}`, scene: s.scene, header: `${s.label}: ${v.header || v.id}`, intent: v.intent })));
