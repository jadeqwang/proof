#!/usr/bin/env python3
"""Review page for the keyframe and sheet pass: media/keyframes/index.html (open it in a browser).

    python3 tools/kf/gallery.py

Reads media/keyframes/<folder>/picks.json ({"SHOT": {"pick": file, "note": text}}) and NOTES.md, lists every other take
under the pick, shows composited versions from media/keyframes/_comp/<folder>/<SHOT>.jpg when they exist, and the sheets
made in this pass. Thumbnails are written to media/keyframes/_thumbs/ (jpg, 960 px wide). Paths are relative, so the
page works from the file system.
"""
import html
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KF = os.path.join(ROOT, "media", "keyframes")
TH = os.path.join(KF, "_thumbs")

ORDER = [  # folder, heading, where in the song
    ("attic88_day", "Attic, the Netherlands, winter 1988", "0:05-0:19 · 0:59-1:18 · 1:37-1:38 · 3:53"),
    ("faces", "Her face: attic outside shots, the wall, the outro", "0:07-0:19 · 1:38-1:55 · 4:05-4:24"),
    ("handout", "The emotions handout (prop plate, made in code)", "0:19-0:30 · 1:18-1:37"),
    ("shanghai86", "Shanghai, 1986", "0:30-0:59"),
    ("office91", "School office, about 1991", "1:18-1:37"),
    ("plates", "Plates: the Voyager frame", "1:55-2:07"),
    ("market93", "Marketplace on Oakton, Skokie, 1993", "2:07-2:16 · 2:26-2:45"),
    ("basement90", "Basement, Decatur, 1990", "2:16-2:26"),
    ("kitchen90", "Kitchen, Decatur, 1990: the question", "2:21-2:36"),
    ("mv10", "Housewarming, Mountain View, 2010", "2:45-3:33 · 3:43-3:53"),
    ("closet02", "The closet, about 2002", "3:33-3:43"),
    ("playground23", "Playground, Austin, 2023", "4:24-4:39"),
]
SHEETS = [
    ("cast/mama/mama_R_rest_heads_v1.jpg", "Mama: face at rest, and three acted heads"),
    ("cast/mama/mama_D_hands_v1.jpg", "Mama: hands"),
    ("cast/little_jade_05/lj05_P_proof_acting_v2.jpg", "Age 5: expressions for this film"),
    ("cast/little_jade_05/lj05_Q_proof_poses_v1.jpg", "Age 5: poses (bodies only; the faces smile)"),
    ("cast/dad/dad_R_rest_heads_v5_likeness.jpg", "Dad at 37 (v5 likeness): face at rest, and three acted heads"),
    ("cast/_family/family_rest_lineup_v5_dadlikeness.jpg", "The family's resting face: father, mother, daughter at 5 and grown"),
    ("cast/childhood_friend/cf_A_back_v1.jpg", "The childhood friend at the housewarming (proposed; back views only)"),
]


FIRST = [
    ("_comp/attic88_day/AD_wide.jpg", "0:05 the attic: the shaft of sun is bare paper cut through the wash"),
    ("_comp/faces/AD_out.jpg", "0:09 outside: her face in shade, eyes on a mote, the first label"),
    ("_comp/faces/AD_out_b.jpg", "0:18 the expression she offers: one eye narrowed, brow furrowed"),
    ("_comp/shanghai86/V1c.jpg", "0:40 Shanghai, 1986: still ripping"),
    ("_comp/faces/WL_eye.jpg", "1:40 inside the wall"),
    ("_comp/market93/M2.jpg", "2:10 inside: the count on the artichoke"),
    ("_comp/basement90/B2_face.jpg", "2:17 father and daughter, the same face"),
    ("_comp/mv10/BR2.jpg", "2:45 the tap, the grin, to lens"),
    ("_comp/closet02/CL_ots.jpg", "3:40 the same answer, with her face in the light"),
    ("_comp/faces/K5_thumbs.jpg", "4:07 the pushed smile, the deeper frown"),
    ("_comp/faces/K6_mother.jpg", "4:10 Mama's own face, just as still"),
    ("_comp/playground23/PG2.jpg", "4:33 grandfather, grandson, and her own face in the glass"),
]


def thumb(path, w=960):
    """path absolute -> relative url (from KF) of a jpg thumbnail."""
    if not os.path.exists(path):
        return None
    rel = os.path.relpath(path, ROOT).replace("/", "__")
    out = os.path.join(TH, os.path.splitext(rel)[0] + f"_{w}.jpg")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(path):
        os.makedirs(TH, exist_ok=True)
        subprocess.run(["convert", path + "[0]", "-resize", f"{w}x", "-quality", "86", out], check=True)
    return os.path.relpath(out, KF)


def fig(path, cap, cls="", w=960):
    t = thumb(path, w)
    if not t:
        return ""
    full = os.path.relpath(path, KF)
    return (f'<figure class="{cls}"><a href="{html.escape(full)}"><img loading="lazy" src="{html.escape(t)}" alt=""></a>'
            f'<figcaption>{cap}</figcaption></figure>')


def md_lite(text):
    out, in_ul = [], False
    for line in text.splitlines():
        s = html.escape(line.rstrip())
        s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
        s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
        if s.startswith(("- ", "* ")):
            if not in_ul:
                out.append("<ul>"); in_ul = True
            out.append(f"<li>{s[2:]}</li>")
            continue
        if in_ul:
            out.append("</ul>"); in_ul = False
        if s.startswith("#"):
            out.append(f"<h4>{s.lstrip('# ')}</h4>")
        elif s.strip():
            out.append(f"<p>{s}</p>")
    if in_ul:
        out.append("</ul>")
    return "\n".join(out)


FIXED = {  # folders shown as a fixed list of files, not from picks.json
    "handout": [("handout_yellow.png", "The handout: 34 faces, the fourth row one short and centred, so it sits between the columns. "
                 "Faces drawn by an image model as clip-art, then laid out, labelled and photocopied in code "
                 "(<code>tools/kf/handout.py</code>)."),
                ("handout_title_1080.png", "The 0:19 title plate: the gap at the end of the short row near frame centre."),
                ("faces/_contact.png", "The 34 faces before the copier.")],
}


def section(folder, title, when):
    d = os.path.join(KF, folder)
    if not os.path.isdir(d):
        return "", 0
    if folder in FIXED:
        body = "".join(fig(os.path.join(d, f), c, "hero") for f, c in FIXED[folder])
        return (f'<section id="{folder}"><h2>{html.escape(title)}</h2><p class="when">{html.escape(when)} · '
                f'<code>media/keyframes/{folder}/</code></p>{body}</section>'), 0
    picks = {}
    pj = os.path.join(d, "picks.json")
    if os.path.exists(pj):
        try:
            picks = json.load(open(pj))
        except Exception as e:  # noqa: BLE001
            picks = {"_error": {"pick": "", "note": f"picks.json unreadable: {e}"}}
    imgs = sorted(f for f in os.listdir(d) if f.lower().endswith((".jpg", ".png")) and not f.startswith("_"))
    cells, used = [], set()
    for shot, v in picks.items():
        v = v if isinstance(v, dict) else {"pick": str(v), "note": ""}
        pick = os.path.basename(v.get("pick", ""))
        note = html.escape(v.get("note", ""))
        comp = os.path.join(KF, "_comp", folder, shot + ".jpg")
        body = ""
        if os.path.exists(comp):
            body += fig(comp, f"<b>{html.escape(shot)}</b> composited (beam, motes, gold, toner from code)", "hero")
        if pick and os.path.exists(os.path.join(d, pick)):
            body += fig(os.path.join(d, pick), f"<b>{html.escape(shot)}</b> pick: <code>{html.escape(pick)}</code><br>{note}",
                        "" if os.path.exists(comp) else "hero")
            used.add(pick)
        else:
            body += f'<p class="warn"><b>{html.escape(shot)}</b>: no pick. {note}</p>'
        stem = re.sub(r"_v\d+.*$", "", os.path.splitext(pick)[0]) if pick else shot
        others = [f for f in imgs if f != pick and re.sub(r"_v\d+.*$", "", os.path.splitext(f)[0]) == stem]
        if others:
            body += '<div class="takes">' + "".join(fig(os.path.join(d, f), f"<code>{html.escape(f)}</code>", "take", 480) for f in others) + "</div>"
            used.update(others)
        cells.append(f'<div class="shot">{body}</div>')
    rest = [f for f in imgs if f not in used]
    if rest:
        cells.append('<div class="shot"><p class="dim">Other files in this folder</p><div class="takes">'
                     + "".join(fig(os.path.join(d, f), f"<code>{html.escape(f)}</code>", "take", 480) for f in rest) + "</div></div>")
    notes = ""
    nm = os.path.join(d, "NOTES.md")
    if os.path.exists(nm):
        notes = f'<details><summary>Notes from whoever painted this set</summary>{md_lite(open(nm).read())}</details>'
    n = len([k for k in picks if not k.startswith("_")])
    return (f'<section id="{folder}"><h2>{html.escape(title)}</h2><p class="when">{html.escape(when)} · '
            f'<code>media/keyframes/{folder}/</code></p>{notes}{"".join(cells)}</section>'), n


def main():
    intro = ""
    ip = os.path.join(KF, "_intro.html")
    if os.path.exists(ip):
        intro = open(ip).read()
    parts, nav, total = [], [], 0
    first = "".join(fig(os.path.join(KF, p), c, "take", 640) for p, c in FIRST if os.path.exists(os.path.join(KF, p)))
    if first:
        parts.append(f'<section id="first"><h2>Twelve frames to look at first</h2><p class="when">composited; each is '
                     f'repeated in its section below with its takes</p><div class="takes wide">{first}</div></section>')
        nav.append('<a href="#first">Start here</a>')
    sh = "".join(fig(os.path.join(ROOT, p), html.escape(c) + f"<br><code>{p}</code>", "hero") for p, c in SHEETS)
    if sh:
        parts.append(f'<section id="sheets"><h2>Character sheets added in this pass</h2>{sh}</section>')
        nav.append('<a href="#sheets">Sheets</a>')
    for folder, title, when in ORDER:
        s, n = section(folder, title, when)
        if s:
            parts.append(s)
            nav.append(f'<a href="#{folder}">{html.escape(title.split(",")[0].split(":")[0].split(" (")[0])}</a>')
            total += n
    css = """
    :root{color-scheme:light}
    body{margin:0;background:#f3ecdd;color:#2a2622;font:16px/1.5 Georgia,'Times New Roman',serif}
    header,section,footer{max-width:1180px;margin:0 auto;padding:28px 24px}
    h1{font-size:30px;margin:0 0 6px;font-weight:normal;letter-spacing:.01em}
    h2{font-size:22px;font-weight:normal;margin:0 0 2px;border-top:1px solid #cdbf9f;padding-top:22px}
    h3{font-size:17px;margin:22px 0 4px} h4{font-size:15px;margin:14px 0 2px}
    nav{position:sticky;top:0;background:#f3ecddee;border-bottom:1px solid #cdbf9f;padding:8px 24px;font:13px/1.8 system-ui,sans-serif;z-index:2}
    nav a{margin-right:14px;color:#6a5320;text-decoration:none;white-space:nowrap} nav a:hover{text-decoration:underline}
    .when,.dim{color:#7a6d55;font:13px system-ui,sans-serif;margin:2px 0 14px}
    .warn{color:#8a3b1e;font:14px system-ui,sans-serif}
    figure{margin:0 0 18px} figure img{display:block;width:100%;height:auto;border:1px solid #d6caae;background:#fbf6ea}
    figcaption{font:13px/1.45 system-ui,sans-serif;color:#4a4236;padding:6px 2px 0}
    .shot{margin:0 0 34px} .hero{max-width:960px}
    .takes{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;max-width:960px}
    .takes.wide{grid-template-columns:repeat(auto-fill,minmax(340px,1fr));max-width:none}
    .takes.wide figcaption{font-size:13px;color:#4a4236}
    .take img{border-color:#e0d6bd} .take figcaption{font-size:11.5px;color:#7a6d55}
    code{font:12.5px ui-monospace,Menlo,monospace;background:#e9dfc8;padding:1px 4px;border-radius:3px}
    details{margin:6px 0 20px;font:14px/1.5 system-ui,sans-serif;max-width:960px} summary{cursor:pointer;color:#6a5320}
    .lede{max-width:760px} .lede p{margin:0 0 12px}
    table{border-collapse:collapse;font:14px/1.45 system-ui,sans-serif;max-width:960px;margin:10px 0 18px}
    td,th{border-top:1px solid #d6caae;padding:6px 10px 6px 0;text-align:left;vertical-align:top}
    """
    page = (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>Proof: keyframes and sheets</title><style>{css}</style></head><body>'
            f'<header><h1>Proof: keyframes and sheets</h1>'
            + ('<p class="when" style="font-size:16px"><b>Newest: <a href="r3/index.html">Round 3 keyframes, painted from the new contour / form / light guides after your round-2 review (review page with options)</a></b>.</p>' if os.path.exists(os.path.join(KF, 'r3', 'index.html')) else '')
            + ('<p class="when" style="font-size:16px"><b>New: <a href="r2/index.html">Round 2 keyframes, from the new set renders (review page with options)</a></b>. This page is round 1, painted from superseded guides.</p>' if os.path.exists(os.path.join(KF, 'r2', 'index.html')) else '')
            + f'<p class="when">{total} shots with a pick · regenerate with '
            f'<code>python3 tools/kf/gallery.py</code> · click any image for the full file</p><div class="lede">{intro}</div></header>'
            f'<nav>{"".join(nav)}</nav>{"".join(parts)}<footer><p class="dim">Working notes: <code>docs/KEYFRAMES.md</code>. '
            f'Brief used by the painters: <code>docs/KEYFRAME_BRIEF.md</code>. Poem digest: <code>docs/poem_digest.md</code>.</p></footer></body></html>')
    out = os.path.join(KF, "index.html")
    with open(out, "w") as f:
        f.write(page)
    print(f"wrote {os.path.relpath(out, ROOT)}: {total} picked shots, {len(parts)} sections")


if __name__ == "__main__":
    main()
