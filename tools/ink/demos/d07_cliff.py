"""Demo 7: carved cliff text 摩崖石刻 under a moving raking light, at three scales, then the gold.
  0-5 s    close: one character fills the frame, chisel marks, the light swings round it
  5-11 s   columns: travel right to left along the cliff, a pool of low light travelling with us, cinnabar in the
           cuts, a child-shaped blank where nothing is carved
  11-14 s  far: the writing is texture on a cliff plane in perspective; the light climbs and the carving goes flat
  14-18 s  "gold happens once": gold runs up the columns
Run:  python -m tools.ink.run tools/ink/demos/d07_cliff.py --out work/ink_demo/d07_cliff.mp4 --jobs 4"""
import numpy as np

from tools.ink import *
from tools.ink.cliff import Cliff, rock_plate, silhouette_child

T0, T1 = 0.0, 18.0
FONT = 'refs/fonts/chongxi-seal/崇羲篆体.otf'
WW = 3000


def setup(ctx):
    global C1, C2, C3, SC, CAM, ZERO
    txt = open(ctx.path('design/text/qianziwen.txt'), encoding='utf-8').read()
    lines = txt.split('\n')[:160]                       # the lines the seal font covers completely
    flat = ''.join(lines)
    rock1 = rock_plate(1920, 1080, seed=4)
    C1 = Cliff(rock1, '玄', FONT, size=900, region=(300, 40, 1320, 1000), seed=2, weather=0.1)
    rock2 = rock_plate(WW, 1080, seed=7, tone=0.22)
    unc = silhouette_child(WW, 1080, 1180, 930, 360)
    C2 = Cliff(rock2, flat, FONT, size=112, region=(90, 60, WW - 180, 960), seed=2, weather=0.25, uncarved=unc,
               moss=0.3)
    rock3 = rock_plate(1920, 1080, seed=9, tone=0.22)
    C3 = Cliff(rock3, flat * 5, FONT, size=30, plane_size=(2600, 1500), region=(40, 30, 2520, 1440),
               quad=[(120, -60), (1920, 140), (1920, 960), (60, 1200)], seed=3, weather=0.35)
    SC = Scene(WW, 1080)
    SC.add(lambda t: C2.render(light=(196, 9 + 2 * np.sin(t)), fill=0.5, t=t, ambient=0.66,
                               pool=(pool_x(t), 560, 900)), kind='frame', depth=1.0)
    CAM = Camera.travel(5.0, 11.0, WW - 960, 960, 540, 1.0)
    ZERO = np.zeros((1080, 1920, 3), np.float32)


def pool_x(t):
    cx = CAM.at(t)[0]
    return cx - 260 + 120 * np.sin(t * 0.7)            # the light runs a little ahead of the camera, leftward


def render(t, ctx):
    if t < 5.0:
        u = t / 5.0
        return C1.render(light=(205 + 150 * ease(u, 'sine'), 8 + 6 * u), fill=0.45)
    if t < 11.0:
        return SC.render(t, CAM, ctx.size, base=ZERO)
    if t < 14.0:
        u = (t - 11.0) / 3.0
        return C3.render(light=(190, 6 + 62 * ease(u, 'in')), fill=0.3)
    u = (t - 14.0) / 4.0
    crop = C2.render(light=(200, 11, 0.8), fill=0.5, gold=ramp(t, 14.4, 17.4, 'sine'), ambient=0.6)
    return np.ascontiguousarray(crop[:, WW - 1920 - 200:WW - 200])
