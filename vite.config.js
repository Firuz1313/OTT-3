import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';
import http from 'http';
import url from 'url';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  server: {
    port: 3000,
    open: false,
    middlewares: [
      {
        apply: 'pre',
        use(req, res, next) {
          // CORS proxy for video streams and manifests
          if (req.url.startsWith('/proxy/')) {
            const targetUrl = req.url.replace('/proxy/', '');
            const decodedUrl = decodeURIComponent(targetUrl);

            const parsedUrl = new url.URL(decodedUrl);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;

            const options = {
              hostname: parsedUrl.hostname,
              port: parsedUrl.port,
              path: parsedUrl.pathname + parsedUrl.search,
              method: req.method,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            };

            const proxyReq = protocol.request(options, (proxyRes) => {
              res.writeHead(proxyRes.statusCode, {
                ...proxyRes.headers,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': 'Range, Content-Type'
              });
              proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
              console.error('Proxy error:', err);
              res.writeHead(502);
              res.end('Bad Gateway');
            });

            if (req.method !== 'GET' && req.method !== 'HEAD') {
              req.pipe(proxyReq);
            } else {
              proxyReq.end();
            }
          } else {
            next();
          }
        }
      }
    ]
  },
  build: {
    outDir: '../dist',
    sourcemap: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  }
});
