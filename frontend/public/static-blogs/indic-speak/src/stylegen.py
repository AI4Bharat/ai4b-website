#!/usr/bin/env python3
"""Attach a heard example to each delivery style.

    python3 src/stylegen.py            # downloads, encodes, writes src/style_samples.json

The clips come from the internal generations browser, expressive2 tab: nine Hindi
lines in Suhani's voice, one per style tag, generated at temperature 0.6 and top-p
0.9. Nine of the thirteen styles the post lists have one; the other four do not, and
the page draws that absence rather than hiding it.

Encoded to MP3 at the same setting as every other clip on the page so a style sample
does not arrive louder or cleaner than the voices it sits beside.
"""
import json
import re
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

SRC = Path(__file__).parent
AUDIO = SRC.parent / "audio"
BASE = "https://cons-compare-compatible-corpus.trycloudflare.com/audio_generations/expressive2"

# One style does not take its clip from that tab. The expressive2 lecture line is
# Suhani reading Hindi; this one is Amit reading English, and its source text is
# LaTeX, so the sample carries the normaliser's job as well as the register. It is
# generated through verify_api rather than downloaded -- the browser's own Fourier
# clip (technical/tech4_en) was produced with no style tag at all, and a sample
# filed under `educational lecture` has to have been asked for in that register.
# Its mp3 is written by that generation, so this map only supplies the metadata and
# tells the downloader to leave the file alone.
def _narration():
    """The audiobook card's clip, as narrgen.py last wrote it."""
    meta = json.loads((Path(__file__).resolve().parent / "narration.json").read_text(encoding="utf-8"))
    rp = meta["sampling"]["repetition_penalty"]
    return {
        "file": meta["file"], "dur": meta["dur"],
        "title": "Narration \u00b7 \u0c13\u0c1f\u0c2e\u0c3f \u0c05\u0c28\u0c47\u0c26\u0c3f \u0c17\u0c2e\u0c4d\u0c2f\u0c02 \u0c15\u0c3e\u0c26\u0c41",
        "text": " ".join(p.strip() for p in meta["paragraphs"]),
        # The paragraphs as well as the run-on text: this clip was generated one
        # paragraph per pass, and the transcript reads better set the same way.
        "paras": [p.strip() for p in meta["paragraphs"]],
        "voice": meta["voice"], "lang": meta["lang"],
        "gen": "%s, T%s-p%s-rp%s%s, style=%s, %d pass%s"
               % (meta.get("source", "verify_api hosted, seed-free"),
                  meta["sampling"]["temperature"], meta["sampling"]["top_p"], rp,
                  (", seed %d" % meta["sampling"]["seed"]) if "seed" in meta["sampling"] else "",
                  meta["style"], meta["requests"],
                  "" if meta["requests"] == 1 else "es"),
    }


OVERRIDE = {
    # Supplied as a bare wav with no manifest: the voice, language, style tag and
    # text behind it are not recorded anywhere in the repo, so the card gets the
    # clip and nothing invented to go with it.
    'AIR style news': {
        "file": "audio/style_news.mp3", "dur": 42.7,
        "title": "Bulletin · four models for students and teachers",
        "text": "IIT Madras-Backed बोधन-AI and AI4Bharat, Launch 4 AI Models for Students and Teachers. Bodhan AI, a centre of excellence in AI for education incubated at IIT Madras, has launched four AI models for speech recognition, speech generation, machine translation and optical character recognition, in partnership with AI4Bharat. The models are being released as Digital Public Goods through open-weight models and hosted APIs on sovereign infrastructure. The initiative is part of the Bharat EduAI Stack, which aims to provide a common AI infrastructure layer for multilingual education in India.",
        "lang": 'en',
        "gen": "supplied clip; transcript supplied with it",
    },
    'advertisements': {
        "file": "audio/style_advertisements.mp3", "dur": 33.0,
        "title": "Ad spot · switch to Indic-Speak",
        "text": "क्या आपका TTS model डिफिकल्ट STEM formulas और code-mixed sentences में अटक जाता है? तो अब स्विच कीजिए Indic-Speak पर! यह 3.3 Billion parameters वाला धमाकेदार open-source TTS model पूरे 22 languages में लाता है ultra-realistic और नॅचुरल आवाज़। चाहे साइंटिफिक थ्योरी पढ़ना हो, Hinglish बोलना हो, या स्टोरीज़ सुनाना हो — हर शब्द बोलेगा मक्खन की तरह स्मूथ! आज ही Hugging Face पर checkout करो और अपने projects को दो एक असली आवाज़!",
        "lang": 'hi',
        "gen": "supplied clip; transcript supplied with it",
    },
    "children's stories": {
        "file": "audio/style_childrens_stories.mp3", "dur": 144.8,
        "title": "Children’s story · भोलू भालू और मीठे आम",
        "text": "चंपकवन में एक बहुत बड़ा आम का पेड़ था। गर्मियों के मौसम में उस पर बहुत रसीले और मीठे आम लगे थे। भोलू भालू को आम बहुत पसंद थे। एक दिन सुबह-सुबह भोलू आम के पेड़ के पास पहुँचा। उसने लालच में आकर सोचा, \"आज सारे आम मैं ही खाऊँगा, किसी को एक भी नहीं दूँगा!\" तभी वहाँ चीकू खरगोश और मीकू चूहा भी खेलते हुए आ गए। \"भोलू दादा, क्या हमें भी कुछ मीठे आम दोगे?\" चीकू ने प्यार से पूछा। भोलू ने मुँह बनाते हुए कहा, \"बिल्कुल नहीं! यह पेड़ मैंने पहले देखा है। इसलिए इसके सारे आम मेरे हैं। तुम लोग कहीं और जाकर खेलो।\" चीकू और मीकू उदास होकर वहाँ से जाने लगे। तभी पेड़ की सबसे ऊँची डाल पर बैठे जग्गू बंदर ने यह सब देखा। उसे भोलू का लालच बिल्कुल पसंद नहीं आया। जग्गू ने भोलू को सबक सिखाने की एक तरकीब सोची। जग्गू ने पेड़ के उस हिस्से से कुछ कच्चे और खट्टे आम तोड़े और भोलू की तरफ नीचे फेंक दिए। भोलू को लगा कि मीठे आम गिरे हैं। उसने बिना देखे झट से एक आम उठाया और मुँह में डाल लिया। \"थू-थू! यह तो बहुत खट्टा है! मेरे दाँत खट्टे हो गए!\" भोलू मुँह सिकोड़ते हुए चिल्लाया। जग्गू बंदर पेड़ से हँसते हुए बोला, \"भोलू दादा, जो लालच करता है और अकेले-अकेले खाता है, उसे ऐसे खट्टे आम ही मिलते हैं। मीठे आम तो दोस्तों के साथ मिल-बाँट कर खाने वालों के लिए होते हैं।\" भोलू को अपनी गलती का अहसास हो गया। उसे समझ आ गया कि लालच बुरी बला है। उसने तुरंत चीकू और मीकू को वापस बुलाया और उनसे माफ़ी माँगी। यह देखकर जग्गू बंदर बहुत खुश हुआ। उसने ऊपर से ढेरों मीठे और पके हुए आम नीचे गिराए। भोलू, जग्गू, चीकू और मीकू—चारों ने मिलकर मज़े से आम खाए। भोलू समझ गया था कि दोस्तों के साथ मिल-बाँट कर खाने में जो मज़ा है, वो अकेले खाने में कभी नहीं मिल सकता।",
        "lang": "hi",
        "gen": "Parth, style=children's stories, chunked and stitched; ASR CER 0.00-0.49%",
    },
    # Generated for this card, not lifted from a browser: Telugu narration in
    # Vamsi's voice, chunked on sentence boundaries and stitched with the same
    # tapers as the Ponniyin Selvan chapter. Read from the manifest narrgen.py
    # writes, so a regeneration at different sampling cannot leave a stale
    # duration or a stale sampling note behind on the card.
    "single person narration audiobook": _narration(),
    "educational lecture": {
        "file": "audio/style_educational_lecture.mp3",
        "title": "Educational lecture \u00b7 the Continuous Fourier Transform",
        "text": r"The signal decomposition of neural EEG waves utilizes the Continuous "
                r"Fourier Transform $\hat{f}(\omega) = \int_{-\infty}^{\infty} f(t) "
                r"e^{-i\omega t} dt$.",
        "voice": "Amit", "lang": "en", "dur": 22.0,
        "gen": "verify_api seed-free T0.6-p0.9-rp1.2, style=educational lecture",
    },
}


def slug(style):
    return re.sub(r"[^a-z0-9]+", "_", style.lower()).strip("_")


def main():
    raw = urllib.request.urlopen(BASE + "/manifest.jsonl", timeout=60).read().decode("utf-8")
    rows = [json.loads(l) for l in raw.splitlines() if l.strip()]
    AUDIO.mkdir(exist_ok=True)
    out = {}
    for r in rows:
        if r["style"] in OVERRIDE:          # supplied or generated; do not download
            out[r["style"]] = OVERRIDE[r["style"]]
            print(f"  {r['style']:34s} {out[r['style']]['dur']:5.1f}s  "
                  f"{out[r['style']]['file'].split('/')[1]}  (generated, not downloaded)")
            continue
        url = f"{BASE}/norm_out/{r['name']}.wav"
        wav = urllib.request.urlopen(url, timeout=120).read()
        tmp = AUDIO / f".tmp_{r['name']}.wav"
        tmp.write_bytes(wav)
        x, sr = sf.read(tmp, dtype="float32", always_2d=True)
        x = x.mean(axis=1)
        name = f"style_{slug(r['style'])}.mp3"
        sf.write(AUDIO / name, x, sr, format="MP3", compression_level=0.6)
        tmp.unlink()
        out[r["style"]] = {
            "file": f"audio/{name}", "title": r["title"], "text": r["text"],
            "voice": r["display_name"], "lang": r["lang"],
            "dur": round(len(x) / sr, 2), "gen": r.get("gen", ""),
        }
        print(f"  {r['style']:34s} {out[r['style']]['dur']:5.1f}s  {name}")
    # Overrides for styles the expressive2 tab has no row for at all.
    for style, meta in OVERRIDE.items():
        if style not in out:
            out[style] = meta
            print(f"  {style:34s} {meta['dur']:5.1f}s  {meta['file'].split('/')[1]}  "
                  f"(supplied, not downloaded)")

    (SRC / "style_samples.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    kb = sum((AUDIO / v["file"].split("/")[1]).stat().st_size for v in out.values()) / 1000
    print(f"\nwrote src/style_samples.json  {len(out)} samples, {kb:.0f} kB of audio")


if __name__ == "__main__":
    main()
