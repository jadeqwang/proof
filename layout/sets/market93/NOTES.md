# market93: produce aisle, Marketplace on Oakton, Skokie, 1993

Render: `node layout/render.mjs --set market93` (from the repo root). Output in `media/layout/market93/`,
contact sheets `media/layout/market93/_sheet_{label,line,lit}.jpg`.

Files: `layout.js` (every number, the light list, the beam, the blocking marks), `build.js` (geometry, cart, rig,
sidecar extras), `phyllo.js` (artichoke and romanesco), `shots.js` (cameras).

## Axes

Aisle along z. Gondola shelving at x < -0.9, produce islands at x > +0.9. Back wall z = -9, front of store z = +9.
She faces +z and is led away toward +z. A camera on her face looks toward -z: islands frame right, gondola frame left.

## Assumptions (the plan leaves these open)

- **Store.** 13.8 x 18 m department, 3.35 m drop ceiling, 1.8 m aisle. Islands 1.6 x 3.6 m, rim 0.80, ridge 1.12.
  Layout follows the Devon Market references, not a record of the real store.
- **Awnings only on the second island row.** The island she stands at is open, so the ceiling tubes reach the produce.
- **Tubes.** Chain-hung bare two-tube 4 ft strips at 2.9 m, rows every 2.4 m, strips every 1.5 m.
- **The beam is one strip** (row x = 0.6, centre z = 0.4), as a downward prism: 24 deg across the tubes, 14 deg past
  their ends. Footprint 2.7 x 2.7 m on the floor (`beamRect(y)` in layout.js). The other rows are drawn but are not beam.
- **Why the grandmother is unlit.** The two strips behind the key one in the same row have dead tubes. She waits under them.
- **Why she cannot pass.** A pallet of cartons on the gondola side leaves 0.49 m between it and Jade; the cart is 0.56 m.
- **Jade is about 10, 1.38 m.** She has lifted the artichoke out of its bin and holds it in both hands, turned 20 deg
  toward the island. For the walk-away shots it is back on its heap, at the aisle edge of the bin.
- **Mama** is further up the aisle at the gondola until the grab, then at Jade's right side; her right hand takes
  Jade's right forearm. She leads her away toward the front of the store by the same forearm.
- **Walk-away.** Jade and Mama are out of the beam by then. The grandmother overtakes on the gondola side.
- **The count is 8.** The artichoke has 8 arms one way and 5 the other. "One short" = 7 numerals.
- **Romanesco**: 13 and 8 arms; each floret carries its own 5 and 3.
- **Cast.** `jade10` and `grandma` are registered from `layout.js` (`CAST93`) at load; `engine/mannequin.js` is not edited.
  If another set adds a 10-year-old Jade to the engine under the same key, that entry wins.

## Phyllotaxis

Element n sits at azimuth n x 137.5078 deg and polar angle theta_n from the tip, tan(theta_n / 2) = tan(theta0 / 2) exp(lnG n),
lnG = 2 pi / (sqrt(5) a b) for the arm pair (a, b). Element n is on arm n % a. Each sidecar lists every bract / floret with
its arm indices, pixel position and whether it faces the camera (`artichoke.bracts`, `romanesco.florets`).

## Sidecar extras

`beam` (source, footprint corners in px at floor and bed height, who is inside), `artichoke`, `romanesco`.
The beam volume is also a mesh in the scene (`only: ['beam']`), invisible in the five existing modes.

## Known limits

- M4 (tight forearm framing): only the cart and a sliver of the grandmother show under Mama's arm. Any camera close on
  the forearm has Jade's body or Mama between it and the grandmother. M4b (M1's camera, with the hand) is where she reads.
- Inside shots M2, M3, M6 to M9 do not contain the grandmother.
- The `lit` preview uses one round spot that circumscribes the rectangular footprint; trust `BEAM`, not the preview edge.
- The artichoke is a rosette of flat scales on a sphere: right spiral counts, generic silhouette.
- No floor tile lines, no signage text, no checkouts. Bins other than the hero island's aisle side are single lumps.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. No pose here was changed. `M4` / `M4b`: Mama's (right) hand is on the forearm; Jade's left hand now cups the artichoke properly. `M5` (Mama leads with her LEFT hand): her arm reaches Jade's forearm, but the contact is too small in frame to judge.
- **Cast.** `jade10` comes from `../_cast.js` (was registered here); Mama is the engine's `mama` with `noApron`; `grandma` stays local.
- **The grab framing (M4 = attic88_day AD_grab).** One framing for the film's forearm grabs: 50 mm, camera 0.92 m from the midpoint of the grabbed forearm, 31 deg above it, 30 deg round to the child's right, that point at (0.5, 0.52) of the frame, the adult's forearm entering on a diagonal from an upper corner.
  Matched here: lens (was 50 already), distance (was 0.8), elevation (was level), the 30 deg, the frame position (was (0.55, 0.5)).
  Not matched: the side. From behind her (the attic's side) her own shoulders and head cover the forearm at every elevation tried (31, 55, 62, 76, 86 deg), so the camera stays in FRONT of her and Mama's hand enters from frame LEFT (frame right in the attic). Flop one of the two in the edit if the rhyme should be literal.
  Lost: the cart and the grandmother are no longer in M4's background (the camera looks down). `M4b` is untouched and still shows them.
- **Time.** `M9` is labelled 4:28.4-4:30.8 (bar 2 of the coda groove in `analysis/v3/song_map.md`). Label only.
- **Beam masks.** Every camera has two twins (`node layout/render.mjs --set market93 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/market93_beam.jpg`):
  `beam_<id>` = the lit volume white on black, as in attic88_day (the prism under the key strip, BEAM.src to beamRect on the floor), plus every surface inside it; when the camera stands inside the volume the volume is left out and only the lit surfaces are white.
  `beam_<id>__surf` = the lit surfaces only (no volume): use it where the camera looks through a broad volume.
  Cast shadows are not cut out of either (they are in the flat / lit renders).
  Looked at: PLAN, PLAN_B, WIDE, M5, M6 show the prism. Saturated: `M2`, `M3`, `M8`, `M8b` are white over the whole frame in both twins and `M4`, `M7`, `M9` nearly (close shots of things inside the beam); `M1`, `M4b` are white in `beam_` (the lens is inside or against the prism) and useful in `__surf`.

## Retimed to the -2sm master, 2026-11-25 (late; supersedes song times above)

Jade made `inputs/Proof (-2sm).wav` the master. Every song time in `shots.js` is now -2sm full-mix time
(`analysis/m2sm/song_map.md`), converted with `analysis/m2sm/remap.py` and then placed by hand on the -2sm sung onsets
and measured hits. Times written elsewhere in this file before this section are the old (v2/v3) clock.

- Verse 2a 2:06.3-2:16.1: M1 2:06.3-2:09.2, M2 -2:12.2, M3 -2:14.2, M4 (grab) 2:14.2-2:15.2, M4b 2:15.2-2:16.1.
- Interlude (now one thinned interlude, 2:25.2-2:34.5): after kitchen90 K4 (2:25.2-2:27.6), M5 2:27.6-2:29.0 (walked away,
  looking back), M6 2:29.0-2:30.0 (her eye-line; the count resumes from 8 on the artichoke plate, intercut), then the
  romanesco plate (PLATE XVIII) 2:30.0-2:34.5 per the plan. **M7, M8, M8b** served v3's full interlude half (2:36-2:45),
  which -2sm does not have; the plan gives their content to the plates, so they are kept as alternates, not in the cut
  (renders kept; M9 reuses M7's camera). M7's intent no longer says "bass returns" (there is no bass there in -2sm).
- M9 coda bar 2: 4:16.8-4:19.2.
