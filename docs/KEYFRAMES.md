# Proof — keyframe and character-sheet pass

Working notes, started 2026-11-22 (night session). Read `HANDOFF.md` and the plan first. This file records what this
pass decided, what it made and where it is. The plan doc itself was not edited.

## 1. The look, made unambiguous

The plan says two things that cannot both be true of one frame: "the beam is made by painting around it" (so what the
light misses is dark wash) and "what it misses stays paper". This pass resolves it as **two registers and three values**.

**Scene register** (every shot inside a place):

| Value | What it is | How it is made |
|---|---|---|
| Light | Bare cream paper. The beam, the lit floor, the frost, a highlight in her eye. | Never painted. Enforced in comp with the set's beam mask: inside the mask the wash is lifted back to paper and only line is kept. |
| Shadow | One transparent ink wash per scene, tinted by that era's light source. Things in it are line under wash, with no local colour. | Painted by the image model, evened in comp. |
| Attention | The one thing she is attending to: full local colour, finest line, a little glow of clean paper round it. | Painted by the image model; one per shot. |

**Blank register** (the pad at 0:00, the four band-outs, the last four seconds): no room at all. Bare paper with one
thing left on it. The film enters the scene register by wash gathering round a band of paper (0:00) and leaves it the
same way in reverse, so the final bare page is the whole frame become light, not an empty room.

Consequences:

- Strangers' faces are "unreached", not white masks: jaw and hair in line, no features, and nearly always out of the
  beam, so they sit under the shadow wash like everything else she has not attended to.
- Her own face is always fully drawn, in shadow or in light. In the outside shots it is under the wash and the only
  bare paper on it is the catch-light in each eye, which is the window. The beam is literally in her eyes.
- A mote is a small warm fleck on bare paper (it cannot be brighter than paper). Outside the beam it is simply not
  drawn. That is the poem's "disappearing from view when they float out of the light" with no effect needed.
- Gold pencil sits on top of both light and shadow. Toner labels sit on top of everything and are the only pure black.

Shadow tints by scene (proposal; `tools/kf/scenes.py` holds the values used):

| Scene | Light source | Shadow wash | Rationed colour |
|---|---|---|---|
| Attic 1988 | Low winter sun, four panes | Cool blue-grey ink | none; frost is paper |
| Shanghai 1986 | Window light in humid air | Warm grey-green | the gingham red, faint |
| School office ~1991 | Fluorescent tube | Flat greenish grey | handout yellow |
| Wall 1988 | A crack | Near-black ink | none |
| Market 1993 | Rows of bare tubes | Pale flat grey (little shadow) | artichoke green, romanesco |
| Basement 1990 | The screen | Deep indigo | screen blue |
| Kitchen 1990 | Pendant, then a sun shaft in the outro | Warm umber | none |
| Closet ~2002 | Door ajar | Warm brown-black | none |
| Mountain View 2010 | Dusk, lamps, then fire | Dusk violet | lemons, fire |
| Playground 2023 | Low sun through glass | Warm grey-gold | none |

## 2. Pipeline for a keyframe

1. Layout guide from the set: `media/layout/<set>/<shot>_line.png` (composition) and `_flat.png` (where light falls).
2. Still from an image model, given the two guides plus the character sheets, painted in the hand with the shadow
   wash and told to leave the light unpainted.
3. Comp (`tools/kf/comp.py`): beam mask to paper, motes, gold note, toner label, header. All from code.

Status of each step is in section 5.

## 3. Sheets added in this pass

All through Codex image generation, 1672x941, each with a `.txt` sidecar. None reviewed by Jade.

| Sheet | What it is for | State |
|---|---|---|
| `cast/mama/mama_R_rest_heads_v1.jpg` | Mama's face at rest (front, three-quarter, profile) and three acted heads: the smile she wears for strangers, alarm, talking fast and low. The film needed her still face for "Has she seen her own face?" and had no Mama sheet of its own. | Good. On model. |
| `cast/mama/mama_D_hands_v1.jpg` | Her hands: approaching the cheeks, pushing them into a smile (with the child's brow furrowed and eyes looking for the exit, as the poem has it), closed on a forearm with the child's finger still pointing, riffling the red dictionary, a pat on the head, dishwater-pink forearms. | Good. |
| `cast/little_jade_05/lj05_P_proof_acting_v2.jpg` | The five-year-old's expressions for this film: studying, tracking a mote, the expression she offers on demand ("I narrow one eye, furrow my brow, and sigh"), the pushed smile, eyes still travelling after the mote has gone, the strip of light in the wall. | Good. Head 1 smiles slightly. v1 (off model, brown hair) is in `_rejected/`. |
| `cast/little_jade_05/lj05_Q_proof_poses_v1.jpg` | Her poses: unfolding the printout, playing the paper keys, sitting up, tracing frost, forearm taken. | Body and clothes on model. Every face smiles: use for body only. |
| `cast/dad/dad_R_rest_heads_age37_v1.jpg` | Dad at 37, halfway between the two existing sheets (which read 28 and 43), with the family's resting face and three acted heads: "Good catch!", the double take, weighing an honest answer. | See section 5. |
| `cast/_family/family_rest_lineup_v1.jpg` | Father, mother, daughter at 5, daughter grown: four heads, one expression. A design proof for the film's claim that the face is inherited. | See section 5. |

## 4. Keyframes

Review page: open `media/keyframes/index.html` (rebuild with `python3 tools/kf/gallery.py`). Per set: takes and
sidecars in `media/keyframes/<folder>/`, the painter's `picks.json`, `comp.json` (overlay positions) and `NOTES.md`;
composited frames in `media/keyframes/_comp/<folder>/<SHOT>.jpg` with the spec beside each. Prompts in `prompts/kf/`.

| Folder | Picks | Strongest | Known problems |
|---|---|---|---|
| `attic88_day` | 8 | `AD_wide` (the shaft as bare paper, composited), `AD_keys`, `AD_fern`, `AD_grab` | `AD_wide_v2b` had footprints cloned out in code. `AD_piano` brings her head in against the guide. The fern's line is very pale. |
| `faces` | 11 | `AD_out`, `AD_out_b` (the offered expression), `WL_eye`, `K5_thumbs`, `K6_mother`, `K8_glass` | The wall's blade runs upper left to lower right, mirrored against the attic beam (the set is built that way): flop one for a literal rhyme. `WL_eye_hand` is louder than intended. `K8` needed a guide cropped from K7 because the set's K8 reflects the child, not Mama. |
| `shanghai86` | 6 | `V1c` (still ripping), `V1f` (the adults from below, heads thrown back so no face shows), `V1g` ("笑啥？") | `V1d_8`: the sunlit floor came out tan, not bare paper. The uncle's gesture is invented (the poem gives none). Mama is laughing in the doorway of `V1f`. |
| `office91` | 8 | `PC1` (reading down the grid), `X_sw` (the cracked Christmas print), `PC5` (the red dictionary), `BO2` | The painted handout is a blank yellow grid: the code-made faces (`media/keyframes/handout/`) are not yet warped onto it. `BO1` fingertip is about 70 px off the layout. `BO2` is a local composite of two takes, not one painting. |
| `market93` | 7 | `M2` (artichoke, 8 and 5 spirals verified against the set's lattice), `M8` (romanesco, 13 and 8), `M1`, `PLATE` | Mama's hand in `M4` is large and could be a man's. The set's own artichoke and romanesco were unusable as guides; the painter redrew them from `phyllo.js`. |
| `basement90` | 5 | `B2_face` (father and daughter, one resting face), `B5_cat`, `B4_doubletake` | Dad reads about 30 in B2 and B4. The set stages her pointing from the chair spokes; the poem has her hop off first, and the paintings follow the poem. |
| `kitchen90` | 4 | `K1_question`, `K4_writes` | `K3_understood` (her eyes stop) reads slightly as a glance at Dad's hand. "it was correct" is not drawn: the gold pencil hand has digits only. |
| `mv10` | 13 | `BR2` (the tap, to lens), `BR5` (three shadows), `HS1` (her face on bare paper), `V3f` (the counted hug), `V3e` (poi) | 115 % only reads against guests in the same frame. `C2a` (voice lock) is the weakest face. In `SI1` the poi rings sit behind her head like a halo, which section 6.6 says to avoid. |
| `closet02` | 4 | `CL_wide`, `CL_ots` (her face fully lit), `CL_hands` | In `CL_chin` her fingers, not the back of her hand, touch his chin. The set lights the hands and shades her face, the reverse of section 6.2; the paintings follow 6.2. |
| `playground23` | 3 | `PG2` (two backlit profiles and her reflection) | The set is a different room (a clubhouse pane, a partner, a carried toddler). Painted from the beam mask only. Her reflection is large. |
| `plates` | 1 | `VOY` | Band at 34 degrees, not the attic's 40. The dot is left for comp. |
| `handout` | prop | `handout_yellow.png`, `handout_title_1080.png` | Labels are 8 pt at page scale and unreadable in the 1080 plate. A few faces lean modern (hearts, puffs). |

Things every set ran into:

- **The sets' beam masks do not register with the paintings** (60 to 200 px off, or all white). The models already
  leave light as bare paper, so the batch compositor lifts the mask only in `AD_wide` and `AD_mote`
  (`BEAM` in `tools/kf/comp_all.py`). For video, either re-render masks from cameras fitted to the picks or cut the
  beam by hand per shot.
- **Blockout objects come back literally** unless every box is named in the prompt.
- **Codex's plan limit** was reached at 21:36 on 2026-11-22 (reset 01:56). Takes after that used gpt-image-2 on
  Cloudflare. The two routes match closely enough to sit in one set.

Proposed toner label words (mine; every one is a line someone else says about her in the song): `TONER_WORDS` and
`TONER_FORCE` in `tools/kf/comp_all.py`.

## 5. Log

- 2026-11-22 20:45 Tools copied from `chaosmonkey-video/tools/gen` to `tools/gen` (job prefix `proof/`, cap $150 in
  `tools/gen/spend.py`) and `chaosmonkey-video/tools/ink` to `tools/ink` (the paper-and-ink compositing engine, as is).
  Local ids in `work/` (gitignored). Neither source repo was edited.
- 20:57 Look test on `AD_wide` and `AD_out` across Codex gpt-image, gpt-image-2, nano-banana-pro and seedream-5-pro
  (`media/keyframes/_looktest/`). The two gpt-image routes paint light as bare paper when told to, follow the layout
  guide and hold her face in shade; nano-banana-pro goes loose and anime; seedream ignores the paper rule. Codex is the
  default route, gpt-image-2 the fallback.
- 21:00-22:10 Sheets (section 3), the compositor (`tools/kf/comp.py`, `README.md`), the handout plate
  (`tools/kf/handout.py`), and 72 picked keyframes across eleven folders, painted by seven agents in parallel from
  `docs/KEYFRAME_BRIEF.md`. 127 takes (87 by Codex until its plan limit at 21:36, then 40 by gpt-image-2).
- 22:15 Batch composite (`tools/kf/comp_all.py`) and review page (`tools/kf/gallery.py` -> `media/keyframes/index.html`).
- Spend: $10.26 list price on Cloudflare (`python tools/gen/spend.py`), all of it gpt-image-2 after the Codex limit
  except $0.90 of bake-off calls.
- Poem digest for artists: `docs/poem_digest.md` (written by a subagent from the collections on this machine; 754
  quotes machine-checked against the sources). It quotes the poems at length: do not push it to the public repo
  without Jade's say.
- Nothing was committed or pushed.

### Not done

- The handout's faces are not mapped onto the painted office frames (needs a four-point warp per shot).
- "it was correct" cannot be drawn: `comp.py`'s gold pencil has digits and "?" only. It needs a letter set, or Jade's
  own handwriting scanned.
- Beam masks fitted to the paintings (see section 4).
- No sheet for the son or the toddler (by design: they are never drawn), none for Jade at 40 in everyday clothes
  (the playground frames describe her in words).
- The first-love design question, the plan's v3 timing revision and the other items in `STATUS.md` "Waiting on Jade"
  are untouched.

## 6. Vision notes from this pass (proposals; the plan doc is untouched)

Written after reading the plan, the brainstorm, the canon, the v3 song map headers, the art-style references and the
full poem digest (`docs/poem_digest.md`, sections 4 and 5 especially). Each note says what it would change.

### 6.1 Three camera positions, not two

The plan has *outside* (frontal on her face, where labels land) and *inside* (along her eye-line). The poems supply a
third, and it is the ending: "I look from one resting oblivious face to another / grandfather to grandson / and catch
my own in reflection." Nobody can see their own face. She is the one person in every room who has never seen the
evidence being used against her. In 2023 she finally stands in the outside position on that face, three times over
(her father's, her son's, her own in the glass), and what she sees is family.

- So the coda is not three silhouettes in a reflection. It is two people she looks at directly and one reflection.
- The no-likeness rule is met by the film's own light: grandfather and grandson stand between her and the sunlit
  glass, so they are plain dark-wash profiles against bare paper. Only her own face is drawn, faintly, in the glass.
- The playground is indoor and space-themed. A wall mural of planets gives the pale blue dot one last appearance for
  free. The toddler daughter can be a running smudge of wash.

### 6.2 The catch-light is the smallest beam

In every outside shot her face is in shade and the only bare paper on it is the catch-light in each eye: the window
in the attic, a blue-white rectangle in the basement, the tubes in the supermarket, fire at the party. It is the
literal proof that the world is going in. It costs nothing, it is true to the look, and it means the outside shots
are never dead. The look test (`media/keyframes/_looktest/ad_out_v1_codex.jpg`) shows it working.

The one scene where her whole face is in the light is the closet. He opened the door; the light comes over his
shoulder onto her. The first chorus puts the question to a face in the dark with one blade of light across an eye.
The second puts it to a face that is entirely lit, and the same answer is enough. The closet set already supports
this; it only needs saying, because "a door left ajar, the same diagonal of light" can be staged either way.

### 6.3 The expression she offers

The plan's intro has the whispers land on an absorbed face and thumbs approach. The poem has a beat in between that
the song's two whispers are literally the two halves of:

> "They say your face has no expression. So you should try to have some expressions." / "What, like right now?" /
> "Yes, right now." / I narrow one eye, furrow my brow, and sigh. / "But not like that."

She does make an expression. It is sincere, it is the wrong one, and it is funny. Then the hands push her cheeks up
and "I furrow my brow even more and try to escape", so the outro image is a pushed smile under a deepening frown on
a child pulling away, not a passive one. Proposal:

- 0:09 whisper 1 on the absorbed face; she offers the narrowed eye and furrowed brow; 0:18 whisper 2 lands on THAT.
- 4:05 the same two faces again, with the hands this time.
- Keyframes: `AD_out_b`, `AD_thumbs`, `K5_thumbs` (folder `media/keyframes/faces/`). Sheet: `lj05_P` head 3 and 4.

More generally the song's own brief is "bittersweet but playful" with "wry verses", and the poems are funny: a girl
being a cat under the desk while her parents discuss her cognition, a grandfather enumerating flush conditions. The
plan reads solemn. The keyframes in this pass lean toward the wit wherever the text has it.

### 6.4 Whose faces are drawn

The plan's rule is "only the people who can read her get a drawn face: Mama, Dad, first love". The poems complicate
it: Mama is the person who most often misreads the face, and a second friend at the housewarming reads the tap as
well as first love does. A rule that fits everything: **faces are drawn for the people whose faces she has learned.**
It is her perception that the film is rendering ("I memorize their clothing and current positions / I've already
forgotten their faces"), so strangers are clothes, shoes and hands, and family and the two friends are people. Mama
belongs without argument. The childhood friend earns the same treatment as first love (back of head, hands, a
hoodie); he has no sheet yet.

### 6.5 The wall

- The social worker's question in the poem is "Were you afraid?", about the raid. So the cut from the school office
  to the inside of the wall at 1:38 is not a metaphor for "inside": it is her memory answering the question she was
  asked. The plan is closer to the poem here than it claims.
- She is not alone in there. Her mother "shimmied in after". Jade has said the others can stay out of frame. One
  optional frame keeps that true and still tells the viewer she is held: an adult's knuckles round her hand at the
  bottom edge of the blade of light (`WL_eye_hand`).
- The crack of light is not in the 1988 poems. It comes from Jade's own image list in the brainstorm, which outranks
  the poems. The digest flags that the "sliver of light" line the plan cites is from an adult nightmare.

### 6.6 Gold

In the poems gold is the headband the Jade Emperor puts on the monkey to control him, and "no more gold headband" is
how she describes quitting piano. The plan makes gold pencil her own notation. I think the reversal is right (the
gold is now in her hand, on the world) but it should be made knowingly: never a gold band, ring or halo on or round
her head. The first field note is a gold ring round a mote, which is fine. Worth one look from Jade.

### 6.7 She hums

"humming the notes quietly" at the paper keys. The v3 audio has lost the vocalise after chorus 2, which was the
plan's one place where "her mouth and the song agree without effort". The piano break (0:59-1:18) can take that
job: the five-year-old, lips closed, humming the melody the piano is playing. The child still never sings a word.

### 6.8 Small corrections the keyframes already follow

- Basement: she balances on the chair spokes holding Dad's shoulders, then hops off to point. Two beats, two frames.
- Supermarket: the grandmother speaks and passes after the pull. Waiting behind her, unlit, is the plan's addition
  and a good one; the frames keep it.
- School office: she points at the misalignment and only then looks closer to see which face is under her finger.
- Housewarming: she is the host; first love is a friend there, not her partner; most of the room stares, not all.
- "It was correct" is said by Dad, in Shanghainese. The plan has her write it. Either works; the keyframe leaves
  the paper blank so the words can be hers in gold or his in a subtitle.

### 6.9 What I did not touch

Timings. The plan's Structure table is still on v2 times and the outro, tail 2 and coda rows still need Jade's
answer (see `HANDOFF.md`). Keyframes do not depend on it.
