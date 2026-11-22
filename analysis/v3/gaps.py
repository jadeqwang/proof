"""v3: pitch/voicing in the lyric-free regions, fine envelopes of the tail and coda, low-probability words."""
import json, numpy as np, librosa, warnings
warnings.filterwarnings("ignore")
sr=22050; ST="stems/htdemucs/Proof/"
Y={s:librosa.load(ST+s+".wav",sr=sr,mono=True)[0] for s in["vocals","drums","bass","other"]}
yv=Y["vocals"]
f0,vf,vp=librosa.pyin(yv,fmin=80,fmax=900,sr=sr,frame_length=2048,hop_length=512); tf=np.arange(len(f0))*512/sr
rv=librosa.amplitude_to_db(librosa.feature.rms(y=yv,frame_length=2048,hop_length=512)[0])[:len(tf)]
for a,b in[(8.8,11.8),(18.4,20.1),(76,78.2),(115.3,119.5),(121,124),(146,156),(209.4,213.4),(232.8,237.5),(238.5,244.5),(243,264.5),(264.5,278)]:
    for s in np.arange(a,b,0.5):
        m=(tf>=s)&(tf<min(s+0.5,b)); v=vf[m].mean(); med=np.nanmedian(f0[m]) if v>0 else np.nan
        print(f"{s:6.1f} rms={rv[m].mean():6.1f} voiced={v:.2f} f0={librosa.hz_to_note(med) if med==med else '-'}")
    print()
# 0.25 s envelopes of every stem in the tail / coda and intro
def db(x,a,b,h=0.25):
    return [20*np.log10(np.sqrt(np.mean(x[int(t*sr):int((t+h)*sr)]**2))+1e-9) for t in np.arange(a,b,h)]
for a,b in[(4,21),(92,99),(139.5,143),(181.5,186),(207.5,217),(232,250),(250,278.4)]:
    print("   t    voc   drm   bas   oth")
    E={s:db(Y[s],a,b) for s in Y}
    for i,t in enumerate(np.arange(a,b,0.25)): print(f"{t:7.2f} "+" ".join(f"{E[s][i]:5.1f}" for s in["vocals","drums","bass","other"]))
    print()
# drum onsets + spectral centroid of drum stem: intro taps vs kit vs coda
yd=Y["drums"]; on=librosa.onset.onset_detect(y=yd,sr=sr,units="time",backtrack=False)
print("coda drum onsets",np.round(on[on>262],2))
print("intro onsets 14-20",np.round(on[(on>14)&(on<20)],2))
for n,(a,b) in dict(taps=(5.2,15),groove=(20,29),chorus2=(220,232),tail2=(236,244),coda_a=(264.5,266.0),coda_b=(266.0,275.3)).items():
    seg=yd[int(a*sr):int(b*sr)]; c=librosa.feature.spectral_centroid(y=seg,sr=sr)[0]; r=librosa.feature.rms(y=seg)[0]
    S=np.abs(librosa.stft(seg))**2; fr=librosa.fft_frequencies(sr=sr); lo=S[fr<120].sum()/S.sum()
    o=on[(on>a)&(on<b)]
    print(f"{n:8s} centroid(rms-weighted)={np.average(c,weights=r):6.0f} Hz  sub120Hz energy frac={lo:.2f}  rms={20*np.log10(np.sqrt(np.mean(seg**2))):.1f} dB onsets/s={len(o)/(b-a):.1f}")
# low-probability words in both whole-song passes
for fn in["transcription_vocals_stem.json","transcription_full_mix.json"]:
    print("\nlow-p words (<0.6)",fn)
    for s in json.load(open(fn))["segments"]:
        for w in s["words"]:
            if w["p"]<0.6: print(f"  {w['start']:7.2f}-{w['end']:7.2f} p={w['p']:.2f} {w['w']}")
