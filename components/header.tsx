'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Menu, X, Phone } from 'lucide-react'
import { CartIndicator } from '@/components/cart-indicator'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Deals', href: '/deals' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-8 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/brand/mobdeals-logo.svg"
              alt="MobDeals"
              width={180}
              height={48}
              priority
              className="h-10 w-auto max-w-[180px] object-contain"
            />
          </Link>

          {/* Desktop Search */}
          <div className="hidden flex-1 max-w-md md:block">
            <form action="/search" className="relative">
              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full rounded-full border border-border bg-secondary px-4 py-2 pl-10 text-sm focus:border-mobdeals-red focus:outline-none focus:ring-1 focus:ring-mobdeals-red"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-mobdeals-red"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 lg:flex"
            >
              <Phone className="h-4 w-4" />
              <span>Order on WhatsApp</span>
            </a>

            <CartIndicator />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-4 md:hidden">
          <form action="/search" className="relative">
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              className="w-full rounded-full border border-border bg-secondary px-4 py-2 pl-10 text-sm focus:border-mobdeals-red focus:outline-none focus:ring-1 focus:ring-mobdeals-red"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'border-t border-border bg-background md:hidden',
          isMenuOpen ? 'block' : 'hidden'
        )}
      >
        <nav className="container mx-auto px-4 py-4">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white"
              >
                <Phone className="h-4 w-4" />
                <span>Order on WhatsApp</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
