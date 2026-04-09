import Link from 'next/link'
import { getCategories } from '@/lib/woocommerce'
import { WooCommerceCategory } from '@/types/woocommerce'
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from '@/lib/site'

export const metadata = {
  title: 'Categories | MobDeals Kenya',
  description:
    'Browse MobDeals product categories, from phones and laptops to accessories and deals.',
}

export const revalidate = 300

export default async function CategoriesPage() {
  let categories: WooCommerceCategory[] = []
  let dataUnavailable = false

  try {
    categories = await getCategories()
  } catch (error) {
    console.error('Categories page data error:', error)
    dataUnavailable = true
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <span className="text-foreground">Categories</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Browse Categories</h1>
        <p className="text-muted-foreground">
          Explore the main product groups in the MobDeals catalog and confirm stock on WhatsApp.
        </p>
      </div>

      {dataUnavailable ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          Category data is temporarily unavailable.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-mobdeals-red"
              >
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.count} products
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <a
              href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Ask on WhatsApp
            </a>
          </div>
        </>
      )}
    </div>
  )
}
