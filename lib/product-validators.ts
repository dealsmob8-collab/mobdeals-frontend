import { WooCommerceProduct } from '@/types/woocommerce'
import { classifyProduct, normalizeText } from '@/lib/product-format'

const KNOWN_BRAND_TERMS = [
  'apple',
  'iphone',
  'samsung',
  'galaxy',
  'xiaomi',
  'redmi',
  'poco',
  'oppo',
  'vivo',
  'nokia',
  'infinix',
  'tecno',
  'itel',
  'dell',
  'hp',
  'lenovo',
  'acer',
  'asus',
  'sony',
  'google',
  'pixel',
  'motorola',
  'oneplus',
  'realme',
  'honor',
]

export function validateProductData(product: WooCommerceProduct): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []
  const name = normalizeText(product.name)
  const description = normalizeText(product.description)
  const shortDescription = normalizeText(product.short_description)
  const classification = classifyProduct(product)
  const searchableText = classification.searchText

  if (!name) {
    issues.push('Product name is empty')
  }

  if (!normalizeText(product.price) && !normalizeText(product.regular_price)) {
    issues.push('Product has no price')
  }

  if (description && description.toLowerCase().startsWith(name.toLowerCase())) {
    issues.push('Description starts with product name - possible duplication')
  }

  if (
    classification.brand === 'Apple' &&
    classification.family === 'phone' &&
    /android/i.test(searchableText)
  ) {
    issues.push('Apple phones should not be labeled Android')
  }

  if (
    classification.brand === 'Apple' &&
    /android phone/i.test(searchableText)
  ) {
    issues.push('Apple devices should not use Android Phone language')
  }

  if (description || shortDescription) {
    const titleText = `${name} ${shortDescription}`.toLowerCase()

    for (const term of KNOWN_BRAND_TERMS) {
      if (searchableText.includes(term) && !titleText.includes(term)) {
        issues.push(
          `Description mentions '${term}' which is not present in the product title - potential mismatch`
        )
        break
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
