# Now — NOMA Designs

_Last updated 2026-11-06. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout is on Square **production** keys since 2026-11-03 (checked on the live bundle: production app id and location, no sandbox SDK; the access token and orders secret are not yet proven). Production is `main` at the engraving merge (#11, deployed 2026-11-03; the new popup and the production Square app id are in the live bundle). Shop sells from the NGF portal's Products page. Reviews hidden until real. Store settings are **not set**, so tax is $0 and shipping is free on every order.

**Just shipped:** engraving text box with font choice and "See how it looks" in the product popup (#11). Checked on the live bundle; not yet tried by Nick on a phone, and no engraved order has gone through Square and the portal.

**Next:** (1) Try the popup on a phone (Paris Bracelet, Engraved). (2) Run `npm run verify-orders -- --dry` locally with the production values. (3) In the NGF admin hub's Store settings: tax rule (Michigan) and shipping, with NOMA's numbers. (4) Delete the sandbox test orders from the portal. (5) Only then a first small real order.

**Waiting on Nick:** `NEXT_PUBLIC_SITE_URL` in Vercel; Framework Preset to Next.js; the order-notification email in Store settings.

**Waiting on NOMA:** tax rate, shipping prices, free-shipping threshold; what each piece's engraving fits (max length, now 10) and whether the three fonts are real choices; what the Square promo code does and whether it is needed for launch (promo codes are unbuilt, and Square's API very likely can't redeem a typed code, so the build would be codes in the NGF portal; see CLAUDE.md).

**Open PRs:** none.
