"""Analysis for the spectrogram plate: check the lead stem against the master, compute the spectrograms and f0.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    PYTHONPATH=work/pylib $PY analyze.py                       # writes state/voice.npz and state/analysis.json

Everything is in master (full-mix) time, i.e. the time of inputs/Proof (-2sm).wav and of the *_full fields of
media/karaoke_v2/lyrics_timed.json.
"""
import argparse
import json
import os

import librosa
import numpy as np
import soundfile as sf
from scipy.signal import correlate, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
MASTER = os.path.join(ROOT, 'inputs', 'Proof (-2sm).wav')
STEM = os.path.join(ROOT, 'work', 'karaoke_v2', 'sep', 'full_(Vocals)_mel_band_roformer_karaoke_aufr33_viperx_sdr_10.wav')
LYRICS = os.path.join(ROOT, 'media', 'karaoke_v2', 'lyrics_timed.json')

SR = 16000            # analysis rate: everything below 8 kHz; the plate shows 0-4000 c.p.s.
T0, T1 = 186.0, 201.0  # analysed span (master time); covers both variants with room


def load(path, t0, t1, sr_out):
    info = sf.info(path)
    a, b = int(t0 * info.samplerate), int(t1 * info.samplerate)
    x, sr = sf.read(path, start=a, stop=b, dtype='float32', always_2d=True)
    x = x.mean(1)
    if sr != sr_out:
        from math import gcd
        g = gcd(sr, sr_out)
        x = resample_poly(x, sr_out // g, sr // g).astype(np.float32)
    return x


def align(stem_path, master_path):
    """Lag of the stem relative to the master, by cross-correlating the stem against the master over 30 s of
    vocal-heavy song (the stem is a separation of the mix, so it should correlate strongly at the true lag)."""
    sr = 8000
    res = {}
    for (a, b) in [(100.0, 130.0), (180.0, 210.0)]:
        m = load(master_path, a, b, sr)
        s = load(stem_path, a, b, sr)
        n = min(len(m), len(s))
        m, s = m[:n], s[:n]
        c = correlate(m, s, mode='full', method='fft')
        lags = np.arange(-n + 1, n)
        win = np.abs(lags) <= int(0.5 * sr)
        k = np.argmax(c[win])
        lag = lags[win][k]
        # parabolic refinement
        cc = c[win]
        if 0 < k < len(cc) - 1:
            y0, y1, y2 = cc[k - 1], cc[k], cc[k + 1]
            lag = lag + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)
        res[f'{a:.0f}-{b:.0f}'] = float(lag / sr)       # positive: master content is later than stem content
    return res


def stft_db(x, sr, bw_hz, hop):
    """Spectrogram with a Hann window whose -3 dB bandwidth is bw_hz (Hann -3 dB bw = 1.44 / T)."""
    T = 1.44 / bw_hz
    n = int(round(T * sr))
    nfft = 1 << int(np.ceil(np.log2(n * 4)))
    S = np.abs(librosa.stft(x, n_fft=nfft, hop_length=hop, win_length=n, window='hann', center=True)) ** 2
    f = np.fft.rfftfreq(nfft, 1 / sr)
    return (10 * np.log10(S + 1e-12)).astype(np.float32), f.astype(np.float32), n


def shs_track(nb_db, f_nb, prior_ok, prior_f0, fmin=150.0, fmax=520.0, nh=12, step_c=5.0, jump_c=25.0, lam=0.012):
    """Refine f0 on the narrow-band spectrogram itself by subharmonic summation (Hermes 1988) with a Viterbi path.

    Score of candidate f at a frame = sum_k 0.86^k * L(k f), L = the frame's log-power (dB above its own floor,
    clipped at 0) interpolated at the k-th harmonic. The path maximises total score minus lam * max(0, |cents jump| -
    jump_c) per 5 ms frame. Only frames where prior_ok is True are tracked; each run of such frames is its own path.
    So the gold line lies on the harmonics as drawn, and pyin/CREPE decide only where the voice is voiced."""
    cents = np.arange(1200 * np.log2(fmin / 100), 1200 * np.log2(fmax / 100) + step_c, step_c)
    cand = 100 * 2 ** (cents / 1200)
    L = nb_db - np.percentile(nb_db, 20, axis=0, keepdims=True)
    L = np.clip(L, 0, None)
    w = 0.86 ** np.arange(nh)
    out = np.full(nb_db.shape[1], np.nan, np.float32)
    # runs of prior_ok
    idx = np.where(prior_ok)[0]
    if len(idx) == 0:
        return out
    runs = np.split(idx, np.where(np.diff(idx) > 1)[0] + 1)
    dc = np.abs(cents[:, None] - cents[None, :])
    trans = -lam * np.clip(dc - jump_c, 0, None) * 1.0
    for r in runs:
        sc = np.zeros((len(r), len(cand)), np.float32)
        for j, i in enumerate(r):
            col = L[:, i]
            for k in range(nh):
                sc[j] += w[k] * np.interp(cand * (k + 1), f_nb, col, right=0)
        sc /= w.sum()
        # stay within +-150 cents of the prior (CREPE, else pyin): SHS only refines, it never picks an octave
        pc = 1200 * np.log2(prior_f0[r] / 100)[:, None]
        sc = np.where(np.abs(cents[None, :] - pc) <= 150, sc, -1e3).astype(np.float32)
        # Viterbi
        D = sc[0].copy()
        bp = np.zeros((len(r), len(cand)), np.int32)
        for j in range(1, len(r)):
            M = D[None, :] + trans               # [to, from]
            bp[j] = np.argmax(M, 1)
            D = M[np.arange(len(cand)), bp[j]] + sc[j]
        p = np.zeros(len(r), np.int32)
        p[-1] = int(np.argmax(D))
        for j in range(len(r) - 1, 0, -1):
            p[j - 1] = bp[j, p[j]]
        # parabolic refinement on the frame's score
        f = cand[p].copy()
        for j in range(len(r)):
            q = p[j]
            if 0 < q < len(cand) - 1:
                y0, y1, y2 = sc[j, q - 1], sc[j, q], sc[j, q + 1]
                den = y0 - 2 * y1 + y2
                if den < 0:
                    f[j] = 100 * 2 ** ((cents[q] + step_c * 0.5 * (y0 - y2) / den) / 1200)
        out[r] = f
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'state', 'voice.npz'))
    ap.add_argument('--no_crepe', action='store_true')
    args = ap.parse_args()
    os.makedirs(os.path.dirname(args.out), exist_ok=True)

    lag = align(STEM, MASTER)
    print('stem lag vs master (s):', lag)
    shift = float(np.mean(list(lag.values())))
    if abs(shift) < 0.002:
        shift = 0.0
    # stem time = master time - shift
    x = load(STEM, T0 - shift, T1 - shift, SR)
    hop = 80                                  # 5 ms
    nb, f_nb, n_nb = stft_db(x, SR, 45.0, hop)     # narrow band: 45 c.p.s. analysing filter, as the 1946 Sound Spectrograph
    wb, f_wb, n_wb = stft_db(x, SR, 300.0, hop)    # wide band: 300 c.p.s.
    t_spec = (T0 + np.arange(nb.shape[1]) * hop / SR).astype(np.float32)

    # f0, pyin: frame 2048 @16k (128 ms), hop 5 ms
    f0_p, vflag, vprob = librosa.pyin(x, fmin=110, fmax=1000, sr=SR, frame_length=2048, hop_length=hop,
                                      center=True, resolution=0.05, switch_prob=0.01, no_trough_prob=0.01)
    t_f0 = (T0 + np.arange(len(f0_p)) * hop / SR).astype(np.float32)
    rms = librosa.feature.rms(y=x, frame_length=1024, hop_length=hop, center=True)[0]
    out = dict(nb=nb, f_nb=f_nb, wb=wb, f_wb=f_wb, t_spec=t_spec, f0_pyin=f0_p.astype(np.float32),
               voiced_pyin=vflag, vprob_pyin=vprob.astype(np.float32), t_f0=t_f0, rms=rms[:len(t_f0)].astype(np.float32),
               sr=SR, hop=hop, T0=T0, T1=T1, shift=shift)

    if not args.no_crepe:
        import torch
        import torchcrepe
        xt = torch.from_numpy(x)[None]
        dev = 'cuda' if torch.cuda.is_available() else 'cpu'
        f0_c, per = torchcrepe.predict(xt, SR, hop, 110.0, 1000.0, 'full', return_periodicity=True, batch_size=1024,
                                       device=dev, decoder=torchcrepe.decode.viterbi)
        per = torchcrepe.filter.median(per, 3)
        f0_c = f0_c[0].cpu().numpy()
        per = per[0].cpu().numpy()
        n = min(len(f0_c), len(t_f0))
        out['f0_crepe'] = f0_c[:len(t_f0)].astype(np.float32)
        out['per_crepe'] = per[:len(t_f0)].astype(np.float32)

    # voicing: pyin voiced or CREPE periodicity > 0.6, and the voice above -45 dBFS; runs shorter than 50 ms dropped
    n = len(t_f0)
    rms_db = 20 * np.log10(out['rms'] + 1e-9)
    pc = out.get('per_crepe', np.zeros(n))
    fc = out.get('f0_crepe', np.full(n, np.nan))
    prior = np.where(pc > 0.5, fc, np.where(vflag[:n], f0_p[:n], np.nan))
    ok = (vflag[:n] | (pc > 0.6)) & (rms_db > -45) & np.isfinite(prior)
    # where both trackers are confident but disagree by more than 100 cents, the frame is doubtful: leave it out
    both = vflag[:n] & (pc > 0.5) & np.isfinite(f0_p[:n])
    dis = np.zeros(n, bool)
    dis[both] = np.abs(1200 * np.log2(fc[both] / f0_p[:n][both])) > 100
    ok &= ~(dis & (pc < 0.75))
    ok = ok.copy()
    idx = np.where(ok)[0]
    if len(idx):
        for r in np.split(idx, np.where(np.diff(idx) > 1)[0] + 1):
            if len(r) * hop / SR < 0.05:
                ok[r] = False
    nb_f = nb[:, :n]
    out['f0'] = shs_track(nb_f, f_nb, ok, np.where(np.isfinite(prior), prior, 200.0))
    out['voiced'] = ok
    np.savez_compressed(args.out, **out)
    # a short report
    rep = dict(stem_lag=lag, shift=shift, nb_window_ms=n_nb / SR * 1000, wb_window_ms=n_wb / SR * 1000)
    if 'f0_crepe' in out:
        both = vflag & (out['per_crepe'] > 0.5) & np.isfinite(f0_p)
        d = 1200 * np.log2(out['f0_crepe'][both] / f0_p[both])
        rep['pyin_vs_crepe_cents'] = dict(n=int(both.sum()), median=float(np.median(d)),
                                          p90_abs=float(np.percentile(np.abs(d), 90)),
                                          octave_errs=int((np.abs(d) > 600).sum()))
        for name, ref in [('shs_vs_pyin_cents', f0_p), ('shs_vs_crepe_cents', out['f0_crepe'])]:
            g = out['voiced'] & np.isfinite(ref) & np.isfinite(out['f0'])
            if name.endswith('crepe_cents'):
                g &= out['per_crepe'] > 0.5
            d = 1200 * np.log2(out['f0'][g] / ref[g])
            rep[name] = dict(n=int(g.sum()), median=float(np.median(d)), p90_abs=float(np.percentile(np.abs(d), 90)),
                             over_100c=int((np.abs(d) > 100).sum()))
    json.dump(rep, open(os.path.join(os.path.dirname(args.out), 'analysis.json'), 'w'), indent=1)
    print(json.dumps(rep, indent=1))


if __name__ == '__main__':
    main()
