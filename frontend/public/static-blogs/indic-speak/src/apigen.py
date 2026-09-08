#!/usr/bin/env python3
"""Build the public parameter list from verify_api/CONTRACT.md.

    python3 src/apigen.py            # writes src/api.json and export.md

The contract is the source of truth and it is verified live against the endpoint,
so the page is generated from it rather than transcribed. Two rules:

* **No duplicates.** The contract lists `text` and `speaker` as accepted aliases
  in their own rows, and `nvext.repetition_penalty` as a second path to a knob
  that already exists. None of those is a separate parameter, so each is folded
  into the row it aliases or overrides.
* **Caveats are behaviours, not results.** Each one below is something the API
  does that will surprise a caller, attached to the parameter it applies to.
  Nothing about audio quality or benchmark scores belongs here.
"""
import json
import re
from pathlib import Path

SRC = Path(__file__).parent
CONTRACT = SRC.parent.parent / "verify_api" / "CONTRACT.md"

# field -> the field it is really the same knob as
ALIAS_OF = {"text": "prompt", "speaker": "voice_clone_id"}
FOLD_INTO = {"nvext.repetition_penalty": "repetition_penalty"}

# What each parameter is for, in the reader's terms rather than the contract's.
BLURB = {
    "prompt": "The text to speak, normalised the way you want it read.",
    "model": "Which model to run. Send <code>bodhan-tts</code>.",
    "voice_clone_id": "Which of the 45 voices reads it.",
    "style": "Delivery register. Omit it for the conversational default.",
    "temperature": "Sampling randomness. Lower is steadier, higher is more varied.",
    "top_p": "Nucleus sampling cutoff.",
    "top_k": "Sampling pool size.",
    "repetition_penalty": "Discourages the model from repeating itself.",
    "max_tokens": "Hard ceiling on generated audio length.",
}

# Behavioural caveats, each tied to the parameter it applies to. Sourced from the
# contract's own "request-validation gaps", alias and error sections.
CAVEATS = [
    ("prompt", "It is not required, and omitting it is not an error.",
     "A request with a missing or misspelled <code>prompt</code> returns <code>200</code> and a "
     "few seconds of audio rather than a <code>4xx</code>. Validate that the field is present "
     "and non-empty before sending."),
    ("model", "It is not validated.",
     "Omitting it, or sending a model that does not exist, still returns <code>200</code>. Send "
     "the right value for correctness, but do not rely on a wrong one failing loudly."),
    ("voice_clone_id", "The name is misleading: there is no voice cloning.",
     "It selects a library voice by name. There is no reference audio and no cloning, despite "
     "the field name. An unknown name returns <code>422</code>."),
    ("style", "An unknown style is rejected, and the casing is exact.",
     "Styles are matched literally, so a display-cased string will not do. An unknown style "
     "returns <code>422</code>."),
    ("top_p", "It applies only when strictly between 0 and 1.",
     "Sending <code>0</code> or <code>1</code> silently disables it rather than clamping."),
    ("top_k", "It is not exclusive with <code>top_p</code>: both apply at once.",
     "Setting one does not switch the other off. Setting <code>top_k</code> to <code>1</code> "
     "makes generation greedy, which is the only way to get a byte-for-byte reproducible "
     "result: there is no seed parameter, so at the default temperature two identical requests "
     "return different audio."),
    ("repetition_penalty", "A nested field can override it.",
     "<code>nvext.repetition_penalty</code> is accepted and takes precedence over the top-level "
     "value. Send one or the other, not both."),
    ("max_tokens", "Reaching the ceiling truncates the audio without an error.",
     "The default is about thirty seconds of speech. Longer passages have to be split at "
     "punctuation and joined by the caller; the endpoint will not do it."),
    (None, "Unknown fields are ignored, not rejected.",
     "Any field outside this list (including <code>language</code> and <code>seed</code>) "
     "returns <code>200</code> and has no effect, so a typo in a parameter name is "
     "silently dropped. There is no language field at all; the language is inferred from the text."),
    (None, "Every client-side error arrives as <code>422</code>.",
     "The gateway collapses the backend&rsquo;s <code>4xx</code> responses into one status, and "
     "the real cause appears only in the message string. You cannot tell a bad voice from a bad "
     "style by status code; validate client-side against the voice and style lists. Saturation "
     "returns <code>429</code> or <code>503</code>, both retryable with backoff."),
]


def main():
    md = CONTRACT.read_text(encoding="utf-8")
    block = md[md.index("## Request"):md.index("Unknown fields are ignored")]
    rows = re.findall(r"^\| `([^`]+)` \| ([^|]*?) \| ([^|]*?) \| (.*?) \|$", block, re.M)
    assert rows, "no request table found in the contract"

    params, folded = [], {}
    for name, typ, default, note in rows:
        name = name.strip()
        if name in ALIAS_OF or name in FOLD_INTO:
            folded.setdefault(ALIAS_OF.get(name) or FOLD_INTO[name], []).append(name)
            continue
        d = default.strip().strip("`")
        # Three distinct states the contract expresses in one column: required
        # (no default), optional with a default, and optional with nothing
        # applied when absent. Collapsing the last two reads as "required".
        required = d == "—" and name != "style"
        params.append({
            "name": name,
            "type": typ.strip(),
            "default": "" if d in ("—", "none", "") else d,
            "required": required,
            "what": BLURB.get(name, ""),
        })
    for p in params:
        p["alias"] = folded.get(p["name"], [])
        assert p["what"], f"no blurb for {p['name']}"

    names = [p["name"] for p in params]
    assert len(names) == len(set(names)), "duplicate parameter rows"
    out = {"params": params,
           "caveats": [{"param": a, "title": b, "body": c} for a, b, c in CAVEATS]}
    (SRC / "api.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    write_export(md, out)
    print(f"{len(params)} parameters (from {len(rows)} contract rows; "
          f"{len(rows) - len(params)} folded as aliases/overrides), {len(CAVEATS)} caveats")
    for p in params:
        state = "REQUIRED" if p["required"] else (p["default"] or "none applied")
        print(f"  {p['name']:22s} {p['type']:8s} {state:14s} alias={','.join(p['alias']) or '-'}")


# The six emotions, named so the rest can be derived as contexts. They are the one
# split in the style list that means something: a context says where the speech is
# going, an emotion says how it feels, and six cards all reading "emotion" said
# neither. Every string still comes from the contract; only the grouping and the
# plain-English note are editorial, and a style with no note is an error rather than
# a blank cell.
EMOTIONS = {"happy", "sad", "anger", "fear", "surprise", "disgust"}
# A note written for a card that carries more than one value.
GROUP_NOTE = {
    ("AIR style news", "TV style news"):
        "two bulletin registers: All India Radio&rsquo;s formal, even cadence, "
        "and the faster, punchier television read",
}
STYLE_NOTE = {
    "news": "a plain bulletin read",
    "AIR style news": "All India Radio cadence: formal, even, unhurried",
    "TV style news": "a television bulletin, faster and punchier",
    "advertisements": "ad-spot delivery",
    "children&rsquo;s stories": "animated, with a wide pitch range",
    "educational lecture": "measured and instructional",
    "single person narration audiobook": "one narrator, long-form",
    "Customer Care": "a courteous support-agent register",
}


def write_styles(styles):
    """src/styles.json: the contract's fourteen, split into contexts and emotions,
    each carrying its heard example where src/stylegen.py found one."""
    samples = {}
    sp = SRC / "style_samples.json"
    if sp.exists():
        samples = json.loads(sp.read_text(encoding="utf-8"))
    missing = EMOTIONS - set(styles)
    assert not missing, f"emotions absent from the contract: {sorted(missing)}"
    # `news` is not shown: the two named news registers below it, AIR and TV, are
    # what a caller actually wants, and a third undifferentiated "news" alongside
    # them reads as a duplicate. It remains a valid value the endpoint accepts and
    # export.md still lists it; this is the blog's shortlist, not the contract.
    HIDDEN = {"news"}
    # Reading order, not the contract's alphabetical columns: the two news
    # registers belong next to each other, and the list is short enough that a
    # reader should meet them grouped by what they are for.
    # AIR and TV are two literal values but one idea, and one clip serves both, so
    # they share a card. Both strings still show: they are what a caller sends.
    GROUPS = [["AIR style news", "TV style news"]]
    order = ["AIR style news", "TV style news", "advertisements",
             "children's stories", "educational lecture",
             "single person narration audiobook", "Customer Care"]
    plain = [s for s in styles if s not in EMOTIONS and s not in HIDDEN]
    assert sorted(order) == sorted(plain), f"display order does not match the contract: {plain}"
    grouped = {v: g for g in GROUPS for v in g}
    context, done = [], set()
    for s in order:
        if s in done:
            continue
        key = s.replace("'", "&rsquo;")
        assert key in STYLE_NOTE, f"no note for style {s!r}"
        g = grouped.get(s, [s])
        done.update(g)
        row = {"values": g, "kind": "context",
               "note": GROUP_NOTE[tuple(g)] if tuple(g) in GROUP_NOTE else STYLE_NOTE[key]}
        for v in g:                       # the clip may be filed under either value
            if v in samples:
                row["sample"] = samples[v]
                break
        context.append(row)
    emotion = [{"values": [s], "kind": "emotion",
                **({"sample": samples[s]} if s in samples else {})}
               for s in styles if s in EMOTIONS]
    out = {"context": context, "emotion": emotion}
    (SRC / "styles.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    values = sum(len(r["values"]) for r in context + emotion)
    heard = sum(1 for r in context + emotion if "sample" in r)
    print(f"  styles.json: {values} values on {len(context) + len(emotion)} cards, "
          f"{heard} with a sample")
    print(f"  styles.json: {len(context)} contexts + {len(emotion)} emotions = "
          f"{len(context) + len(emotion)} shown of {len(styles)} in the contract "
          f"(hidden: {sorted(HIDDEN)})")


def write_export(md, out):
    """A standalone reference to hand to an end user.

    Same source, same de-duplication, same caveats as the page. It carries the
    voice and style lists too, because those are the legal values for two of the
    parameters and a caveat tells the caller to validate against them. The
    endpoint path and the auth header stay placeholders until the public ones are
    announced.
    """
    def strip(s):
        s = re.sub(r"<code>(.*?)</code>", r"`\1`", s)
        s = re.sub(r"<[^>]+>", "", s)
        for a, b in (("&mdash;", "—"), ("&rsquo;", "\u2019"), ("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">")):
            s = s.replace(a, b)
        return s

    L = ["# Indic-Speak — request parameters",
         "",
         "Every parameter a caller can send, once each. The contract also accepts `text`,",
         "`speaker` and `nvext.repetition_penalty`; those are not separate parameters and are",
         "listed against the ones they stand for.",
         "",
         "Generated from `verify_api/CONTRACT.md` by `blog/src/apigen.py` — edit the contract,",
         "not this file.",
         "",
         "```http",
         "POST /v1/audio/speech",
         "Content-Type: application/json",
         "",
         '{',
         '  "prompt": "भारत एक हज़ार नौ सौ सैंतालीस में स्वतंत्र हुआ।",',
         '  "model": "bodhan-tts",',
         '  "voice_clone_id": "Amit",',
         '  "style": "news"',
         '}',
         "```",
         "",
         "## Parameters",
         "",
         "| parameter | type | default | what it does |",
         "|---|---|---|---|"]
    for p in out["params"]:
        default = "**required**" if p["required"] else (f"`{p['default']}`" if p["default"] else "none applied")
        note = ""
        if p["alias"]:
            note = " Also accepted as " + " or ".join(f"`{a}`" for a in p["alias"]) + "."
        L.append(f"| `{p['name']}` | {p['type']} | {default} | {strip(p['what'])}{note} |")

    L += ["", "## Caveats", "",
          "Behaviours that will surprise a caller. These are properties of the interface, not",
          "of the audio.", ""]
    for c in out["caveats"]:
        who = f"`{c['param']}`" if c["param"] else "Any request"
        L.append(f"- **{who} — {strip(c['title'])}** {strip(c['body'])}")

    # The legal values for voice_clone_id and style, which a caveat points at.
    #
    # The per-language table is the source, NOT the flat code block above it: that
    # block lists 44 names against its own heading of 45 (Sansuma, the Bodo male
    # voice, is absent from it) while the table, and the benchmark data, have all
    # 45. Deriving from the table means the export cannot inherit that gap, and
    # the assertions below refuse to let either count drift again unnoticed.
    claimed = int(re.search(r"## Voices — (\d+)", md).group(1))
    tbl = md[md.index("| code | language | female | male |"):]
    tbl = tbl[:tbl.index("## Styles")]
    rows = re.findall(r"^\| `(\w+)` \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$", tbl, re.M)
    voices = sorted({n.strip() for _, _, f_, m_ in rows for cell in (f_, m_)
                     for n in cell.split(",") if n.strip()})
    flat = re.search(r"## Voices — \d+\n\n```\n(.*?)```", md, re.S).group(1).split()
    assert len(voices) == claimed, f"language table has {len(voices)} voices, heading claims {claimed}"
    if sorted(flat) != voices:
        print(f"  NOTE contract's flat voice block is out of sync: "
              f"missing {sorted(set(voices) - set(flat)) or 'nothing'}, "
              f"extra {sorted(set(flat) - set(voices)) or 'nothing'} -- using the table")
    styles_block = re.search(r"## Styles — (\d+)\n\n```\n(.*?)```", md, re.S)
    claimed_styles = int(styles_block.group(1)); styles_block = styles_block.group(2)
    L += ["", f"## Voices — {len(voices)}", "",
          "Library voices only, selected by name. The language is inferred from the text.", "",
          "| code | language | female | male |", "|---|---|---|---|"]
    for code, lang, f_, m_ in rows:
        L.append(f"| `{code}` | {lang.strip()} | {f_.strip()} | {m_.strip()} |")
    styles = [s.strip() for s in re.split(r"\s{2,}|\n", styles_block) if s.strip()]
    assert len(styles) == claimed_styles, f"parsed {len(styles)} styles, heading claims {claimed_styles}"
    L += ["", f"## Styles — {len(styles)}", "",
          "Matched literally, so the casing below is the casing to send. Omit `style` for the",
          "conversational default.", ""]
    L += [f"- `{s}`" for s in styles]
    write_styles(styles)
    L.append("")

    Path(__file__).parent.parent.joinpath("export.md").write_text("\n".join(L), encoding="utf-8")
    print(f"  export.md: {len(out['params'])} parameters, {len(out['caveats'])} caveats, "
          f"{len(voices)} voices, {len(styles)} styles, {len(rows)} language rows")


main()
