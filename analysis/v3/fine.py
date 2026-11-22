"""v3: 20 ms stem envelopes -> on/off runs in windows of interest, for v3 and (same code) v2 stems, to pin event times and compare.
Also sibilance of 'looks' on the vocal stems, strongest drum hits in the coda, pitch of the vocalises."""
import numpy as np, librosa, warnings
warnings.filterwarnings("ignore")
sr=22050; hop=441
def load(d): return {s:librosa.load(d+s+".wav",sr=sr,mono=True)[0] for s in["vocals","drums","bass","other"]}
V3=load("stems/htdemucs/Proof/"); V2=load("../v2/stems/htdemucs/Proof/")
def env(y): return librosa.amplitude_to_db(librosa.feature.rms(y=y,frame_length=882,hop_length=hop,center=False)[0],ref=1.0,top_db=None)
E3={s:env(y) for s,y in V3.items()}; E2={s:env(y) for s,y in V2.items()}
def runs(e,a,b,th,gap=0.12,minlen=0.06):
    i0=int(a*sr/hop); x=e[i0:int(b*sr/hop)]>th; out=[]; st=None
    for i,v in enumerate(list(x)+[False]):
        if v and st is None: st=i
        if not v and st is not None:
            out.append([a+st*hop/sr,a+i*hop/sr,float(e[i0+st:i0+i].max())]); st=None
    m=[]
    for r in out:
        if m and r[0]-m[-1][1]<gap: m[-1][1]=r[1]; m[-1][2]=max(m[-1][2],r[2])
        else: m.append(r)
    return " ".join(f"{s:.2f}-{t:.2f}({p:.0f})" for s,t,p in m if t-s>=minlen)
TH=dict(vocals=-45,drums=-40,bass=-40,other=-34)
WIN=[("whispers",8,21,["vocals"]),("groove in",18.5,20.5,["drums","bass"]),("verse1 in",29.5,31,["vocals"]),("break",58,60,["vocals","bass"]),("break end",74.5,79.5,["vocals","bass"]),
 ("prechorus gap",83.5,89,["vocals"]),("drop+chorus1",93,99,["vocals","drums","bass"]),("tail1",114.5,128,["vocals"]),("good catch",139.5,146.5,["vocals","drums","bass"]),
 ("interlude",145.5,157,["drums","bass"]),("bridge in",162.5,166,["vocals"]),("stop1",182,186,["vocals","drums","bass"]),("stop2",207,217,["vocals","drums","bass"]),
 ("tail2+outro",232,266,["vocals"]),("cliff",243,247,["drums","bass","other"]),("outro pads",245,266,["other"]),("coda",260,278.4,["drums","bass","other"])]
for n,a,b,ss in WIN:
    print(f"== {n} {a}-{b}")
    for s in ss:
        print(f"  v3 {s:6s} >{TH[s]}: {runs(E3[s],a,b,TH[s])}")
        print(f"  v2 {s:6s} >{TH[s]}: {runs(E2[s],a,b,TH[s])}")
print("== vocal stem >5 kHz level, 50 ms frames 94.8-97.4 (is there a 'ks' on looks?)")
for nm,Y in[("v2",V2),("v3",V3)]:
    y=Y["vocals"][int(94.8*sr):int(97.4*sr)]; S=np.abs(librosa.stft(y,n_fft=1024,hop_length=1102,center=False))**2; fr=librosa.fft_frequencies(sr=sr,n_fft=1024)
    print(" ",nm," ".join(f"{v:4.0f}" for v in 10*np.log10(S[fr>5000].sum(axis=0)+1e-12)))
print("== strongest drum-stem frames (20 ms, > -14 dB) 262-276, v3")
e=E3["drums"]; i0=int(262*sr/hop); seg=e[i0:int(276*sr/hop)]
pk=[i for i in range(1,len(seg)-1) if seg[i]>-14 and seg[i]>=seg[i-1] and seg[i]>=seg[i+1]]
print("  "," ".join(f"{262+i*hop/sr:.2f}({seg[i]:.0f})" for i in pk))
print("== drum-stem onset times v3: 4.9-9, 16-20, 183.5-186, 212.5-215, 243.5-246, 259-267")
on=librosa.onset.onset_detect(y=V3["drums"],sr=sr,units="time",backtrack=False,hop_length=128)
for a,b in[(4.9,9),(16,20),(183.5,186),(212.5,215),(243.5,246),(259,267),(273.5,276)]: print(f"  {a}-{b}:",np.round(on[(on>a)&(on<b)],2))
print("== vocalise / held-note pitch (pyin 80-1200 Hz, median per 0.25 s), v3 then v2")
for nm,Y in[("v3",V3),("v2",V2)]:
    for a,b in[(115,119.5),(120.9,124.2),(232.7,237.6),(238.5,241.5),(262,265.8)]:
        y=Y["vocals"][int(a*sr):int(b*sr)]; f0,vf,_=librosa.pyin(y,fmin=80,fmax=1200,sr=sr,frame_length=2048,hop_length=256); tf=a+np.arange(len(f0))*256/sr
        o=[]
        for t in np.arange(a,b,0.25):
            m=(tf>=t)&(tf<t+0.25); v=vf[m].mean() if m.sum() else 0
            o.append(librosa.hz_to_note(np.nanmedian(f0[m])) if v>0.5 else "-")
        print(f"  {nm} {a}-{b}: "+" ".join(o))
print("== bass-stem pitch in coda/ring (pyin 30-200 Hz, 0.5 s), v3")
y=V3["bass"][int(264.5*sr):int(277.5*sr)]; f0,vf,_=librosa.pyin(y,fmin=30,fmax=200,sr=sr,frame_length=4096,hop_length=512); tf=264.5+np.arange(len(f0))*512/sr
print("  "," ".join(f"{t:.1f}:{librosa.hz_to_note(np.nanmedian(f0[(tf>=t)&(tf<t+0.5)])) if vf[(tf>=t)&(tf<t+0.5)].mean()>0.5 else '-'}" for t in np.arange(264.5,277.5,0.5)))
