#!/usr/bin/env python3
"""Replace the AI-drawn ribbon bows on layout/assets/art/logos/sw_geese_print.png with ONE clean code-drawn bow
(two loops, a knot, two tails; symmetric), the same on every goose (Jade 2026-11-26: "the geese are basically fine but
the bows shouldn't be messed up like that"). Input: the v1 print (Codex image_gen) -> output: the print with new bows.
    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY tools/art/geese_bows.py <v1.png> <out.png>
"""
import sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA'); a = np.asarray(im).astype(int); H, W = a.shape[:2]
r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
opaque = al > 0
blue = (b > r + 25) & (b > g + 5) & opaque
lab, n = ndimage.label(ndimage.binary_closing(blue, iterations=2))
bows = [s for s in ndimage.find_objects(lab) if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > 1500]
bows.sort(key=lambda s: s[1].start)
assert len(bows) == 5, len(bows)

# 1. erase the old bows (blue + their dark ink outline): inside the goose -> body cream, outside -> transparent
dark = (a[..., :3].sum(axis=2) < 330) & opaque
old = ndimage.binary_dilation(blue, iterations=2)
old |= dark & ndimage.binary_dilation(blue, iterations=8)
old = ndimage.binary_dilation(old, iterations=1)
cream_px = a[opaque & ~old & ~blue & ~dark & (a[..., 0] > 225)]
cream = tuple(int(v) for v in np.median(cream_px[:, :4], axis=0)); cream = (*cream[:3], 255)
outline = (120, 82, 52, 255)
res = a.copy()
ys, xs = np.where(old)
keep = opaque & ~old
def ray(y, x, dy, dx):
    while 0 <= y < H and 0 <= x < W:
        if not old[y, x]: return keep[y, x]
        y += dy; x += dx
    return False
inside = np.zeros((H, W), bool)
for y, x in zip(ys, xs):
    inside[y, x] = (ray(y, x, -1, 0) and ray(y, x, 1, 0)) or (ray(y, x, 0, -1) and ray(y, x, 0, 1))
inside = ndimage.binary_opening(inside, iterations=1) & old
res[old] = (0, 0, 0, 0); res[inside] = cream
# re-ink the goose outline where the erase cut it: inside pixels that touch transparent
res[(res[..., 3] > 0) & ~ndimage.binary_opening(res[..., 3] > 0, iterations=3) & ndimage.binary_dilation(old, iterations=3)] = (0, 0, 0, 0)   # slivers
near = ndimage.binary_dilation(old, iterations=3)
edge = (res[..., 3] > 0) & near & ndimage.binary_dilation((res[..., 3] == 0), iterations=1)
res[edge] = outline
base = Image.fromarray(res.astype(np.uint8), 'RGBA')

# 2. one clean bow, drawn at 8x and scaled down (units: px of the print, knot at 0,0)
S = 8
FILL, SHADE, INK = (112, 146, 204, 255), (88, 120, 180, 255), (42, 56, 92, 255)
def bow_img(scale=1.0):
    k = S * scale; R = 44
    c = Image.new('RGBA', (2 * R * S, 2 * R * S), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    P = lambda pts: [(R * S + x * k, R * S + y * k) for x, y in pts]
    lw = max(2, round(1.6 * k))
    for s in (-1, 1):   # tails first (under the loops)
        t = [(s * 2, 3), (s * 13, 25), (s * 9, 23), (s * 6, 29), (s * -2, 5)]
        d.polygon(P(t), fill=FILL, outline=INK, width=lw)
    for s in (-1, 1):   # loops: a rounded teardrop each side
        # a smooth teardrop: the knot end pinched, the outer end round (a superellipse sampled at 60 points)
        L = []
        for i in range(60):
            th = 2 * np.pi * i / 60; cx_, rx, ry = 17.5, 13.5, 11.5
            ex = np.sign(np.cos(th)) * abs(np.cos(th)) ** 0.7; ey = np.sign(np.sin(th)) * abs(np.sin(th)) ** 0.9
            x = cx_ + rx * ex; w = 0.35 + 0.65 * min(1, max(0, (x - 4) / 14))   # pinch toward the knot
            L.append((s * x, -1.5 + ry * ey * w))
        d.polygon(P(L), fill=FILL, outline=INK, width=lw)
        d.line(P([(s * 7, -1), (s * 17, -6), (s * 25, -6)]), fill=SHADE, width=lw)   # one fold line per loop
        d.line(P([(s * 7, 1), (s * 17, 4), (s * 24, 4)]), fill=SHADE, width=lw)
    d.ellipse(P([(-5, -5.5), (5, 5.5)]), fill=FILL, outline=INK, width=lw)   # knot
    d.line(P([(-2, -3), (-2, 3)]), fill=SHADE, width=lw); d.line(P([(2, -3), (2, 3)]), fill=SHADE, width=lw)
    return c.resize((2 * R, 2 * R), Image.LANCZOS)

BOW = bow_img(1.0)
for sl in bows:   # the knot sits where the old bow's band crossed the neck: its vertical centre is the blue's row of max width
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    m = lab[sl] > 0
    cols = np.where(m.any(axis=0))[0]
    # neck centre: middle of the goose's opaque run just above the bow
    row = keep[max(0, y0 - 4)]; xs_ = np.where(row[x0:x1])[0] + x0
    cx = (xs_.min() + xs_.max()) / 2 if len(xs_) else (x0 + x1) / 2
    cy = y0 + 0.33 * (y1 - y0)
    base.alpha_composite(BOW, (int(round(cx - BOW.width / 2)), int(round(cy - BOW.height / 2))))
    print(f'bow at ({cx:.0f}, {cy:.0f}) (old bow box x {x0}-{x1}, y {y0}-{y1})')
base.save(out)
