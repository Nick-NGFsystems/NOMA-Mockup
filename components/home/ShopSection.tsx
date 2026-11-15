'use client'
import { useState } from 'react'
import { BestSellersGrid } from './BestSellersGrid'
import { ShopByCategory } from './ShopByCategory'
import { BundleGrid } from '@/components/products/BundleGrid'
import type { Product } from '@/lib/site-data'

type Tab = 'bestsellers' | 'bundles'

interface ShopSectionProps {
  bestSellers: Product[]
  products: Product[]
  /** Products with the category "Bundles" (see lib/catalog.ts). No bundles, no tab. */
  bundles: Product[]
}

export function ShopSection({ bestSellers, products, bundles }: ShopSectionProps) {
  const [activeTab, setActiveTab]   = useState<Tab>('bestsellers')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'bestsellers', label: 'Best Sellers' },
    ...(bundles.length > 0 ? [{ id: 'bundles' as Tab, label: 'Bundles' }] : []),
  ]

  const tabStyle = (id: Tab): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '999px',
    border: 'none',
    background: activeTab === id ? 'var(--ink)' : 'transparent',
    color: activeTab === id ? '#fff' : 'var(--muted)',
    fontFamily: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 180ms ease',
    whiteSpace: 'nowrap',
  })

  return (
    <section className="section shop-section" id="shop">

      {/* Centered header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p className="eyebrow" style={{ margin: '0 auto 10px', textAlign: 'center' }}>The Collection</p>
        <h2 style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>Find your perfect piece.</h2>
      </div>

      {/* Tab bar: with no bundles there is only Best Sellers, so no bar. */}
      {tabs.length > 1 && (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '4px',
        marginBottom: '36px',
        padding: '5px',
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '999px',
        border: '1px solid var(--border)',
        width: 'fit-content',
        margin: '0 auto 36px',
      }}>
        {tabs.map(({ id, label }) => (
          <button key={id} style={tabStyle(id)} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>
      )}

      {/* Tab content */}
      <div key={activeTab} style={{ animation: 'tabFade 200ms ease' }}>
        <style>{`
          @keyframes tabFade {
            from { opacity: 0; transform: translateY(5px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {activeTab === 'bestsellers' && (
          bestSellers.length > 0 ? (
            <BestSellersGrid products={bestSellers} />
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0' }}>
              New pieces are on their way. Check back soon.
            </p>
          )
        )}

        {activeTab === 'bundles' && bundles.length > 0 && <BundleGrid bundles={bundles} />}
      </div>

      {/* Shop All CTA */}
      <div className="section-actions" style={{ marginTop: '28px' }}>
        <a href="/products" className="btn-solid">Shop All Pieces</a>
      </div>

      {/* ── Browse by metal & type ── */}
      <div style={{ marginTop: '48px', borderTop: '1px solid var(--border)', paddingTop: '40px', textAlign: 'center' }}>
        <p className="eyebrow" style={{ margin: '0 auto 10px', textAlign: 'center' }}>Filter</p>
        <h2 className="shop-filter-heading" style={{ margin: '0 auto 28px', textAlign: 'center' }}>Browse by metal &amp; type</h2>
        <div style={{ textAlign: 'left' }}>
          <ShopByCategory products={products} />
        </div>
      </div>

    </section>
  )
}
