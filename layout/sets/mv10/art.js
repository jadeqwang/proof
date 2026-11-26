// mv10: canonical clothing decals (2026-11-26, Jade: "the same version of clothing logo should be in each frame (not 2
// different versions of the NASA meatball logo)"). Images: layout/assets/art/logos/<name>.png (+ .txt).
//   meatball  the NASA insignia (1959 "meatball", public-domain vector), Jade's jacket, left chest, disc 8 cm (ASSUMED)
//   sr71      the SR-71 planform tee print (dark grey on black, nose to the lower left; Jade), centre chest, 24 cm (ASSUMED)
// Prints are flattened onto the garment colour for the textures; their alpha cuts the decal's outline (sets/_art.js decalMesh).
import { loadArt } from '../_art.js';
export const LOGOS = await loadArt({
  meatball: ['/assets/art/logos/nasa_meatball.png', { bg: '#1b1b1e' }],
  sr71: ['/assets/art/logos/sr71_print.png', { bg: '#2a2a2e' }],
});
// the meatball's disc inside its image (NASA_logo.svg viewBox 110 x 92: disc centre (50.05, 45), r 40.14)
export const MEATBALL = { disc_m: 0.08, imgW: 110, imgH: 92, cx: 50.05, cy: 45, r: 40.14 };
export const SR71 = { w: 0.24, v: -0.17 };   // print width on the tee (m), its centre below the shoulder centre (m)
