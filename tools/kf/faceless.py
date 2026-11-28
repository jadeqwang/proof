#!/usr/bin/env python3
"""Faceless copies of a shot's form + contour guides (2026-11-27 face-drift fix). Since 2026-11-28 (Jade) the EYES
(whites, irises, pupils, aimed at the look target) and the canonical GLASSES stay; brows, nose, mouth and jaw shading go.

The r4 guides draw a generic MakeHuman face; painters copy its shape instead of the cast face crop. This blanks the
face interior (brows, eyes, nose, mouth) of every listed figure: form -> smooth skin of the same tone, contour -> white
(the head and hair outline stay). Gaze then comes from the prompt's words.
    python faceless.py SET SHOT FIGURE[,FIGURE] [--keep-eyes]
writes media/keyframes/r4/<SET>/_prompts/_guides/<SHOT>_{form,contour}_nf.png
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def mask_for(sc, who, W, H, grow=1.0):
    h = sc["heads"][who]
    sx, sy = W / sc.get("w", 1920), H / sc.get("h", 1080)
    e = np.array(h["eyes"]) * [sx, sy]
    m = np.array(h["mouth"]) * [sx, sy]
    v = m - e
    L = np.linalg.norm(v)
    c = e + 0.30 * v
    a, b = 1.00 * L * grow, 1.02 * L * grow          # along / across the face
    u = v / L
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.stack([xx - c[0], yy - c[1]], -1)
    t, n = d @ u, d @ np.array([-u[1], u[0]])
    return ((t / a) ** 2 + (n / b) ** 2) <= 1.0


def region_for(sc, who, cont, form, W, H):
    """the face skin region: flood fill of the contour drawing (lines thickened) from seeds round the eyes and mouth,
    kept to skin-coloured form pixels, holes (eyes, mouth) filled, inside a generous ellipse."""
    from scipy import ndimage as ndi
    h = sc["heads"][who]
    sx, sy = W / sc.get("w", 1920), H / sc.get("h", 1080)
    e = np.array(h["eyes"]) * [sx, sy]
    m = np.array(h["mouth"]) * [sx, sy]
    v = m - e
    L = np.linalg.norm(v)
    u = v / L
    n = np.array([-u[1], u[0]])
    big = mask_for(sc, who, W, H, 1.5)
    lines = ndi.binary_dilation(cont.mean(2) < 160, iterations=2)
    free = ~lines & big
    lab, _ = ndi.label(free)
    seeds = [e + t * v + k * n * L for t in (0.15, 0.5, 0.85, 1.1) for k in (-0.45, -0.2, 0, 0.2, 0.45)]
    warm = (form[..., 0] - form[..., 2]) > 25   # skin is warm; walls, hair and clay props are grey or cool
    skin_ref = form[int(np.clip((e + 0.55 * v)[1], 0, H - 1)), int(np.clip((e + 0.55 * v)[0], 0, W - 1))]
    ids = set()
    for p in seeds:
        x, y = int(round(p[0])), int(round(p[1]))
        if 0 <= x < W and 0 <= y < H and lab[y, x] and warm[y, x]:
            ids.add(lab[y, x])
    R = np.isin(lab, list(ids)) if ids else np.zeros((H, W), bool)
    R = ndi.binary_closing(R, iterations=4)
    R = ndi.binary_fill_holes(R)
    R &= warm | mask_for(sc, who, W, H, 1.0)   # non-skin (eyes, brows) only inside the tight face ellipse
    return ndi.binary_dilation(R, iterations=3) & big


def axis_t(sc, who, W, H):
    """signed position along the eyes->mouth axis, in eye-mouth lengths (0 = eye line, 1 = mouth)."""
    h = sc["heads"][who]
    sx, sy = W / sc.get("w", 1920), H / sc.get("h", 1080)
    e = np.array(h["eyes"]) * [sx, sy]
    m = np.array(h["mouth"]) * [sx, sy]
    v = m - e
    L = max(np.linalg.norm(v), 1e-3)
    yy, xx = np.mgrid[0:H, 0:W]
    return ((xx - e[0]) * v[0] + (yy - e[1]) * v[1]) / (L * L)


def main():
    set_, shot, figs = sys.argv[1], sys.argv[2], sys.argv[3].split(",")
    sc = json.load(open(f"{ROOT}/media/layout/{set_}/{shot}.json"))
    out = f"{ROOT}/media/keyframes/r4/{set_}/_prompts/_guides"
    os.makedirs(out, exist_ok=True)
    form = np.asarray(Image.open(f"{ROOT}/media/layout/{set_}/{shot}_form.png").convert("RGB")).astype(float)
    cont = np.asarray(Image.open(f"{ROOT}/media/layout/{set_}/{shot}_contour.png").convert("RGB")).astype(float)
    H, W = form.shape[:2]
    M = np.zeros((H, W), bool)
    KEEP = np.zeros((H, W), bool)       # eyes (whites, irises, pupils) and glasses stay drawn (Jade 2026-11-28)
    CKEEP = np.zeros((H, W), bool)
    from scipy import ndimage as ndi
    warm = (form[..., 0] - form[..., 2]) > 25
    for f in figs:
        R = region_for(sc, f, cont, form, W, H)
        if R.any():   # the brows are outlined in the contour, so the flood fill misses them: add them by shape
            t0 = axis_t(sc, f, W, H)
            dk = ~warm & mask_for(sc, f, W, H, 1.15) & (t0 < -0.045) & (t0 > -0.5) & (form.mean(2) < 150)
            bro = ndi.binary_opening(dk, structure=np.ones((5, 5)))
            R |= ndi.binary_dilation(bro, iterations=4) & mask_for(sc, f, W, H, 1.15)
        M |= R
        if not R.any():
            continue
        t = axis_t(sc, f, W, H)
        nonwarm = R & ~warm
        thick = ndi.binary_opening(nonwarm, structure=np.ones((5, 5)))      # brows (and irises) are thick; rims are thin
        eyeband = (t > -0.045) & (t < 0.11)
        glassband = (t > -0.30) & (t < 0.38)
        keep = nonwarm & glassband & ~(thick & ~eyeband)
        keep |= nonwarm & eyeband
        keep = ndi.binary_dilation(keep, iterations=1) & R
        KEEP |= keep
        brow = ndi.binary_dilation(thick & ~eyeband & glassband, iterations=3)
        CKEEP |= R & glassband & ~brow
    if not M.any():   # faces too small to matter (wide shots): copy the guides unchanged
        Image.fromarray(form.astype(np.uint8)).save(f"{out}/{shot}_form_nf.png")
        Image.fromarray(cont.astype(np.uint8)).save(f"{out}/{shot}_contour_nf.png")
        print("no face region; copied", shot)
        return
    # skin tone: the median of the masked form pixels that are not dark (not hair, brows, pupils)
    px = form[M]
    lum = px.mean(1)
    skin = np.median(px[lum > np.percentile(lum, 40)], 0)
    soft = np.asarray(Image.fromarray((M * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(float)[..., None] / 255
    # keep the form's broad shading (a heavy blur of the luminance), lose the features
    blur = np.asarray(Image.fromarray(form.astype(np.uint8)).filter(ImageFilter.GaussianBlur(40))).astype(float)
    shade = blur.mean(2, keepdims=True) / max(1, blur[M].mean())
    fill = np.clip(skin * shade, 0, 255)
    nf = form * (1 - soft) + fill * soft
    # hair over the face (dark, not skin-coloured in the original) stays
    dark = Image.fromarray(((form.mean(2) < skin.mean() * 0.6) * 255).astype(np.uint8))
    hair = (np.asarray(dark.filter(ImageFilter.MinFilter(25)).filter(ImageFilter.MaxFilter(25))) > 0)[..., None]   # big dark areas only
    nf = np.where(hair & (soft > 0), form, nf)
    nf = np.where(KEEP[..., None], form, nf)
    Image.fromarray(nf.astype(np.uint8)).save(f"{out}/{shot}_form_nf.png")
    inner = np.asarray(Image.fromarray((M * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(7))) > 0
    c2 = cont.copy()
    c2[inner & ~CKEEP] = 255
    Image.fromarray(c2.astype(np.uint8)).save(f"{out}/{shot}_contour_nf.png")
    print("wrote", f"{out}/{shot}_form_nf.png", f"{out}/{shot}_contour_nf.png")


if __name__ == "__main__":
    main()
