export interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  permalink: string
  date_created: string
  date_modified: string
  type: 'simple' | 'variable' | 'grouped' | 'external'
  status: 'publish' | 'draft' | 'pending' | 'private'
  featured: boolean
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden'
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  date_on_sale_from: string | null
  date_on_sale_to: string | null
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  virtual: boolean
  downloadable: boolean
  downloads: unknown[]
  download_limit: number
  download_expiry: number
  external_url: string
  button_text: string
  tax_status: 'taxable' | 'shipping' | 'none'
  tax_class: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  backorders: 'no' | 'notify' | 'yes'
  backorders_allowed: boolean
  backordered: boolean
  sold_individually: boolean
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  shipping_required: boolean
  shipping_taxable: boolean
  shipping_class: string
  shipping_class_id: number
  reviews_allowed: boolean
  average_rating: string
  rating_count: number
  related_ids: number[]
  upsell_ids: number[]
  cross_sell_ids: number[]
  parent_id: number
  purchase_note: string
  categories: WooCommerceCategory[]
  tags: WooCommerceTag[]
  images: WooCommerceImage[]
  attributes: WooCommerceAttribute[]
  default_attributes: unknown[]
  variations: number[]
  grouped_products: number[]
  menu_order: number
  meta_data: WooCommerceMetaData[]
  _links: {
    self: { href: string }[]
    collection: { href: string }[]
  }
}

export interface WooCommerceCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  display: string
  image: WooCommerceImage | null
  menu_order: number
  count: number
  _links: {
    self: { href: string }[]
    collection: { href: string }[]
    up: { href: string }[]
  }
}

export interface WooCommerceTag {
  id: number
  name: string
  slug: string
  description: string
  count: number
  _links: {
    self: { href: string }[]
    collection: { href: string }[]
  }
}

export interface WooCommerceImage {
  id: number
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  src: string
  name: string
  alt: string
}

export interface WooCommerceAttribute {
  id: number
  name: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface WooCommerceMetaData {
  id: number
  key: string
  value: unknown
}

export interface WooCommerceOrder {
  id: number
  parent_id: number
  status: string
  currency: string
  version: string
  prices_include_tax: boolean
  date_created: string
  date_modified: string
  discount_total: string
  discount_tax: string
  shipping_total: string
  shipping_tax: string
  cart_tax: string
  total: string
  total_tax: string
  customer_id: number
  order_key: string
  billing: WooCommerceAddress
  shipping: WooCommerceAddress
  payment_method: string
  payment_method_title: string
  transaction_id: string
  customer_ip_address: string
  customer_user_agent: string
  created_via: string
  customer_note: string
  date_completed: string | null
  date_paid: string | null
  cart_hash: string
  number: string
  meta_data: WooCommerceMetaData[]
  line_items: WooCommerceLineItem[]
  tax_lines: unknown[]
  shipping_lines: unknown[]
  fee_lines: unknown[]
  coupon_lines: unknown[]
  refunds: unknown[]
  _links: {
    self: { href: string }[]
    collection: { href: string }[]
    customer: { href: string }[]
  }
}

export interface WooCommerceAddress {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
  email: string
  phone: string
}

export interface WooCommerceLineItem {
  id: number
  name: string
  product_id: number
  variation_id: number
  quantity: number
  tax_class: string
  subtotal: string
  subtotal_tax: string
  total: string
  total_tax: string
  taxes: unknown[]
  meta_data: WooCommerceMetaData[]
  sku: string
  price: number
  image: WooCommerceImage
  parent_name: string | null
}

export interface CartItem {
  product_id: number
  variation_id?: number
  quantity: number
  name?: string
  price?: number
  image?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  item_count: number
}

export interface ProductSearchResult {
  products: WooCommerceProduct[]
  total: number
  total_pages: number
}

export interface WebhookPayload {
  id: number
  parent_id?: number
  status?: string
  number?: string
  currency?: string
  date_created?: string
  date_modified?: string
  total?: string
  customer_id?: number
  billing?: WooCommerceAddress
  shipping?: WooCommerceAddress
  payment_method?: string
  payment_method_title?: string
  line_items?: WooCommerceLineItem[]
  meta_data?: WooCommerceMetaData[]
}
