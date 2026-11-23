#!/bin/sh
# review.sh <set> <shot> [modes]  -> a 2x2 (or more) downscaled sheet of the modes in $REV (default /tmp)
SET=$1; SHOT=$2; MODES=${3:-"label line flat lit"}; REV=${REV:-/tmp/claude-1000/-home-jade-Documents-chaosmonkey-video/e0374f19-0e18-4b47-948d-235491a67d56/scratchpad/rev}
D=$(dirname "$0")/../media/layout/$SET
files=""; for m in $MODES; do files="$files $D/${SHOT}_$m.png"; done
montage $files -tile 2x -geometry 700x394+4+4 -background '#333' "$REV/${SET}_${SHOT}.jpg"
echo "$REV/${SET}_${SHOT}.jpg"
