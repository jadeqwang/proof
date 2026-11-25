"""Synthesise the test clips for the video-ingestion demos (stand-ins for generated footage; none exists yet):
  work/ink_demo/src/figure_on_paper.mp4   an ink performer doing a staff form on drifting, flickering cream paper
  work/ink_demo/src/mist_on_dark.mp4      mist drifting on a plain dark ground
Both are compressed like a video-model deliverable (1280x720, h264, modest bitrate).
Run:  python tools/ink/demos/d12_make_src.py
"""
import math
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from tools.ink import *                                          # noqa

W, H, FPS_, N = 1280, 720, 24, 144
OUT = ROOT / 'work' / 'ink_demo' / 'src'


def enc(path, crf=27):
    return subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                             '-r', str(FPS_), '-i', '-', '-an', '-vf',
                             'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-crf',
                             str(crf), '-preset', 'medium', '-colorspace', 'bt709', '-color_primaries', 'bt709',
                             '-color_trc', 'bt709', '-color_range', 'tv', str(path)], stdin=subprocess.PIPE)


def pose(t):
    """Joint positions (px) of a small performer doing a staff form: lunge, spin the staff, leap, land."""
    cx = 640 + 150 * math.sin(t * 0.9) + 40 * math.sin(t * 2.3)
    hop = max(0.0, math.sin((t - 2.2) * 2.4)) ** 2 * 120 if 2.2 < t < 3.6 else 0.0
    crouch = 18 * math.sin(t * 2.6) + 10
    hip = np.array([cx, 470 + crouch - hop])
    lean = 0.25 * math.sin(t * 1.7)
    chest = hip + 110 * np.array([math.sin(lean), -math.cos(lean)])
    head = chest + 42 * np.array([math.sin(lean * 1.5), -math.cos(lean * 1.5)])
    st = 0.55 + 0.25 * math.sin(t * 1.3)
    kl = hip + 75 * np.array([-math.sin(st + 0.3), math.cos(st + 0.3)])
    kr = hip + 75 * np.array([math.sin(st), math.cos(st)])
    fl = kl + 78 * np.array([-math.sin(0.1 + 0.3 * math.sin(t * 2.6)), math.cos(0.1)])
    fr = kr + 78 * np.array([math.sin(0.25 * math.sin(t * 2.6 + 1)), math.cos(0.1)])
    if hop > 0:
        fl[1] -= hop * 0.5
        fr[1] -= hop * 0.25
    # the staff spins about the hands: slow, then a fast flower, then a held thrust
    a = 0.6 * t + 5.5 * smoothstep(1.0, 3.2, t) * 2.2 + 2.0 * smoothstep(3.2, 4.2, t) + 0.3 * math.sin(t * 3)
    grip = chest + np.array([40 * math.cos(t * 1.1), 25 + 20 * math.sin(t * 2.2)])
    d = np.array([math.cos(a), math.sin(a)])
    s0, s1 = grip - 150 * d, grip + 190 * d
    el = (chest + grip) / 2 + np.array([-28, 22])
    er = (chest + grip) / 2 + np.array([30, 18])
    return dict(hip=hip, chest=chest, head=head, kl=kl, kr=kr, fl=fl, fr=fr, grip=grip, s0=s0, s1=s1, el=el, er=er)


def figure_mask(p):
    m = np.zeros((H, W), np.float32)
    thin = np.zeros((H, W), np.float32)

    def cap(a, b, w, dst=m):
        cv2.line(dst, (int(a[0] * 8), int(a[1] * 8)), (int(b[0] * 8), int(b[1] * 8)), 1.0, int(w), cv2.LINE_AA, 3)
    cap(p['hip'], p['chest'], 46)
    cv2.circle(m, (int(p['head'][0]), int(p['head'][1])), 24, 1.0, -1, cv2.LINE_AA)
    cap(p['hip'], p['kl'], 30); cap(p['kl'], p['fl'], 22)
    cap(p['hip'], p['kr'], 30); cap(p['kr'], p['fr'], 22)
    cap(p['chest'], p['el'], 20); cap(p['el'], p['grip'], 16)
    cap(p['chest'], p['er'], 20); cap(p['er'], p['grip'], 16)
    cap(p['s0'], p['s1'], 7, thin)
    return m, thin


def make_figure():
    ground = np.array([0.905, 0.868, 0.772], np.float32)          # NOT our paper colour: a model's idea of cream
    tex = (fbm(H + 80, W + 80, 60, 5, 'gt', octaves=5) - 0.5) * 0.05 + grain(H + 80, W + 80, 5, 'gg', sigma=0.8) * 0.012
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    vig = 1 - 0.08 * (((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2) * 4
    r = rng(5, 'flick')
    p = enc(OUT / 'figure_on_paper.mp4')
    tips = []
    for i in range(N):
        t = i / FPS_
        ps = pose(t)
        m, thin = figure_mask(ps)
        d = wash(m, None, 3, 0.8, bleed=4, edge=0.35, pool=0.5) + wash(thin, None, 4, 0.9, bleed=1.2, edge=0.1, pool=0.2)
        # camera/paper drift, a breath of zoom and brightness flicker, as a video model would add
        dx, dy = 5 * math.sin(t * 0.8) + 2 * math.sin(t * 2.9), 3 * math.cos(t * 0.6)
        z = 1 + 0.006 * math.sin(t * 0.5)
        M = np.array([[z, 0, dx + (1 - z) * W / 2], [0, z, dy + (1 - z) * H / 2]], np.float64)
        g = ground[None, None] * (1 + tex[40:40 + H, 40:40 + W])[..., None]
        fr = g * ink_T(d)
        fr = cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        fr = fr * vig[..., None] * (1 + 0.018 * math.sin(t * 7.0) + 0.008 * float(r.normal()))
        fr = fr + grain(H, W, 100 + i, 'n', sigma=0.5)[..., None] * 0.008
        p.stdin.write(to_u8(fr).tobytes())
        tips.append([t, float(ps['s1'][0]), float(ps['s1'][1])])
    p.stdin.close(); p.wait()
    np.save(OUT / 'figure_on_paper_tip_truth.npy', np.array(tips))


def make_mist():
    big = fbm(H, W * 3, 420, 9, 'm', octaves=5, gain=0.55)
    big2 = fbm(H, W * 3, 180, 10, 'm2', octaves=4)
    yy = np.arange(H, dtype=np.float32)[:, None]
    band = np.exp(-((yy - 400) / 150) ** 2)
    p = enc(OUT / 'mist_on_dark.mp4', crf=26)
    for i in range(N):
        t = i / FPS_
        o1, o2 = int(t * 40), int(t * 65)
        a = smoothstep(0.42, 0.75, big[:, o1:o1 + W] * 0.65 + big2[:, o2:o2 + W] * 0.35) * band
        g = np.array([0.045, 0.05, 0.075], np.float32) * (1 + 0.03 * math.sin(t * 5))
        fr = g[None, None] * (1 - a[..., None]) + np.array([0.82, 0.84, 0.86], np.float32) * a[..., None] * 0.8 \
            + g[None, None] * a[..., None] * 0.2
        fr = fr + grain(H, W, 300 + i, 'n', sigma=0.5)[..., None] * 0.006
        p.stdin.write(to_u8(fr).tobytes())
    p.stdin.close(); p.wait()


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    make_figure()
    make_mist()
    print('wrote', OUT)
