#!/usr/bin/env python3

import re
from pathlib import Path
import shutil

SRC_DIR = Path("Documentation")
OUT_DIR = Path("Documentation_clean")

# Remove only: [.hl-yellow]#text#  or  [.hl-green]#text#
HIGHLIGHT_REMOVE_RE = re.compile(
    r'\[\.hl-(?:yellow|green)]#(.*?)#',
    re.DOTALL,
)

def clean_text(text: str) -> str:
    # ONLY remove yellow/green highlight roles, keep inner content untouched
    return HIGHLIGHT_REMOVE_RE.sub(r'\1', text)

def main():
    # Recreate clean folder
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    # Copy everything, only modify .adoc files
    for path in SRC_DIR.rglob("*"):
        rel = path.relative_to(SRC_DIR)
        out_path = OUT_DIR / rel

        if path.is_dir():
            out_path.mkdir(parents=True, exist_ok=True)
            continue

        if path.suffix == ".adoc":
            content = path.read_text(encoding="utf-8")
            cleaned = clean_text(content)
            out_path.write_text(cleaned, encoding="utf-8")
        else:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, out_path)

if __name__ == "__main__":
    main()