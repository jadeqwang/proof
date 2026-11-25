# Proof — working status

**2026-11-25: read `HANDOFF.md` "START HERE" first; open decisions are in `media/decisions.html`.**


Checkpoint written 2026-11-22. Read this first if a session was interrupted.

## Done

- **2026-11-22 night: look test, six new sheets, 72 picked and composited keyframes.** See the last section of `HANDOFF.md`, `docs/KEYFRAMES.md`, and the review page `media/keyframes/index.html`. Not reviewed by Jade.

- **Song map v3**: `analysis/v3/song_map.md` describes the current `inputs/Proof.wav` (4:38.4, 99.4 BPM, C minor) and supersedes v2. Pushed to GitHub in commit `1b223b7` along with the plan doc, `analysis/v2/`, and `inputs/older version/`.
- **Character sheets** (Codex image generation, 1672x941), under `cast/`:
  `little_jade_03`, `little_jade_07`, `little_jade_10`, `jade_19`, `jade_27`, `dad`, `first_love`, `strangers/` (uncle, social worker, grandmother, laughing adults, party guests). Each image has a `.txt` sidecar; rejects are in `_rejected/`, unused designs in `candidates/`.
- **3D sets** (three.js, engine copied from `chaosmonkey-video/layout` into `layout/`), under `layout/sets/`:
  `attic88_day`, `wall88`, `closet02`, `shanghai86`, `office91`, `market93`, `basement90`, `kitchen90`, `mv10`, `playground23`. Renders in `media/layout/<set>/`, contact sheets in `media/layout/_sheets/` or `_sheet_*.jpg` in the set's media folder. Each set has a `NOTES.md` with its assumptions.

## Integration pass across all sets: finished

- **Left hands fixed in the engine** (`handFrame()` in `layout/engine/mannequin.js`, also used by `body.js`). The `fixLeftHands` workarounds in `shanghai86`/`office91` are now no-ops. This copy of the engine now differs from `chaosmonkey-video/layout/engine`; the fix has not been ported back there.
- **One cast table**: `layout/sets/_cast.js`, recorded in `layout/CAST.md`; all ten sets import it. Dad is 1.72 m everywhere (was 1.75 in the basement/kitchen).
- **Beam masks for all ten sets** via `layout/sets/_beam.js`: `beam_<id>` twins, plus `beam_<id>__surf` (lit surfaces only) in six sets and per-light twins in `mv10` (`__lamps`, `__dusk`, `__poi`). Sheets: `media/layout/_sheets/<set>_beam.jpg`. Masks are all white in her-eye-line shots that look straight down into the light (correct, but useless as mattes); `mv10` V3b is all black; the yard dusk light has no mask; cast shadows are not cut out of any mask.
- **Forearm grab matched** between `attic88_day` AD_grab and `market93` M4 (50 mm, 0.92 m, 31 deg above, 30 deg round) except the entry side: the two frames are mirror images. M4 lost the grandmother from its background; M4b still shows her.
- **Outro/coda shot labels moved to v3 times** (labels only).
- Only flat renders and masks were looked at after the final render; line, label, lit and depth were not. `__surf` and `mv10` per-light masks were checked by white-fraction only.
- `kitchen90` K5: the thumbs meet under the mouth, not on the cheeks.

## Not pushed

`cast/`, `layout/`, `media/` are committed locally only. The GitHub repo is public and Jade has not said whether these go up. `inputs/art style inspo/` and `inputs/edits/` are deliberately untracked and excluded from the public repo.

## Waiting on Jade

- **Plan doc is stale against v3**: no vocalise after chorus 2 (tail 2 and the sixth sung shot have nothing to sync to); the outro cliff at 4:05.0 now falls mid-line; coda is one hit at 4:24.5 then about 4.5 bars of groove to 4:35.3; final tone about 2 s. Revise the plan, or take it back to the instance it was discussed with?
- **Dad's age**: main sheets read 28-30, the age pass 40-45; target is mid-to-late 30s.
- **First love's design**: chosen candidate is a white American with brown wavy hair (reads apart from Jade's black hair from behind); a Chinese-American alternative is in `cast/first_love/candidates/`.
- **Little Jade's clothing and hair** at 3, 7, 10, and **Jade at 19**: glasses in 2002? straight centre-parted hair?
- **Attic neon sign** left out of the daylight set because it would shade the window.
- **Kitchen outro**: the child's face is out of the sun shaft (one value, `SUN` in `kitchen90/layout.js`).
- **Market**: the grandmother barely shows in the tight forearm-grab shot, and is absent from the eye-line shots.
- **Wall**: the blade of light misses her mouth by 2.8 cm, so "her mouth opens in the light" is not staged.
- **Playground family**: invented as adult Jade, a partner, and a carried toddler.
- **Shelf**: the "truth" half was built as reference sets with science fiction among them.
- **Resolution**: Codex sheets are about half the size of the Chaos Monkey v3 sheets.

## Known gaps in the sets

Hands are mitts (thumbs on cheeks, the uncle's pinch, the dictionary); no mote particle field in any set; the piano-break descent into the tissue is a start frame and an end position only; lit and depth renders were mostly not inspected by eye; the three shadows at the shelf are near-identical (widths 0.92/1.04/1.16 m), not identical.

## 2026-11-23: karaoke video (in progress)

Jade asked for a lyric-only karaoke video for singing live: lead vocal muted, backing vocals and effects kept, a couple of lines of look-ahead.
- Audio: lead/backing separation into `media/karaoke/audio/Proof_karaoke.wav`.
- Lyrics: word-timed `media/karaoke/lyrics_timed.json` (canonical text from `analysis/v3/song_map.md`).
- Render: `tools/karaoke/render.sh <json> <wav> <out.mp4> [start dur]` (ASS \kf karaoke over blurred cover; previous line above, current line, next 2 lines below; countdown dots before entries after gaps >= 6 s).
- Lead passages Jade wants LEFT IN the karaoke track (shown italic as backing, not sung live): "(Her English comes from books)" ~81.4-84.3, the "aaah" vocalise after chorus 1 ~121.06-123.96, "Good catch!" ~140.46-141.18 (band stop).
- Also keep: the repeated "match" backing (~145.8-156.0, one per beat, through the synth interlude), and ALL echo/delay/reverb tails of the lead generally (Jade: "the echos should stay"). Only the dry lead while sung is removed.
- Also ship key-shifted versions: -1 semitone (B minor) and -2 (Bb minor), via ffmpeg rubberband (tempo unchanged, formants preserved), same lyrics timing.
- DONE 2026-11-23: `media/karaoke/Proof_karaoke.mp4`, `Proof_karaoke_-1_semitone_Bm.mp4`, `Proof_karaoke_-2_semitones_Bbm.mp4` (278.4 s, 1080p). Audio: aufr33 mel-roformer karaoke model, lead subtracted from the 48k original, restore windows in `work/karaoke_cand/build_karaoke.py`. Lyrics: `tools/karaoke/build_lyrics.py` (OVERRIDES table). Not yet listened to by Jade. To check by ear: 18.5-19.2 whisper "But not like that" only ~half removed; boundary at 81.46 (tail of "children").
- 2026-11-23 update: "For our culture, that's just how it looks" now LEFT IN (restore 91.12-96.77, incl. held "looks"; shown italic). "match" repeats hidden on screen (`hide` flag), still in audio. Versions now 0, -1..-5 semitones (Bm, Bbm, Am, Abm, Gm), all 278.4 s, shifted audio within ~10 ms of original.

## 2026-11-24: karaoke v2 for the -2sm Suno render

- Suno's "no lead vocals" track is a separate render, not a stem: not sample-aligned with the full mix (differencing leaves +3.5 dB residual) and it drifts smoothly against it, -0.30 s around 90 s to +0.37 s in the outro (map: `work/karaoke_v2/warp.json`, from percussive onset xcorr). So: lead vocal for alignment = audio-separator (aufr33 roformer) on the full mix; lyrics aligned in full-mix time and warped onto the no-lead timeline.
- Alignment: torchaudio MMS_FA forced alignment on the lead stem (`work/karaoke_v2/fa.py`, needs `work/karaoke_venv`), then `tools/karaoke/build_lyrics_v2.py` (hand overrides for the choruses' first two lines and "I think he's right. Honestly.", onset snapping, held-note ends). Text: `tools/karaoke/lyrics_v2_lines.py`. Lyric changes in this render: "Basement, Dad's code, I watch", "I point to one he missed", "I nod, past hour reviewed".
- Out: `media/karaoke_v2/lyrics_timed.{json,txt}`, `Proof_karaoke_-2sm.mp4` (no-lead track), `Proof_karaoke_-2sm_guide.mp4` (full mix, lead -12 dB, `audio/Proof_-2sm_guide_-12dB.wav` from `tools/karaoke/make_guide_v2.py`).
- Renderer: `.venv/bin/python tools/karaoke/render_v2.py OUT.mp4 [--audio inst|guide] [--bg CLIP@START ...] [--xfade 4]` (EB Garamond Medium instance in `tools/karaoke/fonts/`, ink/rubric-red \kf on paper halo, two alternating rows).
- Background split: artichoke 0 -> crossfade into frost at 145.03 s (no-lead time) = start of the synth-arpeggio interlude after Verse 2 ("...pattern match?"), 4 s fade.
- Final background render (run once both masters exist; artichoke 140 s is slowed to fill 0-149 s, frost 140 s is sped x1.13 to fill 145-268.7 s):
  `.venv/bin/python tools/karaoke/render_v2.py media/karaoke_v2/Proof_karaoke_-2sm_bg.mp4 --bg media/footage/artichoke/out/artichoke_growth_prores422hq.mov@0 media/footage/frost/out/frost_master_prores422hq.mov@145.03 --xfade 4`
