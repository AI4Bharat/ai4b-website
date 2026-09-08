(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var HERO = JSON.parse(document.getElementById('hero-data').textContent);
  // Only the blobs a page actually carries are parsed, so each post ships just its
  // own data.
  function blob(id, fallback) {
    var e = document.getElementById(id);
    // An element with no text is the same as no element: a page built without this
    // blob, or a harness that stubs the node. Parsing '' throws.
    return e && e.textContent ? JSON.parse(e.textContent) : fallback;
  }
  var CLIPS = blob('clip-data', { ab: [], voices: [] });
  var PARAMS = blob('param-data', null);
  var NORM = blob('norm-data', null);
  var WAVES = blob('wave-data', null);
  var SVGNS = 'http://www.w3.org/2000/svg';
  var LANGNAME = {};
  D.languages.forEach(function (l) { LANGNAME[l.code] = l.name; });
  var RTL = { ur: 1, ks: 1, sd: 1 };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A frame is seven tokens in a fixed 1:2:4 interleave; this is which codebook
  // each position draws from. One colour family per codebook, from the house
  // palette. Shared by the hero field and the voice forge so they cannot drift.
  var BOOK = [0, 1, 2, 2, 1, 2, 2];
  var FAMILY = [
    ['#EFB187', '#D2691E', '#A8380A'],   // coarse: carries the weight
    ['#F3D2A0', '#E3A45C', '#C97A2E'],   // middle
    ['#DCC7AE', '#C2A078', '#A8814F']    // fine: the quietest, but still visible
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmt(n, d) { return n == null ? '—' : Number(n).toFixed(d == null ? 2 : d); }
  // Two posts share this script: the capability post and the technical one. Each
  // carries a subset of the widgets, so every block below bails out when its own
  // container is missing rather than throwing and killing the blocks after it.
  function need(id) { return document.getElementById(id); }
  // Same idea for the loose numbers injected into prose.
  function put(id, value) {
    var e = document.getElementById(id);
    if (e) e.textContent = value;
  }

  function el(tag, attrs, text) {
    var e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }

  /* ── The audio player ────────────────────────────────────────────────────
   * The browser's default control bar is a grey slab that belongs to no design
   * system. This replaces it with the house language: a pill play control, the
   * clip's own waveform as the progress track, and mono timings.
   *
   * The track is that clip's real loudness, computed by src/wavegen.py, so it is
   * the audio and not a decorative squiggle. Two copies of the bars are drawn --
   * pale underneath, warm on top -- and progress is a clip-path on the warm copy,
   * so playback moves exactly one property and never touches layout. Clicking or
   * dragging the track seeks; the keyboard gets arrows and space.
   * ──────────────────────────────────────────────────────────────────────── */
  function makePlayer(src, meta, rates) {
    var info = (WAVES && WAVES.clips && WAVES.clips[src]) || null;
    var env = info ? info.e : new Array(56).fill('5').join('');
    var wrap = document.createElement('div');
    wrap.className = 'ap';

    function bars() {
      var b = '<div class="ap-bars">';
      for (var i = 0; i < env.length; i++) {
        b += '<i style="height:' + (14 + (+env[i]) * 9.5).toFixed(0) + '%"></i>';
      }
      return b + '</div>';
    }
    function clock(s) {
      if (!isFinite(s)) return '0:00';
      return Math.floor(s / 60) + ':' + ('0' + Math.floor(s % 60)).slice(-2);
    }
    var dur = info ? info.d : 0;
    wrap.innerHTML =
      '<button type="button" class="ap-play" aria-label="Play">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ap-i-play" d="M8 5.5v13l11-6.5z"/>' +
      '<path class="ap-i-pause" d="M7.5 5.5h3.5v13H7.5zM13 5.5h3.5v13H13z"/></svg></button>' +
      '<div class="ap-track" role="slider" tabindex="0" aria-label="Seek"' +
      ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      bars('ap-bars') + '<div class="ap-played">' + bars('ap-bars') + '</div></div>' +
      '<span class="ap-time"><b>0:00</b> / ' + clock(dur) + '</span>' +
      // Speed matters for speech in a way it does not for music: people audition a
      // voice fast and check diction slow. A cycling pill costs one control's width
      // where a slider would cost five.
      '<button type="button" class="ap-rate" aria-label="Playback speed">1&times;</button>' +
      '<div class="ap-vol"><button type="button" class="ap-mute" aria-label="Mute">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path class="ap-i-on" d="M4 9h3l4-3.5v13L7 15H4zM15.5 8.5a4.5 4.5 0 010 7"/>' +
      '<path class="ap-i-off" d="M4 9h3l4-3.5v13L7 15H4zM15 9.5l5 5m0-5l-5 5"/></svg></button>' +
      '<input class="ap-vol-range" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume">' +
      '</div>' +
      (meta ? '<span class="ap-meta">' + meta + '</span>' : '');

    var audio = document.createElement('audio');
    audio.preload = 'none';
    audio.src = src;
    wrap.appendChild(audio);

    var btn = wrap.querySelector('.ap-play');
    var track = wrap.querySelector('.ap-track');
    var played = wrap.querySelector('.ap-played');
    var elapsed = wrap.querySelector('.ap-time b');

    function setProgress(p) {
      p = Math.max(0, Math.min(1, p || 0));
      played.style.clipPath = 'inset(0 ' + ((1 - p) * 100).toFixed(2) + '% 0 0)';
      track.setAttribute('aria-valuenow', Math.round(p * 100));
    }
    setProgress(0);

    btn.addEventListener('click', function () { audio.paused ? audio.play() : audio.pause(); });
    audio.addEventListener('play', function () { wrap.classList.add('is-playing'); btn.setAttribute('aria-label', 'Pause'); });
    audio.addEventListener('pause', function () { wrap.classList.remove('is-playing'); btn.setAttribute('aria-label', 'Play'); });
    audio.addEventListener('ended', function () { setProgress(0); elapsed.textContent = '0:00'; });
    audio.addEventListener('timeupdate', function () {
      var d = audio.duration || dur;
      setProgress(d ? audio.currentTime / d : 0);
      elapsed.textContent = clock(audio.currentTime);
    });

    function seekFrom(clientX) {
      var r = track.getBoundingClientRect();
      var p = (clientX - r.left) / r.width;
      var d = audio.duration || dur;
      if (d) { audio.currentTime = Math.max(0, Math.min(d - 0.05, p * d)); setProgress(p); }
    }
    track.addEventListener('pointerdown', function (e) {
      seekFrom(e.clientX); track.setPointerCapture(e.pointerId);
      track.onpointermove = function (m) { seekFrom(m.clientX); };
    });
    track.addEventListener('pointerup', function (e) {
      track.onpointermove = null;
      try { track.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
    });
    // ── playback speed, cycling rather than a slider
    var RATES = rates || [1, 1.25, 1.5, 0.75];
    var rateBtn = wrap.querySelector('.ap-rate');
    var ri = 0;
    rateBtn.addEventListener('click', function () {
      ri = (ri + 1) % RATES.length;
      audio.playbackRate = RATES[ri];
      rateBtn.innerHTML = (RATES[ri] === 1 ? '1' : String(RATES[ri])) + '&times;';
      rateBtn.classList.toggle('is-set', RATES[ri] !== 1);
    });

    // ── volume: a button that reveals its slider, so the control costs one slot
    var muteBtn = wrap.querySelector('.ap-mute');
    var vol = wrap.querySelector('.ap-vol-range');
    var lastVol = 1;
    function applyVol(v) {
      audio.volume = v;
      wrap.classList.toggle('is-muted', v === 0);
      muteBtn.setAttribute('aria-label', v === 0 ? 'Unmute' : 'Mute');
    }
    vol.addEventListener('input', function () { lastVol = +vol.value || lastVol; applyVol(+vol.value); });
    muteBtn.addEventListener('click', function () {
      var next = audio.volume === 0 ? (lastVol || 1) : 0;
      vol.value = next; applyVol(next);
    });

    track.addEventListener('keydown', function (e) {
      var d = audio.duration || dur;
      if (e.key === 'ArrowRight') { audio.currentTime = Math.min(d, audio.currentTime + 2); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 2); e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'Enter') { audio.paused ? audio.play() : audio.pause(); e.preventDefault(); }
    });
    return wrap;
  }

  // Audio is a page-level resource: starting any preview pauses the one that was
  // already speaking, including the hero and the technical-page forge.
  document.addEventListener('play', function (e) {
    document.querySelectorAll('audio').forEach(function (au) {
      if (au !== e.target) au.pause();
    });
  }, true);


  /* ── Hero demo, and reading the post aloud ───────────────────────────────
   * Both controls depend on assets that are produced outside this repo, so
   * src/build.py discovers them and marks the control pending when the file it
   * needs is absent. A pending control still renders -- it says what is coming
   * rather than pretending nothing is planned -- but it never opens a broken
   * player. Drop the file in, rebuild, and it goes live with no code change.
   * ──────────────────────────────────────────────────────────────────────── */
  var MEDIA = blob('media-data', {});

  (function () {
    var open = need('heroDemoOpen'), panel = need('heroDemo');
    if (!open || !panel) return;
    var body = need('heroDemoBody'), close = need('heroDemoClose');
    var built = false;

    function build() {
      if (built) return;
      built = true;
      if (MEDIA.demo) {
        var v = document.createElement('video');
        v.src = MEDIA.demo;
        v.controls = true; v.playsInline = true; v.preload = 'metadata';
        v.className = 'hero-demo-video';
        body.appendChild(v);
      } else {
        body.innerHTML = '<p class="hero-demo-pending">The walkthrough is being recorded. ' +
          'It plays here once it lands &mdash; until then, the post itself is the demo: ' +
          '<a href="' + (need('hear') ? '#hear' : 'indic-speak.html#hear') + '">every clip below is real output</a>.</p>';
      }
    }
    function show(on) {
      if (on) build();
      panel.hidden = !on;
      open.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (!on) {
        var v = body.querySelector('video');
        if (v) v.pause();
      } else if (close) { close.focus(); }
    }
    open.addEventListener('click', function () { show(panel.hidden); });
    if (close) close.addEventListener('click', function () { show(false); open.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { show(false); open.focus(); }
    });
  })();


  /* ── Hero: the scripts ───────────────────────────────────────────────────
   * The twelve scripts the model reads, each shown by its first vowel. One is
   * featured large with its name and how many of the 22 languages write in it;
   * all twelve drift slowly along the card's edge, and the featured one is lit
   * there too. The scripts and their languages come from the language table,
   * so the hero cannot disagree with the rest of the post. Behind them, the
   * ripple is born from the featured letter and lights each small letter as
   * the wavefront passes it: one voice, reaching every script.
   * ──────────────────────────────────────────────────────────────────────── */
  var VOWEL = { 'Devanagari': 'अ', 'Bengali–Assamese': 'অ', 'Gujarati': 'અ', 'Gurmukhi': 'ਅ',
                'Odia': 'ଅ', 'Tamil': 'அ', 'Telugu': 'అ', 'Kannada': 'ಅ', 'Malayalam': 'അ',
                'Perso-Arabic': 'ا', 'Meitei Mayek': 'ꯑ', 'Ol Chiki': 'ᱟ' };
  // One muted hue per script, so colour means something: the letters wear it,
  // and every wave keeps the hue of the language that was speaking when it
  // was born. All twelve sit at similar depth so none of them shouts.
  var HUE = { 'Devanagari': '#C2410C', 'Perso-Arabic': '#1F7A8C', 'Bengali–Assamese': '#A63D5C',
              'Gujarati': '#D4870A', 'Kannada': '#6A7F1C', 'Malayalam': '#2E7D5B',
              'Meitei Mayek': '#5B4B9E', 'Odia': '#8C5A2B', 'Gurmukhi': '#B8651B',
              'Ol Chiki': '#3B6FB6', 'Tamil': '#9C2F3F', 'Telugu': '#7A3F8A' };
  // A colour moved toward white by f, with an optional alpha.
  function tint(hex, f, alpha) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * f); g = Math.round(g + (255 - g) * f); b = Math.round(b + (255 - b) * f);
    return alpha == null ? 'rgb(' + r + ',' + g + ',' + b + ')' : 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }
  // Colours as rgb triples, so a wave's colour can be graded by loudness and
  // cooled toward the pack's teal as it travels, one mix at a time.
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
  function css(c) { return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  var WHITE = [255, 250, 243], BLACK = [30, 20, 16], TEAL = rgb('#5C9080');
  var SCRIPTS = (function () {
    var by = {}, out = [];
    D.languages.forEach(function (l) {
      if (!by[l.script]) { by[l.script] = { name: l.script, glyph: VOWEL[l.script], hue: HUE[l.script] || '#C2410C', langs: [] }; out.push(by[l.script]); }
      by[l.script].langs.push(l);
    });
    // Most-written scripts first, and within a script the benchmarked
    // languages first, so the card opens on Hindi.
    out.sort(function (p, q) { return q.langs.length - p.langs.length; });
    out.forEach(function (s) { s.langs.sort(function (p, q) { return (q.benchmarked ? 1 : 0) - (p.benchmarked ? 1 : 0); }); });
    return out;
  })();
  // Every language gets a turn. Each script's languages are spread evenly over
  // the 22 slots, so the eight Devanagari languages do not run back to back.
  var TURNS = (function () {
    var n = D.languages.length, slots = [];
    SCRIPTS.forEach(function (s) {
      s.langs.forEach(function (l, j) {
        var at = Math.floor(j * n / s.langs.length);
        while (slots[at % n]) at++;
        slots[at % n] = { script: s, lang: l.name };
      });
    });
    return slots;
  })();
  // The loose letters in the hero: each script's first vowel plus one more of
  // its letters, the consonant ka (or the nearest equivalent), so the card is
  // lively without being crowded.
  var MORE = { 'Devanagari': 'क', 'Bengali–Assamese': 'ক', 'Gujarati': 'ક', 'Gurmukhi': 'ਕ',
               'Odia': 'କ', 'Tamil': 'க', 'Telugu': 'క', 'Kannada': 'ಕ', 'Malayalam': 'ക',
               'Perso-Arabic': 'ک', 'Meitei Mayek': 'ꯀ', 'Ol Chiki': 'ᱠ' };
  var LETTERS = [];
  SCRIPTS.forEach(function (s, i) {
    LETTERS.push({ s: i, glyph: s.glyph });
    Array.from(MORE[s.name] || '').forEach(function (g) { LETTERS.push({ s: i, glyph: g }); });
  });
  var heroActive = 0;            // which script is featured right now

  (function () {
    var box = need('heroGlyph');
    if (!box) return;
    var faces = [need('heroGlyphA'), need('heroGlyphB')], cap = need('heroGlyphCap');
    var on = 1, turn = 0;          // so the first letter lands in face A
    function show(i) {
      var s = TURNS[i].script, next = faces[1 - on];
      turn = i; heroActive = SCRIPTS.indexOf(s);
      next.textContent = s.glyph;
      next.style.backgroundImage = 'linear-gradient(160deg, ' + s.hue + ' 0%, ' + tint(s.hue, 0.32) + ' 100%)';
      faces[on].classList.remove('is-on');
      next.classList.add('is-on');
      on = 1 - on;
      cap.classList.add('is-off');
      setTimeout(function () { cap.textContent = TURNS[turn].lang; cap.classList.remove('is-off'); }, 300);
    }
    show(0);
    if (REDUCED) return;
    var HOLD = 2400, visible = true;
    setInterval(function () { if (visible) show((turn + 1) % TURNS.length); }, HOLD);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(box);
    }
  })();

  /* ── Hero: the ripple and the drifting letters ───────────────────────────
   * Speech is pressure radiating from a source, so that is what the canvas
   * draws behind the letters: one ring per envelope bar, born at the featured
   * letter at the bar rate of HERO.amp -- N bars over HERO.seconds -- so the
   * field plays at the clip's own speed. A ring lives LIFE seconds, and after
   * the sentence the card rests for REST seconds before it starts again, so
   * the loop reads as a new utterance rather than a seam. Weight and opacity
   * are the clip's measured loudness at the instant that ring was emitted.
   *
   * The twelve small letters drift along the card's own outline, inset, and
   * each one brightens as a wavefront crosses it. They are drawn on the canvas
   * rather than as DOM nodes so the flash and the ring share one clock and one
   * coordinate system.
   *
   * Two things learned the hard way. There is NO alpha floor: adding a constant
   * to every ring's opacity made every ring render at similar weight and the
   * field read as wood grain, because the envelope's silences never became
   * gaps. And the wide glow pass takes a flat colour while only the crest pays
   * for the gradient -- a radial gradient evaluated across a 25px stroke at
   * this radius was once the most expensive thing on the page.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    var cv = need('heroRipple');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var AMP = HERO.amp, N = AMP.length;
    var RATE = N / HERO.seconds;   // bars a second: the clip's own clock
    // A ring per stressed syllable: an envelope peak at least 0.4 s after the
    // last one, so the waves are spaced by the rhythm of the sentence and the
    // field stays calm. Quiet bars and the analysis frame rate never show.
    var EMIT = [], last = -N;
    for (var b = 0; b < N; b++) {
      var v = AMP[b];
      if (v > 0.3 && v >= AMP[(b + N - 1) % N] && v > AMP[(b + 1) % N] && (b - last) / RATE >= 0.4) { EMIT.push(b); last = b; }
    }
    var LIFE = 8.75;               // seconds a ring takes to cross the card
    var REST = 1.8;                // the breath between two passes of the sentence
    var SPAN = HERO.seconds + REST;
    var W = 0, H = 0, ox = 0, oy = 0, reach = 0, letter = 0, box = null;
    var glyph = need('heroGlyphA');
    var INDIC = (typeof getComputedStyle === 'function' && getComputedStyle(document.documentElement).getPropertyValue('--indic')) || 'sans-serif';

    // Duotone: the near field is warm because that is where the energy is, and
    // the far field cools into the pack's teal so the rings read against a warm
    // ground instead of dissolving into it.

    function layout() {
      var r = cv.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(120, Math.round(r.width)); H = Math.max(90, Math.round(r.height));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The source is the centre of the featured letter, wherever the layout put it.
      if (glyph) {
        var g = glyph.getBoundingClientRect();
        ox = g.left - r.left + g.width / 2; oy = g.top - r.top + g.height / 2;
      } else { ox = 0; oy = H * 0.5; }
      reach = Math.sqrt(Math.max(ox, W - ox) * Math.max(ox, W - ox) + Math.max(oy, H - oy) * Math.max(oy, H - oy)) * 1.02;
      // The room the letters bounce in: the card, inset so a glyph never clips.
      var wide = W >= 700, inset = wide ? 26 : 16;
      letter = wide ? 26 : 18;
      box = { x0: inset, y0: inset, x1: W - inset, y1: H - inset };
      // Weighted to the right: on wide screens three letters in four keep to the
      // right part of the card, clear of the featured letter; the rest roam it all.
      LETTERS.forEach(function (_, j) { lo[j] = (wide && j % 4) ? box.x0 + (box.x1 - box.x0) * 0.42 : box.x0; });
      if (!pos.length) scatter();
      pos.forEach(function (q, j) { q[0] = Math.min(box.x1, Math.max(lo[j], q[0])); q[1] = Math.min(box.y1, Math.max(box.y0, q[1])); });
    }

    // The loudness right now, between bars, and zero during the rest.
    function level(t) {
      var u = t % SPAN;
      if (u >= HERO.seconds) return 0;
      var x = u * RATE, i = Math.floor(x), f = x - i;
      return AMP[i % N] * (1 - f) + AMP[(i + 1) % N] * f;
    }

    var pos = [], flash = [], born = {};
    // Each letter has its own heading and speed and wanders freely, bouncing off
    // the card's edges with a little squash on impact. A touch of random steer
    // every frame keeps the twelve from ever settling into a pattern.
    var vel = [], squash = [], lo = [], tPrev = 0;
    function scatter() {
      LETTERS.forEach(function (_, j) {
        var ang = Math.random() * Math.PI * 2, sp = 22 + Math.random() * 30;
        pos[j] = [lo[j] + Math.random() * (box.x1 - lo[j]), box.y0 + Math.random() * (box.y1 - box.y0)];
        vel[j] = [Math.cos(ang) * sp, Math.sin(ang) * sp];
        squash[j] = 0;
      });
    }
    function move(dt) {
      for (var j = 0; j < pos.length; j++) {
        var p = pos[j], v = vel[j];
        // Steer a little at random, then drift.
        var turn = (Math.random() - 0.5) * 0.9 * dt, c = Math.cos(turn), sn = Math.sin(turn);
        var vx = v[0] * c - v[1] * sn, vy = v[0] * sn + v[1] * c;
        v[0] = vx; v[1] = vy;
        p[0] += v[0] * dt; p[1] += v[1] * dt;
        // Bounce: reflect, keep the speed lively, and squash for a moment.
        if (p[0] < lo[j]) { p[0] = lo[j]; v[0] = Math.abs(v[0]) * (0.9 + Math.random() * 0.4); squash[j] = 1; }
        if (p[0] > box.x1) { p[0] = box.x1; v[0] = -Math.abs(v[0]) * (0.9 + Math.random() * 0.4); squash[j] = 1; }
        if (p[1] < box.y0) { p[1] = box.y0; v[1] = Math.abs(v[1]) * (0.9 + Math.random() * 0.4); squash[j] = 1; }
        if (p[1] > box.y1) { p[1] = box.y1; v[1] = -Math.abs(v[1]) * (0.9 + Math.random() * 0.4); squash[j] = 1; }
        // Hold the speed within a calm band so chaos never becomes frenzy.
        var sp = Math.sqrt(v[0] * v[0] + v[1] * v[1]), want = Math.min(56, Math.max(20, sp));
        if (sp > 0) { v[0] *= want / sp; v[1] *= want / sp; }
        squash[j] = Math.max(0, squash[j] - 3.2 * dt);
      }
    }
    function ring(age, a, s) {
      var k = age / LIFE;                          // 0 at the source, 1 at the rim
      var w = 0.35 + 0.65 * a;                     // every wave is whole; loud ones are heavier
      var fade = Math.min(1, k * 7) * Math.pow(1 - k, 1.1);
      if (fade < 0.01) return;
      var r = k * reach;
      // Each small letter lights up as this wavefront crosses it.
      for (var j = 0; j < pos.length; j++) {
        var d = Math.sqrt((pos[j][0] - ox) * (pos[j][0] - ox) + (pos[j][1] - oy) * (pos[j][1] - oy)) - r;
        var f = fade * w * 1.0 * Math.exp(-(d * d) / 600);
        if (f > flash[j]) flash[j] = f;
      }
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      // The wave's colour is graded by loudness: a quiet syllable is a pale
      // tint of the script's hue, a loud one the hue at full depth, and the
      // loudest lean darker still. Then it cools toward teal as it travels.
      var hue = rgb(s.hue);
      var base = a < 0.7 ? mix(WHITE, hue, 0.25 + 0.75 * a / 0.7) : mix(hue, BLACK, 0.22 * (a - 0.7) / 0.3);
      // A wide, soft body: the pressure itself, dispersing as it travels.
      ctx.globalAlpha = fade * 0.1 * w;
      ctx.lineWidth = (14 + 22 * w) * (1 + 1.6 * k);
      ctx.strokeStyle = css(mix(base, WHITE, 0.45));
      ctx.stroke();
      // The crest: one thin line the eye can follow, cooling as it travels.
      ctx.globalAlpha = fade * (0.26 + 0.14 * a) * w;
      ctx.lineWidth = 1 + 1.2 * w;
      ctx.strokeStyle = css(mix(base, TEAL, 0.6 * k));
      ctx.stroke();
      // Light on the leading edge, so the crest reads as a raised wave.
      ctx.beginPath();
      ctx.arc(ox, oy, r + 1.5, 0, Math.PI * 2);
      ctx.globalAlpha = fade * 0.5 * w;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = '#FFF7EE';
      ctx.stroke();
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      // Advance the letters by the time since the last frame.
      var n = LETTERS.length;
      move(Math.min(0.1, Math.max(0, t - tPrev))); tPrev = t;
      for (var j = 0; j < n; j++) flash[j] = 0;
      // Behind the featured letter: a warm glow that swells with the loudness of the moment.
      var a = level(t), sr = 60 + 120 * a, hue = SCRIPTS[heroActive].hue;
      var g = ctx.createRadialGradient(ox, oy, 0, ox, oy, sr);
      g.addColorStop(0, tint(hue, 0.5, 0.18 + 0.3 * a));
      g.addColorStop(0.5, tint(hue, 0.6, 0.06 + 0.14 * a));
      g.addColorStop(1, tint(hue, 0.6, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(ox - sr, oy - sr, sr * 2, sr * 2);
      // Rings, oldest first so the newest crests sit on top near the source.
      var p = Math.floor(t / SPAN);
      for (var q = p - 1; q <= p; q++) {
        if (q < 0) continue;
        for (var e = 0; e < EMIT.length; e++) {
          var i = EMIT[e], age = t - (q * SPAN + i / RATE), key = q * N + i;
          if (age < 0) continue;
          if (age >= LIFE) { delete born[key]; continue; }
          if (!(key in born)) born[key] = SCRIPTS[heroActive];
          ring(age, AMP[i], born[key]);
        }
      }
      // The twelve letters, loose in the card: the featured one lit, the others
      // quiet until a wavefront reaches them, and each squashing as it bounces.
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (j = 0; j < n; j++) {
        var L = LETTERS[j], hue = SCRIPTS[L.s].hue;
        var hot = L.s === heroActive ? 1 : 0, lit = Math.min(1, Math.max(hot, flash[j]));
        var size = letter * (1 + 0.42 * hot + 0.3 * Math.min(1, flash[j]) + 0.28 * squash[j]);
        ctx.font = '500 ' + size.toFixed(1) + 'px ' + INDIC;
        if (lit > 0.35) {
          ctx.globalAlpha = 0.3 * lit;
          ctx.fillStyle = tint(hue, 0.62);
          ctx.beginPath(); ctx.arc(pos[j][0], pos[j][1], size * 0.72, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 0.66 + 0.34 * lit;
        ctx.fillStyle = hue;
        ctx.fillText(L.glyph, pos[j][0], pos[j][1]);
      }
      ctx.globalAlpha = 1;
    }

    var running = false, visible = true, t0 = 0, painted = 0;
    var STEP = 1000 / 30;          // the field drifts slowly; 60fps buys nothing
    function frame(now) {
      if (!running) return;
      // Clamped: rAF reports the frame's START time, which can precede the
      // performance.now() captured just before the loop began. A negative
      // elapsed time here becomes a negative arc radius, which throws.
      if (visible && now - painted >= STEP) { painted = now; draw(Math.max(0, now - t0) / 1000); }
      requestAnimationFrame(frame);
    }
    layout();
    if (REDUCED) {
      draw(LIFE * 0.9);            // one settled frame, no loop
    } else {
      t0 = performance.now(); running = true;
      requestAnimationFrame(frame);
    }
    if (window.ResizeObserver) new ResizeObserver(function () { layout(); }).observe(cv);
    // The letters' faces may arrive after first paint and move the source.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); if (REDUCED) draw(LIFE * 0.9); });
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
    }

  })();

  /* ── Hero title: one span per word, staggered in on load ── */
  (function () {
    if (!need('heroTitle')) return;
    var h1 = document.getElementById('heroTitle');
    var words = h1.textContent.trim().split(/\s+/);
    var accentStart = Number(h1.dataset.accentStart);
    var accentEnd = Number(h1.dataset.accentEnd);
    var accentText = h1.dataset.accentText || '';
    h1.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w reveal';
      if (i >= accentStart && i <= accentEnd) span.classList.add('hero-title-accent');
      span.style.transitionDelay = 180 + i * 30 + 'ms';
      var accentAt = accentText ? w.indexOf(accentText) : -1;
      if (accentAt >= 0) {
        if (accentAt) span.appendChild(document.createTextNode(w.slice(0, accentAt)));
        var accent = document.createElement('span');
        accent.className = 'hero-title-accent';
        accent.textContent = accentText;
        span.appendChild(accent);
        if (accentAt + accentText.length < w.length) {
          span.appendChild(document.createTextNode(w.slice(accentAt + accentText.length)));
        }
      } else {
        span.textContent = w;
      }
      h1.appendChild(span);
      // A trailing space inside an inline-block is dropped, so the gap goes
      // between the boxes as its own text node.
      if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        h1.querySelectorAll('.w').forEach(function (w) { w.classList.add('in-view'); });
      });
    });
  })();

  /* ── Reading progress and back to top ── */
  (function () {
    if (!need('progress')) return;
    var bar = document.getElementById('progress');
    var top = document.getElementById('top-btn');
    var shown = false;
    function onScroll() {
      var h = document.documentElement;
      var p = h.scrollTop / (h.scrollHeight - h.clientHeight) || 0;
      bar.style.transform = 'scaleX(' + p + ')';
      // Only touch the class when the state actually changes: a write on every
      // scroll event invalidates style for nothing.
      var want = window.scrollY > 600;
      if (want !== shown) { shown = want; top.classList.toggle('show', want); }
    }
    var scrollQueued = false;
    function queueScroll() {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(function () { scrollQueued = false; onScroll(); });
    }
    document.addEventListener('scroll', queueScroll, { passive: true });
    onScroll();
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  })();

  /* ── Scroll motion hierarchy ─────────────────────────────────────────────
   * The old page moved every large block upward by the same amount. That made a
   * section heading, a paragraph and a chart feel equally important. Motion now
   * follows structure: rules draw, copy settles, exhibits lift, repeated items
   * cascade. Every target runs once and the no-JS page remains visible because
   * these classes are added only here.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    var targets = [];
    function add(selector, kind) {
      document.querySelectorAll(selector).forEach(function (target) {
        if (targets.indexOf(target) >= 0) return;
        target.classList.add('reveal', kind);
        targets.push(target);
      });
    }
    add('.research-prose > .act, .research-prose > section > header', 'reveal-rule');
    add('.chart-card, .editorial-card, #outlook > .pull-note', 'reveal-card');
    add('.research-feature-grid, .research-bullet-block, .roadmap', 'reveal-stagger');
    add('#flowDiagram', 'reveal-flow');

    if (REDUCED || !window.IntersectionObserver) {
      targets.forEach(function (t) { t.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -7% 0px' });
    targets.forEach(function (t) { io.observe(t); });
    window.addEventListener('beforeprint', function () {
      targets.forEach(function (t) { t.classList.add('in-view'); });
    });
  })();

  /* ── Table of contents: hover-expanding rail on wide screens, pills below ── */
  (function () {
    if (!need('tocRail')) return;
    var sections = Array.prototype.slice.call(document.querySelectorAll('.research-prose > section[data-toc]'));
    var rail = document.getElementById('tocRail');
    var railList = rail.querySelector('ul');
    var pillList = document.querySelector('#tocPills ul');
    var ticks = {}, pills = {};
    sections.forEach(function (s) {
      var label = s.getAttribute('data-toc');
      var li = document.createElement('li');
      li.innerHTML = '<button type="button" class="toc-tick"><span class="toc-tick-mark" aria-hidden="true"></span><span class="toc-tick-label"></span></button>';
      li.querySelector('.toc-tick-label').textContent = label;
      li.querySelector('button').addEventListener('click', function () { go(s); });
      railList.appendChild(li);
      ticks[s.id] = li.querySelector('button');

      var li2 = document.createElement('li');
      var b2 = document.createElement('button');
      b2.type = 'button'; b2.className = 'toc-pill'; b2.textContent = label;
      b2.addEventListener('click', function () { go(s); });
      li2.appendChild(b2); pillList.appendChild(li2);
      pills[s.id] = b2;
    });
    function go(s) {
      s.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      setActive(s.id);
    }
    function setActive(id) {
      Object.keys(ticks).forEach(function (k) {
        ticks[k].classList.toggle('is-active', k === id);
        pills[k].classList.toggle('is-active', k === id);
        if (k === id) { ticks[k].setAttribute('aria-current', 'true'); pills[k].setAttribute('aria-current', 'true'); }
        else { ticks[k].removeAttribute('aria-current'); pills[k].removeAttribute('aria-current'); }
      });
    }
    sections.forEach(function (s) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) setActive(s.id);
      }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 }).observe(s);
    });
    setActive(sections[0].id);
    function expand(on) { rail.classList.toggle('is-expanded', on); }
    document.getElementById('tocZone').addEventListener('mouseenter', function () { expand(true); });
    rail.addEventListener('mouseenter', function () { expand(true); });
    rail.addEventListener('mouseleave', function () { expand(false); });
  })();

  /* ── Numbers from the benchmark ── */
  put('spec-judge', fmt(D.overall.judge) + ' / 5');
  put('cb-native', fmt(D.overall.native));
  put('cb-cross', fmt(D.overall.cross));
  put('mn-native', fmt(D.overall.native));
  put('mn-cross', fmt(D.overall.cross));
  put('mn-fail', fmt(D.overall.pct_le2) + '%');
  // the spread across voices, derived rather than typed: it is the third of the
  // three numbers the card is about
  var jv = Object.keys(D.voices).map(function (n) { return D.voices[n].judge; })
    .filter(function (x) { return x != null; });
  put('mn-spread', fmt(Math.min.apply(null, jv)) + ' to ' + fmt(Math.max.apply(null, jv)));
  put('cb-top', D.top_cross.map(function (t) {
    return t[0] + ' (' + LANGNAME[D.voices[t[0]].lang] + ')';
  }).join(', '));

  /* ── Voice library ────────────────────────────────────────────────────────
   * All 45 voices placed by register and pace. This replaced a schematic map of
   * India that carried one marker per language. That map was the wrong picture
   * twice over: we hold no language-geography data, so every position was an
   * invention, and a language is not a point -- Hindi is a belt of states, Sindhi
   * in India is a diaspora, Sanskrit has no speech community at all. Pitch and
   * pace are measured, they are what a reader picking a voice actually needs, and
   * they make no claim about territory.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    if (!need('vsChart')) return;
    var svg = document.getElementById('vsChart');
    var tip = document.getElementById('vsTip');
    var wrap = document.getElementById('voiceSpace');
    var FEM = '#C2410C', MAL = '#0F766E';

    var names = Object.keys(D.voices).sort();
    var sample = {};
    CLIPS.voices.forEach(function (c) { sample[c.voice] = c; });
    var player = document.getElementById('vsPlayer');

    var W = 760, H = 470, L = 58, R = 18, T = 14, B = 46;
    var xLo = 9, xHi = 15, yLo = 100, yHi = 300;     // chars/s and Hz
    function sx(v) { return L + ((v - xLo) / (xHi - xLo)) * (W - L - R); }
    function sy(v) { return H - B - ((v - yLo) / (yHi - yLo)) * (H - B - T); }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    // grid and axes
    [100, 150, 200, 250, 300].forEach(function (hz) {
      svg.appendChild(el('line', { x1: L, x2: W - R, y1: sy(hz), y2: sy(hz), stroke: 'var(--gridline)', 'stroke-width': hz === yLo ? 1 : 0.7 }));
      svg.appendChild(el('text', { x: L - 8, y: sy(hz) + 3.5, 'text-anchor': 'end', 'class': 'axis-tick' }, hz + ' Hz'));
    });
    [9, 10, 11, 12, 13, 14, 15].forEach(function (cps) {
      svg.appendChild(el('line', { x1: sx(cps), x2: sx(cps), y1: T, y2: H - B, stroke: 'var(--gridline)', 'stroke-width': 0.7, 'stroke-dasharray': '2 3' }));
      svg.appendChild(el('text', { x: sx(cps), y: H - B + 15, 'text-anchor': 'middle', 'class': 'axis-tick' }, cps));
    });
    svg.appendChild(el('text', { x: (L + W - R) / 2, y: H - B + 34, 'text-anchor': 'middle', 'class': 'vs-axis' }, 'pace, characters per second, each in its own language  →'));
    svg.appendChild(el('text', { x: 13, y: (T + H - B) / 2, 'text-anchor': 'middle', 'class': 'vs-axis',
      transform: 'rotate(-90 13 ' + ((T + H - B) / 2) + ')' }, 'register, median pitch  →'));

    // Points first, then labels placed greedily around them: 45 names in one plot
    // collide unless each is offered several directions and takes the first free one.
    var pts = names.map(function (n) {
      var v = D.voices[n];
      return { name: n, v: v, x: sx(v.cps), y: sy(v.hz), fem: v.gender === 'female', clip: sample[n] };
    });
    var Rm = 5.2, boxes = pts.map(function (p) { return [p.x - Rm, p.y - Rm, p.x + Rm, p.y + Rm]; });
    var CW = 5.1, LH = 11, GAP = 1.5;
    pts.forEach(function (p) {
      var w = p.name.length * CW, placed = null;
      var dirs = [[Rm + 4, 4, 'start'], [-(Rm + 4), 4, 'end'], [Rm + 3, -6, 'start'], [-(Rm + 3), -6, 'end'],
                  [Rm + 3, 13, 'start'], [-(Rm + 3), 13, 'end'], [0, -9, 'middle'], [0, 17, 'middle'],
                  // Second ring, further out: the top-centre cluster is dense enough
                  // that eight directions left one name sitting on another.
                  [Rm + 12, 4, 'start'], [-(Rm + 12), 4, 'end'], [Rm + 10, -12, 'start'], [-(Rm + 10), -12, 'end'],
                  [0, -20, 'middle'], [0, 26, 'middle'], [Rm + 10, 20, 'start'], [-(Rm + 10), 20, 'end']];
      for (var i = 0; i < dirs.length; i++) {
        var lx = p.x + dirs[i][0], ly = p.y + dirs[i][1], a = dirs[i][2];
        var x0 = a === 'start' ? lx : (a === 'end' ? lx - w : lx - w / 2);
        var box = [x0 - GAP, ly - LH + GAP, x0 + w + GAP, ly + GAP];
        if (box[0] < L - 6 || box[2] > W - R + 6 || box[1] < T || box[3] > H - B) continue;
        var hit = boxes.some(function (b) { return box[0] < b[2] && b[0] < box[2] && box[1] < b[3] && b[1] < box[3]; });
        if (!hit) { placed = [lx, ly, a, box]; break; }
      }
      if (!placed) { placed = [p.x + Rm + 4, p.y + 4, 'start', [p.x, p.y, p.x + w, p.y + LH]]; p.crowded = true; }
      p.lx = placed[0]; p.ly = placed[1]; p.anchor = placed[2];
      boxes.push(placed[3]);
    });

    pts.forEach(function (p) {
      var g = el('g', { 'class': 'vs-pt' + (p.clip ? ' has-clip' : ''), tabindex: '0', role: 'button',
        'aria-label': p.name + ', ' + p.v.gender + ', ' + LANGNAME[p.v.lang] + ', ' + p.v.hz + ' hertz, ' + p.v.cps + ' characters per second' });
      var col = p.fem ? FEM : MAL;
      // A 4px dot is too small to hover reliably and hopeless on touch, so each
      // point carries an invisible hit area.
      g.appendChild(el('circle', { 'class': 'vs-hit', cx: p.x, cy: p.y, r: 12 }));
      g.appendChild(el('circle', { 'class': 'vs-ring', cx: p.x, cy: p.y, r: 7.4, stroke: col }));
      if (p.fem) g.appendChild(el('circle', { 'class': 'vs-dot', cx: p.x, cy: p.y, r: 4.4, fill: col }));
      else g.appendChild(el('rect', { 'class': 'vs-dot', x: p.x - 3.9, y: p.y - 3.9, width: 7.8, height: 7.8, fill: col }));
      g.appendChild(el('text', { 'class': 'vs-label', x: p.lx, y: p.ly, 'text-anchor': p.anchor }, p.name));
      svg.appendChild(g);

      function show() {
        // Only 10 of the 22 languages are in the benchmark, so 24 voices have no rows
        // in their own language. Label their score for what it is rather than
        // captioning a cross-lingual aggregate as "own language".
        var rows = p.v.judge_native != null
          ? '<div class="tt-row"><span>judge, own language</span><b>' + fmt(p.v.judge_native) + ' / 5</b></div>' +
            '<div class="tt-row"><span>judge, other languages</span><b>' + fmt(p.v.judge_cross) + ' / 5</b></div>'
          : '<div class="tt-row"><span>judge, benchmark languages</span><b>' + fmt(p.v.judge) + ' / 5</b></div>';
        tip.innerHTML = '<div class="tt-lang">' + esc(p.name) + '</div>' +
          '<div class="tt-row"><span>' + p.v.gender + ' · ' + LANGNAME[p.v.lang] + '</span><b>' +
          p.v.hz + ' Hz · ' + p.v.cps + ' ch/s</b></div>' + rows +
          '<p class="tt-desc">' + esc(p.v.desc).replace(/\*Best for:\*/, '<em>Best for:</em>') + '</p>' +
          (p.clip ? '<p class="tt-hint">click to play</p>' : '');
        var box = svg.getBoundingClientRect();
        var px = (p.x / W) * box.width, py = (p.y / H) * box.height;
        tip.style.left = Math.max(4, Math.min(px + 14, box.width - 250)) + 'px';
        tip.style.top = Math.max(4, py - 12) + 'px';
        tip.classList.add('show');
        svg.querySelectorAll('.vs-pt').forEach(function (o) { o.classList.remove('is-active'); });
        g.classList.add('is-active');
      }
      function hide() { tip.classList.remove('show'); g.classList.remove('is-active'); }
      g.addEventListener('mouseenter', show);
      g.addEventListener('focus', show);
      g.addEventListener('pointerdown', show);      // touch: no hover to rely on
      g.addEventListener('mouseleave', hide);
      g.addEventListener('blur', hide);
      if (p.clip) {
        g.addEventListener('click', function () {
          // The player is one element reused by all 45 points, so 45 audio elements
          // are never created and nothing preloads until a voice is asked for.
          player.hidden = false;
          player.innerHTML = '<div class="vs-player-who"><b>' + esc(p.name) + '</b>' +
            '<span>' + p.v.gender + ' · ' + LANGNAME[p.v.lang] + ' voice · ~' + p.v.hz +
            ' Hz · ' + p.v.cps + ' chars/s</span></div>' +
            '<div class="vs-player-slot"></div>' +
            '<p class="vs-player-desc">' + esc(p.v.desc).replace(/\*Best for:\*/, '<em>Best for:</em>') + '</p>';
          var pl = makePlayer(p.clip.file);
          var slot = player.querySelector('.vs-player-slot');
          if (slot) slot.appendChild(pl);
          // clicking a point is an explicit request to hear it, so start at once
          pl.querySelector('audio').play().catch(function () { /* autoplay blocked */ });
          svg.querySelectorAll('.vs-pt').forEach(function (o) { o.classList.remove('is-playing'); });
          g.classList.add('is-playing');
        });
        g.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.dispatchEvent(new Event('click')); }
        });
      }
    });
    wrap.dataset.crowded = pts.filter(function (p) { return p.crowded; }).length;
  })();

  /* ── Cross-lingual A/B ────────────────────────────────────────────────────
   * Per language, one sentence read by a native voice and by a voice from
   * elsewhere, both scored 5 by the judge. Selected by src/clipgen.py from the
   * benchmark run, so every reading here has a row and a score behind it.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    if (!need('abTabs')) return;
    var bar = document.getElementById('abTabs');
    var panels = document.getElementById('abPanels');
    var byLang = {};
    CLIPS.ab.forEach(function (c) { (byLang[c.lang] = byLang[c.lang] || []).push(c); });
    var codes = Object.keys(byLang).sort(function (a, b) { return LANGNAME[a] < LANGNAME[b] ? -1 : 1; });

    function hydrate(panel) {
      if (panel.dataset.hydrated) return;
      panel.querySelectorAll('.ab-player').forEach(function (h) {
        if (h) h.appendChild(makePlayer(h.dataset.src));
      });
      panel.dataset.hydrated = 'true';
    }

    codes.forEach(function (code, i) {
      var active = code === 'hi';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-tab' + (active ? ' is-active' : '');
      btn.dataset.lang = code;
      btn.textContent = LANGNAME[code];
      btn.setAttribute('aria-expanded', active ? 'true' : 'false');
      bar.appendChild(btn);

      var panel = document.createElement('div');
      panel.className = 'ab-panel' + (active ? ' is-active' : '');
      panel.dataset.lang = code;
      panel.id = 'ab-panel-' + code;
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
      btn.setAttribute('aria-controls', panel.id);

      var pair = byLang[code];
      var rtl = RTL[code] ? ' rtl' : '';
      // The sentence once, above both players: it is the same text, and printing it
      // twice would suggest otherwise.
      panel.innerHTML = '<p class="ab-text indic' + rtl + '">' + esc(pair[0].text) + '</p>' +
        '<div class="ab-pair">' + pair.map(function (c) {
          return '<div class="ab-side' + (c.native ? ' is-native' : '') + '">' +
            '<div class="ab-who"><b>' + esc(c.voice) + '</b>' +
            '<span class="ab-tag">' + (c.native
              ? 'native ' + LANGNAME[code] + ' voice'
              : LANGNAME[c.voice_lang] + ' voice reading ' + LANGNAME[code]) + '</span></div>' +
            '<div class="ab-player" data-src="' + esc(c.file) + '"></div>' +
            '<span class="ab-meta">judge ' + c.judge + ' / 5</span>' +
            '</div>';
        }).join('') + '</div>';
      panels.appendChild(panel);
      if (active) hydrate(panel);

      btn.addEventListener('click', function () {
        bar.querySelectorAll('.lang-tab').forEach(function (o) {
          o.classList.remove('is-active'); o.setAttribute('aria-expanded', 'false');
        });
        panels.querySelectorAll('.ab-panel').forEach(function (p) {
          p.classList.remove('is-active');
          p.setAttribute('aria-hidden', 'true');
          p.querySelectorAll('audio').forEach(function (au) { au.pause(); });
        });
        hydrate(panel);
        btn.classList.add('is-active'); btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-active');
        panel.setAttribute('aria-hidden', 'false');
      });
    });
  })();

  /* ── Recommendation table ── */
  (function () {
    if (!need('recTable')) return;
    var tb = document.querySelector('#recTable tbody');
    function row(l) {
      function cell(names) {
        return names.map(function (n) {
          var v = D.voices[n];
          return '<b>' + esc(n) + '</b><span class="vmeta">~' + v.hz + ' Hz · ' + v.cps + ' chars/s · ' +
            esc(v.desc.split('.')[0]) + '</span>';
        }).join('');
      }
      var natives = l.female.concat(l.male).map(function (n) { return D.voices[n].judge_native; })
        .filter(function (x) { return x != null; });
      var judge = natives.length
        ? fmt(natives.reduce(function (a, b) { return a + b; }, 0) / natives.length)
        : '—';
      return '<tr><td><b>' + esc(l.name) + '</b><span class="vmeta">' + esc(l.script) + '</span></td>' +
        '<td>' + cell(l.female) + '</td><td>' + cell(l.male) + '</td>' +
        '<td class="num">' + judge + '</td></tr>';
    }
    // Scored languages first: those are the ones whose recommendation is backed by
    // a measurement, so a reader comparing voices should meet them before the rest.
    var scored = D.languages.filter(function (l) { return l.benchmarked; });
    var rest = D.languages.filter(function (l) { return !l.benchmarked; });
    function group(label, n) {
      return '<tr class="group-row"><td colspan="4">' + label +
        '<span class="group-count">' + n + ' languages</span></td></tr>';
    }
    tb.innerHTML = group('Scored in the benchmark', scored.length) + scored.map(row).join('') +
      group('Supported, not yet scored', rest.length) + rest.map(row).join('');
  })();

  /* ── Clip browser ── */
  (function () {
    if (!need('clipTabs')) return;
    var bar = document.getElementById('clipTabs');
    var panels = document.getElementById('clipPanels');
    var byLang = {};
    D.clips.filter(function (c) { return !c.kind; }).forEach(function (c) {
      (byLang[c.lang] = byLang[c.lang] || []).push(c);
    });
    var codes = Object.keys(byLang).sort(function (a, b) { return LANGNAME[a] < LANGNAME[b] ? -1 : 1; });

    function hydrate(panel) {
      if (panel.dataset.hydrated) return;
      panel.querySelectorAll('.clip').forEach(function (el2) {
        var slot = el2.querySelector('.clip-player');
        if (slot) slot.appendChild(makePlayer(el2.dataset.src));
      });
      panel.dataset.hydrated = 'true';
    }

    codes.forEach(function (code) {
      var active = code === 'hi';
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'lang-tab' + (active ? ' is-active' : '');
      btn.dataset.lang = code; btn.textContent = LANGNAME[code];
      btn.setAttribute('aria-expanded', active ? 'true' : 'false');
      bar.appendChild(btn);

      var panel = document.createElement('div');
      panel.className = 'clip-panel' + (active ? ' is-active' : '');
      panel.dataset.lang = code;
      panel.id = 'clip-panel-' + code;
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
      btn.setAttribute('aria-controls', panel.id);
      panel.innerHTML = byLang[code].sort(function (a, b) { return a.gender < b.gender ? -1 : 1; })
        .map(function (c) {
          var v = D.voices[c.voice];
          var rtl = RTL[code] ? ' rtl' : '';
          var spoken = c.text !== c.text_raw
            ? '<p class="txt txt-spoken indic' + rtl + '"><span class="tag-k">spoken as</span>' + esc(c.text) + '</p>'
            : '';
          return '<div class="clip" data-src="' + esc(c.file) + '"><div class="clip-who"><b>' + esc(c.voice) + '</b>' +
            '<span>' + (v.gender === 'female' ? 'female' : 'male') + ' · ' + LANGNAME[v.lang] + ' native</span></div>' +
            '<div class="clip-player"></div>' +
            '<p class="txt indic' + rtl + '">' + esc(c.text_raw) + '</p>' + spoken +
            '<span class="judge-chip">judge ' + c.judge + ' / 5</span></div>';
        }).join('');
      panels.appendChild(panel);
      if (active) hydrate(panel);

      btn.addEventListener('click', function () {
        bar.querySelectorAll('.lang-tab').forEach(function (b) {
          b.classList.remove('is-active'); b.setAttribute('aria-expanded', 'false');
        });
        panels.querySelectorAll('.clip-panel').forEach(function (p) {
          p.classList.remove('is-active'); p.setAttribute('aria-hidden', 'true');
          p.querySelectorAll('audio').forEach(function (au) { au.pause(); });
        });
        hydrate(panel);
        btn.classList.add('is-active'); btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-active');
        panel.setAttribute('aria-hidden', 'false');
      });
    });
  })();

  /* ── Style tags ── */
  (function () {
    if (!need('styleGrid')) return;
    // The fourteen come from src/styles.json, which src/apigen.py derives from the
    // contract and splits into contexts and emotions. Typing them here is how a
    // list that claims to be exact drifts.
    var S = blob('style-data', null);
    if (!S) return;
    var ITEMS = S.context.concat(S.emotion);
    var host = document.getElementById('styleGrid');
    // ── A mark for each delivery ──────────────────────────────────────────
    // Two families, because the list divides in two: the contexts get the object
    // the speech is going into -- a broadcast mast, a megaphone, a kite -- and the
    // emotions get a face, since an emotion has no object. Drawn on one 24-unit
    // grid in currentColor, so a tab's mark inverts with it when it goes active.
    var FACE = '<circle cx="12" cy="12" r="9.2"/>';
    var ICONS = {
      // context
      'AIR style news': '<path d="M12 9v12"/><path d="M8 21h8"/><circle cx="12" cy="7.4" r="1.5"/>' +
        '<path d="M8.7 4.6a6 6 0 0 0 0 5.6"/><path d="M15.3 4.6a6 6 0 0 1 0 5.6"/>' +
        '<path d="M6.2 2.4a9.5 9.5 0 0 0 0 10"/><path d="M17.8 2.4a9.5 9.5 0 0 1 0 10"/>',
      'advertisements': '<path d="M3 10.5v3a1 1 0 0 0 1 1h3l6 4V5.5l-6 4H4a1 1 0 0 0-1 1z"/>' +
        '<path d="M17 9.5a4.2 4.2 0 0 1 0 5"/><path d="M19.6 7a7.6 7.6 0 0 1 0 10"/>',
      "children's stories": '<path d="M12 2.5 18.5 9 12 15.5 5.5 9z"/><path d="M12 15.5V21"/>' +
        '<path d="M12 17.6c-1.5.4-1.5 1.6 0 2s1.5 1.6 0 2"/><path d="M5.5 9h13"/>',
      'educational lecture': '<path d="M12 4 2.5 8 12 12l9.5-4z"/>' +
        '<path d="M6 10.4V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.6"/><path d="M21.5 8v5.5"/>',
      'single person narration audiobook':
        '<path d="M4 5.5h6a2 2 0 0 1 2 2v12a2.2 2.2 0 0 0-2-1.6H4z"/>' +
        '<path d="M20 5.5h-6a2 2 0 0 0-2 2v12a2.2 2.2 0 0 1 2-1.6h6z"/>',
      'Customer Care': '<path d="M4 13.6v-1.4a8 8 0 0 1 16 0v1.4"/>' +
        '<path d="M4 13.2h2.6v5H5.6a1.6 1.6 0 0 1-1.6-1.6z"/>' +
        '<path d="M20 13.2h-2.6v5h1a1.6 1.6 0 0 0 1.6-1.6z"/>' +
        '<path d="M17.4 18.2v.6a2 2 0 0 1-2 2h-2.6"/>',
      // emotion
      'anger': FACE + '<path d="M7.8 8.6 10.6 10"/><path d="M16.2 8.6 13.4 10"/>' +
        '<path d="M9.6 12.3h.02"/><path d="M14.4 12.3h.02"/><path d="M8.6 16.8a5 5 0 0 1 6.8 0"/>',
      'disgust': FACE + '<path d="M8 10.6h2.6"/><path d="M13.4 10.6H16"/>' +
        '<path d="M8.4 15.9c.9-1.1 1.8-1.1 2.7 0s1.8 1.1 2.7 0 1.4-.6 1.8 0"/>',
      'fear': FACE + '<circle cx="9.6" cy="11.4" r="1.35"/><circle cx="14.4" cy="11.4" r="1.35"/>' +
        '<path d="M7.4 8.4a3 3 0 0 1 3-.9"/><path d="M16.6 8.4a3 3 0 0 0-3-.9"/>' +
        '<ellipse cx="12" cy="16.5" rx="1.9" ry="2.2"/>',
      'happy': FACE + '<path d="M9.5 10.6h.02"/><path d="M14.5 10.6h.02"/>' +
        '<path d="M8 14.4a5 5 0 0 0 8 0"/>',
      'sad': FACE + '<path d="M9.5 10.6h.02"/><path d="M14.5 10.6h.02"/>' +
        '<path d="M8.4 17a5 5 0 0 1 7.2 0"/><path d="M8.7 13.4a2.6 2.6 0 0 0 0 2.6"/>',
      'surprise': FACE + '<circle cx="9.6" cy="11.2" r="1.2"/><circle cx="14.4" cy="11.2" r="1.2"/>' +
        '<path d="M7.6 8a2.8 2.8 0 0 1 2.8-.9"/><path d="M16.4 8a2.8 2.8 0 0 0-2.8-.9"/>' +
        '<circle cx="12" cy="16.6" r="1.9"/>'
    };
    var ICON = function (name) {
      var d = ICONS[name];
      return d ? '<svg class="sx-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
        'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ' +
        'stroke-linejoin="round">' + d + '</svg>' : '';
    };

    var ARROW = function (d) {
      return '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="none" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="' +
        (d < 0 ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5') + '"/></svg>';
    };

    // The rail is grouped because the grouping is this section's one structural
    // claim: a value either names a context the speech is going into or an
    // emotion it carries. The panel plays one at a time; the pager walks them.
    host.innerHTML =
      '<div class="sx-explorer">' +
        '<nav class="sx-rail" id="styleMenu" aria-label="Choose a delivery style"></nav>' +
        '<div class="sx-panel">' +
          '<div class="sx-body" id="stylePanel" aria-live="polite"></div>' +
          '<div class="sx-pager">' +
            '<button type="button" class="style-step" id="stylePrev" aria-label="Previous style">' + ARROW(-1) + '</button>' +
            '<span class="n" id="styleAt"></span>' +
            '<button type="button" class="style-step" id="styleNext" aria-label="Next style">' + ARROW(1) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var menu = document.getElementById('styleMenu');
    var panel = document.getElementById('stylePanel');
    var count = document.getElementById('styleAt');
    var at = 0;

    var base = 0;
    [['Context', S.context], ['Emotion', S.emotion]].forEach(function (grp) {
      var h = document.createElement('p');
      h.className = 'sx-group';
      h.textContent = grp[0];
      menu.appendChild(h);
      grp[1].forEach(function (row, n) {
        var i = base + n;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sx-tab style-pick';
        // A card can carry more than one sendable value -- AIR and TV share this
        // one -- so the tab counts them rather than implying there is only one.
        b.innerHTML = ICON(row.values[0]) + '<span class="sx-tab-t">' + esc(row.values[0]) + '</span>' +
          (row.values.length > 1 ? '<i class="sx-tab-x">+' + (row.values.length - 1) + '</i>' : '');
        b.setAttribute('aria-expanded', 'false');
        b.addEventListener('click', function () { show(i); });
        menu.appendChild(b);
      });
      base += grp[1].length;
    });

    function stop() {
      panel.querySelectorAll('audio').forEach(function (a) { a.pause(); });
    }

    function show(i) {
      stop();
      at = (i + ITEMS.length) % ITEMS.length;
      var row = ITEMS[at];
      menu.querySelectorAll('.style-pick').forEach(function (b, n) {
        b.classList.toggle('is-active', n === at);
        b.setAttribute('aria-expanded', n === at ? 'true' : 'false');
      });
      var head = row.values.map(function (v) { return '<code>' + esc(v) + '</code>'; }).join('');
      count.textContent = (at + 1) + ' / ' + ITEMS.length;
      // What the value IS sits at the top of the panel; what it SOUNDS LIKE sits in
      // its own card below, centred in whatever height is left over. The two are
      // different kinds of thing and the reader is here for the second one.
      var body = '<div class="sx-head">' +
        '<p class="style-kind">' + esc(row.kind) + '</p>' +
        '<p class="style-values">' + head + '</p>' +
        (row.note ? '<p class="style-note">' + row.note + '</p>' : '') +
        '</div>';
      var ex = '';
      if (row.sample) {
        // The same player every other clip on the page gets: real waveform, scrub,
        // clock and rate. A supplied clip may arrive with no recorded scenario or
        // transcript, and then the card carries the audio alone rather than
        // something invented to sit beside it.
        ex = '<p class="style-scene">' + esc(row.sample.title || 'listen') + '</p>' +
          '<div class="style-player" data-src="' + esc(row.sample.file) + '"></div>';
        if (row.sample.text) {
          ex += '<p class="style-line' + (row.sample.lang === 'en' ? '' : ' indic') +
            '" lang="' + esc(row.sample.lang || '') + '">' + esc(row.sample.text) + '</p>';
        }
      } else if (row.values[0] === 'single person narration audiobook') {
        // This register is already being spoken further up the page, so the control
        // takes you to that player rather than repeating the chapter here.
        ex = '<p class="style-none"><button type="button" class="style-goto">' +
          'hear it in section 01 &rarr;</button></p>';
      } else {
        ex = '<p class="style-none">no sample yet</p>';
      }
      panel.innerHTML = body + '<div class="sx-example">' + ex + '</div>';

      var goto = panel.querySelector('.style-goto');
      if (goto) {
        goto.addEventListener('click', function () {
          var target = document.getElementById('longform');
          if (!target) return;
          target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
        });
      }

      var slot = panel.querySelector('.style-player');
      if (slot) slot.appendChild(makePlayer(slot.dataset.src));
    }

    document.getElementById('stylePrev').addEventListener('click', function () { show(at - 1); });
    document.getElementById('styleNext').addEventListener('click', function () { show(at + 1); });
    show(0);
  })();

  /* ── Normaliser showcase ──────────────────────────────────────────────────
   * Groups of written-then-spoken pairs, captured from the normaliser itself by
   * src/normgen.py. The written form is monospaced because that is how it arrives
   * (LaTeX, an account number); the spoken form is set in the reading face because
   * that is what the model receives.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    if (!need('normTabs')) return;
    var bar = document.getElementById('normTabs');
    var panels = document.getElementById('normPanels');
    var hindi = document.getElementById('normHindi');

    function caseMarkup(c) {
      return '<div class="norm-case">' +
        '<p class="norm-note">' + esc(c.note) + '</p>' +
        '<div class="norm-io"><span class="norm-k">written</span>' +
        '<code class="norm-written">' + esc(c.text) + '</code></div>' +
        '<div class="norm-io"><span class="norm-k">spoken</span>' +
        '<span class="norm-spoken indic">' + esc(c.spoken) + '</span></div>' +
        '</div>';
    }

    hindi.innerHTML =
      '<div class="io-line"><span class="k">as written</span><span class="v indic">' + esc(NORM.hindi.text) + '</span></div>' +
      '<div class="io-line"><span class="k">default</span><span class="v indic">' + esc(NORM.hindi.default) + '</span></div>' +
      '<div class="io-line"><span class="k">number_lang=hi</span><span class="v indic">' + esc(NORM.hindi.forced) + '</span></div>';
    hindi.hidden = false;

    NORM.groups.forEach(function (group, i) {
      var active = i === 0;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-tab' + (active ? ' is-active' : '');
      btn.textContent = group;
      btn.setAttribute('aria-expanded', active ? 'true' : 'false');
      bar.appendChild(btn);

      var panel = document.createElement('div');
      panel.className = 'norm-panel' + (active ? ' is-active' : '');
      panel.id = 'norm-panel-' + i;
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
      btn.setAttribute('aria-controls', panel.id);
      var groupCases = NORM.cases.filter(function (c) { return c.group === group; });
      panel.innerHTML = caseMarkup(groupCases[0]);

      var more = document.createElement('details');
      more.className = 'norm-details';
      var summary = document.createElement('summary');
      summary.textContent = 'More examples';
      var count = document.createElement('span');
      count.className = 'norm-summary-count';
      count.textContent = groupCases.length > 1 ? '(' + (groupCases.length - 1) + ')' : '';
      summary.appendChild(count);
      more.appendChild(summary);
      var body = document.createElement('div');
      body.className = 'norm-details-body';
      body.innerHTML = groupCases.slice(1).map(caseMarkup).join('');
      if (group === 'Money and dates') {
        var note = document.createElement('p');
        note.className = 'norm-language-note';
        note.textContent = 'The caller also chooses which language speaks the numbers. Here is the same Hindi sentence with the default and with Hindi explicitly selected.';
        body.appendChild(note);
        body.appendChild(hindi);
      }
      more.appendChild(body);
      panel.appendChild(more);
      panels.appendChild(panel);

      btn.addEventListener('click', function () {
        bar.querySelectorAll('.lang-tab').forEach(function (o) {
          o.classList.remove('is-active'); o.setAttribute('aria-expanded', 'false');
        });
        panels.querySelectorAll('.norm-panel').forEach(function (o) {
          o.classList.remove('is-active'); o.setAttribute('aria-hidden', 'true');
        });
        btn.classList.add('is-active'); btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-active');
        panel.setAttribute('aria-hidden', 'false');
      });
    });

  })();

  /* ── Long-form clip ── */
  (function () {
    if (!need('longform')) return;
    var lf = D.clips.filter(function (c) { return c.kind === 'longform'; })[0];
    if (!lf) return;
    var mins = Math.floor(lf.dur / 60) + ':' + ('0' + Math.round(lf.dur % 60)).slice(-2);
    document.getElementById('longform').innerHTML =
      '<div class="clip"><div class="clip-who"><b>' + esc(lf.voice) + '</b><span>male · Tamil native</span>' +
      '<span class="clip-dur">' + mins + '</span><span> · ' + lf.paragraphs.length + ' paragraphs</span></div>' +
      '<div class="lf-player" data-src="' + esc(lf.file) + '"></div>' +
      '<p class="txt indic">' + esc(lf.paragraphs[0]) + '</p>' +
      '<details class="chart-data"><summary class="chart-data-toggle">Expand to listen to the full audio</summary>' +
      '<ol class="para-list indic">' + lf.paragraphs.slice(1).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') +
      '</ol></details></div>';
    var lfh = document.querySelector('#longform .lf-player');
    if (lfh) lfh.appendChild(makePlayer(lfh.dataset.src));
  })();

  /* ── Vocabulary band ──────────────────────────────────────────────────────
   * The 156,960 entries the model can emit, to scale. Ranges are from
   * docs/KT.md section 2.5. Drawn to scale on purpose: the point a reader should
   * take is that audio is a minority of the vocabulary and sits inside it, and a
   * schematic with equal-width blocks would say the opposite.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    if (!need('vocabBand')) return;
    var V = 156960;
    var BANDS = [
      { lo: 0,       hi: 128000, label: 'Llama-3 text',  fill: '#DCE3F4', text: '#2C3F8F' },
      { lo: 128000,  hi: 128256, label: 'specials',      fill: '#C9D2E8', text: '#2C3F8F' },
      { lo: 128256,  hi: 128266, label: 'control',       fill: '#8A6F09', text: '#FBF6EE' },
      { lo: 128266,  hi: 156938, label: 'audio codes',   fill: '#B33F00', text: '#FBF6EE' },
      { lo: 156938,  hi: 156960, label: 'conditioning',  fill: '#CF7538', text: '#FBF6EE' }
    ];
    var W = 760, H = 162, L = 8, R = 8, BY = 44, BH = 46;
    var svg = document.getElementById('vocabBand');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    function sx(v) { return L + (v / V) * (W - L - R); }

    BANDS.forEach(function (b) {
      var x0 = sx(b.lo), w = Math.max(1.5, sx(b.hi) - x0);
      svg.appendChild(el('rect', { x: x0, y: BY, width: w, height: BH, fill: b.fill }));
      var n = b.hi - b.lo;
      // A band only carries its own label if the label fits inside it; the narrow
      // ones are called out underneath with a leader line instead.
      if (w > 92) {
        svg.appendChild(el('text', { x: x0 + w / 2, y: BY + 21, 'text-anchor': 'middle',
          'class': 'vb-label', fill: b.text }, b.label));
        svg.appendChild(el('text', { x: x0 + w / 2, y: BY + 36, 'text-anchor': 'middle',
          'class': 'vb-count', fill: b.text }, n.toLocaleString('en-US')));
      } else {
        b.callout = { x: x0 + w / 2, n: n };
      }
    });

    // Leaders for the narrow bands, staggered so two of them do not collide. Both
    // narrow bands sit near the right edge, so the leader turns back towards the
    // middle -- running it outward put the label off the canvas.
    var outs = BANDS.filter(function (b) { return b.callout; });
    outs.forEach(function (b, i) {
      var y = BY + BH + 12 + i * 22, cx = b.callout.x;
      var left = cx > W * 0.55;                       // turn inward from the right
      var tx = left ? cx - 12 : cx + 12;
      // Neutral, not the band's own fill: the pale fills are invisible on cream.
      svg.appendChild(el('line', { x1: cx, x2: cx, y1: BY + BH, y2: y + 4, stroke: '#A89880', 'stroke-width': 1 }));
      svg.appendChild(el('line', { x1: cx, x2: tx, y1: y + 4, y2: y + 4, stroke: '#A89880', 'stroke-width': 1 }));
      svg.appendChild(el('text', {
        x: left ? tx - 5 : tx + 5, y: y + 7.5,
        'text-anchor': left ? 'end' : 'start', 'class': 'vb-out'
      }, b.label + ', ' + b.callout.n.toLocaleString('en-US')));
    });

    // The axis: first and last id, and the audio band's own boundaries.
    [[0, 'start'], [128266, 'middle'], [156937, 'end']].forEach(function (pair) {
      svg.appendChild(el('text', { x: sx(pair[0]), y: BY - 9, 'text-anchor': pair[1], 'class': 'vb-tick' },
        pair[0].toLocaleString('en-US')));
    });
    svg.appendChild(el('text', { x: L, y: 16, 'class': 'arch-h-svg' }, 'token id'));
  })();

  /* ── End-to-end flow ──────────────────────────────────────────────────────
   * Prompt to waveform. Two rows of three, because six stages in one row on a
   * 56rem column would be 120px each and the labels would not fit.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    if (!need('flowDiagram')) return;
    var STAGES = [
      { n: '01', title: 'Prompt', body: 'Speaker, optional style and your normalised text, wrapped in the chat template.',
        out: 'text token ids' },
      { n: '02', title: 'Backbone', body: 'Llama-3.2-3B opens a speech span, then emits audio codes one token at a time.',
        out: '7 tokens per frame' },
      { n: '03', title: 'Token stream', body: 'One flat stream. A range check separates audio ids from text ids.',
        out: 'ids 128,266–156,937' },
      { n: '04', title: 'De-interleave', body: 'Each 7-token frame splits back into three codebooks at a 1:2:4 ratio.',
        out: 'c0, c1, c2' },
      { n: '05', title: 'Codebooks', body: 'SNAC’s quantizer turns those codes into latents. Nothing else of SNAC runs.',
        out: 'latent frames' },
      { n: '06', title: 'Vocos', body: 'The fine-tuned vocoder turns latents into a waveform, streamed as it is made.',
        out: '24 kHz PCM' }
    ];
    var W = 760, CW = 226, CH = 118, GX = 24, GY = 46, X0 = 12, Y0 = 10;
    var H = Y0 + CH * 2 + GY + 6;
    var svg = document.getElementById('flowDiagram');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    // The diagram draws itself once it scrolls into view, one thing at a time:
    // a stage lands, then the wire out of it grows toward the next. Each stage is
    // one <g> so the card moves as a unit rather than as seven parts, and every
    // wire carries pathLength="1" so a single dash offset draws it whatever its
    // real length. The undrawn state lives in CSS behind .reveal, which only this
    // page's observer adds -- with JS off the diagram is simply already drawn.
    var STEP = 0.42, WIRE = 0.24;
    STAGES.forEach(function (s, i) {
      var col = i % 3, row = Math.floor(i / 3);
      var x = X0 + col * (CW + GX), y = Y0 + row * (CH + GY);
      var g = el('g', { 'class': 'fl-card',
        style: 'animation-delay:' + (0.04 + i * STEP).toFixed(2) + 's' });
      g.appendChild(el('rect', { x: x, y: y, width: CW, height: CH, rx: 12,
        fill: '#FBF6EE', stroke: '#D2C9BA', 'stroke-width': 1 }));
      g.appendChild(el('text', { x: x + 14, y: y + 22, 'class': 'fl-num' }, s.n));
      g.appendChild(el('text', { x: x + 40, y: y + 22, 'class': 'fl-title' }, s.title));
      // SVG has no text wrapping, so the body is split to a measured character budget.
      var words = s.body.split(' '), line = '', lines = [];
      words.forEach(function (w) {
        if ((line + ' ' + w).trim().length > 34) { lines.push(line.trim()); line = w; }
        else line += ' ' + w;
      });
      if (line.trim()) lines.push(line.trim());
      lines.slice(0, 4).forEach(function (ln, k) {
        g.appendChild(el('text', { x: x + 14, y: y + 43 + k * 14, 'class': 'fl-body' }, ln));
      });
      g.appendChild(el('text', { x: x + 14, y: y + CH - 10, 'class': 'fl-out' }, s.out));
      svg.appendChild(g);

      // Connector to the next stage: along the row, or wrapping to the row below.
      if (i === STAGES.length - 1) return;
      var wire = { 'class': 'fl-wire', pathLength: '1', 'stroke-width': 1.4, fill: 'none',
        'marker-end': 'url(#fl-arrow)',
        style: 'animation-delay:' + (0.04 + i * STEP + WIRE).toFixed(2) + 's' };
      if (col < 2) {
        var mx = x + CW, my = y + CH / 2;
        wire.d = 'M' + (mx + 4) + ' ' + my + 'H' + (mx + GX - 8);
        wire.stroke = '#C2410C';
      } else {
        // Down the right edge, back across, into the left of the next row. Drawn a
        // shade lighter than a step-to-step wire, because it is a line wrap rather
        // than a move forward.
        var bx = x + CW / 2, by = y + CH, ny = y + CH + GY;
        wire.d = 'M' + bx + ' ' + (by + 4) + 'V' + (by + 18) +
          'H' + (X0 + CW / 2) + 'V' + (ny - 6);
        wire.stroke = '#E09B76';
      }
      svg.appendChild(el('path', wire));
    });

    var defs = el('defs', {});
    var m = el('marker', { id: 'fl-arrow', viewBox: '0 0 10 10', refX: '8', refY: '5',
      markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse' });
    m.appendChild(el('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#C2410C' }));
    defs.appendChild(m);
    svg.insertBefore(defs, svg.firstChild);
  })();

  /* ── The parameter breakdown, from the counted weights ── */
  (function () {
    if (!need('paramList')) return;
    var names = Object.keys(PARAMS.components);
    var total = PARAMS.total;
    // Billions once past a thousand million, so the backbone does not read "3300.9 M".
    function big(v) { return v >= 1e9 ? (v / 1e9).toFixed(3) + ' B' : (v / 1e6).toFixed(1) + ' M'; }
    document.getElementById('paramList').innerHTML = names.map(function (k) {
      var v = PARAMS.components[k];
      return '<div class="param-row"><dt>' + esc(k) + '</dt>' +
        '<dd><span class="param-bar" style="width:' + (100 * v / total).toFixed(1) + '%"></span>' +
        '<b>' + big(v) + '</b></dd></div>';
    }).join('') +
      '<div class="param-row is-total"><dt>total</dt><dd><b>' +
      (total / 1e9).toFixed(3) + ' B</b></dd></div>';
  })();

  /* ── Frame diagram and request budget ─────────────────────────────────────
   * The interleave and the rates are from docs/KT.md: three codebooks at a 1:2:4
   * temporal ratio flattened to [c0, c1, c2, c2, c1, c2, c2], 2048 samples per
   * coarse frame at 24 kHz.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    if (!need('frameDiagram')) return;
    var SAMPLES = 2048, SR = 24000, PER_FRAME = 7;
    var FRAME_MS = (SAMPLES / SR) * 1000;
    // Position in the frame, the codebook it comes from, and that codebook's index.
    var SLOTS = [
      { cb: 0, src: 'c0[i]' },   { cb: 1, src: 'c1[2i]' },  { cb: 2, src: 'c2[4i]' },
      { cb: 2, src: 'c2[4i+1]' }, { cb: 1, src: 'c1[2i+1]' }, { cb: 2, src: 'c2[4i+2]' },
      { cb: 2, src: 'c2[4i+3]' }
    ];
    var CB = [
      { name: 'coarse', fill: '#B33F00', text: '#FBF6EE' },
      { name: 'middle', fill: '#CF7538', text: '#FBF6EE' },
      { name: 'fine',   fill: '#EFC8AC', text: '#5C3A1E' }
    ];

    var svg = document.getElementById('frameDiagram');
    var W = 760, H = 204, TW = 88, TH = 56, GAP = 8, X0 = 34, Y0 = 26;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    SLOTS.forEach(function (s, i) {
      var x = X0 + i * (TW + GAP), c = CB[s.cb];
      svg.appendChild(el('rect', { x: x, y: Y0, width: TW, height: TH, rx: 6, fill: c.fill }));
      svg.appendChild(el('text', { x: x + TW / 2, y: Y0 + 23, 'text-anchor': 'middle',
        'class': 'arch-slot', fill: c.text }, c.name));
      svg.appendChild(el('text', { x: x + TW / 2, y: Y0 + 41, 'text-anchor': 'middle',
        'class': 'arch-src', fill: c.text }, s.src));
      svg.appendChild(el('text', { x: x + TW / 2, y: Y0 + TH + 15, 'text-anchor': 'middle',
        'class': 'arch-pos' }, 'position ' + i));
    });

    // One bracket per codebook, spanning the positions it occupies, so the 1:2:4
    // ratio is visible as a shape. Counts are named in the legend above rather than
    // trailing each row, where the longest label ran off the canvas.
    var yB = Y0 + TH + 30;
    [[0, [0]], [1, [1, 4]], [2, [2, 3, 5, 6]]].forEach(function (pair, row) {
      var cb = pair[0], slots = pair[1], y = yB + row * 22;
      slots.forEach(function (i) {
        var x = X0 + i * (TW + GAP);
        svg.appendChild(el('rect', { x: x, y: y, width: TW, height: 5, rx: 2.5, fill: CB[cb].fill }));
      });
    });

    // Budget widget. Speaker-aware: the token count follows from the duration, and
    // the duration follows from that voice's measured pace, so the answer changes
    // with the casting rather than pretending every voice reads at one speed.
    var sel = document.getElementById('budVoice');
    var rng = document.getElementById('budRange');
    Object.keys(D.voices).sort().forEach(function (n) {
      var o = document.createElement('option');
      o.value = n;
      o.textContent = n + ' — ' + LANGNAME[D.voices[n].lang] + ', ' + D.voices[n].cps + ' ch/s';
      if (n === 'Amit') o.selected = true;
      sel.appendChild(o);
    });
    function frames(sec) { return Math.ceil(sec * SR / SAMPLES); }
    function update() {
      var v = D.voices[sel.value], chars = +rng.value;
      var sec = chars / v.cps, f = frames(sec), tok = f * PER_FRAME;
      document.getElementById('budVoiceMeta').textContent = v.cps + ' chars/s';
      document.getElementById('budChars').textContent = chars.toLocaleString('en-US') + ' characters';
      document.getElementById('budSec').textContent = sec < 90
        ? sec.toFixed(0) + ' s'
        : Math.floor(sec / 60) + ' min ' + ('0' + Math.round(sec % 60)).slice(-2) + ' s';
      document.getElementById('budTokens').textContent = tok.toLocaleString('en-US');
      document.getElementById('budReqs').textContent = Math.ceil(sec / 30).toLocaleString('en-US');
      document.getElementById('budFormula').innerHTML =
        chars.toLocaleString('en-US') + ' chars &divide; ' + v.cps + ' ch/s = ' + sec.toFixed(1) +
        ' s &nbsp;&rarr;&nbsp; tokens = ceil(' + sec.toFixed(1) + ' &times; ' +
        SR.toLocaleString('en-US') + ' / ' + SAMPLES.toLocaleString('en-US') + ') &times; 7 = <b>' +
        tok.toLocaleString('en-US') + '</b>';
    }
    sel.addEventListener('change', update);
    rng.addEventListener('input', update);
    update();
  })();

  /* ── Evaluation table and chart ── */
  (function () {
    if (!need('evalChart')) return;
    var tb = document.querySelector('#evalTable tbody');
    tb.innerHTML = D.eval_lang.map(function (r) {
      return '<tr><td class="chart-data-key">' + esc(r.name) + ' <span class="mono" style="font-size:.66rem;opacity:.7">' + r.lang + '</span></td>' +
        '<td class="num">' + fmt(r.judge, 3) + '</td><td class="num">' + r.pct5.toFixed(1) + '%</td>' +
        '<td class="num">' + r.pct_le2.toFixed(2) + '%</td><td class="num">' + r.n.toLocaleString('en-US') + '</td></tr>';
    }).join('') +
      '<tr><td class="chart-data-key"><b>All languages</b></td><td class="num"><b>' + fmt(D.overall.judge, 3) + '</b></td>' +
      '<td class="num"><b>' + D.overall.pct5.toFixed(1) + '%</b></td>' +
      '<td class="num"><b>' + D.overall.pct_le2.toFixed(2) + '%</b></td>' +
      '<td class="num"><b>' + D.overall.rows.toLocaleString('en-US') + '</b></td></tr>';

    /* Absolute scale, 0 to 100, with each language's own 95% confidence interval.
     *
     * This replaced a diverging bar of each language's signed distance from the
     * mean. That chart was measuring noise and drawing it as a finding: it split
     * ten languages into orange "above" and teal "below" camps over a 1.6-point
     * spread, when the binomial uncertainty on a single language at n=3,000 is
     * about +/-0.9 points. Nine of the ten intervals contain the all-language
     * mean, and the best-versus-worst gap (p=0.017) does not survive correcting
     * for the 45 pairwise comparisons you can draw from ten languages -- so the
     * honest reading is that no language stands apart, and the drawing has to say
     * that rather than rank them.
     *
     * On a true 0-100 axis all ten bars are the same length, which is the finding.
     * The interval whisker at each tip shows why chasing the remainder is chasing
     * measurement error.
     */
    var svg = document.getElementById('evalChart');
    var mean = D.overall.pct5;
    // Wilson score interval: the right one for a proportion this close to 1,
    // where the normal approximation would run the upper bound past 100.
    function wilson(pct, n) {
      var z = 1.96, p = pct / 100;
      var d = 1 + z * z / n, c = p + z * z / (2 * n);
      var m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
      return [100 * (c - m) / d, 100 * (c + m) / d];
    }
    var items = D.eval_lang.map(function (r) {
      var ci = wilson(r.pct5, r.n);
      return { label: r.name, rate: r.pct5, lo: ci[0], hi: ci[1], n: r.n };
    }).sort(function (a, b) { return a.label.localeCompare(b.label); });   // alphabetical: not a league table

    var W = 760, LABEL_W = 104, PAD_R = 62, BAR_H = 10, ROW_H = 26, TOP = 22, BOTTOM = 30;
    var plotW = W - LABEL_W - PAD_R;
    var H = TOP + items.length * ROW_H + BOTTOM;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    // The axis starts at 85, not 0, so the intervals are readable. This is still
    // an absolute scale and NOT the mean-relative diverging bar it replaced: the
    // bars encode a rate, the floor is stated on the axis and in the note, and a
    // break glyph marks it. What made the old chart dishonest was splitting the
    // languages into above- and below-mean camps, not the choice of window.
    var FLOOR = 85;
    function sx(pct) { return LABEL_W + ((pct - FLOOR) / (100 - FLOOR)) * plotW; }

    [85, 90, 95, 100].forEach(function (v) {
      svg.appendChild(el('line', { x1: sx(v), x2: sx(v), y1: TOP - 6, y2: H - BOTTOM,
        stroke: 'var(--gridline)', 'stroke-width': 0.8, 'stroke-dasharray': v === FLOOR ? '0' : '2 2' }));
      svg.appendChild(el('text', { x: sx(v), y: H - BOTTOM + 15, 'text-anchor': 'middle', 'class': 'axis-tick' }, v + '%'));
    });
    // The all-language mean, as a reference rather than a dividing line.
    svg.appendChild(el('line', { x1: sx(mean), x2: sx(mean), y1: TOP - 10, y2: H - BOTTOM,
      stroke: '#A8380A', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.7 }));
    svg.appendChild(el('text', { x: sx(mean) - 6, y: TOP - 13, 'text-anchor': 'end', 'class': 'mean-label' },
      'all languages ' + mean.toFixed(1) + '%'));

    items.forEach(function (it, i) {
      var y = TOP + i * ROW_H;
      svg.appendChild(el('text', { x: LABEL_W - 10, y: y + BAR_H, 'text-anchor': 'end', 'class': 'row-label' }, it.label));
      // A quiet pill for the rate, so the interval at its tip -- the finding --
      // is what the eye lands on.
      svg.appendChild(el('rect', { x: sx(FLOOR), y: y, width: sx(it.rate) - sx(FLOOR), height: BAR_H, rx: BAR_H / 2, fill: '#C2410C', opacity: 0.32 }));
      // An axis break, the slanted double cut of a broken scale, so a truncated
      // baseline is never mistaken for a zero one.
      [0, 4].forEach(function (dx) {
        svg.appendChild(el('line', { x1: sx(FLOOR) + 7 + dx, y1: y + BAR_H + 2, x2: sx(FLOOR) + 11 + dx, y2: y - 2,
          stroke: 'var(--chart-panel-bg, #FBF6EE)', 'stroke-width': 2 }));
      });
      // The interval, drawn at the tip: its width is the reason the ordering of
      // these ten bars carries no information.
      var y0 = y + BAR_H / 2;
      svg.appendChild(el('line', { x1: sx(it.lo), x2: sx(it.hi), y1: y0, y2: y0, stroke: '#A8380A', 'stroke-width': 1.3 }));
      [it.lo, it.hi].forEach(function (v) {
        svg.appendChild(el('line', { x1: sx(v), x2: sx(v), y1: y0 - 3.5, y2: y0 + 3.5, stroke: '#A8380A', 'stroke-width': 1.3 }));
      });
      // The rate itself: a dot on the pill's tip, sitting on the whisker.
      svg.appendChild(el('circle', { cx: sx(it.rate), cy: y0, r: 3.2, fill: '#C2410C', stroke: 'var(--chart-panel-bg, #FBF6EE)', 'stroke-width': 1.5 }));
      // Clear the interval, not the bar tip: anchored at the rate the label sat
      // on top of the upper whisker.
      svg.appendChild(el('text', { x: sx(it.hi) + 9, y: y + BAR_H, 'text-anchor': 'start', 'class': 'bar-label' },
        it.rate.toFixed(1) + '%'));
    });
  })();

  /* ── The API parameter table and its caveats ────────────────────────────
   * Both come from src/api.json, which src/apigen.py derives from the verified
   * contract. The point of the table is that it is exhaustive AND has no
   * duplicates: the contract's alias rows and its one nested override are
   * folded into the parameter they stand for, and shown as a footnote on that
   * row rather than as rows of their own.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    var API = blob('api-data', null);
    var tb = need('apiParams'), cv = need('apiCaveats');
    if (!API || !tb || !cv) return;

    tb.innerHTML = API.params.map(function (p) {
      var alias = p.alias.length
        ? '<span class="api-alias">also accepted as ' +
          p.alias.map(function (a) { return '<code>' + esc(a) + '</code>'; }).join(' or ') + '</span>'
        : '';
      var def = p.required
        ? '<b class="api-req">required</b>'
        : (p.default ? '<code>' + esc(p.default) + '</code>' : '<span class="api-none">none applied</span>');
      return '<tr><td class="chart-data-key"><code>' + esc(p.name) + '</code>' + alias + '</td>' +
        '<td class="api-type">' + esc(p.type) + '</td><td>' + def + '</td>' +
        '<td class="api-what">' + p.what + '</td></tr>';
    }).join('');

    cv.innerHTML = API.caveats.map(function (c) {
      return '<div class="api-caveat">' +
        '<p class="api-caveat-head">' +
        (c.param ? '<code>' + esc(c.param) + '</code>' : '<span class="api-caveat-any">any request</span>') +
        '<b>' + c.title + '</b></p>' +
        '<p class="api-caveat-body">' + c.body + '</p></div>';
    }).join('');
  })();

  /* ── Copy the citation ── */
  document.getElementById('copyCite').addEventListener('click', function () {
    var btn = this, text = document.getElementById('bibtex').textContent;
    function done(label) {
      btn.textContent = label;
      setTimeout(function () {
    if (!need('copyCite')) return; btn.textContent = 'Copy BibTeX'; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done('Copied'); }).catch(function () { done('Copy failed'); });
    } else { done('Copy failed'); }
  });
})();
