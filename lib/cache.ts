import { NextRequest, NextResponse } from 'next/server'

export interface CacheConfig {
  ttl?: number
  bypassPaths?: string[]
  bypassCookies?: string[]
}

const DEFAULT_CACHE_TTL = 60 // 60 seconds for catalog

// Paths that should never be cached
const NEVER_CACHE_PATHS = [
  '/api/cart',
  '/api/checkout',
  '/api/account',
  '/api/webhooks',
]

// Cookie names that indicate authenticated/session state
const SESSION_COOKIES = [
  'wordpress_logged_in',
  'wp-settings',
  'woocommerce_cart_hash',
  'woocommerce_items_in_cart',
  'wp_woocommerce_session',
]

export function shouldBypassCache(request: NextRequest): {
  bypass: boolean
  reason: string
} {
  // Never cache POST, PUT, DELETE, PATCH
  if (!['GET', 'HEAD'].includes(request.method)) {
    return { bypass: true, reason: 'non-get-method' }
  }

  // Check for never-cache paths
  const url = new URL(request.url)
  for (const path of NEVER_CACHE_PATHS) {
    if (url.pathname.startsWith(path)) {
      return { bypass: true, reason: 'sensitive-path' }
    }
  }

  // Check for session/auth cookies
  const cookies = request.headers.get('cookie') || ''
  for (const cookieName of SESSION_COOKIES) {
    if (cookies.includes(cookieName)) {
      return { bypass: true, reason: 'session-cookie' }
    }
  }

  // Check for authorization header
  if (request.headers.get('authorization')) {
    return { bypass: true, reason: 'auth-header' }
  }

  return { bypass: false, reason: '' }
}

export function buildCacheKey(request: NextRequest): string {
  const url = new URL(request.url)
  return url.toString()
}

export async function getCachedResponse(
  request: NextRequest,
  cache: Cache
): Promise<Response | null> {
  const cacheKey = buildCacheKey(request)
  const response = await cache.match(cacheKey)
  return response || null
}

export async function cacheResponse(
  request: NextRequest,
  response: NextResponse,
  cache: Cache,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<void> {
  const cacheKey = buildCacheKey(request)

  // Clone response to modify headers
  const cachedResponse = response.clone()

  // Add cache headers
  cachedResponse.headers.set('Cache-Control', `public, max-age=${ttl}`)
  cachedResponse.headers.set('X-MobDeals-Cache', 'HIT')

  await cache.put(cacheKey, cachedResponse)
}

export function addCacheHeaders(
  response: NextResponse,
  status: 'HIT' | 'MISS' | 'BYPASS',
  reason?: string
): NextResponse {
  response.headers.set('X-MobDeals-Cache', status + (reason ? ` (${reason})` : ''))

  if (status === 'BYPASS') {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }

  return response
}

// Helper for API routes to handle caching
export async function withCache(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options: { ttl?: number } = {}
): Promise<NextResponse> {
  const { bypass, reason } = shouldBypassCache(request)

  if (bypass) {
    const response = await handler()
    return addCacheHeaders(response, 'BYPASS', reason)
  }

  // Try to get from cache
  const cache = (caches as any).default
  const cached = await getCachedResponse(request, cache)

  if (cached) {
    const response = new NextResponse(cached.body, {
      status: cached.status,
      statusText: cached.statusText,
      headers: cached.headers,
    })
    return addCacheHeaders(response, 'HIT')
  }

  // Execute handler and cache result
  const response = await handler()

  // Only cache successful responses without Set-Cookie
  if (response.status === 200 && !response.headers.get('set-cookie')) {
    await cacheResponse(request, response, cache, options.ttl)
  }

  return addCacheHeaders(response, 'MISS')
}
