"""Demo 2: multiplane camera. Push into a page of stand-in brush mountains with mist bands, travel right to left,
pull back. Run:  python -m tools.ink.run tools/ink/demos/d02_camera.py --out work/ink_demo/d02_camera.mp4"""
import cv2
import numpy as np

from tools.ink import *

T0, T1 = 0.0, 12.0
CW, CH = 4400, 2000


def setup(ctx):
    global SC, CAM
    paper = Paper(CW, CH, 'new', seed=11, breathe=0.5)
    SC = Scene(CW, CH, paper)
    # three planes of stand-in mountains (tools.ink.stock), far to near, with bands of bare paper between them
    def mt(*a, **k):                     # stroke-built mountains are slow to paint: cache them on disk
        return ctx.cache(('mt', a, sorted(k.items())), lambda: brush_mountain(*a, paper=None, **k))
    far = place(mt(2400, 900, seed=21, peaks=5, density=0.38, pine=False), CW, CH, 1500, 300)
    far = np.minimum(far, place(mt(1500, 700, seed=22, peaks=3, density=0.3, pine=False), CW, CH, 200, 480))
    mid = place(mt(2100, 1150, seed=23, peaks=3, density=0.62), CW, CH, 350, 520)
    near = place(mt(1900, 1300, seed=24, peaks=2, density=0.95), CW, CH, 2300, 640)
    SC.add(far, depth=4.0, name='far')
    SC.mist(900, 1180, depth=3.2, drift=-9, seed=1)
    SC.add(mid, depth=2.2, occlude=0.8, name='mid')
    SC.mist(1250, 1560, depth=1.6, drift=-16, seed=2)
    SC.add(near, depth=1.0, occlude=True, name='near')
    # push in to the near mountain, travel right to left (time passing), pull back (scale revealed)
    CAM = Camera([(0.0, 2200, 1000, 0.44), (4.0, 3300, 1250, 1.0, 'inout'), (9.0, 1100, 1150, 1.0, 'sine'),
                  (12.0, 2200, 1000, 0.44, 'inout')])


def render(t, ctx):
    return SC.render(t, CAM, ctx.size)
