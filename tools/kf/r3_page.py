#!/usr/bin/env python3
"""Keyframes round 3 review page: media/keyframes/r3/index.html (open it from disk).

    python3 tools/kf/r3_page.py

Same look and answers as round 2 (tools/kf/r2_page.py): one card per shot in film order (-2sm master times), grouped
by section of the song, with the lyric sung over it, the pick large (click for full size), the other takes and the
guides (media/layout/<set>/<SHOT>_contour/_form/_light.png when present) small beside it, a source badge (painted /
carried from r2 / footage), a status badge (weak in amber), the painter's note and Jade's round-2 note. Answers:
Good / Redo / Wrong staging + note (footage and plates: Good / Change + note). "Copy my answers" produces a block
beginning `Keyframes r3 (from media/keyframes/r3/index.html):`. Answers persist in localStorage (own key).

Reads media/keyframes/r3/<set>/picks.json, media/keyframes/r3/footage_slots.json (authoritative for footage times:
where a set's picks.json disagrees, the slot's time is shown and the difference noted), the questions in
media/keyframes/r3/<set>/NOTES.md (curated into QUESTIONS below: the notes have no common heading), and the lyric
timings in media/karaoke_v2/lyrics_timed.json. Thumbnails go to media/keyframes/r3/_thumbs/.
"""
import html
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import r2_page  # noqa: E402  (SECTIONS, fallback times for shots with no time in picks.json, lyric helpers)

ROOT = r2_page.ROOT
R3 = os.path.join(ROOT, "media", "keyframes", "r3")
TH = os.path.join(R3, "_thumbs")
SETS = ["attic88_day", "office91", "playground23", "shanghai86", "wall88", "market93", "basement90", "kitchen90",
        "closet02", "mortongrove07", "mv10"]
NEW_IDS = {"FE_out", "FE_thumbs", "PC3a", "PC3b", "V1d_8_end", "K1_question_end", "MG1_end", "WL_in_empty", "V3b_prep"}
RETIRED_EXTRA = {  # retired ids that no longer appear in any picks.json
    "PC3": ("office91", "Split into PC3a (pan start, the sweatshirt) and PC3b (pan end, the sheet): one camera, a tilt down."),
    "V3g": ("mv10", "The old route's alternate (shelf, dining, sliding door); the route is gone (layout/sets/mv10/NOTES.md)."),
}
# Fallback song times (s) for shots whose picks.json time is missing or not a time.
R2T = {sid: t for t, s, sid, _ in r2_page.SHOTS}
FALLBACK = {"FE_out": 8.76, "FE_thumbs": 18.23, "V1d_8_end": 45.44, "K1_question_end": 142.21, "MG1_end": 160.2,
            "WL_in_empty": 111.01, "V3b_prep": 178.0}
SORT_T = {"MG2": 160.21}  # one continuous move: MG1 -> MG1_end (2:40.2, the cut) -> MG2
TIEBREAK = ["MG1", "MG1_end", "MG2", "K1_question", "K1_question_end", "V1d_8", "V1d_8_end", "WL_in", "WL_in_empty"]

PLATES = {  # id: (start s, time label, title, [(path, caption)], context)
    "PLATE_frost": (74.5, "~1:14-1:17.2", "FORMS OF WATER, PLATE XIV: the frost grows (code-rendered, unchanged)",
                    [("media/footage/frost/stills/frost_t063s.png", "frost plate, mid"), ("media/footage/frost/stills/frost_t140s_last.png", "last frame")],
                    "She looks up at the frost on the pane and the plate grows, sped up."),
    "VOY": (114.5, "1:54.5-2:06.3", "The Voyager frame (round 1, unchanged)",
            [("media/keyframes/plates/VOY_v2.jpg", "round 1, v2"), ("media/keyframes/plates/VOY_v1.jpg", "round 1, v1")],
            "2D plate painted in round 1; not repainted. Holds through the vocalise (2:00.3-2:03.1)."),
    "PLATE_spectrogram": (192.8, "3:12.8-3:14.6 (first frame 3:10.45)", "PLATE XXI: pitch contours (code-rendered, short version, unchanged)",
                          [("media/footage/spectrogram/stills/spectrogram_short_193.60.png", "drawing left to right"), ("media/footage/spectrogram/stills/spectrogram_short_195.45.png", "finished frame")],
                          "Cut from the master's own lead vocal on \"Hug durations, pitch contours\", her contour traced in gold."),
    "PLATE_frost2": (223.5, "3:43.0-~3:47", "The frost fern grows again (frost plate)", [("media/footage/frost/stills/frost_t098s.png", "frost plate")],
                     "Tail 2: the 1988 fern starts growing again, and becomes..."),
    "PLATE_neuron": (227.0, "~3:47-3:55.0", "PLATE IX: a Purkinje cell, after Cajal (code-rendered)",
                     [("media/footage/neuron/stills/neuron_t063s.png", "growing"), ("media/footage/neuron/stills/neuron_t140s_last.png", "last frame")],
                     "...a neuron's branches. She sings the vocalise (3:48.8-3:52.6). New this round: the neuron already starts in the bridge (BR2, BR3 use its first 30 s); tail 2 resumes it at 30 s [plan proposal]."),
    "FINAL": (264.2, "4:24.1-4:28.4", "Final tone: bare paper, a gold dotted line that stops (round 1, code)", [("media/keyframes/plates/FINAL_v1.jpg", "round 1 still")],
              "Blank register; not repainted."),
    "PLATE_aloe": (9999, "unplaced", "PHYLLOTAXIS, PLATE XVIII: spiral aloe, 5 ranks (code-rendered)", [("media/footage/spirals/stills/aloe_t12.90.png", "aloe")],
                   "Not placed in the plan."),
}
SLOT_PLATES = {  # footage_slots ids shown as plate cards, with extra spirals stills
    "PLATE_artichoke": ("PHYLLOTAXIS, PLATE XVIII: the artichoke count, cut A (code-rendered, re-timed)",
                        [("media/footage/spirals/stills/artichoke_t02.80.png", "2.8 s: a live line"), ("media/footage/spirals/stills/artichoke_t05.00.png", "5.0 s: the cut, 7 of 8")]),
    "PLATE_romanesco": ("PHYLLOTAXIS, PLATE XVIII: the artichoke count, cut B, in the romanesco's old slot (code-rendered)",
                        [("media/footage/spirals/stills/artichoke_t07.20.png", "7.2 s: the 5 family"), ("media/footage/spirals/stills/artichoke_t09.40.png", "9.4 s: both totals")]),
}

QUESTIONS = {  # set: one line per question or flag, from media/keyframes/r3/<set>/NOTES.md
    "attic88_day": [
        "The intro 0:07-0:18.2 lost AD_out and AD_thumbs: it is now AD_mote, FE_out / FE_thumbs (age 10, office91) and the artichoke footage (AD_keys). OK to re-sequence as the plan proposes?",
        "AD_keys was also the coda bar-3 reuse (4:19.2-4:21.7): footage there too, or the hands? (The camera is kept.)",
        "Age: the keys scene (AD_wide, AD_piano) is now 4.5; AD_frost_look, AD_trace and AD_grab (\"five years old\") were not changed. Same day, so 4.5 throughout?",
        "Her socks are white crew (assumed from basement90). Right?",
    ],
    "office91": [
        "FE_out: her eyes go to Mama's face, not to the floor past the lens as asked, and her hands are in her pockets. Acceptable or redo?",
        "The handout faces and labels are not comped onto the paintings yet (the paintings carry empty circles). Comp before the next review?",
    ],
    "playground23": [
        "PG1 is carried from r2 with the same caveats: she reads ~30 not 40, and the boy seems to stand rather than sit on the arm.",
        "PG2_plate v2 is very close to the r2 plate; the band of light still reads somewhat as light on the floor rather than lit air.",
        "PG2: the man reads as a generic adult, not seventy.",
    ],
    "shanghai86": [
        "V1c: check her mouth: a faint softness, not meant as a smile.",
        "V1d_8 (weak): her hands read slightly older than 3.",
        "V1h (weak): both takes stand a stick in the lower-left mug (from the guide's steam rod). Fix the guide (fainter steam or none) and repaint?",
        "V1g was repainted only for the 08:30 sun; the r2 pick you liked is the fallback. Which one?",
    ],
    "wall88": [
        "WL_eye: the blade of light sits on the far eye / nose bridge instead of the near eye (three tries, same result). Acceptable?",
        "Strangers' terror and prayer are carried by bodies, hands and darkness only (faces stay unreached): enough?",
        "WL_in is no longer literally her eye-line (the camera has to sit in the sheet of light, ~20 cm above her eyes).",
    ],
    "market93": [
        "M4b: Mama's whole head is shown, looking up the aisle, not at the girl. OK?",
        "The wash still comes back warm beige-grey rather than cool (as in r2).",
    ],
    "basement90": [
        "B4_doubletake: the gap between her tongue and wrist (the pretend lick) is small. Enough?",
    ],
    "kitchen90": [
        "K2-K4 are 46 s of artichoke footage for 3.9 s of screen: speed it up (the plan has 6.85x) or cut?",
        "K1_question_end reads as coloured-pencil textbook art more than an engraving. Right look for the caption figure?",
        "K7_turns is still a little smaller than the guide; Mama's glasses still come out oval (K6).",
    ],
    "closet02": [
        "His hair follows the v4 sheets literally: a rounded, glossy top layer like a bowl over a hard undercut step (CL_wide, CL_ots). If that is not the cut, the fl_B/fl_G v4 sheet needs fixing first.",
        "CL_chin (gpt-image-2): her fingers hang down rather than curl toward us.",
    ],
    "mortongrove07": [
        "MG1 (weak points): his sleeves are at the wrist (should be pushed up), the top of his hair is still a touch domed, and carpeted steps were invented at frame right.",
        "MG2: the layout has the lower half still swinging open; the painting opens it fully (the end of the unfold). OK?",
        "The sun patch is soft in all three (the room is evenly lit).",
    ],
    "mv10": [
        "Assumed: the jacket zips at the front, worn unzipped and hanging nearly closed, hip length.",
        "Assumed: her socks are plain mid-grey; socks with no shoes outdoors too (V3a/V3b/V3b_prep in the yard, V3f on the deck, SI1 on the lawn).",
        "Assumed: \"before the party\" is the same outfit, at 10:30 for \"early in the day\".",
        "BR1 footage time: you wrote \"2:13 (or wherever we left off) to 2:28\", but the artichoke clip is 140 s and K4/M5/M6 stop at 2:08; the plan maps BR1 to 2:00-2:19 of the clip (see the card).",
        "The NASA meatball is legible (\"NASA\" in white) in the close shots (BR6, V3c, V3_nailed, SI1, C2a): keep the real emblem, or have the compositor replace it under the no-lettering rule?",
        "His hair reads as a bowl with a level rim in every take (the same problem as the v4 sheet: bowl or right?).",
        "C2b: SHE holds the cup (the set has it in his hand), and her face looks up at him rather than him looking down at her hand.",
    ],
}

HEADER = [
    "<b>New guides.</b> Every set was re-rendered and painted from three guides instead of one: <i>contour</i> (the line drawing), <i>form</i> (shaded clay) and <i>light</i> (where the sun falls). They are the small pictures beside each keyframe.",
    "<b>Sets fixed per your r2 notes</b> before painting (restaged, re-cast or re-timed; each set's <code>layout/sets/&lt;set&gt;/NOTES.md</code> has the log), then every shot you marked Redo or Wrong staging was repainted.",
    "<b>Footage replaces shots.</b> As you asked: AD_keys, PB1, K2-K4, M5, M6 and BR1 are now the artichoke growth footage, BR2/BR3 the start of the neuron plate, and the romanesco slot is cut B of the re-timed artichoke count. Times are the plan agent's (<code>footage_slots.json</code>); a few are proposals.",
    "<b>Retired / new ids.</b> AD_out and AD_thumbs moved to age 10 outside the counselor's door (new FE_out, FE_thumbs in office91); PC3 split into PC3a/PC3b; new end frames for the camera moves (V1d_8_end, K1_question_end, MG1_end, WL_in_empty) and a new V3b_prep. List at the bottom.",
    "<b>Codex hit its plan limit</b> partway through the night (about 23:42), so the later takes went to gpt-image-2 (paid). The palettes differ a little between the two (Codex warmer); the painter's note on each card names the route where it matters.",
]


def thumb(src, w):
    """repo-relative src -> path relative to R3 of a jpg w px wide (None if missing)."""
    p = os.path.join(ROOT, src)
    if not os.path.exists(p):
        return None
    out = os.path.join(TH, src.replace("/", "__").rsplit(".", 1)[0] + f"_{w}.jpg")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(p):
        os.makedirs(TH, exist_ok=True)
        subprocess.run(["convert", p + "[0]", "-resize", f"{w}x", "-quality", "86", out], check=True)
    return os.path.relpath(out, R3)


def rel(src):
    return os.path.relpath(os.path.join(ROOT, src), R3)


def mmss(s):
    m, x = divmod(float(s), 60)
    return f"{int(m)}:{x:04.1f}"


def parse_time(v):
    """picks.json time -> (start s or None, label). Handles [a, b], 'a-b' in seconds, and 'm:ss.s...' labels."""
    if isinstance(v, list) and v:
        return float(v[0]), "-".join(mmss(x) for x in v)
    if isinstance(v, str):
        m = re.match(r"^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$", v.strip())
        if m:
            return float(m.group(1)), f"{mmss(m.group(1))}-{mmss(m.group(2))}"
        m = re.match(r"~?(\d+):(\d+(?:\.\d+)?)", v)
        if m:
            return int(m.group(1)) * 60 + float(m.group(2)), v
        return None, v
    return None, ""


def span_of(label, t):
    m = re.match(r"~?(\d+):(\d+(?:\.\d+)?)-~?(\d+):(\d+(?:\.\d+)?)", label or "")
    if m:
        a, b, c, d = m.groups()
        return int(a) * 60 + float(b), int(c) * 60 + float(d)
    return t, t + 1.5


def fig(src, w, cap, missing):
    if not src:
        return None
    th = thumb(src, w)
    if not th:
        missing.append(src)
        return ["", rel(src), cap]
    return [th, rel(src), cap]


def main():
    lines = json.load(open(os.path.join(ROOT, "media", "karaoke_v2", "lyrics_timed.json")))["lines"]
    slots = json.load(open(os.path.join(R3, "footage_slots.json")))["shots"]
    cards, missing, retired, nopicks = [], [], [], []
    for s in SETS:
        f = os.path.join(R3, s, "picks.json")
        if not os.path.exists(f):
            nopicks.append(s)
            continue
        for sid, pk in json.load(open(f)).items():
            if pk.get("source") == "retired" or pk.get("status") == "retired":
                retired.append([sid, s, pk.get("note", ""), pk.get("jade_r2", "")])
                continue
            t, label = parse_time(pk.get("time"))
            slot = slots.get(sid)
            diff = []
            if slot:
                e = span_of(label, t)[1] if t is not None and re.match(r"~?\d+:\d+(?:\.\d+)?-", label or "") else None
                if t is None or abs(t - slot["song_start_s"]) > 0.15 or e is None or abs(e - slot["song_end_s"]) > 0.15:
                    diff.append(f"the set's picks.json has {label or 'no time'}")
                ft = pk.get("footage_t")
                fs = f"{slot['footage_start_s']:g}-{slot['footage_end_s']:g}"
                if ft and not str(ft).startswith(fs):
                    diff.append(f"footage {ft} s in picks.json vs {fs} s in footage_slots.json")
                t, label = slot["song_start_s"], slot["song_time"]
            if t is None:
                t = FALLBACK.get(sid, R2T.get(sid, 9000))
                label = (label + " " if label else "") + (f"(no time in picks.json; placed at {mmss(t)} as in r2)" if sid in R2T else f"(no time in picks.json; placed at {mmss(t)})")
            if sid == "X_sw":
                t, label = 95.0, "spare (not timed)"
            src = pk.get("source", "")
            c = {"id": sid, "set": s, "t": t, "time": label, "header": pk.get("header") or "", "kind": "footage" if src == "footage" else "shot",
                 "source": src, "status": pk.get("status", ""), "note": pk.get("note", ""), "jade": pk.get("jade_r2", ""),
                 "isnew": sid in NEW_IDS, "guides": [], "takes": []}
            big = None
            if slot:
                big = fig(slot["still"], 1400, f"footage still at {slot['still_footage_s']:g} s of {os.path.basename(slot['footage'])}", missing)
                own = pk.get("pick") or (f"{sid}_footage.jpg" if os.path.exists(os.path.join(R3, s, f"{sid}_footage.jpg")) else None)
                if own:
                    c["takes"].append(fig(f"media/keyframes/r3/{s}/{own}", 320, f"set agent's still ({own})", missing))
                c["slot"] = {k: slot.get(k) for k in ("song_time", "footage", "footage_start_s", "footage_end_s", "speed", "source", "note")}
                c["diff"] = "; ".join(diff)
            elif pk.get("pick"):
                big = fig(f"media/keyframes/r3/{s}/{pk['pick']}", 1400, pk["pick"], missing)
                for tk in pk.get("takes", []):
                    if tk != pk["pick"]:
                        c["takes"].append(fig(f"media/keyframes/r3/{s}/{tk}", 320, tk, missing))
            else:
                missing.append(f"{s}/{sid}: no pick")
            c["kf"] = big
            seen = set()
            for kind in ("contour", "form", "light"):
                g = f"media/layout/{s}/{sid}_{kind}.png"
                if os.path.exists(os.path.join(ROOT, g)):
                    c["guides"].append(fig(g, 480, kind, missing)); seen.add(g)
            g = pk.get("guide")
            if g and g not in seen:
                c["guides"].append(fig(g, 480, "guide: " + os.path.basename(g), missing))
            c["lyric"] = r2_page.lyric_for(*span_of(label, t), lines) if t < 9000 else ""
            cards.append(c)
    for pid, (t, label, title, imgs, ctx) in PLATES.items():
        cards.append({"id": pid, "t": t, "time": label, "kind": "plate", "title": title, "ctx": ctx,
                      "imgs": [fig(p, 1400, cap, missing) for p, cap in imgs],
                      "lyric": r2_page.lyric_for(*span_of(label, t), lines) if t < 9000 else ""})
    for pid, (title, extra) in SLOT_PLATES.items():
        slot = slots[pid]
        t, label = slot["song_start_s"], slot["song_time"]
        imgs = [fig(slot["still"], 1400, f"footage still at {slot['still_footage_s']:g} s", missing)] + [fig(p, 1400, cap, missing) for p, cap in extra]
        cards.append({"id": pid, "t": t + 0.01, "time": label, "kind": "plate", "title": title, "ctx": slot["note"], "imgs": imgs,
                      "slot": {k: slot.get(k) for k in ("song_time", "footage", "footage_start_s", "footage_end_s", "speed", "source")},
                      "lyric": r2_page.lyric_for(*span_of(label, t), lines)})
    for sid, (s, why) in RETIRED_EXTRA.items():
        retired.append([sid, s, why, ""])
    rank = {k: i for i, k in enumerate(TIEBREAK)}
    cards.sort(key=lambda c: (SORT_T.get(c["id"], c["t"]), rank.get(c["id"], 0)))
    for c in cards:
        sec = [x for x in r2_page.SECTIONS if x[0] <= c["t"] + 1e-6][-1]
        c["sec"], c["secTime"] = sec[1], sec[2]
    import collections
    qs = collections.OrderedDict((s, QUESTIONS[s]) for s in SETS if s in QUESTIONS)
    try:
        spend = subprocess.run(["python3", os.path.join(ROOT, "tools/gen/spend.py")], capture_output=True, text=True, cwd=ROOT).stdout.strip().splitlines()[-1]
    except Exception:
        spend = "(spend.py failed)"
    head = HEADER + [f"<b>Spend so far:</b> {html.escape(spend)} (from <code>tools/gen/spend.py</code>)."]
    page = (TEMPLATE.replace("__DATA__", json.dumps(cards, ensure_ascii=False))
            .replace("__RETIRED__", json.dumps(retired, ensure_ascii=False))
            .replace("__QS__", json.dumps(qs, ensure_ascii=False))
            .replace("__HEAD__", "".join(f"<li>{h}</li>" for h in head)))
    with open(os.path.join(R3, "index.html"), "w") as f:
        f.write(page)
    n = sum(1 for c in cards if c["kind"] != "plate")
    print(f"wrote media/keyframes/r3/index.html: {len(cards)} cards ({n} shots incl. {sum(1 for c in cards if c['kind'] == 'footage')} footage, "
          f"{len(cards) - n} plates); retired {len(retired)}; sets without picks: {nopicks}; missing files: {len(missing)} {missing}")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Proof — keyframes, round 3</title>
<style>
  :root { --paper:#f6f1e6; --ink:#2b2824; --mute:#6f675c; --gold:#b48a2c; --line:#d9cfbd; --done:#5a7a4a; --weak:#a8542c; --amber:#c98a12; }
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
  .card.plate, .card.footage { background:#faf6ec; }
  .card h3 { margin:0 0 4px; font-size:18px; display:flex; gap:10px; align-items:baseline; flex-wrap:wrap; }
  .card h3 .t { color:var(--gold); font-size:15px; font-family:ui-monospace, Menlo, monospace; }
  .card h3 .set { color:var(--mute); font-size:13px; font-weight:normal; }
  .badge { font-size:12px; padding:1px 7px; border-radius:9px; border:1px solid var(--mute); color:var(--mute); font-weight:normal; }
  .badge.painted { border-color:var(--gold); color:#8a6a1c; }
  .badge.footage { border-color:#4a6a8a; color:#4a6a8a; }
  .badge.weak { border-color:var(--amber); background:#fbe9c4; color:#7a4e00; }
  .badge.new { border-color:var(--done); color:var(--done); }
  .lyric { font-style:italic; margin:0 0 4px; }
  .ctx { color:var(--mute); font-size:14px; margin:0 0 8px; }
  .ctx.jade { color:#5a3e7a; }
  .ctx.diff { color:var(--weak); }
  .row { display:grid; grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); gap:14px; align-items:start; }
  .row .kf img { width:100%; border:1px solid var(--line); cursor:zoom-in; background:#ddd; display:block; }
  .side img { width:100%; border:1px solid var(--line); cursor:zoom-in; display:block; background:#ddd; }
  .side figure, .kf figure { margin:0 0 8px; }
  figcaption { font-size:12px; color:var(--mute); }
  .takes { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px; }
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
  .intro ul { margin:6px 0 10px; padding-left:22px; font-size:15px; }
  .intro li { margin:3px 0; }
  details { margin:14px 0; background:#fffdf7; border:1px solid var(--line); padding:8px 14px; border-radius:3px; }
  summary { cursor:pointer; font-size:17px; }
  details h4 { margin:10px 0 2px; font-size:15px; font-weight:normal; color:var(--gold); }
  details ul { margin:0; padding-left:22px; font-size:14px; }
  code { font:13px ui-monospace, Menlo, monospace; background:#efe7d6; padding:0 3px; }
  #retired li { margin:3px 0; }
  @media (max-width: 900px) { .row { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header>
  <h1>Proof — keyframes, round 3</h1>
  <span class="count" id="count"></span>
  <span class="btns"><button onclick="onlyWeak()" id="wbtn">Show weak only</button><button class="primary" onclick="exportAnswers()">Copy my answers</button></span>
  <nav id="nav"></nav>
</header>
<main>
  <div class="intro">
  <p class="note">Painted overnight 2026-11-25/26 from your round-2 review. What changed this round:</p>
  <ul>__HEAD__</ul>
  <p class="note">One card per shot in film order; the time is on the -2sm master and the line is what is sung over it. The big picture is the keyframe (raw painting: motes, gold pencil, toner labels and headers are added later in code). Beside it are the three guides it was painted from, then any other takes. Badges: <span class="badge painted">painted</span> new this round, <span class="badge">carried from r2</span> unchanged, <span class="badge footage">footage</span> a still from the footage that now plays there, <span class="badge weak">weak</span> the painter was not happy (reason in the note), <span class="badge new">new id</span>. "Your r2 note" is what you wrote last round. Pick an option and/or write a note; untouched cards mean "fine as is". Answers are saved in this browser. When done, press <b>Copy my answers</b> and paste the text into the chat. Click any picture to enlarge it. Round 2 is at <a href="../r2/index.html">r2/index.html</a>.</p>
  </div>
  <details id="qs"><summary>Open questions from this round (<span id="qn"></span>)</summary><div id="qbody"></div><p class="note">Answer any of these in the note of the card concerned, or in the chat.</p></details>
  <div id="cards"></div>
  <h2 id="sec-retired">Retired this round</h2>
  <ul id="retired" class="note"></ul>
</main>
<div id="zoom" onclick="this.style.display='none'"><img alt=""></div>
<div id="out"><b>Paste this into the chat:</b><textarea id="outText" readonly></textarea><div><button class="primary" onclick="copyOut()">Copy to clipboard</button> <button onclick="document.getElementById('out').style.display='none'">Close</button> <span id="copied" class="note"></span></div></div>
<script>
const C = __DATA__;
const RETIRED = __RETIRED__;
const QS = __QS__;
const OPTS = ['Good', 'Redo (note)', 'Wrong staging (note)'];
const POPTS = ['Good', 'Change (note)'];
const KEY = 'proof-keyframes-r3-v1';
const state = JSON.parse(localStorage.getItem(KEY) || '{}');
const save = () => { localStorage.setItem(KEY, JSON.stringify(state)); count(); };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fig = (f) => !f ? '' : f[0] ? `<figure><img src="${esc(f[0])}" data-full="${esc(f[1])}" loading="lazy" alt=""><figcaption>${esc(f[2])}</figcaption></figure>` : `<div class="missing">missing: ${esc(f[1])}</div>`;
const optsOf = (c) => c.kind === 'shot' ? OPTS : POPTS;
const SRC = { painted: '<span class="badge painted">painted</span>', carried: '<span class="badge">carried from r2</span>', footage: '<span class="badge footage">footage</span>' };
function render() {
  const root = document.getElementById('cards'); const secs = []; let cur = null;
  for (const c of C) {
    if (c.sec !== cur) { cur = c.sec; secs.push(cur); const h = document.createElement('h2'); h.id = 'sec-' + secs.length; h.innerHTML = esc(cur) + (c.secTime ? `<small>${esc(c.secTime)}</small>` : ''); root.appendChild(h); }
    const s = state[c.id] || {}; const opts = optsOf(c);
    const d = document.createElement('div'); d.className = 'card ' + c.kind; d.id = 'c-' + c.id;
    if (c.status === 'weak') d.dataset.weak = '1';
    let h = `<h3><span class="t">${esc(c.time)}</span> ${esc(c.kind === 'plate' ? c.title : c.id)}${c.set ? `<span class="set">${esc(c.set)}</span>` : ''}${c.kind === 'plate' ? '<span class="badge footage">plate</span>' : (SRC[c.source] || '')}${c.status === 'weak' ? '<span class="badge weak">weak</span>' : ''}${c.isnew ? '<span class="badge new">new id</span>' : ''}</h3>`;
    if (c.lyric) h += `<p class="lyric">“${esc(c.lyric.replace(/^["“]+|["”]+$/g, ''))}”</p>`;
    if (c.header) h += `<p class="ctx">${esc(c.header)}</p>`;
    if (c.ctx) h += `<p class="ctx">${esc(c.ctx)}</p>`;
    if (c.slot) h += `<p class="ctx"><b>Footage:</b> ${esc(c.slot.source || '')}: <code>${esc(c.slot.footage)}</code> ${c.slot.footage_start_s}-${c.slot.footage_end_s} s, at ${c.slot.speed}x, song ${esc(c.slot.song_time)}${c.slot.note ? ' · ' + esc(c.slot.note) : ''}</p>`;
    if (c.diff) h += `<p class="ctx diff"><b>Times differ:</b> showing footage_slots.json's (the plan's); ${esc(c.diff)}.</p>`;
    if (c.kind === 'plate') {
      h += '<div class="imgs">' + c.imgs.map(fig).join('') + '</div>';
    } else {
      h += '<div class="row"><div class="kf">' + (c.kf ? fig(c.kf) : '<div class="missing">no picture</div>') + '</div><div class="side">';
      if (c.takes.length) h += `<div class="note">${c.kind === 'footage' ? 'set agent\'s still' : 'other takes'}</div><div class="takes">` + c.takes.map(fig).join('') + '</div>';
      if (c.guides.length) h += '<div class="note">guides</div><div class="takes">' + c.guides.map(fig).join('') + '</div>';
      h += '</div></div>';
      if (c.note) h += `<p class="ctx"><b>Painter:</b> ${esc(c.note)}</p>`;
      if (c.jade) h += `<p class="ctx jade"><b>Your r2 note:</b> ${esc(c.jade)}</p>`;
    }
    h += '<div class="opts">' + opts.map((o, i) => `<label><input type="radio" name="${c.id}" value="${i}" ${s.choice == i ? 'checked' : ''}> ${esc(o)}</label>`).join('') + '</div>';
    h += `<textarea placeholder="Note (optional): what to change, or e.g. 'use the other take'" data-id="${c.id}">${esc(s.note || '')}</textarea>`;
    d.innerHTML = h; root.appendChild(d);
  }
  document.getElementById('nav').innerHTML = secs.map((s, i) => `<a href="#sec-${i + 1}">${esc(s.split(':')[0])}</a>`).join('') + '<a href="#qs">Questions</a><a href="#sec-retired">Retired</a>';
  document.getElementById('retired').innerHTML = RETIRED.map(([id, set, why, jade]) => `<li><b>${esc(id)}</b> <span class="set">(${esc(set)})</span>: ${esc(why)}${jade ? ` <i>Your r2 note: ${esc(jade)}</i>` : ''}</li>`).join('');
  let nq = 0, qb = '';
  for (const [set, qs] of Object.entries(QS)) { nq += qs.length; qb += `<h4>${esc(set)}</h4><ul>` + qs.map(q => `<li>${esc(q)}</li>`).join('') + '</ul>'; }
  document.getElementById('qbody').innerHTML = qb; document.getElementById('qn').textContent = nq;
  root.addEventListener('change', (e) => { if (e.target.type === 'radio') { (state[e.target.name] ||= {}).choice = +e.target.value; save(); mark(); } });
  root.addEventListener('input', (e) => { if (e.target.tagName === 'TEXTAREA') { (state[e.target.dataset.id] ||= {}).note = e.target.value; save(); mark(); } });
  root.addEventListener('click', (e) => { if (e.target.tagName === 'IMG') { const z = document.getElementById('zoom'); z.querySelector('img').src = e.target.dataset.full || e.target.src; z.style.display = 'flex'; } });
  mark(); count();
}
const answered = (id) => { const s = state[id]; return s && (s.choice !== undefined || (s.note || '').trim()); };
function mark() { for (const c of C) document.getElementById('c-' + c.id).classList.toggle('answered', !!answered(c.id)); }
function count() { const n = C.filter(c => c.kind !== 'plate').length, w = C.filter(c => c.status === 'weak').length; document.getElementById('count').textContent = `${C.filter(c => answered(c.id)).length} of ${C.length} cards answered · ${n} shots, ${w} marked weak`; }
let weakOnly = false;
function onlyWeak() { weakOnly = !weakOnly; document.getElementById('wbtn').textContent = weakOnly ? 'Show all' : 'Show weak only'; for (const c of C) document.getElementById('c-' + c.id).style.display = (!weakOnly || c.status === 'weak') ? '' : 'none'; }
function exportAnswers() {
  const lines = ['Keyframes r3 (from media/keyframes/r3/index.html):'];
  for (const c of C) {
    if (!answered(c.id)) continue;
    const s = state[c.id], opts = optsOf(c);
    lines.push(`- ${c.id}: ${s.choice !== undefined ? opts[s.choice] : '(no option picked)'}${(s.note || '').trim() ? ' — ' + s.note.trim().replace(/\n+/g, ' / ') : ''}`);
  }
  if (lines.length === 1) lines.push('(nothing answered yet)');
  document.getElementById('outText').value = lines.join('\n');
  document.getElementById('out').style.display = 'flex'; document.getElementById('copied').textContent = '';
}
function copyOut() { const t = document.getElementById('outText'); t.select(); navigator.clipboard?.writeText(t.value).then(() => document.getElementById('copied').textContent = 'Copied.', () => { document.execCommand('copy'); document.getElementById('copied').textContent = 'Copied.'; }); }
render();
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
</script>
</body></html>
"""

if __name__ == "__main__":
    main()
