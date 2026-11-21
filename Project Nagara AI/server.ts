import express, { Request, Response } from 'express';
import { createSsrServer } from './src/server/ssr';

/**
 * NAGARA AI - Server-Side Rendering (SSR) Server Entry
 * -------------------------------------------------------------
 * Concept Demonstrated: Server-side rendering (System & Integration)
 * Renders React components on Node.js using react-dom/server renderToString()
 */
const PORT = process.env.PORT || 3000;
const app = createSsrServer();

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SSR] Server-Side Rendering Server running on http://localhost:${PORT}`);
  });
}

export { app };
export default app;
