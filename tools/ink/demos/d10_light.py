"""Demo 10: light on a page. 0-6 s: 1988 neon (cinnabar cycling to cold blue, tungsten from below) with a
hand-shadow monkey. 6-12 s: 2026 torch pool moving over the aged page, hand shadow, dust in the beam.
Run:  python -m tools.ink.run tools/ink/demos/d10_light.py --out work/ink_demo/d10_light.mp4 --jobs 4"""
import math

from tools.ink import *
from tools.ink.light import (cast_shadow, dust, flashlight, flashlight_field, hand_monkey, neon, neon_field)
from tools.ink.demos._plate import mountain_page

T0, T1 = 0.0, 12.0


def setup(ctx):
    global P88, P26, NF
    P88 = mountain_page(Paper(ctx.W, ctx.H, 'new', seed=21), seed=4, gold=False)
    P26 = mountain_page(Paper(ctx.W, ctx.H, 'aged', seed=21, gutter=ctx.W * 0.5), seed=4, gold=False)
    NF = neon_field(ctx.W, ctx.H, slats=0.16)


def render(t, ctx):
    W, H = ctx.size
    if t < 6.0:
        hand = hand_monkey(W, H, (1010 + 30 * math.sin(t * 0.7), 560), 0.9, t=t)
        S = cast_shadow(hand, light_pos=(1500, 1500), distance=0.30, light_size=40)
        f = neon(P88, t, period=6.0, phase=0.05, field=NF, shadow=S, tungsten=0.35, ambient=0.07)
        return dust(f, t, NF * (1 - S), n=60, seed=3, colour=(1.0, 0.6, 0.5), gain=0.25)
    u = t - 6.0
    pos = (700 + 420 * ease(min(1, u / 5.0), 'inout') + 9 * math.sin(u * 2.1), 560 + 60 * math.sin(u * 0.9) + 6 * math.sin(u * 3.3))
    L = flashlight_field(W, H, pos, 430, tilt=-20, stretch=1.25)
    hand = hand_monkey(W, H, (pos[0] - 60, 700), 0.62, t=t)
    S = cast_shadow(hand, light_pos=(pos[0] - 120, 1250), distance=0.36, light_size=14)
    f = flashlight(P26, pos, 430, field=L, shadow=S, ambient=0.06)
    return dust(f, t, L * (1 - S), n=90, seed=5)
