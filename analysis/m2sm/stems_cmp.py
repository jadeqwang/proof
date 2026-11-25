# Per-stem 0.5 s RMS (dB) for the -2sm stems, printed beside the v3 stems at the DTW-mapped time.
# Usage: stems_cmp.py START END   (-2sm seconds)
import sys, json, numpy as np, soundfile as sf
def load(d):
    out = {}
    for s in ("vocals", "drums", "bass", "other"):
        y, sr = sf.read(f"{d}/{s}.wav"); y = y.mean(1) if y.ndim > 1 else y
        h = sr // 4; n = len(y) // h
        out[s] = 20 * np.log10(np.sqrt((y[:n*h].reshape(n, h) ** 2).mean(1)) + 1e-9)
    return out, 0.25
M, dt = load("stems/htdemucs/Proof_m2sm"); V, _ = load("../v3/stems/htdemucs/Proof")
wp = np.array(json.load(open("dtw_path.json"))["path_v3_m2"])
inv = lambda t: float(np.interp(t, wp[:, 1], wp[:, 0]))
a, b = float(sys.argv[1]), float(sys.argv[2])
print("  m2   | voc  drm  bas  oth ||  v3(dtw) | voc  drm  bas  oth")
for t in np.arange(a, b, dt):
    i = int(t / dt); tv = inv(t); j = int(tv / dt)
    f = lambda D, k: " ".join(f"{D[s][k]:4.0f}" for s in ("vocals", "drums", "bass", "other"))
    print(f"{t:7.2f} | {f(M, i)} || {tv:7.2f} | {f(V, j)}")
