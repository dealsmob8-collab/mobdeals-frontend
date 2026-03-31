'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

const MESSAGES = [
  {
    id: 'delivery',
    text: '2-hour delivery in Nairobi | M-PESA | Cash on Delivery.',
    icon: '🚚',
  },
  {
    id: 'location',
    text: '📍 Moi Avenue, Tembo House Cooperative.',
    icon: null,
  },
]

const ROTATION_INTERVAL = 4000 // 4 seconds

export function AnnouncementStrip() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const rotateMessage = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length)
      setIsVisible(true)
    }, 300)
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(rotateMessage, ROTATION_INTERVAL)
    return () => clearInterval(interval)
  }, [isPaused, rotateMessage])

  const currentMessage = MESSAGES[currentIndex]

  return (
    <div
      className="sticky top-0 z-50 w-full bg-mobdeals-red text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Announcement strip"
      aria-live="polite"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center">
          <p
            className={cn(
              'text-center text-sm font-medium transition-all duration-300',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            )}
          >
            {currentMessage.text}
          </p>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <div
          className={cn(
            'h-full bg-white/60 transition-all',
            isPaused ? 'animate-none' : 'animate-progress'
          )}
          style={{
            animationDuration: `${ROTATION_INTERVAL}ms`,
            width: isPaused ? `${(currentIndex / MESSAGES.length) * 100}%` : '100%',
          }}
        />
      </div>
    </div>
  )
}
