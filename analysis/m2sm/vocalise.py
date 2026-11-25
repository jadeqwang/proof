# Pitch (pyin) of the -2sm vocal stem in the two post-chorus vocalises, to check that tail 2's 229-232.3 s run is sung.
import numpy as np, librosa
y, sr = librosa.load("stems/htdemucs/Proof_m2sm/vocals.wav", sr=22050, mono=True)
for a, b, name in ((119.5, 123.6, "tail 1 vocalise"), (226.0, 233.0, "tail 2 (held go + new run)")):
    s = y[int(a*sr):int(b*sr)]
    f0, vf, vp = librosa.pyin(s, fmin=100, fmax=1200, sr=sr, hop_length=512)
    t = a + np.arange(len(f0)) * 512 / sr
    print(f"== {name} {a}-{b}: voiced {np.mean(vf)*100:.0f}%")
    for k in range(0, len(f0), 11):
        seg = f0[k:k+11]; v = seg[~np.isnan(seg)]
        print(f"  {t[k]:7.2f}  " + (librosa.hz_to_note(np.median(v)) + f" ({len(v)}/11 voiced)" if len(v) else "unvoiced"))
