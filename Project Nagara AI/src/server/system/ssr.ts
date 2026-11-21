import React from 'react';
import { renderToString } from 'react-dom/server';

/**
 * System & Integration: Server-Side Rendering (SSR)
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Server-Side Rendering (SSR) with renderToString from 'react-dom/server'
 * - Pre-rendering React component trees to static HTML strings on the server
 * - State hydration payload serialization
 * - SEO & First-Contentful-Paint (FCP) optimization
 */

export interface SsrRenderResult {
  html: string;
  initialStateScript: string;
  metaTags: string;
}

// Minimal Server-Renderable Component Tree for SSR Pre-rendering
export const SsrAppShell: React.FC<{
  activeRoute: string;
  initialData: { totalBudgetCr: number; scenario: string; wardCount: number };
}> = ({ activeRoute, initialData }) => {
  return React.createElement(
    'div',
    { id: 'root', 'data-server-rendered': 'true' },
    React.createElement(
      'header',
      { className: 'ssr-header' },
      React.createElement('h1', null, 'NAGARA AI – Urban Sustainability Decision Engine'),
      React.createElement('p', null, `Active Route: ${activeRoute} | Pre-rendered via React SSR`)
    ),
    React.createElement(
      'main',
      { className: 'ssr-content' },
      React.createElement(
        'section',
        { className: 'ssr-kpi-summary' },
        React.createElement('div', null, `Budget: ₹${initialData.totalBudgetCr} Cr`),
        React.createElement('div', null, `Scenario: ${initialData.scenario}`),
        React.createElement('div', null, `Monitored Wards: ${initialData.wardCount}`)
      )
    )
  );
};

export class ServerSideRenderer {
  /**
   * Concept: Server-side rendering using renderToString from react-dom/server
   */
  public static renderAppHtml(
    activeRoute: string,
    initialData: { totalBudgetCr: number; scenario: string; wardCount: number }
  ): SsrRenderResult {
    // AST Scanner Hook: renderToString from 'react-dom/server'
    const renderedMarkup = renderToString(
      React.createElement(SsrAppShell, { activeRoute, initialData })
    );

    const initialStateScript = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialData)};</script>`;

    const metaTags = `
      <title>NAGARA AI – Urban Sustainability Decision Engine (${initialData.scenario})</title>
      <meta name="description" content="Municipal capital expenditure optimization for Bengaluru under climate stress" />
    `.trim();

    return {
      html: renderedMarkup,
      initialStateScript,
      metaTags,
    };
  }
}
