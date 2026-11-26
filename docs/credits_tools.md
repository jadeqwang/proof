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
- **Blender** 4.5 LTS (headless) + **MPFB2** 2.0.18 (MakeHuman for Blender; the MakeHuman system assets, CC0): the rigged
  human body meshes for every figure (`layout/assets/bodies/`, `layout/engine/humanMesh.js`, 2026-11-26).
- **Downloaded 3D props** (2026-11-26; `layout/assets/props/`, loader `layout/sets/_props.js`, audit `work/props_audit.md`;
  each model has SOURCE.txt + LICENSE.txt). Found through **Poly Haven** (CC0) and **Objaverse 1.0** (Allen AI; its
  per-model Sketchfab licence checked, only CC BY 4.0 / CC0 used), processed in Blender (joined, scaled, decimated).
  Phase 1: in the test set `propstest` only; swapped into the film sets in phase 2.
  - CC BY 4.0, attribution REQUIRED in the credits (models from Sketchfab, via the Objaverse mirror):
    - `ladle`: "Ladle" by Lightningx (https://sketchfab.com/3d-models/3c1fe2f2c77b4d258c3d1a08de55eb1a), CC BY 4.0
    - `ladle_b`: "Spoon" by libbycox (https://sketchfab.com/3d-models/e6823583dbca4d219ac303e96cd797fa), CC BY 4.0
    - `juicer`: "Citrus_Juicer" by Vitor.Gomes1 (https://sketchfab.com/3d-models/698a3af63fe1443ba01a235bc69a5f96), CC BY 4.0
    - `red_cup`: "Solo Cup" by idyllKingdom (https://sketchfab.com/3d-models/22798b1b718749608a0e729d576727a4), CC BY 4.0
    - `pitcher`: "POLYCARBONATE MUG" by fancyikzero (https://sketchfab.com/3d-models/5ee4647f7994413d80652e10090d380d), CC BY 4.0
    - `bowl`: "Plate" by rbhbkkn.kmrjd (https://sketchfab.com/3d-models/0f2f0e489ab445108c939820a00d4888), CC BY 4.0
    - `knife`: "test knife" by Fellm (https://sketchfab.com/3d-models/f93d05bc2db144f7a50374794ef5cf8d), CC BY 4.0
    - `kettle`: "Teapot" by 19brian16 (https://sketchfab.com/3d-models/46617e30864a45eba268c756cf53c52f), CC BY 4.0
    - `rice_cooker`: "Rice Cooker Lowpoly" by ononesupplies (https://sketchfab.com/3d-models/6afda632eac6459cb99e73deccb97a98), CC BY 4.0
    - `telephone`: "PTish Phone" by schmoldt.art (https://sketchfab.com/3d-models/eaa0a0cbce964b2099b955f5ea241eee), CC BY 4.0
    - `typewriter`: "IBM Selectric II Typewriter" by maxdragon (https://sketchfab.com/3d-models/bef0f699a5374ca1a8fe8e27fb77788a), CC BY 4.0
    - `thermos`: "a thermos kettle" by downpink97 (https://sketchfab.com/3d-models/99f750217a8e47df8445cb63bbaa66ec), CC BY 4.0
    - `mug`: "Cup" by saleviim (https://sketchfab.com/3d-models/12652c6e0aaf44dda32aab816f433baf), CC BY 4.0
    - `tissue_box`: "Tissue Box Low Poly" by anand9556 (https://sketchfab.com/3d-models/2f93ae57a77e464b9e71cc38eefdbf09), CC BY 4.0
    - `pencil_cup`: "Pens with Pencil holder - desk props" by janexx (https://sketchfab.com/3d-models/1f33e40c27fe451e9efda612c69010ae), CC BY 4.0
    - `keyboard`: "Keyboard - Classic IBM Design" by matthew.leiher (https://sketchfab.com/3d-models/a2b56b6bebfa4388a349eba131572a6f), CC BY 4.0
  - CC0 (Poly Haven; credit as courtesy):
    - `tv_small`: "Television 02" by Benny Weimer, Poly Haven (CC0)
    - `bulb`: "Lightbulb 01" by Josh Dean, Poly Haven (CC0)
    - `pull_chain_socket`: "Pull Chain Light Socket" by Josh Dean, Poly Haven (CC0)
    - `potted_plant`: "Potted Plant 02" by Rico Cilliers, Poly Haven (CC0)
    - `lemon`: "Lemon" by Kuutti Siitonen, Poly Haven (CC0)
    - `cutting_board`: "Wooden Cutting Board" by Kuutti Siitonen, Poly Haven (CC0)
    - `cardboard_box`: "Cardboard Box 01" by Rahul Chaudhary, Poly Haven (CC0)
- **Playwright** + **Chrome** (SwiftShader): headless rendering of the sets.
- **Pillow**, **OpenCV**, **NumPy**: compositing, toner labels, gold pencil, contact sheets (`tools/kf/`, `tools/ink/`).
- **ImageMagick**: crops and montages for review.
- **SciPy** (ndimage): cutting the alphabet-card pictures and the clothing prints out of their sheets (`tools/kf/alphabet_cards.py`).
- **NASA insignia** ("meatball", 1959, James Modarelli; public domain, US government work), from Wikimedia Commons
  `File:NASA_logo.svg`: the canonical decal on Jade's jacket (`layout/assets/art/logos/nasa_meatball.png`, 2026-11-26).
- **Fonts**: DejaVu Sans, Liberation Sans/Serif (book spines, alphabet letters, clock faces), Droid Sans Fallback
  (Shanghai calligraphy scrolls and calendar), drawn in code on canvases.
- **FFmpeg**: frame grabs from Jade's earlier film *Moongazing* for reference (the Sagan ring, 2026-11-26).

## Planned / in progress (move up once used)
- **Rapier** (`@dimforge/rapier3d-compat`): physics check that every held or resting object is supported.
- **BiRefNet** / **SAM 2**: matting options already written into `tools/ink/video.py`; not run yet.
- Video models for the motion step (plan steps 6-8): none chosen yet.

## Not credited (looked at, not used for the film)
- The many models in `tools/gen/catalog.py` (Seedance, Kling, Veo, FLUX, Gemini TTS, etc.) are a price catalogue,
  not things that ran. fal models were searched on 2026-11-26 (Meshy / Hyper3D rigging, Hunyuan Motion), not used.
