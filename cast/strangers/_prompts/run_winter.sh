#!/bin/bash
# usage: run_winter.sh <out-relative-path.png>   (same route as run.sh, face C, + uncle_v1 identity ref)
ROOT=/home/jade/Documents/proof/cast/strangers
REF=/home/jade/Documents/proof/inputs/refs_chaosmonkey
out=$ROOT/$1
body=$(cat $ROOT/_prompts/_style.txt; echo; cat $ROOT/_prompts/uncle_v2_winter.txt; echo; cat $ROOT/_prompts/_face_C.txt; echo; cat $ROOT/_prompts/_tail.txt)
task="Use your built-in image generation tool (image_gen) to make exactly ONE image, landscape 16:9, at the largest size available. Do not draw it with code. When it is generated, copy the image file to $out (keep the format the tool produced; if it is not PNG, convert to PNG). Do not create or change any other file. Reply with the saved path only.

Image 1 is the IDENTITY REFERENCE: the same man (body, proportions, hair outline, blank unfinished face), the same painting hand and the same sheet layout. Change only what the prompt below changes. Images 2 and 3 are STYLE AND SHEET-FORMAT REFERENCES ONLY (the painting hand, the cream paper, the scale and spacing of a turnaround sheet). Do NOT copy the people in images 2 and 3, their faces, hair or clothes.

IMAGE PROMPT:
$body"
printf '%s\n' "$task" > $ROOT/_logs/$(basename $1 .png).task.txt
cd $ROOT
codex exec -s workspace-write --skip-git-repo-check "$task" -i $ROOT/uncle/uncle_v1.png -i $REF/mama/mama_A_turnaround_v3.jpg -i $REF/jade/jade_A_turnaround_v3.jpg < /dev/null > $ROOT/_logs/$(basename $1 .png).log 2>&1
echo "DONE $1 rc=$?" >> $ROOT/_logs/_done.log
