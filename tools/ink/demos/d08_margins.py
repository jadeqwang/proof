"""Demo 8: margins closing in step-wise on cues while the picture drains to greys except gold.
Run:  python -m tools.ink.run tools/ink/demos/d08_margins.py --out work/ink_demo/d08_margins.mp4 --jobs 4"""
from tools.ink import *
from tools.ink.margins import Margins
from tools.ink.demos._plate import mountain_page

T0, T1 = 120.0, 128.0


def setup(ctx):
    global PLATE, M, CUES
    PLATE = mountain_page(Paper(ctx.W, ctx.H, 'new', seed=21), seed=4)
    M = Margins(Paper(ctx.W, ctx.H, 'new', seed=77), seed=5)
    b = ctx.timing.beats_in(T0 + 0.8, T1)
    CUES = b[::3][:5]                                           # five 听话, one step each


def render(t, ctx):
    return M.apply(PLATE, t, CUES, target=(250, 452, 1670, 628))
