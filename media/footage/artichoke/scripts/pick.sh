#!/bin/bash
# pick.sh STAGE VERSION : copy work/STAGE_vN.png (+ sidecar) to stages/STAGE.png
cd /home/jade/Documents/proof/media/footage/artichoke
cp work/$1_v$2.png stages/$1.png && cp work/$1_v$2.txt stages/$1.txt && echo "$1 <- v$2" >> stages/PICKS.txt
