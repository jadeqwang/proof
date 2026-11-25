import json, sys
import numpy as np
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
z = np.load(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), 'state', 'voice.npz'))
L = json.load(open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', '..', 'karaoke_v2', 'lyrics_timed.json')))['lines']
t0, t1, fmax, out = float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
S, f, t = z['nb'], z['f_nb'], z['t_spec']
m = (t >= t0) & (t <= t1); fm = f <= fmax
fig, ax = plt.subplots(figsize=(22, 9))
D = S[fm][:, m]; vmax = np.percentile(D, 99.7)
ax.imshow(D, origin='lower', aspect='auto', extent=[t[m][0], t[m][-1], 0, fmax], cmap='gray_r', vmin=vmax - 50, vmax=vmax)
tf = z['t_f0']; mm = (tf >= t0) & (tf <= t1)
fc = np.where(z['per_crepe'] > 0.5, z['f0_crepe'], np.nan)
ax.plot(tf[mm], z['f0_pyin'][mm], 'r.', ms=2, label='pyin')
ax.plot(tf[mm], fc[mm], 'c.', ms=1.5, label='crepe')
f0 = z['f0']
for k in (1, 2, 3, 4):
    ax.plot(tf[mm], k * f0[mm], '-', color='gold', lw=1.2, label='shs' if k == 1 else None)
for l in L:
    for w in l['words']:
        if t0 <= w['s_full'] <= t1:
            ax.axvline(w['s_full'], color='orange', lw=0.8); ax.text(w['s_full'], fmax * 0.95, w['w'], color='orange')
ax.legend(); ax.set_xticks(np.arange(np.ceil(t0 * 10) / 10, t1, 0.1)); ax.tick_params(axis='x', labelsize=7)
plt.tight_layout(); plt.savefig(out, dpi=80)
