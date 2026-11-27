#!/bin/sh
# v10 A_t3 and D_t4 (D: his two hands palm-up as a cradle, her one hand palm-down on top; Jade 2026-11-26), guided by the 3D rigs (layout/sets/fl_turnaround, layout/sets/fl_hands; renders in ./guide/).
# Run from the repo root. Default route: free Codex (max 5 refs: D_t4 uses exactly 5); FL_ROUTE=gpt2 uses the PAID
# gpt-image-2 route (logged to docs/spend_ledger.jsonl).
set -e
WHICH=${1:-AD}   # ./run5.sh A | D | AD (default both)
G=cast/first_love/_prompts/v10
case $WHICH in *A*) python3 $G/flgen.py $G/takes/A_t3.jpg $G/A3.txt \
  "$G/takes/A_t2.jpg:the current painted version of this turnaround (identity, hair, style, framing, forearm hair)" \
  "$G/guide/A_guide_form.png:3D layout guide, shaded form (poses, proportions, black slacks)" \
  "$G/guide/A_guide_contour.png:3D layout guide, contour lines (same five figures)" \
  "$G/guide/A_guide_toes_front_form.png:3D close-up of his feet in the sandals from the front (copy the toes)" & ;; esac
case $WHICH in *D*) python3 $G/flgen.py $G/takes/D_t4.jpg $G/D4.txt \
  "$G/takes/D_t3.jpg:the current painted version of this hands sheet (style, layout, studies 1/4/5/6, his forearm hair, her hairless arms)" \
  "$G/guide/D2_guide_form.png:3D layout guide for study 2 (from above), shaded form" \
  "$G/guide/D2_guide_contour.png:3D layout guide for study 2, contour lines" \
  "$G/guide/D3_guide_form.png:3D layout guide for study 3 (side view), shaded form" \
  "$G/guide/D3_guide_contour.png:3D layout guide for study 3, contour lines" & ;; esac
wait
