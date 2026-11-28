#!/usr/bin/env python3
"""Keyframes round 4 review page: media/keyframes/r4/index.html (open it from disk).

    python3 tools/kf/r4_page.py

Built from r3_page.py (same cards, film order, lyric, answers). What r4 adds:
- Reads media/keyframes/r4/<set>/picks.json when a set has been painted; before that (or for shots the painter has not
  put in picks.json yet) it lists the takes on disk from media/keyframes/r4/<set>/_prompts/_jobs.json.
- Every other shot CARRIES its r3 pick (media/keyframes/r3/<set>/picks.json): the shots Jade marked Good in
  media/keyframes/r3/JADE_R3_REVIEW.md, and the shots she has not reviewed yet (59 of 104 at the time of writing).
  Shots she marked Redo / Wrong staging that are not in any r4 job get a "repaint pending" badge (or "dropped" for the
  ones in DROPPED). Footage and plate cards carry from r3 unchanged.
- Each r4 take is shown next to the NEW guide (media/layout/<set>/<SHOT>_contour.png, the render it was painted from);
  carried cards show the r3 guides (the r3 snapshot) and repainted cards also show the r3 pick for comparison.
- Jade's r3 verdict + note on every card she answered. Answers persist in localStorage under 'proof-kf-r4'; "Copy my
  answers" produces a block beginning `Keyframes r4 (from media/keyframes/r4/index.html):`.
- Song follow (tools/pages/songfollow.js): a player bar plays inputs/Proof (-2sm).mp3 and walks the cards with it. Each
  card's song time (data-t, -2sm) is cross-checked against layout/sets/<set>/shots.js: where shots.js is newer (a time
  picks.json lacks, or one it disagrees with) shots.js wins and the card says so ("Song time" line, amber); every such
  card is also listed in the intro. Cards with no time at all go to the "Untimed" group at the end.
"""
import html
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pages"))
import songfollow  # noqa: E402  (tools/pages: the song player bar)
import r2_page  # noqa: E402
import r3_page  # noqa: E402  (PLATES, SLOT_PLATES, SETS, time helpers, the r3 snapshot paths, TEMPLATE)

ROOT = r3_page.ROOT
R3 = r3_page.R3
R4 = os.path.join(ROOT, "media", "keyframes", "r4")
TH = os.path.join(R4, "_thumbs")
SETS = r3_page.SETS
KEY = "proof-kf-r4"
DROPPED = {"PC5": "Jade (r3): \"let's just give up on this shot entirely. the 3D model is so far off.\""}
NEW_IDS = {"M4c", "MG2_end", "MG_wide"}   # ids with no r3 card (shown as new when they appear)


def jade_r3():
    """JADE_R3_REVIEW.md -> {id: (verdict, note)}."""
    out = {}
    for ln in open(os.path.join(R3, "JADE_R3_REVIEW.md")):
        m = re.match(r"^- ([\w\-]+): (.*)$", ln.rstrip())
        if not m:
            continue
        v, _, note = m.group(2).partition(" — ")
        out[m.group(1)] = (v.strip(), note.strip())
    return out


def thumb(src, w):
    p = os.path.join(ROOT, src)
    if not os.path.exists(p):
        return None
    out = os.path.join(TH, src.replace("/", "__").rsplit(".", 1)[0] + f"_{w}.jpg")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(p):
        os.makedirs(TH, exist_ok=True)
        subprocess.run(["convert", p + "[0]", "-resize", f"{w}x", "-quality", "86", out], check=True)
    return os.path.relpath(out, R4)


def rel(src):
    return os.path.relpath(os.path.join(ROOT, src), R4)


def fig(src, w, cap, missing):
    if not src:
        return None
    th = thumb(src, w)
    if not th:
        missing.append(src)
        return ["", rel(src), cap]
    return [th, rel(src), cap]


def load(p):
    return json.load(open(p)) if os.path.exists(p) else {}


UNTIMED_SEC = "Untimed: references, alternates and shots with no song time"
_TIME = r"~?(\d+):(\d+(?:\.\d+)?)"


def secs(m, i=1):
    return int(m.group(i)) * 60 + float(m.group(i + 1))


def label_span(label):
    """'2:17.2-2:18.3 Verse 2b' -> (137.2, 138.3); a single time -> (t, None); no time -> (None, None)."""
    m = re.match(r"\s*" + _TIME + r"(?:\s*[-\u2013]\s*" + _TIME + ")?", label or "")
    if not m:
        return None, None
    return secs(m), (secs(m, 3) if m.group(3) else None)


_SHOTS_JS = {}


def shots_js(st):
    """layout/sets/<set>/shots.js -> {id: (start or None, end or None, label)} from `t: [a, b]` or `time: '...'`.
    A plain text scan (the modules import three.js): only the block from one `id: '...'` to the next is read."""
    if st in _SHOTS_JS:
        return _SHOTS_JS[st]
    out = {}
    p = os.path.join(ROOT, "layout", "sets", st, "shots.js")
    src = open(p).read() if os.path.exists(p) else ""
    for m in re.finditer(r"\bid: '([\w\-]+)'", src):
        blk = src[m.end():m.end() + 4000]
        nx = re.search(r"\bid: '", blk)
        blk = blk[:nx.start()] if nx else blk
        t = re.search(r"\bt: \[([\d.]+), ([\d.]+)\]", blk)
        tm = re.search(r"\btime: '((?:[^'\\]|\\.)*)'", blk)
        hd = re.search(r"\bheader: '((?:[^'\\]|\\.)*)'", blk)
        if hd:
            out.setdefault("_header", {})[m.group(1)] = hd.group(1).replace("\\'", "'")
        if t:
            a, b = float(t.group(1)), float(t.group(2))
            out.setdefault(m.group(1), (a, b, f"{r3_page.mmss(a)}-{r3_page.mmss(b)}"))
        elif tm:
            lab = tm.group(1).replace("\\'", "'")
            a, b = label_span(lab)
            out.setdefault(m.group(1), (a, b, lab))
    _SHOTS_JS[st] = out
    return out


def check_time(sid, st, t, label, header, footage):
    """Cross-check a shot card's time with shots.js and its header -> (t, label, end, [flags]).
    t >= 9000 means no time. shots.js wins over picks.json where they differ (it is edited later: Jade's decisions
    land there first); footage cards keep footage_slots.json's time (the plan's)."""
    flags = []
    a, b = label_span(label) if t < 9000 else (None, None)
    end = b
    sj = shots_js(st).get(sid)
    if sj:
        sa, sb, slab = sj
        if footage:
            if sa is not None and abs(sa - t) > 0.3:
                flags.append(f"shots.js says {slab}; footage_slots.json's {label} is kept (footage cards follow the plan)")
        elif sa is None and t < 9000 and "alternate" in slab.lower():
            flags.append(f"shots.js: {slab}; untimed here (picks.json said {label})")
            return 9999, "alternate (untimed)", None, flags
        elif sa is not None and (t >= 9000 or abs(sa - t) > 0.3 or (sb and b and abs(sb - b) > 0.3)):
            was = "no time in picks.json" if t >= 9000 else f"picks.json said {label}"
            flags.append(f"{was}; using shots.js: {slab}")
            t, label, end = sa, (f"{r3_page.mmss(sa)}-{r3_page.mmss(sb)}" if sb else r3_page.mmss(sa)), sb
    if t >= 9000:
        header = header or shots_js(st).get("_header", {}).get(sid, "")
        m = re.match(r"\s*" + _TIME + r"(?:\s*[-\u2013]\s*" + _TIME + ")?", header or "")
        if m:
            t, end = secs(m), (secs(m, 3) if m.group(3) else None)
            label = r3_page.mmss(t) + (f"-{r3_page.mmss(end)}" if end else "")
            flags.append(f"no time in picks.json or shots.js; placed at the header's {label}")
        else:
            flags.append("no song time anywhere (picks.json, shots.js, header): untimed")
            return 9999, "untimed", None, flags
    elif not sid.endswith("_end"):
        m = re.search(_TIME, header or "")
        if m and abs(secs(m) - t) > 0.6:
            flags.append(f"the header says {m.group(0)}, the card {label}")
    if t > songfollow.DURATION:
        flags.append(f"{r3_page.mmss(t)} is past the end of the song ({r3_page.mmss(songfollow.DURATION)})")
    return t, label, end, flags


def main():
    lines = json.load(open(os.path.join(ROOT, "media", "karaoke_v2", "lyrics_timed.json")))["lines"]
    slots = json.load(open(os.path.join(R3, "footage_slots.json")))["shots"]
    jade = jade_r3()
    cards, missing, retired, counts = [], [], [], {"painted": 0, "carried": 0, "pending": 0, "footage": 0, "dropped": 0}
    seen_ids = set()
    for s in SETS:
        p3 = load(os.path.join(R3, s, "picks.json"))
        p4 = load(os.path.join(R4, s, "picks.json"))
        jobs = load(os.path.join(R4, s, "_prompts", "_jobs.json"))
        ids = list(p3) + [k for k in list(jobs) + list(p4) if k not in p3]
        for sid in dict.fromkeys(ids):
            pk3, pk4, job = p3.get(sid, {}), p4.get(sid), jobs.get(sid)
            if pk3.get("source") == "retired" or pk3.get("status") == "retired":
                retired.append([sid, s, pk3.get("note", ""), pk3.get("jade_r2", "")])
                continue
            seen_ids.add(sid)
            base = pk4 or pk3
            t, label = r3_page.parse_time(base.get("time") or pk3.get("time"))
            slot = slots.get(sid)
            if slot:
                t, label = slot["song_start_s"], slot["song_time"]
            if t is None:
                t = r3_page.FALLBACK.get(sid, r3_page.R2T.get(sid, 9000))
                label = (label + " " if label else "") + f"(no time in picks.json; placed at {r3_page.mmss(t)})"
            foot = bool(slot) or (pk3.get("source") == "footage" and not (pk4 or job))
            t, label, t_end, tflags = check_time(sid, s, t, label, base.get("header") or "", foot)
            jv, jn = jade.get(sid, ("", ""))
            c = {"id": sid, "set": s, "t": t, "time": label, "header": base.get("header") or "", "kind": "shot",
                 "status": (pk4 or {}).get("status", ""), "note": (pk4 or {}).get("note", ""),
                 "jade": (jv + (" — " + jn if jn else "")) if jv else "(not reviewed in r3)",
                 "isnew": sid in NEW_IDS and not pk3, "guides": [], "takes": [], "pairs": [],
                 "tEnd": t_end, "tflag": "; ".join(tflags)}
            new_guides = []
            for kind in ("contour", "form", "light"):
                g = f"media/layout/{s}/{sid}_{kind}.png"
                if os.path.exists(os.path.join(ROOT, g)):
                    new_guides.append((kind, g))
            if pk3.get("source") == "footage" and not (pk4 or job):
                counts["footage"] += 1
                c["kind"], c["source"] = "footage", "footage"
                big = fig(slot["still"], 1400, f"footage still at {slot['still_footage_s']:g} s", missing) if slot else None
                if slot:
                    c["slot"] = {k: slot.get(k) for k in ("song_time", "footage", "footage_start_s", "footage_end_s", "speed", "source", "note")}
                elif pk3.get("pick"):
                    big = fig(f"media/keyframes/r3/{s}/{pk3['pick']}", 1400, pk3["pick"], missing)
                c["kf"] = big
            elif pk4 or job:
                # repainted in r4: takes from picks.json, else whatever exists on disk from the job list
                takes = (pk4 or {}).get("takes") or [os.path.basename(o) for o in (job or {}).get("outs", [])]
                have = [tk for tk in takes if os.path.exists(os.path.join(R4, s, tk))]
                pick = (pk4 or {}).get("pick") or (have[0] if have else None)
                c["source"] = "painted" if have else "queued"
                counts["painted" if have else "pending"] += 1
                c["kf"] = fig(f"media/keyframes/r4/{s}/{pick}", 1400, f"r4 {pick}", missing) if pick and pick in have else None
                contour = new_guides[0][1] if new_guides else None
                for tk in (takes if have else []):
                    if tk not in have:
                        continue
                    c["pairs"].append([fig(f"media/keyframes/r4/{s}/{tk}", 320, tk + (" (pick)" if tk == pick else ""), missing),
                                       fig(contour, 320, "new guide (contour)", missing) if contour else None])
                if not have and pk3.get("pick"):
                    c["kf"] = fig(f"media/keyframes/r3/{s}/{pk3['pick']}", 1400, f"r3 {pk3['pick']} (r4 repaint queued, not painted yet)", missing)
                if not have:
                    c["note"] = c["note"] or ("queued: prompt " + (job or {}).get("prompt", "?") + " (not painted yet)")
                if pk3.get("pick"):
                    c["takes"].append(fig(f"media/keyframes/r3/{s}/{pk3['pick']}", 320, f"r3 pick ({pk3['pick']})" + (" — you marked Good" if jv == "Good" else ""), missing))
                c["guides"] = [fig(g, 480, "new " + k, missing) for k, g in new_guides]
            else:
                # carried from r3 (Good, unreviewed, or a Redo still waiting)
                pending = jv.startswith(("Redo", "Wrong")) and sid not in DROPPED
                if sid in DROPPED:
                    c["source"], c["note"] = "dropped", DROPPED[sid]
                    counts["dropped"] += 1
                elif pending:
                    c["source"], c["note"] = "pending", "Jade asked for a change in r3, but this shot is not in the r4 repaint list yet (r3 pick shown)."
                    counts["pending"] += 1
                else:
                    c["source"] = "carried"
                    counts["carried"] += 1
                if pk3.get("pick"):
                    c["kf"] = fig(f"media/keyframes/r3/{s}/{pk3['pick']}", 1400, f"r3 {pk3['pick']} (carried)", missing)
                    for tk in pk3.get("takes", []):
                        if tk != pk3["pick"]:
                            c["takes"].append(fig(f"media/keyframes/r3/{s}/{tk}", 320, "r3 " + tk, missing))
                else:
                    c["kf"] = None
                for kind in ("contour", "form", "light"):
                    g = r3_page.layout_src(f"media/layout/{s}/{sid}_{kind}.png")
                    if os.path.exists(os.path.join(ROOT, g)):
                        c["guides"].append(fig(g, 480, "r3 " + kind, missing))
            c["lyric"] = r2_page.lyric_for(*r3_page.span_of(label, t), lines) if t < 9000 else ""
            cards.append(c)
    for pid, (t, label, title, imgs, ctx) in r3_page.PLATES.items():
        cards.append({"id": pid, "t": t, "time": label, "kind": "plate", "title": title, "ctx": ctx,
                      "jade": " — ".join(x for x in jade.get(pid, ("", "")) if x),
                      "imgs": [fig(p, 1400, cap, missing) for p, cap in imgs],
                      "lyric": r2_page.lyric_for(*r3_page.span_of(label, t), lines) if t < 9000 else ""})
    for pid, (title, extra) in r3_page.SLOT_PLATES.items():
        slot = slots[pid]
        t, label = slot["song_start_s"], slot["song_time"]
        imgs = [fig(slot["still"], 1400, f"footage still at {slot['still_footage_s']:g} s", missing)] + [fig(p, 1400, cap, missing) for p, cap in extra]
        cards.append({"id": pid, "t": t + 0.01, "time": label, "kind": "plate", "title": title, "ctx": slot["note"], "imgs": imgs,
                      "jade": " — ".join(x for x in jade.get(pid, ("", "")) if x),
                      "slot": {k: slot.get(k) for k in ("song_time", "footage", "footage_start_s", "footage_end_s", "speed", "source")},
                      "lyric": r2_page.lyric_for(*r3_page.span_of(label, t), lines)})
    for sid, (s, why) in r3_page.RETIRED_EXTRA.items():
        retired.append([sid, s, why, ""])
    rank = {k: i for i, k in enumerate(r3_page.TIEBREAK)}
    cards.sort(key=lambda c: (r3_page.SORT_T.get(c["id"], c["t"]), rank.get(c["id"], 0)))
    flagged = []
    for c in cards:
        sec = [x for x in r2_page.SECTIONS if x[0] <= c["t"] + 1e-6][-1]
        c["sec"], c["secTime"] = sec[1], sec[2]
        if c["t"] >= 9000:   # no song time: the untimed group at the end, never highlighted
            c["sec"], c["secTime"], c["sf"] = UNTIMED_SEC, "", None
        else:
            c["sf"] = round(r3_page.SORT_T.get(c["id"], c["t"]), 2)
            if c.get("tEnd") is None:
                c["tEnd"] = label_span(c["time"])[1]
        if c.get("tflag"):
            flagged.append(f"<a href=\"#c-{html.escape(c['id'])}\">{html.escape(c['id'])}</a>: {html.escape(c['tflag'])}")
    unreviewed = sum(1 for c in cards if c.get("jade") == "(not reviewed in r3)")
    head = [
        "<b>New guides.</b> Every set was re-rendered with rigged human bodies, eyes aimed at what each person looks at, the real clothing colours, and fixed wall art, book spines, logos and screens. Each repainted take is shown next to the guide it was painted from.",
        f"<b>What is new:</b> {counts['painted']} shots repainted, {counts['pending']} queued or waiting; {counts['carried']} carried from r3 (marked Good, or not reviewed yet: {unreviewed} cards had no r3 answer); {counts['footage']} footage cards and the plates unchanged; dropped: {', '.join(DROPPED) or 'none'}.",
        "<b>Your r3 answer</b> is on every card you answered (purple). Repainted cards also show the r3 pick small, for comparison.",
        "<b>Play the song</b> with the bar at the bottom (or the space bar): the page scrolls to the card on screen at that moment and marks it; the cards already passed are dimmed. Scroll yourself and it stops following (or pauses: your choice in the bar); <b>Play from here</b> resumes at the first card in view, and clicking a card's time plays from that card.",
    ]
    if flagged:
        head.append(f"<b>Song times to check ({len(flagged)}):</b> amber \"Song time\" line on each card.<ul class=\"note\">"
                    + "".join(f"<li>{x}</li>" for x in flagged) + "</ul>")
    qs = {}
    page = (r3_page.TEMPLATE.replace("__DATA__", json.dumps(cards, ensure_ascii=False))
            .replace("__RETIRED__", json.dumps(retired, ensure_ascii=False))
            .replace("__QS__", json.dumps(qs, ensure_ascii=False))
            .replace("__HEAD__", "".join(f"<li>{h}</li>" for h in head)))
    page = (page.replace("keyframes, round 3", "keyframes, round 4")
            .replace("const KEY = 'proof-keyframes-r3-v1';", f"const KEY = '{KEY}';")
            .replace("Keyframes r3 (from media/keyframes/r3/index.html):", "Keyframes r4 (from media/keyframes/r4/index.html):")
            .replace("Your r2 note", "Your r3 answer")
            .replace("Painted overnight 2026-11-25/26 from your round-2 review. What changed this round:", "Round 4, from your round-3 review and the re-rendered sets. What changed:")
            .replace("Round 2 is at <a href=\"../r2/index.html\">r2/index.html</a>.", "Round 3 is at <a href=\"../r3/index.html\">r3/index.html</a>.")
            .replace("carried: '<span class=\"badge\">carried from r2</span>'",
                     "carried: '<span class=\"badge\">carried from r3</span>', queued: '<span class=\"badge weak\">queued, not painted yet</span>', pending: '<span class=\"badge weak\">repaint pending</span>', dropped: '<span class=\"badge\">dropped</span>'")
            .replace("if (c.takes.length) h += `<div class=\"note\">${c.kind === 'footage' ? 'set agent\\'s still' : 'other takes'}</div>",
                     "if (c.pairs && c.pairs.length) h += '<div class=\"note\">r4 takes, each beside its new guide</div>' + c.pairs.map(p => '<div class=\"takes\">' + fig(p[0]) + (p[1] ? fig(p[1]) : '') + '</div>').join('');\n      if (c.takes.length) h += `<div class=\"note\">${c.kind === 'footage' ? 'set agent\\'s still' : 'earlier / other takes'}</div>")
            .replace("if (c.kind === 'plate') {\n      h += '<div class=\"imgs\">'", "if (c.kind === 'plate') {\n      if (c.jade) h += `<p class=\"ctx jade\"><b>Your r3 answer:</b> ${esc(c.jade)}</p>`;\n      h += '<div class=\"imgs\">'"))
    page = (page.replace("d.className = 'card ' + c.kind; d.id = 'c-' + c.id;",
                         "d.className = 'card ' + c.kind; d.id = 'c-' + c.id;\n    if (c.sf != null) { d.dataset.t = c.sf; if (c.tEnd) d.dataset.tEnd = c.tEnd; }")
            .replace("    if (c.diff) h +=", "    if (c.tflag) h += `<p class=\"ctx diff\"><b>Song time:</b> ${esc(c.tflag)}</p>`;\n    if (c.diff) h +="))
    page = songfollow.inject(page, os.path.join(R4, "index.html"), cards=".card", time_label="h3 .t")
    for must in (f"const KEY = '{KEY}';", "r4 takes, each beside its new guide", "Keyframes r4 (from", "d.dataset.t = c.sf", "Song time:</b>", "songfollow:begin"):
        if must not in page:
            raise SystemExit(f"template patch failed: {must!r} not found (r3_page.TEMPLATE changed?)")
    os.makedirs(R4, exist_ok=True)
    with open(os.path.join(R4, "index.html"), "w") as f:
        f.write(page)
    print(f"wrote media/keyframes/r4/index.html: {len(cards)} cards; {counts}; retired {len(retired)}; "
          f"missing files: {len(missing)}" + (f" (first: {missing[:5]})" if missing else ""))


if __name__ == "__main__":
    main()
