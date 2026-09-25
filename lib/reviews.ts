import { getItems, type NgfSiteContent } from '@/lib/ngf'
import { REVIEWS } from '@/lib/site-data'

// Customer reviews: visitors only ever see real ones.
//
// The starter reviews in lib/site-data.ts are placeholders. They stay in the
// HTML so the portal editor can find the cards and NOMA can write over them
// (anything missing from the server-rendered HTML cannot be edited), but a
// card is shown to visitors only once its quote is a real review.
//
// "Real" has to be decided by the text, not by whether anything is published:
// when a client edits one card, the editor publishes the WHOLE list and
// backfills every untouched card with its rendered value, so the placeholder
// quotes are published verbatim alongside the real one.

export interface ReviewCard {
  quote: string
  reviewer: string
  /** A real review: shown to visitors. Otherwise the card is editor-only. */
  live: boolean
  /** The name is a real one: shown to visitors under a live quote. */
  named: boolean
}

// Backfilled values can carry the quote marks the card draws around the text.
const clean = (s: string | undefined) =>
  (s || '').trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()

const PLACEHOLDER_QUOTES = new Set(REVIEWS.map((r) => clean(r.quote)))
const PLACEHOLDER_NAMES = new Set(REVIEWS.map((r) => clean(r.reviewer)))

const isRealQuote = (q: string) =>
  q !== '' && !PLACEHOLDER_QUOTES.has(q) && !/^placeholder review\b/i.test(q)
const isRealName = (n: string) => n !== '' && !PLACEHOLDER_NAMES.has(n)

export function getReviewCards(content: NgfSiteContent): ReviewCard[] {
  // A non-empty published list is the complete list (NGF-STANDARDS,
  // "Repeatable groups"): render it as is, so cards NOMA adds or removes stick.
  const published = getItems(content, 'reviews.items')
  const items = published.length > 0 ? published : REVIEWS

  return items.map((item, i) => {
    const fallback = REVIEWS[i % REVIEWS.length]
    const quote = clean(item.quote)
    const reviewer = clean(item.reviewer)
    const live = isRealQuote(quote)
    const named = isRealName(reviewer)
    return {
      // Editor-only cards keep a prompt to write over; live cards never fall
      // back to placeholder text.
      quote: quote || clean(fallback.quote),
      reviewer: named ? reviewer : clean(fallback.reviewer),
      live,
      named,
    }
  })
}

/** Whether the reviews section, and the links to it, should show to visitors. */
export function hasLiveReviews(content: NgfSiteContent): boolean {
  return getReviewCards(content).some((card) => card.live)
}
