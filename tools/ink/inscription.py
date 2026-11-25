"""tools.ink.inscription: the STATIC Chinese inscription (题跋) beside a painting. One helper for every team (REVISION_V3 §4).
  from tools.ink.inscription import inscription
  INS = inscription(ctx, 'B5', box=(1500, 110, 300, 620), paper=P)   # setup(): key = first column of design/text/lyrics_zh_v3.txt
  INS.draw(frame)                                                    # render(): present from frame 0, never animated
- box = (x, y, w, h) of the BLANK in authoring px (1920x1080 space; scaled by ctx.s). Columns run top to bottom, right to
  left, starting at the box's top-right corner; one small red seal (悟空, 朱文) under the foot of the last column.
- Size is the same in every shot: characters 60 px at 1080p (30 px at 540p). Do not pass px= unless the text sits on a page
  canvas bigger than the frame: then inscription((W, H), key, box, px=60 / zoom_at_rest) and lay INS.T / INS.seal yourself.
- Font: Ma Shan Zheng 马善政毛笔楷书 (OFL, refs/fonts/mashanzheng). Ink with dry-brush 飞白, loaded at the head of a column.
- text= overrides the file ('一通百通'; columns split on '/' or '\\n'). ground='dark' lays pale gouache (night/stone grounds).
- INS.T (HxWx3 transmittance), INS.seal (RGBA) + INS.seal_pos, INS.bbox (x0, y0, x1, y1 of text + seal), INS.px, INS.columns.
- Proof: python -m tools.ink.inscription  ->  work/review/comp_v3/_inscription_proof.jpg
"""
import math
import os
import re

import cv2
import numpy as np
from PIL import Image, ImageDraw

from .core import F32, ROOT, blur, fbm, ink_T, lay_ink, over, rng, smoothstep
from .cliff import load_font

FONT = 'refs/fonts/mashanzheng/MaShanZheng-Regular.ttf'
SEAL_FONT = 'refs/fonts/chongxi-seal/崇羲篆体.otf'
TEXT_FILE = os.environ.get('LYRICS_ZH', 'design/text/lyrics_zh_v3.txt')   # v7 build: LYRICS_ZH=design/text/lyrics_zh_v7.txt (B4 line changed)
PX = 60.0                       # character size at 1080p: the same in every shot
COL_PITCH = 1.34                # column pitch / px
ROW_PITCH = 1.06                # character pitch / px
SEAL_TEXT = '悟空'
PALE = np.array([0.93, 0.89, 0.78], F32)


def table(path=TEXT_FILE):
    """{key: {'shots', 'en', 'columns': [..]}} from the proofed text file."""
    out = {}
    for line in open(ROOT / path, encoding='utf-8'):
        if line.startswith('#') or '|' not in line:
            continue
        p = [s.strip() for s in line.split('|')]
        if len(p) >= 4:
            out[p[0]] = dict(shots=p[1], en=p[2], columns=[c.strip() for c in p[3].split('/') if c.strip()])
    return out


def columns_of(key=None, text=None):
    if text is not None:
        return [c.strip() for c in re.split(r'[/\n]', text) if c.strip()]
    tb = table()
    if key not in tb:
        raise KeyError(f'inscription key {key!r} not in {TEXT_FILE}: {sorted(tb)}')
    return tb[key]['columns']


def _glyph(ch, font, px):
    f = load_font(font, px)
    l, t, r, b = f.getbbox(ch, anchor='ls')
    w, h = int(math.ceil(r - l)) + 6, int(math.ceil(b - t)) + 6
    im = Image.new('L', (max(w, 1), max(h, 1)), 0)
    ImageDraw.Draw(im).text((3 - l, 3 - t), ch, font=f, fill=255, anchor='ls')
    return np.asarray(im, F32) / 255.0


class Inscribed:
    def __init__(self, size, cols, box, px, paper=None, seal=SEAL_TEXT, seed=0, font=FONT, ground='paper',
                 density=0.95, dry=0.5, seal_px=None, colour=None):
        W, H = int(size[0]), int(size[1])
        self.W, self.H, self.px, self.columns, self.ground = W, H, float(px), cols, ground
        x, y, w, h = box
        r = rng(seed, 'inscription', ''.join(cols))
        px = float(px)
        spx = int(round(seal_px or px * 0.86))
        # fit: shrink only if the blank is too small (and say so)
        need_h = max(len(c) for c in cols) * ROW_PITCH * px + (spx * 1.25 if seal else 0)
        need_w = (len(cols) - 1) * COL_PITCH * px + px
        k = min(1.0, h / need_h, w / need_w)
        if k < 0.999:
            print(f'inscription: box {box} too small for {cols} at {px:.0f} px; shrunk x{k:.2f}')
            px *= k
            spx = int(round(spx * k))
            self.px = px
        D = np.zeros((H, W), F32)
        x0b, y0b, x1b, y1b = W, H, 0, 0
        foot = (x + w - px / 2, y)
        for ci, col in enumerate(cols):
            cx = x + w - px / 2 - ci * COL_PITCH * px
            for ri, ch in enumerate(col):
                s = px * (1.0 + r.normal(0, 0.02))
                g = _glyph(ch, font, int(round(s)))
                ang = r.normal(0, 0.9)
                if abs(ang) > 0.2:
                    gh, gw = g.shape
                    M = cv2.getRotationMatrix2D((gw / 2, gh / 2), ang, 1.0)
                    g = cv2.warpAffine(g, M, (gw, gh), flags=cv2.INTER_LINEAR)
                gh, gw = g.shape
                cy = y + (ri + 0.5) * ROW_PITCH * px
                gx = int(round(cx - gw / 2 + r.normal(0, 0.018) * px))
                gy = int(round(cy - gh / 2 + r.normal(0, 0.012) * px))
                # ink load: full at the head of each column, a little starved by its foot
                load = 1.0 - 0.16 * ri / max(1, len(col) - 1) + r.normal(0, 0.03)
                a0, b0, a1, b1 = max(gx, 0), max(gy, 0), min(gx + gw, W), min(gy + gh, H)
                if a1 <= a0 or b1 <= b0:
                    continue
                D[b0:b1, a0:a1] = np.maximum(D[b0:b1, a0:a1], g[b0 - gy:b1 - gy, a0 - gx:a1 - gx] * load)
                x0b, y0b, x1b, y1b = min(x0b, a0), min(y0b, b0), max(x1b, a1), max(y1b, b1)
            foot = (cx, y + len(col) * ROW_PITCH * px)
        pad = int(px * 0.3) + 4
        X0, Y0, X1, Y1 = max(0, x0b - pad), max(0, y0b - pad), min(W, x1b + pad), min(H, y1b + pad)
        M = D[Y0:Y1, X0:X1]
        bh, bw = M.shape
        # brush: wet rim, soft bleed, and 飞白 (bristle streaks + the paper's high fibres starve the stroke's body)
        if paper is not None and getattr(paper, 'height', None) is not None and paper.height.shape[0] >= Y1 \
                and paper.height.shape[1] >= X1:
            ph = paper.height[Y0:Y1, X0:X1]
        else:
            ph = fbm(bh, bw, max(2.0, px * 0.05), seed, 'ins_ph', octaves=3)
        core = blur(M, max(0.6, px * 0.035))                       # ~1 inside thick strokes, lower on thin ones and rims
        st = fbm(bh, bw * 4, max(2.0, px * 0.05), seed, 'ins_st', octaves=2)       # streaks, stretched then sheared
        st = cv2.resize(st, (bw, bh), interpolation=cv2.INTER_AREA)
        sh = np.float32([[1, -0.55, 0.55 * bh / 2], [0, 1, 0]])
        st = cv2.warpAffine(st, sh, (bw, bh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        patch = smoothstep(0.36, 0.62, fbm(bh, bw, px * 0.8, seed, 'ins_dry', octaves=2))     # where the brush ran dry
        starve = dry * patch * smoothstep(0.45, 0.75, 0.6 * st + 0.4 * ph) * smoothstep(0.55, 0.95, core)
        body = np.clip(M * (1.0 - 0.75 * starve), 0, 1)
        rim = np.clip(M - blur(M, max(0.8, px * 0.03)), 0, 1)
        d = density * (body * (0.9 + 0.1 * fbm(bh, bw, px * 0.6, seed, 'ins_ld', octaves=2)) + 0.25 * rim)
        d = np.maximum(d, 0.35 * density * blur(M, max(0.5, px * 0.012)))          # a breath of bleed into the fibres
        self.D = d.astype(F32)
        self.box = (X0, Y0, bw, bh)
        self.colour = colour
        self.seal, self.seal_pos = None, None
        bb = [X0, Y0, X1, Y1]
        if seal:
            if isinstance(seal, str):
                from .seal import seal as _seal
                sr = _seal(seal, SEAL_FONT, size=spx, style='zhu', wear=0.28, seed=seed + 3)
            else:
                sr = np.asarray(seal, F32)
            shh, sww = sr.shape[:2]
            sx, sy = int(round(foot[0] - sww / 2 + r.normal(0, 1))), int(round(foot[1] + px * 0.12))
            self.seal, self.seal_pos = sr, (sx, sy)
            bb = [min(bb[0], sx), min(bb[1], sy), max(bb[2], sx + sww), max(bb[3], sy + shh)]
        self.bbox = tuple(bb)

    @property
    def T(self):
        """Full-canvas transmittance (paper ground). Lay with frame *= INS.T."""
        out = np.ones((self.H, self.W, 3), F32)
        x0, y0, bw, bh = self.box
        out[y0:y0 + bh, x0:x0 + bw] = ink_T(self.D, tint=self.colour)
        return out

    def draw(self, frame, opacity=1.0, dx=0, dy=0):
        """Lay ink and seal onto a frame in place. Static: no time argument."""
        x0, y0, bw, bh = self.box
        if self.ground == 'dark':
            a = np.clip(self.D, 0, 1) * 0.92
            col = PALE if self.colour is None else np.asarray(self.colour, F32)
            over(frame, np.dstack([np.broadcast_to(col, a.shape + (3,)), a]).astype(F32), x0 + dx, y0 + dy, opacity)
        else:
            lay_ink(frame, ink_T(self.D, tint=self.colour), x0 + dx, y0 + dy, opacity)
        if self.seal is not None:
            over(frame, self.seal, self.seal_pos[0] + dx, self.seal_pos[1] + dy, opacity)
        return frame


def inscription(ctx, key=None, box=(1500, 110, 300, 700), paper=None, text=None, px=None, seal=SEAL_TEXT, seed=0,
                **kw):
    """Build the static inscription for `key` (or `text=`) in the blank `box`. `ctx` = the shot ctx (box in 1920x1080
    authoring px, scaled by ctx.s) or a (W, H) canvas size (box and px in canvas px). Returns an `Inscribed`."""
    cols = columns_of(key, text)
    if hasattr(ctx, 'W'):
        s = getattr(ctx, 's', ctx.W / 1920.0)
        size = (ctx.W, ctx.H)
        box = tuple(v * s for v in box)
        px = (px or PX) * s
    else:
        size = ctx
        px = px or PX * size[0] / 1920.0
    return Inscribed(size, cols, box, px, paper=paper, seal=seal, seed=seed, **kw)


def _proof(out='work/review/comp_v3/_inscription_proof.jpg'):
    """Every line of the text file at production size on the book paper, at 1080p, plus a 540p strip."""
    from .paper import Paper
    from .core import save_image
    tb = table()
    keys = list(tb)
    per = 8
    rows = int(math.ceil(len(keys) / per))
    W, H = 1920, 1080
    sheets = []
    for rr in range(rows):
        P = Paper(W, H, 'new' if rr % 2 == 0 else 'aged', seed=1988 + rr)
        f = P.frame(0)
        for i, k in enumerate(keys[rr * per:(rr + 1) * per]):
            x = W - 60 - i * 232 - 200
            ins = inscription((W, H), k, (x, 70, 200, 900), paper=P, seed=i + rr * per)
            ins.draw(f)
            lab = load_font('refs/fonts/eb-garamond/EBGaramond[wght].ttf', 26)
            im = Image.fromarray((np.clip(f, 0, 1) * 255).astype(np.uint8))
            ImageDraw.Draw(im).text((x + 100, 1030), k, font=lab, fill=(90, 80, 70), anchor='mm')
            f = np.asarray(im, F32) / 255.0
        sheets.append(f)
    full = np.vstack(sheets)
    small = cv2.resize(sheets[0], (960, 540), interpolation=cv2.INTER_AREA)       # what 540p shows
    crop = sheets[0][60:600, 960:1920]                                            # 1:1 crop of the 1080p sheet
    strip = np.hstack([small, crop])
    (ROOT / out).parent.mkdir(parents=True, exist_ok=True)
    save_image(ROOT / out, np.vstack([full, strip]))
    print('wrote', out, [(k, tb[k]['columns']) for k in keys][:3], '...')


if __name__ == '__main__':
    _proof()
