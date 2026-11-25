# Stem on/off transitions (50 ms RMS, hysteresis) for the -2sm stems; gaps shorter than MINGAP are ignored.
# Usage: events.py [stemdir]   default stems/htdemucs/Proof_m2sm
import sys, numpy as np, soundfile as sf
D = sys.argv[1] if len(sys.argv) > 1 else "stems/htdemucs/Proof_m2sm"
TH = dict(vocals=-45, drums=-45, bass=-50, other=-50); MINGAP = 0.35; dt = 0.05
for s in ("drums", "bass", "vocals", "other"):
    y, sr = sf.read(f"{D}/{s}.wav"); y = y.mean(1); h = int(sr * dt); n = len(y) // h
    db = 20 * np.log10(np.sqrt((y[:n*h].reshape(n, h) ** 2).mean(1)) + 1e-9)
    on = db > TH[s]; runs = []; i = 0
    while i < n:
        j = i
        while j < n and on[j] == on[i]: j += 1
        runs.append([on[i], i * dt, j * dt]); i = j
    # merge short off-gaps into on-runs
    m = []
    for r in runs:
        if m and (not r[0]) and r[2] - r[1] < MINGAP and m[-1][0]: m[-1][2] = r[2]; continue
        if m and m[-1][0] == r[0]: m[-1][2] = r[2]; continue
        if m and r[0] and m[-1][0]: m[-1][2] = r[2]; continue
        m.append(r)
    mm = []
    for r in m:
        if mm and mm[-1][0] == r[0]: mm[-1][2] = r[2]
        else: mm.append(r)
    print(f"== {s} (threshold {TH[s]} dB): ON runs")
    print("  " + "  ".join(f"{a:.2f}-{b:.2f}" for o, a, b in mm if o and b - a >= 0.1))
