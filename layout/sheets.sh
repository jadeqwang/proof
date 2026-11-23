#!/bin/sh
# Contact sheets: media/layout/_sheets/<set>.jpg from the label renders, shot ids as captions.
#   sh layout/sheets.sh [set ...]   (default: attic88 bed26 car26)
cd "$(dirname "$0")/.." || exit 1
mkdir -p media/layout/_sheets
for SET in ${*:-attic88 bed26 car26}; do
  files=""
  for f in $(ls media/layout/$SET/*_label.png | sort -V); do id=$(basename "$f" _label.png); files="$files -label $id $f"; done
  montage $files -tile 4x -geometry 600x338+6+6 -pointsize 26 -background '#2a2a2a' -fill white -title "$SET layout (label mode)" media/layout/_sheets/$SET.jpg
  echo "media/layout/_sheets/$SET.jpg"
done
