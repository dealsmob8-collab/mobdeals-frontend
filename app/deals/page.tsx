import Link from 'next/link'
import { ProductCard } from '@/components/product-card'
import { getProducts } from '@/lib/woocommerce'
import { WooCommerceProduct } from '@/types/woocommerce'

export const metadata = {
  title: 'Deals | MobDeals Kenya',
}

export const revalidate = 60

export default async function DealsPage() {
  let products: WooCommerceProduct[] = []
  let dataUnavailable = false

  try {
    const result = await getProducts(undefined, 1, 24, 'popularity')
    const onSaleProducts = result.products.filter((product) => product.on_sale)
    products = onSaleProducts.length > 0 ? onSaleProducts : result.products.slice(0, 12)
  } catch (error) {
    console.error('Deals page data error:', error)
    dataUnavailable = true
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <span className="text-foreground">Deals</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Latest Deals</h1>
        <p className="text-muted-foreground">
          Promotions, markdowns, and hot offers from the current catalog.
        </p>
      </div>

      {dataUnavailable ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          Deal data is temporarily unavailable.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
