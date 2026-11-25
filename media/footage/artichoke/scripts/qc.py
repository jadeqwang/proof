#!/usr/bin/env python3
"""QC a render: per-frame change (mean abs diff at 480x270) to find jumps/flicker, and a contact sheet every N seconds.
    qc.py VIDEO OUT_PREFIX [every_sec]"""
import subprocess, sys, numpy as np, cv2
v, pre = sys.argv[1], sys.argv[2]; every = float(sys.argv[3]) if len(sys.argv) > 3 else 5
w, h = 480, 270
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", v, "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
fps = 30; prev = None; d = []; tiles = []; i = 0
while True:
    b = p.stdout.read(w * h * 3)
    if len(b) < w * h * 3: break
    f = np.frombuffer(b, np.uint8).reshape(h, w, 3).astype(np.float32)
    if prev is not None: d.append(np.abs(f - prev).mean())
    if i % int(every * fps) == 0:
        t = f.astype(np.uint8).copy(); cv2.putText(t, f"{i / fps:.0f}s", (6, 20), 0, 0.6, (0, 0, 0), 1); tiles.append(t)
    prev = f; i += 1
d = np.array(d); np.savetxt(pre + "_diff.txt", d, fmt="%.4f")
print("frames", i, "diff mean %.4f p99 %.4f max %.4f at frame %d" % (d.mean(), np.percentile(d, 99), d.max(), d.argmax() + 1))
top = np.argsort(d)[-8:][::-1]; print("largest:", [(int(k + 1), round(float(d[k]), 3)) for k in top])
# ratio of a frame's change to its neighbours' (spikes = pops)
r = d[1:-1] / (0.5 * (d[:-2] + d[2:]) + 1e-3); print("spikiest:", [(int(k + 2), round(float(r[k]), 2)) for k in np.argsort(r)[-6:][::-1]])
cols = 6; rows = (len(tiles) + cols - 1) // cols
S = np.full((rows * h, cols * w, 3), 255, np.uint8)
for k, t in enumerate(tiles): S[(k // cols) * h:(k // cols + 1) * h, (k % cols) * w:(k % cols + 1) * w] = t
cv2.imwrite(pre + "_sheet.jpg", S[..., ::-1], [cv2.IMWRITE_JPEG_QUALITY, 85])
