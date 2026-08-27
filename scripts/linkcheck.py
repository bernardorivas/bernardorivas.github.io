#!/usr/bin/env python3
"""Every internal href/src in out/ must resolve to a real exported file.

Unlike parity.py (which compares only content links), this walks *all* href/src
attributes across every exported page -- content links, `/_next/*` bundles,
preloads, stylesheets -- so a dangling asset or a broken clean-URL route is
caught. External (http/mailto/tel/data), protocol-relative and pure in-page
(`#...`) links are skipped. A clean URL like `/research` resolves through the
`.html` / `index.html` fallbacks, matching how a static host serves the export.
"""
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote

NEW = Path("out")


class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("href", "src") and v:
                self.links.append(v)


bad = []
for page in sorted(NEW.rglob("*.html")):
    p = Links()
    p.feed(page.read_text(encoding="utf-8"))
    for link in p.links:
        if link.startswith(("http:", "https:", "mailto:", "tel:", "data:", "#", "//")):
            continue
        path = unquote(link.split("#")[0].split("?")[0])
        if not path:
            continue
        t = NEW / path.lstrip("/")
        candidates = [t, Path(str(t) + ".html"), t / "index.html"]
        if not any(c.is_file() for c in candidates):
            bad.append(f"{page.relative_to(NEW)} -> {link}")

print("\n".join(bad) or "PASS")
sys.exit(1 if bad else 0)
