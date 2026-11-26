#!/bin/sh
# Light-study contact sheets: rows = suns (labelled with date and time), columns = REF_wide, V1e, her eye level.
cd "$(dirname "$0")/../../../.." || exit 1
D=media/layout/shanghai86/lightstudy
for MODE in lit flat; do
  files=""
  for k in 1 2 3 4 5; do
    case $k in 1) L="1986-12-21 08:30 (honest; set default)";; 2) L="1986-12-21 09:30 (Jade's pick; face in shade)";; 3) L="CHEAT: 09:30 azimuth, sun lowered to 19 deg";; 4) L="1986-12-21 08:00 (honest)";; 5) L="1986-12-21 15:00 (honest afternoon)";; esac
    for v in REF_wide V1e EYE; do files="$files -label \"$L | $v\" $D/LS${k}_${v}_$MODE.png"; done
  done
  OUT=media/layout/_sheets/shanghai86_lightstudy.jpg; [ $MODE = flat ] && OUT=media/layout/_sheets/shanghai86_lightstudy_flat.jpg
  eval montage $files -tile 3x -geometry 800x450+6+6 -pointsize 22 -background "'#2a2a2a'" -fill white -title "'shanghai86 light study ($MODE): rows = suns, columns = REF_wide / V1e / her eye level'" $OUT
  echo $OUT
done
