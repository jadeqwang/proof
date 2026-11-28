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
  human body meshes for every figure (`layout/assets/bodies/`, `layout/engine/humanMesh.js`, 2026-11-26). Hair built in Blender
  from the scalp: Mama's perm (convex hull, exact boolean, OpenVDB voxel remesh, Voronoi curls), the aunt's and
  grandmother's bun, first love's finger-combed pieces.
- **Downloaded 3D props** (2026-11-26; `layout/assets/props/`, loader `layout/sets/_props.js`, audit `work/props_audit.md`;
  each model has SOURCE.txt + LICENSE.txt). Found through **Poly Haven** (CC0) and **Objaverse 1.0** (Allen AI; its
  per-model Sketchfab licence checked, only CC BY 4.0 / CC0 used), processed in Blender (joined, scaled, decimated).
  Phase 1: in the test set `propstest` only; swapped into the film sets in phase 2.
  Phase 2, mv10 (2026-11-26 late): `ladle` (V3b_prep, the party punchbowl), `red_cup`, `juicer`, `pitcher`, `bowl`, `knife`,
  `lemon`, `cutting_board` are in the set (not `ladle_b`).
  - CC BY 4.0, attribution REQUIRED in the credits (models from Sketchfab, via the Objaverse mirror):
    - `ladle`: "Ladle" by Lightningx (https://sketchfab.com/3d-models/3c1fe2f2c77b4d258c3d1a08de55eb1a), CC BY 4.0
    - `ladle_b`: "Spoon" by libbycox (https://sketchfab.com/3d-models/e6823583dbca4d219ac303e96cd797fa), CC BY 4.0
    - `juicer`: "Citrus_Juicer" by Vitor.Gomes1 (https://sketchfab.com/3d-models/698a3af63fe1443ba01a235bc69a5f96), CC BY 4.0
    - `red_cup`: "Solo Cup" by idyllKingdom (https://sketchfab.com/3d-models/22798b1b718749608a0e729d576727a4), CC BY 4.0
    - `pitcher`: "POLYCARBONATE MUG" by fancyikzero (https://sketchfab.com/3d-models/5ee4647f7994413d80652e10090d380d), CC BY 4.0
    - `bowl`: "Plate" by rbhbkkn.kmrjd (https://sketchfab.com/3d-models/0f2f0e489ab445108c939820a00d4888), CC BY 4.0
    - `knife`: "test knife" by Fellm (https://sketchfab.com/3d-models/f93d05bc2db144f7a50374794ef5cf8d), CC BY 4.0
    - `kettle`: "Teapot" by 19brian16 (https://sketchfab.com/3d-models/46617e30864a45eba268c756cf53c52f), CC BY 4.0. In kitchen90 (the red enamel kettle on the stove)
    - `rice_cooker`: "Rice Cooker Lowpoly" by ononesupplies (https://sketchfab.com/3d-models/6afda632eac6459cb99e73deccb97a98), CC BY 4.0. In kitchen90 (the white rice cooker on the counter)
    - `telephone`: "PTish Phone" by schmoldt.art (https://sketchfab.com/3d-models/eaa0a0cbce964b2099b955f5ea241eee), CC BY 4.0. In office91
    - `typewriter`: "IBM Selectric II Typewriter" by maxdragon (https://sketchfab.com/3d-models/bef0f699a5374ca1a8fe8e27fb77788a), CC BY 4.0. In office91
    - `thermos`: "a thermos kettle" by downpink97 (https://sketchfab.com/3d-models/99f750217a8e47df8445cb63bbaa66ec), CC BY 4.0. In shanghai86 (the two hot-water flasks)
    - `mug`: "Cup" by saleviim (https://sketchfab.com/3d-models/12652c6e0aaf44dda32aab816f433baf), CC BY 4.0. In shanghai86 (the tea mugs) and mortongrove07 (the coffee-table mug)
    - `grand_piano`: "Grand Piano" by thanhthanh (https://sketchfab.com/3d-models/c4b11ae7ddb34b20a6207e4a3f244e2b), CC BY 4.0. In mortongrove07 (the 7'1" grand; bench removed, scaled to 2.16 m)
    - `tissue_box`: "Tissue Box Low Poly" by anand9556 (https://sketchfab.com/3d-models/2f93ae57a77e464b9e71cc38eefdbf09), CC BY 4.0. In office91
    - `pencil_cup`: "Pens with Pencil holder - desk props" by janexx (https://sketchfab.com/3d-models/1f33e40c27fe451e9efda612c69010ae), CC BY 4.0. In office91
    - `shopping_cart`: "Carro De La Compra" by alexvladimircm (https://sketchfab.com/3d-models/c22286ade5ea493b890b3269e57b191f), CC BY 4.0. In market93 (the grandmother's supermarket cart; scaled to 0.98 m, handle grip split)
    - `keyboard`: "Keyboard - Classic IBM Design" by matthew.leiher (https://sketchfab.com/3d-models/a2b56b6bebfa4388a349eba131572a6f), CC BY 4.0. In basement90 (the PC keyboard)
    - `backpack`: "Diaper Bags" by fabbear (https://sketchfab.com/3d-models/040089295e3a4ee684d4562a8fabce9f), CC BY 4.0. In playground23 (Dad's plain black laptop backpack; recoloured black, the patch logo texture removed)
    - `sideboard`: "Cabinet" by Wandcaster (https://sketchfab.com/3d-models/fdcb5d8fdac247a3be20c28f4da2b466), CC BY 4.0. In shanghai86 (the dark-wood sideboard, north-east corner)
    - `tv_cabinet`: "Old Chest Of Drawers 1" by rhcreations (https://sketchfab.com/3d-models/93b6cef3362c4e84ac6f12b6af11a8e1), CC BY 4.0. In shanghai86 (the TV cabinet, recoloured to the room's teak)
    - `upright_piano`: "Upright Piano (WIP)" by catdevpete (https://sketchfab.com/3d-models/eb76131fcae44993a532ad1b99050deb), CC BY 4.0. In shanghai86 (the music room's piano, across the hall)
    - `kids_bottle`: "Sport Waterbottle" by psychofisch (https://sketchfab.com/3d-models/04b5fcbb2d644e608d7f836bdb136a85), CC BY 4.0. In playground23 (the two kids' water bottles, each with its own decal)
    - `garment_tee`, `garment_shirt`, `garment_pants` (and the wire hanger used by `garment_jacket`, `coat_long_a`, `coat_long_b`): "Hangers and Tee-shirt" (https://sketchfab.com/3d-models/44e260855c7f4c1ca611af8d2370195a), "Hangers and Long Sleeve Shirt" (https://sketchfab.com/3d-models/14cc81980a06473a820f811596418fae) and "Hangers and Pants" (https://sketchfab.com/3d-models/37b92fbde5ca45448c50fc2cb6a376d8) by dudecon, CC BY 4.0. In closet02 (the hanging clothes; recoloured, the shirts' printed text dropped)
    - `garment_sweater`: "Hanging Shirt By Camille Kleinman" by camillekleinman (https://sketchfab.com/3d-models/117fc4a6e8304a858dfaf2adc2c782a0), CC BY 4.0. In closet02 (the hanging sweaters)
    - `garment_jacket`: "hanging jackets2" by snugl.buniez (https://sketchfab.com/3d-models/de5af3ad431c44cba666cb7a37a351c3), CC BY 4.0. In closet02 (the hanging jackets; one jacket of the model's rack)
    - `coat_long_a`, `coat_long_b`: "Jacket" by connectionsxr (3D scans: https://sketchfab.com/3d-models/0ef825d04a05436f8a91c1ac489366cf and https://sketchfab.com/3d-models/0a73a5ed52994c989b4a5a34ab14fd1b), CC BY 4.0. In closet02 (the long coats; recoloured, thinned to hang pressed together)
  - CC0 (Poly Haven; credit as courtesy):
    - `tv_small`: "Television 02" by Benny Weimer, Poly Haven (CC0). In attic88_day (the small TV on the crate)
    - `bulb`: "Lightbulb 01" by Josh Dean, Poly Haven (CC0). In basement90 (the ceiling bulb) and attic88_day (the bare bulb, off)
    - `pull_chain_socket`: "Pull Chain Light Socket" by Josh Dean, Poly Haven (CC0). In basement90 (the lampholder)
    - `potted_plant`: "Potted Plant 02" by Rico Cilliers, Poly Haven (CC0). In shanghai86
    - `lemon`: "Lemon" by Kuutti Siitonen, Poly Haven (CC0)
    - `cutting_board`: "Wooden Cutting Board" by Kuutti Siitonen, Poly Haven (CC0)
    - `planter_box`: "Planter Box 02" by James Ray Cock, Poly Haven (CC0). Downloaded for mv10, NOT USED since 2026-11-27 evening (Jade: the strawberry bed is back at its page-1 place, a hand-built timber bed); drop from the credits unless used elsewhere
    - `side_table_tall`: "Side Table Tall 01" by James Ray Cock, Poly Haven (CC0). In shanghai86 (the round side table by the couch)
    - Textures (Poly Haven, CC0; layout/assets/textures/): "Herringbone Parquet" by Jenelle van Heerden and Sergej Majboroda, "Plastered Wall" by Amal Kumar, "Caban" by colormass and Rico Cilliers, "Sapele Veneer" and "Ash Veneer" by Jenelle van Heerden. In shanghai86 (floor, plaster, upholstery wool, varnished wood, her small table)
    - `half_barrel`: "Wine Barrel 01" by James Ray Cock, Poly Haven (CC0), cut to a half barrel. In mv10 (the half barrel of mint)
    - `cardboard_box`: "Cardboard Box 01" by Rahul Chaudhary, Poly Haven (CC0). In attic88_day (the storage boxes)
- **Playwright** + **Chrome** (SwiftShader): headless rendering of the sets.
- **three-mesh-bvh** (0.8, Garrett Johnson, MIT): triangle-intersection and clearance checks between body meshes and
  furniture (`layout/sets/basement90/check_bodies.mjs`, 2026-11-26: no body passes through another; eye convergence).
- **Pillow**, **OpenCV**, **NumPy**: compositing, toner labels, gold pencil, contact sheets (`tools/kf/`, `tools/ink/`).
- **ImageMagick**: crops and montages for review.
- **SciPy** (ndimage): cutting the alphabet-card pictures and the clothing prints out of their sheets (`tools/kf/alphabet_cards.py`).
- **NASA insignia** ("meatball", 1959, James Modarelli; public domain, US government work), from Wikimedia Commons
  `File:NASA_logo.svg`: the canonical decal on Jade's jacket (`layout/assets/art/logos/nasa_meatball.png`, 2026-11-26).
- **Fonts**: DejaVu Sans, Liberation Sans/Serif (book spines, alphabet letters, clock faces), Droid Sans Fallback
  (Shanghai calligraphy scrolls and calendar), drawn in code on canvases. The mv10 textbook spines (2026-11-27) also use
  the URW base-35 fonts (URW++ / Artifex, AGPL with font exception) P052, C059, Z003, Nimbus Sans, Nimbus Sans Narrow and
  Nimbus Roman, and Liberation Sans Narrow, as the system has them.
- **FFmpeg**: frame grabs from Jade's earlier film *Moongazing* for reference (the Sagan ring, 2026-11-26).

## Planned / in progress (move up once used)
- **Rapier** (`@dimforge/rapier3d-compat`): physics check that every held or resting object is supported.
  Also the clip check (`layout/engine/clipcheck.mjs`, 2026-11-26): no baked body passes through another body, a wall, a
  Also settles the loose lemons and rinds in the mv10 bowls (`layout/sets/mv10/settle.mjs`, 2026-11-26 late).
  window or furniture, joints within their limits, palms on walls; drives the IK pose and camera searches for AD_grab and
  WL_in (`layout/sets/attic88_day/grab_search.mjs`, `grab_camera.mjs`, `layout/sets/wall88/wl_search.mjs`).
- **BiRefNet** / **SAM 2**: matting options already written into `tools/ink/video.py`; not run yet.
- Video models for the motion step (plan steps 6-8): none chosen yet.

## Not credited (looked at, not used for the film)
- `bentwood_chair`: "Viennese Chair" by romasharf (Sketchfab, CC BY 4.0): downloaded for shanghai86 2026-11-27, NOT USED (Jade: dining chairs period-checked; replaced by modelled hardwood slat-back chairs). Drop unless used elsewhere.
- The many models in `tools/gen/catalog.py` (Seedance, Kling, Veo, FLUX, Gemini TTS, etc.) are a price catalogue,
  not things that ran. fal models were searched on 2026-11-26 (Meshy / Hyper3D rigging, Hunyuan Motion), not used.
