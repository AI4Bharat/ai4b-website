#!/usr/bin/env python3
"""Playwright review of one of the two posts: console errors, failed requests, layout
overflow, widget population, interactions, and screenshots.

    python3 src/review.py                              # the capability post
    python3 src/review.py indic-speak-technical.html   # the technical post

Screenshots land in ../shots/<capability|technical>/. Widgets that live on only one
post are probed defensively, so the same script reviews both.
"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

PAGE = sys.argv[1] if len(sys.argv) > 1 else "indic-speak.html"
URL = f"http://127.0.0.1:8790/{PAGE}"
TECHNICAL = "technical" in PAGE
OUT = Path(__file__).parent.parent / "shots" / ("technical" if "technical" in (sys.argv[1] if len(sys.argv) > 1 else "") else "capability")
OUT.mkdir(parents=True, exist_ok=True)

def main():
    report = {"console": [], "pageerrors": [], "failed": []}
    with sync_playwright() as p:
        b = p.chromium.launch(channel=None, args=["--no-sandbox", "--disable-dev-shm-usage"])
        pg = b.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
        # Headless Chromium renders WebGL through SwiftShader, and compositing a
        # canvas in software reads its pixels back every frame, which the driver
        # logs as a stall. It is a property of this environment, not of the page:
        # a browser with hardware GL composites the canvas directly. Verified by
        # observing the same warnings on a run that takes no screenshots.
        HARNESS_NOISE = "GPU stall due to ReadPixels"
        pg.on("console", lambda m: report["console"].append(f"{m.type}: {m.text}")
              if m.type in ("error", "warning") and HARNESS_NOISE not in m.text else None)
        pg.on("pageerror", lambda e: report["pageerrors"].append(str(e)))
        pg.on("requestfailed", lambda r: report["failed"].append(f"{r.url} :: {r.failure}"))
        pg.goto(URL, wait_until="networkidle", timeout=60000)
        pg.wait_for_timeout(6200)   # let the playhead finish one sweep so the field is full

        report["counts"] = pg.evaluate("""() => ({
          specTiles: document.querySelectorAll('.spec-cell').length,
          titleWords: document.querySelectorAll('#heroTitle .w').length,
          titleShown: document.querySelectorAll('#heroTitle .w.in-view').length,
          specChips: document.querySelectorAll('.spec-chip').length,
          tocTicks: document.querySelectorAll('.toc-tick').length,
          tocPills: document.querySelectorAll('.toc-pill').length,
          voicePoints: document.querySelectorAll('.vs-pt').length,
          voiceLabels: document.querySelectorAll('.vs-label').length,
          crowdedLabels: (document.getElementById('voiceSpace') || {dataset:{}}).dataset.crowded ?? null,
          heroTitleText: document.getElementById('heroTitle').textContent,
          siblingLink: (document.querySelector('.sibling-chip') || {}).getAttribute
            ? document.querySelector('.sibling-chip').getAttribute('href') : null,
          recRows: document.querySelectorAll('#recTable tbody tr').length,
          evalRows: document.querySelectorAll('#evalTable tbody tr').length,
          langTabs: document.querySelectorAll('.lang-tab').length,
          clipPanels: document.querySelectorAll('.clip-panel').length,
          clipsVisible: document.querySelectorAll('.clip-panel.is-active .clip').length,
          audios: document.querySelectorAll('audio').length,
          styleCards: document.querySelectorAll('.style-card').length,
          chartRects: document.querySelectorAll('#evalChart rect').length,
          featureCards: document.querySelectorAll('.research-feature-card').length,
          bullets: document.querySelectorAll('.research-bullet-item').length,
          revealHidden: [...document.querySelectorAll('.reveal')].filter(e => !e.classList.contains('in-view')).length,
        })""")

        report["layout"] = pg.evaluate("""() => {
          const d = document.documentElement;
          const clippedByAncestor = (el) => {
            for (let a = el.parentElement; a; a = a.parentElement) {
              const o = getComputedStyle(a).overflowX;
              if (o === 'hidden' || o === 'auto' || o === 'scroll') return true;
            }
            return false;
          };
          const wide = [...document.querySelectorAll('body *')]
            // Two kinds of false positive are filtered. SVG elements report
            // scrollWidth/clientWidth that mean nothing. And an element that
            // deliberately bleeds past its box is fine when an ancestor clips it:
            // the hero's dark ground extends 2.5rem each side so it can dissolve
            // into the page, and .hero has overflow:hidden, so nothing reaches the
            // document. What matters is whether the PAGE scrolls, which is
            // asserted separately at several widths.
            .filter(e => !(e instanceof SVGElement) && e.getBoundingClientRect().width > 0
                      && e.scrollWidth > e.clientWidth + 2
                      && getComputedStyle(e).overflowX === 'visible'
                      && !clippedByAncestor(e))
            .slice(0, 12)
            .map(e => `${e.tagName.toLowerCase()}.${(e.className||'').toString().split(' ')[0]} sw=${e.scrollWidth} cw=${e.clientWidth}`);
          return { docScrollW: d.scrollWidth, docClientW: d.clientWidth, bodyH: d.scrollHeight, overflowing: wide };
        }""")

        # invisible or zero-size things that should be visible
        report["suspect"] = pg.evaluate("""() => {
          const out = [];
          const check = (sel) => document.querySelectorAll(sel).forEach(e => {
            const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
            if (r.width < 2 || r.height < 2) out.push(`${sel} -> ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
            else if (cs.color === cs.backgroundColor) out.push(`${sel} -> color==bg ${cs.color}`);
          });
          ['.hero-card', '.chart-card', '.editorial-card',
           '.spec-strip', '.style-grid', '.io-panel', '.cite-block', '.ecosystem-banner', '.table-scroll',
           '#vsChart'].forEach(check);
          return out;
        }""")

        # computed styles worth confirming came from the design pack
        report["styles"] = pg.evaluate("""() => {
          const g = (sel, props) => { const e = document.querySelector(sel); if (!e) return 'MISSING';
            const cs = getComputedStyle(e); const o = {}; props.forEach(p => o[p] = cs[p]); return o; };
          return {
            body: g('body', ['fontFamily', 'backgroundColor', 'color']),
            title: g('#heroTitle', ['fontFamily', 'fontSize', 'color']),
            h2: g('.research-type-h2', ['fontFamily', 'fontSize']),
            chartCard: g('.chart-card', ['backgroundColor', 'borderRadius']),
            chartPanel: g('.chart-panel', ['backgroundColor']),
            rowLabel: g('#evalChart .row-label', ['fontFamily', 'fill']),
            indic: g('.indic', ['fontFamily']),
          };
        }""")

        # Element screenshots do not scroll, so nothing has revealed yet; force it.
        pg.evaluate("() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in-view'))")
        pg.wait_for_timeout(900)
        pg.screenshot(path=str(OUT / "full.png"), full_page=True)
        SHOTS = ([("hero", ".hero"), ("model", "#model"), ("vocab", "#vocabBand"),
                   ("flow", "#flowDiagram"), ("stack", "#stack"), ("arch", ".arch-card"),
                   ("eval", "#evaluation .chart-card"), ("api", "#api"), ("sibling", ".sibling-link")]
                 if TECHNICAL else
                 [("hero", ".hero"), ("vspace", "#voices .chart-card"), ("ab", "#crossCard"),
                  ("clips", "#capabilities"), ("norm", "#normCard"), ("numbers", ".editorial-card"),
                  ("limits", "#limitations"), ("sibling", ".sibling-link")])
        for name, sel in SHOTS:
            el = pg.query_selector(sel)
            if el:
                try: el.screenshot(path=str(OUT / f"{name}.png"))
                except Exception as e: report.setdefault("shot_errors", []).append(f"{name}: {e}")

        inter = {}
        # The hero's audio button was removed; the demo panel replaced it. The
        # panel is absolutely positioned over the whole card, so the thing worth
        # asserting is that when closed it does NOT eat clicks on the chips --
        # `display: grid` on the base rule silently beats [hidden]'s display:none
        # and that shipped once as "the hero buttons do nothing".
        # elementFromPoint is viewport-relative, so the hero has to be on screen:
        # the screenshot loop above leaves the page scrolled elsewhere and every
        # lookup then returns null, which reads as "nothing is clickable".
        pg.evaluate("() => window.scrollTo(0, 0)")
        pg.wait_for_timeout(300)
        inter["chips_clickable_when_demo_closed"] = pg.evaluate("""() => {
          const nav = document.querySelector('.hero-links');
          return [...nav.querySelectorAll('.research-link-chip')].every((c) => {
            const r = c.getBoundingClientRect();
            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return c === hit || c.contains(hit);
          });
        }""")
        pg.click("#heroDemoOpen")
        pg.wait_for_timeout(400)
        inter["demo"] = pg.evaluate("""() => {
          const p = document.getElementById('heroDemo');
          return {open: !p.hidden, expanded: document.getElementById('heroDemoOpen').getAttribute('aria-expanded'),
                  hasVideo: !!p.querySelector('video'), pending: !!p.querySelector('.hero-demo-pending')};
        }""")
        pg.click("#heroDemoClose")
        pg.wait_for_timeout(250)
        inter["demo_closed"] = pg.evaluate("() => document.getElementById('heroDemo').hidden")
        inter["read_aloud"] = pg.evaluate("""() => {
          const b = document.getElementById('raBtn');
          return b ? {disabled: b.disabled, pending: !!document.getElementById('readAloud').dataset.pending} : null;
        }""")
        # Shared: the progress bar and the table of contents exist on both posts.
        pg.evaluate("() => window.scrollTo(0, 3000)")
        pg.wait_for_timeout(400)
        inter["progress"] = pg.evaluate("() => getComputedStyle(document.getElementById('progress')).transform")
        inter["toc_active"] = pg.evaluate("() => (document.querySelector('.toc-tick.is-active')||{}).textContent")
        pg.screenshot(path=str(OUT / "scrolled.png"))
        pg.evaluate("() => window.scrollTo(0, 0)")
        pg.wait_for_timeout(300)

        if TECHNICAL:
            # The speaker-aware budget widget; the benchmark tables moved to the
            # capability post.
            before = pg.evaluate("() => budTokens.textContent")
            pg.select_option("#budVoice", "Madhukar")
            pg.wait_for_timeout(200)
            inter["budget_follows_voice"] = f'{before} -> {pg.evaluate("() => budTokens.textContent")}'
            inter["norm_tabs"] = pg.evaluate("() => document.querySelectorAll('#normTabs .lang-tab').length")
        else:
            # The clip browser, the A/B pairs, the benchmark data table, and playing
            # a voice from the plot.
            pg.evaluate("() => document.querySelector('#evaluation .chart-data-toggle').click()")
            pg.wait_for_timeout(200)
            inter["data_table_open"] = pg.evaluate("() => document.querySelector('#evaluation details.chart-data').open")
            pg.click("#clipTabs .lang-tab:nth-child(4)")
            pg.wait_for_timeout(250)
            inter["tab_switch"] = pg.evaluate("() => document.querySelector('#clipTabs .lang-tab.is-active').textContent + ' / panel ' + document.querySelector('.clip-panel.is-active').dataset.lang")
            pg.click("#abTabs .lang-tab:nth-child(2)")
            pg.wait_for_timeout(250)
            inter["ab_switch"] = pg.evaluate("() => document.querySelector('.ab-panel.is-active').dataset.lang + ' / ' + document.querySelectorAll('.ab-panel.is-active audio').length + ' players'")
            pg.dispatch_event(".vs-pt >> nth=8", "mouseenter")
            pg.wait_for_timeout(250)
            inter["tooltip"] = pg.evaluate("() => { const t = document.getElementById('vsTip'); return t.classList.contains('show') + ' | ' + t.textContent.slice(0, 40); }")
            pg.evaluate("() => document.querySelectorAll('.vs-pt')[8].dispatchEvent(new Event('click'))")
            pg.wait_for_timeout(300)
            inter["voice_player"] = pg.evaluate("() => (document.querySelector('#vsPlayer audio')||{}).getAttribute ? document.querySelector('#vsPlayer audio').getAttribute('src') : null")
        report["interactions"] = inter

        # mobile
        m = b.new_page(viewport={"width": 390, "height": 844})
        m.goto(URL, wait_until="networkidle", timeout=60000)
        m.wait_for_timeout(800)
        # A min-width inside a card must scroll in its own container, never widen the
        # document. This regressed once when the flow diagram was added.
        report["mobile_page_scrolls"] = m.evaluate(
            "() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")

        report["mobile"] = m.evaluate("""() => ({
          docScrollW: document.documentElement.scrollWidth, docClientW: document.documentElement.clientWidth,
          railVisible: getComputedStyle(document.querySelector('.toc-rail')).display,
          pillsVisible: getComputedStyle(document.querySelector('.toc-pills')).display,
          // Present on the capability post only.
          voicePlotW: document.querySelector('#vsChart')
            ? Math.round(document.querySelector('#vsChart').getBoundingClientRect().width) : null,
          voiceLabelPx: document.querySelector('.vs-label')
            ? getComputedStyle(document.querySelector('.vs-label')).fontSize : null,
        })""")
        m.screenshot(path=str(OUT / "mobile.png"), full_page=True)
        m.locator(".hero").screenshot(path=str(OUT / "hero-mobile.png"))

        # Accessibility is a separate execution path: no ambient breathing,
        # no hidden reveal targets, and a settled hero frame.
        rm = b.new_page(viewport={"width": 900, "height": 700})
        rm.emulate_media(reduced_motion="reduce")
        rm.goto(URL, wait_until="networkidle", timeout=60000)
        rm.wait_for_timeout(250)
        report["reduced_motion"] = rm.evaluate("""() => ({
          ambientAnimation: getComputedStyle(document.querySelector('.hero'), '::before').animationName,
          hiddenReveals: [...document.querySelectorAll('.reveal')]
            .filter(e => getComputedStyle(e).opacity === '0').length,
          heroWillEnter: document.querySelector('.hero-card').classList.contains('will-enter')
        })""")
        b.close()
    print(json.dumps(report, indent=1)[:6000])

main()
