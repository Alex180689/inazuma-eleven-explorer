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
      configureServer(server) {
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
              path.resolve(__dirname, 'wiki_scraper', 'sprites')
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
    }
  ],
  server: {
    port: 3000,
    open: false,
    allowedHosts: true,
  }
})
