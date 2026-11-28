"""Glasses contact sheets (2026-11-27): per canonical frame (engine/glasses.js FRAMES), one image with
  row 1: the cast heads sheet, cropped to the glasses (front, three-quarter, profile), 3x;
  row 2: the glassestest guide, lit (front, three-quarter, profile);
  row 3: the glassestest guide, front: line, form, flat;
  rows 4+: scene shots where the wearer is visible (lit and line, cropped round the eyes from the sidecar).
Writes media/layout/_sheets/glasses_<frame>.jpg. Run after the renders:
  node layout/render.mjs --set glassestest --modes lit,line,flat,form --nojson
  .venv/bin/python layout/sets/glassestest/sheet.py
Dad 2023 has no sheet (his frame comes from a LOOK-ONLY real photo, which is never copied into a sheet)."""
import json, os
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
L = os.path.join(ROOT, 'media', 'layout')
OUT = os.path.join(L, '_sheets')
W = 1920
CAST = {   # sheet, crop boxes (front, three-quarter, profile) in sheet pixels
    'jade27': ('cast/jade_27/jade27_H_heads_v1.jpg', [(250, 130, 470, 240), (740, 580, 960, 690), (1170, 120, 1390, 230)]),
    'jade19': ('cast/jade_19/jade19_H_heads_v1.jpg', [(230, 150, 440, 255), (720, 580, 940, 690), (1180, 130, 1390, 235)]),
    'mama': ('cast/mama/mama_R_rest_heads_v1.jpg', [(240, 160, 480, 260), (760, 580, 980, 690), (1160, 150, 1380, 260)]),
    'dad90': ('cast/dad/dad_H_heads_v5_likeness.jpg', [(210, 150, 460, 265), (1190, 590, 1460, 715), (1180, 140, 1420, 255)]),
    'dad23': (None, []),
}
WHO = {'jade27': 'jade27', 'jade19': 'jade19', 'mama': None, 'dad90': 'dad', 'dad23': 'dad'}
SCENES = {
    'jade27': [('mv10', 'V3_rev_temple_b'), ('mv10', 'V3_rev_temple_a'), ('mv10', 'BR1'), ('mv10', 'BR2'), ('mortongrove07', 'MG1'), ('mortongrove07', 'MG2')],
    'jade19': [('closet02', 'CL_chin'), ('closet02', 'CL_ots'), ('closet02', 'CL_wide')],
    'mama': [('kitchen90', 'K6_mother'), ('office91', 'PC2'), ('market93', 'M5'), ('shanghai86', 'V1e'), ('attic88_day', 'AD_grab'), ('wall88', 'WL_in')],
    'dad90': [('basement90', 'B2_face'), ('basement90', 'B4_doubletake'), ('kitchen90', 'K1_question_end'), ('office91', 'PC2')],
    'dad23': [('playground23', 'PG1')],
}


def label(im, text):
    d = ImageDraw.Draw(im); d.rectangle((0, 0, 8 + 7 * len(text), 16), fill=(0, 0, 0)); d.text((4, 2), text, fill=(255, 255, 255)); return im


def row(ims, h):
    out = Image.new('RGB', (W, h), (235, 230, 220)); x = 0; w = W // max(1, len(ims))
    for im in ims:
        im = im.copy(); im.thumbnail((w, h)); out.paste(im, (x + (w - im.width) // 2, (h - im.height) // 2)); x += w
    return out


def scene_crop(set_, shot, mode):
    p = os.path.join(L, set_, f'{shot}_{mode}.png'); j = os.path.join(L, set_, f'{shot}.json')
    if not os.path.exists(p): return None
    im = Image.open(p).convert('RGB')
    try:
        d = json.load(open(j)); heads = d.get('heads', {})
        k = next(k for k in heads if k in ('jade27', 'jade19', 'mama', 'mama86', 'mama90', 'mama91', 'dad') and heads[k].get('in_frame'))
        e, m = heads[k]['eyes'], heads[k]['mouth']; s = max(60, 4.5 * ((e[0] - m[0]) ** 2 + (e[1] - m[1]) ** 2) ** 0.5)
        cx, cy = e[0], e[1]   # sidecar px: x right, y down (as PIL)
        if not (0 <= cx < im.width and 0 <= cy < im.height): raise ValueError
        box = (int(max(0, cx - 1.6 * s)), int(max(0, cy - s)), int(min(im.width, cx + 1.6 * s)), int(min(im.height, cy + s)))
        if box[2] - box[0] < 40 or box[3] - box[1] < 30: raise ValueError
        im = im.crop(box)
    except Exception:
        pass
    return label(im, f'{set_} {shot} {mode}')


def main():
    os.makedirs(OUT, exist_ok=True)
    for fid, (sheet, boxes) in CAST.items():
        rows = []
        if sheet:
            S = Image.open(os.path.join(ROOT, sheet)).convert('RGB')
            rows.append(row([label(S.crop(b).resize(((b[2] - b[0]) * 3, (b[3] - b[1]) * 3)), f'{sheet} ({v})') for b, v in zip(boxes, ['front', '3/4', 'profile'])], 330))
        else:
            ph = Image.new('RGB', (900, 200), (235, 230, 220)); ImageDraw.Draw(ph).text((20, 90), 'no cast sheet: modelled from a LOOK-ONLY photo (playground23 NOTES); not shown', fill=(0, 0, 0)); rows.append(row([ph], 200))
        G = os.path.join(L, 'glassestest')
        crop = lambda im: im.crop((420, 160, 1500, 860))
        rows.append(row([label(crop(Image.open(f'{G}/{fid}_{v}_lit.png').convert('RGB')), f'guide {v} lit') for v in ['front', 'q3', 'profile']], 420))
        rows.append(row([label(crop(Image.open(f'{G}/{fid}_front_{m}.png').convert('RGB')), f'guide front {m}') for m in ['line', 'form', 'flat']], 420))
        sc = SCENES[fid]
        for i in range(0, len(sc), 2):
            ims = []
            for s_, sh in sc[i:i + 2]:
                for m in ['lit', 'line']:
                    c = scene_crop(s_, sh, m)
                    if c: ims.append(c)
            if ims: rows.append(row(ims, 360))
        H = sum(r.height for r in rows); out = Image.new('RGB', (W, H)); y = 0
        for r in rows: out.paste(r, (0, y)); y += r.height
        p = os.path.join(OUT, f'glasses_{fid}.jpg'); out.save(p, quality=88); print(p)


if __name__ == '__main__':
    main()
