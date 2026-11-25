#!/usr/bin/env python3
"""Render the artichoke growth animation from the locked stage layers.

    PY=/home/jade/Documents/halys-video/.venv/bin/python
    $PY scripts/animate.py                       # master ProRes 422 HQ + H.264 preview (out/)
    $PY scripts/animate.py --preview             # H.264 only, faster (no master)
    $PY scripts/animate.py --frames 0,1200,2400 --stills work/stills   # a few frames as PNG, no video
    $PY scripts/animate.py --timing other.json --tag v2

Every frame = plate * L(t), then a camera crop. L(t) between two stage layers A -> B:
  * RAFT optical flow both ways (torchvision raft_large, on the composited stages at half work res), trusted only where
    forward and backward flow agree; elsewhere it falls back to a plain dissolve;
  * a per-pixel progress w(x, t) that sweeps outward from the plant's base along the plant (geodesic distance through the
    union of both stages' plant masks), so new growth spreads from the base to the tips; dark engraved lines lead the
    pale washes slightly ("ink_lead"), so the line seems to be drawn before the colour is laid;
  * L = exp((1-w) log(A warped by w F(B->A)) + w log(B warped by (1-w) F(A->B)))  (blend in optical density).
Flows and distance fields are cached in work/cache/ (delete to recompute after regenerating a stage).
"""
import argparse, json, os, subprocess, sys, time
import cv2, numpy as np, torch, torch.nn.functional as Fn
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import dijkstra
HERE = os.path.dirname(os.path.abspath(__file__)); BASE = os.path.dirname(HERE)
LAY = os.path.join(BASE, "layers"); CACHE = os.path.join(BASE, "work", "cache"); os.makedirs(CACHE, exist_ok=True)
dev = "cuda" if torch.cuda.is_available() else "cpu"
OW, OH = 1920, 1080

ap = argparse.ArgumentParser()
ap.add_argument("--timing", default=os.path.join(BASE, "timing.json"))
ap.add_argument("--tag", default="")
ap.add_argument("--preview", action="store_true")
ap.add_argument("--frames")
ap.add_argument("--stills", default=os.path.join(BASE, "work", "stills"))
a = ap.parse_args()
T = json.load(open(a.timing))
FPS = T["fps"]; ST = T["stages"]; n = len(ST) - 1
tr = T["trans"] if isinstance(T["trans"], list) else [T["trans"]] * n
tr = [d * T.get("weights", {}).get(f"{ST[i]}-{ST[i+1]}", 1.0) for i, d in enumerate(tr)]
if T.get("total"):
    k = (T["total"] - T["hold_start"] - T["hold_end"]) / sum(tr); tr = [d * k for d in tr]
starts = np.cumsum([T["hold_start"]] + tr[:-1]); total = T["hold_start"] + sum(tr) + T["hold_end"]
NF = int(round(total * FPS))

def rd(p):
    return torch.from_numpy(cv2.imread(p, cv2.IMREAD_UNCHANGED)[..., ::-1].astype(np.float32) / 65535.0).permute(2, 0, 1).contiguous().to(dev)

plate = rd(os.path.join(LAY, "plate.png")); C, H, W = plate.shape
layers = {}
def L(s):
    if s not in layers:
        layers[s] = rd(os.path.join(LAY, s + "_layer.png"))
    return layers[s]

_raft = None
def raft(x, y):
    global _raft
    from torchvision.models.optical_flow import raft_large, Raft_Large_Weights
    if _raft is None:
        _raft = raft_large(weights=Raft_Large_Weights.DEFAULT).eval().to(dev)
    h, w = H // 2, W // 2
    f = lambda z: Fn.interpolate(z[None], (h, w), mode="area") * 2 - 1
    with torch.no_grad():
        fl = _raft(f(x), f(y), num_flow_updates=24)[-1][0]
    return Fn.interpolate(fl[None], (H, W), mode="bilinear", align_corners=False)[0] * 2      # px at work res

def grid_base():
    yy, xx = torch.meshgrid(torch.arange(H, device=dev, dtype=torch.float32), torch.arange(W, device=dev, dtype=torch.float32), indexing="ij")
    return torch.stack([xx, yy])
G0 = grid_base()

def warp(img, flow):
    """backward warp: out(x) = img(x + flow(x))"""
    p = G0 + flow
    g = torch.stack([p[0] / (W - 1) * 2 - 1, p[1] / (H - 1) * 2 - 1], -1)[None]
    return Fn.grid_sample(img[None], g, mode="bilinear", padding_mode="border", align_corners=True)[0]

def mask_of(l):
    return ((1 - l).amax(0) > 0.03).float()

def geodesic(m, f=8):
    """normalised distance from the plant base, travelling through the plant mask (cheap) or bare paper (dear)."""
    mm = Fn.max_pool2d(m[None, None], f)[0, 0].cpu().numpy(); h, w = mm.shape
    cost = np.where(mm > 0, 1.0, 25.0)
    idx = np.arange(h * w).reshape(h, w); rows, cols, vals = [], [], []
    for dy, dx in ((0, 1), (1, 0), (1, 1), (1, -1)):
        a0 = idx[max(0, -dy):h - max(0, dy), max(0, -dx):w - max(0, dx)]
        b0 = idx[max(0, dy):max(0, dy) + a0.shape[0], max(0, dx):max(0, dx) + a0.shape[1]]
        c = (cost.flat[a0.ravel()] + cost.flat[b0.ravel()]) / 2 * (1.4142 if dx and dy else 1)
        rows += [a0.ravel(), b0.ravel()]; cols += [b0.ravel(), a0.ravel()]; vals += [c, c]
    g = csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(h * w, h * w))
    bx, by = int(T["base"][0] * w), int(T["base"][1] * h)
    d = dijkstra(g, indices=by * w + bx).reshape(h, w)
    inside = d[mm > 0]; dmax = np.percentile(inside[np.isfinite(inside)], 99.5) if inside.size else 1
    d = np.clip(d / max(dmax, 1e-6), 0, 1.0)
    d = cv2.GaussianBlur(d.astype(np.float32), (0, 0), 1.5)
    return Fn.interpolate(torch.from_numpy(d)[None, None].to(dev), (H, W), mode="bilinear", align_corners=False)[0, 0]

def prep(i):
    s0, s1 = ST[i], ST[i + 1]
    cp = os.path.join(CACHE, f"{s0}-{s1}.pt")
    for s in (s0, s1):
        if os.path.exists(cp) and os.path.getmtime(os.path.join(LAY, s + "_layer.png")) > os.path.getmtime(cp):
            os.remove(cp)
    if os.path.exists(cp):
        return torch.load(cp, map_location=dev)
    A, B = L(s0), L(s1)
    fab, fba = raft(plate * A, plate * B), raft(plate * B, plate * A)
    # forward-backward consistency -> trust
    err_a = (fab + warp(fba, fab)).norm(dim=0); err_b = (fba + warp(fab, fba)).norm(dim=0)
    blur = lambda z: Fn.avg_pool2d(z[None, None], 31, 1, 15)[0, 0]
    ta = blur(torch.exp(-(err_a / 6) ** 2)); tb = blur(torch.exp(-(err_b / 6) ** 2))
    m = torch.maximum(mask_of(A), mask_of(B))
    g = geodesic(m)
    dark = (1 - B.mean(0)).clamp(0, 1)
    dark = (dark / max(float(torch.quantile(dark[m > 0][::97], 0.98)), 1e-3)).clamp(0, 1)
    out = {"fab": (fab * ta).half(), "fba": (fba * tb).half(), "g": g.half(), "dark": dark.half()}
    torch.save(out, cp)
    return out

def ease(x):
    x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

def layer_at(sec):
    if sec <= starts[0]:
        return L(ST[0])
    for i in range(n):
        if starts[i] <= sec < starts[i] + tr[i]:
            break
    else:
        return L(ST[-1])
    t = float(ease((sec - starts[i]) / tr[i]))
    if t <= 0: return L(ST[i])
    if t >= 1: return L(ST[i + 1])
    P = prep(i); A, B = L(ST[i]), L(ST[i + 1])
    soft, lead = T["soft"], T["ink_lead"]
    g = P["g"].float() - lead * P["dark"].float()
    w = ((t * (1 + soft + lead) - g) / soft).clamp(0, 1)
    w = w * w * (3 - 2 * w)
    Aw = warp(A, w * P["fba"].float())
    Bw = warp(B, (1 - w) * P["fab"].float())
    # blend in optical density (log transmittance), so two half-faded drawings do not wash out to a pale double exposure
    eps = 1e-3
    return torch.exp((1 - w) * torch.log(Aw.clamp_min(eps)) + w * torch.log(Bw.clamp_min(eps)))

def cam(u):
    K = T["camera"]
    for j in range(len(K) - 1):
        if K[j]["t"] <= u <= K[j + 1]["t"]:
            x = float(ease((u - K[j]["t"]) / max(K[j + 1]["t"] - K[j]["t"], 1e-9)))
            return [K[j][k] + (K[j + 1][k] - K[j][k]) * x for k in ("zoom", "cx", "cy")]
    k = K[-1] if u > K[-1]["t"] else K[0]; return k["zoom"], k["cx"], k["cy"]

def frame(fi):
    sec = fi / FPS
    img = (plate * layer_at(sec)).clamp(0, 1)
    z, cx, cy = cam(fi / max(NF - 1, 1))
    cw, ch = W / z, H / z
    x0 = min(max(cx * W - cw / 2, 0), W - cw); y0 = min(max(cy * H - ch / 2, 0), H - ch)
    # area-correct resample: pre-blur by the downscale factor, then bilinear sample of the crop
    s = cw / OW
    if s > 1.05:
        k = int(2 * round(s) + 1); sig = 0.5 * s
        xk = torch.arange(k, device=dev, dtype=torch.float32) - k // 2; kk = torch.exp(-xk ** 2 / (2 * sig * sig)); kk /= kk.sum()
        img = Fn.conv2d(Fn.pad(img[:, None], (k // 2, k // 2, 0, 0), mode="replicate"), kk.view(1, 1, 1, k))
        img = Fn.conv2d(Fn.pad(img, (0, 0, k // 2, k // 2), mode="replicate"), kk.view(1, 1, k, 1))[:, 0]
    xs = x0 + (torch.arange(OW, device=dev, dtype=torch.float32) + 0.5) * cw / OW - 0.5
    ys = y0 + (torch.arange(OH, device=dev, dtype=torch.float32) + 0.5) * ch / OH - 0.5
    gy, gx = torch.meshgrid(ys / (H - 1) * 2 - 1, xs / (W - 1) * 2 - 1, indexing="ij")
    out = Fn.grid_sample(img[None], torch.stack([gx, gy], -1)[None], mode="bicubic", padding_mode="border", align_corners=True)[0]
    return out.clamp(0, 1)

def to16(x):
    return (x.permute(1, 2, 0) * 65535 + 0.5).clamp(0, 65535).to(torch.int32).cpu().numpy().astype(np.uint16)

if a.frames:
    os.makedirs(a.stills, exist_ok=True)
    for fi in [int(v) for v in a.frames.split(",")]:
        cv2.imwrite(os.path.join(a.stills, f"f{fi:05d}.png"), to16(frame(fi))[..., ::-1])
        print("frame", fi, "sec %.2f" % (fi / FPS))
    sys.exit()

for i in range(n):
    prep(i); print("prepared", ST[i], "->", ST[i + 1], flush=True)
OUTD = os.path.join(BASE, "out"); os.makedirs(OUTD, exist_ok=True)
name = "artichoke_growth" + (("_" + a.tag) if a.tag else "")
master, prev = os.path.join(OUTD, name + "_prores422hq.mov"), os.path.join(OUTD, name + "_preview.mp4")
src = ["-f", "rawvideo", "-pix_fmt", "rgb48le", "-s", f"{OW}x{OH}", "-r", str(FPS), "-i", "-"]
if a.preview:
    cmd = ["ffmpeg", "-v", "error", "-y", *src, "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-tune", "grain", "-x264-params", "keyint=300:ipratio=1.0:pbratio=1.0:aq-mode=0", "-pix_fmt", "yuv420p", "-movflags", "+faststart", prev]
else:
    cmd = ["ffmpeg", "-v", "error", "-y", *src, "-c:v", "prores_ks", "-profile:v", "3", "-vendor", "apl0", "-pix_fmt", "yuv422p10le", master]
pp = subprocess.Popen(cmd, stdin=subprocess.PIPE)
t0 = time.time()
for fi in range(NF):
    pp.stdin.write(to16(frame(fi)).tobytes())
    if fi % 300 == 0:
        print(f"frame {fi}/{NF} {time.time() - t0:.0f}s", flush=True)
pp.stdin.close(); pp.wait()
if not a.preview:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", master, "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-tune", "grain", "-x264-params", "keyint=300:ipratio=1.0:pbratio=1.0:aq-mode=0", "-pix_fmt", "yuv420p", "-movflags", "+faststart", prev], check=True)
print("done", NF, "frames", "%.2fs" % (NF / FPS), master if not a.preview else prev)
