"""Build the plate's geometry and growth schedule from the SWC reconstructions: state/neuron.npz.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY -I build.py                 # writes state/neuron.npz (all times are clip fractions u = 0..1)

SWC files are untrusted downloads: parsed here with a strict float/int reader, nothing else is executed or evaluated.
All coordinates in the state are sheet px of the 1920x1080 plate (the same sheet as frost's PLATE XIV).
"""
import argparse
import math
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
F32 = np.float32

PANE = (80, 58, 1840, 938)
PIA_Y = 118.0            # tissue edge (pia) at the top of the section, sheet px
PCL_Y = 812.0            # Purkinje-cell layer (soma centres)
GRL_Y = 842.0            # top of the granular layer

MAIN = dict(swc='swc/Human_PC.CNG.swc', soma=(1045.0, PCL_Y), top=150.0, rot_extra=12.0, flip=False)
NEIGH = [dict(swc='swc/v_e_purk1.CNG.swc', soma=(290.0, PCL_Y + 6), top=190.0, rot_extra=4.0, flip=True,
              u0=0.20, u1=0.97),
         dict(swc='swc/v_e_purk3.CNG.swc', soma=(1608.0, PCL_Y + 2), top=205.0, rot_extra=-6.0, flip=False,
              u0=0.28, u1=1.10)]


# ------------------------------------------------------------------------------------------------ SWC
def read_swc(path):
    """strict SWC reader: 7 numeric columns per non-comment line"""
    ids, typ, xyz, rad, par = [], [], [], [], []
    with open(path, 'r', errors='replace') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            a = s.split()
            if len(a) < 7:
                continue
            ids.append(int(a[0])); typ.append(int(a[1]))
            xyz.append((float(a[2]), float(a[3]), float(a[4]))); rad.append(float(a[5])); par.append(int(a[6]))
    ids = np.array(ids); idx = {v: k for k, v in enumerate(ids)}
    parent = np.array([idx.get(p, -1) for p in par])
    return np.array(typ), np.array(xyz, float), np.array(rad, float), parent


class Tree:
    """resampled dendritic tree in sheet px. node 0 is the root (soma centre)."""

    def __init__(self, path, soma_xy, top, rot_extra, flip, ds_um=1.6, seed=0):
        typ, xyz, rad, par = read_swc(os.path.join(HERE, path))
        rng = np.random.default_rng(seed)
        is_soma = typ == 1
        root = int(np.where(par < 0)[0][0])
        soma_c = xyz[is_soma].mean(0) if is_soma.any() else xyz[root]
        self.soma_r_um = float(rad[is_soma].max()) if is_soma.any() else 9.0
        children = [[] for _ in range(len(typ))]
        for i, p in enumerate(par):
            if p >= 0:
                children[p].append(i)
        # orient: 'up' toward the centroid of the most distal 15% of points (the arbor's crown)
        d = xyz[:, :2] - soma_c[:2]
        rr = np.hypot(d[:, 0], d[:, 1])
        crown = d[rr > np.percentile(rr, 85)].mean(0)
        ang = math.atan2(crown[1], crown[0])
        rot = math.pi / 2 - ang + math.radians(rot_extra)
        c, s = math.cos(rot), math.sin(rot)
        q = d @ np.array([[c, -s], [s, c]]).T          # q[:,1] is up (um)
        if flip:
            q[:, 0] *= -1
        dend = ~is_soma
        up_max = q[dend, 1].max()
        self.scale = (soma_xy[1] - top) / up_max       # sheet px per um
        P = np.stack([soma_xy[0] + q[:, 0] * self.scale, soma_xy[1] - q[:, 1] * self.scale], 1)
        R = rad * self.scale
        Z = xyz[:, 2] - soma_c[2]
        # sections: walk from stems; resample each section at ds
        stems = [i for i in range(len(typ)) if dend[i] and (par[i] < 0 or is_soma[par[i]])]
        nodes_xy, nodes_r, nodes_z, nodes_par = [np.array(soma_xy, float)], [self.soma_r_um * self.scale], [0.0], [-1]
        ds = ds_um * self.scale
        stack = [(st, 0) for st in stems]   # (first point of section, parent new-node index)
        while stack:
            st, pnew = stack.pop()
            chain = [st]
            while len(children[chain[-1]]) == 1:
                chain.append(children[chain[-1]][0])
            pts = P[chain]; rs = R[chain]; zs = Z[chain]
            if pnew == 0:      # stem: start from the soma edge
                start = nodes_xy[0]
            else:
                start = nodes_xy[pnew]
            pts = np.vstack([start, pts]); rs = np.concatenate([[rs[0]], rs]); zs = np.concatenate([[zs[0]], zs])
            seg = np.hypot(*(pts[1:] - pts[:-1]).T)
            cum = np.concatenate([[0], np.cumsum(seg)])
            L = cum[-1]
            n = max(1, int(round(L / ds)))
            sv = np.linspace(0, L, n + 1)[1:]
            # radius: smooth along the section (the reconstruction's radii are noisy)
            k = int(np.clip(3 * ds / max(1e-3, seg.mean()), 1, 25))
            rs_s = np.convolve(np.pad(rs, k, mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), mode='same')[k:-k]
            xs = np.interp(sv, cum, pts[:, 0]); ys = np.interp(sv, cum, pts[:, 1])
            rr_ = np.interp(sv, cum, rs_s); zz = np.interp(sv, cum, zs)
            prev = pnew
            for j in range(n):
                nodes_xy.append(np.array([xs[j], ys[j]])); nodes_r.append(rr_[j]); nodes_z.append(zz[j])
                nodes_par.append(prev); prev = len(nodes_xy) - 1
            for ch in children[chain[-1]]:
                stack.append((ch, prev))
        self.xy = np.array(nodes_xy); self.r = np.array(nodes_r); self.z = np.array(nodes_z)
        self.par = np.array(nodes_par)
        self.n = len(self.par)
        self.kids = [[] for _ in range(self.n)]
        for i in range(1, self.n):
            self.kids[self.par[i]].append(i)
        self.seglen = np.zeros(self.n)
        self.seglen[1:] = np.hypot(*(self.xy[1:] - self.xy[self.par[1:]]).T)
        # subtree length (nodes are in DFS creation order: parents before children)
        sub = self.seglen.copy()
        for i in range(self.n - 1, 0, -1):
            sub[self.par[i]] += sub[i]
        self.sub = sub
        # path distance
        pd = np.zeros(self.n)
        for i in range(1, self.n):
            pd[i] = pd[self.par[i]] + self.seglen[i]
        self.pd = pd
        print(f'{path}: {self.n} nodes, scale {self.scale:.3f} px/um, total {sub[0] / self.scale / 1000:.1f} mm, '
              f'x {self.xy[:, 0].min():.0f}..{self.xy[:, 0].max():.0f} y {self.xy[:, 1].min():.0f}..{self.xy[:, 1].max():.0f}')

    def growth_times(self, rng, delay_um=55.0, v_sd=0.3, stem_stagger_um=40.0):
        """model time (in um of growth at unit speed) at which each node is reached.
        At every branch point the larger subtree continues at once; the others sprout after a random delay,
        so side branches appear behind the advancing growth cones."""
        T = np.zeros(self.n)
        speed = np.ones(self.n)
        delay = np.zeros(self.n)
        for i in range(1, self.n):
            p = self.par[i]
            sib = self.kids[p]
            if len(sib) > 1 or p == 0:                    # first node of a section: new speed and maybe a delay
                v = math.exp(rng.normal(0, v_sd))
                if p == 0:
                    order = sorted(sib, key=lambda j: -self.sub[j])
                    dl = order.index(i) * stem_stagger_um * (0.6 + 0.8 * rng.random())
                else:
                    main = max(sib, key=lambda j: self.sub[j])
                    dl = 0.0 if i == main else rng.exponential(delay_um) + 6.0
                speed[i] = v
                delay[i] = dl
            else:
                speed[i] = speed[p]
            T[i] = T[p] + delay[i] + self.seglen[i] / self.scale / speed[i]
        return T


def pace(t0m, t1m, length, u_start, u_end, shape=1.35, slope_end=0.25):
    """map model time to clip fraction u so that the grown length follows an eased curve"""
    Tg = np.linspace(0, max(t1m.max(), 1e-6), 3000)
    grown = np.zeros_like(Tg)
    dur = np.maximum(t1m - t0m, 1e-9)
    for a in range(0, len(Tg), 250):
        tt = Tg[a:a + 250, None]
        fr = np.clip((tt - t0m[None]) / dur[None], 0, 1)
        grown[a:a + 250] = (fr * length[None]).sum(1)
    grown /= grown[-1]
    uu = np.linspace(0, 1, 4001)
    w = np.clip((uu - u_start) / (u_end - u_start), 0, 1)
    # slow start, steady middle, easing (but not stopping) toward the end
    target = (1 - slope_end) * (0.5 * w * w * (3 - 2 * w) + 0.5 * w ** shape) + slope_end * w
    target = np.clip(np.maximum.accumulate(target), 0, 1)
    # invert: grown(T) = target(u)  ->  T(u); then u(T) by monotone interpolation
    grown_m = np.maximum.accumulate(grown + np.linspace(0, 1e-9, len(grown)))
    Tu = np.interp(target, grown_m, Tg)
    def u_of(t):
        return np.interp(t, Tu + np.linspace(0, 1e-9, len(Tu)), uu)
    return u_of


# ------------------------------------------------------------------------------------------------ procedural parts
def wiggle_path(rng, p0, direction, length, step=3.0, bend=0.18, pull=None, pull_w=0.0):
    """a gently wandering polyline (sheet px)"""
    pts = [np.array(p0, float)]
    a = direction
    n = max(2, int(length / step))
    for _ in range(n):
        a += rng.normal(0, bend)
        if pull is not None:
            a = a + pull_w * math.atan2(math.sin(pull - a), math.cos(pull - a))
        pts.append(pts[-1] + step * np.array([math.cos(a), math.sin(a)]))
    return np.array(pts)


def smooth_path(rng, ctrl, step=3.0, jitter=1.0):
    """Catmull-Rom through control points, resampled at step, with a little hand wobble"""
    P = np.vstack([ctrl[0], ctrl, ctrl[-1]]).astype(float)
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        n = max(2, int(np.hypot(*(p2 - p1)) / step))
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-2])
    out = np.array(out)
    wob = np.cumsum(rng.normal(0, jitter * 0.3, out.shape), 0)
    wob -= np.linspace(0, 1, len(out))[:, None] * wob[-1]
    out[1:-1] += np.clip(wob[1:-1], -jitter * 3, jitter * 3)
    return out


def polyline_segments(pts, r0, r1, u0, u1, kind, layer, z=0.0):
    """segments along a polyline growing from pts[0] (at u0) to pts[-1] (at u1), radius r0 -> r1"""
    seg = np.hypot(*(pts[1:] - pts[:-1]).T)
    cum = np.concatenate([[0], np.cumsum(seg)])
    f = cum / max(cum[-1], 1e-9)
    out = []
    for j in range(len(pts) - 1):
        r = r0 + (r1 - r0) * 0.5 * (f[j] + f[j + 1])
        out.append((pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1], r, u0 + (u1 - u0) * f[j],
                    u0 + (u1 - u0) * f[j + 1], kind, layer, j == len(pts) - 2, z))
    return out


def soma_outline(cx, cy, rx, ry, neck_dirs, neck_w, n=180):
    """a flask-shaped cell body: an ellipse pulled out into necks toward the primary dendrites"""
    th = np.linspace(0, 2 * np.pi, n, endpoint=False)
    rad = np.ones(n)
    for (a, w) in neck_dirs:
        dd = np.angle(np.exp(1j * (th - a)))
        rad += w * np.exp(-(dd / 0.42) ** 2)
    x = cx + rx * rad * np.cos(th)
    y = cy + ry * rad * np.sin(th)
    return np.stack([x, y], 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'state', 'neuron.npz'))
    ap.add_argument('--seed', type=int, default=7)
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed)
    S = []              # segments: x0 y0 x1 y1 r u0 u1 kind layer is_tip z
    # kinds: 0 dendrite, 1 axon, 2 transient process, 3 granule cell, 4 stellate cell, 5 neighbour dendrite
    tip_retract = []    # (seg index range, u_retract0, u_retract1) for transient processes

    # ---------------- main cell
    m = Tree(MAIN['swc'], MAIN['soma'], MAIN['top'], MAIN['rot_extra'], MAIN['flip'], seed=1)
    Tm = m.growth_times(rng)
    t0m = Tm[m.par[1:]]; t1m = Tm[1:]
    u_of = pace(t0m, t1m, m.seglen[1:], u_start=0.115, u_end=0.93)
    u_node = u_of(Tm); u_node[0] = 0.115 - 0.004
    is_tip_node = np.array([len(k) == 0 for k in m.kids])
    main_seg0 = len(S)
    for i in range(1, m.n):
        p = m.par[i]
        S.append((m.xy[p, 0], m.xy[p, 1], m.xy[i, 0], m.xy[i, 1], m.r[i], u_node[p], u_node[i], 0, 0,
                  bool(is_tip_node[i]), m.z[i]))
    main_seg1 = len(S)
    sc = m.scale
    print('main cell: grown 50%% at u=%.3f, 90%% at u=%.3f' % (
        np.interp(0.5, np.cumsum(np.sort(u_node[1:]) * 0 + m.seglen[1:][np.argsort(u_node[1:])]) / m.sub[0],
                  np.sort(u_node[1:])),
        np.interp(0.9, np.cumsum(m.seglen[1:][np.argsort(u_node[1:])]) / m.sub[0], np.sort(u_node[1:]))))

    # spines on the spiny branchlets (thin, distal), and varicosities
    spines = []   # bx by tx ty head_r u_appear layer
    beads = []    # seg_index, frac along, size factor, layer
    thin = m.r[1:] < 0.62 * sc
    for k in range(main_seg0, main_seg1):
        x0, y0, x1, y1, r, u0, u1 = S[k][:7]
        L = math.hypot(x1 - x0, y1 - y0)
        i = k - main_seg0 + 1
        if m.r[i] < 0.62 * sc and m.pd[i] > 25 * sc:
            nsp = rng.poisson(L / sc * 0.55)
            for _ in range(nsp):
                f = rng.random()
                bx, by = x0 + (x1 - x0) * f, y0 + (y1 - y0) * f
                dx, dy = (x1 - x0) / max(L, 1e-6), (y1 - y0) / max(L, 1e-6)
                side = 1 if rng.random() < 0.5 else -1
                a = math.atan2(dy, dx) + side * (math.pi / 2 + rng.normal(0, 0.45))
                ln = (1.1 + rng.gamma(2.0, 0.45)) * sc
                spines.append((bx, by, bx + ln * math.cos(a), by + ln * math.sin(a), (0.35 + 0.25 * rng.random()) * sc,
                               u1 + 0.05 + rng.gamma(2.0, 0.045), 0))
        if m.r[i] < 0.9 * sc and rng.random() < L / (5.5 * sc):
            beads.append((k, rng.random(), 1.5 + 0.6 * rng.random(), 0))

    # ---------------- soma of the main cell (flask shape, necks toward the stems)
    cx, cy = MAIN['soma']
    stems = m.kids[0]
    neck = []
    for st in stems:
        d = m.xy[min(st + 6, m.n - 1)] - m.xy[0]
        neck.append((math.atan2(d[1], d[0]), 0.55 * (m.sub[st] / max(m.sub[s] for s in stems)) ** 0.5))
    rx = m.soma_r_um * sc * 1.05
    soma_poly = soma_outline(cx, cy + 2, rx, rx * 1.12, neck, 0.5)

    # ---------------- axon (schematic: the reconstruction has none). Leaves the base of the soma, descends
    # through the granular layer; a recurrent collateral turns back up to the Purkinje-cell layer.
    ax0 = (cx + 3, cy + rx * 1.1)
    ax = wiggle_path(rng, ax0, math.pi / 2 + 0.05, 190, step=3.0, bend=0.06, pull=math.pi / 2 + 0.12, pull_w=0.08)
    seg_ax = polyline_segments(ax, 0.9 * sc, 0.7 * sc, 0.055, 0.30, 1, 0)
    S += seg_ax
    jc = int(len(ax) * 0.30)
    # recurrent collateral: turns back up to the Purkinje-cell layer and runs along it (through control points)
    ctrl = np.array([ax[jc], ax[jc] + (-14, 8), ax[jc] + (-46, -10), (cx - 110, cy + 22), (cx - 220, cy + 8),
                     (cx - 330, cy + 16), (cx - 430, cy + 4)])
    colp = smooth_path(rng, ctrl, step=3.0, jitter=1.2)
    S += polyline_segments(colp, 0.55 * sc, 0.38 * sc, 0.34, 0.58, 1, 0)
    # a few terminal twigs of the collateral among neighbouring cell bodies
    for jj in (int(len(colp) * 0.65), int(len(colp) * 0.85), len(colp) - 1):
        tw = wiggle_path(rng, colp[jj], -math.pi / 2 + rng.normal(0, 0.6), 18 + 14 * rng.random(), step=2.0, bend=0.3)
        S += polyline_segments(tw, 0.35 * sc, 0.3 * sc, 0.55 + 0.05 * rng.random(), 0.66, 1, 0)
    label_pts = {'a': ax[int(len(ax) * 0.40)] + np.array([16, 4]),
                 'b': colp[int(len(colp) * 0.62)] + np.array([0, 18])}

    # ---------------- transient perisomatic processes (the young cell's 'stellate' stage), later withdrawn
    for j in range(7):
        a = rng.uniform(0, 2 * np.pi)
        if -2.3 < a - 2 * np.pi < -0.8 or -2.3 < a < -0.8:      # mostly not straight up
            a += 1.6
        p0 = (cx + rx * 0.95 * math.cos(a), cy + rx * 1.05 * math.sin(a))
        pts = wiggle_path(rng, p0, a, rng.uniform(40, 80), step=2.5, bend=0.22)
        g0 = 0.022 + 0.03 * rng.random(); g1 = g0 + 0.04 + 0.02 * rng.random()
        r0_ = 0.105 + 0.03 * rng.random()          # withdrawal starts as the main dendrite takes over
        i0 = len(S)
        S += polyline_segments(pts, 0.9 * sc, 0.4 * sc, g0, g1, 2, 0)
        tip_retract.append((i0, len(S), r0_, r0_ + 0.05 + 0.02 * rng.random()))

    # ---------------- neighbouring Purkinje cells (pale), same growth rule, later and slower
    neigh_somata = []
    for nb in NEIGH:
        t = Tree(nb['swc'], nb['soma'], nb['top'], nb['rot_extra'], nb['flip'], seed=2)
        T = t.growth_times(rng, delay_um=45.0)
        uo = pace(T[t.par[1:]], T[1:], t.seglen[1:], nb['u0'], nb['u1'])
        un = uo(T); un[0] = nb['u0'] - 0.004
        for i in range(1, t.n):
            p = t.par[i]
            S.append((t.xy[p, 0], t.xy[p, 1], t.xy[i, 0], t.xy[i, 1], t.r[i] * 0.5, un[p], un[i], 5, 1,
                      len(t.kids[i]) == 0, t.z[i]))
            if t.r[i] < 0.5 * t.scale and rng.random() < 0.5:
                L = t.seglen[i]
                for _ in range(rng.poisson(L / t.scale * 0.3)):
                    x0, y0 = t.xy[p]; x1, y1 = t.xy[i]
                    f = rng.random(); bx, by = x0 + (x1 - x0) * f, y0 + (y1 - y0) * f
                    a = math.atan2(y1 - y0, x1 - x0) + (1 if rng.random() < .5 else -1) * (math.pi / 2 + rng.normal(0, .5))
                    ln = (1.0 + rng.gamma(2, .4)) * t.scale
                    spines.append((bx, by, bx + ln * math.cos(a), by + ln * math.sin(a), 0.3 * t.scale,
                                   un[i] + 0.06 + rng.gamma(2, 0.05), 1))
        nx, ny = nb['soma']
        st = t.kids[0]
        d = t.xy[min(st[0] + 5, t.n - 1)] - t.xy[0]
        neigh_somata.append((soma_outline(nx, ny + 2, 13.0, 15.0, [(math.atan2(d[1], d[0]), 0.5)], 0.5),
                             nb['u0'] - 0.06, nb['u0'] + 0.02))
    label_pts['d'] = np.array([NEIGH[0]['soma'][0] + 34, NEIGH[0]['soma'][1] - 26])

    # ---------------- granule cells: small bodies with short clawed dendrites; ascending axon into the
    # molecular layer (its parallel fibre runs out of the plane of section, so it ends abruptly)
    gran = []
    x0p, y0p, x1p, y1p = PANE
    gpos = []
    tries = 0
    while len(gpos) < 34 and tries < 5000:
        tries += 1
        gx = rng.uniform(x0p + 30, x1p - 30); gy = rng.uniform(GRL_Y + 22, y1p - 14)
        if abs(gx - cx) < 26 and gy < cy + 90:
            continue
        if all(math.hypot(gx - a, gy - b) > 46 for a, b in gpos):
            gpos.append((gx, gy))
    for gx, gy in gpos:
        ug = rng.uniform(0.10, 0.62)
        gran.append((gx, gy, rng.uniform(2.6, 3.4), ug))
        for _ in range(rng.integers(3, 5)):
            a = rng.uniform(0, 2 * np.pi)
            ln = rng.uniform(9, 17)
            pts = wiggle_path(rng, (gx + 3 * math.cos(a), gy + 3 * math.sin(a)), a, ln, step=2.0, bend=0.25)
            S += polyline_segments(pts, 0.55, 0.45, ug, ug + 0.025, 3, 0)
            # claw: three tiny divergent twigs
            e = pts[-1]; ea = math.atan2(*(pts[-1] - pts[-2])[::-1])
            for cl in (-0.9, 0.0, 0.9):
                q2 = e + 2.6 * np.array([math.cos(ea + cl), math.sin(ea + cl)])
                S += polyline_segments(np.array([e, q2]), 0.45, 0.4, ug + 0.025, ug + 0.03, 3, 0)
        if rng.random() < 0.22:
            top = rng.uniform(PCL_Y - 330, PCL_Y - 60)
            pts = wiggle_path(rng, (gx, gy - 3), -math.pi / 2 + rng.normal(0, 0.2), gy - top, step=3.0, bend=0.12,
                              pull=-math.pi / 2, pull_w=0.12)
            S += polyline_segments(pts, 0.42, 0.42, ug + 0.02, ug + 0.10, 3, 1)
    label_pts['c'] = np.array(gpos[int(np.argmin([abs(g[0] - 1450) + abs(g[1] - 905) for g in gpos]))]) + np.array([24, -2])

    # ---------------- stellate cells of the molecular layer (pale)
    stell = []
    spos = []
    while len(spos) < 9:
        sx = rng.uniform(x0p + 40, x1p - 40); sy = rng.uniform(PIA_Y + 50, PCL_Y - 160)
        if abs(sx - cx) < 380:
            continue
        if all(math.hypot(sx - a, sy - b) > 160 for a, b in spos):
            spos.append((sx, sy))
    for sx, sy in spos:
        us = rng.uniform(0.35, 0.78)
        stell.append((sx, sy, rng.uniform(3.8, 5.0), us))
        for _ in range(rng.integers(3, 6)):
            a = rng.uniform(0, 2 * np.pi)
            pts = wiggle_path(rng, (sx, sy), a, rng.uniform(20, 55), step=3, bend=0.22)
            S += polyline_segments(pts, 0.8, 0.45, us, us + 0.06, 4, 1)
        pts = wiggle_path(rng, (sx, sy), rng.choice([0, math.pi]) + rng.normal(0, .2), rng.uniform(70, 150),
                          step=3, bend=0.06)
        S += polyline_segments(pts, 0.45, 0.4, us + 0.02, us + 0.12, 4, 1)

    # ---------------- unstained granule nuclei: the stippled ground of the granular layer
    nd = []
    area = (x1p - x0p) * (y1p - GRL_Y)
    n_nuc = int(area / 26)
    for _ in range(n_nuc):
        x = rng.uniform(x0p, x1p)
        yb = GRL_Y + 6 * math.sin(x / 140.0) + 4 * math.sin(x / 37.0 + 1)
        y = rng.uniform(yb - 8, y1p)
        if y < yb:            # ragged upper edge
            if rng.random() > (y - (yb - 8)) / 8:
                continue
        nd.append((x, y, rng.uniform(0.9, 1.6), rng.random()))
    nd = np.array(nd, F32)

    S = np.array(S, dtype=np.float64)
    tr = np.array(tip_retract, dtype=np.float64)
    # retraction times per segment of the transient processes: the tip goes first
    ret0 = np.full(len(S), np.inf); ret1 = np.full(len(S), np.inf)
    for i0, i1, r0_, r1_ in tr:
        i0, i1 = int(i0), int(i1)
        nseg = i1 - i0
        for j in range(nseg):
            a = (nseg - 1 - j) / nseg
            ret0[i0 + j] = r0_ + (r1_ - r0_) * a
            ret1[i0 + j] = r0_ + (r1_ - r0_) * (a + 1.0 / nseg)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    np.savez_compressed(
        args.out,
        seg=S.astype(F32), ret0=ret0.astype(F32), ret1=ret1.astype(F32),
        spines=np.array(spines, F32), beads=np.array(beads, F32),
        soma_poly=soma_poly.astype(F32), soma_c=np.array([cx, cy], F32), soma_r=F32(rx),
        neigh_soma=np.array([p for p, _, _ in neigh_somata], F32),
        neigh_soma_u=np.array([(a, b) for _, a, b in neigh_somata], F32),
        gran=np.array(gran, F32), stell=np.array(stell, F32), nuclei=nd,
        labels=np.array([[ord(k), v[0], v[1]] for k, v in sorted(label_pts.items())], F32),
        main_range=np.array([main_seg0, main_seg1]), scale=F32(sc),
    )
    print('segments', len(S), 'spines', len(spines), 'beads', len(beads), 'nuclei', len(nd), '->', args.out)


if __name__ == '__main__':
    main()
