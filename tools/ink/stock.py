"""tools.ink.stock: stand-in art painted in code from brush strokes, for demos, tests and animatics before the real
plates exist. Nothing here is meant for the final film; it exists so every engine feature can be seen on something
that already behaves like an ink painting.

    T = brush_mountain(1600, 1200, seed=3, paper=paper)     # ink layer (transmittance), mountain rising from mist
    T = test_plate(1500, paper)                             # a museum test photo keyed, or brush_mountain if absent
"""
import math

import cv2
import numpy as np

from .core import F32, ROOT, INDIGO, OCHRE, blur, fbm, ink_T, load_image, place, resize, rng, smoothstep
from .ink import compose, stroke, wash


def _peak_profile(r, x0, x1, apex_x, apex_y, base_y, n=16, rough=0.10):
    """Skyline points of one peak from (x0, base) over the apex to (x1, base): cliffs, ledges and shoulders."""
    pts = []
    step = 0.0
    for i in range(n):
        u = i / (n - 1)
        x = x0 + (x1 - x0) * u + r.normal() * (x1 - x0) * 0.012
        d = abs(x - apex_x) / max(apex_x - x0 if x < apex_x else x1 - apex_x, 1)
        y = apex_y + (base_y - apex_y) * (min(d, 1.0) ** 1.5)
        if r.random() < 0.35:                                   # a ledge: the next stretch runs nearly level
            step = (base_y - apex_y) * rough * r.normal()
        y += step * (1 - d) + (base_y - apex_y) * 0.02 * r.normal()
        pts.append((x, float(min(max(y, apex_y), base_y))))
    return pts


def brush_mountain(w, h, seed=0, paper=None, peaks=3, density=0.9, colour=True, pine=True, fade=0.3):
    """A mountain in the Southern Song manner built from strokes: contour lines, axe-cut texture strokes (斧劈皴),
    pale washes for the volumes, moss dots, an optional pine; its foot dissolves into bare paper (mist).
    Fills the box (w, h); returns an ink layer HxWx3. Place it in a corner of a bigger sheet with core.place()."""
    r = rng(seed, 'mountain')
    k = min(w, h) / 1000.0
    T = np.ones((h, w, 3), F32)
    ph = None
    if paper is not None:
        ph = paper.height[:h, :w] if paper.height.shape[0] >= h and paper.height.shape[1] >= w else None

    class _P:                                         # minimal Paper stand-in so stroke() can granulate
        pass
    pp = None
    if ph is not None:
        pp = _P()
        pp.height = ph
    base_y = h * 0.93
    order = sorted(range(peaks), key=lambda i: -abs(i - (peaks - 1) / 2.0))        # far (outer) peaks first
    yy = np.arange(h, dtype=F32)[:, None]
    for n, i in enumerate(order):
        far = 1.0 - n / max(peaks - 1, 1)                                         # 1 = farthest
        cx = w * (0.22 + 0.56 * (i + 0.5) / peaks) + r.normal() * w * 0.03
        half = w * (0.20 + 0.10 * r.random()) * (1.0 + 0.2 * (1 - far))
        apex_y = h * (0.12 + 0.20 * far + 0.08 * r.random())
        prof = _peak_profile(r, cx - half, cx + half, cx + r.normal() * half * 0.15, apex_y, base_y)
        tone = density * (0.45 + 0.55 * (1 - far))
        # volume: a pale wash inside the silhouette, fading out toward the foot
        poly = np.array(prof + [(cx + half, base_y), (cx - half, base_y)], np.float32)
        m = np.zeros((h, w), F32)
        cv2.fillPoly(m, [np.round(poly * 8).astype(np.int32)], 1.0, cv2.LINE_AA, shift=3)
        foot = smoothstep(base_y - (base_y - apex_y) * fade * 0.4, apex_y + (base_y - apex_y) * (1 - fade) * 0.55, yy)
        body = m * foot
        # the far side of each peak is in shade: a second, darker wash on the right flank
        xx = np.arange(w, dtype=F32)[None, :]
        streak = cv2.resize(fbm(max(8, h // 5), w, 40 * k, seed, 'stk', i, octaves=3), (w, h), interpolation=cv2.INTER_CUBIC)
        shade = smoothstep(cx - half * 0.1, cx + half * 0.6, xx) * smoothstep(0.35, 0.65, streak) * (0.4 + 0.6 * fbm(h, w, 180 * k, seed, 'sh', i))
        T *= np.exp(-np.log(1 / 0.985) * 0)                                        # (no-op: keeps T float32)
        if n > 0:                                                                  # nearer peaks hide farther ones
            cover = blur(m * smoothstep(base_y, apex_y + (base_y - apex_y) * 0.45, yy), 3 * k)
            T = 1 - (1 - T) * (1 - 0.9 * cover[..., None])
        T *= ink_T(wash(body, ph, seed + 10 * i, 0.07 * tone, bleed=9 * k, edge=0.6, pool=0.9))
        T *= ink_T(wash(body * shade, ph, seed + 10 * i + 1, 0.30 * tone, bleed=12 * k, edge=0.3, pool=0.8))
        if colour:
            T *= ink_T(wash(body * (1 - shade) * smoothstep(0.4, 0.7, fbm(h, w, 220 * k, seed, 'oc', i)), ph,
                            seed + 10 * i + 2, 0.24 * tone, bleed=14 * k, edge=0.2), tint=OCHRE)
            T *= ink_T(wash(body * shade * smoothstep(0.45, 0.7, fbm(h, w, 260 * k, seed, 'in', i)), ph,
                            seed + 10 * i + 3, 0.18 * tone, bleed=14 * k, edge=0.2), tint=INDIGO)
        strokes = []
        # contour: two or three overlapping lines, heavier on the shaded side, breaking toward the foot
        # contour: broken lines that overlap, heavier and wetter on the shaded (right) side, dying toward the foot
        q = 0
        while q < len(prof) - 2:
            ln = int(r.integers(3, 6))
            seg = prof[q:q + ln + 1]
            if len(seg) < 3:
                break
            mid = sum(p[0] for p in seg) / len(seg)
            rightside = mid > cx
            low = float(smoothstep(apex_y + (base_y - apex_y) * 0.35, base_y, sum(p[1] for p in seg) / len(seg)))
            pts = [(x, y, 0.5 + 0.9 * r.random()) for x, y in seg]
            if not rightside:
                pts = pts[::-1]
            strokes.append(stroke(pts, width=(5 + 6 * (1 - far) + (4 if rightside else 0)) * k, seed=seed + 100 * i + q,
                                  paper=pp, dry=0.15 + 0.5 * low, dry_end=0.9, density=tone * (1 - 0.6 * low),
                                  bleed=1.2 * k, taper=(0.08, 0.35)))
            q += ln - (1 if r.random() < 0.7 else -1)
        # axe-cut texture strokes: short slanting dry strokes laid from ledges down the faces
        ns = int((60 + 60 * (1 - far)) * (half * 2 / w) * 2.2)
        face = math.radians(66 + 8 * r.normal())
        for j in range(ns):
            u = r.random()
            x = cx - half * 0.85 + u * half * 1.7
            d = abs(x - cx) / half
            ytop = apex_y + (base_y - apex_y) * d ** 1.35
            y = ytop + (base_y - ytop) * (0.03 + 0.55 * r.random() ** 1.5)
            ln = (30 + 90 * r.random()) * k
            ang = face + math.radians(9 * r.normal())
            if x < cx - half * 0.25:
                ang = math.pi - ang
            x2, y2 = x + math.cos(ang) * ln, y + math.sin(ang) * ln
            if y2 > base_y - (base_y - apex_y) * 0.12:
                continue
            fy = float(smoothstep(base_y - (base_y - apex_y) * 0.15, apex_y + (base_y - apex_y) * 0.4, y))
            strokes.append(stroke([(x, y, 1.2), ((x + x2) / 2 + r.normal() * 6 * k, (y + y2) / 2, 0.9), (x2, y2, 0.3)],
                                  width=(7 + 16 * r.random()) * k, seed=seed + 100 * i + 50 + j, paper=pp,
                                  dry=0.45 + 0.3 * r.random(), dry_end=1.0, bleed=1.0 * k,
                                  density=tone * (0.25 + 0.45 * r.random()) * (0.25 + 0.75 * fy), taper=(0.04, 0.5)))
        # moss dots along the ridge
        dots = np.zeros((h, w), F32)
        for j in range(int(26 * (1 - far) + 8)):
            q = r.integers(1, len(prof) - 1)
            x, y = prof[q][0] + r.normal() * half * 0.12, prof[q][1] + abs(r.normal()) * 16 * k
            cv2.ellipse(dots, ((float(x), float(y)), (float((5 + 6 * r.random()) * k), float((8 + 9 * r.random()) * k)),
                               float(r.uniform(-25, 25))), 1.0, -1, cv2.LINE_AA)
        T *= ink_T(compose(strokes, (w, h)))
        T *= ink_T(wash(dots, ph, seed + 7 + i, tone, bleed=1.5 * k, edge=0.3, pool=0.3))
    if pine:
        T *= ink_T(brush_pine(w, h, (w * 0.5 + r.normal() * w * 0.08, h * 0.60), 150 * k, seed + 5, pp))
    return np.clip(T, 0, 1).astype(F32)


def brush_pine(w, h, root, size, seed=0, paper=None):
    """A twisted pine in a dozen strokes: density map (HxW)."""
    r = rng(seed, 'pine')
    x, y = root
    trunk = [(x, y, 1.2), (x + size * 0.12, y - size * 0.35, 1.0), (x - size * 0.05, y - size * 0.7, 0.8),
             (x + size * 0.18, y - size * 1.0, 0.5)]
    st = [stroke(trunk, width=size * 0.11, seed=seed, paper=paper, dry=0.3, dry_end=0.8, bleed=1.2)]
    for i in range(4):
        u = 0.35 + 0.2 * i
        bx = x + size * (0.12 if i % 2 else -0.02) * (1 + 0.3 * r.normal())
        by = y - size * u
        s = 1 if i % 2 else -1
        tip = (bx + s * size * (0.5 + 0.25 * r.random()), by - size * (0.02 + 0.1 * r.random()))
        st.append(stroke([(bx, by, 1.0), ((bx + tip[0]) / 2, by - size * 0.1, 0.8), (tip[0], tip[1], 0.4)],
                         width=size * 0.045, seed=seed + 1 + i, paper=paper, dry=0.4, dry_end=0.9, bleed=1.0))
        for j in range(5):                                      # needle clusters: flat fans of short dabs
            px = bx + (tip[0] - bx) * (0.35 + 0.16 * j)
            py = by + (tip[1] - by) * (0.35 + 0.16 * j) - size * 0.05
            st.append(stroke([(px - size * 0.11, py + size * 0.015 * r.normal(), 0.5), (px, py - size * 0.03, 1.1),
                              (px + size * 0.11, py + size * 0.015 * r.normal(), 0.5)], width=size * 0.07,
                             seed=seed + 20 + i * 7 + j, paper=paper, dry=0.5, dry_end=0.75, density=0.8, bleed=1.0))
    return compose(st, (w, h))


def test_plate(width, paper=None, seed=0):
    """A plate to test with: the Ma Yuan test photograph keyed (if refs/paintings is present on this machine),
    otherwise a brush_mountain. Returns an ink layer `width` px wide."""
    from .paper import key_paper
    f = ROOT / 'refs/paintings/blocking/06_ma_yuan_walking_mountain_path_spring.jpg'
    if f.exists():
        a = load_image(f)[190:1180, 30:1790]
        a = resize(a, width, int(a.shape[0] * width / a.shape[1]))
        return key_paper(a, gain=1.3)
    return brush_mountain(width, int(width * 0.62), seed=seed, paper=paper)
