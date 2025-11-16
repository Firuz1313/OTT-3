import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createServer as createViteServer } from 'vite';
import https from 'https';
import http from 'http';

const corsProxyPlugin = () => {
  return {
    name: 'cors-proxy',
    apply: 'serve',
    configureServer(server) {
      return () => {
        server.middlewares.use('/proxy/', async (req, res, next) => {
          try {
            const targetUrl = decodeURIComponent(req.url.substring(7));
            const urlObj = new URL(targetUrl);
            const protocol = urlObj.protocol === 'https:' ? https : http;

            const options = {
              hostname: urlObj.hostname,
              port: urlObj.port,
              path: urlObj.pathname + urlObj.search,
              method: req.method,
              headers: {
                ...req.headers,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'host': urlObj.host
              }
            };

            delete options.headers['origin'];
            delete options.headers['referer'];

            const proxyReq = protocol.request(options, (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 200, {
                ...proxyRes.headers,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST, PUT',
                'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
                'Access-Control-Expose-Headers': 'Content-Length, Content-Range'
              });
              proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
              console.error('Proxy error:', err);
              res.writeHead(502);
              res.end('Bad Gateway');
            });

            if (req.method === 'POST' || req.method === 'PUT') {
              req.pipe(proxyReq);
            } else {
              proxyReq.end();
            }
          } catch (err) {
            console.error('Proxy error:', err);
            res.writeHead(400);
            res.end('Bad Request');
          }
        });
      };
    }
  };
};

export default defineConfig({
  plugins: [react(), corsProxyPlugin()],
  root: 'src',
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: '../dist',
    sourcemap: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  }
});
