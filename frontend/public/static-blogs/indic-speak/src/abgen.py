#!/usr/bin/env python3
"""Regenerate the long-form audiobook clip, one paragraph at a time, and stitch it.

    python3 blog/src/abgen.py --dry-run      # the chunk plan, no API calls
    python3 blog/src/abgen.py                # generate and write the mp3

Sampling is the arm asked for: temperature 0.6, top_p 0.9, repetition_penalty 1.2, in
the `single person narration audiobook` style, in Arun's voice, which is what the
source row in data/benchmark_eval/input_psbook.jsonl was cast with.

WHY THIS IS NOT ONE REQUEST PER PARAGRAPH. These paragraphs run 556-713 characters,
which at Arun's measured 14.5 chars/s is 38-49 s of speech. One request cannot hold
that: the hosted context is 4096 tokens shared between prompt and audio, and the
longest paragraph needs about 3990 audio tokens (49.2 s x 82.03 tokens/s) on top of a
~1090-token Tamil prompt. So each paragraph is chunked on sentence boundaries, every
chunk is its own request, and the paragraph is reassembled from them. The paragraph is
still the unit the page and the stitch treat as whole: chunk seams fall on sentence
ends and get a short beat, paragraph seams get a longer one.

Writes blog/audio/ta_Arun_ponniyin_selvan_ch1.mp3 and blog/src/ab.json (per-paragraph
start times, which is what the page's fade timestamp and the read-along need).
"""
import argparse
import base64
import json
import re
import sys
from pathlib import Path

BLOG = Path(__file__).resolve().parents[1]
REPO = BLOG.parent
sys.path.insert(0, str(REPO / "verify_api"))
sys.path.insert(0, str(BLOG / "src"))

from speak import SAMPLE_RATE, speak                      # noqa: E402
from synth_benchmark import chunk_text                    # noqa: E402
from seam import stitch_tapered                           # noqa: E402

VOICE, LANG, STYLE = "Arun", "ta", "single person narration audiobook"
TTS = {"temperature": 0.6, "top_p": 0.9, "repetition_penalty": 1.2}
# 340 chars is ~23.4 s at Arun's pace: 1922 audio tokens against the 2520 default
# ceiling, and ~2455 of the 4096 context once the Tamil prompt is counted.
MAX_CHARS = 340
GAP_SENTENCE_MS = 180        # between chunks inside a paragraph: a breath
GAP_PARAGRAPH_MS = 620       # between paragraphs: a beat the reader can hear
OUT = BLOG / "audio" / "ta_Arun_ponniyin_selvan_ch1.mp3"


TEXT = BLOG / "src" / "psbook_ch1.txt"


def paragraphs():
    """The chapter, blank-line separated. This file is the source of truth: the audio
    is generated from it and the page's text is written from it, so the two cannot
    drift apart the way they did when the text lived in the page data alone."""
    paras = [p.strip() for p in TEXT.read_text(encoding="utf-8").split("\n\n") if p.strip()]
    html = (BLOG / "indic-speak.html").read_text(encoding="utf-8")
    data = json.loads(re.search(r'<script id="page-data" type="application/json">(.*?)</script>',
                                html, re.S).group(1))
    return paras, data["voices"][VOICE]["cps"]


def pcm_of(events):
    return b"".join(base64.b64decode(e["choices"][0]["text"]) for e in events
                    if e.get("choices") and e["choices"][0].get("text"))


def sync_page(paras, dur):
    """Write the chapter and its length into the page data, which is where the widget
    reads them from. Done here rather than by hand: the text on the page and the text
    that was spoken have to be the same text, and the duration has to be the file's."""
    page = BLOG / "indic-speak.html"
    html = page.read_text(encoding="utf-8")
    m = re.search(r'(<script id="page-data" type="application/json">)(.*?)(</script>)', html, re.S)
    data = json.loads(m.group(2))
    lf = [c for c in data["clips"] if c.get("kind") == "longform"][0]
    before = (len(lf["paragraphs"]), lf["dur"])
    lf["paragraphs"] = paras
    lf["text_raw"] = " ".join(paras)
    lf["dur"] = dur
    page.write_text(html[:m.start(2)] + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
                    + html[m.end(2):], encoding="utf-8")
    print(f"  page data: {before[0]} paragraphs / {before[1]}s -> {len(paras)} / {dur}s")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--sync-only", action="store_true",
                    help="re-apply an existing src/ab.json to the page, no API calls")
    a = ap.parse_args()
    if a.sync_only:
        ab = json.loads((BLOG / "src" / "ab.json").read_text(encoding="utf-8"))
        sync_page(ab["paragraphs"], ab["dur"])
        return

    paras, cps = paragraphs()
    plan = [chunk_text(p, MAX_CHARS) for p in paras]
    print(f"{len(paras)} paragraphs -> {sum(len(c) for c in plan)} requests "
          f"(max {MAX_CHARS} chars, ~{MAX_CHARS / cps:.1f}s each)")
    for i, (p, chunks) in enumerate(zip(paras, plan), 1):
        print(f"  para {i}: {len(p):>4} chars -> {len(chunks)} chunk(s) "
              f"{[len(c) for c in chunks]}  ~{len(p) / cps:.1f}s")
        assert "".join(chunks).replace(" ", "") == p.replace(" ", "").replace("\n", ""), \
            f"paragraph {i} does not round-trip through the chunker"
    if a.dry_run:
        print("\ndry run: no API calls, nothing written")
        return

    import soundfile as sf
    import numpy as np

    body, starts = [], []
    at = 0.0
    for i, (para, chunks) in enumerate(zip(paras, plan), 1):
        parts = []
        for j, c in enumerate(chunks, 1):
            ev = speak(c, lang=LANG, voice=VOICE, style=STYLE, tts_kwargs=TTS)
            pcm = pcm_of(ev)
            parts.append(pcm)
            print(f"  para {i} chunk {j}/{len(chunks)}: {len(c):>3} chars -> "
                  f"{len(pcm) / 2 / SAMPLE_RATE:5.2f}s")
        seg = stitch_tapered(parts, GAP_SENTENCE_MS, SAMPLE_RATE)
        starts.append(round(at, 3))
        at += len(seg) / 2 / SAMPLE_RATE
        body.append(seg)
        if i < len(paras):
            at += GAP_PARAGRAPH_MS / 1000.0
    audio = stitch_tapered(body, GAP_PARAGRAPH_MS, SAMPLE_RATE)

    pcm = np.frombuffer(audio, dtype="<i2")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sf.write(OUT, pcm, SAMPLE_RATE, format="MP3", compression_level=0.6)
    dur = len(pcm) / SAMPLE_RATE
    (BLOG / "src" / "ab.json").write_text(json.dumps({
        "file": f"audio/{OUT.name}", "voice": VOICE, "lang": LANG, "style": STYLE,
        "sampling": TTS, "dur": round(dur, 2), "para_starts": starts,
        "paragraphs": paras,
        # Where the narration passes the last words on screen. Only paragraph one is
        # shown, so this is its end: measured from the stitch, not guessed.
        "fade_at": round(starts[1] - GAP_PARAGRAPH_MS / 1000.0, 2),
        "requests": sum(len(c) for c in plan),
    }, ensure_ascii=False), encoding="utf-8")
    sync_page(paras, round(dur, 2))
    print(f"\nwrote {OUT.relative_to(REPO)}  {OUT.stat().st_size / 1000:.0f} kB  {dur:.1f}s")
    print(f"  paragraph starts: {starts}")
    print(f"  paragraph 1 ends at {starts[1] - GAP_PARAGRAPH_MS / 1000:.1f}s "
          f"— the natural fade point while only paragraph 1 is on screen")


if __name__ == "__main__":
    main()
