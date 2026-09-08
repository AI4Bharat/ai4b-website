#!/usr/bin/env python3
"""Each language's name in its own script, checked against that script's Unicode block.

    python3 src/wallgen.py            # writes src/wall.json

The post's claim is that the model reads text as it is written, so the widget that
picks a language should be written in those languages rather than transliterated into
ours. The endonyms below are the one thing on the page that is not derived from the
repo -- they are entered by hand -- so this script exists to check the part of them
that IS checkable: every character of every name has to fall inside the Unicode block
of the script the page already claims for that language. That catches a name in the
wrong script, which is the error worth catching automatically.

Spelling still needs a native reader. The script prints every name so it can be read.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

SRC = Path(__file__).parent

# Each language's name as written by its own speakers.
ENDONYM = {
    "Assamese": "অসমীয়া", "Bengali": "বাংলা", "Bodo": "बड़ो", "Dogri": "डोगरी",
    "Gujarati": "ગુજરાતી", "Hindi": "हिन्दी", "Kannada": "ಕನ್ನಡ", "Kashmiri": "کٲشُر",
    "Konkani": "कोंकणी", "Maithili": "मैथिली", "Malayalam": "മലയാളം",
    "Manipuri": "ꯃꯤꯇꯩꯂꯣꯟ", "Marathi": "मराठी", "Nepali": "नेपाली", "Odia": "ଓଡ଼ିଆ",
    "Punjabi": "ਪੰਜਾਬੀ", "Sanskrit": "संस्कृतम्", "Santali": "ᱥᱟᱱᱛᱟᱲᱤ",
    "Sindhi": "सिन्धी", "Tamil": "தமிழ்", "Telugu": "తెలుగు", "Urdu": "اُردُو",
}

# The block each script occupies. Combining marks and the ZWJ/ZWNJ that Indic shaping
# needs are allowed everywhere; everything else has to be in its own script's range.
BLOCKS = {
    "Devanagari": [(0x0900, 0x097F), (0xA8E0, 0xA8FF)],
    "Bengali–Assamese": [(0x0980, 0x09FF)],
    "Gujarati": [(0x0A80, 0x0AFF)],
    "Gurmukhi": [(0x0A00, 0x0A7F)],
    "Kannada": [(0x0C80, 0x0CFF)],
    "Malayalam": [(0x0D00, 0x0D7F)],
    "Meitei Mayek": [(0xABC0, 0xABFF), (0xAAE0, 0xAAFF)],
    "Odia": [(0x0B00, 0x0B7F)],
    "Ol Chiki": [(0x1C50, 0x1C7F)],
    "Perso-Arabic": [(0x0600, 0x06FF), (0x0750, 0x077F), (0xFB50, 0xFDFF), (0xFE70, 0xFEFF)],
    "Tamil": [(0x0B80, 0x0BFF)],
    "Telugu": [(0x0C00, 0x0C7F)],
}
NEUTRAL = {0x200C, 0x200D}          # ZWNJ / ZWJ


def languages():
    html = (SRC.parent / "indic-speak.html").read_text(encoding="utf-8")
    data = json.loads(re.search(r'<script id="page-data" type="application/json">(.*?)</script>',
                                html, re.S).group(1))
    return data["languages"]


def main():
    langs = languages()
    out, bad = {}, []
    by_script = {}
    for l in langs:
        name, script = l["name"], l["script"]
        if name not in ENDONYM:
            bad.append(f"{name}: no endonym")
            continue
        if script not in BLOCKS:
            bad.append(f"{name}: no Unicode block for script {script!r}")
            continue
        for ch in ENDONYM[name]:
            cp = ord(ch)
            if cp in NEUTRAL or unicodedata.category(ch) == "Mn":
                continue
            if not any(lo <= cp <= hi for lo, hi in BLOCKS[script]):
                bad.append(f"{name}: {ch!r} U+{cp:04X} ({unicodedata.name(ch, '?')}) "
                           f"is outside {script}")
        out[l["code"]] = {"name": name, "endonym": ENDONYM[name], "script": script}
        by_script.setdefault(script, []).append(l["code"])

    # Script groups, largest first. The nine scripts used by exactly one language get
    # one row between them rather than nine rows of a single tile each: the fact is
    # that they are unshared, and nine near-empty rows say it nine times while making
    # the widget twice as tall. Their script name rides on the tile when it differs
    # from the language name (Ol Chiki / Santali), and is dropped when it does not.
    shared = sorted(((s, c) for s, c in by_script.items() if len(c) > 1),
                    key=lambda kv: (-len(kv[1]), kv[0]))
    own = sorted((s, c[0]) for s, c in by_script.items() if len(c) == 1)
    groups = [{"kind": "shared", "script": s, "codes": c} for s, c in shared]
    if own:
        groups.append({"kind": "own", "script": "A script of its own",
                       "codes": [c for _, c in own]})
    for s, c in own:
        out[c]["own_script"] = s
    if bad:
        print("FAILED:", *bad, sep="\n  ")
        sys.exit(1)

    (SRC / "wall.json").write_text(json.dumps({"langs": out, "groups": groups},
                                              ensure_ascii=False), encoding="utf-8")
    print(f"wrote src/wall.json  {len(out)} languages, {len(by_script)} scripts in "
          f"{len(groups)} rows, every character inside its script's block")
    for g in groups:
        print(f"  {len(g['codes'])}  {g['script']:19s} " +
              "  ".join(f"{out[c]['endonym']} ({out[c]['name']})" for c in g["codes"]))


if __name__ == "__main__":
    main()
