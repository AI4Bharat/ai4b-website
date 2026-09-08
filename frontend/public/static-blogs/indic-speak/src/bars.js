
/* ── The per-language bar chart grows in on first view ──────────────────────
 * The bars grow from the axis floor, not from zero: the scale is truncated at 85%
 * and the animation has to say the same thing the axis and the break glyph do.
 * Each interval, its rate dot and its label follow the bar that carries them, so
 * the eye lands on the finding after the bar arrives rather than before it.
 *
 * Row order and geometry are read back off the bars themselves, so none of
 * page.js's layout constants are duplicated here.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  var svg = document.getElementById('evalChart');
  if (!svg) return;
  var bars = [].slice.call(svg.querySelectorAll('rect'));
  if (!bars.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var rowY = bars.map(function (b) { return +b.getAttribute('y'); });
  function rowOf(e) {
    var y = e.getAttribute('y') || e.getAttribute('y1') || e.getAttribute('cy');
    var best = 0;
    for (var i = 1; i < rowY.length; i++) {
      if (Math.abs(rowY[i] - y) < Math.abs(rowY[best] - y)) best = i;
    }
    return best;
  }
  // Everything drawn at a bar's tip. The all-language mean is the dashed line and
  // stays where it is: it is the reference the bars are arriving against.
  var marks = [].slice.call(svg.querySelectorAll(
    'circle, text.bar-label, line[stroke="#A8380A"]:not([stroke-dasharray])'));

  var STEP = 52, GROW = 620;
  bars.forEach(function (b, i) {
    b.style.transition = 'width ' + GROW + 'ms cubic-bezier(0.22, 1, 0.36, 1) ' + (i * STEP) + 'ms';
    b.style.width = '0px';
  });
  marks.forEach(function (e) {
    e.style.transition = 'opacity 320ms ease-out ' + (rowOf(e) * STEP + GROW * 0.62) + 'ms';
    e.style.opacity = '0';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.disconnect();
      // Back to the width the rect's own attribute gives it, and to full opacity.
      bars.forEach(function (b) { b.style.width = ''; });
      marks.forEach(function (e) { e.style.opacity = ''; });
    });
  }, { threshold: 0.25 });
  io.observe(svg);
})();
