"""Demo 1: paper variants and keying. Three sources are keyed onto ONE sheet: two museum photographs of paintings on
toned silk (test material only, not for the film) and a synthetic 'model output': brush marks and a cinnabar wash on a
flat, vignetted, noisy cream rectangle. Then the same sheet aged to 2026, its rubbing ground, and the night ground.
Run:  python -m tools.ink.run tools/ink/demos/d01_paper.py --out work/ink_demo/d01_paper.mp4"""
import cv2
import numpy as np

from tools.ink import *

T0, T1 = 0.0, 8.0
W, H = 1920, 1080


def fake_generated(seed=5):
    """What an image model returns: marks on 'cream paper' that is the wrong cream, vignetted, noisy, JPEG'd."""
    w, h = 760, 560
    fake_paper = Paper(w, h, 'new', seed=99)
    f = np.empty((h, w, 3), np.float32)
    f[:] = np.array([0.90, 0.84, 0.70], np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    f *= (1 - 0.10 * (((xx - w / 2) / w) ** 2 + ((yy - h / 2) / h) ** 2) * 4)[..., None]
    f *= (1 + 0.012 * grain(h, w, seed, 'n', sigma=1.2))[..., None]
    for i, (pts, wd, dry) in enumerate([([(90, 380, .7), (240, 200, 1.2), (420, 300, 1), (640, 180, .6)], 46, .3),
                                        ([(120, 470), (330, 440), (600, 480)], 22, .1)]):
        stroke(pts, width=wd, seed=seed + i, paper=fake_paper, dry=dry).lay(f, 2)
    m = np.zeros((h, w), np.float32)
    cv2.ellipse(m, (520, 380), (110, 60), -12, 0, 360, 1.0, -1, cv2.LINE_AA)
    f *= ink_T(wash(m, fake_paper.height, seed, 0.5, bleed=10, edge=0.5), tint=CINNABAR)
    m[:] = 0
    cv2.ellipse(m, (200, 120), (90, 50), 8, 0, 360, 1.0, -1, cv2.LINE_AA)
    f *= ink_T(wash(m, fake_paper.height, seed + 3, 0.35, bleed=12, edge=0.5), tint=INDIGO)
    ok, enc = cv2.imencode('.jpg', to_u8(f)[..., ::-1], [cv2.IMWRITE_JPEG_QUALITY, 82])
    return cv2.imdecode(enc, cv2.IMREAD_COLOR)[..., ::-1].astype(np.float32) / 255.0


def setup(ctx):
    global P, INK, SRC
    P = {v: Paper(W, H, v, seed=3, gutter=960 if v == 'aged' else None, breathe=1.0 if v == 'new' else 0.0)
         for v in ('new', 'aged', 'rubbing', 'night')}
    a = load_image('refs/paintings/blocking/05_liang_kai_immortal_splashed_ink.jpg')[330:1690, 1125:1610]
    a = resize(a, int(a.shape[1] * 860 / a.shape[0]), 860)
    b = load_image('refs/paintings/blocking/06_ma_yuan_walking_mountain_path_spring.jpg')[190:1180, 30:1790]
    b = resize(b, 880, int(b.shape[0] * 880 / b.shape[1]))
    g = fake_generated()
    INK = np.ones((H, W, 3), np.float32)
    SRC = np.full((H, W, 3), 0.32, np.float32)
    for img, (x, y) in ((a, (110, 110)), (b, (980, 60)), (g, (1070, 500))):
        lay_ink(INK, key_paper(img, gain=1.25), x, y)
        SRC[y:y + img.shape[0], x:x + img.shape[1]] = img


def render(t, ctx):
    if t < 1.5:                                   # the sources as delivered
        return SRC.copy()
    if t < 4.0:                                   # keyed onto our new sheet (grain breathing on)
        return P['new'].frame(t) * INK
    if t < 6.0:                                   # 2026: the same sheet, toned and worn; the picture has faded with it
        return P['aged'].frame(t) * aged_ink(INK, P['aged'])
    if t < 7.0:
        return P['rubbing'].frame(t)
    return P['night'].frame(t)
