#!/usr/bin/env python3
"""One image from one prompt, for Proof's sheets and keyframes. Writes the image and a .txt sidecar beside it.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY tools/kf/kf.py --route codex --out media/keyframes/attic/x.jpg --prompt-file p.txt --ref a.jpg:"what it is" --ref b.jpg
    $PY tools/kf/kf.py --route gpt2  ...        # openai/gpt-image-2 on Cloudflare, 3072x1728, quality high (paid)
    $PY tools/kf/kf.py --route nbp   ...        # google/nano-banana-pro 4K, at most 3 refs (paid)
    routes: codex | gpt2 | nbp | nb21 | seedream | flux | kling | krea        (--dry prints the composed prompt)

Routes
  codex   Codex's built-in image generation (on Jade's plan, no per-call cost), run inside tmux session `proof-kf`
          (one window per job, closed when done). Returns 1672x941. This script blocks until the file exists.
  others  Cloudflare unified catalog through tools/gen/cf.py (spend cap in tools/gen/spend.py).

Rules that hold for every call (HANDOFF.md): only generated sheets, renders of the 3D sets, or earlier outputs of this
script may be passed as --ref. Never anything under inputs/refs_chaosmonkey/source_refs or a real photograph.
"""
import argparse
import os
import shlex
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "tools", "gen"))
LOGS = os.path.join(ROOT, "work", "kf_logs")
SESSION = os.environ.get("KF_SESSION", "proof-kf")   # KF_SESSION=proof-kf2 for a separate round
LIMIT_FLAG = os.path.join(LOGS, "CODEX_LIMIT_HIT")   # written when Codex reports its plan limit; --route auto then goes to gpt2
FORBIDDEN = ("source_refs", "/character sheets/", "family_photos", "refs_house", "refs_shanghai", "refs_mortongrove",
             "refs_devon_market", "art style inspo", "/_superseded/")   # photos, and sheets replaced by newer ones

CF = {
    "gpt2": ("openai/gpt-image-2", lambda p, refs: {"prompt": p, "size": "3072x1728", "quality": "high", **({"images": refs} if refs else {})}, 16),
    "nbp": ("google/nano-banana-pro", lambda p, refs: {"prompt": p, "aspect_ratio": "16:9", "image_size": "4K", **({"image_input": refs} if refs else {})}, 3),
    "nb21": ("google/nano-banana-2.1", lambda p, refs: {"prompt": p, "aspect_ratio": "16:9", "resolution": "4K", **({"image_input": refs} if refs else {})}, 3),
    "seedream": ("bytedance/seedream-5-pro", lambda p, refs: {"prompt": p, "size": "2560x1440", "watermark": False, **({"image": refs} if refs else {})}, 10),
    "flux": ("black-forest-labs/flux-2-max", lambda p, refs: {"prompt": p, "width": 1920, "height": 1088, **({"input_images": refs} if refs else {})}, 8),
    "kling": ("klingai/kling-v4-image", lambda p, refs: {"prompt": p, "aspect_ratio": "16:9", **({"images": refs} if refs else {})}, 10),
    "krea": ("krea/krea-3", lambda p, refs: {"prompt": p, "aspect_ratio": "16:9", "resolution": "2K", **({"image_urls": refs} if refs else {})}, 8),
}


def tmux(*a, check=True):
    return subprocess.run(["tmux", *a], capture_output=True, text=True, check=check)


def run_codex(prompt, refs, out, timeout=1500):
    os.makedirs(LOGS, exist_ok=True)
    job = os.path.splitext(os.path.basename(out))[0] + f"_{int(time.time()) % 100000}"
    png = os.path.splitext(out)[0] + ".codex.png"
    if os.path.exists(png):
        os.remove(png)
    order = "; ".join(f"attached image {i + 1} = {os.path.basename(p)}" for i, (p, _) in enumerate(refs))
    task = ("Use the built-in image_gen tool (do not write code to draw it) to make exactly ONE 16:9 landscape image at the "
            "largest size it offers." + (f" The attached images are references in this order: {order}." if refs else "")
            + f" Prompt for the image:\n\n{prompt}\n\nSave the generated image to {png} . Do not write or change any other "
            "file. Reply with the saved path only.")
    tf = os.path.join(LOGS, job + ".task.txt")
    with open(tf, "w") as f:
        f.write(task)
    log, done = os.path.join(LOGS, job + ".log"), os.path.join(LOGS, job + ".done")
    cmd = "codex exec -s workspace-write --skip-git-repo-check -C " + shlex.quote(ROOT) + ' "$(cat ' + shlex.quote(tf) + ')"'
    for p, _ in refs:
        cmd += " -i " + shlex.quote(p)
    cmd += f" < /dev/null > {shlex.quote(log)} 2>&1; echo rc=$? > {shlex.quote(done)}"
    if tmux("has-session", "-t", SESSION, check=False).returncode != 0:
        tmux("new-session", "-d", "-s", SESSION, "-c", ROOT)
    tmux("new-window", "-d", "-t", SESSION + ":", "-n", job[:24], "-c", ROOT, cmd)
    t0 = time.time()
    while not os.path.exists(done):
        if time.time() - t0 > timeout:
            raise SystemExit(f"FAIL timeout {out} (log {log})")
        time.sleep(3)
    if not os.path.exists(png):
        tail = open(log, errors="replace").read()[-600:] if os.path.exists(log) else ""
        if "usage limit" in tail:
            with open(LIMIT_FLAG, "w") as f:
                f.write(time.strftime("%Y-%m-%d %H:%M") + "\n" + tail)
            raise CodexLimit(tail)
        raise SystemExit(f"FAIL no image {out}: {tail}")
    if out.lower().endswith((".jpg", ".jpeg")):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", png, "-q:v", "2", out], check=True)
        os.remove(png)
    else:
        os.replace(png, out)
    return f"codex image_gen (headless codex exec in tmux session {SESSION}; on plan, $0)"


class CodexLimit(Exception):
    pass


def run_cf(route, prompt, refs, out, tag):
    import cf
    model, build, cap = CF[route]
    if len(refs) > cap:
        raise SystemExit(f"{route} takes at most {cap} refs, got {len(refs)}")
    inp = build(prompt, ["file:" + p for p, _ in refs])
    stem, ext = os.path.splitext(out)
    paths = cf.generate(model, inp, stem, tag=tag)          # extension sniffed
    got = paths[0]
    if os.path.splitext(got)[1].lower() != ext.lower():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", got, "-q:v", "2", out], check=True)
        os.remove(got)
    est, why = cf.estimate(model, inp)
    return f"{model} via Cloudflare (est ${est}: {why})"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--route", required=True, choices=["codex", "auto", *CF], help="auto = codex until its plan limit is hit (flag file in work/kf_logs), then gpt2")
    ap.add_argument("--out", required=True)
    ap.add_argument("--prompt-file")
    ap.add_argument("--prompt")
    ap.add_argument("--ref", action="append", default=[], help="path[:what the image is for]")
    ap.add_argument("--tag", default="kf")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    out = a.out if os.path.isabs(a.out) else os.path.join(ROOT, a.out)
    body = a.prompt if a.prompt else open(a.prompt_file).read().strip()
    refs = []
    for r in a.ref:
        p, _, what = r.partition(":")
        p = p if os.path.isabs(p) else os.path.join(ROOT, p)
        if not os.path.exists(p):
            raise SystemExit(f"missing ref {p}")
        if any(x in p for x in FORBIDDEN):
            raise SystemExit(f"refused: {p} is a real-photo location and must not be sent to a service")
        refs.append((p, what))
    lead = ""
    if refs:
        lead = "REFERENCE IMAGES. " + " ".join(f"Image {i + 1}: {w or os.path.basename(p)}." for i, (p, w) in enumerate(refs)) + "\n\n"
    prompt = lead + body
    if a.dry:
        print(prompt)
        return
    if os.path.exists(out) and not a.force:
        raise SystemExit(f"exists: {out} (use --force, or bump the version in the name)")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    t0 = time.time()
    route = a.route
    if route == "auto":
        route = "gpt2" if os.path.exists(LIMIT_FLAG) else "codex"
    try:
        how = run_codex(prompt, refs, out) if route == "codex" else run_cf(route, prompt, refs, out, a.tag)
    except CodexLimit as e:
        if a.route != "auto":
            raise SystemExit(f"FAIL codex usage limit {out}: {e}")
        print("codex plan limit hit; falling back to gpt2", flush=True)
        how = run_cf("gpt2", prompt, refs, out, a.tag)
    with open(os.path.splitext(out)[0] + ".txt", "w") as f:
        f.write(f"route: {how}\ndate: {time.strftime('%Y-%m-%d %H:%M')}\nreferences (generated sheets and set renders only, no photos):\n"
                + "".join(f"  image {i + 1}: {os.path.relpath(p, ROOT)}" + (f"  [{w}]" if w else "") + "\n" for i, (p, w) in enumerate(refs))
                + f"\n{prompt}\n")
    print(f"OK {os.path.relpath(out, ROOT)} ({time.time() - t0:.0f}s) {how}", flush=True)


if __name__ == "__main__":
    main()
