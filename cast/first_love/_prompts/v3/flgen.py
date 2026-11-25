#!/usr/bin/env python3
"""First love v3 sheets (Jade 2026-11-25 late corrections): one Codex image per call, in tmux session proof-fl3.

    python3 cast/first_love/_prompts/v2/flgen.py OUT.jpg PROMPT.txt REF[:what] [REF[:what] ...]

PROMPT.txt may contain {hair} {d27} {d19} {d24} {never} {style}: filled from the block files beside this script.
Reuses tools/kf/kf.py's run_codex (same task wording, .codex.png -> jpg) in our own tmux session, and writes a
sidecar in the cast/ format. Only generated sheets may be refs: never real photos.
"""
import os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(HERE))))
sys.path.insert(0, os.path.join(ROOT, "tools", "kf"))
import kf
kf.SESSION = "proof-fl3"
FORBIDDEN = ("source_refs", "character sheets", "family_photos", "Pasted image")
BLOCKS = {k: open(os.path.join(HERE, k + ".txt")).read().strip() for k in ("hair", "d27", "d19", "d24", "never", "style", "hands", "round")}

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
                + "references passed (generated sheets only, no photos):\n"
                + "".join(f"  image {i+1}: {os.path.relpath(p, ROOT)}" + (f"  [{w}]" if w else "") + "\n" for i, (p, w) in enumerate(refs))
                + f"\nprompt:\n{prompt}\n")
    print(f"OK {os.path.relpath(out, ROOT)} ({time.time()-t0:.0f}s)", flush=True)

if __name__ == "__main__":
    main()
