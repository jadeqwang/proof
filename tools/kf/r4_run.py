#!/usr/bin/env python3
"""Paint one r4 set from its _jobs.json (written by media/keyframes/r4/<set>/_prompts/_make.py).

    KF_SESSION=proof-kf4-<set> python3 tools/kf/r4_run.py <set> [SHOT ...] [--dry]

Calls tools/kf/kf.py --route codex (the free Codex plan route ONLY; never a paid route) for every take of every shot
(2 per shot), at most TWO kf.py jobs at a time. Skips takes whose output already exists. Stops scheduling new jobs as
soon as kf.py reports the Codex plan limit (it then writes work/kf_logs/CODEX_LIMIT_HIT) and lists what is left.
--dry prints the kf.py command lines instead of running them.
"""
import json
import os
import subprocess
import sys
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PY = "/home/jade/Documents/halys-video/.venv/bin/python"
MAXJOBS = 2


def main():
    args = sys.argv[1:]
    dry = "--dry" in args
    args = [a for a in args if not a.startswith("--")]
    set_, only = args[0], set(args[1:])
    sess = os.environ.get("KF_SESSION", "")
    if sess != f"proof-kf4-{set_}":
        raise SystemExit(f"set KF_SESSION=proof-kf4-{set_} (got {sess!r}); the set's _run.sh does this")
    jobs = json.load(open(os.path.join(ROOT, "media", "keyframes", "r4", set_, "_prompts", "_jobs.json")))
    todo = []
    for shot, j in jobs.items():
        if only and shot not in only:
            continue
        for out in j["outs"]:
            if os.path.exists(os.path.join(ROOT, out)):
                print(f"skip (exists) {out}")
                continue
            cmd = [PY, os.path.join(ROOT, "tools/kf/kf.py"), "--route", "codex", "--tag", "kf4", "--out", out,
                   "--prompt-file", j["prompt"]]
            for r in j["refs"]:
                cmd += ["--ref", r]
            todo.append((out, cmd))
    if dry:
        for out, cmd in todo:
            print(" ".join(subprocess.list2cmdline([c]) for c in cmd))
        print(f"{len(todo)} takes")
        return
    lock, stop, left = threading.Lock(), threading.Event(), []

    def worker():
        while True:
            with lock:
                if not todo or stop.is_set():
                    return
                out, cmd = todo.pop(0)
            r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
            msg = (r.stdout + r.stderr).strip().splitlines()
            print(msg[-1] if msg else f"(no output) {out}", flush=True)
            if r.returncode != 0:
                with lock:
                    left.append(out)
                if "usage limit" in r.stdout + r.stderr:
                    stop.set()

    ts = [threading.Thread(target=worker) for _ in range(MAXJOBS)]
    [t.start() for t in ts]
    [t.join() for t in ts]
    left += [o for o, _ in todo]
    if stop.is_set():
        print("STOPPED: Codex plan limit hit. Not painted:", *left, sep="\n  ")
    elif left:
        print("Failed:", *left, sep="\n  ")
    else:
        print(f"{set_}: done")


if __name__ == "__main__":
    main()
