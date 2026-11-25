"""tools.ink.opts: render options a shot can read from ctx.opts (one switch per option, film-wide).

    ctx.opts['lyrics']   per-shot lyric text drawn inside the picture. Default OFF: the film's lyric layer is drawn
                         at assembly (tools/cut/lyrics.py). Turn on with env INK_LYRICS=1 or `--opt lyrics=on`.

Art inscriptions (carved/inscribed 一通百通, seals, the ledger, the cliff) are never behind this switch.
"""
import os

TRUE = {'1', 'on', 'true', 'yes', 'y'}
FALSE = {'0', 'off', 'false', 'no', 'n', ''}


def parse_value(v):
    """'on'/'off'/'1'/'0'/... -> bool, numbers -> int/float, anything else stays a string."""
    if isinstance(v, (bool, int, float)) or v is None:
        return v
    s = str(v).strip()
    if s.lower() in TRUE:
        return True
    if s.lower() in FALSE:
        return False
    for cast in (int, float):
        try:
            return cast(s)
        except ValueError:
            pass
    return s


def default_opts():
    """Options from the environment (INK_LYRICS; default off)."""
    return {'lyrics': parse_value(os.environ.get('INK_LYRICS', '0'))}


def parse_opts(pairs, base=None):
    """['key=value', ...] -> dict, on top of `base` (default: default_opts())."""
    o = dict(default_opts() if base is None else base)
    for p in pairs or []:
        if '=' not in p:
            raise ValueError(f'--opt needs key=value, got {p!r}')
        k, v = p.split('=', 1)
        o[k.strip()] = parse_value(v)
    return o


def opt(ctx, key, default=None):
    o = getattr(ctx, 'opts', None)
    if o is None:
        o = default_opts()
    return o.get(key, default)


def lyrics_on(ctx):
    """The one lyric switch every shot helper resolves to."""
    return bool(opt(ctx, 'lyrics', False))
