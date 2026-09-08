  /* ── Hero: the ripple ────────────────────────────────────────────────────
   * Speech is pressure radiating from a source, so that is what the hero draws.
   *
   * One ring per envelope bar, born at the script glyph at the bar rate of
   * HERO.amp -- N bars over HERO.seconds -- so the field plays at
   * the clip's own speed. A ring lives LIFE seconds, and after the sentence the
   * card rests for REST seconds before it starts again, so the loop reads as a
   * new utterance rather than a seam. Weight and opacity are the clip's measured
   * loudness at the instant that ring was emitted: this voice's envelope in
   * polar form, and no other voice draws it. The glyph is lit by the loudness
   * of the moment, so the rings visibly come from the letter.
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
    var LIFE = 6.5;                // seconds a ring takes to cross the card
    var REST = 1.4;                // the breath between two passes of the sentence
    var SPAN = HERO.seconds + REST;
    var W = 0, H = 0, ox = 0, oy = 0, reach = 0, crest = null;
    var glyph = need('heroGlyphA');

    // Duotone: the near field is warm because that is where the energy is, and
    // the far field cools into the pack's teal so the rings read against a warm
    // ground instead of dissolving into it.
    var GLOW = ['#E8B08A', '#D9773E', '#B8431A'];
    var CREST = [[0, '#5E1F2B'], [0.14, '#9B2F12'], [0.34, '#C2410C'], [0.54, '#D8842F'],
                 [0.72, '#B79A57'], [0.87, '#5C9080'], [1, '#2F8B80']];

    function layout() {
      var r = cv.getBoundingClientRect();
      // 1.5, not 2: the field is wide soft arcs, so the last half-step of
      // resolution buys nothing visible and costs a third of the fill.
      var dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = Math.max(120, Math.round(r.width)); H = Math.max(90, Math.round(r.height));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The source is the centre of the letter, wherever the layout put it.
      if (glyph) {
        var g = glyph.getBoundingClientRect();
        ox = g.left - r.left + g.width / 2; oy = g.top - r.top + g.height / 2;
      } else { ox = 0; oy = H * 0.5; }
      reach = Math.sqrt(Math.max(ox, W - ox) * Math.max(ox, W - ox) + Math.max(oy, H - oy) * Math.max(oy, H - oy)) * 1.02;
      crest = ctx.createRadialGradient(ox, oy, 0, ox, oy, reach);
      CREST.forEach(function (s) { crest.addColorStop(s[0], s[1]); });
    }

    // The loudness right now, between bars, and zero during the rest.
    function level(t) {
      var u = t % SPAN;
      if (u >= HERO.seconds) return 0;
      var x = u * RATE, i = Math.floor(x), f = x - i;
      return AMP[i % N] * (1 - f) + AMP[(i + 1) % N] * f;
    }

    function ring(age, a) {
      var k = age / LIFE;                          // 0 at the source, 1 at the rim
      var w = Math.pow(a, 2.4);                    // no floor: a pause vanishes
      var fade = Math.min(1, k * 9) * Math.pow(1 - k, 0.85);
      if (fade * w < 0.006) return;
      var r = k * reach;
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      // A wide, soft body: the pressure itself, dispersing as it travels.
      ctx.globalAlpha = fade * 0.18 * w;
      ctx.lineWidth = (6 + 34 * w) * (1 + 1.3 * k);
      ctx.strokeStyle = a > 0.62 ? GLOW[2] : a > 0.32 ? GLOW[1] : GLOW[0];
      ctx.stroke();
      // The crest: the one crisp line the eye follows, cooling as it travels.
      ctx.globalAlpha = Math.min(1, fade * 0.9 * w);
      ctx.lineWidth = 0.7 + 3.2 * w;
      ctx.strokeStyle = crest;
      ctx.stroke();
      // Light on the leading edge, so the crest reads as a raised wave.
      ctx.beginPath();
      ctx.arc(ox, oy, r + 0.9 + 1.6 * w, 0, Math.PI * 2);
      ctx.globalAlpha = fade * 0.45 * w;
      ctx.lineWidth = 0.6 + 0.9 * w;
      ctx.strokeStyle = '#FFF7EE';
      ctx.stroke();
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      // Behind the letter: a warm glow that swells with the loudness of the moment.
      var a = level(t), sr = 60 + 120 * a;
      var g = ctx.createRadialGradient(ox, oy, 0, ox, oy, sr);
      g.addColorStop(0, 'rgba(216, 132, 47, ' + (0.16 + 0.3 * a) + ')');
      g.addColorStop(0.5, 'rgba(216, 132, 47, ' + (0.06 + 0.14 * a) + ')');
      g.addColorStop(1, 'rgba(216, 132, 47, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(ox - sr, oy - sr, sr * 2, sr * 2);
      // Rings, oldest first so the newest crests sit on top near the source.
      var p = Math.floor(t / SPAN);
      for (var q = p - 1; q <= p; q++) {
        if (q < 0) continue;
        for (var i = 0; i < N; i++) {
          var age = t - (q * SPAN + i / RATE);
          if (age < 0 || age >= LIFE) continue;
          ring(age, AMP[i]);
        }
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
    // The glyph's face may arrive after first paint and move the source.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
    }

  })();

