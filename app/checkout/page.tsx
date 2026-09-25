import type { Metadata } from 'next'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'
import { getStoreSettings } from '@/lib/ngf-store'
import { getCatalog } from '@/lib/ngf-products'
import { unitPriceCents } from '@/lib/checkout'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  // Fetched on the server and handed down, because the settings live in the NGF
  // portal and a client component cannot read them. The API route re-fetches
  // them independently before charging — the copy passed here is for DISPLAY
  // only and is never trusted for the amount.
  const [settings, catalog] = await Promise.all([getStoreSettings(), getCatalog()])

  // Current unit prices by cart id, so the page shows what /api/checkout will
  // charge rather than the prices the cart remembered. Display only: the API
  // route re-prices from its own read of the catalogue before charging.
  const prices: Record<string, number> = {}
  for (const product of catalog.products) {
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        const cents = unitPriceCents(product, v.size)
        if (cents !== null) prices[`${product.id}-${v.size}`] = cents
      }
    } else {
      const cents = unitPriceCents(product, null)
      if (cents !== null) prices[product.id] = cents
    }
  }

  return (
    <main className="section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <CheckoutClient settings={settings} prices={prices} />
    </main>
  )
}
