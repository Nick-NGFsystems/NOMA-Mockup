export interface ProductVariant {
  size: string   // e.g. '16"', '18"', '6"', '7"'
  price: string  // e.g. '$39'
}

export interface Product {
  id: string
  name: string
  category: string
  price: string
  comparePrice?: string
  badge?: string
  description: string
  image: string
  images?: string[]
  customizable?: boolean
  metals?: string[]
  /** Selectable sizes / lengths with individual prices */
  variants?: ProductVariant[]
  /** Label shown above the selector — 'Length' for necklaces, 'Size' for bracelets */
  variantType?: string
}

export interface Bundle {
  id: string
  name: string
  description: string
  price: string
  comparePrice: string
  badge: string
}

export interface Review {
  id: string
  quote: string
  reviewer: string
}

/**
 * Parse an exact, chargeable price into cents. Returns null for anything
 * ambiguous.
 *
 * A base price may be a range ("From $39"), which is a MARKETING string, not a
 * chargeable amount. Anything not a single unambiguous price is refused.
 *
 * THIS IS THE ONLY PRICE PARSER. resolveCart() charges with it and the product
 * cards display with it, so a card cannot advertise a number the checkout would
 * not honour. If you add a second parser, you have reintroduced that gap.
 */
export function exactPriceToCents(raw: string): number | null {
  const text = String(raw).trim()
  // "From $39", "$39–$49", "$39 - $49" — all ambiguous, all refused.
  if (/from|to|–|—|\bor\b/i.test(text)) return null
  const matches = text.match(/\d+(?:\.\d+)?/g)
  if (!matches || matches.length !== 1) return null
  const n = Number(matches[0])
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100)
}

function formatCents(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

/**
 * The cheapest and priciest chargeable price for a product with variants,
 * computed from the variants themselves rather than assuming array order.
 * Returns null when nothing in the list can be priced exactly.
 *
 * Product prices are NOT portal-editable, by design: the catalog and its prices
 * live here, in the same module resolveCart() charges from, while the client
 * owns shipping, tax and policies in their portal Store tab (NGF-STANDARDS,
 * "Rules that are about money"). An editable price field that does not reach
 * the charge is a control that lies to the client.
 */
export function priceRange(product: Product): { min: string; max: string } | null {
  const cents = (product.variants ?? [])
    .map((v) => exactPriceToCents(v.price))
    .filter((n): n is number => n !== null)
  if (cents.length === 0) return null
  return { min: formatCents(Math.min(...cents)), max: formatCents(Math.max(...cents)) }
}

export const PRODUCTS: Product[] = [
  {
    id: 'sheri-necklace',
    name: 'Sheri Necklace',
    category: 'Necklaces',
    metals: ['Gold'],
    price: 'From $39',
    description:
      'Our effortlessly elegant stack starter, made magnetic! The Sheri Necklace features a sleek, modern silhouette and our signature magnetic ball closure—making it as functional as it is stylish. Perfect on its own, layered, or as a base for your next charm necklace!',
    image: '/assets/products/Necklace/Sheri/SHERI%20NECKLACE.jpg',
    images: [
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE.jpg',
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE2.jpg',
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE3.jpg',
    ],
    variantType: 'Length',
    variants: [
      { size: '16"', price: '$39' },
      { size: '18"', price: '$44' },
      { size: '20"', price: '$49' },
    ],
  },
  {
    id: 'amie-necklace',
    name: 'Amie Necklace',
    category: 'Necklaces',
    metals: ['Gold'],
    price: 'From $39',
    description:
      'The Amie Necklace is the perfect everyday piece—simple, stylish, and easy to wear. Designed with a sleek gold finish and our signature magnetic heart clasp, it\'s made to elevate your stack with effortless charm.',
    image: '/assets/products/Necklace/Amie/AMIE%20NECKLACE%201.jpeg',
    images: [
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%201.jpeg',
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%202.jpeg',
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%203.jpeg',
    ],
    variantType: 'Length',
    variants: [
      { size: '16"', price: '$39' },
      { size: '18"', price: '$44' },
      { size: '20"', price: '$49' },
    ],
  },
  {
    id: 'alaina-necklace',
    name: 'Alaina Necklace',
    category: 'Necklaces',
    metals: ['Gold'],
    price: 'From $49',
    description:
      'Meet Alaina — our customizable, everyday gold herringbone necklace. Whether you\'re layering it with your favorites or letting it shine on its own, the Alaina is perfect for daily wear & stack starting.',
    customizable: true,
    image: '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE.jpg',
    images: [
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%202.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%203.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%204.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%205.jpg',
    ],
    variantType: 'Style',
    variants: [
      { size: 'Blank',    price: '$49' },
      { size: 'Engraved', price: '$54' },
    ],
  },
  {
    id: 'mary-turquoise-drop-necklace',
    name: 'Mary Turquoise Drop Necklace',
    category: 'Necklaces',
    metals: ['Gold'],
    price: '$79',
    description:
      'The Mary Turquoise Drop Necklace features bright, show-stopping turquoise beads spaced along a radiant 18k gold plated chain for a timeless, effortless look. Lightweight and elegant, it\'s a perfect statement piece with a touch of grace and color.',
    image: '/assets/products/Necklace/Mary/MARY%20NECKLACE.jpeg',
    images: [
      '/assets/products/Necklace/Mary/MARY%20NECKLACE.jpeg',
      '/assets/products/Necklace/Mary/MARY%20NECKLACE2.jpeg',
      '/assets/products/Necklace/Mary/MARY%20NECKLACE3.jpeg',
    ],
  },
  {
    id: 'paris-bracelet',
    name: 'Paris Bracelet',
    category: 'Bracelets',
    metals: ['Gold'],
    price: 'From $54',
    description: 'Your new favorite carabiner-clasp bracelet, fully customizable!',
    customizable: true,
    image: '/assets/products/Bracelet/Paris/PARIS%20BRACELET.jpg',
    images: [
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%202.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%203.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%204.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%205.jpg',
    ],
    variantType: 'Style',
    variants: [
      { size: 'Blank',    price: '$54' },
      { size: 'Engraved', price: '$59' },
    ],
  },
  {
    id: 'proverbs-herringbone-bracelet',
    name: 'Proverbs Herringbone Bracelet',
    category: 'Bracelets',
    metals: ['Gold'],
    price: 'From $38',
    description:
      'The Proverbs Herringbone Bracelet is a timeless statement of faith and elegance. Crafted with radiant 18k gold plating and designed for everyday wear, this sleek piece serves as a beautiful reminder to walk in wisdom, strength, and grace inspired by Scripture.',
    image: '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET.jpg',
    images: [
      '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET.jpg',
      '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET1.jpg',
    ],
    variantType: 'Size',
    variants: [
      { size: '6.5"', price: '$38' },
      { size: '7"',   price: '$42' },
    ],
  },
]

export const BUNDLES: Bundle[] = [
  {
    id: 'mary-bundle',
    name: 'Mary Bundle',
    description: 'Includes Mary Turquoise necklace and Bracelet.',
    price: '$79.99',
    comparePrice: '',
    badge: '',
  },
  {
    id: 'sheri-bundle',
    name: 'Sheri Bundle',
    description: 'Includes Sheri necklace and bracelet.',
    price: '$79.99',
    comparePrice: '',
    badge: '',
  },
]

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    quote: 'Placeholder review #1. Replace with real customer feedback.',
    reviewer: 'Sample Reviewer',
  },
  {
    id: 'r2',
    quote: 'Placeholder review #2. Add a verified quote here.',
    reviewer: 'Testimonial Name',
  },
  {
    id: 'r3',
    quote: 'Placeholder review #3. Keep tone consistent with your brand.',
    reviewer: 'Customer Name',
  },
  {
    id: 'r4',
    quote: 'Placeholder review #4. Swap in final copy later.',
    reviewer: 'Sample Name',
  },
]

export const CATEGORIES = ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Anklets', 'Gifts']
export const MATERIALS = ['Gold', 'Silver', 'Rose Gold', 'Pearl', 'Diamond', 'Platinum']
