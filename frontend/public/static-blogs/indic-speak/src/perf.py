"""Measure smoothness and isolate the cause by disabling suspects one at a time.

Two regimes, because they catch different faults. SCROLLING catches work tied to
layout and paint on scroll. STATIONARY catches a render loop running while the
reader sits still -- which the scroll test structurally cannot see, since
scrolling moves the hero out of view and its IntersectionObserver stops the
loop. A hero animation costing 62ms a frame passed the scroll test cleanly.
"""
import json
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8790/indic-speak.html"

# Frame deltas while scrolling the page at a steady rate.
MEASURE = """() => new Promise((resolve) => {
  const deltas = [];
  let last = performance.now();
  let y = 0;
  const STEP = 28, MAX = 7000;
  function frame(now) {
    deltas.push(now - last); last = now;
    y += STEP; window.scrollTo(0, y);
    if (y < MAX) requestAnimationFrame(frame);
    else {
      deltas.shift();
      const s = deltas.slice().sort((a, b) => a - b);
      resolve({
        frames: deltas.length,
        mean: +(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1),
        p50: +s[Math.floor(s.length * 0.5)].toFixed(1),
        p95: +s[Math.floor(s.length * 0.95)].toFixed(1),
        worst: +s[s.length - 1].toFixed(1),
        over20: deltas.filter((d) => d > 20).length,
        over50: deltas.filter((d) => d > 50).length,
      });
    }
  }
  requestAnimationFrame(frame);
})"""

# What a forced layout read costs, which is what the scroll handler does every event.
RELAYOUT = """() => {
  const t0 = performance.now();
  for (let i = 0; i < 40; i++) {
    document.documentElement.scrollTop += 1;
    void document.documentElement.scrollHeight;   // forces layout
    void document.documentElement.clientHeight;
  }
  return +((performance.now() - t0) / 40).toFixed(2);
}"""

ARMS = {
    "baseline": "() => {}",
    "no fixed background": "() => { document.querySelector('.research-page').style.backgroundAttachment = 'scroll'; }",
    "no ripple canvas": "() => { const f=document.getElementById('heroRipple'); if(f) f.remove(); }",
    "no hero ground": "() => { const s=document.createElement('style'); s.textContent='.hero-card{background:#fff!important}'; document.head.appendChild(s); }",
    "all animations paused": "() => { const s=document.createElement('style'); s.textContent='*,*::before,*::after{animation-play-state:paused!important}'; document.head.appendChild(s); }",
    "hero removed entirely": "() => { document.querySelector('.hero').style.display = 'none'; }",
}

STILL = """() => new Promise((resolve) => {
  const deltas = [];
  let last = performance.now();
  function frame(now) {
    deltas.push(now - last); last = now;
    if (deltas.length < 150) requestAnimationFrame(frame);
    else {
      deltas.shift();
      const s = deltas.slice().sort((a, b) => a - b);
      resolve({ p50: s[Math.floor(s.length * 0.5)], p95: s[Math.floor(s.length * 0.95)],
                worst: s[s.length - 1], over20: deltas.filter((d) => d > 20).length,
                over50: deltas.filter((d) => d > 50).length, frames: deltas.length });
    }
  }
  requestAnimationFrame(frame);
})"""

with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"])
    for name, setup in ARMS.items():
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(URL, wait_until="networkidle", timeout=60000)
        pg.wait_for_timeout(1500)
        pg.evaluate(setup)
        pg.wait_for_timeout(400)
        still = pg.evaluate(STILL)          # sitting on the hero, before any scroll
        r = pg.evaluate(MEASURE)
        pg.evaluate("() => window.scrollTo(0, 0)")
        pg.wait_for_timeout(300)
        r["layout_read_ms"] = pg.evaluate(RELAYOUT)
        print(f"{name:30s} scroll p50 {r['p50']:5.1f} >20ms {r['over20']:3d}/{r['frames']}"
              f"   still p50 {still['p50']:5.1f} p95 {still['p95']:5.1f} >20ms {still['over20']:3d}/{still['frames']}"
              f"   layout-read {r['layout_read_ms']}ms")
        pg.close()
    b.close()
