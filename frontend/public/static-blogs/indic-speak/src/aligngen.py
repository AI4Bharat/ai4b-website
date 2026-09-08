#!/usr/bin/env python3
"""Word timings for the read-along transcript, estimated from measured energy.

    python3 src/aligngen.py            # writes src/align.json

For the short clips this is NOT forced alignment: there is no aligner run
over them, so instead of spreading words evenly over the duration -- which
visibly desynchronises at every pause -- each word is placed by **cumulative
acoustic energy**:

    a word's share of the text's characters == its share of the clip's energy

Silence carries no energy, so the highlight simply waits through a pause and
then catches up through a dense phrase. Within a phrase it still drifts, because
characters are not a perfect proxy for duration; the page says so.

Only clips whose text actually corresponds to their audio are included. The 45
voice samples are trimmed excerpts carrying the full sentence, so they are
excluded -- captioning them would be wrong by many seconds.

Every clip with a transcript on the page IS force-aligned when its alignment
file exists: torchaudio's MMS_FA (Meta's multilingual wav2vec2 CTC aligner over
uroman romanisation) was run over all 99 blog clips into
audio_generations/blog_alignments/<stem>.json, with the audiobook's and the
style samples' earlier runs in audio_generations/ponniyin/ and blog_styles/.
When a file is present its start and end per word replace the estimate, which
drifted up to six seconds by the middle of the chapter. A token the aligner
could not time -- a bare digit, an equals sign, a dash -- borrows its
neighbours' times so the highlight never skips.

The 45 voice samples are trimmed excerpts of a longer sentence. They were
aligned on the untrimmed source and cut back to the words that finish inside
the excerpt, so their transcript is the words actually heard, not the sentence.
"""
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf

SRC = Path(__file__).parent
BLOG = SRC.parent
REPO = BLOG.parent
# The audiobook chapter is not in clips.json. Its text is the same file src/abgen.py
# generated the audio from, so the words being highlighted are by construction the
# words that were spoken -- there is no second take to get out of step with.
EXTRA = [{
    "file": "audio/ta_Arun_ponniyin_selvan_ch1.mp3",
    "text_file": SRC / "psbook_ch1.txt",
    "voice": "Arun", "lang": "ta", "native": True, "long": True,
    "align_file": REPO / "audio_generations/ponniyin/alignments/ps_ch1_ta.json",
}]
STYLE_ALIGN = REPO / "audio_generations/blog_styles/alignments"
BLOG_ALIGN = REPO / "audio_generations/blog_alignments"


def wall_rows():
    """The per-language clips on the language tabs. Their text lives in the
    page-data block, which build.py carries forward from the built page."""
    html = (BLOG / "indic-speak.html").read_text(encoding="utf-8")
    page = json.loads(re.search(r'<script id="page-data" type="application/json">(.*?)</script>', html, re.S).group(1))
    return [{
        "file": c["file"], "text": c.get("text_raw") or c["text"], "voice": c["voice"], "lang": c["lang"],
        "native": True, "long": False, "trimmed": False,
    } for c in page["clips"] if "ponniyin" not in c["file"]]


def style_rows():
    """The style samples, from src/styles.json: text and paragraphs as the page
    shows them, so the spans being lit are exactly the words on the card."""
    S = json.loads((SRC / "styles.json").read_text(encoding="utf-8"))
    rows = []
    for r in S["context"] + S["emotion"]:
        s = r.get("sample")
        if not s:
            continue
        paras = s.get("paras") or ([s["text"]] if s.get("text") else [])
        if not paras:
            continue
        rows.append({
            "file": s["file"], "text": " ".join(paras), "paras": paras,
            "voice": s.get("voice") or s.get("speaker") or "", "lang": s.get("lang"),
            "native": True, "long": len(" ".join(paras).split()) > 120, "trimmed": False,
            "align_file": STYLE_ALIGN / (Path(s["file"]).stem + ".json"),
        })
    return rows
HOP = 1200                 # ~50 ms at 24 kHz: fine enough to see a pause
D36 = "0123456789abcdefghijklmnopqrstuvwxyz"
FLOOR = 0.02               # below this a frame counts as silence, not speech


def energy(path):
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    n = int(np.ceil(len(x) / HOP))
    pad = np.concatenate([x, np.zeros(n * HOP - len(x), dtype="float32")]).reshape(n, HOP)
    rms = np.sqrt((pad ** 2).mean(axis=1))
    ref = np.percentile(rms, 97) or 1.0
    return np.clip(rms / ref, 0, 1), len(x) / sr, sr


def main():
    clips = json.loads((SRC / "clips.json").read_text(encoding="utf-8"))
    rows = list(clips["ab"]) + list(clips["voices"])
    for e in EXTRA:
        paras = [p.strip() for p in e["text_file"].read_text(encoding="utf-8").split("\n\n")
                 if p.strip()]
        rows.append(dict(e, text=" ".join(paras), paras=paras, trimmed=False))
    rows += style_rows() + wall_rows()

    out, skipped = {}, []
    for c in rows:
        text = (c.get("text") or "").strip()
        af = c.get("align_file") or BLOG_ALIGN / (Path(c["file"]).stem + ".json")
        if c.get("trimmed"):
            # An excerpt: captioned only from its alignment on the untrimmed
            # source, cut to the words heard, never from the whole sentence.
            if not Path(af).exists():
                skipped.append((c["voice"], "trimmed: audio is an excerpt, text is the whole sentence"))
                continue
            al = json.loads(Path(af).read_text(encoding="utf-8"))
            assert al.get("trimmed") and al["words"], c["file"]
            # The kept list omits tokens the aligner could not time (a dash), so
            # walk the sentence and keep those in place, untimed, up to the last
            # word that was heard. Anything else out of order is a real mismatch.
            merged, k, keep = [], 0, al["words"]
            for tok in text.split():
                if k < len(keep) and tok == keep[k]["word"]:
                    merged.append(keep[k]); k += 1
                elif not re.search(r"[^\W_]", tok):
                    merged.append({"word": tok, "start": None, "end": None, "score": None})
                else:
                    raise AssertionError((c["file"], "excerpt is not a prefix of the sentence", tok))
                if k == len(keep):
                    break
            assert k == len(keep), c["file"]
            text = " ".join(w["word"] for w in merged)
            c = dict(c, align_file=af, excerpt=True, align_words=merged)
        c = dict(c, align_file=af)
        if not text:
            skipped.append((c["voice"], "no text"))
            continue
        path = BLOG / c["file"]
        if not path.exists():
            skipped.append((c["voice"], "audio missing"))
            continue

        e, dur, sr = energy(path)
        # Speech-only energy: a silent frame must not advance the transcript.
        speech = np.where(e < FLOOR, 0.0, e)
        cum = np.concatenate([[0.0], np.cumsum(speech)])
        total = cum[-1]
        assert total > 0, c["file"]

        # Words keep their trailing space so spacing survives a re-join, and the
        # character weight includes it -- a gap between words is real time.
        words = re.findall(r"\S+\s*", text)
        widths = np.array([len(w) for w in words], dtype=float)
        edges = np.concatenate([[0.0], np.cumsum(widths)]) / widths.sum()

        # invert the cumulative-energy curve: at what time has share s been spent?
        frame_t = np.arange(len(cum)) * HOP / sr
        starts = np.interp(edges * total, cum, frame_t)
        assert np.all(np.diff(starts) >= -1e-6), c["file"]
        assert starts[0] >= 0 and starts[-1] <= dur + 0.05, (c["file"], starts[-1], dur)

        # A real alignment, where one exists, overrides the estimate. Its words
        # must be exactly the text's words, in order, or the spans would light
        # the wrong syllables -- so that is asserted, not assumed.
        ends, aligned = None, False
        af = c.get("align_file")
        if af and Path(af).exists():
            al = json.loads(Path(af).read_text(encoding="utf-8"))
            if c.get("align_words"):
                al = {"words": c["align_words"]}
            aw = [w["word"] for w in al["words"]]
            assert aw == [w.strip() for w in words], (c["file"], "alignment words differ from the text")
            st = [w["start"] for w in al["words"]]
            en = [w["end"] for w in al["words"]]
            # An untimed token takes the end of the word before it (or the start
            # of the one after, at the front), so it is lit in passing.
            for i in range(len(st)):
                if st[i] is None:
                    prev_end = next((en[k] for k in range(i - 1, -1, -1) if en[k] is not None), None)
                    next_start = next((st[k] for k in range(i + 1, len(st)) if st[k] is not None), dur)
                    st[i] = prev_end if prev_end is not None else next_start
                    en[i] = next_start
            assert all(st[i] <= st[i + 1] for i in range(len(st) - 1)), c["file"]
            assert en[-1] <= dur + 0.05, (en[-1], dur)
            starts = np.array(st + [en[-1]])
            ends = [round(float(v), 3) for v in en]
            aligned = True

        silent = float((e < FLOOR).mean())
        # Sentence starts, so a long transcript can be broken into readable blocks
        # instead of arriving as one wall of text.
        breaks, acc = [0], 0
        if c.get("paras"):
            # The transcript breaks exactly where the text's own paragraphs do,
            # and nowhere finer: a one-paragraph clip stays one paragraph rather
            # than becoming a line per sentence.
            for para in c["paras"][:-1]:
                acc += len(re.findall(r"\S+", para))
                breaks.append(acc)
        else:
            for i, w in enumerate(words[:-1]):
                if re.search(r"[.!?\u0964]\s*$", w):
                    breaks.append(i + 1)

        out[c["file"]] = {
            "dur": round(dur, 3),
            "words": [w.rstrip("\n") for w in words],
            # start time per word, plus the end of the last one
            "t": [round(float(v), 3) for v in starts],
            "silent": round(silent, 3),
            "lang": c.get("lang"), "voice": c.get("voice"),
            "native": bool(c.get("native")),
            "long": bool(c.get("long")),
            "breaks": breaks,
            # forced alignment: true timings, with an end per word so the
            # highlight can rest during a pause instead of clinging to a word
            "aligned": aligned,
            **({"e": ends} if ends else {}),
            **({"excerpt": True} if c.get("excerpt") else {}),
        }

    (SRC / "align.json").write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False),
                                    encoding="utf-8")
    kb = len(json.dumps(out, ensure_ascii=False)) / 1024
    print(f"{len(out)} clips captioned, {kb:.1f} kB; "
          f"{sum(v['aligned'] for v in out.values())} force-aligned")
    sil = [v["silent"] for v in out.values()]
    wc = [len(v["words"]) for v in out.values()]
    print(f"  words per clip {min(wc)}-{max(wc)}; silence {100*min(sil):.0f}-{100*max(sil):.0f}% of frames")
    print(f"  (that silence is exactly what a linear, time-based highlight would get wrong)")
    if skipped:
        from collections import Counter
        for reason, n in Counter(r for _, r in skipped).items():
            print(f"  skipped {n}: {reason}")


main()
