import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookSignature,
  parseWebhookPayload,
  getWebhookIdempotencyKey,
  checkReplayProtection,
  getCacheInvalidationPaths,
} from '@/lib/webhook'
import { addCacheHeaders } from '@/lib/cache'

interface WebhookEnv {
  WEBHOOK_REPLAY_KV: KVNamespace
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Get signature from headers
    const signature = request.headers.get('x-wc-webhook-signature') || ''

    // Verify webhook signature
    const verification = verifyWebhookSignature(rawBody, signature)
    if (!verification.valid) {
      console.warn('Webhook signature verification failed:', verification.error)
      const response = NextResponse.json(
        { error: 'Invalid signature', details: verification.error },
        { status: 403 }
      )
      return addCacheHeaders(response, 'BYPASS', 'webhook-invalid-signature')
    }

    // Parse payload
    const payload = parseWebhookPayload(rawBody)
    if (!payload) {
      const response = NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
      return addCacheHeaders(response, 'BYPASS', 'webhook-invalid-payload')
    }

    // Get webhook topic
    const topic = request.headers.get('x-wc-webhook-topic') || 'unknown'

    // Check replay protection
    const idempotencyKey = getWebhookIdempotencyKey(rawBody, topic)
    const { env } = await getCloudflareContext()
    const replayKv = (env as WebhookEnv).WEBHOOK_REPLAY_KV
    const isReplay = await checkReplayProtection(idempotencyKey, replayKv)
    if (isReplay) {
      console.warn('Duplicate webhook detected:', idempotencyKey)
      const response = NextResponse.json(
        { message: 'Webhook already processed' },
        { status: 200 }
      )
      return addCacheHeaders(response, 'BYPASS', 'webhook-replay')
    }

    console.log('Processing webhook:', topic, 'for order/product:', payload.id)

    // Handle different webhook topics
    switch (topic) {
      case 'order.created':
      case 'order.updated':
      case 'order.deleted':
        await handleOrderWebhook(payload)
        break

      case 'product.created':
      case 'product.updated':
      case 'product.deleted':
        await handleProductWebhook(payload)
        break

      default:
        console.log('Unhandled webhook topic:', topic)
    }

    const cachePaths = getCacheInvalidationPaths(payload, topic)
    await invalidateCachePaths(cachePaths, request.nextUrl.origin)

    const response = NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    )
    return addCacheHeaders(response, 'BYPASS', 'webhook-processed')

  } catch (error) {
    console.error('Webhook processing error:', error)
    const response = NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
    return addCacheHeaders(response, 'BYPASS', 'webhook-error')
  }
}

async function handleOrderWebhook(payload: unknown): Promise<void> {
  // Process order webhook
  console.log('Processing order webhook:', payload)
  // Add order-specific processing here
  // e.g., update inventory, send notifications, etc.
}

async function handleProductWebhook(payload: unknown): Promise<void> {
  // Process product webhook
  console.log('Processing product webhook:', payload)
  // Add product-specific processing here
  // e.g., update search index, clear product cache, etc.
}

async function invalidateCachePaths(paths: string[], origin: string): Promise<void> {
  const cache = (caches as any).default

  for (const path of paths) {
    try {
      const cacheUrl = new URL(path, origin).toString()
      await cache.delete(cacheUrl)
      console.log('Invalidated cache path:', cacheUrl)
    } catch (error) {
      console.error('Failed to invalidate cache path:', path, error)
    }
  }
}
