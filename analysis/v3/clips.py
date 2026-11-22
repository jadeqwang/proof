"""v3: re-transcribe short excerpts (lyric-free gaps + contested words) on vocal stem and mix; primed (bias) tests for contested lines."""
import json, subprocess, sys
from faster_whisper import WhisperModel
m=WhisperModel("large-v3",device="cuda",compute_type="float16")
SRC=dict(voc="stems/htdemucs/Proof/vocals.wav",mix="../../inputs/Proof.wav")
CL=dict(intro=(0,31),break1=(58,79),post1=(113,128),v2=(126,147),interlude=(144,166),post2=(231,243.3),outro=(241,266),last=(256.5,264.5),coda=(262,278.4),tinier=(40,48.5),
        market=(131,136.6),catch=(136,145.8),truth=(169,174.2),shelved=(174,179.5),keep=(241.5,248),perky=(188,193.6),hug=(198,204))
WORDS=("last","v2","tinier","market","catch","truth","shelved","keep","perky","hug","outro")
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
        if n in WORDS:
            for s in r: print("     ",s["words"])
    json.dump(out,open("clips/retranscriptions.json","w"),indent=1)  # checkpoint
BIAS=dict(last=["And I can't think again.","And I can think again."],
          market=["Enthralled by an artichoke, market-fresh.","Enthralled by an artichoke, green and fresh."],
          truth=["Beauty on this side, truth by reference.","Beauty on this side, I choose by reference."],
          keep=["Keep the smile on so they don't know.","She can smile once so they don't know."],
          catch=["I point to the one he missed. Good catch!","I point to the warning list. Good catch!"],
          shelved=["Science fiction shelved with truth.","Science fiction shoved with truth."])
for n,biases in BIAS.items():
    a=CL[n][0]
    for k in SRC:
        for bias in biases:
            r=run(f"clips/{k}_{n}_{int(a)}.wav",bias); out[f"{k}_{n}_bias:{bias}"]=r
            print(f"== {k} {n}, prompt={bias!r}"); [print("  ",s["text"],s["words"]) for s in r]
json.dump(out,open("clips/retranscriptions.json","w"),indent=1)
