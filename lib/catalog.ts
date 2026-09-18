/**
 * THE CATALOG — the single source of truth for everything NOMA sells.
 *
 * ── Why this file is shaped the way it is ────────────────────────────────────
 *
 * 1. NOTHING HERE IS A FALLBACK. Every other piece of copy on this site follows
 *    the NGF pattern `content['hero.headline'] || 'Default'`, because a hero
 *    with no headline should still render something. A CATALOG is the opposite:
 *    a product, price or category that is shown but does not exist is worse
 *    than an empty shelf, because a customer can try to buy it. So the store
 *    surfaces FAIL CLOSED — an empty catalog renders an empty state, and an
 *    item that cannot be priced exactly is not offered for sale at all.
 *
 * 2. PRICES ARE INTEGER CENTS, never display strings. The previous model stored
 *    '$39' / 'From $39' and recovered a number with a regex at charge time,
 *    which is how a card could advertise one price while the checkout charged
 *    another. Money is a number here and becomes a string only at render.
 *
 * 3. BUNDLES ARE PRODUCTS. They used to live in a separate BUNDLES array with
 *    no route into the cart, so the site showed a price for something nobody
 *    could buy. A bundle is now an ordinary catalog entry with kind: 'bundle',
 *    priced and sold down the same path as everything else. The gap cannot
 *    reopen without someone deliberately reintroducing a second array.
 *
 * 4. THE TAXONOMY IS DERIVED, never declared. Metal and type filters are
 *    computed from the products actually present. Three hardcoded lists used to
 *    disagree with the catalog and with each other, so the site advertised
 *    Silver, Pearl, Rose Gold, Diamond, Earrings and Rings while stocking gold
 *    necklaces and bracelets.
 *
 * ── Where this data will eventually live ─────────────────────────────────────
 *
 * In the repo, for now, because the NGF platform has no product catalog: its
 * public API is content, leads, orders, store-settings, availability, bookings
 * and website — there is no products endpoint to read. When that exists,
 * getCatalog() is the ONLY function that has to change; nothing else in the
 * site reads the array directly.
 */

export type Cents = number

export interface CatalogVariant {
  /** Shown on the selector pill: '16"', 'Engraved', '7"'. */
  label: string
  priceCents: Cents
}

export interface CatalogProduct {
  id: string
  name: string
  kind: 'piece' | 'bundle'
  category: string
  metals: string[]
  description: string
  image: string
  images?: string[]
  /** A single price. Mutually exclusive with `variants`. */
  priceCents?: Cents
  /** Selectable options, each with its own price. */
  variants?: CatalogVariant[]
  /** Heading above the selector — 'Length', 'Size', 'Style'. */
  variantLabel?: string
  comparePriceCents?: Cents
  badge?: string
  customizable?: boolean
}

const CATALOG: CatalogProduct[] = [
  {
    id: 'sheri-necklace',
    name: 'Sheri Necklace',
    kind: 'piece',
    category: 'Necklaces',
    metals: ['Gold'],
    description:
      'Our effortlessly elegant stack starter, made magnetic! The Sheri Necklace features a sleek, modern silhouette and our signature magnetic ball closure—making it as functional as it is stylish. Perfect on its own, layered, or as a base for your next charm necklace!',
    image: '/assets/products/Necklace/Sheri/SHERI%20NECKLACE.jpg',
    images: [
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE.jpg',
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE2.jpg',
      '/assets/products/Necklace/Sheri/SHERI%20NECKLACE3.jpg',
    ],
    variantLabel: 'Length',
    variants: [
      { label: '16"', priceCents: 3900 },
      { label: '18"', priceCents: 4400 },
      { label: '20"', priceCents: 4900 },
    ],
  },
  {
    id: 'amie-necklace',
    name: 'Amie Necklace',
    kind: 'piece',
    category: 'Necklaces',
    metals: ['Gold'],
    description:
      'The Amie Necklace is the perfect everyday piece—simple, stylish, and easy to wear. Designed with a sleek gold finish and our signature magnetic heart clasp, it\'s made to elevate your stack with effortless charm.',
    image: '/assets/products/Necklace/Amie/AMIE%20NECKLACE%201.jpeg',
    images: [
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%201.jpeg',
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%202.jpeg',
      '/assets/products/Necklace/Amie/AMIE%20NECKLACE%203.jpeg',
    ],
    variantLabel: 'Length',
    variants: [
      { label: '16"', priceCents: 3900 },
      { label: '18"', priceCents: 4400 },
      { label: '20"', priceCents: 4900 },
    ],
  },
  {
    id: 'alaina-necklace',
    name: 'Alaina Necklace',
    kind: 'piece',
    category: 'Necklaces',
    metals: ['Gold'],
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
    variantLabel: 'Style',
    variants: [
      { label: 'Blank', priceCents: 4900 },
      { label: 'Engraved', priceCents: 5400 },
    ],
  },
  {
    id: 'mary-turquoise-drop-necklace',
    name: 'Mary Turquoise Drop Necklace',
    kind: 'piece',
    category: 'Necklaces',
    metals: ['Gold'],
    description:
      'The Mary Turquoise Drop Necklace features bright, show-stopping turquoise beads spaced along a radiant 18k gold plated chain for a timeless, effortless look. Lightweight and elegant, it\'s a perfect statement piece with a touch of grace and color.',
    image: '/assets/products/Necklace/Mary/MARY%20NECKLACE.jpeg',
    images: [
      '/assets/products/Necklace/Mary/MARY%20NECKLACE.jpeg',
      '/assets/products/Necklace/Mary/MARY%20NECKLACE2.jpeg',
      '/assets/products/Necklace/Mary/MARY%20NECKLACE3.jpeg',
    ],
    priceCents: 7900,
  },
  {
    id: 'paris-bracelet',
    name: 'Paris Bracelet',
    kind: 'piece',
    category: 'Bracelets',
    metals: ['Gold'],
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
    variantLabel: 'Style',
    variants: [
      { label: 'Blank', priceCents: 5400 },
      { label: 'Engraved', priceCents: 5900 },
    ],
  },
  {
    id: 'proverbs-herringbone-bracelet',
    name: 'Proverbs Herringbone Bracelet',
    kind: 'piece',
    category: 'Bracelets',
    metals: ['Gold'],
    description:
      'The Proverbs Herringbone Bracelet is a timeless statement of faith and elegance. Crafted with radiant 18k gold plating and designed for everyday wear, this sleek piece serves as a beautiful reminder to walk in wisdom, strength, and grace inspired by Scripture.',
    image: '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET.jpg',
    images: [
      '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET.jpg',
      '/assets/products/Bracelet/Proverbs%20Herringbone/PROVERBS%20HERRINGBONE%20BRACELET1.jpg',
    ],
    variantLabel: 'Size',
    variants: [
      { label: '6.5"', priceCents: 3800 },
      { label: '7"', priceCents: 4200 },
    ],
  },
  // Bundles. These were previously display-only cards with a price and no way
  // to buy them. NOTE FOR NOMA: both descriptions name a bracelet that is not
  // in this catalog ("Mary Turquoise necklace and Bracelet", "Sheri necklace
  // and bracelet"), so either those pieces need adding or the copy needs
  // correcting before these are promoted.
  {
    id: 'mary-bundle',
    name: 'Mary Bundle',
    kind: 'bundle',
    category: 'Bundles',
    metals: ['Gold'],
    description: 'Includes Mary Turquoise necklace and Bracelet.',
    image: '/assets/products/Necklace/Mary/MARY%20NECKLACE.jpeg',
    priceCents: 7999,
  },
  {
    id: 'sheri-bundle',
    name: 'Sheri Bundle',
    kind: 'bundle',
    category: 'Bundles',
    metals: ['Gold'],
    description: 'Includes Sheri necklace and bracelet.',
    image: '/assets/products/Necklace/Sheri/SHERI%20NECKLACE.jpg',
    priceCents: 7999,
  },
]

/**
 * The seam. Every consumer goes through this — no module reads CATALOG
 * directly — so swapping in a portal-backed catalog later is a one-function
 * change. Returns only entries that can actually be sold.
 */
export function getCatalog(): CatalogProduct[] {
  return CATALOG.filter(isSellable)
}

export function findProduct(id: string): CatalogProduct | undefined {
  return getCatalog().find((p) => p.id === id)
}

/**
 * A product is sellable only if every price it could charge is a positive
 * integer number of cents. A half-defined product is dropped from the catalog
 * entirely rather than rendered as a card that fails at the payment step.
 */
export function isSellable(product: CatalogProduct): boolean {
  const ok = (c: unknown): boolean => Number.isInteger(c) && (c as number) > 0
  if (product.variants && product.variants.length > 0) {
    return product.variants.every((v) => Boolean(v.label) && ok(v.priceCents))
  }
  return ok(product.priceCents)
}

/**
 * The exact amount to charge for one unit. Returns null — never a guess — when
 * the request does not name a real, priced variant of a real product. The
 * checkout refuses the whole order on null.
 */
export function unitPriceCents(
  product: CatalogProduct,
  variantLabel?: string | null,
): Cents | null {
  if (product.variants && product.variants.length > 0) {
    // A product with variants has no single price, so an unnamed variant is a
    // refusal rather than a fall back to the cheapest.
    if (!variantLabel) return null
    const match = product.variants.find((v) => v.label === variantLabel)
    return match ? match.priceCents : null
  }
  // A variant was named for a product that has none.
  if (variantLabel) return null
  return product.priceCents ?? null
}

export function formatCents(cents: Cents): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

/** Cheapest and priciest variant, by value — never by array position. */
export function priceRange(product: CatalogProduct): { min: Cents; max: Cents } | null {
  const prices = (product.variants ?? []).map((v) => v.priceCents)
  if (prices.length === 0) return null
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/**
 * What a card shows. 'From $39' for a range, '$79' for a single price, and
 * null when there is nothing honest to show — callers render no price rather
 * than a placeholder.
 */
export function displayPrice(product: CatalogProduct): string | null {
  const range = priceRange(product)
  if (range) {
    return range.min === range.max
      ? formatCents(range.min)
      : `From ${formatCents(range.min)}`
  }
  return product.priceCents ? formatCents(product.priceCents) : null
}

/**
 * The "3 lengths" / "blank or engraved" line under a price. Returns null when
 * there is no meaningful choice to advertise, so callers render nothing rather
 * than an empty element.
 */
export function variantCountLabel(product: CatalogProduct): string | null {
  const count = product.variants?.length ?? 0
  if (count < 2) return null
  if (product.variantLabel === 'Length') return `${count} lengths`
  if (product.variantLabel === 'Style') return 'blank or engraved'
  return `${count} sizes`
}

/** Metals actually present in the catalog, alphabetical. */
export function metalsInCatalog(products: CatalogProduct[]): string[] {
  return [...new Set(products.flatMap((p) => p.metals))].sort()
}

/**
 * Types actually present: real categories, plus the synthetic 'Engravable'
 * only when something is genuinely engravable.
 */
export function typesInCatalog(products: CatalogProduct[]): string[] {
  const categories = [...new Set(products.map((p) => p.category))].sort()
  return products.some((p) => p.customizable) ? [...categories, 'Engravable'] : categories
}

/** Shared by the homepage filters and the shop grid so they cannot disagree. */
export function filterProducts(
  products: CatalogProduct[],
  metals: Set<string>,
  types: Set<string>,
): CatalogProduct[] {
  return products.filter((p) => {
    const metalMatch =
      metals.size === 0 ||
      [...metals].some((m) => p.metals.some((x) => x.toLowerCase() === m.toLowerCase()))
    const typeMatch =
      types.size === 0 ||
      [...types].some((t) => (t === 'Engravable' ? p.customizable === true : p.category === t))
    return metalMatch && typeMatch
  })
}
