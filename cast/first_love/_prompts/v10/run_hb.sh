#!/bin/sh
# H3b -> H2b clip test (2026-11-27): 2 takes each, PAID gpt2 (Jade approved tonight). Run from the repo root.
G=cast/first_love/_prompts/v10
for f in H3b H2b; do for t in 1 2; do
  FL_ROUTE=gpt2 python3 $G/flgen.py $G/takes/${f}_t$t.png $G/$f.txt "$G/guide_hb/${f}_guide_form.png:3D layout guide, shaded form (him LEFT in green, her RIGHT in cream)" "$G/guide_hb/${f}_guide_contour.png:the same guide's contour lines" "$G/takes/D_t4.jpg:the approved hands sheet, for painting style only" &
done; done
wait
