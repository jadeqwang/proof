#!/usr/bin/env python3
"""Tight face crops of the cast head sheets for the r4 painters (2026-11-27 face-drift fix).

A whole 6-view head sheet is a weak identity signal next to three layout guides (and the 3D guides now carry a generic
mesh face). The crop keeps the sheet's top row, front + three-quarter heads, large: media/keyframes/r4/_faces/<key>.png.
Run: python3 tools/kf/face_crops.py   (PIL; boxes are fractions of the sheet: x0, y0, x1, y1)
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "media", "keyframes", "r4", "_faces")
TOP2 = (0.0, 0.0, 0.667, 0.485)
CROPS = {
    "mama": ("inputs/refs_chaosmonkey/mama/mama_H_heads_v3.jpg", TOP2),
    "dad37": ("cast/dad/dad_H_heads_v5_likeness.jpg", TOP2),
    "lj07": ("cast/little_jade_07/lj07_H_heads_v1.jpg", TOP2),
    "lj10": ("cast/little_jade_10/lj10_H_heads_v1.jpg", TOP2),
    "lj05": ("inputs/refs_chaosmonkey/little_jade/lj_H_heads_v3.jpg", TOP2),
    "jade19": ("cast/jade_19/jade19_H_heads_v1.jpg", TOP2),
    "jade27": ("cast/jade_27/jade27_H_heads_v1.jpg", TOP2),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for k, (p, (x0, y0, x1, y1)) in CROPS.items():
        im = Image.open(os.path.join(ROOT, p)).convert("RGB")
        W, H = im.size
        c = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
        if c.width < 1600:
            c = c.resize((1600, int(c.height * 1600 / c.width)), Image.LANCZOS)
        c.save(os.path.join(OUT, k + ".png"))
        print(k, c.size)


if __name__ == "__main__":
    main()
