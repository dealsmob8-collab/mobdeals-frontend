'use client'

import { useRef, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'icon' | 'full'

interface AddToCartButtonProps {
  productId: number
  disabled?: boolean
  variant?: ButtonVariant
  className?: string
}

interface CartResponse {
  item_count?: number
}

function emitCartUpdated(itemCount: number) {
  window.dispatchEvent(
    new CustomEvent('mobdeals:cart-updated', {
      detail: { itemCount },
    })
  )
}

export function AddToCartButton({
  productId,
  disabled = false,
  variant = 'icon',
  className,
}: AddToCartButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const resetTimerRef = useRef<number | null>(null)

  async function handleAddToCart() {
    if (disabled || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`)
      }

      const cart = (await response.json()) as CartResponse
      emitCartUpdated(cart.item_count || 0)
      setIsAdded(true)

      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current)
      }

      resetTimerRef.current = window.setTimeout(() => {
        setIsAdded(false)
      }, 1600)
    } catch (error) {
      console.error('Add to cart failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isSubmitting}
        className={cn(
          'flex-1 rounded-full bg-mobdeals-red px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <span className="flex items-center justify-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {isSubmitting ? 'Adding...' : isAdded ? 'Added' : 'Add to Cart'}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || isSubmitting}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full bg-mobdeals-red text-white transition-colors hover:bg-red-700 disabled:opacity-50',
        className
      )}
      aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
      title={isAdded ? 'Added to cart' : 'Add to cart'}
    >
      <ShoppingCart className="h-4 w-4" />
    </button>
  )
}
