# Proof — handoff for the next session

## NEXT SESSION START HERE (2026-11-26, after round 6)

**State:** every round-6 answer is applied and committed. Jade's paste is saved verbatim in
work/decisions/JADE_R6_DECISIONS.md, and the brief is work/decisions/R6_BRIEF.md. Nothing is pushed. Jade's
plan: **paint next session** (r4 + r5 + r6 together). There is no new decision page; media/decisions.html still
holds round 6 (all answered).

Round 6, what changed:
- **market93:** the grandmother stands 20 cm further back from the cart, elbows by her sides, power grip at
  navel height, wrists in range. Shots: M1, M4b_pull, M5, M4c, WIDE.
- **attic88_day:** AD_trace's other fingers are in a moderate curl (`grabpose.js` TRACE_R); AD_grab shares the hand.
- **kitchen90:** jade7 now sits ON her folded left foot (sole up, knee forward), with the right leg hanging, as in
  reference photos. Chair and family are 5 cm closer to the table. All 8 night shots. (Arms: see 6b.)
- **mortongrove07:** the mirror is raised to glass 2.08-4.03 m, centred between the piano lid (~1.0 m) and the
  5.10 m wall top. MG_wide was re-framed (16 mm, tilted up; the keyboard is cut off at the bottom; Jade: fine). New reference
  view REF_east.
- **shanghai86 V1e:** Mama's hand WAS clipping (22 mm into the jamb, forearm through the folded door leaves). She
  now stands on the threshold (hand pose revised in 6b).
- **playground23:** the shuttle's middle is an open, padded cabin with two black bucket seats in tandem (Jade: fine). Jade is in socks. New reference view REF_cabin (do not paint).
- **First love's hair:** matched to the reference shade Jade asked for (the private details are in the lead's memory,
  not here): ~#3f342e, a dark, slightly warm brown with no
  red. FL_HAIR 0x2b2420 (v8 was 0x1f1915); closet02 lit-only FL_HAIR_LIT 0x1a181b (CL_ots samples #40342d).
  closet02, mv10 and mortongrove07 are re-rendered. **The v8 painter sheets in cast/first_love are darker than
  this:** at paint time, say "#3f342e dark, slightly warm brown" in the prompt, or make a v9 sheet first.
- Checks: holds pass (market 35/35, kitchen 8/8, mv10 308/308); clipcheck shows only failures already listed
  (mv10 32, kitchen day shots: Mama's wrists and clothes, closet).

Round 6b (Jade's follow-up notes on the same night, all applied):
- **kitchen90 arms:** jade7's forearms rest on the table and her elbows hang relaxed (from Pexels photos of kids doing
  homework). The writing hand rests on its little-finger side; she leans from the hips (12 deg at rest, 23-24 deg writing).
- **shanghai86:** Mama's hand rests on the jamb lining at shoulder height with the elbow down and the other hand softly
  curled. Little Jade's hands rest in her lap after tearing, and stay close in with bent elbows while tearing (from
  reference photos). Still off, and older than r6: in V1d_2 her right arm reaches 0.4 m straight out to the put-down spot.
  Fixing it means moving that spot (and the laid half in later shots) or moving her.
- **Eyes, engine-wide** (WL_eye looked cross-eyed): the irises were too big (64% of the eye opening) and sat
  off-centre toward the nose, and the eyeball pivot was 4 mm too far forward. In humanMesh.js eyeBall the pivot is now the
  true ball centre; the iris is 0.342 rad and the pupil 0.153; the iris axis is turned 8 deg outward; the drawn turn is
  scaled 0.72. In gaze.js EYE_YAW is 35 -> 30. Every set with faces is re-rendered.
- New rule (in memory and in work/decisions/AGENT_BRIEF.md): pose every everyday action from real reference photos.

**Open question for Jade (ask before painting shanghai86):** V1d_2, where little Jade reaches 0.4 m to the put-down
spot. Move her, or move the spot and the laid half in later shots?

**Paint notes for r6:** the eye fix changed every face guide, so paint from the current renders only. Prompt notes
per shot are in the r6 sections of work/r4/REPAINT_LIST.md (kitchen arms, the shuttle cabin, the mirror, Mama's hand).
Nothing was spent this session (free routes only). The working tree is clean apart from the stray
media/layout/mortongrove07/SW_t100_cam.png (don't commit it). The render and check recipe is in the superseded
section below, and it is still current.

**1. Paint r4 + r5 + r6.** The list is work/r4/REPAINT_LIST.md (r4, r5 and r6 sections; r6 adds the shots above).
Free Codex in tmux only, most-corrected sets first; the method is in "START HERE (updated the evening of
2026-11-26)" below. Re-comp CAP_X_sw after the X_sw repaint. Watch the Codex image limit (~100 images per 40
min). Don't fall back to paid generation without asking Jade.

**2. Optional engine work** (unchanged from the round-5 list below): widen the holdcheck hand, seated hips +5 mm,
the MG2 pinch, the pre-existing clips.

## (superseded) round-6 page notes, end of 2026-11-26 night


**State:** every round-5 answer is applied, every set is re-rendered on the r5 engine, and all of it is committed
locally (last commits 081f5bb, 8159192). Nothing is pushed. Nothing has been painted for r4 or r5.
- Tonight's log is "Session of 2026-11-26 (night)" near the end of this file. Jade's r5 paste is saved verbatim in
  work/decisions/JADE_R5_DECISIONS.md, and the agent brief/ownership map is work/decisions/R5_BRIEF.md.
- The working tree is clean apart from media/layout/mortongrove07/SW_t100_cam.png, a stray test render that no shot
  uses. Restore it with `git checkout` or ignore it; don't commit it.

**1. Jade answers the round-6 page.**
- The page is media/decisions.html: 13 cards, key proof-decisions-v7, source work/decisions/NEW_QUESTIONS_R6.md.
  The r5 page is backed up at work/decisions/decisions_r5_page_backup.html.
- Save her paste verbatim to work/decisions/JADE_R6_DECISIONS.md, then apply it.
- Most cards confirm r5 fixes. The ones with a real choice:
  - mg_ceiling_high: built at 5.10 m (~23 deg). The street-view 30 deg pitch would give 6.0 m, which rises above the
    two-storey wing's ridge.
  - b_glow: the screen glow now that QBasic is grey on blue.
  - k_fold_side: which foot jade7 sits on (built: on the folded left, right leg dangling).
  - sh_jamb: Mama's stiff arm on the Shanghai door jamb (V1e).
  - pg_shoes_jade: socks or sneakers at the playground (she wears the Rare Earth outfit).

**2. Optional engine work (before painting, if Jade wants it).**
- holdcheck's hand is thinner than the mesh hand (proximal 6-15 mm, palm 10-17 mm), so fingers can sit ~1 cm inside
  an object and still pass. Widen the hand.js capsules, or check against the mesh hand.
- Seated thighs are ~14 mm into chairs engine-wide: raise seated hip heights ~5 mm.
- MG2/MG2_end: the pinch hands are ~15 mm into the hoodie fold. Every fix tried exposed the Truth print; the
  fallback is to tell the painter to draw the hands on the cloth. Keep Truth at 0 (sweatshirt_test.mjs,
  cloth_contact.mjs).
- Pre-existing clips are still open: closet knees/wall/carpet; mv10 32 of 33 shots (couches, sandals, snacks, ladle
  7.6 mm); kitchen day shots (Mama's thumb wrists 63 deg past, thighs into the chair).
- Small: a speck of the praying worker remains in WL_in. tools/kf/handout.py has the r5 gap point (middle of the
  missing slot) but has not been re-run.

**3. Paint r4 + r5.**
- The list is work/r4/REPAINT_LIST.md (r4 and r5 sections). Free Codex in tmux only, most-corrected sets first; the
  method is in "START HERE (updated the evening of 2026-11-26)" below.
- Re-comp CAP_X_sw after the X_sw repaint (it still has the old tree sweatshirt).
- Watch the Codex image limit (~100 images per 40 min). Don't fall back to paid generation without asking Jade.

**Render and check recipe (per set S):**
1. `node layout/render.mjs --set S --exclude beam_`
2. `node layout/render.mjs --set S --exclude beam_ --modes form,contour,light --nojson`
3. `node layout/render.mjs --set S --prefix beam_ --modes flat --nojson`
4. clipcheck.mjs, holdcheck, check_bodies.mjs, then `python3 layout/gallery.py`, and commit (lead only, no push).

**Standing rules:** the repo is public and work/ stays private. Never name first love or show his face. Never write a
real street address. Real photos in inputs/ never go to image models (inputs/catchair_shuttle.png is gitignored and
look-only). Agents don't commit.

## START HERE (updated the evening of 2026-11-26)

**State.** Round-3 decisions are applied, and so are Jade's first 45 r3 keyframe answers
(`media/keyframes/r3/JADE_R3_REVIEW.md`), all as set fixes. The layout engine changed a lot today; the log is in
"Session of 2026-11-26" at the end of this file.
- **Bodies:** every figure is now a rigged MakeHuman body by default (`layout/assets/bodies/`,
  `engine/humanMesh.js`), with garments in the real costume colours, hair from the sheets and blank-faced strangers.
  First love has no face at all.
- **Gaze:** eyes are aimed at each figure's look target (`engine/gaze.js`).
- **Hands and holds:** wrists stay natural, there are grip templates, and a Rapier hold check passes 421/423.
- **Art and logos:** wall art and clothing logos are fixed textures (`layout/assets/art/`).
- **Props:** real downloaded prop models are coming (`layout/assets/props/`).
- **Repaint on hold:** NO r4 repaint has been run. Jade asked to hold it until she has answered the decision page,
  because many shots would otherwise be repainted twice.
- **Spend:** $33.72, unchanged today. Everything ran on the free Codex route.

**First thing: Jade pastes her answers.**
1. `Decisions (from media/decisions.html):` gives 42 round-4 cards (storage key `proof-decisions-v5`). The source
   list is `work/decisions/NEW_QUESTIONS_R4.md`; each card's context says what is built now.
   - Save the paste verbatim to `work/decisions/JADE_R4_DECISIONS.md`. Then log it here.
   - Each line is `- <card title>: <option> — <note>`. An untouched card means keep what's built: every built
     option is the recommendation, except voy_ring_time, mama_hair and art_sw, which have none.
   - Apply the answers with set agents, as this session did. Give each agent `work/decisions/AGENT_BRIEF.md` and, for
     set fixes, `work/decisions/R4_SET_BRIEF.md`.
   - Then rebuild the page: remove the answered cards, add the new questions and log the answers in its DONE list.
   - Cards whose answers change the guides:
     - Shanghai: sh_suite_colour, sh_railing_flat.
     - Morton Grove: mg_dining_ceiling, mg_piano_size, mg_picture, mg_fold.
     - Closet: cl_light, cl_futon, cl_cam_height.
     - Basement and kitchen: b_screen, b_program, b_chair, b_floppy, k_fittings.
     - Office, attic and wall: off_table, ad_grab_pose, wl_mama_pose, wl_count.
     - Mountain View: v3b_grip, si1_where.
     - Background art: all 11 art_* cards (each needs its canonical image in `layout/assets/art/` regenerated and the
       set re-rendered).
     - Cast: mama_hair (rebuild Mama's body hair in `layout/assets/bodies/make_bodies.py`), fl_A_fig1 (redraw
       turnaround figure 1).
   - Cards that change the plan or comp only: cliff, bud_br1, cl_caption, xsw_caption, voy_ring_time, voy_quote,
     shimmer, fl_part5.
2. `Keyframes r3 (from media/keyframes/r3/index.html):` gives the rest of her r3 review (59 of 104 cards not yet
   reviewed). Save it APPENDED to `media/keyframes/r3/JADE_R3_REVIEW.md` and fold the notes into the set fixes.
   Many of her r3 notes will be moot on the new bodies; she knows.
3. **Then repaint r4.** Everything is ready but nothing has run.
   - Re-render the touched sets with three commands. The default modes SKIP the painter guides, hence step 2:
     1. `node layout/render.mjs --set S --exclude beam_`
     2. `... --exclude beam_ --modes form,contour,light --nojson`
     3. `... --prefix beam_ --modes flat --nojson`
   - Run `python3 layout/gallery.py`.
   - Update `work/r4/REPAINT_LIST.md` (the shots per set and the per-shot prompt notes).
   - Run `media/keyframes/r4/<set>/_prompts/_run.sh` for each set. It uses free Codex only (`KF_SESSION=proof-kf4-<set>`,
     2 takes per shot) and stops at the plan limit.
     - The current list is 74 shots, 148 takes. That is more than Codex's ~100-image limit, so paint the most-corrected
       sets first (basement90, market93, shanghai86, wall88, kitchen90, office91, attic88_day) and continue after the
       reset.
   - The prompts are built from each shot's sidecar at paint time (`tools/kf/r4lib.py`), so they pick up the gaze
     targets and colours. The rules are in `media/keyframes/r4/_brief_r4.md`.
   - The review page is built by `python3 tools/kf/r4_page.py`, giving `media/keyframes/r4/index.html` (key
     `proof-kf-r4`).
   - Look at every take yourself before showing her. Count the paper-keyboard keys and check first love's face.

**Status of today's agents (all finished):**
- **Fix agent: DONE and committed.** POV head-hide keeps arms; the ponytail tuft and buns no longer poke through
  as ears; the B4/B5 mouth and chin points are read on the mesh face; BO1/BO2 camera az 150; the PC3a decal is off
  the sleeve; PC3b and K6 reframed; irises centred on the eyeball. All 11 sets were re-rendered. Still open: the AD_*
  specks (the top garment folding through itself at the shoulder blade in a deep reach), the ragged pushed-sleeve
  hem on Dad in B2, and the aunt's and grandmother's bun on a bob shell (needs a Blender hair rebuild). Extra r4
  repaints: BO1, BO2, PC3b, K6, B4, B5, and every back view of a half-ponytail or a bun.
- **Props agent:** phase 1 DONE (23 models: 7 Poly Haven CC0, 16 Objaverse CC BY 4.0, licences checked; `work/props_audit.md`, sheets `media/layout/_sheets/propstest_*.jpg`). Phase 1 was: downloads real CC0/CC-BY models (ladle, cups, bowls, juicer, appliances, cart...) to
  `layout/assets/props/`, with `layout/sets/_props.js` and `work/props_audit.md`. Phase 2 (NEXT SESSION, do it before re-rendering for r4): swap them into the sets
  and re-check holds; give the agent work/props_audit.md and layout/sets/_props.js. NOTE: the new ladle handle is a flat 10x5 mm strip, so re-solve `ladleGrip.js` and re-run holdcheck. Kept hand-built: punchbowl (redo as a lathe profile), canisters, basement PC/CRT, books, clipboard, crate, furniture, produce. Every model and its licence goes in `docs/credits_tools.md`.

**Known weak spots:**
- First love's hair still reads a little domed and cap-like in MG and closet.
- The MG2 cloth looks rag-like mid-turn. The pleat that hides Truth is fragile: after any sim change, re-run
  `node layout/sets/mortongrove07/sweatshirt_test.mjs` and check that the Truth-pixel counts are 0.
- MG2 and MG2_end fail the hold check (soft body).
- The friend's hair colour (0x9a7a52) is a guess.

**Jade's standing rules from today.** They are in `~/.claude/CLAUDE.md` and project memory; follow them for every
guide:
- rigged human bodies, never mannequins;
- realistic torsos and shoulders, in real clothing colours;
- eyes aimed at the target (a figure looks where it points);
- natural wrists, and objects supported by the hand;
- correct physics, checked with Rapier or Jolt, never hand-rolled;
- wall art and background objects as one canonical texture each;
- clothing logos: one version in every frame;
- common props from model libraries, not built from scratch;
- every model and tool listed in `docs/credits_tools.md` for the closing credits slide ("Animated by Opus 5.5 and a
  supporting cast of models: ...").

**Facts Jade gave today** (also in the dated log):
- First love's hair is 60-70% dark chocolate (`0x352219`).
- The childhood friend is 1.85 m, Ukrainian and Russian-speaking, with dark blond arm hair.
- Her basement top is a long-sleeved grey sweater.
- B4/B5: mouth closed, lips and chin on the wrist.
- PC5 (the dictionary) is dropped.
- M4c: Mama lifts her at 2:14.2, and M4b becomes the landing.
- K1: Dad whispers in Mama's ear.
- The wall cavity is coffin-narrow.
- The paper keyboard must be accurate.

**Private, never in the repo or pushed (the GitHub repo is PUBLIC):** the same as before, plus
`inputs/diagram_basement.png` and `inputs/refs_semicircletable/`.
- First love is a real person: never write his name anywhere. Never show or draw his face.
- Renders that show the IAS seal's Truth figure stay in gitignored `work/sweatshirt/`.

**Git:** `main`. Today's commits are LOCAL ONLY (not pushed since 71dc2bc). They include 21 MB of body GLBs and a
3.2 MB vendored Jolt (MIT); check with Jade before pushing.

**How Jade works:** delegate to subagents and relay conclusions. Log every direction she gives, as it happens, in the
dated section at the end. Look at renders and paintings yourself. Never invent facts about her life without flagging
them.

## Previous START HERE (morning of 2026-11-26), kept for reference


**State:** All three rounds of Jade's answers so far are applied: decision-page rounds 1 and 2, plus her keyframes r2
review. Logs are in the dated sections at the end of this file, the last being "Session of 2026-11-25 (late night)".
The overnight r3 repaint is done for all 11 sets: 104 cards (95 shots + 9 plates, 10 shots now growth or neuron
footage), with 3 marked weak (V1d_8, V1h, V3_nailed). The review page is `media/keyframes/r3/index.html`, built by
`python3 tools/kf/r3_page.py`. Keyframes are gitignored and stay local. Everything else is committed on `main` and
pushed (last commit 62ae8c5); the working tree was clean at handoff.

**First thing: Jade pastes one or both answer blocks.**
1. `Keyframes r3 (from media/keyframes/r3/index.html):` gives one line per card, `- <id>: Good | Redo | Wrong
   staging — <note>`.
   - Save the paste verbatim to `media/keyframes/r3/JADE_R3_REVIEW.md` first, then log it here.
   - Wrong staging: fix the set in `layout/sets/<set>/`, re-render, then repaint.
   - Redo: repaint from the current guides.
   - Next round goes to `media/keyframes/r4/`. Copy `_brief_r3.md` to `_brief_r4.md` and `r3_page.py` to `r4_page.py`
     (new localStorage key), and carry the shots she marks Good.
   - Paint with `tools/kf/kf.py --route auto`, setting `KF_SESSION=proof-kf4-<set>` and a `PROOF_CAP` agreed with Jade.
   - Guides: `node layout/render.mjs --set <set> --exclude beam_ --modes form,contour,light --nojson`. Give each
     prompt one explicit framing sentence. Form tints are codes: name real colours in the prompt.
2. `Decisions (from media/decisions.html):` covers the 30 round-3 cards (storage key `proof-decisions-v3`; the source
   list is `work/round3_questions.md`).
   - Each line is `- <card title>: <option> — <note>`. Untouched cards mean keep current.
   - Apply the answers, then remove answered cards and add new questions, so the page stays the single list of open
     decisions.
   - Fold in the 34 painter questions on the r3 page if Jade doesn't answer them there.

**Biggest open items (raise them if Jade doesn't):**
- **First love's hair paints as a bowl/mushroom in every take** (closet, Morton Grove, whisper, V3_nailed). The
  painters copy the sheets, so redo `cast/first_love/fl_B_backhead_neck_v4` and `fl_G_ots_hair_v4` BEFORE repainting
  any shot of him.
  - What the hair should be: a top half with a distinct step over a lower part buzzed then grown out ~6 months. The
    top must not have a level rim.
  - Zoom-check every output for his face.
- **IAS seal:** the garment is a white hoodie with a blue filled-disc chest print, ~40% of the front width.
  - The `fl_H` sheet was blocked twice by moderation because the real seal's Truth is nude.
  - My recommendation: the model paints a plain blue disc, and the real seal is composited in code at comp time,
    like the toner labels. Waiting on Jade.
  - Approved refs (copies only): `work/ias/`.
- **B4/B5 (basement):** her tongue is still out, close to the wrist. Jade wanted it pretended; try a closed mouth with
  the paw near her lips.
- **SI1 (mv10):** the poi trail paints as a gold ring round her head (against KEYFRAMES 6.6).
- **V1h (shanghai86):** steam in the guides reads as a stick in a mug. Fix the guide, not only the prompt.
- **mv10:** NASA lettering is legible in close shots; C2b, she holds the cup.
- **Footage speeds:** the growth footage runs 3.7-7.2x in its slots (footage s = 0.9387 x karaoke s). Ask Jade if
  that's OK.
- **BR1 times:** where the page says "Times differ", trust `media/keyframes/r3/footage_slots.json` over the sets'
  picks.json.
- **BO2:** Jade's r2 note is cut off at "this part should be paired with…". Ask her to finish it.
- **Office at age 10:** should the whole office be at 10? Is the new FE_out/FE_thumbs corridor beat right to the poem,
  and whose hands push her cheeks?
- **Small TODOs:**
  - Refresh `layout/sets/market93/artichoke_plate_count.json`: run `spirals.py artichoke --data
    data/artichoke_arms.json` without `NO_MARKET_COUNT`.
  - `tools/kf/r2_page.py` references the deleted stills t11.00/t16.90.
  - The basement sheets conflict with the brief: the lj07 sheets say bare feet and Dad v5 says shoes; the brief's
    socks and slippers win.

**Housekeeping:**
- Codex's plan limit was hit at ~01:00 on 2026-11-26. `work/kf_logs/CODEX_LIMIT_HIT` still exists: delete it once
  Codex works again so `--route auto` goes back to free.
- Spend is $33.72 (`python3 tools/gen/spend.py | tail -1`). The overnight cap was $70, agreed for that run only.
- Already public from before 2026-11-25: `inputs/refs_chaosmonkey/source_refs/` (real photos) and
  `inputs/refs_devon_market/` (web photos). Jade was told; there's no answer yet on removing them.

**Loose ends (not decisions):**
- `analysis/m2sm/remap.py` mangles times that are followed by ':'.
- The shanghai86 V1g fringe stands off her forehead like a plank (`layout/engine/mannequin.js`).
- `inputs/refs_house/interior_plan.png` draws mv10's console as a circle.
- The current sheets:
  - first love v4: `fl_B_backhead_neck_v4` is the hair anchor, and the hair is wrong as above
  - Dad: `cast/dad/*_v5_likeness*`
  - Jade's housewarming outfit: `cast/jade_27/j27_costume_housewarming_v1.jpg`

**How Jade works (keep doing this):**
- Delegate to subagents and relay conclusions.
- Log every direction Jade gives in a new dated section at the end of this file as it happens.
- Look at renders and paintings yourself before reporting.
- Never invent facts about Jade's life without flagging them.
- Shared artichoke geometry: run `artichoke_spec.mjs`, then the plate, then the market render.

**Private, never in the repo or pushed (the GitHub repo is PUBLIC):**
- First love is a real person. His identity is only in Claude's local memory: never write his name in any file,
  prompt or commit.
- His FACE is never shown or drawn: back of head, over the shoulder, ear and jaw from behind only.
- Gitignored, never push: `inputs/family_photos/`, `inputs/refs_house/`, `inputs/refs_shanghai/`,
  `inputs/refs_mortongrove/`, `inputs/refs_ias/`, `inputs/refs_closet.png`, `inputs/ref_artichoke.png`,
  `media/keyframes/`, `docs/poem_digest.md`, `cast/first_love/_prompts/*/takes/`, `cast/first_love/_superseded/fl_H_*`.
- Only generated sheets go to image models. The one exception, approved by Jade on 2026-11-25: the IAS seal image and
  the chin-down hoodie crop in `work/ias/`.

**Git:** `main`, pushed to `origin` (github.com/jadeqwang/proof).

## Earlier handoff (2026-11-22)

Written 2026-11-22. Read this, then `STATUS.md` (what exists, known gaps, and the full list of decisions waiting on Jade), then `Proof — Music Video Plan.md`.

## Where things stand

The film does not exist yet. What exists is the groundwork for the plan's "Order of work" steps 1, 2 and 5:

| Step in the plan | State |
|---|---|
| 1. Lock the song map | `analysis/v3/song_map.md` is current for `inputs/Proof.wav` (4:38.4). The ear checks are still open. |
| 2. Build the sets | Ten three.js sets, 99 cameras, rendered, with beam masks. Blockout quality: mannequins, mitt hands. |
| 3. Animatic | Not started. |
| 4. Look test (attic beam) | Not started. |
| 5. Cast | Sheets generated for every character. None reviewed by Jade yet. |
| 6-8. Stills, motion, layers, sung shots, edit | Not started. |

**The plan doc is out of date against the song.** It was written for the v2 render. In v3 the vocalise after chorus 2 is gone, the outro's first line starts over the band so the 4:05 cliff falls mid-line, and the drum coda is one hit plus about 4.5 bars. Jade has been asked whether to revise the plan here or take it back to the session it was written in, and has not answered. Do not edit the plan without that answer. Details are in `STATUS.md` and section 6 of the v3 map.

## Where to look

- **Renders, in a browser:** open `media/layout/index.html`. Regenerate it after any re-render with `python3 layout/gallery.py`.
- **Sets:** `layout/sets/<set>/` (`layout.js` dimensions and lights, `build.js`, `shots.js` camera table, `NOTES.md` assumptions). Shared: `layout/sets/_cast.js` (heights, see `layout/CAST.md`), `_beam.js` (masks), `_sheet.sh`. Engine docs: `layout/README.md`, `layout/NOTES.md`.
- **Render a set:** from the repo root, `node layout/render.mjs --set <set>`; masks with `--prefix beam_ --modes flat --nojson`. It depends on three.js, playwright-core and Chrome at paths outside this repo (listed in `layout/README.md`).
- **Character sheets:** `cast/<who>/`, each image with a `.txt` sidecar holding its prompt and references. `cast/_tools/ljgen.py` is one agent's generator script; `cast/_tools/little_jade_lineup_3_5_7_10.jpg` is the age line-up.
- **Canon and references:** `inputs/refs_chaosmonkey/CANON.md` and the v3 sheets beside it.

## How the work was done

- **Image generation** goes through Codex's built-in image generation, run headless inside a tmux session: `codex exec -s workspace-write --skip-git-repo-check "<prompt>" -i <reference images> < /dev/null`. It costs nothing per call and returns 1672x941. Use a uniquely named tmux session and leave other sessions alone.
- **Only generated sheets may be sent to an outside service.** Never anything from `inputs/refs_chaosmonkey/source_refs/` or `/home/jade/Documents/character sheets/`, which contain real photos.
- **Delegation:** Jade prefers work handed to subagents with only conclusions relayed. Agents writing sets in parallel were kept to their own `layout/sets/<set>/` directory and told not to edit `layout/engine/`.
- **`layout/` is a copy** of `/home/jade/Documents/chaosmonkey-video/layout`, taken because that repo had uncommitted engine work. The copy has since diverged: left-hand fix (`handFrame()` in `engine/mannequin.js` and `body.js`), a `spec.costume` field, one line in `engine/render.js` for the mask shader, and `--exclude` in `render.mjs`. Nothing has been ported back, and that repo must not be edited without asking. `layout/sets/attic88/` is the original night attic and is kept unmodified.

## Session of 2026-11-22 (evening): handout grid and the paper keys

Jade gave four directions in this session. All are done unless marked.

- **The school office handout is 7 faces to a row, with one row of 6, every row centred.** Five rows, 34 faces, the fourth row short. Numbers in `layout/sets/office91/layout.js` (`HANDOUT`, `rowCount`, `cell`). Because the short row is centred, the missing width is split between its two ends; `GAP` is where a seventh face would follow, at the end she reads to. The 10 extra labels are placeholders like the rest.
- **She points at the last face in the row of 6** (`JADE_TIP`), not at the empty space. The adult's finger lands on the same face (`SW_TIP`) and reads ANXIOUS. That the adult lands on the same face is Claude's reading of Jade's note, flagged to Jade and not yet confirmed. In `BO2` the adult's finger covers most of that face and her fingertip; the camera may want a nudge.
- **A new clip: she unfolds the paper piano keys.** It is in the plan's 0:05 row: her hands unfold the printout like a map and smooth it flat before the taps. Jade's memory of the object: regular printer paper (A4 or Letter), printed, taped together, folded like a map. `attic88_day`'s `KEYS` is already two A4 sheets landscape end to end. **Not built:** the unfolding camera, the tape seam and the fold creases, which should stay visible in every later keys shot.
- **The plan was edited** in three places, each at Jade's direct request: the 0:05 row, the 1:34 row, and the risks and open-question entries for the printout. The wider v3 revision of the plan is still waiting on Jade, as below.

Re-rendered: all of `office91`, its masks, its contact sheets, and the gallery. Looked at: `H1` and `BO1`/`BO2` flat renders only.

**Rendering gotcha found:** `node layout/render.mjs --set <set>` with no filter also renders every `beam_` twin in all five modes and writes sidecars for them, about 120 stray files per set. Use `--exclude beam_` for the normal pass, then the mask pass with `--prefix beam_ --modes flat --nojson`.

## Git

- Remote `origin` is `github.com/jadeqwang/proof`, **public**.
- Pushed: through `1b223b7` (plan, song maps v2 and v3, audio).
- **Local only:** the commits after it, holding `cast/`, `layout/`, `media/`, `STATUS.md`, this file. Jade was asked whether these should go to the public repo and has not answered. A plain `git push` would publish them, so do not push until Jade says so.
- Deliberately untracked and excluded from the public repo by Jade: `inputs/art style inspo/`, `inputs/edits/`.

## Suggested next steps, in order

1. **Get Jade's answers** to the list in `STATUS.md` ("Waiting on Jade"). Three of them gate other work: the plan revision for v3, Dad's age, and first love's design. Changing either character means regenerating that character's whole sheet set from a new anchor.
2. **Look at the line renders.** After the integration pass only flat renders and masks were inspected; the line renders are what the image model will be given. The gallery makes this quick.
3. **Fix the staging problems already found:** the kitchen thumbs meet under the mouth and not on the cheeks (`kitchen90` K5); the wall's blade of light misses her mouth by 2.8 cm (`wall88`); the child's face is out of the sun in the kitchen outro; the grandmother is missing from the tight grab (`market93` M4); the forearm-grab frames in attic and market are mirror images.
4. **Animatic** (plan step 3): one line render per shot, cut to `inputs/Proof.wav` at v3 timings. This needs the plan's tail 2, outro and coda rows settled first.
5. **Look test on the attic beam** (plan step 4), using `attic88_day` AD_mote and its mask.

## Things that are easy to get wrong

- Times in the plan's Structure table are v2 times. Shot labels in the sets were moved to v3 for the outro and coda only.
- A beam mask that is all white is not a bug in the eye-line shots that look down into the light; use the `__surf` twin there, or accept that the whole frame is lit.
- Clothing, hair, the playground family, the kitchen's pendant lamp, the handout's 33 other labels and several room layouts were invented by agents where the plan was silent. Each set's `NOTES.md` and each sheet's sidecar says what was assumed. Treat them as proposals until Jade confirms.

## Session of 2026-11-22 (night): sheets, look test, keyframes

Jade asked for deep thought on the vision, character sheets and keyframes, then stepped away. Nothing from this
session has been seen or approved by her. Nothing was committed.

- **Start with the review page:** open `media/keyframes/index.html`. Then `docs/KEYFRAMES.md` (the look made
  unambiguous in section 1; inventory and problems in section 4; nine vision proposals in section 6).
- **The plan's steps 4 to 6 now have a first pass:** the look test is done (light as bare paper works straight from
  the image model and holds in comp), six new sheets exist (Mama at rest and her hands, the five-year-old's acting and
  poses, Dad at 37, a family line-up, the childhood friend), and 72 shots have a picked still, each composited onto
  one shared sheet with motes, gold pencil, toner labels and headers from code.
- **To paint more:** `docs/KEYFRAME_BRIEF.md` is the brief the agents worked from; `tools/kf/kf.py` generates one
  image with a sidecar (Codex in tmux session `proof-kf`, or `--route gpt2` on Cloudflare); `tools/kf/comp_all.py`
  composites every pick; `tools/kf/gallery.py` rebuilds the page.
- **Proposals that change the plan** (section 6 of `docs/KEYFRAMES.md`), each already visible in a frame: the
  expression she offers between the two whispers; the closet lit from behind him so her face is in the light; the
  coda as two backlit profiles plus her own reflection; faces drawn for people whose faces she has learned; the
  five-year-old humming at the paper keys; gold never as a band round her head.
- **Sets that fought the paintings:** `playground23` (a different room from the poem), `closet02` (light on the hands,
  not her face), `basement90` B1-B3 (she points from the chair; the poem has her hop off), `office91` (no stack of
  handouts), `market93` (artichoke and romanesco meshes unusable as guides), `wall88` (blade mirrored against the
  attic beam). Each folder's `NOTES.md` has the detail. The beam masks do not register with any painting.
- **Codex's plan limit** was hit at 21:36 after about 100 images in forty minutes; it resets about four hours later.
- **Do not push** `docs/poem_digest.md` (long verbatim quotes from the poems) or `media/keyframes/` without asking.

## Session of 2026-11-25: Jade's facts about the Mountain View room (in progress)

- **The bookshelf** (mv10): one IKEA Expedit 5x5 in espresso (square cubes), books in every other cube. LEFT half
  art and literature; RIGHT half science fiction, textbooks (Fundamental Neuroscience, Principles of Neural Science,
  Nonlinear Dynamics and Chaos, the complete Feynman Lectures) and popular science (The Dragons of Eden, A Short
  History of Nearly Everything, etc.). This flips the agent's guess (truth was left) and replaces the wall-length
  two-case shelf. The other cubes held art objects: candles, a ceramic polar bear, figurines of open-source
  mascots. Being rebuilt by a subagent.
- **The house**: the housewarming was at 345B View St., Mountain View CA. A subagent is looking for an online model,
  floor plan or footprint to stage from. Anything found goes in `inputs/refs_house/`, untracked (the repo is public).
- **House research result** (`inputs/refs_house/README.md`): no floor plan, photos or 3D model online; OSM and city
  footprints only. 345B is an 11.9 x 9.9 m single-storey rectangle, long axis NNE-SSW, 43 m back from View St at the
  end of a shared driveway that reaches its WNW side; 345A sits between it and the street. A west yard (the set's
  dusk-sun assumption) looks unlikely: any yard is probably on the ESE side. Unconfirmed; ask Jade.
- **Printable layout sheets** for Jade to draw on by hand (site plan, 345B footprint at scale, Expedit elevation,
  furniture cut-outs, registration squares for digitising the photo): being made into `inputs/refs_house/print/`.
- **Candles on the shelf were not lit** (Jade).
- **Dad aged back to late 30s, a little lighter**: Jade pasted a real photo of their dad. It is not on disk; Jade was
  asked to save it to `inputs/family_photos/` (gitignored) and to confirm that it may go to the image model, since
  the standing rule is that real photos never leave the machine.
- **Dad photo approved**: Jade saved it as `inputs/family_photos/Pasted image.png` and approved sending that one
  photo to the image model (Codex). An agent is making realistic age-37 versions in `inputs/family_photos/dad_age37/`
  (same glasses / early-90s frames / no glasses / suit as source), tmux session `proof-dad37`.
- **Shanghai 1986 (`shanghai86`)**: Jade says it was at 253 Wu Yuan Lu (五原路253号), French Concession, and the scene
  was in the LIVING ROOM, which had a balcony, not a bedroom. The set's bedroom (bed, mosquito net, casement window)
  is wrong. Research into the building is going into `inputs/refs_shanghai/` (gitignored); rebuild after that.
- **Dad at 37: done, awaiting Jade's pick.** `inputs/family_photos/dad_age37/compare.jpg` (source + 4 picks). Best
  likeness is v4 (suit, same framing); v1-v3 read slightly rounder-eyed than him. Codex also keeps copies under
  `~/.codex/generated_images/`. Next: rebuild Dad's character sheets from the chosen face (the "Dad's age" question).
- **Mountain View layout sheets: done.** `inputs/refs_house/print/house_layout_sheets.pdf` (5 pages; site 1:200,
  footprint 1:60 x2, Expedit 1:10 with cubes A1-E5, cut-outs 1:60). `registration.json` holds the corner-square
  positions and page-mm -> house-metre transforms for digitising Jade's photographed drawing. Rebuild with
  `.venv/bin/python -I inputs/refs_house/print/make_sheets.py`. The OSM driveway stops ~4 m short of the house.
- **Shanghai living room, from Jade:** 3rd floor, the family had the entire floor. Balcony through French windows.
  No bed. A three-seat cushioned couch pushed against one wall, a few armchairs, a wicker lounge chair, a coffee
  table. French doors lead into the living room from the hallway (that is Mother's doorway).
- **Shanghai staging, from Jade:** couch against a SIDE wall, coffee table near it. She sat at the spot equidistant
  from the couch, an armchair and the coffee table. A large sheet of old-style Chinese toilet paper (草纸, a big
  rectangle) lay on the coffee table, with hand-torn halves, quarters ... sixteenths around: everything divided down
  by powers of 2, torn by a 3-year-old (ragged edges, not cut). Replaces the set's 19 cm square tissue on the floor.
  Sheet size (Jade): smaller than Letter, a little bigger than half-Letter (14 x 21.6 cm): use ~16 x 23 cm unless
  research says otherwise. She brought a STACK of sheets to the table, so the table holds a stack plus torn pieces.
  The halving went far past 16ths: as small as her fingers could manage. From a 16 x 23 cm sheet, 1/256 is about
  1.0 x 1.4 cm and 1/512 about 0.7 x 1.0 cm, so the smallest pieces are roughly fingertip-sized confetti (8-9 halvings).
  Also on the coffee table: some steaming mugs of green tea (the steam is visible in the sunbeam).
- **mv10 Expedit: built and rendered.** Shelf 185 cm square, centred x -0.45 (`SH_CX`), checkerboard, 12 object cubes
  (unlit candles, polar bear, Tux x2, BSD daemon, GNU, Firefox x2, PostgreSQL elephant: agent's picks). Her mark moved
  to x 0.55 (shelf's right end); lamps at x 1.15 / 1.93 / 2.71. All three head shadows land on the truth half; bodies
  spill (shadow 3 is 30% on art, shadow 1 is 21% on bare wall). First love now on her right; guests B1/B2/E1 moved.
  Known issues in `layout/sets/mv10/NOTES.md` (BR4b head shadow line vs flat). The whole room may change once Jade
  draws the real house plan.
- **Mannequins (Jade):** must be much more detailed and articulated before anything goes to the image models: fully
  articulated fingers (3 phalanges each, real thumb) and arms that join the torso properly (shoulder girdle). Jade
  could see the crude ones caused problems in the stills. An agent is upgrading `layout/engine/mannequin.js` /
  `body.js` keeping the pose API backward compatible, then re-rendering all ten sets. Progress in `layout/NOTES.md`.
  The 72 keyframes in `media/keyframes/` were painted from the OLD guides and should be redone from the new renders.
- **Dad, Jade's pick:** v2 (early-1990s frames) is close; his real glasses were more aviator-ish, and he should be
  lighter still. One more round (v5) is being made; after that, rebuild Dad's character sheets from it.
  v5 done: `inputs/family_photos/dad_age37/compare2.jpg`. `dad37_v5_t1.jpg` (lighter, best likeness) and
  `dad37_v5_t3.jpg` (lightest). Gold double-bridge aviators. Awaiting Jade's pick.
- **Dad likeness approved: `dad37_v5_t1.jpg`** (Jade: "looks right"). Settles "Dad's age". An agent is rebuilding all
  Dad sheets (A, B, C, D, H, R + family line-up) from it in tmux `proof-dad-sheets`; old sheets go to
  `cast/dad/_superseded/`. These are a real person's likeness: never push `cast/dad/` without Jade's say.
- **Jade: the dad photo is from his public Twitter profile; the Dad likeness sheets are fine to push.** (This covers
  the Dad sheets only, not the wider question of pushing `cast/`, `layout/`, `media/`.)
- **Jade expects an interior room layout for 345B** reconstructed from listing imagery (Zillow, MLS, etc.), as in
  Blender walkthroughs built from listing photos. The first search was blocked (403) on automated fetch; a second
  agent through Jade's own Chrome was refused by the permission check (it read as getting past
  the sites' bot blocks). Waiting on Jade: either Jade saves listing photos/links into `inputs/refs_house/listing/`,
  or explicitly approves browsing the listings in Chrome.
- **253 Wuyuan Rd = 协发公寓 Xiefa Apartments ("Yafa Court")**, Robert Fan (范文照), 1933-34, modernist block, one flat
  per floor per stair. Original 1934 drawings found (Xuhui housing bureau page, URLs in `inputs/refs_shanghai/README.md`).
  Living room ~5.0 x 6.1 m, opens north to a dining room, south onto a 5.5 x 1.25 m balcony through six full-height
  French windows (~3.6 m); French doors from the hallway in the side wall; ceiling ~3.0-3.1 m; faces 13 deg E of S.
  Winter afternoon sun (Nov-Feb, 14-16h) slants in from the SW and climbs the hallway wall in the east flat.
  Open for Jade: east or west flat; Chinese-count 三楼 or British 3rd floor; month of the scene.
  Rebuild of `shanghai86` started with defaults: east flat, 三楼, mid-December ~15:00.
- **Shanghai answers (Jade):** the EAST flat (the one 俞振飞 lived in); 3rd floor with ground = 1st (三楼). Time of
  year not remembered: mid-December ~15:00 is a staging choice.
- **345B Airbnb (Jade hosted it 2011-2013):** the listing photos would show the interior. Redfin has only one photo of
  345A. Not found in Google Drive; Gmail connector not connected; blind web search finds no matching listing. Needs
  the listing ID (old Airbnb emails / Airbnb account / Airbnb data export), then try the Wayback Machine.
- **Dad sheets rebuilt** from `dad37_v5_t1.jpg` (9 Codex images): `cast/dad/dad_{A,B,C,D,H,R}_*_v5_likeness.jpg`,
  new line-up `cast/_family/family_rest_lineup_v5_dadlikeness.jpg`. Old ones in `_superseded/`. Hair drifts slightly
  curlier than the likeness. Dad's keyframes in `media/keyframes/` used the old face and need redoing.
  `tools/kf/gallery.py` SHEETS now point at the new R sheet and line-up (gallery not regenerated).
- **shanghai86 rebuilt** as the Xiefa east-flat living room (5.0 x 6.1 x 3.05 m, dining room through the north
  opening, six French windows + balcony south, glazed hall doors with transom in the east wall). Sun 1986-12-15 15:00:
  elev 19.0, az 225.9 (`SCENE` in layout.js recomputes; `FLAT='west'` mirrors). Beam lights her face, the table's
  SE half, the mugs and steam; the paper stack is in shade; the light on the east wall stops 0.16 m short of Mother's
  door. Couch put on the EAST wall (beside the hall doors) because on the west wall the honest sun misses couch,
  table and her: needs Jade's confirmation, as does the door swing. New `paper.js` (torn power-of-two pieces).
  Needs re-render after the mannequin engine upgrade. Refs: `media/layout/shanghai86/REF_plan_label.png`, `REF_wide_flat.png`.
- **Articulated mannequin: done** (`layout/engine/hand.js`, `anatomy.js`; API in `layout/README.md` "Hands"; test set
  `layout/sets/mtest/`, sheets `media/layout/_sheets/mtest_*`). All ten sets re-rendered (shanghai86 re-rendered again
  after its rebuild finished); gallery rebuilt. Staging fixes: kitchen90 K5 thumbs on cheeks via `tip`, K4 pencil in
  the pinch, mv10 guests now hold real cups, market93 Mama's hand closes round the forearm. Weak spot seen:
  shanghai86 V1b (uncle's cupped hands from above): curled fingers merge into one slab in line mode and the thighs
  read as pointed wedges. Not yet fixed.
- **Shanghai corrections (Jade):** hallway French doors are a double-wide pair OPPOSITE the balcony (north wall), not
  in the side wall; the couch is on the other side wall (west) with some space from the corner; the armchair beside it
  keeps a normal armrest-to-armrest gap (no blocked seats). The 1934 plan's north dining opening conflicts: Jade wins.
  Time of day/year re-chosen so the beam lights her and points at the north doors. Being redone by the Shanghai agent.
- **Jade's 345B drawings are in** (`inputs/refs_house/PXL_20261125_2059*.jpg`, plus a Google Maps aerial screenshot
  `inputs/refs_house/Pasted image.png`). Site plan (page 1): rooms (living room WNW-SSW, front door on the WNW wall,
  bathroom + tea room WNW-NNE, kitchen ESE-SSW, laundry + bathroom in the core, bedroom ESE-NNE); the YARD IS ESE
  (patio + stairs off the kitchen, strawberry bed, barrel of mint, grass, clothesline, giant lemon tree by the NNE
  fence at the far end, neighbour's grapefruit tree spilling over the NNE wood fence, garden hose, fence at the ESE
  end). Page 2: only the living-room + kitchen half, drawn freely on the grid (NOT at the printed 1:60): white modern
  couch + chaise, mosaic coffee table, round glass-top table, the 5x5 Expedit against a partition wall facing the
  living room, a 2x2 Expedit at the wall's open end (A PRINTER SITS ON TOP OF IT), pale IKEA dining table with pale
  benches tucked in, French doors to the yard, L of kitchen counters. mv10 is being rebuilt from these.
- **Jade: the three paper lamps were an agent's invention** (the plan's "three lamps, three near-identical shadows"
  beat has no real source). Kept only as a flagged placeholder in mv10. **Housewarming: likely fall 2010.**
- **Jade: DROP the three-shadows image.** Plan edited at Jade's direct request (bridge row: removed "'From inside':
  three lamps, three near-identical shadows of her on the spines"). The "From inside" line now has no image of its own.
  mv10 removes the lamps and shadow shots. Coffee table is a NOGUCHI-style table (glass rounded-triangle top, black
  base), not "mosaic". Lighting: ceiling lights; the party started in late-afternoon daylight; fire spinning later at
  dusk/dark. Exact fall-2010 date unknown.
- **Jade likes the karaoke's scientific plates** (`media/footage/artichoke/` botanical engraving, 140 s growth;
  `media/footage/frost/` "FORMS OF WATER. PLATE XIV." phase-field frost, 140 s) and wants room for them in the film.
  Placements proposed to Jade (frost: piano break / 1:37 match cut / tail 2 frost->neuron; artichoke: verse 2a and
  the 2:26-2:45 interlude count; optional new neuron plate). Waiting on Jade's pick; plan not edited.
- **New plate requested (Jade): neuroscience, after historical neuron illustrations** (Cajal/Golgi). Being built in
  `media/footage/neuron/` as the frost plate's sibling (same paper, plate mark, IM FELL type; code-rendered; real
  NeuroMorpho morphology preferred), for Tail 2's frost -> neuron turn and as standalone footage.
- **Plates placed (Jade: "sped up and played in places where it makes sense")** and **bookshelf pan** (Jade: the
  bridge lines "Beauty on this side, truth by reference, science fiction shelved with truth" pan across the Expedit,
  beauty half to truth half). Plan edited at Jade's direct request in rows 0:59, 1:37, 2:26, 2:36, 2:45, 3:53. The
  mv10 agent is adding `BRpan_*` shots.
- **The shelf is an IAS reference (Jade):** the Institute for Advanced Study's motto/seal "Truth and Beauty" (Keats).
  First love gave her an IAS sweatshirt (beauty and truth); Jade suggests showing it. Note: per IAS's own essay on the
  seal (https://www.ias.edu/ideas/2012/lavin-truth-and-beauty) TRUTH is on the left, BEAUTY on the right, the mirror of
  Jade's shelf (beauty left, truth right). Asked Jade whether that mirroring is meaningful ("from inside") and when
  he gave the sweatshirt / where she wears it.
- **Sweatshirt: Jade picks option 3, the moment he gives it to her.** Grad school: she was at Northwestern, he had
  transferred from Harvard to Princeton. Place in the song, setting, and the sweatshirt's look still to settle.
- **First love's design is wrong (Jade):** the sheets read too much like the childhood friend. He has DARK BROWN,
  RELATIVELY STRAIGHT hair (sheets have shaggy loose waves/curls). Ethnicity/build/face not yet confirmed by Jade
  (sheets assume white American, lean, tall). Regenerate `cast/first_love/` once answered.
- **shanghai86 corrected** (Jade's layout): double hall doors centred in the north wall; dining opening moved to the
  east wall (conflicts with the 1934 drawing, flagged); couch on the west wall 0.45 m off the window corner; armchair
  in an L at its north end, 0.35 m armrest gap; her spot equidistant (gaps ~0.38 m). Only WINTER MORNING suns light
  this layout (`sweep.mjs`: 170 of 960 pass, all 08:30-10:30 Dec/Jan): chosen 1986-12-21 10:20, elev 31, az 155.
  Beam lights couch, whole table, her face, steam; ends 2.6 m short of Mother. V1b re-staged (lower camera, crease
  0.12): hands legible but busy. Open for Jade: winter morning OK? door swing; dining room location; TV placement.
- **First love is a real person** (identity known to Jade; deliberately NOT recorded in the repo). Part of why his face
  is never shown. His hair style hasn't changed over the years: dark brown, relatively straight. No photo of him is
  to be committed.
- **The sweatshirt scene (Jade):** in the house in Morton Grove, IL (Jade commuted from there to Northwestern in
  Evanston). She sits on a FLORAL couch near some windows; over-the-shoulder shot of him (only his hair) as he hands
  her the sweatshirt: WHITE, with the IAS seal in DARK BLUE. It goes on "Beauty on this side", right before the cut to
  the bookshelf pan. Plan bridge row edited at Jade's direct request. New small set to build.
- **First love's hair (Jade):** dark brown, relatively straight, "curtain bangs-ish, like present-day male K-pop
  idols"; same style at every age. Sheets A/B/E being regenerated (+ new over-the-shoulder hair sheet G); the face
  sheet F retired (real person, face never drawn). Build and skin tone remain unconfirmed agent assumptions.
- **First love's build (Jade):** about 5'10" (now 1.78 m in `_cast.js`), lean, not tall; forearm hair more visible
  than typical; hands and feet much smaller than typical for his height, the SAME size as Jade's (and Jade's hands
  are larger than typical for her height); same shoe size. In most relevant scenes he wears Birkenstock-type sandals
  made by Naot. `_cast.js` now has kinds `adultJade19`, `adultJade27`, `adultFirstLove` (hand 18.3 cm, foot 24.8 cm,
  absolute sizes assumed); `engine/body.js` and `mannequin.js` treat `adult*` kinds as adults. closet02 re-rendered;
  other sets using jade19/jade27/firstLove* need a re-render once mv10 and mortongrove07 finish.
  Updated from Jade: US women's 8.5 shoes (foot 25.1 cm) and a reach of an octave + 3 (read as a tenth) -> hand
  18.7 cm. `_cast.js` JADE_HAND 0.187, JADE_FOOT 0.251; first love shares both.
- **Shanghai round 3 (Jade):** room much wider (1.5-2x, i.e. ~7.5-10 m along the windows: living + dining likely side
  by side on the facade, as the 1934 plan text says both open onto the balcony); TV and cabinet in the north-EAST
  corner (hallway side, opposite the couch); north/hall wall lined with bookshelf cabinets on both sides of the double
  doors all the way across; calligraphy scrolls on the west wall; no framed photos; one large framed traditional
  Chinese artwork. Sun sweep to be redone.
  Plus: the L armchair sits close to the north-wall bookshelf cabinets (just room for a person to reach the shelves);
  couch, coffee table and her spot shift north with it.
  Jade recalls hearing her grandparents had joined the living and dining rooms long before 1986: one continuous room.
- **Morton Grove address (Jade): 5748 Capri Lane, Morton Grove, IL.** Research for plans/footprint/listings going
  into `inputs/refs_mortongrove/` (gitignored); the mortongrove07 set may need refitting to it.
- **First love sheets redone** (`cast/first_love/fl_{A,B,E}_*_v2.jpg`, `fl_D_hands_forearms_v3.jpg`, new
  `fl_G_ots_hair_v1.jpg`); old A/B/E/D and the face sheet F in `_superseded/`. Straight dark-brown two-block with
  curtain fringe; from straight behind it still reads close to a rounded bowl shape (flagged to Jade). The sweatshirt
  seal on G is a generic emblem, not the IAS seal. Keyframes for closet02/mv10 used the old hair; keyframe gallery
  links to a superseded D sheet. `layout/CAST.md` heights fixed to 1.78.
- **mortongrove07 built** (`layout/sets/mortongrove07/`; gallery now 11 sets): invented 4 x 5 m room, floral couch
  under two windows, side window sun; MG1 over-the-shoulder (his ear shows, no face), MG2 sweatshirt insert (seal
  upright), MG_wide, REF_plan. Use `__surf` masks for MG1/MG2. Room to be refitted once the Capri Lane research
  returns. CAST.md "used in" and README "Ten sets" not yet updated for it. mv10 bridge times still pre-v3.
- **5748 Capri Lane research** (`inputs/refs_mortongrove/README.md`): 1955 split-level, 1,296 sf, 6 rooms / 3 bed /
  1.5 bath, partial basement rec room; footprint ~11.1 x 11.8 m; FRONT FACES SOUTH (yard north). No plan or photos
  of this house; nearest proxy 5837 Capri (1957, living room 16x14 ft). mortongrove07 being refitted (south picture
  window, honest sun) and a printable drawing sheet made in `inputs/refs_mortongrove/print/`.
- **"Room crossing velocity" (Jade):** an overhead shot of her crossing the Mountain View room, overlaid with
  diagrams, equations and her calculations/review. Plan verse 3 row edited at Jade's request; mv10 agent adding
  `V3_rcv` with path/timing/speed data in the sidecar for the gold overlay.
  Jade: the floral couch is against the FRONT (south) wall of the living room, its end stopping just before the big
  picture window begins (couch and window side by side on the same wall).
- **Verse 3 review beats (Jade):** "past hour reviewed" = camera push into her temple or eye (mv10 agent adding
  `V3_rev_temple_*`, `V3_rev_eye_*`); "pitch contours" = a spectrogram of that very line with her pitch contour
  highlighted: being built as a "Visible Speech"-style plate in `media/footage/spectrogram/` from the -2sm lead stem.
  Plan verse 3 row edited at Jade's request. NB: the current master is `inputs/Proof (-2sm).wav`; its lyric times
  (`media/karaoke_v2/lyrics_timed.json`) differ from the v3 song map the plan and sets use.
  Shanghai correction: TV + cabinet on the EAST wall where the sideboard stood (or between it and the invented wall
  clock), superseding "north-east corner".
- **shanghai86 round 3 done** (before the TV-on-east-wall note, which the agent is now applying): one room 9.5 x
  6.1 m (soffit trace of the old partition, flagged), six-leaf windows in the old living half + assumed four-leaf in
  the dining half, bookshelf cabinets along the north wall, scrolls + framed painting on the west wall. Armchair 0.68 m
  from the shelves moved the group north: couch now 2.14 m from the window corner, her face 3.8 m into the room. Only
  an early winter-morning sun reaches that deep: chosen 1986-12-21 08:31 (elev 17, az 132); face lit thinly, table
  95%, shaft ends 0.28 m short of the doorway (Mother 0.83 m outside). Questions to Jade: early morning OK?
  painting wall? east windows / balcony length? couch 2.1 m from the corner OK?
  TV cabinet now on the east wall (3.05-3.95 m back from the windows); sideboard moved to the north wall's east end
  beside the dining table (agent's choice, flagged). Beam unchanged.
- **Shanghai round 4 (Jade):** couch position fine; one long balcony along the whole room; painting on the west wall
  right; NO curtains; third armchair opposite the other armchair (read: at the couch's south end facing the L chair).
  Light/time: Jade needs to see pictures, so a lit light-study sheet (08:31, 09:30, Feb 07:30, an honest afternoon,
  one labelled cheat) is being made: `media/layout/_sheets/shanghai86_lightstudy.jpg`.
  Plus a small side table in the other couch-armchair gap, reachable from both seats for a drink.
- **mortongrove07 refitted:** living room 4.9 x 4.3 m in the SE of the footprint (flagged), picture window in the west
  part of the south wall, couch east of it with its west arm 0.10 m from the window trim (window-west chosen so an
  afternoon sun reaches her; flagged). Sun 2007-11-05 15:30 CST (elev 11, az 237): rims her hair/cheek, lights hands
  and the seal; her face gets skylight only. Drawing sheets: `inputs/refs_mortongrove/print/mortongrove_sheets.pdf`
  (footprint 1:60, living room 1:30, tick-boxes: vaulted ceiling? couch end at window? room on east side?).
  Dining table: probably a long rectangle with more chairs (Jade, not sure); replacing the round one.
  Plus a small child-sized wooden table and child-sized chair between the couch group and the balcony (Jade).
  Correction: the child-sized chair was near the dining table (Jade, "I think"); the child's table stays by the balcony.
  Revised (supersedes the two lines above): child table AND chair together where the wicker lounger was; the lounger moves further west along the windows.
- **mv10 rebuilt as the real 345B** (from Jade's drawings; `inputs/refs_house/interior_plan.{md,json,png}`): living
  room 4.77 x 4.74, kitchen/dining 4.73 x 4.74, 1.76 m opening by the SSW wall; Expedit 5x5 on the partition facing
  WNW (beauty NNE, truth SSW), 2x2 + printer at the opening; white couch + chaise, Noguchi table, round glass table;
  French doors ESE near SSW corner -> raised deck -> stairs -> yard; lemon tree by the NNE fence; poi on the SSW lawn.
  Lamps/shadows removed (BR5 retired, BR4a/b replaced by `BRpan_a/m1/b`). Ceiling fixtures assumed. SCENE Sat
  2 Oct 2010: bridge 16:30 (sun through the WNW window, never reaches the shelf), verse 3 18:25 (only the lemon
  canopy top lit), silence/chorus 2b after sunset. New `V3_rcv` / `V3_rcv_obl` (crossing data in sidecar) and
  `V3_rev_temple_*` / `V3_rev_eye_*`. New shots use -2sm timings. Questions logged in the decision page.
- **Decision page** for Jade: `media/decisions.html` (all open decisions, with images; answers copy out as text).
- **Neuron plate done** (`media/footage/neuron/`, PLATE IX): human Purkinje cell, NeuroMorpho 307495 (CC BY; citations
  in its NOTES), code-drawn on frost's sheet. Best dissolve frost 1:52 -> neuron 1:16.
- **Shanghai round 4 done**: third armchair at the couch's south end facing the L chair, side table (gap widened to
  0.55 m), long dining table + 8 chairs, child's table + chair where the lounger was, lounger moved west. Light study:
  `media/layout/_sheets/shanghai86_lightstudy{,_flat}.jpg`.
- **Jade: the "cat under the desk" beat (plan 2:21-2:26) doesn't make sense; replace it.** Options are in the decision
  page (`cat` card); plan not yet edited.
- **New clip idea (Jade): overhead close-ups of artichoke, romanesco and a third spiral plant (spiral aloe, as in
  "Hold Fire"), in scientific-illustration style, with a gold thread counting out the spirals**, echoing Hold Fire
  (`/home/jade/Documents/1-music-shipped/holdfire/`, read-only). Being built in `media/footage/spirals/`. Placement
  is a decision-page card (proposed: verse 2a market count and the 2:26-2:45 interlude).
- **Spectrogram plate done** (`media/footage/spectrogram/`, PLATE XXI "THE VOICE."): narrow-band spectrogram of
  "hug durations, pitch contours" from the -2sm lead stem, gold fundamental traced, plus an enlarged semitone panel
  where the melody reads. Short (5 s, first frame at master 3:10.45) and long (12 s, 3:08.05, all three review lines)
  variants, ink-in variants, alpha overlays. Sync checked to the frame.
  Jade: each plant must be accurate to that specific plant (species-true morphology and counts, references cited).
- **Spiral plates done** (`media/footage/spirals/`, renumbered PLATE XVIII to avoid clashing with the spectrogram's
  XXI). Counts changed to the true ones: artichoke 5 and 8 (not 8 and 13), aloe 5 ranks only (divergence ~143°,
  not golden). Code-drawn; sources cited in NOTES.md.

## Session of 2026-11-25 (late): Jade's answers from the decision page

Jade pasted the decision-page answers. Logged verbatim in substance; being applied by subagents.

- **Song/plan:** `inputs/Proof (-2sm).wav` is the master: retime the plan and ALL sets to it. Revise the whole plan
  here, in this project. "From inside, I can't tell the difference": hold on the shelf (the pan lands on the seam
  between the halves). Push to GitHub: commit and push everything except the private (gitignored) folders. Keyframe
  repaint: wait until the sets settle (after this round).
- **mv10:** 2 Oct 2010 fine. At "he said I absolutely nailed it" she stands by the shelf and he stands close and
  whispers to her. Digitised house looks right. Lemonade was prepared BEFORE the party: postdoc Jade and the
  childhood friend picked the lemons; first love, Z and the guests hadn't arrived yet. (Cast: the OLD, superseded
  childhood-friend artwork is a close match for Z.) The living/kitchen wall really was THICK (built-in, chimney,
  closet...), as thick as the 2x2 Expedit is deep, so the 2x2 sits almost flush. Living-room windows: one in the
  front wall AND another along the side wall (Jade: "I think"). Glass-top table: a SEMICIRCLE, flat side against the
  wall, ~3 ft wide, ~1 ft deep at the centre. Patio: floor level to the house, a SLIDING GLASS DOOR (not French
  doors); the wood deck has wood stairs and a wood railing down to the yard, at least 3-4 steps below floor level.
  Shelf pan: shelf only. Room crossing: steep oblique. The Noguchi table's base is wrong (right in spirit): look it up.
  "Past hour reviewed": push into the TEMPLE. Guests/audience along the side of the house by the wall and on the
  patio; the poi spinner is in the yard, performing toward the audience. IAS mirroring: hadn't noticed; keep as
  remembered.
- **shanghai86:** 21 Dec, about 9:30 am (Jade: the 8:30 and 9:30 eye-level views in the light study are really nice).
  She sits CROSS-LEGGED; many more paper bits, messier (same spread area); one stray tiny bit in her hair. The two
  armchairs face each other across the table (confirmed). Rotate the dining table 90 degrees and shift its centre up
  a little (north, toward the hall wall, on the plan as drawn). Keep the sideboard and invented details. Hall doors
  open into the hall; the hallway doors are double or triple the current width, centred on that wall. Uncle's hands
  (V1b) good enough as a guide.
- **basement90 / plan 2:21-2:26:** replace "she is already a cat under the desk": she holds her RIGHT hand in a fist
  and pretends to lick her wrist, imitating a cat cleaning itself. She does NOT hide under the desk (reads as fearful).
- **mortongrove07:** room and light look right; date about right; ceiling VAULTED; his ear showing is fine.
- **First love:** hair close: less round; a CENTRE PART; a clean line extending from the curtain bangs backwards (the
  current taper is too gradual). The centre part leads to the crown whorl, which is not obvious and sits at the top of
  the head, not far down. No bracelet. One slate-blue profile image has the wrong facing hand. The slate-blue shirt is
  a plain long-sleeve shirt, not a henley. Dad's sheets good. Older open items: leave as the agents guessed.
- **Plates:** neuron: love it. Spectrogram: short version, drawing left to right. Spirals: the gold count on the real
  artichoke becomes the plate at 2:07-2:16; the completed count lands on the romanesco plate at 2:36-2:45.
- **Airbnb listing:** skip; the drawing is enough.
- **Jade (follow-up):** once all the revisions are done (sets settled and retimed), paint a full round of keyframes
  from the new mannequin renders and put them all on a LOCAL html decision page for Jade to review. (Keyframes stay
  out of the public repo: `media/keyframes/` is gitignored.)
- **shanghai86 answers applied** (NOTES "2026-11-25 (5)"): 09:30 sun (elev 25.7, az 143.8) lights her lap, couch,
  73% of the table, but NOT her face/hands (25-33 cm out) nor the uncle's hands in state A; cross-legged in the drift
  scene (eyes ~10 cm above the table), 627 paper pieces, one in her hair; dining table turned 90 deg, +0.4 m north;
  hall opening 4.0 m (2.5x), four leaves folding into the hall, centred on the WHOLE north wall (moves it east).
  New questions for the decision page: face in shade at 9:30 OK (else move her ~0.35 m toward windows)? doors centred
  on whole wall vs opposite the six windows? cross-legged in the uncle scene too (kept kneeling)? Engine: V1g fringe
  stands off her forehead like a plank (mannequin.js).
- **basement90 cat beat applied:** she stands in the open in the screen light, right fist raised as a paw, back of the
  wrist at her lips, head bowed and cocked (tongue left to the painter); Dad's double take now looks at her. B4 is a
  two-shot, B5_cat a close 40 mm from her front-right (id kept). **mortongrove07 vaulted:** 4-in-12 cathedral ceiling,
  ridge front-to-back (gable over the picture window; agent's guess, flag to Jade), light unchanged.
- **First love sheets v3 done:** `cast/first_love/fl_B_backhead_neck_v3.jpg` (hair anchor), `fl_A_turnaround_back_v3`,
  `fl_E_costume_19_27_v3`, `fl_D_hands_forearms_v4`, `fl_G_ots_hair_v2`; old ones in `_superseded/`. Centre part to a
  quiet crown point, crisp line back from the fringe, narrower from behind; no bracelet; plain crew-neck long-sleeve
  at 27; the bracelet poses (incl. the wrong-hand one, read as A v2 fig 5 / E v2 fig 6) replaced. Weak: slight
  overhang over the sides in 3/4 view; the part reaches far down in top views; seal on G still generic.
  The decision page's fl_ cards point at the superseded files (fix when the page is rebuilt).
- **-2sm song map, time map and plan revision done** (plan/map agent; not committed). New `analysis/m2sm/`:
  `song_map.md` (sections, downbeat hits, every lyric line, contested words), `time_map.json` (v3 -> -2sm, 76
  piecewise-linear anchors, segments only in v3, content changes, lyric onsets), `remap.py`, plus the measurement
  scripts/logs and demucs stems. Findings: -2sm = v3 two semitones down (Bb minor, same tempo); the interlude's FULL
  half (v3 2:36.1-2:44.4) is gone, so everything after 2:34 is ~10.3 s earlier; the vocalise after chorus 2 is BACK
  (3:48.8-3:52.6); the coda is 4 clean bars (hit 4:14.3, last hit 4:24.1) then a loud bass ring to 4:28.4; three lines
  sung shorter. **Apply the map to a set:** from the repo root, `.venv/bin/python -I analysis/m2sm/remap.py --file
  layout/sets/<set>/shots.js` (dry run, a diff + flags) then add `--write`; add `--snap` so lyric-synced cuts land on
  the -2sm sung onsets (v3 line starts are whisper times, up to ~1 s early). It rewrites `t: [a, b]` and m:ss strings
  and comments, and leaves alone any shot block that mentions -2sm. mv10 mixes clocks: `V3_rcv_obl` is already -2sm
  but unmarked, so pass `--skip-ids V3_rcv_obl` (check the dry run for others). Flagged times (market93 M6-M8b,
  kitchen90 at 2:36, anything in v3 2:34.1-2:43.8 or the coda lead-in 4:24.5-4:25.9) must be re-placed by hand.
  `remap.py 3:05 2:16-2:21` converts single times. **Plan** (`Proof — Music Video Plan.md`) revised throughout: every
  Structure row on -2sm times with a "was" column; the interlude rows merged (count resumes on the artichoke plate,
  completed count on the romanesco plate ~2:30-2:34; bud opening dropped: judgment call, asked); Jade's answers folded
  in (seam hold + shelf only, "nailed it" whisper by the shelf, lemons before the party, guests/poi, steep oblique,
  temple push-in, sliding glass door, cat wrist-lick, short spectrogram plate left to right, spiral plates, neuron
  kept); first love's face never shown (Move 1 and cast step corrected); new open questions (interlude merge, spiral
  aloe unplaced, pan end) and ear checks on -2sm times. mv10 note for its agent: the plan now starts the shelf pan on
  "truth by reference" (2:42.0) after the sweatshirt on "Beauty on this side" (2:39.6) and holds on the seam
  2:46.9-2:49.7; `BRpan_*` currently runs 159.62-166.8 with the seam as its MID key.
- **Plan revised to -2sm** (`Proof — Music Video Plan.md`, "was" column keeps v3 times); new `analysis/m2sm/`
  (song_map.md, time_map.json, remap.py; stems gitignored). -2sm = v3 two semitones down, but the FULL half of the
  interlude (v3 2:36.1-2:44.4) is gone, the post-chorus-2 vocalise is back (3:48.8-3:52.6), coda is four bars.
  Spiral plates: artichoke count 2:06.3-2:16.1; the romanesco landing moved into the end of the thinned interlude
  (~2:30-2:34) since 2:36-2:45 no longer exists; the bud-opening growth plate dropped for time; aloe unplaced.
  Questions for Jade: interlude merge OK / where the bud goes; aloe placement; pan stops at seam vs crosses and
  returns; ear checks (tail-2 vocalise lead or backing; "made flesh/fresh" 2:15.4; "shelved/shoved" 2:45.4;
  "artichoke" caption; whisper 2 audible; cliff 3:55.0 placement); may Dad's answer move to the "Good catch!" row?
- **mv10 answers applied** (NOTES top section): new `V3_nailed` (183.85-185.98, he bends to her right ear at the
  Expedit, back of head only); `V3d` and `V3_rev_eye_*` retired to `media/layout/mv10/_retired/`; `V3b` restaged as
  pre-party lemon picking at 14:00 with a set-local adult childhood-friend figure; partition 0.78 m (2x2 flush, read
  as the 2x2's 79 cm side; if Jade meant 39 cm the 2x2 turns 90 deg); side window = existing SSW window; half-ellipse
  console 0.91 x 0.30 on the NNE wall; 1.83 m slider, deck level with floor, rail, 4 risers (floor 0.70 m above
  yard); `BRpan_c` seam end 166.85-169.66; `V3_rcv_obl` the shot, `V3_rcv` reference; Noguchi IN-50 rebuilt from
  Vitra/Herman Miller drawings (sources in NOTES); guests on the lawn along the ESE wall + deck rail, poi faces them.
  Questions: wall 0.78 vs 0.39; nod (189.1) still under the lemon tree 3 s after the shelf whisper: move to the shelf?
  V3b as picking vs a separate shot; pan returns to the seam twice; he faces 49 deg off camera in V3_rcv_obl (tiny,
  from above); interior_plan.png still draws the console as a circle.
- **All sets retimed to -2sm** (each NOTES.md "Retimed to the -2sm master"); attic88 untouched (unused). market93
  M7/M8/M8b have no slot (alternates); V3f (hug) on "Hug durations" only, "pitch contours" to the spectrogram.
  remap.py bug: times followed by ':' are skipped/mangled (all fixed by hand in the sets; the script is not fixed).
  BRpan_a moved to start on "truth by reference" 2:42.0 so it no longer overlaps the sweatshirt (2:39.6-2:42.0).
- **Committed and pushed** (Jade: push everything except the private folders), gitignored folders stayed out.

## Session of 2026-11-25 (night): keyframes round 2

- **Painted:** 88 keyframes, one per shot in the -2sm cut, from the new set renders (121 takes), into
  `media/keyframes/r2/<set>/` (gitignored; round 1 in `media/keyframes/<set>/` untouched). Per set: takes + `.txt`
  sidecars, `_prompts/`, `picks.json` (pick, takes, time, header, status, note), `NOTES.md` (mv10: `NOTES_bridge.md`,
  `NOTES_verse3.md`), `_picks*.jpg`. Painter brief: `media/keyframes/r2/_brief_r2.md`.
- **Skipped (not in the cut):** all `REF_*`, `B0_*`, `K0_*`, `MG_wide`, market93 `PLAN`/`PLAN_B`/`WIDE` and the
  alternates M7/M8/M8b; mv10 V3g (alternate), V3h and V3_rcv (reference), `_retired/` (V3d, V3_rev_eye_*); attic88
  (unused). X_sw is painted but is a spare. Plates are not painted: stills from `media/footage/` sit on the page where
  the plan places them (round 1's PAD, VOY and FINAL stills likewise).
- **Review page:** `media/keyframes/r2/index.html` (`python3 tools/kf/r2_page.py` rebuilds it from the picks; linked
  from the top of `media/keyframes/index.html`, and `tools/kf/gallery.py` keeps that link). Jade's pasted block starts
  `Keyframes r2 (from media/keyframes/r2/index.html):`, one line per shot `- <id>: Good | Redo (note) | Wrong
  staging (note) — <note>`.
- **Route and cost:** Codex (tmux session `proof-kf2`) for the first ~63 images, then its plan limit (reset ~19:10);
  the rest on gpt-image-2, ~$13.4 (ledger $10.26 -> $23.70). `tools/kf/kf.py` gained `KF_SESSION`, `--route auto`
  (Codex until `work/kf_logs/CODEX_LIMIT_HIT` exists, then gpt2; delete the flag once Codex resets) and a wider
  FORBIDDEN list (family photos, the refs_house/shanghai/mortongrove/devon_market photo folders, `_superseded/`).
- **Regenerate a shot:** follow `_brief_r2.md`; the exact prompt and refs are in each take's sidecar and `_prompts/`.
- **Weak:** AD_piano (limbs read ~8 years old; the new layout cuts her head), B4_doubletake (painted far wider than
  the layout in 3 takes; crop v2), V3b (v3 has the set's tan-top friend but her hand shows 4 digits; v2 has a clean
  hand but the cf_A hoodie Jade says looks like Z: my brief wrongly named cf_A), SI1 (the poi trail is a gold halo
  round her head, against KEYFRAMES 6.6). Softer faults are in each card's painter note: gpt2 takes drift warm
  (mv10 umber not violet; Codex shanghai sepia, gpt2 grey-green), closet light is soft not a crisp door wedge (the set
  still lights the hands: widen `DOOR`), V1f blank faces read slightly as pale ovals, romanesco in M5/M6 has no
  countable arms, V3_rcv_obl has her glance up at the lens, handout grids a little off the layout (place comp faces from
  each pick). First love: every frame zoom-checked by the painters and the picks again by the lead; face turned away
  in all.

## Session of 2026-11-25 (late night): decision-page round 2 answers

Jade pasted the round-2 answers (22 cards). Logged here as they came; being applied by subagents. Also: Jade added
`inputs/refs_closet.png` "for the closet scene" (gitignored now, like the other refs) and a hand-drawn Morton Grove
floor plan at `inputs/refs_mortongrove/Pasted image.png`. `work/kf_logs/CODEX_LIMIT_HIT` deleted (reset is long past).

- **Interlude merge:** something else. Find the bud opening another place; NOT decided yet (keep as an open question).
- **Dad's written answer:** neither placement. No written "it was correct"; instead "Good catch!" is ATTRIBUTED TO
  DAD ON SCREEN. B4 (double take) image is too dark: the basement has more ambient light from a CEILING LIGHT.
- **Hug/pitch:** keep current (hug on "Hug durations", spectrogram on "pitch contours").
- **mv10 wall:** 0.78 m as built; room looks good. Kitchen: appetizers spread across the dining table, snacks around
  the counters; a GIANT PUNCHBOWL of lemonade to the RIGHT OF THE STOVE with a ladle and a stack of cups. Normal-size
  FRIDGE on the side near the 2x2 Expedit; STAINLESS STEP-LID TRASH CAN in the space to the right of the sink;
  DISHWASHER under the counter to the right of the stove. UPPER CABINETS; all cabinet doors DARK WALNUT.
- **mv10 room crossing:** velocity mostly in the LIVING ROOM with the kitchen visible. Sequence, each a vector: Jade in
  conversation with someone in the kitchen -> hears doorbell, excuses herself -> opens the door, welcomes 2 new
  guests -> heading back to the kitchen, someone at the shelf says something, she stops -> doorbell again -> crosses
  to the door again to welcome more guests.
- **mv10 nod:** move the nod ("past hour reviewed", 3:09.1) to the SHELF, straight after the whisper; the nod was never
  under the lemon tree in the original.
- **mv10 V3b:** the picking (current). At "housewarming, lemonade from the yard" they pick the lemons AND prepare the
  lemonade in the kitchen (juicer, rinds, mixing). The image should feel a bit like a BOTANICAL ILLUSTRATION, like the
  artichoke and other plates.
- **mv10 pan:** cross to the science half and come back to the seam (current). Room-crossing facing: fine.
- **shanghai86 face:** move the angle of the light so she is lit (rather than moving her).
- **shanghai86 doors:** centred on the whole north wall is correct. There is NO window wall: it is all a continuous
  balcony (doors), with LATCHES on the doors. The side walls might be wider than pictured. A WHITE WICKER CHAIR on
  the balcony. The living room's wicker LOUNGE chair faces the TV.
- **shanghai86:** cross-legged in BOTH scenes (uncle scene too).
- **mortongrove07:** ridge PARALLEL TO THE STREET. There is another window. Jade's hand-drawn floor plan is in
  `inputs/refs_mortongrove/Pasted image.png` (couch on the top wall under a window with side table + lamp, coffee
  table on a red rug, armchair, a long table of germinating plants in egg cartons "carefully labelled" by the
  right-hand window, front door on the right, closet, dining table with 6 chairs by another right-hand window, a
  7-ft concert grand and a giant mirror on the left wall, floor lamp, stairs bottom-left, sliding door to the kitchen
  at the bottom).
- **First love hair v3:** reads as him, almost right; the part is good. The fade is too gradual: really a top half,
  and the lower part buzzed to stubble then grown out ~6 months (a distinct step, not a taper).
- **First love weak spots:** the IAS seal should be WAY larger, almost the whole front of the sweatshirt; the
  sweatshirt has to be UNFOLDED to see the whole thing.
- **Aloe plate:** keep as an alternate for now. Market M7/M8/M8b: alternates (current).
- **Ear checks:** tail-2 vocalise = BACKING layer (Suno calls it lead; Jade wants it there live). "Made FLESH".
  "SHELVED". Caption "artichoke". Whisper 2 is loud enough: cut on it. Cliff at 3:55.0: Jade can't tell.
- **In flight (subagents, started ~22:15):** mv10 (kitchen dressing, crossing vectors, nod at shelf, V3b prep);
  shanghai86 (continuous balcony doors w/ latches, wider room, wicker chairs, light angle, cross-legged x2);
  mortongrove07 (rebuild from Jade's floor plan, ridge parallel to street, unfolded sweatshirt); closet02 (rebuild
  from refs_closet.png); basement90 ceiling light + ALL plan/song-map text edits (only that agent edits the plan);
  first love v4 hair + big IAS seal sheet (Codex tmux `proof-fl4`). After they report: rebuild
  `media/decisions.html` (remove answered cards, add their new questions), gallery, commit (not refs), push.
- **Done: basement90 + plan.** Bare bulb in a porcelain pull-chain holder (assumed) at 1.97 m, warm ambient; B4 now
  readable (checked). Plan: "it was correct" removed; "Good catch!" = toner label `DAD: GOOD CATCH!` beside his head
  2:20.0-2:22.2 (proposal); interlude = artichoke count 2:25.2-2:29.5, romanesco completes 2:29.5-2:34.5; bud open;
  nod at shelf; V3b pick + make lemonade; crossing 4 legs; tail-2 vocalise backing (no sync); "artichoke" caption
  2:11.9-2:13.6. **Cliff measured:** band drops at 3:54.92 inside "smile"; "on" 3:55.24-3:55.63 sung in silence;
  plan cliff now 3:54.9. New clip `media/decisions_audio/cliff_slow_mix.mp3`. New questions for the page: bud place
  (rec: coda bar 4:16.8), Good-catch treatment, caption style, cliff (rec: cut on drum hit 3:54.9), crossing
  compression (rec: drawn at each stop), ceiling fixture type. B4 keyframe needs a repaint.
- **Done: shanghai86.** Honest sun moved to 08:30 (elev 17.1, az 132.2): lights her face/hands in both scenes (09:30
  can't, she's 3.9 m in; light reaches her only 07:42-08:38). Four bays x four glazed steel doors with bolt-rod
  latches (REF_doors, REF_latch); room 9.5 -> 10.5 m along the balcony; white wicker tub chair on the balcony;
  lounger moved to the east end facing the TV; uncle moved to the couch end (in the armchair he shaded her);
  cross-legged both scenes. Plan still says "about 9:30" for Shanghai: fix to 08:30 when finalising. New questions:
  08:30 vs 09:30 cheat; wider = longer or deeper; lounger position; uncle seat; doors/chair as built.
- **Done: closet02** rebuilt from refs_closet.png as a 6 ft reach-in with two bypass sliders slid left (assumed size;
  shelf 1.72, rod 1.60, hems ~0.9-1.0 m, 3 long coats, duvet under her, cross-legged). He sits outside on the carpet;
  late-afternoon sun from a bedroom window behind him lights her whole face in a crisp wedge. New `CL_elev` (compare:
  `work/closet02_compare.jpg`, private). Plan's "door left ajar" -> sliding door half open (fix when finalising).
  Closet keyframes need repainting. New questions: closet size; his position; light source; open on head-in-hands?
- **Done: first love v4** (Codex, 13 images, $0): `fl_B_backhead_neck_v4` (new anchor), `fl_A_turnaround_back_v4`,
  `fl_G_ots_hair_v3`, `fl_H_ias_sweatshirt_v1` (seal collar-to-hem, unfolded/held/folded). Hair now has a hard step
  over an even grown-out buzz, but the top reads as a bowl/mushroom with a level rim (checked: B v4 bottom row is the
  worst). No face visible (checked). Seal: Truth drawn draped off one shoulder, one breast bare (full nude blocked by
  moderation); tree slimmer than the real seal. E v3 and D v4 still have the old taper. decisions.html fl_ cards
  point at files now in `_superseded/`. Questions: bowl or right? Truth OK as drawn? (Public repo: ask before
  pushing fl_H if Jade has any doubt.)
- **Done: mortongrove07** refit to Jade's floor plan (REF_plan_label is south-up to lay beside the drawing; matches
  layout, checked). Read the drawing's TOP as the street (south): front door in the short jog wall facing up; great
  room now in the WEST half. Ridge E-W on the house centre line (z -5.6), 4-in-12, 2.44 -> 4.31 m. She holds the
  sweatshirt up unfolded against herself, seated; seal (0.38 m, placeholder glyph in renders) faces him/camera, in
  window daylight not sun; sun still rims her at 15:30 Nov 5. TV removed (not drawn). Face check: MG1 back of his
  head only. Questions: which side is the street; front window 1.5 m vs big picture window; ridge height position;
  how the sweatshirt is held; loveseat vs two chairs; mirror reflections. Plan 2:39.6 row: held up, not handed over.
- **Plan touched up by lead:** Shanghai 08:30 (row 103), closet sliding door half open + light (108, 170), Morton Grove: she holds the sweatshirt up unfolded (166).
- **Done: mv10** (kitchen dressed, fridge behind the 2x2, walnut uppers; crossing rebuilt as 3 legs ~19 s real in 4.13 s; nod at shelf; V3b split into picking 2:57.0 + V3b_prep 2:58.0 overhead; V3g retired). All 30 new questions are in `work/round3_questions.md` (gitignored).
- **Decision page rebuilt:** `media/decisions.html` now holds the 30 round-3 cards (storage key v3); round 2 answers
  in the collapsed list. **Committed and pushed** except: `cast/first_love/fl_H_ias_sweatshirt_v1.*` (wait for the
  fl_truth answer), `cast/first_love/_prompts/v4/takes/*.jpg` (rejected takes not face-checked: keep local), and
  `inputs/ref_artichoke.png` (new from Jade at 22:36, not yet mentioned by her: ask what it's for).
- **Next:** Jade answers round 3 + the keyframes r2 review; repaint keyframes for the changed sets (basement B4,
  shanghai, closet, mortongrove, mv10 kitchen/crossing/V3b_prep/nod) once those settle.
- **Jade: `inputs/ref_artichoke.png` is the reference for the MARKET artichoke; build the artichoke model from it.** It is a watermarked web photo (Eat Simple Food), top-down globe artichoke: gitignored, never pushed or sent to an image model without asking. Rebuild in progress (market93).
- **Jade: the artichoke DIAGRAM and spiral TRACING (PLATE XVIII) must also be based on the real artichoke** (the ref). Same agent extends to media/footage/spirals/ after the mesh, driving both from one bract layout.
- **Jade: basement90 costume: Jade (7-8) wears SOCKS; Dad wears SOCKS AND SLIPPERS in all the basement scenes.** Apply to the set (costume) and to every basement keyframe repaint.
- **Jade (general): low ambient light makes surfaces ambiguous; even the guide renders are hard to read, so the image models output weird things.** Fix in progress: additive legible guide modes in the engine (`form`: even high-ambient clay, no cast shadows; `contour`: line render without shadow fills; light map kept separate), brief/kf.py switched to them, A/B test paints on the hardest shots.
- **Jade: shanghai86 living room and basement90 both need HIGHER AMBIENT light, while keeping the visible shadows, so the image models can tell what's going on.** (Set lighting, not just guides.) Basement -> socks agent; shanghai -> new agent; guides agent told.
- **Done: shanghai86 brighter shade** (lit only: ambient 0.7->1.4, + sky fill 0.9 from the doors, + hemi bounce 0.9; no shadows from fills; `light.fill` per-shot scale). Bookcases, couch, uncle's jacket now read; sun bands still crisp (checked before/after). Masks unchanged. Light study lit sheet regenerated.
- **Done: basement90 socks/slippers + brighter** (white crew socks on her; Dad grey socks + brown backless felt scuffs, colours/style assumed; ambient 0.7->1.35, warm no-shadow fill 1.0, bulb 3.6; B2 far-clip fix). Conflicts: lj07 sheets say bare feet/stirrup leggings, Dad v5 sheets say leather shoes (brief overrides; sheets not regenerated). Plan row 163 updated by lead.
- **Done: artichoke from Jade's ref.** One generator (`layout/sets/market93/artichoke_spec.mjs` -> artichoke_bracts.json) drives the market mesh AND PLATE XVIII Fig. 1; 32 bracts, 5/8, same handedness, same bract per numeral. Order: spec -> plate (render_all.sh) -> market render. Lead's look: 3/4 view reads as a globe artichoke; the plate top view's bract edges look jagged/torn (rose/cabbage-like) and the gold tracing is busy. Questions: numerals 2/4/5/7 hidden round the far side in M2/M3/M7/M9 (outermost visible bract, or camera change?); size 11.5 cm open / 9.5 cm body OK?
- **Jade: `inputs/refs_ias/`** (gitignored): 'Pasted image.png' = the real IAS seal (blue line art, TRUTH/BEAUTY, wordmark below); 'Pasted image (2).png' = a web product photo of a grey HOODIE (drawstrings, kangaroo pocket) with a solid RED filled-circle seal print (white figures, INSTITUTE FOR ADVANCED STUDY round the rim, FOUNDED 1930) at chest size, about 40% of the front width: 'the size it should be'. 'The actual sweatshirt is this in blue.' Supersedes 'almost the entire front' (fl_H v1 is too big now). Photo shows a model's face: never send it uncropped.
- **Jade: the IAS garment is a WHITE HOODIE with the seal printed in BLUE** (filled-circle print style as in the ref, chest size ~40% of front width; not almost the whole front). Jade approved sending the seal image and a CHIN-DOWN crop of the hoodie photo to the image model. Redo fl_H, G and mortongrove07's sweatshirt prop (now a hoodie, smaller seal); plan/costume text 'sweatshirt' -> hoodie.
- **Done: painter guide modes** (`--modes form,contour,light`, engine additive; old modes byte-identical). Briefs now pass _contour/_form/_light; mood from the prompt's LIGHT paragraph. All 10 sets rendered in the new modes. A/B in `media/keyframes/r3_test/` (*_sbs.jpg): B4 v2 and V3_rcv_obl clearly better (checked); CL_ots light better, framing drifted wide. Lessons: add one explicit framing sentence per prompt; form tints are codes (market produce comes out blue-grey/beige). Next keyframe round uses these.
- **Jade: her housewarming outfit (mv10):** thin black jacket with a NASA meatball logo on the chest; fitted black t-shirt with an SR-71 on it; boot-cut black yoga pants; socks. (Open: same outfit for the pre-party lemon picking outdoors? shoes outside?)
- **Done (hoodie): mortongrove07 prop is now the WHITE HOODIE** (hood hanging behind, drawstrings, kangaroo pocket straddling the knee fold) with a BLUE filled-disc chest seal 0.23 m on the 0.58 m front (40%), white-reverse placeholder figures; sidecar key `sweatshirt` -> `hoodie`; all modes + beam masks re-rendered, gallery rebuilt. Plan rows 109 and 166 say hoodie, chest-sized print. **fl_G_ots_hair_v4** accepted (folded white hoodie, blue print; hair = v3; faces checked). **fl_H hoodie sheet BLOCKED** by output moderation (twice, with the real seal as ref: Truth is unclothed); no drapery invented, H v1 and G v3 in `_superseded/`. Ask Jade: how to handle Truth for the H sheet (see cast/first_love/NOTES.md, v5).
- **Jade: SR-71 print** = seen from above (planform), angled down and to the left, reads like a triangle; subtle, dark grey on black.
- **Jade:** the jacket is worn over the tee, so the SR-71 print is barely visible (a sliver between the open jacket fronts at most).
- **Hoodie result:** fl_G_ots_hair_v4 done (white hoodie, blue print; no face, checked; hair still bowl-like). mortongrove07 prop is now a white hoodie, 0.23 m blue disc on 0.58 m front. Plan rows 109/166 updated. fl_H hoodie sheet BLOCKED twice by moderation (real seal's nude Truth). Lead's rec to Jade: model paints a plain blue disc, the real seal composited in code at comp time (like the toner labels).
- **Jade's keyframes r2 review pasted** (verbatim: `media/keyframes/r3/JADE_R2_REVIEW.md`, gitignored). Jade asked for a full repaint of ALL keyframes from all updates overnight, review in the morning. Overnight plan: (A) set fixes per set in parallel + plan/plates agent; (B) repaint all shots into media/keyframes/r3/ with the new form/contour/light guides; (C) r3 review page. Paid gpt2 cap: stop when docs/spend_ledger.jsonl total passes $65.
- **r3 overnight agents launched (~23:50):** attic88_day; office91 (+ age-10 'facial expressions' beat by the counselor's door); shanghai86; wall88; market93+basement90; kitchen90+closet02+playground23; mortongrove07; plan+plates (+ r3/footage_slots.json); mv10 = the outfit agent's follow-up. Each writes media/keyframes/r3/<set>/picks.json (source painted|carried|footage). After all: build the r3 review page (adapt tools/kf/r2_page.py -> r3_page.py, show Jade's r2 note beside each), commit non-private changes.
- **Done: housewarming outfit** (mv10 JADE_HOUSEWARMING in party shots; sheet cast/jade_27/j27_costume_housewarming_v1.jpg; briefs updated). Assumed: zip front worn open, grey socks, flared hem skims floor, no pendant, socks outdoors. Open for Jade: shoes outside? same outfit before the party?
- **r3 attic88_day done** (checked _picks.jpg: good). Keys real-size with margins; set-local age-4.5 kind jade4h; AD_out/AD_thumbs retired; AD_keys footage. Open: intro gap 0:07-0:18.2 needs resequencing; coda bar 3 reuse of AD_keys; age 4.5 vs 5 across the attic day.
- **r3 plan+plates done.** Karaoke->footage factor: footage s = 0.9387 x karaoke s. Growth placed (AD_keys 0:13.2, PB1, interlude 2:23.7-2:30.0 one take, BR1) at 3.7-7.2x speed; neuron on BR2/BR3 and resumed in tail 2. Artichoke count re-rendered one line at a time (8 family then 5); cut A = PLATE_artichoke 2:09.2-2:14.2, cut B replaces romanesco 2:30.0-2:34.5. footage_slots.json + 12 stills in media/keyframes/r3/_footage/. TODO: refresh market93/artichoke_plate_count.json (run spirals.py artichoke --data data/artichoke_arms.json without NO_MARKET_COUNT); r2_page.py refs deleted stills t11.00/t16.90. 10 open questions in the plan (speeds, intro order, bridge, K1 caption, WL_in faces, BO2 cut-off note, shelf lists, romanesco photo, corridor year/Mom, outro thumbs age).
- **r3 mortongrove07 done** (checked: no face of him; seal fold reads; hair still slightly domed; carpeted steps at frame right not in Jade's plan). One push-in MG1 -> MG1_end -> MG2, hoodie folded -> unfolding. Plan row already matches.
- **r3 market93 + basement90 done** ($0.26). Codex plan limit HIT ~01:00 (flag set; others now on gpt2, cap 70; ledger $26.54). Lead's look at basement: socks/slippers right, bright readable room; B4/B5 tongue still out close to the wrist (Jade wanted pretend: may need a closed-mouth 'paw near lips' version); B2 has two pale blobs on Dad's glasses/cheek.
- **r3 wall88 done** ($1.03; ledger $28.50). Standing, back to brick; WL_in with five workers (faces turned away/dark) + WL_in_empty matched for an in-place blink. Checked: strong. Questions: side wall = brick? Mama in the line? WL_in camera ~20 cm above her eyes OK? light on the workers? WL_eye blade on far eye.
- **r3 mv10 done** (22 shots: 15 painted, 4 carried, 3 footage; ledger $30.28). Checked contact sheet: outfit reads (meatball), pomelo lemons, no guests pre-party. Faults: V3_nailed weak (his hair bowl); SI1 still has the poi trail as a gold ring round her head (against KEYFRAMES 6.6); C2b she holds the cup; NASA lettering legible. BR1 footage: mv10 used 128-140 s but footage_slots.json (plan agent) says 120.2-138.9: the page should follow footage_slots.json.
- **r3 office91 done** ($2.26; ledger $32.49). Wall art, Dad standing behind Mom, PC3a/PC3b tilt, handout row of 6 left with larger faces, her finger on the empty space, counselor on ANXIOUS. New corridor FE_out/FE_thumbs at age 10 (Mom pushes her cheeks; check this matches the poem: whose hands?). r2_page.py must handle PC3a/PC3b. Questions: BO2 cut-off note; whole office at 10?; corridor vs kitchen; wall art colour + alphabet letters.
- **r3 shanghai86 done** (checked: strong; ~$3). Uncle's armchair pulled to the table's north end east of her; watch face up; one tiny piece tracked through V1c-V1h; V1d_8 + new V1d_8_end (Mom in doorway); relatives peek in from the hall. Weak: V1d_8 hands read older; V1h stick in a mug (steam in guides reads as sticks: fix guides). Questions: armchair; which half; V1e look up at Mom?; relatives position; stack size 200 sheets.
- **r3 kitchen90 + closet02 + playground23 done** (~$2.25). K1 split into K1_question (start) + K1_question_end (textbook figure, caption band at 230,60-1690,881); K2-K4 footage; K5_thumbs kept as the outro beat at 7. Closet all repainted, his face never shown. PG1 carried. Questions: textbook look whole tilt or end only; redo fl_B/fl_G v4 hair first (models copy the bowl); K5 at 7 OK; PG2 beam as a floor band.
- **All r3 painters done ~02:00.** Ledger ~$34 of $70. Next: r3 review page, commit.
- **r3 review page built:** `media/keyframes/r3/index.html` (`python3 tools/kf/r3_page.py`; 104 cards, 3 weak: V1d_8, V1h, V3_nailed; 34 open questions hand-written in r3_page.py's QUESTIONS dict; localStorage `proof-keyframes-r3-v1`). Jade's paste will start `Keyframes r3 (from media/keyframes/r3/index.html):`. Footage cards follow footage_slots.json; sets' picks.json footage times are stale where flagged "Times differ".
- **MORNING, first thing:** Jade pastes r3 keyframe answers and/or round-3 decision-page answers (`media/decisions.html`, 30 cards). Biggest open items: first love's hair still paints as a bowl in every take (redo fl_B/fl_G v4 sheets first); IAS seal Truth handling (rec: composite real seal in code); footage speeds 3.7-7.2x; BO2 note cut off; whole office at age 10?; Codex limit flag `work/kf_logs/CODEX_LIMIT_HIT` (delete once reset). Spend $33.72.

## Session of 2026-11-26 (morning): Jade reviewing keyframes r3

- Jade is going through `media/keyframes/r3/index.html`. START HERE was rewritten for the next session. Nothing else
  has changed since commit 62ae8c5.
- **Jade added `inputs/diagram_basement.png`** (basement90 floor plan). It shows the desk FREESTANDING mid-room with
  Dad on its front side facing the back, "empty space" behind and to the left, a post at the desk's back-right corner,
  an old-fashioned washer ("50's tech", no dryer) right of the desk, two 20+ lb watermelons front-right, and the stairs
  along the FRONT wall (left half). Today's set has the desk against the back wall, the stair on the left wall, plus a
  shelf, boxes and a water heater. An agent is rebuilding basement90 to match (keeping the r3 page's guides in a
  snapshot under `media/keyframes/r3/_layout_snapshot/`). B1-B5 will need a repaint in r4.
- **Jade added `inputs/refs_semicircletable/`** (3 photos of the real mv10 glass-top console). The real table is a dark
  bronze round-rod frame with curved legs gathered at a knotted collar, not the assumed chrome three-leg one. An agent
  is modelling it into `layout/sets/mv10/` (snapshotting the r3 page's mv10 guides first). The mv10 shots showing it
  will need a repaint in r4.
- **Jade, mv10 kitchen:** "the stovetop fan was inside dark wood cabinetry, and there was a mounted microwave above
  the stove." This replaces the assumed stainless hood. Read as an over-the-range microwave set into the walnut uppers,
  with a walnut cabinet above it (alternative reading flagged). Given to the mv10 table agent for the same pass.
- **Done: mv10 glass table + over-range microwave** (agent; not committed). Table in `layout/sets/mv10/glassTable.js`
  (`GLASS_TABLE`): circular-segment glass top 0.91 x 0.33, 0.76 high, bronze rod D rim, bowed leg pairs through a
  collar at 0.27 m, four splayed feet. Ref camera `T0_glasstable`; compare `media/layout/mv10/T0_glasstable_compare.png`.
  Lead's look: the side view (photo 2) matches well. Weaker: from above, the real table's loop pattern doesn't come
  through (the render's rods run nearly straight), and the collar is two beads, not a knot. `OTR_MICROWAVE` + a short
  walnut cabinet above, between the uppers. Repaint in r4: V3_rcv, V3_rcv_obl (+k0, k3, legs), V3h. The r3 page now
  reads mv10, basement90 and kitchen90 guides from `media/keyframes/r3/_layout_snapshot/`.
- **Done: basement90 re-laid out from Jade's diagram** (agent; not committed; NOTES.md dated section). The desk group
  is moved mid-room (GROUP dx -1.624, dz +1.05). Also: a 12-riser open stair along the front wall (foot x -0.37), the
  post at the desk's back-right corner, a wringer washer to the right, two melons front-right. Shelf, boxes, heater and
  old washer removed. `HOUSE.stairDoor` z 1.05..1.85 -> 0.5..1.25. Flags: the desk sits 0.55 m further back than drawn
  (at the drawn depth, the B4/B5 cameras end up under the stair); B4 lens 24 -> 22 mm. kitchen90 changed visibly only
  in K0_plan, K0_wide_night and K8_glass (door edge in the reflection). Repaint B1-B5 in r4. Lead checked
  B0_plan_line against the diagram: matches.

## Session of 2026-11-26 (late morning): Jade's round-3 decision answers

- Jade pasted her answers to the round-3 decision page; saved verbatim in `work/decisions/JADE_R3_DECISIONS.md`.
  Unanswered and kept open: `cliff`, `cl_light`. Agents got `work/decisions/AGENT_BRIEF.md` plus a per-set brief.
- Checkpoint commit a1b791a-ish holds the earlier basement/mv10-table work. `inputs/diagram_basement.png` and
  `inputs/refs_semicircletable/` are now gitignored (Jade's own drawings and photos stay out of the public repo).
- Dispatched: mv10, shanghai86, mortongrove07, closet02, sweatshirt cloth (IAS seal in folds), first love hair
  (panels 5-6 of fl_B v4 have the wrong part), plan/song (bud, Good catch label, artichoke caption, closet caption,
  basement bulb).
- **Plan agent done:** plan rows updated for all round-3 answers (marked "(Jade, 2026-11-26)"); basement bulb was already
  a porcelain pull-chain holder (wording only). New questions collected in `work/decisions/NEW_QUESTIONS_R4.md`.
- **Hair agent done:** `fl_B_backhead_neck_v5.png` and `fl_G_ots_hair_v5.png` (PNG so the kept left columns stay
  pixel-identical); right column redrawn with the part as a short midline notch. v4s in `_superseded/`. The A
  turnaround's figure 1 has the same fault, not fixed. Codex works again; `CODEX_LIMIT_HIT` removed. Repointed
  `media/keyframes/r3/mv10/_prompts/_make.py` at v5.
- **Morton Grove agent done:** real 7-ft grand outline, picture 1.4 x 1.0 m (4x area), mirror 0.95-2.90 m, ridge
  3.6 m over the great room's middle with a tall east gable, flat 8-ft dining ceiling with a soffit, loveseat. MG_wide
  re-cammed (18 mm by the piano bench) to show the east wall and roof angle. Garment hook `GARMENT.*` + `TURN` in
  layout.js; new shot MG2_end. Snapshotted for r3. Repaint MG_wide, MG2_end in r4.
- **Shanghai agent done:** 09:30 sun at true azimuth, elevation cheated 25.67 -> 21.0 deg (eyes 5-8 cm inside the
  light; `sweep_cheat.mjs`); lounger west of her table facing the TV; wicker chair at the balcony's west end; white
  iron railings (new REF_balcony); steam as wisps. Snapshotted for r3. Repaint every shanghai shot in r4. Lead sent
  it back: the uncle goes ON the couch end (it had used an armchair at the couch end, against her pick).
- **Closet agent done:** futon (full, bed mode, black arms, navy blanket; plaid not modelled, say it in prompts) right
  of the opening; he mirrors her on her centre line, four hands meet at the door line (his on hers). New opt-in engine
  option `torso:'real', sex:'f'|'m'` (`layout/engine/torso.js`; default off, office91 BO1 pixel-identical). CL_wide
  is the opening: fingers to temples, camera high right, bottom fifth clear for the caption. Repaint all four CL shots.
  Lead sent it back: a block across her bowed forehead (fringe plank) reads as binoculars.
- Closet fringe plank fixed with opt-in `fringe:'none'` (engine; default off, BO1 pixel-identical).
- **Jade, 2026-11-26:** "the three.js models have dots for eyes, so the image 'actors' can't be told to look where
  they're pointing and this is a problem." Cause: `head.look` turns the head only ~62% of the pitch and the eye balls
  are fixed forward. An engine agent is building aimed eyes (sclera, iris, lids), a gaze line in label mode, sidecar
  gaze checks vs pointing, and `work/gaze_audit.md`, behind a switch until the mv10 and cloth agents finish; then
  flip it on and re-render all sets before r4.
- **Jade, 2026-11-26:** "we should probably make realistic torso shapes and paint them in the main color of that
  character's clothing. in some over the shoulder shots in close proximity, the image models do really weird things
  by confusing one person's shoulder for another person's torso." Given to the same engine agent: real torsos for
  every figure by default, clothing in real costume colours in form/contour/light (replacing code tints), separation
  outlines, and a costume audit. Same switch as the eyes.
- **Jade, 2026-11-26:** "in the basement scene, it really messes up kid Jade's arm." Lead's read of the r3 guides:
  B2 her pointing arm crosses Dad's chest, huge foreshortened hand, painted as Dad's hand; B4/B5 cat pose has a fat
  upper arm and oversized shoulder ball merging with her chest, forearm at a stiff right angle. A basement agent is
  restaging (shots.js only; engine notes go to `work/arm_engine_notes.md` for the engine agent).
- **mv10 agent done:** childhood friend refills snack bowls in the kitchen; first love at the Expedit in k0, then by
  the SSW window with guest B1; `ladleGrip.js` (real grip, `T0_ladlegrip_*`); V3b_prep top-down at the counter by the
  sink with window sun; fridge dark beige; one stair flight down the house's ESE wall, V3e reframed; SI1 just inside
  the sliding door, poi low, no circles; V3a/V3h no first love under the tree; NASA meatball small, no lettering;
  C2a/C2b no cup. Repaint in r4: V3b_prep, V3e, SI1, V3_rcv_obl (+k0, k3), C2a, C2b, V3a, V3c, V3f.
- **Jade, 2026-11-26:** "can you make the torsos shaped realistically like torsos across all instances there are
  mannequins? the shoulder structure is causing weird distortions across lots of keyframes." Sent to the engine
  agent: default for every figure in every set and both code paths, a continuous shoulder girdle (trapezius, clavicle,
  deltoid cap, armpit, scapula; no ball joint), checked on one shot per set.
- **Jade, 2026-11-26:** "the wrists should always be positioned naturally when holding an object." Sent to the engine
  agent: grip solving rotates the forearm and moves the elbow before bending the wrist, within natural ranges;
  sidecar warning when a grip can't be reached naturally.
- **Jade, 2026-11-26:** "we're dropping the dictionary shot because it was so bad." PC5 removed from
  `office91/shots.js` and the plan; PC4 (= PC1's frame) now holds 1:27.4-1:32.7. The dictionary prop stays in Mom's
  hands in the wider shots (her default look is still 'dict'); ask if it should go entirely. Old renders of PC5 in
  media/layout/office91/ are stale, delete on the next office91 re-render.
- **Jade, 2026-11-26:** "objects should also be held in a way that supports the object, not adjacent to the object,
  and objects don't float on top of hands. does fal or cloudflare have gaming engine style tools ...? I don't want to
  invent a physics engine from first principles." Answer: fal has rigging (Meshy, Hyper3D) and text-to-motion
  (hunyuan-motion), nothing for grasp contact; Cloudflare none. Plan: Rapier (WASM) as a hold checker (drop test
  with hands as colliders) + a grasp-template library, given to the engine agent; Jolt soft bodies suggested to the
  cloth agent.
- **Jade, 2026-11-26:** "let's do proper human body meshes always" and "always do correct physics for objects".
  Saved to memory. Plan: MakeHuman (MPFB2) in headless Blender -> CC0 rigged GLB per cast member, a three.js adapter
  posing the skeleton from the existing solver, behind PROOF_BODY=mesh; Rapier hold check for every object. The
  engine agent was told to stop mannequin torso geometry and keep gaze/wrist/grasp/physics as standalone modules.
  Launching the body-mesh agent was BLOCKED by the permission classifier; waiting on Jade.
- **Jade, 2026-11-26:** "for any scene where we have background art or background objects on the walls, we should
  incorporate them into the 3d model so that the image models don't invent new art between generations/clips
  (tell-tale sign of AI-generation)." Saved to memory; an agent is auditing every set and texturing canonical art in.
- **Basement arms agent done:** B2 new 35 mm camera past the screen's right edge, her arm crosses her own chest to the
  word; B5 natural cat paw (elbow low, wrist ~75 deg, 4.5 cm gap); B4 unchanged pose. Child upper arms are 35-45% too
  thick in the engine (`work/arm_engine_notes.md`); body meshes will replace that. Repaint B2, B4, B5.
- **Jade, 2026-11-26:** basement top is the long-sleeved grey sweater (`JADE_BASEMENT` in basement90/house.js:
  0x9a968e, sleeves long). Re-render of basement90 PENDING: the engine was mid-edit (syntax error in the engine
  agent's file) when tried. Jade approved retrying the Blender/MPFB install; the body-mesh agent is now running.
- **Jade, 2026-11-26:** keep a file of every tool and model used, for the closing credits slide ("Animated by Opus 5.5
  and a supporting cast of models: ..."). Now `docs/credits_tools.md`; the agent brief tells agents to add to it.
- **Jade, 2026-11-26 (~midday):** "the same version of clothing logo should be in each frame (not 2 different versions
  of the NASA meatball logo)." Given to the background-art agent (canonical decals under layout/assets/art/logos/);
  added to global CLAUDE.md and project memory. Jade is at 45/104 on the r3 keyframe page, stepped away to cook.
- **Sweatshirt cloth agent:** Jolt Physics soft body (`layout/vendor/jolt-physics/`, MIT, 3.2 MB) in
  `mortongrove07/sweatshirt*.js`; Truth hidden in a vertical knife pleat she pinches; renders with any Truth pixel go
  to gitignored `work/sweatshirt/`. Sent back: rag-like folds from t 0.4, floating drawstrings, MG1 stack silhouette.
- **Jade's r3 review (45/104) saved** to media/keyframes/r3/JADE_R3_REVIEW.md. Set agents dispatched with work/decisions/R4_SET_BRIEF.md; repaint r4 after body meshes land. B4/B5 CHANGE: mouth closed, tongue in, lips and chin CONTACTING the wrist (replaces the gap).
- **r4 plan (lead, 2026-11-26 afternoon):** set-fix agents running for attic88_day, office91, shanghai86, wall88,
  market93 (+ new M4c 2:14.2-2:15.2), basement90, kitchen90, plus plates/comp (artichoke count ends at 8, shimmering
  gold; VOY v1 with a moongazing-style circle round the mote; X_sw/AD_trace caption "Were you afraid during the
  raid?"). Then, in order: body meshes (PROOF_BODY=mesh) + gaze/grasp switch on, wall art/logos in, every set
  re-rendered, then repaint r4 into media/keyframes/r4/ for every shot not marked Good plus every shot whose set
  changed visibly (the per-agent repaint lists above). Painting on the free Codex route only: no paid spend agreed for
  r4 yet (PROOF_CAP = current spend); if Codex's plan limit hits, pause and resume when it resets.
- **Engine agent done:** `--gaze`/PROOF_GAZE=1 (aimed eyes for Jade/Mama/Dad, stranger brow/nose cue, first love
  nothing, label gaze line, sidecar gaze checks, natural wrists), `--body2`/PROOF_BODY2=1 (interim real torsos +
  costume colours, superseded by meshes), `--out <dir>`. Modules: engine/gaze.js, wrist.js, grasp.js (8 templates,
  not wired into shots yet), holdcheck.mjs (Rapier in /home/jade/Documents/layout-deps). Audits in work/:
  gaze_audit.md, hold_audit.md (NOTHING passes yet: thumb sinks ~9 mm into cups, pinches pass through paper,
  furniture not colliders), costume_audit.md (sheet mismatches; Dad vs jade7 tops too close in K1/K3/PC2, uncle vs
  jade3 in V1a). TODO: wire grasp templates into every held-object shot after the meshes; raise eye down-travel to
  ~45 deg; fix costume mismatches against the sheets.
- **Plates agent done:** artichoke counts 1-8 in cut A (ends 4.75 s), metallic gold with glints/twinkles (thread.py, opt-in); VOY v1 ring = moongazing cosmos.js Sagan ring (gold pencil, comp.py ring keys); CAPTIONS table in comp_all.py (record only, comp doesn't draw captions yet). Outputs media/keyframes/r4/plates/.
- **office91 r4 agent done:** schoolTable() (almond laminate, brown T-mould, steel apron/legs) + REF_table; PC2 at standing eye height 30 mm with the table in frame; BO1/BO2 JADE_TIP = the gap (pad on it), look 'gap'; FE_thumbs art matches FE_out; PC5 renders deleted. Repaint list collecting in work/r4/REPAINT_LIST.md.
- **wall88 r4 agent done:** cavity 32 cm clear (was 46), one person per 45 cm bay: Mama nearest, then the praying lady, three workers (a praying man dropped: flagged); no floor in frame; WL_out = WL_eye pose, eyes to Mama, 50 mm; WL_eye v1 picked; WL_plan ref. Rendered with --gaze.
- **kitchen90 r4 agent done:** whisper (Dad's mouth 5.8 cm from Mom's ear, sidecar 'whisper' field), K1 tilt from homework to both heads ending on Mom; fixed kitchen in kitchen90/kitchen.js (oak/almond, every cabinet, fixed counter items; all invented, flagged).
- **Sweatshirt cloth done:** Jolt soft body, 9 cm whole-hand pinch keeps the pleat shut (fragile: re-run sweatshirt_test.mjs and check Truth pixels after any change), drawstrings dropped, cuffs stiffer, surface smoothed; folded stack shows the pleat; her hands use grasp.js power grip. Weak: t 0.5-0.7 reads thin; MG2_end hands flat. Jolt vendored at layout/vendor/jolt-physics (MIT).
- **market93 r4 agent:** artichoke grips from below (web refs, specs in NOTES), M2/M3 numerals re-synced (8 lands 2:13.34-2:13.65), M4 Mama bends, M4b arm sideways; new M4c lift. Lead sent back: M4c in M4b's framing, M4b becomes the landing (forearm grab), plan row reworded.
- **attic88_day r4 agent done:** keyboard.js exact paper keyboard (C3-C6, 22 white/15 black, real sizes, tape on F4|G4, map folds; edge map for line/contour); AD_grab real wrap grip (GRAB_R), Mama kneeling.
- **market93 done:** M4c lift (pulled back 1 m, 32 mm, feet off the floor, Mama's palm-up gesture), M4b landing = forearm grab rhyming AD_grab; M4 and M4b_pull alternates; plan row 2:06.3-2:16.1 reworded.
- **basement90 r4 agent done:** c.1990 task chair (five-star base, casters, gas lift, tweed), feet on two base legs;
  B2 head looks at the fingertip point; B3 new camera, 5.25" sleeve stack, canonical 80x25 DOS screen (dark blue on
  light grey, C program, missed rename `total` on line 10); B4/B5 mouth closed, lips and chin on the wrist. Glow now
  cool white (flagged). GOTCHA: the default render modes skip the painter guides; also run
  `--modes form,contour,light --nojson` after a default render.
- **shanghai86 r4 agent done:** joinery.js (folding leaves really fold, brass butt hinges, jamb z-fight fixed), V1f over Mom's shoulder from the hall with all four adults looking at her; every adult in slippers over socks; V1g real glazed bookcases, individual spines, real armchairs; suite olive green (flagged).
- **Background-art agent done:** canonical textures in office91, mv10 (spines.js, meatball 1959 insignia WITH lettering, SR-71 tee), shanghai86, closet02 (plaid), mortongrove07 (picture; lead added the build.js hook and re-rendered). Engine: opt-in look.art in render.js (art in every mode, edge map in line/contour). 25 Codex images, $0. Audit and questions: work/background_art_audit.md. No wall art at all in kitchen90, basement90, market93, playground23, wall88, attic88_day.
- **Body-mesh agent done:** Blender 4.5.17 LTS in ~/opt, MPFB2 2.0.18 + CC0 system assets; 22 GLB bodies in layout/assets/bodies (make_bodies.py, bodies.json; guessed ages marked); adapter layout/engine/humanMesh.js poses the skeleton from the solver's joints, fingers on solver joints, eyes via gaze.js, bakes to static meshes; switch --body mesh / PROOF_BODY=mesh. First love faceless mesh. Problems: bodies are bare under colour (chest shapes show), generic hair (first love's cut wrong, kids ponytails), solver eyes 2-4 cm high, short MakeHuman upper arm. Next: clothes + hair pass, set head-hide logic, grasp wiring, then switch on everywhere.
- **Body meshes pass 2:** CC0 clothes (crew top/tee/jeans/skirt, apron panel), hair from scalp (first love stepped cut, kids fringes), strangers blank-faced; all 11 sets render --body mesh --gaze. Sent back: first love's hair blotchy cap, kid fringe holes, pale garments vs skin in form, neck stretch, PG2.
- **Body meshes pass 3:** first love's hair solid lower section with a step (still slightly domed), kid fringes soft with brows visible, warm skin tone in form/flat, per-body neckDelta (head offset 0-7 mm), PG reflections dark. Ready to flip after the grasp agent.
- **Jade:** first love's hair 60-70% dark chocolate: _cast.js hair 0x352219 (both ages); prompt wording in cast/first_love/NOTES.md.
- **Hold pass done:** cup grips at the right radius, pinches meet, holdcheck measures contact on object geometry, furniture/laps/arms are supports. 405/423 pass on the mesh body (work/hold_audit.md). Remaining: ~20 mesh-vs-mannequin girth cases (stage for the mesh), MG2 soft-body hoodie, poi tether, closet/wall contacts not checked. Staging tweaks to review: K1 left hand on the page edge, M4b forearm forward, mv10 11 cm nearer the juicer, shanghai spine 40, artichoke thumbs splay.
- **Jade (told the hold agent directly, 2026-11-26 evening):** the childhood friend is 1.85 m (was a 1.73 guess),
  Ukrainian, Russian-speaking; "his arm hairs are dark blond" (whose: the friend's or first love's? asked on the
  decision page). mv10 build.js GUEST friend + LH(1.85) updated; his holds re-staged and passing.
- **Jade:** the childhood friend's arm hair is dark blond (answered; card removed, logged in the page's done list). Painter prompts for shots showing his bare forearms should say so.
- **Jade:** the ladle is weirdly shaped; use downloadable models for common household objects. Props agent: phase 1 audit + downloads (Poly Haven, Smithsonian, Kenney, Quaternius, Sketchfab CC0/CC-BY) into layout/assets/props/ + _props.js; phase 2 swap-in after the re-render agent finishes. Rule added to global CLAUDE.md. r4 repaint tooling ready (tools/kf/r4lib.py, r4_run.py, r4_page.py, media/keyframes/r4/<set>/_prompts/; 74 shots, 148 takes, Codex only); run after the re-render AND props swap.
- **Switch-over done:** mesh bodies + gaze are the DEFAULT (PROOF_BODY=mannequin / PROOF_GAZE=0 to revert). All sets re-rendered incl. painter guides and masks. Holds 421/423 on the mesh (MG2/MG2_end soft hoodie). Friend body rebuilt 1.85 m, caucasian; hair 0x9a7a52 (flag). Problem list sent back for fixing: POV head-hide on mesh (casterMeshes) cuts arms/hair, ears through hair, hair specks, B4/B5 face hidden, BO sleeves over hand, pencil through sweater, stray hand PC3b, K6 fists, WL_eye wall-eyed, MG cap/stack/rag.
- **Jade, 2026-11-26 evening:** HOLD the r4 repaint until she has answered the round-4 decision page (and finished the r3 review); otherwise much would be repainted twice. Fixes and prop swap continue; no painting.

## Session of 2026-11-26 (late evening): Jade's round-4 decision answers

- Pasted and saved verbatim: `work/decisions/JADE_R4_DECISIONS.md` (all 42 cards answered). The r3 keyframe review
  (the other 59 cards) is not in yet.
- Interpretations to check with Jade:
  - mg_dining_ceiling: read as "no slope and no step: two flat levels, high on the mirror side, low over the dining
    side, the dining room's ceiling one flat plane". The MG agent flags its reading.
  - voy_ring_time: "as the pull-back lands on the Voyager frame", so the 0.79 s draw-on starts at the landing.
  - Wall: an optional brief overhead shot (WL_top) is added as an alternate, not yet in the plan.
- Applying with set agents (brief `work/decisions/R4D_BRIEF.md`). Each set agent also does that set's props phase-2 swap,
  so no two agents touch the same set.
- **Jade, mid-session:** "in the closet scene, put her in the red stanford sweatshirt, white seal on pocket level, but
  scrunched up and illegible b/c of fabric". Sent to the closet02 agent: one canonical seal decal at pocket level,
  folded so it can't be read.
- **Jade, mg_dining_ceiling settled:** "single ceiling tilting from high to low, high side is mirror side, the wall
  behind jade on the couch is a trapezoid". This replaces my earlier "two flat levels" reading. Sent to the MG agent.
- **Jade: repaint r4 without the rest of the r3 review.** "a lot of the r3 questions are hard to answer b/c so many
  images are made from models where wrists are at weird angles or clip through things, so let's do the repaint and
  then i'll do comments on r4". The hold is lifted. The other 59 r3 cards are superseded, and Jade reviews r4
  instead. Plan:
  1. the set agents finish;
  2. a wrist-and-clipping audit across every shot (wrist angles within natural limits, zero penetration, measured);
  3. a final re-render sweep and the gallery;
  4. the REPAINT_LIST covers every shot;
  5. paint on free Codex, most-corrected sets first, continuing after the plan-limit reset;
  6. the r4 page.
- **Plan/comp r4 agent done:**
  - comp.py draw_caption() (IM FELL italic, small and low); CAPTIONS draw specs for X_sw, AD_trace and CL_wide.
  - VOY ring keyed to start at 1:59.2 (119.19 s, flagged: the plan had no landing time), 0.79 s, no quote.
  - Cliff at 3:54.9.
  - BR1-BR3 now neuron footage (5.9x); the CODA_bud slot is the only bloom (7.756x).
  - Basement screen cool white and the QBasic chat app in the plan.
  - Test frames in media/keyframes/r4/plates/CAP_* and VOY_ring_*.
  - Proposed X_sw 1:35.6-1:36.0, which needs BO2 shortened to 1:34.7-1:35.6 (not done).
- **Jade:**
  - xsw_slot = (a): X_sw at 1:35.6-1:36.0, BO2 shortened to 1:34.7-1:35.6. Sent to the office91 and plan agents.
  - **The playground is Catch Air in Austin** (an indoor play centre). A new dedicated playground23 agent is
    rebuilding it with no Catch Air branding (a real business). The office agent handed playground23 off.
  - **Guide brightness check before repaint:** check every guide sent to the painter, so none is too dark for the
    image model to read. Measure luminance and look at it; brighten the light/exposure where needed. Part of the
    pre-repaint audit (step 2 above).
- **Jade on Catch Air:** "most of catch air is far from windows, it's all indoor overhead lights, and it's all space
  themed". The low sun through glass is gone. The playground agent is building 2-3 options at PG2 for the beam/mote
  rhyme's light source (a fixture, a theme light/porthole, or dropping the beam here), with reflections in the play
  structure's acrylic. Jade picks.
- **Jade, the playground beam is (b):** a space-theme light gives the beam. New staging: "instead of looking at reflections
  (which is a bit boring to look at), we can have me and my dad offering a hand to the 2 kids getting into a play
  space shuttle". The reflections are dropped. The kids' ages/sexes are unknown (placeholder 3-6, flagged; asked
  Jade). Dad at ~66-67 is flagged.
- **closet02 agent done:**
  - Window wedge plus a flush-mount dome ceiling light (type guessed).
  - The futon is turned 90 degrees, with a matte black rounded-square tube railing in rounded-rectangle arm loops.
  - CL_ots camera lowered to 0.76 m.
  - She wears a red pullover hoodie, with a code-drawn generic seal decal (closet_seal.png) on the kangaroo pocket,
    cut by sculpted creases and illegible.
  - The cast/jade_19 sheet text still says a grey hoodie (the cast agent's folder).
  - Repaint: CL_wide, CL_hands, CL_ots, CL_chin (+ CL_elev ref).
  - Lead removed the stray untracked media/layout/attic88/A* renders.
  - Lead's look: lit is bright enough. His hair is still a smooth cap (the cast agent's job), and the closet clothes
    are flat slabs with no hangers (pre-existing).
- **Jade, the playground kids:** "girl, younger, age 4, boy, older, age 7, her image is in
  1-music-shipped/chaosmonkey-video, and his image is in the original moongazing video".
  - The girl: chaosmonkey-video/design/characters/daughter/daughter_A_turnaround_v3.jpg (strawberry dress, brown
    braided pigtails), 109 cm.
  - The boy: moongazing/media/chars/T/SHEET.jpg (star/planet/rocket sweater), 132 cm.
  - The sheets are referenced by path and not copied into this public repo. No names.
  - Sent to the playground agent. pg_kids is answered; pg_dad_age is still open.
- **Jade:** "dad's hair should be like his reference photo". inputs/family_photos/Pasted image.png is the real
  photo: look only, never sent to a model. The lead read it as near-black, full, swept up and back with a side part,
  short sides, at most a faint grey at the temples, and thin rectangular semi-rimless glasses. Sent to the playground
  agent for 2023 Dad (no longer grey). pg_dad_age is partly answered: the hair is settled, the age ~66-67 is still
  assumed.
- **office91 agent done:**
  - Geese decal sw_geese_print.png on dusty rose 0xb97a78.
  - Her skirt changed to washed denim per the cast sheet (flagged).
  - Real typewriter, phone, tissues and pencil cup.
  - X_sw shot at 1:35.6-1:36.0, BO2 at 1:34.7-1:35.6.
  - Holds 21/21.
  - market93: no change needed (holds 35/35, artichoke count already current).
  - Repaint: X_sw, PC3a, BO2, PC2 (PC1/PC4 if the sweatshirt shows).
- **Jade, the boy:** "son is 99th percentile height for his age and has a 20% larger head than typical for his age and
  height, so he looks like a younger kid who happens to be tall". Sent to the playground agent.
- **shanghai86 agent done:**
  - Plain brown-rust suite (0x683826).
  - Two scrolls (the Wang Bo couplet) on the hall-door half; balcony-side scrolls removed; 宁静致远 dropped.
  - Real thermos flasks, mugs and plant. Holds 24/24.
  - Repaint: V1a-V1h (+ PB1).
  - Lead checked REF_wide_lit: scrolls by the hall doors, suite reads, bright enough.
  - **TODO lead:** the mug grip points in props.json are mirrored (handle on +x). Fix centrally once the agents are
    done; MG and mv10 were warned.
  - The pre-existing wrist warnings on jade3 R and mama86 R in every Shanghai shot go to the wrist audit.
- **Jade:** "the shot for the space shuttle should be from behind so we don't look closely at the kids faces". Hard
  rule for every playground shot: the children's faces are never readable. Sent to the playground agent.
- **Cast/hair agent done:**
  - First love v6 sheets: fl_B_backhead_neck_v6.png and fl_G_ots_hair_v6.png (lived-in, finger-combed pieces), plus
    fl_A_turnaround_back_v5.jpg (notch only). The 3D hair has combed ridges and a squarer top.
  - Mama: jaw-length side-parted perm at every age (part over her right eye, flagged). CAST.md updated.
  - Aunt, grandmother and adult_f buns are now built into the GLB (humanMesh.js guard).
  - The lead pointed r4lib.py and _brief_r4.md at v6. The lead looked at B v6: no face, lost profiles only. The
    colour reads medium brown, lighter than 0x352219: the prompts must keep saying dark chocolate.
  - Lead's look at bodytest_lit: very dark. Mama's perm reads as a smooth bob at that light.
  - wall88/NOTES.md still says bun.
  - Sweep: every set (Mama is in 8, first love in 3).
- **Jade on the sweatshirts:**
  - **Geese:** "the geese are basically fine but the bows shouldn't be messed up like that (in the AI-generated
    image way)". The office agent is redrawing clean bows and compositing them on.
  - **Closet:** "the actual stanford sweatshirt I have is an oversized darker near-brick-red with STANFORD sewn in
    cream block letters, but I felt like that was too legible. I was envisioning taking the existing hoodie and making
    it cardinal red with a white seal at the pocket instead of whatever that is. also she shoudl be wearing socks."
    The closet agent is redoing it: her existing hoodie recoloured cardinal, a clean white seal broken only by real
    folds, no lettering, white socks.
- **Jade, first love's hair reference:** "the actor who plays gaius baltar from battlestar galactica -- it's that
  color hair, similar degree of messiness". The cast agent is making v7 sheets and mesh hair: the cut is kept; the
  colour and the tousle are matched in words. The actor's name stays out of image prompts.
- **Jade: Mama's part (over her right eye) is fine.**
- **Closet hoodie redone:** her sheet's open zip hoodie in cardinal #8C1515 over a white tee, with a clean white
  seal (rings and a tree, no letters) on the left pocket half, partly folded; white socks. Question cl_seal_place
  (open vs zipped).
- **Geese bows redrawn in code** (tools/art/geese_bows.py), identical on all five geese; the v1 decal is kept.
- The lead looked at CL_elev_lit and X_sw_lit; both are clean.
- **Jade:**
  - "the seal should be on breast pocket location, the normal place where school seals go, not on a lower pocket".
    The closet agent is moving it to the left chest, still broken by folds. cl_seal_place is answered.
  - "geese location and image is fine but the social worker's shoulders are weirdly misshapen". The office agent
    is diagnosing it: pose vs skinning.
- **Jade: "hold off on the repaints until next session, i think".** No r4 painting this session. Finish the set
  fixes, the wrist/clip/brightness audit and the re-render sweep, so the next session can start painting straight
  away.
- **Cast agent v7 done:**
  - fl_B/G/A v7 sheets after Jade's reference: tousled, colour 0x3d2819 (FL_HAIR in _cast.js).
  - The mesh hair is rebuilt; painter refs point at v7.
  - Lead's look: no face. The hair reads chestnut/medium brown, lighter and redder than a rich dark brown. Shown to
    Jade.
  - Stale: the playground23 copy of make_bodies.py; prose refs to v5 in closet02.
- **office91 shoulders:** the cause was staging. She had no elbow target, so the elbows flared and the shoulder
  over-deformed; elbow targets were added in shots.js. LEFT FOR NEXT SESSION: a small notch at the top of each
  shoulder seam, likely skin poking through the garment at the collarbone/upper arm. It's a body/garment fix in
  layout/assets/bodies or humanMesh.js, and probably affects every mesh figure with raised or forward arms.
- **attic88_day + wall88 agent done:**
  - New layout/engine/clipcheck.mjs (Rapier: body vs world/body, contacts, joint limits). Run it with
    `node layout/engine/clipcheck.mjs --set S --exclude beam_`.
  - AD_grab: both standing, IK-searched, 0 mm penetration, new 24 mm camera showing the keyboard. It no longer
    rhymes with M4's 50 mm framing: question for Jade.
  - AD_trace is standing too.
  - WL_in: re-solved, palm flat on the brick, 0 mm. The line of five moved off the brick and is spaced 50 cm apart.
  - Brick texture: Dutch Waalformaat (the attic is in the Netherlands per the plan).
  - WL_top alternate, proposed for 1:51.0-1:52.2.
  - Mesh soles sit ~13 mm under the floor in every set: an engine fix for next session.
  - Lead's look:
    - AD_grab_lit reads and is bright enough.
    - WL_in_lit is almost all black (only the beam and mote): the painters must get form/contour, or the lit needs
      lift.
    - WL_in_form shows a stray hand by Mama's neck/ear against the stud. NEXT SESSION: identify whose hand it is and
      fix it.
- **office91 shoulders DONE** (SW_ELBOW targets; 25/25 holds). Left: the shoulder-seam notch (humanMesh.js prep(), clavicle vs upper-arm groups; garment not covering). The right-most goose's tail is slightly ragged.
- **playground23 rebuilt (done):**
  - An indoor space-themed play centre, a soft-play shuttle, a theme spot beam (PG2 39.5 degrees, mote centred).
  - From behind, Jade with the girl and Dad with the boy; clip and hold pass. Brightness is fine.
  - Kid and Dad-67 bodies are a stopgap in the set's bodies/; move them to layout/assets/bodies.
  - Engine bug: dress figures have no bare legs.
  - Lead's look at PG1:
    - The hand contact doesn't read as "offering a hand": the adults' hands hover by the kids' backs or hips, and
      the kids stand on the steps facing the hatches rather than climbing in. NEXT SESSION: restage so each child
      reaches up/back to a clearly held hand mid-climb.
    - Pale shapes stick out either side of the boy's head (ears?). Check them.
  - Questions: Catch Air vs PlayMazing (renamed 2019); who helps whom; the boy in boots or socks; Dad's glasses;
    2023 clothes.
- **basement90 + kitchen90 done:**
  - check_bodies.mjs (three-mesh-bvh): 0 body overlaps (was 1125-1865 tri pairs).
  - Eyes: the "crossed" look came from 0.34 m convergence; now 0.42-0.46 m.
  - The QBasic 1.1 editor with CHAT.BAS (COM1 split-screen chat); the missed rename is txt$ -> outLine$.
  - IBM keyboard, bulb, kettle and rice cooker models.
  - Open: Dad's wrists are past the pronation limit (11/26 deg); the B4/B5 cat-paw wrist is 91 deg past (kept for
    the lips contact); Jade's forearms are 15 mm into the kitchen table; check_bodies hangs on K4_writes.
  - **Lead caught:** the K1 whisper gap grew from 5.8 cm to 14.9 cm (sidecar whisper.gap_m), and both points are
    above the frame (px y<0). Jade said Dad whispers in Mama's ear: NEXT SESSION restore a whisper-close gap without
    overlap.
  - Questions: the QBasic colours; how Jade reaches the table (phone book recommended).
- **mv10 done:**
  - Fist grip with the thumb on top, on the real ladle (strip 11x3.3 mm).
  - SI1 at the Expedit; first love's back of head at the left edge.
  - Only Jade's six titles are lettered.
  - Red cups, juicer, bowls, pitcher; lemons and rinds settled with Rapier (settle.mjs).
  - Holds 308/308. A 12 deg radial-wrist warning remains on the friend's grip.
  - Lead's look: SI1 reads. First love's hair renders orange-brown in SI1_lit (lighter than intended); check the
    colour after the sweep.
- **mortongrove07 done, except the hands:**
  - Done: one tilted ceiling plane (3.6 -> 2.44 m, flagged), the 7'1" grand model (CC BY), the ink horse (invented
    inscription and seal), the real mug.
  - NOT FIXED: fingers 13-20 mm into the hoodie in MG2/MG2_end. Every fix opened the pleat and showed Truth. It
    needs a cloth pinch grasp plus an engine/hand.js wrapPose change (thumb palm-side for cloth).
    cloth_contact.mjs measures it.
  - Truth 0 in every media/ SW_*.png. The untracked SW_*_close/_her test PNGs are left uncommitted.
  - Lead's look at MG_wide_lit: very dark; the mirror reads as a blank dark slab. Brightness pass needed.
- **Decision page rebuilt for round 5** (16 cards, proof-decisions-v6). Seen while building it: AD_trace reads as a
  thumbs-up; a dark blob on the social worker's back in REF_sw_back.

## Session of 2026-11-26 (night): Jade's round-5 answers

- Pasted and saved verbatim: `work/decisions/JADE_R5_DECISIONS.md` (14 cards answered). Brief: `work/decisions/R5_BRIEF.md`.
- `inputs/catchair_shuttle.png` (Jade's photo of the play centre, a real business) added to .gitignore: look-only.
- Lead read of BO2: "the finger should point to the middle of the missing space" = little Jade's finger (BO1/BO2),
  not the social worker's (she stays on ANXIOUS). BO2_lit is blown out white: the office agent fixes exposure.
- Plan edited by the lead: BO2 -> X_sw -> AD_trace are plain cuts (no finger match); WL_top added at 1:51.0-1:52.2
  before WL_in.
- Seven agents running, ownership in R5_BRIEF: engine-body (SW shoulder vs the parents', SW back blob, soles,
  dress bare legs, mug grips, shanghai wrists, check_bodies hang), office-market (BO2 finger centred, cart model),
  attic-wall (AD_trace finger, WL_top shot, WL_in stray hand, WL_in_lit brightness), kitchen-basement (QBasic grey on
  blue, Jade sitting on one foot with the other dangling, K1 whisper, wrists), mortongrove (steeper ceiling from
  mg_streetview.png, all-black piano, horse galloping left + vermilion seal, cloth pinch in hand.js, MG_wide_lit
  brightness), playground (restage on the photo's low soft-play shuttle, Dad 66-67 salt-and-pepper with white
  temples, semi-rimless glasses, white polo, black pants, black backpack with a black/green pixel bottle and a pink
  cat bottle, boy in socks, Catch Air), cast (first love v8: hair colour matched to Gaius Baltar's in the prompt).
- Jade's own 2023 outfit was not described: keep the guess, ask again.
- **Jade: "you can have me wearing the rare earth outfit"** for playground23 (her chaosmonkey-video outfit, CANON.md
  "Jade (v3)": cropped white racer jacket with orange bands, black mock-neck, navy cargo trousers with orange straps,
  pale-blue circle on the back). Sent to the playground agent; back decals as canonical textures.
- **attic-wall agent done:**
  - AD_trace restaged: the index fingertip is on the frost fern, the other fingers are curled, and the camera is now
    35 mm from her right side.
  - The stray hand in WL_in was the praying worker's, now tucked away (a ~10 px fingertip speck remains).
  - WL_top is a real shot at 1:51.0-1:52.2; WL_in/WL_in_empty run 1:52.2-1:54.5.
  - Lit guides brightened (WL_out 3.8->36.9 mean, WL_in 38.6->61.2); the beam is still 3-7x brighter than its
    surroundings.
  - AD keys shots still flag reach 1.23-1.41 (arms fully stretched to the keys), as in r4.
  - Repaint: AD_trace, AD_grab, WL_in, WL_top.
  - Lead's look at AD_trace_lit: it reads as a pointing finger near the frost rather than clearly tracing. Ask
    Jade whether it reads.
- **office-market agent done:**
  - BO1/BO2: little Jade's fingertip is on the middle of the missing slot, 1.9 px off. The old target was a seventh
    face at the short row's spacing, 6.4 mm past the column.
  - The lead changed tools/kf/handout.py's gap point to match layout.js GAP. It has not been re-run.
  - The saturated lit guides (H1, H1b, PC3b, BO1, BO2) now have a per-shot exposure of 0.27, so 0% of each frame is
    pure white.
  - The resting hands no longer sink into the table.
  - Market: a downloaded US supermarket cart (CC BY 4.0, alexvladimircm), settled with Rapier; grip re-staged.
    Holds: office 25/25, market 35/35.
  - Open:
    - The grandmother's mesh fingers are 10.6 mm into the cart handle (the same mesh-hand vs grip gap as MG).
    - The social worker's hand is 13.8 mm into the table.
    - Feet 14 mm into the carpet (the engine soles fix should cover this).
    - Mom's clothes are 14 mm into the chair.
  - Repaint: BO1, BO2, H1, H1b, PC2, PC3b, M1, M4b, M5.
  - Plan: BO2 -> X_sw -> AD_trace are plain cuts (done).
- **playground agent done (round 1 of follow-ups):**
  - The shuttle is rebuilt to Jade's photo: a low white body, a black-and-white panelled ramp wing, a black block and
    an arch section, with a soft-play rocket and a generic astronaut behind.
  - PG1 restaged with the kids mid-climb, each hand held; hold 0.4-0.5 mm, clip clean.
  - Dad 2023: salt-and-pepper hair, white polo, black trousers, a generic black backpack with a pixel bottle and a
    cat bottle (CC BY models).
  - Jade in the Rare Earth outfit. Her back circle is blank: no lettering readable on the turnaround.
  - Boy in socks; the pale shapes by his head (cheeks/ears under short hair) are fixed.
  - Bodies moved to layout/assets/bodies/*_pg23. The engine agent will register them and remove the girlLegs()
    workaround when its dress fix lands.
  - Lead's look at PG1_lit: reads well. Sent back two fixes: her sleeve patch maps as a HEART, and Dad's grey hair
    reads as white stripes/cornrows. Plan row updated.
- **mortongrove agent done:**
  - Ceiling measured from mg_streetview: the gable pitch is 0.57 (about 30 deg), but carried across 6.3 m it would
    top the wing's ridge. Built as one plane from 2.44 m to 5.10 m (pitch 0.42). Question mg_ceiling_high.
  - Piano all black. Horse mirrored to gallop left, the old inscription painted out, one vermilion seal (Codex, $0).
  - hand.js: an opt-in `thumb: { wrap: 'palm' }` hook grip.
  - Hoodie hands: the MG2 shoulder hands are now <=0.9 mm. The two pinch hands are still ~15 mm in: every posed hand
    on the pinched pleat showed Truth.
  - MG_wide_lit mean 49.6 -> 75.4; the mirror is pale glass.
  - Clip check still flags her ~40 mm into the couch seat (kept: it shapes the drape) and the soles (engine fix).
  - Repaint: MG_wide, MG1, MG1_end, MG2, MG2_end.
  - Round-6 questions are collected in work/decisions/NEW_QUESTIONS_R6.md.
- **cast agent done:**
  - First love v8 sheets (B/G/A): the hair colour is matched to Gaius Baltar's in the prompt (the character is named,
    never the actor), measured #2e2420-#3c302a. No face on any study (lead checked G v8).
  - FL_HAIR 0x3d2819 -> 0x1f1915, tuned on renders.
  - r4lib.py and _brief_r4.md point at v8.
  - The v7 sheets stay until decisions.html stops linking them.
  - Sweep: mv10 (his shots), closet02, mortongrove07. _cast.js changed during the cast agent's tests, so the
    committed MG r5 renders may carry a test colour.
- **kitchen-basement agent done:**
  - QBasic 1.1 default colours (#AAAAAA on #0000AA, the menu bar and status line from memory).
  - Jade (jade7, 1.22 m; the lead's brief wrongly said 3-4) sits on her folded left foot with the right leg
    dangling, clearing the table; new ref shot K0_seat_side.
  - K1 whisper gap 0.059 m with zero overlap.
  - Dad's pronation is in range; the cat paw is re-solved at 59.5 deg (limit 60).
  - The check_bodies hang was three-mesh-bvh's uncapped search, now capped at 5 cm (set-local).
  - Still failing: the kitchen day shots (Mama's thumb wrists 63 deg past, thighs 14.7 mm into the chair;
    pre-existing) and the basement soles (engine fix).
  - Engine ask: a per-leg foot direction (footL/footR) in legOpts.
  - Repaint: B3, B4, B5, B0_wide, B2, K1_question, K1_question_end, K3, K0_wide_night.
- **engine-body agent done:**
  - **Social worker's shoulder:** the root cause was in solvePose. The upper-arm twist reference was taken before the
    body's yaw, so every figure turned away from +z had its upper arm twisted 173-176 deg against the chest. The
    parents (yaw ~0) were fine. Now 0-1 deg for everyone, so shoulders change in every set.
  - **SW back blob:** the haze volume in the lit pass; render.js now draws haze by its far faces only.
  - **Soles:** now 2-4 mm above the floor, and seated feet are flat.
  - **Dresses:** bare legs below the hem; girlLegs() removed.
  - **Mug grips:** the handle is on +x; grips fixed.
  - **Shanghai wrists:** all in range. Mama's jamb hand in V1e is a little stiff.
  - **Clipcheck:** the sheet false positive is fixed.
  - **Bodies and legs:** the playground bodies are registered (costume `body: '<id>'`); legOpts takes footL/footR.
  - **Not done:**
    - holdcheck's hand is thinner than the mesh hand (proximal 6-15 mm, palm 10-17 mm): widen the hand.js capsules
      or check with the mesh hand.
    - Seated thighs are ~14 mm into chairs engine-wide: raise seated hip heights ~5 mm.
- **Decision page round 6 built** (13 cards, proof-decisions-v7; the r5 page is backed up in work/decisions/).
- **Re-render sweep done:**
  - Shoulders on every turned-away figure are natural.
  - First love's hair is right in mv10 SI1, but warm chestnut under the closet key.
  - Floor clipping is gone everywhere: basement 7/7 clean, kitchen 12/16.
  - NEW from the soles fix: first love's foot 15.8 mm into the closet wall; jade27 deeper into the mv10 counter toe
    kick (39 mm) and cabinet doors (9 mm). N3's cloth into jade27 in V3_rcv_obl_k3 went from 38.1 to 43.4 mm.
  - Dark lit guides (<35 mean) in wall88, market93, kitchen90 and mv10; AD_fern is blown out.
  - The legacy attic88 renders (259 MB, untracked) were deleted.
- **Post-sweep fix agent running:** those clip failures, the brightness pass, and the closet hair light.
- **Post-sweep fixes done:**
  - The closet foot is off the wall, and the closet-lit hair is dark cool brown (#2f2620).
  - mv10: Jade is off the counter, N3 is clear of her, holds 308/308.
  - Lit guides lifted to >=40 mean in wall88, market93, kitchen90 and mv10 (WL_top 35.8: its black void is intended).
    AD_fern has 0% pure white.
  - Lead looked at mv10 V3b_prep_lit and SI1_lit: fine.
  - Pre-existing clips are still open: closet knees/wall/carpet; mv10 32 of 33 shots (couches, sandals, snacks, ladle
    7.6 mm); kitchen day shots (Mama's wrists, chair).


## Session of 2026-11-26 (late night, painting) — Jade's directions as given
- V1d_2: her right wrist looked weird (flex 51 deg, radial 16, elbow 5 deg straight); lead chose to move her, not PD (agent running).
- First love's hair: v8 too dark; v9 sheets made (#43352d-#463830 vs #3f342e), committed a106ccc, r4lib points at v9.
- Stubble: shorter, "more like a 5 o'clock shadow" (v10). The v9 chin-stubble technique is "not a bad direction for forearm hair" (v10 + D v5).
- G sheet closet panel: the left foot is not natural for a cross-legged sit; the hands there are weird too (v10).
- Codex plan limit hit 22:57 (resets 03:41) after ~75 images. Jade APPROVED paid gpt-image-2 via Cloudflare for tonight's remainder ("we have plenty of credits").
- Accepted: first love B v10 (B_t1) and G v10 (G_t3); r4lib points at them, with a 5 o'clock-shadow clause (c9718bf).
  A and D wait for 3D guides (new rule: model image-model weak spots, such as bare feet, toes and held hands, in
  the engine, cast sheets included).
- Jade: first love wears plain black slacks in every scene, at every age ("it feels more like him"). The costume
  agent is changing the sets and prompts; the cast sheets that show his trousers need edits.
- V1d_2: she moved 10 cm forward, her elbow is bent and her wrist near straight; the table is at her chin when she sits
  cross-legged. Recommended: accept as is (awaiting Jade). Shanghai is re-rendered after the engine's cross-legged pose fix.
- Jade: first love's foot is EXACTLY the same size as hers (251 mm; "we often shared shoes"). The engine renders it
  at 217 mm, so PROP.foot isn't applied; the engine agent is fixing it for every figure and checking hands too.
- G v11 accepted (G_t4: tidier tousle at the A_t2 level, black slacks); the hair wording is toned down at the source (cbc81ab).
- Jade simplified the D hand hold: he takes one of her hands in both of his. 3D guides in cast/first_love/_prompts/v10/guide/.
- Jade: closet uses the same hold as the D sheet (the gesture is still being chosen: an agent is curating stock
  hand-hold photos, look-only, in the scratchpad handrefs/). Then: pose it in 3D for D and CL_hands.
- Jade: CL_chin DROPPED (him rubbing her hand along his stubble). It's out of the closet _make.py; D drops study 4.
  Its 1.7 s (3:32.5-3:34.2) needs covering in the edit (open).
- Engine: mesh feet were ~13% short and hands ~3.5% short for EVERY figure; now exact (Jade and first love 251 mm).
  All sets are being re-rendered; a list of already-painted shots where it shows is coming.
- Paint status, 00:40 on 11-27: 25 r4 takes are still unpainted (K10_mote_in x2, X_sw_v2, BO1/BO2/FE_out/FE_thumbs
  x2, mv10 BRpan_a/m1/b/c, V3b_prep, V3a, V3b x2). They're held until the engine agent finishes re-rendering every set
  (feet, hands, cross-legged). Then regenerate each set's prompts (_make.py) and paint. Jade: once Codex resets
  (03:41), run Codex IN PARALLEL with paid gpt2 (remove work/kf_logs/CODEX_LIMIT_HIT after the reset; never use
  --route auto). The runner is in the scratchpad: paid_run.py. (A waiter loop that pgrep'd its own name hung; fixed.)
- 02:20 11-27: Hold test read (Jade): H2/H3 inaccurate. Cause: their guides had him on the RIGHT (H1 and the D_t4 style
  ref have him LEFT) and the prompt never named sides, so the painter swapped them (his arm hair on her); H2's covering
  hand pinched her wrist. Jade sees a clip H3 -> H2. New guides H3b/H2b (one camera, him LEFT, identical bodies; H2b =
  H3b + his right hand over the back of hers) being built by an agent -> cast/first_love/_prompts/v10/guide_hb/. Then
  paint 2 takes each on paid gpt2 with sides + sleeve colours + who has forearm hair named in the prompt.
- 02:10 11-27: engine r7 done (feet/hands/cross-legged; all sets re-rendered). Paid gpt2 run started (scratchpad
  paid_run2.py, log paid_run2.log): the 25 held takes + repaints B1_feet/AD_piano/AD_wide as v3/v4.
- ~02:50 11-27: paid_run2 DONE, all 31 OK (25 held takes + B1_feet/AD_piano/AD_wide v3/v4); a review agent is writing
  notes to work/r4/PAINT_LOG.md. H3b/H2b guides done (cast/first_love/_prompts/v10/guide_hb/, layout/sets/fl_hands
  CAM_HB, his trunk twisted 30 deg toward the hold); prompts H3b.txt/H2b.txt name sides + who has arm hair; 4 paid takes
  running via run_hb.sh -> takes/H3b_t1/t2, H2b_t1/t2. Memory: guide-identity-by-colour-and-side, hand-closeup-process.
- ~03:20 11-27: hold clip takes. H3b_t1/t2 good (t1 cleaner). H2b_t1/t2: identity right but his ARMS SWAPPED vs H3b
  (upper arm = cover). Retake H2c (prompt says which arm ends where + H3b_t1 as first-frame ref): H2c_t2 CORRECT (his
  right forearm crosses from lower left over the left one and ends on top; left arm's hand underneath), H2c_t1 still
  swapped. Candidate pair for Jade: H3b_t1 -> H2c_t2.
- 09:50 11-27: review of the paid run written to work/r4/PAINT_LOG.md (picks per shot). Weak: BO1, BO2 (dot grid
  counts, fingertip off the slot), B1_feet v3/v4 and AD_piano v3/v4 (paid route drifts off close/low framing: keep v2),
  BRpan_b (Feynman set painted red per prompt vs slate blue in the guide/spines: fix prompt or spines.js, Jade's call),
  V3a (no NASA patch, belt, lemons, flats). Codex reset passed; CODEX_LIMIT_HIT removed; free Codex re-rolls running
  (scratchpad codex_rr.py/log): B1_feet v5/v6, AD_piano v5/v6, BO1 v3/v4, BO2 v3/v4. Review page rebuilt.
- 10:10 11-27: Jade: Feynman set is RED. Cause of blue: the FORM guide pass (described to painters as "REAL colours")
  tints books/figurines a blue-grey clay (mv10 BRpan: Feynman slate blue, red devil pale blue). BRpan_b was red only
  because its prompt named it. Fix: pan() prompt pins the Feynman set red + devil red + "the form tint is not their
  colour"; BRpan_m1/BRpan_c v3/v4 queued on Codex (codex_rr2). OPEN: engine-level fix of the form pass's prop tint (all
  sets) or change r4lib's "REAL colours" wording.
- 10:10: Jade on H3b/H2c: his right hand hovers (guide), thumb thorn on her hand (mesh crease, in the guide), lower hands
  unreadable (guide), her left hand looks long, his left forearm clips into his leg (looks thin). All sent to the guide
  agent; repaint after.
- 10:25 11-27: Jade: match all textbook spines to the real editions (likeness, not reproduction). Spine agent running (sources in scratchpad spinerefs/, compare sheet spines_compare.jpg). BRpan_m1/c Codex re-rolls CANCELLED until the new spines render; then repaint every mv10 shot that shows the shelf.
- 11:00 11-27: guide_hb v2 (agent): his R hand rests on his R knee (out of frame); her thumb crease (the "thorn", a real
  mesh fold from thumb sweep 18/abd 0) fixed with thumb opp 0.1/sweep 55; his L palm tilted 35 deg to camera, thumb
  alongside; his L forearm rests on the thigh (was 36 mm inside it); her L hand curled on her knee; CAM_HB moved slightly.
  Not solved: his L wrist hidden behind the covering arm in H2b (visible in H3b). OPEN: H1 uses the same thorn thumb
  (HER_HAND); D2_guide now fails clip (crossed legs 46 mm through each other after the r7 cross-legged change): fix
  before the D sheet retake. Painting H3b_t3/t4 on Codex; then H2 (H2d) with the best as first-frame ref.
- 11:40 11-27: spines matched to real editions (agent; sheet scratchpad spines_compare.jpg; 4 real spine photos, 5 inferred from covers). mv10 _make: nine titled spines + lit render as colour ref for BRpan_*. Codex repaint BRpan_a/m1/b/c v3/v4 running (codex_rr3). Unpainted mv10 shots that show the shelf: BR6 HS1 SI1 C2a V3_nailed V3e V3c V3f V3_rcv_obl(+k0,k3) V3_rev_temple_a/b.
- 12:00 11-27: her resting L hand re-posed (agent: was clawed, palm 18 mm off the thigh); guide_hb v3. H3b_t3/t4 = old resting hand; H3b_t5/t6 queued on the v3 guide. Engine finding (NOT applied, Jade to decide): mesh palm vs solver knuckles mismatch (palm ~6.5% long, knuckle span 0.354 vs 0.299, thumb metacarpal x1.5 / phalanges x0.75 = stubby thumb) in every hand; 'fit B' tested in scratchpad elay/engine/humanMesh.js (__HANDFIT).
- 12:20 11-27: Jade approved hand "fit B" (fit the mesh palm onto the solver's knuckles; engine change in layout/engine/humanMesh.js, prototype was scratchpad flag __HANDFIT). TODO, NOT YET (Jade: after her feedback on the newly repainted keyframes): re-render the shots where adult hands are visible (Jade thinks only adult Jade's hands, and only in sets with visible hands). The agent applying fit B lists exactly which shots changed.
- 12:25 11-27: codex_rr3 done: BRpan_a/b/c/m1 v3+v4 all show the Feynman set RED with the new spines. a_v3 lost the Feynman titles (plain red/blue); suggested picks a_v4, b_v3, c_v3, m1_v3 (pending Jade). Fit-B agent running: engine palm fix + closet02 re-render now (Jade: "get the palm proportions right in the closet scene"); other sets later.
- 11-27: mv10 book heights vs the Expedit cube (33.72 cm inside; quoted 33 cm): Kandel 29.2 -> 27.9 cm (library 29 cm
  rounds up); fillers now real trade / mass-market formats, not two uniform blocks. NOTES.md 2026-11-27. mv10 needs a re-render.
- 12:50 11-27: Jade: BRpan v3s better, "generally good". Picks in media/keyframes/r4/mv10/picks.json: a_v4 (a_v3 lost the Feynman titles), b_v3, c_v3, m1_v3. TODO before video: clean garbled spine text on picked mv10 stills (composite the canonical spine textures from the lit guide onto the painted spines, deterministic, no model) and re-check.
- 12:45 11-27: hand fit B is now the engine default (layout/engine/humanMesh.js): the palm is fitted onto the solver's
  knuckles. A THUMB FIT is also on: the mesh thumb joints sit at the mesh's own proportions along the solver's thumb, so
  the thumb is no longer stubby. Opt-out: render.mjs --handfit 0 (or palm). Grips and contacts are unchanged.
  closet02 re-rendered (all 5 shots, all modes + beam masks). NOT only adult Jade: every mesh figure's hands change, at
  readable size for mama, the kids (jade3/7/10, littleJade), dad, uncle, sw, friend and first love. Shot list in the
  agent report; sweep in work/r4/fitB_rerender_sweep.json. The attic88 v4_ shots (mannequins) do not change.
- 12:15 11-27: fit B + thumb fit now engine default (agent; render.mjs --handfit 0|palm for comparisons); closet02 fully re-rendered. H3b_t3 had died (tmux session collision with t4: run flgen takes SEQUENTIALLY). guide_hb re-rendered with fit B; H3b_t5/t6 painted sequentially on it. Re-render list for the other sets (after Jade's repaint feedback): work/r4/fitB_rerender_sweep.json + agent report; NOT only adult Jade: mama, kids, dad, others too.
- 12:20 11-27: H3b_t5/t6 (fit-B guide) both follow the guide; picked H3b_t5 as first frame. Painting H2d_t1/t2 (H2c.txt + H2b fit-B guide + H3b_t5) sequentially.
- 12:30 11-27: H2d_t1/t2 landed: both have the arms right (his R arm from lower left ends ON TOP; his L arm from above ends in the palm-up hand under hers). Pair sheet scratchpad h3b_to_h2_pair.jpg (H3b_t5 | H2d_t1 | H2d_t2) shown to Jade; awaiting her pick.
- 12:40 11-27: Jade: his L (under) hand 'messed up ... amputee' in H3b_t5/H2d_t1/t2; her R hand odd in H3b_t5 only (middle/ring). Cause is in the GUIDE: only 4 featureless curled fingertip stubs show under her hand, no nails, no palm/back cue. Agent running: engine fingernails + subtle palm/back tint (all modes, all figures) + re-pose his L fingers to show segments/nails; then re-render guide_hb and repaint.
- 13:00 11-27: hand marks are now an ENGINE default (agent; humanMesh.js HANDMARK + render.js feat pass), on every mesh figure,
  kids included: nails, joint creases (no palm / thumb-web lines), a subtle palm-vs-back tint, stronger hand form shading
  and overlap outlines, finger-separation lines, thumb-web smoothing (fixes Jade's "weird wrinkle texture" in lit). The pose is
  unchanged (Jade: the guide is right, the shading too subtle). guide_hb H3b/H2b re-rendered, plus new {H3b,H2b}_hold_zoom_{form,contour}.png
  (2x close-up for the painter). clip / hold checks pass (grip 0.2 mm skin, was 1.5, from the web smoothing). Off: render.mjs
  --handmark 0 / PROOF_HANDMARK=0. Every set's hands change on its next render (closet02 CL_hands checked in the scratchpad only;
  media/layout not touched). Sheets: scratchpad hold_handmarks_before_after.jpg, closet_CL_hands_handmarks.png. Next: repaint H3b / H2d.
- 13:05 11-27: handmarks (nails, pad tint, joint creases, finger-touch lines, thumb-web smoothing) engine default; guide_hb re-rendered + hold zoom crops. Sheet shown to Jade; repaint H3b/H2 waits on her OK.
- 13:10 11-27: H3b readability experiment (Jade: parallel, most learning): 6 Codex takes, separate FL_SESSION each (parallel-safe), new handmark guide. A = guide only, old prompt; B = + 2x zoom crops + prompt paragraph naming palm-up/nails (H3b_z.txt); C = B + lit ref (H3b_zl.txt). Takes H3b_x{A,B,C}{1,2}.png. Then H2 from the winning H3b as first frame. Runner scratchpad/h3b_exp.sh.
- 13:35 11-27: H3b experiment landed (6 takes). Codex takes at most 5 refs: version C used one form+contour zoom PAIR image (guide_hb/H3b_hold_zoom_pair.png) + lit, prompt H3b_zl2.txt. Lead's read: A (guide only) paints nails on his under-fingertips (wrong side) in both; B (zoom+named orientation) pads with creases, no nails, but stubby/puffy; C mixed (C2 smooth pads, C1 small nail marks). Sheet scratchpad/h3x_all.jpg; awaiting Jade's ranking before the memory write-up and H2.
- 13:45 11-27: Jade's verdict on the H3b experiment: her hand accurate in all six; the B thumbnails are true to life; the C weird angle comes from a contour artefact. His under-hand is still "amputee" in ALL six. Her hypothesis: his hand sits wholly in her hand's shadow, so it has no shading. Agent re-rendering guide_hb with her hand casting no shadow on his (or a two-pass composite), plus a contour-artefact fix and zoom pairs. Then repaint in B config.
- 13:30 11-27: guide_hb v4 (agent): his L hand SOLO-LIT (fl_hands spec soloLight; engine humanMesh/render.js): no shadow from her,
  only his own fingers occlude it in form, overhead world key, so its fingers are modelled; her hand stays in place; pose unchanged.
  Thumb-web smoothing is now 30 passes with the palm side half held (engine-wide); the apex spur / kink in her web contour is gone, but
  her web still reads as a narrow V (her thumb lies close to her index; opening it would change her approved hand, Jade's call). New refs
  guide_hb/{H3b,H2b}_hold_zoom_pair.png. Checks pass (grip 1.1 mm). Sheet: scratchpad hold_sololight_before_after.jpg. Next: repaint H3b.
- 13:55 11-27: solo-lit his L hand (no shadow from hers, room-fixed overhead light in form) + thumb-web contour fix rendered (agent). Round 2 experiment: H3b_y{B,C}{1,2} (B = 5 refs separate zooms + H3b_z.txt; C = zoom pair + lit + H3b_zl2.txt). Runner scratchpad/h3b_exp2.sh.
- 14:05 11-27: round 2 landed (H3b_y{B,C}{1,2}); sheet scratchpad/h3y_all.jpg shown to Jade. Lead's read: his fingers rounder and more finger-like (yB1, yC1 best), but still only curled tips show, so it can still read as stubs; open option: let his fingers show more (pose/camera), Jade's call.
- 14:15 11-27: Jade: all round-2 takes still stubby. Her idea: texture his palm side (creases, pads, ridges) as a depth cue, like bricks on a receding wall. Agent building a bone-projected palm texture, rendered to scratchpad first for her look.
- 13:55 11-27: palm skin texture TRIAL (agent; engine spec skinTex, procedural, rest space; palm creases + doubled joint creases +
  pad lines + fingertip whorls + fine skin network; palm side only) on his L hand in new shots H3b_guide_tex / H2b_guide_tex.
  Scratchpad only, guide_hb untouched; awaiting Jade's look: scratchpad palm_texture_trial_zoom.jpg (current vs textured; form,
  contour, lit) and palmtex/*_tex_hold_zoom_pair.png. Look-only palm refs in scratchpad palmrefs/ (Commons; never sent to a model).
- 14:40 11-27: palm-texture trial painted (H3b_tex1/2, prompt H3b_zt.txt, trial guides in scratchpad/palmtex). Lead's read: fingers now read in segments and longer (tex2 best), texture a bit wrinkly/aged in tex1. Sheet scratchpad/h3t_sheet.jpg shown to Jade.
- 14:55 11-27: Jade: palm texture slightly better, still stubby. Overhead camera trial: fl_hands shots H3b/H2b_{ov88,ov75,ov75s,ov88c,ov75c} (trial ids; accepted guides untouched); from above his fingers show whole past her hand. Painting H3b_{ov88c,ov75c}_{1,2} with H3b_ov.txt (runner scratchpad/h3b_ov.sh).
- 15:05 11-27: overhead H3b takes landed (H3b_{ov88c,ov75c}_{1,2}); sheet scratchpad/h3o_sheet.jpg shown to Jade. Lead's read: his under-fingers finally read as full-length fingers in all four; ov88c_2 also paints his hairy forearm reaching in, so the hand connects. Awaiting Jade.
- 15:15 11-27: Jade: overhead = real fingers, but palm texture misread as extra segments; her feet messed up. Requests: socks on all feet; LAYERED painting: (1) paint his hand alone overhead, (2) project that painting onto his hand in three.js, (3) add her hand, paint, (4) repeat for his covering hand (H2b). Agent running all stages on free Codex (own FL_SESSIONs, no paid route); skinTex dropped for these shots.
- 14:05 11-27: paint-back trial running (agent): engine paint.js (projected paint, figure spec paint), shots P0/P1/P2/P4 in fl_hands (overhead CAM_P, socks, no palm texture); guides cast/.../v10/guide_pb, takes takes_pb; stage 1 (his hand alone) on Codex.
- 14:40 11-27: paint-back trial DONE (agent): stage 1 his hand alone -> P1_his_2 (normal hand, fits the 3D contour); projected back (engine paint.js) -> P3_H3b_1 (his under-fingers real at last); projected both -> P4_H2b_1 (his covering hand painted, good). Picks in layout/assets/paint/fl_hands/, takes in cast/.../v10/takes_pb, guides guide_pb. Sheets: scratchpad paintback_stage1.jpg, paintback_stage2_3.jpg, paintback_stage4.jpg. Jade to review; accepted guides untouched.
- 15:50 11-27: layered paint-back done (agent): picks P1_his_2 -> P3_H3b_1 -> P4_H2b_1 (takes_pb/, guides guide_pb/, projections layout/assets/paint/fl_hands/). Sheets scratchpad/paintback_stage{1,2_3,4}.jpg shown to Jade. Memory + AGENT_BRIEF updated with the layered method.
- 16:00 11-27: Jade: a 'weird horn' (his thumb as modelled in the stage-1 form, shown by the red contour overlay) got painted in stage 1 and propagated. Agent fixing at the source and re-running stages 1-4 (free Codex).
- 15:05 11-27: paint-back v2 (agent): the 'horn' was his left thumb's pose (flat along the index, sweep 14 / abd 2), seen from overhead, plus a folded web; fixed in the P* shots (PB_THUMB sweep 42 / abd -10, grip passes) and the engine now smooths thenar normals (HANDMARK.thenarSmooth). Re-ran: picks P1_his_3, P3_H3b_3, P4_H2b_4 (takes_pb). Sheets: scratchpad paintback2_stage1.jpg, paintback2_stage2_3.jpg, paintback2_stage4.jpg.
- 16:35 11-27: paint-back v2 (thumb re-posed PB_THUMB, thenar shading smoothed engine-wide): picks P1_his_3 -> P3_H3b_3 -> P4_H2b_4. Pair sheet scratchpad/hold_pair_v2.jpg shown to Jade. Known: the H2b guide carries a faint ghost of her thumb edge (her wrist sits 12 deg differently in H2b); painters ignored it.
- 16:45 11-27: Jade: 'wow, nice': all 3 paint-back layers drew correct hands. Weak spots: (1) gesture: her fingers would overlap his; he rotates his wrist slightly inward as his fingers close around hers, then lays the other hand on top; (2) soft tissue should press in slightly, not stack like flat layers. She asked about handing the 3 painted hands to a video model for the gesture. Proposed: re-pose the 3D end frame (fingers closing, wrist turned in, overlap), paint-back stage 4 again, then a start+end-frame video (Seedance 2.x has last_frame + reference_images; also Kling v4, Vidu Q3, MiniMax H3). Video gen is PAID: needs Jade's OK.
- 16:55 11-27: Jade: YES to step 1 (re-pose end frame; her hand overlaps his AT AN ANGLE on contact) and YES to PAID video generation for this hold (her direct approval, 2026-11-27). Agent running v3 paint-back (start + end frames). Lead: price-check Seedance 2.0 first, then 2-3 takes.
- 17:00 11-27: Jade OK'd 1080p. Seedance 2.0 schema: reference_images can't combine with 1080p or with first/last frames -> plan is image (start) + last_frame_image (end), 1080p, ~5 s, camera_fixed, no audio, 3 takes (~$1.85 each), via tools/gen/gen.py spec/submit (logs spend). Waiting on the v3 paint-back frames.
- 16:10 11-27: v3 GESTURE (agent, start+end for video): START S3_H3b_1 (her hand lands across his open hand at an angle, over his fingers); END E1_his_1 -> E3_H2_1 -> E5_H2_1 (his left hand closed round hers, wrist pronated 12 deg, his right hand on top; soft contacts 3.4-3.8 mm). Takes cast/.../v10/takes_v3, guides guide_v3. Sheets: scratchpad v3_start.jpg, v3_end_stage1.jpg, v3_end_stage2_3.jpg, v3_end_stage4.jpg, v3_start_end_pair.jpg. Best his-hand-alone ref for video: takes_pb/P1_his_3 (open) + takes_v3/E1_his_1 (closing).
- 17:25 11-27: v3 frames done (agent): START takes_v3/S3_H3b_1, END takes_v3/E5_H2_1; pair scratchpad/v3_start_end_pair.jpg shown to Jade before the paid video. Weak spots: his fingers close on her THUMB edge, not little-finger edge; her hand slides ~4 cm into his palm between frames; crossing 50-60 deg.
- 17:35 11-27: Jade: START (S3_H3b_1) good. New MID = swing/lindy hand-to-hand (his lower hand folds around hers, her fingers bend and hook), END = MID + his other hand covering both. Agent building v4 MID+END via 3-layer paint-back. Video plan becomes 2 chained first/last-frame clips: START->MID, MID->END (paid, approved).
- 17:40 11-27: Jade: 'just spend, don't worry, we have plenty of credits' (for this hold video: 3 takes per chained clip at 1080p is fine).
- 17:00 11-27: v4 SWING (agent): START S3_H3b_1 (kept) -> MID M3_H_1 (swing hook: her bent fingers hooked into his folded fingers; his stage 1 M1_his_1) -> END N5_H_2 (his right hand over both; hides the hook). Her hand travels 4.8 cm START->MID, 0 MID->END. Takes takes_v4, guides guide_v4. Strip: scratchpad v4_start_mid_end_strip.jpg.
- 17:55 11-27: v4 MID (takes_v4/M3_H_1) + END (N5_H_2) done; END hides the hook under his covering hand (fix = V4.cover along<0 + repaint stage 4, if Jade wants). PAID video submitted (Jade approved): 6 Seedance 2.0 1080p 5 s jobs, est $11.10: proof/hold_AB_{1,2,3} (START->MID), proof/hold_BC_{1,2,3} (MID->END); specs media/gen/specs/hold_*.json, frames media/gen/hold_refs/. Collect: gen.py wait <ids>.
- 18:05 11-27: Jade's clasp ref (Shutterstock preview, look-only, scratchpad/clasp_ref/prev.jpg): MID = a mutual finger clasp (hands wrap each other's fingers, offset, not palm-on-palm) with a less-bent wrist; END = his other hand sandwiching on top (lower fingers may not show). Agent building v5 MID/END. v4 videos still rendering (keep for comparison).
- 18:20 11-27: v4 videos done (6 x Seedance 2.0 1080p, ~$11.10). Chained previews scratchpad/vid/hold_chain_{1,2,3}.mp4 (AB_n+BC_n), frame sheet scratchpad/hold_videos_sheet.jpg. Lead's read: start->mid motion is smooth and lands in a clasp close to Jade's ref; the covering hand comes in from the lower left in all three.
- 18:30 11-27: Jade: start->middle (AB) 'really good'; middle->end must start from AB's LAST frame. Submitted 6 more ($11.10): hold_CC_{1,2,3} = AB_1 last frame -> END painting (end.jpg); hold_CF_{1,2,3} = AB_1 last frame, no end frame (prompt only). Frame media/gen/hold_refs/ab1_last.jpg.
- 17:40 11-27: v5 clasp STOPPED on request (middle frame = media/gen/hold_refs/ab1_last.jpg from the approved clip). v5 state: C1_his_2 (stage 1) picked; C3_H_1/_2 painted, unpicked (_2 on the contour); END sandwich never painted. Takes in cast/.../v10/takes_v5.
- 18:40 11-27: Jade: covering-hand motion feels flat/linear. Test ($7.40): hold_MS_{1,2} = motion-rich prompt (arc, ease, heel-first landing, fingers drape, squeeze, underlying give), painted style, no end frame; hold_MP_{1,2} = same motion, photoreal prompt. All from ab1_last.jpg.
- 18:50 11-27: CC/CF landed. Lead's read: CC_1 morphs toward the old end frame (lower hands rearrange); CF_1 gives his covering arm a WHITE cuff (wrong costume); CF_2, CF_3 and CC_2 cleanest. Chained previews scratchpad/vid/chain_hold_C*.mp4 (AB_1 + each). Motion test MS/MP still rendering.
- 19:00 11-27: motion test landed. 'Photoreal' prompt did NOT change style (the start frame dominates). MS_1 and MP_2: covering hand from the lower left, green sleeve, arc + settle. MP_1 and MS_2: the covering hand seems to come from his UPPER (left) arm, an identity error. Comparison page scratchpad/vid/hold_compare.html (groups A=CC, B=CF, C=MS, D=MP) opened for Jade.
- 19:10 11-27: Jade: best = MS_1 (MP_2 a little over-acted). MS_1 weakness: top hand spawns in, pauses a breath, then moves (natural once moving). Submitted hold_MT_{1,2,3} ($5.55): MS prompt + 'already in motion from the first frame, slides in from beyond the lower-left edge, never pauses'.
- 19:25 11-27: committed 4a712d7 (not pushed). .gitignore now also ignores first-love takes_*/, guide_pb/, guide_v*/ and layout/assets/paint/fl_hands/ (same never-public rule as takes/). Left out: SW_t100_cam.png, untracked bodytest/mtest test renders (some nude-body tests). Memory: video-gesture-from-painted-keyframes.md.
- 19:35 11-27: MT_{1,2,3} landed: no pop-in, hand slides in from the edge right away, but it arrives within ~1.5 s and the rest is mostly still (MT_1 keeps drifting). Added as section E at the top of scratchpad/vid/hold_compare.html.
- 19:40 11-27: Jade picked the hand-hold clip: AB_1 (start->clasp) + MT_3 (his right hand slides in from the lower left and sandwiches). Chained file media/gen/hold_FINAL_AB1_MT3.mp4 (media/gen is gitignored; sources media/gen/hold_AB_1_*.mp4, hold_MT_3_*.mp4; specs media/gen/specs/hold_{AB_1,MT_3}.json). NEXT: carry this hold into the D hands sheet / closet02 CL_hands, CL_ots / r4lib fl_hands; the fit-B re-render list for other sets waits on Jade's repaint feedback.
- 19:50 11-27 TODO (not started):
  (1) Carry the approved hold (clip media/gen/hold_FINAL_AB1_MT3.mp4; keyframes takes_v3/S3_H3b_1 and the clasp) into the D hands sheet, closet02 CL_hands/CL_ots and the r4lib fl_hands entry. First fix the D2_guide crossed-legs clip and the H1/HER_HAND thorn thumb.
  (2) After Jade's feedback on the repainted keyframes: re-render the other sets with fit B + handmarks + thenar smoothing. Shot list in work/r4/fitB_rerender_sweep.json; mv10 also needs a re-render for the Kandel/filler book sizes.
  (3) Clean the garbled spine lettering on the picked mv10 shelf stills before video: composite the canonical spine textures from the lit guide, no model.
- 20:30 11-27 Jade's answers (repaint_questions page):
  (1) BO2 pick = v3 (logged in r4/office91/picks.json).
  (2) BO1: copy the sheet and hand position from BO2_v3.
  (3) V3a: repaint. Fix the NASA patch; SNEAKERS outdoors (not socks); no belt; lemons stacked. FIX THE MODEL: the strawberry patch and mint plant drift between takes; the strawberry planter is right by the patio; the tree must be far bigger (trunk too thick for her to hug all the way round, canopy over the whole corner of the yard).
  (4) Yes: re-render mv10 and paint the unpainted shelf shots now.
- 17:27 11-27: agent on Jade's A-E (mv10): yard model fix (bigger tree into the NNE/back corner, fixed strawberry planter by the deck + mint, in frame in V3a; sneakers outdoors) in progress; _make.py: lit colour ref + RED Feynman named for every shelf shot (BR6, C2a, V3_nailed, V3_rev_temple_a, V3_rcv_obl*). Then full mv10 re-render, paint V3a (v3/v4) + BR6, HS1, SI1, C2a, V3_nailed, V3e, V3c, V3f, V3_rcv_obl(+k0,k3), V3_rev_temple_a/b on free Codex, sequential.
- 21:00 11-27: BO1 (agent): BO1 takes drifted because the r4 GAP_CAM guide (az 150) disagreed with BO2_v3, which followed its r3 painting ref (view from straight behind). GAP_CAM is now solved from BO2_v3's sheet corners (BO1 = BO2 guides re-rendered, grid and both fingers line up with BO2_v3); her arm restaged (pushed sleeves, elbow out). Painting BO1_v5/_v6 on free Codex with BO2_v3 as ref (no adult hand).
- 21:20 11-27: BO1 pick = BO1_v5 (agent; picks.json, PAINT_LOG, r4 page rebuilt). v5/v6 both copy BO2_v3 (rows 7-7-7-6-7, pad on the missing slot, no adult hand); v5 closer to BO2_v3. Sheet: scratchpad bo1_vs_bo2v3_sheet.jpg. BO2's guide now matches BO2_v3 too.
- 17:33 11-27: mv10 interior shots re-rendered (5 modes + form/contour/light; fit B, handmarks, thenar, book sizes): BR1-3, BR6, HS1, C2a/b, V3_nailed, V3_rev_temple_a/b, V3_rcv*, BRpan_*, T0_spines_*. Painting (free Codex, sequential, scratchpad paint_seq.py): BR6, C2a, V3_nailed, V3_rev_temple_a/b, HS1, V3_rcv_obl/_k0/_k3. Yard shots wait on the yard model fork.
- 2026-11-27 (agent, decision A + V3a model): mv10 yard fixed in the MODEL: giant lemon tree (trunk 0.80 m at (11.55, 19.1), canopy r 5.2 m over the NNE/back corner, 7.6 m tall), ONE strawberry planter box against the deck (props/planter_box, Poly Haven CC0) and the mint in a real half barrel (props/half_barrel, CC0), both in frame in V3a/V3e in every mode. V3a restaged: she faces 3/4 to the lens (meatball visible), reaching for TREE.pick; friend with the stacked-lemon bowl; black canvas sneakers in V3a/V3b. Only V3a/V3e/V3b/T0_friendbowl/V3h re-rendered. Notes in layout/sets/mv10/NOTES.md (top). V3b painted takes are now stale.
- 17:55 11-27: mv10 FULL re-render done (all shots, 5 modes + form/contour/light, beam twins; sheets + layout gallery rebuilt) on the new yard (giant tree in the NNE/back corner, Poly Haven planter of strawberries by the deck, half-barrel of mint; V3a restaged three-quarter to camera with the patch, sneakers). Before/after: scratchpad yard_before_after.jpg. _make.py: V3a rewritten (YARD fixed-geometry paragraph, sneakers, no belt, stacked lemons, takes v3/v4), YARD also in V3e. Painting queue: interior 9 shots, then V3a, SI1, V3e, V3c, V3f (free Codex, sequential).
- 18:04 11-27: FOUND: Codex image_gen takes at most 5 reference images (log: 'referenced_image_paths must contain at most 5 paths'; it retries with its own subset). BR6, C2a, V3_nailed, V3_rev_temple_a/b were painted with 8-10 refs (results still OK: Feynman red). _make.py CAP5 now keeps 5 refs (3 guides + 2) for HS1, V3a, V3_rcv_obl*, SI1, V3c, V3f and strips sentences naming dropped refs. Queue 2 running: HS1 V3a V3_rcv_obl k0 k3 SI1 V3e V3c V3f (scratchpad paint_q2.log). Picks so far: BR6 v2, C2a v1, V3_nailed v2 (PAINT_LOG).
- 18:39 11-27: mv10 r4 repaint DONE (38 free Codex images, no limit hit): picks in media/keyframes/r4/mv10/picks.json (BRpan kept), reasons in work/r4/PAINT_LOG.md, review page rebuilt. V3a v4 (yard holds in all 4 new takes; 3+ lemons in every take; friend profile in v3/v5/v6). Open: V3f patch painted on her RIGHT chest (both takes); V3_rcv_obl_k0 swaps her and the guest; k3 hand ghost; V3b takes predate the new tree; V3a friend is side-on in the model (turn him away). Not committed.
- 21:40 11-27: mv10 agent done (yard model fixed, all mv10 re-rendered, 14 shots painted, 38 free Codex images; picks in r4/mv10/picks.json). V3_nailed_v1 drew first love's cheek/stubble in profile: moved to work/quarantine/ (not picked). Codex silently drops refs beyond 5: _make.py now has a CAP5 table.
- 21:55 11-27: Jade: strawberry planter was right in the BEFORE (restore the old bed); move the mint barrel left into the inside corner where the deck meets the stair railing ('the crook of the elbow'). Agent re-rendering, repainting V3a only (2 lemons stacked, no watch, friend turned from the lens), and listing which picks now show the wrong plant positions.
- 22:00 11-27: Jade: the new mint barrel model is good (only move it); tree size good but move it into the yard a bit for balance; the friend's punch bowl = FROSTED PLEXIGLASS punch bowl (not plain white): canon wording updated by the mv10 agent.
- 19:07 11-27: Jade's yard corrections applied (agent): strawberry BED back at its page-1 place (new plant modelling kept; planter box unused), mint half barrel moved into the deck/stair-railing corner (4.275, 11.545), tree moved out of the corner by (-0.7, -0.6) (size kept; tree staging moves with it; poi mark -> (5.7, 14.6) to stay clear of the canopy), the friend's bowl is now a frosted plexiglass punch bowl, V3a friend turned away from the lens, form-guide white-flare bug fixed (PANT.formTint). Full mv10 re-render running; then V3a v7/v8.
- 19:20 11-27 CHECKPOINT (agent stopped for Jade's restart; nothing committed; no Codex job running; tmux proof-kf4-mv10 killed):
  DONE (model, in layout/sets/mv10 layout.js / build.js / shots.js; details in mv10/NOTES.md "2026-11-27 (late evening)"):
  strawberry BED restored to its page-1 place/size/shape with the new plant modelling; mint half barrel moved into the
  deck/stair-railing corner (4.275, 11.545); tree moved into the yard by TREE_SHIFT (-0.7, -0.6), size kept, its staging
  moved with it; poi mark -> (5.7, 14.6) (clear of the canopy); the friend's bowl = frosted plexiglass punch bowl
  (FROSTED_PLEXI glass look on the bowl model); V3a friend turned away from the lens; the form-guide white-flare bug fixed
  (PANT.formTint). _make.py updated (YARD paragraph, bowl wording in V3a/V3b/friendbowl ref, V3a takes -> 8 so the next
  paint is v7/v8). Before/after sheet: scratchpad yard_before_after_2.jpg (V3a form/lit, V3e lit, V3h lit).
  NOT DONE: the full re-render was STOPPED part-way. The 5-mode pass (line/flat/depth/label/lit + sidecars) finished for
  BR1 BR2 BR3 BRpan_* BR6 HS1 V3a V3b V3b_prep V3c V3_nailed V3_rev_temple_a/b V3e V3f V3_rcv only; V3a, V3e, V3b,
  T0_friendbowl, V3h also have lit/form/contour from a test render (no light map yet). Everything else, every
  form/contour/light guide and the beam twins are still from before these changes.
  NEXT (exact):
  1. node layout/render.mjs --set mv10 --exclude beam_
  2. node layout/render.mjs --set mv10 --exclude beam_ --modes form,contour,light --nojson
  3. node layout/render.mjs --set mv10 --prefix beam_ --modes flat --nojson; sh layout/sets/mv10/sheet.sh label line lit flat; python3 layout/gallery.py
  4. python3 media/keyframes/r4/mv10/_prompts/_make.py; then paint V3a v7/v8 ONLY, free route, sequential:
     KF_SESSION=proof-kf4-mv10 python3 <scratchpad>/paint_seq.py V3a  (or tools/kf/r4_run.py mv10 V3a; note it runs 2 jobs in one session)
  5. Zoom-review v7/v8 (two lemons stacked, no watch, friend's face away, patch, sneakers, no belt, bed corner + barrel
     placement), update work/r4/PAINT_LOG.md, picks.json (V3a), python3 tools/kf/r4_page.py.
  Picks now showing the OLD yard (wrong strawberry/mint/tree): V3a_v4 (planter box by the deck, barrel mid-lawn, tree
  in the corner; WHITE bowl), V3e_v1 (planter box at the foot of the deck, barrel mid-lawn; poi mark moved since),
  V3b_v1 (old tree, white bowl). V3b_prep is unaffected (kitchen only). BR6_v2's doorway
  shows the pre-fix yard. SI1_v1 shows no yard furniture (unaffected). Old white bowl: V3a_v1-v6, V3b_v1/v2.
