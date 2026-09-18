import type { Metadata } from 'next'
import { getNgfContent, ngfEndpoints } from '@/lib/ngf'
import LeadForm from '@/components/LeadForm'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Questions about a piece, a custom engraving, or a bulk or bridal order? Send NOMA Designs a message.',
}

export default async function ContactPage() {
  const content = await getNgfContent()
  const { base, domain } = ngfEndpoints()

  const eyebrow = content['contactPage.eyebrow'] || 'Get In Touch'
  const headline = content['contactPage.headline'] || 'We would love to hear from you.'
  const lede =
    content['contactPage.lede'] ||
    'Questions about sizing, a custom engraving, or a bridal or bulk order? Send us a note and we will get back to you.'

  return (
    <main style={{ padding: '0 0 120px' }}>
      <div className="products-hero-header">
        <p
          data-ngf-field="contactPage.eyebrow"
          data-ngf-label="Eyebrow"
          data-ngf-type="text"
          data-ngf-section="Contact"
          style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, margin: '0 0 10px' }}
        >
          {eyebrow}
        </p>
        <h1
          data-ngf-field="contactPage.headline"
          data-ngf-label="Page Headline"
          data-ngf-type="text"
          data-ngf-section="Contact"
          style={{ marginBottom: '16px' }}
        >
          {headline}
        </h1>
        <p
          data-ngf-field="contactPage.lede"
          data-ngf-label="Intro"
          data-ngf-type="textarea"
          data-ngf-section="Contact"
          style={{ maxWidth: '58ch', margin: '0 auto', color: 'var(--muted)' }}
        >
          {lede}
        </p>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px' }}>
        {/* The canonical NGF form: it PERSISTS to the central lead store first
            and only then emails, so a failed notification cannot lose a
            customer's message. Never hand-roll a replacement. */}
        <LeadForm
          base={base}
          domain={domain}
          formType="contact"
          submitLabel="Send message"
          successTitle="Thanks — we got your message."
          successBody="We read every note and will get back to you shortly."
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'tel' },
            {
              name: 'topic',
              label: 'What is this about?',
              type: 'select',
              options: [
                'A question about a piece',
                'Custom engraving',
                'Bridal or bulk order',
                'An existing order',
                'Something else',
              ],
            },
            { name: 'message', label: 'Your message', type: 'textarea', required: true, full: true },
          ]}
        />
      </div>
    </main>
  )
}
