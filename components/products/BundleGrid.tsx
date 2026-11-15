'use client'
import { ProductCard } from '@/components/products/ProductGrid'
import type { Product } from '@/lib/site-data'

/**
 * The Bundles section's cards. A bundle is a product like any other (see
 * `isBundle` in lib/catalog.ts), so it is the shop's own card: photo, price, the
 * Sale tag when it has a regular price, and the same popup with options and Add
 * to cart.
 */
export function BundleGrid({ bundles, openProductId }: { bundles: Product[]; openProductId?: string }) {
  return (
    <div className="product-grid">
      {bundles.map((bundle, i) => (
        <ProductCard key={bundle.id} product={bundle} index={i} startOpen={bundle.id === openProductId} />
      ))}
    </div>
  )
}
