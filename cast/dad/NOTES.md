# Dad sheets: v5 likeness rebuild (2026-11-25)

Rebuilding every Dad sheet (A, B, C, D, H, R) and the family line-up from the likeness Jade approved:
`inputs/family_photos/dad_age37/dad37_v5_t1.jpg` (a generated image derived from a real family photo of her father,
aged back to ~37; gold wire double-bridge aviators). The old sheets' face ("long oval face, softly pointed chin") was
invented before the likeness existed and is wrong.

- Route: Codex image_gen, headless, tmux session `proof-dad-sheets` (via `_prompts/v5/dadgen.py`, which reuses
  `tools/kf/kf.py`'s `run_codex`). Budget ~20 images.
- Only photo-derived ref ever sent: `dad37_v5_t1.jpg`. Never `Pasted image.png`.
- Prompt blocks: `_prompts/v5/face.txt` (face from the likeness), `outfit.txt` (unchanged 1990 clothes),
  `style.txt` (painting hand), one prompt file per sheet.
- Push: Jade OK'd it 2026-11-25 (source is his public Twitter profile photo).

## Progress log
- H: take 1 face right, lenses too small/rectangular, hair cropped, hatched skin. Take 2 fixed all three:
  ACCEPTED as `dad_H_heads_v5_likeness.jpg` (identity anchor). Takes kept in `_prompts/v5/takes/`. Images used: 2.
- A, B, C, D, R, family line-up take 1 generated in parallel (images used: 8). Reviewing.
- A, B, D, R accepted on take 1. Family line-up accepted on take 1 (others redrawn near-identically, PSNR 32-34 dB vs v1). C take 1: likeness fine but hair curlier and bushier than H/likeness; retaking (images used: 8 so far).
- C take 2 (hair only, smoother): ACCEPTED. Total images generated: 9 (H x2, A, B, C x2, D, R, line-up). No plan limit hit.

## Result
| Sheet | File | Takes | Likeness |
|---|---|---|---|
| H heads (anchor) | `dad_H_heads_v5_likeness.jpg` | 2 | strong; hair a touch curlier than the likeness |
| A turnaround + seated | `dad_A_turnaround_v5_likeness.jpg` | 1 | holds at small head size |
| B poses | `dad_B_poses_v5_likeness.jpg` | 1 | holds; pose 3 double take reads as a laugh |
| C expressions + mouths | `dad_C_expressions_mouths_v5_likeness.jpg` | 2 | strong; mouth crops taper slightly |
| D hands | `dad_D_hands_v5_likeness.jpg` | 1 | n/a (hands); study 7 has the gold aviators |
| R rest heads | `dad_R_rest_heads_v5_likeness.jpg` | 1 | strong |
| Family line-up | `../_family/family_rest_lineup_v5_dadlikeness.jpg` | 1 | new Dad in; others unchanged |

Superseded (moved, not deleted): `_superseded/` holds A v1, B v1, C v1, D v2, H v1, H2 age37 v1, R age37 v1 and the old
R prompt; `cast/_family/_superseded/` holds line-up v1 and its prompt. `tools/kf/gallery.py` SHEETS now points at
the v5 R sheet and the v5 line-up (gallery not regenerated). Old keyframes in `media/keyframes/` still cite the
superseded sheets in their sidecars; they were painted from the old face and need redoing for Dad anyway.
Draft takes: `_prompts/v5/takes/`. Prompts: `_prompts/v5/*.txt`; generator `_prompts/v5/dadgen.py`.
Not reviewed by Jade yet. Jade OK'd pushing these (2026-11-25).
