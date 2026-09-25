# Now — NOMA Designs

_Last updated 2026-09-25. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox**: a customer can reach the payment form, but a real card can't be charged. Reviews stay hidden until NOMA adds real ones in the portal. New, not merged: the shop reads NOMA's products and prices from the portal's Products page, so NOMA adds products and sets prices themselves (branch `claude/portal-products`).

**Next:** Merge NGF-Systems-app PR #25 (the Products page) and let it deploy, then merge this repo's products PR. Then enter the six products on NOMA's client hub → Products card (or leave it to NOMA). Until then the site sells its built-in list, unchanged.

**Still from the questions document (2026-09-25):** engraving (free or $5, character limit), bundle contents, shipping under $100, Michigan sales tax, return and shipping policy, contact email, business name and address. Prices and the Ayana/Alaina name are now NOMA's to set on the Products page.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist (checkout then says "not available yet"), set `NEXT_PUBLIC_SITE_URL` (store settings are not read without it), and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** products (draft).
