/**
 * Cloudflare Worker — reverse proxy for mk9.in/api/*
 *
 * Forwards any request whose path starts with `/api/` to the Render-hosted
 * NestJS API. Everything else falls through to Cloudflare Pages (the
 * static site). Bind routes in the Cloudflare dashboard:
 *
 *   mk9.in/api/*        → milindweb-api-proxy
 *   www.mk9.in/api/*    → milindweb-api-proxy
 *
 * The upstream host is set via the `UPSTREAM` env var (configured in
 * `wrangler.toml`). For local dev: `wrangler dev` defaults to
 * `http://localhost:3000`.
 */
export interface Env {
  UPSTREAM: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const upstream = env.UPSTREAM.replace(/\/$/, '');
      const target = upstream + url.pathname + url.search;

      // Forward the original request, including method, headers, and body.
      const init: RequestInit = {
        method: request.method,
        headers: request.headers,
        body: request.body,
        // Keep redirects manual so we can rewrite Location headers if needed.
        redirect: 'manual',
      };
      try {
        const upstreamRes = await fetch(target, init);

        // Pass-through response, but rewrite Location if Render returned a
        // redirect pointing at the internal onrender.com host.
        const location = upstreamRes.headers.get('Location');
        if (location && location.includes('onrender.com')) {
          const newLoc = location.replace(/https?:\/\/[^/]+/, url.origin);
          const headers = new Headers(upstreamRes.headers);
          headers.set('Location', newLoc);
          return new Response(upstreamRes.body, {
            status: upstreamRes.status,
            statusText: upstreamRes.statusText,
            headers,
          });
        }
        return upstreamRes;
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: 'Upstream fetch failed',
            message: (err as Error).message,
            upstream,
          }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }
    // Non-/api/* requests fall through to Pages (the static site).
    return fetch(request);
  },
};
