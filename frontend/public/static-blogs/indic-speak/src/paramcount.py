#!/usr/bin/env python3
"""Count parameters across the three components of the stack, and print the breakdown.

The post states a stack total, so the total has to be counted rather than asserted.
Three sources, three methods:

  backbone  safetensors header (pure JSON, no torch). tie_word_embeddings is true and
            lm_head is absent from the file, so the 156,960 x 3,072 embedding is
            counted exactly once -- counting it twice is what produces the 3.78B
            figure that docs/KT.md:70 calls an error.
  codebooks only the SNAC quantizer. Inference never runs SNAC's encoder or its
            decoder: `eval/eval_gen_common.py:180` does
            `z_q = snac.quantizer.from_codes(codes)` and hands the latents to Vocos,
            so the codebooks are the only part of SNAC in the path. They are 0.7% of
            that checkpoint; the unused encoder and decoder are the other 99.3%.
  decoder   the Vocos EMA weights only. The checkpoint also carries the raw decoder,
            a discriminator and optimiser state, which is why the file is far larger
            than the model.

    PYTHONNOUSERSITE=1 <torch python> blog/src/paramcount.py
"""
import json
import struct
import sys
from pathlib import Path

REPO = Path("/projects/data/ttsteam/ashwin/gemma-tts")
BACKBONE = REPO / "checkpoints/llama3_yt_balanced_len_1000h_v2_1e4/checkpoint-8944/hf_export/model.safetensors"
SNAC = REPO / "checkpoints/snac/snac_24khz/pytorch_model.bin"
VOCOS = Path("/projects/data/ttsteam/avnish/snac_ft/vocos_dec_ft/vocos_dec_v9_gen/step_0200000.pt")


def safetensors_params(path):
    with path.open("rb") as fh:
        n = struct.unpack("<Q", fh.read(8))[0]
        hdr = json.loads(fh.read(n))
    total, names = 0, []
    for k, v in hdr.items():
        if k == "__metadata__":
            continue
        names.append(k)
        num = 1
        for s in v["shape"]:
            num *= s
        total += num
    return total, names


def statedict_params(obj):
    """Sum numel over a state dict, ignoring non-tensor entries."""
    total = 0
    for v in obj.values():
        if hasattr(v, "numel"):
            total += v.numel()
    return total


def main():
    out = {}
    back, names = safetensors_params(BACKBONE)
    out["backbone (Llama-3.2-3B)"] = back
    tied = not any("lm_head" in n for n in names)
    emb = next((n for n in names if "embed_tokens" in n), None)

    import torch

    snac = torch.load(SNAC, map_location="cpu", weights_only=False)
    if not isinstance(snac, dict) or "state_dict" in snac:
        snac = snac.get("state_dict", snac)
    quant = {k: v for k, v in snac.items() if k.startswith("quantizer")}
    quant_n = statedict_params(quant)
    unused = statedict_params(snac) - statedict_params(quant)

    ck = torch.load(VOCOS, map_location="cpu", weights_only=False)
    keys = [k for k in ck if not hasattr(ck[k], "numel")] if isinstance(ck, dict) else []
    dec = ck.get("ema") or ck["vocos"]
    # The quantizer is reported with the decoder rather than on its own: at 139,824
    # parameters against the decoder's 58.4 M it is a rounding error on its own row,
    # and the two are one step of the pipeline -- codes in, waveform out.
    out["vocoder (SNAC quantizer + Vocos)"] = statedict_params(dec) + quant_n

    total = sum(out.values())
    w = max(len(k) for k in out)
    print(f"{'component':<{w}}  {'parameters':>15}  {'B':>7}")
    for k, v in out.items():
        print(f"{k:<{w}}  {v:>15,}  {v/1e9:>7.3f}")
    print(f"{'TOTAL':<{w}}  {total:>15,}  {total/1e9:>7.3f}")
    print()
    print(f"backbone tensors: {len(names)} | embeddings tied: {tied} | embedding tensor: {emb}")
    print(f"SNAC encoder + decoder, present in the checkpoint but never run at "
          f"inference: {unused:,} ({unused/1e6:.1f} M)")
    print(f"if the tied embedding were counted twice, the backbone would read "
          f"{(back + 156960*3072)/1e9:.3f} B -- docs/KT.md:70 calls that an error")
    print(f"vocos checkpoint top-level non-tensor keys: {keys}")
    (Path(__file__).parent / "params.json").write_text(
        json.dumps({"components": out, "total": total}, indent=1), encoding="utf-8")
    print(f"\nwrote {Path(__file__).parent / 'params.json'}")


main()
