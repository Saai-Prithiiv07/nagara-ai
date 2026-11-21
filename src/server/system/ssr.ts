/**
 * System & Integration: Server-Side Rendering (SSR)
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Server-Side Rendering (SSR) vs Client-Side Rendering (CSR)
 * - Initial HTML rendering for SEO & first-contentful-paint (FCP) optimization
 * - State hydration payload serialization
 */

export interface SsrRenderResult {
  html: string;
  initialStateScript: string;
  metaTags: string;
}

export class ServerSideRenderer {
  public static renderAppHtml(
    activeRoute: string,
    initialData: { totalBudgetCr: number; scenario: string; wardCount: number }
  ): SsrRenderResult {
    // Generate initial server-rendered HTML shell
    const html = `
      <div id="root" data-server-rendered="true">
        <header class="ssr-header">
          <h1>NAGARA AI – Urban Sustainability Decision Engine</h1>
          <p>Active Route: ${activeRoute} | Pre-rendered on Node.js Server</p>
        </header>
        <main class="ssr-content">
          <section class="ssr-kpi-summary">
            <div>Budget: ₹${initialData.totalBudgetCr} Cr</div>
            <div>Scenario: ${initialData.scenario}</div>
            <div>Monitored Wards: ${initialData.wardCount}</div>
          </section>
        </main>
      </div>
    `.trim();

    // Hydration script injecting initial state onto window object
    const initialStateScript = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialData)};</script>`;

    const metaTags = `
      <title>NAGARA AI – Urban Sustainability Decision Engine (${initialData.scenario})</title>
      <meta name="description" content="Municipal capital expenditure optimization for Bengaluru under climate stress" />
    `.trim();

    return { html, initialStateScript, metaTags };
  }
}
