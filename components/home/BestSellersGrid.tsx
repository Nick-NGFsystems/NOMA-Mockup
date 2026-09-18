'use client'
import { useState } from 'react'
import { ProductModal } from '@/components/ui/ProductModal'
import {
  displayPrice,
  formatCents,
  variantCountLabel,
  type CatalogProduct,
  type CatalogVariant,
} from '@/lib/catalog'
import type { NgfSiteContent } from '@/lib/ngf'
import { getItems } from '@/lib/ngf'

interface BestSellersGridProps {
  products: CatalogProduct[]
  content: NgfSiteContent
  /**
   * Which portal group edits these cards. Bundles render through this SAME
   * component so they are purchasable by construction — they used to be a
   * separate display-only card with a price and no route into the cart.
   *
   * `npm run doctor` warns that it cannot check a group path built at runtime,
   * and asks for a hand check that the value is EXACTLY two segments
   * (section.array) — a deeper path makes add/remove/reorder silently no-op.
   * The literal union is that check, moved into the type system: both members
   * are two segments, and a third value cannot be passed without editing this
   * line and re-reading that rule.
   */
  groupKey?: 'bestSellers.items' | 'bundles.items'
  section?: 'Best Sellers' | 'Bundles'
  itemLabel?: string
}

interface ModalState {
  productId: string
  name: string
  description: string
  price: string
  image: string
  images?: string[]
  variants?: CatalogVariant[]
  variantLabel?: string
  customizable?: boolean
}

export function BestSellersGrid({
  products,
  content,
  groupKey = 'bestSellers.items',
  section = 'Best Sellers',
  itemLabel = 'Product',
}: BestSellersGridProps) {
  const [modal, setModal] = useState<ModalState | null>(null)

  const contentItems = getItems(content, groupKey)

  const openModal = (product: CatalogProduct, idx: number) => {
    const ci = contentItems[idx] ?? {}
    setModal({
      productId: product.id,
      name: ci.name || product.name,
      description: ci.description || product.description,
      // Authoritative, never the portal overlay — this value reaches the cart.
      price: displayPrice(product) ?? '',
      image: ci.image || product.image,
      images: product.images,
      variants: product.variants,
      variantLabel: product.variantLabel,
      customizable: product.customizable,
    })
  }

  return (
    <>
      {/* ── Mini-grid ── */}
      <div
        className="best-sellers-grid"
        data-ngf-group={groupKey}
        data-ngf-item-label={itemLabel}
        data-ngf-min-items="1"
        data-ngf-max-items="12"
        data-ngf-item-fields='[{"key":"image","label":"Product Image","type":"image"},{"key":"badge","label":"Badge Text","type":"text"},{"key":"name","label":"Product Name","type":"text"},{"key":"description","label":"Description","type":"textarea"}]'
      >
        {products.map((product, i) => {
          const ci = contentItems[i] ?? {}
          const name = ci.name || product.name
          const description = ci.description || product.description
          // Price is NOT overlaid from portal content: resolveCart() charges
          // from the catalog, so a portal price edit would change the card and
          // not the charge. null means "nothing honest to show" — the card then
          // renders no price rather than a placeholder.
          const price = displayPrice(product)
          const comparePrice = product.comparePriceCents ? formatCents(product.comparePriceCents) : null
          const badge = ci.badge || product.badge
          const image = ci.image || product.image

          return (
            <button
              key={product.id}
              className="mini-card"
              onClick={() => openModal(product, i)}
              style={{ border: 'none', fontFamily: 'inherit' }}
            >
              <div className="mini-image">
                <img
                  src={image}
                  alt={name}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  data-ngf-field={`${groupKey}.${i}.image`}
                  data-ngf-label="Product Image"
                  data-ngf-type="image"
                  data-ngf-section={section}
                />
              </div>
              <div className="mini-body">
                {badge && (
                  <p
                    className="eyebrow"
                    style={{ fontSize: '0.85rem', letterSpacing: '0.12em', marginBottom: '2px' }}
                    data-ngf-field={`${groupKey}.${i}.badge`}
                    data-ngf-label="Badge Text"
                    data-ngf-type="text"
                    data-ngf-section={section}
                  >
                    {badge}
                  </p>
                )}
                <h3
                  style={{ fontSize: '1.2rem', margin: 0 }}
                  data-ngf-field={`${groupKey}.${i}.name`}
                  data-ngf-label="Product Name"
                  data-ngf-type="text"
                  data-ngf-section={section}
                >
                  {name}
                </h3>
                <p
                  style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}
                  data-ngf-field={`${groupKey}.${i}.description`}
                  data-ngf-label="Description"
                  data-ngf-type="textarea"
                  data-ngf-section={section}
                >
                  {description.length > 72
                    ? description.slice(0, description.lastIndexOf(' ', 72)) + '…'
                    : description}
                </p>
                {price !== null && (
                  <div style={{ marginTop: '2px' }}>
                    <div className="price-row">
                      <span className="price">{price}</span>
                      {comparePrice !== null && <span className="price-compare">{comparePrice}</span>}
                      {badge === 'Sale' || comparePrice !== null ? (
                        <span className="sale-tag">Sale</span>
                      ) : null}
                    </div>
                    {variantCountLabel(product) && (
                      <p style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '3px 0 0', fontWeight: 600 }}>
                        {variantCountLabel(product)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Shared modal ── */}
      {modal && (
        <ProductModal
          productId={modal.productId}
          name={modal.name}
          description={modal.description}
          price={modal.price}
          image={modal.image}
          images={modal.images}
          variants={modal.variants}
          variantType={modal.variantLabel}
          customizable={modal.customizable}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
