#!/bin/sh
# fl_E_costume_19_27 v4 take E_t1: v3 with ONLY the trousers changed to plain black slacks (Jade 2026-11-26: never jeans).
# Run from the repo root. Default route: free Codex; FL_ROUTE=gpt2 uses the PAID gpt-image-2 route (logged to docs/spend_ledger.jsonl).
set -e
G=cast/first_love/_prompts/v10
python3 $G/flgen.py $G/takes/E_t1.jpg $G/E4.txt "cast/first_love/fl_E_costume_19_27_v3.jpg:the approved current version of this costume sheet (keep everything; change ONLY the trousers to plain black slacks)"
