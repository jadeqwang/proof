"""Example 3: the birth as an entrance. One throw of splashed ink lands on the hook's gong and resolves into a figure
in 亮相; then "He bowed four ways": four seal strikes on the four words, each a 锣鼓经 syllable, the last three pressed
without re-inking so they fade like the Six Persimmons.

    PY -m tools.ink.run tools/ink/examples/ex3_birth_four_bows.py --out media/comp/ex3.mp4 --audio

Locked to analysis/timing.json: gong_crash 58.673 (hook1), line "He bowed four ways before the day had warmed".
The figure is stand-in art (brush_monkey); pass a real silhouette as `into=` and its keyed density as
`figure_density=` when the generated element exists.
"""
import numpy as np

from tools.ink import *

T0, T1 = 57.9, 64.4
FONT = 'refs/fonts/keshilu/刻石录顏體.ttf'
SEAL_FONT = 'refs/fonts/chongxi-seal/崇羲篆体.otf'


def setup(ctx):
    global P, SP, T_HIT, BOWS, STAMP, NAME, POS
    tm = ctx.timing
    g = tm.hits('gong', 58.0, 60.0)
    T_HIT = g[0]['t'] if g else 58.673
    try:
        BOWS = [a for _, a, _ in tm.words('He bowed four ways')[:4]]
    except KeyError:
        BOWS = [T_HIT + 2.4 + 0.4 * k for k in range(4)]
    P = Paper(ctx.W, ctx.H, 'new', seed=52)
    fig, _ = brush_monkey(820, seed=3)
    mask = (blur(fig, 2) > 0.25).astype(np.float32)
    # thrown from the upper left; the figure stands left of centre, the right side of the sheet stays bare
    SP = splash((640, 590), size=340, direction=28, seed=12, into=mask, into_pos=(210, 130), paper=P,
                figure_density=fig, resolve=1.0, fly=0.14)
    STAMP = seal('倉', FONT, 170, 'bai', wear=0.35, seed=7)
    NAME = seal('悟空', SEAL_FONT, 120, 'zhu', wear=0.3, seed=1)
    POS = [(1700 - 215 * k, 840 + (6 if k % 2 else -4)) for k in range(4)]       # right to left, like a row of fruit


def render(t, ctx):
    f = P.frame(t)
    SP.draw(f, t - T_HIT)
    echoes(f, STAMP, t, list(zip(BOWS, POS)), decay=0.8, seed=7)                # four bows, one inking
    strike(f, NAME, t, BOWS[-1] + 0.9, (1740, 300), overshoot=0.08, dent=0.6)   # the name, quietly, after
    return shaken(f, *shake_offset(t, [T_HIT] + BOWS, amp=8))
