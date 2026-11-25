"""Demo 4: seal strikes. A 四击头 of 锣鼓经 syllables on the gong strikes, a name seal slammed on the first gong (with
camera shake), then the same 白文 seal re-pressed without re-inking on the chops (echoes).
  python -m tools.ink.run tools/ink/demos/d04_seal.py --out work/ink_demo/d04_seal.mp4 --jobs 4"""
from tools.ink import *
from tools.ink.timing import STUB
from tools.ink.seal import Luogu, echoes, seal, shake_offset, shaken, strike
from tools.ink.demos._content import KAI_FONT, SEAL_FONT, page

T0, T1 = 52.0, 58.5


def setup(ctx):
    global P, BASE, LG, NAME, BAI, T_NAME, ECHO, SHAKES
    tm = Timing.load(STUB)                 # demo runs on the synthetic stub, whatever analysis/timing.json says
    P, BASE = page(ctx.W, ctx.H, colour=False)
    four = tm.hits('gong_strike', T0, T1)[:4]
    LG = Luogu(four, KAI_FONT, size=170, positions=[(1650 - 215 * k, 190 + 14 * (k % 2)) for k in range(4)], seed=2)
    gongs = tm.hit_times('gong', max(LG.hit_times() or [T0]) + 0.5, T1)
    T_NAME = gongs[0] if gongs else T0 + 3.0
    NAME = seal('悟空', SEAL_FONT, 230, 'zhu', wear=0.3, seed=1)
    BAI = seal('齊天大聖', SEAL_FONT, 210, 'bai', wear=0.35, seed=2)
    chops = tm.hit_times(('chop', 'cymbal'), T_NAME + 0.3, T1)[:6] or [T_NAME + 0.6 + 0.3 * k for k in range(5)]
    ECHO = [(th, (1560 - 235 * k, 880 - 22 * (k % 2))) for k, th in enumerate(chops)]
    SHAKES = LG.hit_times() + [T_NAME]


def render(t, ctx):
    f = BASE.copy()
    LG.draw(f, t)
    strike(f, NAME, t, T_NAME, (1640, 520))
    echoes(f, BAI, t, ECHO, decay=0.66, seed=7)
    return shaken(f, *shake_offset(t, SHAKES, amp=7.0))
