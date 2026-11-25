"""tools.ink.qa: the two whitespace checks from the brainstorm, as a CLI.

    PY -m tools.ink.qa coverage <video | frames dir | image> --ground paper|night --budget 15 [--every 0.5]
                       [--thr 0.07] [--sheet out.jpg] [--json out.json]
        Share of pixels that differ from the ground by more than a threshold, per sampled frame. A frame more than
        ten points over the budget is flagged (exit code 1 if any frame is flagged).
    PY -m tools.ink.qa squint <video | frames dir | image> [--width 32] [--every 0.5] --out strip.png
        Shrinks each sampled frame to 32 px wide and writes a contact strip (shown enlarged, nearest-neighbour).
        Also prints, per frame, where the dark mass sits and how much of it is in one quadrant.

The ground is estimated per frame from the frame itself (the most common tone on its border, followed across slow
lighting changes such as a flashlight pool), so it works on lit pages and on night grounds without being told the
paper colour. Paper fibres and grain are below the threshold by design.
"""
import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np

from .core import F32, blur, contact_strip, load_image, luma, save_image
from .paper import estimate_ground


def sample_frames(src, every=0.5, max_frames=400):
    """Yield (t, frame float RGB) from a video file, a directory of images, or one image."""
    p = Path(src)
    if p.is_dir():
        files = sorted([f for f in p.iterdir() if f.suffix.lower() in ('.png', '.jpg', '.jpeg')])
        step = max(1, int(round(every * 24)))
        for i in range(0, len(files), step):
            yield i / 24.0, load_image(files[i])
        return
    if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.tif', '.tiff'):
        yield 0.0, load_image(p)
        return
    cap = cv2.VideoCapture(str(p))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    step = max(1, int(round(every * fps)))
    i = 0
    while True:
        ok = cap.grab()
        if not ok:
            break
        if i % step == 0:
            ok, fr = cap.retrieve()
            if not ok:
                break
            yield i / fps, fr[..., ::-1].astype(F32) / 255.0
        i += 1
    cap.release()


def mark_mask(frame, ground='paper', thr=0.07):
    """Boolean HxW mask of 'marks': pixels differing from the estimated ground by more than thr (max channel)."""
    h, w = frame.shape[:2]
    s = 480.0 / max(w, 1)
    small = cv2.resize(frame, (480, max(8, int(h * s))), interpolation=cv2.INTER_AREA) if w > 480 else frame
    small = blur(small, 0.8)                                       # fibres and grain are not marks
    col, field = estimate_ground(small, dark=(ground == 'night'))
    if ground == 'night':
        diff = np.clip(small - field, 0, 1).max(axis=2) + 0.5 * np.clip(field - small, 0, 1).max(axis=2)
    else:
        diff = np.abs(small - field).max(axis=2)
    return diff > thr, col


def coverage(frame, ground='paper', thr=0.07):
    """Ink coverage of one frame in percent."""
    m, _ = mark_mask(frame, ground, thr)
    return 100.0 * float(m.mean())


def squint(frame, width=32):
    h, w = frame.shape[:2]
    return cv2.resize(frame, (width, max(1, int(round(h * width / w)))), interpolation=cv2.INTER_AREA)


def mass_report(frame, ground='paper', thr=0.07):
    """Where the marks sit: (centroid x 0..1, centroid y 0..1, share of mark mass in the heaviest quadrant)."""
    m, _ = mark_mask(frame, ground, thr)
    tot = float(m.sum())
    if tot < 1:
        return 0.5, 0.5, 0.0
    ys, xs = np.nonzero(m)
    cx, cy = float(xs.mean()) / m.shape[1], float(ys.mean()) / m.shape[0]
    hh, ww = m.shape[0] // 2, m.shape[1] // 2
    q = [m[:hh, :ww].sum(), m[:hh, ww:].sum(), m[hh:, :ww].sum(), m[hh:, ww:].sum()]
    return cx, cy, float(max(q)) / tot


def cmd_coverage(a):
    rows, flagged, sheet = [], 0, []
    for t, fr in sample_frames(a.src, a.every):
        m, col = mark_mask(fr, a.ground, a.thr)
        c = 100.0 * float(m.mean())
        flag = c > a.budget + 10.0
        flagged += flag
        rows.append(dict(t=round(t, 3), coverage=round(c, 2), flag=bool(flag)))
        print(f'{t:8.2f} s  {c:5.1f} %  {"OVER (budget %g + 10)" % a.budget if flag else ""}')
        if a.sheet and len(sheet) < 48:
            sm = cv2.resize(fr, (m.shape[1], m.shape[0]), interpolation=cv2.INTER_AREA)
            ov = sm * 0.45
            ov[m] = ov[m] * 0.3 + np.array([0.75, 0.16, 0.1], F32) * 0.7
            sheet.append(np.hstack([sm, ov]))
    if not rows:
        print('no frames')
        return 2
    cs = [r['coverage'] for r in rows]
    print(f'frames {len(rows)}  mean {np.mean(cs):.1f} %  max {np.max(cs):.1f} %  budget {a.budget:g} %  '
          f'flagged {flagged}')
    if a.sheet:
        save_image(Path(a.sheet).resolve(), contact_strip(sheet, cols=min(4, len(sheet))))
    if a.json:
        Path(a.json).write_text(json.dumps(dict(src=str(a.src), ground=a.ground, budget=a.budget, thr=a.thr,
                                                frames=rows), indent=1))
    return 1 if flagged else 0


def cmd_squint(a):
    tiles = []
    for t, fr in sample_frames(a.src, a.every):
        s = squint(fr, a.width)
        cx, cy, q = mass_report(fr, a.ground, a.thr)
        print(f'{t:8.2f} s  mass at ({cx:.2f}, {cy:.2f})  {q * 100:4.0f} % in one quadrant')
        tiles.append(cv2.resize(s, (s.shape[1] * a.zoom, s.shape[0] * a.zoom), interpolation=cv2.INTER_NEAREST))
    if not tiles:
        print('no frames')
        return 2
    out = Path(a.out or (str(Path(a.src).with_suffix('')) + '_squint.png')).resolve()
    save_image(out, contact_strip(tiles, cols=a.cols or min(12, len(tiles)), pad=3))
    print(out)
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog='python -m tools.ink.qa', description=__doc__.split('\n\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    for name in ('coverage', 'squint'):
        s = sub.add_parser(name)
        s.add_argument('src')
        s.add_argument('--ground', choices=('paper', 'night'), default='paper')
        s.add_argument('--thr', type=float, default=0.07)
        s.add_argument('--every', type=float, default=0.5, help='seconds between sampled frames')
        if name == 'coverage':
            s.add_argument('--budget', type=float, default=15.0)
            s.add_argument('--sheet')
            s.add_argument('--json')
        else:
            s.add_argument('--width', type=int, default=32)
            s.add_argument('--zoom', type=int, default=6)
            s.add_argument('--cols', type=int)
            s.add_argument('--out')
    a = ap.parse_args(argv)
    return cmd_coverage(a) if a.cmd == 'coverage' else cmd_squint(a)


if __name__ == '__main__':
    sys.exit(main())
