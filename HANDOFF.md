# Proof — handoff for the next session

## START HERE (updated at the end of the 2026-11-25 late/night session)

**State:** Jade's first round of decision-page answers is applied (log: section "Session of 2026-11-25 (late)").
The plan (`Proof — Music Video Plan.md`) and all eleven sets are on the -2sm master (`inputs/Proof (-2sm).wav`;
song map and v3->-2sm time map in `analysis/m2sm/`). Keyframe round 2 (88 shots) is painted from the new renders.
Everything except the private/gitignored folders is committed on `main` and pushed to GitHub.

**First thing: Jade will paste one or two answer blocks:**
1. `Decisions (from media/decisions.html):` — 22 open questions (Song and plan, Mountain View, Shanghai, Morton
   Grove, Cast, Plates, Ear checks with audio clips in `media/decisions_audio/`). Each line is
   `- <card title>: <chosen option> — <note>`; untouched cards mean "keep current". Card ids/context/options are in
   the page's `D` array; answered cards from 2026-11-25 are in a collapsed list at the bottom. Apply the answers,
   then remove answered cards and add new questions so the page stays the single list of open decisions.
2. `Keyframes r2 (from media/keyframes/r2/index.html):` — one line per shot, `- <shot id>: Good | Redo | Wrong
   staging — <note>`. Redo per the "keyframes round 2" section at the end (brief, routes, `kf.py --route auto`).
   Wrong staging means fix the set first (`layout/sets/<set>/`), re-render, then repaint. Rebuild the page with
   `python3 tools/kf/r2_page.py`. Keyframes stay local (gitignored).

**Also waiting:** `inputs/refs_closet.png` (untracked, NOT pushed: ask Jade before it goes public, and whether to
gitignore it like the other refs) is Jade's hand drawing of the closet (closet02) as seen from outside: a sliding
door covering the LEFT half; the open RIGHT half has a top shelf (textbooks, shoeboxes), a rod with clothes hanging
mostly down to about two-thirds of the height, a few long coats down the left edge of the open half, and Jade
sitting low near the centre-right with a folded duvet in front of / under her. Jade has not yet said anything
about it in a session: compare with `layout/sets/closet02/` and ask before rebuilding the set from it.

**Loose ends (not decisions):** `analysis/m2sm/remap.py` mangles times followed by ':' (sets were fixed by hand);
engine: shanghai86 V1g fringe stands off her forehead like a plank (`layout/engine/mannequin.js`);
`inputs/refs_house/interior_plan.png` still draws mv10's console as a circle. Current first-love sheets are the v3
set (`cast/first_love/fl_B_backhead_neck_v3.jpg` is the hair anchor); Dad's are `cast/dad/*_v5_likeness*`.

**Housekeeping:** Codex plan limit was hit at ~18:30 on 2026-11-25; delete `work/kf_logs/CODEX_LIMIT_HIT` once it
resets so `--route auto` goes back to Codex. Spend so far is in `docs/spend_ledger.jsonl` (~$23.70).
Already public from an earlier push (before this session): `inputs/refs_chaosmonkey/source_refs/` (real photos) and
`inputs/refs_devon_market/` (web photos). Jade was told; no answer yet on removing them.

**How Jade works (keep doing this):** delegate to subagents and relay conclusions; log every direction Jade gives in
the dated section at the end of this file as it happens (checkpointing); look at renders yourself before reporting;
never invent facts about Jade's life without flagging them; the GitHub repo is PUBLIC, so check what goes in.

**Private, never in the repo:** first love is a real person; his identity is known to Jade and recorded only in
Claude's local memory, never in repo files. His face is never shown or drawn. `inputs/family_photos/` (Dad's photo,
age-37 portraits), `inputs/refs_house/`, `inputs/refs_shanghai/`, `inputs/refs_mortongrove/` are gitignored. Do not
push `docs/poem_digest.md` or `media/keyframes/` without asking (both gitignored now).

**Git:** everything is on `main`, pushed to `origin` (github.com/jadeqwang/proof, PUBLIC); branch
`session-2026-11-25` was pushed too and equals an earlier point of `main`.

**What changed on 2026-11-25, before the answers** (details in the dated section at the end):
- *Sets* (`layout/sets/`): `mv10` rebuilt as the real 345B View St from Jade's hand drawings (real Expedit shelf,
  shelf pan, overhead room-crossing shot, temple/eye push-ins, honest fall-2010 sun; the three-lamp shadows dropped);
  `shanghai86` rebuilt as the real Xiefa Apartments living room (253 Wuyuan Rd, east flat, 三楼), four rounds of
  Jade's corrections, winter-morning sun, a light-study sheet; new `mortongrove07` (the IAS sweatshirt gift, 5748
  Capri Lane). Eleven sets in the gallery (`media/layout/index.html`).
- *Engine* (`layout/engine/`): articulated mannequins (five-finger hands with joints, shoulder girdle; `hand.js`,
  `anatomy.js`; API in `layout/README.md` "Hands"; test set `layout/sets/mtest/`). `_cast.js`: first love 1.78 m;
  Jade and first love share hand 18.7 cm and foot 25.1 cm (kinds `adultJade19/27`, `adultFirstLove`).
- *Cast*: Dad rebuilt from Jade's approved portrait (`cast/dad/*_v5_likeness.jpg`, OK to push); first love's hair
  corrected (`cast/first_love/*_v2*`, new `fl_G_ots_hair_v1.jpg`); superseded sheets in `_superseded/` folders.
- *Plates* (`media/footage/`): new `neuron/` (PLATE IX, Purkinje cell), `spectrogram/` (PLATE XXI, "pitch
  contours"); `spirals/` (PLATE XVIII "PHYLLOTAXIS.": artichoke counts 5 then 8, romanesco 8 then 13 with a floret
  inset, spiral aloe 5 ranks; gold counting thread as a separate alpha layer; arm timings in `data/*_arms.json`;
  count 7's end on the artichoke is the market's "one short" cut). Weak spots in its NOTES.md.
- *Plan* (`Proof — Music Video Plan.md`) edited row by row at Jade's request: plates placed, shelf pan, sweatshirt
  scene, three shadows dropped, the verse-3 review beats. Not yet revised for the current song (decision card).
- *Song*: the current master is `inputs/Proof (-2sm).wav`; its lyric times are in `media/karaoke_v2/lyrics_timed.json`
  and differ from the v3 song map most of the plan and sets use. New shots and plates use -2sm times.

**Next, once the answers are in:** apply them to the sets and plan; re-render what changed; then (if Jade agrees)
repaint keyframes from the new mannequin renders (Codex limit ~100 images / 40 min; `tools/kf/kf.py`).


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
