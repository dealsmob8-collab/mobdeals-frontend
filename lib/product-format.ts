import { WooCommerceAttribute, WooCommerceProduct } from '@/types/woocommerce'

export type ProductFamily =
  | 'phone'
  | 'laptop'
  | 'tablet'
  | 'watch'
  | 'audio'
  | 'accessory'
  | 'gaming'
  | 'other'

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductClassification {
  brand?: string
  family: ProductFamily
  condition: string
  specs: ProductSpec[]
  searchText: string
  title: string
}

const BRAND_RULES: Array<{ label: string; patterns: RegExp[] }> = [
  {
    label: 'Apple',
    patterns: [/\bapple\b/i, /\biphone\b/i, /\bipad\b/i, /\bmacbook\b/i, /\bairpods?\b/i],
  },
  {
    label: 'Samsung',
    patterns: [/\bsamsung\b/i, /\bgalaxy\b/i],
  },
  {
    label: 'Xiaomi',
    patterns: [/\bxiaomi\b/i, /\bredmi\b/i, /\bpoco\b/i],
  },
  {
    label: 'Oppo',
    patterns: [/\boppo\b/i],
  },
  {
    label: 'Vivo',
    patterns: [/\bvivo\b/i],
  },
  {
    label: 'Nokia',
    patterns: [/\bnokia\b/i],
  },
  {
    label: 'Infinix',
    patterns: [/\binfinix\b/i],
  },
  {
    label: 'Tecno',
    patterns: [/\btecno\b/i],
  },
  {
    label: 'Itel',
    patterns: [/\bitel\b/i],
  },
  {
    label: 'Dell',
    patterns: [/\bdell\b/i, /\blatitude\b/i, /\bprecision\b/i, /\bxps\b/i],
  },
  {
    label: 'HP',
    patterns: [/\bhp\b/i, /\bprobook\b/i, /\belitebook\b/i, /\bpavilion\b/i],
  },
  {
    label: 'Lenovo',
    patterns: [/\blenovo\b/i, /\bthinkpad\b/i, /\blegion\b/i],
  },
  {
    label: 'Acer',
    patterns: [/\bacer\b/i, /\baspire\b/i, /\bnitro\b/i],
  },
  {
    label: 'Asus',
    patterns: [/\basus\b/i, /\brog\b/i, /\bzenbook\b/i, /\bvivobook\b/i],
  },
  {
    label: 'Sony',
    patterns: [/\bsony\b/i, /\bplaystation\b/i, /\bps\d\b/i],
  },
  {
    label: 'JBL',
    patterns: [/\bjbl\b/i],
  },
  {
    label: 'Anker',
    patterns: [/\banker\b/i],
  },
  {
    label: 'Google',
    patterns: [/\bgoogle\b/i, /\bpixel\b/i],
  },
  {
    label: 'Motorola',
    patterns: [/\bmotorola\b/i, /\bmoto\b/i],
  },
  {
    label: 'OnePlus',
    patterns: [/\boneplus\b/i],
  },
  {
    label: 'Realme',
    patterns: [/\brealme\b/i],
  },
  {
    label: 'Honor',
    patterns: [/\bhonor\b/i],
  },
]

const FAMILY_RULES: Array<{ family: ProductFamily; patterns: RegExp[] }> = [
  {
    family: 'laptop',
    patterns: [
      /\blaptop\b/i,
      /\bnotebook\b/i,
      /\bmacbook\b/i,
      /\bchromebook\b/i,
      /\bthinkpad\b/i,
      /\blatitude\b/i,
      /\bprobook\b/i,
      /\belitebook\b/i,
      /\bprecision\b/i,
      /\bvivobook\b/i,
      /\bzenbook\b/i,
      /\bpavilion\b/i,
      /\baspire\b/i,
    ],
  },
  {
    family: 'tablet',
    patterns: [/\btablet\b/i, /\bipad\b/i],
  },
  {
    family: 'watch',
    patterns: [/\bwatch\b/i, /\bsmartwatch\b/i],
  },
  {
    family: 'audio',
    patterns: [/\bheadphone\b/i, /\bearbud\b/i, /\bearphone\b/i, /\bspeaker\b/i, /\bairpods?\b/i],
  },
  {
    family: 'accessory',
    patterns: [
      /\bcharger\b/i,
      /\bcable\b/i,
      /\bcase\b/i,
      /\bcover\b/i,
      /\bscreen protector\b/i,
      /\bscreen guard\b/i,
      /\bpower bank\b/i,
      /\badapter\b/i,
      /\bmouse\b/i,
      /\bkeyboard\b/i,
      /\bbag\b/i,
      /\baccessory\b/i,
    ],
  },
  {
    family: 'gaming',
    patterns: [/\bplaystation\b/i, /\bxbox\b/i, /\bnintendo\b/i, /\bgaming\b/i],
  },
  {
    family: 'phone',
    patterns: [
      /\bphone\b/i,
      /\bsmartphone\b/i,
      /\bmobile\b/i,
      /\biphone\b/i,
      /\bandroid\b/i,
      /\bgalaxy\b/i,
      /\bredmi\b/i,
      /\bpoco\b/i,
      /\bnokia\b/i,
      /\binfinix\b/i,
      /\btecno\b/i,
      /\bvivo\b/i,
      /\boppo\b/i,
      /\bhuawei\b/i,
      /\bpixel\b/i,
      /\boneplus\b/i,
    ],
  },
]

const CONDITION_RULES: Array<{ label: string; patterns: RegExp[] }> = [
  {
    label: 'Brand new',
    patterns: [/\bbrand new\b/i, /\bsealed\b/i, /\bunused\b/i],
  },
  {
    label: 'Ex-UK',
    patterns: [/\bex[-\s]?uk\b/i, /\buk used\b/i],
  },
  {
    label: 'Ex-US',
    patterns: [/\bex[-\s]?us\b/i, /\bus used\b/i],
  },
  {
    label: 'Refurbished',
    patterns: [/\brefurb(?:ished)?\b/i, /\brenewed\b/i, /\breconditioned\b/i, /\bcertified pre[-\s]?owned\b/i],
  },
  {
    label: 'Open box',
    patterns: [/\bopen box\b/i],
  },
  {
    label: 'Used',
    patterns: [/\bused\b/i, /\bpre[-\s]?owned\b/i, /\bsecond hand\b/i],
  },
  {
    label: 'Grade A',
    patterns: [/\bgrade\s*a\b/i],
  },
  {
    label: 'Grade B',
    patterns: [/\bgrade\s*b\b/i],
  },
  {
    label: 'Grade C',
    patterns: [/\bgrade\s*c\b/i],
  },
]

const SPEC_PRIORITY = ['Storage', 'RAM', 'Screen', 'Processor', 'Battery', 'Connectivity', 'SIM', 'Colour', 'Camera']

const SPEC_ATTRIBUTE_RULES: Array<{ label: string; patterns: RegExp[] }> = [
  { label: 'Storage', patterns: [/\bstorage\b/i, /\brom\b/i, /\bssd\b/i, /\bhdd\b/i, /\bmemory\b/i] },
  { label: 'RAM', patterns: [/\bram\b/i] },
  { label: 'Screen', patterns: [/\bscreen\b/i, /\bdisplay\b/i, /\bsize\b/i] },
  { label: 'Processor', patterns: [/\bprocessor\b/i, /\bchip\b/i, /\bcpu\b/i, /\bsoc\b/i] },
  { label: 'Battery', patterns: [/\bbattery\b/i] },
  { label: 'Connectivity', patterns: [/\bnetwork\b/i, /\bconnectivity\b/i, /\bdata\b/i] },
  { label: 'SIM', patterns: [/\bsim\b/i] },
  { label: 'Colour', patterns: [/\bcolor\b/i, /\bcolour\b/i] },
  { label: 'Camera', patterns: [/\bcamera\b/i] },
]

export function normalizeText(value: string | undefined | null): string {
  return (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim()
}

export function stripHtml(value: string): string {
  return normalizeText(value.replace(/<[^>]+>/g, ' '))
}

export function getProductSearchText(product: WooCommerceProduct): string {
  const parts: string[] = [
    product.name,
    product.short_description,
    product.description,
    product.sku,
    ...(product.categories || []).map((category) => category.name),
    ...(product.tags || []).map((tag) => tag.name),
  ]

  for (const attribute of product.attributes || []) {
    parts.push(attribute.name)
    parts.push(...attribute.options)
  }

  return stripHtml(parts.filter(Boolean).join(' ')).toLowerCase()
}

export function inferProductFamily(product: WooCommerceProduct): ProductFamily {
  const text = getProductSearchText(product)

  for (const rule of FAMILY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.family
    }
  }

  return 'other'
}

export function inferProductBrand(product: WooCommerceProduct): string | undefined {
  const text = getProductSearchText(product)

  for (const rule of BRAND_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.label
    }
  }

  return undefined
}

export function inferProductCondition(product: WooCommerceProduct): string {
  const text = getProductSearchText(product)

  for (const rule of CONDITION_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.label
    }
  }

  return 'Confirm on WhatsApp'
}

export function cleanProductTitle(title: string, brand?: string): string {
  let cleaned = normalizeText(title)

  if (brand === 'Apple') {
    cleaned = cleaned
      .replace(/\bAndroid Phone\b/gi, '')
      .replace(/\bAndroid\b/gi, '')
  }

  cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()

  return cleaned || normalizeText(title)
}

function specPriority(label: string): number {
  const index = SPEC_PRIORITY.indexOf(label)
  return index === -1 ? SPEC_PRIORITY.length : index
}

function addSpec(specs: Map<string, string>, label: string, value: string | undefined | null): void {
  const normalized = normalizeText(value)
  if (!normalized || specs.has(label)) return
  specs.set(label, normalized)
}

function isLikelyRamValue(value: string): boolean {
  const normalized = normalizeText(value)
  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/)

  if (numberMatch) {
    return Number(numberMatch[1]) <= 128
  }

  return normalized.length > 0 && normalized.length <= 16
}

function extractSpecsFromAttributes(product: WooCommerceProduct, specs: Map<string, string>): void {
  for (const attribute of product.attributes || []) {
    const attributeName = normalizeText(attribute.name).toLowerCase()
    const attributeValue = normalizeText(attribute.options.join(', '))

    if (!attributeValue) continue

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'Storage' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'Storage', attributeValue)
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'RAM' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      if (isLikelyRamValue(attributeValue)) {
        addSpec(specs, 'RAM', attributeValue)
      }
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'Screen' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'Screen', attributeValue)
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'Processor' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'Processor', attributeValue)
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'Battery' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'Battery', attributeValue)
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'Connectivity' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'Connectivity', attributeValue)
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'SIM' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'SIM', attributeValue)
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'Colour' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'Colour', attributeValue)
      continue
    }

    if (SPEC_ATTRIBUTE_RULES.some((rule) => rule.label === 'Camera' && rule.patterns.some((pattern) => pattern.test(attributeName)))) {
      addSpec(specs, 'Camera', attributeValue)
      continue
    }
  }
}

function extractSpecsFromText(product: WooCommerceProduct, specs: Map<string, string>): void {
  const text = getProductSearchText(product)

  if (!specs.has('RAM')) {
    const ramMatch = text.match(/\b(\d+(?:\.\d+)?)\s?gb\s?ram\b/i)
    if (ramMatch && Number(ramMatch[1]) <= 128) {
      addSpec(specs, 'RAM', `${ramMatch[1]}GB`)
    }
  }

  if (!specs.has('Storage')) {
    const storageMatches = Array.from(text.matchAll(/\b(\d+(?:\.\d+)?)\s?(tb|gb)\b/gi))

    for (const match of storageMatches) {
      const index = match.index || 0
      const before = text.slice(Math.max(0, index - 16), index)
      const after = text.slice(index + match[0].length, index + match[0].length + 16)
      const context = `${before} ${after}`

      if (/ram|battery|screen|display/.test(context)) {
        continue
      }

      addSpec(specs, 'Storage', `${match[1]}${match[2].toUpperCase()}`)
      break
    }
  }

  if (!specs.has('Screen')) {
    const screenMatch = text.match(/\b(\d+(?:\.\d+)?)\s?(?:inch|in|")\b/i)
    if (screenMatch) {
      addSpec(specs, 'Screen', `${screenMatch[1]} inch`)
    }
  }

  if (!specs.has('Battery')) {
    const batteryMatch = text.match(/\b(\d{3,5})\s?mah\b/i)
    if (batteryMatch) {
      addSpec(specs, 'Battery', `${batteryMatch[1]} mAh`)
    }
  }

  if (!specs.has('Connectivity')) {
    if (/\b5g\b/i.test(text)) {
      addSpec(specs, 'Connectivity', '5G')
    } else if (/\b4g\b/i.test(text)) {
      addSpec(specs, 'Connectivity', '4G')
    } else if (/\bdual sim\b/i.test(text)) {
      addSpec(specs, 'Connectivity', 'Dual SIM')
    }
  }
}

export function extractVerifiedSpecs(product: WooCommerceProduct): ProductSpec[] {
  const specs = new Map<string, string>()

  extractSpecsFromAttributes(product, specs)
  extractSpecsFromText(product, specs)

  return Array.from(specs.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => specPriority(left.label) - specPriority(right.label))
}

export function familyLabelFromFamily(family: ProductFamily): string {
  switch (family) {
    case 'phone':
      return 'Phone'
    case 'laptop':
      return 'Laptop'
    case 'tablet':
      return 'Tablet'
    case 'watch':
      return 'Watch'
    case 'audio':
      return 'Audio'
    case 'accessory':
      return 'Accessory'
    case 'gaming':
      return 'Gaming'
    default:
      return 'Product'
  }
}

export function classifyProduct(product: WooCommerceProduct): ProductClassification {
  const brand = inferProductBrand(product)
  const title = cleanProductTitle(product.name, brand)
  const searchText = getProductSearchText(product)

  return {
    brand,
    family: inferProductFamily(product),
    condition: inferProductCondition(product),
    specs: extractVerifiedSpecs(product),
    searchText,
    title,
  }
}

export function joinSpecValues(specs: ProductSpec[], limit: number = specs.length): string {
  const values = specs.slice(0, limit).map((spec) => spec.value).filter(Boolean)

  if (values.length === 0) {
    return ''
  }

  if (values.length === 1) {
    return values[0]
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`
  }

  return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`
}
