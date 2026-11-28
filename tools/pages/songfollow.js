/* Song follow: plays the song in a sticky bar and walks the page with it (no dependencies).
 *
 *   SongFollow.init({ audio: '../../inputs/Proof%20(-2sm).mp3', cards: '.card', timeLabel: '.t' })
 *
 * Cards: elements matching `cards` that carry data-t (seconds or m:ss.s, or a range "a-b") and optional data-t-end.
 * While playing with Follow on, the current card is scrolled to and marked (.sf-current); cards already passed are
 * dimmed a little (.sf-past); a card whose range still covers the playhead is .sf-live. Cards without data-t are never
 * marked (groupUntimed: true moves them into an "Untimed" group at the end of their container).
 * Follow stops when the reader scrolls, uses the nav or clicks a link (by default the music keeps playing; the "If I
 * scroll" setting can make it pause instead). "Play from here" starts at the first timed card in view; clicking a
 * card's time label plays from that card. Space toggles play/pause (except while typing). Song sections and lyric
 * lines come from window.SONG_M2SM (tools/pages/song_m2sm.js). Preferences (speed, scroll behaviour) are kept in
 * localStorage under 'songfollow-prefs'; nothing else on the page is touched.
 */
(function () {
  'use strict';
  const SF = {};
  const PREF_KEY = 'songfollow-prefs';
  let o, audio, bar, els = {}, items = [], song, dur = 0;
  let follow = true, curKey = null, raf = 0, dragging = false;
  let prefs = { rate: 1, onScroll: 'unfollow' };

  const fmt = (s) => { if (!isFinite(s) || s < 0) s = 0; const m = Math.floor(s / 60), x = s - m * 60; return m + ':' + (x < 10 ? '0' : '') + x.toFixed(1); };
  function parseT(v) {
    if (v == null) return null; v = String(v).trim(); if (!v) return null;
    let m = v.match(/^~?(\d+):(\d+(?:\.\d+)?)/); if (m) return +m[1] * 60 + +m[2];
    m = v.match(/^(\d+(?:\.\d+)?)/); return m ? +m[1] : null;
  }
  function parseEnd(v) {
    const m = String(v || '').match(/[-–]\s*~?((?:\d+:)?\d+(?:\.\d+)?)\s*$/) || String(v || '').match(/^[^-–]+[-–]\s*~?((?:\d+:)?\d+(?:\.\d+)?)/);
    return m ? parseT(m[1]) : null;
  }
  const esc = (x) => String(x == null ? '' : x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const now = () => (audio ? audio.currentTime : 0);
  const visible = (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);

  function loadPrefs() { try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { /* ignore */ } }
  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } }

  /* ---------------------------------------------------------------- cards */
  function scan() {
    const all = Array.from(document.querySelectorAll(o.cards));
    items = [];
    all.forEach((c, i) => {
      const t = parseT(c.dataset.t);
      c.classList.remove('sf-current', 'sf-past', 'sf-live');
      if (t == null) { c.classList.add('sf-untimed'); return; }
      c.classList.add('sf-timed'); c.classList.remove('sf-untimed');
      let end = c.dataset.tEnd != null ? parseT(c.dataset.tEnd) : parseEnd(c.dataset.t);
      if (end != null && end <= t) end = null;
      let lab = o.timeLabel ? c.querySelector(o.timeLabel) : null;
      if (!lab) { lab = el('button', 'sf-chip', '&#9654; ' + fmt(t)); lab.type = 'button'; c.insertBefore(lab, c.firstChild); }
      lab.classList.add('sf-seek'); lab.title = 'Play the song from here (' + fmt(t) + ')'; lab.dataset.sfSeek = t;
      items.push({ el: c, t, end, i });
    });
    items.sort((a, b) => a.t - b.t || a.i - b.i);
    if (o.groupUntimed) groupUntimed(all);
    drawTicks(); curKey = null; update(true);
  }
  function groupUntimed(all) {
    const un = all.filter((c) => c.classList.contains('sf-untimed'));
    if (!un.length || !items.length) return;
    const parent = items[items.length - 1].el.parentNode;
    let box = parent.querySelector(':scope > .sf-untimed-group');
    if (!box) { box = el('section', 'sf-untimed-group', '<h2>Untimed <small>no song time: never highlighted</small></h2>'); parent.appendChild(box); }
    un.forEach((c) => box.appendChild(c));
  }
  function currentIdx(t) {
    let k = -1;
    for (let j = 0; j < items.length; j++) { if (items[j].t <= t + 0.05) { if (visible(items[j].el)) k = j; } else break; }
    return k;
  }
  function update(force) {
    const t = now(), k = currentIdx(t), ct = k >= 0 ? items[k].t : -1;
    const key = k >= 0 ? ct : null;
    for (const it of items) {
      const cur = k >= 0 && it.t === ct;
      const live = !cur && it.t < ct && it.end != null && it.end > t + 0.05;
      it.el.classList.toggle('sf-current', cur);
      it.el.classList.toggle('sf-live', live);
      it.el.classList.toggle('sf-past', !cur && !live && it.t < ct + 1e-6 && (k >= 0));
    }
    if (key !== curKey || force) {
      const changed = key !== curKey; curKey = key;
      if (follow && k >= 0 && (changed || force) && (!audio.paused || force === 'jump')) scrollToItem(firstOfGroup(k));
    }
  }
  function firstOfGroup(k) { let j = k; while (j > 0 && items[j - 1].t === items[k].t) j--; while (j < k && !visible(items[j].el)) j++; return items[j]; }
  function topOffset() {
    if (typeof o.topOffset === 'number') return o.topOffset;
    let h = 0;
    for (const e of document.querySelectorAll('header, .sf-sticky')) { const cs = getComputedStyle(e); if (cs.position === 'sticky' || cs.position === 'fixed') { const r = e.getBoundingClientRect(); if (r.top <= 1) h = Math.max(h, r.bottom); } }
    return h + 12;
  }
  // Scroll so the card's top sits under the sticky header. Far jumps are instant, near ones smooth. Lazy images load
  // as the page moves and shift everything below them, so the position is re-checked for a few seconds and corrected
  // (only while Follow is on and the target is still the current card).
  let target = null, settleTimer = 0, settleUntil = 0;
  function scrollToItem(it) {
    if (!it) return;
    target = it; settleUntil = performance.now() + 4000;
    nudge(true);
    clearInterval(settleTimer);
    settleTimer = setInterval(() => {
      if (!follow || target !== it || performance.now() > settleUntil) { clearInterval(settleTimer); return; }
      nudge(false);
    }, 300);
  }
  function nudge(first) {
    const d = target.el.getBoundingClientRect().top - topOffset();
    if (!first && Math.abs(d) < 24) return;
    const far = Math.abs(d) > 2.5 * window.innerHeight;
    window.scrollTo({ top: Math.max(0, window.scrollY + d), behavior: o.smooth === false || far ? 'auto' : 'smooth' });
  }
  function itemInView() {
    // the card under a reading line 30% down the free part of the window, else the first card below it
    const top = topOffset(), vh = window.innerHeight - (bar ? bar.offsetHeight : 0), line = top + 0.3 * (vh - top);
    let below = null;
    for (const it of items) {
      if (!visible(it.el)) continue;
      const r = it.el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) return firstOfGroup(items.indexOf(it));
      if (r.top > line && r.top < vh && (!below || r.top < below.r.top)) below = { it, r };
    }
    return below ? below.it : null;
  }

  /* ---------------------------------------------------------------- playback */
  function play() {
    const p = audio.play();
    if (p && p.catch) p.catch((e) => showMsg('Could not play the song: ' + (e && e.message ? e.message : e)));
  }
  function toggle() { if (audio.paused) play(); else audio.pause(); }
  function seek(t, andPlay) {
    t = Math.max(0, Math.min(t, (dur || 1e9) - 0.05));
    audio.currentTime = t; setFollow(true, false); curKey = undefined; update('jump'); paint();
    if (andPlay) play();
  }
  function setFollow(v, jump) {
    follow = v; els.follow.classList.toggle('on', v); els.follow.setAttribute('aria-pressed', v);
    els.follow.textContent = v ? 'Following' : 'Follow';
    els.follow.title = v ? 'The page follows the song (scroll to stop)' : 'Jump back to the song and follow it again';
    if (v && jump) { curKey = undefined; update('jump'); }
  }
  function manual() {
    target = null;  // the reader takes over: stop correcting the scroll
    if (audio.paused || !follow) return;
    if (prefs.onScroll === 'pause') audio.pause();
    setFollow(false);
  }

  /* ---------------------------------------------------------------- bar */
  function build() {
    bar = el('div', 'sf-bar'); bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Song player');
    bar.innerHTML =
      '<div class="sf-row">' +
      '<button type="button" class="sf-play" title="Play / pause (space)" aria-label="Play">&#9654;</button>' +
      '<span class="sf-time"><b>0:00.0</b> / <span class="sf-dur">' + fmt(dur) + '</span></span>' +
      '<span class="sf-sec"></span>' +
      '<span class="sf-lyric"></span>' +
      '<span class="sf-ctl">' +
      '<button type="button" class="sf-follow on" aria-pressed="true">Following</button>' +
      '<button type="button" class="sf-here" title="Play from the first timed card in view">Play from here</button>' +
      '<label title="Playback speed">Speed <select class="sf-rate"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option></select></label>' +
      '<label title="What a manual scroll does while the song plays">If I scroll <select class="sf-onscroll"><option value="unfollow">stop following</option><option value="pause">pause</option></select></label>' +
      '</span></div>' +
      '<div class="sf-line" title="Click or drag to seek"><div class="sf-secs"></div><div class="sf-ticks"></div><div class="sf-done"></div><div class="sf-head"></div><div class="sf-tip"></div></div>' +
      '<div class="sf-msg"></div>';
    document.body.appendChild(bar);
    document.body.classList.add('sf-on');
    for (const k of ['play', 'time', 'dur', 'sec', 'lyric', 'follow', 'here', 'rate', 'onscroll', 'line', 'secs', 'ticks', 'done', 'head', 'tip', 'msg'])
      els[k] = bar.querySelector('.sf-' + k);
    els.now = els.time.querySelector('b');
    els.rate.value = String(prefs.rate); els.onscroll.value = prefs.onScroll;
    drawSections();

    els.play.addEventListener('click', () => { toggle(); els.play.blur(); });
    els.follow.addEventListener('click', () => setFollow(!follow, true));
    els.here.addEventListener('click', () => { const it = itemInView(); if (it) seek(it.t, true); else play(); });
    els.rate.addEventListener('change', () => { prefs.rate = +els.rate.value; audio.playbackRate = prefs.rate; savePrefs(); });
    els.onscroll.addEventListener('change', () => { prefs.onScroll = els.onscroll.value; savePrefs(); });
    const at = (e) => { const r = els.line.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur; };
    els.line.addEventListener('pointerdown', (e) => { dragging = true; els.line.setPointerCapture(e.pointerId); audio.currentTime = at(e); paint(); });
    els.line.addEventListener('pointermove', (e) => {
      const t = at(e), s = sectionAt(t);
      els.tip.textContent = fmt(t) + (s ? ' · ' + s.short : ''); els.tip.style.left = (100 * t / dur) + '%'; els.tip.style.display = 'block';
      if (dragging) { audio.currentTime = t; paint(); }
    });
    els.line.addEventListener('pointerleave', () => { els.tip.style.display = 'none'; });
    els.line.addEventListener('pointerup', (e) => { if (!dragging) return; dragging = false; seek(at(e), false); });
  }
  function drawSections() {
    const S = song.sections || []; let h = '';
    S.forEach((s, i) => {
      const end = Math.min(s.end, S[i + 1] ? S[i + 1].t : dur);
      h += '<div class="sf-s sf-k-' + s.kind + '" style="left:' + (100 * s.t / dur) + '%;width:' + (100 * (end - s.t) / dur) + '%" title="' + s.name + ' ' + fmt(s.t) + '-' + fmt(s.end) + '"><span>' + s.short + '</span></div>';
    });
    els.secs.innerHTML = h;
  }
  function drawTicks() {
    if (!els.ticks) return;
    els.ticks.innerHTML = items.map((it) => '<i style="left:' + (100 * it.t / dur) + '%"></i>').join('');
  }
  function sectionAt(t) { let s = null; for (const x of song.sections || []) if (x.t <= t + 1e-6) s = x; return s; }
  function lyricAt(t) { for (const l of song.lyrics || []) if (l.t <= t + 0.05 && t < l.end + 0.6) return l; return null; }
  let lastSec = null, lastLyric = undefined;
  function paint() {
    const t = now();
    els.now.textContent = fmt(t);
    const f = dur ? Math.min(1, t / dur) : 0;
    els.head.style.left = (100 * f) + '%'; els.done.style.width = (100 * f) + '%';
    const s = sectionAt(t); if (s !== lastSec) { lastSec = s; els.sec.textContent = s ? s.short : ''; }
    const l = lyricAt(t); if (l !== lastLyric) { lastLyric = l; els.lyric.textContent = l ? '“' + l.text + '”' : ''; els.lyric.classList.toggle('sf-none', !l); }
  }
  function loop() { paint(); update(false); raf = audio.paused ? 0 : requestAnimationFrame(loop); }
  function showMsg(m) { els.msg.textContent = m; els.msg.style.display = m ? 'block' : 'none'; }

  /* ---------------------------------------------------------------- events */
  function wire() {
    audio.addEventListener('play', () => { els.play.innerHTML = '&#10074;&#10074;'; els.play.setAttribute('aria-label', 'Pause'); bar.classList.add('sf-playing'); showMsg(''); if (follow) { curKey = undefined; update('jump'); } if (!raf) raf = requestAnimationFrame(loop); });
    audio.addEventListener('pause', () => { els.play.innerHTML = '&#9654;'; els.play.setAttribute('aria-label', 'Play'); bar.classList.remove('sf-playing'); paint(); });
    audio.addEventListener('seeked', () => { paint(); update(false); });
    audio.addEventListener('ended', () => { paint(); });
    audio.addEventListener('loadedmetadata', () => { if (isFinite(audio.duration) && Math.abs(audio.duration - dur) > 0.5) { dur = audio.duration; els.dur.textContent = fmt(dur); drawSections(); drawTicks(); } audio.playbackRate = prefs.rate; });
    audio.addEventListener('error', () => showMsg('The song did not load from ' + decodeURI(o.audio) + ' (the page expects the repo layout: inputs/Proof (-2sm).mp3).'));
    document.addEventListener('keydown', (e) => {
      const tg = e.target, tag = (tg && tg.tagName) || '';
      const typing = tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !/^(radio|checkbox|button|submit|range)$/i.test(tg.type)) || (tg && tg.isContentEditable);
      if ((e.code === 'Space' || e.key === ' ') && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); toggle(); return; }
      if (!typing && /^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End)$/.test(e.key)) manual();
    }, true);
    document.addEventListener('keyup', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if ((e.code === 'Space' || e.key === ' ') && tag === 'BUTTON') e.preventDefault();
    }, true);
    window.addEventListener('wheel', manual, { passive: true });
    document.addEventListener('focusin', (e) => {   // typing a note: keep the page where it is
      const tg = e.target, tag = tg.tagName;
      if (tag === 'TEXTAREA' || (tag === 'INPUT' && !/^(radio|checkbox|button|submit|range)$/i.test(tg.type))) manual();
    });
    window.addEventListener('touchmove', manual, { passive: true });
    document.addEventListener('mousedown', (e) => { if (e.clientX >= document.documentElement.clientWidth) manual(); });  // the scrollbar
    document.addEventListener('click', (e) => {
      const s = e.target.closest && e.target.closest('[data-sf-seek]');
      if (s) { e.preventDefault(); e.stopPropagation(); seek(+s.dataset.sfSeek, true); return; }
      const a = e.target.closest && e.target.closest('a[href]');
      if (a && !bar.contains(a)) manual();
    }, true);
    window.addEventListener('resize', () => { if (follow && !audio.paused) { curKey = undefined; update('jump'); } });
  }

  SF.init = function (opts) {
    o = Object.assign({ cards: '.card', timeLabel: '.t', groupUntimed: false, topOffset: 'auto', smooth: true }, opts || {});
    song = window.SONG_M2SM || { duration: 268.4, sections: [], lyrics: [] };
    dur = song.duration || 268.4;
    loadPrefs();
    audio = new Audio(); audio.preload = 'metadata'; audio.src = o.audio; audio.playbackRate = prefs.rate;
    const start = () => { build(); wire(); scan(); paint(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
    SF.audio = audio;
    return SF;
  };
  SF.refresh = () => scan();          // call after the page re-renders its cards
  SF.seek = (t, p) => seek(parseT(t), p);
  SF.parseT = parseT;
  SF.state = () => ({ t: now(), playing: !audio.paused, follow, current: items.filter((i) => i.el.classList.contains('sf-current')).map((i) => i.el.id) });
  window.SongFollow = SF;
})();
