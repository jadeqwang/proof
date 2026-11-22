"""Re-transcribe short excerpts (lyric-free gaps + contested words) on vocal stem and mix; bias test for the last line."""
import json, subprocess, sys
from faster_whisper import WhisperModel
m=WhisperModel("large-v3",device="cuda",compute_type="float16")
SRC=dict(voc="stems/htdemucs/Proof/vocals.wav",mix="../../inputs/Proof.wav")
CL=dict(intro=(0,31),break1=(58,79),post1=(113,128),v2=(126,147),interlude=(144,166),post2=(231,246),outro=(243,268),last=(257,266),coda=(262,279),tinier=(40,48.5))
out={}
def run(path,prompt=None):
    segs,_=m.transcribe(path,language="en",word_timestamps=True,beam_size=5,vad_filter=False,condition_on_previous_text=False,initial_prompt=prompt,no_speech_threshold=0.9)
    return [dict(text=s.text.strip(),nsp=round(s.no_speech_prob,3),lp=round(s.avg_logprob,3),words=[(w.word.strip(),round(w.start,2),round(w.probability,3)) for w in s.words]) for s in segs]
for n,(a,b) in CL.items():
    for k,src in SRC.items():
        p=f"clips/{k}_{n}_{int(a)}.wav"
        subprocess.run(["ffmpeg","-v","error","-y","-ss",str(a),"-t",str(b-a),"-i",src,"-ac","1","-ar","16000",p],check=True)
        r=run(p); out[f"{k}_{n}"]=dict(offset=a,segs=r)
        print(f"== {k} {n} (+{a})"); [print("  ",s["text"],"| nsp",s["nsp"],"lp",s["lp"]) for s in r]
        if n in("last","v2","tinier"):
            for s in r: print("     ",s["words"])
for k in SRC:
    for bias in["And I can't think again.","And I can think again."]:
        r=run(f"clips/{k}_last_257.wav",bias); out[f"{k}_last_bias:{bias}"]=r
        print(f"== {k} last, prompt={bias!r}"); [print("  ",s["text"],s["words"]) for s in r]
json.dump(out,open("clips/retranscriptions.json","w"),indent=1)
