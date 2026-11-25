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
