import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig(({ command }) => ({
  root: 'src',
  base: command === 'serve' ? '/' : '/vtec/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        vtec: resolve(__dirname, 'src/content.js')
      }
    },
    manifest: 'assets.json'
  },
  server: {
    port: 3000,
    host: true
  },
  plugins: [
    {
      name: 'serve-content-template',
      configureServer(server) {
        server.middlewares.use('/_index_content.html', (req, res, next) => {
          const filePath = resolve(__dirname, 'src/_index_content.html');
          try {
            const data = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(data);
          } catch (err) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Content template not found');
          }
        });
      }
    }
  ]
}));
