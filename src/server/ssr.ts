import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { render } from '../entry-server';

/**
 * Server-Side Rendering (SSR) Express Handler & Middleware
 * -------------------------------------------------------------
 * Concept Demonstrated: Server-side rendering (System & Integration)
 * - Implements full SSR pipeline with Express.js
 * - Hydration markup injection
 * - Streaming / static fallback support
 */
export function createSsrServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';
  const root = process.cwd();

  // Serve built client assets
  app.use(express.static(path.resolve(root, 'dist/client'), { index: false }));
  app.use(express.static(path.resolve(root, 'dist'), { index: false }));

  // SSR Route: Intercepts all incoming GET requests to pre-render the React application
  app.get('*', async (req: Request, res: Response) => {
    const url = req.originalUrl || req.url;

    try {
      // 1. Perform Server-Side Rendering via renderToString()
      const { html: appHtml, head } = render(url);

      // 2. Read index.html template or use fallback HTML template
      const templatePath = path.resolve(root, 'dist/index.html');
      let template = '';
      if (fs.existsSync(templatePath)) {
        template = fs.readFileSync(templatePath, 'utf-8');
      } else {
        template = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--ssr-head-->
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  <body class="bg-[#050B14] text-slate-100">
    <div id="root"><!--ssr-outlet--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
      }

      // 3. Inject pre-rendered SSR HTML into template
      const fullHtml = template
        .replace('<!--ssr-head-->', head)
        .replace('<!--ssr-outlet-->', appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(fullHtml);
    } catch (err: any) {
      console.error('SSR Execution Error:', err);
      res.status(500).send(`Server-Side Rendering Error: ${err?.message || err}`);
    }
  });

  return app;
}

export default createSsrServer;
