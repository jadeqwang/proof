"""tools.ink.core: shared primitives. Images are float32 numpy arrays, sRGB-encoded, 0..1.

Three kinds of picture data flow through the engine:
  frame  HxWx3  an opaque picture (paper with everything on it)
  ink    HxWx3  a TRANSMITTANCE layer: 1 = bare paper, <1 = ink/wash absorbing light. Laid with multiply, so separately
                made elements sit on one sheet with no rectangle and no halo, and overlapping washes darken like ink.
  rgba   HxWx4  an opaque-pigment layer (seal paste, gold, white gouache, leather), straight alpha, laid with "over".
Everything is deterministic: all randomness comes from rng(seed, *keys).
"""
import hashlib
import math
from pathlib import Path

import cv2
import numpy as np

FPS = 24
ROOT = Path(__file__).resolve().parents[2]
F32 = np.float32

# Ink absorbs a little more blue than red when thin (warm grey washes), and goes neutral-cool when dense.
INK_K = np.array([3.05, 3.12, 3.2], F32)             # Beer-Lambert coefficients for carbon ink, density 1 -> T ~ 0.045
CINNABAR = np.array([0.74, 0.16, 0.10], F32)         # oily seal paste (朱砂印泥)
INDIGO = np.array([0.20, 0.29, 0.42], F32)
OCHRE = np.array([0.72, 0.53, 0.26], F32)
GOLD = np.array([0.86, 0.66, 0.24], F32)
MALACHITE = np.array([0.25, 0.50, 0.42], F32)
PAPER_NEW = np.array([0.925, 0.895, 0.825], F32)
PAPER_AGED = np.array([0.865, 0.805, 0.675], F32)


# --------------------------------------------------------------------------------------------------------------------
# determinism

def rng(seed, *keys):
    """A numpy Generator from an integer seed plus any hashable keys (strings, ints). Same inputs, same stream."""
    h = hashlib.blake2b(repr((seed,) + keys).encode(), digest_size=8).digest()
    return np.random.default_rng(int.from_bytes(h, 'little'))


# --------------------------------------------------------------------------------------------------------------------
# scalar helpers (work on floats and arrays)

def clamp(x, a=0.0, b=1.0):
    return np.clip(x, a, b)


def lerp(a, b, u):
    return a + (b - a) * u


def smoothstep(a, b, x):
    if np.isscalar(a) and np.isscalar(b) and a == b:
        return (np.asarray(x) >= a).astype(F32) if isinstance(x, np.ndarray) else float(x >= a)
    u = np.clip((x - a) / (b - a), 0.0, 1.0)
    return u * u * (3.0 - 2.0 * u)


def ease(u, kind='inout'):
    """Easing on 0..1. kinds: linear, in, out, inout (cubic), sine, expo_out, back_out (overshoot), settle."""
    u = float(min(1.0, max(0.0, u)))
    if kind == 'linear':
        return u
    if kind == 'in':
        return u * u * u
    if kind == 'out':
        return 1 - (1 - u) ** 3
    if kind == 'inout':
        return 4 * u * u * u if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2
    if kind == 'sine':
        return 0.5 - 0.5 * math.cos(math.pi * u)
    if kind == 'expo_out':
        return 1.0 if u >= 1 else 1 - 2 ** (-10 * u)
    if kind == 'back_out':
        c = 1.70158
        return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2
    if kind == 'settle':                       # fast arrival, long soft landing (camera coming to rest on a page)
        return 1 - (1 - u) ** 5
    raise ValueError(kind)


def ramp(t, t0, t1, kind='inout'):
    """0 before t0, 1 after t1, eased between."""
    if t1 <= t0:
        return 1.0 if t >= t0 else 0.0
    return ease((t - t0) / (t1 - t0), kind)


def hit_frame(t):
    """The 24 fps frame that CONTAINS song time t (floor): a hit's first visible frame (fix round 2 sync rule)."""
    return int(math.floor(t * FPS + 1e-6))


def on_frame(t):
    """Song time t snapped back to the start of the frame that contains it. Trigger on `t >= on_frame(t_hit)` so a
    hit is fully visible on the frame that contains its audio event (never a frame later)."""
    return hit_frame(t) / FPS


def frame_of(t):
    """The timing map's rule: the first 24 fps frame that starts at or after t."""
    return int(math.ceil(t * FPS - 1e-9))


# --------------------------------------------------------------------------------------------------------------------
# image helpers

def luma(img):
    return (img[..., 0] * 0.2126 + img[..., 1] * 0.7152 + img[..., 2] * 0.0722).astype(F32)


def blur(img, sigma):
    if sigma <= 0.05:
        return img
    return cv2.GaussianBlur(img, (0, 0), float(sigma), borderType=cv2.BORDER_REFLECT)


def resize(img, w, h, interp=None):
    """Resize with a filter that does not shimmer: area when shrinking, cubic when enlarging."""
    if img.shape[1] == w and img.shape[0] == h:
        return img
    if interp is None:
        interp = cv2.INTER_AREA if (w < img.shape[1] or h < img.shape[0]) else cv2.INTER_CUBIC
    return cv2.resize(img, (int(w), int(h)), interpolation=interp)


def load_image(path, size=None, alpha=False):
    """Read an image file as float32 sRGB 0..1. RGB (HxWx3), or RGBA if alpha=True (opaque alpha added if absent).
    size=(w, h) resizes."""
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    a = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    if a is None:
        raise FileNotFoundError(str(p))
    div = 65535.0 if a.dtype == np.uint16 else 255.0
    a = a.astype(F32) / div
    if a.ndim == 2:
        a = np.repeat(a[..., None], 3, 2)
    if a.shape[2] == 4:
        a = a[..., [2, 1, 0, 3]]
        if not alpha:
            a = a[..., :3] * a[..., 3:] + (1 - a[..., 3:])       # flatten on white
    else:
        a = a[..., ::-1]
        if alpha:
            a = np.dstack([a, np.ones(a.shape[:2], F32)])
    a = np.ascontiguousarray(a)
    if size:
        a = resize(a, size[0], size[1])
    return a


def load_mask(path, size=None):
    """Read a mask as float32 HxW 0..1 (alpha channel if the file has one, else luminance)."""
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    a = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    if a is None:
        raise FileNotFoundError(str(p))
    a = a.astype(F32) / (65535.0 if a.dtype == np.uint16 else 255.0)
    m = a if a.ndim == 2 else (a[..., 3] if a.shape[2] == 4 else a[..., :3].mean(2))
    if size:
        m = resize(m, size[0], size[1])
    return np.ascontiguousarray(m)


def to_u8(img):
    return (np.clip(img, 0, 1) * 255.0 + 0.5).astype(np.uint8)


def save_image(path, img):
    """Write float (RGB, RGBA or grey) to PNG/JPG."""
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    p.parent.mkdir(parents=True, exist_ok=True)
    a = to_u8(img)
    if a.ndim == 3:
        a = a[..., ::-1] if a.shape[2] == 3 else a[..., [2, 1, 0, 3]]
    par = [cv2.IMWRITE_PNG_COMPRESSION, 2] if p.suffix.lower() == '.png' else [cv2.IMWRITE_JPEG_QUALITY, 93]
    cv2.imwrite(str(p), a, par)
    return p


# --------------------------------------------------------------------------------------------------------------------
# noise (all seeded, all resolution-stable: the lattice is defined by `cell`, so halving size and cell gives the same field)

def value_noise(h, w, cell, seed, *keys):
    """Smooth noise in 0..1, feature size ~cell px."""
    cell = max(1.0, float(cell))
    gh, gw = int(math.ceil(h / cell)) + 3, int(math.ceil(w / cell)) + 3
    g = rng(seed, 'vn', *keys).random((gh, gw), dtype=F32)
    big = cv2.resize(g, (int(round(gw * cell)), int(round(gh * cell))), interpolation=cv2.INTER_CUBIC)
    o = int(cell)
    return np.ascontiguousarray(np.clip(big[o:o + h, o:o + w], 0, 1))


def fbm(h, w, cell, seed, *keys, octaves=4, gain=0.5):
    """Fractal noise in ~0..1 (mean 0.5), largest feature ~cell px."""
    out = np.zeros((h, w), F32)
    amp, tot, c = 1.0, 0.0, float(cell)
    for o in range(octaves):
        if c < 1.5:
            break
        out += amp * value_noise(h, w, c, seed, 'fbm', o, *keys)
        tot += amp
        amp *= gain
        c /= 2.0
    return out / max(tot, 1e-6)


def grain(h, w, seed, *keys, sigma=0.6):
    """Fine zero-mean, unit-variance grain, softened by `sigma` px."""
    g = rng(seed, 'grain', *keys).standard_normal((h, w), dtype=F32)
    if sigma > 0:
        g = blur(g, sigma)
        g /= max(float(g.std()), 1e-6)
    return g


def warp_field(img, dx, dy, border=cv2.BORDER_REFLECT):
    """Displace an image by per-pixel offsets (px)."""
    h, w = img.shape[:2]
    xx, yy = np.meshgrid(np.arange(w, dtype=F32), np.arange(h, dtype=F32))
    return cv2.remap(img, xx + dx.astype(F32), yy + dy.astype(F32), cv2.INTER_LINEAR, borderMode=border)


def rough_mask(mask, amount, cell, seed, *keys):
    """Make a hard-edged mask irregular: displace it by a noise field (amount px, feature size cell px)."""
    h, w = mask.shape[:2]
    dx = (fbm(h, w, cell, seed, 'rx', *keys, octaves=3) - 0.5) * 2 * amount
    dy = (fbm(h, w, cell, seed, 'ry', *keys, octaves=3) - 0.5) * 2 * amount
    return warp_field(mask, dx, dy, border=cv2.BORDER_CONSTANT)


# --------------------------------------------------------------------------------------------------------------------
# ink and pigment

def ink_T(density, k=INK_K, tint=None):
    """Ink density map (HxW, 0..~1.3) -> transmittance layer (HxWx3). Beer-Lambert, so washes build up like real ink.
    tint: an RGB colour for coloured washes (the wash at density 1 shows roughly that colour on white paper)."""
    d = np.maximum(density, 0)[..., None].astype(F32)
    if tint is not None:
        k = -np.log(np.clip(np.asarray(tint, F32), 0.02, 0.98))
    return np.exp(-d * np.asarray(k, F32)).astype(F32)


def density_of(T):
    """Approximate ink density (0..1) of a transmittance layer: how far the darkest channel is from bare paper."""
    return (1.0 - T.min(axis=2)).astype(F32)


def lay_ink(frame, T, x=0, y=0, opacity=1.0):
    """Multiply an ink layer onto a frame in place at integer offset (x, y); clips to the frame. Returns frame."""
    H, W = frame.shape[:2]
    h, w = T.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return frame
    t = T[y0 - y:y1 - y, x0 - x:x1 - x]
    if t.ndim == 2:
        t = t[..., None]
    if opacity < 1.0:
        t = 1.0 - (1.0 - t) * opacity
    frame[y0:y1, x0:x1] *= t
    return frame


def over(frame, rgba, x=0, y=0, opacity=1.0):
    """Composite a straight-alpha RGBA layer over a frame in place at integer offset (x, y). Returns frame."""
    H, W = frame.shape[:2]
    h, w = rgba.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return frame
    s = rgba[y0 - y:y1 - y, x0 - x:x1 - x]
    a = s[..., 3:4] * opacity
    frame[y0:y1, x0:x1] = frame[y0:y1, x0:x1] * (1 - a) + s[..., :3] * a
    return frame


def place(layer, W, H, x, y, fill=None):
    """Put a small layer on a W x H canvas of its 'empty' value (ink: 1, rgba: 0, mask: 0) at offset (x, y)."""
    c = layer.shape[2] if layer.ndim == 3 else 0
    if fill is None:
        fill = 1.0 if c == 3 else 0.0
    out = np.full((H, W, c) if c else (H, W), fill, F32)
    h, w = layer.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 > x0 and y1 > y0:
        out[y0:y1, x0:x1] = layer[y0 - y:y1 - y, x0 - x:x1 - x]
    return out


def transform(layer, scale=1.0, angle=0.0, tx=0.0, ty=0.0, out_size=None, center=None, fill=None):
    """Scale/rotate (degrees, about `center`, default the layer centre) then translate. Good filtering both ways.
    fill defaults to the layer's empty value (ink 1, rgba/mask 0)."""
    h, w = layer.shape[:2]
    c = layer.shape[2] if layer.ndim == 3 else 0
    if fill is None:
        fill = 1.0 if c == 3 else 0.0
    cx, cy = center if center else (w / 2.0, h / 2.0)
    src = layer
    s = float(scale)
    while s < 0.6 and min(src.shape[:2]) > 8:         # mip down so the final warp never skips texels
        src = cv2.resize(src, (max(1, src.shape[1] // 2), max(1, src.shape[0] // 2)), interpolation=cv2.INTER_AREA)
        s *= 2.0
        cx, cy = cx / 2.0, cy / 2.0
    M = cv2.getRotationMatrix2D((cx, cy), angle, s)       # maps mip coords about the mip centre
    k = scale / s                                          # mip factor: original centre = mip centre / k
    M[0, 2] += tx + (cx / k - cx)
    M[1, 2] += ty + (cy / k - cy)
    W, H = out_size if out_size else (w, h)
    bv = (fill,) * (c if c else 1)
    return cv2.warpAffine(src, M, (int(W), int(H)), flags=cv2.INTER_CUBIC if s >= 0.95 else cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=bv)


def bbox(mask, thr=0.01, pad=0):
    ys, xs = np.where(mask > thr)
    if len(xs) == 0:
        return 0, 0, mask.shape[1], mask.shape[0]
    return (max(0, xs.min() - pad), max(0, ys.min() - pad),
            min(mask.shape[1], xs.max() + 1 + pad), min(mask.shape[0], ys.max() + 1 + pad))


def hsv_of(img):
    return cv2.cvtColor(np.clip(img, 0, 1).astype(F32), cv2.COLOR_RGB2HSV)      # H 0..360, S 0..1, V 0..1


def contact_strip(frames, cols=None, pad=4, bg=0.12):
    """Tile frames (same size) into one image."""
    n = len(frames)
    cols = cols or n
    rows = int(math.ceil(n / cols))
    h, w = frames[0].shape[:2]
    out = np.full((rows * h + (rows + 1) * pad, cols * w + (cols + 1) * pad, 3), bg, F32)
    for i, f in enumerate(frames):
        r, c = divmod(i, cols)
        out[pad + r * (h + pad):pad + r * (h + pad) + h, pad + c * (w + pad):pad + c * (w + pad) + w] = f[..., :3]
    return out
