#!/usr/bin/env python3
"""Test outputs for tools/kf/comp.py -> media/keyframes/_comp_test/ (specs are written beside the pictures).

    /home/jade/Documents/halys-video/.venv/bin/python -m tools.kf.comp_tests [pad final wide sheet crops 4k]
"""
import glob
import json
import os
import sys
import time

import cv2
import numpy as np

from tools.kf import comp

OUT = 'media/keyframes/_comp_test'
BEAM = 'media/layout/attic88_day/beam_AD_wide_flat.png'


def _write(name, spec):
    spec = dict(spec, out=f'{OUT}/{name}.jpg')
    p = os.path.join(comp.ROOT, OUT, name + '.json')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w') as f:
        json.dump(spec, f, indent=1)
    t = time.time()
    path, info = comp.run(spec)
    print(f'{name}: {time.time() - t:.1f}s {info}')
    return spec


def pad():
    return _write('pad_0000', {
        'wash_band': {'angle_deg': 40, 'width': 300, 'through': [960, 540], 'density': 0.55, 'tint': 'attic'},
        'motes': {'seed': 3, 'n': 40, 'region': 'beam', 'size': [1.6, 5.0], 'hero': None},
    })


def final():
    return _write('final_frame', {
        'gold': [{'type': 'dots', 'path': [[420, 742], [760, 668], [1040, 628], [1238, 610]], 'gap': 15, 'seed': 5}],
    })


def beam_mid():
    m = comp.load_mask(BEAM, 1920, 1080) > 0.5
    # the midpoint of the band: halfway along its long axis, on its centre line
    ys, xs = np.where(m)
    pts = np.stack([xs, ys], 1).astype(np.float64)
    c = pts.mean(0)
    _, _, vt = np.linalg.svd(pts[::97] - c, full_matrices=False)
    t = (pts - c) @ vt[0]
    mid = c + vt[0] * (t.min() + t.max()) / 2
    return [int(round(mid[0])), int(round(mid[1]))], vt[0]


def wide():
    hero, ax = beam_mid()
    if ax[0] < 0:
        ax = -ax
    specs = []
    for src in sorted(glob.glob(os.path.join(comp.ROOT, 'media/keyframes/_looktest/ad_wide_v1_*.jpg'))):
        tag = os.path.basename(src)[len('ad_wide_v1_'):-4]
        a = np.array(hero, float) + ax * 62 + [0, 6]
        b = np.array(hero, float) + ax * 300 + [0, -4]
        specs.append(_write(f'AD_wide_{tag}', {
            'src': os.path.relpath(src, comp.ROOT),
            'beam': {'mask': BEAM},
            'shadow': {'tint': 'attic', 'floor': 0.40, 'auto_level': 0.45, 'retint': 0.6},
            'motes': {'seed': 11, 'n': 70, 'region': 'beam', 'size': [1.6, 5.0], 'hero': hero},
            'gold': [{'type': 'ring', 'at': hero, 'r': 30},
                     {'type': 'dots', 'path': [a.round().tolist(), b.round().tolist()], 'gap': 15}],
        }))
    return specs


def example():
    """The README's worked example: every layer on one still, the figure protected."""
    hero, ax = beam_mid()
    return _write('AD_wide_example', {
        'src': 'media/keyframes/_looktest/ad_wide_v1_codex.jpg',
        'paper': {'variant': 'new', 'seed': 7},
        'beam': {'mask': BEAM, 'lift': 1.0, 'line_keep': 0.6, 'feather': 5, 'rough': 1.0, 'fill_holes': True,
                 'protect': [[[420, 600], [520, 555], [618, 590], [630, 700], [612, 790], [700, 850], [850, 880],
                              [800, 995], [680, 1020], [600, 1045], [400, 1045], [325, 990], [370, 860], [400, 740]]]},
        'shadow': {'tint': 'attic', 'floor': 0.40, 'auto_level': 0.45, 'retint': 0.6},
        'motes': {'seed': 11, 'n': 70, 'region': 'beam', 'size': [1.6, 5.0], 'hero': hero},
        'gold': [{'type': 'ring', 'at': hero, 'r': 30},
                 {'type': 'dots', 'path': [[hero[0] + 52, hero[1] - 30], [hero[0] + 290, hero[1] - 196]], 'gap': 15},
                 {'type': 'text', 'at': [hero[0] + 46, hero[1] + 40], 'text': '1', 'size': 30},
                 {'type': 'text', 'at': [1500, 800], 'text': '88 ?', 'size': 40},
                 {'type': 'underline', 'from': [1494, 812], 'to': [1640, 808]},
                 {'type': 'ticks', 'at': [1500, 900], 'n': 7, 'size': 26}],
        'toner': [{'text': 'ANXIOUS', 'at': [250, 300], 'size': 40, 'rot': -3, 'gen': 3}],
        'header': {'text': 'Attic, 1988', 'at': [96, 84], 'size': 30},
    })


def sheet():
    toner = [{'text': 'ANXIOUS', 'at': [330, 150 + 150 * (g - 1)], 'size': 44, 'rot': [-1.5, 1.0, -0.6, 1.6, -1.0][g - 1],
              'gen': g} for g in range(1, 6)]
    toner += [{'text': 'RESTING OBLIVIOUS FACE', 'at': [830, 150 + 150 * (g - 1)], 'size': 26, 'rot': 0, 'gen': g}
              for g in range(1, 6)]
    gold = [{'type': 'text', 'at': [1130, 190], 'text': '0123456789?', 'size': 56},
            {'type': 'text', 'at': [1130, 300], 'text': '1988  7+5=12 ?', 'size': 34},
            {'type': 'text', 'at': [1130, 372], 'text': '0 1 2 3 4 5 6 7 8 9 ?', 'size': 22},
            {'type': 'ring', 'at': [1220, 520], 'r': 46}, {'type': 'ring', 'at': [1360, 520], 'r': 22},
            {'type': 'ring', 'at': [1450, 520], 'r': 11},
            {'type': 'dots', 'path': [[1130, 640], [1400, 620], [1760, 660]], 'gap': 14},
            {'type': 'line', 'path': [[1130, 720], [1300, 700], [1500, 730], [1760, 705]]},
            {'type': 'underline', 'from': [1130, 790], 'to': [1500, 786]},
            {'type': 'ticks', 'at': [1140, 900], 'n': 13, 'size': 30},
            {'type': 'text', 'at': [1560, 560], 'text': '?', 'size': 90}]
    return _write('sheet_toner_gold', {
        'wash_band': {'angle_deg': 90, 'through': [1500, 540], 'width': 2200, 'density': 0.0},
        'toner': toner, 'gold': gold, 'header': {'text': '1. Shanghai, 1986.', 'at': [96, 60], 'size': 30},
    })


def crops():
    """Zoomed crops (3x, nearest) of the things that must not look digital."""
    def crop(name, box, k=3):
        a = cv2.imread(os.path.join(comp.ROOT, OUT, name + '.jpg'))
        x, y, w, h = box
        c = cv2.resize(a[y:y + h, x:x + w], None, fx=k, fy=k, interpolation=cv2.INTER_NEAREST)
        return c
    hero, _ = beam_mid()
    out = {}
    for f in sorted(glob.glob(os.path.join(comp.ROOT, OUT, 'AD_wide_*.jpg'))):
        n = os.path.basename(f)[:-4]
        if n.endswith('_4k') or n.endswith('_example'):
            continue
        out[f'crop_{n}_edge'] = crop(n, (560, 500, 400, 240))
        out[f'crop_{n}_hero'] = crop(n, (hero[0] - 200, hero[1] - 120, 400, 240))
        out[f'crop_{n}_edge2'] = crop(n, (1000, 640, 400, 240))
    out['crop_example_shadow_marks'] = crop('AD_wide_example', (1440, 720, 400, 240))
    out['crop_example_figure'] = crop('AD_wide_example', (300, 540, 600, 500), 2)
    out['crop_pad_edge'] = crop('pad_0000', (760, 300, 400, 240))
    out['crop_sheet_toner'] = crop('sheet_toner_gold', (140, 80, 560, 760), 2)
    out['crop_sheet_toner_small'] = crop('sheet_toner_gold', (660, 80, 360, 760), 3)
    out['crop_sheet_numerals'] = crop('sheet_toner_gold', (1100, 100, 620, 300), 3)
    out['crop_sheet_marks'] = crop('sheet_toner_gold', (1100, 440, 700, 500), 2)
    out['crop_final_dots'] = crop('final_frame', (900, 540, 400, 160))
    for k, v in out.items():
        cv2.imwrite(os.path.join(comp.ROOT, OUT, k + '.png'), v)
    print('crops:', ', '.join(out))


def four_k():
    for src in [os.path.join(comp.ROOT, OUT, 'AD_wide_example.json')]:
        t = time.time()
        path, info = comp.run(src, out=src[:-5] + '_4k.jpg', size=[3840, 2160])
        print(f'4k: {time.time() - t:.1f}s {info}')


if __name__ == '__main__':
    todo = sys.argv[1:] or ['pad', 'final', 'wide', 'example', 'sheet', 'crops']
    for n in todo:
        {'pad': pad, 'final': final, 'wide': wide, 'example': example, 'sheet': sheet, 'crops': crops, '4k': four_k}[n]()
