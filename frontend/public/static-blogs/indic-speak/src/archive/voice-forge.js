  /* ── The voice forge: a voice being made, at the model's own rate ─────────
   * The one animation here that could not have been bought as an asset, because
   * its keyframes are the model's frames. The coarse codebook steps once per
   * 2048 samples at 24 kHz, so tokens land 11.72 times a second, seven at a
   * time in the fixed 1:2:4 interleave, and the waveform grows behind them.
   * Every number driving a pixel -- loudness, sample extremes, spectral
   * centroid -- was measured off the real clip by src/voicegen.py. Nothing is
   * hand-drawn, and no two voices would animate the same way.
   *
   * Slowing playback is the point of the speed control rather than a nicety: at
   * a quarter rate the seven tokens of a frame land visibly, one after another,
   * in the order the model emits them.
   *
   * Cost: two offscreen canvases hold the settled and unsettled renderings, so
   * a painted frame is two blits, the few tokens still landing, and a playhead.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    var host = need('voice-forge');
    var VF = blob('voice-data', null);
    if (!host || !VF) return;

    var D36 = '0123456789abcdefghijklmnopqrstuvwxyz';
    function ser(s) {                       // one base-36 digit per frame -> 0..1
      var a = new Float32Array(s.length);
      for (var i = 0; i < s.length; i++) a[i] = D36.indexOf(s[i]) / 35;
      return a;
    }
    var AMP = ser(VF.amp), LO = ser(VF.lo), HI = ser(VF.hi), BR = ser(VF.b);
    var N = VF.frames, ROWS = VF.tok, FPS = VF.fps;
    // The unsettled state is the same weave in one pale tone. It deliberately
    // carries no codebook colour: nothing has been generated there yet, and a
    // flat ghost is what makes all seven rows read as live once they have been.
    var PALE = '#EADFD0';
    var WAVE_PALE = '#E4D8C8', WAVE_WARM = '#B4400C';
    var POP = 0.2;                          // seconds of audio a token stays lit

    var stage = document.createElement('canvas');
    stage.className = 'vf-stage';
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label',
      VF.frames + ' codec frames of ' + VF.voice + '’s reading, ' + VF.tok +
      ' tokens each, drawn from the clip’s own loudness and brightness.');
    var read = document.createElement('p');
    read.className = 'vf-read';
    read.innerHTML =
      '<b class="vf-frames">0</b><span class="vf-unit">/' + N + ' frames</span>' +
      '<span class="vf-sep">·</span>' +
      '<b class="vf-tokens">0</b><span class="vf-unit">/' +
      (N * ROWS).toLocaleString('en-US') + ' tokens</span>' +
      '<span class="vf-sep">·</span>' +
      '<span class="vf-rate">' + FPS.toFixed(2) + ' frames a second</span>';
    host.appendChild(stage);
    host.appendChild(read);
    // Reusing the page's player gives the forge play, seek, speed and volume for
    // free; only the rate ladder differs, because slow is the interesting end.
    var player = makePlayer(VF.clip, VF.voice + ' · ' + (LANGNAME[VF.lang] || VF.lang),
                            [1, 0.5, 0.25, 2]);
    host.appendChild(player);
    var audio = player.querySelector('audio');
    var nb = read.querySelector('.vf-frames'), tb = read.querySelector('.vf-tokens');

    var ctx = stage.getContext('2d');
    if (!ctx) {
      stage.hidden = true;
      read.innerHTML = '<span class="vf-rate">Audio preview ready. Use the player below to hear ' +
        esc(VF.voice) + '.</span>';
      return;
    }
    var pale = document.createElement('canvas'), warm = document.createElement('canvas');
    var W = 0, H = 0, colW = 0, PADX = 6, PADY = 9, GAP = 12;
    var latH = 0, waveH = 0, waveTop = 0, waveMid = 0;

    function layout() {
      var r = stage.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(120, Math.round(r.width)); H = Math.max(90, Math.round(r.height));
      [stage, pale, warm].forEach(function (c) {
        c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
        c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      colW = (W - PADX * 2) / N;
      latH = Math.round((H - PADY * 2 - GAP) * 0.5);
      waveH = H - PADY * 2 - GAP - latH;
      waveTop = PADY + latH + GAP;
      waveMid = waveTop + waveH / 2;
      render(pale.getContext('2d'), false);
      render(warm.getContext('2d'), true);
    }

    // One pass over every frame. Tile shade comes from loudness; tile width from
    // brightness, so a sibilant reads narrow and sharp and a vowel reads full.
    function render(g, isWarm) {
      g.clearRect(0, 0, W, H);
      var rowH = latH / ROWS;
      for (var r = 0; r < ROWS; r++) {
        var fam = FAMILY[BOOK[r]];
        for (var c = 0; c < N; c++) {
          var a = AMP[c];
          g.fillStyle = isWarm ? fam[a > 0.62 ? 2 : a > 0.3 ? 1 : 0] : PALE;
          var w = colW * (0.58 + 0.32 * (1 - BR[c]));
          var h = rowH * (0.34 + 0.56 * a);
          g.fillRect(PADX + c * colW + (colW - w) / 2,
                     PADY + r * rowH + (rowH - h) / 2, Math.max(0.7, w), Math.max(1, h));
        }
      }
      // The waveform the frames above decode to: real sample extremes per frame.
      g.fillStyle = isWarm ? WAVE_WARM : WAVE_PALE;
      g.beginPath();
      g.moveTo(PADX, waveMid);
      for (var i = 0; i < N; i++) g.lineTo(PADX + i * colW, waveMid - (HI[i] * 2 - 1) * waveH / 2);
      for (i = N - 1; i >= 0; i--) g.lineTo(PADX + i * colW, waveMid - (LO[i] * 2 - 1) * waveH / 2);
      g.closePath();
      g.fill();
    }

    function paint() {
      var cur = audio.currentTime || 0;
      var f = Math.min(N, cur * FPS);
      var x = PADX + f * colW;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(pale, 0, 0, W, H);
      if (f > 0) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, x, H); ctx.clip();
        ctx.drawImage(warm, 0, 0, W, H);
        ctx.restore();
      }
      // The tokens still landing. Seven per frame at 1/7th of a frame apart, so
      // at full speed this is a shimmer and at a quarter speed it is countable.
      if (!REDUCED && f > 0 && f < N) {
        var rowH = latH / ROWS;
        var first = Math.max(0, Math.floor(f - POP * FPS) - 1);
        for (var c = first; c <= Math.floor(f) && c < N; c++) {
          for (var r = 0; r < ROWS; r++) {
            var age = cur - (c + r / ROWS) / FPS;
            if (age < 0 || age > POP) continue;
            var k = 1 - age / POP;
            var w = colW * (0.58 + 0.32 * (1 - BR[c])) * (1 + 1.9 * k);
            var h = rowH * (0.34 + 0.56 * AMP[c]) * (1 + 0.5 * k);
            ctx.globalAlpha = 0.25 + 0.75 * k;
            ctx.fillStyle = FAMILY[BOOK[r]][2];
            ctx.fillRect(PADX + c * colW + (colW - w) / 2,
                         PADY + r * rowH + (rowH - h) / 2, Math.max(0.8, w), Math.max(1, h));
          }
        }
        ctx.globalAlpha = 1;
      }
      if (f > 0 && f < N) {                 // playhead: where the model is right now
        ctx.fillStyle = '#7A2708';
        ctx.fillRect(x - 0.75, PADY * 0.5, 1.5, H - PADY);
        ctx.beginPath();
        ctx.moveTo(x - 4, 0); ctx.lineTo(x + 4, 0); ctx.lineTo(x, 6); ctx.closePath();
        ctx.fill();
      }
      var fi = Math.floor(f);
      if (nb.textContent !== String(fi)) {
        nb.textContent = fi;
        tb.textContent = (fi * ROWS).toLocaleString('en-US');
      }
    }

    var running = false, visible = true, frameId = 0, lastPaint = 0;
    var FRAME_MS = 1000 / 30;
    function loop(now) {
      if (!running) return;
      if (!visible || audio.paused) { running = false; frameId = 0; return; }
      if (now - lastPaint >= FRAME_MS) { lastPaint = now; paint(); }
      frameId = requestAnimationFrame(loop);
    }
    function start() {
      if (!running && visible && !REDUCED) {
        running = true; lastPaint = 0; frameId = requestAnimationFrame(loop);
      }
    }
    function halt(repaint) {
      running = false;
      if (frameId && window.cancelAnimationFrame) window.cancelAnimationFrame(frameId);
      frameId = 0;
      if (repaint) paint();
    }
    function stop() { halt(true); }
    audio.addEventListener('play', start);
    audio.addEventListener('pause', stop);
    audio.addEventListener('ended', stop);
    audio.addEventListener('seeked', paint);
    // Reduced motion keeps the reveal but drops the per-token pop and the loop.
    if (REDUCED) audio.addEventListener('timeupdate', paint);

    if (window.ResizeObserver) new ResizeObserver(function () { layout(); paint(); }).observe(stage);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (!visible) halt(false);
        else if (!audio.paused) start();
      })
        .observe(stage);
    }
    layout();
    paint();
  }());
