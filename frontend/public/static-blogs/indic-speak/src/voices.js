
/* ── The script wall ───────────────────────────────────────────────────────
 * Replaces the 24-row recommendation table. The table asked you to find your
 * language in a list; this asks you to point at it, written the way you write it.
 *
 * Rows are scripts, ordered by how many languages share them, so the shape of the
 * widget carries the fact underneath it: eight of the 22 arrive in Devanagari with
 * no language tag to separate them, and nine have a script of their own.
 *
 * The table is not thrown away — it is what you want when you are comparing
 * languages rather than choosing one — so the markup keeps it, in a disclosure.
 *
 * This file no longer draws the voices themselves. It is the selector, and the one
 * voice panel lives in src/range.js beside the pitch axis, so the card has a single
 * place where a voice is described and played rather than two.
 *
 * Endonyms come from src/wall.json, where src/wallgen.py checks every character
 * against its script's Unicode block.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  var mount = document.getElementById('voiceWall');
  var pd = document.getElementById('page-data');
  var wd = document.getElementById('wall-data');
  if (!mount || !pd || !wd || !pd.textContent || !wd.textContent) return;

  var D = JSON.parse(pd.textContent);
  var WALL = JSON.parse(wd.textContent);
  var byCode = {};
  D.languages.forEach(function (l) { byCode[l.code] = l; });

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── the wall ── */
  var wrap = document.createElement('div');
  wrap.className = 'vw';
  var rows = document.createElement('div');
  rows.className = 'vw-rows';
  var tiles = {};

  WALL.groups.forEach(function (g, i) {
    var row = document.createElement('div');
    row.className = 'vw-row';
    row.style.animationDelay = (i * 0.055) + 's';
    // The ground says how crowded the script is: eight languages share Devanagari,
    // while every script in the last row serves exactly one, so that row is the
    // lightest even though it holds nine tiles. Giving all the shared rows one tint
    // said only "shared", which the label already says.
    //
    // Written as a colour rather than a custom property: the shim in src/smoke.js
    // models style as a plain object with no setProperty.
    var share = g.kind === 'own' ? 1 : g.codes.length;
    row.style.backgroundColor = 'rgba(194, 65, 12, ' + (share * 0.014).toFixed(3) + ')';
    var label = document.createElement('div');
    label.className = 'vw-script';
    label.innerHTML = '<b>' + esc(g.script) + '</b>' +
      '<span>' + g.codes.length + ' language' + (g.codes.length > 1 ? 's' : '') + '</span>';
    row.appendChild(label);

    var strip = document.createElement('div');
    strip.className = 'vw-tiles';
    g.codes.forEach(function (code) {
      var w = WALL.langs[code];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'vw-tile';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-describedby', 'vwDetail');
      b.setAttribute('aria-label', w.name + ', written ' + w.endonym);
      // A tile in the unshared row names its script, unless the script and the
      // language share a name, which is true for seven of the nine.
      var sub = w.own_script && w.own_script !== w.name
        ? esc(w.name) + ' <i>' + esc(w.own_script) + '</i>' : esc(w.name);
      b.innerHTML = '<span class="vw-endonym" lang="' + esc(code) + '">' + esc(w.endonym) + '</span>' +
        '<span class="vw-latin">' + sub + '</span>';
      b.addEventListener('click', function () { select(code); });
      strip.appendChild(b);
      tiles[code] = b;
    });
    row.appendChild(strip);
    rows.appendChild(row);
  });
  wrap.appendChild(rows);

  function select(code) {
    var l = byCode[code], w = WALL.langs[code];
    if (!l || !w) return;
    Object.keys(tiles).forEach(function (k) {
      tiles[k].classList.toggle('is-active', k === code);
      tiles[k].setAttribute('aria-pressed', k === code ? 'true' : 'false');
    });
    // The wall is the only selector in this exhibit: the pitch axis, the voice panel
    // and the native-versus-elsewhere pair all follow this one event. An event rather
    // than a direct call because each part of the card is its own IIFE.
    //
    // Dispatched on the mount, not on document: src/smoke.js gives its elements
    // addEventListener and dispatchEvent but not its document, so this is what lets
    // the harness exercise the coordination instead of stepping over it. Its Event
    // takes no detail either, hence the fallback.
    var payload = {
      code: code, name: l.name, endonym: w.endonym, script: l.script,
      judge: l.judge, voices: l.female.concat(l.male)
    };
    var ev;
    try {
      // CustomEvent.detail is read-only, so it has to go in through the constructor.
      ev = new CustomEvent('voice:lang', { detail: payload });
    } catch (err) {
      ev = new Event('voice:lang');
      ev.detail = payload;
    }
    mount.dispatchEvent(ev);
  }

  mount.appendChild(wrap);
  select('hi');

  /* ── balance the wrapped lines ────────────────────────────────────────────
   * `auto-fill` packs as many tiles onto the first line as fit and drops the
   * remainder onto a short second one, so eight Devanagari languages came out six
   * and two. A row that has to wrap should divide instead: pick the number of
   * lines the width forces, then give every line the same column count, and eight
   * becomes four and four. Recomputed on resize because the answer depends on how
   * much room the row actually has.
   * ──────────────────────────────────────────────────────────────────────── */
  var MIN_TILE = 102;                       // 6.4rem, the CSS minimum
  function balance() {
    rows.querySelectorAll('.vw-tiles').forEach(function (strip) {
      var n = strip.querySelectorAll('.vw-tile').length;
      if (!n) return;
      var room = strip.clientWidth || strip.getBoundingClientRect().width;
      var fit = Math.max(1, Math.floor(room / MIN_TILE));
      var lines = Math.ceil(n / fit);
      var cols = Math.ceil(n / lines);
      strip.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

      // The dividers are drawn by the tiles, so a last line with fewer tiles than
      // columns left its rule hanging in mid-air. Fill the remainder with inert
      // cells that carry the same borders and nothing else, and every horizontal
      // line runs the full width of the board.
      var want = cols * lines - n;
      var fills = strip.querySelectorAll('.vw-fill');
      for (var i = fills.length; i > want; i--) { strip.removeChild(strip.lastChild); }
      for (var j = fills.length; j < want; j++) {
        var f = document.createElement('span');
        f.className = 'vw-fill';
        f.setAttribute('aria-hidden', 'true');
        strip.appendChild(f);
      }
    });
  }
  balance();
  if (window.ResizeObserver) {
    new ResizeObserver(balance).observe(rows);
  } else {
    window.addEventListener('resize', balance);
  }

  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.disconnect();
        rows.classList.add('is-in');
      });
    }, { threshold: 0.15 });
    io.observe(rows);
  } else {
    rows.classList.add('is-in');
  }
})();
