# mv10: the housewarming, Mountain View, 2010

One set, two connected spaces sharing the sliding door: the bookshelf room and the yard. `layout.js` holds every
number; `V3h` (top-down plan) is the reference plan for the whole set.

```sh
node layout/render.mjs --set mv10                 # 19 shots, five modes, sidecars
sh layout/sets/mv10/sheet.sh label line lit flat  # contact sheets in media/layout/_sheets/
node layout/render.mjs --set mv10 --shots BR5 --modes line,flat,lit
```

Axes: x -3 (hall wall) .. +3 (slider wall) .. 11 (west fence); z 0 (shelf wall) .. 4.4 (lamp wall). +x = west.
A camera looking at the shelf has the yard frame-right.

## The three shadows (BR5; also drawn in BR4a, BR4b, C2a)

- Three identical paper floor lamps along the front wall: same bulb height (1.30 m), same distance from the spines
  (3.865 m), 1.1 m apart, all to her right. She stands 1.155 m in front of the spines.
- Same height and same distance means one magnification (1.43) for all three, so the shadows are shifted copies:
  0.40 / 0.87 / 1.34 m to her left, 0.47 m apart, all on the TRUTH half. Heads are fully separate, shoulders overlap.
- Measured from the render (sidecar `three_shadows`, BR5): all three are 1.77 m tall with head centres at the same
  height, 0.46 m apart. Their overall widths are 0.92 / 1.04 / 1.16 m: each lamp sees her body from a more oblique
  angle (19 / 37 / 49 degrees), so the far lamps' shadows are about 12% wider each. Near-identical, not identical.
  Making them exact copies would need the lamps symmetric about her, which hides the middle shadow behind her.
- `line` and `label` draw each shadow's outline as a ribbon computed by projecting her mannequin through each lamp
  onto the spine plane. `flat` and `lit` show the same shadows from real shadow maps; the two agree.
- Guests are placed outside the lamps' paths to her and to the truth half, so only she throws shadows there.

## Assumptions (the plan leaves these open)

- Shelf halves: LEFT = TRUTH (dark case, uniform reference sets, one run of science-fiction paperbacks at her eye
  height next to the seam), RIGHT = BEAUTY (pale case, novels and art books of every height). This answers the plan's
  open question "should the truth side visibly be reference books, with the science fiction among them" with yes.
- Room 6.0 x 4.4 m, ceiling 2.44 m. Yard 7.9 x 10 m, fence 1.8 m, concrete patio outside the slider.
- The yard is west of the room, so the dusk sun sets behind the far fence. Sun 6 degrees up; the fence shades the
  lawn, so the sun only touches what stands above about 1.0 m (house wall) to 1.4 m (tree): heads, lemons. One shaft
  enters the slider and crosses the room away from the shelf (it lands on the hall wall), so the shelf is lit by the
  lamps alone.
- Light by section: bridge = lamps + dusk; verse 3 = lamps + dusk + fire poi; silence and chorus 2b = lamps + poi
  (dusk gone).
- The lemonade table is on the patio ("lemonade from the yard"). Lemons have r 0.085 m.
- First love in BR5 has stepped away to the slider, because anyone beside her at the shelf throws three shadows of
  their own into hers. In BR1/BR2/BR4/C2 he is at the shelf and his shadows do fall there in `flat`/`lit`; the line
  renders draw only hers.
- The silence (3:29) is staged in the yard under the lemon tree, poi directly behind her, since chorus 2b is "back at
  the shelf".
- Her route (`PATH`): shelf mark, across the rug, the open slider (greeting), patio (hug), under the tree (first love).
- Cast is registered from `build.js` at load (`jade27`, `firstLove`, sixteen guests); `engine/mannequin.js` is not
  edited. Guests have eyes, nose and mouth removed. Jade's 115% is a sidecar field (`amplitude_pct`), not geometry.
- First love is only ever seen from behind: BR1, BR2, BR4a, V3a (distant, turned to her), V3d, C2a, C2b.

## Not modelled

- Cups in hands, book titles, the fence boards, window treatments.
- Shadows of her on the floor in line mode (only the part on the spines is outlined).
- No beam-mask twin shots: the lit volume of the dusk shaft is given as numbers (`duskShaftAt`, `FOOTPRINTS`), and the
  lamp light on the shelf is the `flat` render.

## Integration pass, 2026-11-22 (supersedes anything above that contradicts it)

- **Left hands.** `engine/mannequin.js` now builds left hands exactly (`handFrame`); before, a left hand ignored `fingers` / `palm`, sat off its target and was about 15 % small. No pose was changed. Looked at after the change: `BR1` / `BR2` her left hand is at his elbow; `C2b` her (right) hand lies on his forearm beside the cup.
- **Cast.** `jade27` and `firstLove27` (was `firstLove`) come from `../_cast.js`; guests stay local.
- **Beam masks** (`node layout/render.mjs --set mv10 --prefix beam_ --modes flat --nojson`, sheet `media/layout/_sheets/mv10_beam.jpg`). Per camera: `beam_<id>` (every light that is on, together), `beam_<id>__surf` (the same without the dusk volume), and one per light: `beam_<id>__lamps`, `beam_<id>__dusk`, `beam_<id>__poi`.
  lamps = the bookcase fronts (FOOTPRINTS.lamps_on_shelf) minus Jade's three computed shadows, with people in front occluding. It is a SURFACE mask: three omni lamps have no shaft.
  dusk = the shaft through the slider as a volume (the opening above the fence shadow, along DUSK.dir to the floor / left wall / front wall).
  poi = its ground footprint (radius 4.5 m, clamped to the yard) plus the flames and their circles.
  NOT masked: the dusk light in the yard (everything above `duskFloorY(x)`: heads, canopy, lemons).
  Looked at: lamps good in BR1-BR6, C2a, HS1; dusk good in BR3, V3c, V3f, V3g, V3h; poi good in SI1, V3a, V3e, V3h. Saturated: `beam_BR1`, `beam_BR4a` and their `__dusk` are white over the whole frame (the outside camera stands against the shaft and looks through it: use `__lamps` / `__surf`). `V3b` is black in every twin (her view up into the tree: only yard dusk there). A per-light mask is black wherever that light is not in frame.
