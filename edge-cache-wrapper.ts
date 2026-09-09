import app from './cms-auth-wrapper';

const PUBLIC_API_PREFIXES = ['/api/contents'];

type EdgeCacheStorage = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

function isPublicCacheable(request: Request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return false;
  if (!PUBLIC_API_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return false;
  // Never share-cache requests carrying authentication/session state.
  if (request.headers.has('Authorization') || request.headers.has('Cookie')) return false;
  return true;
}

function cacheKey(request: Request) {
  const url = new URL(request.url);
  // Public content is independent of Origin; keep one cache object per URL/query.
  return new Request(url.toString(), { method: 'GET' });
}

function withEdgeCacheHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=86400, stale-while-revalidate=604800');
  headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  headers.set('CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    if (!isPublicCacheable(request)) return app.fetch(request, env, ctx);

    const key = cacheKey(request);
    const cache = (caches as unknown as { default: EdgeCacheStorage }).default;
    const hit = await cache.match(key);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set('X-Bhakti-Cache', 'HIT');
      return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers });
    }

    const response = await app.fetch(request, env, ctx);
    if (response.ok) {
      const cached = withEdgeCacheHeaders(response);
      ctx.waitUntil(cache.put(key, cached.clone()));
      const headers = new Headers(cached.headers);
      headers.set('X-Bhakti-Cache', 'MISS');
      return new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers });
    }
    return response;
  },
};
