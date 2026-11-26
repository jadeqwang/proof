// Build one basement90 shot: room (from layout.js) + desk, computer, swivel chair + figures + the screen-light rig.
import * as THREE from 'three';
import { mk, box, cyl, ball, quad, slab, tag, V, rad } from '../../engine/core.js';
import { stage, solveCamera, hideParts } from '../../engine/stage.js';
import { aim } from '../../engine/aim.js';
import { prismSolid, applyBeamMask } from '../_beam.js';
import { artFromCanvas } from '../_art.js';
import { HOUSE, ROOM, DESK, PC, KB_Y, SOCKET, SCREEN, screenPoint, screenCorners, TEXT, WORD, WORD_P, DOS, FLOPPY, CHAIR, spokePoint, FEET, PROPS, GROUP, BEAM, beamFar, deskTerminator, LIGHTS, BULB_P } from './layout.js';
import { wall, hexa, polyline, swivelChair, r3, hideLabels, footwear } from './kit.js';
import { loadProps, prop } from '../_props.js';
// props phase 2 (r4 decisions, 2026-11-26): downloaded models for the keyboard, the bulb and the pull-chain lampholder
// (work/props_audit.md; credits in docs/credits_tools.md)
await loadProps(['keyboard', 'bulb', 'pull_chain_socket']);
import { FOOTWEAR } from './house.js';

const CONC = { grey: 0.62, col: 0x77756f }, BLOCK = { grey: 0.7, col: 0x8a8880 }, WOOD = { grey: 0.5, col: 0x6b5236 }, WOOD_D = { grey: 0.36, col: 0x4a3826 };
const BEIGE = { grey: 0.8, col: 0xc9c2ad }, DARK = { grey: 0.2, col: 0x222226 }, CARD = { grey: 0.6, col: 0x9a7c55 };

function room(shot = {}) {
  const g = new THREE.Group(); const { x0, x1, z0, z1, h } = ROOM, T = ROOM.wallT, K = HOUSE.kitchen, FTF = HOUSE.floorToFloor, TALL = FTF + 2.3;
  g.add(tag(box(x1 - x0 + 2 * T, 0.1, z1 - z0 + 2 * T, CONC, [(x0 + x1) / 2, -0.05, (z0 + z1) / 2]), 'concrete slab'));
  const W = ROOM.hopper;
  g.add(wall({ axis: 'z', at: z0, a0: x0 - T, a1: x1 + T, y1: TALL, t: T, out: -1, holes: [{ a0: W.x - W.w / 2, a1: W.x + W.w / 2, y0: W.y0, y1: W.y1 }], look: BLOCK, label: 'back wall (block)' }));
  g.add(wall({ axis: 'z', at: z1, a0: x0 - T, a1: x1 + T, y1: TALL, t: T, out: 1, look: BLOCK, label: 'front wall (block)' }));
  g.add(wall({ axis: 'x', at: x0, a0: z0, a1: z1, y1: TALL, t: T, out: -1, look: BLOCK, label: 'left wall (block; the stair top)' }));
  g.add(wall({ axis: 'x', at: x1, a0: z0, a1: z1, y1: TALL, t: T, out: 1, look: BLOCK, label: 'right wall (block)' }));
  // hopper window: frame, dark glass, night beyond
  g.add(tag(box(W.w + 0.08, 0.04, 0.1, WOOD_D, [W.x, W.y0 - 0.02, z0 - 0.05]), 'hopper window (night)')); g.add(tag(box(W.w + 0.08, 0.04, 0.1, WOOD_D, [W.x, W.y1 + 0.02, z0 - 0.05]), 'hopper window (night)'));
  g.add(tag(box(W.w, W.y1 - W.y0, 0.01, { grey: 0.15, col: 0x05070c, noCast: true }, [W.x, (W.y0 + W.y1) / 2, z0 - 0.12]), 'hopper window (night)'));
  // the floor above (kitchen over x -1.8..1.8, the landing / back hall over the strip beyond it): subfloor and 2x8 joists
  // along z over the whole basement, except the stairwell opening over the flight (x S.x0..S.openX1, z S.z0..z1), where
  // the joists stop at a doubled header (z S.z0) and a trimmer (x S.openX1). Joists keep the kitchen's 16 in grid.
  const D = HOUSE.stairDoor, S = HOUSE.stair, L = HOUSE.landing, J = ROOM.joist, OX = S.openX1;
  g.add(tag(box(OX - x0, 0.04, S.z0 - z0, WOOD_D, [(x0 + OX) / 2, h + 0.02, (z0 + S.z0) / 2]), 'subfloor (floor above)'));
  g.add(tag(box(x1 - OX, 0.04, z1 - z0, WOOD_D, [(OX + x1) / 2, h + 0.02, (z0 + z1) / 2]), 'subfloor (floor above)'));
  for (let x = K.x0 + 0.1 - J.spacing * Math.floor((K.x0 + 0.1 - x0) / J.spacing); x < x1; x += J.spacing) { const ze = x < OX ? S.z0 : z1;
    g.add(tag(box(J.w, J.d, ze - z0, WOOD, [x, h - J.d / 2, (z0 + ze) / 2]), 'floor joists')); }
  g.add(tag(box(OX - x0, J.d, 0.09, WOOD_D, [(x0 + OX) / 2, h - J.d / 2, S.z0 - 0.045]), 'stairwell header'));
  g.add(tag(box(0.09, J.d, z1 - S.z0, WOOD_D, [OX + 0.045, h - J.d / 2, (S.z0 + z1) / 2]), 'stairwell header'));
  // the stairwell above the opening: the walls that close it off from the kitchen (its front-left corner) and the landing
  // level (kitchen-floor height); the kitchen's left wall with the stair door, above the landing
  const SW = { grey: 0.74, col: 0x8f8778 };
  g.add(wall({ axis: 'z', at: S.z0, a0: K.x0, a1: OX, y0: h, y1: TALL, t: 0.1, out: -1, look: SW, label: 'stairwell wall (kitchen corner above)' }));
  g.add(wall({ axis: 'x', at: OX, a0: S.z0, a1: z1, y0: h, y1: TALL, t: 0.1, out: 1, look: SW, label: 'stairwell wall (kitchen corner above)' }));
  g.add(wall({ axis: 'x', at: K.x0, a0: z0, a1: S.z0, y0: h, y1: TALL, t: 0.12, out: 1, holes: [{ a0: D.z0, a1: D.z1, y0: FTF, y1: FTF + D.h }], look: SW, label: 'kitchen wall above (stair door)' }));
  g.add(tag(box(D.z1 - D.z0, D.h, 0.04, { grey: 0.86, col: 0xd8d2c0 }, [K.x0 - 0.02, FTF + D.h / 2, (D.z0 + D.z1) / 2], [0, 90, 0]), 'kitchen wall above (stair door)'));
  g.add(tag(box(L.x1 - L.x0, 0.05, L.z1 - L.z0, WOOD, [(L.x0 + L.x1) / 2, FTF - 0.025, (L.z0 + L.z1) / 2]), 'stair landing (kitchen level)'));
  g.add(tag(box(x1 - x0 + 2 * T, 0.05, z1 - z0 + 2 * T, { grey: 0.3, col: 0x2a2620, noCast: true }, [(x0 + x1) / 2, TALL, (z0 + z1) / 2]), 'stairwell ceiling'));
  // the flight: open risers, two stringers, a wall rail on the front wall; a guard rail along the landing's front edge
  // (the landing stands over treads 2-4), the top tread entered sideways from the landing
  const zc = (S.z0 + S.z1) / 2, sw = S.z1 - S.z0, nose = (k) => [S.x0 + (k - 1) * S.tread, FTF - (k - 1) * S.rise];   // riser k's top nosing
  for (let k = 1; k < S.risers; k++) g.add(tag(box(S.tread + 0.02, 0.04, sw - 0.08, WOOD, [S.x0 + (k - 0.5) * S.tread, FTF - k * S.rise - 0.02, zc]), 'basement stair (open risers)'));
  for (const zs of [S.z0 + 0.02, S.z1 - 0.02]) g.add(tag(slab(V(S.x0 - 0.05, FTF - 0.13, zs), V(S.footX + 0.1, -0.02, zs), 0.24, 0.04, V(1, 0, 0), WOOD_D), 'stair stringers'));
  { const a = nose(1), b = nose(S.risers); g.add(tag(slab(V(a[0], a[1] + 0.86, S.z1 - 0.06), V(b[0], b[1] + 0.86, S.z1 - 0.06), 0.045, 0.045, V(0, 0, 1), WOOD), 'handrail (on the front wall)'));
    for (const k of [2, 6, 10]) { const n = nose(k); g.add(tag(box(0.03, 0.05, 0.06, DARK, [n[0], n[1] + 0.82, S.z1 - 0.03]), 'handrail (on the front wall)')); } }
  { const xa = S.x0 + S.tread, yr = FTF + 0.9; g.add(tag(box(L.x1 - xa, 0.045, 0.045, WOOD, [(xa + L.x1) / 2, yr, S.z0 - 0.03]), 'landing guard rail'));
    for (const x of [xa + 0.02, (xa + L.x1) / 2, L.x1 - 0.02]) g.add(tag(box(0.04, 0.9, 0.04, WOOD, [x, FTF + 0.45, S.z0 - 0.03]), 'landing guard rail')); }
  // lally column ("post") and the main beam over it, along x (the joists rest on it)
  g.add(tag(cyl(ROOM.column.r, ROOM.column.r, h - 0.24, { grey: 0.4, col: 0x5a2f28 }, [ROOM.column.x, (h - 0.24) / 2, ROOM.column.z], null, 14), 'steel column (post)'));
  g.add(tag(box(0.2, 0.012, 0.2, { grey: 0.4, col: 0x5a2f28 }, [ROOM.column.x, 0.006, ROOM.column.z]), 'steel column (post)'));
  g.add(tag(box(x1 - x0, 0.24, 0.2, WOOD_D, [(x0 + x1) / 2, h - 0.12, ROOM.column.z]), 'main beam'));
  // the ceiling light (Jade 2026-11-26: bare bulb, porcelain pull-chain holder): junction box under the joist, white porcelain pull-chain lampholder, bare bulb, chain
  const B = ROOM.bulb, jb = h - J.d, lampOn = shot.light?.ceiling !== false;
  g.add(tag(cyl(0.05, 0.05, B.box, { grey: 0.55, col: 0x7a7a78 }, [B.x, jb - B.box / 2, B.z], null, 8), 'ceiling light (porcelain lampholder)'));
  // props phase 2 (r4): the lampholder is Poly Haven "Pull Chain Light Socket" (CC0; its own short chain; porcelain disc
  // on top, the receptacle 5.5 cm below its top), the bulb Poly Haven "Lightbulb 01" (CC0) screwed in upside down 2.5 cm
  // deep. Both hang from the junction box; BULB_P (layout.js) is the glass's centre. Fallback: the old primitives.
  const top = jb - B.box, holder = prop('pull_chain_socket', { at: [B.x, top - SOCKET.h, B.z], label: 'ceiling light (porcelain lampholder)' });
  if (holder) g.add(holder); else g.add(tag(cyl(0.045, 0.03, B.holder, { grey: 0.95, col: 0xece8de }, [B.x, jb - B.box - B.holder / 2, B.z], null, 16), 'ceiling light (porcelain lampholder)'));
  const glassLook = { grey: 0.9, col: 0xfff0d0, ...(lampOn ? { emit: LIGHTS.ceiling.color, emitI: 2.2, flatEmit: 0.97 } : {}), noCast: true };
  const bulb = prop('bulb', { at: [B.x, top - SOCKET.receptacle + SOCKET.screwIn, B.z], rot: [180, 0, 0], label: lampOn ? 'ceiling bulb (on)' : 'ceiling bulb (off)', lookMat: { lightbulb_01_glass: glassLook } });
  if (bulb) g.add(bulb); else g.add(tag(ball(B.r, { ...glassLook, emitI: 2.2 }, [BULB_P[0], BULB_P[1], BULB_P[2]], [1, 1.3, 1]), lampOn ? 'ceiling bulb (on)' : 'ceiling bulb (off)'));
  return g;
}

// THE CANONICAL SCREEN (r4 decisions, Jade 2026-11-26: "it wasn't c, this was qbasic era, and he wasn't a professor. he
// was working on a weekend project with his friend, a real time chat application that was two side by side
// wordperfect-like environments"; earlier: "dark blue text on grey ... he was renaming a variable. it was DOS era"):
// the MS-DOS QBasic 1.1 editor (c. 1990), 80 x 25, drawn in code so every shot shows the same characters. Menu bar (row
// 0), the CHAT.BAS window with its border and scroll bar, the 2-line Immediate window, the status line with the cursor's
// line:column. Colours: Jade's dark blue text on light grey (QBasic's Options > Display sets them; its default is the
// reverse, grey on blue: flagged). The program (real QBasic 1.1 syntax; ASSUMED content, flag): the main loop of a
// split-screen chat over the modem on COM1, his keystrokes in the left pane, the friend's in the right (the panes are
// drawn by SUBs DrawPanes / PutPane, off screen). Dad has renamed `txt$` to `outLine$` (Search > Change, one by one) and
// missed the one on row 10, `PRINT #1, txt$` (it would send his friend an empty line): THE WORD her finger is on
// (DOS.wordRow / wordCol in layout.js; checked against the text below at build time). Rows are drawn exactly as given
// (border and box characters included); null rows are the inverse bars.
export const DOS_TEXT = [
  null,   // row 0: the menu bar (drawn inverse)
  '┌────────────────────────────────── CHAT.BAS ──────────────────────────────────↑',
  '│DECLARE SUB DrawPanes ()                                                      ░',
  '│DECLARE SUB PutPane (pane%, t$)                                               ░',
  '│\' CHAT.BAS - split-screen chat over the modem (COM1, 2400 baud)               ░',
  '│OPEN "COM1:2400,N,8,1,RS,CS0,DS0,CD0" FOR RANDOM AS #1                        ░',
  '│CLS : DrawPanes                                                               ░',
  '│DO                                                                            ░',
  '│    k$ = INKEY$                                                               ░',
  '│    IF k$ = CHR$(13) THEN                                                     ░',
  '│        PRINT #1, txt$                                                        ░',
  '│        PutPane 1, outLine$: outLine$ = ""                                    ░',
  '│    ELSEIF k$ = CHR$(27) THEN                                                 ░',
  '│        EXIT DO                                                               ░',
  '│    ELSEIF k$ <> "" THEN                                                      ░',
  '│        outLine$ = outLine$ + k$                                              ░',
  '│        LOCATE 23, 2: PRINT outLine$;                                         ░',
  '│    END IF                                                                    ░',
  '│    IF LOC(1) > 0 THEN PutPane 2, INPUT$(LOC(1), #1)                          ░',
  '│LOOP                                                                          ░',
  '│CLOSE #1: END                                                                 ░',
  '├───────────────────────────────── Immediate ──────────────────────────────────┤',
  '│                                                                              │',
  '│                                                                              │',
  null,   // row 24: the status line (drawn inverse)
];
const DOS_BAR = '  File  Edit  View  Search  Run  Debug  Options                              Help ';
const DOS_HELP = ' <Shift+F1=Help> <F6=Window> <F2=Subs> <F5=Run> <F8=Step>              00009:023 ';
const DOS_GREY = '#aaaaaa', DOS_BLUE = '#0000aa';   // the VGA text palette's light grey (7) and blue (1)
let _dos = null;
function dosScreen() {   // -> art texture set (sets/_art.js): colour for lit, greys for flat / label / form, edges for line / contour
  if (_dos) return _dos;
  if (DOS_TEXT[DOS.wordRow].substr(DOS.wordCol, DOS.word.length) !== DOS.word) throw new Error('basement90: THE WORD is not at DOS.wordRow / wordCol');
  const W = 2048, Hh = Math.round(W * SCREEN.h / SCREEN.w), c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
  g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, W, Hh);   // overscan border
  const x0 = DOS.u0 * W, y0 = DOS.v0 * Hh, cw = (DOS.u1 - DOS.u0) * W / DOS.cols, ch = (DOS.v1 - DOS.v0) * Hh / DOS.rows;
  g.fillStyle = DOS_GREY; g.fillRect(x0, y0, cw * DOS.cols, ch * DOS.rows);
  g.textBaseline = 'middle'; g.font = `bold ${Math.round(ch * 0.8)}px "DejaVu Sans Mono", "Liberation Mono", monospace`;
  // the IDE's window frame: the box-drawing characters as full-cell strokes (they join up, as in VGA text mode); the
  // scroll-bar track (light shade) as a dither
  const lw = Math.max(2, ch * 0.09);
  const boxChar = (t, x, y, fg) => { const mx = x + cw / 2, my = y + ch / 2; g.fillStyle = fg;
    const H = (a, b) => g.fillRect(a, my - lw / 2, b - a, lw), Vv = (a, b) => g.fillRect(mx - lw / 2, a, lw, b - a);
    switch (t) { case '─': H(x, x + cw); return true; case '│': Vv(y, y + ch); return true;
      case '┌': H(mx - lw / 2, x + cw); Vv(my - lw / 2, y + ch); return true; case '┐': H(x, mx + lw / 2); Vv(my - lw / 2, y + ch); return true;
      case '├': Vv(y, y + ch); H(mx, x + cw); return true; case '┤': Vv(y, y + ch); H(x, mx); return true;
      case '░': for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 4; xx++) if ((xx + yy) % 2 === 0) g.fillRect(x + (xx + 0.25) * cw / 4, y + yy * ch / 8, cw / 8, ch / 16); return true;
      default: return false; } };
  const put = (row, text, fg, bg) => { if (bg) { g.fillStyle = bg; g.fillRect(x0, y0 + row * ch, cw * DOS.cols, ch); } g.fillStyle = fg;
    for (let k = 0; k < Math.min(text.length, DOS.cols); k++) { const t = text[k]; if (t === ' ') continue; if (boxChar(t, x0 + k * cw, y0 + row * ch, fg)) continue; const m = g.measureText(t).width; g.save(); g.translate(x0 + k * cw + cw / 2, y0 + row * ch + ch * 0.54); g.scale(Math.min(1, cw * 0.92 / m), 1); g.fillText(t, -m / 2, 0); g.restore(); } };
  put(0, DOS_BAR.padEnd(DOS.cols), DOS_GREY, DOS_BLUE); put(DOS.rows - 1, DOS_HELP.padEnd(DOS.cols), DOS_GREY, DOS_BLUE);
  DOS_TEXT.forEach((t, r) => { if (t != null) put(r, t, DOS_BLUE); });
  // the text cursor (an underline block) just after THE WORD, where he stopped
  g.fillStyle = DOS_BLUE; g.fillRect(x0 + (DOS.wordCol + DOS.word.length) * cw, y0 + DOS.wordRow * ch + ch * 0.82, cw, ch * 0.14);
  _dos = artFromCanvas(c, { src: 'basement90 dosScreen() (code-drawn)' });
  return _dos;
}

// several meshes (positioned, one look) -> one mesh with their geometry baked in world space
function mergeMeshes(ms, look) {
  const pos = [], nrm = [];
  for (const m of ms) { m.updateMatrix(); const gg = m.geometry.clone().applyMatrix4(m.matrix).toNonIndexed(); pos.push(...gg.attributes.position.array); nrm.push(...gg.attributes.normal.array); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return mk(geo, look);
}
function furniture(shot) {
  const g = new THREE.Group(); const D = DESK;
  // desk: top, drawer pedestal (right), two legs (left), modesty panel at the back
  g.add(tag(box(D.x1 - D.x0, D.t, D.z1 - D.z0, WOOD, [(D.x0 + D.x1) / 2, D.top - D.t / 2, (D.z0 + D.z1) / 2]), 'desk'));
  g.add(tag(box(D.x1 - D.pedestalX0 - 0.02, D.top - D.t, D.z1 - D.z0 - 0.06, WOOD_D, [(D.x1 + D.pedestalX0) / 2, (D.top - D.t) / 2, (D.z0 + D.z1) / 2]), 'desk drawers'));
  for (let k = 0; k < 3; k++) g.add(tag(box(0.12, 0.015, 0.02, DARK, [(D.x1 + D.pedestalX0) / 2, 0.16 + k * 0.2, D.z1 - 0.02]), 'desk drawers'));
  for (const z of [D.z0 + 0.04, D.z1 - 0.04]) g.add(tag(box(D.leg, D.top - D.t, D.leg, WOOD_D, [D.x0 + 0.04, (D.top - D.t) / 2, z]), 'desk legs (open side)'));
  g.add(tag(box(D.pedestalX0 - D.x0, D.top - D.t - D.modesty.y0, 0.018, WOOD_D, [(D.x0 + D.pedestalX0) / 2, (D.top - D.t + D.modesty.y0) / 2, D.z0 + 0.03]), 'desk'));
  // computer
  const C = PC.case, M = PC.monitor, x = PC.x, zc = C.zBack + C.d / 2;
  g.add(tag(box(C.w, C.h, C.d, BEIGE, [x, D.top + C.h / 2, zc]), 'computer (desktop case)'));
  g.add(tag(box(0.15, 0.012, 0.004, DARK, [x + 0.1, D.top + C.h * 0.62, C.zBack + C.d + 0.002]), 'floppy drive')); g.add(tag(box(0.15, 0.012, 0.004, DARK, [x + 0.1, D.top + C.h * 0.3, C.zBack + C.d + 0.002]), 'floppy drive'));
  // (hold pass 2026-11-26) foot, bezel and tube housing as ONE mesh: the monitor is one rigid object for the hold check
  // (her fingertip on the glass; engine/main.js holdsFor hulls one mesh), resting on the case by its foot
  const my = D.top + C.h + M.foot + M.h / 2;
  g.add(tag(mergeMeshes([cyl(0.09, 0.11, M.foot, BEIGE, [x, D.top + C.h + M.foot / 2, zc], null, 16), box(M.w, M.h, M.d * 0.45, BEIGE, [x, my, C.zBack + M.d - M.d * 0.225]),
    box(M.w * 0.72, M.h * 0.78, M.d * 0.55, BEIGE, [x, my, C.zBack + M.d * 0.275 + 0.0])], BEIGE), 'CRT monitor'));
  const on = shot.light?.screen !== false, sc = screenCorners().map((p) => V(p));
  // the glass: the canonical DOS screen. Lit: it glows (emissive, the texture in colour); every other mode: the same
  // texture as fixed art (greys in flat / label / form, its edges in line / contour). Screen off: dark glass.
  const D0 = dosScreen();
  if (on) { g.add(tag(quad(sc, { grey: 0.95, col: 0x101830, emit: 0xffffff, emitI: 0.5, litMap: D0.art, only: ['lit'], noCast: true }), 'screen (the beam source)'));
    g.add(tag(quad(sc, { grey: 0.9, art: D0.art, artGrey: D0.artGrey, artEdge: D0.artEdge, hide: ['lit'], noCast: true }), 'screen (the beam source)')); }
  else g.add(tag(quad(sc, { grey: 0.2, col: 0x101830, noCast: true }), 'screen (the beam source)'));
  // hold pass 2 (2026-11-26): the glass edge's tubes are parts of the monitor (same parent, same label), so the hold check
  // does not take them as a support the monitor sinks into
  for (const m of [...polyline([...screenCorners()].map((p) => [p[0], p[1], p[2] + 0.0005]), 0.0015, { grey: 0.3, col: 0x30343c, noCast: true }, true).children]) g.add(tag(m, 'CRT monitor'));
  // THE WORD (label mode only): a white sliver over it, the gold underline is drawn under it by the renderer; elsewhere
  // the word is the texture's own characters
  { const a = screenPoint(WORD.u0, WORD.v - TEXT.pitch * 0.95, 0.0012), b = screenPoint(WORD.u1, WORD.v - TEXT.pitch * 0.05, 0.0012);
    g.add(tag(box(b[0] - a[0], a[1] - b[1], 0.0008, { grey: 1, col: 0xffffff, only: ['label'], noCast: true }, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2]]), 'THE WORD (the one he missed)')); }
  // props phase 2 (r4): the keyboard is the downloaded IBM-style model (CC BY), flat on the desk, key tops sloping down
  // toward Dad (its own wedge); KB_TOP / KB_UP in layout.js follow its key tops for the taps. Fallback: the old box.
  { const KB = PC.keyboard, m = prop('keyboard', { at: [x, KB_Y, KB.z], label: 'keyboard' });
    if (m) g.add(m); else g.add(tag(box(KB.w, KB.h, KB.d, BEIGE, [x, KB_Y + KB.h / 2, KB.z]), 'keyboard')); }
  const PR = PC.printer; g.add(tag(box(PR.w, PR.h, PR.d, BEIGE, [PR.x, D.top + PR.h / 2, PR.z]), 'dot-matrix printer'));
  g.add(tag(box(PR.w * 0.62, 0.3, 0.004, { grey: 0.95, col: 0xe8e4d8 }, [PR.x, D.top + PR.h + 0.1, PR.z - 0.07], [-22, 0, 0]), 'fanfold paper'));
  g.add(tag(box(0.24, 0.05, 0.28, { grey: 0.95, col: 0xe8e4d8 }, [PR.x, 0.025, D.z1 + 0.25]), 'fanfold paper'));
  // floppy disks (r4, Jade: the old box "is in a weird shape"): a neat flat stack of 5.25 in disks (period-right for a
  // 1990 PC with two 5.25 in drives, flag) at real size: each disk in its white paper sleeve (14.0 cm square, 1.8 mm),
  // squared up by hand (a few mm / deg of drift); the top one out of its sleeve: black jacket 13.3 cm, white label, hub
  // ring, head slot (brown media showing)
  { const F = FLOPPY, grp = new THREE.Group(); grp.position.set(F.x, D.top, F.z); grp.rotation.y = rad(F.yaw);
    for (let k = 0; k < F.n; k++) { const j = Math.sin(k * 2.39) , y = k * F.sleeveT + F.sleeveT / 2;
      grp.add(box(F.sleeve, F.sleeveT * 0.96, F.sleeve, { grey: 0.9, col: 0xebe7da }, [j * 0.003, y, Math.cos(k * 1.7) * 0.003], [0, j * 2.5, 0])); }
    const ty = F.n * F.sleeveT, J = F.jacket, top = new THREE.Group(); top.position.set(0.012, ty + F.jacketT / 2, -0.006); top.rotation.y = rad(-7); grp.add(top);
    top.add(box(J, F.jacketT, J, { grey: 0.12, col: 0x121214 }, [0, 0, 0]));
    top.add(box(0.08, 0.0004, 0.028, { grey: 0.95, col: 0xf2f0e8 }, [0, F.jacketT / 2 + 0.0002, -J / 2 + 0.022]));
    top.add(cyl(0.0195, 0.0195, 0.0004, { grey: 0.55, col: 0x8a7a62 }, [0, F.jacketT / 2 + 0.0002, 0], null, 24));
    top.add(cyl(0.0145, 0.0145, 0.0006, { grey: 0.3, col: 0x2a2620 }, [0, F.jacketT / 2 + 0.0003, 0], null, 24));
    top.add(box(0.012, 0.0004, 0.03, { grey: 0.35, col: 0x5a3f26 }, [0, F.jacketT / 2 + 0.0002, J / 2 - 0.027]));
    top.add(box(0.006, 0.0004, 0.004, { grey: 0.6, col: 0x9a9a9a }, [J / 2 - 0.012, F.jacketT / 2 + 0.0002, -J / 2 + 0.045]));   // write-protect notch
    g.add(tag(grp, 'floppy disks (5.25 in, a stack)')); }
  // the 1950s wringer washer (ASSUMED type): round enamel tub on four legs with casters, motor box under it, agitator,
  // a power wringer (two rollers in a frame) on a post at the back of the tub
  { const W = PROPS.washer, EN = { grey: 0.9, col: 0xdedbd2 }, ST = { grey: 0.45, col: 0x6a6c70 }, RB = { grey: 0.3, col: 0x3c3a36 };
    g.add(tag(cyl(W.r, W.r * 0.93, W.tubY1 - W.tubY0, EN, [W.x, (W.tubY0 + W.tubY1) / 2, W.z], null, 28), 'wringer washer (1950s)'));
    g.add(tag(cyl(W.r + 0.015, W.r + 0.015, 0.03, EN, [W.x, W.tubY1 - 0.015, W.z], null, 28), 'wringer washer (1950s)'));
    g.add(tag(cyl(W.r - 0.03, W.r - 0.03, 0.006, { grey: 0.55, col: 0x8a8a86 }, [W.x, W.tubY1 - 0.1, W.z], null, 24), 'wringer washer (1950s)'));
    g.add(tag(cyl(0.05, 0.07, 0.3, EN, [W.x, W.tubY1 - 0.2, W.z], null, 12), 'wringer washer (1950s)'));
    for (let k = 0; k < 4; k++) { const a = rad(45 + 90 * k), lx = W.x + Math.cos(a) * W.r * 0.8, lz = W.z + Math.sin(a) * W.r * 0.8;
      g.add(tag(slab(V(lx, W.tubY0 + 0.02, lz), V(W.x + Math.cos(a) * W.r * 0.95, 0.04, W.z + Math.sin(a) * W.r * 0.95), W.leg, W.leg, V(0, 1, 0).cross(V(Math.cos(a), 0, Math.sin(a))), ST), 'wringer washer (1950s)'));
      g.add(tag(ball(0.025, ST, [W.x + Math.cos(a) * W.r * 0.95, 0.025, W.z + Math.sin(a) * W.r * 0.95]), 'wringer washer (1950s)')); }
    g.add(tag(box(0.26, 0.18, 0.22, ST, [W.x, W.tubY0 - 0.1, W.z]), 'wringer washer (1950s)'));
    const R = W.wringer, pz = W.z - W.r - 0.02;
    g.add(tag(cyl(0.022, 0.022, R.y - W.tubY1 + 0.08, ST, [W.x, (R.y + W.tubY1) / 2 - 0.02, pz], null, 10), 'wringer'));
    g.add(tag(box(R.len + 0.1, 0.2, 0.08, EN, [W.x, R.y, pz]), 'wringer'));
    for (const dy of [-0.04, 0.04]) g.add(tag(cyl(R.r, R.r, R.len, RB, [W.x, R.y + dy, pz + 0.045], [0, 0, 90], 14), 'wringer rollers'));
    g.add(tag(slab(V(W.x + R.len / 2 + 0.05, R.y + 0.06, pz), V(W.x + R.len / 2 + 0.2, R.y + 0.16, pz), 0.02, 0.02, V(0, 0, 1), ST), 'wringer')); }
  // two watermelons, 20+ lb each: oblong, dark green (paint the stripes), lying on the slab
  for (const M of PROPS.melons) { const m = ball(0.5, { grey: 0.35, col: 0x2f5a2a }, [M.x, M.d * 0.46, M.z], [M.d, M.d * 0.92, M.len]); m.rotation.y = rad(M.yaw); g.add(tag(m, 'watermelons (2)')); }
  return g;
}

// lit-preview levels of the ceiling bulb, its bounce, and a warm sky/ground fill (2026-11-25 second pass, Jade: more ambient so
// the image models can read everything; was CEIL 3.2 / AMB 0.7 / no fill). Tuned by eye on B0_wide / B2 / B3 / B4.
const CEIL_LIT = 3.6, AMB_LIT = 1.35, FILL_LIT = 1.0;
export function build(shot, { makeCam }) {
  const scene = new THREE.Scene(); const root = new THREE.Group(); scene.add(root);
  root.add(room(shot)); root.add(furniture(shot));
  const chairSpec = { at: CHAIR.at, seatYaw: CHAIR.seatYaw, spoke0: CHAIR.spoke0, ...(shot.chair || {}) };
  root.add(swivelChair(CHAIR, chairSpec));
  const extra = (t) => (t === 'word' ? V(WORD_P) : t === 'screen' ? V(SCREEN.c) : null);
  const { figs } = stage(shot.figs, null, extra);
  for (const f of Object.values(figs)) root.add(f);
  for (const [who, fw] of Object.entries(FOOTWEAR)) if (figs[who]) root.add(footwear(figs[who], fw));   // socks / slippers (Jade 2026-11-25)
  // the lit volume (lit preview only) and its cut on the floor (label mode only)
  const far = beamFar(), term = deskTerminator(0), wAt = (z) => SCREEN.w / 2 + Math.tan(rad(BEAM.halfAngleDeg)) * (z - SCREEN.c[2]);
  const sc = screenCorners(); root.add(tag(hexa([sc[1], sc[0], sc[3], sc[2]], far, { glass: true, col: BEAM.color, opacity: 0.05, noCast: true, noRecv: true }), 'beam volume'));
  const G = { grey: 0.1, col: 0x2040ff, only: ['label'], noCast: true };
  const lineAt = (z) => [[Math.max(SCREEN.c[0] - wAt(z), ROOM.x0 + 0.02), 0.006, z], [Math.min(SCREEN.c[0] + wAt(z), ROOM.x1 - 0.02), 0.006, z]];
  root.add(tag(polyline(lineAt(term.umbra), 0.006, G), 'beam: desk shadow ends (penumbra starts)')); root.add(tag(polyline(lineAt(term.full), 0.006, G), 'beam: floor fully lit from here'));
  hideLabels(root, shot.hide);
  Object.assign(shot, solveCamera(shot, figs, null, aim));
  hideParts(shot.hideParts, figs);
  const cam = makeCam(shot);
  const on = shot.light?.screen !== false, Lp = V(LIGHTS.screen.pos), La = V(LIGHTS.screen.aim);
  const lampOn = shot.light?.ceiling !== false, Bp = V(BULB_P), hex = (c) => '#' + c.toString(16).padStart(6, '0');
  const lights = [{ name: 'screen', kind: LIGHTS.screen.kind, pos: Lp, aim: La, color: hex(BEAM.color), on },
    { name: 'ceiling', kind: LIGHTS.ceiling.kind, pos: Bp, color: hex(LIGHTS.ceiling.color), on: lampOn }];
  const rig = (mode) => { const L = []; if (mode === 'none' || shot.beamMask) return L; const white = mode !== 'lit';
    if (on) { const s = new THREE.SpotLight(white ? 0xffffff : BEAM.color, mode === 'lit' ? 5 : 2.0, 0, rad(BEAM.halfAngleDeg + 8), 0.45, mode === 'lit' ? 1.5 : 0);
      s.position.copy(Lp); s.target.position.copy(La); s.castShadow = true; s.shadow.camera.near = 0.03; s.shadow.camera.far = 8; s.shadow.radius = mode === 'lit' ? 6 : 2; L.push(s);
      if (mode === 'lit') { const p = new THREE.PointLight(BEAM.color, 0.12, 1.2, 1.6); p.position.copy(Lp).add(V(0, 0, 0.12)); L.push(p); } }
    if (mode === 'mask') return L;
    // the ceiling bulb: the room's ambient (warm, soft shadows); the screen stays the cold key at the desk
    if (lampOn) { const p = new THREE.PointLight(white ? 0xffffff : LIGHTS.ceiling.color, white ? (shot.light?.ceilI ?? 0.8) : (shot.light?.ceilLit ?? CEIL_LIT), 9, 1.2);
      p.position.copy(Bp); p.castShadow = true; p.shadow.camera.near = 0.05; p.shadow.camera.far = 8; p.shadow.radius = mode === 'lit' ? 8 : 3; L.push(p); }
    if (!white && lampOn && (shot.light?.fillLit ?? FILL_LIT) > 0) L.push(new THREE.HemisphereLight(0xffe2bc, 0x4a4036, shot.light?.fillLit ?? FILL_LIT));   // shadowless bounce: shape without killing the bulb's shadows
    L.push(new THREE.AmbientLight(white ? 0xffffff : (lampOn ? LIGHTS.dark.color : 0x0a0c18), white ? (lampOn ? 1.0 : 1.25) : (lampOn ? (shot.light?.ambLit ?? AMB_LIT) : 1.2)));
    if (white && !lampOn) { const d = new THREE.DirectionalLight(0xffffff, 0.7); d.position.set(1, 3, 2.5); L.push(d); }
    return L; };
  const panes = { screen: screenCorners().map((p) => V(p)) };
  const extraOut = (c, P) => { const pt = (p) => ({ world: r3(p), px: P(V(p)) }); const J = figs.jade7?.userData.P;
    const out = { time: shot.time || null, position: shot.position || null,
      beam: { name: BEAM.name, model: 'area source (the screen rectangle), radiating into +z; frustum spreading by half_angle from the rectangle, faded out at range', color: lights[0].color, on,
        source_corners: screenCorners().map(pt), corner_order: 'TL,TR,BR,BL as the screen is read', axis: BEAM.axis, half_angle_deg: BEAM.halfAngleDeg, range_m: BEAM.range, falloff: BEAM.falloff,
        far_rect: far.map(pt), light_point_world: r3(Lp),
        floor: { desk_shadow_ends_z: term.umbra, fully_lit_from_z: term.full, lines: [lineAt(term.umbra), lineAt(term.full)].map((l) => l.map(pt)), note: 'the desk top cuts the light: floor nearer the desk than desk_shadow_ends_z, and everything under the desk, is unlit' } },
      word: { centre: pt(WORD_P), underline: [pt(screenPoint(WORD.u0, WORD.v, 0.001)), pt(screenPoint(WORD.u1, WORD.v, 0.001))], note: 'gold underline goes here (renderer layer)' },
      chair: { hub: pt([chairSpec.at[0], CHAIR.spokeTop, chairSpec.at[1]]), spoke_tips: [0, 1, 2, 3, 4].map((k) => pt(spokePoint(k, CHAIR.spokeR, chairSpec.at, chairSpec.spoke0))), feet_stand_at: [pt(FEET.front), pt(FEET.back)] } };
    if (J && shot.contacts) out.contacts = shot.contacts.map(([part, target]) => { const a = J[part], b = target === 'word' ? V(WORD_P) : V(target); return { a: 'jade7:' + part, a_world: r3(a), b: target, distance_cm: +(a.distanceTo(b) * 100).toFixed(1) }; });
    return out; };
  // the mask twin (beam_<id>): the screen's frustum (screen rectangle -> beamFar(), clipped by the room) white, everything
  // else black. Over the desk's width the desk top cuts it: nothing below the plane through the top of the screen and the
  // desk's front edge is lit (deskTerminator's umbra line), so the kneehole and the floor by the desk stay black.
  if (shot.beamMask && on) { const top = SCREEN.c[1] + SCREEN.h / 2, sz = SCREEN.c[2], a = DESK.z1 - sz, b = top - DESK.top;
    const roomC = [{ n: [0, -1, 0], d: 0.015 }, { n: [0, 1, 0], d: ROOM.h }, { n: [-1, 0, 0], d: -ROOM.x0 }, { n: [1, 0, 0], d: ROOM.x1 }, { n: [0, 0, 1], d: ROOM.z1 }];
    const fr = (clip) => prismSolid({ from: [sc[1], sc[0], sc[3], sc[2]], to: far, clip: [...roomC, ...clip] });
    applyBeamMask(root, [fr([{ n: [-1, 0, 0], d: -DESK.x0 }, { n: [1, 0, 0], d: DESK.x1 }, { n: [0, -a, -b], d: -a * DESK.top - b * DESK.z1 }]), fr([{ n: [1, 0, 0], d: DESK.x0 }]), fr([{ n: [-1, 0, 0], d: -DESK.x1 }])].filter((s) => s.faces.length >= 4), { label: 'screen glow (mask)', cam, surfaceOnly: !!shot.beamSurf }); }
  else if (shot.beamMask) applyBeamMask(root, [], { cam });
  return { set: 'basement90', scene, root, cam, rig, near: shot.near ?? 0.2, far: shot.far ?? 7, figs, book: null, panes, lights, header: shot.header || '', shadowLine: false, shadowPolys: null,
    subject: V(shot.subject || [0.45 + GROUP.dx, 1.1, -1.15 + GROUP.dz]), litBg: 0x010103, flatBg: shot.beamMask ? 0x000000 : undefined, extra: extraOut };
}
