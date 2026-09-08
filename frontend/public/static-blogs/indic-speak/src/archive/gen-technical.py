from pathlib import Path
import re

BLOG = Path("/projects/data/ttsteam/ashwin/gemma-tts/blog")
ARCH = (BLOG / "src/archive/body-before-split.html").read_text(encoding="utf-8")
CAP = (BLOG / "src/body-capability.html").read_text(encoding="utf-8")


def figure_by_title(title, cls="chart-card"):
    k = ARCH.index(f'>{title}</h3>')
    start = ARCH.rindex(f'<figure class="{cls}', 0, k)
    depth, i = 0, start
    while True:
        nxt_open = ARCH.find("<figure", i + 1)
        nxt_close = ARCH.find("</figure>", i + 1)
        if nxt_open != -1 and nxt_open < nxt_close:
            depth += 1; i = nxt_open
        else:
            if depth == 0:
                return ARCH[start:nxt_close + len("</figure>")]
            depth -= 1; i = nxt_close


def region(start, end):
    i = ARCH.index(start)
    return ARCH[i:ARCH.index(end, i + len(start))]


def indent(s, n=8):
    pad = " " * n
    return "\n".join(pad + ln.strip() if ln.strip() else "" for ln in s.split("\n"))


VOCAB = figure_by_title("Audio lives inside the text vocabulary")
FLOW = figure_by_title("From your sentence to a waveform")
STACK = region('      <div class="research-feature-grid left">\n        <article class="research-feature-card">\n          <p class="research-feature-index">model</p>',
               '      <div class="research-subsection">\n        <h3 class="research-type-h3">What the model is</h3>')
ARCHCARD = region('      <figure class="editorial-card arch-card">',
                  '      <div class="research-subsection">\n        <h3 class="research-type-h3">Why a language-model backbone')
NORM = region('      <div class="research-subsection">\n        <h3 class="research-type-h3">Writing for the ear</h3>',
              '    </section>\n\n    <section id="tech"')
# This region runs to the cite block, so it carries the outlook section and the
# article's own closing tag; the template supplies that tag itself.
LIMITS = region('    <section id="limitations"', '  <section class="cite-block">')
LIMITS = LIMITS[:LIMITS.rindex("</article>")].rstrip()
LIMITS = LIMITS[:LIMITS.rindex("</section>") + len("</section>")] + "\n"
# the shared frame comes from the capability page so both stay in step
OPEN = CAP[:CAP.index('<header class="hero">')]
TAIL = CAP[CAP.index("  </article>"):]

HERO = '''<header class="hero">
  <div class="research-article-column hero-inner">
    <p class="research-type-eyebrow hero-eyebrow">Technical report<span class="sep">·</span><span>3 September 2026</span><span class="sep">·</span><span>8 min read</span></p>

    <div class="hero-card">
      <div class="wave" id="waveField" aria-hidden="true"><div class="wave-played"></div><div class="wave-head"></div></div>
      <div class="hero-scrim" aria-hidden="true"></div>

      <h1 class="research-type-title" id="heroTitle">Inside Indic-Speak: audio as vocabulary</h1>

      <nav class="hero-links" aria-label="Publication links">
        <a class="research-link-chip" href="https://huggingface.co/bodhan-ai/indic-speak" target="_blank" rel="noopener noreferrer">Hugging Face</a>
        <a class="research-link-chip" href="#model">The model</a>
        <a class="research-link-chip" href="#api">Calling it</a>
      </nav>

      <div class="spec-strip">
        <div class="spec-chip"><span class="v">3.36B</span><span class="k">parameters</span></div>
        <div class="spec-chip"><span class="v">156,960</span><span class="k">vocabulary</span></div>
        <div class="spec-chip"><span class="v">7</span><span class="k">tokens per frame</span></div>
        <div class="spec-chip"><span class="v">82.03</span><span class="k">tokens per second</span></div>
        <div class="spec-chip"><span class="v">24 kHz</span><span class="k">output</span></div>
      </div>
    </div>
    <p class="hero-caption" id="heroCaption"></p>
  </div>
</header>
'''

DEK = "Most text-to-speech systems are a pipeline: a frontend turns letters into phonemes, a duration model decides how long each one lasts, an acoustic model produces a spectrogram, and a vocoder turns that into sound. Indic-Speak has none of those. It is a language model that was given audio in its vocabulary, and it speaks a sentence by continuing it."


def section(sid, toc, num, title, body):
    return f'''    <section id="{sid}" data-toc="{toc}">
      <header class="research-section-header">
        <div class="research-section-rule" aria-hidden="true"></div>
        <h2 class="research-type-h2"><span class="section-num">{num}</span> {title}</h2>
      </header>
{body}    </section>

'''


S1 = f'''      <p class="research-type-lead">Start from a Llama-3.2-3B decoder that already models Hindi and English in one token stream. Add 28,672 codes from a neural audio codec to its vocabulary. Train it to continue a written sentence with those codes instead of more words. That is the whole design, and the rest of this post follows from it.</p>
      <p class="research-type-body">The consequence worth sitting with is what the model does not need. No phoneme dictionary per language, so a new script costs no frontend work. No aligner, so training needs no phoneme-level timing. No duration predictor, because length is simply how much the model generates before it stops. And no language decision anywhere in the request path: text arrives as written, code-mixed or not, and the tokeniser that already handled both halves of a Hindi-English sentence handles it unchanged.</p>
      <p class="research-type-body">What it keeps is everything a text decoder already had. Attention reaches across the whole utterance, which is the mechanism behind punctuation acting as prosody: a clause can be shaped by a comma thirty words earlier. The 131,072-position context makes a long passage a budget question rather than an architectural one. And sampling behaves as it does for text, so the settings that make prose livelier make speech livelier and less reliable in the same proportion.</p>

      <div class="research-subsection">
        <p class="research-type-body">The 28,672 codes occupy one contiguous run in the middle of the vocabulary, ids 128,266 through 156,937. That contiguity does real work: telling speech from text at decode time is a range check on the token id, not a second output head and not a structure signal. Control tokens were placed below the run and conditioning tokens above it, so the added entries are deliberately not contiguous with each other. Code that assumes everything added sits above the base vocabulary is wrong here.</p>
{indent(VOCAB)}
      </div>

      <div class="research-subsection">
        <p class="research-type-body">A request is a chat-template prompt carrying the speaker name, an optional style tag and the normalised text. The model answers by opening a speech span and then emitting audio codes until it stops. Everything after that point is deterministic: the flat stream de-interleaves into codebooks, the codebooks become latents, the latents become sound.</p>
{indent(FLOW)}
      </div>
'''

S2 = f'''      <p class="research-type-lead">Three components execute when you make a request, and the language model is 98% of the parameters. The other two are small by design: one is a lookup table, and one is a vocoder that was fine-tuned rather than trained from scratch.</p>
{STACK}{ARCHCARD}'''

S3 = '''      <p class="research-type-lead">A purpose-built acoustic model with a phoneme frontend was the alternative, and for one language it would have been the safer engineering. Three things made the language-model route the better bet for twenty-two of them.</p>
      <div class="research-bullet-block">
        <ul class="research-bullet-list">
          <li class="research-bullet-item"><span class="research-bullet-marker" aria-hidden="true">01</span><span class="research-bullet-text"><b>Code-mixing costs nothing.</b> A phoneme frontend has to know which language a span is in before it can look anything up, and Indian text mixes scripts inside a clause. A backbone that already tokenises both halves needs no such decision, so the hardest case for a pipeline is the default case here.</span></li>
          <li class="research-bullet-item"><span class="research-bullet-marker" aria-hidden="true">02</span><span class="research-bullet-text"><b>Punctuation is already prosody.</b> The model treats a comma as a boundary and a question mark as a contour because it learned that from text. A pipeline has to be told, usually through a hand-built feature.</span></li>
          <li class="research-bullet-item"><span class="research-bullet-marker" aria-hidden="true">03</span><span class="research-bullet-text"><b>Length is a budget, not a redesign.</b> A multi-minute utterance becomes a sequence-length question with a known answer: 82.03 tokens per second of speech against 131,072 positions.</span></li>
        </ul>
      </div>
      <p class="research-type-body">The cost lands on measurement. Generation is sampled, so output varies between runs, and a rare bad sample still sounds like fluent speech: clean audio, wrong words. A signal-quality metric cannot see that failure at all. So the evaluation reads transcripts and scores content rather than measuring the waveform, and reports the shape of the distribution rather than only its mean.</p>
'''

S5_TMPL = '''      <p class="research-type-lead">One POST, one stream, no state. The shapes below are settled. The endpoint path and the auth header are placeholders until the public URL is announced.</p>
      <div class="research-subsection">
        <h3 class="research-type-h3">The request</h3>
        <pre class="prompt-box">POST /v1/audio/speech
Content-Type: application/json

{
  "prompt": "भारत एक हज़ार नौ सौ सैंतालीस में स्वतंत्र हुआ।",
  "voice": "Amit",
  "style": "news"
}</pre>
        <p class="research-type-body">Only the text is required. The voice defaults to Amit, and omitting the style gives the conversational register, which is the right choice for plain reading. Sampling fields are optional and forwarded as given; the defaults are temperature 0.6, top-p 0.9, top-k 50 and a repetition penalty of 1.2, with a token ceiling matching the 30-second window. A voice or style outside the accepted lists is rejected rather than approximated, so validate against those lists client-side.</p>
      </div>
      <div class="research-subsection">
        <h3 class="research-type-h3">The response</h3>
        <p class="research-type-body">Audio arrives as server-sent events while it is being generated, each carrying base64 of raw PCM16, signed little-endian, mono, 24 kHz. No WAV header and no length prefix, so a client concatenates windows in order. Four details decide whether that client is correct.</p>
        <div class="research-bullet-block">
          <ul class="research-bullet-list">
            <li class="research-bullet-item"><span class="research-bullet-marker" aria-hidden="true">01</span><span class="research-bullet-text"><b>Concatenate, do not overlap-add.</b> Consecutive windows do not overlap, so crossfading them smears the output.</span></li>
            <li class="research-bullet-item"><span class="research-bullet-marker" aria-hidden="true">02</span><span class="research-bullet-text"><b>Payload sizes vary.</b> The first event carries two frames and later ones carry one, so a fixed-size read breaks on the second event.</span></li>
            <li class="research-bullet-item"><span class="research-bullet-marker" aria-hidden="true">03</span><span class="research-bullet-text"><b>Some payloads are empty.</b> Skip them rather than reading an empty window as end-of-stream.</span></li>
            <li class="research-bullet-item"><span class="research-bullet-marker" aria-hidden="true">04</span><span class="research-bullet-text"><b>Require the terminator.</b> A stream that ends without the done sentinel failed mid-generation, and the status line already said 200. Its absence is the only signal you get.</span></li>
          </ul>
        </div>
        <p class="cap-subnote">Splitting long text is the caller's job. A request synthesises what it is given, and more than about 30 seconds of speech will truncate rather than continue.</p>
      </div>
{NORM_BLOCK}'''

S5 = S5_TMPL.replace("{NORM_BLOCK}", NORM)

body = (section("model", "The model", "01", "Audio as vocabulary", S1)
        + section("stack", "The stack", "02", "The three pieces that run", S2)
        + section("why", "Why an LLM", "03", "What the choice buys, and what it costs", S3)
        + section("api", "Using it", "04", "Calling it", S5)
        + LIMITS.replace('<span class="section-num">06</span>', '<span class="section-num">06</span>'))

SIBLING = '''  <aside class="sibling-link">
    <div class="research-article-column">
      <p class="research-type-eyebrow sibling-eyebrow">For everyone else</p>
      <h2 class="research-type-h2 sibling-title">Hear it first</h2>
      <p class="research-type-body sibling-body">Forty-five voices you can play, the same sentence read by a native and a non-native voice in ten languages, and a five-minute audiobook chapter.</p>
      <a class="research-link-chip sibling-chip" href="indic-speak.html">Read the announcement</a>
    </div>
  </aside>
'''

out = OPEN + HERO + f'''
<div class="research-article-column">
  <p class="research-type-dek">{DEK}</p>

  <nav class="toc-pills" id="tocPills" aria-label="Table of contents">
    <p class="research-type-eyebrow toc-pills-title">On this page</p>
    <ul></ul>
  </nav>

  <article class="research-prose">
{body}  </article>

{SIBLING}
''' + TAIL[TAIL.index("  <section class=\"cite-block\">"):]

(BLOG / "src/body-technical.html").write_text(out, encoding="utf-8")
print(f"wrote {len(out):,} bytes")
