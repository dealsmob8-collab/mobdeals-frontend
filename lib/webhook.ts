import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { WebhookPayload } from '@/types/woocommerce'

const WC_WEBHOOK_SECRET = process.env.WC_WEBHOOK_SECRET || ''

export interface WebhookVerificationResult {
  valid: boolean
  error?: string
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): WebhookVerificationResult {
  if (!WC_WEBHOOK_SECRET) {
    return { valid: false, error: 'Webhook secret not configured' }
  }
  
  if (!signature) {
    return { valid: false, error: 'Missing signature header' }
  }
  
  // WooCommerce sends signature as base64-encoded HMAC-SHA256
  const expectedSignature = createHmac('sha256', WC_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('base64')
  
  try {
    const signatureBuffer = Buffer.from(signature, 'base64')
    const expectedBuffer = Buffer.from(expectedSignature, 'base64')
    
    // Constant-time comparison to prevent timing attacks
    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature length' }
    }
    
    const match = timingSafeEqual(signatureBuffer, expectedBuffer)
    
    if (!match) {
      return { valid: false, error: 'Signature mismatch' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Signature verification failed' }
  }
}

export function getWebhookIdempotencyKey(rawBody: string, topic: string): string {
  const hash = createHash('sha256')
    .update(`${topic}:${rawBody}`, 'utf8')
    .digest('hex')

  return `webhook:${topic}:${hash}`
}

export async function checkReplayProtection(
  key: string,
  kv: KVNamespace
): Promise<boolean> {
  try {
    const existing = await kv.get(key)
    if (existing) {
      return true // Already processed
    }
    
    // Store with 5-minute TTL
    await kv.put(key, 'processed', { expirationTtl: 300 })
    return false
  } catch (error) {
    console.error('KV error in replay protection:', error)
    // Fail open - allow webhook to proceed if KV fails
    return false
  }
}

export function parseWebhookPayload(body: string): WebhookPayload | null {
  try {
    return JSON.parse(body) as WebhookPayload
  } catch (error) {
    console.error('Failed to parse webhook payload:', error)
    return null
  }
}

export function getCacheInvalidationPaths(
  payload: WebhookPayload,
  topic: string
): string[] {
  const paths = new Set<string>([
    '/api/products',
    '/api/categories',
    '/products',
    '/categories',
  ])

  if (topic.startsWith('product')) {
    if (payload.slug) {
      paths.add(`/api/products/${payload.slug}`)
      paths.add(`/products/${payload.slug}`)
    }

    for (const category of payload.categories || []) {
      paths.add(`/category/${category.slug}`)
    }
  }

  return Array.from(paths)
}
