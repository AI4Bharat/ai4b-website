  /* ── Hero: the seven-token frame ─────────────────────────────────────────
   * A tile field with a scan band, which is the house hero on the sibling posts.
   * Theirs are glyphs, because glyphs are what an OCR model reads. Ours are audio
   * codes, because that is what this model emits.
   *
   * Seven rows, one per position in a frame; columns run forward in time. The
   * colour of a tile says which codebook that position draws from, in the fixed
   * interleave [c0, c1, c2, c2, c1, c2, c2], so the field carries the 1:2:4 rhythm
   * of the codec. Its shade comes from HERO.amp, the real envelope of the clip
   * this page plays, sampled at that moment.
   *
   * All CSS: every tile's delay is derived from its column, so the field fills in
   * behind the scan band with no per-frame JavaScript and nothing on the canvas.
   * ──────────────────────────────────────────────────────────────────────── */
  (function () {
    if (!need('tokenField')) return;
    var grid = document.querySelector('#tokenField .tf-grid');
    // Position in the frame -> codebook. Positions 1 and 4 are the middle book;
    // 2, 3, 5 and 6 are the fine one. See docs/KT.md on the interleave.
    var COLS = 44, PERIOD = 7, LEAD = 0.22, SCATTER = 0.9;
    // Seeded so the field is identical on every load.
    var seed = 20260903 >>> 0;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

    var frag = document.createDocumentFragment();
    for (var r = 0; r < 7; r++) {
      var row = document.createElement('div');
      row.className = 'tf-row';
      row.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
      var fam = FAMILY[BOOK[r]];
      for (var c = 0; c < COLS; c++) {
        // the clip's own loudness at this column decides how strong the tile is
        var a = HERO.amp[Math.min(HERO.amp.length - 1, Math.round(c / (COLS - 1) * (HERO.amp.length - 1)))];
        var cell = document.createElement('span');
        cell.className = 'tf-cell';
        cell.style.background = fam[Math.min(2, Math.floor(a * 2.99))];
        cell.style.animationDelay = ((c / COLS) * PERIOD * 0.93 + LEAD + rnd() * SCATTER).toFixed(2) + 's';
        row.appendChild(cell);
      }
      frag.appendChild(row);
    }
    grid.appendChild(frag);

    document.getElementById('heroCaption').innerHTML =
      'Above: one audio frame is seven tokens across three codebooks, in a fixed 1:2:4 interleave. ' +
      'Shade follows ' + HERO.voice + "'s own loudness. " +
      (need('capabilities') ? '<a href="#capabilities">Hear the clip below</a>.'
                            : '<a href="indic-speak.html#capabilities">Hear the clip</a>.');
  })();
