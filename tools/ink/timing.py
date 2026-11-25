"""tools.ink.timing: a tiny, forgiving loader for analysis/timing.json (the song clock).

    tm = Timing.load()                         # analysis/timing.json, or the synthetic stub if it does not exist yet
    tm.hits('gong', 60.0, 75.0)                # [{'t':..., 'kind':..., 'strength':...}, ...]
    tm.beat_phase(t)                           # 0..1 position inside the current beat
    tm.nearest_beat(t)                         # time of the nearest beat
    tm.word('He bowed four ways', 'four')      # (start, end) of a word in a line (line text matched loosely)
    tm.section('Hook')                         # (start, end)

It accepts the halys-video schema (beats/downbeats as [{t, bar, beat}], lyrics [{line, text, words: [{w, start,
end}]}], events [{kind, t, strength}], sections [{name, start, end}]) and plain variants (lists of floats; 'hits' or
'events'; 'lines' or 'lyrics'; word key 'w', 'word' or 'text').
"""
import bisect
import json
import re
from pathlib import Path

from .core import ROOT, rng

DEFAULT = ROOT / 'analysis' / 'timing.json'
STUB = ROOT / 'work' / 'ink_demo' / 'timing_stub.json'


def _t(x):
    if isinstance(x, (int, float)):
        return float(x)
    for k in ('t', 'time', 'start'):
        if k in x:
            return float(x[k])
    raise KeyError(f'no time in {x}')


def _norm(s):
    return re.sub(r'[^\w]+', ' ', s.lower(), flags=re.UNICODE).strip()


class Timing:
    def __init__(self, data, path=None):
        self.data, self.path = data, path
        self.beats = sorted(_t(b) for b in data.get('beats', []))
        self.downbeats = sorted(_t(b) for b in data.get('downbeats', []))
        self.sections = data.get('sections', [])
        self.lines = data.get('lyrics', data.get('lines', []))
        ev = list(data.get('hits', data.get('events', [])))
        # span events (real map: hit_events.{chops, suona_phrases, silences, risers, sub_drops, ...}) become hits too,
        # kind = the singular list name ('chop', 'suona_phrase', 'silence', 'riser', 'sub_drop'), t = start
        self.spans = data.get('hit_events', {}) if isinstance(data.get('hit_events'), dict) else {}
        for name, lst in self.spans.items():
            kind = name[:-1] if name.endswith('s') else name
            for e in lst or []:
                if isinstance(e, dict) and ('t' in e or 'start' in e):
                    ev.append({**e, 't': e.get('t', e.get('start')), 'kind': kind, 'detail': e.get('cls', e.get('kind'))})

        def kind_of(e):
            for k in ('kind', 'cls', 'class', 'type'):
                if isinstance(e.get(k), str):
                    return e[k]
            return 'hit'
        self._hits = sorted(({**{k: v for k, v in e.items() if k not in ('t', 'kind', 'strength')}, 't': _t(e),
                              'kind': kind_of(e), 'strength': float(e.get('strength', 1.0))} for e in ev),
                            key=lambda e: e['t'])
        en = data.get('energy') or data.get('loudness') or {}
        self._energy = None
        if isinstance(en, dict):
            vals = en.get('values') or en.get('rms') or en.get('rms_dbfs') or en.get('rms_db')
            db = not en.get('values') and not en.get('rms')
            if isinstance(vals, dict):                              # per-stem: use the mix
                vals = vals.get('mix') or next(iter(vals.values()))
            if vals:
                v = [10 ** (x / 20.0) for x in vals] if db else list(vals)
                mx = max(v) or 1.0
                ts = en.get('t')
                rate = float(en.get('rate_hz', en.get('rate', 0)) or (1.0 / en['hop_s'] if en.get('hop_s') else 10))
                self._energy = (rate, float(ts[0]) if ts else float(en.get('t0', 0.0)), [x / mx for x in v])
        elif isinstance(en, list) and en:
            ts = [_t(e) for e in en]
            v = [float(e.get('v', e.get('value', 0))) for e in en]
            mx = max(v) or 1.0
            rate = (len(ts) - 1) / max(ts[-1] - ts[0], 1e-6)
            self._energy = (rate, ts[0], [x / mx for x in v])
        self.duration = float((data.get('source') or data.get('meta') or {}).get('duration', data.get('duration', 0)) or
                              (self.beats[-1] if self.beats else 0))

    @classmethod
    def load(cls, path=None):
        """Load timing.json; if it is missing, fall back to the synthetic stub (creating it if needed)."""
        p = Path(path) if path else DEFAULT
        if not p.exists():
            p = STUB
            if not p.exists():
                write_stub(p)
        return cls(json.loads(p.read_text()), p)

    @classmethod
    def stub(cls):
        """The synthetic stub map (work/ink_demo/timing_stub.json), whatever exists in analysis/."""
        if not STUB.exists():
            write_stub(STUB)
        return cls(json.loads(STUB.read_text()), STUB)

    def kinds(self):
        """The hit kinds present in this map, with counts."""
        out = {}
        for e in self._hits:
            out[e['kind']] = out.get(e['kind'], 0) + 1
        return out

    @property
    def is_stub(self):
        return self.path is not None and Path(self.path) == STUB

    # -- hits ----------------------------------------------------------------------------------------------------------
    def hits(self, kind=None, t0=None, t1=None, min_strength=0.0):
        """Hits of a kind (string, list of strings, or None for all; matched as a substring) in [t0, t1)."""
        kinds = None if kind is None else ([kind] if isinstance(kind, str) else list(kind))
        out = []
        for e in self._hits:
            if t0 is not None and e['t'] < t0:
                continue
            if t1 is not None and e['t'] >= t1:
                break
            if kinds and not any(k in e['kind'] for k in kinds):
                continue
            if e['strength'] < min_strength:
                continue
            out.append(e)
        return out

    def hit_times(self, kind=None, t0=None, t1=None, min_strength=0.0):
        return [e['t'] for e in self.hits(kind, t0, t1, min_strength)]

    def last_hit(self, t, kind=None, t0=None):
        """The most recent hit at or before t (or None)."""
        h = [e for e in self.hits(kind, t0, t + 1e-9)]
        return h[-1] if h else None

    def since_hit(self, t, kind=None, t0=None):
        """Seconds since the most recent hit of that kind (inf if none yet)."""
        h = self.last_hit(t, kind, t0)
        return t - h['t'] if h else float('inf')

    # -- beats ---------------------------------------------------------------------------------------------------------
    def _span(self, arr, t):
        i = bisect.bisect_right(arr, t) - 1
        if i < 0 or i >= len(arr) - 1:
            return None
        return i, arr[i], arr[i + 1]

    def beat_phase(self, t):
        """0..1 inside the current beat (0 on the beat). 0 outside the beat grid."""
        s = self._span(self.beats, t)
        return 0.0 if not s else (t - s[1]) / max(s[2] - s[1], 1e-9)

    def bar_phase(self, t):
        s = self._span(self.downbeats, t)
        return 0.0 if not s else (t - s[1]) / max(s[2] - s[1], 1e-9)

    def beat_index(self, t):
        """Index of the current beat (-1 before the first)."""
        return bisect.bisect_right(self.beats, t) - 1

    def nearest_beat(self, t):
        if not self.beats:
            return t
        i = bisect.bisect_left(self.beats, t)
        c = self.beats[max(0, i - 1):i + 1]
        return min(c, key=lambda b: abs(b - t))

    def beats_in(self, t0, t1, sub=1):
        """Beat times in [t0, t1); sub=2 adds the half-beats, 4 the quarters."""
        out = []
        for a, b in zip(self.beats, self.beats[1:]):
            for k in range(sub):
                x = a + (b - a) * k / sub
                if t0 <= x < t1:
                    out.append(x)
        return out

    def bpm(self, t):
        s = self._span(self.beats, t)
        return 60.0 / (s[2] - s[1]) if s else 0.0

    # -- words ---------------------------------------------------------------------------------------------------------
    def line(self, text):
        """The lyric line whose text contains `text` (loose match), or by integer line number."""
        if isinstance(text, int):
            for l in self.lines:
                if l.get('line') == text:
                    return l
            return self.lines[text]
        q = _norm(text)
        for l in self.lines:
            if q in _norm(l.get('text', '')):
                return l
        raise KeyError(f'no lyric line matching {text!r}')

    @staticmethod
    def _w(w):
        return w.get('w', w.get('word', w.get('text', '')))

    def words(self, line):
        """[(word, start, end), ...] for a line (text or number)."""
        l = self.line(line)
        return [(self._w(w), float(w['start']), float(w.get('end', w['start'] + 0.3))) for w in l.get('words', [])]

    def word(self, line, word, occurrence=1):
        """(start, end) of `word` in the line matching `line`."""
        q, k = _norm(word), 0
        for w, a, b in self.words(line):
            if _norm(w) == q:
                k += 1
                if k == occurrence:
                    return a, b
        raise KeyError(f'word {word!r} (#{occurrence}) not in line {line!r}')

    def section(self, name):
        """(start, end) of the section whose name contains `name`."""
        for s in self.sections:
            if name.lower() in s.get('name', '').lower():
                return float(s['start']), float(s['end'])
        raise KeyError(f'no section matching {name!r}')

    def section_at(self, t):
        for s in self.sections:
            if float(s['start']) <= t < float(s['end']):
                return s.get('name')
        return None

    def energy(self, t):
        """Relative loudness 0..1 at t (0 if the map has none)."""
        if not self._energy:
            return 0.0
        rate, t0, v = self._energy
        x = (t - t0) * rate
        i = int(x)
        if i < 0 or i >= len(v) - 1:
            return 0.0
        return v[i] + (v[i + 1] - v[i]) * (x - i)


def write_stub(path=STUB, duration=238.0, bpm=100.0, seed=7):
    """A synthetic timing map with the same shape as the real one will have, for building against."""
    r = rng(seed, 'stub')
    beat = 60.0 / bpm
    beats, downs = [], []
    t, i = 0.5, 0
    while t < duration:
        beats.append({'t': round(t, 4), 'bar': i // 4 + 1, 'beat': i % 4 + 1})
        if i % 4 == 0:
            downs.append({'t': round(t, 4), 'bar': i // 4 + 1})
        t += beat
        i += 1
    secs = [('Intro', 0, 14), ('Verse 1', 14, 43), ('Pre-chorus', 43, 52), ('Hook', 52, 72), ('Memory verse', 72, 96),
            ('Rap verse', 96, 120), ('Verse 3', 120, 144), ('Bridge', 144, 168), ('Build', 168, 182),
            ('Drop 2', 182, 212), ('Outro', 212, 232), ('End', 232, duration)]
    sections = [{'name': n, 'start': float(a), 'end': float(b)} for n, a, b in secs]
    hits = []
    for name, a, b in secs:
        if name in ('Hook', 'Drop 2'):
            for d in downs:
                if a <= d['t'] < b:
                    hits.append({'t': d['t'], 'kind': 'gong', 'strength': round(float(r.uniform(0.7, 1.0)), 2)})
                    hits.append({'t': round(d['t'] + 2 * beat, 4), 'kind': 'cymbal',
                                 'strength': round(float(r.uniform(0.5, 0.9)), 2)})
                    for k in (2.5, 3.0, 3.25, 3.5, 3.75):
                        if r.random() < 0.6:
                            hits.append({'t': round(d['t'] + k * beat, 4), 'kind': 'chop',
                                         'strength': round(float(r.uniform(0.3, 0.8)), 2)})
            for k in range(4):                                  # 四击头 at the top of the section
                hits.append({'t': round(a + 0.5 + k * beat, 4), 'kind': 'gong_strike', 'strength': 1.0})
        if name in ('Verse 1', 'Memory verse'):
            tt, gap = a + 1.0, 1.2
            while tt < b - 1:
                hits.append({'t': round(tt, 4), 'kind': 'clapper', 'strength': 0.5})
                tt += gap
                gap = max(0.2, gap * 0.93)
    hits.sort(key=lambda e: e['t'])
    lyr = [('Verse 1', 16.0, 'There was a stone on a mountain by the sea'),
           ('Hook', 53.0, 'He bowed four ways'),
           ('Hook', 58.0, '一窍通时百窍通'),
           ('Bridge', 146.0, 'The categories arrived before I did'),
           ('Bridge', 152.0, 'I am made of the telling')]
    lines = []
    for n, (sec, t0, text) in enumerate(lyr, 1):
        ws = list(text) if any(ord(c) > 0x2e80 for c in text) else text.split()
        words, tt = [], t0
        for w in ws:
            d = 0.28 + 0.06 * len(w)
            words.append({'w': w, 'start': round(tt, 3), 'end': round(tt + d * 0.85, 3)})
            tt += d
        lines.append({'line': n, 'section': sec, 'text': text, 'start': t0, 'end': round(tt, 3), 'words': words})
    en = []
    for k in range(int(duration * 10)):
        tt = k / 10.0
        name = next((n for n, a, b in secs if a <= tt < b), 'End')
        base = {'Hook': 0.9, 'Drop 2': 1.0, 'Rap verse': 0.7, 'Build': 0.6}.get(name, 0.3)
        en.append(round(base * (0.8 + 0.2 * float(r.random())), 3))
    data = {'_doc': 'SYNTHETIC STUB for tools/ink development. Not the song. Replace with analysis/timing.json.',
            'source': {'duration': duration}, 'beats': beats, 'downbeats': downs, 'sections': sections,
            'lyrics': lines, 'events': hits, 'energy': {'rate_hz': 10, 't0': 0.0, 'values': en}}
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=1))
    return path
