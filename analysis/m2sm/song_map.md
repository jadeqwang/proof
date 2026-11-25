# Proof (-2sm) — song map for video planning

**This map is for the master.** Source: `inputs/Proof (-2sm).wav` (268.40 s = 4:28.4, 48 kHz stereo, Suno; Jade made it
the master on 2026-11-25). It supersedes `analysis/v3/song_map.md` for all planning. All times are seconds from file
start of the **full mix** (m:ss in brackets). The no-lead track `inputs/Proof (-2sm  no lead vocals).wav` is a separate
render that drifts -0.30..+0.37 s against the full mix (`work/karaoke_v2/warp.json`); never cut to its clock.

The v3 file this map is compared with is now `inputs/older version/Proof.wav` (278.40 s).
To convert a v3 time (the old plan, most `layout/sets/*/shots.js`): `analysis/m2sm/time_map.json` via `remap.py`.

Legend: **[M]** measured from the audio, **[G]** inferred, wants an ear.

Method: demucs `htdemucs` stems (`stems/htdemucs/Proof_m2sm/`); stem on/off runs (`events.py` -> `events.log`, 50 ms
RMS, `fine.py` for windows); chroma+onset DTW against v3 with the -2sm chroma rotated up two semitones (`dtw.py` ->
`dtw.log`, `dtw_path.json`); per-line vocal-envelope cross-correlation against the v3 vocal stem (`line_lag.py` ->
`line_lag.log`); pyin on the vocalises (`vocalise.py`). Lyric times are the forced alignment already made for the
karaoke (`media/karaoke_v2/lyrics_timed.json`, `start_full`), cross-checked against the -2sm whisper passes in
`work/karaoke_v2/whisper_{full,lead}.json`. Nothing was listened to.

## 0. What -2sm is, against v3 [M]

- **Same song, same arrangement, two semitones down.** Key **Bb minor** (Krumhansl 0.66; v3 C minor). Tempo the same
  ~99.4 BPM (beat 0.604 s, bar ~2.42 s). Drum, bass and vocal events up to 2:34 sit within 0.9 s of v3's: -2sm runs
  slightly ahead (offset grows smoothly 0 -> -0.86 s over 0-96 s, then holds).
- **One section is gone: the second half of the arpeggio interlude** (v3 2:36.1-2:44.4, "bass returns, arpeggio at its
  loudest"). The -2sm interlude is only the thinned half, and the bridge's vocal pickup now arrives over its last
  bar. Everything after it is **~10.3 s earlier** than in v3 (drifting back to ~-10.0 s by chorus 2).
- **Tail 2 has a vocalise again** (228.8-232.6), the same rising shape as tail 1's. v3 had none (v2 did).
- **The coda is a little shorter and ends differently**: the bass comes in with the big hit, the groove follows at once
  (no sparse lead-in), the drums stop on the downbeat four bars after the hit, and a loud low bass note rings on.
- **Three lyric lines are sung shorter**: "Basement, Dad's code, I watch" (v3 "Down in the basement, ..."), "I point to
  one he missed" (v3 "the one"), "I nod, past hour reviewed" (v3 "the past hour gets reviewed").
- File 268.40 s (v3 278.40). Loudness -15.7 LUFS integrated, LRA 7.2 LU, true peak -3.9 dBFS (v3 -15.9 / 7.6 / -4.8).

## 1. Tempo, key, metre

| | Value | Confidence |
|---|---|---|
| Tempo | ~99.4 BPM (tracker 99.38; beat 0.604 s; bar ~2.42 s) | [M]. Local drift vs v3 from DTW: ~0.9% ahead over 0-96 s, level 96-145 s, ~0.6% behind over 164-229 s |
| Key | **Bb minor** | [M] chroma; runner-up Db major (relative major) |
| Metre | 4/4 | [G], sections are whole bars as in v3 |
| Downbeats | listed per section in `time_map.json` (`downbeats_m2sm`) | [G] tracker beats phase-locked to a measured hit per section |

Measured downbeats to cut on (the hits): 19.00 groove, 58.55 break, 97.40 chorus 1, 145.15 interlude (bass pickup),
155.45 bridge bass, 174.70 verse 3, 203.35 chorus 2 drums, 206.10 chorus 2 band, 254.30 coda, 264.06 last hit.

## 2. Section map

| # | Section | Start | End | Length | What happens | v3 equivalent |
|---|---|---|---|---|---|---|
| 1 | Intro a — pad | 0.00 (0:00) | 4.85 (0:04.9) | 4.9 s | Pad fades in alone (-43 dB in the first half-second, -28 by 2 s) [M] | 0.00-5.1 |
| 2 | Intro b — taps + whispers | 4.85 (0:04.9) | 19.00 (0:19.0) | 14.2 s | Hand taps from 4.85. Whisper 1 8.76-10.51, whisper 2 18.23-18.94 (whisper 2 is half-hidden in the lead stem: "barely in the lead stem", karaoke notes). Tap fill into the groove ~16.2-18.2 [mapped from v3, G] | 5.1-19.3 |
| 3 | Intro c — groove | 19.00 (0:19.0) | 29.74 (0:29.7) | 10.7 s | Bass + full beat at 19.00 [M] | 19.3-30.16 |
| 4 | Verse 1 | 29.74 (0:29.7) | 58.55 (0:58.6) | 28.8 s, 12 bars | Voice + drums, bass stabs 31.5-54.4 [M] | 30.16-59.18 |
| 5 | Instrumental (piano) break | 58.55 (0:58.6) | 77.24 (1:17.2) | 18.7 s, ~8 bars | Bass sustained 58.55-74.40; the low tone in the vocal stem returns from 76.2 [M] | 59.18-78.05 |
| 6 | Pre-chorus | 77.24 (1:17.2) | 95.94 (1:35.9) | 18.7 s | Bass back 77.70. Lyric-free gap 83.3-87.4. **Band out at 92.68** (bass 92.60, drums 92.75); "that's just how it looks" over pads, "looks" 94.68-95.56 [M] | 78.05-96.8 |
| 7 | Chorus 1 | 95.94 (1:35.9) | 114.45 (1:54.5) | 18.5 s | "How do you feel" pickup 96.00 with a few soft drum ticks; **full band hit 97.40** [M] | 96.8-115.3 |
| 8 | Post-chorus tail 1 | 114.45 (1:54.5) | 126.32 (2:06.3) | 11.9 s | Held "go" to ~118.2; **vocalise 120.26-123.10** (G#4 rising to F#5/G5) [M] | 115.3-127.16 |
| 9 | Verse 2 | 126.32 (2:06.3) | 145.15 (2:25.2) | 18.8 s | Bass stabs 128.5-139.2. **Band stops 139.75-140.90** on "Good catch!" (139.99-140.81) [M] | 127.16-145.9 |
| 10 | Arpeggio interlude (thinned only) | 145.15 (2:25.2) | 155.45 (2:35.5) | 10.3 s, 4 bars + 1 beat | One bass note 145.15-145.80 then no bass; drums drop and come back sparsely; the "match" echo repeats in the vocal stem. **The bridge pickup enters over its last bar**: lead-in 153.5, "Do you not see" 154.50 [M] | v3 interlude a 145.9-156.14 |
| — | *(v3 interlude b, full: bass back + arpeggio at its loudest)* | — | — | **0 s** | **Not in -2sm.** [M: no bass and no "other"-stem lift anywhere between 145.8 and 155.45] | 156.14-164.4 |
| 11 | Bridge | 154.50 (2:34.5) | 174.70 (2:54.7) | 20.2 s | Bass from 155.45 (the bridge downbeat). **Hard stop 172.50** (bass 172.35, drums 172.50): "proof" 173.98 sung into the hole (mix -30 dB) [M] | 164.4-184.9 |
| 12 | Verse 3 | 174.70 (2:54.7) | 199.05 (3:19.1) | 24.4 s, 10 bars | **Full band slams in at 174.70** with "Housewarming" [M] | 184.9-209.0 |
| 13 | Full stop | 199.05 (3:19.1) | 203.35 (3:23.4) | 4.3 s | Everything cuts at 199.05; "I think he's right. Honestly." 199.45-203.20, hushed, over near silence (mix -36 dB) [M] | 209.0-213.38 |
| 14 | Chorus 2 | 203.35 (3:23.4) | 223.0 (3:43.0) | 19.6 s | **Drums alone 203.35**, vocal 204.75, **bass + full band 206.10** [M] | 213.38-232.96 |
| 15 | Post-chorus tail 2 | 223.0 (3:43.0) | 235.0 (3:55.0) | 12.0 s | Full band, the loudest stretch (-15.6). Held "go" to ~227.2; **vocalise 228.8-232.6 (NEW: not in v3)**; band alone 232.6-234.0; **outro line 1 enters over the band at 234.00** [M] | 232.96-245.0 |
| 16 | Outro | 235.0 (3:55.0) | 252.85 (4:12.9) | 17.9 s | **Cliff at 235.0** (bass gone 235.0, last drum onset 234.95, drums gone by ~235.3), at the end of "Keep the smile on" and before "so they don't know" (235.65) [M; G which side of "on"]. Near a cappella. Silences 237.4-239.1 and 247.5-248.6 [M] | 245.0-263.4 |
| 17 | Drum coda | 252.85 (4:12.9) | 264.06 (4:24.1) | 11.2 s | Pad swells in 252.85 as the last word fades (~253.2). **One big low hit at 254.30 with the bass entering on it**; the groove follows at once; bars at ~254.4 / 256.8 / 259.2 / 261.7; **last hit 264.06 on the next downbeat** (ring to ~264.7). The last bar is the loudest moment of the coda (-13 dB at 264) [M] | 263.26-275.3 |
| 18 | Final tone | 264.06 (4:24.1) | 268.40 (4:28.4) | 4.3 s | Drums stopped; **a loud low bass note + pad** hold (bass stem -19 dB to ~266.3), then fade: mix -22 at 266.5, -35 at 267.5, -41 at 268.0, file ends 268.40 [M] | 275.3-278.4 |

### Lyric-free stretches [M]

| Gap | -2sm | Length |
|---|---|---|
| Before whisper 1 | 0.0-8.76 | 8.8 s |
| Between whispers | 10.51-18.23 | 7.7 s |
| Whisper 2 to verse 1 | 18.94-29.74 | 10.8 s |
| Piano break | 58.6-78.28 | 19.7 s |
| Inside pre-chorus | 83.27-87.37 | 4.1 s |
| Tail 1 (held "go" to 118.2, vocalise 120.26-123.10) | 114.12-126.32 | 12.2 s |
| Interlude (to the bridge pickup) | 145.46-153.5 | 8.0 s |
| Tail 2 (held "go" to 227.2, vocalise 228.8-232.6) | 222.96-234.00 | 11.0 s |
| Coda + final tone | 253.2-268.4 | 15.2 s |

## 3. Lyrics, timed

-2sm times are the karaoke forced alignment (`lyrics_timed.json`, `start_full` / `end_full`, word level inside),
accuracy about +/-0.1 s on onsets. The v3 column is `analysis/v3/song_map.md`; its starts came from whisper and often
sit 0.3-1.0 s before the sung onset, so a v3 start pushed through the audio map can land early by that much
(`remap.py --snap` corrects lyric-synced cuts).

| -2sm start | -2sm end | Line (as sung in -2sm) | v3 start | Note |
|---|---|---|---|---|
| **Intro** | | | | |
| 8.76 | 10.51 | You need facial expressions | 8.9 | whispered |
| 18.23 | 18.94 | But not like that | 18.5 | whispered; faint in the lead stem |
| **Verse 1** | | | | |
| 29.74 | 33.92 | Three years old, uncle explains atoms | 30.2 | |
| 34.52 | 38.81 | A week later my mother finds me sat in | 34.7 | "sat in" 37.85 |
| 38.81 | 43.04 | A snow drift of paper, ripped to shreds | 37.8 / 41.4 | "ripped" 41.43 |
| 43.34 | 47.77 | Ever tinier, repeating what uncle said | 43.5 / 44.9 | "repeating" 45.43 |
| 48.14 | 53.06 | "What on earth are you doing?" The adults howl with laughter | 47.9 / 50.85 | "The adults" 50.52 |
| 53.93 | 58.59 | What's so funny? Nobody tells me after | 53.2 / 55.5 | "Nobody" 55.15 |
| **Pre-chorus** | | | | |
| 78.28 | 81.45 | She doesn't talk like other children | 78.05 | |
| 81.50 | 83.27 | (Her English comes from books) | 81.4 | the karaoke keeps this lead line (backing) |
| 87.37 | 90.72 | Her face doesn't make much expression | 88.15 | |
| 90.78 | 95.56 | For our culture, that's just how it looks | 91.1 | band out 92.68 under "that's just how it looks"; "looks" 94.68 |
| **Chorus 1** | | | | |
| 96.00 | 99.00 | How do you feel? Inside? | 96.8 | "Inside?" 98.00, just after the hit (97.40); faint in the lead stem |
| 100.70 | 105.20 | I honestly don't know | 102.2 | |
| 105.52 | 110.64 | I open my mouth, my voice goes blind | 105.35 | |
| 110.95 | 114.12 | The words have nowhere to go | 111.15 | "go" held to ~118.2 |
| 120.26 | 123.10 | (wordless vocalise) | 121.06 | not in the lyrics file; vocal stem [M] |
| **Verse 2** | | | | |
| 126.32 | 128.70 | Resting oblivious face | 127.2 | |
| 128.76 | 130.95 | Blocking the aisle, in the wrong place | 129.2 | |
| 131.01 | 133.57 | Enthralled by an artichoke, green and fresh | 131.56 | "artichoke" 131.91, "green and fresh" 132.42 |
| 133.63 | 136.00 | Sacred geometry made flesh | 133.96 | |
| 136.07 | 138.22 | **Basement**, Dad's code, I watch | 136.33 | **changed**: v3 "Down in the basement" |
| 138.27 | 140.81 | I point to **one** he missed. "Good catch!" | 138.8 | **changed**: v3 "the one"; "Good catch!" 139.99, band stop 139.75 |
| 140.91 | 145.46 | "Did she understand or just pattern match?" | 141.18 | "match" 144.52, echoed through the interlude |
| **Bridge** | | | | |
| 154.50 | 157.05 | Do you not see what I see? | 164.4 | lead-in from ~153.5 |
| 157.12 | 159.53 | Does it matter what makes me me? | 167.0 | |
| 159.62 | 164.36 | Beauty on this side, truth by reference | 169.4 | "truth" 161.96 |
| 164.41 | 166.80 | Science fiction shelved with truth | 174.4 | "shelved" 165.39 |
| 166.85 | 169.66 | From inside, I can't tell the difference | 176.67 | |
| 169.72 | 174.74 | And I can't give you proof | 179.5 | "can't" 171.32; stop 172.50; "proof" 173.98, in the hole |
| **Verse 3** | | | | |
| 174.94 | 179.19 | Housewarming, lemonade from the yard | 184.9 | band hit 174.70 |
| 179.24 | 183.79 | Perky American girl, I play the part | 188.46 / 191.36 | "I play the part" 182.23 |
| 183.85 | 185.98 | He said I absolutely nailed it | 193.5 | |
| 186.03 | 189.06 | Well, fifteen percent above amplitude | 195.97 | |
| 189.11 | 191.52 | I nod, **past hour reviewed** | 198.46 | **changed**: v3 "the past hour gets reviewed"; "nod" 189.23 |
| 191.57 | 194.15 | Hug durations, pitch contours | 201.17 | "pitch contours" 192.81 |
| 194.59 | 198.72 | Room crossing velocity | 203.8 | "velocity" 197.06 |
| 199.45 | 203.20 | I think he's right. Honestly. | 209.5 | full stop 199.05-203.35; "Honestly" 202.45 |
| **Chorus 2** | | | | |
| 204.75 | 209.00 | How do you feel? Inside? | 214.72 | over drums alone until 206.10 |
| 209.45 | 213.60 | I honestly don't know | 220.0 | |
| 214.18 | 219.27 | I open my mouth, my voice goes blind | 223.16 | |
| 219.58 | 222.96 | The words have nowhere to go | 228.95 | "go" held to ~227.2 |
| 228.80 | 232.60 | (wordless vocalise) | — | **new in -2sm**; not in the lyrics file; G#4 -> G5/F#5 [M pyin] |
| **Outro** | | | | |
| 234.00 | 237.35 | Keep the smile on so they don't know | 243.52 | starts over the band; cliff 235.0 before "so" (235.65) |
| 239.10 | 242.24 | This is how we fit in | 249.05 | |
| 243.56 | 247.49 | She turns around, I let it go | 252.95 | "I let it go" 245.46 |
| 248.57 | 252.67 | And I can think again | 259.3 | "can" 249.09; fades by ~253.2 |

### Contested words, as heard by whisper on -2sm (`work/karaoke_v2/whisper_*.json`) [M probabilities; G verdicts]

- "can think again": "can" (p 1.00 on both passes). As written.
- "truth by reference": "truth" (p 0.95-0.96 on both). As written; v3 split truth/choose.
- "shelved": mix pass "shelved" (p 0.71); lead pass "shelf" (p 0.02). Leans as written; v3 heard "shoved".
- "artichoke": recognised (p 0.94, mix). Better than v3.
- "green and fresh": still "green and fresh", as in v3 (the prompt says "market-fresh"; the karaoke text uses "green and fresh").
- "made flesh": the mix pass hears "made fresh" (p 0.91). Worth an ear.
- "Dad's code": mix pass "coat" (p 0.77), as in v3's stem pass.
- "Keep the smile on": as written (p 0.55 on "Keep").
- Chorus 2 line 1: the lead pass hears "How do you see inside?"; the mix pass "feel". As written.

## 4. Energy

Full-mix RMS by section, dBFS [M] (`features_mix.json`): pad -30, taps -23, groove -18.7, verse 1 -20.3, break -18.2,
pre-chorus -17.8, band-out -23.1, chorus 1 -17.3, tail 1 -16.8, verse 2 -19.0, interlude -22.1, bridge -16.8, stop -30.4,
verse 3 -16.7, full stop -36.2, chorus 2 -16.2, **tail 2 -15.6 (the plateau)**, outro -29.0, coda -19.7 (rising to -13
in its last bar), final tone -21.6 fading.

Shape: the v3 staircase with three holes, minus the interlude's lift: after verse 2 the song now dips (interlude -22)
and goes straight up into the bridge instead of stepping up through the "full" half first. The biggest jumps are the
same: out of the stop into verse 3 (174.70), drums alone then band in chorus 2 (203.35, 206.10), the cliff (235.0),
and the coda hit (254.30).

## 5. Files (`analysis/m2sm/`)

- `song_map.md` (this file), `time_map.json` (v3 -> -2sm), `remap.py` (converter; dry run by default), `build_map.py`
  (writes `time_map.json` from the anchors in it)
- `stems/htdemucs/Proof_m2sm/{vocals,drums,bass,other}.wav` — demucs stems of the -2sm full mix
- `analyse.py` (tempo, key, mix RMS -> `features_mix.json`, `analyse.log`), `events.py` (stem on/off runs ->
  `events.log`), `fine.py` (50 ms stem levels in a window), `stems_cmp.py` (-2sm vs v3 stem levels side by side),
  `dtw.py` (-> `dtw_path.json`, `dtw.log`), `line_lag.py` (-> `line_lag.log`), `vocalise.py` (-> `vocalise.log`),
  `downbeats.json`
- Run everything from `analysis/m2sm/` with `../../.venv/bin/python -I <script>`.

## 6. Not verified [G]

No listening was done. Wants an ear: whether 228.8-232.6 is the lead singing a vocalise or a doubled/backing layer
(pyin is clean and it shadows tail 1's, so probably lead); which side of the cliff "on" falls (235.0-235.3); "made
flesh" vs "made fresh"; whether whisper 2 is audible enough to carry a cut (the lead stem barely has it); the exact
end of the drum ring (264.06-264.7) and whether the file's last half-second is a fade or a cut.
