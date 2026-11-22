# Proof — song map for video planning

Source: `inputs/Proof.wav` (4:28.00, 48 kHz stereo, Suno). All times are seconds from file start (m:ss in brackets).
Method: demucs `htdemucs` stem separation -> faster-whisper large-v3 with word timestamps on the vocal stem AND on the full mix (two independent passes) -> librosa for tempo, key, per-stem energy, pitch/voicing.

Legend: **[M]** = measured from the audio, **[G]** = inferred/guessed, wants a human ear.

## 1. Tempo, key, metre

| | Value | Confidence |
|---|---|---|
| Tempo | **99.4 BPM** (beat 0.604 s, bar 2.415 s) | [M] full mix and drum stem agree; inter-beat std 0.02 s, so steady throughout |
| Key | **C minor** | [M] Krumhansl chroma correlation 0.83; runner-up Eb major (the relative major) 0.61. Bass and the held vocal notes centre on C. Tuning is at concert pitch (+0.02 semitone) |
| Time signature | **4/4** | [G] not directly measured, but sections come out as whole 4-beat bars (instrumental break = 19.28 s = 32.0 beats; verse 3 = 39.9 beats) |
| Loudness | LRA 8.8 LU, true peak -4.2 dBFS | [M] |

Beat times are in `features.json` (`beats`). Caution: the band re-entries after the two full stops (185.0, 213.4) are not a whole number of bars from the preceding grid, so treat the grid as restarting at each of those hits [G]. Cut to the measured hit times below rather than to an extrapolated grid.

## 2. Section map

| # | Section | Start | End | Length | What happens |
|---|---|---|---|---|---|
| 1 | Intro a — pad | 0.00 (0:00) | 5.13 (0:05) | 5.1 s | Pad fades in alone. No rhythm. |
| 2 | Intro b — taps + whispers | 5.13 (0:05) | 19.45 (0:19) | 14.3 s, ~6 bars | Hand-tap percussion enters 5.13, quiet, steps up at ~11.1. Whisper 1 at 8.9-11.25, whisper 2 at 18.5-20.0. |
| 3 | Intro c — groove | 19.45 (0:19) | 30.17 (0:30) | 10.7 s, ~4.5 bars | **Bass + full beat drop in at 19.45**, on the tail of "not like that". No vocals. |
| 4 | Verse 1 | 30.17 (0:30) | 59.28 (0:59) | 29.1 s, 12 bars | Sparse: voice + drums, bass only in short stabs, pads low. |
| 5 | Instrumental break | 59.28 (0:59) | 78.1 (1:18) | 18.8 s, **8 bars** | Bass sustained, melodic "other" stem (piano/pads) up ~8 dB. No vocals 59.3-76.5. Whether drums are truly half-time was not verified [G]. |
| 6 | Pre-chorus | 78.1 (1:18) | 96.8 (1:37) | 18.7 s | Lyric-free gap 84.4-87.7 (3.3 s) between the two couplets. **Drums + bass cut out at 93.6**; "that's just how it looks" is sung over pads only. |
| 7 | Chorus 1 | 96.8 (1:37) | 115.4 (1:55) | 18.6 s | "How do you feel" starts as a near a-cappella pickup at 96.8; **full band hits at 98.3**. |
| 8 | Post-chorus tail (not in prompt) | 115.4 (1:55) | 127.2 (2:07) | 11.8 s | Full band continues. "go" is held on D4 to 119.4, then a wordless high vocalise 121.2-123.9. No lyrics. |
| 9 | Verse 2 | 127.2 (2:07) | 145.7 (2:26) | 18.5 s | Back to sparse texture. **Drums stop 140.6-142.05** around "Good catch!" (mix dips ~7 dB). |
| 10 | Arpeggio interlude a — thinned | 146.0 (2:26) | 156.2 (2:36) | 10.2 s, ~4 bars | Drums fall ~12 dB at 147, bass out from 149.0, brightness halves. Drums creep back up 151-156. A faint sustained vocal-stem tone on C (-36 to -43 dB) may be a hum or just stem bleed [G]. |
| 11 | Arpeggio interlude b — full | 156.2 (2:36) | 164.7 (2:45) | 8.5 s, ~4 bars | **Bass returns 156.2**; synth/arpeggio stem at its loudest of the whole song. No vocals. |
| 12 | Bridge | 164.7 (2:45) | 184.6 (3:05) | 19.9 s | Full band, loud. **Hard stop at 182.8**: 2.2 s of near silence (-35 dB) with only the tail of "proof". |
| 13 | Verse 3 | 185.0 (3:05) | 208.9 (3:29) | 23.9 s, 10 bars | **Full band slams in at 185.0** with "Housewarming". Much denser/louder than verses 1-2. |
| 14 | Full stop — "I think he's right. Honestly." | 209.0 (3:29) | 213.4 (3:33) | 4.4 s | Everything cuts at 209.0. Line delivered very quietly 209.5-212.8 (15 dB below normal vocal level) into near silence. |
| 15 | Chorus 2 | 213.4 (3:33) | 233.1 (3:53) | 19.7 s | **Drums re-enter alone at 213.4**, vocal at 214.1, **bass + full arrangement at 216.2**. |
| 16 | Post-chorus tail 2 (replaces percussion break) | 233.1 (3:53) | 245.1 (4:05) | 12.0 s | Full band at peak loudness. Held "go" to 237.6, vocalise 239.0-243.0. Outro line 1 ("Keep the smile on") begins ~242 over the full band. |
| 17 | Outro | 245.1 (4:05) | 263.3 (4:23) | 18.2 s | **Hard cut at 245.1**: drums and bass gone for good. Voice nearly a cappella with faint pads; silences at 247.4-249.1, 252.2-253.6, 258.0-258.75. |
| 18 | Final pad | 263.2 (4:23) | 268.0 (4:28) | 4.8 s | Pad swell on the last word, fading to end. |

### Instrumental / lyric-free gaps [M]

| Gap | Start-End | Length |
|---|---|---|
| Before whisper 1 | 0.0-8.9 | 8.9 s |
| Between whispers | 11.25-18.5 | 7.25 s |
| Whisper 2 to verse 1 | 20.0-30.17 | 10.2 s |
| Instrumental break | 59.28-76.5 (vocal proper at 78.1) | 17.2 s (18.8 s) |
| Inside pre-chorus | 84.4-87.7 | 3.3 s |
| Post-chorus 1 (wordless voice present) | 115.4-127.2 | 11.8 s |
| Arpeggio interlude | 145.7-164.7 | 19.0 s |
| Stop before verse 3 | ~183.5-185.0 | ~1.5 s |
| Post-chorus 2 (wordless voice present) | 233.1-~242.0 | ~8.9 s |
| After last word | 263.3-268.0 | 4.7 s |

## 3. Timestamped lyrics, aligned to the prompt

Times are line start-end from word timestamps (accuracy roughly +/-0.2 s; line starts in dense verses are the least certain). Word-level data: `transcription_vocals_stem.json`, `transcription_full_mix.json`.

| Start | End | Sung line | Note |
|---|---|---|---|
| **Intro** | | | |
| 8.9 | 11.25 | You need facial expressions | **Whispered** [M: 0% pitched frames] |
| 18.5 | 20.0 | But not like that | **Whispered** [M: ~5% pitched] |
| **Verse 1** | | | Low, narrow (C4-D4 mostly), half-spoken feel; pitched [M] |
| 30.2 | 33.7 | Three years old, uncle explains atoms | |
| 34.3 | 37.8 | A week later my mother finds me | |
| 37.8 | 41.1 | sat in a snow drift of paper | Line break shifted: "sat in" starts this line rather than ending the previous |
| 41.3 | 42.9 | ripped to shreds | |
| 43.6 | 45.2 | **"at the tiny earth"** (heard) | **DEVIATION**: prompt "Ever tinier". Both passes hear the same thing — see below |
| 45.2 | 48.0 | repeating what uncle said | |
| 48.0 | 50.8 | What on earth are you doing? | |
| 50.9 | 53.0 | The adults howl with laughter | |
| 53.0 | 55.5 | What's so funny? | |
| 55.5 | 58.3 | Nobody tells me after | |
| **Pre-chorus** | | | |
| 78.1 | 81.4 | She doesn't talk like other children | |
| 81.4 | 83.9 | Her English comes from books | Parenthetical; sung by the lead, no separate backing voice detected [G] |
| 87.5 | 91.1 | She doesn't make much expression | |
| 91.1 | 95.7 | For our culture, that's just how it looks | Band drops out at 93.6 under "that's just how it looks" |
| **Chorus 1** | | | Range opens up to C5 |
| 96.8 | 100.1 | How do you feel? Inside? | Band hits at 98.3 |
| 102.6 | 105.4 | I honestly don't know | |
| 105.4 | 110.4 | I open my mouth, my voice goes blind | |
| 111.2 | 115.4 | The words have nowhere to go | "go" held to 119.4 |
| 121.2 | 123.9 | (wordless vocalise) | **ADDED**, not in prompt |
| **Verse 2** | | | |
| 127.2 | 129.2 | Resting oblivious face | |
| 129.2 | 131.6 | Blocking the aisle, in the wrong place | |
| 131.6 | 133.1 | Transfixed by an artichoke | "artichoke" heard as "auto-choke" by both passes — pronunciation is off [G] |
| 133.1 | 134.3 | supermarket-fresh | |
| 134.3 | 136.4 | Sacred geometry made flesh | |
| 136.4 | 138.9 | Down in the basement, Dad's code, I watch | "Dad's code" heard as "that's code" / "dad's coat" — probably as written, slightly unclear [G] |
| 138.9 | 141.3 | I point to the one he missed. "Good catch!" | "Good catch" ~140.4-141.3, drums stop under it |
| 141.3 | 145.7 | Did she understand or just pattern match? | |
| **Bridge** | | | |
| 164.7 | 167.1 | Do you not see what I see? | |
| 167.1 | 169.5 | Does it matter what makes me me? | |
| 169.6 | 173.4 | Beauty on this side, truth by inference | |
| 174.5 | 176.8 | Science fiction shelved with truth | |
| 176.8 | 179.3 | From inside, I can't tell the difference | |
| 179.8 | 184.6 | And I can't give you proof | "proof" rings into the stop at 182.8 |
| **Verse 3** | | | |
| 185.0 | 188.5 | Housewarming, lemonade from the yard | |
| 188.5 | 191.2 | Perky American girl | |
| 191.2 | 193.5 | I play the part | |
| 193.5 | 196.0 | He said I absolutely nailed it | |
| 196.0 | 198.5 | Well, fifteen percent above amplitude | |
| 198.5 | 201.2 | I nod, the past hour gets reviewed | |
| 201.2 | 204.0 | Hug durations, pitch contours | |
| 204.0 | 207.4 | Room crossing velocity | |
| 209.5 | 212.8 | I think he's right. Honestly. | **Very quiet, breathy** (vocal -41 dB vs ~-25 normal; pitched on F4-G4, trailing to unpitched) over silence [M] |
| **Chorus 2** | | | |
| 214.1 | 218.2 | How do you feel? Inside? | Top note of the song (B4-C5) |
| 220.5 | 223.1 | I honestly don't know | |
| 223.1 | 228.1 | I open my mouth, my voice goes blind | |
| 229.1 | 233.1 | The words have nowhere to go | "go" held to 237.6 |
| 239.0 | 243.0 | (wordless vocalise) | **ADDED** |
| **Outro** | | | Soft, sung, exposed |
| 242.0 | 247.4 | Keep the smile on so they don't know | Starts over full band; band cuts at 245.1 just before "so they don't know" |
| 249.1 | 252.2 | This is how we fit in | |
| 253.6 | 258.0 | She turns around, I let it go | |
| 258.75 | 263.3 | And I can think again | **AMBIGUOUS**: stem pass hears "can", full-mix pass hears "can't" |

### Deviations from the prompt

Structure:
1. **Percussion break is missing.** After chorus 2 there is no drop to taps + pads; the full band keeps playing at peak level (233-245) and then cuts straight to the near a-cappella outro.
2. **Post-chorus tails added** after both choruses (11.8 s and 12.0 s): held "go" plus a wordless vocalise.
3. **Arpeggio interlude is ~8 bars (19 s), not 4**, in two halves (thinned, then bass back with the synth forward).
4. **Two full stops not in the prompt**: 182.8-185.0 (before verse 3) and 209.0-213.4 (around "I think he's right. Honestly.").
5. Intro is long: 30 s before verse 1, with the two whispers ~10 s apart.
6. Section order matches the prompt; nothing repeated or dropped apart from item 1.

Lyrics:
1. **"Ever tinier" -> sounds like "at the tiny earth"** (43.6-45.2). Heard identically in both passes with high confidence, so the sung words really do differ or are garbled. [M that it differs; exact words G]
2. **Last line "can" vs "can't think again"** — passes disagree. Meaning inverts, so listen to 258.7-260 before putting it on screen.
3. "artichoke" pronunciation is odd (132.6-133.1).
4. "Dad's code" slightly unclear (137.7-138.2).
5. "sat in" moved to the start of the next line (phrasing only).
6. Everything else matches the prompt word for word in at least one pass ("howl with/of laughter", "atoms/Adams", "Perky/Herky", "Well/While" are transcriber disagreements, not likely real changes [G]).

Whispered vs sung: only the two intro lines are true whispers [M]. "I think he's right. Honestly." is a hushed, breathy near-whisper [M level, G character]. Verses are pitched but low and narrow, consistent with "half-spoken"; whether they read as spoken or sung is a judgement call for the ear.

## 4. Energy / dynamics

Half-second RMS per stem is in `features.json`. Levels below are full-mix RMS in dBFS.

Overall shape [M]: slow fade-in -> sparse verse 1 (-20) -> slightly fuller break and pre-chorus (-19) -> chorus 1 (-18) -> verse 2 (-19) -> interlude dip (-23.5) -> bridge (-17) -> verse 3 (-17, no drop back to sparse) -> silence -> chorus 2 building to the song's peak (-15) -> cliff -> exposed outro (-28) -> fade. Each loud section is a step louder than the last; the song is a staircase with three holes cut in it.

- **Quietest**: the opening 0-5 s (-35 rising to -25) and the final fade 265-268 (-33 to -41). Inside the song proper: **209.0-213.4** (-40 to -44, effectively silence under a murmur) and **182.8-185.0** (-35).
- **Loudest**: **228-245** (-15 to -15.5), peaking around 234. Chorus 2 plus its tail.

Cut points, in order [M]:

| Time | Event | Type |
|---|---|---|
| 5.13 | First hand tap | soft entry |
| 8.9 / 18.5 | Whispers | |
| ~17.0 | Isolated loud drum hit/fill before the groove | accent |
| **19.45** | Bass + beat drop in | hit |
| 30.17 | Verse 1 vocal; texture thins | |
| 59.28 | Instrumental break begins, bass sustains | lift |
| 78.1 | Pre-chorus vocal | |
| **93.6** | Drums + bass drop out | drop (-8 dB) |
| 96.8 | "How do you feel" exposed | |
| **98.3** | Chorus 1 full band | **hit** |
| 127.2 | Verse 2, texture thins | step down |
| 140.6-142.05 | Drum stop on "Good catch!" | stutter/drop |
| 147.0 | Interlude thins, bass leaves 149.0 | drop (-6 dB) |
| 151-156 | Drums swell back | build |
| **156.2** | Bass returns, arpeggio forward | hit |
| 164.7 | Bridge | lift |
| **182.8** | Hard stop | **cut to silence** |
| **185.0** | Verse 3 full band | **hit (+19 dB)** — biggest jump so far |
| **209.0** | Hard stop | **cut to silence** |
| 209.5-212.8 | "I think he's right. Honestly." | hushed |
| **213.4** | Drums alone | re-entry |
| **216.2** | Bass + full chorus 2 | **hit** |
| 228-245 | Peak plateau | |
| **245.1** | Everything but voice and faint pad gone | **cliff (-10 to -13 dB), biggest drop** |
| 247.4-249.1, 252.2-253.6, 258.0-258.75 | Breath-length silences between outro lines | |
| 263.2 | Final pad swell under last word | soft swell |
| 268.0 | End | |

## 5. Files

- `song_map.md` — this file
- `transcription_vocals_stem.json` — whisper large-v3 on demucs vocal stem, word timestamps + probabilities
- `transcription_full_mix.json` — same on the untouched mix (cross-check)
- `features.json` — beat times, BPM, 0.5 s RMS per stem (mix/vocals/drums/bass/other), spectral centroid
- `stems/htdemucs/Proof/{vocals,drums,bass,other}.wav` — separated stems
- `clips/` — vocal-stem excerpts and re-transcriptions used to check the lyric-free gaps
- Scripts: `transcribe.py`, `analyse.py`, `detail.py`, `gaps.py` (run with `../.venv/bin/python`; transcribe needs `LD_LIBRARY_PATH` pointing at the venv's `nvidia/cublas/lib` and `nvidia/cudnn/lib`)
