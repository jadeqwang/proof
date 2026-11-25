"""tools.ink.rubbing: the rubbing flip 拓片. Any frame becomes its rubbing: the marks stay bare paper, the ground is
dabbed black. This is the film's "invert", cut in hard on breakbeat chops.

    rb = Rubbing(1920, 1080, seed=4)                     # once, in setup()
    if flip_on(t, tm.hit_times('chop', t0, t1), hold=2 / 24):
        frame = rb.apply(frame, paper=paper.rgb)         # paper: the sheet the frame was painted on
"""
import bisect

import cv2
import numpy as np

from .core import F32, blur, fbm, grain, smoothstep
from .paper import Paper, creases


class Rubbing:
    """Precomputed rubbing ground for one frame size. apply() is a handful of array ops per frame.

    seed       the sheet (dab pattern, creases); same seed, same rubbing every frame: stable, no boiling
    bare       colour of the un-inked paper showing in the marks (thin rubbing paper: a slightly grey cream)
    """

    def __init__(self, w, h, seed=0, scale=1.0, bare=(0.87, 0.85, 0.79), ground=None):
        self.w, self.h, self.seed = int(w), int(h), seed
        g = ground if ground is not None else Paper(w, h, 'rubbing', seed=seed, scale=scale)
        self.ground = g.rgb
        s = scale
        # the bare paper inside the marks: thin, a little grey, lightly smudged by the pad, creased with the rest
        mott = fbm(h, w, 60 * s, seed, 'bare', octaves=3)
        fine = grain(h, w, seed, 'bfine', sigma=0.7)
        smudge = smoothstep(0.5, 0.95, fbm(h, w, 70 * s, seed, 'smudge', octaves=2)) * 0.10
        b = np.asarray(bare, F32)[None, None] * (1 + 0.05 * (mott - 0.5) + 0.018 * fine - smudge)[..., None]
        b = b + ((g.height - 0.5) * 0.05)[..., None]
        self.bare = np.clip(b + creases(h, w, seed, s)[..., None] * 0.05, 0, 1).astype(F32)
        # how readily the pad reaches each spot: breaks up the edges of marks and leaves soot in shallow ones
        self.tooth = (0.5 * fine + 0.9 * (fbm(h, w, 9 * s, seed, 'tooth', octaves=3) - 0.5)
                      + 1.4 * (0.5 - g.height)).astype(F32) * 0.16
        self.diff = self.bare - self.ground

    def mask(self, frame, paper=None, is_ink=False, lo=0.10, hi=0.42):
        """How strongly each pixel is a 'mark' (0..1): its ink density relative to the paper it sits on."""
        if is_ink:
            d = 1.0 - frame.min(axis=2)
        else:
            if paper is None:
                paper = np.percentile(frame[::8, ::8].reshape(-1, 3), 75, axis=0).astype(F32)
            pp = paper if isinstance(paper, np.ndarray) else np.asarray(paper, F32)
            if pp.ndim == 1:
                pp = pp[None, None]
            d = 1.0 - np.clip(frame / np.maximum(pp, 1e-3), 0, 1).min(axis=2)
        return smoothstep(lo, hi, d + self.tooth * smoothstep(0.02, 0.3, d))

    def apply(self, frame, paper=None, is_ink=False, lo=0.10, hi=0.42, amount=1.0):
        """Return the rubbing of `frame` (HxWx3). paper: the Paper.rgb (or a colour) the frame was made on, so its
        texture is not mistaken for marks; is_ink=True if `frame` is an ink transmittance layer instead.
        amount < 1 cross-fades (normally leave at 1: the flip is a hard cut)."""
        m = self.mask(frame, paper, is_ink, lo, hi)
        out = self.ground + self.diff * m[..., None]
        if amount < 1.0:
            base = frame if not is_ink else (paper * frame)
            out = base + (out - base) * amount
        return out.astype(F32)


_CACHE = {}


def rubbing(frame, paper=None, seed=0, is_ink=False, **kw):
    """One-call form: rubbing of a frame (or of an ink layer with is_ink=True). The ground for each (size, seed) is
    built once and reused, so calling this per frame is cheap after the first."""
    h, w = frame.shape[:2]
    key = (w, h, seed)
    if key not in _CACHE:
        _CACHE[key] = Rubbing(w, h, seed)
    return _CACHE[key].apply(frame, paper, is_ink, **kw)


def flip_on(t, times, hold=2 / 24, mode='hold'):
    """Should the picture be flipped to its rubbing at time t?
    mode 'hold':   True for `hold` seconds after each time in `times` (a flash on each chop)
    mode 'toggle': each time flips the state and it stays until the next (page / rubbing / page ...)"""
    from .core import on_frame
    times = [on_frame(x) for x in times]          # the flip shows on the frame that contains the chop
    i = bisect.bisect_right(times, t + 1e-9)
    if i == 0:
        return False
    if mode == 'toggle':
        return i % 2 == 1
    return (t - times[i - 1]) < hold - 1e-9
