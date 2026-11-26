// mortongrove07: the framed picture over the couch as a FIXED image (2026-11-26, Jade: background art goes into the 3D
// model so the painters stop inventing it). Image: layout/assets/art/mortongrove07/mg_picture.png (+ .txt).
// The SUBJECT IS INVENTED (Jade gave only its size, 1.4 x 1.0 m): a muted impressionist field landscape, no strong blue
// (so it does not compete with the blue IAS seal), in a cream mat. A question for Jade (see NOTES.md).
//
// HOOK for build.js (this agent may not edit it while the cloth agent works there): after the two 'framed picture'
// lines, add
//     g.add(framedPictureArt());
// and `import { framedPictureArt } from './art.js';` at the top. The mat and print sit just proud of the existing
// panel box (its room-side face is at z = PRINT.z - 0.025), facing the room (-z).
import * as THREE from 'three';
import { mk, tag } from '../../engine/core.js';
import { loadArt, artPlane } from '../_art.js';
import { PRINT } from './layout.js';

export const ART_TEX = await loadArt({ picture: ['/assets/art/mortongrove07/mg_picture.png', { edgeBlur: 3, edgeMax: 0.75 }] });
export const MAT = 0.11;   // the cream mat's width (m) round the print, inside the frame's 0.06 m moulding

export function framedPictureArt() {
  const g = new THREE.Group(), w = PRINT.w - 0.12, h = PRINT.h - 0.12;
  const mat = mk(new THREE.PlaneGeometry(w, h), { grey: 0.9, col: 0xefe6d2, noCast: true }); mat.position.z = 0.0005; g.add(tag(mat, 'framed picture (cream mat)'));
  if (ART_TEX.picture) { const p = artPlane(ART_TEX.picture, w - 2 * MAT, h - 2 * MAT); p.position.z = 0.001; g.add(tag(p, 'framed picture (field landscape print)')); }
  g.rotation.y = Math.PI; g.position.set(PRINT.x, PRINT.y, PRINT.z - 0.025);
  return g;
}
