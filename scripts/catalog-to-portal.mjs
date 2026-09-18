#!/usr/bin/env node
/**
 * catalog-to-portal — turn this repo's lib/catalog.ts into the payload the NGF
 * portal's Products API expects.
 *
 *   npm run catalog:export             # JSON to stdout, summary to stderr
 *   npm run catalog:export > cat.json
 *
 * WHY THIS EXISTS RATHER THAN A HAND-TYPED FORM. The catalog moving to the
 * portal is a TRANSCRIPTION, not a redesign: every field in lib/catalog.ts
 * already has a column waiting for it. Re-typing eight products and seventeen
 * prices into a web form is the one step of this migration where a typo becomes
 * a wrong charge, and nothing downstream would catch it — the portal would
 * faithfully serve whatever was entered. So the repo, which is the thing that
 * is correct today, writes the payload itself.
 *
 * WHAT IT DOES NOT DO: send anything. It prints. Loading the catalog is a
 * PUT that replaces the whole catalog for a client, so the payload gets read by
 * a human before it goes anywhere near a shop. Load it with the portal's
 * Products page (paste) or:
 *
 *   curl -X PUT "$NGF_APP_URL/api/admin/portal/$CLIENT_ID/products" \
 *        -H "Authorization: Bearer $NGF_API_KEY" \
 *        -H 'Content-Type: application/json' --data @cat.json
 *
 * — and note that an AGENT key cannot do this. The admin products route is
 * money.write, which an agent seat does not have, deliberately: stocking a shop
 * is not a read.
 *
 * THE ID IS THE LOAD-BEARING FIELD. `slug` here is the product's `id` in
 * lib/catalog.ts, unchanged, because that is what a cart holds and what
 * resolveCart() prices by. Transcribing with fresh ids would orphan every open
 * cart and every order line already pointing at `sheri-necklace`.
 */

import { getCatalog, isSellable } from '../lib/catalog.ts'

const rawCatalog = getCatalog()

/** Cents, or refuse. Never coerce — this number is charged. */
function cents(value, where) {
  if (value === undefined || value === null) return null
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${where}: ${JSON.stringify(value)} is not a positive integer number of cents`)
  }
  return value
}

const products = []
const problems = []

rawCatalog.forEach((p, index) => {
  // getCatalog() already filters to sellable, so a failure here means the two
  // rules disagree — worth stopping for rather than quietly exporting.
  if (!isSellable(p)) {
    problems.push(`${p.id}: getCatalog() returned it but isSellable() rejects it`)
    return
  }

  const variants = (p.variants ?? []).map((v, i) => ({
    label: v.label,
    price_cents: cents(v.priceCents, `${p.id} variant "${v.label}"`),
    sort: i,
  }))

  products.push({
    slug: p.id,
    name: p.name,
    kind: p.kind,
    category: p.category ?? null,
    // `metals` in this repo, `tags` in the portal: the column is deliberately
    // generic so the next client can put materials, sizes or anything else in
    // it without a migration.
    tags: p.metals ?? [],
    description: p.description ?? null,
    image: p.image ?? null,
    images: p.images ?? [],
    // Mutually exclusive, and the portal enforces it too. A product with
    // options has no single price.
    price_cents: variants.length > 0 ? null : cents(p.priceCents, `${p.id} price`),
    variant_label: p.variantLabel ?? null,
    compare_price_cents: p.comparePriceCents ?? null,
    badge: p.badge ?? null,
    customizable: p.customizable === true,
    active: true,
    sort: index,
    variants,
  })
})

if (problems.length > 0) {
  console.error('REFUSING TO EXPORT:\n  ' + problems.join('\n  '))
  process.exit(1)
}

// The summary goes to stderr so `> cat.json` still produces clean JSON.
const priced = products.reduce(
  (n, p) => n + (p.variants.length > 0 ? p.variants.length : 1),
  0,
)
console.error(`${products.length} products, ${priced} prices:`)
for (const p of products) {
  const money =
    p.variants.length > 0
      ? p.variants.map((v) => `${v.label} $${(v.price_cents / 100).toFixed(2)}`).join(', ')
      : `$${(p.price_cents / 100).toFixed(2)}`
  console.error(`  ${p.slug.padEnd(32)} ${money}`)
}
console.error('\nRead these prices against the live site before loading them.\n')

process.stdout.write(JSON.stringify({ products }, null, 2) + '\n')
