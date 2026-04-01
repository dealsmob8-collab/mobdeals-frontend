import sanitizeHtmlLib from 'sanitize-html'
import { WooCommerceProduct, WooCommerceCategory, ProductSearchResult } from '@/types/woocommerce'

const WP_JSON_BASE = process.env.WP_JSON_BASE || 'https://origin.mobdeals.co.ke/wp-json'
const STORE_API_BASE = `${WP_JSON_BASE}/wc/store/v1`
const SANITIZE_HTML_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  parseStyleAttributes: false,
}

interface StoreApiPrice {
  price?: string
  regular_price?: string
  sale_price?: string
  currency_minor_unit?: number
}

interface StoreApiImage {
  id?: number
  src: string
  name?: string
  alt?: string
}

interface StoreApiCategory {
  id: number
  name: string
  slug: string
  parent?: number
  description?: string
  count?: number
  image?: StoreApiImage | null
  permalink?: string
}

interface StoreApiTag {
  id: number
  name: string
  slug: string
  link?: string
}

interface StoreApiAttributeTerm {
  name: string
}

interface StoreApiAttribute {
  id: number
  name: string
  has_variations?: boolean
  terms?: StoreApiAttributeTerm[]
}

interface StoreApiProduct {
  id: number
  name: string
  slug: string
  parent?: number
  type?: WooCommerceProduct['type'] | string
  permalink: string
  sku?: string
  short_description?: string
  description?: string
  on_sale?: boolean
  prices?: StoreApiPrice
  average_rating?: string
  review_count?: number
  images?: StoreApiImage[]
  categories?: StoreApiCategory[]
  tags?: StoreApiTag[]
  attributes?: StoreApiAttribute[]
  variations?: number[]
  grouped_products?: number[]
  is_purchasable?: boolean
  is_in_stock?: boolean
  is_on_backorder?: boolean
  sold_individually?: boolean
  add_to_cart?: {
    text?: string
  }
}

function normalizeMoneyAmount(rawValue: string | undefined, minorUnit: number): string {
  if (!rawValue) return '0'

  const isNegative = rawValue.startsWith('-')
  const digits = rawValue.replace(/[^\d]/g, '')

  if (!digits) return '0'
  if (minorUnit <= 0) return `${isNegative ? '-' : ''}${digits}`

  const padded = digits.padStart(minorUnit + 1, '0')
  const whole = padded.slice(0, -minorUnit).replace(/^0+(?=\d)/, '') || '0'
  const fraction = padded.slice(-minorUnit).replace(/0+$/, '')

  return `${isNegative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`
}

function mapStoreImage(image: StoreApiImage) {
  return {
    id: image.id || 0,
    date_created: '',
    date_created_gmt: '',
    date_modified: '',
    date_modified_gmt: '',
    src: image.src,
    name: image.name || '',
    alt: image.alt || '',
  }
}

function mapStoreCategory(category: StoreApiCategory): WooCommerceCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parent: category.parent || 0,
    description: category.description || '',
    display: 'default',
    image: category.image ? mapStoreImage(category.image) : null,
    menu_order: 0,
    count: category.count || 0,
    _links: {
      self: [{ href: category.permalink || '' }],
      collection: [{ href: `${STORE_API_BASE}/products/categories` }],
      up: category.parent ? [{ href: `${STORE_API_BASE}/products/categories/${category.parent}` }] : [],
    },
  }
}

function mapStoreTag(tag: StoreApiTag) {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: '',
    count: 0,
    _links: {
      self: [{ href: tag.link || '' }],
      collection: [{ href: `${STORE_API_BASE}/products/tags` }],
    },
  }
}

function mapStoreAttribute(attribute: StoreApiAttribute) {
  return {
    id: attribute.id,
    name: attribute.name,
    position: 0,
    visible: true,
    variation: Boolean(attribute.has_variations),
    options: (attribute.terms || []).map((term) => term.name),
  }
}

function mapStoreProduct(product: StoreApiProduct): WooCommerceProduct {
  const prices = product.prices || {}
  const minorUnit = prices.currency_minor_unit ?? 2
  const productType = product.type

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    permalink: product.permalink,
    date_created: '',
    date_modified: '',
    type:
      productType === 'simple' ||
      productType === 'variable' ||
      productType === 'grouped' ||
      productType === 'external'
        ? productType
        : 'simple',
    status: 'publish',
    featured: false,
    catalog_visibility: 'visible',
    description: product.description || '',
    short_description: product.short_description || '',
    sku: product.sku || '',
    price: normalizeMoneyAmount(prices.price, minorUnit),
    regular_price: normalizeMoneyAmount(prices.regular_price, minorUnit),
    sale_price: normalizeMoneyAmount(prices.sale_price, minorUnit),
    date_on_sale_from: null,
    date_on_sale_to: null,
    on_sale: Boolean(product.on_sale),
    purchasable: Boolean(product.is_purchasable),
    total_sales: 0,
    virtual: false,
    downloadable: false,
    downloads: [],
    download_limit: -1,
    download_expiry: -1,
    external_url: '',
    button_text: product.add_to_cart?.text || '',
    tax_status: 'taxable',
    tax_class: '',
    manage_stock: false,
    stock_quantity: null,
    stock_status: product.is_in_stock
      ? 'instock'
      : product.is_on_backorder
        ? 'onbackorder'
        : 'outofstock',
    backorders: product.is_on_backorder ? 'notify' : 'no',
    backorders_allowed: Boolean(product.is_on_backorder),
    backordered: false,
    sold_individually: Boolean(product.sold_individually),
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    shipping_required: true,
    shipping_taxable: true,
    shipping_class: '',
    shipping_class_id: 0,
    reviews_allowed: true,
    average_rating: product.average_rating || '0',
    rating_count: Number(product.review_count || 0),
    related_ids: [],
    upsell_ids: [],
    cross_sell_ids: [],
    parent_id: product.parent || 0,
    purchase_note: '',
    categories: (product.categories || []).map(mapStoreCategory),
    tags: (product.tags || []).map(mapStoreTag),
    images: (product.images || []).map(mapStoreImage),
    attributes: (product.attributes || []).map(mapStoreAttribute),
    default_attributes: [],
    variations: (product.variations || []).map(Number),
    grouped_products: (product.grouped_products || []).map(Number),
    menu_order: 0,
    meta_data: [],
    _links: {
      self: [{ href: product.permalink }],
      collection: [{ href: `${STORE_API_BASE}/products` }],
    },
  }
}

async function fetchStoreApi<T>(
  path: string,
  searchParams: Record<string, string | number | boolean | undefined>,
  revalidate: number
): Promise<{ data: T; response: Response }> {
  const url = new URL(`${STORE_API_BASE}${path}`)

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === '') continue
    url.searchParams.set(key, String(value))
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`)
  }

  return {
    data: await response.json() as T,
    response,
  }
}

export async function getProducts(
  category?: string,
  page: number = 1,
  perPage: number = 12,
  sort: string = 'date'
): Promise<ProductSearchResult> {
  const sortMap: Record<string, string> = {
    'date': 'date',
    'price_asc': 'price',
    'price_desc': 'price',
    'name': 'title',
    'popularity': 'popularity',
  }

  const wcSort = sortMap[sort] || 'date'
  const order = sort === 'price_asc' ? 'asc' : 'desc'
  const { data, response } = await fetchStoreApi<StoreApiProduct[]>(
    '/products',
    {
      page,
      per_page: perPage,
      category,
      orderby: wcSort,
      order,
    },
    60
  )

  const total = parseInt(response.headers.get('X-WP-Total') || String(data.length), 10)
  const totalPages = parseInt(
    response.headers.get('X-WP-TotalPages') || String(Math.max(1, Math.ceil(total / perPage))),
    10
  )

  return {
    products: data.map(mapStoreProduct),
    total,
    total_pages: totalPages,
  }
}

export async function getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
  const { data } = await fetchStoreApi<StoreApiProduct[]>(
    '/products',
    {
      slug,
    },
    60
  )

  return data.length > 0 ? mapStoreProduct(data[0]) : null
}

export async function getProductById(id: number): Promise<WooCommerceProduct | null> {
  const { data } = await fetchStoreApi<StoreApiProduct[]>(
    '/products',
    {
      include: id,
      per_page: 1,
    },
    60
  )

  return data.length > 0 ? mapStoreProduct(data[0]) : null
}

export async function getCategories(): Promise<WooCommerceCategory[]> {
  const { data } = await fetchStoreApi<StoreApiCategory[]>(
    '/products/categories',
    {
      per_page: 100,
    },
    300
  )

  return data
    .filter((category) => (category.count || 0) > 0)
    .map(mapStoreCategory)
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function searchProducts(
  query: string,
  page: number = 1,
  perPage: number = 12
): Promise<ProductSearchResult> {
  const { data, response } = await fetchStoreApi<StoreApiProduct[]>(
    '/products',
    {
      search: query,
      page,
      per_page: perPage,
    },
    60
  )

  const total = parseInt(response.headers.get('X-WP-Total') || String(data.length), 10)
  const totalPages = parseInt(
    response.headers.get('X-WP-TotalPages') || String(Math.max(1, Math.ceil(total / perPage))),
    10
  )

  return {
    products: data.map(mapStoreProduct),
    total,
    total_pages: totalPages,
  }
}

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, SANITIZE_HTML_OPTIONS)
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
