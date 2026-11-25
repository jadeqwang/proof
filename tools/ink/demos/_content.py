"""Shared synthetic page for the seal / rubbing / print demos: a few brush strokes, washes in the film's colours."""
import cv2
import numpy as np

from tools.ink import *

SEAL_FONT = 'refs/fonts/chongxi-seal/崇羲篆体.otf'
KAI_FONT = 'refs/fonts/keshilu/刻石录顏體.ttf'


def page(W=1920, H=1080, seed=3, colour=True):
    """Returns (paper, frame): mountain-ish strokes in the lower left, one throw of ink, optional colour washes."""
    p = Paper(W, H, 'new', seed=seed)
    f = p.frame()

    def blob(cx, cy, rx, ry, ang, col, den, sd):
        m = np.zeros((H, W), np.float32)
        cv2.ellipse(m, (cx, cy), (rx, ry), ang, 0, 360, 1.0, -1, cv2.LINE_AA)
        return ink_T(wash(m, p.height, seed=sd, density=den, bleed=12, edge=0.5), tint=col)
    if colour:
        f *= blob(520, 660, 300, 150, -8, OCHRE, 0.45, 2)
        f *= blob(1130, 330, 210, 120, 12, INDIGO, 0.5, 1)
        f *= blob(1420, 420, 95, 90, 0, CINNABAR, 0.7, 3)
    stroke([(150, 930, 0.8), (380, 520, 1.3), (640, 380, 1.1), (900, 600, 0.9), (1250, 760, 0.6)], width=130, seed=4,
           paper=p, dry=0.3).lay(f, 2)
    stroke([(240, 980, 1.0), (760, 900, 1.1), (1380, 960, 0.7)], width=64, seed=9, paper=p, dry=0.5, dry_end=1.0).lay(f, 2)
    stroke([(600, 420, 0.5), (640, 250, 1.0), (700, 190, 0.4)], width=34, seed=12, paper=p, dry=0.1, dry_end=0.5).lay(f, 2)
    splash((1180, 700), size=130, direction=-25, seed=5, paper=p).draw(f, 3)
    return p, f
