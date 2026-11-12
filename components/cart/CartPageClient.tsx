'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { lineKey, useCart, type CartItem } from '@/components/CartProvider'
import { ProductModal } from '@/components/ui/ProductModal'
import { parseEngraving, type FontKey } from '@/components/products/EngravingPreview'
import type { Product } from '@/lib/site-data'

function parsePrice(p: string) {
  return Number(p.replace(/[^0-9.]/g, '')) || 0
}

function formatCurrency(v: number) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Which product (and option) a cart line is, so tapping it can reopen that
 * product. A line's id is the product id, or `<id>-<option label>`. Null when the
 * product is no longer in the catalog: that line cannot be edited, only removed.
 */
function resolveLine(item: CartItem, products: Product[]): { product: Product; variant: string | null } | null {
  const exact = products.find((p) => p.id === item.id)
  if (exact && !(exact.variants && exact.variants.length > 0)) return { product: exact, variant: null }
  for (const p of products) {
    if (!item.id.startsWith(`${p.id}-`)) continue
    const label = item.id.slice(p.id.length + 1)
    if (p.variants?.some((v) => v.size === label)) return { product: p, variant: label }
  }
  return null
}

/** The shop page with this product's popup already open (see app/products/page.tsx). */
const productHref = (id: string) => `/products?product=${encodeURIComponent(id)}`

interface Editing {
  key: string
  product: Product
  variant: string | null
  engraving: string
  font: FontKey
}

export function CartPageClient({ products = [] }: { products?: Product[] }) {
  const { items, updateQty, replaceItem } = useCart()
  const [editing, setEditing] = useState<Editing | null>(null)

  const openEditor = (item: CartItem) => {
    const line = resolveLine(item, products)
    if (!line) return
    const { text, font } = parseEngraving(item.customization)
    setEditing({ key: lineKey(item), product: line.product, variant: line.variant, engraving: text, font })
  }

  const subtotal = items.reduce((sum, i) => sum + parsePrice(i.price) * i.qty, 0)

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">Your Bag</p>
      <h1 className="font-serif text-5xl text-[var(--ink)] mb-12">Cart overview</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Items */}
        <div className="flex-1 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--muted)] text-lg mb-6">Your cart is empty.</p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[var(--ink)] text-[var(--bg)] font-medium hover:bg-[var(--brown)] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const line = resolveLine(item, products)
              const editable = line !== null
              return (
              <article
                key={lineKey(item)}
                className="flex gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)]"
              >
                <button
                  type="button"
                  onClick={() => openEditor(item)}
                  disabled={!editable}
                  aria-label={editable ? `Edit ${item.title}` : undefined}
                  className={`relative w-24 h-24 rounded-xl overflow-hidden bg-[var(--beige)] shrink-0 p-0 border-0 ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      // Product photos come from the portal now — Vercel Blob
                      // uploads, or any https address — and the optimizer answers
                      // 400 for a host missing from next.config's list, so the
                      // cart showed a broken photo (seen in a production build).
                      // The shop grid already loaded this same photo, so it is in
                      // the browser's cache.
                      unoptimized
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--beige)]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-[var(--ink)] truncate">
                    {editable ? (
                      <button type="button" onClick={() => openEditor(item)} className="text-left max-w-full truncate cursor-pointer hover:underline">
                        {item.title}
                      </button>
                    ) : item.title}
                  </h3>
                  {item.customization && (
                    <p className="text-sm text-[var(--muted)] mt-1 break-words">Engraving: {item.customization}</p>
                  )}
                  {line && (
                    <div className="flex gap-4 mt-1">
                      <button
                        type="button"
                        onClick={() => openEditor(item)}
                        className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)] cursor-pointer"
                      >
                        Edit
                      </button>
                      <Link
                        href={productHref(line.product.id)}
                        className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)]"
                      >
                        View product
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-[var(--ink)]">{item.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-lg text-[var(--ink)] hover:bg-[var(--beige)] transition-colors"
                        onClick={() => updateQty(lineKey(item), -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-[var(--ink)] w-6 text-center">×{item.qty}</span>
                      <button
                        className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-lg text-[var(--ink)] hover:bg-[var(--beige)] transition-colors"
                        onClick={() => updateQty(lineKey(item), 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </article>
              )
            })
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-40 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
              <h3 className="font-serif text-xl text-[var(--ink)] mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm text-[var(--muted)] mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {/* Shipping and tax both depend on the delivery address and on
                  the client's own Store Settings, neither of which the cart
                  knows. Saying "Free" here promised something checkout may not
                  honour. */}
              <div className="flex justify-between text-sm text-[var(--muted)] mb-4">
                <span>Shipping &amp; tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-semibold text-[var(--ink)] text-base border-t border-[var(--border)] pt-4 mb-6">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {/* Was a bare <button> with no handler and no href — the ONLY
                  reference to /checkout anywhere in the app was the route file
                  itself, so the entire payment path was unreachable by any
                  click. A customer clicked this and nothing happened. */}
              <Link
                href="/checkout"
                className="block w-full py-3 rounded-full bg-[var(--ink)] text-[var(--bg)] text-center font-medium hover:bg-[var(--brown)] transition-colors mb-3"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="block w-full py-3 rounded-full border border-[var(--border)] text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--beige)] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        )}
      </div>

      {editing && (
        <ProductModal
          // A new key per line, so the popup starts fresh on each one.
          key={editing.key}
          mode="edit"
          productId={editing.product.id}
          name={editing.product.name}
          description={editing.product.description}
          price={editing.product.price}
          comparePrice={editing.product.comparePrice}
          image={editing.product.image}
          images={editing.product.images}
          variants={editing.product.variants}
          variantType={editing.product.variantType}
          customizable={editing.product.customizable}
          viewProductHref={productHref(editing.product.id)}
          initialVariant={editing.variant}
          initialEngraving={editing.engraving}
          initialFont={editing.font}
          onSubmit={(item) => replaceItem(editing.key, item)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
