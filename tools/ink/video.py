"""tools.ink.video: generated video elements -> ink on our paper.

A generated clip of ONE thing on a plain ground (an ink figure on cream paper, mist on black) is prepared once into
a keyed frame store on disk, then read back frame by frame, random-access and GPU-free, by any render worker.

    clip = Clip.prepare('media/gen/monkey_staff.mp4', ground='light')      # stabilise, de-flicker, key; cached on disk
    rt = Retime(t0=52.0, src0=0.4).freeze_at(54.25, 0.5).on_twos(56.0, 58.0)
    scene.add(clip.as_layer(rt), kind='ink', depth=1.0, pos=(900, 300), scale=1.5)
    # or by hand:  lay_ink(frame, clip.layer(t, rt), x, y)

CLI:  python -m tools.ink.video prep in.mp4 [--out work/ink_clips/<name>] [--ground light|dark] [--height 720]
                                         [--start S --dur D] [--matte birefnet|sam2] [--no-stab] [--smooth 0.5]
      python -m tools.ink.video info work/ink_clips/<name>
"""
import argparse
import bisect
import hashlib
import json
import math
import shutil
import sys
import time
from collections import OrderedDict
from pathlib import Path

import cv2
import numpy as np

from .core import F32, FPS, ROOT, blur, ease, luma, smoothstep, to_u8
from .paper import estimate_ground, key_dark, key_paper

CLIPS = ROOT / 'work' / 'ink_clips'


# --------------------------------------------------------------------------------------------------------------------
# decoding (same colour handling as tools/edit/assemble.py: untagged HD is BT.709 limited)

def probe(path):
    import av
    with av.open(str(path)) as c:
        s = c.streams.video[0]
        rate = float(s.average_rate or s.guessed_rate or 24)
        n = s.frames
        dur = float(s.duration * s.time_base) if s.duration is not None else (c.duration / 1e6 if c.duration else 0.0)
        if n:
            dur = n / rate
        cc = s.codec_context
        return dict(rate=rate, frames=n or int(round(dur * rate)), duration=dur, width=cc.width, height=cc.height,
                    colorspace=int(cc.colorspace or 2), color_range=int(cc.color_range or 0))


def _matrix(info):
    cs = info['colorspace']
    m = 'ITU709' if cs == 1 else 'ITU601' if cs in (5, 6) else 'BT2020' if cs == 9 else \
        ('ITU709' if info['height'] >= 720 else 'ITU601')
    return m, ('JPEG' if info['color_range'] == 2 else 'MPEG')


def decode(path, start=0.0, dur=None, height=None):
    """Yield (src_time, float32 RGB frame) for every decoded frame in [start, start+dur). height resizes (area)."""
    import av
    from av.video.reformatter import VideoReformatter
    p = Path(path)
    p = p if p.is_absolute() else ROOT / p
    info = probe(p)
    m, r = _matrix(info)
    ref = VideoReformatter()
    end = None if dur is None else start + dur
    with av.open(str(p)) as c:
        s = c.streams.video[0]
        s.thread_type = 'AUTO'
        t0 = float(s.start_time * s.time_base) if s.start_time is not None else 0.0
        if start > 1.0:
            c.seek(int((start - 1.0 + t0) / s.time_base), stream=s, backward=True)
        k = 0
        for fr in c.decode(s):
            t = float(fr.pts * s.time_base) - t0 if fr.pts is not None else k / info['rate']
            k += 1
            if t < start - 1e-4:
                continue
            if end is not None and t >= end - 1e-4:
                break
            a = ref.reformat(fr, format='rgb24', src_colorspace=m, src_color_range=r, dst_color_range='JPEG',
                             interpolation='BICUBIC').to_ndarray().astype(F32) / 255.0
            if height and a.shape[0] != height:
                w = int(round(a.shape[1] * height / a.shape[0] / 2) * 2)
                a = cv2.resize(a, (w, height), interpolation=cv2.INTER_AREA if height < a.shape[0] else cv2.INTER_CUBIC)
            yield t, a


# --------------------------------------------------------------------------------------------------------------------
# ground stabilisation

def _stab_feature(img, col, dark):
    """High-passed half-res luminance + a mask of plain-ground pixels (the subject is excluded)."""
    sm = cv2.resize(img, (img.shape[1] // 2, img.shape[0] // 2), interpolation=cv2.INTER_AREA)
    g = luma(sm)
    hp = blur(g, 0.8) - blur(g, 6.0)                      # the paper's own texture, without slow shading
    dist = np.abs(sm - col[None, None]).max(axis=2)
    m = (dist < 0.06).astype(np.uint8)
    m = cv2.erode(m, np.ones((9, 9), np.uint8))
    return hp.astype(F32), m


class Stabiliser:
    """Estimates, per frame, the affine that maps frame 0's ground onto this frame's ground (drift + breath of zoom),
    from the ground only (ECC on the paper's own texture), so it can be undone. If the ground is too plain to lock
    onto (correlation below `min_cc`) the previous estimate is kept and the frame is flagged."""

    def __init__(self, dark=False, min_cc=0.25, max_shift=0.06, max_scale=0.05):
        self.dark, self.min_cc, self.max_shift, self.max_scale = dark, min_cc, max_shift, max_scale
        self.ref = None
        self.M = np.eye(2, 3, dtype=np.float32)
        self.log = []

    def step(self, img, col):
        hp, m = _stab_feature(img, col, self.dark)
        if self.ref is None:
            self.ref = (hp, m)
            self.log.append(dict(cc=1.0, ok=True, M=self.M.tolist()))
            return self.M.copy()
        ok, cc = False, 0.0
        if float(self.ref[0].std()) > 1e-4 and m.mean() > 0.2:
            crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 60, 1e-5)
            mask = (m & self.ref[1])
            lim = self.max_shift * hp.shape[1]
            # affine first (drift + breath of zoom); if that will not converge, translation only
            for mode in (cv2.MOTION_AFFINE, cv2.MOTION_TRANSLATION):
                try:
                    init = self.M.copy() if mode == cv2.MOTION_AFFINE else \
                        np.array([[1, 0, self.M[0, 2]], [0, 1, self.M[1, 2]]], np.float32)
                    cc, M = cv2.findTransformECC(self.ref[0], hp, init, mode, crit, mask, 5)
                except cv2.error:
                    continue
                sc = math.sqrt(abs(M[0, 0] * M[1, 1] - M[0, 1] * M[1, 0]))
                ok = (cc >= self.min_cc and abs(sc - 1) < self.max_scale and abs(M[0, 1]) < 0.02
                      and abs(M[1, 0]) < 0.02 and abs(M[0, 2]) < lim and abs(M[1, 2]) < lim)
                if ok:
                    self.M = M.astype(np.float32)
                    break
        self.log.append(dict(cc=float(cc), ok=bool(ok), M=self.M.tolist()))
        return self.M.copy()

    @staticmethod
    def undo(img, M):
        """Warp a full-res frame back onto frame 0's ground (M was estimated at half res)."""
        A = M.astype(np.float64).copy()
        A[:, 2] *= 2.0
        return cv2.warpAffine(img, A, (img.shape[1], img.shape[0]), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP,
                              borderMode=cv2.BORDER_REFLECT)


# --------------------------------------------------------------------------------------------------------------------
# optional mattes (GPU; only ever inside prepare())

def matte_birefnet(frames, size=1024):
    """Salient-object mattes with the locally cached BiRefNet. frames: list of float RGB. Returns list of HxW 0..1.
    UNTESTED here: the halys venv has no timm/kornia, so this path raises a clear error; SAM 2.1 is the tested one."""
    import os
    os.environ.setdefault('HF_HUB_OFFLINE', '1')
    import torch
    from transformers import AutoModelForImageSegmentation
    try:
        net = AutoModelForImageSegmentation.from_pretrained('ZhengPeng7/BiRefNet', trust_remote_code=True)
    except ImportError as e:                                  # its remote code needs timm + kornia
        raise RuntimeError("BiRefNet needs timm and kornia, which this venv lacks (MM/.venv has them). Use "
                           "matte='sam2', or run `python -m tools.ink.video prep ... --matte birefnet` with a "
                           "venv that has them.") from e
    net = net.to('cuda').half().eval()
    mean = torch.tensor([0.485, 0.456, 0.406], device='cuda').view(1, 3, 1, 1)
    std = torch.tensor([0.229, 0.224, 0.225], device='cuda').view(1, 3, 1, 1)
    out = []
    with torch.no_grad():
        for f in frames:
            x = torch.from_numpy(cv2.resize(f, (size, size), interpolation=cv2.INTER_AREA)).cuda().permute(2, 0, 1)[None]
            y = net(((x - mean) / std).half())[-1].sigmoid()[0, 0].float().cpu().numpy()
            out.append(cv2.resize(y, (f.shape[1], f.shape[0]), interpolation=cv2.INTER_LINEAR).astype(F32))
    del net
    torch.cuda.empty_cache()
    return out


def matte_sam2(frames, box=None, points=None, frame=0):
    """Video matte with the locally cached SAM 2.1 (transformers Sam2VideoModel, bf16), prompted with a box
    [x0, y0, x1, y1] and/or points [[x, y], ...] on `frame`. Returns list of HxW 0..1."""
    import os
    os.environ.setdefault('HF_HUB_OFFLINE', '1')
    import torch
    from transformers import Sam2VideoModel, Sam2VideoProcessor
    name = 'facebook/sam2.1-hiera-large'
    m = Sam2VideoModel.from_pretrained(name).to('cuda', dtype=torch.bfloat16)
    p = Sam2VideoProcessor.from_pretrained(name)
    vid = [to_u8(f) for f in frames]
    sess = p.init_video_session(video=vid, inference_device='cuda', dtype=torch.bfloat16)
    kw = dict(inference_session=sess, frame_idx=frame, obj_ids=1)
    if points:
        kw['input_points'] = [[[list(map(float, q)) for q in points]]]
        kw['input_labels'] = [[[1] * len(points)]]
    if box is not None:
        kw['input_boxes'] = [[list(map(float, box))]]
    p.add_inputs_to_inference_session(**kw)
    m(inference_session=sess, frame_idx=frame)
    H, W = vid[0].shape[:2]
    out = [None] * len(vid)
    for rev in (False, True):
        if rev and frame == 0:
            continue
        with torch.no_grad():
            for o in m.propagate_in_video_iterator(sess, start_frame_idx=frame, reverse=rev):
                r = p.post_process_masks([o.pred_masks], original_sizes=[[H, W]], binarize=False)[0]
                out[o.frame_idx] = (1 / (1 + np.exp(-r[0, 0].float().cpu().numpy()))).astype(F32)
    del m
    torch.cuda.empty_cache()
    return [o if o is not None else np.zeros((H, W), F32) for o in out]


# --------------------------------------------------------------------------------------------------------------------
# the store

def _sig(src, params):
    st = Path(src).stat()
    return hashlib.blake2b(repr((str(src), st.st_size, st.st_mtime_ns, sorted(params.items()))).encode(),
                           digest_size=8).hexdigest()


def prepare(src, out=None, ground='light', height=720, start=0.0, dur=None, stabilise=True, smooth=0.5, matte=None,
            matte_box=None, lo=0.04, hi=0.14, gain=1.0, feather=0.03, force=False, quiet=False):
    """Process a source clip into a keyed frame store and return its directory (cached: re-running is free).

    ground     'light' -> ink layers (transmittance; darker-than-ground becomes ink, hue kept)
               'dark'  -> straight-alpha RGBA (lighter-than-ground becomes the element)
    height     working height in px (the store's resolution; scale it up in the Scene if needed)
    stabilise  undo drift/zoom of the plain ground relative to the first frame
    smooth     0..1 temporal smoothing of the key where nothing moves (kills flicker; moving edges pass untouched)
    matte      None | 'birefnet' | 'sam2': also multiply the key by a subject matte (GPU, local weights)
    lo, hi     key thresholds (see paper.key_paper / key_dark); gain deepens ink; feather fades at the frame border
    """
    src = Path(src)
    src = src if src.is_absolute() else ROOT / src
    params = dict(ground=ground, height=height, start=start, dur=dur, stabilise=stabilise, smooth=smooth, matte=matte,
                  matte_box=matte_box, lo=lo, hi=hi, gain=gain, feather=feather, v=6)
    out = Path(out) if out else CLIPS / src.stem
    out = out if out.is_absolute() else ROOT / out
    sig = _sig(src, params)
    meta_f = out / 'meta.json'
    if meta_f.exists() and not force:
        try:
            if json.loads(meta_f.read_text()).get('sig') == sig:
                return out
        except json.JSONDecodeError:
            pass
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    t_start = time.time()
    dark = ground == 'dark'
    info = probe(src)
    stab = Stabiliser(dark) if stabilise else None
    raw, cols, times = [], [], []
    shape_s = None
    # pass 1: decode, stabilise, estimate the ground per frame
    for t, img in decode(src, start, dur, height):
        col, field = estimate_ground(img, dark=dark)
        if stab is not None:
            M = stab.step(img, col)
            img = Stabiliser.undo(img, M)
            if len(raw):
                col, field = estimate_ground(img, dark=dark)
        raw.append(to_u8(img))                               # 8-bit keeps RAM modest for long clips
        cols.append(col)
        times.append(t)
        # the ground's slow shading (vignette, lighting) is nearly constant: average it over the clip
        sh = field / np.maximum(col[None, None], 1e-3) if not dark else field - col[None, None]
        shape_s = sh if shape_s is None else shape_s * 0.9 + sh * 0.1
    n = len(raw)
    if n == 0:
        raise ValueError(f'no frames decoded from {src}')
    cols = np.array(cols, F32)
    mattes = None
    if matte:
        fr = [r.astype(F32) / 255.0 for r in raw]
        if matte == 'birefnet':
            mattes = matte_birefnet(fr)
        elif matte == 'sam2':
            box = matte_box
            if box is None:                                   # prompt with the bounding box of what the key finds
                d0 = 1 - key_paper(fr[0], lo=lo, hi=hi).min(axis=2) if not dark else key_dark(fr[0])[..., 3]
                ys, xs = np.where(d0 > 0.2)
                box = [xs.min(), ys.min(), xs.max(), ys.max()] if len(xs) else [0, 0, fr[0].shape[1], fr[0].shape[0]]
            mattes = matte_sam2(fr, box=box)
        else:
            raise ValueError(matte)
        del fr
    # pass 2: key, temporally smooth, write
    prev = None
    still = []
    for i in range(n):
        img = raw[i].astype(F32) / 255.0
        if dark:
            lay = key_dark(img - shape_s, ground=cols[i], lo=lo, hi=max(hi, 0.3))
            if mattes is not None:
                lay[..., 3] *= _soft_matte(mattes[i])
        else:
            lay = key_paper(img / np.maximum(shape_s, 1e-3), ground=cols[i], lo=lo, hi=hi, feather=feather, gain=gain,
                            flat_field=False)
            if mattes is not None:
                lay = 1 - (1 - lay) * _soft_matte(mattes[i])[..., None]
            dd = 1 - lay.min(axis=2)                       # last traces of source ground: gone, with a soft knee
            lay = 1 - (1 - lay) * smoothstep(0.02, 0.07, blur(dd, 1.0))[..., None]
        if prev is not None and smooth > 0:
            # motion-adaptive recursive filter: where the key barely changed, lean on the previous output (flicker
            # and codec noise go); where it changed, take the new frame whole (no ghost behind a moving limb)
            diff = np.abs(lay - prev).max(axis=2)
            diff = cv2.dilate(blur(diff, 1.5), np.ones((5, 5), np.uint8))
            w = smooth * (1 - smoothstep(0.03, 0.12, diff))
            lay = lay + (prev - lay) * w[..., None]
            still.append(float(w.mean() / max(smooth, 1e-6)))
        prev = lay
        u8 = to_u8(lay)
        cv2.imwrite(str(out / f'f_{i:05d}.png'), u8[..., ::-1] if u8.shape[2] == 3 else u8[..., [2, 1, 0, 3]],
                    [cv2.IMWRITE_PNG_COMPRESSION, 3])
    h, w = raw[0].shape[:2]
    meta = dict(sig=sig, src=str(src), kind='rgba' if dark else 'ink', n=n, fps=info['rate'], w=w, h=h,
                start=start, duration=n / info['rate'], params=params,
                ground=[[round(float(x), 4) for x in c] for c in cols],
                stab=(stab.log if stab else None),
                stab_lost=(sum(1 for s in stab.log if not s['ok']) if stab else None),
                prep_seconds=round(time.time() - t_start, 2))
    meta_f.write_text(json.dumps(meta))
    if not quiet:
        lost = f', ground lock lost on {meta["stab_lost"]} frames' if stab and meta['stab_lost'] else ''
        print(f'video.prepare: {src.name} -> {out} ({n} frames {w}x{h}, {meta["prep_seconds"]} s{lost})')
    return out


def _soft_matte(m):
    k = max(3, int(m.shape[0] / 60)) | 1
    return np.clip(blur(cv2.dilate(m, np.ones((k, k), np.uint8)), k / 2.0) * 1.3, 0, 1)


class Clip:
    """A prepared clip. Attributes: n, fps, w, h, duration (s), kind ('ink' transmittance HxWx3 | 'rgba' HxWx4).

    frame(i)                 the keyed frame i (clamped to the clip)
    at(src_t, blend=False)   the frame showing at source time src_t (hard frames by default; blend mixes neighbours)
    layer(t, retime, scale)  the layer for song time t through a Retime (None: t is source time)
    as_layer(retime, scale)  a callable t -> layer for Scene.add(..., kind=clip.kind)
    density(i)               HxW ink density (ink) or alpha (rgba) of frame i
    """

    def __init__(self, store, cache=6):
        self.dir = Path(store)
        self.dir = self.dir if self.dir.is_absolute() else ROOT / self.dir
        self.meta = json.loads((self.dir / 'meta.json').read_text())
        m = self.meta
        self.n, self.fps, self.w, self.h, self.kind = m['n'], float(m['fps']), m['w'], m['h'], m['kind']
        self.duration = self.n / self.fps
        self._lru, self._cap = OrderedDict(), cache
        self.overrun = False

    @classmethod
    def prepare(cls, src, out=None, **kw):
        """Prepare (or reuse) the store for `src` and open it. See prepare() for the options."""
        return cls(prepare(src, out, **kw))

    def frame(self, i):
        j = min(self.n - 1, max(0, int(i)))
        if j != int(i):
            self.overrun = True
        if j in self._lru:
            self._lru.move_to_end(j)
            return self._lru[j]
        a = cv2.imread(str(self.dir / f'f_{j:05d}.png'), cv2.IMREAD_UNCHANGED)
        if a is None:
            raise FileNotFoundError(self.dir / f'f_{j:05d}.png')
        a = np.ascontiguousarray(a[..., ::-1] if a.shape[2] == 3 else a[..., [2, 1, 0, 3]]).astype(F32) / 255.0
        self._lru[j] = a
        if len(self._lru) > self._cap:
            self._lru.popitem(last=False)
        return a

    def at(self, src_t, blend=False):
        x = src_t * self.fps
        if not blend:
            return self.frame(int(math.floor(x + 1e-6)))
        i = int(math.floor(x))
        f = x - i
        if f < 1e-3:
            return self.frame(i)
        return self.frame(i) * (1 - f) + self.frame(i + 1) * f

    def layer(self, t, retime=None, scale=1.0, blend=False):
        a = self.at(retime.src(t) if retime is not None else t, blend)
        if scale != 1.0:
            w, h = int(round(self.w * scale)), int(round(self.h * scale))
            a = cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
            a = np.clip(a, 0, 1)
        return a

    def as_layer(self, retime=None, scale=1.0, blend=False):
        return lambda t: self.layer(t, retime, scale, blend)

    def density(self, i):
        f = self.frame(i)
        return f[..., 3] if self.kind == 'rgba' else 1.0 - f.min(axis=2)


# --------------------------------------------------------------------------------------------------------------------
# retiming

class Retime:
    """Song time -> source time. Build it by chaining; everything is closed-form, so frames render in any order.

        Retime(t0, src0=0.0, rate=1.0, duration=None)
          t0        song time at which the clip starts; src0: source time shown at t0; rate: base speed
          duration  source length in seconds (pass clip.duration) so running off the end is caught
        .ramp([(t, rate), ...], ease='inout')   speed ramp: rate keys on the song clock, eased between
        .freeze_at(t_hit, hold, catch_up=0.0)   亮相: the pose on the hit holds for `hold` s, then motion resumes;
                                                catch_up > 0 makes up the lost time over that many seconds
        .on_twos(ta, tb, n=2)                   between ta and tb show a new pose only every n frames (2s, 3s)
        .reverse()                              play backward from src0
        .loop(a=0.0, b=None, pingpong=False)    wrap source time into [a, b)
        .src(t)                                 source seconds for song time t (clamped to the clip; sets .overrun)
        .check(t0, t1)                          list of problems over a range (empty = fine)
    """

    def __init__(self, t0=0.0, src0=0.0, rate=1.0, duration=None, fps=FPS):
        self.t0, self.src0, self.rate, self.duration, self.fps = float(t0), float(src0), float(rate), duration, fps
        self.keys, self.ease_kind = [], 'inout'
        self.freezes, self.twos = [], []
        self.sign, self._loop = 1.0, None
        self._tab = None
        self.overrun = False

    def ramp(self, keys, ease_kind='inout'):
        self.keys, self.ease_kind, self._tab = sorted((float(a), float(b)) for a, b in keys), ease_kind, None
        return self

    def freeze_at(self, t_hit, hold, catch_up=0.0):
        self.freezes.append((float(t_hit), float(hold), float(catch_up)))
        self.freezes.sort()
        self._tab = None
        return self

    def on_twos(self, ta, tb, n=2):
        self.twos.append((float(ta), float(tb), int(n)))
        return self

    def reverse(self):
        self.sign = -1.0
        return self

    def loop(self, a=0.0, b=None, pingpong=False):
        self._loop = (float(a), b, pingpong)
        return self

    def _rate(self, t):
        r = self.rate
        ks = self.keys
        if ks:
            if t <= ks[0][0]:
                r = ks[0][1]
            elif t >= ks[-1][0]:
                r = ks[-1][1]
            else:
                i = bisect.bisect_right([k[0] for k in ks], t) - 1
                a, b = ks[i], ks[i + 1]
                r = a[1] + (b[1] - a[1]) * ease((t - a[0]) / max(b[0] - a[0], 1e-9), self.ease_kind)
        boost = 0.0
        for th, hold, cu in self.freezes:
            if th <= t < th + hold:
                return 0.0
            if cu > 0 and th + hold <= t < th + hold + cu:
                boost += hold / cu
        return r * (1.0 + boost)

    def _table(self, t_end):
        dt = 1.0 / 480.0
        if self._tab is None or self._tab[0] < t_end:
            n = int((max(t_end, self.t0 + 30.0) - self.t0) / dt) + 2
            ts = self.t0 + np.arange(n) * dt
            r = np.array([self._rate(x + dt / 2) for x in ts])
            self._tab = (ts[-1], dt, np.concatenate([[0.0], np.cumsum(r) * dt]))
        return self._tab

    def src(self, t):
        for ta, tb, n in self.twos:                         # hold each pose for n frames
            if ta <= t < tb:
                step = n / self.fps
                t = ta + math.floor((t - ta) / step + 1e-6) * step
        for th, hold, cu in self.freezes:                   # the hit lands exactly on its own frame's pose
            if th <= t < th + hold:
                t = th
        if t <= self.t0:
            adv = (t - self.t0) * self._rate(self.t0)
        else:
            _, dt, cum = self._table(t)
            x = (t - self.t0) / dt
            i = int(x)
            adv = cum[i] + (cum[min(i + 1, len(cum) - 1)] - cum[i]) * (x - i)
        s = self.src0 + self.sign * adv
        if self._loop is not None:
            a, b, pp = self._loop
            b = b if b is not None else (self.duration or 0.0)
            L = b - a
            if L > 0:
                if pp:
                    u = (s - a) % (2 * L)
                    s = a + (u if u < L else 2 * L - u)
                    s = min(s, b - 1.0 / self.fps)
                else:
                    s = a + (s - a) % L
        lim = (self.duration - 0.5 / self.fps) if self.duration else None
        if s < 0 or (lim is not None and s > lim):
            self.overrun = True
            s = max(0.0, s if lim is None else min(s, lim))
        return s

    def check(self, t0, t1):
        """Problems over [t0, t1): running off either end of the source. Empty list = fine."""
        out, self.overrun = [], False
        f = int(math.ceil(t0 * self.fps))
        first = None
        while f / self.fps < t1:
            self.src(f / self.fps)
            if self.overrun and first is None:
                first = f / self.fps
            f += 1
        if first is not None:
            out.append(f'source runs out at song time {first:.3f} s (clamped to the last/first frame)')
        return out


# --------------------------------------------------------------------------------------------------------------------

def main(argv=None):
    ap = argparse.ArgumentParser(prog='python -m tools.ink.video')
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('prep', help='stabilise + key a clip into a frame store')
    p.add_argument('src')
    p.add_argument('--out')
    p.add_argument('--ground', default='light', choices=['light', 'dark'])
    p.add_argument('--height', type=int, default=720)
    p.add_argument('--start', type=float, default=0.0)
    p.add_argument('--dur', type=float)
    p.add_argument('--matte', choices=['birefnet', 'sam2'])
    p.add_argument('--no-stab', action='store_true')
    p.add_argument('--smooth', type=float, default=0.5)
    p.add_argument('--lo', type=float, default=0.04)
    p.add_argument('--hi', type=float, default=0.14)
    p.add_argument('--gain', type=float, default=1.0)
    p.add_argument('--force', action='store_true')
    q = sub.add_parser('info', help='describe a store')
    q.add_argument('store')
    a = ap.parse_args(argv)
    if a.cmd == 'prep':
        d = prepare(a.src, a.out, a.ground, a.height, a.start, a.dur, not a.no_stab, a.smooth, a.matte, None, a.lo,
                    a.hi, a.gain, force=a.force)
        print(d)
    else:
        c = Clip(a.store)
        m = c.meta
        print(f'{c.dir}: {c.kind}, {c.n} frames @ {c.fps:g} fps ({c.duration:.2f} s), {c.w}x{c.h}, '
              f'prep {m.get("prep_seconds")} s, ground lock lost on {m.get("stab_lost")} frames')


if __name__ == '__main__':
    main()
