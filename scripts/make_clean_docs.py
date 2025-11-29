#!/usr/bin/env python3
import re
from pathlib import Path
import shutil

SRC_DIR = Path("Documentation")
OUT_DIR = Path("Documentation_clean")

# Remove red text completely
HIGHLIGHT_DELETE_RE = re.compile(
    r'\[\.hl-red]#(.*?)#',
    re.DOTALL,
)

# Keep the content of green / yellow (and possible red-legend) but drop the role
HIGHLIGHT_KEEP_RE = re.compile(
    r'\[\.hl-(?:green|yellow|red-legend)]#(.*?)#',
    re.DOTALL,
)

# Remove the highlight legend block (the "Legend" heading + 3 colored lines)
LEGEND_RE = re.compile(
    r'^Legend\n(?:\s*\[\.hl-[^]]+]#.*?#\s*\n){1,10}',
    re.MULTILINE,
)

# Lines that are ONLY dashes (or multiple dashes) – remove entirely
ONLY_DASH_LINE_RE = re.compile(
    r'^\s*-+\s*$\n?',
    re.MULTILINE,
)

# Lines that start with "- - - ..." → collapse to a single "- "
MULTI_DASH_BULLET_RE = re.compile(
    r'^(\s*)- (?:- )+',
    re.MULTILINE,
)


def clean_text(text: str) -> str:
    # 1) Drop red-marked content entirely
    text = HIGHLIGHT_DELETE_RE.sub('', text)

    # 2) Strip highlight roles but keep their content
    text = HIGHLIGHT_KEEP_RE.sub(r'\1', text)

    # 3) Remove the legend block
    text = LEGEND_RE.sub('', text)

    # 4) Fix bullet artifacts left by deleted highlights
    text = MULTI_DASH_BULLET_RE.sub(r'\1- ', text)
    text = ONLY_DASH_LINE_RE.sub('', text)

    # 5) Optional: collapse huge blank blocks
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text


def main():
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    for src in SRC_DIR.rglob("*.adoc"):
        rel = src.relative_to(SRC_DIR)
        dest = OUT_DIR / rel
        dest.parent.mkdir(parents=True, exist_ok=True)

        original = src.read_text(encoding="utf-8")
        cleaned = clean_text(original)
        dest.write_text(cleaned, encoding="utf-8")


if __name__ == "__main__":
    main()