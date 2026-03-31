import { NextRequest, NextResponse } from 'next/server'
import { addCacheHeaders } from '@/lib/cache'
import { z } from 'zod'

const cartItemSchema = z.object({
  product_id: z.number(),
  variation_id: z.number().optional(),
  quantity: z.number().min(1).max(99),
})

// Get KV namespace from environment
declare global {
  var MOBDEALS_CART_KV: KVNamespace
}

async function getCartKey(request: NextRequest): Promise<string> {
  // Use a session cookie or IP-based key
  const sessionCookie = request.cookies.get('mobdeals_session')?.value
  if (sessionCookie) return `cart:${sessionCookie}`

  // Fallback to IP-based (not ideal but works for demo)
  const ip = request.headers.get('cf-connecting-ip') || 'anonymous'
  return `cart:ip:${ip}`
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
    const cartKey = await getCartKey(request)
    const cartData = await MOBDEALS_CART_KV.get(cartKey)
    const cart = cartData ? JSON.parse(cartData) : { items: [], total: 0, item_count: 0 }

    return NextResponse.json(cart, { status: 200 })
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
    const item = cartItemSchema.parse(body)

    const cartKey = await getCartKey(request)
    const cartData = await MOBDEALS_CART_KV.get(cartKey)
    const cart: any = cartData ? JSON.parse(cartData) : { items: [], total: 0, item_count: 0 }

    // Check if item already exists
    const existingIndex = cart.items.findIndex(
      (i: any) => i.product_id === item.product_id && i.variation_id === item.variation_id
    )

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += item.quantity
    } else {
      cart.items.push(item)
    }

    cart.item_count = cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0)

    await MOBDEALS_CART_KV.put(cartKey, JSON.stringify(cart))

    return NextResponse.json(cart, { status: 200 })
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
    const { product_id, variation_id, quantity } = cartItemSchema.parse(body)

    const cartKey = await getCartKey(request)
    const cartData = await MOBDEALS_CART_KV.get(cartKey)
    const cart: any = cartData ? JSON.parse(cartData) : { items: [], total: 0, item_count: 0 }

    const existingIndex = cart.items.findIndex(
      (i: any) => i.product_id === product_id && i.variation_id === variation_id
    )

    if (existingIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(existingIndex, 1)
      } else {
        cart.items[existingIndex].quantity = quantity
      }
    }

    cart.item_count = cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0)

    await MOBDEALS_CART_KV.put(cartKey, JSON.stringify(cart))

    return NextResponse.json(cart, { status: 200 })
  } catch (error) {
    console.error('Cart PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

async function handleClearCart(request: NextRequest): Promise<NextResponse> {
  try {
    const cartKey = await getCartKey(request)
    await MOBDEALS_CART_KV.delete(cartKey)

    return NextResponse.json(
      { items: [], total: 0, item_count: 0 },
      { status: 200 }
    )
  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
