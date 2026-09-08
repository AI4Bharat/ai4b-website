#!/usr/bin/env python3
"""Run the text normaliser on a fixed set of examples and record what it returns.

The page shows what the normaliser actually does, so the outputs are captured from
the library rather than typed by hand. Nothing in norm.json is written by a person:
if the normaliser changes, re-run this and the page changes with it.

    PYTHONNOUSERSITE=1 python3 src/normgen.py

The normaliser lives in the sibling text-norm repo. `number_lang` is a constructor
argument, not a normalize() argument.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, "/projects/data/ttsteam/ashwin/text-norm")
from indic_normalizer import Normalizer  # noqa: E402

SRC = Path(__file__).parent

# (group, note, text). Groups become tabs on the page. The note says what the
# example is there to show, so a reader knows what to look at.
CASES = [
    ("Mathematics", "An integral, its limits and a square root, read as a person would say them.",
     r"The Gaussian result $\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$ appears everywhere."),
    ("Mathematics", "The quadratic formula: nested fraction, plus-or-minus, and a radical.",
     r"Roots of $ax^2+bx+c=0$ are $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$."),
    ("Mathematics", "A limit, spoken as the approach rather than the symbol.",
     r"In calculus, $\lim_{x \to 0} \frac{\sin x}{x} = 1$ is the first result worth memorising."),
    ("Mathematics", "An infinite series with a closed form.",
     r"Let $f(x) = \sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$."),
    ("Mathematics", "A differential equation with an initial condition.",
     r"Solve $\frac{dy}{dx} + 2y = 0$ where $y(0) = 1$."),
    ("Mathematics", "Set operators and absolute value.",
     r"The set $A \cap B \subseteq C$ has $|A| = 12$ elements."),
    ("Mathematics", "Greek letters and degrees inside ordinary prose.",
     r"If $x^2 + y^2 = r^2$ and $\theta = 45^\circ$, then $\sin\theta \approx 0.707$."),

    ("Identifiers", "A PAN is read letter by letter, then digit by digit, never as a number.",
     "My PAN is ABCDE1234F and my Aadhaar is 1234 5678 9012."),
    ("Identifiers", "Bank codes and long account numbers, spelled out so they can be written down.",
     "Transfer to HDFC0001234, account 50100123456789."),
    ("Identifiers", "A mobile number and a toll-free line, both read as digits.",
     "Call +91 98765 43210 or 1800-123-4567."),

    ("Places and travel", "A room number reads positionally, the way people say it.",
     "Report to room 402 at 9:30 AM."),
    ("Places and travel", "The same three digits on a flight read as a quantity instead.",
     "Flight AI 302 departs from gate 14B."),
    ("Places and travel", "A route number with a letter suffix, and a platform.",
     "Take bus 42A from platform 3."),

    ("Money and dates", "Indian digit grouping becomes lakh, and the decimal becomes paise.",
     "The invoice totals Rs. 1,23,456.78 including 18% GST."),
    ("Money and dates", "A date in day-month-year order, and a clock time.",
     "On 15/08/1947 at 12:00 midnight."),
]

# The Hindi pair, which is the same sentence with and without a forced number language.
HINDI = "भारत 1947 में स्वतंत्र हुआ। ₹1,250 की छूट, 12.5% ब्याज।"


def main():
    en = Normalizer(lang="en")
    out = {"groups": [], "cases": []}
    for group, note, text in CASES:
        spoken = en.normalize(text)
        assert spoken != text, f"normaliser left this unchanged: {text}"
        if group not in out["groups"]:
            out["groups"].append(group)
        out["cases"].append({"group": group, "note": note, "text": text, "spoken": spoken})

    hi_default = Normalizer(lang="hi").normalize(HINDI)
    hi_forced = Normalizer(lang="hi", number_lang="hi").normalize(HINDI)
    assert hi_default != hi_forced, "number_lang made no difference; check the option name"
    out["hindi"] = {"text": HINDI, "default": hi_default, "forced": hi_forced}

    (SRC / "norm.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print(f"{len(out['cases'])} examples over {len(out['groups'])} groups: {out['groups']}")
    for c in out["cases"]:
        print(f"\n[{c['group']}] {c['text'][:64]}\n  -> {c['spoken'][:150]}")
    print(f"\nwrote {SRC / 'norm.json'}")


main()
