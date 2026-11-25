# Builds time_map.json (v3 -> -2sm) from measured anchors. Run from analysis/m2sm: ../../.venv/bin/python -I build_map.py
# Anchor sources: "stem" = an on/off event measured in both versions' demucs stems (events.py, fine.py; v3 side from
# analysis/v3/song_map.md); "voc" = vocal-stem envelope cross-correlation per lyric line (line_lag.py -> line_lag.log);
# "dtw" = chroma/onset DTW path (dtw.py). -2sm times are FULL-MIX times of inputs/Proof (-2sm).wav.
import json
A = [  # v3, -2sm, label, source
    (0.00, 0.00, "file start", "stem"),
    (5.10, 4.85, "first hand tap", "stem"),
    (8.90, 8.67, "whisper 1 'You need facial expressions'", "voc"),
    (18.50, 18.21, "whisper 2 'But not like that'", "voc"),
    (19.30, 19.00, "groove: bass + beat drop in", "stem"),
    (30.20, 29.79, "verse 1 'Three years old'", "voc"),
    (34.70, 34.26, "'A week later'", "voc"),
    (37.80, 37.30, "'sat in a snow drift'", "voc"),
    (41.40, 40.86, "'ripped to shreds'", "voc"),
    (43.50, 42.97, "'Ever tinier'", "voc"),
    (47.90, 47.35, "'What on earth are you doing?'", "voc"),
    (50.85, 50.25, "'The adults howl with laughter'", "voc"),
    (53.20, 52.60, "'What's so funny?'", "voc"),
    (55.50, 54.88, "'Nobody tells me after'", "voc"),
    (59.20, 58.55, "instrumental break: bass sustains", "stem"),
    (75.15, 74.40, "bass leaves the break", "stem"),
    (78.05, 77.24, "pre-chorus 'She doesn't talk like other children'", "voc"),
    (81.40, 80.59, "'(Her English comes from books)'", "voc"),
    (88.15, 87.31, "'Her face doesn't make much expression'", "voc"),
    (91.10, 90.24, "'For our culture, that's just how it looks'", "voc"),
    (93.50, 92.68, "band out (drums + bass drop)", "stem"),
    (96.80, 95.94, "chorus 1 'How do you feel?' (exposed pickup)", "voc"),
    (98.22, 97.40, "chorus 1 full-band hit", "stem"),
    (102.20, 101.34, "'I honestly don't know'", "voc"),
    (105.35, 104.49, "'I open my mouth, my voice goes blind'", "voc"),
    (111.15, 110.29, "'The words have nowhere to go'", "voc"),
    (121.06, 120.26, "tail 1 vocalise", "voc"),
    (127.20, 126.38, "verse 2 'Resting oblivious face'", "voc"),
    (129.20, 128.36, "'Blocking the aisle'", "voc"),
    (131.56, 130.73, "'Enthralled by an artichoke'", "voc"),
    (133.96, 133.15, "'Sacred geometry made flesh'", "voc"),
    (136.33, 135.54, "'(Down in the) Basement, Dad's code, I watch'", "voc"),
    (138.80, 138.01, "'I point to (the) one he missed'", "voc"),
    (140.50, 139.75, "band stop on 'Good catch!'", "stem"),
    (141.70, 140.90, "band back after 'Good catch!'", "stem"),
    (141.18, 140.39, "'Did she understand or just pattern match?'", "voc"),
    (145.90, 145.15, "interlude: bass pick-up note (thinned interlude begins)", "stem"),
    (154.10, 153.40, "last v3 moment kept: end of the 4th thinned bar's first half", "dtw"),
    # v3 154.10-163.80 has no counterpart (see only_in_v3)
    (163.80, 153.48, "bridge vocal lead-in", "voc"),
    (164.40, 154.06, "bridge 'Do you not see what I see?'", "voc"),
    (167.00, 156.69, "'Does it matter what makes me me?'", "voc"),
    (169.40, 159.11, "'Beauty on this side, truth by reference'", "voc"),
    (174.40, 164.14, "'Science fiction shelved with truth'", "voc"),
    (176.67, 166.43, "'From inside, I can't tell the difference'", "voc"),
    (179.50, 169.30, "'And I can't give you proof'", "voc"),
    (182.72, 172.50, "hard stop", "stem"),
    (184.90, 174.70, "verse 3 full-band hit 'Housewarming'", "stem"),
    (188.46, 178.31, "'Perky American girl'", "voc"),
    (193.50, 183.37, "'He said I absolutely nailed it'", "voc"),
    (195.97, 185.87, "'Well, fifteen percent above amplitude'", "voc"),
    (198.46, 188.36, "'I nod, (the) past hour (gets) reviewed'", "voc"),
    (201.17, 191.07, "'Hug durations, pitch contours'", "voc"),
    (203.80, 193.74, "'Room crossing velocity'", "voc"),
    (209.10, 199.05, "full stop", "stem"),
    (209.50, 199.45, "'I think he's right. Honestly.'", "voc"),
    (213.40, 203.35, "chorus 2: drums alone", "stem"),
    (214.72, 204.69, "chorus 2 'How do you feel? Inside?'", "voc"),
    (216.10, 206.10, "chorus 2 bass + full band", "stem"),
    (220.00, 210.02, "'I honestly don't know'", "voc"),
    (223.16, 213.20, "'I open my mouth, my voice goes blind'", "voc"),
    (228.95, 219.01, "'The words have nowhere to go'", "voc"),
    (237.20, 227.20, "held 'go' ends", "stem"),
    (243.50, 233.95, "outro line 1 'Keep the smile on' (over the band)", "stem"),
    (244.80, 235.00, "cliff: bass + drums gone", "stem"),
    (249.05, 239.10, "'This is how we fit in'", "stem"),
    (252.90, 243.55, "'She turns around'", "stem"),
    (255.45, 245.45, "'I let it go'", "stem"),
    (259.30, 248.60, "'And I can think again'", "stem"),
    (263.26, 252.85, "coda: pad swell", "stem"),
    (264.55, 254.30, "coda: one big low hit (-2sm: also bar 1's downbeat)", "stem"),
    (265.94, 254.40, "v3 coda groove start = v3 bar 1 (-2sm has no sparse lead-in: groove follows the hit at once)", "stem"),
    (268.36, 256.81, "coda bar 2", "dtw"),
    (270.77, 259.23, "coda bar 3", "dtw"),
    (273.19, 261.67, "coda bar 4", "dtw"),
    (275.09, 264.06, "last drum hit", "stem"),
    (278.40, 268.40, "file end", "stem"),
]
A.sort()
for (a, b, l, s), (c, d, m, t) in zip(A, A[1:]):
    assert d >= b, (l, m)
    sl = (d - b) / (c - a) if c > a else 1
    if not (0.85 < sl < 1.15) and not (a == 154.10): print(f"slope {sl:.3f} between {l!r} ({a}) and {m!r} ({c})")
LY = json.load(open("../../media/karaoke_v2/lyrics_timed.json"))
def m2(t):
    for (a, b, *_), (c, d, *_) in zip(A, A[1:]):
        if a <= t <= c: return b + (t - a) * (d - b) / (c - a) if c > a else b
    return None
out = {
    "about": "Piecewise-linear map from v3 times (inputs/older version/Proof.wav = the old inputs/Proof.wav; analysis/v3/song_map.md; the times in the plan before 2026-11-25 (late) and in most layout/sets/*/shots.js) to -2sm times (inputs/Proof (-2sm).wav, FULL-MIX time, the master from 2026-11-25). Interpolate linearly between consecutive anchors. Built by build_map.py; use remap.py.",
    "from": "v3: inputs/older version/Proof.wav (278.40 s, C minor)",
    "to": "-2sm: inputs/Proof (-2sm).wav (268.40 s, Bb minor; full-mix time). The no-lead track (inputs/Proof (-2sm  no lead vocals).wav) is a separate render that drifts -0.30..+0.37 s against it: media/karaoke_v2/lyrics_timed.json gives both (start = no-lead time, start_full = full-mix time). Always use full-mix time for the film.",
    "accuracy_s": "+/-0.05 at stem events, +/-0.1 at lyric lines in the body, +/-0.3 inside the a-cappella outro and the coda groove entry",
    "anchors": [{"v3": a, "m2sm": b, "label": l, "source": s} for a, b, l, s in A],
    "only_in_v3": [{"v3": [154.10, 163.80], "m2sm_collapses_to": 153.45,
        "what": "The second half of the arpeggio interlude: v3's 'interlude b, full' (bass returns 156.14, arpeggio at its loudest) and the end of the thinned half. In -2sm the interlude is four thinned bars only (bass out, sparse drums creeping back), and the bridge's vocal lead-in arrives in its last bar. Anything placed in v3 2:34.1-2:43.8 has no music under it in -2sm and must be re-placed by hand.",
        "flag": "NO COUNTERPART: v3 2:34.1-2:43.8 (the full half of the interlude) is not in -2sm",
        "plan_rows": ["2:36-2:45 Interlude, full (v3 2:36.1-2:44.4)"], "note": "Musically -2sm drops v3 interlude b (4 bars, v3 156.14-165.9, bass back with the arpeggio forward) and sings the bridge pickup one bar earlier, over the last bar of the thinned interlude (-2sm 153.5-155.45). The map keeps the vocal: v3 154.10 -> 153.40 and v3 163.80 -> 153.48, so the last ~2 s of v3 interlude a fall inside the dropped span too."},
        {"v3": [264.55, 265.94], "m2sm_collapses_to": 254.35, "flag": "COMPRESSED: v3's sparse coda lead-in (4:24.5-4:25.9) is ~0.1 s in -2sm",
         "what": "v3's coda opens with one big hit, three sparse hits and the groove 1.4 s later; in -2sm the groove follows the hit at once, so the coda is 4 bars from the hit (254.30) to the last hit (264.06) against v3's ~4.5."}],
    "only_in_m2sm": [],
    "content_changes": [
        {"m2sm": [228.80, 232.60], "v3": [238.70, 242.40], "what": "A wordless vocalise returns in tail 2 (v3 had the band alone here; v2 had a vocalise at the same place). Pitch rises G#4 -> F#5/G5 like tail 1's. The band-only runway is now ~1.5 s each side of it."},
        {"m2sm": [264.06, 268.40], "v3": [275.09, 278.40], "what": "Ending: after the last drum hit (264.06, ring to ~264.7) a loud low bass note (-19 dB on the bass stem) plus pad holds to ~266.3 and fades to the file end (v3: bass gone 2.2 s before the stop, a faint C1 note)."},
        {"m2sm": [254.30, 256.00], "v3": [264.55, 265.94], "what": "Coda entry: the bass enters WITH the big hit (v3: fades in over 3 s) and a light sixteenth-note run follows at once (v3: three sparse hits)."},
        {"m2sm": [0, 268.4], "v3": [0, 278.4], "what": "Key: Bb minor (2 semitones below v3's C minor). Tempo the same 99.4 BPM within the method; -2sm runs ~0.9% ahead over the first 96 s (offset grows 0 -> -0.86 s), holds to 145 s, and loses ~0.4 s again over 164-229 s."},
        {"lyrics": True, "what": "Words sung differently (media/karaoke_v2/lyrics_timed.json text): 'Basement, Dad's code, I watch' (v3 'Down in the basement, ...'); 'I point to one he missed' (v3 'the one'); 'I nod, past hour reviewed' (v3 'the past hour gets reviewed')."},
    ],
    "lyric_lines": [],
    "downbeats_m2sm": json.load(open("downbeats.json")),
    "downbeats_note": "Beat-tracker beats (features_mix.json) phase-locked to a measured hit in each section, every 4th beat [G]. Bar ~2.42 s.",
}
# Each lyric anchor also gets the -2sm forced-alignment onset of its first word (media/karaoke_v2/lyrics_timed.json).
# v3's line starts come from whisper and often sit 0.3-1.0 s before the sung onset (whisper stretches a word back over
# the breath before it); the audio map keeps that offset, `remap.py --snap` replaces it with the -2sm word onset.
import re
W = [(w["s_full"], re.sub(r"[^a-z']", "", w["w"].lower().replace("’", "'"))) for l in LY["lines"] for w in l["words"]]
for a in out["anchors"]:
    if a["source"] != "voc": continue
    q = re.search(r"'(.+)'", a["label"].replace("’", "'"))
    if not q: continue
    first = re.sub(r"\(.*?\)\s*", "", q.group(1)).split()
    if not first: first = q.group(1).strip("()").split()
    norm = lambda w: re.sub(r"[^a-z']", "", w.lower())
    w0 = norm(first[0]); w1 = norm(first[1]) if len(first) > 1 else None; x = m2(a["v3"])
    c = [W[i][0] for i in range(len(W)) if W[i][1] == w0 and abs(W[i][0] - x) < 2.5 and (w1 is None or (i + 1 < len(W) and W[i + 1][1] == w1))]
    if c:
        t = min(c, key=lambda t: abs(t - x)); a["m2sm_sung_onset"] = round(t, 2); a["first_word"] = w0
for l in LY["lines"]:
    out["lyric_lines"].append({"text": l["text"], "m2sm_start": l["start_full"], "m2sm_end": l["end_full"], "backing": l["backing"], "whisper": l["whisper"]})
json.dump(out, open("time_map.json", "w"), indent=1, ensure_ascii=False)
print("anchors", len(A))
