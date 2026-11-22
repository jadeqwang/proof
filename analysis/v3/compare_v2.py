"""v3 vs v2, structural: (1) stem on/off transitions from the two detail.log files side by side,
(2) per-second stem level differences > 6 dB from the two features.json, (3) drum-stem onset-envelope lag per 8 s window,
(4) vocal-stem sibilance on 'looks' (v2 / v3 / manual edits), (5) end-of-file fade."""
import json, re, ast, numpy as np, librosa, warnings, glob
warnings.filterwarnings("ignore")
def trans(p):
    d={}
    for l in open(p):
        m=re.match(r"(drums|bass|vocals) (\[.*\])",l)
        if m: d[m[1]]=ast.literal_eval(m[2])
        m=re.match(r"other>-32: (\[.*\])",l)
        if m: d["other"]=ast.literal_eval(m[1])
    return d
A=trans("../v2/detail.log"); B=trans("detail.log")
for s in["drums","bass","vocals","other"]:
    print("==",s,"transitions (v2 | v3), matched to nearest within 1.5 s")
    b=list(B[s]); 
    for t,k in A[s]:
        c=[(abs(t2-t),t2) for t2,k2 in b if k2==k and abs(t2-t)<1.5]
        if c: d,t2=min(c); b=[x for x in b if x!=(t2,k)]; flag="" if d<0.15 else "  <-- moved"; print(f"  {k:3s} v2 {t:7.2f} | v3 {t2:7.2f}  d={t2-t:+.2f}{flag}")
        else: print(f"  {k:3s} v2 {t:7.2f} | v3    --     <-- only in v2")
    for t2,k in b: print(f"  {k:3s} v2    --   | v3 {t2:7.2f}  <-- only in v3")
fa=json.load(open("../v2/features.json")); fb=json.load(open("features.json"))
print("== per-second level, |v3-v2| >= 6 dB (stems) or >= 3 dB (mix)   t: stem v2->v3")
for i in range(0,min(len(fa["mix"]),len(fb["mix"]))-1,2):
    out=[]
    for s,th in[("mix",3),("vocals",6),("drums",6),("bass",6),("other",6)]:
        a=np.mean(fa[s][i:i+2]); b=np.mean(fb[s][i:i+2])
        if abs(a-b)>=th and max(a,b)>-45: out.append(f"{s} {a:.0f}->{b:.0f}")
    if out: print(f"  {i*0.5:5.0f}: "+", ".join(out))
print("section mean mix level v2 vs v3")
for n,(a,b) in dict(intro_pad=(0,5),taps=(5,19),groove=(20,30),verse1=(30,59),brk=(59,78),pre=(78,93.5),drop=(94,97),chorus1=(98.5,115),tail1=(115,127),verse2=(127,140),interlude_a=(147,156),interlude_b=(156,164.5),bridge=(164.5,182.5),verse3=(185,209),hush=(209.5,213),chorus2=(216,233),tail2=(233,244.5),outro=(245.5,263),coda=(266,275),ring=(275.5,278)).items():
    f=lambda F:10*np.log10(np.mean(10**(np.array(F["mix"][int(a*2):int(b*2)])/10)))
    print(f"  {n:12s} {a:6.1f}-{b:6.1f}  v2 {f(fa):6.1f}  v3 {f(fb):6.1f}")
sr=22050
def L(p): return librosa.load(p,sr=sr,mono=True)[0]
da=L("../v2/stems/htdemucs/Proof/drums.wav"); db=L("stems/htdemucs/Proof/drums.wav")
oa=librosa.onset.onset_strength(y=da,sr=sr,hop_length=64); ob=librosa.onset.onset_strength(y=db,sr=sr,hop_length=64); h=64/sr
print("== drum-stem onset-envelope lag (v3 relative to v2; + = later in v3), 8 s windows, search +-1.2 s")
W=int(8/h); S=int(1.2/h)
for t in range(0,272,8):
    i=int(t/h); x=oa[i:i+W]; x=x-x.mean()
    if len(x)<W or x.std()<1e-6: print(f"  {t:3d}: v2 silent"); continue
    best=(-2,0)
    for l in range(-S,S+1):
        j=i+l
        if j<0 or j+W>len(ob): continue
        y=ob[j:j+W]; y=y-y.mean()
        r=float(np.dot(x,y)/(np.linalg.norm(x)*np.linalg.norm(y)+1e-9))
        if r>best[0]: best=(r,l*h)
    print(f"  {t:3d}-{t+8:3d}: r={best[0]:.2f} lag={best[1]:+.3f}s")
print("== 'looks' sibilance: vocal-band >5 kHz level, 50 ms frames 94.9-96.6 s (mix, since edits have no stems)")
def hf(p):
    y,_=librosa.load(p,sr=44100,mono=True,offset=94.9,duration=1.7)
    S=np.abs(librosa.stft(y,n_fft=2048,hop_length=2205))**2; fr=librosa.fft_frequencies(sr=44100,n_fft=2048)
    return 10*np.log10(S[fr>5000].sum(axis=0)+1e-12)
for p in["../../inputs/older version/Proof.wav","../../inputs/Proof.wav"]+sorted(glob.glob("../../inputs/edits/Proof_looks-ks_v*.wav")):
    print(f"  {p.split('inputs/')[-1]:32s} "+" ".join(f"{v:4.0f}" for v in hf(p)))
print("== end of file, 0.1 s mix RMS dBFS from 274 s")
for nm,p in[("v2","../../inputs/older version/Proof.wav"),("v3","../../inputs/Proof.wav")]:
    y=L(p); print(nm," ".join(f"{20*np.log10(np.sqrt(np.mean(y[int(t*sr):int((t+0.25)*sr)]**2))+1e-9):.0f}" for t in np.arange(274,len(y)/sr-0.25,0.25)))
print("== start of file, 0.5 s mix RMS dBFS 0-6 s")
for nm,p in[("v2","../../inputs/older version/Proof.wav"),("v3","../../inputs/Proof.wav")]:
    y=L(p); print(nm," ".join(f"{20*np.log10(np.sqrt(np.mean(y[int(t*sr):int((t+0.5)*sr)]**2))+1e-9):.0f}" for t in np.arange(0,6,0.5)))
