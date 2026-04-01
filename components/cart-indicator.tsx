'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

interface CartResponse {
  item_count?: number
}

export function CartIndicator() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadCart() {
      try {
        const response = await fetch('/api/cart', { cache: 'no-store' })
        if (!response.ok) return

        const cart = (await response.json()) as CartResponse
        if (isMounted) {
          setCartCount(cart.item_count || 0)
        }
      } catch (error) {
        console.error('Failed to load cart count:', error)
      }
    }

    function handleCartUpdated(event: Event) {
      const cartEvent = event as CustomEvent<{ itemCount?: number }>
      setCartCount(cartEvent.detail?.itemCount || 0)
    }

    void loadCart()
    window.addEventListener('mobdeals:cart-updated', handleCartUpdated)

    return () => {
      isMounted = false
      window.removeEventListener('mobdeals:cart-updated', handleCartUpdated)
    }
  }, [])

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 rounded-full border border-border px-3 py-2 transition-colors hover:border-mobdeals-red"
    >
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mobdeals-red text-xs font-bold text-white">
          {cartCount}
        </span>
      )}
    </Link>
  )
}
