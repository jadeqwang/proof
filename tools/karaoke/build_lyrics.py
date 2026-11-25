#!/usr/bin/env python3
"""Build word-timed lyrics for inputs/Proof.wav (v3 render).

Canonical text and line windows: analysis/v3/song_map.md (transcribed into LINES below).
Timing: faster-whisper word timestamps (vocal stem + full mix), aligned with difflib,
then clamped to the song_map line window and refined with the vocal-stem envelope
(leading/trailing silence trimmed off words, since whisper makes words contiguous and
pushes gaps into the next word's start).

Run: .venv/bin/python tools/karaoke/build_lyrics.py
Out: media/karaoke/lyrics_timed.json, media/karaoke/lyrics_timed.txt
"""
import json, re, difflib, os
import numpy as np
import soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
A = os.path.join(ROOT, "analysis", "v3")
OUT = os.path.join(ROOT, "media", "karaoke")

SECTIONS = [  # name, start, end
    ("Intro", 0.00, 30.16),
    ("Verse 1", 30.16, 59.18),
    ("Instrumental", 59.18, 78.05),
    ("Pre-Chorus", 78.05, 96.80),
    ("Chorus 1", 96.80, 115.30),
    ("Post-Chorus", 115.30, 127.16),
    ("Verse 2", 127.16, 145.90),
    ("Interlude", 145.90, 164.40),
    ("Bridge", 164.40, 184.90),
    ("Verse 3", 184.90, 209.00),
    ("Breakdown", 209.00, 213.38),
    ("Chorus 2", 213.38, 232.96),
    ("Post-Chorus 2", 232.96, 243.52),
    ("Outro", 243.52, 263.40),
    ("Coda", 263.40, 278.40),
]

# section, start, end, text, opts
# opts: hold = end time of the last (held) word; delivery; parenthetical
LINES = [
    ("Intro", 8.9, 11.3, "You need facial expressions", {"delivery": "whisper"}),
    ("Intro", 18.5, 19.9, "But not like that", {"delivery": "whisper"}),
    ("Verse 1", 30.2, 33.7, "Three years old, uncle explains atoms", {}),
    ("Verse 1", 34.7, 37.8, "A week later my mother finds me", {}),
    ("Verse 1", 37.8, 41.1, "sat in a snow drift of paper", {}),
    ("Verse 1", 41.4, 43.5, "ripped to shreds", {}),
    ("Verse 1", 43.5, 44.9, "Ever tinier", {}),
    ("Verse 1", 44.9, 47.9, "repeating what uncle said", {}),
    ("Verse 1", 47.9, 50.8, "What on earth are you doing?", {}),
    ("Verse 1", 50.85, 53.2, "The adults howl with laughter", {}),
    ("Verse 1", 53.2, 55.45, "What's so funny?", {}),
    ("Verse 1", 55.5, 58.15, "Nobody tells me after", {"hold": 59.2}),
    ("Pre-Chorus", 78.05, 81.35, "She doesn't talk like other children", {}),
    ("Pre-Chorus", 81.4, 83.8, "(Her English comes from books)", {"parenthetical": True, "backing": True, "hold": 84.28}),
    ("Pre-Chorus", 88.15, 91.1, "Her face doesn't make much expression", {}),
    ("Pre-Chorus", 91.1, 96.0, "For our culture, that's just how it looks", {"hold": 96.65, "backing": True}),
    ("Chorus 1", 96.8, 100.1, "How do you feel? Inside?", {}),
    ("Chorus 1", 102.2, 105.35, "I honestly don't know", {}),
    ("Chorus 1", 105.35, 110.3, "I open my mouth, my voice goes blind", {}),
    ("Chorus 1", 111.15, 115.3, "The words have nowhere to go", {"hold": 119.2}),
    ("Post-Chorus", 121.06, 123.96, "(aaah)", {"backing": True, "fixed": [(121.06, 123.96)]}),
    ("Verse 2", 127.2, 129.2, "Resting oblivious face", {}),
    ("Verse 2", 129.2, 131.56, "Blocking the aisle, in the wrong place", {}),
    ("Verse 2", 131.56, 133.0, "Enthralled by an artichoke", {}),
    ("Verse 2", 133.0, 133.96, "green and fresh", {}),
    ("Verse 2", 133.96, 136.33, "Sacred geometry made flesh", {}),
    ("Verse 2", 136.33, 138.8, "Down in the basement, Dad's code, I watch", {}),
    ("Verse 2", 138.8, 140.38, "I point to the one he missed.", {}),
    ("Verse 2", 140.46, 141.18, "\"Good catch!\"", {"backing": True}),
    ("Verse 2", 141.18, 145.45, "Did she understand or just pattern match?", {"hold": 145.6}),
    ("Interlude", 145.8, 156.0, "(match, match, match\u2026)",
     {"backing": True, "hide": True, "fixed": [(145.8, 149.2), (149.2, 152.6), (152.6, 156.0)]}),
    ("Bridge", 164.4, 167.0, "Do you not see what I see?", {"lead_in": 163.8}),
    ("Bridge", 167.0, 169.4, "Does it matter what makes me me?", {}),
    ("Bridge", 169.4, 173.5, "Beauty on this side, truth by reference", {}),
    ("Bridge", 174.4, 176.67, "Science fiction shelved with truth", {}),
    ("Bridge", 176.67, 179.24, "From inside, I can't tell the difference", {}),
    ("Bridge", 179.5, 184.5, "And I can't give you proof", {}),
    ("Verse 3", 184.9, 188.46, "Housewarming, lemonade from the yard", {"lead_in": 184.5}),
    ("Verse 3", 188.46, 191.1, "Perky American girl", {}),
    ("Verse 3", 191.36, 193.42, "I play the part", {}),
    ("Verse 3", 193.5, 195.97, "He said I absolutely nailed it", {}),
    ("Verse 3", 195.97, 198.46, "Well, fifteen percent above amplitude", {}),
    ("Verse 3", 198.46, 201.17, "I nod, the past hour gets reviewed", {}),
    ("Verse 3", 201.17, 203.8, "Hug durations, pitch contours", {}),
    ("Verse 3", 203.8, 207.4, "Room crossing velocity", {"hold": 208.84}),
    ("Breakdown", 209.5, 213.15, "I think he's right. Honestly.", {"delivery": "hushed"}),
    ("Chorus 2", 214.72, 218.0, "How do you feel? Inside?", {}),
    ("Chorus 2", 220.0, 223.16, "I honestly don't know", {}),
    ("Chorus 2", 223.16, 228.1, "I open my mouth, my voice goes blind", {}),
    ("Chorus 2", 228.95, 232.96, "The words have nowhere to go", {"hold": 237.2}),
    ("Outro", 243.52, 247.4, "Keep the smile on so they don't know", {}),
    ("Outro", 249.05, 252.25, "This is how we fit in", {}),
    ("Outro", 252.95, 257.4, "She turns around, I let it go", {}),
    ("Outro", 259.3, 263.4, "And I can think again", {}),
]

NUM = {"15": "fifteen", "%": "percent", "snowdrift": "snowdrift"}


def norm(w):
    w = w.lower().replace("’", "'")
    w = re.sub(r"[^a-z0-9%']", "", w)
    return NUM.get(w, w)


def load(name):
    d = json.load(open(os.path.join(A, name)))
    out = []
    for s in d["segments"]:
        for w in s["words"]:
            n = norm(w["w"])
            if n:
                out.append({"n": n, "start": w["start"], "end": w["end"], "p": w["p"]})
    return out


def assign(words):
    """Give each whisper word to the line nearest its midpoint."""
    buckets = [[] for _ in LINES]
    for w in words:
        # whisper smears gaps into word starts, so the end is the reliable edge
        mid = w["end"] - min(0.15, (w["end"] - w["start"]) / 2)
        best, bd = None, 1e9
        for i, (_, s, e, _, o) in enumerate(LINES):
            e2 = o.get("hold", e)
            d = 0 if s <= mid <= e2 else min(abs(mid - s), abs(mid - e2))
            if d < bd:
                best, bd = i, d
        if bd < 4.0:
            buckets[best].append(w)
    return buckets


def align(canon, ws):
    """Return per-canonical-word (start,end,p) or None, plus a score."""
    cn = [norm(c) for c in canon]
    wn = [w["n"] for w in ws]
    res = [None] * len(canon)
    score = 0.0
    sm = difflib.SequenceMatcher(a=cn, b=wn, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                w = ws[j1 + k]
                res[i1 + k] = (w["start"], w["end"], w["p"])
                score += w["p"]
        elif tag == "replace":
            s, e = ws[j1]["start"], ws[j2 - 1]["end"]
            p = min(w["p"] for w in ws[j1:j2]) * 0.5
            lens = [max(len(cn[i]), 1) for i in range(i1, i2)]
            tot = sum(lens)
            t = s
            for k, i in enumerate(range(i1, i2)):
                d = (e - s) * lens[k] / tot
                res[i] = (t, t + d, p)
                t += d
            score += 0.25 * (i2 - i1)
    return res, score


def envelope():
    y, sr = sf.read(os.path.join(A, "stems", "htdemucs", "Proof", "vocals.wav"), always_2d=True)
    y = y.mean(axis=1)
    hop = int(sr * 0.02)
    n = len(y) // hop
    fr = y[: n * hop].reshape(n, hop)
    rms = np.sqrt((fr ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms), 0.02


def silences(db, hop, a, b, thr=-45.0, minlen=0.2):
    i0, i1 = max(int(a / hop), 0), min(int(b / hop), len(db))
    out, st = [], None
    for i in range(i0, i1 + 1):
        quiet = i < i1 and db[i] < thr
        if quiet and st is None:
            st = i
        if not quiet and st is not None:
            if (i - st) * hop >= minlen:
                out.append((st * hop, i * hop))
            st = None
    return out


# Hand corrections where whisper and the envelope disagree with song_map / each other.
# key: line text -> {word index: (start, end)}; None keeps that edge.
OVERRIDES = {
    "You need facial expressions": {0: (8.9, 9.05), 1: (9.05, None), 3: (None, 11.02)},
    "repeating what uncle said": {0: (45.56, None)},
    "And I can't give you proof": {5: (None, 184.5)},
    "But not like that": {0: (18.55, 18.80), 1: (18.80, 19.08), 2: (19.12, 19.45), 3: (19.45, 19.92)},
    "A week later my mother finds me": {0: (34.74, 34.92), 1: (34.92, None)},
    "What's so funny?": {0: (54.0, None)},
    "Three years old, uncle explains atoms": {0: (30.16, None)},
    "Resting oblivious face": {0: (127.18, None)},
    "How do you feel? Inside?": {0: (None, None)},
    "I think he's right. Honestly.": {0: (209.52, 209.7), 1: (209.7, None), 4: (212.46, 213.15)},
    "Keep the smile on so they don't know": {0: (243.55, 244.05), 1: (244.1, 244.5), 2: (244.5, 244.95),
                                             3: (244.95, 245.45), 7: (None, 247.38)},
    "This is how we fit in": {0: (249.08, 249.3), 1: (249.3, 249.55), 2: (249.55, 250.2),
                              3: (250.86, 251.15), 4: (251.2, 251.75), 5: (251.75, 252.25)},
    "She turns around, I let it go": {0: (252.92, None), 2: (None, 254.86), 3: (255.48, 255.7), 4: (255.7, 255.95),
                                      5: (255.95, 256.18), 6: (256.18, 257.35)},
    "And I can think again": {0: (259.28, 259.38), 1: (259.38, 259.72), 4: (None, 263.35)},
}
FIRST_WORD_START = {96.8: 96.84}  # chorus 1 pickup starts after the "ks" of "looks"


def main():
    stem, mix = load("transcription_vocals_stem.json"), load("transcription_full_mix.json")
    bs, bm = assign(stem), assign(mix)
    db, hop = envelope()

    def fidx(t):
        return min(max(int(t / hop), 0), len(db) - 1)

    out_lines, report = [], []
    for li, (sec, ls, le, text, o) in enumerate(LINES):
        canon = text.split()
        rs, ss = align(canon, bs[li])
        rm, sm_ = align(canon, bm[li])
        # per word: prefer the pass that matched; if both, take the higher p
        timing, src = [], []
        for a, b in zip(rs, rm):
            if a and b:
                timing.append(a if a[2] >= b[2] else b); src.append("s" if a[2] >= b[2] else "m")
            elif a or b:
                timing.append(a or b); src.append("s" if a else "m")
            else:
                timing.append(None); src.append("-")
        lo = o.get("lead_in", ls) - 0.3
        hi = o.get("hold", le) + 0.25
        # clamp to line window
        t2 = []
        for t in timing:
            if t is None:
                t2.append(None); continue
            s, e, p = t
            s, e = max(s, lo), min(e, hi)
            if e - s < 0.06:
                t2.append(None); continue
            t2.append([s, e, p])
        # interpolate missing words
        n = len(canon)
        for i in range(n):
            if t2[i] is not None:
                continue
            j = i
            while j < n and t2[j] is None:
                j += 1
            left = t2[i - 1][1] if i > 0 else ls
            right = t2[j][0] if j < n else max(le, left + 0.3 * (j - i))
            if right - left < 0.15 * (j - i):  # no room: steal from neighbours
                if i > 0:
                    t2[i - 1][1] = max(t2[i - 1][0] + 0.1, t2[i - 1][1] - 0.15 * (j - i))
                    left = t2[i - 1][1]
                right = max(right, left + 0.15 * (j - i))
                if j < n:
                    t2[j][0] = max(t2[j][0], right)
            lens = [len(norm(canon[k])) + 1 for k in range(i, j)]
            tot, t = sum(lens), left
            for k in range(i, j):
                d = (right - left) * lens[k - i] / tot
                t2[k] = [t, t + d, 0.0]
                t += d
        # silence snapping: whisper words are contiguous, so a word that starts (or ends)
        # inside a vocal-stem silence is moved to the silence's edge
        sil = silences(db, hop, t2[0][0] - 0.5, t2[-1][1] + 0.5)
        for i in range(n):
            s0, e0 = t2[i][0], t2[i][1]
            for g0, g1 in sil:
                if g0 <= s0 < g1 and e0 - g1 >= 0.08:
                    s0 = g1
                if g0 < e0 <= g1 and g0 - s0 >= 0.08 and not (i == n - 1 and "hold" in o):
                    e0 = g0
                if s0 < g0 and g1 < e0:  # word spans a whole silence
                    if i == 0 and e0 - g1 >= 0.1:
                        s0 = g1
                    elif i == n - 1 and "hold" not in o and g0 - s0 >= 0.1:
                        e0 = g0
            t2[i][0], t2[i][1] = s0, e0
        # duration caps for unheld words (whisper smears)
        for i, (s, e, p) in enumerate(t2):
            cap = 2.2 if i > 0 else 1.2
            if i == n - 1 and "hold" in o:
                cap = 99
            if e - s > cap:
                if i == 0:
                    t2[i][0] = e - cap
                else:
                    t2[i][1] = s + cap
        for k, (ns, ne) in OVERRIDES.get(text, {}).items():
            if ns is not None: t2[k][0] = ns
            if ne is not None: t2[k][1] = ne
        if ls in FIRST_WORD_START:
            t2[0][0] = FIRST_WORD_START[ls]
        if "fixed" in o:
            t2 = [[a_, b_, 1.0] for a_, b_ in o["fixed"]]
        # held last word rings to the measured end of the note
        if "hold" in o and t2[-1][1] < o["hold"]:
            t2[-1][1] = o["hold"]
        # monotonic, non-overlapping, rounded
        words, prev = [], (out_lines[-1]["end"] if out_lines else 0.0)
        for i, (s, e, p) in enumerate(t2):
            s = max(round(s, 2), prev)
            e = max(round(e, 2), round(s + 0.05, 2))
            words.append({"w": canon[i], "start": s, "end": e})
            prev = e
        line = {"section": sec, "start": words[0]["start"], "end": words[-1]["end"],
                "backing": bool(o.get("backing")), **({"hide": True} if o.get("hide") else {}), "words": words}
        if o.get("parenthetical"):
            line["parenthetical"] = True
        if o.get("delivery"):
            line["delivery"] = o["delivery"]
        out_lines.append(line)
        lowp = [canon[i] for i, t in enumerate(t2) if t[2] < 0.3]
        report.append((li, text, "".join(src), lowp, words[0]["start"] - ls, words[-1]["end"] - o.get("hold", le)))

    secs = []
    for name, s, e in SECTIONS:
        ls_ = [l for l in out_lines if l["section"] == name]
        if ls_:
            s = min(s, ls_[0]["start"])
        secs.append({"name": name, "start": round(s, 2), "end": round(e, 2)})
    for i in range(1, len(secs)):
        secs[i - 1]["end"] = secs[i]["start"]

    json.dump({"source": "inputs/Proof.wav (v3, 278.40 s)", "sections": secs, "lines": out_lines},
              open(os.path.join(OUT, "lyrics_timed.json"), "w"), indent=1)

    def mmss(t):
        return f"{int(t // 60):02d}:{t % 60:05.2f}"
    rows, si = [], 0
    events = [(s["start"], 0, f"[{s['name']}]") for s in secs] + \
             [(l["start"], 1, ("  (backing) " if l["backing"] else "  ") + " ".join(w["w"] for w in l["words"]))
              for l in out_lines]
    for t, _, txt in sorted(events):
        rows.append(f"{mmss(t)}  {txt}")
    open(os.path.join(OUT, "lyrics_timed.txt"), "w").write("\n".join(rows) + "\n")

    for li, text, src, lowp, ds, de in report:
        print(f"{li:2d} {src:12s} dstart {ds:+.2f} dend {de:+.2f}  {text}  low:{lowp}")


if __name__ == "__main__":
    main()
