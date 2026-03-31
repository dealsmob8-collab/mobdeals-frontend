import { Metadata } from 'next'
import Link from 'next/link'
import { getProducts, getCategories } from '@/lib/woocommerce'
import { ProductCard } from '@/components/product-card'
import { Pagination } from '@/components/pagination'

export const metadata: Metadata = {
  title: 'All Products | MobDeals Kenya',
  description: 'Browse our complete collection of smartphones, laptops, and tech accessories. 2-hour delivery in Nairobi, M-PESA payments.',
}

interface ProductsPageProps {
  searchParams: {
    page?: string
    category?: string
    sort?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = parseInt(searchParams.page || '1')
  const category = searchParams.category
  const sort = searchParams.sort || 'date'
  
  const [{ products, total, total_pages }, categories] = await Promise.all([
    getProducts(category, page, 12, sort),
    getCategories(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <span className="text-foreground">Products</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Categories */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    !category ? 'bg-mobdeals-red/10 text-mobdeals-red' : 'hover:bg-secondary'
                  }`}
                >
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      category === String(cat.id)
                        ? 'bg-mobdeals-red/10 text-mobdeals-red'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({cat.count})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sort */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">Sort By</h3>
            <select
              name="sort"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              defaultValue={sort}
              onChange={(e) => {
                const url = new URL(window.location.href)
                url.searchParams.set('sort', e.target.value)
                window.location.href = url.toString()
              }}
            >
              <option value="date">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {category
                ? categories.find((c) => String(c.id) === category)?.name || 'Products'
                : 'All Products'}
            </h1>
            <span className="text-sm text-muted-foreground">
              Showing {products.length} of {total} products
            </span>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {total_pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={total_pages}
                    baseUrl="/products"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No products found.</p>
              <Link
                href="/products"
                className="mt-4 inline-block text-mobdeals-red hover:underline"
              >
                View all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
