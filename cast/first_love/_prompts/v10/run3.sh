#!/bin/sh
# v10 refinements after Jade's review: D_t3 (articulated hands in studies 2-3, softer longer forearm hair), A_t2 (softer
# forearm hair, correct toes), G_t3 (soft jaw tint at 24, softer straight forearm hair). Run from the repo root.
# Default route: free Codex; FL_ROUTE=gpt2 uses the PAID gpt-image-2 route (logged to docs/spend_ledger.jsonl).
set -e
G=cast/first_love/_prompts/v10
python3 $G/flgen.py $G/takes/D_t3.jpg $G/D3.txt "$G/takes/D_t2.jpg:the current version of this hands sheet (keep everything; fix only the hands in studies 2-3 and his forearm hair)" &
python3 $G/flgen.py $G/takes/A_t2.jpg $G/A2.txt "$G/takes/A_t1.jpg:the current version of this turnaround (keep everything; fix only his forearm hair and toes)" &
python3 $G/flgen.py $G/takes/G_t3.png $G/G3.txt "$G/takes/G_t2.png:the current version of this sheet (keep everything; fix only the jaw tint at 24 and his forearm hair)" &
wait
