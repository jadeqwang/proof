# Proof (v2) — song map for video planning

Source: `inputs/Proof.wav`, the NEW version (4:39.12 = 279.12 s, 48 kHz stereo, Suno). All times are seconds from file start (m:ss in brackets). The previous map (`analysis/song_map.md`) describes the old 4:28.00 file now in `inputs/older version/` and is superseded by this one.
Method (unchanged): demucs `htdemucs` stem separation -> faster-whisper large-v3 with word timestamps on the vocal stem AND on the full mix (two independent passes) -> librosa for tempo, key, per-stem energy, pitch/voicing. Contested words were re-transcribed from short excerpts (`clips/`).

Legend: **[M]** = measured from the audio, **[G]** = inferred/guessed, wants a human ear.

**Relation to the old version [M]:** the new file is a re-render, not an edit: the waveform differs everywhere (old/new correlation only ~0.25), but every structural event from 0 to ~233 s lands within ~0.05 s of the old file. All real timing changes are after chorus 2: a shorter held "go", a clean cut into the outro, outro lyrics ~3 s later, and a brand-new ~14 s drum coda after the last word (this is where the extra 11 s went). See section 6 for the full diff.

## 1. Tempo, key, metre

| | Value | Confidence |
|---|---|---|
| Tempo | **99.4 BPM** (beat 0.604 s, bar 2.415 s) | [M] full mix and drum stem agree; inter-beat std 0.02 s, steady throughout. Unchanged from old version |
| Key | **C minor** | [M] Krumhansl chroma correlation 0.75; runners-up Ab major 0.59, Eb major (relative major) 0.56. Bass and held vocal notes centre on C. Concert pitch (+0.01 semitone) |
| Time signature | **4/4** | [G] not directly measured; sections come out as whole 4-beat bars (instrumental break 59.28-78.1 = 8 bars; 156.2 -> 185.0 and 185.0 -> 213.4 are each 48 tracked beats = 12 bars) |
| Loudness | -16.0 LUFS integrated, LRA 6.8 LU, true peak -3.5 dBFS | [M] (old: LRA 8.8, peak -4.2: the new master is a little hotter and flatter) |

Beat times are in `features.json` (`beats`). Caution as before: cut to the measured hit times below rather than to an extrapolated grid, especially after the two full stops (185.0, 213.4) and for the coda entry (264.28) [G].

## 2. Section map

| # | Section | Start | End | Length | What happens |
|---|---|---|---|---|---|
| 1 | Intro a — pad | 0.00 (0:00) | 5.1 (0:05) | 5.1 s | Pad fades in alone. No rhythm. |
| 2 | Intro b — taps + whispers | 5.1 (0:05) | 19.46 (0:19) | 14.3 s, ~6 bars | Hand-tap percussion enters 5.1 (first clear onset 5.15), quiet (-30 dB, no sub-bass content). Whisper 1 at 8.9-11.6. Taps build into a louder fill 16.5-18.3 (loudest 17.25-17.75). Whisper 2 at 18.5-19.5. |
| 3 | Intro c — groove | 19.46 (0:19) | 30.18 (0:30) | 10.7 s, ~4.5 bars | **Bass + full beat drop in at 19.46**, on the tail of "not like that". No vocals. |
| 4 | Verse 1 | 30.18 (0:30) | 59.28 (0:59) | 29.1 s, 12 bars | Sparse: voice + drums, bass only in short stabs (about one per bar), pads low. |
| 5 | Instrumental break | 59.28 (0:59) | 78.1 (1:18) | 18.8 s, **8 bars** | Bass sustained (until 75.5), melodic "other" stem (piano/pads) up ~8 dB. No lyrics 59.3-78.0; a low sustained tone (Bb2) creeps into the vocal stem 76.1-78.0, likely a pickup hum or bleed [G]. Half-time feel not verified [G]. |
| 6 | Pre-chorus | 78.1 (1:18) | 96.8 (1:37) | 18.7 s | Lyric-free gap 84.4-88.2 (3.8 s) between the two couplets. **Drums + bass cut out at 93.6**; "that's just how it looks" is sung over pads only (mix -8 dB). |
| 7 | Chorus 1 | 96.8 (1:37) | 115.4 (1:55) | 18.6 s | "How do you feel" starts as a near a-cappella pickup at 96.8; **full band hits at 98.3**. |
| 8 | Post-chorus tail (not in prompt) | 115.4 (1:55) | 127.2 (2:07) | 11.8 s | Full band continues. "go" is held on D4 to ~118.9, then a wordless high vocalise 121.1-123.4 (Bb4 falling to G4). No lyrics. |
| 9 | Verse 2 | 127.2 (2:07) | 145.6 (2:26) | 18.4 s | Back to sparse texture. **Everything but the voice stops 140.6-141.7** right on "Good catch!" (mix dips ~8 dB); band back at 141.75. |
| 10 | Arpeggio interlude a — thinned | 146.0 (2:26) | 156.2 (2:36) | 10.2 s, ~4 bars | Drums fall ~12 dB at 147, bass out from 149.0. Drums creep back up 151-156. A faint sustained vocal-stem tone on C4 (-33 to -44 dB) through 146-156 may be a hum or stem bleed [G]. |
| 11 | Arpeggio interlude b — full | 156.2 (2:36) | 164.7 (2:45) | 8.5 s, ~4 bars | **Bass returns 156.2**; synth/arpeggio ("other") stem at its loudest of the song (-22). No vocals. |
| 12 | Bridge | 164.7 (2:45) | 184.6 (3:05) | 19.9 s | Full band, loud. **Hard stop at 182.8**: 2.2 s of near silence (mix -36 dB) with only the tail of "proof". |
| 13 | Verse 3 | 185.0 (3:05) | 209.0 (3:29) | 24.0 s, 10 bars | **Full band slams in at 185.0** with "Housewarming". Much denser/louder than verses 1-2. |
| 14 | Full stop — "I think he's right. Honestly." | 209.0 (3:29) | 213.4 (3:33) | 4.4 s | Everything cuts at 209.0-209.2. Line delivered very quietly 209.5-213.1 into near silence (mix -40 to -44 dB). |
| 15 | Chorus 2 | 213.4 (3:33) | 232.9 (3:53) | 19.5 s | **Drums re-enter alone at 213.4**, vocal at 214.7, **bass + full arrangement at 216.2**. |
| 16 | Post-chorus tail 2 (not in prompt) | 232.9 (3:53) | 244.8 (4:05) | 11.9 s | Full band at plateau level. Held "go" to ~235.9, vocalise 238.7-241.3, then **3.5 s of band alone 241.3-244.8** (no voice at all). |
| 17 | Outro | 244.8 (4:05) | 264.3 (4:24) | 19.5 s | **Cliff at 244.8**: bass gone instantly, drum tail decays to nothing by ~246.1. First outro word at 245.26, i.e. AFTER the cut. Voice nearly a cappella over faint pads; a pad/keys swell fills the vocal gap at 252.5-255. |
| 18 | Drum coda (NEW; not in old version) | 264.28 (4:24) | 274.5 (4:35) | 10.2 s, ~4 bars | **Loud low drums slam in at 264.28** under the held last note of "again" (voice sustains C4 to ~265.6). Drums + pad only until **bass joins at 268.0**; full-level groove 268-274.5 is the **loudest passage of the song** (-14.8 dB). Kit is low/tom-kick heavy (75% of energy below 120 Hz, centroid ~1 kHz), NOT the hand-tap sound of the intro. Two faint pickup taps at 263.1 and 263.7. |
| 19 | Final tone | 274.5 (4:35) | 278.6 (4:39) | 4.1 s | **Drums stop dead at 274.5**; sustained bass note + pad ring and fade to silence by ~278.6. File ends 279.12. |

### Instrumental / lyric-free gaps [M]

| Gap | Start-End | Length |
|---|---|---|
| Before whisper 1 | 0.0-8.9 | 8.9 s |
| Between whispers | 11.6-18.5 | 6.9 s |
| Whisper 2 to verse 1 | 19.5-30.18 | 10.7 s |
| Instrumental break | 59.28-78.1 (faint low vocal-stem tone from 76.1) | 18.8 s |
| Inside pre-chorus | 84.4-88.2 | 3.8 s |
| Post-chorus 1 (wordless voice present to 118.9 and 121.1-123.4) | 115.4-127.2 | 11.8 s |
| Arpeggio interlude | 145.6-164.7 | 19.1 s |
| Stop before verse 3 | ~183.9-185.0 (tail of "proof" until then) | ~1.1 s |
| Post-chorus 2 (wordless voice present to 235.9 and 238.7-241.3) | 232.9-245.26 | 12.4 s |
| — of which band only, no voice | 241.3-244.8 | 3.5 s |
| Inside outro (pad swell) | 252.3-254.65 | 2.35 s |
| Drum coda + final tone (held vocal note until ~265.6) | 264.3-279.1 | 14.8 s |

## 3. Timestamped lyrics, aligned to the NEW prompt

Times are line start-end from word timestamps cross-checked against the vocal-stem envelope (accuracy roughly +/-0.2 s; line starts in dense verses are the least certain). Word-level data: `transcription_vocals_stem.json`, `transcription_full_mix.json`; excerpt re-runs in `clips/retranscriptions.json`.

| Start | End | Sung line | Note |
|---|---|---|---|
| **Intro** | | | |
| 8.9 | 11.6 | You need facial expressions | **Whispered** [M: 0-5% pitched frames while audible] |
| 18.5 | 19.5 | But not like that | **Whispered** [M: 0% pitched]. "But" only in the full-mix pass; very short, lands just before the groove drop |
| **Verse 1** | | | Low, narrow (C4-D4, up to F4-G4 from "What on earth"), half-spoken feel; pitched [M] |
| 30.2 | 33.7 | Three years old, uncle explains atoms | ("Adams" in both passes = atoms) |
| 34.3 | 37.8 | A week later my mother finds me | |
| 37.8 | 41.1 | sat in a snow drift of paper | Line break shifted: "sat in" starts this line (phrasing only) |
| 41.3 | 43.5 | ripped to shreds | |
| 43.6 | 44.95 | **Ever tinier** | **As written now.** Both passes + excerpt re-runs: "ever tinier" ("tinier" p=0.99; "ever" p=0.99 in full passes, 0.44-0.50 in excerpts). Old version's "at the tiny earth" garble is gone [M] |
| 44.95 | 48.0 | repeating what uncle said | |
| 48.0 | 50.8 | What on earth are you doing? | |
| 50.95 | 53.2 | The adults howl with laughter | |
| 53.25 | 55.5 | What's so funny? | |
| 55.5 | 58.2 | Nobody tells me after | |
| **Pre-chorus** | | | |
| 78.1 | 81.4 | She doesn't talk like other children | |
| 81.4 | 84.0 | Her English comes from books | Parenthetical; sung by the lead, no separate backing voice detected [G] |
| 88.2 | 91.05 | Her face doesn't make much expression | "Her" is barely audible (p=0.01-0.10, both passes); "face" clear. Vocal energy starts 88.2 |
| 91.05 | 96.1 | For our culture, that's just how it looks | Band drops out at 93.6 under "that's just how it looks"; "looks" held ~95.1-96.1 |
| **Chorus 1** | | | Range opens up to C5 |
| 96.8 | 100.1 | How do you feel? Inside? | Band hits at 98.3 on "Inside" |
| 102.6 | 105.4 | I honestly don't know | |
| 105.4 | 110.4 | I open my mouth, my voice goes blind | |
| 111.2 | 115.4 | The words have nowhere to go | "go" held to ~118.9 |
| 121.1 | 123.4 | (wordless vocalise) | **ADDED**, not in prompt |
| **Verse 2** | | | |
| 127.2 | 129.25 | Resting oblivious face | |
| 129.25 | 131.65 | Blocking the aisle, in the wrong place | "Blocking" heard as "Parking"/"Park in" in every pass (p 0.13-0.45): first consonant is unclear, probably as written [G] |
| 131.65 | 133.2 | **Enthralled** by an artichoke | "Enthralled" as written (p 0.78-0.90 in four runs) [M]. "artichoke" again heard as "auto-choke" by every pass: pronunciation still off [G] |
| 133.2 | 134.0 | **market-fresh** | As written: "market" 133.2 (p 0.53-0.86), "fresh" 133.4-133.9. No "super-" any more [M] |
| 134.3 | 136.4 | Sacred geometry made flesh | |
| 136.4 | 138.9 | Down in the basement, Dad's code, I watch | "Dad's code" in 2 of 4 runs, else "dad's coat"/"desk code": probably as written [G] |
| 138.9 | 141.25 | I point to the one he missed. "Good catch!" | **Unclear**: stem pass hears "the one he missed" (low p on "one"); full-mix pass and both excerpt re-runs hear "the warning list/mist" (p 0.88-0.95). Listen to 139.7-140.4. "Good catch" 140.4-141.25, band stops under it |
| 141.25 | 145.55 | Did she understand or just pattern match? | |
| **Bridge** | | | |
| 164.7 | 167.05 | Do you not see what I see? | |
| 167.05 | 169.45 | Does it matter what makes me me? | |
| 169.6 | 173.5 | Beauty on this side, **truth by reference** | **As written**: "truth" 171.9, "by" 172.4, "reference" 172.7-173.5, all p >= 0.95 in both passes [M] |
| 174.5 | 176.7 | Science fiction shelved with truth | |
| 176.7 | 179.3 | From inside, I can't tell the difference | |
| 179.6 | 184.6 | And I can't give you proof | "proof" ~182.7 onward rings into the stop at 182.8 |
| **Verse 3** | | | |
| 185.0 | 188.5 | Housewarming, lemonade from the yard | |
| 188.5 | 191.2 | Perky American girl | |
| 191.2 | 193.5 | I play the part | |
| 193.5 | 196.0 | He said I absolutely nailed it | |
| 196.0 | 198.5 | Well, fifteen percent above amplitude | First word heard as "We're" by both passes (p 0.48-0.65); likely "Well" slurred [G] |
| 198.5 | 201.25 | I nod, the past hour gets reviewed | |
| 201.25 | 204.0 | Hug durations, pitch contours | |
| 204.0 | 207.4 | Room crossing velocity | |
| 209.5 | 213.1 | I think he's right. Honestly. | **Very quiet, breathy** (vocal stem -39 to -45 dB vs ~-26 normal; half-pitched on Eb4-F4 to 211.5, then "honestly" unpitched 212.5-213.1) over silence [M] |
| **Chorus 2** | | | |
| 214.7 | 218.0 | How do you feel? Inside? | Top note of the song (B4-C5). Over drums only until 216.2 |
| 220.5 | 223.1 | I honestly don't know | Start time approximate (whisper smears the preceding rest) |
| 223.1 | 228.0 | I open my mouth, my voice goes blind | |
| 229.0 | 232.9 | The words have nowhere to go | "go" held to ~235.9 (D4 -> Eb4) |
| 238.7 | 241.3 | (wordless vocalise) | **ADDED** |
| **Outro** | | | Soft, sung, fully exposed (voice -30 to -34 dB, no drums/bass) |
| 245.3 | 249.1 | Keep the smile on so they don't know | Starts 0.5 s AFTER the band cuts (old version: started over the band) |
| 249.35 | 252.3 | This is how we fit in | |
| 254.65 | 258.5 | She turns around, I let it go | Preceded by a 2.35 s pad swell |
| 259.15 | 263.0 (+ held note to ~265.6) | And I **can** think again | **Leans "can"; not fully settled** — see below. Last syllable sustained on C4 from 263.8 into the drum entry at 264.28 [G that it is the same word held rather than a separate hum] |

### Deviations from the prompt

Structure:
1. **Percussion break is not where the prompt puts it.** Between chorus 2 and the outro there is still no drop to taps: the full band plays on (232.9-244.8) and cuts straight to the a-cappella outro. Instead, a **drum-led coda appears AFTER the outro vocals** (264.28-274.5: drums + pad alone for 3.7 s, then with bass). It is a loud, low kit groove, not the hand-tap motif. Functionally the [Percussion Break] and [Outro] are swapped [M timing; G interpretation].
2. **Post-chorus tails added** after both choruses (11.8 s and 11.9 s): held "go" plus a wordless vocalise.
3. **Arpeggio interlude is ~8 bars (19 s), not 4**, in two halves (thinned, then bass back with the synth forward).
4. **Two full stops not in the prompt**: 182.8-185.0 (before verse 3) and 209.0-213.4 (around "I think he's right. Honestly.").
5. Intro is long: 30 s before verse 1, with the two whispers ~7 s apart.
6. Section order otherwise matches the prompt; nothing repeated or dropped.

Lyrics:
1. **Last line, "can" vs "can't think again": leans "can" (as written).** Both whole-song passes now agree on "can" (p=0.967 stem, 0.964 mix; the old version's passes disagreed). But excerpt re-runs are unstable: a 25 s outro clip gives "can" on the stem and "can't" on the mix; a 9 s clip gives "can't" on the stem (p=0.66) and "can" on the mix (p=0.96); priming whisper with either spelling makes it return that spelling. Whenever "can" is chosen it scores 0.96-0.98, whenever "can't" is chosen only 0.63-0.66. So the acoustics favour "can" and there is no audible released /t/, but the word runs straight into "think", which hides a /t/ either way. Listen to 259.5-260.7 before putting it on screen [M probabilities; G verdict].
2. **"the one he missed" may sound like "the warning list"** (139.7-140.4): 3 of 4 runs hear the latter.
3. "artichoke" pronunciation is odd (132.7-133.2), same as the old version.
4. "Blocking" unclear ("Parking"), "Dad's code" slightly unclear, "Well" -> "We're", "Her (face)" nearly inaudible: all probably as written [G].
5. "sat in" moved to the start of the next line (phrasing only).
6. **Fixed since the old version**: "Ever tinier" is now sung as written. New prompt words "Enthralled", "market-fresh", "Her face", "truth by reference" are all sung as written.
7. Everything else matches the prompt word for word in both passes ("atoms/Adams", "snow drift/snowdrift", "15%" are spelling only).

Whispered vs sung: only the two intro lines are true whispers [M]. "I think he's right. Honestly." is a hushed, breathy near-whisper, the last word unpitched [M level/voicing, G character]. Verses are pitched but low and narrow, consistent with "half-spoken".

## 4. Energy / dynamics

Half-second RMS per stem is in `features.json`. Levels below are full-mix RMS in dBFS, averaged over the section.

Overall shape [M]: slow fade-in (-29) -> taps (-22.5) -> groove (-18) -> sparse verse 1 (-20) -> break and pre-chorus (-19) -> drop (-26.5) -> chorus 1 + tail (-18) -> verse 2 (-20) -> interlude dip (-22, down to -24) -> interlude b / bridge (-17.5 / -17) -> silence -> verse 3 (-17, no drop back to sparse) -> silence -> chorus 2 + tail (-16.5) -> cliff -> exposed outro (-30) -> **drum coda (-18 then -15, new peak)** -> dead stop of drums, bass/pad fade. Still a staircase with three holes cut in it, but the song no longer ends in the hole: it ends with a final loud slab after the quietest sung passage.

- **Quietest**: the opening 0-5 s (-37 rising to -26) and the last second of the fade. Inside the song proper: **209.2-213.4** (-40 to -44, effectively silence under a murmur), **182.8-185.0** (-36), and the outro 245.5-264 (-28 to -42; the 258.5-259.1 breath is -42).
- **Loudest**: **268-274.5, the coda with bass (-14 to -15)**, peaking around 270-272. Second: chorus 2 and its tail, 223-245 (-16 to -16.5, short peak -15.2 at 224).
- **Biggest jump up**: 264.28 (outro -33 -> coda -18, about +15 dB in one hit), then 185.0 (+19 dB out of the stop) and 213.4/216.2.
- **Biggest drop**: 244.8-246 (-16.5 -> -27, then on down to -30).

Cut points, in order [M]:

| Time | Event | Type |
|---|---|---|
| 5.1 | First hand tap | soft entry |
| 8.9 / 18.5 | Whispers | |
| 16.5-18.3 | Tap/drum fill building into the groove (loudest 17.25-17.75) | build |
| **19.46** | Bass + beat drop in | hit |
| 30.18 | Verse 1 vocal; texture thins | |
| 59.28 | Instrumental break begins, bass sustains | lift |
| 78.1 | Pre-chorus vocal | |
| **93.6** | Drums + bass drop out | drop (-8 dB) |
| 96.8 | "How do you feel" exposed | |
| **98.3** | Chorus 1 full band | **hit** |
| 118.9 / 121.1-123.4 | Held "go" ends / vocalise | |
| 127.2 | Verse 2, texture thins | step down |
| 140.6-141.75 | Band stop on "Good catch!" | stutter/drop |
| 147.0 | Interlude thins, bass leaves 149.0 | drop (-5 dB) |
| 151-156 | Drums swell back | build |
| **156.2** | Bass returns, arpeggio forward | hit |
| 164.7 | Bridge | lift |
| **182.8** | Hard stop | **cut to silence** |
| **185.0** | Verse 3 full band | **hit (+19 dB)** |
| **209.0** | Hard stop | **cut to silence** |
| 209.5-213.1 | "I think he's right. Honestly." | hushed |
| **213.4** | Drums alone | re-entry |
| 214.7 | Chorus 2 vocal over drums | |
| **216.2** | Bass + full chorus 2 | **hit** |
| 223-245 | Plateau | |
| 235.9 / 238.7-241.3 | Held "go" ends / vocalise | |
| 241.3-244.8 | Band alone, no voice | runway to the cliff |
| **244.8** | Bass gone, drum tail dies by 246.1 | **cliff (-10 to -13 dB), biggest drop** |
| 245.26 | "Keep the smile on" enters, exposed | |
| 249.1-249.35, 252.3-254.65, 258.5-259.15 | Breaths between outro lines (the middle one filled by a pad swell 252.5-255) | |
| 259.15-263.0 | "And I can think again" | |
| 263.8 | Last note swells/holds (C4) | soft swell |
| **264.28** | Drum coda slams in (pickup taps 263.1, 263.7) | **hit (+15 dB), NEW** |
| ~265.6 | Voice gone for good | |
| **268.0** | Bass joins the coda; loudest passage starts | **hit** |
| **274.5** | Drums stop dead; bass + pad ring | cut |
| ~278.6 | Silence (file ends 279.12) | |

## 5. Files (all under `analysis/v2/`)

- `song_map.md` — this file
- `transcription_vocals_stem.json` — whisper large-v3 on demucs vocal stem, word timestamps + probabilities
- `transcription_full_mix.json` — same on the untouched mix (cross-check)
- `features.json` — beat times, BPM, 0.5 s RMS per stem (mix/vocals/drums/bass/other), spectral centroid
- `stems/htdemucs/Proof/{vocals,drums,bass,other}.wav` — separated stems
- `clips/` — 16 kHz excerpts (vocal stem and mix) and `retranscriptions.json`, used for the lyric-free gaps and contested words, including the primed can/can't test
- Scripts: `transcribe.py`, `analyse.py`, `detail.py` (unchanged copies; run from `analysis/v2/`), `gaps.py` (new time windows + coda drum analysis), `clips.py` (excerpt re-transcription), `compare_old.py` (old-vs-new alignment). Run with `../../.venv/bin/python`; transcribe/clips need `LD_LIBRARY_PATH` pointing at the venv's `nvidia/cublas/lib` and `nvidia/cudnn/lib`.
- Raw logs: `analyse.log`, `detail.log`, `gaps.log`, `clips.log`, `tr_stem.log`, `tr_mix.log`

## 6. Differences from the old version's map

Unchanged within ~0.1 s [M]: tempo, key, every entry/drop/stop from 0 to 233 s (taps 5.1, groove 19.46, verse 1 30.18, break 59.28-78.1, band drop 93.6, chorus hit 98.3, verse 2 127.2, "Good catch" stop 140.6, interlude 146.0/149.0/156.2, bridge 164.7, stop 182.8, verse 3 185.0, stop 209.0, drums 213.4, band 216.2).

Changed:
1. **New drum coda 264.28-274.5 + bass/pad ring to 278.6.** Old version ended with a 4.8 s pad swell after the last word.
2. **Cliff into the outro is cleaner.** Old: outro line 1 began ~242 over the full band, band cut at 245.1 mid-line. New: voice is silent 241.3-245.26, band cuts at 244.8, line starts after the cut.
3. **Outro lyrics are later**: line starts 245.3 / 249.35 / 254.65 / 259.15 (old 242.0 / 249.1 / 253.6 / 258.75). Last word now ends ~263.0 with a held note to ~265.6 (old 263.3).
4. **Post-chorus 2 tail**: held "go" ends ~235.9 (old 237.6); vocalise 238.7-241.3 (old 239.0-243.0).
5. **The song's loudest passage moves** from chorus 2 / tail (228-245) to the coda (268-274.5).
6. **Lyrics**: "Ever tinier" now sung as written (old: "at the tiny earth"); "Enthralled ... market-fresh" replaces "Transfixed ... supermarket-fresh"; "truth by reference" replaces "truth by inference"; "Her face doesn't make much expression" (old map listed "She doesn't make..."); final line now "can" in both whole-song passes (old: split). New doubt: "the one he missed" may sound like "the warning list".
7. Small measurement refinements, probably not real changes [G]: pre-chorus gap end 88.2 (old 87.7), chorus 2 vocal entry 214.7 (old 214.1), whisper 1 tail 11.6 (old 11.25), whisper 2 end 19.5 (old 20.0), intro fill described as 16.5-18.3 (old: step-up at ~11.1 and a single hit at ~17.0; no step at 11.1 is visible in the new drum stem), key correlation 0.75 (old 0.83).
8. Master: LRA 6.8 LU / true peak -3.5 dBFS (old 8.8 / -4.2).
