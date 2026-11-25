"""tools.ink.roto: brush-redraw rotoscope. A video of a moving performer is only READ (silhouette, medial axis,
optical flow); what is shown is redrawn as a few thick brush strokes over a pale body wash, so every frame is ink on
our paper, not a filter over video.

    clip = Clip.prepare('media/gen/staff_form.mp4')                  # keyed source (video.py)
    brush = redraw(clip)                                             # -> a new Clip store of redrawn frames (cached)
    scene.add(brush.as_layer(rt), kind='ink', pos=(600, 200), scale=1.5)

    path = track_point(clip, seed=(700, 150), mode='extreme')        # staff tip, (n, 3) rows of (src_t, x, y)
    trail = StaffTrail(path, width=16, scale=1.5, pos=(600, 200), paper=paper)
    trail.lay(frame, rt.src(t))                                      # the 飞白 the tip has written so far; it stays

CLI:  python -m tools.ink.roto redraw work/ink_clips/<name> [--out DIR] [--strokes 10] [--trail 1.0]
"""
import argparse
import hashlib
import json
import math
import shutil
import time
from pathlib import Path

import cv2
import numpy as np

from .core import F32, ROOT, blur, fbm, grain, ink_T, lay_ink, place, rng, smoothstep, to_u8
from .ink import stroke
from .video import Clip


# --------------------------------------------------------------------------------------------------------------------
# reading the performer: silhouette, medial axis, branches

def silhouette(density, thr=0.3):
    """Binary silhouette (uint8 0/1) of an ink density map, cleaned of specks."""
    m = (blur(density, 1.0) > thr).astype(np.uint8)
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))


def _smooth_sil(S):
    """A silhouette with its edge noise ironed out, for a clean medial axis (thin things are kept)."""
    return (blur(S.astype(F32), 2.0) > 0.5).astype(np.uint8)


def thin(mask):
    """Zhang-Suen thinning of a uint8 0/1 mask -> 1 px medial axis (uint8 0/1). Vectorised; run it on a crop."""
    img = np.pad(mask.astype(np.uint8), 1)
    while True:
        changed = False
        for step in (0, 1):
            p2, p3, p4 = img[:-2, 1:-1], img[:-2, 2:], img[1:-1, 2:]
            p5, p6, p7 = img[2:, 2:], img[2:, 1:-1], img[2:, :-2]
            p8, p9 = img[1:-1, :-2], img[:-2, :-2]
            c = img[1:-1, 1:-1]
            nb = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(nb)
            A = sum(((nb[k] == 0) & (nb[(k + 1) % 8] == 1)).astype(np.uint8) for k in range(8))
            if step == 0:
                cond = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                cond = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            kill = (c == 1) & (B >= 2) & (B <= 6) & (A == 1) & cond
            if kill.any():
                img[1:-1, 1:-1][kill] = 0
                changed = True
        if not changed:
            break
    return img[1:-1, 1:-1]


_RING = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]


def branches(skel, min_len=14):
    """Trace a 1 px skeleton into polylines (list of Nx2 float arrays, x y) running between ends and junctions.
    Ends and junctions are found by crossing number, so staircase pixels of an 8-connected line are not junctions."""
    ys, xs = np.nonzero(skel)
    if len(xs) == 0:
        return []
    pix = set(zip(ys.tolist(), xs.tolist()))

    def nbrs(p):
        return [(p[0] + dy, p[1] + dx) for dy, dx in _RING if (p[0] + dy, p[1] + dx) in pix]

    def cn(p):
        r = [(p[0] + dy, p[1] + dx) in pix for dy, dx in _RING]
        return sum((not r[k]) and r[(k + 1) % 8] for k in range(8))

    nodes = {p for p in pix if cn(p) != 2}
    if not nodes:                                           # a closed loop: break it anywhere
        nodes = {next(iter(pix))}
    out, seen = [], set()
    for n in nodes:
        for q in nbrs(n):
            if q in seen or q in nodes:
                continue
            path, prev, cur = [n, q], n, q
            seen.add(q)
            while True:
                cand = [r for r in nbrs(cur) if r != prev and r not in path[-4:]]
                hit = [r for r in cand if r in nodes]
                if hit:
                    path.append(hit[0])
                    break
                cand = [r for r in cand if r not in seen]
                if not cand:
                    break
                cand.sort(key=lambda r: abs(r[0] - cur[0]) + abs(r[1] - cur[1]))
                prev, cur = cur, cand[0]
                seen.add(cur)
                path.append(cur)
            if len(path) >= min_len:
                out.append(np.array([(p[1], p[0]) for p in path], np.float32))
    return out


def gestures(skel, dt, min_len=20):
    """The skeleton as a few long gestures: spurs inside the body's own thickness are pruned, and branches that
    meet at a junction and run on in the same direction are joined, so a leg or the staff is ONE stroke."""
    bs = [b for b in branches(skel, min_len=3)]

    def direc(b, at_end):
        k = min(len(b) - 1, 12)
        v = (b[-1] - b[-1 - k]) if at_end else (b[0] - b[k])
        return v / max(float(np.hypot(*v)), 1e-6)

    for _ in range(4):
        if not bs:
            return []
        n = len(bs)
        ends = np.array([b[0] for b in bs] + [b[-1] for b in bs])
        dd = np.hypot(ends[:, None, 0] - ends[None, :, 0], ends[:, None, 1] - ends[None, :, 1])
        own = (np.arange(2 * n)[:, None] % n) == (np.arange(2 * n)[None, :] % n)
        free = ~((dd < 6.0) & ~own).any(axis=1)
        keep = []
        for i, b in enumerate(bs):
            f0, f1 = free[i], free[i + n]
            L = _length(b)
            if (f0 != f1) and L < 1.3 * float(_sample(dt, b[-1:] if f0 else b[:1])[0]) + 8:
                continue                                            # a spur inside the body's thickness
            if f0 and f1 and L < min_len * 0.5:
                continue
            keep.append(b)
        changed = len(keep) != len(bs)
        bs = keep
        while True:                                                 # join what runs straight on through a junction
            best = None
            for i in range(len(bs)):
                for j in range(i + 1, len(bs)):
                    for ei in (0, 1):
                        for ej in (0, 1):
                            pi, pj = (bs[i][-1] if ei else bs[i][0]), (bs[j][-1] if ej else bs[j][0])
                            if abs(pi[0] - pj[0]) > 6 or abs(pi[1] - pj[1]) > 6:
                                continue
                            c = -float(direc(bs[i], ei) @ direc(bs[j], ej))      # 1 = runs straight on
                            if c > 0.45 and (best is None or c > best[0]):
                                best = (c, i, j, ei, ej)
            if best is None:
                break
            _, i, j, ei, ej = best
            a = bs[i] if ei else bs[i][::-1]
            b = bs[j][::-1] if ej else bs[j]
            bs = [x for k, x in enumerate(bs) if k not in (i, j)] + [np.vstack([a, b])]
            changed = True
        if not changed:
            break
    return [b for b in bs if _length(b) >= min_len]


def resample(pts, k):
    """Resample a polyline to k points evenly spaced by arc length."""
    seg = np.hypot(np.diff(pts[:, 0]), np.diff(pts[:, 1]))
    s = np.concatenate([[0], np.cumsum(seg)])
    if s[-1] < 1e-6:
        return np.repeat(pts[:1], k, 0)
    u = np.linspace(0, s[-1], k)
    return np.stack([np.interp(u, s, pts[:, 0]), np.interp(u, s, pts[:, 1])], 1).astype(F32)


def _max_turn(pts):
    d = np.diff(pts, axis=0)
    a = np.arctan2(d[:, 1], d[:, 0])
    return float(np.abs(np.angle(np.exp(1j * np.diff(a)))).max()) if len(a) > 1 else 0.0


def _length(pts):
    return float(np.hypot(np.diff(pts[:, 0]), np.diff(pts[:, 1])).sum())


def _sample(img, pts, fill=0.0):
    h, w = img.shape[:2]
    x = np.clip(np.round(pts[:, 0]).astype(int), 0, w - 1)
    y = np.clip(np.round(pts[:, 1]).astype(int), 0, h - 1)
    return img[y, x]


# --------------------------------------------------------------------------------------------------------------------
# the redraw

def _analyse(clip, thr, spacing, max_strokes, quiet):
    """Pass 1: per frame, a coherent set of strokes. A stroke keeps its identity (and so its brush) for as long as
    the limb it follows exists: its control points ride the optical flow, then settle onto the new medial axis.
    Strokes are only born where the medial axis is left uncovered, and only die when their limb is gone."""
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    strokes, next_id, prev_g = [], 0, None
    frames = []
    for i in range(clip.n):
        d = clip.density(i)
        S = silhouette(d, thr)
        g = to_u8(blur(d, 2.0))
        flow = dis.calc(prev_g, g, None) if prev_g is not None else None
        prev_g = g
        ys, xs = np.nonzero(S)
        if len(xs) < 30:
            frames.append([])
            strokes = []
            continue
        x0, y0, x1, y1 = max(0, xs.min() - 2), max(0, ys.min() - 2), xs.max() + 3, ys.max() + 3
        sk = np.zeros_like(S)
        sk[y0:y1, x0:x1] = thin(_smooth_sil(S)[y0:y1, x0:x1])
        dt = cv2.distanceTransform(S, cv2.DIST_L2, 3)
        dsk, lab = cv2.distanceTransformWithLabels(1 - sk, cv2.DIST_L2, 3, labelType=cv2.DIST_LABEL_PIXEL)
        sy, sx = np.nonzero(sk)
        lut = np.zeros((lab.max() + 1, 2), F32)
        lut[lab[sy, sx]] = np.stack([sx, sy], 1)
        near = np.pad(S, 0)
        Sd = cv2.dilate(S, np.ones((9, 9), np.uint8))
        # 1. carry the old strokes forward
        kept = []
        for st in strokes:
            p = st['pts'].copy()
            if flow is not None:
                fx = cv2.blur(flow[..., 0], (7, 7))
                fy = cv2.blur(flow[..., 1], (7, 7))
                p[:, 0] += _sample(fx, st['pts'])
                p[:, 1] += _sample(fy, st['pts'])
            dist = _sample(dsk, p)
            snap = lut[_sample(lab, p)]
            pull = (dist < spacing * 1.5)[:, None]
            p = np.where(pull, snap, p)
            inside = _sample(Sd, p) > 0
            if inside.mean() < 0.6:
                continue                                         # the limb has gone
            # keep the stroke's own length: endpoints are not allowed to creep toward each other
            k = len(p)
            q = resample(p, k)
            L = _length(q)
            if L < spacing * 0.8:
                continue
            # a stroke that has been pulled across two limbs (crossing arms, staff over a leg) is no longer one
            # gesture: let it go and a clean one is seeded in its place
            L0 = _length(st['pts'])
            if (not 0.6 < L / max(L0, 1e-6) < 1.5 or _max_turn(q) > 1.9
                    or (_sample(Sd, resample(q, k * 5)) > 0).mean() < 0.9):
                continue
            st2 = dict(st, pts=q, age=st['age'] + 1)
            st2['hist'] = (st['hist'] + [q])[-7:]
            kept.append(st2)
        # drop strokes that have slid onto an older one
        kept.sort(key=lambda s: s['id'])
        cover = np.zeros(S.shape, np.uint8)
        final = []
        for st in kept:
            on = _sample(cover, st['pts']) > 0
            if on.mean() > 0.65:
                continue
            cv2.polylines(cover, [np.round(st['pts']).astype(np.int32).reshape(-1, 1, 2)], False, 1,
                          int(max(5, spacing * 0.9)))
            final.append(st)
        # 2. new strokes where the medial axis is uncovered
        left = (sk & (1 - cover)).astype(np.uint8)
        if left.any() and len(final) < max_strokes:
            cand = []
            for b in gestures(sk, dt, min_len=int(spacing * 0.9)):
                unc = _sample(left, b)
                if unc.mean() > 0.6 and _length(b) >= spacing:
                    cand.append(b)
            cand.sort(key=lambda b: -_length(b))
            for b in cand:
                if len(final) >= max_strokes:
                    break
                if (_sample(cover, b) > 0).mean() > 0.5:
                    continue
                k = int(max(3, round(_length(b) / spacing)) + 1)
                q = resample(b, k)
                # a brush stroke runs outward from the body: start at the thicker end
                if _sample(dt, q[:1])[0] < _sample(dt, q[-1:])[0]:
                    q = q[::-1].copy()
                final.append(dict(id=next_id, pts=q, age=0, hist=[q]))
                next_id += 1
                cv2.polylines(cover, [np.round(q).astype(np.int32).reshape(-1, 1, 2)], False, 1,
                              int(max(5, spacing * 0.9)))
        strokes = final
        rec = []
        for st in strokes:
            wd = np.maximum(_sample(dt, st['pts']) * 2.0, 2.0)
            sp = 0.0
            if len(st['hist']) >= 3:                           # speed of the outer end, agreed by two frames
                a = float(np.hypot(*(st['hist'][-1][-1] - st['hist'][-2][-1])))
                b = float(np.hypot(*(st['hist'][-2][-1] - st['hist'][-3][-1])))
                sp = min(a, b * 1.5) if max(a, b) < 140 else 0.0
            rec.append(dict(id=st['id'], pts=st['pts'].copy(), w=wd, speed=sp, age=st['age'],
                            hist=[h.copy() for h in st['hist']]))
        frames.append(rec)
        if not quiet and i % 24 == 0:
            print(f'  roto analyse {i}/{clip.n}: {len(strokes)} strokes', flush=True)
    return frames


def _render_frame(clip, i, rec, statics, body, density, dry, trail, width_gain, seed, mass_r=16.0):
    d = clip.density(i)
    h, w = d.shape
    S = silhouette(d, 0.3).astype(F32)
    pool, gr = statics
    out = np.zeros((h, w), F32)
    dt = cv2.distanceTransform(S.astype(np.uint8), cv2.DIST_L2, 3)
    if body > 0:
        # the body mass (torso, head): one heavy wet wash, uneven, with a pale skirt where it thins
        mass = smoothstep(mass_r * 0.5, mass_r * 1.1, blur(dt, 2.5))
        mass = blur(mass, 2.0) * blur(S, 1.2)
        out = mass * density * 0.66 * (0.55 + 0.9 * pool)
        out += np.clip(blur(mass, 1.0) - blur(mass, 4.0), 0, 1) * density * 0.5          # wet rim of the mass
        skirt = np.clip(blur(mass, 5.0) - mass, 0, 1) * blur(S, 1.2)
        out += skirt * body * 1.6
    out *= 1 + 0.08 * gr
    T = ink_T(out)
    trails = []
    for st in rec:
        wd = st['w']
        wmax = float(np.percentile(wd, 80)) * width_gain
        if wmax < 2.5 or _length(st['pts']) < max(12.0, 0.8 * wmax):
            continue
        pr = np.clip(wd * width_gain / wmax, 0.25, 1.4)
        pts = [(float(x), float(y), float(p)) for (x, y), p in zip(st['pts'], pr)]
        fast = smoothstep(8.0, 26.0, st['speed'])
        thin_ = wmax < 12                                      # the staff: one sure line, drier
        a = stroke(pts, width=wmax, seed=seed + st['id'] * 7, density=density * (1.0 if not thin_ else 1.05),
                   dry=min(0.9, dry + 0.30 * fast + (0.1 if thin_ else 0.0)),
                   dry_end=min(1.0, dry + 0.38 + 0.25 * fast), taper=(0.05, 0.2 if not thin_ else 0.08),
                   bleed=1.6 if not thin_ else 0.8, pad=wmax * 1.2 + 12)
        lay_ink(T, a.T(2.0), int(a.pos[0]), int(a.pos[1]))
        # 飞白 trailing behind a fast limb: dry strokes along where its tip and middle have just been
        if trail > 0 and fast > 0.05 and len(st['hist']) >= 3:
            tr = np.array([hh[-1] for hh in st['hist'] if len(hh) == len(st['pts'])][::-1], F32)
            steps = np.hypot(*np.diff(tr, axis=0).T) if len(tr) >= 3 else np.zeros(1)
            if len(tr) >= 3 and steps.sum() > 14 and steps.max() < 140 and _max_turn(tr) < 1.3:
                wloc = float(wd[-1]) * width_gain
                tp = [(float(x), float(y), 1.0 - 0.45 * k / (len(tr) - 1)) for k, (x, y) in enumerate(tr)]
                b = stroke(tp, width=max(7.0, wloc * 1.3 + 3), seed=seed + 1000 + st['id'] * 13,
                           density=density * 0.6 * trail * (0.45 + 0.55 * fast), dry=0.8, dry_end=1.1,
                           taper=(0.0, 0.5), bleed=0.0, pad=wloc * 2 + 14)
                trails.append(b)
    # anything of the figure that neither the mass nor a stroke reached still gets ink: a mid-tone touch, never a hole
    got = (blur(1.0 - T.min(axis=2), 1.5) > 0.22).astype(np.uint8)
    got = cv2.dilate(got, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    miss = cv2.morphologyEx((S > 0.5).astype(np.uint8) & (1 - got), cv2.MORPH_OPEN,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    if miss.any():
        miss = blur(cv2.dilate(miss, np.ones((7, 7), np.uint8)).astype(F32), 2.5) * blur(S, 1.0)
        T *= ink_T(miss * (0.42 + 0.3 * pool) * density)
    for b in trails:
        lay_ink(T, b.T(2.0), int(b.pos[0]), int(b.pos[1]))
    return T


def redraw(clip, out=None, strokes=12, spacing=26.0, body=0.30, density=0.92, dry=0.22, trail=0.7, width_gain=1.12,
           thr=0.3, seed=0, force=False, quiet=False):
    """Redraw a prepared ink clip as brush marks; returns a new Clip (an ink store beside the source, cached).

    strokes     most strokes alive at once (a figure wants 8-14)
    spacing     px between stroke control points at clip resolution (smaller follows curves more closely)
    body        density of the pale wash laid under the strokes for the body mass (0 = lines only)
    density     ink load of the strokes; dry: base dryness (0 wet .. 1 all 飞白); fast limbs get drier by themselves
    trail       0..1 strength of the dry-brush trails behind fast limbs (0 = off)
    width_gain  stroke width relative to the limb's measured width
    """
    params = dict(strokes=strokes, spacing=spacing, body=body, density=density, dry=dry, trail=trail,
                  width_gain=width_gain, thr=thr, seed=seed, v=10)
    out = Path(out) if out else clip.dir.with_name(clip.dir.name + '_brush')
    out = out if out.is_absolute() else ROOT / out
    sig = hashlib.blake2b(repr((clip.meta.get('sig'), sorted(params.items()))).encode(), digest_size=8).hexdigest()
    mf = out / 'meta.json'
    if mf.exists() and not force:
        try:
            if json.loads(mf.read_text()).get('sig') == sig:
                return Clip(out)
        except json.JSONDecodeError:
            pass
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    t0 = time.time()
    frames = _analyse(clip, thr, spacing, strokes, quiet)
    statics = (fbm(clip.h, clip.w, 70, seed, 'pool', octaves=4) , grain(clip.h, clip.w, seed, 'g', sigma=0.7))
    births = 0
    seen = set()
    for i, rec in enumerate(frames):
        T = _render_frame(clip, i, rec, statics, body, density, dry, trail, width_gain, seed)
        cv2.imwrite(str(out / f'f_{i:05d}.png'), to_u8(T)[..., ::-1], [cv2.IMWRITE_PNG_COMPRESSION, 3])
        for st in rec:
            if st['id'] not in seen:
                seen.add(st['id'])
                births += 1
        if not quiet and i % 24 == 0:
            print(f'  roto render {i}/{len(frames)}', flush=True)
    meta = dict(sig=sig, src=str(clip.dir), kind='ink', n=clip.n, fps=clip.fps, w=clip.w, h=clip.h,
                duration=clip.duration, params=params, stroke_births=births,
                strokes_per_frame=round(float(np.mean([len(r) for r in frames])), 2),
                prep_seconds=round(time.time() - t0, 2))
    mf.write_text(json.dumps(meta))
    (out / 'strokes.json').write_text(json.dumps(
        [[dict(id=s['id'], pts=np.round(s['pts'], 1).tolist(), speed=round(s['speed'], 2)) for s in r] for r in frames]))
    if not quiet:
        print(f'roto.redraw: {clip.dir.name} -> {out} ({clip.n} frames, {meta["prep_seconds"]} s, '
              f'{births} stroke births, {meta["strokes_per_frame"]} strokes/frame)')
    return Clip(out)


# --------------------------------------------------------------------------------------------------------------------
# tracking a point (the staff tip)

def track_point(clip, seed=None, mode='extreme', colour=None, raw=None, smooth=0.0, thin_w=14, despike=60.0):
    """Track one point through a prepared clip. Returns an (n, 3) float array of (src_t, x, y) in clip px.

    mode 'staff'    the end of a straight thin rod (line fit to the parts thinner than `thin_w`); `seed` picks the end
         'extreme'  the point of the silhouette farthest from the body's centre (a staff tip, a plume tip), kept on
                    the same end by continuity; `seed` (x, y) picks which end on the first frame. Only parts of
                    the figure thinner than `thin_w` px are considered (0 = the whole silhouette)
         'flow'     carry `seed` along the optical flow, re-settling on the nearest ink each frame
         'dark'     the densest ink near the last position (a blob of burnt ink on the tip)
         'colour'   nearest match to `colour` (r, g, b) in `raw`, a list/iterator of the source RGB frames
    despike: jumps of more than this many px off the local median path are bridged (0 = keep everything)
    smooth: seconds of Gaussian smoothing applied to the path afterwards (0 = none)
    """
    n = clip.n
    path = np.zeros((n, 3), F32)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    prev, vel, prev_g = None, np.zeros(2, F32), None
    raw_it = iter(raw) if raw is not None else None
    for i in range(n):
        d = clip.density(i)
        h, w = d.shape
        if mode == 'colour':
            fr = next(raw_it)
            fr = fr[1] if isinstance(fr, tuple) else fr
            score = -np.abs(fr - np.asarray(colour, F32)[None, None]).sum(axis=2)
        else:
            S = silhouette(d, 0.3)
            ys, xs = np.nonzero(S)
        if mode == 'extreme':
            if len(xs) == 0:
                p = prev if prev is not None else np.array([w / 2, h / 2], F32)
            else:
                dt = cv2.distanceTransform(S, cv2.DIST_L2, 3)
                wgt = dt[ys, xs] ** 2                             # the body's centre: weighted to the thick parts
                c = np.array([(xs * wgt).sum(), (ys * wgt).sum()]) / max(wgt.sum(), 1e-6)
                if thin_w:                                        # keep only the thin things (staff, plume)
                    k_ = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (thin_w | 1, thin_w | 1))
                    tm = S & (1 - cv2.dilate(cv2.morphologyEx(S, cv2.MORPH_OPEN, k_), np.ones((5, 5), np.uint8)))
                    ty, tx = np.nonzero(tm)
                    if len(tx) > 10:
                        ys, xs = ty, tx
                far = np.hypot(xs - c[0], ys - c[1])
                if prev is None:
                    ref = np.asarray(seed, F32) if seed is not None else None
                    sc = far if ref is None else far - 2.0 * np.hypot(xs - ref[0], ys - ref[1])
                else:
                    pred = prev + vel
                    sc = far - 1.6 * np.hypot(xs - pred[0], ys - pred[1])
                k = int(np.argmax(sc))
                p = np.array([xs[k], ys[k]], F32)
        elif mode == 'staff':
            # a rigid thin rod: fit a line to the thin parts; the tracked end keeps its side by continuity of the
            # rod's direction, so it survives the rod passing behind the body and the fastest spin
            k_ = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (thin_w | 1, thin_w | 1))
            tm = S & (1 - cv2.dilate(cv2.morphologyEx(S, cv2.MORPH_OPEN, k_), np.ones((5, 5), np.uint8)))
            ty, tx = np.nonzero(tm)
            if len(tx) < 12:
                p = prev + vel if prev is not None else np.asarray(seed if seed is not None else (w / 2, h / 2), F32)
            else:
                q = np.stack([tx, ty], 1).astype(np.float64)
                c = q.mean(axis=0)
                _, _, vt = np.linalg.svd(q - c, full_matrices=False)
                dvec = vt[0]
                pr_ = (q - c) @ dvec
                e1, e0 = c + dvec * np.percentile(pr_, 99.5), c + dvec * np.percentile(pr_, 0.5)
                if prev is None:
                    ref = np.asarray(seed, F32) if seed is not None else e1
                    flip = np.hypot(*(e0 - ref)) < np.hypot(*(e1 - ref))
                else:
                    flip = float(dvec @ staff_dir) < 0
                if flip:
                    dvec, e1 = -dvec, e0
                staff_dir = dvec
                p = e1.astype(F32)
        elif mode == 'flow':
            g = to_u8(blur(d, 2.0))
            if prev is None:
                p = np.asarray(seed, F32)
            else:
                fl = dis.calc(prev_g, g, None)
                x, y = int(np.clip(prev[0], 0, w - 1)), int(np.clip(prev[1], 0, h - 1))
                p = prev + np.median(fl[max(0, y - 3):y + 4, max(0, x - 3):x + 4].reshape(-1, 2), axis=0)
            prev_g = g
            if len(xs):
                k = int(np.argmin(np.hypot(xs - p[0], ys - p[1])))
                if np.hypot(xs[k] - p[0], ys[k] - p[1]) < 40:
                    p = np.array([xs[k], ys[k]], F32)
        elif mode in ('dark', 'colour'):
            sc = blur(d, 2.0) if mode == 'dark' else blur(score.astype(F32), 2.0)
            if prev is None and seed is None:
                k = int(np.argmax(sc))
                p = np.array([k % w, k // w], F32)
            else:
                ref = prev + vel if prev is not None else np.asarray(seed, F32)
                r = 90
                x0, y0 = int(max(0, ref[0] - r)), int(max(0, ref[1] - r))
                win = sc[y0:int(ref[1] + r), x0:int(ref[0] + r)]
                if win.size == 0:
                    p = prev
                else:
                    k = int(np.argmax(win))
                    p = np.array([x0 + k % win.shape[1], y0 + k // win.shape[1]], F32)
        else:
            raise ValueError(mode)
        if prev is not None:
            vel = 0.5 * vel + 0.5 * (p - prev)
        prev = p
        path[i] = (i / clip.fps, p[0], p[1])
    if despike and n >= 5:                                  # a lone jump (the tip hidden for a frame) is bridged
        med = np.stack([np.median(np.lib.stride_tricks.sliding_window_view(
            np.pad(path[:, c], 2, mode='edge'), 5), axis=1) for c in (1, 2)], 1)
        bad = np.hypot(path[:, 1] - med[:, 0], path[:, 2] - med[:, 1]) > despike
        if bad.any() and not bad.all():
            idx = np.arange(n)
            for c in (1, 2):
                path[bad, c] = np.interp(idx[bad], idx[~bad], path[~bad, c])
    if smooth > 0:
        s = smooth * clip.fps
        for c in (1, 2):
            path[:, c] = cv2.GaussianBlur(path[:, c].reshape(-1, 1), (1, 0), s, borderType=cv2.BORDER_REPLICATE)[:, 0]
    return path


class StaffTrail:
    """The staff is a brush: its tip leaves a dry-brush stroke that STAYS on the paper.

    path      (n, 3) rows of (src_t, x, y) in clip px (from track_point, or supplied keypoints)
    width     brush width in frame px at slow speed (fast passes thin out and go dry on their own)
    scale,pos the same placement as the clip's layer (frame = clip * scale + pos)
    paper     a Paper, so the dry brush catches the sheet's own grain
    t_in,t_out  only the part of the path between these source times is drawn
    chunk     the path is cut into overlapping strokes about this many px long, so a spin builds up as real
              overlapping passes (rings of 飞白) instead of one self-crossing outline
    density(src_t) / T(src_t, size) / lay(frame, src_t): the stroke as far as the tip has got by src_t.
    """

    def __init__(self, path, width=16.0, scale=1.0, pos=(0, 0), paper=None, seed=0, density=0.8, dry=0.5,
                 t_in=None, t_out=None, chunk=700.0, smooth=0.04, tint=None):
        p = np.asarray(path, np.float64)
        if t_in is not None:
            p = p[p[:, 0] >= t_in]
        if t_out is not None:
            p = p[p[:, 0] <= t_out]
        if len(p) < 3:
            raise ValueError('StaffTrail needs at least 3 path points')
        t = p[:, 0]
        xy = p[:, 1:3] * scale + np.asarray(pos, np.float64)[None]
        if smooth > 0:
            dtm = float(np.median(np.diff(t)))
            xy = cv2.GaussianBlur(xy, (1, 0), max(0.3, smooth / max(dtm, 1e-6)), borderType=cv2.BORDER_REPLICATE)
        seg = np.hypot(np.diff(xy[:, 0]), np.diff(xy[:, 1]))
        s = np.concatenate([[0], np.cumsum(seg)])
        self.t, self.s, self.L, self.tint = t, s, float(s[-1]), tint
        speed = np.concatenate([seg[:1], seg]) / np.maximum(np.gradient(t), 1e-6)       # px/s
        ref = max(float(np.percentile(speed, 60)), 1.0)
        rel = np.clip(speed / ref, 0.2, 3.0)
        self.parts = []                                         # (s_start, s_end, InkAnim)
        n_chunks = max(1, int(math.ceil(self.L / chunk)))
        ov = min(40.0, chunk * 0.08)
        for c in range(n_chunks):
            a, b = c * self.L / n_chunks, (c + 1) * self.L / n_chunks
            a2, b2 = max(0.0, a - ov), min(self.L, b + ov)
            m = max(4, int((b2 - a2) / 14))
            ss = np.linspace(a2, b2, m)
            px, py = np.interp(ss, s, xy[:, 0]), np.interp(ss, s, xy[:, 1])
            rl = np.interp(ss, s, rel)
            pr = np.clip(1.15 - 0.33 * (rl - 1.0), 0.45, 1.3)                          # fast = lighter touch
            pts = [(float(x), float(y), float(q)) for x, y, q in zip(px, py, pr)]
            rs = rl.copy()
            st = stroke(pts, width=width, seed=seed, paper=paper, density=density, dry=dry, dry_end=dry,
                        taper=(0.08 if c == 0 else 0.0, 0.10 if c == n_chunks - 1 else 0.0),
                        bleed=1.2, pad=width * 1.2 + 12, speed=lambda u, rs=rs: float(np.interp(u, np.linspace(0, 1, len(rs)), rs)))
            self.parts.append((a2, b2, st))

    def progress(self, src_t):
        """Arc length (px) the tip has drawn by source time src_t."""
        return float(np.interp(src_t, self.t, self.s))

    def lay(self, frame, src_t):
        """Multiply the trail drawn so far onto a frame in place."""
        sd = self.progress(src_t)
        for a, b, st in self.parts:
            if sd <= a:
                break
            p = (sd - a) / max(b - a, 1e-6)
            st.lay(frame, p if p < 1 else 2.0)
        return frame

    def T(self, src_t, size):
        return self.lay(np.ones((size[1], size[0], 3), F32), src_t)

    def density(self, src_t, size):
        return 1.0 - self.T(src_t, size).min(axis=2)


def main(argv=None):
    ap = argparse.ArgumentParser(prog='python -m tools.ink.roto')
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('redraw', help='brush-redraw a prepared clip store')
    p.add_argument('store')
    p.add_argument('--out')
    p.add_argument('--strokes', type=int, default=12)
    p.add_argument('--spacing', type=float, default=26.0)
    p.add_argument('--body', type=float, default=0.30)
    p.add_argument('--dry', type=float, default=0.22)
    p.add_argument('--trail', type=float, default=0.7)
    p.add_argument('--force', action='store_true')
    a = ap.parse_args(argv)
    c = redraw(Clip(a.store), a.out, a.strokes, a.spacing, a.body, dry=a.dry, trail=a.trail, force=a.force)
    print(c.dir)


if __name__ == '__main__':
    main()
