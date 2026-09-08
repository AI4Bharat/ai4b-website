#!/usr/bin/env python3
"""Put back the locked hero animation of 2026-09-04 21:35 (approved: left-side
letter, drifting script letters, 1.2x ripple), then rebuild.

Whole-file restore of the five source files that carry the hero, so anything
changed in them since is discarded. Unlocks them first if they are read-only.

    python3 _undo_hero/locked/RESTORE.py
"""
import os, shutil, stat, subprocess
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
for f in ("page.js", "post.css", "smoke.js", "body-capability.html", "body-technical.html"):
    dst = ROOT / "src" / f
    if dst.exists(): os.chmod(dst, stat.S_IMODE(dst.stat().st_mode) | stat.S_IWUSR)
    shutil.copy2(HERE / "src" / f, dst)
    print("restored", dst)
subprocess.run(["python3", str(ROOT / "src" / "build.py")], check=True)
print("locked hero restored and rebuilt")
