# Proof — handoff for the next session

Written 2026-11-22. Read this, then `STATUS.md` (what exists, known gaps, and the full list of decisions waiting on Jade), then `Proof — Music Video Plan.md`.

## Where things stand

The film does not exist yet. What exists is the groundwork for the plan's "Order of work" steps 1, 2 and 5:

| Step in the plan | State |
|---|---|
| 1. Lock the song map | `analysis/v3/song_map.md` is current for `inputs/Proof.wav` (4:38.4). The ear checks are still open. |
| 2. Build the sets | Ten three.js sets, 99 cameras, rendered, with beam masks. Blockout quality: mannequins, mitt hands. |
| 3. Animatic | Not started. |
| 4. Look test (attic beam) | Not started. |
| 5. Cast | Sheets generated for every character. None reviewed by Jade yet. |
| 6-8. Stills, motion, layers, sung shots, edit | Not started. |

**The plan doc is out of date against the song.** It was written for the v2 render. In v3 the vocalise after chorus 2 is gone, the outro's first line starts over the band so the 4:05 cliff falls mid-line, and the drum coda is one hit plus about 4.5 bars. Jade has been asked whether to revise the plan here or take it back to the session it was written in, and has not answered. Do not edit the plan without that answer. Details are in `STATUS.md` and section 6 of the v3 map.

## Where to look

- **Renders, in a browser:** open `media/layout/index.html`. Regenerate it after any re-render with `python3 layout/gallery.py`.
- **Sets:** `layout/sets/<set>/` (`layout.js` dimensions and lights, `build.js`, `shots.js` camera table, `NOTES.md` assumptions). Shared: `layout/sets/_cast.js` (heights, see `layout/CAST.md`), `_beam.js` (masks), `_sheet.sh`. Engine docs: `layout/README.md`, `layout/NOTES.md`.
- **Render a set:** from the repo root, `node layout/render.mjs --set <set>`; masks with `--prefix beam_ --modes flat --nojson`. It depends on three.js, playwright-core and Chrome at paths outside this repo (listed in `layout/README.md`).
- **Character sheets:** `cast/<who>/`, each image with a `.txt` sidecar holding its prompt and references. `cast/_tools/ljgen.py` is one agent's generator script; `cast/_tools/little_jade_lineup_3_5_7_10.jpg` is the age line-up.
- **Canon and references:** `inputs/refs_chaosmonkey/CANON.md` and the v3 sheets beside it.

## How the work was done

- **Image generation** goes through Codex's built-in image generation, run headless inside a tmux session: `codex exec -s workspace-write --skip-git-repo-check "<prompt>" -i <reference images> < /dev/null`. It costs nothing per call and returns 1672x941. Use a uniquely named tmux session and leave other sessions alone.
- **Only generated sheets may be sent to an outside service.** Never anything from `inputs/refs_chaosmonkey/source_refs/` or `/home/jade/Documents/character sheets/`, which contain real photos.
- **Delegation:** Jade prefers work handed to subagents with only conclusions relayed. Agents writing sets in parallel were kept to their own `layout/sets/<set>/` directory and told not to edit `layout/engine/`.
- **`layout/` is a copy** of `/home/jade/Documents/chaosmonkey-video/layout`, taken because that repo had uncommitted engine work. The copy has since diverged: left-hand fix (`handFrame()` in `engine/mannequin.js` and `body.js`), a `spec.costume` field, one line in `engine/render.js` for the mask shader, and `--exclude` in `render.mjs`. Nothing has been ported back, and that repo must not be edited without asking. `layout/sets/attic88/` is the original night attic and is kept unmodified.

## Git

- Remote `origin` is `github.com/jadeqwang/proof`, **public**.
- Pushed: through `1b223b7` (plan, song maps v2 and v3, audio).
- **Local only:** the commits after it, holding `cast/`, `layout/`, `media/`, `STATUS.md`, this file. Jade was asked whether these should go to the public repo and has not answered. A plain `git push` would publish them, so do not push until Jade says so.
- Deliberately untracked and excluded from the public repo by Jade: `inputs/art style inspo/`, `inputs/edits/`.

## Suggested next steps, in order

1. **Get Jade's answers** to the list in `STATUS.md` ("Waiting on Jade"). Three of them gate other work: the plan revision for v3, Dad's age, and first love's design. Changing either character means regenerating that character's whole sheet set from a new anchor.
2. **Look at the line renders.** After the integration pass only flat renders and masks were inspected; the line renders are what the image model will be given. The gallery makes this quick.
3. **Fix the staging problems already found:** the kitchen thumbs meet under the mouth and not on the cheeks (`kitchen90` K5); the wall's blade of light misses her mouth by 2.8 cm (`wall88`); the child's face is out of the sun in the kitchen outro; the grandmother is missing from the tight grab (`market93` M4); the forearm-grab frames in attic and market are mirror images.
4. **Animatic** (plan step 3): one line render per shot, cut to `inputs/Proof.wav` at v3 timings. This needs the plan's tail 2, outro and coda rows settled first.
5. **Look test on the attic beam** (plan step 4), using `attic88_day` AD_mote and its mask.

## Things that are easy to get wrong

- Times in the plan's Structure table are v2 times. Shot labels in the sets were moved to v3 for the outro and coda only.
- A beam mask that is all white is not a bug in the eye-line shots that look down into the light; use the `__surf` twin there, or accept that the whole frame is lit.
- Clothing, hair, the playground family, the kitchen's pendant lamp, the handout's 23 other labels and several room layouts were invented by agents where the plan was silent. Each set's `NOTES.md` and each sheet's sidecar says what was assumed. Treat them as proposals until Jade confirms.
