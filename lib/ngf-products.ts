import { ngfEndpoints } from '@/lib/ngf'
import { PRODUCTS, type Product, type ProductVariant } from '@/lib/site-data'

/**
 * The shop's catalogue: the products and prices NOMA enters in the NGF portal
 * (Products page), read from GET /api/public/products.
 *
 * ONE LIST FOR WHAT A CUSTOMER SEES AND WHAT CHECKOUT CHARGES. The shop page,
 * the home page, the checkout page and /api/checkout all read the catalogue
 * through this file. Before it existed, prices lived in lib/site-data.ts while
 * the portal editor could relabel them, so an edited price changed what a
 * customer saw and not what they paid.
 *
 * Three answers from the portal, three behaviours (the contract is in the NGF
 * app's docs/orders.md → Products):
 *
 *   - products        → the catalogue, for display and checkout.
 *   - none ([] or 404) → NOMA has not entered products yet (or the app predates
 *                        the feature): keep selling the built-in list in
 *                        lib/site-data.ts, exactly as before.
 *   - error           → the catalogue exists but cannot be read right now. The
 *                        pages fall back to the built-in list so the shop still
 *                        renders, but CHECKOUT REFUSES: charging built-in prices
 *                        that NOMA may have changed since is how a customer gets
 *                        charged a number nobody chose.
 *
 * Cached for 60 s with the same fetch options as getNgfContent(), and busted
 * with it: the portal pings /api/revalidate after every product change, and
 * revalidatePath('/', 'layout') drops this fetch too.
 */

interface PortalOption {
  label: string
  priceCents: number
}

interface PortalProduct {
  id: string
  name: string
  category: string | null
  description: string
  images: string[]
  priceCents: number | null
  optionName: string | null
  options: PortalOption[]
  customizable: boolean
  featured: boolean
  tags: string[]
}

export interface Catalog {
  /** 'portal' once NOMA has entered products; 'built-in' until then. */
  source: 'portal' | 'built-in'
  products: Product[]
}

type Fetched = { kind: 'products'; products: PortalProduct[] } | { kind: 'none' } | { kind: 'error' }

/** Shown for a product saved without photos, so a card never renders a broken image. */
const NO_PHOTO = '/assets/logos/noma-logo-primary.png'

const isPositiveCents = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0

/** A product exactly as the portal sent it, or null if it cannot be sold safely. */
function parsePortalProduct(raw: unknown): PortalProduct | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (typeof p.id !== 'string' || !p.id || typeof p.name !== 'string' || !p.name) return null

  const options: PortalOption[] = []
  if (Array.isArray(p.options)) {
    for (const o of p.options) {
      const opt = o as { label?: unknown; priceCents?: unknown } | null
      if (!opt || typeof opt.label !== 'string' || !opt.label || !isPositiveCents(opt.priceCents)) return null
      options.push({ label: opt.label, priceCents: opt.priceCents })
    }
  }
  const priceCents = isPositiveCents(p.priceCents) ? p.priceCents : null
  if (options.length === 0 && priceCents === null) return null

  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x !== '') : [])
  return {
    id: p.id,
    name: p.name,
    category: typeof p.category === 'string' && p.category ? p.category : null,
    description: typeof p.description === 'string' ? p.description : '',
    images: strings(p.images).filter((src) => src.startsWith('https://')),
    priceCents: options.length > 0 ? null : priceCents,
    optionName: typeof p.optionName === 'string' && p.optionName ? p.optionName : null,
    options,
    customizable: p.customizable === true,
    featured: p.featured === true,
    tags: strings(p.tags),
  }
}

async function fetchPortalCatalog(): Promise<Fetched> {
  try {
    const { base, domain } = ngfEndpoints()
    const res = await fetch(`${base}/api/public/products?domain=${encodeURIComponent(domain)}`, {
      next: { revalidate: 60, tags: ['ngf-content'] },
    })
    // An NGF app from before the Products page has no such route: nothing entered.
    if (res.status === 404) return { kind: 'none' }
    if (!res.ok) return { kind: 'error' }

    const json = (await res.json()) as { products?: unknown }
    if (!Array.isArray(json.products)) return { kind: 'error' }
    if (json.products.length === 0) return { kind: 'none' }

    const products = json.products.map(parsePortalProduct).filter((p): p is PortalProduct => p !== null)
    // Products were entered but none could be read: that is a failure, not an
    // empty shop — falling back to the built-in list here would sell stale prices.
    return products.length > 0 ? { kind: 'products', products } : { kind: 'error' }
  } catch {
    return { kind: 'error' }
  }
}

/** 3900 → "$39", 3950 → "$39.50" — how prices read on this site. */
export function displayPrice(cents: number): string {
  const dollars = cents / 100
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`
}

/** The portal's product in the shape every component on this site already renders. */
function toSiteProduct(p: PortalProduct): Product {
  const variants: ProductVariant[] = p.options.map((o) => ({
    size: o.label,
    price: displayPrice(o.priceCents),
    priceCents: o.priceCents,
  }))
  const lowest = variants.length > 0 ? Math.min(...p.options.map((o) => o.priceCents)) : (p.priceCents as number)

  return {
    id: p.id,
    name: p.name,
    category: p.category ?? '',
    price: variants.length > 1 ? `From ${displayPrice(lowest)}` : displayPrice(lowest),
    priceCents: p.priceCents,
    description: p.description,
    image: p.images[0] ?? NO_PHOTO,
    images: p.images.length > 0 ? p.images : undefined,
    customizable: p.customizable,
    // The shop's Metal filter matches these by name (Gold, Silver, Pearl…).
    metals: p.tags,
    variants: variants.length > 0 ? variants : undefined,
    variantType: variants.length > 0 ? p.optionName ?? 'Option' : undefined,
    featured: p.featured,
  }
}

const BUILT_IN: Catalog = { source: 'built-in', products: PRODUCTS }

/** For pages. Never fails: a portal problem shows the built-in list. */
export async function getCatalog(): Promise<Catalog> {
  const fetched = await fetchPortalCatalog()
  return fetched.kind === 'products' ? { source: 'portal', products: fetched.products.map(toSiteProduct) } : BUILT_IN
}

/** For charging. Null means "cannot price right now" — refuse the order, charge nothing. */
export async function getCheckoutCatalog(): Promise<Catalog | null> {
  const fetched = await fetchPortalCatalog()
  if (fetched.kind === 'error') return null
  return fetched.kind === 'products' ? { source: 'portal', products: fetched.products.map(toSiteProduct) } : BUILT_IN
}
