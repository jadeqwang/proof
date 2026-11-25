#!/usr/bin/env python3
"""Stage descriptions for the artichoke growth plates, and the prompt builder.

s12 is the anchor (generated from prompts/s12.full.txt with no reference). Every other stage is an edit of its neighbour
toward the anchor: s11..s00 are generated backwards (each from the stage after it: "the same plant, earlier"), s13..s16
forwards (each from the stage before it: "the same plant, later").

    python stages.py sNN          # writes prompts/sNN.full.txt and prints the neighbour it must be generated from
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, "..", "prompts")

KEEP = ("Keep EVERYTHING else exactly as it is in image 1: the same sheet of paper, the same plate mark, the same caption "
        "in the same place and size, the same low mound of earth with the same pebbles in exactly the same place and size, "
        "the plant's base exactly where it is (where the stem leaves the earth), the same viewpoint, the same scale, the same "
        "engraving line, hatching and pale watercolour washes. Every leaf that is still there keeps its position, direction "
        "and character, only {how}. Do not move, re-centre, zoom or re-compose anything.")

BACK = {  # stage: (weeks, description of the earlier plant)
    "s11": ("two weeks", "The flowering stem is shorter: it rises only to about 34% down from the top of the sheet, and its main bud "
            "at the top is smaller, about two-thirds of the size, tight and green with only the faintest violet on its bract tips. "
            "The side bud is only a tiny green knot. The rosette of leaves is the same."),
    "s10": ("two weeks", "The flowering stem has only just started to rise: it is a short thick stem standing up out of the centre of "
            "the rosette to about 50% down from the top of the sheet, with a small tight young green bud, the size of a walnut, at "
            "its top, half hidden among young leaves. No side bud yet. The rosette of leaves is the same, a little less full."),
    "s09": ("two weeks", "There is no flowering stem and no bud at all yet: only the rosette of leaves, its centre a tight cluster "
            "of young pale yellow-green leaves standing upright. The leaves are the same, slightly fewer in the centre."),
    "s08": ("three weeks", "The rosette is smaller: the outer leaves are about 80% as long and the plant spans about 36% of the "
            "sheet's width, with a few fewer leaves, the outer ones arching down toward the earth."),
    "s07": ("three weeks", "The rosette is smaller again: the leaves are about 80% as long, the plant spans about 29% of the sheet's "
            "width, with about nine leaves."),
    "s06": ("three weeks", "The young plant is smaller: about seven leaves, about 80% as long, the plant spans about 23% of the "
            "sheet's width; the leaves still deeply lobed and silvery but more upright."),
    "s05": ("three weeks", "The young plant is smaller: six leaves, about 75% as long, spanning about 17% of the sheet's width, "
            "the leaves more upright, their lobes a little shallower."),
    "s04": ("two weeks", "The young plant is smaller: five leaves, about 75% as long, spanning about 12% of the sheet's width, "
            "standing up in a loose vase shape; the leaves are lobed and toothed, silvery green."),
    "s03": ("two weeks", "A young seedling plant: four small leaves, about 70% as long, standing up from the centre, simply toothed "
            "and only shallowly lobed, plus the two small oval seed leaves at the base; it is about 8% of the sheet's width."),
    "s02": ("ten days", "A seedling: two small smooth oval seed leaves (cotyledons) on a short pale stalk, and between them the first "
            "two tiny true leaves, toothed, just opening; the whole seedling about 5% of the sheet's height."),
    "s01": ("a week", "A seedling only just come up: a short pale curved stalk with two small smooth oval seed leaves (cotyledons) "
            "just unfolding, a tiny point of the first true leaf between them; the whole seedling about 3% of the sheet's height, "
            "standing on the top of the mound."),
}
FWD = {
    "s13": ("ten days", "The main bud at the top of the stem is a little larger and fuller, and its bracts have begun to loosen: "
            "the upper bracts spread very slightly apart at their tips, showing more violet-purple at their edges. The side bud is a "
            "little larger. Nothing else changes."),
    "s14": ("a week", "The main bud is opening: its bracts spread outward like the petals of an opening cone, and from the centre at "
            "the top a small tuft of fine violet-purple florets has emerged. The side bud's bracts have loosened slightly. "
            "Nothing else changes."),
    "s15": ("a week", "The main flower is opening: a dome of countless fine, thread-like violet-blue florets fans upward and outward "
            "from the open cup of bracts, about as tall as the bud itself; the bracts beneath are spread and slightly turned back. "
            "The side bud is beginning to open with a few violet tips. Nothing else changes."),
    "s16": ("a week", "The main flower is in full bloom: a large, shaggy thistle head, a broad brush of countless fine thread-like "
            "vivid violet-purple florets spreading upward and outward, wider than the old bud, over a cup of green bracts turned "
            "back beneath it; drawn with the finest engraved line and a clear luminous violet wash. The side bud has opened into a "
            "small violet tuft. The rosette of leaves stays the same. Nothing else changes."),
}
ORDER = ["s00", "s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08", "s09", "s10", "s11", "s12", "s13", "s14", "s15", "s16"]


def build(s):
    if s in BACK:
        w, d = BACK[s]
        nb = ORDER[ORDER.index(s) + 1]
        head = (f"Image 1 is a plate from a series of botanical plates showing one globe artichoke plant (Cynara cardunculus var. "
                f"scolymus) growing. Make the plate that comes just BEFORE it: the same plant about {w} EARLIER, so younger and "
                f"smaller. Change ONLY the plant, as follows. {d}")
        how = "smaller and younger"
    else:
        w, d = FWD[s]
        nb = ORDER[ORDER.index(s) - 1]
        head = (f"Image 1 is a plate from a series of botanical plates showing one globe artichoke plant (Cynara cardunculus var. "
                f"scolymus) growing and flowering. Make the plate that comes just AFTER it: the same plant about {w} LATER. "
                f"Change ONLY the flower bud, as follows. {d}")
        how = "unchanged"
    style = open(os.path.join(P, "_style.txt")).read().strip()
    txt = head + "\n\n" + KEEP.format(how=how) + "\n\n" + style + "\n"
    open(os.path.join(P, s + ".full.txt"), "w").write(txt)
    return nb


if __name__ == "__main__":
    for s in sys.argv[1:]:
        print(s, "from", build(s))
