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
