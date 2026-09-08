#!/usr/bin/env python3
"""Taper each generated segment before joining it to the next.

The endpoint ends a generation on its stop token, and it emits that token before the
final phoneme has finished decaying: measured over the sixteen turns of the
conversation, fifteen still had full speech energy in their last 50 ms, and two
byte-identical requests came back clipped by different amounts, so it is stochastic
rather than a fixed offset. Nothing on the client can recover the missing audio.

What it can do is stop the join from sounding like a splice. A hard edge from
mid-vowel to digital silence is a click; a short cosine taper reads as a fast natural
decay instead. This does not lengthen anything and does not disguise the clipping --
the words are still whatever the model produced -- it only removes the artefact the
truncation creates at the seam.
"""
import numpy as np

FADE_IN_MS = 6          # kills the onset click; short enough not to soften an attack
FADE_OUT_MS = 30        # the truncation is the reason this end needs more than the start


def taper(pcm: bytes, sample_rate: int) -> bytes:
    a = np.frombuffer(pcm, dtype="<i2").astype("float32")
    ni = int(sample_rate * FADE_IN_MS / 1000)
    no = int(sample_rate * FADE_OUT_MS / 1000)
    if len(a) > ni + no > 0:
        a[:ni] *= np.sin(np.linspace(0, np.pi / 2, ni)) ** 2
        a[-no:] *= np.cos(np.linspace(0, np.pi / 2, no)) ** 2
    return np.clip(a, -32768, 32767).astype("<i2").tobytes()


def stitch_tapered(parts, gap_ms: float, sample_rate: int) -> bytes:
    gap = b"\x00\x00" * int(sample_rate * gap_ms / 1000.0)
    return gap.join(taper(p, sample_rate) for p in parts)
