"""Tempo/key/energy/stem-activity analysis. Writes features.json and prints summaries."""
import json, numpy as np, librosa, warnings
warnings.filterwarnings("ignore")
SRC="/home/jade/Documents/proof/inputs/Proof.wav"; ST="stems/htdemucs/Proof/"
y,sr=librosa.load(SRC,sr=22050,mono=True)
dur=len(y)/sr; print("dur",dur)
# tempo
oenv=librosa.onset.onset_strength(y=y,sr=sr)
tempo,beats=librosa.beat.beat_track(onset_envelope=oenv,sr=sr,units="time")
print("beat_track tempo",tempo, "nbeats",len(beats))
ibi=np.diff(beats); print("median IBI bpm",60/np.median(ibi), "std",ibi.std())
# regress beats for precise bpm
k=np.arange(len(beats)); a,b=np.polyfit(k,beats,1); print("regressed bpm",60/a,"first beat offset",b, "max resid",np.abs(beats-(a*k+b)).max())
tg=librosa.feature.tempogram(onset_envelope=oenv,sr=sr); ac=tg.mean(axis=1); fr=librosa.tempo_frequencies(len(ac),sr=sr)
top=np.argsort(ac[1:])[::-1][:8]+1; print("tempogram peaks",[(round(fr[i],1),round(float(ac[i]),3)) for i in sorted(top)])
yd,_=librosa.load(ST+"drums.wav",sr=sr,mono=True)
td,bd=librosa.beat.beat_track(y=yd,sr=sr,units="time"); print("drum-stem tempo",td)
# key (Krumhansl) on harmonic part
yh=librosa.effects.harmonic(y)
ch=librosa.feature.chroma_cqt(y=yh,sr=sr).mean(axis=1)
maj=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); mi=np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
N="C C# D D# E F F# G G# A A# B".split(); sc=[]
for i in range(12):
    sc.append((np.corrcoef(np.roll(maj,i),ch)[0,1],N[i]+" major")); sc.append((np.corrcoef(np.roll(mi,i),ch)[0,1],N[i]+" minor"))
print("key candidates",[(n,round(c,3)) for c,n in sorted(sc,reverse=True)[:5]])
print("chroma",dict(zip(N,np.round(ch/ch.max(),2))))
yb,_=librosa.load(ST+"bass.wav",sr=sr,mono=True); cb=librosa.feature.chroma_cqt(y=yb,sr=sr,fmin=librosa.note_to_hz("C1"),n_octaves=4).mean(axis=1)
print("bass chroma",dict(zip(N,np.round(cb/cb.max(),2))))
tun=librosa.estimate_tuning(y=yh,sr=sr); print("tuning offset (semitone frac)",tun)
# per-second RMS dB for mix and stems, centroid
def db(x,hop=sr//2):
    n=len(x)//hop; return np.array([20*np.log10(np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2))+1e-9) for i in range(n)])
feat={"hop_s":0.5,"mix":db(y).round(1).tolist()}
for s in["vocals","drums","bass","other"]:
    ys,_=librosa.load(ST+s+".wav",sr=sr,mono=True); feat[s]=db(ys).round(1).tolist()
cen=librosa.feature.spectral_centroid(y=y,sr=sr,hop_length=sr//2,n_fft=4096)[0]; feat["centroid_hz"]=cen.round(0).tolist()
feat["beats"]=np.round(beats,3).tolist(); feat["bpm"]=float(60/a)
json.dump(feat,open("features.json","w"))
print("\n t    mix  voc  drm  bas  oth  cent")
for i in range(0,len(feat["mix"]),2):
    print(f"{i*0.5:5.0f} "+" ".join(f"{np.mean(feat[k][i:i+2]):5.1f}" for k in["mix","vocals","drums","bass","other"])+f" {np.mean(cen[i:i+2]):6.0f}")
