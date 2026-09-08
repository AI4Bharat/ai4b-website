#!/usr/bin/env python3
"""Per-codec-frame analysis for the "watch a voice being made" widget.

The widget animates the model's own generation rate, so its keyframes are the
model's frames, not an arbitrary fps: SNAC's coarse book steps once per 2048
samples at 24 kHz, i.e. 11.72 frames per second, seven tokens each. For every
frame we store peak loudness, a min/max pair for the waveform, and a spectral
centroid so the drawing can tell a bright fricative from a dark vowel.

    python3 src/voicegen.py            # writes src/voice.json
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf

SRC = Path(__file__).parent
HOP = 2048          # samples per SNAC coarse step
SR = 24000
TOK = 7             # tokens per frame, fixed 1:2:4 interleave
CLIP = "audio/hi_Kavya.mp3"
VOICE, LANG = "Kavya", "hi"
D36 = "0123456789abcdefghijklmnopqrstuvwxyz"


def q36(v):
    """Quantise 0..1 to one base-36 digit, so a per-frame series stays inlineable."""
    return D36[int(np.clip(round(v * 35), 0, 35))]


def main():
    x, sr = sf.read(SRC.parent / CLIP, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:                       # the widget quotes the model's frame rate, so
        raise SystemExit(f"{CLIP} is {sr} Hz, expected {SR}")
    n = int(np.ceil(len(x) / HOP))
    pad = np.concatenate([x, np.zeros(n * HOP - len(x), dtype="float32")]).reshape(n, HOP)

    peak = np.abs(pad).max(axis=1)
    ref = np.percentile(peak, 97) or 1.0
    amp = "".join(q36(v) for v in peak / ref)
    # Waveform: one min/max pair per frame is all the drawing can resolve at this
    # width, and it is the real sample extremes rather than a smoothed curve.
    lo = "".join(q36((v + 1) / 2) for v in np.clip(pad.min(axis=1) / ref, -1, 1))
    hi = "".join(q36((v + 1) / 2) for v in np.clip(pad.max(axis=1) / ref, -1, 1))

    # Spectral centroid per frame, in mel-ish log space then normalised across the
    # clip: high = sibilant/plosive, low = vowel. Drives tint only.
    win = np.hanning(HOP).astype("float32")
    mag = np.abs(np.fft.rfft(pad * win, axis=1))
    freq = np.fft.rfftfreq(HOP, 1 / SR)
    cen = (mag * freq).sum(axis=1) / np.maximum(mag.sum(axis=1), 1e-9)
    lc = np.log1p(cen)
    span = np.percentile(lc, 95) - np.percentile(lc, 5) or 1.0
    bright = "".join(q36(v) for v in (lc - np.percentile(lc, 5)) / span)

    out = {"clip": CLIP, "voice": VOICE, "lang": LANG, "sr": SR, "hop": HOP,
           "tok": TOK, "fps": round(SR / HOP, 3), "frames": n,
           "seconds": round(len(x) / sr, 2), "amp": amp, "lo": lo, "hi": hi, "b": bright}
    (SRC / "voice.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print(f"{CLIP} {out['seconds']}s -> {n} frames @ {out['fps']} fps "
          f"= {n * TOK} tokens, {len(json.dumps(out)) / 1024:.1f} kB")
    assert len(amp) == len(lo) == len(hi) == len(bright) == n
    assert abs(n / out["fps"] - out["seconds"]) < 0.2, "frame count must match duration"
    print("  amp[:48]", amp[:48], "\n  bright[:48]", bright[:48])


main()
