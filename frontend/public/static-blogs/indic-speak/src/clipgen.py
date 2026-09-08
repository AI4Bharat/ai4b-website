#!/usr/bin/env python3
"""Select the page's audio evidence from the benchmark run, encode it, and write the
clip metadata the page reads.

Every clip on the page must trace to a row of the 45-voice API run, with that row's
judge score. Selection is by rule rather than by hand so the choice is reproducible
and so nothing unscored can reach the page.

Three sets:

  ab       one source sentence, ten languages, two voices each -- the cross-lingual
           evidence. Every row scored 5, so a listener hears accent, not defects.
  voices   one short sample per voice, so all 45 voice descriptions are checkable.
  (the existing per-language code-mixing clips are left untouched)

Encoding uses soundfile's MP3 writer, which needs no external binary.
`compression_level` 0.6 is 64 kbps CBR at 24 kHz mono, about 8 kB per second.

    python3 src/clipgen.py [--dry-run]
"""
import argparse
import json
from collections import defaultdict
from pathlib import Path

import soundfile as sf

SRC = Path(__file__).parent
BLOG = SRC.parent
RUN = Path("/projects/data/ttsteam/ashwin/gemma-tts/eval_out/verify_api/rasa_full_45v")
AUDIO = BLOG / "audio"

# The A/B set is chosen per language, not from one shared sentence. Every benchmark
# sentence was synthesised by exactly two voices, and about 1,350 of the 15,000 have
# one native and one cross-lingual casting. Picking the best such pair per language
# gives all ten languages a real native-against-cross-lingual comparison on identical
# words. Forcing a single sentence across all ten instead would show the same content
# in ten scripts, but only three languages would get a native reference to compare
# against -- and the comparison is the point.
AB_DUR = (12.0, 24.0)
# A voice sample only has to carry timbre and pace, and the benchmark's shortest
# sentence is 13.5 s (median 33 s), so samples are trimmed rather than selected for
# length. Cut at the quietest point in the window so it lands in a pause between
# words instead of mid-syllable.
SAMPLE_WINDOW = (7.0, 11.0)
FADE = 0.18
# Match the existing clips exactly at 80 kbps. Audio quality is the product here,
# and an A/B where one side is encoded harder than the other is not an A/B.
QUALITY = 0.5            # soundfile compression_level -> 80 kbps CBR, as shipped


def load():
    """Join the manifest to the judge scores, keeping only rows that both produced
    audio and were scored."""
    judge = {}
    for line in (RUN / "llm_judge" / "scores.jsonl").open(encoding="utf-8"):
        r = json.loads(line)
        judge[r["audio_filepath"]] = r["score"]
    rows = []
    for line in (RUN / "manifest.jsonl").open(encoding="utf-8"):
        r = json.loads(line)
        if not r.get("ok"):
            continue
        fp = r["audio_filepath"]
        if fp not in judge:
            continue
        r["score"] = judge[fp]
        r["uid"] = fp.split("__")[2] if fp.count("__") >= 3 else ""
        rows.append(r)
    return rows


def trim_at_pause(x, sr):
    """Cut inside SAMPLE_WINDOW at the quietest 60 ms, then fade out.

    Speech has pauses; the quietest short window inside the range is almost always
    one, so the sample ends between words. The fade covers the case where it is not.
    """
    lo, hi = int(SAMPLE_WINDOW[0] * sr), int(SAMPLE_WINDOW[1] * sr)
    if len(x) <= hi:
        return x
    import numpy as np
    win = int(0.06 * sr)
    seg = np.abs(x[lo:hi])
    # Mean absolute amplitude per candidate window, via a cumulative sum.
    c = np.concatenate([[0.0], np.cumsum(seg)])
    energy = (c[win:] - c[:-win]) / win
    cut = lo + int(np.argmin(energy)) + win
    out = x[:cut].copy()
    f = int(FADE * sr)
    if len(out) > f:
        out[-f:] *= np.linspace(1.0, 0.0, f)
    return out


def encode(src: Path, dst: Path, dry: bool, trim: bool = False) -> float:
    x, sr = sf.read(src, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if trim:
        x = trim_at_pause(x, sr)
    if not dry:
        sf.write(dst, x, sr, format="MP3", bitrate_mode="CONSTANT", compression_level=QUALITY)
    return len(x) / sr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="select and report, write nothing")
    a = ap.parse_args()

    rows = load()
    print(f"{len(rows)} scored rows in the run")

    # ---- A/B set: per language, one sentence read by a native and a non-native voice
    by_text = defaultdict(list)
    for r in rows:
        by_text[(r["language"], r["text"])].append(r)

    ab, chosen = [], {}
    for (lang, text), group in by_text.items():
        nat = [r for r in group if r["voice_native"]]
        crs = [r for r in group if not r["voice_native"]]
        if not nat or not crs:
            continue
        pair = (nat[0], crs[0])
        # Both must be clean and in the duration window, or the listener is comparing
        # defects rather than accents.
        if any(p["score"] != 5 or not (AB_DUR[0] <= p["gen_duration_sec"] <= AB_DUR[1]) for p in pair):
            continue
        # Rank by the pair's own character error rate: within score-5 rows a lower CER
        # means the transcript matched more closely, so the reading is the cleanest
        # available. Then prefer the shorter pair.
        key = (max(p["cer"] for p in pair), sum(p["gen_duration_sec"] for p in pair))
        if lang not in chosen or key < chosen[lang][0]:
            chosen[lang] = (key, pair, text)

    for lang in sorted(chosen):
        _, pair, text = chosen[lang]
        for r in pair:                              # native first: it is the reference
            name = f"ab_{lang}_{r['speaker_id']}.mp3"
            dur = encode(RUN / "audio" / r["audio_filepath"], AUDIO / name, a.dry_run)
            ab.append({
                "set": "ab", "lang": lang, "voice": r["speaker_id"],
                "voice_lang": r["voice_lang"], "native": bool(r["voice_native"]),
                "file": f"audio/{name}", "dur": round(dur, 2),
                "judge": r["score"], "text": r["text_raw"] or r["text"],
            })
    langs = sorted(chosen)
    print(f"A/B set: {len(ab)} clips over {len(langs)} languages {langs}")
    for lang in langs:
        n, c = [x for x in ab if x["lang"] == lang]
        print(f"  {lang}: {n['voice']} ({n['voice_lang']}, native) {n['dur']:.1f}s  vs  "
              f"{c['voice']} ({c['voice_lang']}) {c['dur']:.1f}s   both judge 5")
    assert all(c["judge"] == 5 for c in ab), "an A/B clip is not a clean reading"
    assert len(ab) == 2 * len(langs), "a language does not have exactly two clips"

    # ---- one sample per voice, for the voice plot
    best = {}
    for r in rows:
        if r["score"] != 5:
            continue
        v = r["speaker_id"]
        # Prefer a voice reading its own language, so the sample is the voice at its
        # best; then the shortest, which needs the least trimming.
        key = (not r["voice_native"], r["gen_duration_sec"])
        if v not in best or key < best[v][0]:
            best[v] = (key, r)
    voices = []
    for v in sorted(best):
        r = best[v][1]
        name = f"voice_{v}.mp3"
        dur = encode(RUN / "audio" / r["audio_filepath"], AUDIO / name, a.dry_run, trim=True)
        voices.append({
            "set": "voice", "voice": v, "lang": r["language"],
            "voice_lang": r["voice_lang"], "native": bool(r["voice_native"]),
            "file": f"audio/{name}", "dur": round(dur, 2),
            "judge": r["score"], "text": r["text_raw"] or r["text"], "trimmed": True,
        })
    nat = sum(1 for c in voices if c["native"])
    print(f"voice samples: {len(voices)} of 45 voices, {nat} reading their own language, "
          f"{min(c['dur'] for c in voices):.1f}-{max(c['dur'] for c in voices):.1f} s")

    out = {"ab": ab, "voices": voices}
    if not a.dry_run:
        (SRC / "clips.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
        total = sum(f.stat().st_size for f in AUDIO.glob("*.mp3"))
        print(f"\nwrote {SRC / 'clips.json'} | audio dir now {total/1e6:.2f} MB "
              f"across {len(list(AUDIO.glob('*.mp3')))} files")
    else:
        secs = sum(c["dur"] for c in ab + voices)
        print(f"\ndry run: would add {len(ab) + len(voices)} files, {secs:.0f} s, "
              f"about {secs * 8 / 1000:.1f} MB at 64 kbps")


main()
