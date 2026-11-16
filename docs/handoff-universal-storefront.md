# Handoff: make NOMA's storefront work universal for every NGF client site

_Written 2026-11-16 from the NOMA-Mockup chat. Paste this into a new chat that has the three repos attached: `NOMA-Mockup` (the reference client site), `NGF-Systems-app` (the portal) and `ngf-client-starter` (the canonical files and standards that every client site syncs from). Read the CLAUDE.md of each first; they override anything here._

## What exists today
- **Data flow.** Portal **Products page** → `GET /api/public/products?domain=<domain>` → the client site's `lib/ngf-products.ts` (`getNgfCatalog()`, `priceCart()`) → the site's `/api/checkout` prices the cart **on the server** (never from the browser) → Square (`lib/square-checkout.ts`, a per-site adapter) → the order is reported back with `lib/ngf-order.ts`. Shipping and tax come from the portal's Store settings through `lib/ngf-store.ts` `quote()`, which must agree exactly with `quoteOrder` in the NGF app's `lib/store-settings.ts`. Contract: NGF app `docs/products.md`, "The storefront contract".
- **Bundles (built on NOMA, live 2026-11-15).** A bundle is an ordinary product whose **category is "Bundles"** (or "Bundle", any capitalisation). The client creates and edits it on the Products page like any product (price, original price, photos, description of what is in it, options). The site only sorts them: `isBundle` / `splitBundles` in `lib/catalog.ts`, `components/products/BundleGrid.tsx`, a Bundles section and tab, and Header/Footer "Bundles" links that exist **only while a bundle exists** (`showBundles` from `app/layout.tsx`). Cart, checkout and Square price a bundle like any piece. No NGF app change was needed. The client (Mary at NOMA) creates her own bundles.

## The gap this chat should close (the reason for the handoff)
1. **`lib/ngf-products.ts` is called canonical but is not in `sync-ngf`'s MANIFEST** (`scripts/sync-ngf.mjs`), and NOMA is the only site with it ("the first copy is in NOMA-Mockup"). Promote it into `ngf-client-starter` as a `canonical` file, add it to the manifest, and have `sync-ngf --check` cover it. A second store site must not copy it by hand.
2. **Share the bundle convention, not the page layout.** Put the category rule (`isBundle`, `splitBundles`) in a small canonical helper (or inside `ngf-products.ts`) so every site agrees on what "Bundles" means. Keep the presentation (`BundleGrid`, section, tab, nav links) as a `once` template that each site adapts, because layouts differ per client.
3. **Document it.** Add a short "Bundles" convention to `NGF-STANDARDS.md` (what the category means, "no bundle, no section or links", the client creates them) and to the NGF app's `docs/products.md`. Optionally have the Products page suggest "Bundles" as a category.
4. **Not needed yet:** a first-class `bundle` flag or structured "contents" list on Product. Only add it (it needs a migration) if a client needs the contents shown as data, and ask Nick first.
5. **Same pattern, later:** the per-product engraving shape (`lib/engraving-shapes.ts` on NOMA, a code map by product id) belongs in a portal field eventually, and promo codes are planned (portal table, a validate lookup, a discount in the shared `quote()`; see NOMA `CLAUDE.md`, "Promo codes"). Do not start either without Nick.

## Rules to respect
- Never hardcode a price. A product id is permanent (cart lines are keyed by it). Checkout fails closed on anything it cannot price exactly.
- Any change to how an order is priced goes into the NGF app's `quoteOrder` **and** the starter's `lib/ngf-store.ts` together, then `npm run sync-ngf` into every store site.
- The NGF app stays on Next 15.5 / React 18 / Prisma 5 (never `npm run build` locally: use `npm run verify`); client sites are on Next 16. Never hand-edit a synced file. No new libraries without asking.
- Nick works in short sessions: update each repo's `NOW.md` in the same commit, use branches and PRs, and do not push, merge or deploy without his go-ahead.

## How to test without touching real data
Run the client site with `NGF_APP_URL=http://localhost:4000` against a small stand-in server that returns the real `/api/public/products` list (optionally plus a test bundle), `/api/public/content` and `/api/public/store-settings`. NOMA's PR #16 was tested this way with and without bundles. Do not place orders or trigger real emails.

## Questions to put to Nick before building
Which repo first (the starter)? Should the bundle helper live in `ngf-products.ts` or a new file? Does the Products page need a category suggestion, or is the doc enough?
