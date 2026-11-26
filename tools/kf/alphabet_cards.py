#!/usr/bin/env python3
"""office91's alphabet line as ONE fixed strip: layout/assets/art/office91/alphabet_cards.png (26 cards side by side).

    PY=/home/jade/Documents/halys-video/.venv/bin/python ; $PY tools/kf/alphabet_cards.py

The 26 pictures come from alphabet_icons.png (Codex, a 7 x 4 grid, see its .txt); this script finds each picture as
the largest non-white blob in its grid cell, and draws the letters itself (Aa ... Zz in ball-and-stick print with
red / blue handwriting guide lines, as 1991 classroom alphabet cards were), so no letter is drawn by an image model.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = os.path.join(ROOT, "layout/assets/art/office91")
CW, CH = 256, 300                     # one card (0.128 x 0.15 m in the set, 0.94 of the pitch)
COLS = [(176, 48, 48), (42, 90, 154), (42, 122, 58)]   # red, blue, green letters in turn (as build.js had them)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def icons():
    im = Image.open(os.path.join(D, "alphabet_icons.png")).convert("RGB"); a = np.asarray(im).astype(int)
    H, W = a.shape[:2]; ink = (a.min(axis=2) < 215)
    out = []
    for k in range(26):
        r, c = divmod(k, 7); x0, x1, y0, y1 = c * W // 7, (c + 1) * W // 7, r * H // 4, (r + 1) * H // 4
        cell = ndimage.binary_closing(ink[y0:y1, x0:x1], iterations=3); lab, n = ndimage.label(cell)
        if n == 0: raise SystemExit(f"no picture in cell {k}")
        sizes = ndimage.sum(cell, lab, range(1, n + 1)); keep = np.isin(lab, 1 + np.where(sizes > sizes.max() * 0.08)[0])
        ys, xs = np.where(keep); bx = (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)
        out.append(im.crop(bx))
    return out


def main():
    pics = icons(); strip = Image.new("RGB", (CW * 26, CH), (248, 244, 232)); d = ImageDraw.Draw(strip)
    f = ImageFont.truetype(FONT, 138)   # caps reach the top line
    for k in range(26):
        x = k * CW
        d.rectangle([x, 0, x + CW - 1, CH - 1], outline=(200, 194, 178), width=3)
        top, mid, base = 22, 76, 130          # handwriting lines: blue top and base, red dashed midline
        d.line([x + 10, top, x + CW - 10, top], fill=(70, 110, 200), width=3); d.line([x + 10, base, x + CW - 10, base], fill=(70, 110, 200), width=3)
        for xx in range(x + 10, x + CW - 10, 16): d.line([xx, mid, xx + 8, mid], fill=(210, 70, 70), width=2)
        L = chr(65 + k) + chr(97 + k); col = COLS[k % 3]
        ff = f; bb = d.textbbox((0, 0), L, font=ff, anchor="ls"); w = bb[2] - bb[0]
        if w > CW - 20: ff = ImageFont.truetype(FONT, int(138 * (CW - 20) / w)); bb = d.textbbox((0, 0), L, font=ff, anchor="ls"); w = bb[2] - bb[0]   # Mm, Ww
        d.text((x + (CW - w) / 2, base), L, font=ff, fill=col, anchor="ls")
        p = pics[k]; s = min((CW - 60) / p.width, (CH - base - 48) / p.height); p = p.resize((max(1, round(p.width * s)), max(1, round(p.height * s))), Image.LANCZOS)
        a = np.asarray(p.convert("RGB")).astype(int); alpha = np.clip((250 - a.min(axis=2)) * 8, 0, 255).astype(np.uint8)   # the icon sheet's white -> the card shows through
        p = p.convert("RGBA"); p.putalpha(Image.fromarray(alpha))
        strip.paste(p, (x + (CW - p.width) // 2, base + 36 + (CH - base - 42 - p.height) // 2), p)
    strip.save(os.path.join(D, "alphabet_cards.png"))
    with open(os.path.join(D, "alphabet_cards.txt"), "w") as fh:
        fh.write("office91 alphabet line: 26 cards Aa..Zz in one strip (256 x 300 px each = 0.128 x 0.15 m).\n"
                 "Made by tools/kf/alphabet_cards.py: letters drawn in code (DejaVu Sans Bold, red/blue/green in turn, "
                 "blue top and base lines, red dashed midline); pictures cropped from alphabet_icons.png (Codex).\n"
                 "INVENTED: which picture stands for each letter (apple, beach ball, cat, dog, elephant, fish, grapes, house, "
                 "ice cream, jam, kite, lemon, moon, nest, octopus, pig, queen's crown, rabbit, sun, tree, umbrella, violin, "
                 "watermelon, xylophone, yo-yo, zebra); A-M follow what the r3 painting PC1_v1 showed.\n")
    print("ok", strip.size)


if __name__ == "__main__":
    main()
