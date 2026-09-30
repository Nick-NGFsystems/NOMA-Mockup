# Now — NOMA Designs

_Last updated 2026-09-30. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox** (rechecked 2026-09-28: the shipped code loads only the sandbox SDK, with a sandbox app id). Reviews stay hidden until NOMA adds real ones. The shop sells from the NGF portal's **Products** page (on since 2026-09-28; saves reach the site at once). **Sale prices and shipping bands** are built on branch `claude/sale-prices-shipping-bands`, not merged: an original price shown crossed out (display only), a Sale tag that ignores capitalisation, and the synced `lib/ngf-store.ts` that charges shipping bands. Verified locally against a local NGF app.

**Next:** Merge after `ngf-client-starter`'s shipping-bands PR and before the NGF app's (order in the NGF app's NOW.md). Then one sandbox checkout with Square's test card (4111 1111 1111 1111, any future date, CVV 111): set the order email in Store settings to your own address first — a PAID order emails the owner — then put NOMA's back and delete the test order.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet. Prices, bundles and the necklace's name are now theirs to set on the Products page.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist, set `NEXT_PUBLIC_SITE_URL`, and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** sale prices + shipping bands (draft).
