"""Render the frost simulation as an engraved textbook plate, one frame per call, any frame in any order.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY render.py --state state/frost.npz --still 0.6 --out work/still.png        # u = 0..1 through the clip
    $PY render.py --state state/frost.npz --frames out/png --fps 24 --dur 140     # PNG sequence
    $PY render.py ... --size 3840x2160   (layout is authored at 1920x1080 and scales)

Everything that is not frost (paper, rules, caption, glass ruling, stipple thresholds) is built once and is identical
in every frame. The frost at time t is closed-form from the simulation's arrival map: cell solid iff arr <= S(t),
with S(t) chosen so the covered fraction follows an eased curve (see pacing()).
"""
import argparse
import math
import os
import sys
from multiprocessing import Pool

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
F32 = np.float32

INK = np.array([0.13, 0.11, 0.10], F32)          # iron-gall-ish black, a touch warm
PAPER = np.array([0.925, 0.885, 0.795], F32)      # cream, slightly toned

# layout at 1920x1080
PANE = (80, 58, 1840, 938)       # x0, y0, x1, y1 : 1760 x 880 (2:1, the sim's aspect)
CAPTION = 'Fig. 31.—Frost-figures on a window-pane, formed during a night of hard frost.'
SUBCAP = 'From a drawing made at the window, at intervals through the night.'
HEADER = 'PLATE XIV.'


def gblur(a, s):
    if s <= 0:
        return a
    k = int(s * 3) * 2 + 1
    return cv2.GaussianBlur(a, (k, k), s, borderType=cv2.BORDER_REFLECT)


def fbm(h, w, seed, octaves=5, base=6):
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
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


class Plate:
    def __init__(self, state, W, H, ss=2, dur=140.0, fps=24, seed=3, c_end=0.60):
        self.c_end = c_end
        self.W, self.H, self.ss = W, H, ss
        self.k = W / 1920.0
        self.dur, self.fps = dur, fps
        z = np.load(state)
        arr = z['arr'].astype(F32)
        self.sim_steps = float(z['steps'])
        k, ss_ = self.k, ss
        px0, py0, px1, py1 = [int(round(v * k)) for v in PANE]
        self.pane = (px0, py0, px1, py1)
        pw, ph = (px1 - px0) * ss_, (py1 - py0) * ss_
        self.pw, self.ph = pw, ph
        big = self.sim_steps * 4
        a = np.where(np.isfinite(arr), arr, big).astype(F32)
        self.arr = cv2.resize(a, (pw, ph), interpolation=cv2.INTER_LINEAR if pw >= a.shape[1] else cv2.INTER_AREA)
        # coverage curve of the sim for pacing
        fin = np.sort(arr[np.isfinite(arr)].ravel())
        self.cov_s = fin
        self.cov_n = arr.size
        # cell size in render px (pane space): sim cells per px
        self.cell = a.shape[1] / pw
        self._build_static(seed)
        self._pacing()

    # ---------------------------------------------------------------- static layers
    def _build_static(self, seed):
        W, H, k = self.W, self.H, self.k
        r = np.random.default_rng(seed)
        # paper: tone, grain, a few foxing marks, darker toward the sheet's edges
        tone = (fbm(H, W, seed, 5, 4) - 0.5) * 0.05
        grain = (gblur(r.random((H, W)).astype(F32), 0.6 * k) - 0.5) * 0.05
        fib = (fbm(H, W, seed + 1, 3, 90) - 0.5) * 0.025
        yy, xx = np.mgrid[0:H, 0:W].astype(F32)
        ex = np.minimum(xx, W - 1 - xx) / W
        ey = np.minimum(yy, H - 1 - yy) / H
        edge = np.exp(-np.minimum(ex * 2.2, ey * 2.2 * H / W) * 14)       # toned margins
        paper = PAPER[None, None] * (1 + tone + grain + fib)[..., None]
        paper *= (1 - 0.06 * edge)[..., None]
        paper *= np.array([1, 0.99, 0.965], F32)[None, None] ** (edge[..., None] * 3)
        fox = np.zeros((H, W), F32)
        for i in range(14):
            cx, cy = r.uniform(0, W), r.uniform(0, H)
            rad = r.uniform(2, 9) * k
            m = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (rad * rad)))
            fox += m * r.uniform(0.25, 0.8)
        fox = np.clip(fox * (0.6 + 0.8 * fbm(H, W, seed + 5, 3, 30)), 0, 1)
        paper = paper * (1 - fox[..., None] * np.array([0.05, 0.10, 0.20], F32)[None, None])
        self.paper = paper.astype(F32)

        # print: rules, header, caption (ink density 0..1)
        img = Image.new('L', (W, H), 0)
        d = ImageDraw.Draw(img)
        x0, y0, x1, y1 = self.pane
        def rect(o, w):
            d.rectangle([x0 - o, y0 - o, x1 + o - 1, y1 + o - 1], outline=255, width=max(1, int(round(w))))
        rect(int(3 * k), 1.0 * k)
        rect(int(9 * k), 2.6 * k)
        fdir = os.path.join(HERE, 'fonts')
        f_it = ImageFont.truetype(os.path.join(fdir, 'IMFeENit28P.ttf'), int(27 * k))
        f_rm = ImageFont.truetype(os.path.join(fdir, 'IMFeENrm28P.ttf'), int(21 * k))
        f_sc = ImageFont.truetype(os.path.join(fdir, 'IMFeENsc28P.ttf'), int(20 * k))
        def ctext(y, s, f):
            bb = d.textbbox((0, 0), s, font=f)
            d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], y), s, font=f, fill=255)
        ctext(int(988 * k), CAPTION, f_it)
        ctext(int(1026 * k), SUBCAP, f_rm)
        d.text((x1 - 6 * k - d.textbbox((0, 0), HEADER, font=f_sc)[2], int(16 * k)), HEADER, font=f_sc, fill=255)
        d.text((x0 + 6 * k, int(16 * k)), 'FORMS OF WATER.', font=f_sc, fill=255)
        prn = np.asarray(img, F32) / 255.0
        # letterpress: slight ink squash and paper bite
        prn = np.clip(prn * (0.85 + 0.3 * fbm(H, W, seed + 9, 3, 200)), 0, 1)
        self.print = prn

        # pane-space static fields at supersampled resolution
        pw, ph, ss = self.pw, self.ph, self.ss
        yy, xx = np.mgrid[0:ph, 0:pw].astype(F32)
        self.yy, self.xx = yy, xx
        u = (xx / pw - 0.5) / 0.40
        v = (yy / ph - 0.47) / 0.44
        centre = np.exp(-((u * u + v * v) ** 1.6))
        self.centre = centre
        P = 3.3 * k * ss                                     # line period in supersampled px
        wob = (fbm(ph, pw, seed + 20, 3, 5) - 0.5) * 1.2
        self.d_ground = self._dist((yy) / P + wob)          # horizontal ruling (the glass)
        self.d_h1 = self._dist((xx * math.cos(0.8) + yy * math.sin(0.8)) / (P * 0.9) + wob * 0.5)
        self.d_h2 = self._dist((xx * math.cos(-0.75) + yy * math.sin(-0.75)) / (P * 0.9) + wob * 0.5)
        self.P = P
        # glass tone: night behind the pane, darker toward the sash, lighter in the middle
        self.ground_tone = (0.56 - 0.42 * centre + 0.06 * (yy / ph)).astype(F32)
        # stipple thresholds: sparse random dots, each a fixed place and threshold
        rr = np.random.default_rng(seed + 30)
        dots = (rr.random((ph, pw)) ** 1.0).astype(F32)
        self.stip_thr = dots
        self.ink_noise = (gblur(rr.random((ph, pw)).astype(F32), 0.8 * ss) - 0.5) * 2

    @staticmethod
    def _dist(p):
        """distance (0..0.5, in periods) from the nearest line centre of a line screen with phase p"""
        return np.abs(((p + 0.5) % 1.0) - 0.5).astype(F32)

    def _screen(self, tone, d, aa=None):
        aa = aa or (0.8 / self.P * self.ss)
        return np.clip((tone * 0.5 - d) / aa + 0.5, 0, 1)

    # ---------------------------------------------------------------- pacing
    def coverage_at(self, s):
        return np.searchsorted(self.cov_s, s) / self.cov_n

    def _pacing(self):
        """S(u): sim step shown at clip fraction u. Coverage follows an eased curve that is still rising at the end."""
        s_end = self.sim_steps
        if self.c_end is not None:          # stop the clip when the pane reaches this coverage
            grid = np.linspace(0, s_end, 4001)
            s_end = float(np.interp(self.c_end, self.coverage_at(grid), grid))
        c_end = self.coverage_at(s_end)
        ss_ = np.linspace(0, s_end, 4001)
        cc = self.coverage_at(ss_)
        uu = np.linspace(0, 1, 2001)
        # hold bare glass for the first moment, then ease in; slope at the end stays positive
        w = np.clip((uu - 0.015) / 0.985, 0, 1)
        target = c_end * (0.5 * w * w * (3 - 2 * w) + 0.5 * w ** 1.6)      # end slope ~0.8 of the mean rate
        target = np.maximum.accumulate(target)
        self.S_u = np.interp(target, cc, ss_)
        self.S_u[w <= 0] = -1e9
        self.uu = uu

    def S(self, u):
        return float(np.interp(u, self.uu, self.S_u))

    # ---------------------------------------------------------------- one frame
    def frost_mask(self, s):
        # soft threshold of the arrival map: about one sim cell of front width
        wsteps = 40.0
        m = np.clip((s - self.arr) / wsteps + 0.5, 0, 1).astype(F32)
        return m

    def render(self, u):
        s = self.S(u)
        ss = self.ss
        m = gblur(self.frost_mask(s), 0.6 * ss)
        age = np.clip((s - self.arr) / max(1.0, 0.25 * self.sim_steps), 0, 1)
        # signed distance to the edge (px, supersampled) from the smoothed mask
        gy, gx = np.gradient(m)
        gm = np.sqrt(gx * gx + gy * gy) + 1e-4
        sd = (m - 0.5) / gm
        lw = 1.15 * ss * self.k
        outline = np.clip(1 - (np.abs(sd) - lw * 0.5) / (0.7 * ss), 0, 1) * (gm > 0.02)
        # relief: light from upper left
        h = gblur(m, 3.0 * ss * self.k)
        hy, hx = np.gradient(h)
        shade = np.clip((hx + hy) * (-1 / math.sqrt(2)) * 7.0 * ss * self.k, 0, 1)
        inside = smoothstep(0.35, 0.75, m)
        frost_tone = inside * 0.85 * smoothstep(0.12, 1.0, shade)
        frost_ink = np.maximum(self._screen(frost_tone, self.d_h1),
                               self._screen(np.clip(frost_tone - 0.45, 0, 1) * 1.6, self.d_h2))
        # stipple: rime in old frost, appearing dot by dot
        stip = inside * (1 - shade) * (self.stip_thr < 0.018 * smoothstep(0.02, 0.7, age)) * 0.85
        ground = (1 - inside) * self._screen(self.ground_tone, self.d_ground)
        ink = np.maximum.reduce([ground, frost_ink, outline, stip.astype(F32)])
        ink = np.clip(ink * (0.92 + 0.08 * self.ink_noise), 0, 1)
        # down to the output resolution
        ink = cv2.resize(ink, (self.pw // ss, self.ph // ss), interpolation=cv2.INTER_AREA)
        dens = self.print.copy()
        x0, y0, x1, y1 = self.pane
        dens[y0:y1, x0:x1] = np.maximum(dens[y0:y1, x0:x1], ink)
        f = self.paper * (1 - dens[..., None] * (1 - INK[None, None] / PAPER[None, None]) * 0.97)
        return np.clip(f, 0, 1)


def save_png(f, path):
    cv2.imwrite(path, (np.clip(f, 0, 1)[..., ::-1] * 65535 + 0.5).astype(np.uint16) if path.endswith('16.png')
                else (np.clip(f, 0, 1)[..., ::-1] * 255 + 0.5).astype(np.uint8))


_P = None


def _frame16(i):
    n = int(round(_P.dur * _P.fps))
    f = _P.render(i / max(1, n - 1))
    return (np.clip(f, 0, 1) * 65535 + 0.5).astype('<u2').tobytes()


def _work(i):
    n = int(round(_P.dur * _P.fps))
    u = i / max(1, n - 1)
    out = os.path.join(_OUT, f'frost_{i:05d}.png')
    if os.path.exists(out):
        return i
    f = _P.render(u)
    save_png(f, out + '.tmp.png')
    os.replace(out + '.tmp.png', out)
    return i


def main():
    global _P, _OUT
    ap = argparse.ArgumentParser()
    ap.add_argument('--state', default=os.path.join(HERE, 'state', 'frost.npz'))
    ap.add_argument('--size', default='1920x1080')
    ap.add_argument('--ss', type=int, default=2)
    ap.add_argument('--fps', type=float, default=24)
    ap.add_argument('--dur', type=float, default=140.0)
    ap.add_argument('--still', type=float, nargs='*')
    ap.add_argument('--out', default='work/still.png')
    ap.add_argument('--frames', help='directory for a PNG sequence')
    ap.add_argument('--c_end', type=float, default=0.60, help='pane coverage at the last frame')
    ap.add_argument('--jobs', type=int, default=16)
    ap.add_argument('--range', type=int, nargs=2)
    ap.add_argument('--mov', help='write ProRes 422 HQ straight from the frames (ordered pipe to ffmpeg)')
    args = ap.parse_args()
    W, H = map(int, args.size.split('x'))
    _P = Plate(args.state, W, H, ss=args.ss, dur=args.dur, fps=args.fps, c_end=args.c_end)
    if args.still is not None:
        for u in args.still:
            out = args.out if len(args.still) == 1 else args.out.replace('.png', f'_{u:.2f}.png')
            save_png(_P.render(u), out)
            print(out, 'S=%.0f cov=%.3f' % (_P.S(u), _P.coverage_at(_P.S(u))))
        return
    n = int(round(args.dur * args.fps))
    if args.mov:
        import subprocess
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb48le', '-s', f'{W}x{H}',
               '-r', str(args.fps), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '3', '-vendor', 'apl0',
               '-pix_fmt', 'yuv422p10le', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
               args.mov]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        with Pool(args.jobs) as pool:
            for k, f in enumerate(pool.imap(_frame16, range(n), chunksize=2)):
                ff.stdin.write(f)
                if k % 240 == 0:
                    print(f'{k}/{n}', flush=True)
        ff.stdin.close()
        ff.wait()
        return
    _OUT = args.frames
    os.makedirs(_OUT, exist_ok=True)
    idx = list(range(n)) if not args.range else list(range(*args.range))
    with Pool(args.jobs) as pool:
        for k, i in enumerate(pool.imap_unordered(_work, idx, chunksize=4)):
            if k % 100 == 0:
                print(f'{k}/{len(idx)}', flush=True)


if __name__ == '__main__':
    main()
