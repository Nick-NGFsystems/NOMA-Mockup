import { getNgfCatalog, type NgfProduct } from '@/lib/ngf-products'
import { FALLBACK_PRODUCTS, type Product } from '@/lib/site-data'

/**
 * NOMA's products, from wherever they live right now.
 *
 *   Products ON in the portal   the portal's list — shown, and charged
 *   Products OFF                FALLBACK_PRODUCTS, compiled into this repo — shown, and charged
 *   portal unreachable          FALLBACK_PRODUCTS shown so the shop still renders, but
 *                               `pricing` is null, so checkout refuses to take money
 *
 * `products` is for the page; `pricing` is what checkout charges from. They come
 * from the same list, so what a shopper sees is what they pay.
 */
export interface Catalog {
  products: Product[]
  pricing: NgfProduct[] | null
}

export async function getCatalog(options: { fresh?: boolean } = {}): Promise<Catalog> {
  const catalog = await getNgfCatalog(options)
  if (catalog.status === 'live') {
    return { products: catalog.products.map(toDisplay), pricing: catalog.products }
  }
  return {
    products: FALLBACK_PRODUCTS.map(toDisplay),
    pricing: catalog.status === 'off' ? FALLBACK_PRODUCTS : null,
  }
}

/** "$39", or "$39.50" when there are cents. */
export function displayPrice(cents: number): string {
  const dollars = cents / 100
  return Number.isInteger(dollars)
    ? `$${dollars.toLocaleString('en-US')}`
    : `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Shown when a product has no photo yet. */
const NO_PHOTO = '/assets/ring-placeholder.svg'

/** The catalog's shape → the strings the product components render. */
export function toDisplay(p: NgfProduct): Product {
  const hasOptions = p.options.length > 0
  const low = hasOptions ? Math.min(...p.options.map((o) => o.priceCents)) : (p.priceCents ?? 0)
  return {
    id: p.id,
    name: p.name,
    category: p.category ?? '',
    price: hasOptions && p.options.length > 1 ? `From ${displayPrice(low)}` : displayPrice(low),
    badge: p.badge ?? undefined,
    description: p.description,
    image: p.images[0] ?? NO_PHOTO,
    images: p.images.length > 0 ? p.images : [NO_PHOTO],
    customizable: p.personalizable,
    metals: p.tags,
    variants: hasOptions ? p.options.map((o) => ({ size: o.label, price: displayPrice(o.priceCents) })) : undefined,
    variantType: p.optionLabel ?? undefined,
    featured: p.featured,
  }
}

/**
 * The homepage's Best sellers: the products NOMA marks "Feature it on the
 * homepage" in the portal, or the first six when none are marked.
 */
export function bestSellers(products: Product[]): Product[] {
  const featured = products.filter((p) => p.featured)
  return (featured.length > 0 ? featured : products).slice(0, featured.length > 0 ? 12 : 6)
}
