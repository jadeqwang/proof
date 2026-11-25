#!/bin/bash
# usage: render.sh lyrics_timed.json audio.wav out.mp4 [start_s duration_s]
set -e
here=$(cd "$(dirname "$0")" && pwd); root=$(cd "$here/../.." && pwd)
json=$1; audio=$2; out=$3; ss=${4:-0}; dur=${5:-}
ass=$(mktemp --suffix=.ass)
python3 "$here/make_ass.py" "$json" "$ass"
len=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$audio")
cover="$root/analysis/cover.jpg"
seek=(); [ -n "$dur" ] && seek=(-ss "$ss" -t "$dur")
ffmpeg -y -hide_banner -loglevel error \
  -loop 1 -framerate 30 -i "$cover" -i "$audio" \
  -filter_complex "[0:v]scale=1920:1920,crop=1920:1080,gblur=sigma=40,eq=brightness=-0.32:saturation=0.7,vignette=PI/4,format=yuv420p,setpts=PTS-STARTPTS[bg];[bg]ass='$ass'[v]" \
  -map "[v]" -map 1:a -t "$len" "${seek[@]}" -c:v libx264 -preset medium -crf 20 -tune stillimage -c:a aac -b:a 256k -movflags +faststart "$out"
cp "$ass" "${out%.mp4}.ass"; rm -f "$ass"
echo "wrote $out"
