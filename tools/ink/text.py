"""tools.ink.text: words on the sheet. Lyrics set the way a poem is inscribed on a painting (题画诗), written on in
time with the singing, with one small red seal; and plain lower-third subtitles.

    ins = Inscription('一窍通时\n百窍通', 'refs/fonts/lxgw-wenkai/霞鹜文楷-Regular.ttf', region=(1380, 120, 360, 620),
                      size=(1920, 1080), vertical=True, paper=paper, words=ctx.timing.words('一窍通时百窍通'),
                      seal='悟', seal_font='refs/fonts/chongxi-seal/崇羲篆体.otf')
    frame = ins.draw(frame, t)                         # ink on paper; ground='night' lays pale gouache instead
    frame = subtitle(frame, 'He bowed four ways', 'refs/fonts/eb-garamond/EBGaramond[wght].ttf')

The text is real ink on the sheet: glyph masks go through ink.wash (bleed, wet edge, granulation into the paper's
fibres) and are laid with multiply. Timing is closed-form, so frames render in any order.
"""
import math
import re
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw

from .core import CINNABAR, F32, blur, fbm, grain, ink_T, lay_ink, luma, over, rng, smoothstep
from .cliff import has_glyph, load_font
from .ink import wash

PUNCT = '，。、；：？！,.;:?!"“”‘’()（）…—'
MIN_PX = 22                                              # nothing smaller than this at 1080p (house rule)
NIGHT_INK = np.array([0.93, 0.88, 0.76], F32)            # pale warm gouache for night grounds


def _cjk(ch):
    return ord(ch) >= 0x2E80


def strip_punct(s):
    return ''.join(c for c in s if c not in PUNCT)


def tokenize(line):
    """Split a line into written units: each CJK character is one, each Latin word is one."""
    out = []
    for part in re.findall(r'[⺀-\U0002ffff]|[^\s⺀-\U0002ffff]+', line):
        out.append(part)
    return out


def _text_mask(s, font, px):
    """A run of text as a tight float mask (h x w) plus its advance width."""
    f = load_font(font, px)
    l, t, r, b = f.getbbox(s, anchor='ls')
    w, h = int(math.ceil(r - l)) + 4, int(math.ceil(b - t)) + 4
    im = Image.new('L', (max(w, 1), max(h, 1)), 0)
    ImageDraw.Draw(im).text((2 - l, 2 - t), s, font=f, fill=255, anchor='ls')
    return np.asarray(im, F32) / 255.0, f.getlength(s), -t + 2            # mask, advance, baseline row


class Inscription:
    """Text inscribed in a blank region of the picture.

    text        the words; '\\n' separates lines (vertical: columns, read right to left; horizontal: lines)
    font        font path (CJK or Latin); latin_font: optional second font for Latin runs inside CJK text
    region      (x, y, w, h) blank area in frame px; the text is fitted inside it
    size        (W, H) of the frame
    vertical    True: columns right to left, CJK upright, Latin lines turned 90 degrees clockwise (reading downward)
    px          type size; None fits the largest size (<= max_px) that fills the region
    align       'start' | 'center' | 'end' along the writing direction (vertical: top/centre/bottom)
    words       [(word, start, end)] from Timing.words(line) (several lines: concatenate); matched to the written
                units in order. If absent or the count differs, units are spread evenly over start..end
    start, end  song times of the first and last unit when no word timings are given
    mode        'stroke' (each unit is written across its own duration, along the way a hand would move) or
                'word' (each unit blooms on whole at its start)
    ground      'paper' (dark ink, multiplied) or 'night' (pale gouache, laid over)
    seal        None, a string (a tiny cinnabar seal with that text is made), or a ready RGBA; seal_font for it;
                it is pressed seal_delay seconds after the last unit ends
    paper       the Paper under the text (for granulation); density, bleed: the ink
    """

    def __init__(self, text, font, region, size=(1920, 1080), vertical=True, px=None, max_px=120, line_gap=0.45,
                 char_gap=0.08, align='start', words=None, start=0.0, end=None, mode='stroke', ground='paper',
                 seal=None, seal_font=None, seal_px=None, seal_delay=0.35, seal_style='zhu', paper=None, seed=0,
                 density=0.92, bleed=None, latin_font=None, colour=None, keep_punct=False):
        self.W, self.H = size
        self.vertical, self.ground, self.mode, self.seed = vertical, ground, mode, seed
        self.colour = np.asarray(colour, F32) if colour is not None else (NIGHT_INK if ground == 'night' else None)
        if not keep_punct:
            text = strip_punct(text)
        self.lines = [tokenize(l) for l in text.split('\n') if l.strip()]
        self.font, self.latin_font = font, latin_font or font
        self.missing = sorted({ch for l in self.lines for u in l for ch in u
                               if not has_glyph(self._font_for(ch), ch)})
        self.lines = [[''.join(c for c in u if c not in self.missing) for u in l] for l in self.lines]
        self.lines = [[u for u in l if u] for l in self.lines]
        x, y, w, h = region
        self.region = region
        if px is None:
            lo, hi = MIN_PX, max_px
            for _ in range(12):
                mid = (lo + hi) / 2.0
                ext = self._extent(mid, line_gap, char_gap)
                if ext[0] <= w and ext[1] <= h:
                    lo = mid
                else:
                    hi = mid
            px = lo
        self.px = max(MIN_PX, float(px))
        units = self._place(self.px, line_gap, char_gap, align)          # [(mask, x, y, line, kind)]
        self.units = units
        n = len(units)
        # timings
        if words and len(words) == n:
            tim = [(float(a), float(b)) for _, a, b in words]
        else:
            if words:
                start, end = float(words[0][1]), float(words[-1][2])
            end = end if end is not None else start + 0.45 * n
            step = (end - start) / max(n, 1)
            tim = [(start + i * step, start + (i + 0.85) * step) for i in range(n)]
        self.times = tim
        self.t_end = tim[-1][1] if tim else start
        # density and arrival-time maps over the bounding box of the text
        pad = int(self.px * 0.3) + 4
        x0 = max(0, int(min(u[1] for u in units)) - pad) if units else 0
        y0 = max(0, int(min(u[2] for u in units)) - pad) if units else 0
        x1 = min(self.W, int(max(u[1] + u[0].shape[1] for u in units)) + pad) if units else 1
        y1 = min(self.H, int(max(u[2] + u[0].shape[0] for u in units)) + pad) if units else 1
        bw, bh = max(1, x1 - x0), max(1, y1 - y0)
        self.box = (x0, y0, bw, bh)
        M = np.zeros((bh, bw), F32)
        A = np.full((bh, bw), 1e9, F32)
        Dur = np.full((bh, bw), 0.2, F32)
        r = rng(seed, 'ins')
        for i, (m, ux, uy, li, kind) in enumerate(units):
            uh, uw = m.shape
            a0, b0 = int(ux) - x0, int(uy) - y0
            a1, b1 = min(bw, a0 + uw), min(bh, b0 + uh)
            if a1 <= max(a0, 0) or b1 <= max(b0, 0) or a0 < 0 or b0 < 0:
                continue
            mm = m[:b1 - b0, :a1 - a0]
            ts, te = tim[i]
            yy, xx = np.mgrid[0:b1 - b0, 0:a1 - a0].astype(F32)
            if kind == 'cjk':                            # top-left to bottom-right, as the strokes of a character go
                ordr = 0.62 * yy / max(uh, 1) + 0.38 * xx / max(uw, 1)
            elif kind == 'latin_v':                      # a turned Latin word is written downward
                ordr = yy / max(uh, 1)
            else:
                ordr = xx / max(uw, 1)
            ordr = np.clip(ordr + (fbm(b1 - b0, a1 - a0, max(3.0, self.px * 0.25), seed, 'o', i, octaves=2) - 0.5)
                           * 0.25, 0, 1)
            arr = ts + (ordr * (te - ts) * 0.9 if mode == 'stroke' else 0.0)
            sel = mm > M[b0:b1, a0:a1]
            A[b0:b1, a0:a1] = np.where((mm > 0.02) & (sel | (A[b0:b1, a0:a1] > 1e8)), arr, A[b0:b1, a0:a1])
            M[b0:b1, a0:a1] = np.maximum(M[b0:b1, a0:a1], mm)
        # spread arrival a little outward so the bleed fringe arrives with its stroke
        known = (A < 1e8).astype(np.uint8)
        if known.any():
            _, lab = cv2.distanceTransformWithLabels(1 - known, cv2.DIST_L2, 3, labelType=cv2.DIST_LABEL_PIXEL)
            ys, xs = np.nonzero(known)
            lut = np.zeros(lab.max() + 1, F32)
            lut[lab[ys, xs]] = A[ys, xs]
            A = lut[lab]
        ph = None
        if paper is not None:
            ph = np.full((bh, bw), 0.5, F32)
            src = paper.height[y0:y0 + bh, x0:x0 + bw]
            ph[:src.shape[0], :src.shape[1]] = src
        bleed = bleed if bleed is not None else max(0.6, self.px * 0.022)
        if ground == 'night':
            D = wash(M, ph, seed, 1.0, bleed * 0.6, edge=0.0, granulate=0.25, pool=0.12, feather=0.0)
            D = np.clip(D * 1.1, 0, 1)
        else:
            # brush-written: loaded at the start of each unit, a little drier by its end
            D = wash(M, ph, seed, density, bleed, edge=0.22, granulate=0.3, pool=0.18, feather=0.35)
            D = np.maximum(D, M * density * 0.8)                      # keep the letterforms whole and legible
            D *= 1.0 + 0.10 * (fbm(bh, bw, self.px * 0.9, seed, 'load', octaves=2) - 0.5) * 2
        self.D, self.A = D.astype(F32), A.astype(F32)
        # seal
        self.seal, self.seal_pos, self.t_seal = None, None, self.t_end + seal_delay
        if seal is not None:
            spx = int(seal_px or max(30, self.px * 0.8))
            if isinstance(seal, str):
                self.seal = make_small_seal(seal, seal_font or font, spx, seal_style, seed)
            else:
                self.seal = seal
            sh, sw = self.seal.shape[:2]
            lm, lx, ly, _, _ = units[-1]
            if vertical:                                 # under the foot of the last column
                sx, sy = lx + lm.shape[1] / 2 - sw / 2, ly + lm.shape[0] + self.px * 0.35
                if sy + sh > y + h + sh * 0.5:           # no room below: beside the foot, on the left
                    sx, sy = lx - sw - self.px * 0.3, ly + lm.shape[0] - sh
            else:                                        # after the end of the last line
                sx, sy = lx + lm.shape[1] + self.px * 0.4, ly + lm.shape[0] - sh
                if sx + sw > x + w + sw * 0.5:
                    sx, sy = lx + lm.shape[1] - sw, ly + lm.shape[0] + self.px * 0.3
            self.seal_pos = (int(sx + r.normal(0, 1)), int(sy))

    # -- layout --------------------------------------------------------------------------------------------------------
    def _font_for(self, ch):
        return self.font if _cjk(ch) else self.latin_font

    def _line_runs(self, line):
        """Vertical CJK: one unit per character. Latin: one unit per word."""
        return line

    def _unit_adv(self, u, px):
        if _cjk(u[0]):
            return px * len(u)
        return load_font(self.latin_font, px).getlength(u)

    def _is_latin_line(self, line):
        return all(not _cjk(u[0]) for u in line)

    def _extent(self, px, line_gap, char_gap):
        """(w, h) the block needs at this size."""
        lens = []
        space = px * 0.28
        for line in self.lines:
            if self.vertical and not self._is_latin_line(line):
                L = sum(px * (1 + char_gap) if _cjk(u[0]) else self._unit_adv(u, px) + space for u in line)
            else:
                L = sum(self._unit_adv(u, px) + (px * char_gap if _cjk(u[0]) else space) for u in line)
            lens.append(L)
        thick = len(self.lines) * px + (len(self.lines) - 1) * px * line_gap
        return (thick, max(lens)) if self.vertical else (max(lens), thick)

    def _place(self, px, line_gap, char_gap, align):
        x, y, w, h = self.region
        units = []
        space = px * 0.28
        pitch = px * (1 + line_gap)
        ext = self._extent(px, line_gap, char_gap)
        r = rng(self.seed, 'place')
        for li, line in enumerate(self.lines):
            latin = self._is_latin_line(line)
            if self.vertical:
                # columns from the right edge of the region leftward
                cxc = x + w - px / 2.0 - li * pitch
                Ls = [(px * (1 + char_gap) if _cjk(u[0]) else self._unit_adv(u, px) + space) for u in line]
                tot = sum(Ls)
                cur = y + {'start': 0.0, 'center': (h - tot) / 2.0, 'end': h - tot}[align]
                for u, L in zip(line, Ls):
                    if _cjk(u[0]):
                        m, adv, base = _text_mask(u, self.font, px)
                        jx = r.normal(0, px * 0.012)
                        units.append((m, cxc - m.shape[1] / 2.0 + jx, cur + (px - m.shape[0]) / 2.0, li, 'cjk'))
                    else:
                        m, adv, base = _text_mask(u, self.latin_font, px)
                        m = np.ascontiguousarray(np.rot90(m, -1))             # clockwise: reads downward
                        units.append((m, cxc - m.shape[1] / 2.0 - px * 0.04, cur, li, 'latin_v'))
                    cur += L
            else:
                Ls = [self._unit_adv(u, px) + (px * char_gap if _cjk(u[0]) else space) for u in line]
                tot = sum(Ls)
                cur = x + {'start': 0.0, 'center': (w - tot) / 2.0, 'end': w - tot}[align]
                top = y + li * pitch
                for u, L in zip(line, Ls):
                    f = self.font if _cjk(u[0]) else self.latin_font
                    m, adv, base = _text_mask(u, f, px)
                    # sit every unit on a common baseline
                    asc = load_font(f, px).getmetrics()[0]
                    units.append((m, cur - 2, top + px * 0.9 - base + r.normal(0, px * 0.006), li,
                                  'cjk' if _cjk(u[0]) else 'latin_h'))
                    cur += L
        return units

    # -- time ----------------------------------------------------------------------------------------------------------
    def density(self, t, soft=None):
        """Ink density of the text block at song time t (box-sized)."""
        soft = soft if soft is not None else (0.10 if self.mode == 'stroke' else 0.16)
        age = t - self.A
        k = smoothstep(0.0, soft, age)
        if self.ground == 'night':
            return self.D * k
        return self.D * k * (1.0 + 0.16 * np.exp(-np.maximum(age, 0) / 0.35))       # wet ink dries a shade lighter

    def T(self, t):
        """Full-frame transmittance layer (paper ground)."""
        out = np.ones((self.H, self.W, 3), F32)
        x0, y0, bw, bh = self.box
        out[y0:y0 + bh, x0:x0 + bw] = ink_T(self.density(t))
        return out

    def rgba(self, t):
        """Box-sized straight-alpha layer (night ground) and its position: (rgba, (x, y))."""
        a = np.clip(self.density(t), 0, 1) * 0.94
        col = self.colour if self.colour is not None else NIGHT_INK
        rgb = np.broadcast_to(col, a.shape + (3,)) * (0.93 + 0.07 * a[..., None])
        return np.dstack([rgb, a]).astype(F32), (self.box[0], self.box[1])

    def draw(self, frame, t, opacity=1.0):
        """Lay the inscription (and its seal, once pressed) onto a frame in place at song time t."""
        if not self.units or t < self.times[0][0] - 0.01:
            return frame
        x0, y0, bw, bh = self.box
        if self.ground == 'night':
            layer, pos = self.rgba(t)
            over(frame, layer, pos[0], pos[1], opacity)
        else:
            T = ink_T(self.density(t), tint=None if self.colour is None else self.colour)
            lay_ink(frame, T, x0, y0, opacity)
        if self.seal is not None and t >= self.t_seal:
            k = smoothstep(0.0, 0.06, t - self.t_seal)
            over(frame, self.seal, self.seal_pos[0], self.seal_pos[1], k * opacity)
        return frame

    def fade(self, frame, t, t_out, dur=1.2):
        """draw() with the whole inscription (and seal) fading back to bare paper from t_out over dur seconds."""
        return self.draw(frame, t, 1.0 - smoothstep(0.0, dur, t - t_out))


def make_small_seal(text, font, px, style='zhu', seed=0, wear=0.35):
    """A small name seal as RGBA. Uses tools.ink.seal if it is there; otherwise a simple carved square."""
    try:
        from .seal import seal as _seal
        return _seal(text, font, size=int(px), style=style, wear=wear, seed=seed)
    except Exception:
        pass
    S = int(px)
    n = max(1, len(text))
    m = np.zeros((S, S), F32)
    b = max(2, int(S * 0.08))
    inner = S - 2 * b - 2
    cell = inner / n
    f = load_font(font, max(8, int(min(cell, inner) * 0.95)))
    im = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(im)
    for i, ch in enumerate(text):                              # top to bottom
        d.text((S / 2.0, b + 1 + cell * (i + 0.5)), ch, font=f, fill=255, anchor='mm')
    g = np.asarray(im, F32) / 255.0
    if style == 'bai':
        m[:] = 1.0
        m = m * (1 - g)
    else:
        m = g.copy()
        cv2.rectangle(m, (b // 2, b // 2), (S - 1 - b // 2, S - 1 - b // 2), 1.0, max(1, b // 2), cv2.LINE_AA)
    yy, xx = np.mgrid[0:S, 0:S].astype(F32)
    e = np.minimum(np.minimum(xx, S - 1 - xx), np.minimum(yy, S - 1 - yy))
    m = m * smoothstep(0.0, 1.5, e + (fbm(S, S, 6, seed, 'se', octaves=2) - 0.5) * 3)
    take = 0.72 + 0.28 * smoothstep(0.3, 0.7, fbm(S, S, max(3, S / 6), seed, 'st', octaves=3))
    spk = smoothstep(wear * 0.9, wear * 0.9 + 0.25, fbm(S, S, 2.5, seed, 'sw', octaves=2) + 0.2)
    a = np.clip(blur(m, 0.6) * take * spk, 0, 1) * 0.93
    rgb = CINNABAR[None, None] * (0.86 + 0.2 * take[..., None])
    return np.dstack([rgb, a]).astype(F32)


# --------------------------------------------------------------------------------------------------------------------
# subtitles

@lru_cache(maxsize=64)
def _sub_mask(text, font, px):
    m, adv, base = _text_mask(text, font, px)
    return m


def subtitle(frame, text, font, px=40, y=0.90, x=0.5, ground='auto', opacity=1.0, max_width=0.8, font_cjk=None,
             halo=0.5):
    """A plain lower-third subtitle, in place. Quiet: dark ink on paper, pale on night, with a faint halo of the
    ground's own tone behind it so it stays legible over painting. Punctuation is dropped; nothing below 22 px.

    y, x       centre of the line as fractions of the frame; max_width: wraps to two lines beyond this fraction
    ground     'paper' | 'night' | 'auto' (decided from the picture under the text)
    font_cjk   font for CJK text (defaults to `font`); mixed lines pick per run
    """
    text = strip_punct(text).strip()
    if not text or opacity <= 0:
        return frame
    H, W = frame.shape[:2]
    px = max(MIN_PX * H / 1080.0, px * H / 1080.0)
    lines = [text]
    f_for = lambda s: (font_cjk or font) if any(_cjk(c) for c in s) else font
    if load_font(f_for(text), px).getlength(text) > max_width * W:
        ws = text.split(' ') if ' ' in text else list(text)
        j = '' if ' ' not in text else ' '
        best = min(range(1, len(ws)), key=lambda i: abs(len(j.join(ws[:i])) - len(j.join(ws[i:]))))
        lines = [j.join(ws[:best]), j.join(ws[best:])]
    cy = y * H - (len(lines) - 1) * px * 0.65
    for ln in lines:
        m = _sub_mask(ln, f_for(ln), int(round(px)))
        mh, mw = m.shape
        x0, y0 = int(x * W - mw / 2), int(cy - mh / 2)
        cy += px * 1.3
        a0, b0, a1, b1 = max(0, x0), max(0, y0), min(W, x0 + mw), min(H, y0 + mh)
        if a1 <= a0 or b1 <= b0:
            continue
        mm = m[b0 - y0:b1 - y0, a0 - x0:a1 - x0]
        reg = frame[b0:b1, a0:a1]
        g = ground
        med = np.median(reg.reshape(-1, 3), axis=0)
        if g == 'auto':
            g = 'night' if float(luma(med[None, None])[0, 0]) < 0.36 else 'paper'
        if halo > 0:                                    # the ground's own tone, softly, behind the letters
            hm = np.clip(blur(mm, px * 0.16) * 2.2, 0, 1)[..., None] * halo * opacity
            tone = med[None, None] * (1.06 if g == 'paper' else 0.75)
            reg[:] = reg * (1 - hm) + np.clip(tone, 0, 1) * hm
        if g == 'night':
            a = (mm * 0.92 * opacity)[..., None]
            reg[:] = reg * (1 - a) + NIGHT_INK[None, None] * a
        else:
            reg *= ink_T(mm * 0.88 * opacity)
    return frame


def subtitle_at(timing, t, lead=0.0, tail=0.8, min_dur=1.0):
    """The lyric line to show at song time t (first word start - lead ... last word end + tail), or None."""
    for l in timing.lines:
        ws = l.get('words') or []
        a = float(ws[0]['start'] if ws else l.get('start', 0)) - lead
        b = float(ws[-1].get('end', ws[-1]['start']) if ws else l.get('end', a + 2)) + tail
        if a <= t < max(b, a + min_dur):
            return l.get('text', '')
    return None
