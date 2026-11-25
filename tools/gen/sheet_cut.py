#!/usr/bin/env python3
"""Cut a model/pose sheet on bare paper into single figures (connected ink blobs), each on its own clean paper canvas.

    $PY tools/gen/sheet_cut.py SHEET.jpg OUT_PREFIX [--n=8] [--dilate=0.02] [--pad=0.04] [--min=0.002] [--canvas=16:9|tight]

Marks = pixels more than 28/255 from the paper colour (as tools/review/coverage.py). Blobs are merged by dilation (a fraction
of the sheet width) so thin plumes/staffs stay with their body; the N largest are kept, ordered row-major (top to bottom,
left to right) and saved as OUT_PREFIX_01.jpg ... with a bbox list in OUT_PREFIX_boxes.txt.
"""
import sys

import cv2
import numpy as np


def main(a):
    pos = [x for x in a if not x.startswith("--")]
    opt = {x.split("=")[0][2:]: x.split("=")[1] for x in a if x.startswith("--") and "=" in x}
    src, pre = pos
    n = int(opt.get("n", 0)); dil = float(opt.get("dilate", 0.02)); pad = float(opt.get("pad", 0.04))
    mn = float(opt.get("min", 0.002)); canvas = opt.get("canvas", "tight")
    img = cv2.imread(src); H, W = img.shape[:2]
    small = cv2.GaussianBlur(img, (5, 5), 0)
    lum = small.mean(axis=2)
    paper = np.median(small[lum >= np.percentile(lum, 60)], axis=0)
    mask = (np.abs(small.astype(int) - paper[None, None, :]).max(axis=2) > 28).astype(np.uint8)
    k = max(3, int(W * dil)) | 1
    m2 = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    cnt, lab, stats, cent = cv2.connectedComponentsWithStats(m2, 8)
    blobs = [(stats[i], cent[i]) for i in range(1, cnt) if stats[i][4] > mn * W * H]
    blobs.sort(key=lambda b: -b[0][4])
    if n: blobs = blobs[:n]
    rows = []
    for b in sorted(blobs, key=lambda b: b[1][1]):
        if rows and abs(b[1][1] - np.mean([r[1][1] for r in rows[-1]])) < H * 0.15: rows[-1].append(b)
        else: rows.append([b])
    order = [b for r in rows for b in sorted(r, key=lambda b: b[1][0])]
    p = int(pad * W)
    with open(pre + "_boxes.txt", "w") as fh:
        for i, (s, c) in enumerate(order, 1):
            x, y, w, h = s[:4]
            x0, y0, x1, y1 = max(0, x - p), max(0, y - p), min(W, x + w + p), min(H, y + h + p)
            crop = img[y0:y1, x0:x1].copy()
            # blank out ink from neighbouring figures that intrudes into the box
            own = (lab[y0:y1, x0:x1] == [j for j in range(1, cnt) if (stats[j] == s).all()][0])
            other = (mask[y0:y1, x0:x1] > 0) & ~cv2.dilate(own.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
            crop[other] = paper.astype(np.uint8)
            if canvas == "16:9":
                ch, cw = crop.shape[:2]; tw = max(cw, int(ch * 16 / 9)); th = max(ch, int(tw * 9 / 16))
                out = np.zeros((th, tw, 3), np.uint8); out[:] = paper.astype(np.uint8)
                oy, ox = (th - ch) // 2, (tw - cw) // 2; out[oy:oy + ch, ox:ox + cw] = crop; crop = out
            name = f"{pre}_{i:02d}.jpg"
            cv2.imwrite(name, crop, [cv2.IMWRITE_JPEG_QUALITY, 94])
            fh.write(f"{name}\t{x0},{y0},{x1 - x0},{y1 - y0}\n")
            print(name, crop.shape[1], "x", crop.shape[0])


if __name__ == "__main__":
    main(sys.argv[1:])
