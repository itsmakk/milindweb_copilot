"""Inject favicon set + webmanifest link into all public HTML pages.

Inserts the following block right after the inline SVG <link rel="icon"> line
(only if it isn't already present):

    <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="img/favicon-180x180.png">
    <link rel="manifest" href="site.webmanifest">
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGES = [
    "index.html",
    "freelance_seo_consultant.html",
    "graphics.html",
    "website-tech-solutions.html",
    "project.html",
    "workshop.html",
    "photography.html",
    "electrical.html",
    "automotive.html",
    "automation.html",
    "contact.html",
    "calendar.html",
    "links.html",
]

INJECT = (
    '  <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png">\n'
    '  <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png">\n'
    '  <link rel="apple-touch-icon" sizes="180x180" href="img/favicon-180x180.png">\n'
    '  <link rel="manifest" href="site.webmanifest">'
)

# Match the inline SVG favicon line (closing />, possibly with or without space)
SVG_RE = re.compile(
    r"(\s*<link\s+rel=\"icon\"\s+type=\"image/svg\+xml\"[^>]*?/?>)",
    re.IGNORECASE,
)

def patch(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "site.webmanifest" in text:
        print(f"  skip  {path.name}  (already patched)")
        return False
    m = SVG_RE.search(text)
    if not m:
        print(f"  skip  {path.name}  (no inline SVG favicon found)")
        return False
    end = m.end()
    new_text = text[:end] + "\n" + INJECT + text[end:]
    path.write_text(new_text, encoding="utf-8")
    print(f"  ok    {path.name}")
    return True

def main():
    count = 0
    for name in PAGES:
        p = ROOT / name
        if not p.exists():
            print(f"  miss  {name}", file=sys.stderr)
            continue
        if patch(p):
            count += 1
    print(f"Patched {count} file(s).")

if __name__ == "__main__":
    main()
