# Now — NOMA Designs

_Last updated 2026-09-27. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox**. Reviews stay hidden until NOMA adds real ones. The shop can now sell from the NGF portal's **Products** page (merged 2026-09-27, PR #6): once Products is switched on for NOMA, the site shows and charges exactly that list. Until then it sells its compiled list, unchanged.

**Next:** Nick, in the NGF hub: switch Products on for NOMA, then straight away Import `docs/ngf-products-import.json` (runbook: NGF app `docs/products.md`). Set the order email in Store settings to your own address before any sandbox checkout — a PAID order emails the owner. Then NOMA manages products, prices and the Ayana/Alaina name themselves.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet. Prices, bundles and the necklace's name are now theirs to set on the Products page.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist, set `NEXT_PUBLIC_SITE_URL`, and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** none.
