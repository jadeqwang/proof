# First love sheets: v2 hair correction (2026-11-25)

Jade, the director: the v1 sheets read too much like the childhood friend. His real hair is dark brown and relatively
straight, a curtain-bang cut like present-day male K-pop idols' (centre or slightly off-centre part, fringe falling to
either side of the forehead, medium straight layers on top, neat tapered sides and nape, often a short two-block
underneath, the ears covered at the tops at most). The same style at every age: 19 (2002), about 24 (grad school,
~2007), 27 (2010). v1 had loose shaggy waves curling at the nape: wrong.

He is a real person. No name is written anywhere in this folder; he is "first love" only. He is only ever seen from
behind or over the shoulder, so the back of the head, crown, nape, taper and the fringe tips seen from three-quarter
back are his identity. No likeness is attempted.

**Later facts from Jade (same day, folded into every v2 prompt via `d27/d19/d24.txt`):** about 1.78 m (5'10"),
lean but NOT tall ("tall" and "long forearms" dropped); hands and feet much smaller than typical for his height, the
SAME size as Jade's (her hands are large for a 1.65 m woman), so in four-hands studies the two pairs are about equal,
and they wear the same shoe size; clearly visible dark forearm hair, more than most white American men; he IS a white
American man (confirmed); in most scenes he wears plain brown/dark leather two-strap cork-footbed sandals of the
Birkenstock type (made by Naot; the brand is not named in prompts), replacing v1's desert boots and socks.

**Still unconfirmed agent assumptions (not from Jade):** skin tone (warm rosy), the long neck, ears that stand out
slightly, stubble, his clothes at 19 and 27, the cord bracelet, and the grad-school sweater on sheet G (a placeholder:
his clothes at ~24 were never designed). Note `layout/sets/_cast.js` / `layout/CAST.md` give him 1.80 m; Jade says
~1.78 m (not changed here; outside this folder).

- Route: Codex image_gen, headless, tmux session `proof-fl-hair`, via `_prompts/v2/flgen.py` (reuses
  `tools/kf/kf.py`'s `run_codex`). Budget ~12 images.
- Prompt blocks in `_prompts/v2/`: `hair.txt` (the cut), `d27.txt` / `d19.txt` / `d24.txt` (v1 design with the hair
  removed, plus Jade's later facts below), `never.txt` (never face-on, no likeness), `style.txt` (painting hand; hair wash changed from black to
  dark brown). One prompt file per sheet.
- References: generated sheets only. Old A and E are sent with their heads painted out
  (`_prompts/v2/refs/fl_*_v1_headless.jpg`) so the old wavy hair cannot leak; they carry build and clothes.

## Progress log
- B take 1 (images used: 1): straight and brown, but a hard bowl/mushroom cut with a blunt ledge over a buzzed
  under-section; mid-brown; study 3 not bowed. Rejected (kept in `_prompts/v2/takes/`). `hair.txt` revised: darker
  espresso brown, feathered point-cut ends, graduated layers blending into the taper, "not a bowl cut".
  First wording kept as `hair_t1.txt`.
- Jade's new facts arrived mid-run (height ~1.78 m not tall, small hands/feet = Jade's size, dark forearm hair,
  two-strap cork sandals). Folded into `d27/d19/d24.txt` from B take 2 on. D must be redone anyway (hand size, arm
  hair, and the wavy hair in study 4).
- B take 2 (images used: 2): ACCEPTED as `fl_B_backhead_neck_v2.jpg` (identity anchor). Dark espresso brown,
  straight, smooth layered top falling from the crown whorl, curtain-fringe tips past the temple in the three-quarter
  views, short two-block under the sides, the top layer just touching the ear tops, clean tapered nape well above the
  collar. Still a rounded silhouette from straight behind; reads as a modern two-block cut, not a bowl. (Its prompt
  carries the updated build text; only head and shoulders are drawn.)
- A, E, G, D take 1 launched in parallel, all with B v2 as image 1.
- A, E, G take 1 (images used: 6 incl. D t1): all ACCEPTED on take 1 as `fl_A_turnaround_back_v2.jpg`,
  `fl_E_costume_19_27_v2.jpg`, `fl_G_ots_hair_v1.jpg`. Same straight dark-brown cut in every figure at 19 and 27,
  fringe tips past the temple in three-quarter and profile views, two-strap cork sandals on bare feet (E: kicked off
  beside him when seated cross-legged at 19), dark forearm hair. At small figure scale the cut reads slightly
  rounder / more bowl-like than on B. A fig 4 and E fig 6 are pure profiles as in v1 (one eye, generic features).
  G: top row the three film framings (grad-school sweatshirt over his right shoulder, floral couch and window, no
  person drawn; bookshelf, head bowed to the raised left forearm with bracelet; closet from high behind, crown whorl,
  door-gap light), bottom row the same three angles tight on the head. The seal on the sweatshirt is a generic
  laurel-and-building emblem, not the real seal: a placeholder.
- D take 1: hair in study 4 now right, bracelet right in study 1 (no mirroring needed), but his hands still much
  bigger and thicker than hers in the four-hands studies, and the arm hair reads as a pelt. Retaking (D_t2.txt,
  draft passed as layout ref).
- Moved to `_superseded/` (with README.txt): A v1, B v1, E v1, F face v1. Moves are on disk only, not staged.
- D take 2 (images used: 7, the total for this pass): ACCEPTED as `fl_D_hands_forearms_v3.jpg`. His hands slimmer;
  in the four-hands studies his and hers are close to equal size; forearm hair dark and fine; study 4 shows the new
  hair (straight, dark brown, fringe falling past the temple, short taper). D v2 moved to `_superseded/`.
  Note study 2 still shows him in the slate-blue henley although the four-hands closet scene is at 19 (as in v1).
- tmux session `proof-fl-hair` closed. No plan limit hit.

## Result
| Sheet | File | Takes |
|---|---|---|
| B back of head and neck, 27 and 19 (anchor) | `fl_B_backhead_neck_v2.jpg` | 2 |
| A turnaround from behind, 27 | `fl_A_turnaround_back_v2.jpg` | 1 |
| E costume 19 and 27 | `fl_E_costume_19_27_v2.jpg` | 1 |
| D hands and forearms | `fl_D_hands_forearms_v3.jpg` | 2 |
| G over-the-shoulder hair studies (new) | `fl_G_ots_hair_v1.jpg` | 1 |

**How he now differs from the childhood friend (`cast/childhood_friend/cf_A_back_v1.jpg`):** the friend's hair is
jet black, short and choppy all over with tousled piecey tips, no fringe visible from behind, ears fully exposed. First
love's is dark brown (clearly brown in the wash), longer and smooth on top in straight layers falling from a visible
crown whorl, curtain-fringe tips showing past the temple in every three-quarter-back view, the top layer brushing
the ear tops over a short two-block under-section, and a clean tapered nape. Clothes and shoes differ too (henley or
green hoodie with cork sandals vs. charcoal hoodie, olive chinos, canvas sneakers).

**Knock-ons, not done here:** keyframes in `media/keyframes/` (closet02, mv10) were painted with the old wavy hair
and need redoing; `media/keyframes/index.html` and `media/keyframes/closet02/NOTES.md` cite
`fl_D_hands_forearms_v2.jpg`, now in `_superseded/` (gallery not regenerated). `layout/CAST.md` / `_cast.js` give him
1.80 m; Jade says ~1.78 m. Not reviewed by Jade yet. Nothing committed.

# v3: Jade's corrections from the decision page (2026-11-25, late)

Jade: hair close but adjust: LESS ROUND from behind; a CENTRE PART; a clean, crisp line running back from the curtain
bangs (the v2 taper into sides/nape was too gradual); the centre part leads to the crown whorl, which is NOT obvious
and sits at the TOP of the head, not far down the back. No bracelet anywhere. One slate-blue profile image had a
wrong-facing hand. The slate-blue shirt at 27 is a plain long-sleeve shirt, not a henley. Older unconfirmed details
stay as guessed.

- Prompt blocks in `_prompts/v3/` (`hair.txt` rewritten; `d27/d19/d24.txt` without henley/bracelet; `never.txt`
  tightened to LOST profiles only, no eye/nose/mouth; new `hands.txt` anatomy block). Generator `_prompts/v3/flgen.py`,
  tmux session `proof-fl3`. Layout refs with heads, bracelets and the henley placket painted out:
  `_prompts/v3/refs/fl_{A,E}_v2_headless.jpg`.
- Wrong hand (my read): A v2 fig 5 has a raised forearm with no upper arm (a third arm: one arm hangs at image left,
  one goes into the pocket, plus the raised one), and E v2 fig 6 the raised fist with the bracelet reads as the wrong
  hand for the facing. Both poses existed only to show the bracelet; replaced (A5: leaning in to whisper at the shelf,
  as in mv10; E6: lost profile, near LEFT hand in the LEFT front pocket).
- Also fixed: v2 A fig 4 / E fig 6 / B 2,5 / G showed nose, lips or an eye; v3 asks for lost profiles only.
- D: studies 2-3 (closet, aged 19) now in green hoodie sleeves instead of the slate-blue shirt.

## v3 progress log
- B take 1 (with B v2 as a "wrong shape" ref) and take 2 (no hair ref) launched in parallel.
- B t1/t2 (images 2): both still too round/bowl from behind; t1 has a good crisp side line and a correct centre part in study 3; t2 study 3 runs the part down the back of the head (wrong). New block `round.txt`; B t3 (t1 as draft ref) and t4 (no hair ref) launched.
- B t3 ACCEPTED as `fl_B_backhead_neck_v3.jpg` (images used: 4): taller-than-wide outline from behind, centre part from the front to a quiet crown point at the top (study 3), crisp side line running back from the fringe tip above the ear (2, 5), lost profiles only (cheek and jaw, no eye/nose/mouth). t4 rejected (part runs down the back of the head in study 3). Still a slight overhang bulge over the two-block in the 3/4 views. A, E, G, D take 1 launched with B v3 as image 1.
- A t1, E t1, D t1 (images used: 8): ACCEPTED. A: plain crew-neck slate-blue tee, no bracelet, lost profiles (cheek
  and jaw only), fig 5 bowed toward someone at his right (face hidden), hands in pockets on the correct sides. E: same;
  fig 6 near LEFT hand in LEFT front pocket, far arm hidden. D: bracelet gone, green hoodie sleeves in 2-3, palms-up
  study 1 has thumbs outward (correct), study 4 lost profile.
- G t1: settings, faces and hands fine, but in study 6 (and slightly 3) the centre part runs down the BACK of the head
  (a back parting); G t2 launched with t1 as draft.
- G t2 (images 9): part shorter in study 6 but study 6 still reads as a straight-behind view with a part partway down. G t3 launched (no draft ref; study 6 as a bird's-eye view).
- G t3 (images used: 10, the total for this pass; no plan limit hit): ACCEPTED as `fl_G_ots_hair_v2.jpg`. Study 6
  now a high view onto the bowed head, the part ending at the crown point near the top; study 2 bowed toward
  someone at his right (face hidden), arms hanging; study 1 hands hold the sweatshirt from below. t2 kept in takes.
- Moved to `_superseded/`: A v2, B v2, E v2, D v3, G v1 (README.txt updated). tmux session `proof-fl3` closed.

## v3 result
| Sheet | File | Takes |
|---|---|---|
| B back of head and neck, 27 and 19 (anchor) | `fl_B_backhead_neck_v3.jpg` | 4 (t3) |
| A turnaround from behind, 27 | `fl_A_turnaround_back_v3.jpg` | 1 |
| E costume 19 and 27 | `fl_E_costume_19_27_v3.jpg` | 1 |
| D hands and forearms | `fl_D_hands_forearms_v4.jpg` | 1 |
| G over-the-shoulder hair studies | `fl_G_ots_hair_v2.jpg` | 3 (t3) |

Weak spots: in three-quarter views the top layer still overhangs the two-block with a slight mushroom bulge (the crisp
line Jade asked for makes the overhang read harder); the crown point is placed at the top but in the bowed views the
part still reaches roughly halfway down the visible head; D study 4's hand at his chin reads as a curled fist, not
clearly the back of HER hand (unchanged from D v3); the seal on G is still a generic emblem, not the IAS seal.
Not done here: `media/decisions.html` fl_ cards still link the old file names (now in `_superseded/`).

## 2026-11-25 round 2 (v4: stepped hair, big IAS seal)
Jade on v3: hair reads as him, the part is good, but the change from top to bottom is too gradual: it is a top half
over a lower part buzzed to stubble and grown out ~6 months. And the IAS seal must be WAY larger, almost the whole
front, so the sweatshirt has to be unfolded to see all of it.
- Prompts and generator in `_prompts/v4/` (`flgen.py`, tmux session `proof-fl4`; `inputs/` now refused as a ref
  path, so no layout refs from inputs/ this round: the previous version of each sheet is the layout ref instead).
  New blocks: `hair.txt` (top layer + even 1.5-3 cm grown-out buzz + step), `step.txt` (the correction), `seal.txt`.
- IAS seal described from the seal itself (viewed, NOT passed to any model; it is a non-free logo): thin circle;
  two classical women holding hands on a ground line before a leafy fruit tree; TRUTH on the LEFT, unclothed, raising
  a hand mirror; BEAUTY on the RIGHT in a pleated chiton, arm curved over her head; TRUTH up the left rim, BEAUTY down
  the right rim; "INSTITUTE FOR ADVANCED STUDY" in thin spaced sans caps below. All one navy ink.

### progress log
- B t1/t2 (v3 as ref): the step and even lower buzz are right, but the top layer turned into a bowl/mushroom with a
  thick ruler-straight rim. B t3 launched with t1 (step) + v3 (slim top) as refs.
- H t1 BLOCKED by output moderation ("sexual"): the real seal's Truth is unclothed. seal.txt now gives Truth a light
  veil of drapery (a deliberate deviation from the real seal); H t2 launched.
- B t3: slimmer straight-behind, but 3/4 views still a mushroom with a thick level rim. B t4 (t3 as draft; top hangs
  straight, edge slopes down toward the back) ACCEPTED as `fl_B_backhead_neck_v4.jpg`: distinct glossy top layer over
  an even matte grown-out buzz, abrupt change in length along one line, no taper; lost profiles only.
- H t2 ACCEPTED as `fl_H_ias_sweatshirt_v1.jpg`: seal fills nearly the whole front (collar to near the waistband, near
  seam to seam), TRUTH/BEAUTY on the rim, INSTITUTE FOR ADVANCED STUDY below; folded studies show only Beauty and
  part of the tree. Truth drawn with a drape off one shoulder (one breast bare), not fully unclothed as on the real seal.
- A t1, G t1 (B v4 as hair ref): faces hidden, but both drift back to a bowl/mushroom cut with a thick level rim.
  New block `shape.txt` (not a bowl, top hangs straight, edge slopes down to the back); A t2, G t2 launched.
- A t2 ACCEPTED as `fl_A_turnaround_back_v4.jpg` (near-identical to t1; slimmer in fig 1); G t2 ACCEPTED as
  `fl_G_ots_hair_v3.jpg` (sweatshirt folded with a fragment of the big seal: Beauty, the tree, letters on the arc).
  G t3 (no layout ref) rejected: the closet study turned into a view from the FRONT and above (face hidden by the
  bowed head, but the wrong camera). Faces zoom-checked on every accepted sheet: cheek/jaw/ear only, no eye, nose or mouth.
- Moved to `_superseded/`: B v3, A v3, G v2 (README.txt updated). tmux session `proof-fl4` closed. Images used: 13
  Codex (1 moderation-blocked), $0; no plan limit hit, no gpt2 spend.

### round 2 result
| Sheet | File | Takes |
|---|---|---|
| B back of head and neck (hair anchor) | `fl_B_backhead_neck_v4.jpg` | 4 (t4) |
| A turnaround from behind, 27 | `fl_A_turnaround_back_v4.jpg` | 2 (t2) |
| G over-the-shoulder hair studies | `fl_G_ots_hair_v3.jpg` | 3 (t2) |
| H IAS sweatshirt prop | `fl_H_ias_sweatshirt_v1.jpg` | 2 (t2) |

Weak spots: the step is now right (glossy top layer abruptly over an even matte buzz), but the model pulls the top
layer toward a BOWL / MUSHROOM cut with a thick, level rim, most in A and G (B v4 is the slimmest); E and D still
show the v3 taper (not redone this round). Seal: Truth wears a drape off one shoulder (the real seal's unclothed
Truth was moderation-blocked); the tree is a slim central tree rather than the broad crown behind both figures.

## 2026-11-25 late (v5: the gift is a WHITE HOODIE with a BLUE chest-size seal)
Jade: the IAS gift is a WHITE pullover HOODIE (hood, drawstrings, kangaroo pocket) with the IAS seal printed in BLUE, in
the print style and SIZE of her reference (`inputs/refs_ias/Pasted image (2).png`, private): a SOLID filled disc, the
figures, tree and lettering in white reverse, INSTITUTE FOR ADVANCED STUDY round the rim, FOUNDED 1930 at the bottom,
TRUTH and BEAUTY inside, centred on the chest, about 40% of the front's width. Supersedes round 2's "almost the whole
front". Design = the official seal (`inputs/refs_ias/Pasted image.png`).
- **Jade approved (2026-11-25) sending exactly two refs to the image model:** the seal art (copied to
  `work/ias/ias_seal_ref.png`) and a garment-only crop of the hoodie photo (`work/ias/hoodie_crop_garment.png`: cut
  below the chin, the bare neck in the hood's V painted out white, the trousers and hands below the waistband cropped
  off; viewed and checked before sending). Both live in gitignored `work/`; nothing else from `inputs/` was sent.
- Generator `_prompts/v5/flgen.py` (tmux `proof-fl5`, now closed): blocks from v4 plus `hoodie.txt` (garment + print,
  referring to "the SEAL REFERENCE" / "the HOODIE REFERENCE"); sidecars state the approval.
- **H (prop sheet) BLOCKED twice by output moderation ("sexual")**, both with the real seal art as a ref (t1; t2 also
  asked for simple flat silhouettes at small print size). Truth is unclothed on the real seal. Per instructions no drapery
  was invented; **no H sheet exists now** (H v1 moved to `_superseded/`). Logs: `work/kf_logs/H_t1_*`, `H_t2_*`.
- **G t1 ACCEPTED as `fl_G_ots_hair_v4.jpg`** (refs: B v4, G v3 for layout and hair, seal art, hoodie crop): the
  folded white hoodie in his hands shows drawstrings, the hood edge and the blue filled-disc print with white figures
  (lettering garbled at that size, as expected). Hair and layout match G v3 (the same mild bowl tendency as v3, no
  worse). Faces zoom-checked: studies 1, 2, 4, 5 are lost profiles (ear, cheek, stubbled jaw; no eye, nose or mouth);
  3 and 6 from above/behind. G v3 moved to `_superseded/`.
- Spend: 3 Codex images (2 moderation-blocked), $0; no plan limit, no gpt2.

## 2026-11-26: round-3 decisions (part placement, B and G v5)
Jade on B v4: "the left 4 images of v4 are good. the right 2 of v4 do not match the left 4 (b/c that's not where the
part is)." Read as the right COLUMN (studies 3 and 6): in both, the part showed as a long line of scalp running down the
back of the head (6 also drifting off-centre), while 1 and 4 show only a short notch at the top. The image supports
this reading (the bottom row's 5 and 6 are not a pair: 5 is fine).
- Assumption (flag): "where the part is" = on top of the head only, forehead to crown, so from behind it is at most a
  short notch at the top; nothing on the back of the head. Bowed top-down views (B_part t1/t2, G_part t1/t2) still read
  as a part down the back, so 3 and 6 are now drawn from only slightly above. Cost: B study 3 is now close to study 1
  (a near-duplicate angle), and G's closet angle (3, 6) is lower than the film's "high behind" framing. If the closet
  shot keeps its high camera, the part question for that view needs Jade's eye.
- `fl_B_backhead_neck_v5.png`, `fl_G_ots_hair_v5.png`: left two columns pixel-identical to v4 (PNG, not re-encoded);
  right column from a Codex take, spliced over bare paper (`_prompts/v5/splice.py`). Prompts `_prompts/v5/B_part2.txt`,
  `G_part2.txt`; `flgen.py` now takes `FL_SESSION` (used `proof-flpart`). v4s moved to `_superseded/`.
- A v4 has the same fault mildly: figure 1 (straight behind) shows a part line about a third of the way down the back
  of the head; figures 2-5 are fine. Not fixed (not in brief).
- Faces zoom-checked on the new studies: ear, jaw line from behind only; no eye, nose or mouth.
- Spend: 8 Codex images, $0; plan limit not hit (CODEX_LIMIT_HIT flag removed).

## 2026-11-26: hair colour (Jade)
"make first love's hair color a little bit more like 60-70% dark chocolate." The 3D bodies use 0x352219 (was 0x2a2018,
near-black). Painter prompts: "60-70% dark chocolate brown: a warm, rich dark brown, clearly brown in light, never
black, not auburn or red". The v5 sheets are a touch lighter/glossier; prefer this wording over the sheet's tone.

## 2026-11-26: round-4 decisions (lived-in texture: B v6, G v6, A v5)
Jade on B/G v5 (fl_part5): "Yes, the part is correct. it feels freshly combed and a little too perfect. Give it a little
bit of lived-in feeling or intrinsic texture to the hair, like he doesn't brush it every day, just runs his hand through it
and gets going." On A v4 figure 1 (fl_A_fig1): redraw notch-only.
- `fl_B_backhead_neck_v6.png` (take B_t4 of 4): whole sheet redrawn from v5 (image 1); same cut, notch part, step,
  buzz and layout; the top layer now falls in loose finger-combed pieces with broken highlights and a few strays,
  warm dark-chocolate brown. B_t1/t2 (a softer prompt) changed almost nothing; `B2.txt` names the change concretely.
- `fl_G_ots_hair_v6.png` (G_t2 of 2): from G v5 + B v6; settings, hoodie print and framing kept.
- `fl_A_turnaround_back_v5.jpg` (A_t1 of 2): from B v6 + A v4; figure 1's part is now only the notch at the top.
- Prompts `_prompts/v6/` (hair.txt and style.txt replace the "smooth, glossy, NO shag" wording; flgen.py, session
  `proof-cast`). A v4 moved to `_superseded/`; B v5 and G v5 stay here until `tools/kf/r4lib.py` and the r4 painter
  brief point at v6 (they still name v5).
- Faces zoom-checked on every accepted take: backs and lost profiles only (ear, jaw line, stubble); no eye, nose or mouth.
- Still the mild bowl tendency of v4/v5 in G's bottom row (not asked about).
- 3D body (`layout/assets/bodies/make_bodies.py`, firstlove19/27): finger-combed pieces in the mesh, uneven ends, a
  squarer, less domed top; see the bodies README.
- Spend: 8 Codex images, $0; no plan limit.

## 2026-11-26 late: v7 (Jade's hair reference: tousled, rich warm dark brown)
Jade, verbatim: "instead of going back and forth, let me give you a reference. the actor who plays gaius baltar from
battlestar galactica -- it's that color hair, similar degree of messiness." (The actor is James Callis, as Gaius Baltar,
2004-09.) Used only as a hair reference: no photo of him was looked up or passed to any model, and neither name is in any
image prompt; the colour and the mess are described in words.
- Colour: a rich dark brown with warm undertones, not black, not medium brown, not auburn: **0x3d2819** (was 0x352219),
  set in `layout/sets/_cast.js` (`FL_HAIR`, both ages; the body GLBs carry no materials). Painter wording in
  `tools/kf/r4lib.py` FIRST_LOVE_HAIR and `media/keyframes/r4/_brief_r4.md`.
- Messiness: clearly tousled, never combed, only finger-raked: loose, slightly wavy, uneven pieces, a few lifting or
  crossing, wispy ends. Cut unchanged (notch part, step, the buzz grown out ~6 months).
- `fl_B_backhead_neck_v7.png` (B_t1 of 2; t2 was redder and wavier), `fl_G_ots_hair_v7.png` (G_t1 of 2),
  `fl_A_turnaround_back_v7.jpg` (A_t1 of 2; figure 1 notch only). Prompts `_prompts/v7/`. B/G v5, v6 and A v5 moved to
  `_superseded/`; the painter refs now name v7.
- Flag: the sheets' brown leans a little chestnut in highlights; if Jade finds it too red, darken in the next pass.
- Faces zoom-checked on every accepted take: backs and lost profiles only; no eye, nose or mouth.
- Mesh: more irregular piece widths and depths, a slight wave down each piece, a few pieces lifting toward their ends.
- Spend: 6 Codex images, $0.
