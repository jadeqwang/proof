#!/bin/bash
# usage: run.sh <prompt-name> <out-relative-path.png>
# Route: Codex built-in image generation (codex exec), run inside tmux session proof-sheets-strangers.
# Style refs: generated v3 sheets only (no real photos).
ROOT=/home/jade/Documents/proof/cast/strangers
REF=/home/jade/Documents/proof/inputs/refs_chaosmonkey
name=$1; out=$ROOT/$2
body=$(cat $ROOT/_prompts/_style.txt; echo; cat $ROOT/_prompts/$name.txt; echo; cat $ROOT/_prompts/_face_${3:-A}.txt; echo; cat $ROOT/_prompts/_tail.txt)
task="Use your built-in image generation tool (image_gen) to make exactly ONE image, landscape 16:9, at the largest size available. Do not draw it with code. When it is generated, copy the image file to $out (keep the format the tool produced; if it is not PNG, convert to PNG). Do not create or change any other file. Reply with the saved path only.

The two attached images are STYLE AND SHEET-FORMAT REFERENCES ONLY (the painting hand, the cream paper, the scale and spacing of a turnaround sheet). Do NOT copy the people in them, their faces, hair or clothes.

IMAGE PROMPT:
$body"
cd $ROOT
codex exec -s workspace-write --skip-git-repo-check "$task" -i $REF/mama/mama_A_turnaround_v3.jpg -i $REF/jade/jade_A_turnaround_v3.jpg < /dev/null > $ROOT/_logs/$(basename $2 .png).log 2>&1
echo "DONE $2 rc=$?" >> $ROOT/_logs/_done.log
