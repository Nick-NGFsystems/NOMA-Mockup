# Now — NOMA Designs

_Last updated 2026-09-28. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox** (rechecked 2026-09-28: the shipped code loads only the sandbox SDK, with a sandbox app id). Reviews stay hidden until NOMA adds real ones. The shop sells from the NGF portal's **Products** page: switched on and imported 2026-09-28, so the site shows and charges exactly that list. Nick set the hub's instant-publish secret in Vercel on 2026-09-28; his Redeploy cancelled itself under the old deploy rule, which this repo's copy of `scripts/vercel-skip-docs.sh` now fixes (the app's canonical version).

**Next:** Save a product in the hub and confirm the site shows it at once (NOMA's logs: `GET /api/revalidate 200`). Then one sandbox checkout with Square's test card, with the order email in Store settings set to your own address first — a PAID order emails the owner. Then NOMA manages products, prices and the Ayana/Alaina name themselves.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet. Prices, bundles and the necklace's name are now theirs to set on the Products page.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist, set `NEXT_PUBLIC_SITE_URL`, and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** none.
