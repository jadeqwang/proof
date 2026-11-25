# -2sm master: tempo, beats, key, 0.5 s mix RMS. Run from analysis/m2sm with ../../.venv/bin/python -I analyse.py
import json, numpy as np, librosa
SRC = "/home/jade/Documents/proof/inputs/Proof (-2sm).wav"
y, sr = librosa.load(SRC, sr=22050, mono=True)
print("duration", len(y) / sr)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
bt = np.array(beats); ibi = np.diff(bt)
print("tempo", np.atleast_1d(tempo)[0], "n beats", len(bt), "median ibi", np.median(ibi))
A = np.vstack([np.ones_like(bt), np.arange(len(bt))]).T
c, *_ = np.linalg.lstsq(A, bt, rcond=None); print("regression beat", c[1], "BPM", 60 / c[1])
ch = librosa.feature.chroma_cqt(y=y, sr=sr).mean(1)
maj = np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); mnr = np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
N = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']; r = []
for k in range(12):
    r.append((np.corrcoef(ch, np.roll(maj, k))[0,1], N[k]+' major')); r.append((np.corrcoef(ch, np.roll(mnr, k))[0,1], N[k]+' minor'))
print("key", sorted(r, reverse=True)[:4])
hop = int(sr * 0.5); rms = librosa.feature.rms(y=y, frame_length=hop, hop_length=hop)[0]
db = 20 * np.log10(rms + 1e-9)
json.dump({"beats": bt.round(3).tolist(), "rms_mix_db_0p5s": db.round(1).tolist()}, open("features_mix.json", "w"))
