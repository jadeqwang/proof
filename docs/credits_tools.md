# Proof: every tool and model used (for the closing credits slide)

Closing slide: **"Animated by Opus 5.5 and a supporting cast of models:"** followed by the list below.
Keep this file current: whoever brings in a new model or tool adds it here the same day (the lead checks at each
commit). "Used" means it actually ran for the film; "Planned / in progress" moves up once it does.
Sources checked 2026-11-26: `media/genlog.jsonl`, `python3 tools/gen/spend.py`, sheet and keyframe sidecars, the
scripts in `analysis/`, `tools/`, `work/karaoke_v2/`, `layout/`.

## Draft credit line

Animated by Opus 5.5 and a supporting cast of models: GPT Image 2 (via Codex and the OpenAI API), Nano Banana Pro,
Seedream 5 Pro, Whisper large-v3, HT Demucs, MMS forced alignment, three.js, and Jolt Physics.

## Used

### Direction, writing, code
- **Claude Opus 5.5** (Anthropic), in Claude Code: lead, and every subagent so far (sets, plan, analysis, prompts,
  review pages).
- **Codex CLI** (OpenAI), headless in tmux: runs the free image generation below.

### Images (character sheets, keyframes, plates, wall art)
- **GPT Image 2** (`openai/gpt-image-2`): 137 calls through the Cloudflare AI Gateway (paid), plus the free Codex
  `image_gen` route (41 logged calls; most keyframes and sheets in `cast/` and `media/keyframes/`).
- **Nano Banana Pro** (`google/nano-banana-pro`): 1 call (a comparison test).
- **Seedream 5 Pro** (`bytedance/seedream-5-pro`): 1 call (a comparison test).

### Audio and lyrics analysis
- **Whisper large-v3** via **faster-whisper**: lyric transcription (`analysis/transcribe.py`).
- **HT Demucs** (`htdemucs`): stem separation, vocals stem for analysis (`analysis/`).
- **MMS forced aligner** (`torchaudio.pipelines.MMS_FA`): word timings for the karaoke/song map
  (`work/karaoke_v2/fa.py`).
- **librosa** (incl. pYIN pitch tracking): beats, onsets, pitch contours (`analysis/`).

### 3D layout, rendering, compositing
- **three.js** (r170): every set, camera and guide render (`layout/`).
- **Jolt Physics** (jolt-physics 1.1.2, WASM; Jorrit Rouwe, MIT): soft-body cloth for the IAS hoodie in Morton Grove
  (`layout/sets/mortongrove07/sweatshirt_jolt.js`, vendored at `layout/vendor/jolt-physics/`).
- **Playwright** + **Chrome** (SwiftShader): headless rendering of the sets.
- **Pillow**, **OpenCV**, **NumPy**: compositing, toner labels, gold pencil, contact sheets (`tools/kf/`, `tools/ink/`).
- **ImageMagick**: crops and montages for review.
- **FFmpeg**: frame grabs from Jade's earlier film *Moongazing* for reference (the Sagan ring, 2026-11-26).

## Planned / in progress (move up once used)
- **Blender** + **MPFB2 (MakeHuman for Blender)**, CC0 assets: rigged human body meshes for every figure (2026-11-26).
- **Rapier** (`@dimforge/rapier3d-compat`): physics check that every held or resting object is supported.
- **BiRefNet** / **SAM 2**: matting options already written into `tools/ink/video.py`; not run yet.
- Video models for the motion step (plan steps 6-8): none chosen yet.

## Not credited (looked at, not used for the film)
- The many models in `tools/gen/catalog.py` (Seedance, Kling, Veo, FLUX, Gemini TTS, etc.) are a price catalogue,
  not things that ran. fal models were searched on 2026-11-26 (Meshy / Hyper3D rigging, Hunyuan Motion), not used.
