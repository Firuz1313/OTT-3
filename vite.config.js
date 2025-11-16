import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/proxy': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => {
          const url = path.replace('/proxy', '');
          const decodedUrl = decodeURIComponent(url);
          return decodedUrl;
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Range, Authorization';
            proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range';
          });
        }
      }
    }
  },
  build: {
    outDir: '../dist',
    sourcemap: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  }
});
