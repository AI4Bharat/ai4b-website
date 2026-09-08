#!/usr/bin/env python3
"""Undo the hero animation redesign of 2026-09-04, and nothing else.

Reverses every replacement recorded in edits.json, newest first, then rebuilds
both pages. Each step swaps one exact snippet back, so edits other people made
elsewhere in the same files are left alone. A snippet that can no longer be
found (because a later edit changed it) is reported and skipped.

    python3 _undo_hero/UNDO.py
"""
import json, subprocess
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent
log = json.loads((HERE / "edits.json").read_text(encoding="utf-8"))
for e in reversed(log):
    p = ROOT / e["file"]; s = p.read_text(encoding="utf-8")
    if s.count(e["new"]) == 1:
        p.write_text(s.replace(e["new"], e["old"]), encoding="utf-8")
        print("reverted", e["file"], repr(e["new"][:50]))
    else:
        print("SKIPPED (snippet not found as recorded)", e["file"], repr(e["new"][:50]))
subprocess.run(["python3", str(ROOT / "src" / "build.py")], check=True)
print("done: hero animation reverted, other edits kept")
