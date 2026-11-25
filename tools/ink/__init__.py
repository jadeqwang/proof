"""tools.ink: the Chaos Monkey compositing engine. Paper, ink, stone and light, rendered in code. See README.md."""
from .core import *          # noqa
from .paper import Paper, key_paper, key_dark, aged_ink, deckle_mask, ink_to_rgba, estimate_ground   # noqa
from .camera import Camera, Scene, mist_band, sample   # noqa
from .ink import wash, stroke, splash, splat_shape, bloom, dissolve, hairline, InkAnim, Bloom, Splash, spline  # noqa
from .timing import Timing   # noqa
from .ink import compose, brush_monkey   # noqa
from .stock import brush_mountain, brush_pine, test_plate   # noqa
from .seal import seal, strike, echoes, fade, Luogu, shake_offset, shaken, shake_args, seal_mask   # noqa
from .rubbing import rubbing, Rubbing, flip_on   # noqa
from .woodblock import separate, reprint, misregister, beat_key, block_offsets, papercut, torn   # noqa
from .margins import Margins, margins, step_rect, desaturate   # noqa
from .light import (neon, neon_field, neon_colour, flashlight, flashlight_field, cast_shadow, hand_shadow, dust,   # noqa
                    hand_monkey)
from .puppet import (Part, Puppet, leather, pose_at, cue_index, shadow_screen, lantern, lantern_strip,   # noqa
                     monkey_puppet, monkey_heads, POSES, run_cycle)
from .shot import Shot   # noqa
from .cliff import Cliff, rock_plate, silhouette_child, column_layout   # noqa
from .cliff import coverage as glyph_coverage   # noqa
from .text import Inscription, subtitle, subtitle_at   # noqa
from .video import Clip, Retime   # noqa
from .roto import redraw, track_point, StaffTrail   # noqa
