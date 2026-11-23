#!/bin/sh
# Contact sheets for one "Proof" beam set (identical copies in attic88_day, wall88, closet02):
#   sh layout/sets/<set>/sheet.sh [mode ...]   (default: label line)
#   -> media/layout/_sheets/<set>_<mode>.jpg, plus <set>_beam.jpg when the beam_<id>_flat.png masks exist
SET=$(basename "$(cd "$(dirname "$0")" && pwd)")
cd "$(dirname "$0")/../../.." || exit 1
mkdir -p media/layout/_sheets
for MODE in ${*:-label line}; do
  files=""
  for f in $(ls media/layout/$SET/*_$MODE.png | grep -v "/beam_" | sort -V); do id=$(basename "$f" _$MODE.png); files="$files -label $id $f"; done
  montage $files -tile 3x -geometry 800x450+6+6 -pointsize 24 -background '#2a2a2a' -fill white -title "$SET ($MODE)" media/layout/_sheets/${SET}_$MODE.jpg
  echo "media/layout/_sheets/${SET}_$MODE.jpg"
done
if ls media/layout/$SET/beam_*_flat.png >/dev/null 2>&1; then
  files=""
  for f in $(ls media/layout/$SET/beam_*_flat.png | sort -V); do id=$(basename "$f" _flat.png); files="$files -label $id $f"; done
  montage $files -tile 3x -geometry 800x450+6+6 -pointsize 24 -background '#2a2a2a' -fill white -title "$SET (beam masks)" media/layout/_sheets/${SET}_beam.jpg
  echo "media/layout/_sheets/${SET}_beam.jpg"
fi
