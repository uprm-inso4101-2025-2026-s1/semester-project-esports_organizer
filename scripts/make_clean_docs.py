#!/usr/bin/env python3
import re
from pathlib import Path
import shutil

# Where your current docs live
SRC_DIR = Path("Documentation")
# Where we'll put the cleaned copy
OUT_DIR = Path("Documentation_clean")

# Inline patterns, e.g.:
# [.hl-yellow]#Some text# → Some text
# [.hl-red]#Old text# → '' (delete)
HIGHLIGHT_KEEP_RE = re.compile(
    r'\[\.(hl-yellow|hl-green|hl-red-legend)]#(.*?)#'
)
HIGHLIGHT_DELETE_RE = re.compile(
    r'\[\.hl-red]#(.*?)#'
)

def clean_text(text: str) -> str:
    # 1) Remove red/deleted text completely
    text = HIGHLIGHT_DELETE_RE.sub('', text)
    # 2) Strip highlight roles but keep the content
    text = HIGHLIGHT_KEEP_RE.sub(r'\2', text)
    return text

def main():
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    for path in SRC_DIR.rglob("*"):
        rel = path.relative_to(SRC_DIR)
        out_path = OUT_DIR / rel

        if path.is_dir():
            out_path.mkdir(parents=True, exist_ok=True)
            continue

        # Only transform .adoc files; copy everything else as-is
        if path.suffix == ".adoc":
            content = path.read_text(encoding="utf-8")
            cleaned = clean_text(content)
            out_path.write_text(cleaned, encoding="utf-8")
        else:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, out_path)

if __name__ == "__main__":
    main()