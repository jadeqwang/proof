"""tools.ink.woodblock: the picture breaking the way print and paper break.

  woodblock mis-registration   separate() a frame into colour blocks, reprint() them a few px apart  (our RGB split)
  paper-cut slices             papercut(): strips cut with a knife, slid out of register, each with a paper shadow
  torn and re-pasted           torn(): the sheet torn across, the pieces stuck back not quite where they were

    frame = misregister(frame, t, tm.beats, amount=5, paper=paper.rgb, seed=3)      # offsets jump on every beat
    frame = papercut(frame, n=7, amount=60, key=beat_key(t, tm.beats), under=backing.rgb)
    frame = torn(frame, seed=2, offset=(14, -9), angle=1.2, under=backing.rgb)
"""
import bisect
import math

import cv2
import numpy as np

from .core import CINNABAR, F32, INDIGO, INK_K, OCHRE, blur, fbm, grain, rng, smoothstep, value_noise

PALETTE = {'ink': np.exp(-INK_K * 0.9).astype(F32), 'cinnabar': CINNABAR, 'indigo': INDIGO, 'ochre': OCHRE}
ORDER = ('ink', 'cinnabar', 'indigo', 'ochre')


def _k(colour):
    return -np.log(np.clip(np.asarray(colour, np.float64), 0.02, 0.98))


def separate(frame, paper, n=3, palette=None, thr=0.03, fast=True):
    """Split a frame into n printing blocks by non-negative unmixing in absorbance space
    (frame ~ paper * prod(exp(-d_i * k_i))): returns (densities [HxW]*n, names). Block 0 is the ink key block; then
    cinnabar, indigo, ochre. paper: Paper.rgb or a colour. palette: {name: rgb} to override the inks.
    Each marked pixel is explained by at most three inks (the best-fitting non-negative set).
    fast: unmix the colours at half size and solve the key block at full size from what they leave (3-4x quicker,
    the key block keeps every hair of dry brush). For a still frame, call this once in setup() and pass the result
    to misregister(blocks=...)."""
    pal = palette or PALETTE
    if fast and min(frame.shape[:2]) >= 400:
        h, w = frame.shape[:2]
        pp = paper if isinstance(paper, np.ndarray) else np.asarray(paper, F32)
        small = cv2.resize(frame, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
        ps = cv2.resize(pp, (w // 2, h // 2), interpolation=cv2.INTER_AREA) if pp.ndim == 3 else pp
        ds, names = separate(small, ps, n, palette, thr, fast=False)
        out = [cv2.resize(d, (w, h), interpolation=cv2.INTER_LINEAR) for d in ds]
        if pp.ndim == 1:
            pp = pp[None, None]
        A = -np.log(np.clip(frame / np.maximum(pp, 1e-3), 0.012, 1.0))
        for d, nm in zip(out[1:], names[1:]):
            A -= d[..., None] * _k(pal[nm]).astype(F32)[None, None]
        k0 = _k(pal[names[0]]).astype(F32)
        out[0] = np.maximum(A @ (k0 / float(k0 @ k0)), 0).astype(F32)
        return out, names
    names = [k for k in ORDER if k in pal][:n] if palette is None else list(pal)[:n]
    K = np.stack([_k(pal[k]) for k in names], 1)                 # 3 x n
    pp = paper if isinstance(paper, np.ndarray) else np.asarray(paper, F32)
    if pp.ndim == 1:
        pp = pp[None, None]
    A = -np.log(np.clip(frame / np.maximum(pp, 1e-3), 0.012, 1.0))
    H, W = A.shape[:2]
    sel = A.max(axis=2) > thr
    a = A[sel].astype(np.float32)                                 # N x 3
    N = len(a)
    best = np.zeros((N, len(names)), np.float32)
    err = np.full(N, np.inf, np.float32)
    idx = range(len(names))
    subsets = [(i,) for i in idx] + [(i, j) for i in idx for j in idx if i < j]
    subsets += [(i, j, k) for i in idx for j in idx for k in idx if i < j < k]
    for sub in subsets:
        Ks = K[:, sub]
        P = np.linalg.pinv(Ks).astype(np.float32)                 # m x 3
        Ks = Ks.astype(np.float32)
        d = a @ P.T
        ok = (d >= -1e-3).all(axis=1)
        r = a - d @ Ks.T
        e = (r * r).sum(axis=1) + 1e-4 * len(sub)                 # prefer fewer inks when equal
        take = ok & (e < err)
        err[take] = e[take]
        full = np.zeros((int(take.sum()), len(names)), np.float32)
        full[:, sub] = np.maximum(d[take], 0)
        best[take] = full
    out = []
    for i in range(len(names)):
        d = np.zeros((H, W), F32)
        d[sel] = best[:, i]
        out.append(d)
    return out, names


class _Tex:
    """Woodblock print texture for one frame size, built once."""

    def __init__(self, h, w, seed):
        self.h, self.w = h, w
        self.grainlines, self.starve = [], []
        for b in range(4):
            # wood grain: long streaks along the plank (each block is cut from a different plank, slightly skewed)
            g = fbm(max(8, h // 2), max(8, w // 24), 5, seed, 'wood', b, octaves=3)
            g = cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)
            ring = np.abs(np.sin((g * 34 + value_noise(h, w, 400, seed, 'ring', b) * 9) * math.pi))
            lines = smoothstep(0.20, 0.02, ring)                                       # thin pale lines where the grain is open
            st = fbm(h, w, 150, seed, 'pst', b, octaves=4)
            sp = grain(h, w, seed, 'psp', b, sigma=0.8)
            starve = smoothstep(0.56, 0.80, st) * (0.55 + 0.45 * smoothstep(-0.5, 1.2, sp))
            salt = smoothstep(1.9, 2.9, sp + (st - 0.5) * 2.4)                        # tiny unprinted flecks
            self.grainlines.append((lines * (0.35 + 0.6 * st)).astype(F32))
            self.starve.append(np.clip(starve * 0.6 + salt * 0.5, 0, 1).astype(F32))


_TEX = {}


def _tex(h, w, seed):
    key = (h, w, seed)
    if key not in _TEX:
        if len(_TEX) > 4:
            _TEX.clear()
        _TEX[key] = _Tex(h, w, seed)
    return _TEX[key]


def reprint(blocks, names, paper, offsets=None, angles=None, texture=1.0, squash=0.5, seed=0, palette=None,
            strength=None):
    """Print density blocks back onto paper, each from its own woodblock.

    blocks, names   from separate()
    paper           Paper.rgb (HxWx3) or a colour: what the blocks are printed on
    offsets         [(dx, dy)] px per block (None: all in register); angles: degrees per block, about the frame centre
    texture         0..1 woodblock character: grain lines, starved patches, flecks
    squash          0..1 ink squeezed to the edge of each printed shape (a darker rim, paler middle)
    strength        per-block density multipliers
    Returns the printed frame (HxWx3)."""
    pal = palette or PALETTE
    h, w = blocks[0].shape
    tx = _tex(h, w, seed) if texture > 0 else None
    A = np.zeros((h, w, 3), F32)
    for i, (d, nm) in enumerate(zip(blocks, names)):
        dx, dy = offsets[i] if offsets else (0.0, 0.0)
        ang = angles[i] if angles else 0.0
        if abs(dx) > 1e-3 or abs(dy) > 1e-3 or abs(ang) > 1e-4:
            M = cv2.getRotationMatrix2D((w / 2.0, h / 2.0), ang, 1.0)
            M[0, 2] += dx
            M[1, 2] += dy
            d = cv2.warpAffine(d, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        if squash > 0:
            sm = cv2.blur(d, (7, 7))
            d = d * (1 - 0.16 * squash) + np.clip(d - sm, 0, 1) * 0.9 * squash
        if tx is not None:
            j = i % 4
            d = d * (1 - texture * np.maximum(tx.starve[j], tx.grainlines[j]) * (0.85 if i else 0.6))
        if strength:
            d = d * strength[i]
        A += d[..., None] * _k(pal[nm]).astype(F32)[None, None]
    pp = paper if isinstance(paper, np.ndarray) else np.asarray(paper, F32)
    if pp.ndim == 1:
        pp = pp[None, None]
    return (pp * np.exp(-A)).astype(F32)


def beat_key(t, times):
    """Index of the most recent time in `times` at or before t (-1 before the first): the 'which beat' integer that
    makes per-beat jumps deterministic."""
    from .core import on_frame
    return bisect.bisect_right([on_frame(x) for x in times], t + 1e-9) - 1


def block_offsets(key, n, amount=4.0, rot=0.12, seed=0, key_block_still=True):
    """Deterministic per-block offsets and angles for a given beat key: ([(dx, dy)], [deg])."""
    offs, angs = [], []
    for i in range(n):
        r = rng(seed, 'misreg', int(key), i)
        if i == 0 and key_block_still:
            offs.append((float(r.normal(0, amount * 0.08)), float(r.normal(0, amount * 0.08))))
            angs.append(0.0)
            continue
        a = r.uniform(0, 2 * math.pi)
        m = amount * r.uniform(0.6, 1.0)
        offs.append((m * math.cos(a), m * math.sin(a) * 0.7))
        angs.append(float(r.normal(0, rot)))
    return offs, angs


def misregister(frame, t, beat_times, amount=4.0, paper=None, seed=0, n=3, split=0.4, hold=None, rot=0.12,
                texture=1.0, palette=None, blocks=None):
    """Woodblock mis-registration that jumps on every beat: the frame is separated into n blocks and reprinted with
    the colour blocks a few px out of register; new offsets on each time in beat_times (same beat, same offsets).

    amount   px of mis-registration (4-8 reads like a hand-printed sheet; 12+ is the loud version)
    paper    Paper.rgb or colour the frame sits on (estimated from the frame if None)
    split    share of the black key block also carried by each colour block, so a pure ink picture still shows
             cinnabar and indigo fringes when the blocks part (0 = only real colour areas move)
    blocks   a precomputed separate() result (blocks, names) for a frame that does not change: then `frame` is
             ignored and each call costs only the reprint
    hold     None: out of register all the time, re-jumping per beat; seconds: only for that long after each beat,
             then back in register (still printed, so the texture does not pop)
    """
    if paper is None:
        paper = np.percentile(frame[::8, ::8].reshape(-1, 3), 75, axis=0).astype(F32)
    blocks, names = separate(frame, paper, n, palette) if blocks is None else (list(blocks[0]), blocks[1])
    key = beat_key(t, beat_times)
    from .core import on_frame
    live = key >= 0 and (hold is None or (t - on_frame(beat_times[key])) < hold - 1e-9)
    offs, angs = block_offsets(key, len(blocks), amount if live else 0.0, rot if live else 0.0, seed)
    strength = None
    if split > 0 and len(blocks) > 1:
        kd = blocks[0]
        share = split / (len(blocks) - 1)
        kk = _k((palette or PALETTE)[names[0]]).mean()
        for i in range(1, len(blocks)):
            ki = _k((palette or PALETTE)[names[i]]).mean()
            blocks[i] = blocks[i] + kd * share * (kk / ki) * 1.6
        blocks[0] = kd * (1 - split * 0.75)
    return reprint(blocks, names, paper, offs, angs, texture, 0.5, seed, palette, strength)


# --------------------------------------------------------------------------------------------------------------------
# paper-cut slices

def _edge_colour(under):
    return np.array([0.95, 0.94, 0.90], F32)


def papercut(frame, n=7, axis='h', amount=50.0, key=0, seed=0, under=None, shadow=0.4, offsets=None, lift=3.0,
             gap=2.0, wobble=3.0):
    """Cut the frame into n strips with a knife and slide them out of register.

    axis      'h': horizontal strips sliding left/right; 'v': vertical strips sliding up/down
    amount    px of slide (each strip gets its own, deterministic in (seed, key)); offsets=[px]*n sets them yourself
    key       an integer that re-deals the slides (pass beat_key(t, beats) to jump per beat); the CUTS stay where
              they are for a given seed, as cuts would
    under     what lies beneath the strips (Paper.rgb, a frame, or a colour): seen in the gaps and where a strip
              has slid away from the frame edge. Default: a darker backing paper tone
    shadow    0..1 the small soft shadow each strip casts on what is under it; lift: its reach in px
    gap       px the strips also shift across their length, opening hairline gaps between them
    """
    if axis == 'v':
        u = None if not isinstance(under, np.ndarray) or under.ndim != 3 else np.ascontiguousarray(under.transpose(1, 0, 2))
        out = papercut(np.ascontiguousarray(frame.transpose(1, 0, 2)), n, 'h', amount, key, seed,
                       u if u is not None else under, shadow, offsets, lift, gap, wobble)
        return np.ascontiguousarray(out.transpose(1, 0, 2))
    h, w = frame.shape[:2]
    r = rng(seed, 'cuts', n)
    # cut lines: nearly straight, not quite parallel, with the small wander of a hand-held knife
    base = np.linspace(0, h, n + 1)[1:-1] + r.normal(0, h / n * 0.12, n - 1)
    x = np.arange(w, dtype=F32)
    cuts = [np.full(w, -1e4, F32)]
    for i, b in enumerate(base):
        slope = r.normal(0, 0.006)
        wv = (value_noise(1, w, 260, seed, 'cutw', i)[0] - 0.5) * 2 * wobble
        cuts.append((b + slope * (x - w / 2) + wv).astype(F32))
    cuts.append(np.full(w, 1e4, F32))
    rk = rng(seed, 'slide', int(key))
    if offsets is None:
        offsets = [float(rk.normal(0, 1) * amount * (1.0 if rk.random() < 0.7 else 0.25)) for _ in range(n)]
    dys = rk.normal(0, gap, n)
    if under is None:
        under = np.array([0.80, 0.76, 0.68], F32)
    out = (under.astype(F32).copy() if isinstance(under, np.ndarray) and under.ndim == 3
           else np.broadcast_to(np.asarray(under, F32), frame.shape).copy())
    yy = np.arange(h, dtype=F32)[:, None]
    order = np.argsort([abs(o) for o in offsets])                # the least-moved strips lie lowest
    for i in order:
        dx, dy = offsets[i], float(dys[i])
        y0 = int(max(0, math.floor(cuts[i].min() + dy) - lift * 3 - 2)) if i > 0 else 0
        y1 = int(min(h, math.ceil(cuts[i + 1].max() + dy) + lift * 3 + 3)) if i < n - 1 else h
        if y1 <= y0:
            continue
        M = np.array([[1, 0, dx], [0, 1, dy - y0]], np.float64)          # only this strip's rows are resampled
        src = cv2.warpAffine(frame, M, (w, y1 - y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
                             borderValue=(-1, -1, -1))
        inside = (src[..., 0] >= 0).astype(F32)                   # where the strip has paper (it slid off the edge elsewhere)
        top = np.interp(x - dx, x, cuts[i]).astype(F32)[None, :] + dy
        bot = np.interp(x - dx, x, cuts[i + 1]).astype(F32)[None, :] + dy
        ys = yy[y0:y1]
        m = np.clip(ys - top + 0.5, 0, 1) * np.clip(bot - ys + 0.5, 0, 1) * inside
        if shadow > 0:
            sh = blur(m, lift * 0.9)
            sh = np.roll(sh, (int(round(lift * 0.8)), int(round(lift * 0.5))), (0, 1))
            out[y0:y1] *= (1 - shadow * 0.55 * sh * (1 - m))[..., None] * np.array([1.0, 0.99, 0.97], F32) ** (sh[..., None])
        # the cut edge: the white core of the paper, a hair wide, brighter on the lit (upper) edge
        edge = np.clip(1 - np.abs(ys - top - 0.6) / 1.1, 0, 1) * 0.55 + np.clip(1 - np.abs(bot - ys - 0.6) / 1.1, 0, 1) * 0.25
        src = np.maximum(src, 0)
        src = src + (0.95 - src) * (edge * inside)[..., None] * 0.6
        out[y0:y1] = out[y0:y1] * (1 - m[..., None]) + src * m[..., None]
    return out.astype(F32)


# --------------------------------------------------------------------------------------------------------------------
# torn and re-pasted

def tear_field(h, w, seed=0, direction='v', pos=0.5, wander=0.10, rough=7.0):
    """Signed distance-like field (px) to a tear running across the sheet: negative on one piece, positive on the
    other. direction 'v' (top to bottom) or 'h'; pos: where it crosses (fraction); wander: how far it strays."""
    if direction == 'h':
        return tear_field(w, h, seed, 'v', pos, wander, rough).T.copy()
    y = np.arange(h, dtype=F32)
    path = pos * w + (value_noise(1, h, h * 0.45, seed, 'tearA')[0] - 0.5) * 2 * wander * w \
        + (value_noise(1, h, 70, seed, 'tearB')[0] - 0.5) * 34 + (value_noise(1, h, 9, seed, 'tearC')[0] - 0.5) * rough
    xx = np.arange(w, dtype=F32)[None, :]
    s = xx - path[:, None]
    return (s + (fbm(h, w, 14, seed, 'tearD', octaves=3) - 0.5) * rough * 1.6).astype(F32)


_TEAR = {}


def torn(frame, seed=0, offset=(12.0, -8.0), angle=1.0, direction='v', pos=0.5, wander=0.10, under=None,
         fibre=11.0, shadow=0.45, paste=0.5, amount=1.0):
    """Tear the sheet in two and paste it back not quite where it was.

    offset, angle   how far the second piece ended up from its true place (px, degrees); amount scales both (0..1,
                    so a tear can be animated opening: but it is meant to land in one frame on a hit)
    under           what the pieces are pasted onto (Paper.rgb / colour); shows in any gap
    fibre           px width of the torn edge: the white, feathery inner fibres of the paper exposed along the tear
    shadow          the upper piece's soft shadow on the lower; paste: the faint damp stain along the seam
    """
    h, w = frame.shape[:2]
    ck = (h, w, seed, direction, pos, wander)
    if ck not in _TEAR:
        if len(_TEAR) > 4:
            _TEAR.clear()
        fl = fbm(h, max(8, w // 5), 3, seed, 'tl', octaves=2)
        _TEAR[ck] = (tear_field(h, w, seed, direction, pos, wander), fbm(h, w, 5, seed, 'tf', octaves=3),
                     cv2.resize(fl, (w, h), interpolation=cv2.INTER_CUBIC),   # fibres pull out across the tear
                     0.5 + fbm(h, w, 60, seed, 'paste', octaves=2))
    s, fn, fl, pst = _TEAR[ck]
    band = fibre * (0.35 + 1.3 * fn)
    # piece A keeps its printed face right up to the tear and then shows a feathered white edge BEYOND it;
    # piece B lost that skin: its printed face ends early
    mA = smoothstep(band * 0.9, band * 0.9 - 3.0, s + (fl - 0.5) * fibre * 1.2)
    faceA = smoothstep(1.0, -1.0, s)
    white = np.array([0.955, 0.945, 0.915], F32)
    A = frame * faceA[..., None] + (white[None, None] * (0.93 + 0.1 * fl)[..., None]) * (1 - faceA[..., None])
    mB = smoothstep(-1.0, 1.0, s)
    dx, dy = offset[0] * amount, offset[1] * amount
    M = cv2.getRotationMatrix2D((w / 2.0, h / 2.0), angle * amount, 1.0)
    M[0, 2] += dx
    M[1, 2] += dy
    B = cv2.warpAffine(np.dstack([frame, mB]), M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
                       borderValue=(0, 0, 0, 0))
    mBw = B[..., 3]
    if under is None:
        under = np.array([0.80, 0.76, 0.68], F32)
    out = (under.astype(F32).copy() if isinstance(under, np.ndarray) and under.ndim == 3
           else np.broadcast_to(np.asarray(under, F32), frame.shape).copy())
    # piece B lies underneath; A's fibrous edge overlaps it
    if shadow > 0:
        shB = blur(mBw, 3.0)
        out *= (1 - 0.35 * shadow * shB * (1 - mBw))[..., None]
    out = out * (1 - mBw[..., None]) + B[..., :3] * mBw[..., None]
    if paste > 0:                                                         # damp from the paste along the seam
        seam = np.exp(-(s / (fibre * 2.6)) ** 2) * pst
        out *= 1 - (0.05 * paste * seam)[..., None] * np.array([0.7, 1.0, 1.5], F32)
    if shadow > 0:
        shA = np.roll(blur(mA, 2.6), (3, 2), (0, 1))
        out *= (1 - 0.5 * shadow * shA * (1 - mA))[..., None]
    out = out * (1 - mA[..., None]) + A * mA[..., None]
    return out.astype(F32)
