#!/usr/bin/env python3
# run with the project venv: .venv/bin/python tools/karaoke/render_v2.py ... (needs numpy + Pillow)
"""Karaoke render for the -2sm Suno version of "Proof".

  .venv/bin/python tools/karaoke/render_v2.py OUT.mp4 [options]

Audio / timing
  --audio inst      Suno's no-lead track, inputs/Proof (-2sm  no lead vocals).wav (default)
  --audio guide     full mix with the lead at -12 dB (media/karaoke_v2/audio/Proof_-2sm_guide_-12dB.wav;
                    build it with tools/karaoke/make_guide_v2.py). Uses the full-mix timeline.
  --audio PATH --timebase inst|full   any other audio file on either timeline
Background (default: generated warm paper)
  --bg CLIP[@START] ...   one or more clips; each fills the song from START (s, track time) to the
                    next clip's START (the last one to the end). Next clip cross-fades in over
                    --xfade seconds starting at its START. A clip shorter than its slot is slowed
                    down (frame-blended) up to --max-slow x, then its last frame is held; a clip
                    longer than its slot is sped up to at most --max-speed x, then trimmed. Never
                    looped or reversed. A CLIP may be a directory: its videos are joined in name order.
  --xfade S         cross-fade length (default 4)
  --band A          opacity of a soft paper band behind the lyrics (default 0 on the plain paper,
                    0.6 when --bg is given)
  --rows Y1,Y2      y-centres of the two lyric rows (default 795,900; plate captions sit below ~950)
Other
  --start S --dur D render an excerpt (for checks)
  --ass-only        just write the .ass next to OUT
  --title TEXT      subtitle under the title card (default "karaoke · −2 semitones")

Writes OUT and OUT with .ass.  Lyrics: media/karaoke_v2/lyrics_timed.json.
"""
import argparse, glob, json, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
LYR = os.path.join(ROOT, "media", "karaoke_v2", "lyrics_timed.json")
FONTS = os.path.join(HERE, "fonts")
FONT = "EB Garamond Karaoke"
W, H, FPS = 1920, 1080, 30
AUDIO = {
    "inst": (os.path.join(ROOT, "inputs", "Proof (-2sm  no lead vocals).wav"), "inst"),
    "guide": (os.path.join(ROOT, "media", "karaoke_v2", "audio", "Proof_-2sm_guide_-12dB.wav"), "full"),
}
VID_EXT = (".mp4", ".mov", ".mkv", ".webm", ".m4v")

# ---------------------------------------------------------------- colours (ASS &HAABBGGRR) ----
def col(hexrgb, a=0):
    r, g, b = int(hexrgb[1:3], 16), int(hexrgb[3:5], 16), int(hexrgb[5:7], 16)
    return "&H%02X%02X%02X%02X" % (a, b, g, r)

PAPER = "#F1E7D0"          # background / halo
INK = "#2E261F"            # unsung text: dark iron-gall ink
RUBRIC = "#9B2F1C"         # sung text: textbook rubric red
SEPIA = "#6B5A48"          # labels, dots, backing tint


def run(cmd):
    print("+", " ".join(cmd) if len(" ".join(cmd)) < 600 else " ".join(cmd)[:600] + " ...", flush=True)
    subprocess.run(cmd, check=True)


def probe_dur(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                         capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


# ----------------------------------------------------------------------------------- ASS -----
def ts(s):
    s = max(0.0, s)
    return "%d:%02d:%05.2f" % (s // 3600, s % 3600 // 60, s % 60)


def esc(s):
    """ASS-safe text with book typography: curly apostrophes and quotes."""
    import re
    s = s.replace("{", "(").replace("}", ")").replace("\\", "")
    s = re.sub(r'(^|[\s(])"', "\\1\u201c", s).replace('"', "\u201d")
    return s.replace("'", "\u2019")


def build_ass(d, tb, subtitle, rows_y=(795, 900)):
    S, E = ("s", "e") if tb == "inst" else ("s_full", "e_full")
    LS, LE = ("start", "end") if tb == "inst" else ("start_full", "end_full")
    lines = [l for l in d["lines"] if l["words"]]
    lines.sort(key=lambda l: l[LS])
    secs = [(s["name"], s["start"] if tb == "inst" else s["start_full"]) for s in d["sections"]]
    beat = 60 / 99.4

    ROW = list(rows_y)         # y-centres of the two lyric rows
    FS, FS_BACK = 74, 66
    MAXW = 1640  # max lyric width in px (inside the plate border)
    LEAD_IN, HOLD, GAP_RESET, GAP_DOTS, GAP_LABEL = 4.0, 1.6, 3.0, 5.0, 9.0

    halo = col(PAPER, 0x10)
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Lyric,{FONT},{FS},{col(RUBRIC)},{col(INK)},{halo},&HFF000000,0,0,0,0,100,100,0.6,0,1,4.5,0,5,0,0,0,1
Style: Backing,{FONT},{FS_BACK},{col(RUBRIC)},{col(SEPIA)},{halo},&HFF000000,0,1,0,0,100,100,0.6,0,1,4.5,0,5,0,0,0,1
Style: Label,{FONT},40,{col(SEPIA)},{col(SEPIA)},{halo},&HFF000000,0,1,0,0,100,100,3,0,1,4,0,5,0,0,0,1
Style: Title,{FONT},150,{col(INK)},{col(INK)},{halo},&HFF000000,0,0,0,0,100,100,4,0,1,5,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []

    def add(t0, t1, style, text, layer=1):
        if t1 > t0 + 0.02:
            ev.append(f"Dialogue: {layer},{ts(t0)},{ts(t1)},{style},,0,0,0,,{text}")

    # title card
    first = lines[0][LS]
    t_end = min(first - LEAD_IN - 0.3, 7.5)
    if t_end > 2:
        add(0.4, t_end, "Title", r"{\pos(960,450)\fad(900,700)\blur0.6}Proof")
        add(0.9, t_end, "Label", r"{\pos(960,575)\fad(900,700)}" + esc(subtitle))

    # row assignment: alternate, restarting on the top row after a pause
    rows, r = [], 1
    for i, l in enumerate(lines):
        gap = l[LS] - lines[i - 1][LE] if i else 99
        r = 0 if gap >= GAP_RESET else 1 - r
        rows.append(r)
    appear = []
    for i, l in enumerate(lines):
        a = l[LS] - LEAD_IN
        # wait until the previous occupant of this row has gone
        for j in range(i - 1, -1, -1):
            if rows[j] == rows[i]:
                a = max(a, lines[j][LE] + 0.12)
                break
        # don't show a line before the line above/below it is at least on screen
        if i and rows[i] == 1 and rows[i - 1] == 0:
            a = max(a, appear[i - 1])
        appear.append(min(a, l[LS] - 0.4))
    for i, l in enumerate(lines):
        nxt_same = next((appear[j] for j in range(i + 1, len(lines)) if rows[j] == rows[i]), None)
        gone = l[LE] + HOLD
        if nxt_same is not None:
            gone = min(gone, nxt_same - 0.05)
        gone = max(gone, l[LE] + 0.25)
        a = appear[i]
        y = ROW[rows[i]]
        style = "Backing" if l.get("backing") or l.get("whisper") else "Lyric"
        # karaoke timing: silent \k up to the first word, then \kf per word (centiseconds)
        parts, cur = [], a
        ws = l["words"]
        # shrink long lines to fit (EB Garamond Medium averages ~0.43 em per character)
        fs0 = FS_BACK if style == "Backing" else FS
        est = 0.43 * fs0 * len(" ".join(w["w"] for w in ws))
        fs_tag = r"\fs%d" % int(fs0 * MAXW / est) if est > MAXW else ""
        for k, w in enumerate(ws):
            s, e = w[S], w[E]
            if s > cur + 0.005:
                parts.append(r"{\k%d}" % round((s - cur) * 100))
                cur = s
            dur = max(e - cur, 0.05)
            sep = " " if k < len(ws) - 1 else ""
            it = w.get("i")
            if it is not None and style == "Lyric":
                parts.append(r"{\kf%d\i%d}%s%s" % (round(dur * 100), 1 if it else 0, esc(w["w"]), sep))
            else:
                parts.append(r"{\kf%d}%s%s" % (round(dur * 100), esc(w["w"]), sep))
            cur += dur
        t_on = max(0, (l[LS] - a - 0.35)) * 1000
        pre = r"{\pos(960,%d)" % y + fs_tag + r"\blur0.4\fad(250,300)\alpha&H55&\t(%d,%d,\alpha&H00&)}" % (t_on, t_on + 300)
        add(a, gone, style, pre + "".join(parts))
        # countdown dots before an entry after a pause
        prev_end = lines[i - 1][LE] if i else 0
        if l[LS] - prev_end >= GAP_DOTS:
            for k in range(3):  # three dots, one goes out per beat
                t1 = l[LS] - (2 - k) * beat
                dots = "  ".join(["•"] * (3 - k))
                add(t1 - beat, t1, "Label", r"{\pos(960,%d)\fs44}%s" % (ROW[0] - 78, dots))
    # section labels in long gaps
    for i in range(len(lines) + 1):
        g0 = lines[i - 1][LE] + HOLD + 0.3 if i else None
        g1 = appear[i] - 0.3 if i < len(lines) else d["duration"] if tb == "inst" else d["duration_full"]
        if g0 is None or g1 - g0 < GAP_LABEL - HOLD:
            continue
        mid = [n for n, t in secs if g0 - HOLD - 1 <= t <= g1]
        name = mid[0] if mid else ""
        if i == len(lines):
            name = ""
        if name:
            add(g0, g1 - 0.2, "Label", r"{\pos(960,%d)\fad(600,500)}— %s —" % ((ROW[0] + ROW[1]) // 2, esc(name.lower())))
    return hdr + "\n".join(ev) + "\n"


# ----------------------------------------------------------------------- backgrounds ---------
def _save_png(arr, path):
    """numpy HxWx3/4 uint8 -> PNG via ffmpeg (no Pillow in the venv)."""
    pf = "rgba" if arr.shape[2] == 4 else "rgb24"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", pf, "-s", f"{W}x{H}",
                    "-i", "-", "-frames:v", "1", path], input=arr.tobytes(), check=True)


def paper_png(path):
    """Warm paper: flat cream, faint fibre noise and a soft vignette (generated, no assets)."""
    import numpy as np
    from scipy.ndimage import gaussian_filter, zoom
    rng = np.random.default_rng(7)
    base = np.array([241, 231, 208], float)
    n1 = gaussian_filter(zoom(rng.normal(0, 1, (H // 4, W // 4)), 4, order=1), 3) * 4
    n1 = np.pad(n1, ((0, max(0, H - n1.shape[0])), (0, max(0, W - n1.shape[1]))), mode="edge")[:H, :W]
    n2 = rng.normal(0, 1, (H, W)) * 2.2
    yy, xx = np.mgrid[0:H, 0:W]
    v = ((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2
    vig = 1 - 0.10 * np.clip(v, 0, 1.6)
    img = (base[None, None, :] * vig[..., None]) + (n1 + n2)[..., None] * np.array([1, 0.95, 0.85])
    _save_png(img.clip(0, 255).astype("uint8"), path)


def band_png(path, alpha, rows_y=(795, 900)):
    """Feathered paper-coloured band behind the two lyric rows."""
    import numpy as np
    y = np.arange(H)
    c0, c1, feather = rows_y[0] - 62, rows_y[1] + 58, 60
    a = np.clip(np.minimum((y - (c0 - feather)) / feather, ((c1 + feather) - y) / feather), 0, 1)
    a = (a * a * (3 - 2 * a)) * alpha
    r, g, b = (int(PAPER[i:i + 2], 16) for i in (1, 3, 5))
    img = np.zeros((H, W, 4), "uint8")
    img[..., 0], img[..., 1], img[..., 2] = r, g, b
    img[..., 3] = (a[:, None] * 255).astype("uint8")
    _save_png(img, path)


def expand(spec):
    """CLIP[@START] -> (list_of_files, start)."""
    path, start = spec, None
    if "@" in spec:
        p, s = spec.rsplit("@", 1)
        try:
            start = float(s); path = p
        except ValueError:
            pass
    path = os.path.abspath(path)
    if os.path.isdir(path):
        files = sorted(f for f in glob.glob(os.path.join(path, "*")) if f.lower().endswith(VID_EXT))
        if not files:
            sys.exit(f"no video files in {path}")
    else:
        files = [path]
    return files, start


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out")
    ap.add_argument("--audio", default="inst")
    ap.add_argument("--timebase", choices=["inst", "full"])
    ap.add_argument("--bg", nargs="+", default=[])
    ap.add_argument("--xfade", type=float, default=4.0)
    ap.add_argument("--max-slow", type=float, default=2.5)
    ap.add_argument("--max-speed", type=float, default=1.5)
    ap.add_argument("--band", type=float)
    ap.add_argument("--rows", default="795,900", help="y-centres of the two lyric rows (1080p)")
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--dur", type=float)
    ap.add_argument("--ass-only", action="store_true")
    ap.add_argument("--lyrics", default=LYR)
    ap.add_argument("--title", default="karaoke · −2 semitones")
    ap.add_argument("--crf", type=int, default=19)
    A = ap.parse_args()

    if A.audio in AUDIO:
        audio, tb = AUDIO[A.audio]
    else:
        audio, tb = os.path.abspath(A.audio), (A.timebase or "inst")
    if A.timebase:
        tb = A.timebase
    if not os.path.exists(audio):
        sys.exit(f"missing audio {audio}")
    d = json.load(open(A.lyrics))
    out = os.path.abspath(A.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    ass_path = os.path.splitext(out)[0] + ".ass"
    rows_y = tuple(int(v) for v in A.rows.split(","))
    open(ass_path, "w").write(build_ass(d, tb, A.title, rows_y))
    print("wrote", ass_path)
    if A.ass_only:
        return
    total = probe_dur(audio)

    tmp = tempfile.mkdtemp(prefix="karaoke_v2_")
    try:
        paper = os.path.join(tmp, "paper.png"); paper_png(paper)
        band_a = A.band if A.band is not None else (0.6 if A.bg else 0.0)
        inputs, fc = [], []
        # ---- background chain -> [bg]
        if not A.bg:
            inputs += ["-loop", "1", "-framerate", str(FPS), "-t", "%.3f" % total, "-i", paper]
            fc.append(f"[0:v]format=yuv420p,setsar=1[bg]")
        else:
            clips = [expand(s) for s in A.bg]
            starts = [c[1] if c[1] is not None else (0.0 if i == 0 else None) for i, c in enumerate(clips)]
            if any(s is None for s in starts):
                sys.exit("every --bg after the first needs @START")
            if starts[0] > 0:  # paper until the first clip
                clips.insert(0, ([paper], 0.0)); starts.insert(0, 0.0)
            xf = A.xfade
            labels = []
            for i, (files, st) in enumerate(clips):
                end = starts[i + 1] + xf if i + 1 < len(clips) else total
                slot = end - st
                base = len(inputs) // 2  # rough; recomputed below
                idxs = []
                for f in files:
                    if f.lower().endswith((".png", ".jpg", ".jpeg")):
                        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", "%.3f" % slot, "-i", f]
                    else:
                        inputs += ["-i", f]
                    idxs.append(sum(1 for x in inputs if x == "-i") - 1)
                if files[0].lower().endswith((".png", ".jpg", ".jpeg")):
                    srcdur = slot
                else:
                    srcdur = sum(probe_dur(f) for f in files)
                norm = [f"[{k}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1,format=yuv420p[c{i}_{n}]"
                        for n, k in enumerate(idxs)]
                fc += norm
                if len(idxs) > 1:
                    fc.append("".join(f"[c{i}_{n}]" for n in range(len(idxs))) + f"concat=n={len(idxs)}:v=1:a=0[c{i}]")
                else:
                    fc.append(f"[c{i}_0]null[c{i}]")
                factor = slot / srcdur  # >1 = slow down
                factor = min(max(factor, 1 / A.max_speed), A.max_slow)
                chain = f"[c{i}]setpts={factor:.6f}*(PTS-STARTPTS)"
                if factor > 1.02:
                    chain += f",framerate=fps={FPS}"   # blend in-between frames when slowing
                else:
                    chain += f",fps={FPS}"
                hold = slot - srcdur * factor
                if hold > 0:
                    chain += f",tpad=stop_mode=clone:stop_duration={hold + 1:.3f}"
                chain += f",trim=duration={slot:.3f},setpts=PTS-STARTPTS,fps={FPS},format=yuv420p[v{i}]"
                fc.append(chain)
                print(f"bg {i}: {len(files)} file(s) {srcdur:.2f}s -> slot {st:.2f}-{end:.2f} ({slot:.2f}s), "
                      f"x{1 / factor:.3f} speed, hold {max(hold, 0):.2f}s", flush=True)
                labels.append(f"v{i}")
            cur = labels[0]
            for i in range(1, len(labels)):
                o = f"x{i}"
                fc.append(f"[{cur}][{labels[i]}]xfade=transition=fade:duration={xf:.3f}:offset={starts[i]:.3f}[{o}]")
                cur = o
            fc.append(f"[{cur}]null[bg]")
        n_in = sum(1 for x in inputs if x == "-i")
        vlast = "bg"
        if band_a > 0:
            bp = os.path.join(tmp, "band.png"); band_png(bp, band_a, rows_y)
            inputs += ["-loop", "1", "-framerate", str(FPS), "-i", bp]
            fc.append(f"[bg][{n_in}:v]overlay=0:0:format=auto:shortest=1[bgb]"); vlast = "bgb"; n_in += 1
        inputs += ["-i", audio]
        a_idx = n_in
        ass_esc = ass_path.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")
        fonts_esc = FONTS.replace(":", "\\:").replace("'", "\\'")
        seek = []
        dur = A.dur if A.dur else total - A.start
        trim = ""
        if A.start or A.dur:  # trim keeps absolute PTS, so the subtitles still line up
            trim = "trim=start=%.3f:duration=%.3f," % (A.start, dur)
            seek = ["-ss", "%.3f" % A.start, "-t", "%.3f" % dur]
        fc.append(f"[{vlast}]{trim}ass='{ass_esc}':fontsdir='{fonts_esc}',setpts=PTS-STARTPTS,format=yuv420p[v]")
        cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-nostats", *inputs,
               "-filter_complex", ";".join(fc), "-map", "[v]"]
        cmd += ["-map", f"{a_idx}:a"]
        if seek:
            cmd = cmd[:cmd.index("-filter_complex")] + []  # placeholder, rebuilt below
            cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-nostats", *inputs[:-2],
                   *seek, "-i", audio, "-filter_complex", ";".join(fc), "-map", "[v]", "-map", f"{a_idx}:a"]
        cmd += ["-t", "%.3f" % dur, "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", str(A.crf),
                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out]
        run(cmd)
        print("wrote", out)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
