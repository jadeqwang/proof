#!/bin/sh
# v10 retakes G_t2 and D_t2 (lead's notes after checking the t1 takes). Run from the repo root. Default route: free
# Codex; FL_ROUTE=gpt2 uses the PAID gpt-image-2 route (logged to docs/spend_ledger.jsonl). Generated images only.
set -e
G=cast/first_love/_prompts/v10
python3 $G/flgen.py $G/takes/G_t2.png $G/G2.txt "$G/takes/G_t1.png:the current version of this sheet (keep everything; fix only the jaw shadow at 24, study 2's forearm hair and study 3's feet)" "$G/refs/stubble_style_from_B_v9.png:the STUBBLE REFERENCE (a style sample of fine dark flecks, for the forearm hair technique only)" &
python3 $G/flgen.py $G/takes/D_t2.jpg $G/D2.txt "$G/takes/D_t1.jpg:the current version of this hands sheet (keep everything; her arms hairless; study 4 from image 2)" "cast/first_love/fl_D_hands_forearms_v4.jpg:the earlier version of this sheet (copy ONLY its study 4)" &
wait
