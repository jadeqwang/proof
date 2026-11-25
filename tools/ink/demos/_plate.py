"""Shared synthetic picture content for the demos (stands in for generated plates)."""
import cv2
import numpy as np

from tools.ink import *


def mountain_page(paper, seed=0, gold=True, colour=True):
    """A small ink landscape on `paper` with one gold band and touches of colour. Returns an opaque frame."""
    W, H = paper.w, paper.h
    f = paper.frame()
    r = rng(seed, 'plate')
    # washes: three receding hills
    for i, (y, amp, den) in enumerate([(0.52, 0.10, 0.14), (0.62, 0.14, 0.30), (0.74, 0.18, 0.62)]):
        n = fbm(1, W, 520 - 120 * i, seed, 'hill', i, octaves=5, gain=0.55)[0]
        sky = (y - amp * (n - 0.35) * 2) * H
        yy = np.arange(H, dtype=np.float32)[:, None]
        below = yy - sky[None, :]
        m = smoothstep(0, 2, below) * smoothstep(amp * H * 1.5, amp * H * 0.15, below)
        m *= smoothstep(0.0, 0.25, np.linspace(0, 1, W, dtype=np.float32))[None, :] ** 0.7 if i == 2 else 1.0
        tint = INDIGO if (colour and i == 0) else (OCHRE if (colour and i == 1) else None)
        f *= ink_T(wash(m, paper.height, seed + i, den, bleed=6, edge=0.45), tint=tint)
        if i == 2:
            for k in range(26):                               # texture strokes on the near hill
                x = r.uniform(0.1, 0.98) * W
                y0 = sky[int(x)] + r.uniform(5, 60)
                st = stroke([(x, y0), (x + r.uniform(-30, 30), y0 + r.uniform(60, 190))], width=r.uniform(8, 22),
                            seed=seed + 100 + k, paper=paper, dry=0.5, dry_end=1.0, density=0.8)
                st.lay(f, 2)
    st = stroke([(W * 0.10, H * 0.33, 0.7), (W * 0.34, H * 0.25, 1.1), (W * 0.62, H * 0.31, 0.9), (W * 0.9, H * 0.24, 0.4)],
                width=44, seed=seed + 7, paper=paper, dry=0.4, dry_end=1.0)
    st.lay(f, 2)
    cv = np.zeros((H, W), np.float32)
    cv2.circle(cv, (int(W * 0.80), int(H * 0.40)), int(H * 0.035), 1.0, -1, cv2.LINE_AA)
    f *= ink_T(wash(cv, paper.height, seed + 30, 0.9, bleed=3), tint=CINNABAR)
    if gold:                                                  # the band: an opaque gold ring, slightly uneven
        g = np.zeros((H, W), np.float32)
        cv2.ellipse(g, (int(W * 0.47), int(H * 0.535)), (int(H * 0.085), int(H * 0.03)), -6, 0, 360, 1.0,
                    max(3, int(H * 0.011)), cv2.LINE_AA)
        g = rough_mask(g, 1.5, 9, seed, 'gold') * (0.82 + 0.3 * (fbm(H, W, 30, seed, 'gl') - 0.5))
        col = GOLD[None, None] * (0.9 + 0.25 * (paper.height - 0.5))[..., None]
        f = f * (1 - g[..., None]) + col * g[..., None]
    return np.clip(f, 0, 1).astype(np.float32)
