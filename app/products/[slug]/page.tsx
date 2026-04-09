import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts, sanitizeHtml } from '@/lib/woocommerce'
import { formatPrice, cn } from '@/lib/utils'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { ProductCard } from '@/components/product-card'
import { WooCommerceProduct } from '@/types/woocommerce'
import { buildWhatsAppUrl } from '@/lib/site'
import { getProductCopy } from '@/lib/product-copy'
import { CheckCircle2, ShieldCheck, MessageCircle, MapPin, Truck, Star } from 'lucide-react'

export const revalidate = 60
export const dynamicParams = true

interface ProductPageProps {
  params: {
    slug: string
  }
}

function getStockLabel(stockStatus: WooCommerceProduct['stock_status']): string {
  if (stockStatus === 'instock') return 'In stock'
  if (stockStatus === 'onbackorder') return 'On backorder'
  return 'Out of stock'
}

function getStockTone(stockStatus: WooCommerceProduct['stock_status']): string {
  if (stockStatus === 'instock') return 'border-mobdeals-teal/30 bg-mobdeals-teal/10 text-mobdeals-cyan'
  if (stockStatus === 'onbackorder') return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
  return 'border-border bg-muted/40 text-muted-foreground'
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug)

    if (!product) {
      return {
        title: 'Product Not Found | MobDeals',
      }
    }

    const copy = getProductCopy(product)
    const ogImage = product.images?.[0]?.src || '/brand/mobdeals-logo.png'

    return {
      title: `${copy.displayTitle} | MobDeals Kenya`,
      description: copy.metaDescription,
      alternates: {
        canonical: `/products/${product.slug}`,
      },
      openGraph: {
        title: `${copy.displayTitle} | MobDeals Kenya`,
        description: copy.metaDescription,
        images: [
          {
            url: ogImage,
            alt: copy.displayTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${copy.displayTitle} | MobDeals Kenya`,
        description: copy.metaDescription,
        images: [ogImage],
      },
    }
  } catch (error) {
    console.error('Product metadata error:', error)
    return {
      title: 'MobDeals Product | MobDeals Kenya',
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product: WooCommerceProduct | null = null

  try {
    product = await getProductBySlug(params.slug)
  } catch (error) {
    console.error('Product page data error:', error)
  }

  if (!product) {
    notFound()
  }

  const copy = getProductCopy(product)
  const price = parseFloat(product.price || product.regular_price || '0')
  const regularPrice = parseFloat(product.regular_price || '0')
  const isOnSale = product.on_sale && regularPrice > price
  const whatsappHref = buildWhatsAppUrl(copy.whatsappMessage)

  let relatedProducts: WooCommerceProduct[] = []

  try {
    const relatedResult = await getProducts(
      product.categories?.[0]?.id?.toString(),
      1,
      4,
      'popularity'
    )
    relatedProducts = relatedResult.products
  } catch (error) {
    console.error('Related products error:', error)
  }

  const stockLabel = getStockLabel(product.stock_status)
  const stockTone = getStockTone(product.stock_status)

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-mobdeals-red">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{copy.displayTitle}</span>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-secondary">
            {product.images && product.images[0] ? (
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt || copy.displayTitle}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
            )}

            {isOnSale && (
              <div className="absolute left-4 top-4 rounded-full bg-mobdeals-red px-4 py-1.5 text-sm font-bold text-white">
                SALE
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-secondary"
                >
                  <Image
                    src={image.src}
                    alt={image.alt || `${copy.displayTitle} ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {product.categories?.[0] && (
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-mobdeals-red hover:text-mobdeals-red"
              >
                {product.categories[0].name}
              </Link>
            )}
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              {copy.familyLabel}
            </span>
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              {copy.conditionLabel}
            </span>
            <span className={cn('rounded-full border px-3 py-1 text-xs font-medium', stockTone)}>
              {stockLabel}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {copy.displayTitle}
            </h1>

            {product.average_rating && parseFloat(product.average_rating) > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-5 w-5',
                        i < Math.round(parseFloat(product.average_rating))
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.average_rating} ({product.rating_count} reviews)
                </span>
              </div>
            )}
          </div>

          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {copy.summary}
          </p>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-mobdeals-red">
              {formatPrice(price)}
            </span>
            {isOnSale && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-mobdeals-cyanDark px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-mobdeals-teal"
            >
              <MessageCircle className="h-5 w-5" />
              Order on WhatsApp
            </a>
            <AddToCartButton
              productId={product.id}
              disabled={product.stock_status !== 'instock'}
              variant="full"
              className="border border-border bg-secondary px-6 py-4 text-foreground hover:bg-muted"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {copy.trustNotes.map((note, index) => (
              <div
                key={note}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-mobdeals-red/10">
                  {index === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-mobdeals-red" />
                  ) : index === 1 ? (
                    <ShieldCheck className="h-4 w-4 text-mobdeals-red" />
                  ) : index === 2 ? (
                    <MessageCircle className="h-4 w-4 text-mobdeals-red" />
                  ) : (
                    <MapPin className="h-4 w-4 text-mobdeals-red" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>

          {product.sku && (
            <p className="text-sm text-muted-foreground">
              SKU: <span className="font-mono">{product.sku}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Verified specs</h2>
            <Truck className="h-5 w-5 text-mobdeals-red" />
          </div>
          {copy.verifiedSpecs.length > 0 ? (
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {copy.verifiedSpecs.map((spec) => (
                <div key={spec.label} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <dt className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Verified specs were not supplied by the origin catalog yet. Message us on
              WhatsApp to confirm storage, RAM, or condition details.
            </p>
          )}
        </article>

        <article className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Ideal for</h2>
            <CheckCircle2 className="h-5 w-5 text-mobdeals-red" />
          </div>
          <ul className="mt-5 space-y-3">
            {copy.idealFor.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mobdeals-red" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Why buy from MobDeals</h2>
            <ShieldCheck className="h-5 w-5 text-mobdeals-red" />
          </div>
          <ul className="mt-5 space-y-3">
            {copy.whyBuy.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mobdeals-red" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Availability</h2>
            <MapPin className="h-5 w-5 text-mobdeals-red" />
          </div>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            {copy.availabilityNote}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-mobdeals-cyanDark px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-mobdeals-teal"
          >
            <MessageCircle className="h-4 w-4" />
            Confirm stock on WhatsApp
          </a>
        </article>
      </div>

      {product.description && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">More details</h2>
          <div
            className="prose prose-invert max-w-none rounded-3xl border border-border bg-card p-6"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(product.description),
            }}
          />
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">You may also like</h2>
              <p className="text-sm text-muted-foreground">
                Similar items from the current catalog.
              </p>
            </div>
            <Link href="/products" className="text-sm font-medium text-mobdeals-red hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts
              .filter((entry) => entry.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: copy.displayTitle,
            image: product.images?.[0]?.src,
            description: copy.metaDescription,
            sku: product.sku,
            brand: {
              '@type': 'Brand',
              name: copy.schemaBrandName,
            },
            offers: {
              '@type': 'Offer',
              url: `https://shop.mobdeals.co.ke/products/${product.slug}`,
              priceCurrency: 'KES',
              price,
              availability:
                product.stock_status === 'instock'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
            },
            additionalProperty:
              copy.verifiedSpecs.length > 0
                ? copy.verifiedSpecs.map((spec) => ({
                    '@type': 'PropertyValue',
                    name: spec.label,
                    value: spec.value,
                  }))
                : undefined,
          }),
        }}
      />
    </div>
  )
}
