#!/usr/bin/env python3
"""Lock the paper: register every stage to the blank plate and extract the plant as a multiplicative ink+wash layer.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY scripts/layers.py [sNN ...]       # default: every stages/sNN.png

Output (work res WxH = 2560x1440):
    layers/plate.png            the one shared sheet (upscaled from stages/plate.png); every frame is plate * layer
    layers/sNN_layer.png        16-bit RGB, 1.0 = paper (transparent), darker = ink and wash
    layers/sNN_check.jpg        plate * layer, for eyeballing
Method: ECC affine registration of the stage onto the plate using only the sheet outside the plant (plate mark, caption,
paper edge); plant mask = where the blurred stage differs from the blurred plate (Lab distance), closed, dilated, feathered;
layer = stage / (the stage's own smooth paper colour), with paper-level values lifted to exactly 1 so the stage's own paper
grain never shows: only the plate's grain is ever seen.
"""
import glob, os, sys
import cv2, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); BASE = os.path.dirname(HERE)
W, H = 2560, 1440
OUT = os.path.join(BASE, "layers"); os.makedirs(OUT, exist_ok=True)
LIFT = 0.955      # stage/paper ratios above this are paper -> 1.0

def load(p):
    im = cv2.imread(p, cv2.IMREAD_COLOR).astype(np.float32) / 255.0
    return cv2.resize(im, (W, H), interpolation=cv2.INTER_LANCZOS4).clip(0, 1)

plate = load(os.path.join(BASE, "stages", "plate.png"))
cv2.imwrite(os.path.join(OUT, "plate.png"), (plate * 65535).astype(np.uint16))
pg = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
plab = cv2.cvtColor(cv2.GaussianBlur(plate, (0, 0), 3), cv2.COLOR_BGR2Lab)

def _hp(g):
    return g - cv2.GaussianBlur(g, (0, 0), 6)

def register(st):
    """Translation only, by phase correlation of the engraved caption (the one sharp feature every stage shares with the plate)."""
    y0, y1, x0, x1 = int(H * .86), int(H * .96), int(W * .33), int(W * .67)
    sg = cv2.cvtColor(st, cv2.COLOR_BGR2GRAY)
    a, b = _hp(pg)[y0:y1, x0:x1], _hp(sg)[y0:y1, x0:x1]
    win = cv2.createHanningWindow(a.shape[::-1], cv2.CV_32F)
    (dx, dy), resp = cv2.phaseCorrelate(a, b, win)
    if resp < 0.08 or abs(dx) > 40 or abs(dy) > 40:
        print("  caption correlation weak (%.3f, %.1f, %.1f): identity" % (resp, dx, dy)); dx = dy = 0.0
    warp = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(st, warp, (W, H), flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT), (round(dx, 2), round(dy, 2), round(resp, 3))

def paper_field(st, off, f=8):
    """The stage's own paper colour as a smooth field: per-channel quadratic surface fitted to the off-plant paper."""
    sm = cv2.resize(cv2.GaussianBlur(st, (0, 0), f), (W // f, H // f), interpolation=cv2.INTER_AREA)
    om = cv2.resize(off.astype(np.uint8), (W // f, H // f), interpolation=cv2.INTER_NEAREST).astype(bool)
    om[:3] = om[-3:] = False; om[:, :3] = om[:, -3:] = False                 # stay off the sheet edge and plate mark
    om[int(H * .84 / f):] = False                                                # and off the caption
    yy, xx = np.mgrid[0:H // f, 0:W // f].astype(np.float32); xx /= W // f; yy /= H // f
    A = np.stack([np.ones_like(xx), xx, yy, xx * xx, yy * yy, xx * yy], -1)
    out = np.empty_like(sm)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A[om], sm[..., c][om], rcond=None)
        out[..., c] = A @ coef
    return cv2.resize(out, (W, H), interpolation=cv2.INTER_CUBIC)

MOUND_Y0, MOUND_Y1 = 0.745, 0.845      # the band (fractions of sheet height) where the earth lives

def lock_mound(L):
    """Every stage shows the SAME earth: in the ground band, keep the stage's own pixels only where they are plant
    (green/grey absorption: red absorbed at least as much as green), and take everything else from s00, the bare mound."""
    ref = os.path.join(OUT, "s00_layer.png")
    if not os.path.exists(ref):
        print("  (no s00 layer yet: mound not locked)"); return L
    L0 = cv2.imread(ref, cv2.IMREAD_UNCHANGED).astype(np.float32) / 65535.0
    ab = 1 - L
    d = (ab[..., 2] - ab[..., 1]) / (ab.sum(2) + 0.02)          # BGR: (absR - absG) / total; earth ~ -0.12, plant ~ +0.02
    ink = ab.sum(2)
    p = np.clip((d + 0.06) / 0.05, 0, 1) * np.clip(ink / 0.06, 0, 1)
    p = cv2.GaussianBlur(cv2.dilate(p, np.ones((3, 3), np.uint8)), (0, 0), 1.2)[..., None]
    yy = np.arange(H, dtype=np.float32)[:, None, None] / H
    z = np.clip((yy - MOUND_Y0) / 0.02, 0, 1) * np.clip((MOUND_Y1 - yy) / 0.005, 0, 1)
    locked = p * L + (1 - p) * L0                                  # plant pixels from the stage, the rest from the bare mound
    return z * locked + (1 - z) * L

def layer(name):
    st, warp = register(load(os.path.join(BASE, "stages", name + ".png")))
    lab = cv2.cvtColor(cv2.GaussianBlur(st, (0, 0), 3), cv2.COLOR_BGR2Lab)
    d = np.linalg.norm((lab - plab) * np.array([1, 1.6, 1.6], np.float32), axis=2)
    m = (d > 7).astype(np.uint8)
    m[int(H * .845):, :] = 0                                             # caption zone always from the plate
    m[:int(H * .02), :] = 0; m[:, :int(W * .03)] = 0; m[:, int(W * .97):] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab_cc, stats, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros(n, bool); keep[1:] = stats[1:, cv2.CC_STAT_AREA] > 60
    m = keep[lab_cc].astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    mf = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 4)[..., None]
    # the stage's own smooth paper colour, measured off the plant
    off = (1 - cv2.dilate(m, np.ones((31, 31), np.uint8))).astype(bool)
    paper = paper_field(st, off)
    r = st / np.maximum(paper, 1e-3)
    r = np.clip(r / LIFT, 0, 1)                                                   # paper level and above -> exactly 1
    L = 1 - mf * (1 - r)
    if name != "s00":
        L = lock_mound(L)
    cv2.imwrite(os.path.join(OUT, name + "_layer.png"), (L * 65535).astype(np.uint16))
    cv2.imwrite(os.path.join(OUT, name + "_check.jpg"), (plate * L * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(name, "shift dx,dy,resp", warp, "mask %.1f%%" % (100 * m.mean()), flush=True)

names = sys.argv[1:] or sorted(os.path.basename(p)[:-4] for p in glob.glob(os.path.join(BASE, "stages", "s[0-9][0-9].png")))
for n in names:
    layer(n)
