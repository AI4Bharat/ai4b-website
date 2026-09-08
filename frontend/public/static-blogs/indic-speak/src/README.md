# Indic-Speak: two posts, one toolchain

Two pages are built from one set of sources:

| page | audience | sections |
|---|---|---|
| `../indic-speak.html` | anyone | voices you can play, the cross-lingual A/B, what it does, **and the whole performance block** |
| `../indic-speak-technical.html` | developers and researchers | **architecture, the API, and examples** |

The division is by question, not by difficulty. The announcement answers "what does it
sound like and how good is it", so every measurement lives there: the benchmark chart,
the three-number card, the load behaviour, the word-error-rate aside. The technical
post answers "how does it work and how do I call it", so it carries the vocabulary
layout, the decode path, the parameter breakdown, the request and response contract,
and no benchmark charts at all. `smoke.js` asserts that division on both pages, so
content cannot drift across the line unnoticed.

Examples are deliberately shared: the normaliser showcase appears on both, because
what to send is as much a developer question as a reader's curiosity.

They share `post.css` and `page.js`. **Every widget in `page.js` bails out when its
own container is missing**, which is what lets one script serve both — so a section
can move between posts by moving its markup, with no JS change. Each page carries
only the data blobs its widgets need.

## Build and verify

    python3 src/build.py        # -> both pages
    python3 src/check.py        # static checks over BOTH pages
    node    src/smoke.js        # capability post, 49 assertions
    node    src/smoke.js ../indic-speak-technical.html   # technical post, 31
    python3 src/review.py                              # browser review, capability
    python3 src/review.py indic-speak-technical.html    # browser review, technical
    python3 src/perf.py         # scroll frame timings

Regenerators, only needed when their inputs change:

    python3 src/clipgen.py      # -> clips.json  (A/B pairs + 45 voice samples, encodes mp3)
    python3 src/normgen.py      # -> norm.json   (normaliser examples, real output)
    python3 src/herogen.py      # -> hero.json   (hero waveform envelope)
    <torch python> src/paramcount.py   # -> params.json

## Files

- `body-capability.html`, `body-technical.html` — the two posts' markup
- `post.css` — shared styling: token bridge, hero, widgets, diagrams
- `page.js` — every widget, each guarded on its container
- `check.py` — data blobs parse, tags balance, no class used without a rule, no
  anchor pointing at a missing section, every referenced asset and clip on disk.
  **Runs over both pages**, because running it over one is how a `.prompt-box` with
  no CSS rule reached the technical post and pushed the document sideways on a phone.
- `smoke.js` — DOM shim; takes a page path, and skips the assertions for widgets
  that page does not carry
- `review.py` — Playwright: console errors, failed requests, layout overflow,
  computed styles, interactions, mobile width, screenshots into `../shots/<page>/`
- `perf.py` — scroll frame timings with suspects disabled one at a time
- `clipgen.py`, `normgen.py`, `herogen.py`, `paramcount.py` — the generators
- `mapgen.py` — **not in the build.** Generated a removed voice atlas; see its header

## What the generators guarantee

- `clipgen.py` picks audio by rule, never by hand: for each language, the sentence
  whose transcripts matched most closely among those a native and a non-native voice
  both placed in the judge's top band. Asserts every pair shares one sentence and
  every clip carries a score. Also trims one sample per voice so all 45 are audible.
- `paramcount.py` counts only what runs at inference: the backbone from the
  safetensors header, the SNAC **quantizer** (0.14 M), and the Vocos EMA decoder
  (58.4 M). SNAC's encoder and decoder are in that checkpoint but never in the path,
  because `eval/eval_gen_common.py:180` does `snac.quantizer.from_codes(codes)` and
  hands the latents straight to Vocos. Needs a torch python:
  `/projects/data/ttsteam/miniconda3/envs/gemma-tts-next/bin/python`.
- `normgen.py` records what the sibling text-norm library returns. Nothing in
  `norm.json` is written by hand. `number_lang` is a **constructor** argument.

## Running Playwright on this host

Chromium is installed but misses one system library, staged by an earlier session:

    LD_LIBRARY_PATH=/tmp/playwright-libs/usr/lib/x86_64-linux-gnu \
    PLAYWRIGHT_BROWSERS_PATH=/home/ttsteam/.cache/ms-playwright \
    python3 src/review.py

Both scripts read `http://127.0.0.1:8790/`, so serve the folder first:

    python3 -m http.server 8790 --bind 127.0.0.1

## Diagram conventions

`page.js` draws the hero ripple on canvas and four diagrams as SVG: the vocabulary
band, the end-to-end flow, the 7-token frame, and the evaluation chart. Two rules
learned the hard way:

- **Check the bbox against the viewBox.** SVG paints outside its canvas, so a label
  that fits in the source can still be clipped. A callout leader once ran 89px past
  the right edge and only that check found it.
- **A `min-width` needs a scrolling parent.** Giving a diagram a floor so its labels
  stay legible will widen the whole document unless the wrapper has
  `overflow-x: auto`. `review.py` now asserts the document never scrolls sideways
  at 390px, on both pages.

The vocabulary band is drawn to scale deliberately: audio codes are 18% of the
vocabulary, and equal-width blocks would tell the opposite story.

## The hero

The hero is a restrained editorial introduction. A 2D canvas sends simple sound
ripples across the white card, while the foreground carries the partner marks, a
short product title with one orange accent, publication links, and five white spec
cards. The measured envelope from `audio/hi_Kavya.mp3` shapes the ripple weight, but
the page leaves that implementation detail out of the reader-facing copy.

Listening starts in the first article section, where it can support the story rather
than competing with the headline. The hero's “Demo” control opens a focused sample
panel, and “Try it out” jumps to the full voice experience.

The implementation is deliberately bounded:

- one resolution-independent canvas, capped at 30fps;
- the render loop stops outside the viewport;
- reduced motion draws one representative frame and does not loop;
- if canvas is unavailable, the visual is hidden while the complete hero copy and
  publication links remain functional;
- without JavaScript, the hero remains visible and a direct sample link is shown.

The durable design rule is to validate the animation's narrative before polishing
it: the three states—input, transformation, result—must be understandable from the
first screen and become more convincing, rather than less clear, when motion starts.

## Where the design pack comes from

`design.css` is inlined verbatim at build time from
`/projects/data/llmteam/translation/ujjwal/code/c3po/blog/mt-blog/src/design.css` —
the same file the Indic-Translate post uses. The benchmark data blob is read back out
of the existing capability page, so the measured numbers survive a rebuild.
