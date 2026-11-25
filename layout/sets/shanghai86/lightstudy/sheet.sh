#!/bin/sh
# Light-study contact sheets: rows = suns (labelled with date and time), columns = REF_wide, V1e, her eye level.
cd "$(dirname "$0")/../../../.." || exit 1
D=media/layout/shanghai86/lightstudy
for MODE in lit flat; do
  files=""
  for k in 1 2 3 4 5; do
    case $k in 1) L="1986-12-21 08:31 (round-4 pick)";; 2) L="1986-12-21 09:30 (Jade chose; set default)";; 3) L="1987-02-14 07:30";; 4) L="1986-12-21 15:00 (honest afternoon)";; 5) L="CHEATED: 16 deg high from az 143";; esac
    for v in REF_wide V1e EYE; do files="$files -label \"$L | $v\" $D/LS${k}_${v}_$MODE.png"; done
  done
  OUT=media/layout/_sheets/shanghai86_lightstudy.jpg; [ $MODE = flat ] && OUT=media/layout/_sheets/shanghai86_lightstudy_flat.jpg
  eval montage $files -tile 3x -geometry 800x450+6+6 -pointsize 22 -background "'#2a2a2a'" -fill white -title "'shanghai86 light study ($MODE): rows = suns, columns = REF_wide / V1e / her eye level'" $OUT
  echo $OUT
done
