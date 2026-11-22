"""Fine-grained event times, beat/bar grid check, per-line voicing (whisper vs sung)."""
import json, numpy as np, librosa, warnings
warnings.filterwarnings("ignore")
ST="stems/htdemucs/Proof/"; sr=22050; hop=221  # ~10ms
env={}
for s in["vocals","drums","bass","other"]:
    y,_=librosa.load(ST+s+".wav",sr=sr,mono=True); env[s]=librosa.amplitude_to_db(librosa.feature.rms(y=y,frame_length=1024,hop_length=hop)[0],ref=1.0); 
    if s=="vocals": yv=y
    if s=="drums": yd=y
t=np.arange(len(env["drums"]))*hop/sr
def trans(s,th=-45,minlen=0.4):
    on=env[s]>th; out=[]; 
    # smooth: state must persist minlen
    k=int(minlen*sr/hop); st=on[0]; i=0
    while i<len(on)-k:
        if on[i]!=st and (on[i:i+k]==on[i]).mean()>0.9: st=on[i]; out.append((round(float(t[i]),2),"ON" if st else "off"))
        i+=1
    return out
for s in["drums","bass","vocals"]: print(s,trans(s,-50 if s!="vocals" else -45))
print("other>-32:",trans("other",-32,0.8))
# drum onsets early (first hits) and beat grid
on=librosa.onset.onset_detect(y=yd,sr=sr,units="time",backtrack=False)
print("first drum onsets",np.round(on[:12],2))
f=json.load(open("features.json")); b=np.array(f["beats"]); print("beats[:6]",b[:6],"period",np.median(np.diff(b)))
# strong drum onsets near key events
for T in[19.5,30,59,78,97.5,127,146,156,164.5,185,213.3,245]:
    w=on[(on>T-1.5)&(on<T+1.5)]; print(T,"onsets",np.round(w,2))
# voicing per segment
segs=json.load(open("transcription_vocals_stem.json"))["segments"]
f0,vf,vp=librosa.pyin(yv,fmin=80,fmax=700,sr=sr,frame_length=2048,hop_length=512)
tf=np.arange(len(f0))*512/sr
flat=librosa.feature.spectral_flatness(y=yv,n_fft=2048,hop_length=512)[0]
rv=librosa.amplitude_to_db(librosa.feature.rms(y=yv,frame_length=2048,hop_length=512)[0])
for s in segs:
    m=(tf>=s["start"])&(tf<=s["end"])&(rv[:len(tf)]>-45)
    if m.sum()==0: print(s["start"],"no energy",s["text"]); continue
    ff=f0[m]; v=vf[m].mean(); med=np.nanmedian(ff) if v>0 else np.nan
    lo,hi=(np.nanpercentile(ff,10),np.nanpercentile(ff,90)) if v>0.05 else (np.nan,np.nan)
    note=lambda h: librosa.hz_to_note(h) if h==h else "-"
    print(f"{s['start']:7.2f} voiced={v:4.2f} rms={rv[:len(tf)][m].mean():6.1f} flat={flat[:len(tf)][m].mean():.3f} f0med={note(med)} range={note(lo)}..{note(hi)} | {s['text'][:60]}")
