"""tools.ink.cliff: carved cliff text 摩崖石刻. Real typeset characters cut into a painted rock plate and lit by a
moving raking light. Nothing glows: characters read because their cuts fill with shadow and one wall catches the light.

    rock = rock_plate(1920, 1080, seed=4)                       # stand-in painted rock (or load a generated plate)
    c = Cliff(rock, text, 'refs/fonts/chongxi-seal/崇羲篆体.otf', size=150, region=(160, 90, 1600, 900), seed=2)
    frame = c.render(light=(az_deg, el_deg), fill=0.6)          # az: where the light comes FROM (0 = from the right,
                                                                # 90 = from below, 180 = from the left, 270 = from above)
    frame = c.render(light=lambda t: (200 - 14 * t, 9, 1.0), t=t, gold=ramp(t, 60, 63))
    scene.add(c.layer(light_fn, fill=0.5), kind='frame', depth=1.0)        # in a multiplane Scene

Light = (azimuth, elevation[, intensity]) in degrees, or a callable t -> that tuple. Low elevation (5-15 deg) is raking
light: cuts fill with shadow, the wall facing the light brightens. High elevation (60+) flattens the carving until only
grime and cinnabar show. Intensity 0 leaves `ambient` only.
"""
import math
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .core import (CINNABAR, F32, GOLD, MALACHITE, OCHRE, ROOT, blur, fbm, grain, ink_T, luma, rng, smoothstep,
                   value_noise)
from .ink import stroke, wash
from .paper import Paper


# --------------------------------------------------------------------------------------------------------------------
# fonts and glyphs (shared with text.py)

def _fpath(font):
    p = Path(font)
    return str(p if p.is_absolute() else ROOT / p)


@lru_cache(maxsize=64)
def load_font(font, size):
    return ImageFont.truetype(_fpath(font), int(round(size)))


@lru_cache(maxsize=16)
def font_cmap(font):
    """Set of codepoints the font really has (so a missing glyph is skipped, never drawn as tofu)."""
    try:
        from fontTools.ttLib import TTFont
        tt = TTFont(_fpath(font), fontNumber=0, lazy=True)
        return frozenset(tt.getBestCmap().keys())
    except Exception:
        return None


def has_glyph(font, ch):
    cm = font_cmap(font)
    if cm is not None:
        return ord(ch) in cm
    f = load_font(font, 64)                                   # fallback: compare with the .notdef picture
    a, b = f.getmask(ch), f.getmask('\U0010ffff')
    return bytes(a) != bytes(b)


def coverage(text, font):
    """(covered string, missing list) for the characters of text in this font (whitespace ignored)."""
    ok, miss = [], []
    for ch in text:
        if ch.isspace():
            continue
        (ok if has_glyph(font, ch) else miss).append(ch)
    return ''.join(ok), miss


def glyph_mask(ch, font, size, pad=0):
    """One glyph as a float mask (size+2*pad square), centred on its em box."""
    f = load_font(font, size)
    S = int(size + 2 * pad)
    im = Image.new('L', (S, S), 0)
    ImageDraw.Draw(im).text((S / 2.0, S / 2.0), ch, font=f, fill=255, anchor='mm')
    return np.asarray(im, F32) / 255.0


# --------------------------------------------------------------------------------------------------------------------
# a painted rock plate (stand-in until generated plates exist; also a useful far-cliff texture)

def rock_plate(w, h, seed=0, tone=0.26, direction=62.0, strokes=1.0, moss=0.25, warm=0.5, fade_top=0.0, paper=None,
               return_paper=False):
    """A cliff face painted in ink and light colour on xuan paper: graded grey washes, axe-cut texture strokes
    (斧劈皴: each stroke a hard edge that fades away to one side, dry at the tail), a few cracks, touches of ochre and
    moss green. Returns RGB HxWx3 (and the Paper if return_paper).

    tone       overall ink density of the wash (0.25 pale ... 0.6 dark rock)
    direction  degrees of the axe-cut strokes (the way the brush was dragged)
    fade_top   0..1 fraction of the height over which the rock fades upward into bare paper (the bridge cliff)
    """
    paper = paper or Paper(w, h, 'new', seed=seed)
    s = h / 1080.0
    r = rng(seed, 'rock')
    big = fbm(h, w, 620 * s, seed, 'rk_big', octaves=4)
    mid = fbm(h, w, 130 * s, seed, 'rk_mid', octaves=4, gain=0.55)
    # strata: the wash was laid in long slanting passes
    a = math.radians(direction)
    sw, sh = max(8, w // 10), max(8, h // 2)
    strat = cv2.resize(fbm(sh, sw, 26 * s, seed, 'rk_str', octaves=3), (w, h), interpolation=cv2.INTER_CUBIC)
    M = cv2.getRotationMatrix2D((w / 2, h / 2), 90 - direction, 1.6)
    strat = cv2.warpAffine(strat, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    d = tone * (0.62 + 0.66 * (big - 0.5) * 2 + 0.30 * (mid - 0.5) * 2 + 0.22 * (strat - 0.5) * 2)
    d = np.clip(d, 0.03, 1.0)
    # axe-cut strokes: hard leading edge, fading tail, dry-brush break-up. Three sizes.
    acc = np.zeros((h, w), F32)
    dry = fbm(h, w, 5 * s, seed, 'rk_dry', octaves=2)
    dry = 0.6 * dry + 0.4 * strat + (paper.height - 0.5) * 0.9
    dirn = (fbm(h, w, 700 * s, seed, 'rk_dir', octaves=2) - 0.5) * 1.5         # the strokes follow the rock's planes
    strokes = strokes * (w * h) / (1920.0 * 1080.0 * s * s)
    for (n, ln, wd, amp) in ((int(6 * strokes), 1200 * s, 460 * s, 0.20), (int(20 * strokes), 520 * s, 190 * s, 0.24),
                             (int(90 * strokes), 210 * s, 70 * s, 0.24), (int(260 * strokes), 80 * s, 24 * s, 0.20)):
        for i in range(n):
            cx, cy = r.uniform(-0.05, 1.05) * w, r.uniform(-0.05, 1.05) * h
            th = a + r.normal(0, 0.2) + float(dirn[int(np.clip(cy, 0, h - 1)), int(np.clip(cx, 0, w - 1))])
            L, Wd = ln * r.uniform(0.5, 1.4), wd * r.uniform(0.5, 1.5)
            R = int(max(L, Wd) * 0.75) + 3
            x0, y0, x1, y1 = int(cx - R), int(cy - R), int(cx + R), int(cy + R)
            a0, b0, a1, b1 = max(0, x0), max(0, y0), min(w, x1), min(h, y1)
            if a1 - a0 < 3 or b1 - b0 < 3:
                continue
            yy, xx = np.mgrid[b0:b1, a0:a1].astype(F32)
            u = (xx - cx) * math.cos(th) + (yy - cy) * math.sin(th)          # along the stroke
            v = -(xx - cx) * math.sin(th) + (yy - cy) * math.cos(th)         # across: edge at v=0, tail toward +v
            side = 1.0 if r.random() < 0.72 else -1.0
            v = v * side
            bend = (u / L) ** 2 * Wd * r.uniform(-0.5, 0.5)
            v = v - bend
            along = smoothstep(0.5, 0.36, np.abs(u / L)) * (0.75 + 0.25 * smoothstep(-0.5, 0.2, u / L))
            edge = smoothstep(-1.2 * s, 0.6 * s, v)
            tail = np.exp(-np.maximum(v, 0) / (Wd * 0.42))
            m = edge * tail * along
            # the tail goes dry: only the paper's high points take ink
            thr = 0.25 + 0.75 * np.clip(v / Wd, 0, 1)
            m = m * smoothstep(thr - 0.22, thr + 0.1, dry[b0:b1, a0:a1] + 0.42)
            acc[b0:b1, a0:a1] += m * amp * r.uniform(0.45, 1.25)
    d = d + np.clip(acc, 0, 1.0) * (0.45 + 0.9 * tone)
    # granulation and a little bloom at wash boundaries
    d = d * (1 + 0.28 * (0.5 - paper.height) * 2) * (1 + 0.05 * grain(h, w, seed, 'rk_g', sigma=0.7))
    presence = np.ones((h, w), F32)
    if fade_top > 0:
        yy = np.arange(h, dtype=F32)[:, None] / h
        fn = fbm(h, w, 240 * s, seed, 'rk_fade', octaves=4)
        presence = smoothstep(0.0, fade_top, yy - (1 - fade_top) * 0.0 + (fn - 0.5) * 0.35 - 0.04)
        d = d * presence
    T = ink_T(np.clip(d, 0, 1.3))
    # cracks: a few thin dry lines
    for i in range(int(round(5 * strokes))):
        x, y = r.uniform(0.05, 0.95) * w, r.uniform(0.0, 0.5) * h
        pts = [(x, y, 0.8)]
        th = math.radians(r.uniform(60, 120))
        for k in range(r.integers(3, 7)):
            th += r.normal(0, 0.45)
            stp = r.uniform(70, 220) * s
            x, y = x + math.cos(th) * stp, y + math.sin(th) * stp
            pts.append((x, y, r.uniform(0.3, 1.2)))
        st = stroke(pts, width=r.uniform(2.2, 4.5) * s, seed=seed * 131 + i, paper=paper, density=0.6, dry=0.45,
                    dry_end=0.8, bleed=1.2 * s)
        tt = st.T(2.0, size=(w, h))
        T = T * (1 - (1 - tt) * presence[..., None])
    # light colour: ochre warmth in the washes, moss green in a few damp patches
    och = smoothstep(0.35, 0.8, fbm(h, w, 420 * s, seed, 'rk_och', octaves=3)) * warm * 0.16 * presence
    T = T * ink_T(och * (0.5 + d), tint=OCHRE)
    if moss > 0:
        mm = smoothstep(0.58, 0.82, fbm(h, w, 260 * s, seed, 'rk_moss', octaves=4) + 0.12 * (mid - 0.5))
        mm = mm * (0.5 + 0.5 * smoothstep(0.4, 0.7, fbm(h, w, 14 * s, seed, 'rk_moss2', octaves=2))) * presence
        T = T * ink_T(mm * moss * 0.55, tint=np.array([0.42, 0.50, 0.36], F32))
    rgb = np.clip(paper.rgb * T, 0, 1).astype(F32)
    return (rgb, paper) if return_paper else rgb


# --------------------------------------------------------------------------------------------------------------------
# layout

def column_layout(text, region, size, col_gap=0.3, row_gap=0.12, rows=None, direction='rtl'):
    """Lay characters in vertical columns, right to left. text: characters; newlines force a new column, other
    whitespace is ignored. region (x, y, w, h). Returns [(char, cx, cy, col, row)] and (n_cols, rows_per_col).
    Stops when the region is full."""
    out, dims, _ = _layout_n(text, region, size, col_gap, row_gap, rows, direction)
    return out, dims


def blocks_layout(text, regions, size, col_gap=0.3, row_gap=0.12, rows=None, direction='rtl'):
    """Text flowing through several inscription blocks (each (x, y, w, h), in reading order: for 'rtl', give the
    rightmost block first). Columns are numbered globally in reading order. Returns [(char, cx, cy, col, row)],
    (n_cols, max_rows) and the per-block list of (first_col, n_cols)."""
    out, col0, info, pos, mrow = [], 0, [], 0, 1
    for reg in regions:
        rr = rows
        if len(reg) > 4:                                    # (x, y, w, h, rows) forces a row count for the block
            reg, rr = reg[:4], reg[4]
        cells, (nc, nr), used = _layout_n(text[pos:], reg, size, col_gap, row_gap, rr, direction)
        pos += used
        nc_used = (max(c[3] for c in cells) + 1) if cells else 0
        out += [(ch, cx, cy, col + col0, row) for ch, cx, cy, col, row in cells]
        info.append((col0, nc_used))
        col0 += nc_used
        mrow = max(mrow, nr)
        while pos < len(text) and text[pos] == '\n':        # a block ends a column: drop a pending column break
            pos += 1
    return out, (max(col0, 1), mrow), info


def _layout_n(text, region, size, col_gap=0.3, row_gap=0.12, rows=None, direction='rtl'):
    """column_layout that also returns how many characters of `text` it consumed."""
    x, y, w, h = region
    ph, pw = size * (1 + row_gap), size * (1 + col_gap)
    rows = rows or max(1, int((h + size * row_gap) // ph))
    ncol = max(1, int((w + size * col_gap) // pw))
    # centre the block in the region
    bx = x + (w - (ncol * pw - size * col_gap)) / 2.0
    by = y + (h - (rows * ph - size * row_gap)) / 2.0
    out, col, row, used = [], 0, 0, 0
    for i, ch in enumerate(text):
        used = i
        if ch == '\n':
            if row > 0:
                col, row = col + 1, 0
            if col >= ncol:
                break
            continue
        if ch.isspace():
            continue
        if row >= rows:
            col, row = col + 1, 0
        if col >= ncol:
            break
        ci = (ncol - 1 - col) if direction == 'rtl' else col
        out.append((ch, bx + ci * pw + size / 2.0, by + row * ph + size / 2.0, col, row))
        row += 1
        used = i + 1
    else:
        used = len(text)
    return out, (ncol, rows), used


# --------------------------------------------------------------------------------------------------------------------
# the cliff

def plane_presence(rock, size, lo=0.10, hi=0.42):
    """Where a carver would cut: the pale flat planes of a painted rock (1), not its dark fissures and texture-stroke
    clusters (0). Measured as the plate's local ink density against its own palest tone, smoothed at a stroke's
    scale, so a column that crosses a crack is broken off there as real inscriptions are."""
    L = luma(rock)
    g = float(np.percentile(L, 97))
    d = np.clip(1.0 - L / max(g, 1e-3), 0, 1)
    d = blur(d, max(2.0, size * 0.10))
    return (1.0 - smoothstep(lo, hi, d)).astype(F32)


class Cliff:
    """Characters cut into a rock plate.

    rock       RGB HxWx3 painted rock (no text). Output frames have this size.
    text       the characters (newline = new column); font: path; size: character height in plane px
    region     (x, y, w, h) on the cliff plane where the columns go (default: the whole plane with a margin)
    col_gap, row_gap   gaps as fractions of size; rows: characters per column (default: what fits)
    cut        'v' (V-section, the classic chisel cut) or 'flat' (flat floor with sloped walls)
    depth      relative cut depth (1.0 = a 45 degree V); deeper cuts hold shadow longer as the light rises
    weather    0..1 or HxW map (plane space): age. Shallower cuts, rounder lips, strokes broken away
    moss       None, 0..1 or HxW map (rock space): lichen/moss grown over the surface and into the cuts
    uncarved   HxW mask (rock space): nothing is carved where it is 1 (a child-shaped blank, the summit stone)
    uncarved_mode  'skip' drops whole characters that touch the mask; 'clip' cuts them off at its edge
    presence   HxW map (rock space) multiplying the carving (e.g. fading upward where the rock fades into paper);
               'auto' derives it from how much paint the plate has there
    quad       four rock-space points (TL, TR, BR, BL) the cliff plane maps to (perspective); plane_size (w, h) is
               the size of the flat plane the text is laid out on (default: the rock size)
    jitter     hand-cut irregularity of each character (position, size, rotation)
    Missing glyphs are skipped (never tofu) and listed in .missing.
    """

    def __init__(self, rock, text, font, size=120, region=None, col_gap=0.3, row_gap=0.12, rows=None, cut='v',
                 depth=1.0, weather=0.15, moss=None, uncarved=None, uncarved_mode='skip', presence=None, quad=None,
                 plane_size=None, jitter=0.03, seed=0, direction='rtl', relief=0.12, grime=0.35, chips=0.0,
                 streaks=0.0, soft_relief=True, weight=0.0, paint=0.0):
        self.rock = np.ascontiguousarray(rock[..., :3].astype(F32))
        H, W = self.rock.shape[:2]
        self.W, self.H, self.seed, self.size = W, H, seed, float(size)
        self.soft_relief, self.paint, self.weight = soft_relief, float(paint), float(weight)
        pw, ph = plane_size or (W, H)
        self.pw, self.ph = int(pw), int(ph)
        region = region or (int(pw * 0.06), int(ph * 0.06), int(pw * 0.88), int(ph * 0.88))
        multi = isinstance(region, (list, tuple)) and len(region) > 0 and isinstance(region[0], (list, tuple))
        self.regions = [tuple(r[:4]) for r in region] if multi else [tuple(region)]
        if multi:                                            # bounding box, for the gold front and framing
            xs = [r[0] for r in self.regions] + [r[0] + r[2] for r in self.regions]
            ys = [r[1] for r in self.regions] + [r[1] + r[3] for r in self.regions]
            self.region = (min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys))
        else:
            self.region = region
        self.Hm = None
        if quad is not None:
            src = np.array([[0, 0], [pw, 0], [pw, ph], [0, ph]], np.float32)
            self.Hm = cv2.getPerspectiveTransform(src, np.asarray(quad, np.float32))
        ok, self.missing = coverage(text.replace('\n', ''), font)
        keep = set(ok)
        text = ''.join(ch for ch in text if ch == '\n' or ch in keep)
        if multi:
            cells, (ncol, nrow), self.blocks = blocks_layout(text, list(region), size, col_gap, row_gap, rows,
                                                             direction)
        else:
            cells, (ncol, nrow) = column_layout(text, region, size, col_gap, row_gap, rows, direction)
            self.blocks = [(0, ncol)]
        self.ncol, self.nrow = ncol, nrow
        if isinstance(presence, str) and presence == 'plane':
            presence = plane_presence(self.rock, size)
        self._plane = presence if isinstance(presence, np.ndarray) else None
        # uncarved mask in plane space
        unc_p = None
        if uncarved is not None:
            unc = uncarved.astype(F32)
            unc_p = unc if self.Hm is None else cv2.warpPerspective(unc, np.linalg.inv(self.Hm), (self.pw, self.ph))
        r = rng(seed, 'cliff')
        mask = np.zeros((self.ph, self.pw), F32)
        colmap = np.full((self.ph, self.pw), -1, np.int16)
        self.cells = []
        pad = int(size * 0.12) + 2
        for ch, cx, cy, col, row in cells:
            jx, jy = r.normal(0, jitter * size, 2)
            sc, rot = 1 + r.normal(0, jitter), r.normal(0, jitter * 40)
            if unc_p is not None and uncarved_mode == 'skip':
                x0, y0 = int(cx - size / 2), int(cy - size / 2)
                reg = unc_p[max(0, y0):max(0, y0 + int(size)), max(0, x0):max(0, x0 + int(size))]
                if reg.size and reg.max() > 0.3:
                    continue
            g = glyph_mask(ch, font, size * sc, pad)
            if weight > 0:                                    # a broader chisel than the font's hairline seal strokes
                k = max(1, int(round(size * weight)))
                g = cv2.dilate(g, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * k + 1, 2 * k + 1)))
            if abs(rot) > 0.05:
                Mr = cv2.getRotationMatrix2D((g.shape[1] / 2, g.shape[0] / 2), rot, 1.0)
                g = cv2.warpAffine(g, Mr, (g.shape[1], g.shape[0]), flags=cv2.INTER_LINEAR)
            gx, gy = int(round(cx + jx - g.shape[1] / 2)), int(round(cy + jy - g.shape[0] / 2))
            a0, b0, a1, b1 = max(0, gx), max(0, gy), min(self.pw, gx + g.shape[1]), min(self.ph, gy + g.shape[0])
            if a1 <= a0 or b1 <= b0:
                continue
            gg = g[b0 - gy:b1 - gy, a0 - gx:a1 - gx]
            mask[b0:b1, a0:a1] = np.maximum(mask[b0:b1, a0:a1], gg)
            cm = colmap[b0:b1, a0:a1]
            cm[gg > 0.05] = col
            self.cells.append((ch, cx, cy, col, row))
        if unc_p is not None:
            mask = mask * (1 - smoothstep(0.3, 0.7, blur(unc_p, max(1.0, size * 0.02))))
        self._build(mask, colmap, cut, depth, weather, moss, presence, relief, grime, chips, streaks)

    # -- precompute ----------------------------------------------------------------------------------------------------
    def _build(self, mask, colmap, cut, depth, weather, moss, presence, relief, grime, chips=0.0, streaks=0.0):
        size, seed, pw, ph = self.size, self.seed, self.pw, self.ph
        # age: breaks strokes away and softens them
        if isinstance(weather, np.ndarray):
            wz = weather.astype(F32)
        else:
            wn = fbm(ph, pw, max(40.0, size * 1.6), seed, 'cl_w', octaves=4)
            wz = np.clip(float(weather) * (0.35 + 1.3 * wn), 0, 1)
        brk = fbm(ph, pw, max(3.0, min(size * 0.09, 16.0)), seed, 'cl_brk', octaves=3, gain=0.6)
        m = mask * smoothstep(wz * 0.95 - 0.06, wz * 0.95 + 0.04, brk + 0.08)
        # slightly irregular stroke edges: the chisel wandered
        if size >= 40:
            ex = (fbm(ph, pw, max(3.0, size * 0.05), seed, 'cl_ex', octaves=2) - 0.5) * size * 0.022
            ey = (fbm(ph, pw, max(3.0, size * 0.05), seed, 'cl_ey', octaves=2) - 0.5) * size * 0.022
            yy, xx = np.mgrid[0:ph, 0:pw].astype(F32)
            m = cv2.remap(m, xx + ex, yy + ey, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
        hard = (m > 0.5).astype(np.uint8)
        dist = cv2.distanceTransform(hard, cv2.DIST_L2, 5)
        dist = np.maximum(dist - 0.5 + m * 0.5, 0) * (m > 0.02)                 # keep the anti-aliased edge
        half = max(1.0, size * (0.034 + getattr(self, 'weight', 0.0)))          # typical half stroke width
        if cut == 'flat':
            wall = max(1.0, half * 0.55)
            dep = np.clip(dist / wall, 0, 1) * half * 0.9
        else:
            dep = np.minimum(dist, half * 1.5)
            dep = dep * (1.0 - 0.18 * np.clip(dist / (half * 1.5), 0, 1))       # the very bottom is a little blunt
        dep = dep * depth * (1.0 - 0.6 * wz)
        # chisel marks: every blow leaves a small facet; visible when a character is large
        cell = size * 0.035
        if cell >= 2.0:
            gh, gw = int(ph / cell) + 3, int(pw / cell) + 3
            fac = rng(seed, 'cl_fac').random((gh, gw), dtype=F32)
            fac = cv2.resize(fac, (gw * int(round(cell)), gh * int(round(cell))), interpolation=cv2.INTER_NEAREST)
            fac = fac[:ph, :pw] if fac.shape[0] >= ph and fac.shape[1] >= pw else cv2.resize(fac, (pw, ph))
            wx = (fbm(ph, pw, cell * 2.5, seed, 'cl_fx', octaves=2) - 0.5) * cell * 2.2
            wy = (fbm(ph, pw, cell * 2.5, seed, 'cl_fy', octaves=2) - 0.5) * cell * 2.2
            yy, xx = np.mgrid[0:ph, 0:pw].astype(F32)
            fac = cv2.remap(fac, xx + wx, yy + wy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            fac = blur(fac, max(0.5, cell * 0.05))
            dep = dep * (1.0 + 0.55 * (fac - 0.5) * smoothstep(2.0, 6.0, cell))
            dep = dep + (fac - 0.5) * cell * 0.16 * (dist > 0) * smoothstep(3.0, 8.0, cell)
        dep = dep * (1 + 0.10 * grain(ph, pw, seed, 'cl_gr', sigma=0.8) * (dist > 0))
        # lips: a fresh cut has a crisp arris, an old one is rounded
        lip = 0.5 + size * 0.0012
        dep = blur(dep, lip) * (1 - wz[..., None][..., 0] * 0.0)
        soft = blur(dep, lip * 3.0)
        dep = dep + (soft - dep) * np.clip(wz * 1.3, 0, 1)
        if self.soft_relief:                       # the arris rounds INTO the cut; it never spreads a halo onto the face
            dep = dep * smoothstep(0.0, 0.45, blur(m, max(0.7, lip)))
        cutm = smoothstep(0.02, 0.35, m) if size < 40 else smoothstep(0.05, 0.6, blur(m, 0.6))
        # chips: an old cut loses flakes of stone off its lips (shallow scoops just outside the stroke)
        if size >= 24 and chips > 0:
            ring = np.clip(blur(m, max(1.0, size * 0.03)) * 2.5, 0, 1) * (1 - m)
            cn = fbm(ph, pw, max(2.0, size * 0.035), seed, 'cl_chip', octaves=2)
            sp = fbm(ph, pw, max(6.0, size * 0.25), seed, 'cl_chip2', octaves=2)      # chips come in clusters
            thr = 0.80 - 0.12 * chips * (0.3 + wz)
            ch_ = smoothstep(thr, thr + 0.05, cn * 0.6 + sp * 0.5) * ring
            dep = dep + blur(ch_, 0.7) * half * 0.45 * min(chips, 1.0)
            cutm = np.maximum(cutm, ch_ * 0.35)
        # gold arrival: bottom of each column first, columns staggered right to left
        yy = np.arange(ph, dtype=F32)[:, None] * np.ones((1, pw), F32)
        ry0, rh = self.region[1], max(1.0, self.region[3])
        v = np.clip(1.0 - (yy - ry0) / rh, 0, 1)                                # 0 at the foot, 1 at the top
        if len(self.regions) > 1 and self.cells:                               # per column: foot to top of ITS column
            nc = max(self.ncol, 1)
            top = np.full(nc, 1e9, F32)
            bot = np.full(nc, -1e9, F32)
            for ch, cx, cy, col, row in self.cells:
                top[col] = min(top[col], cy - size * 0.6)
                bot[col] = max(bot[col], cy + size * 0.6)
            ci = np.clip(colmap, 0, nc - 1).astype(np.int32)
            ci = cv2.dilate(ci.astype(F32), np.ones((5, 5), np.uint8)).astype(np.int32)
            tt, bb = top[ci], bot[ci]
            v = np.clip((bb - yy) / np.maximum(bb - tt, 1.0), 0, 1).astype(F32)
        cmf = cv2.dilate(colmap.astype(F32), np.ones((3, 3), np.uint8))
        self._col_p, self._v_p = cmf, v
        # to rock space
        if self.Hm is not None:
            wp = lambda a, fl=cv2.INTER_LINEAR, bv=0: cv2.warpPerspective(a, self.Hm, (self.W, self.H), flags=fl,
                                                                         borderValue=bv)
            sc = math.sqrt(abs(np.linalg.det(self.Hm[:2, :2])))
            dep, cutm, v, wz = wp(dep) * sc, wp(cutm), wp(v), wp(wz)
            cmf = wp(cmf, cv2.INTER_NEAREST, -1)
        elif (pw, ph) != (self.W, self.H):
            raise ValueError('plane_size differs from the rock size: give quad=')
        pres = None
        if isinstance(presence, str) and presence == 'auto':
            from .paper import estimate_ground
            col, field = estimate_ground(self.rock)
            pres = smoothstep(0.05, 0.28, 1.0 - (self.rock / np.maximum(field, 1e-3)).min(axis=2))
            pres = blur(pres, max(2.0, size * 0.15))
        elif presence is not None:
            pres = presence.astype(F32)
        if pres is not None:
            dep, cutm = dep * pres, cutm * smoothstep(0.05, 0.5, pres)
        self.moss = None
        if moss is not None:
            if isinstance(moss, np.ndarray):
                mo = moss.astype(F32)
            else:
                mo = smoothstep(1 - float(moss) * 0.8, 1 - float(moss) * 0.8 + 0.2,
                                fbm(self.H, self.W, max(60.0, size * 1.8), seed, 'cl_moss', octaves=4))
                mo = mo * (0.55 + 0.45 * smoothstep(0.35, 0.65, fbm(self.H, self.W, max(4.0, size * 0.1), seed,
                                                                       'cl_moss2', octaves=2)))
            self.moss = mo
            dep = dep * (1 - 0.85 * mo)
        self.depth = dep.astype(F32)
        self.cut = cutm.astype(F32)
        self.dmax = float(max(np.percentile(dep[dep > 0.05], 99.5) if (dep > 0.05).any() else 0.0, 1e-3))
        self.col, self.v = cmf, v.astype(F32)
        # surface height: the cuts go down; the painted strokes of the rock give a faint relief of their own
        L = luma(self.rock)
        if self.soft_relief:
            # the painted strokes give the rock only a broad relief; paper fibres and pixel grain are NOT stone
            # (lit at a raking angle they read as embossed paper)
            micro = (blur(L, max(2.0, size * 0.03)) - blur(L, max(12.0, size * 0.4))) * relief * 6.0
            micro += (fbm(self.H, self.W, max(9.0, size * 0.12), seed, 'cl_micro', octaves=3) - 0.5) * relief * 0.5
        else:
            micro = (blur(L, 1.0) - blur(L, max(6.0, size * 0.08))) * relief * 9.0
            micro += (fbm(self.H, self.W, 7.0, seed, 'cl_micro', octaves=3) - 0.5) * relief * 1.3
        hgt = -self.depth + micro
        gx = cv2.Sobel(hgt, cv2.CV_32F, 1, 0, ksize=3) / 8.0
        gy = cv2.Sobel(hgt, cv2.CV_32F, 0, 1, ksize=3) / 8.0
        inv = 1.0 / np.sqrt(gx * gx + gy * gy + 1.0)
        self.nx, self.ny, self.nz = (-gx * inv).astype(F32), (-gy * inv).astype(F32), inv.astype(F32)
        self.hgt = (-self.depth).astype(F32)
        # albedo: grime sits in old cuts; moss covers
        alb = self.rock.copy()
        ao = np.clip(self.depth / self.dmax, 0, 1) ** 0.7 * self.cut
        gr = fbm(self.H, self.W, max(8.0, size * 0.3), seed, 'cl_grime', octaves=3)
        alb *= (1.0 - grime * ao * (0.5 + 0.9 * gr))[..., None]
        if streaks > 0:
            # rain has run out of the cuts for centuries: faint dark streaks hang below each stroke
            k = max(3, int(size * 0.9))
            ker = np.zeros((2 * k + 1, 1), F32)
            ker[:k + 1, 0] = np.linspace(0.2, 1.0, k + 1) ** 2                 # samples ABOVE: the streak hangs down
            ker /= ker.sum()
            src = blur(self.cut, max(1.0, size * 0.02))
            st = cv2.filter2D(src, -1, ker, borderType=cv2.BORDER_CONSTANT) * (1 - self.cut)
            sn = fbm(self.H, self.W, max(3.0, size * 0.05), seed, 'cl_streak', octaves=2)
            sn = cv2.resize(cv2.resize(sn, (self.W, max(2, self.H // 6))), (self.W, self.H))   # vertical runs
            st = np.clip(st * 2.2, 0, 1) * smoothstep(0.35, 0.75, sn) * streaks
            alb *= (1.0 - 0.22 * st)[..., None] * (1.0 - 0.05 * st[..., None] * np.array([-0.4, 0.2, 0.6], F32))
        if self.moss is not None:
            mc = np.array([0.36, 0.42, 0.30], F32) * (0.8 + 0.4 * gr[..., None])
            a = (self.moss * 0.7)[..., None]
            alb = alb * (1 - a) + (alb * 0.35 + mc * 0.65) * a
        self.albedo = alb.astype(F32)
        self.ao = ao.astype(F32)
        self._fill_cache, self._gold_cache = {}, None
        self._ngr = gr.astype(F32)

    # -- per-frame -----------------------------------------------------------------------------------------------------
    def _fill(self, fill, colour):
        key = (round(float(fill), 3), tuple(np.round(colour, 3)))
        if key in self._fill_cache:
            return self._fill_cache[key]
        seed, size = self.seed, self.size
        n1 = fbm(self.H, self.W, max(10.0, size * 0.45), seed, 'cl_fill', octaves=4)
        n2 = fbm(self.H, self.W, max(2.5, size * 0.05), seed, 'cl_fill2', octaves=2)
        floor = np.clip(self.depth / self.dmax, 0, 1)
        # paste survives where it pooled: deep in the floor, protected; rain and hands took the rest
        a = smoothstep(1.10 - fill * 0.95, 1.36 - fill * 0.95, 0.62 * n1 + 0.30 * n2 + 0.36 * floor ** 0.6)
        a = a * self.cut * (0.45 + 0.5 * n2) * smoothstep(0.0, 0.08, fill)
        if self.moss is not None:
            a = a * (1 - 0.8 * self.moss)
        col = np.asarray(colour, F32) * (0.80 + 0.35 * (n1[..., None] - 0.5))
        pk = getattr(self, 'paint', 0.0)                 # 0: thin old stain; 1: a body of vermilion paste
        alb = self.albedo * (1 - a[..., None]) + (col * (0.72 + 0.25 * pk) + self.albedo * (0.5 - 0.38 * pk)) * a[..., None]
        if len(self._fill_cache) > 3:
            self._fill_cache.clear()
        self._fill_cache[key] = alb.astype(F32)
        return self._fill_cache[key]

    def _shadow(self, az, el):
        """How much each pixel is in cast shadow (0..1): march toward the light across the cut."""
        te = math.tan(math.radians(max(el, 1.0)))
        smax = min(self.dmax / te, self.size * 0.5 + 6)
        if smax < 0.6:
            return None
        dx, dy = math.cos(math.radians(az)), math.sin(math.radians(az))
        n = int(min(20, max(3, math.ceil(smax / 1.5))))
        occ = np.full(self.hgt.shape, -1e3, F32)
        for k in range(1, n + 1):
            s = smax * (k / n) ** 1.3
            M = np.array([[1, 0, -dx * s], [0, 1, -dy * s]], np.float64)      # sample the height at p + s*dir
            hs = cv2.warpAffine(self.hgt, M, (self.W, self.H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            np.maximum(occ, hs - s * te, out=occ)
        return smoothstep(0.0, max(0.25, min(self.dmax * 0.22, 1.2)), occ - self.hgt)

    def gold_mask(self, progress, stagger=0.55, soft=0.06, order='rtl'):
        """Alpha of the gold at progress 0..1: a front running UP each column, columns starting one after another."""
        if progress is None or progress <= 0:
            return None
        if self._gold_cache is None or self._gold_cache[0] != (stagger, order):
            nc = max(1, self.ncol)
            r = rng(self.seed, 'gold')
            if order == 'random':
                o = r.permutation(nc)
            elif order == 'center':
                o = np.argsort(np.abs(np.arange(nc) - (nc - 1) / 2.0))
                o = np.argsort(o)
            else:
                o = np.arange(nc)
            delay = (o / max(nc - 1, 1)) * stagger + r.uniform(-0.02, 0.02, nc) * (nc > 1)
            ci = np.clip(self.col, 0, nc - 1).astype(np.int32)
            A = delay[ci].astype(F32) + self.v * (1 - stagger) * 0.92
            A = A + (self._ngr - 0.5) * 0.05
            self._gold_cache = ((stagger, order), A.astype(F32))
        A = self._gold_cache[1]
        return smoothstep(0.0, soft, progress * 1.04 - A) * self.cut * smoothstep(0.05, 0.3, self.depth / self.dmax)

    # -- windows: render only what the camera sees ------------------------------------------------------------------
    def prepare(self, fill=0.0, fill_colour=CINNABAR, gold=False, gold_stagger=0.55, gold_order='rtl'):
        """Precompute the full-plate caches (cinnabar fill, gold arrival) once, in setup(), so forked workers share
        them and `render(box=...)` only slices them."""
        if fill > 0:
            self._fill(fill, fill_colour)
        if gold:
            self.gold_mask(0.5, gold_stagger, order=gold_order)
            self._leaf_map()
        return self

    def _leaf_map(self):
        if not hasattr(self, '_leaf'):
            lf = fbm(self.H, self.W, max(2.5, self.size * 0.05), self.seed, 'cl_leaf', octaves=3, gain=0.6)
            self._leaf = (0.72 + 0.28 * smoothstep(0.30, 0.55, lf)).astype(F32)
        return self._leaf

    _PER_PX = ('rock', 'depth', 'cut', 'col', 'v', 'nx', 'ny', 'nz', 'hgt', 'albedo', 'ao', '_ngr', 'moss', '_leaf')

    def _sub(self, x0, y0, x1, y1, fill, fill_colour, gold, gold_stagger, gold_order):
        """A view of the plate window [y0:y1, x0:x1] that renders exactly like the full plate there."""
        sub = object.__new__(Cliff)
        sub.__dict__.update({k: v for k, v in self.__dict__.items() if not isinstance(v, np.ndarray)})
        ys, xs = slice(y0, y1), slice(x0, x1)
        for k in self._PER_PX:
            a = getattr(self, k, None)
            if isinstance(a, np.ndarray):
                setattr(sub, k, a[ys, xs])
        sub.W, sub.H = x1 - x0, y1 - y0
        sub._fill_cache = {}
        if fill > 0:
            full = self._fill(fill, fill_colour)
            key = (round(float(fill), 3), tuple(np.round(fill_colour, 3)))
            sub._fill_cache = {key: full[ys, xs]}
        sub._gold_cache = None
        if gold is not None and gold > 0:
            self.gold_mask(0.5, gold_stagger, order=gold_order)
            sub._gold_cache = (self._gold_cache[0], self._gold_cache[1][ys, xs])
            sub._leaf = self._leaf_map()[ys, xs]
        return sub

    def render(self, light=(200.0, 10.0), fill=0.0, gold=None, t=0.0, ambient=0.5, warmth=0.5, pool=None,
               fill_colour=CINNABAR, gold_colour=GOLD, gold_stagger=0.55, gold_order='rtl', cap=1.9, box=None,
               tint=None, ambient_tint=None):
        """One frame (HxWx3), or only the plate window `box` = (x0, y0, x1, y1) (returns that crop: what a camera on
        a long scroll needs; identical to the same crop of a full render).

        tint          RGB of the direct light (None = white; a moon is e.g. (0.93, 0.95, 0.98): silver, never blue)
        ambient_tint  RGB of the unlit rock (None = as painted; night e.g. (0.95, 0.96, 0.99))
        light     (az, el[, intensity]) degrees, or callable t -> that. az = direction the light comes FROM.
        fill      0..1 how much cinnabar is left in the cuts
        gold      None or progress 0..1 of the gold running up the columns ("gold happens once")
        ambient   brightness of unlit rock relative to the painted plate (the picture when the light is off)
        warmth    how warm the raking light is (0 neutral .. 1 tungsten/low sun). Never cool.
        pool      optional (x, y, radius) of a pool of light (a flashlight on the page), or an HxW intensity map
        """
        if callable(pool):
            pool = pool(t)
        if callable(ambient):
            ambient = ambient(t)
        if box is not None:
            if callable(light):
                light = light(t)
            x0, y0, x1, y1 = [int(round(v)) for v in box]
            mg = int(self.size * 0.6 + 8)
            a0, b0, a1, b1 = max(0, x0 - mg), max(0, y0 - mg), min(self.W, x1 + mg), min(self.H, y1 + mg)
            sub = self._sub(a0, b0, a1, b1, fill, fill_colour, gold, gold_stagger, gold_order)
            if pool is not None:
                pool = _win(pool, b0, b1, a0, a1) if isinstance(pool, np.ndarray) else (pool[0] - a0, pool[1] - b0,
                                                                                      pool[2])
            if isinstance(ambient, np.ndarray):
                ambient = _win(ambient, b0, b1, a0, a1)
            out = sub.render(light, fill, gold, t, ambient, warmth, pool, fill_colour, gold_colour, gold_stagger,
                             gold_order, cap, None, tint, ambient_tint)
            full = np.empty((y1 - y0, x1 - x0, 3), F32)
            full[:] = 0.5
            cx0, cy0 = max(x0, 0), max(y0, 0)
            cx1, cy1 = min(x1, self.W), min(y1, self.H)
            if cx1 > cx0 and cy1 > cy0:
                full[cy0 - y0:cy1 - y0, cx0 - x0:cx1 - x0] = out[cy0 - b0:cy1 - b0, cx0 - a0:cx1 - a0]
            return full
        if callable(light):
            light = light(t)
        az, el = float(light[0]), float(light[1])
        inten = float(light[2]) if len(light) > 2 else 1.0
        el = min(max(el, 1.5), 90.0)
        ce, se = math.cos(math.radians(el)), math.sin(math.radians(el))
        Lx, Ly, Lz = ce * math.cos(math.radians(az)), ce * math.sin(math.radians(az)), se
        lam = self.nx * Lx
        lam += self.ny * Ly
        lam += self.nz * Lz
        np.maximum(lam, 0, out=lam)
        lam *= 1.0 / max(se, 0.16)                         # relative to flat rock, so the plate keeps its painted tone
        np.minimum(lam, cap * 1.6, out=lam)
        sh = self._shadow(az, el) if inten > 0 else None
        if sh is not None:
            lam *= (1.0 - sh)
        if pool is not None:
            if isinstance(pool, np.ndarray):
                pm = pool
            else:
                yy, xx = np.mgrid[0:self.H, 0:self.W].astype(F32)
                pm = np.exp(-((xx - pool[0]) ** 2 + (yy - pool[1]) ** 2) / (2 * (pool[2] * 0.6) ** 2))
            lit = pm * inten
        else:
            lit = inten
        # k: 1 = as painted. Shadows fall to `ambient`; lit walls rise above 1 but are compressed (no blown whites).
        # ambient may also be an HxW map (rock space): e.g. deeper shade inside a travelling band of light
        k = ambient + (1.0 - ambient) * lam * lit if not np.isscalar(lit) else ambient + ((1.0 - ambient) * lit) * lam
        hi = np.maximum(k - 1.0, 0)
        k = np.minimum(k, 1.0) + hi / (1.0 + hi * 0.9) * 0.9
        alb = self._fill(fill, fill_colour) if fill > 0 else self.albedo
        if tint is None and ambient_tint is None:
            out = alb * k[..., None]
        else:
            ta = np.asarray(ambient_tint if ambient_tint is not None else (1, 1, 1), F32)
            tl = np.asarray(tint if tint is not None else (1, 1, 1), F32)
            amb = ambient[..., None] if isinstance(ambient, np.ndarray) else ambient
            out = alb * (amb * ta + (k[..., None] - amb) * tl)
        if warmth > 0:
            w = np.clip((k - ambient) / np.maximum(1e-3, 1.4 - ambient), 0, 1)[..., None] * warmth
            out *= 1.0 + w * np.array([0.07, 0.0, -0.13], F32)
            out *= 1.0 - (1 - np.clip(k, 0, 1))[..., None] * np.array([0.03, 0.01, -0.02], F32) * warmth
        if gold is not None and gold > 0:
            g = self.gold_mask(gold, gold_stagger, order=gold_order)
            if g is not None:
                # leaf in the cut: its own warm light, but still IN the stone: the wall turned to the light is
                # brighter, the far wall deeper, and the leaf is thin and broken where the chisel left it rough
                side = np.clip(self.nx * Lx + self.ny * Ly, -1, 1) / max(ce, 1e-3)
                facet = 0.82 + 0.26 * side + 0.16 * (self.nz - 0.7) + 0.14 * (self._ngr - 0.5)
                if sh is not None:
                    facet -= 0.16 * sh
                gc = np.asarray(gold_colour, F32)[None, None] * np.clip(facet, 0.35, 1.25)[..., None]
                gc = gc + np.clip(facet - 1.0, 0, 1)[..., None] * np.array([0.30, 0.27, 0.16], F32)
                ga = (g * self._leaf_map())[..., None]
                out = out * (1 - ga) + gc * ga
                sg = max(0.9, self.size * 0.008)
                spill = np.clip(blur(g, sg) - g, 0, 1) * 0.22                 # a very tight warm spill on the lip
                out += spill[..., None] * np.asarray(gold_colour, F32) * self.rock
        return np.clip(out, 0.015, 0.975).astype(F32)

    def layer(self, light, fill=0.0, gold=None, **kw):
        """A callable t -> frame for camera.Scene:  scene.add(c.layer(light_fn, fill=0.5), kind='frame', depth=1).
        light, fill and gold may each be a value or a callable of t."""
        def f(t):
            return self.render(light(t) if callable(light) else light, fill(t) if callable(fill) else fill,
                               gold(t) if callable(gold) else gold, t, **kw)
        return f

    def char_box(self, i):
        """(x, y, w, h) of the i-th carved character on the plane (for framing a close-up)."""
        ch, cx, cy, col, row = self.cells[i]
        return cx - self.size / 2, cy - self.size / 2, self.size, self.size


def _win(a, b0, b1, a0, a1):
    """Window of a rock-space map; a 1xW row (light varying along the cliff only) or Hx1 column broadcasts."""
    return a[slice(b0, b1) if a.shape[0] > 1 else slice(0, 1), slice(a0, a1) if a.shape[1] > 1 else slice(0, 1)]


def silhouette_child(w, h, cx, foot_y, height, seed=0):
    """A simple standing-child silhouette mask (for uncarved-region tests): head, body, legs. HxW 0..1."""
    m = np.zeros((h, w), F32)
    s = height / 100.0
    cv2.circle(m, (int(cx), int(foot_y - 84 * s)), int(15 * s), 1.0, -1, cv2.LINE_AA)
    pts = np.array([[-11, -68], [11, -68], [17, -30], [-17, -30]], np.float32) * s + np.array([cx, foot_y], np.float32)
    cv2.fillConvexPoly(m, pts.astype(np.int32), 1.0, cv2.LINE_AA)
    for dx in (-7, 7):
        cv2.line(m, (int(cx + dx * s), int(foot_y - 32 * s)), (int(cx + dx * 1.2 * s), int(foot_y)), 1.0,
                 max(1, int(8 * s)), cv2.LINE_AA)
    for dx in (-1, 1):
        cv2.line(m, (int(cx + dx * 12 * s), int(foot_y - 64 * s)), (int(cx + dx * 20 * s), int(foot_y - 36 * s)), 1.0,
                 max(1, int(6 * s)), cv2.LINE_AA)
    return np.clip(blur(m, 1.5 * s), 0, 1)
