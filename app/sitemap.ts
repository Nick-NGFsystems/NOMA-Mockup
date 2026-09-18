import type { MetadataRoute } from 'next'
import { siteBaseUrl } from '@/lib/ngf'

// Next auto-routes this to /sitemap.xml. Add an entry for every public page —
// a page missing here is invisible to Google AND to the portal editor, which
// discovers this site's pages from this file (NGF-STANDARDS, "The scraper reads
// every page in your sitemap.xml").
//
// The base comes from siteBaseUrl() — the same fallback chain the content
// lookup uses — never from a hand-rolled literal.
//
// /cart and /checkout are deliberately absent: they are transactional, carry no
// editable content, and are disallowed in robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteBaseUrl()
  const now = new Date()

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
