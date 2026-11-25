# Per-window lag of the -2sm vocal stem against the v3 vocal stem (20 ms envelope cross-correlation, onset-weighted),
# searched around the DTW prediction. Prints v3 window start -> -2sm start. Usage: line_lag.py t0 t1 [t0 t1 ...]
import sys, json, numpy as np, soundfile as sf
def env(p):
    y, sr = sf.read(p); y = y.mean(1); h = int(sr * 0.02); n = len(y) // h
    e = np.sqrt((y[:n*h].reshape(n, h) ** 2).mean(1)); e = np.log(e + 1e-4)
    d = np.maximum(np.diff(e, prepend=e[0]), 0)
    return e, d
Ev, Dv = env("../v3/stems/htdemucs/Proof/vocals.wav"); Em, Dm = env("stems/htdemucs/Proof_m2sm/vocals.wav")
wp = np.array(json.load(open("dtw_path.json"))["path_v3_m2"])
f = lambda t: float(np.interp(t, wp[:, 0], wp[:, 1]))
a = list(map(float, sys.argv[1:]))
for t0, t1 in zip(a[::2], a[1::2]):
    i0, i1 = int(t0 / .02), int(t1 / .02); pv = f(t0); best = None
    for lag in np.arange(-2.0, 2.0, 0.02):
        j0 = int(round((pv + lag) / .02)); j1 = j0 + (i1 - i0)
        if j0 < 0 or j1 > len(Em): continue
        x = np.concatenate([Ev[i0:i1] - Ev[i0:i1].mean(), 3 * Dv[i0:i1]]); y = np.concatenate([Em[j0:j1] - Em[j0:j1].mean(), 3 * Dm[j0:j1]])
        c = float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-9))
        if best is None or c > best[0]: best = (c, pv + lag)
    print(f"v3 {t0:7.2f}-{t1:7.2f} -> m2 {best[1]:7.2f}  (offset {best[1]-t0:+6.2f}, dtw {pv-t0:+6.2f}, r {best[0]:.2f})")
