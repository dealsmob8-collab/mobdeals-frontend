import { formatPrice } from '@/lib/utils'
import type { Cart } from '@/types/woocommerce'

export const SITE_NAME = 'MobDeals'
export const SITE_TAGLINE = 'Phones, laptops, and everyday tech deals in Nairobi'
export const SITE_DESCRIPTION =
  'Tested phones, laptops, and accessories with quick WhatsApp support from MobDeals in Nairobi.'
export const SITE_URL = 'https://shop.mobdeals.co.ke'
export const WHATSAPP_NUMBER = '254701499849'
export const WHATSAPP_DISPLAY = '+254 701 499 849'
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`
export const SUPPORT_EMAIL = 'support@mobdeals.co.ke'
export const STORE_LOCATION = 'Moi Avenue, Tembo House Cooperative, Nairobi'
export const STORE_HOURS = 'Mon-Sat: 9:00 AM - 7:00 PM'
export const GOOGLE_MAPS_URL =
  'https://maps.google.com/?q=Moi+Avenue+Tembo+House+Cooperative+Nairobi'
export const DEFAULT_WHATSAPP_MESSAGE =
  'Hi MobDeals, I need help with stock and price.'

export function buildWhatsAppUrl(message: string): string {
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
}

export function buildProductWhatsAppMessage(
  productName: string,
  details: string[] = [],
  condition?: string
): string {
  const lines = [`Hi MobDeals, I am interested in ${productName}.`]

  if (details.length > 0) {
    lines.push(`Verified details: ${details.join(', ')}.`)
  }

  if (condition && condition !== 'Confirm on WhatsApp') {
    lines.push(`Condition: ${condition}.`)
  }

  lines.push('Please confirm stock, price, and delivery in Nairobi.')

  return lines.join(' ')
}

export function buildCartWhatsAppMessage(cart: Pick<Cart, 'items' | 'total'>): string {
  const lines = ['Hi MobDeals, I want to complete my order.']

  if (cart.items.length > 0) {
    lines.push('Items:')

    for (const item of cart.items) {
      const itemName = item.name || `Product ${item.product_id}`
      lines.push(`- ${item.quantity} x ${itemName}`)
    }
  }

  if (cart.total > 0) {
    lines.push(`Cart total: ${formatPrice(cart.total)}`)
  }

  lines.push('Please confirm stock and delivery in Nairobi.')

  return lines.join('\n')
}
