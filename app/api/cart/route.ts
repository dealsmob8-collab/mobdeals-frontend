import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextRequest, NextResponse } from 'next/server'
import { addCacheHeaders } from '@/lib/cache'
import { getProductById } from '@/lib/woocommerce'
import { Cart, CartItem, WooCommerceProduct } from '@/types/woocommerce'
import { z } from 'zod'

const baseCartItemSchema = z.object({
  product_id: z.number(),
  variation_id: z.number().optional(),
})

const addCartItemSchema = baseCartItemSchema.extend({
  quantity: z.number().min(1).max(99),
})

const updateCartItemSchema = baseCartItemSchema.extend({
  quantity: z.number().min(0).max(99),
})

const SESSION_COOKIE_NAME = 'mobdeals_session'
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

interface StoredCartItem {
  product_id: number
  variation_id?: number
  quantity: number
}

interface StoredCart {
  items: StoredCartItem[]
  total: number
  item_count: number
}

interface CartEnv {
  MOBDEALS_CART_KV: KVNamespace
}

function getSessionState(request: NextRequest): {
  sessionId: string
  shouldSetCookie: boolean
} {
  const existingSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

  return {
    sessionId: existingSessionId || crypto.randomUUID(),
    shouldSetCookie: !existingSessionId,
  }
}

function getCartKey(sessionId: string): string {
  return `cart:${sessionId}`
}

function createEmptyStoredCart(): StoredCart {
  return { items: [], total: 0, item_count: 0 }
}

async function getCartKv(): Promise<KVNamespace> {
  const { env } = await getCloudflareContext()
  return (env as CartEnv).MOBDEALS_CART_KV
}

async function readStoredCart(cartKey: string): Promise<StoredCart> {
  const cartKv = await getCartKv()
  const cartData = await cartKv.get(cartKey)
  if (!cartData) return createEmptyStoredCart()

  try {
    const parsed = JSON.parse(cartData) as Partial<StoredCart>

    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      total: typeof parsed.total === 'number' ? parsed.total : 0,
      item_count: typeof parsed.item_count === 'number' ? parsed.item_count : 0,
    }
  } catch (error) {
    console.error('Failed to parse stored cart:', error)
    return createEmptyStoredCart()
  }
}

function normalizeStoredCart(cart: StoredCart): StoredCart {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    ...cart,
    item_count: itemCount,
  }
}

async function hydrateCart(cart: StoredCart): Promise<Cart> {
  const productIds = Array.from(new Set(cart.items.map((item) => item.product_id)))
  const products = new Map<number, WooCommerceProduct | null>()

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        products.set(productId, await getProductById(productId))
      } catch (error) {
        console.error(`Failed to hydrate cart item ${productId}:`, error)
        products.set(productId, null)
      }
    })
  )

  const items: CartItem[] = cart.items.map((item) => {
    const product = products.get(item.product_id)
    const price = parseFloat(product?.price || product?.regular_price || '0')

    return {
      ...item,
      name: product?.name || `Product #${item.product_id}`,
      price,
      image: product?.images?.[0]?.src,
      slug: product?.slug,
    }
  })

  const total = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  )

  return {
    items,
    total,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

function withSessionCookie(
  response: NextResponse,
  sessionState: { sessionId: string; shouldSetCookie: boolean }
): NextResponse {
  if (!sessionState.shouldSetCookie) return response

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionState.sessionId,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  })

  return response
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = await handleGetCart(request)
  return addCacheHeaders(response, 'BYPASS', 'cart-endpoint')
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = await handleAddToCart(request)
  return addCacheHeaders(response, 'BYPASS', 'cart-endpoint')
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const response = await handleUpdateCart(request)
  return addCacheHeaders(response, 'BYPASS', 'cart-endpoint')
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const response = await handleClearCart(request)
  return addCacheHeaders(response, 'BYPASS', 'cart-endpoint')
}

async function handleGetCart(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionState = getSessionState(request)
    const cartKey = getCartKey(sessionState.sessionId)
    const cart = await hydrateCart(await readStoredCart(cartKey))

    return withSessionCookie(NextResponse.json(cart, { status: 200 }), sessionState)
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get cart' },
      { status: 500 }
    )
  }
}

async function handleAddToCart(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const item = addCartItemSchema.parse(body)

    const sessionState = getSessionState(request)
    const cartKey = getCartKey(sessionState.sessionId)
    const cart = await readStoredCart(cartKey)

    const existingIndex = cart.items.findIndex(
      (storedItem) =>
        storedItem.product_id === item.product_id &&
        storedItem.variation_id === item.variation_id
    )

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += item.quantity
    } else {
      cart.items.push(item)
    }

    const normalizedCart = normalizeStoredCart(cart)
    const cartKv = await getCartKv()
    await cartKv.put(cartKey, JSON.stringify(normalizedCart))

    return withSessionCookie(
      NextResponse.json(await hydrateCart(normalizedCart), { status: 200 }),
      sessionState
    )
  } catch (error) {
    console.error('Cart POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid cart item', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

async function handleUpdateCart(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { product_id, variation_id, quantity } = updateCartItemSchema.parse(body)

    const sessionState = getSessionState(request)
    const cartKey = getCartKey(sessionState.sessionId)
    const cart = await readStoredCart(cartKey)

    const existingIndex = cart.items.findIndex(
      (storedItem) =>
        storedItem.product_id === product_id &&
        storedItem.variation_id === variation_id
    )

    if (existingIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(existingIndex, 1)
      } else {
        cart.items[existingIndex].quantity = quantity
      }
    }

    const normalizedCart = normalizeStoredCart(cart)
    const cartKv = await getCartKv()
    await cartKv.put(cartKey, JSON.stringify(normalizedCart))

    return withSessionCookie(
      NextResponse.json(await hydrateCart(normalizedCart), { status: 200 }),
      sessionState
    )
  } catch (error) {
    console.error('Cart PUT error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid cart update', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

async function handleClearCart(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionState = getSessionState(request)
    const cartKey = getCartKey(sessionState.sessionId)
    const cartKv = await getCartKv()
    await cartKv.delete(cartKey)

    return withSessionCookie(
      NextResponse.json(
        { items: [], total: 0, item_count: 0 },
        { status: 200 }
      ),
      sessionState
    )
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
