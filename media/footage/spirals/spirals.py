"""Build a plant's plate (static) and its arms, at a given output size.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY spirals.py artichoke --plate work/a.png             # the plate alone (no gold)
"""
import argparse
import json
import math
import os
import sys

import cv2
import numpy as np
import torch

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import engine  # noqa: E402
import plants  # noqa: E402
import plate as PL  # noqa: E402
import thread  # noqa: E402
from engine import DEV  # noqa: E402

F32 = np.float32


def per(el_arr, idb):
    t = torch.as_tensor(np.asarray(el_arr, np.float32), device=DEV)
    return t[idb.clamp(min=0).long()]


def smooth(a, b, x):
    t = torch.clamp((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------------------------------------ plant configs

def cfg_artichoke(S):
    el = plants.artichoke()

    def hatch(el, b, P, S):
        idb, s, t = b['id'], b['s'], b['t']
        Wpx = per(el['W'], idb) * S
        Lpx = per(el['L'], idb) * S
        nl = torch.clamp(torch.round(Wpx / (P * 1.05)), 3, 200)
        pa = (t + 1) * nl / 2                                   # lines along the bract, converging to the tip
        pc = s * Lpx / P * 0.95
        return pa, pc, torch.ones_like(s)

    def crowd(el, b, P):
        return smooth(0.82, 0.97, b['s'])

    green = torch.tensor([0.70, 0.77, 0.62], device=DEV)
    purple = torch.tensor([0.72, 0.60, 0.70], device=DEV)
    pale = torch.tensor([0.80, 0.84, 0.62], device=DEV)
    brown = torch.tensor([0.60, 0.46, 0.48], device=DEV)

    def colour(el, b, layer):
        idb, s = b['id'], b['s']
        rr = per(el['theta'], idb) / el['theta'].max()
        f_pur = smooth(0.70, 1.0, s) * smooth(0.35, 0.8, rr) * 0.75
        f_pale = 1 - smooth(0.10, 0.40, rr)
        c = green[:, None, None] * (1 - f_pur) + purple[:, None, None] * f_pur
        c = c * (1 - f_pale) + pale[:, None, None] * f_pale
        # the thickened tip of each outer bract, brownish purple (the photos in NOTES.md)
        f_tip = smooth(0.86, 0.97, s) * smooth(0.2, 0.6, rr) * 0.9
        c = c * (1 - f_tip) + brown[:, None, None] * f_tip
        return c

    cfg = dict(light=[-0.55, -0.62, 0.62], hatch=hatch, crowd=crowd, colour=colour, wash=0.75, tone_lo=0.40,
               tone_hi=0.95, cross_at=0.6, line_w=1.1, step_ref=10.0, sil=1.0, relief=0.85, relief_sigma=40, rim=2.2)
    return el, cfg


def cfg_romanesco(S):
    el = plants.romanesco()
    # the first-order floret each cone belongs to
    root = np.arange(el['N_el'])
    for _ in range(3):
        par = el['parent'][root]
        root = np.where(par >= 0, par, root)
    el['root'] = root

    def hatch(el, b, P, S):
        idb, s, psi = b['id'], b['s'], b['t']
        Lpx = per(el['Ls'], idb) * S
        al = per(el['alpha'], idb)
        circ = 2 * math.pi * Lpx * torch.sin(al)
        n = torch.clamp(torch.round(circ / (P * 1.1)), 3, 400)
        pa = psi / (2 * math.pi) * n                            # lines down the flank from the apex
        pc = s * Lpx / P * 0.9                                  # rings round the cone
        return pa, pc, torch.ones_like(s)

    def crowd(el, b, P):
        return 1 - smooth(0.12, 0.35, b['s'])                  # near an apex the radial lines would merge: ring it

    lime = torch.tensor([0.74, 0.86, 0.40], device=DEV)
    tipc = torch.tensor([0.88, 0.92, 0.58], device=DEV)
    deep = torch.tensor([0.52, 0.66, 0.34], device=DEV)

    def colour(el, b, layer):
        idb, s = b['id'], b['s']
        lvl = per(el['level'], idb)
        f_tip = (1 - smooth(0.05, 0.45, s)) * (lvl >= 1).float() * 0.7
        c = lime[:, None, None] * (1 - f_tip) + tipc[:, None, None] * f_tip
        f_deep = (lvl == 0).float() * 0.9
        return c * (1 - f_deep) + deep[:, None, None] * f_deep

    def group(el, b):
        return per(el['root'], b['id']).int() * (b['id'] >= 0) - (b['id'] < 0).int()

    def select(S_px):
        # third-level cones only where their parent is big enough to show them (all of them in the inset)
        lv, par, Ls = el['level'], el['parent'], el['Ls']
        big = np.ones(el['N_el'], bool)
        m3 = lv == 3
        big[m3] = Ls[par[m3]] * S_px * math.sin(el['alpha_fl']) * 2 > 34
        return np.where(big)[0]

    cfg = dict(light=[-0.55, -0.62, 0.62], hatch=hatch, crowd=crowd, colour=colour, wash=0.70, tone_lo=0.42,
               tone_hi=0.97, cross_at=0.6, line_w=1.0, step_ref=8.0, sil=1.0, relief=0.3, relief_sigma=70, rim=1.2,
               rim_step=2.0, group=group, inner_w=0.55, inner_ink=0.55, select=select)
    return el, cfg


def cfg_aloe(S):
    el = plants.aloe()

    def hatch(el, b, P, S):
        idb, s, t = b['id'], b['s'], b['t']
        Wpx = per(el['W'], idb) * S
        Lpx = per(el['rt'], idb) * S
        nl = torch.clamp(torch.round(Wpx / (P * 1.0)), 3, 300)
        pa = (t + 1) * nl / 2                                   # along the leaf, converging to the tip
        pc = s * Lpx / P * 0.9
        return pa, pc, torch.ones_like(s)

    def crowd(el, b, P):
        return smooth(0.80, 0.95, b['s'])

    leaf = torch.tensor([0.64, 0.75, 0.66], device=DEV)        # grey-green, a little glaucous
    young = torch.tensor([0.70, 0.82, 0.60], device=DEV)
    tipc = torch.tensor([0.50, 0.36, 0.36], device=DEV)        # the dark purplish-brown tip
    margin = torch.tensor([0.97, 0.97, 0.90], device=DEV)      # the cartilaginous white margin and its teeth

    def colour(el, b, layer):
        idb, s, t = b['id'], b['s'], b['t']
        age = per(el['n'], idb) / el['N_el']
        f_y = 1 - smooth(0.05, 0.35, age)
        c = leaf[:, None, None] * (1 - f_y) + young[:, None, None] * f_y
        f_tip = smooth(0.90, 0.97, s) * smooth(0.15, 0.4, age)
        c = c * (1 - f_tip) + tipc[:, None, None] * f_tip
        f_m = smooth(0.90, 0.99, torch.abs(t)) * (s > 0.05).float()
        return c * (1 - f_m) + margin[:, None, None] * f_m

    def extra_ink(layer, P, ss):
        return torch.zeros_like(layer.lit)

    cfg = dict(light=[-0.55, -0.62, 0.62], hatch=hatch, crowd=crowd, colour=colour, wash=0.72, tone_lo=0.36,
               tone_hi=0.97, cross_at=0.6, line_w=1.05, step_ref=10.0, sil=1.0, relief=0.45, relief_sigma=60, rim=1.8,
               rim_step=2.0)
    return el, cfg


CONFIGS = dict(artichoke=cfg_artichoke, romanesco=cfg_romanesco, aloe=cfg_aloe)
CAPTIONS = dict(
    artichoke=("Fig. 1.—Head of the globe artichoke, viewed from above: the bracts in spirals of 5 and 8.",
               "*Cynara cardunculus* var. *scolymus*, 'Green Globe'. Each family of spirals is counted in gold."),
    aloe=("Fig. 3.—Rosette of the spiral aloe, viewed from above: the leaves in five spiral ranks.",
          "*Aloe polyphylla*, about 150 leaves. Here the ranks wind anticlockwise outward; plants of either hand are found."),
    romanesco=("Fig. 2.—Head of the Romanesco cauliflower, viewed from above: the florets in spirals of 8 and 13.",
               "*Brassica oleracea*, Botrytis group. A floret, detached and enlarged, seen from its point: its florets again in spirals of 8 and 13."),
)


LAYOUTS = dict(
    artichoke=dict(radius=400),
    aloe=dict(radius=392),
    romanesco=dict(radius=338, centre=(500, 440),
                   inset=dict(centre=(1318, 440), r=318, fill=0.72, pick_r=0.56, pick_ang=0.0)),
)


class Plate:
    """The static plate of one plant: the main view of the plant and, for the romanesco, an enlarged inset of one
    floret. All coordinates of views are buffer px (pane space, supersampled ss x); to_out() gives output px."""

    def __init__(self, plant, W=1920, H=1080, ss=2):
        self.plant, self.W, self.H, self.ss = plant, W, H, ss
        k = W / 1920.0
        self.k = k
        lay = LAYOUTS[plant]
        self.lay = lay
        x0, y0, x1, y1 = [int(round(v * k)) for v in PL.PANE]
        self.pane = (x0, y0, x1, y1)
        pw, ph = (x1 - x0) * ss, (y1 - y0) * ss
        self.pw, self.ph = pw, ph
        S = lay['radius'] * k * ss
        c = lay.get('centre', ((x1 - x0) / k / 2, (y1 - y0) / k / 2))
        cx, cy = c[0] * k * ss, c[1] * k * ss
        el, cfg = CONFIGS[plant](S)
        self.el, self.cfg = el, cfg
        self.P = 3.3 * k * ss                                 # frost's line period
        view = engine.View(pw, ph, cx, cy, S)
        sel = cfg['select'](S) if 'select' in cfg else None
        self.views = dict(main=dict(view=view, el=el, sel=sel, layer=PL.PlantLayer(el, view, cfg, sel=sel)))
        self.view, self.layer, self.S = view, self.views['main']['layer'], S
        if 'inset' in lay:
            self._inset(lay['inset'])

    def _inset(self, ins):
        el, k, ss = self.el, self.k, self.ss
        lv = el['level']
        ap = el['apex']
        r = np.hypot(ap[:, 0], ap[:, 1])
        ang = np.arctan2(ap[:, 1], ap[:, 0])
        area = self.layer.area
        cand = np.where((lv == 1) & (np.abs(r - ins['pick_r']) < 0.08))[0]
        da = np.abs(np.angle(np.exp(1j * (ang[cand] - ins['pick_ang']))))
        cand = cand[np.argsort(da)][:4]
        fl = int(cand[np.argmax(area[cand])])
        self.floret = fl
        e2 = plants.detach(el, fl)
        sub = plants.subtree(el, fl)
        rad = 1.30 * el['Ls'][fl] * math.sin(el['alpha_fl'])          # plan radius of the floret with its florets
        S2 = ins['fill'] * ins['r'] * k * ss / rad
        cx2, cy2 = ins['centre'][0] * k * ss, ins['centre'][1] * k * ss
        A = e2['apex'][fl]
        view2 = engine.View(self.pw, self.ph, cx2 - S2 * A[0], cy2 - S2 * A[1], S2)
        self.views['inset'] = dict(view=view2, el=e2, sel=sub, layer=PL.PlantLayer(e2, view2, self.cfg, sel=sub),
                                   centre=(cx2, cy2), r=ins['r'] * k * ss)

    def build(self):
        ss, P = self.ss, self.P
        H, W = self.ph, self.pw
        yy, xx = torch.meshgrid(torch.arange(H, device=DEV, dtype=torch.float32),
                                torch.arange(W, device=DEV, dtype=torch.float32), indexing='ij')
        out_ink, out_wash = None, None
        for vk in ('main', 'inset'):
            if vk not in self.views:
                continue
            v = self.views[vk]
            lay, view = v['layer'], v['view']
            ink, wash = lay.engrave(P, ss)
            inside = lay.inside
            sh = lay.sh
            if vk == 'main':
                cx, cy, S = view.cx, view.cy, view.S
                rr = torch.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / S
                base = 0.30 + 0.10 * torch.clamp(rr - 1.0, 0, 1)
            else:
                cx, cy = v['centre']
                rr = torch.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / v['r']
                base = 0.20 + 0.08 * rr
            tone = torch.clamp(base + (0.45 if vk == 'main' else 0.30) * (1 - sh), 0, 1)
            gnd = PL.ground_layer(H, W, P, ss, lambda a, b: tone) * (~inside)
            ink = torch.maximum(ink, gnd)
            if vk == 'main':
                out_ink, out_wash = ink, wash
                main_inside = inside
            else:
                cx, cy = v['centre']
                R = v['r']
                d = torch.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
                m = (d < R).float()
                out_ink = out_ink * (1 - m) + ink * m
                out_wash = out_wash * (1 - m)[None] + wash * m[None]
                # the inset's frame: a double circle rule, cleared a little round it
                clear = ((d >= R) & (d < R + 9 * ss)).float()
                out_ink = out_ink * (1 - clear)
                ring = torch.clamp(1.0 * ss - torch.abs(d - R - 1.5 * ss) + 0.5, 0, 1)
                ring = torch.maximum(ring, torch.clamp(0.45 * ss - torch.abs(d - R - 5.5 * ss) + 0.5, 0, 1))
                # leader lines from the floret on the head to the inset, outside the head and the inset
                mv = self.views['main']['view']
                fl = self.floret
                fx, fy = mv.cx + mv.S * self.el['apex'][fl][0], mv.cy + mv.S * self.el['apex'][fl][1]
                fr = mv.S * self.el['Ls'][fl] * math.sin(self.el['alpha_fl']) * 1.2
                ux, uy = cx - fx, cy - fy
                L = math.hypot(ux, uy)
                ux, uy = ux / L, uy / L
                lead = torch.zeros_like(d)
                for sgn in (-1, 1):
                    ax, ay = fx - uy * fr * sgn, fy + ux * fr * sgn
                    bx, by = cx - uy * (R + 5.5 * ss) * sgn, cy + ux * (R + 5.5 * ss) * sgn
                    lead = torch.maximum(lead, _segment(xx, yy, ax, ay, bx, by, 0.45 * ss))
                lead = lead * (~main_inside).float() * (d > R + 5.5 * ss).float()
                self.lead_pts = (self.to_out([[fx, fy]])[0], self.to_out([[cx - ux * (R + 5.5 * ss), cy - uy * (R + 5.5 * ss)]])[0])
                out_ink = torch.maximum(out_ink, torch.maximum(ring, lead))
        ink = torch.nn.functional.avg_pool2d(out_ink[None, None], ss)[0, 0].cpu().numpy()
        wash = torch.nn.functional.avg_pool2d(out_wash[None], ss)[0].permute(1, 2, 0).cpu().numpy()
        cap, sub = CAPTIONS[self.plant]
        paper = PL.paper_sheet(self.W, self.H)
        prn = PL.print_layer(self.W, self.H, cap, sub)
        x0, y0, x1, y1 = self.pane
        dens = prn.copy()
        dens[y0:y1, x0:x1] = np.maximum(dens[y0:y1, x0:x1], ink)
        wfull = np.ones((self.H, self.W, 3), F32)
        wfull[y0:y1, x0:x1] = wash
        f = paper * wfull * (1 - dens[..., None] * (1 - PL.INK[None, None] / PL.PAPER[None, None]) * 0.97)
        self.img = np.clip(f, 0, 1).astype(F32)
        return self.img

    # ------------------------------------------------------------------------------------------ arms and checks
    def to_out(self, bxy):
        """buffer px (pane, supersampled) -> output px"""
        x0, y0 = self.pane[:2]
        bxy = np.asarray(bxy, np.float64)
        return np.stack([x0 + bxy[..., 0] / self.ss, y0 + bxy[..., 1] / self.ss], -1)

    def centre_out(self, vk='main'):
        v = self.views[vk]
        if vk == 'inset':
            return self.to_out([v['centre']])[0]
        return self.to_out([[v['view'].cx, v['view'].cy]])[0]

    def anchor_points(self, vk='main'):
        """One point per element on what is drawn: the projected apex (cones, always on top) or a fixed point on the
        exposed part of a bract or leaf, checked against the z-buffer (if hidden: the visible centroid). Output px,
        and the visible area in output px^2."""
        v = self.views[vk]
        el, lay, view = v['el'], v['layer'], v['view']
        area = lay.area / self.ss ** 2
        if el['kind'] == 'cone':
            ap = view.px(el['apex'][:, :2])
        elif 'anchor3d' in el:
            ap = view.px(el['anchor3d'][:, :2])
            idb = lay.b['id'].cpu().numpy()
            ix = np.clip(np.round(ap[:, 0]).astype(int), 0, idb.shape[1] - 1)
            iy = np.clip(np.round(ap[:, 1]).astype(int), 0, idb.shape[0] - 1)
            seen = idb[iy, ix] == np.arange(len(ap))
            ap = np.where(seen[:, None], ap, lay.anch)
        else:
            ap = lay.anch
        return self.to_out(ap), area

    def counted(self, vk='main'):
        """Which elements take part in the count in this view."""
        el = self.views[vk]['el']
        if el['kind'] == 'cone':
            if vk == 'inset':
                return (el['parent'] == self.floret) & (el['level'] == 2)
            return el['level'] == 1
        return np.ones(el['N_el'], bool)

    def index(self, vk='main'):
        el = self.views[vk]['el']
        return el['n'] if 'n' in el else el['k']

    def families(self, fams, vk='main', min_area=30.0, r_max=None):
        """For each family F, F arms; arm k = the counted, visible elements with index = k (mod F), centre outward.
        r_max (fraction of the view's radius): an arm ends at its first element beyond it (it has reached the rim)."""
        pts, area = self.anchor_points(vk)
        nidx = self.index(vk)
        ok = (area >= min_area) & self.counted(vk)
        idx = np.arange(len(nidx))
        c = self.centre_out(vk)
        rad = np.hypot(pts[:, 0] - c[0], pts[:, 1] - c[1])
        Rv = rad[ok].max()
        out = []
        for F in fams:
            arms = []
            for kk in range(F):
                chain = idx[ok & (nidx % F == kk)]
                chain = chain[np.argsort(nidx[chain])]
                if r_max is not None:
                    beyond = np.where(rad[chain] > r_max * Rv)[0]
                    if len(beyond):
                        chain = chain[:beyond[0] + 1]
                arms.append(dict(k=int(kk), elements=[int(i) for i in chain], anchors=pts[chain].round(2).tolist()))
            out.append(dict(F=int(F), arms=arms))
        return out

    def verify(self, fams, vk='main', min_area=30.0):
        """Independent check on the drawing: Delaunay neighbours among the visible anchors, histogram of their index
        differences. The contact parastichies show as the dominant differences."""
        from scipy.spatial import Delaunay
        pts, area = self.anchor_points(vk)
        nidx = self.index(vk)
        ok = (area >= min_area) & self.counted(vk)
        I = np.where(ok)[0]
        tri = Delaunay(pts[I])
        E = set()
        for s in tri.simplices:
            for a_, b_ in ((0, 1), (1, 2), (0, 2)):
                E.add(tuple(sorted((s[a_], s[b_]))))
        E = np.array(sorted(E))
        dl = np.linalg.norm(pts[I][E[:, 0]] - pts[I][E[:, 1]], axis=1)
        nn = np.full(len(I), np.inf)
        for (p_, q_), d in zip(E, dl):
            nn[p_] = min(nn[p_], d)
            nn[q_] = min(nn[q_], d)
        keep = dl <= 1.6 * np.minimum(nn[E[:, 0]], nn[E[:, 1]])
        dn = np.abs(nidx[I][E[keep, 0]] - nidx[I][E[keep, 1]])
        vals, cnt = np.unique(dn, return_counts=True)
        order = np.argsort(-cnt)
        hist = {int(vals[i]): int(cnt[i]) for i in order[:8]}
        frac = float(np.isin(dn, fams).sum() / max(1, len(dn)))
        cx, cy = self.centre_out(vk)
        hand = {}
        for F in fams:
            turns = []
            for kk in range(F):
                ch = I[(nidx[I] % F) == kk]
                ch = ch[np.argsort(nidx[ch])]
                if len(ch) < 3:
                    continue
                ang = np.unwrap(np.arctan2(pts[ch, 1] - cy, pts[ch, 0] - cx))
                turns.append(ang[-1] - ang[0])
            m = float(np.median(turns)) if turns else 0.0
            hand[int(F)] = dict(direction='clockwise' if m > 0 else 'anticlockwise', median_turn_deg=round(math.degrees(m), 1))
        return dict(view=vk, elements_checked=int(len(I)), neighbour_pairs=int(len(dn)),
                    index_difference_histogram=hist, fraction_in_families=round(frac, 3),
                    outward_winding_on_screen=hand)


def _segment(xx, yy, ax, ay, bx, by, w):
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    t = torch.clamp(((xx - ax) * dx + (yy - ay) * dy) / L2, 0, 1)
    d = torch.sqrt((xx - ax - t * dx) ** 2 + (yy - ay - t * dy) ** 2)
    return torch.clamp(w - d + 0.5, 0, 1)


# ------------------------------------------------------------------------------------------------ the count

def pass_times(n, t0, t1, first=2.2, gap=0.12):
    """n arms between t0 and t1; each arm takes a bit less time than the one before (the count gathers pace): the
    first is `first` times the last."""
    w = first ** (-np.arange(n) / max(1, n - 1))
    tot = t1 - t0 - gap * (n - 1)
    d = w / w.sum() * tot
    starts = t0 + np.concatenate([[0], np.cumsum(d[:-1] + gap)])
    return [(float(s), float(s + di)) for s, di in zip(starts, d)]


def arm_path(anchors, extend=0.18, smooth_px=0.0):
    """A smooth path through the anchors, extended past the last one along the arm. smooth_px > 0: the dense path is
    smoothed along its length (Gaussian, sigma in px), so the hand does not zigzag through every element; the
    deviation of each anchor from the path is reported in the data."""
    a = np.asarray(anchors, np.float64)
    if len(a) >= 2:
        d = a[-1] - a[-2]
        a = np.vstack([a, a[-1] + d * extend])
    p = thread.catmull(a, 0.5)
    if smooth_px > 0 and len(p) > 8:
        from scipy.ndimage import gaussian_filter1d
        sg = smooth_px / 0.5
        q = np.stack([gaussian_filter1d(p[:, 0], sg, mode='nearest'), gaussian_filter1d(p[:, 1], sg, mode='nearest')], 1)
        # keep the ends where they are
        w = np.clip(np.minimum(np.arange(len(p)), len(p) - 1 - np.arange(len(p))) / (2 * sg), 0, 1)[:, None]
        p = p * (1 - w) + q * w
    return p


def deviation(path, anchors):
    from scipy.spatial import cKDTree
    d, _ = cKDTree(path).query(np.asarray(anchors))
    return float(d.max()), float(d.mean())


def place_numeral(path, size, taken, frame_box, start=0.75, mask=None, centre=None):
    """Beyond the end of the path, along its last direction (bent outward from the centre if given); on bare
    ground if a plant mask is given; pushed further out if it would touch another numeral."""
    end = path[-1]
    d = path[-1] - path[-min(len(path), 30)]
    d = d / max(np.hypot(*d), 1e-6)
    if centre is not None:
        rdir = end - np.asarray(centre)
        rdir = rdir / max(np.hypot(*rdir), 1e-6)
        d = d * 0.5 + rdir * 0.5
        d = d / max(np.hypot(*d), 1e-6)

    def on_plant(box):
        if mask is None:
            return False
        H, W = mask.shape
        for x, y in ((box[0], box[1]), (box[2], box[1]), (box[0], box[3]), (box[2], box[3]),
                     ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)):
            xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
            if mask[yi, xi]:
                return True
        return False
    best = None
    for k in range(60):
        c = end + d * size * (start + 0.2 * k)
        box = (c[0] - size * 0.5, c[1] - size * 0.6, c[0] + size * 0.5, c[1] + size * 0.6)
        clash = any(not (box[2] < b[0] or box[0] > b[2] or box[3] < b[1] or box[1] > b[3]) for b in taken)
        inside = (box[0] > frame_box[0] and box[1] > frame_box[1] and box[2] < frame_box[2] and box[3] < frame_box[3])
        if not inside:
            break
        if not clash and best is None:
            best = (c, box)
        if not clash and not on_plant(box):
            taken.append(box)
            return c
    if best is None:
        best = (c, box)
    taken.append(best[1])
    return best[0]


CLIPS = dict(
    artichoke=dict(dur=17.0, passes=[dict(F=5, t=(1.5, 7.6)), dict(F=8, t=(8.6, 14.6))]),
    aloe=dict(dur=13.0, passes=[dict(F=5, t=(1.5, 9.5), first=1.8, r_max=0.92, smooth=14.0)]),
    romanesco=dict(dur=22.0, passes=[dict(F=8, t=(1.5, 6.6)), dict(F=13, t=(7.4, 12.6)),
                                     dict(F=8, view='inset', t=(14.4, 17.0), descend=(13.1, 14.2), num=26, line=2.8),
                                     dict(F=13, view='inset', t=(17.5, 20.3), num=26, line=2.8)]),
)
NUM_SIZE = 30.0          # numeral height, output px at 1080
LINE_W = 3.2             # gold line width, output px at 1080


class Clip:
    def __init__(self, plant, W=1920, H=1080, ss=2, timing=None):
        self.plant, self.W, self.H, self.ss = plant, W, H, ss
        self.spec = json.loads(json.dumps(CLIPS[plant]))
        if timing:                                              # an edit's own timing: {"arms": {"F:k": [t0, t1]}}
            self.override = json.load(open(timing))
        else:
            self.override = None
        self.plate = Plate(plant, W, H, ss)
        self.img = self.plate.build()
        self.dur = self.spec['dur']
        self._build_gold()

    def _build_gold(self):
        P, ss, k = self.plate, self.ss, self.W / 1920.0
        self.gold = thread.Gold(self.W, self.H, ss)
        # where the plant is (output px), dilated a little: numerals go on bare ground
        x0_, y0_ = P.pane[:2]
        pm = np.zeros((self.H, self.W), bool)
        for vk_ in P.views:
            ins = P.views[vk_]['layer'].inside.float()[None, None]
            ins = torch.nn.functional.max_pool2d(ins, ss)[0, 0].cpu().numpy() > 0
            pm[y0_:y0_ + ins.shape[0], x0_:x0_ + ins.shape[1]] |= ins
        self.plant_mask = cv2.dilate(pm.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
        x0, y0, x1, y1 = P.pane
        fb = (x0 + 6 * k, y0 + 6 * k, x1 - 6 * k, y1 - 6 * k)
        taken = []
        if 'inset' in P.views:                                  # keep numerals off the inset's frame
            c = P.centre_out('inset')
            r = P.views['inset']['r'] / ss
        data = dict(plant=self.plant, size=[self.W, self.H], fps=24, duration=self.dur,
                    coordinates='output px, origin top left, y down', passes=[], verify=[])
        n_pass = len(self.spec['passes'])
        for pi, ps in enumerate(self.spec['passes']):
            F, vk = ps['F'], ps.get('view', 'main')
            fam = P.families([F], vk, r_max=ps.get('r_max'))[0]
            arms = [a for a in fam['arms'] if len(a['anchors']) >= 2]
            cx, cy = P.centre_out(vk)
            # count order: from the arm that ends nearest 12 o'clock, going round clockwise
            ends = np.array([a['anchors'][-1] for a in arms])
            ang = np.arctan2(ends[:, 1] - cy, ends[:, 0] - cx)
            order = np.argsort(np.mod(ang + math.pi / 2, 2 * math.pi))
            times = pass_times(len(arms), *ps['t'], first=ps.get('first', 2.2))
            pass_end = ps['t'][1]
            nsize = ps.get('num', NUM_SIZE) * k
            lw = ps.get('line', LINE_W) * k
            if 'descend' in ps:                                  # the thread goes down into one floret
                a_, b_ = P.lead_pts
                d0, d1 = ps['descend']
                path = thread.resample(np.array([a_, b_, [cx, cy]]), 0.5)
                st = thread.Stroke(path * ss, lw * 0.8 * ss, self.W * ss, self.H * ss, seed=4242, wobble=0.3)
                self.gold.add([st], d0, d1, lambda t, pe=pass_end: 1.0 if t < pe + 0.3 else 0.75)
                data['descent'] = dict(path=path[::8].round(1).tolist(), t_start=d0, t_end=d1)
            pd = dict(family=F, view=vk, arms=[])
            for j, ai in enumerate(order):
                arm = arms[ai]
                t0, t1 = times[j]
                key = f'{vk}:{F}:{arm["k"]}'
                if self.override and key in self.override.get('arms', {}):
                    t0, t1 = self.override['arms'][key]
                path = arm_path(arm['anchors'], smooth_px=ps.get('smooth', 0.0) * k)
                dev = deviation(path, arm['anchors'])
                st = thread.Stroke(path * ss, lw * ss, self.W * ss, self.H * ss, seed=1000 * F + arm['k'] + 97 * pi)

                def line_alpha(t, pe=pass_end):
                    return 1.0 if t < pe + 0.3 else 1 - 0.30 * min(1.0, (t - pe - 0.3) / 0.8)
                self.gold.add([st], t0, t1, line_alpha)
                num = str(j + 1)
                c = place_numeral(path, nsize, taken, fb, mask=self.plant_mask, centre=(cx, cy))
                strokes = thread.glyph_strokes(num, c[0] * ss, c[1] * ss, nsize * ss, 2.7 * k * ss,
                                               self.W * ss, self.H * ss, seed=77 + 100 * F + j + 1000 * pi)
                is_total = (j == len(arms) - 1)

                def num_alpha(t, pe=pass_end, tot=is_total):
                    if tot or t < pe + 0.3:
                        return 1.0
                    return 1 - 0.40 * min(1.0, (t - pe - 0.3) / 0.8)
                tn0 = t1 - 0.04
                self.gold.add(strokes, tn0, tn0 + 0.20 + 0.12 * len(num), num_alpha, ease=False)
                pd['arms'].append(dict(count=j + 1, arm=arm['k'], elements=arm['elements'],
                                       anchors=arm['anchors'], path=path[::8].round(1).tolist(),
                                       numeral=num, numeral_at=[round(float(c[0]), 1), round(float(c[1]), 1)],
                                       t_start=round(t0, 3), t_end=round(t1, 3),
                                       anchor_deviation_px=dict(max=round(dev[0], 2), mean=round(dev[1], 2))))
            pd['total'] = len(arms)
            pd['winding'] = P.verify([F], vk)['outward_winding_on_screen'][F]['direction']
            data['passes'].append(pd)
        for vk in P.views:
            fams = [p_['F'] for p_ in self.spec['passes'] if p_.get('view', 'main') == vk]
            data['verify'].append(P.verify(fams, vk))
        self.data = data

    def frame(self, t):
        col, a = self.gold.render(t)
        f = self.img * (1 - a[..., None]) + col * a[..., None]
        return f, col, a


def save(img, path):
    if path.endswith('16.png'):
        cv2.imwrite(path, (np.clip(img, 0, 1)[..., ::-1] * 65535 + 0.5).astype(np.uint16))
    else:
        cv2.imwrite(path, (np.clip(img, 0, 1)[..., ::-1] * 255 + 0.5).astype(np.uint8))


_C = None


def _frame_bytes(i):
    t = i / 24.0
    f, col, a = _C.frame(t)
    m = (np.clip(f, 0, 1) * 65535 + 0.5).astype('<u2').tobytes()
    rgba = np.concatenate([col * (a[..., None] > 0), a[..., None]], -1)
    al = (np.clip(rgba, 0, 1) * 65535 + 0.5).astype('<u2').tobytes()
    return m, al


def render_movies(clip, outdir, jobs=8, fps=24):
    import subprocess
    from multiprocessing import get_context
    global _C
    _C = clip
    W, H = clip.W, clip.H
    n = int(round(clip.dur * fps))
    name = clip.plant
    vid = ['-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709']
    master = os.path.join(outdir, f'{name}_spirals_master_prores422hq.mov')
    alpha = os.path.join(outdir, f'{name}_spirals_gold_alpha_prores4444.mov')
    ffm = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb48le', '-s', f'{W}x{H}',
                            '-r', str(fps), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '3', '-vendor', 'apl0',
                            '-pix_fmt', 'yuv422p10le', *vid, master], stdin=subprocess.PIPE)
    ffa = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba64le', '-s', f'{W}x{H}',
                            '-r', str(fps), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '4444', '-vendor', 'apl0',
                            '-pix_fmt', 'yuva444p10le', '-alpha_bits', '16', *vid, alpha], stdin=subprocess.PIPE)
    with get_context('fork').Pool(jobs) as pool:
        for k, (m, al) in enumerate(pool.imap(_frame_bytes, range(n), chunksize=2)):
            ffm.stdin.write(m)
            ffa.stdin.write(al)
            if k % 96 == 0:
                print(f'{name} {k}/{n}', flush=True)
    for ff in (ffm, ffa):
        ff.stdin.close()
        ff.wait()
    prev = os.path.join(outdir, f'{name}_spirals_preview.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', master, '-c:v', 'libx264', '-crf', '18', '-preset', 'slow',
                    '-pix_fmt', 'yuv420p', '-tune', 'grain', '-movflags', '+faststart', prev], check=True)
    return master, alpha, prev


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('plant')
    ap.add_argument('--plate', default=None, help='write the plate alone (no gold)')
    ap.add_argument('--at', type=float, nargs='*', help='stills at these times (s)')
    ap.add_argument('--out', default='work/still.png')
    ap.add_argument('--movies', default=None, help='directory: master, alpha layer, preview')
    ap.add_argument('--data', default=None, help='write the arms JSON here')
    ap.add_argument('--timing', default=None)
    ap.add_argument('--size', default='1920x1080')
    ap.add_argument('--jobs', type=int, default=8)
    args = ap.parse_args()
    W, H = map(int, args.size.split('x'))
    if args.plate and not (args.at or args.movies or args.data):
        save(Plate(args.plant, W, H).build(), args.plate)
        return
    c = Clip(args.plant, W, H, timing=args.timing)
    if args.plate:
        save(c.img, args.plate)
    if args.data:
        json.dump(c.data, open(args.data, 'w'), indent=1)
        print(json.dumps(c.data['verify']))
        print([(p_['family'], p_['view'], p_['total'], p_['winding']) for p_ in c.data['passes']])
    for t in args.at or []:
        f, _, _ = c.frame(t)
        out = args.out.replace('.png', f'_t{t:05.2f}.png') if len(args.at) > 1 else args.out
        save(f, out)
        print(out)
    if args.movies:
        os.makedirs(args.movies, exist_ok=True)
        print(render_movies(c, args.movies, jobs=args.jobs))


if __name__ == '__main__':
    main()
