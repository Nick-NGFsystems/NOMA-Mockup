# Now — NOMA Designs

_Last updated 2026-09-28. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox** (rechecked 2026-09-28: the shipped code loads only the sandbox SDK, with a sandbox app id). Reviews stay hidden until NOMA adds real ones. The shop sells from the NGF portal's **Products** page (switched on and imported 2026-09-28), so the site shows and charges exactly that list, and a save there reaches the site at once (instant refresh verified 2026-09-28: saves answer `GET /api/revalidate 200`).

**Next:** One sandbox checkout with Square's test card (4111 1111 1111 1111, any future date, CVV 111): set the order email in Store settings to your own address first — a PAID order emails the owner — then put NOMA's back and delete the test order. Then NOMA manages products, prices and the Ayana/Alaina name themselves.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet. Prices, bundles and the necklace's name are now theirs to set on the Products page.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist, set `NEXT_PUBLIC_SITE_URL`, and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** none.
