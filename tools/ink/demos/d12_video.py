"""Demo 12a: video element ingestion. A (synthetic stand-in for a) generated clip of an ink performer on cream paper
is stabilised, de-flickered and keyed onto OUR paper, placed in a multiplane scene behind a mist band, retimed:
normal speed -> 亮相 freezes on the stub gong strikes -> a stretch on twos -> a speed ramp. The raw source is shown
small in the corner for before/after (it is not part of the look). Keyed mist-on-dark erases ink as bare paper.
Run:  python tools/ink/demos/d12_make_src.py   (once)
      python -m tools.ink.run tools/ink/demos/d12_video.py --out work/ink_demo/d12_video.mp4 --jobs 4"""
import cv2
import numpy as np

from tools.ink import *
from tools.ink.video import Clip, Retime, decode

T0, T1 = 52.0, 59.0
SRC = 'work/ink_demo/src/figure_on_paper.mp4'
MIST = 'work/ink_demo/src/mist_on_dark.mp4'


def setup(ctx):
    global SC, CAM, CLIP, RT, RAW, MCLIP, MRT, PV
    CLIP = Clip.prepare(SRC, ground='light')
    MCLIP = Clip.prepare(MIST, ground='dark', stabilise=False)
    hits = ctx.timing.hit_times('gong_strike', T0, T1)[:4] or [52.5, 53.1, 53.7, 54.3]
    RT = Retime(t0=T0, src0=0.2, rate=1.0, duration=CLIP.duration)
    for h in hits:
        RT.freeze_at(h, 0.33)                                    # 亮相: snap and hold on each strike
    RT.on_twos(55.2, 57.0).ramp([(57.0, 1.0), (57.6, 0.35), (58.4, 1.3)])
    for w in RT.check(T0, T1):
        print('  retime:', w)
    MRT = Retime(t0=T0, rate=0.5, duration=MCLIP.duration).loop()
    paper = Paper(2600, 1460, 'new', seed=21, breathe=0.4)
    SC = Scene(2600, 1460, paper)
    # a few far strokes so the parallax reads
    far = np.ones((1460, 2600, 3), np.float32)
    for k, y in enumerate((980, 1040)):
        stroke([(200 + 300 * k, y + 40, 0.5), (900, y - 60 - 40 * k, 1.0), (1700, y, 0.9), (2400, y - 30, 0.4)],
               width=120, seed=5 + k, density=0.22, dry=0.25, dry_end=0.6).lay(far, 2.0)
    SC.add(far, depth=3.0, name='far')
    SC.add(CLIP.as_layer(RT, scale=1.5), kind='ink', depth=1.0, pos=(340, 190), name='figure')
    CAM = Camera([(T0, 1300, 730, 0.80), (T1, 1380, 760, 1.0, 'sine')])
    for h in hits:
        CAM.shake(h, amp=5, dur=0.2, seed=int(h * 10))
    RAW = [cv2.resize(f, (384, 216), interpolation=cv2.INTER_AREA) for _, f in decode(SRC)]


def render(t, ctx):
    f = SC.render(t, CAM, ctx.size)
    # mist from a dark-ground clip: its alpha is a BARE PAPER mask over everything (mist is paper, never grey)
    pv = SC.render(t, CAM, ctx.size, only=['__paper__'])
    m = MCLIP.layer(t, MRT)[..., 3]
    a = cv2.resize(m, ctx.size, interpolation=cv2.INTER_CUBIC) * 0.9
    yy = np.linspace(0, 1, ctx.H, dtype=np.float32)[:, None]
    a = np.clip(a, 0, 1) * smoothstep(0.35, 0.75, yy)            # keep it to the lower part of the frame
    f += (pv - f) * a[..., None]
    # before/after inset: the untouched source frame that is showing now
    i = min(len(RAW) - 1, int(RT.src(t) * CLIP.fps))
    f[ctx.H - 216 - 30:ctx.H - 30, 30:30 + 384] = RAW[i]
    return f
