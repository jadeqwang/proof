"""Sync check on a preview: (1) its audio vs the master at the clip start, (2) the playhead's x in each frame vs the
expected x for that frame's time, (3) the voiced-onset times the plate shows vs the lyric word onsets."""
import json, subprocess, sys
import cv2, numpy as np, soundfile as sf
from scipy.signal import correlate
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import render as R
var, mp4 = sys.argv[1], sys.argv[2]
P = R.Plate(var)
tc0 = P.tc0
# (1) audio
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', mp4, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'],
                     capture_output=True).stdout
a = np.frombuffer(raw, np.float32)
m, sr = sf.read(R.os.path.join(R.HERE, '..', '..', '..', 'inputs', 'Proof (-2sm).wav'), start=int(tc0 * 48000) - 4800, frames=len(a) + 9600, dtype='float32')
m = m.mean(1)
c = correlate(m, a[:48000 * 4], mode='valid', method='fft')
lag = (np.argmax(c) - 4800) / 48000
print(f'audio: preview audio starts at master {tc0 + lag:.5f} s (expected {tc0:.5f}); offset {lag * 1000:+.2f} ms; '
      f'duration {len(a) / 48000:.3f} s')
# (2) playhead
cap = cv2.VideoCapture(mp4)
x0, y0, x1, y1 = P.B
errs = []
i = 0
while True:
    ok, fr = cap.read()
    if not ok:
        break
    t = tc0 + i / P.fps
    if P.ta0 + 0.02 < t < P.ta1 - 0.02:
        g = fr[y0 + 4:y1 - 4, x0 + 3:x1 - 3].astype(np.float32).mean(2)
        col = np.median(g, 0)                                   # a vertical line darkens every row of its column
        base = np.median(col)
        dark = base - col
        j = int(np.argmax(dark))
        if dark[j] > 25:
            # sub-pixel centroid
            lo, hi = max(0, j - 2), min(len(dark), j + 3)
            w = np.clip(dark[lo:hi], 0, None)
            xs = (np.arange(lo, hi) * w).sum() / w.sum() + x0 + 3 + 0.5
            errs.append(xs - float(P.x_of_t(t)))
    i += 1
errs = np.array(errs)
pxs = (P.B[2] - P.B[0]) / (P.ta1 - P.ta0)
print(f'playhead: {len(errs)} frames measured of {i}; error mean {errs.mean():+.2f} px, max |{np.abs(errs).max():.2f}| px '
      f'= {np.abs(errs).max() / pxs * 1000:.1f} ms at {pxs:.0f} px/s')
# (3) voiced onsets vs word onsets
L = json.load(open(R.os.path.join(R.HERE, '..', '..', 'karaoke_v2', 'lyrics_timed.json')))['lines']
starts = [tt[0] for tt, ff in P.runs]
for l in L:
    for w in l['words']:
        if P.ta0 <= w['s_full'] <= P.ta1:
            nxt = [s for s in starts if s >= w['s_full'] - 0.03]
            d = (nxt[0] - w['s_full']) * 1000 if nxt else float('nan')
            print(f"  {w['w']:12s} lyric onset {w['s_full']:.3f}   gold contour resumes {nxt[0] if nxt else float('nan'):.3f}  (+{d:.0f} ms)")
