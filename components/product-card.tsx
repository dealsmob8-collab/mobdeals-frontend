import Link from 'next/link'
import Image from 'next/image'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { cn, formatPrice } from '@/lib/utils'
import { WooCommerceProduct } from '@/types/woocommerce'
import { getProductCopy } from '@/lib/product-copy'

interface ProductCardProps {
  product: WooCommerceProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const copy = getProductCopy(product)
  const price = parseFloat(product.price || product.regular_price || '0')
  const regularPrice = parseFloat(product.regular_price || '0')
  const isOnSale = product.on_sale && regularPrice > price

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden product-card',
        className
      )}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-secondary">
        {product.images && product.images[0] ? (
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt || copy.displayTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">📱</span>
          </div>
        )}
        
        {/* Sale badge */}
        {isOnSale && (
          <div className="absolute left-3 top-3 rounded-full bg-mobdeals-red px-3 py-1 text-xs font-bold text-white">
            SALE
          </div>
        )}
        
        {/* Stock badge */}
        {product.stock_status === 'outofstock' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-muted px-4 py-2 text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        {product.categories && product.categories[0] && (
          <span className="mb-1 text-xs text-muted-foreground">
            {product.categories[0].name}
          </span>
        )}

        <div className="mb-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {copy.familyLabel}
          </span>
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {copy.conditionLabel}
          </span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold group-hover:text-mobdeals-red transition-colors">
            {copy.displayTitle}
          </h3>
        </Link>

        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {copy.cardSummary}
        </p>

        {/* Rating */}
        {product.average_rating && parseFloat(product.average_rating) > 0 && (
          <div className="mb-2 flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-sm',
                    i < Math.round(parseFloat(product.average_rating))
                      ? 'text-yellow-500'
                      : 'text-muted-foreground'
                  )}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.rating_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-mobdeals-red">
              {formatPrice(price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <AddToCartButton
            productId={product.id}
            disabled={product.stock_status === 'outofstock'}
            variant="icon"
          />
        </div>
      </div>
    </div>
  )
}
