import type { Metadata } from 'next'
import { CartPageClient } from '@/components/cart/CartPageClient'
import { getCatalog } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review your NOMA cart and proceed to checkout.',
}

export default async function CartPage() {
  // The cart only remembers a title, a price and a photo for each line. Tapping a
  // line reopens the product popup, which needs the whole product (options,
  // description, whether it can be engraved), so the catalog comes along.
  const { products } = await getCatalog()
  return <CartPageClient products={products} />
}
