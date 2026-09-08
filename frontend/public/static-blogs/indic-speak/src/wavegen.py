#!/usr/bin/env python3
"""Compute a compact loudness envelope for every clip in blog/audio/.

The players on the page draw each clip's own waveform as its progress track, so
the track has to be that clip's real loudness rather than a decorative squiggle.
One digit per bar keeps the whole set small enough to inline.

    python3 src/wavegen.py            # writes src/waves.json
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf

SRC = Path(__file__).parent
AUDIO = SRC.parent / "audio"
BARS = 56          # bars per player; more is unreadable at this width


def envelope(path: Path) -> str:
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    edges = np.linspace(0, len(x), BARS + 1).astype(int)
    peak = np.array([np.abs(x[a:b]).max() if b > a else 0.0 for a, b in zip(edges[:-1], edges[1:])])
    # Scale to this clip's own loud end, so a quietly recorded voice still fills
    # its track, then quantise to one digit per bar.
    ref = np.percentile(peak, 97) or 1.0
    q = np.clip(np.round(peak / ref * 9), 1, 9).astype(int)
    return "".join(str(v) for v in q), round(len(x) / sr, 2)


def main():
    out = {"bars": BARS, "clips": {}}
    files = sorted(AUDIO.glob("*.mp3"))
    for f in files:
        env, dur = envelope(f)
        out["clips"][f"audio/{f.name}"] = {"e": env, "d": dur}
    (SRC / "waves.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    total = sum(c["d"] for c in out["clips"].values())
    print(f"{len(files)} clips, {total/60:.1f} min of audio -> {BARS} bars each, "
          f"{len(json.dumps(out))/1024:.1f} kB")
    k = "audio/hi_Kavya.mp3"
    if k in out["clips"]:
        print(f"  {k}: {out['clips'][k]['d']}s\n  " + out["clips"][k]["e"])


if __name__ == "__main__":
    main()
