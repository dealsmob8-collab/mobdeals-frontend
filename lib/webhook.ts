import { createHmac, timingSafeEqual } from 'crypto'
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

export function getWebhookIdempotencyKey(payload: WebhookPayload): string {
  // Create a unique key based on webhook ID and timestamp
  const timestamp = new Date().toISOString().slice(0, 16) // Round to minute
  return `webhook:${payload.id}:${timestamp}`
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

export function getCacheInvalidationKeys(payload: WebhookPayload): string[] {
  const keys: string[] = []
  
  // Invalidate product list cache
  keys.push('products:')
  
  // Invalidate specific product cache if ID is present
  if (payload.id) {
    keys.push(`product:${payload.id}`)
  }
  
  // Invalidate category caches if order contains line items
  if (payload.line_items && payload.line_items.length > 0) {
    for (const item of payload.line_items) {
      if (item.product_id) {
        keys.push(`product:${item.product_id}`)
      }
    }
  }
  
  return keys
}
