import type { NgfProduct } from '@/lib/ngf-products'

/**
 * The DISPLAY shape the product components render: prices as the strings a
 * shopper reads. Built from the catalog by lib/catalog.ts (toDisplay); never
 * the source of a charge — checkout prices from the catalog itself.
 */
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
  /** Marked for the homepage's Best sellers in the portal. */
  featured?: boolean
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
 * NOMA's products as compiled into this site — the FALLBACK, in the portal's
 * own shape (lib/ngf-products.ts). Used, for display and for charging alike,
 * only while Products is switched OFF for NOMA in the portal; once it is on,
 * the portal's list is the only one (lib/catalog.ts).
 *
 * `docs/ngf-products-import.json` is this list as the portal's Import takes it.
 * The ids are what live carts already hold, so the import keeps them.
 */
export const FALLBACK_PRODUCTS: NgfProduct[] = [
  {
    id: 'sheri-necklace',
    name: 'Sheri Necklace',
    category: 'Necklaces',
    description:
      'Our effortlessly elegant stack starter, made magnetic! The Sheri Necklace features a sleek, modern silhouette and our signature magnetic ball closure—making it as functional as it is stylish. Perfect on its own, layered, or as a base for your next charm necklace!',
    priceCents: null,
    optionLabel: 'Length',
    options: [
      { label: '16"', priceCents: 3900 },
      { label: '18"', priceCents: 4400 },
      { label: '20"', priceCents: 4900 },
    ],
    images: [
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE.jpg',
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE2.jpg',
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE3.jpg',
    ],
    personalizable: false,
    tags: ['Gold'],
    badge: null,
    featured: false,
  },
  {
    id: 'amie-necklace',
    name: 'Amie Necklace',
    category: 'Necklaces',
    description:
      'The Amie Necklace is the perfect everyday piece—simple, stylish, and easy to wear. Designed with a sleek gold finish and our signature magnetic heart clasp, it\'s made to elevate your stack with effortless charm.',
    priceCents: null,
    optionLabel: 'Length',
    options: [
      { label: '16"', priceCents: 3900 },
      { label: '18"', priceCents: 4400 },
      { label: '20"', priceCents: 4900 },
    ],
    images: [
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%201.jpeg',
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%202.jpeg',
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%203.jpeg',
    ],
    personalizable: false,
    tags: ['Gold'],
    badge: null,
    featured: false,
  },
  {
    id: 'alaina-necklace',
    name: 'Alaina Necklace',
    category: 'Necklaces',
    description:
      'Meet Alaina — our customizable, everyday gold herringbone necklace. Whether you\'re layering it with your favorites or letting it shine on its own, the Alaina is perfect for daily wear & stack starting.',
    priceCents: null,
    optionLabel: 'Style',
    options: [
      { label: 'Blank', priceCents: 4900 },
      { label: 'Engraved', priceCents: 5400 },
    ],
    images: [
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%202.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%203.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%204.jpg',
      '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%205.jpg',
    ],
    personalizable: true,
    tags: ['Gold'],
    badge: null,
    featured: false,
  },
  {
    id: 'mary-turquoise-drop-necklace',
    name: 'Mary Turquoise Drop Necklace',
    category: 'Necklaces',
    description:
      'The Mary Turquoise Drop Necklace features bright, show-stopping turquoise beads spaced along a radiant 18k gold plated chain for a timeless, effortless look. Lightweight and elegant, it\'s a perfect statement piece with a touch of grace and color.',
    priceCents: 7900,
    optionLabel: null,
    options: [],
    images: [
      '/assets/products/Necklace/Mary/MARY%20NECKLACE.jpeg',
      '/assets/products/Necklace/Mary/MARY%20NECKLACE2.jpeg',
      '/assets/products/Necklace/Mary/MARY%20NECKLACE3.jpeg',
    ],
    personalizable: false,
    tags: ['Gold'],
    badge: null,
    featured: false,
  },
  {
    id: 'paris-bracelet',
    name: 'Paris Bracelet',
    category: 'Bracelets',
    description: 'Your new favorite carabiner-clasp bracelet, fully customizable!',
    priceCents: null,
    optionLabel: 'Style',
    options: [
      { label: 'Blank', priceCents: 5400 },
      { label: 'Engraved', priceCents: 5900 },
    ],
    images: [
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%202.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%203.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%204.jpg',
      '/assets/products/Bracelet/Paris/PARIS%20BRACELET%205.jpg',
    ],
    personalizable: true,
    tags: ['Gold'],
    badge: null,
    featured: false,
  },
  {
    id: 'proverbs-herringbone-bracelet',
    name: 'Proverbs Herringbone Bracelet',
    category: 'Bracelets',
    description:
      'The Proverbs Herringbone Bracelet is a timeless statement of faith and elegance. Crafted with radiant 18k gold plating and designed for everyday wear, this sleek piece serves as a beautiful reminder to walk in wisdom, strength, and grace inspired by Scripture.',
    priceCents: null,
    optionLabel: 'Size',
    options: [
      { label: '6.5"', priceCents: 3800 },
      { label: '7"', priceCents: 4200 },
    ],
    images: [
      '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET.jpg',
      '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET1.jpg',
    ],
    personalizable: false,
    tags: ['Gold'],
    badge: null,
    featured: false,
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
