#!/usr/bin/env python3
"""Join the paragraph-level local generations into the card's clip.

    python3 blog/src/narrstitch.py [--out-dir eval_out/narration_te_local]

Each paragraph came back from verify_api/local_sampler.py as ONE uninterrupted
pass, so unlike the hosted run there are no seams inside a paragraph -- only the
six joins between them, which get the same beat the Ponniyin Selvan chapter uses.
The taper is kept at those joins anyway: it costs 30 ms and it is what stops a
concatenation clicking.

Rewrites blog/audio/style_narration_te_Vamsi.mp3 and blog/src/narration.json, so
stylegen.py picks the new duration up on its next run.
"""
import argparse
import json
import sys
from pathlib import Path

BLOG = Path(__file__).resolve().parents[1]
REPO = BLOG.parent
sys.path.insert(0, str(REPO / "verify_api"))
sys.path.insert(0, str(BLOG / "src"))

from seam import stitch_tapered                       # noqa: E402

SAMPLE_RATE = 24000
GAP_PARAGRAPH_MS = 620
OUT = BLOG / "audio" / "style_narration_te_Vamsi.mp3"
META = BLOG / "src" / "narration.json"
SRC = BLOG / "src" / "narration_te.txt"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", type=Path,
                    default=REPO / "eval_out" / "narration_te_local")
    a = ap.parse_args()

    import numpy as np
    import soundfile as sf

    paras = [p.strip() for p in SRC.read_text(encoding="utf-8").split("\n\n") if p.strip()]
    # results_shard*.jsonl, not manifest.jsonl: `local_sampler.py --merge` rebuilds
    # the manifest against its DEFAULT input, so on a custom --input it comes back
    # with the wrong thousand rows. The shard results are what this run actually
    # produced.
    shards = sorted(a.out_dir.glob("results_shard*.jsonl"))
    assert shards, f"no results_shard*.jsonl in {a.out_dir}"
    rows = [json.loads(l) for f in shards
            for l in f.read_text(encoding="utf-8").splitlines() if l.strip()]
    by_name = {Path(r["audio_filepath"]).name: r for r in rows}
    assert len(rows) == len(paras), f"{len(rows)} rows for {len(paras)} paragraphs"

    segs, starts, at = [], [], 0.0
    for i, para in enumerate(paras, 1):
        row = by_name[f"te__Vamsi__narration_p{i:02d}.wav"]
        wav = a.out_dir / "audio" / Path(row["gen_audio_path"]).name
        if not wav.is_file():
            wav = Path(row["gen_audio_path"])
        pcm, sr = sf.read(str(wav), dtype="int16", always_2d=False)
        assert sr == SAMPLE_RATE, f"{wav} is {sr} Hz, expected {SAMPLE_RATE}"
        segs.append(pcm.tobytes())
        starts.append(round(at, 3))
        at += len(pcm) / SAMPLE_RATE
        if i < len(paras):
            at += GAP_PARAGRAPH_MS / 1000.0
        print(f"  para {i}: {len(para):>4} chars -> {len(pcm)/SAMPLE_RATE:6.2f}s  "
              f"stop={row.get('stop_reason')}  one pass", flush=True)

    audio = stitch_tapered(segs, GAP_PARAGRAPH_MS, SAMPLE_RATE)
    pcm = np.frombuffer(audio, dtype="<i2")
    sf.write(OUT, pcm, SAMPLE_RATE, format="MP3", compression_level=0.6)
    dur = len(pcm) / SAMPLE_RATE

    meta = json.loads(META.read_text(encoding="utf-8")) if META.is_file() else {}
    meta.update({
        "file": f"audio/{OUT.name}", "voice": "Vamsi", "lang": "te",
        "style": "single person narration audiobook",
        "sampling": {"temperature": 0.6, "top_p": 0.9,
                     "repetition_penalty": 1.2, "rp_scope": "all", "seed": 0},
        "dur": round(dur, 2), "para_starts": starts, "paragraphs": paras,
        "requests": len(paras),
        "source": "local checkpoint via verify_api/local_sampler.py, one pass per paragraph",
    })
    META.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nwrote {OUT.relative_to(REPO)}  {OUT.stat().st_size // 1024} kB  {dur:.1f}s")
    print(f"  paragraph starts: {starts}")


if __name__ == "__main__":
    main()
