import Link from 'next/link'
import { ArrowRight, Truck, Shield, Headphones, CreditCard } from 'lucide-react'
import { getProducts, getCategories } from '@/lib/woocommerce'
import { formatPrice } from '@/lib/utils'
import { ProductCard } from '@/components/product-card'

export const revalidate = 60

export default async function HomePage() {
  const [{ products: featuredProducts }, { categories }] = await Promise.all([
    getProducts(undefined, 1, 8, 'popularity'),
    getCategories().then(cats => ({ categories: cats.slice(0, 6) })),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mobdeals-dark via-background to-mobdeals-dark py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="container relative mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-mobdeals-red/30 bg-mobdeals-red/10 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mobdeals-red opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mobdeals-red" />
                </span>
                <span className="text-xs font-medium text-mobdeals-red">New Arrivals Available</span>
              </div>
              
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Kenya's Premier{' '}
                <span className="text-mobdeals-red">Tech Store</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Shop the latest smartphones, laptops, and accessories. 
                2-hour delivery in Nairobi, M-PESA payments, nationwide shipping.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-mobdeals-red px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-mobdeals-red/20 to-transparent p-8">
                <div className="h-full w-full rounded-2xl bg-secondary/50 flex items-center justify-center">
                  <span className="text-6xl">📱</span>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -left-4 top-1/4 rounded-xl bg-card p-3 shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-mobdeals-red" />
                  <span className="text-sm font-medium">2hr Delivery</span>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 rounded-xl bg-card p-3 shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: '2-Hour Delivery', desc: 'In Nairobi' },
              { icon: CreditCard, title: 'M-PESA', desc: 'Secure Payments' },
              { icon: Shield, title: 'Genuine Products', desc: 'Manufacturer Warranty' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always Here to Help' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 rounded-xl bg-card p-4 border border-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mobdeals-red/10">
                  <feature.icon className="h-6 w-6 text-mobdeals-red" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">Shop by Category</h2>
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
                    <h3 className="text-lg font-semibold group-hover:text-mobdeals-red transition-colors">
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

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Featured Products</h2>
              <p className="text-muted-foreground">Most popular items this week</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-mobdeals-red hover:underline"
            >
              View All
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-gradient-to-r from-mobdeals-red to-red-700 p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  Visit Our Store
                </h2>
                <p className="text-white/80">
                  Come see our products in person at Moi Avenue, Tembo House Cooperative. 
                  Our friendly staff is ready to help you find the perfect device.
                </p>
                <a
                  href="https://maps.google.com/?q=Moi+Avenue+Tembo+House+Cooperative+Nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-mobdeals-red transition-colors hover:bg-white/90"
                >
                  Get Directions
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-center">
                <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                  <div className="space-y-3 text-white">
                    <p className="font-semibold">📍 Moi Avenue</p>
                    <p className="font-semibold">🏢 Tembo House Cooperative</p>
                    <p className="font-semibold">🌆 Nairobi, Kenya</p>
                    <p className="text-white/80">Open Mon-Sat: 9AM - 7PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
