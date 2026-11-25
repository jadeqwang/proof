"""The engraved plate: frost's sheet (paper, double rule, IM FELL header and caption) with a plant drawn by code from its
z-buffer. Static: built once per plant, identical in every frame. The gold thread is drawn on top by thread.py.

Layout is authored at 1920x1080 (frost's PANE, header and caption positions) and scales.
"""
import math
import os

import cv2
import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFont

import engine
from engine import DEV, blur

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'frost', 'fonts')
F32 = np.float32
INK = np.array([0.13, 0.11, 0.10], F32)          # frost's ink
PAPER = np.array([0.925, 0.885, 0.795], F32)      # frost's paper
PANE = (80, 58, 1840, 938)                         # frost's pane
HEADER_L = 'PHYLLOTAXIS.'
HEADER = 'PLATE XVIII.'


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


def gblur(a, s):
    if s <= 0:
        return a
    k = int(s * 3) * 2 + 1
    return cv2.GaussianBlur(a, (k, k), s, borderType=cv2.BORDER_REFLECT)


def paper_sheet(W, H, seed=3):
    """frost.render.Plate._build_static's paper, same seed: the same sheet."""
    k = W / 1920.0
    r = np.random.default_rng(seed)
    tone = (fbm(H, W, seed, 5, 4) - 0.5) * 0.05
    grain = (gblur(r.random((H, W)).astype(F32), 0.6 * k) - 0.5) * 0.05
    fib = (fbm(H, W, seed + 1, 3, 90) - 0.5) * 0.025
    yy, xx = np.mgrid[0:H, 0:W].astype(F32)
    ex = np.minimum(xx, W - 1 - xx) / W
    ey = np.minimum(yy, H - 1 - yy) / H
    edge = np.exp(-np.minimum(ex * 2.2, ey * 2.2 * H / W) * 14)
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
    return paper.astype(F32)


def print_layer(W, H, caption, subcap, seed=3, extra=None):
    """Rules, header, caption as ink density (frost's sizes and places). extra(d, k, fonts) may draw more."""
    k = W / 1920.0
    img = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = [int(round(v * k)) for v in PANE]

    def rect(o, w):
        d.rectangle([x0 - o, y0 - o, x1 + o - 1, y1 + o - 1], outline=255, width=max(1, int(round(w))))
    rect(int(3 * k), 1.0 * k)
    rect(int(9 * k), 2.6 * k)
    f_it = ImageFont.truetype(os.path.join(FONTS, 'IMFeENit28P.ttf'), int(27 * k))
    f_rm = ImageFont.truetype(os.path.join(FONTS, 'IMFeENrm28P.ttf'), int(21 * k))
    f_sc = ImageFont.truetype(os.path.join(FONTS, 'IMFeENsc28P.ttf'), int(20 * k))

    def ctext_runs(y, runs):
        """runs: [(text, font)], centred as one line."""
        widths = [d.textlength(s, font=f) for s, f in runs]
        x = (W - sum(widths)) / 2
        for (s, f), w in zip(runs, widths):
            d.text((x, y), s, font=f, fill=255)
            x += w
    # captions: *text* marks roman inside an italic caption (period plates set the Latin name in roman when the
    # caption is italic, and vice versa)
    def runs_of(s, base, alt):
        parts = s.split('*')
        return [(p, base if i % 2 == 0 else alt) for i, p in enumerate(parts) if p]
    ctext_runs(int(988 * k), runs_of(caption, f_it, ImageFont.truetype(os.path.join(FONTS, 'IMFeENrm28P.ttf'), int(27 * k))))
    ctext_runs(int(1026 * k), runs_of(subcap, f_rm, ImageFont.truetype(os.path.join(FONTS, 'IMFeENit28P.ttf'), int(21 * k))))
    d.text((x1 - 6 * k - d.textbbox((0, 0), HEADER, font=f_sc)[2], int(16 * k)), HEADER, font=f_sc, fill=255)
    d.text((x0 + 6 * k, int(16 * k)), HEADER_L, font=f_sc, fill=255)
    if extra:
        extra(d, k, dict(it=f_it, rm=f_rm, sc=f_sc))
    prn = np.asarray(img, F32) / 255.0
    prn = np.clip(prn * (0.85 + 0.3 * fbm(H, W, seed + 9, 3, 200)), 0, 1)
    return prn


def line_dist(p):
    """distance (0..0.5 periods) to the nearest line of a line screen with phase p"""
    return torch.abs(torch.remainder(p + 0.5, 1.0) - 0.5)


def screen(tone, d, aa):
    return torch.clamp((tone * 0.5 - d) / aa + 0.5, 0, 1)


class PlantLayer:
    """Engrave one plant (or one inset view of it) from its z-buffer, at buffer resolution (supersampled).

    cfg: light (unit vec), period (line period, buffer px), elements' colours via colour(el, b) -> (H, W, 3) wash
    transmittance, hatch(el, b, P) -> (phase_along, phase_across, lines_ok) tensors."""

    def __init__(self, el, view, cfg, seed=0, sel=None):
        self.el, self.view, self.cfg = el, view, cfg
        b = engine.rasterize(el, view, sel=sel, dens_px=cfg.get('dens_px', 2.2))
        self.b = b
        z, idb = b['z'], b['id']
        inside = idb >= 0
        self.inside = inside
        zmin = float(z[inside].min())
        ground = cfg.get('ground_z', zmin - 0.02 * view.S)
        self.ground = ground
        L = torch.tensor(cfg['light'], device=DEV, dtype=torch.float32)
        L = L / L.norm()
        nrm = engine.normals(z, idb, ground)
        self.nrm = nrm
        # local relief: the engraver models each bract / leaf / cone and plays down the curve of the whole head.
        # n_rel = the normal relative to the heavily smoothed surface, mixed with the true normal.
        relief = cfg.get('relief', 0.0)
        if relief > 0:
            zs = blur(torch.where(inside, z, torch.full_like(z, ground)), cfg.get('relief_sigma', 30) * view.S / 830)
            nb = engine.normals(zs, torch.zeros_like(idb), ground)
            nr = nrm - nb
            nr[2] += 1
            nr = nr / torch.linalg.vector_norm(nr, dim=0, keepdim=True)
            nrm_l = nrm * (1 - relief) + nr * relief
            nrm_l = nrm_l / torch.linalg.vector_norm(nrm_l, dim=0, keepdim=True)
        else:
            nrm_l = nrm
        lam = torch.clamp((nrm_l * L[:, None, None]).sum(0), 0, 1)
        sh = engine.cast_shadow(z, idb, L.tolist(), ground, steps=cfg.get('shadow_steps', 48),
                                step_px=cfg.get('shadow_step', 1.5) * view.S / 830)
        ao = engine.ambient(z, idb, ground, s1=4 * view.S / 830, s2=16 * view.S / 830)
        self.lam, self.sh, self.ao = lam, sh, ao
        lit = lam * (0.30 + 0.70 * sh) * (0.35 + 0.65 * ao)
        self.lit = lit
        self.anch, self.area = engine.anchors(b, el['N_el'])

    def engrave(self, P, ss, seed=0):
        """-> ink density (H, W) and wash transmittance (H, W, 3), both at buffer resolution."""
        el, cfg, b = self.el, self.cfg, self.b
        idb, inside = b['id'], self.inside
        H, W = idb.shape
        g = torch.Generator(device=DEV).manual_seed(seed)
        noise = blur(torch.rand((H, W), device=DEV, generator=g), 0.7 * ss) - 0.5
        lo = blur(torch.rand((H, W), device=DEV, generator=g), 30 * ss)
        lo = (lo - lo.mean()) / (lo.std() + 1e-6)
        tone_raw = 1 - self.lit
        tone = torch.clamp((tone_raw - cfg.get('tone_lo', 0.18)) / (cfg.get('tone_hi', 0.95) - cfg.get('tone_lo', 0.18)), 0, 1)
        tone = tone ** cfg.get('tone_gamma', 1.0)
        pa, pc, okl = cfg['hatch'](el, b, P, self.view.S)
        aa = 0.8 * ss / P
        h1 = screen(torch.clamp(tone * 1.05 + 0.05 * noise, 0, 1), line_dist(pa), aa) * okl
        h2 = screen(torch.clamp((tone - cfg.get('cross_at', 0.5)) * 1.7, 0, 1), line_dist(pc), aa) * okl
        # where the along-lines crowd together (toward a tip), let the cross hatch carry the tone instead
        crowd = cfg.get('crowd', None)
        if crowd is not None:
            cw = crowd(el, b, P)
            h1 = h1 * (1 - cw)
            h2 = torch.maximum(h2, screen(torch.clamp(tone * 0.95, 0, 1), line_dist(pc), aa) * cw * okl)
        hatch = torch.maximum(h1, h2) * inside
        rim_w = cfg.get('rim', 0.0) * ss
        if rim_w > 0:
            up = engine.upper_edges(idb, b['z'], min_step=cfg.get('rim_step', 3.0) * ss)
            up = torch.clamp(blur(up, rim_w * 0.6) * 3.0, 0, 1)
            hatch = hatch * (1 - 0.85 * up)
        # stipple in the darkest crevices
        st = (torch.rand((H, W), device=DEV, generator=g) < 0.05 * torch.clamp(tone - 0.6, 0, 1)) & inside
        st = blur(st.float(), 0.5 * ss) * 3
        # outlines: the lower side of every occluding edge, heavier where the step is high (the engraver's shadow
        # line), and the silhouette against the ground
        e, step = engine.edges(idb, b['z'])
        lw = cfg.get('line_w', 1.15) * ss
        heavy = torch.clamp(step / (cfg.get('step_ref', 12.0) * ss), 0, 1)
        grp = cfg.get('group', None)
        if grp is not None:
            # heavier line round each group (a first-order floret), lighter inside it
            gid = grp(el, b)
            eg, stepg = engine.edges(gid, b['z'])
            inner = cfg.get('inner_w', 0.6)
            w = lw * (inner * (0.6 + 0.6 * heavy)) * (1 - eg) + lw * (0.7 + 0.9 * heavy) * eg
            e = torch.maximum(e * cfg.get('inner_ink', 0.8), eg)
        else:
            w = lw * (0.55 + 0.9 * heavy)
        e = blur(e, 0.35 * ss)
        ed = torch.zeros_like(e)
        k = int(math.ceil(float(w.max())))
        for dy in range(-k, k + 1):
            for dx in range(-k, k + 1):
                r = math.hypot(dx, dy)
                if r > k:
                    continue
                sh_e = torch.roll(e, (dy, dx), (0, 1))
                sh_w = torch.roll(w, (dy, dx), (0, 1))
                ed = torch.maximum(ed, sh_e * torch.clamp((sh_w * 0.5 + 0.5 - r) / 1.0, 0, 1))
        sil = (~inside).float()
        sil_e = torch.clamp(blur(inside.float(), 0.8 * ss) * 2.5, 0, 1) * sil
        outline = torch.maximum(ed * inside, torch.clamp(sil_e * 1.2, 0, 1) * cfg.get('sil', 1.0))
        extra_ink = cfg.get('extra_ink', None)
        ink = torch.maximum(torch.maximum(hatch, outline), torch.clamp(st, 0, 1))
        if extra_ink is not None:
            ink = torch.maximum(ink, extra_ink(self, P, ss))
        ink = torch.clamp(ink * (0.92 + 0.16 * noise), 0, 1)
        # wash: per-element colour, bled a little past the line, uneven
        col = cfg['colour'](el, b, self)                     # (3, H, W) transmittance, 1 = none
        a = inside.float()
        a = blur(a, 1.2 * ss)
        col = torch.stack([blur(c, 1.0 * ss) for c in col], 0)
        strength = cfg.get('wash', 0.85) * (1 + 0.10 * lo) * (0.85 + 0.25 * tone)
        wash = 1 - torch.clamp(strength * a, 0, 1)[None] * (1 - col)
        self.tone = tone
        return ink, wash


def ground_layer(H, W, P, ss, tone_fn, seed=3):
    """frost's horizontal ruling with a fixed wobble, at buffer resolution, as ink density, given a tone field."""
    yy, xx = torch.meshgrid(torch.arange(H, device=DEV, dtype=torch.float32), torch.arange(W, device=DEV, dtype=torch.float32), indexing='ij')
    wob = torch.tensor((fbm(H, W, seed + 20, 3, 5) - 0.5) * 1.2, device=DEV)
    d = line_dist(yy / P + wob)
    return screen(tone_fn(xx, yy), d, 0.8 / P * ss)
