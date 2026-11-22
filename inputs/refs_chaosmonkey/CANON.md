# Character canon (Chaos Monkey)

Character designer pass, 2026-11-17. Look = rendering hand (a) (`docs/LOOK_BAKEOFF.md` L5/L6): people are fine-line 白描
faces and hands with light colour wash on cream xuan paper; rooms are paintings of night with one pool of coloured light.
Overview: `design/characters/_overview.jpg`. Spend for this pass: see the end.

## 00. v3 canon (accepted by Jade 2026-11-17). Overrides everything below

Jade accepted new likeness heads for all four people (`*_H_heads_v3.jpg`, `*_H2_heads_v3.jpg`). Every other v3 sheet here was
built from those heads and has NOT been seen by her yet. Overview: `_overview_v3.jpg` (the old `_overview.jpg` is kept).
Generator and every prompt: `_prompts/canon.py` + `_prompts/canon_extra.py` (also `work/sheets_v3/`); each image has its `.txt`.
Rejects: `_rejects/v3/`. Spend for this pass: $5.35 (27 calls: 20 gpt-image-2, 7 nbp).

### Superseded sheets (rule)
**All v1 and v2 sheets, crops, twins sheets and proofs of the four people are superseded for FACES. Never pass one as a face
reference again**: no `refs/*_heads.jpg`, `*_heads_v2.jpg`, `lj_full*`, `jade_upper*`, `twins_*`, `mama_A/B/C`, `*_v2.jpg`,
`proofs/p1`-`p8`. An old sheet may be passed only for clothing or body, and only with the words "use image N only for the
clothes"; prefer the headless crops `refs/jade_clothes_v2.jpg` (Jade's outfit, neck down) and `refs/daughter_dress_ref.jpg`
(dress and braid from every side; it has small old faces, so say "dress and hair only"). Never send a real photo to any service
(`_src/jade_face_photo.jpg` and any other).
Never write deadpan / unsmiling / neutral / flat / expressionless / unimpressed. Give a playable action (`docs/HANDOFF.md`, Acting).

### Files

| Who | Accepted heads (H primary, H2 second) | A turnaround + seated | C seven acted expressions + four mouths | B poses |
|---|---|---|---|---|
| Little Jade | `little_jade/lj_H_heads_v3.jpg` (LJ-1: face proportions, eye size), `lj_H2_heads_v3.jpg` (LJ-2: the film's hand) | `little_jade/lj_A_turnaround_v3.jpg` | `little_jade/lj_C_expressions_mouths_v3.jpg` | `little_jade/lj_B_poses_v3.jpg` (7) |
| Daughter | `daughter/daughter_H_heads_v3.jpg` (D-1: eye size), `daughter_H2_heads_v3.jpg` (D-2: hand) | `daughter/daughter_A_turnaround_v3.jpg` | `daughter/daughter_C_expressions_mouths_v3.jpg` | `daughter/daughter_B_poses_v3.jpg` (5); alt `daughter_B2_poses_v3.jpg` |
| Mama | `mama/mama_H_heads_v3.jpg` (M-1), `mama_H2_heads_v3.jpg` (M-2) | `mama/mama_A_turnaround_v3.jpg` (no apron; ONE small extra figure in the apron, far right) | `mama/mama_C_expressions_mouths_v3.jpg` | (none) |
| Jade | `jade/jade_H_heads_v3.jpg` (J-1), `jade_H2_heads_v3.jpg` (J-3) | `jade/jade_A_turnaround_v3.jpg` | `jade/jade_C_expressions_mouths_v3.jpg` (7th cell = rear-view mirror eyes) | (none) |

Pairs (front, three-quarter, over-the-shoulder onto the book): `pairs/lap_attic_v3.jpg` (Mama + little Jade, floor mat),
`pairs/lap_bed_v3.jpg` (Jade + daughter, against the bed, flashlight).
Proofs: `proofs/v3_attic_lap_gpt.jpg` (take 1 kept as `v3_attic_lap_gpt_take1.jpg`), `proofs/v3_bed_lap_gpt.jpg`.

Crops for prompting (`refs/`, 1100 px high):

| File | Content |
|---|---|
| `lj_heads_v3.jpg` / `lj_face_v3.jpg` | LJ-1 front + 3/4 + grin / front head alone (face proportions and eye size) |
| `lj_heads_v3_hand.jpg` | LJ-2 front + 3/4 + grin (the fine-line hand) |
| `daughter_heads_v3.jpg` / `daughter_face_v3.jpg` | D-1 front + 3/4 + laugh / front head alone |
| `daughter_heads_v3_hand.jpg` | D-2 front + 3/4 + laugh (the fine-line hand) |
| `mama_heads_v3.jpg` / `mama_face_v3.jpg` | M-1 front + 3/4 + laughing / front head alone |
| `jade_heads_v3.jpg` / `jade_face_v3.jpg` | J-1 front + 3/4 + "you're able" / front head alone |
| `jade_clothes_v2.jpg`, `daughter_dress_ref.jpg` | clothes only (see rule above) |

Order of expressions on the C sheets (top row 1-6, bottom-left 7, then mouths: closed hum with slight smile, ah, oh, ee):
- Little Jade: rapt listening; bargaining, hopeful and sly; delighted grin; "it isn't fair" near tears; sceptical sideways look,
  one eyebrow; the "Yes" face (eyes flicked up and away, lip held in, mischief kept back); sleepy yawn.
- Daughter: rapping with self-belief (one hand up); huge laugh; unsure, looking up for reassurance; cheeky, one eyebrow; cheeks
  puffed blowing on her palm; eager nod; asleep, mouth open.
- Mama: storyteller's relish; laughing head back; blowing across a page (puff of breath, no finger); mock-stern with lifted
  finger; alarm turning to relief, hand on chest; tired and glad; whispering behind a cupped hand.
- Jade: reading aloud, fond; a dare, eyebrows up; certain "you're able"; laughing; singing softly; tender, looking down;
  rear-view mirror with smiling eyes.
- Little Jade poses: on her back awake; reaching to touch Mama's forearm; one leg on a stack of books, hand shading eyes;
  mid-fall; blowing across her palm; two fingertips to her forehead; hand spread over a book page.
- Daughter poses: car seat, hands apart; pinching one hair and squinting; puffing it off her palm; fingertip on the page; asleep.

### Model
**Use `openai/gpt-image-2` for anything with these four faces** (`size=3072x1728, quality=high`, refs in `images`, up to 16).
It drew every promoted v3 sheet and both proofs on the first or second try, in the hand of the accepted H/H2 sheets.
`google/nano-banana-pro` lost on every side-by-side this pass: little Jade's and the daughter's eyes shrink, Jade is idealised
into a generic beauty with lighter eyes, Mama's lap partner got orange trousers, the book got printed pictures, and two of
seven calls came back 1K. Keep nbp for rooms without faces, or as a last resort with the 3-slot sets below.

### Which refs to pass

| Shot type | gpt-image-2 (up to 16; 3-5 is plenty) | nbp (max 3) |
|---|---|---|
| Close-up, one child | `<kid>_heads_v3.jpg`, `<kid>_heads_v3_hand.jpg`, the C sheet for the wanted expression | heads_v3, heads_v3_hand, C sheet |
| Close-up, one adult | `<adult>_heads_v3.jpg`, `<adult>_face_v3.jpg`, the C sheet | heads_v3, C sheet |
| Lip-sync start frame | as close-up + C sheet, name the mouth ("mouth (b) 'ah' of image 3") | same |
| Full figure / medium / wide | `<who>_heads_v3.jpg`, `<who>_A_turnaround_v3.jpg` (+ B pose sheet for a pose; + `_heads_v3_hand` for a child) | heads_v3, A, B |
| Lap two-shot, close | adult heads_v3, child heads_v3, `pairs/lap_*_v3.jpg`, child heads_v3_hand, adult face_v3 (exactly the proof set, in this order) | adult heads_v3, child heads_v3, pair sheet |
| Lap two-shot, medium / over-shoulder | the same five + both A turnarounds | pair sheet, adult heads_v3, child heads_v3 |
| Mama with apron (shot A3 only) | `mama_heads_v3.jpg`, `mama_A_turnaround_v3.jpg` ("the small figure at the far right shows the apron") | same |
| Car, Jade in mirror | `jade_heads_v3.jpg`, `jade_C_expressions_mouths_v3.jpg` ("the mirror at bottom left") | same |

Always name what each image is for ("image 2 is little Jade's accepted face sheet: her face and eye size") and end with
"Use them for likeness only; repaint in this painting." Do not pass a room frame in a close-up (it leaks its contents).
For the children always pass BOTH crops: `_heads_v3` sets the face (big eyes, highlights, blush) and `_heads_v3_hand` sets
the thin line and pale wash. With only the first the drawing goes kawaii; with only the second the eyes shrink.

### Prompt blocks (paste verbatim)

**Little Jade (v3)**
> Little Jade, 1988, age 5: a small Chinese girl with a big round head and a short round face, very full soft cheeks with a
> wide warm pink blush, a tiny button nose, a tiny soft mouth, and LARGE round dark eyes set wide apart, each with thick dark
> upper lashes and a bright clear highlight; distinct, fairly strong, straight dark eyebrows. Glossy jet-black hair: a light
> fringe of a few soft parted strands with the forehead showing between them, long side locks in front of the ears, a small
> half-ponytail tied high at the back of the crown, the rest straight to just past her shoulders. A cropped white zip jacket
> with a stand collar, one straight horizontal orange band across the chest and around both upper arms, a small pale-blue dot
> on her left chest; loose dark navy trousers; bare feet. No headphones. Small child proportions: a big head, about four and a
> half heads tall, short limbs, a round tummy.

**The daughter (v3)**
> The daughter, 2026, age 4: a small girl of mixed Chinese and European descent with a big round head and a short round face,
> very full soft cheeks with a wide warm pink blush, a tiny button nose, a tiny soft mouth, LARGE round dark-brown eyes each
> with a bright clear highlight and soft lashes, soft light-brown eyebrows. Warm brown curly hair (brown, never black):
> centre-parted, a braid running along each side of her head from the temple to behind the ear, into two low curly pigtails
> tied with pink bands, loose curly wisps at the temples and forehead. A pink short-sleeved dress with small puffed sleeves,
> printed all over with red strawberries with green tops; white socks, no shoes. Small child proportions: a big head, about
> four and a half heads tall, short limbs.

**Mama (v3)** (35; no apron after shot A3)
> Mama, 1988: a Chinese woman aged 35, young and attractive, smooth unlined warm skin; a soft oval face with a gently pointed
> chin, long almond dark eyes, clearly drawn dark straight-ish eyebrows that read behind her glasses, a straight nose, a full
> smiling mouth; glossy jet-black hair in a soft late-1980s perm of loose springy curls, side-parted, ending at the jaw (never
> longer); thin round wire-rim glasses; a plain cream cotton collarless blouse with a small notched neckline, sleeves pushed up
> above the elbows; dark loose trousers; white socks; forearms and hands pink from hot dishwater. NO apron. No wrinkles, no
> sagging, no grey hair: 35, not 45.

For A3 only, replace "NO apron." with: "a damp grey-beige canvas restaurant apron with darker wet patches, tied at the waist,
which she unties and hangs on a hook."

**Jade (v3)**
> Jade, 2026: a Chinese woman who looks about 30; an oval face with a softly pointed chin, almond eyes with deep near-black
> irises (almost as dark as her hair), dark, fairly strong, slightly asymmetric eyebrows (the eyebrow on the LEFT of the picture
> is straight; the eyebrow on the RIGHT of the picture runs straight and then lifts into a soft arch), a straight nose, full
> lips; thin dark rectangular half-rim glasses; long black hair with NO fringe: an open forehead, parted slightly off-centre,
> swept to both sides in long soft face-framing layers with a loose wave, past the shoulders. A cropped white racer jacket
> ending above the navel, stand collar with two snap tabs, worn open over a black mock-neck top; one orange band across the
> chest and one around each upper arm at the same height; a small pale-blue dot on her left chest; wide navy cargo trousers
> with orange straps; white sneakers, grey socks. Her jacket is plain white apart from the band and the dot: no logos, no
> lettering, white cuffs.

Full figure only, add: "On the back of the jacket a large pale-blue circle; a small round blank patch with a black ring on her
left sleeve."

### Guard sentences for known drift (v3)

| Drift seen | Guard that fixed it |
|---|---|
| Children's eyes shrink / face lengthens when only the fine-line sheet is passed, or on nbp | "Image 1 is her accepted face sheet: reproduce THAT child's face exactly, with eyes as LARGE relative to the face as in image 1, the same highlights, lashes, blush. Image 2 is the same child in the film's painting hand: draw with image 2's thin ink line and pale wash, but keep image 1's bigger eyes, rounder shorter face and stronger blush." |
| Child's head shrinks on full figures | "The big cute head must not shrink on the full figures: the head is nearly a quarter of her height." |
| Mama plainer and older in two-shots: thin brows, squarer jaw, faint lines by the mouth (`_rejects/v3/lap_attic_gpt_a.jpg`, `proofs/v3_attic_lap_gpt_take1.jpg`) | Add `refs/mama_face_v3.jpg` as an extra image and: "Mama is 35, pretty, with a soft oval face and gently pointed chin (not a square jaw), smooth unlined skin, and clearly drawn DARK, fairly thick eyebrows that read strongly behind the glasses." In a lit room also: "draw Mama's face with as few lines as on her face sheet: no lines from nose to mouth, no lines under the eyes, no hollow cheeks; a smooth young cheek with a little warm blush; her curls stop at the jaw line and do not reach the shoulders." |
| Mama's forearms not pink (`_rejects/v3/ma_A_gpt_a.jpg`) | "her bare forearms and hands are washed a clear pink-red (hot dishwater), distinctly pinker than her face and neck." |
| Mama blowing reads as "shh" | "cheeks filled round with air, lips pursed forward into a small 'o', a visible soft puff of breath leaving her lips, both hands out of the picture (NO finger anywhere near her mouth; this is blowing, not hushing)." |
| Jade's brows thin out, eyes go lighter, face idealised | Add `refs/jade_face_v3.jpg` and: "eyebrows drawn in dark ink, fairly strong, clearly visible above the glasses frame (the left-of-picture brow straight, the right-of-picture brow straight then arched); irises deep black-brown; keep her natural, real face, do not idealise her into a generic beauty." |
| Daughter's hair turns black beside a black-haired person | "her hair is warm brown, never black" (held in both lap frames with Jade). |
| Printed pictures appear in the book | "open picture book (blank cream pages, nothing printed)". In a room frame the model may still sketch faint ink trees on the page (attic proof): acceptable, or paint out. |

### Likeness under coloured night light (from the two proofs)
What kept the faces (`_prompts/proofs/v3_attic_lap.txt`, `v3_bed_lap.txt`):
> LIGHT AND SKIN (most important): the coloured light is a thin transparent glaze laid OVER normally painted faces. Under it
> both faces keep their own warm, rosy flesh wash and pink blush on the cheeks; the lit side is tinted, the shadow side is warm
> umber, never grey, never blue-grey, never ashen. The eyes stay as large as on the face sheets, with dark irises and a bright
> clear highlight in each eye. Hair stays glossy jet-black ink with a coloured sheen only at its edge.

- Describe the light as a glaze over a normally painted face, not as the colour of the face ("lit red" greys or reddens skin).
- Keep the neon window out of frame and say where the glow falls ("washes the right side of both figures, the mat and the page
  in transparent cinnabar red, while their faces stay warm and rosy underneath"). Without that sentence the red pool was weak
  (take 1); with it the room is clearly red and the faces still hold.
- Repeat the eye sentence inside the light paragraph; it is what kept highlights in both children.
- Attic result: little Jade on model (big eyes, highlights, blush); Mama reads about 35 with perm, glasses, dark brows.
  Bedroom result: Jade's glasses, brows, dark eyes and open forehead hold; the daughter is on model and looking up at her.

### Drift not fixed (v3)
- **Little Jade's crown and ponytail pick up a red-brown tint under the neon** in the attic proof (the sheen is not only at the
  edge). Faces unaffected. Re-roll, or add "the top of her head stays black".
- **Little Jade looks at the viewer instead of the page** in both attic takes although the prompt says rapt at the page.
- **Mama under room light reads 35 to 38**, a touch older than her flat-paper sheet; take 2 is the best of two. Her curls reach
  just below the jaw in the proofs.
- **The daughter's rap hands** are apart on both pose sheets but read as a shrug (B) or a point (B2), not karate chops. Direct
  the chop in the video prompt; do not rely on the sheet.
- The daughter's pose sheets draw her about 4 heads tall (B) and 3.5 (B2, reads age 2-3): use A for proportions.
- Little Jade's "it isn't fair" on sheet C reads tearful more than indignant; the accepted head sheet H (bottom right) has the
  angrier version. Her fringe on C is a little fuller than on H.
- Little Jade's jacket on the turnaround is hip-length, not clearly cropped; trousers have elastic cuffs.
- Jade's eyes are downcast in every lap-sheet view (she is reading); use `jade_heads_v3.jpg` for her open eyes. On the
  over-shoulder view the arm band sits low on the sleeve.
- Jacket lettering/patches stay blank on purpose (comp).

---

## How to use this file

1. Pick the shot's characters. Paste each one's **Prompt block** into the prompt verbatim.
2. Pass refs from the **Refs** table: Nano Banana Pro (nbp) takes at most 3 images. A close-up uses the head crop; a medium or
   wide shot uses the full sheet. In a two-shot give each character one ref and keep the third for a room/style frame.
3. Read **Known drift** and add the listed guard sentence when it applies.
4. Always say: "Use them for likeness only; repaint in this painting." (otherwise nbp pastes the sheet's layout).

### Rules learned from the proof frames (all characters)
- **A room frame as a ref leaks its contents.** `media/look/L5/nbp_a_v2.jpg` as ref #3 put a second copy of little Jade and its
  neon glyphs into a close two-shot (`proofs/_fail_p1_v2_*`). Pass a room frame only for wide/medium shots where its layout is
  wanted; for close-ups describe the room in words and spend the third slot on an expression sheet.
- **nbp sometimes returns 1376x768** even when asked for 2K/4K (about half of the sheet calls). Check the size; upscale with
  `pruna/p-image-upscale` (needs `enhance_details`, `enhance_realism`, `disable_safety_checker` keys; ~$0.01) or Lanczos.
  pruna's filter false-flags the monkey's staff as "violence"; we did not override it, we used Lanczos.
- nbp paints a cream paper margin/vignette around rooms now and then (`proofs/p4`): crop or re-roll.
- Neon: never ask for letters; ask for "red glow, no readable letters, window out of frame" in close-ups.
- Text/patches on the jacket ("RARE EARTH", "1420 MHz") are left blank on every sheet on purpose: fix them in comp
  (see `docs/PIPELINE_RECON.md` §7, lettering is always repaired in code).

Shared style sentence for people (the sheets were made with it; `_prompts/style_people.txt`):
> Painted on cream xuan paper in the hand of a Chinese fine-line figure painting: delicate baimiao ink outlines for faces,
> hands and clothing folds, light transparent colour washes, hair in soft black ink wash, the paper grain showing through.
> Not anime, not cel shading, not a photograph, not a 3D or digital render. No text, no signature, no seal, no border.

Room sentence (attic 1988), from the bake-off recipe:
> A Chinese painting of night, ink and light colour on cream xuan paper, in one hand: fine-line baimiao outlines for the
> faces and hands with light colour washes, dark ink washes for the room, the paper grain showing through. … one pool of red
> neon light from a small dusty window (no readable letters) … Faces drawn in delicate fine ink lines with a light flesh wash,
> as in a Song or Ming figure painting, not anime.

The proof prompts in `_prompts/proofs/` are complete, working examples for each world (attic, bedroom, car, stage).

---

## 0. Corrections from Jade (2026-11-17, after preview_v2). These override the blocks below.

1. **Hair, little Jade and adult Jade: no bangs covering the forehead.** The front hair is curtained to the sides, almost like
   layers; the forehead shows. The old little-Jade block's "blunt bangs to the eyebrows" and the old Jade block's "curtain
   bangs" are WRONG, and so is every v1 sheet, crop and shot of either of them.
2. **No "deadpan, watchful, unsmiling".** Jade: it "makes them look lifeless and have no action direction", and the girls are
   "less cute than their reference images". Never use deadpan / unsmiling / flat / "never cute" for anyone, and do not treat
   "cute" as drift. Give every shot a playable action instead (see `docs/HANDOFF.md`, "Acting").

**Redrawn sheets (v2), made 2026-11-17. Not yet approved by Jade** (her verdict comes back with the notes page):

| Use | File |
|---|---|
| Little Jade turnaround | `little_jade/lj_A_turnaround_v2.jpg` |
| Little Jade poses, each with an acted expression | `little_jade/lj_B_poses_v2.jpg` |
| Little Jade six expressions + four singing mouths | `little_jade/lj_C_expressions_mouths_v2.jpg` |
| Little Jade crops for prompts | `refs/lj_heads_v2.jpg`, `refs/lj_full_v2.jpg` |
| Jade turnaround | `jade/jade_A_turnaround_v2.jpg` |
| Jade expressions, mouths, mirror eyes, flashlight hand | `jade/jade_B_expressions_details_v2.jpg` |
| Jade crops for prompts | `refs/jade_heads_v2.jpg`, `refs/jade_upper_v2.jpg` |

Do not pass any v1 little-Jade or Jade sheet, crop, keyframe or the twins sheet's top row as a reference: a v1 image in the
refs brings the fringe straight back (it did on the first try at `lj_B`). Prompts beside each file (`*_v2.txt`).

**Prompt block, little Jade (v2)**
> Little Jade, 1988, age 5: a small Chinese girl with a round face and full soft rosy cheeks, large dark glossy eyes each
> with a small clear highlight, a tiny nose, a small soft mouth. Glossy jet-black straight hair with NO fringe and NO bangs:
> the forehead is open, the front hair parted slightly off-centre and swept to both sides in soft face-framing layers that
> fall beside her cheeks; a small half-ponytail tied high at the back, the rest to her shoulders. A cropped white zip jacket
> with a stand collar, one orange band across the chest and around both upper arms, a small pale-blue dot on her left chest;
> loose dark navy trousers; bare feet. No headphones.

**Prompt block, Jade (v2)**: the old block with the hair sentence replaced by:
> long black hair with NO fringe and NO bangs and no strands on the forehead: the forehead open, the hair parted slightly
> off-centre and swept to both sides in long soft face-framing layers with a loose natural wave, past the shoulders.

Known in v2: on the turnaround's front view little Jade's hair lies flatter than on the other views (prefer the 3/4 view
and the expression heads as the hair reference); the pose sheet has small motion ticks beside two poses (crop them out);
Jade's v2 expression sheet is shaded a little more softly than the v1 hand.

The daughter and Mama were not redrawn. The daughter's block still says "deadpan, watchful, unimpressed": drop those words
when prompting her, and consider a new expression sheet for her in the same spirit as `lj_C_expressions_mouths_v2.jpg`.

## 1. Mama, 1988 (about 30)

| Sheet | File | Model |
|---|---|---|
| A turnaround: front / 3-q / profile heads, standing, seated with book | `mama/mama_A_turnaround.jpg` (5504x3072) | nbp 4K |
| B six expressions (telling, amused, chuckling, whisper w/ cupped hand, mock-stern 听话 x2, blowing) | `mama/mama_B_expressions.jpg` | nbp, upscaled |
| C hands: finger-and-thumb ring; one finger lowering a child's hands; hand-shadow pose + shadow; whisper hand | `mama/mama_C_hands.jpg` | nbp, upscaled |

**Refs**
- Close-up / two-shot: `refs/mama_heads.jpg` (front + 3-q heads) + `mama/mama_B_expressions.jpg` if the slot is free.
- Full figure / wide: `mama/mama_A_turnaround.jpg`.
- Never pass the real face reference (`inputs/ref_moongazing_teahouse…`) in shots: it pulls her back to 55+. It was used only
  to design sheet A (`_src/mama_face_today.jpg`).

**Prompt block**
> Mama, 1988: a Chinese woman of about 30, youthful, smooth skin with no lines, no wrinkles, no grey hair; black hair in a
> soft late-1980s perm, loose curls cut level with her jaw; thin round wire-rim glasses with very fine metal frames; a round
> soft face with full cheeks and a soft rounded chin, gentle slightly downturned eyes, a small mouth with a wry closed-lip
> smile; a plain cream cotton blouse with the sleeves pushed up above the elbows, a damp grey-beige canvas restaurant apron
> with darker wet patches, dark loose trousers, white socks; forearms and hands pinkish-red from hot dishwater. Tired, wry
> and warm.

**Known drift**
- **Ages to 40+ in close two-shots** (`proofs/_fail_p1_attic_twoshot_nbp_aged.jpg`), and the youth guard alone then lost the
  perm (straight bob, `_fail_p1_v3_lost_perm.jpg`). Guard sentence that fixed both (`proofs/p1_attic_twoshot_nbp_v4.jpg`):
  *"IMPORTANT: Mama is a young mother of 30, not 40 or 50: a smooth unlined face, round soft full cheeks, no wrinkles, no
  sagging, glossy jet-black hair (not brown, not grey) in a soft 1980s perm of loose springy curls ending at the jaw (curly,
  not straight, not a bob); thin round wire glasses; the same face and age as in her canon sheet."* Refs for that frame:
  `refs/mama_heads.jpg`, `refs/lj_heads.jpg`, `mama/mama_B_expressions.jpg` (no room frame).
- Small gestures drift: "one finger lowers the child's hands" became palm-to-palm in v4. For C3 describe the contact
  exactly and expect to re-roll; or comp the hands from `mama/mama_C_hands.jpg` (drawing 2 is exactly this gesture).
- Hair grows past the jaw into long waves when seated or seen from behind (sheet A's seated figure already shows it). Say
  "jaw-length perm".
- Hair can drift dark brown under warm light; say "jet-black".
- Expression sheet B has two mock-stern heads (5 and 6); use either for 听话.
- Hands are reliably five-fingered on sheet C; in scenes check the hand that lowers the child's hands.

## 2. Little Jade, 1988 (age 5)

| Sheet | File | Model |
|---|---|---|
| A turnaround (front / 3-q / side / back) + sitting up on a mat | `little_jade/lj_A_turnaround.jpg` (2752x1536) | nbp 2K |
| B poses: tummy chin-on-hands; one leg up + hand shading eyes; bowing; blowing on palm; hand to forehead; hand flat on book page | `little_jade/lj_B_poses.jpg` (5504) | nbp 4K |
| C six expressions + four singing mouths (closed, ah, oh, ee) | `little_jade/lj_C_expressions_mouths.jpg` (3072x1728) | gpt2 (nbp would not keep the 6+4 grid) |
| Twins sheet (with the daughter, matched expressions) | `daughter/twins_lj_daughter_expressions.jpg` | gpt2 |

**Refs**
- Close-up: `refs/lj_heads.jpg` (three expression heads) [+ `little_jade/lj_C_expressions_mouths.jpg` for lip-sync frames].
- Full figure: `refs/lj_full.jpg` (front / 3-q / side) or the whole `lj_A_turnaround.jpg`; for a pose, `lj_B_poses.jpg`.

**Prompt block**
> Little Jade, 1988, age 5: a small Chinese girl with a round face and full soft cheeks, glossy jet-black straight hair with
> blunt bangs to the eyebrows and a small half-ponytail tied high at the back, the rest hanging to her shoulders; small dark
> almond eyes, a tiny nose, a small closed mouth; the family's deadpan, watchful, unsmiling "resting oblivious face". A
> child-size cropped white zip jacket with a stand collar, one orange band right across the chest and around both upper arms,
> a small pale-blue dot on her left chest; loose dark pyjama-like trousers; bare feet. No headphones.

**Known drift**
- **Hair turned ash-blonde** in a lit centred close-up (`proofs/_fail_p3_attic_lj_centre_nbp.jpg`). Guard sentence (fixed it in
  `p3_…_v2`): *"IMPORTANT: the little girl's hair is glossy jet-black ink (never brown, never blonde, never grey), even where the
  red light falls on it."*
- The orange band bends into a chevron on a turned torso (`p1`): say "one straight horizontal orange band".
- Trousers come out navy on nbp, charcoal on gpt2/sd5: both acceptable; say "dark" not "navy" if it matters.
- She reads cute/chubby rather than deadpan on nbp unless "deadpan, watchful, unsmiling" is in the prompt; the most deadpan
  version of her is the sd5 test (`_rejects/little_jade/test_A_sd5_v1.jpg`), kept as a mood reference.
- On sheet B, poses 2 and 5 both read as "shading the eyes"; the forehead touch is weak. For G1 (touches her own forehead) say
  "two fingertips resting on the middle of her own forehead, looking up".

## 3. Jade, 2026

| Sheet | File | Model |
|---|---|---|
| A turnaround + seated cross-legged with book and small flashlight | `jade/jade_A_turnaround.jpg` (5504) | nbp 4K |
| B expressions (soft telling, certain "You're able", amused, singing), 4 mouth shapes, rear-view-mirror eyes, thumb on flashlight switch | `jade/jade_B_expressions_details.jpg` (5504) | nbp 4K |
| Hand-shadow hands (with the others) | `monkey/handshadow_hands_all4.jpg` (pair 3) | nbp, upscaled |

**Refs**
- Close-up: `refs/jade_heads.jpg` (two expression heads with the jacket band) + `refs/jade_upper.jpg`.
- Full figure: `jade/jade_A_turnaround.jpg`. Driving: crop the mirror strip from sheet B.
- For likeness to Jade herself the A sheet was made with `_src/jade_face_photo.jpg` (her own photo, allowed) and the costume
  canon `_src/jade_costume_sheet.jpg`; in shots the painted sheets are enough (P5/P6 held).

**Prompt block**
> Jade, 2026: an adult Chinese woman with long straight black hair, centre-parted, with long curtain bangs framing her face
> and falling past the shoulders; thin dark rectangular glasses; an oval face with straight dark brows, calm almond eyes and
> full lips; a short cropped white racer jacket that ends above the navel with an elastic hem, stand collar with two snap
> tabs, worn open; one orange band right across the chest and one around each upper arm at the same height; a small
> pale-blue dot on her left chest; a small round blank patch with a black ring on her left sleeve; a large pale-blue circle on
> the back; a black mock-neck crop top; wide navy cargo trousers with orange straps.

**Known drift**
- First nbp pass made the jacket waist-length with the arm bands lower than the chest band (`_rejects/jade/test_A_nbp_v1.jpg`);
  the "cropped … above the navel … same height" wording fixed it.
- The expression sheet's first pass dropped the orange band entirely (`_rejects/jade/test_B_nbp_v1.jpg`): always include
  "one orange band across the chest" and a ref that shows it.
- **In medium/wide shots nbp embellishes the jacket**: extra orange trim on collar, cuffs and hem, extra patches and dots,
  even an invented logo (`proofs/_fail_p5b_jacket_embellished.jpg`); with a guard sentence and `refs/jade_upper.jpg` it is
  better but still adds orange cuffs/collar piping and moves the blank patch to the chest (`proofs/p5c_bed_asleep_nbp.jpg`).
  Guard: *"her jacket is plain white with only one orange band across the chest and one around each upper arm, one small
  pale-blue dot, and one small blank round patch on the left sleeve: no other patches, no logos, no other stripes, white
  cuffs."* Plan on a comp/paint-over pass for the jacket in hero shots (same as earlier projects' lettering fixes). The close-up
  (P6) and the floor-by-the-bed frame (L6 bake-off) are clean.
- Curtain bangs thin out to a plain centre part on standing views; say "long curtain bangs framing her face".
- She reads mid-20s, like the channel's anime Jade; that is the canon.

## 4. The daughter, 2026 (age 4), an original character

| Sheet | File | Model |
|---|---|---|
| A turnaround + asleep | `daughter/daughter_A_turnaround.jpg` (5504) | nbp 4K |
| B poses: car seat rapping with chopping hands; tummy on bed looking at book; blowing on palm; fingertip on page; mouth shapes | `daughter/daughter_B_poses_mouths.jpg` (5504) | nbp 4K |
| Twins sheet: little Jade (top) and daughter (bottom), six matched expressions | `daughter/twins_lj_daughter_expressions.jpg` | gpt2 |

Her face was drawn from little Jade's canon sheet (same eyes, cheeks, mouth), not from any real child; hair and dress come
from the illustrated moongazing sheet.

**Refs**
- Close-up: `refs/daughter_heads.jpg` (+ `refs/twins_left3.jpg` when you want the deadpan pushed).
- Full figure: `daughter/daughter_A_turnaround.jpg`; for a pose, `daughter_B_poses_mouths.jpg`.
- **Never pass a little-Jade ref alone with her** in a pose call: it turned her hair black in 4 of 5 poses
  (`_rejects/daughter/test_B_nbp_v1.jpg`). The twins sheet is safe because both hair colours are side by side.

**Prompt block**
> The daughter, 2026, age 4: a small girl with a round face and full soft cheeks, small dark eyes, a small nose, a small
> closed mouth and a deadpan, watchful, unimpressed face (the same face as little Jade); light chestnut-brown hair (brown,
> never black) in two braided pigtails tied with pink elastics, short wisps at the temples, no bangs; a pink short-sleeved
> dress with puffed sleeves, printed all over with small red strawberries with green tops; white socks.

**Known drift**
- Hair → black when little Jade is in the refs (above).
- She softens toward "cute" and a little open-mouthed in the car (`proofs/p7`); add "deadpan, unimpressed" and, for the rap,
  "both hands flat like little knives chopping down on the beat" (the hands came out as a small wave in P7).
- Sheet B has only three mouth shapes (closed, ah, oh); for "ee" use the twins/little-Jade mouth sheet as the shape guide.
- Close-ups render a little smoother/more digital than the attic frames (`proofs/p8`); add "visible paper grain, ink line".

## 5. The monkey (original design)

### 5a. Stage figure (splashed ink 武生)

| Sheet | File | Model |
|---|---|---|
| Model sheet: front / side / back + face close-up | `monkey/monkey_stage_model_sheet.jpg` (2560x1440; `_up` = 5286 wide) | sd5, refs L3/sd5_v2 |
| Pose sheet A (8): 亮相, bow left, bow front, bow right, bow away, crouch-scratch, newborn crouch, perched on staff | `monkey/monkey_poses_A_bows.jpg` (+`_up`) | sd5 |
| Pose sheet B (6): staff flower a/b, overhead sweep, thrust, cartwheel a/b | `monkey/monkey_poses_B_staff.jpg` (+`_up`, Lanczos) | sd5 |
| 14 single poses on blank 16:9 paper (first/last frames) | `monkey/singles/01_liangxiang.jpg` … `14_cartwheel_b.jpg` (~3000 px wide) | cut by `tools/gen/sheet_cut.py` |

Face grammar (all sheets agree): one peach/heart-shaped cinnabar field from the brows to the upper lip with two round lobes
over the eyes and a point down the nose; pale bare-paper muzzle and cheeks; two small gold eyes with a black pupil; a
down-turned beaked mouth line; small round ears; minimal black lines. Small round black skullcap; **exactly two** long
pheasant plumes (single tapering strokes with a barbed base). Tiger-skin kilt in ochre with dark stripes. Staff dark, a gold
band at each end, a little taller than he is. Lean, wiry; long arms.

**Refs**: model work `refs/monkey_turnaround.jpg` + `refs/monkey_face.jpg`; action: model sheet + the pose sheet nearest the
action (`monkey_poses_A_bows.jpg` or `_B_staff.jpg`). sd5 for the stage figure (paid, most ink-like), nbp also holds the design
(`proofs/p10`). Do not use qwen (gives him a gold circlet).

**Prompt block**
> The monkey: a lean, wiry stone monkey as a Peking-opera martial performer, painted in Liang Kai's splashed-ink manner: body
> and close-fitting suit in broad wet washes of dark ink with soft bleeding edges, limbs in a few quick abbreviated strokes. A
> small round black skullcap with exactly two very long thin pheasant-tail plumes arcing backwards. Face in a few fine lines: a
> pale bare-paper muzzle, a beaked down-turned mouth, small round ears, one peach-shaped field of cinnabar red around the eyes
> running to a point down the nose; the eyes two small touches of gold. A short tiger-skin kilt in a few ochre dabs with dark
> stripes. A long thin dark staff with a gold band at each end. Only colours: cinnabar, gold, ochre. Original design: not the
> 1961 Havoc in Heaven animation, not the 1986 TV make-up, no gold circlet, no headband, no armour, no yellow tunic, not Black
> Myth, not Dragon Ball, not anime, not cute.

**Known drift**
- The kilt saturates into a full tiger-print skirt on nbp (`_rejects/monkey/test_model_nbp_v1.jpg`); say "three or four ochre
  dabs".
- Fur gets rendered (realistic macaque) on nbp/gpt2; sd5 stays closest to wash.
- The newborn (07) wears no cap/plumes on sd5 and wears them on nbp: canon = **no cap, no plumes at birth** (07); the cap and
  plumes arrive with the first 亮相 (D1).
- Staff flower a/b (09/10) differ mainly in which side the dry-brush arc is on; the poses are close. Cartwheel b (14) is a
  running landing.
- Side view on the model sheet has no staff in hand; the turnaround is still the reference for proportions.
- Plume count holds at two in every output so far; still check it.
- A faint red band edge on the cap in coloured puppet art is cap trim, not a gold circlet; keep it red/green, never gold.

### 5b. Storybook figure

| Sheet | File | Model |
|---|---|---|
| Tiny 六七笔 figures (6 poses), a troop of ~20 faceless dabs, the pilgrim-era monkey in a grey robe clutching his head with only the thin gold band coloured | `monkey/monkey_storybook_figures.jpg` (3344x1882) | codex (free), Lanczos 2x |
| Same set a little larger / more strokes (for mid-scale) | `monkey/monkey_storybook_figures_alt.jpg` | nbp 2K |

Prompt: `_prompts/monkey_storybook_v2.txt` (the key words: "each no taller than a thumbnail … only six or seven brushstrokes …
cap is just the darkest point of the blot … two hair-thin flicks … no outlines, no fur, no eyes … no headband, no band of any
kind"). Known drift: nbp's first pass gave the tiny figures a **headband** and fur (`_rejects/monkey/test_storybook_nbp_v1.jpg`)
and an album fold down the middle; codex obeys the stroke budget best. The pilgrim monkey has a tail on both versions (fine).

### 5c. Shadow puppet (皮影)

| Sheet | File | Model |
|---|---|---|
| Rigging parts, solid dark silhouette with openwork, pivot holes marked (head, 2 plumes, torso+kilt, 2 upper arms, 2 forearms+hands, 2 thighs, 2 shins+feet, staff) + assembled puppet | `monkey/puppet_parts_silhouette.jpg` (3072x1728) | gpt2 |
| The same parts, same positions, translucent dyed leather | `monkey/puppet_parts_colour.jpg` | gpt2 edit of the silhouette sheet |
| Five swappable heads (monkey, pine, bird, fish, cat), identical neck tab + rivet hole; dark row + coloured row | `monkey/puppet_heads_swap.jpg` | gpt2 |

Known drift: a free-standing colour pass invented a third forearm (`_rejects/monkey/test_puppet_parts_colour_gpt2_v1.jpg`);
always derive the colour version from the silhouette sheet ("Repaint image 1 exactly … change only the material"). The
leather reads more opaque than translucent; add back-light glow in comp. Head-swap necks match by eye; snap them to one
pivot in the rig.

### 5d. Hand shadow

| Sheet | File | Model |
|---|---|---|
| Monkey-head hand shadow, clean black silhouette (soft wall-shadow edge) | `monkey/handshadow_silhouette.jpg` | nbp |
| Same, crisp graphic version | `monkey/handshadow_silhouette_alt_codex.jpg` | codex |
| Four pairs of hands in the same pose, each with its shadow: Mama (red hands, cream sleeves), little Jade (white cuffs, orange band), Jade (white racer cuffs), daughter (strawberry puff sleeves) | `monkey/handshadow_hands_all4.jpg` | nbp, upscaled |

Known drift: the hand pose on the sheet is a generic "two flat stacked hands" and could not physically cast that silhouette.
Treat the shadow as its own comp layer (the silhouette file) and the hands as a separate element; never ask a model to make
the shadow from the hands. The codex v1 silhouette read as a bear (`_rejects/monkey/handshadow_silhouette_codex_v1.jpg`):
the words that fixed it are "high domed skull, heavy jutting brow, C-shaped ear gap of light, short muzzle".

## 6. The Master

`master/master_sleeve_hand.jpg` (nbp, upscaled): three studies of one long pale sleeve and a slender hand, leaning in to
whisper / tapping three times / withdrawing; pale baimiao on cream, no face. Prompt `_prompts/master_v1.txt`. Known drift:
nbp split the sheet into three panels with white gutters; crop one panel per use. The hand reads young and elegant rather
than old; add "an old man's hand, knuckles and veins in a few lines" if wanted.

---

## Proof frames (each canon sheet used as the only likeness source)

All nbp 16:9 2K unless noted; prompts in `_prompts/proofs/`. Files in `proofs/`.

| Proof | Characters | Result |
|---|---|---|
| `p1_attic_twoshot_nbp_v4.jpg` (C3) | Mama + little Jade | **Holds on the 4th try**: v1 Mama aged 40+, v2 room-ref leak (a second child + neon glyphs), v3 lost the perm; v4 = 30ish, perm, round glasses, apron; gesture became palm-to-palm; jacket band bends; returned 1K |
| `p2_attic_mama_blow_nbp.jpg` (C5) | Mama profile blowing | **Holds**: ~30, perm, glasses, red hands |
| `p3_attic_lj_centre_nbp_v2.jpg` (G5) | little Jade centred | **Holds** after the jet-black guard (v1 went blonde) |
| `p4_attic_lj_pose_nbp.jpg` (D9) | little Jade one-leg pose + Mama laughing | **Holds** (paper margin on the left) |
| `p5c_bed_asleep_nbp.jpg` (L1) | Jade + daughter asleep on the bed | Faces hold (Jade glasses/bangs, daughter braids/dress, asleep); **jacket trim drifts** (orange collar/cuffs, patch on chest). `_weak_p5_copies_L6_roomref.jpg` holds perfectly but only because it re-drew the L6 bake-off frame |
| `p6_bed_jade_centre_nbp.jpg` (I4) | Jade centred, flashlight | **Holds**: glasses, bangs, cropped jacket, band, dot |
| `p7_car_daughter_nbp.jpg` (F1) | daughter in car seat | Likeness holds (braids, dress); hands not chopping; car interior more illustration than ink |
| `p8_bed_daughter_close_nbp.jpg` (K2) | daughter over the book | **Holds**, deadpan; smoother than the attic hand |
| `p9_stage_monkey_perch_sd5.jpg` (D8) | monkey on staff over the sea | **Holds**: 2 plumes, peach patch, cap, banded staff |
| `p10_stage_monkey_new_nbp.jpg` (new pose) | monkey mid-leap | **Holds** on nbp from the sd5 sheets |

Failed proofs kept as `proofs/_fail_*` for the drift record.

## Spend

Ledger for this pass: `design/characters/_costs.tsv` (list-price estimates): **$9.78 over 61 paid calls** (nbp 38 = $6.89, gpt2 10 = $2.09,
sd5 7-8 = $0.73, pruna upscales 6 = $0.06), plus 3 free codex images. Failed calls (one 400 size error, one 500) were not billed. Project ledger
after this pass (all agents): $78.89 of $600.

## Progress log
- Model test (same sheet prompt on nbp / sd5 / gpt2): Mama -> nbp (reads 30; sd5 had the strongest likeness but read ~40;
  gpt2 young but illustrative, yellow paper). Little Jade -> nbp (matches L5; gpt2 equally good; sd5 most deadpan, greyer
  paper). Jade -> nbp. Monkey stage -> sd5 (closest to the L3 canon; nbp over-renders a saturated kilt and a realistic macaque;
  gpt2 clean but stiff). Grids (expressions, twins, puppets) -> gpt2.
- Checkpoint 2: all canon sheets promoted; nbp 1K returns upscaled.
- Checkpoint 3: proofs run; Mama-ages and LJ-hair drifts found and guarded; room-ref leak found.
- Done (status: COMPLETE for this pass). Open items: Jade's jacket trim in medium shots (comp fix); Mama's small hand
  gestures; daughter "ee" mouth; Jade to check Mama's likeness (sheet A was built from her mother's face at 30 by
  instruction, nobody who knew her then has seen it).

---

## Monkey v3 (yellow) (STAGE team, 2026-11-17, for preview_v3; REVISION_V3 §3.4)

Jade: "most of my recollection of Sun Wukong is where he's in his traditional yellow outfit, like in Peking opera; can we
try how that looks?" The stage monkey of every stage shot (D1 D2 D6 D7 D8 J3) is now the Peking-opera Sun Wukong in
OUR hand: quick ink line and splashed ink with a 藤黄 gamboge wash on cream xuan. **The dark-ink monkey of section 5a is
kept untouched** (files, singles, v2 comps in `media/comp/_v2/`, scripts in `shots/_v2/`): restoring it is a file copy.

| Sheet | File | Model |
|---|---|---|
| Model sheet: front / side / back + head close-up | `monkey/v3/monkey_v3_model_sheet.jpg` (2560x1440) | sd5, refs: old model sheet + `media/look/L3/sd5_v2.jpg` |
| Pose sheet A (8): 亮相, bow west (profile left), bow south (to us), bow east (profile right), bow north (away), crouch-scratch, upright salute, look-out perch on the staff | `monkey/v3/monkey_v3_poses_A_bows.jpg` | sd5, refs: v3 model sheet + OLD pose sheet A (poses/layout only) |
| Pose sheet B (6): staff flower a/b, overhead sweep, thrust, cartwheel a/b | `monkey/v3/monkey_v3_poses_B_staff.jpg` | sd5, refs: v3 model sheet + OLD pose sheet B |
| Pose sheet C (6): running launch, tucked somersault, laid-out somersault, landing crouch, seated giving the word, newborn crouch | `monkey/v3/monkey_v3_poses_C_tumble.jpg` | sd5, ref: v3 model sheet |
| 20 single poses on blank 16:9 paper | `monkey/v3/singles/01_liangxiang.jpg` … `20_newborn_crouch.jpg` | `tools/gen/sheet_cut.py` |
| Proof on our paper (Paper 'new', seed 58, with the 倉 seal) | `monkey/v3/proof_v3_on_paper.jpg` | `tools.ink` |
| Prompts, tests and rejects | `monkey/v3/_prompts/`, `monkey/v3/_tests/` | |

**Design (all sheets agree)**: lean, wiry, long arms. Costume = one wet transparent wash of gamboge yellow, pooling at
the edges, with small dark comma-shaped swirl marks (the 猴衣's fur pattern) flicked in; a soft round **yellow cap with
one row of pompoms** across the brow (yellow, two or three cinnabar) and a tuft on top; a **yellow scarf** knotted at
the throat, two loose ends (they fly: they do the job the plumes did); black sash; a short dark-ochre flap skirt;
**black boots**. Black-ink fur shows only round the face, at the wrists and hands. Face unchanged from 5a: the
peach-shaped cinnabar field on a white (bare paper) face, small gold eyes, beaked down-turned mouth. Staff unchanged:
dark, a gold band at each end. **No plumes, no feathers, no crown, no circlet, no armour.** Gold stays reserved (eyes,
staff bands); the yellow is a plant-yellow WASH, matte, never metallic, never satin.

**Refs for new work**: `monkey/v3/monkey_v3_model_sheet.jpg` + the pose sheet nearest the action. sd5 (most ink-like;
nbp makes a clean costume doll: `_tests/model_nbp_ref_v1.jpg`). Passing an OLD pose sheet as "poses and layout only" next
to the v3 model sheet carries poses over one to one.
**Storybook miniature** (the small painted monkey on book pages, BOOK team): use `monkey/v3/monkey_v3_model_sheet.jpg`
as the design reference (and `monkey/v3/singles/01_liangxiang.jpg` for the pose); at thumbnail size it is: a yellow dab
of wash for the body, a dot of cinnabar for the face, black boots, a dark line for the staff, the yellow scarf flick.
Never an opera photograph as a model reference (reference-only rule); none was used for these sheets.

**Prompt block** (`monkey/v3/_prompts/desc_v3.txt`)
> The monkey (one fixed design): Sun Wukong as a Peking-opera martial performer in his traditional yellow stage costume,
> lean and wiry with long arms, painted in ink and light colour on xuan paper in a free, fast, splashed-ink hand. Line:
> quick calligraphic black ink line of changing weight, broken and dry in places. Colour: the whole costume is one wet
> transparent wash of gamboge yellow (matte, pooling darker at the edges, leaving flecks of bare paper, bleeding a
> little past the ink line), never metallic gold, never shiny satin. Costume: a close-fitting yellow jacket and yellow
> trousers scattered with small dark ink comma-shaped swirl marks; a soft round yellow cap with one row of small
> pompoms across the brow (yellow and two or three cinnabar-red) and a small tuft on top; a yellow silk scarf knotted
> at the throat, its two loose ends flying; a black sash over a short flap skirt with a dark ink edge; black cloth
> boots. No plumes, no feathers, no crown, no gold circlet, no armour. Face: one peach-shaped field of cinnabar red
> around the eyes running to a point down the nose, on a white face; small gold eyes; a beaked down-turned mouth line;
> small round ears. A long thin dark ink staff with a short gold band at each end. […full text in the file]

**Video guard sentence** (`tools/stage/submit_v3.py`): "He stays a painting on paper: quick black ink line and a wet
gamboge-yellow wash scattered with small dark swirl marks, his round yellow cap with its row of pompoms, the yellow scarf
knotted at his throat, black sash, dark ochre flap skirt, black boots, the small red patch around his eyes, and the long
dark staff with a gold band at each end. The cream paper around him stays bare. Locked-off camera. No ground, no shadow,
no background, no tail, no feathers, nothing new appears."

**Known drift**
- The flap skirt comes out as a dark-ochre fur/tiger skirt (a carry-over from the old kilt); accepted (虎皮裙 is canon
  in the opera too). Back view shows a short tail-like sash end on some poses.
- Keying: `key_paper(lo=0.025)` keeps the pale yellow; at the default `lo=0.035` the lightest wash thins.
- Seated pose 19 holds up two fingers like a "V": read as 捏诀 only at small size.
- Sheets are 2560 px: a single figure is ~650 px tall; soft when laid above ~75 % of a 1080p frame.

**Reconciled with the costume research (REVISION_V3 §15, `refs/paintings/MANIFEST_V3.md` topic 01), 15:10.** The stills
show two stage costumes: (a) all yellow, jacket AND trousers, with a black whorl pattern, yellow cap
(`opera_hih14_*`, `opera_arhats16_*`); (b) the yellow quilted jacket with black key-fret, leopard-fur trim, red scarf
over a white collar, knotted yellow-and-black cap, red trousers (`opera_hih02_*`). The v3 sheets above are costume (a)
plus a yellow scarf, and every shot of preview_v3 uses them. Costume (b) in our hand exists as ONE alternate model sheet,
`monkey/v3/monkey_v3b_ALT_fret_leopard_redscarf.jpg` (sd5 edit of the v3 sheet, described in words only; no photo was
passed): red scarf, key-fret, leopard trim. It is NOT in any shot; switching means new pose sheets and re-generating
the six clips (about $12 and an hour). Shown to the lead as a choice for Jade.
