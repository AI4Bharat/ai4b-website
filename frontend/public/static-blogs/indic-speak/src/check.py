#!/usr/bin/env python3
"""Static checks over every built page: data blobs parse, tags balance, no class is
used without a rule, and every local asset referenced exists.

    python3 src/check.py

This runs over BOTH posts. It used to run over one, which is how a `.prompt-box`
with no rule reached the technical page and pushed the document sideways on a phone.
"""
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

BLOG = Path(__file__).parent.parent
PAGES = ["indic-speak.html", "indic-speak-technical.html"]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr"}
# Classes that intentionally carry no rule of their own.
NO_RULE_OK = {"sr-only", "section-opening"}

fail = 0
for name in PAGES:
    h = (BLOG / name).read_text(encoding="utf-8")
    problems = []

    for m in re.finditer(r'<script id="([a-z-]+-data)" type="application/json">(.*?)</script>', h, re.S):
        try:
            json.loads(m.group(2))
        except Exception as e:
            problems.append(f"blob {m.group(1)} does not parse: {e}")

    # An unterminated @media swallows every rule after it, and a stray } ends a block
    # early -- both silently, because CSS error recovery just resumes. Counting braces
    # does not catch it: one of each cancels out. This tracks depth, which does.
    naked = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)),
                   h[h.index("<style>"):h.index("</style>")], flags=re.S)
    depth, orphans, line = 0, [], 1
    for ch in naked:
        if ch == "\n":
            line += 1
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth < 0:
                orphans.append(line)
                depth = 0
    if orphans:
        problems.append(f"stray }} in the stylesheet at line(s) {orphans[:5]} of <style>")
    if depth:
        problems.append(f"stylesheet ends {depth} block(s) open -- everything after the "
                        f"unclosed one is inside it")

    stack, bad = [], []

    class P(HTMLParser):
        def handle_starttag(self, tag, attrs):
            if tag not in VOID:
                stack.append((tag, self.getpos()))

        def handle_endtag(self, tag):
            if stack and stack[-1][0] == tag:
                stack.pop()
            else:
                bad.append((tag, self.getpos()))

    P().feed(h)
    if bad:
        problems.append(f"unbalanced close tags: {bad[:3]}")
    if stack:
        problems.append(f"unclosed tags: {[s[0] for s in stack[:3]]}")

    # Anchors and assets are markup concerns; the script block carries href
    # strings for the OTHER page, which are neither anchors nor files here.
    markup = h[:h.rindex("<script>")]
    css = h[h.index("<style>"):h.index("</style>")]
    used = set()
    for m in re.findall(r'class="([^"]+)"', h):
        used.update(m.split())
    for m in re.findall(r"'class': '([^']+)'", h[h.rindex("<script>"):]):
        used.update(m.split())
    orphans = sorted(c for c in used
                     if c not in NO_RULE_OK and re.fullmatch(r"[a-zA-Z][\w-]*", c)
                     and f".{c}" not in css)
    if orphans:
        problems.append(f"classes used with no CSS rule: {orphans}")

    # A cross-page link may carry a fragment; the file is the part before the #.
    refs = {r.split("#")[0] for r in
            re.findall(r'(?:src|href)="((?!https?:|#|mailto|data:)[^"]+)"', markup)
            if "' +" not in r}
    missing = [r for r in sorted(refs) if r and not (BLOG / r).exists()]
    if missing:
        problems.append(f"missing local assets: {missing}")

    # Anchors and assets are markup concerns, so scan the markup only: the script
    # block contains href strings for the *other* page, which are not this page's
    # anchors and are not files.
    ids = set(re.findall(r'id="([^"]+)"', markup))
    for a in set(re.findall(r'href="#([^"]+)"', markup)):
        if a not in ids:
            problems.append(f"anchor #{a} has no target on this page")

    # every audio file named in a data blob must be on disk
    for m in re.finditer(r'<script id="[a-z-]+-data" type="application/json">(.*?)</script>', h, re.S):
        try:
            d = json.loads(m.group(1))
        except Exception:
            continue
        for f in re.findall(r'"(audio/[^"]+)"', json.dumps(d)):
            if not (BLOG / f).exists():
                problems.append(f"data references a missing clip: {f}")

    status = "OK " if not problems else "BAD"
    print(f"{status} {name:32s} {len(h.encode()):>9,d} bytes")
    for p in problems:
        print(f"      {p}")
        fail += 1

# ── dead CSS, checked once across both pages ────────────────────────────────
# post.css is shared, so a rule used by either page is live; only a rule that no
# page mentions at all is residue. This is the inverse of the per-page orphan-class
# check and it catches what replacing a widget leaves behind.
pages = [(BLOG / n).read_text(encoding="utf-8") for n in PAGES]
css = pages[0][pages[0].index("<style>"):pages[0].index("</style>")]
bodies = "".join(p[p.index("</style>"):] for p in pages)
declared = set(re.findall(r"\.([a-zA-Z][\w-]*)", css))
# Only our own namespaces; the inlined design pack declares far more than we use.
MINE = ("wave", "spec-", "norm", "ab-", "vs-", "clip", "arch", "param-", "fl-", "vb-",
        "sibling", "bud", "prompt-", "io-", "style-card", "judge-chip", "para-list",
        "lang-tab", "data-table", "table-scroll", "group-", "pending", "rm-", "map-",
        "hero-caption", "cite-", "ecosystem", "post-footer", "toc-", "reveal",
        "research-feature-grid", "vspace", "bar-", "axis-", "row-label")
dead = sorted(c for c in declared if c.startswith(MINE) and c not in bodies)
if dead:
    print(f"BAD (both pages)                  CSS rules no page uses: {dead}")
    fail += 1
else:
    print(f"OK  dead-CSS scan                 {len(declared)} rules declared, none orphaned")

sys.exit(1 if fail else 0)
