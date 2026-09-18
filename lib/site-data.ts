/**
 * Non-catalog seed content.
 *
 * Everything NOMA SELLS now lives in lib/catalog.ts — products, bundles,
 * prices, and the metal/type taxonomy, which is derived from the catalog rather
 * than declared. This file used to also hold PRODUCTS, BUNDLES, CATEGORIES and
 * MATERIALS; CATEGORIES and MATERIALS were exported and never imported, and
 * listed jewelry types the shop has never stocked.
 */

export interface Review {
  id: string
  quote: string
  reviewer: string
}

/**
 * Deliberately EMPTY.
 *
 * This held four "Placeholder review #N — Sample Reviewer" entries, and because
 * they were written as `||` fallbacks they rendered on the live homepage for
 * anyone who visited. A testimonial is a claim about a real customer, so an
 * invented one is worse than none: the reviews section now hides itself until
 * NOMA publishes real reviews from their portal editor.
 *
 * The same reasoning as the catalog — never show what does not exist.
 */
export const REVIEWS: Review[] = []
