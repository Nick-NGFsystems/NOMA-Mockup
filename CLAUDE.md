# NOMA — NGF Client Site

This repo was scaffolded from `ngf-client-starter` and converted from a plain HTML mockup to a full Next.js site. The NGF portal editor at `app.ngfsystems.com` is wired up — every editable element on every page can be managed from the portal without a code change.

## Now — read first, keep current

@NOW.md

`NOW.md` is this project's current state: status, next step, what it waits on, open PRs. Nick works in short, unplanned sessions, so keep it true at every moment:

- Update `NOW.md` in the same commit as any change it describes, and push, so a session that ends without warning loses nothing.
- Overwrite it; never append. Git history is the log. Keep it under about 15 lines.
- When Nick says "wrap up", bring `NOW.md` up to date, commit and push.

## Read this first

The universal foundation for every NGF client website is:

- **Canonical source — always fetch this, never keep a copy:**
  https://raw.githubusercontent.com/Nick-NGFsystems/ngf-client-starter/main/NGF-STANDARDS.md

This repo used to carry its own `NGF-STANDARDS.md`. It has been deleted: it was
frozen at this site's initial build while the canonical doc kept moving, so it
was stale by definition and `npm run doctor` fails a fork that keeps one. The
old pointer here also named `NorthCoveBuilders-Mockup`, which is no longer the
source.

That doc has the full tech-stack rules, NGF editor integration spec, setup checklist, and known gotchas.

**Read it before writing any code.** This file only covers NOMA-specific overrides.

---

## Setup checklist

- [ ] `npm install` (first time)
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel env vars to the client's domain (`noelleandmary.com`)
- [ ] Set `NGF_APP_URL` (optional — defaults to `https://app.ngfsystems.com`)
- [ ] In the NGF admin portal, set this client's `site_url` field to match `NEXT_PUBLIC_SITE_URL` exactly
- [ ] Deploy to Vercel
- [ ] Open the client's portal editor — verify every annotated field shows up in the sidebar
- [ ] Move `assets/` folder contents to `public/assets/` (logos, images) — Next.js serves static files from `public/`

---

## Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js App Router | 16.3.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | always |
| Styling | Tailwind CSS | 4.x |
| Deployment | Vercel | — |

No database. No auth. All data comes from the NGF portal — its content API and, since 2026-09-26, its **product catalog** — with hardcoded fallbacks in `lib/site-data.ts`.

---

## What's wired up

| File | Purpose |
|---|---|
| `lib/ngf.ts` | `getNgfContent()` + `getItems()` — fetch published content from the NGF portal. Don't modify. |
| `components/NgfEditBridge.tsx` | Bridge to the portal live editor. Canonical — never hand-edit; run `npm run sync-ngf` (source: `ngf-client-starter`). |
| `app/layout.tsx` | Mounts NgfEditBridge, CartProvider, Header, Footer. Calls `getNgfContent()`. |
| `next.config.ts` | Full security-header baseline in ONE CSP entry (frame-ancestors merged in) with Square's origins allowed + image domain allowlist |
| `components/CartProvider.tsx` | localStorage cart state shared across components |
| `lib/ngf-products.ts` | CANONICAL — the portal's product catalog: `getNgfCatalog()` (live / off / unavailable) and `priceCart()`, which checkout charges from. Don't hand-edit; it is meant to be byte-identical on every NGF site that sells. |
| `lib/catalog.ts` | NOMA's catalog: the portal's list once Products is on, `FALLBACK_PRODUCTS` while it is off; the display mapping and the homepage's Best sellers. |
| `lib/site-data.ts` | Fallbacks: `FALLBACK_PRODUCTS` (in cents, used only while Products is off), bundles, reviews |

## Products — the portal's Products page, not this repo

Since 2026-09-26 NOMA's products, photos and prices are edited on the portal's **Products** page
(NGF app, `docs/products.md`), and this site renders that list and charges its prices. Rules:

- **Never hardcode a price.** `/api/checkout` prices from `getCatalog({ fresh: true })` on the
  server; the browser's cart prices are display copies. Anything that cannot be priced exactly is
  refused, never guessed.
- **A product id is permanent** (`sheri-necklace`): cart lines are keyed by it (`<id>` or
  `<id>-<option label>`). Rename products freely; never change an id.
- `FALLBACK_PRODUCTS` is used only while Products is **off** for NOMA. Once it is on, the portal's
  list is the only one, and an empty list is an empty shop. If the portal is unreachable, the
  fallback is shown but checkout refuses to take money.
- `docs/ngf-products-import.json` is the fallback list as the portal's **Import** takes it — for
  switching Products on (runbook in the NGF app's `docs/products.md`).
- The website editor no longer edits products: the `products.items` and `bestSellers.items`
  overlays are gone (they let a shown price differ from the charged one).
- **Sales** (2026-09-30): a product or option can carry an original price in the portal
  (`compareAtCents`), shown crossed out beside the price on the cards and in the product popup
  (per option). Display only — checkout never reads it. A range-priced card (several options)
  shows the Sale tag instead of a crossed-out range. The tag also shows when the badge is "Sale"
  or "On sale" in any capitalisation (`lib/sale.ts`).
- **Shipping** is priced by the portal's Store settings through the canonical `lib/ngf-store.ts`
  (synced from `ngf-client-starter`; never hand-edit): free shipping over an amount, then price
  bands ("orders under $X ship for $Y"), then the flat charge.

---

## Adding editable content

1. Add a hardcoded fallback in the server component: `const headline = content['hero.headline'] || 'Default'`
2. Add all four `data-ngf-*` attributes to the rendered element
3. Deploy — the editor sidebar auto-discovers the field

**Always use `||`, never `??` for fallbacks.** Published content can be an empty string; `??` won't catch that.

---

## Static assets

The `assets/` folder (logos, images) from the original HTML mockup needs to be moved to `public/assets/` for Next.js to serve them. The image tags in the app reference `/assets/logos/...` paths.

To do this locally:
```bash
# From the repo root:
cp -r assets public/assets
```

---

## Key editable content map (data-ngf fields)

| Field key | Where | Type |
|---|---|---|
| `brand.announcementText` | Header banner | text |
| `brand.footerTagline` | Footer | text |
| `hero.eyebrow` | Homepage hero | text |
| `hero.headline` | Homepage hero | text |
| `hero.lede` | Homepage hero | textarea |
| `hero.image` | Homepage hero | image |
| `hero.engravingTagline/Title/Body` | Homepage hero callout | text/textarea |
| `hero.contactEmail` | Contact CTA href | text |
| `reviews.eyebrow/headline` | Homepage reviews | text |
| `reviews.items.N.*` | Homepage reviews | group |
| `bundles.eyebrow/headline` | Homepage + products | text |
| `bundles.items.N.*` | Homepage + products bundles | group |
| `founder.eyebrow/headline/body/signature/image` | Homepage founder section | text/image |
| `products.eyebrow/lede` | Products page | text |
| `engraving.eyebrow/headline/lede` | Products engraving section | text/textarea |

---

## Interactive client components

| Component | Behavior |
|---|---|
| `components/CartProvider.tsx` | localStorage cart context (addItem, updateQty) |
| `components/layout/Header.tsx` | Mobile nav toggle, cart count badge |
| `components/home/BestSellersGrid.tsx` | Product modal + add to cart |
| `components/products/ProductGrid.tsx` | Filter/sort, product modal, add to cart |
| `components/products/EngravingPreview.tsx` | Live text + font preview on tag image |
| `components/cart/CartPageClient.tsx` | Full cart display with qty controls |

---

## Known Gaps / Integration Checklist

| Area | Status | Notes |
|---|---|---|
| Static assets | ✅ Moved | `public/assets/` holds logos + product photos (30 files). |
| Checkout | ✅ Built + sandbox-tested | Square Web Payments SDK at `/checkout`; `/api/checkout` re-prices server-side from the product catalog (see Products above), creates a Square order, charges, then reports to the portal. A real sandbox order reached NOMA's portal. Production Square keys are set since 2026-11-03 (see the Vercel env vars row); no real order has been taken yet. |
| `NEXT_PUBLIC_SITE_URL` | ✅ Local / ⚠️ unset in Vercel but working by luck | `noelleandmary.com` in `.env.local`. NOT set in Vercel, yet production content resolves anyway: the `lib/ngf.ts` fallback chain reaches `VERCEL_PROJECT_PRODUCTION_URL`, which on this project happens to be the custom domain and so matches `site_url`. Verified live — production renders the published "Ayana Necklace", not the "Alaina" fallback. Set it explicitly regardless: a Vercel domain change would silently break content with no error. |
| NGF admin `site_url` | ✅ `noelleandmary.com` | Both apex and `www` resolve to client `cmrkupuik0001…` with 19 published keys. `noma-mockup.vercel.app` resolves to nothing — anything still pointing there is silently broken. |
| Store settings (shipping/tax) | ❌ Not configured | Nothing set in the portal's Store tab, so `quote()` falls back to zeroes — every order ships free and untaxed. Set before launch. |
| Vercel env vars | ✅ Square production keys set (2026-11-03) — token and orders secret unverified | Nick set the production application id, location id (`LFSNSZRPCYXKQ`), access token, `SQUARE_ENVIRONMENT` / `NEXT_PUBLIC_SQUARE_ENVIRONMENT=production` and `NGF_ORDERS_SECRET`, then redeployed. Verified from outside on the live site's JavaScript: the production app id and location id are in the bundle and only `web.squarecdn.com` (not sandbox) loads. NOT verified: that the access token belongs to that location, and that the portal accepts the orders secret. Run `npm run verify-orders -- --dry` (read-only) with the production values before the first real order. `NEXT_PUBLIC_*` values are baked in at build, so changing one needs a redeploy; untick "Use project's Ignore Build Step" on a redeploy of a docs-only commit or it is cancelled. |
| Test orders | ⚠️ Present | Sandbox test orders sit in NOMA's portal looking like real sales — delete via the admin orders route before handover. Counts have differed between the portal view and a direct DB query, so check the portal itself rather than trusting a remembered number. |
| Engraving text | ✅ Input added (PR #11, 2026-11-03); length limit is a placeholder | The product popup asks what to engrave: required while an "Engraved" option is chosen, optional extra on a personalizable product with no such option, hidden otherwise. It also takes the font (the same three the Engraving section previews) and has "See how it looks", which shows the text on the tag image. The order records it as `MARY (Cormorant Italic)` — capitals, because the preview always shows capitals. Cart lines are keyed by product + text (`lineKey`), so two different engravings or fonts stay separate lines. The server side (`priceCart`, Square line note, order report) already carried it. `ENGRAVING_MAX_CHARS` in `EngravingPreview.tsx` is 10 (the Engraving section always promised 10) until NOMA says what each piece fits. The preview is the rectangular tag photo, while e.g. Alaina's pendant is a round disc. Checked in Chromium at desktop and phone width. |
| Cart editing | ✅ Built (2026-11-12), Chromium only | On the cart page, tapping a line's photo, title or its Edit link reopens the product popup on that line (`mode="edit"` in `ProductModal`): option, engraving text and font are pre-filled (`parseEngraving` reads `MARY (Cormorant Italic)` back), and "Update item" replaces the line keeping its quantity (`replaceItem`); if the edit makes it match another line the two merge. The cart page now fetches the catalog (`app/cart/page.tsx`) because a line only remembers title, price and photo. A line whose product is no longer in the catalog has no Edit link. Each line (and the edit popup) also has a **View product** link to `/products?product=<id>`, which opens that product's popup on the shop page (`openProductId` in `ProductGrid`; there are no separate product pages). Prices in the popup are the catalog's current ones. Tested at 414px in Chromium; not on a phone. |
| Promo codes | ❌ Not built; researched 2026-11-12 | Checkout has no code field and sends Square no discount. Findings (a research pass over Square's docs and developer forums; nothing tested against NOMA's account): (1) Square has *Marketing coupons* (Customers > Marketing > Coupons: typed codes, in person and online) and *Discounts* (Items & services > Discounts: manual or automatic, no typed code). (2) The Orders API has no code field: `CatalogDiscount`, `CatalogPricingRule`, `Order` and `OrderLineItemDiscount` carry none, so a typed Marketing coupon cannot be redeemed by our checkout through documented calls. (3) A *Discount Codes API* (`/v2/discount-codes`, redemptions that stay PENDING until the order is paid) exists but only in a restricted alpha behind a request and an NDA, per forum posts and no official reference; restaurants with our exact setup were still waiting for access on 2026-11-09. (4) Square's hosted checkout (Checkout API payment links) can show an "Add coupon" field (`enable_coupon`), but that sends shoppers to Square, not our checkout. (5) Pattern A (look up a catalog discount whose name equals the code, apply it by `catalog_object_id`) only works if Mary made an Items > Discounts discount, not a Marketing coupon; Square's docs do not say whether the amount is computed from the catalog entry or whether dates, minimums and limits are enforced. Realistic build: **pattern B** — codes held in the NGF portal (code, percent or amount, on/off, expiry, use limit, minimum), validated on our server in the same call that creates the order, sent to Square as a manual `FIXED_PERCENTAGE` / `FIXED_AMOUNT` order discount named like `Code: SPRING10`, then charge the `total_money` Square returns (never reprice afterwards: PAYMENT_AMOUNT_MISMATCH). Touches the NGF app, `ngf-client-starter`'s shared `quote()` and this site. Costs: Mary's Marketing coupon stats will not include these orders, and expiry and limits are ours to build. A sale price (original price on the Products page) covers a sale open to everyone today. To see what Mary created, a read-only `GET https://connect.squareup.com/v2/catalog/list?types=DISCOUNT,PRICING_RULE` with the production token (header `Square-Version: 2025-01-23`); a `POST /v2/discount-codes/search` that answers 404 means no Discount Codes API access. Ask Mary: one-off sale for everyone, or per-customer or limited-use codes? What does it give? Created under Marketing > Coupons or Items > Discounts? |
| Contact email | ⚠️ Placeholder | `hero.contactEmail` defaults to `mailto:hello@noma.com` — update via portal. |
| Product reviews | ✅ Hidden until real (2026-09-25) | The four reviews in `lib/site-data.ts` are placeholders. They stay in the HTML so the portal editor can fill them in, but a card shows to visitors only once its quote is a real one (`lib/reviews.ts`), and the section and its header/footer "Reviews" links appear with the first real review. "Real" is decided by the text, not by what is published: the editor publishes the whole list with untouched cards backfilled, so placeholder quotes get published too. Keep the placeholder strings in `REVIEWS` unchanged, or the check stops recognising them. |
| One necklace, two names | ⚠️ Asked NOMA (2026-09-25) | The homepage used to show "Ayana Necklace" (a website-editor override on the best-sellers card) while the shop, cart and checkout said "Alaina Necklace". Since 2026-09-26 the overrides are gone, so the whole site shows the catalog's name: "Alaina" from `FALLBACK_PRODUCTS` until Products is on, then whatever NOMA sets on the portal's Products page — the one place to settle it. Keep the id `alaina-necklace` either way. |
| Next.js | ✅ 16.3.6 (2026-09-25) | Was 16.1.6, inside CVE-2026-44575 (a middleware/proxy bypass). This site has no middleware, so it was not exploitable here, but upstream no longer patches 16.1.x. Storefront walked in Chromium before and after the bump (pages, product modal, add to cart, engraving cap, cart, checkout page, 404): identical. |
