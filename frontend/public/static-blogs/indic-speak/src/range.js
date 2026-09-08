
/* ── The voice range ──────────────────────────────────────────────────────
 * One axis, median pitch, positions true; the two registers face each other
 * across it; the band they share is marked. Then the 45 names, and one player.
 *
 * Pitch is the only measure on the shared axis on purpose. Over this library, 73%
 * of the variance in characters per second is explained by which language a voice
 * reads and only 15% of the variance in pitch is -- so pace belongs beside the
 * voice's language in the panel, not on an axis where two voices reading different
 * scripts would look like a fast one and a slow one.
 *
 * Lookups inside this widget go through classes, not ids: the shim in
 * src/smoke.js resolves class and tag selectors only, and running there is what
 * keeps the widget covered.
 *
 * The only waveform is the player's progress track, drawn from waves.json, the same
 * 56-bar envelope every other player on the page uses.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  var mount = document.getElementById('voiceLadder');
  var pd = document.getElementById('page-data');
  var wd = document.getElementById('wave-data');
  if (!mount || !pd || !wd || !pd.textContent || !wd.textContent) return;

  var D = JSON.parse(pd.textContent);
  var WAVES = JSON.parse(wd.textContent);
  var CLIPS = {};
  (D.clips || []).forEach(function (c) { if (c.voice) CLIPS[c.voice] = c; });
  var cd = document.getElementById('clip-data');
  if (cd && cd.textContent) {
    (JSON.parse(cd.textContent).voices || []).forEach(function (c) { CLIPS[c.voice] = c; });
  }
  var LANGNAME = {};
  D.languages.forEach(function (l) { LANGNAME[l.code] = l.name; });

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function clock(s) {
    if (!isFinite(s)) return '0:00';
    return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2);
  }

  var voices = Object.keys(D.voices).map(function (n) {
    var v = D.voices[n];
    return { name: n, hz: v.hz, cps: v.cps, lang: v.lang, desc: v.desc,
             fem: v.gender === 'female', file: (CLIPS[n] || {}).file };
  }).sort(function (a, b) { return b.hz - a.hz; });
  if (!voices.length) return;

  var HZ = voices.map(function (v) { return v.hz; });
  var LO = Math.min.apply(null, HZ), HI = Math.max.apply(null, HZ);
  var pct = function (hz) { return (hz - LO) / (HI - LO) * 100; };

  function range(fem) {
    var h = voices.filter(function (v) { return v.fem === fem; }).map(function (v) { return v.hz; });
    return [Math.min.apply(null, h), Math.max.apply(null, h), h.length];
  }
  var F = range(true), M = range(false);
  var band = [Math.max(F[0], M[0]), Math.min(F[1], M[1])];
  var inBand = voices.filter(function (v) { return v.hz >= band[0] && v.hz <= band[1]; }).length;

  // Lanes: a voice takes the first lane whose last dot is far enough away. The
  // threshold is set by the NARROWEST width the spectrum is drawn at -- a ~330px
  // axis on a phone, where 5 Hz is 9px and the dots are 8px there. Lanes are
  // assigned once, so sizing for the widest width would collide on mobile.
  var GAP = 5;
  function laneOf(list) {
    var lanes = [], out = {};
    list.slice().sort(function (a, b) { return a.hz - b.hz; }).forEach(function (v) {
      for (var i = 0; i < lanes.length; i++) {
        if (v.hz - lanes[i] >= GAP) { lanes[i] = v.hz; out[v.name] = i; return; }
      }
      lanes.push(v.hz); out[v.name] = lanes.length - 1;
    });
    return out;
  }
  var lane = laneOf(voices.filter(function (v) { return v.fem; }));
  var laneM = laneOf(voices.filter(function (v) { return !v.fem; }));
  Object.keys(laneM).forEach(function (k) { lane[k] = laneM[k]; });

  /* ── build ── */
  var wrap = document.createElement('div');
  wrap.className = 'vr';
  var ticks = [];
  for (var t = Math.ceil(LO / 20) * 20; t <= HI; t += 20) ticks.push(t);

  wrap.innerHTML =
    '<div class="vr-spectrum">' +
      '<p class="vr-lane-label is-f"><b>female</b> · ' + F[2] + ' voices across ' +
        (F[1] - F[0]) + ' Hz</p>' +
      '<div class="vr-field">' +
        '<div class="vr-band" style="left:' + pct(band[0]).toFixed(2) + '%;width:' +
          (pct(band[1]) - pct(band[0])).toFixed(2) + '%"></div>' +
        '<div class="vr-axis"></div>' +
        ticks.map(function (v) {
          return '<span class="vr-tick" style="left:' + pct(v).toFixed(2) + '%">' + v + '</span>';
        }).join('') +
        '<span class="vr-band-label" style="left:' +
          ((pct(band[0]) + pct(band[1])) / 2).toFixed(2) + '%">' + inBand + ' voices · ' +
          band[0] + '–' + band[1] + ' Hz</span>' +
        '<span class="vr-hover"></span>' +
      '</div>' +
      '<p class="vr-lane-label is-m"><b>male</b> · ' + M[2] + ' voices across ' +
        (M[1] - M[0]) + ' Hz</p>' +
    '</div>' +
    '<div class="vr-body"><div class="vr-rec"></div>' +
    '<div class="vr-now"></div></div>';
  mount.appendChild(wrap);

  var field = wrap.querySelector('.vr-field');
  var hover = wrap.querySelector('.vr-hover');
  var rec = wrap.querySelector('.vr-rec');
  var now = wrap.querySelector('.vr-now');
  var dots = {};

  voices.forEach(function (v) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'vr-dot ' + (v.fem ? 'is-f' : 'is-m');
    d.style.left = pct(v.hz).toFixed(2) + '%';
    // The offset is written out rather than passed as a custom property: page.js
    // sticks to plain style assignment so src/smoke.js can run the widgets, and its
    // shim has no CSSStyleDeclaration.setProperty.
    var off = lane[v.name] * 13;
    if (v.fem) d.style.bottom = 'calc(50% + ' + (6 + off) + 'px)';
    else d.style.top = 'calc(50% + ' + (20 + off) + 'px)';
    d.setAttribute('aria-label', v.name + ', ' + v.hz + ' hertz');
    d.addEventListener('click', function () { select(v.name); });
    d.addEventListener('mouseenter', function () { peek(v); });
    d.addEventListener('focus', function () { peek(v); select(v.name); });
    d.addEventListener('mouseleave', function () { hover.classList.remove('is-on'); });
    field.appendChild(d);
    dots[v.name] = d;
  });

  function peek(v) {
    hover.textContent = v.name + ' · ' + v.hz + ' Hz';
    hover.style.left = pct(v.hz).toFixed(2) + '%';
    hover.classList.add('is-on');
  }

  /* ── the player ── */
  var audio = null, raf = 0, current = null;
  var PLAY = '<svg viewBox="0 0 12 14" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" stroke="none" d="M1 1.2v11.6c0 .5.5.8 1 .5l9.4-5.8a.6.6 0 0 0 0-1L2 .7c-.5-.3-1 0-1 .5z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 12 14" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" stroke="none" d="M1 1h3.2v12H1zM7.8 1H11v12H7.8z"/></svg>';

  function wavePath(e) {
    var d = '';
    for (var i = 0; i < e.length; i++) {
      var h = (+e[i] / 9) * 11 + 1;
      d += 'M' + (i + 0.5) + ' ' + (13 - h) + 'V' + (13 + h);
    }
    return d;
  }
  function stop() {
    if (audio) { audio.pause(); audio = null; }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    var b = now.querySelector('.vr-play');
    if (b) b.innerHTML = PLAY;
    var r = now.querySelector('.vr-veil');
    if (r) r.setAttribute('width', '0');
  }

  function select(name) {
    var v = voices.filter(function (x) { return x.name === name; })[0];
    if (!v || current === name) return;
    stop();
    current = name;
    Object.keys(dots).forEach(function (k) {
      dots[k].classList.toggle('is-on', k === name);
    });
    rec.querySelectorAll('.vr-rec-name').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-voice') === name);
    });
    var info = v.file && WAVES.clips ? WAVES.clips[v.file] : null;
    var env = info ? info.e : '';
    now.innerHTML =
      '<p class="vr-now-name">' + esc(v.name) +
        '<span class="vr-now-meta">' + (v.fem ? 'female' : 'male') + ' · ' + v.hz + ' Hz · ' +
        v.cps + ' chars/s reading ' + esc(LANGNAME[v.lang] || v.lang) + '</span></p>' +
      '<p class="vr-now-desc">' + esc(v.desc).replace('*Best for:*', '<em>Suggested for:</em>') + '</p>' +
      (v.file ? '<p class="vr-text" lang="' + esc(v.lang) + '" data-src="' + esc(v.file) + '"></p>' : '') +
      (v.file
        ? '<div class="vr-play-row">' +
            '<button type="button" class="vr-play" aria-label="Play ' + esc(v.name) + '">' + PLAY + '</button>' +
            '<svg class="vr-wave" viewBox="0 0 ' + Math.max(1, env.length) + ' 26" ' +
              'preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
              '<clipPath id="vrClip"><rect class="vr-veil" x="0" y="0" width="0" height="26"/></clipPath>' +
              '<path class="vr-w-base" d="' + wavePath(env) + '"/>' +
              '<g clip-path="url(#vrClip)"><path d="' + wavePath(env) + '"/></g>' +
            '</svg>' +
            '<span class="vr-clock">' + clock(info ? info.d : 0) + '</span>' +
          '</div>'
        : '');

    // The words heard in the sample, lit as it plays, from the alignment when
    // the read-along has one for this clip. Left empty (and so hidden) otherwise:
    // nothing invented. src/readalong.js loads after this file, so the first
    // panel is filled on play instead.
    var text = now.querySelector('.vr-text');
    if (text && window.ReadAlong) window.ReadAlong.fill(text, v.file);

    var btn = now.querySelector('.vr-play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (audio) { stop(); return; }
      audio = new Audio(v.file);
      if (text && window.ReadAlong) {
        if (!text.dataset.readalong) window.ReadAlong.fill(text, v.file);
        window.ReadAlong.follow(audio, text, v.file);
      }
      var rect = now.querySelector('.vr-veil');
      var span = now.querySelector('.vr-clock');
      audio.addEventListener('ended', stop);
      audio.play();
      btn.innerHTML = PAUSE;
      (function tick() {
        if (!audio) return;
        var p = audio.duration ? audio.currentTime / audio.duration : 0;
        if (rect) rect.setAttribute('width', (Math.min(1, p) * env.length).toFixed(1));
        if (span) span.textContent = clock(audio.currentTime) + ' / ' + clock(audio.duration);
        raf = requestAnimationFrame(tick);
      })();
    });
  }

  /* ── follow the wall ─────────────────────────────────────────────────────
   * One selection, three views. The recommended voices for the chosen language are
   * ringed on the axis, so you can see where that language sits inside the library;
   * the first of them loads into the panel; and the native-versus-elsewhere pair
   * below switches to the same language. Ten of the 22 have a pair, and for the
   * other twelve that step is removed rather than left standing empty.
   * ──────────────────────────────────────────────────────────────────────── */
  var abStep = document.getElementById('abStep');
  var abPanels = document.getElementById('abPanels');
  var abTabs = document.getElementById('abTabs');

  // The wall dispatches on its own mount; see the note in src/voices.js.
  var bus = document.getElementById('voiceWall');
  if (!bus) return;
  bus.addEventListener('voice:lang', function (e) {
    var d = e.detail, names = (d.voices || []).filter(function (n) { return dots[n]; });
    Object.keys(dots).forEach(function (k) {
      dots[k].classList.toggle('is-rec', names.indexOf(k) >= 0);
    });
    rec.innerHTML = names.length
      ? '<span class="vr-rec-label">start with, in ' + esc(d.name) + '</span>' +
        names.map(function (n) {
          return '<button type="button" class="vr-rec-name" data-voice="' + esc(n) + '">' +
            esc(n) + '<i>' + D.voices[n].hz + ' Hz</i></button>';
        }).join('') +
        '<span class="vr-rec-judge">' +
          (d.judge != null ? 'judge ' + d.judge.toFixed(2) + ' / 5' : 'not yet scored') +
        '</span>'
      : '';
    rec.querySelectorAll('.vr-rec-name').forEach(function (b) {
      b.addEventListener('click', function () { select(b.getAttribute('data-voice')); });
    });
    if (names.length) { current = null; select(names[0]); }

    var tab = abTabs && abTabs.querySelector('[data-lang="' + d.code + '"]');
    if (tab) tab.click();
    if (abStep) abStep.hidden = !tab;
    if (abPanels) abPanels.hidden = !tab;
  });
})();
