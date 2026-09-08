/* ── Read-along transcript ───────────────────────────────────────────────────
 * Transcript on the left, the two players on the right, words lighting up as
 * whichever one is playing moves through the clip.
 *
 * For the short clips the timings are ESTIMATED, not aligned. src/aligngen.py
 * places each word by cumulative acoustic energy rather than by elapsed time, so
 * a pause holds the highlight and a dense phrase catches it up -- 5-24% of these
 * clips is silence, which is what a linear highlight gets wrong. Within a phrase
 * it still drifts, because characters are an imperfect proxy for duration.
 * The audiobook is different: it carries a forced alignment (data.aligned), with
 * a start AND an end per word, so its highlight is exact and rests in pauses.
 *
 * The pair shares one sentence and one set of word spans, but each clip has its
 * own timings, so the same words light up at different rates for the native and
 * the cross-lingual voice. That difference is the point of the exhibit.
 * ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var blob = document.getElementById('align-data');
  if (!blob || !blob.textContent) return;   // a page built without the timings
  var A = JSON.parse(blob.textContent);
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // index of the last word whose start time is <= t
  function idxAt(t, times) {
    var lo = 0, hi = times.length - 1;
    while (lo < hi) { var m = (lo + hi + 1) >> 1; if (times[m] <= t) lo = m; else hi = m - 1; }
    return lo;
  }

  // Word indices where each paragraph of the long-form clip begins. Empty unless
  // the page carries the audiobook blob, which is the only clip with paragraphs.
  function paraBreaks(data) {
    var ab = document.getElementById('ab-data');
    if (!ab || !ab.textContent) return [];
    var starts;
    try { starts = JSON.parse(ab.textContent).para_starts; } catch (e) { return []; }
    if (!starts || !starts.length || !data.t) return [];
    return starts.map(function (sec) {
      for (var i = 0; i < data.t.length; i++) { if (data.t[i] >= sec - 0.05) return i; }
      return 0;
    });
  }

  function wire(panel) {
    // NOT a class: page.js reassigns panel.className wholesale when a language
    // tab changes, so a class flag is wiped and the panel gets wired again --
    // stacking a second timeupdate listener each time. A data attribute survives.
    if (panel.dataset.readalong) return;
    var textEl = panel.querySelector('.ab-text');
    if (!textEl) return;
    var clips = [].map.call(panel.querySelectorAll('.ab-side'), function (side) {
      var slot = side.querySelector('.ab-player');
      var src = slot && slot.getAttribute('data-src');
      return { side: side, src: src, data: src && A[src], audio: side.querySelector('audio') };
    }).filter(function (c) { return c.data && c.audio; });
    if (!clips.length) return;

    panel.dataset.readalong = '1';
    var words = clips[0].data.words;
    // Both clips in a pair tokenise identically (asserted in aligngen.py), so one
    // set of spans serves both; only the timings differ.
    textEl.innerHTML = words.map(function (w, i) {
      return '<span class="rl-w" data-i="' + i + '">' + esc(w) + '</span>';
    }).join('');
    var spans = [].slice.call(textEl.querySelectorAll('.rl-w'));

    // One element per grid column. Without this wrapper the pair spans two rows,
    // its height inflates them, and the transcript floats in the middle of a
    // 700px-tall row instead of sitting under its own status line.
    var left = document.createElement('div');
    left.className = 'rl-left';
    var status = document.createElement('p');
    status.className = 'rl-status';
    status.setAttribute('aria-live', 'polite');
    var idle = 'Press play on either voice to follow the words.';
    status.textContent = idle;

    function clear() {
      spans.forEach(function (s) { s.className = 'rl-w'; });
    }
    function mark(i) {
      for (var k = 0; k < spans.length; k++) {
        spans[k].className = 'rl-w' + (k < i ? ' is-done' : k === i ? ' is-on' : '');
      }
    }

    var lastI = -1;
    clips.forEach(function (c) {
      var t = c.data.t;
      var name = c.data.voice + (c.data.native ? ' \u00b7 native' : ' \u00b7 cross-lingual');
      c.audio.addEventListener('timeupdate', function () {
        var i = Math.min(words.length - 1, idxAt(c.audio.currentTime, t));
        if (i === lastI) return;          // ~4 timeupdates a second; repaint on change only
        lastI = i;
        mark(i);
      });
      c.audio.addEventListener('play', function () {
        // one transcript, two clips: stop the other so the highlight has one owner
        clips.forEach(function (o) { if (o !== c && !o.audio.paused) o.audio.pause(); });
        panel.setAttribute('data-following', c.src);
        status.textContent = 'Following ' + name;
      });
      c.audio.addEventListener('pause', function () {
        if (clips.every(function (o) { return o.audio.paused; })) {
          status.textContent = idle;
          panel.removeAttribute('data-following');
        }
      });
      c.audio.addEventListener('ended', function () { clear(); lastI = -1; });
    });
  }

  /* ── the audiobook ───────────────────────────────────────────────────────
   * Same idea, one clip and 491 words instead of two clips and 40. At five and a
   * half minutes the transcript cannot sit on one screen, so it scrolls in its
   * own box and follows the highlight; sentence starts from aligngen.py break it
   * into blocks rather than one wall of Tamil.
   * ──────────────────────────────────────────────────────────────────────── */
  function wireLong(host) {
    if (host.dataset.readalong) return;
    var slot = host.querySelector('.lf-player');
    var src = slot && slot.getAttribute('data-src');
    var data = src && A[src];
    var audio = host.querySelector('audio');
    if (!data || !audio) return;
    host.dataset.readalong = '1';

    var wrap = document.createElement('div');
    wrap.className = 'rl-long';
    var left = document.createElement('div');
    left.className = 'rl-left';
    var status = document.createElement('p');
    status.className = 'rl-status';
    status.setAttribute('aria-live', 'polite');
    var idle = 'Press play to follow the chapter.';
    status.textContent = idle;
    var scroller = document.createElement('div');
    scroller.className = 'rl-scroll';
    var body = document.createElement('div');
    body.className = 'ab-text indic rl-body';

    var words = data.words, brk = data.breaks || [0];
    // A chapter is paragraphs, not a list of sentences. The alignment only knows
    // sentence breaks, so the paragraph starts come from ab.json -- the same six
    // times the generator cut the audio at -- resolved to the first word at or
    // after each. All six land on a sentence break, so no sentence is split.
    var paras = paraBreaks(data);
    var at = 0, html = '', pn = 0, open = false;
    for (var s = 0; s < brk.length; s++) {
      var from = brk[s], to = (s + 1 < brk.length) ? brk[s + 1] : words.length;
      while (pn < paras.length && from >= paras[pn]) {
        if (open) html += '</p>';
        html += '<p class="rl-p">';
        open = true;
        pn++;
      }
      if (!open) { html += '<p class="rl-p">'; open = true; }
      html += '<span class="rl-s">';
      for (var i = from; i < to; i++) {
        html += '<span class="rl-w" data-i="' + i + '">' + esc(words[i]) + '</span>';
      }
      html += '</span>';
    }
    if (open) html += '</p>';
    body.innerHTML = html;
    scroller.appendChild(body);
    left.appendChild(status);
    left.appendChild(scroller);

    var right = document.createElement('div');
    right.className = 'rl-right';
    // move the existing player card across; page.js already mounted it
    var card = host.querySelector('.clip');
    wrap.appendChild(left);
    wrap.appendChild(right);
    host.appendChild(wrap);
    if (card) right.appendChild(card);

    // The transcript on the left is the whole chapter, word for word, so the copy
    // the card carried is now duplicated -- and it was landing in a 352px column as
    // a 515px ribbon of Tamil. Drop it, and with it the disclosure it sat behind:
    // there is nothing left to expand when every paragraph is already on screen,
    // which is also what stops src/fade.js from arming here.
    ['.txt', 'details.chart-data'].forEach(function (sel) {
      var e = card && card.querySelector(sel);
      if (e) e.remove();
    });

    var spans = [].slice.call(body.querySelectorAll('.rl-w'));
    var last = -1;
    audio.addEventListener('timeupdate', function () {
      var now = audio.currentTime, i = Math.min(words.length - 1, idxAt(now, data.t));
      // With a real alignment a word is only lit while it is being said; in the
      // pause after it, it joins the read words instead of clinging to the light.
      var on = !(data.e && now > data.e[i] + 0.25);
      var key = i * 2 + (on ? 1 : 0);
      if (key === last) return;
      last = key;
      for (var k = 0; k < spans.length; k++) {
        spans[k].className = 'rl-w' + (k < i || (k === i && !on) ? ' is-done' : k === i ? ' is-on' : '');
      }
      // Keep the active word in view. Computed in the scroller's own content
      // coordinates and ASSIGNED, not incremented: an incremental nudge compounds
      // against an in-flight smooth scroll and drifts off the word entirely --
      // measured, the highlight was out of view by 150s of a 329s chapter.
      var el = spans[i], box = scroller.getBoundingClientRect(),
          r = el.getBoundingClientRect();
      if (r.top < box.top + 24 || r.bottom > box.bottom - 24) {
        scroller.scrollTop = (r.top - box.top + scroller.scrollTop) - box.height * 0.38;
      }
    });
    audio.addEventListener('play', function () {
      host.setAttribute('data-following', '1');
      status.textContent = 'Following ' + data.voice + (data.aligned ? ' \u00b7 aligned word by word' : ' \u00b7 5:29 chapter');
    });
    audio.addEventListener('pause', function () {
      status.textContent = idle; host.removeAttribute('data-following');
    });
    audio.addEventListener('ended', function () {
      spans.forEach(function (s) { s.className = 'rl-w'; });
      last = -1;
    });
  }

  /* ── the style samples ───────────────────────────────────────────────────
   * The twelve delivery-style clips are force-aligned too. The panel already
   * sets each clip's text as paragraphs, so those paragraphs are rebuilt from
   * the aligned words -- same spans, same highlight, same rest in a pause as the
   * audiobook -- and the box the page already scrolls follows the lit word.
   * ──────────────────────────────────────────────────────────────────────── */
  function wireStyle(panel) {
    var lines = panel.querySelector('.style-lines');
    var slot = panel.querySelector('.style-player');
    var audio = slot && slot.querySelector('audio');
    var src = slot && slot.getAttribute('data-src');
    var data = src && A[src];
    if (!lines || !audio || !data || !data.aligned || lines.dataset.readalong) return;
    lines.dataset.readalong = '1';

    var proto = lines.querySelector('.style-line');
    var cls = proto ? proto.className : 'style-line', lang = proto ? proto.getAttribute('lang') || '' : '';
    var words = data.words, brk = data.breaks || [0], html = '';
    // Inline LaTeX, typeset at build time (src/texgen.js): a run of tokens from
    // an opening $ to the closing one becomes one span that lights while any of
    // its words is spoken. Text after the closing $ (a full stop) stays text.
    var texEl = document.getElementById('tex-data');
    var TEX = texEl && texEl.textContent ? JSON.parse(texEl.textContent) : {};
    for (var s = 0; s < brk.length; s++) {
      var from = brk[s], to = (s + 1 < brk.length) ? brk[s + 1] : words.length;
      html += '<p class="' + esc(cls) + ' rl-s" lang="' + esc(lang) + '">';
      for (var i = from; i < to; i++) {
        var w = words[i];
        if (w.charAt(0) === '$') {
          var j = i, run = '';
          while (j < to) { run += (j > i ? ' ' : '') + words[j].trim(); if (j > i && words[j].indexOf('$') >= 0 || j === i && words[j].trim().length > 1 && words[j].trim().indexOf('$', 1) >= 0) break; j++; }
          var close = run.indexOf('$', 1), math = close > 0 ? TEX[run.slice(0, close + 1)] : null;
          if (math) {
            html += '<span class="rl-w rl-tex" data-i="' + i + '" data-j="' + j + '">' + math + '</span>' +
                    esc(run.slice(close + 1)) + (words[j].slice(-1) === ' ' ? ' ' : '');
            i = j;
            continue;
          }
        }
        html += '<span class="rl-w" data-i="' + i + '">' + esc(w) + '</span>';
      }
      html += '</p>';
    }
    lines.innerHTML = html;
    var status = document.createElement('p');
    status.className = 'rl-status';
    status.setAttribute('aria-live', 'polite');
    var idle = 'Press play to follow the words.';
    status.textContent = idle;
    lines.parentNode.insertBefore(status, lines);

    // A span covers words a..b (one word, or a typeset run); its state comes
    // from where the current word sits against that range.
    var spans = [].slice.call(lines.querySelectorAll('.rl-w')).map(function (el) {
      return { el: el, a: +el.dataset.i, b: +(el.dataset.j || el.dataset.i) };
    }), last = -1;
    audio.addEventListener('timeupdate', function () {
      var now = audio.currentTime, i = Math.min(words.length - 1, idxAt(now, data.t));
      var on = !(data.e && now > data.e[i] + 0.25);
      var key = i * 2 + (on ? 1 : 0);
      if (key === last) return;
      last = key;
      var cur = null;
      spans.forEach(function (sp) {
        var done = sp.b < i || (sp.b === i && !on), lit = !done && sp.a <= i && i <= sp.b;
        sp.el.className = 'rl-w' + (sp.el.classList.contains('rl-tex') ? ' rl-tex' : '') + (done ? ' is-done' : lit ? ' is-on' : '');
        if (sp.a <= i && i <= sp.b) cur = sp.el;
      });
      var el = cur || spans[spans.length - 1].el, box = lines.getBoundingClientRect(), r = el.getBoundingClientRect();
      if (r.top < box.top + 16 || r.bottom > box.bottom - 16) {
        lines.scrollTop = (r.top - box.top + lines.scrollTop) - box.height * 0.38;
      }
    });
    audio.addEventListener('play', function () {
      panel.setAttribute('data-following', '1');
      status.textContent = 'Following ' + (data.voice || 'the clip') + ' \u00b7 aligned word by word';
    });
    audio.addEventListener('pause', function () {
      status.textContent = idle; panel.removeAttribute('data-following');
    });
    audio.addEventListener('ended', function () {
      spans.forEach(function (sp) { sp.el.className = 'rl-w' + (sp.el.classList.contains('rl-tex') ? ' rl-tex' : ''); });
      last = -1;
    });
  }

  /* ── one routine for everything else ────────────────────────────────────
   * The per-language clip cards and the voice panel both show a clip's words in
   * a single paragraph. `fill` sets that paragraph as word spans from the
   * alignment; `follow` lights them from an <audio>. The voice panel builds its
   * own Audio on click, so it calls these through window.ReadAlong rather than
   * being found by a sweep. An excerpt (a voice sample cut from a longer
   * sentence) ends in an ellipsis, so the reader knows the sentence goes on.
   * ──────────────────────────────────────────────────────────────────────── */
  var RTL = { ur: 1, ks: 1, sd: 1 };
  function fill(el, src) {
    var data = A[src];
    if (!el || !data || !data.aligned) return null;
    el.innerHTML = data.words.map(function (w, i) {
      return '<span class="rl-w" data-i="' + i + '">' + esc(w) + '</span>';
    }).join('') + (data.excerpt ? '<span class="rl-more">\u2026</span>' : '');
    if (RTL[data.lang]) el.classList.add('rtl');
    el.dataset.readalong = '1';
    return data;
  }
  function follow(audio, el, src) {
    var data = A[src];
    if (!audio || !el || !data || !data.aligned || audio.dataset.readalong) return;
    audio.dataset.readalong = '1';
    var spans = [].slice.call(el.querySelectorAll('.rl-w')), words = data.words, last = -1;
    audio.addEventListener('timeupdate', function () {
      var now = audio.currentTime, i = Math.min(words.length - 1, idxAt(now, data.t));
      var on = !(data.e && now > data.e[i] + 0.25);
      var key = i * 2 + (on ? 1 : 0);
      if (key === last) return;
      last = key;
      for (var k = 0; k < spans.length; k++) {
        spans[k].className = 'rl-w' + (k < i || (k === i && !on) ? ' is-done' : k === i ? ' is-on' : '');
      }
    });
    audio.addEventListener('ended', function () {
      spans.forEach(function (s) { s.className = 'rl-w'; });
      last = -1;
    });
  }
  window.ReadAlong = { fill: fill, follow: follow };

  // The per-language clip cards: text under the player, one paragraph each.
  function wireCard(card) {
    var audio = card.querySelector('audio'), txt = card.querySelector('p.txt');
    if (!audio || !txt || txt.dataset.readalong) return;
    if (fill(txt, card.dataset.src)) follow(audio, txt, card.dataset.src);
  }

  function sweep() {
    [].forEach.call(document.querySelectorAll('.ab-panel'), wire);
    [].forEach.call(document.querySelectorAll('#clipPanels .clip[data-src]'), wireCard);
    // The voice panel rendered before this script ran: fill its line now.
    [].forEach.call(document.querySelectorAll('.vr-text[data-src]:not([data-readalong])'), function (el) { fill(el, el.dataset.src); });
    var lf = document.getElementById('longform');
    if (lf) wireLong(lf);
    var sp = document.getElementById('stylePanel');
    if (sp) wireStyle(sp);
  }
  sweep();
  // page.js mounts each pair's players only when its language tab is first shown,
  // so a panel wired at load is the only one that exists yet. Watching for the
  // mounts is more reliable than guessing which tab handler to hook.
  if (window.MutationObserver) {
    [document.getElementById('abPanels'), document.getElementById('longform'), document.getElementById('stylePanel'), document.getElementById('clipPanels')]
      .filter(Boolean)
      .forEach(function (h) { new MutationObserver(sweep).observe(h, { childList: true, subtree: true }); });
  }
})();
