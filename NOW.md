# Now — NOMA Designs

_Last updated 2026-09-25. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox**: a customer can reach the payment form, but a real card can't be charged. Reviews stay hidden until NOMA adds real ones in the portal.

**Next:** Apply NOMA's answers to the questions document from 2026-09-25: prices, engraving (free or $5, character limit), bundle contents, the Ayana/Alaina name, shipping under $100, Michigan sales tax, return and shipping policy, contact email, business name and address.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist (checkout then says "not available yet"), set `NEXT_PUBLIC_SITE_URL`, and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** none.
