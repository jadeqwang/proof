"""Transcribe vocals with faster-whisper large-v3 (word timestamps). Usage: transcribe.py <wav> <out.json>"""
import sys, json, os, glob
# make pip-installed cudnn/cublas visible
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
prompt = sys.argv[3] if len(sys.argv) > 3 else None
m = WhisperModel("large-v3", device="cuda", compute_type="float16")
segs, info = m.transcribe(src, language="en", word_timestamps=True, beam_size=5,
                          vad_filter=False, condition_on_previous_text=False,
                          initial_prompt=prompt, no_speech_threshold=0.9)
res = []
for s in segs:
    res.append(dict(start=round(s.start,2), end=round(s.end,2), text=s.text.strip(),
                    avg_logprob=round(s.avg_logprob,3), no_speech_prob=round(s.no_speech_prob,3),
                    words=[dict(w=w.word.strip(), start=round(w.start,2), end=round(w.end,2), p=round(w.probability,3)) for w in (s.words or [])]))
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text.strip()}")
json.dump(dict(source=src, segments=res), open(out,"w"), indent=1)
