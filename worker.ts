export interface Env {
  DB: any;
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env, _ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Optional safe verification endpoint for runtime D1 binding check
    if (url.pathname === '/api/d1-ping') {
      try {
        if (!env.DB) {
          return new Response(JSON.stringify({ ok: false, error: 'DB binding not found' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ ok: true, d1: 'connected' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err?.message || 'Error pinging D1' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Serve static assets and SPA fallback from ./dist
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Bhakti Sathi Worker Active', { status: 200 });
  },
};
