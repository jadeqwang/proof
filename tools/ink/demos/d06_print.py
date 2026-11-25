"""Demo 6: print and paper breakage. Woodblock mis-registration jumping on every half-beat, then paper-cut strips
re-dealt per beat, then the sheet torn and re-pasted on a gong.
  python -m tools.ink.run tools/ink/demos/d06_print.py --out work/ink_demo/d06_print.mp4 --jobs 4"""
from tools.ink import *
from tools.ink.timing import STUB
from tools.ink.woodblock import beat_key, misregister, papercut, separate, torn
from tools.ink.seal import seal, strike
from tools.ink.demos._content import SEAL_FONT, page

T0, T1 = 54.0, 62.0


def setup(ctx):
    global P, BASE, BACK, BEATS, HALF, T_CUT, T_TEAR, SEP
    P, BASE = page(ctx.W, ctx.H)
    strike(BASE, seal('悟空', SEAL_FONT, 210, 'zhu', 0.3, seed=1), 99, 0, (1660, 860))
    BACK = Paper(ctx.W, ctx.H, 'aged', seed=8).rgb * 0.92                 # the backing sheet under cut and torn paper
    SEP = separate(BASE, P.rgb, 4)          # the page is still: separate once, reprint per frame
    tm = Timing.load(STUB)                 # demo runs on the synthetic stub, whatever analysis/timing.json says
    HALF = tm.beats_in(T0 + 0.5, T1, sub=2)
    BEATS = tm.beats_in(T0, T1)
    T_CUT, T_TEAR = tm.nearest_beat(T0 + 3.4), tm.nearest_beat(T0 + 6.0)


def render(t, ctx):
    if t < T_CUT:
        amount = 4.0 + 9.0 * ramp(t, T0 + 0.5, T_CUT, 'in')                # the blocks drift further apart
        return misregister(BASE, t, HALF, amount=amount, paper=P.rgb, seed=3, blocks=SEP)
    if t < T_TEAR:
        return papercut(BASE, n=8, amount=90, key=beat_key(t, BEATS), seed=1, under=BACK,
                        axis='h' if beat_key(t, BEATS) % 4 != 3 else 'v')
    return torn(BASE, seed=2, offset=(26, -15), angle=1.6, pos=0.52, under=BACK)
