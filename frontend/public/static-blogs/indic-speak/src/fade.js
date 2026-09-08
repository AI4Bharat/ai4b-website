
/* ── The audiobook fades unless you open the text ───────────────────────────
 * Only the first paragraph is on the page; the rest sit behind a disclosure. The
 * narration is the whole chapter, so once it reads past what is on screen it fades
 * out and stops. Opening the disclosure cancels the fade and, if it has already
 * stopped, picks the narration back up where it left off.
 *
 * The moment comes from src/ab.json, written by src/abgen.py when the audio was
 * generated: `fade_at` is the end of paragraph one, measured from the stitch rather
 * than guessed, so it lands exactly where the visible text runs out.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  var host = document.getElementById('longform');
  var blob = document.getElementById('ab-data');
  if (!host || !blob || !blob.textContent) return;
  var at = JSON.parse(blob.textContent).fade_at;
  if (!(at > 0)) return;

  var au = host.querySelector('audio');
  var det = host.querySelector('details');
  var sum = host.querySelector('.chart-data-toggle');
  if (!au || !det) return;

  var RAMP = 2600, ramp = null, stopped = false;
  function clear() { if (ramp) { clearInterval(ramp); ramp = null; } }
  function restore() {
    clear();
    au.volume = 1;
    if (stopped) { stopped = false; au.play(); }
  }
  au.addEventListener('timeupdate', function () {
    // The reading layout replaces the card's text with a full read-along transcript
    // and removes this disclosure, so there is nothing to expand and nothing to
    // withhold. Checked here rather than up front: that layout's script runs after
    // this one.
    if (!det.isConnected) return;
    if (det.open || ramp || stopped || au.currentTime < at) return;
    var t0 = Date.now();
    if (sum) sum.classList.add('is-nudge');
    ramp = setInterval(function () {
      if (det.open) { restore(); return; }
      var v = 1 - (Date.now() - t0) / RAMP;
      if (v > 0) { au.volume = v; return; }
      clear();
      au.volume = 0;
      au.pause();
      stopped = true;
    }, 50);
  });
  det.addEventListener('toggle', function () {
    if (det.open) { if (sum) sum.classList.remove('is-nudge'); restore(); }
  });
})();
