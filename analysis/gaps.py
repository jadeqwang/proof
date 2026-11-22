import json, numpy as np, librosa, warnings
warnings.filterwarnings("ignore")
sr=22050; yv,_=librosa.load("stems/htdemucs/Proof/vocals.wav",sr=sr,mono=True)
f0,vf,vp=librosa.pyin(yv,fmin=80,fmax=900,sr=sr,frame_length=2048,hop_length=512); tf=np.arange(len(f0))*512/sr
rv=librosa.amplitude_to_db(librosa.feature.rms(y=yv,frame_length=2048,hop_length=512)[0])[:len(tf)]
for a,b in[(115.4,119.5),(121.1,124),(146,156),(233,237.6),(238.9,243),(76.4,78.1),(18.4,20.1),(8.8,11.3),(209.4,213.3)]:
    for s in np.arange(a,b,1.0):
        m=(tf>=s)&(tf<min(s+1,b)); v=vf[m].mean(); med=np.nanmedian(f0[m]) if v>0 else np.nan
        print(f"{s:6.1f} rms={rv[m].mean():6.1f} voiced={v:.2f} f0={librosa.hz_to_note(med) if med==med else '-'}")
    print()
for fn in["transcription_vocals_stem.json","transcription_full_mix.json"]:
    print(fn)
    for s in json.load(open(fn))["segments"]:
        for w in s["words"]:
            if w["p"]<0.6 or 40<w["start"]<46 or 50.5<w["start"]<53 or 131<w["start"]<139 or w["start"]>257: print(f"  {w['start']:7.2f} {w['w']:14s} p={w['p']}")
