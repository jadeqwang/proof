"""Frost on a window pane: Kobayashi (1993) anisotropic phase-field solidification on the GPU.

The pane is a rectangle of supercooled "liquid" (read: vapour-saturated glass surface). Grains nucleate along the
pane's edges (the cold putty line) and along a few scratches, each with its own crystal orientation, and grow as
six-fold dendrites with noise-driven side branching. Latent heat diffuses away and is drained by a heat sink to the
glass whose temperature is warmer in the middle of the pane (and cools through the night), so the centre stays
sparse for a long time.

Output (npz): `arr` = sim time (in steps, fractional) at which each cell first reached phi >= 0.5 (inf = never);
`grain` = grain id per cell; `theta0` table; `phi`, `T` final fields; `cov` coverage curve. The render reads only
this; any frame at any time is closed-form from `arr`.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY sim.py --w 3520 --h 1760 --steps 60000 --out state/frost_3520.npz
"""
import argparse
import math
import os
import time

import numpy as np
import torch
import torch.nn.functional as F


def seeds_layout(W, H, rng, scale, ts):
    """Nucleation sites: (x, y, grain_orientation, start_step). Coordinates in cells."""
    S = []
    def add(x, y, t0):
        S.append((x, y, rng.uniform(0, math.pi / 3), t0 * ts))
    # bottom edge: coldest, densest, earliest (cold air pools at the sill)
    n = int(11 * W / 3520)
    for i in range(n):
        add(rng.uniform(0.02, 0.98) * W, H - 1 - rng.uniform(0, 6) * scale, rng.uniform(0, 3000))
    # side edges: fewer, staggered upward
    for side in (0, 1):
        for i in range(int(5 * H / 1760)):
            y = H * (1 - rng.uniform(0.0, 1.0) ** 0.7)
            x = rng.uniform(0, 6) * scale if side == 0 else W - 1 - rng.uniform(0, 6) * scale
            add(x, y, 2000 + rng.uniform(0, 14000) * (1 - y / H))
    # top edge: sparse, late
    for i in range(int(4 * W / 3520)):
        add(rng.uniform(0.05, 0.95) * W, rng.uniform(0, 6) * scale, rng.uniform(9000, 22000))
    # corners: early
    for (cx, cy) in ((0, H - 1), (W - 1, H - 1)):
        add(cx + (8 * scale if cx == 0 else -8 * scale), cy - 8 * scale, 0)
    # scratches: straight hairlines on the glass; frost nucleates along them later in the night.
    # Seeded as a dense row of nuclei (a near-continuous line), every nucleus with an orientation close to the
    # scratch's own direction, so feathers grow out of it on both sides.
    scratches = [((0.10, 0.30), (0.33, 0.12), 12000),
                 ((0.70, 0.86), (0.93, 0.55), 9000),
                 ((0.58, 0.10), (0.80, 0.22), 18000)]
    for (a, b, t0) in scratches:
        L = math.hypot((b[0] - a[0]) * W, (b[1] - a[1]) * H)
        ang = math.atan2((b[1] - a[1]) * H, (b[0] - a[0]) * W)
        k = max(2, int(L / (7 * scale)))
        for i in range(k):
            u = (i + rng.uniform(0.3, 0.7)) / k
            S.append(((a[0] + (b[0] - a[0]) * u) * W, (a[1] + (b[1] - a[1]) * u) * H,
                      (ang + rng.normal(0, 0.06)) % (math.pi / 3), (t0 + 1500 * u + rng.uniform(0, 300)) * ts))
    return S, scratches


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--w', type=int, default=1760)
    ap.add_argument('--h', type=int, default=880)
    ap.add_argument('--steps', type=int, default=40000)
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--out', default='state/frost.npz')
    ap.add_argument('--snap', type=int, default=0, help='save a preview PNG every N steps (0: off)')
    ap.add_argument('--K', type=float, default=1.7)
    ap.add_argument('--delta', type=float, default=0.05)
    ap.add_argument('--noise', type=float, default=0.04)
    ap.add_argument('--sink', type=float, default=0.0, help='heat drain rate to the glass')
    ap.add_argument('--warm_tau', type=float, default=0.6, help='centre warmth decay time, fraction of the run')
    ap.add_argument('--cool', type=float, default=0.25, help='uniform cooling of the pane over the whole run')
    ap.add_argument('--warm', type=float, default=0.45, help='extra glass temperature at the centre at t=0')
    args = ap.parse_args()

    dev = 'cuda'
    W, H = args.w, args.h
    scale = W / 1760.0
    rng = np.random.default_rng(args.seed)
    torch.manual_seed(args.seed)

    # Kobayashi 1993 parameters (dimensionless); dx chosen so a cell = one sim cell
    dx, dt = 0.03, 1e-4
    tau, eps_bar, j = 3e-4, 0.010, 6
    alpha, gamma, K = 0.9, 10.0, args.K
    delta, a_noise = args.delta, args.noise

    S, scratches = seeds_layout(W, H, rng, scale, args.steps / 50000.0)
    nS = len(S)
    th_table = torch.tensor([0.0] + [s[2] for s in S], device=dev)
    sx = torch.tensor([s[0] for s in S], device=dev)
    sy = torch.tensor([s[1] for s in S], device=dev)
    st = torch.tensor([s[3] for s in S], device=dev)
    started = torch.zeros(nS, dtype=torch.bool, device=dev)

    yy, xx = torch.meshgrid(torch.arange(H, device=dev, dtype=torch.float32),
                            torch.arange(W, device=dev, dtype=torch.float32), indexing='ij')
    # glass temperature target: warm ellipse in the middle (the room's heat reaches the centre of the pane first)
    u = (xx / W - 0.5) / 0.36
    v = (yy / H - 0.47) / 0.42
    # low-frequency noise so the warm clearing is not a clean ellipse
    g = torch.Generator(device='cpu').manual_seed(args.seed + 11)
    lf = torch.rand(1, 1, 7, 12, generator=g).to(dev) - 0.5
    lf = F.interpolate(lf, size=(H, W), mode='bicubic', align_corners=True)[0, 0]
    bump = torch.exp(-((u * u + v * v) * (1 + 0.9 * lf)).clamp_min(0) ** 1.5)
    # and a slight vertical gradient: bottom coldest
    vert = (1 - yy / H) * 0.10

    phi = torch.zeros(H, W, device=dev)
    T = (0.0 + vert + args.warm * bump).clone()
    grain = torch.zeros(H, W, dtype=torch.int32, device=dev)
    arr = torch.full((H, W), float('inf'), device=dev)
    phi_chk = phi.clone()
    r_seed = 3.0 * max(1.0, scale ** 0.5)

    def pad(a):
        return F.pad(a[None, None], (1, 1, 1, 1), mode='replicate')[0, 0]

    def step_core(phi, T, th0):
        p = pad(phi)
        px = (p[1:-1, 2:] - p[1:-1, :-2]) / (2 * dx)
        py = (p[2:, 1:-1] - p[:-2, 1:-1]) / (2 * dx)
        lap = (p[1:-1, 2:] + p[1:-1, :-2] + p[2:, 1:-1] + p[:-2, 1:-1] - 4 * phi) / (dx * dx)
        theta = torch.atan2(py, px)
        ang = j * (theta - th0)
        eps = eps_bar * (1 + delta * torch.cos(ang))
        deps = -eps_bar * j * delta * torch.sin(ang)
        A = eps * deps
        Ax = pad(A * px)
        Ay = pad(A * py)
        term1 = (Ay[1:-1, 2:] - Ay[1:-1, :-2]) / (2 * dx)     # d/dx (eps eps' py)
        term2 = (Ax[2:, 1:-1] - Ax[:-2, 1:-1]) / (2 * dx)     # d/dy (eps eps' px)
        e2 = pad(eps * eps)
        e2x = (e2[1:-1, 2:] - e2[1:-1, :-2]) / (2 * dx)
        e2y = (e2[2:, 1:-1] - e2[:-2, 1:-1]) / (2 * dx)
        m = (alpha / math.pi) * torch.atan(gamma * (1.0 - T))
        chi = torch.rand_like(phi) - 0.5
        react = phi * (1 - phi) * (phi - 0.5 + m + a_noise * chi)
        dphi = (dt / tau) * (-term1 + term2 + eps * eps * lap + e2x * px + e2y * py + react)
        tp = pad(T)
        lapT = (tp[1:-1, 2:] + tp[1:-1, :-2] + tp[2:, 1:-1] + tp[:-2, 1:-1] - 4 * T) / (dx * dx)
        return dphi, lapT

    try:
        step_c = torch.compile(step_core)
        step_c(phi, T, th_table[grain.long()])
    except Exception as e:
        print('torch.compile unavailable, eager:', e)
        step_c = step_core

    os.makedirs(os.path.dirname(os.path.abspath(args.out)) or '.', exist_ok=True)
    cov = []
    t_start = time.time()
    CHK = 10
    for n in range(args.steps + 1):
        # nucleation
        due = (~started) & (st <= n)
        if bool(due.any()):
            for i in torch.nonzero(due).flatten().tolist():
                d2 = (xx - sx[i]) ** 2 + (yy - sy[i]) ** 2
                disk = d2 < r_seed * r_seed
                free = disk & (phi < 0.5)
                phi = torch.where(free, torch.ones_like(phi), phi)
                grain = torch.where(free, torch.full_like(grain, i + 1), grain)
                started[i] = True
        th0 = th_table[grain.long()]
        dphi, lapT = step_c(phi, T, th0)
        phi = (phi + dphi).clamp_(0, 1)
        # night cooling: the centre's extra warmth decays (the middle frosts last), the whole pane cools slowly,
        # and an optional weak drain pulls T toward the glass temperature (thickens old frost)
        tw = args.warm_tau * args.steps
        dwarm = args.warm * (math.exp(-(n + 1) / tw) - math.exp(-n / tw))
        warm_t = args.warm * math.exp(-n / tw)
        T = T + dt * lapT + K * dphi + dwarm * bump - args.cool / args.steps
        if args.sink > 0:
            T = T - dt * args.sink * (T - (vert + warm_t * bump))
        if n % CHK == 0:
            # grain ids spread into newly solidifying cells from their neighbours
            need = (grain == 0) & (phi > 0.02)
            if bool(need.any()):
                mp = F.max_pool2d(grain[None, None].float(), 3, 1, 1)[0, 0].int()
                grain = torch.where(need, mp, grain)
            # arrival time, interpolated within the check interval
            newly = torch.isinf(arr) & (phi >= 0.5)
            frac = ((0.5 - phi_chk) / (phi - phi_chk).clamp_min(1e-6)).clamp(0, 1)
            arr = torch.where(newly, (n - CHK) + CHK * frac, arr)
            phi_chk = phi.clone()
        if n % 500 == 0:
            c = float((phi > 0.5).float().mean())
            cov.append((n, c))
            if n % 5000 == 0:
                el = time.time() - t_start
                print(f'step {n}/{args.steps}  cover {c:.3f}  Tmean {float(T.mean()):.3f}  {el:.0f}s', flush=True)
        if args.snap and n % args.snap == 0:
            import cv2
            img = (255 * (1 - phi)).byte().cpu().numpy()
            cv2.imwrite(args.out.replace('.npz', f'_snap{n:06d}.png'), img)
        if n > 0 and n % 20000 == 0:
            save(args, arr, grain, th_table, phi, T, cov, scratches, n)
    save(args, arr, grain, th_table, phi, T, cov, scratches, args.steps)
    print('done', time.time() - t_start, 's')


def save(args, arr, grain, th_table, phi, T, cov, scratches, n):
    np.savez_compressed(args.out + '.tmp.npz',
                        arr=arr.cpu().numpy().astype(np.float32), grain=grain.cpu().numpy().astype(np.int16),
                        theta0=th_table.cpu().numpy(), phi=phi.cpu().numpy().astype(np.float16),
                        T=T.cpu().numpy().astype(np.float16), cov=np.array(cov), steps=n,
                        scratches=np.array([[a[0], a[1], b[0], b[1], t] for a, b, t in scratches]),
                        args=str(vars(args)))
    os.replace(args.out + '.tmp.npz', args.out)


if __name__ == '__main__':
    main()
