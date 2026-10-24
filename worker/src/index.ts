// Stateless relay for MTA's Metro-North GTFS-Realtime feed. MTA's developer terms
// (Item 1) say apps must serve the feed from a non-MTA server, so the extension
// fetches from here instead of from MTA directly.
//
// It only ever fetches one hard-coded URL, so it can't be used as an open proxy,
// and it logs nothing (see the privacy note in the README).

const UPSTREAM = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/mnr%2Fgtfs-mnr';

/** Cloudflare caches MTA's response this long, so many users share one upstream request */
const EDGE_CACHE_S = 15;
const UPSTREAM_TIMEOUT_MS = 10_000;

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname !== '/mnr') return new Response('Not found', { status: 404 });
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
    }

    let upstream: Response;
    try {
      upstream = await fetch(UPSTREAM, {
        cf: { cacheTtl: EDGE_CACHE_S, cacheEverything: true },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch {
      return new Response('Upstream unavailable', { status: 502 });
    }
    // Never serve stale data: the popup already shows an error state and retries
    if (!upstream.ok) return new Response(`Upstream error ${upstream.status}`, { status: 502 });

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'application/x-protobuf',
        'Cache-Control': 'no-store',
        // HIT/MISS from Cloudflare's cache, handy for checking edge caching works
        'X-Relay-Cache': upstream.headers.get('CF-Cache-Status') ?? 'unknown',
      },
    });
  },
} satisfies ExportedHandler;
