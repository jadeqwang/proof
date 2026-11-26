# Build the IAS hoodie chest-print texture (a solid blue disc, the seal in white reverse, lettering round the rim) from
# the approved seal image in work/ias/ (Jade, 2026-11-25: work/ias/ may be used as texture/reference).
#   .venv/bin/python -I layout/sets/mortongrove07/sweatshirt_print.py
# -> work/ias/ias_print_tex.png (1024 x 1024, RGBA, transparent outside the disc) and work/ias/ias_print_truthmask.png
#    (white = the figure of Truth, for checking). Both stay in gitignored work/: the texture shows Truth legibly.
# Texture space = the disc's bounding square; the sim (sweatshirt_sim.js PRINT) maps it to the chest.
import math, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
SRC = os.path.join(REPO, 'work/ias/ias_seal_ref.png')
OUT = os.path.join(REPO, 'work/ias/ias_print_tex.png')
MASK = os.path.join(REPO, 'work/ias/ias_print_truthmask.png')
N = 1024; C = N / 2; R = N / 2 - 4
BLUE = (38, 84, 160, 255); WHITE = (250, 250, 248, 255)
R_IN = 0.74 * R        # the inner circle (the seal art lives inside it)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def arc_text(img, text, radius, centre_deg, size, top=True, spacing=1.0):
    """Letters round a circle; top=True reads clockwise across the top, False reads left-to-right across the bottom."""
    f = ImageFont.truetype(FONT, size)
    widths = [f.getlength(ch) * spacing for ch in text]
    total = sum(widths); ang = total / radius   # radians spanned
    a = math.radians(centre_deg) - (ang / 2 if top else -ang / 2)
    for ch, w in zip(text, widths):
        da = w / radius; mid = a + (da / 2 if top else -da / 2)
        x = C + radius * math.sin(mid); y = C - radius * math.cos(mid)
        tile = Image.new('RGBA', (size * 2, size * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(tile)
        d.text((size, size), ch, font=f, fill=WHITE, anchor='mm')
        rot = -math.degrees(mid) if top else 180 - math.degrees(mid)
        tile = tile.rotate(rot, resample=Image.BICUBIC)
        img.alpha_composite(tile, (int(round(x - size)), int(round(y - size))))
        a = a + da if top else a - da

def main():
    img = Image.new('RGBA', (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.ellipse([C - R, C - R, C + R, C + R], fill=BLUE)
    w = max(3, int(N * 0.006))
    d.ellipse([C - R * 0.955, C - R * 0.955, C + R * 0.955, C + R * 0.955], outline=WHITE, width=w)
    d.ellipse([C - R_IN, C - R_IN, C + R_IN, C + R_IN], outline=WHITE, width=w)
    band = (R * 0.955 + R_IN) / 2
    arc_text(img, 'INSTITUTE FOR ADVANCED STUDY', band, 0, int(R * 0.12), top=True, spacing=1.12)
    arc_text(img, 'FOUNDED 1930', band, 180, int(R * 0.11), top=False, spacing=1.12)
    for s in (-1, 1):   # two small stars between the words
        a = math.radians(180 + s * 66); x = C + band * math.sin(a); y = C - band * math.cos(a); r = R * 0.025
        d.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)
    truth = np.zeros((N, N), np.uint8)
    if os.path.exists(SRC):
        src = Image.open(SRC).convert('L'); sa = np.asarray(src).astype(float)
        # the seal circle in the source: centre (239.5, 177), radius 140 px (measured); its own rim line is dropped
        scx, scy, sr = 239.5, 177.0, 140.0
        k = (R_IN * 0.97) / (sr * 0.985)
        ys, xs = np.mgrid[0:N, 0:N]
        u = scx + (xs - C) / k; v = scy + (ys - C) / k
        inside = (xs - C) ** 2 + (ys - C) ** 2 < (R_IN * 0.95) ** 2
        ui = np.clip(u.round().astype(int), 0, src.width - 1); vi = np.clip(v.round().astype(int), 0, src.height - 1)
        ink = np.clip((235 - sa[vi, ui]) / 120.0, 0, 1) * inside
        a = (ink * 255).astype(np.uint8)
        lines = Image.new('RGBA', (N, N), WHITE); lines.putalpha(Image.fromarray(a).filter(ImageFilter.GaussianBlur(0.6)))
        img.alpha_composite(lines)
        # Truth's figure in the source: x 150..247, y 50..292 (measured on the art; hand-in-hand at x ~240)
        tm = (u > 150) & (u < 247) & (v > 48) & (v < 294) & inside
        truth[tm] = 255
    else:
        print('no seal art at', SRC, '- plain disc with lettering only', file=sys.stderr)
    img.save(OUT); Image.fromarray(truth).save(MASK)
    ys, xs = np.nonzero(truth)
    if len(xs): print('truth box in texture (0..1, x right, y down):', round(xs.min() / N, 3), round(xs.max() / N, 3), round(ys.min() / N, 3), round(ys.max() / N, 3))
    print(OUT)

main()

# a check texture: the print with Truth's figure painted solid red (sweatshirt_test.mjs counts red pixels in a render
# made with it to verify that Truth is hidden): work/ias/ias_print_check.png
def check():
    tex = Image.open(OUT).convert('RGBA'); m = np.asarray(Image.open(MASK)) > 0
    a = np.asarray(tex).copy(); a[m] = (255, 0, 0, 255); Image.fromarray(a).save(os.path.join(REPO, 'work/ias/ias_print_check.png'))
check()
