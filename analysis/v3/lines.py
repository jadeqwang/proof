"""v3: vocal-stem phrase runs (20 ms RMS > -36 dB, gaps < 0.18 s merged) to cross-check line starts/ends; beat counts between events; bar-grid check."""
import json, numpy as np, librosa, warnings
warnings.filterwarnings("ignore")
sr=22050; hop=441
y=librosa.load("stems/htdemucs/Proof/vocals.wav",sr=sr,mono=True)[0]
e=librosa.amplitude_to_db(librosa.feature.rms(y=y,frame_length=882,hop_length=hop,center=False)[0],ref=1.0,top_db=None)
def runs(a,b,th=-36,gap=0.18):
    i0=int(a*sr/hop); x=e[i0:int(b*sr/hop)]>th; out=[]; st=None
    for i,v in enumerate(list(x)+[False]):
        if v and st is None: st=i
        if not v and st is not None: out.append([a+st*hop/sr,a+i*hop/sr]); st=None
    m=[]
    for r in out:
        if m and r[0]-m[-1][1]<gap: m[-1][1]=r[1]
        else: m.append(r)
    return " ".join(f"{s:.2f}-{t:.2f}" for s,t in m if t-s>0.08)
for n,a,b in[("intro",8,21),("verse1",29.5,59.5),("pre",77.5,97),("chorus1",96,128),("verse2",127,146.5),("bridge",163,185),("verse3",184,214),("chorus2",214,238),("outro",243,264)]:
    print(n,":",runs(a,b))
f=json.load(open("features.json")); b=np.array(f["beats"]); ibi=np.diff(b)
print("bpm regressed",f["bpm"],"median beat",np.median(ibi),"bar",4*np.median(ibi))
for a,c,lab in[(19.30,30.16,"groove->verse1"),(30.16,59.18,"verse1"),(59.18,78.05,"break"),(78.05,96.8,"prechorus"),(98.22,127.16,"chorus1 hit->verse2"),(127.16,145.9,"verse2"),(145.9,156.14,"interlude a"),(156.14,163.82,"interlude b"),(156.14,184.90,"bass return->verse3 hit"),(184.90,213.38,"verse3 hit->drums back"),(216.12,244.9,"chorus2 full->cliff"),(264.54,275.30,"coda")]:
    n=((b>=a-0.15)&(b<c-0.15)).sum(); print(f"{lab:28s} {a:7.2f}->{c:7.2f} = {c-a:6.2f}s = {(c-a)/np.median(ibi):6.2f} beats = {(c-a)/np.median(ibi)/4:5.2f} bars; tracked beats {n}")
print("beats near events:")
for T in[19.30,59.18,98.22,156.14,184.90,213.38,216.12,244.9,264.54,275.3]:
    j=np.argmin(abs(b-T)); print(f"  {T:7.2f}: nearest beat {b[j]:.3f} ({b[j]-T:+.3f})")
print("IBI outliers (>0.66 or <0.55):",[(round(float(b[i]),2),round(float(ibi[i]),3)) for i in range(len(ibi)) if ibi[i]>0.66 or ibi[i]<0.55])
