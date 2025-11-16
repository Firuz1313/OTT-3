import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createProxyMiddleware } from 'http-proxy-middleware';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  server: {
    port: 3000,
    open: false,
    middlewareMode: false,
    middleware: [
      createProxyMiddleware('/proxy', {
        target: 'http://localhost',
        changeOrigin: true,
        pathRewrite: {
          '^/proxy': ''
        },
        onProxyReq(proxyReq, req, res) {
          proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        },
        onProxyRes(proxyRes, req, res) {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS, POST, PUT';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Range, Authorization';
          proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range';
        }
      })
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
