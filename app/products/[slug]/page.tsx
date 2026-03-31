import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts, sanitizeHtml } from '@/lib/woocommerce'
import { formatPrice, cn } from '@/lib/utils'
import { ProductCard } from '@/components/product-card'
import { ShoppingCart, Truck, Shield, Check, Star } from 'lucide-react'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    return {
      title: 'Product Not Found | MobDeals',
    }
  }

  return {
    title: `${product.name} | MobDeals Kenya`,
    description: product.short_description || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.short_description || '',
      images: product.images?.[0] ? [{ url: product.images[0].src }] : [],
    },
  }
}

export async function generateStaticParams() {
  const { products } = await getProducts(undefined, 1, 20)
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }

  const price = parseFloat(product.price || product.regular_price || '0')
  const regularPrice = parseFloat(product.regular_price || '0')
  const isOnSale = product.on_sale && regularPrice > price

  // Get related products
  const { products: relatedProducts } = await getProducts(
    product.categories?.[0]?.id?.toString(),
    1,
    4,
    'popularity'
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-mobdeals-red">Products</Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
            {product.images && product.images[0] ? (
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
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

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border"
                >
                  <Image
                    src={image.src}
                    alt={image.alt || `${product.name} - ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.categories && product.categories[0] && (
            <Link
              href={`/category/${product.categories[0].slug}`}
              className="inline-block text-sm text-mobdeals-red hover:underline"
            >
              {product.categories[0].name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
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

          {/* Price */}
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

          {/* Short Description */}
          {product.short_description && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(product.short_description),
              }}
            />
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock_status === 'instock' ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-green-600">In Stock</span>
              </>
            ) : (
              <>
                <span className="h-5 w-5 rounded-full bg-red-500" />
                <span className="text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* Add to Cart */}
          <div className="flex gap-4">
            <button
              className="flex-1 rounded-full bg-mobdeals-red px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock_status !== 'instock'}
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-mobdeals-red" />
              <div>
                <p className="text-sm font-medium">2-Hour Delivery</p>
                <p className="text-xs text-muted-foreground">In Nairobi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Genuine Product</p>
                <p className="text-xs text-muted-foreground">With Warranty</p>
              </div>
            </div>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-sm text-muted-foreground">
              SKU: <span className="font-mono">{product.sku}</span>
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Product Description</h2>
          <div
            className="prose prose-invert max-w-none rounded-2xl border border-border bg-card p-6"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(product.description),
            }}
          />
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold">You May Also Like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
          </div>
        </div>
      )}

      {/* Schema.org Product Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images?.[0]?.src,
            description: product.short_description || product.description,
            sku: product.sku,
            brand: {
              '@type': 'Brand',
              name: product.categories?.[0]?.name || 'MobDeals',
            },
            offers: {
              '@type': 'Offer',
              url: `https://shop.mobdeals.co.ke/products/${product.slug}`,
              priceCurrency: 'KES',
              price: price,
              availability:
                product.stock_status === 'instock'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
            },
            aggregateRating: product.average_rating
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: product.average_rating,
                  reviewCount: product.rating_count,
                }
              : undefined,
          }),
        }}
      />
    </div>
  )
}
