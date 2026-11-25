#!/usr/bin/env python3
"""Contact sheet: sheet.py OUT.jpg img1 img2 ... [--crop x0,y0,x1,y1 fractions]  (labels = file names)"""
import sys
from PIL import Image, ImageDraw
args = sys.argv[1:]; crop = None
if "--crop" in args:
    i = args.index("--crop"); crop = [float(v) for v in args[i + 1].split(",")]; del args[i:i + 2]
out, ims = args[0], args[1:]
tiles = []
for p in ims:
    im = Image.open(p).convert("RGB")
    if crop:
        W, H = im.size; im = im.crop((int(crop[0] * W), int(crop[1] * H), int(crop[2] * W), int(crop[3] * H)))
    im.thumbnail((800, 800)); d = ImageDraw.Draw(im); d.rectangle((0, 0, 260, 22), fill=(255, 255, 255)); d.text((4, 4), p.split("/")[-1], fill=(0, 0, 0))
    tiles.append(im)
cols = 2 if len(tiles) > 1 else 1; rows = (len(tiles) + cols - 1) // cols
w, h = tiles[0].size
S = Image.new("RGB", (w * cols, h * rows), "white")
for i, t in enumerate(tiles):
    S.paste(t, ((i % cols) * w, (i // cols) * h))
S.save(out, quality=88)
