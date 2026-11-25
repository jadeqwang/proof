"""tools.ink.medium: the MEDIUM SWITCH (REVISION_V3 §2.4). On a measured chop the SAME frame is shown, clean and
full-frame, as another traditional medium for a held 3-6 frames, then back to ink:

    ink painting -> red paper-cut 剪纸 -> stone rubbing 拓片 (paper edge visible) -> leather shadow puppet 皮影 -> ink

    from tools.ink.medium import Mediums, pick_chops
    MED = Mediums(ctx.W, ctx.H, seed=3)                                  # setup()
    CHOPS = pick_chops(ctx.timing, ctx.t0, ctx.t1)                       # measured chops, thinned to <= 2 per bar
    frame = MED.switch(frame, t, CHOPS, paper=P.rgb)                     # render(): LAST step, after everything is drawn
    frame = MED.switch(frame, t, [(43.805, 'rubbing'), (44.385, 'papercut')], paper=P.rgb, hold=5)   # explicit media
    still = MED.papercut(frame, P.rgb); MED.rubbing(frame, P.rgb); MED.shadow(frame, P.rgb)          # one medium

Rules built in: a switch starts on the frame that CONTAINS the chop (floor rule), holds `hold` frames (default 4, never
fewer than 3), is a hard cut in and out, and every medium is one registered image: no offset doubles, no flicker.
`paper` = the bare sheet AS THE CAMERA SEES IT (Paper.rgb for a fixed sheet; the same view/crop of the bare paper under a
camera move), so paper fibre is not read as marks. For frames that are not ink-on-paper (carved rock, lit rooms) pass
`mask=` (HxW, 0..1 = mark) instead. Costs at 1080p, one core: papercut ~60 ms, rubbing ~110 ms, shadow ~70 ms.
"""
import math

import cv2
import numpy as np

from .core import F32, FPS, blur, fbm, grain, hit_frame, on_frame, smoothstep
from .paper import Paper
from .rubbing import Rubbing

ORDER = ('papercut', 'rubbing', 'shadow')
CUT_RED = np.array([0.74, 0.115, 0.085], F32)          # flat cinnabar paper
AMBER = np.array([0.99, 0.74, 0.34], F32)              # lamp behind the screen
HIDE_DARK = np.array([0.16, 0.075, 0.035], F32)        # thick dyed hide against the light


def pick_chops(timing, t0, t1, kinds=('chop',), max_per_bar=2, min_gap=8, extra=()):
    """Measured chop times in [t0, t1) thinned for the medium switch: at most `max_per_bar` per bar and at least
    `min_gap` frames apart (so a held switch never runs into the next). `extra` = more measured times to consider.
    Chop clusters and their members collapse to one time. Returns sorted floats."""
    ts = set(float(x) for x in extra)
    for k in kinds:
        for h in timing.hits(k, t0, t1):
            ts.add(float(h['t']))
    out, per_bar = [], {}
    for x in sorted(ts):
        if not (t0 <= x < t1):
            continue
        if out and hit_frame(x) - hit_frame(out[-1]) < min_gap:
            continue
        try:
            bar = int(timing.beat_index(x)) // 4
        except Exception:
            bar = int(x // 1.75)
        if per_bar.get(bar, 0) >= max_per_bar:
            continue
        per_bar[bar] = per_bar.get(bar, 0) + 1
        out.append(x)
    return out


def medium_at(t, chops, hold=4, order=ORDER):
    """Which medium (name) shows at song time t, or None for the ink original. `chops` = times, or (time, medium)
    pairs. The k-th chop takes order[k % len(order)]."""
    hold = max(3, int(hold))
    f = hit_frame(t)
    for k, c in enumerate(chops):
        tc, name = (c[0], c[1]) if isinstance(c, (tuple, list)) else (c, order[k % len(order)])
        f0 = hit_frame(tc)
        if f0 <= f < f0 + hold:
            return name
    return None


class Mediums:
    """Precomputed grounds for the three media at one frame size (build once in setup; workers share it)."""

    def __init__(self, w, h, seed=0, margin=0.035):
        self.w, self.h, self.seed = int(w), int(h), seed
        s = w / 1920.0
        self.s = s
        self.rub = Rubbing(w, h, seed=seed)
        yy, xx = np.mgrid[0:h, 0:w].astype(F32)
        # --- rubbing: the inked area stops short of the sheet's edge; ragged pad dabs along it, bare paper beyond
        m = margin * h
        d = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy))
        rag = (fbm(h, w, 46 * s, seed, 'rub_edge', octaves=3) - 0.5) * 2.0 * m * 0.55 \
            + (fbm(h, w, 9 * s, seed, 'rub_edge2', octaves=2) - 0.5) * 2.0 * m * 0.10
        self.rub_in = smoothstep(-1.5 * s, 1.5 * s, d - m + rag).astype(F32)            # 1 = inside the inked area
        fine = grain(h, w, seed, 'rub_sheet', sigma=0.8)
        sheet = np.array([0.905, 0.885, 0.825], F32)[None, None] * (1 + 0.035 * (fbm(h, w, 90 * s, seed, 'rs') - 0.5)
                                                                      + 0.012 * fine)[..., None]
        soot = smoothstep(m * 1.6, 0.0, d - m + rag) * 0.10 * smoothstep(0.35, 0.8, fbm(h, w, 14 * s, seed, 'soot'))
        self.rub_sheet = np.clip(sheet * (1 - soot[..., None]), 0, 1).astype(F32)
        # --- paper-cut: the red sheet's own fibre and a faint knife-burr light along cut edges
        self.cut_tex = (1 + 0.05 * (fbm(h, w, 70 * s, seed, 'cut', octaves=3) - 0.5) + 0.02 * fine).astype(F32)
        # --- shadow screen: stretched cloth lit from behind by one lamp; warm, brightest behind the middle
        r = np.hypot((xx - 0.5 * w) / (0.78 * w), (yy - 0.46 * h) / (0.95 * h))
        lamp = 0.52 + 0.48 * np.exp(-(r / 0.62) ** 2)
        weave = 1 + 0.018 * np.sin(xx * (2 * math.pi / (5.0 * s))) * np.sin(yy * (2 * math.pi / (5.0 * s))) + 0.015 * fine
        cloth = 1 + 0.05 * (fbm(h, w, 120 * s, seed, 'cloth', octaves=3) - 0.5)
        self.screen = np.clip(AMBER[None, None] * (lamp * weave * cloth)[..., None], 0, 0.985).astype(F32)

    # -- marks ---------------------------------------------------------------------------------------------------------
    def density(self, frame, paper=None, mask=None):
        """Ink density 0..1 of each pixel relative to the sheet (or the given mask)."""
        if mask is not None:
            return np.clip(np.asarray(mask, F32), 0, 1)
        if paper is None:
            paper = np.percentile(frame[::8, ::8].reshape(-1, 3), 75, axis=0).astype(F32)
        pp = np.asarray(paper, F32)
        if pp.ndim == 1:
            pp = pp[None, None]
        return 1.0 - np.clip(frame / np.maximum(pp, 1e-3), 0, 1).min(axis=2)

    def _cut(self, d, lo, soft):
        """A knife-cut silhouette of the marks: smoothed outline, crisp 1 px edge, specks dropped."""
        g = blur(d, soft * self.s)
        return smoothstep(lo - 0.02, lo + 0.02, g)

    # -- the three media -----------------------------------------------------------------------------------------------
    def papercut(self, frame, paper=None, mask=None, lo=0.16, colour=CUT_RED):
        """Red paper-cut 剪纸: every mark becomes ONE flat sheet of cinnabar paper, knife-cut, lying on the page.
        Pale washes inside a figure are cut away (the paper shows through), dark ink stays red."""
        d = self.density(frame, paper, mask)
        a = self._cut(d, lo, 1.3)
        # 阴刻: the drawing's own dark lines inside a figure are knife cuts that let the page through
        mean_in = blur(d * a, 9.0 * self.s) / np.maximum(blur(a, 9.0 * self.s), 1e-3)
        line = smoothstep(0.10, 0.16, blur(d, 1.0 * self.s) - mean_in)
        inner = smoothstep(0.90, 0.99, blur(a, 6.0 * self.s))                     # only well inside a broad shape
        a = a * (1 - line * inner)
        base = paper if (paper is not None and np.ndim(paper) == 3) else np.broadcast_to(
            np.asarray(paper if paper is not None else (0.93, 0.9, 0.82), F32), frame.shape)
        base = np.asarray(base, F32) * 1.0
        # the cut sheet lies on the page: a hair of contact shadow directly under its edge (no offset image)
        sh = np.clip(blur(a, 2.2 * self.s) - a, 0, 1) * 0.22
        out = base * (1 - sh[..., None])
        red = colour[None, None] * self.cut_tex[..., None]
        burr = np.clip(a - blur(a, 1.2 * self.s), 0, 1) * 0.35                      # the cut edge catches light
        red = np.clip(red * (1 + burr[..., None]), 0, 1)
        return (out + (red - out) * a[..., None]).astype(F32)

    def rubbing(self, frame, paper=None, mask=None, lo=0.10, hi=0.42):
        """Stone rubbing 拓片: marks bare, ground pad-inked black, on a sheet whose un-inked edge is in frame."""
        if mask is not None:
            T = 1.0 - np.clip(np.asarray(mask, F32), 0, 1)[..., None] * np.ones((1, 1, 3), F32)
            r = self.rub.apply(T, None, is_ink=True, lo=lo, hi=hi)
        else:
            r = self.rub.apply(frame, paper, lo=lo, hi=hi)
        k = self.rub_in[..., None]
        return (self.rub_sheet + (r - self.rub_sheet) * k).astype(F32)

    def shadow(self, frame, paper=None, mask=None, lo=0.12, dye=0.55):
        """Leather shadow puppet 皮影: the marks as translucent dyed hide against an amber back-lit screen. Dark ink
        = thick hide (near black-brown); coloured washes keep their hue as dye; pale interior lines are knife cuts
        that let the lamp through."""
        d = self.density(frame, paper, mask)
        a = self._cut(d, lo, 1.1)
        thick = smoothstep(0.25, 0.75, blur(d, 0.8 * self.s))
        if mask is None:
            # hue of the mark (its colour with the paper divided out), saturated: the dye
            pp = np.asarray(paper if paper is not None else np.percentile(frame[::8, ::8].reshape(-1, 3), 75, axis=0),
                            F32)
            if pp.ndim == 1:
                pp = pp[None, None]
            T = np.clip(frame / np.maximum(pp, 1e-3), 0.02, 1)
            mx = T.max(axis=2, keepdims=True)
            hue = np.clip(T / np.maximum(mx, 1e-3), 0, 1) ** 2.2                   # 1,1,1 for grey ink
            sat = 1.0 - hue.min(axis=2)
            dyeT = 1 - (1 - hue) * dye * smoothstep(0.08, 0.4, sat)[..., None]
        else:
            dyeT = np.ones(frame.shape, F32)
        hide = 1 - (1 - HIDE_DARK[None, None]) * (0.55 + 0.45 * thick)[..., None]
        T = 1 - a[..., None] * (1 - hide * dyeT)
        rim = np.clip(blur(a, 1.4 * self.s) - a, -1, 0) * -0.25                    # the hide's edge is darkest
        out = self.screen * T * (1 - (rim * a)[..., None])
        return np.clip(out, 0, 0.985).astype(F32)

    def render(self, name, frame, paper=None, mask=None, **kw):
        return {'papercut': self.papercut, 'rubbing': self.rubbing, 'shadow': self.shadow}[name](frame, paper, mask,
                                                                                                  **kw)

    def switch(self, frame, t, chops, paper=None, mask=None, hold=4, order=ORDER):
        """The whole device: returns `frame` untouched unless t falls in a held switch after a chop."""
        name = medium_at(t, chops, hold, order)
        if name is None:
            return frame
        return self.render(name, frame, paper, mask)
