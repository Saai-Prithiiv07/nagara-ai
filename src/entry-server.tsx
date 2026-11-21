import React from 'react';
import { renderToString, renderToPipeableStream } from 'react-dom/server';
import { App } from './App';

/**
 * Server-Side Rendering (SSR) Entry Point
 * -------------------------------------------------------------
 * Concept Demonstrated: Server-side rendering (System & Integration)
 * - Renders the React application component tree into an HTML string on the server.
 * - Supports pre-rendering initial state, SEO metadata, and client-side hydration.
 */

// Polyfill minimal browser globals for SSR runtime
if (typeof window === 'undefined') {
  const noop = () => {};
  (global as any).window = {
    navigator: globalThis.navigator || { userAgent: 'node.js' },
    addEventListener: noop,
    removeEventListener: noop,
    location: { hash: '#/overview' },
    localStorage: {
      getItem: () => null,
      setItem: noop,
      removeItem: noop,
    },
  };
  (global as any).document = {
    documentElement: { style: {} },
    createElement: () => ({ style: {} }),
  };
}

export interface RenderResult {
  html: string;
  head: string;
  statusCode?: number;
}

/**
 * Executes Server-Side Rendering (SSR) for the application.
 * @param url The requested URL path
 * @returns Object containing the rendered HTML string and meta tags
 */
export function render(url: string = '/'): RenderResult {
  const html = renderToString(React.createElement(App));
  
  const head = `
    <title>NAGARA AI - Bengaluru Climate Digital Twin (SSR)</title>
    <meta name="description" content="AI-native climate resilience and urban planning digital twin for Bengaluru" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  `;

  return { html, head, statusCode: 200 };
}

export { renderToString, renderToPipeableStream };
export default render;
