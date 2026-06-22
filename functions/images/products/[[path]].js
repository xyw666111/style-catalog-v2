export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.ok || !pathname.endsWith("-medium.jpg")) {
    return withImageCache(assetResponse);
  }

  const originalPath = pathname.replace(/-medium\.jpg$/i, ".jpg");
  const originalUrl = new URL(request.url);
  originalUrl.pathname = originalPath;

  const originalRequest = new Request(originalUrl.toString(), request);
  const originalResponse = await env.ASSETS.fetch(originalRequest);
  if (!originalResponse.ok) return withImageCache(assetResponse);

  return withImageCache(originalResponse);
}

function withImageCache(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=604800, immutable");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
