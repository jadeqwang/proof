"""Example 2: the thousand years. Travel right to left along a carved cliff while the sun rakes across the cuts: the
characters stand out while the light is low and go flat as it climbs and passes. The cliff fades upward into bare
paper, a band of mist (bare paper) drifts across its foot, the summit stays uncarved, and the lyric is set as a
lower-third subtitle.

    PY -m tools.ink.run tools/ink/examples/ex2_cliff_travel.py --out media/comp/ex2.mp4 --audio

Verse 1 on the song clock (24.0-33.0 s). The rock is stand-in art (rock_plate); use a keyed/painted rock plate
(RGB, no text) from the image model in its place. Text: the first lines of 千字文 from design/text/qianziwen.txt.
"""
import numpy as np

from tools.ink import *

T0, T1 = 24.0, 33.0
FONT = 'refs/fonts/chongxi-seal/崇羲篆体.otf'
LATIN = 'refs/fonts/eb-garamond/EBGaramond[wght].ttf'
KAI = 'refs/fonts/lxgw-wenkai/霞鹜文楷-Regular.ttf'
CW, CH = 3400, 1300


def setup(ctx):
    global SC, CAM, C
    text = ''.join(open(ctx.path('design/text/qianziwen.txt'), encoding='utf-8').read().split('\n')[:160])
    paper = Paper(CW, CH, 'new', seed=61)
    rock = ctx.cache('rock', lambda: rock_plate(CW, CH, seed=7, tone=0.22, fade_top=0.45))
    # the uncarved stone: a boulder-shaped blank near the left end, where the travel arrives
    yy, xx = np.mgrid[0:CH, 0:CW].astype(np.float32)
    stone = smoothstep(1.0, 0.85, np.hypot((xx - 620) / 300, (yy - 760) / 230))
    C = Cliff(rock, text, FONT, size=118, region=(110, 330, CW - 220, 880), seed=2, weather=0.3, moss=0.3,
              uncarved=stone, presence='auto')
    # the sun: from the left and low at the start, climbing and swinging overhead by the end (time passing)
    light = lambda t: (188 + 70 * ramp(t, T0, T1, 'sine'), 7 + 30 * ramp(t, T0 + 4.5, T1, 'in'))
    SC = Scene(CW, CH, paper)
    SC.add(C.layer(light, fill=0.45, ambient=0.62), kind='frame', depth=1.0)
    SC.mist(1020, 1300, depth=0.85, drift=-18, seed=4, opacity=0.95)
    SC.mist(180, 470, depth=1.0, drift=-6, seed=5, opacity=0.8)
    CAM = Camera.travel(T0, T1, CW - 980, 980, 660, 1.0, 'sine')


def render(t, ctx):
    f = SC.render(t, CAM, ctx.size)
    line = subtitle_at(ctx.timing, t)
    if line:
        subtitle(f, line, LATIN, font_cjk=KAI)
    return f
