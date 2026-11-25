# The voice, as a spectrograph plate

A short clip for Verse 3 of "Proof": on "Hug durations, pitch contours" (master 3:11.57-3:14.15) the screen shows a
narrow-band spectrogram of that very line, in her own voice, drawing itself in real time with the sung pitch
contour (the fundamental) traced in gold. Drawn as a plate in the family of `../frost/` (PLATE XIV) and `../neuron/`
(PLATE IX): "THE VOICE. / PLATE XXI.", "Fig. 7.—Narrow-band spectrogram of the phrase 'hug durations, pitch
contours,' sung; the fundamental traced." / "Analysing filter 45 cycles wide. Below, the fundamental on an enlarged
scale of semitones." Model: the sound-spectrograph plates of Potter, Kopp & Green, *Visible Speech* (Bell Labs, 1947).
Everything is drawn by code from the audio. No image model was used.

Status (2026-11-25): analysis done, look settled, all deliverables rendered (see the log at the end).

## Files

| Path | What |
|---|---|
| `analyze.py` | checks the lead stem against the master; computes both spectrograms and the f0 track -> `state/voice.npz` |
| `render.py` | the plate renderer, any frame in any order; variants, layout, words and inks are constants at the top |
| `check_sync.py` | sync check of a preview: audio offset, playhead position per frame, gold vs word onsets |
| `diag.py` | diagnostic plot: spectrogram with pyin, CREPE, final f0 (and its harmonics) and the lyric onsets |
| `make_all.sh` | renders every file below (about 2 min on 12 cores) |
| `state/voice.npz` | spectrograms (narrow and wide), pyin, CREPE and final f0, voicing, for master 186-201 s |
| `state/analysis.json` | stem/master lag, window lengths, agreement between the pitch trackers |
| `out/spectrogram_short_master_prores422hq.mov` | **the shot**: 5.00 s, 120 frames, master 190.45-195.45 s. ProRes 422 HQ 10-bit, bt709 (git-ignored) |
| `out/spectrogram_short_preview_audio.mp4` | H.264 of the same, **with the master's audio** for that span, to check sync |
| `out/spectrogram_long_master_prores422hq.mov` | the longer option: 12.00 s, 288 frames, master 188.05-200.05 s ("I nod, past hour reviewed / Hug durations, pitch contours / Room crossing velocity") |
| `out/spectrogram_long_preview_audio.mp4` | its H.264 with audio |
| `out/spectrogram_{short,long}_ink_*` | the alternative animation: the whole plate is there faintly from frame 0 and inks in as sung |
| `out/spectrogram_{short,long}_alpha_prores4444.mov` | the figure only (panels, scales, words, spectrogram, gold) on a transparent ground, for overlay on her face. ProRes 4444 (yuva444p12le), straight alpha (git-ignored) |
| `stills/` | PNG stills (file names carry the master time), an ink-mode still, a wide-band comparison, and an RGBA 16-bit alpha still |
| `work/` | diagnostics, test stills, the local torchcrepe install (`work/pylib`); git-ignored, can be deleted |

Fonts are read from `../frost/fonts/` (IM FELL English, OFL), not copied.

## Audio source and sync

- Master: `inputs/Proof (-2sm).wav` (48 kHz). All times here are master seconds, the `*_full` fields of
  `media/karaoke_v2/lyrics_timed.json`.
- Lead vocal: `work/karaoke_v2/sep/full_(Vocals)_mel_band_roformer_karaoke_aufr33_viperx_sdr_10.wav` (44.1 kHz,
  aufr33/viperx karaoke roformer on the full mix). **Alignment checked**: cross-correlation of stem against master
  over 100-130 s and 180-210 s gives a lag of 0.0000 s (under 1 us) in both, so the stem is in master time with no
  offset. (Not to be confused with the separate Suno "no lead vocals" render, which drifts; see STATUS.md.)
- Clip timing: frame i shows the plate at t = clip_start + i/24. The x position of the playhead is linear in t over
  the figure's time axis; the spectrogram frames and f0 frames are centre-stamped, so a column of ink appears when the
  sound at that instant is heard. Short: axis 191.45-194.35 s (2.90 s across 1520 px, 524 px/s, 21.8 px per frame);
  clip 190.45-195.45 s (1 s of bare plate before, about 1.1 s of finished plate after, as handles). Long: axis
  189.05-199.15 s (150 px/s), clip 188.05-200.05 s.
- To cut the short clip into the film: place its first frame at master 190.45 s (3:10.45). The long one at 188.05 s
  (3:08.05).

## Method

**Spectrograms** (`analyze.py`), on the lead stem resampled to 16 kHz, 5 ms hop:
- narrow band: Hann window 32 ms (512 samples), whose -3 dB bandwidth is 1.44/T = 45 Hz: the "45-cycle" analysing
  filter of the 1946 Sound Spectrograph. Harmonics of her voice (f0 about 200-420 Hz) are resolved as stacked lines.
- wide band: Hann 4.8 ms, 300 Hz bandwidth (the spectrograph's other filter). Harmonics are not resolved (formant
  bars and glottal striations instead), so the gold line sits on an undifferentiated dark bar. **Narrow band chosen**;
  the wide band is a comparison still and `--band wide`.

**Pitch (f0)**: three trackers, combined.
- pyin (librosa, 110-1000 Hz, 128 ms frames) and CREPE (torchcrepe "full", Viterbi decoding, periodicity
  median-filtered). Over the analysed span they agree to a median of 1 cent, with 40 octave-error frames.
- Voicing: pyin voiced or CREPE periodicity > 0.6, voice above -45 dBFS; frames where both trackers are confident but
  disagree by over 100 cents and CREPE periodicity is under 0.75 are left out; runs under 50 ms dropped.
- Final f0: subharmonic summation (Hermes 1988) on the narrow-band spectrogram itself (12 harmonics, weights 0.86^k,
  5-cent grid with parabolic refinement), restricted to +-150 cents of the CREPE (else pyin) estimate, with a Viterbi
  path that penalises jumps beyond 25 cents per 5 ms. So the gold line lies exactly on the harmonics as drawn, and the
  neural trackers only decide where she is voiced and which octave. Agreement with CREPE: median -1.8 cents, 90% of
  frames within 28 cents.
- In the render: each voiced run loses one 5 ms frame at each end (onset wobble), runs under 60 ms are not drawn, and
  log-f0 is smoothed with a 10 ms Gaussian within each run, never across a break. Breaks fall at the unvoiced
  consonants: the h of "hug", "-tions" (sh), "pitch" (p, tch), "con-tours" (k, t).
- The song is tuned to A440: held notes sit a median 1 cent from equal temperament. The line as traced: "hug"
  c#' falling to c'; a short low run at g-g# (the voiced closure of g into d, where only the fundamental sounds);
  "du-ra-" rising from a/b-flat to c'; "-tions" b/b-flat; "pitch" c'-c#'; "con-" c#'; "-tours" falling slowly from
  c#' to about a.

**Drawing** (`render.py`), 1920x1080, layout scaled for other sizes:
- Sheet: frost's paper (same seed and recipe: cream, toned margins, foxing, grain), with a faint laid-and-chain
  texture added; frost's double plate rule at frost's PANE; IM FELL header and caption at frost's positions and sizes.
- Panel A (250-1770 x 92-600): the spectrogram, linear frequency 0-3500 cycles per second (Visible Speech's scale),
  scale numbered every 500. Level: the loudest 0.3% of the figure's cells are full black, 38 dB below that is bare
  paper, eased (smoothstep, gamma 1.25). Inked as a fine horizontal line screen (2.6 px, the stylus's scan lines; line
  width carries the tone, closing up to solid in the darkest marks) with a burnt-paper grain. Drawn at 2x and
  area-averaged down.
- Gold (0.80, 0.60, 0.22, with a slight sheen variation): the fundamental over the first harmonic in panel A (3.8 px),
  with a 2 px paper halo that clears the ink under it (an engraver's clearance), and again in panel B.
- Panel B (250-1770 x 676-852): the fundamental enlarged, on a semitone scale (hairline per semitone, firmer for
  naturals, Helmholtz names: g a b c' d'...; range = the contour's own range plus one semitone each way).
- The words between the panels, IM FELL italic, each at its onset: word onsets from lyrics_timed.json, syllable
  splits in the short variant read off the voicing breaks (du- 191.932, ra- 192.09, tions 192.32, con- 193.11,
  tours 193.43). The long variant has whole words only.
- Time scale under both panels, ticks every 0.1 s, numbered every 0.5 s (short, as 0·5 with a raised point) or 1 s
  (long), "TIME IN SECONDS."

**Animation** (default `--mode draw`): before the figure starts, the plate with its scales and caption but no
spectrogram, no gold and no words. The playhead
(an ink hairline through both panels) fades in 0.25 s before the axis start, then moves in real time; everything left
of it is inked (a 1.5 px soft edge), the gold is drawn up to it, and a gold bead rides the contour at the playhead
while she is voicing. Each word fades in over 0.12 s from its onset. After the axis end the playhead fades and the
finished plate holds. `--mode ink`: the whole plate is present at 13% from the first frame and inks in at the
playhead in the same way. Every random field is seeded and fixed: nothing flickers.

## Re-render

```
cd /home/jade/Documents/proof/media/footage/spectrogram
PY=/home/jade/Documents/halys-video/.venv/bin/python      # numpy, scipy, cv2, PIL, librosa, torch+CUDA (CREPE)
PYTHONPATH=work/pylib $PY analyze.py                      # analysis -> state/voice.npz (about 30 s)
bash make_all.sh                                          # every mov, preview, still
# single pieces:
$PY render.py --variant short --still 193.6 --out work/x.png          # a frame at master time 193.6 s
$PY render.py --variant long --mode ink --mov out/x.mov
$PY render.py --variant short --alpha --frames work/png               # RGBA PNG sequence instead of ProRes 4444
$PY render.py --variant short --band wide ...                         # wide-band version
```

torchcrepe is not in that venv: `uv pip install --python $PY --target work/pylib --no-deps torchcrepe resampy`
(analyze.py feeds it 16 kHz audio so resampy is never called). `analyze.py --no_crepe` runs without it (pyin only
for voicing and prior; expect more octave slips).

**For a new master** (a new Suno render or a new mix):
1. Separate the lead vocal from the new full mix (as STATUS.md's karaoke v2: audio-separator, the aufr33 viperx
   karaoke roformer) and point `STEM` and `MASTER` at the top of `analyze.py` at the new files.
2. Run `analyze.py`. It prints the stem's lag against the master; if it is not 0 the script shifts the stem by it
   (check `state/analysis.json`). If the line moved in time, change `T0, T1` (the analysed span) to cover it.
3. Get the new word onsets (re-run the karaoke alignment, or read them off `diag.py`'s plot:
   `$PY diag.py T0 T1 1300 work/d.png`), and update each variant's `axis`, `clip` and `sylls` in `render.py`.
   If the lyrics changed, change `caption` too.
4. Look at a still against `diag.py`'s plot (the gold must lie on the lowest harmonic), then `bash make_all.sh`.

Knobs in `render.py`: `FMAX` (top of the frequency scale), `db_range` and `gamma` (how much of the quiet detail is
inked), `ghost` (ink-mode faintness), the screen period `P` in `_spec`, gold widths in `_gold`, `GOLD`.

## Checks (2026-11-25)

`check_sync.py VARIANT PREVIEW.mp4` (run from this folder) decodes a preview and measures:
- audio: the preview's audio against the master: short starts at 190.45000 s, long at 188.05000 s, offset 0.00 ms.
- playhead: its x in every frame of the preview against the x expected for that frame's time: mean error 0.00 px,
  worst 0.13 px (0.2 ms short, 0.8 ms long). So picture and sound are locked to the frame.
- word onsets vs the gold: where a word starts after a break in voicing, the gold resumes 8-68 ms after the lyric
  onset ("durations" +8, "pitch" +15, "contours" +35, "hug" +68 ms), i.e. after the unvoiced consonant (d, p, k, h),
  which is where it should. Words sung legato ("I nod", "reviewed", "velocity") have no break: the gold runs through.
  "Room" (+125 ms): its scooped onset (170 -> 230 Hz) is drawn in the spectrogram but neither tracker was confident
  enough there, so the gold starts at the top of the scoop.
- the lyric onsets themselves were forced-aligned on this same stem (STATUS.md, karaoke v2), so they share its time
  base.

## Log

- Stem vs master: lag 0 (checked by cross-correlation in two places).
- Tried the frequency range: f0 sits in the bottom 6-12% of a 0-3500 scale and moves only a few pixels there, so the
  melody is unreadable in the spectrogram alone. Hence panel B, the fundamental enlarged on a semitone scale (the
  pitch graphs of Seashore's and Metfessel's phonophotography of singing, 1920s-30s, are the period model).
- pyin alone lags the fast falls (on "hug" it stays at 235 Hz where the harmonics show 210 Hz); SHS on the drawn
  spectrogram, constrained to CREPE, follows them. Unconstrained SHS jumped octaves at run ends; constraining fixed it.
- Narrow vs wide band: narrow chosen (stills/…wideband_comparison.png).
- Draw vs ink mode: draw is the default (the plate is made as she sings, which is the point); ink rendered as an
  option.
