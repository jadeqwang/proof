"""tools.ink.seal: cinnabar seals. Build one from text and a font, slam it into the paper, press it again fainter.

    s = seal('悟空', 'refs/fonts/chongxi-seal/崇羲篆体.otf', 220, style='zhu', wear=0.3, seed=2)     # RGBA
    strike(frame, s, t, t_hit, (1500, 760))                    # slam at t_hit, stays on the paper afterwards
    echoes(frame, s, t, [(t1, (900, 500)), (t2, (1010, 520)), (t3, (1120, 510))])   # re-pressed, never re-inked
    cam.shake(*shake_args(t_hit))  or  frame = shaken(frame, *shake_offset(t, t_hit))
    lg = Luogu(tm.hits(('gong', 'cymbal'), 52, 60), font, size=150, region=(200, 150, 1700, 900)); lg.draw(frame, t)
"""
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .core import (CINNABAR, F32, ROOT, bbox, blur, fbm, grain, over, rng, rough_mask, smoothstep, transform,
                   value_noise, hit_frame, on_frame)

_TRAD = {'仓': '倉', '扎': '紥', '匡': '匡'}
LUOGU = {'gong_strike': '仓', 'gong': '仓', 'cymbal': '才', 'small': '台', 'clapper': '扎', 'drum': '大', 'chop': '七'}


def _font(font, px):
    p = Path(font)
    if not p.is_absolute():
        p = ROOT / p
    return ImageFont.truetype(str(p), int(px))


def has_glyph(ch, font):
    """True if the font file really contains the character (PIL silently draws a blank or a box otherwise)."""
    from fontTools.ttLib import TTFont
    p = Path(font)
    p = p if p.is_absolute() else ROOT / p
    if p not in _CMAPS:
        _CMAPS[p] = set(TTFont(str(p), fontNumber=0, lazy=True).getBestCmap().keys())
    return ord(ch) in _CMAPS[p]


_CMAPS = {}


def glyph(ch, font, px):
    """One character as a tight-cropped mask (HxW 0..1) rendered at about px height. Empty array if the font lacks it."""
    f = _font(font, px)
    img = Image.new('L', (int(px * 2.2), int(px * 2.2)), 0)
    ImageDraw.Draw(img).text((px * 0.5, px * 0.4), ch, font=f, fill=255)
    a = np.asarray(img, F32) / 255.0
    if a.max() < 0.1 or not has_glyph(ch, font):
        return np.zeros((0, 0), F32)
    x0, y0, x1, y1 = bbox(a, 0.08)
    return np.ascontiguousarray(a[y0:y1, x0:x1])


def _cells(n, x0, y0, x1, y1, gap):
    """Cells (x0, y0, x1, y1) in reading order: columns right to left, top to bottom."""
    w, h = x1 - x0, y1 - y0
    if n == 1:
        return [(x0, y0, x1, y1)]
    if n == 2:
        hh = (h - gap) / 2
        return [(x0, y0, x1, y0 + hh), (x0, y0 + hh + gap, x1, y1)]
    cw, hh = (w - gap) / 2, (h - gap) / 2
    R, Lc = x0 + cw + gap, x0
    if n == 3:
        return [(R, y0, x1, y1), (Lc, y0, Lc + cw, y0 + hh), (Lc, y0 + hh + gap, Lc + cw, y1)]
    return [(R, y0, x1, y0 + hh), (R, y0 + hh + gap, x1, y1), (Lc, y0, Lc + cw, y0 + hh), (Lc, y0 + hh + gap, Lc + cw, y1)]


def seal_mask(text, font, size, style='zhu', shape='square', border=0.07, stretch=1.9, weight=0.0):
    """The carved face before inking: HxW mask, 1 where the stone touches the paper."""
    n = len(text)
    assert 1 <= n <= 4, 'seals take 1-4 characters'
    W = int(size)
    H = int(size * (0.62 * n + 0.2)) if (shape == 'tall' and n > 1) else int(size)
    b = max(2, int(size * border)) if style == 'zhu' else max(2, int(size * 0.05))
    inner = int(size * (0.055 if style == 'zhu' else 0.07))
    gap = size * 0.05
    g = np.zeros((H, W), F32)
    if shape == 'tall' and n > 1:
        ch = (H - 2 * (b + inner) - gap * (n - 1)) / n
        cells = [(b + inner, b + inner + i * (ch + gap), W - b - inner, b + inner + i * (ch + gap) + ch) for i in range(n)]
    else:
        cells = _cells(n, b + inner, b + inner, W - b - inner, H - b - inner, gap)
    for c, (cx0, cy0, cx1, cy1) in zip(text, cells):
        cw, ch = cx1 - cx0, cy1 - cy0
        a = glyph(c, font, int(max(cw, ch) * 1.1))
        if a.size == 0:
            continue
        gh, gw = a.shape
        sx, sy = cw / gw, ch / gh                    # seal carving fills its cell: stretch, within reason
        if sx > sy * stretch:
            sx = sy * stretch
        if sy > sx * stretch:
            sy = sx * stretch
        nw, nh = max(1, int(gw * sx)), max(1, int(gh * sy))
        a = cv2.resize(a, (nw, nh), interpolation=cv2.INTER_AREA if sx < 1 else cv2.INTER_CUBIC)
        ox, oy = int(cx0 + (cw - nw) / 2), int(cy0 + (ch - nh) / 2)
        g[oy:oy + nh, ox:ox + nw] = np.maximum(g[oy:oy + nh, ox:ox + nw], a)
    k = int(round(size * (weight + (0.006 if style == 'bai' else 0.004))))
    if k > 0:
        g = cv2.dilate(g, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * k + 1, 2 * k + 1)))
    if style == 'zhu':
        m = g.copy()
        m[:b] = m[-b:] = 1.0
        m[:, :b] = m[:, -b:] = 1.0
    else:
        m = 1.0 - g
    return np.clip(m, 0, 1)


def seal(text, font, size=200, style='zhu', wear=0.3, seed=0, shape='square', colour=CINNABAR, pad=None, weight=0.0,
         stretch=1.9):
    """A seal impression as straight-alpha RGBA (size + 2*pad square, or tall).

    text    1-4 characters, laid out in columns right to left
    font    font file path (seal script for name seals; a bold kai for 锣鼓经 syllables)
    style   'zhu' 朱文: red characters and a red border on bare paper; 'bai' 白文: red block, characters left bare
    wear    0..1: chipped edges, broken border, starved patches (0 = freshly cut and well inked)
    shape   'square' | 'tall' (one column)
    """
    size = int(size)
    pad = int(size * 0.12) if pad is None else int(pad)
    m = seal_mask(text, font, size, style, shape, weight=weight, stretch=stretch)
    m = cv2.copyMakeBorder(m, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    h, w = m.shape
    r = rng(seed, 'seal', text, style)
    # the knife: corners rounded off, edges nicked, the outline of the stone not quite square
    m = rough_mask(m, size * 0.010, size * 0.20, seed, 'stone')
    m = rough_mask(m, size * 0.0045, max(2.0, size * 0.022), seed, 'knife')
    chips = np.zeros((h, w), F32)
    for _ in range(int(4 + wear * 26)):
        if r.random() < 0.7:                          # most damage is on the rim
            side = r.integers(0, 4)
            u = r.uniform(pad, pad + size)
            x, y = [(u, pad), (u, h - pad), (pad, u), (w - pad, u)][side]
        else:
            x, y = r.uniform(pad, w - pad), r.uniform(pad, h - pad)
        rad = size * (0.006 + 0.03 * r.random() ** 2) * (0.5 + wear)
        cv2.ellipse(chips, ((float(x), float(y)), (float(rad * 2 * r.uniform(1, 3)), float(rad * 2)),
                            float(r.uniform(0, 180))), 1.0, -1, cv2.LINE_AA)
    chips = rough_mask(chips, size * 0.006, size * 0.02, seed, 'chips')
    m = np.clip(m - chips, 0, 1)
    soft = blur(m, max(0.7, size * 0.006))
    m = smoothstep(0.36, 0.62, soft + (fbm(h, w, max(2.0, size * 0.012), seed, 'edge', octaves=2) - 0.5) * 0.16)
    # the paste: oily, thick, squeezed toward the edges of each stroke, starved where the stone met the pad badly
    low = fbm(h, w, size * 0.55, seed, 'low', octaves=3)
    st = fbm(h, w, size * 0.16, seed, 'starve', octaves=4)
    ang = r.uniform(0, 2 * math.pi)
    yy, xx = np.mgrid[0:h, 0:w].astype(F32)
    tilt = ((xx - w / 2) * math.cos(ang) + (yy - h / 2) * math.sin(ang)) / size          # -0.5..0.5
    press = 0.5 + 0.5 * np.clip(0.9 + 0.5 * (low - 0.5) - tilt * (0.25 + 0.9 * wear), 0, 1)
    thr = 0.78 - 0.34 * wear
    starved = smoothstep(thr, thr + 0.16, st + (1 - press) * 0.5)
    g = grain(h, w, seed, 'pin', sigma=0.75)
    g2 = grain(h, w, seed, 'pin2', sigma=1.8)
    pin = smoothstep(1.55, 2.6, g + 0.7 * g2 + wear * 0.7 + starved * 1.9 + (1 - press) * 1.2)
    inner = blur(m, max(1.2, size * 0.014))
    rim = np.clip(m - inner, 0, 1) * 2.2
    a = m * (0.90 + 0.10 * press) * (1 - 0.55 * starved) * (1 - 0.9 * pin)
    a = np.clip(a + rim * 0.25 * m, 0, 0.985)
    thick = np.clip(0.55 * press + 0.8 * rim - 0.6 * starved + 0.25 * (low - 0.5), 0, 1)
    col = np.asarray(colour, F32)
    thin_c = np.clip(col * np.array([1.10, 1.75, 1.55], F32), 0, 1)        # thin paste: more orange, paper shows
    deep_c = col * np.array([0.84, 0.72, 0.74], F32)                       # thick paste: deeper red
    rgb = thin_c[None, None] + (deep_c - thin_c)[None, None] * thick[..., None]
    rgb = rgb * (1 + 0.05 * g2[..., None] * 0.5)
    # a faint oil stain creeps out of the paste into the paper
    halo = blur(m, size * 0.03) * 0.07
    oil = np.array([0.80, 0.56, 0.36], F32)
    A = a + halo * (1 - a)
    out = (rgb * a[..., None] + oil[None, None] * (halo * (1 - a))[..., None]) / np.maximum(A, 1e-4)[..., None]
    return np.dstack([np.clip(out, 0, 1), np.clip(A, 0, 1)]).astype(F32)


_FADE = {}


def fade(seal_rgba, ink, seed=0):
    """The same seal pressed again with only `ink` (0..1) of its paste left: fainter and patchier. The starved areas
    are the same ones every time and only grow (one noise field, a rising threshold)."""
    if ink >= 0.999:
        return seal_rgba
    key = (seal_rgba.ctypes.data, seal_rgba.shape, round(float(ink), 3), seed)
    if key in _FADE:
        return _FADE[key]
    h, w = seal_rgba.shape[:2]
    a = seal_rgba[..., 3]
    n = 0.65 * fbm(h, w, w * 0.22, seed, 'echo', octaves=4) + 0.35 * blur(a, w * 0.05)
    n = (n - n.min()) / max(float(n.max() - n.min()), 1e-6)
    g = grain(h, w, seed, 'echo_g', sigma=0.8)
    lack = 1.0 - ink
    keep = smoothstep(lack * 0.95 - 0.30, lack * 0.95 + 0.14, n + 0.07 * g)
    pin = smoothstep(1.6 - 2.4 * lack, 2.6 - 2.4 * lack, g + 0.4)
    out = seal_rgba.copy()
    out[..., 3] = a * keep * (1 - 0.85 * pin) * (0.55 + 0.45 * ink)
    # what is left is the thin end of the paste: lighter, more orange
    out[..., :3] = np.clip(out[..., :3] * (1 + lack * np.array([0.10, 0.55, 0.45], F32)), 0, 1)
    if len(_FADE) > 64:
        _FADE.clear()
    _FADE[key] = out
    return out


def strike(frame, seal_rgba, t, t_hit, pos, scale=1.0, angle=0.0, overshoot=0.14, dent=1.0, ink=1.0, seed=0,
           lead=0, opacity=1.0):
    """Slam a seal into the paper at t_hit, centred on pos (frame px). In place; returns frame.

    Before the hit (lead frames) the stone's shadow gathers on the paper. On the hit frame the impression lands
    oversize (overshoot), recoils on the next frame and is at rest on the third; the paper around it is pressed
    into a dent whose shadow settles over ~0.4 s to a trace. Afterwards the impression simply stays.
    ink < 1 presses a depleted seal (see fade / echoes)."""
    # frame arithmetic (fix round 2): k = 0 on the frame that CONTAINS t_hit, full impression there; no stone shadow
    # before it unless lead > 0 is asked for (a hit arrives from nothing)
    k = hit_frame(t) - hit_frame(t_hit)
    dt = t - on_frame(t_hit)
    if k < -lead:
        return frame
    sh, sw = seal_rgba.shape[:2]
    if k < 0:                                         # the stone coming down: a soft shadow tightening
        u = (k + lead + 1) / (lead + 1.0)             # 0..1
        S = int(max(sh, sw) * scale * 1.9)
        blk = np.zeros((S, S), F32)
        c, hw, hh = S // 2, int(sw * scale * 0.42), int(sh * scale * 0.42)
        blk[c - hh:c + hh, c - hw:c + hw] = 1.0
        blk = blur(blk, max(sh, sw) * scale * (0.22 - 0.14 * u))
        off = int((1 - u) * sw * 0.10)
        _darken(frame, blk * (0.10 + 0.22 * u) * dent, int(pos[0] - S / 2 + off), int(pos[1] - S / 2 + off))
        return frame
    s = scale * (1 + overshoot * (1.0, -0.30, 0.08)[k]) if k < 3 else scale
    src = fade(seal_rgba, ink, seed)
    S = int(math.ceil(max(sh, sw) * s * (1.45 if angle else 1.05))) + 4
    if abs(s - 1) < 1e-6 and not angle:
        img = src
    else:
        img = transform(src, s, angle, (S - sw) / 2.0, (S - sh) / 2.0, out_size=(S, S))
    x, y = int(round(pos[0] - img.shape[1] / 2.0)), int(round(pos[1] - img.shape[0] / 2.0))
    if dent > 0:                                      # the pressed paper: a shadow hugging the block, fading
        amt = dent * (0.30 * math.exp(-dt / 0.13) + 0.035)
        a = img[..., 3]
        bx0, by0, bx1, by1 = bbox(a, 0.15)
        pd = int(sw * s * 0.18)
        blk = np.zeros((a.shape[0] + 2 * pd, a.shape[1] + 2 * pd), F32)
        blk[by0 + pd:by1 + pd, bx0 + pd:bx1 + pd] = 1.0
        o = int(1 + sw * s * 0.012)
        d = blur(blk, sw * s * 0.05)
        d = np.roll(d, (o, o), (0, 1)) * (1 - 0.8 * blur(blk, 2.0))              # outside the block, deeper lower right
        _darken(frame, d * amt, x - pd, y - pd)
    if k == 0:
        img = img.copy()
        img[..., 3] = np.clip(img[..., 3] * 1.06, 0, 1)
    return over(frame, img, x, y, opacity)


def _darken(frame, amt, x, y):
    H, W = frame.shape[:2]
    h, w = amt.shape
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 > x0 and y1 > y0:
        a = amt[y0 - y:y1 - y, x0 - x:x1 - x, None]
        frame[y0:y1, x0:x1] *= 1 - a * np.array([0.85, 0.95, 1.1], F32)       # warm shadow, never grey-blue


def echoes(frame, seal_rgba, t, hits, decay=0.6, seed=0, first=1.0, jitter=2.5, overshoot=0.10, dent=0.7):
    """The same seal pressed again and again without re-inking. hits = [(t_hit, (x, y)), ...] in time order; the k-th
    impression carries first * decay**k of the paste, with the same starved patches growing each time, and a few
    degrees of hand wobble (`jitter`). In place; returns frame."""
    r = rng(seed, 'echoes')
    angs = r.normal(0, jitter, len(hits))
    for k, (th, pos) in enumerate(hits):
        if t < th - 3 / 24:
            break
        ink = first * decay ** k
        strike(frame, seal_rgba, t, th, pos, angle=float(angs[k]) if k else 0.0, overshoot=overshoot * (0.6 + 0.4 * ink),
               dent=dent * (0.5 + 0.5 * ink), ink=ink, seed=seed)
    return frame


# -- camera shake hooks ------------------------------------------------------------------------------------------------

def shake_args(t_hit, amp=7.0, dur=0.22, seed=0):
    """Arguments for Camera.shake: cam.shake(*shake_args(t_hit))."""
    return t_hit, amp, dur, seed


def shake_offset(t, t_hit, amp=7.0, dur=0.22, seed=0, freq=17.0):
    """(dx, dy) px of a decaying shake for shots without a Camera (same curve as Camera.shake). t_hit may be a list."""
    dx = dy = 0.0
    for i, th in enumerate(t_hit if isinstance(t_hit, (list, tuple)) else [t_hit]):
        d = t - on_frame(th) + 1e-9
        if 0 <= d < dur:
            k = amp * (1 - d / dur) ** 2
            dx += k * math.sin(d * freq * 2 * math.pi + (seed + i) * 1.7)
            dy += k * math.cos(d * freq * 2 * math.pi * 1.31 + (seed + i) * 0.9)
    return dx, dy


def shaken(frame, dx, dy):
    """Shift a whole frame by (dx, dy) px, sub-pixel, the paper continuing past the edge."""
    if abs(dx) < 0.01 and abs(dy) < 0.01:
        return frame
    M = np.array([[1, 0, dx], [0, 1, dy]], np.float64)
    return cv2.warpAffine(frame, M, (frame.shape[1], frame.shape[0]), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REFLECT)


# -- 锣鼓经 ---------------------------------------------------------------------------------------------------------------

class Luogu:
    """锣鼓经 syllables stamped as seals on percussion hits.

    hits     Timing.hits(...) dicts, or (t, char) / (t, kind) tuples
    font     font file for the syllables (a bold kai reads best; must contain the characters)
    region   (x0, y0, x1, y1) frame px the stamps are laid out in: rows right to left, top to bottom, hand-jittered;
             or positions=[(x, y), ...] to place them yourself
    chars    kind -> character map (default LUOGU: gong 仓, cymbal 才, small gong 台, clapper 扎, drum 大, chop 七)
    life     None: impressions stay; seconds: each one is lifted back off the paper after that long
    """

    def __init__(self, hits, font, size=150, region=(160, 120, 1760, 960), positions=None, chars=None, style='bai',
                 wear=0.35, seed=0, life=None, scale_by_strength=True):
        chars = chars or LUOGU
        self.items, self.seals, self.life, self.seed = [], {}, life, seed
        r = rng(seed, 'luogu')
        x0, y0, x1, y1 = region
        step = size * 1.25
        cols = max(1, int((x1 - x0) / step))
        for i, h in enumerate(hits):
            if isinstance(h, dict):
                th, kind, strength = h['t'], h.get('kind', ''), h.get('strength', 1.0)
            else:
                th, kind, strength = h[0], h[1], 1.0
            ch = kind if (len(kind) == 1 and ord(kind) > 0x2e80) else next((c for k, c in chars.items() if k in kind), None)
            if ch is None:
                continue
            if not has_glyph(ch, font) and ch in _TRAD:
                ch = _TRAD[ch]                         # traditional-only fonts: 仓 -> 倉
            if ch not in self.seals:
                if not has_glyph(ch, font):
                    raise ValueError(f'font {font} has no glyph for {ch!r}')
                self.seals[ch] = seal(ch, font, size, style, wear, seed=seed + len(self.seals), weight=0.004)
            if positions:
                pos = positions[i % len(positions)]
            else:
                n = len(self.items)
                row, col = divmod(n, cols)
                pos = (x1 - step * (col + 0.5) + r.normal(0, size * 0.06),
                       y0 + step * (row + 0.5) + r.normal(0, size * 0.06))
            sc = (0.72 + 0.28 * strength) if scale_by_strength else 1.0
            self.items.append((th, ch, pos, sc, float(r.normal(0, 3.0))))

    def draw(self, frame, t):
        for th, ch, pos, sc, ang in self.items:
            if t < th - 3 / 24:
                continue
            op = 1.0
            if self.life is not None:
                if t > th + self.life:
                    continue
                op = float(smoothstep(th + self.life, th + self.life - 0.12, t))
            strike(frame, self.seals[ch], t, th, pos, scale=sc, angle=ang, seed=self.seed, opacity=op,
                   dent=1.0 if op >= 1 else 0.0)
        return frame

    def hit_times(self):
        return [i[0] for i in self.items]
