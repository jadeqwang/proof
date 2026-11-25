#!/usr/bin/env python3
"""Build a karaoke .ass subtitle file from media/karaoke/lyrics_timed.json.

Layout (1920x1080):
  previous line  - small, faded, above
  current line   - large, words fill as they are sung (\\kf)
  next 2 lines   - medium, dimmer, below  (so the singer can read ahead)
During gaps >= GAP_LONG seconds: section label + countdown dots before the next entry.
"""
import json, sys

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
lines = [l for l in d["lines"] if l["words"] and not l.get("hide")]  # hidden = echoes left in the track, not shown
lines.sort(key=lambda l: l["start"])
sections = d.get("sections", [])

W, H = 1920, 1080
MAXW = 1720
LEAD = 0.35          # line becomes "current" this long before its first word
GAP_LONG = 6.0       # gaps longer than this get a label + countdown
AHEAD = 2            # lines of look-ahead

def t(s):
    s = max(0.0, s)
    h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60
    return f"{h}:{m:02d}:{sec:05.2f}"

def fit(text, fs):
    # Cantarell average advance ~0.5 em; shrink long lines to fit
    est = len(text) * fs * 0.5
    return fs if est <= MAXW else max(int(fs * MAXW / est), 30)

def esc(s):
    return s.replace("{", "(").replace("}", ")").replace("\\", "")

def ital(l):
    # backing lines (left in the track, not sung live) are italic and cooler in every slot
    return "\\i1\\c&HE0C090&" if l.get("backing") else ""

def text_of(l):
    return " ".join(w["w"] for w in l["words"])

# slot y-centres
Y_PREV, Y_CUR, Y_N1, Y_N2 = 330, 470, 600, 700
FS_PREV, FS_CUR, FS_N = 44, 76, 54

hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cur,Cantarell,{FS_CUR},&H0055D8FF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,5,0,0,0,1
Style: Next,Cantarell,{FS_N},&H40E6E6E6,&H40E6E6E6,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,5,0,0,0,1
Style: Prev,Cantarell,{FS_PREV},&HA0C8C8C8,&HA0C8C8C8,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,5,0,0,0,1
Style: Label,Cantarell,40,&H0055D8FF,&H0055D8FF,&H00000000,&H80000000,0,1,0,0,100,100,4,0,1,1,1,5,0,0,0,1
Style: Title,Cantarell,110,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,6,0,1,3,2,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
def add(st, a, b, style, x, y, txt, layer=0, extra=""):
    if b - a < 0.02:
        return
    ev.append(f"Dialogue: {layer},{t(a)},{t(b)},{style},,0,0,0,,{{\\an5\\pos({x},{y}){extra}}}{txt}")

def kline(l, fs):
    """\\kf karaoke text for a line; first tag covers the lead-in."""
    parts = []
    cur = l["start"] - LEAD
    parts.append(f"{{\\k{int(round(LEAD*100))}}}")
    for i, w in enumerate(l["words"]):
        gap = w["start"] - cur
        if gap > 0.01 and i > 0:
            parts.append(f"{{\\k{int(round(gap*100))}}}")
        dur = max(w["end"] - w["start"], 0.05)
        parts.append(f"{{\\kf{int(round(dur*100))}}}{esc(w['w'])}{' ' if i < len(l['words'])-1 else ''}")
        cur = w["end"]
    return f"{{\\fs{fs}}}" + "".join(parts)

def section_at(time):
    name = ""
    for s in sections:
        if s["start"] <= time + 0.01:
            name = s["name"]
    return name

song_end = d.get("duration", max(l["end"] for l in lines) + 20)
first = lines[0]["start"]

# Title card until the first line approaches
title_end = max(first - 5.0, 1.0)
add(None, 0, title_end, "Title", W//2, H//2 - 40, "{\\fad(800,600)}Proof")
add(None, 0, title_end, "Label", W//2, H//2 + 70, "{\\fad(800,600)}karaoke")

n = len(lines)
for i, l in enumerate(lines):
    on = l["start"] - LEAD
    if i == 0:
        on = min(on, title_end)
    nxt_on = lines[i+1]["start"] - LEAD if i + 1 < n else song_end
    gap_after = (lines[i+1]["start"] - l["end"]) if i + 1 < n else 999
    # how long this line stays "current": through its last word, then hold briefly
    if gap_after >= GAP_LONG:
        cur_off = l["end"] + 1.0
    else:
        cur_off = nxt_on
    # current line (karaoke)
    style = "Cur"
    extra = ital(l)
    add(None, on, cur_off, style, W//2, Y_CUR, kline(l, fit(text_of(l), FS_CUR)), layer=2, extra=extra)
    # previous line, faded, while this one is current
    if i > 0 and on - lines[i-1]["end"] < GAP_LONG:
        p = lines[i-1]
        add(None, on, cur_off, "Prev", W//2, Y_PREV, f"{{{ital(p)}\\fs{fit(text_of(p), FS_PREV)}}}" + esc(text_of(p)))
    # look-ahead lines
    for k, y in zip(range(1, AHEAD+1), (Y_N1, Y_N2)):
        if i + k < n:
            q = lines[i+k]
            # don't show look-ahead across a long instrumental while singing? yes: singer wants to read ahead
            add(None, on, cur_off, "Next", W//2, y, f"{{{ital(q)}\\fs{fit(text_of(q), FS_N)}}}" + esc(text_of(q)))
    # long gap after this line: label + upcoming lines + countdown
    if gap_after >= GAP_LONG and i + 1 < n:
        a, b = cur_off, nxt_on
        sec = section_at(l["end"] + 0.5)
        nxt_sec = lines[i+1].get("section", "")
        label = sec if sec and sec != l.get("section") else "instrumental"
        add(None, a, b, "Label", W//2, Y_PREV, "{\\fad(300,200)}" + esc(label.upper()))
        for k, y in zip(range(1, AHEAD+2), (Y_CUR, Y_N1, Y_N2)):
            if i + k < n:
                q = lines[i+k]
                fs = FS_N if k == 1 else FS_N - 6
                add(None, a, b, "Next", W//2, y, f"{{\\fad(400,0){ital(q)}\\fs{fit(text_of(q), fs)}}}" + esc(text_of(q)))
        # countdown: 4 dots disappearing over the last 4 beats-ish (3.2s)
        cd = 3.2
        cstart = max(a, b - cd)
        for j in range(4):
            dot_off = cstart + (j + 1) * (b - cstart) / 4
            x = W//2 - 90 + j * 60
            add(None, cstart, dot_off, "Label", x, Y_CUR - 70, "{\\fs50}●", layer=3)

# outro: last line fades out
add(None, lines[-1]["end"] + 1.0, song_end, "Label", W//2, H//2, "{\\fad(1000,1500)}♪")

open(out, "w").write(hdr + "\n".join(ev) + "\n")
print(f"{n} lines, {len(ev)} events -> {out}")
