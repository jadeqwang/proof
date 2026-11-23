# Proof — working status

Checkpoint written 2026-11-22. Read this first if a session was interrupted.

## Done

- **Song map v3**: `analysis/v3/song_map.md` describes the current `inputs/Proof.wav` (4:38.4, 99.4 BPM, C minor) and supersedes v2. Pushed to GitHub in commit `1b223b7` along with the plan doc, `analysis/v2/`, and `inputs/older version/`.
- **Character sheets** (Codex image generation, 1672x941), under `cast/`:
  `little_jade_03`, `little_jade_07`, `little_jade_10`, `jade_19`, `jade_27`, `dad`, `first_love`, `strangers/` (uncle, social worker, grandmother, laughing adults, party guests). Each image has a `.txt` sidecar; rejects are in `_rejected/`, unused designs in `candidates/`.
- **3D sets** (three.js, engine copied from `chaosmonkey-video/layout` into `layout/`), under `layout/sets/`:
  `attic88_day`, `wall88`, `closet02`, `shanghai86`, `office91`, `market93`, `basement90`, `kitchen90`, `mv10`, `playground23`. Renders in `media/layout/<set>/`, contact sheets in `media/layout/_sheets/` or `_sheet_*.jpg` in the set's media folder. Each set has a `NOTES.md` with its assumptions.

## In progress: integration pass across all sets

One agent, interrupted once by a usage limit and resumed. Its five items:

1. Fix the left-hand orientation bug in `layout/engine/mannequin.js`; remove the local `fixLeftHands` workarounds in `shanghai86`/`office91`; re-render and check hands.
2. One cast table: `layout/sets/_cast.js` and `layout/CAST.md` (both exist on disk as of this checkpoint).
3. Beam masks for every set via a shared `layout/sets/_beam.js` (exists on disk; it was working on this when interrupted). Sets that lacked masks: `shanghai86`, `office91`, `market93`, `basement90`, `kitchen90`, `mv10`.
4. Match the forearm-grab framing between `attic88_day` AD_grab and `market93` M4.
5. Relabel outro/coda shot times to the v3 map (`kitchen90` K5-K10, `playground23`, `attic88_day`, `market93` M9).

If it is interrupted again: check which sets have `media/layout/_sheets/<set>_beam.jpg`, whether all sets import `_cast.js`, and whether every set still renders (`node layout/render.mjs --set <set>`), before continuing.

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
