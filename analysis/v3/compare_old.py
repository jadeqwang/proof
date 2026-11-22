"""v3: is the new mix (inputs/Proof.wav) an edit or a re-render of the v2 file (inputs/older version/Proof.wav)?
1) sample-level: per-1s-window lag search (+-3 s) of old window in new, normalised correlation + residual level.
2) also against the manual edit experiments in inputs/edits/ (do they match the new file?)."""
import numpy as np, librosa, warnings, sys, glob
from scipy.signal import fftconvolve
warnings.filterwarnings("ignore")
sr=22050
def L(p): return librosa.load(p,sr=sr,mono=True)[0]
a=L("../../inputs/older version/Proof.wav"); b=L("../../inputs/Proof.wav")
print("old(v2)",len(a)/sr,"new(v3)",len(b)/sr,"diff",(len(b)-len(a))/sr)
def scan(a,b,W=1.0,S=3.0,step=1.0,quiet=False):
    Wn=int(W*sr); Sn=int(S*sr); rows=[]
    for t in np.arange(0,len(a)/sr-W,step):
        i0=int(t*sr); x=a[i0:i0+Wn]
        lo=max(0,i0-Sn); hi=min(len(b),i0+Wn+Sn); seg=b[lo:hi]
        if len(seg)<Wn or np.sum(x**2)<1e-8: rows.append((t,np.nan,np.nan,np.nan)); continue
        c=fftconvolve(seg,x[::-1],"valid"); n=np.sqrt(np.maximum(fftconvolve(seg**2,np.ones(Wn),"valid"),1e-12)*np.sum(x**2))
        r=c/n; i=int(np.argmax(r)); lag=(lo+i-i0)/sr
        y=seg[i:i+Wn]; g=np.dot(x,y)/max(np.dot(x,x),1e-12)
        res=10*np.log10((np.sum((y-g*x)**2)+1e-12)/(np.sum(y**2)+1e-12))
        rows.append((t,float(r[i]),lag,res,20*np.log10(abs(g)+1e-9)))
        if not quiet: print(f"old {t:6.1f}: r={r[i]:.4f} lag={lag:+.4f}s resid={res:6.1f} dB gain={20*np.log10(abs(g)+1e-9):+.2f} dB")
    return rows
print("== v2 file -> v3 file, 1 s windows")
scan(a,b)
for p in sorted(glob.glob("../../inputs/edits/Proof_looks-ks_v*.wav")):
    e=L(p); n=min(len(e),len(b)); 
    print("==",p.split("/")[-1],"len",len(e)/sr)
    rows=scan(e,b,W=5.0,S=3.0,step=5.0,quiet=True)
    print("  5s windows: "+" ".join(f"{int(t)}:{r:.2f}/{lag:+.2f}" for t,r,lag,*_ in rows if r==r))
