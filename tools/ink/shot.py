"""tools.ink.shot: the declarative way to write a shot: a list of timed layers on a sheet, then a chain of effects.

    from tools.ink import *
    from tools.ink.shot import Shot

    def build(ctx):
        paper = Paper(ctx.W, ctx.H, 'new', seed=4)
        sh = Shot(ctx, paper)
        sh.ink(T_plate, pos=(120, 300))                                   # an ink layer, always on
        sh.ink(lambda t: bl.T(ramp(t, 52.0, 55.0)), t0=52.0)              # a layer that changes in time
        sh.rgba(seal_img, pos=(1500, 760), t0=54.0)                       # opaque pigment from 54 s
        sh.draw(lambda f, t: sp.draw(f, t - 53.2))                        # anything that draws on the frame in place
        sh.fx(lambda f, t: rubbing(f) if flipped(t) else f)               # whole-frame effects, in order
        return sh

Layers are applied in the order they were added. Each takes t0/t1 (song seconds; outside them the layer is off) and
opacity (number or callable of t). For camera moves use a Scene: sh.scene(scene, camera) makes the Scene the base
picture, and later layers sit on top of it in frame space.
"""
import numpy as np

from .core import F32, lay_ink, over


class Shot:
    def __init__(self, ctx, paper=None, base=None):
        """paper: a Paper the size of the frame (the sheet everything is laid on), or base: callable t -> frame."""
        self.ctx, self.paper, self.base = ctx, paper, base
        self.layers, self.effects = [], []

    def scene(self, scene, camera):
        """Use a multiplane Scene through a Camera as the base picture."""
        self.base = lambda t: scene.render(t, camera, self.ctx.size)
        return self

    def _add(self, kind, src, pos, t0, t1, opacity):
        self.layers.append(dict(kind=kind, src=src, pos=pos, t0=t0, t1=t1, opacity=opacity))
        return self

    def ink(self, T, pos=(0, 0), t0=None, t1=None, opacity=1.0):
        """An ink layer (HxWx3 transmittance, or callable t -> layer or None), multiplied onto the sheet at pos."""
        return self._add('ink', T, pos, t0, t1, opacity)

    def rgba(self, img, pos=(0, 0), t0=None, t1=None, opacity=1.0):
        """Opaque pigment (HxWx4 straight alpha, or callable t -> rgba or None) laid over the sheet at pos."""
        return self._add('rgba', img, pos, t0, t1, opacity)

    def draw(self, fn, t0=None, t1=None):
        """fn(frame, t) draws on the frame in place (or returns a new frame): splashes, seal strikes, text."""
        return self._add('draw', fn, None, t0, t1, 1.0)

    def fx(self, fn, t0=None, t1=None):
        """fn(frame, t) -> frame, applied after all layers, in the order added: rubbing flips, mis-registration,
        margins, light."""
        self.effects.append(dict(fn=fn, t0=t0, t1=t1))
        return self

    @staticmethod
    def _on(L, t):
        return (L['t0'] is None or t >= L['t0']) and (L['t1'] is None or t < L['t1'])

    def render(self, t):
        if self.base is not None:
            f = np.ascontiguousarray(self.base(t), dtype=F32)
        else:
            f = self.paper.frame(t)
        for L in self.layers:
            if not self._on(L, t):
                continue
            if L['kind'] == 'draw':
                r = L['src'](f, t)
                f = f if r is None else r
                continue
            src = L['src'](t) if callable(L['src']) else L['src']
            if src is None:
                continue
            op = L['opacity'](t) if callable(L['opacity']) else L['opacity']
            pos = L['pos'](t) if callable(L['pos']) else L['pos']
            if L['kind'] == 'ink':
                lay_ink(f, src, int(pos[0]), int(pos[1]), op)
            else:
                over(f, src, int(pos[0]), int(pos[1]), op)
        for E in self.effects:
            if self._on(E, t):
                r = E['fn'](f, t)
                f = f if r is None else r
        return np.clip(f, 0, 1)
