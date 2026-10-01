import type { Product } from '@/lib/site-data'

// Client-safe: the product cards import this, so it must not pull in
// lib/catalog.ts, which fetches the catalog on the server.

/**
 * Whether a card shows the "Sale" tag beside its price: the product (or any
 * option) has an original price in the portal, or its badge says Sale / On sale
 * in any capitalisation — the badge is free text NOMA types themselves.
 */
export function showsSaleTag(product: Pick<Product, 'onSale' | 'badge' | 'comparePrice' | 'price'>): boolean {
  const badge = (product.badge ?? '').trim().toLowerCase()
  return (
    product.onSale === true ||
    badge === 'sale' ||
    badge === 'on sale' ||
    Boolean(product.comparePrice && product.comparePrice !== product.price)
  )
}
