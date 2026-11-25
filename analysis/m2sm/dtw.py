# DTW alignment of the v3 master (inputs/Proof.wav, C minor) to the -2sm master (Bb minor, 2 semitones down).
# Features: CQT chroma with the -2sm chroma rotated up 2 semitones, plus onset strength. Writes dtw_path.json.
import json, numpy as np, librosa
V3 = "/home/jade/Documents/proof/inputs/older version/Proof.wav"  # the v3 master, moved here 2026-11-24
M2 = "/home/jade/Documents/proof/inputs/Proof (-2sm).wav"
sr = 22050; hop = 1024  # 46 ms
def feats(p, shift):
    y, _ = librosa.load(p, sr=sr, mono=True)
    c = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop); c = np.roll(c, shift, axis=0)
    o = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop); o = o / (o.max() + 1e-9)
    r = librosa.feature.rms(y=y, hop_length=hop)[0]; r = librosa.amplitude_to_db(r, ref=np.max) / 60 + 1
    n = min(c.shape[1], len(o), len(r))
    return np.vstack([c[:, :n] / (np.linalg.norm(c[:, :n], axis=0) + 1e-9), 0.7 * o[None, :n], 0.7 * r[None, :n]])
A = feats(V3, 0); B = feats(M2, 2)
D, wp = librosa.sequence.dtw(X=A, Y=B, metric="euclidean")
wp = wp[::-1] * hop / sr
json.dump({"hop_s": hop / sr, "path_v3_m2": wp.round(3).tolist()}, open("dtw_path.json", "w"))
# summary: m2 time at each 1 s of v3, and local slope
f = lambda t: float(np.interp(t, wp[:, 0], wp[:, 1]))
for t in range(0, 279, 2):
    print(f"v3 {t:6.1f} -> m2 {f(t):7.2f}  d {f(t)-t:+6.2f}  slope {(f(t+2)-f(t))/2:4.2f}")
