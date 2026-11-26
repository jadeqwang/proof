#!/usr/bin/env python3
"""Keyframes round 2 review page: media/keyframes/r2/index.html (open it from disk).

    python3 tools/kf/r2_page.py

One card per shot in film order (-2sm master times), grouped by section of the song, with the lyric sung over it,
the picked keyframe large, its guide render (media/layout/<set>/<SHOT>_lit.png, else _line) small beside it, the other
takes as small thumbs, and options Good / Redo / Wrong staging plus a note. Plate stills (code-rendered footage, not
painted) sit where the plan places them. "Copy my answers" produces a block that begins
`Keyframes r2 (from media/keyframes/r2/index.html):` with one line per touched card. Answers persist in localStorage.

Reads media/keyframes/r2/<set>/picks.json ({"SHOT": {"pick", "takes", "time", "status", "note"}}) and the lyric
timings in media/karaoke_v2/lyrics_timed.json. Thumbnails go to media/keyframes/r2/_thumbs/.
"""
import html
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
R2 = os.path.join(ROOT, "media", "keyframes", "r2")
TH = os.path.join(R2, "_thumbs")

# (start seconds on -2sm, set or 'plate', id, time label). Shots: times from layout/sets/<set>/shots.js.
SECTIONS = [
    (0.0, "Pad and intro", "0:00-0:19.0"), (19.0, "Groove in", "0:19.0-0:29.7"),
    (29.7, "Verse 1: Shanghai, 1986", "0:29.7-0:58.6"), (58.6, "Piano break", "0:58.6-1:17.2"),
    (77.2, "Pre-chorus and band out: the school office", "1:17.2-1:37.4"),
    (97.4, "Chorus 1: inside the wall", "1:37.4-1:54.5"), (114.5, "Tail 1: the Voyager frame", "1:54.5-2:06.3"),
    (126.3, "Verse 2: Skokie 1993, Decatur 1990", "2:06.3-2:25.2"), (145.2, "Interlude (thinned)", "2:25.2-2:34.5"),
    (154.5, "Bridge: Mountain View 2010, Morton Grove", "2:34.5-2:52.5"), (172.5, "Hard stop", "2:52.5-2:54.7"),
    (174.7, "Verse 3: the party at 115%", "2:54.7-3:19.1"), (199.1, "Silence", "3:19.1-3:23.4"),
    (203.4, "Chorus 2: the closet, back at the shelf", "3:23.4-3:43.0"), (223.0, "Tail 2: frost into neuron", "3:43.0-3:55.0"),
    (235.0, "Outro: the kitchen", "3:55.0-4:12.9"), (252.9, "Drum coda and final tone", "4:12.9-4:28.4"),
    (9999, "Not placed in the plan", ""),
]
SHOTS = [
    (0.0, "plate", "PAD", "0:00-0:04.9"),
    (4.9, "attic88_day", "AD_wide", "0:04.9"), (5.0, "attic88_day", "AD_keys", "0:05-0:07 (and coda bar 3, 4:19.2)"),
    (7.0, "attic88_day", "AD_out", "0:07-0:18.2"), (9.0, "attic88_day", "AD_mote", "0:09-0:16.7 (and coda hit, 4:14.3)"),
    (18.2, "attic88_day", "AD_thumbs", "0:18.2-0:19.0"),
    (19.0, "office91", "H1", "0:19.0-0:25.6"), (25.6, "office91", "H1b", "0:25.6-0:29.7"),
    (29.7, "shanghai86", "V1a", "0:29.7"), (31.6, "shanghai86", "V1b", "0:31.6"), (34.5, "shanghai86", "V1c", "0:34.5"),
    (37.9, "shanghai86", "V1d_1", "0:37.9"), (41.4, "shanghai86", "V1d_2", "0:41.4"), (43.3, "shanghai86", "V1d_4", "0:43.3"),
    (45.4, "shanghai86", "V1d_8", "0:45.4"), (48.1, "shanghai86", "V1e", "0:48.1"), (50.5, "shanghai86", "V1f", "0:50.5"),
    (53.9, "shanghai86", "V1g", "0:53.9"), (55.2, "shanghai86", "V1h", "0:55.2-0:58.6"),
    (58.6, "shanghai86", "PB1", "0:58.6-1:08.3"),
    (68.3, "attic88_day", "AD_piano", "1:08.3-1:13.2"), (73.2, "attic88_day", "AD_frost_look", "1:13.2-1:17.2"),
    (74.5, "plate", "PLATE_frost", "~1:14-1:17.2"),
    (77.2, "office91", "PC1", "1:17.2"), (81.5, "office91", "PC2", "1:21.5"), (83.3, "office91", "PC3", "1:23.3"),
    (87.4, "office91", "PC4", "1:27.4"), (90.8, "office91", "PC5", "1:30.8"), (92.7, "office91", "BO1", "1:32.7"),
    (94.7, "office91", "BO2", "1:34.7-1:36.0"), (95.0, "office91", "X_sw", "spare (not timed)"),
    (96.0, "attic88_day", "AD_trace", "1:36.0-1:37.4"), (97.39, "attic88_day", "AD_grab", "1:37.4 (band hit)"),
    (97.4, "wall88", "WL_out", "1:37.4-1:51.0"), (100.7, "wall88", "WL_eye", "1:40.7-1:45.5"),
    (111.0, "wall88", "WL_in", "1:51.0-1:54.5"),
    (114.5, "plate", "VOY", "1:54.5-2:06.3"),
    (126.3, "market93", "M1", "2:06.3-2:09.2"), (129.2, "market93", "M2", "2:09.2-2:12.2"),
    (132.2, "market93", "M3", "2:12.2-2:14.2"), (133.0, "plate", "PLATE_artichoke", "~2:12-2:16 (intercut with the real artichoke)"),
    (134.2, "market93", "M4", "2:14.2-2:15.2"), (135.2, "market93", "M4b", "2:15.2-2:16.1"),
    (136.1, "basement90", "B1_feet", "2:16.1-2:17.2"), (137.2, "basement90", "B2_face", "2:17.2-2:18.3"),
    (138.3, "basement90", "B3_finger", "2:18.3-2:19.8"), (139.8, "basement90", "B4_doubletake", "2:19.8-2:21.4"),
    (141.4, "basement90", "B5_cat", "2:21.4-2:22.2"),
    (142.2, "kitchen90", "K1_question", "2:22.2-2:23.7"), (143.7, "kitchen90", "K2_taps", "2:23.7-2:24.7"),
    (144.7, "kitchen90", "K3_understood", "2:24.7-2:25.2"), (145.2, "kitchen90", "K4_writes", "2:25.2-2:27.6"),
    (147.6, "market93", "M5", "2:27.6-2:29.0"), (149.0, "market93", "M6", "2:29.0-2:30.0"),
    (150.0, "plate", "PLATE_romanesco", "2:30.0-2:34.5"),
    (154.5, "mv10", "BR1", "2:34.5"), (154.6, "mv10", "BR2", "2:34.5-2:37.1"), (157.1, "mv10", "BR3", "2:37.1-2:39.6"),
    (159.6, "mortongrove07", "MG1", "2:39.6"), (160.2, "mortongrove07", "MG2", "2:40.2-2:42.0"),
    (162.0, "mv10", "BRpan_a", "2:42.0"), (163.2, "mv10", "BRpan_m1", "2:43.2"), (164.4, "mv10", "BRpan_b", "2:44.4"),
    (166.9, "mv10", "BRpan_c", "2:46.9-2:49.7 (hold on the seam)"), (169.7, "mv10", "BR6", "2:49.7-2:52.5"),
    (172.5, "mv10", "HS1", "2:52.5-2:54.7"),
    (174.7, "mv10", "V3a", "2:54.7-2:57.0"), (177.0, "mv10", "V3b", "2:57.0-2:59.2"), (179.2, "mv10", "V3c", "2:59.2-3:03.8"),
    (183.8, "mv10", "V3_nailed", "3:03.8-3:06.0"), (186.0, "mv10", "V3e", "3:06.0-3:09.1"),
    (189.1, "mv10", "V3_rev_temple_a", "3:09.1"), (191.5, "mv10", "V3_rev_temple_b", "3:11.5"),
    (191.6, "mv10", "V3f", "3:11.6-3:12.8"), (192.8, "plate", "PLATE_spectrogram", "3:12.8-3:14.6 (first frame 3:10.45)"),
    (194.6, "mv10", "V3_rcv_obl", "3:14.6-3:18.7"),
    (199.1, "mv10", "SI1", "3:19.1-3:23.4"),
    (203.4, "closet02", "CL_wide", "3:23.4-3:28.0"), (208.0, "closet02", "CL_hands", "3:28.0-3:29.4"),
    (209.4, "closet02", "CL_ots", "3:29.4-3:32.5"), (212.5, "closet02", "CL_chin", "3:32.5-3:34.2"),
    (214.2, "mv10", "C2a", "3:34.2-3:39.6"), (219.6, "mv10", "C2b", "3:39.6-3:43.0"),
    (223.0, "attic88_day", "AD_fern", "3:43.0-3:55.0"), (223.5, "plate", "PLATE_frost2", "3:43.0-~3:47"),
    (227.0, "plate", "PLATE_neuron", "~3:47-3:55.0"),
    (235.0, "kitchen90", "K5_thumbs", "3:55.0-3:59.1"), (239.1, "kitchen90", "K6_mother", "3:59.1-4:03.6"),
    (243.6, "kitchen90", "K7_turns", "4:03.6-4:05.5"), (245.5, "kitchen90", "K8_glass", "4:05.5-4:08.6"),
    (248.6, "kitchen90", "K9_mote_out", "4:08.6-4:10.7"), (250.7, "kitchen90", "K10_mote_in", "4:10.7-4:12.9"),
    (256.8, "market93", "M9", "4:16.8-4:19.2 (coda bar 2; bars 1 and 3 reuse AD_mote and AD_keys)"),
    (261.7, "playground23", "PG1", "4:21.7-4:24.1"), (261.8, "playground23", "PG2", "4:21.7-4:28.4"),
    (264.1, "playground23", "PG2_plate", "4:24.1-4:28.4"), (264.2, "plate", "FINAL", "4:24.1-4:28.4"),
    (9999, "plate", "PLATE_aloe", "unplaced"), (9999.1, "plate", "PLATE_artichoke_growth", "dropped for time"),
]
PLATES = {  # id: (title, [(path from repo root, caption)], context)
    "PAD": ("Pad: bare paper, the wash gathers (round 1, code)", [("media/keyframes/plates/PAD_v1.jpg", "round 1 still")],
            "Blank register; not repainted in this round."),
    "PLATE_frost": ("FORMS OF WATER, PLATE XIV: the frost grows (code-rendered)",
                    [("media/footage/frost/stills/frost_t063s.png", "frost plate, mid"), ("media/footage/frost/stills/frost_t140s_last.png", "last frame")],
                    "She looks up at the frost on the pane and the plate grows, sped up."),
    "VOY": ("The Voyager frame: the blade of light becomes the band, the mote the dot (round 1)",
            [("media/keyframes/plates/VOY_v2.jpg", "round 1, v2"), ("media/keyframes/plates/VOY_v1.jpg", "round 1, v1")],
            "2D plate painted in round 1; not repainted. Holds through the vocalise (2:00.3-2:03.1)."),
    "PLATE_artichoke": ("PHYLLOTAXIS, PLATE XVIII: the artichoke count (code-rendered)",
                        [("media/footage/spirals/stills/artichoke_t11.00.png", "counting"), ("media/footage/spirals/stills/artichoke_t16.90.png", "count of 7: one short")],
                        "The gold count on the real artichoke becomes the plate; the eight-family count stops at 7 when the hand takes her forearm."),
    "PLATE_romanesco": ("PHYLLOTAXIS, PLATE XVIII: the completed count on the romanesco (code-rendered)",
                        [("media/footage/spirals/stills/romanesco_t11.60.png", "counting"), ("media/footage/spirals/stills/romanesco_t19.90.png", "count complete")],
                        "The count resumes from 8 on the artichoke plate, then completes on the romanesco for the interlude's last bars."),
    "PLATE_spectrogram": ("PLATE XXI: pitch contours (code-rendered, short version)",
                          [("media/footage/spectrogram/stills/spectrogram_short_193.60.png", "drawing left to right"), ("media/footage/spectrogram/stills/spectrogram_short_195.45.png", "finished frame")],
                          "Cut from the master's own lead vocal on \"Hug durations, pitch contours\", her contour traced in gold."),
    "PLATE_frost2": ("The frost fern grows again (frost plate)", [("media/footage/frost/stills/frost_t098s.png", "frost plate")],
                     "Tail 2: the 1988 fern starts growing again, and becomes..."),
    "PLATE_neuron": ("PLATE IX: a Purkinje cell, after Cajal (code-rendered)",
                     [("media/footage/neuron/stills/neuron_t063s.png", "growing"), ("media/footage/neuron/stills/neuron_t140s_last.png", "last frame")],
                     "...a neuron's branches. She sings the vocalise (3:48.8-3:52.6)."),
    "FINAL": ("Final tone: bare paper, a gold dotted line that stops (round 1, code)", [("media/keyframes/plates/FINAL_v1.jpg", "round 1 still")],
              "Blank register; not repainted."),
    "PLATE_aloe": ("PHYLLOTAXIS, PLATE XVIII: spiral aloe, 5 ranks (code-rendered)", [("media/footage/spirals/stills/aloe_t12.90.png", "aloe")],
                   "Not placed in the plan yet (an open question on the decision page)."),
    "PLATE_artichoke_growth": ("Artichoke growth plate: the bud opening (code-rendered)", [("media/keyframes/r2/_thumbs/artichoke_growth_mid.jpg", "mid-growth")],
                               "Dropped for time: the interlude half it lived in is not in the -2sm master (plan, judgment call)."),
}


def thumb(src, w):
    """repo-relative src -> path relative to R2 of a jpg w px wide (None if missing)."""
    p = os.path.join(ROOT, src)
    if not os.path.exists(p):
        return None
    out = os.path.join(TH, src.replace("/", "__").rsplit(".", 1)[0] + f"_{w}.jpg")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(p):
        os.makedirs(TH, exist_ok=True)
        subprocess.run(["convert", p + "[0]", "-resize", f"{w}x", "-quality", "86", out], check=True)
    return os.path.relpath(out, R2)


def rel(src):
    return os.path.relpath(os.path.join(ROOT, src), R2)


def span(label, t, nxt):
    """(t0, t1) from a label like '2:16.1-2:17.2 ...'; else from t to the next card (at least 1.5 s)."""
    import re
    m = re.match(r"~?(\d+):(\d+(?:\.\d+)?)-~?(\d+):(\d+(?:\.\d+)?)", label)
    if m:
        a, b, c, d = m.groups()
        return int(a) * 60 + float(b), int(c) * 60 + float(d)
    return t, max(nxt, t + 1.5)


def lyric_for(t0, t1, lines):
    got = [l["text"] for l in lines if l["start"] < t1 - 0.05 and l["end"] > t0 + 0.05 and not l.get("backing")]
    return " / ".join(dict.fromkeys(got))


def main():
    lines = json.load(open(os.path.join(ROOT, "media", "karaoke_v2", "lyrics_timed.json")))["lines"]
    picks = {}
    for s in {x[1] for x in SHOTS if x[1] != "plate"}:
        f = os.path.join(R2, s, "picks.json")
        if os.path.exists(f):
            picks[s] = json.load(open(f))
    agc = os.path.join(ROOT, "media/footage/artichoke/out/artichoke_growth_preview.mp4")
    mid = os.path.join(TH, "artichoke_growth_mid.jpg")
    if os.path.exists(agc) and not os.path.exists(mid):
        os.makedirs(TH, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "6", "-i", agc, "-frames:v", "1", "-vf", "scale=1400:-2", mid], check=False)
    cards, missing = [], []
    order = sorted(SHOTS, key=lambda x: x[0])
    for i, (t, s, sid, tl) in enumerate(order):
        nxt = next((o[0] for o in order[i + 1:] if o[0] > t), t + 3)
        sec = [x for x in SECTIONS if x[0] <= t][-1]
        c = {"id": sid, "sec": sec[1], "secTime": sec[2], "time": tl, "lyric": lyric_for(*span(tl, t, nxt), lines) if t < 9000 else ""}
        if s == "plate":
            title, imgs, ctx = PLATES[sid]
            c.update(kind="plate", title=title, ctx=ctx,
                     imgs=[[rel(p) if p.startswith("media/keyframes/r2") else (thumb(p, 1400) or ""), rel(p), cap] for p, cap in imgs])
        else:
            pk = picks.get(s, {}).get(sid)
            g = f"media/layout/{s}/{sid}_lit.png"
            if not os.path.exists(os.path.join(ROOT, g)):
                g = f"media/layout/{s}/{sid}_line.png"
            c.update(kind="shot", set=s, guide=[thumb(g, 640) or "", rel(g)], line=[thumb(f"media/layout/{s}/{sid}_line.png", 640) or "", rel(f"media/layout/{s}/{sid}_line.png")])
            if pk and pk.get("pick"):
                src = f"media/keyframes/r2/{s}/{pk['pick']}"
                c.update(kf=[thumb(src, 1400) or "", rel(src)], status=pk.get("status", ""), note=pk.get("note", ""),
                         takes=[[thumb(f"media/keyframes/r2/{s}/{tk}", 320) or "", rel(f"media/keyframes/r2/{s}/{tk}"), tk]
                                for tk in pk.get("takes", []) if tk != pk["pick"]],
                         pick=pk["pick"], header=pk.get("header", ""))
            else:
                missing.append(f"{s}/{sid}")
        cards.append(c)
    page = TEMPLATE.replace("__DATA__", json.dumps(cards, ensure_ascii=False))
    with open(os.path.join(R2, "index.html"), "w") as f:
        f.write(page)
    n = sum(1 for c in cards if c["kind"] == "shot")
    print(f"wrote media/keyframes/r2/index.html: {n} shots, {len(cards) - n} plates; missing keyframes: {len(missing)} {missing}")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Proof — keyframes, round 2</title>
<style>
  :root { --paper:#f6f1e6; --ink:#2b2824; --mute:#6f675c; --gold:#b48a2c; --line:#d9cfbd; --done:#5a7a4a; --weak:#a8542c; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); font:16px/1.5 Georgia, "Iowan Old Style", serif; }
  header { position:sticky; top:0; z-index:5; background:rgba(246,241,230,.96); border-bottom:1px solid var(--line); padding:10px 28px; display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
  header h1 { font-size:20px; margin:0; font-weight:normal; letter-spacing:.02em; }
  header .count { color:var(--mute); font-size:14px; }
  header nav { width:100%; order:9; font-size:13px; }
  header nav a { color:var(--ink); margin-right:10px; text-decoration:none; border-bottom:1px dotted var(--mute); white-space:nowrap; }
  header .btns { margin-left:auto; display:flex; gap:8px; }
  button { font:inherit; font-size:14px; padding:6px 14px; border:1px solid var(--ink); background:#fffaf0; cursor:pointer; border-radius:3px; }
  button.primary { background:var(--ink); color:var(--paper); }
  main { max-width:1500px; margin:0 auto; padding:10px 28px 80px; }
  h2 { font-weight:normal; font-size:24px; margin:44px 0 6px; border-bottom:1px solid var(--line); padding-bottom:4px; scroll-margin-top:110px; }
  h2 small { color:var(--mute); font-size:14px; margin-left:8px; }
  .card { background:#fffdf7; border:1px solid var(--line); border-left:4px solid var(--gold); margin:16px 0; padding:14px 18px; border-radius:3px; scroll-margin-top:110px; }
  .card.answered { border-left-color:var(--done); }
  .card.plate { background:#faf6ec; }
  .card h3 { margin:0 0 4px; font-size:18px; display:flex; gap:12px; align-items:baseline; flex-wrap:wrap; }
  .card h3 .t { color:var(--gold); font-size:15px; font-family:ui-monospace, Menlo, monospace; }
  .card h3 .set { color:var(--mute); font-size:13px; font-weight:normal; }
  .badge { font-size:12px; padding:1px 7px; border-radius:9px; border:1px solid var(--weak); color:var(--weak); font-weight:normal; }
  .lyric { font-style:italic; margin:0 0 4px; }
  .ctx { color:var(--mute); font-size:14px; margin:0 0 8px; }
  .row { display:grid; grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); gap:14px; align-items:start; }
  .row .kf img { width:100%; border:1px solid var(--line); cursor:zoom-in; background:#ddd; display:block; }
  .side img { width:100%; border:1px solid var(--line); cursor:zoom-in; display:block; background:#ddd; }
  .side figure, .kf figure { margin:0 0 8px; }
  figcaption { font-size:12px; color:var(--mute); }
  .takes { display:flex; gap:6px; flex-wrap:wrap; }
  .takes figure { width:calc(50% - 3px); margin:0; }
  .imgs { display:flex; gap:10px; flex-wrap:wrap; margin:6px 0 10px; }
  .imgs figure { margin:0; flex:1 1 360px; max-width:700px; }
  .imgs img { width:100%; border:1px solid var(--line); cursor:zoom-in; }
  .missing { padding:30px; border:1px dashed var(--line); color:var(--mute); font-size:13px; text-align:center; }
  .opts { display:flex; gap:18px; flex-wrap:wrap; margin-top:8px; }
  .opts label { cursor:pointer; }
  textarea { width:100%; min-height:40px; font:inherit; font-size:14px; padding:6px 8px; border:1px solid var(--line); background:#fff; margin-top:6px; }
  #zoom { position:fixed; inset:0; background:rgba(20,18,15,.94); display:none; align-items:center; justify-content:center; z-index:10; cursor:zoom-out; }
  #zoom img { max-width:98vw; max-height:96vh; }
  #out { position:fixed; inset:5vh 10vw; background:#fffdf7; border:1px solid var(--ink); z-index:11; display:none; padding:16px; flex-direction:column; gap:8px; }
  #out textarea { flex:1; font-family:ui-monospace, Menlo, monospace; font-size:13px; }
  .note { color:var(--mute); font-size:14px; }
  @media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header>
  <h1>Proof — keyframes, round 2</h1>
  <span class="count" id="count"></span>
  <span class="btns"><button onclick="onlyWeak()" id="wbtn">Show weak only</button><button class="primary" onclick="exportAnswers()">Copy my answers</button></span>
  <nav id="nav"></nav>
</header>
<main>
  <p class="note">Painted 2026-11-25 from the new set renders (articulated mannequins, your corrections, -2sm times). One card per shot in film order; the time is on the -2sm master and the line is what is sung over it. The big picture is the keyframe (raw painting: motes, gold pencil, toner labels and headers are added later in code, and none are on these); the small one on the right is the guide render it was painted from, then the line drawing and any other takes. Cards marked <span class="badge">weak</span> are ones the painter was not happy with (reason underneath). Plate cards are code-rendered footage, shown where the plan places them. Pick an option and/or write a note; untouched cards mean "fine as is". Answers are saved in this browser. When done, press <b>Copy my answers</b> and paste the text into the chat. Click any picture to enlarge it. Round 1 is still at <a href="../index.html">media/keyframes/index.html</a>.</p>
  <div id="cards"></div>
</main>
<div id="zoom" onclick="this.style.display='none'"><img alt=""></div>
<div id="out"><b>Paste this into the chat:</b><textarea id="outText" readonly></textarea><div><button class="primary" onclick="copyOut()">Copy to clipboard</button> <button onclick="document.getElementById('out').style.display='none'">Close</button> <span id="copied" class="note"></span></div></div>
<script>
const C = __DATA__;
const OPTS = ['Good', 'Redo (note)', 'Wrong staging (note)'];
const POPTS = ['Good', 'Change (note)'];
const KEY = 'proof-keyframes-r2-v1';
const state = JSON.parse(localStorage.getItem(KEY) || '{}');
const save = () => { localStorage.setItem(KEY, JSON.stringify(state)); count(); };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fig = (th, full, cap) => th ? `<figure><img src="${esc(th)}" data-full="${esc(full)}" loading="lazy" alt=""><figcaption>${esc(cap)}</figcaption></figure>` : `<div class="missing">missing: ${esc(full)}</div>`;
function render() {
  const root = document.getElementById('cards'); const secs = []; let cur = null;
  for (const c of C) {
    if (c.sec !== cur) { cur = c.sec; secs.push(cur); const h = document.createElement('h2'); h.id = 'sec-' + secs.length; h.innerHTML = esc(cur) + (c.secTime ? `<small>${esc(c.secTime)}</small>` : ''); root.appendChild(h); }
    const s = state[c.id] || {}; const opts = c.kind === 'plate' ? POPTS : OPTS;
    const d = document.createElement('div'); d.className = 'card ' + c.kind; d.id = 'c-' + c.id;
    if (c.status === 'weak') d.dataset.weak = '1';
    let h = `<h3><span class="t">${esc(c.time)}</span> ${esc(c.kind === 'plate' ? c.title : c.id)}${c.set ? `<span class="set">${esc(c.set)}</span>` : ''}${c.status === 'weak' ? '<span class="badge">weak</span>' : ''}</h3>`;
    if (c.lyric) h += `<p class="lyric">“${esc(c.lyric)}”</p>`;
    if (c.header) h += `<p class="ctx">${esc(c.header)}</p>`;
    if (c.ctx) h += `<p class="ctx">${esc(c.ctx)}</p>`;
    if (c.kind === 'plate') {
      h += '<div class="imgs">' + c.imgs.map(([th, full, cap]) => fig(th, full, cap)).join('') + '</div>';
    } else {
      h += '<div class="row"><div class="kf">' + (c.kf ? fig(c.kf[0], c.kf[1], c.pick) : '<div class="missing">not painted yet</div>') + '</div><div class="side">';
      h += fig(c.guide[0], c.guide[1], 'guide render (lit)') + fig(c.line[0], c.line[1], 'line drawing');
      if (c.takes && c.takes.length) h += '<div class="note">other takes</div><div class="takes">' + c.takes.map(([th, full, cap]) => fig(th, full, cap)).join('') + '</div>';
      h += '</div></div>';
      if (c.note) h += `<p class="ctx"><b>Painter:</b> ${esc(c.note)}</p>`;
    }
    h += '<div class="opts">' + opts.map((o, i) => `<label><input type="radio" name="${c.id}" value="${i}" ${s.choice == i ? 'checked' : ''}> ${esc(o)}</label>`).join('') + '</div>';
    h += `<textarea placeholder="Note (optional): what to change, or e.g. 'use the other take'" data-id="${c.id}">${esc(s.note || '')}</textarea>`;
    d.innerHTML = h; root.appendChild(d);
  }
  document.getElementById('nav').innerHTML = secs.map((s, i) => `<a href="#sec-${i + 1}">${esc(s.split(':')[0])}</a>`).join('');
  root.addEventListener('change', (e) => { if (e.target.type === 'radio') { (state[e.target.name] ||= {}).choice = +e.target.value; save(); mark(); } });
  root.addEventListener('input', (e) => { if (e.target.tagName === 'TEXTAREA') { (state[e.target.dataset.id] ||= {}).note = e.target.value; save(); mark(); } });
  root.addEventListener('click', (e) => { if (e.target.tagName === 'IMG') { const z = document.getElementById('zoom'); z.querySelector('img').src = e.target.dataset.full || e.target.src; z.style.display = 'flex'; } });
  mark(); count();
}
const answered = (id) => { const s = state[id]; return s && (s.choice !== undefined || (s.note || '').trim()); };
function mark() { for (const c of C) document.getElementById('c-' + c.id).classList.toggle('answered', !!answered(c.id)); }
function count() { const n = C.filter(c => c.kind === 'shot').length, w = C.filter(c => c.status === 'weak').length; document.getElementById('count').textContent = `${C.filter(c => answered(c.id)).length} of ${C.length} cards answered · ${n} shots, ${w} marked weak`; }
let weakOnly = false;
function onlyWeak() { weakOnly = !weakOnly; document.getElementById('wbtn').textContent = weakOnly ? 'Show all' : 'Show weak only'; for (const c of C) document.getElementById('c-' + c.id).style.display = (!weakOnly || c.status === 'weak') ? '' : 'none'; }
function exportAnswers() {
  const lines = ['Keyframes r2 (from media/keyframes/r2/index.html):'];
  for (const c of C) {
    if (!answered(c.id)) continue;
    const s = state[c.id], opts = c.kind === 'plate' ? POPTS : OPTS;
    lines.push(`- ${c.id}: ${s.choice !== undefined ? opts[s.choice] : '(no option picked)'}${(s.note || '').trim() ? ' — ' + s.note.trim().replace(/\n+/g, ' / ') : ''}`);
  }
  if (lines.length === 1) lines.push('(nothing answered yet)');
  document.getElementById('outText').value = lines.join('\n');
  document.getElementById('out').style.display = 'flex'; document.getElementById('copied').textContent = '';
}
function copyOut() { const t = document.getElementById('outText'); t.select(); navigator.clipboard?.writeText(t.value).then(() => document.getElementById('copied').textContent = 'Copied.', () => { document.execCommand('copy'); document.getElementById('copied').textContent = 'Copied.'; }); }
render();
</script>
</body></html>
"""

if __name__ == "__main__":
    main()
