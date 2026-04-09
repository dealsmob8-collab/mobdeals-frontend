'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Cart } from '@/types/woocommerce'
import {
  buildCartWhatsAppMessage,
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
} from '@/lib/site'

const EMPTY_CART: Cart = {
  items: [],
  total: 0,
  item_count: 0,
}

function emitCartUpdated(itemCount: number) {
  window.dispatchEvent(
    new CustomEvent('mobdeals:cart-updated', {
      detail: { itemCount },
    })
  )
}

export function CartPageClient() {
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)

  async function loadCart() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/cart', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }

      const nextCart = (await response.json()) as Cart
      setCart(nextCart)
      emitCartUpdated(nextCart.item_count)
    } catch (error) {
      console.error('Failed to load cart:', error)
      setCart(EMPTY_CART)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCart()
  }, [])

  async function updateQuantity(productId: number, quantity: number, variationId?: number) {
    setIsMutating(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          variation_id: variationId,
          quantity,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update cart: ${response.status}`)
      }

      const nextCart = (await response.json()) as Cart
      setCart(nextCart)
      emitCartUpdated(nextCart.item_count)
    } catch (error) {
      console.error('Failed to update cart:', error)
    } finally {
      setIsMutating(false)
    }
  }

  async function clearCart() {
    setIsMutating(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to clear cart: ${response.status}`)
      }

      setCart(EMPTY_CART)
      emitCartUpdated(0)
    } catch (error) {
      console.error('Failed to clear cart:', error)
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Loading your cart...</p>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground">
          Add a few products and they will appear here.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex rounded-full bg-mobdeals-red px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-mobdeals-orangeDark"
          >
            Continue shopping
          </Link>
          <a
            href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    )
  }

  const whatsappHref = buildWhatsAppUrl(buildCartWhatsAppMessage(cart))

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={`${item.product_id}:${item.variation_id || 0}`}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name || `Product ${item.product_id}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">P</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {item.slug ? (
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold hover:text-mobdeals-red"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <p className="font-semibold">{item.name}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  Product ID: {item.product_id}
                </p>
                <p className="mt-2 text-sm font-medium text-mobdeals-red">
                  {formatPrice(item.price || 0)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void updateQuantity(
                      item.product_id,
                      Math.max(item.quantity - 1, 0),
                      item.variation_id
                    )
                  }
                  disabled={isMutating}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    void updateQuantity(
                      item.product_id,
                      item.quantity + 1,
                      item.variation_id
                    )
                  }
                  disabled={isMutating}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Items</span>
            <span>{cart.item_count}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Checkout flow is still being finalized. For now, complete your order on
          WhatsApp with the items in your cart.
        </p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-mobdeals-cyanDark px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-mobdeals-teal"
        >
          Confirm order on WhatsApp
        </a>

        <button
          type="button"
          onClick={() => void clearCart()}
          disabled={isMutating}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
        >
          Clear Cart
        </button>
      </aside>
    </div>
  )
}
