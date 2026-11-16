import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { createApiApp } from './src/server/api';

const app = createApiApp();
const isProduction = process.env.NODE_ENV === 'production';
const root = path.dirname(fileURLToPath(import.meta.url));

if (isProduction) {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist));
  app.get('*', (_request, response) => response.sendFile(path.join(dist, 'index.html')));
} else {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Interview app listening on http://localhost:${port}`);
});
