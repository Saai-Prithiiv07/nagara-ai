/**
 * NAGARA AI - Server-Side Rendering (SSR) Node.js Server
 * Concept Demonstrated: Server-side rendering (System & Integration)
 * Renders React components on Node.js using react-dom/server renderToString()
 */
const express = require('express');
const path = require('path');
const React = require('react');
const { renderToString } = require('react-dom/server');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

app.get('*', (req, res) => {
  try {
    // Simple SSR fallback component demonstration
    const appHtml = renderToString(
      React.createElement('div', { id: 'app', className: 'ssr-container' },
        React.createElement('h1', null, 'NAGARA AI - Bengaluru Climate Digital Twin (SSR)'),
        React.createElement('p', null, 'Server-side rendered at ' + new Date().toISOString())
      )
    );

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NAGARA AI (Server-side rendering)</title>
  </head>
  <body class="bg-slate-900 text-white">
    <div id="root">${appHtml}</div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (err) {
    res.status(500).send('SSR error: ' + err.message);
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server-side rendering (SSR) server active on port ${PORT}`);
  });
}

module.exports = app;
