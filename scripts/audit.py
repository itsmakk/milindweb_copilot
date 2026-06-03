"""Manual Lighthouse-style audit. Runs the most important checks the CLI version
would catch, without needing Chrome. Reports per-page scores for
Performance, Accessibility, Best Practices, SEO.

Heuristic and code-review based — not a substitute for a real Lighthouse run.
Useful for offline audits and CI gates where Chrome isn't available.
"""
import json
import os
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get("MW_AUDIT_BASE", "http://localhost:8000")

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
    "404.html",
]


class PageAuditor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.imgs_total = 0
        self.imgs_no_alt = []
        self.inputs_no_label = []
        self.buttons_no_text = []
        self.headings_order = []
        self.h1_count = 0
        self.lang = None
        self.has_skip_link = False
        self.has_canonical = False
        self.has_description = False
        self.has_og = False
        self.has_twitter = False
        self.has_jsonld = False
        self.has_viewport = False
        self.has_theme_color = False
        self.has_manifest = False
        self.has_structured_nav = False
        self.has_main = False
        self.has_footer = False
        self._in_button = False
        self._button_buf = ""
        self._input_label_seen = set()

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "html":
            self.lang = d.get("lang")
        elif tag == "img":
            self.imgs_total += 1
            if "alt" not in d:
                self.imgs_no_alt.append(attrs)
        elif tag == "a":
            cls = d.get("class", "")
            if "skip-link" in cls:
                self.has_skip_link = True
        elif tag == "input":
            t = (d.get("type") or "").lower()
            if t not in ("submit", "button", "hidden", "image"):
                if "id" in d:
                    self._input_label_seen.add(d["id"])
                else:
                    self.inputs_no_label.append(attrs)
        elif tag == "label":
            if "for" in d:
                self._input_label_seen.add(d["for"])
        elif tag == "button":
            if not d.get("aria-label") and not d.get("aria-labelledby"):
                self._in_button = True
                self._button_buf = ""
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.headings_order.append(int(tag[1]))
            if tag == "h1":
                self.h1_count += 1
        elif tag == "link":
            rel = d.get("rel", "")
            if "canonical" in rel:
                self.has_canonical = True
            if "manifest" in rel:
                self.has_manifest = True
        elif tag == "meta":
            n = d.get("name", "")
            p = d.get("property", "")
            if n == "description":
                self.has_description = True
            if p.startswith("og:"):
                self.has_og = True
            if n.startswith("twitter:"):
                self.has_twitter = True
            if n == "viewport":
                self.has_viewport = True
            if n == "theme-color":
                self.has_theme_color = True
        elif tag == "script":
            if d.get("type") == "application/ld+json":
                self.has_jsonld = True
        elif tag == "nav":
            self.has_structured_nav = True
        elif tag == "main":
            self.has_main = True
        elif tag == "footer":
            self.has_footer = True

    def handle_endtag(self, tag):
        if tag == "button" and self._in_button:
            txt = self._button_buf.strip()
            if not txt:
                self.buttons_no_text.append(self._button_buf)
            self._in_button = False
            self._button_buf = ""

    def handle_data(self, data):
        if self._in_button:
            self._button_buf += data


def fetch(url):
    return urllib.request.urlopen(url, timeout=10).read().decode("utf-8", "ignore")


def audit(path):
    url = f"{BASE}/{path}"
    html = fetch(url)
    a = PageAuditor()
    a.feed(html)
    html_size = len(html.encode("utf-8"))

    scores = {}

    # SEO
    seo = 0
    if a.lang: seo += 15
    if a.has_viewport: seo += 15
    if a.has_canonical: seo += 15
    if a.has_description: seo += 20
    if a.has_og: seo += 15
    if a.has_twitter: seo += 10
    if a.h1_count == 1: seo += 10
    scores["seo"] = min(seo, 100)

    # Accessibility
    a11y = 100
    if not a.lang: a11y -= 20
    if a.h1_count == 0: a11y -= 25
    if a.h1_count > 1: a11y -= 10
    if not a.has_skip_link: a11y -= 10
    if a.imgs_no_alt: a11y -= 15
    if a.inputs_no_label: a11y -= 15
    if a.buttons_no_text: a11y -= 15
    if a.headings_order and a.headings_order[0] != 1: a11y -= 5
    if not a.has_main: a11y -= 5
    scores["accessibility"] = max(a11y, 0)

    # Best practices
    bp = 100
    if not a.has_manifest: bp -= 5
    if not a.has_theme_color: bp -= 5
    # External requests: each <link> to CDN adds slight overhead, not penalizing here
    if not a.has_structured_nav: bp -= 5
    scores["best-practices"] = max(bp, 0)

    # Performance (heuristic)
    perf = 100
    if html_size > 30_000: perf -= 10
    if html_size > 50_000: perf -= 10
    # defer on scripts is enforced via template; we trust it
    # font awesome CDN is the biggest hit; we preconnect
    scores["performance"] = max(perf, 0)

    overall = (scores["performance"] * 0.25 +
               scores["accessibility"] * 0.30 +
               scores["best-practices"] * 0.20 +
               scores["seo"] * 0.25)

    return {
        "page": path,
        "size_kb": round(html_size / 1024, 1),
        "scores": scores,
        "overall": round(overall, 1),
        "issues": {
            "h1_count": a.h1_count,
            "imgs_no_alt": len(a.imgs_no_alt),
            "inputs_no_label": len(a.inputs_no_label),
            "buttons_no_text": len(a.buttons_no_text),
            "lang": a.lang,
            "has_skip_link": a.has_skip_link,
            "has_manifest": a.has_manifest,
            "has_structured_nav": a.has_structured_nav,
        },
    }


def main():
    out = []
    for p in PAGES:
        try:
            out.append(audit(p))
        except Exception as e:
            out.append({"page": p, "error": str(e)})
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
