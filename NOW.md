# Now — NOMA Designs

_Last updated 2026-11-12. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout is on Square **production** keys since 2026-11-03 (checked on the live bundle; the access token and orders secret are not yet proven). Production is `main` at `06fa13d` (#12/#13, live 2026-11-12: the popup fitting the phone keyboard is confirmed in the live code; whether it fixes Nick's iPhone is unconfirmed). Shop sells from the NGF portal's Products page. Reviews hidden until real. Store settings are **not set**, so tax is $0 and shipping is free on every order.

**In flight:** PR for cart editing: tapping a cart line reopens the product popup to change its option, engraving or font, and a View product link goes to that product's popup on the shop page (built and tested in Chromium; not deployed, not tried on a phone). PR on top of it: an Engravable pill on engravable products, the preview drawn on the right shape (round disc for Alaina, bar for Paris), and Engravable as its own filter toggle that narrows the rest. Promo codes were researched (see CLAUDE.md): a typed Square coupon very likely can't be redeemed by our checkout; the realistic build is codes held in the NGF portal.

**Next:** (1) Merge the cart-editing PR, then on a phone retry the popup (keyboard, preview tag, fonts) and the cart Edit. (2) Run `npm run verify-orders -- --dry` locally with the production values. (3) In the NGF admin hub's Store settings: tax rule (Michigan) and shipping, with NOMA's numbers. (4) Delete the sandbox test orders from the portal. (5) Only then a first small real order.

**Waiting on Nick:** `NEXT_PUBLIC_SITE_URL` in Vercel; Framework Preset to Next.js; the order-notification email in Store settings.

**Waiting on NOMA:** tax rate, shipping prices, free-shipping threshold; what each piece's engraving fits (max length, now 10) and whether the three fonts are real choices; what the Square promo code does and whether it is needed for launch (promo codes are unbuilt, and Square's API very likely can't redeem a typed code, so the build would be codes in the NGF portal; see CLAUDE.md).

**Open PRs:** the cart-editing one (draft), and the engravable-marker/shapes one stacked on it (draft).
