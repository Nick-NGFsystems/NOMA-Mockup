#!/usr/bin/env node
/**
 * verify-bundles — tests for bundles made of pieces (lib/ngf-bundles.ts) and for
 * the checkout pricing that checks them (priceCart in lib/ngf-products.ts).
 *
 *   npm run test:bundles
 *
 * No network, no Square, no portal: it builds a catalog in memory and prices
 * carts against it. Node 22.18+ runs the TypeScript files directly (type
 * stripping); the hook below maps the "@/" import alias to this repo.
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

register(
  'data:text/javascript,' +
    encodeURIComponent(`
      import { existsSync } from 'node:fs'
      const root = ${JSON.stringify(root)}
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith('@/')) {
          const base = root + '/' + specifier.slice(2)
          for (const file of [base, base + '.ts', base + '.tsx', base + '/index.ts']) {
            if (existsSync(file)) return next(new URL('file://' + file).href, context)
          }
        }
        return next(specifier, context)
      }
    `),
)

if (!existsSync(path.join(root, 'lib/ngf-bundles.ts'))) throw new Error('run from the repo')
const bundles = await import(pathToFileURL(path.join(root, 'lib/ngf-bundles.ts')).href)
const products = await import(pathToFileURL(path.join(root, 'lib/ngf-products.ts')).href)

let passed = 0
let failed = 0
function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`  ok   ${name}`)
  } catch (err) {
    failed++
    console.log(`  FAIL ${name}\n       ${err.message}`)
  }
}
function eq(actual, expected, what = 'value') {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) throw new Error(`${what}: expected ${e}, got ${a}`)
}
function refused(result, pattern) {
  if (result.ok) throw new Error(`expected a refusal matching ${pattern}, got ok`)
  if (!pattern.test(result.reason)) throw new Error(`reason "${result.reason}" does not match ${pattern}`)
}

// ── A catalog as the feed would send it ──────────────────────────────────────
const feed = {
  id: 'mother-daughter-set',
  name: 'Mother Daughter Set',
  description: '',
  category: 'Bundles',
  priceCents: 9900,
  compareAtCents: 12000,
  personalizable: false,
  includes: [
    { id: 'alaina-necklace', name: 'Alaina Necklace', image: '/a.jpg', quantity: 1, optionLabel: 'Length', options: ['16"', '18"'], engravable: true, engravingShape: 'disc', engravingMaxChars: 8 },
    { id: 'paris-bracelet', name: 'Paris Bracelet', image: '/p.jpg', quantity: 2, optionLabel: null, options: [], engravable: true, engravingShape: null, engravingMaxChars: null },
    { id: 'gift-box', name: 'Gift Box', image: null, quantity: 1, optionLabel: null, options: [], engravable: false, engravingShape: null, engravingMaxChars: null },
    { id: 'extra:1', extra: true, name: 'Gift pouch', image: '/pouch.jpg', quantity: 2, optionLabel: null, options: [], engravable: false, engravingShape: null, engravingMaxChars: null },
  ],
}
const extrasOnly = {
  id: 'pouch-set', name: 'Pouch Set', category: 'Bundles', priceCents: 3000, personalizable: true,
  includes: [{ id: 'extra:1', extra: true, name: 'Gift pouch', image: null, quantity: 1, options: ['x'], engravable: true }],
}
const plain = { id: 'paris-bracelet', name: 'Paris Bracelet', priceCents: 4500, personalizable: true }
const wordsBundle = { id: 'old-bundle', name: 'Old Bundle', category: 'Bundles', priceCents: 5000, personalizable: true }

// readProduct is private, so read the feed through getNgfCatalog with a stubbed fetch.
async function catalogFrom(list) {
  const realFetch = globalThis.fetch
  process.env.NGF_APP_URL = 'https://portal.test'
  globalThis.fetch = async () => new Response(JSON.stringify({ enabled: true, currency: 'USD', products: list }), { status: 200 })
  try {
    return await products.getNgfCatalog({ fresh: true })
  } finally {
    globalThis.fetch = realFetch
  }
}

const catalog = await catalogFrom([feed, plain, wordsBundle, extrasOnly])
if (catalog.status !== 'live') throw new Error(`stub catalog not live: ${JSON.stringify(catalog)}; set NGF env vars the way lib/ngf.ts reads them`)
const list = catalog.products
const bundle = list.find((p) => p.id === 'mother-daughter-set')
const pieces = bundle.includes

console.log('\nFeed reading')
test('a bundle keeps its pieces from the feed', () => {
  eq(pieces.map((p) => [p.id, p.quantity, p.engravable, p.extra]), [['alaina-necklace', 1, true, false], ['paris-bracelet', 2, true, false], ['gift-box', 1, false, false], ['extra:1', 2, false, true]])
  eq(pieces[0].engravingShape, 'disc', 'shape')
  eq(pieces[1].engravingMaxChars, null, 'unset max')
})
test('a product without pieces has none', () => {
  eq(list.find((p) => p.id === 'old-bundle').includes, null)
})
test('a product with the engraving settings unset reads them as null', () => {
  const p = list.find((x) => x.id === 'paris-bracelet')
  eq([p.engravingShape, p.engravingMaxChars], [null, null])
})
const broken = await catalogFrom([{ ...feed, includes: [{ id: 'x' }] }])
test('a bundle whose pieces cannot be read is dropped, not sold as a plain product', () => eq(broken.products.length, 0))
test('readBundlePieces refuses duplicates and bad quantities', () => {
  eq(bundles.readBundlePieces([{ id: 'a', name: 'A', quantity: 1 }, { id: 'a', name: 'A', quantity: 1 }]), null)
  eq(bundles.readBundlePieces([{ id: 'a', name: 'A', quantity: 6 }]), null)
  eq(bundles.readBundlePieces([]), null)
})

test('an extra never has options or engraving, whatever the feed says', () => {
  const p = list.find((x) => x.id === 'pouch-set').includes[0]
  eq([p.extra, p.options, p.engravable], [true, [], false])
})

console.log('\nChecking choices')
const good = [
  { id: 'alaina-necklace', unit: 1, option: '16"', engraving: { text: 'alaina', font: 'Cormorant Italic' } },
  { id: 'paris-bracelet', unit: 2, option: null, engraving: { text: ' Mary ', font: 'Open Sans' } },
]
test('valid choices pass, tidied and in bundle order', () => {
  const r = bundles.checkBundleChoices('Set', pieces, [...good].reverse())
  eq(r.ok, true)
  eq(r.choices, [
    { id: 'alaina-necklace', unit: 1, option: '16"', engraving: { text: 'ALAINA', font: 'Cormorant Italic' } },
    { id: 'paris-bracelet', unit: 2, option: null, engraving: { text: 'MARY', font: 'Open Sans' } },
  ])
})
test('a piece with options needs one', () => {
  refused(bundles.checkBundleChoices('Set', pieces, []), /choose a length for Alaina Necklace in Set/)
})
test('an unknown option is refused', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [{ id: 'alaina-necklace', unit: 1, option: '20"', engraving: null }]), /no longer available/)
})
test('a piece not in the bundle is refused', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [good[0], { id: 'ring', unit: 1, option: null, engraving: null }]), /has changed/)
})
test('a unit past the quantity is refused', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [good[0], { id: 'paris-bracelet', unit: 3, option: null, engraving: null }]), /has changed/)
})
test('a choice for an extra is refused (nothing to choose)', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [good[0], { id: 'extra:1', unit: 1, option: null, engraving: null }]), /has changed/)
})
test('the same unit twice is refused', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [good[0], good[0]]), /could not read/)
})
test('engraving on a piece that cannot be engraved is refused', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [good[0], { id: 'gift-box', unit: 1, option: null, engraving: { text: 'HI', font: 'Open Sans' } }]), /cannot be engraved/)
})
test("text over the piece's own limit is refused", () => {
  refused(bundles.checkBundleChoices('Set', pieces, [{ ...good[0], engraving: { text: 'ABCDEFGHI', font: 'Open Sans' } }]), /at most 8 characters/)
})
test('the default limit is 10 when the portal sets none', () => {
  eq(bundles.checkBundleChoices('Set', pieces, [good[0], { id: 'paris-bracelet', unit: 1, option: null, engraving: { text: 'ABCDEFGHIJ', font: 'Open Sans' } }]).ok, true)
  refused(bundles.checkBundleChoices('Set', pieces, [good[0], { id: 'paris-bracelet', unit: 1, option: null, engraving: { text: 'ABCDEFGHIJK', font: 'Open Sans' } }]), /at most 10/)
})
test('a line break in the text is refused (one line per piece)', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [good[0], { id: 'paris-bracelet', unit: 1, option: null, engraving: { text: 'A\nB', font: 'Open Sans' } }]), /character we cannot engrave/)
})
test('empty text is no engraving', () => {
  const r = bundles.checkBundleChoices('Set', pieces, [{ ...good[0], engraving: { text: '   ', font: 'Open Sans' } }])
  eq(r.ok && r.choices, [{ id: 'alaina-necklace', unit: 1, option: '16"', engraving: null }])
})
test('a font with odd characters is refused', () => {
  refused(bundles.checkBundleChoices('Set', pieces, [{ ...good[0], engraving: { text: 'A', font: '<b>x</b>' } }]), /choose a font/)
})

console.log('\nRendering for the order')
test('one line per chosen unit, "#n" only for repeated pieces', () => {
  const r = bundles.checkBundleChoices('Set', pieces, good)
  eq(bundles.renderBundleChoices(pieces, r.choices), 'Alaina Necklace (16"): ALAINA (Cormorant Italic)\nParis Bracelet #2: MARY (Open Sans)')
})
test('an option alone is still written', () => {
  const r = bundles.checkBundleChoices('Set', pieces, [{ id: 'alaina-necklace', unit: 1, option: '18"', engraving: null }])
  eq(bundles.renderBundleChoices(pieces, r.choices), 'Alaina Necklace (18")')
})
test('choicesKey ignores order and tells different engravings apart', () => {
  eq(bundles.choicesKey(good) === bundles.choicesKey([...good].reverse()), true)
  eq(bundles.choicesKey(good) === bundles.choicesKey([good[0]]), false)
})

console.log('\nCheckout pricing (priceCart)')
test('a bundle is charged its own price whatever is chosen', () => {
  const r = products.priceCart([{ id: 'mother-daughter-set', qty: 2, pieces: good }], list)
  eq(r.ok, true)
  eq([r.lines[0].unitCents, r.lines[0].lineCents, r.subtotalCents], [9900, 19800, 19800])
  eq(r.lines[0].customization, 'Alaina Necklace (16"): ALAINA (Cormorant Italic)\nParis Bracelet #2: MARY (Open Sans)')
  eq(r.lines[0].pieces.length, 2)
})
test("a bundle's single engraving is never kept", () => {
  const r = products.priceCart([{ id: 'mother-daughter-set', qty: 1, customization: 'WHOLE (Open Sans)', pieces: [good[0]] }], list)
  eq(r.lines[0].customization, 'Alaina Necklace (16"): ALAINA (Cormorant Italic)')
})
test('a bundle with no choices but a piece with options is refused', () => {
  refused(products.priceCart([{ id: 'mother-daughter-set', qty: 1 }], list), /choose a length/)
})
test('bad choices refuse the whole order', () => {
  refused(products.priceCart([{ id: 'paris-bracelet', qty: 1 }, { id: 'mother-daughter-set', qty: 1, pieces: [{ ...good[0], option: '24"' }] }], list), /no longer available/)
})
test('choices sent for a product without pieces are refused', () => {
  refused(products.priceCart([{ id: 'old-bundle', qty: 1, pieces: good }], list), /has changed/)
})
test('a bundle described in words behaves as before (one engraving kept)', () => {
  const r = products.priceCart([{ id: 'old-bundle', qty: 1, customization: 'MA (Open Sans)' }], list)
  eq([r.lines[0].customization, r.lines[0].pieces], ['MA (Open Sans)', null])
})
test('a single product behaves as before', () => {
  const r = products.priceCart([{ id: 'paris-bracelet', qty: 1, customization: '  JO (Open Sans) ' }], list)
  eq([r.lines[0].unitCents, r.lines[0].customization, r.lines[0].pieces], [4500, 'JO (Open Sans)', null])
})

console.log('\nExtra items')
test('extras stay out of the rendered order text', () => {
  const r = products.priceCart([{ id: 'mother-daughter-set', qty: 1, pieces: good }], list)
  eq(r.lines[0].customization.includes('Gift pouch'), false)
})
test('a bundle of extras only: nothing per piece, its own engraving box works as before', () => {
  const r = products.priceCart([{ id: 'pouch-set', qty: 1, customization: 'MA (Open Sans)' }], list)
  eq([r.ok, r.lines[0].customization, r.lines[0].pieces], [true, 'MA (Open Sans)', null])
  refused(products.priceCart([{ id: 'pouch-set', qty: 1, pieces: good }], list), /has changed/)
})
test('hasChoosablePieces and bundleExtras', () => {
  eq([bundles.hasChoosablePieces(pieces), bundles.hasChoosablePieces(list.find((x) => x.id === 'pouch-set').includes), bundles.hasChoosablePieces(null)], [true, false, false])
  eq(bundles.bundleExtras(pieces).map((p) => p.name), ['Gift pouch'])
})

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
