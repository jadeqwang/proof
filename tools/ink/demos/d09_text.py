"""Demo 9: inscription text and subtitles.
  0-7 s    paper: a small ink mountain in the lower-left corner; a Chinese couplet written on stroke by stroke in
           vertical columns in the upper-right blank, a red seal pressed at its foot; an English line as subtitle
  7-13 s   paper: an English line inscribed horizontally, word by word on the (stub) word timings, seal after
  13-18 s  night ground: the same vertical inscription in pale gouache, an English line turned vertical beside it
Run:  python -m tools.ink.run tools/ink/demos/d09_text.py --out work/ink_demo/d09_text.mp4 --jobs 4"""
import cv2
import numpy as np

from tools.ink import *
from tools.ink.text import Inscription, subtitle, subtitle_at

T0, T1 = 0.0, 18.0
KAI = 'refs/fonts/lxgw-wenkai/霞鹜文楷-Regular.ttf'
GG = 'refs/fonts/guangekai/館閣楷-Regular.ttf'
SEALF = 'refs/fonts/chongxi-seal/崇羲篆体.otf'
LAT = 'refs/fonts/eb-garamond/EBGaramond[wght].ttf'
FELL = 'refs/fonts/im-fell/IMFeENit28P.ttf'


def corner_mountain(paper, seed=3):
    """A stand-in one-corner plate: a few washes and strokes in the lower left."""
    W, H = paper.w, paper.h
    f = np.ones((H, W, 3), np.float32)
    m = np.zeros((H, W), np.float32)
    pts = np.array([[0, 1080], [0, 760], [120, 640], [230, 700], [330, 560], [450, 720], [600, 800], [760, 960],
                    [820, 1080]], np.int32)
    cv2.fillPoly(m, [pts], 1.0, cv2.LINE_AA)
    yy = np.arange(H, dtype=np.float32)[:, None]
    m = m * smoothstep(1080, 700, yy) ** 0.6
    f *= ink_T(wash(m * (0.5 + 0.5 * fbm(H, W, 120, seed, 'cm')), paper.height, seed, 0.42, bleed=7, edge=0.5))
    for i, p in enumerate(([(0, 770, .6), (120, 640, 1.2), (230, 705, .8), (330, 560, 1.3), (450, 722, .9),
                            (610, 805, .6), (770, 965, .3)],
                           [(300, 600, .5), (290, 760, 1.0), (340, 900, .6)], [(130, 660, .5), (150, 820, 1.), (120, 960, .4)])):
        st = stroke(p, width=22 - 5 * i, seed=seed + i, paper=paper, dry=0.3, dry_end=0.85)
        st.lay(f, 2.0)
    return f


def setup(ctx):
    global PAPER, NIGHT, PLATE, INS1, INS2, INS3, INS4
    W, H = ctx.size
    PAPER = Paper(W, H, 'new', seed=5)
    NIGHT = Paper(W, H, 'night', seed=6)
    PLATE = corner_mountain(PAPER)
    INS1 = Inscription('一竅通時\n百竅通', GG, region=(1420, 110, 330, 640), size=(W, H), vertical=True, paper=PAPER,
                       start=0.8, end=4.6, seal='悟空', seal_font=SEALF, seed=1, max_px=112)
    tm = ctx.timing
    try:
        w = [(a, s - 16.0 + 7.6, e - 16.0 + 7.6) for a, s, e in tm.words('There was a stone on a mountain')]
    except KeyError:
        w = None
    INS2 = Inscription('There was a stone\non a mountain by the sea', FELL, region=(980, 150, 800, 300), size=(W, H),
                       vertical=False, paper=PAPER, words=w, start=7.6, end=11.0, mode='word', seal='石',
                       seal_font=SEALF, seed=2, max_px=74, line_gap=0.3)
    INS3 = Inscription('一竅通時\n百竅通', GG, region=(1420, 110, 330, 640), size=(W, H), vertical=True, paper=NIGHT,
                       start=13.4, end=16.2, ground='night', seal='悟空', seal_font=SEALF, seed=1, max_px=112)
    INS4 = Inscription('when one aperture opens a hundred open', LAT, region=(1250, 110, 90, 760), size=(W, H),
                       vertical=True, paper=NIGHT, start=14.2, end=17.0, ground='night', mode='word', seed=4,
                       max_px=44)


def render(t, ctx):
    if t < 13.0:
        f = PAPER.frame(t)
        f *= PLATE
        if t < 7.0:
            INS1.fade(f, t, 6.2, 0.8)
            if 1.0 < t < 6.0:
                subtitle(f, 'When one aperture opens, a hundred open', LAT, px=40)
        else:
            INS2.fade(f, t, 12.2, 0.8)
            if 7.6 < t < 12.0:
                subtitle(f, '山上有一块仙石', LAT, px=42, font_cjk=KAI)
        return f
    f = NIGHT.frame(t)
    INS3.draw(f, t)
    INS4.draw(f, t)
    if 13.6 < t < 17.5:
        subtitle(f, 'One aperture opens and a hundred open', LAT, px=40)
    return f
