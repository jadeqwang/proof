"""Demo 5: the rubbing flip. The page cuts to its 拓片 (white on black) for two frames on every chop, and toggles
page/rubbing on each gong in the second half.
  python -m tools.ink.run tools/ink/demos/d05_rubbing.py --out work/ink_demo/d05_rubbing.mp4 --jobs 4"""
from tools.ink import *
from tools.ink.timing import STUB
from tools.ink.rubbing import Rubbing, flip_on
from tools.ink.seal import seal, strike
from tools.ink.demos._content import SEAL_FONT, page

T0, T1 = 54.0, 60.0


def setup(ctx):
    global P, BASE, RB, CHOPS, GONGS
    P, BASE = page(ctx.W, ctx.H, colour=False)
    strike(BASE, seal('悟空', SEAL_FONT, 210, 'zhu', 0.3, seed=1), 99, 0, (1660, 860))
    RB = Rubbing(ctx.W, ctx.H, seed=4)
    tm = Timing.load(STUB)                 # demos run on the synthetic stub
    CHOPS = tm.hit_times('chop', T0, T0 + 3.5)
    GONGS = tm.hit_times(('gong', 'cymbal'), T0 + 3.5, T1)


def render(t, ctx):
    flipped = flip_on(t, CHOPS, hold=2 / 24) or flip_on(t, GONGS, mode='toggle')
    return RB.apply(BASE, P.rgb) if flipped else BASE
