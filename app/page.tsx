import Link from 'next/link'
import { ArrowRight, CheckCircle2, MapPin, MessageCircle, Truck } from 'lucide-react'
import { getProducts, getCategories } from '@/lib/woocommerce'
import { ProductCard } from '@/components/product-card'
import { HomeHero } from '@/components/home-hero'
import { WooCommerceCategory, WooCommerceProduct } from '@/types/woocommerce'
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE, GOOGLE_MAPS_URL } from '@/lib/site'

export const revalidate = 60

const TRUST_FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Tested devices',
    desc: 'Quality-checked before sale',
  },
  {
    icon: MapPin,
    title: 'Nairobi support',
    desc: 'Pickup and dispatch help',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp stock checks',
    desc: 'Confirm price before checkout',
  },
  {
    icon: Truck,
    title: 'Clear condition notes',
    desc: 'New, used, or refurbished as listed',
  },
]

export default async function HomePage() {
  let featuredProducts: WooCommerceProduct[] = []
  let categories: WooCommerceCategory[] = []
  let dataUnavailable = false

  try {
    const [featuredResult, fetchedCategories] = await Promise.all([
      getProducts(undefined, 1, 8, 'popularity'),
      getCategories(),
    ])

    featuredProducts = featuredResult.products
    categories = fetchedCategories.slice(0, 6)
  } catch (error) {
    console.error('Home page data error:', error)
    dataUnavailable = true
  }

  return (
    <div className="flex flex-col">
      <HomeHero
        desktopHeroImageSrc="/home/hero-desktop.png"
        mobileHeroImageSrc="/home/hero-mobile.png"
      />

      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          {dataUnavailable && (
            <div className="mb-6 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Live catalog data is temporarily unavailable. You can still browse
              the storefront or confirm stock on WhatsApp.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mobdeals-red/10">
                  <feature.icon className="h-6 w-6 text-mobdeals-red" />
                </div>
                <div>
                  <h2 className="font-semibold">{feature.title}</h2>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Shop by Category</h2>
              <p className="text-muted-foreground">
                Phones, laptops, accessories, and other everyday tech picks.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-sm font-medium text-mobdeals-red hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-mobdeals-red"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold transition-colors group-hover:text-mobdeals-red">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count} products
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-mobdeals-red" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Featured Products</h2>
              <p className="text-muted-foreground">
                Popular items from the current WooCommerce catalog.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-mobdeals-red hover:underline"
            >
              View All
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Featured products will appear here once the WooCommerce catalog is
              reachable.
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 rounded-[2rem] bg-gradient-to-r from-mobdeals-red via-mobdeals-cyan to-mobdeals-dark p-8 md:p-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/70">
                Need help choosing?
              </p>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Message MobDeals on WhatsApp for stock, price, and delivery.
              </h2>
              <p className="max-w-xl text-white/80">
                We help Nairobi shoppers confirm the right device before checkout
                and keep the buying flow simple.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-mobdeals-red transition-colors hover:bg-white/90"
                >
                  Ask on WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
                >
                  Get Directions
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/15 bg-black/15 p-5 text-white">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/50">Support</p>
                  <p className="mt-2 text-sm font-medium">WhatsApp-first ordering</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/50">Location</p>
                  <p className="mt-2 text-sm font-medium">Moi Avenue, Tembo House Cooperative</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/50">Promise</p>
                  <p className="mt-2 text-sm font-medium">Clear condition and stock notes</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/50">Flow</p>
                  <p className="mt-2 text-sm font-medium">Shop, confirm, then order</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
