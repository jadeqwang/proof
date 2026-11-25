#!/usr/bin/env python3
"""Generate one artichoke stage through tools/kf/kf.py and append a row to media/genlog.jsonl.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY media/footage/artichoke/scripts/gen_stage.py --route codex --out media/footage/artichoke/stages/s13_v1.png \
        --prompt-file media/footage/artichoke/prompts/s13.txt --ref path:"what it is" [--ref ...] [--force]

kf.py writes the image and a .txt sidecar (route, refs, full prompt). cf routes already log to genlog via cf.py;
for the codex route (plan-billed, $0) this wrapper writes the genlog row itself, in the same shape.
"""
import hashlib, json, os, subprocess, sys, time
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), *[".."] * 4))
PY = "/home/jade/Documents/halys-video/.venv/bin/python"
args = sys.argv[1:]
route = args[args.index("--route") + 1]
out = args[args.index("--out") + 1]
pf = args[args.index("--prompt-file") + 1]
refs = [args[i + 1].partition(":")[0] for i, a in enumerate(args) if a == "--ref"]
t0 = time.time()
r = subprocess.run([PY, os.path.join(ROOT, "tools/kf/kf.py"), "--tag", "artichoke", *args], cwd=ROOT, capture_output=True, text=True)
sys.stdout.write(r.stdout); sys.stderr.write(r.stderr)
if route == "codex":
    side = os.path.join(ROOT, os.path.splitext(out)[0] + ".txt")
    prompt = open(side).read().split("\n\n", 1)[1].strip() if r.returncode == 0 and os.path.exists(side) else open(os.path.join(ROOT, pf)).read()
    row = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "model": "codex/image_gen", "tag": "artichoke",
           "prompt_sha": hashlib.sha256(prompt.encode()).hexdigest()[:12], "prompt": prompt[:300],
           "input": {"prompt": prompt, "images": ["file:" + os.path.join(ROOT, p) if not os.path.isabs(p) else "file:" + p for p in refs]},
           "est_usd": 0.0, "est_basis": "Codex plan (headless codex exec in tmux session proof-kf)", "ok": r.returncode == 0,
           "out": [out] if r.returncode == 0 else [], "secs": round(time.time() - t0, 1)}
    with open(os.path.join(ROOT, "media", "genlog.jsonl"), "a") as f:
        f.write(json.dumps(row) + "\n")
sys.exit(r.returncode)
