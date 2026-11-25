"""tools.ink.run: the shot runner.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY -m tools.ink.run shots/H03.py --t0 52.0 --t1 58.5 --size 960x540 --out media/comp/H03.mp4 [--audio]
    $PY -m tools.ink.run shots/H03.py --still 54.2 --out work/H03_54.2.png
    $PY -m tools.ink.run shots/H03.py --frames work/H03_png --size 1920x1080          # PNG sequence
    $PY -m tools.ink.run shots/H03.py ... --opt lyrics=on                             # ctx.opts (see tools/ink/opts.py)

A shot script is a Python file that exposes
    render(t, ctx) -> float32 RGB HxWx3 at ctx.W x ctx.H       (t = seconds on the song clock)
and optionally
    T0, T1          default time range on the song clock
    setup(ctx)      called once (in the parent, before the workers fork): build papers, key plates, precompute; keep
                    the results in module globals or on ctx. Heavy results can go through ctx.cache(key, fn).
    AUDIO           path of the song (default: inputs/*.wav) for --audio
Instead of render() a script may expose build(ctx) returning an object with .render(t) (e.g. a Shot from
tools.ink.shot, the declarative layer list).

Frames: f0 = ceil(t0*24), f1 = ceil(t1*24), n = f1 - f0, frame k is rendered at t = (f0 + k) / 24: the timing map's
rule, so a shot cut on anchors has exactly the frame count tools/edit/assemble.py expects. Output is H.264 High
yuv420p BT.709 limited, 24 fps CFR, tagged, same flags as assemble.py (or ProRes 422 HQ if --out ends in .mov).
Rendering is done at --internal (default 1920x1080: shots are authored in 1080p pixels) and area-scaled to --size.
Workers render to a frame cache (work/ink/<shot>/<key>/) so an interrupted run resumes; the key covers the shot
file, the engine source, the sizes and the timing file.
"""
import argparse
import hashlib
import importlib.util
import json
import math
import multiprocessing as mp
import os
import pickle
import shutil
import subprocess
import sys
import time
from pathlib import Path

import cv2
import numpy as np

from .core import F32, FPS, ROOT, frame_of, to_u8
from .opts import default_opts, parse_opts
from .timing import Timing


class Ctx:
    """What a shot script gets. W, H: render size (authoring size, default 1920x1080). s: W / 1920 (multiply your
    pixel numbers by it if you want the script to work at other internal sizes). t0, t1: the range being rendered.
    timing: the Timing map. seed: the shot's base seed. root: project root (Path). opts: dict of render options
    (tools/ink/opts.py: 'lyrics' from env INK_LYRICS, default off; `--opt key=value` on the command line)."""

    def __init__(self, W=1920, H=1080, t0=0.0, t1=0.0, timing=None, seed=0, shot_id='shot', draft=False, opts=None):
        self.W, self.H, self.s = W, H, W / 1920.0
        self.t0, self.t1, self.fps = t0, t1, FPS
        self.timing = timing if timing is not None else Timing.load()
        self.seed, self.id, self.root, self.draft = seed, shot_id, ROOT, draft
        self.size = (W, H)
        self.store = {}
        self.opts = dict(default_opts() if opts is None else opts)

    def path(self, p):
        p = Path(p)
        return p if p.is_absolute() else ROOT / p

    def cache(self, key, fn, deps=()):
        """Disk-cached value: returns fn() the first time and the pickled result afterwards. `key` names it;
        `deps` are file paths whose size/mtime invalidate it. Use for slow precomputation (keying a clip, mattes)."""
        h = hashlib.blake2b(digest_size=10)
        h.update(repr(key).encode())
        for d in deps:
            st = self.path(d).stat()
            h.update(f'{d}:{st.st_size}:{st.st_mtime_ns}'.encode())
        f = ROOT / 'work' / 'ink_cache' / f'{self.id}_{h.hexdigest()}.pkl'
        if f.exists():
            with open(f, 'rb') as fh:
                return pickle.load(fh)
        v = fn()
        f.parent.mkdir(parents=True, exist_ok=True)
        tmp = f.with_suffix('.tmp')
        with open(tmp, 'wb') as fh:
            pickle.dump(v, fh, protocol=4)
        tmp.rename(f)
        return v


def load_shot(path):
    p = Path(path).resolve()
    spec = importlib.util.spec_from_file_location('shot_' + p.stem, p)
    mod = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(ROOT))
    spec.loader.exec_module(mod)
    return mod


def make_renderer(mod, ctx):
    if hasattr(mod, 'setup'):
        mod.setup(ctx)
    if hasattr(mod, 'render'):
        return lambda t: mod.render(t, ctx)
    if hasattr(mod, 'build'):
        obj = mod.build(ctx)
        return obj.render
    raise SystemExit('shot script needs render(t, ctx) or build(ctx)')


def encode_cmd(out, W, H, crf=16, preset='medium', audio=None, a_start=0.0, a_dur=None):
    out = str(out)
    cmd = ['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
           '-i', '-']
    if audio:
        cmd += ['-ss', f'{a_start:.6f}', '-t', f'{a_dur:.6f}', '-i', str(audio)]
    if out.endswith('.mov'):
        cmd += ['-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv422p10le,'
                       'setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv',
                '-c:v', 'prores_ks', '-profile:v', '3', '-vendor', 'apl0',
                '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv']
    else:
        cmd += ['-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p,'
                       'setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv',
                '-c:v', 'libx264', '-preset', preset, '-crf', str(crf), '-profile:v', 'high', '-level:v', '4.1',
                '-g', '48', '-x264-params', 'stitchable=1',
                '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
                '-video_track_timescale', str(FPS * 512)]
    if audio:
        cmd += ['-c:a', 'aac', '-b:a', '256k', '-map', '0:v', '-map', '1:a', '-shortest']
    else:
        cmd += ['-an']
    cmd += ['-movflags', '+faststart', '-f', 'mov' if out.endswith('.mov') else 'mp4', out]
    return cmd


_R = {}


def _work(job):
    k, t, path = job
    if os.path.exists(path):
        return k, 0.0
    a = time.time()
    img = _R['render'](t)
    W, H = _R['out']
    if img.shape[1] != W or img.shape[0] != H:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    u8 = to_u8(img[..., :3])
    tmp = path + '.tmp.png'
    cv2.imwrite(tmp, u8[..., ::-1], [cv2.IMWRITE_PNG_COMPRESSION, 1])
    os.replace(tmp, path)
    return k, time.time() - a


def _init_worker(threads):
    import faulthandler, signal
    faulthandler.register(signal.SIGUSR1)


def code_sig(shot_path):
    """Engine source + the shot file + the shared shot helpers (shots/_*.py, shots/*_lib.py, tools/stage/*.py): a
    helper edit must invalidate the frame cache (the lyric pass found v1 comps encoded from caches older than their
    helpers)."""
    h = hashlib.blake2b(digest_size=8)
    helpers = sorted((ROOT / 'shots').glob('_*.py')) + sorted((ROOT / 'shots').glob('*_lib.py')) + \
        sorted((ROOT / 'tools' / 'stage').glob('*.py'))
    for f in sorted(Path(__file__).parent.glob('*.py')) + helpers + [Path(shot_path)]:
        h.update(f.read_bytes())
    return h.hexdigest()


def find_audio(mod):
    a = getattr(mod, 'AUDIO', None)
    if a:
        return ROOT / a if not Path(a).is_absolute() else Path(a)
    c = sorted((ROOT / 'inputs').glob('*.wav'))
    return c[0] if c else None


def run(shot, t0=None, t1=None, size=(960, 540), internal=(1920, 1080), out=None, frames_dir=None, still=None,
        jobs=None, audio=False, crf=16, preset='medium', timing=None, seed=None, fresh=False, quiet=False,
        keep_cache=True, opts=None):
    """Render a shot. Returns a dict with frames, seconds, fps and the output path."""
    mod = load_shot(shot)
    sid = Path(shot).stem
    tm = Timing.load(timing)
    t0 = float(t0 if t0 is not None else getattr(mod, 'T0', 0.0))
    t1 = float(t1 if t1 is not None else getattr(mod, 'T1', t0 + 4.0))
    opts = dict(default_opts() if opts is None else opts)
    ctx = Ctx(internal[0], internal[1], t0, t1, tm, seed if seed is not None else getattr(mod, 'SEED', 0), sid,
              opts=opts)
    W, H = size
    if still is not None:
        r = make_renderer(mod, ctx)
        img = r(float(still))
        if img.shape[1] != W or img.shape[0] != H:
            img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
        outp = Path(out or ROOT / 'work' / 'ink' / f'{sid}_{float(still):.3f}.png')
        outp.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(outp), to_u8(img[..., :3])[..., ::-1])
        return dict(out=str(outp), frames=1)
    f0, f1 = frame_of(t0), frame_of(t1)
    n = f1 - f0
    if n <= 0:
        raise SystemExit(f'empty range {t0}..{t1}')
    key = hashlib.blake2b(repr((code_sig(shot), W, H, internal, ctx.seed, str(tm.path),
                                tm.path.stat().st_mtime_ns if tm.path else 0, sorted(opts.items()))).encode(),
                        digest_size=6).hexdigest()
    cdir = Path(frames_dir) if frames_dir else ROOT / 'work' / 'ink' / sid / f'{W}x{H}_{key}'
    if not cdir.is_absolute():
        cdir = ROOT / cdir
    if fresh and cdir.exists():
        shutil.rmtree(cdir)
    cdir.mkdir(parents=True, exist_ok=True)
    if not frames_dir:                                          # drop stale caches of this shot at this size
        for d in cdir.parent.glob(f'{W}x{H}_*'):
            if d != cdir:
                shutil.rmtree(d, ignore_errors=True)
    todo = [(k, (f0 + k) / FPS, str(cdir / f'f_{f0 + k:06d}.png')) for k in range(n)]
    pending = [j for j in todo if not os.path.exists(j[2])]
    a, setup_s = time.time(), 0.0
    if pending:
        _R['render'] = make_renderer(mod, ctx)                  # setup runs once here; workers inherit it by fork
        setup_s = time.time() - a
        a = time.time()
        _R['out'] = (W, H)
        jobs = jobs or int(getattr(mod, 'JOBS', 0)) or max(1, min(12, (os.cpu_count() or 4) // 2))
        jobs = min(jobs, len(pending))
        if jobs <= 1:
            for j in pending:
                _work(j)
        else:
            threads = max(1, (os.cpu_count() or 4) // jobs)
            with mp.get_context('fork').Pool(jobs, initializer=_init_worker, initargs=(threads,)) as pool:
                done = 0
                for k, dt in pool.imap_unordered(_work, pending, chunksize=1):
                    done += 1
                    if not quiet and (done % 24 == 0 or done == len(pending)):
                        el = time.time() - a
                        print(f'  {sid}: {done}/{len(pending)} frames  {done / el:.1f} fps', flush=True)
    render_s = time.time() - a
    res = dict(frames=n, rendered=len(pending), seconds=render_s, fps=(len(pending) / render_s if pending else 0.0),
               frames_dir=str(cdir), f0=f0, t0=t0, t1=t1, setup=setup_s)
    if out:
        outp = Path(out)
        if not outp.is_absolute():
            outp = ROOT / outp
        outp.parent.mkdir(parents=True, exist_ok=True)
        aud = find_audio(mod) if audio is True else (Path(audio) if audio else None)
        part = outp.with_name(outp.stem + '.partial' + outp.suffix)
        cmd = encode_cmd(part, W, H, crf, preset, aud, f0 / FPS, n / FPS)
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for k, t, path in todo:
            im = cv2.imread(path, cv2.IMREAD_COLOR)
            p.stdin.write(np.ascontiguousarray(im[..., ::-1]).tobytes())
        p.stdin.close()
        if p.wait() != 0:
            raise SystemExit('ffmpeg failed')
        got = count_frames(part)
        if got != n:
            raise SystemExit(f'frame count mismatch: wrote {got}, expected {n}')
        part.rename(outp)
        res['out'] = str(outp)
        if not keep_cache and not frames_dir:
            shutil.rmtree(cdir, ignore_errors=True)
    return res


def count_frames(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
                        'stream=nb_read_packets', '-of', 'csv=p=0', str(path)], capture_output=True, text=True)
    try:
        return int(r.stdout.strip().split(',')[0])
    except ValueError:
        return -1


def _size(s):
    w, h = s.lower().split('x')
    return int(w), int(h)


def main(argv=None):
    ap = argparse.ArgumentParser(prog='python -m tools.ink.run', description=__doc__.split('\n\n')[0])
    ap.add_argument('shot')
    ap.add_argument('--t0', type=float)
    ap.add_argument('--t1', type=float)
    ap.add_argument('--size', type=_size, default=(960, 540))
    ap.add_argument('--internal', type=_size, default=(1920, 1080), help='authoring/render size (default 1920x1080)')
    ap.add_argument('--out')
    ap.add_argument('--frames', help='write the PNG sequence to this directory (f_<frame24>.png)')
    ap.add_argument('--still', type=float, help='render one frame at this song time to --out (png)')
    ap.add_argument('--jobs', type=int)
    ap.add_argument('--audio', nargs='?', const=True, default=False, help='mux the song slice (optional path)')
    ap.add_argument('--crf', type=int, default=16)
    ap.add_argument('--preset', default='medium')
    ap.add_argument('--timing')
    ap.add_argument('--seed', type=int)
    ap.add_argument('--fresh', action='store_true', help='ignore the frame cache')
    ap.add_argument('--no-keep', action='store_true', help='delete the frame cache after encoding')
    ap.add_argument('--opt', action='append', default=[], metavar='KEY=VALUE',
                    help='render option for ctx.opts (repeatable), e.g. --opt lyrics=on; default from env INK_LYRICS')
    a = ap.parse_args(argv)
    if not (a.out or a.frames or a.still is not None):
        a.out = str(ROOT / 'media' / 'comp' / (Path(a.shot).stem + '.mp4'))
    r = run(a.shot, a.t0, a.t1, a.size, a.internal, a.out, a.frames, a.still, a.jobs, a.audio, a.crf, a.preset,
            a.timing, a.seed, a.fresh, keep_cache=not a.no_keep, opts=parse_opts(a.opt))
    if 'seconds' in r:
        print(f'{Path(a.shot).stem}: {r["frames"]} frames ({r["t0"]:.3f}-{r["t1"]:.3f} s), rendered {r["rendered"]} '
              f'in {r["seconds"]:.1f} s = {r["fps"]:.1f} fps (+ setup {r["setup"]:.1f} s) -> {r.get("out", r["frames_dir"])}')
    else:
        print(r['out'])


if __name__ == '__main__':
    main()
