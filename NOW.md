# Now — NOMA Designs

_Last updated 2026-11-16. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6, `main` at `1823a73` (2026-11-15: bundles from the Products page; before that cart editing, View product, Engravable pill/filter, disc preview). The live shop has **no bundles** until Mary adds one, so there is no Bundles tab, section or link. Checkout is on Square **production** keys (token and orders secret not yet proven). Portal Store settings: shipping $5.99 flat, free over $100, **no tax rules** (checked 2026-11-15).

**In flight:** nothing. Promo codes are researched, not built (plan in CLAUDE.md): Mary wants them in the portal, and her answers on what her code gives are the next thing needed.

**Next:** (1) Mary creates her own bundles on the Products page (category Bundles); then look at them live. (2) Run `npm run verify-orders -- --dry` locally with the production values. (3) Michigan tax rule in the NGF admin hub's Store settings. (4) Delete the sandbox test orders. (5) Only then a first small real order. (6) Build promo codes once Mary answers.

**Waiting on Nick:** `NEXT_PUBLIC_SITE_URL` in Vercel; Framework Preset to Next.js; the order-notification email in Store settings.

**Waiting on NOMA:** creating her own bundles on the Products page (nothing for us to enter); tax rate; what her promo code gives (percent, amount or free shipping), minimum spend, expiry or use limit; what each piece's engraving fits (max length, now 10); whether the three fonts are real choices.

**Open PRs:** none.
