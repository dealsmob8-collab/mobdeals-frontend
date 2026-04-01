import { Metadata } from 'next'
import Link from 'next/link'
import { searchProducts } from '@/lib/woocommerce'
import { ProductCard } from '@/components/product-card'
import { Pagination } from '@/components/pagination'
import { Search } from 'lucide-react'
import { WooCommerceProduct } from '@/types/woocommerce'

export const metadata: Metadata = {
  title: 'Search | MobDeals Kenya',
  description: 'Search for smartphones, laptops, and tech accessories at MobDeals Kenya.',
}
export const revalidate = 60

interface SearchPageProps {
  searchParams: {
    q?: string
    page?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  
  let products: WooCommerceProduct[] = []
  let total = 0
  let totalPages = 0
  let searchError = false
  
  if (query) {
    try {
      const result = await searchProducts(query, page, 12)
      products = result.products
      total = result.total
      totalPages = result.total_pages
    } catch (error) {
      console.error('Search page data error:', error)
      searchError = true
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <span className="text-foreground">Search</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        {query ? `Search Results for "${query}"` : 'Search Products'}
      </h1>

      {/* Search Form */}
      <form action="/search" className="mb-8 max-w-xl">
        <div className="relative">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search for products..."
            className="w-full rounded-full border border-border bg-secondary px-4 py-3 pl-12 text-sm focus:border-mobdeals-red focus:outline-none focus:ring-1 focus:ring-mobdeals-red"
          />
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-mobdeals-red px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {query ? (
        <>
          {searchError ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <h2 className="mb-2 text-xl font-semibold">Search is temporarily unavailable</h2>
              <p className="text-muted-foreground">
                Please try again shortly or contact support on WhatsApp.
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                Found {total} results
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl={`/search?q=${encodeURIComponent(query)}`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">No results found</h2>
              <p className="text-muted-foreground">
                We couldn&apos;t find any products matching &quot;{query}&quot;. Try a
                different search term.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Enter a search term above to find products.
          </p>
        </div>
      )}
    </div>
  )
}
