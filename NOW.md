# Now — NOMA Designs

_Last updated 2026-10-01. Overwrite, don't append; git keeps the history._

**Status:** Live at https://www.noelleandmary.com on Next 16.3.6. Checkout runs on Square's **sandbox** (rechecked 2026-09-28: the shipped code loads only the sandbox SDK, with a sandbox app id). Reviews stay hidden until NOMA adds real ones. The shop sells from the NGF portal's **Products** page (on since 2026-09-28; saves reach the site at once). **Sale prices and shipping bands** are live since 2026-10-01 (#9, with NGF-Systems-app #32): an original price set on the portal's Products page shows crossed out with a Sale tag (display only; checkout charges the price), and checkout charges the portal's shipping price bands through the synced `lib/ngf-store.ts`. Neither is set yet, so the shop looks and charges as before (checked live 2026-10-01).

**Next:** One sandbox checkout with Square's test card (4111 1111 1111 1111, any future date, CVV 111), ideally with one original price and one shipping band set in the portal so both are seen live: set the order email in Store settings to your own address first — a PAID order emails the owner — then put NOMA's back and delete the test order.

**Waiting on Nick:**
- Send NOMA the questions document, if it hasn't gone yet. Prices, sale prices, bundles and the necklace's name are now theirs to set on the Products page, and shipping (including price bands) and tax in Store settings.
- Vercel, Production environment: remove `NEXT_PUBLIC_SQUARE_APP_ID` and `NEXT_PUBLIC_SQUARE_LOCATION_ID` until the live keys exist, set `NEXT_PUBLIC_SITE_URL`, and set the Framework Preset to Next.js.
- Delete the sandbox test orders from NOMA's portal before they see it.

**Waiting on NOMA:** answers to the document; a 15-minute call to connect their live Square account.

**Open PRs:** none.
