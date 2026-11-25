#!/usr/bin/env python3
"""Composite every picked keyframe: media/keyframes/<folder>/picks.json + comp.json -> media/keyframes/_comp/<folder>/<SHOT>.jpg

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY -m tools.kf.comp_all [folder ...]          # all folders, or only the named ones

What this pass does to a pick, and what it deliberately does not:
- The still is keyed onto the film's one sheet of paper with a FIXED source ground (the cream the image models paint on).
  Letting comp.py estimate the ground from a full-bleed still takes the shade wash for paper and bleaches faces.
- Gold marks, toner labels and headers come from the folder's comp.json (written by whoever painted the set, in 1920x1080
  pixels read off the pick). Entries the compositor cannot draw are skipped and reported, never guessed.
- The beam is NOT lifted by default: the models already leave light as bare paper. Lifting the set's light volume to
  paper is done only for shots listed in BEAM below, where the shaft through the air is the picture, and each has
  hand-set parameters. A shot's comp.json can also ask for it with "beam": {...} in comp.py's own format.
- Motes are laid only where there is a mask or a polygon to put them in.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT)
from tools.kf import comp  # noqa: E402

KF = os.path.join(ROOT, "media", "keyframes")
GROUND = [0.965, 0.90, 0.81]          # Codex / gpt-image "cream xuan paper", measured on the look-test stills
GOLD_KEYS = {"ring": ("at", "r"), "dots": ("path",), "line": ("path",), "underline": ("from", "to"),
             "text": ("at", "text"), "ticks": ("at", "n")}
GOLD_OPT = ("gap", "start", "cw", "size", "width", "pressure", "seed", "align", "tally")
TEXT_OK = set("0123456789?.:-=+/ ")

# Shots where the shaft of light through the air is lifted to bare paper. Values tuned by eye on the pick.
BEAM = {
    # the girl, as painted on AD_wide_v2b (polygon read off the pick): nothing inside it is lifted
    ("attic88_day", "AD_wide"): {"lift": 0.9, "line_keep": 0.7, "feather": 9, "rough": 1.0, "rim": 0.25, "fill_holes": True,
                                 "protect": [[[450, 590], [530, 560], [610, 600], [620, 740], [610, 800], [680, 890], [680, 930],
                                              [650, 940], [660, 1000], [580, 1060], [390, 1060], [335, 980], [350, 910],
                                              [400, 810], [410, 740]]]},
    # along her eye-line the camera sits just above the shaft, so the set's mask is half the frame: a light lift only,
    # which leaves the painter's own pale shaft and still gives the motes somewhere to be
    ("attic88_day", "AD_mote"): {"lift": 0.35, "line_keep": 0.9, "feather": 14, "rough": 1.0, "rim": 0.1, "fill_holes": True},
}


# Words for toner labels a painter left as TODO. Every one is a line someone else says about her in the song, so the
# label is "their reading, pre-printed" (plan: "Toner is theirs"). Proposals; Jade has not seen them.
TONER_WORDS = {
    ("faces", "AD_out"): "YOU NEED FACIAL EXPRESSIONS",
    ("faces", "AD_out_b"): "BUT NOT LIKE THAT",
    ("kitchen90", "K1_question"): "DID SHE UNDERSTAND OR JUST PATTERN MATCH?",
    ("office91", "PC1"): "SHE DOESN'T TALK LIKE OTHER CHILDREN",
    ("office91", "PC4"): "HER FACE DOESN'T MAKE MUCH EXPRESSION",
}


# Labels placed by hand (position read off the pick so the words clear her hair). These replace the shot's toner list.
TONER_FORCE = {
    ("faces", "AD_out"): [{"text": "YOU NEED FACIAL EXPRESSIONS", "at": [1500, 330], "size": 25, "rot": -2, "gen": 3}],
    ("faces", "AD_out_b"): [{"text": "BUT NOT LIKE THAT", "at": [1500, 330], "size": 25, "rot": 1.5, "gen": 4}],
    ("office91", "PC1"): [{"text": "SHE DOESN'T TALK LIKE OTHER CHILDREN", "at": [470, 300], "size": 24, "rot": -1.5, "gen": 2}],
    ("kitchen90", "K1_question"): [{"text": "DID SHE UNDERSTAND OR JUST PATTERN MATCH?", "at": [440, 105], "size": 21, "rot": -1, "gen": 4}],
}


def _load(p):
    try:
        return json.load(open(p))
    except Exception as e:  # noqa: BLE001
        print(f"  ! cannot read {os.path.relpath(p, ROOT)}: {e}")
        return {}


def _gold(items, warn):
    out = []
    flat = []
    staged = [g for g in items or [] if isinstance(g, dict) and g.get("type") == "dots" and isinstance(g.get("n"), int)
              and isinstance(g.get("at"), list)]
    if len(staged) > 1:                         # stages of one count over time (1, 2, 4, 8): a still shows the last
        last = max(staged, key=lambda g: g["n"])
        items = [g for g in items if g not in staged or g is last]
    for g in items or []:                       # a painter may give loose dots as {"type": "dots", "at": [[x, y], ...]}
        if isinstance(g, dict) and g.get("type") == "dots" and "path" not in g and "points" not in g \
                and isinstance(g.get("at"), list) and g["at"] and isinstance(g["at"][0], list):
            flat += [{"type": "dots", "path": [[x, y], [x + 2, y]], "gap": 60, "size": g.get("size", 11)} for x, y in g["at"]]
        else:
            flat.append(g)
    for g in flat:
        if isinstance(g, dict) and g.get("type") == "ring" and "r" not in g and "rx" in g and "ry" in g:
            g = {**g, "r": (g["rx"] + g["ry"]) / 2}
        if not isinstance(g, dict) or g.get("type") not in GOLD_KEYS:
            warn(f"gold skipped (type): {str(g)[:70]}")
            continue
        if g["type"] in ("dots", "line") and "path" not in g and isinstance(g.get("points"), list):
            g = {**g, "path": g["points"]}
        need = GOLD_KEYS[g["type"]]
        if any(k not in g for k in need):
            warn(f"gold skipped (missing {need}): {str(g)[:70]}")
            continue
        if g["type"] == "text" and not set(str(g["text"])) <= TEXT_OK:
            warn(f"gold text skipped (the pencil hand only has digits and ?): {g['text']!r}")
            continue
        item = {k: g[k] for k in ("type", *need, *GOLD_OPT) if k in g}
        if g["type"] == "text":                      # numerals land on painted objects: press harder so they read
            item.setdefault("pressure", 1.7)
            item.setdefault("width", 3.4)
        out.append(item)
    return out


def _toner(items, warn, key=None):
    out = []
    for t in items or []:
        if not isinstance(t, dict) or "text" not in t or "at" not in t:
            continue
        txt = str(t["text"]).strip()
        if (not txt or "TODO" in txt.upper()) and key in TONER_WORDS and not out:
            txt = TONER_WORDS[key]
            t = {**t, "size": min(t.get("size", 30), 30)}
        if not txt or "TODO" in txt.upper():
            warn(f"toner left out (no words chosen yet) at {t.get('at')}")
            continue
        out.append({"text": txt.upper(), "at": t["at"], "size": t.get("size", 36), "rot": t.get("rot", -2), "gen": t.get("gen", 3)})
    return out


def one(folder, shot, pick, cj):
    notes = []
    warn = notes.append
    src = os.path.join("media", "keyframes", folder, pick)
    spec = {"src": src, "ground": GROUND, "out": os.path.join("media", "keyframes", "_comp", folder, shot + ".jpg")}
    c = cj.get(shot) if isinstance(cj.get(shot), dict) else {}
    if isinstance(c.get("ground"), list):
        spec["ground"] = c["ground"]
    mask = c.get("beam_mask") if isinstance(c.get("beam_mask"), str) else None
    if mask and not os.path.exists(os.path.join(ROOT, mask)):
        warn(f"beam mask not found: {mask}")
        mask = None
    beam = None
    if isinstance(c.get("beam"), dict) and c["beam"].get("mask"):
        beam = dict(c["beam"])
    elif (folder, shot) in BEAM and mask:
        beam = {"mask": mask, **BEAM[(folder, shot)]}
        if isinstance(c.get("protect"), list):
            beam["protect"] = c["protect"]
    hero = c.get("hero_mote") if isinstance(c.get("hero_mote"), list) and len(c.get("hero_mote")) == 2 else None
    motes = c.get("motes") if isinstance(c.get("motes"), dict) else None
    if beam:
        spec["beam"] = beam
        spec["motes"] = {"seed": 11, "n": 60, "region": "beam", "hero": hero, **(motes or {})}
    elif mask and (hero or motes):
        spec["beam"] = {"mask": mask, "lift": 0.0, "rim": 0.0}          # the mask only says where motes may sit
        spec["motes"] = {"seed": 11, "n": 40, "region": "beam", "hero": hero, **(motes or {})}
    elif motes and isinstance(motes.get("region"), list):
        spec["motes"] = {"seed": 11, "n": 30, "hero": hero, **motes}
    elif hero:
        x, y = hero
        spec["motes"] = {"seed": 11, "n": 1, "hero": hero, "region": [[x - 60, y - 60], [x + 60, y - 60], [x + 60, y + 60], [x - 60, y + 60]]}
    g = _gold(c.get("gold"), warn)
    if g:
        spec["gold"] = g
    t = TONER_FORCE.get((folder, shot)) or _toner(c.get("toner"), warn, (folder, shot))
    if t:
        spec["toner"] = t
    h = c.get("header")
    if isinstance(h, str) and h.strip():
        h = {"text": h, "at": [96, 84], "size": 30}
    if isinstance(h, dict) and h.get("text"):
        spec["header"] = {"text": h["text"], "at": h.get("at", [96, 84]), "size": h.get("size", 30)}
    os.makedirs(os.path.join(ROOT, os.path.dirname(spec["out"])), exist_ok=True)
    with open(os.path.join(ROOT, os.path.splitext(spec["out"])[0] + ".json"), "w") as f:
        json.dump(spec, f, indent=1)
    try:
        comp.run(spec)
    except Exception as e:  # noqa: BLE001
        # retry bare: paper only, so the page still shows the frame on our sheet
        warn(f"overlay failed ({type(e).__name__}: {str(e)[:120]}); composited without overlays")
        bare = {"src": src, "ground": spec["ground"], "out": spec["out"]}
        comp.run(bare)
    return notes


def main(only):
    os.chdir(ROOT)
    report = {}
    for folder in sorted(os.listdir(KF)):
        d = os.path.join(KF, folder)
        if folder.startswith("_") or not os.path.isdir(d) or (only and folder not in only):
            continue
        pj = os.path.join(d, "picks.json")
        if not os.path.exists(pj) or folder == "handout":
            continue
        picks, cj = _load(pj), (_load(os.path.join(d, "comp.json")) if os.path.exists(os.path.join(d, "comp.json")) else {})
        for shot, v in picks.items():
            pick = os.path.basename(v.get("pick", "")) if isinstance(v, dict) else os.path.basename(str(v))
            if not pick or not os.path.exists(os.path.join(d, pick)):
                print(f"- {folder}/{shot}: no pick file")
                continue
            if isinstance(cj.get(shot), dict) and cj[shot].get("no_comp"):
                continue                      # already a finished frame (made in code)
            notes = one(folder, shot, pick, cj)
            report[f"{folder}/{shot}"] = notes
            print(f"+ {folder}/{shot}" + ("".join(f"\n    {n}" for n in notes)))
    with open(os.path.join(KF, "_comp", "_report.json"), "w") as f:
        json.dump(report, f, indent=1)


if __name__ == "__main__":
    main(set(sys.argv[1:]))
