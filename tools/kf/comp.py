#!/usr/bin/env python3
"""tools/kf/comp.py: the still-frame compositor for Proof. See tools/kf/README.md.

    PY=/home/jade/Documents/halys-video/.venv/bin/python          # run from the repo root
    $PY -m tools.kf.comp spec.json [--out x.jpg] [--size 3840x2160]

    from tools.kf.comp import compose, blank, save
    img = compose(spec)            # float32 sRGB HxWx3; spec without `src` is a blank-register frame (same as blank(spec))

Light is bare paper. A generated still ("a painting on cream paper", full bleed) is keyed onto ONE procedural sheet as
ink density; inside the set's beam mask the wash is lifted back to paper and only line is kept; outside it the shadow
is evened; motes, gold pencil, toner labels and the header are drawn in code on top.
All spec coordinates are 1920x1080 authoring pixels. Everything is seeded: same spec, same picture.
"""
import argparse
import json
import math
import os
import sys
import time

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from tools.ink.core import F32, INK_K, blur, fbm, grain, ink_T, rng, rough_mask, smoothstep, value_noise  # noqa: E402
from tools.ink.paper import Paper, key_paper  # noqa: E402

AW, AH = 1920, 1080                     # authoring size
LUM = np.array([0.2126, 0.7152, 0.0722], F32)

# Shadow wash tints by scene (docs/KEYFRAMES.md section 1): the colour the wash shows on white at density 1.
TINTS = {
    'ink': None,                         # plain carbon ink
    'attic': (0.40, 0.45, 0.56),         # cool blue-grey ink
    'shanghai': (0.47, 0.50, 0.40),      # warm grey-green
    'office': (0.50, 0.55, 0.48),        # flat greenish grey
    'wall': (0.10, 0.10, 0.11),          # near-black ink
    'market': (0.62, 0.62, 0.60),        # pale flat grey
    'basement': (0.16, 0.20, 0.36),      # deep indigo
    'kitchen': (0.42, 0.31, 0.22),       # warm umber
    'closet': (0.17, 0.13, 0.10),        # warm brown-black
    'mtnview': (0.40, 0.34, 0.50),       # dusk violet
    'playground': (0.58, 0.50, 0.36),    # warm grey-gold
}
try:                                     # tools/kf/scenes.py may override or add tints: TINTS = {'name': (r, g, b)}
    from tools.kf import scenes as _scenes
    TINTS.update(getattr(_scenes, 'TINTS', {}) or {})
except Exception:
    pass

GOLD_LIGHT = np.array([0.76, 0.57, 0.20], F32)      # gold pencil, light pressure
GOLD_DARK = np.array([0.50, 0.36, 0.12], F32)       # ... where the lead bit (graphite-brown)
MOTE = np.array([0.90, 0.70, 0.27], F32)            # a mote: gold-ochre pigment as a transmittance colour
MOTE_CORE = np.array([0.66, 0.44, 0.14], F32)
TONER = np.array([0.012, 0.012, 0.014], F32)

FONTS = {
    'sans': ['/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
             '/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf'],
    'serif': ['/usr/share/texmf/fonts/opentype/public/lm/lmroman10-regular.otf',
              '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf'],
}


def _font(kind, px):
    from PIL import ImageFont
    for p in FONTS[kind]:
        if os.path.exists(p):
            return ImageFont.truetype(p, max(4, int(round(px))))
    raise FileNotFoundError(f'no {kind} font found: {FONTS[kind]}')


def _path(p):
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


# --------------------------------------------------------------------------------------------------------------------
# the sheet

class Sheet:
    """The film's one sheet at an output size. rgb (HxWx3), height (HxW fibre relief), hz (height as a z-score of the
    local tooth: what pencil and granulation read)."""

    def __init__(self, rgb, height, s):
        self.rgb, self.height, self.s = rgb, height, s
        self.h, self.w = height.shape
        z = height - blur(height, 7 * s)
        self.hz = (z / max(float(z.std()), 1e-6)).astype(F32)


_SHEETS = {}


def sheet(W, H, seed=7, variant='new'):
    """The sheet for an output size. The master is the engine's Paper at 1920 wide; other sizes are that same sheet
    resampled (plus native fine grain when enlarging), so bare paper is the same picture at 1080p and 4K."""
    key = (W, H, seed, variant)
    if key not in _SHEETS:
        mh = int(round(AW * H / W))
        mk = (AW, mh, seed, variant)
        if mk not in _SHEETS:
            p = Paper(AW, mh, variant, seed=seed)
            _SHEETS[mk] = Sheet(p.rgb, p.height, 1.0)
        m = _SHEETS[mk]
        if (W, H) != (AW, mh):
            s = W / AW
            it = cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC
            rgb = cv2.resize(m.rgb, (W, H), interpolation=it)
            hgt = cv2.resize(m.height, (W, H), interpolation=it)
            if s > 1.2:
                g = grain(H, W, seed, 'kf_fine', sigma=0.6)
                rgb = rgb * (1 + 0.008 * g)[..., None]
                hgt = hgt + 0.045 * g
            _SHEETS[key] = Sheet(np.clip(rgb, 0, 1).astype(F32), np.clip(hgt, 0, 1).astype(F32), s)
    return _SHEETS[key]


# --------------------------------------------------------------------------------------------------------------------
# small helpers

def _load_rgb(path, W, H):
    a = cv2.imread(_path(path), cv2.IMREAD_COLOR)
    if a is None:
        raise FileNotFoundError(_path(path))
    a = a[..., ::-1].astype(F32) / 255.0
    if a.shape[1] != W or a.shape[0] != H:
        a = cv2.resize(a, (W, H), interpolation=cv2.INTER_AREA if W < a.shape[1] else cv2.INTER_CUBIC)
    return np.ascontiguousarray(np.clip(a, 0, 1))


def load_mask(path, W, H):
    """A mask file as HxW 0..1: its alpha if the alpha carries anything, else its luminance (the set's beam masks are
    RGBA with a solid alpha)."""
    a = cv2.imread(_path(path), cv2.IMREAD_UNCHANGED)
    if a is None:
        raise FileNotFoundError(_path(path))
    a = a.astype(F32) / (65535.0 if a.dtype == np.uint16 else 255.0)
    if a.ndim == 3:
        a = a[..., 3] if (a.shape[2] == 4 and float(a[..., 3].min()) < 0.99) else a[..., :3].mean(2)
    if a.shape[1] != W or a.shape[0] != H:
        a = cv2.resize(a, (W, H), interpolation=cv2.INTER_AREA if W < a.shape[1] else cv2.INTER_LINEAR)
    return np.ascontiguousarray(a)


def _poly_mask(polys, W, H, s, soft=0.0):
    m = np.zeros((H, W), np.uint8)
    if polys and np.isscalar(polys[0][0]):
        polys = [polys]
    for p in polys or []:
        cv2.fillPoly(m, [np.round(np.asarray(p, np.float64) * s * 8).astype(np.int32)], 255, cv2.LINE_AA, shift=3)
    m = m.astype(F32) / 255.0
    return blur(m, soft * s) if soft > 0 else m


def _tint_k(tint):
    """Absorption per unit density for a tint name or [r, g, b] (None / 'ink' = carbon ink)."""
    if isinstance(tint, str):
        if tint not in TINTS:
            raise KeyError(f'unknown tint {tint!r}; have {sorted(TINTS)}')
        tint = TINTS[tint]
    if tint is None:
        return INK_K.copy()
    return -np.log(np.clip(np.asarray(tint, F32), 0.02, 0.98))


def value_of(D):
    """How much of the paper's light a density field (HxWx3, -ln transmittance) takes away: 0 bare paper, 1 black."""
    return 1.0 - np.exp(-D) @ LUM


def save(img, path, quality=95):
    path = _path(path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    a = (np.clip(img, 0, 1) * 255.0 + 0.5).astype(np.uint8)[..., ::-1]
    if path.lower().endswith('.png'):
        cv2.imwrite(path, a, [cv2.IMWRITE_PNG_COMPRESSION, 3])
    else:
        cv2.imwrite(path, a, [cv2.IMWRITE_JPEG_QUALITY, quality, cv2.IMWRITE_JPEG_SAMPLING_FACTOR,
                              cv2.IMWRITE_JPEG_SAMPLING_FACTOR_444])
    return path


# --------------------------------------------------------------------------------------------------------------------
# wet edge

def wet_mask(hard, sh, feather=5.0, rough=1.0, seed=0, clean=3.0):
    """A hard mask (1 = bare paper) -> the same shape with a wet wash edge: its position wanders a little (a brush,
    not a ruler), it has a fine fibre-led tooth, and the fall from wash to paper is short and uneven in width.
    feather: px over which wash gives way to paper. rough: 0 = ruler straight, 1 = default, 2+ = loose."""
    H, W = hard.shape
    s = sh.s
    m = (hard > 0.5).astype(np.uint8)
    if clean > 0:                                              # drop slivers and pinholes left by the 3D render
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * int(round(clean * s)) + 1,) * 2)
        m = cv2.morphologyEx(cv2.morphologyEx(m, cv2.MORPH_OPEN, k), cv2.MORPH_CLOSE, k)
    pad = int(round(24 * s))                                   # the wash runs off the sheet: no edge at the frame
    m = cv2.copyMakeBorder(m.astype(F32), pad, pad, pad, pad, cv2.BORDER_REPLICATE)
    h2, w2 = m.shape
    if rough > 0:
        m = rough_mask(m, 2.2 * rough * s, 170 * s, seed, 'kfe1')      # slow wander: a brush, not a ruler
        m = rough_mask(m, 1.7 * rough * s, 19 * s, seed, 'kfe2')       # scallops where the wash crept
    f = max(0.7, feather * s)
    g = blur(m, f * 0.34)[pad:pad + H, pad:pad + W]
    # the stopping line wobbles with fine noise and with the paper: wash creeps further along low fibres
    n = (fbm(H, W, 7.0 * s, seed, 'kfe3', octaves=2) - 0.5) * 2 + np.clip(sh.hz, -2, 2) * -0.10
    wid = 0.24 + 0.20 * value_noise(H, W, 70 * s, seed, 'kfe4')        # the fall is crisper in some stretches
    c = 0.5 + n * 0.11 * min(rough, 2.0)
    return smoothstep(0.0, 1.0, (g - c) / (2 * wid) + 0.5).astype(F32)


def edge_rim(m, sh, px=2.6, seed=0):
    """0..~1: a thin band just OUTSIDE the paper shape (inside the wash) where pigment gathered as it dried."""
    H, W = m.shape
    s = sh.s
    rim = np.clip(blur(m, px * s) - m, 0, 1) * 2.2
    far = np.clip(blur(m, px * 3.5 * s) - m, 0, 1)                     # and a much fainter, wider shoulder
    rn = 0.45 + 1.1 * fbm(H, W, 34 * s, seed, 'kfrim', octaves=3)
    return ((rim + 0.35 * far) * rn * (1 + 0.25 * np.clip(-sh.hz, -1.5, 1.5))).astype(F32)


def granulate(sh, amount, seed=0):
    """Multiplier (HxW) that settles pigment into the paper's valleys."""
    if amount <= 0:
        return 1.0
    # valleys take more pigment; a fibre standing proud takes a little less (clipped: fibres must not read as scratches)
    g = 1.0 + amount * (np.clip((0.5 - sh.height) * 2.4, -0.10, 0.6) + 0.10 * np.clip(-sh.hz, -1.0, 2.0))
    mid = fbm(sh.h, sh.w, 38 * sh.s, seed, 'kfmott', octaves=3) - 0.5          # backruns and uneven drying
    g = g * (1.0 + amount * (0.30 * mid + 0.09 * grain(sh.h, sh.w, seed, 'kfgran', sigma=0.8 * max(sh.s, 0.7))))
    return np.clip(g, 0.3, 2.0).astype(F32)


# --------------------------------------------------------------------------------------------------------------------
# keying a full-bleed painting

def estimate_ground(img, mask=None):
    """The source 'paper' colour of a full-bleed painting: the median of the brightest large areas (inside the beam
    mask when there is one). Returns (3,)."""
    h, w = img.shape[:2]
    sm = cv2.resize(img, (max(32, w // 6), max(32, h // 6)), interpolation=cv2.INTER_AREA)
    sm = cv2.medianBlur((sm * 255).astype(np.uint8), 5).astype(F32) / 255.0      # lines and specks out
    L = sm @ LUM
    sel = np.ones(L.shape, bool)
    if mask is not None:
        mm = cv2.resize(mask, (sm.shape[1], sm.shape[0]), interpolation=cv2.INTER_AREA) > 0.9
        if mm.sum() > 0.01 * mm.size:
            sel = mm
    lo, hi = np.percentile(L[sel], [84, 97])
    pick = sel & (L >= lo) & (L <= hi)
    return np.median(sm[pick], axis=0).astype(F32)


def key_still(img, ground=None, mask=None, lo=0.02, hi=0.07, gain=1.0):
    """Painting -> density (HxWx3, -ln transmittance over the source ground). Uses the engine's key_paper with a
    fixed ground colour (no border estimate, no border fade: the stills are full bleed)."""
    g = estimate_ground(img, mask) if ground is None else np.asarray(ground, F32)
    T = key_paper(img, ground=g, lo=lo, hi=hi, feather=0, gain=gain, flat_field=False, neutral=0.0)
    return -np.log(np.clip(T, 0.012, 1.0)), g


def split_wash(D, sh, line_px=4.0):
    """Density -> (wash, detail). Wash is the density with everything thinner than ~2*line_px removed (a grey
    opening: it keeps the steps between washes exactly, so lifting it leaves no ghost edge the way a blur would);
    detail >= 0 is line, hatching and specks."""
    r = max(1, int(round(line_px * sh.s)))
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    w = cv2.morphologyEx(D, cv2.MORPH_OPEN, k)
    w = np.minimum(blur(w, 0.6 * sh.s), D)
    return w, D - w


def _solve_gain(wl, target):
    """Gain g so that the median of 1 - exp(-g * wl) is `target` (wl: sample of luma densities)."""
    med = float(np.median(wl))
    if med < 1e-3:
        return 1.0
    return float(-math.log(max(1e-3, 1.0 - target)) / med)


# --------------------------------------------------------------------------------------------------------------------
# motes

def draw_motes(frame, spec, sh, lit, dens=None, default_seed=0):
    """Small warm flecks ON bare paper, as pigment (multiplied: never brighter than the sheet). lit: HxW 0..1, where
    there is light; dens: HxW value (0..1) of what is already painted, so motes keep off painted things."""
    if not spec:
        return frame
    H, W = frame.shape[:2]
    s = sh.s
    seed = spec.get('seed', default_seed)
    n = int(spec.get('n', 60))
    smin, smax = spec.get('size', [1.6, 5.0])
    r = rng(seed, 'motes')
    # where: sample in authoring space so the same motes land at any output size
    aw, ah = 960, int(round(960 * H / W))
    k = aw / AW
    region = spec.get('region', 'beam')
    lm = cv2.resize(lit, (aw, ah), interpolation=cv2.INTER_AREA)
    if region != 'beam':
        lm = lm * _poly_mask(region, aw, ah, k)
    hard = (lm > 0.6).astype(np.uint8)
    if hard.sum() < 8:
        return frame
    pad = cv2.copyMakeBorder(hard, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0) if hard.all() else None
    dt = cv2.distanceTransform(hard, cv2.DIST_L2, 5) if pad is None else np.ones((ah, aw), F32)
    wgt = (dt / max(float(dt.max()), 1e-6)) ** float(spec.get('centre', 0.8))       # denser toward the middle
    if pad is not None:                                                             # whole frame lit: mild centre bias
        yy, xx = np.mgrid[0:ah, 0:aw].astype(F32)
        wgt = 1.0 - 0.6 * np.clip(np.hypot((xx - aw / 2) / (aw / 2), (yy - ah / 2) / (ah / 2)), 0, 1)
    if dens is not None:
        dn = cv2.resize(dens, (aw, ah), interpolation=cv2.INTER_AREA)
        wgt = wgt * smoothstep(0.30, 0.10, cv2.dilate(dn, np.ones((5, 5), np.uint8)))
    wgt = wgt * (dt > 3 * k) if pad is None else wgt
    cdf = np.cumsum(wgt.ravel().astype(np.float64))
    if cdf[-1] <= 0:
        return frame
    idx = np.searchsorted(cdf, r.random(n) * cdf[-1])
    ys, xs = np.divmod(idx, aw)
    pts = (np.stack([xs, ys], 1) + r.random((n, 2))) / k                            # authoring px
    dia = smin + (smax - smin) * r.random(n) ** 2.6                                 # long-tailed: mostly small
    elong = np.where(r.random(n) < 0.22, r.uniform(1.4, 2.3, n), r.uniform(1.0, 1.15, n))
    ang = r.uniform(0, math.pi, n)
    alpha = r.uniform(0.55, 1.0, n) * np.clip(0.55 + 0.45 * dia / max(smax * 0.5, 1e-3), 0.55, 1.0)
    hue = r.uniform(-1, 1, n)
    motes = [(pts[i, 0], pts[i, 1], dia[i], elong[i], ang[i], alpha[i], hue[i], False) for i in range(n)]
    hero = spec.get('hero')
    if hero:
        hd = float(spec.get('hero_size', max(smax * 1.7, 8.0)))
        # nothing lands on top of the hero or crowds it
        clear = float(spec.get('hero_clear', max(hd * 2.2, 46.0)))
        motes = [m for m in motes if math.hypot(m[0] - hero[0], m[1] - hero[1]) > clear]
        motes.append((hero[0], hero[1], hd, 1.08, 0.6, 1.0, 0.0, True))
    for (x, y, d, el, an, a, hu, is_hero) in motes:
        cx, cy = x * s, y * s
        ra, rb = max(0.5, d * el * s / 2), max(0.5, d * s / 2)
        if not is_hero and d * s < 1.6:                    # sub-pixel specks: keep the size, thin the pigment
            a *= max(0.5, d * s / 1.6)
            ra, rb = max(ra, 0.8), max(rb, 0.8)
        R = int(math.ceil(ra * 2.6)) + 2
        x0, y0, x1, y1 = int(cx) - R, int(cy) - R, int(cx) + R + 1, int(cy) + R + 1
        if x1 <= 0 or y1 <= 0 or x0 >= W or y0 >= H:
            continue
        X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
        yy, xx = np.mgrid[Y0:Y1, X0:X1].astype(F32)
        u = (xx + 0.5 - cx) * math.cos(an) + (yy + 0.5 - cy) * math.sin(an)
        v = -(xx + 0.5 - cx) * math.sin(an) + (yy + 0.5 - cy) * math.cos(an)
        q = np.hypot(u / ra, v / rb)
        e = min(0.60, 1.1 / max(rb, 0.5))                  # edge softness: about a pixel, so big ones are crisp
        if is_hero:
            e *= 0.55
        body = smoothstep(1.0 + e, 1.0 - e, q) * a
        col = MOTE * (1 + 0.08 * hu * np.array([1.0, 0.2, -1.2], F32))
        T = 1.0 - body[..., None] * (1.0 - np.clip(col, 0, 1))[None, None]
        if is_hero or d >= 3.2:                            # the larger ones have a darker pin-point heart
            cr = 0.40 if is_hero else 0.34
            ox, oy = (0.20 * ra, 0.18 * rb) if is_hero else (0.08 * ra, 0.08 * rb)
            qc = np.hypot((u - ox) / (ra * cr), (v - oy) / (rb * cr))
            ec = min(0.9, 1.0 / max(rb * cr, 0.3))
            core = smoothstep(1.0 + ec, 1.0 - ec, qc) * a * (0.9 if is_hero else 0.6)
            T = T * (1.0 - core[..., None] * (1.0 - MOTE_CORE)[None, None])
        if is_hero:                                        # a breath of warm stain round it, as round a wet dab
            T = T * (1.0 - (0.06 * np.exp(-(q / 1.8) ** 2))[..., None] * (1.0 - MOTE)[None, None])
        frame[Y0:Y1, X0:X1] *= T
    return frame


# --------------------------------------------------------------------------------------------------------------------
# gold pencil

def _catmull(pts, step=1.0):
    """A smooth open curve through the points, resampled about every `step` px."""
    p = np.asarray(pts, np.float64)
    if len(p) < 3:
        return _resample(p, step)
    q = np.vstack([2 * p[0] - p[1], p, 2 * p[-1] - p[-2]])
    out = []
    for i in range(1, len(q) - 2):
        p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
        m = max(2, int(np.hypot(*(p2 - p1)) / max(step, 0.2)) + 1)
        t = np.linspace(0, 1, m, endpoint=False)[:, None]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t ** 2
                          + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(p[-1][None])
    return _resample(np.vstack(out), step)


def _resample(p, step):
    p = np.asarray(p, np.float64)
    d = np.hypot(*np.diff(p, axis=0).T)
    L = np.concatenate([[0], np.cumsum(d)])
    if L[-1] < 1e-6:
        return p[:1].copy()
    t = np.linspace(0, L[-1], max(2, int(L[-1] / step) + 1))
    return np.stack([np.interp(t, L, p[:, 0]), np.interp(t, L, p[:, 1])], 1)


def _smooth_noise(n, wavelength, r):
    """n samples of smooth noise in -1..1 with about `wavelength` samples per wobble."""
    k = max(2, int(n / max(wavelength, 1.0)) + 3)
    c = r.uniform(-1, 1, k)
    x = np.linspace(0, k - 1.001, n)
    i = x.astype(int)
    f = x - i
    f = f * f * (3 - 2 * f)
    return c[i] * (1 - f) + c[np.minimum(i + 1, k - 1)] * f


class Pencil:
    """Gold pencil strokes, collected then laid once. Coordinates are authoring px. Each stroke is a wobbling centre
    line with pressure along it; the lead only takes on the high points of the paper, so the line is grainy and breaks
    where the sheet is low or the hand was light."""

    def __init__(self, sh, seed=0):
        self.sh, self.seed = sh, seed
        self.cov = np.zeros((sh.h, sh.w), F32)
        self.prs = np.zeros((sh.h, sh.w), F32)
        self.k = 0

    def stroke(self, pts, width=2.6, pressure=1.0, smooth=True, wobble=1.0, taper=True):
        """pts: [[x, y], ...] authoring px. width: line width in authoring px at full pressure."""
        s = self.sh.s
        r = rng(self.seed, 'pencil', self.k)
        self.k += 1
        p = np.asarray(pts, np.float64)
        p = _catmull(p, 0.5) if (smooth and len(p) > 2) else _resample(p, 0.5)
        n = len(p)
        if n < 2:                                           # a dab
            p = np.vstack([p, p + r.uniform(-0.4, 0.4, 2)])
            n = 2
        # the hand: a slow drift off the intended line and a finer tremor
        tan = np.gradient(p, axis=0)
        tan /= np.maximum(np.hypot(tan[:, 0], tan[:, 1]), 1e-6)[:, None]
        nor = np.stack([-tan[:, 1], tan[:, 0]], 1)
        if n > 8 and wobble > 0:
            off = 0.85 * _smooth_noise(n, 90, r) + 0.28 * _smooth_noise(n, 14, r)
            ends = np.minimum(np.arange(n), n - 1 - np.arange(n)) / 12.0
            p = p + nor * (off * wobble * np.clip(ends, 0.3, 1))[:, None]
        pr = pressure * (0.80 + 0.14 * _smooth_noise(n, 70, r) + 0.07 * _smooth_noise(n, 9, r))
        wd = np.full(n, width)
        if taper and n > 6:
            a = np.arange(n) * 0.5                          # px from the start
            b = a[::-1]
            pr = pr * (0.72 + 0.28 * np.clip(b / 9.0, 0, 1)) * (0.88 + 0.12 * np.clip(a / 3.0, 0, 1))
            wd = wd * (0.62 + 0.38 * np.clip(b / 6.0, 0, 1)) * (0.80 + 0.20 * np.clip(a / 3.0, 0, 1))
        wd = wd * (0.72 + 0.34 * pr / max(pressure, 1e-3))
        self._raster(p * s, wd * s, np.clip(pr, 0.05, 1.3))

    def dot(self, x, y, size=2.6, pressure=1.0):
        r = rng(self.seed, 'dot', self.k)
        self.k += 1
        a = r.uniform(0, math.pi)
        ln = r.uniform(0.0, 0.35) * size                    # the point turned a little as it pressed
        d = np.array([math.cos(a), math.sin(a)]) * ln / 2
        w = size * r.uniform(0.88, 1.12) * self.sh.s
        p = np.array([[x - d[0], y - d[1]], [x, y], [x + d[0], y + d[1]]]) * self.sh.s
        self._raster(p, np.full(3, w), np.full(3, float(np.clip(pressure * r.uniform(0.92, 1.1), 0.05, 1.3))))

    def _raster(self, p, wd, pr, chunk=400):
        H, W = self.cov.shape
        SS = 4 if self.sh.s < 1.5 else 3
        for i0 in range(0, len(p), chunk):
            q, w_, r_ = p[i0:i0 + chunk + 1], wd[i0:i0 + chunk + 1], pr[i0:i0 + chunk + 1]
            pad = int(math.ceil(w_.max())) + 2
            x0, y0 = int(math.floor(q[:, 0].min())) - pad, int(math.floor(q[:, 1].min())) - pad
            x1, y1 = int(math.ceil(q[:, 0].max())) + pad + 1, int(math.ceil(q[:, 1].max())) + pad + 1
            X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
            if X1 <= X0 or Y1 <= Y0:
                continue
            cw, ch = (x1 - x0) * SS, (y1 - y0) * SS
            cv_ = np.zeros((ch, cw), F32)
            pv = np.zeros((ch, cw), F32)
            for (x, y), w1, p1 in zip(q, w_, r_):
                c = (int(round((x - x0) * SS * 8)), int(round((y - y0) * SS * 8)))
                rad = max(4, int(round(w1 * 0.5 * SS * 8)))
                cv2.circle(cv_, c, rad, 1.0, -1, cv2.LINE_8, shift=3)
                cv2.circle(pv, c, rad, float(p1), -1, cv2.LINE_8, shift=3)
            cv_ = cv2.resize(cv_, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
            pv = cv2.resize(pv, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA) / np.maximum(cv_, 1e-3)
            sl = (slice(Y0 - y0, Y1 - y0), slice(X0 - x0, X1 - x0))
            new = cv_[sl] > self.cov[Y0:Y1, X0:X1]
            self.prs[Y0:Y1, X0:X1] = np.where(new, pv[sl], self.prs[Y0:Y1, X0:X1])
            self.cov[Y0:Y1, X0:X1] = np.maximum(self.cov[Y0:Y1, X0:X1], cv_[sl])

    def lay(self, frame, opacity=0.92):
        if self.k == 0:
            return frame
        sh = self.sh
        ys, xs = np.where(self.cov > 0.003)
        if len(xs) == 0:
            return frame
        g = grain(sh.h, sh.w, self.seed, 'kfpencil', sigma=0.55 * max(sh.s, 0.8))
        g2 = grain(sh.h, sh.w, self.seed, 'kfpencil2', sigma=1.5 * sh.s)
        tooth = np.clip(sh.hz, -2.5, 2.5) * 0.50 + g * 0.28 + g2 * 0.62   # where the paper stands up to meet the lead
        pr = self.prs
        t0 = 0.05 - 2.5 * pr                                           # light pressure only catches the peaks
        take = smoothstep(0.0, 1.0, (tooth - t0) / 1.6)
        edge = np.clip(self.cov * (1.0 + 0.30 * g), 0, 1) ** 0.8       # the edge of a pencil line is ragged, not soft
        a = np.clip(edge * (0.12 + 0.88 * take) * (0.58 + 0.45 * pr) * (1.0 + 0.10 * g), 0, 1) * opacity
        col = GOLD_LIGHT[None, None] + (GOLD_DARK - GOLD_LIGHT)[None, None] * np.clip(
            (pr - 0.55) * 1.3 + (take - 0.5) * 0.5, 0, 1)[..., None]
        # over shadow the same pigment reads a touch lighter and warmer than the wash it sits on
        a3 = a[..., None]
        frame[:] = frame * (1 - a3) + col * a3
        return frame


# numerals in a careful child's hand: strokes through control points in a box x 0..0.62, y 0 (top) .. 1 (baseline).
# ('s', pts) is one smooth pen stroke, ('l', pts) a straight-segment stroke, ('d', [x, y]) a dot.
def _oval(cx, cy, rx, ry, a0=-75, turn=372, n=14):
    a = np.radians(np.linspace(a0, a0 - turn, n))
    k = np.linspace(1.0, 0.94, n)                              # the end tucks just inside the start
    return [[cx + rx * k[i] * math.cos(a[i]), cy + ry * k[i] * math.sin(a[i])] for i in range(n)]


GLYPHS = {
    '0': [('s', _oval(0.31, 0.50, 0.25, 0.49))],
    '1': [('l', [[0.14, 0.26], [0.34, 0.03]]), ('s', [[0.34, 0.03], [0.35, 0.5], [0.34, 1.0]])],
    '2': [('s', [[0.08, 0.24], [0.17, 0.07], [0.35, 0.02], [0.51, 0.13], [0.50, 0.33], [0.32, 0.60], [0.07, 0.97]]),
          ('s', [[0.07, 0.97], [0.32, 0.95], [0.58, 0.97]])],
    '3': [('s', [[0.09, 0.13], [0.28, 0.02], [0.49, 0.11], [0.47, 0.33], [0.25, 0.46]]),
          ('s', [[0.25, 0.46], [0.50, 0.58], [0.54, 0.80], [0.33, 0.99], [0.07, 0.88]])],
    '4': [('l', [[0.40, 0.03], [0.06, 0.66]]), ('s', [[0.06, 0.66], [0.33, 0.65], [0.60, 0.66]]),
          ('s', [[0.43, 0.32], [0.44, 0.66], [0.43, 1.0]])],
    '5': [('s', [[0.15, 0.04], [0.13, 0.24], [0.11, 0.45]]),
          ('s', [[0.11, 0.45], [0.30, 0.38], [0.50, 0.49], [0.54, 0.72], [0.36, 0.97], [0.07, 0.90]]),
          ('s', [[0.15, 0.04], [0.34, 0.03], [0.53, 0.04]])],
    '6': [('s', [[0.47, 0.04], [0.25, 0.20], [0.11, 0.50], [0.11, 0.78], [0.28, 0.98], [0.47, 0.86], [0.49, 0.67],
                 [0.34, 0.53], [0.13, 0.66]])],
    '7': [('s', [[0.07, 0.05], [0.31, 0.04], [0.56, 0.05]]), ('s', [[0.56, 0.05], [0.38, 0.42], [0.25, 1.0]])],
    '8': [('s', [[0.45, 0.15], [0.30, 0.02], [0.15, 0.14], [0.21, 0.36], [0.42, 0.57], [0.49, 0.80], [0.32, 0.99],
                 [0.13, 0.83], [0.20, 0.58], [0.41, 0.36], [0.46, 0.13]])],
    '9': [('s', [[0.49, 0.22], [0.36, 0.04], [0.17, 0.08], [0.09, 0.27], [0.20, 0.46], [0.40, 0.42], [0.50, 0.20]]),
          ('s', [[0.50, 0.20], [0.50, 0.60], [0.44, 1.0]])],
    '?': [('s', [[0.11, 0.22], [0.20, 0.06], [0.37, 0.02], [0.51, 0.15], [0.47, 0.35], [0.32, 0.50], [0.30, 0.70]]),
          ('d', [0.30, 0.95])],
    '.': [('d', [0.12, 0.95])],
    ':': [('d', [0.14, 0.42]), ('d', [0.14, 0.92])],
    '-': [('s', [[0.10, 0.55], [0.30, 0.54], [0.50, 0.55]])],
    '=': [('s', [[0.08, 0.42], [0.30, 0.41], [0.54, 0.42]]), ('s', [[0.08, 0.66], [0.30, 0.65], [0.54, 0.66]])],
    '+': [('s', [[0.06, 0.55], [0.30, 0.54], [0.56, 0.55]]), ('s', [[0.31, 0.28], [0.31, 0.55], [0.31, 0.82]])],
    '/': [('s', [[0.50, 0.03], [0.30, 0.5], [0.10, 1.0]])],
}
ADVANCE = {'1': 0.50, '.': 0.30, ':': 0.32, ' ': 0.42}


def draw_gold(frame, marks, sh, default_seed=0):
    if not marks:
        return frame
    pen = Pencil(sh, default_seed)
    for i, m in enumerate(marks):
        r = rng(m.get('seed', default_seed), 'gold', i)
        w = float(m.get('width', 2.6))
        pres = float(m.get('pressure', 1.0))
        ty = m['type']
        if ty == 'ring':
            cx, cy = m['at']
            R = float(m['r'])
            a0 = math.radians(m.get('start', r.uniform(-140, -70)))            # starts upper left, like a hand
            gap = math.radians(m.get('gap', r.uniform(12, 26)))                # not quite closed
            n = max(16, int(R * 0.9))
            a = a0 + np.linspace(0, 2 * math.pi - gap, n) * (1 if m.get('cw', True) else -1)
            u = np.linspace(0, 1, n)
            ph = r.uniform(0, 6.28, 3)
            # optional: `wobble` (1 = the hand; 0 = a compass circle, the moongazing ring) and `progress` (0..1 of the
            # sweep drawn so far, for draw-on stills). Absent, the ring is exactly as before.
            wb = float(m.get('wobble', 1.0))
            drift = r.uniform(-0.05, 0.07) * (u - 0.5)                         # drifts in or out as it comes round
            if 'wobble' in m:
                harm = 0.035 * np.sin(a + ph[0]) + 0.022 * np.sin(2 * a + ph[1]) + 0.012 * np.sin(3 * a + ph[2])
                rr = R * (1 + wb * (harm + drift))
                sq = 1 + wb * r.uniform(-0.05, 0.05)
            else:                                                              # the original arithmetic, bit for bit
                rr = R * (1 + 0.035 * np.sin(a + ph[0]) + 0.022 * np.sin(2 * a + ph[1]) + 0.012 * np.sin(3 * a + ph[2])
                          + drift)
                sq = 1 + r.uniform(-0.05, 0.05)
            pts = np.stack([cx + rr * np.cos(a) * sq, cy + rr * np.sin(a) / sq], 1)
            if 'progress' in m:
                k = int(round(float(np.clip(m['progress'], 0, 1)) * (n - 1))) + 1
                if k < 2:
                    continue
                pts = pts[:k]
            if 'wobble' in m:
                pen.stroke(pts, w, pres, wobble=wb)
            else:
                pen.stroke(pts, w, pres)
        elif ty == 'dots':
            p = _resample(np.asarray(m['path'], np.float64), 1.0)
            gap = float(m.get('gap', 14))
            L = len(p) - 1
            t = 0.0
            ds = float(m.get('size', w * 1.2))
            while t <= L:
                x, y = p[int(t)]
                pen.dot(x + r.normal(0, 0.035 * gap), y + r.normal(0, 0.035 * gap), ds, pres * 1.15)
                t += gap * r.uniform(0.88, 1.14)
        elif ty in ('line', 'underline'):
            path = m['path'] if ty == 'line' else [m['from'], m['to']]
            p = np.asarray(path, np.float64)
            if len(p) == 2:                                                    # a ruled line by hand: a slight bow
                mid = (p[0] + p[1]) / 2
                d = p[1] - p[0]
                nrm = np.array([-d[1], d[0]]) / max(np.hypot(*d), 1e-6)
                p = np.vstack([p[0], mid + nrm * r.uniform(-1, 1) * min(4.0, 0.012 * np.hypot(*d)), p[1]])
            pen.stroke(p, w, pres)
        elif ty == 'ticks':
            x, y = m['at']
            hgt = float(m.get('size', 22))
            gap = float(m.get('gap', hgt * 0.42))
            n = int(m['n'])
            for j in range(n):
                if m.get('tally', True) and j % 5 == 4:                        # the fifth strikes through the four
                    xa = x + (j - 4.5) * gap
                    xb = x + (j - 0.4) * gap
                    pen.stroke([[xa + r.normal(0, 1), y - hgt * 0.22 + r.normal(0, 1.5)],
                                [xb + r.normal(0, 1), y - hgt * 0.80 + r.normal(0, 1.5)]], w, pres)
                    continue
                xj = x + j * gap + r.normal(0, gap * 0.07)
                lean = r.normal(0.08, 0.05) * hgt
                pen.stroke([[xj + lean, y - hgt * r.uniform(0.92, 1.05)], [xj + r.normal(0, 0.6), y + r.normal(0, 1.0)]],
                           w, pres)
        elif ty == 'text':
            _gold_text(pen, m, r, w, pres)
        else:
            raise ValueError(f'gold mark type {ty!r}')
    return pen.lay(frame, opacity=0.92)


def _gold_text(pen, m, r, w, pres):
    size = float(m.get('size', 34))                                            # digit height, authoring px
    text = str(m['text'])
    widths = [ADVANCE.get(c, 0.76) * size for c in text]
    x, y = m['at']                                                             # left end of the baseline
    if m.get('align') == 'center':
        x -= sum(widths) / 2
        y += size / 2
    lw = float(m.get('width', max(2.0, min(2.8, size * 0.07))))
    for c, adv in zip(text, widths):
        if c == ' ':
            x += adv
            continue
        if c not in GLYPHS:
            raise ValueError(f'gold text has no stroke path for {c!r} (have {"".join(sorted(GLYPHS))})')
        sc = size * r.uniform(0.94, 1.06)
        rot = math.radians(r.normal(0, 2.2))
        dy = r.normal(0, 0.022) * size
        ca, sa = math.cos(rot), math.sin(rot)
        for kind, pts in GLYPHS[c]:
            if kind == 'd':
                px, py = pts[0] - 0.31, pts[1] - 1.0
                pen.dot(x + (px * ca - py * sa + 0.31) * sc, y + dy + (px * sa + py * ca) * sc, lw * 1.5, pres)
                continue
            q = np.asarray(pts, np.float64) + r.normal(0, 0.014, (len(pts), 2))
            q = q - [0.31, 1.0]                                                # turn about the foot of the digit
            q = np.stack([q[:, 0] * ca - q[:, 1] * sa + 0.31, q[:, 0] * sa + q[:, 1] * ca], 1) * sc
            pen.stroke(q + [x, y + dy], lw, pres, smooth=(kind == 's'), wobble=0.35)
        x += adv


# --------------------------------------------------------------------------------------------------------------------
# toner label (a copy of a copy) and the header

def toner_label(text, size=34, gen=2, seed=0, R=4):
    """A black capital sans label as an alpha mask at R px per authoring px, degraded `gen` photocopy generations.
    Returns (alpha HxW, R). Each generation: optical blur, toner noise, a threshold that thickens the letter,
    drop-outs, pepper round it, and a slight skew; damage compounds, as it does on a copier."""
    from PIL import Image, ImageDraw
    text = str(text).upper()
    gen = int(max(1, min(5, gen)))
    f = _font('sans', size * R)
    track = 0.035 * size * R
    wds = [f.getlength(c) for c in text]
    tw = int(sum(wds) + track * (len(text) - 1))
    asc, desc = f.getmetrics()
    pad = int(size * R * 1.5)
    im = Image.new('L', (tw + 2 * pad, asc + desc + 2 * pad), 0)
    d = ImageDraw.Draw(im)
    x = pad
    for c, w in zip(text, wds):
        d.text((x, pad), c, fill=255, font=f)
        x += w + track
    a = np.asarray(im, F32) / 255.0
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(F32)
    win = smoothstep(0.0, pad * 0.9, np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)))
    for g in range(1, gen + 1):
        r = rng(seed, 'toner', g)
        k = g / 5.0
        # the glass is never square to the page
        ang = r.normal(0, 0.16 + 0.10 * g)
        shx = r.normal(0, 0.003 + 0.002 * g)
        M = cv2.getRotationMatrix2D((w / 2, h / 2), ang, 1.0 + r.normal(0, 0.003))
        M[0, 1] += shx
        M[0, 2] -= shx * h / 2
        a = cv2.warpAffine(a, M, (w, h), flags=cv2.INTER_CUBIC, borderValue=0)
        # pepper: stray toner near the image, laid before the optics so later generations fatten or lose it
        near = blur(a, size * R * 0.5) * (0.2 + 1.6 * fbm(h, w, 45 * R, seed, 'tn0', g, octaves=3)) * win
        n_pep = int((w * h) / (R * R) * (0.0008 + 0.0050 * k * k))
        px, py = r.integers(0, w, n_pep), r.integers(0, h, n_pep)
        keep = r.random(n_pep) < 0.5 * win[py, px] * (0.2 + np.clip(near[py, px] * 3.0, 0, 1))
        pep = np.zeros((h, w), F32)
        for X, Y, rad in zip(px[keep], py[keep], (r.random(n_pep)[keep] ** 2.5) * (0.50 + 0.3 * k) * R + (0.34 + 0.12 * k) * R):
            cv2.circle(pep, (int(X), int(Y)), max(1, int(round(rad))), 1.0, -1, cv2.LINE_AA)
        a = np.maximum(a, pep * r.uniform(0.75, 1.0))
        # optics and toner spread
        a = blur(a, (0.36 + 0.07 * g) * R)
        n1 = grain(h, w, seed, 'tn1', g, sigma=0.55 * R)
        n2 = (fbm(h, w, 7 * R, seed, 'tn2', g, octaves=3) - 0.5) * 2
        n3 = (fbm(h, w, 40 * R, seed, 'tn3', g, octaves=2) - 0.5) * 2          # the drum's uneven charge
        sig = 0.12 + 0.88 * smoothstep(0.02, 0.30, a)                        # noise rides on toner, not on clean paper
        a = a + ((0.045 + 0.018 * g) * n1 + (0.055 + 0.027 * g) * n2) * sig + 0.06 * k * n3 * sig
        # drop-outs: patches where the toner did not take
        do = fbm(h, w, 5.5 * R, seed, 'tn4', g, octaves=2)
        a = a - smoothstep(0.71 - 0.013 * g, 0.78 - 0.013 * g, do) * (0.20 + 0.28 * k)
        thr = 0.455 - 0.028 * g                                                 # each pass the letter gains weight
        a = smoothstep(thr - 0.07, thr + 0.07, a).astype(F32)
    return np.clip(a, 0, 1), R


def draw_toner(frame, labels, sh, default_seed=0):
    H, W = frame.shape[:2]
    s = sh.s
    for i, t in enumerate(labels or []):
        a, R = toner_label(t['text'], t.get('size', 34), t.get('gen', 2), t.get('seed', default_seed * 1000 + i))
        h, w = a.shape
        x, y = t['at']                                                         # centre of the label
        src = a
        k = s / R
        while k < 0.6:                                                         # mip down before the final warp
            src = cv2.resize(src, (src.shape[1] // 2, src.shape[0] // 2), interpolation=cv2.INTER_AREA)
            k *= 2
        M2 = cv2.getRotationMatrix2D((src.shape[1] / 2, src.shape[0] / 2), float(t.get('rot', 0)), k)
        M2[0, 2] += x * s - src.shape[1] / 2
        M2[1, 2] += y * s - src.shape[0] / 2
        al = cv2.warpAffine(src, M2, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)
        al = np.clip(al * 1.06, 0, 1)[..., None] * float(t.get('opacity', 1.0))
        frame[:] = frame * (1 - al) + TONER[None, None] * al
    return frame


def draw_header(frame, hd, sh):
    """Small place-and-year header in a quiet serif, laid as ink at about 70%."""
    if not hd:
        return frame
    from PIL import Image, ImageDraw
    s = sh.s
    f = _font('serif', hd.get('size', 30) * s)
    text = hd['text']
    bb = f.getbbox(text)
    pad = 6
    im = Image.new('L', (bb[2] - bb[0] + 2 * pad, bb[3] - bb[1] + 2 * pad), 0)
    ImageDraw.Draw(im).text((pad - bb[0], pad - bb[1]), text, fill=255, font=f)
    m = np.asarray(im, F32) / 255.0
    m = np.clip(blur(m, 0.32 * s) * 1.05, 0, 1)                                # ink sinks in a little
    x, y = hd.get('at', [96, 84])                                              # left end of the baseline
    X = int(round(x * s)) - pad + bb[0]
    Y = int(round(y * s)) - (pad - bb[1] + f.getmetrics()[0])
    H, W = frame.shape[:2]
    x0, y0, x1, y1 = max(0, X), max(0, Y), min(W, X + m.shape[1]), min(H, Y + m.shape[0])
    if x1 <= x0 or y1 <= y0:
        return frame
    mm = m[y0 - Y:y1 - Y, x0 - X:x1 - X]
    dens = float(hd.get('density', 0.70))                                      # 0..1: share of the light taken
    d = -math.log(max(1e-3, 1 - dens)) / float(INK_K.mean())
    gr = 1 + 0.35 * np.clip(-sh.hz[y0:y1, x0:x1], -1.5, 1.5) * 0.4
    frame[y0:y1, x0:x1] *= ink_T(mm * d * gr)
    return frame


# --------------------------------------------------------------------------------------------------------------------
# compose

def _overlays(frame, spec, sh, lit, dens, seed):
    draw_motes(frame, spec.get('motes'), sh, lit, dens, seed)
    draw_gold(frame, spec.get('gold'), sh, seed)
    draw_header(frame, spec.get('header'), sh)
    draw_toner(frame, spec.get('toner'), sh, seed)
    return np.clip(frame, 0, 1)


def _size(spec):
    W, H = spec.get('size', [AW, AH])
    return int(W), int(H)


def compose(spec, info=None):
    """spec (dict) -> float32 sRGB HxWx3. info: optional dict filled with measurements (ground, shadow values...)."""
    if not spec.get('src'):
        return blank(spec, info)
    info = {} if info is None else info
    W, H = _size(spec)
    pp = spec.get('paper', {})
    seed = int(spec.get('seed', pp.get('seed', 7)))
    sh = sheet(W, H, pp.get('seed', 7), pp.get('variant', 'new'))
    s = sh.s
    img = _load_rgb(spec['src'], W, H)
    bm = spec.get('beam') or {}
    hard = load_mask(bm['mask'], W, H) if bm.get('mask') else None
    if hard is not None and (bm.get('fill_holes') or bm.get('add') or bm.get('cut')):
        hb = (hard > 0.5).astype(np.uint8)
        if bm.get('fill_holes'):                           # e.g. the 3D mannequin's unlit side, when the figure is protected
            cs, _ = cv2.findContours(hb, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            cv2.drawContours(hb, cs, -1, 1, -1)
        hard = hb.astype(F32)
        if bm.get('add'):
            hard = np.maximum(hard, _poly_mask(bm['add'], W, H, s))
        if bm.get('cut'):
            hard = hard * (1 - _poly_mask(bm['cut'], W, H, s))
    kk = spec.get('key', {})
    D, ground = key_still(img, spec.get('ground'), hard, kk.get('lo', 0.02), kk.get('hi', 0.07), kk.get('gain', 1.0))
    info['ground'] = [round(float(v), 4) for v in ground]
    wash, detail = split_wash(D, sh, bm.get('line_px', 4.0))
    if hard is not None:
        m = wet_mask(hard, sh, bm.get('feather', 5.0), bm.get('rough', 1.0), bm.get('seed', seed))
    else:
        m = np.zeros((H, W), F32)
    out = 1.0 - m
    sel = out > 0.9
    small = (slice(None, None, 4), slice(None, None, 4))
    wl_out = (wash @ LUM)[small][sel[small]]
    u = None
    if wl_out.size > 50:
        info['shadow_value_src'] = round(float(np.median(1 - np.exp(-wl_out))), 4)
        u = np.median(wash[small][sel[small]], axis=0)                          # the wash's own hue (density vector)

    # ---- shadow: everything outside the beam shares one value ------------------------------------------------------
    sd = spec.get('shadow') or {}
    wash_o = wash
    if sd and wl_out.size > 50:
        ev = float(sd.get('even', 0.0))
        if ev > 0:                                                              # flatten slow unevenness of the wash
            lowf = blur(wash @ LUM, 90 * s)
            wash_o = wash_o * (np.clip(float(np.median(wl_out)) / np.maximum(lowf, 1e-3), 0.5, 2.0) ** ev)[..., None]
        al = sd.get('auto_level')
        if al:
            target = float(al['target'] if isinstance(al, dict) else al)
            lim = al.get('limit', [0.5, 2.2]) if isinstance(al, dict) else [0.5, 2.2]
            g = float(np.clip(_solve_gain((wash_o @ LUM)[small][sel[small]], target), lim[0], lim[1]))
            wash_o = wash_o * g
            info['auto_level_gain'] = round(g, 3)
        rt = float(sd.get('retint', 0.0))
        if rt > 0:                                         # turn the painted wash toward the scene's hue, value unchanged
            tk = _tint_k(sd.get('tint', 'ink'))
            wl_ = np.exp(-wash_o) @ LUM
            dd = np.log(np.clip(wl_, 1e-3, 1)) / math.log(float(np.exp(-tk) @ LUM))
            for _ in range(2):                             # two Newton steps on luma(exp(-d*tk)) = wl_
                e = np.exp(-dd[..., None] * tk[None, None])
                dd = dd + (e @ LUM - wl_) / np.maximum((e * tk[None, None]) @ LUM, 1e-4)
            wash_o = wash_o * (1 - rt) + np.maximum(dd, 0)[..., None] * tk[None, None] * rt
    gran_k = float(kk.get('granulate', 0.12))
    D_out = wash_o * granulate(sh, gran_k, seed)[..., None] + detail if gran_k > 0 else wash_o + detail
    if sd:
        tk = _tint_k(sd.get('tint', 'ink'))
        gr = granulate(sh, float(sd.get('granulate', 0.35)), seed + 1)
        add = np.zeros((H, W), F32)
        fl = float(sd.get('floor', 0.0))
        if fl > 0:                                # fill what the model left bare outside the beam, up to this value
            cur = np.exp(-blur(wash_o, 3.0 * s)) @ LUM
            q = np.clip((1.0 - fl) / np.maximum(cur, 1e-3), 0.02, 1.0)
            add += np.log(q) / math.log(float(np.exp(-tk) @ LUM))
        st = float(sd.get('strength', 0.0))
        if st > 0:
            pool = 1 + 0.10 * (fbm(H, W, 420 * s, seed, 'kfpool', octaves=3) - 0.5) * 2
            add += st * pool
        D_out = D_out + (add * gr)[..., None] * tk[None, None]

    # ---- beam: lift the wash back to paper, keep the line ------------------------------------------------------------
    if hard is not None:
        lift = float(bm.get('lift', 1.0))
        lk = float(bm.get('line_keep', 0.6))
        lf = bm.get('line_floor', [0.05, 0.16])            # detail fainter than this is the model's paper grain
        dl = detail.max(axis=2)
        dl = np.maximum(dl, blur(dl, 0.8 * s) * 1.1)
        det = detail * smoothstep(lf[0], lf[1], dl)[..., None]
        keep = _poly_mask(bm.get('protect'), W, H, s, soft=1.5) if bm.get('protect') else np.zeros((H, W), F32)
        # painted things are judged on the median of the density (lines drop out, hatched areas keep their tone)
        km = 2 * int(round(3.5 * s)) + 1
        ws = cv2.medianBlur((np.clip(D / 4.5, 0, 1) * 255).astype(np.uint8), km).astype(F32) * (4.5 / 255.0)
        ws = blur(ws, 1.2 * s)
        wl = ws @ LUM
        med = float(np.median(wl_out)) if wl_out.size > 50 else 0.6
        kd = bm.get('keep_dark', 'auto')                   # washes much darker than the shadow are painted things
        if kd:
            a, b = (1.5 * med + 0.15, 2.1 * med + 0.25) if kd == 'auto' else kd
            keep = np.maximum(keep, smoothstep(a, b, wl))
        kc = bm.get('keep_colour', [0.22, 0.45])           # washes of another hue than the shadow are local colour
        if kc and u is not None and float(np.linalg.norm(u)) > 1e-3:
            un = u / np.linalg.norm(u)
            res = np.linalg.norm(ws - (ws @ un)[..., None] * un[None, None], axis=2)
            keep = np.maximum(keep, smoothstep(kc[0], kc[1], res))
        if kd or kc:
            r3 = max(1, int(round(1.5 * s)))
            keep = blur(cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r3 + 1,) * 2)), 1.5 * s)
        keep = np.clip(keep, 0, 1)
        D_lit = (1 - lift) * wash + (lk + (1 - lk) * (1 - lift)) * det
        D_in = keep[..., None] * D + (1 - keep[..., None]) * D_lit
        Dn = out[..., None] * D_out + m[..., None] * D_in
        rim_amt = float(bm.get('rim', 0.40))
        if rim_amt > 0:                                    # pigment gathered where the wash stopped
            local = blur(D_out - detail, 3.0 * s)
            Dn = Dn + (edge_rim(m, sh, bm.get('rim_px', 2.4), seed) * rim_amt)[..., None] * local
        info['lit_fraction'] = round(float(m.mean()), 4)
        info['kept_fraction_in_beam'] = round(float((keep * m).sum() / max(float(m.sum()), 1.0)), 4)
    else:
        Dn = D_out
    if wl_out.size > 50:
        info['shadow_value'] = round(float(np.median(value_of(Dn[small])[sel[small]])), 4)
    frame = sh.rgb * np.exp(-Dn)
    frame = np.maximum(frame, 0.03)                        # ink is never the frame's black: that is toner's
    lit = m if hard is not None else np.zeros((H, W), F32)
    return _overlays(frame, spec, sh, lit, value_of(Dn), seed)


def blank(spec, info=None):
    """The blank register: bare paper, optionally with a `wash_band` (wash gathered on both sides of a diagonal band of
    bare paper), plus motes / gold / header / toner."""
    info = {} if info is None else info
    W, H = _size(spec)
    pp = spec.get('paper', {})
    seed = int(spec.get('seed', pp.get('seed', 7)))
    sh = sheet(W, H, pp.get('seed', 7), pp.get('variant', 'new'))
    s = sh.s
    frame = sh.rgb.copy()
    lit = np.ones((H, W), F32)
    val = np.zeros((H, W), F32)
    wb = spec.get('wash_band')
    if wb:
        ang = math.radians(float(wb.get('angle_deg', 40.0)))
        cx, cy = wb.get('through', [AW / 2, AH / 2])
        width = float(wb.get('width', 300.0))
        yy, xx = np.mgrid[0:H, 0:W].astype(F32)
        # the band runs along (cos a, -sin a): up to the right. Distance from its centre line, authoring px
        dist = np.abs((xx / s - cx) * math.sin(ang) + (yy / s - cy) * math.cos(ang))
        ws = int(wb.get('seed', seed))
        m = wet_mask((dist < width / 2).astype(F32), sh, wb.get('feather', 5.0), wb.get('rough', 1.0), ws, clean=0)
        dens = float(wb.get('density', 0.55))
        pool = float(wb.get('pool', 0.22))
        d = dens * (1 + pool * (fbm(H, W, 360 * s, ws, 'kfbandpool', octaves=4) - 0.5) * 2)
        # brush passes laid along the band leave faint streaks in its direction
        strk = fbm(H, W, 26 * s, ws, 'kfstreak', octaves=2)
        acr = dist + 14 * (value_noise(H, W, 200 * s, ws, 'kfstreak2') - 0.5)
        d = d * (1 + float(wb.get('streak', 0.06)) * np.sin(acr / 17.0 + strk * 5.0))
        cover = 1.0 - m
        reach = wb.get('reach')                           # px the wash extends from the band (None: to the frame edge)
        if reach is not None:
            outer = wet_mask((dist < width / 2 + float(reach)).astype(F32), sh, wb.get('feather', 5.0) * 1.6,
                             wb.get('rough', 1.0) * 1.5, ws + 1, clean=0)
            cover = cover * outer
            far = edge_rim(1.0 - outer, sh, 2.6, ws + 1)
        d = d * cover * granulate(sh, float(wb.get('granulate', 0.35)), ws)
        rim_amt = float(wb.get('rim', 0.40))
        if rim_amt > 0:
            rim = edge_rim(m, sh, wb.get('rim_px', 2.4), ws)
            if reach is not None:
                rim = rim * outer + far * cover
            d = d + rim * rim_amt * dens
        Dn = d[..., None] * _tint_k(wb.get('tint', 'ink'))[None, None]
        frame = frame * np.exp(-Dn)
        lit, val = m, value_of(Dn)
        info['shadow_value'] = round(float(np.median(val[m < 0.1])), 4) if (m < 0.1).any() else 0.0
        info['lit_fraction'] = round(float(m.mean()), 4)
    return _overlays(frame, spec, sh, lit, val, seed)


def run(spec, out=None, size=None):
    """Compose and save. Returns (path, info)."""
    if isinstance(spec, str):
        with open(_path(spec)) as f:
            spec = json.load(f)
    spec = dict(spec)
    if size:
        spec['size'] = list(size)
    out = out or spec.get('out')
    if not out:
        raise ValueError('no output path: give `out` in the spec or --out')
    info = {}
    img = compose(spec, info)
    return save(img, out), info


def main(argv=None):
    ap = argparse.ArgumentParser(description='Composite a Proof keyframe from a JSON spec (see tools/kf/README.md).')
    ap.add_argument('spec', nargs='+')
    ap.add_argument('--out', help='output path (jpg q95 or png); only with one spec')
    ap.add_argument('--size', help='WxH, overrides the spec (e.g. 3840x2160)')
    a = ap.parse_args(argv)
    size = [int(v) for v in a.size.lower().split('x')] if a.size else None
    if a.out and len(a.spec) > 1:
        ap.error('--out needs exactly one spec')
    for sp in a.spec:
        t = time.time()
        path, info = run(sp, a.out, size)
        print(f'{os.path.relpath(path, ROOT)}  {time.time() - t:.1f}s  {json.dumps(info)}')


if __name__ == '__main__':
    main()
