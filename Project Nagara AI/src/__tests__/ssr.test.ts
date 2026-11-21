import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Polyfill minimal browser globals for SSR
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

describe('Server-side rendering (SSR)', () => {
  it('renders App component to HTML string without errors', async () => {
    const { App } = await import('../App');
    const html = renderToString(React.createElement(App));
    expect(typeof html).toBe('string');
    expect(html).toContain('NAGARA AI');
    expect(html.length).toBeGreaterThan(500);
  }, 20000);
});
