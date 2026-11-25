"""Geometry of the three plants, built from a phyllotaxis model, in 3D, to be seen from directly overhead.

Units: plant units (the head / rosette radius is about 1), x right, y down (image), z up toward the viewer.
Every element (bract, floret, leaf) has an index n counted from the apex outward. Element n lies at azimuth
n x 137.5078 deg (the golden angle) and on a logarithmic lattice: its distance from the apex grows by a constant
factor per index, so the contact parastichies are the same pair (a, b) from the centre to the rim, and element n lies on
arm n mod a of the a-family and arm n mod b of the b-family. lnG = 2 pi / (sqrt 5 a b) makes the a- and b-parastichies
cross at about right angles (the same rule as layout/sets/market93/phyllo.js).

Each builder returns a dict with per-element numpy arrays and a `sample(sel, density)` function that yields 3D
surface samples (x, y, z) and surface coordinates (s, t) for the selected elements, for the z-buffer.
"""
import math

import numpy as np
import torch

GA = math.pi * (3 - math.sqrt(5))          # 137.5078 deg
DEV = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
T32 = torch.float32


def lnG(a, b):
    return 2 * math.pi / (math.sqrt(5) * a * b)


def frame_on_sphere(theta, phi):
    """Point on the unit sphere (apex at +z) and its frame: N outward, U along the meridian toward the apex, E along
    the parallel (increasing phi)."""
    st, ct, sp, cp = np.sin(theta), np.cos(theta), np.sin(phi), np.cos(phi)
    N = np.stack([st * cp, st * sp, ct], -1)
    U = np.stack([-ct * cp, -ct * sp, st], -1)
    E = np.stack([-sp, cp, np.zeros_like(sp)], -1)
    return N, U, E


def _grid(ns, nt, dev=DEV):
    s = torch.linspace(0, 1, ns, device=dev)
    t = torch.linspace(-1, 1, nt, device=dev)
    return torch.meshgrid(s, t, indexing='ij')


# ---------------------------------------------------------------------------------------------------------------
# globe artichoke

def artichoke(a=5, b=8, N=54, theta0=0.06, flat=0.9, seed=1):
    """Involucral bracts of a closed globe-artichoke head on a slightly flattened globe (z scaled by `flat`).
    tan(theta_n / 2) = tan(theta0 / 2) exp(lnG n): a conformal (logarithmic) lattice on the sphere."""
    r = np.random.default_rng(seed)
    g = lnG(a, b)
    n = np.arange(N + b + 2)
    theta = 2 * np.arctan(np.tan(theta0 / 2) * np.exp(g * n))
    phi = n * GA
    Nn, Un, En = frame_on_sphere(theta, phi)
    P = Nn.copy()
    # local spacing: distance to the a- and b-neighbours outward
    da = np.linalg.norm(P[a:a + N + 1] - P[:N + 1], axis=1)[:N]
    db = np.linalg.norm(P[b:b + N + 1] - P[:N + 1], axis=1)[:N]
    d = np.sqrt(da * db)
    keep = slice(0, N)
    el = dict(kind='bract', n=n[keep], theta=theta[keep], phi=phi[keep], P=P[keep], N=Nn[keep], U=Un[keep],
              E=En[keep], d=d, a=a, b=b, N_el=N, flat=flat)
    # bract shape: length along the meridian (toward the apex), width along the parallel, in units of the spacing
    el['L'] = 1.85 * d * (1 + 0.05 * r.standard_normal(N))
    el['W'] = 1.15 * d * (1 + 0.04 * r.standard_normal(N))
    el['lift'] = 0.24 * d                                     # how far the tip stands proud of the head
    el['twist'] = 0.05 * r.standard_normal(N)                 # tiny irregularity of each bract
    el['notch'] = np.clip(0.075 + 0.02 * r.standard_normal(N), 0.04, 0.11)
    # the anchor of the count: on the bract's midline, three quarters of the way to the tip (the exposed part)
    sa_ = 0.72
    u_ = sa_ * el['L']
    h_ = el['lift'] * (-0.5 + 1.6 * sa_ ** 1.3)
    A3 = el['P'] + u_[:, None] * el['U'] + (h_ - u_ ** 2 / 2)[:, None] * el['N']
    A3[:, 2] *= flat
    el['anchor3d'] = A3

    def sample(sel, dens):
        """dens: samples per plant unit (along the surface). Yields (xyz [M,3], s [M], t [M], id [M]) tensors."""
        for i in sel:
            L, W = el['L'][i], el['W'][i]
            ns = int(max(6, L * dens * 1.3))
            nt = int(max(6, W * dens * 1.3))
            s, t = _grid(ns, nt)
            # outline ('Green Globe'): broad, widest above the middle, the tip broadly rounded at the shoulders with
            # a small V-notch in the middle (UPOV TG/184 'emarginate'; the photo of 'Green Globe' in NOTES.md)
            half = 0.58 + 0.42 * torch.sin(np.pi * torch.clamp(s / 1.25, 0, 1)) ** 0.8
            nt_ = el['notch'][i]
            tip = 1 - 0.62 * torch.abs(t) ** 1.5 - nt_ * torch.exp(-(t / 0.09) ** 2)
            inside = (s <= tip) & (s >= 0)
            tw = el['twist'][i]
            u = s * L                                          # along the meridian toward the apex
            v = t * half * W / 2 + tw * u                      # across
            # the bract follows the head's curvature, stands proud toward its tip, and is convex across
            sag = u * u / 2.0
            # a stiff scale: nearly flat across with a low keel down the middle, the margins curving down onto the
            # bracts beneath; the thickened tip flares a little outward (its shadow falls on the next bract)
            h = el['lift'][i] * (-0.5 + 1.6 * s ** 1.3) \
                - 0.16 * W * (t * half) ** 2 - 0.07 * W * torch.abs(t * half) \
                + 0.05 * L * torch.clamp((s - 0.78) / 0.22, 0, 1) ** 2
            Pt = torch.tensor(el['P'][i], device=DEV, dtype=T32)
            Ut = torch.tensor(el['U'][i], device=DEV, dtype=T32)
            Et = torch.tensor(el['E'][i], device=DEV, dtype=T32)
            Nt = torch.tensor(el['N'][i], device=DEV, dtype=T32)
            X = Pt + u[..., None] * Ut + v[..., None] * Et + (h - sag)[..., None] * Nt
            X[..., 2] = X[..., 2] * flat                        # a globe a little flattened on top
            m = inside
            yield X[m], s[m], t[m], torch.full((int(m.sum()),), i, device=DEV, dtype=torch.int32)

    el['sample'] = sample
    return el


# ---------------------------------------------------------------------------------------------------------------
# romanesco: a cone of cones of cones

def _cone_frame(D):
    D = D / np.linalg.norm(D, axis=-1, keepdims=True)
    ref = np.where(np.abs(D[..., 2:3]) < 0.9, np.array([0, 0, 1.0]), np.array([1.0, 0, 0]))
    E1 = np.cross(D, ref)
    E1 /= np.linalg.norm(E1, axis=-1, keepdims=True)
    E2 = np.cross(D, E1)
    return D, E1, E2


def cone_children(A, D, Ls, alpha, a, b, s0, smax, up_bias, alpha_child, fill=0.56, sink=0.22, rot=0.0):
    """Children on a cone's surface: apex A, axis D (apex -> base), slant length Ls, half-angle alpha. Child k at slant
    distance Ls * s0 * exp(lnG k sin(alpha)) (the developed cone is a sector of angle 2 pi sin(alpha), so this is the
    plane's logarithmic lattice rolled up) and azimuth k * GA. Each child is a cone of half-angle alpha_child whose base
    radius is `fill` x the distance to its a- and b-neighbours, sunk `sink` of its height into the parent."""
    D, E1, E2 = _cone_frame(np.asarray(D, np.float64))
    g = lnG(a, b) * math.sin(alpha)
    K = int(math.ceil(math.log(smax / s0) / g)) + 1
    k = np.arange(K + b + 1)
    sk = s0 * np.exp(g * k)
    psi = k * GA + rot
    radial = np.cos(psi)[:, None] * E1[None] + np.sin(psi)[:, None] * E2[None]
    dirs = math.cos(alpha) * D[None] + math.sin(alpha) * radial
    base = A[None] + Ls * sk[:, None] * dirs
    spacing = np.sqrt(np.linalg.norm(base[a:a + K] - base[:K], axis=1) * np.linalg.norm(base[b:b + K] - base[:K], axis=1))
    k, sk, psi, base, radial = k[:K], sk[:K], psi[:K], base[:K], radial[:K]
    keep = sk <= smax
    nrm = -math.sin(alpha) * D[None] + math.cos(alpha) * radial
    axis = nrm - up_bias * D[None]
    axis /= np.linalg.norm(axis, axis=1, keepdims=True)
    cl = fill * spacing / math.sin(alpha_child)
    apex = base + axis * (cl * math.cos(alpha_child) * (1 - sink))[:, None]
    return dict(apex=apex[keep], axis=axis[keep], Ls=cl[keep], s=sk[keep], psi=psi[keep], k=k[keep])


def romanesco(a=8, b=13, sa=5, sb=8, ssa=3, ssb=5, alpha_head=math.radians(50), alpha_fl=math.radians(27),
              s0=0.05, levels=3, seed=2):
    """Head: a cone of half-angle alpha_head, apex up at (0, 0, H). Level-1 florets in (a, b) parastichies, each a
    cone carrying level-2 florets in (sa, sb), each carrying level-3 in (ssa, ssb). The head cone itself is drawn too
    (the last element), as the floor of the crevices."""
    H = 1.0 / math.tan(alpha_head)                              # so the head's base radius is 1
    Ls_head = 1.0 / math.sin(alpha_head)
    A0 = np.array([0, 0, H])
    D0 = np.array([0, 0, -1.0])                                 # apex -> base: the cone opens downward
    # up_bias tilts a child's axis from its parent's surface normal toward the parent's apex direction (-D)
    L1 = cone_children(A0, D0, Ls_head, alpha_head, a, b, s0, 1.0, up_bias=0.55, alpha_child=alpha_fl, fill=0.60)
    el = dict(kind='cone', a=a, b=b, sa=sa, sb=sb, ssa=ssa, ssb=ssb, H=H, alpha_head=alpha_head, alpha_fl=alpha_fl)
    cones = []     # (apex, axis, Ls, level, parent index, index within parent, half-angle)
    for i in range(len(L1['k'])):
        cones.append((L1['apex'][i], L1['axis'][i], L1['Ls'][i], 1, -1, int(L1['k'][i]), alpha_fl))
    lvl1 = list(range(len(cones)))
    if levels >= 2:
        for ci in lvl1:
            Ap, Dp, Lp = cones[ci][0], cones[ci][1], cones[ci][2]
            ch = cone_children(Ap, -Dp, Lp, alpha_fl, sa, sb, 0.10, 0.97, up_bias=0.75, alpha_child=alpha_fl,
                               fill=0.50, sink=0.32, rot=0.7 * ci)
            for j in range(len(ch['k'])):
                cones.append((ch['apex'][j], ch['axis'][j], ch['Ls'][j], 2, ci, int(ch['k'][j]), alpha_fl))
    if levels >= 3:
        lvl2 = [i for i, c in enumerate(cones) if c[3] == 2]
        for ci in lvl2:
            Ap, Dp, Lp = cones[ci][0], cones[ci][1], cones[ci][2]
            ch = cone_children(Ap, -Dp, Lp, alpha_fl, ssa, ssb, 0.16, 0.97, up_bias=0.75, alpha_child=math.radians(36),
                               fill=0.55, sink=0.3, rot=1.3 * ci)
            for j in range(len(ch['k'])):
                cones.append((ch['apex'][j], ch['axis'][j], ch['Ls'][j], 3, ci, int(ch['k'][j]), math.radians(36)))
    cones.append((A0, -D0, Ls_head * 0.93, 0, -1, -1, alpha_head))   # the head itself
    el['apex'] = np.array([c[0] for c in cones])
    el['axis'] = np.array([c[1] for c in cones])
    el['Ls'] = np.array([c[2] for c in cones])
    el['level'] = np.array([c[3] for c in cones])
    el['parent'] = np.array([c[4] for c in cones])
    el['k'] = np.array([c[5] for c in cones])
    el['alpha'] = np.array([c[6] for c in cones])
    el['N_el'] = len(cones)
    el['head'] = dict(A=A0, D=D0, Ls=Ls_head, alpha=alpha_head)

    el['sample'] = cone_sampler(el)
    return el


def cone_sampler(el):
    D_all, E1_all, E2_all = _cone_frame(-el['axis'])

    def sample(sel, dens):
        """Cones batched by sample count (quantised), so 100k cones cost a few dozen GPU calls."""
        sel = np.asarray(sel)
        Lp = el['Ls'][sel]
        q = np.maximum(0, np.ceil(np.log(np.maximum(Lp * dens * 1.4, 5) / 5) / np.log(1.25))).astype(int)
        q = q * 10 + np.round(np.degrees(el['alpha'][sel]) / 10).astype(int) % 10 * 0 + np.searchsorted(
            np.unique(el['alpha']), el['alpha'][sel])
        for qq in np.unique(q):
            grp = sel[q == qq]
            alpha = float(el['alpha'][grp[0]])
            qq = qq // 10
            ns = int(math.ceil(5 * 1.25 ** qq))
            nt = int(max(10, math.ceil(2 * math.pi * math.sin(alpha) * ns)))
            per = ns * nt
            step = max(1, int(2.0e7 // per))
            s1 = torch.linspace(0, 1, ns, device=DEV)[:, None].expand(ns, nt)
            ps1 = torch.linspace(0, 2 * math.pi, nt, device=DEV)[None, :].expand(ns, nt)
            cs, sn = torch.cos(ps1)[..., None], torch.sin(ps1)[..., None]
            for j in range(0, len(grp), step):
                g = grp[j:j + step]
                Dt = torch.tensor(D_all[g], device=DEV, dtype=T32)[:, None, None]
                E1t = torch.tensor(E1_all[g], device=DEV, dtype=T32)[:, None, None]
                E2t = torch.tensor(E2_all[g], device=DEV, dtype=T32)[:, None, None]
                A = torch.tensor(el['apex'][g], device=DEV, dtype=T32)[:, None, None]
                L = torch.tensor(el['Ls'][g], device=DEV, dtype=T32)[:, None, None, None]
                dirs = math.cos(alpha) * Dt + math.sin(alpha) * (cs[None] * E1t + sn[None] * E2t)
                X = A + L * s1[None, ..., None] * dirs
                M = len(g)
                yield (X.reshape(-1, 3), s1[None].expand(M, ns, nt).reshape(-1), ps1[None].expand(M, ns, nt).reshape(-1),
                       torch.tensor(g, device=DEV, dtype=torch.int32)[:, None].expand(M, per).reshape(-1))

    return sample


def subtree(el, i):
    """Element i and all its descendants."""
    out = [i]
    frontier = [i]
    while frontier:
        ch = np.where(np.isin(el['parent'], frontier))[0]
        out.extend(ch.tolist())
        frontier = ch.tolist()
    return np.array(sorted(out))


def detach(el, i):
    """A copy of the romanesco with floret i (and its descendants) turned about its apex so that its axis points
    straight up: the floret as it would be drawn detached, seen from its own apex."""
    a = el['axis'][i] / np.linalg.norm(el['axis'][i])
    z = np.array([0, 0, 1.0])
    v = np.cross(a, z)
    s, c = np.linalg.norm(v), float(a @ z)
    if s < 1e-9:
        R = np.eye(3)
    else:
        K = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
        R = np.eye(3) + K + K @ K * ((1 - c) / s ** 2)
    e2 = dict(el)
    A0 = el['apex'][i]
    e2['apex'] = (el['apex'] - A0) @ R.T + A0
    e2['axis'] = el['axis'] @ R.T
    e2['sample'] = cone_sampler(e2)
    e2['detached'] = int(i)
    return e2


# ---------------------------------------------------------------------------------------------------------------
# spiral aloe

def aloe(N=150, div_deg=142.8, rt0=0.07, seed=3):
    """Aloe polyphylla rosette: about 150 leaves in five ranks (Glen & Hardy 2000; PlantZAfrica). Leaf n (n = 0 the
    youngest, at the centre) springs from the short stem at azimuth n * div. A divergence near 2/5 of a turn (144 deg)
    puts every fifth leaf nearly behind the last: the five ranks. Being a little short of 144 deg (here 142.2, toward
    the golden angle), each rank creeps round by 5 x 142.2 - 720 = -9 deg per leaf, so the ranks twist into the
    five-armed spiral. The leaf tips lie on a logarithmic lattice: tip radius rt0 .. 1, a constant factor per leaf."""
    r = np.random.default_rng(seed)
    div = math.radians(div_deg)
    n = np.arange(N)
    g = 0.0
    phi = n * div
    # mature leaves stop lengthening: the tip radius rises quickly in the young leaves and levels off in the old,
    # so the outermost tips fill the whole rim (the rosette is round, not a five-pointed star)
    tau = 65.0
    rt = 1 - (1 - rt0) * np.exp(-n / tau)
    rt = rt / rt[-1]
    el = dict(kind='leaf', n=n, phi=phi, rt=rt, N_el=N, div=div, div_deg=div_deg, g=g)
    el['L'] = rt                                               # plan reach of the leaf from the centre
    el['W'] = 0.62 * rt * (1 + 0.04 * r.standard_normal(N))
    el['zb'] = -0.45 * (n / N) ** 1.0                          # older leaves spring lower on the stem
    # elevation: the youngest nearly upright, the oldest spread nearly flat; the tip curls up (incurved)
    el['elev'] = np.radians(78 - 50 * np.clip(n / (N - 1), 0, 1) ** 0.6)
    el['curl'] = 0.10 + 0.10 * rt
    el['jit'] = 0.025 * r.standard_normal((N, 2))
    el['teeth'] = np.round(9 + 9 * rt).astype(int)            # marginal teeth on each side
    # the anchor of the count: on the midrib near the tip (the tips are what show from above)
    el['anchor_s'] = 0.80

    def leaf_xyz(i, s, t):
        rtip, ph, W, el0 = el['rt'][i], el['phi'][i], el['W'][i], el['elev'][i]
        rb = 0.015
        run = max(rtip - rb, 0.01)
        q = rb + run * s * (1 + el['jit'][i][0] * s)
        zc = el['zb'][i] + run * math.tan(el0) * (s - 0.5 * s * s) * 0.9 + el['curl'][i] * run * s ** 3
        # outline: broad triangular-ovate, broadest at about a fifth of the length, narrowing straight to a sharp tip
        half = torch.where(s < 0.2, 0.62 + 0.38 * torch.sin(np.pi * 0.5 * s / 0.2), torch.clamp((1 - s) / 0.8, 0, 1) ** 1.05)
        nt_ = int(el['teeth'][i])
        saw = torch.remainder(s * nt_, 1.0)
        tooth = 0.030 * (1 - saw) * (s > 0.08) * (s < 0.93)    # small forward-pointing teeth on the margin
        half = half * (W / 2) + tooth * run * 0.55 * (torch.abs(t) > 0.97)
        ang = ph + el['jit'][i][1] * s
        ca, sa = torch.cos(ang), torch.sin(ang)
        v = t * half
        # channelled upper face: a V in section, the margins raised
        z = zc + 0.22 * torch.abs(v) + 0.10 * W * (1 - s)
        x = q * ca - v * sa
        y = q * sa + v * ca
        return torch.stack([x, y, z], -1)

    def sample(sel, dens):
        for i in sel:
            run = el['rt'][i]
            Lm = run / max(math.cos(el['elev'][i]), 0.25)
            ns = int(max(8, Lm * dens * 1.4))
            nt = int(max(8, el['W'][i] * dens * 1.4))
            s, t = _grid(ns, nt)
            X = leaf_xyz(i, s, t)
            yield X.reshape(-1, 3), s.reshape(-1), t.reshape(-1), torch.full((ns * nt,), int(i), device=DEV, dtype=torch.int32)

    A3 = []
    for i in range(N):
        X = leaf_xyz(i, torch.tensor([[el['anchor_s']]], device=DEV), torch.tensor([[0.0]], device=DEV))
        A3.append(X[0, 0].cpu().numpy())
    el['anchor3d'] = np.array(A3)
    el['sample'] = sample
    return el
