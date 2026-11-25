# 50 ms stem levels (dB) in a window of the -2sm stems, plus drum-stem onsets. Usage: fine.py t0 t1
import sys, numpy as np, soundfile as sf, librosa
a, b = map(float, sys.argv[1:3]); L = {}
for s in ("vocals", "drums", "bass", "other"):
    y, sr = sf.read(f"stems/htdemucs/Proof_m2sm/{s}.wav"); y = y.mean(1)[int(a*sr):int(b*sr)]; h = int(sr*.05); n = len(y)//h
    L[s] = 20*np.log10(np.sqrt((y[:n*h].reshape(n, h)**2).mean(1))+1e-9)
    if s == "drums":
        on = librosa.onset.onset_detect(y=y.astype(np.float32), sr=sr, units="time", backtrack=False)
        print("drum onsets:", " ".join(f"{a+o:.2f}" for o in on))
for k in range(n):
    print(f"{a+k*.05:7.2f} " + " ".join(f"{s[:3]} {L[s][k]:4.0f}" for s in L))
