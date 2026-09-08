#!/usr/bin/env python3
"""Generate the Telugu narration that fills the `single person narration audiobook`
card in the delivery-styles widget.

    python3 blog/src/narrgen.py --dry-run     # the chunk plan, no API calls
    python3 blog/src/narrgen.py               # generate and write the mp3

Sampling is the arm asked for: temperature 0.6, top_p 0.9, repetition_penalty 1.2, in
Vamsi's voice (te, male, 143 Hz, 11.8 chars/s measured).

Chunked for the same reason abgen.py is: the hosted context is 4096 tokens shared
between prompt and audio, and Telugu costs ~1.92 tokens per character. At 300 chars a
chunk that is ~25 s of speech (~2085 audio tokens) against a ~593-token prompt, which
leaves room under both the 4096 context and the 2520 default max_new_tokens. Chunks
break on sentence boundaries and are stitched with the same tapers as the chapter, so
the endpoint's clipped final phoneme does not click at a seam.

Writes blog/audio/style_narration_te_Vamsi.mp3 and blog/src/narration.json, which
stylegen.py reads into the styles widget.
"""
import argparse
import base64
import json
import sys
from pathlib import Path

BLOG = Path(__file__).resolve().parents[1]
REPO = BLOG.parent
sys.path.insert(0, str(REPO / "verify_api"))
sys.path.insert(0, str(BLOG / "src"))

from speak import SAMPLE_RATE, speak                      # noqa: E402
from synth_benchmark import chunk_text                    # noqa: E402
from seam import stitch_tapered                           # noqa: E402

VOICE, LANG, STYLE = "Vamsi", "te", "single person narration audiobook"
TTS = {"temperature": 0.6, "top_p": 0.9, "repetition_penalty": 1.2}
MAX_CHARS = 300
GAP_SENTENCE_MS = 180
GAP_PARAGRAPH_MS = 620
SRC = BLOG / "src" / "narration_te.txt"
OUT = BLOG / "audio" / "style_narration_te_Vamsi.mp3"
META = BLOG / "src" / "narration.json"
CPS = 11.8


def pcm_of(events):
    return b"".join(base64.b64decode(e["choices"][0]["text"]) for e in events
                    if e.get("choices") and e["choices"][0].get("text"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    paras = [p.strip() for p in SRC.read_text(encoding="utf-8").split("\n\n") if p.strip()]
    plan = [chunk_text(p, MAX_CHARS) for p in paras]
    print(f"{len(paras)} paragraphs -> {sum(len(c) for c in plan)} requests "
          f"(max {MAX_CHARS} chars, ~{MAX_CHARS / CPS:.1f}s each)")
    for i, (p, chunks) in enumerate(zip(paras, plan), 1):
        print(f"  para {i}: {len(p):>4} chars -> {len(chunks)} chunk(s) "
              f"{[len(c) for c in chunks]}  ~{len(p) / CPS:.1f}s")
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
                  f"{len(pcm) / 2 / SAMPLE_RATE:5.2f}s", flush=True)
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
    META.write_text(json.dumps({
        "file": f"audio/{OUT.name}", "voice": VOICE, "lang": LANG, "style": STYLE,
        "sampling": TTS, "dur": round(dur, 2), "para_starts": starts,
        "paragraphs": paras, "requests": sum(len(c) for c in plan),
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nwrote {OUT.relative_to(REPO)}  {OUT.stat().st_size // 1024} kB  {dur:.1f}s")
    print(f"  paragraph starts: {starts}")


if __name__ == "__main__":
    main()
