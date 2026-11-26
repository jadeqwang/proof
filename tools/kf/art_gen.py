#!/usr/bin/env python3
"""One canonical background-art image (layout/assets/art/<set>/<name>.png) through Codex image_gen in tmux (free).

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY tools/kf/art_gen.py --out layout/assets/art/office91/turkey_1.png --aspect 1.31 --prompt-file p.txt \
        [--assume "what is invented"] [--ref <generated sheet or render only>]

Writes the PNG (cropped to the exact aspect w/h) and a .txt sidecar: prompt, date, route, assumptions.
Session: tmux `proof-art` (KF_SESSION overrides). Never pass a real photo (tools/kf/kf.py FORBIDDEN applies).
Exit code 3 = Codex plan limit hit (work/kf_logs/CODEX_LIMIT_HIT written by kf.py's logic).
"""
import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("KF_SESSION", "proof-art")
import kf  # noqa: E402

ROOT = kf.ROOT


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--aspect", type=float, required=True, help="width / height of the real piece")
    ap.add_argument("--prompt-file", required=True)
    ap.add_argument("--assume", default="")
    ap.add_argument("--ref", action="append", default=[])
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    out = a.out if os.path.isabs(a.out) else os.path.join(ROOT, a.out)
    if os.path.exists(out) and not a.force:
        print("exists", out); return
    os.makedirs(os.path.dirname(out), exist_ok=True)
    body = open(a.prompt_file).read().strip()
    refs = []
    for r in a.ref:
        p, _, what = r.partition(":")
        p = p if os.path.isabs(p) else os.path.join(ROOT, p)
        if any(x in p for x in kf.FORBIDDEN) or "/inputs/" in p:
            raise SystemExit(f"refused: {p} may be a real photo")
        refs.append((p, what))
    shape = "square" if 0.85 <= a.aspect <= 1.18 else ("landscape" if a.aspect > 1 else "portrait")
    tmp = os.path.splitext(out)[0] + ".raw.png"
    # kf.run_codex asks for 16:9; restate the shape inside the prompt (later instruction wins in practice), then crop
    prompt = (f"IMPORTANT: make this image {shape.upper()} (not 16:9), roughly {a.aspect:.2f}:1 width to height. "
              "It is a flat, straight-on, edge-to-edge scan of the artwork itself: no wall, no frame unless asked, no "
              "perspective, no shadow, no hands, nothing around it.\n\n" + body)
    try:
        route = kf.run_codex(prompt, refs, tmp)
    except kf.CodexLimit:
        print("CODEX_LIMIT"); sys.exit(3)
    from PIL import Image
    im = Image.open(tmp).convert("RGB"); W, H = im.size
    if W / H > a.aspect:
        nw = round(H * a.aspect); im = im.crop(((W - nw) // 2, 0, (W - nw) // 2 + nw, H))
    else:
        nh = round(W / a.aspect); im = im.crop((0, (H - nh) // 2, W, (H - nh) // 2 + nh))
    if max(im.size) > 1024:
        s = 1024 / max(im.size); im = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
    im.save(out); os.remove(tmp)
    with open(os.path.splitext(out)[0] + ".txt", "w") as f:
        f.write(f"canonical background art for {os.path.relpath(out, ROOT)}\n"
                f"date: {time.strftime('%Y-%m-%d %H:%M')}\nroute: {route}\n"
                f"raw: {W}x{H}, centre-cropped to aspect {a.aspect:.3f} (w/h), saved {im.size[0]}x{im.size[1]}\n"
                f"refs: {', '.join(os.path.relpath(p, ROOT) for p, _ in refs) or 'none'}\n"
                f"assumed / invented: {a.assume or 'nothing beyond the prompt'}\n\nprompt:\n{prompt}\n")
    print("ok", out)


if __name__ == "__main__":
    main()
