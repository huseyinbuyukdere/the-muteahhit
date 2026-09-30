# Geliştirme sunucusu: tarayıcı önbelleğini kapatır, böylece değişiklikler hemen görünür.
import http.server, sys

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

http.server.ThreadingHTTPServer(("", int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
