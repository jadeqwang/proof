"""tools.ink.paper: the sheet. Procedural xuan paper (new, aged, rubbing ground, night ground) and the keyer that moves a
generated "painting on cream paper" onto OUR paper as an ink layer.

    p = Paper(1920, 1080, 'new', seed=1)       # p.rgb (HxWx3), p.height (HxW fibre relief 0..1), p.wear (HxW 0..1)
    frame = p.frame(t)                         # a fresh copy; t only matters if breathe > 0
    T = key_paper(load_image('plate.png'))     # transmittance layer; frame *= T puts the painting on our sheet
"""
import math

import cv2
import numpy as np

from .core import (F32, INK_K, PAPER_AGED, PAPER_NEW, blur, fbm, grain, luma, rng, smoothstep, value_noise, resize)

VARIANTS = ('new', 'aged', 'rubbing', 'night')


def _fibres(h, w, seed, n_per_mpx, lmin, lmax, curl, thick=1, key='f'):
    """Long, slightly curved fibres drawn anti-aliased; returns HxW float 0..1 (sum of strands)."""
    r = rng(seed, 'fibres', key)
    n = int(n_per_mpx * h * w / 1e6)
    acc = np.zeros((h, w), F32)
    layer = np.zeros((h, w), np.uint8)
    per = 400
    for i in range(0, n, per):
        layer[:] = 0
        m = min(per, n - i)
        x0 = r.uniform(-50, w + 50, m)
        y0 = r.uniform(-50, h + 50, m)
        ang = r.uniform(0, math.pi, m) + r.normal(0, 0.25, m)          # any direction, mild horizontal bias removed
        ln = lmin + (lmax - lmin) * r.random(m) ** 2.2
        bend = r.normal(0, curl, m)
        val = r.integers(70, 255, m)
        polys = []
        for j in range(m):
            k = max(4, int(ln[j] / 12))
            s = np.linspace(-0.5, 0.5, k)
            a = ang[j] + bend[j] * s * 2
            dx = np.cumsum(np.cos(a)) * ln[j] / k
            dy = np.cumsum(np.sin(a)) * ln[j] / k
            pts = np.stack([x0[j] + dx, y0[j] + dy], 1)
            polys.append((pts * 8).astype(np.int32).reshape(-1, 1, 2))
        for j, pp in enumerate(polys):
            cv2.polylines(layer, [pp], False, int(val[j]), thick, cv2.LINE_AA, shift=3)
        acc += layer.astype(F32) / 255.0
    return np.clip(acc, 0, 1.5)


class Paper:
    """One sheet of paper of a given size. Stable frame to frame: the texture is built once.

    variant   'new' (1988 cream xuan) | 'aged' (2026: toned, foxed, gutter and corners worn) |
              'rubbing' (the inked black ground of a 拓片) | 'night' (a night-wash ground)
    scale     texture scale: 1.0 is authored for a 1920-wide frame; 2.0 makes fibres twice as large (a closer sheet)
    gutter    x position (px) of a book gutter for the aged variant (None: no gutter)
    breathe   0..1 amplitude of the very slow grain breathing in frame(t) (default 0 = perfectly still)
    Attributes: rgb, height (fibre relief, 0..1, ~0.5 mean), wear (0..1, where time has taken the picture away;
    multiply a plate's density by (1 - wear) to age it: use aged_ink()).
    """

    def __init__(self, w, h, variant='new', seed=0, scale=1.0, gutter=None, breathe=0.0, deckle=False):
        assert variant in VARIANTS, variant
        self.w, self.h, self.variant, self.seed, self.scale = int(w), int(h), variant, seed, float(scale)
        self.breathe = float(breathe)
        self._build(gutter, deckle)

    # -- construction ------------------------------------------------------------------------------------------------
    def _build(self, gutter, deckle):
        w, h, s, seed = self.w, self.h, self.scale, self.seed
        cloud = fbm(h, w, 520 * s, seed, 'cloud', octaves=4)                     # formation: where the pulp lay thicker
        mott = fbm(h, w, 46 * s, seed, 'mott', octaves=3)
        fine = grain(h, w, seed, 'fine', sigma=0.55 * max(s, 0.6))
        fine2 = grain(h, w, seed, 'fine2', sigma=1.6 * s)
        # fibres: many pale short strands, fewer long bright ones, a few dark straw inclusions
        t1 = 1 if s < 1.6 else 2
        fa = _fibres(h, w, seed, 6000 / s ** 2, 14 * s, 90 * s, 0.35, t1, 'a')
        fb = _fibres(h, w, seed, 300 / s ** 2, 80 * s, 380 * s, 0.28, t1, 'b')
        fd = _fibres(h, w, seed, 110 / s ** 2, 6 * s, 46 * s, 0.9, t1, 'd')
        fa, fb, fd = blur(fa, 0.5 * s), blur(fb, 0.7 * s), blur(fd, 0.45 * s)
        # laid lines (帘纹) from the bamboo mould: faint, slightly wavering
        yy, xx = np.mgrid[0:h, 0:w].astype(F32)
        wob = (value_noise(h, w, 300 * s, seed, 'laid') - 0.5) * 6 * s
        laid = 0.5 + 0.5 * np.sin((xx + wob) * (2 * math.pi / (7.0 * s)))
        chain = np.exp(-(((xx + wob * 3) % (118 * s)) - 59 * s) ** 2 / (2 * (1.4 * s) ** 2))
        height = (0.5 + 0.22 * (fa - fa.mean()) + 0.30 * fb + 0.10 * (mott - 0.5) + 0.055 * fine + 0.03 * (laid - 0.5)
                  - 0.2 * fd)
        self.height = np.clip(height, 0, 1).astype(F32)
        self.fibre = np.clip(fa * 0.6 + fb, 0, 1).astype(F32)
        self.wear = np.zeros((h, w), F32)

        v = self.variant
        if v in ('new', 'aged'):
            base = PAPER_NEW if v == 'new' else PAPER_AGED
            tone = (1.0 + 0.030 * (cloud - 0.5) * 2 + 0.014 * (mott - 0.5) * 2 + 0.010 * fine + 0.006 * fine2
                    + 0.015 * (fa - fa.mean()) + 0.024 * fb - 0.006 * (laid - 0.5) + 0.012 * chain)
            rgb = base[None, None, :] * tone[..., None]
            # fibres are slightly whiter (less cream) than the sheet; straw inclusions are brown
            rgb += (fb * 0.018 + (fa - fa.mean()) * 0.008)[..., None] * np.array([0.6, 0.8, 1.3], F32)
            rgb -= fd[..., None] * np.array([0.10, 0.13, 0.17], F32)
            # warmth drifts across the sheet
            warm = (fbm(h, w, 900 * s, seed, 'warm', octaves=2) - 0.5)
            rgb *= 1 + warm[..., None] * np.array([0.01, 0.0, -0.035], F32)
            if v == 'aged':
                rgb = self._age(rgb, cloud, mott, gutter)
        elif v == 'rubbing':
            rgb = self._rubbing_ground(cloud, mott, fine, fa, fb)
        else:
            rgb = self._night_ground(cloud, mott, fine, fa, fb)
        if deckle:
            self.deckle = deckle_mask(h, w, seed, s)
        self.rgb = np.clip(rgb, 0, 1).astype(F32)
        self._g2 = None

    def _age(self, rgb, cloud, mott, gutter):
        w, h, s, seed = self.w, self.h, self.scale, self.seed
        yy, xx = np.mgrid[0:h, 0:w].astype(F32)
        # toning: browner toward the edges (light and air get in from the edges of a closed book)
        edge = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy))
        en = fbm(h, w, 160 * s, seed, 'edge', octaves=3)
        tone = np.exp(-edge / (110 * s * (0.5 + en)))
        rgb = rgb * (1 - tone[..., None] * np.array([0.10, 0.15, 0.24], F32))
        # foxing: small rusty spots in loose clusters
        fox_field = smoothstep(0.60, 0.80, fbm(h, w, 260 * s, seed, 'foxc', octaves=2))
        r = rng(seed, 'fox')
        spots = np.zeros((h, w), F32)
        n = int(90 * w * h / 2.07e6)
        for _ in range(n):
            x, y = int(r.uniform(0, w)), int(r.uniform(0, h))
            if r.random() > 0.15 + 0.85 * fox_field[y, x]:
                continue
            rad = (0.8 + 4.5 * r.random() ** 3) * s
            cv2.circle(spots, (x, y), max(1, int(rad)), float(r.uniform(0.25, 0.9)), -1, cv2.LINE_AA)
        spots = blur(spots, 1.2 * s) * (0.6 + 0.8 * mott)
        rgb = rgb * (1 - spots[..., None] * np.array([0.16, 0.26, 0.40], F32))
        # a tide line or two (old damp)
        tide = fbm(h, w, 420 * s, seed, 'tide', octaves=3)
        line = np.exp(-((tide - 0.63) / 0.010) ** 2) * smoothstep(0.3, 0.7, fbm(h, w, 700 * s, seed, 'tm', octaves=1))
        rgb = rgb * (1 - blur(line, 2.0 * s)[..., None] * np.array([0.028, 0.04, 0.065], F32))
        rgb = rgb * (1 - smoothstep(0.63, 0.75, tide)[..., None] * np.array([0.012, 0.018, 0.03], F32))
        # wear: corners rubbed soft and pale, edges thumbed, gutter faded
        wear = np.zeros((h, w), F32)
        cn = fbm(h, w, 90 * s, seed, 'corn', octaves=3)
        for cx, cy in ((0, 0), (w, 0), (0, h), (w, h)):
            d = np.hypot(xx - cx, yy - cy)
            wear = np.maximum(wear, smoothstep(300 * s, 40 * s, d * (0.7 + 0.6 * cn)))
        wear = np.maximum(wear, 0.55 * smoothstep(70 * s, 8 * s, edge * (0.6 + 0.8 * cn)))
        if gutter is not None:
            g = np.abs(xx - gutter)
            gn = fbm(h, w, 120 * s, seed, 'gut', octaves=3)
            wear = np.maximum(wear, 0.85 * smoothstep(120 * s, 14 * s, g * (0.6 + 0.8 * gn)))
            # the gutter itself: a soft valley shadow and a pale abraded ridge beside it
            rgb = rgb * (1 - 0.16 * np.exp(-(g / (9 * s)) ** 2))[..., None]
            rgb = rgb * (1 - 0.05 * np.exp(-(g / (60 * s)) ** 2))[..., None]
        # worn areas go paler and fluffier (surface fibres raised)
        fluff = np.clip(self.fibre * 1.6, 0, 1)
        rgb = rgb + (wear * (0.035 + 0.05 * fluff))[..., None] * np.array([0.8, 0.9, 1.25], F32)
        self.wear = np.clip(wear, 0, 1).astype(F32)
        return rgb

    def _rubbing_ground(self, cloud, mott, fine, fa, fb):
        """The black of an ink rubbing: built up by dabbing with a pad, so it is cloudy, grainy, never flat."""
        w, h, s, seed = self.w, self.h, self.scale, self.seed
        r = rng(seed, 'dabs')
        dab = np.zeros((h, w), F32)
        n = int(1500 * w * h / 2.07e6 / s ** 2)
        small = np.zeros((h // 4 + 1, w // 4 + 1), F32)
        for _ in range(n):                                   # overlapping pad prints, each a soft disc
            x, y = r.uniform(0, w / 4), r.uniform(0, h / 4)
            rad = r.uniform(9, 20) * s
            v = float(r.uniform(0.05, 0.22))
            tmp = np.zeros_like(small)
            cv2.circle(tmp, (int(x), int(y)), int(rad), v, -1, cv2.LINE_AA)
            small += tmp
        dab = cv2.resize(blur(small, 2.5 * s), (w, h), interpolation=cv2.INTER_CUBIC)
        dab = dab / max(float(dab.mean()), 1e-6)
        cover = np.clip(0.80 + 0.16 * (dab - 1.0) + 0.10 * (cloud - 0.5), 0, 1)
        # the pad only touches the high points of the paper: grain shows as tiny grey pinholes
        pin = smoothstep(0.9, 2.6, fine * 1.0 + (0.5 - self.height) * 4.0 + (1 - cover) * 3.0)
        black = np.array([0.075, 0.072, 0.074], F32)
        grey = np.array([0.42, 0.40, 0.375], F32)
        k = np.clip((1 - cover) * 0.55 + pin * 0.6, 0, 1)[..., None]
        rgb = black[None, None] * (1 - k) + grey[None, None] * k
        rgb = rgb * (1 + 0.25 * (mott - 0.5))[..., None] + (fb * 0.02)[..., None]
        # creases from folding and mounting
        cr = creases(h, w, seed, s)
        rgb = rgb + cr[..., None] * 0.16
        self.cover = cover.astype(F32)
        return rgb

    def _night_ground(self, cloud, mott, fine, fa, fb):
        """Night as a painted ground: several passes of dark indigo-ink wash on paper, fibres catching a little light."""
        w, h, s, seed = self.w, self.h, self.scale, self.seed
        wash = fbm(h, w, 380 * s, seed, 'wash', octaves=4)
        strk = fbm(h, max(8, w // 6), 60 * s, seed, 'strk', octaves=3)
        strk = cv2.resize(strk, (w, h), interpolation=cv2.INTER_CUBIC)       # long horizontal brush passes
        base = np.array([0.062, 0.070, 0.105], F32)
        tone = 1.0 + 0.36 * (wash - 0.5) + 0.20 * (strk - 0.5) + 0.12 * (mott - 0.5) + 0.05 * fine
        rgb = base[None, None] * tone[..., None]
        rgb += ((fa - fa.mean()) * 0.012 + fb * 0.035)[..., None] * np.array([0.8, 0.9, 1.1], F32)
        rgb += (smoothstep(0.55, 0.9, self.height) * 0.012)[..., None]
        return rgb

    # -- use ---------------------------------------------------------------------------------------------------------
    def frame(self, t=0.0):
        """A fresh HxWx3 copy of the sheet to draw on. With breathe > 0 the fine grain shifts very slowly (period
        ~9 s, a fraction of a percent): alive, never boiling."""
        out = self.rgb.copy()
        if self.breathe > 0:
            if self._g2 is None:
                self._g2 = (grain(self.h, self.w, self.seed, 'br1', sigma=0.8 * self.scale),
                            grain(self.h, self.w, self.seed, 'br2', sigma=0.8 * self.scale))
            a = 2 * math.pi * t / 9.0
            g = self._g2[0] * math.sin(a) + self._g2[1] * math.cos(a)
            out *= (1.0 + 0.006 * self.breathe * g)[..., None]
        return out

    def crop(self, x, y, w, h):
        """A view of the sheet as a new Paper-like object (shares texture)."""
        import copy
        p = copy.copy(self)
        p.rgb, p.height, p.wear = self.rgb[y:y + h, x:x + w], self.height[y:y + h, x:x + w], self.wear[y:y + h, x:x + w]
        p.fibre = self.fibre[y:y + h, x:x + w]
        p.w, p.h, p._g2 = w, h, None
        return p

    @property
    def ground(self):
        """Median colour of the sheet (what the QA coverage check compares against)."""
        return np.median(self.rgb.reshape(-1, 3), axis=0).astype(F32)


def creases(h, w, seed, s=1.0, n=3):
    """A few fold lines: HxW signed map, + on the lit side of each fold, - on the shadow side."""
    r = rng(seed, 'crease')
    out = np.zeros((h, w), F32)
    yy, xx = np.mgrid[0:h, 0:w].astype(F32)
    for i in range(n):
        if r.random() < 0.5:
            c = r.uniform(0.15, 0.85) * w
            d = xx - c - (value_noise(h, w, 500 * s, seed, 'cr', i) - 0.5) * 30 * s
        else:
            c = r.uniform(0.15, 0.85) * h
            d = yy - c - (value_noise(h, w, 500 * s, seed, 'cr', i) - 0.5) * 30 * s
        amp = r.uniform(0.25, 0.8)
        broken = smoothstep(0.25, 0.6, value_noise(h, w, 140 * s, seed, 'crb', i))
        out += amp * broken * (np.exp(-(d / (1.2 * s)) ** 2) * 0.9 - 0.35 * np.exp(-((d - 3 * s) / (4 * s)) ** 2))
    return out


def deckle_mask(h, w, seed=0, s=1.0, margin=None):
    """Alpha (HxW) of a sheet with a deckle edge: feathery, irregular, with stray fibres past the edge."""
    margin = margin if margin is not None else 26 * s
    yy, xx = np.mgrid[0:h, 0:w].astype(F32)
    edge = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy))
    n = fbm(h, w, 70 * s, seed, 'deckle', octaves=5, gain=0.6)
    n2 = grain(h, w, seed, 'deck2', sigma=1.0 * s)
    d = edge - margin * (0.25 + 1.1 * n) + n2 * 1.2 * s
    a = smoothstep(-2.5 * s, 3.0 * s, d)
    wisps = _fibres(h, w, seed, 2500 / s ** 2, 10 * s, 50 * s, 0.6, 1, 'deckle')
    a = np.maximum(a, np.clip(blur(wisps, 0.6 * s), 0, 1) * 0.5 * smoothstep(-14 * s, 0, d))
    return a.astype(F32)


def aged_ink(T, paper, strength=0.8):
    """Fade an ink layer where the paper is worn (gutter, corners, edges): time adds white. T must be paper-sized."""
    k = (1 - strength * paper.wear)[..., None]
    return (1 - (1 - T) * k).astype(F32)


# --------------------------------------------------------------------------------------------------------------------
# keying generated art onto our sheet

def estimate_ground(img, dark=False):
    """Estimate the plain ground of an image (the generated 'cream paper', or a dark ground): returns
    (colour (3,), field HxWx3) where field follows slow shading/vignetting of the source ground."""
    h, w = img.shape[:2]
    sm = cv2.resize(img, (max(16, w // 8), max(16, h // 8)), interpolation=cv2.INTER_AREA)
    L = luma(sm)
    # the ground is the most common tone among the brightest (or darkest) half, weighted to the border
    bh, bw = max(2, sm.shape[0] // 10), max(2, sm.shape[1] // 10)
    border = np.zeros(L.shape, bool)
    border[:bh] = border[-bh:] = True
    border[:, :bw] = border[:, -bw:] = True
    Lb = L[border]
    # the ground is the most common tone on the border (a plate's border is mostly bare ground)
    hist, edges = np.histogram(Lb, bins=40, range=(0.0, 1.0))
    hist = np.convolve(hist, [0.25, 0.5, 0.25], mode='same')
    k = int(np.argmax(hist))
    sel = border & (L >= edges[max(0, k - 1)]) & (L <= edges[min(40, k + 2)])
    col = np.median(sm[sel], axis=0).astype(F32)
    # field: normalised blur over pixels that look like ground
    dist = np.abs(sm - col[None, None]).max(axis=2)
    m = (dist < 0.07).astype(F32)
    m = cv2.erode(m, np.ones((3, 3), np.uint8))
    sig = max(sm.shape) / 10.0
    num = blur(sm * m[..., None], sig)
    den = blur(m, sig)[..., None]
    field = np.where(den > 0.02, num / np.maximum(den, 1e-4), col[None, None])
    conf = smoothstep(0.02, 0.2, den)
    field = field * conf + col[None, None] * (1 - conf)
    field = cv2.resize(field.astype(F32), (w, h), interpolation=cv2.INTER_CUBIC)
    return col, field


def key_paper(img, ground=None, lo=0.035, hi=0.13, feather=0.04, gain=1.0, despeckle=True, flat_field=True,
              neutral=1.0):
    """Key an image painted 'on cream paper' to an ink layer (transmittance, HxWx3) for OUR paper.

    Everything darker than the source paper becomes ink density; hue is kept, so coloured washes stay coloured.
    lo, hi     soft threshold on density: below lo is treated as source-paper texture and dropped, above hi kept whole
    feather    fraction of the short side over which the layer fades to bare paper at the image border (no rectangle)
    gain       >1 deepens the ink, <1 thins it
    ground     source paper colour (3,) if known; estimated from the image border otherwise
    neutral    0..1 keep grey ink grey when the source ground is strongly toned (aged silk); 0 = pure per-channel
    """
    img = img[..., :3].astype(F32)
    if ground is None or flat_field:
        col, field = estimate_ground(img)
        if ground is not None:
            field = field * (np.asarray(ground, F32) / np.maximum(col, 1e-3))[None, None]
    else:
        field = np.asarray(ground, F32)[None, None]
    T = np.clip(img / np.maximum(field, 1e-3), 0, 1)
    if neutral > 0:
        # on a strongly toned ground (old silk) dividing per channel turns grey ink blue: where the source pixel is
        # greyer than its ground, treat it as carbon ink and use the luminance ratio instead
        sg = (field.max(axis=2) - field.min(axis=2)) / np.maximum(field.max(axis=2), 1e-3)
        ss = (img.max(axis=2) - img.min(axis=2)) / np.maximum(img.max(axis=2), 1e-3)
        wn = np.clip(3.0 * (sg - ss) / np.maximum(sg, 1e-3), 0, 1) * smoothstep(0.10, 0.30, sg) * neutral
        Tl = np.clip(luma(img) / np.maximum(luma(field), 1e-3), 0, 1)
        Tg = np.power(np.clip(Tl, 1e-4, 1)[..., None], (INK_K / INK_K.mean())[None, None])
        T = T + (Tg - T) * wn[..., None]
    d = 1.0 - T.min(axis=2)
    if despeckle:                                     # judge "is this paper texture" on a slightly smoothed density
        d = np.maximum(blur(d, 1.2), d * 0.85)
    k = smoothstep(lo, hi, d)
    if feather > 0:
        h, w = d.shape
        yy, xx = np.mgrid[0:h, 0:w].astype(F32)
        e = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)) / (feather * min(h, w))
        k = k * smoothstep(0.0, 1.0, e)
    T = 1.0 - (1.0 - T) * k[..., None]
    if gain != 1.0:
        T = np.power(np.clip(T, 1e-4, 1), gain)
    return T.astype(F32)


def key_dark(img, ground=None, lo=0.03, hi=0.5, gamma=1.0):
    """Key a light element on a plain dark ground (mist, a lit figure) to straight-alpha RGBA."""
    img = img[..., :3].astype(F32)
    col, field = estimate_ground(img, dark=True)
    if ground is not None:
        field = np.asarray(ground, F32)[None, None] + field * 0
    diff = np.clip(img - field, 0, 1)
    a = smoothstep(lo, hi, diff.max(axis=2)) ** gamma
    rgb = np.clip(field + diff / np.maximum(a[..., None], 0.05), 0, 1)
    return np.dstack([rgb, a]).astype(F32)


def ink_to_rgba(T, colour=None):
    """Convert an ink layer to straight-alpha RGBA (for placing ink on a non-paper ground, e.g. pale ink on night).
    colour None keeps the ink's own colour."""
    a = 1.0 - T.min(axis=2)
    if colour is None:
        rgb = np.clip((T - (1 - a[..., None])) / np.maximum(a[..., None], 1e-3), 0, 1)
    else:
        rgb = np.broadcast_to(np.asarray(colour, F32), T.shape)
    return np.dstack([rgb, a]).astype(F32)
