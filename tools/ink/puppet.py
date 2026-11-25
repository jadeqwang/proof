"""tools.ink.puppet: the shadow screen 皮影 and the trotting-horse lantern 走马灯.

    pup = monkey_puppet(seed=1)                                   # or Puppet([Part(...), ...])
    pose = pose_at(t, cues, [POSES['guard'], POSES['strike'], POSES['crouch']])     # hard cuts, no in-betweens
    T = pup.render(pose, pos=(960, 560), scale=1.0, size=(1920, 1080))              # transmittance of the hide
    frame = shadow_screen(paper.rgb, [T], light_pos=(x_of_t, 420), radius=700, lift=0.06)
    frame = lantern(strip, t, rpm=9, size=(1920, 1080))           # strip: N figure frames as one HxWx3 transmittance
"""
import math

import cv2
import numpy as np

from .core import F32, blur, fbm, grain, place, rng, rough_mask, smoothstep, value_noise

# dyes of donkey-hide puppets: saturated but dirty, seen by transmitted light (values = transmittance at full dye)
HIDE = np.array([0.93, 0.80, 0.56], F32)             # scraped, oiled hide with no dye: translucent amber
DYE_RED = np.array([0.78, 0.17, 0.11], F32)
DYE_GREEN = np.array([0.30, 0.50, 0.26], F32)
DYE_OCHRE = np.array([0.86, 0.60, 0.20], F32)
DYE_BLACK = np.array([0.13, 0.11, 0.10], F32)
DYE_INDIGO = np.array([0.22, 0.30, 0.48], F32)
LAMP = np.array([1.00, 0.86, 0.60], F32)             # oil lamp / sodium streetlight through paper


class Part:
    """One piece of hide. mask: HxW (1 = hide; holes cut in it are 0). dye: transmittance colour.
    pivot: (x, y) in the part's own px: the pin that joins it to its parent. parent: name or None (the root).
    attach: (x, y) in the PARENT's px where the pin goes through. z: draw order (only matters for pins/outline).
    rest: degrees added to every pose angle."""

    def __init__(self, name, mask, dye=DYE_RED, pivot=(0, 0), parent=None, attach=(0, 0), z=0, rest=0.0, seed=0,
                 outline=2.2, pattern=None):
        self.name, self.pivot, self.parent, self.attach, self.z, self.rest = name, pivot, parent, attach, z, rest
        self.mask = mask.astype(F32)
        self.T = leather(self.mask, dye, seed, outline, pattern)


def leather(mask, dye, seed=0, outline=2.2, pattern=None):
    """The look of a dyed, scraped, oiled hide against the light: transmittance HxWx3 (1 where there is no hide).
    Uneven dye, thicker (darker) patches, a dark cut edge, knife-cut pattern lines (`pattern`: HxW, 1 = engraved
    line that was cut right through, so it shows the bare light)."""
    h, w = mask.shape
    m = mask
    thick = 1.15 + 0.6 * (fbm(h, w, max(8.0, min(h, w) / 3.0), seed, 'thick', octaves=3) - 0.5)
    spot = 1.0 + 0.10 * grain(h, w, seed, 'pore', sigma=0.8)
    dens = np.clip(thick * spot, 0.5, 2.0)[..., None]
    T = np.power(np.asarray(dye, F32)[None, None] * HIDE[None, None] ** 0.6, dens)
    if outline > 0:                                              # cut edges are burnished dark and catch no light
        edge = np.clip(m - cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * int(outline) + 1,) * 2)), 0, 1)
        edge = blur(edge, 0.7)
        T = T * (1 - 0.85 * edge[..., None])
    a = m[..., None]
    if pattern is not None:
        a = a * (1 - np.clip(pattern, 0, 1)[..., None] * 0.93)
    return (1 - a * (1 - T)).astype(F32)


def _rot(a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    return np.array([[c, s, 0], [-s, c, 0], [0, 0, 1]], np.float64)     # +angle swings a hanging limb toward +x


def _tr(x, y):
    return np.array([[1, 0, x], [0, 1, y], [0, 0, 1]], np.float64)


class Puppet:
    """A jointed figure: parts pinned to parents. A pose is {part_name: degrees} (missing = 0), plus optional
    '_x', '_y' (root offset, px at scale 1), '_rot' (whole-figure lean), '_flip' (face the other way)."""

    def __init__(self, parts, reach=None):
        self.parts = {p.name: p for p in parts}
        self.order = sorted(parts, key=lambda p: p.z)
        self.root = next(p for p in parts if p.parent is None)
        self.reach = reach or int(sum(max(p.mask.shape) for p in parts) * 0.62)

    def matrices(self, pose):
        """3x3 part->figure matrices (figure origin = the root part's pivot)."""
        M = {}

        def get(p):
            if p.name in M:
                return M[p.name]
            a = pose.get(p.name, 0.0) + p.rest
            local = _rot(a) @ _tr(-p.pivot[0], -p.pivot[1])
            if p.parent is None:
                m = _tr(pose.get('_x', 0.0), pose.get('_y', 0.0)) @ _rot(pose.get('_rot', 0.0)) @ local
            else:
                par = self.parts[p.parent]
                m = get(par) @ _tr(*p.attach) @ local
            M[p.name] = m
            return m
        for p in self.order:
            get(p)
        return M

    def render(self, pose, pos=(0, 0), scale=1.0, size=None, swaps=None, pins=True, rods=None, soft=0.0):
        """Transmittance layer (HxWx3) of the puppet in `pose`, its root pin at `pos`.

        swaps   {part_name: Part}: use another part in that slot this frame (七十二变: a new head on every beat)
        pins    draw the knotted thread at each joint
        rods    list of (part_name, (x, y) in that part) where control rods are tied; drawn as thin dark sticks
                running down out of frame, softer than the puppet (they stand off the screen)
        soft    blur px (a puppet held off the screen)
        size    (W, H) of the frame; None returns (T, (x0, y0)) for the puppet's own box
        """
        swaps = swaps or {}
        flip = bool(pose.get('_flip', False))
        R = int(self.reach * scale) + 8
        S = 2 * R
        base = _tr(R, R) @ np.diag([-scale if flip else scale, scale, 1.0])
        M = self.matrices(pose)
        T = np.ones((S, S, 3), F32)
        pinl = []
        for p in self.order:
            q = swaps.get(p.name, p)
            A = (base @ M[p.name])[:2]
            t = cv2.warpAffine(q.T, A, (S, S), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
                               borderValue=(1, 1, 1))
            T *= t                                               # two hides overlapping pass less light
            if p.parent is not None:
                c = base @ M[p.name] @ np.array([p.pivot[0], p.pivot[1], 1.0])
                pinl.append((c[0], c[1]))
        if pins:
            pm = np.zeros((S, S), F32)
            for x, y in pinl:
                cv2.circle(pm, (int(round(x * 8)), int(round(y * 8))), int(max(1.4, 2.0 * scale) * 8), 1.0, -1,
                           cv2.LINE_AA, shift=3)
            T *= (1 - 0.8 * pm)[..., None]
        if rods:
            rm = np.zeros((S, S), F32)
            for name, (rx, ry) in rods:
                c = base @ M[name] @ np.array([rx, ry, 1.0])
                x1 = c[0] + (c[0] - R) * 0.25
                cv2.line(rm, (int(c[0]), int(c[1])), (int(x1), S + 40), 1.0, max(2, int(4 * scale)), cv2.LINE_AA)
            T *= (1 - 0.5 * blur(rm, 2.5 * scale))[..., None]
        if soft > 0.2:
            T = blur(T, soft)
        x0, y0 = int(round(pos[0])) - R, int(round(pos[1])) - R
        if size is None:
            return T, (x0, y0)
        return place(T, size[0], size[1], x0, y0)


def pose_at(t, cues, poses, start=0, before=None):
    """Hard re-posing: the pose changes ON each cue and holds, with no in-betweens. Returns poses[(k + start) %
    len(poses)] where k is the number of cues at or before t (before the first cue: `before` or poses[start])."""
    k = sum(1 for c in cues if c <= t)
    if k == 0 and before is not None:
        return before
    return poses[(k + start) % len(poses)]


def cue_index(t, cues):
    """How many cues have passed at time t (for choosing head swaps etc.)."""
    return sum(1 for c in cues if c <= t)


# --------------------------------------------------------------------------------------------------------------------
# the screen

def shadow_screen(screen, layers, light_pos, radius=700.0, lift=0.05, ambient=0.05, lamp=LAMP, gain=1.0, t=0.0,
                  soft=None, stretch=1.0, flicker=0.0, seed=0):
    """A back-lit paper (or glass) screen with puppets against it.

    screen     HxWx3 surface the light comes through (a Paper's .rgb; a dusk window plate)
    layers     list of puppet transmittance layers (HxWx3), or (T, lift) tuples to give one its own lift
    light_pos  (x, y) of the lamp behind the screen, frame px (callable of t allowed): a hot spot with falloff.
               Sweep it across the frame for a passing streetlight: figures exist only while it lights them
    lift       how far the puppet stands off the screen (0 = pressed flat). Its shadow is magnified away from the
               lamp by (1 + lift), so it shears and stretches as the lamp passes, and softens with lift
    ambient    level of the unlit screen (dusk); lamp: colour of the light
    flicker    0..1 slow deterministic flame flicker
    """
    H, W = screen.shape[:2]
    lx, ly = light_pos(t) if callable(light_pos) else light_pos
    yy, xx = np.mgrid[0:H, 0:W].astype(F32) if (H, W) not in _G else _G[(H, W)]
    _G[(H, W)] = (yy, xx)
    r = np.hypot((xx - lx) / stretch, yy - ly) / radius
    I = 0.62 * np.exp(-(r / 0.62) ** 2) + 0.38 / (1.0 + (r / 0.9) ** 2) ** 2
    I += 0.10 * np.exp(-(r / 0.10) ** 2)                         # the flame itself, dimly seen through the paper
    if flicker > 0:
        I = I * (1 + flicker * (0.05 * math.sin(t * 9.1 + seed) + 0.035 * math.sin(t * 14.7 + 2 * seed)
                                + 0.03 * math.sin(t * 3.3)))
    light = (I * gain)[..., None] * np.asarray(lamp, F32)[None, None] + ambient * np.array([0.6, 0.7, 1.0], F32)
    out = screen.astype(F32) * light
    for L in layers:
        T, lf = L if isinstance(L, tuple) else (L, lift)
        if lf > 1e-4:
            k = 1.0 + lf
            M = np.float32([[k, 0, lx * (1 - k)], [0, k, ly * (1 - k)]])
            T = cv2.warpAffine(T, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
                               borderValue=(1, 1, 1))
            sg = (soft if soft is not None else 26.0 * lf)
            if sg > 0.25:
                T = blur(T, sg)
        elif soft:
            T = blur(T, soft)
        # paper scatters a little light sideways into the shadow, so it is never dead black
        out *= (0.045 + 0.955 * T)
    return np.clip(out, 0, 0.985, out=out)


_G = {}


# --------------------------------------------------------------------------------------------------------------------
# the trotting-horse lantern

def lantern(strip, t, rpm=8.0, size=(1920, 1080), rect=None, ground=None, ribs=8, seed=0, soft=3.0, flicker=1.0,
            back=0.22, lamp=LAMP, paper=None, direction=1.0):
    """走马灯: figures on a wheel turning inside a lit paper drum; their shadows cross the shell and come round again.

    strip    the wheel: an HxWx3 transmittance image whose width is one full turn (N figure frames side by side;
             use lantern_strip()). It wraps seamlessly.
    rpm      turns per minute (direction -1 turns the other way)
    rect     (x0, y0, x1, y1) of the drum in the frame (default: centred, 46% of the width)
    ground   HxWx3 frame around the drum (default: a dark night ground); paper: HxWx3 texture of the shell
    ribs     bamboo ribs of the shell (static; the wheel turns inside them)
    back     how strongly the figures on the far side of the wheel show through (fainter, reversed, softer)
    """
    W, H = size
    key = (W, H, rect, seed, ribs)
    if key not in _LC:
        _LC.clear()
        _LC[key] = _lantern_static(W, H, rect, seed, ribs, paper)
    st = _LC[key]
    x0, y0, x1, y1 = st['rect']
    dw, dh = x1 - x0, y1 - y0
    sh, sw = strip.shape[:2]
    rot = direction * t * rpm / 60.0                              # turns
    th = st['theta']                                              # dh x dw: angle of each shell pixel, -pi/2..pi/2
    u = ((th / (2 * math.pi) + rot) % 1.0) * sw
    v = st['v'] * (sh - 1)
    front = cv2.remap(strip, u.astype(F32), v.astype(F32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
    ub = (((math.pi - th) / (2 * math.pi) + rot) % 1.0) * sw
    backT = cv2.remap(strip, ub.astype(F32), v.astype(F32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
    front = blur(front, soft)
    backT = blur(backT, soft * 3.0)
    fl = 1.0
    if flicker > 0:
        fl = 1 + flicker * (0.035 * math.sin(t * 8.3 + seed) + 0.025 * math.sin(t * 13.1 + 1.7) + 0.03 * math.sin(t * 2.9))
    light = st['light'] * fl
    shell = st['paper'] * light * (0.06 + 0.94 * front) * (1 - back * (1 - backT))
    shell = shell * st['ribs']
    out = (ground if ground is not None else st['ground']).astype(F32).copy()
    # warm spill of the lantern on its surroundings, then the drum itself
    out = out * (1.0 + st['spill'][..., None] * fl * np.asarray(lamp, F32)[None, None] * 5.0)
    a = st['alpha'][..., None]
    out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - a) + shell * a
    return np.clip(out, 0, 0.985, out=out)


_LC = {}


def _lantern_static(W, H, rect, seed, ribs, paper, bow=0.035):
    from .paper import Paper
    if rect is None:
        dw, dh = int(W * 0.30), int(H * 0.72)
        rect = ((W - dw) // 2, (H - dh) // 2, (W + dw) // 2, (H + dh) // 2)
    x0, y0, x1, y1 = rect
    dw, dh = x1 - x0, y1 - y0
    xs = (np.arange(dw, dtype=F32) + 0.5) / dw * 2 - 1           # -1..1 across the drum
    xs = np.clip(xs, -0.9995, 0.9995)
    th1 = np.arcsin(xs)
    theta = np.repeat(th1[None, :], dh, 0)
    vv = np.repeat(((np.arange(dh, dtype=F32) + 0.5) / dh)[:, None], dw, 1)
    cosv = np.cos(theta)
    # the shell: brightest where it faces us and near the flame's height; the paper passes less light at a slant
    yn = vv * 2 - 1
    light = (0.10 + 0.90 * cosv ** 1.5) * (0.50 + 0.50 * np.exp(-((yn - 0.25) / 0.7) ** 2))
    light = light[..., None] * LAMP[None, None] * 0.98
    if paper is None:
        paper = Paper(dw, dh, 'new', seed=seed + 5, scale=1.3).rgb
    # paper texture wrapped on the cylinder (compressed toward the edges)
    px = ((theta / math.pi + 0.5) * (dw - 1)).astype(F32)
    ptex = cv2.remap(np.ascontiguousarray(paper), px, (vv * (dh - 1)).astype(F32), cv2.INTER_LINEAR)
    ptex = ptex / np.maximum(ptex.max(axis=(0, 1), keepdims=True), 1e-3)
    ptex = blur(ptex, 0.8) ** 1.6                                           # transmitted light shows fibres more than reflected
    rb = np.ones((dh, dw), F32)
    for k in range(ribs):                                        # static bamboo ribs, front half
        a = -math.pi / 2 + (k + 0.5) * math.pi / ribs
        wob = (value_noise(dh, 1, 160, seed, 'rib', k)[:, 0] - 0.5) * 0.012
        d = np.abs(theta - a - wob[:, None]) * (dw / 2) * cosv   # px distance on screen
        rb *= 1 - (0.50 + 0.2 * value_noise(dh, 1, 60, seed, 'ribd', k)) * np.exp(-(d / 3.6) ** 4)
    # hoops are ellipse arcs: the drum is seen from a little above, so both front rims sag at the centre
    rim = np.minimum(vv * dh - bow * dh * cosv, dh - bow * dh * (1 - cosv) - vv * dh)
    rb *= 1 - 0.8 * smoothstep(dh * 0.035, dh * 0.018, rim)      # top and bottom hoops (wood)
    rb *= 1 - 0.25 * np.exp(-((rim - dh * 0.045) / 3.0) ** 2)
    edge = smoothstep(0.0, 0.035, 1 - np.abs(xs))[None, :]
    alpha = (edge * np.ones((dh, 1), F32)).astype(F32)
    alpha = np.minimum(alpha, smoothstep(0, 2.0, rim))
    rb = rb[..., None] * np.array([1.0, 0.93, 0.80], F32)[None, None] ** ((1 - rb[..., None]) * 2)
    ground = Paper(W, H, 'night', seed=seed + 9).rgb
    yy, xx = np.mgrid[0:H, 0:W].astype(F32)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    d = np.hypot((xx - cx) / (dw * 0.9), (yy - cy) / (dh * 0.9))
    spill = 0.9 / (1 + (d / 0.7) ** 2) ** 2.2
    return dict(rect=rect, theta=theta, v=vv, light=light.astype(F32), paper=ptex.astype(F32), ribs=rb,
                alpha=alpha, ground=ground, spill=spill.astype(F32))


def lantern_strip(frames, gap=0.25, height=None):
    """Join N figure layers (HxWx3 transmittance, same size) into one wheel strip with `gap` (fraction of a frame
    width) of clear space between figures."""
    h, w = frames[0].shape[:2]
    g = int(w * gap)
    out = np.ones((h, (w + g) * len(frames), 3), F32)
    for i, f in enumerate(frames):
        out[:, i * (w + g):i * (w + g) + w] = f
    if height and height != h:
        out = cv2.resize(out, (int(out.shape[1] * height / h), height), interpolation=cv2.INTER_AREA)
    return out


# --------------------------------------------------------------------------------------------------------------------
# a demo puppet: the monkey with his staff, cut from simple shapes with hand-cut edges

def _shape(w, h, draw, seed, rough=1.6):
    m = np.zeros((h, w), F32)
    draw(m)
    m = rough_mask(m, rough, 14, seed, 'cut')
    return np.clip(blur(m, 0.6), 0, 1)


def _cuts(w, h, draw, seed):
    """Knife-cut decoration: thin lines / small crescents cut through the hide."""
    m = np.zeros((h, w), F32)
    draw(m)
    return np.clip(blur(rough_mask(m, 0.8, 8, seed, 'pat'), 0.5), 0, 1)


def monkey_puppet(seed=0):
    """A procedural 皮影 monkey (profile, facing +x) with a staff. Returns a Puppet about 560 px tall at scale 1.
    Parts: torso (root), head, tail, arm_f/forearm_f (front, holds 'staff'), arm_b/forearm_b, thigh_f/shin_f,
    thigh_b/shin_b. See POSES for ready poses and monkey_heads() for swap heads."""
    AA = cv2.LINE_AA
    P = []

    def limb(name, w, h, dye, parent, attach, z, sd, hand=None, pat=True):
        def d(m):
            cv2.ellipse(m, (w // 2, 16), (w // 2 - 4, 14), 0, 0, 360, 1.0, -1, AA)
            cv2.fillPoly(m, [np.array([[5, 16], [w - 5, 16], [w - 10, h - 14], [10, h - 14]], np.int32)], 1.0, AA)
            cv2.ellipse(m, (w // 2, h - 16), (w // 2 - 9, 12), 0, 0, 360, 1.0, -1, AA)
            if hand == 'hand':
                cv2.ellipse(m, (w // 2 + 4, h - 12), (15, 11), 20, 0, 360, 1.0, -1, AA)
            if hand == 'foot':
                cv2.ellipse(m, (w // 2 + 16, h - 10), (26, 9), 0, 0, 360, 1.0, -1, AA)

        def c(m):
            for y in range(34, h - 30, 13):
                cv2.ellipse(m, (w // 2, y), (w // 2 - 12, 5), 0, 20, 160, 1.0, 2, AA)
        ww = w + (40 if hand == 'foot' else 10)
        mask = _shape(ww, h, d, seed + sd)
        P.append(Part(name, mask, dye, (w // 2, 16), parent, attach, z, seed=seed + sd,
                      pattern=_cuts(ww, h, c, seed + sd) if pat else None))

    def torso(m):
        cv2.fillPoly(m, [np.array([[28, 20], [112, 14], [128, 90], [112, 196], [40, 204], [16, 110]], np.int32)], 1.0, AA)
        cv2.ellipse(m, (70, 40), (48, 30), 0, 0, 360, 1.0, -1, AA)
        cv2.ellipse(m, (74, 180), (42, 28), 0, 0, 360, 1.0, -1, AA)

    def torso_c(m):
        for y in range(52, 176, 20):                              # rows of scale cuts: the tiger-skin kilt and armour
            for x in range(40, 112, 18):
                cv2.ellipse(m, (x + (y // 20 % 2) * 9, y), (7, 5), 0, 200, 340, 1.0, 2, AA)
        cv2.line(m, (30, 122), (122, 116), 1.0, 2, AA)
        cv2.line(m, (30, 130), (122, 124), 1.0, 2, AA)
    P.append(Part('torso', _shape(144, 220, torso, seed + 1), DYE_RED, (72, 112), None, (0, 0), 5, seed=seed + 1,
                  pattern=_cuts(144, 220, torso_c, seed + 1)))
    P.append(monkey_heads(seed)[0])

    def tail(m):
        pts = np.array([[20, 150], [14, 110], [22, 66], [44, 34], [70, 22], [92, 30]], np.int32)
        for i in range(len(pts) - 1):
            cv2.line(m, tuple(int(v) for v in pts[i]), tuple(int(v) for v in pts[i + 1]), 1.0, 17 - 2 * i, AA)
    P.append(Part('tail', _shape(110, 170, tail, seed + 3), DYE_OCHRE, (20, 150), 'torso', (34, 186), 1, seed=seed + 3))
    limb('arm_b', 44, 112, DYE_OCHRE, 'torso', (86, 44), 2, 10)
    limb('forearm_b', 40, 108, DYE_OCHRE, 'arm_b', (22, 98), 3, 11, 'hand')
    limb('thigh_b', 54, 124, DYE_GREEN, 'torso', (62, 190), 2, 12)
    limb('shin_b', 44, 122, DYE_BLACK, 'thigh_b', (27, 110), 3, 13, 'foot', pat=False)
    limb('thigh_f', 56, 126, DYE_GREEN, 'torso', (84, 188), 6, 14)
    limb('shin_f', 46, 124, DYE_BLACK, 'thigh_f', (28, 112), 7, 15, 'foot', pat=False)
    limb('arm_f', 46, 114, DYE_OCHRE, 'torso', (60, 42), 8, 16)
    limb('forearm_f', 42, 110, DYE_OCHRE, 'arm_f', (23, 100), 9, 17, 'hand')

    def staff(m):
        cv2.line(m, (12, 8), (12, 472), 1.0, 9, AA)
        cv2.rectangle(m, (5, 8), (19, 44), 1.0, -1, AA)
        cv2.rectangle(m, (5, 436), (19, 472), 1.0, -1, AA)
    P.append(Part('staff', _shape(24, 480, staff, seed + 20, rough=0.8), DYE_BLACK, (12, 240), 'forearm_f', (25, 98),
                  10, seed=seed + 20, outline=0))
    return Puppet(P, reach=420)


def monkey_heads(seed=0):
    """Heads for swapping on the beat (七十二变): [monkey, plumed monkey, hawk, fish, old man]. Each is a Part named
    'head' with the same pin, so Puppet.render(..., swaps={'head': heads[k]}) just works."""
    AA = cv2.LINE_AA
    out = []

    def mk(draw, cut, dye, sd, w=170, h=190):
        return Part('head', _shape(w, h, draw, seed + 40 + sd), dye, (70, 150), 'torso', (70, 22), 6, seed=seed + 40 + sd,
                    pattern=_cuts(w, h, cut, seed + 40 + sd))

    def monkey(m, plume=False):
        cv2.ellipse(m, (70, 96), (46, 50), 0, 0, 360, 1.0, -1, AA)                 # skull
        cv2.ellipse(m, (108, 112), (30, 22), 10, 0, 360, 1.0, -1, AA)              # muzzle
        cv2.ellipse(m, (30, 92), (14, 20), 0, 0, 360, 1.0, -1, AA)                 # ear
        cv2.fillPoly(m, [np.array([[52, 136], [92, 136], [84, 168], [58, 168]], np.int32)], 1.0, AA)   # neck
        cv2.ellipse(m, (66, 52), (40, 12), -8, 0, 360, 1.0, -1, AA)                # the band
        if plume:
            for dx in (0, 14):
                pts = np.array([[60 + dx, 50], [70 + dx, 18], [100 + dx, 4], [140 + dx, 10]], np.int32)
                cv2.polylines(m, [pts], False, 1.0, 5, AA)

    def monkey_c(m):
        cv2.ellipse(m, (88, 90), (11, 6), -10, 0, 360, 1.0, -1, AA)                # eye, cut right through
        cv2.ellipse(m, (112, 120), (18, 6), 12, 10, 170, 1.0, 2, AA)               # mouth
        cv2.ellipse(m, (70, 100), (34, 36), 0, 120, 250, 1.0, 2, AA)               # the heart-shaped face line
        for x in range(40, 96, 12):
            cv2.circle(m, (x, 53 - (x - 40) // 8), 2, 1.0, -1, AA)
    out.append(mk(monkey, monkey_c, DYE_OCHRE, 0))
    out.append(mk(lambda m: monkey(m, True), monkey_c, DYE_RED, 1))

    def hawk(m):
        cv2.ellipse(m, (72, 98), (40, 44), 0, 0, 360, 1.0, -1, AA)
        cv2.fillPoly(m, [np.array([[98, 78], [160, 104], [104, 122]], np.int32)], 1.0, AA)
        cv2.fillPoly(m, [np.array([[52, 130], [92, 130], [84, 168], [58, 168]], np.int32)], 1.0, AA)
        for i in range(4):
            cv2.line(m, (50 - i * 4, 70 + i * 6), (16 - i * 2, 52 + i * 14), 1.0, 7, AA)

    def hawk_c(m):
        cv2.circle(m, (88, 90), 8, 1.0, -1, AA)
        cv2.line(m, (104, 104), (148, 105), 1.0, 2, AA)
        for y in range(104, 136, 10):
            cv2.ellipse(m, (62, y), (16, 5), 0, 200, 340, 1.0, 2, AA)
    out.append(mk(hawk, hawk_c, DYE_INDIGO, 2))

    def fish(m):
        cv2.ellipse(m, (86, 92), (62, 40), -14, 0, 360, 1.0, -1, AA)
        cv2.fillPoly(m, [np.array([[36, 96], [4, 60], [10, 128]], np.int32)], 1.0, AA)
        cv2.fillPoly(m, [np.array([[70, 60], [104, 26], [112, 62]], np.int32)], 1.0, AA)
        cv2.fillPoly(m, [np.array([[54, 122], [90, 122], [84, 168], [58, 168]], np.int32)], 1.0, AA)

    def fish_c(m):
        cv2.circle(m, (118, 78), 8, 1.0, -1, AA)
        for x in range(50, 104, 15):
            for y in (84, 100):
                cv2.ellipse(m, (x, y + (x // 15 % 2) * 6), (7, 6), 0, 250, 110, 1.0, 2, AA)
        cv2.ellipse(m, (134, 96), (10, 4), -14, 0, 180, 1.0, 2, AA)
    out.append(mk(fish, fish_c, DYE_GREEN, 3))

    def elder(m):
        cv2.ellipse(m, (72, 92), (42, 48), 0, 0, 360, 1.0, -1, AA)
        cv2.fillPoly(m, [np.array([[96, 86], [128, 100], [100, 108]], np.int32)], 1.0, AA)       # nose
        cv2.fillPoly(m, [np.array([[70, 124], [112, 118], [118, 186], [92, 160]], np.int32)], 1.0, AA)   # beard
        cv2.fillPoly(m, [np.array([[52, 130], [90, 130], [84, 168], [58, 168]], np.int32)], 1.0, AA)
        cv2.ellipse(m, (64, 44), (26, 16), 0, 0, 360, 1.0, -1, AA)                 # topknot

    def elder_c(m):
        cv2.ellipse(m, (90, 84), (10, 4), 0, 0, 360, 1.0, -1, AA)
        cv2.ellipse(m, (90, 76), (14, 5), -10, 180, 340, 1.0, 2, AA)
        for i in range(4):
            cv2.line(m, (84 + i * 7, 128), (96 + i * 5, 168 - i * 4), 1.0, 2, AA)
    out.append(mk(elder, elder_c, HIDE * 0.9, 4))
    return out


# angles in degrees; + swings a hanging limb forward (toward the way the figure faces)
POSES = {
    'stand':  {'head': 0, 'arm_f': 20, 'forearm_f': 60, 'staff': -75, 'arm_b': -15, 'forearm_b': 20, 'thigh_f': 8,
               'shin_f': -8, 'thigh_b': -8, 'shin_b': -4, 'tail': 0},
    'guard':  {'head': -8, 'arm_f': 70, 'forearm_f': 80, 'staff': -150, 'arm_b': 115, 'forearm_b': 50, 'thigh_f': 55,
               'shin_f': -75, 'thigh_b': -25, 'shin_b': -10, 'tail': 25, '_y': 18},
    'strike': {'head': 10, 'arm_f': 115, 'forearm_f': 10, 'staff': -35, 'arm_b': -60, 'forearm_b': -30, 'thigh_f': 70,
               'shin_f': -60, 'thigh_b': -50, 'shin_b': 15, 'tail': -30, '_rot': 12, '_y': 30},
    'shade':  {'head': 14, 'arm_f': 150, 'forearm_f': 100, 'staff': 20, 'arm_b': -30, 'forearm_b': 70, 'thigh_f': 95,
               'shin_f': -115, 'thigh_b': -5, 'shin_b': 0, 'tail': 40, '_y': 0},            # hand shading the eyes
    'crouch': {'head': 5, 'arm_f': 60, 'forearm_f': 95, 'staff': -100, 'arm_b': 40, 'forearm_b': 100, 'thigh_f': 85,
               'shin_f': -125, 'thigh_b': 55, 'shin_b': -120, 'tail': 60, '_y': 95, '_rot': 8},
    'leap':   {'head': -12, 'arm_f': 160, 'forearm_f': 15, 'staff': 60, 'arm_b': -100, 'forearm_b': -20, 'thigh_f': 80,
               'shin_f': -100, 'thigh_b': -70, 'shin_b': -50, 'tail': -50, '_y': -110, '_rot': -14},
}


def run_cycle(n=8):
    """n poses of a running loop (for the 走马灯 strip)."""
    out = []
    for i in range(n):
        a = 2 * math.pi * i / n
        s, c = math.sin(a), math.cos(a)
        out.append({'head': -4 + 4 * c, 'arm_f': 55 * s + 20, 'forearm_f': 70 + 20 * s, 'staff': -80 - 20 * s,
                    'arm_b': -55 * s + 10, 'forearm_b': 60 - 20 * s, 'thigh_f': 50 * s + 12, 'shin_f': -45 + 40 * c * (s < 0) - 20,
                    'thigh_b': -50 * s + 12, 'shin_b': -45 - 40 * c * (s > 0) - 20, 'tail': 20 * c - 20, '_rot': 10,
                    '_y': -14 * abs(c)})
    return out
