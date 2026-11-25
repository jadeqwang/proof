"""Demo 12b: brush-redraw rotoscope + the staff as a brush. The same source clip is only READ (silhouette, medial
axis, flow) and redrawn as a few brush strokes over a wash; the tracked staff tip writes a 飞白 stroke that stays on
the paper. Played on twos, with a 亮相 freeze on the first stub gong strike.
Run:  python -m tools.ink.run tools/ink/demos/d12_roto.py --out work/ink_demo/d12_roto.mp4 --jobs 4"""
import numpy as np

from tools.ink import *
from tools.ink.roto import StaffTrail, redraw, track_point
from tools.ink.video import Clip, Retime

T0, T1 = 52.0, 57.9
SRC = 'work/ink_demo/src/figure_on_paper.mp4'
SCALE, POS = 1.5, (0, 0)


def setup(ctx):
    global PAPER, BRUSH, RT, TRAIL
    PAPER = Paper(ctx.W, ctx.H, 'new', seed=33)
    clip = Clip.prepare(SRC, ground='light')
    BRUSH = redraw(clip)
    RT = Retime(t0=T0, src0=0.0, duration=clip.duration).on_twos(T0, T1)
    hits = ctx.timing.hit_times('gong_strike', T0, T1)
    RT.freeze_at(hits[2] if len(hits) > 2 else 53.7, 0.4)
    path = ctx.cache(('tip', clip.meta['sig']), lambda: track_point(clip, seed=(870, 395), mode='staff'))
    TRAIL = StaffTrail(path, width=26, scale=SCALE, pos=POS, paper=PAPER, seed=4, t_in=0.9, density=0.78, dry=0.5)


def render(t, ctx):
    f = PAPER.frame(t)
    s = RT.src(t)
    TRAIL.lay(f, s)                                  # what the staff has written so far (under the performer)
    lay_ink(f, BRUSH.layer(t, RT, scale=SCALE), *POS)
    return f
