#!/usr/bin/env python3
"""Apply one exact-string replacement to a source file and record it in
edits.json, so UNDO.py can reverse every edit in order. Used by the hero
animation redesign of 2026-09-04; not part of the build.

    python3 _undo_hero/edit.py <file> <old-snippet-file> <new-snippet-file>
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).parent
LOG = HERE / "edits.json"

def apply(path, old, new):
    p = Path(path); s = p.read_text(encoding="utf-8")
    if s.count(old) != 1:
        raise SystemExit(f"{path}: expected exactly one match, found {s.count(old)}")
    p.write_text(s.replace(old, new), encoding="utf-8")
    log = json.loads(LOG.read_text()) if LOG.exists() else []
    log.append({"file": str(p.resolve().relative_to(HERE.parent.resolve())), "old": old, "new": new})
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")

if __name__ == "__main__":
    f, o, n = sys.argv[1:4]
    apply(f, Path(o).read_text(encoding="utf-8"), Path(n).read_text(encoding="utf-8"))
    print("applied and recorded:", f)
