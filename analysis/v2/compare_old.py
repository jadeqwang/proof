"""Is the new mix sample-identical / time-aligned to the old one? Per-5s window lag + correlation."""
import numpy as np, librosa, warnings
warnings.filterwarnings("ignore")
sr=11025
a,_=librosa.load("../../inputs/older version/Proof.wav",sr=sr,mono=True)
b,_=librosa.load("../../inputs/Proof.wav",sr=sr,mono=True)
print("old",len(a)/sr,"new",len(b)/sr)
W=5*sr; L=int(0.5*sr)
for t in range(0,265,5):
    x=a[t*sr:t*sr+W]
    if len(x)<W: break
    best=(-2,0)
    for off in (0,):  # same position
        seg=b[max(0,t*sr-L):t*sr+W+L]
        c=np.correlate(seg,x,"valid"); n=np.sqrt(np.convolve(seg**2,np.ones(W),"valid")*np.sum(x**2))+1e-12
        r=c/n; i=int(np.argmax(r)); best=(float(r[i]),(i-(L if t*sr>=L else 0))/sr)
    # also search shifted by +11.12 s (duration difference) for the tail
    t2=t*sr+int(11.12*sr); seg=b[t2-L:t2+W+L]; r2=(-2,0)
    if len(seg)==W+2*L:
        c=np.correlate(seg,x,"valid"); n=np.sqrt(np.convolve(seg**2,np.ones(W),"valid")*np.sum(x**2))+1e-12
        r=c/n; i=int(np.argmax(r)); r2=(float(r[i]),(i-L)/sr+11.12)
    print(f"old {t:3d}-{t+5:3d}: same-pos r={best[0]:.3f} lag={best[1]:+.3f}s | shifted r={r2[0]:.3f} lag={r2[1]:+.3f}s")
