# Now — NOMA Designs

_Last updated 2026-11-15. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6, `main` at `5ccbd30` (2026-11-12: cart editing, View product, Engravable pill/filter, disc preview). Checkout is on Square **production** keys since 2026-11-03 (token and orders secret not yet proven). Shop sells from the NGF portal's Products page. Reviews hidden until real. Portal Store settings: shipping $5.99 flat, free over $100, **no tax rules** (checked 2026-11-15).

**In flight:** PR for bundles: a bundle is a product with category "Bundles" on the portal's Products page; the site shows a Bundles section/tab/links only while one exists (so the old unbuyable placeholders vanish when this deploys). Not deployed. Mary wants bundles kept and promo codes built into the portal (promo plan in CLAUDE.md; waiting on her answers).

**Next:** (1) Merge the bundles PR. (2) Mary adds her bundles on the Products page (category Bundles). (3) Run `npm run verify-orders -- --dry` locally with the production values. (4) Michigan tax rule in the NGF admin hub's Store settings. (5) Delete the sandbox test orders. (6) Only then a first small real order.

**Waiting on Nick:** `NEXT_PUBLIC_SITE_URL` in Vercel; Framework Preset to Next.js; the order-notification email in Store settings.

**Waiting on NOMA:** her bundles (pieces, prices, regular prices; is there a Mary bracelet?); tax rate; what her promo code gives (percent, amount or free shipping), minimum spend, expiry or use limit; what each piece's engraving fits (max length, now 10); whether the three fonts are real choices.

**Open PRs:** the bundles one (draft).
