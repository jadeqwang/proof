"""Demo 3: ink dynamics. (a) two brush strokes drawn in time, wet and 飞白; (b) a throw of splashed ink that lands and
resolves into a figure; (c) a plate painting itself, (d) dissolving back to bare paper; (e) one hair-line drifting.
Run:  python -m tools.ink.run tools/ink/demos/d03_ink.py --out work/ink_demo/d03_ink.mp4"""
import numpy as np

from tools.ink import *

T0, T1 = 0.0, 17.0
W, H = 1920, 1080


def setup(ctx):
    global P, S1, S2, SP, BL
    P = Paper(W, H, 'new', seed=21)
    S1 = stroke([(170, 420, 0.6), (520, 250, 1.3), (980, 470, 1.0), (1420, 300, 0.9), (1790, 380, 0.4)], width=84,
                seed=4, paper=P, dry=0.15, dry_end=0.95)
    S2 = stroke([(260, 800, 1.0), (760, 720, 1.2), (1250, 830, 0.9), (1700, 700, 0.5)], width=150, seed=9, paper=P,
                dry=0.5, dry_end=1.0)
    fig, _ = brush_monkey(760, seed=3, paper=None)
    mask = (blur(fig, 2) > 0.25).astype(np.float32)
    SP = splash((1010, 600), size=330, direction=24, seed=12, into=mask, into_pos=(600, 170), paper=P,
                figure_density=fig, resolve=1.1)
    plate = load_image('refs/paintings/blocking/06_ma_yuan_walking_mountain_path_spring.jpg')[190:1180, 30:1790]
    plate = resize(plate, 1500, int(plate.shape[0] * 1500 / plate.shape[1]))
    T = place(key_paper(plate, gain=1.3), W, H, 210, 120)
    BL = bloom(T, seed=5, order='dark')


def render(t, ctx):
    f = P.frame(t)
    if t < 4.0:                                            # (a) strokes
        S1.lay(f, ramp(t, 0.3, 1.5, 'sine') * 1.0 + max(0, t - 1.5) * 0.5)
        S2.lay(f, ramp(t, 2.0, 2.9, 'out') + max(0, t - 2.9) * 0.5)
    elif t < 8.0:                                          # (b) throw -> figure, hit at 4.6
        SP.draw(f, t - 4.6)
    elif t < 14.0:                                         # (c) bloom 8-11.5, hold, (d) dissolve 12.2-13.8
        if t < 12.2:
            f *= BL.T(ramp(t, 8.2, 11.5, 'linear') * 1.3)
        else:
            f *= dissolve(BL.Tfull, ramp(t, 12.2, 13.8, 'sine'), seed=2)
    else:                                                  # (e) the hair-line
        f *= hairline(W, H, t - 14.0, seed=1, y=0.56, angle=-2.5, drift=(4.0, -9.0), length=0.62,
                      draw=ramp(t, 14.2, 15.6, 'sine'))
    return f
