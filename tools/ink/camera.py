"""tools.ink.camera: the multiplane camera. A canvas larger than the frame, layers at depths, three moves.

    sc = Scene(4000, 2250, paper=Paper(4000, 2250, 'new', seed=1))
    sc.add(T_far,  depth=3.0)                       # ink layer, canvas-sized or placed with pos=(x, y)
    sc.mist(y0=900, y1=1300, depth=2.0, drift=-12)  # a band of BARE PAPER between planes, drifting 12 px/s leftward
    sc.add(T_near, depth=1.0, occlude=True)         # near rock hides what is behind it
    cam = Camera.push_in(t0, t1, start=(2000, 1125, 0.48), end=(900, 1500, 1.6))
    frame = sc.render(t, cam, (1920, 1080))

Depth: 1.0 is the paper plane the camera is focused on (zoom applies to it exactly). Depth > 1 is farther (moves and
grows more slowly), < 1 nearer. Layers line up as authored when the camera is at the scene `home` (default: canvas centre).
"""
import math

import cv2
import numpy as np

from .core import F32, blur, ease, fbm, smoothstep, value_noise


class Camera:
    """Keyframed camera: keys = [(t, cx, cy, zoom), ...] in canvas px; zoom 1.0 = one canvas px per frame px
    (at a 1920-wide frame; other frame sizes scale automatically). Each segment is eased (per-key ease optional as a
    5th tuple item). Outside the keys the camera holds."""

    def __init__(self, keys, ease_kind='inout', frame_w=1920):
        self.keys = sorted([tuple(k) for k in keys], key=lambda k: k[0])
        self.ease_kind, self.frame_w = ease_kind, frame_w
        self.shakes = []

    @classmethod
    def hold(cls, cx, cy, zoom=1.0):
        return cls([(0.0, cx, cy, zoom)])

    @classmethod
    def push_in(cls, t0, t1, start, end, ease_kind='inout'):
        """Entering the story. start/end = (cx, cy, zoom)."""
        return cls([(t0, *start), (t1, *end)], ease_kind)

    pull_back = push_in                              # scale revealed: same thing with end zoom < start zoom

    @classmethod
    def travel(cls, t0, t1, x_from, x_to, cy, zoom=1.0, ease_kind='sine'):
        """Time passing: handscrolls are read right to left, so x_from > x_to."""
        return cls([(t0, x_from, cy, zoom), (t1, x_to, cy, zoom)], ease_kind)

    def shake(self, t_hit, amp=6.0, dur=0.25, seed=0, freq=17.0):
        """Add a decaying shake at t_hit (a seal slamming down). amp in frame px."""
        self.shakes.append((t_hit, amp, dur, seed, freq))
        return self

    def at(self, t):
        ks = self.keys
        if t <= ks[0][0]:
            cx, cy, z = ks[0][1:4]
        elif t >= ks[-1][0]:
            cx, cy, z = ks[-1][1:4]
        else:
            for a, b in zip(ks, ks[1:]):
                if a[0] <= t <= b[0]:
                    kind = b[4] if len(b) > 4 else self.ease_kind
                    u = ease((t - a[0]) / max(b[0] - a[0], 1e-9), kind)
                    # zoom interpolates in log space so a push feels constant-speed; position follows the zoom so the
                    # target point moves on a straight line on screen
                    z = math.exp(math.log(a[3]) + (math.log(b[3]) - math.log(a[3])) * u)
                    if abs(b[3] - a[3]) > 1e-6:
                        v = (1 / a[3] - 1 / z) / (1 / a[3] - 1 / b[3])
                    else:
                        v = u
                    cx, cy = a[1] + (b[1] - a[1]) * v, a[2] + (b[2] - a[2]) * v
                    break
        sx = sy = 0.0
        for t_hit, amp, dur, seed, freq in self.shakes:
            d = t - math.floor(t_hit * 24 + 1e-6) / 24 + 1e-9        # starts on the frame containing the hit
            if 0 <= d < dur:
                k = amp * (1 - d / dur) ** 2
                sx += k * math.sin(d * freq * 2 * math.pi + seed * 1.7)
                sy += k * math.cos(d * freq * 2 * math.pi * 1.31 + seed * 0.9)
        return cx, cy, z, sx, sy


class _Mips:
    def __init__(self, img):
        self.levels = [np.ascontiguousarray(img)]

    def get(self, n):
        while len(self.levels) <= n:
            a = self.levels[-1]
            if min(a.shape[:2]) < 4:
                break
            self.levels.append(cv2.resize(a, (max(1, a.shape[1] // 2), max(1, a.shape[0] // 2)),
                                          interpolation=cv2.INTER_AREA))
        return self.levels[min(n, len(self.levels) - 1)], min(n, len(self.levels) - 1)


def sample(src, M, W, H, fill, mips=None, sharp=True):
    """Resample `src` into a W x H frame through the 2x3 affine M (src px -> frame px) with a mip pyramid:
    trilinear when shrinking (no shimmer on fine lines), cubic near 1:1 and when enlarging."""
    s = math.sqrt(abs(M[0, 0] * M[1, 1] - M[0, 1] * M[1, 0]))
    c = src.shape[2] if src.ndim == 3 else 1
    bv = (float(fill),) * c
    mips = mips or _Mips(src)

    def warp(level, interp):
        img, lv = mips.get(level)
        k = 2.0 ** lv
        A = M.copy()
        A[:, :2] *= k
        A[:, 2] += (M[:, 0] + M[:, 1]) * (k - 1) / 2.0           # pixel-centre correction for the halved grid
        return cv2.warpAffine(img, A, (W, H), flags=interp, borderMode=cv2.BORDER_CONSTANT, borderValue=bv)

    if s >= 0.85:
        return warp(0, cv2.INTER_CUBIC if sharp else cv2.INTER_LINEAR)
    lod = math.log2(1.0 / s)
    l0 = int(math.floor(lod))
    f = lod - l0
    a = warp(l0, cv2.INTER_LINEAR)
    if f < 0.04:
        return a
    b = warp(l0 + 1, cv2.INTER_LINEAR)
    return cv2.addWeighted(a, 1 - f, b, f, 0)


def mist_band(w, h, y0, y1, seed=0, softness=0.35, wisp=0.55, cell=None):
    """An opacity mask (HxW 0..1) for a band of mist between y0 and y1: soft top and bottom, wispy inside.
    Mist is bare paper: wherever this mask is 1 the ink behind it is gone. Tileable in x is not needed: the Scene
    drifts it by resampling with wrap."""
    cell = cell or (y1 - y0) * 1.6
    yy = np.arange(h, dtype=F32)[:, None]
    mid, half = (y0 + y1) / 2.0, (y1 - y0) / 2.0
    n = fbm(h, max(8, w // 3), cell / 3.0, seed, 'mist', octaves=4)
    n = cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC)                 # stretched: long horizontal wisps
    n2 = fbm(h, w, cell * 2.5, seed, 'mist2', octaves=2)
    edge = (np.abs(yy - mid) / half)                                           # 0 centre, 1 edge
    edge = edge + (n2 - 0.5) * 0.9
    body = smoothstep(1.0, 1.0 - 2 * softness, edge)
    a = body * (1 - wisp + wisp * smoothstep(0.25, 0.75, n + (0.5 - edge) * 0.5))
    return np.clip(a, 0, 1).astype(F32)


class Scene:
    """A stack of layers on a canvas, rendered through a Camera.

    add(src, depth, pos, kind, occlude, opacity, home, name, fade)
        src      array or callable t -> array. ink (HxWx3 transmittance), rgba (HxWx4), 'frame' (opaque HxWx3) or
                 'erase' (HxW alpha, or RGBA whose alpha is used: bare paper where it is 1, e.g. a keyed mist clip)
        depth    1.0 = paper plane; >1 farther, <1 nearer
        pos      (x, y) canvas position of the layer's top-left (default 0, 0)
        occlude  ink only: True makes the layer hide what is behind it (bare paper shows where it is not inked,
                 inside its own silhouette); a float 0..1 sets how strongly; an HxW mask gives the body explicitly
        opacity  number or callable t -> number
    mist(y0, y1, depth, drift, ...)   a drifting band of bare paper at that depth
    """

    def __init__(self, w, h, paper=None, home=None):
        self.w, self.h, self.paper = int(w), int(h), paper
        self.home = home or (self.w / 2.0, self.h / 2.0)
        self.layers = []
        self._paper_mips = _Mips(paper.rgb) if paper is not None else None

    def add(self, src, depth=1.0, pos=(0, 0), kind=None, occlude=False, opacity=1.0, home=None, name=None, scale=1.0):
        L = dict(src=src, depth=float(depth), pos=pos, kind=kind, occlude=occlude, opacity=opacity,
                 home=home or self.home, name=name, scale=float(scale), mips=None, body=None)
        if not callable(src):
            if kind is None:
                L['kind'] = 'erase' if src.ndim == 2 else ('rgba' if src.shape[2] == 4 else 'ink')
            L['mips'] = _Mips(src)
            if L['kind'] == 'ink' and occlude is not False:
                L['body'] = _Mips(self._body(src, occlude))
        else:
            assert kind, 'give kind= for callable layers'
        self.layers.append(L)
        return L

    def mist(self, y0, y1, depth=1.5, drift=-10.0, opacity=1.0, seed=0, softness=0.35, wisp=0.55, name=None):
        """A band of bare paper across the canvas between y0 and y1 (canvas px), drifting `drift` px/s."""
        pad = 200
        B = 400                                                       # cross-fade the ends so the drift loops
        m = mist_band(self.w + 2 * pad + B, int(y1 - y0 + 2 * pad), pad, y1 - y0 + pad, seed, softness, wisp)
        r = np.linspace(0, 1, B, dtype=F32)[None, :]
        m[:, :B] = m[:, -B:] * (1 - r) + m[:, :B] * r
        m = np.ascontiguousarray(m[:, :-B])
        L = dict(src=m, depth=float(depth), pos=(-pad, int(y0 - pad)), kind='mist', occlude=False, opacity=opacity,
                 home=self.home, name=name or 'mist', scale=1.0, mips=_Mips(m), body=None, drift=float(drift))
        self.layers.append(L)
        return L

    @staticmethod
    def _body(T, occlude):
        d = 1.0 - T.min(axis=2)
        if isinstance(occlude, np.ndarray):
            return occlude.astype(F32)
        k = 1.0 if occlude is True else float(occlude)
        # the body of a painted form: its ink, closed over small gaps, so pale interior washes still hide the far plane
        r = max(3, int(min(T.shape[:2]) / 60)) | 1
        m = cv2.morphologyEx((d > 0.06).astype(F32), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r)))
        m = blur(m, r / 3.0)
        return np.clip(np.maximum(m, smoothstep(0.03, 0.25, d)) * k, 0, 1).astype(F32)

    def layer_matrix(self, L, cam_state, W, H, t=0.0):
        """Affine from layer px to frame px for the given camera state, or None if the layer is behind the camera."""
        cx, cy, zoom, sx, sy = cam_state
        fs = W / 1920.0
        d = L['depth']
        dz = 1.0 - 1.0 / zoom                        # how far the camera has advanced toward the paper plane
        if d - dz <= 0.02:
            return None
        zd = d / (d - dz) * fs
        hx, hy = L['home']
        px, py = L['pos']
        s = L['scale']
        ox = px - hx - (cx - hx) / d + (L.get('drift', 0.0) * t if L['kind'] != 'mist' else 0.0)
        oy = py - hy - (cy - hy) / d
        M = np.array([[zd * s, 0, zd * ox + W / 2.0 + sx * fs], [0, zd * s, zd * oy + H / 2.0 + sy * fs]], np.float64)
        return M

    def render(self, t, cam, size=(1920, 1080), base=None, only=None):
        """Render the scene at time t. base: an opaque frame to start from instead of the paper (already in frame
        space). Returns a float32 HxWx3 frame."""
        W, H = size
        st = cam.at(t) if hasattr(cam, 'at') else cam
        if base is not None:
            frame = base.astype(F32).copy()
            pv = frame.copy()
        else:
            P = dict(src=None, depth=1.0, pos=(0, 0), home=self.home, scale=1.0, kind='paper')
            M = self.layer_matrix(P, st, W, H)
            pv = cv2.warpAffine(*self._paper_level(M), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            if getattr(self.paper, 'breathe', 0) > 0:
                pv = pv * self.paper_breath(t, W, H)
            frame = pv.copy()
        for L in sorted(self.layers, key=lambda l: -l['depth']):
            if only and L['name'] not in only:
                continue
            op = L['opacity'](t) if callable(L['opacity']) else L['opacity']
            if op <= 0.001:
                continue
            M = self.layer_matrix(L, st, W, H, t)
            if M is None:
                continue
            src = L['src'](t) if callable(L['src']) else L['src']
            if src is None:
                continue
            mips = L['mips'] if L['mips'] is not None else _Mips(src)
            kind = L['kind']
            if kind == 'mist':
                a = self._mist_sample(L, M, W, H, t)
                frame += (pv - frame) * (a * op)[..., None]
            elif kind == 'ink':
                T = sample(src, M, W, H, 1.0, mips)
                if L['body'] is not None or (callable(L['src']) and L['occlude'] is not False):
                    bm = L['body'] if L['body'] is not None else _Mips(self._body(src, L['occlude']))
                    b = sample(bm.levels[0], M, W, H, 0.0, bm, sharp=False)
                    frame += (pv - frame) * (b * op)[..., None]
                if op < 1:
                    T = 1 - (1 - T) * op
                frame *= T
            elif kind == 'rgba':
                s = sample(src, M, W, H, 0.0, mips)
                a = np.clip(s[..., 3:4], 0, 1) * op
                frame = frame * (1 - a) + s[..., :3] * a
            elif kind == 'erase':                     # an HxW alpha that takes the picture back to bare paper
                a = sample(src if src.ndim == 2 else src[..., -1], M, W, H, 0.0, None, sharp=False)
                frame += (pv - frame) * (np.clip(a, 0, 1) * op)[..., None]
            elif kind == 'frame':
                s = sample(np.dstack([src, np.ones(src.shape[:2], F32)]), M, W, H, 0.0)
                a = s[..., 3:4] * op
                frame = frame * (1 - a) + s[..., :3] * a
        return np.clip(frame, 0, 1, out=frame)

    def _paper_level(self, M):
        s = math.sqrt(abs(M[0, 0] * M[1, 1]))
        lv = 0 if s >= 0.75 else int(round(math.log2(1.0 / s)))
        img, lv = self._paper_mips.get(lv)
        k = 2.0 ** lv
        A = M.copy()
        A[:, :2] *= k
        A[:, 2] += (M[:, 0] + M[:, 1]) * (k - 1) / 2.0
        return img, A

    def paper_breath(self, t, W, H):
        from .core import grain
        if not hasattr(self, '_br') or self._br[0].shape != (H, W):
            self._br = (grain(H, W, self.paper.seed, 'cb1', sigma=0.8), grain(H, W, self.paper.seed, 'cb2', sigma=0.8))
        a = 2 * math.pi * t / 9.0
        return (1.0 + 0.006 * self.paper.breathe * (self._br[0] * math.sin(a) + self._br[1] * math.cos(a)))[..., None]

    def _mist_sample(self, L, M, W, H, t):
        """Mist drifts by sliding along x with wrap-around, so it never runs out."""
        m = L['src']
        mh, mw = m.shape
        dr = (L['drift'] * t) % mw
        if abs(dr) > 1e-6:
            xs = (np.arange(mw, dtype=F32) - dr) % mw
            x0 = np.floor(xs).astype(np.int32)
            f = (xs - x0)[None, :]
            m = m[:, x0] * (1 - f) + m[:, (x0 + 1) % mw] * f
        return sample(m, M, W, H, 0.0, None if abs(dr) > 1e-6 else L['mips'], sharp=False)

    def to_frame(self, x, y, cam_state, size=(1920, 1080), depth=1.0):
        """Canvas point -> frame px for a camera state (cam.at(t)); for placing overlays that must track the paper."""
        M = self.layer_matrix(dict(depth=depth, pos=(0, 0), home=self.home, scale=1.0, kind='ink'), cam_state, *size)
        return M[0, 0] * x + M[0, 2], M[1, 1] * y + M[1, 2]
