
/* ── Typeset row for the normaliser's LaTeX examples ────────────────────────
 * src/texgen.js renders the expressions to MathML at build time, so this only
 * places them: the browser's own math layout does the rest, and no math library
 * or web font ships with the page. The written row keeps its raw source, which
 * is what the section prose is about.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  var el = document.getElementById('tex-data');
  if (!el || !el.textContent) return;   // a page built without the blob
  var MAP = JSON.parse(el.textContent);
  document.querySelectorAll('code.norm-written').forEach(function (code) {
    var html = MAP[code.textContent];
    if (!html) return;
    var host = document.createElement('div');
    host.innerHTML = '<div class="norm-io"><span class="norm-k">typeset</span>' +
                     '<span class="norm-tex">' + html + '</span></div>';
    code.parentNode.after(host.firstChild);
  });
})();
