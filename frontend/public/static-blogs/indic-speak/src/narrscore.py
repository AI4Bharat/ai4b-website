#!/usr/bin/env python3
"""Score the Telugu narration in the delivery-styles card: ASR it, then WER/CER.

    python3 blog/src/narrscore.py            # needs a GPU; run via slurm/narrscore.sbatch

Uses the SAME ASR the code-mixed benchmark used -- AI4Bharat IndicConformer 600M
multilingual, through eval/asr/nemo.py -- and the SAME normalisation and scoring
as eval/run_logset_eval.py, so the number is comparable to the 0.70% failure rate
and the per-language table already on the page. Rolling my own would produce a
number that looks like the others and is not.

Scored per paragraph, because that is the unit the reference text has. The audio's
paragraph boundaries come from narration.json, which narrgen.py wrote from the
stitch itself, so the slices are the generator's own, not guessed from durations.

Writes blog/src/narration_score.json.
"""
import json
import sys
from pathlib import Path

BLOG = Path(__file__).resolve().parents[1]
REPO = BLOG.parent
sys.path.insert(0, str(REPO))

META = BLOG / "src" / "narration.json"
OUT = BLOG / "src" / "narration_score.json"
GAP = 0.62          # the beat narrgen.py puts between paragraphs
# The same local checkpoint scripts/asr_metrics.py scores the benchmark with,
# loaded the same way: HF AutoModel with trust_remote_code, not NeMo restore_from
# (the .nemo names the abstract ASRModel and will not instantiate).
ASR_MODEL_ID = str(REPO / "checkpoints" / "indic-conformer")
DECODING = "ctc"


def main():
    import numpy as np
    import soundfile as sf

    meta = json.loads(META.read_text(encoding="utf-8"))
    paras, starts = meta["paragraphs"], meta["para_starts"]
    lang = meta["lang"]

    audio, sr = sf.read(str(BLOG / meta["file"]), dtype="float32", always_2d=False)
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    dur = len(audio) / sr
    print(f"{meta['file']}  {dur:.1f}s @ {sr} Hz, {len(paras)} paragraphs", flush=True)

    # 16 kHz mono is what the metric stack expects.
    import scipy.signal as ss
    if sr != 16000:
        n = int(round(len(audio) * 16000 / sr))
        audio = ss.resample(audio, n).astype("float32")
        sr = 16000

    cuts = []
    for i, s in enumerate(starts):
        end = (starts[i + 1] - GAP) if i + 1 < len(starts) else dur
        cuts.append(audio[int(s * sr):int(end * sr)])
        print(f"  para {i+1}: {s:7.2f}-{end:7.2f}s  {len(cuts[-1])/sr:6.2f}s  "
              f"{len(paras[i]):>4} chars", flush=True)

    import contextlib
    import huggingface_hub
    import torch
    from transformers import AutoModel

    @contextlib.contextmanager
    def local_repo_ok(model_id):
        """The checkpoint's remote code calls snapshot_download for its assets, and
        a local directory is not a valid repo id. Same passthrough
        scripts/asr_metrics.py uses -- and it has to stay wrapped around the forward
        pass, not just the load, because the assets are fetched lazily on first call."""
        if not Path(model_id).is_dir():
            yield
            return
        original = huggingface_hub.snapshot_download

        def patched(repo_id=None, *a, **kw):
            target = repo_id if repo_id is not None else kw.get("repo_id")
            if isinstance(target, str) and Path(target).is_dir():
                return target
            return original(repo_id=repo_id, *a, **kw)

        huggingface_hub.snapshot_download = patched
        try:
            yield
        finally:
            huggingface_hub.snapshot_download = original

    dev = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"loading {ASR_MODEL_ID} on {dev}", flush=True)
    hyps = []
    with local_repo_ok(ASR_MODEL_ID):
        model = AutoModel.from_pretrained(ASR_MODEL_ID, trust_remote_code=True).to(dev).eval()
        for i, seg in enumerate(cuts, 1):
            with torch.inference_mode():
                hyps.append(str(model(torch.from_numpy(seg).to(dev).unsqueeze(0), lang, DECODING)))
            print(f"  transcribed para {i}", flush=True)

    from eval.run_logset_eval import _make_normalizer, score_wer_cer, _row_wer_cer
    norm = _make_normalizer([lang])
    refs_n = [norm(p, lang) for p in paras]
    hyps_n = [norm(h, lang) for h in hyps]

    rows = []
    print("\n  per paragraph:", flush=True)
    for i, (r, h) in enumerate(zip(refs_n, hyps_n), 1):
        w, c = _row_wer_cer(r, h)
        rows.append({"para": i, "wer": round(w, 2), "cer": round(c, 2),
                     "ref_words": len(r.split()), "hyp_words": len(h.split()),
                     "hyp": hyps[i - 1]})
        print(f"    para {i}: WER {w:6.2f}%  CER {c:6.2f}%   "
              f"{len(r.split())} ref words -> {len(h.split())} hyp", flush=True)

    wer, cer = score_wer_cer(refs_n, hyps_n)
    print(f"\n  CORPUS  WER {wer:.2f}%   CER {cer:.2f}%", flush=True)
    OUT.write_text(json.dumps({
        "file": meta["file"], "voice": meta["voice"], "lang": lang,
        "style": meta["style"], "sampling": meta["sampling"],
        "asr": "checkpoints/indic-conformer (AI4Bharat IndicConformer 600M multilingual, CTC)",
        "scoring": "eval/run_logset_eval.py normalisation + jiwer, micro-averaged",
        "wer": round(wer, 2), "cer": round(cer, 2), "paragraphs": rows,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {OUT.relative_to(REPO)}")


if __name__ == "__main__":
    main()
