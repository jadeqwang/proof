"""Before / after sheets for the canonical brows and refitted glasses (2026-11-27): per character, one image with
  col 1: the cast heads sheet, cropped to the face; col 2: the OLD guide (front lit, front line, 3/4 lit); col 3: the NEW
  guide (same passes). Usage:
  .venv/bin/python layout/sets/glassestest/brows_sheet.py <old glassestest dir> [<new glassestest dir>]
Writes media/layout/_sheets/brows_<character>.jpg. Also writes overlay_front.jpg: each sheet's front head scaled so its
pupils land on the guide's (61 mm apart at the body's eye spacing), the guide's line pass on top in red."""
import os, sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'media', 'layout', '_sheets')
NEW = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'media', 'layout', 'glassestest')
OLD = sys.argv[1]
FACE = {   # sheet, face crop
    'jade27': ('cast/jade_27/jade27_H_heads_v1.jpg', (230, 60, 490, 300)),
    'jade19': ('cast/jade_19/jade19_H_heads_v1.jpg', (210, 70, 470, 310)),
    'mama': ('cast/mama/mama_R_rest_heads_v1.jpg', (220, 70, 500, 330)),
    'dad90': ('cast/dad/dad_H_heads_v5_likeness.jpg', (190, 60, 480, 330)),
    'dad23': (None, None),
    'jade23': ('cast/jade_27/jade27_H_heads_v1.jpg', (230, 60, 490, 300)),
    'jade3': ('cast/little_jade_03/lj03_H_heads_v1.jpg', (250, 110, 450, 310)),
    'littleJade': ('cast/little_jade_05/lj05_P_proof_acting_v2.jpg', (252, 90, 452, 290)),
    'jade7': ('cast/little_jade_07/lj07_H_heads_v1.jpg', (252, 90, 452, 290)),
    'jade10': ('cast/little_jade_10/lj10_H_heads_v1.jpg', (310, 120, 510, 320)),
}
PUPILS = {'jade27': ((320, 176), (400, 176), 0.06092), 'jade19': ((296.25, 186.25), (375, 186.25), 0.06332),
          'mama': ((308.75, 201.25), (393.75, 197.5), 0.059), 'dad90': ((286.7, 196.7), (373.3, 195), 0.06162)}


def lab(im, t):
    d = ImageDraw.Draw(im); d.rectangle((0, 0, 8 + 7 * len(t), 16), fill=(0, 0, 0)); d.text((4, 2), t, fill=(255, 255, 255)); return im


def cell(path, t, w=420, h=300):
    if not os.path.exists(path): im = Image.new('RGB', (w, h), (200, 200, 200)); return lab(im, t + ' (missing)')
    im = Image.open(path).convert('RGB').crop((420, 120, 1500, 900)); im.thumbnail((w, h)); return lab(im, t)


def main():
    os.makedirs(OUT, exist_ok=True)
    for k, (sh, box) in FACE.items():
        cols = []
        if sh:
            S = Image.open(os.path.join(ROOT, sh)).convert('RGB').crop(box); S = S.resize((420, int(S.height * 420 / S.width)), Image.LANCZOS); cols.append([lab(S, sh.split('/')[-1])])
        else:
            ph = Image.new('RGB', (420, 300), (235, 230, 220)); ImageDraw.Draw(ph).text((10, 140), 'no sheet (look-only photo, not shown)', fill=(0, 0, 0)); cols.append([ph])
        for nm, d in (('OLD', OLD), ('NEW', NEW)):
            cols.append([cell(f'{d}/{k}_front_lit.png', f'{nm} front lit'), cell(f'{d}/{k}_front_line.png', f'{nm} front line'), cell(f'{d}/{k}_q3_lit.png', f'{nm} 3/4 lit')])
        W = 1280; H = max(sum(c.height for c in col) for col in cols); out = Image.new('RGB', (W, H), (235, 230, 220)); x = 0
        for col in cols:
            y = 0
            for c in col: out.paste(c, (x, y)); y += c.height
            x += 430
        p = os.path.join(OUT, f'brows_{k}.jpg'); out.save(p, quality=88); print(p)
    # overlay: the sheets' front heads under the NEW line pass
    outs = []
    for k, (a, b, pd) in PUPILS.items():
        sh = os.path.join(ROOT, FACE[k][0]); rp = pd / 0.62 * (85 / 36 * 1920); s = rp / np.hypot(b[0] - a[0], b[1] - a[1])
        S = Image.open(sh).convert('L'); S = S.resize((int(S.width * s), int(S.height * s)), Image.LANCZOS)
        mx, my = (a[0] + b[0]) / 2 * s, (a[1] + b[1]) / 2 * s
        can = Image.new('L', (1920, 1080), 255); can.paste(S, (int(960 - mx), int(540 - my)))
        base = np.array(can).astype(float) * 0.55 + 115; L = np.array(Image.open(f'{NEW}/{k}_front_line.png').convert('L')) < 128
        rgb = np.stack([base] * 3, -1); rgb[L] = [230, 0, 0]
        outs.append(lab(Image.fromarray(rgb.clip(0, 255).astype('uint8')).crop((420, 230, 1500, 860)).resize((960, 560)), f'{k}: sheet (grey) under the guide line pass (red)'))
    o = Image.new('RGB', (1920, 1120))
    for i, im in enumerate(outs): o.paste(im, ((i % 2) * 960, (i // 2) * 560))
    p = os.path.join(OUT, 'overlay_front.jpg'); o.save(p, quality=88); print(p)


if __name__ == '__main__':
    main()
