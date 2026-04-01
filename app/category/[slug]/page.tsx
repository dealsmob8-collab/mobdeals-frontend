import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Pagination } from '@/components/pagination'
import { ProductCard } from '@/components/product-card'
import { SortSelect } from '@/components/sort-select'
import { getCategories, getProducts } from '@/lib/woocommerce'
import { WooCommerceCategory, WooCommerceProduct } from '@/types/woocommerce'

export const revalidate = 60

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    sort?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  return {
    title: `${params.slug} | MobDeals Kenya`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = parseInt(searchParams.page || '1')
  const sort = searchParams.sort || 'date'

  let categories: WooCommerceCategory[] = []
  let category: WooCommerceCategory | null = null
  let products: WooCommerceProduct[] = []
  let total = 0
  let totalPages = 0
  let dataUnavailable = false

  try {
    categories = await getCategories()
    category = categories.find((entry) => entry.slug === params.slug) || null

    if (!category) {
      notFound()
    }

    const productResult = await getProducts(String(category.id), page, 12, sort)
    products = productResult.products
    total = productResult.total
    totalPages = productResult.total_pages
  } catch (error) {
    console.error('Category page data error:', error)
    dataUnavailable = true
  }

  if (!category && !dataUnavailable) {
    notFound()
  }

  const paginationParams = new URLSearchParams()
  if (sort !== 'date') paginationParams.set('sort', sort)
  const paginationBase = paginationParams.toString()
    ? `/category/${params.slug}?${paginationParams.toString()}`
    : `/category/${params.slug}`

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-mobdeals-red">Categories</Link>
        <span>/</span>
        <span className="text-foreground">{category?.name || 'Category'}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">Categories</h3>
            <ul className="space-y-2">
              {categories.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/category/${entry.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      entry.slug === params.slug
                        ? 'bg-mobdeals-red/10 text-mobdeals-red'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {entry.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({entry.count})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold">Sort By</h3>
            <SortSelect value={sort} />
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{category?.name || 'Category'}</h1>
              <p className="text-sm text-muted-foreground">
                Showing {products.length} of {total} products
              </p>
            </div>
          </div>

          {dataUnavailable ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              Category data is temporarily unavailable.
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
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              No products found in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
