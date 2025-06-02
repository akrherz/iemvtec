import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig(({ command }) => ({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        vtec: resolve(__dirname, 'src/content.js') // Production entry point
      }
    },
    manifest: 'assets.json' // Generate manifest as assets.json for Python
  },
  server: {
    port: 3000,
    proxy: {
      '/vtec': {
        target: 'http://localhost:8080',
        bypass: (req) => {
          const url = req?.url;
          if (!url) return undefined;
          
          // Serve JavaScript modules, CSS, and other assets directly from src
          if (/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/.test(url)) {
            const cleanUrl = url.replace('/vtec/', '/').split('?')[0];
            return cleanUrl;
          }
          
          if (url === '/vtec/_index_content.html') {
            return '/_index_content.html';
          }
          return undefined;
        }
      }
    }
  },
  plugins: [
    {
      name: 'serve-content-template',
      configureServer(server) {
        server.middlewares.use('/_index_content.html', (req, res, next) => {
          const filePath = resolve(__dirname, 'src/_index_content.html');
          try {
            const data = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
          } catch (err) {
            res.statusCode = 404;
            res.end('Content template not found');
          }
        });
      }
    }
  ]
}));
