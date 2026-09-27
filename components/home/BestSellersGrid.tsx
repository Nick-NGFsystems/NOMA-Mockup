'use client'
import { useState } from 'react'
import { ProductModal } from '@/components/ui/ProductModal'
import type { Product, ProductVariant } from '@/lib/site-data'

interface BestSellersGridProps {
  /** lib/catalog.ts bestSellers(): the products NOMA features in the portal, or the first six. */
  products: Product[]
}

interface ModalState {
  productId: string
  name: string
  description: string
  price: string
  image: string
  images?: string[]
  variants?: ProductVariant[]
  variantType?: string
}

// Every field comes from the catalog. This grid used to be a website-editor
// group (bestSellers.items) laid over the products by position, so a card could
// carry a name or price the product itself did not have — "Ayana" here while the
// shop said "Alaina", a price shown that checkout never charged. Products are
// edited on the portal's Products page now, the same list checkout charges from.
export function BestSellersGrid({ products }: BestSellersGridProps) {
  const [modal, setModal] = useState<ModalState | null>(null)

  const openModal = (product: Product) => {
    setModal({
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      images: product.images,
      variants: product.variants,
      variantType: product.variantType,
    })
  }

  return (
    <>
      {/* ── Mini-grid ── */}
      <div className="best-sellers-grid">
        {products.map((product, i) => {
          const { name, description, price, comparePrice, badge, image } = product

          return (
            <button
              key={product.id}
              className="mini-card"
              onClick={() => openModal(product)}
              style={{ border: 'none', fontFamily: 'inherit' }}
            >
              <div className="mini-image">
                <img
                  src={image}
                  alt={name}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
              <div className="mini-body">
                {badge && (
                  <p
                    className="eyebrow"
                    style={{ fontSize: '0.85rem', letterSpacing: '0.12em', marginBottom: '2px' }}
                  >
                    {badge}
                  </p>
                )}
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                  {name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {description.length > 72
                    ? description.slice(0, description.lastIndexOf(' ', 72)) + '…'
                    : description}
                </p>
                {product.variants && product.variants.length > 1 ? (
                  <div style={{ marginTop: '2px' }}>
                    <span className="price">
                      {product.variants[0].price}
                      <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '0.9rem' }}> – {product.variants[product.variants.length - 1].price}</span>
                    </span>
                    <p style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '3px 0 0', fontWeight: 600 }}>
                      {product.variantType === 'Length' ? `${product.variants.length} lengths` : product.variantType === 'Style' ? 'blank or engraved' : `${product.variants.length} sizes`}
                    </p>
                  </div>
                ) : (
                  <div className="price-row">
                    <span className="price">
                      {price}
                    </span>
                    {comparePrice && <span className="price-compare">{comparePrice}</span>}
                    {product.badge === 'Sale' || (product.comparePrice && product.comparePrice !== price) ? (
                      <span className="sale-tag">Sale</span>
                    ) : null}
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
          variantType={modal.variantType}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
