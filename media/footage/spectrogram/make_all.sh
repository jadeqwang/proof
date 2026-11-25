#!/bin/bash
# Render every deliverable of the spectrogram plate. About 2 minutes on 12 cores.
#   bash make_all.sh            (from anywhere)
set -euo pipefail
cd "$(dirname "$0")"
PY=${PY:-/home/jade/Documents/halys-video/.venv/bin/python}
MASTER="../../../inputs/Proof (-2sm).wav"
mkdir -p out stills
clip() {  # variant -> "start dur"
  $PY -c "import render as r; v=r.VARIANTS['$1']; a,b=v['clip']; print(a, b-a)"
}
for V in short long; do
  read T0 DUR < <(clip $V)
  for M in draw ink; do
    if [ "$M" = draw ]; then TAG=spectrogram_${V}; else TAG=spectrogram_${V}_ink; fi
    $PY render.py --variant $V --mode $M --mov out/${TAG}_master_prores422hq.mov
    # H.264 preview with the master's audio for the same span (sample-accurate seek on the WAV)
    ffmpeg -y -loglevel error -i out/${TAG}_master_prores422hq.mov -ss $T0 -t $DUR -i "$MASTER" \
      -map 0:v -map 1:a -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -tune grain \
      -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
      -c:a aac -b:a 320k -movflags +faststart out/${TAG}_preview_audio.mp4
  done
  # figure only on a transparent ground, for overlay (ProRes 4444 with alpha, straight alpha)
  $PY render.py --variant $V --mode draw --alpha --mov out/spectrogram_${V}_alpha_prores4444.mov
done
# stills (master times)
$PY render.py --variant short --still 192.40 193.60 195.45 --out stills/spectrogram_short.png
$PY render.py --variant short --mode ink --still 192.60 --out stills/spectrogram_short_ink.png
$PY render.py --variant short --band wide --still 195.45 --out stills/spectrogram_short_wideband_comparison.png
$PY render.py --variant short --alpha --still 195.45 --out stills/spectrogram_short_alpha_rgba16.png
$PY render.py --variant long --still 193.00 196.80 200.05 --out stills/spectrogram_long.png
