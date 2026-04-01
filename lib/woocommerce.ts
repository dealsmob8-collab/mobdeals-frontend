import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { WooCommerceProduct, WooCommerceCategory, ProductSearchResult } from '@/types/woocommerce'

const WP_JSON_BASE = process.env.WP_JSON_BASE || 'https://origin.mobdeals.co.ke/wp-json'
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || ''
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || ''
const DOMPurify = createDOMPurify(
  new JSDOM('').window as unknown as Parameters<typeof createDOMPurify>[0]
)

function buildAuthParams(): string {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    console.warn('WooCommerce credentials not configured')
    return ''
  }
  return `consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`
}

export async function getProducts(
  category?: string,
  page: number = 1,
  perPage: number = 12,
  sort: string = 'date'
): Promise<ProductSearchResult> {
  const authParams = buildAuthParams()
  let url = `${WP_JSON_BASE}/wc/v3/products?${authParams}&page=${page}&per_page=${perPage}&status=publish`

  if (category) {
    url += `&category=${encodeURIComponent(category)}`
  }

  // Map sort options to WooCommerce params
  const sortMap: Record<string, string> = {
    'date': 'date',
    'price_asc': 'price',
    'price_desc': 'price',
    'name': 'title',
    'popularity': 'popularity',
  }

  const wcSort = sortMap[sort] || 'date'
  const order = sort === 'price_asc' ? 'asc' : 'desc'
  url += `&orderby=${wcSort}&order=${order}`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  const total = parseInt(response.headers.get('X-WP-Total') || '0')
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0')
  const products = await response.json() as WooCommerceProduct[]

  return {
    products,
    total,
    total_pages: totalPages,
  }
}

export async function getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
  const authParams = buildAuthParams()
  const url = `${WP_JSON_BASE}/wc/v3/products?${authParams}&slug=${encodeURIComponent(slug)}&status=publish`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`)
  }

  const products = await response.json() as WooCommerceProduct[]
  return products.length > 0 ? products[0] : null
}

export async function getProductById(id: number): Promise<WooCommerceProduct | null> {
  const authParams = buildAuthParams()
  const url = `${WP_JSON_BASE}/wc/v3/products/${id}?${authParams}`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch product: ${response.status}`)
  }

  return response.json()
}

export async function getCategories(): Promise<WooCommerceCategory[]> {
  const authParams = buildAuthParams()
  const url = `${WP_JSON_BASE}/wc/v3/products/categories?${authParams}&per_page=100&hide_empty=true`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 300 }, // Cache categories for 5 minutes
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }

  return response.json()
}

export async function searchProducts(
  query: string,
  page: number = 1,
  perPage: number = 12
): Promise<ProductSearchResult> {
  const authParams = buildAuthParams()
  const url = `${WP_JSON_BASE}/wc/v3/products?${authParams}&search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&status=publish`

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.status}`)
  }

  const total = parseInt(response.headers.get('X-WP-Total') || '0')
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0')
  const products = await response.json() as WooCommerceProduct[]

  return {
    products,
    total,
    total_pages: totalPages,
  }
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}

export function validateProductData(product: WooCommerceProduct): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check for title/description mismatch
  if (product.description && product.description.trim().startsWith(product.name)) {
    issues.push('Description starts with product name - possible duplication')
  }

  // Check for empty critical fields
  if (!product.name || product.name.trim() === '') {
    issues.push('Product name is empty')
  }

  if (!product.price && !product.regular_price) {
    issues.push('Product has no price')
  }

  // Check for potential data mismatch
  if (product.description) {
    const descLower = product.description.toLowerCase()
    const nameWords = product.name.toLowerCase().split(' ')
    const unrelatedTerms = ['iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'nokia']
    const productType = nameWords[0]

    for (const term of unrelatedTerms) {
      if (descLower.includes(term) && !product.name.toLowerCase().includes(term)) {
        issues.push(`Description mentions '${term}' which is not in product name - potential mismatch`)
        break
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
