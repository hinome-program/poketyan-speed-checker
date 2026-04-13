#!/usr/bin/env python3
"""UTF-8対応ローカル開発サーバー"""
import http.server
import socketserver

PORT = 8000

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    """Content-Type に charset=utf-8 を強制付与するハンドラ"""
    
    extensions_map = {
        '.html': 'text/html; charset=utf-8',
        '.css':  'text/css; charset=utf-8',
        '.js':   'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png':  'image/png',
        '.jpg':  'image/jpeg',
        '.svg':  'image/svg+xml; charset=utf-8',
        '':      'application/octet-stream',
    }

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), UTF8Handler) as httpd:
        print(f"UTF-8サーバー起動: http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nサーバーを停止しました")
