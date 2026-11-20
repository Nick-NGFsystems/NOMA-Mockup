# Now — NOMA Designs

_Last updated 2026-11-20. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6, `main` at `1823a73` (2026-11-15: bundles from the Products page; before that cart editing, View product, Engravable pill/filter, disc preview). The live shop has **no bundles** until Mary adds one, so there is no Bundles tab, section or link. The portal side shipped 2026-11-17 (NGF app #48, #49: Bundles tab, New bundle button, "On your website" preview in the product editor); not yet used on the real portal. Checkout is on Square **production** keys (token and orders secret not yet proven). Portal Store settings: shipping $5.99 flat, free over $100, **no tax rules** (checked 2026-11-15).

**In flight:** bundles made of pieces, with engraving per piece and extra items (branch `claude/structured-bundles` here and in NGF-Systems-app, open PRs, not merged; CLAUDE.md → "Bundles made of pieces"; standards pass 2026-11-20: popup engraving fields shared and Tailwind-only). Merge the NGF app one first. Until then, Mary should not tick "Customers can personalize it" on a bundle. **Promo codes:** researched, not built (plan in CLAUDE.md). Mary agreed 2026-11-16 to codes held in the portal rather than her Square coupon (Square's Orders API cannot redeem a typed Marketing coupon). Nothing is built until she says what her code gives; it touches the NGF app, the shared `quote()` and every storefront, and the money path, so it gets its own session on Opus.

**Next:** (1) Test one bundle on the real portal (NOMA's Products card in the admin hub: save hidden, then visible for a minute, check the site, delete; do not add it to the cart); then Mary makes hers. (2) Run `npm run verify-orders -- --dry` locally with the production values. (3) Michigan tax rule in the NGF admin hub's Store settings. (4) Delete the sandbox test orders. (5) Only then a first small real order. (6) Build portal-held promo codes once Mary answers.

**Waiting on Nick:** `NEXT_PUBLIC_SITE_URL` in Vercel; Framework Preset to Next.js; the order-notification email in Store settings.

**Waiting on NOMA:** creating her own bundles on the Products page (nothing for us to enter); tax rate; what her promo code gives (percent, amount or free shipping), minimum spend, expiry or use limit; what each piece's engraving fits (max length, now 10); whether the three fonts are real choices.

**Open PRs:** #18 (`claude/structured-bundles`, bundles made of pieces) — waits on Nick's merge, after NGF-Systems-app #55.
