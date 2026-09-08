#!/usr/bin/env python3
"""Assemble the two Indic-Speak posts.

    python3 src/build.py            # writes ../indic-speak.html and ../indic-speak-technical.html

Both pages share design.css, post.css and page.js. Each carries only the data blobs
its own widgets need, and every widget in page.js bails out when its container is
absent, so one script serves both.

The benchmark data blob is read back out of the existing capability page, so the
measured numbers survive a rebuild without being re-derived here.
"""
import json
import re
from pathlib import Path

S = Path(__file__).parent
BLOG = S.parent
DESIGN = Path("/projects/data/llmteam/translation/ujjwal/code/c3po/blog/mt-blog/src/design.css")

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&"
         "family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@400;500;600&"
         + "&".join(f"family=Noto+Sans+{s}:wght@400;600" for s in
                    ["Devanagari", "Bengali", "Tamil", "Telugu", "Malayalam", "Kannada",
                     "Gujarati", "Gurmukhi", "Oriya", "Ol+Chiki", "Meetei+Mayek"])
         + "&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap")

# The measured benchmark data lives in whichever page was built last; take it from
# the capability page, which has always carried it.
prev = (BLOG / "indic-speak.html").read_text(encoding="utf-8")
DATA = re.search(r'<script id="page-data" type="application/json">(.*?)</script>', prev, re.S).group(1).strip()


# The hero demo and the read-aloud narration are assets the team drops in later.
# Discovering them at build time means a control is only ever live when the file it
# needs exists, and going live is "add the file, rebuild" with no code change.
#
#   media/indic-speak-demo.mp4              the hero demo video
#   audio/narration/<page-stem>.mp3         the spoken article
#   audio/narration/<page-stem>.words.json  [[startSeconds, endSeconds, wordIndex], ...]
#                                           word-level timings, for the read-along
def discover_media(stem):
    demo = BLOG / "media" / "indic-speak-demo.mp4"
    nar = BLOG / "audio" / "narration" / f"{stem}.mp3"
    words = BLOG / "audio" / "narration" / f"{stem}.words.json"
    return {
        "demo": f"media/{demo.name}" if demo.exists() else None,
        "narration": f"audio/narration/{nar.name}" if nar.exists() else None,
        "words": f"audio/narration/{words.name}" if words.exists() and nar.exists() else None,
    }


def blob(tag, path):
    return f'<script id="{tag}" type="application/json">{(S / path).read_text(encoding="utf-8").strip()}</script>'


PAGES = [
    {
        "out": "indic-speak.html",
        "body": "body-capability.html",
        "title": "Indic-Speak: Text-to-Speech for the Way India Actually Writes",
        "desc": "Meet Indic-Speak: 45 voices for 22 Indian languages, built to read native and Latin scripts together without language tags.",
        # the capability post: clips, voice samples and the normaliser examples
        "blobs": ["hero.json:hero-data", "clips.json:clip-data", "norm.json:norm-data",
                  "params.json:param-data",
                  "waves.json:wave-data", "tex.json:tex-data",
                  "wall.json:wall-data", "ab.json:ab-data",
                  "styles.json:style-data", "align.json:align-data"],
    },
    {
        "out": "indic-speak-technical.html",
        "body": "body-technical.html",
        "title": "How Indic-Speak Turns Text into Speech: Technical Report",
        "desc": "How Indic-Speak turns speech into a next-token problem: a Llama-3.2-3B decoder, audio codes in its vocabulary, and a seven-token audio frame.",
        # the technical post: the counted parameters and the normaliser examples,
        # which are as useful to a developer deciding what to send as to a reader.
        "blobs": ["hero.json:hero-data", "params.json:param-data", "norm.json:norm-data",
                  "waves.json:wave-data", "api.json:api-data", "tex.json:tex-data"],
    },
]


def main():
    css = DESIGN.read_text(encoding="utf-8")
    post_css = (S / "post.css").read_text(encoding="utf-8") + (S / "tex.css").read_text(encoding="utf-8") \
               + (S / "wall.css").read_text(encoding="utf-8") \
               + (S / "range.css").read_text(encoding="utf-8") \
               + (S / "styles.css").read_text(encoding="utf-8") \
               + (S / "wide.css").read_text(encoding="utf-8") \
               + (S / "readalong.css").read_text(encoding="utf-8") \
               + (S / "refine.css").read_text(encoding="utf-8")
    # tex.js rides in the same <script> tag as page.js: one script block per page is
    # what src/check.py keys its markup/script split on.
    js = (S / "page.js").read_text(encoding="utf-8") + (S / "tex.js").read_text(encoding="utf-8") \
         + (S / "bars.js").read_text(encoding="utf-8") \
         + (S / "fade.js").read_text(encoding="utf-8") \
         + (S / "range.js").read_text(encoding="utf-8") \
         + (S / "voices.js").read_text(encoding="utf-8") \
         + (S / "readalong.js").read_text(encoding="utf-8")

    for spec in PAGES:
        body = (S / spec["body"]).read_text(encoding="utf-8")
        blobs = "\n".join(blob(t, p) for p, t in (b.split(":") for b in spec["blobs"]))
        media = discover_media(spec["out"].replace(".html", ""))
        blobs += f'\n<script id="media-data" type="application/json">{json.dumps(media)}</script>'
        # A control is only ever pending when its asset is genuinely missing.
        if media["demo"]:
            body = body.replace('id="heroDemoOpen"', 'id="heroDemoOpen" data-ready="1"')
        else:
            body = body.replace('id="heroDemoOpen"', 'id="heroDemoOpen" data-pending="1"')
        html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{spec['title']}</title>
<meta name="description" content="{spec['desc']}">
<link rel="icon" type="image/png" href="images/bodhan_mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<style>
/* ==========================================================================
 * design.css - the Bodhan design system, inlined verbatim from the website
 * template so the research-* and chart-* classes behave exactly as they do on
 * the Indic-Translate and IndicOCR posts. Do not edit here.
 * ======================================================================== */
{css}
/* ==========================================================================
 * This post.
 * ======================================================================== */
{post_css}
</style>
</head>
<body>
{body}
<script id="page-data" type="application/json">{DATA}</script>
{blobs}
<script>
{js}
</script>
</body>
</html>
"""
        (BLOG / spec["out"]).write_text(html, encoding="utf-8")
        print(f"wrote {spec['out']:32s} {len(html.encode()):>9,d} bytes")


main()
