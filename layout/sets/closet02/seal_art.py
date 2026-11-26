"""closet02: the ONE canonical seal print for Jade's red university sweatshirt (2026-11-26, Jade: "put her in the red
stanford sweatshirt, white seal on pocket level, but scrunched up and illegible b/c of fabric").
A crisp, simple white circular seal drawn in code, NOT the real seal: an outer rim, a thin second ring, an inner ring and
a tree silhouette. No letters and no letter-like marks (Jade, r4: the first version's band of marks read as a smear). White on transparent; the set
flattens it onto the cardinal garment colour. Writes layout/assets/art/logos/closet_seal.png (+ .txt).
Run: python3 layout/sets/closet02/seal_art.py"""
import math, os
from PIL import Image, ImageDraw

S = 1024; SS = 2                      # supersampled, then downsized
W = S * SS; c = W / 2
im = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
WH = (250, 248, 244, 255)
def ring(r0, r1):
    d.ellipse([c - r1, c - r1, c + r1, c + r1], fill=WH); d.ellipse([c - r0, c - r0, c + r0, c + r0], fill=(0, 0, 0, 0))
R = W * 0.49
ring(R * 0.955, R)                     # outer rim
# (the inner rim is drawn below, after the second ring, so the second ring does not erase it)
# 2026-11-26 (Jade: the first version read as "whatever that is"): NO marks in the band at all, just a clean double ring
ring(R * 0.80, R * 0.835)
ring(R * 0.70, R * 0.73)               # inner rim
# a tree in the middle: trunk + three tiers (a generic conifer), on a small ground line
r = R * 0.66
d.rectangle([c - r * 0.06, c + r * 0.25, c + r * 0.06, c + r * 0.62], fill=WH)
for k, (top, bot, half) in enumerate([(-0.62, -0.12, 0.30), (-0.32, 0.12, 0.42), (-0.05, 0.34, 0.55)]):
    d.polygon([(c, c + r * top), (c - r * half, c + r * bot), (c + r * half, c + r * bot)], fill=WH)
d.rectangle([c - r * 0.55, c + r * 0.60, c + r * 0.55, c + r * 0.66], fill=WH)
im = im.resize((S, S), Image.LANCZOS)
out = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'art', 'logos', 'closet_seal.png')
im.save(out)
open(out[:-4] + '.txt', 'w').write("""canonical clothing decal for layout/assets/art/logos/closet_seal.png
date: 2026-11-26
route: drawn in code (layout/sets/closet02/seal_art.py, PIL), no image model, $0
used by: closet02 (jade19's red university sweatshirt), via layout/sets/closet02/art.js
what: a crisp, simple white circular seal (outer rim, a thin second ring, inner rim, a conifer; NO letters or marks),
  white on transparent, 1024 px square. NOT the real university seal and carries no real letters: Jade wants the print
  illegible, so only its shape and colour need to be the same in every shot. Folds in her seated pose break it up; the
  decal itself is never distorted.
Jade (2026-11-26): "in the closet scene, put her in the red stanford sweatshirt, white seal on pocket level, but scrunched
  up and illegible b/c of fabric".
""")
print('wrote', os.path.normpath(out))
