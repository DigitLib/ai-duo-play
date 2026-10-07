import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const currentDir = import.meta.dirname || path.resolve();

export default defineConfig({
  root: '.',
  base: './',
  publicDir: false,
  plugins: [
    {
      name: 'serve-root-static',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url ? req.url.split('?')[0] : '';
          for (const prefix of ['/audio/', '/models/', '/images/']) {
            if (rawUrl.startsWith(prefix)) {
              const filePath = path.join(currentDir, rawUrl);
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes = {
                  '.mp3': 'audio/mpeg',
                  '.onnx': 'application/octet-stream',
                  '.png': 'image/png',
                  '.svg': 'image/svg+xml'
                };
                if (mimeTypes[ext]) {
                  res.setHeader('Content-Type', mimeTypes[ext]);
                }
                return fs.createReadStream(filePath).pipe(res);
              }
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: '127.0.0.1'
  },
  resolve: {
    alias: {
      'src': path.resolve(currentDir, './src'),
      'keyboard': path.resolve(currentDir, './src/keyboard'),
      'sound': path.resolve(currentDir, './src/sound'),
      'ai': path.resolve(currentDir, './src/ai'),
      'interface': path.resolve(currentDir, './src/interface'),
      'roll': path.resolve(currentDir, './src/roll'),
      'style': path.resolve(currentDir, './style'),
      'third_party': path.resolve(currentDir, './third_party')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
