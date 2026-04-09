import { truncateText } from '@/lib/utils'
import { WooCommerceProduct } from '@/types/woocommerce'
import {
  ProductClassification,
  classifyProduct,
  familyLabelFromFamily,
  joinSpecValues,
  stripHtml,
} from '@/lib/product-format'
import {
  buildProductWhatsAppMessage,
  STORE_LOCATION,
} from '@/lib/site'

export interface ProductCopy {
  brandLabel: string
  familyLabel: string
  conditionLabel: string
  summary: string
  cardSummary: string
  metaDescription: string
  verifiedSpecs: ProductClassification['specs']
  idealFor: string[]
  whyBuy: string[]
  trustNotes: string[]
  availabilityNote: string
  whatsappMessage: string
  displayTitle: string
  schemaBrandName: string
}

const FAMILY_FOCUS: Record<string, string> = {
  phone: 'Good for calls, WhatsApp, photos, and everyday use.',
  laptop: 'Good for work, study, browsing, and meetings.',
  tablet: 'Good for reading, streaming, school apps, and browsing.',
  watch: 'Good for notifications, activity tracking, and everyday wear.',
  audio: 'Good for music, calls, and daily listening.',
  accessory: 'Good for replacement use, charging, and daily support.',
  gaming: 'Good for gaming, media, and entertainment.',
  other: 'Good for everyday use and local support.',
}

const IDEAL_FOR: Record<string, string[]> = {
  phone: ['Calls and WhatsApp', 'Photos and social apps', 'Work and daily communication', 'Travel and backup use'],
  laptop: ['Work and school', 'Browsing and email', 'Meetings and video calls', 'Light content creation'],
  tablet: ['Reading and learning', 'Streaming and browsing', 'School apps', 'Portable everyday use'],
  watch: ['Notifications and fitness', 'Daily wear', 'Quick checks on the go', 'Light productivity'],
  audio: ['Music and media', 'Calls and meetings', 'Travel use', 'Everyday listening'],
  accessory: ['Charging and backup', 'Replacement use', 'Travel support', 'Daily convenience'],
  gaming: ['Gaming and entertainment', 'Media use', 'Home setup', 'Everyday leisure'],
  other: ['Everyday use', 'Local support', 'Quick stock checks', 'WhatsApp ordering'],
}

const WHY_BUY = [
  'Nairobi-based support and quick replies',
  'Quality-checked devices before sale',
  'WhatsApp stock confirmation before checkout',
  'Clear condition notes where available',
]

const TRUST_NOTES = [
  'Tested before sale',
  'Condition shown clearly',
  'WhatsApp-first support',
  `Nairobi pickup or dispatch from ${STORE_LOCATION}`,
]

function getSupportingSpecs(classification: ProductClassification): ProductClassification['specs'] {
  const title = classification.title.toLowerCase()

  return classification.specs.filter(
    (spec) => !title.includes(spec.value.toLowerCase())
  )
}

function formatConditionSentence(conditionLabel: string): string {
  if (conditionLabel === 'Confirm on WhatsApp') {
    return 'Condition details can be confirmed on WhatsApp.'
  }

  if (conditionLabel === 'Brand new') {
    return 'Brand new and ready to use.'
  }

  return `${conditionLabel} and tested.`
}

function buildSummary(classification: ProductClassification): string {
  const supportingSpecs = getSupportingSpecs(classification)
  const specSentence = joinSpecValues(supportingSpecs, 2)
  const headline = specSentence
    ? `${classification.title} with ${specSentence}`
    : classification.title
  const familySentence = FAMILY_FOCUS[classification.family] || FAMILY_FOCUS.other
  const conditionSentence = formatConditionSentence(classification.condition)

  return `${headline}. ${familySentence} ${conditionSentence} Available in Nairobi.`
}

function buildCardSummary(classification: ProductClassification): string {
  const values = []

  const specSentence = joinSpecValues(getSupportingSpecs(classification), 1)
  if (specSentence) values.push(specSentence)

  if (classification.condition !== 'Confirm on WhatsApp') {
    values.push(classification.condition)
  }

  values.push('Nairobi support')

  return values.join(' • ')
}

function buildMetaDescription(summary: string): string {
  return truncateText(
    `${stripHtml(summary)} Message MobDeals on WhatsApp to confirm stock, price, and delivery.`,
    160
  )
}

function buildAvailabilityNote(classification: ProductClassification): string {
  if (classification.condition === 'Confirm on WhatsApp') {
    return 'Stock can change quickly. Message us on WhatsApp to confirm availability and alternatives.'
  }

  return 'Available in Nairobi. Message us on WhatsApp to confirm stock, condition, and delivery.'
}

function buildWhatsAppMessage(classification: ProductClassification): string {
  const details = []
  const specSentence = joinSpecValues(getSupportingSpecs(classification), 2)

  if (specSentence) {
    details.push(specSentence)
  }

  return buildProductWhatsAppMessage(
    classification.title,
    details,
    classification.condition
  )
}

export function getProductCopy(product: WooCommerceProduct): ProductCopy {
  const classification = classifyProduct(product)
  const summary = buildSummary(classification)

  return {
    brandLabel: classification.brand || '',
    familyLabel: familyLabelFromFamily(classification.family),
    conditionLabel: classification.condition,
    summary,
    cardSummary: buildCardSummary(classification),
    metaDescription: buildMetaDescription(summary),
    verifiedSpecs: classification.specs,
    idealFor: IDEAL_FOR[classification.family] || IDEAL_FOR.other,
    whyBuy: WHY_BUY,
    trustNotes: TRUST_NOTES,
    availabilityNote: buildAvailabilityNote(classification),
    whatsappMessage: buildWhatsAppMessage(classification),
    displayTitle: classification.title,
    schemaBrandName: classification.brand || 'MobDeals',
  }
}
