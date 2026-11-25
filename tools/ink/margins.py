"""tools.ink.margins: the paper margins that close in (verse 3: the filter closing), and greys-except-gold.

    M = Margins(Paper(1920, 1080, 'new', seed=8), seed=3)
    frame = M.apply(frame, t, cues=[121.0, 124.1, 127.3], target=(260, 460, 1660, 622))    # steps in on each cue
    # or by hand:
    frame = desaturate(frame, 0.8, protect_hue=(30, 58), paper=PAPER_NEW)
    frame = M.lay(frame, rect=(200, 300, 1700, 800))
"""
import math

import cv2
import numpy as np

from .core import F32, blur, ease, fbm, hsv_of, luma, rng, smoothstep, value_noise


def desaturate(frame, amount, protect_hue=(28.0, 60.0), protect_sat=(0.30, 0.50), soft=10.0, paper=None):
    """Drain a frame to greys, except a protected hue range (default: gold). No fringing: the key is soft in hue and
    in saturation and is slightly blurred, so a gold stroke keeps its own edge pixels.

    amount        0..1 (1 = fully grey outside the protected range)
    protect_hue   (lo, hi) degrees on the 0..360 hue wheel
    protect_sat   (lo, hi): saturation ramp of the key: cream paper (sat ~0.1) is NOT protected, gold (sat > 0.5) is
    soft          degrees of hue feather on each side
    paper         an RGB colour: greys are tinted to this paper's cast, so bare paper stays the same sheet instead
                  of turning cement (pass the Paper's .ground or core.PAPER_NEW). None = neutral grey.
    """
    if amount <= 0:
        return frame
    hsv = hsv_of(frame)
    h, s = hsv[..., 0], hsv[..., 1]
    lo, hi = protect_hue
    k = smoothstep(lo - soft, lo, h) * smoothstep(hi + soft, hi, h) * smoothstep(protect_sat[0], protect_sat[1], s)
    k = np.maximum(k, blur(k, 1.2) * 0.999)                      # hold the key over anti-aliased edges
    g = luma(frame)[..., None]
    if paper is not None:
        p = np.asarray(paper, F32)
        g = g * (p / max(float(p @ np.array([0.2126, 0.7152, 0.0722], F32)), 1e-3))[None, None]
    w = (amount * (1.0 - np.clip(k, 0, 1)))[..., None]
    return (frame + (g - frame) * w).astype(F32)


def step_rect(t, cues, target, full, slide=0.125, kind='out', steps=None):
    """The picture rectangle at time t: starts at `full`, moves one step toward `target` on each cue (eased slide of
    `slide` seconds, then a hold). Returns ((x0, y0, x1, y1), progress 0..1)."""
    cues = sorted(cues)
    n = steps or max(1, len(cues))
    p = 0.0
    for i, c in enumerate(cues[:n]):
        if t >= c:
            p = i + ease((t - c) / max(slide, 1e-6), kind)
    u = min(1.0, p / n)
    return tuple(a + (b - a) * u for a, b in zip(full, target)), u


class Margins:
    """Four sheets of real paper laid over the picture, leaving a window. Each sheet edge is a soft torn/deckled
    edge (irregular, fibrous) with the paper's thickness showing as a pale lip and a small contact shadow on the
    picture underneath. Build once; apply per frame (~55 ms at 1080p).

    paper     a Paper of the frame size (use a different seed from the picture's sheet)
    rough     px of edge irregularity; shadow: contact-shadow strength 0..1; shadow_px: its reach
    light     direction the room light comes from, degrees (default from upper left): shadows fall away from it
    """

    def __init__(self, paper, seed=0, rough=5.0, shadow=0.30, shadow_px=9.0, light=225.0):
        self.paper, self.seed, self.rough, self.shadow, self.shadow_px = paper, seed, rough, shadow, shadow_px
        H, W = paper.rgb.shape[:2]
        self.W, self.H = W, H
        self.yy, self.xx = np.mgrid[0:H, 0:W].astype(F32)

        def prof(n, key):                                        # an edge profile: slow wander + torn nicks
            a = value_noise(1, n, 260, seed, 'e1', key)[0] - 0.5
            b = value_noise(1, n, 34, seed, 'e2', key)[0] - 0.5
            c = value_noise(1, n, 5, seed, 'e3', key)[0] - 0.5
            return (a * 1.6 + b * 0.9 + c * 0.35) * rough
        self.pL, self.pR = prof(H, 'L')[:, None], prof(H, 'R')[:, None]
        self.pT, self.pB = prof(W, 'T')[None, :], prof(W, 'B')[None, :]
        self.fuzz = (fbm(H, W, 6, seed, 'fz', octaves=3) - 0.5) * 2.6        # loose fibres along the tear
        a = math.radians(light)
        self.off = (-math.cos(a) * shadow_px * 0.45, -math.sin(a) * shadow_px * 0.45)   # shadow falls away from light

    def lay(self, frame, rect):
        """Cover everything outside rect=(x0, y0, x1, y1) with the margin sheets. Returns a new frame."""
        x0, y0, x1, y1 = rect
        xx, yy, fz = self.xx, self.yy, self.fuzz
        dL, dR = xx - (x0 + self.pL) + fz, (x1 + self.pR) - xx + fz
        dT, dB = yy - (y0 + self.pT) + fz, (y1 + self.pB) - yy + fz
        d_lr = np.minimum(dL, dR)                                 # signed distance inside the window, per pair
        d_tb = np.minimum(dT, dB)
        d = np.minimum(d_lr, d_tb)
        a_lr = smoothstep(1.2, -1.2, d_lr)                        # sheet coverage (1 = margin paper)
        a_tb = smoothstep(1.2, -1.2, d_tb)
        a = np.maximum(a_lr, a_tb)
        out = frame.astype(F32, copy=True)
        if self.shadow > 0:
            sh = blur(a, self.shadow_px * 0.5)
            M = np.float32([[1, 0, self.off[0]], [0, 1, self.off[1]]])
            sh = cv2.warpAffine(sh, M, (self.W, self.H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            tight = smoothstep(2.5, 0.0, d) * (1 - a)             # the dark line right under the lip
            out *= (1.0 - self.shadow * (sh * 0.85 + tight * 0.5))[..., None] ** np.array([1.0, 1.03, 1.08], F32)
        pap = self.paper.rgb
        # the top and bottom sheets lie over the side sheets: a faint shadow on the side sheets at the overlap
        lap = smoothstep(self.shadow_px * 1.6, 0.0, d_tb) * a_lr * (1 - a_tb)
        lip = smoothstep(-5.0, -0.5, d) * a                       # torn edge: paler, fluffier
        m = pap * (1.0 - 0.16 * self.shadow / 0.3 * lap)[..., None] + (lip * 0.030)[..., None]
        out = out * (1 - a[..., None]) + m * a[..., None]
        return np.clip(out, 0, 1, out=out)

    def apply(self, frame, t, cues, target, full=None, slide=0.125, desat=1.0, protect_hue=(28.0, 60.0),
              paper_tint=True, steps=None):
        """The whole verse-3 move: step the margins in on each cue and drain the picture to greys (gold kept) in
        proportion. target: the final picture rect (a strip about 15% of the frame). full: the starting rect
        (default: a little outside the frame, so no margin shows before the first cue). desat: grey amount reached
        at the last step."""
        full = full or (-30.0, -30.0, self.W + 30.0, self.H + 30.0)
        rect, u = step_rect(t, cues, target, full, slide, steps=steps)
        if desat > 0 and u > 0:
            frame = desaturate(frame, desat * u, protect_hue, paper=self.paper.ground if paper_tint else None)
        if u <= 0:
            return frame
        return self.lay(frame, rect)


def margins(frame, t, cues, paper, target, seed=0, **kw):
    """One-call form (rebuilds the edge profiles each call: prefer a Margins object built in setup())."""
    return Margins(paper, seed).apply(frame, t, cues, target, **kw)
