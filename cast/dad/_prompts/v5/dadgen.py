#!/usr/bin/env python3
"""Dad v5-likeness sheets: one Codex image per call, run in tmux session proof-dad-sheets.

    python3 cast/dad/_prompts/v5/dadgen.py OUT.jpg PROMPT.txt REF[:what] [REF[:what] ...]

Reuses tools/kf/kf.py's run_codex (same task wording, same .codex.png -> jpg conversion) but in our own tmux
session, and writes a sidecar that records the likeness reference. The ONLY photo-derived file allowed as a ref is
inputs/family_photos/dad_age37/dad37_v5_t1.jpg (a generated image, approved by Jade 2026-11-25).
"""
import os, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.insert(0, os.path.join(ROOT, "tools", "kf"))
import kf
kf.SESSION = "proof-dad-sheets"
LIKENESS = "inputs/family_photos/dad_age37/dad37_v5_t1.jpg"
NOTE = ("likeness: inputs/family_photos/dad_age37/dad37_v5_t1.jpg is a GENERATED image (Codex image_gen), derived from a real\n"
        "  family photo of Jade's father aged back to about 37; Jade, the director, approved it as Dad's likeness and approved its\n"
        "  use as a reference (2026-11-25). The real photo itself was not sent with this sheet. This sheet is a real private\n"
        "  person's likeness: do not push it to the public remote without Jade's say.\n")

def main():
    out, pf, *rs = sys.argv[1:]
    out = os.path.join(ROOT, out) if not os.path.isabs(out) else out
    refs = []
    for r in rs:
        p, _, what = r.partition(":")
        rel = os.path.relpath(os.path.join(ROOT, p) if not os.path.isabs(p) else p, ROOT)
        if any(x in rel for x in ("source_refs", "character sheets", "Pasted image")):
            raise SystemExit("refused: real photo " + rel)
        if rel.startswith("inputs/family_photos") and rel != LIKENESS:
            raise SystemExit("refused: only dad37_v5_t1.jpg may be sent from family_photos: " + rel)
        if not os.path.exists(os.path.join(ROOT, rel)):
            raise SystemExit("missing " + rel)
        refs.append((os.path.join(ROOT, rel), what))
    if len(refs) > 5:
        raise SystemExit("codex takes at most 5 refs")
    if os.path.exists(out):
        raise SystemExit("exists: " + out)
    body = open(pf).read().strip()
    lead = ("REFERENCE IMAGES. " + " ".join(f"Image {i+1}: {w or os.path.basename(p)}." for i, (p, w) in enumerate(refs)) + "\n\n") if refs else ""
    prompt = lead + body
    t0 = time.time()
    how = kf.run_codex(prompt, refs, out)
    with open(os.path.splitext(out)[0] + ".txt", "w") as f:
        f.write(f"route: {how}\ndate: {time.strftime('%Y-%m-%d %H:%M')}\nsize: 1672x941\n" + NOTE
                + "references (generated images only; image 1 is the generated likeness described above where listed):\n"
                + "".join(f"  image {i+1}: {os.path.relpath(p, ROOT)}" + (f"  [{w}]" if w else "") + "\n" for i, (p, w) in enumerate(refs))
                + f"\nprompt:\n{prompt}\n")
    print(f"OK {os.path.relpath(out, ROOT)} ({time.time()-t0:.0f}s)", flush=True)

if __name__ == "__main__":
    main()
