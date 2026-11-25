"""Demo 11: shadow screen and trotting-horse lantern. 0-8 s: a jointed monkey re-posed in hard cuts on the beat, its
head swapped on each beat for a bar (七十二变), while a streetlight sweeps past twice. 8-14 s: the 走马灯.
Run:  python -m tools.ink.run tools/ink/demos/d11_puppet.py --out work/ink_demo/d11_puppet.mp4 --jobs 4"""
from tools.ink import *
from tools.ink.puppet import (POSES, cue_index, lantern, lantern_strip, monkey_heads, monkey_puppet, pose_at,
                              run_cycle, shadow_screen)

T0, T1 = 96.0, 110.0


def setup(ctx):
    global PUP, HEADS, SCREEN, CUES, ORDER, STRIP
    PUP, HEADS = monkey_puppet(seed=2), monkey_heads(seed=2)
    SCREEN = Paper(ctx.W, ctx.H, 'new', seed=31, scale=1.4).rgb
    CUES = ctx.timing.beats_in(T0, T0 + 8.0)
    ORDER = [POSES[k] for k in ('stand', 'guard', 'strike', 'shade', 'crouch', 'leap', 'guard', 'strike')]
    figs = [PUP.render(p, pos=(250, 410), scale=0.95, size=(500, 780), pins=False) for p in run_cycle(5)]
    STRIP = lantern_strip(figs, gap=0.1)      # 5 x 550 px for a 780 px height = one turn of a 576 x 778 drum


def render(t, ctx):
    W, H = ctx.size
    if t < T0 + 8.0:
        k = cue_index(t, CUES)
        pose = pose_at(t, CUES, ORDER)
        swaps = {'head': HEADS[k % len(HEADS)]} if 5 <= k < 10 else None
        a = PUP.render(pose, pos=(800, 600), scale=1.5, size=(W, H), swaps=swaps,
                       rods=[('torso', (72, 60)), ('forearm_f', (25, 98))])
        b = PUP.render(dict(ORDER[(k + 3) % len(ORDER)], _flip=True), pos=(1480, 660), scale=1.0, size=(W, H))
        u = ((t - T0) % 4.0) / 4.0                               # one streetlight every 4 s, right to left
        lx = W * (1.45 - 1.9 * u)
        return shadow_screen(SCREEN, [(a, 0.05), (b, 0.16)], (lx, 470), radius=820, ambient=0.05, t=t)
    return lantern(STRIP, t, rpm=7.5, size=(W, H), seed=3)
