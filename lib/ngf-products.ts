import { ngfEndpoints } from '@/lib/ngf'
import {
  checkBundleChoices,
  readBundlePieces,
  renderBundleChoices,
  type BundlePieceChoice,
  type NgfBundlePiece,
} from '@/lib/ngf-bundles'

/**
 * Products — CANONICAL. Byte-identical on every NGF site that sells.
 *
 * The catalog belongs to the CLIENT: they add, edit, hide and price products on
 * their portal's Products page, and this file reads it (GET /api/public/products
 * on the NGF app). It also prices a cart against it. Once a client has Products
 * switched on, checkout must never charge from anything else — never hardcode a
 * price in a client site again.
 *
 * Three answers, and they are not interchangeable:
 *
 *   live         The portal's list is THE catalog, even when it is empty. An
 *                empty list is an empty shop; the client may have removed every
 *                product on purpose.
 *   off          Products is not switched on for this client. The site keeps
 *                the product list compiled into it, exactly as before.
 *   unavailable  The portal could not be asked. Show what you can, but refuse to
 *                take money: treating this as "off" would charge compiled prices
 *                that may be months out of date.
 */

export interface NgfProductOption {
  label: string
  priceCents: number
  /** The original price for a sale, shown crossed out. Never charged. Null when not on sale. */
  compareAtCents: number | null
}

export interface NgfProduct {
  /** The product's permanent handle. A cart line id is `id`, or `id-<option label>`. */
  id: string
  name: string
  description: string
  category: string | null
  /** Null when `options` carries the prices. */
  priceCents: number | null
  /** The original price for a sale, shown crossed out. Never charged. Null when not on sale or with options. */
  compareAtCents: number | null
  /** What the options are called, e.g. "Length". Null without options. */
  optionLabel: string | null
  options: NgfProductOption[]
  /** Photo URLs, main photo first. */
  images: string[]
  /** The shopper may add their own text, such as an engraving. */
  personalizable: boolean
  /** The engraving surface ("bar", "disc"…) when the client set one. Missing or null: the site's own default. */
  engravingShape?: string | null
  /** The longest engraving, when the client set one. Missing or null: the site's own default. */
  engravingMaxChars?: number | null
  /**
   * A bundle made of other products: its pieces, each engraved and optioned on
   * its own (lib/ngf-bundles.ts). Missing or null for any other product, and for
   * a bundle described only in words.
   */
  includes?: NgfBundlePiece[] | null
  tags: string[]
  badge: string | null
  featured: boolean
}

export type NgfCatalog =
  | { status: 'live'; currency: string; products: NgfProduct[] }
  | { status: 'off' }
  | { status: 'unavailable' }

const TIMEOUT_MS = 8000

const isPositiveInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0

/** An original price worth showing: a whole number of cents above the price. Anything else is no sale. */
const saleCompare = (compareAt: unknown, price: number | null): number | null =>
  isPositiveInt(compareAt) && price !== null && compareAt > price ? compareAt : null

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((s): s is string => typeof s === 'string' && s !== '') : []

/** A product this site cannot read is a product it cannot sell: it is dropped, never guessed at. */
function readProduct(raw: unknown): NgfProduct | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (typeof p.id !== 'string' || p.id === '' || typeof p.name !== 'string') return null

  const options: NgfProductOption[] = []
  if (Array.isArray(p.options)) {
    for (const entry of p.options) {
      const o = entry as Record<string, unknown> | null
      if (o && typeof o.label === 'string' && o.label !== '' && isPositiveInt(o.priceCents)) {
        options.push({ label: o.label, priceCents: o.priceCents, compareAtCents: saleCompare(o.compareAtCents, o.priceCents) })
      }
    }
  }
  const priceCents = isPositiveInt(p.priceCents) ? p.priceCents : null
  if (options.length === 0 && priceCents === null) return null

  // A bundle whose pieces cannot be read cannot be sold as made of pieces, and
  // selling it as a plain product would drop every engraving: drop it.
  const includes = readBundlePieces(p.includes)
  if (p.includes !== undefined && p.includes !== null && includes === null) return null

  return {
    id: p.id,
    name: p.name,
    description: typeof p.description === 'string' ? p.description : '',
    category: typeof p.category === 'string' && p.category !== '' ? p.category : null,
    priceCents: options.length > 0 ? null : priceCents,
    compareAtCents: options.length > 0 ? null : saleCompare(p.compareAtCents, priceCents),
    optionLabel:
      options.length > 0 && typeof p.optionLabel === 'string' && p.optionLabel !== '' ? p.optionLabel : null,
    options,
    images: strings(p.images),
    personalizable: p.personalizable === true,
    engravingShape: typeof p.engravingShape === 'string' && p.engravingShape !== '' ? p.engravingShape : null,
    engravingMaxChars:
      typeof p.engravingMaxChars === 'number' && Number.isInteger(p.engravingMaxChars) && p.engravingMaxChars > 0
        ? p.engravingMaxChars
        : null,
    includes,
    tags: strings(p.tags),
    badge: typeof p.badge === 'string' && p.badge !== '' ? p.badge : null,
    featured: p.featured === true,
  }
}

/**
 * Read the catalog. NEVER THROWS.
 *
 * Pages call it plainly: ISR-cached for 60 s under the `ngf-products` tag, like
 * getNgfContent(), and busted at once by the portal's revalidate ping whenever
 * the client saves a product. Checkout calls it with `{ fresh: true }`: the
 * amount charged must be the price as it is NOW, not as it was a minute ago.
 *
 * A 404 means the NGF app has no products endpoint at all, so Products cannot be
 * on — that is "off", which lets this file ship before the app that serves it.
 */
export async function getNgfCatalog(options: { fresh?: boolean } = {}): Promise<NgfCatalog> {
  try {
    const { base, domain } = ngfEndpoints()
    const res = await fetch(`${base}/api/public/products?domain=${encodeURIComponent(domain)}`, {
      ...(options.fresh ? { cache: 'no-store' as const } : { next: { revalidate: 60, tags: ['ngf-products'] } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (res.status === 404) return { status: 'off' }
    if (!res.ok) return { status: 'unavailable' }

    const body = (await res.json()) as { enabled?: unknown; currency?: unknown; products?: unknown }
    if (body.enabled === false) return { status: 'off' }
    if (body.enabled !== true || !Array.isArray(body.products)) return { status: 'unavailable' }

    return {
      status: 'live',
      currency: typeof body.currency === 'string' ? body.currency : 'USD',
      products: body.products.map(readProduct).filter((p): p is NgfProduct => p !== null),
    }
  } catch {
    return { status: 'unavailable' }
  }
}

export interface CartItemIn {
  id: string
  qty: number
  /** The shopper's own text for this line, such as an engraving. */
  customization?: string | null
  /** For a bundle made of pieces: the option and engraving chosen per piece. Checked here against the live feed. */
  pieces?: BundlePieceChoice[] | null
}

export interface PricedLine {
  /** The cart line id, as the browser sent it. */
  id: string
  /** The product id. */
  sku: string
  title: string
  /** The option label, when the product has options. */
  variant: string | null
  qty: number
  unitCents: number
  lineCents: number
  imageUrl: string | null
  /** The engraving, or for a bundle made of pieces each piece's choices, one per line. */
  customization: string | null
  /** For a bundle made of pieces: the checked choices that `customization` was written from. */
  pieces: BundlePieceChoice[] | null
}

export type PricedCart =
  | { ok: true; lines: PricedLine[]; subtotalCents: number }
  | { ok: false; reason: string }

/** A jewelry-sized order is small; anything past these is a mistake or an attack, and either way wants a human. */
const MAX_QTY_PER_LINE = 20
const MAX_LINES = 50

/**
 * Price a cart against a product list, on the server. The browser's prices are
 * display copies and are never read here.
 *
 * IT FAILS CLOSED: anything that cannot be priced exactly refuses the whole
 * order with a reason the shopper can act on, rather than being dropped or
 * charged a guess. Both of those happened on NOMA before this: an unmatched size
 * fell back to a "From $39" base price, and unknown items silently vanished from
 * the charge while the basket still showed them.
 *
 * Product ids can share a prefix ("ring" and "ring-set"), so for a line id with
 * a suffix every product it starts with is tried, and only an exact option label
 * matches.
 */
export function priceCart(items: CartItemIn[], products: NgfProduct[]): PricedCart {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, reason: 'Your cart is empty.' }
  }
  if (items.length > MAX_LINES) {
    return { ok: false, reason: 'That is too many different items for one order.' }
  }

  const lines: PricedLine[] = []

  for (const item of items) {
    if (!item || typeof item.id !== 'string') {
      return { ok: false, reason: 'Your cart contains an invalid item.' }
    }

    // Integer, at least 1, capped. A negative quantity against a positive one
    // is how you build a cart that totals less than it should.
    const qty = Number(item.qty)
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ok: false, reason: 'One of the quantities in your cart is not valid.' }
    }

    let product: NgfProduct | undefined
    let option: NgfProductOption | null = null

    const exact = products.find((p) => p.id === item.id)
    if (exact) {
      // A product with options has no single price; requiring a choice is
      // correct rather than guessing the cheapest.
      if (exact.options.length > 0) {
        const what = exact.optionLabel ? `a ${exact.optionLabel.toLowerCase()}` : 'an option'
        return { ok: false, reason: `Please choose ${what} for ${exact.name}.` }
      }
      product = exact
    } else {
      for (const p of products) {
        if (!item.id.startsWith(`${p.id}-`)) continue
        const label = item.id.slice(p.id.length + 1)
        const match = p.options.find((o) => o.label === label)
        if (match) {
          product = p
          option = match
          break
        }
      }
      if (!product) {
        const known = products.find((p) => item.id.startsWith(`${p.id}-`))
        return {
          ok: false,
          reason: known
            ? `That option is no longer available for ${known.name}.`
            : 'One of the items in your cart is no longer available.',
        }
      }
    }

    const unitCents = option ? option.priceCents : product.priceCents
    if (!isPositiveInt(unitCents)) {
      return { ok: false, reason: `We could not price ${product.name}. Please contact us to order.` }
    }

    let customization: string | null
    let pieces: BundlePieceChoice[] | null = null
    if (product.includes) {
      // A bundle made of pieces: every piece's option and engraving is checked
      // against the live feed, and anything that does not match refuses the
      // order. The bundle's own price is charged whatever is chosen. A single
      // engraving for the whole bundle is never kept: engraving is per piece.
      const checked = checkBundleChoices(product.name, product.includes, item.pieces)
      if (!checked.ok) return { ok: false, reason: checked.reason }
      pieces = checked.choices
      customization = renderBundleChoices(product.includes, checked.choices)
    } else {
      // Choices for pieces this product no longer has (the client removed them
      // after the shopper chose) cannot be fulfilled as chosen.
      if (Array.isArray(item.pieces) && item.pieces.length > 0) {
        return { ok: false, reason: `${product.name} has changed. Please remove it and add it to your cart again.` }
      }
      // Kept only on a product that offers it: a line of engraving text on a
      // piece that cannot be engraved is an order nobody can fulfil.
      customization =
        product.personalizable && typeof item.customization === 'string' && item.customization.trim()
          ? item.customization.trim().slice(0, 200)
          : null
    }

    lines.push({
      id: item.id,
      sku: product.id,
      title: product.name,
      variant: option ? option.label : null,
      qty,
      unitCents,
      lineCents: unitCents * qty,
      imageUrl: product.images[0] ?? null,
      customization,
      pieces,
    })
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineCents, 0)
  if (subtotalCents <= 0) {
    return { ok: false, reason: 'Your cart total is zero.' }
  }

  return { ok: true, lines, subtotalCents }
}
