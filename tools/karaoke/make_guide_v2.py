#!/usr/bin/env python3
"""Guide-vocal track for the -2sm render: full mix with the separated lead vocal turned down to
GAIN_DB (default -12 dB) = full - lead*(1-g). Stays on the FULL-MIX timeline (Suno's no-lead track
is a separate render that drifts up to ~0.4 s, so it can't be combined with the lead sample-wise).
Run: work/karaoke_venv/bin/python tools/karaoke/make_guide_v2.py [gain_db]"""
import sys, os, numpy as np, soundfile as sf, soxr
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
g_db = float(sys.argv[1]) if len(sys.argv) > 1 else -12.0
full, sr = sf.read(os.path.join(ROOT, "inputs", "Proof (-2sm).wav"), dtype="float64")
lead, lsr = sf.read(os.path.join(ROOT, "work/karaoke_v2/sep/full_(Vocals)_mel_band_roformer_karaoke_aufr33_viperx_sdr_10.wav"), dtype="float64")
lead = soxr.resample(lead, lsr, sr, quality="VHQ")
lead = np.pad(lead, ((0, max(0, len(full) - len(lead))), (0, 0)))[: len(full)]
out = full - lead * (1 - 10 ** (g_db / 20))
pk = np.abs(out).max()
if pk > 0.999: out *= 0.999 / pk
dst = os.path.join(ROOT, "media", "karaoke_v2", "audio", f"Proof_-2sm_guide_{int(g_db)}dB.wav")
sf.write(dst, out, sr, subtype="PCM_24"); print("wrote", dst, "peak", pk)
