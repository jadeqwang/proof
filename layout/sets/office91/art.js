// office91: the back wall's art and the corridor board as FIXED textures (2026-11-26; Jade: "for any scene where we have
// background art or background objects on the walls, we should incorporate them into the 3d model so that the image
// models don't invent new art between generations/clips"). Images: layout/assets/art/office91/<name>.png (+ .txt: prompt,
// route, what is invented). Every child's picture is INVENTED (Jade said only "an alphabet, turkeys drawn as handprints,
// other elementary school children's art"); the board's four drawings follow what the r3 painting PC1_v1 showed.
//   ART_TEX[name]            the loaded pictures (sets/_art.js ArtTex)
//   alphabetCard(k, w, h)    card k (0 = Aa ... 25 = Zz) of alphabet_cards.png (one strip, 26 cards, made by
//                            tools/kf/alphabet_cards.py from alphabet_icons.png + letters drawn in code)
//   clockFace()              a plain classroom wall clock face, drawn in code (sets/_art.js clockArt)
import * as THREE from 'three';
import { mk } from '../../engine/core.js';
import { loadArt, artLook, clockArt, decalMesh } from '../_art.js';
export { decalMesh };

const U = (n) => `/assets/art/office91/${n}.png`;
export const PICS = ['turkey_1', 'turkey_2', 'turkey_3', 'turkey_4', 'turkey_6', 'board_house', 'board_rainbow', 'board_family', 'board_snowman', 'drawing_2',
  'corridor_turkey_1', 'corridor_turkey_2', 'corridor_turkey_3', 'corridor_drawing_1', 'corridor_drawing_2', 'corridor_drawing_3', 'corridor_drawing_4', 'corridor_drawing_5'];
export const ART_TEX = await loadArt(Object.fromEntries([...PICS, 'alphabet_cards'].map((n) => [n, n === 'alphabet_cards' ? [U(n), { maxPx: 4096 }] : U(n)])));
// the social worker's sweatshirt print (Jade, brainstorm: "Christmas sweatshirt with cracked print"; the tree design is
// INVENTED, matched to what r3 PC3a / X_sw painted): layout/assets/art/logos/sw_tree_print.png, 17 x 20 cm, chest centre
export const SW_PRINT = { w: 0.17, h: 0.2, ...(await loadArt({ tex: ['/assets/art/logos/sw_tree_print.png', { bg: '#7a9a8a' }] })) };

// one card of the strip: a plane whose UVs take the k-th 26th of the image
export function alphabetCard(k, w, h) {
  const a = ART_TEX.alphabet_cards; if (!a) return mk(new THREE.PlaneGeometry(w, h), { grey: 0.94, col: 0xf8f4e8 });   // strip not made yet
  const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, (k + uv.getX(i)) / 26);
  const m = mk(geo, { noCast: true, ...artLook(a, { grey: 0.94, col: 0xf8f4e8 }) }); m.userData.art = true; return m;
}
export const clockFace = () => clockArt({ hh: 10, mm: 10, ss: 38 });   // 10:10 (a fixed time; the clock is not a clue)
