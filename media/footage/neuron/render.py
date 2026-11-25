"""Render the growing Purkinje cell as an engraved plate (sibling of ../frost/render.py), any frame in any order.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY -I render.py --still 0.2 0.5 --out work/still.png          # u = 0..1 through the clip
    $PY -I render.py --mov out/neuron_master_prores422hq.mov        # ProRes 422 HQ master
    $PY -I render.py --camera locked ...                            # no camera move (whole plate, as frost)

Everything is drawn from vectors in state/neuron.npz (build.py) at the frame's own camera, so zooming never
softens a line. The sheet (paper, rules, letterpress) is built once, at the deepest zoom, and is the same in every
frame. Every random choice is seeded; the only things that change between frames are the camera and the growth.
"""
import argparse
import math
import os
from multiprocessing import Pool

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
F32 = np.float32
FONTS = os.path.join(HERE, '..', 'frost', 'fonts')

INK = np.array([0.13, 0.11, 0.10], F32)          # frost's ink
PAPER = np.array([0.925, 0.885, 0.795], F32)      # frost's paper
AMBER = np.array([0.70, 0.50, 0.24], F32)         # the tint plate: Golgi-amber ground of the section
PALE = np.array([0.42, 0.33, 0.24], F32)          # neighbouring elements, printed paler and browner

PANE = (80, 58, 1840, 938)
HEADER_L = 'STRUCTURE OF THE NERVOUS SYSTEM.'
HEADER = 'PLATE IX.'
CAPTION = 'Fig. 12.—Cell of Purkinje from the cerebellum of man. Section in the plane of the dendritic arborization.'
SUBCAP = 'a, axis-cylinder; b, recurrent collateral; c, granule cells; d, a neighbouring cell of Purkinje.'
LABEL_U = {'a': 0.30, 'b': 0.60, 'c': 0.45, 'd': 0.62}

ZMAX = 1.6
CAMERA = [  # (u, zoom, cx, cy) in sheet px; eased between keys
    (0.000, 1.60, 1045, 640),
    (0.075, 1.60, 1045, 640),
    (0.440, 1.00, 960, 540),
    (0.830, 1.00, 960, 540),
    (1.000, 1.25, 960, 500),
]

PIA_Y, PCL_Y, GRL_Y = 118.0, 812.0, 842.0


def gblur(a, s):
    if s <= 0:
        return a
    k = int(s * 3) * 2 + 1
    return cv2.GaussianBlur(a, (k, k), s, borderType=cv2.BORDER_REFLECT)


def fbm(h, w, seed, octaves=5, base=6):
    """frost's fbm: the coarse grids depend only on the aspect, so it is the same field at any resolution"""
    r = np.random.default_rng(seed)
    acc = np.zeros((h, w), F32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        n = base * 2 ** o
        g = r.random((max(2, int(n * h / w) + 2), n + 2)).astype(F32)
        acc += amp * cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)
        tot += amp
        amp *= 0.5
    return acc / tot


def smoothstep(a, b, x):
    t = np.clip((np.asarray(x, F32) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


class Plate:
    def __init__(self, state, W, H, dur=140.0, fps=24, seed=3, camera='move'):
        self.W, self.H, self.k = W, H, W / 1920.0
        self.dur, self.fps = dur, fps
        self.camera_mode = camera
        z = np.load(state)
        self.z = {k: z[k] for k in z.files}
        self._build_sheet(seed)
        self._build_fields(seed)
        self._build_soma(seed)

    # ------------------------------------------------------------------------------------------ static sheet
    def _build_sheet(self, seed):
        """paper x letterpress at the deepest zoom (sheet scale s = k * ZMAX)"""
        s = self.k * ZMAX
        Hs, Ws = int(round(1080 * s)), int(round(1920 * s))
        self.s_sheet = s
        r = np.random.default_rng(seed)
        _ = r.random((1080, 1920))                    # keep frost's random stream: same foxing as PLATE XIV
        rg = np.random.default_rng(seed + 100)
        tone = (fbm(Hs, Ws, seed, 5, 4) - 0.5) * 0.05
        grain = (gblur(rg.random((Hs, Ws)).astype(F32), 0.6 * s) - 0.5) * 0.05
        fib = (fbm(Hs, Ws, seed + 1, 3, 90) - 0.5) * 0.025
        yy, xx = np.mgrid[0:Hs, 0:Ws].astype(F32)
        ex = np.minimum(xx, Ws - 1 - xx) / Ws
        ey = np.minimum(yy, Hs - 1 - yy) / Hs
        edge = np.exp(-np.minimum(ex * 2.2, ey * 2.2 * Hs / Ws) * 14)
        paper = PAPER[None, None] * (1 + tone + grain + fib)[..., None]
        paper *= (1 - 0.06 * edge)[..., None]
        paper *= np.array([1, 0.99, 0.965], F32)[None, None] ** (edge[..., None] * 3)
        fox = np.zeros((Hs, Ws), F32)
        for i in range(14):
            cx, cy = r.uniform(0, 1920) * s, r.uniform(0, 1080) * s
            rad = r.uniform(2, 9) * s
            x0, x1 = int(max(0, cx - 4 * rad)), int(min(Ws, cx + 4 * rad))
            y0, y1 = int(max(0, cy - 4 * rad)), int(min(Hs, cy + 4 * rad))
            m = np.exp(-(((xx[y0:y1, x0:x1] - cx) ** 2 + (yy[y0:y1, x0:x1] - cy) ** 2) / (rad * rad)))
            fox[y0:y1, x0:x1] += m * r.uniform(0.25, 0.8)
        fox = np.clip(fox * (0.6 + 0.8 * fbm(Hs, Ws, seed + 5, 3, 30)), 0, 1)
        paper = paper * (1 - fox[..., None] * np.array([0.05, 0.10, 0.20], F32)[None, None])
        del xx, yy
        # letterpress
        img = Image.new('L', (Ws, Hs), 0)
        d = ImageDraw.Draw(img)
        x0, y0, x1, y1 = [v * s for v in PANE]
        def rect(o, w):
            d.rectangle([x0 - o * s, y0 - o * s, x1 + o * s - 1, y1 + o * s - 1], outline=255,
                        width=max(1, int(round(w * s))))
        rect(3, 1.0)
        rect(9, 2.6)
        f_it = ImageFont.truetype(os.path.join(FONTS, 'IMFeENit28P.ttf'), int(27 * s))
        f_rm = ImageFont.truetype(os.path.join(FONTS, 'IMFeENrm28P.ttf'), int(21 * s))
        f_sc = ImageFont.truetype(os.path.join(FONTS, 'IMFeENsc28P.ttf'), int(20 * s))
        def ctext(y, t, f):
            bb = d.textbbox((0, 0), t, font=f)
            d.text(((Ws - (bb[2] - bb[0])) / 2 - bb[0], y), t, font=f, fill=255)
        ctext(int(988 * s), CAPTION, f_it)
        ctext(int(1026 * s), SUBCAP, f_rm)
        d.text((x1 - 6 * s - d.textbbox((0, 0), HEADER, font=f_sc)[2], int(16 * s)), HEADER, font=f_sc, fill=255)
        d.text((x0 + 6 * s, int(16 * s)), HEADER_L, font=f_sc, fill=255)
        prn = np.asarray(img, F32) / 255.0
        prn = np.clip(prn * (0.85 + 0.3 * fbm(Hs, Ws, seed + 9, 3, 200)), 0, 1)
        sheet = paper * (1 - prn[..., None] * (1 - INK[None, None] / PAPER[None, None]) * 0.97)
        self.sheet = np.ascontiguousarray(sheet.astype(F32))
        self.label_font = os.path.join(FONTS, 'IMFeENrm28P.ttf')

    # ------------------------------------------------------------------------------------------ ground fields
    def _build_fields(self, seed):
        """fields in pane space at frost's ruling resolution (2 px per sheet px): wobble (frost's exactly) and
        the tone of the tissue ground"""
        pw, ph = 1760 * 2, 880 * 2
        self.wob = ((fbm(ph, pw, seed + 20, 3, 5) - 0.5) * 1.2).astype(F32)       # same as PLATE XIV's ruling
        yy, xx = np.mgrid[0:ph, 0:pw].astype(F32)
        xs = PANE[0] + xx / 2; ys = PANE[1] + yy / 2
        n1 = fbm(ph, pw, seed + 40, 4, 5)
        n2 = fbm(ph, pw, seed + 41, 3, 24)
        tissue = 1.0          # the section fills the pane (no pial edge: it read as a horizon)
        grl = GRL_Y + 6 * np.sin(xs / 140.0) + 4 * np.sin(xs / 37.0 + 1)
        gran = smoothstep(grl - 10, grl + 18, ys)
        u = (xs - 960) / 900.0; v = (ys - 520) / 470.0
        vign = np.clip((u * u + v * v) ** 1.5, 0, 1)
        # ruling tone (frost's line screen, in the same ink): light over the cell, darker toward the frame
        tone = 0.10 + 0.05 * (n1 - 0.5) * 2 + 0.02 * (n2 - 0.5) * 2 + 0.26 * vign
        tone = tone + 0.05 * np.exp(-((ys - PCL_Y + 8) / 22.0) ** 2)               # Purkinje-cell layer
        tone = tone * (1 - gran) + (tone + 0.07 + 0.05 * (n2 - 0.5) * 2) * gran
        self.tone = np.clip(tone * tissue, 0, 0.8).astype(F32)
        # the hand-laid amber wash of a Golgi preparation: uneven, like hand colouring
        n3 = fbm(ph, pw, seed + 42, 5, 3)
        wash = 0.42 + 0.30 * (n3 - 0.5) * 2 + 0.10 * (n2 - 0.5) * 2 + 0.06 * gran
        self.wash = np.clip(wash * tissue, 0, 1).astype(F32)
        # pen/ink irregularity (frost's ink_noise): the ink lies a little unevenly on the paper
        rr = np.random.default_rng(seed + 30)
        self.inkn = ((gblur(rr.random((ph, pw)).astype(F32), 1.6) - 0.5) * 2 * 0.6
                     + (fbm(ph, pw, seed + 43, 3, 40) - 0.5) * 2).astype(F32)
        del yy, xx

    def _build_soma(self, seed):
        """stipple dots inside the main soma: fixed places, each with a shade and a threshold"""
        z = self.z
        poly = z['soma_poly']
        cx, cy = z['soma_c']; rr = float(z['soma_r'])
        rng = np.random.default_rng(seed + 60)
        x0, y0 = poly.min(0); x1, y1 = poly.max(0)
        n = 40000
        p = np.stack([rng.uniform(x0, x1, n), rng.uniform(y0, y1, n)], 1).astype(F32)
        pc = poly.reshape(-1, 1, 2).astype(np.float32)
        inside = np.array([cv2.pointPolygonTest(pc, (float(a), float(b)), True) for a, b in p])
        keep = inside > 0.25
        p = p[keep]; dist_in = inside[keep]
        # light from the upper left: darker toward the lower right, and toward the rim
        lx = ((p[:, 0] - cx) + (p[:, 1] - cy)) / (math.sqrt(2) * rr)
        rim = np.exp(-dist_in / (0.25 * rr))
        shade = np.clip(0.45 + 0.45 * lx + 0.45 * rim, 0.08, 1.0)
        self.soma_dots = p
        self.soma_shade = shade.astype(F32)
        self.soma_thr = rng.random(len(p)).astype(F32)

    # ------------------------------------------------------------------------------------------ camera
    def cam(self, u):
        if self.camera_mode == 'locked':
            return 1.0, 960.0, 540.0
        K = CAMERA
        if u <= K[0][0]:
            return K[0][1:]
        for a, b in zip(K[:-1], K[1:]):
            if u <= b[0]:
                t = ease((u - a[0]) / (b[0] - a[0]))
                return tuple(a[i] + (b[i] - a[i]) * t for i in (1, 2, 3))
        return K[-1][1:]

    # ------------------------------------------------------------------------------------------ one frame
    def render(self, u):
        W, H, k = self.W, self.H, self.k
        zm, cx, cy = self.cam(u)
        sc = zm * k                                     # output px per sheet px
        ox, oy = W / 2 - cx * sc, H / 2 - cy * sc       # screen = sheet * sc + o
        # sheet: blur for the downscale, then resample
        ratio = self.s_sheet / sc
        src = gblur(self.sheet, 0.45 * (ratio - 1)) if ratio > 1.05 else self.sheet
        A = np.array([[sc / self.s_sheet, 0, ox], [0, sc / self.s_sheet, oy]], np.float32)
        base = cv2.warpAffine(src, A, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        # pane in screen px
        px0, py0 = PANE[0] * sc + ox, PANE[1] * sc + oy
        px1, py1 = PANE[2] * sc + ox, PANE[3] * sc + oy
        X0, Y0 = max(0, int(math.floor(px0))), max(0, int(math.floor(py0)))
        X1, Y1 = min(W, int(math.ceil(px1))), min(H, int(math.ceil(py1)))
        amber = np.zeros((H, W), F32)
        black = np.zeros((H, W), F32)
        pale = np.zeros((H, W), F32)
        if X1 > X0 and Y1 > Y0:
            rule, wash, nuc = self._ground(u, sc, ox, oy, X0, Y0, X1, Y1)
            amber[Y0:Y1, X0:X1] = wash
            b, p = self._strokes(u, sc, ox, oy)
            black[:] = b; pale[:] = p
            black[Y0:Y1, X0:X1] = np.maximum(black[Y0:Y1, X0:X1], rule)
            lab = self._labels(u, sc, ox, oy)
            if lab is not None:      # the engraver leaves the ground clear around a reference letter
                clear = cv2.dilate(lab, np.ones((1 + 2 * int(3 * sc), 1 + 2 * int(3 * sc)), np.uint8)).astype(F32) / 255
                clear = gblur(clear, 1.0 * sc)
                rule = rule * (1 - clear[Y0:Y1, X0:X1]); nuc = nuc * (1 - clear[Y0:Y1, X0:X1])
            black[Y0:Y1, X0:X1] = np.maximum(black[Y0:Y1, X0:X1], rule)
            pale[Y0:Y1, X0:X1] = np.maximum(pale[Y0:Y1, X0:X1], nuc * 0.8)
            if lab is not None:
                np.maximum(black, lab.astype(F32) / 255.0, out=black)
            A2 = np.array([[sc / 2, 0, ox + PANE[0] * sc], [0, sc / 2, oy + PANE[1] * sc]], np.float32)
            n = cv2.warpAffine(self.inkn, A2, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            black *= np.clip(0.93 + 0.07 * n, 0.8, 1.0)
            pale *= np.clip(0.90 + 0.10 * n, 0.75, 1.0)
            # clip to the pane (soft one-pixel edge)
            xs = np.arange(W, dtype=F32) + 0.5; ys = np.arange(H, dtype=F32) + 0.5
            mx = np.clip(np.minimum(xs - px0, px1 - xs), 0, 1); my = np.clip(np.minimum(ys - py0, py1 - ys), 0, 1)
            pm = my[:, None] * mx[None, :]
            amber *= pm; black *= pm; pale *= pm
        f = base
        f = f * (1 - amber[..., None] * (1 - AMBER / PAPER)[None, None] * 0.32)
        f = f * (1 - pale[..., None] * (1 - PALE / PAPER)[None, None] * 0.75)
        f = f * (1 - black[..., None] * (1 - INK / PAPER)[None, None] * 0.97)
        return np.clip(f, 0, 1)

    def _ground(self, u, sc, ox, oy, X0, Y0, X1, Y1, ss=2):
        """the engraved tint of the section: frost's horizontal ruling, line width carrying the tone"""
        w, h = (X1 - X0) * ss, (Y1 - Y0) * ss
        # screen (ss) -> pane field px (2 per sheet px)
        a = 2.0 / (sc * ss)
        A = np.array([[a, 0, (X0 - ox) / sc * 2 - PANE[0] * 2 + a * 0.5 - 0.5],
                      [0, a, (Y0 - oy) / sc * 2 - PANE[1] * 2 + a * 0.5 - 0.5]], np.float32)
        Ainv = cv2.invertAffineTransform(A)
        wob = cv2.warpAffine(self.wob, Ainv, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        tone = cv2.warpAffine(self.tone, Ainv, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        wash = cv2.warpAffine(self.wash, Ainv, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        ys = (Y0 + (np.arange(h, dtype=F32) + 0.5) / ss - oy) / sc           # sheet y of each row
        phase = (ys[:, None] - PANE[1]) / 3.3 + wob
        dd = np.abs(((phase + 0.5) % 1.0) - 0.5)
        aa = 0.8 / (3.3 * sc)
        ink = np.clip((tone * 0.5 - dd) / aa + 0.5, 0, 1) * smoothstep(0.0, 0.04, tone)
        # granule nuclei: the stipple of the granular layer, appearing dot by dot
        nuc = self.z['nuclei']
        frac = float(smoothstep(0.02, 0.55, u))
        vis = nuc[nuc[:, 3] < frac]
        if len(vis):
            canv = np.zeros((h, w), np.uint8)
            q = 16
            pts = np.stack([(vis[:, 0] * sc + ox - X0) * ss, (vis[:, 1] * sc + oy - Y0) * ss], 1)
            rad = vis[:, 2] * 0.7 * sc * ss
            for rq in np.unique(np.clip(np.round(rad * 2) / 2, 1, 40)):
                sel = np.abs(np.clip(np.round(rad * 2) / 2, 1, 40) - rq) < 1e-3
                P = (pts[sel] * q).astype(np.int32)
                for pp in P:
                    cv2.circle(canv, (int(pp[0]), int(pp[1])), int(rq * q), 255, -1, cv2.LINE_AA, 4)
            nuc_d = canv.astype(F32) / 255.0
        else:
            nuc_d = np.zeros_like(ink)
        sz = (X1 - X0, Y1 - Y0)
        return (cv2.resize(ink, sz, interpolation=cv2.INTER_AREA), cv2.resize(wash, sz, interpolation=cv2.INTER_AREA),
                cv2.resize(nuc_d, sz, interpolation=cv2.INTER_AREA))

    def _strokes(self, u, sc, ox, oy, ss=4):
        W, H = self.W, self.H
        z = self.z
        S = z['seg']
        q = 16                                           # cv2 fixed point (shift 4)
        f = sc * ss * q
        cb = np.zeros((H * ss, W * ss), np.uint8)
        cp = np.zeros((H * ss, W * ss), np.uint8)
        x0, y0, x1, y1, r, u0, u1, kind, layer, tip, zz = S.T
        vis = (u0 < u)
        # transient processes withdraw, tip first
        ret0, ret1 = z['ret0'], z['ret1']
        vis &= u < ret1
        fr = np.clip((u - u0) / np.maximum(u1 - u0, 1e-6), 0, 1)
        fr = np.where(u > ret0, fr * np.clip((ret1 - u) / np.maximum(ret1 - ret0, 1e-6), 0, 1), fr)
        idx = np.where(vis)[0]
        ex = x0[idx] + (x1[idx] - x0[idx]) * fr[idx]
        ey = y0[idx] + (y1[idx] - y0[idx]) * fr[idx]
        age = u - u1[idx]
        thick = 0.5 + 0.5 * smoothstep(0.0, 0.24, age)                      # slow late thickening
        tipf = 0.35 + 0.65 * smoothstep(0.0, 0.014, age)                    # a fresh tip is fine
        hw = r[idx] * thick * tipf * sc                                     # half width, output px
        lay = layer[idx]
        hw = np.maximum(hw, np.where(lay > 0, 0.40, 0.55))
        th = np.clip(np.round(2 * hw * ss), 1, 400).astype(np.int32)
        X0 = ((x0[idx] * sc + ox) * ss * q).astype(np.int32); Y0 = ((y0[idx] * sc + oy) * ss * q).astype(np.int32)
        X1 = ((ex * sc + ox) * ss * q).astype(np.int32); Y1 = ((ey * sc + oy) * ss * q).astype(np.int32)
        P = np.stack([np.stack([X0, Y0], 1), np.stack([X1, Y1], 1)], 1)
        for L, canv in ((0, cb), (1, cp)):
            m = lay == L
            for t in np.unique(th[m]):
                sel = m & (th == t)
                cv2.polylines(canv, list(P[sel]), False, 255, int(t), cv2.LINE_AA, 4)
        # varicosities on thin processes
        B = z['beads']
        if len(B):
            bi = B[:, 0].astype(np.int64)
            ok = (u1[bi] < u) & (u < ret0[bi])
            for (kk, fb, sz, L) in B[ok]:
                kk = int(kk)
                a_ = u - u1[kk]
                hwb = max(r[kk] * (0.5 + 0.5 * float(smoothstep(0, 0.24, a_))) * sc, 0.55) * sz
                bx = x0[kk] + (x1[kk] - x0[kk]) * fb; by = y0[kk] + (y1[kk] - y0[kk]) * fb
                cv2.circle(cb if L == 0 else cp, (int((bx * sc + ox) * ss * q), int((by * sc + oy) * ss * q)),
                           int(hwb * ss * q), 255, -1, cv2.LINE_AA, 4)
        # spines: tiny strokes with a head, sprouting as the branchlet matures
        SP = z['spines']
        if len(SP):
            g = np.clip((u - SP[:, 5]) / 0.012, 0, 1)
            sel = g > 0
            sp = SP[sel]; g = g[sel]
            tx = sp[:, 0] + (sp[:, 2] - sp[:, 0]) * g; ty = sp[:, 1] + (sp[:, 3] - sp[:, 1]) * g
            for L, canv in ((0, cb), (1, cp)):
                m = sp[:, 6] == L
                if not m.any():
                    continue
                Pb = np.stack([sp[m, 0], sp[m, 1]], 1) * sc + [ox, oy]
                Pt = np.stack([tx[m], ty[m]], 1) * sc + [ox, oy]
                PP = (np.stack([Pb, Pt], 1) * ss * q).astype(np.int32)
                tw = max(1, int(round((0.62 if L == 0 else 0.45) * ss)))
                cv2.polylines(canv, list(PP), False, 255, tw, cv2.LINE_AA, 4)
                hr = np.maximum(sp[m, 4] * sc * g[m], 0.45)
                th2 = np.clip(np.round(2 * hr * ss), 1, 50).astype(np.int32)
                Ph = (Pt * ss * q).astype(np.int32)
                for t in np.unique(th2):
                    s2 = th2 == t
                    cv2.polylines(canv, list(np.stack([Ph[s2], Ph[s2]], 1)), False, 255, int(t), cv2.LINE_AA, 4)
        # growth cones at every advancing front (dendrites, axon, neighbours)
        front = vis & (u < u1) & np.isin(kind, (0, 1, 5)) & (u < ret0)
        arrived = vis & (u >= u1) & (u - u1 < 0.02) & (tip > 0) & np.isin(kind, (0, 1, 5))
        fi = np.where(front | arrived)[0]
        for i in fi:
            L = int(layer[i])
            canv = cb if L == 0 else cp
            fr_i = min(1.0, (u - u0[i]) / max(u1[i] - u0[i], 1e-6))
            gx = x0[i] + (x1[i] - x0[i]) * fr_i; gy = y0[i] + (y1[i] - y0[i]) * fr_i
            fade = 1.0 if u < u1[i] else 1 - (u - u1[i]) / 0.02
            dx, dy = x1[i] - x0[i], y1[i] - y0[i]
            a0 = math.atan2(dy, dx)
            sz = (1.0 if L == 0 else 0.8) * fade
            rc = min(max(1.1, 1.3 * r[i] * sc), 1.9 * sc) * sz
            X, Y = (gx * sc + ox), (gy * sc + oy)
            cv2.circle(canv, (int(X * ss * q), int(Y * ss * q)), int(rc * ss * q), 255, -1, cv2.LINE_AA, 4)
            # filopodia: three or four hairs fanned ahead, slowly searching
            h = (i * 2654435761) % 1000 / 1000.0
            nf = 3 + int(h * 2)
            for j in range(nf):
                aj = a0 + (j - (nf - 1) / 2) * 0.55 + 0.25 * math.sin(u * 900 * (0.6 + h) + j * 2.1 + h * 6)
                ln = (2.5 + 2.0 * math.sin(u * 700 * (0.5 + h) + j * 1.3 + 3 * h) ** 2) * sc * sz * 1.4
                ex_, ey_ = X + ln * math.cos(aj), Y + ln * math.sin(aj)
                cv2.line(canv, (int(X * ss * q), int(Y * ss * q)), (int(ex_ * ss * q), int(ey_ * ss * q)), 255,
                         max(1, int(round(0.5 * ss))), cv2.LINE_AA, 4)
        # cell bodies
        self._somata(u, sc, ox, oy, cb, cp, ss, q)
        b = cv2.resize(cb, (W, H), interpolation=cv2.INTER_AREA).astype(F32) / 255.0
        p = cv2.resize(cp, (W, H), interpolation=cv2.INTER_AREA).astype(F32) / 255.0
        return b, p

    def _somata(self, u, sc, ox, oy, cb, cp, ss, q):
        z = self.z
        # main soma: outline drawn on, then stipple accumulating as the cell matures
        a_out = float(smoothstep(0.008, 0.045, u))
        if a_out > 0:
            poly = z['soma_poly']
            n = len(poly)
            m = max(2, int(n * a_out))
            P = ((poly[:m] * sc + [ox, oy]) * ss * q).astype(np.int32)
            cv2.polylines(cb, [P], a_out >= 1, 255, max(1, int(round(1.25 * ss * min(1.3, sc)))), cv2.LINE_AA, 4)
            dens = 0.10 + 0.55 * float(smoothstep(0.02, 0.18, u)) + 0.35 * float(smoothstep(0.18, 0.85, u))
            vis = self.soma_thr < dens * self.soma_shade * float(smoothstep(0.015, 0.06, u))
            D = ((self.soma_dots[vis] * sc + [ox, oy]) * ss * q).astype(np.int32)
            t = max(1, int(round(1.05 * ss * min(1.4, sc))))
            cv2.polylines(cb, list(np.stack([D, D], 1)), False, 255, t, cv2.LINE_AA, 4)
        # granule cells (small, black, with clawed dendrites) and stellate cells (pale)
        for arr, canv, rs in ((z['gran'], cb, 1.0), (z['stell'], cp, 1.0)):
            for gx, gy, gr, ug in arr:
                a = float(smoothstep(ug - 0.02, ug + 0.005, u))
                if a <= 0:
                    continue
                cv2.circle(canv, (int((gx * sc + ox) * ss * q), int((gy * sc + oy) * ss * q)),
                           int(gr * rs * a * sc * ss * q), 255, -1, cv2.LINE_AA, 4)
        # neighbouring Purkinje somata (pale, solid)
        for poly, (ua, ub) in zip(z['neigh_soma'], z['neigh_soma_u']):
            a = float(smoothstep(ua, ub, u))
            if a <= 0:
                continue
            c = poly.mean(0)
            P = (((c + (poly - c) * (0.4 + 0.6 * a)) * sc + [ox, oy]) * ss * q).astype(np.int32)
            cv2.fillPoly(cp, [P], int(200 * a), cv2.LINE_AA, 4)

    def _labels(self, u, sc, ox, oy):
        L = self.z['labels']
        size = max(8, int(round(27 * sc)))
        font = ImageFont.truetype(self.label_font, size)
        img = None
        for code, lx, ly in L:
            ch = chr(int(code))
            a = float(smoothstep(LABEL_U.get(ch, 0.7), LABEL_U.get(ch, 0.7) + 0.03, u))
            if a <= 0:
                continue
            if img is None:
                img = Image.new('L', (self.W, self.H), 0); d = ImageDraw.Draw(img)
            X, Y = lx * sc + ox, ly * sc + oy
            d.text((X, Y), ch, font=font, fill=int(255 * a), anchor='mm')
        return None if img is None else np.asarray(img, np.uint8)


def save_png(f, path):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    cv2.imwrite(path, (np.clip(f, 0, 1)[..., ::-1] * 65535 + 0.5).astype(np.uint16) if path.endswith('16.png')
                else (np.clip(f, 0, 1)[..., ::-1] * 255 + 0.5).astype(np.uint8))


_P = None


def _init(args):
    global _P
    W, H = map(int, args.size.split('x'))
    _P = Plate(args.state, W, H, dur=args.dur, fps=args.fps, camera=args.camera)


def _frame16(i):
    n = int(round(_P.dur * _P.fps))
    f = _P.render(i / max(1, n - 1))
    return (np.clip(f, 0, 1) * 65535 + 0.5).astype('<u2').tobytes()


def _work(a):
    i, out = a
    n = int(round(_P.dur * _P.fps))
    if os.path.exists(out):
        return i
    f = _P.render(i / max(1, n - 1))
    save_png(f, out + '.tmp.png')
    os.replace(out + '.tmp.png', out)
    return i


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--state', default=os.path.join(HERE, 'state', 'neuron.npz'))
    ap.add_argument('--size', default='1920x1080')
    ap.add_argument('--fps', type=float, default=24)
    ap.add_argument('--dur', type=float, default=140.0)
    ap.add_argument('--camera', default='move', choices=['move', 'locked'])
    ap.add_argument('--still', type=float, nargs='*', help='u values (0..1)')
    ap.add_argument('--at', type=float, nargs='*', help='still times in seconds')
    ap.add_argument('--out', default=os.path.join(HERE, 'work', 'still.png'))
    ap.add_argument('--frames', help='directory for a PNG sequence')
    ap.add_argument('--range', type=int, nargs=2)
    ap.add_argument('--step', type=int, default=1)
    ap.add_argument('--jobs', type=int, default=14)
    ap.add_argument('--mov', help='write ProRes 422 HQ straight from the frames (ordered pipe to ffmpeg)')
    args = ap.parse_args()
    W, H = map(int, args.size.split('x'))
    n = int(round(args.dur * args.fps))
    if args.still is not None or args.at is not None:
        _init(args)
        us = list(args.still or []) + [min(1.0, t / ((n - 1) / args.fps)) for t in (args.at or [])]
        for u in us:
            out = args.out if len(us) == 1 else args.out.replace('.png', f'_u{u:.3f}.png')
            save_png(_P.render(u), out)
            print(out)
        return
    if args.mov:
        import subprocess
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb48le', '-s', f'{W}x{H}',
               '-r', str(args.fps), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '3', '-vendor', 'apl0',
               '-pix_fmt', 'yuv422p10le', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
               args.mov]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        with Pool(args.jobs, initializer=_init, initargs=(args,)) as pool:
            for k, f in enumerate(pool.imap(_frame16, range(n), chunksize=2)):
                ff.stdin.write(f)
                if k % 240 == 0:
                    print(f'{k}/{n}', flush=True)
        ff.stdin.close()
        ff.wait()
        return
    os.makedirs(args.frames, exist_ok=True)
    idx = list(range(n)) if not args.range else list(range(*args.range))
    idx = idx[::args.step]
    jobs = [(i, os.path.join(args.frames, f'neuron_{i:05d}.png')) for i in idx]
    with Pool(args.jobs, initializer=_init, initargs=(args,)) as pool:
        for k, i in enumerate(pool.imap_unordered(_work, jobs, chunksize=2)):
            if k % 100 == 0:
                print(f'{k}/{len(idx)}', flush=True)


if __name__ == '__main__':
    main()
