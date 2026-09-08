  /* ── Hero: the scripts ───────────────────────────────────────────────────
   * The first vowel of each of the twelve scripts the model reads, one after
   * another, with the script's name and how many of the 22 languages write in
   * it. The scripts and their languages come from the language table, so the
   * hero cannot disagree with the rest of the post. The rings below are born
   * from this letter: the text is the source of the sound.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    var box = need('heroGlyph');
    if (!box) return;
    var faces = [need('heroGlyphA'), need('heroGlyphB')], cap = need('heroGlyphCap');
    var VOWEL = { 'Devanagari': 'अ', 'Bengali–Assamese': 'অ', 'Gujarati': 'અ', 'Gurmukhi': 'ਅ',
                  'Odia': 'ଅ', 'Tamil': 'அ', 'Telugu': 'అ', 'Kannada': 'ಅ', 'Malayalam': 'അ',
                  'Perso-Arabic': 'ا', 'Meitei Mayek': 'ꯑ', 'Ol Chiki': 'ᱟ' };
    var by = {}, scripts = [];
    D.languages.forEach(function (l) {
      if (!by[l.script]) { by[l.script] = { name: l.script, glyph: VOWEL[l.script], langs: [] }; scripts.push(by[l.script]); }
      by[l.script].langs.push(l.name);
    });
    // Most-written scripts first, so the card opens on Devanagari.
    scripts.sort(function (p, q) { return q.langs.length - p.langs.length; });

    function label(s) {
      var k = s.langs.length > 1 ? s.langs.length + ' languages'
            : s.langs[0] !== s.name ? s.langs[0] : '';
      return esc(s.name) + (k ? '<span class="k">' + esc(k) + '</span>' : '');
    }
    var i = 0, on = 0;
    function show(s) {
      var next = faces[1 - on];
      next.textContent = s.glyph;
      faces[on].classList.remove('is-on');
      next.classList.add('is-on');
      on = 1 - on;
      cap.classList.add('is-off');
      setTimeout(function () { cap.innerHTML = label(s); cap.classList.remove('is-off'); }, 300);
    }
    show(scripts[0]);
    if (REDUCED) return;
    var HOLD = 2600, visible = true;
    setInterval(function () {
      if (!visible) return;
      i = (i + 1) % scripts.length;
      show(scripts[i]);
    }, HOLD);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(box);
    }
  })();

