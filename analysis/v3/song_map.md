# Proof (v3) — song map for video planning

**This map supersedes `analysis/v2/song_map.md`.** Source: `inputs/Proof.wav` as replaced on 2026-11-22 16:16, the THIRD version (4:38.40 = 278.40 s, 48 kHz stereo 16-bit, Suno). All times are seconds from file start (m:ss in brackets). The v2 map describes the 4:39.12 file now in `inputs/older version/`; `analysis/song_map.md` describes the original 4:28.00 file. Every number below was measured on the new file in this run; nothing is carried over from v2.
Method (unchanged): demucs `htdemucs` stem separation -> faster-whisper large-v3 with word timestamps on the vocal stem AND on the full mix (two independent passes) -> librosa for tempo, key, per-stem energy, pitch/voicing. Contested words were re-transcribed from short excerpts (`clips/`), several with primed (biased) prompts.

Legend: **[M]** = measured from the audio, **[G]** = inferred/guessed, wants a human ear.

**Relation to v2 [M]:** the new file is again a re-render, not an edit. No stretch of it is sample-identical to v2 (1 s window correlation 0.15-0.6, residual never better than -5 dB), and it is 0.72 s shorter. But it is the same arrangement on the same clock: the drum stems' onset patterns correlate at 0.90-0.97 from 0 to 248 s with a lag that never leaves -0.07..+0.03 s, and every entry, drop and stop up to chorus 2 lands within 0.1 s of v2. The real changes are (a) small ones in the body: bass leaves the interlude 1.4 s earlier, "looks" now has an audible "ks", a few lyrics are heard differently; and (b) the ending from 236 s on, which is different music: longer held "go", **no vocalise after chorus 2**, the **outro vocal now enters over the band 1.5 s before the cliff**, outro lines 2 and 3 are earlier, there is no held last note, and the **drum coda is rebuilt** (pad swell, one big hit, a bass that fades in from the start, a short quiet ring-out). It is not derived from the manual edits in `inputs/edits/` (those are v2 with a patch at ~96 s and correlate with the new file exactly as v2 does), though it does share their goal of a "ks" on "looks" [G]. See section 6 for the full diff.

## 1. Tempo, key, metre

| | Value | Confidence |
|---|---|---|
| Tempo | **99.4 BPM** (beat 0.604 s, bar 2.416 s) | [M] full mix and drum stem both 99.38; regression over all 455 tracked beats 99.34; inter-beat std 0.02 s. Same as v2 |
| Key | **C minor** | [M] Krumhansl chroma correlation 0.72; runners-up Ab major 0.57, F minor 0.56, Eb major (relative major) 0.54. Bass chroma peaks on C and Ab; coda bass walks C2 - Eb2 - Ab1 - (Bb1) - C1. Concert pitch (+0.02 semitone) |
| Time signature | **4/4** | [G] not directly measured; sections come out as whole 4-beat bars (verse 1 30.16 -> 59.18 = 48.05 beats = 12 bars; chorus 1 hit 98.22 -> verse 2 127.16 = 47.9 beats = 12 bars; 156.14 -> 184.90, 184.90 -> 213.38 and 216.12 -> 244.9 are each 48 tracked beats = 12 bars) |
| Loudness | -15.9 LUFS integrated, LRA 7.6 LU, true peak -4.8 dBFS | [M] (v2 re-measured in this run: -16.0 LUFS, LRA 6.8, peak -3.5: the new master peaks 1.3 dB lower and has slightly more range) |

Beat times are in `features.json` (`beats`). Caution as before: cut to the measured hit times below rather than to an extrapolated grid. The tracker stumbles (irregular inter-beat intervals) at 140.5, 182.6-184.2, 209.6-214.8, 253-255 and 272.9-273.4, i.e. at the stops, in the drumless outro and at the end of the coda [M]; the tracked beat sits 0.04-0.08 s after the measured stem onsets at most hits.

## 2. Section map

| # | Section | Start | End | Length | What happens |
|---|---|---|---|---|---|
| 1 | Intro a — pad | 0.00 (0:00) | 5.1 (0:05) | 5.1 s | Pad fades in alone (-33 dB at 0 s, -26 by 2 s; a faster fade-in than v2). No rhythm. |
| 2 | Intro b — taps + whispers | 5.1 (0:05) | 19.3 (0:19) | 14.2 s, ~6 bars | Hand-tap percussion enters 5.1 (first onset 5.14), quiet (drum stem -31 dB, 1% of its energy below 120 Hz). Whisper 1 at 8.9-11.3. Taps build into a louder fill 16.5-18.5 (loudest 17.0-17.75), plus a hit at 19.0. Whisper 2 at 18.5-19.9. |
| 3 | Intro c — groove | 19.3 (0:19) | 30.16 (0:30) | 10.9 s, 4.5 bars | **Bass + full beat drop in at 19.3** (bass stem on at 19.30, drum onset 19.32), under "like that". No vocals. |
| 4 | Verse 1 | 30.16 (0:30) | 59.18 (0:59) | 29.0 s, 12 bars | Sparse: voice + drums, bass only in short stabs (about one per bar; 10 stabs, 32.2-55.0), pads low. |
| 5 | Instrumental break | 59.18 (0:59) | 78.05 (1:18) | 18.9 s, **~8 bars** (7.8) | Bass sustained (until 75.1), melodic "other" stem (piano/pads) up ~9 dB (-25 vs -34). No lyrics 59.2-78.0; a low sustained tone (Bb2, -37 rising to -28) creeps into the vocal stem 76.1-78.0, likely a pickup hum or bleed [G]. Half-time feel not verified [G]. |
| 6 | Pre-chorus | 78.05 (1:18) | 96.8 (1:37) | 18.75 s | Bass back at 78.86. Lyric-free gap 84.3-88.15 (3.85 s) between the two couplets. **Drums + bass cut out at 93.5** (bass 93.42, drums 93.56); "that's just how it looks" is sung over pads only (mix -25 to -27, about 7 dB down). "looks" is held to ~96.45 and now closes with an audible sibilant at 96.45-96.65. |
| 7 | Chorus 1 | 96.8 (1:37) | 115.3 (1:55) | 18.5 s | "How do you feel" starts as a near a-cappella pickup at 96.8; **full band hits at 98.22** (drums 98.22, bass 98.30). |
| 8 | Post-chorus tail (not in prompt) | 115.3 (1:55) | 127.16 (2:07) | 11.9 s | Full band continues. "go" is held on D4 (dropping to C4 at ~118.0) until ~119.2, then a wordless high vocalise 121.06-123.96 (starts near Bb, settles on G; octave uncertain, see section 3). No lyrics. |
| 9 | Verse 2 | 127.16 (2:07) | 145.9 (2:26) | 18.7 s | Back to sparse texture (bass stabs at 129.8, 132.2, 136.0-137.5, 139.4). **Everything but the voice stops 140.5-141.7** right on "Good catch!" (mix dips ~6-7 dB to -25); one drum hit at 141.68, band back at 141.84-142.0. |
| 10 | Arpeggio interlude a — thinned | 145.9 (2:26) | 156.14 (2:36) | 10.2 s, ~4 bars | Bass plays 145.9-**147.5** then leaves (v2: stayed to 148.9). Drums fall ~10 dB at 147.2 and are sparse single hits until ~150.7, creeping back to continuous by 153.1. A faint sustained vocal-stem tone on C4 (-30 to -43 dB) through 146-155.9 may be a hum or stem bleed [G]. |
| 11 | Arpeggio interlude b — full | 156.14 (2:36) | 164.4 (2:44) | 8.3 s, ~3.5 bars | **Bass returns 156.14**; synth/arpeggio ("other") stem at its loudest of the main song (-22 to -23). No vocals. |
| 12 | Bridge | 164.4 (2:44) | 184.5 (3:05) | 20.1 s | Full band, loud. Voice at full level from 164.4 with a quiet lead-in from 163.8. **Hard stop at 182.7** (bass 182.54, drums 182.72): 2.2 s of near silence (mix -33 dB) with only the end of "...you proof" (one faint drum tick at 184.19). |
| 13 | Verse 3 | 184.9 (3:05) | 209.0 (3:29) | 24.1 s, 10 bars | **Full band slams in at 184.90** with "Housewarming". Much denser/louder than verses 1-2. |
| 14 | Full stop — "I think he's right. Honestly." | 209.0 (3:29) | 213.38 (3:33) | 4.4 s | Everything cuts at 208.94-209.10. Line delivered very quietly 209.5-213.15 into near silence (mix -38 to -39 dB; a faint pad at -42 to -44 remains, so this hole is ~5 dB less empty than in v2). |
| 15 | Chorus 2 | 213.38 (3:33) | 232.96 (3:53) | 19.6 s | **Drums re-enter alone at 213.38** (onset 213.43), vocal at 214.72, **bass + full arrangement at 216.12**. |
| 16 | Post-chorus tail 2 (not in prompt) | 232.96 (3:53) | 245.0 (4:05) | 12.0 s | Full band at plateau level, the loudest stretch of the song (-15.5). Held "go" to **~237.2** (D4, dropping to C4 at ~235.6). **No vocalise** (vocal stem silent, -67 to -77 dB, 237.5-243.5): **6.3 s of band alone 237.2-243.5**. Then the first outro line enters at 243.52 while the band is still playing. |
| 17 | Outro | 245.0 (4:05) | 263.4 (4:23) | 18.4 s | **Cliff at 245.0**: bass gone at 244.78, last drum onset 244.80, drum stem silent by 245.0-245.2 (no decaying tail). The cut lands in the middle of line 1, between "Keep the smile on" and "so they don't know". From there the voice is nearly a cappella over faint pads (short pad swells at 247.2-247.8, 249.7-250.2, 252.1-252.5, 254.5-255.7, each in or near a vocal breath). Two silences: 247.4-249.0 (mix -41.5) and 257.4-259.3 (mix -40). |
| 18 | Drum coda | 263.26 (4:23) | 275.3 (4:35) | 12.0 s (drums 10.8 s, ~4.5 bars) | Rebuilt in this version. **Pad swells in at 263.26** as the last word fades (voice gone by 263.4, no held note). **One big low drum hit at 264.54** (onset 264.59), then sparse hits (265.06, 265.21, 265.68) while the **bass fades in from 264.84** (C2, -38 rising to -24 by 267.3). **Continuous groove from 265.94 to 275.3** (last onset 275.09); bass drops out at 273.1, leaving drums + pad for the last ~2 s. Level -17 to -15.4 (peaks at 269 and 272), about 1 dB under chorus 2: no longer the loudest passage. Kit is low/tom-kick heavy (65-70% of energy below 120 Hz, centroid 360-520 Hz), NOT the hand-tap sound of the intro. Two faint pickup taps at 261.83 and 262.04 (-46 dB). |
| 19 | Final tone | 275.3 (4:35) | ~277.5 (4:37.5) | ~2.2 s | **Drums stop dead at 275.3**; one low bass note (C1, -43 dB, 275.0-276.4) + pad tail fade fast: mix -23 at 275.3, -35 by 276.25, below -45 by ~277.5. Much shorter and ~10 dB quieter than v2's ring-out. File ends 278.40. |

### Instrumental / lyric-free gaps [M]

| Gap | Start-End | Length |
|---|---|---|
| Before whisper 1 | 0.0-8.9 | 8.9 s |
| Between whispers | 11.3-18.5 | 7.2 s |
| Whisper 2 to verse 1 | 19.9-30.16 | 10.2 s |
| Instrumental break | 59.2-78.05 (faint low vocal-stem tone from 76.1) | 18.85 s |
| Inside pre-chorus | 84.3-88.15 | 3.85 s |
| Post-chorus 1 (wordless voice present to 119.2 and 121.06-123.96) | 115.3-127.16 | 11.9 s |
| Arpeggio interlude | 145.5-164.4 (faint vocal-stem tone 146-155.9; quiet vocal lead-in from 163.8) | 18.9 s |
| Stop before verse 3 | ~184.5-184.9 at most; the voice ("...you proof") runs through most of the stop | < 1 s |
| Post-chorus 2 (held "go" to 237.2; **no vocalise**) | 232.96-243.52 | 10.6 s |
| — of which band only, no voice | 237.2-243.52 | 6.3 s |
| Inside outro, after line 1 | 247.4-249.0 | 1.6 s |
| Inside outro, before the last line | 257.4-259.3 | 1.9 s |
| Drum coda + final tone (no voice at all) | 263.4-278.4 | 15.0 s |

## 3. Timestamped lyrics, aligned to the prompt

Times are line start-end from word timestamps (both passes) cross-checked against the vocal-stem envelope (`fine.log`, `lines.log`); accuracy roughly +/-0.2 s, line starts in dense verses are the least certain. Word-level data: `transcription_vocals_stem.json`, `transcription_full_mix.json` (flattened in `words.log`); excerpt re-runs in `clips/retranscriptions.json`.

| Start | End | Sung line | Note |
|---|---|---|---|
| **Intro** | | | |
| 8.9 | 11.3 | You need facial expressions | **Whispered** [M: 0% pitched frames in its loudest half-second, 9.3-9.8; the "pitch" pyin reports in the rest of the line is G#5-A5 hiss, not a sung note] |
| 18.5 | 19.9 | But not like that | **Whispered** [M: 0-36% pitched, same hiss artefact]. "But" is weak (p 0.44 mix; the stem pass smears it across the gap). Lands on the groove drop at 19.3 |
| **Verse 1** | | | Low, narrow (C4-D4, up to F4-G4 from "Ripped to shreds"), half-spoken feel; pitched [M: 56-95% voiced per line] |
| 30.2 | 33.7 | Three years old, uncle explains atoms | ("Adams" in both passes, p 0.33-0.39 = atoms) |
| ~34.7 | 37.8 | A week later my mother finds me | "A" indistinct (p 0.49-0.53); vocal energy resumes at 34.76 |
| 37.8 | 41.1 | sat in a snow drift of paper | Line break shifted as before: "sat in" starts this line (phrasing only) |
| ~41.4 | 43.5 | ripped to shreds | |
| 43.5 | 44.9 | Ever tinier | As written: "ever" p 0.99-1.00, "tinier" p 1.00 in both passes; both excerpt re-runs agree [M] |
| 44.9 | 47.9 | repeating what uncle said | |
| 47.9 | 50.8 | What on earth are you doing? | |
| 50.85 | 53.2 | The adults howl with laughter | |
| 53.2 | 55.45 | What's so funny? | |
| 55.5 | 58.15 | Nobody tells me after | "after" rings to ~59.2 |
| **Pre-chorus** | | | |
| ~78.05 | 81.35 | She doesn't talk like other children | Start approximate: the Bb2 tone in the vocal stem masks the entry ("She" p 0.50) |
| 81.4 | 83.8 | Her English comes from books | Parenthetical; sung by the lead, no separate backing voice detected [G]. "Her" p 0.06 on the stem, 0.84 on the mix. Tail to 84.3 |
| 88.15 | 91.1 | Her face doesn't make much expression | "Her" is barely audible (p 0.24 stem, 0.57 mix); "face" clear at 88.2 |
| 91.1 | 96.0 (+ sibilant to 96.65) | For our culture, that's just how it looks | "For" nearly inaudible (p 0.01-0.17). Band drops out at 93.5 under "that's just how it looks"; "looks" 95.1 onward, vowel held to ~96.45, then **a clear high-frequency burst at 96.45-96.65** in the vocal stem (absent in v2), i.e. the final "ks" is now pronounced [M burst; G that it is the "ks"] |
| **Chorus 1** | | | Range opens up to C5 |
| 96.8 | 100.1 | How do you feel? Inside? | Band hits at 98.22 on "Inside" |
| 102.2 | 105.35 | I honestly don't know | |
| 105.35 | 110.3 | I open my mouth, my voice goes blind | |
| 111.15 | 115.3 | The words have nowhere to go | "go" held to ~119.2 (D4 -> C4) |
| 121.06 | 123.96 | (wordless vocalise) | **ADDED**, not in prompt. 0.5 s longer than v2. Pitch: starts ~G#4/Bb, then pyin reads A5-G5, an octave above v2's Bb4-G4: could be an octave error or a higher/doubled voice [G] |
| **Verse 2** | | | |
| 127.2 | 129.2 | Resting oblivious face | Stem pass as written; full-mix pass hears "Rest in oblivious phase" (first word p 0.12) |
| 129.2 | 131.56 | Blocking the aisle, in the wrong place | "Blocking" now heard as written in every pass (p 0.66-0.88); v2's "Parking" is gone [M] |
| 131.56 | 133.0 | Enthralled by an artichoke | "Enthralled" p 0.87-0.88. "artichoke": the stem pass now hears "artichoke" (p 0.81), the mix pass and one excerpt still "auto-choke" (p 0.52-0.81), one stem excerpt garbles the whole phrase: pronunciation still not clean [G] |
| 133.0 | 133.96 | **"green and fresh"** (prompt: market-fresh) | **CHANGED, does not match the prompt.** Both whole-song passes, all four excerpt runs, and both runs primed with "market-fresh" return "green and fresh" ("green" p 0.50 in the stem pass, 0.88-1.00 everywhere else; "and" p 0.96-1.00). v2 was heard as "market fresh". Listen to 133.0-134.0 [M transcriptions; G that the sung words really changed] |
| 133.96 | 136.33 | Sacred geometry made flesh | The short `market` excerpts end this line "made flat" (p 0.38-0.87); the whole-song passes and the longer excerpts hear "flesh" (p 0.97-0.99) |
| 136.33 | 138.8 | Down in the basement, Dad's code, I watch | "code" (mix, p 0.59) vs "coat" (stem, p 0.54): probably as written [G] |
| 138.8 | 141.18 | I point to the one he missed. "Good catch!" | **"the one he missed" is now clear**: every pass and excerpt hears it ("one" p 0.99-1.00, "he" 0.95-0.99, "missed" 0.99-1.00, 139.72-140.38); v2's "warning list" reading is gone [M]. The leading "I" is heard as "up" attached to the previous line (p 0.11-0.16). "Good catch" 140.46-141.18, band stops under it at 140.5 |
| 141.18 | 145.45 | Did she understand or just pattern match? | "match" rings to ~146.3 |
| **Bridge** | | | |
| 164.4 | 167.0 | Do you not see what I see? | Quiet lead-in from 163.8 ("Do" p 0.01 on the stem) |
| 167.0 | 169.4 | Does it matter what makes me me? | |
| 169.4 | 173.5 | Beauty on this side, **truth by reference** | **Split**: full-mix pass "truth by reference" (171.8, p 1.00); stem pass "I choose by reference" ("choose" p 0.75). Excerpts: mix "Truth", stem "Choose"; primed runs return whichever word is suggested, "truth" scoring 0.88 on the mix and 0.38 on the stem, "choose" 0.41-0.64. Leans as written, but the "tr" is soft: listen to 171.8-172.4 [M probabilities; G verdict]. v2 had it clean |
| 174.4 | 176.67 | Science fiction shelved with truth | **Heard as "shoved"** in both passes and both excerpts (p 0.84, 175.4-176.1). Primed runs: "shelved" p 0.52-0.57, "shoved" p 0.81-0.85. The "l" is not coming through (v2: "shelved" in both passes) [M] |
| 176.67 | 179.24 | From inside, I can't tell the difference | |
| 179.5 | 184.5 | And I can't give you proof | "can't" held 180.4-182.1. Band stops at 182.7; whisper puts "proof" at 183.6-184.5 in both passes, i.e. inside the silence, while stem energy is continuous to 183.96 and resumes 184.14-184.94: exact word boundary in the stop is uncertain [G] |
| **Verse 3** | | | |
| 184.9 | 188.46 | Housewarming, lemonade from the yard | Band hit 184.90; a vocal pickup may begin up to ~0.4 s before it [G] |
| 188.46 | 191.1 | Perky American girl | Stem pass "Perky" (p 0.70); mix pass "Herky" (p 0.80); excerpts "perky" |
| 191.36 | 193.42 | I play the part | |
| 193.5 | 195.97 | He said I absolutely nailed it | |
| 195.97 | 198.46 | Well, fifteen percent above amplitude | "Well" now heard as written in both passes (p 0.35-0.73) |
| 198.46 | 201.17 | I nod, the past hour gets reviewed | "I nod" weak in both passes (p 0.15-0.37) but transcribed as written, also in the excerpts |
| 201.17 | 203.8 | Hug durations, pitch contours | |
| 203.8 | 207.4 | Room crossing velocity | Tail to ~208.9 |
| 209.5 | 213.15 | I think he's right. Honestly. | **Very quiet, breathy** (vocal stem peaks -24 on "I think" at 209.5-209.9, then -33 to -44 vs ~-26 normal; part-pitched on Eb4-G4 to 211.5, then "honestly" unpitched 212.46-213.16) over near silence [M] |
| **Chorus 2** | | | |
| 214.72 | 218.0 | How do you feel? Inside? | Top of the range (up to C5). Over drums only until 216.12 |
| 220.0 | 223.16 | I honestly don't know | |
| 223.16 | 228.1 | I open my mouth, my voice goes blind | |
| 228.95 | 232.96 | The words have nowhere to go | "go" held to **~237.2** (D4 -> C4 at ~235.6); 1.0 s longer than v2 |
| — | — | (no vocalise) | **GONE.** Vocal stem is silent 237.5-243.5; an excerpt of 231-243.3 yields only a hallucinated "where'd you go" |
| **Outro** | | | Soft, sung (voice -25 to -37 dB); line 1 starts over the full band, the rest fully exposed |
| 243.52 | 247.4 | Keep the smile on so they don't know | **Starts 1.5 s BEFORE the band cuts** (v2: 0.5 s after). "Keep the smile on" 243.5-245.0 is over full band; the cut at 245.0 falls before "so they don't know" (245.45-247.4). Full-mix pass and mix excerpts: as written (p 0.73-0.99). Stem pass: "She can smile once"; stem excerpts "she can smile on" / nothing: the stem separation mangles the words sung under the band. Probably as written [G] |
| 249.05 | 252.25 | This is how we fit in | "how" 249.3-250.1, short gap, "we fit in" 250.85-252.25 |
| 252.95 | 257.4 | She turns around, I let it go | "She" weak (p 0.31-0.47). "I let it go" from 255.46. No pad-swell gap before this line any more (0.7 s breath only) |
| 259.3 | 263.4 | And I **can** think again | **"can", firmer than v2.** Both whole-song passes (p 1.00), both 25 s outro excerpts and both 8 s excerpts return "can" (p 0.995-1.00). Only when primed with "can't" does whisper return "can't", at p 0.51 (stem) / 0.82 (mix). "can" 259.72-260.3, "think" 260.3, "again" 260.94-262.2, last syllable fading on D4 to ~263.4. "And" is very short or elided (vocal energy starts 259.28, "I" at 259.34). **No held note into the coda** (v2 held C4 to 265.6). Still worth one listen at 259.7-260.4 [M probabilities; G verdict] |

### Deviations from the prompt

Structure:
1. **Percussion break is not where the prompt puts it.** Between chorus 2 and the outro there is still no drop to taps: the full band plays on (232.96-245.0, the last 6.3 s without any voice before line 1 enters) and cuts to the a-cappella outro mid-line. A **drum-led coda follows the outro vocals** (drum hit 264.54, groove 265.94-275.3, with bass fading in from the start). It is a loud, low kit groove, not the hand-tap motif. Functionally the [Percussion Break] and [Outro] are swapped [M timing; G interpretation].
2. **Post-chorus tails added** after both choruses (11.9 s and 12.0 s). Tail 1 = held "go" + wordless vocalise; tail 2 = held "go" only, then band alone.
3. **Arpeggio interlude is ~8 bars (18.5 s), not 4**, in two halves (thinned with bass out from 147.5, then bass back with the synth forward), and it is not "arpeggio alone over sub bass": drums are present throughout.
4. **Two full stops not in the prompt**: 182.7-184.9 (before verse 3) and 209.0-213.4 (around "I think he's right. Honestly.").
5. Intro is long: 30 s before verse 1, with the two whispers ~7 s apart.
6. Instrumental break is ~8 bars as asked (7.8 measured); whether the piano carries the vocal melody was not measured [G].
7. Section order otherwise matches the prompt; nothing repeated or dropped.

Lyrics:
1. **"market-fresh" is heard as "green and fresh"** (133.0-133.96) in every run, including runs primed with the written words. The one place the sung text appears to differ from the prompt.
2. **"shelved" is heard as "shoved"** (175.4-176.1) in every unprimed run.
3. **"truth by reference"**: mix hears it as written, stem hears "(I) choose by reference" (171.3-172.4).
4. **Last line: "can"** in every unprimed run (six of six), p >= 0.995. Only priming flips it.
5. **"Keep the smile on"**: as written on the mix; garbled on the stem because it is sung over the band.
6. "artichoke" still unstable ("auto-choke" on the mix).
7. Weak or nearly inaudible function words, all probably as written [G]: "A (week)", "Her (English)", "Her (face)", "For (our culture)", "I (point)" (heard as "up"), "I nod", "She (turns)", "And (I can)". "Resting" -> "Rest in" and "Perky" -> "Herky" on the mix pass only; "code" -> "coat" on the stem pass only.
8. "sat in" moved to the start of the next line (phrasing only).
9. **Now clean**: "Ever tinier", "Blocking", "the one he missed", "Well", "Enthralled", "Her face" (word "face").
10. "looks" now ends with an audible "ks" (96.45-96.65); the prompt's "extend the high note on 'looks'" is honoured in length (~1.35 s vowel) though the note is not especially high (the line's range is C4-G#4).
11. Everything else matches the prompt word for word in both passes ("atoms/Adams", "snow drift/snowdrift", "15%" are spelling only).

Whispered vs sung: only the two intro lines are true whispers [M]. "I think he's right. Honestly." is a hushed, breathy near-whisper, the last word unpitched [M level/voicing, G character]. Verses are pitched but low and narrow, consistent with "half-spoken".

## 4. Energy / dynamics

Half-second RMS per stem is in `features.json`. Levels below are full-mix RMS in dBFS, averaged over the section.

Overall shape [M]: fade-in (-27) -> taps (-23) -> groove (-18.5) -> sparse verse 1 (-20) -> break and pre-chorus (-19.5 / -19) -> drop (-26.5) -> chorus 1 + tail (-18 / -17.5) -> verse 2 (-19) -> interlude dip (-21.5, down to -23.5) -> interlude b / bridge (-18 / -17) -> silence -> verse 3 (-16.5, no drop back to sparse) -> near silence -> chorus 2 (-16) -> **tail 2 (-15.5, the peak)** -> cliff -> exposed outro (-30) -> pad swell -> drum coda (-16.5) -> dead stop of drums, quick fade. Still a staircase with three holes cut in it; the song ends on a loud slab after its quietest sung passage, but that slab is now slightly below the chorus 2 plateau rather than above it, and it is approached through a 1.3 s pad swell instead of out of nothing.

- **Quietest**: the last second of the file and the start (-33 rising to -26 in 2 s). Inside the song proper: **248.0-249.0** (-41.5, the silence after outro line 1), **258.0-259.0** (-40, before the last line), **209.5-213.4** (-38 to -39, a murmur over a faint pad), **183-184** (-33), and the outro as a whole 245.5-263 (-27 to -41).
- **Loudest**: **tail 2, 233-245 (-15.5; single loudest second 234-235 at -14.8)**, then chorus 2 (216-233, -16.0; -15.2 to -15.5 from 228), then the coda with full groove (266-275, -16.6; best seconds -15.7 at 269 and -15.4 at 272).
- **Biggest jump up**: 184.90 (-33 -> -17, about +16 dB out of the stop), then 213.38 (-39 -> -22, drums alone) and 216.12 (-> -16.5). The coda entry is now stepped: outro -33 to -36 -> pad swell at 263.26 (-27) -> drum hit 264.54 (-22 for that second) -> groove from 265.94 (-18.7, then -17).
- **Biggest drop**: 245.0 (-15.0 -> -27, about -12 dB in one cut, with the voice carrying straight through it), then on down to -41.5 at 248.

Cut points, in order [M]:

| Time | Event | Type |
|---|---|---|
| 5.1 | First hand tap (onset 5.14) | soft entry |
| 8.9 / 18.5 | Whispers | |
| 16.5-18.5 | Tap/drum fill building into the groove (loudest 17.0-17.75; extra hit 19.0) | build |
| **19.3** | Bass + beat drop in | hit |
| 30.16 | Verse 1 vocal; texture thins | |
| 59.18 | Instrumental break begins, bass sustains | lift |
| 75.1 | Bass leaves the break | thin |
| 78.05 | Pre-chorus vocal (bass back 78.86) | |
| **93.5** | Drums + bass drop out | drop (-7 dB) |
| 96.45-96.65 | "ks" of "looks" | consonant |
| 96.8 | "How do you feel" exposed | |
| **98.22** | Chorus 1 full band | **hit** |
| 119.2 / 121.06-123.96 | Held "go" ends / vocalise | |
| 127.16 | Verse 2, texture thins | step down |
| 140.5-141.7 | Band stop on "Good catch!" (drum hit 141.68, bass 141.84, groove 142.0) | stutter/drop |
| 147.2 | Interlude thins (drums); bass leaves 147.5 | drop (-5 dB) |
| 150.7-156 | Drums swell back (continuous from 153.1) | build |
| **156.14** | Bass returns, arpeggio forward | hit |
| 164.4 | Bridge vocal (lead-in from 163.8) | lift |
| **182.7** | Hard stop | **cut to silence** |
| **184.90** | Verse 3 full band | **hit (+16 dB)** |
| **209.0** | Hard stop (bass 208.94, drums 209.10) | **cut to near silence** |
| 209.5-213.15 | "I think he's right. Honestly." | hushed |
| **213.38** | Drums alone | re-entry |
| 214.72 | Chorus 2 vocal over drums | |
| **216.12** | Bass + full chorus 2 | **hit** |
| 223-245 | Plateau (peak of the song 233-245) | |
| 237.2 | Held "go" ends; band alone from here | runway |
| 243.52 | "Keep the smile on" enters OVER the band | vocal entry |
| **245.0** | Band gone in one cut (bass 244.78, last drum onset 244.80), mid-line | **cliff (-12 dB), biggest drop** |
| 245.45-247.4 | "so they don't know", exposed | |
| 247.4-249.05, 252.25-252.95, 257.4-259.3 | Breaths between outro lines (first and last are near-silent, -40 to -41.5) | |
| 259.3-263.4 | "And I can think again" | |
| 261.83 / 262.04 | Two faint pickup taps | |
| **263.26** | Pad swells in under the fading last syllable | soft swell (+9 dB) |
| **264.54** | Single big low drum hit; bass starts fading in at 264.84 | **hit** |
| 265.06, 265.21, 265.68 | Sparse lead-in hits | |
| **265.94** | Coda groove locks in; full level by ~267.1 | **hit / build** |
| 273.1 | Bass drops out, drums + pad carry on | thin |
| **275.3** | Drums stop dead (last onset 275.09); low C1 bass note + pad | cut |
| ~276.3 / ~277.5 | Ring-out below -35 / below -45 (file ends 278.40) | |

## 5. Files (all under `analysis/v3/`)

- `song_map.md` — this file
- `transcription_vocals_stem.json` — whisper large-v3 on demucs vocal stem, word timestamps + probabilities
- `transcription_full_mix.json` — same on the untouched mix (cross-check)
- `words.log` — both transcriptions flattened to word@start-end(p), one line per segment
- `features.json` — beat times, BPM, 0.5 s RMS per stem (mix/vocals/drums/bass/other), spectral centroid
- `stems/htdemucs/Proof/{vocals,drums,bass,other}.wav` — separated stems
- `clips/` — 16 kHz excerpts (vocal stem and mix, 17 windows) and `retranscriptions.json`, used for the lyric-free gaps and contested words, including primed tests for can/can't, market-fresh/green and fresh, truth/choose, Keep/She can, shelved/shoved, one he missed/warning list (the last one returned nothing useful: the primed runs skipped the line)
- Scripts (run from `analysis/v3/` with `../../.venv/bin/python`; transcribe/clips need `LD_LIBRARY_PATH` pointing at the venv's `nvidia/cublas/lib` and `nvidia/cudnn/lib`):
  - `transcribe.py`, `analyse.py`, `detail.py` — unchanged copies of v2
  - `gaps.py` — v2 copy with new tail/coda windows and a low-probability word dump
  - `clips.py` — v2 copy with new windows and more primed tests
  - `compare_old.py` — rewritten: sample-level v2-vs-v3 correlation per 1 s window, plus the `inputs/edits/` files against v3
  - `compare_v2.py` (new) — structural diff: stem on/off transitions from both `detail.log`s, per-second level differences, drum onset-envelope lag, "looks" sibilance, start/end fades
  - `fine.py` (new) — 20 ms stem envelopes as on/off runs for v3 and v2 side by side, coda drum hits, vocalise and coda-bass pitch
  - `lines.py` (new) — vocal phrase runs, bar counts between events, beat-tracker outliers
- Raw logs: `demucs.log`, `tr_stem.log`, `tr_mix.log`, `analyse.log`, `detail.log`, `gaps.log`, `clips.log`, `compare_old.log`, `compare_v2.log`, `fine.log`, `lines.log`, `loudness.log`

## 6. Differences from the v2 map

v2 figures in this section are either quoted from the v2 map or, where marked "same code", re-measured in this run on the v2 stems in `analysis/v2/stems/` with the script used for v3, so the two columns are comparable.

Unchanged within ~0.1 s [M]: tempo, key, and every entry/drop/stop from 0 to 233 s — taps 5.1, verse 1 30.16, break 59.2-78.05, band drop 93.5, chorus hit 98.22, verse 2 127.16, "Good catch" stop 140.5, interlude start 145.9, bass return 156.14, stop 182.7, verse 3 184.90, stop 209.0, drums 213.38, vocal 214.72, band 216.12, end of chorus 2 lyric 232.96, bass cut 244.78. The drum-stem lag of v3 against v2 drifts smoothly from 0.00 s at the start to -0.05..-0.07 s (v3 earlier) between 56 and 184 s, back to 0.00 by 216 s and +0.03 s by 244 s; nothing in the body moves by more than that except the items below.

Changed in the ending (after 233 s):
1. **Held "go" after chorus 2 is longer**: ends ~237.2 (v2 ~235.9; same code 236.2).
2. **Vocalise in tail 2 is gone.** v2 had one at 238.7-241.3; v3's vocal stem is silent 237.5-243.5. Band-only runway is now 237.2-243.5 = 6.3 s (v2: 241.3-244.8 = 3.5 s).
3. **Outro line 1 enters over the band**: 243.52 (v2 245.26). The band cut is at practically the same place (bass 244.78 vs 244.76; drums silent by 245.0-245.2 vs a tail decaying to ~246.1 in v2), so v2's "clean cliff, then the voice" has become "voice first, cliff mid-line". This is closer to how the original 4:28 version behaved (line 1 from ~242, band cut 245.1 mid-line, per the v1 map).
4. **Outro lines shift**: starts 243.5 / 249.05 / 252.95 / 259.3 (v2 245.3 / 249.35 / 254.65 / 259.15), i.e. -1.8 / -0.3 / -1.7 / +0.15 s. The 2.35 s pad-swell gap before "She turns around" is gone (now a 0.7 s breath); instead there are two near-silent gaps, 247.4-249.05 and 257.4-259.3.
5. **No held last note.** v2 sustained C4 from 263.8 to ~265.6 into the drums; v3's last syllable fades on D4 by ~263.4 and the voice is absent from the coda.
6. **Coda rebuilt.** v2: drums slam in at 264.28 out of nothing (+15 dB), drums + pad only until bass at 268.0, drums stop 274.5, bass + pad ring to 278.6. v3: pad swell 263.26, one big hit at 264.54 (+0.26 s), sparse hits, groove from 265.94, bass present from 264.84 (fading in) and gone by 273.1, drums stop at **275.3 (+0.8 s)**, ring-out over by ~277.5. Coda drum span 10.8 s (v2 10.2 s).
7. **Ending is shorter and quieter**: final tone ~2.2 s at -34 dB average (v2 ~4.1 s at -24). File is 278.40 s (v2 279.12).
8. **The loudest passage moves back** from the coda (v2 -14.8 at 268-274.5) to chorus 2's tail (233-245, -15.5); the v3 coda averages -16.6, 1.2 dB below v2's.

Changed in the body:
9. **Interlude bass leaves earlier**: 147.5 (v2 149.0; same code 148.9).
10. **"looks" has a "ks"**: sibilant burst 96.45-96.65 in the vocal stem; nothing there in v2 (same code). The manual edits in `inputs/edits/` add a burst at the same spot (96.45-96.6, about 10 dB hotter), so the new render achieves natively what those edits were patching in [M bursts; G intent].
11. **Bass enters the groove slightly earlier**: 19.30 (v2 19.46; same code 19.46). Whisper 2 runs longer (to 19.9; v2 19.5-19.6), whisper 1 ends sooner (11.3; v2 11.6).
12. **Tail 1**: held "go" to 119.2 (v2 118.9-119.0), vocalise to 123.96 (v2 123.4), read an octave higher by pyin.
13. **The 209-213 hole is less empty**: a pad at -42 to -44 remains (v2 -58), mix -38 to -39 (v2 -40 to -44).
14. Pads ("other" stem) are 6-8 dB lower through much of verse 3 (190-203); file starts ~5 dB louder in its first second.
15. **Lyrics as heard**:
    - Worse / changed: "market-fresh" -> "green and fresh" (new); "shelved" -> "shoved" (new); "truth by reference" now split truth/choose (was clean); "Keep the smile on" garbled on the stem because it is now under the band; "Perky" -> "Herky" and "Resting" -> "Rest in" on the mix pass.
    - Better: "the one he missed" now unanimous (v2: 3 of 4 runs heard "the warning list"); "Blocking" now as written (v2 "Parking"); "Well" as written (v2 "We're"); "can think again" now "can" in all six unprimed runs (v2: excerpts flipped); "artichoke" recognised by the stem pass for the first time; "looks" complete.
    - Same: "Ever tinier", "Enthralled", "Her face", "atoms/Adams", "code/coat".
16. Master: -15.9 LUFS, LRA 7.6 LU, true peak -4.8 dBFS (v2 -16.0 / 6.8 / -3.5). Key correlation 0.72 (v2 0.75).
17. Measurement refinements, not real changes [G]: bridge vocal start given as 164.4 with a lead-in from 163.8 (v2 map 164.7; the v2 stem measured with the same code shows energy from 164.28); chorus 1 line 2 start 102.2 (v2 map 102.6); chorus 2 line 2 start 220.0 (v2 map 220.5); verse line starts within +/-0.4 s of v2's are within the method's tolerance.

Not measured / open [G]: whether the break's piano carries the vocal melody; half-time feel in the break; the true octave of the tail-1 vocalise; whether the low Bb2 (76.1-78.0) and C4 (146-155.9) tones in the vocal stem are sung, hum or bleed; exact position of "proof" inside the 182.7-184.9 stop; and, for all contested words above, what a human ear actually hears.
