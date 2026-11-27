#!/bin/sh
# v10 (5 o'clock shadow + forearm hair as dark flecks) and D v5 (forearm hair). Run from the repo root after the Codex
# plan limit resets (2026-11-27 03:41). Default route: free Codex. FL_ROUTE=gpt2 ./run.sh uses the PAID gpt-image-2
# route (only with Jade's direct approval; every call is logged to docs/spend_ledger.jsonl). Image 2 for A/G/D = a crop of B v9's jaw stubble (generated).
set -e
G=cast/first_love/_prompts/v10
S="$G/refs/stubble_style_from_B_v9.png:the STUBBLE REFERENCE (a style sample of fine dark flecks, for the forearm hair technique only)"
python3 $G/flgen.py $G/takes/B_t1.png $G/B.txt "cast/first_love/fl_B_backhead_neck_v9.png:the approved current version of this sheet (keep everything incl. hair colour; change ONLY the stubble to a faint 5 o'clock shadow)" &
python3 $G/flgen.py $G/takes/G_t1.png $G/G.txt "cast/first_love/fl_G_ots_hair_v9.png:the approved current version of this sheet (keep everything incl. hair colour; change ONLY the stubble, the forearm hair, and the feet and hands in study 3)" "$S" &
python3 $G/flgen.py $G/takes/A_t1.jpg $G/A.txt "cast/first_love/fl_A_turnaround_back_v9.jpg:the approved current version of this turnaround (keep everything incl. hair colour; change ONLY the stubble and the forearm hair)" "$S" &
python3 $G/flgen.py $G/takes/D_t1.jpg $G/D.txt "cast/first_love/fl_D_hands_forearms_v4.jpg:the approved current version of this hands sheet (keep everything; change ONLY his forearm hair)" "$S" &
wait
