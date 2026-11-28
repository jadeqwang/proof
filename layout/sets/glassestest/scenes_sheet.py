"""Scene before / after for the brows + glasses refit (2026-11-27): per shot, OLD lit | OLD line | NEW lit | NEW line,
cropped round the wearer's eyes (sidecar heads px). Usage: .venv/bin/python layout/sets/glassestest/scenes_sheet.py <old media/layout copy>
Writes media/layout/_sheets/brows_scenes_before_after.jpg."""
import json, os, sys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
NEW = os.path.join(ROOT, 'media', 'layout'); OLD = sys.argv[1]
SHOTS = [('mv10', 'V3_rev_temple_b', None), ('mv10', 'V3_rev_temple_a', 'jade27'), ('mv10', 'BR1', 'jade27'), ('mortongrove07', 'MG1', 'jade27'),
         ('closet02', 'CL_chin', 'jade19'), ('kitchen90', 'K6_mother', 'mama90'), ('office91', 'PC2', 'dad'), ('basement90', 'B2_face', 'dad'),
         ('basement90', 'B4_doubletake', 'dad'), ('shanghai86', 'V1e', 'mama86'), ('kitchen90', 'K7_turns', 'jade7'), ('market93', 'M4c', 'jade10'),
         ('attic88_day', 'AD_piano', 'littleJade'), ('wall88', 'WL_eye', 'littleJade'), ('playground23', 'PG1', 'dad')]
def crop(d, s, sh, m, who):
    p = f'{d}/{s}/{sh}_{m}.png'
    if not os.path.exists(p): return Image.new('RGB', (470, 300), (200, 200, 200))
    im = Image.open(p).convert('RGB')
    try:
        h = json.load(open(f'{NEW}/{s}/{sh}.json'))['heads'][who]; e, mo = h['eyes'], h['mouth']; r = max(70, 3.2 * ((e[0] - mo[0]) ** 2 + (e[1] - mo[1]) ** 2) ** 0.5)
        b = (int(max(0, e[0] - 1.55 * r)), int(max(0, e[1] - r)), int(min(im.width, e[0] + 1.55 * r)), int(min(im.height, e[1] + r)))
        if b[2] - b[0] > 40 and b[3] - b[1] > 30: im = im.crop(b)
    except Exception: pass
    im.thumbnail((470, 300)); return im
rows = []
for s, sh, who in SHOTS:
    r = Image.new('RGB', (1920, 310), (235, 230, 220)); x = 0
    for d, nm in ((OLD, 'OLD'), (NEW, 'NEW')):
        for m in ('lit', 'line'):
            c = crop(d, s, sh, m, who); r.paste(c, (x + (470 - c.width) // 2, 5)); dr = ImageDraw.Draw(r); dr.rectangle((x, 0, x + 200, 14), fill=(0, 0, 0)); dr.text((x + 3, 1), f'{nm} {s} {sh} {m}', fill=(255, 255, 255)); x += 480
    rows.append(r)
o = Image.new('RGB', (1920, 310 * len(rows)))
for i, r in enumerate(rows): o.paste(r, (0, i * 310))
p = os.path.join(NEW, '_sheets', 'brows_scenes_before_after.jpg'); o.save(p, quality=85); print(p)
