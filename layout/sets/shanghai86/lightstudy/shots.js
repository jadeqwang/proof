// LIGHT STUDY for Jade (round 4; re-rendered on the decision-page layout): five suns x three views. Jade chose row 2 (09:30). The set's default sun
// (layout.js SCENE) is NOT changed by this file: each shot carries its own `scene`.
//   node layout/render.mjs --set shanghai86/lightstudy --modes lit,flat --nojson
//   -> media/layout/shanghai86/lightstudy/, sheet: media/layout/_sheets/shanghai86_lightstudy.jpg (sh lightstudy/sheet.sh)
import { SHOTS as BASE } from '../shots.js';
import { PLACES } from '../layout.js';

export const SUNS = [
  { k: '1', label: '1986-12-21 08:31 (round-4 pick)', scene: { date: '1986-12-21', time: '08:31' } },
  { k: '2', label: '1986-12-21 09:30 (Jade chose; set default)', scene: { date: '1986-12-21', time: '09:30' } },
  { k: '3', label: '1987-02-14 07:30', scene: { date: '1987-02-14', time: '07:30' } },
  { k: '4', label: '1986-12-21 15:00 (honest afternoon)', scene: { date: '1986-12-21', time: '15:00' } },
  { k: '5', label: 'CHEATED: 16 deg high from az 143 (the real sun there is ~25 deg high)', scene: { cheat: { elev: 16, rel: -24 } } },
];
const pick = (id) => { const s = BASE.find((x) => x.id === id); const { t, move, ...rest } = s; return rest; };
const [JX, JZ] = PLACES.jadeSit;
const VIEWS = [pick('REF_wide'), pick('V1e'),
  { id: 'EYE', lens: 24, tissue: 8, pos: [JX + 0.02, 0.62, JZ + 0.16], aim: [[JX + 0.9, 0.85, -0.2], 0.5, 0.42], figs: pick('V1c').figs, hideParts: { jade3: ['head'] },
    header: 'her eye level, toward the windows', intent: 'From her eyes (her head hidden), looking at the windows: how the light arrives at the table, the steam and her hands.' }];
export const SHOTS = SUNS.flatMap((s) => VIEWS.map((v) => ({ ...v, id: `LS${s.k}_${v.id}`, scene: s.scene, header: `${s.label}: ${v.header || v.id}`, intent: v.intent })));
