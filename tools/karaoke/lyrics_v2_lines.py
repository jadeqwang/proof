"""Canonical lyric lines for the -2sm Suno render (inputs/Proof (-2sm).wav), checked against
faster-whisper large-v3 transcripts of the full mix and the separated lead (2026-11-24).
Differences from the v3 render: "Basement, Dad's code, I watch" (no "Down in the"),
"I point to one he missed" (no "the"), "I nod, past hour reviewed".
Each chunk: (section, window_start, window_end, [lines]); line = text or (text, opts).
opts: backing=True -> line is audible in Suno's no-lead track (shown italic, still highlighted).
Windows are in FULL-MIX time and only bound the forced aligner."""
CHUNKS = [
    ("Intro", 7.0, 21.5, [("You need facial expressions", {"whisper": True}), ("But not like that", {"whisper": True})]),
    ("Verse 1", 27.5, 59.0, [
        "Three years old, uncle explains atoms",
        "A week later my mother finds me",
        "sat in a snow drift of paper",
        "ripped to shreds",
        "Ever tinier",
        "repeating what uncle said",
        "What on earth are you doing?",
        "The adults howl with laughter",
        "What's so funny?",
        "Nobody tells me after"]),
    ("Pre-Chorus", 76.0, 96.0, [
        "She doesn't talk like other children",
        ("(Her English comes from books)", {"backing": True}),
        "Her face doesn't make much expression",
        ("For our culture, that's just how it looks", {"backing": True})]),
    # chorus first line aligned alone: "Inside?" is faint in the lead stem and the
    # aligner otherwise drags the whole line ~2 s late
    ("Chorus 1", 95.3, 99.9, ["How do you feel? Inside?"]),
    ("Chorus 1", 99.9, 115.5, [
        "I honestly don't know",
        "I open my mouth, my voice goes blind",
        "The words have nowhere to go"]),
    ("Verse 2", 125.0, 146.0, [
        "Resting oblivious face",
        "Blocking the aisle, in the wrong place",
        "Enthralled by an artichoke",
        "green and fresh",
        "Sacred geometry made flesh",
        "Basement, Dad's code, I watch",
        "I point to one he missed.",
        ("\"Good catch!\"", {"backing": True}),
        "Did she understand or just pattern match?"]),
    ("Bridge", 152.5, 174.3, [
        "Do you not see what I see?",
        "Does it matter what makes me me?",
        "Beauty on this side, truth by reference",
        "Science fiction shelved with truth",
        "From inside, I can't tell the difference",
        "And I can't give you proof"]),
    ("Verse 3", 173.8, 203.0, [
        "Housewarming, lemonade from the yard",
        "Perky American girl",
        "I play the part",
        "He said I absolutely nailed it",
        "Well, fifteen percent above amplitude",
        "I nod, past hour reviewed",
        "Hug durations, pitch contours",
        "Room crossing velocity",
        "I think he's right. Honestly."]),
    ("Chorus 2", 203.6, 209.6, ["How do you feel? Inside?"]),
    ("Chorus 2", 209.6, 224.0, [
        "I honestly don't know",
        "I open my mouth, my voice goes blind",
        "The words have nowhere to go"]),
    ("Outro", 232.0, 253.5, [
        "Keep the smile on so they don't know",
        "This is how we fit in",
        "She turns around, I let it go",
        "And I can think again"]),
]

# Display lines: the song's ORIGINAL line breaks (by rhyme), as written in inputs/Proof Suno Prompt.txt,
# with the words this render actually sings. Sung (aligned) lines above are regrouped into these by
# build_lyrics_v2.py: consecutive sung lines in a section are joined until their word count matches,
# and each display token replaces its sung word one-to-one (so punctuation/quotes can differ).
# Sections not listed keep the sung lines as they are.
DISPLAY = {
    "Verse 1": [
        "Three years old, uncle explains atoms",
        "A week later my mother finds me sat in",
        "A snow drift of paper, ripped to shreds",
        "Ever tinier, repeating what uncle said",
        "“What on earth are you doing?” The adults howl with laughter",
        "What’s so funny? Nobody tells me after",
    ],
    "Verse 2": [
        "Resting oblivious face",
        "Blocking the aisle, in the wrong place",
        "Enthralled by an artichoke, green and fresh",
        "Sacred geometry made flesh",
        "Basement, Dad’s code, I watch",
        "I point to one he missed. “Good catch!”",
        "“Did she understand or just pattern match?”",
    ],
    "Verse 3": [
        "Housewarming, lemonade from the yard",
        "Perky American girl, I play the part",
        "He said I absolutely nailed it",
        "Well, fifteen percent above amplitude",
        "I nod, past hour reviewed",
        "Hug durations, pitch contours",
        "Room crossing velocity",
        "I think he’s right. Honestly.",
    ],
}
