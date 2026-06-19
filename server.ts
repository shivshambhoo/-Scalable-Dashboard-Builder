// /**
//  * @license
//  * SPDX-License-Identifier: Apache-2.0
//  */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import widgetRouter from './server/routes/widgetRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON payloads
  app.use(express.json());

  // Mount clean REST backend endpoints
  app.use('/api', widgetRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Hot module replacement or static rendering based on execution mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('Spawning Vite middleware for full-stack interactive development...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite Dev Server's middlewares as Express router middlewares
    app.use(vite.middlewares);
  } else {
    console.log('Serving production-ready precompiled static layers...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`===================================================`);
    console.log(`Server launched successfully at localhost${PORT}`);
    console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===================================================`);
  });
}

startServer().catch((error) => {
  console.error('Fatal: Failed to bootstrap Express + Vite server:', error);
  process.exit(1);
});
