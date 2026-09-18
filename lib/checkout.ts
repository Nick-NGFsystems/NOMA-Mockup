import { getCatalog, unitPriceCents, type CatalogProduct } from '@/lib/catalog'

/**
 * Server-side authoritative pricing.
 *
 * The cart lives in localStorage and its prices are DISPLAY ONLY — never trust
 * them for charging. resolveCart() re-derives every line's price from the
 * catalog, so a tampered client price cannot change what we charge. Cart item
 * ids are either `${productId}` or `${productId}-${variantLabel}`
 * (e.g. `sheri-necklace-16"`).
 *
 * Prices are integer cents from lib/catalog.ts. There is no string parsing left
 * in the money path: the catalog holds numbers, and a number is either present
 * and valid or the product is not in the catalog at all.
 *
 * IT FAILS CLOSED. Every previous version of this function silently dropped or
 * silently re-priced anything it did not recognise, which is the wrong default
 * for money — a cart that cannot be priced exactly should refuse to be charged,
 * not be charged a number nobody chose. Two concrete bugs that came from
 * failing open:
 *
 *   1. An unmatched variant suffix fell back to the product's BASE price. Base
 *      prices were strings like "From $39", so a 20" necklace that should cost
 *      $49 would have been charged $39. Undercharging, silently.
 *   2. Unknown ids were dropped from the cart entirely, so the customer was
 *      charged for less than their basket showed and had no idea.
 *
 * Both reject the whole order with a reason.
 */

export interface CheckoutLine {
  id: string
  sku: string
  title: string
  variant: string | null
  qty: number
  unitCents: number
  lineCents: number
  imageUrl: string | null
  customization: string | null
}

export type ResolvedCart =
  | { ok: true; lines: CheckoutLine[]; subtotalCents: number }
  | { ok: false; reason: string }

/** Per-line and per-order caps. A jewelry order is small; anything past these
 *  is a mistake or an attack, and either way is worth a human look. */
const MAX_QTY_PER_LINE = 20
const MAX_LINES = 50

export interface IncomingItem {
  id: string
  qty: number
  /** Free-text engraving for this line, if the buyer asked for one. */
  customization?: string | null
}

/**
 * Split a cart id into its product and variant.
 *
 * Exact id wins outright. Otherwise the LONGEST matching product id prefix wins
 * — with bundles and pieces in one catalog, a plain `startsWith` would let a
 * short id claim a longer product's cart line and price it as the wrong thing.
 */
function splitCartId(
  cartId: string,
  catalog: CatalogProduct[],
): { product: CatalogProduct; variantLabel: string | null } | null {
  const exact = catalog.find((p) => p.id === cartId)
  if (exact) return { product: exact, variantLabel: null }

  const prefixed = catalog
    .filter((p) => cartId.startsWith(p.id + '-'))
    .sort((a, b) => b.id.length - a.id.length)

  const product = prefixed[0]
  if (!product) return null
  return { product, variantLabel: cartId.slice(product.id.length + 1) }
}

export function resolveCart(items: IncomingItem[]): ResolvedCart {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, reason: 'Your cart is empty.' }
  }
  if (items.length > MAX_LINES) {
    return { ok: false, reason: 'That is too many different items for one order.' }
  }

  // getCatalog() already drops anything that cannot be priced, so an entry
  // reaching this point is sellable by construction.
  const catalog = getCatalog()
  const lines: CheckoutLine[] = []

  for (const item of items) {
    if (!item || typeof item.id !== 'string') {
      return { ok: false, reason: 'Your cart contains an invalid item.' }
    }

    // Integer, at least 1, capped. Rejects negatives, zero, fractions and NaN
    // rather than coercing them — a negative qty against a positive one is how
    // you build a cart that totals less than it should.
    const qty = Number(item.qty)
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ok: false, reason: 'One of the quantities in your cart is not valid.' }
    }

    const split = splitCartId(item.id, catalog)
    if (!split) {
      return { ok: false, reason: 'One of the items in your cart is no longer available.' }
    }
    const { product, variantLabel } = split

    const unitCents = unitPriceCents(product, variantLabel)
    if (unitCents === null) {
      // Either a variant was needed and not chosen, or the one chosen no longer
      // exists. Both are refusals, never a guess at the intended price.
      const needsChoice = Boolean(product.variants?.length) && !variantLabel
      return {
        ok: false,
        reason: needsChoice
          ? `Please choose a ${(product.variantLabel ?? 'size').toLowerCase()} for ${product.name}.`
          : `That option is no longer available for ${product.name}.`,
      }
    }

    const customization =
      typeof item.customization === 'string' && item.customization.trim()
        ? item.customization.trim().slice(0, 200)
        : null

    lines.push({
      id: item.id,
      sku: product.id,
      title: product.name,
      variant: variantLabel,
      qty,
      unitCents,
      lineCents: unitCents * qty,
      imageUrl: product.image ?? null,
      customization,
    })
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineCents, 0)
  if (subtotalCents <= 0) {
    return { ok: false, reason: 'Your cart total is zero.' }
  }

  return { ok: true, lines, subtotalCents }
}
