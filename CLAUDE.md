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

No database. No auth. Pure content site — all data comes from the NGF portal content API and hardcoded fallbacks in `lib/site-data.ts`.

---

## What's wired up

| File | Purpose |
|---|---|
| `lib/ngf.ts` | `getNgfContent()` + `getItems()` — fetch published content from the NGF portal. Don't modify. |
| `components/NgfEditBridge.tsx` | Bridge to the portal live editor. Canonical — never hand-edit; run `npm run sync-ngf` (source: `ngf-client-starter`). |
| `app/layout.tsx` | Mounts NgfEditBridge, CartProvider, Header, Footer. Calls `getNgfContent()`. |
| `next.config.ts` | Full security-header baseline in ONE CSP entry (frame-ancestors merged in) with Square's origins allowed + image domain allowlist |
| `components/CartProvider.tsx` | localStorage cart state shared across components |
| `lib/site-data.ts` | Hardcoded fallback data for products, bundles, reviews |

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
| `bestSellers.items.N.*` | Homepage best sellers | group |
| `reviews.eyebrow/headline` | Homepage reviews | text |
| `reviews.items.N.*` | Homepage reviews | group |
| `bundles.eyebrow/headline` | Homepage + products | text |
| `bundles.items.N.*` | Homepage + products bundles | group |
| `founder.eyebrow/headline/body/signature/image` | Homepage founder section | text/image |
| `products.eyebrow/lede` | Products page | text |
| `products.items.N.*` | Products page grid | group |
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
| Checkout | ✅ Built + sandbox-tested | Square Web Payments SDK at `/checkout`; `/api/checkout` re-prices server-side, creates a Square order, charges, then reports to the portal. A real sandbox order reached NOMA's portal. Needs production Square keys to take real money. |
| `NEXT_PUBLIC_SITE_URL` | ✅ Local / ⚠️ unset in Vercel but working by luck | `noelleandmary.com` in `.env.local`. NOT set in Vercel, yet production content resolves anyway: the `lib/ngf.ts` fallback chain reaches `VERCEL_PROJECT_PRODUCTION_URL`, which on this project happens to be the custom domain and so matches `site_url`. Verified live — production renders the published "Ayana Necklace", not the "Alaina" fallback. Set it explicitly regardless: a Vercel domain change would silently break content with no error. |
| NGF admin `site_url` | ✅ `noelleandmary.com` | Both apex and `www` resolve to client `cmrkupuik0001…` with 19 published keys. `noma-mockup.vercel.app` resolves to nothing — anything still pointing there is silently broken. |
| Store settings (shipping/tax) | ❌ Not configured | Nothing set in the portal's Store tab, so `quote()` falls back to zeroes — every order ships free and untaxed. Set before launch. |
| Vercel env vars | ⚠️ **Sandbox Square keys in production** (checked 2026-09-25) | The live `/checkout` renders the full form and loads `sandbox.web.squarecdn.com`: the production build carries a Square **sandbox** application id (no `sq0idp-` production id), and `NEXT_PUBLIC_SQUARE_ENVIRONMENT` is not `production`, so `CheckoutClient` picks the sandbox SDK. A real customer reaching checkout meets a payment form that cannot take a real card. Before launch: the production application id, location id and access token, `NEXT_PUBLIC_SQUARE_ENVIRONMENT=production`, and `NGF_ORDERS_SECRET` (order reporting fails without it), then a redeploy, since `NEXT_PUBLIC_*` values are baked in at build. Until then, removing the two `NEXT_PUBLIC_SQUARE_*` ids from the Production environment and redeploying shows "Online checkout isn't available yet" instead (`CheckoutClient` falls back to it when either id is missing). Earlier in September the vars were absent entirely. |
| Test orders | ⚠️ Present | Sandbox test orders sit in NOMA's portal looking like real sales — delete via the admin orders route before handover. Counts have differed between the portal view and a direct DB query, so check the portal itself rather than trusting a remembered number. |
| Contact email | ⚠️ Placeholder | `hero.contactEmail` defaults to `mailto:hello@noma.com` — update via portal. |
| Product reviews | ✅ Hidden until real (2026-09-25) | The four reviews in `lib/site-data.ts` are placeholders. They stay in the HTML so the portal editor can fill them in, but a card shows to visitors only once its quote is a real one (`lib/reviews.ts`), and the section and its header/footer "Reviews" links appear with the first real review. "Real" is decided by the text, not by what is published: the editor publishes the whole list with untouched cards backfilled, so placeholder quotes get published too. Keep the placeholder strings in `REVIEWS` unchanged, or the check stops recognising them. |
| One necklace, two names | ⚠️ Asked NOMA (2026-09-25) | The portal publishes `bestSellers.items.2.name` = "Ayana Necklace", which the home page best-sellers show; the catalog in `lib/site-data.ts` (shop page, product modal, cart, checkout, server-side pricing) says "Alaina Necklace", and so do its photo paths. Both names are live on the site at once. Fix whichever is wrong once NOMA answers. Change only the display `name`: the checkout's server-side pricing matches cart items by the product `id` (`alaina-necklace`), so leave the id alone. |
| Next.js | ✅ 16.3.6 (2026-09-25) | Was 16.1.6, inside CVE-2026-44575 (a middleware/proxy bypass). This site has no middleware, so it was not exploitable here, but upstream no longer patches 16.1.x. Storefront walked in Chromium before and after the bump (pages, product modal, add to cart, engraving cap, cart, checkout page, 404): identical. |
