#!/bin/sh
# Mannequin test sheets (2026-11-25): render the test set, then contact sheets of line and flat.
#   sh layout/sets/mtest/sheet.sh   -> media/layout/_sheets/mtest_{line,flat}.jpg, mtest_hands_{line,flat}.jpg
cd "$(dirname "$0")/../../.." || exit 1
node layout/render.mjs --set mtest --modes line,flat --nojson | grep -v '^mtest '
mkdir -p media/layout/_sheets
for MODE in line flat; do
  files=""; for f in $(ls media/layout/mtest/*_$MODE.png | grep -v '/hclose' | sort -V); do files="$files -label $(basename "$f" _$MODE.png) $f"; done
  montage $files -tile 4x -geometry 800x450+6+6 -pointsize 24 -background '#2a2a2a' -fill white -title "mtest bodies ($MODE)" media/layout/_sheets/mtest_$MODE.jpg
  files=""; for f in $(ls media/layout/mtest/hclose*_$MODE.png | sort -V); do files="$files -label $(basename "$f" _$MODE.png) $f"; done
  montage $files -tile 2x -geometry 1200x675+6+6 -pointsize 24 -background '#2a2a2a' -fill white -title "mtest hand shapes ($MODE): columns = shapes, rows = palm / thumb side / 3-4 back" media/layout/_sheets/mtest_hands_$MODE.jpg
  echo media/layout/_sheets/mtest_$MODE.jpg media/layout/_sheets/mtest_hands_$MODE.jpg
done
