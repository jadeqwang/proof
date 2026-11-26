# Proof — brief for making a keyframe

For anyone (person or agent) painting stills for this film. Read `docs/KEYFRAMES.md` section 1 first (the look), then
this. The plan is `Proof — Music Video Plan.md`; the poems, digested for artists, are in `docs/poem_digest.md`.

## What a keyframe is here

One still per shot, painted by an image model from the 3D set's guides and the character sheets. It carries the room,
the people, the shadow wash and the bare-paper light. It does NOT carry motes, gold pencil marks, toner labels,
headers or any lettering: those are laid on afterwards in code (`tools/kf/comp.py`). Never ask a model for them.

## The film in four sentences (hold this while you paint)

People look at her face, see nothing move, and conclude nothing is there. The film never argues; it shows where her
attention is, in full depth, every time. Her resting face is concentration, and her mother, father and son have the
same one. The people who love her read her hands.

## How to generate

```
PY=/home/jade/Documents/halys-video/.venv/bin/python        # run from /home/jade/Documents/proof
$PY tools/kf/kf.py --route codex --out media/keyframes/<set>/<SHOT>_v1.jpg --prompt-file prompts/kf/<set>/<SHOT>_v1.txt \
    --ref "media/layout/<set>/<SHOT>_contour.png:the layout drawing from the 3D set: composition, camera and the outline of every object (lines only, no shadows drawn)" \
    --ref "media/layout/<set>/<SHOT>_form.png:the same view as evenly lit grey clay: what every surface and object is and how far away (tints only tell people, furniture, small props apart; they are not colours)" \
    --ref "media/layout/<set>/<SHOT>_light.png:the light map: white = in the light, pale grey = weak light, mid grey = shade (where the light falls, not how dark the picture is)" \
    --ref "<face sheet>:<what it is for>" ...
```

- `--route codex` is the default: Codex's built-in image generation, on Jade's plan, no per-call cost, about 90 s,
  1672x941. It runs in tmux session `proof-kf`; the script blocks until the file exists. Run at most TWO at a time.
- `--route gpt2` (openai/gpt-image-2 on Cloudflare, 3072x1728, about $0.24) only when Codex has failed twice on the
  same frame or the job errors. Do not use other routes; the bake-off is done (see `docs/KEYFRAMES.md`).
- Never overwrite: bump `_v2`, `_v3`. Each image gets a `.txt` sidecar automatically. Keep the prompt file.
- **Only generated sheets, set renders and earlier outputs may be passed as `--ref`.** Never anything from
  `inputs/refs_chaosmonkey/source_refs/`, `/home/jade/Documents/character sheets/`, `inputs/art style inspo/`, or any
  photograph. The script refuses the first two.
- Look at every result yourself (Read the image; downscale to about 1400 px wide first with `convert`). Judge it
  against the checklist below. At most THREE takes per shot; if none passes, keep the best, say what is wrong, move on.
- Record your pick per shot in `media/keyframes/<set>/picks.json`: `{"<SHOT>": {"pick": "<file>", "note": "..."}}`.

## The guides (since 2026-11-25 night: contour / form / light)

Every shot has three painter guides, rendered from the 3D set (`node layout/render.mjs --set <set> --modes
form,contour,light --nojson`; see `layout/README.md`). Pass them as the first three refs, in this order:

| file | what it tells the painter | caption for `--ref` |
|---|---|---|
| `<SHOT>_contour.png` | composition: camera, sizes, positions, every silhouette and crease; NO shadow shapes | the layout drawing from the 3D set: composition, camera and the outline of every object (lines only, no shadows drawn) |
| `<SHOT>_form.png` | what each surface and object is, all of it readable at mid-to-light values, no cast shadows | the same view as evenly lit grey clay: what every surface and object is and how far away (tints only tell people, furniture, small props apart; they are not colours) |
| `<SHOT>_light.png` | where the shot's real lights fall (white), weak light (pale grey), shade (50 % grey) | the light map: white = in the light, pale grey = weak light, mid grey = shade (where the light falls, not how dark the picture is) |

- The painting's mood and darkness come from the PROMPT'S WORDS (the LIGHT paragraph), never from the guides: the
  guides are deliberately bright so nothing is ambiguous. Say in the prompt how dark the shade is and what colour.
- In the form guide people are blank white clay with grey hair caps; the faint blue-grey things are small props,
  the beige ones furniture, the grey ones the room. Pale cyan, semi-transparent = glass.
- `_line.png` / `_flat.png` / `_lit.png` still exist; use `_lit.png` only as an extra mood hint, never as the main
  light guide (its darks hide form). Do not pass `_line.png` (its grey shadow fills read as extra objects).

## Prompt skeleton (the working example is `prompts/looktest/ad_out_v1.txt`; read it)

Sections, in this order, each starting with its label in capitals:

1. **Opening line**, verbatim: `A painting on cream xuan paper, wide 16:9, in one hand: fine-line baimiao ink outlines
   and transparent ink wash, the paper grain and a few long paper fibres showing through everywhere.`
2. **SUBJECT.** Place, year, time of day; who is there; what is in the room. Plain nouns. Name every object.
3. **COMPOSITION.** `Follow image 1 exactly: the same camera, the same perspective, the same positions and sizes of
   ...` then: `Image 1 is only a layout drawing from a 3D model: replace its mannequins with the real people and its
   boxes with the real things, and do not keep its mechanical even line.` The sets are blockouts: every box, slab and
   cylinder in the line render has to be named as the thing it stands for (a cube left unnamed comes back as a cube).
   Mannequin hands are mitts: describe each hand's action in words.
4. **WHAT SHE IS DOING.** One playable action, then the face as a consequence of it (see "Directing her face").
5. **LIGHT, the most important thing in the picture.** Where the light falls per image 2, then, verbatim in spirit:
   the lit parts `are NOT PAINTED: bare cream paper left blank, with only thin ink outlines. No yellow, no white
   paint, no glow, no rays, no haze, no bloom: light is simply where the brush did not go.` Everything else is under
   `one even transparent <scene tint> ink wash`, lines showing through, no black. Faces in shade: `the wash is a thin
   glaze laid OVER a normally painted face: her warm rosy flesh colour and the pink blush on her cheeks still show
   clearly through it, never grey, never ashen`, and `in each eye one small crisp catch-light of bare paper`, shaped
   like that scene's light source. The shade/light boundary is `a clean, slightly soft wet edge`.
6. **THE ONE THING SHE IS ATTENDING TO** (inside shots, and any shot where it is in frame): the only object painted
   in full local colour, with the finest, most loving line in the picture, every part of its structure drawn
   correctly (count the spirals; draw the fibres), and a thin margin of clean bare paper round it so it seems lit
   from within. Everything else in the frame stays line under wash with no local colour of its own.
7. **PEOPLE.** Paste the character block (below or from the sheet's sidecar), say what each reference image is for,
   end with `Use the images for likeness only; repaint in this painting.`
8. **Closing guard**, verbatim: `Not anime, not cel shading, not a photograph, not a 3D or digital render, no dramatic
   chiaroscuro, no black shadows, no rim light. No text, no letters, no numbers, no signature, no seal, no border,
   no frame.` Add `Do not draw any dust in the air.` where there is a beam.

## Directing her face

- Banned words, for everyone, always: deadpan, unsmiling, neutral, flat, expressionless, unimpressed, blank (of a
  face). They make the models draw a dead face. Give the action instead.
- Her resting face, the wording that works: `Her head is perfectly still. Her lips are together and level, her jaw
  loose, her brows resting. She is not smiling and not frowning and not posing for anyone: all the life in the face
  is in the eyes, which are fixed and bright on <the exact thing>, the way a child looks when she is counting.`
- The models add a small smile by default. If the take smiles and the shot is a resting-face shot, it fails.
- Her eyes are the performance: they count, track and jump. Say exactly where both irises point.
- She grins, widely and for real, when an idea delights her; and she taps. Use both where the plan asks.
- When she performs an expression for others it is a little off in amplitude (too much or too little), never mocking.
- From the poems, the thinking posture she shares with the people she loves: eyes down and off to one side, held for
  two or three breaths, one hand raised and paused like a conductor before the first beat.
- Voice lock: mouth a little open, a breath held, blinking, and a hand that stays in contact with someone.

## Who has a face

- Drawn in full, always: her (every age), Mama, Dad.
- First love: never face-on. Back of head, over the shoulder, hands, forearm, jaw and chin stubble at most.
- Everyone else (uncle, laughing adults, social worker, grandmother, guests): "unreached". Hair, jaw and ears in
  light line, clothes and shoes and hands drawn with care, and where the features would be the model simply did not
  get to them: the same wash as the rest of the head, no eyes, nose or mouth, no mask edge, no white oval. Keep them
  turned, cropped or out of the light wherever the layout allows. Wording that works: `His face is not drawn: the
  head is a simple shape under the same wash as the wall behind it, with the hairline, ear and jaw in thin line and
  no features, like a figure the painter has not reached yet. Not a mask, not a white oval, not a blur.`
- Family in the 2023 coda: grandfather and grandson are seen against the light as plain dark-wash figures in
  profile. Only her own reflection is drawn.

## Housewarming costume (Jade, 27) (Jade 2026-11-25)
- mv10, every PARTY shot (bridge, the room crossing, the "nailed it" whisper, the nod / push-in, the greeting, the hug,
  the yard, silence, chorus 2b): a THIN black zip-front jacket, worn unzipped but hanging nearly closed, long sleeves;
  the NASA "meatball" on its LEFT chest (her left: frame right when she faces us; blue circle, white stars, white
  orbit ring, red vector chevron, NASA in white). Under it a fitted black t-shirt with an SR-71 Blackbird print seen
  from ABOVE (planform, nose angled down-left, reads as a triangle), dark grey on black, subtle; the jacket is ON in
  every shot, so the print is at most a sliver between the fronts: never paint the whole plane. Boot-cut black yoga
  pants (snug to the knee, flaring to a hem that covers the heel). Socks, no shoes (sock colour plain mid-grey:
  ASSUMED). This REPLACES the navy dress, orange belt, pendant, tights and flats of the jade27 A/B/C/H/X sheets for
  mv10: pass those for her face and body only and say "ignore the navy dress".
- Sheet: `cast/jade_27/j27_costume_housewarming_v1.jpg` (front, 3/4, back, jacket on; insets: meatball, tee print,
  hem and sock). Layout: `spec.costume` JADE_HOUSEWARMING in `layout/sets/mv10/shots.js` (black jacket and pants, grey
  socks, a tee sliver strip and a blue meatball disc marker; flare from the knee).
- Before the party (V3a, V3b lemon picking, V3b_prep; 10:30): the SAME outfit, socks outdoors (ASSUMED; Jade has not
  answered: same outfit? shoes outside?).

## Scene table

| Set (dir under `media/layout/`) | Place, year | Light source | Shade wash to name | Her sheets (dir under `cast/`) | Attention object |
|---|---|---|---|---|---|
| `attic88_day` | Attic above a restaurant, Netherlands, winter 1988 | Low sun through one four-pane window | cool blue-grey | canon age 5: `inputs/refs_chaosmonkey/little_jade/` + `cast/little_jade_05/` | frost fern; paper piano keys; (the mote is comp) |
| `wall88` | Inside a wall, same day | One crack | near-black indigo ink, soft, never flat black | same | (the mote is comp); her eye |
| `shanghai86` | A flat in Shanghai, 1986 | Window light in humid air | warm grey-green | `little_jade_03` | the drift of torn toilet tissue |
| `office91` | Elementary school office, about 1991, December | Fluorescent tube | flat greenish grey | `little_jade_07` | the light-yellow handout (blank grid in the still; faces and labels are comp) |
| `market93` | Marketplace on Oakton, Skokie, 1993 | Rows of bare tubes | pale flat grey | `little_jade_10` | one artichoke; one romanesco |
| `basement90` | Basement, Decatur, 1990 | The monitor | deep indigo | `little_jade_07` | the screen (plain blue, no text; the word is comp) |
| `kitchen90` | Kitchen, Decatur, 1990 | Pendant lamp; a sun shaft in the outro | warm umber | `little_jade_07` | none (it is about her listening) |
| `closet02` | A closet, about 2002 | The door he opened | warm brown-black | `jade_19` | four hands |
| `mv10` | Housewarming, Mountain View, 2010 | Dusk, lamps, then fire | dusk violet | `jade_27` | her, at 115 % (see plan); lemons; fire |
| `playground23` | Indoor space-themed playground, Austin, 2023 | Low sun through glass | warm grey-gold | canon adult: `inputs/refs_chaosmonkey/jade/` | (the mote is comp) |

Other sheets: Mama `inputs/refs_chaosmonkey/mama/` (canon, 1988) and `cast/mama/` (resting face, hands); Dad
`cast/dad/`; first love `cast/first_love/`; strangers `cast/strangers/<who>/`. Each sheet's `.txt` sidecar holds the
character description that made it: paste from there so the wording stays identical. Per shot, pass the 3 guides plus at
most 4 sheets: for a close-up the H heads sheet and the hand sheet (children: always both `lj_H_heads_v3`-type and
the fine-line sheet, see `inputs/refs_chaosmonkey/CANON.md` "Which refs to pass"); for a full figure the H heads and
the A turnaround; add a pose or hands sheet only if the shot is that pose.

## What the poems fix (do not contradict these)

- Attic: dusty; hardwood floor; folding mats on the floor; chipped, cracked paint on the wooden window frame; the
  frost is growing while she watches; she hums while she plays the paper keys; Dad is not there in 1988.
- The raid: Mama grabbed her arm at the window. In the wall Mama is with her (she "shimmied in after"), and others;
  they stay out of frame.
- Shanghai: she is still ripping when found; adults (plural) laugh; both her lines are in Chinese.
- School office: four people (social worker, her, Dad, Mom); the Christmas sweatshirt's print is cracked from
  washing; a stack of identical handouts; she leans in to look closer at the face under her finger.
- Cheek-pushing: asked for an expression she offers one: "I narrow one eye, furrow my brow, and sigh." Then the
  hands push her cheeks up; "I furrow my brow even more and try to escape." She drops it the moment Mama turns.
- Supermarket: she is transfixed, standing still; Mama pulls her arm; the grandmother scoots past after that.
- Basement: she balances on the spokes of Dad's rolling chair holding his shoulders, then HOPS OFF to point; she
  had been pretending to be a cat before and goes back to it.
- Closet: she sits cross-legged on a folded duvet cover, head in her hands; he opens the door and sits cross-legged
  on the carpet in front of her; she looks up; he takes both her hands; he rubs the back of her hand on his chin
  stubble without noticing he is doing it.
- Housewarming: she is the host; she taps her whole hand fast on first love's arm; she grins widely; two friends
  understand, most of the room stares; then she is blinking something back and her voice does not work.
- Playground: indoor, space-themed; she looks at her father and her son directly and catches her own face in a
  reflection; a toddler daughter is running about.

## Checklist for every take

1. Composition matches the contour guide (camera, sizes, positions); every object is the thing the form guide shows. No unnamed cubes.
2. Light is bare paper: no yellow, no glow, no painted rays. Shade is one quiet wash in the scene's tint, not black.
3. Her face is on model for her age (large eyes, strong straight brows, the right hair), with the expression the
   shot calls for and no added smile. Catch-lights present in shade.
4. Hands: five fingers, doing the named action.
5. Strangers' faces unreached, not masks. First love not face-on.
6. One attention object, and it is the richest thing in the frame.
7. Period: nothing later than the year (no flat screens, no LED tubes, no barcodes, no modern logos). No lettering.
8. It looks painted by the same hand as `media/keyframes/_looktest/ad_wide_v1_codex.jpg` and `ad_out_v1_codex.jpg`.

## What to hand back

- `media/keyframes/<set>/` with takes, sidecars, `picks.json`, and `comp.json`: for each picked shot the overlays
  the plan calls for, in 1920x1080 pixel coordinates read off your pick (not off the layout, the model drifts a
  little): `{"<SHOT>": {"src": "...", "beam_mask": "media/layout/<set>/beam_<SHOT>_flat.png" or null, "hero_mote":
  [x,y] or null, "gold": [{"type": "ring"|"dots"|"text"|"underline"|"ticks", ...}], "toner": [{"text": "...", "at":
  [x,y]}], "header": "..." or null}}`. Leave out what the shot does not have. Do not run the compositor.
- `media/keyframes/<set>/NOTES.md`: per shot one line (what the pick shows, what is still wrong), then anything in
  the set or the plan that fought you, and anything you invented because the sources were silent.
- A contact sheet of your picks: `montage <picks> -tile 3x -geometry 960x540+6+6 media/keyframes/<set>/_picks.jpg`.
