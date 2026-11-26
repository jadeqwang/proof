// The paper piano keys (r4, 2026-11-26, Jade: "the piano keys should be taped such that they represent *an accurate
// piano* -- please paint and fill in appropriately so the image model doesn't hallucinate the wrong number of black keys.
// they should also have the correct proportions").
//
// ONE canonical texture, drawn in code with exact geometry (no image model): two A4 sheets landscape, taped end to end
// (0.594 x 0.21 m), a real-size piano keyboard printed on them in black toner, one strip of clear tape over the seam and
// the creases of a map fold. Used in every keys shot (AD_wide, AD_keys, AD_piano, and anything else that sees the paper).
//
// The keyboard: 22 white keys + 15 black = 37 keys, C3 .. C6 (three octaves and the top C; middle C = C4 is the 8th white
// key from the left). Real piano proportions: white keys 23.5 x 150 mm, black keys 13.7 x 95 mm, black keys printed from
// the FAR edge (the edge away from the player). Black keys in groups of 2 (C# D#) and 3 (F# G# A#), no black key between
// E-F and B-C; real offsets: in the C-E group the black keys sit 2.3 mm out from the white-key boundary, in the F-B group
// 3.4 mm out (F#, A#) and centred (G#) [the tops of the white keys are equal: 70.5 = 2 x 13.7 + 3 x 14.37 and
// 94 = 3 x 13.7 + 4 x 13.23]. 22 x 23.5 = 517 mm on the 594 mm paper: 38.5 mm white margin left and right; 150 mm keys
// on the 210 mm depth: 30 mm margin far and near. The keyboard is centred on the paper, so the seam (x = 0) falls on
// the F4 | G4 boundary, under F#4 (as if each sheet was printed with its half and the halves butted).
// Map fold: accordion across the length at the seam and the two quarter lines (+-148.5 mm), and once along the length
// at mid-depth (105 mm): the folded packet is 148.5 x 105 mm.
//
// Texture orientation: canvas left = low notes (local -x), canvas top = far edge (local -z, the black keys).
//   KB                       the numbers above (mm)
//   blackKeys()              [{ note, x0, x1 }] in mm from the keyboard's left edge (for sidecars / fingering)
//   paperKeysArt()           ArtTex (sets/_art.js): colour, greys, and a hand-drawn edge map (every key edge, black keys
//                            filled) so line / contour show the exact layout
//   paperKeysMesh(look)      the flat paper as a textured plane, local frame as KEYS (x along, z across, y up)
import * as THREE from 'three';
import { mk } from '../../engine/core.js';
import { artFromCanvas } from '../_art.js';

export const KB = { paper: [594, 210], whites: 22, first: 'C3', last: 'C6', white: [23.5, 150], black: [13.7, 95],
  tape: 19, seam: 0, folds: { across: [-148.5, 0, 148.5], along: [105] } };
KB.size = [KB.whites * KB.white[0], KB.white[1]];
KB.margin = [(KB.paper[0] - KB.size[0]) / 2, (KB.paper[1] - KB.size[1]) / 2];
// black keys of one octave: [white-key boundary index after C, offset of the black key's centre from it, name]
const OCT = [[1, -2.3, 'C#'], [2, 2.3, 'D#'], [4, -3.4, 'F#'], [5, 0, 'G#'], [6, 3.4, 'A#']];
export function blackKeys() {
  const out = []; const octs = Math.floor((KB.whites - 1) / 7);   // C3..B5 = 3 full octaves; the top C has no black key after it
  for (let o = 0; o < octs; o++) for (const [b, off, nm] of OCT) { const c = (o * 7 + b) * KB.white[0] + off; out.push({ note: nm + (3 + o), x0: c - KB.black[0] / 2, x1: c + KB.black[0] / 2 }); }
  return out;
}

const PX = 6;   // px per mm: 3564 x 1260
let cached = null;
export function paperKeysArt() {
  if (cached) return cached;
  const [PW, PH] = KB.paper, W = PW * PX, H = PH * PX, X = (mm) => mm * PX;
  const kx0 = KB.margin[0], ky0 = KB.margin[1], kw = KB.white[0], kl = KB.white[1];
  const mkC = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  // ---- colour: white printer paper, black toner
  const c = mkC(), g = c.getContext('2d');
  g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#efece4'; g.fillRect(X(PW / 2), 0, X(PW / 2), H);   // the second sheet a hair warmer (another ream)
  const keys = (ctx, stroke, lw, fill) => {
    ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'miter';
    ctx.strokeRect(X(kx0), X(ky0), X(KB.size[0]), X(kl));
    ctx.beginPath(); for (let k = 1; k < KB.whites; k++) { ctx.moveTo(X(kx0 + k * kw), X(ky0)); ctx.lineTo(X(kx0 + k * kw), X(ky0 + kl)); } ctx.stroke();
    ctx.fillStyle = fill; for (const b of blackKeys()) ctx.fillRect(X(kx0 + b.x0), X(ky0), X(b.x1 - b.x0), X(KB.black[1]));
  };
  keys(g, '#1b1b1b', X(0.8), '#151515');
  // map-fold creases: a fine shadow line with a highlight beside it (valley / mountain alternate)
  const crease = (ctx, x0, y0, x1, y1, dark, light, w) => { ctx.lineWidth = w; ctx.strokeStyle = dark; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    if (light) { ctx.strokeStyle = light; ctx.beginPath(); const dx = y1 === y0 ? 0 : w * 1.2, dy = y1 === y0 ? w * 1.2 : 0; ctx.moveTo(x0 + dx, y0 + dy); ctx.lineTo(x1 + dx, y1 + dy); ctx.stroke(); } };
  for (const a of KB.folds.across) crease(g, X(PW / 2 + a), 0, X(PW / 2 + a), H, 'rgba(120,112,98,0.6)', 'rgba(255,255,255,0.8)', X(0.5));
  for (const a of KB.folds.along) crease(g, 0, X(a), W, X(a), 'rgba(120,112,98,0.6)', 'rgba(255,255,255,0.8)', X(0.5));
  // the seam: the two sheets butted (a hairline), clear tape over it (19 mm, full depth), its edges catching the light
  g.strokeStyle = 'rgba(90,85,75,0.7)'; g.lineWidth = X(0.25); g.beginPath(); g.moveTo(X(PW / 2), 0); g.lineTo(X(PW / 2), H); g.stroke();
  g.fillStyle = 'rgba(214,226,232,0.2)'; g.fillRect(X(PW / 2 - KB.tape / 2), 0, X(KB.tape), H);
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(X(PW / 2 - KB.tape / 2 + 3), 0, X(4), H);   // a soft sheen along the tape
  g.strokeStyle = 'rgba(150,160,165,0.8)'; g.lineWidth = X(0.3);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(X(PW / 2 + s * KB.tape / 2), 0); g.lineTo(X(PW / 2 + s * KB.tape / 2), H); g.stroke(); }
  // ---- edge map for line / contour (multiplied over them): every key edge, black keys filled; tape and creases fainter
  const e = mkC(), eg = e.getContext('2d');
  eg.fillStyle = '#ffffff'; eg.fillRect(0, 0, W, H);
  keys(eg, '#000000', X(1.6), '#000000');
  for (const a of KB.folds.across) crease(eg, X(PW / 2 + a), 0, X(PW / 2 + a), H, '#707070', null, X(1.0));
  for (const a of KB.folds.along) crease(eg, 0, X(a), W, X(a), '#707070', null, X(1.0));
  eg.strokeStyle = '#555555'; eg.lineWidth = X(1.1);
  for (const s of [-1, 1]) { eg.beginPath(); eg.moveTo(X(PW / 2 + s * KB.tape / 2), 0); eg.lineTo(X(PW / 2 + s * KB.tape / 2), H); eg.stroke(); }
  // keep the black keys solid over the tape / creases in the edge map
  eg.fillStyle = '#000000'; for (const b of blackKeys()) eg.fillRect(X(kx0 + b.x0), X(ky0), X(b.x1 - b.x0), X(KB.black[1]));
  cached = artFromCanvas(c, { edgeCanvas: e, src: 'code: layout/sets/attic88_day/keyboard.js' });
  return cached;
}

// the paper as one textured plane in the KEYS frame (x along the keyboard, low notes at -x; far edge at -z; y up)
export function paperKeysMesh(look = {}) {
  const a = paperKeysArt(); const geo = new THREE.PlaneGeometry(KB.paper[0] / 1000, KB.paper[1] / 1000); geo.rotateX(-Math.PI / 2);   // +v (canvas top) -> -z
  const m = mk(geo, { grey: 0.96, col: 0xf4f1e8, noCast: true, ...look, art: a.art, artGrey: a.artGrey, artEdge: a.artEdge }); m.userData.art = true; return m;
}
