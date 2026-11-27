#!/usr/bin/env python3
"""First love v9 sheets (2026-11-26 night: hair in the matched shade #3f342e, a dark, slightly warm brown, no red; v8 was too dark), in tmux session proof-cast9.

    python3 cast/first_love/_prompts/v9/flgen.py OUT.jpg PROMPT.txt REF[:what] [REF[:what] ...]

PROMPT.txt may contain {hair} {d27} {d19} {d24} {never} {style}: filled from the block files beside this script.
Reuses tools/kf/kf.py's run_codex (same task wording, .codex.png -> jpg) in our own tmux session, and writes a
sidecar in the cast/ format. Only generated sheets may be refs: never real photos.
"""
import os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(HERE))))
sys.path.insert(0, os.path.join(ROOT, "tools", "kf"))
import kf
kf.SESSION = os.environ.get("FL_SESSION", "proof-cast9")
FORBIDDEN = ("inputs/", "source_refs", "character sheets", "family_photos", "Pasted image")
V4 = os.path.join(os.path.dirname(HERE), "v4"); V5 = os.path.join(os.path.dirname(HERE), "v6"); V55 = os.path.join(os.path.dirname(HERE), "v5")
BLOCKS = {k: open(os.path.join(next(d for d in (HERE, V5, V55, V4) if os.path.exists(os.path.join(d, k + ".txt"))), k + ".txt")).read().strip() for k in ("hair", "d27", "d19", "d24", "never", "style", "hands", "round", "step", "seal", "shape", "hoodie")}
APPROVED = ("work/ias/ias_seal_ref.png", "work/ias/hoodie_crop_garment.png")   # Jade approved these two refs, 2026-11-25

def main():
    out, pf, *rs = sys.argv[1:]
    out = os.path.join(ROOT, out) if not os.path.isabs(out) else out
    refs = []
    for r in rs:
        p, _, what = r.partition(":")
        rel = os.path.relpath(os.path.join(ROOT, p) if not os.path.isabs(p) else p, ROOT)
        if any(x in rel for x in FORBIDDEN):
            raise SystemExit("refused: real-photo location " + rel)
        if not os.path.exists(os.path.join(ROOT, rel)):
            raise SystemExit("missing " + rel)
        refs.append((os.path.join(ROOT, rel), what))
    if len(refs) > 5:
        raise SystemExit("codex takes at most 5 refs")
    if os.path.exists(out):
        raise SystemExit("exists: " + out)
    body = open(pf).read().strip().format(**BLOCKS)
    lead = ("REFERENCE IMAGES. " + " ".join(f"Image {i+1}: {w or os.path.basename(p)}." for i, (p, w) in enumerate(refs)) + "\n\n") if refs else ""
    prompt = lead + body
    t0 = time.time()
    how = kf.run_codex(prompt, refs, out)
    with open(os.path.splitext(out)[0] + ".txt", "w") as f:
        f.write(f"route: {how}\ndate: {time.strftime('%Y-%m-%d %H:%M')}\nsize: 1672x941\n"
                + ("references passed (generated sheets, plus two refs JADE APPROVED for the image model on 2026-11-25: the official IAS seal art copied to work/ias/ias_seal_ref.png, and a garment-only crop of her hoodie product photo, cut below the model's chin with the neck painted out, work/ias/hoodie_crop_garment.png; both from gitignored inputs/refs_ias/, kept private):\n"
                   if any(os.path.relpath(p, ROOT) in APPROVED for p, _ in refs) else "references passed (generated sheets only, no photos):\n")
                + "".join(f"  image {i+1}: {os.path.relpath(p, ROOT)}" + (f"  [{w}]" if w else "") + "\n" for i, (p, w) in enumerate(refs))
                + f"\nprompt:\n{prompt}\n")
    print(f"OK {os.path.relpath(out, ROOT)} ({time.time()-t0:.0f}s)", flush=True)

if __name__ == "__main__":
    main()
