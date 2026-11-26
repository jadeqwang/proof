#!/bin/bash
# Render every deliverable of the three plates. About 2-4 min a plant on the 3090 + 16 cores.
set -e
cd "$(dirname "$0")"
PY=${PY:-/home/jade/Documents/halys-video/.venv/bin/python}
mkdir -p out stills data
for p in artichoke romanesco aloe; do
  case $p in
    artichoke) AT="2.8 5.0 7.2 9.4"; export NO_MARKET_COUNT=${NO_MARKET_COUNT:-1};;   # 2026-11-26 timing (9.5 s); never writes layout/sets/market93/artichoke_plate_count.json (run spirals.py --data directly for that)
    romanesco) AT="6.0 11.6 19.9";;
    aloe) AT="5.5 12.9";;
  esac
  $PY spirals.py $p --plate stills/${p}_plate16.png --data data/${p}_arms.json --at $AT --out stills/${p}.png --movies out --jobs ${JOBS:-12}
done
