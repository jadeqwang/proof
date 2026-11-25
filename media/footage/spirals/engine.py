"""Z-buffer of plant elements seen from directly overhead (orthographic), on the GPU.

rasterize() splats every element's surface samples into a height buffer (max wins) and then, in a second pass, writes
the winning sample's element id and surface coordinates (s, t). Everything downstream (shading, hatching, outlines,
anchors for the gold thread) is read from these buffers, so the thread registers with what is drawn.
"""
import math

import numpy as np
import torch
import torch.nn.functional as Fn

DEV = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


class View:
    """plan (x, y) in plant units -> buffer px: X = cx + S x, Y = cy + S y. z is scaled by S too (px)."""

    def __init__(self, W, H, cx, cy, S):
        self.W, self.H, self.cx, self.cy, self.S = W, H, cx, cy, S

    def px(self, xy):
        xy = np.asarray(xy, np.float64)
        return np.stack([self.cx + self.S * xy[..., 0], self.cy + self.S * xy[..., 1]], -1)


def rasterize(el, view, sel=None, dens_px=2.2, chunk=40):
    """dens_px: surface samples per buffer px. Returns dict of torch tensors on DEV: z (-inf where empty), id (-1),
    s, t."""
    W, H, S = view.W, view.H, view.S
    sel = np.arange(el['N_el']) if sel is None else np.asarray(sel)
    dens = dens_px * S
    zb = torch.full((H * W,), -1e9, device=DEV)
    for pass_ in (0, 1):
        if pass_ == 1:
            ib = torch.full((H * W,), -1, device=DEV, dtype=torch.int32)
            sb = torch.zeros(H * W, device=DEV)
            tb = torch.zeros(H * W, device=DEV)
        for X, s, t, idx in el['sample'](sel, dens):
            if X.shape[0] == 0:
                continue
            px = view.cx + S * X[:, 0]
            py = view.cy + S * X[:, 1]
            z = S * X[:, 2]
            ix = torch.round(px).long()
            iy = torch.round(py).long()
            ok = (ix >= 0) & (ix < W) & (iy >= 0) & (iy < H)
            if not bool(ok.any()):
                continue
            lin = (iy * W + ix)[ok]
            z = z[ok]
            if pass_ == 0:
                zb.scatter_reduce_(0, lin, z, 'amax')
            else:
                win = z >= zb[lin] - 1e-4
                lw = lin[win]
                ib[lw] = idx[ok][win]
                sb[lw] = s[ok][win]
                tb[lw] = t[ok][win]
    out = dict(z=zb.view(H, W), id=ib.view(H, W), s=sb.view(H, W), t=tb.view(H, W))
    fill_holes(out)
    return out


def fill_holes(b, it=2):
    """Single-pixel holes inside an element (splat gaps): take a neighbour's values."""
    z, idb = b['z'], b['id']
    for _ in range(it):
        hole = idb < 0
        if not bool(hole.any()):
            return
        for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            zn = torch.roll(z, (dy, dx), (0, 1))
            inn = torch.roll(idb, (dy, dx), (0, 1))
            take = hole & (inn >= 0)
            # only fill if the hole is surrounded (not the outside)
            z = torch.where(take, zn, z)
            idb = torch.where(take, inn, idb)
            for k in ('s', 't'):
                b[k] = torch.where(take, torch.roll(b[k], (dy, dx), (0, 1)), b[k])
            hole = idb < 0
        b['z'], b['id'] = z, idb


def blur(x, s):
    if s <= 0:
        return x
    k = int(s * 3) * 2 + 1
    g = torch.exp(-0.5 * (torch.arange(k, device=x.device, dtype=x.dtype) - k // 2) ** 2 / (s * s))
    g = g / g.sum()
    y = x[None, None]
    y = Fn.conv2d(Fn.pad(y, (k // 2, k // 2, 0, 0), mode='replicate'), g.view(1, 1, 1, k))
    y = Fn.conv2d(Fn.pad(y, (0, 0, k // 2, k // 2), mode='replicate'), g.view(1, 1, k, 1))
    return y[0, 0]


def normals(z, idb, ground=0.0):
    """Normals from the height buffer; across an element boundary the one-sided difference is used."""
    zz = torch.where(idb >= 0, z, torch.full_like(z, ground))

    def d(axis):
        zp = torch.roll(zz, -1, axis)
        zm = torch.roll(zz, 1, axis)
        ip = torch.roll(idb, -1, axis)
        im = torch.roll(idb, 1, axis)
        same_p = ip == idb
        same_m = im == idb
        c = (zp - zm) / 2
        c = torch.where(same_p & ~same_m, zp - zz, c)
        c = torch.where(~same_p & same_m, zz - zm, c)
        c = torch.where(~same_p & ~same_m, torch.zeros_like(c), c)
        return c
    gx, gy = d(1), d(0)
    n = torch.stack([-gx, -gy, torch.ones_like(gx)], 0)
    return n / torch.linalg.vector_norm(n, dim=0, keepdim=True)


def cast_shadow(z, idb, light, ground, steps=40, step_px=1.5):
    """1 lit, 0 in shadow. light: unit vector toward the light (x right, y down, z up)."""
    lx, ly, lz = light
    hl = math.hypot(lx, ly)
    dx, dy = lx / hl, ly / hl
    rise = lz / hl                                            # height gained per px travelled toward the light
    zz = torch.where(idb >= 0, z, torch.full_like(z, ground))
    H, W = zz.shape
    occ = torch.zeros_like(zz)
    yy, xx = torch.meshgrid(torch.arange(H, device=z.device, dtype=z.dtype), torch.arange(W, device=z.device, dtype=z.dtype), indexing='ij')
    for k in range(1, steps + 1):
        d = k * step_px
        gx = (xx + dx * d) / (W - 1) * 2 - 1
        gy = (yy + dy * d) / (H - 1) * 2 - 1
        zs = Fn.grid_sample(zz[None, None], torch.stack([gx, gy], -1)[None], mode='bilinear', padding_mode='border', align_corners=True)[0, 0]
        excess = zs - (zz + rise * d)
        occ = torch.maximum(occ, torch.clamp(excess / (1.5 + 0.08 * d), 0, 1))
    return 1 - occ


def ambient(z, idb, ground, s1=6, s2=24):
    zz = torch.where(idb >= 0, z, torch.full_like(z, ground))
    a = torch.clamp((blur(zz, s1) - zz) / (s1 * 0.9), 0, 1)
    b = torch.clamp((blur(zz, s2) - zz) / (s2 * 0.9), 0, 1)
    return 1 - torch.clamp(0.6 * a + 0.5 * b, 0, 1)


def edges(idb, z, width=1.0):
    """Occluding-edge strength: where the element id changes; stronger where the height step is larger. Returns
    (edge 0..1 on the LOWER side of the step, step height px)."""
    out = torch.zeros_like(z)
    step = torch.zeros_like(z)
    zz = torch.where(idb >= 0, z, torch.full_like(z, -1e6))
    for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)):
        inn = torch.roll(idb, (dy, dx), (0, 1))
        zn = torch.roll(zz, (dy, dx), (0, 1))
        diff = (inn != idb) & (zn > zz)          # the neighbour is higher: I am the lower side of an edge
        out = torch.maximum(out, diff.float())
        step = torch.maximum(step, torch.where(diff, torch.clamp(zn - zz, 0, 1e4), torch.zeros_like(z)))
    return out, step


def anchors(b, n_el):
    """Visible centroid and visible area (px) of every element."""
    idb = b['id'].view(-1).long()
    H, W = b['id'].shape
    yy, xx = torch.meshgrid(torch.arange(H, device=DEV, dtype=torch.float32), torch.arange(W, device=DEV, dtype=torch.float32), indexing='ij')
    ok = idb >= 0
    cnt = torch.zeros(n_el, device=DEV).index_add_(0, idb[ok], torch.ones(int(ok.sum()), device=DEV))
    sx = torch.zeros(n_el, device=DEV).index_add_(0, idb[ok], xx.reshape(-1)[ok])
    sy = torch.zeros(n_el, device=DEV).index_add_(0, idb[ok], yy.reshape(-1)[ok])
    c = torch.stack([sx, sy], 1) / torch.clamp(cnt, 1)[:, None]
    return c.cpu().numpy(), cnt.cpu().numpy()


def upper_edges(idb, z, min_step=3.0):
    """1 on the HIGHER side of an occluding edge (a free margin standing over what is below), 0 elsewhere."""
    out = torch.zeros_like(z)
    zz = torch.where(idb >= 0, z, torch.full_like(z, -1e6))
    for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0)):
        inn = torch.roll(idb, (dy, dx), (0, 1))
        zn = torch.roll(zz, (dy, dx), (0, 1))
        out = torch.maximum(out, ((inn != idb) & (zz > zn + min_step) & (idb >= 0)).float())
    return out
