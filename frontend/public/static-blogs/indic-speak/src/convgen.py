#!/usr/bin/env python3
"""Generate the auto-rickshaw conversation one turn at a time and stitch it.

    python3 src/convgen.py --dry-run     # the plan, no API calls
    python3 src/convgen.py               # generate and write the mp3

Two speakers, from src/conversation.txt: the driver is Adarsh, the Kannada male voice
(144 Hz, the most even male contour in the library), and the passenger is Parth
(164 Hz, mid tenor, animated). One request per turn, which is what keeps each turn a
single take -- no turn is longer than 133 characters, so none of them is near the
per-request ceiling and nothing has to be chunked.

No style is sent. The contract's fourteen styles are registers and emotions; a
haggle over a fare is the conversational default, and sending `happy` or
`Customer Care` here would be casting it as something it is not.

NORMALISER LANGUAGE, per turn: the driver's turns are normalised as Kannada, and the
passenger's take whichever Indic script dominates that turn, which puts
`Koramangala से Indiranagar 200?` into Hindi and the rest into Kannada. The model
itself is given no language tag either way -- it reads the script.

THE FARES ARE SPOKEN IN ENGLISH, and that is a separate knob. `lang` does not decide
how a number is read; `number_lang` does, and leaving it unset expands digits into
English words, so `200 rupees ಕೊಡಿ` reaches the model as `two hundred rupees ಕೊಡಿ`.
That is left as it is on purpose -- an auto fare in Bengaluru is quoted in English
far more often than not -- but it is a choice, not a default that happened. Set
NUMBER_LANG to "kn" for `ಇನ್ನೂರು rupees` or "hi" for `दो सौ rupees`.

Writes blog/audio/conv_bengaluru_auto.mp3 and blog/src/conv.json (per-turn speaker,
text, language and start time).
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
from seam import stitch_tapered                           # noqa: E402

VOICE = {"Driver": "Adarsh", "Guy": "Parth"}
FORCE_LANG = {"Driver": "kn"}          # the Kannada speaker, digits in Kannada clauses
NUMBER_LANG = None                     # None -> "two hundred"; "kn" -> ಇನ್ನೂರು; "hi" -> दो सौ
TTS = {"temperature": 0.6, "top_p": 0.9, "repetition_penalty": 1.2}
GAP_MS = 280                            # turn-taking in an argument over a fare
TEXT = BLOG / "src" / "conversation.txt"
OUT = BLOG / "audio" / "conv_bengaluru_auto.mp3"
MAX_CHARS = 340                         # the per-request budget used elsewhere


def turns():
    rows = []
    for line in TEXT.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        who, text = line.split("\t", 1)
        assert who in VOICE, f"unknown speaker {who!r}"
        rows.append((who, text.strip()))
    return rows


def lang_of(who, text):
    if who in FORCE_LANG:
        return FORCE_LANG[who]
    kn = sum(1 for c in text if 0x0C80 <= ord(c) <= 0x0CFF)
    dv = sum(1 for c in text if 0x0900 <= ord(c) <= 0x097F)
    return "kn" if kn >= dv else "hi"


def pcm_of(events):
    return b"".join(base64.b64decode(e["choices"][0]["text"]) for e in events
                    if e.get("choices") and e["choices"][0].get("text"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    rows = turns()
    print(f"{len(rows)} turns, one request each")
    for i, (who, text) in enumerate(rows, 1):
        assert len(text) <= MAX_CHARS, f"turn {i} is {len(text)} chars, over the budget"
        print(f"  {i:>2} {who:6s} -> {VOICE[who]:7s} lang={lang_of(who, text)}  "
              f"{len(text):>4}ch  {text[:46]}")
    if a.dry_run:
        print("\ndry run: no API calls, nothing written")
        return

    import numpy as np
    import soundfile as sf

    parts, meta, at = [], [], 0.0
    for i, (who, text) in enumerate(rows, 1):
        lang = lang_of(who, text)
        nk = {"number_lang": NUMBER_LANG} if NUMBER_LANG else {}
        ev = speak(text, lang=lang, voice=VOICE[who], tts_kwargs=TTS,
                   normalizer_kwargs=nk)
        pcm = pcm_of(ev)
        secs = len(pcm) / 2 / SAMPLE_RATE
        meta.append({"n": i, "who": who, "voice": VOICE[who], "lang": lang,
                     "text": text, "start": round(at, 3), "dur": round(secs, 2)})
        at += secs + (GAP_MS / 1000.0 if i < len(rows) else 0)
        parts.append(pcm)
        print(f"  {i:>2} {who:6s} {VOICE[who]:7s} {len(text):>4}ch -> {secs:5.2f}s")

    audio = stitch_tapered(parts, GAP_MS, SAMPLE_RATE)
    pcm = np.frombuffer(audio, dtype="<i2")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sf.write(OUT, pcm, SAMPLE_RATE, format="MP3", compression_level=0.6)
    dur = len(pcm) / SAMPLE_RATE
    (BLOG / "src" / "conv.json").write_text(json.dumps({
        "file": f"audio/{OUT.name}", "dur": round(dur, 2), "sampling": TTS,
        "speakers": {w: VOICE[w] for w in VOICE}, "number_lang": NUMBER_LANG,
        "turns": meta,
    }, ensure_ascii=False), encoding="utf-8")
    print(f"\nwrote {OUT.relative_to(REPO)}  {OUT.stat().st_size / 1000:.0f} kB  {dur:.1f}s")


if __name__ == "__main__":
    main()
