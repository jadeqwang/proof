"""Render the spectrogram plate (PLATE XXI, "THE VOICE.") frame by frame, in sync with the master.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY render.py --variant short --still 192.95 --out work/still.png        # a frame at master time 192.95 s
    $PY render.py --variant short --mov out/spectrogram_short_master_prores422hq.mov
    $PY render.py --variant long --mode ink --mov ...                        # faint whole plate, inks in as sung
    $PY render.py --variant short --alpha --mov out/..._alpha_prores4444.mov  # figure only, transparent ground

Times are master (full-mix) seconds: inputs/Proof (-2sm).wav, = the *_full fields of lyrics_timed.json. Frame i of a
clip shows the plate at t = clip_start + i / fps. The analysis (spectrogram, f0) is read from state/voice.npz,
written by analyze.py. Paper, rules, type and inks are frost's (../frost/render.py), so the plates sit together.
"""
import argparse
import math
import os
import subprocess
from multiprocessing import Pool

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import map_coordinates

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'frost', 'fonts')
F32 = np.float32

INK = np.array([0.13, 0.11, 0.10], F32)          # frost's iron-gall black
PAPER = np.array([0.925, 0.885, 0.795], F32)      # frost's cream
GOLD = np.array([0.80, 0.60, 0.22], F32)          # gold graphite (the film's field-note gold)

# ---------------------------------------------------------------------------------------------------------- layout
PANE = (80, 58, 1840, 938)       # frost's plate rule (double rule drawn just outside it)
A_BOX = (250, 92, 1770, 600)     # spectrogram panel: x0, y0, x1, y1
B_BOX = (250, 676, 1770, 852)    # the fundamental, enlarged
FMAX = 3500.0                    # c.p.s., top of the spectrogram (Visible Speech's scale ran 0-3500)
HEADER_L, HEADER_R = 'THE VOICE.', 'PLATE XXI.'

VARIANTS = {
    # axis: the figure's time span; clip: the video's span (handles: the bare plate before, the finished plate after)
    'short': dict(
        axis=(191.45, 194.35), clip=(190.45, 195.45),
        caption='Fig. 7.—Narrow-band spectrogram of the phrase ‘hug durations, pitch contours,’ sung; '
                'the fundamental traced.',
        subcap='Analysing filter 45 cycles wide. Below, the fundamental on an enlarged scale of semitones.',
        # syllable onsets (master time): word onsets from lyrics_timed.json, syllable splits read off the voicing
        sylls=[('hug', 191.572), ('du-', 191.932), ('ra-', 192.09), ('tions,', 192.32), ('pitch', 192.81),
               ('con-', 193.11), ('tours', 193.43)],
        semis=None,         # semitone range of panel B rel. to C4; None = from the contour, one semitone of room
        tick=0.1, label_every=0.5, syl_size=22),
    'long': dict(
        axis=(189.05, 199.15), clip=(188.05, 200.05),
        caption='Fig. 7.—Narrow-band spectrogram of the phrases ‘I nod, past hour reviewed; hug durations, '
                'pitch contours; room crossing velocity,’ sung; the fundamental traced.',
        subcap='Analysing filter 45 cycles wide. Below, the fundamental on an enlarged scale of semitones.',
        sylls=[('I', 189.11), ('nod,', 189.231), ('past', 189.79), ('hour', 190.11), ('reviewed', 190.592),
               ('hug', 191.572), ('durations,', 191.932), ('pitch', 192.81), ('contours', 193.11),
               ('room', 194.59), ('crossing', 195.175), ('velocity', 197.056)],
        semis=None,
        tick=0.1, label_every=1.0, syl_size=21),
}

NOTE_NAMES = {0: 'c’', 2: 'd’', 4: 'e’', 5: 'f’', 7: 'g’', 9: 'a’', 11: 'b’',
              -1: 'b', -3: 'a', -5: 'g', -7: 'f', -8: 'e', -10: 'd', -12: 'c'}   # Helmholtz, rel. to C4 = c'
C4 = 261.6256


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


def make_paper(W, H, k, seed=3, laid=True):
    """frost's paper (same seed and recipe), plus a faint laid-and-chain texture"""
    r = np.random.default_rng(seed)
    tone = (fbm(H, W, seed, 5, 4) - 0.5) * 0.05
    grain = (gblur(r.random((H, W)).astype(F32), 0.6 * k) - 0.5) * 0.05
    fib = (fbm(H, W, seed + 1, 3, 90) - 0.5) * 0.025
    yy, xx = np.mgrid[0:H, 0:W].astype(F32)
    ex = np.minimum(xx, W - 1 - xx) / W
    ey = np.minimum(yy, H - 1 - yy) / H
    edge = np.exp(-np.minimum(ex * 2.2, ey * 2.2 * H / W) * 14)
    lay = np.zeros((H, W), F32)
    if laid:
        wob = (fbm(H, W, seed + 40, 3, 6) - 0.5) * 3.0 * k
        lay += 0.006 * np.cos(2 * np.pi * (yy + wob) / (5.2 * k))                   # laid lines
        cx = (xx + wob * 2) % (168 * k)                                              # chain lines, ~26 mm apart
        lay -= 0.012 * np.exp(-((cx - 84 * k) / (2.2 * k)) ** 2)
    paper = PAPER[None, None] * (1 + tone + grain + fib + lay)[..., None]
    paper *= (1 - 0.06 * edge)[..., None]
    paper *= np.array([1, 0.99, 0.965], F32)[None, None] ** (edge[..., None] * 3)
    fox = np.zeros((H, W), F32)
    for i in range(14):
        cx_, cy_ = r.uniform(0, W), r.uniform(0, H)
        rad = r.uniform(2, 9) * k
        m = np.exp(-(((xx - cx_) ** 2 + (yy - cy_) ** 2) / (rad * rad)))
        fox += m * r.uniform(0.25, 0.8)
    fox = np.clip(fox * (0.6 + 0.8 * fbm(H, W, seed + 5, 3, 30)), 0, 1)
    paper = paper * (1 - fox[..., None] * np.array([0.05, 0.10, 0.20], F32)[None, None])
    return paper.astype(F32)


class Plate:
    def __init__(self, variant, W=1920, H=1080, ss=2, fps=24.0, band='narrow', mode='draw', alpha=False,
                 alpha_parts='figure', state=os.path.join(HERE, 'state', 'voice.npz'), ghost=0.13,
                 db_range=38.0, gamma=1.25):
        self.V = dict(VARIANTS[variant])
        self.variant, self.W, self.H, self.ss, self.fps = variant, W, H, ss, fps
        self.k = W / 1920.0
        self.band, self.mode, self.alpha, self.alpha_parts, self.ghost = band, mode, alpha, alpha_parts, ghost
        self.db_range, self.gamma = db_range, gamma
        self.z = np.load(state)
        self.ta0, self.ta1 = self.V['axis']
        self.tc0, self.tc1 = self.V['clip']
        self.n = int(round((self.tc1 - self.tc0) * fps))
        S = lambda b: tuple(int(round(v * self.k)) for v in b)
        self.A, self.B, self.pane = S(A_BOX), S(B_BOX), S(PANE)
        self.paper = make_paper(W, H, self.k)
        self._contour()
        if self.V.get('semis') is None:
            allf = np.concatenate([ff for _, ff in self.runs])
            st = 12 * np.log2(allf / C4)
            self.V['semis'] = (int(np.floor(st.min())) - 1, int(np.ceil(st.max())) + 1)
        self._print()
        self._spec()
        self._gold()

    # ---------------------------------------------------------------------------------------------- mapping
    def x_of_t(self, t, box=None):
        x0, _, x1, _ = box or self.A
        return x0 + (np.asarray(t) - self.ta0) / (self.ta1 - self.ta0) * (x1 - x0)

    def yA(self, f):
        _, y0, _, y1 = self.A
        return y1 - np.asarray(f) / FMAX * (y1 - y0)

    def yB(self, f):
        _, y0, _, y1 = self.B
        s0, s1 = self.V['semis']
        s = 12 * np.log2(np.asarray(f) / C4)
        return y1 - (s - (s0 - 0.5)) / ((s1 + 0.5) - (s0 - 0.5)) * (y1 - y0)

    # ---------------------------------------------------------------------------------------------- f0 contour
    def _contour(self):
        z = self.z
        t, f0 = z['t_f0'].astype(np.float64), z['f0'].astype(np.float64)
        ok = np.isfinite(f0) & (t >= self.ta0) & (t <= self.ta1)
        runs = []
        idx = np.where(ok)[0]
        if len(idx):
            for r in np.split(idx, np.where(np.diff(idx) > 1)[0] + 1):
                r = r[1:-1] if len(r) > 6 else r              # trim one 5 ms frame at each end (edges wobble)
                if len(r) < 12:                               # under 60 ms: not drawn
                    continue
                lf = np.log2(f0[r])
                # light smoothing within the run (Gaussian, sigma 10 ms), no smoothing across breaks
                lf = _gsmooth(lf, 2.0)
                runs.append((t[r], 2 ** lf))
        self.runs = runs

    def f0_at(self, tq):
        for tt, ff in self.runs:
            if tt[0] <= tq <= tt[-1]:
                return float(np.interp(tq, tt, ff))
        return None

    # ---------------------------------------------------------------------------------------------- static print
    def _print(self):
        """ink density layers at ss x: 'plate' (rules, header, caption) and 'figure' (axes, scales, words)"""
        W, H, k, ss = self.W, self.H, self.k, self.ss
        K = k * ss
        plate = Image.new('L', (W * ss, H * ss), 0)
        fig = Image.new('L', (W * ss, H * ss), 0)
        dp, df = ImageDraw.Draw(plate), ImageDraw.Draw(fig)
        f_it = ImageFont.truetype(os.path.join(FONTS, 'IMFeENit28P.ttf'), int(27 * K))
        f_rm = ImageFont.truetype(os.path.join(FONTS, 'IMFeENrm28P.ttf'), int(21 * K))
        f_sc = ImageFont.truetype(os.path.join(FONTS, 'IMFeENsc28P.ttf'), int(20 * K))
        f_num = ImageFont.truetype(os.path.join(FONTS, 'IMFeENrm28P.ttf'), int(18 * K))
        f_lab = ImageFont.truetype(os.path.join(FONTS, 'IMFeENsc28P.ttf'), int(16 * K))
        f_note = ImageFont.truetype(os.path.join(FONTS, 'IMFeENit28P.ttf'), int(20 * K))
        f_syl = ImageFont.truetype(os.path.join(FONTS, 'IMFeENit28P.ttf'), int(self.V['syl_size'] * K))
        s = lambda v: v * ss

        # plate: frost's double rule, header, caption
        x0, y0, x1, y1 = [s(v) for v in self.pane]

        def rect(d, o, w):
            d.rectangle([x0 - o, y0 - o, x1 + o - 1, y1 + o - 1], outline=255, width=max(1, int(round(w))))
        rect(dp, int(3 * K), 1.0 * K)
        rect(dp, int(9 * K), 2.6 * K)

        def ctext(d, y, txt, f):
            bb = d.textbbox((0, 0), txt, font=f)
            d.text(((W * ss - (bb[2] - bb[0])) / 2 - bb[0], y), txt, font=f, fill=255)
        cap = self.V['caption']
        fc = f_it
        while dp.textbbox((0, 0), cap, font=fc)[2] > (self.pane[2] - self.pane[0]) * ss * 0.98:
            fc = ImageFont.truetype(os.path.join(FONTS, 'IMFeENit28P.ttf'), int(fc.size * 0.97))
        ctext(dp, int(988 * K), cap, fc)
        ctext(dp, int(1026 * K), self.V['subcap'], f_rm)
        dp.text((x1 - 6 * K - dp.textbbox((0, 0), HEADER_R, font=f_sc)[2], int(16 * K)), HEADER_R, font=f_sc, fill=255)
        dp.text((x0 + 6 * K, int(16 * K)), HEADER_L, font=f_sc, fill=255)

        # figure: panel frames
        ax0, ay0, ax1, ay1 = [s(v) for v in self.A]
        bx0, by0, bx1, by1 = [s(v) for v in self.B]
        lw = max(1, int(round(1.1 * K)))
        df.rectangle([ax0, ay0, ax1, ay1], outline=255, width=lw)
        df.rectangle([bx0, by0, bx1, by1], outline=255, width=lw)

        # frequency scale (panel A), ticks outside the left and right edges
        for fq in np.arange(0, FMAX + 1, 100):
            y = s(float(self.yA(fq)))
            major = fq % 500 == 0
            L = (13 if fq % 1000 == 0 else 9 if major else 5) * K
            df.line([ax0 - L, y, ax0, y], fill=255, width=lw)
            df.line([ax1, y, ax1 + L, y], fill=255, width=lw)
            if major:
                txt = f'{int(fq)}'
                bb = df.textbbox((0, 0), txt, font=f_num)
                df.text((ax0 - 18 * K - bb[2], y - (bb[1] + bb[3]) / 2), txt, font=f_num, fill=255)
        # vertical label
        lab = 'FREQUENCY IN CYCLES PER SECOND.'
        bb = df.textbbox((0, 0), lab, font=f_lab)
        tmp = Image.new('L', (bb[2] + 4, bb[3] + 4), 0)
        ImageDraw.Draw(tmp).text((2, 2), lab, font=f_lab, fill=255)
        tmp = tmp.rotate(90, expand=True)
        fig.paste(255, (int(ax0 - 96 * K - tmp.size[0] / 2), int((ay0 + ay1) / 2 - tmp.size[1] / 2)), tmp)

        # semitone scale (panel B): faint hairline per semitone, firmer for the natural notes, named at the left
        s0, s1 = self.V['semis']
        for st in range(s0, s1 + 1):
            fq = C4 * 2 ** (st / 12)
            y = s(float(self.yB(fq)))
            nat = (st % 12) in (0, 2, 4, 5, 7, 9, 11)
            if nat:
                df.line([bx0, y, bx1, y], fill=95, width=max(1, int(round(0.8 * K))))
                df.line([bx0 - 9 * K, y, bx0, y], fill=255, width=lw)
                name = NOTE_NAMES.get(st)
                # when the semitones are close, name only notes a whole tone from both neighbours (c d e g a)
                tight = (self.B[3] - self.B[1]) / (s1 - s0 + 1) < 15 * k
                if tight and (st % 12) in (5, 11):
                    name = None
                if name:
                    bb = df.textbbox((0, 0), name, font=f_note)
                    df.text((bx0 - 16 * K - bb[2], y - (bb[1] + bb[3]) / 2 - 2 * K), name, font=f_note, fill=255)
            else:
                # dotted hairline
                xs = np.arange(bx0, bx1, 7 * K)
                for xx in xs:
                    df.line([xx, y, xx + 2 * K, y], fill=70, width=max(1, int(round(0.7 * K))))
                df.line([bx0 - 5 * K, y, bx0, y], fill=255, width=lw)
        lab2 = 'THE FUNDAMENTAL.'
        bb = df.textbbox((0, 0), lab2, font=f_lab)
        tmp = Image.new('L', (bb[2] + 4, bb[3] + 4), 0)
        ImageDraw.Draw(tmp).text((2, 2), lab2, font=f_lab, fill=255)
        tmp = tmp.rotate(90, expand=True)
        fig.paste(255, (int(bx0 - 96 * K - tmp.size[0] / 2), int((by0 + by1) / 2 - tmp.size[1] / 2)), tmp)

        # time scale: ticks on the bottom of A and both edges of B, numbers under B
        tick, every = self.V['tick'], self.V['label_every']
        nt = int(math.floor((self.ta1 - self.ta0) / tick + 1e-6))
        for i in range(nt + 1):
            tt = i * tick
            x = s(float(self.x_of_t(self.ta0 + tt)))
            major = abs(tt / every - round(tt / every)) < 1e-6
            half = abs(tt / (every / 2) - round(tt / (every / 2))) < 1e-6
            L = (12 if major else 8 if half else 5) * K
            df.line([x, ay1, x, ay1 + L], fill=255, width=lw)
            df.line([x, by0 - L, x, by0], fill=255, width=lw)
            df.line([x, by1, x, by1 + L], fill=255, width=lw)
            if major:
                txt = ('%.1f' % tt).replace('.', '·') if every < 1 else '%d' % round(tt)
                bb = df.textbbox((0, 0), txt, font=f_num)
                df.text((x - (bb[0] + bb[2]) / 2, by1 + 17 * K), txt, font=f_num, fill=255)
        lab3 = 'TIME IN SECONDS.'
        bb = df.textbbox((0, 0), lab3, font=f_lab)
        df.text(((bx0 + bx1) / 2 - bb[2] / 2, by1 + 44 * K), lab3, font=f_lab, fill=255)

        # the words, under the spectrogram, at their onsets
        self.syl_boxes = []
        for txt, ts in self.V['sylls']:
            if not (self.ta0 - 0.05 <= ts <= self.ta1):
                continue
            x = s(float(self.x_of_t(max(ts, self.ta0))))
            bb = df.textbbox((0, 0), txt, font=f_syl)
            df.text((x - bb[0], ay1 + 24 * K), txt, font=f_syl, fill=255)
            self.syl_boxes.append((ts, x / ss, (x + bb[2]) / ss))
        self.syl_y = (ay1 + 24 * K) / ss

        def down(img):
            a = np.asarray(img, F32) / 255.0
            return cv2.resize(a, (W, H), interpolation=cv2.INTER_AREA)
        self.p_plate = down(plate)
        self.p_fig = down(fig)
        # the words appear as they are sung: keep a separate words-only layer
        words = Image.new('L', (W * ss, H * ss), 0)
        dw = ImageDraw.Draw(words)
        for txt, ts in self.V['sylls']:
            if not (self.ta0 - 0.05 <= ts <= self.ta1):
                continue
            x = s(float(self.x_of_t(max(ts, self.ta0))))
            bb = dw.textbbox((0, 0), txt, font=f_syl)
            dw.text((x - bb[0], ay1 + 24 * K), txt, font=f_syl, fill=255)
        self.p_words = down(words)
        self.p_fig = np.clip(self.p_fig - self.p_words, 0, 1)
        ink_noise = fbm(H, W, 9, 3, 200)
        self.letterpress = (0.85 + 0.3 * ink_noise).astype(F32)

    # ---------------------------------------------------------------------------------------------- spectrogram
    def _spec(self):
        z, ss, k = self.z, self.ss, self.k
        key = 'nb' if self.band == 'narrow' else 'wb'
        S, f, t = z[key], z['f_' + key], z['t_spec']
        x0, y0, x1, y1 = self.A
        pw, ph = (x1 - x0) * ss, (y1 - y0) * ss
        tt = self.ta0 + (np.arange(pw) + 0.5) / pw * (self.ta1 - self.ta0)
        ff = FMAX * (1 - (np.arange(ph) + 0.5) / ph)
        ti = np.interp(tt, t, np.arange(len(t)))
        fi = np.interp(ff, f, np.arange(len(f)))
        FI, TI = np.meshgrid(fi, ti, indexing='ij')
        D = map_coordinates(S, [FI, TI], order=1).astype(F32)
        # level: the loudest 0.3% of the figure's cells are full black; db_range below that is bare paper
        tm = (t >= self.ta0) & (t <= self.ta1)
        ref = np.percentile(S[f <= FMAX][:, tm], 99.7)
        d = np.clip((D - (ref - self.db_range)) / self.db_range, 0, 1)
        d = smoothstep(0.0, 1.0, d) ** self.gamma
        # the stylus' scan: a fine horizontal line screen whose line width carries the tone (frost's ruling is 3.3 px)
        yy = np.arange(ph, dtype=F32)[:, None]
        xx = np.arange(pw, dtype=F32)[None, :]
        P = 2.6 * k * ss
        wob = (fbm(ph, pw, 21, 3, 5) - 0.5) * 0.6
        dist = np.abs(((yy / P + wob + 0.5) % 1.0) - 0.5)
        aa = 0.8 / P * ss
        tone = np.clip(d * 1.08, 0, 1)
        lines = np.clip((tone * 0.5 - dist) / aa + 0.5, 0, 1) * smoothstep(0.0, 0.12, tone)   # bare paper at 0
        # where the tone is near full the lines close up into a solid burn
        solid = smoothstep(0.80, 1.0, tone)
        ink = np.maximum(lines, solid * tone)
        # burnt-paper grain of the facsimile record
        r = np.random.default_rng(7)
        grain = gblur(r.random((ph, pw)).astype(F32), 0.7 * ss)
        ink = np.clip(ink * (0.86 + 0.28 * (grain - 0.5) * 2 * 0.5 + 0.14), 0, 1)
        ink = cv2.resize(ink, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
        self.spec = np.zeros((self.H, self.W), F32)
        self.spec[y0:y1, x0:x1] = ink

    # ---------------------------------------------------------------------------------------------- gold
    def _gold(self):
        """gold contour layers (alpha) in panels A and B, and the paper halo that clears the ink under them"""
        ss, k = 4, self.k
        W, H = self.W, self.H
        g = np.zeros((H * ss, W * ss), np.uint8)
        halo = np.zeros((H * ss, W * ss), np.uint8)
        SH = 4
        for tt, ff in self.runs:
            for yfun, wid, hw in ((self.yA, 3.8, 2.0), (self.yB, 4.6, 2.2)):
                box = self.A if yfun == self.yA else self.B
                xs = self.x_of_t(tt, box) * ss
                ys = yfun(ff) * ss
                pts = np.round(np.stack([xs, ys], 1) * (1 << SH)).astype(np.int32)[None]
                cv2.polylines(halo, pts, False, 255, int(round((wid + 2 * hw) * k * ss)), cv2.LINE_AA, SH)
                cv2.polylines(g, pts, False, 255, int(round(wid * k * ss)), cv2.LINE_AA, SH)
        a = lambda m: cv2.resize(m.astype(F32) / 255.0, (W, H), interpolation=cv2.INTER_AREA)
        self.gold_a = a(g)
        self.halo_a = a(halo)
        # gold graphite sheen: slight tonal variation along the stroke
        sheen = fbm(H, W, 31, 3, 60)
        self.gold_rgb = (GOLD[None, None] * (0.92 + 0.16 * sheen)[..., None]).astype(F32)

    # ---------------------------------------------------------------------------------------------- one frame
    def reveal(self, t):
        """per-column reveal 0..1 (1 = inked) for master time t"""
        x = np.arange(self.W, dtype=F32) + 0.5
        xp = float(self.x_of_t(t))
        edge = 1.5 * self.k
        r = np.clip((xp - x) / edge + 0.5, 0, 1)
        if self.mode == 'ink':
            r = self.ghost + (1 - self.ghost) * r
        return r[None, :], xp

    def render(self, t):
        """returns (rgb, alpha) floats; alpha is None unless self.alpha"""
        W, H, k = self.W, self.H, self.k
        rv, xp = self.reveal(t)
        # the words: each fades in over 0.12 s from its onset (in ink mode they are faint until sung)
        words = np.zeros((H, W), F32)
        for ts, wx0, wx1 in self.syl_boxes:
            a = float(np.clip((t - ts) / 0.12, 0, 1))
            if self.mode == 'ink':
                a = self.ghost + (1 - self.ghost) * a
            sl = slice(max(0, int(wx0) - 4), min(W, int(math.ceil(wx1)) + 4))
            words[:, sl] = np.maximum(words[:, sl], self.p_words[:, sl] * a)
        spec = self.spec * rv
        halo = self.halo_a * rv
        gold = self.gold_a * rv
        fig = np.maximum(self.p_fig, words)
        # playhead: a hairline through both panels, from the moment the figure starts until it ends
        ph = np.zeros((H, W), F32)
        vis = smoothstep(self.ta0 - 0.25, self.ta0, t) * (1 - smoothstep(self.ta1, self.ta1 + 0.3, t))
        if vis > 0:
            ax0, ay0, ax1, ay1 = self.A
            bx0, by0, bx1, by1 = self.B
            xc = min(max(xp, ax0), ax1)
            x = np.arange(W, dtype=F32) + 0.5
            col = np.clip(1 - (np.abs(x - xc) - 0.55 * k) / 0.8, 0, 1) * 0.62 * vis
            ph[ay0:ay1, :] = col[None]
            ph[by0:by1, :] = col[None]
        ink = np.maximum.reduce([fig * self.letterpress, spec * (1 - halo), ph * (1 - halo)])
        if not self.alpha:
            ink = np.maximum(ink, self.p_plate * self.letterpress)
        ga = gold.copy()
        # the pen at the playhead: a gold bead on the contour while she is voicing
        fq = self.f0_at(t) if self.ta0 <= t <= self.ta1 else None
        if fq is not None:
            yy, xx = np.mgrid[0:H, 0:W].astype(F32) if not hasattr(self, '_grid') else self._grid
            self._grid = (yy, xx)
            for box, yf, rad in ((self.A, self.yA, 4.6), (self.B, self.yB, 6.0)):
                cx = float(self.x_of_t(t, box))
                cy = float(yf(fq))
                y0_, y1_ = int(cy - 12 * k), int(cy + 13 * k)
                x0_, x1_ = int(cx - 12 * k), int(cx + 13 * k)
                d = np.sqrt((xx[y0_:y1_, x0_:x1_] - cx) ** 2 + (yy[y0_:y1_, x0_:x1_] - cy) ** 2)
                bead = np.clip(rad * k - d + 0.5, 0, 1)
                hal = np.clip((rad + 2.0) * k - d + 0.5, 0, 1)
                ink[y0_:y1_, x0_:x1_] *= (1 - hal)
                ga[y0_:y1_, x0_:x1_] = np.maximum(ga[y0_:y1_, x0_:x1_], bead)
        ink = np.clip(ink, 0, 1)
        if self.alpha:
            # straight (un-premultiplied) colour and alpha for ProRes 4444
            ia = ink * 0.97
            a = ga + ia * (1 - ga)
            rgb = (INK[None, None] * (ia * (1 - ga))[..., None] + self.gold_rgb * ga[..., None]) / \
                np.maximum(a, 1e-4)[..., None]
            return np.clip(rgb, 0, 1), np.clip(a, 0, 1)
        f = self.paper * (1 - ink[..., None] * (1 - INK[None, None] / PAPER[None, None]) * 0.97)
        f = f * (1 - ga[..., None]) + self.gold_rgb * ga[..., None]
        return np.clip(f, 0, 1), None

    def t_of_frame(self, i):
        return self.tc0 + i / self.fps


def _gsmooth(v, sigma):
    v = np.asarray(v, np.float64)
    if sigma <= 0 or len(v) < 3:
        return v
    r = int(3 * sigma)
    kk = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    kk /= kk.sum()
    p = np.pad(v, r, mode='edge')
    return np.convolve(p, kk, mode='valid')


# -------------------------------------------------------------------------------------------------------------- io
def save_png(rgb, a, path):
    if a is None:
        cv2.imwrite(path, (np.clip(rgb, 0, 1)[..., ::-1] * 255 + 0.5).astype(np.uint8))
    else:
        bgra = np.concatenate([rgb[..., ::-1], a[..., None]], 2)
        cv2.imwrite(path, (np.clip(bgra, 0, 1) * 65535 + 0.5).astype(np.uint16))


_P = None


def _frame(i):
    rgb, a = _P.render(_P.t_of_frame(i))
    if a is None:
        return (np.clip(rgb, 0, 1) * 65535 + 0.5).astype('<u2').tobytes()
    return (np.clip(np.concatenate([rgb, a[..., None]], 2), 0, 1) * 65535 + 0.5).astype('<u2').tobytes()


def _init(kw):
    global _P
    _P = Plate(**kw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--variant', default='short', choices=list(VARIANTS))
    ap.add_argument('--mode', default='draw', choices=['draw', 'ink'])
    ap.add_argument('--band', default='narrow', choices=['narrow', 'wide'])
    ap.add_argument('--alpha', action='store_true', help='figure only, transparent ground (ProRes 4444 / RGBA PNG)')
    ap.add_argument('--size', default='1920x1080')
    ap.add_argument('--fps', type=float, default=24)
    ap.add_argument('--still', type=float, nargs='*', help='master times')
    ap.add_argument('--out', default=os.path.join(HERE, 'work', 'still.png'))
    ap.add_argument('--mov')
    ap.add_argument('--frames', help='directory for a PNG sequence')
    ap.add_argument('--jobs', type=int, default=12)
    args = ap.parse_args()
    W, H = map(int, args.size.split('x'))
    kw = dict(variant=args.variant, W=W, H=H, fps=args.fps, band=args.band, mode=args.mode, alpha=args.alpha)
    if args.still is not None:
        P = Plate(**kw)
        for t in args.still:
            out = args.out if len(args.still) == 1 else args.out.replace('.png', f'_{t:.2f}.png')
            rgb, a = P.render(t)
            save_png(rgb, a, out)
            print(out)
        return
    P = Plate(**kw)
    n = P.n
    print(f'{args.variant} {args.mode} {args.band}{" alpha" if args.alpha else ""}: {n} frames, '
          f'clip {P.tc0:.3f}-{P.tc0 + n / args.fps:.3f} s, axis {P.ta0}-{P.ta1} s', flush=True)
    if args.frames:
        os.makedirs(args.frames, exist_ok=True)
        global _P
        _P = P
        for i in range(n):
            rgb, a = P.render(P.t_of_frame(i))
            save_png(rgb, a, os.path.join(args.frames, f'{args.variant}_{i:05d}.png'))
        return
    if args.alpha:
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba64le', '-s', f'{W}x{H}',
               '-r', str(args.fps), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '4', '-vendor', 'apl0',
               '-pix_fmt', 'yuva444p10le', '-alpha_bits', '16', '-color_primaries', 'bt709', '-color_trc', 'bt709',
               '-colorspace', 'bt709', args.mov]
    else:
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb48le', '-s', f'{W}x{H}',
               '-r', str(args.fps), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '3', '-vendor', 'apl0',
               '-pix_fmt', 'yuv422p10le', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
               args.mov]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(args.jobs, initializer=_init, initargs=(kw,)) as pool:
        for j, buf in enumerate(pool.imap(_frame, range(n), chunksize=2)):
            ff.stdin.write(buf)
            if j % 48 == 0:
                print(f'{j}/{n}', flush=True)
    ff.stdin.close()
    ff.wait()


if __name__ == '__main__':
    main()
