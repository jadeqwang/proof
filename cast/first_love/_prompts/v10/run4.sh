#!/bin/sh
# v10 G_t4 (Jade: hair tousled only as much as A_t2; black slacks, never jeans). Run from the repo root.
# Default route: free Codex; FL_ROUTE=gpt2 uses the PAID gpt-image-2 route (logged to docs/spend_ledger.jsonl).
set -e
G=cast/first_love/_prompts/v10
python3 $G/flgen.py $G/takes/G_t4.png $G/G4.txt "$G/takes/G_t3.png:the current version of this sheet (keep everything; tone the hair down to image 2's messiness; black slacks instead of jeans)" "$G/refs/hair_texture_from_A_t2.png:the HAIR-TEXTURE REFERENCE (his heads from the turnaround: the approved level of tousle)"
