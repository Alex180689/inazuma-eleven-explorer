import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-sprites',
      buildStart() {
        const syncSprites = () => {
          try {
            const spritesDir = path.resolve(__dirname, 'sprites');
            const publicSpritesDir = path.resolve(__dirname, 'public', 'sprites');
            const registryFile = path.resolve(__dirname, 'src', 'data', 'spriteRegistry.json');
            if (!fs.existsSync(spritesDir)) return;
            if (!fs.existsSync(publicSpritesDir)) fs.mkdirSync(publicSpritesDir, { recursive: true });

            const files = fs.readdirSync(spritesDir).filter(f => f.toLowerCase().endsWith('.webp'));
            const spriteNames = [];

            for (const f of files) {
              const lowerName = f.toLowerCase();
              spriteNames.push(lowerName.replace(/\.webp$/i, ''));

              const src = path.resolve(spritesDir, f);
              const dst = path.resolve(publicSpritesDir, lowerName);
              if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
                fs.copyFileSync(src, dst);
              }
              if (f !== lowerName) {
                const dstOrig = path.resolve(publicSpritesDir, f);
                if (!fs.existsSync(dstOrig) || fs.statSync(src).mtimeMs > fs.statSync(dstOrig).mtimeMs) {
                  fs.copyFileSync(src, dstOrig);
                }
              }
            }

            fs.writeFileSync(registryFile, JSON.stringify(Array.from(new Set(spriteNames)).sort(), null, 2));
          } catch (e) {
            console.error('Error syncing sprites:', e);
          }
        };
        syncSprites();
      },
      configureServer(server) {
        const syncSprites = () => {
          try {
            const spritesDir = path.resolve(__dirname, 'sprites');
            const publicSpritesDir = path.resolve(__dirname, 'public', 'sprites');
            const registryFile = path.resolve(__dirname, 'src', 'data', 'spriteRegistry.json');
            if (!fs.existsSync(spritesDir)) return;
            if (!fs.existsSync(publicSpritesDir)) fs.mkdirSync(publicSpritesDir, { recursive: true });

            const files = fs.readdirSync(spritesDir).filter(f => f.toLowerCase().endsWith('.webp'));
            const spriteNames = [];

            for (const f of files) {
              const lowerName = f.toLowerCase();
              spriteNames.push(lowerName.replace(/\.webp$/i, ''));

              const src = path.resolve(spritesDir, f);
              const dst = path.resolve(publicSpritesDir, lowerName);
              if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
                fs.copyFileSync(src, dst);
              }
              if (f !== lowerName) {
                const dstOrig = path.resolve(publicSpritesDir, f);
                if (!fs.existsSync(dstOrig) || fs.statSync(src).mtimeMs > fs.statSync(dstOrig).mtimeMs) {
                  fs.copyFileSync(src, dstOrig);
                }
              }
            }

            fs.writeFileSync(registryFile, JSON.stringify(Array.from(new Set(spriteNames)).sort(), null, 2));
          } catch (e) {
            console.error('Error syncing sprites:', e);
          }
        };

        syncSprites();

        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/sprites/')) {
            const rawName = req.url.replace('/sprites/', '').split('?')[0];
            const fileName = decodeURIComponent(rawName);
            const candidates = [
              fileName,
              fileName.toLowerCase(),
              fileName.replace(/[']/g, ''),
              fileName.toLowerCase().replace(/[']/g, ''),
            ];
            if (fileName.includes('_')) {
              const surnameOnly = fileName.split('_').pop();
              candidates.push(
                surnameOnly,
                surnameOnly.toLowerCase(),
                surnameOnly.replace(/[']/g, ''),
                surnameOnly.toLowerCase().replace(/[']/g, '')
              );
            }

            const searchDirs = [
              path.resolve(__dirname, 'sprites'),
              path.resolve(__dirname, 'public', 'sprites'),
            ];

            for (const dir of searchDirs) {
              for (const name of candidates) {
                const filePath = path.resolve(dir, name);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                  res.setHeader('Content-Type', 'image/webp');
                  return fs.createReadStream(filePath).pipe(res);
                }
              }
            }
          }
          next();
        });
      }
    },
    {
      name: 'serve-videos',
      buildStart() {
        const syncVideos = () => {
          try {
            const videosDir = path.resolve(__dirname, 'videos');
            const publicVideosDir = path.resolve(__dirname, 'public', 'videos');
            const registryFile = path.resolve(__dirname, 'src', 'data', 'videoRegistry.json');
            if (!fs.existsSync(videosDir)) return;
            if (!fs.existsSync(publicVideosDir)) fs.mkdirSync(publicVideosDir, { recursive: true });

            const files = fs.readdirSync(videosDir).filter(f => /\.(mp4|webm|gif)$/i.test(f));
            for (const f of files) {
              const src = path.resolve(videosDir, f);
              const dst = path.resolve(publicVideosDir, f);
              if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
                fs.copyFileSync(src, dst);
              }
            }
            // Remove deleted files
            const publicFiles = fs.readdirSync(publicVideosDir);
            for (const pf of publicFiles) {
              if (!files.includes(pf)) {
                try { fs.unlinkSync(path.resolve(publicVideosDir, pf)); } catch (e) {}
              }
            }
            fs.writeFileSync(registryFile, JSON.stringify(files, null, 2));
          } catch (e) {
            console.error('Error syncing videos:', e);
          }
        };
        syncVideos();
      },
      configureServer(server) {
        const syncVideos = () => {
          try {
            const videosDir = path.resolve(__dirname, 'videos');
            const publicVideosDir = path.resolve(__dirname, 'public', 'videos');
            const registryFile = path.resolve(__dirname, 'src', 'data', 'videoRegistry.json');
            if (!fs.existsSync(videosDir)) return;
            if (!fs.existsSync(publicVideosDir)) fs.mkdirSync(publicVideosDir, { recursive: true });

            const files = fs.readdirSync(videosDir).filter(f => /\.(mp4|webm|gif)$/i.test(f));
            for (const f of files) {
              const src = path.resolve(videosDir, f);
              const dst = path.resolve(publicVideosDir, f);
              if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
                fs.copyFileSync(src, dst);
              }
            }
            const publicFiles = fs.readdirSync(publicVideosDir);
            for (const pf of publicFiles) {
              if (!files.includes(pf)) {
                try { fs.unlinkSync(path.resolve(publicVideosDir, pf)); } catch (e) {}
              }
            }
            fs.writeFileSync(registryFile, JSON.stringify(files, null, 2));
          } catch (e) {
            console.error('Error syncing videos:', e);
          }
        };

        syncVideos();

        // Automatically watch the videos directory for any new, modified or removed recordings
        const videosDir = path.resolve(__dirname, 'videos');
        server.watcher.add(videosDir);
        server.watcher.on('all', (event, file) => {
          if (file && file.replace(/\\/g, '/').includes('/videos/')) {
            syncVideos();
          }
        });

        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/videos/')) {
            const rawName = req.url.replace('/videos/', '').split('?')[0];
            const fileName = decodeURIComponent(rawName);
            const filePath = path.resolve(__dirname, 'videos', fileName);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeTypes = {
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.gif': 'image/gif',
              };
              const stat = fs.statSync(filePath);
              const range = req.headers.range;

              if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
                const chunksize = end - start + 1;
                const file = fs.createReadStream(filePath, { start, end });
                res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': chunksize,
                  'Content-Type': mimeTypes[ext] || 'video/mp4',
                });
                return file.pipe(res);
              } else {
                res.writeHead(200, {
                  'Content-Length': stat.size,
                  'Content-Type': mimeTypes[ext] || 'video/mp4',
                });
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
    port: 3000,
    open: false,
    allowedHosts: true,
  }
})
