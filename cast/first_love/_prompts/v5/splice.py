#!/usr/bin/env python3
"""Keep the approved left two columns of an old sheet pixel-identical and take the right column from a new take.

    python splice.py OLD.jpg NEW.jpg OUT.png SEAM_X0 SEAM_X1

Left of SEAM_X0 is OLD exactly; right of SEAM_X1 is NEW (paper tint nudged to OLD's paper); between, a linear blend
over bare paper. Writes PNG so the kept pixels stay identical (no re-encode).
"""
import sys
import numpy as np
from PIL import Image
old_p, new_p, out, x0, x1 = sys.argv[1:6]
x0, x1 = int(x0), int(x1)
old = np.asarray(Image.open(old_p).convert("RGB")).astype(float)
new = np.asarray(Image.open(new_p).convert("RGB")).astype(float)
assert old.shape == new.shape, (old.shape, new.shape)
band_o, band_n = old[:, x0:x1].reshape(-1, 3), new[:, x0:x1].reshape(-1, 3)
shift = np.median(band_o, 0) - np.median(band_n, 0)          # paper tint offset, measured on bare paper
print("paper shift", shift)
new = np.clip(new + shift, 0, 255)
w = np.zeros(old.shape[1]); w[x1:] = 1; w[x0:x1] = np.linspace(0, 1, x1 - x0)
res = old * (1 - w)[None, :, None] + new * w[None, :, None]
res[:, :x0] = old[:, :x0]
Image.fromarray(np.round(res).astype(np.uint8)).save(out)
