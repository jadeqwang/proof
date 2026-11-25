"""tools.ink.light: light on a surface. Everything here MULTIPLIES a plate (paper, a book page): light falling on
paper, never a glow added on top. No bloom, no flare.

    L = flashlight_field(1920, 1080, (900, 600), 420)              # HxW intensity 0..~1
    S = cast_shadow(hand_mask, light_pos=(900, 1500), distance=0.45, light_size=22)
    frame = flashlight(plate, (900, 600), 420, ambient=0.07, shadow=S)
    frame = dust(frame, t, L, seed=4)
    frame = neon(plate, t, period=7.0, shadow=S)
"""
import math

import cv2
import numpy as np

from .core import F32, blur, rng, smoothstep, value_noise

NEON_RED = np.array([1.00, 0.25, 0.17], F32)          # cinnabar neon on cream paper
NEON_BLUE = np.array([0.36, 0.60, 1.00], F32)         # the cold phase
TUNGSTEN = np.array([1.00, 0.72, 0.42], F32)
NIGHT = np.array([0.55, 0.68, 1.00], F32)             # colour of the ambient dark (moonless blue)
TORCH = np.array([1.00, 0.985, 0.95], F32)

_GRID = {}


def _grid(W, H):
    if (W, H) not in _GRID:
        yy, xx = np.mgrid[0:H, 0:W].astype(F32)
        _GRID[(W, H)] = (xx, yy)
    return _GRID[(W, H)]


def _pos(p, t):
    return p(t) if callable(p) else p


def cast_shadow(mask, light_pos, distance=0.4, light_size=18.0, t=0.0, size=None, offset=(0, 0)):
    """Project a silhouette as a shadow on the page. Returns S (HxW, 0 = lit, 1 = full umbra).

    mask        HxW silhouette (1 = hand) in frame coordinates as it would lie flat on the page, or callable t -> mask
    light_pos   where the lamp sits over the page plane, frame px (may be outside the frame; may be callable of t)
    distance    0..<1: how far the hand is lifted from the page toward the lamp. The shadow grows by 1/(1-distance)
                away from light_pos and its penumbra widens with it.
    light_size  apparent size of the lamp in px: penumbra sigma = light_size * distance / (1 - distance)
    """
    m = mask(t) if callable(mask) else mask
    m = m.astype(F32)
    H, W = size[::-1] if size else m.shape[:2]
    lx, ly = _pos(light_pos, t)
    d = min(max(float(distance), 0.0), 0.92)
    k = 1.0 / (1.0 - d)
    M = np.float32([[k, 0, lx * (1 - k) + offset[0]], [0, k, ly * (1 - k) + offset[1]]])
    s = cv2.warpAffine(m, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    sig = light_size * d * k
    if sig > 0.3:
        # penumbra: wider on the side far from the lamp is second-order; one sigma, but keep a harder core
        s = blur(s, sig)
        s = smoothstep(0.02, 0.98, s)
    return s


def neon_colour(t, period=7.0, phase=0.0, fade=0.10, red=NEON_RED, blue=NEON_BLUE, seed=0):
    """The sign's colour at time t: holds cinnabar, crosses to cold blue, holds, crosses back. fade = fraction of
    the period each crossing takes. A very slight deterministic waver keeps it from being a flat fill."""
    u = (t / period + phase) % 1.0
    if u < 0.5 - fade:
        k = 0.0
    elif u < 0.5:
        k = (u - (0.5 - fade)) / fade
    elif u < 1.0 - fade:
        k = 1.0
    else:
        k = 1.0 - (u - (1.0 - fade)) / fade
    k = k * k * (3 - 2 * k)
    # passing through the mix the tube is dimmer (one gas dying, the other striking)
    dip = 1.0 - 0.35 * math.sin(math.pi * k) ** 2
    wav = 1.0 + 0.012 * math.sin(t * 2.3 + seed) + 0.008 * math.sin(t * 7.1 + 1.3 * seed)
    return (np.asarray(red, F32) * (1 - k) + np.asarray(blue, F32) * k) * dip * wav, k


def neon_field(W, H, source=(2150, -260), reach=1500.0, power=1.3, slats=0.0, slat_px=150.0, angle=None):
    """Falloff of the sign's light across the page: brightest toward `source` (frame px, normally outside the
    frame, up and to one side: the window), dropping with distance. slats > 0 lays soft window-bar shadows across."""
    xx, yy = _grid(W, H)
    d = np.hypot(xx - source[0], yy - source[1])
    I = 1.0 / (1.0 + (d / reach) ** 2) ** power
    I = I / float(I.max())
    if slats > 0:
        a = math.atan2(H / 2 - source[1], W / 2 - source[0]) if angle is None else math.radians(angle)
        u = (xx - source[0]) * -math.sin(a) + (yy - source[1]) * math.cos(a)
        bar = 0.5 + 0.5 * np.cos(u * (2 * math.pi / slat_px))
        I = I * (1 - slats * smoothstep(0.78, 0.97, bar))
    return I.astype(F32)


def neon(frame, t, period=7.0, phase=0.0, source=(2150, -260), reach=1500.0, gain=1.0, ambient=0.07, tungsten=0.0,
         fade=0.10, shadow=None, slats=0.0, red=NEON_RED, blue=NEON_BLUE, field=None, seed=0):
    """1988: a neon sign outside the window washes the page cinnabar, cycling to cold blue.

    period, phase  the colour cycle in seconds / cycles (lock phase to the song clock)
    source, reach  where the light comes from and how far it carries (see neon_field); field: a precomputed one
    gain           brightness of the sign on the page; ambient: the night level left when nothing else lights it
    tungsten       0..1 warm fill rising from the bottom edge (the kitchen below, through the floorboards)
    shadow         S from cast_shadow(): blocks the neon only (ambient and tungsten still fill it, so the umbra is
                   never black and takes the colour of whatever else is in the room)
    """
    H, W = frame.shape[:2]
    I = field if field is not None else neon_field(W, H, source, reach, slats=slats)
    col, _ = neon_colour(t, period, phase, fade, red, blue, seed)
    key = I * gain
    if shadow is not None:
        key = key * (1.0 - 0.94 * shadow)
    light = key[..., None] * col[None, None] + ambient * NIGHT[None, None]
    if tungsten > 0:
        xx, yy = _grid(W, H)
        up = smoothstep(H * 0.25, H * 1.05, yy) ** 1.6
        light = light + (tungsten * 0.55 * up)[..., None] * TUNGSTEN[None, None]
    out = frame * light
    return np.clip(out, 0, 0.985, out=out).astype(F32)


def flashlight_field(W, H, pos, radius, tilt=0.0, stretch=1.0, seed=0, core=0.45, ring=0.045, spill=0.06):
    """Intensity (HxW, about 0..1) of a hand torch on the page: a hot core, a plateau with a soft uneven edge, the
    faint brighter ring and dark dimple a reflector throws, and a little spill outside.
    tilt (degrees) and stretch (>1) make the pool an ellipse, as when the torch is held at a slant."""
    xx, yy = _grid(W, H)
    dx, dy = xx - pos[0], yy - pos[1]
    if stretch != 1.0 or tilt:
        a = math.radians(tilt)
        u = dx * math.cos(a) + dy * math.sin(a)
        v = -dx * math.sin(a) + dy * math.cos(a)
        # the far side of a slanted pool is longer and dimmer
        u = u / (stretch * (1.0 + 0.18 * np.tanh(u / max(radius, 1.0))))
        r = np.hypot(u, v) / radius
        th = np.arctan2(v, u)
    else:
        r = np.hypot(dx, dy) / radius
        th = np.arctan2(dy, dx)
    wob = value_noise(1, 360, 40, seed, 'torch')[0]
    wob = np.concatenate([wob, wob[:1]])
    ti = np.clip(((th + math.pi) / (2 * math.pi) * 360).astype(np.int32), 0, 360)
    rr = r * (1.0 + 0.035 * (wob[ti] - 0.5) * 2)
    I = (1 - core) * smoothstep(1.08, 0.38, rr) ** 1.25
    I += core * np.exp(-(rr / 0.46) ** 2)
    I += ring * np.exp(-((rr - 0.74) / 0.06) ** 2)
    I -= 0.045 * np.exp(-(rr / 0.065) ** 2)
    I += spill * smoothstep(2.4, 0.95, rr) ** 2
    return np.clip(I, 0, 1.2).astype(F32)


def flashlight(frame, pos, radius, t=0.0, ambient=0.06, gain=1.0, colour=TORCH, tilt=0.0, stretch=1.0, shadow=None,
               field=None, seed=0):
    """2026: one small torch on the page. Returns the lit frame; the rest of the page falls to night.

    pos       centre of the pool in frame px, or a callable t -> (x, y) (a hand-held wobble, a move to a cue)
    radius    px to the edge of the pool
    ambient   night level outside the pool (0.04 very dark ... 0.15 dim room)
    shadow    S from cast_shadow(): blocks the torch only
    field     a precomputed flashlight_field (to share with dust())
    """
    H, W = frame.shape[:2]
    I = field if field is not None else flashlight_field(W, H, _pos(pos, t), radius, tilt, stretch, seed)
    key = I * gain
    if shadow is not None:
        key = key * (1.0 - 0.93 * shadow)
    light = key[..., None] * np.asarray(colour, F32)[None, None] + ambient * NIGHT[None, None]
    out = frame * light
    return np.clip(out, 0, 0.985, out=out).astype(F32)


def hand_shadow(frame, mask, light_pos, distance=0.4, light_size=18.0, t=0.0, strength=0.86, tint=(1.0, 0.96, 0.90),
                offset=(0, 0)):
    """Cast a silhouette as a soft shadow straight onto an already-lit frame (when the lighting was not done with
    neon()/flashlight(shadow=...)). strength < 1 leaves the bounce light in the umbra; tint is the colour the
    shadow leans to (the complement of the key light: warm under blue, cool under red)."""
    S = cast_shadow(mask, light_pos, distance, light_size, t, size=frame.shape[1::-1], offset=offset)
    k = 1.0 - strength * S[..., None] * (2.0 - np.asarray(tint, F32))[None, None] / (2.0 - min(tint))
    return (frame * np.clip(k, 0.05, 1)).astype(F32)


def dust(frame, t, beam, n=70, seed=0, colour=TORCH, gain=1.0, drift=(4.0, -2.5), size=(1.0, 3.0), threshold=0.10):
    """Dust motes in a beam: sparse, each visible only while it is inside the light (`beam`: an HxW intensity
    field such as flashlight_field / neon_field, or the product with 1 - shadow), fading out as it leaves.

    n          motes in the whole frame (most are outside the beam and unseen); drift: mean px/s
    size       (min, max) sigma in px: the near, out-of-focus ones are larger and fainter
    Random access in t (closed-form motion: drift + slow sinusoidal wander + a slow tumble that makes them glint).
    """
    H, W = frame.shape[:2]
    r = rng(seed, 'dust')
    p0 = r.random((n, 2)) * np.array([W + 80, H + 80])
    vel = np.array(drift)[None, :] * r.uniform(0.3, 1.7, (n, 1)) + r.normal(0, 1.6, (n, 2))
    amp = r.uniform(4, 22, (n, 2))
    frq = r.uniform(0.07, 0.33, (n, 2))
    ph = r.uniform(0, 6.283, (n, 4))
    sg = size[0] + (size[1] - size[0]) * r.random(n) ** 2.5
    br = r.uniform(0.35, 1.0, n) / (sg / size[0]) ** 1.3
    tw = r.uniform(0.15, 0.6, n)
    out = frame.astype(F32, copy=True)
    col = np.asarray(colour, F32)
    for i in range(n):
        x = (p0[i, 0] + vel[i, 0] * t + amp[i, 0] * math.sin(t * frq[i, 0] * 6.283 + ph[i, 0])) % (W + 80) - 40
        y = (p0[i, 1] + vel[i, 1] * t + amp[i, 1] * math.sin(t * frq[i, 1] * 6.283 + ph[i, 1])) % (H + 80) - 40
        xi, yi = int(round(x)), int(round(y))
        if not (0 <= xi < W and 0 <= yi < H):
            continue
        b = float(beam[yi, xi])
        vis = (b - threshold) / max(1e-3, 0.35)
        if vis <= 0:
            continue
        glint = 0.45 + 0.55 * abs(math.sin(t * tw[i] * 6.283 + ph[i, 2]))
        a = gain * br[i] * min(vis, 1.0) * b * glint
        if a < 0.004:
            continue
        s = sg[i]
        R = int(math.ceil(s * 3)) + 1
        x0, y0, x1, y1 = max(0, xi - R), max(0, yi - R), min(W, xi + R + 1), min(H, yi + R + 1)
        gx = np.exp(-0.5 * ((np.arange(x0, x1) - x) / s) ** 2).astype(F32)
        gy = np.exp(-0.5 * ((np.arange(y0, y1) - y) / s) ** 2).astype(F32)
        g = (gy[:, None] * gx[None, :] * a)[..., None]
        reg = out[y0:y1, x0:x1]
        reg += col[None, None] * np.clip(g, 0, 0.9) * (0.38 + 0.6 * (1.0 - reg))   # a lit speck; clearest over dark ink
        np.minimum(reg, 0.985, out=reg)
    return out


def hand_monkey(W, H, pos=(0, 0), scale=1.0, seed=0, t=None):
    """A synthetic hand-shadow monkey head in profile on a forearm (for demos): returns an HxW mask.
    With t given, the jaw (thumb) opens and closes slowly."""
    m = np.zeros((H, W), F32)
    s = scale
    ox, oy = pos

    def P(pts):
        return np.array([[ox + x * s, oy + y * s] for x, y in pts], np.int32)
    jaw = 0.0 if t is None else 0.5 + 0.5 * math.sin(t * 2.2)
    # forearm rising from the bottom edge, wrist, fist (skull), brow of knuckles, muzzle of fingers, thumb = jaw
    cv2.fillPoly(m, [P([(-80, 1400), (90, 1400), (58, 250), (-50, 240)])], 1.0, cv2.LINE_AA)
    cv2.ellipse(m, (int(ox + 5 * s), int(oy + 150 * s)), (int(108 * s), int(120 * s)), -12, 0, 360, 1.0, -1, cv2.LINE_AA)
    cv2.ellipse(m, (int(ox + 105 * s), int(oy + 150 * s)), (int(88 * s), int(52 * s)), 8, 0, 360, 1.0, -1, cv2.LINE_AA)
    cv2.ellipse(m, (int(ox + 60 * s), int(oy + 78 * s)), (int(62 * s), int(34 * s)), -18, 0, 360, 1.0, -1, cv2.LINE_AA)
    cv2.ellipse(m, (int(ox - 70 * s), int(oy + 95 * s)), (int(34 * s), int(44 * s)), 20, 0, 360, 1.0, -1, cv2.LINE_AA)  # ear
    a = 22 + 26 * jaw
    cv2.ellipse(m, (int(ox + 85 * s), int(oy + (205 + 16 * jaw) * s)), (int(78 * s), int(22 * s)), a, 0, 360, 1.0, -1,
                cv2.LINE_AA)
    cv2.circle(m, (int(ox + 62 * s), int(oy + 112 * s)), int(11 * s), 0.0, -1, cv2.LINE_AA)       # the eye: a gap
    return blur(m, 1.5 * s)
