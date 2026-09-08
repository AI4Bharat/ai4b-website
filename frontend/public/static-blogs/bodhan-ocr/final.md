# Bodhan x AI4Bharat IndicOCR


At AI4Bharat, we have been working on Indian language AI for a long time now. We have put out translation, speech recognition and speech generation models with competitive performance across all 22 languages, and have open-sourced them for the research community to improve and build upon. Document digitization was the missing piece. Given India's rich written heritage and the complexity of Indic scripts, there was a clear need to build models with this specific focus in mind. The document models that exist today, open weights and closed alike, were built largely for English. Accuracy on high-resource Indian languages sits well below what the same systems manage in English, and support for the low-resource ones is almost non-existent. Handwriting compounds all of it. Real handwritten pages are messy, and they vary by age and writing style, from a child's careful developmental handwriting to an adult's hurried scribble, across every one of these languages.

Today, as a joint effort between Bodhan.AI and AI4Bharat, we are introducing IndicOCR, a document parsing system for English and all 22 constitutionally recognized Indian languages. It reads printed and handwritten text, including tables and complex math, while keeping a lean memory footprint. The capabilities section below shows how our model performs on samples spanning different writers, domains and time periods.


- Supports 22 Indic languages and English across 13 scripts.
- Handwriting recognition currently covers English and 12 Indian languages: Hindi, Marathi, Bengali, Tamil, Telugu, Malayalam, Kannada, Gujarati, Punjabi, Assamese, Odia and Urdu.
- Scores *92.76%* on **OmniDocBench v1.6** and *82.20%* on **olmOCR-Bench**.
- Scores *86.2%* word-level accuracy on **IndicOCR-Printed**, across all 22 Indian languages and English.
- **Throughput:** 6.3 pages/second on a single H100 at 64 concurrent requests.
- **License:** [Indic Open Model License v1.0](/indic-open-model-license/v1)



## Key Capabilities

### Digitize printed documents across every script

We built IndicOCR to digitize documents at scale without flattening them: complex
layouts, nested rows and columns in tables, math returned as LaTeX. OCR output is
only as useful as the structure it keeps, and that structure is what makes
downstream document intelligence possible. All of this holds across high- and
low-resource Indian languages alike. Our layout and OCR models work hand-in-hand
to parse formulae, extract tables, and even label question-answer pairs!

> **SAMPLE** `printed`


### Extending OCR to handwriting as well!

Handwriting recognition is the capability we're most excited to announce. Our model handles children's handwriting, messy rough notes, old scans, and everything in between. And it works across 12 Indic languages, starting right now!

### Historical documents

> **SAMPLE** `hw-en/hw_loc_en_2`

### Messy cursive notes

> **SAMPLE** `hw-en/hw-iitm_2`

### Children's handwriting

> **SAMPLE** `hw-en/child`

### Hand-drawn tables

> **SAMPLE** `hw-en/table`

### Same drill!

> **SAMPLE** `handwriting`


### Math Recognition


Our model transcribes mathematical expressions into LaTeX, both inline and as standalone blocks labeled `Equation`. Because a single misread exponent or sign changes an expression entirely, our training mixtures are designed to preserve symbol fidelity in typeset formulae and handwritten notes alike, including dense notation from scanned historical texts.

> **SAMPLE** `printed-en/ramanujan_math|Printed` · `hw-en/math_hw_en|Handwritten`


### Table Recognition

Our model recognizes nested structures and multilingual content in tables. We're actively improving handwritten text recognition, especially for real-world cases with scribbles, cross-outs and overwritten characters.

> **TABLE** `timetable|Printed timetable` · `table1|Handwritten ledger`



<!-- Parked, not deleted: delete these two comment lines to bring it back.

## Read exactly

Some documents contain data that is too critical to be misread. Every digit needs to be read exactly. *No hallucinations.*

> **CRITICAL** `receipt` · `ticket`

-->

## Benchmarks

### OmniDocBench v1.6


OmniDocBench is a widely-used benchmark for testing layout parsing and OCR capabilities of VLMs, featuring documents from various domains, such as financial reports, academic papers, handwritten notes and even newspapers. Since the full set contains Chinese documents, we evaluate on the official English-only subset consisting of 610 pages.

| OmniDocBench 1.6 | Overall↑ | TextEdit↓ | FormulaCDM↑ | TableTEDS↑ | TableTEDS-S↑ | ReadOrderEdit↓ |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| PaddleOCRVL-1.6 | 96.36 | 0.03 | 98.55 | 93.37 | 96.33 | 0.09 |
| Chandra OCR 2 | 93.11 | 0.04 | 96.93 | 86.07 | 90.34 | 0.09 |
| **IndicOCR (ours)** | **92.76** | **0.04** | **97.53** | **85.10** | **90.58** | **0.11** |
| GPT-5.6-sol | 92.46 | 0.04 | 95.42 | 85.87 | 90.98 | 0.10 |
| Gemini 3.1 Pro | 91.15 | 0.06 | 95.53 | 83.46 | 88.77 | 0.13 |
| Surya OCR 2 | 91.13 | 0.04 | 95.67 | 81.61 | 86.37 | 0.10 |
| Sarvam Vision | 90.08 | 0.04 | 97.62 | 76.82 | 82.01 | 0.10 |
| Gemma-4-31B | 86.71 | 0.09 | 89.48 | 79.79 | 85.19 | 0.19 |
| Nemotron Parse 2 | 79.12 | 0.159 | 78.94 | 74.32 | 81.09 | 0.29 |

### olmOCR-Bench

olmOCR-Bench evaluates document-level OCR capabilities by performing binary unit-tests on the OCR output, which provide a clean, deterministic evaluation of OCR capabilities. We report our performance on the [English subset](https://huggingface.co/datasets/sarvamai/olmOCR-Bench-English), which contains 1258 document images.

| OlmoOCRBench | Overall↑ | arxiv_math↑ | baseline↑ | headers_footers↑ | long_tiny_text↑ | multi_column↑ | old_scans↑ | old_scans_math↑ | table_tests↑ |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Chandra OCR 2 | 85.9 | 86.7 | 99.8 | 91.5 | 93.7 | 84.7 | 51 | 88.2 | 92.2 |
| Sarvam Vision | 84.3 | 86.5 | 99.6 | 96.3 | 91 | 82.2 | 49.8 | 81 | 88.3 |
| Gemini 3.1 Pro | 82.6 | 90.5 | 99 | 82.9 | 88.5 | 81.6 | 47 | 84.3 | 87.3 |
| **IndicOCR (ours)** | **82.2** | **83.2** | **99.4** | **92.9** | **89.8** | **76** | **48.3** | **77.7** | **90** |
| Surya OCR 2 | 81.4 | 82.5 | 99.8 | 92.9 | 79.9 | 85.1 | 42.8 | 84.3 | 84.2 |
| Gemma-4-31B | 80.4 | 79 | 99.4 | 92.9 | 89.8 | 80.5 | 45.8 | 73.8 | 82.2 |
| PaddleOCRVL-1.6 | 78.7 | 85.1 | 98.4 | 96.2 | 75.3 | 83.9 | 39 | 68.3 | 83 |
| GPT-5.6-sol | 78 | 79.3 | 93.9 | 95.4 | 87.8 | 77.4 | 43.7 | 64.6 | 82.2 |
| Nemotron Parse 2 | 68.2 | 64 | 96.7 | 90 | 79.6 | 72.8 | 31.9 | 28.6 | 81.8 |


### IndicOCR-Printed

The primary hurdle in developing OCR models for Indic languages is the dearth of high-quality, diverse benchmarks across all 22 Indian languages and English. Another issue is that layout complexity and text recognition get entangled in OCR evaluation, so a model can be penalised for reading text correctly in the wrong order. We built an internal benchmark that separates the two, evaluating recognition at the block level across 22,043 images balanced over all 22 languages and English. We report word-level accuracy, computed as 100 × (1 − WER). Higher is better.


| Language | Sarvam Vision | **IndicOCR (ours)** | Gemini 3.1 Pro | Surya OCR 2 | Gemma-4-31B | Chandra OCR 2 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Overall** | 86.6 | **86.2** | 80.4 | 67.9 | 66.3 | 64.2 |
| Assamese | 89.5 | 90.2 | 90.7 | 86.4 | 70.6 | 73.5 |
| Bodo | 91.0 | 86.5 | 91.0 | 55.6 | 68.1 | 46.6 |
| Bengali | 91.6 | 91.4 | 92.5 | 81.1 | 83.9 | 79.2 |
| Dogri | 85.8 | 81.7 | 83.7 | 60.5 | 64.4 | 55.8 |
| English | 96.6 | 97.0 | 97.7 | 93.8 | 97.2 | 91.3 |
| Gujarati | 91.6 | 91.7 | 92.8 | 79.6 | 81.6 | 73.0 |
| Hindi | 95.7 | 96.0 | 96.3 | 90.3 | 93.7 | 89.3 |
| Konkani | 93.6 | 93.7 | 93.5 | 90.5 | 76.9 | 85.5 |
| Kannada | 88.8 | 88.0 | 89.8 | 75.7 | 68.3 | 69.6 |
| Kashmiri | 43.3 | **52.2** | 38.1 | 23.4 | 19.9 | 17.6 |
| Malayalam | 90.6 | 89.9 | 90.6 | 76.5 | 72.0 | 68.3 |
| Manipuri | 81.9 | **83.8** | 0.8 | 0.1 | 0.1 | 0.0 |
| Marathi | 93.9 | 93.5 | 94.5 | 84.3 | 89.1 | 83.1 |
| Maithili | 86.7 | 83.0 | 86.7 | 67.6 | 76.3 | 66.1 |
| Nepali | 92.5 | 91.5 | 93.7 | 87.6 | 87.2 | 82.1 |
| Odia | 77.5 | 75.7 | 84.8 | 64.5 | 38.7 | 62.6 |
| Punjabi | 92.2 | 93.2 | 93.5 | 86.3 | 75.1 | 84.1 |
| Sanskrit | 82.0 | 76.2 | 83.7 | 57.8 | 60.8 | 55.8 |
| Sindhi | 89.2 | 87.1 | 86.3 | 80.5 | 74.5 | 71.4 |
| Santali | 71.9 | **74.7** | 0.2 | 0.1 | 0.2 | 0.0 |
| Tamil | 94.2 | 91.3 | 94.4 | 79.9 | 83.3 | 79.0 |
| Telugu | 84.3 | 82.3 | 85.5 | 63.1 | 66.6 | 59.6 |
| Urdu | 87.1 | 85.9 | 88.0 | 76.4 | 76.6 | 74.4 |


### IndicOCR-Handwriting

To push OCR beyond printed text, we built a challenging block-level handwritten benchmark for Indic languages. Existing handwriting benchmarks suffer from the same quality and diversity gaps as printed Indic ones, so we hand-picked 10,544 images balanced across 12 languages and English, spanning a wide range of writers, from school students to adults, and a wide range of conditions, from hurried scribbles to bleedthrough, faded text and degraded historical scans. We report word-level accuracy, computed as 100 × (1 − WER). Higher is better.

| Language | Gemini 3.1 Pro | **IndicOCR (ours)** | Sarvam Vision | Gemma-4-31B | Chandra OCR 2 | Surya OCR 2 |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Overall** | 72.0 | **66.7** | 55.4 | 33.9 | 24.7 | 23.0 |
| Assamese | 71.6 | 66.1 | 47.8 | 24.1 | 8.9 | 17.8 |
| Bengali | 74.8 | 71.3 | 58.3 | 35.1 | 6.6 | 10.0 |
| English | 84.4 | 80.7 | 77.7 | 78.5 | 78.2 | 72.7 |
| Gujarati | 60.0 | 55.9 | 39.2 | 23.7 | 11.8 | 11.5 |
| Hindi | 83.1 | 77.6 | 72.3 | 70.7 | 54.6 | 42.7 |
| Kannada | 73.8 | 69.6 | 57.7 | 17.2 | 11.5 | 13.2 |
| Malayalam | 63.9 | 60.5 | 45.6 | 16.0 | 15.7 | 11.8 |
| Marathi | 79.0 | 70.2 | 61.8 | 56.5 | 35.4 | 28.8 |
| Odia | 66.7 | **68.2** | 40.6 | 15.5 | 19.4 | 19.9 |
| Punjabi | 70.1 | 69.4 | 54.8 | 11.7 | 11.5 | 15.7 |
| Tamil | 80.5 | 76.8 | 60.5 | 33.4 | 18.8 | 16.8 |
| Telugu | 72.0 | 53.5 | 59.1 | 32.0 | 20.8 | 14.6 |
| Urdu | 54.4 | 46.4 | 44.4 | 25.6 | 27.6 | 22.6 |

---

## Under the Hood

IndicOCR reads a document page and returns its text in reading order. It is a modular, two-stage parser: 
- IndicDocLayout detects the blocks on the page and orders them, 
- IndicBlockOCR transcribes the textual blocks. 

> **IMAGE — hero.** `assets/diagram.png` — page image → layout detection with reading
> order → block-level OCR → Markdown.

> **IndicDocLayout**
> Predicts labeled bounding boxes and reading order in a single pass.
>
> | | |
> |---|---|
> | **Base** | PP-DocLayoutV3 (based on RT-DETR) |
> | **Output** | Bounding boxes + reading order |
> | **Taxonomy** | 37 labels based oneducation-domain |
> | **Coverage** | Printed and Handwritten Pages |

<!-- Replaced by the card above; delete these two comment lines to bring it back.

**IndicDocLayout** is a finetuned version of PP-DocLayoutV3/RT-DocLayout, which is built on top of RT-DETR to predict bounding boxes and reading order at the same time. Trained with a 37-class taxonomy designed for education-domain documents, it predicts a labelled bounding box for each of the following layout elements:

-->

> Advertisement, Answer, Author, Chapter-end-section, Chapter-title, Chart, Code,
> Contact-info, Dateline, Diagram, Equation, Expression, Flag, Folio, Footer, Footnote,
> Header, Image, Image-caption, Index, Infobox, List, MCQ, Page-number, Paragraph,
> Placeholder-text, Question, Reference, Section-title, Solved-example, Sub-section-title,
> Sub-sub-section-title, Table, Table-caption, Table-of-contents, Title, Website-link


> **IndicBlockOCR**
> Transcribes text within each detected block.
>
> | | |
> |---|---|
> | **Base** | Qwen3.5-0.8B |
> | **Output** | Text, LaTeX for equations |
> | **Tokenizer** | Sarvam-30B for Indic-native vocabulary |
> | **Coverage** | 22 scheduled languages + English, 13 unique scripts |

<!-- Replaced by the card above; delete these two comment lines to bring it back.

**IndicBlockOCR** is based on Qwen3.5-0.8B for superior OCR performance at a sub-1B scale. It has been trained with **Sarvam-30B tokenizer**, whose vocabulary covers high-resource as well as low-resource Indic languages, allowing the model to exhibit strong multilingual performance across the 22 scheduled Indic languages alongside English.

-->


## What was our model trained on?

IndicOCR's performance comes from a curated data mixture spanning diverse domains, chosen so the model generalises across languages, layouts and document types. In total, IndicOCR was trained on more than 15 million pages. We prioritised real-world document collection across government documents, novels, textbooks, magazines and research papers, and drew on public datasets including [IndicDLP](https://huggingface.co/datasets/ai4bharat/indicdlp) and the [Library of Congress transcripts](https://huggingface.co/datasets/allenai/olmOCR-mix-1025/viewer/02_loc_transcripts). We also collected handwritten pages in different Indic languages through an internal collection drive in which participants submitted pages across a range of domains, scripts and demographics. All of this was supplemented by a synthetic document generator that teaches the model to read across all 13 scripts, producing annotated image-text pairs at scale with precise bounding boxes and paragraph-level transcriptions. A separate pipeline targets complex, long tables with dense numeric content in both English and Indic languages, modelled on the financial tables found in SEC filings.

---

## Throughput

We benchmarked our end-to-end pipeline with vLLM on a single NVIDIA H100 80GB GPU using a diverse mix of documents (math, tables, handwritten notes, research papers, multi-column, and even complex newspaper layouts) from the OmniDocBench V1.6 benchmark set (official english subset).

| Concurrency | Pages / s | Output tokens / s | Median page (ms) | p95 page (ms) |
| --- | :---: | :---: | :---: | :---: |
| 32 | 5.13 | 6,594 | 3,295 | 19,243 |
| 64 | 6.26 | 7,935 | 4,813 | 34,196 |
| 128 | 6.34 | 7,736 | 9,337 | 72,970 |
| 256 | 6.27 | 7,700 | 28,188 | 81,229 |

---

## Stay tuned for what's next


Getting here took an year of handwritten data collection across India, building synthetic data pipelines, and training runs aimed at all 22 languages rather than the handful with data to spare. Here's what we're working on next:

**Better handwriting recognition.** Handwriting recognition still trails behind printed text, especially on cursive, dense annotation and pages with heavy correction. More training data from real handwritten sources is the main lever, and that collection is ongoing.


**Handwriting across all 22 languages.** We support handwriting recognition in 12 Indic languages today, and the remaining 10 are the ones with the least handwritten data available anywhere. We are currently building synthetic data generation pipelines to improve performance across all langauges.


**Reading order on dense layouts.** Multi-column newspapers, magazine spreads and forms with nested fields still produce inconsistent ordering, even when every block is read correctly. Better reading-order supervision during training is what we're working on.


**Layouts beyond the education domain.** Our layout taxonomy was built around education-domain documents, so categories common in legal, medical and financial paperwork aren't represented well. Extending the taxonomy and the annotation set to cover them is next.

---

## Help us get better at OCR!

We want to actively keep on improving on the most difficult documents you can throw at us. The failures we most need are the ones our own benchmarks cannot show us: a script we are not doing well in, an important document domain our layout fails in, handwriting samples we are hallucinating badly in. If you run something through our model and the performance is not upto the mark, please send us the page or [contact us](mailto:contact@bodhan.ai). The weights are available on the link below on Hugging Face.

## Cite this work

Released under the [Indic Open Model License v1.0](/indic-open-model-license/v1).

```bibtex
@misc{indicocr2026,
  title  = {IndicOCR: Multilingual Document Parsing for English and 22 Indian Languages},
  author = {Bodhan AI and AI4Bharat},
  year   = {2026},
  url    = {https://bodhan.ai/research/blogs/indic-ocr}
}
```

---


Released under the [Indic Open Model License v1.0](/indic-open-model-license/v1). The base models, including PP-DocLayoutV3, Qwen3.5 and the Sarvam-30B tokenizer, carry their own license terms — ensure your use complies with both.
