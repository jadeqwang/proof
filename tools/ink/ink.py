"""tools.ink.ink: ink dynamics, all procedural and all random-access in time.

Every effect is an InkAnim: a final density map D plus an arrival map A (0..1, when the ink reaches each pixel).
The picture at progress p is closed-form, so frames can be rendered in any order by any worker.

    st = stroke([(200, 600), (700, 420), (1500, 560)], width=46, seed=2, paper=paper)      # 飞白 brush stroke
    frame *= st.T(ramp(t, 10.0, 11.2, 'out'), size=(1920, 1080))
    sp = splash((960, 540), size=420, direction=20, seed=5, into=silhouette_mask, paper=paper)   # 泼墨 -> figure
    frame = sp.draw(frame, t - t_hit)
    bl = bloom(T_plate, seed=3)            # a plate painting itself: frame *= bl.T(p) ; and bl.T(1 - q) to dissolve
"""
import math

import cv2
import numpy as np

from .core import (F32, INK_K, bbox, blur, clamp, fbm, grain, ink_T, lay_ink, rng, rough_mask, smoothstep, value_noise,
                   place)


# --------------------------------------------------------------------------------------------------------------------
# the look of ink on absorbent paper

def wash(mask, paper_h=None, seed=0, density=0.85, bleed=5.0, edge=0.3, granulate=0.3, pool=0.35, feather=0.5):
    """Turn a mask (HxW 0..1, hard or soft) into an ink DENSITY map that reads as ink soaked into xuan paper.

    density    ink load at the core (0.15 pale wash ... 1.0 burnt ink 焦墨)
    bleed      px the wet edge crept into the fibres (soft, irregular, fibre-led)
    edge       wet-edge darkening: pigment carried to the rim as the wash dried
    granulate  how much pigment settles into the paper's valleys (needs paper_h, the Paper.height crop)
    pool       slow tonal variation inside the wash (uneven loading, backruns)
    feather    0..1 how much fine capillary feathering fringes the edge
    """
    h, w = mask.shape
    m = mask.astype(F32)
    hard = m
    if bleed > 0:
        m = rough_mask(m, bleed * 0.8, max(6.0, bleed * 5.0), seed, 'w1')
        m = rough_mask(m, bleed * 0.3, max(2.0, bleed * 0.8), seed, 'w2')
        hard = m
        soft = blur(m, max(0.6, bleed * 0.22))
        if feather > 0:                                   # capillaries: thin tongues that run a little past the edge
            cap = fbm(h, w, max(2.0, bleed * 0.7), seed, 'cap', octaves=3)
            far = blur(m, bleed * 0.9)
            soft = np.maximum(soft, smoothstep(0.40, 0.58, far + (cap - 0.5) * 0.6 * feather) * 0.5 * far ** 0.5)
        m = soft
    d = m * density
    if pool > 0:
        p1 = fbm(h, w, max(24.0, min(h, w) / 5.0), seed, 'pool', octaves=4)
        d = d * (1.0 + pool * (p1 - 0.5) * 2.0)
    if edge > 0 and bleed > 0:
        inner = blur(hard, max(1.2, bleed * 0.7))
        rim = np.clip(blur(hard, 0.8) - inner, 0, 1) * 2.0                # a narrow band just inside the boundary
        rn = 0.6 + 0.8 * fbm(h, w, max(8.0, bleed * 6), seed, 'rim', octaves=2)
        d = d + rim * rn * edge * (0.25 + density) * 1.1
    if granulate > 0:
        if paper_h is not None:
            ph = paper_h if paper_h.shape == (h, w) else cv2.resize(paper_h, (w, h))
            d = d * (1.0 + granulate * ((0.5 - ph) * 2.4))
        d = d * (1.0 + granulate * 0.22 * grain(h, w, seed, 'gran', sigma=0.7))
    return np.clip(d, 0, 1.6).astype(F32)


class InkAnim:
    """Ink that arrives over time. D: final density (HxW). A: arrival 0..1 (HxW). pos: top-left on the frame/canvas.
    tint: None for carbon ink, or an RGB colour (cinnabar, indigo...) for a coloured wash."""

    def __init__(self, D, A, pos=(0, 0), tint=None, soft=0.04, wet=0.18):
        self.D, self.A, self.pos, self.tint, self.soft, self.wet = D.astype(F32), A.astype(F32), pos, tint, soft, wet

    def density(self, p, soft=None, wet=None):
        """Density at progress p (0 nothing ... 1 all arrived; values > 1 let the last wet front dry)."""
        soft = self.soft if soft is None else soft
        wet = self.wet if wet is None else wet
        if p <= 0:
            return np.zeros_like(self.D)
        age = p - self.A
        k = smoothstep(0.0, soft, age)
        d = self.D * k
        if wet > 0 and p < 1.0 + 4 * soft + 0.3:
            d = d * (1.0 + wet * np.exp(-np.maximum(age, 0) / 0.12))       # fresh ink is wetter and darker; it dries back
        return d

    def T(self, p, size=None, **kw):
        """Transmittance layer at progress p. size=(W, H) places it on a full frame at self.pos."""
        t = ink_T(self.density(p, **kw), tint=self.tint)
        if size is not None:
            t = place(t, size[0], size[1], int(self.pos[0]), int(self.pos[1]))
        return t

    def lay(self, frame, p, **kw):
        """Multiply onto a frame in place at self.pos."""
        return lay_ink(frame, ink_T(self.density(p, **kw), tint=self.tint), int(self.pos[0]), int(self.pos[1]))

    def reversed(self):
        return InkAnim(self.D, 1.0 - self.A, self.pos, self.tint, self.soft, 0.0)


# --------------------------------------------------------------------------------------------------------------------
# (a) brush stroke along a spline

def spline(points, n_per_px=0.5):
    """Catmull-Rom through points [(x, y) or (x, y, pressure)], sampled about every 1/n_per_px px.
    Returns (xy Nx2, pressure N, arclen N)."""
    P = np.asarray(points, np.float64)
    if P.shape[1] == 2:
        P = np.hstack([P, np.ones((len(P), 1))])
    if len(P) == 2:
        P = np.vstack([P[0], (P[0] + P[1]) / 2, P[1]])
    Q = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    out = []
    for i in range(1, len(Q) - 2):
        p0, p1, p2, p3 = Q[i - 1], Q[i], Q[i + 1], Q[i + 2]
        n = max(4, int(np.hypot(*(p2 - p1)[:2]) * n_per_px))
        u = np.linspace(0, 1, n, endpoint=False)[:, None]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u ** 2
                          + (-p0 + 3 * p1 - 3 * p2 + p3) * u ** 3))
    out.append(P[-1:])
    C = np.vstack(out)
    seg = np.hypot(np.diff(C[:, 0]), np.diff(C[:, 1]))
    return C[:, :2], np.clip(C[:, 2], 0.02, 3), np.concatenate([[0], np.cumsum(seg)])


def stroke(points, width=40.0, seed=0, paper=None, density=0.9, dry=0.35, dry_end=0.9, taper=(0.06, 0.12),
           tint=None, bleed=2.5, bristles=1.0, pad=None, speed=None):
    """A brush stroke drawn along a spline: pressure-varying width, dry-brush 飞白 streaks where the brush runs out of
    ink or moves fast, wet-edge darkening, bleed into the paper.

    points    [(x, y)] or [(x, y, pressure)] in frame/canvas px; pressure ~1 scales width
    width     full width at pressure 1 (px)
    dry       0..1 dryness at the start of the stroke; dry_end: dryness at the end (the brush empties)
    taper     (in, out) fractions of the length over which the stroke tapers at entry and exit
    paper     a Paper: dry brush catches only the high points of the sheet; density granulates in the valleys
    speed     optional array/callable u -> relative speed (faster = drier)
    Returns an InkAnim whose arrival is the position along the stroke (progress 0..1 draws it from first point to last).
    """
    xy, pr, s = spline(points)
    L = float(s[-1])
    u = s / max(L, 1e-6)
    tin, tout = taper
    # entry is a press (quick swell), exit is a lift (long taper)
    tw_in, tw_out = smoothstep(0, max(tin, 1e-4), u) ** 0.6, smoothstep(0, max(tout, 1e-4), 1 - u) ** 0.8
    # the brush is pressed down at the start (a rounded head) and lifted to a point at the end
    half = np.maximum(0.6, 0.5 * width * pr * (0.55 + 0.45 * tw_in) * (0.12 + 0.88 * tw_out))
    padv = int(pad if pad is not None else width * 1.3 + bleed * 3 + 6)
    x0, y0 = int(math.floor(xy[:, 0].min())) - padv, int(math.floor(xy[:, 1].min())) - padv
    x1, y1 = int(math.ceil(xy[:, 0].max())) + padv, int(math.ceil(xy[:, 1].max())) + padv
    w, h = x1 - x0, y1 - y0
    loc = xy - np.array([x0, y0])
    # nearest-centreline lookup by distance transform with labels
    idx_img = np.zeros((h, w), np.int32)
    pts = np.round(loc).astype(np.int32)
    for i in range(len(pts) - 1):
        cv2.line(idx_img, (int(pts[i, 0]), int(pts[i, 1])), (int(pts[i + 1, 0]), int(pts[i + 1, 1])), int(i + 1), 1)
    line = (idx_img == 0).astype(np.uint8)
    dist, labels = cv2.distanceTransformWithLabels(line, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    ys, xs = np.nonzero(idx_img)
    lut = np.zeros(labels.max() + 1, np.int32)
    lut[labels[ys, xs]] = idx_img[ys, xs] - 1
    near = lut[labels]                                          # sample index of the nearest centreline point
    tan = np.gradient(cv2.GaussianBlur(loc.astype(np.float64), (1, 9), 0), axis=0)
    tan /= np.maximum(np.hypot(tan[:, 0], tan[:, 1])[:, None], 1e-6)
    yy, xx = np.mgrid[0:h, 0:w].astype(F32)
    rx, ry = xx - loc[near, 0].astype(F32), yy - loc[near, 1].astype(F32)
    tx, ty = tan[near, 0].astype(F32), tan[near, 1].astype(F32)
    lat = rx * (-ty) + ry * tx                                  # signed distance across the brush
    alo = rx * tx + ry * ty                                     # distance along the tangent (end caps)
    hw = half[near].astype(F32)
    endcap = (near <= 1) | (near >= len(loc) - 3)
    U = u[near].astype(F32) + np.where(endcap, alo, 0) / max(L, 1e-6)
    v = lat / hw                                                # -1..1 across the brush
    r = np.where(endcap, np.hypot(lat, alo), np.abs(lat)) / hw
    # body with a slightly ragged edge
    en = (fbm(h, w, max(3.0, width * 0.12), seed, 'edge', octaves=3) - 0.5)
    body = smoothstep(1.0, 0.86, r + en * 0.16)
    # bristles: a 1D pattern across the brush that drifts slowly along it
    nb = 220
    rr = rng(seed, 'bristle')
    bw = rr.random(nb).astype(F32)
    bw = np.convolve(bw, np.ones(3) / 3, mode='same').astype(F32)            # bristle clumps
    sl = np.cumsum(rr.normal(0, 0.04, 64)).astype(F32)                        # clumps wander along the stroke
    wand = np.interp(np.clip(U, 0, 1), np.linspace(0, 1, 64), sl).astype(F32)
    bi = np.clip(((v * 0.5 + 0.5) + wand * 0.6) * (nb * 0.22 * max(0.4, width / 40.0) ** 0.5), 0, nb - 1.001)
    b0 = np.floor(bi).astype(np.int32)
    bf = bi - b0
    bris = bw[b0] * (1 - bf) + bw[np.minimum(b0 + 1, nb - 1)] * bf
    # along-stroke breakup: ink skips in dashes along each bristle track
    skip = fbm(h, w, max(3.0, width * 0.10), seed, 'skip', octaves=2)
    along = value_noise(1, 512, 150, seed, 'load')[0]
    load_n = np.interp(np.clip(U, 0, 1), np.linspace(0, 1, 512), along).astype(F32)
    dryness = dry + (dry_end - dry) * np.clip(U, 0, 1) ** 1.6 + (load_n - 0.5) * 0.35
    if speed is not None:
        sp = np.asarray([speed(q) for q in np.linspace(0, 1, 64)], F32) if callable(speed) else np.asarray(speed, F32)
        dryness = dryness + (np.interp(np.clip(U, 0, 1), np.linspace(0, 1, len(sp)), sp).astype(F32) - 1.0) * 0.4
    dryness = dryness + np.abs(v) ** 2 * 0.22                                 # the edges of the brush dry first
    ph = 0.5
    if paper is not None:
        ph = _crop(paper.height, x0, y0, w, h, 0.5)
    tex = bris * 0.62 * bristles + skip * 0.22 + (ph - 0.5) * 0.9 + 0.08       # what the brush can still reach
    hold = smoothstep(dryness - 0.10, dryness + 0.10, tex + 0.5 * (1 - dryness))
    hold = np.where(dryness < 0.12, 1.0, hold)
    m = body * hold
    core = density * (0.80 + 0.20 * (1 - np.abs(v)) + 0.25 * (0.5 - load_n)) * (1.0 - 0.38 * np.clip(dryness, 0, 1))
    d = blur(m, 0.6) * core
    wetm = body * (1 - smoothstep(0.25, 0.6, dryness))                         # only wet parts bleed and rim
    if bleed > 0:
        d = np.maximum(d, wash(wetm, ph if paper is not None else None, seed, 1.0, bleed, 0.28, 0.0, 0.0) * core)
    d = d * (1.0 + 0.3 * (0.5 - (ph if paper is not None else 0.5)) * 2) * (1 + 0.06 * grain(h, w, seed, 'sg'))
    A = np.clip(U, 0, 1) * 0.98
    return InkAnim(np.clip(d, 0, 1.5), A, (x0, y0), tint, soft=max(0.012, 3.0 / max(L, 1)), wet=0.15)


def _crop(arr, x0, y0, w, h, fill):
    out = np.full((h, w) + arr.shape[2:], fill, arr.dtype)
    H, W = arr.shape[:2]
    a0, b0, a1, b1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if a1 > a0 and b1 > b0:
        out[b0 - y0:b1 - y0, a0 - x0:a1 - x0] = arr[b0:b1, a0:a1]
    return out


# --------------------------------------------------------------------------------------------------------------------
# (b) splashed ink 泼墨

def splat_shape(size, direction=0.0, seed=0, fingers=14, droplets=90, spread=1.0):
    """A thrown splat: HxW mask in a (4*size)^2 box, centred. direction (degrees, 0 = +x, screen coords) is the way
    the ink was travelling: the body is smeared along it and fingers and droplets fly forward."""
    S = int(size * 4)
    r = rng(seed, 'splat')
    yy, xx = np.mgrid[0:S, 0:S].astype(F32)
    cx = cy = S / 2.0
    a = math.radians(direction)
    dx, dy = xx - cx, yy - cy
    fx = dx * math.cos(a) + dy * math.sin(a)                  # forward
    sx = -dx * math.sin(a) + dy * math.cos(a)                 # sideways
    th = np.arctan2(sx, fx)
    rad = np.hypot(fx * 0.78, sx * 1.05)                      # body a little longer along the throw
    ring = value_noise(1, 720, 28, seed, 'ring')[0]
    ring = np.concatenate([ring, ring[:1]])
    ti = (th + math.pi) / (2 * math.pi) * 720
    R = size * 0.42 * (0.75 + 0.6 * ring[np.clip(ti.astype(np.int32), 0, 720)])
    for i in range(fingers):                                  # fingers: narrow lobes, mostly forward
        t0 = r.normal(0, 0.9) if r.random() < 0.75 else r.uniform(-math.pi, math.pi)
        ln = size * r.uniform(0.2, 0.75) * spread * (1.0 if abs(t0) < 1.2 else 0.5)
        wd = r.uniform(0.02, 0.07)
        dth = np.angle(np.exp(1j * (th - t0)))
        R = R + ln * np.exp(-(dth / wd) ** 2)
    m = smoothstep(1.5, -1.5, rad - R)
    for i in range(droplets):                                 # satellite droplets, small and far, thrown forward
        t0 = r.normal(0, 0.75) if r.random() < 0.8 else r.uniform(-math.pi, math.pi)
        dist = size * (0.55 + r.exponential(0.45)) * spread
        rr_ = size * 0.012 * (1 + r.pareto(2.2))
        rr_ = min(rr_, size * 0.07)
        px = cx + (math.cos(t0) * dist) * math.cos(a) - (math.sin(t0) * dist) * math.sin(a)
        py = cy + (math.cos(t0) * dist) * math.sin(a) + (math.sin(t0) * dist) * math.cos(a)
        el = 1.0 + r.uniform(0, 1.6)                          # stretched along the radial direction
        ang = math.degrees(a + t0)
        cv2.ellipse(m, ((float(px), float(py)), (float(2 * rr_ * el), float(2 * rr_)), ang), 1.0, -1, cv2.LINE_AA)
    return np.clip(m, 0, 1)


class Splash:
    """A throw of ink. Use draw(frame, dt) with dt = t - t_hit (negative while the ink is still in the air)."""

    def __init__(self, D0, D1, A_land, A_res, pos, impact, direction, size, seed, tint, fly, resolve, remain, drops):
        self.D0, self.D1, self.A_land, self.A_res = D0, D1, A_land, A_res
        self.pos, self.impact, self.direction, self.size, self.seed = pos, impact, direction, size, seed
        self.tint, self.fly, self.resolve, self.remain, self.drops = tint, fly, resolve, remain, drops

    def density(self, dt):
        """Density in the splash's own box at dt seconds after the hit."""
        if dt < 0:
            return np.zeros_like(self.D0)
        land = 0.16                                            # the body floods outward from the impact in ~4 frames
        k = smoothstep(0.0, 0.05, dt / land - self.A_land)
        spread = dt / 1.0                                      # then creeps into the fibres over about a second
        age = np.maximum(dt - self.A_land * land, 0)
        d0 = self.D0 * k * (1.0 + 0.30 * np.exp(-age / 0.25))
        if self.D1 is None:
            return d0 * self._bleed_gate(spread)
        r = smoothstep(0.0, 0.45, (dt - 0.10) / self.resolve - self.A_res * 0.55)
        # the excess thins to a pale stain and the figure gathers the ink
        d = (d0 + (self.Ds * self.remain - d0) * r) * self._bleed_gate(spread) + self.D1 * r * k
        return d

    def _bleed_gate(self, spread):
        return smoothstep(0.0, 0.25, np.sqrt(max(spread, 0.0)) * 1.15 - self._Ab) if hasattr(self, '_Ab') else 1.0

    def draw(self, frame, dt, x=None, y=None):
        """Lay the splash onto a frame in place. Before the hit, the airborne ink is drawn as a few flying gobs."""
        px, py = self.pos if x is None else (x, y)
        if -self.fly < dt < 0:
            self._flight(frame, dt, px, py)
        if dt >= 0:
            lay_ink(frame, ink_T(self.density(dt), tint=self.tint), int(px), int(py))
        return frame

    def T(self, dt, size):
        f = np.ones((size[1], size[0], 3), F32)
        return self.draw(f, dt)

    def _flight(self, frame, dt, px, py):
        r = rng(self.seed, 'fly')
        a = math.radians(self.direction)
        ix, iy = self.impact[0], self.impact[1]
        H, W = frame.shape[:2]
        n = self.drops
        lay = np.zeros((H, W), F32)
        u = 1 + dt / self.fly                                  # 0 start of flight .. 1 impact
        for i in range(n):
            lag = r.uniform(0, 0.35)
            off = r.normal(0, self.size * 0.16, 2)
            sz = self.size * (0.025 + 0.11 * r.random() ** 3)
            val = float(0.75 + 0.25 * r.random())
            uu = u * (1 + lag) - lag                              # stragglers leave later and land later
            if uu <= 0 or uu >= 1.0:
                continue
            dist = (1 - uu) * self.size * 5.0
            sp = 0.3 + 0.7 * (1 - uu)                              # the gob spreads as it flies, gathers at the hit
            x = ix - math.cos(a) * dist + off[0] * sp
            y = iy - math.sin(a) * dist + off[1] * sp
            smear = sz * 2.0 + self.size * 5.0 / max(self.fly * 24.0, 1.0) * 0.5      # half a frame of travel
            cv2.ellipse(lay, ((float(x), float(y)), (float(smear), float(2 * sz)), float(self.direction)), val, -1,
                        cv2.LINE_AA)
        lay = blur(lay, max(1.0, self.size * 0.012))
        frame *= ink_T(lay * 0.95, tint=self.tint)


def splash(impact, size=400, direction=0.0, seed=0, into=None, into_pos=(0, 0), paper=None, density=1.0, tint=None,
           fly=0.12, resolve=0.9, remain=0.16, fingers=14, droplets=90, bleed=None, figure_density=None):
    """A throw of splashed ink that lands at `impact` (frame px), floods out in a few frames, then creeps into the
    fibres for about a second. With `into` (a silhouette mask HxW placed at into_pos on the frame) the burst
    resolves INTO that figure: the excess thins to a pale stain (`remain` of its density) with the spatter left behind.

    size       radius scale of the burst (px); direction: degrees the ink was travelling (0 = rightward, 90 = down)
    fly        seconds the ink is visible in the air before the hit
    resolve    seconds for the burst to gather into the figure
    figure_density  an explicit density map for the figure (same box as `into`) instead of a wash made from the mask
    Returns a Splash; call .draw(frame, t - t_hit).
    """
    bleed = bleed if bleed is not None else size * 0.022
    m = splat_shape(size, direction, seed, fingers, droplets)
    S = m.shape[0]
    x0, y0 = int(impact[0] - S / 2), int(impact[1] - S / 2)
    if into is not None:                                       # make the box cover the figure too
        fx0, fy0 = into_pos
        fx1, fy1 = fx0 + into.shape[1], fy0 + into.shape[0]
        pad = int(bleed * 4 + 8)
        bx0, by0 = min(x0, fx0 - pad), min(y0, fy0 - pad)
        bx1, by1 = max(x0 + S, fx1 + pad), max(y0 + S, fy1 + pad)
        m = place(m, bx1 - bx0, by1 - by0, x0 - bx0, y0 - by0)
        fig = place(into.astype(F32), bx1 - bx0, by1 - by0, fx0 - bx0, fy0 - by0)
        x0, y0 = bx0, by0
    h, w = m.shape
    ph = _crop(paper.height, x0, y0, w, h, 0.5) if paper is not None else None
    D0 = wash(m, ph, seed, density, bleed, edge=0.3, granulate=0.3, pool=0.5)
    # splashed ink is uneven: a dense heart, thinner watery skirts
    yy, xx = np.mgrid[0:h, 0:w].astype(F32)
    ix, iy = impact[0] - x0, impact[1] - y0
    rr = np.hypot(xx - ix, yy - iy)
    heart = 0.72 + 0.28 * smoothstep(size * 0.75, size * 0.1, rr * (0.7 + 0.6 * fbm(h, w, size * 0.5, seed, 'heart')))
    D0 = D0 * heart
    n1 = fbm(h, w, size * 0.25, seed, 'land', octaves=3)
    A_land = np.clip(rr / (size * 2.0) + (n1 - 0.5) * 0.25, 0, 1)
    D1 = A_res = None
    if into is not None:
        if figure_density is not None:
            D1 = place(figure_density.astype(F32), w, h, into_pos[0] - x0, into_pos[1] - y0)
        else:
            D1 = wash(fig, ph, seed + 1, density * 0.95, bleed * 0.5, edge=0.35, granulate=0.3, pool=0.45)
        dist_in = cv2.distanceTransform((fig > 0.5).astype(np.uint8), cv2.DIST_L2, 3)
        dn = dist_in / max(float(dist_in.max()), 1.0)
        # the figure gathers from its thick parts outward to its fine ends, with some noise
        A_res = np.clip(0.75 * (1 - dn) + 0.5 * (fbm(h, w, size * 0.18, seed, 'res', octaves=3) - 0.5) + 0.2, 0, 1)
    sp = Splash(D0.astype(F32), None if D1 is None else D1.astype(F32), A_land.astype(F32),
                None if A_res is None else A_res.astype(F32), (x0, y0), impact, direction, size, seed, tint, fly,
                resolve, remain, max(6, droplets // 10))
    # capillary creep: pixels far outside the wet core arrive later (distance ~ sqrt(time)), led by the fibres
    core = (blur(m, bleed * 0.3) > 0.6).astype(np.uint8)
    dout = cv2.distanceTransform(1 - core, cv2.DIST_L2, 3)
    fib = fbm(h, w, max(2.0, bleed * 0.8), seed, 'fib', octaves=3)
    # what the excess dries to: a pale stain with a hard dried rim, patchy
    patch = smoothstep(0.25, 0.7, fbm(h, w, size * 0.35, seed, 'stain', octaves=3))
    sp.Ds = (wash(m, ph, seed + 7, 1.0, bleed, edge=1.2, granulate=0.5, pool=0.9) * (0.35 + 0.65 * patch)).astype(F32)
    sp._Ab = np.clip(dout / max(bleed * 2.2, 1e-3) * (0.6 + 0.8 * fib), 0, 3).astype(F32)
    return sp


# --------------------------------------------------------------------------------------------------------------------
# (c) bloom reveal and (d) dissolve

class Bloom:
    """A plate that paints itself. T(p): p 0 = bare paper, 1 = the whole plate. Use T(1 - q) to dissolve it back.
    order: 'dark' (dark strokes first, pale washes last: how a painter works), 'light' (washes first), 'radial'
    (from `origin` outward) or an HxW order map (0 first .. 1 last)."""

    def __init__(self, T, seed=0, order='dark', origin=None, noise=0.28, soft=0.22, wet_blur=None, cell=None):
        self.Tfull = T.astype(F32)
        h, w = T.shape[:2]
        d = 1.0 - T.min(axis=2)
        ds = blur(d, max(2.0, min(h, w) / 160.0))
        cell = cell or min(h, w) / 5.0
        n = fbm(h, w, cell, seed, 'bloom', octaves=4)
        if isinstance(order, np.ndarray):
            a = order.astype(F32)
        elif order == 'dark':
            a = 1.0 - ds / max(float(ds.max()), 1e-3)
        elif order == 'light':
            a = ds / max(float(ds.max()), 1e-3)
        else:
            ox, oy = origin if origin else (w / 2.0, h / 2.0)
            yy, xx = np.mgrid[0:h, 0:w].astype(F32)
            a = np.hypot(xx - ox, yy - oy)
            a = a / float(a.max())
        a = a * (1 - noise) + n * noise
        # equalise over the inked pixels so the painting appears at an even pace
        inked = d > 0.02
        if inked.any():
            v = np.sort(a[inked])
            a = np.interp(a, v, np.linspace(0, 1, len(v))).astype(F32)
        self.A = blur(a.astype(F32), max(2.0, min(h, w) / 250.0)) * (1 - soft)
        self.soft = soft
        self.wet_blur = wet_blur if wet_blur is not None else max(2.0, min(h, w) / 220.0)
        self.Tblur = blur(self.Tfull, self.wet_blur)
        self.d = d

    def T(self, p):
        if p <= 0:
            return np.ones_like(self.Tfull)
        if p >= 1.0 + self.soft * 3:
            return self.Tfull
        age = p - self.A
        k = smoothstep(0.0, self.soft, age)[..., None]
        sharp = smoothstep(self.soft * 0.5, self.soft * 3.0, age)[..., None]       # arrives wet and soft, then sets
        T = self.Tblur + (self.Tfull - self.Tblur) * sharp
        return (1.0 - (1.0 - T) * k).astype(F32)

    def dissolve(self, q):
        """q 0 = whole plate, 1 = bare paper. Pale washes go first; what is left softens as it goes."""
        return self.T(1.0 - q) if q > 0 else self.Tfull


def bloom(T, seed=0, order='dark', **kw):
    """Ink-wash bloom reveal of a keyed plate (see Bloom)."""
    return Bloom(T, seed, order, **kw)


def dissolve(T, q, seed=0, spread=6.0):
    """One-off: fade an ink layer back to bare paper. q 0..1. Thin washes vanish first, dense strokes linger and
    blur a little, as if the paper were drinking them back."""
    if q <= 0:
        return T
    if q >= 1:
        return np.ones_like(T)
    h, w = T.shape[:2]
    d = 1.0 - T.min(axis=2)
    n = fbm(h, w, min(h, w) / 6.0, seed, 'dis', octaves=3)
    thr = q * 1.25
    keep = smoothstep(thr - 0.2, thr + 0.05, d * 0.7 + n * 0.45 + 0.05)
    Tb = blur(T, spread * q) if spread > 0 else T
    return (1.0 - (1.0 - Tb) * (keep * (1 - q) ** 0.6)[..., None]).astype(F32)


# --------------------------------------------------------------------------------------------------------------------
# (e) the hair-line

def hairline(W, H, t, seed=0, y=0.5, angle=-3.0, drift=(0.0, -6.0), length=0.8, x=0.5, weight=1.0, density=0.55,
             draw=1.0, waver=5.0):
    """A single hair-thin line of ink on an empty page, drifting. Returns an ink layer (HxWx3).

    y, x      centre of the line as fractions of the frame; length: fraction of the frame width
    angle     degrees; drift: (px/s, px/s) how the line moves; waver: px of slow undulation
    weight    line width in px (about 1.0-1.6 reads as one hair of the brush); draw: 0..1 how much of it is drawn
    Analytic and sub-pixel exact, so it never shimmers as it drifts.
    """
    a = math.radians(angle)
    cx, cy = x * W + drift[0] * t, y * H + drift[1] * t
    yy, xx = np.mgrid[0:H, 0:W].astype(F32)
    u = (xx - cx) * math.cos(a) + (yy - cy) * math.sin(a)
    v = -(xx - cx) * math.sin(a) + (yy - cy) * math.cos(a)
    Lh = length * W / 2.0
    un = u / max(Lh, 1.0)                                       # -1..1 along the line
    r = rng(seed, 'hair')
    ph = r.uniform(0, 6.28, 4)
    f = (waver * 0.6 * np.sin(un * 2.1 + ph[0] + t * 0.11) + waver * 0.3 * np.sin(un * 5.3 + ph[1] - t * 0.07)
         + waver * 0.1 * np.sin(un * 13.0 + ph[2]))
    wv = value_noise(1, 1024, 30, seed, 'hw')[0]
    wn = np.interp(np.clip(un * 0.5 + 0.5, 0, 1), np.linspace(0, 1, 1024), wv).astype(F32)
    sig = weight * (0.42 + 0.35 * wn)
    prof = np.exp(-0.5 * ((v - f) / sig) ** 2)
    ends = smoothstep(1.0, 0.82, np.abs(un)) ** 1.5 * smoothstep(-1.0, -1.0 + 0.001, un)
    drawn = smoothstep(0.0, 0.03, (draw * 2.0 - 1.0) - un + 0.03) if draw < 1.0 else 1.0
    dn = value_noise(1, 1024, 14, seed, 'hd')[0]
    dd = np.interp(np.clip(un * 0.5 + 0.5, 0, 1), np.linspace(0, 1, 1024), dn).astype(F32)
    d = prof * ends * drawn * density * (0.55 + 0.75 * dd)
    return ink_T(d)


def compose(anims, size, p=2.0):
    """Sum the densities of several InkAnim (strokes, washes) at progress p into one density map of size (W, H).
    Use it to build a figure out of a few strokes, e.g. as figure_density for splash()."""
    W, H = size
    out = np.zeros((H, W), F32)
    for a in anims:
        d = a.density(p)
        x, y = int(a.pos[0]), int(a.pos[1])
        h, w = d.shape
        x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
        if x1 > x0 and y1 > y0:
            out[y0:y1, x0:x1] += d[y0 - y:y1 - y, x0 - x:x1 - x]
    return out


def brush_monkey(size=700, seed=0, paper=None, staff=True):
    """A stand-in figure for tests and animatics: a monkey in 亮相 made of nine abbreviated strokes (减笔), in a
    size x size box. Returns (density HxW, list of the strokes as InkAnim in box coordinates)."""
    k = size / 700.0
    S = lambda pts: [(x * k, y * k) + tuple(r) for x, y, *r in pts]
    spec = [  # points (x, y[, pressure]), width, dry, dry_end
        ([(300, 235, 0.8), (325, 330, 1.25), (345, 440, 0.9)], 150, 0.05, 0.45),          # torso
        ([(268, 150, 0.9), (300, 132, 1.2), (322, 168, 1.0), (298, 196, 0.8)], 74, 0.0, 0.3),   # head
        ([(345, 262, 1.0), (432, 222, 0.9), (505, 138, 0.7)], 46, 0.25, 0.8),             # arm to the staff
        ([(280, 262, 1.0), (205, 232, 0.9), (236, 160, 0.7)], 40, 0.2, 0.75),             # hand shading the eyes
        ([(322, 440, 1.1), (236, 500, 1.0), (214, 606, 0.8), (150, 628, 0.5)], 56, 0.15, 0.85),   # front leg, bent
        ([(362, 442, 1.1), (452, 506, 1.0), (470, 610, 0.8), (530, 626, 0.5)], 56, 0.2, 0.9),     # back leg
        ([(372, 452, 1.0), (492, 438, 0.8), (552, 352, 0.6), (530, 300, 0.3)], 20, 0.3, 0.95),    # tail
    ]
    if staff:
        spec.append(([(112, 652, 0.8), (330, 372, 1.0), (606, 40, 0.7)], 15, 0.35, 0.9))
    strokes = [stroke(S(pts), width=w * k, seed=seed + i, paper=paper, dry=d0, dry_end=d1, bleed=3 * k)
               for i, (pts, w, d0, d1) in enumerate(spec)]
    return compose(strokes, (size, size)), strokes
