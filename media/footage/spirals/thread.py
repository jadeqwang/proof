"""The gold thread and its numerals: strokes precomputed as sparse coverage + arrival maps, so a frame at any time is a
threshold of the arrival (as frost thresholds its arrival map) and any frame renders alone.

A stroke is a centre line with width and pressure along it. For every pixel near it: coverage (from the distance to
the line and the local width), arrival (arc length fraction 0..1 at which the pen reaches it), and the tangent angle
there (for the leaf sheen). Gold: frost's world has gold pencil (tools/kf/comp.py: GOLD_LIGHT, GOLD_DARK, the lead
catching the tooth of the paper); here it is burnished a little toward leaf where the line turns across the light.
"""
import math
import os
import sys

import numpy as np
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
from tools.kf.comp import ADVANCE, GLYPHS  # noqa: E402  (the film's gold-pencil numerals, a careful child's hand)

F32 = np.float32
GOLD_LIGHT = np.array([0.76, 0.57, 0.20], F32)     # comp.py's gold pencil, light pressure
GOLD_DARK = np.array([0.50, 0.36, 0.12], F32)      # ... where the lead bit
GOLD_LEAF = np.array([0.93, 0.79, 0.43], F32)      # burnished: where the stroke runs across the light
GOLD_BRIGHT = np.array([1.00, 0.80, 0.18], F32)    # the line being drawn now (Jade, r2 review: "each line ... in bright gold, one at a time")
PAPER = np.array([0.925, 0.885, 0.795], F32)       # frost's paper (the clearance)
KEY_PAD = 1.4                                       # keyline: canvas px beyond the gold on each side
UMBER = np.array([0.30, 0.20, 0.08], F32)          # the keyline under the gold (as gold leaf is laid over a drawn line)
# 2026-11-26 (Jade, r3: "it would be nice if the gold was brighter/shimmery"): metallic gold for the bright lines when
# Gold(shimmer=...) is on: deeper at the edges of the line, saturated in the body, a specular streak down the middle,
# plus (animated) a glint that runs along each line and flecks that twinkle where the paper's tooth stands up.
GOLD_EDGE = np.array([0.62, 0.40, 0.06], F32)
GOLD_SPEC = np.array([1.00, 0.95, 0.74], F32)
WHITE = np.array([1.00, 0.99, 0.93], F32)
GLOW = np.array([1.00, 0.90, 0.52], F32)            # the light a glint spills past the edge of the line


def catmull(p, step):
    p = np.asarray(p, np.float64)
    if len(p) < 3:
        return resample(p, step)
    q = np.vstack([2 * p[0] - p[1], p, 2 * p[-1] - p[-2]])
    out = []
    for i in range(1, len(q) - 2):
        p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
        # centripetal-ish: parameter spacing by chord, avoids loops where anchors are uneven
        m = max(2, int(np.hypot(*(p2 - p1)) / max(step, 0.2)) + 1)
        t = np.linspace(0, 1, m, endpoint=False)[:, None]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t ** 2
                          + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(p[-1][None])
    return resample(np.vstack(out), step)


def resample(p, step):
    p = np.asarray(p, np.float64)
    d = np.hypot(*np.diff(p, axis=0).T)
    L = np.concatenate([[0], np.cumsum(d)])
    if L[-1] < 1e-6:
        return p[:1].copy()
    t = np.linspace(0, L[-1], max(2, int(L[-1] / step) + 1))
    return np.stack([np.interp(t, L, p[:, 0]), np.interp(t, L, p[:, 1])], 1)


def smooth_noise(n, wavelength, r):
    k = max(2, int(n / max(wavelength, 1.0)) + 3)
    c = r.uniform(-1, 1, k)
    x = np.linspace(0, k - 1.001, n)
    i = x.astype(int)
    f = x - i
    f = f * f * (3 - 2 * f)
    return c[i] * (1 - f) + c[np.minimum(i + 1, k - 1)] * f


class Stroke:
    """pts in canvas px (already supersampled). width in canvas px."""

    def __init__(self, pts, width, W, H, seed=0, wobble=0.5, taper=True, pressure=1.0, halo=0.0):
        r = np.random.default_rng(seed)
        p = resample(pts, 0.5)
        n = len(p)
        tan = np.gradient(p, axis=0)
        tan /= np.maximum(np.hypot(tan[:, 0], tan[:, 1]), 1e-6)[:, None]
        nor = np.stack([-tan[:, 1], tan[:, 0]], 1)
        if n > 8 and wobble > 0:                                   # the hand: a slow drift and a finer tremor
            off = 0.85 * smooth_noise(n, 140, r) + 0.25 * smooth_noise(n, 22, r)
            ends = np.minimum(np.arange(n), n - 1 - np.arange(n)) / 16.0
            p = p + nor * (off * wobble * np.clip(ends, 0.2, 1))[:, None]
        pr = pressure * (0.84 + 0.12 * smooth_noise(n, 110, r) + 0.06 * smooth_noise(n, 14, r))
        wd = np.full(n, float(width))
        if taper and n > 6:
            a = np.arange(n) * 0.5
            b = a[::-1]
            wd = wd * (0.55 + 0.45 * np.clip(b / (3 * width), 0, 1)) * (0.70 + 0.30 * np.clip(a / (1.5 * width), 0, 1))
            pr = pr * (0.75 + 0.25 * np.clip(b / (4 * width), 0, 1))
        wd = wd * (0.8 + 0.25 * pr / max(pressure, 1e-3))
        L = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(p, axis=0).T))])
        self.length = L[-1]
        u = L / max(L[-1], 1e-6)
        ang = np.arctan2(tan[:, 1], tan[:, 0])
        # pixels near the line
        pad = float(wd.max()) / 2 + 2 + max(KEY_PAD, halo)
        x0, y0 = int(max(0, math.floor(p[:, 0].min() - pad))), int(max(0, math.floor(p[:, 1].min() - pad)))
        x1, y1 = int(min(W, math.ceil(p[:, 0].max() + pad) + 1)), int(min(H, math.ceil(p[:, 1].max() + pad) + 1))
        if x1 <= x0 or y1 <= y0:
            self.idx = np.zeros(0, np.int64)
            self.cov = self.arr = self.ang = self.pr = self.key = self.halo = self.dn = self.dout = np.zeros(0, F32)
            self.gphase, self.path, self.Lc = 0.0, p, np.zeros(1)
            return
        tree = cKDTree(p)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        q = np.stack([xx.ravel() + 0.5, yy.ravel() + 0.5], 1)
        d, j = tree.query(q, k=1, distance_upper_bound=pad)
        ok = np.isfinite(d)
        d, j, q = d[ok], j[ok], q[ok]
        cov = np.clip(wd[j] / 2 - d + 0.5, 0, 1)
        keep = np.clip(wd[j] / 2 + max(KEY_PAD, halo) - d + 0.5, 0, 1) > 0.004
        self.idx = ((q[keep, 1] - 0.5).astype(np.int64) * W + (q[keep, 0] - 0.5).astype(np.int64))
        self.cov = cov[keep].astype(F32)
        self.dn = (d / np.maximum(wd[j] / 2, 1e-3))[keep].astype(F32)       # 0 on the centre line, 1 at the edge
        self.dout = np.maximum(d - wd[j] / 2, 0)[keep].astype(F32)          # canvas px outside the line's edge
        self.gphase = float(r.uniform())                                     # where this line's glint is at t = 0
        self.path, self.Lc = p, L                                            # for the twinkles (Gold.shimmer)
        self.arr = u[j[keep]].astype(F32)
        self.ang = ang[j[keep]].astype(F32)
        self.pr = np.clip(pr[j[keep]], 0.05, 1.3).astype(F32)
        kw = wd[j] / 2 + KEY_PAD
        kc = np.clip(kw - d + 0.5, 0, 1)
        self.key = kc[keep].astype(F32)
        # the engraver's clearance: a soft knock-out of the ground round a numeral, in paper colour
        self.halo = (np.clip((wd[j] / 2 + halo - d) / max(halo * 0.6, 1e-3), 0, 1)[keep] if halo > 0
                     else np.zeros(int(keep.sum()))).astype(F32)


def glyph_strokes(text, x, y, size, width, W, H, seed=0, ss=2, halo=0.0):
    """Numerals in the film's gold-pencil hand (comp.py GLYPHS). (x, y): centre of the text, canvas px.
    Returns a list of Strokes in writing order (each with its share of the writing time)."""
    r = np.random.default_rng(seed)
    widths = [ADVANCE.get(c, 0.76) * size for c in text]
    x = x - sum(widths) / 2 + size * 0.06
    y = y + size / 2
    out = []
    for c, adv in zip(text, widths):
        sc = size * r.uniform(0.95, 1.05)
        rot = math.radians(r.normal(0, 2.0))
        dy = r.normal(0, 0.02) * size
        ca, sa = math.cos(rot), math.sin(rot)
        for kind, pts in GLYPHS[c]:
            if kind == 'd':
                continue
            q = np.asarray(pts, np.float64) + r.normal(0, 0.012, (len(pts), 2))
            q = q - [0.31, 1.0]
            q = np.stack([q[:, 0] * ca - q[:, 1] * sa + 0.31, q[:, 0] * sa + q[:, 1] * ca], 1) * sc
            q = q + [x, y + dy]
            q = catmull(q, 0.5) if kind == 's' else resample(q, 0.5)
            out.append(Stroke(q, width, W, H, seed=int(r.integers(1 << 30)), wobble=0.25, taper=True, halo=halo))
        x += adv
    return out


class Gold:
    """All the gold of one clip. Items are (strokes, t0, t1, alpha_fn): strokes drawn one after another between t0
    and t1 (time shared by length), then shown with alpha_fn(t) (1 while drawing)."""

    def __init__(self, W, H, ss, seed=11, shimmer=None):
        """shimmer: None (the plain gold pencil and flat bright gold, as before), or a dict: glint (strength of the glint
        that runs along each bright line, 0..1), period (s between glints on one line), width (glint half-length, output
        px), fleck (strength of the twinkling flecks, 0..1), rate (twinkles per second per fleck)."""
        self.W, self.H, self.ss = W, H, ss
        self.shimmer = shimmer
        self.CW, self.CH = W * ss, H * ss
        r = np.random.default_rng(seed)
        # the paper's tooth, fixed: what the gold catches
        import cv2
        g1 = cv2.GaussianBlur(r.standard_normal((self.CH, self.CW)).astype(F32), (0, 0), 0.7 * ss)
        g2 = cv2.GaussianBlur(r.standard_normal((self.CH, self.CW)).astype(F32), (0, 0), 2.2 * ss)
        tooth = g1 / g1.std() * 0.5 + g2 / g2.std() * 0.6
        self.tooth = tooth.ravel()
        self.items = []
        if shimmer:                                     # each fleck (a tooth peak) gets its own twinkle phase, per 3-px cell
            cell = max(1, int(round(1.5 * ss)))
            ph = r.uniform(0, 1, (self.CH // cell + 1, self.CW // cell + 1)).astype(F32)
            self.fphase = np.repeat(np.repeat(ph, cell, 0), cell, 1)[:self.CH, :self.CW].ravel()
            self.fleck = np.clip((self.tooth - 1.25) / 0.5, 0, 1).astype(F32)

    def add(self, strokes, t0, t1, alpha_fn=None, ease=True, clear=False, bright_fn=None):
        """bright_fn(t) in 0..1: how far the stroke is lifted to bright gold (solid, untoothed, GOLD_BRIGHT)."""
        Ls = np.array([max(s.length, 1e-3) for s in strokes])
        c = np.concatenate([[0], np.cumsum(Ls)]) / Ls.sum()
        self.items.append(dict(strokes=strokes, t0=t0, t1=t1, c=c, alpha=alpha_fn, ease=ease, clear=clear,
                               bright=bright_fn))

    def _metal(self, s, sheen, t):
        """Metallic gold for one bright stroke at time t (see Gold.shimmer) -> (colour on the line, glow alpha round it).
        The glow (light spilling past the line's edge, in GLOW colour) is only there while a glint or a twinkle is."""
        sh, ss = self.shimmer, self.ss
        e = np.clip(s.dn, 0, 1) ** 2
        col = GOLD_BRIGHT[None] * (1 - e)[:, None] + GOLD_EDGE[None] * e[:, None]
        core = np.exp(-(s.dn / 0.42) ** 2)
        col = col + (GOLD_SPEC - col) * (0.50 * core * (0.55 + 0.45 * sheen))[:, None]
        lift = np.zeros(len(s.idx), F32)
        glow = np.zeros(len(s.idx), F32)
        if sh.get('glint', 0) > 0 and s.length > 0:       # a glint runs along the line, once every `period` seconds
            w = sh.get('width', 14.0) * ss
            span = s.length + 4 * w
            p = ((t / sh.get('period', 2.8) + s.gphase) % 1.0) * span - 2 * w
            g = sh['glint'] * np.exp(-((s.arr * s.length - p) / w) ** 2)
            lift += g * (0.35 + 0.65 * core)
            glow += g * np.exp(-(s.dout / (sh.get('glow_r', 2.2) * ss)) ** 2)
        if sh.get('fleck', 0) > 0 and s.length > 0:       # twinkles: small four-point stars at points along the line
            gap = sh.get('fleck_gap', 70.0) * ss
            n = max(1, int(s.length / gap))
            r = np.random.default_rng(int(s.gphase * 1e9) % (1 << 31))
            at = (np.arange(n) + r.uniform(0.2, 0.8, n)) * s.length / n
            ph = r.uniform(0, 1, n)
            tw = np.clip(np.sin(2 * math.pi * (t * sh.get('rate', 0.45) + ph)), 0, 1) ** 10
            on = tw > 0.02
            if on.any():
                xs = np.interp(at[on], s.Lc, s.path[:, 0])
                ys = np.interp(at[on], s.Lc, s.path[:, 1])
                px = (s.idx % self.CW).astype(F32) + 0.5
                py = (s.idx // self.CW).astype(F32) + 0.5
                arm, wid, rad = sh.get('star', 5.0) * ss, 0.45 * ss, 1.3 * ss
                for x_, y_, k_ in zip(xs, ys, tw[on]):
                    dx, dy = np.abs(px - x_), np.abs(py - y_)
                    st = np.exp(-(dx * dx + dy * dy) / (rad * rad)) \
                        + np.exp(-dx / arm - (dy / wid) ** 2) + np.exp(-dy / arm - (dx / wid) ** 2)
                    st = np.clip(st, 0, 1) * sh['fleck'] * k_
                    lift += st
                    glow += st
        lift = np.clip(lift, 0, 1)
        col = col + (WHITE - col) * lift[:, None]
        return col, np.clip(glow, 0, 1)

    def render(self, t):
        """-> (rgb premultiplied? no: straight colour (H, W, 3), alpha (H, W)) at output resolution."""
        A = np.zeros(self.CW * self.CH, F32)
        C = np.zeros((self.CW * self.CH, 3), F32)
        # clearances first (paper colour, under everything gold), as soon as the numeral begins
        for it in self.items:
            if t < it['t0'] or not it.get('clear'):
                continue
            fa = it['alpha'](t) if it['alpha'] else 1.0
            ramp = min(1.0, (t - it['t0']) / 0.25)
            for s in it['strokes']:
                if len(s.idx) == 0:
                    continue
                a = s.halo * 0.80 * ramp * fa
                old = A[s.idx]
                new = np.maximum(old, a)
                w = np.where(new > 0, (new - old) / np.maximum(new, 1e-6), 0)[:, None]
                C[s.idx] = C[s.idx] * (1 - w) + PAPER[None] * w
                A[s.idx] = new
        for it in self.items:
            if t < it['t0']:
                continue
            u = min(1.0, (t - it['t0']) / max(it['t1'] - it['t0'], 1e-6))
            if it['ease']:
                u = u * u * (3 - 2 * u) * 0.5 + u * 0.5                  # starts gently, keeps moving
            fa = it['alpha'](t) if it['alpha'] else 1.0
            if fa <= 0.002:
                continue
            br = float(it['bright'](t)) if it.get('bright') else 0.0
            for k, s in enumerate(it['strokes']):
                if u <= it['c'][k] or len(s.idx) == 0:
                    continue
                v = min(1.0, (u - it['c'][k]) / max(it['c'][k + 1] - it['c'][k], 1e-6))
                # the front: soft over half a pixel of arc
                front = np.clip((v - s.arr) * s.length / (0.6 * self.ss) + 0.5, 0, 1) if v < 1 else 1.0
                tooth = self.tooth[s.idx]
                take = np.clip((tooth + 0.4 + 1.6 * s.pr) / 1.6, 0, 1)
                a = s.cov * front * (0.30 + 0.70 * take) * (0.70 + 0.30 * s.pr) * fa
                # colour: pressure toward the darker lead; sheen where the line runs across the light
                sheen = np.abs(np.sin(s.ang - math.radians(-45))) ** 6
                k_dark = np.clip((s.pr - 0.85) * 2.5 + (0.5 - take) * 0.5, 0, 1)
                col = GOLD_LIGHT[None] + (GOLD_DARK - GOLD_LIGHT)[None] * k_dark[:, None]
                col = col + (GOLD_LEAF - col) * (0.55 * sheen * take)[:, None]
                if br > 0:                                              # the live line: solid bright gold
                    a = a + (s.cov * front * fa - a) * br
                    glow = None
                    if self.shimmer:
                        cb, glow = self._metal(s, sheen, t)
                    else:
                        cb = GOLD_BRIGHT[None] + (GOLD_LEAF - GOLD_BRIGHT)[None] * (0.35 * sheen)[:, None]
                    col = col + (cb - col) * br
                    if glow is not None:                                # light spilling past the edge: over the line
                        ga = glow * np.clip((v - s.arr) * s.length / (0.6 * self.ss) + 0.5, 0, 1) * fa * br
                        new_a = a + ga * (1 - a)
                        col = (col * a[:, None] + GLOW[None] * (ga * (1 - a))[:, None]) / np.maximum(new_a, 1e-6)[:, None]
                        a = new_a
                # the keyline first (faint umber, a little wider), then the gold over it
                ka = s.key * front * 0.42 * fa
                a_tot = a + ka * (1 - a)
                col = (col * a[:, None] + UMBER[None] * (ka * (1 - a))[:, None]) / np.maximum(a_tot, 1e-6)[:, None]
                a = a_tot
                # over: the gold (with its keyline) laid on whatever is there
                old = A[s.idx]
                new = a + old * (1 - a)
                C[s.idx] = (col * a[:, None] + C[s.idx] * (old * (1 - a))[:, None]) / np.maximum(new, 1e-6)[:, None]
                A[s.idx] = new
        A = A.reshape(self.CH, self.CW)
        C = C.reshape(self.CH, self.CW, 3)
        ss = self.ss
        Ad = A.reshape(self.H, ss, self.W, ss).mean((1, 3))
        Cp = (C * A[..., None]).reshape(self.H, ss, self.W, ss, 3).mean((1, 3))
        Cd = Cp / np.maximum(Ad, 1e-6)[..., None]
        return Cd.astype(F32), Ad.astype(F32)
