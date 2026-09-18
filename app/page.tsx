import type { Metadata } from 'next'
import Link from 'next/link'
import { getNgfContent, getItems } from '@/lib/ngf'
import { getCatalog } from '@/lib/catalog'
import { ShopSection } from '@/components/home/ShopSection'

export const metadata: Metadata = {
  title: 'NOMA | Fine Jewelry',
  description: 'Everyday waterproof jewelry designed to last.',
}

export default async function HomePage() {
  const content = await getNgfContent()
  const reviewItems = getItems(content, 'reviews.items')
  const hasReviews = reviewItems.length > 0
  // One blank row when nothing is published, so the editor has an item to clone.
  const reviewRows = hasReviews ? reviewItems : [{}]

  // The catalog drops anything it cannot price, so these are all buyable.
  const catalog = getCatalog()
  const pieces = catalog.filter((p) => p.kind === 'piece')
  const bundles = catalog.filter((p) => p.kind === 'bundle')
  const bestSellers = pieces.slice(0, 6)

  // Hero
  const heroEyebrow = content['hero.eyebrow'] || 'Everyday Waterproof Jewelry'
  const heroHeadline = content['hero.headline'] || 'Made for daily wear, designed to last.'
  const heroLede =
    content['hero.lede'] ||
    'Effortless jewelry that keeps its shine through every day. Layer, swim, and live in pieces made to stay luminous.'
  const heroImage =
    content['hero.image'] ||
    '/assets/products/Necklace/Alaina/ALAINA%20NECKLACE%204.jpg'
  const heroEngravingTagline = content['hero.engravingTagline'] || 'Now Offering'
  const heroEngravingTitle = content['hero.engravingTitle'] || 'Custom Engraving on Select Pieces'
  const heroEngravingBody =
    content['hero.engravingBody'] || 'Add your text and preview it live before you buy.'
  const heroContactEmail = content['hero.contactEmail'] || 'mailto:hello@noma.com'

  // Reviews
  const reviewsEyebrow = content['reviews.eyebrow'] || 'Happy Customers'
  const reviewsHeadline = content['reviews.headline'] || 'Real reviews, real wear.'


  return (
    <main style={{ padding: '0 0 80px' }}>

      {/* ── Hero ── */}
      <section
        className="section home-hero"
        id="home"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'center',
        }}
      >
        {/* Hero copy */}
        <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p
            className="eyebrow"
            data-ngf-field="hero.eyebrow"
            data-ngf-label="Hero Eyebrow"
            data-ngf-type="text"
            data-ngf-section="Hero"
          >
            {heroEyebrow}
          </p>
          <h1
            data-ngf-field="hero.headline"
            data-ngf-label="Hero Headline"
            data-ngf-type="text"
            data-ngf-section="Hero"
          >
            {heroHeadline}
          </h1>
          <p
            className="lede hero-lede"
            data-ngf-field="hero.lede"
            data-ngf-label="Hero Lede"
            data-ngf-type="textarea"
            data-ngf-section="Hero"
          >
            {heroLede}
          </p>

          {/* CTA buttons */}
          <div className="hero-cta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link
              href="/products#engraving"
              className="btn-solid"
              data-ngf-field="hero.engravingTitle"
              data-ngf-label="Engraving Title"
              data-ngf-type="text"
              data-ngf-section="Hero"
            >
              Try Custom Engraving
            </Link>
            <a
              href={heroContactEmail}
              className="btn-ghost"
              data-ngf-field="hero.contactEmail"
              data-ngf-label="Contact Email"
              data-ngf-type="text"
              data-ngf-section="Hero"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Hero image */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div className="hero-static">
            <img
              src={heroImage}
              alt="NOMA Fine Jewelry"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              data-ngf-field="hero.image"
              data-ngf-label="Hero Image"
              data-ngf-type="image"
              data-ngf-section="Hero"
            />
          </div>
        </div>
      </section>

      {/* ── Unified Shop ── */}
      <ShopSection
        bestSellers={bestSellers}
        products={pieces}
        bundles={bundles}
        content={content}
      />

      {/* ── Reviews ── */}
      {/* Hidden from the storefront until a real testimonial is published, but
          ALWAYS server-rendered so the portal editor can discover the group —
          an element absent from the SSR HTML cannot be edited, which would
          leave NOMA unable to add the first review. */}
      <section
        className={`section testimonials${hasReviews ? '' : ' ngf-editor-only'}`}
        id="reviews"
      >
        <div className="section-header" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          <p
            className="eyebrow"
            data-ngf-field="reviews.eyebrow"
            data-ngf-label="Section Eyebrow"
            data-ngf-type="text"
            data-ngf-section="Reviews"
          >
            {reviewsEyebrow}
          </p>
          <h2
            data-ngf-field="reviews.headline"
            data-ngf-label="Section Headline"
            data-ngf-type="text"
            data-ngf-section="Reviews"
          >
            {reviewsHeadline}
          </h2>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}
          data-ngf-group="reviews.items"
          data-ngf-item-label="Review"
          data-ngf-min-items="1"
          data-ngf-max-items="8"
          data-ngf-item-fields='[{"key":"quote","label":"Quote","type":"textarea"},{"key":"reviewer","label":"Reviewer Name","type":"text"}]'
        >
          {/* Driven by what NOMA has actually PUBLISHED. This used to iterate a
              hardcoded REVIEWS array whose entries read "Placeholder review #1 —
              Sample Reviewer", and because they were `||` fallbacks they were
              live on the homepage for real visitors. A testimonial is a claim
              about a real customer, so the whole section now hides until there
              is a real one to show. */}
          {reviewRows.map((ri, i) => {
            const quote = ri.quote || ''
            const reviewer = ri.reviewer || ''
            return (
              <article key={i} className="testimonial-card">
                <p
                  style={{ color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.6 }}
                  data-ngf-field={`reviews.items.${i}.quote`}
                  data-ngf-label="Quote"
                  data-ngf-type="textarea"
                  data-ngf-section="Reviews"
                >
                  &ldquo;{quote}&rdquo;
                </p>
                <span
                  className="testimonial-name"
                  data-ngf-field={`reviews.items.${i}.reviewer`}
                  data-ngf-label="Reviewer Name"
                  data-ngf-type="text"
                  data-ngf-section="Reviews"
                >
                  {reviewer}
                </span>
              </article>
            )
          })}
        </div>
      </section>

    </main>
  )
}
