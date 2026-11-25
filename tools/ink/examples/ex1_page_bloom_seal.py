"""Example 1: push into a page while a plate paints itself; a seal lands on the gong; the page flips to its rubbing on
the breakbeat chops; then the blocks print out of register on the drum hits.

    PY -m tools.ink.run tools/ink/examples/ex1_page_bloom_seal.py --out media/comp/ex1.mp4 --audio

Locked to analysis/timing.json (pre-chorus, 40.0-48.0 s): gong_crash 42.565, chops 43.80 / 44.04 / 44.38.
The plate is stand-in art (tools.ink.stock); swap in a keyed generated plate with key_paper(load_image(...)).
"""
import numpy as np

from tools.ink import *

T0, T1 = 40.0, 48.0
CW, CH = 3200, 1800                       # the sheet: bigger than the frame so the push ends near 1:1
SEAL_FONT = 'refs/fonts/chongxi-seal/崇羲篆体.otf'


def setup(ctx):
    global SC, CAM, BL, SEAL, RB, T_GONG, CHOPS, DRUMS, PAPER_F
    tm = ctx.timing
    g = tm.hits('gong', T0, T1)
    T_GONG = g[0]['t'] if g else T0 + 2.5
    CHOPS = [e['t'] for e in tm.hits('chop', T_GONG, T1) if e['kind'] == 'chop'] or [T_GONG + 1.2, T_GONG + 1.5]
    DRUMS = tm.hit_times(['snare', 'kick'], (CHOPS[-1] if CHOPS else T_GONG) + 0.4, T1) or tm.beats_in(T0, T1)
    paper = Paper(CW, CH, 'new', seed=31, breathe=0.6)
    plate = ctx.cache('plate', lambda: brush_mountain(1500, 1150, seed=41, peaks=3))   # stand-in; slow, so cached
    BL = bloom(plate, seed=5, order='dark')
    SC = Scene(CW, CH, paper)
    # one-corner composition: the mountain sits in the lower left of the final framing, the rest stays bare
    SC.add(lambda t: BL.T(ramp(t, T0 + 0.3, T_GONG - 0.15, 'linear') * 1.3), kind='ink', pos=(700, 520), depth=1.0)
    SC.mist(1280, 1560, depth=0.9, drift=-14, seed=3, opacity=0.9)
    end = (1600, 1020, 1.0)
    CAM = Camera.push_in(T0, T_GONG - 0.1, start=(1600, 900, 0.62), end=end, ease_kind='settle')
    CAM.shake(*shake_args(T_GONG, amp=9))
    SEAL = seal('悟空', SEAL_FONT, 210, 'zhu', wear=0.3, seed=2)
    RB = Rubbing(ctx.W, ctx.H, seed=4)
    # the paper as the final camera sees it (for the rubbing and the re-print, which need the bare sheet)
    PAPER_F = Scene(CW, CH, paper).render(T1, Camera.hold(*end), ctx.size)


def render(t, ctx):
    f = SC.render(t, CAM, ctx.size)
    strike(f, SEAL, t, T_GONG, (1560, 300))
    if t > CHOPS[0] - 0.01:
        if flip_on(t, CHOPS, hold=3 / 24):                       # 拓片 on each chop, three frames
            return RB.apply(f, PAPER_F)
        if t >= DRUMS[0]:                                        # woodblock blocks slip on each drum hit
            f = misregister(f, t, DRUMS, amount=7, paper=PAPER_F, seed=3, hold=0.16, n=4)
    return f
