#!/usr/bin/env python3
"""Age-shift sheets of little Jade for Proof, through Codex's built-in image_gen (headless codex exec).

    python3 ljgen.py AGE SHEET VER [extra guard text]     AGE in 03 07 10; SHEET in H A C B
-> cast/little_jade_AGE/ljAGE_<SHEET name>_vVER.jpg + .txt
"""
import os, subprocess, sys, time

ROOT = '/home/jade/Documents/proof'
V3 = f'{ROOT}/inputs/refs_chaosmonkey/little_jade'
NAMES = {'H': 'H_heads', 'A': 'A_turnaround', 'C': 'C_expressions_mouths', 'B': 'B_poses'}

FACE = ("She is the same child as on the age-5 sheets, with the same features: LARGE round dark eyes set wide apart, each with "
        "thick dark upper lashes and a bright clear highlight; distinct, fairly strong, straight dark eyebrows; a tiny button "
        "nose; a small soft mouth; soft cheeks with a wide warm pink blush; glossy jet-black hair with a light fringe of a few "
        "soft parted strands, the forehead showing between them, and long side locks in front of the ears.")

AGE = {
 '03': dict(
  who="Little Jade at about age 3, Shanghai, summer 1986: a very small Chinese girl, a toddler.",
  body="Toddler proportions: a very big round head, about four heads tall, a short neck, short chubby arms and legs, small "
       "dimpled hands, a round tummy. Her face is even rounder and shorter than at 5: fuller baby cheeks, a shorter chin, a "
       "smaller nose; the eyes are just as large and dark.",
  hair="Her hair is shorter and finer than at 5: a soft bob ending at the chin, the same thin parted fringe and side locks, and "
       "one tiny sprout of a ponytail standing up on top of the crown, tied with a thin red thread.",
  clothes="Clothes (1986 Shanghai, home-made, plain): a loose short-sleeved cotton smock dress to the knee in a faded pale "
          "red-and-white small gingham check, with a plain white round collar; bare arms and legs; black cotton cloth shoes "
          "with one strap, no socks.",
  not_="She is 3, not 5 and not a baby: she stands and sits steadily."),
 '07': dict(
  who="Little Jade at about age 7, Decatur, Illinois, 1990: a Chinese girl in first or second grade.",
  body="Proportions of a seven-year-old: about five and a half heads tall, longer and thinner arms and legs than at 5, no "
       "round tummy. Her face is the same face a little grown: still round with soft cheeks and blush, the chin a touch "
       "longer, the eyes just as large and dark, the same strong straight brows. When (and only when) she grins, one upper "
       "front tooth is missing.",
  hair="Her hair is as at 5 but longer: the same light parted fringe and side locks, the same small half-ponytail tied high at "
       "the back of the crown with a dark band, the rest straight down to her shoulder blades.",
  clothes="Clothes (1990 American Midwest, hand-me-down, plain): an oversized plain heather-grey crew-neck sweatshirt with the "
          "sleeves pushed up to the elbows, no print and no lettering; dark navy stirrup leggings; bare feet.",
  not_="She is 7, clearly older than the age-5 sheets and clearly younger than 10."),
 '10': dict(
  who="Little Jade at about age 10, Skokie, Illinois, 1993: a Chinese girl in fourth or fifth grade.",
  body="Proportions of a ten-year-old child: about six and a half heads tall, long thin arms and legs, narrow shoulders, a "
       "child's straight body. Her face is the same face grown: a soft oval now, the cheeks less full but still softly "
       "rounded with the same pink blush, a small soft chin, the nose still small, the same large dark wide-set eyes with "
       "lashes and highlight (a little smaller relative to the face than at 5), the same strong straight dark brows.",
  hair="Her hair is long now, straight down to the middle of her back: the same small half-ponytail tied high at the back of "
       "the crown with a dark band, the same side locks in front of the ears, the fringe grown out into a few long thin "
       "strands parted to both sides so that most of the forehead shows.",
  clothes="Clothes (1993 American Midwest, plain): a loose pale-blue chambray button shirt worn open like a jacket over a plain "
          "white T-shirt, sleeves rolled up to the elbows so the forearms are bare; straight khaki-tan cotton trousers; plain "
          "white canvas sneakers. No print, no lettering, no jewellery, no glasses.",
  not_="She is 10: a child, not a teenager, no make-up; clearly older than the age-5 sheets."),
}

HAND = ("Painting hand: Chinese fine-line figure painting on plain cream xuan paper, delicate thin baimiao ink outlines for faces, "
        "hands and clothing folds, light transparent colour washes, hair in soft black ink wash with a gloss, paper grain "
        "showing. Skin warm and rosy, never grey. Not anime, not cel shading, not a photograph, not a 3D render. Plain bare "
        "cream paper, no text, no labels, no numbers, no arrows, no motion lines, no signature, no seal, no border.")

STILL = ("Her resting face is still and attentive: mouth softly closed, the whole face quiet, and all the life in the eyes, which "
         "are bright and fixed on one exact point as if counting something. Her expressions are small in the face and large in "
         "the eyes.")

LAYOUT = {
 'H': ("A character likeness sheet: exactly six head-and-shoulders portraits of the SAME child, all the same size, evenly "
       "spaced in two rows of three on bare paper. Top row: front view; three-quarter view; pure profile facing left. In the "
       "top row her face is at rest: still, mouth softly closed, bright eyes fixed on one exact point. Bottom row, three "
       "acted moments: (1) a real, delighted open grin because an idea has just pleased her, eyes crinkled nearly shut; (2) "
       "head still and facing us, mouth softly closed, eyes slid far to one side following a small thing drifting through "
       "the air; (3) chin lifted a little, eyes looking up at something above her, a small puzzled crease between the brows, "
       "lips just parted."),
 'A': ("A character turnaround sheet of ONE child on bare paper, full figures head to toe, all the same scale, evenly spaced "
       "in one row: standing front view; standing three-quarter view; standing pure side view; standing back view; and at "
       "the right the same child seated. {seated} In the front and three-quarter views her face is at rest: still, mouth "
       "softly closed, bright eyes looking at one exact point."),
 'C': ("An acting sheet of ONE child on bare paper, two rows. TOP ROW: six head-and-shoulders portraits, all the same size, "
       "each a different played moment. BOTTOM ROW: at the far left one more head-and-shoulders portrait the same size; then "
       "four close-ups of the lower face only (nose tip to chin), side by side, the four singing mouth shapes in this order: "
       "(a) lips closed, humming; (b) 'ah', jaw dropped, mouth open tall; (c) 'oh', lips rounded into a small circle; (d) "
       "'ee', lips stretched wide, teeth showing. Every face is the same child, on-model. TOP ROW, left to right: (1) at "
       "rest, counting: face still, mouth softly closed, bright eyes fixed on one exact point just below eye level; (2) "
       "tracking: head still, mouth closed, eyes slid far to one side following a small thing drifting in the air; (3) the "
       "jump: eyes have just flicked up to something above her, chin barely lifted, a small puzzled crease between the "
       "brows, lips just parted; (4) a real, delighted open grin because an idea has just worked out, eyes crinkled nearly "
       "shut, shoulders up; (5) a smile performed for a grown-up, a little too wide and held a little too long, eyebrows "
       "lifted too high, while her eyes stay round, open and watchful, checking whether it is right; (6) listening hard for "
       "a small sound: head tilted a few degrees, eyes gone soft and aimed at nothing off to one side, lips a little apart, "
       "breath held. BOTTOM ROW far left: (7) about to say something: mouth open a little, a breath taken in, eyes on the "
       "person she is facing, no sound yet."),
 'B': ("A pose sheet of ONE child on bare paper: four full-figure drawings of the same child, all the same scale, evenly "
       "spaced in one row, each one an acted moment with the whole body. Hands carefully drawn with five fingers. {poses}"),
}

SEATED = {
 '03': "Seated figure: sitting on the floor with her short legs straight out in front, holding one small square of white tissue paper in both hands, looking down at it.",
 '07': "Seated figure: sitting on a plain wooden chair with her bare feet tucked up on the front rung, hands on her knees, eyes on something in front of her.",
 '10': "Seated figure: sitting on the floor cross-legged, holding one green globe artichoke in both hands in her lap, looking down at it.",
}

POSES = {
 '03': ("Every figure is seen from a three-quarter angle, sitting on the floor with her legs folded to one side under the "
        "skirt (the soles of her shoes never face the viewer). (1) tearing a square of thin white tissue paper in half with "
        "both hands, looking down at the tear, a few torn pieces of tissue on the floor around her; (2) holding one very "
        "small scrap of tissue pinched between the thumbs and forefingers of both hands, raised close to her face, tearing "
        "it smaller still, eyes fixed on the scrap, lips pressed together with care, many tiny scraps in her lap; (3) one "
        "open hand held out, eyes following one tiny scrap as it drifts down through the air beside her; (4) her head "
        "tipped far back, looking straight up at tall grown-ups who are above her and outside the picture, a small puzzled "
        "crease between her brows, mouth softly closed, a scrap still pinched in her fingers. Even when she looks down her "
        "eyes stay large, round and dark as in image 3, never narrowed to slits."),
 '07': ("(1) at home: sitting on the front edge of a swivel office chair that has a five-spoke star base, her knees bent and the soles "
        "of both bare feet planted flat ON TOP of two of the metal spokes of the base, toes curled over them, leaning forward and pointing with one index finger at the glass of a bulky beige 1990 computer monitor on a "
        "desk, its screen a plain pale blue with nothing on it, eyes fixed on her fingertip; (2) crouched under a plain desk "
        "on hands and feet like a cat, back rounded, knees tucked, perfectly still, eyes looking out from the shadow; (3) "
        "standing at a table in white canvas sneakers, running one index finger slowly down a sheet of pale yellow paper "
        "printed with an empty ruled grid (blank cells, nothing written), eyes following the fingertip down the column; (4) "
        "sitting at a table, the fingers of one hand tapping on the tabletop like playing piano keys, the other hand in her "
        "lap, eyes aimed away to one side, thinking."),
 '10': ("(1) standing, holding one green globe artichoke in her left hand at chest height, the tip of her right index finger "
        "touching one leaf, counting the spiral of leaves, eyes fixed on her fingertip, lips barely apart; (2) the artichoke "
        "raised to eye level in both hands and turned, her head tilted a little, one eye nearly closed to sight along the "
        "spiral; (3) a real delighted open grin, eyes crinkled, the artichoke held against her chest, because the count has "
        "come out; (4) walking away to the right while a grown-up's hand (only the hand and a plain coat sleeve entering "
        "from the right edge of the paper, no more of the adult) is closed around her bare left forearm and leads her on: "
        "her body goes with the hand but her head is turned back over her shoulder to the left, eyes still fixed on "
        "something behind her, mouth softly closed."),
}


def build(age, sheet, extra=''):
    a = AGE[age]
    imgs = [f'{V3}/lj_H_heads_v3.jpg', f'{V3}/lj_H2_heads_v3.jpg']
    d = f'{ROOT}/cast/little_jade_{age}'
    refs = ("Image 1 is her accepted face sheet at age 5: it is the identity. Image 2 is the same child at age 5 in the "
            "film's painting hand: draw with image 2's thin ink line and pale wash, and keep image 1's large eyes, lashes, "
            "highlights, blush and strong brows. ")
    if sheet != 'H':
        imgs.append(f'{d}/lj{age}_H_heads_v1.jpg')
        refs += ("Image 3 is the same child at THIS age, already accepted: match image 3's face, age, hair and clothes "
                 "exactly. ")
    if sheet == 'B':
        imgs.append(f'{d}/lj{age}_A_turnaround_v1.jpg')
        refs += "Image 4 is her turnaround at this age: her body proportions and clothes. "
    refs += ("Do not draw the age-5 white jacket with the orange band. She must be unmistakably the same girl as in images 1 "
             "and 2 at a different age: a viewer shown both must say at once 'that is her'. Use the images for likeness "
             "only; draw a new sheet.")
    lay = LAYOUT[sheet].format(seated=SEATED[age], poses=POSES[age])
    parts = [lay, a['who'], FACE, a['body'], a['hair'], a['clothes'], a['not_'], STILL, refs, extra, HAND]
    return imgs, ' '.join(p for p in parts if p)


def run(age, sheet, ver, extra=''):
    imgs, prompt = build(age, sheet, extra)
    d = f'{ROOT}/cast/little_jade_{age}'
    os.makedirs(d + '/_rejected', exist_ok=True)
    stem = f'{d}/lj{age}_{NAMES[sheet]}_v{ver}'
    png, jpg = stem + '.png', stem + '.jpg'
    order = '; '.join(f'attached image {i + 1} = {os.path.basename(p)}' for i, p in enumerate(imgs))
    task = ("Use the built-in image_gen tool (do not write code to draw it) to make exactly ONE 16:9 landscape image at the "
            f"largest size it offers. The attached images are references in this order: {order}. Prompt for the image:\n\n"
            f"{prompt}\n\nSave the generated image to {png} . Do not write or change any other file. Reply with the saved "
            "path only.")
    with open(stem + '.txt', 'w') as f:
        f.write("route: codex image_gen (headless `codex exec -s workspace-write --skip-git-repo-check`, codex-cli 0.171.0, "
                "run in tmux session proof-sheets-lj; $0, on plan)\ndate: 2026-11-22\n"
                "references (generated v3 sheets only, no photos):\n" + ''.join(f'  image {i + 1}: {os.path.relpath(p, ROOT)}\n' for i, p in enumerate(imgs))
                + f"\n{prompt}\n")
    cmd = ['codex', 'exec', '-s', 'workspace-write', '--skip-git-repo-check', '-C', ROOT, task]
    for p in imgs:
        cmd += ['-i', p]
    t = time.time()
    r = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=1500)
    if os.path.exists(png):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', png, '-q:v', '2', jpg], check=True)
        os.remove(png)
        return f'OK {jpg} ({time.time() - t:.0f}s)'
    return f'FAIL {stem} ({time.time() - t:.0f}s) rc={r.returncode} {(r.stdout or "")[-400:]} | {(r.stderr or "")[-400:]}'


if __name__ == '__main__':
    age, sheet, ver = sys.argv[1:4]
    print(age, sheet, ver, run(age, sheet, ver, ' '.join(sys.argv[4:])), flush=True)
