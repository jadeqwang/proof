#!/usr/bin/env python3
"""Word-timed lyrics for the -2sm Suno render.

Pipeline (scratch files in work/karaoke_v2/):
  1. lead stem: audio-separator (mel_band_roformer_karaoke_aufr33_viperx) on inputs/Proof (-2sm).wav
  2. work/karaoke_v2/fa.py: torchaudio MMS_FA forced alignment of tools/karaoke/lyrics_v2_lines.py
     on the lead stem  -> fa_raw.json (full-mix time)
  3. this script: hand overrides (from pitch/energy inspection where the CTC aligner failed on
     melismas), silence-snapping of word onsets, held-note extension of line ends, then maps every
     time through work/karaoke_v2/warp.json onto the timeline of Suno's no-lead track
     ("Proof (-2sm  no lead vocals).wav"), which is a separate render that drifts against the full
     mix by -0.30 s (~90 s) .. +0.37 s (outro).

Run: .venv/bin/python tools/karaoke/build_lyrics_v2.py
Out: media/karaoke_v2/lyrics_timed.json / .txt
     word "s"/"e" are in INSTRUMENTAL time (what the karaoke video plays);
     "s_full"/"e_full" are in full-mix time (for the guide-vocal render, which plays the full mix).
"""
import json, os
import numpy as np
import soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
W = os.path.join(ROOT, "work", "karaoke_v2")
OUT = os.path.join(ROOT, "media", "karaoke_v2")
LEAD = os.path.join(W, "sep", "full_(Vocals)_mel_band_roformer_karaoke_aufr33_viperx_sdr_10.wav")

# Sections in FULL-MIX time (from lead-vocal entries, beat grid 99.4 BPM, bar 2.415 s).
SECTIONS = [
    ("Intro", 0.0), ("Verse 1", 28.8), ("Instrumental", 58.6), ("Pre-Chorus", 77.4),
    ("Chorus 1", 95.6), ("Post-Chorus", 115.0), ("Verse 2", 125.9), ("Interlude", 145.2),
    ("Bridge", 154.4), ("Verse 3", 174.6), ("Chorus 2", 204.4), ("Post-Chorus 2", 223.6),
    ("Outro", 233.6), ("Coda", 253.0),
]

# (section, line text) -> word starts in full-mix time (None = keep aligner value), optional end of
# last word. Read off lead-stem pitch/energy (work/karaoke_v2/view.py); the aligner had these
# 0.5-2 s late or placed words in silence.
OVERRIDES = {
    ("Chorus 1", "How do you feel? Inside?"): ([96.0, 96.35, 96.55, 96.8, 98.0], 99.0),
    ("Chorus 1", "I honestly don't know"): ([100.7, 101.95, 103.0, 103.75], 105.2),
    ("Chorus 2", "How do you feel? Inside?"): ([204.75, 205.05, 205.3, 205.5, 207.45], 209.0),
    ("Chorus 2", "I honestly don't know"): ([209.45, 210.3, 211.7, 212.4], 213.6),
    ("Verse 3", "I think he's right. Honestly."): ([199.45, 199.75, 200.1, 200.75, 202.45], 203.2),
}
# lines whose timing is a judgement call (reported, and kept in the json as "unsure")
UNSURE = {
    ("Chorus 1", "How do you feel? Inside?"): "'Inside?' is faint in the lead stem (sung softly or by the layer)",
    ("Verse 3", "I think he's right. Honestly."): "'Honestly' placed after the 0.8 s gap; whisper put it before",
    ("Verse 3", "Room crossing velocity"): "'velocity' onset inside a legato phrase",
    ("Chorus 1", "The words have nowhere to go"): "'to'/'go' split inside the melisma",
    ("Chorus 2", "The words have nowhere to go"): "'to'/'go' split inside the melisma",
    ("Intro", "But not like that"): "whispered; barely in the lead stem",
}

# ---- lead envelope (10 ms) -------------------------------------------------------------------
lead, sr = sf.read(LEAD)
lead = lead.mean(1)
hop = sr // 100
n = len(lead) // hop
env = 20 * np.log10(np.sqrt((lead[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
env = np.convolve(env, np.ones(3) / 3, mode="same")
SIL = -45.0


def db(t):
    i = int(t * 100)
    return env[min(max(i, 0), n - 1)]


def snap_start(s, lo):
    """Pull an onset back to where the lead leaves silence, if it does so within [lo, s]."""
    i_lo, i_s = int(max(lo, s - 0.35) * 100), int(s * 100)
    if i_s <= i_lo:
        return s
    sil = np.where(env[i_lo:i_s] < SIL)[0]
    if len(sil) == 0:
        return s
    return round((i_lo + sil[-1] + 1) / 100, 3)


def hold_end(e, cap):
    """Extend a line's final word through its held note (lead above silence)."""
    i, j = int(e * 100), int(min(cap, e + 3.0) * 100)
    while i < j and env[i] > SIL:
        i += 1
    return round(max(e, i / 100), 3)


# ---- time warp full -> instrumental ------------------------------------------------------------
wp = np.array(json.load(open(os.path.join(W, "warp.json"))))


def to_inst(t):
    return round(float(np.interp(t, wp[:, 0], wp[:, 1])), 3)


# ---- build ------------------------------------------------------------------------------------
raw = json.load(open(os.path.join(W, "fa_raw.json")))
lines = []
for L in raw:
    key = (L["section"], L["text"])
    words = [dict(w) for w in L["words"]]
    ov = OVERRIDES.get(key)
    if ov:
        starts, last_end = ov
        for w, s in zip(words, starts):
            if s is not None:
                w["s"] = s
        words[-1]["e"] = last_end
    else:
        prev_end = lines[-1]["words"][-1]["e"] if lines else 0.0
        for k, w in enumerate(words):
            lo = prev_end if k == 0 else words[k - 1]["s"] + 0.08
            w["s"] = snap_start(w["s"], lo)
    lines.append({"section": L["section"], "text": L["text"], "opts": L["opts"], "words": words,
                  "fixed": bool(ov)})

for i, L in enumerate(lines):
    ws = L["words"]
    for k in range(len(ws) - 1):  # contiguous highlight inside a line
        ws[k]["e"] = ws[k + 1]["s"]
    nxt = lines[i + 1]["words"][0]["s"] - 0.05 if i + 1 < len(lines) else ws[-1]["e"] + 3
    if not L["fixed"]:
        ws[-1]["e"] = hold_end(ws[-1]["e"], nxt)
    ws[-1]["e"] = round(min(ws[-1]["e"], nxt), 3)

out_lines = []
for L in lines:
    key = (L["section"], L["text"])
    words = [{"w": w["w"], "s": to_inst(w["s"]), "e": to_inst(w["e"]),
              "s_full": round(w["s"], 3), "e_full": round(w["e"], 3)} for w in L["words"]]
    d = {"section": L["section"], "text": L["text"], "start": words[0]["s"], "end": words[-1]["e"],
         "start_full": words[0]["s_full"], "end_full": words[-1]["e_full"],
         "backing": bool(L["opts"].get("backing")), "whisper": bool(L["opts"].get("whisper")),
         "words": words}
    if key in UNSURE:
        d["unsure"] = UNSURE[key]
    out_lines.append(d)

# ---- regroup sung lines into the song's original (rhyme) line breaks ----------------------------
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lyrics_v2_lines import DISPLAY

sung_lines = out_lines
out_lines = []
i = 0
while i < len(sung_lines):
    L = sung_lines[i]
    spec = DISPLAY.get(L["section"])
    if not spec:
        out_lines.append(L); i += 1; continue
    # all sung lines of this (contiguous) section
    j = i
    while j < len(sung_lines) and sung_lines[j]["section"] == L["section"]:
        j += 1
    src = sung_lines[i:j]
    flat = [(dict(w, i=g["backing"]), g) for g in src for w in g["words"]]
    k = 0
    for disp in spec:
        toks = disp.split()
        chunk = flat[k:k + len(toks)]
        assert len(chunk) == len(toks), ("ran out of sung words", disp)
        k += len(toks)
        words = [w for w, _ in chunk]
        group = []
        for _, g in chunk:
            if g not in group:
                group.append(g)
        for w, t in zip(words, toks):
            w["w"] = t
        any_it = any(w["i"] for w in words); all_it = all(w["i"] for w in words)
        for w in words:
            if all_it or not any_it:
                del w["i"]
        d = {"section": L["section"], "text": disp, "start": words[0]["s"], "end": words[-1]["e"],
             "start_full": words[0]["s_full"], "end_full": words[-1]["e_full"],
             "backing": all_it, "whisper": all(g["whisper"] for g in group),
             "words": words, "sung_lines": [g["text"] for g in group]}
        uns = [g["unsure"] for g in group if "unsure" in g]
        if uns:
            d["unsure"] = "; ".join(uns)
        out_lines.append(d)
    assert k == len(flat), ("unused sung words", [w["w"] for w, _ in flat[k:]])
    i = j

secs = [{"name": s, "start_full": t, "start": to_inst(t)} for s, t in SECTIONS]
dur_inst = sf.info(os.path.join(ROOT, "inputs", "Proof (-2sm  no lead vocals).wav")).duration
dur_full = sf.info(os.path.join(ROOT, "inputs", "Proof (-2sm).wav")).duration
os.makedirs(OUT, exist_ok=True)
json.dump({
    "audio_inst": "inputs/Proof (-2sm  no lead vocals).wav",
    "audio_full": "inputs/Proof (-2sm).wav",
    "timebase": "s/e/start/end = instrumental track time; *_full = full-mix time",
    "duration": round(dur_inst, 3), "duration_full": round(dur_full, 3),
    "sections": secs, "lines": out_lines,
}, open(os.path.join(OUT, "lyrics_timed.json"), "w"), indent=1)


def mmss(t):
    return "%02d:%05.2f" % (t // 60, t % 60)


with open(os.path.join(OUT, "lyrics_timed.txt"), "w") as f:
    f.write("# Proof (-2sm) - times on the no-lead (instrumental) track; [full-mix time in brackets]\n")
    si = 0
    for L in out_lines:
        while si < len(secs) and secs[si]["start"] <= L["start"] + 0.01:
            f.write("%s  [%s]\n" % (mmss(secs[si]["start"]), secs[si]["name"]))
            si += 1
        tag = "(backing) " if L["backing"] else ""
        f.write("%s    %s%s   [%s]%s\n" % (mmss(L["start"]), tag, L["text"], mmss(L["start_full"]),
                                         "   ?? " + L["unsure"] if "unsure" in L else ""))
    for s in secs[si:]:
        f.write("%s  [%s]\n" % (mmss(s["start"]), s["name"]))
print("wrote", OUT)
