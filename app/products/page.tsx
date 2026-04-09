import { Metadata } from 'next'
import Link from 'next/link'
import { getProducts, getCategories } from '@/lib/woocommerce'
import { ProductCard } from '@/components/product-card'
import { Pagination } from '@/components/pagination'
import { SortSelect } from '@/components/sort-select'
import { WooCommerceCategory, WooCommerceProduct } from '@/types/woocommerce'
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Browse products | MobDeals Kenya',
  description:
    'Browse tested phones, laptops, accessories, and current deals from the MobDeals catalog. Confirm stock on WhatsApp before checkout.',
}
export const revalidate = 60

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
  let products: WooCommerceProduct[] = []
  let total = 0
  let totalPages = 0
  let categories: WooCommerceCategory[] = []
  let dataUnavailable = false

  try {
    const [productResult, fetchedCategories] = await Promise.all([
      getProducts(category, page, 12, sort),
      getCategories(),
    ])

    products = productResult.products
    total = productResult.total
    totalPages = productResult.total_pages
    categories = fetchedCategories
  } catch (error) {
    console.error('Products page data error:', error)
    dataUnavailable = true
  }

  const paginationParams = new URLSearchParams()
  if (category) paginationParams.set('category', category)
  if (sort !== 'date') paginationParams.set('sort', sort)
  const paginationBase = paginationParams.toString()
    ? `/products?${paginationParams.toString()}`
    : '/products'
  
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
            <SortSelect value={sort} />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Browse products</h1>
              <p className="text-sm text-muted-foreground">
                Tested devices, clear condition notes, and quick WhatsApp support.
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              Showing {products.length} of {total} products
            </span>
          </div>

          {dataUnavailable ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                Product data is temporarily unavailable. Please try again shortly
                or order through WhatsApp.
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl={paginationBase}
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
              <a
                href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Ask on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
