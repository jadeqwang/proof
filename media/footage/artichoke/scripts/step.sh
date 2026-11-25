#!/bin/bash
# step.sh STAGE NEIGHBOUR_PNG [N_CANDIDATES] [ROUTE]  -> work/STAGE_v{k}.png candidates (parallel), each with sidecar + genlog row
cd /home/jade/Documents/proof
A=media/footage/artichoke; S=$1; NB=$2; N=${3:-2}; R=${4:-codex}
/home/jade/Documents/halys-video/.venv/bin/python $A/scripts/stages.py $S >/dev/null
for k in $(seq 1 $N); do
  v=$k; while [ -e $A/work/${S}_v$v.png ] || [ -e $A/work/${S}_v$v.log ]; do v=$((v+N)); done
  /home/jade/Documents/halys-video/.venv/bin/python $A/scripts/gen_stage.py --route $R --out $A/work/${S}_v$v.png \
     --prompt-file $A/prompts/$S.full.txt --ref "$NB:the neighbouring plate in the series, to edit" > $A/work/${S}_v$v.log 2>&1 &
  sleep 5
done
wait
cat $A/work/${S}_v*.log | grep -E "^OK|FAIL|Error" 
