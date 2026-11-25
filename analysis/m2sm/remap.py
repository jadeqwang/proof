#!/usr/bin/env python3
"""Convert v3 song times to -2sm times with analysis/m2sm/time_map.json.

  remap.py 3:05                 one time (m:ss[.s] or seconds) -> -2sm, with any flag
  remap.py 2:16-2:21 154.2      several times / ranges
  remap.py --file layout/sets/basement90/shots.js            dry run: show every change as a diff
  remap.py --file ... --write                                  apply it (no backup: commit first, git is the undo)
  remap.py --file ... --skip-ids BR1,BRpan_a --only-ids ...    restrict by shot id
  remap.py --snap ...           lyric-synced cuts: a v3 line start goes to the -2sm sung onset (lyrics_timed.json)

What --file rewrites, in v3 time only:
  * `t: [a, b]` second arrays;
  * song times written m:ss or m:ss.s (0:00-4:59) inside strings and // comments, single or as ranges ("2:16-2:17.5");
  * the label "v3" next to a converted time becomes "-2sm" (not inside paths such as analysis/v3/).
What it leaves alone:
  * any shot block (from one `{ id: '...'` line to the next) or comment line that mentions -2sm / 2sm: those shots
    are already on the -2sm clock (mv10's BRpan_*, V3_rev_*, V3_rcv*: check the dry run);
  * seconds in other keys (start_s, end_s, t_s, duration_s ...), clock times (09:30, 16:30), scales (1:60 is not a time).
Times inside v3's dropped interlude half (2:34.1-2:43.8) and its sparse coda lead-in (4:24.5-4:25.9) collapse to one point
and are FLAGGED: re-place those by hand. mv10 mixes clocks and not every -2sm shot says so: pass --skip-ids for those.
"""
import argparse, bisect, difflib, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TM = json.load(open(os.path.join(HERE, "time_map.json")))
XS = [a["v3"] for a in TM["anchors"]]; YS = [a["m2sm"] for a in TM["anchors"]]
GAPS = [(g["v3"][0], g["v3"][1], g["flag"]) for g in TM["only_in_v3"]]


SNAP = [(a["v3"], a["m2sm_sung_onset"]) for a in TM["anchors"] if "m2sm_sung_onset" in a]
SNAP_TOL = None  # set by --snap


def m2(t):
    """v3 seconds -> (-2sm seconds, flag or ''). With --snap, a v3 lyric-line start (within SNAP_TOL) goes to the
    -2sm sung onset of that line's first word instead of the audio-aligned point (they differ by up to ~1 s, because
    v3's line starts came from whisper, which starts words early)."""
    if SNAP_TOL is not None:
        for v, s in SNAP:
            if abs(t - v) <= SNAP_TOL: return s, ""
    flag = ""
    for a, b, msg in GAPS:
        if a < t < b: flag = msg
    if t <= XS[0]: return YS[0] + (t - XS[0]), flag
    if t > XS[-1]: return YS[-1] + (t - XS[-1]), flag or "past the end of v3"
    if t == XS[-1]: return YS[-1], flag
    i = bisect.bisect_right(XS, t) - 1
    a, c, b, d = XS[i], XS[i + 1], YS[i], YS[i + 1]
    return b + (t - a) * (d - b) / (c - a), flag


def parse(s):
    if ":" in s:
        m, sec = s.split(":"); return int(m) * 60 + float(sec)
    return float(s)


def fmt(t, dec=None):
    """m:ss, or m:ss.s when dec=1 (keep the source's precision)."""
    if dec is None: dec = 0 if abs(t - round(t)) < 0.05 else 1
    t = round(t, dec); m = int(t // 60); s = t - 60 * m
    return f"{m}:{s:0{3 + dec if dec else 2}.{dec}f}"


TIME = re.compile(r"(?<![\d:./])([0-4]):([0-5]\d)(\.\d+)?(?![\d:])")
TARR = re.compile(r"(\bt:\s*\[)\s*([\d.]+)\s*,\s*([\d.]+)\s*(\])")
V3LBL = re.compile(r"(?<![/\w.])v3(?![/\w.])")
SKIP = re.compile(r"-?2sm")
NOT_TIME_BEFORE = re.compile(r"(scale|at|1)\s*$", re.I)  # "scale 1:60", "drawn at 1:30"


def conv_line(line, flags):
    changed = False
    def t_sub(m):
        nonlocal changed
        a, b = float(m.group(2)), float(m.group(3)); (x, fa), (y, fb) = m2(a), m2(b)
        for f in (fa, fb):
            if f: flags.append(f"t [{a}, {b}]: {f}")
        changed = True
        dec = max(len(m.group(2).split(".")[1]) if "." in m.group(2) else 0, 2)
        return f"{m.group(1)}{x:.{dec}f}, {y:.{dec}f}{m.group(4)}"
    line = TARR.sub(t_sub, line)
    def s_sub(m):
        nonlocal changed
        pre = line[max(0, m.start() - 8):m.start()]
        if NOT_TIME_BEFORE.search(pre) and "scale" in pre.lower(): return m.group(0)
        t = int(m.group(1)) * 60 + int(m.group(2)) + (float(m.group(3)) if m.group(3) else 0)
        x, f = m2(t)
        if f: flags.append(f"{m.group(0)}: {f}")
        changed = True
        return fmt(x, len(m.group(3)) - 1 if m.group(3) else (0 if abs(x - round(x)) < 0.25 else 1))
    line = TIME.sub(s_sub, line)
    if changed and TIME.search(line): line = V3LBL.sub("-2sm", line)
    return line


def remap_file(path, write, skip, only):
    src = open(path).read().splitlines(keepends=True)
    out, flags, skipped = [], [], []
    # pre-scan: which shot blocks mention -2sm
    # Assign every line to a shot block: a `{ id: '...'` line opens one; a run of // comment lines directly above it
    # belongs to it; a section rule (// ----- or // =====) or the closing `];` ends it. A block any of whose lines
    # mentions -2sm is on the -2sm clock already and is left alone.
    ID = re.compile(r"\s*\{\s*id:\s*'([^']+)'"); RULE = re.compile(r"\s*//\s*[-=]{8,}|\s*\];")
    owner, cur = [None] * len(src), None
    for i, ln in enumerate(src):
        m = ID.match(ln)
        if m: cur = m.group(1)
        elif RULE.match(ln): cur = None
        owner[i] = cur
    for i in range(len(src) - 1, -1, -1):  # comment runs above a shot belong to that shot
        if src[i].lstrip().startswith("//") and not RULE.match(src[i]) and i + 1 < len(src):
            nxt = owner[i + 1] if (ID.match(src[i + 1]) or src[i + 1].lstrip().startswith("//")) else None
            if nxt and (ID.match(src[i + 1]) or owner[i + 1] != owner[i]): owner[i] = nxt
    blocks = {}
    for i, ln in enumerate(src):
        if owner[i]: blocks[owner[i]] = blocks.get(owner[i], False) or bool(SKIP.search(ln))
    for i, ln in enumerate(src):
        block_id = owner[i]
        keep = False
        if block_id is not None:
            if blocks.get(block_id) or block_id in skip or (only and block_id not in only): keep = True
        elif only: keep = True
        if SKIP.search(ln): keep = True
        if keep:
            if block_id and block_id not in skipped and (blocks.get(block_id) or block_id in skip): skipped.append(block_id)
            out.append(ln); continue
        f = []; new = conv_line(ln, f); out.append(new)
        flags += [f"{block_id or '(file)'}: {x}" for x in f]
    diff = list(difflib.unified_diff(src, out, path, path + " (-2sm)", n=0))
    sys.stdout.writelines(diff)
    print(f"\n# {sum(1 for d in diff if d.startswith('+') and not d.startswith('+++'))} lines changed; "
          f"left alone (already -2sm or --skip-ids): {', '.join(skipped) or 'none'}")
    for f in flags: print("# FLAG", f)
    if write:
        open(path, "w").writelines(out); print(f"# written {path} (git diff shows the change; git checkout restores it)")


ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("times", nargs="*", help="v3 times: 185.2, 3:05, 2:16-2:21")
ap.add_argument("--file"); ap.add_argument("--write", action="store_true")
ap.add_argument("--skip-ids", default=""); ap.add_argument("--only-ids", default="")
ap.add_argument("--snap", action="store_true", help="send v3 lyric-line starts to the -2sm sung onset of that line")
ap.add_argument("--snap-tol", type=float, default=0.15, help="how close to a v3 line start counts (s, default 0.15)")
a = ap.parse_args()
SNAP_TOL = a.snap_tol if a.snap else None
if a.file:
    remap_file(a.file, a.write, set(filter(None, a.skip_ids.split(","))), set(filter(None, a.only_ids.split(","))))
for t in a.times:
    parts = t.split("-") if re.fullmatch(r"[\d:.]+-[\d:.]+", t) else [t]
    res = [m2(parse(p)) for p in parts]
    print(f"v3 {t}  ->  -2sm " + "-".join(f"{x:.2f}s ({fmt(x, 1)})" for x, _ in res) + "".join(f"  [{f}]" for _, f in res if f))
