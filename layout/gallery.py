#!/usr/bin/env python3
"""Build media/layout/index.html: a browsable gallery of every set's renders.

    python3 layout/gallery.py        (from the repo root; re-run after re-rendering)

Shots are found from the <SHOT>.json sidecars in media/layout/<set>/. Image paths are relative,
so the page opens straight from disk.
"""
import html, json, os, re, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, 'media', 'layout')
ORDER = ['attic88_day', 'shanghai86', 'office91', 'wall88', 'market93', 'basement90', 'kitchen90',
         'mv10', 'mortongrove07', 'closet02', 'playground23']
TITLES = {
    'attic88_day': 'Attic, Netherlands, winter 1988', 'shanghai86': 'Shanghai, 1986',
    'office91': 'School office, about 1991', 'wall88': 'Inside the wall, 1988',
    'market93': 'Marketplace on Oakton, Skokie, 1993', 'basement90': 'Basement, Decatur, 1990',
    'kitchen90': 'Kitchen, Decatur, 1990 and the outro', 'mv10': 'Housewarming, Mountain View, 2010',
    'mortongrove07': 'Living room, Morton Grove, about 2007 (the sweatshirt)',
    'closet02': 'Closet, about 2002', 'playground23': 'Playground, Austin, 2023',
}
MODES = ['line', 'label', 'flat', 'lit', 'depth', 'beam']


def text(v):
    if v is None:
        return ''
    if isinstance(v, (list, tuple)):
        return ' / '.join(text(x) for x in v)
    if isinstance(v, dict):
        return ''
    return str(v)


def natural(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', s)]


def load_set(name):
    d = os.path.join(ROOT, name)
    files = set(os.listdir(d))
    shots = []
    for f in sorted(files, key=natural):
        if not f.endswith('.json') or f.startswith('beam_'):
            continue
        sid = f[:-5]
        try:
            side = json.load(open(os.path.join(d, f)))
        except Exception:
            side = {}
        imgs = {m: f'{name}/{sid}_{m}.png' for m in MODES[:-1] if f'{sid}_{m}.png' in files}
        masks = {}
        for g in sorted(files):
            m = re.fullmatch(re.escape(f'beam_{sid}') + r'(?:__(\w+?))?_flat\.png', g)
            if m:
                masks[m.group(1) or 'volume'] = f'{name}/{g}'
        if 'volume' in masks:
            imgs['beam'] = masks['volume']
        elif masks:
            imgs['beam'] = next(iter(masks.values()))
        if not imgs:
            continue
        shots.append({
            'id': sid, 'imgs': imgs, 'masks': masks,
            'time': text(side.get('plan_time') or side.get('time')),
            'pos': text(side.get('position')),
            'intent': text(side.get('intent') or side.get('desc') or side.get('header')),
            'warn': [text(w) for w in (side.get('warnings') or [])],
        })
    sheets = {}
    sd = os.path.join(ROOT, '_sheets')
    for m in ['label', 'line', 'flat', 'lit', 'beam']:
        if os.path.exists(os.path.join(sd, f'{name}_{m}.jpg')):
            sheets[m] = f'_sheets/{name}_{m}.jpg'
    return {'name': name, 'title': TITLES.get(name, name), 'shots': shots, 'sheets': sheets}


def main():
    names = [n for n in ORDER if os.path.isdir(os.path.join(ROOT, n))]
    names += sorted(n for n in os.listdir(ROOT)
                    if os.path.isdir(os.path.join(ROOT, n)) and n not in names and not n.startswith('_')
                    and n != 'attic88')
    sets = [s for s in (load_set(n) for n in names) if s['shots']]
    data = json.dumps(sets).replace('</', '<\\/')
    out = PAGE.replace('/*DATA*/', data)
    path = os.path.join(ROOT, 'index.html')
    open(path, 'w').write(out)
    print(path, f'({len(sets)} sets, {sum(len(s["shots"]) for s in sets)} shots)')


PAGE = r'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Proof — set blockouts</title>
<style>
:root { --bg:#f4f1ea; --panel:#fffdf8; --ink:#22201c; --dim:#716b60; --rule:#d9d3c5; --accent:#9a6a12; --chip:#ebe6da; }
@media (prefers-color-scheme: dark) {
  :root { --bg:#191816; --panel:#22211e; --ink:#ece8df; --dim:#a39d90; --rule:#3a3833; --accent:#d9a441; --chip:#2e2c28; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.45 system-ui, sans-serif; }
header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--rule); padding:10px 20px; }
header h1 { font-size:17px; margin:0 0 8px; font-weight:600; }
.bar { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.bar + .bar { margin-top:6px; }
.bar span.lab { color:var(--dim); font-size:12px; text-transform:uppercase; letter-spacing:.06em; margin-right:4px; }
button { font:inherit; font-size:13px; color:var(--ink); background:var(--chip); border:1px solid transparent; border-radius:6px; padding:4px 10px; cursor:pointer; }
button:hover { border-color:var(--rule); }
button[aria-pressed=true] { background:var(--accent); color:#fff; }
button:focus-visible, .card:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
main { padding:20px; max-width:1800px; margin:0 auto; }
section { margin-bottom:44px; scroll-margin-top:110px; }
section h2 { font-size:20px; margin:0; font-weight:600; }
section .sub { color:var(--dim); font-size:13px; margin:2px 0 12px; }
section .sub a { color:var(--accent); margin-right:10px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:14px; }
body.big .grid { grid-template-columns:repeat(auto-fill, minmax(620px, 1fr)); }
.card { background:var(--panel); border:1px solid var(--rule); border-radius:8px; overflow:hidden; cursor:zoom-in; }
.card .frame { aspect-ratio:16/9; background:#fff; display:flex; align-items:center; justify-content:center; }
.card img { width:100%; height:100%; object-fit:contain; display:block; }
.card .none { color:#888; font-size:13px; }
.card .cap { padding:8px 10px 10px; }
.card .id { font-weight:600; font-variant-numeric:tabular-nums; }
.card .meta { color:var(--dim); font-size:12px; margin-left:6px; }
.card p { margin:4px 0 0; font-size:13px; color:var(--dim); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
dialog { border:none; padding:0; background:#111; color:#eee; width:100vw; height:100vh; max-width:100vw; max-height:100vh; }
dialog::backdrop { background:#000; }
.lb { display:grid; grid-template-rows:auto 1fr auto; height:100%; }
.lb .top { display:flex; flex-wrap:wrap; gap:6px; align-items:center; padding:8px 12px; }
.lb .top .t { font-weight:600; margin-right:10px; }
.lb .top button { background:#2a2a2a; color:#eee; }
.lb .top button[aria-pressed=true] { background:var(--accent); color:#fff; }
.lb .top .sp { flex:1; }
.lb .stage { min-height:0; display:flex; align-items:center; justify-content:center; }
.lb .stage img { max-width:100%; max-height:100%; background:#fff; }
.lb .txt { padding:8px 14px 12px; font-size:13px; color:#cfcabd; max-height:22vh; overflow:auto; }
.lb .txt .w { color:#e8a25a; }
</style></head><body>
<header>
  <h1>Proof — set blockouts</h1>
  <div class="bar" id="sets"><span class="lab">Set</span></div>
  <div class="bar" id="modes"><span class="lab">Render</span></div>
</header>
<main id="main"></main>
<dialog id="dlg"><div class="lb">
  <div class="top"><span class="t" id="lt"></span><span id="lm"></span><span class="sp"></span>
    <button id="prev">&larr; Prev</button><button id="next">Next &rarr;</button><button id="close">Close (Esc)</button></div>
  <div class="stage"><img id="li" alt=""></div>
  <div class="txt" id="lx"></div>
</div></dialog>
<script>
const SETS = /*DATA*/;
const MODES = ['line','label','flat','lit','depth','beam'];
const NAMES = {line:'Line', label:'Label', flat:'Flat', lit:'Lit', depth:'Depth', beam:'Beam mask'};
let mode = 'label';
const $ = (t, a = {}, ...kids) => { const e = document.createElement(t); for (const k in a) k === 'text' ? e.textContent = a[k] : e.setAttribute(k, a[k]); e.append(...kids); return e; };
const main = document.getElementById('main'), flat = [];

for (const s of SETS) {
  const b = $('button', { text: s.name });
  b.onclick = () => document.getElementById(s.name).scrollIntoView({ behavior: 'smooth' });
  document.getElementById('sets').append(b);
  const sub = $('div', { class: 'sub' }, $('span', { text: s.name + ' · ' + s.shots.length + ' cameras · contact sheets: ' }));
  for (const m in s.sheets) sub.append($('a', { href: s.sheets[m], target: '_blank', text: m }));
  const grid = $('div', { class: 'grid' });
  for (const sh of s.shots) {
    const i = flat.length; flat.push({ set: s, shot: sh });
    const card = $('div', { class: 'card', tabindex: '0', role: 'button', 'aria-label': s.name + ' ' + sh.id },
      $('div', { class: 'frame' }),
      $('div', { class: 'cap' },
        $('span', { class: 'id', text: sh.id }),
        $('span', { class: 'meta', text: [sh.time, sh.pos].filter(Boolean).join(' · ') }),
        $('p', { text: sh.intent })));
    card.onclick = () => open(i);
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } };
    sh.frame = card.firstChild;
    grid.append(card);
  }
  main.append($('section', { id: s.name }, $('h2', { text: s.title }), sub, grid));
}

function paint() {
  for (const { shot } of flat) {
    const src = shot.imgs[mode];
    shot.frame.replaceChildren(src ? $('img', { src, loading: 'lazy', alt: shot.id + ' ' + mode })
                                   : $('span', { class: 'none', text: 'no ' + NAMES[mode].toLowerCase() + ' render' }));
  }
  for (const b of document.querySelectorAll('#modes button[data-m]')) b.setAttribute('aria-pressed', b.dataset.m === mode);
}
for (const m of MODES) {
  const b = $('button', { 'data-m': m, text: NAMES[m] });
  b.onclick = () => { mode = m; paint(); };
  document.getElementById('modes').append(b);
}
const big = $('button', { text: 'Larger tiles', 'aria-pressed': 'false' });
big.onclick = () => big.setAttribute('aria-pressed', document.body.classList.toggle('big'));
document.getElementById('modes').append(big);
paint();

const dlg = document.getElementById('dlg'); let cur = 0, lmode = null;
function show() {
  const { set, shot } = flat[cur];
  const opts = Object.keys(shot.imgs).filter(m => m !== 'beam').map(m => [NAMES[m], shot.imgs[m]]);
  for (const k in shot.masks) opts.push(['Mask: ' + k, shot.masks[k]]);
  let pick = opts.find(o => o[0] === lmode) || opts.find(o => o[1] === shot.imgs[mode]) || opts[0];
  document.getElementById('lt').textContent = set.name + ' · ' + shot.id;
  const lm = document.getElementById('lm'); lm.replaceChildren();
  for (const o of opts) {
    const b = $('button', { text: o[0], 'aria-pressed': o === pick });
    b.onclick = () => { lmode = o[0]; show(); };
    lm.append(b);
  }
  document.getElementById('li').src = pick[1];
  document.getElementById('li').alt = shot.id + ' ' + pick[0];
  const lx = document.getElementById('lx');
  lx.replaceChildren($('div', { text: [shot.time, shot.pos].filter(Boolean).join(' · ') }), $('div', { text: shot.intent }));
  for (const w of shot.warn) lx.append($('div', { class: 'w', text: '! ' + w }));
}
function open(i) { cur = i; lmode = null; show(); dlg.showModal(); }
function step(d) { cur = (cur + d + flat.length) % flat.length; show(); }
document.getElementById('prev').onclick = () => step(-1);
document.getElementById('next').onclick = () => step(1);
document.getElementById('close').onclick = () => dlg.close();
dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
</script></body></html>
'''

if __name__ == '__main__':
    sys.exit(main())
