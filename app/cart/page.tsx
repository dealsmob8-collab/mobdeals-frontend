import Link from 'next/link'
import { CartPageClient } from '@/components/cart-page-client'
import { SITE_DESCRIPTION } from '@/lib/site'

export const metadata = {
  title: 'Cart | MobDeals Kenya',
  description: SITE_DESCRIPTION,
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <span className="text-foreground">Cart</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Your Cart</h1>
        <p className="text-muted-foreground">
          Review your items before completing the order.
        </p>
      </div>

      <CartPageClient />
    </div>
  )
}
