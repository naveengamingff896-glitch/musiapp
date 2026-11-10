"""Minimal static file server for the Mana Music PWA production build.

Serves the Vite `dist/` output on 0.0.0.0:$PORT with correct content types for
the web app manifest, MP3 demo audio and service worker, and falls back to the
app shell for client-side (hash) routes.
"""

import os
import posixpath
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT", "3000"))
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".json": "application/json",
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".mp3": "audio/mpeg",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".woff2": "font/woff2",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        clean = self.path.split("?")[0]
        if clean.endswith(("sw.js", "index.html", "/")) or clean == "":
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "public, max-age=3600")
        super().end_headers()

    def do_GET(self):
        target = self.translate_path(self.path)
        clean = self.path.split("?")[0]
        # Only navigation requests fall back to the shell; missing assets stay 404.
        if not os.path.exists(target) and "." not in posixpath.basename(clean):
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
