#!/bin/bash
# next.sh PICK_STAGE VERSION NEXT_STAGE : pick, lock its mound, and generate NEXT_STAGE candidates from the locked comp
cd /home/jade/Documents/proof/media/footage/artichoke
scripts/pick.sh $1 $2
/home/jade/Documents/halys-video/.venv/bin/python scripts/layers.py $1 | tail -1
convert layers/$1_check.jpg -resize 1672x941 work/$1_locked.png
[ -n "$3" ] && scripts/step.sh $3 media/footage/artichoke/work/$1_locked.png
