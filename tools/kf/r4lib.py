#!/usr/bin/env python3
"""Shared prompt builder for keyframes round 4 (media/keyframes/r4/<set>/_prompts/_make.py imports this).

Every r4 prompt is assembled at BUILD time from the shot's sidecar (media/layout/<set>/<SHOT>.json), so re-running a
set's _make.py after a re-render picks up the new camera, gaze targets, costume colours and held objects. Nothing here
calls an image model. The brief is media/keyframes/r4/_brief_r4.md.

A set's _make.py declares:
    CAST  = {sidecar figure key: Person(...)}            who each 3D figure is, and the garment words
    LOOK  = {gaze target name: "words"}                  what a look target is, in words (else a guess from the name)
    REFS  = {key: (path, caption)}                       cast sheets / canonical art, by key
    SHOTS = {SHOT: dict(refs=[keys], text="...")}        the shot's prose, with tokens (below)
and calls build(SET, SHOTS, CAST, LOOK, REFS). Output: <SHOT>.txt + _jobs.json (refs and takes per shot) beside the
_make.py; the set's _run.sh then paints them with tools/kf/r4_run.py (kf.py --route codex, 2 takes).

Tokens in a shot's text, replaced from the sidecar:
    <<FRAMING>>   one framing sentence: lens, camera height and tilt, where each visible head / hand sits in image 1,
                  plus the shot's own crop clause (dict key `crop`); `behind=[figure keys]` marks heads seen from behind
    (spec key `cast={figure key: Person}` overrides figures for one shot)
    (spec key `targets={figure key: "words"}` overrides what a figure looks at, e.g. for unnamed vector targets)
    <<GUIDES>>    what images 1-3 are (real bodies, real colours, real textures, aimed eyes)
    <<GAZE>>      one sentence per visible figure: what it looks at (sidecar gaze look_target), face drawn or not
    <<WEAR>>      clothes per visible figure, colours NAMED from the sidecar costume hexes (Person.wear templates)
    <<HOLDS>>     the held objects in the sidecar (hands support them)
    <<ART>>       the canonical art / logo images passed for this shot, to be copied unchanged
    <<IMG:key>>   "image N" for a ref key (the ref's position in the --ref list)
    <<RULES>>     the r4 closing rules (no text or captions, no glow, ...); spec key `lettering` = the one allowed
                  exception (e.g. "the DOS program on the screen"), named in the rules
Any of FRAMING, GUIDES, GAZE, WEAR, RULES missing from the text is appended (in that order) so no prompt lacks them.
"""
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LAYOUT = os.path.join(ROOT, "media", "layout")
R4 = os.path.join(ROOT, "media", "keyframes", "r4")
TAKES = 2

# ---------------------------------------------------------------------------------------------------------- guides
GUIDE_REFS = [
    ("contour", "the layout drawing from the 3D set: camera, composition and the outline of every person and object "
                "(real body shapes, eyes aimed where each person looks; lines only, no shadows drawn)"),
    ("form", "the same view as evenly lit clay in the REAL colours: clothes in their real costume colours, skin and "
             "hair; wall art, book spines and clothing logos are the real fixed images; no cast shadows"),
    ("light", "the light map: white = in the light, pale grey = weak light, mid grey = shade (where the light falls, "
              "not how dark the picture is)"),
]
GUIDES = ("Images 1-3 come from a 3D model of the real place. Image 1 (lines) fixes the camera, the composition and "
          "the outline and size of every person and object. Image 2 (clay) shows every surface in its REAL colour: the "
          "clothes are in their real costume colours, the people are real body shapes (not mannequins), the eyes are "
          "aimed exactly where each person looks, and any wall art, book spine or clothing logo is the real, fixed image "
          "that must reappear unchanged. Image 3 says only where the light falls, not how dark the painting is. Paint "
          "real people and real things over them; do not keep the model's even mechanical line or its flat clay shading.")
RULES = ("Not anime, not cel shading, not a photograph, not a 3D or digital render, no dramatic chiaroscuro, no black "
         "shadows, no glow, no rays, no haze, no bloom. No text, no captions, no subtitles, no letters, no numbers, no "
         "signature, no seal, no border, no frame: captions and labels are added later in code and are never painted. "
         "Hands: count the fingers (five on every hand) and keep each hand exactly where image 1 puts it; a hand that "
         "holds something supports it (fingers round it or the palm under it), nothing floats.")

# ------------------------------------------------------------------------------------------------- shared wording
FIRST_LOVE_HAIR = ("His hair is 60-70% dark chocolate brown: a warm, rich dark brown, clearly brown in the light, never "
                   "black, not auburn or red. The cut is exactly as on his hair sheets: a top layer with a distinct step "
                   "over a lower part buzzed and grown out about six months; the top is flat-ish and slightly tousled, "
                   "thin at its edge, with no level rim: not a bowl, not a mushroom.")
FIRST_LOVE_FACE = ("He is seen from behind: the back of his head and his hair only; his face is turned fully away and is "
                   "never shown: no eye, no nose, no mouth, no cheek in profile.")
FIRST_LOVE_REFS = {
    "fl_hair": ("cast/first_love/fl_B_backhead_neck_v6.png", "his back-of-head sheet, the hair anchor (cut and step; "
                "the colour is the 60-70% dark chocolate brown in the prompt)"),
    "fl_ots": ("cast/first_love/fl_G_ots_hair_v6.png", "his over-the-shoulder hair sheet (how the hair reads from behind "
               "and the side; face never shown)"),
    "fl_hands": ("cast/first_love/fl_D_hands_forearms_v4.jpg", "his hands and forearms sheet (the current one; hands only)"),
}
PAPER_KEYBOARD = ("The paper keyboard is a flat printed paper strip taped down, 37 keys from C to C at real piano-key "
                  "size, with white paper margins; its black keys run in groups of 2-3-2-3-2-3, with NO black key "
                  "between E and F or between B and C; the keys are printed and never press down. Count the keys.")
SHANGHAI_FEET = ("Indoors in Shanghai everyone wears cotton-padded cloth slippers over socks: no outdoor shoes anywhere in the flat.")
BASEMENT_GLOW = ("The computer screen's light is COOL WHITE: a clean, cool, faintly blue-white light on whatever faces "
                 "it, never deep blue, never warm.")
CAPTIONS = "Captions are added at compositing time and are never painted."

# -------------------------------------------------------------------------------------------------------- colours
NAMED = [  # (name, hex): plain painter's names, nearest in CIE Lab wins
    ("white", "f4f2ec"), ("off-white", "ece6d8"), ("cream", "efe3c4"), ("ivory", "f1ebd6"), ("oatmeal", "d9ccb0"),
    ("beige", "d6c4a0"), ("sand", "c8b48c"), ("khaki-tan", "b89e72"), ("camel", "b8895a"), ("tan", "a7855c"),
    ("light grey", "c8c8c8"), ("pale grey", "dedede"), ("heather grey", "a9a9a6"), ("mid grey", "8a8a8c"),
    ("warm grey", "8c857c"), ("charcoal grey", "4a4a4c"), ("dark charcoal", "34343a"), ("near-black", "222226"),
    ("black", "141416"), ("slate grey", "6a6f7a"), ("blue-grey", "6f7f9a"), ("pale blue-grey", "b8c4d8"),
    ("powder blue", "b0c4e0"), ("pale blue", "a8c4e4"), ("chambray blue", "8aa4c8"), ("light-blue denim", "8fa8c8"),
    ("mid-blue denim", "5a7aa8"), ("slate blue", "5a6a8a"), ("dark slate blue", "4a5a6a"), ("indigo", "34406a"),
    ("navy", "2c3450"), ("dark navy", "232a3c"), ("royal blue", "2c4fa8"), ("teal", "2c7a7a"),
    ("sage green", "8a9a80"), ("grey-green", "6a7a68"), ("forest green", "3a5a3e"), ("bottle green", "1f4a30"),
    ("olive", "6a6a3a"), ("mustard", "c8a030"), ("pale yellow", "efe2a0"), ("yellow", "f2c84a"), ("orange", "e8792c"),
    ("rust", "a8542c"), ("terracotta", "b06a50"), ("brick red", "8a3a3a"), ("maroon", "6e3a33"), ("red", "c03030"),
    ("dusty rose", "c8909a"), ("pink", "e8a8b8"), ("mauve", "8a5a6a"), ("plum", "5a3048"), ("lavender-grey", "a8a4b8"),
    ("dark brown", "4a3226"), ("chocolate brown", "352219"), ("mid brown", "7a5438"), ("skin", "d9ab88"),
]


def _lab(h):
    h = h.lstrip("#")
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    x = (0.4124 * lin[0] + 0.3576 * lin[1] + 0.1805 * lin[2]) / 0.95047
    y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
    z = (0.0193 * lin[0] + 0.1192 * lin[1] + 0.9505 * lin[2]) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def colour_name(h):
    """'#b8c4d8' / 0xb8c4d8 / 'b8c4d8' -> the nearest plain colour name."""
    if h is None:
        return None
    if isinstance(h, int):
        h = f"{h:06x}"
    L = _lab(h)
    return min(NAMED, key=lambda n: sum((a - b) ** 2 for a, b in zip(L, _lab(n[1]))))[0]


# --------------------------------------------------------------------------------------------------------- people
class Person:
    """name: how the prompt calls them ('little Jade (age 7)'); pron: 'she'/'he'; face: True (drawn), False (never:
    first love), 'unreached' (strangers); wear: {slot: template with {c} = colour name from the sidecar costume}, slots
    top / legs / sock / band / apron / dress, plus 'extra' (no colour: shoes, glasses...); fallback: {slot: hex} used
    when the sidecar has no costume for this figure (old renders)."""

    def __init__(self, name, pron="she", face=True, wear=None, fallback=None, first_love=False):
        self.name, self.pron, self.face, self.wear, self.fallback = name, pron, face, wear or {}, fallback or {}
        self.first_love = first_love
        if first_love:
            self.face = False

    @property
    def poss(self):
        return {"she": "her", "he": "his", "they": "their"}.get(self.pron, "their")


def load(set_, shot):
    p = os.path.join(LAYOUT, set_, shot + ".json")
    if not os.path.exists(p):
        raise SystemExit(f"no sidecar {os.path.relpath(p, ROOT)}: render the set first")
    return json.load(open(p))


# ------------------------------------------------------------------------------------------------------- geometry
def _mat(cols):
    return [[cols[c * 4 + r] for c in range(4)] for r in range(4)]


def cam_space(sc, w):
    """world point -> camera space (x right, y up, z toward the viewer: in front of the camera is z < 0)."""
    V = _mat(sc["camera"]["viewMatrix"])
    v = list(w) + [1]
    return [sum(V[r][c] * v[c] for c in range(4)) for r in range(3)]


def where(px, W=1920, H=1080):
    """pixel -> 'the upper left' / 'the centre' / ... (thirds); None when off the frame."""
    x, y = px
    if not (0 <= x <= W and 0 <= y <= H):
        return None
    col = ["left", "centre", "right"][min(2, int(3 * x / W))]
    row = ["upper", "middle", "lower"][min(2, int(3 * y / H))]
    if row == "middle":
        return "the centre" if col == "centre" else f"the {col}"
    return f"the {row} {'middle' if col == 'centre' else col}"


def off_frame(sc, world):
    """where an out-of-frame world point lies, in words."""
    x, y, z = cam_space(sc, world)
    side = []
    if z > 0:
        return "out of frame, behind the camera" + (" to the left" if x < -0.15 else " to the right" if x > 0.15 else "")
    hf = math.radians(sc["camera"].get("hfov_deg", 50)) / 2
    vf = math.radians(sc["camera"].get("vfov_deg", 30)) / 2
    if abs(x) > -z * math.tan(hf):
        side.append("left" if x < 0 else "right")
    if abs(y) > -z * math.tan(vf):
        side.append("above" if y > 0 else "below")
    return "out of frame " + (" and ".join(("to the " + s) if s in ("left", "right") else s for s in side) or "nearby")


FLOOR_Y = 0.0   # a set's _make.py may set L.FLOOR_Y (floor height in the set's world) or None to leave the height out


def _cam_words(sc):
    cam = sc["camera"]
    pos, tgt = cam["position"], cam["target"]
    d = [t - p for t, p in zip(tgt, pos)]
    pitch = math.degrees(math.atan2(d[1], math.hypot(d[0], d[2])))
    tilt = ("looking straight down" if pitch < -70 else "looking steeply down" if pitch < -30 else "looking down" if pitch < -12
            else "looking slightly down" if pitch < -4 else "level" if pitch < 4 else "looking slightly up" if pitch < 12 else "looking up")
    lens = f"a {cam['lens_mm']:g} mm lens" if cam.get("lens_mm") else "an orthographic view"
    if FLOOR_Y is None:
        return f"{lens}, the camera {tilt}"
    return f"{lens}, the camera {pos[1] - FLOOR_Y:.2f} m above the floor, {tilt}"


# --------------------------------------------------------------------------------------------------------- blocks
def framing(sc, cast, crop="", behind=()):
    parts = []
    for who, h in (sc.get("heads") or {}).items():
        if who in cast and h.get("in_frame") and h.get("visible") is not False:
            w = where(h["px"])
            if w:
                p = cast[who]
                parts.append(f"{p.name}'s head at {w}" if p.face is True and who not in behind else f"{p.name}'s head (seen from behind) at {w}" if who in behind or p.first_love else f"{p.name}'s head (face unreached) at {w}")
    for k, h in (sc.get("hands") or {}).items():
        if not isinstance(h, dict) or "px" not in h:
            continue
        who, _, side = k.partition(".")
        if who in cast and h.get("in_frame") and h.get("visible") and h.get("shape") not in ("relax", None):
            w = where(h["px"])
            if w:
                parts.append(f"{cast[who].name}'s {'left' if side == 'L' else 'right'} hand at {w}")
    s = f"FRAMING. Follow image 1 exactly ({_cam_words(sc)})"
    if parts:
        s += ": " + "; ".join(parts)
    if crop:
        s += "; " + crop.rstrip(".")
    return s + "."


def gaze(sc, cast, look, targets=None):
    out = []
    for who, g in (sc.get("gaze") or {}).items():
        if who not in cast:
            continue
        h = (sc.get("heads") or {}).get(who, {})
        if not h.get("in_frame"):
            continue
        p, lt = cast[who], g.get("look_target") or {}
        name = lt.get("name")
        what = (targets or {}).get(who) or (look.get(name) if name else None)
        if what is None and name:
            what = guess_target(name, cast)
        tp = g.get("target_px")
        place = None
        if tp and g.get("target_in_front"):
            place = where(tp)
        if place is None and lt.get("world"):
            place = off_frame(sc, lt["world"])
        if what is None:
            what = "the point where image 1 aims " + p.poss + " eyes"
        loc = f" ({'at ' + place if place and not place.startswith('out') else place})" if place else ""
        if p.first_love:
            out.append(f"{p.name}'s head is turned toward {what}{loc}, away from us. {FIRST_LOVE_FACE}")
        elif p.face is True:
            out.append(f"{p.name} looks at {what}{loc}: {p.poss} eyes and head turned to it exactly as in image 1, "
                       f"irises aimed at it (not at the camera unless that is the target)")
        else:
            out.append(f"{p.name}'s head is turned toward {what}{loc} (face unreached)")
    if not sc.get("gaze"):
        print(f"  note: {sc['shot']} has no gaze block (render predates aimed eyes): write the look target by hand", file=sys.stderr)
    return ("WHERE EACH PERSON LOOKS. " + " ".join(s.rstrip(".") + "." for s in out)) if out else ""


def guess_target(name, cast):
    n = name.split(":")[0]
    if n in cast:
        rest = name.split(":")[1] if ":" in name else ""
        return f"{cast[n].name}" + (f"'s {rest}" if rest else "")
    if n.startswith("to") and n[2:3].isupper():
        n = n[2:]
    return "the " + re.sub(r"(?<=[a-z])(?=[A-Z])", " ", n).replace("_", " ").lower()


def wear(sc, cast, who_list=None):
    cos = sc.get("costume") or {}
    out = []
    for who, p in cast.items():
        if who_list is not None and who not in who_list:
            continue
        if not p.wear or (who_list is None and not _visible(sc, who)):
            continue
        c = cos.get(who) or {}
        bits = []
        for slot, tmpl in p.wear.items():
            if slot == "extra":
                continue
            hx = c.get(slot) or p.fallback.get(slot)
            name = colour_name(hx) if hx else None
            if "{c}" in tmpl and not name:
                print(f"  note: {sc['shot']} {who}.{slot}: no colour in the sidecar or fallback", file=sys.stderr)
                name = "(colour as in image 2)"
            bits.append(tmpl.replace("{c}", name or ""))
        if p.wear.get("extra"):
            bits.append(p.wear["extra"])
        if not c and p.fallback:
            print(f"  note: {sc['shot']} {who}: sidecar has no costume block, colours from the set's fallback", file=sys.stderr)
        out.append(f"{p.name}: " + "; ".join(bits))
    return ("CLOTHES (the colours are the real ones, as in image 2). " + " ".join(s.rstrip(".") + "." for s in out)) if out else ""


def holds(sc, cast, words=None):
    """sidecar holds[] (engine main.js holdsFor): {object, fixed, hands: [{who, arm, shape, touching_only}]}."""
    words = words or {}
    out = []
    for o in sc.get("holds") or []:
        lab = o.get("object")
        if not lab or o.get("fixed"):
            continue
        hs = []
        for h in o.get("hands") or []:
            w, n = h.get("who"), h.get("arm")
            hv = (sc.get("hands") or {}).get(f"{w}.{n}", {})
            if w in cast and hv.get("in_frame", True):
                hs.append((f"{cast[w].name}'s" if not hs else cast[w].poss) + f" {'left' if n == 'L' else 'right'} hand"
                          + (" (touching it)" if h.get("touching_only") else ""))
        if not hs:
            continue
        thing = words.get(lab, re.sub(r"[_\-]+", " ", lab))
        out.append(f"{' and '.join(hs) or 'a hand'} {'hold' if len(hs) > 1 else 'holds'} {thing}, supporting its weight")
    return ("HELD THINGS. " + "; ".join(out) + ".") if out else ""


def _visible(sc, who):
    h = (sc.get("heads") or {}).get(who, {})
    if h.get("in_frame"):
        return True
    return any(k.split(".")[0] == who and isinstance(v, dict) and v.get("in_frame") for k, v in (sc.get("hands") or {}).items())


# ---------------------------------------------------------------------------------------------------------- build
def compose(set_, shot, spec, cast, look, refs):
    sc = load(set_, shot)
    if spec.get("cast"):
        cast = {**cast, **spec["cast"]}   # per-shot override of some figures (another costume, another name)
    keys = list(spec.get("refs", [])) + [k for k in spec.get("art", []) if k not in spec.get("refs", [])]
    ref_list = [(f"media/layout/{set_}/{shot}_{m}.png", cap) for m, cap in GUIDE_REFS]
    for k in keys:
        if k not in refs:
            raise SystemExit(f"{set_}/{shot}: unknown ref key {k}")
        ref_list.append(refs[k])
    idx = {k: i + 4 for i, k in enumerate(keys)}
    art_keys = spec.get("art", [])
    art = ""
    if art_keys:
        art = ("FIXED ART. " + " ".join(f"Image {idx[k]} is the canonical {refs[k][1]}." for k in art_keys)
               + " Wherever it appears in images 1-2, paint exactly that image, unchanged: the same picture, colours and "
               "layout, at the size and angle image 1 gives it. Never invent, alter or swap wall art, book spines or logos.")
    text = spec["text"]
    rep = {
        "FRAMING": framing(sc, cast, spec.get("crop", ""), spec.get("behind", ())),
        "GUIDES": GUIDES,
        "GAZE": spec.get("gaze") or gaze(sc, cast, look, spec.get("targets")),
        "WEAR": wear(sc, cast, spec.get("wear_who")),
        "HOLDS": holds(sc, cast, spec.get("hold_words")),
        "ART": art,
        "RULES": RULES if not spec.get("lettering") else RULES.replace(
            "No text, no captions", f"The ONLY lettering is {spec['lettering']}, copied from image 2 as it is; otherwise no text, no captions"),
    }
    for k in ("FRAMING", "GUIDES", "GAZE", "WEAR", "ART", "RULES"):
        if f"<<{k}>>" not in text and rep[k]:
            text = text.rstrip() + f"\n\n<<{k}>>"
    for k, v in rep.items():
        text = text.replace(f"<<{k}>>", v)
    text = re.sub(r"<<IMG:([\w\-]+)>>", lambda m: f"image {idx[m.group(1)]}", text)
    if "<<" in text:
        raise SystemExit(f"{set_}/{shot}: unresolved token {re.search(r'<<[^>]*>>', text).group(0)}")
    text = re.sub(r"(^|[.!?]\s+|\n)image (\d)", lambda m: m.group(1) + "Image " + m.group(2), text)
    text = re.sub(r"(^|[.!?]\s+|\n)([a-z])", lambda m: m.group(1) + m.group(2).upper(), text)
    text = re.sub(r"\b(dark|pale|light) \1\b", r"\1", text)
    text = re.sub(r"\b([Aa]) (?=[aeiou])(?!one|uni|use)", r"\1n ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"
    for p, _ in ref_list:
        if not os.path.exists(os.path.join(ROOT, p)):
            print(f"  WARNING {shot}: missing ref {p}", file=sys.stderr)
    return text, ref_list


RUN_SH = """#!/bin/sh
# r4 {set}: rebuild the prompts from the CURRENT renders, then paint 2 takes per shot on the FREE Codex route only
# (tools/kf/r4_run.py -> tools/kf/kf.py --route codex; no paid fallback), at most two jobs at a time, in tmux session
# proof-kf4-{set}. Usage: sh _run.sh [SHOT ...] [--dry]     (written by tools/kf/r4lib.py build())
set -e
cd /home/jade/Documents/proof
export KF_SESSION=proof-kf4-{set}
python3 media/keyframes/r4/{set}/_prompts/_make.py
exec python3 tools/kf/r4_run.py {set} "$@"
"""


def build(set_, shots, cast, look, refs, only=None, show=False):
    here = os.path.join(R4, set_, "_prompts")
    os.makedirs(here, exist_ok=True)
    jobs = {}
    for shot, spec in shots.items():
        if only and shot not in only:
            continue
        text, ref_list = compose(set_, shot, spec, cast, look, refs)
        with open(os.path.join(here, shot + ".txt"), "w") as f:
            f.write(text)
        jobs[shot] = {"prompt": f"media/keyframes/r4/{set_}/_prompts/{shot}.txt",
                      "outs": [f"media/keyframes/r4/{set_}/{shot}_v{i + 1}.jpg" for i in range(spec.get("takes", TAKES))],
                      "refs": [f"{p}:{c}" for p, c in ref_list]}
        if show:
            print(f"===== {set_}/{shot} ({len(ref_list)} refs) =====")
            for i, (p, c) in enumerate(ref_list):
                print(f"  image {i + 1}: {p}  [{c[:70]}]")
            print(text)
    if not only:
        with open(os.path.join(here, "_jobs.json"), "w") as f:
            json.dump(jobs, f, indent=1)
        run = os.path.join(here, "_run.sh")
        with open(run, "w") as f:
            f.write(RUN_SH.format(set=set_))
        os.chmod(run, 0o755)
    print(f"{set_}: {len(jobs)} prompts -> media/keyframes/r4/{set_}/_prompts/" + ("" if only else " (+ _jobs.json)"))
    return jobs


def main_args():
    """--show prints every prompt; any other args are shot ids to build only."""
    a = sys.argv[1:]
    return [x for x in a if not x.startswith("--")] or None, "--show" in a
