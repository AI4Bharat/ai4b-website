#!/usr/bin/env python3
"""Generate the hero motif from real model output.

Two forms of the same clip:

  surface  a time x frequency x amplitude grid, drawn as a rotating 3D landscape
           of bars in WebGL. This is the hero.
  amp      the peak envelope, kept as the fallback for browsers without WebGL and
           for the reduced-motion path.

The hero is not decoration -- it is the audio a reader can play further down the
page. Bars are time frames, so the sweep that raises them is the model emitting
frames in order, which is what an autoregressive codec model actually does.

    python3 src/herogen.py            # writes src/hero.json
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import stft

SRC = Path(__file__).parent
BLOG = SRC.parent
# The WAV behind blog/audio/hi_Kavya.mp3 -- the first clip the page plays. The mp3
# itself cannot be read here (no mp3 decoder on this host), and the WAV is the same
# audio before transcoding.
CLIP = Path("/projects/data/ttsteam/ashwin/gemma-tts/eval_out/verify_api/rasa_full_45v/audio/"
            "hi__Kavya__3191dfd0-da3e-4b20-9e4b-54caea3d6a8b__Kavya.wav")
PLAYS_AS = "audio/hi_Kavya.mp3"
BARS, LEVELS = 176, 4          # envelope bars for the fallback
COLS, BANDS = 56, 10           # the 3D grid: time steps x mel bands


def main():
    x, sr = sf.read(CLIP, dtype="float32", always_2d=True)
    x = x.mean(axis=1)

    # Peak per frame is what an audio editor draws: it keeps transients, where an
    # RMS envelope smooths the consonants that make speech look like speech.
    edges = np.linspace(0, len(x), BARS + 1).astype(int)
    peak = np.array([np.abs(x[a:b]).max() if b > a else 0.0 for a, b in zip(edges[:-1], edges[1:])])

    # Scale to the loudest part of this clip rather than to full scale, so a
    # quietly recorded voice still fills the hero. No companding: compressing the
    # envelope lifts the pauses and the waveform stops looking like speech.
    norm = np.clip(peak / np.percentile(peak, 99.0), 0, 1)
    amp = np.round(norm, 3)
    level = np.clip(np.ceil(norm * LEVELS), 1, LEVELS).astype(int)

    # ---- the 3D surface: mel-spaced bands over time, normalised to this clip
    f, _, Z = stft(x, fs=sr, nperseg=1024, noverlap=512)
    mag = np.abs(Z)
    mel = lambda hz: 2595 * np.log10(1 + hz / 700)
    imel = lambda m: 700 * (10 ** (m / 2595) - 1)
    edges = imel(np.linspace(mel(70), mel(7500), BANDS + 1))
    band = np.stack([mag[(f >= lo) & (f < hi)].mean(axis=0) for lo, hi in zip(edges[:-1], edges[1:])])
    idx = np.linspace(0, band.shape[1] - 1, COLS)
    grid = np.stack([np.interp(idx, np.arange(band.shape[1]), row) for row in band])
    db = 20 * np.log10(grid + 1e-8)
    lo_p, hi_p = np.percentile(db, 40), np.percentile(db, 99.5)
    surf = np.clip((db - lo_p) / (hi_p - lo_p), 0, 1)
    # Row 0 is the lowest band. Quantised to 3 decimals: at this size the extra
    # precision is invisible and it keeps the blob small.
    surface = np.round(surf, 3)

    out = {"bars": BARS, "levels": LEVELS, "clip": PLAYS_AS, "voice": "Kavya", "lang": "hi",
           "seconds": round(len(x) / sr, 2),
           "amp": amp.tolist(), "level": level.tolist(),
           "cols": COLS, "bands": BANDS,
           "surface": [[float(v) for v in row] for row in surface]}
    (SRC / "hero.json").write_text(json.dumps(out), encoding="utf-8")

    print(f"{CLIP.name}: {out['seconds']}s -> {BARS} envelope bars "
          f"(mean {amp.mean():.2f}) + a {COLS}x{BANDS} surface "
          f"(mean {surface.mean():.2f}, {int((surface > 0.15).sum())} of "
          f"{surface.size} cells above the floor)")
    for r in range(BANDS - 1, -1, -1):
        print(f"  {int(edges[r]):>5d}Hz " + "".join(" .:-=+*#%@"[min(9, int(v * 9.99))] for v in surface[r]))
    ROWS = 9
    for r in range(ROWS, 0, -1):                      # a quick look at the envelope
        print("   " + "".join("█" if a * ROWS >= r - 0.5 else " " for a in amp))


main()
