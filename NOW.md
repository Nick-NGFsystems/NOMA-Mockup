# Now — NOMA Designs

_Last updated 2026-11-03. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout is on Square **production** keys since 2026-11-03 (checked on the live bundle: production app id and location, no sandbox SDK; the access token and orders secret are not yet proven). Production is currently the build of branch `claude/noma-now-sales-live` (code identical to `main`'s #9). Shop sells from the NGF portal's Products page. Reviews hidden until real. Store settings are **not set**, so tax is $0 and shipping is free on every order.

**In flight:** PR for the engraving text box (product popup, cart, checkout). Not merged or deployed yet; engraving orders have no text until it is.

**Next:** (1) Merge the engraving PR and redeploy. (2) Run `npm run verify-orders -- --dry` locally with the production values. (3) In the NGF admin hub's Store settings: tax rule (Michigan) and shipping, with NOMA's numbers. (4) Delete the sandbox test orders from the portal. (5) Only then a first small real order.

**Waiting on Nick:** `NEXT_PUBLIC_SITE_URL` in Vercel; Framework Preset to Next.js; the order-notification email in Store settings.

**Waiting on NOMA:** tax rate, shipping prices, free-shipping threshold; what each piece's engraving fits (max length, now 50); what the Square promo code does and whether it is needed for launch (promo codes are unbuilt, see CLAUDE.md).

**Open PRs:** the engraving one.
