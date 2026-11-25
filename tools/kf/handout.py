#!/usr/bin/env python3
"""tools/kf/handout.py: the school "emotions handout" of the 1991 office scene, as a prop plate, and its toner type.

    PY=/home/jade/Documents/halys-video/.venv/bin/python          # run from the repo root
    $PY tools/kf/handout.py                                   # build every plate into media/keyframes/handout/
    $PY tools/kf/handout.py --gen 6 --seed 7 --outdir /tmp/x  # more copies of the copy, another copier
    $PY tools/kf/handout.py --label "ANXIOUS" --gen 3 --out x.png      # one word in the handout's type, on transparent
    $PY tools/kf/handout.py --cut media/keyframes/handout/sheets/sheetA_v1.png --names HAPPY,SAD,...   # sheet -> faces/
    $PY tools/kf/handout.py --contact                         # faces/_contact.png, to check each face against its label

What it makes (all deterministic by --seed):
  handout_toner.png        black toner on transparent, 2550x3300 (US Letter at 300 dpi)
  handout_yellow.png       the same multiplied onto pale goldenrod copy paper
  handout_title_1080.png   1920x1080, the sheet square on a plain table, camera straight down, the gap at frame centre in x
  handout_face_ANXIOUS.png the ANXIOUS cell (face and label) cut from the yellow sheet; _toner.png the same on transparent
  handout_cells.json       every face's label, row, column and pixel boxes on the page; the gap; the title plate's transform

The grid is the director's, ported by hand from layout/sets/office91/layout.js (HANDOUT, rowCount, cell, LABELS): 7 faces
to a row, 5 rows, the fourth row has 6, every row is centred, so the short row sits half a cell in at both ends.

The faces are line clip-art cut from generated sheets (media/keyframes/handout/sheets/, prompts in prompts/kf/handout/)
into media/keyframes/handout/faces/<LABEL>.png: black on white, 768x768, the head circle centred with radius 256.

The copier. The master is a 300 dpi laser print (hard threshold). Each generation then: the page sits a little skew and
off-register on the glass; dirt and stray toner are laid down; the optics blur; the exposure is uneven down the page and
grainy; the drum drops out in patches; a threshold turns it back into toner, fattening heavy lines and breaking fine
ones. A scratch on the platen draws the same broken streak at every pass, and one pass leaves the shadow of the
original's edge. All lengths are physical (stated at 300 dpi and scaled), so --label at 1200 dpi is a true enlargement.
"""
import argparse
import json
import math
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "media", "keyframes", "handout")
FACES = os.path.join(OUT, "faces")
F32 = np.float32

# ---------------------------------------------------------------- the grid (layout/sets/office91/layout.js, in metres)
HG = dict(w=0.216, h=0.279, cols=7, rows=5, shortRow=3, shortCount=6, margin=0.018, title=0.035, bottom=0.02,
          faceR=0.0098, labelW=0.02, color=0xF2DF6A)
PITCH_X = (HG["w"] - 2 * HG["margin"]) / HG["cols"]
PITCH_Y = (HG["h"] - HG["title"] - HG["bottom"]) / HG["rows"]
LABELS = [
    ["HAPPY", "SAD", "ANGRY", "SCARED", "SURPRISED", "SLEEPY", "GRUMPY"],
    ["PROUD", "SHY", "BORED", "EXCITED", "LONELY", "BRAVE", "SORRY"],
    ["TIRED", "SILLY", "CONFUSED", "JEALOUS", "HURT", "CURIOUS", "UPSET"],
    ["CALM", "WORRIED", "GUILTY", "NERVOUS", "THANKFUL", "ANXIOUS"],
    ["FRUSTRATED", "HOPEFUL", "EMBARRASSED", "DISAPPOINTED", "LOVED", "SAFE", "MAD"],
]
TITLE = "HOW DO YOU FEEL TODAY?"
FACE_UP = 0.005                    # the face sits this far above its cell's centre, the label below it (layout.js cell())
LABEL_GAP = 0.0030                 # face's lower edge to the label's cap line
TITLE_Y = 0.0215                   # centre of the title's capitals below the top edge
TITLE_EM = 0.0112                  # about 32 pt
LABEL_EM_MAX = 0.0032              # about 9 pt; shrunk until the longest label clears its neighbour
LABEL_CLEAR = 0.0024               # the least gap between two neighbouring labels
FONT_PATHS = ["/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
              "/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
PAPER = (0.950, 0.906, 0.662)      # pale goldenrod copy paper: HANDOUT.color 0xf2df6a with the lemon taken out
TONER = (0.035, 0.035, 0.040)
SURFACE = (0.655, 0.665, 0.635)    # the plain table under the title plate: grey laminate with a little green in it


def row_count(r):
    return HG["shortCount"] if r == HG["shortRow"] else HG["cols"]


def cell_m(r, c):
    """Centre of the face in row r (0 = top), column c (0 = first as read), in metres from the page's top-left."""
    return (HG["w"] / 2 + (c - (row_count(r) - 1) / 2) * PITCH_X, HG["title"] + (r + 0.5) * PITCH_Y - FACE_UP)


def font(px):
    for p in FONT_PATHS:
        if os.path.exists(p):
            return ImageFont.truetype(p, max(4, int(round(px))))
    raise FileNotFoundError(f"no bold sans found: {FONT_PATHS}")


# ---------------------------------------------------------------- small numeric helpers
def rng(*key):
    return np.random.default_rng([int(k) & 0x7FFFFFFF if not isinstance(k, str) else sum(map(ord, k)) for k in key])


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def blur(a, sigma):
    return cv2.GaussianBlur(a, (0, 0), float(sigma)) if sigma > 0.05 else a


def vnoise(h, w, cell, r):
    """Smooth value noise in about [0, 1] with features `cell` pixels across."""
    cell = max(1.0, float(cell))
    gh, gw = int(h / cell) + 4, int(w / cell) + 4
    g = r.random((gh, gw)).astype(F32)
    big = cv2.resize(g, (int(gw * cell) + 1, int(gh * cell) + 1), interpolation=cv2.INTER_CUBIC)
    oy, ox = int(r.integers(0, int(cell) + 1)), int(r.integers(0, int(cell) + 1))
    return big[oy:oy + h, ox:ox + w]


def grain(h, w, sigma, r):
    """White noise blurred to `sigma` px, rescaled to unit variance."""
    n = r.standard_normal((h, w), dtype=F32)
    if sigma > 0.3:
        n = blur(n, sigma)
        n /= max(1e-6, float(n.std()))
    return n


def text_mask(text, px, track=0.03):
    """Bold caps as a float mask (1 = ink), tight to the cap height, with its width and cap height."""
    f = font(px)
    tr = track * px
    wds = [f.getlength(c) for c in text]
    tw = int(math.ceil(sum(wds) + tr * (len(text) - 1)))
    asc, desc = f.getmetrics()
    pad = int(px * 0.3) + 2
    im = Image.new("L", (tw + 2 * pad, asc + desc + 2 * pad), 0)
    d = ImageDraw.Draw(im)
    x = pad
    for c, w in zip(text, wds):
        d.text((x, pad), c, fill=255, font=f)
        x += w + tr
    a = np.asarray(im, F32) / 255.0
    ys, xs = np.where(a > 0.5)
    x0, x1 = xs.min(), xs.max() + 1
    cb = f.getbbox("H")
    y0, y1 = pad + cb[1], pad + cb[3]                       # cap line to base line
    y1 = max(y1, ys.max() + 1)                              # keep the tail of a Q or a comma
    return a[y0:y1, x0:x1], (cb[3] - cb[1])


def paste_dark(page, m, cx, top):
    """Lay mask m (1 = ink) on the page, centred on cx with its top at `top`. Returns the box."""
    h, w = m.shape
    x0, y0 = int(round(cx - w / 2)), int(round(top))
    X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(page.shape[1], x0 + w), min(page.shape[0], y0 + h)
    page[Y0:Y1, X0:X1] = np.maximum(page[Y0:Y1, X0:X1], m[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0])
    return [x0, y0, x0 + w, y0 + h]


# ---------------------------------------------------------------- faces: cut a generated sheet into cells
FACE_PX, FACE_R = 768, 256
FACE_BOLD = 2                      # px of extra line weight each side, at FACE_PX scale


def cut_sheet(path, names, rows=3, cols=4, start=0, force=False):
    """Find the head circles on a generated sheet, cut each face with its marks, clean to black line, save by name."""
    g = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    H, W = g.shape
    gb = cv2.GaussianBlur(g, (0, 0), 1.2)
    est = min(W / cols, H / rows)
    best = None
    for p2 in (60, 50, 40, 32, 26):
        c = cv2.HoughCircles(gb, cv2.HOUGH_GRADIENT, dp=1.2, minDist=est * 0.6, param1=120, param2=p2,
                             minRadius=int(est * 0.22), maxRadius=int(est * 0.50))
        if c is not None and len(c[0]) >= rows * cols:
            best = c[0][:rows * cols]
            break
    if best is None:
        raise SystemExit(f"could not find {rows * cols} circles in {path}")
    # refine each circle on the dark pixels near its rim (Hough is a pixel or two off)
    dark = (gb < 150)
    circ = []
    for cx, cy, r in best:
        ys, xs = np.where(dark[int(max(0, cy - r * 1.15)):int(cy + r * 1.15), int(max(0, cx - r * 1.15)):int(cx + r * 1.15)])
        xs = xs + int(max(0, cx - r * 1.15))
        ys = ys + int(max(0, cy - r * 1.15))
        d = np.hypot(xs - cx, ys - cy)
        k = np.abs(d - r) < r * 0.10
        if k.sum() > 50:
            A = np.stack([xs[k], ys[k], np.ones(k.sum())], 1).astype(np.float64)
            b = -(xs[k] ** 2 + ys[k] ** 2).astype(np.float64)
            (D, E, Fc), *_ = np.linalg.lstsq(A, b, rcond=None)
            cx2, cy2 = -D / 2, -E / 2
            r2 = math.sqrt(max(1.0, cx2 * cx2 + cy2 * cy2 - Fc))
            if abs(r2 - r) < r * 0.12 and math.hypot(cx2 - cx, cy2 - cy) < r * 0.15:
                cx, cy, r = cx2, cy2, r2
        circ.append((float(cx), float(cy), float(r)))
    circ.sort(key=lambda c: c[1])
    grid = []
    for i in range(rows):
        grid += sorted(circ[i * cols:(i + 1) * cols], key=lambda c: c[0])
    rmed = float(np.median([c[2] for c in grid]))
    centres = np.array([[c[0], c[1]] for c in grid])
    os.makedirs(FACES, exist_ok=True)
    man_p = os.path.join(FACES, "manifest.json")
    man = json.load(open(man_p)) if os.path.exists(man_p) else {}
    # whose mark is it: by pixel, the circle whose rim is nearest; then every separate mark (a heart, a puff of steam)
    # goes whole to the circle that owns its middle, so a neighbour's cell never cuts it in two
    yy, xx = np.mgrid[0:H, 0:W]
    radii = np.array([c[2] for c in grid])
    owner = np.argmin(np.sqrt((xx[..., None] - centres[:, 0]) ** 2 + (yy[..., None] - centres[:, 1]) ** 2) - radii, axis=2)
    n, lab, st, cen = cv2.connectedComponentsWithStats((gb < 170).astype(np.uint8), 8)
    # a head's own component (the circle and whatever touches it) belongs to that head, unless two heads touch
    head = {}
    for i, (cx, cy, r) in enumerate(grid):
        th = np.linspace(0, 2 * np.pi, 180, endpoint=False)
        votes = np.concatenate([lab[np.clip((cy + rr * np.sin(th)).astype(int), 0, H - 1), np.clip((cx + rr * np.cos(th)).astype(int), 0, W - 1)]
                                for rr in (r - 2, r, r + 2)])
        votes = votes[votes > 0]
        if len(votes):
            head.setdefault(int(np.bincount(votes).argmax()), []).append(i)
    for j, own in head.items():
        if len(own) == 1:
            owner[cv2.dilate((lab == j).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0] = own[0]
    for j in range(1, n):
        if j in head:
            continue
        if max(st[j, cv2.CC_STAT_WIDTH], st[j, cv2.CC_STAT_HEIGHT]) < 1.2 * rmed:
            d = np.hypot(cen[j][0] - centres[:, 0], cen[j][1] - centres[:, 1]) - radii
            x0, y0, w0, h0 = st[j, :4]
            x0, y0 = max(0, x0 - 4), max(0, y0 - 4)
            owner[y0:y0 + h0 + 8, x0:x0 + w0 + 8][cv2.dilate((lab[y0:y0 + h0 + 8, x0:x0 + w0 + 8] == j).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0] = int(np.argmin(d))
    for i, name in enumerate(names):
        if not name or name == "-":
            continue
        cx, cy, r = grid[start + i]
        own = (owner == start + i)
        src = np.where(own, g, 255).astype(np.uint8)
        s = FACE_R / r
        M = np.array([[s, 0, FACE_PX / 2 - cx * s], [0, s, FACE_PX / 2 - cy * s]], F32)
        big = cv2.warpAffine(src, M, (FACE_PX, FACE_PX), flags=cv2.INTER_CUBIC, borderValue=255).astype(F32) / 255.0
        big = blur(big, 1.6)
        ink = smoothstep(0.62, 0.42, big)                                  # 1 = line; a firm, smooth, anti-aliased edge
        # drop crumbs that are not attached to anything and are far from the head
        n, lab, st, cen = cv2.connectedComponentsWithStats((ink > 0.5).astype(np.uint8), 8)
        for j in range(1, n):
            far = math.hypot(cen[j][0] - FACE_PX / 2, cen[j][1] - FACE_PX / 2) > FACE_R * 1.46
            if st[j, cv2.CC_STAT_AREA] < 40 or far:
                ink[lab == j] = 0
        outp = os.path.join(FACES, name + ".png")
        if os.path.exists(outp) and not force:
            print(f"keep existing {name} (use --force to replace)")
            continue
        Image.fromarray(np.uint8(255 * (1 - ink))).save(outp)
        man[name] = {"source": os.path.relpath(path, ROOT), "index": start + i, "kind": "generated",
                     "circle_px": [round(cx, 1), round(cy, 1), round(r, 1)]}
        print(f"cut {name:14s} from circle {start + i} at ({cx:.0f},{cy:.0f}) r={r:.0f} (median r {rmed:.0f})")
    json.dump(man, open(man_p, "w"), indent=1, sort_keys=True)


def load_face(name):
    p = os.path.join(FACES, name + ".png")
    if not os.path.exists(p):
        return None
    return 1.0 - np.asarray(Image.open(p).convert("L"), F32) / 255.0


def placeholder_face():
    a = np.zeros((FACE_PX, FACE_PX), F32)
    cv2.circle(a, (FACE_PX // 2, FACE_PX // 2), FACE_R, 1.0, 14, cv2.LINE_AA)
    return a


def contact(path=None, per_row=7, tile=300):
    """All faces in page order with their labels, large, for checking by eye."""
    names = [n for row in LABELS for n in row]
    f = font(26)
    rows = math.ceil(len(names) / per_row)
    im = Image.new("L", (per_row * tile, rows * (tile + 40)), 255)
    d = ImageDraw.Draw(im)
    for i, n in enumerate(names):
        a = load_face(n)
        x, y = (i % per_row) * tile, (i // per_row) * (tile + 40)
        if a is not None:
            t = cv2.resize(1 - a, (tile, tile), interpolation=cv2.INTER_AREA)
            im.paste(Image.fromarray(np.uint8(255 * t)), (x, y))
        d.text((x + tile / 2 - f.getlength(n) / 2, y + tile + 4), n, fill=0, font=f)
    path = path or os.path.join(FACES, "_contact.png")
    im.save(path)
    print("wrote", path)


# ---------------------------------------------------------------- the clean master
def master(dpi=300):
    """The handout as its designer printed it. Returns (ink mask HxW float, cells list, info dict). 1 = toner."""
    W, H = int(round(8.5 * dpi)), int(round(11 * dpi))
    S = W / HG["w"]                                          # px per metre; the 3 px left over in y go half to each end
    oy = (H - HG["h"] * S) / 2
    page = np.zeros((H, W), F32)
    # the title
    em = TITLE_EM * S
    tm, cap = text_mask(TITLE, em, track=0.02)
    while tm.shape[1] > W - 2 * HG["margin"] * S:
        em *= 0.97
        tm, cap = text_mask(TITLE, em, track=0.02)
    tbox = paste_dark(page, tm, W / 2, oy + TITLE_Y * S - cap / 2)
    # the label size: one size for all, the longest must clear its neighbour by LABEL_CLEAR
    names = [n for row in LABELS for n in row]
    lem = LABEL_EM_MAX * S
    while max(text_mask(n, lem)[0].shape[1] for n in names) > (PITCH_X - LABEL_CLEAR) * S:
        lem *= 0.98
    R = HG["faceR"] * S
    cells = []
    missing = []
    for r, row in enumerate(LABELS):
        for c, name in enumerate(row):
            mx, my = cell_m(r, c)
            cx, cy = mx * S, oy + my * S
            a = load_face(name)
            if a is None:
                missing.append(name)
                a = placeholder_face()
            side = int(round(FACE_PX * R / FACE_R))
            if FACE_BOLD > 0:                                # the marker line, a touch heavier, so it survives the copier
                a = smoothstep(0.30, 0.70, blur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * FACE_BOLD + 1,) * 2)), 1.0))
            fm = cv2.resize(a, (side, side), interpolation=cv2.INTER_AREA)
            fm[int(side / 2 + R + LABEL_GAP * S * 0.55):, :] = 0      # whoever pasted the clip-art cropped it clear of the label
            paste_dark(page, fm, cx, cy - side / 2)
            lm, lcap = text_mask(name, lem)
            lbox = paste_dark(page, lm, cx, cy + R + LABEL_GAP * S)
            cells.append({"label": name, "row": r, "col": c, "centre": [cx, cy], "r": R,
                          "face_box": [cx - R * 1.12, cy - R * 1.12, cx + R * 1.12, cy + R * 1.12], "label_box": lbox,
                          "cell_box": [cx - PITCH_X * S / 2, cy - R * 1.3, cx + PITCH_X * S / 2, lbox[3] + 0.0015 * S]})
    gx, gy = cell_m(HG["shortRow"], HG["shortCount"])
    lx, ly = cell_m(HG["shortRow"], -1)
    info = {"page_px": [W, H], "dpi": dpi, "px_per_m": S, "title": TITLE, "title_box": tbox, "face_r_px": R,
            "pitch_px": [PITCH_X * S, PITCH_Y * S], "label_em_px": lem, "label_pt": lem / dpi * 72,
            "gap": {"centre": [gx * S, oy + gy * S], "r": R, "note": "where a seventh face would follow ANXIOUS at the "
                    "same spacing (layout.js GAP); the row is centred, so half of the missing cell is at each end"},
            "gap_left": {"centre": [lx * S, oy + ly * S], "r": R}, "missing_faces": missing}
    page = (page > 0.5).astype(F32)                          # a 300 dpi laser print: no greys
    return page, cells, info


# ---------------------------------------------------------------- the copier
def specks(h, w, pts, radii, r, k):
    """Stray toner: round dots, the bigger ones lumpy (two to four overlapping blobs)."""
    m = np.zeros((h, w), F32)
    for (x, y), rad in zip(pts, radii):
        n = 1 if rad < 1.6 * k else int(r.integers(2, 5))
        for _ in range(n):
            ox, oy = (r.normal(0, rad * 0.55, 2) if n > 1 else (0.0, 0.0))
            rr = rad * (r.uniform(0.55, 1.0) if n > 1 else 1.0)
            cv2.circle(m, (int(round((x + ox) * 16)), int(round((y + oy) * 16))), max(1, int(round(rr * 16))), 1.0, -1,
                       cv2.LINE_AA, 4)
    return m


def copy_pass(a, g, gen, seed, k=1.0, page=True, wear=1.0):
    """One trip through the copier. a: HxW float, 1 = toner. g: 1-based generation. k: dpi / 300.
    Returns the copy and the 3x3 matrix that carried the original onto it."""
    h, w = a.shape
    r = rng(seed, "pass", g)
    # 1. the original on the glass: never square, never in register, and the lens a hair over 100 %
    ang = float(r.normal(0, 0.20 if page else 0.35))
    sc = 1.0 + abs(float(r.normal(0, 0.0025)))
    dx, dy = (r.normal(0, 5.0 * k, 2) if page else (0.0, 0.0))
    M = cv2.getRotationMatrix2D((w / 2, h / 2), ang, sc)
    M[:, 2] += (dx, dy)
    a = cv2.warpAffine(a, M, (w, h), flags=cv2.INTER_CUBIC, borderValue=0)
    M3 = np.vstack([M, [0, 0, 1]])
    # the exposure field: darker or lighter down the page (the corona wire and a tired cartridge), with slow blotches
    yy = np.linspace(-0.5, 0.5, h, dtype=F32)[:, None]
    xx = np.linspace(-0.5, 0.5, w, dtype=F32)[None, :]
    c = rng(seed, "copier")                                  # this copier's own habits, the same at every pass
    lean_y, lean_x = float(c.uniform(0.6, 1.0)) * (1 if c.random() < 0.5 else -1), float(c.normal(0, 0.25))
    slow = vnoise(h, w, 420 * k, r) - 0.5
    expo = (0.060 * wear * (lean_y * yy + lean_x * xx) if page else 0.0) + 0.045 * wear * slow     # + = more toner
    # 2. dirt: pepper everywhere (clumped), scatter close to the image, and a very few larger crumbs
    area = (h * w) / (k * k)
    n_bg = r.poisson(area * 5.5e-5 * wear)
    clump = vnoise(h, w, 260 * k, r)
    pts = np.stack([r.uniform(0, w, n_bg * 3), r.uniform(0, h, n_bg * 3)], 1)
    keep = r.random(len(pts)) < np.clip((clump[pts[:, 1].astype(int), pts[:, 0].astype(int)] - 0.30) * 1.6, 0.02, 1) ** 2
    pts = pts[keep][:n_bg]
    rad = (0.62 + 2.0 * r.random(len(pts)) ** 4.0) * k
    near = blur(a, 9 * k)
    n_nr = r.poisson(area * 2.2e-4 * wear)
    q = np.stack([r.uniform(0, w, n_nr), r.uniform(0, h, n_nr)], 1)
    nv = near[q[:, 1].astype(int), q[:, 0].astype(int)]
    q = q[(r.random(len(q)) < np.clip(nv * 6, 0, 1)) & (nv < 0.6)]
    qrad = (0.55 + 1.0 * r.random(len(q)) ** 3.0) * k
    n_big = r.poisson(area * 1.2e-6 * wear) if page else (1 if r.random() < 0.25 else 0)
    b = np.stack([r.uniform(0, w, n_big), r.uniform(0, h, n_big)], 1)
    brad = r.uniform(2.2, 4.6, n_big) * k
    dirt = specks(h, w, np.concatenate([pts, q, b]), np.concatenate([rad, qrad, brad]), r, k)
    a = np.maximum(a, dirt)
    # the shadow of the original's own edge, once: it lay a little in from the glass's left guide
    if page and g == max(1, math.ceil(gen / 2)):
        e = rng(seed, "edge")
        y = np.arange(h, dtype=F32)
        wdt = np.clip((y / h - e.uniform(0.34, 0.46)) / 0.6, 0, 1) * e.uniform(15, 21) * k        # a wedge, widest at the foot
        wdt = wdt + (vnoise(h, 8, 26 * k, e)[:, 0] - 0.5) * 3.5 * k * (wdt > 0)
        xs = np.arange(w, dtype=F32)[None, :]
        a = np.maximum(a, np.clip(wdt[:, None] - xs, 0, 1))
    # 3. optics
    a = blur(a, (0.82 + 0.05 * g) * k)
    # the platen's scratch: one fine broken line down the feed direction, in the same place at every pass
    if page:
        sx = w * float(c.uniform(0.60, 0.80)) + (c.normal(0, 0.6) * k)
        amp = 0.14 + 0.40 * vnoise(h, 8, 90 * k, r)[:, 0] + 0.18 * (vnoise(h, 8, 7 * k, r)[:, 0] - 0.5)
        amp *= smoothstep(0.30, 0.55, vnoise(h, 8, 520 * k, rng(seed, "scratch"))[:, 0]) * 0.75 + 0.25
        xs = np.arange(w, dtype=F32)[None, :]
        a = a + amp[:, None].astype(F32) * np.exp(-((xs - sx) ** 2) / (2 * (0.95 * k) ** 2))
    # 4. grain, in three sizes, and the patches where the toner did not take
    a = a + 0.045 * wear * grain(h, w, 0.55, r) + 0.045 * wear * grain(h, w, 0.8 * k, r) \
          + 0.050 * wear * (vnoise(h, w, 7.0 * k, r) - 0.5) * 2
    # drop-outs: small ones anywhere, larger faint ones where this pass ran light
    do = smoothstep(0.84, 0.95, vnoise(h, w, 4.5 * k, r)) * 0.30 + smoothstep(0.74, 0.92, vnoise(h, w, 17.0 * k, r)) * 0.20
    a = a - do * wear * np.clip(1.0 - expo * 9.0, 0.35, 1.8)
    # 5. back to toner: the threshold sits under one half, so each pass the heavy strokes gain a little
    thr = 0.452 - expo
    a = smoothstep(thr - 0.075, thr + 0.075, a).astype(F32)
    return a, M3


def photocopy(a, gen=4, seed=1991, k=1.0, page=True, wear=1.0):
    M = np.eye(3)
    for g in range(1, int(gen) + 1):
        a, m = copy_pass(a, g, gen, seed, k, page, wear)
        M = m @ M
    return np.clip(a, 0, 1), M


def toner_alpha(a, seed, k=1.0):
    """Toner as it lies: nearly solid, a little thinner in places, never grey fog."""
    h, w = a.shape
    r = rng(seed, "lay")
    if k >= 1.5:                                             # an enlargement shows the toner's own grain along every edge
        e = blur(a, 0.55 * k)
        n = (0.17 * grain(h, w, 0.33 * k, r) + 0.09 * grain(h, w, 0.9, r)) * np.clip(4 * e * (1 - e), 0, 1)   # only at edges
        a = smoothstep(0.41, 0.59, e + n).astype(F32)
    d = 0.93 + 0.07 * vnoise(h, w, 300 * k, r) - 0.10 * smoothstep(0.55, 0.9, vnoise(h, w, 3.2 * k, r))
    return np.clip(a * d, 0, 1).astype(F32)


def paper_rgb(h, w, seed, k=1.0, base=PAPER):
    """Cheap dyed copy paper: slow mottling of the dye, fine formation cloudiness, a little fibre grain."""
    r = rng(seed, "paper")
    mott = (vnoise(h, w, 330 * k, r) - 0.5) * 0.020 + (vnoise(h, w, 60 * k, r) - 0.5) * 0.012
    cloud = (vnoise(h, w, 9 * k, r) - 0.5) * 0.016
    fib = grain(h, w, 0.7, r) * 0.007
    v = 1.0 + mott + cloud + fib
    rgb = np.empty((h, w, 3), F32)
    for i in range(3):
        # the dye varies more than the sheet's brightness does: blue moves most
        rgb[..., i] = base[i] * (1.0 + (v - 1.0) * (0.55, 0.75, 1.9)[i])
    return np.clip(rgb, 0, 1)


def to_srgb8(x):
    return np.uint8(np.clip(x, 0, 1) * 255 + 0.5)


# ---------------------------------------------------------------- plates
def tf_box(M, box):
    x0, y0, x1, y1 = box
    p = np.array([[x0, y0, 1], [x1, y0, 1], [x1, y1, 1], [x0, y1, 1]], np.float64) @ M.T
    return [float(p[:, 0].min()), float(p[:, 1].min()), float(p[:, 0].max()), float(p[:, 1].max())]


def tf_pt(M, p):
    q = M @ np.array([p[0], p[1], 1.0])
    return [float(q[0]), float(q[1])]


def rnd(v, n=1):
    return [round(float(x), n) for x in v]


def title_plate(yellow, gap_xy, seed, size=(1920, 1080), fill=0.80, surface=SURFACE):
    """The sheet square on a plain table, straight down. The gap is put at frame centre in x; in y the sheet is as
    high as it can go with the whole page still in frame, which leaves the gap a little under centre."""
    FW, FH = size
    H, W = yellow.shape[:2]
    s = fill * FH / H
    sw, sh = int(round(W * s)), int(round(H * s))
    x0 = int(round(FW / 2 - gap_xy[0] * s))
    top_min = int(round(FH * 0.022))
    y0 = int(round(min(max(FH / 2 - gap_xy[1] * s, top_min), FH - sh - top_min)))
    r = rng(seed, "table")
    fr = np.empty((FH, FW, 3), F32)
    tex = 1.0 + (vnoise(FH, FW, 420, r) - 0.5) * 0.035 + (vnoise(FH, FW, 3.0, r) - 0.5) * 0.022 + grain(FH, FW, 0.6, r) * 0.006
    yy, xx = np.mgrid[0:FH, 0:FW].astype(F32)
    vig = 1.0 - 0.07 * (((xx - FW / 2) / (FW / 2)) ** 2 + ((yy - FH / 2) / (FH / 2)) ** 2)        # the tube's pool falls off
    for i in range(3):
        fr[..., i] = surface[i] * tex * vig
    # the sheet's contact shadow: tight, a touch heavier at the lower right (the tube is overhead, the sheet lies flat)
    sm = np.zeros((FH, FW), F32)
    sm[max(0, y0 + 2):y0 + sh + 3, max(0, x0 + 1):x0 + sw + 3] = 1.0
    sh_soft = 0.30 * blur(sm, 2.2) + 0.16 * blur(sm, 9.0)
    fr *= (1.0 - sh_soft)[..., None]
    small = cv2.resize(yellow, (sw, sh), interpolation=cv2.INTER_AREA)
    X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(FW, x0 + sw), min(FH, y0 + sh)
    fr[Y0:Y1, X0:X1] = small[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    return fr, {"size": [FW, FH], "scale": s, "offset": [x0, y0], "sheet_box": [x0, y0, x0 + sw, y0 + sh],
                "note": "frame_xy = offset + scale * page_xy"}


def build(gen=4, seed=1991, dpi=300, outdir=OUT, wear=1.0, surface=SURFACE, plate_fill=0.80):
    os.makedirs(outdir, exist_ok=True)
    k = dpi / 300.0
    page, cells, info = master(dpi)
    if info["missing_faces"]:
        print("WARNING no face art for:", ", ".join(info["missing_faces"]), "(plain circles used)")
    a, M = photocopy(page, gen, seed, k, True, wear)
    al = toner_alpha(a, seed, k)
    H, W = al.shape
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., 3] = to_srgb8(al)
    Image.fromarray(rgba, "RGBA").save(os.path.join(outdir, "handout_toner.png"))
    pap = paper_rgb(H, W, seed, k)
    yel = pap * (1 - al[..., None]) + np.array(TONER, F32) * al[..., None]
    Image.fromarray(to_srgb8(yel)).save(os.path.join(outdir, "handout_yellow.png"))
    # boxes, carried through the copier's skew
    out_cells = []
    for c in cells:
        ctr = tf_pt(M, c["centre"])
        out_cells.append({"label": c["label"], "row": c["row"], "col": c["col"], "centre": rnd(ctr), "r": round(c["r"], 1),
                          "face_box": rnd(tf_box(M, c["face_box"])), "label_box": rnd(tf_box(M, c["label_box"])),
                          "cell_box": rnd(tf_box(M, c["cell_box"]))})
    gap = tf_pt(M, info["gap"]["centre"])
    gl = tf_pt(M, info["gap_left"]["centre"])
    plate, tp = title_plate(yel, gap, seed, fill=plate_fill, surface=surface)
    Image.fromarray(to_srgb8(plate)).save(os.path.join(outdir, "handout_title_1080.png"))
    s, (ox, oy) = tp["scale"], tp["offset"]
    tp["gap_centre"] = rnd([ox + gap[0] * s, oy + gap[1] * s])
    tp["gap_r"] = round(info["face_r_px"] * s, 1)
    anx = next(c for c in out_cells if c["label"] == "ANXIOUS")
    tp["anxious_centre"] = rnd([ox + anx["centre"][0] * s, oy + anx["centre"][1] * s])
    x0, y0, x1, y1 = [int(round(v)) for v in anx["cell_box"]]
    Image.fromarray(to_srgb8(yel[y0:y1, x0:x1])).save(os.path.join(outdir, "handout_face_ANXIOUS.png"))
    Image.fromarray(rgba[y0:y1, x0:x1], "RGBA").save(os.path.join(outdir, "handout_face_ANXIOUS_toner.png"))
    man_p = os.path.join(FACES, "manifest.json")
    man = json.load(open(man_p)) if os.path.exists(man_p) else {}
    meta = {"what": "the emotions handout, office91; boxes are [x0, y0, x1, y1] in pixels of handout_yellow.png / handout_toner.png",
            "page_px": [W, H], "dpi": dpi, "gen": gen, "seed": seed, "px_per_m": round(info["px_per_m"], 2),
            "title": TITLE, "title_box": rnd(tf_box(M, info["title_box"])),
            "face_r_px": round(info["face_r_px"], 1), "pitch_px": rnd(info["pitch_px"]),
            "label_pt": round(info["label_pt"], 2), "label_em_px": round(info["label_em_px"], 1),
            "short_row": HG["shortRow"], "rows": [row_count(r) for r in range(HG["rows"])],
            "gap": {"centre": rnd(gap), "r": round(info["face_r_px"], 1),
                    "box": rnd([gap[0] - info["face_r_px"], gap[1] - info["face_r_px"], gap[0] + info["face_r_px"], gap[1] + info["face_r_px"]]),
                    "note": info["gap"]["note"]},
            "gap_left": {"centre": rnd(gl), "r": round(info["face_r_px"], 1)},
            "anxious_crop": {"file": "handout_face_ANXIOUS.png", "box": [x0, y0, x1, y1]},
            "title_plate": {"file": "handout_title_1080.png", **tp},
            "paper_rgb": [round(v, 3) for v in PAPER], "copier_matrix": [rnd(row, 6) for row in M[:2]],
            "face_art": {c["label"]: man.get(c["label"], {}).get("kind", "missing") for c in out_cells},
            "cells": out_cells}
    json.dump(meta, open(os.path.join(outdir, "handout_cells.json"), "w"), indent=1)
    print(f"wrote handout_toner.png handout_yellow.png handout_title_1080.png handout_face_ANXIOUS.png handout_cells.json "
          f"in {outdir} (gen {gen}, seed {seed}, label {meta['label_pt']} pt)")
    return meta


# ---------------------------------------------------------------- one word in the handout's type
def label(text, gen=3, seed=1991, pt=None, dpi=1200, wear=1.0):
    """`text` in the handout's bold caps, laser-printed at 300 dpi at `pt` points (default: the handout's own label
    size), copied `gen` times on the same copier model, scanned at `dpi`. Returns RGBA uint8, black on transparent."""
    text = str(text).upper()
    if pt is None:
        pt = master_label_pt()
    k = dpi / 300.0
    em300 = pt / 72 * 300
    m, cap = text_mask(text, em300 * 4)                       # drawn fine, then put through the 300 dpi printer
    m = cv2.resize(m, (max(1, int(round(m.shape[1] / 4))), max(1, int(round(m.shape[0] / 4)))), interpolation=cv2.INTER_AREA)
    m = (m > 0.5).astype(F32)
    pad = int(round(em300 * 0.75)) + 6
    m = cv2.copyMakeBorder(m, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    if k != 1.0:
        m = cv2.resize(m, (int(round(m.shape[1] * k)), int(round(m.shape[0] * k))), interpolation=cv2.INTER_NEAREST)
    s = seed * 7919 + sum((i + 1) * ord(ch) for i, ch in enumerate(text))
    a, _ = photocopy(m, gen, s, k, False, wear)
    al = toner_alpha(a, s, k)
    rgba = np.zeros(al.shape + (4,), np.uint8)
    rgba[..., 3] = to_srgb8(al)
    return rgba


_LPT = None


def master_label_pt():
    global _LPT
    if _LPT is None:
        S = 2550 / HG["w"]
        names = [n for row in LABELS for n in row]
        lem = LABEL_EM_MAX * S
        while max(text_mask(n, lem)[0].shape[1] for n in names) > (PITCH_X - LABEL_CLEAR) * S:
            lem *= 0.98
        _LPT = lem / 300 * 72
    return _LPT


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--gen", type=int, default=None, help="photocopy generations (handout default 4, label default 3)")
    ap.add_argument("--seed", type=int, default=1991)
    ap.add_argument("--dpi", type=int, default=None, help="page: 300 (2550x3300). label: scan resolution, default 1200")
    ap.add_argument("--wear", type=float, default=1.0, help="how tired the copier is: scales noise, dirt and unevenness")
    ap.add_argument("--outdir", default=OUT)
    ap.add_argument("--plate-fill", type=float, default=0.80, help="title plate: sheet height as a fraction of the frame's. "
                    "0.80 keeps the whole sheet in frame with the gap 60 px under centre; 0.75 centres the gap exactly")
    ap.add_argument("--label", help="render this word alone, toner on transparent")
    ap.add_argument("--pt", type=float, default=None, help="label: printed size in points (default: the handout's labels)")
    ap.add_argument("--out", help="label: output PNG")
    ap.add_argument("--cut", help="a generated face sheet to cut into faces/")
    ap.add_argument("--names", help="cut: comma list of labels in reading order; '-' skips a face")
    ap.add_argument("--grid", default="3x4", help="cut: rows x cols on the sheet")
    ap.add_argument("--force", action="store_true", help="cut: replace existing faces")
    ap.add_argument("--contact", action="store_true", help="write faces/_contact.png")
    a = ap.parse_args()
    if a.cut:
        rows, cols = [int(v) for v in a.grid.lower().split("x")]
        cut_sheet(a.cut if os.path.isabs(a.cut) else os.path.join(ROOT, a.cut), [n.strip() for n in a.names.split(",")], rows, cols, 0, a.force)
        return
    if a.contact:
        contact()
        return
    if a.label:
        if not a.out:
            raise SystemExit("--label needs --out")
        im = label(a.label, a.gen if a.gen is not None else 3, a.seed, a.pt, a.dpi or 1200, a.wear)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)) or ".", exist_ok=True)
        Image.fromarray(im, "RGBA").save(a.out)
        print(f"wrote {a.out} {im.shape[1]}x{im.shape[0]}")
        return
    build(a.gen if a.gen is not None else 4, a.seed, a.dpi or 300, a.outdir, a.wear, plate_fill=a.plate_fill)


if __name__ == "__main__":
    main()
